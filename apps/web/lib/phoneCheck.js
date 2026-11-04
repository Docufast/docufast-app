// Phone number check for sign-up (4 Nov 2026). Returns the number in international form (+2348031234567),
// or null when it is not a usable number. Nigerian mobiles must start 070, 080, 081, 090 or 091.
/** @param {string} value @returns {string|null} */
export function normalizePhone(value) {
  let v = String(value || "").trim().replace(/[\s\-.()]/g, "");
  if (!v) return null;
  if (v.startsWith("00")) v = "+" + v.slice(2);
  else if (/^234\d{10}$/.test(v)) v = "+" + v;
  else if (/^0[789][01]\d{8}$/.test(v)) v = "+234" + v.slice(1);
  v = v.replace(/^\+2340/, "+234");
  if (!/^\+[1-9]\d{7,14}$/.test(v)) return null;
  if (v.startsWith("+234") && !/^\+234[789][01]\d{8}$/.test(v)) return null;
  return v;
}
