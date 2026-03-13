import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy — fayth.life",
  description: "How fayth.life uses cookies.",
};

export default function CookiePolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-2">Cookie Policy</h1>
      <p className="text-sm text-muted mb-8">Last updated: March 13, 2026</p>

      <div className="prose prose-sm max-w-none text-foreground/90 space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-foreground">What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device by your web browser. They are used to
            remember information about your visit.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Cookies We Use</h2>
          <p>
            fayth.life uses <strong>only strictly necessary cookies</strong> required for the application
            to function. We do not use analytics, advertising, or tracking cookies.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm border border-border rounded-lg">
              <thead>
                <tr className="bg-primary-50">
                  <th className="text-left p-3 border-b border-border">Cookie</th>
                  <th className="text-left p-3 border-b border-border">Purpose</th>
                  <th className="text-left p-3 border-b border-border">Duration</th>
                  <th className="text-left p-3 border-b border-border">Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border-b border-border font-mono text-xs">sb-*-auth-token</td>
                  <td className="p-3 border-b border-border">Supabase authentication session</td>
                  <td className="p-3 border-b border-border">Session / 1 hour</td>
                  <td className="p-3 border-b border-border">Essential</td>
                </tr>
                <tr>
                  <td className="p-3 border-b border-border font-mono text-xs">otp_pending</td>
                  <td className="p-3 border-b border-border">Stores hashed OTP for email verification</td>
                  <td className="p-3 border-b border-border">5 minutes</td>
                  <td className="p-3 border-b border-border">Essential</td>
                </tr>
                <tr>
                  <td className="p-3 border-b border-border font-mono text-xs">otp_verified</td>
                  <td className="p-3 border-b border-border">Confirms OTP verification status</td>
                  <td className="p-3 border-b border-border">24 hours</td>
                  <td className="p-3 border-b border-border">Essential</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Local Storage</h2>
          <p>
            In addition to cookies, we use your browser&apos;s local storage and session storage to maintain
            assessment state during your visit:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Session storage:</strong> Current assessment progress (cleared when tab closes)</li>
            <li><strong>Local storage:</strong> Assessment history, session ID, game score history, report data</li>
          </ul>
          <p className="mt-2">
            You can clear this data at any time through your browser settings or via the assessment
            history page.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Managing Cookies</h2>
          <p>
            You can control and delete cookies through your browser settings. Note that disabling
            essential cookies may prevent the authentication features from working properly. The
            assessment can still be used anonymously without cookies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Contact</h2>
          <p>
            For questions about our cookie practices, contact us at: <strong>privacy@fayth.life</strong>
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-border text-sm text-muted flex gap-4">
        <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
        <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link>
        <Link href="/" className="underline hover:text-foreground">Home</Link>
      </div>
    </main>
  );
}
