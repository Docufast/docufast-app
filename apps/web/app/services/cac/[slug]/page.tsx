"use client";

// Thin wrapper: the form itself is components/ServiceOrderForm.tsx, configured in lib/serviceForms.ts.
import Link from "next/link";
import { useParams } from "next/navigation";
import ServiceOrderForm from "@/components/ServiceOrderForm";
import { getServiceForm } from "@/lib/serviceForms";

export default function OrderPage() {
  const slug = useParams().slug as string;
  const form = getServiceForm("cac", slug);
  if (!form) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-brand-black">Service not found</h1>
        <Link href="/services/cac" className="mt-4 inline-block font-bold underline">← Back</Link>
      </main>
    );
  }
  return <ServiceOrderForm form={form} backHref="/services/cac" backLabel="CAC and Compliance" />;
}
