#!/usr/bin/env node
// edit-copy.mjs — Visual copy editor for dec18studios GitHub Pages
// Usage:
//   npm install        (first time only)
//   node edit-copy.mjs
//   Open http://localhost:3077

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { load } from 'cheerio';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = __dirname;
const PORT = 3077;

const EDIT_PAGES = [
  {
    route: '/color-grading-tools/',
    file: 'color-grading-tools/index.html',
    label: 'Color Grading Tools',
  },
  {
    route: '/color-grading-tools/photochemist/',
    file: 'color-grading-tools/photochemist/index.html',
    label: 'Photo Chemist',
  },
];

// Elements whose text content is editable
const EDIT_SEL = 'h1, h2, h3, h4, p, li, .hero-sub, .blurb, .lede, .stock-note, .tag, .why p, .ct p, .st p, .note, .eyebrow';

// Per-session map: editId (number) -> { file, originalHTML }
const editMap = new Map();
let nextId = 0;

// ── Looks editor ──────────────────────────────────────────────────────────────
const LOOKS_DIR = path.join(REPO, 'color-grading-tools/photochemist/looks');
const MANIFEST_FILE = path.join(LOOKS_DIR, 'manifest.json');

function loadManifest() {
  try {
    if (fs.existsSync(MANIFEST_FILE)) return JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
  } catch {}
  return [];
}

function saveManifest(data) {
  fs.mkdirSync(LOOKS_DIR, { recursive: true });
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function slugify(name) {
  return name.toLowerCase().replace(/[''']/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ── Inject contenteditable attrs and return modified cheerio object ──
function injectEditAttrs($, filePath) {
  $(EDIT_SEL).each((_, el) => {
    const $el = $(el);
    if ($el.closest('script, style, noscript, template').length) return;
    if ($el.parents('[contenteditable]').length) return;
    const text = $el.text().trim();
    if (!text || text.length < 2) return;

    const id = nextId++;
    editMap.set(id, { file: filePath, originalHTML: $el.html() });

    $el.attr('contenteditable', 'true');
    $el.attr('data-eid', String(id));
    $el.attr('spellcheck', 'true');
  });
}

// ── Editor toolbar + client JS injected at end of <body> ──
function editorUI(label, route) {
  return `
<div id="_eb" style="
  position:fixed;top:0;left:0;right:0;z-index:2147483647;
  background:#13151c;border-bottom:1px solid #2a2d3a;
  display:flex;align-items:center;gap:14px;padding:0 20px;height:46px;
  font-family:system-ui,sans-serif;font-size:13px;color:#cfd2d8;
  box-shadow:0 2px 16px rgba(0,0,0,.5);
">
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0">
    <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" stroke="#4a8aff" stroke-width="1.5" fill="none"/>
  </svg>
  <span style="color:#4a8aff;font-weight:600;letter-spacing:.01em">${label}</span>
  <span style="color:#333">|</span>
  <span style="color:#666;font-size:12px">click any text to edit</span>
  <span style="flex:1"></span>
  <span id="_ec" style="color:#888;font-size:12px;margin-right:4px"></span>
  <button id="_esave" style="
    background:#2a2d3a;color:#cfd2d8;border:1px solid #3a3e50;
    border-radius:6px;padding:6px 16px;font-size:12px;font-weight:600;
    cursor:pointer;transition:background .15s,color .15s;
  ">Save</button>
  <a href="/" style="color:#555;font-size:12px;text-decoration:none;margin-left:8px">← pages</a>
</div>
<style>
  body { padding-top: 46px !important; }
  [contenteditable] { cursor: text; }
  [contenteditable]:hover { outline: 1px dashed rgba(74,138,255,.45) !important; border-radius:2px; }
  [contenteditable]:focus { outline: 2px solid rgba(74,138,255,.8) !important; background: rgba(74,138,255,.05) !important; border-radius:2px; }
  [contenteditable]:focus::selection { background: rgba(74,138,255,.35); }
  #_eb button:hover { background:#4a8aff !important; color:#fff !important; border-color:#4a8aff !important; }
</style>
<script>
(function(){
  var changes={}, saveBtn=document.getElementById('_esave'), countEl=document.getElementById('_ec');
  function updateCount(){
    var n=Object.keys(changes).length;
    countEl.textContent = n ? n+' unsaved change'+(n>1?'s':'') : '';
    saveBtn.style.borderColor = n ? '#4a8aff' : '';
    saveBtn.style.color = n ? '#4a8aff' : '';
  }
  document.addEventListener('input',function(e){
    if(e.target.dataset.eid===undefined) return;
    changes[e.target.dataset.eid]=e.target.innerHTML;
    updateCount();
  });
  saveBtn.addEventListener('click',function(){
    var n=Object.keys(changes).length;
    if(!n){saveBtn.textContent='Nothing to save';setTimeout(function(){saveBtn.textContent='Save'},1500);return;}
    saveBtn.textContent='Saving...';
    fetch('/save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({edits:changes})})
    .then(function(r){return r.json();})
    .then(function(res){
      if(res.ok){
        saveBtn.textContent='Saved!';saveBtn.style.color='#2a9d5c';saveBtn.style.borderColor='#2a9d5c';
        changes={};updateCount();
        setTimeout(function(){saveBtn.textContent='Save';saveBtn.style.color='';saveBtn.style.borderColor='';},2000);
      } else {
        saveBtn.textContent='Error';console.error(res.error);
      }
    })
    .catch(function(e){saveBtn.textContent='Error';console.error(e);});
  });
  // Prevent navigation when clicking links inside editable elements
  document.addEventListener('click',function(e){
    var a=e.target.closest('a');
    if(!a) return;
    if(a.hasAttribute('contenteditable')||a.closest('[contenteditable]')){e.preventDefault();}
  },true);
})();
</script>`;
}

// ── Home page ──
function homePage() {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>Copy Editor — Dec 18 Studios</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#0f1116;color:#cfd2d8;font-family:system-ui,sans-serif;
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    min-height:100vh;gap:12px;padding:24px;}
  h1{font-size:18px;font-weight:600;color:#e8eaf0;margin-bottom:8px;}
  a{display:block;background:#1a1d24;border:1px solid #2a2d3a;border-radius:8px;
    padding:14px 28px;color:#cfd2d8;text-decoration:none;font-size:14px;
    transition:border-color .15s,color .15s;min-width:260px;text-align:center;}
  a:hover{border-color:#4a8aff;color:#4a8aff;}
  p{font-size:12px;color:#555;margin-top:20px;}
</style>
</head><body>
<h1>✏ Copy Editor</h1>
${EDIT_PAGES.map(p => `<a href="${p.route}">${p.label}</a>`).join('\n')}
<a href="/looks-editor">Looks Editor — Photo Chemist stock images</a>
<p>Changes save directly to your HTML files on disk.</p>
</body></html>`;
}

// ── Serve an editable page ──
function serveEditPage(res, page) {
  const filePath = path.join(REPO, page.file);
  let raw;
  try { raw = fs.readFileSync(filePath, 'utf8'); }
  catch { res.writeHead(404); res.end('File not found'); return; }

  const $ = load(raw, { decodeEntities: false });
  injectEditAttrs($, page.file);
  $('body').append(editorUI(page.label, page.route));

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end($.html());
}

// ── Apply saved edits ──
function handleSave(req, res) {
  let body = '';
  req.on('data', d => (body += d));
  req.on('end', () => {
    try {
      const { edits } = JSON.parse(body);
      const byFile = {};

      for (const [eidStr, newHTML] of Object.entries(edits)) {
        const info = editMap.get(Number(eidStr));
        if (!info) continue;
        if (!byFile[info.file]) byFile[info.file] = [];
        byFile[info.file].push({ orig: info.originalHTML, next: newHTML });
        info.originalHTML = newHTML; // update map for subsequent saves
      }

      for (const [relPath, fileEdits] of Object.entries(byFile)) {
        const abs = path.join(REPO, relPath);
        let content = fs.readFileSync(abs, 'utf8');
        for (const { orig, next } of fileEdits) {
          if (content.includes(orig)) {
            content = content.replace(orig, next);
          } else {
            console.warn(`  ⚠  Could not find text to replace in ${relPath}`);
          }
        }
        fs.writeFileSync(abs, content, 'utf8');
        console.log(`  ✓  Saved ${fileEdits.length} change(s) to ${relPath}`);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    } catch (e) {
      console.error('Save error:', e.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: e.message }));
    }
  });
}

// ── Looks editor page ──
function looksEditorPage() {
  const manifest = loadManifest();
  const manifestJSON = JSON.stringify(manifest);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Looks Editor — Photo Chemist</title>
<style>
  :root{
    --bg:#0f1116;--bg1:#13151c;--bg2:#1a1d24;--bg3:#22252f;
    --line:#2a2d3a;--ink:#cfd2d8;--dim:#888;--blue:#4a8aff;
    --red:#e04040;--yellow:#d4a820;--green:#2ac77b;
    --cyan:#3bb8d0;--magenta:#de4ab8;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--bg);color:var(--ink);font-family:system-ui,sans-serif;font-size:14px;line-height:1.5}
  #bar{position:sticky;top:0;z-index:100;background:var(--bg1);border-bottom:1px solid var(--line);
    display:flex;align-items:center;gap:12px;padding:0 20px;height:46px;
    font-size:13px;box-shadow:0 2px 16px rgba(0,0,0,.5)}
  #bar .ti{color:var(--blue);font-weight:600}
  #bar .sep{color:#333}
  #bar .hi{color:var(--dim);font-size:12px}
  #bar .sp{flex:1}
  #bar a{color:#555;font-size:12px;text-decoration:none}
  #bar a:hover{color:var(--dim)}
  #bar .bsave{background:var(--bg2);color:var(--ink);border:1px solid var(--line);
    border-radius:6px;padding:6px 14px;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s}
  #bar .bsave:hover{background:var(--blue);color:#fff;border-color:var(--blue)}
  #bar .bscan{background:transparent;color:var(--dim);border:1px solid var(--line);
    border-radius:6px;padding:6px 12px;font-size:12px;cursor:pointer;transition:all .15s}
  #bar .bscan:hover{color:var(--ink);border-color:var(--dim)}
  main{max-width:860px;margin:0 auto;padding:28px 24px 80px}
  #msg{border-radius:6px;padding:10px 14px;font-size:13px;margin-bottom:20px;display:none}
  #msg.ok{background:rgba(42,199,123,.12);border:1px solid rgba(42,199,123,.3);color:#2ac77b}
  #msg.err{background:rgba(224,64,64,.12);border:1px solid rgba(224,64,64,.3);color:var(--red)}
  .sh{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
  .sh h2{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);font-weight:600}
  .sh .ct{font-size:11px;color:var(--dim);margin-left:8px}
  .card{background:var(--bg2);border:1px solid var(--line);border-radius:10px;padding:14px 16px;
    display:grid;grid-template-columns:104px 1fr 64px;gap:14px;align-items:start;
    margin-bottom:10px;transition:border-color .15s,opacity .15s;cursor:grab;user-select:none}
  .card:active{cursor:grabbing}
  .card.dragging{opacity:.35;border-color:var(--blue)}
  .card.over{border-color:var(--blue);border-style:dashed}
  .thumb-col{display:flex;flex-direction:column;gap:6px}
  .thumb{width:100%;height:64px;object-fit:cover;border-radius:5px;
    background:var(--bg3);border:1px solid var(--line);display:block}
  .thumb-empty{width:100%;height:64px;border-radius:5px;background:var(--bg3);
    border:1px solid var(--line);display:flex;align-items:center;justify-content:center;
    font-size:10px;color:var(--dim)}
  .uprow{display:flex;gap:5px}
  .uz{flex:1;border:1px dashed var(--line);border-radius:5px;padding:5px 4px;
    text-align:center;cursor:pointer;font-size:10px;color:var(--dim);
    position:relative;transition:border-color .12s,background .12s;line-height:1.3}
  .uz:hover{border-color:var(--blue);background:rgba(74,138,255,.06);color:var(--ink)}
  .uz input{position:absolute;inset:0;opacity:0;cursor:pointer;font-size:0}
  .uz .ul{pointer-events:none}
  .uz .uok{display:block;font-size:9px;color:var(--blue);pointer-events:none}
  .fields{display:flex;flex-direction:column;gap:7px}
  .fields input,.fields textarea{background:var(--bg3);border:1px solid var(--line);
    color:var(--ink);border-radius:6px;padding:6px 9px;font-size:13px;
    font-family:inherit;width:100%;transition:border-color .12s}
  .fields input:focus,.fields textarea:focus{outline:none;border-color:var(--blue)}
  .fields textarea{resize:none;height:52px;font-size:12px;line-height:1.45}
  .frow{display:flex;gap:6px;align-items:center}
  .frow label{font-size:10px;color:var(--dim);white-space:nowrap;min-width:36px}
  .frow input[type=text]{flex:1;font-family:monospace;font-size:11px}
  .chips{display:flex;gap:5px;align-items:center}
  .chip{width:18px;height:18px;border-radius:50%;cursor:pointer;flex-shrink:0;
    border:2px solid transparent;transition:border-color .1s,transform .1s}
  .chip:hover,.chip.on{border-color:var(--ink);transform:scale(1.2)}
  .cval{display:none}
  .acts{display:flex;flex-direction:column;gap:7px;align-items:flex-end;padding-top:2px}
  .bdel{background:transparent;border:1px solid var(--line);color:var(--dim);
    border-radius:6px;padding:5px 9px;font-size:11px;cursor:pointer;transition:all .15s;white-space:nowrap}
  .bdel:hover{border-color:var(--red);color:var(--red)}
  .drag-hint{font-size:10px;color:var(--line);text-align:center;padding-top:4px;user-select:none}
  /* Add section */
  .add-sec{background:var(--bg2);border:1px dashed var(--line);border-radius:10px;padding:22px;margin-top:8px}
  .add-sec h2{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim);margin-bottom:16px;font-weight:600}
  .add-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .add-grid .full{grid-column:1/-1}
  .add-grid label{display:block;font-size:10px;color:var(--dim);margin-bottom:3px}
  .add-grid input,.add-grid textarea{background:var(--bg3);border:1px solid var(--line);
    color:var(--ink);border-radius:6px;padding:7px 10px;font-size:13px;
    font-family:inherit;width:100%;transition:border-color .12s}
  .add-grid input:focus,.add-grid textarea:focus{outline:none;border-color:var(--blue)}
  .add-grid textarea{resize:vertical;min-height:60px}
  .add-uprow{display:flex;gap:8px;margin-bottom:4px}
  .add-uz{flex:1;border:1px dashed var(--line);border-radius:6px;padding:10px 8px;
    text-align:center;cursor:pointer;font-size:11px;color:var(--dim);
    position:relative;transition:border-color .12s,background .12s}
  .add-uz:hover{border-color:var(--blue);background:rgba(74,138,255,.06);color:var(--ink)}
  .add-uz input{position:absolute;inset:0;opacity:0;cursor:pointer;font-size:0}
  .add-uz .aul{pointer-events:none}
  .add-uz .aok{display:none;font-size:10px;color:var(--blue);margin-top:2px;pointer-events:none}
  .badd{background:var(--blue);color:#fff;border:none;border-radius:6px;
    padding:9px 20px;font-size:13px;font-weight:600;cursor:pointer;transition:opacity .15s}
  .badd:hover{opacity:.88}
  .badd:disabled{opacity:.4;cursor:default}
</style>
</head>
<body>
<div id="bar">
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0">
    <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" stroke="#4a8aff" stroke-width="1.5" fill="none"/>
  </svg>
  <span class="ti">Looks Editor</span>
  <span class="sep">|</span>
  <span class="hi">Photo Chemist stock preview</span>
  <span class="sp"></span>
  <button class="bscan" id="btnScan">Scan folders</button>
  <button class="bsave" id="btnSave">Save Changes</button>
  <a href="/">← pages</a>
</div>
<main>
  <div id="msg"></div>
  <div class="sh">
    <span><h2 style="display:inline">Stock Looks</h2><span class="ct" id="ct"></span></span>
  </div>
  <div id="list"></div>
  <div class="add-sec">
    <h2>Add New Look</h2>
    <div class="add-grid">
      <div>
        <label>Look name</label>
        <input id="aName" type="text" placeholder="e.g. Golden Daylight">
      </div>
      <div>
        <label>Color swatch</label>
        <div class="chips" id="aChips" style="padding:7px 0">
          <span class="chip" style="background:#e04040" data-v="var(--red)" title="Red"></span>
          <span class="chip" style="background:#d4a820" data-v="var(--yellow)" title="Yellow"></span>
          <span class="chip" style="background:#2ac77b" data-v="var(--green)" title="Green"></span>
          <span class="chip" style="background:#3bb8d0" data-v="var(--cyan)" title="Cyan"></span>
          <span class="chip" style="background:#4a6fef" data-v="var(--blue)" title="Blue"></span>
          <span class="chip" style="background:#de4ab8" data-v="var(--magenta)" title="Magenta"></span>
          <input type="hidden" id="aColor" value="var(--ink)">
        </div>
      </div>
      <div class="full">
        <label>Description</label>
        <textarea id="aDesc" placeholder="Short description shown in the viewer"></textarea>
      </div>
      <div class="full">
        <label>CSS filter fallback (used when no real images are uploaded)</label>
        <input id="aFilter" type="text" style="font-family:monospace;font-size:12px" placeholder="e.g. sepia(0.3) saturate(1.2) contrast(1.1)">
      </div>
      <div class="full">
        <label>Images (optional — you can add them later)</label>
        <div class="add-uprow">
          <div class="add-uz">
            <input type="file" id="aGraded" accept="image/*">
            <span class="aul">Graded / Photo Chemist export</span>
            <span class="aok" id="aGradedOk"></span>
          </div>
          <div class="add-uz">
            <input type="file" id="aRec709" accept="image/*">
            <span class="aul">Rec.709 / original</span>
            <span class="aok" id="aRec709Ok"></span>
          </div>
        </div>
      </div>
      <div class="full" style="display:flex;gap:10px;align-items:center">
        <button class="badd" id="btnAdd">Add Look</button>
        <span id="addStatus" style="font-size:12px;color:var(--dim)"></span>
      </div>
    </div>
  </div>
</main>
<script>
(function(){
  var CHIPS=[
    {hex:'#e04040',v:'var(--red)'},
    {hex:'#d4a820',v:'var(--yellow)'},
    {hex:'#2ac77b',v:'var(--green)'},
    {hex:'#3bb8d0',v:'var(--cyan)'},
    {hex:'#4a6fef',v:'var(--blue)'},
    {hex:'#de4ab8',v:'var(--magenta)'}
  ];
  var looks=${manifestJSON};
  var dirty=false;
  var dragIdx=-1;

  function post(url,body){
    return fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
      .then(function(r){return r.json();});
  }

  function showMsg(text,isErr){
    var el=document.getElementById('msg');
    el.textContent=text; el.className=isErr?'err':'ok'; el.style.display='block';
    setTimeout(function(){el.style.display='none';},3000);
  }

  function colorChipsHTML(current,prefix){
    return CHIPS.map(function(c){
      return '<span class="chip'+(c.v===current?' on':'')+'" style="background:'+c.hex+'" data-v="'+c.v+'" data-p="'+prefix+'" title="'+c.v+'"></span>';
    }).join('')+'<input type="hidden" class="cval" id="cv_'+prefix+'" value="'+(current||'var(--ink)')+'">';
  }

  function thumbHTML(look){
    if(look.graded){
      var src='/color-grading-tools/photochemist/'+look.graded;
      return '<img class="thumb" src="'+src+'" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">'
           +'<div class="thumb-empty" style="display:none">No image</div>';
    }
    return '<div class="thumb-empty">No image yet</div>';
  }

  function cardHTML(look,i){
    var p='c'+i;
    return '<div class="card" draggable="true" data-i="'+i+'" data-slug="'+look.slug+'">'
      +'<div class="thumb-col">'
        +thumbHTML(look)
        +'<div class="uprow">'
          +'<div class="uz" title="Upload graded image"><input type="file" accept="image/*" data-role="graded" data-slug="'+look.slug+'"><span class="ul">'+(look.graded?'Replace graded':'Add graded')+'</span><span class="uok" id="uok_g_'+look.slug+'"></span></div>'
          +'<div class="uz" title="Upload Rec.709 image"><input type="file" accept="image/*" data-role="rec709" data-slug="'+look.slug+'"><span class="ul">'+(look.rec709?'Replace 709':'Add 709')+'</span><span class="uok" id="uok_r_'+look.slug+'"></span></div>'
        +'</div>'
      +'</div>'
      +'<div class="fields">'
        +'<input type="text" class="fname" value="'+esc(look.name)+'" placeholder="Look name">'
        +'<textarea class="fdesc" placeholder="Description">'+esc(look.desc||'')+'</textarea>'
        +'<div class="frow"><label>Color</label><div class="chips">'+colorChipsHTML(look.color,p)+'</div></div>'
        +'<div class="frow"><label>Filter</label><input type="text" class="ffilter" value="'+esc(look.filter||'')+'" placeholder="CSS filter fallback"></div>'
      +'</div>'
      +'<div class="acts">'
        +'<button class="bdel" data-slug="'+look.slug+'">Delete</button>'
        +'<span class="drag-hint">⠿ drag</span>'
      +'</div>'
    +'</div>';
  }

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  function render(){
    var list=document.getElementById('list');
    list.innerHTML=looks.map(cardHTML).join('');
    document.getElementById('ct').textContent='('+looks.length+')';
    attachCardEvents();
  }

  function attachCardEvents(){
    var list=document.getElementById('list');

    // Chip clicks (color picker)
    list.querySelectorAll('.chip').forEach(function(chip){
      chip.addEventListener('click',function(e){
        e.stopPropagation();
        var p=chip.dataset.p;
        list.querySelectorAll('.chip[data-p="'+p+'"]').forEach(function(c){c.classList.remove('on');});
        chip.classList.add('on');
        document.getElementById('cv_'+p).value=chip.dataset.v;
        dirty=true;
      });
    });

    // Field changes
    list.querySelectorAll('.fname,.fdesc,.ffilter').forEach(function(el){
      el.addEventListener('input',function(){dirty=true;});
    });

    // Delete buttons
    list.querySelectorAll('.bdel').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.stopPropagation();
        var slug=btn.dataset.slug;
        var name=looks.find(function(l){return l.slug===slug;});
        if(!confirm('Delete "'+(name?name.name:slug)+'"? Images on disk are kept.')) return;
        post('/looks/delete',{slug:slug}).then(function(res){
          if(res.ok){
            looks=looks.filter(function(l){return l.slug!==slug;});
            render(); showMsg('Deleted '+slug);
          } else { showMsg(res.error||'Delete failed',true); }
        });
      });
    });

    // Image uploads
    list.querySelectorAll('.uz input[type=file]').forEach(function(inp){
      inp.addEventListener('change',function(e){
        e.stopPropagation();
        var file=inp.files[0]; if(!file) return;
        var role=inp.dataset.role, slug=inp.dataset.slug;
        var okId='uok_'+(role==='graded'?'g':'r')+'_'+slug;
        var okEl=document.getElementById(okId);
        if(okEl) okEl.textContent='Uploading...';
        readB64(file).then(function(b64){
          var ext=file.name.split('.').pop().toLowerCase();
          var body={slug:slug};
          if(role==='graded'){body.gradedB64=b64;body.gradedExt=ext;}
          else{body.rec709B64=b64;body.rec709Ext=ext;}
          return post('/looks/upload-images',body);
        }).then(function(res){
          if(res.ok){
            var look=looks.find(function(l){return l.slug===slug;});
            if(look){ if(res.gradedPath) look.graded=res.gradedPath; if(res.rec709Path) look.rec709=res.rec709Path; }
            if(okEl){okEl.style.display='block';okEl.textContent='Saved';}
            showMsg('Image saved for '+slug);
          } else {
            if(okEl){okEl.style.display='block';okEl.textContent='Error';}
            showMsg(res.error||'Upload failed',true);
          }
        });
      });
    });

    // Drag to reorder
    var cards=list.querySelectorAll('.card');
    cards.forEach(function(card){
      card.addEventListener('dragstart',function(e){
        dragIdx=parseInt(card.dataset.i);
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed='move';
      });
      card.addEventListener('dragend',function(){
        card.classList.remove('dragging');
        list.querySelectorAll('.card.over').forEach(function(c){c.classList.remove('over');});
        dragIdx=-1;
      });
      card.addEventListener('dragover',function(e){
        e.preventDefault(); e.dataTransfer.dropEffect='move';
        var ti=parseInt(card.dataset.i);
        if(ti!==dragIdx){ list.querySelectorAll('.card.over').forEach(function(c){c.classList.remove('over');}); card.classList.add('over'); }
      });
      card.addEventListener('drop',function(e){
        e.preventDefault();
        var ti=parseInt(card.dataset.i);
        if(dragIdx<0||dragIdx===ti) return;
        var moved=looks.splice(dragIdx,1)[0];
        looks.splice(ti,0,moved);
        dirty=true; render();
      });
    });

    // Block drag events from upload zones so they don't confuse card drag
    list.querySelectorAll('.uz,.uprow').forEach(function(el){
      el.addEventListener('dragstart',function(e){e.stopPropagation();});
    });
  }

  function collectManifest(){
    var cards=document.querySelectorAll('#list .card');
    var updated=[];
    cards.forEach(function(card){
      var slug=card.dataset.slug;
      var existing=looks.find(function(l){return l.slug===slug;});
      updated.push({
        slug:slug,
        name:card.querySelector('.fname').value,
        color:card.querySelector('.cval').value,
        desc:card.querySelector('.fdesc').value,
        filter:card.querySelector('.ffilter').value,
        graded:existing?existing.graded:null,
        rec709:existing?existing.rec709:null
      });
    });
    return updated;
  }

  function readB64(file){
    return new Promise(function(resolve,reject){
      var r=new FileReader();
      r.onload=function(e){resolve(e.target.result.split(',')[1]);};
      r.onerror=reject;
      r.readAsDataURL(file);
    });
  }

  // Save Changes button
  document.getElementById('btnSave').addEventListener('click',function(){
    var data=collectManifest();
    post('/looks/save',{manifest:data}).then(function(res){
      if(res.ok){ looks=data; dirty=false; showMsg('Manifest saved'); }
      else { showMsg(res.error||'Save failed',true); }
    });
  });

  // Scan folders button
  document.getElementById('btnScan').addEventListener('click',function(){
    post('/looks/scan',{}).then(function(res){
      if(res.ok){
        looks=res.manifest;
        render();
        showMsg('Found '+res.added+' new look'+(res.added!==1?'s':'')+'. Click Save Changes to write.');
      } else { showMsg(res.error||'Scan failed',true); }
    });
  });

  // Add new look chips
  document.getElementById('aChips').querySelectorAll('.chip').forEach(function(chip){
    chip.addEventListener('click',function(){
      document.getElementById('aChips').querySelectorAll('.chip').forEach(function(c){c.classList.remove('on');});
      chip.classList.add('on');
      document.getElementById('aColor').value=chip.dataset.v;
    });
  });

  // Add new look
  document.getElementById('btnAdd').addEventListener('click',function(){
    var name=document.getElementById('aName').value.trim();
    if(!name){ document.getElementById('aName').focus(); return; }
    var slug=name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    if(looks.find(function(l){return l.slug===slug;})){
      document.getElementById('addStatus').textContent='A look with that name already exists.'; return;
    }
    var color=document.getElementById('aColor').value||'var(--ink)';
    var desc=document.getElementById('aDesc').value;
    var filter=document.getElementById('aFilter').value;
    var gFile=document.getElementById('aGraded').files[0];
    var rFile=document.getElementById('aRec709').files[0];
    document.getElementById('btnAdd').disabled=true;
    document.getElementById('addStatus').textContent='Adding...';

    var entry={slug:slug,name:name,color:color,desc:desc,filter:filter,graded:null,rec709:null};

    function finishAdd(res){
      if(res.ok){
        if(res.gradedPath) entry.graded=res.gradedPath;
        if(res.rec709Path) entry.rec709=res.rec709Path;
      }
      looks.push(entry);
      // Save manifest with the new entry
      post('/looks/save',{manifest:looks}).then(function(saveRes){
        document.getElementById('btnAdd').disabled=false;
        if(saveRes.ok){
          document.getElementById('addStatus').textContent='';
          document.getElementById('aName').value='';
          document.getElementById('aDesc').value='';
          document.getElementById('aFilter').value='';
          document.getElementById('aGraded').value='';
          document.getElementById('aRec709').value='';
          document.getElementById('aGradedOk').style.display='none';
          document.getElementById('aRec709Ok').style.display='none';
          document.getElementById('aChips').querySelectorAll('.chip').forEach(function(c){c.classList.remove('on');});
          document.getElementById('aColor').value='var(--ink)';
          render(); showMsg('Added "'+name+'"');
        } else {
          document.getElementById('addStatus').textContent=saveRes.error||'Save failed';
        }
      });
    }

    if(gFile||rFile){
      var promises=[];
      var body={slug:slug};
      if(gFile){ promises.push(readB64(gFile).then(function(b64){ body.gradedB64=b64; body.gradedExt=gFile.name.split('.').pop().toLowerCase(); })); }
      if(rFile){ promises.push(readB64(rFile).then(function(b64){ body.rec709B64=b64; body.rec709Ext=rFile.name.split('.').pop().toLowerCase(); })); }
      Promise.all(promises).then(function(){ return post('/looks/upload-images',body); }).then(finishAdd);
    } else {
      finishAdd({ok:true});
    }
  });

  // File indicator for add form
  document.getElementById('aGraded').addEventListener('change',function(){
    var ok=document.getElementById('aGradedOk');
    ok.style.display=this.files[0]?'block':'none';
    ok.textContent=this.files[0]?this.files[0].name:'';
  });
  document.getElementById('aRec709').addEventListener('change',function(){
    var ok=document.getElementById('aRec709Ok');
    ok.style.display=this.files[0]?'block':'none';
    ok.textContent=this.files[0]?this.files[0].name:'';
  });

  render();
})();
</script>
</body>
</html>`;
}

// ── Looks API request handler ──
function handleLooksApi(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const action = url.pathname.split('/').pop(); // 'save', 'upload-images', 'delete', 'scan'
  let body = '';
  req.on('data', d => (body += d));
  req.on('end', () => {
    try {
      const data = body ? JSON.parse(body) : {};

      if (action === 'save') {
        if (!Array.isArray(data.manifest)) throw new Error('manifest must be array');
        saveManifest(data.manifest);
        console.log(`  ✓  Looks manifest saved (${data.manifest.length} entries)`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: true }));
      }

      if (action === 'upload-images') {
        const { slug, gradedB64, gradedExt, rec709B64, rec709Ext } = data;
        if (!slug) throw new Error('slug required');
        const lookDir = path.join(LOOKS_DIR, slug);
        fs.mkdirSync(lookDir, { recursive: true });

        let gradedPath = null, rec709Path = null;
        if (gradedB64) {
          const ext = (gradedExt || 'jpg').replace(/[^a-z0-9]/g, '');
          const fname = `graded.${ext}`;
          fs.writeFileSync(path.join(lookDir, fname), Buffer.from(gradedB64, 'base64'));
          gradedPath = `looks/${slug}/${fname}`;
          console.log(`  ✓  Saved graded image → ${gradedPath}`);
        }
        if (rec709B64) {
          const ext = (rec709Ext || 'jpg').replace(/[^a-z0-9]/g, '');
          const fname = `rec709.${ext}`;
          fs.writeFileSync(path.join(lookDir, fname), Buffer.from(rec709B64, 'base64'));
          rec709Path = `looks/${slug}/${fname}`;
          console.log(`  ✓  Saved rec709 image → ${rec709Path}`);
        }

        // Update manifest paths for this slug
        const manifest = loadManifest();
        const idx = manifest.findIndex(e => e.slug === slug);
        if (idx >= 0) {
          if (gradedPath) manifest[idx].graded = gradedPath;
          if (rec709Path) manifest[idx].rec709 = rec709Path;
          saveManifest(manifest);
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: true, gradedPath, rec709Path }));
      }

      if (action === 'delete') {
        const { slug } = data;
        if (!slug) throw new Error('slug required');
        const manifest = loadManifest().filter(e => e.slug !== slug);
        saveManifest(manifest);
        console.log(`  ✓  Deleted look: ${slug}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: true }));
      }

      if (action === 'scan') {
        const manifest = loadManifest();
        const existingSlugs = new Set(manifest.map(e => e.slug));
        let added = 0;
        if (fs.existsSync(LOOKS_DIR)) {
          const entries = fs.readdirSync(LOOKS_DIR, { withFileTypes: true });
          for (const entry of entries) {
            if (!entry.isDirectory()) continue;
            const slug = entry.name;
            if (existingSlugs.has(slug)) continue;
            const dir = path.join(LOOKS_DIR, slug);
            const files = fs.readdirSync(dir);
            const gFile = files.find(f => /^graded\.(jpg|jpeg|png|webp)$/i.test(f));
            const rFile = files.find(f => /^rec709\.(jpg|jpeg|png|webp)$/i.test(f));
            if (gFile || rFile) {
              const name = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
              manifest.push({
                slug, name, color: 'var(--ink)', desc: '', filter: '',
                graded: gFile ? `looks/${slug}/${gFile}` : null,
                rec709: rFile ? `looks/${slug}/${rFile}` : null,
              });
              added++;
            }
          }
          if (added > 0) saveManifest(manifest);
        }
        console.log(`  ✓  Scan found ${added} new look(s)`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ ok: true, added, manifest }));
      }

      throw new Error(`Unknown looks action: ${action}`);
    } catch (e) {
      console.error('Looks API error:', e.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: e.message }));
    }
  });
}

// ── MIME types ──
const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.gif': 'image/gif',
  '.webp': 'image/webp', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

// ── Request handler ──
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const p = url.pathname;

  if (req.method === 'GET' && p === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end(homePage());
  }

  if (req.method === 'POST' && p === '/save') {
    return handleSave(req, res);
  }

  if (req.method === 'GET' && p === '/looks-editor') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(looksEditorPage());
  }

  if (req.method === 'POST' && p.startsWith('/looks/')) {
    return handleLooksApi(req, res);
  }

  // Edit pages (exact match on directory routes)
  const editPage = EDIT_PAGES.find(ep => p === ep.route || p === ep.route.replace(/\/$/, ''));
  if (req.method === 'GET' && editPage) {
    return serveEditPage(res, editPage);
  }

  // Static files — serve from repo root so relative paths all resolve
  const filePath = path.join(REPO, p);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    return res.end(fs.readFileSync(filePath));
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log('\n✏  Copy editor ready\n');
  console.log(`  Home:           http://localhost:${PORT}/`);
  console.log(`  Tools page:     http://localhost:${PORT}/color-grading-tools/`);
  console.log(`  Photo Chemist:  http://localhost:${PORT}/color-grading-tools/photochemist/`);
  console.log(`  Looks Editor:   http://localhost:${PORT}/looks-editor`);
  console.log('\n  Changes save directly to your HTML files on disk.');
  console.log('  Ctrl+C to stop.\n');
});
