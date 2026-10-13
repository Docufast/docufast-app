// app/faq/page.tsx
// Server component: every answer is plain HTML in the server response, and the FAQPage
// structured data is built from the same items, so the markup says exactly what the page shows.

import HomeLink from "@/components/ui/HomeLink";
import AuthNavLink from "@/components/ui/AuthNavLink";
import { JsonLd } from "@/components/JsonLd";
import { FAQ_SECTIONS, liveFaq } from "@/lib/faq";
import { breadcrumbs, faqPage } from "@/lib/seo/schema";
import { pageMetadata } from "@/lib/seo/pages";

export const metadata = pageMetadata("/faq");

export default function FaqPage() {
  const items = liveFaq();
  const sections = FAQ_SECTIONS.filter((s) => items.some((i) => i.section === s.n));

  return (
    <>
      <JsonLd
        data={[
          faqPage(items.map((i) => ({ q: i.q, a: i.a.join(" ") }))),
          breadcrumbs([
            { name: "Home", path: "/" },
            { name: "Frequently asked questions", path: "/faq" },
          ]),
        ]}
      />
      <main className="mx-auto max-w-3xl px-6 py-6 lg:px-16 lg:py-10">
        <nav className="flex items-center gap-6 border-b-4 border-brand-black pb-4">
          <HomeLink />
          <AuthNavLink />
        </nav>

        <div className="mt-8">
          <h1 className="text-3xl font-extrabold text-brand-black">Frequently asked questions</h1>
          <p className="mt-2 text-brand-gray">
            Plain answers about our services, your documents and how Docufast works. Can't find what you
            need? Message us on WhatsApp at 0905 495 1918, Monday to Saturday, 8am to 6pm WAT.
          </p>
        </div>

        <nav aria-label="Topics" className="mt-6">
          <ul className="flex flex-wrap gap-2">
            {sections.map((s) => (
              <li key={s.n}>
                <a
                  href={`#topic-${s.n}`}
                  className="inline-block rounded-card border-2 border-brand-black px-3 py-1 text-sm font-semibold hover:bg-brand-yellow/10"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {sections.map((s) => (
          <section key={s.n} id={`topic-${s.n}`} className="mt-10">
            <h2 className="text-2xl font-extrabold text-brand-black">{s.title}</h2>
            {items
              .filter((i) => i.section === s.n)
              .map((i) => (
                <div key={i.id} id={i.id} className="mt-6">
                  <h3 className="font-bold text-brand-black">{i.q}</h3>
                  {i.list === "ol" ? (
                    <ol className="mt-2 list-decimal space-y-1 pl-6 text-brand-gray">
                      {i.a.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ol>
                  ) : i.list === "ul" ? (
                    <ul className="mt-2 list-disc space-y-1 pl-6 text-brand-gray">
                      {i.a.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  ) : (
                    i.a.map((line) => (
                      <p key={line} className="mt-2 text-brand-gray">
                        {line}
                      </p>
                    ))
                  )}
                </div>
              ))}
          </section>
        ))}
      </main>

      <footer className="mt-10 border-t-4 border-brand-black bg-brand-black px-6 py-10 text-brand-white lg:px-16">
        <div className="flex flex-col gap-2 text-xs text-neutral-400">
          <span>SCUML SC251840209 | NDPC DCP/07770 | SMEDAN SUIN426476832438 | RC1893484</span>
          <span>© 2026 Docufast Integrated Services Ltd</span>
        </div>
      </footer>
    </>
  );
}
