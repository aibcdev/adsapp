import type { Hono } from "hono";
import type { Database as DbType } from "better-sqlite3";
import { randomUUID } from "node:crypto";
import { config } from "../config.js";
import { resolveAuthClientId, findCanonicalClientByEmail } from "../clients/identity.js";
import { ensureClientProfile } from "../clients/profile.js";
import { mintToken } from "../db/schema.js";
import { createEmailToken, consumeEmailToken } from "./emailTokens.js";
import { hashPassword, verifyPassword, validatePassword } from "./password.js";
import {
  magicLinkEmailHtml,
  passwordResetEmailHtml,
  sendEmail,
  welcomeEmailHtml,
} from "../email/send.js";
import {
  applyAuthStateAttribution,
  parseAttributionInput,
  recordClientAttribution,
} from "../clients/attribution.js";

function clientHasPassword(db: DbType, email: string): boolean {
  const row = db
    .prepare("SELECT password_hash FROM clients WHERE lower(email) = ? LIMIT 1")
    .get(email.trim().toLowerCase()) as { password_hash: string | null } | undefined;
  return Boolean(row?.password_hash);
}

function getPasswordHash(db: DbType, email: string): string | null {
  const row = db
    .prepare("SELECT password_hash FROM clients WHERE lower(email) = ? LIMIT 1")
    .get(email.trim().toLowerCase()) as { password_hash: string | null } | undefined;
  return row?.password_hash ?? null;
}

function isNewEmailAccount(db: DbType, email: string): boolean {
  return !findCanonicalClientByEmail(db, email);
}

export function registerEmailAuthRoutes(app: Hono, db: DbType): void {
  app.post("/v1/auth/email/register", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
      attribution?: unknown;
    };
    const email = body.email?.trim().toLowerCase();
    const password = body.password || "";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return c.json({ error: "Valid email required" }, 400);
    }
    const pwErr = validatePassword(password);
    if (pwErr) return c.json({ error: pwErr }, 400);
    if (clientHasPassword(db, email)) {
      return c.json({ error: "Account already exists. Sign in or reset your password." }, 409);
    }

    let clientId = findCanonicalClientByEmail(db, email);
    const isNew = !clientId;
    if (!clientId) {
      clientId = randomUUID();
      db.prepare("INSERT INTO clients (id, email, created_at, password_hash) VALUES (?, ?, ?, ?)").run(
        clientId,
        email,
        Date.now(),
        hashPassword(password),
      );
    } else {
      db.prepare("UPDATE clients SET password_hash = ? WHERE id = ?").run(
        hashPassword(password),
        clientId,
      );
    }
    ensureClientProfile(db, clientId);
    if (isNew) recordClientAttribution(db, clientId, parseAttributionInput(body.attribution));

    const token = mintToken(db, clientId, email);

    if (isNew) {
      const sent = await sendEmail({
        to: email,
        subject: "Welcome to AIBC Media",
        html: welcomeEmailHtml(email),
      });
      if (!sent.ok) console.warn("[email] welcome:", sent.error);
    }

    return c.json({ accessToken: token, email, welcomeEmailSent: isNew });
  });

  app.post("/v1/auth/email/password", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as {
      email?: string;
      password?: string;
    };
    const email = body.email?.trim().toLowerCase();
    const password = body.password || "";
    if (!email || !password) return c.json({ error: "Email and password required" }, 400);

    const hash = getPasswordHash(db, email);
    if (!verifyPassword(password, hash)) {
      return c.json({ error: "Invalid email or password" }, 401);
    }

    const canonical = findCanonicalClientByEmail(db, email);
    if (!canonical) return c.json({ error: "Account not found" }, 404);

    ensureClientProfile(db, canonical);
    const token = mintToken(db, canonical, email);
    return c.json({ accessToken: token, email });
  });

  app.post("/v1/auth/email/magic-link", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as { email?: string };
    const email = body.email?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return c.json({ error: "Valid email required" }, 400);
    }

    const token = createEmailToken(db, email, "magic_link");
    const link = `${config.portalUrl}/login?magic=${encodeURIComponent(token)}`;
    const sent = await sendEmail({
      to: email,
      subject: "Your AIBC Media sign-in link",
      html: magicLinkEmailHtml(link),
    });
    if (!sent.ok) return c.json({ error: sent.error }, 503);

    return c.json({ ok: true, message: "Check your email for a sign-in link." });
  });

  app.post("/v1/auth/email/magic-verify", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as {
      token?: string;
      attribution?: unknown;
    };
    const token = body.token?.trim();
    if (!token) return c.json({ error: "Token required" }, 400);

    const row = consumeEmailToken(db, token, "magic_link");
    if (!row) return c.json({ error: "Link expired or invalid" }, 400);

    const isNew = isNewEmailAccount(db, row.email);
    let clientId = findCanonicalClientByEmail(db, row.email);
    if (!clientId) {
      clientId = randomUUID();
      db.prepare("INSERT INTO clients (id, email, created_at) VALUES (?, ?, ?)").run(
        clientId,
        row.email,
        Date.now(),
      );
    }
    ensureClientProfile(db, clientId);
    if (isNew) recordClientAttribution(db, clientId, parseAttributionInput(body.attribution));

    if (isNew) {
      const sent = await sendEmail({
        to: row.email,
        subject: "Welcome to AIBC Media",
        html: welcomeEmailHtml(row.email),
      });
      if (!sent.ok) console.warn("[email] welcome:", sent.error);
    }

    const accessToken = mintToken(db, clientId, row.email);
    return c.json({ accessToken, email: row.email, welcomeEmailSent: isNew });
  });

  app.post("/v1/auth/password/forgot", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as { email?: string };
    const email = body.email?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return c.json({ error: "Valid email required" }, 400);
    }

    if (!clientHasPassword(db, email)) {
      return c.json({
        ok: true,
        message: "If an account exists, a reset link has been sent.",
      });
    }

    const token = createEmailToken(db, email, "password_reset");
    const link = `${config.portalUrl}/reset-password?token=${encodeURIComponent(token)}`;
    const sent = await sendEmail({
      to: email,
      subject: "Reset your AIBC Media password",
      html: passwordResetEmailHtml(link),
    });
    if (!sent.ok) return c.json({ error: sent.error }, 503);

    return c.json({ ok: true, message: "If an account exists, a reset link has been sent." });
  });

  app.post("/v1/auth/password/reset", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as {
      token?: string;
      password?: string;
    };
    const token = body.token?.trim();
    const password = body.password || "";
    const pwErr = validatePassword(password);
    if (!token) return c.json({ error: "Token required" }, 400);
    if (pwErr) return c.json({ error: pwErr }, 400);

    const row = consumeEmailToken(db, token, "password_reset");
    if (!row) return c.json({ error: "Reset link expired or invalid" }, 400);

    const clientId = findCanonicalClientByEmail(db, row.email);
    if (!clientId) return c.json({ error: "Account not found" }, 404);

    db.prepare("UPDATE clients SET password_hash = ? WHERE id = ?").run(
      hashPassword(password),
      clientId,
    );

    const accessToken = mintToken(db, clientId, row.email);
    return c.json({ accessToken, email: row.email });
  });

  app.post("/v1/auth/email/complete", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as {
      state?: string;
      email?: string;
    };
    const state = body.state?.trim();
    const email = body.email?.trim().toLowerCase();
    if (!state || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return c.json({ error: "Valid state and email required" }, 400);
    }

    const row = db
      .prepare("SELECT client_id, completed FROM auth_states WHERE state = ?")
      .get(state) as { client_id: string; completed: number } | undefined;

    if (!row) return c.json({ error: "Invalid sign-in session" }, 400);
    if (row.completed === 1) return c.json({ error: "Session already used" }, 400);

    const isNew = isNewEmailAccount(db, email);
    const clientId = resolveAuthClientId(db, row.client_id, email);
    ensureClientProfile(db, clientId);
    applyAuthStateAttribution(db, state, clientId);
    const token = mintToken(db, clientId, email);
    db.prepare(
      "UPDATE auth_states SET completed = 1, token = ?, email = ?, client_id = ? WHERE state = ?",
    ).run(token, email, clientId, state);

    if (isNew) {
      const sent = await sendEmail({
        to: email,
        subject: "Welcome to AIBC Media",
        html: welcomeEmailHtml(email),
      });
      if (!sent.ok) console.warn("[email] welcome:", sent.error);
    }

    return c.json({ ok: true, email, welcomeEmailSent: isNew });
  });
}

export function registerInstallRoutes(app: Hono, db: DbType): void {
  app.post("/v1/installs/report", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as {
      channel?: string;
      deviceId?: string;
      source?: string;
    };
    const channel = body.channel?.trim().toLowerCase();
    const deviceId = body.deviceId?.trim();
    const allowed = new Set(["vscode", "cursor", "windsurf", "openvsx", "direct", "cli"]);
    if (!channel || !allowed.has(channel) || !deviceId) {
      return c.json({ error: "channel and deviceId required" }, 400);
    }

    const { recordInstallEvent } = await import("../marketplace/installs.js");
    const created = recordInstallEvent(
      db,
      channel as "vscode" | "cursor" | "windsurf" | "openvsx" | "direct" | "cli",
      deviceId,
      body.source,
    );
    return c.json({ ok: true, recorded: created });
  });
}
