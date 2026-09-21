import Link from "next/link";
import Image from "next/image";

export default function TermsOfServicePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10 lg:px-16">
      <div className="flex items-center gap-2 border-b-4 border-brand-black pb-4">
        <Image src="/images/logo-black.png" alt="Docufast" width={28} height={28} />
        <span className="text-xl font-extrabold tracking-wide text-brand-black">DOCUFAST</span>
        <Link href="/" className="ml-auto text-sm font-bold uppercase tracking-wide">
          ← Home
        </Link>
      </div>

      <div className="mt-6 rounded-card border-l-4 border-brand-yellow bg-brand-yellow/10 px-4 py-3 text-sm text-brand-black">
        These terms are provided to support beta launch and cover our core commitments.
        They will be reviewed and finalised with legal counsel.
      </div>

      <h1 className="mt-6 text-3xl font-extrabold text-brand-black">Terms of Service</h1>
      <p className="mt-1 text-sm text-brand-gray">Last updated: September 2026</p>

      <div className="mt-8 flex flex-col gap-8 text-sm leading-relaxed text-brand-black">
        <section>
          <h2 className="text-lg font-bold text-brand-black">1. About Docufast</h2>
          <p className="mt-2 text-brand-gray">
            Docufast Integrated Services Ltd ("Docufast", "we", "us") facilitates document
            preparation and filing services in partnership with accredited processing agents,
            licensed Commissioners for Oaths, and Notaries Public. Docufast is not a law firm
            and does not provide legal advice.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-black">2. Accounts</h2>
          <p className="mt-2 text-brand-gray">
            You must provide accurate information when creating an account and placing an
            order. You are responsible for keeping your account credentials secure, including
            any two-factor authentication set up on your account.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-black">3. Orders and quotes</h2>
          <p className="mt-2 text-brand-gray">
            Placing an order submits a request for a quote. No payment is taken until you
            review and accept a quote. Quotes itemise any applicable government fees. Once
            accepted and paid, your order is processed as described on your Orders page.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-black">4. Accuracy of information</h2>
          <p className="mt-2 text-brand-gray">
            You are responsible for the accuracy of the information and documents you submit.
            Docufast is not liable for delays, rejections, or errors in filings that result
            from inaccurate or incomplete information you provide.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-black">5. Cancellations</h2>
          <p className="mt-2 text-brand-gray">
            Orders can be cancelled while in "Quote pending" or "Quote sent" status directly
            from your Orders page. Once an order has been paid for and sent to processing,
            cancellation and refund terms will depend on the stage of work already completed.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-black">6. Your document vault</h2>
          <p className="mt-2 text-brand-gray">
            Completed documents are made available in your vault for the free access period
            stated on that page. Continued storage beyond that period may require an active
            subscription, as described on the Vault page.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-black">7. Limitation of liability</h2>
          <p className="mt-2 text-brand-gray">
            To the extent permitted by law, Docufast's liability for any claim relating to our
            services is limited to the amount you paid for the order giving rise to the claim.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-black">8. Governing law</h2>
          <p className="mt-2 text-brand-gray">
            These terms are governed by the laws of the Federal Republic of Nigeria.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-black">9. Contact us</h2>
          <p className="mt-2 text-brand-gray">
            Questions about these terms can be sent to us on WhatsApp or email via the contact
            details in our footer.
          </p>
        </section>
      </div>
    </main>
  );
}
