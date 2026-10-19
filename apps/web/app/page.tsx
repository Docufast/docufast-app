import { FACTS } from "@/lib/seo/facts";
import { pageMetadata } from "@/lib/seo/pages";
import Link from "next/link";
import SiteHeader from "@/components/ui/SiteHeader";
import SiteFooter from "@/components/ui/SiteFooter";

export const metadata = pageMetadata("/");

// Blueprint D1 (#119). The chat panel and language pills are left out until they are
// built. Only services that exist today get a card.
const CARDS = [
  {
    href: "/services/affidavits",
    title: "Affidavits",
    text: "Change of name, loss, age, marriage and more, sworn through the Lagos court system.",
  },
  {
    href: "/services/publications",
    title: "Newspaper notices",
    text: "Change of name and loss notices, with the proof saved to your Vault.",
  },
  {
    href: "/services/cac",
    title: "CAC filings",
    text: "Business names, companies, incorporated trustees, annual returns and changes.",
  },
  {
    href: "/services/notarization",
    title: "Notarization",
    text: "We will announce it here when it opens.",
    soon: true,
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-brand-black px-4 py-14 md:px-12 md:py-20">
          <div className="mx-auto max-w-[1200px]">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-brand-yellow">
              Online, in Nigeria
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] text-brand-white md:text-5xl">
              Affidavits, newspaper notices, CAC filings and more, sorted online.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#D9D9D9]">
              Tell us what you need. {FACTS.quotePromise}. Affidavits delivered within 48 hours,
              checked by a person, sealed in your Vault.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/services"
                className="inline-flex h-12 items-center rounded-[10px] bg-brand-yellow px-5 text-base font-semibold text-brand-black hover:bg-brand-yellow-hover"
              >
                Get your price
              </Link>
              <Link
                href="/verify"
                className="inline-flex h-12 items-center rounded-[10px] bg-brand-white px-5 text-base font-semibold text-brand-black hover:bg-brand-offwhite"
              >
                Verify a Docufast document
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-brand-offwhite px-4 py-12 md:px-12">
          <div className="mx-auto max-w-[1200px]">
            <h2 className="text-2xl font-semibold text-brand-black">What we do</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {CARDS.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="rounded-[14px] border border-brand-gray-light bg-brand-white p-5 hover:border-brand-black"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-brand-black">{card.title}</h3>
                    {card.soon && (
                      <span className="rounded-full bg-[#FDF0C4] px-2.5 py-0.5 text-xs font-semibold text-brand-black">
                        Coming soon
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-brand-gray">{card.text}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
