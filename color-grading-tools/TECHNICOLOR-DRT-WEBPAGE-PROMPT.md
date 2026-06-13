# PROMPT FOR CLAUDE DESIGN — Technically Technicolor DRT product page + quick start guide

You are building two pages for tools.dec18studios.com under `color-grading-tools/`:

1. **`technicolor-drt/index.html`** — the product/marketing page for the plugin.
2. **`technicolor-drt/quick-start.html`** (or an anchored section/sub-page, your call) — a
   practical quick start guide.

Match the look, navigation, and conventions of the existing site. Use the sibling
`color-grading-tools/photochemist/` page as the structural reference (hero, sections,
assets folder pattern) and add the tool to `color-grading-tools/tools.json` /
`color-grading-tools/index.html` the same way the other tools are listed. Everything
below is the source-of-truth content; rewrite freely for the page voice, but do not
invent features or controls that aren't listed here.

---

## 1. What the tool is

**Technically Technicolor DRT** — v12.0.0, by Dec18 Studios.

An OFX plugin for DaVinci Resolve that recreates the **Technicolor dye-transfer
(imbibition) printing process** as a physically modeled pipeline — not a LUT, not a
"teal-and-orange" grade. macOS (Metal, Apple Silicon + Intel) and Windows/Linux
(CUDA). Distributed via GitHub releases on the **Technically-Technicolor-DRT** repo.

The pipeline has two halves, mirroring the real workflow:

- **The camera/negative side** — a full spectral film-negative simulation (shared DNA
  with our PhotoChemist plugin): 43-band spectral silver sensitivity, dye formation,
  characteristic (H&D) curves, grain, halation, and MTF/sharpness, computed per stock
  from measured datasheet data.
- **The print side** — the Technicolor dye/plate system: the negative's three printing
  registers are extracted with printer lights, shaped through gel-matrix plates, and
  transferred as cyan/magenta/yellow (+ black "key") dyes with authentic density
  behavior, hue bends, and a projector-light stage at the end.

The result: image → film negative → Technicolor matrices → dye-transfer print →
projected, all inside one node, with every stage exposed for grading.

### The four processing methods (the headline feature)

- **Single Stock (Modern)** — the default. One color negative is scanned and its
  R/G/B channels drive the dye-transfer print as the three registers. This is the
  "shoot modern, print Technicolor" look — the most flexible, general-purpose mode.
- **Process 3 (2-Strip)** — classic two-strip Technicolor (mid-1920s): only red and
  green black-and-white records exist. Red record drives a blue-green plate, green
  drives a red-orange plate; blacks form only where the two dyes overlap. No blue
  record, no key. The authentic two-color look with its famous gaps (no true blue sky).
- **Process 4 (3-Strip)** — classic three-strip Technicolor (1930s–50s): three
  separate black-and-white records (green, blue, red) captured behind a gold-mirror
  beam-splitting prism, printed through the full modern plate system. A **Gold Mirror
  Bias** slider (±1 stop) balances the prism split between the green record and the
  blue/red bipack. Recommended stock: Double-X 5222.
- **Neg Scan (Diagnostic)** — the negative pipeline alone, truncated at the
  scanned-negative boundary. A diagnostic view of the developed neg for checking
  stock behavior before the print side.

### The three built-in editor panels (Mac)

Launched from buttons in the inspector (macOS; on Windows/Linux the buttons are
inert in v12 — panel parity is a planned follow-up; everything the panels control
also has inspector/preset coverage):

- **Film Stock Editor (FSE)** — draw custom spectral sensitivity and dye curves and
  shape the negative's H&D curve on interactive canvases, live against your image.
  User-drawn curves override measured data, which overrides parametric fallbacks.
- **Textures Editor** — visual puck-based control of Grain (with chromatic
  distribution and crystal structure), Halation, and MTF/sharpness, with datasheet
  reference traces.
- **Dye Designer** — pick the actual C/M/Y/K dye colors on hue-faithful color cells
  with live plate-isolation thumbnails, master strips plus per-dye trims, and the
  Max Density / Green Flash controls in the header.

---

## 2. Control reference (for the page's "Controls" section)

Organize the page by the inspector's top-level groups, in this order.

### Quick Processing (open by default — the day-to-day grading surface)

- **Printer Light** (master) plus **Red / Green / Blue Printer Points** — lab-accurate
  printer lights: 25 = neutral, ±1 point ≈ 1/12 stop. **Lab convention: more light =
  denser/darker print — lower the value to print brighter.** Printer lights are
  *yours*: switching Full Presets never touches them.
- **Gel Matrix DMin / White / Gamma** — master trims over the three per-register
  black points, white points, and gammas (Single Stock): floor density, white
  clean-up, and overall plate contrast in three knobs.
- **Projector Bulb** preset — Custom / Carbon Arc / White Flame / Xenon. Sets the
  **Projector Power** and **Projector Red/Green/Blue** trims to calibrated period
  lamp values (Carbon Arc = silent-era house look; White Flame = brighter later arc;
  Xenon = cool modern source). Editing any trim by hand flips back to Custom.
- **Full Preset** — loads Silver Sensitivity + Dye Formation + HD Curve together per
  stock; individual **Neg Silver Sensitivity**, **Neg Dye Formation**, and **Neg HD
  Curve** dropdowns underneath for mix-and-match.
- **Processing Method** — the four modes above. **Gold Mirror Bias** appears only in
  Process 4.
- **Panel buttons** — Film Stock Editor, Textures Editor, Dye Designer.
- **Grain / Halation / MTF On/Off** — one-click master toggles (all default ON in v12).
- **Textures format** — a master dropdown (All Off / 65mm / 35mm / 16mm) plus
  individual Grain / Halation / MTF format dropdowns to mix formats per system.
- **Register Extraction** (collapsed subgroup, Single Stock) — per-register White
  Point, Black Point, and Gamma, plus **Auto Anchor Registers** (measures register
  white/black from the stock's own response; the sliders become trims).

### Film Development

Negative development controls and the **Enhanced Effects** interimage group —
inter-layer development interactions (dye inhibition and related couplers) that
shape saturation and color separation the way chemistry does, not a sat knob.

### Input Condition

- **Observer** — Status M (densitometry-faithful) or XYZ D65.
- **RGB Layer** — Red / Green / Blue / Luminance: which layer(s) of the source feed
  the simulation; Luminance for treating the input as a single record.

### Image Pipeline Config

- **Input transform** — DaVinci Wide/Intermediate (default), DaVinci Wide/Linear,
  Straight, Rec.709 2.2, Rec.709 2.4. Put the node in the right working space here.
- Advanced/collapsed engine groups live here and below for deep tweaking: the
  RGB→B/W matrix & register shaping (including the **Dye Shaping** preset, which
  defaults to **Gentle Pull** in v12), dye selection (per-dye hue choices — e.g.
  Pure Cyan / Electric Blue / Turquoise — plus full custom RGB colors, normally
  driven from the Dye Designer), plate preparation, mid/high/low-density per-dye
  controls, density rolloff, plate jitter and grain pooling artifacts, the projector
  light group, and a **Diagnostics** view-layer dropdown (isolate Cyan / Magenta /
  Yellow / Black plates, Grain, or Linear Ramps).

### Textures Editor detail (for a feature card)

Grain: amount/size with chromatic distribution and crystal-structure shape controls.
Halation: the red-orange glow around hot highlights from light bouncing off the film
base. MTF: film-resolution softness/acutance pucks — v12 restores the strong
edge-enhancement defaults (acutance 0.9, full 0–1 puck range). Film Breath group:
gate weave, mechanical, chemical-development, and emulsion-drift variations for
motion-era authenticity.

---

## 3. Quick start guide content

Frame it as "from drop-in to graded print in six steps":

1. **Apply the plugin** on a node and set **Image Pipeline Config → input transform**
   to match what's feeding it (default expects DaVinci Wide/Intermediate).
2. **Pick a Processing Method.** Start with Single Stock (Modern). Try Process 4 for
   the classic three-strip look (use the Double-X 5222 silver preset), Process 3 for
   the two-color 1920s look.
3. **Choose a stock** with a Full Preset, or mix Silver Sensitivity / Dye Formation /
   HD Curve presets individually.
4. **Balance with printer lights** — remember the lab direction: *lower* the lights
   to print brighter. Use the R/G/B points to neutralize, the master for exposure.
   Your printer-light balance survives preset switching.
5. **Shape the print** with the Gel Matrix masters. Recommended dial order:
   DMin down until scene black just reaches full density → White to clean residual
   dye out of highlights → Gamma for plate contrast → then printer lights for
   exposure only.
6. **Texture and finish** — pick a film format (65/35/16mm) for Grain/Halation/MTF
   or mix them; choose a Projector Bulb; open the Dye Designer if you want to move
   the dye hues themselves.

Add a callout box: "Everything defaults sensible in v12 — textures on, Gentle Pull
dye shaping, calibrated gel matrix — so the out-of-box image is already a print.
The controls are there for when you want to run the lab yourself."

---

## 4. Page requirements

- Version/platform banner: **v12.0.0 — DaVinci Resolve (OFX) — macOS Metal /
  Windows & Linux CUDA**. Download links point to the GitHub releases page of the
  `Technically-Technicolor-DRT` repo (Dec18studios org).
- Note which features are Mac-only in v12 (the three editor panels) — be honest,
  phrase as "panel parity for Windows/Linux is in progress."
- Quick start page cross-links to the product page and vice versa.
- Use placeholder image slots (hero frame, two-strip vs three-strip comparison,
  panel screenshots: FSE, Textures Editor, Dye Designer, Quick Processing
  inspector) with descriptive alt text — Greg will drop in real captures.
- Tone: matches the rest of tools.dec18studios.com — enthusiast-colorist voice,
  technically credible, no marketing fluff. Lead with "this is a process
  simulation, not a LUT."
