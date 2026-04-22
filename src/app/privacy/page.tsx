import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-stone-50 px-6 py-12">
      <div className="max-w-prose mx-auto">
        <Link href="/profile">
          <Button
            variant="ghost"
            className="mb-6 -ml-2 text-stone-500 hover:text-stone-800"
          >
            ← Back
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-stone-800 mb-2">Privacy Policy</h1>
        <p className="text-stone-400 text-sm mb-10">Last updated: April 2026</p>

        <div className="space-y-8 text-stone-600 text-sm leading-7">
          <section>
            <p>
              This policy explains what information Know Thy Poop collects, how we use it,
              and what rights you have over it. We've kept it short and plain on
              purpose — your data is yours.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-800 mb-2">
              1. What we collect
            </h2>
            <p>We collect only the information you give us directly:</p>
            <ul className="mt-2 space-y-1 list-disc pl-5">
              <li>Your email address (required for sign-in via one-time code).</li>
              <li>
                Profile details you enter: name, age, optional phone number, and
                the gut health issues you declare.
              </li>
              <li>
                The log entries you create: time, urgency, straining, odour,
                personal notes, and any photos you choose to attach.
              </li>
              <li>
                Feedback you leave on AI analysis (thumbs up/down, optional
                comments).
              </li>
              <li>
                Minimal technical data (timestamps, error logs) required to keep
                the app running securely.
              </li>
            </ul>
            <p className="mt-2">
              We do not track you across other websites, run third-party advertising
              pixels, or collect location data.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-800 mb-2">
              2. How images are stored
            </h2>
            <p>
              Photos you upload are stored in a private, encrypted storage bucket
              scoped to your user account. They are never public. When your
              insight page shows an image, the app generates a short-lived signed
              URL (valid for 60 seconds) — there is no persistent public link.
              Images are only retrieved when you explicitly tap "View image".
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-800 mb-2">
              3. AI / LLM processing
            </h2>
            <p>
              To generate insights from photos and logged data, we send the image
              and relevant context (your urgency/straining/odour/notes values) to
              a third-party language model provider — currently Google Gemini or
              OpenAI, depending on configuration. Only the minimum information
              needed for analysis is transmitted. Your email, phone, and other
              identifying details are never sent to these providers. Under our
              agreements with them, your data is not used to train their models.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-800 mb-2">
              4. Sharing with third parties
            </h2>
            <p>
              We do not sell, rent, or share your personal data with third parties
              for marketing. The only external processors involved are:
            </p>
            <ul className="mt-2 space-y-1 list-disc pl-5">
              <li>Supabase — our database, authentication, and storage provider.</li>
              <li>
                The LLM provider (Gemini or OpenAI), limited to what is described
                in section 3.
              </li>
            </ul>
            <p className="mt-2">
              If we are ever compelled to disclose data by law, we will tell you
              where legally permitted.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-800 mb-2">
              5. Your rights
            </h2>
            <p>
              You can view and edit your profile at any time from the Profile
              screen. You can also:
            </p>
            <ul className="mt-2 space-y-1 list-disc pl-5">
              <li>
                <strong>Export your data</strong> — download a JSON file
                containing everything we store about you.
              </li>
              <li>
                <strong>Delete your account</strong> — permanently wipe your
                profile, entries, analyses, images, and auth record. This is
                irreversible.
              </li>
              <li>
                Contact us (below) to request a correction or ask a question
                about your data.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-800 mb-2">
              6. Retention
            </h2>
            <p>
              We keep your data for as long as your account is active. When you
              delete your account, all associated data is removed promptly from
              our primary systems. Encrypted backups roll off on a short schedule.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-800 mb-2">
              7. Children
            </h2>
            <p>
              Know Thy Poop is not intended for users under 13. If you believe a child has
              provided us data, contact us and we'll delete it.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-800 mb-2">
              8. Changes
            </h2>
            <p>
              If we change this policy materially, we'll notify you via the app or
              email before the change takes effect.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-800 mb-2">
              9. Contact
            </h2>
            <p>
              Questions, concerns, or deletion requests? Email us at{" "}
              <a
                href="mailto:support@logio.app"
                className="underline text-amber-700 hover:text-amber-800"
              >
                support@logio.app
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
