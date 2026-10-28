import { NextResponse, type NextRequest } from "next/server";

// Per-request nonce CSP (#68 H1). Next.js reads the nonce from the request's
// Content-Security-Policy header and stamps it on its own scripts.
export function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const isProduction = process.env.VERCEL_ENV === "production";
  const backendUrl = isProduction
    ? "https://docufast-app-production.up.railway.app"
    : "https://docufast-app-staging.up.railway.app";

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    // H1 (#192): <style> and <link> elements need our nonce or our own origin, so injected
    // stylesheets are blocked. Inline style="" attributes are still allowed: React renders
    // some on the server, and they cannot load anything or run script.
    `style-src 'self' 'nonce-${nonce}'`,
    `style-src-elem 'self' 'nonce-${nonce}'`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src 'self' https://*.supabase.co ${backendUrl} https://*.r2.cloudflarestorage.com`,
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|images/|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
