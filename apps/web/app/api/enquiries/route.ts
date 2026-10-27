import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Help chat questions (JSB, 27 Oct 2026): a visitor's question goes to Docufast's own database
// and appears on the admin dashboard. Server only: the service role key never reaches the
// browser, and the table has RLS on with no public policies
// (supabase/migrations/20261027_enquiries.sql).

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?[0-9][0-9\s-]{6,20}$/;

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
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

  const name = text(body.name, 120);
  const email = text(body.email, 254).toLowerCase();
  const phone = text(body.phone, 32);
  const question = typeof body.question === "string" ? body.question.trim() : "";
  const page = text(body.page, 200);

  if (question.length < 2) {
    return NextResponse.json({ error: "Please type your question." }, { status: 400 });
  }
  if (question.length > 2000) {
    return NextResponse.json({ error: "Please keep your question under 2,000 characters." }, { status: 400 });
  }
  if (!email && !phone) {
    return NextResponse.json(
      { error: "Please give an email address or WhatsApp number so we can reply." },
      { status: 400 }
    );
  }
  if (email && !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (phone && !PHONE_PATTERN.test(phone)) {
    return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json(
      { error: "We could not send your question right now. Please message us on WhatsApp." },
      { status: 503 }
    );
  }

  const supabaseAdmin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { error } = await supabaseAdmin.from("enquiries").insert({
    name: name || null,
    email: email || null,
    phone: phone || null,
    question,
    page: page || null,
  });

  if (error) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again or message us on WhatsApp." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
