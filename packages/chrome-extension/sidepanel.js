const statusEl = document.getElementById("status");
const gateEl = document.getElementById("gate");
const frameWrap = document.getElementById("frame-wrap");
const dashboardFrame = document.getElementById("dashboard");
const signInBtn = document.getElementById("sign-in");
const signOutBtn = document.getElementById("sign-out");

const POLL_MS = 1500;
const TIMEOUT_MS = 180000;

function setStatus(text) {
  statusEl.textContent = text || "";
}

function showGate() {
  gateEl.style.display = "flex";
  frameWrap.hidden = true;
  signOutBtn.hidden = true;
}

function showDashboard(url) {
  gateEl.style.display = "none";
  frameWrap.hidden = false;
  signOutBtn.hidden = false;
  dashboardFrame.src = url;
}

async function storageGet(keys) {
  return chrome.storage.local.get(keys);
}

async function storageSet(values) {
  return chrome.storage.local.set(values);
}

async function storageRemove(keys) {
  return chrome.storage.local.remove(keys);
}

async function apiJson(path, options = {}) {
  const res = await fetch(`${AIBC_API_BASE}${path}`, options);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body;
}

async function pollAuth(state) {
  const deadline = Date.now() + TIMEOUT_MS;
  while (Date.now() < deadline) {
    const body = await apiJson(`/v1/auth/extension/poll?state=${encodeURIComponent(state)}`);
    if (body.status === "complete" && body.accessToken) {
      return body;
    }
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
  throw new Error("Sign-in timed out. Try again.");
}

async function dashboardUrl(token) {
  try {
    const body = await apiJson("/v1/auth/handoff", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (body.handoff) {
      return `${AIBC_PORTAL_BASE}/dashboard?handoff=${encodeURIComponent(body.handoff)}`;
    }
  } catch {
    /* fall back */
  }
  return `${AIBC_PORTAL_BASE}/dashboard`;
}

async function applySession(session) {
  await storageSet({
    accessToken: session.accessToken,
    email: session.email || "",
    clientId: session.clientId || "",
  });
  setStatus(session.email ? `Signed in as ${session.email}` : "Signed in");
  showDashboard(await dashboardUrl(session.accessToken));
}

async function signIn() {
  signInBtn.disabled = true;
  setStatus("Starting sign-in…");

  try {
    const start = await apiJson("/v1/auth/extension/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });

    await storageSet({ pendingAuthState: start.state, clientId: start.clientId });
    const connectUrl = `${AIBC_PORTAL_BASE}/extension/connect?state=${encodeURIComponent(start.state)}&source=chrome`;
    chrome.tabs.create({ url: connectUrl });

    setStatus("Finish sign-in in the browser tab…");
    const session = await pollAuth(start.state);
    await storageRemove("pendingAuthState");
    await applySession(session);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Sign-in failed");
    showGate();
  } finally {
    signInBtn.disabled = false;
  }
}

async function signOut() {
  const { accessToken } = await storageGet(["accessToken"]);
  if (accessToken) {
    try {
      await apiJson("/v1/auth/signout", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch {
      /* ignore */
    }
  }
  await storageRemove(["accessToken", "email", "clientId", "pendingAuthState"]);
  setStatus("");
  showGate();
}

async function boot() {
  const { accessToken, email, pendingAuthState } = await storageGet([
    "accessToken",
    "email",
    "pendingAuthState",
  ]);

  if (accessToken) {
    setStatus(email ? `Signed in as ${email}` : "Signed in");
    showDashboard(await dashboardUrl(accessToken));
    return;
  }

  if (pendingAuthState) {
    setStatus("Waiting for browser sign-in…");
    try {
      const session = await pollAuth(pendingAuthState);
      await storageRemove("pendingAuthState");
      await applySession(session);
      return;
    } catch {
      await storageRemove("pendingAuthState");
    }
  }

  showGate();
}

signInBtn.addEventListener("click", () => void signIn());
signOutBtn.addEventListener("click", () => void signOut());
void boot();
