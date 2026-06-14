import { LegalLayout } from "../components/LegalLayout";

const NAV = [
  { id: "summary", label: "Data summary" },
  { id: "overview", label: "Overview" },
  { id: "permissions", label: "Extension permissions" },
  { id: "collect", label: "Data we collect" },
  { id: "not-collect", label: "Data we do NOT collect" },
  { id: "use", label: "How we use data" },
  { id: "sharing", label: "Third parties" },
  { id: "security", label: "Security & retention" },
  { id: "rights", label: "Your rights" },
  { id: "contact", label: "Contact" },
];

export function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" badge="Privacy first" updated="June 2026" nav={NAV}>
      <section id="summary">
        <h2>Data practices summary</h2>
        <p>
          aibc (&ldquo;we&rdquo;, &ldquo;our&rdquo;) operates the aibc VS Code extension, CLI tools, API, and
          website at <a href="https://aibcmedia.com">aibcmedia.com</a>. This policy describes what we collect and
          what we never touch.
        </p>
        <div className="not-prose my-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="p-3">Data type</th>
                <th className="p-3">Collected?</th>
                <th className="p-3">Purpose</th>
                <th className="p-3">Retention</th>
              </tr>
            </thead>
            <tbody className="text-aibc-muted">
              <tr className="border-b"><td className="p-3">Email</td><td className="p-3">Yes</td><td className="p-3">Account & payouts</td><td className="p-3">Until deletion</td></tr>
              <tr className="border-b"><td className="p-3">Ad impressions / clicks</td><td className="p-3">Yes</td><td className="p-3">Earnings & fraud prevention</td><td className="p-3">7 years (legal)</td></tr>
              <tr className="border-b"><td className="p-3">Session tokens</td><td className="p-3">Yes</td><td className="p-3">Verify valid ad views</td><td className="p-3">~2 minutes</td></tr>
              <tr className="border-b"><td className="p-3">IDE / platform name</td><td className="p-3">Optional</td><td className="p-3">Aggregated analytics</td><td className="p-3">7 years</td></tr>
              <tr className="border-b"><td className="p-3">Source code</td><td className="p-3">Never</td><td className="p-3">—</td><td className="p-3">—</td></tr>
              <tr className="border-b"><td className="p-3">AI prompts / conversations</td><td className="p-3">Never</td><td className="p-3">—</td><td className="p-3">—</td></tr>
              <tr><td className="p-3">Browsing history</td><td className="p-3">Never</td><td className="p-3">—</td><td className="p-3">—</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="overview">
        <h2>Overview</h2>
        <p>
          <strong>Core commitment:</strong> We never read, store, or transmit your prompts, source code, or AI
          conversation content. aibc shows a <em>single sponsored line</em> in the AI wait spinner — we monetize
          idle time, not your intellectual property.
        </p>
      </section>

      <section id="permissions">
        <h2>Extension permissions</h2>
        <ul>
          <li><strong>Network</strong> — Fetch ads, report impressions, authenticate your account.</li>
          <li><strong>Local filesystem</strong> — Patch Claude Code spinner (with backup) and CLI status line. Restored on uninstall.</li>
          <li><strong>Loopback server</strong> — Local-only HTTP on 127.0.0.1 for click/view attribution. Token never stored in shared globalState.</li>
        </ul>
        <p>We do not request broad host permissions on websites. We do not inject ads into Bolt, Lovable, or v0 web UIs — only the terminal/IDE spinner line where configured.</p>
      </section>

      <section id="collect">
        <h2>Data we collect</h2>
        <h3>Account</h3>
        <ul>
          <li>Email (Google OAuth or email sign-in)</li>
          <li>Client ID and auth tokens</li>
          <li>Payout method handle (PayPal, Wise, or UPI)</li>
        </ul>
        <h3>Usage (for earnings)</h3>
        <ul>
          <li>Ad impression and view-threshold events</li>
          <li>Ad clicks (via loopback redirect)</li>
          <li>Portfolio session tokens (short-lived)</li>
          <li>Anonymous device ID (hashed) for demo mode</li>
        </ul>
        <h3>Analytics (optional)</h3>
        <ul>
          <li>Extension install/activate events via PostHog if enabled</li>
          <li>Sidebar tab views and card clicks in the aibc panel</li>
        </ul>
      </section>

      <section id="not-collect">
        <h2>Data we do NOT collect</h2>
        <ul>
          <li>Source code, repositories, or file contents</li>
          <li>Prompts, chat history, or AI responses</li>
          <li>Terminal command history</li>
          <li>Clipboard data or keystrokes outside the ad line</li>
          <li>General browsing history</li>
          <li>Location or device advertising IDs</li>
        </ul>
      </section>

      <section id="use">
        <h2>How we use your data</h2>
        <ul>
          <li>Calculate and pay your 70% revenue share</li>
          <li>Prevent fraud (session tokens, rate limits, impression ordering)</li>
          <li>Run advertiser campaigns and aggregated reporting</li>
          <li>Improve the product with anonymized metrics</li>
          <li>Send service emails (payout status, policy updates)</li>
        </ul>
      </section>

      <section id="sharing">
        <h2>Third parties</h2>
        <p>We do not sell personal data. Service providers may include:</p>
        <ul>
          <li><strong>Google</strong> — OAuth sign-in (email, profile)</li>
          <li><strong>Stripe</strong> — Advertiser payments and optional deposits</li>
          <li><strong>PostHog</strong> — Optional product analytics</li>
          <li><strong>DigitalOcean</strong> — API hosting</li>
          <li><strong>Netlify</strong> — Website hosting</li>
        </ul>
        <p>Advertisers receive only aggregated, anonymized campaign stats — never your email or identity.</p>
      </section>

      <section id="security">
        <h2>Security & retention</h2>
        <ul>
          <li>HTTPS/TLS for all API traffic</li>
          <li>Auth tokens stored locally and in encrypted sessions server-side</li>
          <li>Impression records retained up to 7 years where required for tax/audit</li>
          <li>Account deletion: personal data removed within 30 days; financial records may be retained as required by law</li>
        </ul>
      </section>

      <section id="rights">
        <h2>Your rights</h2>
        <p>You may request access, correction, deletion, or export of your data. Contact us below — we respond within 30 days.</p>
        <p>aibc is not intended for users under 18.</p>
      </section>

      <section id="contact">
        <h2>Contact</h2>
        <p>
          Privacy questions: <a href="mailto:watchaibc@gmail.com">watchaibc@gmail.com</a>
        </p>
        <p>
          Website: <a href="https://aibcmedia.com">https://aibcmedia.com</a>
        </p>
      </section>
    </LegalLayout>
  );
}
