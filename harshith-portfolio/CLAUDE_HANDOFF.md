# Claude Opus implementation brief

You are taking over an unfinished redesign of Harshith Netha Gundeti’s industrial engineering portfolio. Act as a senior frontend designer and engineer. Complete the actual website, inspect it in a browser, and fix issues before handing it back for review. Do not stop at a proposal or a mockup.

## Workspace and source of truth

Work only in `/home/netha/test/harshith_resume/harshith-portfolio`.

Read `Harshith_Gundeti_Resume_Industrial Engineer.pdf` first. It is the authoritative source for all professional facts. You can extract its contents with `pdftotext -layout`.

The parent repository contains other modified files and projects. Preserve them; do not reset, clean, or overwrite unrelated changes. Check applicable AGENTS.md instructions before editing. Do not publish or deploy as part of this handoff.

## What the user asked for

Comprehensively enhance the entire website so it looks polished, professional, distinctive, and impressive. Use a coherent professional color palette. Make every section work well on phones, tablets, laptops, and large displays. Add a thoughtful loading animation and purposeful motion connected to industrial engineering and the resume. Research and apply reputable frontend design skills. The user explicitly requested Three.js and referred to https://threejs.org/.

Use judgment and proceed autonomously. Ask only if genuinely missing information blocks completion. The resume supplies the necessary content.

## Current implementation state — incomplete and unverified

Another agent has already written a new `index.html` and `styles.css`. Treat them as a design starting point, not a finished implementation. Keep and improve the useful work; revise anything that does not stand up to browser inspection.

Already present:

- Semantic page sections: hero, proof strip, about, experience, academic projects, DMAIC interaction, expertise, education/certifications, contact/footer.
- Navy, white/cool gray, copper, and muted teal styling, including responsive breakpoints.
- Local Manrope variable font: `assets/fonts/manrope-latin.woff2`, with its license.
- Pinned Three.js 0.180.0 ES modules: `assets/vendor/three.module.min.js` and `three.core.min.js`, with the MIT license. The module imports the matching core file; keep their versions consistent.
- `assets/favicon.svg`.
- `resume.pdf`, now an exact copy of the user’s supplied current resume.
- A brief loader scaffold with an inline 2.4-second fail-open timeout.

Missing or unfinished:

- `app.js` is referenced by HTML but DOES NOT EXIST. Implement navigation, DMAIC tabs, scene initialization, loading lifecycle, and the other required interactions.
- The Three.js scene module DOES NOT EXIST. Build the actual scene.
- `assets/production-line.svg` is referenced by HTML but DOES NOT EXIST. Create the static fallback.
- The mobile navigation relies on the missing JavaScript.
- The rotate/pause scene buttons and DMAIC tabs do not work yet.
- `README.md` describes the OLD website and contains outdated placeholder instructions. Replace it with accurate setup and maintenance information.
- No browser, accessibility, responsive, or runtime verification has been performed.
- The original pre-redesign HTML was backed up to `/tmp/harshith-portfolio-original.html` if useful. Do not restore its outdated resume content.

## Creative direction

Design for hiring managers reviewing an early-career industrial engineer with manufacturing experience. The website should convey precision, clear thinking, quality, and practical execution.

Visual idea: a refined engineering studio portfolio, with one memorable manufacturing scene and calm, highly legible supporting sections.

Starting palette:

- Deep navy `#142b3d`: typography, primary controls, DMAIC section.
- Cool paper `#f6f7f9`: primary background.
- White `#ffffff`: selected surfaces.
- Copper `#a95532`: restrained accents on light backgrounds.
- Light copper `#d99570`: accents on dark backgrounds.
- Muted teal `#386e6a`: quality/inspection indicators.

Use the locally bundled Manrope with an intentional type scale, generous spacing, and strong hierarchy. Make body text comfortably readable; some existing small captions may need enlargement. Check contrast instead of assuming these tokens guarantee it.

Hero headline currently reads “Better processes. Stronger outcomes.” Supporting text introduces the person by full name and connects engineering to manufacturing improvement. Preserve that clarity, or improve it with equally specific writing.

Avoid generic tech particles, floating unrelated shapes, spinning globes, neon effects, excessive glassmorphism, distracting cursor effects, and animation on every paragraph. This is an industrial engineer’s professional portfolio, not a software agency landing page.

## Three.js centerpiece — required

Create a custom isometric miniature manufacturing/inspection line in the existing hero scene container. Use real Three.js geometry, lighting, and animation, not a video or an image pretending to be WebGL.

Suggested composition:

- A grounded assembly platform with a conveyor and believable rollers/supports.
- Components moving along the conveyor at a controlled pace.
- A copper-colored articulated industrial robot or handling mechanism.
- A quality-inspection gantry with a subtle scanning action.
- Restrained navy/steel machinery, copper accents, and teal inspection feedback.
- Soft lighting and subtle shadows that fit the light page background.

It is a conceptual illustration of the domain, not a claim that Harshith built a digital twin or worked with a particular robot. Keep the “illustrative production system” caption. Do not fabricate live factory metrics or imply the scene is connected to real production data.

Use an orthographic camera and fit the full composition at every breakpoint. Avoid cropping important machinery or overlapping labels with the model. Connect the existing rotate-view and pause/resume buttons. Keyboard users must be able to operate both. Pointer-based tilt is optional; never hijack page scrolling or require dragging.

Performance and resilience:

- Cap device pixel ratio, use economical geometry, reuse materials, and avoid expensive postprocessing.
- Stop the animation loop when the scene is offscreen, the tab is hidden, or the user pauses it. Resume appropriately.
- Respect `prefers-reduced-motion` at startup and when it changes. Render a still composition by default for reduced-motion users. Never hide content because animation is disabled.
- Show a polished SVG fallback when WebGL is unavailable, context creation fails, a module fails to load, or JavaScript is disabled. A local-file visit may use the fallback; document the HTTP preview command for full WebGL functionality.
- Handle resize/orientation changes and WebGL context loss without leaving a blank panel.
- Render the first frame before removing the fallback. Clean up observers, listeners, geometries, materials, and renderer when appropriate.
- Keep core content immediately accessible; loading the scene must not gate access to the resume or contact information.

Consult the official Three.js documentation for the version/API you use. The existing pinned version is intentional and usable; upgrading is not a goal in itself.

## Animation and interactions

1. A short conveyor-inspired loading treatment: component blocks move along a small line. End it when meaningful initialization completes, with a hard timeout and failure fallback. No fake percentage, unnecessary artificial delay, or inaccessible overlay that traps focus.
2. A restrained hero entrance coordinated with the loader, so it is not already finished behind the loader.
3. Project illustrations: a station-time/bottleneck diagram and an experimental-design cube. They may draw or build once on entering the viewport. Clearly label them illustrative; numerical values must not be presented as measured project results.
4. Native expandable project details that work with keyboard and without JavaScript. Include useful challenge, approach, and takeaway text without inventing results.
5. Clickable DMAIC tabs with real phase-specific content. Implement correct tab/tabpanel relationships, selected state, roving focus, and Arrow Left/Right, Home, and End keys. Do not autoplay them.
6. Mobile navigation: working expanded state, usable touch targets, Escape to close, close after selecting a destination, and sensible focus behavior. Ensure desktop/mobile resizing does not strand focus or hide navigation unexpectedly.
7. Optional subtle reading progress and current-section navigation. Keep scrolling native; do not hijack it.
8. Every continuous decorative animation must have a pause mechanism and respect reduced motion.

## Resume facts to preserve

- Name: Harshith Netha Gundeti.
- Focus: Industrial Engineering; process improvement, quality, manufacturing analytics.
- Location: Springfield, Massachusetts.
- Email: harshithnetha02@gmail.com.
- Phone: +1 (413) 288-0548.
- LinkedIn: https://www.linkedin.com/in/harshith-g-b08a9a263.
- Process & Quality Intern, Steller Plastics Pvt. Ltd., Chennai, Sep 2022–Jul 2023. Critical process parameters and corrective actions reduced rejection by 8%. Work also included CAPA, Kaizen/5S, SPC and Cp/Cpk in Minitab, SOPs, and production/quality coordination.
- Student Intern – Product Design, BOLT IoT Pvt. Ltd., Hyderabad, May–Jul 2019. SolidWorks/AutoCAD component design, prototype testing, and vendor cost/quality/lead-time comparisons.
- Academic project: Line Balancing & Time Study. Lego-car assembly line, build sequence, bottleneck identification, slack time, workload balancing.
- Academic project: Battery Production Optimization through full-factorial DOE in Minitab. Factors: temperature, charge time, material type. ANOVA to understand effects on charge retention.
- M.S. Industrial Engineering, Western New England University, Aug 2023–May 2025.
- B.Tech Mechanical Engineering, Vignana Bharathi Institute of Technology, Aug 2017–Jul 2021.
- Skills and certifications must match the PDF. Six Sigma Green Belt is listed; do not invent an issuing organization or claim ASQ certification. Training includes OSHA General Industry, Project Management Foundations, and Excel Essential Training through LinkedIn Learning and other platforms.

Do not add fabricated clients, years of experience, placement/availability claims, metrics, endorsements, certifications, project links, GitHub links, or the electric-bike project from the old site.

## Skills and implementation approach

The earlier agent read these reputable skills; read their current instructions and apply the relevant guidance yourself:

- Anthropic frontend-design: https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md
- Vercel web-design-guidelines: https://github.com/vercel-labs/agent-skills/blob/main/skills/web-design-guidelines/SKILL.md
- Underlying interface checklist: https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md

The project is buildless HTML/CSS/JavaScript. Continue with that unless a demonstrated requirement justifies changing it. A framework migration is not necessary. Keep runtime dependencies and fonts local, preserve their licenses, and avoid requiring API keys or external services.

## Required validation

Serve the site locally and inspect actual browser screenshots. Do not declare it finished based on code inspection alone.

Check representative viewports at 320, 375, 390, 768, 1024, 1440, and 1920 pixels, including mobile landscape. Ensure:

- No horizontal overflow, clipped headings, overlapping elements, cropped scene, unreadable labels, or broken mobile navigation.
- Good spacing, comfortable reading sizes, appropriate line lengths, and touch targets around 44×44 px where practical.
- Keyboard navigation, focus visibility, skip link, tab controls, project expanders, and sticky-header anchor offsets work.
- Reduced motion, JavaScript disabled, WebGL unavailable, and failed scene loading all preserve useful content and navigation.
- The loader exits on success and failure, and never hides the page indefinitely.
- Three.js animation can pause/resume, stops offscreen, and does not burn CPU while idle.
- The contact links are correct and `resume.pdf` downloads the current supplied PDF.
- No missing assets, console exceptions, or failed local network requests.
- Run an automated accessibility audit if available and resolve actionable findings, especially contrast and accessible names.
- Check Chromium and another browser engine if available; report what you actually tested.

A local Playwright installation was found at `/home/netha/.npm/_npx/9833c18b2d85bc59/node_modules/playwright`. Browser executables are available at `/usr/bin/chromium` and `/opt/google/chrome/chrome`. These paths are environment-specific; verify availability before using them.

## Completion handoff for independent review

Finish all implementation and verification in the workspace. Update README with an accurate preview command, file structure, dependency versions, and fallback behavior. Leave concise review notes in `IMPLEMENTATION_NOTES.md` containing:

- What changed and the important design decisions.
- How to run the site locally.
- Files added or changed.
- Test commands, viewport/browser coverage, and results.
- Screenshot locations, if captured.
- Any genuine limitations or outstanding issues; do not claim unperformed tests passed.

Do not deploy, commit, or push unless separately requested. Another agent will review the completed website and implementation. Deliver working files, not just instructions for somebody else to build them.
