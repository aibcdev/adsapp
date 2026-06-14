import { BrandAccent } from "../brand/BrandAccent";
import { INSTALL, openInstall, type InstallKey } from "../../lib/installLinks";
import { PLATFORM_LOGOS } from "../../lib/platformLogos";

const PRIMARY: InstallKey[] = ["vscode", "cursor", "windsurf"];

function PlatformIcon({ installKey, label }: { installKey: InstallKey; label: string }) {
  const logo = PLATFORM_LOGOS[installKey];

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex h-10 w-10 items-center justify-center">
        {logo ? (
          <img src={logo} alt="" aria-hidden className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-100 font-mono text-[10px] font-bold text-emerald-700">
            {label.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <span className="text-xs font-semibold text-zinc-900">{label}</span>
    </div>
  );
}

export function InstallButtons({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3">
        {PRIMARY.map((key) => (
          <button
            key={key}
            type="button"
            data-install-button
            onClick={() => openInstall(key)}
            title={`Install in ${INSTALL[key].label}`}
            className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-xl border border-zinc-200 bg-white p-2 transition hover:border-emerald-400 hover:bg-emerald-50"
          >
            <PlatformIcon installKey={key} label={INSTALL[key].label} />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-stretch justify-center gap-3">
      {PRIMARY.map((key) => (
        <button
          key={key}
          type="button"
          data-install-button
          onClick={() => openInstall(key)}
          title={`Install in ${INSTALL[key].label}`}
          className="group flex min-w-[6.5rem] flex-col items-center rounded-2xl border border-zinc-200 bg-white px-4 py-3 transition hover:border-emerald-500 hover:bg-emerald-50"
        >
          <PlatformIcon installKey={key} label={INSTALL[key].label} />
        </button>
      ))}
    </div>
  );
}

export function HeroInstallCta({ monthlyUsd }: { monthlyUsd: number }) {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-5 text-center">
          <p className="font-brand-heading text-4xl text-zinc-950 md:text-5xl">${monthlyUsd.toFixed(0)}</p>
          <p className="mt-1 text-sm font-semibold text-zinc-700">avg per month</p>
          <p className="mt-1 text-xs text-zinc-500">while you code with the extension on</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-5 text-center shadow-sm">
          <p className="font-brand-heading text-4xl text-zinc-950 md:text-5xl">
            70<span className="text-2xl">%</span>
          </p>
          <p className="mt-1 text-sm font-semibold text-zinc-700">of ad spend</p>
          <p className="mt-1 text-xs text-zinc-500">every dollar advertisers pay — you keep 70¢. We keep 30¢.</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-5 text-center shadow-sm">
          <p className="font-brand-heading text-3xl text-zinc-950 md:text-4xl">
            Top <BrandAccent>brands</BrandAccent>
          </p>
          <p className="mt-1 text-sm font-semibold text-zinc-700">premium advertisers</p>
          <p className="mt-1 text-xs text-zinc-500">dev-tool companies pay more — that is why you earn more</p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="mb-4 text-center text-sm font-bold uppercase tracking-wide text-zinc-700">
          Click to install — opens your editor
        </p>
        <InstallButtons />
        <p className="mt-4 text-center text-xs text-zinc-500">
          VS Code · Cursor · Windsurf — one click, free forever
        </p>
      </div>
    </div>
  );
}
