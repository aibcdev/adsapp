import { useEffect, useState } from "react";

const STEPS = [
  {
    id: 1,
    title: "Install",
    description: "One click — VS Code, Cursor, Windsurf, or Open VSX. Free forever.",
    image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=2670&auto=format&fit=crop",
    action: "Install free",
    href: "#install",
  },
  {
    id: 2,
    title: "Code",
    description: "Keep working. A tiny sponsored line shows in the spinner while AI loads — same spot, not a popup.",
    image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2574&auto=format&fit=crop",
    action: "See the spinner",
    href: "#spinner",
  },
  {
    id: 3,
    title: "Get paid",
    description: "You keep 70%. Cash out via PayPal, Wise, or UPI when you hit $5. 72-hour hold on new earnings.",
    image: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=2574&auto=format&fit=crop",
    action: "Open dashboard",
    href: "/dashboard",
  },
];

export function HowItWorksScroll() {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const step = parseInt(entry.target.getAttribute("data-step") || "1", 10);
            setActiveStep(step);
          }
        });
      },
      { root: null, rootMargin: "-40% 0px -40% 0px", threshold: 0 },
    );

    const steps = document.querySelectorAll(".process-step");
    steps.forEach((step) => observer.observe(step));
    return () => steps.forEach((step) => observer.unobserve(step));
  }, []);

  return (
    <section className="relative border-b border-zinc-900/50 bg-zinc-950" id="process">
      <div className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="relative hidden min-h-screen border-r border-zinc-900/50 lg:block">
            <div className="sticky top-0 flex h-screen w-full items-center justify-center p-12 lg:p-16">
              <div className="relative flex h-[85vh] max-h-[800px] w-full items-start">
                <div className="relative h-full w-3/4 overflow-hidden rounded-2xl">
                  {STEPS.map((step) => (
                    <img
                      key={step.id}
                      src={step.image}
                      className={`process-img grayscale opacity-90 ${activeStep === step.id ? "active" : "inactive"}`}
                      alt={step.title}
                    />
                  ))}
                </div>
                <div className="absolute -right-4 top-8 z-20">
                  <span className="font-instrument-serif text-7xl tracking-tight text-zinc-100/90 transition-all duration-500 lg:text-8xl">
                    {String(activeStep).padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex flex-col gap-32 px-6 py-24 md:px-12 md:py-32 lg:gap-64">
            <div className="mb-8 lg:hidden">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-zinc-400 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                How it works
              </div>
              <h2 className="font-instrument-serif text-4xl tracking-tight text-white md:text-5xl">Three steps</h2>
            </div>

            {STEPS.map((step) => (
              <div
                key={step.id}
                className="process-step group flex min-h-[40vh] flex-col justify-center"
                data-step={step.id}
              >
                <span className="mb-6 block font-instrument-serif text-6xl text-zinc-700 lg:hidden">
                  {String(step.id).padStart(2, "0")}
                </span>
                <h3 className="mb-8 font-instrument-serif text-4xl tracking-tight text-zinc-100 transition-colors group-hover:text-white md:text-5xl lg:text-6xl">
                  {step.title}
                </h3>
                <p className="mb-10 max-w-lg text-lg font-light leading-relaxed text-zinc-400 md:text-xl">
                  {step.description}
                </p>
                <a
                  href={step.href}
                  className="w-fit border-b border-zinc-600 pb-1 text-sm font-medium uppercase tracking-widest text-white transition-all hover:border-white hover:text-emerald-400"
                >
                  {step.action}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
