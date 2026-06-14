import { useEffect, useState } from "react";

type Caps = {
  hourlyEarned: number;
  dailyEarned: number;
  hourlyCap: number;
  dailyCap: number;
};

function useCountdown(targetMs: number) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const tick = () => {
      const diff = targetMs - Date.now();
      if (diff <= 0) {
        setLabel("resetting…");
        return;
      }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      if (h > 0) setLabel(`${h}h ${m}m`);
      else if (m > 0) setLabel(`${m}m ${s}s`);
      else setLabel(`${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  return label;
}

function nextHourBoundary() {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d.getTime();
}

function nextDayBoundary() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function LimitRow({
  label,
  earned,
  cap,
  resetIn,
}: {
  label: string;
  earned: number;
  cap: number;
  resetIn: string;
}) {
  const pct = cap > 0 ? Math.min(100, (earned / cap) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex justify-between font-mono text-[10px] uppercase tracking-wider text-zinc-500">
        <span>{label}</span>
        <span>
          ${earned.toFixed(2)} / ${cap.toFixed(2)}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 font-mono text-[10px] text-zinc-400">Resets in {resetIn || "…"}</p>
    </div>
  );
}

export function StatCards({
  today,
  month,
  lifetime,
  caps,
}: {
  today: number;
  month: number;
  lifetime: number;
  caps: Caps;
}) {
  const hourReset = useCountdown(nextHourBoundary());
  const dayReset = useCountdown(nextDayBoundary());

  const stats = [
    { label: "Today", value: today, sub: "credited today" },
    { label: "This month", value: month, sub: "month-to-date" },
    { label: "Lifetime", value: lifetime, sub: "all-time credit" },
  ];

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="aibc-card-accent p-5 pl-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">{s.label}</p>
          <p className="mt-2 font-brand-heading text-3xl text-zinc-900">${s.value.toFixed(2)}</p>
          <p className="mt-1 text-xs text-zinc-500">{s.sub}</p>
        </div>
      ))}
      <div className="aibc-card p-5">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-zinc-500">Earning limits</p>
        <div className="space-y-4">
          <LimitRow label="Hourly" earned={caps.hourlyEarned} cap={caps.hourlyCap} resetIn={hourReset} />
          <LimitRow label="Daily" earned={caps.dailyEarned} cap={caps.dailyCap} resetIn={dayReset} />
        </div>
      </div>
    </div>
  );
}
