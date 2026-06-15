import { useEffect, useState } from "react";
import { api } from "../../lib/api";

type SignalProfile = {
  optIn: boolean;
  editor: string | null;
  languages: string[];
  stackTags: string[];
  estimatedUpliftPct: number;
};

const EDITORS = [
  { id: "cursor", label: "Cursor" },
  { id: "vscode", label: "VS Code" },
  { id: "windsurf", label: "Windsurf" },
  { id: "vscodium", label: "VSCodium" },
  { id: "claude-code", label: "Claude Code" },
  { id: "codex", label: "Codex" },
];

const LANGUAGES = [
  "typescript",
  "javascript",
  "python",
  "go",
  "rust",
  "java",
  "csharp",
  "ruby",
  "other",
];

export function EarnMorePanel() {
  const [profile, setProfile] = useState<SignalProfile | null>(null);
  const [stackInput, setStackInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = () =>
    api("/v1/me/signal")
      .then((r) => r.json())
      .then((p: SignalProfile) => {
        setProfile(p);
        setStackInput(p.stackTags.join(", "));
      })
      .catch(() => setErr("Could not load signal settings"));

  useEffect(() => {
    void load();
  }, []);

  const save = async (patch: Partial<SignalProfile & { stackTags: string[] }>) => {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const res = await api("/v1/me/signal", {
        method: "PATCH",
        body: JSON.stringify({
          optIn: patch.optIn ?? profile?.optIn,
          editor: patch.editor !== undefined ? patch.editor : profile?.editor,
          languages: patch.languages ?? profile?.languages,
          stackTags:
            patch.stackTags ??
            stackInput
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
        }),
      });
      const next = (await res.json()) as SignalProfile;
      if (!res.ok) throw new Error((next as unknown as { error?: string }).error || "Save failed");
      setProfile(next);
      setStackInput(next.stackTags.join(", "));
      setMsg(next.optIn ? "Earn more mode on — ~15% higher CPM." : "Earn more mode off.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  if (!profile) {
    return (
      <div className="aibc-card p-6">
        <p className="text-sm text-zinc-500">Loading earn-more settings…</p>
      </div>
    );
  }

  return (
    <div className="aibc-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-brand-heading text-xl text-zinc-900">Earn more</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Opt in to share coarse tags (editor, language, stack). No source code. Off by default.
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void save({ optIn: !profile.optIn })}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            profile.optIn
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          {profile.optIn ? "On — tap to turn off" : "Turn on"}
        </button>
      </div>

      {profile.optIn ? (
        <div className="mt-5 space-y-4">
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">Editor</p>
            <div className="flex flex-wrap gap-2">
              {EDITORS.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  disabled={busy}
                  onClick={() => void save({ editor: e.id })}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    profile.editor === e.id
                      ? "bg-emerald-600 text-white"
                      : "border border-zinc-200 bg-white text-zinc-600"
                  }`}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-zinc-500">Languages</p>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => {
                const active = profile.languages.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void save({
                        languages: active
                          ? profile.languages.filter((l) => l !== lang)
                          : [...profile.languages, lang],
                      })
                    }
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                      active ? "bg-emerald-600 text-white" : "border border-zinc-200 bg-white text-zinc-600"
                    }`}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              Stack tags (optional)
            </label>
            <input
              value={stackInput}
              onChange={(e) => setStackInput(e.target.value)}
              placeholder="react, postgres, aws"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => void save({})}
              className="mt-2 text-sm font-medium text-emerald-700 underline"
            >
              Save tags
            </button>
          </div>

          <p className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            Shared: editor {profile.editor || "auto-detect"}, languages{" "}
            {profile.languages.length ? profile.languages.join(", ") : "auto-detect"}, stack tags above.
            Estimated uplift: +{profile.estimatedUpliftPct}% vs basic mode.
          </p>
        </div>
      ) : (
        <p className="mt-4 text-xs text-zinc-500">
          Basic mode: no extra signal. Turn on to unlock higher CPM while keeping prompts and code private.
        </p>
      )}

      {msg ? <p className="mt-3 text-sm text-emerald-700">{msg}</p> : null}
      {err ? <p className="mt-3 text-sm text-red-600">{err}</p> : null}
    </div>
  );
}
