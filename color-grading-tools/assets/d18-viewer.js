/* Dec. 18 Studios · image viewer (pairs with assets/d18-print.css)
 *
 * Lightbox: any <img data-full="path/to/original.jpg"> opens full size on a
 * neutral black stage. Shows the web copy instantly, swaps in the original
 * once it loads. Optional data-cap (caption) and data-link (tool page).
 * Any <a data-full="..."> link opens the same way. Esc / arrows / click out.
 *
 * Before/after: <div class="compare"> with img.before, img.after and an
 * <input type="range"> inside. The input drives the --split CSS variable.
 */
(function () {
  function init() {
    // ---------- before / after ----------
    document.querySelectorAll('.compare').forEach(function (cmp) {
      var rng = cmp.querySelector('input[type=range]');
      if (!rng) return;
      var set = function () { cmp.style.setProperty('--split', rng.value + '%'); };
      rng.addEventListener('input', set); set();
    });

    // ---------- lightbox ----------
    var items = [].slice.call(document.querySelectorAll('img[data-full]'));
    var links = [].slice.call(document.querySelectorAll('a[data-full]'));
    if (!items.length && !links.length) return;

    var lb = document.getElementById('lb');
    if (!lb) {
      lb = document.createElement('div');
      lb.className = 'lb'; lb.id = 'lb';
      lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Full resolution viewer');
      lb.innerHTML =
        '<div class="stage"><img id="lbImg" alt="" /></div>' +
        '<div class="bar"><span id="lbCap"></span><span class="ctl">' +
        '<span id="lbRes"></span><a id="lbLink" href="#">Tool page ↗</a>' +
        '<button type="button" id="lbPrev" aria-label="Previous">◀</button>' +
        '<button type="button" id="lbNext" aria-label="Next">▶</button>' +
        '<button type="button" id="lbClose">Close</button></span></div>';
      document.body.appendChild(lb);
    }
    var lbImg = lb.querySelector('#lbImg'), lbCap = lb.querySelector('#lbCap');
    var lbRes = lb.querySelector('#lbRes'), lbLink = lb.querySelector('#lbLink');
    var cur = -1, token = 0, lastFocus = null;

    function show(i) {
      cur = (i + items.length) % items.length;
      var el = items[cur], my = ++token;
      lbImg.src = el.currentSrc || el.src;
      lbImg.alt = el.alt || '';
      lbCap.textContent = el.getAttribute('data-cap') || el.alt || '';
      lbRes.textContent = 'Loading full res…';
      var link = el.getAttribute('data-link');
      if (link) { lbLink.href = link; lbLink.style.display = ''; } else lbLink.style.display = 'none';
      var multi = items.length > 1;
      lb.querySelector('#lbPrev').style.display = multi ? '' : 'none';
      lb.querySelector('#lbNext').style.display = multi ? '' : 'none';
      var full = new Image();
      full.onload = function () {
        if (my !== token) return;
        lbImg.src = full.src;
        lbRes.textContent = full.naturalWidth + ' × ' + full.naturalHeight;
      };
      full.onerror = function () { if (my === token) lbRes.textContent = ''; };
      full.src = el.getAttribute('data-full');
      if (!lb.classList.contains('open')) {
        lastFocus = document.activeElement;
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
        lb.querySelector('#lbClose').focus();
      }
    }
    function close() {
      lb.classList.remove('open'); document.body.style.overflow = ''; token++;
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    items.forEach(function (el, i) {
      el.style.cursor = 'zoom-in';
      el.addEventListener('click', function () { show(i); });
    });
    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        var full = a.getAttribute('data-full');
        var idx = items.findIndex(function (el) { return el.getAttribute('data-full') === full; });
        if (idx < 0) {
          var ghost = new Image(); ghost.src = full; ghost.alt = a.getAttribute('data-cap') || '';
          ghost.setAttribute('data-full', full);
          ghost.setAttribute('data-cap', a.getAttribute('data-cap') || '');
          if (a.getAttribute('data-link')) ghost.setAttribute('data-link', a.getAttribute('data-link'));
          items.push(ghost); idx = items.length - 1;
        }
        e.preventDefault(); show(idx);
      });
    });
    lb.querySelector('#lbClose').onclick = close;
    lb.querySelector('#lbPrev').onclick = function () { show(cur - 1); };
    lb.querySelector('#lbNext').onclick = function () { show(cur + 1); };
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('stage')) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(cur - 1);
      else if (e.key === 'ArrowRight') show(cur + 1);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
