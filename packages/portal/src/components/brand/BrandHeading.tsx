import type { ReactNode } from "react";

export function BrandHeading({
  children,
  className = "",
  as: Tag = "h2",
}: {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return <Tag className={`font-brand-heading tracking-tight ${className}`}>{children}</Tag>;
}
