import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — fayth.life",
  description: "How fayth.life collects, uses, and protects your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted mb-8">Last updated: March 13, 2026</p>

      <div className="prose prose-sm max-w-none text-foreground/90 space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-foreground">1. Who We Are</h2>
          <p>
            fayth.life (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) provides a free, evidence-based ADHD screening
            tool for adults. This policy explains how we collect, use, store, and protect your personal data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">2. Data We Collect</h2>
          <p>We collect the following categories of data:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Identity data:</strong> Name (optional), age, gender, email (optional)</li>
            <li><strong>Screening data:</strong> DSM-5 questionnaire responses, context responses, follow-up responses</li>
            <li><strong>Cognitive task data:</strong> Go/No-Go scores, Chronos Sort scores, Focus Quest scores (reaction times, accuracy metrics, composite indices)</li>
            <li><strong>Technical data:</strong> Browser type, session identifiers</li>
          </ul>
          <p className="mt-2">
            <strong>Sensitive data:</strong> Your screening responses and cognitive task results constitute mental
            health-related data. We treat this data with the highest level of protection.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">3. How We Use Your Data</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>To generate your personalized ADHD screening report</li>
            <li>To tailor follow-up questions based on your gender</li>
            <li>To allow you to view past assessment history (if signed in)</li>
            <li>To send one-time verification codes to your email (if you choose to sign in)</li>
          </ul>
          <p className="mt-2">We do <strong>not</strong> sell, rent, or share your data with third parties for marketing purposes.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">4. Lawful Basis for Processing (GDPR)</h2>
          <p>We process your data based on:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Consent:</strong> You explicitly consent before starting the assessment</li>
            <li><strong>Legitimate interest:</strong> To provide and improve the screening service</li>
          </ul>
          <p className="mt-2">You may withdraw consent at any time by deleting your data (see Section 7).</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">5. Data Storage &amp; Security</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Client-side:</strong> Assessment data is stored in your browser&apos;s session/local storage for continuity during the assessment</li>
            <li><strong>Server-side:</strong> If you complete the assessment, results may be stored in our database (Supabase, hosted on AWS with encryption at rest)</li>
            <li><strong>Authentication:</strong> We use Google OAuth and email OTP verification via Supabase Auth</li>
            <li><strong>Transmission:</strong> All data is transmitted over HTTPS/TLS</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">6. Data Retention</h2>
          <p>
            We retain your screening data for up to 12 months from the date of your assessment. Anonymous
            session data (without a linked account) is retained for up to 90 days. You may request earlier
            deletion at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">7. Your Rights</h2>
          <p>Under GDPR and applicable privacy laws, you have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Access:</strong> Request a copy of your data</li>
            <li><strong>Rectification:</strong> Correct inaccurate data</li>
            <li><strong>Erasure:</strong> Request deletion of your data (&quot;right to be forgotten&quot;)</li>
            <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
            <li><strong>Withdraw consent:</strong> At any time, without affecting prior processing</li>
          </ul>
          <p className="mt-2">To exercise any of these rights, contact us at the address below.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">8. Third-Party Processors</h2>
          <p>We use the following third-party services to operate fayth.life:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Supabase</strong> — Database and authentication (hosted on AWS)</li>
            <li><strong>Vercel</strong> — Application hosting and deployment</li>
            <li><strong>Google</strong> — OAuth authentication provider</li>
          </ul>
          <p className="mt-2">Each processor handles data in accordance with their own privacy policies and applicable data protection agreements.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">9. Cookies</h2>
          <p>
            We use only essential cookies required for the application to function:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Authentication cookies:</strong> Supabase auth session tokens</li>
            <li><strong>OTP cookies:</strong> Temporary cookies for email verification (httpOnly, expire in 5 minutes to 24 hours)</li>
          </ul>
          <p className="mt-2">
            We do not use analytics cookies, advertising cookies, or tracking pixels.
            See our <Link href="/cookies" className="text-primary-600 underline">Cookie Policy</Link> for details.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">10. Children</h2>
          <p>
            This service is intended for adults aged 18 and older. We do not knowingly collect data from
            anyone under 18.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">11. Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. Material changes will be communicated
            on this page with an updated &quot;Last updated&quot; date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">12. Contact</h2>
          <p>
            For privacy inquiries, data requests, or complaints, contact us at:{" "}
            <strong>privacy@fayth.life</strong>
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-border text-sm text-muted flex gap-4">
        <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link>
        <Link href="/cookies" className="underline hover:text-foreground">Cookie Policy</Link>
        <Link href="/" className="underline hover:text-foreground">Home</Link>
      </div>
    </main>
  );
}
