import { pageMetadata } from "@/lib/seo/pages";
import { LegalPage, Section, List, Table, Open } from "@/components/legal/LegalPage";

export const metadata = pageMetadata("/privacy");

// Final Privacy Notice (#21, #32), from the 21 Oct 2026 text Sheriff reviewed. Open items in
// [BRACKETS]: publication date, hosting regions (#128), sign-in methods, analytics tool (#162).

export default function PrivacyNoticePage() {
  return (
    <LegalPage title="Privacy Notice">
      <Section title="1. Who we are">
        <p>
          Docufast Integrated Services Limited (&quot;Docufast&quot;, &quot;we&quot;) is a company registered in Nigeria
          under the Companies and Allied Matters Act 2020, RC 1893484, at Suite 100, Adebola House, 38 Opebi
          Road, Ikeja, Lagos. We run docufast.ng and its WhatsApp support line. We decide how your personal
          data is used for our services, so we are the data controller under the Nigeria Data Protection Act
          2023 (NDPA). Our registration with the Nigeria Data Protection Commission is NDPC/DCP/07770.
        </p>
        <p>
          Data Protection Officer: Sheriff Lasisi, privacy@docufast.ng. This notice is issued under the NDPA,
          and references to sections are to the NDPA.
        </p>
      </Section>

      <Section title="2. What we collect">
        <Table
          head={["Kind of data", "Examples", "Where it comes from"]}
          rows={[
            ["Identity", "Full name, date of birth, gender where a document needs it, photograph", "You"],
            [
              "Identity checks",
              "NIN or BVN, a selfie or short video for a face match, the result of the check",
              "You, and our licensed identity verifier",
            ],
            ["Contact", "Phone number, email address, residential and business address", "You"],
            [
              "Order details",
              "What the document is for and the facts it must state; company details, directors and shareholders for CAC work",
              "You, and public registers such as the CAC search",
            ],
            ["Documents", "Files you upload; documents we prepare and deliver", "You, and us"],
            [
              "Children's data",
              "A child's name and date of birth for age, birth or name services",
              "The parent or guardian",
            ],
            [
              "Payment",
              "Amount, payment method, payment reference; we never see or store your full card number",
              "Our payment providers",
            ],
            [
              "Account and security",
              "Sign-in method, device and IP address, access log of who opened your documents",
              "Our systems",
            ],
            ["Support", "Messages you send us on WhatsApp or by email", "You"],
            [
              "Analytics (only if you allow it)",
              "Pages and steps visited, device type, language, with a random ID; no names or ID numbers",
              "Our systems",
            ],
          ]}
        />
      </Section>

      <Section title="3. Why we use it, and our lawful basis">
        <Table
          head={["Purpose", "Lawful basis"]}
          rows={[
            [
              "Preparing, swearing, filing, publishing and delivering what you order",
              "Performance of our contract with you",
            ],
            [
              "Checking your identity before filings and some affidavits",
              "Legal obligation (anti-money laundering and registry rules under the Money Laundering (Prevention and Prohibition) Act 2022 and SCUML guidelines) and contract",
            ],
            [
              "Keeping records required by law, and preventing fraud",
              "Legal obligation; legitimate interest in protecting customers and the public",
            ],
            ["Sending order updates and deadline reminders you switched on", "Contract"],
            [
              "Showing who opened your documents (access log)",
              "Legitimate interest in security; legal obligation to keep data secure (s.39)",
            ],
            [
              "Children's data for birth, age and name services",
              "Verifiable consent of the parent or guardian (s.31), and contract",
            ],
            [
              "Analytics to improve the service",
              "Your consent (s.25(1)(a) and s.26); you can say no and the service works the same",
            ],
            [
              "Marketing messages",
              "Your separate consent, obtained first, which you can withdraw at any time (s.26 and s.35)",
            ],
          ]}
        />
        <p>
          We do not sell your data. We do not use it to make automated decisions that have legal effects on
          you; fraud alerts are always reviewed by a person.
        </p>
      </Section>

      <Section title="4. Who we share it with">
        <p>Only what each one needs to do its part of your order:</p>
        <List
          items={[
            <><strong>Courts and commissioners for oaths</strong>, to swear and commission affidavits.</>,
            <>
              <strong>Government registries</strong>, such as the Corporate Affairs Commission and the National
              Population Commission, when you order a filing or application.
            </>,
            <><strong>Newspapers</strong>, for the notice you order and approve.</>,
            <><strong>Our licensed identity verifier</strong>, to check your NIN or BVN and face match.</>,
            <><strong>Payment providers</strong>, to take your payment on docufast.ng.</>,
            <>
              <strong>Technology suppliers</strong> that host our platform, store encrypted files and send
              messages, under written data processing agreements. Some of them, such as our database host and
              our email provider, also use limited account and usage information for their own purposes as
              separate controllers, under their own privacy notices.
            </>,
            <>
              <strong>People you choose</strong>, when you share a document or give an agent, accountant or AI
              assistant access in your account.
            </>,
            <>
              <strong>Authorities</strong>, when the law requires it, such as a court order or a report required
              by the Money Laundering (Prevention and Prohibition) Act 2022.
            </>,
          ]}
        />
      </Section>

      <Section title="5. Transfers outside Nigeria">
        <p>
          Some of our technology suppliers store or process data outside Nigeria, in Ireland, Western Europe and the United States. We
          transfer personal data outside Nigeria only where the NDPA allows it, and we record the legal basis
          for each transfer before it happens. Where the destination country has not been approved by the
          Nigeria Data Protection Commission and no approved transfer instrument is in place, we rely on the
          transfer being necessary to perform our contract with you (section 43(1)(b) of the NDPA), for example
          to store your documents in the Vault or to process your order. We record this in our records of
          processing and our cross-border transfer register, and we will move to an approved transfer
          instrument once the Commission publishes one.
        </p>
      </Section>

      <Section title="6. How long we keep it">
        <Table
          head={["Data", "Kept for"]}
          rows={[
            [
              "Documents we deliver, without a Vault plan",
              "30 days after delivery, then deleted; a reminder comes 7 days and 1 day before",
            ],
            ["Documents, with a Vault plan", "While the plan is active"],
            ["Files you upload yourself", "Until you delete them or your account closes"],
            [
              "Verification record (document type, date, signature status, never the content)",
              "At least 5 years, so anyone holding a copy can still check it",
            ],
            [
              "Identity checks and order records needed by anti-money laundering law",
              "5 years after our relationship with you ends (Money Laundering (Prevention and Prohibition) Act 2022)",
            ],
            ["Access log", "2 years"],
            [
              "Analytics events",
              "13 months, to allow year-on-year comparison; after that we permanently remove all identifiers and keep only totals, which are no longer personal data",
            ],
            [
              "Support messages",
              "5 years where they relate to a transaction, contract or matter that could lead to a legal claim; otherwise 6 months after the ticket is closed",
            ],
          ]}
        />
        <p>
          Legal hold: we may keep data beyond these periods where required by law, a court order or a
          regulatory investigation, or where necessary to establish, exercise or defend legal claims.
        </p>
      </Section>

      <Section title="7. How we protect it">
        <p>
          Data is encrypted in transit and at rest. Files you upload are encrypted on your device with a key
          only you hold, so our staff cannot open them. Documents we prepare are handled only by the staff
          working on your order. Every view, download, share and print of a document is logged for everyone,
          including our own leadership, and nobody can delete those entries. Accounts use{" "}
          email and password, with two-step sign-in through an authenticator app on every account. If a breach puts your data at risk, we tell the Nigeria Data
          Protection Commission within 72 hours and tell you without delay.
        </p>
      </Section>

      <Section title="8. Your rights">
        <p>
          You can ask us to: tell you what we hold and give you a copy, correct it, delete it unless the law
          requires us to keep it, or limit how we use it (s.34); object to some uses (s.36); not be subject to
          decisions based solely on automated processing (s.37); move it to you in a common format (s.38); and
          withdraw consent at any time, without affecting what was done before (s.35). Email
          privacy@docufast.ng or use Privacy choices in your account. We acknowledge your request within 2
          working days and respond in full within 30 days. You may also complain to the Nigeria Data Protection
          Commission (ndpc.gov.ng).
        </p>
      </Section>

      <Section title="9. Children">
        <p>
          Our services are for adults (18 and over). A parent or guardian may order services that involve a
          child, such as an age declaration or birth registration; we verify the parent or guardian&apos;s
          identity and their consent first, and apply the strictest access controls to children&apos;s data.
        </p>
      </Section>

      <Section title="10. Analytics and cookies">
        <p>
          Analytics. If you agree, we use PostHog to measure how our website is used: pages visited, steps completed in an order, the language and type of device used, and how you reached us. We do this to improve the service (consent, NDPA s.25(1)(a)). PostHog stores this data in the European Union on our behalf. We do not record your screen, we discard your IP address, and we never send PostHog your name, contact details, identity numbers, payment details or the content of your documents. We keep analytics data for 13 months, and you can withdraw consent at any time in Privacy choices; withdrawing stops new analytics data being collected. Essential storage that keeps you signed in and your order saved does not need consent.
        </p>
      </Section>

      <Section title="11. Changes and contact">
        <p>
          We will post any change here with a new date, and tell you directly about important changes.
          Questions: privacy@docufast.ng, or write to the Data Protection Officer at our registered address.
        </p>
      </Section>
    </LegalPage>
  );
}
