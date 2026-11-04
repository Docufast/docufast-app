// Email format check used on sign-up (4 Nov 2026). Stricter than the browser's own check, which accepts
// addresses such as a@b. It checks the shape only; whether the mailbox exists is proved by the confirmation email.
/** @param {string} value @returns {boolean} */
export function isValidEmail(value) {
  const v = String(value || "").trim();
  if (v.length < 6 || v.length > 254) return false;
  const at = v.indexOf("@");
  if (at < 1 || at !== v.lastIndexOf("@")) return false;
  const local = v.slice(0, at);
  const domain = v.slice(at + 1);
  if (local.length > 64) return false;
  if (!/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local)) return false;
  if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) return false;
  const labels = domain.split(".");
  if (labels.length < 2) return false;
  if (!labels.every((l) => /^[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test(l))) return false;
  return /^[A-Za-z]{2,}$/.test(labels[labels.length - 1]);
}
