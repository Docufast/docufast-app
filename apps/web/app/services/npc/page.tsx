import Link from "next/link";
import { pageMetadata } from "@/lib/seo/pages";
import AuthNavLink from "@/components/ui/AuthNavLink";
import HomeLink from "@/components/ui/HomeLink";
import { NPC_FORMS, NPC_SERVICES_ENABLED } from "@/lib/npcForms";

export const metadata = pageMetadata("/services/npc");

// NPC services (#101). Wording rule (Playbook 7.3): "we help you complete your NPC application";
// Docufast is not an NPC agent or partner. No prices on this page until NPC accreditation.
export default function NpcServicesPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-6 lg:px-16 lg:py-10">
      <nav className="flex items-center gap-6 border-b-4 border-brand-black pb-4">
        <HomeLink />
        <Link href="/services" className="text-sm font-semibold uppercase tracking-wide">← All services</Link>
        <AuthNavLink />
      </nav>
      <div className="mt-8">
        <h1 className="text-3xl font-extrabold text-brand-black">Births and deaths (NPC)</h1>
        <p className="mt-2 text-brand-gray">
          We help you complete your National Population Commission application, check your details before anything is
          sent, and track it for you. NPC&apos;s own fees are paid to NPC in full.
        </p>
        {!NPC_SERVICES_ENABLED && (
          <p className="mt-4 rounded-card border-2 border-brand-black p-3 text-sm">Coming soon. These services are not open for orders yet.</p>
        )}
      </div>
      <div className="mt-8 flex flex-col gap-4">
        {NPC_FORMS.map((f) => (
          <Link key={f.slug} href={`/services/npc/${f.slug}`} className="flex items-center justify-between rounded-card border-4 border-brand-black p-5 hover:bg-brand-yellow/10">
            <div>
              <h2 className="font-bold text-brand-black">{f.title}</h2>
              <p className="mt-1 text-sm text-brand-gray">{f.intro}</p>
            </div>
            <span className="text-brand-gray">→</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
