export function SpinnerComparison({ previewText }: { previewText: string }) {
  return (
    <div className="mx-auto grid max-w-3xl grid-cols-1 items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
      <div className="glass-panel rounded-2xl p-4">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-zinc-500">Stock Claude Code</p>
        <div className="flex items-center gap-2 font-mono text-sm text-orange-400">
          <span>+</span>
          <span>Percolating…</span>
          <span className="ml-auto text-zinc-500">Write · 2.1s</span>
        </div>
      </div>

      <div className="hidden text-center font-mono text-2xl text-emerald-500 md:block">&raquo;</div>

      <div className="rounded-2xl border-2 border-emerald-500/30 bg-zinc-900/60 p-4">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-emerald-500">With AIBC Media</p>
        <div className="flex items-center gap-2 font-mono text-sm text-zinc-200">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
            ●
          </span>
          <span className="truncate text-emerald-400 underline decoration-emerald-500/30">
            {previewText || "Your ad here"}
          </span>
          <span className="ml-auto text-zinc-500">Write · 1.7s</span>
        </div>
      </div>
    </div>
  );
}
