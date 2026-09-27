/* ──────────────────────────────────────────────────────────────────────────
   Dec. 18 Studios — shared download email gate
   Self-contained: injects the capture modal, then intercepts clicks on any
   <a class="dl"> link. Derives slug/name from a parent .tcard[data-slug] (free
   tool cards) or, failing that, from the link's own data-slug / data-name.
   Logs to the download-logger Worker, remembers the email in localStorage so
   repeat downloads skip the modal. Include once per page:
     <script src="<path-to>/assets/dl-gate.js" defer></script>
   ────────────────────────────────────────────────────────────────────────── */
(function () {
  var LOG_URL = 'https://dec18-download-logger.dec18studios.workers.dev/log';

  // Don't double-init if the script is included twice.
  if (window.__d18DlGate) return;
  window.__d18DlGate = true;

  var MODAL, FORM, INPUT, ERR, BACKDROP;
  var pending = null; // { url, slug, name }

  function savedEmail() { try { return localStorage.getItem('d18_email') || ''; } catch (e) { return ''; } }
  function saveEmail(e) { try { localStorage.setItem('d18_email', e); } catch (e2) {} }

  function log(email, slug, name) {
    if (!email || !slug) return;
    fetch(LOG_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, tool_slug: slug, tool_name: name }),
    }).catch(function () {});
  }

  function triggerDownload(url) {
    var a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener';
    document.body.appendChild(a); a.click();
    setTimeout(function () { document.body.removeChild(a); }, 100);
  }

  function closeModal() { MODAL.style.display = 'none'; pending = null; }

  function openModal(url, slug, name) {
    pending = { url: url, slug: slug, name: name };
    ERR.style.display = 'none';
    INPUT.value = savedEmail();
    MODAL.style.display = 'flex';
    setTimeout(function () { INPUT.focus(); INPUT.select(); }, 50);
  }

  function buildModal() {
    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<div id="dlModal" style="display:none;position:fixed;inset:0;z-index:9000;align-items:center;justify-content:center;padding:20px">' +
        '<div id="dlBackdrop" style="position:absolute;inset:0;background:rgba(34,29,24,.62)"></div>' +
        '<div style="position:relative;background:#efe6d2;border:2px solid #221d18;border-radius:0;padding:34px 30px 26px;max-width:420px;width:100%;box-shadow:8px 8px 0 #c7372c;color:#221d18;font-family:\'Hanken Grotesk\',system-ui,sans-serif">' +
          '<button id="dlClose" type="button" style="position:absolute;top:14px;right:16px;background:none;border:none;color:#221d18;font-size:20px;line-height:1;cursor:pointer;padding:4px 6px;transition:color .15s" title="Close">✕</button>' +
          '<h3 style="margin:0 0 8px;font-family:Archivo,\'Archivo Narrow\',Impact,sans-serif;font-stretch:75%;font-size:30px;font-weight:900;text-transform:uppercase;letter-spacing:-.01em;line-height:.95;color:#221d18">One quick thing</h3>' +
          '<p style="margin:0 0 24px;font-size:15px;color:#4a4038;line-height:1.6">Drop your email and we might send you a few setup tips and let you know when a new version drops. We don\'t send many, just helpful tips and release notes when something changes.</p>' +
          '<form id="dlForm" autocomplete="on">' +
            '<input id="dlEmail" type="email" name="email" autocomplete="email" placeholder="your@email.com" required style="width:100%;background:#fbf6ea;border:2px solid #221d18;color:#221d18;border-radius:0;padding:11px 14px;font-size:15px;font-family:\'Courier Prime\',ui-monospace,monospace;margin-bottom:10px;outline:none;transition:border-color .15s;box-sizing:border-box">' +
            '<button type="submit" style="width:100%;background:#221d18;color:#efe6d2;border:2px solid #221d18;border-radius:0;padding:12px 20px;font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;box-shadow:4px 4px 0 #c7372c;font-family:inherit;cursor:pointer;transition:opacity .15s">Download</button>' +
            '<p id="dlErr" style="margin:10px 0 0;font-size:12px;color:#c7372c;font-weight:700;display:none"></p>' +
            '<button type="button" id="dlDismiss" style="display:block;width:100%;margin-top:10px;background:none;border:none;color:#6b6055;font-size:12px;cursor:pointer;padding:6px;text-decoration:underline;font-family:\'Courier Prime\',ui-monospace,monospace;transition:color .15s">Nah, I don\'t want it</button>' +
          '</form>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap.firstChild);

    MODAL = document.getElementById('dlModal');
    FORM = document.getElementById('dlForm');
    INPUT = document.getElementById('dlEmail');
    ERR = document.getElementById('dlErr');
    BACKDROP = document.getElementById('dlBackdrop');

    FORM.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = INPUT.value.trim().toLowerCase();
      if (!email) return;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        ERR.textContent = 'Please enter a valid email address.';
        ERR.style.display = 'block'; return;
      }
      saveEmail(email);
      if (pending) { log(email, pending.slug, pending.name); triggerDownload(pending.url); }
      closeModal();
    });

    document.getElementById('dlClose').addEventListener('click', closeModal);
    document.getElementById('dlDismiss').addEventListener('click', closeModal);
    BACKDROP.addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && MODAL.style.display !== 'none') closeModal();
    });
  }

  function onClick(e) {
    var dl = e.target.closest('.dl');
    if (!dl) return;
    e.preventDefault();
    e.stopPropagation();
    var url = dl.href;
    var card = dl.closest('.tcard');
    var slug = (card && card.dataset.slug) || dl.dataset.slug || '';
    var name = (card && card.querySelector('h4') ? card.querySelector('h4').textContent : '') || dl.dataset.name || '';

    var stored = savedEmail();
    if (stored) {
      log(stored, slug, name);
      triggerDownload(url);
    } else {
      openModal(url, slug, name);
    }
  }

  function init() {
    buildModal();
    document.addEventListener('click', onClick, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
