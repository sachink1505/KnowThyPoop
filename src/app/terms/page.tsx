import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-stone-50 px-6 py-12">
      <div className="max-w-prose mx-auto">
        <Link href="/auth">
          <Button variant="ghost" className="mb-6 -ml-2 text-stone-500 hover:text-stone-800">
            ← Back
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-stone-800 mb-2">Terms & Conditions</h1>
        <p className="text-stone-400 text-sm mb-10">Last updated: April 2025</p>

        <div className="space-y-8 text-stone-600 text-sm leading-7">
          <section>
            <h2 className="text-base font-semibold text-stone-800 mb-2">1. What Know Thy Poop is (and isn't)</h2>
            <p>
              Know Thy Poop is a personal health logging app that helps you track your bowel habits and
              understand patterns over time. The insights and analysis you receive are generated
              for informational and educational purposes only. Know Thy Poop is <strong>not a medical
              device</strong>, and nothing in this app constitutes medical advice, diagnosis, or
              treatment. Always consult a qualified healthcare professional if you have concerns
              about your health. Do not delay seeking medical attention based on anything you read
              in this app.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-800 mb-2">2. Your data and privacy</h2>
            <p>
              We take your privacy seriously. The data you log — including entries, images, and
              health information — is stored securely in our database and is only accessible to
              your account. We do not sell, rent, or share your personal data with third parties
              for marketing purposes.
            </p>
            <p className="mt-3">
              Your data is used solely to provide you with analysis and insights within the app.
              AI-generated analysis may be processed by a third-party language model provider
              (such as Google Gemini or OpenAI). When this happens, only the minimum necessary
              information is sent, and it is not used to train their models under our agreements.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-800 mb-2">3. Image storage</h2>
            <p>
              If you choose to upload images, they are stored in a private, encrypted storage
              bucket. Images are only accessible to your account and are never publicly visible.
              You can delete your images and associated data at any time from within the app. You
              retain full ownership of any images you upload. By uploading an image, you confirm
              that you have the right to do so and that it does not contain content that is
              illegal or harmful to others.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-800 mb-2">4. Your responsibilities</h2>
            <p>
              You agree to use Know Thy Poop only for its intended purpose — personal health tracking.
              You must not attempt to reverse-engineer, exploit, or misuse the app or its
              infrastructure. You are responsible for keeping your login credentials secure.
              Because Know Thy Poop uses a one-time code sent to your email, make sure your email
              account is secure.
            </p>
            <p className="mt-3">
              You must be at least 13 years old to use this app. If you are under 18, please
              use it with the awareness of a parent or guardian.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-800 mb-2">5. Changes to these terms</h2>
            <p>
              We may update these terms from time to time. If we make significant changes, we'll
              notify you via the app or by email. Continued use of Know Thy Poop after changes are posted
              means you accept the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-800 mb-2">6. Limitation of liability</h2>
            <p>
              Know Thy Poop is provided "as is". We are not liable for any health decisions made based on
              information in the app, for any data loss, or for interruptions in service. To the
              extent permitted by law, our liability is limited to the amount you paid to use the
              app (which, if it's free, is zero).
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-stone-800 mb-2">7. Contact</h2>
            <p>
              If you have questions about these terms or your data, reach out to us at{" "}
              <a
                href="mailto:support@logio.app"
                className="underline text-amber-700 hover:text-amber-800"
              >
                support@logio.app
              </a>
              . We're a small team and we'll get back to you as soon as we can.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
