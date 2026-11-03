#!/usr/bin/env node
// scripts/indexnow.mjs (#133)
// Tells Bing (and the other IndexNow search engines) which docufast.ng pages changed, so they
// re-crawl within hours instead of weeks. Bing results feed ChatGPT search and Copilot.
//
// One-time setup (Olamide):
//   1. Generate a key in Bing Webmaster Tools (IndexNow) or any 32-character hex string.
//   2. Save it as apps/web/public/<key>.txt containing only the key, and deploy.
//   3. Add INDEXNOW_KEY=<key> in Vercel (Production) and in your local shell when you run this.
//   The key is public once deployed, but it still never goes in email, chat or WhatsApp.
//
// Use, after a deploy is live:
//   node scripts/indexnow.mjs https://www.docufast.ng/faq https://www.docufast.ng/about
//   node scripts/indexnow.mjs --sitemap          (every URL in the live sitemap; use sparingly)
//   add --dry-run to print what would be sent without sending it.

const HOST = 'www.docufast.ng';
const SITE = `https://${HOST}`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const useSitemap = args.includes('--sitemap');
const key = process.env.INDEXNOW_KEY || '';

function fail(msg) {
  console.error(`indexnow: ${msg}`);
  process.exit(1);
}

if (!/^[A-Za-z0-9-]{8,128}$/.test(key)) fail('INDEXNOW_KEY is missing or not a valid key (8 to 128 letters, numbers or dashes).');

let urls = args.filter((a) => !a.startsWith('--'));
if (useSitemap) {
  const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}
urls = [...new Set(urls)];
if (urls.length === 0) fail('give at least one URL, or --sitemap.');
for (const u of urls) {
  let parsed;
  try { parsed = new URL(u); } catch { fail(`not a URL: ${u}`); }
  if (parsed.host !== HOST) fail(`only ${HOST} URLs can be sent (got ${u}).`);
}
if (urls.length > 10000) fail('IndexNow takes at most 10,000 URLs per request.');

const keyLocation = `${SITE}/${key}.txt`;
const body = { host: HOST, key, keyLocation, urlList: urls };

if (dryRun) {
  console.log(`Would send ${urls.length} URL(s) to ${ENDPOINT}:`);
  for (const u of urls) console.log(`  ${u}`);
  process.exit(0);
}

// The engines reject the request if the key file is not live, so check it first.
const keyRes = await fetch(keyLocation);
const keyText = keyRes.ok ? (await keyRes.text()).trim() : '';
if (keyText !== key) fail(`${SITE}/<key>.txt is not live or does not match INDEXNOW_KEY. Deploy the key file first.`);

const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
});
// 200 = received, 202 = received and key check pending. Anything else is a problem.
if (res.status === 200 || res.status === 202) {
  console.log(`indexnow: sent ${urls.length} URL(s), status ${res.status}.`);
} else {
  fail(`the engine answered ${res.status} ${await res.text().catch(() => '')}`);
}
