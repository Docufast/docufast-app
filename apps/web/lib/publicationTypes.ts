// Shared source of truth for Newspaper Publications — matches the Platform
// Playbook order_type enum values (3 types). Always paired with a parent
// affidavit or CAC filing — never standalone.

export interface PublicationField {
  label: string;
  placeholder?: string;
  type?: "text" | "textarea" | "select";
  options?: string[];
}

export interface PublicationType {
  slug: string;
  label: string;
  desc: string;
  fields: PublicationField[];
}

export const PUBLICATION_TYPES: PublicationType[] = [
  {
    slug: "name_change_publication",
    label: "Name Change Publication",
    desc: "Public notice of a legal name change, paired with the supporting affidavit.",
    fields: [
      { label: "Former name" },
      { label: "New name" },
      { label: "Reason", placeholder: "e.g. marriage, personal preference" },
      {
        label: "Preferred publication",
        type: "select",
        options: ["National daily", "State gazette"],
      },
      { label: "Printed copies needed", placeholder: "Enter a number, or 'Digital only'" },
    ],
  },
  {
    slug: "loss_of_documents_publication",
    label: "Loss of Documents Publication",
    desc: "Public notice of a lost document, paired with the supporting affidavit.",
    fields: [
      { label: "Document lost", placeholder: "e.g. International Passport" },
      { label: "Owner's full name" },
      {
        label: "Preferred publication",
        type: "select",
        options: ["National daily", "State gazette"],
      },
      { label: "Printed copies needed", placeholder: "Enter a number, or 'Digital only'" },
    ],
  },
  {
    slug: "incorporated_trustees_publication",
    label: "Incorporated Trustees Publication",
    desc: "Mandatory 2-week public notice, paired with a CAC Incorporated Trustees filing.",
    fields: [
      { label: "Proposed trustee name" },
      { label: "Entity type", placeholder: "e.g. NGO, church, foundation" },
      {
        label: "Preferred publication",
        type: "select",
        options: ["National daily", "State gazette"],
      },
    ],
  },
];

export function getPublicationType(slug: string): PublicationType | undefined {
  return PUBLICATION_TYPES.find((t) => t.slug === slug);
}
