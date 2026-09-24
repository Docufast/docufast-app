"use client";

// Fixed, icon-only WhatsApp button shown site-wide. Positioned bottom-right;
// SupportChat sits just above it so the two never overlap.
export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/2349054951918"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border-4 border-brand-black bg-brand-yellow text-brand-black shadow-lg hover:bg-brand-yellow-dark"
    >
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12.002 2C6.478 2 2 6.477 2 12c0 1.887.52 3.653 1.426 5.163L2 22l4.978-1.396A9.953 9.953 0 0012.002 22C17.526 22 22 17.523 22 12S17.526 2 12.002 2zm0 18.06a8.02 8.02 0 01-4.088-1.115l-.293-.174-2.953.828.79-2.877-.19-.296A8.02 8.02 0 013.98 12c0-4.427 3.6-8.02 8.022-8.02 4.42 0 8.018 3.593 8.018 8.02 0 4.428-3.598 8.06-8.018 8.06z" />
      </svg>
    </a>
  );
}
