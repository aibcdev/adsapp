import { DEVELOPER_SHARE_PCT, PLATFORM_SHARE_PCT } from "@aibc/shared";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { BrandAccent } from "../brand/BrandAccent";
import { formatMonthlyEarnings } from "../../lib/developerEstimates";
import {
  INSTALL,
  copyInstallCommand,
  triggerInstall,
  type InstallKey,
} from "../../lib/installLinks";
import { PLATFORM_LOGOS } from "../../lib/platformLogos";

const PRIMARY: InstallKey[] = ["vscode", "cursor", "windsurf", "openvsx"];

function InstallHelp({ option, onClose }: { option: (typeof INSTALL)[InstallKey]; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await copyInstallCommand(option.paletteCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-left">
      <p className="text-sm font-semibold text-zinc-900">
        Installing in {option.label}…
      </p>
      <p className="mt-1 text-xs text-zinc-600">
        If your editor didn&apos;t open, do this manually:
      </p>
      <ol className="mt-3 space-y-2 text-sm text-zinc-700">
        {option.manualSteps.map((step, i) => (
          <li key={step} className="flex gap-2">
            <span className="font-mono text-xs font-bold text-emerald-700">{i + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <code className="rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono text-xs text-zinc-800">
          {option.paletteCommand}
        </code>
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy command"}
        </button>
        <a
          href={option.storeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
        >
          Open store page
        </a>
        <span className="text-[11px] text-zinc-500">
          In Cursor: Cmd+Shift+P (not Terminal) → paste → Enter
        </span>
      </div>
      <button type="button" onClick={onClose} className="mt-3 text-xs font-medium text-zinc-500 hover:text-zinc-800">
        Dismiss
      </button>
    </div>
  );
}

function InstallButton({
  installKey,
  compact,
  active,
  onSelect,
}: {
  installKey: InstallKey;
  compact?: boolean;
  active: boolean;
  onSelect: (key: InstallKey) => void;
}) {
  const option = INSTALL[installKey];
  const logo = PLATFORM_LOGOS[installKey];

  const inner = (
    <>
      <div className="flex h-10 w-10 items-center justify-center">
        {logo ? (
          <img src={logo} alt="" aria-hidden className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-100 font-mono text-[10px] font-bold text-emerald-700">
            {option.label.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <span className="text-xs font-semibold text-zinc-900">{option.label}</span>
      {option.sublabel ? (
        <span className="max-w-[8.5rem] text-center text-[9px] leading-tight text-zinc-500">{option.sublabel}</span>
      ) : null}
    </>
  );

  const className = compact
    ? `flex min-h-[4.5rem] w-[4.5rem] flex-col items-center justify-center gap-1 rounded-xl border bg-white p-2 transition hover:border-emerald-400 hover:bg-emerald-50 ${
        active ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-zinc-200"
      }`
    : `group flex min-w-[7rem] flex-col items-center gap-1 rounded-2xl border bg-white px-3 py-3 transition hover:border-emerald-500 hover:bg-emerald-50 ${
        active ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-zinc-200"
      }`;

  return (
    <button
      type="button"
      data-install-button
      onClick={() => onSelect(installKey)}
      title={`Install in ${option.label}`}
      className={className}
    >
      {inner}
    </button>
  );
}

export function InstallButtons({ compact }: { compact?: boolean }) {
  const [activeKey, setActiveKey] = useState<InstallKey | null>(null);

  const select = (key: InstallKey) => {
    triggerInstall(key);
    setActiveKey(key);
  };

  return (
    <div>
      <div className={`flex flex-wrap items-stretch justify-center ${compact ? "gap-3" : "gap-3"}`}>
        {PRIMARY.map((key) => (
          <InstallButton
            key={key}
            installKey={key}
            compact={compact}
            active={activeKey === key}
            onSelect={select}
          />
        ))}
      </div>
      {activeKey ? (
        <InstallHelp option={INSTALL[activeKey]} onClose={() => setActiveKey(null)} />
      ) : null}
    </div>
  );
}

export function HeroInstallCta({ monthlyUsd }: { monthlyUsd: number }) {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 px-4 py-5 text-center">
          <p className="font-brand-heading text-4xl text-zinc-950 md:text-5xl">${formatMonthlyEarnings(monthlyUsd)}</p>
          <p className="mt-1 text-sm font-semibold text-zinc-700">typical active dev / month</p>
          <p className="mt-1 text-xs text-zinc-500">while you code with the extension on</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-5 text-center shadow-sm">
          <p className="font-brand-heading text-4xl text-zinc-950 md:text-5xl">
            {DEVELOPER_SHARE_PCT}<span className="text-2xl">%</span>
          </p>
          <p className="mt-1 text-sm font-semibold text-zinc-700">of ad spend</p>
          <p className="mt-1 text-xs text-zinc-500">every dollar advertisers pay — you keep {DEVELOPER_SHARE_PCT}¢. We keep {PLATFORM_SHARE_PCT}¢.</p>
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
        <p className="mb-1 text-center text-sm font-bold uppercase tracking-wide text-zinc-700">
          Click your editor to install
        </p>
        <p className="mb-4 text-center text-xs text-zinc-500">
          VS Code &amp; Cursor → VS Marketplace · Windsurf &amp; VSCodium →{" "}
          <a
            href="https://open-vsx.org/extension/AIBCMedia/aibc"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-emerald-700 underline hover:text-emerald-800"
          >
            Open VSX
          </a>
          {" · "}search <strong className="text-zinc-700">AIBCMedia</strong> in Extensions
        </p>
        <InstallButtons />
      </div>
    </div>
  );
}
