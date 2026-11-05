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

  const state = { areas: new Set(), q: "", chips: {} };
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
  if (q) q.value = state.q;

  function syncUrl() {
    const p = new URLSearchParams();
    if (state.areas.size) p.set("area", [...state.areas].map(slug).join(","));
    groups.forEach((g) => {
      const set = state.chips[g.dataset.filter];
      if (set.size) p.set(slug(g.querySelector("legend").textContent), [...set].map(slug).join(","));
    });
    if (state.q) p.set("q", state.q);
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
      li.hidden = !ok;
      if (ok) shown++;
    });
    count.textContent = `${shown} ${shown === 1 ? noun.one : noun.many}` +
      (shown === items.length ? "" : ` of ${items.length}`);
    empty.hidden = shown !== 0;
    pins.forEach((p) => p.setAttribute("aria-pressed", String(state.areas.has(p.dataset.area))));
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
  let t;
  q && q.addEventListener("input", () => {
    clearTimeout(t);
    t = setTimeout(() => { state.q = q.value.trim(); apply(); }, 120);
  });
  document.getElementById("reset").addEventListener("click", () => {
    state.areas.clear();
    Object.values(state.chips).forEach((s) => s.clear());
    state.q = "";
    if (q) q.value = "";
    apply();
    q && q.focus();
  });

  apply();
})();
