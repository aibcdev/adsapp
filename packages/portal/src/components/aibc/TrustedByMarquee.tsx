const COMPANIES = [
  { name: "Cursor", logo: "/logos/trusted/cursor.svg" },
  { name: "Google", logo: "/logos/trusted/google.svg" },
  { name: "Microsoft", logo: "/logos/trusted/microsoft.svg" },
  { name: "Meta", logo: "/logos/trusted/meta.svg" },
  { name: "Apple", logo: "/logos/trusted/apple.svg" },
  { name: "Amazon", logo: "/logos/trusted/amazon.svg" },
  { name: "OpenAI", logo: "/logos/trusted/openai.svg" },
  { name: "Anthropic", logo: "/logos/trusted/anthropic.svg" },
];

export function TrustedByMarquee() {
  const items = [...COMPANIES, ...COMPANIES];

  return (
    <section className="border-t border-zinc-200 bg-white py-8 md:py-10" aria-label="Used by developers at leading companies">
      <p className="mx-auto max-w-3xl px-6 text-center font-brand-heading text-2xl leading-snug text-zinc-500 md:text-3xl">
        used by developers who have worked for leading tech companies and ai labs
      </p>

      <div
        className="relative mt-5 overflow-hidden md:mt-6"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        }}
      >
        <div className="marquee-container-text items-end gap-6 px-6 md:gap-8">
          {items.map((company, index) => (
            <div
              key={`${company.name}-${index}`}
              className="flex w-20 shrink-0 flex-col items-center gap-1.5 md:w-24"
            >
              <div className="flex h-9 w-full items-center justify-center md:h-10">
                <img
                  src={company.logo}
                  alt=""
                  aria-hidden
                  className="max-h-full max-w-full object-contain select-none"
                  draggable={false}
                />
              </div>
              <span className="text-center text-[10px] font-medium text-zinc-500 md:text-xs">{company.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
