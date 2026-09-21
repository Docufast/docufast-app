import Link from "next/link";
import Image from "next/image";

export default function PrivacyPolicyPage() {
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
        This policy is provided to support beta launch and covers our core data practices.
        It will be reviewed and finalised with legal counsel.
      </div>

      <h1 className="mt-6 text-3xl font-extrabold text-brand-black">Privacy Policy</h1>
      <p className="mt-1 text-sm text-brand-gray">Last updated: September 2026</p>

      <div className="mt-8 flex flex-col gap-8 text-sm leading-relaxed text-brand-black">
        <section>
          <h2 className="text-lg font-bold text-brand-black">1. Who we are</h2>
          <p className="mt-2 text-brand-gray">
            Docufast Integrated Services Ltd ("Docufast", "we", "us") operates a document
            infrastructure platform for affidavits, CAC registration, publications,
            notarization, and related services in Nigeria. We are registered under RC1893484,
            SCUML SC251840209, and NDPC DCP/07770.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-black">2. Information we collect</h2>
          <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-brand-gray">
            <li>Account information: full name, email, phone number</li>
            <li>
              Identity and filing information you submit to place an order, such as valid ID
              documents, passport photographs, business details, and addresses
            </li>
            <li>Documents you upload as part of an order</li>
            <li>Records of your orders, quotes, and communications with us</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-black">3. How we use your information</h2>
          <p className="mt-2 text-brand-gray">We use your information to:</p>
          <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-brand-gray">
            <li>Prepare, file, and deliver the documents and services you order</li>
            <li>
              Meet our regulatory obligations, including Know-Your-Customer (KYC) and
              anti-money-laundering (AML/CFT) requirements under SCUML
            </li>
            <li>Communicate with you about your orders, quotes, and account</li>
            <li>Maintain the security and integrity of our platform</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-black">4. How we store and protect your data</h2>
          <p className="mt-2 text-brand-gray">
            Uploaded documents are stored using Cloudflare R2 with restricted access. Account
            and order data is stored in Supabase with row-level security enabled, meaning your
            data is only accessible to your own account and authorised Docufast personnel who
            need it to process your order. Documents delivered to you are made available for
            secure download and are not made public.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-black">5. Who we share information with</h2>
          <p className="mt-2 text-brand-gray">
            We share information only as needed to fulfil your order, including with licensed
            Commissioners for Oaths, Notaries Public, and accredited processing agents,
            government filing portals (such as the CAC), and service providers that support
            our platform (such as our email and payment providers). We do not sell your
            personal information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-black">6. Your rights</h2>
          <p className="mt-2 text-brand-gray">
            Under the Nigeria Data Protection Act (NDPA) 2023, you have the right to access,
            correct, or request deletion of your personal information, and to object to
            certain uses of it. To exercise these rights, contact us using the details below.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-brand-black">7. Contact us</h2>
          <p className="mt-2 text-brand-gray">
            For questions about this policy or your data, reach us on WhatsApp or email via
            the contact details in our footer.
          </p>
        </section>
      </div>
    </main>
  );
}
