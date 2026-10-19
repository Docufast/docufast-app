import { FACTS } from "@/lib/seo/facts";
import { pageMetadata } from "@/lib/seo/pages";
import Link from "next/link";
import SiteHeader from "@/components/ui/SiteHeader";
import SiteFooter from "@/components/ui/SiteFooter";

// Blueprint W1 (#119). Only services that exist today get a card. Check my company,
// Births and deaths, Vault and reminders and Virtual office are added when they ship.
// The For individuals / For businesses filter and the Ask Docufast band wait for the
// chat feature.
const CARDS = [
  {
    href: "/services/affidavits",
    title: "Affidavits",
    text: "Change of name, loss, age, marriage, student and status affidavits.",
  },
  {
    href: "/services/publications",
    title: "Newspaper notices",
    text: "Change of name, loss of documents and incorporated trustees notices. Order on their own or with an affidavit.",
  },
  {
    href: "/services/cac",
    title: "CAC registration",
    text: "Business names, companies, incorporated trustees, annual returns and changes.",
  },
  {
    href: "/services/virtual-assistant",
    title: "Typing, data entry and transcription",
    text: "Typed, checked and delivered to your Vault.",
  },
  {
    href: "/services/notarization",
    title: "Notarization",
    text: "We will announce it here when it opens.",
    soon: true,
  },
];

export const metadata = pageMetadata("/services");

export default function ServicesPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-brand-offwhite px-4 py-12 md:px-12 md:py-14">
        <div className="mx-auto max-w-[1200px]">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-brand-yellow-dark">
            Services
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-[1.1] text-brand-black md:text-5xl">
            Affidavits, newspaper notices, CAC filings and more
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-brand-gray">
            Every order follows the same six steps: service, details, quote, upload and verify,
            pay, done. {FACTS.quotePromise}.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CARDS.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="flex min-h-[170px] flex-col rounded-[14px] border border-brand-gray-light bg-brand-white p-5 hover:border-brand-black"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold text-brand-black">{card.title}</h2>
                  {card.soon && (
                    <span className="rounded-full bg-[#FDF0C4] px-2.5 py-0.5 text-xs font-semibold text-brand-black">
                      Coming soon
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-brand-gray">{card.text}</p>
                <span className="mt-auto pt-4 text-sm font-semibold text-brand-black">
                  {card.soon ? "See details" : "Get your price"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
