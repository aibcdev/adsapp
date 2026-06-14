import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Zap, Check, ArrowRight, BadgeAlert, HelpCircle, Laptop, ChevronDown, ChevronUp,
} from "lucide-react";
import { BrandAccent } from "../brand/BrandAccent";
import type { ReactNode } from "react";

interface AudienceSegment {
  id: string;
  name: string;
  icon: string;
  concentration: string;
  focusHours: string;
  primaryLanguages: string[];
  ideChoice: string;
  description: string;
}

const AUDIENCE_SEGMENTS: AudienceSegment[] = [
  {
    id: "engineers",
    name: "Software Engineers",
    icon: "💻",
    concentration: "42% of Cohort",
    focusHours: "6.8 hrs / day",
    primaryLanguages: ["TypeScript", "Rust", "Python", "Go"],
    ideChoice: "VS Code / Cursor",
    description: "Experienced engineers building enterprise codebases, integrating APIs, and deploying modern cloud stacks."
  },
  {
    id: "ai-devs",
    name: "AI Engineers",
    icon: "🧠",
    concentration: "21% of Cohort",
    focusHours: "7.2 hrs / day",
    primaryLanguages: ["Python", "C++", "TypeScript", "Mojo"],
    ideChoice: "Cursor / VS Code",
    description: "Pioneers scripting neural nets, fine-tuning LLMs, compiling weights, and designing agentic frameworks."
  },
  {
    id: "founders",
    name: "Startup Founders",
    icon: "🚀",
    concentration: "15% of Cohort",
    focusHours: "5.5 hrs / day",
    primaryLanguages: ["TypeScript", "Python", "Swift", "SQL"],
    ideChoice: "VS Code / Windsurf",
    description: "Technical decision makers establishing company infrastructure, picking database systems, and scaling early MVPs."
  },
  {
    id: "indie",
    name: "Indie Hackers",
    icon: "🎨",
    concentration: "12% of Cohort",
    focusHours: "8.1 hrs / day",
    primaryLanguages: ["JavaScript", "Ruby", "TypeScript", "Python"],
    ideChoice: "Cursor / Windsurf",
    description: "Solopreneurs developing rapid tools, monetizing niches, and integrating third-party APIs on compressed timelines."
  },
  {
    id: "students",
    name: "Students",
    icon: "🎓",
    concentration: "10% of Cohort",
    focusHours: "4.2 hrs / day",
    primaryLanguages: ["Python", "Java", "C", "TypeScript"],
    ideChoice: "VS Code",
    description: "Next-gen developers mastering modern paradigms, writing open source code, and exploring ecosystem tools."
  }
];

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: "approval" | "safety" | "technical";
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 1,
    category: "approval",
    question: "How long does campaign approval take?",
    answer: "We review every ad manually. Most campaigns are approved within 24–48 hours. Once approved, your ad goes live in developer editors worldwide."
  },
  {
    id: 2,
    category: "approval",
    question: "What can I not advertise?",
    answer: "Dev tools and B2B products only. No gambling, adult content, politics, crypto scams, or spammy offers. We protect developer trust."
  },
  {
    id: 3,
    category: "safety",
    question: "Is my brand safe?",
    answer: "Yes. Ads appear in a small, read-only line in the editor. We block sensitive code contexts so your brand never shows up in the wrong place."
  },
  {
    id: 4,
    category: "safety",
    question: "Can I target specific developer types?",
    answer: "Yes. Filter by language, editor, or project type. We never read or store private source code."
  },
  {
    id: 5,
    category: "technical",
    question: "What does the ad look like?",
    answer: "One short line of text in the AI spinner (up to 80 characters), or a small toast with a button. All links must use HTTPS."
  },
  {
    id: 6,
    category: "technical",
    question: "How do I track clicks?",
    answer: "Every click runs through our proxy with standard UTM tags. Plug results into Google Analytics, Mixpanel, or Stripe — same as any ad network."
  },
  {
    id: 7,
    category: "technical",
    question: "Will this slow down the editor?",
    answer: "No. The extension runs in the background at low priority. Zero impact on compile speed, autocomplete, or scrolling."
  }
];

export function AibcAdvertisersMarketing({ afterHero }: { afterHero?: ReactNode }) {
  const [selectedSegment, setSelectedSegment] = useState<string>("engineers");
  
  // Custom Campaign Simulator states
  const [brandName, setBrandName] = useState("Neon");
  const [sponsorText, setSponsorText] = useState("Serverless Postgres built for developers. Scale to zero instantly.");
  const [targetEditor, setTargetEditor] = useState<"vscode" | "cursor" | "windsurf">("cursor");
  const [campaignBudget, setCampaignBudget] = useState(1500); // USD / month
  const [selectedPlacement, setSelectedPlacement] = useState<"status-bar" | "toast">("status-bar");

  // Dynamic FAQ state
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [faqFilter, setFaqFilter] = useState<"all" | "approval" | "safety" | "technical">("all");

  // Dynamic calculated estimations
  const calculatedImpressions = Math.floor(campaignBudget * 42.5);
  const calculatedClicks = Math.floor(campaignBudget * 1.62);
  const calculatedCpm = 23.50;

  const activeSegment = AUDIENCE_SEGMENTS.find(s => s.id === selectedSegment) || AUDIENCE_SEGMENTS[0];

  const useCases = [
    { 
      title: "Launch a dev tool", 
      icon: "🛠️", 
      desc: "Put your API, database, or CLI in front of developers while they configure and ship." 
    },
    { 
      title: "Promote AI products", 
      icon: "🤖", 
      desc: "Reach engineers building with LLMs, agents, and model pipelines every day." 
    },
    { 
      title: "Hire engineers", 
      icon: "🤝", 
      desc: "Show open roles to developers in deep focus — not on a noisy job board." 
    },
    { 
      title: "Drive API signups", 
      icon: "📈", 
      desc: "Get sandbox signups from developers already integrating libraries in their IDE." 
    },
    { 
      title: "Run beta programs", 
      icon: "🧪", 
      desc: "Find power users to test new SDKs and give you real technical feedback." 
    },
    { 
      title: "Fill dev events", 
      icon: "🎟️", 
      desc: "Promote hackathons, workshops, and conferences to the right audience." 
    }
  ];

  return (
    <div className="text-zinc-900 bg-white font-sans selection:bg-emerald-500/20 relative overflow-hidden">
      
      {/* Decorative Grid Overlays */}
      <div className="absolute inset-x-0 top-0 h-[800px] bg-[linear-gradient(to_bottom,rgba(255,255,255,1)_0%,rgba(255,255,255,0)_100%)] z-0 pointer-events-none">
        <svg className="absolute top-0 left-0 w-full h-full opacity-[0.035] stroke-zinc-400" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="advertiser-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#advertiser-grid)" />
        </svg>
      </div>

      {/* Top Floating Glow Points */}
      <div className="absolute top-[-100px] left-[30%] w-[600px] h-[300px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute top-[400px] right-[-200px] w-[500px] h-[400px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none"></div>

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-20 px-6 md:px-12 max-w-7xl mx-auto z-10">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          
          {/* Label Pills */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Pay per view · Go live in minutes
          </div>

          <h1 className="mx-auto max-w-4xl font-brand-heading text-5xl md:text-7xl lg:text-[5.5rem] text-zinc-950 leading-[1.05]">
            Put your brand in front of <BrandAccent>developers.</BrandAccent>
          </h1>

          <p className="mx-auto max-w-2xl text-xl md:text-2xl font-medium leading-snug text-zinc-600">
            One sponsor line in VS Code, Cursor, and Windsurf — while they code. We are onboarding top dev-tool brands now; founding advertisers get first placement when the opening cohort goes live.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <a
              href="#launch"
              className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-10 py-5 text-base font-bold text-white transition-all duration-300 hover:bg-emerald-700 active:scale-95"
            >
              Launch campaign
              <ArrowRight className="w-4 h-4" />
            </a>
            
            <a
              href="#simulator"
              className="border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-900 text-base font-bold rounded-2xl px-10 py-5 transition-all flex items-center justify-center gap-2"
            >
              Preview your ad
            </a>
          </div>

          <p className="text-sm text-zinc-500">
            Manage campaigns after checkout —{" "}
            <Link to="/login" className="font-semibold text-emerald-700 underline">
              sign in with Google
            </Link>
          </p>

          <div className="pt-8 flex flex-wrap justify-center items-center gap-6 text-sm font-bold text-zinc-600">
            <span className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Looks native</span>
            <span className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> No spam filters</span>
            <span className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> 100% developer traffic</span>
          </div>
        </div>
      </section>

      {afterHero}

      {/* INTERACTIVE CAMPAIGN PREVIEW SIMULATOR */}
      <section id="simulator" className="py-24 px-6 border-t border-zinc-200 bg-white relative z-10">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center md:text-left md:flex justify-between items-end mb-16 gap-8">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase text-emerald-700 tracking-widest">Try it now</span>
              <h2 className="font-brand-heading text-4xl md:text-6xl text-zinc-950">
                Build your ad live
              </h2>
              <p className="text-zinc-600 text-base font-medium max-w-xl">
                Type your brand name and message. Pick an editor. See exactly what developers will see — and your estimated reach.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6 md:mt-0 max-w-sm w-full text-left bg-white p-4 border border-zinc-200 rounded-2xl shadow-sm">
              <div>
                <span className="text-[9px] text-zinc-500 uppercase tracking-wider block">Estimated Monthly Clicks</span>
                <span className="text-xl font-bold font-sans text-emerald-450">~{calculatedClicks.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[9px] text-zinc-500 uppercase tracking-wider block">Projected Impressions</span>
                <span className="text-xl font-bold font-sans text-zinc-900">~{calculatedImpressions.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* SIMULATOR CONTROLS - Left Panel */}
            <div className="lg:col-span-5 bg-zinc-900/40 border border-zinc-200 rounded-[2.5rem] p-8 space-y-6 flex flex-col justify-between backdrop-blur-xl">
              <div className="space-y-6">
                <div className="pb-4 border-b border-zinc-200 flex justify-between items-center">
                  <span className="text-sm font-semibold uppercase tracking-wider text-zinc-900 flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-emerald-450" /> Campaign Attributes
                  </span>
                  <span className="text-xs font-mono text-zinc-500">Config: 04.N</span>
                </div>

                {/* Brand Input */}
                <div>
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1.5">Brand / Product Name</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    maxLength={20}
                    className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40 font-mono transition-colors"
                  />
                </div>

                {/* Creative Copy Text */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Sponsor Text narrative</label>
                    <span className="text-[9px] font-mono text-zinc-600">{sponsorText.length}/80 chars</span>
                  </div>
                  <input
                    type="text"
                    value={sponsorText}
                    onChange={(e) => setSponsorText(e.target.value.slice(0, 80))}
                    placeholder="e.g. Serverless server capabilities scaled in seconds."
                    className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-900 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40 transition-colors"
                  />
                  <span className="text-[9px] text-zinc-500 mt-1 block">To maintain IDE elegance, keeps text length below 80 characters.</span>
                </div>

                {/* Target Editor option */}
                <div>
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-2">Primary Target IDE</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["cursor", "vscode", "windsurf"] as const).map((editor) => (
                      <button
                        key={editor}
                        onClick={() => setTargetEditor(editor)}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold capitalize font-mono border transition-all ${
                          targetEditor === editor 
                            ? 'bg-white text-black border-white' 
                            : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-900'
                        }`}
                      >
                        {editor === "vscode" ? "VS Code" : editor}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Placement position mockup selector */}
                <div>
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-2">Placement Format</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedPlacement("status-bar")}
                      className={`p-3 rounded-xl text-left border flex flex-col justify-between h-20 transition-all ${
                        selectedPlacement === "status-bar"
                          ? "bg-emerald-555/5 border-emerald-500/30 text-zinc-900"
                          : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-900"
                      }`}
                    >
                      <span className="text-xs font-semibold">Native Status Bar</span>
                      <span className="text-[9px] text-zinc-500">Subtle background focus text</span>
                    </button>
                    <button
                      onClick={() => setSelectedPlacement("toast")}
                      className={`p-3 rounded-xl text-left border flex flex-col justify-between h-20 transition-all ${
                        selectedPlacement === "toast"
                          ? "bg-emerald-555/5 border-emerald-500/30 text-zinc-900"
                          : "bg-zinc-100 border-zinc-200 text-zinc-600 hover:bg-zinc-900"
                      }`}
                    >
                      <span className="text-xs font-semibold">Launch Companion</span>
                      <span className="text-[9px] text-zinc-500">Interactive workspace action</span>
                    </button>
                  </div>
                </div>

                {/* Budget Tracker Slider */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-zinc-500 lowercase">Campaign Budget</span>
                    <span className="text-zinc-900 font-semibold">${campaignBudget.toLocaleString()} / month</span>
                  </div>
                  <input
                    type="range"
                    min={500}
                    max={15000}
                    step={100}
                    value={campaignBudget}
                    onChange={(e) => setCampaignBudget(Number(e.target.value))}
                    className="w-full accent-emerald-550 bg-zinc-100 h-1.5 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-zinc-650">
                    <span>Min: $500</span>
                    <span>Max: $15,000</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-200 space-y-3">
                <div className="flex justify-between items-center text-xs font-mono text-zinc-500">
                  <span>Targeting Multiplier</span>
                  <span className="text-emerald-450 font-bold">1.0x</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono text-zinc-500">
                  <span>Effective CPM</span>
                  <span className="text-zinc-900 font-medium">${calculatedCpm.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* LIVE PREVIEW CANVAS - Right Panel */}
            <div className="lg:col-span-7 flex flex-col justify-between rounded-[2.5rem] border border-zinc-905 bg-black/60 overflow-hidden relative min-h-[450px]">
              
              {/* Fake Workspace Header Bar */}
              <div className="px-5 py-3 bg-zinc-900/90 border-b border-zinc-950 flex items-center justify-between z-10">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
                </div>
                
                {/* Editor Title tag based on state */}
                <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  {targetEditor === "cursor" ? "Cursor PRO — main.rs" : targetEditor === "vscode" ? "VS Code — app.tsx" : "Windsurf — api_server.py"}
                </div>

                <div className="w-12"></div>
              </div>

              {/* Mock Workspace Content Section */}
              <div className="flex-1 p-6 font-mono text-xs text-zinc-600 space-y-4 relative bg-zinc-100/20 select-none flex flex-col justify-between">
                
                {/* Simulated code block */}
                <div className="space-y-2 opacity-50">
                  <div className="text-zinc-650 flex gap-4"><span className="w-4 text-right">01</span><span className="text-indigo-400">import</span> {"{"} createEngine {"}"} <span className="text-indigo-400">from</span> <span className="text-emerald-400">"aibc-studio-core"</span>;</div>
                  <div className="text-zinc-650 flex gap-4"><span className="w-4 text-right">02</span><span className="text-zinc-550">// Initialize focus sponsorship network</span></div>
                  <div className="text-zinc-650 flex gap-4"><span className="w-4 text-right">03</span><span className="text-zinc-405">const</span> engine = <span className="text-blue-400">await</span> createEngine({"{"}</div>
                  <div className="text-zinc-650 flex gap-4"><span className="w-4 text-right">04</span>  sponsorRateMultiplier: <span className="text-orange-400">1.25</span>,</div>
                  <div className="text-zinc-650 flex gap-4"><span className="w-4 text-right">05</span>  preferredVerticals: [<span className="text-emerald-400">"developer-infrastructure"</span>]</div>
                  <div className="text-zinc-650 flex gap-4"><span className="w-4 text-right">06</span>{"}"});</div>
                  <div className="text-zinc-650 flex gap-4"><span className="w-4 text-right">07</span><span className="text-indigo-400">export</span> <span className="text-zinc-405">const</span> runSession = () =&gt; engine.verifyState();</div>
                </div>

                {/* TOAST NOTIFICATION PREVIEW PANEL (if that format selected) */}
                {selectedPlacement === "toast" && (
                  <div className="absolute right-6 bottom-6 max-w-sm w-full bg-zinc-900 border border-zinc-200 rounded-2xl p-4 shadow-2xl animate-fade-in z-20 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] font-bold text-zinc-900 uppercase tracking-wider">{brandName}</span>
                      </div>
                      <span className="text-[8px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded uppercase font-mono tracking-widest leading-none">Sponsored</span>
                    </div>
                    <p className="text-xs text-zinc-700 font-light leading-relaxed">
                      {sponsorText || "Your sponsorship story displayed elegantly inside native notification segments."}
                    </p>
                    <div className="flex gap-2 pt-1 justify-end">
                      <button className="bg-white text-black font-semibold text-[10px] px-3 py-1 rounded" disabled>Try Live</button>
                    </div>
                  </div>
                )}

                {/* Background visual graphics */}
                <div className="text-center py-6 opacity-30 select-none">
                  <div className="inline-block border border-dashed border-zinc-200 p-4 rounded-xl">
                    <div className="text-[11px] text-zinc-500">Live Workspace Simulator Output</div>
                    <div className="text-zinc-600 text-[10px] mt-1">Sponsorship message rendered nondisruptively below</div>
                  </div>
                </div>
              </div>

              {/* STATUS BAR NATIVE PLACEMENT PANEL (if status-bar format selected) */}
              <div className="bg-zinc-900 border-t border-zinc-950 px-5 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 z-10">
                <div className="flex items-center gap-2.5">
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider leading-none">Sponsor</span>
                  <div className="text-xs text-zinc-700 font-medium">
                    <span className="text-emerald-400 font-semibold">{brandName}</span>
                    <span className="text-zinc-500 px-1.5">|</span>
                    <span className="text-zinc-600 leading-tight font-light">{sponsorText || "Your custom narrative details populate here dynamically."}</span>
                  </div>
                </div>
                
                <span className="text-[10px] font-mono text-zinc-500 self-end sm:self-auto uppercase tracking-widest">
                  LN 12, COL 4
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY FLUX: MARKET EFFICIENCY COMPARISON */}
      <section className="py-32 px-6 md:px-12 border-t border-zinc-200 bg-white relative z-10">
        <div className="max-w-5xl mx-auto">
          
          <div className="text-center mb-20 space-y-3">
            <span className="text-xs font-bold uppercase text-emerald-700 tracking-widest block">Why us</span>
            <h2 className="font-brand-heading text-4xl md:text-6xl text-zinc-950">
              Better than banner ads
            </h2>
            <p className="text-base text-zinc-600 max-w-lg mx-auto font-medium">
              Developers ignore browser ads. They do not ignore their editor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            <div className="p-8 rounded-3xl border border-zinc-200 bg-white shadow-sm space-y-6">
              <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-500 mb-2">
                <BadgeAlert className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-zinc-950 border-b border-zinc-100 pb-3">Traditional ad networks</h3>
              <ul className="space-y-4">
                {[
                  { title: "Expensive middlemen", desc: "Most of your budget goes to agencies and tracking layers — not reach." },
                  { title: "Wrong moment", desc: "Developers scroll past banners on news sites and social feeds." },
                  { title: "Ad blindness", desc: "Pop-ups, sidebars, and cookie banners get ignored or blocked." }
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3.5 items-start">
                    <span className="text-red-500 text-sm font-bold shrink-0 mt-0.5">✕</span>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900">{item.title}</h4>
                      <p className="text-sm text-zinc-600 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 rounded-3xl border border-emerald-200 bg-emerald-50/50 space-y-6 relative overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-2">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-emerald-800 border-b border-emerald-200 pb-3">AIBC Media</h3>
              <ul className="space-y-4">
                {[
                  { title: "Right place, right time", desc: "Your ad shows while developers code — 6–8 hours of focused attention daily." },
                  { title: "Smart targeting", desc: "Filter by language, editor, and project type. No private code is ever collected." },
                  { title: "Developers get paid too", desc: "70% goes to the coder. That keeps ads trusted — and clicked." }
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3.5 items-start">
                    <Check className="text-emerald-600 w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900">{item.title}</h4>
                      <p className="text-sm text-zinc-600 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* DYNAMIC AUDIENCE SEGMENTS & GEOGRAPHICS */}
      <section className="py-32 px-6 md:px-12 border-t border-zinc-200 bg-white relative z-10">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-16 space-y-3">
            <span className="text-xs font-bold uppercase text-emerald-700 tracking-widest block">Your audience</span>
            <h2 className="font-brand-heading text-4xl md:text-6xl text-zinc-950">
              Who you will reach
            </h2>
            <p className="text-base text-zinc-600 max-w-md mx-auto font-medium">
              Engineers, founders, and indie builders — spending hours in their editor every day.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Segment Selector Buttons (Left side) */}
            <div className="lg:col-span-4 space-y-2">
              {AUDIENCE_SEGMENTS.map((segment) => (
                <button
                  key={segment.id}
                  onClick={() => setSelectedSegment(segment.id)}
                  className={`w-full p-4 rounded-xl text-left border flex items-center justify-between transition-all ${
                    selectedSegment === segment.id 
                      ? 'bg-emerald-50 border-emerald-200 text-zinc-950 shadow-sm' 
                      : 'bg-white border-zinc-200 text-zinc-600 hover:border-emerald-200 hover:text-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{segment.icon}</span>
                    <span className="text-xs font-semibold tracking-tight">{segment.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-550">{segment.concentration}</span>
                </button>
              ))}
            </div>

            {/* Selected Segment Details Visual (Right side) */}
            <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 p-16 bg-emerald-500/5 blur-[60px] rounded-full pointer-events-none"></div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
                  <span className="text-md font-bold text-zinc-900 font-mono flex items-center gap-2">
                    {activeSegment.icon} {activeSegment.name}
                  </span>
                  <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono">{activeSegment.concentration}</span>
                </div>

                <p className="text-sm text-zinc-600 leading-relaxed font-medium">
                  {activeSegment.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold mb-1">Focus time</span>
                    <span className="text-base font-bold text-zinc-950">{activeSegment.focusHours}</span>
                  </div>
                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold mb-1">Top languages</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {activeSegment.primaryLanguages.map((l, i) => (
                        <span key={i} className="text-[10px] bg-white text-zinc-700 border border-zinc-200 px-1.5 py-0.5 rounded font-medium">{l}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold mb-1">Main editor</span>
                    <span className="text-sm font-bold text-zinc-950 block mt-0.5">{activeSegment.ideChoice}</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 mt-6 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-zinc-600 font-medium max-w-sm">
                  Want to target this group? Launch a campaign and pick your audience filters.
                </p>
                <a href="#launch" className="text-sm text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1.5 transition-colors">
                  Launch campaign <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* LAUNCH PARTNER ADVANTAGE SECTION */}
      <section className="py-32 px-6 md:px-12 border-t border-zinc-200 bg-white relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-bold uppercase text-emerald-700 tracking-widest block">Early access</span>
              <h2 className="font-brand-heading text-4xl md:text-6xl text-zinc-950">
                Founding partner perks
              </h2>
              <p className="text-base text-zinc-600 font-medium leading-relaxed max-w-md">
                We are taking <span className="text-zinc-950 font-bold">25 founding advertisers</span>. Get better rates, a free first campaign, and direct input on the product.
              </p>
              
              <div className="space-y-3 pt-2">
                <div className="flex gap-2.5 items-start">
                  <Check className="text-emerald-600 w-4 h-4 shrink-0 mt-0.5" />
                  <span className="text-sm text-zinc-700 font-medium">Locked-in pricing on renewals.</span>
                </div>
                <div className="flex gap-2.5 items-start">
                  <Check className="text-emerald-600 w-4 h-4 shrink-0 mt-0.5" />
                  <span className="text-sm text-zinc-700 font-medium">Direct line to our team for campaign help.</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: "First campaign free", desc: "Test reach and clicks with zero risk before you scale spend." },
                { title: "Lower CPM rates", desc: "Founding partners lock in discounted pricing forever." },
                { title: "Priority placement", desc: "Your ad gets prime position in the editor spinner." },
                { title: "Developer feedback", desc: "Hear what coders think about your product — directly." },
                { title: "Founding partner badge", desc: "Show you were an early believer on your dashboard." }
              ].map((benefit, i) => (
                <div key={i} className="p-6 rounded-2xl border border-zinc-200 bg-white shadow-sm space-y-3 hover:border-emerald-200 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Check className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-zinc-950">{benefit.title}</h4>
                  <p className="text-sm text-zinc-600 leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES & ANALYTICS DATA UTILITIES */}
      <section className="py-32 px-6 md:px-12 border-t border-zinc-200 bg-white relative z-10">
        <div className="max-w-5xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase text-emerald-700 tracking-widest block">Included</span>
              <h2 className="font-brand-heading text-4xl md:text-6xl text-zinc-950">
                Everything you get
              </h2>
              <p className="text-base text-zinc-600 font-medium max-w-sm">
                Real-time stats, click tracking, and a dedicated team to help your campaign perform.
              </p>
            </div>

            <div className="lg:col-span-7 col-span-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Native placement", metric: "Shows inside VS Code, Cursor, and Windsurf" },
                { label: "Live dashboard", metric: "Track impressions and spend in real time" },
                { label: "Click tracking", metric: "UTM tags work with your existing analytics" },
                { label: "Impression reports", metric: "See exactly how many devs saw your ad" },
                { label: "Audience filters", metric: "Target by language, editor, and project type" },
                { label: "Account support", metric: "A real person helps you launch and optimize" }
              ].map((item, index) => (
                <div key={index} className="flex gap-3.5 items-start p-4 border border-zinc-200 bg-white rounded-xl hover:border-emerald-200 transition-colors shadow-sm">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-zinc-950 block">{item.label}</span>
                    <span className="text-sm text-zinc-600 mt-0.5 block leading-normal">{item.metric}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* EXAMPLE USE CASES GRID */}
      <section className="py-32 px-6 md:px-12 border-t border-zinc-200 bg-white relative z-10">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-20 space-y-3">
            <span className="text-xs font-bold uppercase text-emerald-700 tracking-widest mb-3 block">Use cases</span>
            <h2 className="font-brand-heading text-4xl md:text-6xl text-zinc-950">
              What you can promote
            </h2>
            <p className="text-zinc-600 text-base font-medium max-w-md mx-auto">
              If developers use it while they build, you can advertise it here.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
              <div key={index} className="p-8 rounded-2xl border border-zinc-200 bg-white shadow-sm hover:border-emerald-200 hover:shadow-md transition-all duration-300 flex flex-col justify-between">
                <div>
                  <span className="text-3xl mb-5 block">{useCase.icon}</span>
                  <h3 className="text-base font-bold text-zinc-950 mb-2">{useCase.title}</h3>
                  <p className="text-sm text-zinc-600 leading-relaxed">{useCase.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ADVERTISER FAQ SECTION */}
      <section id="advertiser-faq" className="py-32 px-6 md:px-12 border-t border-zinc-200 bg-white relative z-10">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-16 space-y-3">
            <span className="text-xs font-bold uppercase text-emerald-700 tracking-widest block">FAQ</span>
            <h2 className="font-brand-heading text-4xl md:text-6xl text-zinc-950">
              Common questions
            </h2>
            <p className="text-zinc-600 text-base font-medium max-w-xl mx-auto">
              Approval times, brand safety, ad formats, and tracking — answered plainly.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-10 border-b border-zinc-200 pb-6">
            {[
              { id: "all", label: "All" },
              { id: "approval", label: "Approval" },
              { id: "safety", label: "Brand safety" },
              { id: "technical", label: "Technical" }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setFaqFilter(cat.id as "all" | "approval" | "safety" | "technical");
                  setActiveFaq(null);
                }}
                className={`py-2 px-4 rounded-xl text-sm font-bold border transition-all duration-200 ${
                  faqFilter === cat.id
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-white text-zinc-600 border-zinc-200 hover:border-emerald-300 hover:text-zinc-900"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* FAQ Accordion List */}
          <div className="space-y-4">
            {FAQ_ITEMS.filter(item => faqFilter === "all" || item.category === faqFilter).map((item) => {
              const isOpen = activeFaq === item.id;
              return (
                <div 
                  key={item.id} 
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen 
                      ? "bg-white border-emerald-200 shadow-md" 
                      : "bg-white border-zinc-200 hover:border-emerald-200 shadow-sm"
                  }`}
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : item.id)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 select-none"
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-sm md:text-base font-bold text-zinc-950 pr-4 leading-snug">
                        {item.question}
                      </span>
                    </div>
                    <span className="text-zinc-500 shrink-0 bg-emerald-50 p-1.5 rounded-lg border border-emerald-100">
                      {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </span>
                  </button>

                  <div 
                    className={`transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-60 opacity-100 border-t border-zinc-100" : "max-h-0 opacity-0 pointer-events-none"
                    }`}
                  >
                    <div className="px-6 py-5 bg-white text-sm md:text-base text-zinc-600 font-medium leading-relaxed">
                      <p>{item.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center py-6 px-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
            <p className="text-zinc-700 text-sm font-medium">
              Still have questions?
            </p>
            <p className="text-sm mt-1.5">
              <a href="#launch" className="text-emerald-700 hover:text-emerald-800 font-bold transition-colors inline-flex items-center justify-center gap-1">
                Launch your campaign <ArrowRight className="w-3 h-3" />
              </a>
            </p>
          </div>

        </div>
      </section>

      <section id="apply-form" className="py-32 px-6 bg-white border-t border-zinc-200 relative z-10 overflow-hidden">
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-xl mx-auto relative z-10 space-y-8 text-center">
          <span className="text-xs font-bold uppercase text-emerald-700 tracking-widest block">Ready to go live</span>
          <h2 className="font-brand-heading text-4xl md:text-6xl text-zinc-950">
            Launch with Stripe
          </h2>
          <p className="text-zinc-600 text-lg font-medium max-w-md mx-auto leading-relaxed">
            Set your bid. Pay with Stripe. Your campaign joins the live auction instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a
              href="#launch"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold rounded-2xl px-10 py-4 transition-all flex items-center justify-center gap-2"
            >
              Launch campaign
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              to="/advertisers/apply"
              className="border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-900 text-base font-bold rounded-2xl px-10 py-4 transition-all flex items-center justify-center"
            >
              Apply as founding partner
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
