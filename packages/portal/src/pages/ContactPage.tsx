import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Mail, MessageSquare, Send } from "lucide-react";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { BrandHeading } from "../components/brand/BrandHeading";
import {
  buildContactMailto,
  CONTACT_TOPICS,
  submitContactMessage,
  SUPPORT_EMAIL,
  type ContactTopic,
} from "../lib/contact";

const inputClass =
  "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

const QUICK_LINKS = [
  {
    title: "Developers",
    desc: "Install the extension or check your earnings.",
    href: "/#install",
    cta: "Get started",
  },
  {
    title: "Advertisers",
    desc: "Run campaigns inside developer tools.",
    href: "/advertisers",
    cta: "View options",
  },
  {
    title: "Publishers",
    desc: "Monetize your platform audience.",
    href: "/publishers",
    cta: "Learn more",
  },
];

export function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<ContactTopic>("general");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      topic,
      message: message.trim(),
    };
    submitContactMessage(payload);
    window.location.href = buildContactMailto(payload);
    setDone(true);
  };

  return (
    <div className="app-shell">
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-zinc-200 pt-32 pb-16 lg:pt-40 lg:pb-20">
        <div className="absolute top-0 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
        <div className="relative mx-auto max-w-4xl px-6 text-center md:px-12">
          <p className="font-mono text-xs uppercase tracking-widest text-emerald-600">Contact</p>
          <BrandHeading as="h1" className="mt-4 text-4xl leading-tight text-zinc-900 md:text-5xl lg:text-6xl">
            Get in touch
          </BrandHeading>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600">
            Questions about payouts, advertising, partnerships, or privacy — send us a message and we&apos;ll reply
            within 1–2 business days.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 md:px-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
            {done ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Check className="h-7 w-7" />
                </div>
                <h2 className="font-brand-heading text-3xl text-zinc-900">Message ready to send</h2>
                <p className="mt-3 text-sm text-zinc-600">
                  Your email app should have opened. If it didn&apos;t, email us directly at{" "}
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-emerald-700 hover:underline">
                    {SUPPORT_EMAIL}
                  </a>
                  .
                </p>
                <button
                  type="button"
                  onClick={() => setDone(false)}
                  className="mt-8 text-sm font-semibold text-emerald-700 hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900">Send a message</h2>
                    <p className="text-sm text-zinc-500">All fields required</p>
                  </div>
                </div>

                <form onSubmit={submit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-zinc-700">
                        Name
                      </label>
                      <input
                        id="contact-name"
                        required
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputClass}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-zinc-700">
                        Email
                      </label>
                      <input
                        id="contact-email"
                        required
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClass}
                        placeholder="you@company.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-topic" className="mb-1.5 block text-sm font-medium text-zinc-700">
                      Topic
                    </label>
                    <select
                      id="contact-topic"
                      required
                      value={topic}
                      onChange={(e) => setTopic(e.target.value as ContactTopic)}
                      className={inputClass}
                    >
                      {CONTACT_TOPICS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-zinc-700">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className={`${inputClass} resize-y min-h-[160px]`}
                      placeholder="How can we help?"
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Send message
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900">Email us directly</h3>
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="mt-2 inline-block text-sm font-semibold text-emerald-700 hover:underline"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                  <p className="mt-2 text-sm text-zinc-600">For support, legal, and privacy questions.</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h3 className="font-bold text-zinc-900">Website</h3>
              <a
                href="https://aibcmedia.com"
                className="mt-2 inline-block text-sm font-semibold text-emerald-700 hover:underline"
              >
                aibcmedia.com
              </a>
            </div>

            <div className="space-y-3">
              <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">Quick links</p>
              {QUICK_LINKS.map((link) => (
                <div
                  key={link.title}
                  className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-4"
                >
                  <div>
                    <p className="font-semibold text-zinc-900">{link.title}</p>
                    <p className="text-sm text-zinc-600">{link.desc}</p>
                  </div>
                  <Link to={link.href} className="shrink-0 text-sm font-semibold text-emerald-700 hover:underline">
                    {link.cta}
                  </Link>
                </div>
              ))}
            </div>

            <p className="text-xs leading-relaxed text-zinc-500">
              See our{" "}
              <Link to="/privacy" className="text-emerald-700 hover:underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link to="/terms" className="text-emerald-700 hover:underline">
                Terms of Service
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
