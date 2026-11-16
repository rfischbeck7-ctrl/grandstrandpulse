// Shows a live Google rating on listing pages. Fetched in the visitor's browser from the Places API (New) each time (Google's terms do not allow storing ratings).
// If the key is missing, restricted, over quota, or the request fails, nothing is shown.
(function () {
  var el = document.querySelector(".g-rating[data-pid]");
  if (!el) return;
  var url = "https://places.googleapis.com/v1/places/" + encodeURIComponent(el.dataset.pid) + "?fields=rating,userRatingCount,googleMapsUri&key=" + encodeURIComponent(el.dataset.key);
  fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (p) {
    if (!p.rating || !p.userRatingCount) return;
    var a = document.createElement("a");
    a.href = p.googleMapsUri || "https://www.google.com/maps";
    a.target = "_blank"; a.rel = "noopener";
    a.textContent = "Google Maps";
    el.textContent = "\u2605 " + p.rating.toFixed(1) + " from " + p.userRatingCount.toLocaleString("en-US") + " Google ratings. ";
    el.appendChild(a);
    el.hidden = false;
  }).catch(function () {});
})();
