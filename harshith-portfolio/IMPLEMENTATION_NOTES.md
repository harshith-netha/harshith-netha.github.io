# Implementation notes for review

## October 25, 2026: evidence-first enhancement

Confirmed audience: technical engineering reviewers. Preserved résumé facts, simulated-data disclosures, existing interactions, and the five-second skippable first-visit introduction. The user selected code-first implementation.

- Moved selected work before biography and experience; added all-work, detailed-study, and academic-project filters with status announcements.
- Retained the existing palette, bundled fonts, and production cell; refined opening proportions, project layouts, typography, expertise, contact, and mobile composition.
- Added shared case-study navigation with sticky contents, current-section indication, focus transfer, and reading progress.
- Added validated URL filter restoration, copy-link feedback with a clipboard fallback, and weekly CSV exports to the OEE dashboard.
- Made academic diagrams immediately visible and case-study charts eager-loading; preserved motion controls and reduced-motion CSS.
- Recorded product context and design tokens for future work.

Verification: JavaScript syntax and Git whitespace checks pass. All 96 local links/assets resolve. Browser checks found no horizontal document overflow across all three pages at requested widths 320, 390, 768, 1024, and 1440; the homepage also fits the 702px app panel. No browser errors were observed. Project filters, DMAIC keyboard End navigation, mobile navigation focus, motion pause, deep-link intro bypass, dashboard filters/reset, copied-link restoration, and CSV download were exercised. The 13 exported Line 1 / Shift C weeks match raw CSV-derived A/P/Q/OEE, scrap, and good-count values.

The Impeccable engine could not start because its binary was not installed and the cache directory was not writable. Skill guidance, browser inspection, and an independent finish reviewer were used directly. Reduced-motion and no-JavaScript fallback paths were preserved and inspected in source; this session did not run a complete accessibility audit or a cross-browser suite.

## October 2026 refinement

- The first-visit intro now runs for **five seconds**, as explicitly requested. The conveyor component moves to the inspection gantry, the quality scanner cycles once, and a short hero/nav entrance plays when the loader clears. The timer is independent of Three.js and has a visible Skip intro control plus a head-script fail-safe. First entry per tab only; reduced-motion, direct section links, browser back/forward, keyboard navigation, repeat visit, and skip bypass the wait.
- Added a locally hosted Sora variable display font (OFL) paired with Manrope for readable page copy. The polished palette keeps Claude’s warm ivory, midnight navy, copper, and muted teal; the background flow and loader share the same industrial color and geometry.
- Added light/dark process-route backdrops to the hero and contact sections using native SVG motion paths. A header Pause/Resume control governs both backdrops and Three.js; offscreen SVG backdrops pause. The visual paths stay behind page content and do not intercept input.
- Fixed mobile nav link focus to move to the selected section before the menu closes.
- Updated the README’s loader, background, typography, and fallback documentation. The earlier README described a published simulated dataset; corrected it: the schematics are illustrative and contain no invented metrics.

**Final refinement verification:** 22 of 22 browser checks passed in Chromium with SwiftShader WebGL. The intro timing check measured five seconds including the fade; Sora and Manrope loaded locally; the 3D scene rendered; pause/resume worked across both the background routes and the 3D scene; live reduced-motion changes paused motion; skip, direct links, and keyboard entry bypassed the loader; mobile navigation and no-JavaScript behavior worked. There was no horizontal overflow at 320, 375, 390, 768, 1024, 1440, 1920, or 844×390 landscape. No page exceptions or failed asset requests occurred. Screenshots: `/tmp/hg-loader-desktop.png`, `/tmp/hg-desktop-final.png`, and `/tmp/hg-mobile-final.png`.

The checked dark/light design token pairs meet WCAG AA: copper/warm paper 5.30:1; navy/warm paper 13.21:1; muted copy/warm paper 5.31:1; teal/warm paper 5.62:1; light copper/deep navy 7.50:1; and muted dark-surface copy/deep navy 9.82:1.

## What changed and why

### Design
- **Starting point:** I kept the earlier agent's navy / cool-paper / copper / teal direction and section structure.
- **Rewrites:** `index.html` and `styles.css` are now in readable, formatted form. The minified originals are backed up in the session scratchpad.
- **Type scale:** body text went from 15px to 17px (16px on phones). Every caption, label, tag and diagram label is now ≥ 12px; the previous file used 6.5–10px in many places. Headings use fluid `clamp()` sizes. The hero headline now holds two lines on desktop instead of four.
- **Contrast:** the original gray-paper/copper pair was checked at 4.59:1. The final warm-paper/ivory palette and dark-panel pairs were recalculated and exceed 5.3:1 for the checked text tokens.
- **Motion, kept deliberate:**
  - a short conveyor loader
  - a staggered hero entrance that starts when the loader ends (not behind it)
  - project diagrams that draw once on entering the viewport
  - tab/details transitions

  All of it is inside `prefers-reduced-motion: no-preference`, and content is visible by default without it.
- **Copy:**
  - The hero intro is more specific: root cause analysis, statistical quality tools, shop-floor changes.
  - The DMAIC section now has five real tabpanels. Each has an "In practice" line taken from resume bullets.
  - In-page links use ↓/→ instead of ↗; ↗ is kept only for the external LinkedIn link.
  - No facts, metrics, links or credentials were added beyond the resume. "Illustrative, not measured" and "Illustrative design space" captions label the schematic diagrams.
- **Markup:**
  - The footer moved out of the contact section so it is a real `contentinfo` landmark.
  - Tags became lists.
  - The decorative "Y └── X" axis glyph was removed.
  - The scene label "Continuous improvement" became "Finished output", since it points at the output tote.

### Three.js scene (`scene.js`)
- **Model:** built from shared unit box/cylinder geometries plus 15 reused materials:
  - a platform with a copper safety-zone marking
  - a conveyor with frame, drums, legs and moving slats
  - an input pallet and parts with caps
  - an inspection gantry with a sweeping scanner head, translucent beam and status lamp, plus a control cabinet
  - an output tote
  - a copper articulated robot
- **Robot motion:** the robot does a real pick-and-place cycle. Keyframes are interpolated in cylindrical coordinates, and two-link IK keeps the wrist level and the fingers square to the parts.
- **Deterministic state:** everything is a pure function of simulated time, so the still frame, pause and rotation are consistent. Parts gain a teal marker after passing the gantry, and the gantry lamp brightens while a part is under it.
- **Camera and fit:** an orthographic camera at 30° elevation. The fit uses the box corners of every mesh, sampled across a full robot cycle, plus the label anchors. The full machine therefore stays in frame at every aspect ratio and through each 90° "Rotate view" step.
- **Labels:** HTML labels are projected from 3D anchors on each fit and clamped inside the viewport.
- **Rendering:**
  - DPR capped at 1.75, `powerPreference: 'low-power'`, a single 1024² PCF soft shadow map, no post-processing.
  - The loop runs only while the scene is on screen, the tab is visible, and the animation is playing or a rotation is tweening. Time deltas are clamped, so resuming doesn't jump.
- **Reduced motion:** renders a still frame. The play button lets the visitor opt in, and preference changes are handled live.
- **Failure handling:**
  - Context loss shows the SVG; restore brings the scene back.
  - A `ResizeObserver` handles resize and orientation changes.
  - `dispose()` releases observers, listeners, geometries, materials and the renderer.
  - The canvas fades in only after the first frame has rendered.

### Fallback (`assets/production-line.svg`, 105 KB)
- **Source:** generated by `scripts/build-fallback.mjs` from the same `buildModel()` at the same camera angle. It does painter-sorted flat-shaded faces, light-projected shadow hulls clipped to the deck, and baked labels.
- **Regenerate** after changing the scene with `node scripts/build-fallback.mjs`.

### `app.js`
- **Loader:** runs for five seconds on first entry within a session, including its fade. “Skip intro,” keyboard access, reduced motion, a direct section link, browser back/forward, and repeat visits bypass the delay. The inline `<head>` script dismisses it independently if `app.js` fails.
- **Mobile menu:**
  - Disclosure pattern with `aria-expanded` and a dynamic label.
  - Closes on Escape (returning focus to the toggle if focus was inside), on link selection, and on outside click.
  - Resetting across the 860px breakpoint never strands focus in a hidden menu.
- **DMAIC tabs:** a correct tab/tabpanel pattern with roving tabindex, Left/Right (wrapping), Home and End, and no autoplay.
- **Other behaviour:** reading progress (rAF-throttled, passive scroll listener), `aria-current` on the section in view, and one-time diagram reveals.
- **Scene bootstrap:** a dynamic `import('./scene.js')`, so a module or WebGL failure leaves the page fully working.

## Run locally

```sh
cd harshith-portfolio && python3 -m http.server 8000   # http://localhost:8000/
```

## Files

- **Added:**
  - `app.js`
  - `scene.js`
  - `assets/production-line.svg`
  - `scripts/build-fallback.mjs`
  - `IMPLEMENTATION_NOTES.md`
- **Rewritten:** `index.html`, `styles.css`, `README.md`.
- **Untouched:** the vendor Three.js 0.180.0 files and licence, the Manrope font and licence, `favicon.svg`, both PDFs, `CLAUDE_HANDOFF.md`, and everything in the parent repository.

## Testing

The final refinement was checked in Chromium on Linux with SwiftShader WebGL. **22/22 browser checks passed**, including:

- The intro stays visible for five seconds including its fade; Skip intro returns focus to the page.
- The entry animation completes and the Three.js production scene renders.
- Sora and Manrope load locally; no runtime errors or failed asset requests.
- Global and scene pause controls pause/resume the SVG routes and 3D scene; live reduced-motion changes pause both routes.
- No horizontal overflow at 320, 375, 390, 768, 1024, 1440, 1920, or 844×390 landscape.
- Mobile navigation opens, and Escape closes it and returns focus to its toggle.
- Reduced-motion and direct project links bypass the intro; mobile navigation and main content work with JavaScript disabled.

Rendered review screenshots: `/tmp/hg-loader-desktop.png`, `/tmp/hg-desktop-final.png`, and `/tmp/hg-mobile-final.png`. `node --check app.js` and `node --check scene.js` also pass. Earlier Claude checks cover its original implementation; they predate the five-second intro and Sora font.

## Limitations and open items

- **Browser coverage:** only Chromium and Firefox on Linux were tested. Safari/WebKit was not available, so iOS Safari is untested.
- **GPU coverage:** WebGL ran on SwiftShader (software). Frame rate on real low-end phones wasn't measured. The loop stops offscreen and while paused, but it does run continuously while visible and playing.
- **Browser coverage:** the final refinement has been inspected in Chromium on Linux; the screenshots and responsive checks do not replace real iOS Safari and low-end-device testing.
- **Screenshot artifact:** full-page screenshots taller than about 8,000px may repeat sections in Chromium on this machine; the page was also checked at individual responsive viewports.
- **Fallback fonts:** the fallback SVG labels use system fonts, because an `<img>` SVG can't load the page's Manrope.
- **Untracked folders:** `scripts/` and `IMPLEMENTATION_NOTES.md` are maintenance-only files and aren't needed when deploying. The parent repo's existing modifications (`../index.html`, `../styles.css`, a deleted `profile.jpg`, and the `portfolio/` folder) were left untouched.
- **Not done:** nothing was committed, pushed or deployed.
