import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AibcLogo } from "./brand/AibcLogo";

const inputDark =
  "mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500/50 focus:outline-none";

export function DashboardShell({
  email,
  children,
  tab,
  onTab,
}: {
  email?: string;
  tab: "earn" | "advertise";
  onTab: (t: "earn" | "advertise") => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-6 py-5 backdrop-blur md:px-12">
        <Link to="/">
          <AibcLogo size="sm" variant="dark" />
        </Link>
        <nav className="flex items-center gap-6 text-sm text-zinc-400">
          <Link to="/" className="transition hover:text-white">Home</Link>
          <Link to="/dashboard" className="rounded-full border border-zinc-700 bg-zinc-900/60 px-3 py-1 text-white">
            Dashboard
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-16 pt-8 md:px-12">
        <div className="mb-6 flex items-end justify-between">
          <h1 className="font-instrument-serif text-4xl text-white md:text-5xl">Dashboard</h1>
          {email ? <p className="font-mono text-xs text-zinc-500">{email}</p> : null}
        </div>

        <div className="mb-8 flex gap-8 border-b border-zinc-800">
          {(["earn", "advertise"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onTab(t)}
              className={`pb-3 font-mono text-sm capitalize ${
                tab === t ? "border-b-2 border-emerald-500 text-white" : "text-zinc-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {children}
      </main>

      <footer className="border-t border-zinc-800 py-6 text-center text-xs text-zinc-500">
        AIBC Media · <Link to="/privacy" className="hover:text-emerald-400">Privacy</Link> ·{" "}
        <Link to="/terms" className="hover:text-emerald-400">Terms</Link>
      </footer>
    </div>
  );
}

function TerminalRow({ n, cmd }: { n: number; cmd: string }) {
  const copy = () => navigator.clipboard.writeText(cmd);
  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 font-mono text-sm">
      <span className="text-zinc-600">{n}</span>
      <span className="text-emerald-500">$</span>
      <span className="flex-1 text-zinc-200">{cmd}</span>
      <button type="button" onClick={copy} className="text-zinc-500 hover:text-white">copy</button>
    </div>
  );
}

export function SetupPanel() {
  const [surface, setSurface] = useState<"claude" | "vscode">("claude");
  const cmds =
    surface === "claude"
      ? ["npm i -g @aibc/cli", "aibc login", "aibc install claude"]
      : ["Install aibc extension from marketplace", "aibc login", "Open Claude Code in VS Code / Cursor"];

  return (
    <section className="mb-8 aibc-card p-6">
      <h2 className="mb-4 font-instrument-serif text-2xl text-white">Get set up</h2>
      <div className="mb-4 flex gap-4 font-mono text-xs">
        {(["claude", "vscode"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSurface(s)}
            className={surface === s ? "text-emerald-400" : "text-zinc-500"}
          >
            {s === "claude" ? "Claude Code" : "VS Code / Cursor"}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {cmds.map((c, i) => (
          <TerminalRow key={c} n={i + 1} cmd={c} />
        ))}
      </div>
      <p className="mt-4 text-xs text-zinc-500">Zero-trace. AIBC Media never reads your code, prompts, or completions.</p>
    </section>
  );
}

export function StatGrid({
  stats,
}: {
  stats: { today: number; month: number; pending: number; payable: number };
}) {
  const items = [
    ["Today", stats.today, ""],
    ["This month", stats.month, ""],
    ["Pending", stats.pending, "in settlement hold"],
    ["Payable", stats.payable, "ready to cash out"],
  ] as const;

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
      {items.map(([label, value, sub]) => (
        <div key={label} className="aibc-card p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{label}</p>
          <p className="mt-2 font-instrument-serif text-3xl text-emerald-400">${value.toFixed(2)}</p>
          {sub ? <p className="mt-1 text-xs text-zinc-500">{sub}</p> : null}
        </div>
      ))}
    </div>
  );
}

export { inputDark };
