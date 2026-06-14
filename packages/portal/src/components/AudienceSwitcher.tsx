import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Check, ChevronDown, Code2, Megaphone, Radio } from "lucide-react";

type Segment = {
  id: string;
  label: string;
  path: string;
  icon: typeof Code2;
  match: (pathname: string) => boolean;
};

const SEGMENTS: Segment[] = [
  {
    id: "developers",
    label: "Developers",
    path: "/",
    icon: Code2,
    match: (p) => p === "/" || p.startsWith("/waitlist"),
  },
  {
    id: "advertisers",
    label: "Advertisers",
    path: "/advertisers",
    icon: Megaphone,
    match: (p) => p.startsWith("/advertisers"),
  },
  {
    id: "publishers",
    label: "Publishers",
    path: "/publishers",
    icon: Radio,
    match: (p) => p.startsWith("/publishers"),
  },
];

export function AudienceSwitcher({ onNavigate }: { onNavigate?: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const active = SEGMENTS.find((s) => s.match(location.pathname)) ?? SEGMENTS[0];
  const ActiveIcon = active.icon;

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const select = (segment: Segment) => {
    setOpen(false);
    onNavigate?.();
    if (location.pathname !== segment.path) navigate(segment.path);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-zinc-700/80 bg-zinc-900/60 px-3 py-1.5 text-sm font-medium text-zinc-200 backdrop-blur-sm transition hover:border-zinc-500 hover:bg-zinc-800/80"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <ActiveIcon size={15} className="text-emerald-500" />
        <span>{active.label}</span>
        <ChevronDown size={14} className={`text-zinc-500 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute left-0 top-full z-50 mt-2 min-w-[220px] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 py-1 shadow-xl"
        >
          {SEGMENTS.map((segment) => {
            const Icon = segment.icon;
            const isActive = segment.id === active.id;
            return (
              <button
                key={segment.id}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => select(segment)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-zinc-300 transition hover:bg-zinc-900"
              >
                <Icon size={16} className="shrink-0 text-zinc-500" />
                <span className="flex-1 font-medium">{segment.label}</span>
                {isActive ? <Check size={16} className="text-emerald-500" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function getAudienceCta(pathname: string): { label: string; href: string } {
  if (pathname.startsWith("/advertisers")) {
    return { label: "Start advertising", href: "/advertisers#launch" };
  }
  if (pathname.startsWith("/publishers")) {
    return { label: "Install free", href: "/#install" };
  }
  return { label: "Install free", href: "/#install" };
}

export function AudienceLinks({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <div className="flex flex-col gap-1">
      <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500">I am a</p>
      {SEGMENTS.map((segment) => {
        const Icon = segment.icon;
        const isActive = segment.match(location.pathname);
        return (
          <Link
            key={segment.id}
            to={segment.path}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium ${
              isActive ? "bg-zinc-900 text-emerald-400" : "text-zinc-400 hover:bg-zinc-900/50 hover:text-white"
            }`}
          >
            <Icon size={18} />
            {segment.label}
            {isActive ? <Check size={16} className="ml-auto text-emerald-500" /> : null}
          </Link>
        );
      })}
    </div>
  );
}
