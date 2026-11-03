"use client";

// NPC services (#101). Thin wrapper like the CAC pages; the forms are in lib/npcForms.ts.
// Until NEXT_PUBLIC_NPC_SERVICES_ENABLED=on, each page explains the service and offers WhatsApp.
import Link from "next/link";
import { useParams } from "next/navigation";
import ServiceOrderForm from "@/components/ServiceOrderForm";
import HomeLink from "@/components/ui/HomeLink";
import { getServiceForm } from "@/lib/serviceForms";
import { NPC_SERVICES_ENABLED } from "@/lib/npcForms";

export default function NpcOrderPage() {
  const slug = useParams().slug as string;
  const form = getServiceForm("npc", slug);
  if (!form) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-brand-black">Service not found</h1>
        <Link href="/services/npc" className="mt-4 inline-block font-bold underline">← Back</Link>
      </main>
    );
  }
  if (!NPC_SERVICES_ENABLED) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-6 pb-40 sm:pb-6 lg:px-16 lg:py-10">
        <nav className="flex items-center gap-6 border-b-4 border-brand-black pb-4">
          <HomeLink />
          <Link href="/services/npc" className="text-sm font-semibold uppercase tracking-wide">← Births and deaths</Link>
        </nav>
        <h1 className="mt-8 break-words text-3xl font-extrabold text-brand-black">{form.title}</h1>
        <p className="mt-2 text-sm text-brand-gray">{form.intro}</p>
        <p className="mt-6 rounded-card border-2 border-brand-black p-4 text-sm">
          Coming soon. We are finishing this service. Message us on WhatsApp and we will tell you as soon as it opens.
        </p>
        <a href="https://wa.me/2349054951918" className="mt-4 inline-block rounded-card bg-brand-yellow px-4 py-3 text-sm font-bold text-brand-black">Message us on WhatsApp</a>
      </main>
    );
  }
  return <ServiceOrderForm form={form} backHref="/services/npc" backLabel="Births and deaths" />;
}
