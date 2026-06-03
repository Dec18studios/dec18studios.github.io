/* ════════════════════════════════════════════════════════════════════════
   DEC. 18 STUDIOS — Project detail page (shared renderer)
   Each projects/<slug>/index.html defines window.PROJECT then loads this file.
   It builds the whole page from that one object, so a project file is just data.

   window.PROJECT = {
     slug, title,
     category,            // "Narrative"
     role,                // "Color Grade"
     deliverables,        // "1 Deliverable · Custom Look Design & Correction"  (optional)
     color,               // hue vector name: red yellow green cyan blue magenta amber
     credits: [ { role: "Director", name: "Dave Clark" }, ... ],
     vimeo: "",           // (legacy) Vimeo id/url — prefer "video" below
     video: "",           // YouTube OR Vimeo — id or any share/watch URL (optional — omit to hide the player)
     hero: "",            // hero still URL (CDN)
     stills: [ "url", ... ],
     prev: { slug, title } | null,
     next: { slug, title } | null
   };
   ════════════════════════════════════════════════════════════════════════ */
(function () {
  var P = window.PROJECT || {};
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var accent = "var(--" + esc(P.color || "amber") + ")";

  /* document title */
  if (P.title) document.title = P.title + " — Dec. 18 Studios";

  /* build a YouTube or Vimeo embed src from an id or any share/watch URL */
  function videoEmbedSrc(v) {
    if (!v) return null;
    v = String(v).trim();
    var m;
    if ((m = v.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/)))
      return "https://www.youtube-nocookie.com/embed/" + m[1] + "?rel=0&modestbranding=1";
    if ((m = v.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/(\w+))?/)))
      return "https://player.vimeo.com/video/" + m[1] + (m[2] ? "?h=" + m[2] + "&" : "?") + "title=0&byline=0&portrait=0&dnt=1";
    if (/^\d+$/.test(v))   // bare number → Vimeo id
      return "https://player.vimeo.com/video/" + v + "?title=0&byline=0&portrait=0&dnt=1";
    return "https://www.youtube-nocookie.com/embed/" + v + "?rel=0&modestbranding=1";  // bare id → YouTube
  }
  var vsrc = videoEmbedSrc(P.video || P.vimeo);

  var credits = (P.credits || []).map(function (c) {
    return '<div class="cred"><span class="r">' + esc(c.role) + '</span><span class="n">' + esc(c.name) + '</span></div>';
  }).join("");

  var stills = (P.stills || []).map(function (src, i) {
    return '<button class="still" data-i="' + i + '" style="background-image:url(\'' + esc(src) + '\')" aria-label="View still ' + (i + 1) + '"></button>';
  }).join("");

  function navItem(side, p) {
    if (!p) return '<a class="' + side + ' disabled"><span class="lab">' + (side === "next" ? "Next" : "Previous") + '</span><span class="nm">—</span></a>';
    return '<a class="' + side + '" href="../' + esc(p.slug) + '/"><span class="lab">' + (side === "next" ? "Next project" : "Previous project") + '</span><span class="nm">' + esc(p.title) + '</span></a>';
  }

  var html =
    '<header class="topbar" id="topbar"><div class="row">' +
      '<a class="logo" href="https://dec18studios.com/" aria-label="Dec. 18 Studios"></a>' +
      '<nav class="toplinks">' +
        '<a class="lnk" href="https://dec18studios.com/#about">Studio</a>' +
        '<a class="lnk" href="https://dec18studios.com/color-grading-tools">Tools</a>' +
        '<a class="lnk current" href="../">Work</a>' +
        '<a class="btn btn-amber" href="../#book">Book a session</a>' +
      '</nav>' +
    '</div></header>' +

    '<section class="phero" data-screen-label="Project hero">' +
      '<div class="phero-bg"' + (P.hero ? ' style="background-image:url(\'' + esc(P.hero) + '\')"' : '') + '></div>' +
      '<div class="phero-scrim"></div>' +
      '<div class="phero-inner"><div class="wrap">' +
        '<a class="backlink" href="../"><span class="arr">←</span> Back to portfolio</a>' +
        '<div class="cat"><span class="eyebrow">' + esc(P.category || "") + (P.role ? ' · ' + esc(P.role) : "") + '</span></div>' +
        '<h1>' + esc(P.title || "") + '</h1>' +
        (P.deliverables ? '<div class="deliv">' + esc(P.deliverables) + '</div>' : "") +
      '</div></div>' +
      '<div class="phero-tape"></div>' +
    '</section>' +

    (credits ? '<div class="credits"><div class="wrap">' + credits + '</div></div>' : "") +

    (vsrc ?
      '<section class="band"><div class="wrap reveal">' +
        '<div class="kicker"><span class="eyebrow">Watch</span></div>' +
        '<div class="player"><iframe src="' + esc(vsrc) + '" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>' +
      '</div></section>' : "") +

    (stills ?
      '<section class="band"' + (vsrc ? ' style="padding-top:0"' : "") + '><div class="wrap reveal">' +
        '<div class="kicker"><span class="eyebrow">Stills</span></div>' +
        '<div class="stills-grid" id="stillsGrid">' + stills + '</div>' +
      '</div></section>' : "") +

    '<nav class="pnav"><div class="wrap">' + navItem("prev", P.prev) + navItem("next", P.next) + '</div></nav>' +

    '<section class="band cta-band"><div class="wrap reveal">' +
      '<h2>Like what you see?<br />Let\'s talk about yours.</h2>' +
      '<p>Tell us about your film and we\'ll get back to you, usually within a day.</p>' +
      '<div class="row">' +
        '<a class="btn btn-amber" href="../#book">Start a project →</a>' +
        '<a class="btn btn-ghost" href="../">See more work</a>' +
      '</div>' +
    '</div></section>' +

    '<footer class="site"><div class="wrap"><div class="foot-grid">' +
      '<div class="foot-brand"><a class="logo" href="https://dec18studios.com/" aria-label="Dec. 18 Studios"></a>' +
        '<p>A color and finishing studio. Based remote, serving Southern CA, Los Angeles, and beyond.</p></div>' +
      '<div class="foot-col"><h4>Studio</h4>' +
        '<a href="https://dec18studios.com/#about">What we do</a>' +
        '<a href="../">Portfolio</a>' +
        '<a href="https://dec18studios.com/color-grading-tools">Color grading tools</a>' +
        '<a href="../#book">Book a project</a></div>' +
      '<div class="foot-col"><h4>Contact</h4>' +
        '<a href="mailto:create@dec18studios.com">create@dec18studios.com</a>' +
        '<p>(708) 476-3598</p>' +
        '<a href="https://www.youtube.com/@dec.18Studios">YouTube</a>' +
        '<a href="https://www.instagram.com/dec18studios">Instagram</a></div>' +
    '</div></div>' +
    '<div class="foot-bottom"><span>© <span id="yr"></span> Dec. 18 Studios</span><span>Capturing &amp; refining moments.</span></div></footer>' +

    '<div class="lightbox" id="lightbox"><span class="lb-close" id="lbClose">Close ✕</span>' +
      '<span class="lb-nav lb-prev" id="lbPrev">‹</span>' +
      '<img id="lbImg" alt="" />' +
      '<span class="lb-nav lb-next" id="lbNext">›</span>' +
    '</div>';

  /* set accent + paint */
  document.documentElement.style.setProperty("--accent", accent);
  var mount = document.getElementById("app") || document.body;
  mount.innerHTML = html;

  document.getElementById("yr").textContent = new Date().getFullYear();

  /* sticky bar */
  var bar = document.getElementById("topbar");
  var onScroll = function () { bar.classList.toggle("scrolled", window.scrollY > 40); };
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

  /* lightbox */
  var box = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var shots = P.stills || [];
  var cur = 0;
  function open(i) { cur = i; lbImg.src = shots[i]; box.classList.add("on"); }
  function close() { box.classList.remove("on"); lbImg.src = ""; }
  function step(d) { cur = (cur + d + shots.length) % shots.length; lbImg.src = shots[cur]; }
  var grid = document.getElementById("stillsGrid");
  if (grid) grid.addEventListener("click", function (e) {
    var b = e.target.closest(".still"); if (b) open(+b.dataset.i);
  });
  document.getElementById("lbClose").addEventListener("click", close);
  box.addEventListener("click", function (e) { if (e.target === box || e.target === lbImg) close(); });
  document.getElementById("lbPrev").addEventListener("click", function (e) { e.stopPropagation(); step(-1); });
  document.getElementById("lbNext").addEventListener("click", function (e) { e.stopPropagation(); step(1); });
  document.addEventListener("keydown", function (e) {
    if (!box.classList.contains("on")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") step(-1);
    else if (e.key === "ArrowRight") step(1);
  });

  /* reveal */
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var els = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); }
  else {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  }
})();
