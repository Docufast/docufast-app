"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export interface Org {
  id: string;
  name: string;
  role: string;
}

const PERSONAL_ORG: Org = { id: "personal", name: "Personal", role: "Individual" };
const ACTIVE_KEY = "docufast_active_org";

interface OrgContextValue {
  orgs: Org[];
  activeOrgId: string;
  setActiveOrgId: (id: string) => void;
  addOrg: (name: string, rcNumber?: string) => Promise<{ error: string | null }>;
  loading: boolean;
}

const OrgContext = createContext<OrgContextValue | undefined>(undefined);

export function OrgProvider({ children }: { children: ReactNode }) {
  const [orgs, setOrgs] = useState<Org[]>([PERSONAL_ORG]);
  const [activeOrgId, setActiveOrgIdState] = useState<string>("personal");
  const [loading, setLoading] = useState(true);

  async function refreshOrgs() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setOrgs([PERSONAL_ORG]);
      setLoading(false);
      return;
    }

    // Real entities table — replaces the old localStorage-only list.
    const { data, error } = await supabase
      .from("entities")
      .select("id, name")
      .order("created_at", { ascending: true });

    if (error || !data) {
      setOrgs([PERSONAL_ORG]);
      setLoading(false);
      return;
    }

    const realOrgs: Org[] = data.map((e) => ({
      id: e.id,
      name: e.name,
      role: "Owner",
    }));
    setOrgs([PERSONAL_ORG, ...realOrgs]);
    setLoading(false);
  }

  useEffect(() => {
    refreshOrgs();
    try {
      const storedActive = localStorage.getItem(ACTIVE_KEY);
      if (storedActive) setActiveOrgIdState(storedActive);
    } catch {
      // localStorage unavailable — fine, defaults to Personal.
    }
  }, []);

  function setActiveOrgId(id: string) {
    setActiveOrgIdState(id);
    try {
      localStorage.setItem(ACTIVE_KEY, id);
    } catch {}
  }

  async function addOrg(name: string, rcNumber?: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { error: "You need to be signed in to add a business." };

    const { error } = await supabase.from("entities").insert({
      owner_id: user.id,
      name,
      rc_number: rcNumber || null,
    });

    if (error) return { error: error.message };

    await refreshOrgs();
    return { error: null };
  }

  return (
    <OrgContext.Provider value={{ orgs, activeOrgId, setActiveOrgId, addOrg, loading }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error("useOrg must be used within an OrgProvider");
  return ctx;
}
