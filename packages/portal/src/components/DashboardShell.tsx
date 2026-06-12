import React, { useState } from "react";
import { Link } from "react-router-dom";

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
    <div className="min-h-screen bg-aibc-bg text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2 font-mono text-sm">
          <span className="h-2 w-2 rounded-full bg-aibc-green" />
          aibc
        </Link>
        <nav className="flex items-center gap-6 text-sm text-neutral-400">
          <Link to="/">How it works</Link>
          <span>Trust</span>
          <Link to="/dashboard" className="rounded-full border border-neutral-600 px-3 py-1 text-white">
            Dashboard
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-6 flex items-end justify-between">
          <h1 className="font-serif text-5xl">Dashboard</h1>
          {email ? <p className="font-mono text-xs text-neutral-500">{email}</p> : null}
        </div>

        <div className="mb-8 flex gap-8 border-b border-aibc-border">
          {(["earn", "advertise"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onTab(t)}
              className={`pb-3 font-mono text-sm capitalize ${
                tab === t ? "border-b-2 border-aibc-green text-white" : "text-neutral-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {children}
      </main>

      <footer className="border-t border-aibc-border py-6 text-center text-xs text-neutral-500">
        aibc · Privacy · Terms · Refunds · Support
      </footer>
    </div>
  );
}

function TerminalRow({ n, cmd }: { n: number; cmd: string }) {
  const copy = () => navigator.clipboard.writeText(cmd);
  return (
    <div className="flex items-center gap-3 rounded-lg border border-aibc-border bg-black/40 px-4 py-3 font-mono text-sm">
      <span className="text-neutral-600">{n}</span>
      <span className="text-aibc-green">$</span>
      <span className="flex-1">{cmd}</span>
      <button type="button" onClick={copy} className="text-neutral-500 hover:text-white">
        copy
      </button>
    </div>
  );
}

export function SetupPanel() {
  const [surface, setSurface] = useState<"claude" | "codex" | "vscode">("claude");
  const cmds =
    surface === "claude"
      ? ["npm i -g @aibc/cli", "aibc login", "aibc install claude"]
      : surface === "codex"
        ? ["npm i -g @aibc/cli", "aibc login", "aibc install codex"]
        : ["Install aibc extension", "aibc login", "Open Claude Code"];

  return (
    <section className="mb-8 rounded-xl border border-aibc-border bg-aibc-card p-6">
      <h2 className="mb-4 font-serif text-2xl">Get set up</h2>
      <div className="mb-4 flex gap-4 font-mono text-xs">
        {(["claude", "codex", "vscode"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSurface(s)}
            className={surface === s ? "text-aibc-green" : "text-neutral-500"}
          >
            {s === "claude" ? "Claude Code" : s === "codex" ? "Codex" : "VS Code"}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {cmds.map((c, i) => (
          <TerminalRow key={c} n={i + 1} cmd={c} />
        ))}
      </div>
      <p className="mt-4 text-xs text-neutral-500">
        Zero-trace. aibc never reads your code, prompts, or completions.
      </p>
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
        <div key={label} className="rounded-xl border border-aibc-border bg-aibc-card p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">{label}</p>
          <p className="mt-2 font-serif text-3xl text-aibc-gold">${value.toFixed(2)}</p>
          {sub ? <p className="mt-1 text-xs text-neutral-500">{sub}</p> : null}
        </div>
      ))}
    </div>
  );
}
