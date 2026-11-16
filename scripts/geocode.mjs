// Looks up coordinates for each listing's street address with OpenStreetMap's Nominatim API (open data, ODbL: credit "OpenStreetMap contributors").
// Usage policy: max 1 request/second, identifying User-Agent. Results are cached in data/geo.json; only missing names are looked up.
// Usage: node scripts/geocode.mjs
import fs from "node:fs";

const cachePath = "data/geo.json";
const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, "utf8")) : {};
const rows = [];
for (const f of fs.readdirSync("data").filter((f) => f.endsWith(".airtable.json"))) {
  const j = JSON.parse(fs.readFileSync("data/" + f, "utf8"));
  for (const r of j.records || []) {
    const x = r.fields || {};
    if (x.Published && x.Address && !cache[x.Name]) rows.push({ name: x.Name, address: x.Address });
  }
}
// Grand Strand bounding box (Little River to Georgetown, a little inland for Conway)
const inBox = (lat, lon) => lat > 33.2 && lat < 34.0 && lon > -79.6 && lon < -78.4;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ok = 0, miss = 0;
for (const r of rows) {
  const clean = r.address.replace(/\b(Unit|Suite|Ste|#)\s*[\w-]+/gi, "").replace(/\s+/g, " ").trim();
  const url = "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=us&q=" + encodeURIComponent(clean);
  try {
    const res = await fetch(url, { headers: { "User-Agent": "MyrtleBeachCompass-directory/1.0 (geocoding listing addresses)" }, signal: AbortSignal.timeout(20000) });
    const j = res.ok ? await res.json() : [];
    const hit = j[0];
    if (hit && inBox(+hit.lat, +hit.lon)) {
      cache[r.name] = { lat: Math.round(+hit.lat * 1e5) / 1e5, lon: Math.round(+hit.lon * 1e5) / 1e5, precise: ["house", "building", "amenity", "tourism", "leisure", "shop"].includes(hit.addresstype) || hit.category === "building" || hit.category === "amenity" || hit.category === "tourism" || hit.category === "leisure" };
      ok++;
    } else {
      miss++;
      console.log("no match:", r.name, "|", clean);
    }
  } catch (e) {
    miss++;
    console.log("error:", r.name, e.name);
  }
  await sleep(1100);
}
fs.writeFileSync(cachePath, JSON.stringify(cache, null, 1) + "\n");
console.log(`${ok} found, ${miss} missed, ${Object.keys(cache).length} in cache`);
