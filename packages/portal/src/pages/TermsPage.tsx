import { LegalLayout } from "../components/LegalLayout";

const NAV = [
  { id: "acceptance", label: "Acceptance" },
  { id: "service", label: "Service description" },
  { id: "eligibility", label: "Eligibility" },
  { id: "account", label: "Your account" },
  { id: "earnings", label: "Earnings & payouts" },
  { id: "advertisers", label: "Advertisers" },
  { id: "conduct", label: "User conduct" },
  { id: "ip", label: "Intellectual property" },
  { id: "disclaimers", label: "Disclaimers" },
  { id: "liability", label: "Limitation of liability" },
  { id: "termination", label: "Termination" },
  { id: "contact", label: "Contact" },
];

export function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" badge="Legal" updated="June 2026" nav={NAV}>
      <section id="acceptance">
        <h2>Acceptance of terms</h2>
        <p>
          By installing the aibc extension, using our CLI, website, or API (&ldquo;Service&rdquo;), you agree to
          these Terms. If you disagree, do not use the Service.
        </p>
      </section>

      <section id="service">
        <h2>Service description</h2>
        <p>
          aibc displays <strong>single-line, non-intrusive</strong> sponsored messages during AI wait states (e.g.
          the Claude Code spinner or terminal status line). Developers earn a revenue share. Advertisers prepay for
          inventory via live auction or dashboard campaigns.
        </p>
        <p>The Service includes:</p>
        <ul>
          <li>The aibc VS Code extension (VS Code, Cursor, Windsurf, Open VSX)</li>
          <li>CLI tools for terminal status-line integration</li>
          <li>The aibc dashboard and API at aibcmedia.com</li>
        </ul>
        <p>
          aibc is <strong>not</strong> a full-screen or popup ad network. Ad format is limited to one sponsored line
          in the spinner or status bar.
        </p>
      </section>

      <section id="eligibility">
        <h2>Eligibility</h2>
        <ul>
          <li>You must be at least 18 years old</li>
          <li>You must provide accurate registration information</li>
          <li>You must comply with applicable laws in your jurisdiction</li>
        </ul>
      </section>

      <section id="account">
        <h2>Your account</h2>
        <ul>
          <li>One account per person — multiple accounts to inflate earnings is prohibited</li>
          <li>You are responsible for securing your credentials</li>
          <li>Notify us immediately of unauthorized access</li>
        </ul>
      </section>

      <section id="earnings">
        <h2>Earnings & payouts</h2>
        <h3>Earning money</h3>
        <ul>
          <li>Developers receive <strong>70%</strong> of attributed ad revenue</li>
          <li>Earnings require valid impressions (view threshold + session verification)</li>
          <li>Rates vary with advertiser bids and demand</li>
          <li>We may withhold or forfeit earnings for fraud or Terms violations</li>
        </ul>
        <h3>Payouts</h3>
        <ul>
          <li>Minimum payout: <strong>$10.00 USD</strong></li>
          <li>72-hour settlement hold after each credited impression</li>
          <li>Payout methods: PayPal, Wise, or UPI (manual processing)</li>
          <li>You are responsible for taxes on your earnings</li>
        </ul>
        <p>
          <strong>Fraud prevention:</strong> Bots, forged metrics, loopback abuse, or artificial impressions will
          result in account termination and forfeiture of earnings.
        </p>
      </section>

      <section id="advertisers">
        <h2>Advertisers</h2>
        <ul>
          <li>Campaigns must promote legitimate developer tools or services</li>
          <li>Ad lines must be accurate and comply with applicable advertising law</li>
          <li>Prepaid campaign spend via Stripe is generally non-refundable except where required by law</li>
          <li>We may pause campaigns that violate policy or harm user experience</li>
          <li>Highest bid serves first in the live auction; inventory is not guaranteed</li>
        </ul>
      </section>

      <section id="conduct">
        <h2>User conduct</h2>
        <p>You agree NOT to:</p>
        <ul>
          <li>Generate fake impressions or clicks (scripts, bots, emulators)</li>
          <li>Click your own ads or coordinate artificial engagement</li>
          <li>Reverse engineer, tamper with, or bypass fraud controls</li>
          <li>Interfere with Claude Code or third-party software beyond aibc&apos;s documented integration</li>
          <li>Use the Service for illegal purposes</li>
        </ul>
      </section>

      <section id="ip">
        <h2>Intellectual property</h2>
        <p>
          aibc, its logo, and the Service are owned by aibc. You receive a limited, revocable license to use the
          extension for personal earning purposes. Advertisers retain rights to their ad copy and trademarks.
        </p>
      </section>

      <section id="disclaimers">
        <h2>Disclaimers</h2>
        <p>
          THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; WITHOUT WARRANTIES OF ANY KIND. We do not guarantee minimum
          earnings, uninterrupted service, or compatibility with every IDE or AI tool version. Claude Code and
          third-party products may update independently; we work to restore compatibility but cannot guarantee
          instant support for every release.
        </p>
      </section>

      <section id="liability">
        <h2>Limitation of liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, aibc SHALL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, OR
          CONSEQUENTIAL DAMAGES. Total liability shall not exceed earnings paid to you in the twelve months before
          the claim.
        </p>
      </section>

      <section id="termination">
        <h2>Termination</h2>
        <p>
          You may stop using the Service anytime by uninstalling the extension (which restores Claude Code settings).
          We may suspend or terminate accounts for Terms violations. Pending earnings may be forfeited if termination
          is due to fraud.
        </p>
      </section>

      <section id="contact">
        <h2>Contact</h2>
        <p>
          Legal & support: use our <a href="/contact">contact form</a>.
        </p>
        <p>
          See also our <a href="/privacy">Privacy Policy</a>.
        </p>
      </section>
    </LegalLayout>
  );
}
