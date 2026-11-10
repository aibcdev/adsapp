import type { ReactNode } from "react";
import { Link } from "react-router-dom";

/** Routes this SPA actually renders. Other same-site paths are real documents on the deployed site. */
const SPA_PATHS = new Set([
  "/",
  "/about",
  "/about-us",
  "/faq",
  "/faqs",
  "/guides",
  "/developers",
  "/vs",
  "/advertisers",
  "/advertisers/apply",
  "/developers/how-it-works",
  "/developers/payouts",
  "/publishers",
  "/contact",
  "/privacy",
  "/terms",
  "/blog",
  "/referral",
  "/login",
  "/dashboard",
  "/integrations/claude",
  "/integrations/cursor",
  "/integrations/v0",
  "/integrations/antigravity",
]);

export function isSpaRoute(to: string): boolean {
  const path = (to.split("?")[0] || "/").split("#")[0] || "/";
  return SPA_PATHS.has(path);
}

export function SiteLink({
  to,
  className,
  children,
}: {
  to: string;
  className?: string;
  children: ReactNode;
}) {
  if (isSpaRoute(to)) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={to} className={className}>
      {children}
    </a>
  );
}

export function TextLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <SiteLink to={to} className="font-semibold text-emerald-700 hover:underline">
      {children}
    </SiteLink>
  );
}
