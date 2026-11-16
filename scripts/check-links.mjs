// Checks every published listing's Website URL and prints the status. Usage: node scripts/check-links.mjs
import fs from "node:fs";
const rows = [];
for (const f of fs.readdirSync("data").filter((f) => f.endsWith(".airtable.json"))) {
  const j = JSON.parse(fs.readFileSync("data/" + f, "utf8"));
  for (const r of j.records || []) {
    const x = r.fields || {};
    if (x.Published && x.Website) rows.push({ cat: f.replace(".airtable.json", ""), name: x.Name, url: x.Website });
  }
}
const out = [];
let i = 0;
async function worker() {
  while (i < rows.length) {
    const r = rows[i++];
    try {
      const res = await fetch(r.url, { redirect: "follow", signal: AbortSignal.timeout(15000), headers: { "User-Agent": "Mozilla/5.0 (compatible; link-check)" } });
      const text = res.ok ? (await res.text()).slice(0, 60000).toLowerCase() : "";
      const parked = /domain (is )?for sale|buy this domain|this domain may be for sale|sedo\.com|hugedomains|godaddy\.com\/domainsearch/.test(text);
      const closed = /permanently closed|has closed|we have closed|closed for good|no longer in business|out of business/.test(text);
      out.push({ ...r, status: res.status, final: res.url !== r.url ? res.url : "", parked, closed });
    } catch (e) {
      out.push({ ...r, status: "ERR " + (e.cause?.code || e.name) });
    }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
out.sort((a, b) => String(a.status).localeCompare(String(b.status)));
fs.writeFileSync("link-check.json", JSON.stringify(out, null, 1));
const bad = out.filter((o) => o.status !== 200 || o.parked || o.closed);
console.log(`${out.length} checked, ${bad.length} to look at`);
for (const o of bad) console.log(`${o.status}${o.parked ? " PARKED" : ""}${o.closed ? " CLOSED-TEXT" : ""} | ${o.cat} | ${o.name} | ${o.url}${o.final ? " -> " + o.final : ""}`);
