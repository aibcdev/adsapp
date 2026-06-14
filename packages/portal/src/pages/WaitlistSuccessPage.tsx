import { useMemo } from "react";
import { Link } from "react-router-dom";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { AibcWaitlistSuccess } from "../components/aibc/AibcWaitlistSuccess";
import { getWaitlistUser, referralLink } from "../lib/waitlist";

export function WaitlistSuccessPage() {
  const user = getWaitlistUser();
  const link = useMemo(() => (user ? referralLink(user.refCode) : ""), [user]);

  if (!user) {
    return (
      <div className="app-shell">
        <SiteHeader />
        <div className="mx-auto max-w-lg px-6 py-32 text-center">
          <p className="text-zinc-600">No waitlist entry found.</p>
          <Link to="/waitlist" className="mt-6 inline-block text-emerald-700 underline">
            Join the waitlist
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <SiteHeader />
      <AibcWaitlistSuccess
        email={user.email}
        position={user.position}
        referrals={user.referrals}
        refCode={user.refCode}
        referralLinkUrl={link}
      />
      <SiteFooter />
    </div>
  );
}
