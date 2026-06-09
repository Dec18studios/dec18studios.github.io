/* ============================================================
   Color Slicer — landing page interactions
   - Hero hue wheel: pick one vector, the slice glows, rest dims
   - Two-axis selection field: hue × luma mask blob, asymmetric
   - Three rotation-mode loops: Oklab rotate / Tetrahedral shove / Gravity
   - Whip curve: chroma-bias power curve plot
   These are cosmetic visualisations, not the production grading math.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- shared helpers ---------- */
  function hsv2rgb(h, s, v) {
    // h in [0,1)
    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);
    var r, g, b;
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      default: r = v; g = p; b = q; break;
    }
    return [r * 255, g * 255, b * 255];
  }
  function signedHueDelta(hueDeg, centerDeg) {
    var d = ((hueDeg - centerDeg + 540) % 360) - 180;
    return d; // -180..180, sign tells which flank
  }
  function hueMask(hueDeg, center, wL, wR) {
    var d = signedHueDelta(hueDeg, center);
    var w = d < 0 ? wL : wR;
    if (w < 1) w = 1;
    return Math.exp(-(d * d) / (2 * w * w));
  }
  function lumaMask(y, center, wLo, wHi, trapezoid) {
    // y in 0..1
    var d = y - center;
    var w = d < 0 ? wLo : wHi;
    if (w < 0.01) w = 0.01;
    if (trapezoid) {
      var plateau = w * 0.55;
      var ad = Math.abs(d);
      if (ad <= plateau) return 1;
      var edge = (ad - plateau) / (w * 0.9);
      return Math.max(0, 1 - edge);
    }
    return Math.exp(-(d * d) / (2 * w * w));
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function osc(t, period, phase) { return (Math.sin((t / period + (phase || 0)) * Math.PI * 2) + 1) / 2; }
  function tri(t, period) { var p = (t % period) / period; return p < 0.5 ? p * 2 : 2 - p * 2; }
  function rad(d) { return d * Math.PI / 180; }
  function polar(cx, cy, r, ang) { var a = rad(ang); return [cx + r * Math.sin(a), cy - r * Math.cos(a)]; }
  function $(id) { return document.getElementById(id); }

  /* angle convention: clockwise from top, Red 0° … Magenta 300° */
  var VECTORS = [
    { name: "Red", hue: 0, varc: "--red" },
    { name: "Yellow", hue: 60, varc: "--yellow" },
    { name: "Green", hue: 120, varc: "--green" },
    { name: "Cyan", hue: 180, varc: "--cyan" },
    { name: "Blue", hue: 240, varc: "--blue" },
    { name: "Magenta", hue: 300, varc: "--magenta" },
    { name: "Skin", hue: 32, varc: "--gravity" }
  ];

  /* ============================================================
     0 · BEFORE / AFTER COMPARE SLIDER (hero)
     ============================================================ */
  (function compare() {
    var box = $("baCompare");
    if (!box) return;
    var after = $("baAfter");
    var handle = $("baHandle");
    function set(pct) {
      pct = Math.max(0, Math.min(100, pct));
      after.style.width = pct + "%";
      handle.style.left = pct + "%";
      var aimg = after.querySelector("img");
      if (aimg) aimg.style.width = box.clientWidth + "px";
    }
    function fromEvent(e) {
      var r = box.getBoundingClientRect();
      var cx = (e.touches ? e.touches[0].clientX : e.clientX);
      set(((cx - r.left) / r.width) * 100);
    }
    var dragging = false;
    box.addEventListener("pointerdown", function (e) { dragging = true; box.setPointerCapture(e.pointerId); fromEvent(e); });
    box.addEventListener("pointermove", function (e) { if (dragging) fromEvent(e); });
    box.addEventListener("pointerup", function () { dragging = false; });
    box.addEventListener("pointercancel", function () { dragging = false; });
    window.addEventListener("resize", function () { var aimg = after.querySelector("img"); if (aimg) aimg.style.width = box.clientWidth + "px"; });
    // start at 50%, after both images decode
    var imgs = box.querySelectorAll("img");
    var done = 0;
    imgs.forEach(function (im) {
      if (im.complete) { if (++done === imgs.length) set(50); }
      else im.addEventListener("load", function () { if (++done === imgs.length) set(50); });
    });
    set(50);
  })();

  /* ============================================================
     1 · HERO HUE WHEEL — slice one colour out
     ============================================================ */
  (function heroWheel() {
    var canvas = $("sliceWheel");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var stage = canvas.parentElement;

    var state = { center: 32, width: 26, show: false };
    var SIZE = 300;
    var img = ctx.createImageData(SIZE, SIZE);

    function render() {
      canvas.width = SIZE; canvas.height = SIZE;
      var data = img.data;
      var cx = SIZE / 2, cy = SIZE / 2, R = SIZE / 2;
      for (var y = 0; y < SIZE; y++) {
        for (var x = 0; x < SIZE; x++) {
          var dx = x - cx, dy = y - cy;
          var dist = Math.sqrt(dx * dx + dy * dy);
          var idx = (y * SIZE + x) * 4;
          if (dist > R) { data[idx + 3] = 0; continue; }
          var ang = (Math.atan2(-dx, -dy) * 180 / Math.PI + 360) % 360; // counter-clockwise from top (vectorscope convention)
          var sat = Math.min(1, dist / R);
          var rgb = hsv2rgb(ang / 360, sat, 1);
          var m = hueMask(ang, state.center, state.width, state.width);
          var r, g, b;
          if (state.show) {
            // Show Effected: only the selection stays lit, everything else goes to black
            var lit = m * m;
            r = rgb[0] * lit; g = rgb[1] * lit; b = rgb[2] * lit;
            var glowS = m * m * 38; r += glowS; g += glowS; b += glowS;
          } else {
            // non-selected sits well back: dark and desaturated
            var gray = 0.16 * (rgb[0] + rgb[1] + rgb[2]) / 3 + 0.02 * 255;
            var keep = 0.07 + 0.93 * m;
            r = lerp(gray, rgb[0], keep);
            g = lerp(gray, rgb[1], keep);
            b = lerp(gray, rgb[2], keep);
            var glow = m * m * 46;
            r += glow; g += glow; b += glow;
          }
          var edge = 1 - Math.max(0, (dist - (R - 1.5)) / 1.5);
          data[idx] = Math.min(255, r);
          data[idx + 1] = Math.min(255, g);
          data[idx + 2] = Math.min(255, b);
          data[idx + 3] = 255 * Math.max(0, edge);
        }
      }
      ctx.putImageData(img, 0, 0);
      placeMarker();
    }

    function placeMarker() {
      var marker = $("sliceMarker");
      if (!marker) return;
      var a = state.center * Math.PI / 180;
      marker.style.left = (50 - 50 * Math.sin(a)) + "%"; // counter-clockwise, matches the wheel
      marker.style.top = (50 - 50 * Math.cos(a)) + "%";
      marker.style.background = "var(" + nearestVarc(state.center) + ")";
    }
    function nearestVarc(c) {
      var best = VECTORS[0], bd = 999;
      VECTORS.forEach(function (v) {
        var d = Math.abs(signedHueDelta(v.hue, c));
        if (d < bd) { bd = d; best = v; }
      });
      return best.varc;
    }

    // vector chips
    var chips = $("wheelVectors");
    VECTORS.forEach(function (v) {
      var b = document.createElement("button");
      b.className = "vchip";
      b.type = "button";
      b.innerHTML = '<span class="sw" style="background:var(' + v.varc + ')"></span>' + v.name;
      b.addEventListener("click", function () {
        state.center = v.hue;
        chips.querySelectorAll(".vchip").forEach(function (c) { c.classList.remove("on"); });
        b.classList.add("on");
        render();
      });
      if (v.name === "Skin") b.classList.add("on");
      chips.appendChild(b);
    });

    var wEl = $("wheelWidth");
    if (wEl) wEl.addEventListener("input", function () {
      state.width = +wEl.value;
      var out = $("wheelWidthOut"); if (out) out.textContent = state.width + "°";
      render();
    });
    var showEl = $("wheelShow");
    if (showEl) showEl.addEventListener("click", function () {
      state.show = showEl.getAttribute("aria-pressed") !== "true";
      showEl.setAttribute("aria-pressed", state.show ? "true" : "false");
      render();
    });

    render();
  })();

  /* ============================================================
     2 · TWO-AXIS SELECTION FIELD — hue × luma mask
     ============================================================ */
  (function field() {
    var canvas = $("axisField");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var W = 520, H = 300;
    var img = ctx.createImageData(W, H);

    var s = {
      hc: 32, hL: 30, hR: 22,         // hue center + asymmetric flanks (deg)
      lc: 0.46, lLo: 0.16, lHi: 0.10, // luma center + asymmetric flanks
      trap: false
    };

    function render() {
      canvas.width = W; canvas.height = H;
      var data = img.data;
      for (var y = 0; y < H; y++) {
        var lum = 1 - y / (H - 1);            // top = bright
        var lm = lumaMask(lum, s.lc, s.lLo, s.lHi, s.trap);
        for (var x = 0; x < W; x++) {
          var hue = (x / (W - 1)) * 360;       // left→right hue sweep
          var hm = hueMask(hue, s.hc, s.hL, s.hR);
          var m = hm * lm;
          var rgb = hsv2rgb(hue / 360, 0.62, 0.30 + 0.55 * lum);
          var idx = (y * W + x) * 4;
          // background dim, selection glows additively
          var base = 0.22;
          var r = rgb[0] * (base + 0.30 * m);
          var g = rgb[1] * (base + 0.30 * m);
          var b = rgb[2] * (base + 0.30 * m);
          var glow = m * 150;
          data[idx] = Math.min(255, r + glow * 0.9);
          data[idx + 1] = Math.min(255, g + glow * 0.85);
          data[idx + 2] = Math.min(255, b + glow * 0.8);
          data[idx + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
    }

    function bind(id, key, out, scale, suffix) {
      var el = $(id); if (!el) return;
      el.addEventListener("input", function () {
        s[key] = +el.value;
        var o = $(out);
        if (o) o.textContent = (scale ? (s[key] * scale).toFixed(0) : (+el.value)) + (suffix || "");
        render();
      });
    }
    bind("fHueC", "hc", "fHueCOut", 1, "°");
    bind("fHueL", "hL", "fHueLOut", 1, "°");
    bind("fHueR", "hR", "fHueROut", 1, "°");
    bind("fLumC", "lc", "fLumCOut", 100, "%");
    bind("fLumLo", "lLo", "fLumLoOut", 100, "%");
    bind("fLumHi", "lHi", "fLumHiOut", 100, "%");

    var shape = $("fShape");
    if (shape) shape.addEventListener("change", function () {
      s.trap = shape.value === "trap";
      render();
    });

    render();
  })();

  /* ---- static skin selection blob (skin section) ---- */
  (function skinField() {
    var canvas = $("skinField");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var W = 460, H = 260;
    var img = ctx.createImageData(W, H);
    // skin band: hue ~32°, tight, luma midtones, highlights protected (small hi flank)
    var s = { hc: 32, hL: 20, hR: 26, lc: 0.5, lLo: 0.22, lHi: 0.09, trap: false };
    canvas.width = W; canvas.height = H;
    var data = img.data;
    for (var y = 0; y < H; y++) {
      var lum = 1 - y / (H - 1);
      var lm = lumaMask(lum, s.lc, s.lLo, s.lHi, s.trap);
      for (var x = 0; x < W; x++) {
        var hue = (x / (W - 1)) * 360;
        var m = hueMask(hue, s.hc, s.hL, s.hR) * lm;
        var rgb = hsv2rgb(hue / 360, 0.62, 0.30 + 0.55 * lum);
        var idx = (y * W + x) * 4;
        var base = 0.22, glow = m * 150;
        data[idx] = Math.min(255, rgb[0] * (base + 0.30 * m) + glow * 0.9);
        data[idx + 1] = Math.min(255, rgb[1] * (base + 0.30 * m) + glow * 0.85);
        data[idx + 2] = Math.min(255, rgb[2] * (base + 0.30 * m) + glow * 0.8);
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  })();

  /* ============================================================
     3 · WHIP CURVE — chroma-dependent rotation rate
     low-sat values anchor the rotation; high-chroma values lead (+)
     or lag (−) depending on the whip amount.
     ============================================================ */
  (function whip() {
    var path = $("whipPath");
    var area = $("whipArea");
    if (!path) return;
    var x0 = 60, x1 = 560, base = 145, amp = 98;
    var hi = $("whipHigh");
    function build(w) {
      var d = "", endY = base;
      for (var i = 0; i <= 60; i++) {
        var t = i / 60;                              // chroma: low → high
        var py = base - w * amp * Math.pow(t, 1.3);  // anchored at low sat, diverges toward high sat
        var px = lerp(x0, x1, t);
        if (i === 60) endY = py;
        d += (i === 0 ? "M" : "L") + px.toFixed(1) + " " + py.toFixed(1) + " ";
      }
      path.setAttribute("d", d.trim());
      if (area) area.setAttribute("d", d.trim() + " L" + x1 + " " + base + " L" + x0 + " " + base + " Z");
      if (hi) hi.setAttribute("cy", endY.toFixed(1));
    }
    var el = $("whipSlider");
    function update() {
      var w = el ? +el.value : 0;        // -1..1
      build(w);
      var out = $("whipOut");
      if (out) out.textContent = (w >= 0 ? "+" : "\u2212") + Math.abs(w).toFixed(2);
      var lab = $("whipBias");
      if (lab) lab.textContent = w > 0.04 ? "high chroma leads" : (w < -0.04 ? "high chroma lags" : "uniform rotation");
    }
    if (el) el.addEventListener("input", update);
    update();
  })();

  /* ============================================================
     4 · THREE ROTATION-MODE LOOPS
     run only while their card is on screen (IntersectionObserver)
     ============================================================ */
  var loops = [];
  function regLoop(el, fn) { if (el) loops.push({ el: el, fn: fn, on: true }); }

  /* --- Oklab: rigid lockstep rotation --- */
  (function () {
    var g = $("okDots");
    regLoop($("okStage"), function (t) {
      var th = lerp(-44, 44, osc(t, 5200));
      if (g) g.setAttribute("transform", "rotate(" + th.toFixed(2) + " 130 130)");
      var r = $("okTheta");
      if (r) r.textContent = (th >= 0 ? "+" : "\u2212") + Math.abs(Math.round(th)) + "\u00B0";
    });
  })();

  /* --- Tetrahedral: corner shove, weighted follow --- */
  (function () {
    var CR = [430, 305], TO = [-70, 40];
    regLoop($("tetraStage"), function (t) {
      var k = osc(t, 4200);
      var x = CR[0] + TO[0] * k, y = CR[1] + TO[1] * k;
      var c = $("tetraCorner");
      if (c) { c.setAttribute("cx", x.toFixed(1)); c.setAttribute("cy", y.toFixed(1)); }
      var v = $("tetraVec");
      if (v) { v.setAttribute("x2", x.toFixed(1)); v.setAttribute("y2", y.toFixed(1)); }
      for (var i = 1; i <= 3; i++) {
        var d = $("tetraP" + i); if (!d) continue;
        var w = +d.getAttribute("data-w");
        var bx = +d.getAttribute("data-bx"), by = +d.getAttribute("data-by");
        d.setAttribute("cx", (bx + (x - CR[0]) * w).toFixed(1));
        d.setAttribute("cy", (by + (y - CR[1]) * w).toFixed(1));
      }
      var r = $("tetraRm");
      if (r) r.textContent = (k * 0.6).toFixed(2);
    });
  })();

  /* --- Gravity: attract / repel around an anchor --- */
  (function () {
    var ANCHOR = 40, RANGE = 95;
    var BASE = [-46, -24, -10, 14, 30, 58, 80, 104];
    regLoop($("gravStage"), function (t) {
      var strength = osc(t, 3600); // 0..1 — always gathering toward the anchor, then releasing
      for (var i = 0; i < BASE.length; i++) {
        var off = BASE[i];
        var norm = Math.min(1, Math.abs(off) / RANGE);
        var taper = Math.sin(Math.PI * norm);
        var move = -off * 0.6 * strength * taper;
        var p = polar(130, 130, 96, ANCHOR + off + move);
        var dot = $("gravD" + i);
        if (dot) { dot.setAttribute("cx", p[0].toFixed(1)); dot.setAttribute("cy", p[1].toFixed(1)); }
      }
      var lbl = $("gravMode");
      if (lbl) { lbl.textContent = "CONSOLIDATE +"; lbl.style.color = "var(--gravity)"; }
    });
  })();

  // visibility gating
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        loops.forEach(function (l) { if (l.el === e.target) l.on = e.isIntersecting; });
      });
    }, { threshold: 0.15 });
    loops.forEach(function (l) { io.observe(l.el); });
  } else {
    loops.forEach(function (l) { l.on = true; });
  }

  var t0 = performance.now();
  loops.forEach(function (l) { try { l.fn(900); } catch (e) {} }); // representative first frame
  function frame(now) {
    var t = now - t0;
    for (var i = 0; i < loops.length; i++) if (loops[i].on) { try { loops[i].fn(t); } catch (e) {} }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- scroll reveal ---------- */
  var ro = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(function (el) { ro.observe(el); });
})();
