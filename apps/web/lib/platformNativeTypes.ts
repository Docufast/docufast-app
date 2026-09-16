// Shared source of truth for Platform-Native services — matches the
// Platform Playbook order_type enum values (3 types). No third-party
// processing involved for these.

export interface PlatformNativeType {
  slug: string;
  label: string;
  desc: string;
}

export const PLATFORM_NATIVE_TYPES: PlatformNativeType[] = [
  {
    slug: "digital_notarization",
    label: "Digital Notarization",
    desc: "A live AV session with a registered Notary Public. Produces a sealed PDF with a registration number, verifiable from the notarial register.",
  },
  {
    slug: "document_vault_subscription",
    label: "Document Vault Subscription",
    desc: "Annual flat-fee for permanent encrypted storage beyond the free 1-month access period, plus ongoing compliance reminders.",
  },
  {
    slug: "compliance_reminder_setup",
    label: "Compliance Reminder Setup",
    desc: "Set up automated deadline tracking for an entity's CAC, FIRS, LIRS, NDPC, SCUML, or NITDA obligations.",
  },
];

export function getPlatformNativeType(slug: string): PlatformNativeType | undefined {
  return PLATFORM_NATIVE_TYPES.find((t) => t.slug === slug);
}
