// Builds the static site into dist/ from data/*.airtable.json + site.config.mjs.
import fs from "node:fs/promises";
import path from "node:path";
import config from "../site.config.mjs";
import { artSvg } from "./art.mjs";
import { parseHours, weekRows, openingSpec } from "./hours.mjs";

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
        // Visitor details (same field names in every table).
        week: (() => {
          try {
            return parseHours(x["Hours"]);
          } catch (e) {
            console.warn(`Hours for ${x[f.name]} (${cat.slug}) skipped: ${e.message}`);
            return null;
          }
        })(),
        hoursNote: x["Hours Note"] || "",
        price: x["Price"] || "",
        priceLevel: x["Price Level"] || "",
        goodToKnow: asList(x["Good to Know"]),
        detailsSource: safeUrl(x["Details Source"]),
        detailsChecked: x["Details Checked"] || "",
        raw: x,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  categories.push({ ...cat, items });
}

// Version stamps so browsers fetch a fresh stylesheet/script after every change (no stale cached CSS).
const assetVersion = async (rel) =>
  (await import("node:crypto")).createHash("sha1").update(await fs.readFile(path.join(root, "public", rel))).digest("hex").slice(0, 10);
const cssV = await assetVersion("assets/styles.css");
const jsV = await assetVersion("assets/app.js");

// ---------- shared pieces ----------
const fonts =
  "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Bowlby+One&display=swap";

function layout({ title, description, canonical, body, jsonLd, active, hero = "", theme = null, heroClass = "" }) {
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
<meta property="og:image" content="${origin}/og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${origin}/og.png">
<meta name="theme-color" content="#0f3346">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fonts}">
<link rel="stylesheet" href="/assets/styles.css?v=${cssV}">
${adsensePub ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${adsensePub}" crossorigin="anonymous"></script>` : ""}
${[].concat(jsonLd || []).map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`).join("\n")}
</head>
<body${theme ? ` class="themed" style="--band-a:${theme.a};--band-b:${theme.b};--tint:${theme.tint}"` : ""}>
<a class="skip" href="#main">Skip to content</a>
${hero ? `<div class="hero-wrap${heroClass ? " " + heroClass : ""}">` : ""}<header class="site-head">
  <a class="brand" href="/" aria-label="${esc(config.siteName)} home">
    <svg class="brand-mark" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="12" fill="none" stroke="currentColor" stroke-width="2.5"/><g transform="rotate(40 14 14)"><path d="M14 4.5 17.4 14H10.6Z" fill="#ffc93c" stroke="#0f3346" stroke-width="1.2" stroke-linejoin="round"/><path d="M10.6 14H17.4L14 23.5Z" fill="#0f3346"/></g></svg>
    <span>${esc(config.siteName)}</span>
  </a>
  <nav class="site-nav" aria-label="Categories"><div class="site-nav-inner">${nav}<a class="nav-search" href="/search/"${active === "search" ? ' aria-current="page"' : ""}>Search</a></div></nav>
</header>
${hero ? hero + "</div>" : ""}
<main id="main">
${body}
</main>
<footer class="site-foot">
  <p>Every listing is checked against the business or an official visitor guide, but hours and details change. Call ahead before you drive over.</p>
  ${config.contactEmail ? `<p>Run one of these places, or spotted something wrong? <a href="mailto:${esc(config.contactEmail)}">Email ${esc(config.contactEmail)}</a>.</p>` : ""}
  <nav class="foot-links" aria-label="More">
    <a href="/search/">Search everything</a> <a href="/areas/">Browse by area</a> <a href="/guides/">Guides</a> <a href="/add-your-business/">Add or fix a listing</a> <a href="/about/">About</a> <a href="/privacy/">Privacy</a>
  </nav>
  <p class="foot-small">© ${new Date().getFullYear()} ${esc(config.siteName)}. ${esc(config.tagline || "")}. Listings last refreshed ${buildDate}.</p>
</footer>
<script src="/assets/app.js?v=${jsV}" defer></script>
</body>
</html>`;
}

// The coastline: land up-left, Atlantic down-right, areas as pins along the shore.
function coastline({ counts = {}, interactive = false, highlight = null, linkBase = null, id = "coast" }) {
  const pins = config.areas
    .map((a, i) => {
      const n = counts[a.name];
      const label = `${esc(a.name)}${n !== undefined ? `<span class="pin-count">${n}</span>` : ""}`;
      const style = `style="--x:${a.x}%;--y:${a.y}%;--i:${i}"`;
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

// "Open now" badge: filled in by app.js from the weekly schedule, in Myrtle Beach time.
const openBadge = (item) =>
  item.week ? `<span class="open-badge" data-hours="${esc(JSON.stringify(item.week))}" hidden></span>` : "";
const priceTag = (item) =>
  item.priceLevel ? `<span class="price-level" title="${esc(priceWords[item.priceLevel] || "")}">${esc(item.priceLevel)}</span>` : "";
const priceWords = { Free: "Free", $: "Under about $15 per person", $$: "About $15–40 per person", $$$: "Over about $40 per person" };
const metaLine = (item, cls) => {
  const bits = [openBadge(item), priceTag(item)].filter(Boolean);
  return bits.length ? `<p class="${cls}">${bits.join("")}</p>` : "";
};
const reviewLinks = (item) => {
  const where = item.address || "Myrtle Beach, SC";
  const google = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(`${item.name}, ${where}`);
  const yelp = "https://www.yelp.com/search?find_desc=" + encodeURIComponent(item.name) + "&find_loc=" + encodeURIComponent(where);
  return `<a class="btn btn-review" href="${esc(google)}" target="_blank" rel="noopener">Google reviews</a><a class="btn btn-review" href="${esc(yelp)}" target="_blank" rel="noopener">Yelp reviews</a>`;
};
const fmtDate = (iso) => {
  const d = new Date(iso + "T12:00:00");
  return isNaN(d) ? "" : d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

function actionButtons(item, { compact = false } = {}) {
  const out = [];
  if (item.maps) out.push(`<a class="btn btn-go" href="${esc(item.maps)}" target="_blank" rel="noopener">Get directions</a>`);
  if (item.phone && !compact) out.push(`<a class="btn" href="${telHref(item.phone)}">Call ${esc(item.phone)}</a>`);
  if (item.website && !compact) out.push(`<a class="btn" href="${esc(item.website)}" target="_blank" rel="noopener">Visit website</a>`);
  if (!compact) out.push(reviewLinks(item));
  return out.length ? `<div class="actions">${out.join("")}</div>` : "";
}

// ---------- pages ----------

// ---------- extra schema types, guides and extra pages ----------
function schemaTypes(cat, item) {
  const t = `${item.subtitle} ${item.name}`.toLowerCase();
  const out = ["TouristAttraction"];
  if (cat.slug === "breweries-wineries") out.push(/wine|vineyard/.test(t) ? "Winery" : "Brewery");
  else if (cat.slug === "nightlife") out.push(/bar|saloon|pub/.test(t) ? "BarOrPub" : "NightClub");
  else if (/movie/.test(t)) out.push("MovieTheater");
  else if (cat.slug === "live-shows") out.push("PerformingArtsTheater");
  else if (/aquarium/.test(t)) out.push("Aquarium");
  else if (/museum/.test(t)) out.push("Museum");
  else if (/state park|park|reserve|garden/.test(t) && cat.slug === "nature-eco") out.push("Park");
  else if (cat.slug === "mini-golf") out.push("SportsActivityLocation");
  else if (/bowling/.test(t)) out.push("BowlingAlley");
  else if (/amusement|water park/.test(t)) out.push("AmusementPark");
  return out;
}

const inCat = (c, ...slugs) => slugs.includes(c.slug);
const guides = [
  {
    slug: "rainy-day",
    title: "Rainy-day ideas",
    intro: "Showers on the Strand don't have to cancel the day. These are indoor or covered picks: theaters, museums, escape rooms, bowling, indoor mini golf and tasting rooms.",
    test: (c, i) =>
      inCat(c, "family-indoor", "live-shows", "historic-cultural", "breweries-wineries") ||
      (c.slug === "mini-golf" && /indoor|hybrid/i.test(asList(i.raw["Indoor / Outdoor"]).join(" "))) ||
      (c.slug === "thrill-action" && /go-kart|trampoline|bowling/i.test(i.subtitle)),
  },
  {
    slug: "on-the-water",
    title: "On the water",
    intro: "Dolphin cruises, kayaks, jet skis, parasailing and waterfront stops from the marsh to the open ocean.",
    test: (c, i) =>
      (c.slug === "nature-eco" && /dolphin|kayak|paddle|boat|harbor|marsh|boardwalk|pier/i.test(`${i.subtitle} ${i.name}`)) ||
      (c.slug === "thrill-action" && /parasail|jet ski|boat/i.test(i.subtitle)) ||
      (inCat(c, "nightlife", "breweries-wineries") && /waterfront|marsh|oceanfront|pier|bay|ocean/i.test(`${i.name} ${i.description}`)),
  },
  {
    slug: "after-dark",
    title: "After dark",
    intro: "Live music, dance floors, rooftop bars, breweries, comedy and big stage shows once the sun goes down.",
    test: (c) => inCat(c, "nightlife", "live-shows", "breweries-wineries"),
  },
  {
    slug: "with-kids",
    title: "With the kids",
    intro: "Mini golf, go-karts, aquariums, trampolines and wildlife, the stops that keep a whole family busy.",
    test: (c, i) =>
      inCat(c, "mini-golf", "family-indoor") ||
      (c.slug === "thrill-action" && !/jet ski|parasail/i.test(i.subtitle)) ||
      (c.slug === "nature-eco" && /alligator|safari|dolphin|state park/i.test(`${i.name} ${i.subtitle}`)),
  },
];
const allItems = categories.flatMap((c) => c.items.map((i) => ({ c, i })));
const itemCards = (rows) =>
  `<ul class="listings">${rows
    .map(
      ({ c, i }) => `<li class="listing" data-area="${esc(i.area)}">
  <a class="listing-media" href="/${c.slug}/${i.slug}/" tabindex="-1" aria-hidden="true">${photoOrPlate(i, "card", c)}</a>
  <div class="listing-body">
    <p class="listing-area">${esc(i.area)}</p>
    <h3 class="listing-name"><a href="/${c.slug}/${i.slug}/">${esc(i.name)}</a></h3>
    <p class="listing-sub">${esc(c.title)}${i.subtitle ? ` · ${esc(i.subtitle)}` : ""}</p>
    <p class="listing-desc">${esc(i.description)}</p>
  </div>
</li>`
    )
    .join("")}</ul>`;
const simplePage = (title, description, canonical, inner, extra = {}) =>
  layout({ title: `${title} | ${config.siteName}`, description, canonical, active: extra.active, jsonLd: extra.jsonLd, body: `<section class="page-text">\n${inner}\n</section>` });

async function buildExtraPages() {
  // site-wide search index + page
  await write(
    "search-index.json",
    JSON.stringify(
      allItems.map(({ c, i }) => ({ n: i.name, u: `/${c.slug}/${i.slug}/`, c: c.title, a: i.area, t: i.subtitle, d: i.description }))
    )
  );
  await write(
    "search/index.html",
    layout({
      title: `Search everything | ${config.siteName}`,
      description: "Search every mini golf course, brewery, bar, show, museum and outdoor spot on the Grand Strand.",
      canonical: "/search/",
      active: "search",
      body: `<section class="page-text search-page">
<h1>Search the Grand Strand</h1>
<label class="search"><span class="visually-hidden">Search all listings</span><input type="search" id="gq" placeholder="Try pirates, dolphins, brewery, kids, rooftop" autocomplete="off" autofocus></label>
<p class="result-count" id="gcount" aria-live="polite">${allItems.length} places</p>
<ul class="search-results" id="gresults"></ul>
<noscript><p>Search needs JavaScript. You can <a href="/areas/">browse by area</a> or pick a category above.</p></noscript>
</section>`,
    })
  );

  // area hubs
  const areaCards = areaNames
    .map((a) => {
      const rows = allItems.filter((r) => r.i.area === a);
      return rows.length
        ? `<li><a href="/areas/${slugify(a)}/"><strong>${esc(a)}</strong><span>${rows.length} places</span></a></li>`
        : "";
    })
    .join("");
  await write(
    "areas/index.html",
    simplePage("Browse by area", "Pick a stretch of the Grand Strand, from North Myrtle Beach to Georgetown, and see everything to do there.", "/areas/",
      `<h1>Browse by area</h1><p>Where are you staying? Pick a stretch of coast and see everything on the Strand near it.</p>
${coastline({ linkBase: "/areas/", id: "coast-areas" }).replace(/href="\/areas\/\?area=([a-z0-9-]+)"/g, 'href="/areas/$1/"')}
<ul class="hub-list">${areaCards}</ul>`)
  );
  for (const a of areaNames) {
    const rows = allItems.filter((r) => r.i.area === a);
    if (!rows.length) continue;
    const sections = categories
      .map((c) => {
        const r = rows.filter((x) => x.c === c);
        return r.length ? `<h2><a href="/${c.slug}/?area=${slugify(a)}">${esc(c.title)}</a> <small>${r.length}</small></h2>\n${itemCards(r)}` : "";
      })
      .join("\n");
    await write(
      `areas/${slugify(a)}/index.html`,
      layout({
        title: `Things to do in ${a} | ${config.siteName}`,
        description: `${rows.length} places to go in ${a}: mini golf, breweries, nightlife, shows, attractions and outdoor spots, with directions and phone numbers.`,
        canonical: `/areas/${slugify(a)}/`,
        body: `<section class="page-text wide"><p class="crumbs"><a href="/areas/">All areas</a></p><h1>Things to do in ${esc(a)}</h1><p>${rows.length} places, grouped by type.</p>\n${sections}</section>`,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `Things to do in ${a}`,
          itemListElement: rows.map((r, n) => ({ "@type": "ListItem", position: n + 1, url: `${origin}/${r.c.slug}/${r.i.slug}/`, name: r.i.name })),
        },
      })
    );
  }

  // guides
  const guideRows = guides.map((g) => ({ ...g, rows: allItems.filter((r) => g.test(r.c, r.i)) })).filter((g) => g.rows.length);
  await write(
    "guides/index.html",
    simplePage("Guides", "Hand-sorted lists for the Grand Strand: rainy-day ideas, on the water, after dark and with the kids.", "/guides/",
      `<h1>Guides</h1><p>Not sure what you're in the mood for? Start with one of these.</p>
<ul class="hub-list">${guideRows.map((g) => `<li><a href="/guides/${g.slug}/"><strong>${esc(g.title)}</strong><span>${g.rows.length} places</span></a></li>`).join("")}</ul>`)
  );
  for (const g of guideRows) {
    await write(
      `guides/${g.slug}/index.html`,
      layout({
        title: `${g.title} in Myrtle Beach | ${config.siteName}`,
        description: g.intro.slice(0, 155),
        canonical: `/guides/${g.slug}/`,
        body: `<section class="page-text wide"><p class="crumbs"><a href="/guides/">All guides</a></p><h1>${esc(g.title)}</h1><p>${esc(g.intro)}</p><p class="result-count">${g.rows.length} places</p>\n${itemCards(g.rows)}</section>`,
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: g.title,
          itemListElement: g.rows.map((r, n) => ({ "@type": "ListItem", position: n + 1, url: `${origin}/${r.c.slug}/${r.i.slug}/`, name: r.i.name })),
        },
      })
    );
  }

  const mail = config.contactEmail ? esc(config.contactEmail) : "";
  await write(
    "about/index.html",
    simplePage("About", `About ${config.siteName}, a free guide to things to do on the Grand Strand.`, "/about/",
      `<h1>About ${esc(config.siteName)}</h1>
<p>${esc(config.siteName)} is a free guide to things to do along the Grand Strand, from North Myrtle Beach down through Murrells Inlet to Georgetown. It covers mini golf, breweries and wineries, nightlife, thrill rides, family and indoor fun, nature, live shows and history.</p>
<h2>How listings get here</h2>
<p>Each listing is checked against the business's own website or an official visitor guide before it goes up. If we can't confirm that a place is open or what it offers, it stays off the site. Hours, prices and offerings change, so call ahead before you drive over.</p>
<h2>No pay to play</h2>
<p>Listings are free. Ads, when shown, are served by Google and don't change what we list or how it's described.</p>
<h2>Get in touch</h2>
<p>${mail ? `Email <a href="mailto:${mail}">${mail}</a> to correct a listing, send a photo, or <a href="/add-your-business/">add a place</a>.` : "Use the Add or fix a listing page."}</p>`)
  );
  const tpl = encodeURIComponent("Business name:\nWebsite:\nAddress:\nPhone:\nType (mini golf, brewery, tour, show...):\nOne-sentence description:\nAre you the owner or a fan?\n(Photos welcome: attach one you took or have the right to share.)");
  await write(
    "add-your-business/index.html",
    simplePage("Add or fix a listing", `Suggest a Grand Strand business for ${config.siteName}, correct a phone number or address, or send a photo.`, "/add-your-business/",
      `<h1>Add or fix a listing</h1>
<p>Know a place we're missing, or spot something out of date? Tell us. Listings are free and we check each one before it goes up.</p>
${mail ? `<p><a class="btn btn-go" href="mailto:${mail}?subject=${encodeURIComponent("Add a listing to " + config.siteName)}&body=${tpl}">Email a new listing</a> <a class="btn" href="mailto:${mail}?subject=${encodeURIComponent("Correction for " + config.siteName)}">Report a correction</a></p>` : ""}
<h2>What helps</h2>
<ul><li>The business name, address, phone and website</li><li>What makes it different, in a sentence or two</li><li>A photo you took or have the right to share, which replaces our placeholder artwork</li><li>Whether it's open year-round or seasonal</li></ul>`)
  );
  await write(
    "privacy/index.html",
    simplePage("Privacy policy", `How ${config.siteName} handles your information.`, "/privacy/",
      `<h1>Privacy policy</h1>
<p>Last updated ${buildDate}.</p>
<p>${esc(config.siteName)} is a free directory. It has no accounts, no sign-ups and no forms that collect personal information.</p>
<h2>Advertising</h2>
<p>We may show ads served by Google AdSense. Google and its partners may use cookies to show ads based on your visits to this and other sites. You can manage ad personalization at <a href="https://adssettings.google.com" rel="noopener">Google Ad Settings</a> or learn more at <a href="https://policies.google.com/technologies/partner-sites" rel="noopener">how Google uses information from sites that use its services</a>.</p>
<h2>Fonts and third-party links</h2>
<p>Pages load fonts from Google Fonts, which means your browser contacts Google when a page loads. Links to business websites, maps and phone numbers leave this site and follow those businesses' and services' own privacy practices.</p>
<h2>Email</h2>
<p>${mail ? `If you email <a href="mailto:${mail}">${mail}</a>, we use your message and address only to reply and to update listings.` : "If you email us, we use your message and address only to reply and to update listings."}</p>
<h2>Children</h2>
<p>This site is a guide for families and isn't directed at collecting information from children.</p>`)
  );
}

async function buildHome() {
  const coverArt = (c) => {
    const item = c.items.find((i) => i.name === c.cover) || c.items[0];
    if (!item) return "";
    return item.photo
      ? `<img src="${esc(item.photo.src)}" alt="" loading="lazy">`
      : `<img src="/art/${c.slug}/${item.slug}.svg" alt="" width="400" height="240" loading="lazy">`;
  };
  const cards = categories
    .map(
      (c) => `<li class="cat-card" style="--band-a:${c.theme.a};--band-b:${c.theme.b}">
  <a href="/${c.slug}/">
    <span class="cat-card-media" aria-hidden="true">${coverArt(c)}</span>
    <span class="cat-card-body">
      <span class="cat-card-title">${esc(c.title)}</span>
      <span class="cat-card-blurb">${esc(c.blurb || "")}</span>
      <span class="cat-card-count">${plural(c.items.length, c.noun)} <span aria-hidden="true">→</span></span>
    </span>
  </a>
</li>`
    )
    .join("");
  const total = categories.reduce((n, c) => n + c.items.length, 0);
  const areaTotals = Object.fromEntries(
    areaNames.map((a) => [a, categories.reduce((n, c) => n + c.items.filter((i) => i.area === a).length, 0)])
  );
  const soon = config.comingSoon?.length
    ? `<section class="soon"><h2>Coming soon</h2><p>${config.comingSoon.map(esc).join(", ").replace(/, ([^,]*)$/, " and $1")}. Each one gets checked against the business or an official visitor guide before it goes up.</p></section>`
    : "";
  const hero = `
<section class="hero">
  <div class="hero-text">
    <h1>Sixty miles of beach. <em>Here's what to do</em> between swims.</h1>
    <p>Local, checked listings for the Grand Strand, from Little River down to Georgetown.</p>
    <a class="btn btn-go" href="#categories">Browse ${total} places</a>
  </div>
  ${coastline({ counts: areaTotals, id: "coast-home" })}
</section>`;
  const guideLinks = guides
    .map((g) => ({ g, n: allItems.filter((r) => g.test(r.c, r.i)).length }))
    .filter((x) => x.n)
    .map(({ g, n }) => `<li><a href="/guides/${g.slug}/"><strong>${esc(g.title)}</strong><span>${n} places</span></a></li>`)
    .join("");
  const areaHub = areaNames
    .map((a) => ({ a, n: allItems.filter((r) => r.i.area === a).length }))
    .filter((x) => x.n)
    .map(({ a, n }) => `<li><a href="/areas/${slugify(a)}/"><strong>${esc(a)}</strong><span>${n} places</span></a></li>`)
    .join("");
  const body = `
<section class="home-search">
  <form action="/search/" method="get" role="search">
    <label class="search"><span class="visually-hidden">Search all listings</span><input type="search" name="q" placeholder="Search ${allItems.length} places: pirates, dolphins, brewery, rooftop" autocomplete="off"></label>
    <button class="btn btn-go" type="submit">Search</button>
  </form>
</section>
<section class="cat-grid-wrap" id="categories" aria-labelledby="cat-grid-title">
  <h2 id="cat-grid-title">Pick your kind of fun</h2>
  <ul class="cat-grid">${cards}</ul>
</section>
<section class="home-hubs">
  <div><h2>Browse by area</h2><ul class="hub-list">${areaHub}</ul></div>
  <div><h2>Guides</h2><ul class="hub-list">${guideLinks}</ul></div>
</section>
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
      return `<li class="listing" data-area="${esc(item.area)}"${item.week ? " data-has-hours" : ""} ${filterData} data-search="${esc(searchText)}">
  <a class="listing-media" href="/${cat.slug}/${item.slug}/" tabindex="-1" aria-hidden="true">${photoOrPlate(item, "card", cat)}</a>
  <div class="listing-body">
    <p class="listing-area">${esc(item.area)}</p>
    ${metaLine(item, "listing-meta")}
    <h2 class="listing-name"><a href="/${cat.slug}/${item.slug}/">${esc(item.name)}</a></h2>
    ${item.subtitle ? `<p class="listing-sub">${esc(item.subtitle)}</p>` : ""}
    <p class="listing-desc">${esc(item.description)}</p>
    ${tagList(cat, item)}
  </div>
</li>`;
    })
    .join("\n");

  const hero = `
<section class="cat-head">
  <div class="cat-head-text">
    <h1>${esc(cat.title)} on the Grand Strand</h1>
    <p>${esc(cat.intro)}</p>
  </div>
  <div class="cat-head-map">
    <p class="map-hint" id="map-hint">Tap an area to narrow the list.</p>
    ${coastline({ counts, interactive: true, id: "coast-filter" })}
  </div>
</section>`;
  const body = `
<section class="finder" data-noun-one="${esc(cat.noun.one)}" data-noun-many="${esc(cat.noun.many)}">
  <div class="finder-controls">
    <label class="search">
      <span class="visually-hidden">Search ${esc(cat.noun.many)}</span>
      <input type="search" id="q" placeholder="${esc(cat.searchHint || "Search a name or theme, like pirates")}" autocomplete="off">
    </label>
    ${filterGroups}
    ${cat.items.some((i) => i.week) ? `<div class="chips chips-open"><button type="button" class="chip chip-open" id="open-now" aria-pressed="false">Open now</button></div>` : ""}
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
      description: `${plural(cat.items.length, cat.noun)} from Little River to Georgetown, with directions, phone numbers and what makes each one different.`,
      canonical: `/${cat.slug}/`,
      body,
      hero,
      heroClass: "hero-cat",
      theme: cat.theme,
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
  const hoursBlock =
    item.week || item.hoursNote
      ? `<section class="hours"><h2>Hours</h2>${
          item.week
            ? `<table class="hours-table"><tbody>${weekRows(item.week)
                .map((r) => `<tr data-day="${r.index}"><th scope="row"><abbr title="${r.long}">${r.day}</abbr></th><td>${esc(r.text)}</td></tr>`)
                .join("")}</tbody></table>`
            : ""
        }${item.hoursNote ? `<p class="hours-note">${esc(item.hoursNote)}</p>` : ""}</section>`
      : "";
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
  <h2>More ${esc(cat.title.toLowerCase())} in ${esc(item.area)}</h2>
  <ul>${nearby.map((n) => `<li><a href="/${cat.slug}/${n.slug}/">${esc(n.name)}</a>${n.subtitle ? `<span>${esc(n.subtitle)}</span>` : ""}</li>`).join("")}</ul>
</section>`
    : "";

  const hero = `
<section class="detail-band">
  <p class="crumbs"><a href="/${cat.slug}/"><span aria-hidden="true">←</span> ${esc(cat.title)}</a></p>
  <header class="detail-head">
    <h1>${esc(item.name)}</h1>
    <p class="detail-where">${esc(item.subtitle)}${item.subtitle && item.area ? " in " : ""}${esc(item.area)}</p>
    ${metaLine(item, "detail-meta")}
    ${actionButtons(item)}
    <button type="button" class="btn btn-share" data-share data-title="${esc(item.name)}">Share</button>
  </header>
</section>`;
  const body = `
<article class="detail">
  <figure class="detail-media" data-area="${esc(item.area)}">
    ${photoOrPlate(item, "hero", cat)}
    ${item.photo && item.photoCredit ? `<figcaption>${esc(item.photoCredit)}</figcaption>` : ""}
  </figure>
  <div class="detail-body">
    <p class="detail-desc">${esc(item.description)}</p>
    <dl class="facts">
      ${item.address ? `<div><dt>Address</dt><dd>${esc(item.address)}</dd></div>` : ""}
      ${item.phone ? `<div><dt>Phone</dt><dd><a href="${telHref(item.phone)}">${esc(item.phone)}</a></dd></div>` : ""}
      ${item.price || item.priceLevel ? `<div><dt>Price</dt><dd>${esc(item.price || priceWords[item.priceLevel] || "")}${item.price && item.priceLevel ? ` <span class="price-level">${esc(item.priceLevel)}</span>` : ""}</dd></div>` : ""}
      ${facts}
    </dl>
    ${hoursBlock}
    ${item.goodToKnow.length ? `<section class="gtk"><h2>Good to know</h2><ul class="gtk-list">${item.goodToKnow.map((g) => `<li>${esc(g)}</li>`).join("")}</ul></section>` : ""}
    ${item.detailsChecked || item.detailsSource ? `<p class="checked">Hours and prices${item.detailsChecked ? ` checked ${esc(fmtDate(item.detailsChecked))}` : ""}${item.detailsSource ? ` from <a href="${esc(item.detailsSource)}" target="_blank" rel="noopener">${esc(new URL(item.detailsSource).hostname.replace(/^www\./, ""))}</a>` : ""}. They can change, so check before you go.</p>` : ""}
  </div>
  <aside class="detail-map" aria-label="Where it is on the Grand Strand">
    ${coastline({ highlight: item.area, id: "coast-detail" })}
  </aside>
  ${nearbyHtml}
</article>`;

  const ld = {
    "@context": "https://schema.org",
    "@type": schemaTypes(cat, item),
    name: item.name,
    description: item.description,
    url: `${origin}/${cat.slug}/${item.slug}/`,
  };
  if (item.address) ld.address = item.address;
  if (item.phone) ld.telephone = item.phone;
  if (item.website) ld.sameAs = item.website;
  if (item.photo) ld.image = `${origin}${item.photo.src}`;
  if (item.week) ld.openingHoursSpecification = openingSpec(item.week);
  if (item.priceLevel && item.priceLevel !== "Free") ld.priceRange = item.priceLevel;
  if (item.priceLevel === "Free") ld.isAccessibleForFree = true;
  else ld.image = `${origin}/art/${cat.slug}/${item.slug}.svg`;
  if (item.maps) ld.hasMap = item.maps;
  ld.containedInPlace = { "@type": "Place", name: item.area ? `${item.area}, SC` : "Grand Strand, SC" };
  const crumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${origin}/` },
      { "@type": "ListItem", position: 2, name: cat.title, item: `${origin}/${cat.slug}/` },
      { "@type": "ListItem", position: 3, name: item.name },
    ],
  };

  await write(
    `${cat.slug}/${item.slug}/index.html`,
    layout({
      title: `${item.name}, ${item.area} | ${config.siteName}`,
      description: item.description.slice(0, 155),
      canonical: `/${cat.slug}/${item.slug}/`,
      body,
      hero,
      heroClass: "hero-detail",
      theme: cat.theme,
      active: cat.slug,
      jsonLd: [ld, crumbs],
    })
  );
}

async function buildExtras() {
  const urls = ["/", "/search/", "/areas/", "/guides/", "/about/", "/add-your-business/", "/privacy/", ...areaNames.filter((a) => allItems.some((r) => r.i.area === a)).map((a) => `/areas/${slugify(a)}/`), ...guides.filter((g) => allItems.some((r) => g.test(r.c, r.i))).map((g) => `/guides/${g.slug}/`), ...categories.flatMap((c) => [`/${c.slug}/`, ...c.items.map((i) => `/${c.slug}/${i.slug}/`)])];
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
await buildExtraPages();
await buildExtras();
const total = categories.reduce((n, c) => n + c.items.length, 0);
console.log(`Built ${total} listings across ${categories.length} categor${categories.length === 1 ? "y" : "ies"} into dist/`);
