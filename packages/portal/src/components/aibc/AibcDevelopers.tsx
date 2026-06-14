import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Terminal, Code, Wallet, ChevronDown, Monitor, Award, Layers } from "lucide-react";
import { BrandAccent } from "../brand/BrandAccent";
import { HeroInstallCta } from "../landing/InstallButtons";
import { TrustedByMarquee } from "./TrustedByMarquee";

export function AibcDevelopers({ monthlyUsd = 40 }: { monthlyUsd?: number }) {
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  
  // Interactive IDE state
  const [walletAccrued, setWalletAccrued] = useState(1.42);
  const [sponsorIndex, setSponsorIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [typedLines, setTypedLines] = useState<string[]>([
    'import { useAibc } from "@aibc/extension";',
    'const dev = await getCurrentCoder();',
    '// AIBC active. Sponsoring your session...'
  ]);

  const sponsorsList = [
    { name: "Supabase", text: "⚡ Sponsor: Supabase — The open source Firebase alternative. Build in weekend.", link: "supabase.com" },
    { name: "Neon", text: "⚡ Sponsor: Neon Serverless Postgres — scale to zero, instant branches.", link: "neon.tech" },
    { name: "Clerk", text: "⚡ Sponsor: Clerk — Modern user authentication & management in minutes.", link: "clerk.com" },
    { name: "Sentry", text: "⚡ Sponsor: Sentry — Track errors and performance issues in real time.", link: "sentry.io" }
  ];

  // Auto cycle sponsors
  useEffect(() => {
    const timer = setInterval(() => {
      setSponsorIndex((prev) => (prev + 1) % sponsorsList.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // Simulator typing handler
  const handleSimulateCode = () => {
    if (isTyping) return;
    setIsTyping(true);
    
    const codingStatements = [
      '// Deploying to prod...',
      'const revenue = dev.computeEarnings();',
      'console.log(`Earned today: $${revenue}`);',
      '// Thank you to our developers!'
    ];

    let currentStatementIndex = 0;

    const interval = setInterval(() => {
      if (currentStatementIndex < codingStatements.length) {
        setTypedLines(prev => [...prev, codingStatements[currentStatementIndex]]);
        setWalletAccrued(prev => parseFloat((prev + 0.15).toFixed(2)));
        currentStatementIndex++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 1200);
  };

  const faqs = [
    {
      q: "How much can I earn?",
      a: `Most active developers earn about $${monthlyUsd.toFixed(0)}/month. You keep 70% of every dollar an advertiser pays when your machine shows their ad — the other 30% runs the platform.`,
    },
    {
      q: "70% of what, exactly?",
      a: "Of the money advertisers pay us. Example: if a brand pays $1 to show an ad on your screen, you get 70¢ and AIBC keeps 30¢. No hidden fees on your side.",
    },
    {
      q: "Why are payouts high right now?",
      a: "We are onboarding premium dev-tool brands (think Supabase, Neon, Clerk-level advertisers) before the full public launch. Early installs join the opening cohort and get first access when campaigns go live.",
    },
    {
      q: "Do I have to change how I work?",
      a: "No. Install the extension, code as normal. One small sponsor line appears in your AI spinner. No pop-ups. No extra clicks.",
    },
    {
      q: "Which editors work?",
      a: "VS Code, Cursor, and Windsurf. Click install above — it opens your editor directly.",
    },
  ];

  const roles = [
    { name: "Software Engineers", desc: "Get paid during deep work on features and day-to-day coding." },
    { name: "Founders", desc: "Offset infra costs while you ship your product." },
    { name: "AI Engineers", desc: "Earn while models train and you wait on long jobs." },
    { name: "Students", desc: "Side income while you learn and build projects." },
    { name: "Indie Hackers", desc: "Monetize the hours you already spend in the editor." },
    { name: "All Developers", desc: "If you write code, you can get paid for your focus time." }
  ];

  return (
    <div className="text-zinc-900 bg-white font-sans">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center px-6 pt-32 pb-20 text-center overflow-hidden">
        {/* Ambient Gradient Background */}
        <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[800px] h-[450px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="absolute top-[30%] left-[10%] w-[300px] h-[300px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-4xl mx-auto z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Opening cohort · Install now
          </div>

          <h1 className="font-brand-heading text-5xl md:text-7xl lg:text-[5.5rem] text-zinc-950 max-w-4xl mx-auto leading-[1.05]">
            Get paid to <BrandAccent>code.</BrandAccent>
          </h1>

          <p className="text-xl md:text-2xl text-zinc-600 font-medium max-w-2xl mx-auto leading-snug">
            Click install. Keep coding. One sponsor line in your AI spinner pays you{" "}
            <strong className="text-zinc-950">70% of every ad dollar</strong> — from top dev-tool brands onboarding now.
          </p>

          <div className="pt-2">
            <HeroInstallCta monthlyUsd={monthlyUsd} />
          </div>

          <p className="text-base text-zinc-600 font-medium max-w-xl mx-auto">
            Be in the <strong className="text-zinc-950">first 15,000 installs</strong>. Premium advertisers are signing up now — early cohort members earn first when campaigns switch on.
          </p>

          <p className="text-sm text-zinc-500">
            Already installed?{" "}
            <Link to="/login" className="font-semibold text-emerald-700 underline hover:text-emerald-800">
              Sign in to see your balance
            </Link>
          </p>
        </div>
      </section>

      <TrustedByMarquee />

      {/* Live IDE Interactive Simulation Demo */}
      <section className="py-20 px-6 border-t border-zinc-200 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase text-emerald-700 tracking-widest">Live demo</span>
            <h2 className="font-brand-heading text-4xl md:text-6xl text-zinc-950 mt-3">
              See it in your <BrandAccent>editor</BrandAccent>
            </h2>
            <p className="text-base text-zinc-600 mt-3 max-w-lg mx-auto font-medium">
              Click simulate. Watch the sponsor line appear and your earnings tick up — exactly how it works in VS Code, Cursor, or Windsurf.
            </p>
          </div>

          {/* IDE Container */}
          <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            {/* Window bar */}
            <div className="px-4 py-3 bg-zinc-900/80 border-b border-zinc-900/80 flex items-center justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/30"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30"></div>
              </div>
              <div className="text-xs font-mono text-zinc-500 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                aibc-demo-workspace.tsx
              </div>
              <div className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                ACTIVE SESSION
              </div>
            </div>

            {/* Main IDE area */}
            <div className="grid grid-cols-1 md:grid-cols-4 min-h-[300px]">
              {/* Explorer panel */}
              <div className="hidden md:block col-span-1 border-r border-zinc-800 bg-zinc-900/50 p-4 font-mono text-xs text-zinc-500 space-y-3">
                <div className="font-semibold text-zinc-600 uppercase tracking-wider text-[10px]">Workspace</div>
                <div className="space-y-2 mt-2">
                  <div className="text-emerald-400 flex items-center gap-1 cursor-pointer">
                    <Code className="w-3.5 h-3.5" /> aibc-demo.tsx
                  </div>
                  <div className="flex items-center gap-1 cursor-pointer hover:text-zinc-600">
                    <Monitor className="w-3.5 h-3.5" /> main.css
                  </div>
                  <div className="flex items-center gap-1 cursor-pointer hover:text-zinc-600">
                    <Layers className="w-3.5 h-3.5" /> config.json
                  </div>
                </div>
              </div>

              {/* Code output */}
              <div className="relative col-span-1 max-h-[350px] overflow-y-auto bg-black/60 p-6 font-mono text-xs text-zinc-300 md:col-span-3 md:text-sm">
                {typedLines.map((line, idx) => (
                  <div key={idx} className="flex gap-4">
                    <span className="text-zinc-600 select-none text-right w-6">{idx + 1}</span>
                    <pre className="whitespace-pre-wrap text-zinc-300">{line}</pre>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-4 items-center">
                    <span className="text-zinc-600 select-none text-right w-6">{typedLines.length + 1}</span>
                    <div className="w-2 h-4 bg-emerald-400 animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Static Sponsor Bar - Displays AIBC Media Message */}
            <div className="bg-zinc-900 border-t border-zinc-805/80 px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-medium lowercase">
                  Sponsor
                </span>
                <span className="text-xs text-zinc-305 font-medium tracking-tight animate-fade-in">
                  {sponsorsList[sponsorIndex].text}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-zinc-600 self-stretch sm:self-auto justify-between sm:justify-end border-t sm:border-t-0 border-zinc-200 pt-2 sm:pt-0">
                <div className="flex items-center gap-1.5 bg-zinc-100/70 border border-zinc-200 px-3 py-1.5 rounded-lg">
                  <Wallet className="w-3.5 h-3.5 text-emerald-450" />
                  <span>Accrued:</span>
                  <span className="text-emerald-400 font-bold font-sans">${walletAccrued.toFixed(2)}</span>
                </div>
                
                <button
                  onClick={handleSimulateCode}
                  disabled={isTyping}
                  className={`px-4 py-1.5 rounded-lg font-semibold text-black transition-all ${
                    isTyping ? 'bg-zinc-700 text-zinc-600 cursor-not-allowed' : 'bg-white hover:bg-emerald-400 hover:text-zinc-950'
                  }`}
                >
                  {isTyping ? 'Coding...' : 'Simulate Code'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 px-6 md:px-12 border-t border-zinc-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-xs font-bold uppercase text-emerald-700 tracking-widest mb-3 block">3 steps</span>
            <h2 className="font-brand-heading text-4xl md:text-6xl text-zinc-950">
              How it <BrandAccent>works</BrandAccent>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl border border-zinc-200 bg-white shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-6">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-zinc-950 mb-2">1. Install free</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Add AIBC Media to VS Code, Cursor, or Windsurf. Takes under a minute.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-zinc-200 bg-white shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-6">
                <Code className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-zinc-950 mb-2">2. Keep coding</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Sponsors show as one line in your AI spinner. No pop-ups. No workflow changes.
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-zinc-200 bg-white shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-6">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-zinc-950 mb-2">3. Get paid</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                You keep <strong className="text-zinc-900">70% of every ad dollar</strong> shown on your screen. Track it in your dashboard and cash out when ready.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why AIBC Media Exists */}
      <section className="py-32 px-6 md:px-12 border-t border-zinc-200 bg-white relative overflow-hidden">
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 blur-[130px] rounded-full pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
          <span className="text-xs font-bold uppercase text-emerald-700 tracking-widest block">The problem</span>
          <h2 className="font-brand-heading text-4xl md:text-6xl text-zinc-950 leading-tight">
            Your coding time is valuable.<br />
            You should <BrandAccent>get paid</BrandAccent> for it.
          </h2>
          
          <div className="text-lg md:text-xl text-zinc-600 leading-relaxed space-y-5 max-w-2xl mx-auto font-medium">
            <p>
              Developers spend thousands of hours in their editor every year.
            </p>
            <p className="text-zinc-950 font-bold text-2xl md:text-3xl">
              That attention creates value for everyone else — not you.
            </p>
            <p className="text-emerald-600 font-bold text-xl md:text-2xl">
              AIBC Media fixes that.
            </p>
          </div>
        </div>
      </section>

      {/* Founding Members perks */}
      <section className="py-32 px-6 md:px-12 border-t border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold uppercase text-emerald-700 tracking-widest block">Limited spots</span>
              <h2 className="font-brand-heading text-4xl md:text-6xl text-zinc-950">
                Founding member <BrandAccent>perks</BrandAccent>
              </h2>
              <p className="text-base text-zinc-600 font-medium leading-relaxed max-w-md">
                Install now to join the opening cohort. Top advertisers are onboarding — early members get priority when campaigns go live and a permanent +5% bonus.
              </p>
            </div>
            
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: "Priority payouts", desc: "Get paid first when sponsor campaigns go live." },
                { title: "+5% bonus forever", desc: "Permanent extra share on every sponsor payment." },
                { title: "Early feature access", desc: "Try new editor tools and payout options before anyone else." },
                { title: "Founding badge", desc: "Show you were here from day one on your profile." }
              ].map((member, i) => (
                <div key={i} className="p-6 rounded-2xl border border-zinc-200 bg-white shadow-sm space-y-3 hover:border-emerald-200 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs font-bold font-mono">
                    <Award className="w-4 h-4" />
                  </div>
                  <h4 className="text-base font-bold text-zinc-950">{member.title}</h4>
                  <p className="text-sm text-zinc-600 leading-relaxed">{member.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Built For Builders */}
      <section className="py-32 px-6 md:px-12 border-t border-zinc-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase text-emerald-700 tracking-widest mb-3 block">Who it is for</span>
            <h2 className="font-brand-heading text-4xl md:text-6xl text-zinc-950">
              Built for people who <BrandAccent>code</BrandAccent>
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-zinc-200 bg-white shadow-sm hover:border-emerald-200 hover:shadow-md transition-all duration-300">
                <span className="text-base font-bold text-zinc-950 block mb-2">{role.name}</span>
                <p className="text-sm text-zinc-600 leading-relaxed">{role.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-6 md:px-12 border-t border-zinc-200 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase text-emerald-700 tracking-widest mb-3 block">FAQ</span>
            <h2 className="font-brand-heading text-4xl md:text-6xl text-zinc-950">
              Questions <BrandAccent>answered</BrandAccent>
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = activeFAQ === index;
              return (
                <div key={index} className="border border-zinc-200 rounded-2xl bg-white shadow-sm overflow-hidden">
                  <button
                    onClick={() => setActiveFAQ(isOpen ? null : index)}
                    className="w-full flex justify-between items-center text-left p-6 font-bold text-base md:text-lg text-zinc-950 hover:text-emerald-700 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-sm md:text-base text-zinc-600 border-t border-zinc-100 pt-4 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 text-center bg-white border-t border-zinc-200 relative overflow-hidden">
        <div className="absolute bottom-[-10%] left-[50%] -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-3xl mx-auto z-10 relative space-y-6">
          <h2 className="font-brand-heading text-5xl md:text-7xl text-zinc-950 leading-none">
            Install now. Join the first{" "}
            <BrandAccent>15,000.</BrandAccent>
          </h2>
          <p className="text-zinc-600 text-lg font-medium max-w-lg mx-auto">
            Click install above. Sign in after to track earnings. Opening cohort gets first access when premium brand campaigns go live.
          </p>

          <div className="pt-6">
            <HeroInstallCta monthlyUsd={monthlyUsd} />
          </div>

          <p className="text-sm text-zinc-500 pt-4">
            <Link to="/login" className="font-semibold text-emerald-700 underline">
              Sign in to your dashboard
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
