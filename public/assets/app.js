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
    if (week[now.day] === null) return null; // today's hours aren't posted
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
      if (!st) { b.hidden = true; b.dataset.open = "0"; return; }
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
  const groups = [...document.querySelectorAll(".chips[data-filter]")];
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


// Site-wide search page.
(function () {
  const box = document.getElementById("gq");
  if (!box) return;
  const out = document.getElementById("gresults");
  const count = document.getElementById("gcount");
  let index = [];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  function run() {
    const words = box.value.toLowerCase().split(/\s+/).filter(Boolean);
    const rows = index
      .map((r) => {
        const hay = (r.n + " " + r.c + " " + r.a + " " + r.t + " " + r.d).toLowerCase();
        if (!words.every((w) => hay.includes(w))) return null;
        const nm = r.n.toLowerCase();
        const score = words.reduce((s, w) => s + (nm.includes(w) ? 3 : 0) + (r.t.toLowerCase().includes(w) ? 2 : 0), 0);
        return { r, score };
      })
      .filter(Boolean)
      .sort((x, y) => y.score - x.score || x.r.n.localeCompare(y.r.n));
    count.textContent = words.length ? rows.length + (rows.length === 1 ? " place" : " places") : index.length + " places";
    out.innerHTML = (words.length ? rows : []).slice(0, 60)
      .map(({ r }) => '<li><a href="' + r.u + '"><strong>' + esc(r.n) + '</strong><span>' + esc(r.c) + (r.t ? " · " + esc(r.t) : "") + " · " + esc(r.a) + "</span></a><p>" + esc(r.d) + "</p></li>")
      .join("");
    if (words.length && !rows.length) out.innerHTML = "<li>No matches. Try a shorter word, like <em>golf</em> or <em>beer</em>.</li>";
    try { history.replaceState(null, "", box.value ? "?q=" + encodeURIComponent(box.value) : location.pathname); } catch (e) {}
  }
  const q0 = new URLSearchParams(location.search).get("q");
  if (q0) box.value = q0;
  fetch("/search-index.json").then((r) => r.json()).then((d) => { index = d; run(); });
  box.addEventListener("input", run);
})();

// Share button on detail pages.
(function () {
  document.querySelectorAll("[data-share]").forEach((b) =>
    b.addEventListener("click", async () => {
      const data = { title: b.dataset.title, url: location.href };
      try {
        if (navigator.share) return await navigator.share(data);
        await navigator.clipboard.writeText(location.href);
        const t = b.textContent; b.textContent = "Link copied"; setTimeout(() => (b.textContent = t), 1800);
      } catch (e) {}
    })
  );
})();


// Saved places: hearts on listings, kept in this browser only (localStorage).
(function () {
  const KEY = "mbc-saved";
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } };
  const write = (v) => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const HEART = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 2.8 5 6.1 5c2 0 3.4 1.1 4.2 2.5h3.4C14.5 6.1 15.9 5 17.9 5c3.3 0 5.2 3.3 3.7 6.7C19.5 16.4 12 21 12 21z" fill="currentColor"/></svg>';
  const isSaved = (u) => read().includes(u);
  function toggle(u) {
    const l = read(); const i = l.indexOf(u);
    i >= 0 ? l.splice(i, 1) : l.unshift(u);
    write(l);
  }
  function paint(btn, u) {
    const on = isSaved(u);
    btn.setAttribute("aria-pressed", String(on));
    btn.classList.toggle("is-saved", on);
    if (btn.dataset.label) btn.querySelector(".fav-text").textContent = on ? "Saved" : "Save";
    btn.setAttribute("aria-label", (on ? "Remove from saved: " : "Save: ") + btn.dataset.name);
  }
  function make(u, name, label) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "fav" + (label ? " fav-btn btn" : ""); b.dataset.name = name;
    if (label) b.dataset.label = "1";
    b.innerHTML = HEART + (label ? '<span class="fav-text">Save</span>' : "");
    paint(b, u);
    b.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); toggle(u); paint(b, u); });
    return b;
  }
  // listing cards
  document.querySelectorAll(".listing").forEach((li) => {
    const a = li.querySelector(".listing-name a"); const media = li.querySelector(".listing-media");
    if (!a || !media) return;
    li.style.position = "relative";
    li.appendChild(make(new URL(a.getAttribute("href"), location.href).pathname, a.textContent.trim(), false));
  });
  // search results (rendered later by the search script)
  const gres = document.getElementById("gresults");
  if (gres) {
    const decorate = () => gres.querySelectorAll("li").forEach((li) => {
      const a = li.querySelector("a"); if (!a || li.querySelector(".fav")) return;
      li.style.position = "relative";
      li.appendChild(make(new URL(a.getAttribute("href"), location.href).pathname, a.querySelector("strong").textContent.trim(), false));
    });
    new MutationObserver(decorate).observe(gres, { childList: true });
    decorate();
  }
  // detail page
  const share = document.querySelector("[data-share]");
  if (share) share.parentNode.insertBefore(make(location.pathname, share.dataset.title, true), share);
  // saved page
  const out = document.getElementById("saved-results");
  if (out) {
    const note = document.getElementById("saved-note"); const clear = document.getElementById("saved-clear");
    fetch("/search-index.json").then((r) => r.json()).then((idx) => {
      const draw = () => {
        const list = read(); const rows = list.map((u) => idx.find((r) => r.u === u)).filter(Boolean);
        out.innerHTML = rows.map((r) => '<li><a href="' + r.u + '"><strong>' + esc(r.n) + '</strong><span>' + esc(r.c) + (r.t ? " · " + esc(r.t) : "") + " · " + esc(r.a) + "</span></a><p>" + esc(r.d) + "</p></li>").join("");
        clear.hidden = !rows.length;
        if (rows.length) note.textContent = rows.length + (rows.length === 1 ? " saved place" : " saved places") + ". Kept in this browser only.";
      };
      draw();
      clear.addEventListener("click", () => { write([]); draw(); note.textContent = "Nothing saved yet. Tap the heart on any listing to save it here."; });
    });
  }
})();
