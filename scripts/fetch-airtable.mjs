// Pulls every category table from Airtable into data/<slug>.airtable.json
// and downloads photos into public/photos/ (Airtable photo links expire after a few hours).
//
// Needs two environment variables:
//   AIRTABLE_TOKEN    a personal access token with "data.records:read" on the base
//   AIRTABLE_BASE_ID  the base ID, starts with "app"

import fs from "node:fs/promises";
import path from "node:path";
import config from "../site.config.mjs";

const apiBase = process.env.AIRTABLE_API_URL || "https://api.airtable.com/v0";
const token = process.env.AIRTABLE_TOKEN;
const baseId = process.env.AIRTABLE_BASE_ID;
if (!token || !baseId) {
  console.error("Missing AIRTABLE_TOKEN or AIRTABLE_BASE_ID. Keeping the existing data snapshot.");
  process.exit(1);
}

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const photoDir = path.join(root, "public", "photos");
await fs.mkdir(photoDir, { recursive: true });
await fs.mkdir(path.join(root, "data"), { recursive: true });

async function getJSON(url) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) return res.json();
    if (res.status === 429 || res.status >= 500) {
      await new Promise((r) => setTimeout(r, 1500 * attempt));
      continue;
    }
    throw new Error(`Airtable said ${res.status}: ${await res.text()}`);
  }
  throw new Error(`Airtable kept failing for ${url}`);
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Photo download failed (${res.status})`);
  await fs.writeFile(dest, Buffer.from(await res.arrayBuffer()));
}

const keepPhotos = new Set();

for (const cat of config.categories) {
  const records = [];
  let offset;
  do {
    const url = new URL(`${apiBase}/${baseId}/${encodeURIComponent(cat.table)}`);
    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);
    const page = await getJSON(url);
    records.push(...page.records);
    offset = page.offset;
  } while (offset);

  for (const rec of records) {
    const photos = rec.fields[cat.fields.photo];
    if (!Array.isArray(photos) || !photos.length) continue;
    const p = photos[0];
    const src = p.thumbnails?.large?.url || p.url;
    const ext = (p.type?.split("/")[1] || "jpg").replace("jpeg", "jpg").replace(/[^a-z0-9]/g, "");
    const file = `${cat.slug}-${rec.id}-${p.id}.${ext}`;
    const dest = path.join(photoDir, file);
    keepPhotos.add(file);
    try {
      await fs.access(dest);
    } catch {
      try {
        await download(src, dest);
        console.log(`  saved photo ${file}`);
      } catch (e) {
        console.warn(`  could not save photo for ${rec.fields[cat.fields.name]}: ${e.message}`);
        rec.fields[cat.fields.photo] = [];
        continue;
      }
    }
    const t = p.thumbnails?.large;
    rec.fields[cat.fields.photo] = [
      { localPath: `/photos/${file}`, width: t?.width || p.width, height: t?.height || p.height },
    ];
  }

  await fs.writeFile(
    path.join(root, "data", `${cat.slug}.airtable.json`),
    JSON.stringify({ records }, null, 1)
  );
  console.log(`${cat.title}: ${records.length} records`);
}

// Remove photos that are no longer used.
for (const f of await fs.readdir(photoDir)) {
  if (!keepPhotos.has(f) && !f.startsWith(".")) await fs.unlink(path.join(photoDir, f));
}
