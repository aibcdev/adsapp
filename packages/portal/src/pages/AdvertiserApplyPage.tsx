import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";

const API = import.meta.env.VITE_AIBC_API || "https://api.aibcmedia.com";

const inputClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-100 focus:border-emerald-500/50 focus:outline-none";

export function AdvertiserApplyPage() {
  const navigate = useNavigate();
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [budget, setBudget] = useState("");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`${API}/v1/advertiser/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, website, budget, email }),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error || "Submit failed");
      setDone(true);
      setTimeout(() => navigate("/advertisers"), 2500);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Submit failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <SiteHeader />
      <section className="mx-auto max-w-md px-6 py-32 md:px-12">
        {done ? (
          <div className="text-center">
            <h1 className="font-instrument-serif text-2xl text-white">Application received.</h1>
            <p className="mt-3 text-sm text-zinc-400">We&apos;ll be in touch shortly.</p>
          </div>
        ) : (
          <>
            <h1 className="font-instrument-serif text-3xl text-white">Apply to advertise</h1>
            <p className="mt-3 text-sm text-zinc-400">Tell us about your campaign</p>
            <form onSubmit={(e) => void submit(e)} className="mt-10 space-y-4">
              {[
                { label: "Company", value: company, set: setCompany, type: "text" },
                { label: "Website", value: website, set: setWebsite, type: "url" },
                { label: "Monthly budget", value: budget, set: setBudget, type: "text" },
                { label: "Contact email", value: email, set: setEmail, type: "email" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                    {f.label}
                  </label>
                  <input required type={f.type} value={f.value} onChange={(e) => f.set(e.target.value)} className={inputClass} />
                </div>
              ))}
              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full bg-white py-3 text-sm font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
              >
                {busy ? "Submitting…" : "Submit application"}
              </button>
              {err ? <p className="text-center text-sm text-red-400">{err}</p> : null}
            </form>
          </>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}
