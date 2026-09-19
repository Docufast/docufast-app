import Link from "next/link";
import Image from "next/image";
import HeroPanel from "@/components/ui/HeroPanel";
import AuthNavLink from "@/components/ui/AuthNavLink";

export default function Home() {
  return (
    <>
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col px-6 py-6 lg:px-16 lg:py-10">
        {/* Nav */}
        <nav className="flex items-center gap-6 border-b-4 border-brand-black pb-4">
          <div className="flex items-center gap-2">
            <Image src="/images/logo-black.png" alt="Docufast" width={28} height={28} />
            <span className="text-xl font-extrabold tracking-wide text-brand-black">
              DOCUFAST
            </span>
          </div>
          <span className="text-sm font-semibold uppercase tracking-wide">Services</span>
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-gray">
            For business
          </span>
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-gray">
            API
          </span>
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-gray">
            Pricing
          </span>
          <Link
            href="/sign-in"
            className="ml-auto text-sm font-bold uppercase tracking-wide"
          >
            Sign in
          </Link>
        </nav>

        {/* Hero content */}
        <div className="mt-10 flex max-w-xl flex-1 flex-col gap-6">
          <span className="w-fit rounded-card bg-brand-yellow px-2.5 py-1 text-xs font-bold uppercase tracking-widest">
            Regulated document infrastructure
          </span>
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-brand-black lg:text-6xl">
            Affidavits, filings and notarisation — handled properly.
          </h1>
          <p className="max-w-md text-lg text-brand-gray">
            One account for sworn documents, CAC registrations, publications
            and compliance deadlines. Every matter quoted before work starts,
            tracked end to end, and stored encrypted.
          </p>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-up"
              className="flex items-center gap-2 rounded-card bg-brand-black px-6 py-4 text-base font-bold text-brand-white"
            >
              Get started →
            </Link>
            <Link
              href="/services"
              className="rounded-card border-4 border-brand-black px-5 py-3.5 text-base font-bold text-brand-black"
            >
              Browse services
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4 border-t-4 border-brand-black pt-4">
            <div>
              <div className="text-3xl font-extrabold text-brand-black">32</div>
              <div className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
                Affidavit types
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-brand-black">48h</div>
              <div className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
                Standard turnaround
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-brand-black">AES-256</div>
              <div className="text-xs font-semibold uppercase tracking-wide text-brand-gray">
                Vault encryption
              </div>
            </div>
          </div>
        </div>

        {/* Trust badges — BluetentBC removed */}
        <div className="mt-6 flex items-center gap-4 text-xs text-brand-gray">
          <span>NDPR compliant</span>
          <span className="h-1 w-1 bg-brand-yellow" />
          <span>SCUML registered</span>
        </div>
      </div>

      <HeroPanel src="/images/hero-home.png" alt="Docufast — documents made simple" bg="yellow" />
    </main>

    {/* Footer — mandatory elements per Playbook Section 03 */}
    <footer className="border-t-4 border-brand-black bg-brand-black px-6 py-10 text-brand-white lg:px-16">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-center gap-2">
          <Image src="/images/logo-yellow.png" alt="Docufast" width={32} height={32} />
          <div>
            <div className="text-lg font-extrabold tracking-wide">DOCUFAST</div>
            <div className="text-xs text-neutral-400">Documents. Faster.</div>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <Link href="/services" className="text-neutral-300 hover:text-brand-yellow">Services</Link>
          <Link href="/privacy" className="text-neutral-300 hover:text-brand-yellow">Privacy Policy</Link>
          <Link href="/terms" className="text-neutral-300 hover:text-brand-yellow">Terms of Service</Link>
        </div>

        <div className="flex flex-col gap-2 text-sm text-neutral-300">
          <span>WhatsApp | Email</span>
          <span>Mon–Sat, 8am–6pm WAT</span>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-2 border-t border-neutral-700 pt-6 text-xs text-neutral-400">
        <span>SCUML SC251840209 | NDPC DCP/07770 | SMEDAN SUIN426476832438 | RC1893484</span>
        <p className="max-w-3xl">
          Docufast facilitates document preparation and filing services in partnership with
          accredited processing agents. Docufast is not a law firm and does not provide legal
          advice. Services are processed by licensed Commissioners for Oaths, Notaries Public,
          and accredited agents as applicable.
        </p>
        <span>© 2026 Docufast Integrated Services Ltd</span>
      </div>
    </footer>

    {/* Sticky WhatsApp CTA */}
</>
  );
}
