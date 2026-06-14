import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Code, Layers, Monitor, Terminal, Wallet, Zap } from "lucide-react";
import { SponsorLogo, type SponsorBrand } from "./SponsorLogo";

type DemoPhase = "idle" | "coding" | "thinking" | "adShown" | "done";

type DemoSponsor = {
  brand: SponsorBrand;
  name: string;
  text: string;
};

const INITIAL_LINES = [
  'import { createClient } from "@supabase/supabase-js";',
  "",
  "const db = createClient(url, key);",
  "// Ask AI to review auth flow...",
];

const GENERIC_LINES = [
  'import { boot } from "@studio/runtime";',
  "",
  "const ctx = await boot({ env: \"prod\" });",
  "await ctx.dispatch(\"sync\");",
  "// awaiting agent response...",
];

const CODING_LINES = [
  "export async function loginUser(email: string) {",
  "  return db.auth.signInWithOtp({ email });",
  "}",
];

const SPONSORS: DemoSponsor[] = [
  {
    brand: "supabase",
    name: "Supabase",
    text: "The open source Firebase alternative — build in a weekend →",
  },
  {
    brand: "neon",
    name: "Neon",
    text: "Serverless Postgres — scale to zero, instant branches →",
  },
  {
    brand: "clerk",
    name: "Clerk",
    text: "Modern auth & user management in minutes →",
  },
  {
    brand: "sentry",
    name: "Sentry",
    text: "Track errors and performance in real time →",
  },
];

const BASE_WALLET = 1.42;
const EARN_PER_AD = 0.18;

function ThinkingDots() {
  return (
    <span className="inline-flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-1 w-1 rounded-full bg-zinc-400 animate-pulse"
          style={{ animationDelay: `${i * 200}ms` }}
        />
      ))}
    </span>
  );
}

function WindowChrome({ phase }: { phase: DemoPhase }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-4 py-3">
      <div className="flex gap-2">
        <div className="h-3 w-3 rounded-full border border-red-500/30 bg-red-500/20" />
        <div className="h-3 w-3 rounded-full border border-yellow-500/30 bg-yellow-500/20" />
        <div className="h-3 w-3 rounded-full border border-green-500/30 bg-green-500/20" />
      </div>
      <div className="flex items-center gap-1.5 font-mono text-xs text-zinc-500">
        <Terminal className="h-3.5 w-3.5" />
        aibc-demo-workspace.tsx
      </div>
      <div className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-emerald-400">
        {phase === "idle" ? "READY" : "ACTIVE SESSION"}
      </div>
    </div>
  );
}

function WorkspaceSidebar({ activeFile = "aibc-demo.tsx" }: { activeFile?: string }) {
  const files = [
    { name: "aibc-demo.tsx", icon: Code, active: activeFile === "aibc-demo.tsx" },
    { name: "main.css", icon: Monitor, active: activeFile === "main.css" },
    { name: "config.json", icon: Layers, active: activeFile === "config.json" },
  ];

  return (
    <div className="hidden space-y-3 border-r border-zinc-800 bg-zinc-900/50 p-4 font-mono text-xs text-zinc-500 md:col-span-2 md:block">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Workspace</div>
      <div className="mt-2 space-y-2">
        {files.map(({ name, icon: Icon, active }) => (
          <div
            key={name}
            className={`flex cursor-pointer items-center gap-1 ${active ? "text-emerald-400" : "hover:text-zinc-400"}`}
          >
            <Icon className="h-3.5 w-3.5" /> {name}
          </div>
        ))}
      </div>
    </div>
  );
}

function EditorPane({
  lines,
  phase,
  showCursor,
}: {
  lines: string[];
  phase: DemoPhase;
  showCursor?: boolean;
}) {
  return (
    <div className="max-h-[320px] min-h-[280px] overflow-y-auto bg-black/60 p-5 font-mono text-xs text-zinc-300 md:text-sm">
      {lines.map((line, idx) => (
        <div key={`${idx}-${line}`} className="flex gap-4">
          <span className="w-6 shrink-0 select-none text-right text-zinc-600">{idx + 1}</span>
          <pre className="whitespace-pre-wrap text-zinc-300">{line || " "}</pre>
        </div>
      ))}
      {showCursor && phase === "coding" ? (
        <div className="flex items-center gap-4">
          <span className="w-6 shrink-0 select-none text-right text-zinc-600">{lines.length + 1}</span>
          <div className="h-4 w-2 animate-pulse bg-emerald-400" />
        </div>
      ) : null}
    </div>
  );
}

function SponsorStatusBar({
  brandName,
  sponsorText,
  visible,
}: {
  brandName: string;
  sponsorText: string;
  visible: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 border-t border-zinc-800 bg-zinc-900 px-4 py-2.5 font-mono text-xs">
      <span className="shrink-0 rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
        sponsor
      </span>
      <Zap className="h-3.5 w-3.5 shrink-0 text-yellow-400" />
      {visible ? (
        <span className="min-w-0 truncate text-zinc-300">
          <span className="font-semibold text-emerald-400">{brandName || "Brand"}</span>
          <span className="text-zinc-600"> · </span>
          <span className="text-zinc-400">{sponsorText || "Your sponsor line appears here."}</span>
        </span>
      ) : (
        <span className="text-zinc-600">Waiting for spinner slot…</span>
      )}
      <span className="ml-auto shrink-0 text-[10px] text-zinc-600">LN 12, COL 4</span>
    </div>
  );
}

function DemoFooter({
  walletAccrued,
  phase,
  isRunning,
  onSimulate,
  onReset,
  simulateLabel = "Simulate",
}: {
  walletAccrued: number;
  phase: DemoPhase;
  isRunning: boolean;
  onSimulate: () => void;
  onReset: () => void;
  simulateLabel?: string;
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-3 border-t border-zinc-800 bg-zinc-900 px-4 py-3 sm:flex-row sm:items-center">
      <div className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 font-mono text-xs text-zinc-400">
        <Wallet className="h-3.5 w-3.5 text-emerald-400" />
        <span>Accrued:</span>
        <span className="font-sans font-bold text-emerald-400">${walletAccrued.toFixed(2)}</span>
      </div>

      <div className="flex gap-2">
        {phase === "done" ? (
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-zinc-600 px-4 py-1.5 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
          >
            Reset
          </button>
        ) : null}
        <button
          type="button"
          onClick={onSimulate}
          disabled={isRunning}
          className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
            isRunning
              ? "cursor-not-allowed bg-zinc-700 text-zinc-500"
              : "bg-white text-black hover:bg-emerald-400 hover:text-zinc-950"
          }`}
        >
          {isRunning ? "Running…" : phase === "done" ? "Run again" : simulateLabel}
        </button>
      </div>
    </div>
  );
}

export function DeveloperIdeDemo({
  variant = "interactive",
  brandName = "WOODS",
  sponsorText = "The #1 Student Companion",
}: {
  variant?: "interactive" | "advertiser-preview";
  brandName?: string;
  sponsorText?: string;
}) {
  const isAdvertiser = variant === "advertiser-preview";
  const [phase, setPhase] = useState<DemoPhase>("idle");
  const [editorLines, setEditorLines] = useState(isAdvertiser ? GENERIC_LINES : INITIAL_LINES);
  const [sponsor, setSponsor] = useState<DemoSponsor | null>(null);
  const [walletAccrued, setWalletAccrued] = useState(BASE_WALLET);
  const [thinkingDots, setThinkingDots] = useState(0);
  const [showSponsorBar, setShowSponsorBar] = useState(isAdvertiser);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    if (phase !== "thinking") return;
    const interval = window.setInterval(() => {
      setThinkingDots((prev) => (prev + 1) % 4);
    }, 400);
    return () => window.clearInterval(interval);
  }, [phase]);

  const resetDemo = useCallback(() => {
    clearTimers();
    setPhase("idle");
    setEditorLines(isAdvertiser ? GENERIC_LINES : INITIAL_LINES);
    setSponsor(null);
    setWalletAccrued(BASE_WALLET);
    setThinkingDots(0);
    setShowSponsorBar(isAdvertiser);
  }, [clearTimers, isAdvertiser]);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  const runAdvertiserPreview = useCallback(() => {
    if (phase !== "idle" && phase !== "done") return;
    clearTimers();
    setPhase("coding");
    setShowSponsorBar(false);
    setWalletAccrued(BASE_WALLET);

    schedule(() => setPhase("thinking"), 1200);
    schedule(() => {
      setPhase("adShown");
      setShowSponsorBar(true);
    }, 2200);
    schedule(() => {
      setWalletAccrued((prev) => parseFloat((prev + EARN_PER_AD).toFixed(2)));
      setPhase("done");
    }, 2800);
  }, [phase, clearTimers, schedule]);

  const runSimulation = useCallback(() => {
    if (isAdvertiser) {
      runAdvertiserPreview();
      return;
    }

    if (phase !== "idle" && phase !== "done") return;

    clearTimers();
    setPhase("coding");
    setEditorLines(INITIAL_LINES);
    setSponsor(null);
    setWalletAccrued(BASE_WALLET);

    const picked = SPONSORS[Math.floor(Math.random() * SPONSORS.length)];

    CODING_LINES.forEach((line, index) => {
      schedule(() => {
        setEditorLines((prev) => [...prev, line]);
        if (index === CODING_LINES.length - 1) {
          schedule(() => setPhase("thinking"), 500);
        }
      }, (index + 1) * 700);
    });

    schedule(() => {
      setPhase("adShown");
      setSponsor(picked);
    }, CODING_LINES.length * 700 + 2500);

    schedule(() => {
      setWalletAccrued((prev) => parseFloat((prev + EARN_PER_AD).toFixed(2)));
      setPhase("done");
    }, CODING_LINES.length * 700 + 3200);
  }, [phase, clearTimers, schedule, isAdvertiser, runAdvertiserPreview]);

  const isRunning = phase === "coding" || phase === "thinking" || phase === "adShown";
  const thinkingLabel = `Thinking${".".repeat(thinkingDots || 1)}`;

  if (isAdvertiser) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
        <WindowChrome phase={phase} />
        <div className="grid min-h-[360px] grid-cols-1 md:grid-cols-12">
          <WorkspaceSidebar activeFile="aibc-demo.tsx" />
          <div className="flex flex-col md:col-span-10">
            <EditorPane lines={editorLines} phase={phase} showCursor={false} />
            <SponsorStatusBar brandName={brandName} sponsorText={sponsorText} visible={showSponsorBar} />
          </div>
        </div>
        <DemoFooter
          walletAccrued={walletAccrued}
          phase={phase}
          isRunning={isRunning}
          onSimulate={runSimulation}
          onReset={resetDemo}
          simulateLabel="Simulate Code"
        />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
      <WindowChrome phase={phase} />

      <div className="grid min-h-[340px] grid-cols-1 md:grid-cols-12">
        <WorkspaceSidebar activeFile="auth.ts" />

        <div className="md:col-span-5">
          <EditorPane lines={editorLines} phase={phase} showCursor />
        </div>

        <div className="flex flex-col border-t border-zinc-800 bg-zinc-900/40 md:col-span-5 md:border-l md:border-t-0">
          <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-2.5">
            <Bot className="h-4 w-4 text-emerald-400" />
            <span className="font-mono text-xs text-zinc-400">AI Agent</span>
          </div>

          <div className="flex-1 space-y-3 p-4 font-mono text-xs text-zinc-400 md:text-sm">
            <p className="text-zinc-500">You</p>
            <p className="rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-zinc-300">
              Review my auth module and suggest improvements.
            </p>

            {(phase === "thinking" || phase === "adShown" || phase === "done") && !sponsor ? (
              <>
                <p className="text-zinc-500">Claude</p>
                <p className="rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-zinc-400">
                  {thinkingLabel}
                  {phase === "thinking" ? <ThinkingDots /> : null}
                </p>
              </>
            ) : null}

            {sponsor ? (
              <>
                <p className="text-zinc-500">Claude</p>
                <p className="rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 leading-relaxed text-zinc-300">
                  Your OTP flow looks solid. Consider rate-limiting the sign-in endpoint and adding session refresh on
                  the client.
                </p>
              </>
            ) : null}
          </div>

          <div className="border-t border-zinc-800 bg-zinc-950/80 px-4 py-3">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-zinc-600">Spinner</p>
            {phase === "thinking" && !sponsor ? (
              <p className="font-mono text-sm text-zinc-500">
                {thinkingLabel}
                <ThinkingDots />
              </p>
            ) : null}
            {sponsor ? (
              <div className="flex animate-fade-in items-center gap-2">
                <SponsorLogo brand={sponsor.brand} size="md" />
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="font-mono text-sm text-indigo-300 underline decoration-indigo-500/40"
                >
                  {sponsor.name} — {sponsor.text}
                </a>
              </div>
            ) : null}
            {phase === "idle" || phase === "coding" ? (
              <p className="font-mono text-sm text-zinc-600">Waiting for AI response…</p>
            ) : null}
          </div>
        </div>
      </div>

      <DemoFooter
        walletAccrued={walletAccrued}
        phase={phase}
        isRunning={isRunning}
        onSimulate={runSimulation}
        onReset={resetDemo}
      />
    </div>
  );
}
