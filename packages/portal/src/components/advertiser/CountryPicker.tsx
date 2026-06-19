import { TARGET_COUNTRIES } from "../../lib/countries";

export function CountryPicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (codes: string[]) => void;
}) {
  const toggle = (code: string) => {
    if (selected.includes(code)) {
      onChange(selected.filter((c) => c !== code));
    } else {
      onChange([...selected, code]);
    }
  };

  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
        Target countries (empty = worldwide)
      </p>
      <div className="mt-2 flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-lg border border-zinc-200 bg-white p-3">
        {TARGET_COUNTRIES.map((c) => {
          const on = selected.includes(c.code);
          return (
            <button
              key={c.code}
              type="button"
              onClick={() => toggle(c.code)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                on
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
