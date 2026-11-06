// Themed placeholder art. Reads a listing's name, type and description, picks a scene,
// and returns a flat, sunny, retro-poster SVG (400x240). Used only while a listing has no photo.

const hash = (s) => {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
};
const rng = (seed) => {
  let a = seed || 1;
  return () => ((a = Math.imul(a ^ (a >>> 15), a | 1)), (a ^= a + Math.imul(a ^ (a >>> 7), a | 61)), ((a ^ (a >>> 14)) >>> 0) / 4294967296);
};

const SKIES = {
  sunset: { g: ["#ff7a59", "#ffc46b", "#ffe9a8"], sun: "#fff3c4", day: true },
  dusk: { g: ["#18365a", "#e0527a", "#ffb35c"], sun: "#fff3c4", moon: true },
  day: { g: ["#5fcfe6", "#bff0ea", "#f6efd2"], sun: "#ffe27a", day: true },
  dawn: { g: ["#ffb3a0", "#ffd9a0", "#bfede6"], sun: "#fff0c2", day: true },
  night: { g: ["#0b1f3a", "#2a3f7a", "#7a5fc9"], sun: "#fff3c4", moon: true },
  neon: { g: ["#12062b", "#5b1a6e", "#ff3d8b"], sun: "#ffd6f0", moon: true },
  golden: { g: ["#f29b4a", "#ffd27a", "#fff1c9"], sun: "#fff6d6", day: true },
  coral: { g: ["#ff6f7d", "#ffb08a", "#ffe3b0"], sun: "#fff3c4", day: true },
  pastel: { g: ["#8fa8f0", "#ffc2d6", "#ffe9c7"], sun: "#fff3c4", day: true },
  aqua: { g: ["#3fb8d6", "#9fe6e8", "#fff4d6"], sun: "#ffe27a", day: true },
  plum: { g: ["#2a0f3a", "#8a2f6e", "#ff9a5c"], sun: "#fff3c4", moon: true },
};

// ---------- small building blocks ----------
const sky = (k) => {
  const s = SKIES[k];
  return `<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.g[0]}"/><stop offset=".62" stop-color="${s.g[1]}"/><stop offset="1" stop-color="${s.g[2]}"/></linearGradient></defs><rect width="400" height="240" fill="url(#sk)"/>`;
};
const sun = (k, x = 300, y = 80, r = 40) => {
  const s = SKIES[k];
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${s.sun}" opacity=".92"/>`;
};
const stars = (r, n = 14) =>
  `<g fill="#fff" opacity=".85">${Array.from({ length: n }, () => `<circle cx="${(r() * 390 + 5) | 0}" cy="${(r() * 110 + 6) | 0}" r="${(r() * 1.4 + 0.6).toFixed(1)}"/>`).join("")}</g>`;
const cloud = (x, y, s = 1, c = "#fff", o = 0.9) =>
  `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}" opacity="${o}"><ellipse cx="0" cy="0" rx="26" ry="9"/><ellipse cx="-14" cy="-7" rx="14" ry="9"/><ellipse cx="8" cy="-10" rx="16" ry="11"/></g>`;
const bird = (x, y, s = 1) => `<path d="M${x} ${y} q${5 * s} ${-6 * s} ${10 * s} 0 q${5 * s} ${-6 * s} ${10 * s} 0 q${-5 * s} ${4 * s} ${-10 * s} ${1 * s} q${-5 * s} ${3 * s} ${-10 * s} ${-1 * s}z" fill="#fff"/>`;
const sea = (y = 168, a = "#12a6a0", b = "#0e8c87", c = "#2b86a8") =>
  `<rect y="${y}" width="400" height="${240 - y}" fill="${c}"/><path d="M0 ${y + 8} Q60 ${y - 6} 120 ${y + 8} T240 ${y + 8} T400 ${y + 6} V240 H0Z" fill="${a}"/><path d="M0 ${y + 34} Q60 ${y + 20} 120 ${y + 34} T240 ${y + 34} T400 ${y + 30} V240 H0Z" fill="${b}"/><g stroke="#fff" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round"><path d="M36 ${y + 20} q9 -5 18 0"/><path d="M290 ${y + 26} q9 -5 18 0"/><path d="M190 ${y + 14} q9 -5 18 0"/></g>`;
const sand = (y = 196, c = "#f2dfb4", d = "#e7c98f") =>
  `<path d="M0 ${y} Q100 ${y - 14} 200 ${y} T400 ${y - 4} V240 H0Z" fill="${c}"/><path d="M0 ${y + 24} Q100 ${y + 12} 200 ${y + 24} T400 ${y + 20} V240 H0Z" fill="${d}"/>`;
const grass = (y = 184, a = "#2f9e6b", b = "#1f7a52") =>
  `<path d="M0 ${y} Q120 ${y - 20} 230 ${y} T400 ${y - 6} V240 H0Z" fill="${a}"/><path d="M0 ${y + 26} Q120 ${y + 10} 230 ${y + 26} T400 ${y + 20} V240 H0Z" fill="${b}"/>`;
const hills = (y = 150, c = "#c2415d", o = 0.5) =>
  `<path d="M0 ${y} L60 ${y - 55} L110 ${y - 10} L170 ${y - 65} L240 ${y} L300 ${y - 28} L400 ${y + 8} V240 H0Z" fill="${c}" opacity="${o}"/>`;
const road = (y = 176) =>
  `<rect y="${y}" width="400" height="${240 - y}" fill="#1a2b3a"/><path d="M0 ${y + 34} H400" stroke="#f7e9d0" stroke-width="4" stroke-dasharray="30 22"/>`;
const floor = (y = 170, c = "#1b1740") =>
  `<rect y="${y}" width="400" height="${240 - y}" fill="${c}"/><g stroke="#fff" opacity=".12" stroke-width="2"><path d="M0 ${y + 20} H400 M0 ${y + 44} H400 M200 ${y} L60 240 M200 ${y} L340 240 M200 ${y} L200 240"/></g>`;
const palm = (x, y, s = 1, c = "#1d7f5a", t = "#8a5a2b") =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-3 0 C-4 -26 -2 -44 2 -62 L7 -62 C5 -42 5 -22 5 0Z" fill="${t}"/><path d="M4 -62 q-30 -2 -44 18 q30 0 44 -14z M4 -62 q30 -16 52 2 q-30 -2 -52 6z M4 -64 q-4 -26 -24 -34 q2 22 20 36z M6 -64 q10 -26 34 -28 q-10 22 -30 32z" fill="${c}"/></g>`;
const sunbrella = (x, y, s = 1, a = "#ff3d8b", b = "#fff") =>
  `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-1.5" y="-46" width="3" height="48" fill="#8a5a2b"/><path d="M-34 -46 Q0 -78 34 -46Z" fill="${a}"/><path d="M-34 -46 Q-17 -64 0 -62 Q-8 -52 -11 -46Z M0 -62 Q17 -64 34 -46 L12 -46 Q8 -54 0 -62Z" fill="${b}"/></g>`;
const mug = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-30 -62 H30 L25 0 Q25 6 19 6 H-19 Q-25 6 -25 0Z" fill="#ffb627"/><path d="M-27 -22 H27 L25 0 Q25 6 19 6 H-19 Q-25 6 -25 0Z" fill="#e8920c"/><path d="M30 -48 H44 Q56 -48 56 -32 Q56 -16 42 -16 H28" fill="none" stroke="#ffb627" stroke-width="7"/><path d="M-34 -62 Q-40 -82 -20 -80 Q-14 -98 4 -92 Q22 -102 32 -82 Q48 -80 34 -62Z" fill="#fff8e6"/><rect x="-16" y="-52" width="5" height="46" rx="2.5" fill="#fff" opacity=".35"/></g>`;
const glass = (x, y, s = 1, wine = "#8e1b3a") =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-22 -86 H22 Q26 -42 0 -34 Q-26 -42 -22 -86Z" fill="#f7e9d0" opacity=".95"/><path d="M-20 -66 H20 Q21 -46 0 -40 Q-21 -46 -20 -66Z" fill="${wine}"/><rect x="-2" y="-34" width="4" height="34" fill="#f7e9d0"/><rect x="-20" y="-2" width="40" height="4" rx="2" fill="#f7e9d0"/></g>`;
const hops = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})" fill="#7bc043"><path d="M0 0 q30 -14 38 18 q-30 18 -38 -18z"/><path d="M12 32 q30 -14 38 18 q-30 18 -38 -18z"/><path d="M-4 34 q-26 -4 -30 24 q28 6 30 -24z"/></g>`;
const ship = (x, y, s = 1, sail = "#202638", hull = "#161b2a", flag = "#ff3d8b", sails = 2) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-80 0 Q0 30 90 0 L74 18 Q0 40 -64 18Z" fill="${hull}"/><rect x="-2" y="-112" width="4" height="114" fill="${hull}"/>${sails === 2 ? `<path d="M4 -104 Q62 -72 56 -22 L4 -22Z" fill="${sail}"/><path d="M-4 -96 Q-50 -66 -46 -22 L-4 -22Z" fill="${sail}"/>` : `<path d="M4 -104 Q62 -72 56 -22 L4 -22Z" fill="${sail}"/>`}<path d="M0 -128 l24 8 l-24 8z" fill="${flag}"/><g fill="#f7e9d0"><circle cx="30" cy="-62" r="7"/><rect x="28" y="-56" width="4" height="8"/></g></g>`;
const dino = (x, y, s = 1, c = "#3b8f3a", spike = "#2a6f2c") =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-12 0 q5 -62 38 -66 l10 -26 q12 -8 22 2 q4 12 -6 20 l-6 4 q18 10 22 40 q10 4 30 8 l-6 8 q-22 2 -34 -2 l-4 20 h-14 l-2 -18 q-18 4 -34 -2 l-4 20 h-14 l-2 -18Z" transform="translate(-30 -10)" fill="${c}"/><g fill="${spike}" transform="translate(-30 -10)"><path d="M10 -62 l8 -12 l8 12z M30 -70 l8 -12 l8 12z M50 -72 l8 -12 l8 12z"/></g><circle cx="42" cy="-102" r="3.4" fill="#fff"/><circle cx="43" cy="-102" r="1.6" fill="#0b3a53"/></g>`;
const volcano = (x, y, s = 1, lava = "#ff5a3d") =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-60 0 L-18 -64 H18 L60 0Z" fill="#7a2b3f"/><path d="M-18 -64 q18 -14 36 0z" fill="${lava}"/><path d="M-4 -64 q-2 22 -10 46 M6 -64 q4 20 12 42" stroke="${lava}" stroke-width="4" fill="none" opacity=".8"/><g fill="#555" opacity=".5"><circle cx="0" cy="-86" r="9"/><circle cx="10" cy="-100" r="12"/></g></g>`;
const flag = (x, y, c = "#ffb627") =>
  `<g><rect x="${x}" y="${y - 42}" width="2.4" height="42" fill="#fff"/><path d="M${x + 2} ${y - 42} l22 8 l-22 8z" fill="${c}"/><circle cx="${x + 1}" cy="${y + 2}" r="9" fill="#ff3d8b"/></g>`;
const dolphin = (x, y, s = 1, c = "#7fd6ea") =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-48 8 Q-42 -36 4 -34 Q28 -32 44 -46 Q36 -26 50 -22 Q34 -14 18 0 Q-6 14 -48 8Z" fill="${c}"/><path d="M-4 -34 q8 -22 24 -22 q-4 12 -12 22z" fill="${c}"/><path d="M-48 8 q-14 -2 -22 -14 q16 0 22 8z" fill="${c}"/><circle cx="26" cy="-34" r="2.4" fill="#0b3a53"/><path d="M-30 4 Q-6 2 14 -6" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/></g>`;
const boat = (x, y, s = 1, hull = "#fff8e6", trim = "#ff3d8b", cab = true) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-54 0 H56 L42 20 H-40Z" fill="${hull}"/><rect x="-54" y="0" width="110" height="5" fill="${trim}"/>${cab ? `<path d="M-18 0 V-24 H18 L28 0Z" fill="${hull}"/><rect x="-10" y="-18" width="14" height="10" fill="#6fd3e8"/><rect x="8" y="-18" width="10" height="10" fill="#6fd3e8"/><rect x="-1" y="-40" width="2.4" height="16" fill="${hull}"/>` : ""}</g>`;
const sail = (x, y, s = 1, a = "#ff3d8b", b = "#ffb627") =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-30 0 h60 l-8 16 h-44z" fill="#fff8e6"/><rect x="-1.5" y="-42" width="3" height="42" fill="#fff8e6"/><path d="M4 -40 l24 36 h-24z" fill="${a}"/><path d="M-4 -34 l-18 30 h18z" fill="${b}"/></g>`;
const gator = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-120 0 q-34 8 -52 -4 q24 -6 52 -10z" fill="#3f8f3a"/><path d="M-120 0 Q-110 -30 -60 -28 L40 -34 Q94 -40 128 -16 L170 -8 Q184 -4 168 4 L148 6 Q120 18 60 8 Q-10 18 -70 8 Q-110 8 -120 0Z" fill="#3f8f3a"/><path d="M128 -16 L170 -8 Q184 -4 168 4 L146 4 Q128 -4 128 -16Z" fill="#35802f"/><circle cx="140" cy="-22" r="5" fill="#fff"/><circle cx="141" cy="-22" r="2.4" fill="#0b3a53"/><g fill="#2b6a2a"><path d="M-60 -28 l6 -12 l6 12z M-32 -30 l6 -12 l6 12z M-4 -32 l6 -12 l6 12z M24 -34 l6 -12 l6 12z M52 -34 l6 -12 l6 12z"/></g><path d="M146 4 l3 5 l3 -5 M156 4 l3 5 l3 -5" fill="#fff"/></g>`;
const cattail = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 q-6 -40 6 -60 M12 0 q4 -30 -2 -50" stroke="#1d5c3f" stroke-width="4" fill="none"/><ellipse cx="6" cy="-64" rx="5" ry="12" fill="#7a4a2a"/><ellipse cx="11" cy="-52" rx="5" ry="10" fill="#7a4a2a"/></g>`;
const lighthouse = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-14 0 L-9 -64 H9 L14 0Z" fill="#fff8e6"/><path d="M-12 -18 H12 L11 -30 H-11Z M-9 -46 H9 L9 -56 H-9Z" fill="#e0527a"/><rect x="-11" y="-76" width="22" height="12" fill="#ffd47a"/><path d="M-14 -76 H14 L0 -90Z" fill="#161b2a"/><path d="M-60 -70 L-11 -70 L-11 -78 Z M60 -70 L11 -70 L11 -78Z" fill="#fff3c4" opacity=".6"/></g>`;
const pier = (y = 180, c = "#6b4a2f") =>
  `<rect y="${y}" width="400" height="${240 - y}" fill="${c}"/><rect y="${y}" width="400" height="6" fill="#85603c"/><g fill="#4a321f">${[40, 130, 220, 310].map((x) => `<rect x="${x}" y="${y}" width="8" height="${240 - y}"/>`).join("")}</g>`;
const ferris = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 L-34 90 M0 0 L34 90" stroke="#fff8e6" stroke-width="6"/><circle r="64" fill="none" stroke="#fff8e6" stroke-width="5"/><circle r="6" fill="#ff3d8b"/><g stroke="#fff8e6" stroke-width="2.5">${Array.from({ length: 8 }, (_, i) => `<path d="M0 0 L${(64 * Math.cos((i * Math.PI) / 4)).toFixed(1)} ${(64 * Math.sin((i * Math.PI) / 4)).toFixed(1)}"/>`).join("")}</g>${Array.from({ length: 8 }, (_, i) => `<rect x="${(64 * Math.cos((i * Math.PI) / 4) - 6).toFixed(1)}" y="${(64 * Math.sin((i * Math.PI) / 4) - 4).toFixed(1)}" width="12" height="11" rx="3" fill="${["#ff3d8b", "#ffb627", "#00e5cc", "#ff7a59"][i % 4]}"/>`).join("")}</g>`;
const coaster = (y = 160) =>
  `<path d="M0 ${y} Q50 ${y - 90} 100 ${y - 10} T200 ${y - 70} T300 ${y - 6} T400 ${y - 60}" fill="none" stroke="#fff8e6" stroke-width="6"/><g stroke="#fff8e6" stroke-width="3">${[30, 70, 110, 150, 190, 230, 270, 310, 350].map((x, i) => `<path d="M${x} ${y - ((i * 37) % 60) - 8} V${y + 20}"/>`).join("")}</g>`;
const kart = (x, y, s = 1, body = "#00e5cc") =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-110 -10 Q-108 -42 -70 -44 L-10 -46 L12 -70 L42 -70 L50 -44 Q100 -40 102 -10Z" fill="${body}"/><path d="M-6 -46 L14 -66 L38 -66 L44 -46Z" fill="#bfede6"/><rect x="-90" y="-32" width="170" height="5" fill="#ff3d8b"/><circle cx="-70" cy="-2" r="26" fill="#0b0f14"/><circle cx="-70" cy="-2" r="11" fill="#8892a0"/><circle cx="68" cy="-2" r="26" fill="#0b0f14"/><circle cx="68" cy="-2" r="11" fill="#8892a0"/></g>`;
const speed = () => `<g stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"><path d="M30 130 H80"/><path d="M14 148 H70"/><path d="M36 166 H76"/></g>`;
const curtain = () =>
  `<rect width="400" height="240" fill="#4a0f2a"/><path d="M0 0 H400 V30 Q380 44 360 30 Q340 44 320 30 Q300 44 280 30 Q260 44 240 30 Q220 44 200 30 Q180 44 160 30 Q140 44 120 30 Q100 44 80 30 Q60 44 40 30 Q20 44 0 30Z" fill="#c2184f"/><path d="M0 30 Q50 120 0 240 H40 Q90 120 40 30Z" fill="#8e0f3a"/><path d="M400 30 Q350 120 400 240 H360 Q310 120 360 30Z" fill="#8e0f3a"/><rect y="196" width="400" height="44" fill="#2a1a12"/>`;
const spot = (x = 200) => `<path d="M${x - 8} 0 L${x - 90} 200 H${x + 90} L${x + 8} 0Z" fill="#fff3c4" opacity=".28"/>`;
const mask = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-34 -30 Q-34 -50 0 -50 Q34 -50 34 -30 Q34 8 0 26 Q-34 8 -34 -30Z" fill="#ffd47a"/><path d="M-22 -26 q8 -8 16 0 q-8 6 -16 0z M6 -26 q8 -8 16 0 q-8 6 -16 0z" fill="#161b2a"/><path d="M-18 -4 Q0 12 18 -4" stroke="#161b2a" stroke-width="4" fill="none"/></g>`;
const disco = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-1.5" y="-60" width="3" height="40" fill="#fff" opacity=".7"/><circle r="30" fill="#c9d3e6"/><g stroke="#8892a8" stroke-width="1.6" opacity=".9"><path d="M-30 0 H30 M-26 -14 H26 M-26 14 H26 M0 -30 V30 M-14 -28 V28 M14 -28 V28"/></g><g fill="#fff"><rect x="-18" y="-18" width="8" height="8"/><rect x="6" y="-6" width="8" height="8"/><rect x="-6" y="12" width="8" height="8"/></g></g>`;
const cowboy = (x, y, s = 1, c = "#a0642f") =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-62 0 Q-40 -14 -24 -10 Q-20 -46 0 -48 Q20 -46 24 -10 Q40 -14 62 0 Q36 12 0 10 Q-36 12 -62 0Z" fill="${c}"/><path d="M-24 -10 Q0 0 24 -10 L22 -18 Q0 -8 -22 -18Z" fill="#161b2a"/></g>`;
const mic = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-3" y="-4" width="6" height="64" fill="#8892a0"/><rect x="-26" y="56" width="52" height="6" rx="3" fill="#8892a0"/><circle cy="-22" r="20" fill="#c9d3e6"/><path d="M-20 -22 H20 M-14 -34 H14 M-14 -10 H14" stroke="#8892a8" stroke-width="2"/></g>`;
const neonRing = (x, y, r, c, w = 6) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${c}" stroke-width="${w}" opacity=".9"/><circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#fff" stroke-width="1.6" opacity=".7"/>`;
const pins = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})">${[[-24, 0], [0, 0], [24, 0], [-12, -22], [12, -22], [0, -44]].map(([a, b]) => `<g transform="translate(${a} ${b})"><path d="M-6 0 Q-9 -14 -4 -26 Q-6 -34 0 -38 Q6 -34 4 -26 Q9 -14 6 0Z" fill="#fff8e6"/><rect x="-6" y="-24" width="12" height="4" fill="#ff3d8b"/></g>`).join("")}</g>`;
const ball = (x, y, r = 14, c = "#ff3d8b") => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x - r / 3}" cy="${y - r / 3}" r="${r / 5}" fill="#fff" opacity=".6"/>`;
const door = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-40" y="-110" width="80" height="112" rx="6" fill="#6b3f1f"/><rect x="-32" y="-102" width="64" height="96" rx="3" fill="#8a5a2b"/><circle cx="18" cy="-52" r="5" fill="#ffd47a"/><path d="M-6 -70 a9 9 0 1 1 12 0 l4 20 h-20z" fill="#161b2a"/><circle cx="-60" cy="-30" r="8" fill="#ffd47a"/><rect x="-62" y="-30" width="4" height="22" fill="#ffd47a"/></g>`;
const key = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#ffd47a"><circle r="12"/><circle r="5" fill="#161b2a"/><rect x="10" y="-3" width="40" height="6"/><rect x="38" y="3" width="5" height="10"/><rect x="46" y="3" width="5" height="8"/></g>`;
const axe = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><circle r="46" fill="#fff8e6"/><circle r="34" fill="#ff3d8b"/><circle r="22" fill="#fff8e6"/><circle r="10" fill="#ff3d8b"/><g transform="rotate(-35) translate(-8 -70)"><rect x="-3" y="0" width="6" height="64" fill="#8a5a2b"/><path d="M3 4 Q30 0 32 20 Q30 36 3 30Z" fill="#c9d3e6"/></g></g>`;
const tramp = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-70" y="0" width="140" height="8" rx="4" fill="#00e5cc"/><path d="M-60 8 L-66 40 M60 8 L66 40 M-20 8 V36 M20 8 V36" stroke="#8892a0" stroke-width="4"/><g transform="translate(0 -46)"><circle cy="-22" r="10" fill="#ffd1a8"/><path d="M-4 -12 L-4 14 M-4 0 L-26 -14 M-4 0 L20 -10 M-4 14 L-18 36 M-4 14 L10 32" stroke="#ff3d8b" stroke-width="6" stroke-linecap="round" fill="none"/></g></g>`;
const fish = (x, y, s = 1, c = "#ffb627") =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-24 0 Q-4 -20 20 0 Q-4 20 -24 0Z M20 0 L36 -14 V14Z" fill="${c}"/><circle cx="-12" cy="-3" r="2.6" fill="#0b3a53"/></g>`;
const waveSlide = () =>
  `<path d="M40 190 V70 Q40 40 80 40 H150 Q190 40 190 80 V110 Q190 130 170 130 H150 Q120 130 130 160 V190" fill="none" stroke="#ff3d8b" stroke-width="22" stroke-linecap="round"/><path d="M40 190 V70 Q40 40 80 40 H150 Q190 40 190 80 V110 Q190 130 170 130 H150 Q120 130 130 160 V190" fill="none" stroke="#fff" stroke-width="3" opacity=".5" stroke-linecap="round"/><path d="M230 190 L330 60 Q350 36 372 60 V190" fill="none" stroke="#ffb627" stroke-width="22" stroke-linecap="round"/>`;
const column = (x, y, h = 90, c = "#fff8e6") =>
  `<g><rect x="${x - 12}" y="${y - h}" width="24" height="${h}" fill="${c}"/><rect x="${x - 17}" y="${y - h - 8}" width="34" height="8" fill="${c}"/><rect x="${x - 17}" y="${y}" width="34" height="8" fill="${c}"/><g stroke="#0b3a53" stroke-width="1.5" opacity=".18"><path d="M${x - 6} ${y - h} V${y} M${x} ${y - h} V${y} M${x + 6} ${y - h} V${y}"/></g></g>`;
const house = (x, y, s = 1, c = "#fff8e6", roof = "#8e1b3a") =>
  `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-60" y="-64" width="120" height="64" fill="${c}"/><path d="M-70 -64 L0 -104 L70 -64Z" fill="${roof}"/>${[-44, -14, 16, 40].map((a) => `<rect x="${a}" y="-52" width="14" height="22" fill="#6fd3e8"/>`).join("")}<rect x="-10" y="-32" width="20" height="32" fill="#8a5a2b"/><rect x="-60" y="-12" width="120" height="6" fill="#d9c9a3"/><g fill="#fff8e6">${[-54, -34, -4, 26, 46].map((a) => `<rect x="${a}" y="-30" width="6" height="30"/>`).join("")}</g></g>`;
const oak = (x, y, s = 1, c = "#2a6f4a") =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-8 0 Q-6 -40 -22 -62 L-10 -58 Q0 -50 0 -70 Q2 -48 12 -60 L24 -62 Q8 -40 8 0Z" fill="#5a3b22"/><ellipse cx="0" cy="-80" rx="58" ry="32" fill="${c}"/><ellipse cx="-30" cy="-62" rx="30" ry="18" fill="${c}"/><ellipse cx="32" cy="-60" rx="30" ry="18" fill="${c}"/><g stroke="#cfd9c4" stroke-width="3" opacity=".7" fill="none"><path d="M-40 -56 q-4 22 -2 36 M-18 -52 q-2 20 2 32 M24 -50 q4 20 0 34 M44 -54 q2 18 -2 28"/></g></g>`;
const castle = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-70" y="-60" width="140" height="60" fill="#e8d8b6"/><rect x="-30" y="-96" width="60" height="40" fill="#e8d8b6"/><path d="M-30 -96 q30 -34 60 0z" fill="#c2415d"/><rect x="-4" y="-132" width="8" height="12" fill="#c2415d"/><path d="M-70 -60 h140 v-8 h-12 v-8 h-12 v8 h-12 v-8 h-12 v8 h-12 v-8 h-12 v8 h-12 v-8 h-12 v8 h-12z" fill="#e8d8b6"/>${[-52, -22, 8, 38].map((a) => `<path d="M${a} -8 V-34 q10 -14 20 0 V-8Z" fill="#7a2b3f"/>`).join("")}<path d="M-14 -52 V-76 q14 -16 28 0 V-52Z" fill="#7a2b3f"/></g>`;
const lantern = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-1.5" y="-60" width="3" height="22" fill="#c9d3e6"/><path d="M-14 -38 H14 L10 -34 H-10Z" fill="#161b2a"/><rect x="-11" y="-34" width="22" height="30" fill="#ffd47a"/><path d="M-11 -34 V-4 M0 -34 V-4 M11 -34 V-4" stroke="#161b2a" stroke-width="2"/><rect x="-14" y="-4" width="28" height="5" fill="#161b2a"/><circle cy="-20" r="26" fill="#ffd47a" opacity=".25"/></g>`;
const ghost = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})" opacity=".95"><path d="M-22 0 V-30 Q-22 -58 0 -58 Q22 -58 22 -30 V0 L14 -8 L7 0 L0 -8 L-7 0 L-14 -8Z" fill="#f4f8ff"/><circle cx="-8" cy="-34" r="3.6" fill="#161b2a"/><circle cx="8" cy="-34" r="3.6" fill="#161b2a"/><ellipse cx="0" cy="-22" rx="4" ry="5" fill="#161b2a"/></g>`;
const hauntedHouse = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})" fill="#120a24"><rect x="-70" y="-70" width="100" height="70"/><rect x="30" y="-96" width="40" height="96"/><path d="M-76 -70 L-20 -112 L36 -70Z M26 -96 L50 -126 L74 -96Z"/><g fill="#ffb627">${[[-56, -52], [-30, -52], [-4, -52], [40, -78], [40, -50]].map(([a, b]) => `<rect x="${a}" y="${b}" width="12" height="16"/>`).join("")}</g></g>`;
const ticket = () => "";
const baseball = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><circle r="30" fill="#fff8e6"/><path d="M-22 -18 q12 18 0 36 M22 -18 q-12 18 0 36" stroke="#e0527a" stroke-width="3" fill="none"/><g stroke="#e0527a" stroke-width="2.5">${[-14, -6, 2, 10].map((a) => `<path d="M${-20 + Math.abs(a) * 0.1} ${a} l-6 2 M${20 - Math.abs(a) * 0.1} ${a} l6 2"/>`).join("")}</g></g>`;
const diamond = () => `<path d="M200 176 L330 120 L200 64 L70 120Z" fill="#2f9e6b"/><path d="M200 176 L290 128 L200 90 L110 128Z" fill="#d9a066"/><g fill="#fff"><rect x="196" y="170" width="10" height="10" transform="rotate(45 201 175)"/></g>`;
const bays = () => `<rect y="150" width="400" height="90" fill="#1a2b3a"/>${[0, 1, 2, 3].map((i) => `<path d="M${20 + i * 92} 150 V240" stroke="#fff" opacity=".25" stroke-width="3"/>`).join("")}<g>${[60, 150, 242, 330].map((x) => `<circle cx="${x}" cy="176" r="22" fill="#fff" opacity=".9"/><circle cx="${x}" cy="176" r="14" fill="#ff3d8b"/><circle cx="${x}" cy="176" r="6" fill="#fff"/>`).join("")}</g>`;
const cat = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><circle r="46" fill="#ff9b3d"/><path d="M-40 -28 L-30 -58 L-12 -38Z M40 -28 L30 -58 L12 -38Z" fill="#ff9b3d"/><g fill="#161b2a"><path d="M-6 -44 h12 l-3 14 h-6z M-40 -6 l16 -4 l-2 8z M40 -6 l-16 -4 l2 8z M-30 22 l14 -10 l2 8z M30 22 l-14 -10 l-2 8z"/></g><ellipse cx="0" cy="18" rx="22" ry="16" fill="#fff8e6"/><circle cx="-16" cy="-10" r="6" fill="#fff"/><circle cx="16" cy="-10" r="6" fill="#fff"/><circle cx="-15" cy="-10" r="3" fill="#161b2a"/><circle cx="17" cy="-10" r="3" fill="#161b2a"/><path d="M-6 10 h12 l-6 8z" fill="#ff3d8b"/></g>`;
const elephant = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})" fill="#8d9bb0"><path d="M-70 0 V-40 Q-70 -76 -30 -76 H30 Q64 -76 64 -44 V0 H44 V-22 H16 V0 H-4 V-22 H-44 V0Z"/><path d="M60 -66 Q100 -70 98 -34 Q96 -6 84 -2 Q80 -26 74 -30 Q66 -10 60 -34Z"/><ellipse cx="62" cy="-48" rx="16" ry="24" fill="#a4b2c6"/><circle cx="78" cy="-58" r="3" fill="#161b2a"/><path d="M92 -30 q20 6 18 -6" stroke="#fff8e6" stroke-width="5" fill="none"/></g>`;
const giraffe = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})" fill="#ffc04a"><path d="M-30 0 V-44 Q-30 -60 -10 -60 H20 Q36 -60 36 -44 V0 H26 V-30 H-18 V0Z"/><path d="M18 -56 L30 -130 H44 L38 -54Z"/><ellipse cx="44" cy="-136" rx="16" ry="10"/><rect x="40" y="-152" width="3" height="10"/><circle cx="52" cy="-138" r="2.4" fill="#161b2a"/><g fill="#a0642f"><circle cx="-6" cy="-44" r="6"/><circle cx="16" cy="-40" r="5"/><circle cx="34" cy="-92" r="5"/><circle cx="36" cy="-70" r="5"/></g></g>`;
const plane = (x, y, s = 1, rot = -14) =>
  `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M-80 0 Q-80 -20 -50 -22 H60 Q96 -20 104 0 Q96 18 60 20 H-50 Q-80 18 -80 0Z" fill="#e9eef7"/><path d="M-80 -2 L-96 -34 H-76 L-52 -22Z" fill="#c2415d"/><path d="M-10 -20 L-30 -64 H-8 L24 -20Z" fill="#c9d3e6"/><path d="M-10 18 L-24 52 H-6 L22 18Z" fill="#c9d3e6"/><g fill="#6fd3e8">${[-30, -10, 10, 30, 50].map((a) => `<circle cx="${a}" cy="-6" r="4.5"/>`).join("")}</g><path d="M90 -14 h12 v10 h-12z" fill="#6fd3e8"/></g>`;
const smoke = (x, y) => `<g fill="#555" opacity=".45"><circle cx="${x}" cy="${y}" r="10"/><circle cx="${x + 10}" cy="${y - 16}" r="14"/><circle cx="${x + 26}" cy="${y - 36}" r="18"/></g>`;
const pyramid = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})">${[0, 1, 2, 3, 4].map((i) => `<rect x="${-80 + i * 14}" y="${-i * 18 - 18}" width="${160 - i * 28}" height="18" fill="${["#b99d6e", "#c7ab7a", "#d4b987", "#e1c794", "#eed4a2"][i]}"/>`).join("")}<rect x="-12" y="-36" width="24" height="36" fill="#6a4a25"/><path d="M-20 -108 h40 v-10 h-40z" fill="#eed4a2"/></g>`;
const pagoda = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})">${[0, 1, 2].map((i) => `<g transform="translate(0 ${-i * 34})"><rect x="${-34 + i * 8}" y="-30" width="${68 - i * 16}" height="30" fill="#e0527a"/><path d="M${-48 + i * 8} -30 Q${-44 + i * 8} -36 ${-34 + i * 8} -38 H${34 - i * 8} Q${44 - i * 8} -36 ${48 - i * 8} -30Z" fill="#7a1f3a"/></g>`).join("")}<rect x="-2" y="-124" width="4" height="22" fill="#ffd47a"/></g>`;
const dragon = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-90 20 Q-60 -40 -20 -10 T40 -30 T90 -50" fill="none" stroke="#e0302a" stroke-width="18" stroke-linecap="round"/><path d="M80 -62 q28 -4 38 10 q-12 14 -34 10z" fill="#e0302a"/><path d="M84 -66 l-6 -18 l12 10z M96 -64 l2 -18 l8 14z" fill="#ffd47a"/><circle cx="104" cy="-56" r="3" fill="#fff"/><g fill="#ffd47a"><path d="M-70 -10 l6 -12 l6 12z M-40 -22 l6 -12 l6 12z M-8 -22 l6 -12 l6 12z M24 -36 l6 -12 l6 12z"/></g></g>`;
const tikiHut = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-34" y="-34" width="68" height="34" fill="#a0642f"/><path d="M-46 -30 L0 -74 L46 -30Z" fill="#d9a066"/><g stroke="#8a5a2b" stroke-width="2.4"><path d="M-30 -30 L-16 -56 M-10 -34 L0 -62 M10 -34 L16 -58 M28 -30 L20 -50" fill="none"/></g><rect x="-8" y="-24" width="16" height="24" fill="#4a321f"/></g>`;
const torch = (x, y) => `<g><rect x="${x - 2}" y="${y - 40}" width="4" height="40" fill="#8a5a2b"/><path d="M${x} ${y - 66} q12 14 0 26 q-12 -12 0 -26z" fill="#ffb627"/><path d="M${x} ${y - 58} q6 8 0 16 q-6 -8 0 -16z" fill="#ff5a3d"/></g>`;
const goldMine = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-74 0 Q-74 -80 0 -80 Q74 -80 74 0Z" fill="#8a6a45"/><path d="M-44 0 V-44 H44 V0Z" fill="#1a1208"/><rect x="-52" y="-52" width="10" height="52" fill="#a0642f"/><rect x="42" y="-52" width="10" height="52" fill="#a0642f"/><rect x="-56" y="-58" width="112" height="9" fill="#a0642f"/><path d="M-30 0 H30" stroke="#8892a0" stroke-width="4"/></g><g><path d="M120 -2 H190 L180 -34 H130Z" transform="translate(${x - 60} ${y})" fill="#8892a0"/><g transform="translate(${x + 70} ${y - 38})" fill="#ffd24a"><circle cx="0" cy="0" r="8"/><circle cx="14" cy="-4" r="7"/><circle cx="26" cy="2" r="8"/></g></g>`;
const treasureChest = (x, y, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-34" y="-30" width="68" height="30" fill="#8a5a2b"/><path d="M-34 -30 Q-34 -58 0 -58 Q34 -58 34 -30Z" fill="#a0642f"/><rect x="-34" y="-34" width="68" height="6" fill="#ffd24a"/><rect x="-5" y="-38" width="10" height="14" fill="#ffd24a"/><g fill="#ffd24a"><circle cx="-14" cy="-62" r="6"/><circle cx="2" cy="-66" r="6"/><circle cx="18" cy="-62" r="6"/></g></g>`;
const coffee = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-22 -34 H18 V-6 Q18 4 8 4 H-12 Q-22 4 -22 -6Z" fill="#fff8e6"/><path d="M18 -28 q14 0 14 10 q0 10 -14 10" fill="none" stroke="#fff8e6" stroke-width="5"/><rect x="-18" y="-34" width="32" height="6" fill="#6b3f1f"/><path d="M-10 -44 q-6 -10 0 -18 M2 -44 q-6 -10 0 -18" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/></g>`;
const hammock = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-80 -60 Q0 10 80 -60" fill="none" stroke="#ff3d8b" stroke-width="10" stroke-linecap="round"/><path d="M-80 -60 Q0 10 80 -60" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="10 8" opacity=".6"/></g>`;
const jar = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-22" y="-62" width="44" height="12" rx="3" fill="#c9d3e6"/><path d="M-26 -50 H26 V-4 Q26 4 18 4 H-18 Q-26 4 -26 -4Z" fill="#fff8e6" opacity=".9"/><path d="M-22 -34 H22 V-4 Q22 0 16 0 H-16 Q-22 0 -22 -4Z" fill="#ffd47a"/></g>`;
const grapes = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#7a2b8e"><circle cx="-12" cy="0" r="9"/><circle cx="8" cy="0" r="9"/><circle cx="-2" cy="14" r="9"/><circle cx="-22" cy="14" r="9"/><circle cx="18" cy="14" r="9"/><circle cx="-12" cy="28" r="9"/><circle cx="8" cy="28" r="9"/><circle cx="-2" cy="42" r="9"/><path d="M-2 -8 q-4 -16 12 -22 q-2 14 -12 22z" fill="#3b8f3a"/></g>`;
const vineRows = (y = 168) => `<path d="M0 ${y} Q100 ${y - 34} 200 ${y - 6} T400 ${y - 22} V240 H0Z" fill="#3a2a5a"/><g stroke="#6a8f4a" stroke-width="3" fill="none" opacity=".9"><path d="M0 ${y + 14} Q100 ${y - 14} 200 ${y + 10} T400 ${y - 4}"/><path d="M0 ${y + 32} Q100 ${y + 6} 200 ${y + 28} T400 ${y + 14}"/><path d="M0 ${y + 50} Q100 ${y + 26} 200 ${y + 46} T400 ${y + 32}"/></g>`;
const stringLights = () => `<path d="M0 30 Q100 70 200 30 T400 30" fill="none" stroke="#161b2a" stroke-width="2"/>${[30, 80, 130, 180, 230, 280, 330, 380].map((x, i) => `<circle cx="${x}" cy="${30 + Math.sin(x / 63) * 14 + 22}" r="5" fill="${["#ffd47a", "#ff9ab0"][i % 2]}"/>`).join("")}`;
const bar = () => `<rect y="170" width="400" height="70" fill="#2a1638"/><rect y="170" width="400" height="8" fill="#6b3f1f"/>`;
const storefront = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-80" y="-84" width="160" height="84" fill="#b5533c"/><g stroke="#8e3a28" stroke-width="2" opacity=".6">${[-60, -40, -20, 0, 20, 40, 60].map((a) => `<path d="M${a} -84 V0"/>`).join("")}</g><path d="M-86 -50 H86 L78 -30 H-78Z" fill="#fff8e6"/>${Array.from({ length: 8 }, (_, i) => `<path d="M${-86 + i * 21.5} -50 h10.75 l-3 20 h-10.75z" fill="#e0527a"/>`).join("")}<rect x="-70" y="-26" width="46" height="26" fill="#6fd3e8"/><rect x="-14" y="-28" width="24" height="28" fill="#4a321f"/><rect x="26" y="-26" width="46" height="26" fill="#6fd3e8"/></g>`;
const taps = (x, y) => `<g transform="translate(${x} ${y})"><rect x="-90" y="-8" width="180" height="10" rx="3" fill="#8892a0"/>${Array.from({ length: 9 }, (_, i) => `<g transform="translate(${-80 + i * 20} 0)"><rect x="-3" y="0" width="6" height="14" fill="#c9d3e6"/><circle cy="-14" r="6" fill="${["#ffb627", "#ff3d8b", "#00e5cc", "#7bc043"][i % 4]}"/></g>`).join("")}</g>`;
const planet = (x, y, r, c) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><ellipse cx="${x}" cy="${y}" rx="${r * 1.7}" ry="${r * 0.3}" fill="none" stroke="#fff" stroke-width="2.4" opacity=".8" transform="rotate(-18 ${x} ${y})"/>`;
const kayak = (x, y, s = 1, c = "#ff7a59") => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-70 0 Q0 -22 70 0 Q0 14 -70 0Z" fill="${c}"/><circle cy="-14" r="8" fill="#ffd1a8"/><path d="M-6 -6 H6 L8 -20 H-8Z" fill="#00e5cc"/><path d="M-50 -30 L50 8" stroke="#161b2a" stroke-width="3"/><path d="M-56 -36 l14 8 l-8 4z M44 4 l14 8 l-8 4z" fill="#161b2a"/></g>`;
const jetski = (x, y, s = 1, c = "#ff3d8b") => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-60 0 Q-50 -22 -10 -22 L20 -22 Q40 -40 56 -34 L60 -20 Q74 -14 66 4 Q10 12 -60 0Z" fill="${c}"/><path d="M-10 -22 Q4 -36 14 -22Z" fill="#bfede6"/><g fill="#fff" opacity=".85"><path d="M-72 4 q-12 -4 -20 4 q10 6 22 2z M-84 -2 q-8 -8 -16 -2 q8 6 18 4z"/></g><circle cx="-8" cy="-32" r="8" fill="#ffd1a8"/><rect x="-14" y="-24" width="12" height="16" fill="#161b2a"/></g>`;
const parachute = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-60 0 Q0 -70 60 0Z" fill="#ff3d8b"/><path d="M-60 0 Q-30 -54 0 -56 Q-12 -30 -12 0Z M0 -56 Q30 -54 60 0 H12 Q12 -30 0 -56Z" fill="#ffb627"/><path d="M-60 0 L0 70 M60 0 L0 70 M-20 0 L0 70 M20 0 L0 70" stroke="#fff" stroke-width="1.6" fill="none" opacity=".8"/><circle cy="76" r="8" fill="#ffd1a8"/></g>`;
const zip = () => `<path d="M10 70 L390 130" stroke="#fff8e6" stroke-width="3"/><g transform="translate(200 100)"><path d="M0 -4 v20 M-10 12 q10 -4 20 0" stroke="#fff" stroke-width="3"/><circle cy="24" r="8" fill="#ffd1a8"/><path d="M-6 32 L-8 56 M6 32 L8 56 M-6 36 L-18 44 M6 36 L18 44" stroke="#ff3d8b" stroke-width="6" stroke-linecap="round"/></g><rect x="14" y="66" width="8" height="120" fill="#6b4a2f"/>`;
const treehouse = () => `<g fill="#6b4a2f"><rect x="40" y="90" width="12" height="100"/><rect x="340" y="110" width="12" height="80"/></g>${oak(60, 100, 0.9, "#1d6b45")}${oak(350, 120, 0.9, "#1d6b45")}<path d="M54 110 L346 130" stroke="#8a5a2b" stroke-width="6"/>`;
const wax = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><circle cy="-60" r="14" fill="#ffd1a8"/><path d="M-4 -62 q0 -22 18 -18 q-2 16 -14 20z" fill="#6b3f1f"/><path d="M-22 -46 H22 L26 0 H-26Z" fill="#c2184f"/><path d="M-22 -46 L-40 -20 M22 -46 L40 -20" stroke="#c2184f" stroke-width="8" stroke-linecap="round"/></g>`;
const star = (x, y, r, c = "#ffd24a") => `<path d="${Array.from({ length: 10 }, (_, i) => { const a = (Math.PI / 5) * i - Math.PI / 2; const rr = i % 2 ? r * 0.45 : r; return `${i ? "L" : "M"}${(x + rr * Math.cos(a)).toFixed(1)} ${(y + rr * Math.sin(a)).toFixed(1)}`; }).join("")}Z" fill="${c}"/>`;
const upsideBuilding = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-70" y="-90" width="140" height="70" fill="#7aa6d6"/><path d="M-70 -20 L0 40 L70 -20Z" fill="#c2415d"/><g fill="#fff8e6">${[-52, -22, 8, 38].map((a) => `<rect x="${a}" y="-76" width="16" height="22"/>`).join("")}</g><rect x="-70" y="-100" width="140" height="10" fill="#ffd47a"/><g stroke="#0b3a53" stroke-width="3"><path d="M-40 -100 v-14 M40 -100 v-14"/></g></g>`;
const aquarium = () => `<rect width="400" height="240" fill="#0a3d6a"/><g fill="#7fd6ea" opacity=".16"><path d="M60 0 L20 240 H100Z M240 0 L190 240 H290Z"/></g>${fish(80, 90, 1.5)}${fish(210, 60, 1.1, "#ff3d8b")}${fish(300, 130, 1.8, "#7bc043")}${fish(150, 160, 1, "#ffd47a")}<path d="M0 240 Q60 200 120 240Z M280 240 Q330 190 400 240Z" fill="#1f7a52"/>${[40, 340, 370].map((x) => `<circle cx="${x}" cy="${100 + (x % 70)}" r="4" fill="#fff" opacity=".6"/>`).join("")}<path d="M0 180 Q100 150 200 180 T400 170 V240 H0Z" fill="#1b5a8a" opacity=".7"/><path d="M120 200 q60 -44 130 0" fill="none" stroke="#bfe9ff" stroke-width="10" opacity=".5"/>`;
const scoreboardGlow = () => "";

// ---------- scene recipes ----------
const S = {};
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];

S.pirate = (r, o) => {
  const k = o.sky || pick(r, ["sunset", "dusk", "dusk", "day"]);
  const boatsX = 200 + ((r() * 40) | 0) - 20;
  const dark = o.dark ?? r() > 0.35;
  if (o.ship2 === undefined) o.ship2 = r() > 0.5;
  if (o.palm === undefined) o.palm = r() > 0.5;
  return [
    sky(k), SKIES[k].moon ? stars(r, 10) : cloud(70, 56, 1, "#fff", 0.7), SKIES[k].moon ? sun(k, 90, 66, 24) : sun(k, 320, 80, 36),
    sea(170),
    ship(boatsX, 160, 0.95, dark ? "#202638" : "#f7e9d0", dark ? "#161b2a" : "#8a5a2b", "#ff3d8b", o.sails ?? 2),
    o.ship2 ? ship(340, 150, 0.4, "#2a3550", "#161b2a", "#ffb627", 1) : "",
    o.palm ? palm(350, 190, 0.9) : "", o.chest ? treasureChest(70, 214, 0.7) : "", o.spy ? `<g transform="translate(60 80) rotate(-30)"><rect x="-26" y="-6" width="52" height="12" rx="3" fill="#a0642f"/><rect x="-34" y="-9" width="12" height="18" rx="3" fill="#ffd24a"/><rect x="22" y="-4" width="10" height="8" fill="#ffd24a"/></g>` : "",
    o.hook ? `<g transform="translate(70 70)"><path d="M0 0 v34 q0 14 -12 14 q-8 0 -8 -8" fill="none" stroke="#c9d3e6" stroke-width="6" stroke-linecap="round"/></g>` : "",
    bird(300, 60), bird(330, 44, 0.7),
  ].join("");
};
S.dino = (r, o) => {
  const k = o.sky || pick(r, ["sunset", "dawn", "day"]);
  return [sky(k), sun(k, 300, 100, 44), hills(150, "#c2415d", 0.45), volcano(268, 160, 0.9), grass(184), palm(66, 196, 1.1, "#1d5c3f", "#5a3b22"), dino(190, 190, 1.35), o.ice ? "" : "", flag(344, 214), bird(250, 60)].join("");
};
S.tropical = (r, o) => {
  const k = o.sky || pick(r, ["sunset", "dawn", "day"]);
  return [sky(k), sun(k, 310, 82, 38), cloud(84, 52), o.volcano ? volcano(230, 168, 1.1) : hills(160, "#2e8f6b", 0.5), sea(166), o.hut ? tikiHut(330, 196, 1.0) : "", sand(200), palm(70, 206, 1.2), palm(130, 210, 0.9, "#2f9e6b"), o.tiki ? mask(210, 200, 0.9) : "", o.falls ? `<path d="M280 110 q-6 40 0 74" stroke="#bfede6" stroke-width="12" opacity=".9" fill="none"/>` : "", o.tiki ? torch(176, 214) + torch(244, 214) : "", bird(240, 56)].join("");
};
S.safari = (r, o) => {
  const k = o.sky || "sunset";
  return [sky(k), sun(k, 300, 110, 50), `<path d="M0 170 H400 V240 H0Z" fill="#c98f3e"/>`, `<path d="M0 170 Q100 158 200 170 T400 166 V240 H0Z" fill="#d9a350"/>`, `<g transform="translate(340 168)"><rect x="-3" y="-90" width="6" height="90" fill="#5a3b22"/><ellipse cx="0" cy="-96" rx="44" ry="14" fill="#2a6f4a"/></g>`, elephant(120, 214, 0.9), giraffe(280, 214, 0.75), o.jungle ? palm(40, 214, 1.2, "#1d6b45") : "", bird(200, 50)].join("");
};
S.plane = (r) => [sky("day"), cloud(80, 50), cloud(300, 40, 1.2), `<path d="M0 120 L80 70 L150 130 L230 80 L320 140 L400 110 V240 H0Z" fill="#2e8f6b" opacity=".6"/>`, grass(176, "#2f9e6b", "#1f7a52"), palm(60, 210, 1.2, "#1d5c3f"), palm(340, 206, 1.1, "#1d5c3f"), smoke(250, 150), plane(190, 160, 0.9, -12), `<g transform="translate(330 70)"><path d="M-40 0 H40 M0 0 v-10" stroke="#161b2a" stroke-width="4"/><path d="M-40 -2 l-8 -4 M40 -2 l8 -4" stroke="#161b2a" stroke-width="3"/><rect x="-14" y="0" width="28" height="12" rx="4" fill="#c2415d"/></g>`].join("");
S.atlantis = (r) => [`<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b5d7a"/><stop offset="1" stop-color="#0b2a4a"/></linearGradient></defs><rect width="400" height="240" fill="url(#sk)"/>`, `<g fill="#7fd6ea" opacity=".14"><path d="M70 0 L20 240 H120Z M250 0 L200 240 H320Z"/></g>`, column(70, 200, 110), column(130, 200, 70, "#cfe9e4"), column(300, 200, 100), column(340, 200, 60, "#cfe9e4"), `<path d="M40 100 H170 L150 90 H60Z" fill="#fff8e6" opacity=".9"/><path d="M280 100 H370" stroke="#fff8e6" stroke-width="8"/>`, `<g transform="translate(200 190)"><path d="M-30 0 Q-34 -46 0 -56 Q34 -46 30 0Z" fill="#7a4a2a"/><path d="M-26 -46 q-22 -6 -26 -30 q18 4 26 20z M26 -46 q22 -6 26 -30 q-18 4 -26 20z" fill="#e8d8b6"/><circle cx="-10" cy="-30" r="3" fill="#fff"/><circle cx="10" cy="-30" r="3" fill="#fff"/><rect x="-8" y="-20" width="16" height="10" rx="4" fill="#161b2a"/></g>`, `<path d="M0 214 Q60 196 120 214 T240 214 T400 210 V240 H0Z" fill="#e8d8b6"/>`, fish(60, 60, 0.9), fish(330, 70, 1.1, "#ff3d8b"), `<g fill="#fff" opacity=".6"><circle cx="100" cy="150" r="4"/><circle cx="110" cy="130" r="3"/><circle cx="296" cy="140" r="4"/></g>`].join("");
S.dragon = (r) => [sky("dusk"), stars(r, 10), sun("dusk", 90, 66, 28), hills(160, "#3a1f4e", 0.7), pagoda(110, 190, 1.1), dragon(250, 160, 1), sea(184, "#12a6a0", "#0e8c87", "#2b6a92"), `<g stroke="#ffd47a" stroke-width="3">${[40, 70, 100, 330, 360].map((x, i) => `<path d="M${x} ${40 + i * 4} v14"/>`).join("")}</g>`].join("");
S.pyramid = (r, o) => [sky(o.sky || "sunset"), sun(o.sky || "sunset", 90, 78, 36), `<path d="M0 150 L70 110 L140 150 L220 100 L400 156 V240 H0Z" fill="#2e8f6b" opacity=".55"/>`, pyramid(250, 188, 1.15), grass(190, "#2f9e6b", "#1f7a52"), palm(60, 212, 1.3, "#1d5c3f"), palm(360, 208, 1.1, "#1d5c3f"), palm(120, 216, 0.8, "#2f9e6b"), flag(170, 218), bird(160, 56)].join("");
S.haunted = (r) => [sky("neon"), stars(r, 14), `<circle cx="300" cy="70" r="30" fill="#ffd6f0" opacity=".9"/>`, `<g fill="#120a24"><path d="M0 170 Q100 150 200 170 T400 160 V240 H0Z"/></g>`, hauntedHouse(120, 186, 1.2), ghost(290, 150, 1.2), ghost(240, 110, 0.7), `<g stroke="#120a24" stroke-width="5" fill="none"><path d="M330 190 q-4 -50 10 -80 M330 140 l-20 -14 M338 120 l16 -12"/></g>`, `<g fill="#ff7a1a"><ellipse cx="60" cy="222" rx="14" ry="12"/><path d="M58 210 l2 -8 l4 8z" fill="#3b8f3a"/></g>`, sand(214, "#1a0f32", "#120a24")].join("");
S.neon = (r) => [sky("neon"), stars(r, 8), `<rect y="170" width="400" height="70" fill="#12062b"/>`, neonRing(200, 124, 78, "#00e5cc"), neonRing(200, 124, 54, "#ff3d8b"), neonRing(200, 124, 30, "#ffd24a"), `<g transform="translate(200 120)"><path d="M-80 90 L-20 -4" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M-26 -8 h16" stroke="#fff" stroke-width="9" stroke-linecap="round"/></g>`, ball(212, 168, 11, "#fff"), `<path d="M0 170 H400" stroke="#00e5cc" stroke-width="3" opacity=".9"/>`, `<g stroke="#ff3d8b" stroke-width="3" opacity=".8"><path d="M30 60 l20 -20 M360 50 l-18 18 M60 140 l-22 6"/></g>`].join("");
S.goldmine = (r, o) => [sky(o.sky || "sunset"), sun(o.sky || "sunset", 310, 76, 34), hills(160, "#8a5a2b", 0.7), `<path d="M0 176 Q100 164 200 176 T400 172 V240 H0Z" fill="#c98f3e"/>`, goldMine(130, 206, 1.15), o.gems ? `<g>${[[270, 206, "#ff3d8b"], [300, 214, "#00e5cc"], [330, 204, "#ffd24a"], [350, 216, "#7a2b8e"]].map(([x, y, c]) => `<path d="M${x} ${y - 14} l10 8 l-4 14 h-12 l-4 -14z" fill="${c}"/>`).join("")}</g>` : "", bird(240, 50)].join("");
S.kart = (r, o) => [sky(o.sky || "sunset"), `<g stroke="#fff" stroke-width="3" opacity=".4"><path d="M0 60 H400 M0 76 H400 M0 92 H400"/></g>`, sun(o.sky || "sunset", 320, 90, 36), `<g transform="translate(330 40)"><rect width="30" height="30" fill="#fff"/><path d="M0 0h10v10h-10z M20 0h10v10h-10z M10 10h10v10h-10z M0 20h10v10h-10z M20 20h10v10h-10z" fill="#0b3a53"/></g>`, road(172), kart(200, 190, 1.05, o.body || "#00e5cc"), speed(), o.indoor ? "" : palm(40, 176, 0.9)].join("");
S.wheel = (r) => [sky("dusk"), stars(r, 8), sun("dusk", 90, 70, 26), `<g opacity=".9">${coaster(176)}</g>`, ferris(250, 112, 1.1), sea(186, "#12a6a0", "#0e8c87", "#2b86a8"), pier(214, "#6b4a2f"), bird(70, 40)].join("");
S.wavepark = (r) => [sky("day"), cloud(70, 50), sun("day", 330, 66, 32), waveSlide(), `<rect y="190" width="400" height="50" fill="#2b86a8"/><path d="M0 196 Q50 184 100 196 T200 196 T300 196 T400 196 V240 H0Z" fill="#12a6a0"/><g stroke="#fff" stroke-width="3" fill="none" opacity=".7"><path d="M60 214 q10 -6 20 0 M240 220 q10 -6 20 0"/></g>`, `<g transform="translate(150 182)"><circle cy="-8" r="9" fill="#ffd1a8"/><path d="M-12 8 q12 -12 24 0 v16 h-24z" fill="#ffb627"/></g>`, palm(380, 210, 0.9)].join("");
S.zipline = (r) => [sky("day"), cloud(90, 50), sun("day", 330, 70, 32), `<path d="M0 150 q60 -60 120 0 q60 -50 120 0 q60 -60 160 -10 V240 H0Z" fill="#2e8f6b" opacity=".6"/>`, grass(190, "#2f9e6b", "#1f7a52"), treehouse(), zip(), bird(260, 40)].join("");
S.parasail = (r) => [sky("sunset"), sun("sunset", 80, 100, 36), cloud(300, 50), sea(176), parachute(230, 88, 1.05), boat(230, 200, 0.8, "#fff8e6", "#ff3d8b"), `<path d="M230 158 L230 188" stroke="#fff" stroke-width="1.6" opacity=".8"/>`, bird(80, 52)].join("");
S.jetski = (r, o) => [sky(o.sky || "sunset"), sun(o.sky || "sunset", 90, 90, 36), cloud(320, 54), sea(166), jetski(220, 196, 1.3), `<path d="M110 206 q40 -10 70 -2" stroke="#fff" stroke-width="6" fill="none" opacity=".6" stroke-linecap="round"/>`, o.dock ? pier(220, "#6b4a2f") : "", bird(60, 50)].join("");
S.dolphin = (r, o) => [sky(o.sky || "sunset"), sun(o.sky || "sunset", 320, 80, 38), cloud(80, 50), sea(150, "#12a6a0", "#0e8c87", "#2b86a8"), dolphin(190, 170, 1.4), `<path d="M120 178 q70 -50 140 0" fill="none" stroke="#fff" stroke-width="4" opacity=".6"/>`, o.boat ? boat(330, 168, 0.55) : sail(330, 164, 0.8), bird(80, 70)].join("");
S.kayak = (r, o) => [sky(o.sky || "day"), sun(o.sky || "day", 320, 70, 32), `<path d="M0 150 L50 110 L110 150 L200 100 L290 150 L350 118 L400 150 V240 H0Z" fill="#3a8f6b" opacity=".6"/>`, sea(158, "#2aa6a0", "#1e8c8a", "#2b86a8"), kayak(210, 196, 1.3, o.c || "#ff7a59"), o.marsh ? cattail(60, 220) + cattail(340, 222, 0.9) : palm(350, 190, 0.8), bird(120, 54)].join("");
S.gator = (r) => [sky("day"), sun("day", 330, 55, 30), `<path d="M0 150 q40 -50 80 0 q30 -40 60 0 q40 -60 90 0 q50 -30 70 0 q40 -35 100 0 V240 H0Z" fill="#2e8f6b" opacity=".5"/>`, `<rect y="170" width="400" height="70" fill="#2f7d6b"/>`, `<g fill="#7bc043"><ellipse cx="60" cy="206" rx="26" ry="8"/><ellipse cx="340" cy="212" rx="24" ry="7"/></g>`, gator(210, 206, 1.1), cattail(366, 176), cattail(36, 180, 0.8)].join("");
S.cat = (r) => [sky("sunset"), sun("sunset", 320, 90, 40), `<path d="M0 176 H400 V240 H0Z" fill="#c98f3e"/>`, `<g transform="translate(60 176)"><rect x="-3" y="-80" width="6" height="80" fill="#5a3b22"/><ellipse cx="0" cy="-86" rx="40" ry="12" fill="#2a6f4a"/></g>`, cat(200, 150, 1.5), `<path d="M0 214 Q100 198 200 214 T400 210 V240 H0Z" fill="#b97e2e"/>`, `<g stroke="#e0a64a" stroke-width="3"><path d="M20 206 l4 -12 M34 210 l-2 -14 M340 206 l4 -12 M356 212 l-2 -14"/></g>`].join("");
S.statepark = (r, o) => [sky(o.sky || "sunset"), sun(o.sky || "sunset", 310, 76, 38), cloud(80, 52), sea(150, "#12a6a0", "#0e8c87", "#2b86a8"), sand(176), `<g stroke="#8a5a2b" stroke-width="5"><path d="M20 190 H380"/>${[40, 100, 160, 220, 280, 340].map((x) => `<path d="M${x} 190 V216"/>`).join("")}</g>`, `<path d="M0 190 H400" stroke="#d9a066" stroke-width="9"/>`, palm(70, 200, 1.1, "#1d5c3f"), o.lighthouse ? lighthouse(330, 190, 0.8) : palm(340, 200, 0.9, "#2f9e6b"), bird(200, 50)].join("");
S.gardens = (r) => [sky("dawn"), sun("dawn", 90, 70, 30), `<path d="M0 150 q100 -30 200 0 t200 0 V240 H0Z" fill="#cfe9c0"/>`, grass(180, "#4fae6b", "#2f8f55"), oak(80, 190, 1.0), oak(330, 194, 1.1), `<g transform="translate(200 186)"><rect x="-34" y="-8" width="68" height="8" fill="#e8d8b6"/><path d="M-6 -8 q-8 -32 8 -52 q14 8 8 26 l12 -12 q6 18 -12 38z" fill="#e8d8b6"/><circle cx="2" cy="-64" r="8" fill="#e8d8b6"/></g>`, `<g>${[[40, 214, "#ff3d8b"], [60, 220, "#ffb627"], [300, 216, "#ff3d8b"], [320, 222, "#fff"], [350, 214, "#ffb627"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="5" fill="${c}"/>`).join("")}</g>`, bird(250, 56)].join("");
S.boardwalk = (r, o) => [sky(o.sky || "sunset"), sun(o.sky || "sunset", 300, 80, 40), cloud(80, 50), sea(150, "#12a6a0", "#0e8c87", "#2b86a8"), `<rect y="190" width="400" height="50" fill="#a0722f"/>`, `<g stroke="#7a521f" stroke-width="3">${[0, 50, 100, 150, 200, 250, 300, 350].map((x) => `<path d="M${x} 190 V240"/>`).join("")}</g>`, `<g stroke="#fff8e6" stroke-width="4"><path d="M0 188 H400"/>${[20, 90, 160, 230, 300, 370].map((x) => `<path d="M${x} 188 V164"/>`).join("")}<path d="M0 166 H400"/></g>`, o.marsh ? cattail(50, 190) + cattail(350, 192, 0.8) : ferris(300, 112, 0.5), palm(60, 186, 1.0), o.wharf ? boat(220, 168, 0.5) : "", bird(220, 54)].join("");
S.harbor = (r) => [sky("sunset"), sun("sunset", 300, 84, 40), sea(160, "#12a6a0", "#0e8c87", "#2b86a8"), boat(250, 176, 0.75), sail(120, 172, 0.9), `<rect y="196" width="400" height="44" fill="#a0722f"/>`, `<g fill="#b5533c">${[20, 110, 200, 290].map((x) => `<rect x="${x}" y="130" width="70" height="66"/><path d="M${x - 6} 130 L${x + 35} 100 L${x + 76} 130Z" fill="#6b4a2f"/>`).join("")}</g>`, `<g fill="#fff8e6">${[34, 54, 124, 144, 214, 234, 304, 324].map((x) => `<rect x="${x}" y="146" width="10" height="16"/>`).join("")}</g>`, `<rect y="196" width="400" height="6" fill="#85603c"/>`, bird(200, 50)].join("");
S.boatTour = (r, o) => [sky(o.sky || "sunset"), sun(o.sky || "sunset", 90, 90, 36), cloud(300, 50), sea(150, "#12a6a0", "#0e8c87", "#2b86a8"), boat(230, 186, 1.2, "#fff8e6", "#ff3d8b"), `<path d="M0 156 Q50 120 90 156 Q140 112 190 156 V170 H0Z" fill="#1d5c3f" opacity=".7"/>`, o.dolphin ? dolphin(90, 206, 0.6) : "", bird(300, 70)].join("");
S.plantation = (r) => [sky("sunset"), sun("sunset", 310, 80, 38), cloud(80, 50), grass(190, "#4fae6b", "#2f8f55"), oak(70, 196, 1.2), oak(330, 198, 1.2), house(200, 190, 1.2), `<path d="M170 190 Q200 220 230 190Z" fill="#e8d8b6" opacity=".7"/>`, bird(250, 50)].join("");
S.castle = (r) => [sky("sunset"), sun("sunset", 310, 76, 34), sea(160, "#12a6a0", "#0e8c87", "#2b86a8"), sand(186), castle(200, 200, 1.35), palm(60, 206, 1.1), palm(350, 208, 1.0), bird(110, 60)].join("");
S.museum = (r, o) => [sky(o.sky || "day"), sun(o.sky || "day", 320, 64, 30), cloud(70, 56), `<rect x="60" y="100" width="280" height="14" fill="#e8d8b6"/><path d="M50 100 L200 52 L350 100Z" fill="#cdbb94"/><g>${[84, 128, 172, 216, 260, 304].map((x) => `<rect x="${x}" y="114" width="18" height="70" fill="#f4ead2"/>`).join("")}</g><rect x="50" y="184" width="300" height="10" fill="#e8d8b6"/><rect x="40" y="194" width="320" height="10" fill="#cdbb94"/>`, o.ship ? ship(330, 196, 0.35, "#f7e9d0", "#8a5a2b") : "", grass(206, "#4fae6b", "#2f8f55"), oak(32, 214, 0.7), bird(250, 44)].join("");
S.lanternTour = (r) => [sky("neon"), stars(r, 14), `<circle cx="310" cy="64" r="26" fill="#ffd6f0" opacity=".9"/>`, `<g fill="#120a24"><path d="M0 170 H400 V240 H0Z"/><rect x="40" y="90" width="80" height="80"/><path d="M34 90 L80 60 L126 90Z"/><rect x="260" y="104" width="90" height="66"/><path d="M254 104 L305 76 L356 104Z"/></g><g fill="#ffb627">${[[56, 106], [92, 106], [276, 118], [312, 118]].map(([x, y]) => `<rect x="${x}" y="${y}" width="12" height="16"/>`).join("")}</g>`, oak(200, 190, 1.4, "#0f2a2a"), lantern(150, 214, 1.4), ghost(250, 130, 0.9)].join("");
S.theater = (r, o) => [curtain(), spot(200), o.hero || "", `<g fill="#fff3c4" opacity=".9">${[60, 140, 260, 340].map((x) => `<circle cx="${x}" cy="12" r="3"/>`).join("")}</g>`].join("");
S.dinner = (r, o) => [sky(o.sky || "dusk"), o.sky === "day" ? "" : stars(r, 10), o.hero || ""].join("");
S.stage = (r, o) => [`<rect width="400" height="240" fill="#14082e"/><g fill="#ff3d8b" opacity=".18"><path d="M60 0 L0 240 H120Z"/></g><g fill="#00e5cc" opacity=".16"><path d="M340 0 L280 240 H400Z"/></g><g fill="#ffd24a" opacity=".14"><path d="M200 0 L140 240 H260Z"/></g>`, o.hero || "", `<rect y="196" width="400" height="44" fill="#2a1638"/><rect y="196" width="400" height="5" fill="#ff3d8b"/>`].join("");
S.beachclub = (r, o) => [sky(o.sky || "dusk"), sun(o.sky || "dusk", 310, 80, 34), stars(r, 6), sea(158), sand(196), sunbrella(90, 216, 1.1), sunbrella(310, 218, 1.2, "#00e5cc", "#fff"), `<g transform="translate(200 200)"><circle cx="-14" cy="-52" r="9" fill="#ffd1a8"/><circle cx="16" cy="-52" r="9" fill="#ffd1a8"/><path d="M-22 -42 L-8 0 H-20 Z M24 -42 L8 0 H20Z M-22 -42 H24 L18 -22 H-16Z" fill="#ff3d8b"/></g>`, `<g fill="#ffd47a">${[40, 130, 270, 360].map((x, i) => `<circle cx="${x}" cy="${150 + (i % 2) * 6}" r="4"/>`).join("")}</g><path d="M0 146 Q100 168 200 146 T400 146" fill="none" stroke="#161b2a" stroke-width="2"/>`].join("");
S.honky = (r) => [`<rect width="400" height="240" fill="#2b1608"/>`, `<g fill="#ffd47a" opacity=".16"><path d="M130 0 L60 240 H200Z M270 0 L200 240 H340Z"/></g>`, `<rect y="190" width="400" height="50" fill="#6b3f1f"/><g stroke="#4a2a14" stroke-width="3">${[0, 60, 120, 180, 240, 300, 360].map((x) => `<path d="M${x} 190 V240"/>`).join("")}</g>`, cowboy(200, 120, 1.7), star(70, 70, 22, "#ffd24a"), star(330, 80, 18, "#ffd24a"), `<g transform="translate(90 190)" fill="#a0642f"><path d="M0 0 V-34 H18 V-14 H34 V0Z"/></g>`, `<g transform="translate(300 190)" fill="#a0642f"><path d="M0 0 V-34 H18 V-14 H34 V0Z"/></g>`, `<g fill="#ffd47a">${[30, 120, 280, 370].map((x) => `<circle cx="${x}" cy="30" r="5"/>`).join("")}</g>`].join("");
S.pier = (r, o) => [sky(o.sky || "dusk"), SKIES[o.sky || "dusk"].moon ? stars(r, 8) : "", sun(o.sky || "dusk", 300, 70, 32), sea(150, "#12a6a0", "#0e8c87", "#2b86a8"), `<g fill="#6b4a2f"><rect x="0" y="156" width="400" height="12"/>${[30, 90, 150, 210, 270, 330, 390].map((x) => `<rect x="${x - 4}" y="168" width="8" height="52"/>`).join("")}</g><g fill="#fff3c4">${[30, 90, 150, 210, 270, 330].map((x) => `<circle cx="${x}" cy="140" r="5"/>`).join("")}</g><path d="M0 140 H400" stroke="#161b2a" stroke-width="2"/>`, o.stage ? "" : "", mic(300, 156, 0.7), bird(80, 50)].join("");
S.rooftop = (r) => [sky("dusk"), stars(r, 8), sun("dusk", 310, 70, 30), sea(140, "#12a6a0", "#0e8c87", "#2b86a8"), `<rect x="0" y="150" width="400" height="90" fill="#1a1230"/><rect y="150" width="400" height="6" fill="#ff3d8b"/>`, `<g fill="#ffd47a">${[20, 60, 100, 140, 180, 220, 260, 300, 340, 380].map((x) => `<circle cx="${x}" cy="130" r="4.5"/>`).join("")}</g><path d="M0 130 H400" stroke="#161b2a" stroke-width="2"/>`, disco(120, 96, 0.9), mic(280, 196, 0.9), `<g transform="translate(200 196)"><rect x="-30" y="-30" width="60" height="30" fill="#2a1638"/><rect x="-26" y="-26" width="52" height="4" fill="#00e5cc"/></g>`].join("");
S.comedy = (r) => [curtain(), spot(200), mic(200, 200, 1.7), `<g transform="translate(110 130)"><path d="M-30 -20 Q-30 20 0 28 Q30 20 30 -20Z" fill="#ffd24a"/><path d="M-20 -6 q8 -8 14 0 M6 -6 q8 -8 14 0" stroke="#161b2a" stroke-width="4" fill="none"/><path d="M-16 6 Q0 24 16 6Z" fill="#161b2a"/></g>`, `<g transform="translate(290 130)"><path d="M-30 -20 Q-30 20 0 28 Q30 20 30 -20Z" fill="#ffd24a"/><path d="M-20 -4 q8 8 14 0 M6 -4 q8 8 14 0" stroke="#161b2a" stroke-width="4" fill="none"/><path d="M-14 20 Q0 4 14 20Z" fill="#161b2a"/></g>`].join("");
S.concert = (r) => S.stage(r, { hero: `${disco(200, 90, 1.2)}<g transform="translate(110 196)"><path d="M0 0 V-80" stroke="#c9d3e6" stroke-width="5"/><path d="M-26 -80 H26 L16 -50 H-16Z" fill="#c2184f"/></g><g transform="translate(300 196)"><rect x="-8" y="-70" width="16" height="70" fill="#a0642f"/><path d="M0 -70 L-30 -118 L30 -118Z" fill="#161b2a"/><ellipse cx="0" cy="-30" rx="26" ry="20" fill="#d9a066"/></g>` });
S.bowling = (r) => [`<rect width="400" height="240" fill="#14082e"/>`, `<g fill="#00e5cc" opacity=".16"><path d="M140 0 L70 240 H210Z"/></g><g fill="#ff3d8b" opacity=".16"><path d="M270 0 L200 240 H340Z"/></g>`, floor(150, "#2a1a52"), `<path d="M60 240 L170 150 H230 L340 240Z" fill="#d9a066"/><g stroke="#8a5a2b" stroke-width="2" opacity=".6"><path d="M150 240 L184 150 M200 240 L200 150 M250 240 L216 150"/></g>`, pins(200, 168, 0.9), ball(160, 210, 16, "#ff3d8b"), ball(250, 214, 14, "#00e5cc"), `<g fill="#ffd24a">${[40, 100, 300, 360].map((x) => `<circle cx="${x}" cy="40" r="4"/>`).join("")}</g>`].join("");
S.escape = (r, o) => [`<rect width="400" height="240" fill="${o.bg || "#1b1740"}"/>`, `<g fill="#ffd47a" opacity=".12"><path d="M200 0 L110 240 H290Z"/></g>`, floor(180, "#120a24"), door(200, 190, 1.35), key(310, 120, 1.0), `<g fill="#ffd24a" opacity=".85">${[50, 90, 340, 370].map((x, i) => `<circle cx="${x}" cy="${60 + i * 14}" r="2.4"/>`).join("")}</g>`, o.clock ? `<g transform="translate(80 100)"><circle r="26" fill="#fff8e6"/><path d="M0 0 V-16 M0 0 L12 6" stroke="#161b2a" stroke-width="3"/></g>` : ""].join("");
S.axe = (r) => [`<rect width="400" height="240" fill="#2b1608"/>`, `<g fill="#ffd47a" opacity=".14"><path d="M200 0 L120 240 H280Z"/></g>`, `<rect y="170" width="400" height="70" fill="#6b3f1f"/>`, axe(200, 112, 1.5), `<g fill="#c9d3e6" transform="translate(90 190) rotate(20)"><rect x="-2" y="-40" width="4" height="40" fill="#8a5a2b"/><path d="M2 -40 Q18 -42 18 -28 Q16 -18 2 -20Z"/></g>`].join("");
S.tramp = (r) => [`<rect width="400" height="240" fill="#1b1a5a"/>`, `<g fill="#00e5cc" opacity=".16"><path d="M110 0 L40 240 H190Z"/></g><g fill="#ff3d8b" opacity=".16"><path d="M300 0 L230 240 H370Z"/></g>`, floor(180, "#10103a"), tramp(110, 200, 1.3), tramp(290, 204, 1.1), `<g fill="#ffd24a">${[200, 220, 60, 340].map((x, i) => `<circle cx="${x}" cy="${50 + i * 12}" r="3.4"/>`).join("")}</g>`, star(200, 70, 14)].join("");
S.aquarium = () => aquarium();
S.wax = (r) => [`<rect width="400" height="240" fill="#2a0f2a"/>`, spot(130), spot(270), `<rect y="196" width="400" height="44" fill="#4a1f3a"/><g fill="#ffd24a">${[80, 200, 320].map((x) => star(x, 214, 9)).join("")}</g>`, wax(130, 196, 1.5), wax(270, 196, 1.4), star(200, 60, 24), star(50, 50, 10), star(350, 50, 10)].join("");
S.wonder = (r) => [sky("dusk"), stars(r, 12), sea(184, "#12a6a0", "#0e8c87", "#2b86a8"), upsideBuilding(200, 150, 1.5), palm(60, 206, 1), palm(344, 206, 1)].join("");
S.baseball = (r) => [sky("sunset"), sun("sunset", 300, 70, 34), cloud(70, 56), `<path d="M0 150 H400 V240 H0Z" fill="#2f9e6b"/>`, diamond(), baseball(310, 70, 1.1), `<g fill="#fff8e6" opacity=".9">${[30, 60, 340, 370].map((x) => `<rect x="${x}" y="110" width="3" height="40"/>`).join("")}</g>`, bird(110, 54)].join("");
S.topgolf = (r) => [sky("neon"), stars(r, 8), `<rect y="150" width="400" height="90" fill="#12062b"/>`, `<g>${[70, 160, 250, 340].map((x) => `<rect x="${x - 30}" y="120" width="60" height="40" rx="4" fill="#1d1346"/><circle cx="${x}" cy="172" r="26" fill="#2f9e6b"/>`).join("")}</g>`, `<g>${[[110, 130, 40, "#ff3d8b"], [250, 150, 28, "#00e5cc"], [330, 126, 20, "#ffd24a"]].map(([x, y, r2, c]) => neonRing(x, y, r2, c, 5)).join("")}</g>`, ball(200, 60, 14, "#fff"), `<path d="M200 60 Q250 36 300 120" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="6 8" opacity=".7"/>`].join("");
S.luau = (r) => [sky("dusk"), stars(r, 10), sea(176), sand(200, "#1a1230", "#120a24"), torch(80, 210), torch(320, 210), `<g transform="translate(200 200)">${[-50, -30, -10, 10, 30, 50].map((a, i) => `<path d="M${a} 0 q${a * 0.6} -50 ${a * 0.2} -90" stroke="#1d7f5a" stroke-width="10" fill="none" stroke-linecap="round"/>`).join("")}<circle cx="0" cy="-30" r="12" fill="#ffd1a8"/><path d="M-14 -16 H14 L24 10 H-24Z" fill="#ff3d8b"/></g>`, palm(40, 210, 1.1), palm(364, 210, 1.1)].join("");
S.wildwest = (r) => [sky("sunset"), sun("sunset", 250, 150, 56), `<path d="M0 170 H400 V240 H0Z" fill="#d9a066"/>`, `<g fill="#b5533c"><path d="M0 170 V120 H30 V100 H70 V170Z M300 170 V110 H340 V90 H380 V170Z"/></g>`, `<g fill="#2a6f4a"><rect x="188" y="110" width="12" height="70" rx="6"/><rect x="170" y="130" width="10" height="26" rx="5"/><rect x="204" y="124" width="10" height="26" rx="5"/></g>`, cowboy(110, 160, 1.1), `<g transform="translate(300 196)"><path d="M0 0 L-6 -50 L6 -50Z" fill="#a0642f"/><path d="M-6 -50 L-30 -80 L30 -80 L6 -50Z" fill="#c9d3e6"/></g>`, `<g fill="#6b3f1f" opacity=".6"><circle cx="40" cy="214" r="10"/></g>`].join("");
S.mystery = (r) => [`<rect width="400" height="240" fill="#1a0f2a"/>`, `<circle cx="310" cy="64" r="28" fill="#ffd6f0" opacity=".85"/>`, stars(r, 12), `<g fill="#0a0612"><path d="M0 170 H400 V240 H0Z"/></g>`, `<g transform="translate(200 190)"><circle cx="0" cy="-90" r="18" fill="none" stroke="#ffd47a" stroke-width="9"/><path d="M12 -78 L32 -58" stroke="#ffd47a" stroke-width="9" stroke-linecap="round"/><path d="M-60 0 V-40 H60 V0Z" fill="#c2184f"/><rect x="-50" y="-52" width="100" height="12" fill="#8e0f3a"/><circle cx="0" cy="-58" r="3" fill="#fff"/></g>`, ghost(80, 160, 0.9), `<g fill="#c2184f" transform="translate(320 200)"><rect x="-4" y="-46" width="8" height="46"/><path d="M-20 -46 h40 l-6 -18 h-28z"/></g>`].join("");
S.medieval = (r) => [sky("dusk"), stars(r, 8), `<g fill="#3a2a4a"><path d="M0 170 H400 V240 H0Z"/></g>`, `<g fill="#59456b"><rect x="260" y="80" width="110" height="90"/><path d="M260 80 h110 v-12 h-12 v-12 h-12 v12 h-12 v-12 h-12 v12 h-12 v-12 h-12 v12 h-12 v-12 h-14z"/><rect x="304" y="120" width="22" height="50" rx="11" fill="#1a0f2a"/></g>`, `<g transform="translate(130 190)"><path d="M-50 0 V-30 Q-50 -56 -20 -56 H30 Q56 -56 56 -34 V0 H40 V-16 H10 V0 H-8 V-16 H-34 V0Z" fill="#e8d8b6"/><path d="M30 -56 q26 -22 38 6 l-14 4z" fill="#e8d8b6"/><rect x="-50" y="-58" width="70" height="16" fill="#c2184f"/></g>`, `<g transform="translate(290 200) rotate(14)"><rect x="-2" y="-120" width="4" height="124" fill="#8a5a2b"/><path d="M2 -120 l24 6 l-24 8z" fill="#ff3d8b"/><path d="M-3 -122 l3 -10 l3 10z" fill="#c9d3e6"/></g>`, `<g fill="#c9d3e6" transform="translate(70 120)"><path d="M0 0 L14 -40 L28 0 L14 30Z"/><rect x="12" y="-46" width="4" height="10" fill="#ffd47a"/></g>`].join("");
S.cirque = (r) => [curtain(), spot(200), `<g transform="translate(200 90)"><path d="M-120 -40 Q0 -90 120 -40" fill="none" stroke="#ffd24a" stroke-width="4"/><g transform="translate(40 -62) rotate(25)"><circle r="9" fill="#ffd1a8"/><path d="M0 8 L0 40 M0 16 L-22 6 M0 16 L22 30 M0 40 L-12 64 M0 40 L16 60" stroke="#00e5cc" stroke-width="7" stroke-linecap="round" fill="none"/></g></g>`, `<g transform="translate(200 196)"><path d="M-70 0 L-50 -60 H50 L70 0Z" fill="#ffd24a"/><path d="M-50 -60 L-40 -6 H-26 L-32 -60Z M-4 -60 L0 0 H14 L8 -60Z M40 -60 L36 -6 H50 L52 -60Z" fill="#ff3d8b"/></g>`, star(60, 50, 12), star(340, 54, 12)].join("");
S.magic = (r) => [curtain(), spot(200), `<g transform="translate(200 190)"><rect x="-44" y="-10" width="88" height="10" fill="#161b2a"/><path d="M-26 -10 V-60 H26 V-10Z" fill="#161b2a"/><rect x="-26" y="-34" width="52" height="8" fill="#c2184f"/><ellipse cx="0" cy="-60" rx="38" ry="8" fill="#161b2a"/></g>`, `<g transform="translate(200 90)"><path d="M0 0 L10 24 H34 L14 38 L22 62 L0 48 L-22 62 L-14 38 L-34 24 H-10Z" fill="#ffd24a"/></g>`, `<g fill="#fff">${[90, 130, 270, 310].map((x, i) => `<circle cx="${x}" cy="${70 + (i % 2) * 40}" r="3"/>`).join("")}</g>`, star(60, 60, 12), star(340, 60, 12)].join("");
S.tribute = (r) => [curtain(), spot(200), `<g transform="translate(200 200)"><path d="M-30 0 V-64 Q-30 -88 0 -88 Q30 -88 30 -64 V0Z" fill="#161b2a"/><circle cy="-104" r="14" fill="#ffd1a8"/><path d="M-14 -112 Q0 -132 16 -112 Q10 -120 0 -120 Q-10 -120 -14 -112Z" fill="#161b2a"/><rect x="-4" y="-74" width="8" height="60" fill="#ffd24a"/></g>`, star(80, 70, 14), star(320, 70, 14), star(60, 130, 8), star(340, 130, 8), `<g transform="translate(320 196)"><rect x="-3" y="-60" width="6" height="60" fill="#c9d3e6"/><circle cy="-70" r="14" fill="#c9d3e6"/></g>`].join("");
S.brewSunny = (r, o) => {
  const k = o.sky || pick(r, ["sunset", "day", "dawn"]);
  return [sky(k), sun(k, 310, 80, 38), cloud(84, 54), o.sea ? sea(150, "#12a6a0", "#0e8c87", "#2b86a8") : "", o.hammock ? palm(50, 214, 1.2) + palm(350, 214, 1.2) + hammock(200, 214, 1.0) + sand(206) : o.brick ? storefront(200, 210, 1.15) : o.pond ? `<path d="M0 172 Q100 156 200 172 T400 168 V240 H0Z" fill="#2b86a8"/><path d="M0 200 Q100 190 200 200 T400 198 V240 H0Z" fill="#1f7a52"/>` : o.dock ? pier(200, "#6b4a2f") : grass(194), o.sea && !o.hammock ? pier(206) : "", o.boat ? sail(100, 168, 0.9) : "", mug(o.hammock ? 200 : o.brick ? 340 : 230, o.hammock ? 214 : 214, 1.15), hops(o.brick ? 50 : 70, o.brick ? 150 : 140, 1.1), o.taps ? taps(200, 120) : "", o.coffee ? coffee(130, 214, 1.3) : "", o.jar ? jar(120, 214, 1.4) : "", bird(150, 50)].join("");
};
S.brewNight = (r, o) => [sky("night"), stars(r, 20), o.planet ? planet(90, 70, 24, "#7a5fc9") + planet(320, 56, 12, "#ff7a59") : sun("night", 310, 70, 26), `<path d="M0 190 Q100 170 200 190 T400 182 V240 H0Z" fill="#0f1730"/>`, mug(200, 214, 1.25), hops(310, 150, 1.0), star(60, 60, 8), star(350, 120, 6)].join("");
S.wine = (r, o) => {
  const k = o.sky || pick(r, ["dusk", "sunset"]);
  return [sky(k), stars(r, 8), sun(k, 200, 118, 56), `<g clip-path="url(#sunclip)"></g>`, o.bar ? bar() + stringLights() : vineRows(172), glass(o.bar ? 200 : 200, o.bar ? 200 : 214, 1.5), o.grapes ? grapes(80, 150, 1.1) : "", o.glass2 ? glass(310, 214, 1.0, "#f2c94c") : "", bird(70, 40)].join("");
};
S.pizzaPond = (r) => S.brewSunny(r, { pond: true });

// ---------- theme detection ----------
const RULES = [
  [/alleyoops/, "putting"],
  [/popstroke|modern putting|turf/, "putting"],
  [/od arcade|oa arcade|arcade and lounge/, "arcade"],
  [/jurassic|dinosaur|paleontolog|ice age/, "dino"],
  [/mayday|plane crash|cargo plane/, "plane"],
  [/atlantis|minotaur/, "atlantis"],
  [/dragon|asian legends|pagoda/, "dragon"],
  [/cancun|mayan|pyramid/, "pyramid"],
  [/ghosts of georgetown|lantern/, "lanternTour"],
  [/haunted|spooky/, "haunted"],
  [/neon|glow|crazy golf/, "neon"],
  [/gold mine|gold rush|mining|gem min|treasure hunt|lost mine|lost treasure|lost mine/, "goldmine"],
  [/safari|elephant|giraffe|jungle safari/, "safari"],
  [/t\.i\.g\.e\.r\.s|big-cat|big cat/, "cat"],
  [/captain hook|neverland|peter pan/, "pirate:hook"],
  [/spy glass/, "pirate:spy"],
  [/treasure island/, "pirate:chest"],
  [/shipwreck/, "pirate:wreck"],
  [/mutiny|pirate|buccaneer|black pearl|captain myrtle|nautical|sea captain|swashbuck/, "pirate"],
  [/volcano|molten|rumble|tribal|tiki/, "tropical:volcano"],
  [/gilligan|castaway|deserted island/, "tropical:hut"],
  [/aloha falls|waterfall/, "tropical:falls"],
  [/surf the earth|surf shop/, "kayak"],
  [/jungle lagoon|jungle/, "jungle"],
  [/runaway bay|jamaica/, "tropical:jamaica"],
  [/hawaiian|aloha|island|lagoon|tropical/, "tropical"],
  [/jet ski|watersports|boat rides|banana boat|marina/, "jetski"],
  [/racing|go-kart|kart|speed|grand prix/, "kart"],
  [/ferris|skywheel|observation wheel/, "wheel"],
  [/amusement|family kingdom|pavilion/, "wheel"],
  [/water park|waves|splashes|slide/, "wavepark"],
  [/zipline|ropes|aerial|soar/, "zipline"],
  [/parasail/, "parasail"],
  [/dolphin|sunset sail|sightseeing/, "dolphin"],
  [/kayak|paddleboard|paddle/, "kayak"],
  [/alligator|gator|reptile/, "gator"],
  [/state park/, "statepark"],
  [/brookgreen|sculpture|botanical/, "gardens"],
  [/hobcaw|reserve|nature/, "kayak:marsh"],
  [/marshwalk|marsh walk/, "boardwalk:marsh"],
  [/harborwalk|harbor/, "harbor"],
  [/boardwalk/, "boardwalk"],
  [/atalaya|castle/, "castle"],
  [/plantation|hopsewee/, "plantation"],
  [/boat tour|lowcountry tours|winyah bay.*tour|shell island/, "boatTour"],
  [/aquarium/, "aquarium"],
  [/wax/, "wax"],
  [/wonderworks|upside-down|upside down/, "wonder"],
  [/escape|room escape|riddles|captive|breakout|break out|escapology/, "escape"],
  [/maritime/, "museum:ship"],
  [/museum|kaminski|rice museum|county museum/, "museum"],
  [/bowling|duckpin|pins|billiards/, "bowling"],
  [/axe/, "axe"],
  [/trampoline/, "tramp"],
  [/aquarium/, "aquarium"],
  [/wax/, "wax"],
  [/wonderworks|upside-down|upside down/, "wonder"],
  [/escape|room escape|riddles|captive|breakout|break out|escapology/, "escape"],
  [/topgolf|hitting bays/, "topgolf"],
  [/pelicans|baseball/, "baseball"],
  [/luau|polynesian|hula/, "luau"],
  [/wild west|cowboy/, "wildwest"],
  [/murder mystery|mystery/, "mystery"],
  [/medieval|jousting/, "medieval"],
  [/pirates voyage|dinner show/, "pirate:dinner"],
  [/cirque|acrobat|adrenaline/, "cirque"],
  [/magic|wonders|illusion/, "magic"],
  [/tribute|legends in concert|motown|opry|alabama theatre|theatre|theater/, "tribute"],
  [/comedy|improv/, "comedy"],
  [/honky|country|bowery|bourbon cowboy/, "honky"],
  [/beach club|shag|duck's|fat harold/, "beachclub"],
  [/pier/, "pier"],
  [/rooftop|tin roof|roof/, "rooftop"],
  [/dead dog|saloon|bowery|honky/, "honky"],
  [/beach bar|ocean annie|se.or frogs|tiki bar|ducks|harold/, "beachclub"],
  [/house of blues|concert hall|live music/, "stage"],
  [/galleon|dance club|3001|nightlife|club|dance/, "disco"],
  [/star wars/, "brew:planet"],
  [/hammock/, "brew:hammock"],
  [/five-and-dime|downtown taproom|brick/, "brew:brick"],
  [/coffee/, "brew:coffee"],
  [/moonshine|ole smoky|yee-haw/, "brew:jar"],
  [/ocean views|40 carolina taps|taps/, "brew:taps"],
  [/pond|carolina forest/, "brew:pond"],
  [/winyah|waterfront|bay views|views of/, "brew:dock"],
  [/vineyard|winery|wine bar|tasting room|wine/, "wine"],
  [/brew|taproom|beer|hops|pub/, "brew"],
];

function detect(item, cat) {
  const head = `${item.name} ${item.subtitle || ""}`.toLowerCase();
  const all = `${head} ${(item.description || "").toLowerCase()}`;
  for (const [re, theme] of RULES) if (re.test(head)) return theme;
  for (const [re, theme] of RULES) if (re.test(all)) return theme;
  // category fallbacks
  return (
    { "mini-golf": "putting", "breweries-wineries": "brew", nightlife: "concert", "thrill-action": "wheel", "family-indoor": "escape", "nature-eco": "statepark", "live-shows": "tribute", "historic-cultural": "museum", fishing: "pier", golf: "golf", beaches: "beachtown" }[cat] || "putting"
  );
}

S.putting = (r, o) => {
  const k = o.sky || pick(r, ["sunset", "day", "dawn"]);
  return [sky(k), sun(k, 310, 76, 36), cloud(84, 52), hills(156, "#2e8f6b", 0.5), grass(176, "#35b36f", "#2a9a5c"), `<ellipse cx="220" cy="204" rx="86" ry="20" fill="#41c27a"/><ellipse cx="220" cy="204" rx="86" ry="20" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/><ellipse cx="260" cy="206" rx="9" ry="4" fill="#0b3a53"/>`, flag(260, 206, "#ff3d8b"), ball(180, 206, 9, "#fff"), `<g transform="translate(100 214) rotate(-30)"><rect x="-2" y="-60" width="4" height="60" fill="#c9d3e6"/><rect x="-14" y="-4" width="28" height="8" rx="3" fill="#ff3d8b"/></g>`, palm(60, 190, 1.0), palm(350, 188, 0.9), bird(250, 50)].join("");
};

function scene(theme, r) {
  const [t, v] = theme.split(":");
  const o = {};
  switch (t) {
    case "pirate":
      if (v === "dinner") return S.dinner(r, { sky: "dusk", hero: sea(160) + ship(200, 156, 1.0, "#f7e9d0", "#8a5a2b", "#ff3d8b", 2) + `<g transform="translate(330 186)"><ellipse rx="26" ry="16" fill="#8d9bb0"/><circle cx="-22" cy="-6" r="6" fill="#8d9bb0"/></g>` });
      if (v === "hook") Object.assign(o, { hook: true, palm: true, sky: "dusk" });
      if (v === "spy") Object.assign(o, { spy: true, sky: "sunset" });
      if (v === "chest") Object.assign(o, { chest: true, palm: true, sky: "day", dark: false });
      if (v === "wreck") Object.assign(o, { ship2: false, palm: true, sky: "dusk" });
      return S.pirate(r, o);
    case "tropical":
      if (v === "jamaica") Object.assign(o, { falls: true, light: true });
      if (v === "volcano") Object.assign(o, { volcano: true, tiki: true });
      if (v === "hut") Object.assign(o, { hut: true });
      if (v === "falls") Object.assign(o, { falls: true });
      return S.tropical(r, o);
    case "kayak":
      return S.kayak(r, v === "marsh" ? { marsh: true, sky: "dawn" } : {});
    case "boardwalk":
      return S.boardwalk(r, v === "marsh" ? { marsh: true, sky: "dusk" } : {});
    case "museum":
      return S.museum(r, v === "ship" ? { ship: true } : {});
    case "brew":
      if (v === "planet") return S.brewNight(r, { planet: true });
      if (v === "hammock") return S.brewSunny(r, { hammock: true });
      if (v === "brick") return S.brewSunny(r, { brick: true });
      if (v === "coffee") return S.brewSunny(r, { coffee: true });
      if (v === "jar") return S.brewSunny(r, { jar: true, dock: true });
      if (v === "taps") return S.brewSunny(r, { sea: true, taps: true });
      if (v === "pond") return S.brewSunny(r, { pond: true });
      if (v === "dock") return S.brewSunny(r, { sea: true, boat: true, dock: true });
      return S.brewSunny(r, {});
    case "wine":
      return S.wine(r, {});
    case "stage": return S.stage(r, { hero: `${disco(250, 84, 1.2)}<g transform="translate(130 196)"><rect x="-8" y="-70" width="16" height="70" fill="#a0642f"/><path d="M0 -70 L-30 -118 L30 -118Z" fill="#161b2a"/><ellipse cx="0" cy="-30" rx="26" ry="20" fill="#d9a066"/></g>${mic(310, 196, 0.9)}` });
    case "wheel": return S.wheel(r, {});
    case "dolphin": return S.dolphin(r, {});
    case "boatTour": return S.boatTour(r, {});
    case "luau": return S.luau(r, {});
    default:
      return (S[t] || S.putting)(r, {});
  }
}


// ---------- variety: same idea, different look, chosen by the listing's name ----------
const SK = ["sunset", "dawn", "day", "dusk"];
const _escape = S.escape;
S.escape = (r, o) => {
  const bgs = ["#1b1740", "#2a0f2a", "#0f2a3a", "#2a1a0f", "#12302a", "#2a1030"];
  const bg = pick(r, bgs);
  const props = [
    `<g transform="translate(80 100)"><circle r="26" fill="#fff8e6"/><path d="M0 0 V-16 M0 0 L12 6" stroke="#161b2a" stroke-width="3"/></g>`,
    `<g transform="translate(78 120)"><circle cx="0" cy="-8" r="18" fill="none" stroke="#ffd47a" stroke-width="8"/><rect x="-22" y="0" width="44" height="34" rx="5" fill="#ffd47a"/><circle cy="14" r="4" fill="#161b2a"/></g>`,
    `<g transform="translate(78 110) rotate(-30)"><circle r="18" fill="none" stroke="#ffd47a" stroke-width="7"/><rect x="14" y="-3" width="34" height="7" fill="#ffd47a"/></g>`,
    `<g transform="translate(78 100)" fill="#f4f8ff"><path d="M-20 10 V-6 Q-20 -30 0 -30 Q20 -30 20 -6 V10 L10 18 H-10Z"/><circle cx="-8" cy="-8" r="5" fill="#161b2a"/><circle cx="8" cy="-8" r="5" fill="#161b2a"/></g>`,
  ];
  return [`<rect width="400" height="240" fill="${bg}"/>`, `<g fill="${pick(r, ["#ffd47a", "#ff3d8b", "#00e5cc"])}" opacity=".13"><path d="M200 0 L110 240 H290Z"/></g>`, floor(180, "#0c0818"), door(200, 190, 1.35), key(pick(r, [310, 90]) , 120, 1.0), pick(r, props), `<g fill="#ffd24a" opacity=".85">${[50, 90, 340, 370].map((x, i) => `<circle cx="${x}" cy="${40 + i * 14}" r="2.4"/>`).join("")}</g>`].join("");
};
const _museum = S.museum;
S.museum = (r, o) => {
  const k = o.sky || pick(r, SK);
  const props = [ship(330, 200, 0.4, "#f7e9d0", "#8a5a2b"), `<g transform="translate(60 204)"><circle cx="-8" cy="6" r="9" fill="#161b2a"/><path d="M-14 0 L40 -16 L44 -8 L-6 10Z" fill="#3a4a5a"/></g>`, flag(340, 214, "#ff3d8b"), `<g transform="translate(340 214)">${[0, 1, 2].map((i) => `<path d="M${i * 12 - 8} 0 q${-3} -26 ${i * 4 - 2} -34 q6 14 ${6 - i * 2} 34z" fill="#e8c95a"/>`).join("")}</g>`, `<g transform="translate(342 206)"><circle cy="-6" r="10" fill="none" stroke="#8a5a2b" stroke-width="3"/><path d="M0 -16 V4 M-10 -6 H10" stroke="#8a5a2b" stroke-width="3"/></g>`];
  return [sky(k), sun(k, pick(r, [320, 90]), 66, 30), cloud(pick(r, [70, 250]), 56), `<rect x="60" y="100" width="280" height="14" fill="#e8d8b6"/><path d="M50 100 L200 52 L350 100Z" fill="${pick(r, ["#cdbb94", "#c7727e", "#8fb0c8"])}"/><g>${[84, 128, 172, 216, 260, 304].map((x) => `<rect x="${x}" y="114" width="18" height="70" fill="#f4ead2"/>`).join("")}</g><rect x="50" y="184" width="300" height="10" fill="#e8d8b6"/><rect x="40" y="194" width="320" height="10" fill="#cdbb94"/>`, o.ship ? ship(330, 196, 0.35, "#f7e9d0", "#8a5a2b") : pick(r, props), grass(206, "#4fae6b", "#2f8f55"), oak(32, 214, 0.7), bird(250, 44)].join("");
};
S.jungle = (r) => [sky("day"), `<g fill="#1d6b45">${[20, 70, 330, 380].map((x, i) => `<ellipse cx="${x}" cy="${20 + i * 6}" rx="46" ry="22"/>`).join("")}</g>`, `<path d="M0 140 q50 -50 110 -10 q70 -50 130 -4 q70 -40 160 0 V240 H0Z" fill="#2a8f5a" opacity=".7"/>`, `<rect y="176" width="400" height="64" fill="#2f7d6b"/>`, palm(60, 200, 1.4, "#1d5c3f"), palm(340, 204, 1.3, "#1d5c3f"), `<g transform="translate(210 120)"><path d="M0 0 q-24 6 -30 34 q22 0 30 -22z" fill="#2fbf6a"/><ellipse cx="0" cy="0" rx="14" ry="20" fill="#161b2a"/><path d="M10 -6 q30 -2 34 12 q-20 8 -34 -2z" fill="#ffb627"/><circle cx="2" cy="-10" r="4" fill="#fff"/><rect x="-4" y="18" width="6" height="30" fill="#8a5a2b"/></g>`, `<path d="M0 60 q60 30 130 10 M270 40 q60 30 130 10" stroke="#1d5c3f" stroke-width="5" fill="none"/>`, `<g fill="#ffb627"><circle cx="120" cy="196" r="6"/></g>`].join("");
const _dolphin = S.dolphin;
S.dolphin = (r, o) => {
  const k = pick(r, SK);
  const x = 150 + ((r() * 80) | 0), sc = 1.2 + r() * 0.4, flip = r() > 0.5;
  return [sky(k), sun(k, pick(r, [320, 90]), 80, 38), cloud(pick(r, [80, 260]), 50), sea(150, "#12a6a0", "#0e8c87", "#2b86a8"), `<g ${flip ? `transform="translate(400 0) scale(-1 1)"` : ""}>${dolphin(x, 172, sc)}<path d="M${x - 60} 180 q70 -50 140 0" fill="none" stroke="#fff" stroke-width="4" opacity=".6"/>${r() > 0.5 ? dolphin(x + 120, 200, 0.7, "#9be0f0") : ""}</g>`, r() > 0.5 ? boat(330, 168, 0.55) : sail(330, 164, 0.8), bird(80, 70)].join("");
};
const _kart = S.kart;
S.kart = (r, o) => _kart(r, { sky: pick(r, ["sunset", "dusk", "dawn", "neon"]), body: pick(r, ["#00e5cc", "#ff3d8b", "#ffb627", "#7a5fc9"]) });
const _jet = S.jetski;
S.jetski = (r, o) => _jet(r, { sky: pick(r, SK), dock: r() > 0.5 });
const _wheel = S.wheel;
const _tropical = S.tropical;
S.tropical = (r, o) => {
  if (!Object.keys(o).length) { const v = pick(r, [{ hut: true }, { falls: true }, { volcano: true }, { tiki: true, hut: true }, {}]); return _tropical(r, { ...v, sky: pick(r, SK) }); }
  return _tropical(r, o) + (o.light ? lighthouse(60, 204, 0.8) : "");
};
const _putting = S.putting;
S.putting = (r, o) => {
  const extra = pick(r, [
    `<g transform="translate(80 190)"><rect x="-26" y="-34" width="52" height="34" fill="#fff8e6"/><path d="M-32 -34 L0 -62 L32 -34Z" fill="#e0527a"/><g stroke="#fff8e6" stroke-width="4"><path d="M0 -50 L-44 -90 M0 -50 L44 -10 M0 -50 L44 -90 M0 -50 L-44 -10"/></g></g>`,
    lighthouse(80, 192, 0.8),
    castle(70, 196, 0.6),
    `<g transform="translate(70 196)"><path d="M-6 0 V-30 Q-6 -50 6 -50 Q18 -50 18 -30 V0Z" fill="#2a6f4a"/></g>`,
  ]);
  const k = pick(r, SK);
  return [sky(k), sun(k, pick(r, [310, 110]), 76, 36), cloud(pick(r, [84, 260]), 52), hills(156, "#2e8f6b", 0.5), grass(176, "#35b36f", "#2a9a5c"), `<ellipse cx="240" cy="204" rx="86" ry="20" fill="#41c27a"/><ellipse cx="240" cy="204" rx="86" ry="20" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/><ellipse cx="280" cy="206" rx="9" ry="4" fill="#0b3a53"/>`, extra, flag(280, 206, "#ff3d8b"), ball(200, 206, 9, "#fff"), palm(350, 188, 0.9), bird(250, 50)].join("");
};
const _theaterHero = [
  () => `<g transform="translate(200 200)"><path d="M-30 0 V-64 Q-30 -88 0 -88 Q30 -88 30 -64 V0Z" fill="#161b2a"/><circle cy="-104" r="14" fill="#ffd1a8"/><rect x="-4" y="-74" width="8" height="60" fill="#ffd24a"/></g>${mic(300, 196, 0.7)}`,
  () => `<g transform="translate(110 150)">${mask(0, 0, 1.3)}</g><g transform="translate(290 150)">${mask(0, 0, 1.3)}</g>${star(200, 70, 20)}`,
  () => `<g transform="translate(200 196)"><rect x="-80" y="-40" width="160" height="40" fill="#161b2a"/>${Array.from({ length: 10 }, (_, i) => `<rect x="${-76 + i * 16}" y="-38" width="12" height="30" fill="#fff8e6"/>`).join("")}</g>${star(200, 70, 20)}`,
  () => `<g transform="translate(200 190)"><path d="M-60 0 Q-60 -80 0 -80 Q60 -80 60 0Z" fill="#a0642f"/><circle cy="-40" r="14" fill="#161b2a"/><rect x="40" y="-120" width="10" height="80" fill="#8a5a2b"/></g>`,
];
S.tribute = (r) => [curtain(), spot(200), pick(r, _theaterHero)(), star(80, 70, 14), star(320, 70, 14), star(60, 130, 8), star(340, 130, 8)].join("");
S.concert = (r) => {
  const v = pick(r, ["stage", "cocktail", "club", "rooftop"]);
  if (v === "rooftop") return S.rooftop(r);
  if (v === "club") return S.beachclub(r, { sky: pick(r, ["dusk", "night"]) });
  if (v === "cocktail") return [sky("neon"), stars(r, 12), `<circle cx="310" cy="64" r="30" fill="#ffd6f0" opacity=".9"/>`, `<rect y="176" width="400" height="64" fill="#12062b"/>`, `<g transform="translate(200 190)"><path d="M-60 -110 H60 L0 -40Z" fill="none" stroke="#ff3d8b" stroke-width="8" stroke-linejoin="round"/><path d="M0 -40 V0 M-30 0 H30" stroke="#ff3d8b" stroke-width="8" stroke-linecap="round"/><circle cx="26" cy="-100" r="10" fill="#00e5cc"/></g>`, palm(70, 190, 1.2, "#0f6b5a"), palm(340, 190, 1.0, "#0f6b5a")].join("");
  return S.stage(r, { hero: `${disco(pick(r, [200, 120]), 90, 1.2)}<g transform="translate(300 196)"><rect x="-8" y="-70" width="16" height="70" fill="#a0642f"/><path d="M0 -70 L-30 -118 L30 -118Z" fill="#161b2a"/><ellipse cx="0" cy="-30" rx="26" ry="20" fill="#d9a066"/></g>${mic(110, 196, 0.8)}` });
};
S.disco = (r) => S.stage(r, { hero: `${disco(200, 84, 1.5)}<g transform="translate(120 196)"><circle cy="-70" r="10" fill="#ffd1a8"/><path d="M-8 -60 V-24 M-8 -50 L-28 -64 M-8 -50 L16 -70 M-8 -24 L-22 0 M-8 -24 L6 0" stroke="#ff3d8b" stroke-width="7" stroke-linecap="round" fill="none"/></g><g transform="translate(290 196)"><circle cy="-66" r="10" fill="#ffd1a8"/><path d="M0 -56 V-22 M0 -46 L-20 -34 M0 -46 L22 -64 M0 -22 L-12 0 M0 -22 L14 0" stroke="#00e5cc" stroke-width="7" stroke-linecap="round" fill="none"/></g>` });
S.arcade = (r) => [`<rect width="400" height="240" fill="#14082e"/>`, `<g fill="#00e5cc" opacity=".16"><path d="M100 0 L30 240 H170Z"/></g><g fill="#ff3d8b" opacity=".16"><path d="M300 0 L230 240 H370Z"/></g>`, floor(180, "#10103a"), `<g transform="translate(200 196)"><rect x="-44" y="-130" width="88" height="130" rx="8" fill="#2a1a52"/><rect x="-34" y="-120" width="68" height="56" fill="#0b0f14"/><g fill="#00e5cc">${[[-20, -104], [0, -104], [20, -104], [-10, -92], [10, -92]].map(([x, y]) => `<rect x="${x - 4}" y="${y}" width="8" height="8"/>`).join("")}</g><circle cx="-14" cy="-40" r="8" fill="#ff3d8b"/><rect x="-16" y="-34" width="4" height="14" fill="#c9d3e6"/><circle cx="16" cy="-36" r="5" fill="#ffd24a"/><circle cx="30" cy="-36" r="5" fill="#00e5cc"/></g>`, star(90, 70, 12), star(320, 80, 10)].join("");

// ---------- one-of-a-kind scenes ----------
// Listings that would otherwise share a look get a scene drawn just for them.
// Palette rule: warm Myrtle Beach vacation tones (sunset, golden hour, dawn, coral by day;
// warm dusk, plum and neon by night), teal water, sand, palms and coral-pink accents.
const T = (x, y, s, inner) => `<g transform="translate(${x} ${y}) scale(${s})">${inner}</g>`;
const bottle = (x, y, s = 1, c = "#6e1430", label = "#fff8e6") =>
  T(x, y, s, `<rect x="-15" y="-74" width="30" height="74" rx="7" fill="${c}"/><path d="M-15 -66 Q-15 -82 -6 -86 V-104 H6 V-86 Q15 -82 15 -66Z" fill="${c}"/><rect x="-7" y="-110" width="14" height="8" fill="#ffd24a"/><rect x="-13" y="-48" width="26" height="24" rx="2" fill="${label}"/><rect x="-8" y="-40" width="16" height="3" fill="${c}"/>`);
const barrel = (x, y, s = 1) =>
  T(x, y, s, `<path d="M-30 -70 Q-40 -35 -30 0 H30 Q40 -35 30 -70Z" fill="#a0642f"/><ellipse cy="-70" rx="30" ry="8" fill="#c48448"/><path d="M-36 -52 H36 M-38 -18 H38" stroke="#5a3a1f" stroke-width="5"/><circle cy="-35" r="6" fill="#5a3a1f"/>`);
const can = (x, y, s = 1, c = "#00b3a6", stripe = "#ffd24a") =>
  T(x, y, s, `<rect x="-24" y="-80" width="48" height="80" rx="6" fill="${c}"/><ellipse cy="-80" rx="24" ry="6" fill="#d7dde6"/><path d="M-24 -40 Q-8 -52 8 -40 T24 -40 V-26 Q8 -38 -8 -26 T-24 -26Z" fill="${stripe}"/><circle cx="0" cy="-60" r="8" fill="#fff8e6"/>`);
const growler = (x, y, s = 1) =>
  T(x, y, s, `<path d="M-30 0 V-56 Q-30 -76 -12 -82 V-100 H12 V-82 Q30 -76 30 -56 V0Z" fill="#b4621c"/><path d="M12 -88 Q34 -88 34 -66" stroke="#b4621c" stroke-width="7" fill="none"/><rect x="-14" y="-106" width="28" height="8" rx="3" fill="#161b2a"/><rect x="-22" y="-50" width="44" height="26" rx="4" fill="#fff8e6"/><path d="M-12 -38 q6 -8 12 0 t12 0" stroke="#ff3d8b" stroke-width="3" fill="none"/>`);
const bigFish = (x, y, s = 1, c = "#3d4a5c", belly = "#9aa6b8") =>
  T(x, y, s, `<path d="M-70 0 Q-30 -40 30 -22 Q50 -16 60 0 Q50 16 30 22 Q-30 40 -70 0Z" fill="${c}"/><path d="M-30 6 Q10 24 50 6 Q30 22 -30 14Z" fill="${belly}"/><path d="M-70 0 L-100 -26 L-94 0 L-100 26Z" fill="${c}"/><path d="M-10 -30 L10 -48 L20 -24Z" fill="${c}"/><circle cx="40" cy="-6" r="5" fill="#fff"/><circle cx="41" cy="-6" r="2.4" fill="#161b2a"/><path d="M56 6 q6 8 2 16 M52 8 q2 10 -4 16" stroke="${belly}" stroke-width="2" fill="none"/>`);
const waterfall = (x, y, w = 40, h = 90) =>
  `<rect x="${x - w / 2}" y="${y - h}" width="${w}" height="${h}" fill="#bff0ea"/><g stroke="#fff" stroke-width="3" opacity=".8">${[0.2, 0.5, 0.8].map((f) => `<path d="M${x - w / 2 + w * f} ${y - h + 6} V${y - 8}"/>`).join("")}</g><ellipse cx="${x}" cy="${y}" rx="${w * 0.9}" ry="8" fill="#fff" opacity=".7"/>`;
const rock = (x, y, w = 90, h = 100, c = "#8a6a4a") => `<path d="M${x - w / 2} ${y} L${x - w / 3} ${y - h} L${x + w / 3} ${y - h * 0.9} L${x + w / 2} ${y}Z" fill="${c}"/>`;
const parrot = (x, y, s = 1, c = "#ff3d3d") =>
  T(x, y, s, `<path d="M0 0 Q-16 -30 0 -50 Q18 -40 14 -10Z" fill="${c}"/><circle cx="4" cy="-44" r="10" fill="${c}"/><path d="M12 -46 l10 4 l-10 6z" fill="#ffd24a"/><circle cx="6" cy="-46" r="2" fill="#161b2a"/><path d="M-2 -20 Q-26 -10 -20 10 Q-6 0 0 -10Z" fill="#00b3a6"/><path d="M2 0 L-4 26 L8 26Z" fill="#2456b8"/><rect x="-24" y="2" width="48" height="5" rx="2" fill="#8a5a2b"/>`);
const tikiStatue = (x, y, s = 1, c = "#a0642f") =>
  T(x, y, s, `<rect x="-24" y="-110" width="48" height="110" rx="6" fill="${c}"/><rect x="-30" y="-118" width="60" height="14" rx="4" fill="#7a4a22"/><path d="M-16 -88 h12 v8 h-12z M4 -88 h12 v8 h-12z" fill="#161b2a"/><path d="M-14 -60 H14 V-44 H-14Z" fill="#161b2a"/><path d="M-10 -56 v8 M0 -56 v8 M10 -56 v8" stroke="#fff8e6" stroke-width="3"/><path d="M-24 -28 H24" stroke="#7a4a22" stroke-width="5"/>`);
const mineCart = (x, y, s = 1) =>
  T(x, y, s, `<path d="M-40 -40 H40 L32 0 H-32Z" fill="#7a4a22"/><path d="M-40 -40 H40" stroke="#5a3a1f" stroke-width="5"/><g fill="#ffd24a"><circle cx="-18" cy="-46" r="9"/><circle cx="0" cy="-50" r="10"/><circle cx="18" cy="-46" r="8"/></g><circle cx="-20" cy="4" r="8" fill="#161b2a"/><circle cx="20" cy="4" r="8" fill="#161b2a"/>`);
const track = (y) => `<path d="M0 ${y} H400" stroke="#5a3a1f" stroke-width="5"/><g stroke="#7a4a22" stroke-width="6">${Array.from({ length: 14 }, (_, i) => `<path d="M${i * 30 + 6} ${y - 2} v8"/>`).join("")}</g>`;
const gems = (x, y, s = 1) =>
  T(x, y, s, `<path d="M-30 0 L-22 -18 L-12 0Z" fill="#00e5cc"/><path d="M-8 0 L4 -28 L16 0Z" fill="#ff3d8b"/><path d="M18 0 L26 -14 L34 0Z" fill="#7a2fc2"/><path d="M-20 0 L-14 -10 L-6 0Z" fill="#ffd24a"/>`);
const sluice = (x, y, s = 1) =>
  T(x, y, s, `<path d="M-80 -40 L60 -10 V0 L-80 -30Z" fill="#a0642f"/><path d="M-78 -36 L58 -8" stroke="#7fd6ea" stroke-width="6"/><rect x="-76" y="-30" width="6" height="30" fill="#7a4a22"/><rect x="40" y="-12" width="6" height="12" fill="#7a4a22"/>`);
const carousel = (x, y, s = 1) =>
  T(x, y, s, `<path d="M-80 -90 L0 -130 L80 -90Z" fill="#ff3d8b"/><path d="M-80 -90 L-40 -90 L0 -130Z" fill="#fff8e6" opacity=".8"/><path d="M0 -130 L40 -90 L80 -90Z" fill="#fff8e6" opacity=".35"/><rect x="-80" y="-92" width="160" height="10" fill="#ffd24a"/><rect x="-80" y="-6" width="160" height="10" rx="3" fill="#ffd24a"/>${[-56, -18, 20, 58].map((px, i) => `<rect x="${px - 1.5}" y="-82" width="3" height="76" fill="#d7dde6"/><path d="M${px - 16} ${-34 - (i % 2) * 10} q10 -14 26 -6 l6 -8 l4 10 q-6 14 -26 12z" fill="${["#fff8e6", "#00b3a6", "#ffb627", "#fff8e6"][i]}"/>`).join("")}<circle cy="-138" r="5" fill="#ffd24a"/>`);
const woodCoaster = (y = 196) =>
  `<g stroke="#a0642f" stroke-width="3" fill="none"><path d="M0 ${y - 70} Q60 ${y - 150} 120 ${y - 70} T240 ${y - 100} T400 ${y - 60}"/>${Array.from({ length: 20 }, (_, i) => `<path d="M${i * 20 + 4} ${y} V${y - 60}"/>`).join("")}<path d="M0 ${y - 30} H400 M0 ${y - 56} H400" opacity=".7"/></g><path d="M0 ${y - 70} Q60 ${y - 150} 120 ${y - 70} T240 ${y - 100} T400 ${y - 60}" stroke="#ff3d8b" stroke-width="6" fill="none"/><g transform="translate(78 ${y - 128}) rotate(-28)"><rect x="-22" y="-12" width="44" height="14" rx="4" fill="#ffd24a"/><circle cx="-10" cy="-16" r="5" fill="#fff8e6"/><circle cx="10" cy="-16" r="5" fill="#fff8e6"/></g>`;
const helmet = (x, y, s = 1, c = "#ff3d8b") =>
  T(x, y, s, `<path d="M-46 0 Q-50 -64 0 -66 Q48 -64 46 -12 H6 V0Z" fill="${c}"/><path d="M6 -40 H46 V-14 H6Z" fill="#161b2a"/><path d="M-30 -50 Q0 -62 30 -50" stroke="#fff8e6" stroke-width="6" fill="none"/>`);
const checker = (x, y, w = 60, h = 40, n = 6) =>
  `<g transform="translate(${x} ${y})"><rect width="${w}" height="${h}" fill="#fff"/>${Array.from({ length: n * 4 }, (_, i) => { const cx = i % n; const cy = Math.floor(i / n); return (cx + cy) % 2 ? `<rect x="${(cx * w) / n}" y="${(cy * h) / 4}" width="${w / n}" height="${h / 4}" fill="#161b2a"/>` : ""; }).join("")}</g>`;
const skate = (x, y, s = 1, c = "#ff3d8b") =>
  T(x, y, s, `<path d="M-36 -10 V-62 H-4 V-34 Q30 -34 36 -16 V-10Z" fill="${c}"/><path d="M-30 -56 H-10 M-30 -48 H-10 M-30 -40 H-10" stroke="#fff8e6" stroke-width="3"/><rect x="-40" y="-12" width="80" height="6" rx="3" fill="#d7dde6"/><circle cx="-26" cy="2" r="8" fill="#ffd24a"/><circle cx="26" cy="2" r="8" fill="#ffd24a"/>`);
const ropeNet = (x, y, w = 200, h = 80) =>
  `<g stroke="#e7c98f" stroke-width="2.5">${Array.from({ length: 9 }, (_, i) => `<path d="M${x + (i * w) / 8} ${y} L${x + (i * w) / 8 + 10} ${y + h}"/>`).join("")}${Array.from({ length: 5 }, (_, i) => `<path d="M${x} ${y + (i * h) / 4} H${x + w}"/>`).join("")}</g><rect x="${x - 6}" y="${y - 10}" width="8" height="${h + 60}" fill="#8a5a2b"/><rect x="${x + w}" y="${y - 10}" width="8" height="${h + 60}" fill="#8a5a2b"/>`;
const bananaBoat = (x, y, s = 1) =>
  T(x, y, s, `<path d="M-80 0 Q-10 26 80 -10 Q86 4 70 10 Q-10 36 -84 8Z" fill="#ffd24a"/><path d="M-80 -2 Q-10 22 80 -12" stroke="#e8a80c" stroke-width="4" fill="none"/>${[-50, -16, 18, 50].map((px) => `<circle cx="${px}" cy="-18" r="7" fill="#ffd1a8"/><rect x="${px - 6}" y="-12" width="12" height="16" rx="4" fill="${px % 2 ? "#ff3d8b" : "#00b3a6"}"/>`).join("")}`);
const speedboat = (x, y, s = 1, c = "#ff3d8b") =>
  T(x, y, s, `<path d="M-90 -10 H70 Q96 -8 100 -20 L90 6 Q40 14 -84 10Z" fill="#fff8e6"/><path d="M-88 0 H96" stroke="${c}" stroke-width="7"/><path d="M-30 -10 L-10 -34 H30 L40 -10Z" fill="#7fd6ea"/><g stroke="#fff" stroke-width="3" opacity=".8"><path d="M-110 4 h-20 M-104 12 h-30"/></g>`);
const tourBoat = (x, y, s = 1) =>
  T(x, y, s, `<path d="M-110 -10 H110 L96 12 H-100Z" fill="#fff8e6"/><path d="M-110 -10 H110" stroke="#00b3a6" stroke-width="6"/><rect x="-80" y="-44" width="150" height="34" fill="#fff8e6"/><rect x="-80" y="-50" width="160" height="8" fill="#2456b8"/><g fill="#7fd6ea">${[-70, -44, -18, 8, 34].map((px) => `<rect x="${px}" y="-36" width="18" height="14" rx="2"/>`).join("")}</g><rect x="-6" y="-74" width="12" height="24" fill="#ff3d8b"/>`);
const couple = (x, y, s = 1) =>
  T(x, y, s, `<circle cx="-18" cy="-86" r="10" fill="#ffd1a8"/><path d="M-30 -74 H-6 L-2 -26 H-34Z" fill="#2456b8"/><path d="M-26 -26 L-30 0 M-10 -26 L-4 0" stroke="#161b2a" stroke-width="6"/><circle cx="20" cy="-84" r="10" fill="#c98a5a"/><path d="M8 -72 H32 L44 -24 H-4Z" fill="#ff3d8b"/><path d="M12 -24 L8 0 M28 -24 L34 0" stroke="#161b2a" stroke-width="6"/><path d="M-6 -60 Q4 -66 10 -58" stroke="#ffd1a8" stroke-width="5" fill="none"/>`);
const record = (x, y, r = 44) =>
  `<g transform="translate(${x} ${y})"><circle r="${r}" fill="#161b2a"/><circle r="${r * 0.78}" fill="none" stroke="#3a4050" stroke-width="2"/><circle r="${r * 0.56}" fill="none" stroke="#3a4050" stroke-width="2"/><circle r="${r * 0.32}" fill="#ffb627"/><circle r="3" fill="#161b2a"/></g>`;
const tikiBar = (x, y, s = 1) =>
  T(x, y, s, `<path d="M-90 -80 L0 -118 L90 -80Z" fill="#e7c98f"/><path d="M-90 -80 L0 -118 L90 -80" stroke="#c9a05a" stroke-width="4" fill="none"/><g stroke="#c9a05a" stroke-width="2">${[-70, -50, -30, -10, 10, 30, 50, 70].map((px) => `<path d="M${px} -80 l-6 12"/>`).join("")}</g><rect x="-80" y="-80" width="8" height="80" fill="#8a5a2b"/><rect x="72" y="-80" width="8" height="80" fill="#8a5a2b"/><rect x="-86" y="-34" width="172" height="34" fill="#a0642f"/><rect x="-90" y="-38" width="180" height="8" fill="#7a4a22"/>`);
const margarita = (x, y, s = 1) =>
  T(x, y, s, `<path d="M-40 -80 H40 L6 -40 V-6 H22 V0 H-22 V-6 H-6 V-40Z" fill="#c8f08a" opacity=".95"/><path d="M-40 -80 H40" stroke="#fff" stroke-width="4"/><circle cx="34" cy="-80" r="14" fill="#7bc043"/><circle cx="34" cy="-80" r="9" fill="#c8f08a"/><path d="M-10 -90 L-30 -120" stroke="#ff3d8b" stroke-width="4"/>`);
const rod = (x, y, s = 1) =>
  T(x, y, s, `<path d="M0 0 L90 -110" stroke="#161b2a" stroke-width="4"/><path d="M90 -110 Q130 -60 120 20" stroke="#fff" stroke-width="1.5" fill="none"/><circle cx="16" cy="-20" r="7" fill="#d7dde6"/><circle cx="120" cy="20" r="5" fill="#ff3d8b"/>`);
const saloon = (x, y, s = 1) =>
  T(x, y, s, `<rect x="-90" y="-130" width="180" height="130" fill="#a0642f"/><path d="M-100 -130 H100 V-112 H-100Z" fill="#7a4a22"/><rect x="-50" y="-100" width="100" height="100" fill="#2a1a12"/><path d="M-46 -84 H-2 V-26 H-46Z M2 -84 H46 V-26 H2Z" fill="#c48448"/><g stroke="#7a4a22" stroke-width="3"><path d="M-46 -70 H-2 M-46 -56 H-2 M-46 -42 H-2 M2 -70 H46 M2 -56 H46 M2 -42 H46"/></g><rect x="-70" y="-124" width="140" height="10" fill="#ffd24a"/>`);
const dogBowl = (x, y) => `<path d="M${x - 16} ${y} q16 10 32 0 l-4 -10 h-24z" fill="#ff3d8b"/><path d="M${x + 22} ${y - 4} q6 -10 12 0 q6 -10 12 0 l-2 4 h-20z" fill="#fff8e6"/>`;
const tiger = (x, y, s = 1) =>
  T(x, y, s, `<path d="M-70 -30 Q-60 -64 0 -60 Q50 -58 60 -34 L66 0 H52 L46 -22 L-40 -22 L-50 0 H-64Z" fill="#ff8a1e"/><g stroke="#161b2a" stroke-width="5" stroke-linecap="round"><path d="M-40 -60 l6 18 M-20 -62 l4 20 M0 -60 l2 18 M20 -58 l0 18"/></g><circle cx="66" cy="-56" r="26" fill="#ff8a1e"/><path d="M48 -78 l6 -10 l8 8 M74 -80 l8 -8 l4 12" fill="#ff8a1e"/><circle cx="58" cy="-60" r="3" fill="#161b2a"/><circle cx="76" cy="-60" r="3" fill="#161b2a"/><path d="M62 -48 q4 4 8 0" stroke="#161b2a" stroke-width="2" fill="none"/><path d="M-70 -34 q-30 -10 -24 -40" stroke="#ff8a1e" stroke-width="8" fill="none" stroke-linecap="round"/>`);
const croc = (x, y, s = 1) =>
  T(x, y, s, `<path d="M-90 0 Q-60 -20 0 -18 L80 -14 Q96 -10 90 -2 L0 4 Q-60 10 -90 0Z" fill="#3b8f3a"/><g fill="#2a6f2c">${[-60, -40, -20, 0, 20].map((px) => `<path d="M${px} -18 l6 -8 l6 8z"/>`).join("")}</g><circle cx="40" cy="-20" r="4" fill="#fff"/><path d="M50 -8 l4 6 l4 -6 l4 6 l4 -6" stroke="#fff" stroke-width="2" fill="none"/>`);
const captainHat = (x, y, s = 1) =>
  T(x, y, s, `<path d="M-60 0 Q-64 -50 0 -54 Q64 -50 60 0Z" fill="#fff8e6"/><rect x="-62" y="-12" width="124" height="16" rx="4" fill="#161b2a"/><path d="M-70 4 Q0 30 70 4 Q0 16 -70 4Z" fill="#161b2a"/><circle cy="-30" r="10" fill="#ffd24a"/><path d="M-18 -30 h-14 M18 -30 h14" stroke="#ffd24a" stroke-width="4"/>`);
const helm = (x, y, s = 1, c = "#a0642f") =>
  T(x, y, s, `<circle r="40" fill="none" stroke="${c}" stroke-width="9"/><circle r="12" fill="${c}"/>${Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4; return `<path d="M0 0 L${(Math.cos(a) * 58).toFixed(1)} ${(Math.sin(a) * 58).toFixed(1)}" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`; }).join("")}`);
const anchor = (x, y, s = 1, c = "#161b2a") =>
  T(x, y, s, `<circle cy="-90" r="12" fill="none" stroke="${c}" stroke-width="7"/><rect x="-4" y="-80" width="8" height="80" fill="${c}"/><rect x="-26" y="-66" width="52" height="8" rx="4" fill="${c}"/><path d="M-50 -30 Q-46 4 0 4 Q46 4 50 -30" stroke="${c}" stroke-width="8" fill="none"/><path d="M-58 -24 L-50 -40 L-42 -24Z M58 -24 L50 -40 L42 -24Z" fill="${c}"/>`);
const clockTower = (x, y, s = 1) =>
  T(x, y, s, `<rect x="-60" y="-70" width="120" height="70" fill="#fff8e6"/><g fill="#c2415d">${[-44, -14, 16].map((px) => `<path d="M${px} 0 V-34 Q${px + 14} -50 ${px + 28} -34 V0Z"/>`).join("")}</g><rect x="-26" y="-130" width="52" height="60" fill="#fff8e6"/><circle cy="-104" r="15" fill="#fff"/><circle cy="-104" r="15" fill="none" stroke="#161b2a" stroke-width="2"/><path d="M0 -104 V-114 M0 -104 h8" stroke="#161b2a" stroke-width="2"/><rect x="-16" y="-170" width="32" height="40" fill="#fff8e6"/><path d="M-20 -170 L0 -196 L20 -170Z" fill="#2a6f4a"/><rect x="-8" y="-162" width="16" height="22" rx="8" fill="#c2415d"/>`);
const riceStalk = (x, y, s = 1) =>
  T(x, y, s, `<path d="M0 0 Q4 -50 20 -80" stroke="#7bc043" stroke-width="3" fill="none"/><g fill="#ffd24a">${[0, 1, 2, 3, 4].map((i) => `<ellipse cx="${18 - i * 2}" cy="${-78 + i * 10}" rx="4" ry="7" transform="rotate(30 ${18 - i * 2} ${-78 + i * 10})"/>`).join("")}</g>`);
const colonial = (x, y, s = 1, c = "#c2415d") =>
  T(x, y, s, `<rect x="-80" y="-80" width="160" height="80" fill="${c}"/><path d="M-90 -80 L0 -118 L90 -80Z" fill="#3d4a5c"/><rect x="-6" y="-140" width="12" height="30" fill="#3d4a5c"/><g fill="#fff8e6">${[-60, -30, 18, 48].map((px) => `<rect x="${px}" y="-66" width="16" height="22"/><rect x="${px}" y="-34" width="16" height="22"/>`).join("")}</g><rect x="-12" y="-40" width="24" height="40" fill="#fff8e6"/><path d="M-30 -80 V0 M30 -80 V0" stroke="#fff8e6" stroke-width="5"/>`);
const riverHouse = (x, y, s = 1) =>
  T(x, y, s, `<rect x="-90" y="-90" width="180" height="90" fill="#fff8e6"/><path d="M-100 -90 L0 -130 L100 -90Z" fill="#8e1b3a"/><rect x="-100" y="-46" width="200" height="8" fill="#fff8e6"/><g fill="#fff8e6">${[-90, -54, -18, 18, 54, 86].map((px) => `<rect x="${px - 3}" y="-90" width="6" height="90"/>`).join("")}</g><g fill="#2456b8" opacity=".75">${[-70, -34, 26, 62].map((px) => `<rect x="${px}" y="-80" width="16" height="26"/><rect x="${px}" y="-32" width="16" height="26"/>`).join("")}</g><rect x="-10" y="-30" width="20" height="30" fill="#8e1b3a"/>`);
const mirror = (x, y, s = 1, c = "#ffd24a") =>
  T(x, y, s, `<ellipse rx="30" ry="46" fill="${c}"/><ellipse rx="22" ry="38" fill="#bff0ea"/><path d="M-12 -20 L8 -32 M-14 -4 L12 -20" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>`);
const chainLock = (x, y, s = 1) =>
  T(x, y, s, `<g fill="none" stroke="#c9d3e6" stroke-width="7">${[-120, -90, -60, -30, 30, 60, 90, 120].map((px, i) => `<ellipse cx="${px}" cy="${i % 2 ? -4 : 4}" rx="16" ry="9"/>`).join("")}</g><path d="M-18 -10 V-30 Q-18 -50 0 -50 Q18 -50 18 -30 V-10" stroke="#ffd24a" stroke-width="9" fill="none"/><rect x="-28" y="-12" width="56" height="48" rx="8" fill="#ffd24a"/><circle cy="8" r="6" fill="#161b2a"/><rect x="-2" y="10" width="4" height="12" fill="#161b2a"/>`);
const witchHat = (x, y, s = 1) =>
  T(x, y, s, `<path d="M-60 0 Q0 -14 60 0 Q0 10 -60 0Z" fill="#161b2a"/><path d="M-30 -4 L10 -100 Q24 -90 14 -80 L30 -4Z" fill="#161b2a"/><rect x="-30" y="-20" width="60" height="10" fill="#7a2fc2"/><rect x="-6" y="-22" width="14" height="14" fill="#ffd24a"/>`);
const vr = (x, y, s = 1) =>
  T(x, y, s, `<rect x="-60" y="-34" width="120" height="60" rx="18" fill="#2a2f3a"/><rect x="-50" y="-26" width="100" height="44" rx="14" fill="#00e5cc"/><path d="M-50 -4 H50" stroke="#2a2f3a" stroke-width="3"/><path d="M-60 -6 Q-90 -6 -90 -30 M60 -6 Q90 -6 90 -30" stroke="#2a2f3a" stroke-width="8" fill="none"/>`);
const qmark = (x, y, s = 1, c = "#ffd24a") =>
  T(x, y, s, `<path d="M-22 -60 Q-22 -90 0 -90 Q24 -90 24 -64 Q24 -44 4 -36 V-18" stroke="${c}" stroke-width="12" fill="none" stroke-linecap="round"/><circle cx="4" cy="2" r="8" fill="${c}"/>`);
const hourglass = (x, y, s = 1) =>
  T(x, y, s, `<rect x="-36" y="-110" width="72" height="10" rx="3" fill="#a0642f"/><rect x="-36" y="-10" width="72" height="10" rx="3" fill="#a0642f"/><path d="M-28 -100 H28 Q28 -70 4 -56 Q28 -42 28 -10 H-28 Q-28 -42 -4 -56 Q-28 -70 -28 -100Z" fill="#bff0ea" opacity=".85"/><path d="M-18 -84 H18 Q14 -66 0 -60 Q-14 -66 -18 -84Z M-24 -12 Q0 -30 24 -12Z" fill="#ffb627"/>`);
const compass = (x, y, s = 1) =>
  T(x, y, s, `<circle r="44" fill="#ffd24a"/><circle r="36" fill="#fff8e6"/><path d="M0 -30 L8 0 L0 30 L-8 0Z" fill="#ff3d8b"/><path d="M0 0 L8 0 L0 30 L-8 0Z" fill="#161b2a"/><circle r="4" fill="#ffd24a"/>`);
const spyglass = (x, y, s = 1) =>
  T(x, y, s, `<g transform="rotate(-20)"><rect x="-80" y="-10" width="60" height="20" rx="4" fill="#a0642f"/><rect x="-24" y="-13" width="50" height="26" rx="4" fill="#ffd24a"/><rect x="24" y="-16" width="40" height="32" rx="4" fill="#a0642f"/><circle cx="66" r="14" fill="#bff0ea"/></g>`);
const glasses3d = (x, y, s = 1) =>
  T(x, y, s, `<rect x="-70" y="-22" width="60" height="40" rx="8" fill="#ff3d3d" opacity=".9"/><rect x="10" y="-22" width="60" height="40" rx="8" fill="#00b3e6" opacity=".9"/><path d="M-70 -22 H70 M-10 -6 Q0 -14 10 -6 M-70 -10 L-96 -20 M70 -10 L96 -20" stroke="#fff8e6" stroke-width="6" fill="none"/>`);
const shark = (x, y, s = 1) =>
  T(x, y, s, `<path d="M-70 0 Q-20 -30 50 -10 Q66 -4 70 4 Q40 18 -40 14Z" fill="#8892a8"/><path d="M-10 -22 L4 -54 L20 -16Z" fill="#8892a8"/><path d="M-70 0 L-96 -22 L-88 4 L-98 24Z" fill="#8892a8"/><path d="M-30 10 Q20 18 60 6" stroke="#fff" stroke-width="5" fill="none"/><circle cx="48" cy="-4" r="3" fill="#161b2a"/>`);
const bowlBall = (x, y, r = 30, c = "#7a2fc2") => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><g fill="#161b2a"><circle cx="${x - r * 0.3}" cy="${y - r * 0.35}" r="${r * 0.12}"/><circle cx="${x + r * 0.05}" cy="${y - r * 0.45}" r="${r * 0.12}"/><circle cx="${x - r * 0.05}" cy="${y - r * 0.05}" r="${r * 0.14}"/></g>`;
const putter = (x, y, s = 1) => T(x, y, s, `<path d="M0 0 L40 -120" stroke="#d7dde6" stroke-width="5"/><rect x="-18" y="-4" width="36" height="12" rx="4" fill="#161b2a"/><rect x="34" y="-136" width="12" height="24" rx="4" fill="#161b2a"/>`);
const hole = (x, y, f = "#ff3d8b") => `<ellipse cx="${x}" cy="${y}" rx="12" ry="5" fill="#0b3a53"/>${flag(x, y, f)}`;
const green = (x, y, rx = 90, ry = 20) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#41c27a"/><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/>`;
const lights = (y = 26, cs = ["#ffd24a", "#ff3d8b", "#00e5cc"]) => `<path d="M0 ${y} Q100 ${y + 22} 200 ${y} T400 ${y}" stroke="#161b2a" stroke-width="1.5" fill="none" opacity=".6"/>${Array.from({ length: 16 }, (_, i) => { const x = i * 26 + 6; const yy = y + 11 * Math.sin((x / 200) * Math.PI) ** 2; return `<circle cx="${x}" cy="${yy.toFixed(1)}" r="4" fill="${cs[i % cs.length]}"/>`; }).join("")}`;
const moonCr = (x, y, r = 22) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff3c4"/><circle cx="${x + r * 0.45}" cy="${y - r * 0.2}" r="${r * 0.85}" fill="url(#sk)"/>`;
const crane = (x, y, s = 1) => T(x, y, s, `<ellipse cx="0" cy="-60" rx="22" ry="12" fill="#fff"/><path d="M14 -64 Q30 -100 22 -110 Q30 -112 34 -106" stroke="#fff" stroke-width="5" fill="none"/><path d="M34 -106 l18 4 l-18 2z" fill="#ffb627"/><path d="M-4 -50 L-8 0 M6 -50 L10 0" stroke="#161b2a" stroke-width="3"/>`);
const marshGrass = (y = 196, c = "#5aa34a") => `<g fill="${c}">${Array.from({ length: 26 }, (_, i) => `<path d="M${i * 16} ${y} l4 -${18 + (i % 4) * 6} l4 ${18 + (i % 4) * 6}z"/>`).join("")}</g>`;
const boardwalk = (y = 190, c = "#a0642f") => `<rect y="${y}" width="400" height="12" fill="${c}"/><g fill="#7a4a22">${Array.from({ length: 11 }, (_, i) => `<rect x="${i * 40 + 6}" y="${y + 12}" width="6" height="${240 - y}"/>`).join("")}</g><path d="M0 ${y - 22} H400" stroke="${c}" stroke-width="4"/><g stroke="${c}" stroke-width="4">${Array.from({ length: 11 }, (_, i) => `<path d="M${i * 40 + 8} ${y - 22} V${y}"/>`).join("")}</g>`;
const surfboard = (x, y, s = 1, c = "#ffb627") => T(x, y, s, `<path d="M0 0 Q-16 -60 0 -120 Q16 -60 0 0Z" fill="${c}"/><path d="M0 -6 V-114" stroke="#ff3d8b" stroke-width="4"/>`);
const paddler = (x, y, s = 1, c = "#ff7a59") => T(x, y, s, `<path d="M-60 0 Q0 12 60 0 Q0 -4 -60 0Z" fill="${c}"/><circle cy="-34" r="8" fill="#ffd1a8"/><rect x="-6" y="-26" width="12" height="26" rx="4" fill="#ffd24a"/><path d="M-30 -60 L30 20" stroke="#161b2a" stroke-width="3"/><path d="M-34 -66 l8 -2 l2 10z M30 20 l6 6 l-10 0z" fill="#161b2a"/>`);
const cypress = (x, y, s = 1, c = "#2a6f4a") => T(x, y, s, `<path d="M-14 0 Q-10 -40 -4 -90 H4 Q10 -40 14 0Z" fill="#6b4a2f"/><path d="M0 -150 Q-30 -120 -26 -90 Q-40 -70 -20 -60 H20 Q40 -70 26 -90 Q30 -120 0 -150Z" fill="${c}"/><path d="M-26 -80 q-6 30 -4 40 M24 -84 q6 30 2 44" stroke="#9aa6b8" stroke-width="2" fill="none" opacity=".7"/>`);
const parasail = (x, y, s = 1, a = "#ff3d8b", b = "#ffd24a") => T(x, y, s, `<path d="M-50 0 Q0 -50 50 0 Q0 -18 -50 0Z" fill="${a}"/><path d="M-16 -16 Q0 -50 16 -16Z" fill="${b}"/><path d="M-50 0 L0 50 M50 0 L0 50 M0 -14 L0 50" stroke="#fff" stroke-width="1.5"/><circle cy="56" r="6" fill="#ffd1a8"/>`);
const flipFlops = (x, y) => `<g transform="translate(${x} ${y})"><ellipse cx="-14" rx="10" ry="22" fill="#ff3d8b"/><ellipse cx="14" cy="4" rx="10" ry="22" fill="#00b3a6"/><path d="M-14 -14 l-6 10 M-14 -14 l6 10 M14 -10 l-6 10 M14 -10 l6 10" stroke="#fff8e6" stroke-width="3"/></g>`;

// ---------- pieces for the Nov 6 additions ----------
const longPier = (y, x0 = 0, x1 = 400, c = "#a0642f") =>
  `<rect x="${x0}" y="${y - 10}" width="${x1 - x0}" height="10" fill="${c}"/><path d="M${x0} ${y - 22} H${x1}" stroke="${c}" stroke-width="3"/><g fill="#7a4a22">${Array.from({ length: Math.floor((x1 - x0) / 36) + 1 }, (_, i) => `<rect x="${x0 + i * 36 + 4}" y="${y}" width="5" height="${240 - y}"/>`).join("")}</g><g stroke="${c}" stroke-width="3">${Array.from({ length: Math.floor((x1 - x0) / 36) + 1 }, (_, i) => `<path d="M${x0 + i * 36 + 6} ${y - 22} V${y - 10}"/>`).join("")}</g>`;
const pierHouse = (x, y, c = "#ff7a59") => `<g transform="translate(${x} ${y - 10})"><rect x="-30" y="-36" width="60" height="36" fill="${c}"/><path d="M-36 -36 L0 -56 L36 -36Z" fill="#c2415d"/><rect x="-8" y="-22" width="16" height="22" fill="#fff8e6"/></g>`;
const splash = (x, y) => `<g fill="#fff" opacity=".85"><circle cx="${x - 14}" cy="${y}" r="5"/><circle cx="${x + 12}" cy="${y - 4}" r="4"/><circle cx="${x}" cy="${y - 10}" r="3"/></g>`;
const ferrisSmall = (x, y, s = 1) => T(x, y, s, `<circle cy="-90" r="70" fill="none" stroke="#fff8e6" stroke-width="5"/>${Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4; return `<path d="M0 -90 L${(Math.cos(a) * 70).toFixed(1)} ${(-90 + Math.sin(a) * 70).toFixed(1)}" stroke="#fff8e6" stroke-width="2"/><circle cx="${(Math.cos(a) * 70).toFixed(1)}" cy="${(-90 + Math.sin(a) * 70).toFixed(1)}" r="7" fill="${["#ff3d8b", "#ffd24a", "#00e5cc"][i % 3]}"/>`; }).join("")}<path d="M-30 0 L0 -90 L30 0" stroke="#fff8e6" stroke-width="5" fill="none"/>`);
const pelican = (x, y, s = 1, flip = false) => T(x, y, s, `<g transform="scale(${flip ? -1 : 1} 1)"><rect x="-3" y="-4" width="6" height="22" fill="#7a4a22"/><ellipse cx="0" cy="-16" rx="16" ry="12" fill="#c9b8a0"/><circle cx="8" cy="-32" r="8" fill="#fff8e6"/><path d="M14 -32 L40 -26 L14 -24Z" fill="#ffb627"/><path d="M14 -24 Q28 -18 34 -26" fill="#e8920c"/></g>`);
const cone = (x, y, s = 1) => T(x, y, s, `<path d="M-16 -40 L0 0 L16 -40Z" fill="#e7a55a"/><path d="M-12 -36 L12 -28 M-8 -24 L10 -18" stroke="#c48448" stroke-width="2"/><circle cy="-48" r="16" fill="#ffc2d6"/><circle cx="-8" cy="-62" r="12" fill="#bff0ea"/><circle cx="8" cy="-64" r="12" fill="#fff3c4"/>`);
const sportfisher = (x, y, s = 1, hull = "#fff8e6", trim = "#ff3d8b") => T(x, y, s, `<path d="M-90 -6 H70 Q96 -6 104 -24 L94 8 Q40 16 -84 12Z" fill="${hull}"/><path d="M-88 4 H98" stroke="${trim}" stroke-width="6"/><rect x="-40" y="-34" width="70" height="28" fill="${hull}"/><rect x="-32" y="-28" width="54" height="12" fill="#7fd6ea"/><path d="M-30 -34 V-80 H20 V-34 M-30 -80 H20 M-5 -80 V-34" stroke="#d7dde6" stroke-width="3" fill="none"/><path d="M-70 -6 L-110 -70 M-60 -6 L-80 -80" stroke="#161b2a" stroke-width="2"/>`);
const wakeboarder = (x, y) => `<g transform="translate(${x} ${y})"><path d="M-30 0 Q0 8 30 0" stroke="#ffb627" stroke-width="8" stroke-linecap="round"/><circle cy="-48" r="8" fill="#ffd1a8"/><path d="M0 -40 L-4 -18 M-4 -18 L-14 -2 M-4 -18 L10 -2 M0 -34 L18 -46 M0 -34 L14 -52" stroke="#ff3d8b" stroke-width="6" stroke-linecap="round"/><g fill="#fff" opacity=".85"><circle cx="-36" cy="4" r="6"/><circle cx="-48" cy="0" r="4"/></g></g>`;
const inflatables = (x, y) => `<g transform="translate(${x} ${y})"><rect x="-60" y="-30" width="60" height="22" rx="10" fill="#ff7a59"/><path d="M10 -8 L40 -60 L60 -60 L50 -8Z" fill="#ffd24a"/><rect x="60" y="-40" width="40" height="32" rx="8" fill="#00b3a6"/><circle cx="-30" cy="-40" r="10" fill="#ff3d8b"/></g>`;
const pontoon = (x, y, s = 1, top = "#00b3a6") => T(x, y, s, `<rect x="-90" y="-4" width="180" height="10" rx="5" fill="#d7dde6"/><rect x="-80" y="-24" width="160" height="20" fill="#fff8e6"/><path d="M-80 -60 H80 V-54 H-80Z" fill="${top}"/><path d="M-70 -54 V-24 M70 -54 V-24" stroke="#d7dde6" stroke-width="4"/>${[-40, 0, 40].map((px) => `<circle cx="${px}" cy="-34" r="7" fill="#ffd1a8"/>`).join("")}`);
const horse = (x, y, s = 1, c = "#8a5a2b") => T(x, y, s, `<path d="M-50 -60 Q-30 -76 20 -70 L44 -100 Q56 -104 60 -92 L54 -70 Q50 -60 36 -56 L30 -40 L-46 -40 Q-60 -48 -50 -60Z" fill="${c}"/><path d="M-40 -42 L-44 0 M-26 -42 L-24 0 M16 -42 L12 0 M28 -42 L32 0" stroke="${c}" stroke-width="7" stroke-linecap="round"/><path d="M-50 -58 Q-74 -50 -70 -20" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M36 -96 Q20 -84 24 -70" stroke="#2a1a12" stroke-width="6" fill="none"/><circle cx="-6" cy="-92" r="8" fill="#ffd1a8"/><path d="M-6 -84 V-66 M-6 -78 L6 -70" stroke="#00b3a6" stroke-width="7" stroke-linecap="round"/>`);
const sup = (x, y, s = 1, c = "#ff3d8b") => T(x, y, s, `<path d="M-50 0 Q0 8 50 0 Q0 -6 -50 0Z" fill="${c}"/><circle cy="-56" r="7" fill="#ffd1a8"/><path d="M0 -48 V-22 M0 -22 L-8 0 M0 -22 L8 0 M0 -42 L14 -30" stroke="#2456b8" stroke-width="6" stroke-linecap="round"/><path d="M14 -60 L22 4" stroke="#161b2a" stroke-width="3"/>`);
const shells = (x, y) => `<g transform="translate(${x} ${y})"><path d="M-20 0 Q-20 -24 0 -24 Q20 -24 20 0Z" fill="#ffc2d6"/><path d="M-12 0 L-6 -22 M0 0 V-24 M12 0 L6 -22" stroke="#ff8aa8" stroke-width="2"/><path d="M30 0 q8 -18 20 -6 q-4 10 -20 6z" fill="#fff3c4"/></g>`;
const llama = (x, y, s = 1) => T(x, y, s, `<rect x="-40" y="-60" width="70" height="34" rx="16" fill="#fff8e6"/><path d="M14 -56 Q18 -100 28 -110 H38 Q40 -80 34 -56Z" fill="#fff8e6"/><path d="M28 -110 l-2 -12 l6 6 M36 -110 l2 -12 l-6 6" stroke="#fff8e6" stroke-width="4"/><circle cx="36" cy="-102" r="2.5" fill="#161b2a"/><path d="M38 -96 h8" stroke="#fff8e6" stroke-width="6" stroke-linecap="round"/><path d="M-32 -28 V0 M-16 -28 V0 M10 -28 V0 M24 -28 V0" stroke="#fff8e6" stroke-width="7"/><rect x="-24" y="-62" width="34" height="10" fill="#ff3d8b"/>`);
const sloth = (x, y, s = 1) => T(x, y, s, `<path d="M-60 0 H60" stroke="#6b4a2f" stroke-width="8"/><ellipse cx="0" cy="18" rx="30" ry="16" fill="#9a7a5a"/><circle cx="26" cy="22" r="13" fill="#c9a888"/><path d="M20 20 q4 -3 8 0 M28 20 q4 -3 8 0" stroke="#2a1a12" stroke-width="2.5" fill="none"/><path d="M-18 6 L-22 -2 M18 6 L22 -2 M-10 8 L-12 -2" stroke="#9a7a5a" stroke-width="6" stroke-linecap="round"/>`);
const goat = (x, y, s = 1) => T(x, y, s, `<rect x="-30" y="-44" width="54" height="26" rx="12" fill="#e7d8c0"/><circle cx="30" cy="-52" r="12" fill="#e7d8c0"/><path d="M26 -62 q-6 -12 2 -16 M34 -62 q4 -12 12 -12" stroke="#8a6a4a" stroke-width="3" fill="none"/><path d="M34 -42 l-2 10" stroke="#e7d8c0" stroke-width="4"/><path d="M-22 -20 V0 M-8 -20 V0 M8 -20 V0 M18 -20 V0" stroke="#e7d8c0" stroke-width="6"/>`);
const blocks = (x, y) => `<g transform="translate(${x} ${y})"><rect x="-90" y="-50" width="50" height="50" fill="#ff3d8b"/><rect x="-36" y="-50" width="50" height="50" fill="#ffb627"/><rect x="-64" y="-100" width="50" height="50" fill="#00b3a6"/><rect x="-10" y="-100" width="50" height="50" fill="#7a2fc2"/><g fill="#fff8e6" font-family="Arial Black,Arial" font-size="28" text-anchor="middle"><text x="-65" y="-16">A</text><text x="-11" y="-16">B</text><text x="-39" y="-66">C</text><text x="15" y="-66">1</text></g></g>`;
const slide = (x, y) => `<g transform="translate(${x} ${y})"><rect x="-10" y="-120" width="8" height="120" fill="#d7dde6"/><rect x="30" y="-120" width="8" height="120" fill="#d7dde6"/><path d="M-6 -120 H34" stroke="#d7dde6" stroke-width="6"/><path d="M34 -110 Q90 -60 80 0" stroke="#ffd24a" stroke-width="16" fill="none" stroke-linecap="round"/><g stroke="#d7dde6" stroke-width="4">${[-100, -80, -60, -40, -20].map((yy) => `<path d="M-6 ${yy} H34"/>`).join("")}</g></g>`;
const pinball = (x, y, s = 1) => T(x, y, s, `<path d="M-60 0 L-54 -60 H54 L60 0Z" fill="#2456b8"/><rect x="-56" y="-66" width="112" height="10" fill="#ffd24a"/><path d="M-48 -66 L-40 -150 H40 L48 -66Z" fill="#ff3d8b"/><rect x="-36" y="-142" width="72" height="66" fill="#14082e"/>${neonRing(-12, -116, 10, "#00e5cc", 3)}${neonRing(14, -100, 8, "#ffd24a", 3)}<circle cx="2" cy="-86" r="4" fill="#d7dde6"/><path d="M-20 -80 L-6 -84 M20 -80 L6 -84" stroke="#fff" stroke-width="3"/><rect x="-40" y="-200" width="80" height="50" rx="4" fill="#7a2fc2"/>${star(0, -176, 16)}<path d="M-54 0 V20 M54 0 V20" stroke="#161b2a" stroke-width="6"/>`);
const curioShelf = (x, y) => `<g transform="translate(${x} ${y})"><rect x="-130" y="-150" width="260" height="150" fill="#5a2a1a"/><rect x="-120" y="-140" width="240" height="130" fill="#2a1a12"/><path d="M-120 -76 H120" stroke="#5a2a1a" stroke-width="6"/><path d="M-100 -82 q0 -40 26 -40 q-16 10 -12 22 q10 -12 18 0 q-8 18 -32 18z" fill="#ffd47a"/><circle cx="-20" cy="-104" r="20" fill="#bff0ea"/><circle cx="-20" cy="-104" r="8" fill="#2456b8"/><circle cx="-18" cy="-106" r="3" fill="#161b2a"/><rect x="40" y="-128" width="12" height="48" fill="#ff3d8b"/><rect x="58" y="-110" width="40" height="30" fill="#ffb627"/><path d="M-96 -12 L-60 -50 L-24 -12Z" fill="#c9a05a"/><circle cx="20" cy="-32" r="18" fill="#7a2fc2"/><path d="M60 -12 q10 -40 34 -40 q-6 20 0 40z" fill="#00b3a6"/><text x="0" y="-160" font-family="Georgia,serif" font-size="18" fill="#ffd24a" text-anchor="middle" font-style="italic">believe it?</text></g>`;
const easel = (x, y) => `<g transform="translate(${x} ${y})"><path d="M-40 0 L-10 -150 M40 0 L10 -150 M0 -150 V0" stroke="#a0642f" stroke-width="6"/><rect x="-60" y="-140" width="120" height="90" fill="#fff8e6"/><rect x="-54" y="-134" width="108" height="78" fill="#ffb08a"/><circle cx="20" cy="-110" r="14" fill="#fff3c4"/><path d="M-54 -80 Q-20 -92 10 -80 T54 -82 V-56 H-54Z" fill="#12a6a0"/><rect x="-70" y="-50" width="140" height="8" fill="#a0642f"/></g>`;
const palette = (x, y) => `<g transform="translate(${x} ${y})"><path d="M-40 -20 Q-40 -60 0 -60 Q44 -60 44 -26 Q44 -6 20 -10 Q8 -12 8 0 Q8 10 -10 10 Q-40 10 -40 -20Z" fill="#e7c98f"/><circle cx="-20" cy="-40" r="7" fill="#ff3d8b"/><circle cx="0" cy="-46" r="7" fill="#ffd24a"/><circle cx="22" cy="-40" r="7" fill="#00b3a6"/><circle cx="-24" cy="-16" r="7" fill="#2456b8"/><path d="M30 -70 L60 -110" stroke="#a0642f" stroke-width="5"/></g>`;
const muscleCar = (x, y, s = 1, c = "#ff7a1e") => T(x, y, s, `<path d="M-120 -10 Q-120 -36 -96 -38 L-50 -42 L-24 -70 H40 L70 -42 L116 -36 Q128 -30 128 -10Z" fill="${c}"/><path d="M-18 -64 H34 L56 -42 H-40Z" fill="#7fd6ea"/><path d="M8 -64 V-42" stroke="${c}" stroke-width="5"/><path d="M-120 -40 V-80 M-100 -40 V-80 M-130 -80 H-90" stroke="${c}" stroke-width="7"/><path d="M-110 -24 H120" stroke="#161b2a" stroke-width="5"/><circle cx="-70" cy="-6" r="22" fill="#161b2a"/><circle cx="-70" cy="-6" r="9" fill="#d7dde6"/><circle cx="76" cy="-6" r="22" fill="#161b2a"/><circle cx="76" cy="-6" r="9" fill="#d7dde6"/>`);
const schoolhouse = (x, y, s = 1) => T(x, y, s, `<rect x="-110" y="-70" width="220" height="70" fill="#c2415d"/><path d="M-124 -70 L0 -112 L124 -70Z" fill="#5a2a1a"/><rect x="-20" y="-150" width="40" height="44" fill="#fff8e6"/><path d="M-26 -150 L0 -170 L26 -150Z" fill="#5a2a1a"/><path d="M-8 -136 Q0 -146 8 -136 V-120 H-8Z" fill="#ffd24a"/><g fill="#fff8e6">${[-90, -56, 30, 64].map((px) => `<rect x="${px}" y="-56" width="26" height="30"/>`).join("")}</g><rect x="-14" y="-50" width="28" height="50" fill="#fff8e6"/><path d="M-130 0 H130" stroke="#a0642f" stroke-width="4"/>`);
const books = (x, y) => `<g transform="translate(${x} ${y})"><rect x="-30" y="-12" width="60" height="12" fill="#2456b8"/><rect x="-26" y="-24" width="54" height="12" fill="#ffb627"/><rect x="-30" y="-36" width="58" height="12" fill="#00b3a6"/><circle cx="4" cy="-48" r="10" fill="#ff3d3d"/><path d="M4 -58 q4 -6 8 -6" stroke="#2f9e6b" stroke-width="3" fill="none"/></g>`;
const fingerprint = (x, y) => `<g transform="translate(${x} ${y})" fill="none" stroke="#5a3a1f" stroke-width="3" opacity=".85">${[12, 20, 28, 36, 44].map((r) => `<path d="M${-r} 10 Q${-r} ${-r - 10} 0 ${-r - 10} Q${r} ${-r - 10} ${r} 10"/>`).join("")}</g>`;

const CUSTOM = {
  // ---------- Breweries & wineries ----------
  "Bin 2004": () => [sky("dusk"), sun("dusk", 320, 70, 26), lights(30), `<rect y="150" width="400" height="90" fill="#5a2a3a"/><rect y="146" width="400" height="10" fill="#a0642f"/>`, bottle(150, 146, 1, "#6e1430"), glass(210, 146, 0.8, "#c2184f"), glass(250, 146, 0.8, "#ffd47a"), `<g fill="#ffd24a" opacity=".9"><rect x="40" y="70" width="30" height="40" rx="3"/><rect x="330" y="96" width="34" height="44" rx="3"/></g>`].join(""),
  "Carolina Vineyards Winery": () => [sky("golden"), sun("golden", 90, 70, 34), hills(140, "#e8692a", 0.35), vineRows(160), barrel(270, 210, 1), bottle(320, 212, 0.9, "#7a2fc2"), grapes(110, 150, 0.9)].join(""),
  "Duplin Winery": () => [sky("dawn"), sun("dawn", 300, 76, 34), cloud(90, 50), grass(178, "#7bc043", "#5aa34a"), `<g stroke="#2a6f4a" stroke-width="6">${[40, 120, 200, 280, 360].map((px) => `<path d="M${px} 180 Q${px + 10} 150 ${px + 30} 150"/>`).join("")}</g>`, grapes(120, 120, 1.5), grapes(260, 130, 1.2), `<path d="M0 150 H400" stroke="#8a5a2b" stroke-width="3"/>`].join(""),
  "La Belle Amie Vineyard": () => [sky("sunset"), sun("sunset", 200, 96, 44), vineRows(170), `<g transform="translate(300 176)"><rect x="-40" y="-50" width="80" height="50" fill="#fff8e6"/><path d="M-50 -50 L0 -84 L50 -50Z" fill="#c2415d"/><rect x="-10" y="-30" width="20" height="30" fill="#8e1b3a"/></g>`, `<g transform="translate(90 200)"><rect x="-30" y="-46" width="60" height="6" fill="#a0642f"/><path d="M-26 -40 V0 M26 -40 V0" stroke="#a0642f" stroke-width="4"/></g>`, stringLightsLow()].join(""),
  "The Tasting Room on 9th": () => [sky("plum"), sun("plum", 330, 60, 22), `<g fill="#3a1640"><rect x="0" y="80" width="70" height="160"/><rect x="80" y="60" width="60" height="180"/><rect x="300" y="70" width="100" height="170"/></g><g fill="#ffd24a" opacity=".8">${[10, 30, 90, 110, 310, 340, 370].map((px, i) => `<rect x="${px}" y="${96 + (i % 3) * 30}" width="10" height="14"/>`).join("")}</g>`, `<rect x="140" y="110" width="160" height="130" fill="#ff7a59"/><rect x="150" y="96" width="140" height="18" fill="#161b2a"/><text x="220" y="110" font-family="Georgia,serif" font-size="13" fill="#ffd24a" text-anchor="middle">9TH</text><rect x="160" y="130" width="120" height="70" fill="#ffe9a8"/>`, glass(190, 196, 0.6, "#8e1b3a"), glass(250, 196, 0.6, "#ffd47a")].join(""),
  "Black Drum Brewing": () => [sky("day"), sun("day", 330, 60, 30), sea(150), bigFish(190, 186, 1), mug(330, 226, 0.6), bird(70, 50)].join(""),
  "New South Brewing": () => [sky("coral"), sun("coral", 300, 70, 36), hills(150, "#ff6f7d", 0.35), grass(184, "#2f9e6b", "#1f7a52"), growler(180, 210, 1), mug(270, 214, 0.6), cloud(80, 50)].join(""),
  "South Coast Beer Project": () => [sky("aqua"), sun("aqua", 90, 62, 32), sea(160), sand(200), can(170, 216, 1, "#00b3a6", "#ffd24a"), can(240, 222, 0.85, "#ff3d8b", "#fff8e6"), sunbrella(330, 206, 1)].join(""),
  "Southern Hops Brewing Company": () => [sky("sunset"), sun("sunset", 300, 80, 40), grass(186, "#7bc043", "#5aa34a"), `<path d="M120 196 V40 M280 196 V40" stroke="#8a5a2b" stroke-width="5"/><path d="M120 40 H280" stroke="#8a5a2b" stroke-width="3"/>`, hops(130, 70, 1.3), hops(240, 90, 1.1), mug(200, 214, 0.6)].join(""),
  "Tidal Creek Brewhouse": () => [sky("pastel"), sun("pastel", 300, 60, 28), `<rect y="150" width="400" height="90" fill="#7fd6ea"/><path d="M0 170 Q120 150 200 176 T400 166" stroke="#bff0ea" stroke-width="10" fill="none"/>`, marshGrass(160, "#7bc043"), crane(330, 200, 0.9), mug(180, 226, 0.75), coffee(90, 226, 0.9)].join(""),
  "Yee-Haw Brewing at Ole Smoky Distillery": () => [sky("golden"), sun("golden", 320, 80, 40), hills(160, "#b04a14", 0.4), grass(196, "#c9a05a", "#a0642f"), `<g transform="translate(110 210)"><rect x="-40" y="-60" width="80" height="60" fill="#a0642f"/><path d="M-50 -60 L0 -90 L50 -60Z" fill="#7a4a22"/></g>`, jar(210, 214, 1.3), cowboy(290, 186, 0.8, "#c48448")].join(""),

  // ---------- Family & indoor ----------
  "Backstage Escape Games": () => [`<rect width="400" height="240" fill="#2a0f3a"/>`, spot(200), mirror(110, 120, 1, "#ffd24a"), mirror(200, 110, 1.15, "#ff3d8b"), mirror(290, 120, 1, "#00e5cc"), floor(186, "#1a0a26"), star(60, 40, 10), star(350, 46, 10)].join(""),
  "Break Out Myrtle Beach": () => [`<rect width="400" height="240" fill="#14082e"/>`, sea(176, "#1f6f8b", "#18566e", "#103c52"), ship(140, 170, 0.8, "#c2184f", "#2a1a12", "#ffd24a", 1), treasureChest(290, 214, 1.1), key(330, 120, 1.2), stars(rng(3), 12)].join(""),
  "Captive Escape Rooms": () => [`<rect width="400" height="240" fill="#3a1606"/>`, `<rect x="120" y="20" width="160" height="176" rx="6" fill="#7a4a22"/><rect x="132" y="32" width="136" height="164" fill="#a0642f"/>`, chainLock(200, 120, 1), floor(196, "#2a0f06")].join(""),
  "Escapology Myrtle Beach": () => [`<rect width="400" height="240" fill="#0b2236"/>`, `<rect x="40" y="40" width="320" height="140" rx="8" fill="#123a5a"/>`, hourglass(120, 186, 1), `<text x="250" y="130" font-family="Courier New,monospace" font-size="44" fill="#00e5cc" text-anchor="middle">59:59</text>`, floor(186, "#081a2a")].join(""),
  "Myrtle Beach Room Escape": () => [sky("neon"), moonCr(320, 60, 24), castle(150, 200, 1.1), witchHat(290, 200, 0.9), ghost(70, 110, 0.7), stars(rng(9), 16)].join(""),
  "Riddles Escape Room": () => [`<rect width="400" height="240" fill="#22103a"/>`, `<g opacity=".35">${neonRing(200, 110, 90, "#ff3d8b", 4)}</g>`, vr(200, 130, 1.1), qmark(80, 120, 0.8, "#ffd24a"), qmark(330, 110, 0.7, "#00e5cc"), floor(196, "#160828")].join(""),
  "The Escape Game Myrtle Beach": () => [sky("night"), `<circle cx="300" cy="70" r="30" fill="#ff7a59"/><circle cx="290" cy="64" r="6" fill="#d9534f"/>`, `<g fill="#fff">${[[60, 40], [120, 70], [200, 30], [360, 120], [40, 140]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="2"/>`).join("")}</g>`, `<g transform="translate(150 150) rotate(-30)"><path d="M0 -40 Q16 -20 16 20 H-16 Q-16 -20 0 -40Z" fill="#fff8e6"/><path d="M-16 20 L-28 36 H-16Z M16 20 L28 36 H16Z" fill="#ff3d8b"/><circle cy="-6" r="6" fill="#7fd6ea"/><path d="M-8 22 Q0 50 8 22" fill="#ffb627"/></g>`, `<rect y="200" width="400" height="40" fill="#3a2a5a"/>`, compass(320, 190, 0.6)].join(""),
  "Stars and Strikes": () => [`<rect width="400" height="240" fill="#14082e"/>`, `<g stroke="#00e5cc" stroke-width="3" opacity=".7"><path d="M0 40 L400 140 M0 120 L400 20"/></g><g stroke="#ff3d8b" stroke-width="3" opacity=".7"><path d="M0 200 L400 60"/></g>`, star(90, 70, 26), star(320, 60, 18, "#00e5cc"), floor(176, "#241452"), pins(270, 196, 0.9), bowlBall(150, 186, 28, "#ffd24a")].join(""),
  "family-indoor/AlleyOops North Myrtle Beach": () => [`<rect width="400" height="240" fill="#0b2a4a"/>`, `<rect x="30" y="30" width="200" height="120" rx="10" fill="#1f6f8b"/><rect x="38" y="38" width="184" height="104" rx="6" fill="#3fb8d6"/>`, shark(130, 96, 0.9), fish(70, 60, 0.4), floor(176, "#0b1f3a"), pins(310, 200, 0.7), bowlBall(260, 196, 16, "#ff3d8b")].join(""),

  // ---------- Historic & cultural ----------
  "Georgetown County Museum": () => [sky("dawn"), sun("dawn", 320, 70, 30), grass(190, "#7bc043", "#5aa34a"), colonial(190, 196, 1, "#c2415d"), oak(60, 196, 0.9), `<rect x="340" y="80" width="3" height="116" fill="#d7dde6"/><path d="M343 80 h30 v20 h-30z" fill="#2456b8"/>`].join(""),
  "Kaminski House Museum": () => [sky("sunset"), sun("sunset", 80, 70, 34), `<rect y="190" width="400" height="50" fill="#2b86a8"/><path d="M0 196 Q100 186 200 196 T400 194" stroke="#7fd6ea" stroke-width="4" fill="none"/>`, `<rect y="176" width="400" height="16" fill="#5aa34a"/>`, riverHouse(220, 178, 0.85), oak(370, 180, 0.8)].join(""),
  "Rice Museum": () => [sky("golden"), sun("golden", 330, 60, 30), grass(196, "#c9a05a", "#a0642f"), clockTower(200, 200, 0.95), riceStalk(60, 220, 1.2), riceStalk(84, 222, 1), riceStalk(330, 220, 1.2), riceStalk(354, 224, 1)].join(""),
  "South Carolina Maritime Museum": () => [sky("day"), sun("day", 80, 60, 28), sea(170), helm(270, 110, 0.9, "#a0642f"), anchor(140, 200, 0.8, "#161b2a"), lighthouse(360, 176, 0.6), cloud(200, 40)].join(""),

  // ---------- Mini golf ----------
  "Aloha Falls Mini Golf": () => [sky("day"), sun("day", 320, 60, 30), rock(200, 180, 200, 140, "#8a6a4a"), waterfall(200, 180, 50, 118), sea(180, "#3fb8d6", "#2b86a8", "#1f6f8b"), palm(70, 196, 1.2), palm(340, 196, 1), hole(110, 218)].join(""),
  "Aloha Village Mini Golf": () => [sky("coral"), sun("coral", 200, 90, 40), grass(186, "#2f9e6b", "#1f7a52"), tikiHut(90, 190, 0.9), tikiHut(310, 190, 0.8), green(200, 210, 80, 16), hole(240, 212, "#ffd24a"), torch(160, 190), torch(250, 190)].join(""),
  "Inlet Adventure Mini Golf": () => [sky("dawn"), sun("dawn", 90, 64, 30), rock(260, 192, 220, 150, "#9a6a4a"), `<path d="M220 192 Q220 120 260 120 Q300 120 300 192Z" fill="#2a1a12"/>`, waterfall(330, 150, 22, 80), grass(196, "#2f9e6b", "#1f7a52"), green(110, 212, 70, 14), hole(130, 214), `<g transform="translate(60 200)"><path d="M-12 0 L-6 -24 H6 L12 0Z" fill="#ff3d8b"/><ellipse cy="-26" rx="12" ry="8" fill="#fff8e6"/></g>`].join(""),
  "Gilligan's Island Funland": () => [sky("aqua"), sun("aqua", 320, 70, 30), sea(160), `<ellipse cx="190" cy="190" rx="170" ry="30" fill="#f2dfb4"/>`, tikiHut(150, 186, 0.9), palm(260, 186, 1.2), palm(90, 190, 0.8), `<rect x="300" y="150" width="4" height="40" fill="#8a5a2b"/><circle cx="302" cy="146" r="10" fill="#fff8e6" stroke="#ff3d8b" stroke-width="4"/>`].join(""),
  "Runaway Bay Miniature Golf": () => [sky("sunset"), sun("sunset", 300, 80, 40), sea(170), lighthouse(80, 186, 0.9), rock(220, 190, 120, 60, "#7a5a3a"), `<path d="M180 190 Q180 150 220 150 Q260 150 260 190Z" fill="#2a1a12"/>`, sand(206), palm(350, 206, 0.9), hole(300, 220, "#00b3a6")].join(""),
  "Aloha Mini Golf": () => [sky("golden"), sun("golden", 90, 70, 34), grass(190, "#2f9e6b", "#1f7a52"), palm(320, 190, 1.2), parrot(200, 150, 1.2, "#ff3d3d"), parrot(270, 120, 0.8, "#00b3a6"), `<rect x="150" y="150" width="140" height="4" fill="#8a5a2b"/>`, hole(120, 210)].join(""),
  "Hawaiian Rumble Golf": () => [sky("dusk"), volcano(200, 180, 1.4, "#ff5a3d"), smoke(200, 60), `<path d="M180 80 Q170 40 200 20 Q230 40 220 80" fill="#ff8a1e" opacity=".8"/>`, sea(180, "#ff9a5c", "#e8692a", "#c2415d"), palm(60, 196, 1), palm(350, 196, 1.1), green(120, 214, 60, 12), hole(140, 216, "#ffd24a")].join(""),
  "Molten Mountain Miniature Golf": () => [sky("sunset"), sun("sunset", 320, 70, 30), volcano(140, 190, 1.2, "#ff3d3d"), `<path d="M130 120 Q110 160 130 190" stroke="#ff8a1e" stroke-width="10" fill="none"/>`, `<g transform="translate(300 196)"><rect x="-60" y="-70" width="120" height="70" fill="#fff8e6"/><rect x="-60" y="-80" width="120" height="14" fill="#00b3a6"/><path d="M-40 -50 h20 v14 h-20z M20 -50 h20 v14 h-20z" fill="#7fd6ea"/><text x="0" y="-12" font-size="14" fill="#00b3a6" text-anchor="middle" font-family="Arial">A/C</text></g>`, grass(200, "#2f9e6b", "#1f7a52")].join(""),
  "Tribal Island Tiki Adventure Golf": () => [sky("plum"), moonCr(80, 60, 22), sea(176, "#12a6a0", "#0e8c87", "#2b86a8"), tikiStatue(200, 200, 1), torch(130, 196), torch(270, 196), palm(340, 200, 1.1), palm(60, 200, 0.9), sand(210)].join(""),
  "Lost Mine Miniature Golf": () => [sky("golden"), sun("golden", 320, 70, 30), hills(160, "#b04a14", 0.4), goldMine(160, 200, 1.1), mineCart(290, 206, 0.9), grass(208, "#c9a05a", "#a0642f")].join(""),
  "Professor Hacker's Lost Treasure Golf": () => [sky("day"), sun("day", 80, 60, 28), `<path d="M140 200 L240 50 L360 200Z" fill="#9a6a4a"/><path d="M200 110 L240 50 L280 110Z" fill="#fff8e6" opacity=".6"/>`, `<path d="M0 200 Q150 190 230 120" stroke="#5a3a1f" stroke-width="5" fill="none"/>`, `<g transform="translate(160 162) rotate(-28)"><rect x="-30" y="-24" width="60" height="24" fill="#ff3d8b"/><circle cx="-16" cy="2" r="6" fill="#161b2a"/><circle cx="16" cy="2" r="6" fill="#161b2a"/><rect x="18" y="-40" width="10" height="16" fill="#161b2a"/></g>`, treasureChest(80, 214, 0.9), grass(208, "#2f9e6b", "#1f7a52")].join(""),
  "Snake River Golf and Gem Mining": () => [sky("coral"), sun("coral", 320, 60, 30), grass(180, "#7bc043", "#5aa34a"), `<path d="M-10 230 Q100 180 200 210 T420 190" stroke="#3fb8d6" stroke-width="26" fill="none"/>`, sluice(200, 170, 1), gems(90, 168, 1.2), `<path d="M300 200 q20 -20 40 0 t40 0" stroke="#3b8f3a" stroke-width="8" fill="none" stroke-linecap="round"/>`].join(""),
  "Black Pearl Mini Golf": () => [sky("night"), moonCr(320, 60, 26), sea(170, "#1f6f8b", "#18566e", "#103c52"), ship(170, 172, 0.9, "#161b2a", "#0b0f14", "#ff3d8b", 2), `<g transform="translate(320 204)"><path d="M-30 0 Q0 -30 30 0Z" fill="#e7c98f"/><circle cy="-8" r="9" fill="#fff8e6"/></g>`, stars(rng(21), 12)].join(""),
  "Mutiny Bay Miniature Golf": () => [sky("sunset"), sun("sunset", 200, 90, 36), sea(170), ship(110, 176, 0.65, "#fff8e6", "#7a4a22", "#ff3d8b", 2), ship(290, 180, 0.65, "#c2184f", "#2a1a12", "#ffd24a", 1), `<g fill="#fff" opacity=".7"><circle cx="200" cy="150" r="10"/><circle cx="214" cy="140" r="7"/></g>`].join(""),
  "Pirate's Watch Adventure Golf": () => [sky("aqua"), sun("aqua", 90, 60, 28), sea(176), `<rect x="200" y="40" width="8" height="160" fill="#7a4a22"/><path d="M180 70 H228 L222 90 H186Z" fill="#a0642f"/>`, spyglass(250, 60, 0.4), `<path d="M208 40 l30 10 l-30 10z" fill="#161b2a"/>`, palm(80, 200, 1.1), sand(206), hole(320, 222)].join(""),
  "Shipwreck Island Adventure Golf": () => [sky("dawn"), sun("dawn", 320, 64, 30), sea(170), `<g transform="translate(180 186) rotate(18)">${ship(0, 0, 0.9, "#ffd9a0", "#5a3a1f", "#ff3d8b", 1)}</g>`, rock(330, 200, 80, 50, "#7a5a3a"), sand(210), bird(260, 40), bird(290, 54)].join(""),
  "Spy Glass Adventure Golf": () => [sky("coral"), sea(170), `<circle cx="210" cy="110" r="56" fill="#bff0ea"/><circle cx="210" cy="110" r="56" fill="none" stroke="#161b2a" stroke-width="10"/>`, ship(214, 120, 0.4, "#161b2a", "#161b2a", "#ff3d8b", 2), spyglass(130, 180, 0.9), sand(206)].join(""),
  "Treasure Island Golf": () => [sky("golden"), sun("golden", 320, 70, 34), sea(172), `<ellipse cx="200" cy="198" rx="150" ry="28" fill="#f2dfb4"/>`, treasureChest(200, 200, 1.3), palm(90, 196, 1.2), palm(320, 196, 0.9), `<path d="M260 206 l12 -12 M260 194 l12 12" stroke="#c2184f" stroke-width="5"/>`].join(""),
  "Captain Hook's Adventure Golf": () => [sky("pastel"), sun("pastel", 90, 64, 28), sea(170), croc(220, 200, 1.1), `<g transform="translate(320 130)"><path d="M0 -40 V0 Q0 20 -20 20 Q-36 20 -36 4" stroke="#d7dde6" stroke-width="8" fill="none" stroke-linecap="round"/><rect x="-12" y="-60" width="24" height="24" rx="4" fill="#c2184f"/></g>`, waterfall(80, 196, 30, 70), `<circle cx="160" cy="80" r="4" fill="#ffd24a"/><circle cx="170" cy="70" r="2" fill="#ffd24a"/>`].join(""),
  "Captain Myrtle Mini Golf": () => [sky("day"), sun("day", 330, 56, 26), grass(196, "#2f9e6b", "#1f7a52"), `<g transform="translate(170 196)"><path d="M-110 -50 H110 L90 0 H-90Z" fill="#c2415d"/><path d="M-110 -50 H110" stroke="#fff8e6" stroke-width="6"/><rect x="-60" y="-96" width="120" height="46" fill="#fff8e6"/><g fill="#7fd6ea">${[-50, -20, 10, 40].map((px) => `<circle cx="${px + 6}" cy="-74" r="8"/>`).join("")}</g></g>`, captainHat(170, 104, 0.7), helm(330, 150, 0.55, "#a0642f"), flag(330, 210, "#ffd24a"), `<ellipse cx="330" cy="210" rx="12" ry="5" fill="#0b3a53"/>`].join(""),
  "Broadway Grand Prix Challenge Mini Golf": () => [sky("sunset"), sun("sunset", 320, 70, 34), grass(186, "#2f9e6b", "#1f7a52"), green(150, 206, 110, 20), `<path d="M60 190 Q150 170 250 196" stroke="#161b2a" stroke-width="2" fill="none" stroke-dasharray="6 6"/>`, checker(250, 110, 60, 40, 6), `<rect x="248" y="110" width="4" height="86" fill="#d7dde6"/>`, putter(90, 206, 0.8), ball(150, 204, 7, "#fff")].join(""),
  "Jungle Safari Mini Golf": () => [sky("golden"), sun("golden", 200, 90, 40), grass(186, "#c9a05a", "#a0642f"), giraffe(320, 196, 1), elephant(130, 200, 0.9), `<path d="M30 196 q10 -50 30 -60 q-10 30 10 60" fill="#3b8f3a"/>`, hole(230, 214)].join(""),
  "mini-golf/AlleyOops North Myrtle Beach": () => [sky("aqua"), sun("aqua", 320, 60, 28), sea(150), sand(176, "#f2dfb4", "#e7c98f"), green(170, 210, 120, 20), hole(230, 210, "#ff3d8b"), shark(330, 160, 0.5), sunbrella(60, 196, 0.9), ball(120, 210, 6, "#fff")].join(""),
  "PopStroke Myrtle Beach": () => [sky("day"), sun("day", 80, 56, 26), grass(170, "#41c27a", "#2f9e6b"), `<path d="M240 186 Q280 170 330 186 Q290 200 240 186Z" fill="#f2dfb4"/>`, green(150, 200, 100, 18), hole(190, 200, "#00b3a6"), `<g transform="translate(300 150)"><rect x="-30" y="-50" width="60" height="50" fill="#fff8e6"/><path d="M-36 -50 L0 -70 L36 -50Z" fill="#ff3d8b"/></g>`, margarita(60, 214, 0.5)].join(""),
  "Professor Hacker's Dinosaur Adventure Golf": () => [sky("dawn"), sun("dawn", 90, 60, 30), hills(160, "#e8692a", 0.35), grass(196, "#2f9e6b", "#1f7a52"), dino(240, 196, 1.2, "#e8692a", "#b04a14"), `<g transform="translate(90 206)"><ellipse rx="24" ry="30" fill="#fff8e6"/><path d="M-20 -6 l8 6 l6 -8 l8 8 l8 -6" stroke="#c9a05a" stroke-width="3" fill="none"/></g>`].join(""),
  "810 Billiards & Bowling 3D Haunted Mini Golf": () => [sky("neon"), moonCr(320, 54, 22), hauntedHouse(140, 196, 1), ghost(290, 120, 0.9), glasses3d(250, 196, 0.7), `<rect y="196" width="400" height="44" fill="#1a0a2e"/>`, green(250, 220, 70, 10)].join(""),

  // ---------- Nature & eco ----------
  "Crazy Sister Dolphin Cruises": () => [sky("sunset"), sun("sunset", 200, 110, 46), sea(160), sail(160, 176, 1, "#ff3d8b", "#ffb627"), dolphin(290, 196, 0.8)].join(""),
  "Getaway Adventures Dolphin Tour": () => [sky("day"), sun("day", 320, 60, 28), sea(150), dolphin(150, 196, 1.2), dolphin(260, 206, 0.8), bird(80, 50)].join(""),
  "Sea Thunder and Sea Screamer": () => [sky("coral"), sun("coral", 300, 70, 30), sea(160), speedboat(180, 186, 1, "#ff3d8b"), `<g fill="#fff" opacity=".7"><circle cx="40" cy="190" r="8"/><circle cx="60" cy="180" r="5"/></g>`, `<path d="M330 214 Q340 196 352 214" fill="#7fd6ea"/>`].join(""),
  "Voyager Dolphin Cruises": () => [sky("golden"), sun("golden", 90, 70, 34), sea(160), tourBoat(220, 180, 0.9), `<path d="M60 210 Q72 190 86 210" fill="#7fd6ea"/>`, cloud(320, 40)].join(""),
  "Express Watersports Dolphin Watch": () => [sky("dawn"), sun("dawn", 320, 70, 32), sea(160), paddler(140, 200, 1, "#ff7a59"), dolphin(290, 206, 0.7), marshGrass(170, "#7bc043")].join(""),
  "Black River Outdoors Center": () => [sky("pastel"), sun("pastel", 300, 60, 26), `<rect y="160" width="400" height="80" fill="#3d6a5a"/><path d="M0 180 Q200 170 400 186" stroke="#7fd6ea" stroke-width="3" fill="none" opacity=".6"/>`, cypress(60, 176, 1), cypress(330, 180, 1.1), cypress(380, 176, 0.7), kayak(190, 206, 1, "#ffb627")].join(""),
  "Hobcaw Barony": () => [sky("dawn"), sun("dawn", 90, 70, 30), `<rect y="170" width="400" height="70" fill="#7fd6ea"/>`, marshGrass(196, "#7bc043"), crane(200, 200, 1.2), oak(330, 176, 1.1), `<path d="M0 176 H400" stroke="#5aa34a" stroke-width="6"/>`].join(""),
  "Surf the Earth": () => [sky("aqua"), sun("aqua", 300, 60, 30), sea(150), sand(196), surfboard(120, 210, 1, "#ffb627"), surfboard(160, 214, 0.9, "#ff3d8b"), kayak(290, 196, 0.9, "#00b3a6"), sunbrella(360, 208, 0.8)].join(""),
  "Huntington Beach State Park": () => [sky("golden"), sun("golden", 320, 70, 32), sea(170), sand(196), castle(120, 196, 0.8), crane(260, 206, 0.6), marshGrass(196, "#7bc043")].join(""),
  "Murrells Inlet MarshWalk": () => [sky("dusk"), sun("dusk", 320, 60, 22), `<rect y="160" width="400" height="80" fill="#2b86a8"/>`, marshGrass(176, "#5aa34a"), boardwalk(186), lights(110), `<g transform="translate(90 186)"><rect x="-30" y="-40" width="60" height="40" fill="#ff7a59"/><path d="M-36 -40 L0 -60 L36 -40Z" fill="#c2415d"/></g>`].join(""),
  "Myrtle Beach Boardwalk": () => [sky("sunset"), sun("sunset", 80, 70, 30), sea(160), ferris(300, 176, 0.7), boardwalk(196, "#c48448"), sunbrella(160, 196, 0.8)].join(""),
  "Myrtle Beach State Park": () => [sky("day"), sun("day", 80, 56, 28), sea(150), `<rect y="164" width="250" height="8" fill="#a0642f"/><g fill="#7a4a22">${[20, 70, 120, 170, 220].map((px) => `<rect x="${px}" y="172" width="6" height="40"/>`).join("")}</g>`, sand(200), `<g transform="translate(320 214)"><path d="M-30 0 L0 -40 L30 0Z" fill="#ff7a59"/><path d="M0 -40 L30 0 H0Z" fill="#c2415d"/></g>`, oak(380, 210, 0.7), rod(140, 160, 0.4)].join(""),
  "T.I.G.E.R.S. / Myrtle Beach Safari": () => [sky("golden"), sun("golden", 320, 70, 34), grass(190, "#5aa34a", "#3b8f3a"), tiger(170, 200, 1.1), palm(350, 196, 1), `<path d="M20 190 q10 -60 40 -70 q-20 30 0 70" fill="#3b8f3a"/>`].join(""),

  // ---------- Nightlife ----------
  "Fat Harold's Beach Club": () => [sky("plum"), `<rect y="150" width="400" height="90" fill="#3a1640"/>`, `<g opacity=".9">${record(320, 90, 40)}</g>`, couple(160, 220, 1.1), `<text x="160" y="60" font-family="Georgia,serif" font-size="26" fill="#ffd24a" text-anchor="middle" font-style="italic">shag</text>`, lights(16)].join(""),
  "Ocean Annie's Beach Bar": () => [sky("sunset"), sun("sunset", 320, 90, 40), sea(160), sand(196), tikiBar(170, 200, 0.9), margarita(320, 220, 0.5), flipFlops(60, 220)].join(""),
  "Señor Frog's": () => [sky("neon"), `<g stroke="#7bc043" stroke-width="5" opacity=".8">${neonRing(110, 100, 46, "#7bc043", 5)}</g>`, margarita(110, 150, 0.8), palm(300, 190, 1.2, "#2f9e6b"), floor(190, "#24104a"), `<g fill="#ffd24a">${[40, 200, 360].map((px) => `<circle cx="${px}" cy="30" r="5"/>`).join("")}</g>`].join(""),
  "Spanish Galleon Night Club": () => [sky("dusk"), sea(176, "#5b1a6e", "#3a1046", "#2a0f3a"), ship(200, 176, 0.9, "#ff3d8b", "#2a1a12", "#ffd24a", 2), disco(200, 50, 0.7), `<g stroke="#00e5cc" stroke-width="2" opacity=".6"><path d="M200 50 L80 170 M200 50 L320 170"/></g>`].join(""),
  "Apache Pier": () => [sky("dawn"), sun("dawn", 90, 70, 34), sea(150), `<rect y="150" width="400" height="8" fill="#a0642f"/><g fill="#7a4a22">${[20, 80, 140, 200, 260, 320, 380].map((px) => `<rect x="${px}" y="158" width="6" height="82"/>`).join("")}</g>`, rod(220, 150, 0.6), rod(300, 150, 0.5), bird(160, 50)].join(""),
  "The Pier at Garden City Beach": () => [sky("plum"), moonCr(320, 50, 20), sea(170), `<rect x="0" y="140" width="300" height="10" fill="#a0642f"/><g fill="#7a4a22">${[20, 80, 140, 200, 260].map((px) => `<rect x="${px}" y="150" width="6" height="90"/>`).join("")}</g><rect x="210" y="96" width="90" height="44" fill="#ff7a59"/><path d="M204 96 L255 76 L306 96Z" fill="#c2415d"/>`, lights(124, ["#ffd24a", "#00e5cc"]), mic(110, 82, 0.5)].join(""),
  "Tin Roof": () => [sky("dusk"), `<g transform="translate(200 196)"><rect x="-150" y="-90" width="300" height="90" fill="#a0642f"/><path d="M-170 -90 L0 -120 L170 -90Z" fill="#9aa6b8"/><g stroke="#d7dde6" stroke-width="2">${Array.from({ length: 16 }, (_, i) => `<path d="M${-160 + i * 20} -90 L${-160 + i * 20 + 6} -110"/>`).join("")}</g><rect x="-60" y="-70" width="120" height="70" fill="#ffd24a" opacity=".9"/></g>`, mic(200, 140, 0.7), note(90, 80), note(320, 70, 1, "#00e5cc")].join(""),
  "Dead Dog Saloon": () => [sky("sunset"), sun("sunset", 320, 70, 30), `<rect y="196" width="400" height="44" fill="#a0642f"/>`, saloon(170, 200, 0.9), dogBowl(320, 220), marshGrass(196, "#7bc043")].join(""),
  "The Bowery": () => [`<rect width="400" height="240" fill="#2a1a12"/>`, spot(200), `<rect y="180" width="400" height="60" fill="#5a3a1f"/>`, `<g transform="translate(200 176)"><path d="M-40 0 Q-60 -80 0 -110 Q60 -80 40 0Z" fill="#c48448"/><circle cy="-50" r="16" fill="#2a1a12"/><rect x="-6" y="-200" width="12" height="100" fill="#8a5a2b"/></g>`, cowboy(90, 120, 0.7, "#a0642f"), star(330, 60, 14)].join(""),
  "House of Blues": () => [sky("night"), `<rect y="150" width="400" height="90" fill="#2a1a52"/>`, `<g transform="translate(200 200)"><path d="M-70 0 Q-70 -60 -20 -70 L40 -120 L56 -110 L10 -64 Q60 -50 50 0Z" fill="#2456b8"/><circle cx="-4" cy="-30" r="12" fill="#14082e"/></g>`, note(80, 90, 1.2, "#7fd6ea"), note(330, 80, 1, "#ffd24a"), `<g fill="#ffd24a" opacity=".6"><circle cx="40" cy="30" r="2"/><circle cx="360" cy="40" r="2"/><circle cx="140" cy="20" r="2"/></g>`].join(""),
  "Pirate's Cove Lounge": () => [sky("dusk"), moonCr(80, 60, 20), sea(176, "#2b86a8", "#1f6f8b", "#18566e"), tikiBar(240, 200, 0.8), margarita(240, 200, 0.4), `<g transform="translate(110 150)"><rect x="-2" y="-60" width="4" height="70" fill="#7a4a22"/><path d="M2 -60 h40 v26 h-40z" fill="#161b2a"/><circle cx="22" cy="-50" r="5" fill="#fff8e6"/></g>`].join(""),

  // ---------- Thrill & action ----------
  "Broadway Grand Prix": () => [sky("sunset"), sun("sunset", 320, 66, 32), road(176), kart(180, 200, 1.1, "#ff3d8b"), speed(), checker(310, 120, 60, 40, 6), `<rect x="308" y="120" width="4" height="56" fill="#d7dde6"/>`].join(""),
  "Fun Warehouse": () => [`<rect width="400" height="240" fill="#22103a"/>`, `<g fill="#ffd24a" opacity=".25">${[60, 200, 340].map((px) => `<path d="M${px - 10} 0 L${px - 60} 200 H${px + 60} L${px + 10} 0Z"/>`).join("")}</g>`, floor(170, "#1a0a2e"), skate(120, 200, 1.1, "#ff3d8b"), kart(280, 206, 0.8, "#00e5cc"), `<g stroke="#00e5cc" stroke-width="3"><path d="M20 60 L120 30"/></g><g stroke="#ff3d8b" stroke-width="3"><path d="M380 50 L280 90"/></g>`].join(""),
  "K1 Speed": () => [`<rect width="400" height="240" fill="#0b1430"/>`, `<rect y="176" width="400" height="64" fill="#1a2b3a"/><g fill="#ff3d3d">${Array.from({ length: 10 }, (_, i) => `<rect x="${i * 40}" y="170" width="20" height="8"/>`).join("")}</g><g fill="#fff">${Array.from({ length: 10 }, (_, i) => `<rect x="${i * 40 + 20}" y="170" width="20" height="8"/>`).join("")}</g>`, helmet(140, 150, 1, "#00b3e6"), kart(290, 206, 0.9, "#ffd24a"), `<g stroke="#7fd6ea" stroke-width="3" opacity=".5"><path d="M20 30 H380 M20 50 H380"/></g>`].join(""),
  "The Track Family Fun Park": () => [sky("golden"), sun("golden", 90, 70, 30), `<g stroke="#a0642f" stroke-width="5">${[60, 120, 180, 240, 300, 360].map((px) => `<path d="M${px} 200 V${110 + (px % 120) / 4}"/>`).join("")}</g><path d="M0 120 Q100 90 200 130 T400 110" stroke="#c48448" stroke-width="14" fill="none"/>`, kart(200, 128, 0.6, "#00e5cc"), grass(200, "#2f9e6b", "#1f7a52"), `<g transform="translate(320 200)">${carousel(0, 0, 0.35)}</g>`].join(""),
  "Crazy Sister Marina": () => [sky("dawn"), sun("dawn", 320, 70, 32), sea(150), bananaBoat(180, 196, 1), `<g transform="translate(60 150)"><rect x="-4" y="-60" width="8" height="60" fill="#7a4a22"/></g>`, marshGrass(150, "#7bc043")].join(""),
  "Express Watersports": () => [sky("aqua"), sun("aqua", 80, 56, 26), sea(160), parasail(270, 70, 0.8, "#00b3a6", "#ffd24a"), `<path d="M270 120 L180 196" stroke="#fff" stroke-width="1.5"/>`, jetski(180, 206, 1, "#ff7a59")].join(""),
  "Myrtle Beach Jet Ski Rental": () => [sky("sunset"), sun("sunset", 300, 80, 40), sea(160), jetski(150, 206, 1.1, "#ff3d8b"), `<g transform="translate(330 170)"><rect x="-50" y="-6" width="100" height="10" fill="#a0642f"/><rect x="-46" y="4" width="6" height="40" fill="#7a4a22"/><rect x="40" y="4" width="6" height="40" fill="#7a4a22"/></g>`].join(""),
  "Myrtle Beach Watersports": () => [sky("aqua"), sun("aqua", 320, 56, 26), sea(150), `<g transform="translate(120 70)"><rect x="-3" y="0" width="3" height="60" fill="#fff8e6"/><path d="M0 0 h40 v24 h-40z" fill="#00b3a6"/></g>`, jetski(130, 206, 0.7, "#00b3a6"), jetski(220, 200, 0.6, "#ffd24a"), dolphin(320, 196, 1)].join(""),
  "Family Kingdom Amusement Park": () => [sky("sunset"), sun("sunset", 330, 60, 28), sea(196, "#3fb8d6", "#2b86a8", "#1f6f8b"), woodCoaster(196)].join(""),
  "Pavilion Nostalgia Park": () => [sky("pastel"), sun("pastel", 80, 60, 26), lights(30), carousel(200, 210, 1.15), `<rect y="210" width="400" height="30" fill="#c48448"/>`].join(""),
  "Radical Ropes Adventure Park": () => [sky("golden"), sun("golden", 320, 60, 30), hills(170, "#b04a14", 0.3), ropeNet(80, 70, 220, 100), grass(200, "#2f9e6b", "#1f7a52"), `<g transform="translate(190 120)"><circle r="8" fill="#ffd1a8"/><path d="M0 8 V30 M0 14 L-14 4 M0 14 L14 4 M0 30 L-8 46 M0 30 L8 46" stroke="#ff3d8b" stroke-width="5" stroke-linecap="round"/></g>`].join(""),
  "Soar & Explore (WonderWorks)": () => [sky("day"), sun("day", 330, 50, 24), `<rect y="160" width="400" height="80" fill="#3fb8d6"/><path d="M0 176 Q100 166 200 176 T400 172" stroke="#bff0ea" stroke-width="5" fill="none"/>`, upsideBuilding(80, 150, 0.45), `<path d="M20 50 L380 150" stroke="#fff8e6" stroke-width="2"/><rect x="370" y="140" width="10" height="60" fill="#8a5a2b"/>`, `<g transform="translate(250 104)"><circle r="8" fill="#ffd1a8"/><path d="M0 8 V28 M0 14 L-10 2 M0 14 L10 2 M0 28 L-10 42 M0 28 L10 42" stroke="#00b3a6" stroke-width="5" stroke-linecap="round"/></g>`].join(""),

  // ---------- Added Nov 6: fishing, water parks, museums, wildlife ----------
  "Cherry Grove Pier": () => [sky("dawn"), sun("dawn", 90, 74, 36), sea(150), longPier(150, 0, 330), pierHouse(330, 150, "#ff7a59"), `<g transform="translate(150 196) rotate(-30)">${bigFish(0, 0, 0.45, "#5b7fa6", "#cfe3f0")}</g>`, splash(160, 206), bird(220, 50), bird(250, 62)].join(""),
  "Pier 14": () => [sky("dusk"), sun("dusk", 300, 60, 22), sea(160), longPier(160, 60, 400), `<g transform="translate(70 160)">${ferrisSmall(0, 0, 0.55)}</g>`, lights(140, ["#ffd24a", "#ff3d8b"]), rod(250, 160, 0.45)].join(""),
  "Second Avenue Pier": () => [sky("golden"), sun("golden", 300, 86, 42), sea(156), longPier(156, 0, 300), pelican(90, 152, 1), pelican(200, 152, 0.85, true), cloud(80, 40)].join(""),
  "Surfside Beach Pier": () => [sky("day"), sun("day", 330, 56, 26), sea(150), longPier(150, 120, 400), sand(200), cone(70, 220, 1), sunbrella(170, 208, 0.9, "#00b3a6", "#fff"), rod(300, 150, 0.4)].join(""),
  "Fish Finder Fishing Charters": () => [sky("sunset"), sun("sunset", 300, 96, 44), `<rect y="160" width="400" height="80" fill="#2b86a8"/>`, marshGrass(168, "#7bc043"), sportfisher(170, 196, 1, "#fff8e6", "#ff3d8b"), `<g transform="translate(330 196) rotate(-35)">${bigFish(0, 0, 0.42, "#c2694a", "#ffd9b8")}</g>`, splash(330, 210)].join(""),
  "Fine Catch Fishing Charters": () => [sky("coral"), sun("coral", 80, 66, 30), sea(170), sportfisher(260, 196, 0.8, "#fff8e6", "#2456b8"), `<path d="M240 120 Q160 110 120 150" stroke="#fff" stroke-width="1.5" fill="none"/>`, `<g transform="translate(110 170) rotate(-20)">${bigFish(0, 0, 0.55, "#4a6a5a", "#cfe0c8")}</g>`, splash(110, 186), bird(320, 50)].join(""),
  "Shark Wake Park": () => [sky("aqua"), sun("aqua", 330, 50, 24), `<rect y="150" width="400" height="90" fill="#3fb8d6"/><path d="M0 170 Q120 160 240 172 T400 166" stroke="#bff0ea" stroke-width="4" fill="none"/>`, `<rect x="40" y="40" width="10" height="140" fill="#d7dde6"/><rect x="350" y="40" width="10" height="140" fill="#d7dde6"/><path d="M45 44 L355 44" stroke="#161b2a" stroke-width="2"/><path d="M220 44 L200 150" stroke="#161b2a" stroke-width="1.5"/>`, wakeboarder(200, 168), inflatables(90, 206)].join(""),
  "Action Water Sportz": () => [sky("golden"), sun("golden", 310, 70, 34), `<rect y="150" width="400" height="90" fill="#2b86a8"/><path d="M0 162 H400" stroke="#2f9e6b" stroke-width="12"/>`, palm(30, 158, 0.6), palm(380, 158, 0.6), pontoon(170, 200, 1), jetski(310, 214, 0.6, "#ff7a59")].join(""),
  "Inlet Point Plantation": () => [sky("sunset"), sun("sunset", 120, 100, 46), sea(160), sand(186), horse(240, 200, 1.1), horse(330, 206, 0.8, "#5a3a1f"), bird(80, 50)].join(""),
  "Great Escapes Kayaking Expeditions": () => [sky("dawn"), sun("dawn", 300, 70, 30), `<rect y="150" width="400" height="90" fill="#3fb8d6"/>`, `<ellipse cx="320" cy="152" rx="110" ry="14" fill="#f2dfb4"/>`, marshGrass(158, "#7bc043"), sup(130, 196, 1, "#ff3d8b"), sup(210, 206, 0.8, "#ffb627"), kayak(320, 214, 0.7, "#00b3a6")].join(""),
  "Visit Murrells Inlet Cruises & Tours": () => [sky("pastel"), sun("pastel", 90, 64, 28), `<rect y="160" width="400" height="80" fill="#5fb8c6"/>`, marshGrass(168, "#7bc043"), pontoon(190, 204, 0.9, "#ffb627"), crane(330, 196, 0.8), shells(70, 220)].join(""),
  "Wild Woods Farm": () => [sky("golden"), sun("golden", 330, 60, 30), grass(190, "#7bc043", "#5aa34a"), `<path d="M0 170 H400" stroke="#a0642f" stroke-width="4"/><g fill="#a0642f">${[20, 100, 180, 260, 340].map((px) => `<rect x="${px}" y="160" width="6" height="30"/>`).join("")}</g>`, llama(130, 206, 1), oak(300, 196, 0.8), sloth(300, 116, 0.8), goat(220, 214, 0.7)].join(""),
  "EdVenture Myrtle Beach": () => [`<rect width="400" height="240" fill="#2a0f3a"/>`, `<g opacity=".9"><circle cx="70" cy="50" r="24" fill="#ffb627"/><circle cx="330" cy="70" r="18" fill="#00b3a6"/><circle cx="250" cy="34" r="10" fill="#ff3d8b"/></g>`, floor(190, "#3a1640"), blocks(160, 196), slide(300, 196)].join(""),
  "Interactive Experience Unleashed": () => [`<rect width="400" height="240" fill="#14082e"/>`, `<g stroke="#00e5cc" stroke-width="1.5" opacity=".45">${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 50} 240 L200 120"/>`).join("")}${[150, 170, 196, 230].map((y) => `<path d="M0 ${y} H400"/>`).join("")}</g>`, `<g opacity=".85">${dino(220, 160, 0.9, "#00e5cc", "#7fffee")}</g>`, `<g fill="#ff3d8b">${[60, 340].map((x) => `<path d="M${x} 60 l8 -14 l8 14 l-8 14z"/>`).join("")}</g>`, vr(90, 190, 0.5)].join(""),
  "Myrtle Beach Pinball Museum": () => [`<rect width="400" height="240" fill="#22103a"/>`, lights(20, ["#ffd24a", "#ff3d8b", "#00e5cc"]), pinball(200, 214, 1), star(70, 80, 16), star(330, 90, 12, "#00e5cc"), floor(214, "#160828")].join(""),
  "Ripley's Believe It or Not!": () => [sky("plum"), moonCr(330, 50, 20), `<rect y="186" width="400" height="54" fill="#3a1640"/>`, curioShelf(200, 190), star(60, 60, 12), star(110, 100, 8, "#00e5cc")].join(""),
  "Myrtle Beach Art Museum": () => [sky("aqua"), sun("aqua", 330, 54, 24), sea(160), sand(200), easel(180, 216), palette(300, 214), cloud(90, 40)].join(""),
  "Wheels of Yesteryear": () => [sky("sunset"), sun("sunset", 300, 80, 40), `<rect y="176" width="400" height="64" fill="#3a2a4a"/><path d="M0 196 H400" stroke="#ffd24a" stroke-width="3" stroke-dasharray="26 18"/>`, muscleCar(190, 200, 1, "#ff7a1e"), `<g fill="#fff8e6" opacity=".7"><rect x="30" y="140" width="40" height="36"/><rect x="330" y="130" width="50" height="46"/></g>`].join(""),
  "Historic Myrtle Beach Colored School Museum": () => [sky("dawn"), sun("dawn", 90, 70, 30), grass(196, "#2f9e6b", "#1f7a52"), schoolhouse(220, 200, 1), oak(70, 200, 0.9), books(340, 214)].join(""),
  "Serial Killers: The Experience": () => [`<rect width="400" height="240" fill="#1a1a24"/>`, spot(200), `<rect x="100" y="70" width="200" height="140" rx="6" fill="#c9a05a"/><rect x="100" y="60" width="80" height="16" rx="4" fill="#c9a05a"/><rect x="118" y="88" width="90" height="70" fill="#fff8e6"/>`, fingerprint(250, 130), `<path d="M0 214 L400 186" stroke="#ffd24a" stroke-width="16"/><g fill="#161b2a">${Array.from({ length: 10 }, (_, i) => `<path d="M${i * 44} ${214 - i * 3.1 - 6} l14 0 l-10 12 l-14 0z"/>`).join("")}</g>`].join(""),
};
const stringLightsLow = () => lights(40);

// Theaters: each one gets its own curtain colour and its own centre prop, so the
// Live Shows list doesn't read as eight copies of the same stage.
const tCurtain = ([back, valance, drape]) =>
  `<rect width="400" height="240" fill="${back}"/><path d="M0 0 H400 V30 Q380 44 360 30 Q340 44 320 30 Q300 44 280 30 Q260 44 240 30 Q220 44 200 30 Q180 44 160 30 Q140 44 120 30 Q100 44 80 30 Q60 44 40 30 Q20 44 0 30Z" fill="${valance}"/><path d="M0 30 Q50 120 0 240 H40 Q90 120 40 30Z" fill="${drape}"/><path d="M400 30 Q350 120 400 240 H360 Q310 120 360 30Z" fill="${drape}"/><rect y="196" width="400" height="44" fill="#2a1a12"/>`;
const CURTAINS = {
  red: ["#4a0f2a", "#c2184f", "#8e0f3a"],
  blue: ["#0e1f45", "#2456b8", "#173a80"],
  green: ["#0d3326", "#1f8a5a", "#15623f"],
  purple: ["#2a1046", "#7a2fc2", "#561f8c"],
  gold: ["#2b1d08", "#d49a1e", "#9a6a10"],
  teal: ["#06303a", "#1497a8", "#0d6d7a"],
  navy: ["#0b1430", "#e2a52a", "#1d2c5c"],
  orange: ["#3a1606", "#e8692a", "#b04a14"],
  silver: ["#1c1f26", "#9aa6b8", "#5c6678"],
};
const note = (x, y, s = 1, c = "#ffd24a") => `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}"><ellipse cx="0" cy="0" rx="9" ry="7" transform="rotate(-20)"/><rect x="6" y="-36" width="4" height="36"/><path d="M10 -36 Q24 -30 22 -16 Q18 -26 10 -26Z"/></g>`;
const THEATER_PROPS = {
  // country music variety: fiddle + banjo-ish guitar
  "carolina opry": () => `<g transform="translate(200 196)"><path d="M-60 0 Q-60 -80 0 -80 Q60 -80 60 0Z" fill="#a0642f"/><circle cy="-40" r="14" fill="#161b2a"/><rect x="40" y="-130" width="10" height="90" fill="#8a5a2b"/></g>${note(96, 120)}${note(304, 104, 0.8)}`,
  // music, comedy, storytelling: stool and a mic in a single spotlight
  "greg rowles legacy theatre": () => `<g transform="translate(170 196)"><rect x="-22" y="-62" width="44" height="8" rx="3" fill="#ffd24a"/><path d="M-16 -54 L-24 0 M16 -54 L24 0 M-20 -24 H20" stroke="#ffd24a" stroke-width="5" fill="none"/></g>${mic(250, 136, 0.9)}`,
  // Motown / Elvis tributes: spinning record
  "gts theatre": () => `<g transform="translate(200 130)"><circle r="62" fill="#0b0f14"/><circle r="50" fill="none" stroke="#2a3040" stroke-width="2"/><circle r="38" fill="none" stroke="#2a3040" stroke-width="2"/><circle r="20" fill="#ff3d8b"/><circle r="4" fill="#0b0f14"/></g>${note(86, 130)}${note(318, 116, 0.9, "#00e5cc")}`,
  // tribute singers: performer at a mic
  "legends in concert": () => `<g transform="translate(200 200)"><path d="M-30 0 V-64 Q-30 -88 0 -88 Q30 -88 30 -64 V0Z" fill="#fff8e6"/><circle cy="-104" r="14" fill="#ffd1a8"/><path d="M-14 -112 Q0 -132 16 -112 Q10 -120 0 -120 Q-10 -120 -14 -112Z" fill="#161b2a"/><path d="M-30 -60 L30 -60 M-26 -40 L26 -40" stroke="#ffd24a" stroke-width="4"/></g>${mic(296, 140, 0.8)}`,
  // community theatre: comedy and tragedy masks
  "strand theater": () => `<g transform="translate(150 130)">${mask(0, 0, 1.2)}</g><g transform="translate(250 136) rotate(12)"><path d="M-34 -30 Q-34 -50 0 -50 Q34 -50 34 -30 Q34 8 0 26 Q-34 8 -34 -30Z" fill="#c9d3e6"/><path d="M-22 -22 q8 -8 16 0 q-8 6 -16 0z M6 -22 q8 -8 16 0 q-8 6 -16 0z" fill="#161b2a"/><path d="M-18 8 Q0 -8 18 8" stroke="#161b2a" stroke-width="4" fill="none"/></g>`,
  // family magic and comedy: fanned playing cards and a wand
  "the asher theatre": () => `<g transform="translate(200 176)">${[-30, -10, 10, 30].map((a, i) => `<g transform="rotate(${a})"><rect x="-22" y="-96" width="44" height="64" rx="5" fill="#fff8e6"/><path d="M0 -${76 - (i % 2) * 2} l8 12 -8 12 -8 -12Z" fill="${i % 2 ? "#161b2a" : "#c2184f"}"/></g>`).join("")}</g><g transform="translate(300 90) rotate(-35)"><rect x="-4" y="0" width="8" height="70" fill="#161b2a"/><rect x="-4" y="0" width="8" height="12" fill="#fff"/></g>${star(318, 72, 10)}`,
};
const THEATER_CURTAIN = {
  "alabama theatre": "orange",
  "carolina opry": "blue",
  "greg rowles legacy theatre": "green",
  "gts theatre": "purple",
  "legends in concert": "gold",
  "strand theater": "teal",
  "the asher theatre": "navy",
  "charles bach wonders theatre": "silver",
};
function theaterOverride(item) {
  const key = (item.name || "").toLowerCase().trim();
  if (!(key in THEATER_CURTAIN)) return null;
  const c = CURTAINS[THEATER_CURTAIN[key]];
  // keep the existing magic/cirque/piano props where they already work; swap only the curtain
  const base = { "alabama theatre": "tribute", "charles bach wonders theatre": "magic" }[key];
  if (base) return null;
  const prop = THEATER_PROPS[key];
  return [tCurtain(c), spot(200), prop(), star(64, 70, 12), star(336, 70, 12)].join("");
}
// Re-colour curtains on scenes that keep their built-in prop.
function recolour(body, item) {
  const key = (item.name || "").toLowerCase().trim();
  const name = THEATER_CURTAIN[key];
  if (!name) return body;
  const [b, v, d] = CURTAINS[name];
  return body.replaceAll("#4a0f2a", b).replaceAll("#c2184f", v).replaceAll("#8e0f3a", d);
}

// Several scenes ignore the per-listing random seed, so listings sharing a theme
// (all the wineries, all the beach clubs...) came out pixel-identical. Give every
// listing that shares a family of themes its own variant: a colour shift (reads as a
// different time of day) and/or a mirrored layout. Builds walk listings in a fixed
// order, so the result is stable from build to build.
const _themeCount = new Map();
const LIGHT_SKIES = [
  ["#ff7a59", "#ffc46b", "#ffe9a8"], // sunset
  ["#5fcfe6", "#bff0ea", "#f6efd2"], // day
  ["#ffb3a0", "#ffd9a0", "#bfede6"], // dawn
  ["#f29b4a", "#ffd27a", "#fff1c9"], // golden hour
  ["#8fa8f0", "#ffc2d6", "#ffe9c7"], // pastel evening
  ["#3fb8d6", "#9fe6e8", "#fff4d6"], // bright noon
  ["#ff6f7d", "#ffb08a", "#ffe3b0"], // coral
];
const DARK_SKIES = [
  ["#18365a", "#e0527a", "#ffb35c"], // dusk
  ["#0b1f3a", "#2a3f7a", "#7a5fc9"], // night
  ["#12062b", "#5b1a6e", "#ff3d8b"], // neon
  ["#2a0f3a", "#8a2f6e", "#ff9a5c"], // plum
  ["#1a1240", "#3b5bb0", "#f2a65a"], // late dusk
];
const DARK_BACKDROPS = ["#14082e", "#2a0f3a", "#3a1022", "#22103a", "#3a1606", "#1a1240", "#2a0f22"];
const lum = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
};
function varyWithinTheme(body, theme) {
  const family = theme.split(":")[0];
  const k = _themeCount.get(family) || 0;
  _themeCount.set(family, k + 1);
  if (k === 0) return body;
  let out = body;
  const m = out.match(/<linearGradient id="sk"[^>]*><stop offset="0" stop-color="(#[0-9a-fA-F]{6})"\/><stop offset="\.62" stop-color="(#[0-9a-fA-F]{6})"\/><stop offset="1" stop-color="(#[0-9a-fA-F]{6})"\/>/);
  if (m) {
    const list = lum(m[1]) < 110 ? DARK_SKIES : LIGHT_SKIES;
    const cur = list.findIndex((g) => g[0].toLowerCase() === m[1].toLowerCase());
    const g = list[((cur < 0 ? 0 : cur) + k) % list.length];
    out = out.replace(m[0], `<linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${g[0]}"/><stop offset=".62" stop-color="${g[1]}"/><stop offset="1" stop-color="${g[2]}"/>`);
  } else {
    // indoor scenes: swap the backdrop colour
    const bm = out.match(/^<rect width="400" height="240" fill="(#[0-9a-fA-F]{6})"\/>/);
    if (bm) out = out.replace(bm[0], `<rect width="400" height="240" fill="${DARK_BACKDROPS[k % DARK_BACKDROPS.length]}"/>`);
  }
  return k % 2 ? `<g transform="matrix(-1 0 0 1 400 0)">${out}</g>` : out;
}

// ---------- Added Nov 6: golf courses and beaches ----------
const flipSvg = (svg) => `<g transform="translate(400 0) scale(-1 1)">${svg}</g>`;
const pine = (x, y, s = 1, c = "#1f5e46") =>
  `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-3" y="-20" width="6" height="20" fill="#7a4e2a"/><path d="M0 -92 L18 -52 H8 L24 -24 H-24 L-8 -52 H-18Z" fill="${c}"/></g>`;
const bunker = (x, y, rx = 30, ry = 8, c = "#f4e2b8") => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}"/>`;
const pond = (x, y, rx = 60, ry = 12, c = "#3fb8d6") => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}"/><ellipse cx="${x - rx * 0.3}" cy="${y - 2}" rx="${rx * 0.35}" ry="2" fill="#fff" opacity=".5"/>`;
const puttGreen = (x, y, rx = 60, ry = 14, c = "#4cc77f") => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}"/><ellipse cx="${x + rx * 0.35}" cy="${y + 1}" rx="7" ry="3" fill="#0b3a53"/>`;
const cart = (x, y, s = 1, c = "#fff8e6") => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-22" y="-26" width="44" height="4" fill="${c}"/><rect x="-18" y="-24" width="3" height="16" fill="#c9d3e6"/><rect x="15" y="-24" width="3" height="16" fill="#c9d3e6"/><rect x="-22" y="-10" width="44" height="10" rx="3" fill="${c}"/><circle cx="-12" cy="2" r="5" fill="#161b2a"/><circle cx="12" cy="2" r="5" fill="#161b2a"/></g>`;
const seaOats = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" stroke="#c9a05a" stroke-width="2" fill="none"><path d="M0 0 q-4 -20 -10 -34"/><path d="M4 0 q2 -22 8 -36"/><path d="M-4 0 q-10 -14 -22 -22"/></g><g transform="translate(${x} ${y}) scale(${s})" fill="#e0b862"><ellipse cx="-10" cy="-36" rx="3" ry="6"/><ellipse cx="12" cy="-38" rx="3" ry="6"/><ellipse cx="-22" cy="-24" rx="3" ry="6"/></g>`;
const lifeguard = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" stroke="#fff8e6" stroke-width="5"><line x1="-16" y1="0" x2="-8" y2="-50"/><line x1="16" y1="0" x2="8" y2="-50"/><line x1="-12" y1="-24" x2="12" y2="-24"/></g><g transform="translate(${x} ${y}) scale(${s})"><rect x="-16" y="-62" width="32" height="12" fill="#ff3d8b"/><path d="M-22 -62 L0 -80 L22 -62Z" fill="#ff7a59"/></g>`;
const shell = (x, y, s = 1, c = "#ffd2c2") => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-10 0 Q0 -18 10 0Z" fill="${c}"/><path d="M-6 0 L0 -12 L6 0" stroke="#e8a48e" stroke-width="1.5" fill="none"/></g>`;

S.golf = (r, o = {}) => {
  const k = o.sky || pick(r, ["day", "golden", "dawn", "aqua"]);
  const parts = [sky(k), sun(k, o.sunX ?? 320, o.sunY ?? 64, 30), cloud(o.cloudX ?? 90, 46)];
  if (o.ocean) parts.push(sea(150));
  if (o.waterway) parts.push(`<rect y="150" width="400" height="22" fill="#3fa7c4"/>`);
  parts.push(hills(o.hillY ?? 158, o.hill || "#2e8f6b", 0.55), grass(176, o.g1 || "#35b36f", o.g2 || "#2a9a5c"));
  if (o.marsh) parts.push(`<path d="M0 190 Q100 178 200 192 T400 186 V202 H0Z" fill="#c9b36a"/>`, pond(330, 206, 70, 9, "#4aa8c0"));
  if (o.pond) parts.push(pond(o.pondX ?? 120, 212, o.pondR ?? 64));
  parts.push(puttGreen(o.greenX ?? 250, o.greenY ?? 202, o.greenR ?? 64));
  (o.bunkers || [[170, 214]]).forEach(([x, y, rx]) => parts.push(bunker(x, y, rx || 26)));
  parts.push(flag((o.greenX ?? 250) + (o.greenR ?? 64) * 0.35, (o.greenY ?? 202) + 1, o.flag || "#ff3d8b"));
  (o.trees || []).forEach(([t, x, y, s2]) => parts.push(t === "palm" ? palm(x, y, s2) : t === "oak" ? oak(x, y, s2) : pine(x, y, s2)));
  if (o.extra) parts.push(o.extra);
  if (o.ball !== false) parts.push(ball(o.ballX ?? 150, 222, 6, "#fff"));
  const svg = parts.join("");
  return o.flip ? flipSvg(svg) : svg;
};

S.beachtown = (r, o = {}) => {
  const k = o.sky || pick(r, ["day", "sunset", "aqua"]);
  const parts = [sky(k), sun(k, o.sunX ?? 300, o.sunY ?? 70, 34), cloud(o.cloudX ?? 80, 50), sea(o.seaY ?? 150), sand(o.sandY ?? 192)];
  if (o.extra) parts.push(o.extra);
  const svg = parts.join("");
  return o.flip ? flipSvg(svg) : svg;
};

const golfScenes = {
  "TPC Myrtle Beach": { sky: "golden", trees: [["pine", 50, 186, 1], ["pine", 84, 190, 0.8], ["oak", 360, 190, 1]], pond: true, pondX: 110, extra: `<g transform="translate(330 120)"><path d="M-14 -30 H14 V-14 Q14 4 0 6 Q-14 4 -14 -14Z" fill="#ffd24a"/><rect x="-4" y="6" width="8" height="12" fill="#d4a017"/><rect x="-14" y="18" width="28" height="6" fill="#a0642f"/></g>`, flag: "#0b3a53" },
  "Barefoot Resort – Dye Course": { sky: "dawn", trees: [["pine", 360, 188, 1.1], ["pine", 330, 192, 0.8]], bunkers: [[120, 212, 50], [200, 222, 20]], extra: `<g fill="#6b4a2f">${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${196 + i * 18}" y="208" width="14" height="6"/>`).join("")}</g>`, greenX: 260, flag: "#ff7a59" },
  "Barefoot Resort – Love Course": { sky: "pastel", trees: [["oak", 60, 190, 1], ["palm", 350, 188, 0.9]], extra: `<g transform="translate(150 120)"><rect x="-30" y="-30" width="60" height="40" fill="#e7d4b5"/><path d="M-34 -30 L0 -52 L34 -30Z" fill="#a0642f"/><rect x="-20" y="-20" width="8" height="30" fill="#bfa58a"/><rect x="12" y="-20" width="8" height="30" fill="#bfa58a"/></g>`, flag: "#ff3d8b" },
  "Barefoot Resort – Fazio Course": { sky: "aqua", hill: "#3f9e74", hillY: 130, trees: [["pine", 40, 184, 1], ["pine", 70, 188, 0.7]], bunkers: [[150, 214, 30], [320, 216, 22]], greenX: 230, flag: "#ffb627", flip: true },
  "Barefoot Resort – Norman Course": { sky: "sunset", waterway: true, trees: [["palm", 60, 186, 1]], extra: boat(320, 166, 0.7), greenX: 220, flag: "#0b3a53" },
  "Myrtle Beach National – King's North": { sky: "day", pond: true, pondX: 220, pondR: 120, greenX: 220, greenY: 206, greenR: 40, bunkers: [[300, 222, 18]], trees: [["pine", 50, 188, 1], ["pine", 360, 186, 0.9]], extra: `<g transform="translate(90 120)"><rect x="-14" y="-18" width="28" height="36" rx="4" fill="#fff"/><circle cx="-6" cy="-8" r="3" fill="#0b3a53"/><circle cx="6" cy="8" r="3" fill="#0b3a53"/><circle cx="0" cy="0" r="3" fill="#0b3a53"/></g>`, flag: "#ff3d8b" },
  "Pine Lakes Country Club": { sky: "golden", trees: [["pine", 40, 186, 1.1], ["pine", 360, 188, 1]], extra: `<g transform="translate(110 150)"><rect x="-40" y="-36" width="80" height="40" fill="#fff8e6"/><rect x="-46" y="-40" width="92" height="6" fill="#8e1b3a"/>${[-30, -12, 6, 24].map((x) => `<rect x="${x}" y="-30" width="8" height="34" fill="#f0e2c8"/>`).join("")}<rect x="-6" y="-60" width="12" height="20" fill="#fff8e6"/><path d="M-9 -60 L0 -72 L9 -60Z" fill="#8e1b3a"/></g>`, greenX: 270, flag: "#8e1b3a" },
  "Dunes Golf & Beach Club": { sky: "aqua", ocean: true, trees: [["palm", 360, 186, 1]], extra: seaOats(60, 196, 1.2), bunkers: [[150, 218, 40]], greenX: 250, flag: "#ffb627" },
  "Grande Dunes Golf Club": { sky: "dusk", waterway: true, extra: `<path d="M0 168 Q200 110 400 168" stroke="#fff8e6" stroke-width="6" fill="none"/>${[60, 120, 180, 240, 300, 340].map((x) => `<line x1="${x}" y1="${168 - Math.sin((x / 400) * Math.PI) * 52}" x2="${x}" y2="168" stroke="#fff8e6" stroke-width="2"/>`).join("")}`, trees: [["palm", 50, 188, 0.8]], greenX: 240, flag: "#00e5cc" },
  "Arcadian Shores Golf Club": { sky: "coral", ocean: true, extra: seaOats(330, 194, 1) + seaOats(360, 196, 0.8), trees: [["oak", 60, 190, 0.9]], bunkers: [[170, 216, 34], [220, 226, 16]], greenX: 220, flag: "#0b3a53", flip: true },
  "Prestwick Country Club": { sky: "golden", pond: true, pondX: 300, pondR: 80, greenX: 170, extra: `<rect x="96" y="200" width="148" height="10" fill="#6b4a2f"/>`, bunkers: [[90, 222, 18], [250, 224, 18]], trees: [["pine", 370, 186, 0.9]], flag: "#ff7a59" },
  "Legends Resort – Moorland Course": { sky: "plum", hill: "#5a3f6e", g1: "#4a9e5f", g2: "#3a8550", bunkers: [[100, 212, 18], [140, 222, 14], [180, 214, 16], [320, 220, 22]], extra: `<ellipse cx="320" cy="220" rx="12" ry="5" fill="#d6c08f"/>`, greenX: 240, flag: "#ffd24a" },
  "Long Bay Golf Club": { sky: "pastel", trees: [["pine", 60, 186, 0.9], ["oak", 340, 190, 1.1]], pond: true, pondX: 140, pondR: 70, extra: `<text x="200" y="70" font-family="Georgia,serif" font-size="22" fill="#fff" opacity=".85" text-anchor="middle" font-weight="bold">18</text>`, greenX: 270, flag: "#ff3d8b", flip: true },
  "True Blue Golf Club": { sky: "dawn", marsh: true, trees: [["oak", 70, 188, 1.3], ["pine", 360, 184, 1]], bunkers: [[200, 222, 60]], greenX: 220, greenY: 198, flag: "#3f7fd6" },
  "Pawleys Plantation Golf Club": { sky: "sunset", marsh: true, trees: [["oak", 330, 188, 1.2]], extra: `<g fill="#6b4a2f">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${40 + i * 22}" y="186" width="18" height="4"/>`).join("")}</g>`, greenX: 200, flag: "#ffb627", flip: true },
  "Wachesaw East Golf Club": { sky: "golden", trees: [["oak", 50, 188, 1.1], ["oak", 110, 190, 0.8], ["pine", 360, 186, 1]], extra: house(250, 168, 0.55, "#fff8e6", "#4a6e8a"), greenX: 200, greenY: 210, flag: "#ff3d8b", ball: false },
};
const beachScenes = {
  "Myrtle Beach": { sky: "day", extra: ferris(320, 150, 0.5) + `<rect y="176" width="400" height="8" fill="#a0642f"/>` + sunbrella(110, 214, 1) + sunbrella(190, 218, 0.8, "#ffb627"), sunX: 80, cloudX: 220 },
  "North Myrtle Beach & Cherry Grove": { sky: "sunset", extra: pier(176) + `<text x="300" y="110" font-family="Georgia,serif" font-size="22" fill="#fff" font-style="italic" opacity=".9">shag</text>` + sunbrella(90, 220, 0.9, "#00e5cc") },
  "Surfside Beach": { sky: "aqua", extra: lifeguard(120, 214, 1) + sunbrella(250, 220, 0.9, "#ff7a59") + ball(310, 226, 9, "#ffd24a") + shell(60, 228), flip: true },
  "Garden City Beach": { sky: "dawn", extra: pier(172) + `<g transform="translate(110 222)"><path d="M0 0 q20 -30 46 -40" stroke="#5a3a1f" stroke-width="3" fill="none"/><line x1="46" y1="-40" x2="60" y2="0" stroke="#fff" stroke-width="1"/></g>` + fish(300, 120, 0.7), sunX: 90, cloudX: 260 },
  "Litchfield Beach": { sky: "pastel", extra: seaOats(60, 196, 1.3) + seaOats(110, 200, 1) + seaOats(340, 198, 1.2) + shell(220, 226, 1.2) + bird(260, 90) + bird(290, 76, 0.8) },
  "Pawleys Island": { sky: "golden", extra: hammock(200, 200, 1) + oak(60, 196, 1) + oak(350, 196, 0.9) + `<rect x="140" y="140" width="40" height="22" fill="#fff8e6" opacity=".9"/><path d="M136 140 L160 126 L184 140Z" fill="#8a5a2b"/>`, flip: true },
};
for (const [n, o] of Object.entries(golfScenes)) CUSTOM[`golf/${n}`] = () => S.golf(rng(hash(n)), o);
for (const [n, o] of Object.entries(beachScenes)) CUSTOM[`beaches/${n}`] = () => S.beachtown(rng(hash(n)), o);

export function artSvg(item, catSlug) {
  const theme = detect(item, catSlug);
  const r = rng(hash(`${catSlug}/${item.name}`));
  let body;
  try {
    const own = CUSTOM[`${catSlug}/${item.name}`] || CUSTOM[item.name];
    const custom = (own && own()) || (catSlug === "live-shows" && theaterOverride(item));
    body = custom || recolour(scene(theme, r), item);
    if (!custom) body = varyWithinTheme(body, theme);
  } catch {
    body = S.putting(r, {});
  }
  // ids inside each svg are namespaced by being inlined as an <img>, so no clashes.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${(item.name || "").replace(/[<>&"]/g, "")}">${body}</svg>`;
}
export const themeFor = detect;
