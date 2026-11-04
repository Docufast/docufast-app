// API hardening (test report D12, D13, D14; 4 Nov 2026).
// - securityHeaders: the API only returns JSON or file downloads, so it can send the strictest headers.
// - requireBearer: a call with no sign-in token gets 401 (not 403), so the web app can send the person
//   to sign in, and nothing about the route is revealed.
// - notFound / errorHandler: JSON answers instead of Express's HTML pages (which named the framework
//   and could echo the path back).

export function securityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
}

export function requireBearer(req, res, next) {
  if (req.method === "OPTIONS") return next();
  const h = req.headers.authorization || "";
  if (!/^Bearer\s+\S+/.test(h)) return res.status(401).json({ error: "Not authenticated." });
  next();
}

export function notFound(req, res) {
  res.status(404).json({ error: "Not found." });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = Number(err.status || err.statusCode) || 500;
  if (status >= 500) console.error("Unhandled API error:", err.message);
  if (res.headersSent) return;
  // Body-parser errors (bad JSON, too large) keep their 4xx status with a plain message.
  const message = status === 413 ? "That request is too large." : status === 400 ? "That request could not be read." : status < 500 ? "Request refused." : "Something went wrong on our side. Please try again.";
  res.status(status).json({ error: message });
}
