// Live tides, water temperature and forecast for the /conditions/ page. Public NOAA and National Weather Service APIs (no keys).
(function () {
  var root = document.getElementById("conditions");
  if (!root) return;
  var station = root.dataset.station, lat = root.dataset.lat, lon = root.dataset.lon;
  function el(id) { return document.getElementById(id); }
  function fail(id, msg, link, label) {
    el(id).innerHTML = msg + (link ? ' <a href="' + link + '" rel="noopener">' + label + "</a>" : "");
  }
  function ymd(d) { return d.getFullYear() + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + d.getDate()).slice(-2); }
  function fmtTime(s) {
    var t = s.split(" ")[1].split(":"), h = +t[0], m = t[1], ap = h >= 12 ? "pm" : "am";
    return ((h + 11) % 12 + 1) + ":" + m + " " + ap;
  }
  function getJSON(url) {
    return fetch(url, { headers: { Accept: "application/json" } }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    });
  }

  // Tides: high and low predictions for today and tomorrow, in the station's local time
  var now = new Date(), tomorrow = new Date(now.getTime() + 86400000);
  var tideUrl = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=myrtlebeachcompass&datum=MLLW&station=" + station +
    "&time_zone=lst_ldt&units=english&interval=hilo&format=json&begin_date=" + ymd(now) + "&end_date=" + ymd(tomorrow);
  getJSON(tideUrl).then(function (j) {
    var p = j.predictions || [];
    if (!p.length) throw new Error("none");
    var today = ymd(now), html = "";
    [["Today", today], ["Tomorrow", ymd(tomorrow)]].forEach(function (d) {
      var rows = p.filter(function (x) { return x.t.replace(/-/g, "").slice(0, 8) === d[1]; });
      html += "<h3>" + d[0] + "</h3><ul class=\"cond-list\">" + rows.map(function (x) {
        return "<li><strong>" + (x.type === "H" ? "High" : "Low") + "</strong> " + fmtTime(x.t) + " <span>" + (+x.v).toFixed(1) + " ft</span></li>";
      }).join("") + "</ul>";
    });
    el("cond-tides").innerHTML = html;
  }).catch(function () {
    fail("cond-tides", "Tide times are not available right now.", "https://tidesandcurrents.noaa.gov/noaatidepredictions.html?id=" + station, "See NOAA's tide table.");
  });

  // Water temperature (latest reading)
  getJSON("https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=water_temperature&application=myrtlebeachcompass&station=" + station + "&date=latest&units=english&time_zone=lst_ldt&format=json")
    .then(function (j) {
      var d = j.data && j.data[0];
      if (!d || !d.v) throw new Error("none");
      el("cond-water").innerHTML = "<p class=\"cond-big\">" + Math.round(+d.v) + "&deg;F</p><p>Read " + fmtTime(d.t) + ".</p>";
    })
    .catch(function () {
      fail("cond-water", "No current water temperature reading.", "https://tidesandcurrents.noaa.gov/stationhome.html?id=" + station, "Station page.");
    });

  // Forecast: NWS points lookup, then the 7-day forecast
  getJSON("https://api.weather.gov/points/" + lat + "," + lon)
    .then(function (pt) { return getJSON(pt.properties.forecast); })
    .then(function (f) {
      var periods = (f.properties.periods || []).slice(0, 6);
      if (!periods.length) throw new Error("none");
      el("cond-forecast").innerHTML = "<ul class=\"cond-fc\">" + periods.map(function (p) {
        return "<li><strong>" + p.name + "</strong> <span class=\"cond-temp\">" + p.temperature + "&deg;" + p.temperatureUnit + "</span><br>" +
          p.shortForecast + (p.windSpeed ? " &middot; Wind " + p.windDirection + " " + p.windSpeed : "") + "</li>";
      }).join("") + "</ul>";
    })
    .catch(function () {
      fail("cond-forecast", "The forecast is not available right now.", "https://forecast.weather.gov/MapClick.php?lat=" + lat + "&lon=" + lon, "See the National Weather Service forecast.");
    });
})();
