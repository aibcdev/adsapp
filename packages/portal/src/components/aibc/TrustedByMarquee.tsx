const COMPANIES = [
  "Cursor",
  "Google",
  "Microsoft",
  "Meta",
  "Apple",
  "Amazon",
  "OpenAI",
  "Anthropic",
];

export function TrustedByMarquee() {
  const items = [...COMPANIES, ...COMPANIES];

  return (
    <section className="border-t border-zinc-100 bg-white py-14 md:py-16" aria-label="Used by developers at leading companies">
      <p className="mx-auto max-w-3xl px-6 text-center font-brand-heading text-2xl leading-snug text-zinc-500 md:text-3xl">
        used by developers from leading tech companies and ai labs
      </p>

      <div
        className="relative mt-10 overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        }}
      >
        <div className="marquee-container-text items-center gap-10 px-6 md:gap-16">
          {items.map((name, index) => (
            <span
              key={`${name}-${index}`}
              className="whitespace-nowrap font-brand-heading text-2xl text-zinc-300 md:text-3xl select-none"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
