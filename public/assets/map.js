// Maps with Leaflet and OpenStreetMap tiles. A pin on listing pages (.osm-map) and a filterable all-places map (#all-map).
(function () {
  if (!window.L) return;
  var ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>';
  var TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

  var one = document.querySelector(".osm-map[data-lat]");
  if (one) {
    var lat = +one.dataset.lat, lon = +one.dataset.lon;
    var m = L.map(one, { scrollWheelZoom: false }).setView([lat, lon], 15);
    L.tileLayer(TILES, { maxZoom: 19, attribution: ATTR }).addTo(m);
    L.marker([lat, lon], { title: one.dataset.name }).addTo(m);
  }

  var all = document.getElementById("all-map");
  if (all) {
    var map = L.map(all, { scrollWheelZoom: false }).setView([33.72, -78.9], 10);
    L.tileLayer(TILES, { maxZoom: 19, attribution: ATTR }).addTo(map);
    var layer = L.layerGroup().addTo(map), data = [];
    var sel = document.getElementById("map-cat");
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
    function draw() {
      layer.clearLayers();
      var want = sel ? sel.value : "";
      var pts = [];
      data.forEach(function (p) {
        if (want && p.c !== want) return;
        pts.push([p.lat, p.lon]);
        L.circleMarker([p.lat, p.lon], { radius: 7, weight: 2, color: "#fff", fillColor: p.col, fillOpacity: 0.95 })
          .bindPopup('<strong><a href="' + p.u + '">' + esc(p.n) + "</a></strong><br>" + esc(p.t))
          .addTo(layer);
      });
      document.getElementById("map-count").textContent = pts.length + " places shown";
      if (pts.length > 1) map.fitBounds(pts, { padding: [24, 24] });
    }
    fetch("/map-data.json").then(function (r) { return r.json(); }).then(function (d) { data = d; draw(); });
    if (sel) sel.addEventListener("change", draw);
  }
})();
