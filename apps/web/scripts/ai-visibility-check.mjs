#!/usr/bin/env node
// scripts/ai-visibility-check.mjs
// Release check: can search engines and AI tools read docufast.ng the way we intend?
//
//   node scripts/ai-visibility-check.mjs                      # checks https://www.docufast.ng, expects launch mode
//   node scripts/ai-visibility-check.mjs https://staging-url   # another deployment
//   EXPECT_INDEXABLE=false node scripts/ai-visibility-check.mjs  # beta mode: expects everything blocked
//
// Needs Node 18 or newer. No packages. Exits 1 if any check fails, so it can gate a deploy.
// It fetches raw HTML and runs no JavaScript, which is exactly what GPTBot, ClaudeBot and PerplexityBot see.

const BASE = (process.argv[2] || 'https://www.docufast.ng').replace(/\/$/, '');
const EXPECT_INDEXABLE = process.env.EXPECT_INDEXABLE !== 'false';

const BOTS = [
  { token: 'Googlebot', ua: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
  { token: 'Bingbot', ua: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)' },
  { token: 'OAI-SearchBot', ua: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)' },
  { token: 'GPTBot', ua: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.1; +https://openai.com/gptbot)' },
  { token: 'Claude-SearchBot', ua: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-SearchBot/1.0; +https://www.anthropic.com)' },
  { token: 'ClaudeBot', ua: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)' },
  { token: 'PerplexityBot', ua: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)' },
];

// Pages that must never be open to any bot, whatever the mode.
const MUST_BE_PRIVATE = ['/account', '/vault', '/orders', '/admin', '/api/health', '/verify/EXAMPLE-ID'];

let failures = 0;
const fail = (msg) => { failures++; console.log(`  FAIL  ${msg}`); };
const pass = (msg) => console.log(`  ok    ${msg}`);

// ---- robots.txt parsing (most specific user-agent group wins; longest path rule wins; allow wins a tie)
function parseRobots(text) {
  const groups = [];
  let current = null;
  let lastWasAgent = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim();
    if (!line) continue;
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (key === 'user-agent') {
      if (!lastWasAgent) { current = { agents: [], rules: [] }; groups.push(current); }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else {
      lastWasAgent = false;
      if (current && (key === 'allow' || key === 'disallow')) current.rules.push({ type: key, path: value });
    }
  }
  return groups;
}

function groupFor(groups, token) {
  const t = token.toLowerCase();
  let best = null;
  let bestLen = -1;
  for (const g of groups) {
    for (const a of g.agents) {
      if (a !== '*' && t.includes(a) && a.length > bestLen) { best = g; bestLen = a.length; }
    }
  }
  return best || groups.find((g) => g.agents.includes('*')) || null;
}

function allowed(groups, token, path) {
  const g = groupFor(groups, token);
  if (!g) return true;
  let verdict = { len: -1, allow: true };
  for (const r of g.rules) {
    if (r.type === 'disallow' && r.path === '') continue; // empty Disallow = allow all
    const pattern = r.path.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    const re = new RegExp('^' + pattern.replace(/\\\$$/, '$'));
    if (re.test(path)) {
      const len = r.path.length;
      const isAllow = r.type === 'allow';
      if (len > verdict.len || (len === verdict.len && isAllow)) verdict = { len, allow: isAllow };
    }
  }
  return verdict.allow;
}

async function get(url, ua) {
  const res = await fetch(url, { headers: { 'user-agent': ua }, redirect: 'follow' });
  return { status: res.status, text: await res.text() };
}

const pick = (re, html) => (html.match(re) || [])[1];

async function main() {
  console.log(`Checking ${BASE} (expecting ${EXPECT_INDEXABLE ? 'launch mode: public pages open' : 'beta mode: closed'})\n`);

  // 1. robots.txt
  console.log('robots.txt');
  const robots = await get(`${BASE}/robots.txt`, BOTS[0].ua);
  if (robots.status !== 200) fail(`robots.txt returned ${robots.status}`);
  const groups = parseRobots(robots.text);
  for (const b of BOTS) {
    const ok = allowed(groups, b.token, '/');
    if (ok === EXPECT_INDEXABLE) pass(`${b.token} ${ok ? 'may' : 'may not'} read the home page`);
    else fail(`${b.token} ${ok ? 'may' : 'may not'} read the home page`);
    for (const p of MUST_BE_PRIVATE) {
      if (allowed(groups, b.token, p)) fail(`${b.token} may read private path ${p}`);
    }
  }

  // 2. sitemap
  console.log('\nsitemap.xml');
  const sm = await get(`${BASE}/sitemap.xml`, BOTS[0].ua);
  const urls = [...sm.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (sm.status !== 200 || urls.length === 0) fail(`sitemap missing or empty (status ${sm.status})`);
  else pass(`${urls.length} URLs listed`);

  // 3. each page, as a text-only AI crawler sees it
  console.log('\npages (raw HTML, no JavaScript)');
  const titles = new Map();
  const descriptions = new Map();
  for (const url of urls) {
    const path = new URL(url).pathname || '/';
    const page = await get(`${BASE}${path}`, BOTS[3].ua); // GPTBot: a crawler that runs no JavaScript
    const label = path;
    if (page.status !== 200) { fail(`${label} returned ${page.status}`); continue; }
    const html = page.text;
    const title = pick(/<title[^>]*>([^<]*)<\/title>/i, html) || '';
    const desc = pick(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i, html) || '';
    const robotsMeta = pick(/<meta[^>]+name="robots"[^>]+content="([^"]*)"/i, html) || '';
    const ogText = [...html.matchAll(/<meta[^>]+(?:property|name)="(?:og|twitter):(?:title|description)"[^>]+content="([^"]*)"/gi)].map((m) => m[1]).join(' ');
    const hasLd = /<script[^>]+type="application\/ld\+json"[^>]*>/i.test(html);
    const body = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

    const problems = [];
    if (EXPECT_INDEXABLE && /noindex/i.test(robotsMeta)) problems.push('has noindex');
    if (!EXPECT_INDEXABLE && !/noindex/i.test(robotsMeta)) problems.push('missing noindex in beta mode');
    if (!hasLd) problems.push('no JSON-LD in the server HTML');
    if (!title) problems.push('no <title>');
    if (!desc) problems.push('no meta description');
    if (/\u2014/.test(title + desc + ogText)) problems.push('em dash in title, description or social card');
    if (/regulated|regulatory compliance platform|licenced/i.test(title + desc + ogText + body)) problems.push('banned wording (regulated / Regulatory Compliance Platform / Licenced)');
    if (/\[(?:[A-Z0-9 ,.\-]+)\]/.test(body)) problems.push('prints an unfilled [PLACEHOLDER]');
    if (path.startsWith('/guides/') && body.length < 2500) problems.push(`thin guide (${body.length} characters of text)`);
    if (titles.has(title)) problems.push(`same title as ${titles.get(title)}`);
    if (desc && descriptions.has(desc)) problems.push(`same description as ${descriptions.get(desc)}`);
    titles.set(title, label);
    if (desc) descriptions.set(desc, label);

    if (problems.length) fail(`${label}: ${problems.join('; ')}`);
    else pass(`${label}  "${title}"`);
  }

  // 4. llms.txt (low impact, but if we publish it, it must work)
  console.log('\nllms.txt');
  const llms = await get(`${BASE}/llms.txt`, BOTS[3].ua);
  if (llms.status === 200 && llms.text.startsWith('# ')) pass('present');
  else fail(`missing or malformed (status ${llms.status})`);

  console.log(`\n${failures === 0 ? 'All checks passed.' : `${failures} check(s) failed.`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
