// Builds the static site into dist/ from data/*.airtable.json + site.config.mjs.
import fs from "node:fs/promises";
import path from "node:path";
import config from "../site.config.mjs";
import { artSvg } from "./art.mjs";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const dist = path.join(root, "dist");
const origin = `https://${config.domain}`;
const buildDate = new Date().toISOString().slice(0, 10);
// AdSense: accept "pub-..." or "ca-pub-..."; anything else turns ads off rather than breaking the build.
const adsensePub = (() => {
  const m = String(config.adsensePublisherId || "").trim().match(/^(?:ca-)?(pub-\d{10,20})$/);
  if (config.adsensePublisherId && !m) console.warn(`AdSense ID "${config.adsensePublisherId}" doesn't look like pub-1234567890123456; ads are off.`);
  return m ? m[1] : "";
})();

// ---------- helpers ----------
const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const slugify = (s) =>
  String(s).toLowerCase().replace(/['’]/g, "").replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const asList = (v) => (Array.isArray(v) ? v : v === undefined || v === null || v === "" ? [] : [v]);
const telHref = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  return `tel:+${digits.length === 10 ? "1" + digits : digits}`;
};
const plural = (n, noun) => `${n} ${n === 1 ? noun.one : noun.many}`;
const safeUrl = (u) => (/^https?:\/\//i.test(u || "") ? u : "");

async function write(rel, content) {
  const file = path.join(dist, rel);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content);
}
async function copyDir(src, dest) {
  try {
    await fs.cp(src, dest, { recursive: true });
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
}

// ---------- load data ----------
const areaNames = config.areas.map((a) => a.name);
const categories = [];
for (const cat of config.categories) {
  const file = path.join(root, "data", `${cat.slug}.airtable.json`);
  const raw = JSON.parse(await fs.readFile(file, "utf8"));
  const f = cat.fields;
  const used = new Set();
  const items = raw.records
    .filter((r) => r.fields[f.published] === true && r.fields[f.name])
    .map((r) => {
      const x = r.fields;
      let slug = slugify(x[f.name]);
      while (used.has(slug)) slug += "-2";
      used.add(slug);
      const photo = asList(x[f.photo])[0];
      return {
        id: r.id,
        slug,
        name: x[f.name],
        area: x[f.area] || "",
        description: x[f.description] || "",
        subtitle: f.subtitle ? x[f.subtitle] || "" : "",
        address: x[f.address] || "",
        phone: x[f.phone] || "",
        website: safeUrl(x[f.website]),
        maps:
          safeUrl(x[f.maps]) ||
          (x[f.address]
            ? "https://www.google.com/maps/search/?api=1&query=" +
              encodeURIComponent(`${x[f.name]}, ${x[f.address]}`)
            : ""),
        photo: photo?.localPath ? { src: photo.localPath, w: photo.width, h: photo.height } : null,
        photoCredit: x[f.photoCredit] || "",
        raw: x,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  categories.push({ ...cat, items });
}

// ---------- shared pieces ----------
const fonts =
  "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Bowlby+One&display=swap";

function layout({ title, description, canonical, body, jsonLd, active, hero = "" }) {
  const nav = categories
    .map(
      (c) =>
        `<a href="/${c.slug}/"${active === c.slug ? ' aria-current="page"' : ""}>${esc(c.title)}</a>`
    )
    .join("");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${origin}${canonical}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${origin}${canonical}">
<meta property="og:site_name" content="${esc(config.siteName)}">
<meta name="theme-color" content="#0f3346">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fonts}">
<link rel="stylesheet" href="/assets/styles.css">
${adsensePub ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${adsensePub}" crossorigin="anonymous"></script>` : ""}
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, "\\u003c")}</script>` : ""}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
${hero ? '<div class="hero-wrap">' : ""}<header class="site-head">
  <a class="brand" href="/" aria-label="${esc(config.siteName)} home">
    <svg class="brand-mark" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="12" fill="none" stroke="currentColor" stroke-width="2.5"/><g transform="rotate(40 14 14)"><path d="M14 4.5 17.4 14H10.6Z" fill="#ffc93c" stroke="#0f3346" stroke-width="1.2" stroke-linejoin="round"/><path d="M10.6 14H17.4L14 23.5Z" fill="#0f3346"/></g></svg>
    <span>${esc(config.siteName)}</span>
  </a>
  <nav class="site-nav" aria-label="Categories">${nav}</nav>
</header>
${hero ? hero + "</div>" : ""}
<main id="main">
${body}
</main>
<footer class="site-foot">
  <p>Every listing is checked against the business or an official visitor guide, but hours and details change. Call ahead before you drive over.</p>
  ${config.contactEmail ? `<p>Run one of these places, or spotted something wrong? <a href="mailto:${esc(config.contactEmail)}">Email ${esc(config.contactEmail)}</a>.</p>` : ""}
  <p class="foot-small">© ${new Date().getFullYear()} ${esc(config.siteName)}. ${esc(config.tagline || "")}. Listings last refreshed ${buildDate}.</p>
</footer>
<script src="/assets/app.js" defer></script>
</body>
</html>`;
}

// The coastline: land up-left, Atlantic down-right, areas as pins along the shore.
function coastline({ counts = {}, interactive = false, highlight = null, linkBase = null, id = "coast" }) {
  const pins = config.areas
    .map((a) => {
      const n = counts[a.name];
      const label = `${esc(a.name)}${n !== undefined ? `<span class="pin-count">${n}</span>` : ""}`;
      const style = `style="--x:${a.x}%;--y:${a.y}%"`;
      const cls = `pin${highlight === a.name ? " is-here" : ""}${highlight && highlight !== a.name ? " is-dim" : ""}`;
      if (interactive) {
        return `<button type="button" class="${cls}" ${style} data-area="${esc(a.name)}" aria-pressed="false"${n === 0 ? " disabled" : ""}><span class="pin-dot" aria-hidden="true"></span><span class="pin-label">${label}</span></button>`;
      }
      if (linkBase) {
        return `<a class="${cls}" ${style} href="${linkBase}?area=${slugify(a.name)}"><span class="pin-dot" aria-hidden="true"></span><span class="pin-label">${label}</span></a>`;
      }
      return `<span class="${cls}" ${style}><span class="pin-dot" aria-hidden="true"></span><span class="pin-label">${label}</span></span>`;
    })
    .join("");
  return `<div class="coast" id="${id}">
  <svg class="coast-map" viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true">
    <path class="coast-land" d="M0 0H1000V36C930 78 885 108 840 134S700 210 610 258 460 330 380 370 250 420 190 454 70 520 0 548Z"/>
    <path class="coast-line" pathLength="1" d="M1000 36C930 78 885 108 840 134S700 210 610 258 460 330 380 370 250 420 190 454 70 520 0 548"/>
    <path class="coast-surf" d="M1000 70C930 112 885 142 840 168S700 244 610 292 460 364 380 404 250 454 190 488 70 554 0 582"/>
  </svg>
  <span class="coast-sea">Atlantic Ocean</span>
  ${pins}
</div>`;
}

function tagList(cat, item) {
  const tags = cat.tags.flatMap((t) => asList(item.raw[t]));
  return tags.length ? `<ul class="tags">${tags.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : "";
}

function photoOrPlate(item, size = "card", cat) {
  if (item.photo) {
    return `<img src="${esc(item.photo.src)}" alt="${esc(item.name)}" loading="${size === "card" ? "lazy" : "eager"}"${item.photo.w ? ` width="${item.photo.w}" height="${item.photo.h}"` : ""}>`;
  }
  // No photo yet: themed illustration generated from the listing, replaced automatically once a photo is added in Airtable.
  if (cat) {
    return `<img class="art" src="/art/${cat.slug}/${item.slug}.svg" alt="" width="400" height="240" loading="${size === "card" ? "lazy" : "eager"}" aria-hidden="true">`;
  }
  const word = item.subtitle || item.area || item.name;
  return `<div class="plate" aria-hidden="true"><span>${esc(word)}</span></div>`;
}

function actionButtons(item, { compact = false } = {}) {
  const out = [];
  if (item.maps) out.push(`<a class="btn btn-go" href="${esc(item.maps)}" target="_blank" rel="noopener">Get directions</a>`);
  if (item.phone && !compact) out.push(`<a class="btn" href="${telHref(item.phone)}">Call ${esc(item.phone)}</a>`);
  if (item.website && !compact) out.push(`<a class="btn" href="${esc(item.website)}" target="_blank" rel="noopener">Visit website</a>`);
  return out.length ? `<div class="actions">${out.join("")}</div>` : "";
}

// ---------- pages ----------
async function buildHome() {
  const tiles = categories
    .map((c) => {
      const counts = Object.fromEntries(areaNames.map((a) => [a, c.items.filter((i) => i.area === a).length]));
      const areaLinks = areaNames
        .filter((a) => counts[a])
        .map((a) => `<li><a href="/${c.slug}/?area=${slugify(a)}">${esc(a)}<span>${counts[a]}</span></a></li>`)
        .join("");
      return `<section class="cat-feature">
  <div class="cat-feature-text">
    <h2><a href="/${c.slug}/">${esc(c.title)}</a></h2>
    <p>${esc(c.intro)}</p>
    <a class="btn btn-go" href="/${c.slug}/">See all ${plural(c.items.length, c.noun)}</a>
  </div>
  <div class="cat-feature-areas">
    <h3>By area</h3>
    <ul class="area-links">${areaLinks}</ul>
  </div>
</section>`;
    })
    .join("");
  const soon = config.comingSoon?.length
    ? `<section class="soon"><h2>Next up</h2><p>${config.comingSoon.map(esc).join(", ").replace(/, ([^,]*)$/, " and $1")}. We're checking every listing in person and against official sources before it goes up.</p></section>`
    : "";
  const first = categories[0];
  const hero = `
<section class="hero">
  <div class="hero-text">
    <p class="eyebrow">Mini golf capital of the world</p>
    <h1>Sixty miles of beach. <em>Here's what to do</em> between swims.</h1>
    <p>Local, checked listings for the Grand Strand, from North Myrtle Beach down to Georgetown.</p>
  </div>
  ${coastline({ linkBase: first ? `/${first.slug}/` : null, id: "coast-home" })}
</section>`;
  const body = `
${tiles}
${soon}`;
  await write(
    "index.html",
    layout({
      title: `${config.siteName}: things to do in Myrtle Beach and the Grand Strand`,
      description: config.description,
      canonical: "/",
      hero,
      body,
      jsonLd: { "@context": "https://schema.org", "@type": "WebSite", name: config.siteName, url: origin },
    })
  );
}

async function buildCategory(cat) {
  const counts = Object.fromEntries(areaNames.map((a) => [a, cat.items.filter((i) => i.area === a).length]));
  const filterGroups = cat.filters
    .map((flt) => {
      const values = [...new Set(cat.items.flatMap((i) => asList(i.raw[flt.field])))].sort();
      if (!values.length) return "";
      return `<fieldset class="chips" data-filter="${esc(flt.field)}">
  <legend>${esc(flt.label)}</legend>
  ${values.map((v) => `<button type="button" class="chip" data-value="${esc(v)}" aria-pressed="false">${esc(v)}</button>`).join("")}
</fieldset>`;
    })
    .join("");

  const list = cat.items
    .map((item) => {
      const filterData = cat.filters
        .map((flt) => `data-f-${slugify(flt.field)}="${esc(asList(item.raw[flt.field]).join("|"))}"`)
        .join(" ");
      const searchText = [item.name, item.subtitle, item.area, item.description, ...cat.tags.flatMap((t) => asList(item.raw[t]))]
        .join(" ")
        .toLowerCase();
      return `<li class="listing" data-area="${esc(item.area)}" ${filterData} data-search="${esc(searchText)}">
  <a class="listing-media" href="/${cat.slug}/${item.slug}/" tabindex="-1" aria-hidden="true">${photoOrPlate(item, "card", cat)}</a>
  <div class="listing-body">
    <p class="listing-area">${esc(item.area)}</p>
    <h2 class="listing-name"><a href="/${cat.slug}/${item.slug}/">${esc(item.name)}</a></h2>
    ${item.subtitle ? `<p class="listing-sub">${esc(item.subtitle)}</p>` : ""}
    <p class="listing-desc">${esc(item.description)}</p>
    ${tagList(cat, item)}
  </div>
</li>`;
    })
    .join("\n");

  const body = `
<section class="cat-head">
  <div class="cat-head-text">
    <h1>${esc(cat.title)} on the Grand Strand</h1>
    <p>${esc(cat.intro)}</p>
  </div>
  <div class="cat-head-map">
    <p class="map-hint" id="map-hint">Tap an area to narrow the list.</p>
    ${coastline({ counts, interactive: true, id: "coast-filter" })}
  </div>
</section>
<section class="finder" data-noun-one="${esc(cat.noun.one)}" data-noun-many="${esc(cat.noun.many)}">
  <div class="finder-controls">
    <label class="search">
      <span class="visually-hidden">Search ${esc(cat.noun.many)}</span>
      <input type="search" id="q" placeholder="${esc(cat.searchHint || "Search a name or theme, like pirates")}" autocomplete="off">
    </label>
    ${filterGroups}
  </div>
  <p class="result-count" id="count" aria-live="polite">${plural(cat.items.length, cat.noun)}</p>
  <ul class="listings" id="listings">
${list}
  </ul>
  <div class="empty" id="empty" hidden>
    <p>No ${esc(cat.noun.many)} match all of those choices.</p>
    <button type="button" class="btn" id="reset">Clear filters</button>
  </div>
</section>`;
  await write(
    `${cat.slug}/index.html`,
    layout({
      title: `${cat.title} in Myrtle Beach and the Grand Strand | ${config.siteName}`,
      description: `${plural(cat.items.length, cat.noun)} from North Myrtle Beach to Georgetown, with directions, phone numbers and what makes each one different.`,
      canonical: `/${cat.slug}/`,
      body,
      active: cat.slug,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `${cat.title} on the Grand Strand`,
        itemListElement: cat.items.map((it, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${origin}/${cat.slug}/${it.slug}/`,
          name: it.name,
        })),
      },
    })
  );
}

async function buildDetail(cat, item) {
  if (!item.photo) await write(`art/${cat.slug}/${item.slug}.svg`, artSvg(item, cat.slug));
  const facts = cat.details
    .map((d) => {
      const v = asList(item.raw[d.field]);
      const shown = v.length ? v.map(esc).join(", ") : d.empty ? esc(d.empty) : "";
      return shown ? `<div><dt>${esc(d.label)}</dt><dd>${shown}</dd></div>` : "";
    })
    .join("");
  const nearby = cat.items.filter((i) => i.area === item.area && i.id !== item.id).slice(0, 4);
  const nearbyHtml = nearby.length
    ? `<section class="nearby">
  <h2>More ${esc(cat.noun.many)} in ${esc(item.area)}</h2>
  <ul>${nearby.map((n) => `<li><a href="/${cat.slug}/${n.slug}/">${esc(n.name)}</a>${n.subtitle ? `<span>${esc(n.subtitle)}</span>` : ""}</li>`).join("")}</ul>
</section>`
    : "";

  const body = `
<article class="detail">
  <p class="crumbs"><a href="/${cat.slug}/">All ${esc(cat.noun.many)}</a></p>
  <header class="detail-head">
    <h1>${esc(item.name)}</h1>
    <p class="detail-where">${esc(item.subtitle)}${item.subtitle && item.area ? " in " : ""}${esc(item.area)}</p>
    ${actionButtons(item)}
  </header>
  <figure class="detail-media" data-area="${esc(item.area)}">
    ${photoOrPlate(item, "hero", cat)}
    ${item.photo && item.photoCredit ? `<figcaption>${esc(item.photoCredit)}</figcaption>` : ""}
  </figure>
  <div class="detail-body">
    <p class="detail-desc">${esc(item.description)}</p>
    <dl class="facts">
      ${item.address ? `<div><dt>Address</dt><dd>${esc(item.address)}</dd></div>` : ""}
      ${item.phone ? `<div><dt>Phone</dt><dd><a href="${telHref(item.phone)}">${esc(item.phone)}</a></dd></div>` : ""}
      ${facts}
    </dl>
  </div>
  <aside class="detail-map" aria-label="Where it is on the Grand Strand">
    ${coastline({ highlight: item.area, id: "coast-detail" })}
  </aside>
  ${nearbyHtml}
</article>`;

  const ld = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: item.name,
    description: item.description,
    url: `${origin}/${cat.slug}/${item.slug}/`,
  };
  if (item.address) ld.address = item.address;
  if (item.phone) ld.telephone = item.phone;
  if (item.website) ld.sameAs = item.website;
  if (item.photo) ld.image = `${origin}${item.photo.src}`;

  await write(
    `${cat.slug}/${item.slug}/index.html`,
    layout({
      title: `${item.name}, ${item.area} | ${config.siteName}`,
      description: item.description.slice(0, 155),
      canonical: `/${cat.slug}/${item.slug}/`,
      body,
      active: cat.slug,
      jsonLd: ld,
    })
  );
}

async function buildExtras() {
  const urls = ["/", ...categories.flatMap((c) => [`/${c.slug}/`, ...c.items.map((i) => `/${c.slug}/${i.slug}/`)])];
  await write(
    "sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((u) => `  <url><loc>${origin}${u}</loc><lastmod>${buildDate}</lastmod></url>`)
      .join("\n")}\n</urlset>\n`
  );
  await write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
  await write("CNAME", `${config.domain}\n`);
  await write(".nojekyll", "");
  if (adsensePub) await write("ads.txt", `google.com, ${adsensePub}, DIRECT, f08c47fec0942fa0\n`);
  const first = categories[0];
  await write(
    "404.html",
    layout({
      title: `Page not found | ${config.siteName}`,
      description: config.description,
      canonical: "/404.html",
      body: `<section class="notfound"><h1>That page isn't here.</h1><p>It may have moved, or the place may have closed.</p><p><a class="btn btn-go" href="/">Go to the home page</a>${first ? ` <a class="btn" href="/${first.slug}/">Browse ${esc(first.title.toLowerCase())}</a>` : ""}</p></section>`,
    })
  );
}

// ---------- run ----------
await fs.rm(dist, { recursive: true, force: true });
await fs.mkdir(dist, { recursive: true });
await copyDir(path.join(root, "public"), dist);
await buildHome();
for (const cat of categories) {
  await buildCategory(cat);
  for (const item of cat.items) await buildDetail(cat, item);
}
await buildExtras();
const total = categories.reduce((n, c) => n + c.items.length, 0);
console.log(`Built ${total} listings across ${categories.length} categor${categories.length === 1 ? "y" : "ies"} into dist/`);
