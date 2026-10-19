// app/faq/page.tsx (Blueprint W4, #119)
// Server component: every answer is plain HTML in the server response, and the FAQPage
// structured data is built from the same items, so the markup says exactly what the page shows.
// The search box is left out until it can filter questions.

import SiteHeader from "@/components/ui/SiteHeader";
import SiteFooter from "@/components/ui/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { FACTS } from "@/lib/seo/facts";
import { FAQ_SECTIONS, liveFaq } from "@/lib/faq";
import { breadcrumbs, faqPage } from "@/lib/seo/schema";
import { pageMetadata } from "@/lib/seo/pages";

export const metadata = pageMetadata("/faq");

const card = "rounded-[14px] border border-brand-gray-light bg-brand-white p-5";

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
      <SiteHeader />
      <main className="bg-brand-offwhite px-4 py-12 md:px-12 md:py-14">
        <div className="mx-auto max-w-[1104px]">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-brand-yellow-dark">
            Frequently asked questions
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-[1.1] text-brand-black md:text-5xl">
            Questions, answered
          </h1>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
            <div>
              {sections.map((s) => (
                <section key={s.n} id={`topic-${s.n}`} className="scroll-mt-6 pb-8">
                  <h2 className="text-2xl font-semibold text-brand-black">{s.title}</h2>
                  <div className="mt-4 flex flex-col gap-3">
                    {items
                      .filter((i) => i.section === s.n)
                      .map((i) => (
                        <details
                          key={i.id}
                          id={i.id}
                          className="rounded-[10px] border border-brand-gray-light bg-brand-white"
                        >
                          <summary className="cursor-pointer px-4 py-3.5 text-sm font-semibold text-brand-black">
                            {i.q}
                          </summary>
                          <div className="px-4 pb-4 text-sm leading-relaxed text-brand-gray">
                            {i.list === "ol" ? (
                              <ol className="list-decimal space-y-1 pl-5">
                                {i.a.map((line) => (
                                  <li key={line}>{line}</li>
                                ))}
                              </ol>
                            ) : i.list === "ul" ? (
                              <ul className="list-disc space-y-1 pl-5">
                                {i.a.map((line) => (
                                  <li key={line}>{line}</li>
                                ))}
                              </ul>
                            ) : (
                              i.a.map((line) => (
                                <p key={line} className="mt-2 first:mt-0">
                                  {line}
                                </p>
                              ))
                            )}
                          </div>
                        </details>
                      ))}
                  </div>
                </section>
              ))}
            </div>

            <aside className="flex flex-col gap-4 lg:self-start">
              <section className={card}>
                <h2 className="text-base font-semibold text-brand-black">Still stuck?</h2>
                <p className="mt-1 text-sm leading-relaxed text-brand-gray">
                  WhatsApp {FACTS.support.whatsappDisplay}, {FACTS.support.hours}. Support only.
                </p>
              </section>
              <nav aria-label="Topics" className={card}>
                <h2 className="text-base font-semibold text-brand-black">Jump to</h2>
                <ul className="mt-2 flex flex-col gap-1.5 text-sm">
                  {sections.map((s) => (
                    <li key={s.n}>
                      <a href={`#topic-${s.n}`} className="text-brand-black underline">
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
