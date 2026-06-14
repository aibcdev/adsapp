import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { submitAdvertiserApplication } from "../lib/waitlist";

const inputClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-100 focus:border-emerald-500/50 focus:outline-none";

export function AdvertiserApplyPage() {
  const navigate = useNavigate();
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [budget, setBudget] = useState("");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    submitAdvertiserApplication({ company, website, budget, email });
    setDone(true);
    setTimeout(() => navigate("/advertisers"), 2500);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <SiteHeader />
      <section className="mx-auto max-w-md px-6 py-32 md:px-12">
        {done ? (
          <div className="text-center">
            <h1 className="font-instrument-serif text-2xl text-white">Application received.</h1>
            <p className="mt-3 text-sm text-zinc-400">We&apos;ll be in touch shortly.</p>
            <p className="mt-2 text-xs text-zinc-500">Saved in your browser only (demo).</p>
          </div>
        ) : (
          <>
            <h1 className="font-instrument-serif text-3xl text-white">Apply to advertise</h1>
            <p className="mt-3 text-sm text-zinc-400">Tell us about your campaign</p>
            <form onSubmit={submit} className="mt-10 space-y-4">
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
              <button type="submit" className="w-full rounded-full bg-white py-3 text-sm font-semibold text-black hover:bg-zinc-200">
                Submit application
              </button>
              <p className="text-center text-xs text-zinc-500">Stored in your browser only (demo).</p>
            </form>
          </>
        )}
      </section>
      <SiteFooter />
    </div>
  );
}
