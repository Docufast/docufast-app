import Link from "next/link";
import Image from "next/image";
import { PLATFORM_NATIVE_TYPES } from "@/lib/platformNativeTypes";

export default function NotarizationPage() {
  return (
    <>
      <main className="mx-auto max-w-4xl px-6 py-6 lg:px-16 lg:py-10">
        <nav className="flex items-center gap-6 border-b-4 border-brand-black pb-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/logo-black.png" alt="Docufast" width={28} height={28} />
            <span className="text-xl font-extrabold tracking-wide text-brand-black">
              DOCUFAST
            </span>
          </Link>
          <Link href="/services" className="text-sm font-semibold uppercase tracking-wide">
            ← All services
          </Link>
          <Link href="/sign-in" className="ml-auto text-sm font-bold uppercase tracking-wide">
            Sign in
          </Link>
        </nav>

        <div className="mt-8">
          <h1 className="text-3xl font-extrabold text-brand-black">
            Platform-Native{" "}
            <span className="text-brand-gray">· {PLATFORM_NATIVE_TYPES.length} types</span>
          </h1>
          <p className="mt-2 text-brand-gray">
            No third-party processing — these run entirely on Docufast's own platform.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          {PLATFORM_NATIVE_TYPES.map((t) => (
            <Link
              key={t.slug}
              href={`/services/notarization/${t.slug}`}
              className="flex items-center justify-between rounded-card border-4 border-brand-black p-5 hover:bg-brand-yellow/10"
            >
              <div>
                <h2 className="font-bold text-brand-black">{t.label}</h2>
                <p className="mt-1 text-sm text-brand-gray">{t.desc}</p>
              </div>
              <span className="text-brand-gray">→</span>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t-4 border-brand-black bg-brand-black px-6 py-10 text-brand-white lg:px-16">
        <div className="flex flex-col gap-2 text-xs text-neutral-400">
          <span>SCUML SC251840209 | NDPC DCP/07770 | SMEDAN SUIN426476832438 | RC1893484</span>
          <span>© 2026 Docufast Integrated Services Ltd</span>
        </div>
      </footer>

      <a
        href="https://wa.me/2347085918205"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-card bg-brand-yellow px-4 py-3 text-sm font-bold text-brand-black shadow-lg hover:bg-brand-yellow-dark"
      >
        Chat with us on WhatsApp
      </a>
    </>
  );
}
