import { useEffect, useRef, useState, type ReactNode } from "react";

export function ScrollReveal({
  children,
  width = "fit-content",
  delay = 0,
}: {
  children: ReactNode;
  width?: "100%" | "fit-content";
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "50px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ width, transitionDelay: `${delay}ms` }}
      className={`transform transition-all duration-1000 ease-out ${
        isVisible ? "translate-y-0 opacity-100 blur-0" : "translate-y-20 opacity-0 blur-sm"
      }`}
    >
      {children}
    </div>
  );
}
