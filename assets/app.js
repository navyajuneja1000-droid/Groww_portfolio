/* groww × navya — app logic (vanilla JS, hash routing) */
(function () {
  "use strict";
  var D = window.NJ, P = D.person;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var byId = {}; D.products.forEach(function (p) { byId[p.id] = p; if (p.links.length && p.cats.indexOf("live") < 0) p.cats.push("live"); });
  function host(u) { return u.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0]; }

  /* ticker symbols, the way a stock is listed */
  var TK = { reconos: "RECONOS", perfora: "PERFORA", mid: "MIDPROC", foundit: "FOUNDIT", wowworld: "WOWWORLD", routeiq: "ROUTEIQ", h2h: "H2H", prolectro: "PROLECTRO",
    "pp-routing": "PPROUTE", "pp-recon": "PPRECON", "pp-migration": "PPMIGRATE", "pp-golive": "PPGOLIVE", "pp-launches": "PPNETWORK" };
  var INI = { reconos: "Ro", perfora: "Pf", mid: "MP", foundit: "Fi", wowworld: "W!", routeiq: "RQ", h2h: "H2", prolectro: "Pl" };

  /* ---------------- storage (per-viewer convenience only) ---------------- */
  function load(k, d) { try { var v = localStorage.getItem("gxn_" + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem("gxn_" + k, JSON.stringify(v)); } catch (e) {} }
  var S = {
    watch: load("watch", []).filter(function (id) { return byId[id]; }),
    f: { sort: "rel", seller: [], prov: [], q: "" },
    mv: "all", htab: "all", rng: "1Y", opTab: "hire", role: "Product Manager", qty: 1, fltOpen: false
  };

  /* ---------------- icons ---------------- */
  function ic(d, extra) { return '<svg viewBox="0 0 24 24" aria-hidden="true"' + (extra || "") + ">" + d + "</svg>"; }
  var I = {
    search: ic('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5" stroke-linecap="round"/>'),
    mark: ic('<path d="M6 3.5h12v17l-6-4.2-6 4.2z" stroke-linejoin="round"/>'),
    bell: ic('<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0" stroke-linejoin="round"/>'),
    link: ic('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" stroke-linecap="round"/>'),
    chev: ic('<path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/>'),
    chevD: ic('<path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round"/>'),
    back: ic('<path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/>'),
    mail: ic('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5" stroke-linejoin="round"/>'),
    phone: ic('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" stroke-linejoin="round"/>'),
    linkedin: ic('<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2.5 2.5 0 0 1 5 0v4M12 10v7" stroke-linecap="round"/>'),
    doc: ic('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" stroke-linejoin="round"/><path d="M14 3v5h5M9 13h6M9 17h4" stroke-linecap="round"/>'),
    ext: ic('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" stroke-linecap="round" stroke-linejoin="round"/>'),
    globe: ic('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
    explore: ic('<path d="M3 17l5-5 4 4 8-8" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 8h5v5" stroke-linecap="round" stroke-linejoin="round"/>'),
    grid: ic('<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>'),
    pie: ic('<path d="M12 3v9h9a9 9 0 1 1-9-9z" stroke-linejoin="round"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z" stroke-linejoin="round"/>'),
    bag: ic('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>'),
    user: ic('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0" stroke-linecap="round"/>'),
    cal: ic('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M8 15l2.5 2.5L16 13" stroke-linecap="round" stroke-linejoin="round"/>'),
    x: ic('<path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/>'),
    check: ic('<path d="M5 12.5l4.5 4.5L19 7.5" stroke-linecap="round" stroke-linejoin="round"/>'),
    shield: ic('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" stroke-linejoin="round"/><path d="M8.5 12l2.5 2.5 4.5-5" stroke-linecap="round" stroke-linejoin="round"/>'),
    filter: ic('<path d="M4 6h16M7 12h10M10 18h4" stroke-linecap="round"/>'),
    share: ic('<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6"/>'),
    spark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.2 6.3L20.5 10l-6.3 2.2L12 18.5l-2.2-6.3L3.5 10l6.3-1.7z" fill="#00B386"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z" fill="#5367FF"/></svg>'
  };
  /* duotone category icons */
  function duo(a, b) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + a + b + "</svg>"; }
  var CI = {
    grid: duo('<rect x="3" y="3" width="8" height="8" rx="2" fill="#00B386"/><rect x="13" y="13" width="8" height="8" rx="2" fill="#00B386"/>', '<rect x="13" y="3" width="8" height="8" rx="2" fill="#B9C2FF"/><rect x="3" y="13" width="8" height="8" rx="2" fill="#B9C2FF"/>'),
    rupee: duo('<circle cx="12" cy="12" r="9.5" fill="#CFF2E6"/>', '<path d="M8.5 7.5h7M8.5 10.5h7M11 7.5c3.6 0 3.6 6-1 6H9l5 4" fill="none" stroke="#00916C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'),
    rocket: duo('<path d="M12 2.5c3.5 2 5 5.5 5 9.5l-2 3H9l-2-3c0-4 1.5-7.5 5-9.5z" fill="#5367FF"/>', '<circle cx="12" cy="9.5" r="2" fill="#fff"/><path d="M9.5 17.5l2.5 4 2.5-4z" fill="#00B386"/>'),
    store: duo('<path d="M4 9.5h16V20H4z" fill="#CFF2E6"/>', '<path d="M3 9.5L5 4h14l2 5.5a2.5 2.5 0 0 1-4.5 1.5 2.5 2.5 0 0 1-4.5 0 2.5 2.5 0 0 1-4.5 0A2.5 2.5 0 0 1 3 9.5z" fill="#00B386"/><rect x="10" y="14" width="4" height="6" fill="#00916C"/>'),
    tag: duo('<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z" fill="#B9C2FF"/>', '<circle cx="7.5" cy="7.5" r="1.8" fill="#5367FF"/><path d="M11 13.5h5" stroke="#5367FF" stroke-width="1.8" stroke-linecap="round"/>'),
    flow: duo('<rect x="2.5" y="4" width="7" height="6" rx="1.5" fill="#00B386"/><rect x="14.5" y="14" width="7" height="6" rx="1.5" fill="#5367FF"/>', '<path d="M6 10v4a3 3 0 0 0 3 3h5.5" fill="none" stroke="#7C7E8C" stroke-width="1.6" stroke-linecap="round"/>'),
    live: duo('<rect x="2.5" y="4" width="19" height="13" rx="2" fill="#CFF2E6"/>', '<path d="M5.5 13l3-3 2.5 2.5 4-4.5 3.5 3.5" fill="none" stroke="#00916C" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 20.5h8" stroke="#00916C" stroke-width="1.8" stroke-linecap="round"/>'),
    fund: duo('<circle cx="12" cy="12" r="9.5" fill="#E4E7FF"/>', '<path d="M12 2.5V12h9.5A9.5 9.5 0 0 0 12 2.5z" fill="#5367FF"/><path d="M12 12l-6.7 6.7A9.5 9.5 0 0 0 21.5 12z" fill="#00B386"/>'),
    brief: duo('<rect x="3" y="7" width="18" height="13" rx="2" fill="#B9C2FF"/>', '<path d="M8.5 7V5a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 5v2" fill="none" stroke="#5367FF" stroke-width="1.8"/><rect x="10" y="11.5" width="4" height="3" rx=".8" fill="#5367FF"/>'),
    chat: duo('<path d="M4 5h16v11H9l-5 4z" fill="#CFF2E6"/>', '<path d="M8 9.5h8M8 12.5h5" stroke="#00916C" stroke-width="1.8" stroke-linecap="round"/>')
  };
  var lgN = 0;
  function logoSvg() {
    var n = ++lgN, g = "lgG" + n, c = "lgC" + n;
    return '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="' + g + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5367FF"/><stop offset="1" stop-color="#00D09C"/></linearGradient><clipPath id="' + c + '"><circle cx="32" cy="32" r="30"/></clipPath></defs><circle cx="32" cy="32" r="30" fill="url(#' + g + ')"/><path clip-path="url(#' + c + ')" d="M0 38 C14 22 22 46 34 30 S52 20 64 26 V64 H0 Z" fill="#00D09C"/></svg>';
  }
  function logo() { return '<a class="logo" href="#/" aria-label="groww × navya — home">' + logoSvg() + "<b>groww</b><small>× navya</small></a>"; }

  /* ---------------- shared bits ---------------- */
  var PCLS = { result: "", built: "", modelled: "amber", target: "blue", sourced: "grey" };
  function provChip(p) {
    var x = D.prov[p]; if (!x) return "";
    return '<span class="chip ' + PCLS[p] + '" title="' + esc(x.tip) + '">' + (p === "result" || p === "built" ? I.check : "") + esc(x.label) + "</span>";
  }
  function tile(p, cls) {
    if (p.seller === "phonepe") return '<span class="tl ' + (cls || "") + '" style="background:#5F259F"><img src="assets/logos/phonepe.svg" alt=""></span>';
    var o = p.poster;
    return '<span class="tl ' + (cls || "") + '" style="background:' + o.bg + ";color:" + o.fg + ';box-shadow:inset 0 -3px 0 ' + o.accent + '">' + esc(INI[p.id] || p.short.slice(0, 2)) + "</span>";
  }
  function chg(p) { return (p.price.strike ? "from " + p.price.strike + " · " : "") + p.price.off; }
  function isW(id) { return S.watch.indexOf(id) > -1; }

  /* deterministic up-trending series per case (decorative, not data) */
  function seed(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return function () { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; }; }
  function series(key, n) {
    var r = seed(key), v = 0, a = [];
    for (var i = 0; i < n; i++) { v += (r() - 0.43) * 1.2 + (i > n * 0.6 ? 0.12 : 0.04); a.push(v); }
    return a;
  }
  function pathOf(a, w, h, padT) {
    var mn = Math.min.apply(null, a), mx = Math.max.apply(null, a), rg = mx - mn || 1, pt = padT || 0;
    return a.map(function (v, i) { return (i ? "L" : "M") + (i / (a.length - 1) * w).toFixed(1) + " " + (pt + (1 - (v - mn) / rg) * (h - pt)).toFixed(1); }).join(" ");
  }
  function spark(key, w, h) {
    w = w || 120; h = h || 34;
    var a = series(key, 40);
    return '<svg viewBox="0 0 ' + w + " " + h + '" preserveAspectRatio="none" aria-hidden="true"><path d="' + pathOf(a, w, h - 2, 2) + '" fill="none" stroke="#00B386" stroke-width="1.6" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>';
  }
  var RN = { "1M": 30, "6M": 70, "1Y": 120, "3Y": 180, "All": 240 };
  function bigChart(key) {
    var n = RN[S.rng] || 120, a = series(key + S.rng, n), W = 800, H = 280;
    var d = pathOf(a, W, H - 20, 20);
    var mn = Math.min.apply(null, a), mx = Math.max.apply(null, a), y0 = 20 + (1 - (a[0] - mn) / ((mx - mn) || 1)) * (H - 40);
    var uid = "cg" + Math.floor(Math.random() * 1e6);
    return '<svg viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none" role="img" aria-label="Decorative trend line">' +
      '<defs><linearGradient id="' + uid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#00B386" stop-opacity=".16"/><stop offset="1" stop-color="#00B386" stop-opacity="0"/></linearGradient></defs>' +
      '<line x1="0" x2="' + W + '" y1="' + y0.toFixed(1) + '" y2="' + y0.toFixed(1) + '" stroke="#C9CAD1" stroke-dasharray="4 5" vector-effect="non-scaling-stroke"/>' +
      '<path d="' + d + " L" + W + " " + H + " L0 " + H + ' Z" fill="url(#' + uid + ')"/>' +
      '<path class="cl-line" d="' + d + '" fill="none" stroke="#00B386" stroke-width="2.2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>';
  }

  function card(p, big) {
    return '<a class="sc' + (big ? " big" : "") + '" href="#/stock/' + p.id + '">' + tile(p) +
      '<button class="wl' + (isW(p.id) ? " on" : "") + '" data-act="watch" data-id="' + p.id + '" aria-pressed="' + isW(p.id) + '" aria-label="' + (isW(p.id) ? "Remove from" : "Add to") + ' watchlist">' + I.mark + "</button>" +
      (big ? '<span class="tg">' + provChip(p.price.prov) + "</span>" : "") +
      "<h3>" + esc(big ? p.name : p.short + " — " + p.kind.split("·")[0].trim()) + "</h3>" +
      (big ? '<p class="hook">' + esc(p.hook) + '</p><div class="spark">' + spark(p.id, 200, 34) + "</div>" : "") +
      '<div class="pv">' + esc(p.price.v) + " <small>" + esc(p.price.u) + '</small></div><div class="ch">' + esc(chg(p)) + "</div></a>";
  }
  function row(p) {
    return '<a class="tr" href="#/stock/' + p.id + '"><div class="co">' + tile(p, "sm") + "<div><b>" + esc(p.short) + "</b><small>" + esc(p.kind) + "</small></div></div>" +
      '<div class="sp">' + spark(p.id, 110, 30) + "</div>" +
      '<div class="r pv">' + esc(p.price.v) + "<small>" + esc(p.price.u) + "</small></div>" +
      '<div class="r ch">' + esc(chg(p)) + "<br>" + provChip(p.price.prov) + "</div></a>";
  }

  /* ---------------- calculator: follow the money ---------------- */
  function moneyBlock() {
    return '<section class="sec" aria-labelledby="ftm-h"><div class="sec-h"><div><h2 id="ftm-h">Return calculator · follow the money</h2><p>A customer pays you. What actually reaches the bank? This is the arithmetic I spent two years inside.</p></div></div>' +
      '<div class="card calc"><div class="calc-t"><div class="seg" role="tablist"><button class="on" data-act="seg" data-v="200" role="tab">₹2,000 order</button><button data-act="seg" data-v="25000" role="tab">₹25,000 add-funds</button></div>' +
      '<small>Transaction value</small><output id="ovOut">₹2,000</output><input id="ovR" type="range" min="200" max="50000" step="100" value="2000" data-act="money" aria-label="Transaction value"></div>' +
      '<div class="calc-r"><span>Transaction value</span><b id="m1">₹2,000.00</b></div>' +
      '<div class="calc-r neg"><span>Gateway fee (MDR) <small id="mRate">2.00%</small></span><b id="m2">− ₹40.00</b></div>' +
      '<div class="calc-r neg"><span>18% GST on the fee</span><b id="m3">− ₹7.20</b></div>' +
      '<div class="calc-r tot"><span>Lands in the bank</span><b id="m4">₹1,952.80</b></div>' +
      '<div class="calc-r var" id="mVarRow"><span>Variance vs contract</span><b id="m5">₹0.00</b></div>' +
      '<div class="calc-r var" id="mYrRow"><span>Same error at ₹100 Cr a year</span><b id="m6">₹0</b></div>' +
      '<div class="calc-b"><label class="sw"><input type="checkbox" id="brk" data-act="money"><i></i><span>The silent break: charged <b>2.35%</b> instead of the contracted <b>2.00%</b></span></label>' +
      '<p class="fine">GST-on-MDR deduction is how Indian settlement works (Sourced). Rates are illustrative (Modelled). Silent breaks like this are what <a href="#/stock/reconos" style="color:var(--g);font-weight:600">ReconOS</a> catches.</p></div></div></section>';
  }
  function inr(n, dp) { return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: dp, maximumFractionDigits: dp }); }
  function updMoney() {
    var ov = $("#ovR"); if (!ov) return;
    var v = +ov.value, br = $("#brk").checked, rate = br ? 0.0235 : 0.02;
    var fee = v * rate, gst = fee * 0.18, net = v - fee - gst;
    var cNet = v - v * 0.02 * 1.18, varc = cNet - net;
    ov.style.setProperty("--p", ((v - ov.min) / (ov.max - ov.min) * 100) + "%");
    $("#ovOut").textContent = inr(v, 0);
    $("#m1").textContent = inr(v, 2); $("#mRate").textContent = (rate * 100).toFixed(2) + "%";
    $("#m2").textContent = "− " + inr(fee, 2); $("#m3").textContent = "− " + inr(gst, 2);
    $("#m4").textContent = inr(net, 2); $("#m5").textContent = (varc > 0.004 ? "− " : "") + inr(varc, 2);
    var yr = 1e9 * (br ? 0.0035 * 1.18 : 0);
    $("#m6").textContent = yr ? "≈ ₹" + (yr / 1e5).toFixed(1) + " L lost" : "₹0";
    $("#mVarRow").classList.toggle("bad", br); $("#mYrRow").classList.toggle("bad", br);
  }
  function habitsBlock(h) {
    return '<section class="sec"><div class="sec-h"><div><h2>' + (h || "Why investors back this stock") + '</h2><p>Four habits that show up in every case — a settlement file, a bank\'s reply email or the price of a protein sachet.</p></div></div><div class="habits">' +
      D.habits.map(function (x, i) { return '<div class="habit"><i>' + String.fromCharCode(65 + i) + "</i><div><b>" + esc(x[0]) + "</b><span>" + esc(x[1]) + "</span></div></div>"; }).join("") + "</div></section>";
  }

  /* ---------------- aside cards ---------------- */
  function invCard() {
    var work = D.orders.filter(function (o) { return o.type === "work"; });
    return '<div class="card pad inv"><h3>Your investments in Navya</h3>' +
      '<div class="inv-tot"><div><small>Experience</small><b>~3 yrs</b></div><div><small>At PhonePe</small><b class="up">2 yrs</b></div></div>' +
      work.map(function (o) { return '<a class="inv-row" href="#/holdings?o=' + o.id + '"><img src="' + o.logo + '" alt=""><div class="tx"><b>' + esc(o.title) + "</b><span>" + esc(o.org) + " · " + esc(o.when) + "</span></div><em>" + esc(o.bullets ? o.bullets[0][0] : "") + "</em></a>"; }).join("") +
      '<a class="inv-more" href="#/holdings">View all holdings →</a></div>';
  }
  function hireIll() {
    return '<svg class="ill" viewBox="0 0 120 100" aria-hidden="true"><rect x="18" y="20" width="84" height="62" rx="10" fill="#EEF0FF"/><rect x="28" y="30" width="64" height="8" rx="4" fill="#B9C2FF"/><path d="M30 70l14-14 10 8 16-18 20 14" fill="none" stroke="#00B386" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="90" cy="60" r="5" fill="#00B386"/><circle cx="96" cy="22" r="12" fill="#00B386"/><path d="M90.5 22l4 4 7-7.5" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }
  function hireCard() {
    return '<div class="card hire">' + hireIll() + "<h3>Want to invest in this PM?</h3><p>Open to Product Manager roles. The first conversation costs nothing — zero brokerage.</p>" +
      '<button class="btn block lg" data-act="hire">Hire Navya</button><a class="btn ol block" style="margin-top:10px" href="' + P.resume + '" download>' + I.doc + "Download résumé</a></div>";
  }

  /* ---------------- HOME / EXPLORE ---------------- */
  function hero() {
    return '<section class="hero"><div class="wrap hero-in"><div>' +
      '<div class="laurel">' + '<svg viewBox="0 0 22 34" aria-hidden="true"><path d="M15 3C7 8 7 24 15 31M9 9c-3 0-4 2-4 2s2 1 4 0M8 16c-3 .5-3.5 2.5-3.5 2.5s2 .5 4-1M9 23c-2.5 1-2.5 3-2.5 3s2 0 3.5-1.5"/></svg>' + "<div><b>Trusted with ₹500 Cr+ TPV</b>2 years inside PhonePe's payment rails</div>" + '<svg viewBox="0 0 22 34" aria-hidden="true"><path d="M7 3c8 5 8 21 0 28M13 9c3 0 4 2 4 2s-2 1-4 0M14 16c3 .5 3.5 2.5 3.5 2.5s-2 .5-4-1M13 23c2.5 1 2.5 3 2.5 3s-2 0-3.5-1.5"/></svg>' + "</div>" +
      "<h1>Groww your<br><em>product team.</em></h1>" +
      '<p class="hero-p"><b>Navya Juneja · Product Manager.</b> Two years in payments at PhonePe — routing, settlement, reconciliation — then 0→1 products with real users. Every number here says where it came from.</p>' +
      '<div class="hero-cta"><a class="btn lg" href="#/cases">Explore the work</a><button class="btn ol lg" data-act="hire">Hire Navya</button></div>' +
      '<div class="hero-meta"><div><b class="up">₹15 Cr+</b><span>recovered via reconciliation</span></div><div><b>₹8 Cr</b><span>saved a year via routing</span></div><div><b>+4 pp</b><span>payment success lift</span></div><div><b>' + D.products.length + '</b><span>case studies, labelled</span></div></div></div>' +
      '<div class="hero-v" aria-hidden="true"><div class="phone"><div class="ph-s">' +
      '<div class="ph-top"><img src="assets/portrait.jpg" alt=""><div><b>Navya Juneja</b><span>NAVYA · PM · Payments & 0→1</span></div></div>' +
      '<div class="ph-val"><small>Recovered at PhonePe</small><b>₹15 Cr+</b><span>▲ Result · Finance & Recon</span></div>' +
      '<div class="ph-chart">' + spark("hero-navya", 260, 110) + "</div>" +
      '<div class="ph-rng"><span>1M</span><span>6M</span><span class="on">1Y</span><span>3Y</span><span>All</span></div>' +
      '<div class="ph-list"><div><b>Routing savings</b><span>₹8 Cr / yr</span></div><div><b>Payment success</b><span>+4 pp</span></div><div><b>Go-live TAT (Cards)</b><span>−53%</span></div></div>' +
      '<div class="ph-btns"><span>Watchlist</span><span>Hire</span></div></div></div>' +
      '<div class="float f1"><b class="up">₹8 Cr / yr</b>saved via routing</div>' +
      '<div class="float f2"><b>~$110K</b>in 2 months at Cogent</div>' +
      '<div class="float qr"><img src="assets/qr-linkedin.svg" alt=""><span><b style="font-size:13px">Scan to connect</b>LinkedIn</span></div></div></div></section>';
  }
  var IDX = [
    ["PHONEPE RECON", "₹15 Cr+", "recovered · Result", "pp-recon"],
    ["ROUTING SAVINGS", "₹8 Cr / yr", "+4 pp success · Result", "pp-routing"],
    ["TRAFFIC MIGRATED", "95%", "in 3 months · Result", "pp-migration"],
    ["GO-LIVE TAT", "−53%", "Cards · −40% NetBanking", "pp-golive"]
  ];
  function idxRow() { return '<div class="idx">' + IDX.map(function (x) { return '<a href="#/stock/' + x[3] + '"><small>' + x[0] + "</small><b>" + x[1] + "</b><span>" + x[2] + "</span></a>"; }).join("") + "</div>"; }
  function tools() {
    var T = [["#/cases/payments", "rupee", "Payments & Fintech", "Routing, recon, PRDs"], ["#/cases/build", "rocket", "0→1 Builds", "Shipped & prototyped"], ["#/cases/seller", "store", "D2C & Commerce", "Funnels, RTO, P&L"], ["#/cases/gtm", "tag", "GTM & Pricing", "Ladders, tiers, SOM"],
      ["#/cases/process", "flow", "Process Design", "Workflows & clocks"], ["#/cases/live", "live", "Live Builds", "Open them yourself"], ["#/fund", "fund", "PhonePe Fund", "2 years, 5 wins"], ["#/holdings", "brief", "Holdings", "Experience & education"]];
    return '<section class="sec"><div class="sec-h"><h2>Products &amp; tools</h2></div><div class="tools">' + T.map(function (t) { return '<a href="' + t[0] + '"><span class="ti">' + CI[t[1]] + "</span><div>" + t[2] + "<small>" + t[3] + "</small></div></a>"; }).join("") + "</div></section>";
  }
  function movers() {
    var f = { all: function () { return true; }, result: function (p) { return p.price.prov === "result"; }, built: function (p) { return p.price.prov === "built" || p.cats.indexOf("live") > -1; }, model: function (p) { return /modelled|target|sourced/.test(p.price.prov); } };
    var list = D.products.filter(f[S.mv]).slice(0, 7);
    var tabs = [["all", "All"], ["result", "Results"], ["built", "Built & live"], ["model", "Modelled & targets"]];
    return '<section class="sec" id="movers"><div class="sec-h"><div><h2>Top movers</h2><p>Filter by evidence — every figure is labelled by provenance.</p></div><a href="#/cases">See more</a></div>' +
      '<div class="tabs" role="tablist">' + tabs.map(function (t) { return '<button class="pillb' + (S.mv === t[0] ? " on" : "") + '" role="tab" aria-selected="' + (S.mv === t[0]) + '" data-act="mv" data-k="' + t[0] + '">' + t[1] + "</button>"; }).join("") + "</div>" +
      '<div class="tbl"><div class="tr th"><span>Case</span><span class="hd-sp"></span><span class="r">Headline value</span><span class="r hd-sp">Change · evidence</span></div>' + list.map(row).join("") + '<a class="tbl-more" href="#/cases">View all ' + D.products.length + " in the screener →</a></div></section>";
  }
  function vHome() {
    var feat = ["reconos", "perfora", "mid", "routeiq"].map(function (id) { return byId[id]; });
    var wl = S.watch.map(function (id) { return byId[id]; });
    return hero() + '<div class="wrap lay"><div>' +
      '<section class="sec"><div class="sec-h"><h2>Index · PhonePe</h2><a href="#/fund">View fund</a></div>' + idxRow() + "</section>" +
      '<section class="sec"><div class="sec-h"><h2>Most viewed on groww × navya</h2><a href="#/cases">See more</a></div><div class="sgrid">' + feat.map(function (p) { return card(p); }).join("") + "</div></section>" +
      tools() + movers() + moneyBlock() + habitsBlock() + "</div>" +
      "<aside>" + invCard() + hireCard() +
      (wl.length ? '<div class="card pad inv"><h3>Your watchlist</h3>' + wl.slice(0, 4).map(function (p) { return '<a class="inv-row" href="#/stock/' + p.id + '">' + tile(p, "sm") + '<div class="tx"><b>' + esc(p.short) + "</b><span>" + esc(p.price.v + " " + p.price.u) + "</span></div></a>"; }).join("") + '<a class="inv-more" href="#/watchlist">Open watchlist →</a></div>' : "") +
      "</aside></div>";
  }

  /* ---------------- SCREENER ---------------- */
  function catName(id) { var c = D.cats.filter(function (c) { return c.id === id; })[0]; return c ? c.name : "All cases"; }
  function filtered(cat) {
    var q = S.f.q.trim().toLowerCase();
    var l = D.products.filter(function (p) {
      if (cat !== "all" && p.cats.indexOf(cat) < 0) return false;
      if (S.f.seller.length && S.f.seller.indexOf(p.seller) < 0) return false;
      if (S.f.prov.length && S.f.prov.indexOf(p.price.prov) < 0) return false;
      if (q && (p.name + " " + p.short + " " + p.code + " " + p.kind + " " + p.hook + " " + p.cats.join(" ") + " " + (TK[p.id] || "") + " " + D.sellers[p.seller].name).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    if (S.f.sort === "new") l.sort(function (a, b) { return b.sort - a.sort; });
    if (S.f.sort === "old") l.sort(function (a, b) { return a.sort - b.sort; });
    if (S.f.sort === "az") l.sort(function (a, b) { return a.short.localeCompare(b.short); });
    return l;
  }
  function chk(k, v, label) { var on = S.f[k].indexOf(v) > -1; return '<label><input type="checkbox" data-act="chk" data-k="' + k + '" value="' + v + '"' + (on ? " checked" : "") + ">" + esc(label) + "</label>"; }
  function vCases(cat) {
    var l = filtered(cat), n = S.f.seller.length + S.f.prov.length + (S.f.q ? 1 : 0);
    return '<div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Explore</a> / <a href="#/cases">Screener</a> / <span>' + esc(catName(cat)) + "</span></nav></div>" +
      '<div class="wrap scr"><aside class="card flt' + (S.fltOpen ? " on" : "") + '" aria-label="Filters"><h4>Filters ' + (n ? '<button data-act="clr">Clear all</button>' : "") + "</h4><hr>" +
      "<h4>Company</h4>" + Object.keys(D.sellers).map(function (k) { return chk("seller", k, D.sellers[k].name); }).join("") + "<hr>" +
      "<h4>Evidence</h4>" + Object.keys(D.prov).map(function (k) { return chk("prov", k, D.prov[k].label + " — " + D.prov[k].tip); }).join("") + "</aside>" +
      "<div>" + '<div class="scr-top"><h1>' + esc(catName(cat)) + ' <span class="mut" style="font-size:15px;font-weight:500">' + l.length + " results</span></h1>" +
      '<div style="display:flex;gap:8px"><button class="btn ol sm fbtn" data-act="flt">' + I.filter + "Filters" + (n ? " (" + n + ")" : "") + '</button><select data-act="sort" aria-label="Sort"><option value="rel"' + (S.f.sort === "rel" ? " selected" : "") + '>Popularity</option><option value="new"' + (S.f.sort === "new" ? " selected" : "") + '>Newest first</option><option value="old"' + (S.f.sort === "old" ? " selected" : "") + '>Oldest first</option><option value="az"' + (S.f.sort === "az" ? " selected" : "") + ">A → Z</option></select></div></div>" +
      '<div class="catchips">' + D.cats.map(function (c) { return '<a class="pillb g' + (c.id === cat ? " on" : "") + '" href="#/cases/' + c.id + '">' + esc(c.name) + "</a>"; }).join("") + "</div>" +
      (S.f.q ? '<p style="margin-bottom:14px">Results for “<b>' + esc(S.f.q) + '</b>” <button class="chip grey" data-act="clrq" style="margin-left:6px">Clear ×</button></p>' : "") +
      (l.length ? '<div class="sgrid" id="grid">' + l.map(function (p) { return card(p, true); }).join("") + "</div>" : emptyState(I.search, "No cases match", "Try a different filter or search term.", "#/cases", "Reset", "clr")) +
      "</div></div>";
  }

  /* ---------------- STOCK PAGE (case detail) ---------------- */
  function secBody(s) {
    var h = "";
    if (s.p && !s.compare && !s.tiers && !s.steps) h += "<p>" + esc(s.p) + "</p>";
    if (s.list) h += "<ul>" + s.list.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
    if (s.steps) h += '<div class="steps">' + s.steps.map(function (x, i) { return '<div class="step"><i>' + (i + 1) + "</i><div><b>" + esc(x[0]) + "</b><span>" + esc(x[1]) + "</span></div></div>"; }).join("") + "</div>";
    if (s.compare) h += '<div class="cmp">' + s.compare.map(function (x) { return "<div><b>" + esc(x[0]) + "</b><span>" + esc(x[1]) + "</span></div>"; }).join("") + "</div>";
    if (s.tiers) h += '<div class="tiers">' + s.tiers.map(function (x) { return "<div><small>" + esc(x[0]) + "</small><b>" + esc(x[1]) + "</b><span>" + esc(x[2]) + "</span></div>"; }).join("") + "</div>";
    if (s.p && (s.compare || s.tiers || s.steps)) h += "<p>" + esc(s.p) + "</p>";
    return h;
  }
  function orderPanel(p, cls) {
    var roles = ["Product Manager", "Associate PM", "PM — Payments", "PM — Investing", "Growth PM"];
    return '<div class="card op ' + (cls || "") + '"><div class="op-h"><b>' + esc(p.short) + "</b><span>" + esc(TK[p.id] || p.code) + " · " + esc(p.price.v) + " " + esc(p.price.u) + "</span></div>" +
      '<div class="op-t" role="tablist"><button role="tab" class="' + (S.opTab === "hire" ? "on" : "") + '" data-act="optab" data-k="hire">HIRE</button><button role="tab" class="rf' + (S.opTab === "refer" ? " on" : "") + '" data-act="optab" data-k="refer">REFER</button></div>' +
      (S.opTab === "hire" ?
        '<div class="op-b"><div class="op-f"><label for="roleSel">Role</label><select id="roleSel" data-act="role">' + roles.map(function (r) { return "<option" + (r === S.role ? " selected" : "") + ">" + r + "</option>"; }).join("") + "</select></div>" +
        '<div class="op-f"><label>Interview rounds</label><span class="qty"><button data-act="qty" data-k="-1" aria-label="Fewer rounds">−</button><output id="qtyOut">' + S.qty + '</output><button data-act="qty" data-k="1" aria-label="More rounds">+</button></span></div>' +
        '<div class="op-f"><label>Joining</label><span class="ro">Immediate</span></div></div>' +
        '<div class="op-ft"><div class="bal"><span>First call</span><b class="up">₹0 · zero brokerage</b></div><button class="btn block lg" data-act="hire" data-id="' + p.id + '">Hire</button>' +
        '<button class="btn ol block" data-act="watch" data-id="' + p.id + '">' + I.mark + (isW(p.id) ? "In watchlist" : "Add to watchlist") + "</button></div>"
        :
        '<div class="op-b"><p style="font-size:13.5px">Know a team hiring product managers? Pass this case along — it takes one link.</p><div class="op-f"><span class="ro" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(location.href) + "</span></div></div>" +
        '<div class="op-ft"><button class="btn block lg" style="background:var(--blue)" data-act="share" data-id="' + p.id + '">' + I.share + 'Share this case</button><button class="btn ol block" data-act="copy">' + I.link + "Copy link</button></div>") +
      "</div>";
  }
  function vStock(id) {
    var p = byId[id]; if (!p) return vNotFound();
    var s = D.sellers[p.seller];
    var tabs = [["ov", "Overview"], ["ap", "Approach"]];
    if (p.media.length) tabs.push(["md", "Media"]);
    tabs.push(["wg", "Why Groww"], ["pr", "Peers"]);
    var peers = D.products.filter(function (x) { return x.id !== p.id && x.cats.some(function (c) { return c !== "live" && p.cats.indexOf(c) > -1; }); }).slice(0, 5);
    var links = (p.links || []).map(function (l) { return '<a class="rowcard" href="' + l.u + '" target="_blank" rel="noopener"><span class="ri">' + I.ext + '</span><span class="tx"><b>' + esc(l.t) + "</b><span>" + esc(host(l.u)) + "</span></span>" + I.chev + "</a>"; }).join("");
    if (p.deck) links += '<a class="rowcard" href="' + p.deck.u + '" target="_blank" rel="noopener"><span class="ri">' + I.doc + '</span><span class="tx"><b>Open the full deck</b><span>' + esc(p.deck.t) + " · PDF · " + p.deck.pages + " pages · " + p.deck.size + "</span></span>" + I.chev + "</a>";
    if (!links) links = '<a class="rowcard" href="#/holdings?o=' + (p.seller === "phonepe" ? "phonepe-sr" : p.seller === "cogent" ? "cogent" : "mu") + '"><span class="ri">' + I.cal + '</span><span class="tx"><b>See where this happened</b><span>' + esc(s.name) + " · " + esc(s.sub) + "</span></span>" + I.chev + "</a>";
    return '<div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Explore</a> / <a href="#/cases">Screener</a> / <span>' + esc(p.short) + "</span></nav></div>" +
      '<div class="wrap lay" style="padding-top:6px"><div>' +
      '<div class="st-h">' + tile(p, "lgx") + '<div class="st-acts"><button class="ib" data-act="copy" aria-label="Copy link">' + I.link + '</button><button class="ib" data-act="alert" data-id="' + p.id + '" aria-label="Set alert">' + I.bell + '</button><button class="ib' + (isW(p.id) ? " on" : "") + '" data-act="watch" data-id="' + p.id + '" aria-pressed="' + isW(p.id) + '" aria-label="Watchlist">' + I.mark + "</button></div></div>" +
      '<div class="st-sym">' + esc(TK[p.id] || p.code) + " • " + esc(p.code) + " • " + esc(s.name.toUpperCase()) + "</div>" +
      '<h1 class="st-name">' + esc(p.name) + "</h1>" +
      '<div class="st-sub">' + esc(p.kind) + (p.date ? " · " + esc(p.date) : "") + "</div>" +
      '<div class="st-px"><b>' + esc(p.price.v) + '</b><span class="ch">' + esc(chg(p)) + '</span><span class="u">' + esc(p.price.u) + "</span>" + provChip(p.price.prov) + "</div>" +
      '<div class="chart" id="chart">' + bigChart(p.id) + '<span class="note">Trend line is decorative — the numbers on this page carry their own labels.</span></div>' +
      '<div class="rng" role="tablist">' + Object.keys(RN).map(function (r) { return '<button class="' + (S.rng === r ? "on" : "") + '" data-act="rng" data-k="' + r + '" data-id="' + p.id + '">' + r + "</button>"; }).join("") + "</div>" +
      '<div class="links">' + links + "</div>" +
      '<nav class="stabs" aria-label="Sections">' + tabs.map(function (t, i) { return '<a href="#/stock/' + p.id + '" class="' + (i ? "" : "on") + '" data-act="jump" data-k="' + t[0] + '">' + t[1] + "</a>"; }).join("") + "</nav>" +
      '<section class="blk" id="ov"><h2>Performance</h2><div class="perf"><div><small>Problem</small><p>' + esc(p.summary.problem) + "</p></div><div><small>What I did</small><p>" + esc(p.summary.did) + '</p></div><div class="ld"><small>Where it landed</small><p>' + esc(p.summary.landed) + "</p></div></div></section>" +
      '<section class="blk"><h2>Fundamentals</h2><div class="fund">' + p.metrics.map(function (m) { return "<div><b>" + esc(m.v) + "</b><small>" + esc(m.l) + "</small>" + provChip(m.p) + "</div>"; }).join("") + "</div></section>" +
      '<section class="blk"><h2>About the case</h2><dl class="dtl">' + p.details.map(function (d) { return "<dt>" + esc(d[0]) + "</dt><dd>" + esc(d[1]) + "</dd>"; }).join("") + "</dl></section>" +
      '<section class="blk" id="ap"><h2>Approach</h2>' + (p.sections.length ? p.sections.map(function (x) { return '<div class="ap"><h3>' + esc(x.h) + "</h3>" + secBody(x) + "</div>"; }).join("") : '<div class="ap"><p>' + esc(p.hook) + " Underlying data and internal documents belong to " + esc(s.name) + " and are not reproduced here — figures are as stated on my CV.</p></div>") + "</section>" +
      (p.media.length ? '<section class="blk" id="md"><h2>Media</h2><div class="gal">' + p.media.map(function (m, i) {
        if (m.type === "video") return '<div class="vid"><video controls preload="none" playsinline poster="' + m.poster + '" aria-label="' + esc(m.alt) + '"><source src="' + m.src + '" type="video/mp4"></video></div>';
        return '<button data-act="lb" data-id="' + p.id + '" data-k="' + i + '" aria-label="Open image: ' + esc(m.alt) + '"><img src="' + m.src + '" alt="' + esc(m.alt) + '" loading="lazy"></button>';
      }).join("") + "</div></section>" : "") +
      '<section class="blk" id="wg"><h2>Why this matters at Groww</h2><div class="why"><b>' + I.spark + "Read across</b><p>" + esc(p.groww) + "</p></div></section>" +
      (peers.length ? '<section class="blk" id="pr"><h2>Peers</h2><div class="tbl"><div class="tr th"><span>Case</span><span class="hd-sp"></span><span class="r">Headline value</span><span class="r hd-sp">Change · evidence</span></div>' + peers.map(row).join("") + "</div></section>" : '<section class="blk" id="pr"></section>') +
      "</div><aside>" + orderPanel(p, "desk") + invCard() + "</aside></div>" +
      '<div class="bbar"><button class="btn ol" data-act="watch" data-id="' + p.id + '">' + (isW(p.id) ? "In watchlist" : "Watchlist") + '</button><button class="btn" data-act="hire" data-id="' + p.id + '">Hire</button></div>';
  }

  /* ---------------- FUND PAGE (PhonePe) ---------------- */
  function vFund() {
    var pp = D.products.filter(function (p) { return p.seller === "phonepe"; });
    var mgr = D.orders.filter(function (o) { return o.org === "PhonePe"; });
    var sect = { "pp-routing": "Payments routing", "pp-recon": "Finance & recon", "pp-migration": "Payments infra", "pp-golive": "Onboarding", "pp-launches": "Network partnerships" };
    return '<div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Explore</a> / <span>PhonePe Fund</span></nav></div>' +
      '<div class="wrap lay" style="padding-top:12px"><div><div class="fhero"><div class="st-h" style="margin-top:6px"><span class="tl lgx" style="background:#5F259F"><img src="assets/logos/phonepe.svg" alt="PhonePe logo"></span><div class="st-acts"><button class="ib" data-act="copy" aria-label="Copy link">' + I.link + "</button></div></div>" +
      '<h1 class="st-name">PhonePe Payments Fund — Direct Growth</h1>' +
      '<div class="tags"><span class="tag">Payments</span><span class="tag">Cards &amp; NetBanking</span><span class="tag">₹500+ Cr TPV merchants</span><span class="tag">Jun 2023 – Jun 2025</span></div>' +
      '<div class="fret"><b>₹15 Cr+</b><span>recovered</span><span class="d"><span class="up" style="font-weight:600">+₹8 Cr a year</span> saved via routing · Result</span></div></div>' +
      '<div class="chart" style="height:240px">' + bigChart("phonepe-fund") + '<span class="note">Trend line is decorative.</span></div>' +
      '<div class="fstats"><div><small>Tenure</small><b>2 years</b></div><div><small>Payment success</small><b class="up">+4 pp</b></div><div><small>Traffic migrated</small><b>95% in 3 mo</b></div><div><small>Merchant go-lives</small><b>360 in 1 upload</b></div></div>' +
      '<section class="blk" style="margin-top:32px"><h2>Holdings (' + pp.length + ')</h2><div class="tbl hold"><div class="tr th"><span>Name</span><span class="sect">Sector</span><span class="r">Result</span></div>' +
      pp.map(function (p) { return '<a class="tr" href="#/stock/' + p.id + '"><div class="co">' + tile(p, "sm") + "<div><b>" + esc(p.name) + "</b><small>" + esc(p.hook) + '</small></div></div><span class="sect">' + esc(sect[p.id] || "Payments") + '</span><div class="r pv">' + esc(p.price.v) + "<small>" + esc(p.price.u) + "</small></div></a>"; }).join("") + "</div></section>" +
      '<section class="blk"><h2>Fund management</h2><div class="mgr">' + mgr.map(function (o) {
        return '<div class="card"><div class="mgr-h"><img src="' + o.logo + '" alt=""><div><b>' + esc(o.title) + "</b><span>" + esc(o.when) + " · " + esc(o.where) + '</span></div></div><p style="font-size:14px;margin-bottom:10px">' + esc(o.body) + '</p><div class="bul">' + o.bullets.map(function (b) { return "<div><b>" + esc(b[0]) + "</b><span>" + esc(b[1]) + "</span></div>"; }).join("") + "</div></div>";
      }).join("") + "</div></section>" + moneyBlock() +
      '<p class="fine" style="margin-bottom:32px">Figures are as stated on my CV. Underlying transaction data and internal documents are PhonePe\'s and are not reproduced.</p></div>' +
      "<aside>" + hireCard() + "</aside></div>";
  }

  /* ---------------- HOLDINGS (experience) ---------------- */
  function vHoldings(qs) {
    var tab = S.htab, list = D.orders.filter(function (o) { return tab === "all" || o.type === tab; });
    var open = qs.o || "";
    return '<div class="wrap ph-h"><h1>Holdings</h1><nav class="subtabs" aria-label="Holdings filter">' +
      [["all", "All"], ["work", "Work"], ["edu", "Education"]].map(function (t) { return '<a href="#/holdings" class="' + (tab === t[0] ? "on" : "") + '" data-act="htab" data-k="' + t[0] + '">' + t[1] + "</a>"; }).join("") + "</nav>" +
      '<div class="card sum"><div class="big"><small>Total experience</small><b>~3 years</b><em>Jun 2023 – Jun 2026</em></div><div><small>PhonePe · payments</small><b>2 yrs</b><em>₹8 Cr + ₹15 Cr</em></div><div><small>Cogent · 0→1</small><b>10 mo</b><em>4.6× sign-ups</em></div><div><small>MU ventures</small><b>₹7.3 L</b><em>revenue, 2 ventures</em></div></div>' +
      '<div class="hl">' + list.map(function (o) {
        return '<div class="hi' + (open === o.id ? " open" : "") + '" id="o-' + o.id + '"><button class="hi-r" data-act="otoggle" data-id="' + o.id + '" aria-expanded="' + (open === o.id) + '"><img src="' + o.logo + '" alt=""><span><b>' + esc(o.org) + '</b><span class="t">' + esc(o.title) + '</span><span class="w">' + esc(o.when) + " · " + esc(o.where) + '</span></span><span class="st"><b class="' + (o.status === "ongoing" ? "on" : "") + '">' + esc(o.statusText) + "</b><span>" + (o.type === "edu" ? "Education" : "Work") + "</span></span>" + I.chevD + "</button>" +
          '<div class="hi-b"><p>' + esc(o.body) + "</p>" +
          (o.bullets ? '<div class="bul">' + o.bullets.map(function (b) { return "<div><b>" + esc(b[0]) + "</b><span>" + esc(b[1]) + "</span></div>"; }).join("") + "</div>" : "") +
          (o.track ? '<div class="track">' + o.track.map(function (t) { return "<div><b>" + esc(t[0]) + "</b><span>" + esc(t[1]) + "</span></div>"; }).join("") + "</div>" : "") +
          (o.related ? '<div class="rel">' + o.related.map(function (r) { return '<a class="pillb" href="#/stock/' + r + '">' + esc(byId[r].short) + " →</a>"; }).join("") + "</div>" : "") + "</div></div>";
      }).join("") + "</div>" +
      '<section class="sec" style="margin-top:36px"><div class="sec-h"><h2>Certifications</h2></div><div class="oc">' + D.certs.map(function (c) { return '<div><b style="font-size:16px;color:var(--ink-1)">' + esc(c[0]) + "</b><span>" + esc(c[1]) + "</span></div>"; }).join("") + "</div></section></div>";
  }

  /* ---------------- WATCHLIST ---------------- */
  function emptyState(icon, h, p, href, cta, act) {
    return '<div class="empty"><div class="ei">' + icon + "</div><h2>" + esc(h) + "</h2><p>" + esc(p) + "</p>" + (act ? '<button class="btn" data-act="' + act + '">' + esc(cta) + "</button>" : '<a class="btn" href="' + href + '">' + esc(cta) + "</a>") + "</div>";
  }
  function vWatch() {
    var l = S.watch.map(function (id) { return byId[id]; });
    return '<div class="wrap ph-h"><h1>Watchlist</h1><p class="mut" style="margin-top:4px">Saved in this browser only.</p><div style="height:20px"></div>' +
      (l.length ? '<div class="tbl">' + l.map(row).join("") + '</div><div style="display:flex;gap:10px;margin:20px 0 48px;flex-wrap:wrap"><button class="btn" data-act="hire">Talk about these with Navya</button><a class="btn ol" href="#/cases">Add more</a></div>'
        : emptyState(I.mark, "Your watchlist is empty", "Tap the bookmark on any case to track it here.", "#/cases", "Explore cases")) + "</div>";
  }

  /* ---------------- PROFILE ---------------- */
  function vProfile() {
    return '<div class="wrap prof"><aside class="card pc"><div class="pimg"><img src="assets/portrait.jpg" alt="Navya Juneja"></div><h1>' + esc(P.name) + '</h1><p class="role">' + esc(P.role) + " · " + esc(P.location) + "</p>" +
      '<span class="kyc">' + I.shield + 'Every number labelled</span><div class="cl">' +
      '<a href="mailto:' + P.email + '">' + I.mail + "<span>" + esc(P.email) + "</span></a>" +
      '<a href="' + P.phoneHref + '">' + I.phone + "<span>" + esc(P.phone) + "</span></a>" +
      '<a href="' + P.linkedin + '" target="_blank" rel="noopener">' + I.linkedin + "<span>" + esc(P.linkedinShort) + "</span>" + I.ext + "</a>" +
      '<a href="' + P.resume + '" download>' + I.doc + "<span>Résumé (PDF)</span><small>Download</small></a>" +
      '<a href="' + P.portfolio + '" target="_blank" rel="noopener">' + I.globe + "<span>Main portfolio</span>" + I.ext + "</a></div>" +
      '<button class="btn block lg" style="margin-top:18px" data-act="hire">Hire Navya</button></aside><div>' +
      habitsBlock("How I work") +
      '<section class="sec"><div class="sec-h"><h2>Off the clock</h2></div><div class="oc">' + D.offclock.map(function (o) { return "<div><b>" + esc(o[0]) + "</b><span>" + esc(o[1]) + "</span></div>"; }).join("") + "</div></section>" +
      '<section class="sec"><div class="sec-h"><h2>Help &amp; FAQs</h2></div><div class="faq">' + D.faq.map(function (f, i) { return "<details" + (i ? "" : " open") + "><summary>" + esc(f[0]) + I.chevD + "</summary><p>" + esc(f[1]) + "</p></details>"; }).join("") + "</div></section></div></div>";
  }
  function vNotFound() { return '<div class="wrap">' + emptyState(I.search, "Page not found", "That link doesn't lead anywhere — let's get you back to exploring.", "#/", "Go to Explore") + "</div>"; }

  /* ---------------- SHELL ---------------- */
  var NAV = [["#/", "Explore", "explore", ""], ["#/cases", "Screener", "grid", "cases"], ["#/fund", "PhonePe Fund", "pie", "fund"], ["#/holdings", "Holdings", "bag", "holdings"], ["#/profile", "Profile", "user", "profile"]];
  function renderShell() {
    var wc = S.watch.length;
    $("#hdr").innerHTML = '<div class="wrap hdr-in">' + logo() + '<nav class="hnav" aria-label="Main">' +
      NAV.slice(0, 4).map(function (n) { return '<a href="' + n[0] + '" data-nav="' + n[3] + '">' + n[1] + "</a>"; }).join("") + "</nav>" +
      '<span class="hsp"></span>' + searchBox("q1") +
      '<a class="ib" href="#/watchlist" aria-label="Watchlist (' + wc + ')">' + I.mark + (wc ? '<span class="cnt">' + wc + "</span>" : "") + "</a>" +
      '<a class="btn" href="' + P.resume + '" download>Download Résumé</a>' +
      '<a class="av" href="#/profile" aria-label="Profile"><img src="assets/portrait.jpg" alt=""></a></div>' +
      '<div class="wrap hdr-m"><button class="ib bare back" data-act="back" aria-label="Back">' + I.back + "</button>" + logo() + '<span class="hsp"></span>' +
      '<button class="ib bare" data-act="msearch" aria-label="Search">' + I.search + "</button>" +
      '<a class="ib bare" href="#/watchlist" aria-label="Watchlist (' + wc + ')">' + I.mark + (wc ? '<span class="cnt">' + wc + "</span>" : "") + "</a>" +
      '<a class="av" href="#/profile" aria-label="Profile" style="width:34px;height:34px"><img src="assets/portrait.jpg" alt=""></a></div>';
    $("#bnav").innerHTML = NAV.map(function (n) { return '<a href="' + n[0] + '" data-nav="' + n[3] + '">' + I[n[2]] + "<span>" + n[1].replace("PhonePe ", "") + "</span></a>"; }).join("");
    markNav();
  }
  function searchBox(id) {
    return '<div class="srch"><form data-act="searchform" role="search"><span aria-hidden="true">' + I.search + '</span><input id="' + id + '" data-q type="search" autocomplete="off" placeholder="Search cases, skills, CASE-03…" aria-label="Search case studies" aria-controls="' + id + 'd" value="' + esc(S.f.q) + '"><kbd>Ctrl+K</kbd></form><div class="sdrop" id="' + id + 'd" role="listbox"></div></div>';
  }
  function results(q) {
    q = q.trim().toLowerCase();
    var list = q ? D.products.filter(function (p) { return (p.name + " " + p.short + " " + p.code + " " + p.kind + " " + p.cats.join(" ") + " " + (TK[p.id] || "") + " " + D.sellers[p.seller].name).toLowerCase().indexOf(q) > -1; }) : D.products.slice(0, 5);
    var cats = q ? D.cats.filter(function (c) { return c.name.toLowerCase().indexOf(q) > -1; }) : [];
    if (!list.length && !cats.length) return '<div class="sempty">No cases for “' + esc(q) + '”. Try “payments”, “pricing” or “PhonePe”.</div>';
    return (q ? "<h5>Cases</h5>" : "<h5>Popular</h5>") + list.slice(0, 7).map(function (p, i) {
      return '<a class="sres' + (i ? "" : " act") + '" href="#/stock/' + p.id + '">' + tile(p, "sm") + '<span class="tx"><b>' + esc(p.short) + "</b><span>" + esc(TK[p.id] || p.code) + " · " + esc(p.kind) + '</span></span><span class="pr">' + esc(p.price.v) + "<small>" + esc(D.prov[p.price.prov].label) + "</small></span></a>";
    }).join("") + (cats.length ? "<h5>Categories</h5>" + cats.map(function (c) { return '<a class="sres" href="#/cases/' + c.id + '"><span class="tl sm" style="background:var(--g-ll)">' + CI[c.icon] + '</span><span class="tx"><b>' + esc(c.name) + "</b></span></a>"; }).join("") : "");
  }
  function markNav() {
    var p = parse().parts[0] || "";
    if (p === "stock") p = "cases";
    $$("[data-nav]").forEach(function (a) { var on = a.getAttribute("data-nav") === p; a.classList.toggle("on", on); if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
  }
  var TICK = [["RECON", "₹15 Cr+", "recovered", "pp-recon"], ["ROUTING", "₹8 Cr", "/ yr saved", "pp-routing"], ["SUCCESS", "+4 pp", "payments", "pp-routing"], ["MIGRATION", "95%", "in 3 mo", "pp-migration"],
    ["GOLIVE", "−53%", "TAT, Cards", "pp-golive"], ["H2H", "~$110K", "6x ROAS", "h2h"], ["FOUNDIT", "₹6.94 L", "10.1% EBT", "foundit"], ["RECONOS", "17", "leak checks", "reconos"],
    ["MIDPROC", "283", "tests", "mid"], ["PERFORA", "₹3 → ₹6 Cr", "plan", "perfora"], ["WOWWORLD", "₹5.2 Cr", "SOM", "wowworld"], ["NETWORK", "4", "launches", "pp-launches"]];
  function renderTick() {
    var one = TICK.map(function (t) { return '<a href="#/stock/' + t[3] + '"><b>' + t[0] + '</b><span class="v">' + t[1] + '</span><span class="c">▲ ' + t[2] + "</span></a>"; }).join("");
    $("#tick").innerHTML = '<div class="tick-tr">' + one + '<span aria-hidden="true" style="display:contents">' + one.replace(/<a /g, '<a tabindex="-1" ') + "</span></div>";
  }
  function renderFooter() {
    $("#ftr").innerHTML = '<div class="wrap ftr-in"><div>' + logo() + "<p>A product portfolio built in the image of an investing app, for Groww PM applications. " + esc(P.name) + " · " + esc(P.role) + ".</p></div>" +
      '<div><h4>Explore</h4><ul><li><a href="#/cases">All cases</a></li><li><a href="#/cases/payments">Payments &amp; Fintech</a></li><li><a href="#/cases/build">0→1 Builds</a></li><li><a href="#/fund">PhonePe Fund</a></li></ul></div>' +
      '<div><h4>Account</h4><ul><li><a href="#/holdings">Holdings (Experience)</a></li><li><a href="#/watchlist">Watchlist</a></li><li><a href="#/profile">Profile &amp; FAQs</a></li><li><a href="' + P.resume + '" download>Résumé (PDF)</a></li></ul></div>' +
      '<div><h4>Contact</h4><ul><li><a href="mailto:' + P.email + '">Email</a></li><li><a href="' + P.linkedin + '" target="_blank" rel="noopener">LinkedIn ↗</a></li><li><a href="' + P.phoneHref + '">' + esc(P.phone) + '</a></li><li><a href="' + P.portfolio + '" target="_blank" rel="noopener">Main portfolio ↗</a></li></ul></div>' +
      '<p class="disc">Independent job-application portfolio. Not affiliated with or endorsed by Groww or PhonePe; brand names belong to their owners and are used only to refer to the role and past employment. Nothing here is investment advice — the charts are decorative. Every figure is labelled Result, Built, Modelled, Target or Sourced.</p></div>';
  }

  /* ---------------- ROUTER ---------------- */
  var lastRoute = "", navCount = 0;
  function parse() {
    var raw = (location.hash || "#/").slice(1), qi = raw.indexOf("?");
    var path = (qi > -1 ? raw.slice(0, qi) : raw) || "/", qs = {};
    if (qi > -1) raw.slice(qi + 1).split("&").forEach(function (kv) { var a = kv.split("="); if (a[0]) qs[decodeURIComponent(a[0])] = decodeURIComponent(a[1] || ""); });
    return { parts: path.split("/").filter(Boolean), qs: qs, path: path };
  }
  function route() {
    var r = parse(), p = r.parts, view, title = "", cls = "r-home";
    if (p[0] === "p" && p[1]) { location.replace("#/stock/" + p[1]); return; }
    if (!p.length) { view = vHome(); }
    else if (p[0] === "cases") { var c = p[1] || "all"; if (!D.cats.some(function (x) { return x.id === c; })) c = "all"; if (r.qs.q != null) S.f.q = r.qs.q; view = vCases(c); title = catName(c); cls = "r-cases"; }
    else if (p[0] === "stock") { view = vStock(p[1]); title = byId[p[1]] ? byId[p[1]].short : "Not found"; cls = "r-stock"; }
    else if (p[0] === "fund") { view = vFund(); title = "PhonePe Fund"; cls = "r-fund"; }
    else if (p[0] === "holdings") { view = vHoldings(r.qs); title = "Holdings"; cls = "r-holdings"; }
    else if (p[0] === "watchlist") { view = vWatch(); title = "Watchlist"; cls = "r-watch"; }
    else if (p[0] === "profile" || p[0] === "help") { view = vProfile(); title = "Profile"; cls = "r-profile"; }
    else { view = vNotFound(); title = "Not found"; cls = "r-nf"; }
    document.body.className = document.body.className.replace(/\br-\S+/g, "").trim() + " " + cls;
    var v = $("#view"); v.innerHTML = view; v.classList.remove("view-in"); void v.offsetWidth; v.classList.add("view-in");
    document.title = (title ? title + " · " : "") + "groww × navya — Navya Juneja, Product Manager";
    if (r.path !== lastRoute) { window.scrollTo(0, 0); S.fltOpen = false; }
    lastRoute = r.path;
    markNav(); updMoney(); setHdrH();
    if (r.qs.o) { var el = $("#o-" + r.qs.o); if (el) setTimeout(function () { el.scrollIntoView({ block: "center", behavior: "smooth" }); }, 120); }
  }
  function rerender() { var y = window.scrollY; route(); window.scrollTo(0, y); }
  function setHdrH() { var h = $("#hdr").offsetHeight; document.documentElement.style.setProperty("--hdr-h", h + "px"); }

  /* ---------------- sheets ---------------- */
  function openSheet(html, cls) { var s = $("#sheet"); s.className = "sheet " + (cls || ""); s.innerHTML = html; requestAnimationFrame(function () { s.classList.add("on"); $("#scrim").classList.add("on"); }); document.body.classList.add("no-scroll"); var f = $("button, a, input", s); if (f) setTimeout(function () { f.focus(); }, 60); }
  function closeSheet() { $("#sheet").classList.remove("on"); $("#scrim").classList.remove("on"); document.body.classList.remove("no-scroll"); }
  function sheetHead(h) { return '<div class="sheet-h"><h3>' + esc(h) + '</h3><button class="ib bare" data-act="close" aria-label="Close">' + I.x + "</button></div>"; }
  function hireSheet(id) {
    var p = byId[id];
    var subj = "Interview: Navya Juneja — " + S.role + (p ? " (re: " + p.short + ")" : "");
    var body = "Hi Navya,\n\nI saw your groww × navya portfolio" + (p ? " — " + p.name : "") + ".\nWe'd like to talk about a " + S.role + " role.\n\n";
    var href = "mailto:" + P.email + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(body);
    openSheet('<div class="placed"><div class="ck">' + I.check + "</div><h3>Interview order placed</h3><p>Pending confirmation from your side — send it and Navya replies within a day.</p>" +
      '<div class="od">' + (p ? "<div><span>Case</span><b>" + esc(p.short) + "</b></div>" : "") + "<div><span>Role</span><b>" + esc(S.role) + "</b></div><div><span>Rounds</span><b>" + S.qty + "</b></div><div><span>Joining</span><b>Immediate</b></div><div><span>Brokerage</span><b class=\"up\">₹0</b></div></div>" +
      '<div class="acts"><a class="btn lg block" href="' + href + '">' + I.mail + 'Send interview request</a><a class="btn ol block" href="' + P.phoneHref + '">' + I.phone + esc(P.phone) + '</a><a class="btn ol block" href="' + P.linkedin + '" target="_blank" rel="noopener">' + I.linkedin + "Connect on LinkedIn</a></div></div>");
  }
  function lightbox(id, i) {
    var p = byId[id], imgs = p.media.filter(function (m) { return m.type === "img"; });
    var m = p.media[i]; var k = imgs.indexOf(m);
    openSheet('<div class="lb"><img src="' + m.src + '" alt="' + esc(m.alt) + '"><button class="x" data-act="close" aria-label="Close">' + I.x + "</button>" +
      (imgs.length > 1 ? '<button class="nv p" data-act="lbn" data-id="' + id + '" data-k="' + p.media.indexOf(imgs[(k - 1 + imgs.length) % imgs.length]) + '" aria-label="Previous">' + I.back + '</button><button class="nv n" data-act="lbn" data-id="' + id + '" data-k="' + p.media.indexOf(imgs[(k + 1) % imgs.length]) + '" aria-label="Next">' + I.chev + "</button>" : "") +
      "<p>" + esc(m.alt) + " · " + (k + 1) + " / " + imgs.length + "</p></div>", "wide");
  }
  function mSearch() {
    openSheet(sheetHead("Search") + '<div class="sheet-b"><div class="srch" style="width:100%"><form data-act="searchform" role="search"><span aria-hidden="true">' + I.search + '</span><input id="q2" data-q type="search" autocomplete="off" placeholder="Search cases, skills, CASE-03…" aria-label="Search case studies"></form></div><div id="q2r" style="margin-top:10px">' + results("") + "</div></div>");
  }

  /* ---------------- toast ---------------- */
  var tt;
  function toast(html) { var el = $("#toast"); el.innerHTML = html; el.classList.add("on"); clearTimeout(tt); tt = setTimeout(function () { el.classList.remove("on"); }, 2600); }

  /* ---------------- actions ---------------- */
  function toggleWatch(id) {
    var i = S.watch.indexOf(id);
    if (i > -1) S.watch.splice(i, 1); else S.watch.push(id);
    save("watch", S.watch);
    renderShell(); rerender();
    toast(i < 0 ? 'Added to watchlist <a href="#/watchlist">View</a>' : "Removed from watchlist");
  }
  function copyLink() {
    var u = location.href;
    function ok() { toast("Link copied"); }
    if (navigator.clipboard) navigator.clipboard.writeText(u).then(ok, function () { toast("Copy this: " + esc(u)); }); else toast("Copy this: " + esc(u));
  }
  function jump(k) {
    var el = document.getElementById(k); if (!el) return;
    $$(".stabs a").forEach(function (a) { a.classList.toggle("on", a.getAttribute("data-k") === k); });
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-act]"); if (!el) return;
    var a = el.getAttribute("data-act"), id = el.getAttribute("data-id"), k = el.getAttribute("data-k");
    switch (a) {
      case "watch": e.preventDefault(); e.stopPropagation(); toggleWatch(id); break;
      case "hire": e.preventDefault(); hireSheet(id || (parse().parts[0] === "stock" ? parse().parts[1] : null)); break;
      case "close": closeSheet(); break;
      case "back": if (navCount > 0) history.back(); else location.hash = "#/"; break;
      case "mv": S.mv = k; var m = $("#movers"); if (m) m.outerHTML = movers(); break;
      case "rng": S.rng = k; $$(".rng button").forEach(function (b) { b.classList.toggle("on", b === el); }); $("#chart").innerHTML = bigChart(id) + '<span class="note">Trend line is decorative — the numbers on this page carry their own labels.</span>'; break;
      case "jump": e.preventDefault(); jump(k); break;
      case "optab": S.opTab = k; rerender(); break;
      case "qty": S.qty = Math.max(1, Math.min(5, S.qty + (+k))); $$("#qtyOut").forEach(function (o) { o.textContent = S.qty; }); break;
      case "copy": copyLink(); break;
      case "share": if (navigator.share) navigator.share({ title: document.title, url: location.href }).catch(function () {}); else copyLink(); break;
      case "alert": toast("Alert set — you'll hear back as soon as Navya does 🔔"); break;
      case "lb": case "lbn": lightbox(id, +k); break;
      case "htab": e.preventDefault(); S.htab = k; rerender(); break;
      case "otoggle": var o = $("#o-" + id), op = o.classList.toggle("open"); el.setAttribute("aria-expanded", op); break;
      case "seg": $$(".seg button").forEach(function (b) { b.classList.toggle("on", b === el); }); var ov = $("#ovR"); ov.value = el.getAttribute("data-v") === "200" ? 2000 : 25000; updMoney(); break;
      case "flt": S.fltOpen = !S.fltOpen; $(".flt").classList.toggle("on", S.fltOpen); break;
      case "clr": S.f = { sort: S.f.sort, seller: [], prov: [], q: "" }; $$("[data-q]").forEach(function (i) { i.value = ""; }); if (location.hash.indexOf("?") > -1) location.hash = "#/cases"; else rerender(); break;
      case "clrq": S.f.q = ""; $$("[data-q]").forEach(function (i) { i.value = ""; }); if (location.hash.indexOf("?") > -1) location.hash = "#/cases"; else rerender(); break;
      case "msearch": mSearch(); break;
    }
  });
  document.addEventListener("change", function (e) {
    var el = e.target, a = el.getAttribute("data-act");
    if (a === "sort") { S.f.sort = el.value; rerender(); }
    if (a === "role") { S.role = el.value; }
    if (a === "chk") { var k = el.getAttribute("data-k"), arr = S.f[k], ix = arr.indexOf(el.value); if (el.checked && ix < 0) arr.push(el.value); if (!el.checked && ix > -1) arr.splice(ix, 1); rerender(); if (S.fltOpen) $(".flt").classList.add("on"); }
  });
  function showDrop(inp) {
    if (inp.id === "q2") { $("#q2r").innerHTML = results(inp.value); return; }
    var d = $("#" + inp.id + "d"); if (!d) return; d.innerHTML = results(inp.value); d.classList.add("on");
  }
  document.addEventListener("input", function (e) {
    var el = e.target;
    if (el.hasAttribute("data-q")) showDrop(el);
    if (el.getAttribute("data-act") === "money") updMoney();
  });
  document.addEventListener("focusin", function (e) { if (e.target.hasAttribute && e.target.hasAttribute("data-q") && e.target.id === "q1") showDrop(e.target); });
  document.addEventListener("mousedown", function (e) { if (!e.target.closest(".srch")) $$(".sdrop").forEach(function (d) { d.classList.remove("on"); }); });
  document.addEventListener("submit", function (e) {
    if (e.target.getAttribute("data-act") === "searchform") {
      e.preventDefault(); var i = $("input", e.target); S.f.q = i.value; i.blur();
      $$(".sdrop").forEach(function (d) { d.classList.remove("on"); }); closeSheet();
      var target = "#/cases" + (i.value ? "?q=" + encodeURIComponent(i.value) : "");
      if (location.hash === target) rerender(); else location.hash = target;
    }
  });
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) { e.preventDefault(); var q = $("#q1"); if (q && q.offsetParent) q.focus(); else mSearch(); }
    if (e.key === "Escape") { closeSheet(); $$(".sdrop").forEach(function (d) { d.classList.remove("on"); }); }
    if (e.target.hasAttribute && e.target.hasAttribute("data-q") && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      var box = e.target.id === "q2" ? $("#q2r") : $("#" + e.target.id + "d"); if (!box) return;
      var it = $$(".sres", box), cur = it.findIndex(function (x) { return x.classList.contains("act"); });
      if (!it.length) return; e.preventDefault();
      var nx = (cur + (e.key === "ArrowDown" ? 1 : -1) + it.length) % it.length;
      it.forEach(function (x, j) { x.classList.toggle("act", j === nx); });
    }
    if (e.target.hasAttribute && e.target.hasAttribute("data-q") && e.key === "Enter") {
      var b = e.target.id === "q2" ? $("#q2r") : $("#" + e.target.id + "d"), act = b && $(".sres.act", b);
      if (act && e.target.value.trim()) { e.preventDefault(); e.target.blur(); $$(".sdrop").forEach(function (d) { d.classList.remove("on"); }); closeSheet(); location.hash = act.getAttribute("href"); }
    }
  });
  $("#scrim").addEventListener("click", closeSheet);
  window.addEventListener("hashchange", function () { navCount++; closeSheet(); $$(".sdrop").forEach(function (d) { d.classList.remove("on"); }); route(); });
  window.addEventListener("resize", setHdrH);
  /* keep stock-page section tabs in sync while scrolling */
  window.addEventListener("scroll", function () {
    if (!document.body.classList.contains("r-stock")) return;
    var tabs = $$(".stabs a"); if (!tabs.length) return;
    var cur = tabs[0].getAttribute("data-k");
    tabs.forEach(function (a) { var s = document.getElementById(a.getAttribute("data-k")); if (s && s.getBoundingClientRect().top < window.innerHeight * 0.35) cur = a.getAttribute("data-k"); });
    tabs.forEach(function (a) { a.classList.toggle("on", a.getAttribute("data-k") === cur); });
  }, { passive: true });

  /* rotating placeholder */
  var phs = ["Search cases, skills, CASE-03…", "Try “payments”", "Try “pricing”", "Try “PhonePe”", "Try “RECONOS”"], phi = 0;
  setInterval(function () { phi = (phi + 1) % phs.length; $$("[data-q]").forEach(function (i) { if (document.activeElement !== i) i.placeholder = phs[phi]; }); }, 2800);

  /* ---------------- SPLASH ---------------- */
  function splash() {
    var sp = $("#splash"); if (!sp) return;
    var seen = false; try { seen = sessionStorage.getItem("gxn_seen") === "1"; } catch (e) {}
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var dur = seen ? 1100 : (reduce ? 900 : 3300), done = false;
    function end() { if (done) return; done = true; sp.classList.add("out"); document.body.classList.remove("no-scroll"); setTimeout(function () { sp.classList.add("gone"); sp.setAttribute("aria-hidden", "true"); }, 650); try { sessionStorage.setItem("gxn_seen", "1"); } catch (e) {} }
    document.body.classList.add("no-scroll");
    $("#spSkip").addEventListener("click", end);
    sp.addEventListener("click", function (e) { if (e.target.id !== "spSkip") end(); });
    setTimeout(end, dur);
  }

  /* ---------------- boot ---------------- */
  renderShell(); renderTick(); renderFooter(); route(); splash();
})();
