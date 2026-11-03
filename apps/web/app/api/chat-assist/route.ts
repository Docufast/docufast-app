import { NextResponse } from "next/server";
import { ORDERABLE_AFFIDAVIT_TYPES } from "@/lib/affidavitTypes";
import { chatPriceNotes } from "@/lib/homeChatPrices";
import { buildCatalogue, redact, sanitise, systemPrompt, MAX_QUESTION } from "@/lib/chatAssist";

// AI fallback for the home screen chat (JSB, 3 Nov 2026). OFF unless CHAT_AI=on, and it stays
// off until Sheriff signs off the data protection points (README for patch 0026).
// The browser only calls this when the fixed rules cannot match a question. Personal details are
// removed before anything leaves this server, nothing is stored, and the model can only pick
// services from our catalogue (lib/chatAssist.ts).
//
// Server env: CHAT_AI=on, ANTHROPIC_API_KEY, optional CHAT_AI_MODEL, CHAT_AI_DAILY_LIMIT
// (default 2000 questions a day per server instance). Add a Vercel Firewall rate limit on
// /api/chat-assist too (for example 10 requests a minute per IP).

export const dynamic = "force-dynamic";

const MODEL = process.env.CHAT_AI_MODEL || "claude-haiku-4-5";
const DAILY_LIMIT = Number(process.env.CHAT_AI_DAILY_LIMIT || 2000);
const TIMEOUT_MS = 6000;
const PER_IP_PER_MIN = 8;

let day = "";
let usedToday = 0;
const recent = new Map<string, number[]>();

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const allowed = (process.env.APP_ORIGINS ?? "").split(",").map((s) => s.trim().replace(/\/$/, "")).filter(Boolean);
  allowed.push(new URL(request.url).origin);
  return allowed.includes(origin.replace(/\/$/, ""));
}

function overLimits(ip: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== day) { day = today; usedToday = 0; recent.clear(); }
  if (usedToday >= DAILY_LIMIT) return true;
  const now = Date.now();
  const list = (recent.get(ip) ?? []).filter((t) => now - t < 60_000);
  if (list.length >= PER_IP_PER_MIN) return true;
  list.push(now);
  recent.set(ip, list);
  usedToday++;
  return false;
}

export async function POST(request: Request) {
  const off = NextResponse.json({ ok: false }, { status: 404 });
  if (process.env.CHAT_AI !== "on" || !process.env.ANTHROPIC_API_KEY) return off;
  if (!sameOrigin(request)) return NextResponse.json({ ok: false }, { status: 403 });

  let question = "";
  try {
    const body = await request.json();
    question = typeof body.question === "string" ? body.question : "";
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  question = redact(question.slice(0, MAX_QUESTION));
  if (question.length < 3) return NextResponse.json({ ok: false }, { status: 400 });

  const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (overLimits(ip)) return NextResponse.json({ ok: false }, { status: 429 });

  const catalogue = buildCatalogue(ORDERABLE_AFFIDAVIT_TYPES, chatPriceNotes(), process.env.NEXT_PUBLIC_NPC_SERVICES_ENABLED === "on");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 200,
        temperature: 0,
        system: systemPrompt(catalogue),
        messages: [{ role: "user", content: `Customer question: ${question}` }],
      }),
    });
    if (!res.ok) {
      console.error("chat-assist: model returned", res.status); // no customer text in logs
      return NextResponse.json({ ok: false }, { status: 502 });
    }
    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = (data.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("");
    const out = sanitise(text, catalogue);
    if (!out) return NextResponse.json({ ok: false }, { status: 200 });
    return NextResponse.json({ ok: true, reply: out.reply, actions: out.actions }, { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false }, { status: 504 });
  } finally {
    clearTimeout(timer);
  }
}
