import { pageMetadata } from "@/lib/seo/pages";
import AffidavitsClient from "./AffidavitsClient";

export const metadata = pageMetadata("/services/affidavits");

export default function AffidavitsPage() {
  return <AffidavitsClient />;
}
