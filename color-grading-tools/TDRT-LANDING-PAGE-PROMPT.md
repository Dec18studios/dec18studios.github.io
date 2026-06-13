# CONTENT + DIRECTION PROMPT — Technically Technicolor DRT — LANDING PAGE

## INSTRUCTIONS FOR CLAUDE DESIGN

You are building the **product landing page** for **Technically Technicolor DRT**, an OFX
plugin for DaVinci Resolve by Dec18 Studios. This page lives at **tools.dec18studios.com**
under `color-grading-tools/technicolor-drt/index.html` (or the site's equivalent slug).

- **Match the existing site.** Use the sibling `color-grading-tools/photochemist/` page as
  the structural and visual reference — same hero pattern, section rhythm, nav, footer,
  asset-folder convention, and the way tools are registered in
  `color-grading-tools/tools.json` / `color-grading-tools/index.html`. Add this tool to the
  index the same way the others are listed.
- **You write the page; I wrote the content.** Everything below is final, polished copy —
  headlines and body are ready to drop in. You own layout, type, spacing, components, image
  framing, and responsive behavior. Rewrite lightly for flow if a heading needs to fit the
  site's voice, but **do not invent features, controls, specs, or history** beyond what's here.
- **Tone:** knowledgeable film-nerd enthusiasm grounded in real photochemistry. Confident,
  precise, not hypey. The reader is a colorist or filmmaker who knows what a vectorscope is
  and has opinions about film stocks. Lead with the thesis: *this is a process simulation,
  not a LUT.*
- **Image slots** are described inline as `[IMAGE: …]` with the alt text and the kind of
  capture that goes there. Use placeholder frames with that alt text — Greg drops in real
  screenshots later. Don't generate fake screenshots.
- **Pricing:** unknown at time of writing. Wherever a price/buy button would go, leave a
  clearly-marked placeholder: `[PLACEHOLDER — Greg to set pricing / store link]`.
- **Cross-link:** every CTA cluster and the nav should link to the **Quick Start Guide**
  page (`technicolor-drt/quick-start.html`), and that page links back here.

---

## PAGE STRUCTURE (section by section)

### 0. Version / platform banner (thin strip, top of page)

A slim banner above or inside the hero:

> **v12.0.0 — DaVinci Resolve (OFX) · macOS Metal (Universal) · Windows & Linux CUDA**

Right-aligned in the banner: a small **"Download on GitHub"** link pointing to the
**Technically-Technicolor-DRT** releases page (Dec18studios org). Keep it understated — the
big download CTA comes later.

---

### 1. HERO

**Headline:**
> Real Technicolor. Simulated frame by frame.

**Subhead:**
> A physically-modeled motion-picture process for DaVinci Resolve. Technically Technicolor DRT
> doesn't apply a look — it runs the film. A 43-band spectral negative is exposed, developed,
> and scanned, then printed through Technicolor's dye-transfer (imbibition) system as cyan,
> magenta, yellow, and black dye plates. Every stage is a real model. Every stage is yours to grade.

**Primary CTA button:** `Download v12.0.0` → GitHub releases
**Secondary CTA (text link):** `Read the Quick Start Guide →` → quick-start.html

`[IMAGE: hero — a graded frame straight out of the plugin, ideally a face + saturated
primary (a red dress, a blue sky) so the dye-transfer color separation reads. Alt: "A frame
processed through Technically Technicolor DRT showing the dye-transfer Technicolor look."]`

Below the hero image, a one-line italic caption sets the thesis hard:

> *Not a teal-and-orange preset. Not a film LUT. A simulation of the photochemical chain that
> made the most saturated movies ever printed.*

---

### 2. WHAT IT IS (the narrative)

Section heading: **It's the whole lab, in one node.**

Body:

> Most "film looks" are a lookup table — a fixed mapping baked from someone else's grade. They
> can't respond to your image because there's no film in them. Technically Technicolor DRT is
> built the other way around: it models the actual two-halves of the Technicolor workflow and
> runs them live on your pixels.
>
> **The camera / negative side** is a full spectral film-negative simulation — the same
> photochemical DNA as our PhotoChemist plugin. Your image is treated as light hitting a real
> emulsion: 43 spectral bands of silver-halide sensitivity, dye formation, characteristic
> (H&D) density curves, grain, halation, and MTF sharpness, all computed per stock from
> measured datasheet behavior. The output is a developed, scanned negative.
>
> **The print side** is the Technicolor dye-transfer system. The negative's three printing
> registers are extracted, shaped through gel-matrix plates, and laid down as cyan, magenta,
> yellow, and black (the "Green Flash" key) dyes — each with its own density behavior, hue
> bends, and saturation trajectory. A projector-light stage finishes the chain, the way a
> period lamp finished a real print.
>
> Image → film negative → Technicolor matrices → dye-transfer print → projected — all inside
> one OFX node, with every stage exposed for grading.

`[IMAGE: pipeline diagram — a clean horizontal flow: Source → Spectral Negative (silver /
dye / H&D / grain / halation / MTF) → Register Extraction → CMYK Dye Plates → Projector Light →
Output. Alt: "The Technicolor DRT pipeline, from source image through spectral negative to
dye-transfer print and projector."]`

---

### 3. THE FOUR PROCESSING METHODS (the spine — make this the biggest feature section)

Section heading: **Four ways to print.**
Intro line:
> One dropdown — **Processing Method** — picks which era of Technicolor you're running. The
> camera side reconfigures, the print side follows. Switch between them live.

Lay these out as four cards (or a 2×2 grid). Each gets a short name, a one-line era tag, and
a paragraph. **Single Stock is the default — flag it.**

**Card 1 — Single Stock (Modern)  ·  *the default***
> Shoot modern, print Technicolor. One full color negative is simulated spectrally, then the
> scanned neg drives the three printing registers directly. The most flexible, general-purpose
> mode — per-register white/black/gamma with Auto Anchor, and the Gel Matrix DMin / White /
> Gamma masters over the top. This is where most grades start.

**Card 2 — Process 3 (2-Strip)  ·  *1922–1932, two-color***
> The original two-color Technicolor. Only red and green records exist, captured through
> Wratten-style filter folds; the blue record and the Yellow/Black plates are disabled. The
> red record drives the blue-green plate, green drives the red-orange plate, and blacks form
> only where the two dyes overlap — the authentic two-color look, with its famous gaps (warm
> brown-blacks, no true blue sky, salmon skin on the warm lobe). Recommended stock: Double-X 5222.

**Card 3 — Process 4 (3-Strip)  ·  *1932–1955, three-strip***
> The classic three-strip camera era — *The Wizard of Oz*, *Singin' in the Rain*. Three
> separate black-and-white records (a green path plus a blue/red bipack) are captured behind a
> gold-mirror beam-splitting prism, then printed through the full modern CMYK plate system with
> Green Flash. A **Gold Mirror Bias** slider (±1 stop) rebalances the prism split between the
> green record and the blue/red bipack — the one control that era's lab actually had.

**Card 4 — Neg Scan (Diagnostic)  ·  *inspection mode***
> The negative pipeline alone, truncated at the scanned-negative boundary. View the raw
> developed neg to check how a stock is behaving — sensitivity, density, grain, halation — before
> the print side touches it. A working tool, not a look.

`[IMAGE: comparison strip — the same source frame rendered four ways (Single Stock / Process 3
/ Process 4 / Neg Scan) side by side. The 2-strip vs 3-strip difference is the money shot. Alt:
"The same frame through all four Technicolor DRT processing methods."]`

---

### 4. THE EDITOR PANELS (three feature blocks)

Section heading: **Three floating editors. All three platforms.**
Intro:
> Beyond the inspector, Technically Technicolor DRT opens FSE-style floating editor windows —
> native Metal on macOS, pixel-equivalent ImGui twins on Windows and Linux. They're built from
> the same code and verified indistinguishable. Everything they control also persists in your
> project.

Three blocks, each with a heading, a paragraph, and a screenshot slot:

**Film Stock Editor (FSE)**
> Draw and sculpt the negative by hand. Spectral sensitivity curves, dye density curves, and
> the H&D characteristic curve — each on an interactive canvas, live against your image. A
> three-level override hierarchy decides what wins: your drawn curve first, then measured
> spectral data, then a parametric Gaussian fallback. Refine where you have data; let the model
> hold everything else.

`[IMAGE: Film Stock Editor panel — the curve canvases with a sculpted sensitivity or H&D curve.
Alt: "The Film Stock Editor showing editable spectral sensitivity and characteristic curves."]`

**Textures Editor**
> Grain, halation, and MTF sharpness on visual canvases with datasheet reference traces. Grain
> by size and amount, with chromatic distribution and crystal-structure shape; halation strength
> and spread (the red-orange glow off the film base); and MTF acutance pucks for edge sharpness.
> All three texture systems ship **on by default** in v12.

`[IMAGE: Textures Editor panel — grain / halation / MTF pucks on their canvases with reference
traces. Alt: "The Textures Editor with grain, halation, and MTF controls."]`

**Dye Designer — *the headline of v12***
> The dye control surface, consolidated. A 2×2 Cyan / Magenta / Yellow / Black grid; each dye
> cell shows a **dye leaf** — the RGB cube cut along the white→dye→black plane, stroked in the
> dye's real sample color, so you see the exact trajectory the dye takes — plus chroma and
> hue-offset function strips with draggable pucks (pinch/toe, saturation threshold, white zone,
> hue bend strength and midpoint, black and white hue shifts). A **Master** row edits the
> globals; each dye cell writes per-dye trims as offsets against it — the master-plus-offset
> workflow colorists already know. Live plate-isolation thumbnails re-render the actual kernel
> per dye as you drag. The header carries the **Max Density** slider and **Green Flash** (the
> black record).

`[IMAGE: Dye Designer panel — the 2×2 CMYK grid with dye leaves, function strips, Master row,
and live plate thumbnails. This is the v12 showcase shot. Alt: "The Dye Designer panel with
its CMYK dye-leaf grid, master row, and live plate-isolation thumbnails."]`

> Prefer presets? **Dye Shaping** offers Neutral / Gentle Pull / Vivid Pull / Custom — **Gentle
> Pull is the default look in v12.**

---

### 5. PHYSICALLY-MODELED TEXTURES (short supporting section)

Section heading: **The texture is modeled, not stamped.**
> - **Grain** — physically-modeled silver-halide grain, with chromatic distribution and crystal
>   shape (Round / Square / T-Grain), driven by published granularity behavior.
> - **Halation** — IIR-based red-edge glow where hot highlights bounce light off the film base.
> - **MTF** — a pyramid-based sharpness / acutance model; v12 restores the strong
>   edge-enhancement defaults that make the print look resolved, not soft.
>
> Choose a film format (65mm / 35mm / 16mm) per system, or mix them. All three default to on.

`[IMAGE: a 200% crop showing grain + halation around a highlight. Alt: "A magnified crop
showing modeled film grain and halation around a highlight."]`

---

### 6. WHO IT'S FOR

Section heading: **Built for colorists who want the lab, not the look.**
> - **Narrative colorists** chasing a period-honest Technicolor finish that responds to the
>   shot instead of fighting a baked LUT.
> - **Filmmakers and DPs** who want the two-strip or three-strip look to behave like the real
>   process — including its limitations — not a stylized approximation.
> - **Film-emulation nerds** who'll open the Film Stock Editor and the Dye Designer and actually
>   draw curves, dial dye trajectories, and balance registers by hand.
> - **Anyone who already runs PhotoChemist** — it shares the spectral negative engine, so the
>   negative half will feel familiar.

---

### 7. PLATFORMS & REQUIREMENTS

Section heading: **Requirements**
Render as a clean spec list / small table:

- **Host:** DaVinci Resolve (OFX plugin).
- **macOS:** Universal — Metal, Apple Silicon and Intel.
- **Windows x64 / Linux x86_64:** CUDA (OpenCL fallback exists, but CUDA is the primary path).
- **GPU floor (Windows/Linux):** **NVIDIA Turing or newer** — RTX 20-series / GTX 16-series and
  up. Older cards cannot run the negative kernel. (No floor note needed for macOS.)
- **Rendering parity:** all three platforms render identically — verified. The editor panels
  are native Metal on macOS and pixel-equivalent ImGui twins on Windows/Linux.

Include a short honest note:
> *The Windows/Linux GPU floor is a hard requirement of the spectral negative kernel — it's not
> a soft recommendation. Pre-Turing cards will not load it.*

---

### 8. DOWNLOAD / CTA

Section heading: **Get Technically Technicolor DRT**
> Distributed as portable per-platform zips through GitHub releases on the
> **Technically-Technicolor-DRT** repo.

- Primary button: `Download v12.0.0 — GitHub Releases` → the repo's releases page.
- Three smaller labeled links under it: `macOS (Universal)` · `Windows (x64)` · `Linux (x86_64)`
  — all pointing at the same releases page (or the specific assets if Greg wires them).
- `[PLACEHOLDER — Greg to set pricing / store link. If this tool is paid, put the price and
  buy button here; if it's free/donation, say so.]`
- Secondary CTA: `New here? Start with the Quick Start Guide →` → quick-start.html

---

### 9. FOOTER

Standard site footer. Include the cross-link to the Quick Start Guide and a link back to the
`color-grading-tools` index. Restate the version/platform line quietly. By Dec18 Studios.

---

## COPY / TONE NOTES FOR CLAUDE DESIGN

- The single most important sentence on the page is *"it doesn't apply a look — it runs the
  film."* Let it breathe; don't bury it.
- Use the **real control names** verbatim where they appear: Processing Method, Single Stock
  (Modern), Process 3 (2-Strip), Process 4 (3-Strip), Neg Scan (Diagnostic), Gel Matrix DMin /
  White / Gamma, Register Extraction, Auto Anchor Registers, Projector Bulb, Gold Mirror Bias,
  Film Stock Editor, Textures Editor, Dye Designer, Dye Shaping, Gentle Pull, Max Density,
  Green Flash.
- Keep history references generic and accurate: two-color Technicolor in the 1920s; three-strip
  in the 1930s–50s (Oz / Singin' in the Rain era are fine touchstones). Don't claim partnership,
  endorsement, or proprietary historical data.
- No fabricated benchmarks, no fake testimonials, no invented stock names beyond Double-X 5222
  (which is real and referenced in-product).
- Calm, dense, credible. This audience is allergic to marketing fluff.
