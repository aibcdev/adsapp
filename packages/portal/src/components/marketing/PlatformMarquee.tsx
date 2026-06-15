import { PLATFORM_INSTALL_KEY, installStoreUrl } from "../../lib/installLinks";

const PLATFORMS = [
  {
    id: 1,
    name: "VS Code",
    description: "One-click install from the marketplace. Ads in your spinner while extensions load.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Cursor",
    description: "Same extension. Native ad line in the agent panel spinner — not a popup.",
    image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=2670&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Claude Code",
    description: "Spinner swap while Claude thinks. You keep 70% of every view.",
    image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2574&auto=format&fit=crop",
    href: "/#install",
  },
  {
    id: 4,
    name: "Open VSX",
    description: "VSCodium and compatible editors. Install once, earn while you code.",
    image: "https://images.unsplash.com/photo-1639322537228-ad7117a39490?q=80&w=2664&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Windsurf",
    description: "Open VSX install. One line in the loading state — same spot every time.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
  },
];

function platformHref(name: string): string {
  const key = PLATFORM_INSTALL_KEY[name];
  if (key) return installStoreUrl(key);
  return "/#install";
}

export function PlatformMarquee() {
  const display = [...PLATFORMS, ...PLATFORMS, ...PLATFORMS];

  return (
    <section id="platforms" className="relative z-10 overflow-hidden border-b border-zinc-900/50 bg-zinc-950 pb-24 pt-24">
      <div className="mb-16 px-6 md:mb-24 md:px-12">
        <div className="grid grid-cols-1 items-end gap-12 lg:grid-cols-2">
          <h2 className="font-instrument-serif text-4xl leading-[0.95] tracking-tight text-white md:text-6xl lg:text-7xl">
            Works Where You Code.
            <br />
            <span className="text-zinc-600">Not another dashboard.</span>
          </h2>
          <div className="lg:pl-12">
            <p className="text-lg font-light leading-relaxed text-zinc-400 md:text-xl">
              VS Code, Cursor, Windsurf, Open VSX, and more. One extension. One line in the spinner. You keep 70%.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 font-mono text-sm text-zinc-500">
              <span>// No popups</span>
              <span>// No code reading</span>
              <span>// Uninstall restores normal</span>
            </div>
            <a
              href="/#install"
              className="mt-8 inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/20"
            >
              Install free →
            </a>
          </div>
        </div>
      </div>

      <div
        className="no-scrollbar flex w-full touch-pan-y overflow-x-auto"
        style={{ maskImage: "linear-gradient(to right, transparent, black 5%, black 95%, transparent)" }}
      >
        <div className="flex min-w-max items-stretch gap-6 px-4 md:gap-8 md:px-8">
          {display.map((platform, index) => {
            const href = platform.href ?? platformHref(platform.name);
            const external = href.startsWith("http");
            return (
              <a
                key={`${platform.id}-${index}`}
                href={href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="group relative h-[600px] w-[85vw] shrink-0 overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900/40 transition-colors duration-500 hover:border-emerald-500/50 md:w-[500px]"
              >
                <div className="absolute inset-0 h-full w-full">
                  <img
                    src={platform.image}
                    className="h-full w-full object-cover opacity-60 transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-80"
                    draggable={false}
                    alt={platform.name}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/20 to-zinc-950" />
                </div>
                <div className="absolute inset-0 flex flex-col justify-between p-8 md:p-10">
                  <span className="font-instrument-serif text-5xl text-white/90 md:text-6xl">
                    {String(platform.id).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="mb-3 translate-y-2 font-instrument-serif text-3xl tracking-tight text-white transition-transform duration-500 group-hover:translate-y-0 md:text-4xl">
                      {platform.name}
                    </h3>
                    <div className="h-0 overflow-hidden transition-all duration-500 group-hover:h-auto">
                      <p className="max-w-[90%] pt-2 text-sm leading-relaxed text-zinc-300 opacity-0 transition-opacity delay-100 duration-700 group-hover:opacity-100">
                        {platform.description}
                      </p>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-emerald-400 opacity-0 transition-opacity delay-150 duration-700 group-hover:opacity-100">
                        {external ? "Open install page →" : "Install free →"}
                      </p>
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
