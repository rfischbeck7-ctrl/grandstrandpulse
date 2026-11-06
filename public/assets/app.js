// "Open now" badges, worked out in Myrtle Beach time (Eastern) from each listing's weekly hours.
(function () {
  const badges = document.querySelectorAll(".open-badge[data-hours]");
  const rows = document.querySelectorAll(".hours-table tr[data-day]");
  if (!badges.length && !rows.length) return;
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  function nowEastern() {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23" })
      .formatToParts(new Date())
      .reduce((o, p) => ((o[p.type] = p.value), o), {});
    return { day: DAYS.indexOf(parts.weekday), min: (+parts.hour % 24) * 60 + +parts.minute };
  }
  function fmt(min) {
    const m = ((min % 1440) + 1440) % 1440;
    if (m === 0) return "midnight";
    if (m === 720) return "noon";
    const h = Math.floor(m / 60), mm = m % 60;
    return `${h % 12 || 12}${mm ? ":" + String(mm).padStart(2, "0") : ""} ${h < 12 ? "AM" : "PM"}`;
  }
  function status(week, now) {
    const today = week[now.day] || [];
    const yesterday = week[(now.day + 6) % 7] || [];
    for (const [o, c] of yesterday) if (c > 1440 && now.min < c - 1440) return { open: true, until: c - 1440 };
    for (const [o, c] of today) if (now.min >= o && now.min < c) return { open: true, until: c, allDay: o === 0 && c >= 1440 };
    for (const [o] of today) if (o > now.min) return { open: false, next: `opens ${fmt(o)}` };
    for (let i = 1; i <= 7; i++) {
      const day = week[(now.day + i) % 7] || [];
      if (day.length) return { open: false, next: `opens ${i === 1 ? "tomorrow" : DAYS[(now.day + i) % 7]} ${fmt(day[0][0])}` };
    }
    return { open: false, next: "" };
  }
  function paint() {
    const now = nowEastern();
    badges.forEach((b) => {
      let week;
      try { week = JSON.parse(b.dataset.hours); } catch (e) { return; }
      const st = status(week, now);
      b.dataset.open = st.open ? "1" : "0";
      b.classList.toggle("is-open", st.open);
      b.classList.toggle("is-soon", st.open && !st.allDay && st.until - now.min <= 60 && st.until - now.min > 0);
      b.textContent = st.open
        ? st.allDay ? "Open 24 hours" : `Open now · until ${fmt(st.until)}`
        : `Closed${st.next ? " · " + st.next : ""}`;
      b.hidden = false;
    });
    rows.forEach((r) => r.classList.toggle("is-today", +r.dataset.day === now.day));
    document.dispatchEvent(new Event("mbc:hours"));
  }
  paint();
  setInterval(paint, 60000);
})();

// Search and filters for category pages. Everything works without JavaScript too:
// with JS off, every listing is simply shown.
(function () {
  const finder = document.querySelector(".finder");
  if (!finder) return;

  const slug = (s) => s.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const items = [...document.querySelectorAll(".listing")];
  const pins = [...document.querySelectorAll("#coast-filter .pin")];
  const groups = [...document.querySelectorAll(".chips")];
  const q = document.getElementById("q");
  const count = document.getElementById("count");
  const empty = document.getElementById("empty");
  const noun = { one: finder.dataset.nounOne, many: finder.dataset.nounMany };

  const openBtn = document.getElementById("open-now");
  const state = { areas: new Set(), q: "", chips: {}, open: false };
  groups.forEach((g) => (state.chips[g.dataset.filter] = new Set()));

  // Read filters from the address bar, e.g. ?area=surfside&setting=indoor-ac
  const params = new URLSearchParams(location.search);
  (params.get("area") || "").split(",").filter(Boolean).forEach((a) => {
    const pin = pins.find((p) => slug(p.dataset.area) === a);
    if (pin && !pin.disabled) state.areas.add(pin.dataset.area);
  });
  groups.forEach((g) => {
    const key = slug(g.querySelector("legend").textContent);
    (params.get(key) || "").split(",").filter(Boolean).forEach((v) => {
      const chip = [...g.querySelectorAll(".chip")].find((c) => slug(c.dataset.value) === v);
      if (chip) state.chips[g.dataset.filter].add(chip.dataset.value);
    });
  });
  if (params.get("q")) state.q = params.get("q");
  if (params.get("open") === "now" && openBtn) state.open = true;
  if (q) q.value = state.q;

  function syncUrl() {
    const p = new URLSearchParams();
    if (state.areas.size) p.set("area", [...state.areas].map(slug).join(","));
    groups.forEach((g) => {
      const set = state.chips[g.dataset.filter];
      if (set.size) p.set(slug(g.querySelector("legend").textContent), [...set].map(slug).join(","));
    });
    if (state.q) p.set("q", state.q);
    if (state.open) p.set("open", "now");
    const s = p.toString();
    history.replaceState(null, "", s ? `?${s}` : location.pathname);
  }

  function apply() {
    const words = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    let shown = 0;
    items.forEach((li) => {
      let ok = !state.areas.size || state.areas.has(li.dataset.area);
      if (ok) {
        for (const g of groups) {
          const want = state.chips[g.dataset.filter];
          if (!want.size) continue;
          const have = (li.getAttribute("data-f-" + slug(g.dataset.filter)) || "").split("|");
          // Within one group, any selected value matches (Indoor OR Hybrid).
          if (![...want].some((v) => have.includes(v))) { ok = false; break; }
        }
      }
      if (ok && words.length) ok = words.every((w) => li.dataset.search.includes(w));
      if (ok && state.open) ok = li.querySelector(".open-badge")?.dataset.open === "1";
      li.hidden = !ok;
      if (ok) shown++;
    });
    count.textContent = `${shown} ${shown === 1 ? noun.one : noun.many}` +
      (shown === items.length ? "" : ` of ${items.length}`);
    empty.hidden = shown !== 0;
    pins.forEach((p) => p.setAttribute("aria-pressed", String(state.areas.has(p.dataset.area))));
    if (openBtn) openBtn.setAttribute("aria-pressed", String(state.open));
    groups.forEach((g) =>
      g.querySelectorAll(".chip").forEach((c) =>
        c.setAttribute("aria-pressed", String(state.chips[g.dataset.filter].has(c.dataset.value)))
      )
    );
    syncUrl();
  }

  pins.forEach((p) =>
    p.addEventListener("click", () => {
      const a = p.dataset.area;
      state.areas.has(a) ? state.areas.delete(a) : state.areas.add(a);
      apply();
    })
  );
  groups.forEach((g) =>
    g.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      const set = state.chips[g.dataset.filter];
      set.has(chip.dataset.value) ? set.delete(chip.dataset.value) : set.add(chip.dataset.value);
      apply();
    })
  );
  openBtn && openBtn.addEventListener("click", () => { state.open = !state.open; apply(); });
  // Badges refresh every minute; keep the "Open now" filter in step.
  document.addEventListener("mbc:hours", () => { if (state.open) apply(); });
  let t;
  q && q.addEventListener("input", () => {
    clearTimeout(t);
    t = setTimeout(() => { state.q = q.value.trim(); apply(); }, 120);
  });
  document.getElementById("reset").addEventListener("click", () => {
    state.areas.clear();
    Object.values(state.chips).forEach((s) => s.clear());
    state.q = "";
    state.open = false;
    if (q) q.value = "";
    apply();
    q && q.focus();
  });

  apply();
})();
