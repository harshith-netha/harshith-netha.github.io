# Harshith Netha Gundeti — Portfolio

A single-page portfolio for an industrial engineer. Plain HTML, CSS and JavaScript: no build step, no package install, no external services. Fonts and Three.js are bundled locally.

All professional facts come from `Harshith_Gundeti_Resume_Industrial Engineer.pdf`. The project diagrams are labelled as illustrative and include no invented project measurements. `resume.pdf` is the download copy of the supplied resume.

## Engineering review workflow

The homepage leads with the project evidence. Filter between all work, detailed simulated studies, and academic projects. The detailed studies expose source data and analysis; the academic diagrams remain illustrative.

Both case studies have a sticky contents bar, current-section indication, keyboard focus transfer, and reading progress. Charts load immediately so evidence is also available for full-page review and printing.

The OEE dashboard supports line, machine, and shift filters, machine drill-down, reset, **Export weekly CSV**, and **Copy filtered link**. Shared URLs restore validated filter values; an invalid value falls back to the unfiltered scope. CSV exports contain 13 weekly aggregates for the selected filters and explicitly identify the data as simulated. A localhost link works on the machine running the preview; deployed links use the deployed origin automatically.

`PRODUCT.md` records the confirmed audience and product constraints. `DESIGN.md` records the implemented design system. `.impeccable/config.json` stores the confirmed code-first workflow.

## Visual design

The portfolio and case studies share an ivory, deep navy, copper, and muted green palette. Sora headings and Manrope body text are bundled locally. A dark opening section highlights the engineering focus; numbered sections, concise project descriptions, and consistent cards guide visitors through the work.

Layouts adapt from small phones to wide desktops. Motion respects the visitor’s preference, dashboard heatmap labels choose a contrasting foreground, and wide case-study tables support keyboard scrolling.

## Preview locally

ES modules (and so the WebGL scene) need an HTTP origin. From this folder:

```sh
python3 -m http.server 8000
# then open http://localhost:8000/
```

Opening `index.html` straight from disk (`file://`) still works. Navigation, tabs and project details all function, but the browser blocks the module import, so the hero shows the static SVG illustration instead of the live scene.

## Files

| Path | Purpose |
| --- | --- |
| `index.html` | All content and markup |
| `styles.css` | Design tokens, layout, responsive rules, motion (all gated by `prefers-reduced-motion`) |
| `app.js` | Project filters, mobile menu, reading progress, current-section nav, DMAIC tabs, hero scene bootstrap |
| `projects/case-study.js` | Case-study reading progress, current-section navigation, keyboard focus |
| `scene.js` | Three.js production cell (robot, conveyor, inspection gantry, tote): `buildModel()` + `createScene()` |
| `assets/production-line.svg` | Static fallback for the scene, generated from `scene.js` |
| `scripts/build-fallback.mjs` | Regenerates the SVG fallback: `node scripts/build-fallback.mjs` |
| `assets/vendor/three.module.min.js`, `three.core.min.js` | Three.js r180 (0.180.0), MIT, see `THREE-LICENSE.txt` |
| `assets/fonts/manrope-latin.woff2` | Manrope variable font (400–800), OFL, see `MANROPE-LICENSE.txt` |
| `assets/fonts/sora-latin.woff2` | Sora variable font (400–800), OFL, see `SORA-LICENSE.txt` |
| `assets/favicon.svg` | Favicon |
| `resume.pdf` | Downloadable resume |
| `projects/defect-reduction.html` | Case study 01: defect reduction, SPC, MSA, control plan (simulated data) |
| `projects/oee-dashboard.html`, `oee-dashboard.js`, `oee-data.js` | Case study 02: OEE data model and interactive dashboard (simulated data) |
| `projects/charts/*.svg`, `data/**`, `oee-data.js` | Generated: `.venv/bin/python analysis/build_case_studies.py` (needs numpy, pandas, matplotlib, statsmodels) |
| `analysis/oee_measures.dax`, `analysis/oee_by_machine.sql` | Power BI measures; SQL version, checked against the model by the build script |
| `PORTFOLIO_NEXT_STEPS.md` | What still needs real data from Harshith, and how to build the `.pbix` |

The two Three.js files must stay on the same version: `three.module.min.js` imports `./three.core.min.js`.

## How the hero scene degrades

- **Loading:** a five-second, one-time-per-session conveyor-and-inspection intro leads into the page entrance. It can be skipped, and is bypassed for reduced-motion preferences, direct section links, and browser back/forward.
- **Accessibility:** keyboard navigation can skip the intro automatically; the visible Skip intro button returns focus to the main content.
- **Background:** subtle process-flow paths move behind the hero and contact section only. A header motion control pauses or resumes both these paths and the Three.js scene; each backdrop stops offscreen.
- **Fallback cases:** JavaScript disabled, module blocked or failed, WebGL unavailable, or context creation failed. In all of these the SVG stays and the rotate/pause controls stay hidden.
- **Context loss:** the SVG reappears, and the scene returns when the context is restored.
- **Animation loop:** it runs only while the scene is on screen, the tab is visible, and the animation is playing. Pause/play and rotate-view are keyboard-operable buttons.
- **Reduced motion:** `prefers-reduced-motion: reduce` renders a still frame, and the visitor can press play. Preference changes are handled live.
- **Loader fallback:** an inline deadline dismisses the loader after five seconds if the external application script fails. A reduced-motion preference skips the intro entirely.

The five-second introduction is an intentional portfolio presentation choice. The main content, links, resume, and scene fallback stay available if JavaScript, fonts, Three.js, or WebGL fail.

## Editing content

- Text lives in `index.html`. Keep claims aligned with the resume PDF.
- Project charts are schematic and labelled "Illustrative". Don't put numbers on them unless they come from the actual projects.
- **New nav section:** add a `<section id="...">` directly inside `<main>` and a matching `#site-nav` link. The current-section highlight picks it up automatically.
- **Scene changes:** after editing `scene.js`, run `node scripts/build-fallback.mjs` so the fallback matches.
- **New resume:** replace both PDFs, then re-check the page text against it.

## Deploying

Upload the folder to any static host (Netlify Drop, GitHub Pages, etc.). `CLAUDE_HANDOFF.md`, `IMPLEMENTATION_NOTES.md`, `scripts/` and the source resume PDF aren't needed at runtime, so you can leave them out of the upload.
