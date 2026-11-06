// Reads the "Hours" field from Airtable into a weekly schedule.
//
// Format, one line per day group, 24-hour times:
//   Daily 09:00-23:00
//   Mon-Thu 16:00-22:00
//   Fri-Sat 12:00-23:00, 23:30-02:00   (several openings per day; past midnight is fine)
//   Sun Closed
//   Sat 24 hours
// Days: Mon Tue Wed Thu Fri Sat Sun, ranges (Mon-Thu, Fri-Sun), lists (Mon, Wed), or Daily / Weekdays / Weekends.
// Later lines override earlier ones for the same day, so "Daily 10:00-22:00" then "Sun Closed" works.

export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const dayIndex = (s) => {
  const i = DAYS.findIndex((d) => s.toLowerCase().startsWith(d.toLowerCase()));
  return i;
};

function parseDays(spec) {
  const s = spec.trim().toLowerCase();
  if (s === "daily" || s === "every day") return [0, 1, 2, 3, 4, 5, 6];
  if (s === "weekdays") return [1, 2, 3, 4, 5];
  if (s === "weekends") return [0, 6];
  const out = new Set();
  for (const part of s.split(/\s*,\s*|\s*&\s*/)) {
    const [a, b] = part.split(/\s*[-–]\s*/);
    const ia = dayIndex(a || "");
    if (ia < 0) throw new Error(`unknown day "${part}"`);
    if (b === undefined) { out.add(ia); continue; }
    const ib = dayIndex(b);
    if (ib < 0) throw new Error(`unknown day "${part}"`);
    for (let i = ia; ; i = (i + 1) % 7) { out.add(i); if (i === ib) break; }
  }
  return [...out];
}

const toMin = (t) => {
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!m || +m[1] > 24 || +m[2] > 59) throw new Error(`bad time "${t}"`);
  return +m[1] * 60 + +m[2];
};

function parseTimes(spec) {
  const s = spec.trim();
  if (/^closed$/i.test(s)) return [];
  if (/^(call|varies|unknown)$/i.test(s)) return null; // hours not posted for that day
  if (/^(24 hours|open 24 hours)$/i.test(s)) return [[0, 1440]];
  return s.split(/\s*,\s*/).map((range) => {
    const [a, b] = range.split(/\s*[-–]\s*/);
    const o = toMin(a);
    let c = toMin(b);
    if (c <= o) c += 1440; // closes after midnight
    return [o, c];
  });
}

// Returns an array of 7 days (Sunday first), each a list of [open, close] minutes; null if there are no hours.
// Throws on lines it can't read, so the build can warn about them.
export function parseHours(text) {
  const lines = String(text || "").split(/\n+/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return null;
  const week = Array.from({ length: 7 }, () => null);
  for (const line of lines) {
    const m = line.match(/^(.*?)\s+(closed|call|varies|unknown|24 hours|open 24 hours|\d{1,2}:\d{2}\s*[-–].*)$/i);
    if (!m) throw new Error(`can't read "${line}"`);
    const times = parseTimes(m[2]);
    for (const d of parseDays(m[1])) week[d] = times;
  }
  // A day marked "Call" stays null (hours not posted); days never mentioned count as closed.
  const said = new Set();
  for (const line of lines) {
    const m = line.match(/^(.*?)\s+(call|varies|unknown)$/i);
    if (m) for (const d of parseDays(m[1])) said.add(d);
  }
  return week.map((d, i) => (d === null && said.has(i) ? null : d || []));
}

export function fmtTime(min) {
  const m = ((min % 1440) + 1440) % 1440;
  if (m === 0) return "Midnight";
  if (m === 720) return "Noon";
  const h = Math.floor(m / 60), mm = m % 60;
  const h12 = h % 12 || 12;
  return `${h12}${mm ? ":" + String(mm).padStart(2, "0") : ""} ${h < 12 ? "AM" : "PM"}`;
}

export const fmtRanges = (ranges) =>
  ranges === null ? "Call for hours" : !ranges.length ? "Closed" : ranges.map(([o, c]) => (o === 0 && c === 1440 ? "Open 24 hours" : `${fmtTime(o)}–${fmtTime(c)}`)).join(", ");

// Rows for the hours table, Monday first: [{ day, long, index, text }]
export const weekRows = (week) =>
  [1, 2, 3, 4, 5, 6, 0].map((i) => ({ day: DAYS[i], long: LONG[i], index: i, text: fmtRanges(week[i]) }));

// schema.org openingHoursSpecification for search engines.
export const openingSpec = (week) =>
  week.flatMap((ranges, i) =>
    (ranges || []).map(([o, c]) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${LONG[i]}`,
      opens: `${String(Math.floor(o / 60)).padStart(2, "0")}:${String(o % 60).padStart(2, "0")}`,
      closes: `${String(Math.floor((c % 1440) / 60)).padStart(2, "0")}:${String(c % 60).padStart(2, "0")}`,
    }))
  );
