import Link from "next/link";
import Image from "next/image";
import { FACTS } from "@/lib/seo/facts";

// Blueprint footer (#119). Wording follows the house rules: NDPC licensed,
// SCUML/SMEDAN/CAC registered, online only, no walk-ins. No data-location line
// until #128 is approved. Registration numbers stay (Playbook Section 03).
const link = "text-sm text-brand-white hover:underline";
const heading = "text-sm font-semibold text-brand-white";

export default function SiteFooter() {
  return (
    <footer className="bg-brand-black px-4 py-10 text-sm text-[#D9D9D9] md:px-12">
      <div className="mx-auto grid max-w-[1200px] gap-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <Image src="/images/logo-yellow.png" alt="" width={30} height={30} />
            <span className="text-lg font-bold text-brand-white">Docufast</span>
          </div>
          <p>Your documents. Handled properly. Every time.</p>
          <p>{FACTS.notALawFirm}</p>
        </div>

        <div className="flex flex-col gap-2">
          <p className={heading}>Services</p>
          <Link href="/services/affidavits" className={link}>Affidavits</Link>
          <Link href="/services/publications" className={link}>Newspaper notices</Link>
          <Link href="/services/cac" className={link}>CAC filings</Link>
          <Link href="/services/notarization" className={link}>Notarization (coming soon)</Link>
        </div>

        <div className="flex flex-col gap-2">
          <p className={heading}>Trust</p>
          <Link href="/verify" className={link}>Verify a document</Link>
          <Link href="/about" className={link}>About and registrations</Link>
          <Link href="/faq" className={link}>FAQ</Link>
          <Link href="/privacy" className={link}>Privacy Policy</Link>
          <Link href="/terms" className={link}>Terms of Service</Link>
        </div>

        <div className="flex flex-col gap-2">
          <p className={heading}>Support</p>
          <p className="text-brand-white">WhatsApp 0905 495 1918</p>
          <p>Monday to Saturday, 8am to 6pm WAT</p>
          <p>Support only. Pay only on docufast.ng.</p>
        </div>
      </div>

      <p className="mx-auto mt-8 max-w-[1200px] text-xs text-[#A6A6A6]">
        Docufast Integrated Services Ltd · RC 1893484 · CAC registered · SCUML registered (SC251840209) · NDPC licensed (DCP/07770) · SMEDAN registered (SUIN426476832438) · Suite 100, Adebola House, 38 Opebi Road, Ikeja, Lagos (online only, no walk-ins)
      </p>
    </footer>
  );
}
