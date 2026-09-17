"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/ui/Sidebar";
import { supabase } from "@/lib/supabase";
import { useOrg } from "@/contexts/OrgContext";

interface Org {
  name: string;
  rcNumber: string;
  role: "owner" | "member";
}

export default function AddOrganizationPage() {
  const { addOrg } = useOrg();
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState("");
  const [rcNumber, setRcNumber] = useState("");
  const [role, setRole] = useState<"owner" | "member">("owner");
  const [added, setAdded] = useState<Org[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/sign-in";
        return;
      }
      setLoading(false);
    }
    checkAuth();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessName) return;

    setSubmitting(true);
    setSubmitError(null);

    const { error } = await addOrg(businessName, rcNumber);

    setSubmitting(false);
    if (error) {
      setSubmitError(error);
      return;
    }

    setAdded([...added, { name: businessName, rcNumber, role }]);
    setBusinessName("");
    setRcNumber("");
    setSubmitted(true);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-brand-gray">Loading…</p>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
      <Sidebar active="Account" />

      <div className="px-6 py-6 lg:px-12 lg:py-8">
        <div className="flex items-end justify-between border-b-4 border-brand-black pb-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-brand-yellow-dark">
              Account
            </div>
            <h1 className="text-3xl font-extrabold text-brand-black">Add a business</h1>
          </div>
          <Link href="/account" className="text-sm font-bold uppercase tracking-wide underline">
            ← Profile
          </Link>
        </div>

        <p className="mt-4 max-w-xl text-sm text-brand-gray">
          Orders placed under a business carry its name on filings and keep documents in
          that organisation's vault.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 max-w-xl rounded-card border-2 border-brand-black">
          <div className="border-b-2 border-brand-black bg-brand-yellow/10 px-4 py-2 text-xs font-bold uppercase tracking-wide">
            Business details
          </div>
          <div className="flex flex-col gap-4 p-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                Business name
              </label>
              <input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Eze Ventures Enterprises"
                className="w-full rounded-input border-4 border-brand-black px-3 py-2.5 outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                CAC registration number
              </label>
              <input
                value={rcNumber}
                onChange={(e) => setRcNumber(e.target.value)}
                placeholder="Optional — leave blank if not yet registered"
                className="w-full rounded-input border-4 border-brand-black px-3 py-2.5 outline-none"
              />
              <p className="mt-1 text-xs text-brand-gray">
                We can register it for you via CAC & Compliance services.
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide">
                Your role
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRole("owner")}
                  className={`flex-1 rounded-card border-4 border-brand-black px-3 py-2 text-sm font-bold ${
                    role === "owner" ? "bg-brand-black text-brand-white" : ""
                  }`}
                >
                  Owner
                </button>
                <button
                  type="button"
                  onClick={() => setRole("member")}
                  className={`flex-1 rounded-card border-4 border-brand-black px-3 py-2 text-sm font-bold ${
                    role === "member" ? "bg-brand-black text-brand-white" : ""
                  }`}
                >
                  Member
                </button>
              </div>
              <p className="mt-1 text-xs text-brand-gray">
                Owners can invite members and see every order. Members see only what they
                place.
              </p>
            </div>
            {submitError && <p className="text-sm text-brand-error">{submitError}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-card bg-brand-black px-4 py-3 text-sm font-bold text-brand-white disabled:opacity-50"
            >
              {submitting ? "Adding…" : "Add business →"}
            </button>
          </div>
        </form>

        {submitted && (
          <div className="mt-4 max-w-xl rounded-card border-2 border-dashed border-brand-gray-light p-3 text-xs text-brand-gray">
            Added and saved to your account — you'll see it in the sidebar switcher, and it'll
            follow you to any device you sign in from.
          </div>
        )}

        <div className="mt-8 max-w-xl">
          <h2 className="border-b-4 border-brand-black pb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-gray">
            Linked businesses
          </h2>
          <div className="mt-3 divide-y-2 divide-brand-black rounded-card border-2 border-brand-black">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-bold">Personal</span>
              <span className="rounded-card bg-brand-yellow px-2 py-0.5 text-xs font-bold uppercase">
                Individual
              </span>
            </div>
            {added.map((org, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <div>
                  <span className="text-sm font-bold">{org.name}</span>
                  {org.rcNumber && (
                    <span className="ml-2 text-xs text-brand-gray">{org.rcNumber}</span>
                  )}
                </div>
                <span className="rounded-card border-2 border-brand-black px-2 py-0.5 text-xs font-bold uppercase">
                  {org.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
