import type { ReactNode } from "react";

/** Italic emerald phrase inside Instrument Serif headings (logo style). */
export function BrandAccent({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`italic text-emerald-600 ${className}`}>{children}</span>;
}
