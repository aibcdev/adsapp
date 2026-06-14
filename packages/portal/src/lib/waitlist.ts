const USER_KEY = "aibc_waitlist_user";
const ENTRIES_KEY = "aibc_waitlist_entries";
const ADVERTISER_KEY = "aibc_advertiser_applications";

export type WaitlistUser = {
  name: string;
  email: string;
  refCode: string;
  referredBy?: string;
  position: number;
  referrals: number;
  joinedAt: string;
};

export type AdvertiserApplication = {
  company: string;
  website: string;
  budget: string;
  email: string;
  appliedAt: string;
};

const CAP = 15_000;

function loadEntries(): WaitlistUser[] {
  try {
    return JSON.parse(localStorage.getItem(ENTRIES_KEY) || "[]") as WaitlistUser[];
  } catch {
    return [];
  }
}

function saveEntries(entries: WaitlistUser[]) {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

function refCodeFromEmail(email: string) {
  const base = email.split("@")[0]?.replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase() || "AIBC";
  return `${base}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export function getWaitlistCount() {
  return loadEntries().length;
}

export function getWaitlistUser(): WaitlistUser | null {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null") as WaitlistUser | null;
  } catch {
    return null;
  }
}

export function joinWaitlist(name: string, email: string, referredBy?: string): WaitlistUser {
  const entries = loadEntries();
  const existing = entries.find((e) => e.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    localStorage.setItem(USER_KEY, JSON.stringify(existing));
    return existing;
  }

  const basePosition = Math.min(entries.length + 1, CAP);
  const referralBoost = referredBy
    ? entries.filter((e) => e.referredBy?.toUpperCase() === referredBy.toUpperCase()).length
    : 0;

  const user: WaitlistUser = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    refCode: refCodeFromEmail(email),
    referredBy: referredBy?.toUpperCase(),
    position: Math.max(1, basePosition - referralBoost),
    referrals: 0,
    joinedAt: new Date().toISOString(),
  };

  if (referredBy) {
    const referrer = entries.find((e) => e.refCode === referredBy.toUpperCase());
    if (referrer) {
      referrer.referrals += 1;
      referrer.position = Math.max(1, referrer.position - 1);
    }
  }

  entries.push(user);
  saveEntries(entries);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export function referralLink(refCode: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/waitlist?ref=${encodeURIComponent(refCode)}`;
}

export function submitAdvertiserApplication(data: Omit<AdvertiserApplication, "appliedAt">) {
  const apps: AdvertiserApplication[] = JSON.parse(localStorage.getItem(ADVERTISER_KEY) || "[]");
  apps.push({ ...data, appliedAt: new Date().toISOString() });
  localStorage.setItem(ADVERTISER_KEY, JSON.stringify(apps));
}
