# OpenDRT — Standalone Page Build Prompt (for Claude Design)

> Paste this whole file to Claude as the brief. It is self-contained: it has the
> design system, the copy source, the exact download URLs, and the wiring needed
> to surface the page in the free-tools index.

---

## Goal

Build a new **standalone detail page** for the free, open-source **OpenDRT** OFX
plug-in, living on the GitHub Pages site (tools.dec18studios.com). The page is the
download hub: it carries **all three platform builds** (macOS / Windows / Linux),
install instructions, a feature tour, and the GPL-3.0 / Jed Smith attribution.

A new "Free" card on the main tools index will link **to this page** (not to a
direct download), because OpenDRT ships three platform-specific assets and can't
use the one-zip card pattern the other free tools use.

## Deliverable

Create **`color-grading-tools/opendrt/index.html`** (new directory `opendrt/`).

It is a sibling of the existing GitHub-Pages detail pages — match their conventions:
`color-grading-tools/photochemist/`, `color-grading-tools/lookdevtools/`,
`color-grading-tools/film-negative-space-cst/`.

A single self-contained HTML file (inline `<style>`, inline `<script>` only if
needed). No build step. No external JS deps beyond Google Fonts.

---

## Design system — copy it verbatim from the LookDevTools page

OpenDRT is the **"6A" tool inside Look Dev Tools**, so this page must feel like a
sibling of `color-grading-tools/lookdevtools/index.html`. Open that file and reuse
its `:root` token block, fonts, and component styling. Key tokens:

- **Fonts** (Google Fonts): `Bricolage Grotesque` (display), `Hanken Grotesk`
  (sans/body), `JetBrains Mono` (mono/eyebrows).
- **Palette**: dark oklch theme. Background `oklch(0.165 0.012 264)`, ink
  `oklch(0.95 0.006 264)`. Use the **blue** accent for OpenDRT (it is the blue
  6A tool): `--blue: oklch(0.62 0.165 262)` with `--blue-d` tint.
- **Layout**: `--maxw: 1180px`, `--pad: clamp(20px, 5vw, 64px)`, `.wrap` centering.
- Reuse the eyebrow / hero / stage-card / `.why` callout / footer patterns already
  in the LookDevTools page. Match its reveal-on-scroll feel if cheap; not required.

Keep it consistent with the brand: this should look like it belongs next to the
PhotoChemist, TDRT, and LookDevTools pages, not like a different site.

---

## Page structure (sections, top to bottom)

1. **Header / nav** — same minimal top bar as the other detail pages, with a
   "Tools" link back to `../` (the index) and the Dec. 18 Studios mark. Add a
   small **"Free · GPL-3.0"** pill near the title.

2. **Hero**
   - Eyebrow: `Open-source display transform · OFX · Resolve · Fusion · Nuke`
   - Title (from old page): **"Picture Formation of the Highest Caliber"** — or a
     tightened variant. Subhead: *"No more chalky highlights."*
   - One-paragraph intro (from old page copy below).
   - Primary CTA button: **"Download OpenDRT →"** that scroll-anchors to the
     Downloads section (`#download`).
   - Secondary link: "View source on GitHub" →
     `https://github.com/Dec18studios/Open-DRT-OFX`.

3. **What it is** — short section using the old page's framing: OpenDRT replaces
   the last node in your tree (the display-prep CST) in a node-based color-managed
   pipeline. Built by Jed Smith as a DCTL; expanded by Greg Enright into an OFX
   that leverages the richer OFX UI and adds CUDA/OpenCL (Windows/Linux) builds.

4. **Downloads** (`id="download"`) — THE important section. Three platform cards or
   buttons, side by side on desktop, stacked on mobile. Exact URLs in the
   "Download URLs" section below. Each download link MUST use the site's email-gate
   (see "Email-gated downloads" below). Under each button show the install path.

5. **Install** — per-platform steps (from README + old page), see "Install copy".
   Include the macOS Gatekeeper note ("if Apple tells you to delete it, don't —
   allow it in Security settings, restart Resolve").

6. **Features / modules** — the look-dev modules. Use the old page's module copy
   (Tonescale, Purity, Brilliance, Hue Shift) plus the LookDevTools card's fuller
   list. Mention: **16 input gamuts**, **Look + Tonescale presets**, a
   **persistent-value lock** (changing presets won't wipe manual work), and the
   creative modules: High/Low Contrast, Purity, Brilliance, Hue Shift RGB + CMY,
   Hue Contrast.

7. **Diagnostics** — Grey-scale ramp, tone-scale curve, RGB Chips pattern (from old
   page). Frame as built-in scopes/overlays.

8. **Beta features** — optional sandbox modules (filmic / projector simulation).
   Carry the old page's "test at your own discretion, won't interfere with core"
   caveat.

9. **Support / donate** (optional but on-brand) — it's free and open-source; a
   light "Help support development" block. Either link to the existing Squarespace
   donate flow at `https://dec18studios.com/open-drt-ofx#support` or omit if you
   want a leaner page. Designer's call.

10. **License / attribution** — GPL-3.0. OpenDRT © Jed Smith; OFX wrapper, CUDA &
    Metal backends, build system © Dec. 18 Studios, also GPL-3.0. Link Jed's work:
    `https://github.com/jedypod/open-display-transform`. Link the source repo:
    `https://github.com/Dec18studios/Open-DRT-OFX`.

11. **Footer** — match the other detail pages' footer (the hand-written "Tools"
    column). Keep links current.

---

## Download URLs (current release: OpenDRT v2.0.0)

Repo: `https://github.com/Dec18studios/Open-DRT-OFX` (public).

Use the **`releases/latest/download/`** form so the links keep working when assets
are re-published at the same names; if the version string in the asset name changes
on a future release, these links must be updated (same maintenance the other free
tools already need).

| Platform | Download URL | Install path |
|----------|--------------|--------------|
| **macOS** (universal, Metal) | `https://github.com/Dec18studios/Open-DRT-OFX/releases/latest/download/OpenDRT_v2.0.0_macOS_universal.zip` | `/Library/OFX/Plugins` |
| **Windows** (x86_64, CUDA) | `https://github.com/Dec18studios/Open-DRT-OFX/releases/latest/download/OpenDRT_v2.0.0_windows_x86_64_cuda.zip` | `C:\Program Files\Common Files\OFX\Plugins` |
| **Linux** (x86_64, CUDA) | `https://github.com/Dec18studios/Open-DRT-OFX/releases/latest/download/OpenDRT_v2.0.0_linux_x86_64_cuda.tar.gz` | `/usr/OFX/Plugins` |

Also surface a plain link to the **Releases page** for anyone who wants an older
build or the source: `https://github.com/Dec18studios/Open-DRT-OFX/releases`.

After unzip, the final layout is e.g.
`/Library/OFX/Plugins/OpenDRT.ofx.bundle/…`. Restart the host. The effect appears
under the **Dec. 18 Studios** group as **OpenDRT**.

---

## Email-gated downloads (match the rest of the free tools)

The index page intercepts clicks on any link with `class="dl"` and runs them
through an email-capture modal + download logger before the download fires (see
`color-grading-tools/index.html`, the `.dl` click interceptor + `LOG_URL` worker).

For consistency, the three download links on this page should each be:

```html
<a class="dl" href="<download-url-from-table>"
   data-slug="opendrt" data-name="OpenDRT — macOS" target="_blank" rel="noopener">
   Download for macOS →
</a>
```

If you want the gate to actually run on THIS page (not just the index), port the
small `.dl` interceptor + email modal + `log()` / `triggerDownload()` helpers from
`color-grading-tools/index.html` into this page's inline `<script>`. If that's out
of scope, the links still work as plain downloads (the `class="dl"` and
`data-*` attributes are harmless and keep the markup ready for the gate). State
which choice you made.

---

## Copy source (old standalone page — use, tighten, don't invent specs)

The previous standalone page lived on Squarespace at
`dec18studios.com/open-drt-ofx`. Pull and tighten this copy. Do **not** copy its
stale source link (it pointed at the old `OFXplugins/tree/main/Open DRT` repo —
the correct repo is now `Dec18studios/Open-DRT-OFX`).

**Intro:**
> OpenDRT is an open-source Picture Formation Transform, designed to create an
> aesthetically pleasing picture out of raw camera image data. It enables image
> authors by allowing creative control over image appearance — through a simple
> preset system and a more extensive set of look-development modules.

**Origin:**
> Originally built as a DCTL for DaVinci Resolve by Jed Smith. This open-source
> tool has been expanded by Greg Enright to function as an OFX and leverage the
> unique capabilities of that interface.

**Where it sits in the pipeline:**
> OpenDRT replaces the last node in your node tree — the one reserved for the
> default CST that prepares your image for display. This assumes node-based color
> management as your grading pipeline.

**Modules (expand each into a short card):**
- **1. Tonescale** — scene-referred linear light → display-referred luminance.
  Contrast, rolloff, mid-grey placement; peak luminance for SDR/HDR; middle-grey in
  nits; toe/shoulder rolloff; contrast shaping above/below grey; shadow offset for
  density.
- **2. Purity** — color intensity relative to luminance; graceful purity
  compression that avoids harsh clipping and keeps perceptual smoothness.
- **3. Brilliance** — brightness of saturated colors; compensates clipping in
  narrow-band sources (LEDs); soft glow / density variation.
- **4. Hue Shift** — guide hue paths across luminance and purity axes; address the
  Abney effect; pleasing hue bends as tones move dark → bright.

**Diagnostics:** Grey-scale ramp (how far off a linear line your RGB values are),
tone-scale curve (how things shifted across 0–1), RGB Chips pattern (how individual
hue vectors are affected).

**"StickShift" / manual modes:** In the DCTL, full control requires the unwieldy
"StickShift" build. In the **OFX, manual and StickShift modes are combined in the
UI** and openly accessible — tweak every preset. Fancy modes: high-end contrast,
low-end contrast, mid purity, brilliance, hueshift RGBCMY, hue contrast.

**License blurb:**
> This OpenDRT OFX incorporates and builds upon open-source components licensed
> under the GNU General Public License (GPL). All modifications and distributions
> are maintained in full compliance with the GPL. The complete source, including
> changes, is publicly available at https://github.com/Dec18studios/Open-DRT-OFX.

---

## After the page exists — wire it into the free index (mechanical, can be done separately)

So the new "Free" card points at this page:

1. **`color-grading-tools/tools.json`** — add an entry (no `dlUrl`, so the card
   becomes a plain link to the page):
   ```json
   {
     "name": "OpenDRT",
     "slug": "opendrt",
     "tier": "free",
     "color": "blue",
     "desc": "Jed Smith's open-source display rendering transform, as a free OFX — Metal + CUDA, 16 input gamuts, full look-dev modules.",
     "url": "opendrt/",
     "repo": "Open-DRT-OFX"
   }
   ```
2. **`color-grading-tools/index.html`** — add the same object to the inline `TOOLS`
   array (keep it in sync with tools.json; the index renders from the inline array,
   tools.json is the auto-sync manifest).
3. Leave `dlUrl` **out** so `card()` renders the card as a single link to
   `opendrt/` (View →) rather than a direct one-zip Download → button. The
   per-platform downloads live on the detail page.

---

## Acceptance checklist

- [ ] `opendrt/index.html` renders, visually matches the LookDevTools page family.
- [ ] All three platform downloads present, correct URLs, correct install paths.
- [ ] Download links carry `class="dl"` + `data-slug="opendrt"` (+ email gate
      ported, or noted as deferred).
- [ ] GPL-3.0 + Jed Smith attribution + correct repo link
      (`Dec18studios/Open-DRT-OFX`, NOT the old OFXplugins path).
- [ ] Back-to-Tools nav + footer match sibling pages.
- [ ] Responsive: download cards stack cleanly on mobile.
- [ ] Free card added to `tools.json` + `index.html` TOOLS array, `url: "opendrt/"`.
