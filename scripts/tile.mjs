// Placeholder tile for listings without a photo: category colors, one simple line icon, the type and area.
// Deliberately plain and honest (no invented "scenes"). A real photo in Airtable always replaces it.
// The older illustrated scenes live in art.mjs; switch back with ART_STYLE=scenes.
const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => "#" + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, "0")).join("");
const esc = (s) => String(s || "").replace(/[<>&"]/g, "");

const W = (d, extra = "") => `<path d="${d}" ${extra}/>`;
const ICONS = {
  flag: W("M22 56V10") + W("M22 10L48 20L22 30Z", 'fill="#fff" fill-opacity=".9"') + W("M12 56H40") + `<circle cx="46" cy="52" r="4"/>`,
  pier: W("M4 28H60") + W("M12 28V52M26 28V52M40 28V52M54 28V52") + W("M4 54q6-5 12 0t12 0t12 0t12 0t12 0") + W("M44 28L52 10M52 10v10"),
  mug: W("M14 22H42V50a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4Z") + W("M42 28h6a5 5 0 0 1 5 5v4a5 5 0 0 1-5 5h-6") + W("M14 22q4-10 12-6q8-6 16 6") + W("M23 30V46M32 30V46"),
  wine: W("M20 8H44V24a12 12 0 0 1-24 0Z") + W("M32 36V52") + W("M22 56H42") + W("M21 20H43", 'stroke-opacity=".6"'),
  mask: W("M12 12H52V30a20 20 0 0 1-40 0Z") + W("M21 26q4-4 8 0M35 26q4-4 8 0") + W("M23 39q9 9 18 0"),
  ticket: W("M6 16H58V27a5 5 0 0 0 0 10V48H6V37a5 5 0 0 0 0-10Z") + W("M40 18V46", 'stroke-dasharray="3 4"') + W("M16 28H30M16 36H26"),
  note: W("M24 46V14L50 8V40") + `<circle cx="18" cy="46" r="6"/><circle cx="44" cy="40" r="6"/>` + W("M24 24L50 18"),
  ghost: W("M14 54V30a18 18 0 0 1 36 0V54l-6-6l-6 6l-6-6l-6 6l-6-6Z") + `<circle cx="26" cy="30" r="2.5"/><circle cx="38" cy="30" r="2.5"/>`,
  ferris: `<circle cx="32" cy="28" r="20"/><circle cx="32" cy="28" r="3"/>` + W("M32 8V48M12 28H52M18 14L46 42M46 14L18 42") + W("M32 28L18 58M32 28L46 58M12 58H52"),
  car: W("M6 42V34L14 24H40L50 32L58 34V42Z") + `<circle cx="18" cy="44" r="6"/><circle cx="46" cy="44" r="6"/>` + W("M22 24L24 34H46"),
  boat: W("M6 38H58L50 52H14Z") + W("M32 38V6") + W("M32 10L52 34H32Z", 'fill="#fff" fill-opacity=".85"') + W("M6 58q6-4 13 0t13 0t13 0t13 0", 'stroke-opacity=".7"'),
  fish: W("M8 32Q26 12 46 32Q26 52 8 32Z") + W("M46 32L58 22V42Z") + `<circle cx="20" cy="29" r="2"/>`,
  pin: W("M32 6c-5 0-8 6-5 12c-4 6-8 14-6 26c1 6 6 10 11 10s10-4 11-10c2-12-2-20-6-26c3-6 0-12-5-12Z") + W("M25 24H39M24 32H40", 'stroke-opacity=".7"'),
  ball: `<circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="9"/>` + W("M32 10V23M32 41V54M10 32H23M41 32H54", 'stroke-opacity=".6"'),
  key: `<circle cx="20" cy="32" r="11"/><circle cx="20" cy="32" r="3"/>` + W("M31 32H58M48 32V43M56 32V40"),
  target: `<circle cx="32" cy="32" r="24"/><circle cx="32" cy="32" r="15"/><circle cx="32" cy="32" r="5" fill="#fff"/>` + W("M32 2V12M32 52V62M2 32H12M52 32H62", 'stroke-opacity=".7"'),
  bolt: W("M38 4L14 36H30L26 60L50 26H34Z", 'fill="#fff" fill-opacity=".9"'),
  mountain: W("M3 54L24 18L36 38L44 26L61 54Z") + W("M18 30L24 38L30 30", 'stroke-opacity=".7"') + W("M3 54H61"),
  columns: W("M6 22L32 8L58 22Z") + W("M14 26V48M26 26V48M38 26V48M50 26V48") + W("M6 54H58M10 48H54"),
  house: W("M6 30L32 8L58 30") + W("M14 26V54H50V26") + W("M27 54V40H37V54") + W("M42 16V8H48V20"),
  paw: W("M32 36c-9 0-14 7-11 13c2 4 8 3 11 3s9 1 11-3c3-6-2-13-11-13Z") + `<ellipse cx="17" cy="30" rx="4" ry="6"/><ellipse cx="27" cy="20" rx="4" ry="6"/><ellipse cx="38" cy="20" rx="4" ry="6"/><ellipse cx="48" cy="30" rx="4" ry="6"/>`,
  leaf: W("M10 54C10 26 28 10 54 8C54 36 40 56 10 54Z") + W("M10 54L40 24") + W("M26 40H18M34 32H44", 'stroke-opacity=".7"'),
  palm: W("M32 58Q30 40 34 26") + W("M34 26Q20 20 10 30M34 26Q22 12 14 10M34 26Q46 12 56 18M34 26Q48 24 58 34") + `<circle cx="30" cy="30" r="2.5"/><circle cx="37" cy="31" r="2.5"/>` + W("M14 58H50"),
  bike: `<circle cx="14" cy="42" r="10"/><circle cx="50" cy="42" r="10"/>` + W("M14 42L26 22H42L50 42M26 22L33 42H14M42 22L38 14H46"),
  trophy: W("M20 8H44V24a12 12 0 0 1-24 0Z") + W("M20 12H10q0 12 12 14M44 12H54q0 12-12 14") + W("M32 36V46M24 54H40M27 46H37"),
  wave: `<circle cx="44" cy="20" r="8"/>` + W("M4 38q7-7 14 0t14 0t14 0t14 0") + W("M4 48q7-7 14 0t14 0t14 0t14 0", 'stroke-opacity=".75"') + W("M4 58q7-7 14 0t14 0t14 0t14 0", 'stroke-opacity=".5"'),
  star: W("M32 6L39 24L58 25L43 37L48 56L32 45L16 56L21 37L6 25L25 24Z"),
};
const RULES = [
  [/pier|boardwalk|harborwalk|riverwalk|dock/, "pier"],
  [/disc golf|axe|archery|shoot|quail|gun range|laser tag|paintball|bullseye/, "target"],
  [/golf|putt|links|country club|moorland|tpc/, "flag"],
  [/brew|beer|taproom|cider|distill/, "mug"],
  [/wine|vineyard|winery/, "wine"],
  [/ghost|haunt|serial killer|wax museum|zombie/, "ghost"],
  [/cinema|movie|theaters? \d|b&b|amc|cinemark|regal|grand 14|12\b/, "ticket"],
  [/escape (room|game)|escapology|room escape|break out|maze|puzzle|mirror|vault|riddle/, "key"],
  [/theat|show|comedy|improv|cirque|dinner|magic|opry|palace|stage|dance|play\b|musical|murder/, "mask"],
  [/house of blues|concert|music|nightclub|club|karaoke|honky|dj\b|live band/, "note"],
  [/skywheel|observation wheel|ferris|carnival|amusement|family kingdom|funplex|waterpark|water park|waves/, "ferris"],
  [/kart|speedway|racing|raceway|seakart/, "car"],
  [/scuba|dive|snorkel|shark tooth/, "wave"],
  [/charter|fishing|angler|fleet|bait/, "fish"],
  [/boat|cruise|sail|catamaran|pirate|ship|dolphin|jet ski|jet boat|watersport|kayak|paddle|surf|wake|tiki|pontiki|river tour|swamp tour|boat tour|yacht|ferry/, "boat"],
  [/bowl|stars and strikes|strikes/, "pin"],
  [/billiard|pool hall|pinball/, "ball"],
  [/escape|mystery|maze|puzzle|mirror|vault|riddle/, "key"],
  [/zip|rope|climb|ninja|trampoline|sky zone|big air|helicopter|skydiv|ropes|adventure/, "mountain"],
  [/baseball|stadium|pelicans|athletic|pickleball|arena|hockey|football|sports|softball|sportsplex|complex/, "trophy"],
  [/aquarium/, "fish"],
  [/zoo|alligator|animal|wildlife|farm|horse|equestrian|safari/, "paw"],
  [/bike|run park|cycling|pedal/, "bike"],
  [/museum|gallery|art\b|colored school|science|wonderworks|edventure|children/, "columns"],
  [/histor|plantation|heritage|living history|walking tour|kaminski|hopsewee|house\b|glass|forge|lighthouse|church|cemetery/, "house"],
  [/beach|island|shore|surfside|inlet\b/, "wave"],
  [/garden|park|trail|nature|preserve|forest|eco\b|refuge|boardwalk|bird|marsh|swamp|canoe/, "leaf"],
  [/arcade|game|laser|dave|fun\b|playground|play zone|fun warehouse/, "bolt"],
];
const FALLBACK = { "mini-golf": "flag", "breweries-wineries": "mug", nightlife: "note", "thrill-action": "bolt", "family-indoor": "star", "nature-eco": "leaf", "live-shows": "mask", fishing: "fish", golf: "flag", beaches: "wave" };
const AREA = { "Central Myrtle": "Myrtle Beach", Surfside: "Surfside Beach" };

const PLACES = /myrtle beach|north myrtle|murrells inlet|garden city|little river|surfside|georgetown|conway|grand strand/g;
export function iconFor(item, catSlug) {
  const txt = `${item.subtitle || ""} | ${(item.name || "").replace(PLACES, " ")}`.toLowerCase();
  if (catSlug === "nightlife" && !/comedy/.test(txt)) return "note";
  for (const [re, k] of RULES) if (re.test(txt)) return k;
  return FALLBACK[catSlug] || "star";
}

export function tileSvg(item, cat) {
  const h = hash(`${cat.slug}/${item.name}`);
  const { a, b } = cat.theme;
  const t = 0.1 + (h % 100) / 100 * 0.25; // each listing sits at its own point between the category's two colors
  const c1 = mix(a, b, t), c2 = mix(a, b, t + 0.55);
  const ang = [[0, 0, 1, 1], [1, 0, 0, 1], [0, 1, 1, 0], [0, 0, 0, 1]][(h >>> 8) % 4];
  const ph = (h >>> 4) % 60, ph2 = (h >>> 12) % 80;
  const icon = ICONS[iconFor(item, cat.slug)];
  const dots = [0, 1, 2].map((i) => { const x = 20 + ((h >>> (i * 5)) % 360), y = 14 + ((h >>> (i * 7 + 3)) % 90); return `<circle cx="${x}" cy="${y}" r="${2 + (i % 2)}" fill="#fff" fill-opacity=".22"/>`; }).join("");
  let label = esc(item.subtitle || cat.title || "").toUpperCase();
  if (label.length > 24) { label = label.slice(0, 24).replace(/\s+\S*$/, "").replace(/[\s,/&-]+(and|or|at|near|of)?$/i, ""); }
  const area = esc(AREA[item.area] || item.area || "");
  const id = "g" + (h % 9973);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(item.name)}"><defs><linearGradient id="${id}" x1="${ang[0]}" y1="${ang[1]}" x2="${ang[2]}" y2="${ang[3]}"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="400" height="240" fill="url(#${id})"/>${dots}<path d="M-10 ${176 + ph / 4} q50 -26 100 0 t100 0 t100 0 t100 0 t100 0 V250 H-10Z" fill="#fff" fill-opacity=".08"/><path d="M-10 ${200 - ph2 / 6} q60 -22 120 0 t120 0 t120 0 t60 0 V250 H-10Z" fill="#fff" fill-opacity=".1"/><g transform="translate(200 36) scale(2.6)" fill="none" stroke="#fff" stroke-opacity=".92" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${icon}</g><g font-family="Georgia,'Times New Roman',serif" fill="#fff"><text x="26" y="${area ? 196 : 206}" font-size="12.5" letter-spacing="1.6" fill-opacity=".85" font-family="system-ui,Segoe UI,Arial,sans-serif" font-weight="600">${label}</text>${area ? `<text x="26" y="216" font-size="17" fill-opacity=".95">${area}</text>` : ""}</g></svg>`;
}
