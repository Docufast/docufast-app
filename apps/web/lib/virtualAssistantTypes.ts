// Shared source of truth for Virtual Office & Clerical — matches the
// Platform Playbook order_type enum values (3 types). No KYC/liveness
// check required — lower regulatory burden per the Playbook.

export interface VaType {
  slug: string;
  label: string;
  desc: string;
  outputFormats: string[];
}

export const VA_TYPES: VaType[] = [
  {
    slug: "document_typing",
    label: "Document Typing",
    desc: "Handwritten or scanned documents, turned into a clean typed document.",
    outputFormats: ["Word", "PDF"],
  },
  {
    slug: "data_entry",
    label: "Data Entry",
    desc: "Online or offline data captured into a structured spreadsheet.",
    outputFormats: ["Excel", "CSV"],
  },
  {
    slug: "transcription",
    label: "Transcription",
    desc: "Audio or video content turned into an accurate written transcript.",
    outputFormats: ["Word", "PDF"],
  },
];

export function getVaType(slug: string): VaType | undefined {
  return VA_TYPES.find((t) => t.slug === slug);
}
