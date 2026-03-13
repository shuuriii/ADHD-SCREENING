import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — fayth.life",
  description: "Terms of service for fayth.life ADHD screening tool.",
};

export default function TermsOfServicePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
      <p className="text-sm text-muted mb-8">Last updated: March 13, 2026</p>

      <div className="prose prose-sm max-w-none text-foreground/90 space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p>
            By accessing or using fayth.life (&quot;the Service&quot;), you agree to be bound by these Terms of
            Service. If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">2. Medical Disclaimer</h2>
          <p>
            <strong>fayth.life is a screening tool, not a diagnostic instrument.</strong> The results
            provided by this Service do not constitute a medical diagnosis, medical advice, or a
            doctor-patient relationship.
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Only a qualified healthcare professional (psychiatrist, psychologist, or physician) can diagnose ADHD</li>
            <li>Screening results may not reflect your full clinical picture</li>
            <li>The cognitive tasks (Go/No-Go, Chronos Sort, Focus Quest) are research-informed but are not FDA-approved diagnostic devices</li>
            <li>You should share your results with a licensed healthcare provider for proper evaluation</li>
            <li>Do not make medication or treatment decisions based solely on these results</li>
          </ul>
          <p className="mt-2">
            <strong>If you are in crisis or experiencing a mental health emergency, please contact your local
            emergency services, call 988 (Suicide &amp; Crisis Lifeline in the US), or go to your nearest
            emergency room.</strong>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">3. Eligibility</h2>
          <p>
            The Service is intended for adults aged 18 and older. By using the Service, you represent that
            you are at least 18 years of age.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">4. Use of the Service</h2>
          <p>You agree to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide accurate information during the assessment</li>
            <li>Use the Service for personal screening purposes only</li>
            <li>Not attempt to manipulate, reverse-engineer, or abuse the scoring algorithms</li>
            <li>Not use the Service to generate fraudulent medical documentation</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">5. Accounts &amp; Authentication</h2>
          <p>
            Account creation is optional. You may use the Service anonymously. If you create an account
            (via Google OAuth or email), you are responsible for maintaining the security of your
            credentials. We are not liable for unauthorized access to your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">6. Intellectual Property</h2>
          <p>
            The Service, including its design, code, scoring algorithms, and content, is owned by
            fayth.life. The DSM-5 criteria referenced in the questionnaire are published by the American
            Psychiatric Association. You may download and keep your personal screening reports.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">7. Limitation of Liability</h2>
          <p>
            The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, express or
            implied. To the fullest extent permitted by law:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>We are not liable for any health decisions made based on screening results</li>
            <li>We are not liable for any indirect, incidental, or consequential damages arising from use of the Service</li>
            <li>Our total liability shall not exceed the amount you paid for the Service (which is $0 for the free tier)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">8. Privacy</h2>
          <p>
            Your use of the Service is also governed by our{" "}
            <Link href="/privacy" className="text-primary-600 underline">Privacy Policy</Link>, which
            describes how we collect, use, and protect your data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">9. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. Continued use of the Service after changes
            constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">10. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with applicable law. Any disputes
            shall be resolved in the jurisdiction where fayth.life operates.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">11. Contact</h2>
          <p>
            For questions about these Terms, contact us at: <strong>legal@fayth.life</strong>
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-border text-sm text-muted flex gap-4">
        <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
        <Link href="/cookies" className="underline hover:text-foreground">Cookie Policy</Link>
        <Link href="/" className="underline hover:text-foreground">Home</Link>
      </div>
    </main>
  );
}
