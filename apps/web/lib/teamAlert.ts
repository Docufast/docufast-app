// Team alert for a new help chat question (JSB, 1 Nov 2026). Sent from the web server straight to
// SendGrid, so Emmanuel does not have to keep checking the dashboard. NO CUSTOMER DETAILS: no name,
// email, phone or question text; only that a question arrived, how the customer wants a reply,
// the page, and a link to the dashboard. Needs SENDGRID_API_KEY and OPS_ALERT_EMAILS in Vercel
// (server-only, never NEXT_PUBLIC). If either is missing, nothing is sent.
export async function alertNewQuestion(info: { replyBy: "email" | "WhatsApp" | "email or WhatsApp"; page: string | null }) {
  const key = process.env.SENDGRID_API_KEY;
  const to = String(process.env.OPS_ALERT_EMAILS || "").split(",").map((x) => x.trim()).filter(Boolean);
  if (!key || to.length === 0) return;
  const from = process.env.EMAIL_FROM || "docufastng@gmail.com";
  const app = (process.env.APP_URL || "https://www.docufast.ng").replace(/\/$/, "");
  const when = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short" }).format(new Date());
  const text = [
    "New customer question on the website",
    `Received: ${when} (Lagos time)`,
    `Reply by: ${info.replyBy}`,
    info.page ? `Asked on page: ${info.page}` : "",
    `Open the dashboard to read and answer it: ${app}/admin`,
    "Team standard: reply within 2 working hours, Monday to Friday, 8am to 6pm WAT.",
  ].filter(Boolean).join("\n");
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000); // never hold up the customer
    await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      signal: ctrl.signal,
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: to.map((email) => ({ email })) }],
        from: { email: from, name: "Docufast alerts" },
        subject: "[Docufast] New customer question",
        content: [{ type: "text/plain", value: text }],
      }),
    });
    clearTimeout(t);
  } catch (e) {
    console.error("question alert failed", e instanceof Error ? e.message : "unknown");
  }
}
