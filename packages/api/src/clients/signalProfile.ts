import type { Database as DbType } from "better-sqlite3";

/** Earnings uplift when developer opts in to coarse signals (no source code). */
export const SIGNAL_EARN_BOOST = 1.15;

/** Effective bid boost for ad sorting when signals match. */
export const SIGNAL_AUCTION_BOOST = 1.1;

const ALLOWED_EDITORS = new Set(["cursor", "vscode", "windsurf", "vscodium", "claude-code", "codex"]);
const ALLOWED_LANGUAGES = new Set([
  "typescript",
  "javascript",
  "python",
  "go",
  "rust",
  "java",
  "csharp",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "other",
]);

export type SignalProfile = {
  optIn: boolean;
  editor: string | null;
  languages: string[];
  stackTags: string[];
  estimatedUpliftPct: number;
};

function parseJsonArray(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function ensureSignalColumns(db: DbType) {
  for (const sql of [
    "ALTER TABLE clients ADD COLUMN signal_opt_in INTEGER DEFAULT 0",
    "ALTER TABLE clients ADD COLUMN signal_editor TEXT",
    "ALTER TABLE clients ADD COLUMN signal_languages TEXT",
    "ALTER TABLE clients ADD COLUMN signal_stack_tags TEXT",
  ]) {
    try {
      db.exec(sql);
    } catch {
      /* exists */
    }
  }
}

export function getSignalProfile(db: DbType, clientId: string): SignalProfile {
  ensureSignalColumns(db);
  const row = db
    .prepare(
      `SELECT signal_opt_in, signal_editor, signal_languages, signal_stack_tags
       FROM clients WHERE id = ?`,
    )
    .get(clientId) as
    | {
        signal_opt_in: number;
        signal_editor: string | null;
        signal_languages: string | null;
        signal_stack_tags: string | null;
      }
    | undefined;

  const optIn = Boolean(row?.signal_opt_in);
  return {
    optIn,
    editor: row?.signal_editor ?? null,
    languages: parseJsonArray(row?.signal_languages ?? null),
    stackTags: parseJsonArray(row?.signal_stack_tags ?? null),
    estimatedUpliftPct: optIn ? Math.round((SIGNAL_EARN_BOOST - 1) * 100) : 0,
  };
}

export function updateSignalProfile(
  db: DbType,
  clientId: string,
  patch: {
    optIn?: boolean;
    editor?: string | null;
    languages?: string[];
    stackTags?: string[];
  },
): SignalProfile {
  ensureSignalColumns(db);
  const current = getSignalProfile(db, clientId);

  const optIn = patch.optIn ?? current.optIn;
  let editor = patch.editor !== undefined ? patch.editor : current.editor;
  let languages = patch.languages ?? current.languages;
  let stackTags = patch.stackTags ?? current.stackTags;

  if (!optIn) {
    editor = null;
    languages = [];
    stackTags = [];
  } else {
    if (editor && !ALLOWED_EDITORS.has(editor.toLowerCase())) editor = null;
    languages = languages
      .map((l) => l.toLowerCase().trim())
      .filter((l) => ALLOWED_LANGUAGES.has(l))
      .slice(0, 8);
    stackTags = stackTags
      .map((t) => t.toLowerCase().trim().slice(0, 32))
      .filter(Boolean)
      .slice(0, 12);
  }

  db.prepare(
    `UPDATE clients SET signal_opt_in = ?, signal_editor = ?, signal_languages = ?, signal_stack_tags = ?
     WHERE id = ?`,
  ).run(
    optIn ? 1 : 0,
    editor,
    JSON.stringify(languages),
    JSON.stringify(stackTags),
    clientId,
  );

  return getSignalProfile(db, clientId);
}

export function signalEarnMultiplier(db: DbType, clientId: string): number {
  const profile = getSignalProfile(db, clientId);
  return profile.optIn ? SIGNAL_EARN_BOOST : 1;
}

export function updateObservedSignal(
  db: DbType,
  clientId: string,
  observed: { editor?: string; language?: string },
): void {
  const profile = getSignalProfile(db, clientId);
  if (!profile.optIn) return;

  let editor = profile.editor;
  let languages = [...profile.languages];

  if (observed.editor) {
    const normalized = observed.editor.toLowerCase().trim();
    if (ALLOWED_EDITORS.has(normalized)) editor = normalized;
  }

  if (observed.language) {
    const lang = observed.language.toLowerCase().trim();
    const bucket = ALLOWED_LANGUAGES.has(lang) ? lang : "other";
    if (!languages.includes(bucket)) languages = [...languages, bucket].slice(0, 8);
  }

  if (editor !== profile.editor || languages.join(",") !== profile.languages.join(",")) {
    updateSignalProfile(db, clientId, { optIn: true, editor, languages, stackTags: profile.stackTags });
  }
}

export function effectiveBidForClient(
  baseBid: number,
  profile: SignalProfile,
  _adId: string,
): number {
  if (!profile.optIn) return baseBid;
  return baseBid * SIGNAL_AUCTION_BOOST;
}
