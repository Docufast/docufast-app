import { pageMetadata } from "@/lib/seo/pages";
import { LegalPage, Section, List } from "@/components/legal/LegalPage";

export const metadata = pageMetadata("/terms");

// Final Terms of Service (#21, #32), from the 21 Oct 2026 text Sheriff reviewed.
// Section 3 (recovery code) must match the final DN-001 recovery design (#152).

export default function TermsOfServicePage() {
  return (
    <LegalPage title="Terms of Service">
      <Section title="1. About these terms">
        <p>
          These terms are an agreement between you and Docufast Integrated Services Limited (RC 1893484), Suite
          100, Adebola House, 38 Opebi Road, Ikeja, Lagos. They apply when you use docufast.ng, our WhatsApp
          support line or our API. By placing an order you accept them.
        </p>
      </Section>

      <Section title="2. What Docufast does, and does not do">
        <p>
          We prepare documents, arrange for affidavits to be sworn, place newspaper notices, make filings and
          applications with official bodies on your behalf, and keep your documents in a secure Vault. A person
          checks every document before it is delivered.
        </p>
        <p>
          Docufast is not a law firm and does not give legal advice. Where an official body issues or approves
          a document, it remains that body&apos;s decision and that body&apos;s document. We cannot guarantee
          that a registry, court, bank or embassy will accept or approve anything, though we tell you before
          you pay if we know of a requirement your case does not meet.
        </p>
      </Section>

      <Section title="3. Your account">
        <p>
          You must be 18 or older to hold an account; a parent or guardian orders for a child. Keep your
          sign-in and recovery code safe: if you lose your recovery code, files you uploaded yourself cannot be
          opened again by you or by us. You may give agents, firms or AI assistants limited access in your
          account; you are responsible for what they do within that access, and payments always need you.
        </p>
      </Section>

      <Section title="4. Orders and prices">
        <p>
          You see an itemised price before you commit. Once you accept it, the price is fixed for that order.
          A price you have not yet accepted stays valid for 48 hours. The price shows which official fees are
          included and, for filings where they vary, lists government fees and penalties separately. If
          anything you tell us changes the work, we give you a new price before continuing.
        </p>
      </Section>

      <Section title="5. Payment">
        <p>
          Pay only on docufast.ng. We never ask you to pay into a personal account or inside WhatsApp; if
          anyone does, do not pay and report it to us. Your order starts once payment is confirmed. Late bank
          transfers are matched automatically; if you are charged twice, the extra payment is refunded
          automatically.
        </p>
      </Section>

      <Section title="6. What you must do">
        <List
          items={[
            "Give true, complete and current information. An affidavit is sworn evidence: a false statement in it can be a criminal offence, and the responsibility for its content is yours.",
            "Complete identity checks when the service or the law requires them.",
            "Check every draft carefully before you approve it; once a document is sworn, filed or published, it may not be possible to change it.",
            "Only order for someone else where you have their authority, and for a company only as a director, the company secretary or with the company's signed authorisation.",
            "Do not use Docufast for anything unlawful, to deceive anyone, or to obtain a document you are not entitled to.",
          ]}
        />
      </Section>

      <Section title="7. Delivery times">
        <p>
          Standard affidavits are delivered within 2 to 3 working days of a confirmed order with everything we need.
          Express affidavits are delivered the same day when the order is confirmed before 2 PM on a working
          day. Some affidavit types need a short identification video; if yours does, we contact you on
          WhatsApp, email or another Docufast channel to arrange it. Other services show their usual time on
          your price. Courts, registries and newspapers set their own processing times and do not work on
          public holidays; when they cause a delay we tell you the reason and a new date. If you paid for
          Express and the same-day time is missed for any reason other than a delay on your side (for example,
          an identification video we asked for and did not receive), we refund the Express fee automatically.
        </p>
      </Section>

      <Section title="8. Cancellations and refunds">
        <List
          items={[
            "Full refund if we cannot start your order.",
            "Partial refund once work has started, less official fees and costs already paid.",
            "No refund once a document is sworn, filed or published, except where the mistake is ours.",
            "If we make a mistake, we correct it, republish or refile at no cost.",
            "Refunds go back to the original payment method within 3 to 5 working days.",
          ]}
        />
      </Section>

      <Section title="9. Your Vault">
        <p>
          Every document we deliver is stored free for 30 days. To keep documents longer, choose a Vault plan;
          without one, the file is deleted after 30 days, with reminders 7 days and 1 day before. Its
          verification record is kept for at least 5 years. Documents we prepared can be re-issued after an
          identity check for the fee shown for your plan; files you uploaded yourself cannot be re-issued. You
          can download or delete your documents at any time.
        </p>
      </Section>

      <Section title="10. Verification and sharing">
        <p>
          Every document we deliver carries a QR code and a reference. Anyone can check it at docufast.ng/verify
          without seeing its content. Share links you create can expire and be cancelled, and every opening is
          logged.
        </p>
      </Section>

      <Section title="11. Acceptable use">
        <p>
          Do not try to break into, overload or copy the platform, use it to send spam or harmful content,
          impersonate anyone, or misuse another person&apos;s data. We may suspend an account that breaks these
          terms or that we reasonably suspect of fraud, and we may report it where the law requires.
        </p>
      </Section>

      <Section title="12. Our content">
        <p>
          The platform, our templates and our brand belong to Docufast. Documents we deliver to you are yours
          to use for their purpose.
        </p>
      </Section>

      <Section title="13. Liability">
        <p>
          We do our work with reasonable care and skill. We are not responsible for decisions of courts,
          registries, newspapers, banks or embassies, for losses caused by information you gave us that was
          wrong, or for indirect losses. Our total liability for an order is limited to the total amount paid
          for that order. This limit does not apply to: (i) fraud, wilful misconduct or gross negligence by us;
          (ii) death or personal injury caused by our negligence; or (iii) any liability that cannot be limited
          under applicable law. Nothing in these terms limits your statutory rights under the Federal
          Competition and Consumer Protection Act 2018.
        </p>
      </Section>

      <Section title="14. Complaints and disputes">
        <p>
          Tell us first: WhatsApp 0905 495 1918 or support@docufast.ng with your order number. We reply within
          1 working day and aim to resolve within 5 working days. These terms are governed by the laws of the
          Federal Republic of Nigeria. If we cannot agree, we will first try to settle the dispute by
          negotiation, then by mediation. If that does not resolve it, the dispute will be settled by
          arbitration under the Arbitration and Mediation Act 2023, with the seat of arbitration in Lagos.
          Nothing here limits your rights as a consumer.
        </p>
      </Section>

      <Section title="15. Changes and contact">
        <p>
          We may update these terms; the version in force when you place an order applies to that order.
          Contact: support@docufast.ng, WhatsApp 0905 495 1918 (Monday to Friday, 8am to 6pm WAT), or post to
          our registered address.
        </p>
      </Section>
    </LegalPage>
  );
}
