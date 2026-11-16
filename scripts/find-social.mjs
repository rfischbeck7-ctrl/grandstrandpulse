// Reads each listing's own website and collects the social profile links the business itself publishes.
// Usage: node scripts/find-social.mjs   (writes data/social-auto.json; data/social.json holds hand-checked entries and wins)
import fs from "node:fs";

const rows = [];
for (const f of fs.readdirSync("data").filter((f) => f.endsWith(".airtable.json"))) {
  const j = JSON.parse(fs.readFileSync("data/" + f, "utf8"));
  for (const r of j.records || []) {
    const x = r.fields || {};
    if (x.Published && x.Website) rows.push({ name: x.Name, url: x.Website });
  }
}

const NETWORKS = {
  facebook: /^https?:\/\/(?:www\.|m\.|web\.)?facebook\.com\/(?!sharer|share|plugins|tr\b|dialog|login|policies|help|privacy|groups\/discover|events\/|photo|watch|pages\/create|people\/|hashtag|l\.php|about|legal|business)([A-Za-z0-9_.\-%]+(?:\/[A-Za-z0-9_.\-%]+)?)\/?(?:[?#].*)?$/i,
  instagram: /^https?:\/\/(?:www\.)?instagram\.com\/(?!p\/|reel|explore|accounts|about|developer|legal|share)([A-Za-z0-9_.]+)\/?(?:[?#].*)?$/i,
  tiktok: /^https?:\/\/(?:www\.)?tiktok\.com\/@([A-Za-z0-9_.]+)\/?(?:[?#].*)?$/i,
  youtube: /^https?:\/\/(?:www\.)?youtube\.com\/(?:@[A-Za-z0-9_.\-]+|c\/[A-Za-z0-9_.\-]+|channel\/[A-Za-z0-9_\-]+|user\/[A-Za-z0-9_.\-]+)\/?(?:[?#].*)?$/i,
};

function extract(html) {
  const found = {};
  const hrefs = [...html.matchAll(/href\s*=\s*["']([^"'#][^"']*)["']/gi)].map((m) => m[1].replace(/&amp;/g, "&").trim());
  for (const h of hrefs) {
    for (const [net, re] of Object.entries(NETWORKS)) {
      if (found[net]) continue;
      if (re.test(h)) {
        const clean = h.split(/[?#]/)[0].replace(/\/$/, "");
        if (net === "facebook" && /facebook\.com\/(?:profile\.php)$/i.test(clean)) continue;
        found[net] = clean;
      }
    }
  }
  return found;
}

const out = {};
const failed = [];
let i = 0;
async function worker() {
  while (i < rows.length) {
    const r = rows[i++];
    try {
      const res = await fetch(r.url, { redirect: "follow", signal: AbortSignal.timeout(15000), headers: { "User-Agent": "Mozilla/5.0 (compatible; MyrtleBeachCompass social-link finder)" } });
      if (!res.ok) { failed.push(`${res.status} ${r.name}`); continue; }
      const html = (await res.text()).slice(0, 400000);
      const s = extract(html);
      if (Object.keys(s).length) out[r.name] = s;
    } catch (e) {
      failed.push(`ERR ${e.cause?.code || e.name} ${r.name}`);
    }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync("data/social-auto.json", JSON.stringify(sorted, null, 1) + "\n");
console.log(`${rows.length} sites read, ${Object.keys(sorted).length} with social links, ${failed.length} unreadable`);
fs.writeFileSync("social-unreadable.txt", failed.sort().join("\n") + "\n");
