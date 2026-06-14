import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { AibcDevelopers } from "../components/aibc/AibcDevelopers";
import { publicApi } from "../lib/api";
import { normalizeMonthlyEarnings } from "../lib/developerEstimates";

export function LandingPage() {
  const [params] = useSearchParams();
  const [monthlyUsd, setMonthlyUsd] = useState(40);
  const purchase = params.get("purchase");

  useEffect(() => {
    void publicApi<{ monthlyUsd: number }>("/v1/stats/earnings-estimate").then((s) => {
      setMonthlyUsd(normalizeMonthlyEarnings(s.monthlyUsd));
    });
  }, []);

  return (
    <div className="app-shell">
      <SiteHeader />
      {purchase === "success" ? (
        <div className="border-b border-emerald-200 bg-emerald-50 px-6 py-3 text-center text-sm text-emerald-800">
          Payment received — your campaign will appear on the live auction shortly.
        </div>
      ) : purchase === "cancel" ? (
        <div className="border-b border-zinc-200 bg-white px-6 py-3 text-center text-sm text-zinc-600">
          Checkout cancelled.{" "}
          <Link to="/advertisers#launch" className="text-emerald-600 underline">
            Try again
          </Link>
        </div>
      ) : null}
      <main id="install">
        <AibcDevelopers monthlyUsd={monthlyUsd} />
      </main>
      <SiteFooter />
    </div>
  );
}
