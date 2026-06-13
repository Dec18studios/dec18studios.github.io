# CONTENT + DIRECTION PROMPT — Technically Technicolor DRT — QUICK START GUIDE

## INSTRUCTIONS FOR CLAUDE DESIGN

You are building the **Quick Start Guide** page for **Technically Technicolor DRT**, an OFX
plugin for DaVinci Resolve by Dec18 Studios. It lives at **tools.dec18studios.com** under
`color-grading-tools/technicolor-drt/quick-start.html` and is the practical, detailed companion
to the landing page (`technicolor-drt/index.html`).

- **Match the existing site.** Same nav, footer, type, and component conventions as the
  `color-grading-tools/photochemist/` pages. This is a long, reference-style page — give it a
  sticky in-page table of contents / section nav so colorists can jump to a control group.
- **You own layout; the copy below is final.** It's polished and ready to place. Don't invent
  controls, values, or behavior beyond what's here — every control name and number below is real
  and comes from the shipping plugin.
- **Tone:** practical, precise, film-literate. Like a great manual written by a colorist who
  actually uses the tool. Short imperative steps; explain *why* when the why is non-obvious
  (especially the lab conventions, which are counterintuitive).
- **Image slots** are marked `[IMAGE: …]` with alt text and capture description — placeholder
  frames only; Greg adds real screenshots.
- **Cross-link** back to the landing page from the nav and the intro, and from a CTA at the end.
- **Pricing:** not on this page. If any "get the plugin" link is needed, point to the landing
  page or the GitHub releases of the **Technically-Technicolor-DRT** repo.

---

## PAGE STRUCTURE

### 0. Header + intro

Heading: **Technically Technicolor DRT — Quick Start**
Sub: *From drop-in to a graded dye-transfer print, then the full control tour.*

Short intro:
> This guide gets you to a finished print in a few minutes, then walks every control group in
> the inspector and all three editor panels. New to the tool? Start at the landing page for the
> what-and-why. If you've already applied the node, jump straight to *Your First Grade*.

Link: `← Back to the Technically Technicolor DRT overview` → index.html

Put a sticky TOC here listing: Install · Your First Grade · Quick Processing · Register
Extraction · Film Development · Input Condition · Image Pipeline Config · Film Stock Editor ·
Textures Editor · Dye Designer · Workflow Recipes · Troubleshooting & FAQ.

---

### 1. INSTALLATION (per platform)

Section heading: **Install**

Intro:
> Technically Technicolor DRT is an OFX plugin. Distribution is portable per-platform zips from
> GitHub releases on the **Technically-Technicolor-DRT** repo. Quit DaVinci Resolve before
> installing, restart it after.

Then three labeled sub-blocks (tabs or stacked):

**macOS (Universal — Apple Silicon + Intel, Metal)**
> 1. Download the macOS zip from the releases page and unzip it.
> 2. Place the `TechnicolorDRT.ofx.bundle` in the OFX plug-ins directory:
>    `/Library/OFX/Plugins/` (create the folder if it doesn't exist).
> 3. The bundle is codesigned; if Gatekeeper still objects, allow it in System Settings →
>    Privacy & Security.
> 4. Launch Resolve. The plugin appears in the OpenFX library as **Technicolor DRT**.

**Windows (x64, CUDA)**
> 1. Download the Windows zip and unzip it.
> 2. Place the bundle in `C:\Program Files\Common Files\OFX\Plugins\`.
> 3. **GPU requirement:** an NVIDIA **Turing or newer** GPU (RTX 20-series / GTX 16-series and
>    up). The spectral negative kernel will not load on pre-Turing cards.
> 4. Launch Resolve and find **Technicolor DRT** in the OpenFX library.

**Linux (x86_64, CUDA)**
> 1. Download the Linux zip and unzip it.
> 2. Place the bundle in `/usr/OFX/Plugins/` (or your distribution's OFX plug-ins path).
> 3. Same **Turing-or-newer NVIDIA** requirement as Windows.
> 4. Launch Resolve and find **Technicolor DRT** in the OpenFX library.

Callout:
> **All three platforms render identically** — verified parity. The editor panels are native
> Metal on macOS and pixel-equivalent ImGui twins on Windows/Linux.

`[IMAGE: Resolve's OpenFX library with Technicolor DRT visible, being dragged to a node. Alt:
"The Technicolor DRT plugin in Resolve's OpenFX library."]`

---

### 2. YOUR FIRST GRADE (the fast path)

Section heading: **Your first grade in five moves**
Intro:
> The defaults in v12 already produce a print — textures on, Gentle Pull dye shaping, calibrated
> Gel Matrix. The image you get on drop-in is already a Technicolor print. These five moves get
> you oriented; the full control tour is below.

Numbered, each step one or two sentences:

> **1. Drop it on a node.** Add Technicolor DRT to a serial node in the Color page. Open the
> **Image Pipeline Config** group and set **Input Mode** to match what's feeding the node — the
> default expects DaVinci Wide Gamut / Intermediate.
>
> **2. Pick a Processing Method.** In **Quick Processing**, the **Processing Method** dropdown
> defaults to **Single Stock (Modern)** — leave it there for your first pass. (Try **Process 4
> (3-Strip)** or **Process 3 (2-Strip)** later for the classic looks.)
>
> **3. Choose a stock.** Use a **Full Preset** to load Silver Sensitivity, Dye Formation, and HD
> Curve together — or mix them with the **Neg Sensitivity**, **Neg Dye**, and **Neg HD Curve**
> dropdowns underneath.
>
> **4. Balance with printer lights.** Use the Red / Green / Blue **printer lights** to neutralize
> and the master for exposure. Remember the lab direction: **more light = a denser, darker
> print — lower a light to print brighter.** Your printer-light balance survives preset switching.
>
> **5. Shape the print.** Dial the **Gel Matrix** masters in order: **DMin** down until scene
> black just reaches full density → **White** to clean residual dye out of highlights → **Gamma**
> for plate contrast. Then use printer lights for exposure only.

Callout box:
> **Everything defaults sensible in v12** — textures on, Gentle Pull dye shaping, a calibrated
> Gel Matrix — so the out-of-box image is already a print. The controls below are there for when
> you want to run the lab yourself.

`[IMAGE: the Quick Processing inspector group open, with printer lights, Gel Matrix, and the
Processing Method dropdown visible. Alt: "The Quick Processing inspector group."]`

---

### 3. CONTROL TOUR — INSPECTOR GROUPS

Intro line for the whole tour:
> The inspector reads top to bottom in workflow order: **Quick Processing → Film Development →
> Input Condition → Image Pipeline Config.** Here's every group.

#### 3a. Quick Processing  *(open by default — your day-to-day surface)*

Lay this out as an ordered control list — it mirrors the panel's real top-to-bottom order:

- **Printer Lights (Red / Green / Blue + master)** — lab-accurate printer points. Neutral sits
  at the middle of the range; small steps are roughly a fraction of a stop each. **Lab
  convention: raising a light makes that channel's print *denser/darker* — lower it to print
  brighter.** Printer lights are yours: switching a Full Preset never touches them.
- **Gel Matrix DMin / White / Gamma** — master trims over the three per-register black points,
  white points, and gammas (Single Stock). DMin sets floor density (how deep black goes), White
  cleans residual dye out of the highlights, Gamma sets overall plate contrast — three knobs over
  the whole print.
- **Projector Power + Projector Red / Green / Blue** — the projector-lamp stage. Power is overall
  output; the R/G/B trims tint the light. Neutral is 1.0 on each.
- **Projector Bulb** *(preset)* — Custom / Carbon Arc / White Flame / Xenon. Sets the Projector
  Power and R/G/B trims to empirically-calibrated period-lamp values. **Carbon Arc** is the
  silent-era / 2-strip house look; **White Flame** is the brighter later arc; **Xenon** is the
  cool modern source. Editing any projector trim or Power by hand flips this back to **Custom**.
- **Full Preset** — loads Silver Sensitivity + Dye Formation + HD Curve together per stock. The
  individual **Neg Sensitivity**, **Neg Dye**, and **Neg HD Curve** dropdowns underneath let you
  mix and match.
- **Processing Method** — the four modes (covered above and in §4). **Gold Mirror Bias** appears
  here **only in Process 4**.
- **Panel buttons** — *Film Stock Editor…*, *Textures Editor…*, *Dye Designer…* open the floating
  editors.
- **Grain On/Off · Halation On/Off · MTF On/Off** — one-click master toggles for the three
  texture systems. **All default ON in v12.**
- **Textures format** — a master **Textures** dropdown (Off / 65mm / 35mm / 16mm) plus individual
  **Grain**, **Halation**, and **MTF** format dropdowns to mix formats per system.
- **Register Extraction** *(closed subgroup — see 3b).*

> **Gold Mirror Bias (Process 4 only):** biases the prism light split between the green record
> (+) and the blue/red bipack (−), ±1 stop, default 0 = balanced. Green is photometrically the
> weakest path in three-strip, so a touch of + bias is a common balance move.

#### 3b. Register Extraction  *(Single Stock — collapsed subgroup inside Quick Processing)*

> Only active in **Single Stock (Modern)**. This is the seam between the scanned negative and the
> dye/plate system — per-register **White Point**, **Black Point**, and **Gamma** for Red, Green,
> and Blue, plus **Auto Anchor Registers**.
>
> - Manually: set each **Black Point** so scene black just reaches full dye density, then the
>   **White Points**, then **Gamma**.
> - **Auto Anchor Registers** *(on)*: the white/black points are measured per render by probing
>   the neg pipeline with scene white and scene black at neutral lights, and the sliders become
>   *trims* — White becomes an offset from the measured anchor, Black becomes a scale of it. Off,
>   the sliders are absolute scan levels.
> - **Note:** Auto Anchor feeds register extraction, which only Single Stock runs — it does
>   nothing in Neg Scan mode.

#### 3c. Film Development

> Negative development controls, plus the **Enhanced Effects** interimage subgroup — the
> inter-layer development interactions (dye inhibition and related couplers) that shape saturation
> and color separation the way chemistry does, not a saturation knob.

#### 3d. Input Condition

> - **Observer** — Status M (densitometry-faithful) or XYZ under D65.
> - **RGB Layer** — which layer(s) of the source feed the simulation (used by the debug/diagnostic
>   views).

#### 3e. Image Pipeline Config  *(collapsed — working space + deep engine)*

> - **Input Mode** — set the node's working space: DaVinci Wide Gamut / Intermediate (default),
>   DaVinci Wide / Linear, Straight, Rec.709 2.2, Rec.709 2.4. Get this right first.
> - **View Mode / Diagnostic Mode** — visualization and overlay modes for the spectral simulation.
> - Deeper collapsed engine groups live here and below for power users: the RGB→B/W matrix and
>   register shaping, dye selection (per-dye hue choices and full custom RGB colors — normally
>   driven from the Dye Designer), plate preparation, mid / high / low-density per-dye controls,
>   density rolloff, plate jitter and grain-pooling artifacts, the projector-light group, Film
>   Breath (gate weave, mechanical, chemical, emulsion drift), and a **Diagnostics** view that can
>   isolate the Cyan / Magenta / Yellow / Black plates or show linear ramps.

`[IMAGE: the full inspector scrolled to show the group hierarchy. Alt: "The Technicolor DRT
inspector group hierarchy."]`

---

### 4. CONTROL TOUR — THE EDITOR PANELS

Intro:
> Three floating editors open from the Quick Processing buttons. Native Metal on macOS,
> pixel-equivalent ImGui twins on Windows/Linux. Everything they control persists in the project.

#### 4a. Film Stock Editor (FSE)

> Sculpt the negative on interactive canvases, live against your image:
> - **Silver Sensitivity** — draw the spectral sensitivity curves of the emulsion's silver layers.
> - **Dye Colors (Negative)** — shape the dye density / absorption curves.
> - **HD Curves** — sculpt the characteristic (D-log-E) curve: toe, gamma, shoulder.
>
> A three-level override decides what the simulation uses: **your drawn curve > measured spectral
> data > the parametric Gaussian fallback.** Draw where you want control; leave the rest to the
> model. Switching a stock preset re-seeds the panel's curves so you're always editing the stock
> you think you are.

`[IMAGE: FSE with a sculpted curve on the canvas. Alt: "The Film Stock Editor."]`

#### 4b. Textures Editor

> Puck-based control over the three texture systems, with datasheet reference traces on the canvas:
> - **Grain** — amount and size, with **Chromatic Distribution** (per-channel grain) and **Crystal
>   Structure** (coarse/fine sublayers, and Crystal Shape: Round / Square / T-Grain).
> - **Halation** — strength and spread of the red-orange glow off the film base.
> - **MTF / Film Resolution** — sharpness / acutance pucks. v12 restores the strong edge-enhancement
>   defaults, so the print reads as resolved rather than soft.
>
> Pick a film format (65 / 35 / 16mm) per system from Quick Processing, or mix them.

`[IMAGE: Textures Editor with grain/halation/MTF canvases. Alt: "The Textures Editor."]`

#### 4c. Dye Designer  *(the v12 headline)*

> The dye control surface, consolidated into one panel.
>
> - **2×2 C/M/Y/K grid.** Each dye cell shows a **dye leaf** — the RGB cube cut along the
>   white→dye→black plane, with the dye's real trajectory stroked in its actual sample color, so
>   you literally see the path the dye takes from white to black. Below the leaf are two editable
>   function strips:
>   - **Chroma C(T):** a toe/pinch puck, a saturation-threshold puck, and a white-zone puck
>     (white saturation threshold, white pull, white taper).
>   - **Hue-offset θ(T):** a black-hue-shift puck on the left, a hue-bend puck in the middle
>     (strength / midpoint / curve), and a white-hue-shift puck on the right.
> - **Master row** (above the grid) edits the globals directly. Each dye cell then writes **per-dye
>   trims as offsets** against the master — readouts show the offset (e.g. *pinch 0.42 (M 0.30
>   +0.12)*). It's the master-plus-offset workflow from a real grading panel.
> - **Live plate-isolation thumbnails** at the top re-render the actual kernel per dye as you drag,
>   plus the final image with an optional *Show Neg Scan* toggle.
> - **Header:** **Max Density** (global density limit) and **Green Flash** (the black record).
> - **Dye Shaping presets:** Neutral / Gentle Pull / Vivid Pull / Custom. **Gentle Pull is the
>   v12 default.** Any manual sculpt flips the preset to Custom.
>
> Drag feel: grab ≠ snap — pucks move by relative deltas from the grab point. Double-click a puck
> to reset it; hold ⌥/Alt for fine drag; scroll for the curve exponent where a puck supports it.

`[IMAGE: Dye Designer — 2×2 CMYK grid, dye leaves, Master row, live plate thumbnails. Alt: "The
Dye Designer panel."]`

> **Platform note:** in earlier builds the panels were macOS-only; **v12 ships the Dye Designer
> (and the other panels) on Windows and Linux too** via pixel-equivalent ImGui twins — verified
> indistinguishable from the Mac versions.

---

### 5. WORKFLOW RECIPES

Section heading: **Recipes**
Present each as a titled, numbered mini-walkthrough card.

**Recipe A — Classic three-strip look in five steps**
> 1. **Processing Method → Process 4 (3-Strip).** The **Gold Mirror Bias** slider appears in Quick
>    Processing.
> 2. **Neg Silver preset → Double-X 5222** (the recommended three-strip stock).
> 3. Balance the records with **Gold Mirror Bias** — nudge toward + if green reads weak (it's the
>    weakest path in three-strip).
> 4. Set blacks and contrast with **Gel Matrix DMin → White → Gamma**; neutralize with printer
>    lights.
> 5. Finish: pick a **Projector Bulb** (Carbon Arc or White Flame for period warmth), confirm
>    Grain / Halation / MTF are on, and open the **Dye Designer** if you want to push the CMYK
>    plates. Green Flash (header) controls the key.

**Recipe B — Two-color 1920s look**
> 1. **Processing Method → Process 3 (2-Strip).** The image collapses to two-color — salmon skin,
>    no true blue, warm brown-blacks. That's correct.
> 2. **Neg Silver preset → Double-X 5222.** In Process 3, dye-stock selection no longer matters
>    (the carriers are forced), so 5222 is the natural choice.
> 3. Balance with the Red and Green **printer lights** and the **Gel Matrix** masters — only the
>    red/green registers are live; blue register controls are hidden.
> 4. Use the **dye hue dropdowns** or the **Dye Designer** to tune the two live plates (the
>    blue-green and red-orange). Yellow/Black are inert; Green Flash does nothing here (no key).
> 5. Reach for **Carbon Arc** on the Projector Bulb for the silent-era house look.

**Recipe C — Modern single-stock film emulation**
> 1. **Processing Method → Single Stock (Modern)** (the default).
> 2. Pick a **Full Preset** for a starting stock.
> 3. Open **Register Extraction**, turn on **Auto Anchor Registers**, and let it measure the
>    register anchors; the sliders become trims.
> 4. Set the look with **Gel Matrix DMin → White → Gamma**, then printer lights for exposure only.
> 5. Texture to taste (format per system), pick a Projector Bulb, and you have a modern-shot,
>    Technicolor-printed image that responds to the grade.

**Recipe D — Designing custom dyes**
> 1. Open the **Dye Designer**.
> 2. Start on the **Master** row to set the global chroma and hue-bend behavior across all four
>    plates.
> 3. Move into individual dye cells; each writes a **trim offset** against the master. Watch the
>    **dye leaf** to see the white→dye→black trajectory change, and the **live plate thumbnails**
>    to see the isolated plate update.
> 4. Set the **Max Density** and **Green Flash** in the header.
> 5. When you have a look, leave it as **Custom**, or start from **Gentle Pull / Vivid Pull /
>    Neutral** and trim from there. Everything persists with the project.

---

### 6. TROUBLESHOOTING & FAQ

Section heading: **Troubleshooting & FAQ**
Use an accordion or a clean Q/A list.

> **The plugin doesn't appear in Resolve.** Confirm the bundle is in the correct OFX plug-ins
> directory for your OS (macOS `/Library/OFX/Plugins/`, Windows `C:\Program Files\Common
> Files\OFX\Plugins\`, Linux `/usr/OFX/Plugins/`) and fully restart Resolve.
>
> **Windows/Linux: it loads but won't render / errors on the GPU.** You almost certainly have a
> pre-Turing NVIDIA card. The spectral negative kernel requires **Turing or newer** (RTX 20-series
> / GTX 16-series and up). This is a hard floor, not a recommendation.
>
> **Raising a printer light made the image darker.** That's the real lab convention — more printer
> light means a denser, darker print. **Lower** a light to print brighter.
>
> **My Gel Matrix / printer-light balance disappeared when I switched stocks.** It shouldn't —
> printer lights are deliberately preserved across **Full Preset** switching in v12. If a balance
> seems off after a preset change, it's the stock's own response, not a reset of your lights.
>
> **Auto Anchor Registers "does nothing."** Auto Anchor only feeds **Single Stock (Modern)**. If
> you're in **Neg Scan (Diagnostic)**, it's inert by design — switch to Single Stock.
>
> **The image looks soft.** Make sure **MTF On/Off** is on (it is by default in v12) and check the
> MTF acutance in the Textures Editor — v12 restored the strong edge-enhancement defaults.
>
> **Process 3 went monochrome.** In two-strip the record separation lives in the dye colors and the
> carriers are forced — pair it with **Double-X 5222**. If it still looks flat, check the Red/Green
> printer lights and the Gel Matrix masters; only two plates are live.
>
> **Where did the dye / texture / matrix controls go?** Many deep controls are intentionally
> secreted into collapsed groups in **Image Pipeline Config**, or surfaced through the editor
> panels (Dye Designer, Textures Editor, Film Stock Editor). The panels are the intended surface;
> the inspector groups are still there for direct access.
>
> **What's the difference between the Register black point and pull-to-black in the Dye Designer?**
> They're different jobs. The register **Black Point** is calibration — it makes the plate reach
> full dye density. **Pull-to-black** (in the Dye Designer) is design — it tapers and hue-rotates
> the trajectory into black, and it only fires fully once the register is properly anchored. Anchor
> first, then sculpt.
>
> **Does it look the same on Mac, Windows, and Linux?** Yes — rendering parity is verified across
> all three, and the editor panels are pixel-equivalent twins.

---

### 7. CTA / footer

> Want the overview, the four-method breakdown, and download links? **See the Technically
> Technicolor DRT product page.** → index.html

Standard site footer; restate v12.0.0 / DaVinci Resolve (OFX) / macOS Metal · Windows & Linux
CUDA. By Dec18 Studios.

---

## NOTES FOR CLAUDE DESIGN

- This is a **reference page** — favor scannability: sticky TOC, clear group headers, generous
  control lists, accordions for the FAQ.
- Preserve **exact control names** as written (they match the plugin UI): Quick Processing,
  Printer Lights, Gel Matrix DMin / White / Gamma, Projector Power, Projector Bulb (Carbon Arc /
  White Flame / Xenon), Full Preset, Neg Sensitivity / Neg Dye / Neg HD Curve, Processing Method,
  Single Stock (Modern), Process 3 (2-Strip), Process 4 (3-Strip), Neg Scan (Diagnostic), Gold
  Mirror Bias, Register Extraction, Auto Anchor Registers, Film Development, Enhanced Effects,
  Input Condition, Observer, RGB Layer, Image Pipeline Config, Input Mode, Diagnostics, Film Stock
  Editor, Silver Sensitivity, Dye Colors (Negative), HD Curves, Textures Editor, Chromatic
  Distribution, Crystal Structure, MTF / Film Resolution, Dye Designer, Master, Max Density, Green
  Flash, Dye Shaping (Neutral / Gentle Pull / Vivid Pull / Custom), Film Breath.
- The counterintuitive lab conventions (more light = darker; anchor before pull-to-black) deserve
  visual emphasis — pull them into callout boxes.
- No pricing on this page; no invented features or values.
