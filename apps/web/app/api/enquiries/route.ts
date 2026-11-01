import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyTurnstile } from "@/lib/turnstile";
import { alertNewQuestion } from "@/lib/teamAlert";

// Help chat questions (JSB, 27 Oct 2026): a visitor's question goes to Docufast's own database
// and appears on the admin dashboard. Server only: the service role key never reaches the
// browser, and the table has RLS on with no public policies
// (supabase/migrations/20261027_enquiries.sql).
//
// Security review 31 Oct 2026 (#219): Origin check, Cloudflare Turnstile, a site-wide flood cap
// and a per-contact cap. No IP address is stored, so no new personal data is collected.

// Letters, digits and . _ % + - only, so a stored address cannot add mailto parameters.
const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
const PHONE_PATTERN = /^\+?[0-9][0-9\s-]{6,20}$/;
const SITE_CAP_PER_10_MIN = 30; // all visitors together
const CONTACT_CAP_PER_HOUR = 3; // same email or phone

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const allowed = (process.env.APP_ORIGINS ?? "").split(",").map((s) => s.trim().replace(/\/$/, "")).filter(Boolean);
  allowed.push(new URL(request.url).origin);
  return allowed.includes(origin.replace(/\/$/, ""));
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Please try again from docufast.ng." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Please try again." }, { status: 400 });
  }

  // Honeypot: real people never fill this hidden field. Pretend success so bots learn nothing.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  if (!(await verifyTurnstile(body.turnstileToken, ip))) {
    return NextResponse.json({ error: "Please complete the check and try again." }, { status: 400 });
  }

  const name = text(body.name, 120);
  const email = text(body.email, 254).toLowerCase();
  const phoneRaw = text(body.phone, 32);
  const question = typeof body.question === "string" ? body.question.trim() : "";
  const page = text(body.page, 200);

  if (question.length < 2) {
    return NextResponse.json({ error: "Please type your question." }, { status: 400 });
  }
  if (question.length > 2000) {
    return NextResponse.json({ error: "Please keep your question under 2,000 characters." }, { status: 400 });
  }
  if (!email && !phoneRaw) {
    return NextResponse.json(
      { error: "Please give an email address or WhatsApp number so we can reply." },
      { status: 400 }
    );
  }
  if (email && !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (phoneRaw && !PHONE_PATTERN.test(phoneRaw)) {
    return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
  }
  const phone = phoneRaw.replace(/[^0-9+]/g, ""); // stored and compared in one form

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json(
      { error: "We could not send your question right now. Please message us on WhatsApp." },
      { status: 503 }
    );
  }

  const supabaseAdmin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const busy = NextResponse.json(
    { error: "We have received a lot of questions just now. Please try again shortly or message us on WhatsApp." },
    { status: 429 }
  );

  // Site-wide flood cap.
  const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count: recent, error: e1 } = await supabaseAdmin
    .from("enquiries").select("id", { count: "exact", head: true }).gte("created_at", tenMinAgo);
  if (e1) {
    console.error("enquiries count failed", e1.message);
    return NextResponse.json({ error: "Something went wrong. Please try again or message us on WhatsApp." }, { status: 500 });
  }
  if ((recent ?? 0) >= SITE_CAP_PER_10_MIN) return busy;

  // Per-contact cap.
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  let q = supabaseAdmin.from("enquiries").select("id", { count: "exact", head: true }).gte("created_at", hourAgo);
  q = email && phone ? q.or(`email.eq.${email},phone.eq.${phone}`) : email ? q.eq("email", email) : q.eq("phone", phone);
  const { count: mine } = await q;
  if ((mine ?? 0) >= CONTACT_CAP_PER_HOUR) return busy;

  const { error } = await supabaseAdmin.from("enquiries").insert({
    name: name || null,
    email: email || null,
    phone: phone || null,
    question,
    page: page || null,
  });

  if (error) {
    console.error("enquiries insert failed", error.message);
    return NextResponse.json(
      { error: "Something went wrong. Please try again or message us on WhatsApp." },
      { status: 500 }
    );
  }

  await alertNewQuestion({ replyBy: email && phone ? "email or WhatsApp" : email ? "email" : "WhatsApp", page: page || null });
  return NextResponse.json({ ok: true });
}
