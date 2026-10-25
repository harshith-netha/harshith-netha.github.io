---
name: Harshith Gundeti Portfolio
description: A restrained engineering portfolio with readable technical evidence and an interactive production cell.
colors:
  paper: "#faf8f4"
  white: "#ffffff"
  mist: "#eeefea"
  navy: "#182e38"
  navy-deep: "#11252e"
  ink: "#30434a"
  muted: "#59666a"
  line: "#dedfd8"
  line-strong: "#bec6c3"
  copper: "#9b4e2e"
  copper-light: "#edb58e"
  teal: "#2b6556"
  on-dark-muted: "#bac8cc"
  line-dark: "#3c525c"
  technical-surface: "#eef1f3"
  dashboard-surface: "#e8ede8"
typography:
  display:
    fontFamily: "Sora, Manrope, 'Segoe UI', Roboto, Arial, sans-serif"
    fontSize: "clamp(2.25rem, 4.5vw, 4.75rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-.035em"
  headline:
    fontFamily: "Sora, Manrope, 'Segoe UI', Roboto, Arial, sans-serif"
    fontSize: "clamp(2rem, 1.35rem + 2.1vw, 3.25rem)"
    fontWeight: 600
    lineHeight: 1.14
    letterSpacing: "-.035em"
  title:
    fontFamily: "Sora, Manrope, 'Segoe UI', Roboto, Arial, sans-serif"
    fontSize: "clamp(1.3125rem, 1.15rem + .5vw, 1.625rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-.025em"
  body:
    fontFamily: "Manrope, 'Segoe UI', Roboto, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
  secondary:
    fontFamily: "Manrope, 'Segoe UI', Roboto, Arial, sans-serif"
    fontSize: ".9375rem"
  label:
    fontFamily: "Manrope, 'Segoe UI', Roboto, Arial, sans-serif"
    fontSize: ".8125rem"
  action:
    fontFamily: "Manrope, 'Segoe UI', Roboto, Arial, sans-serif"
    fontSize: ".9375rem"
    fontWeight: 750
    letterSpacing: "-.01em"
  code:
    fontFamily: "ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace"
    fontSize: ".8125rem"
    fontWeight: 500
    lineHeight: 1.6
rounded:
  focus: "4px"
  control: "6px"
  data: "8px"
  surface: "14px"
  scene: "16px"
  filter: "24px"
  pill: "999px"
  round: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  compact: "12px"
  md: "16px"
  comfortable: "20px"
  lg: "24px"
  row: "28px"
  xl: "32px"
  heading: "36px"
  gutter: "clamp(16px, 5vw, 56px)"
  section: "clamp(64px, 7vw, 112px)"
components:
  button-hero-primary:
    backgroundColor: "{colors.copper-light}"
    textColor: "{colors.navy-deep}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
  button-hero-outline:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
  button-copper:
    backgroundColor: "{colors.copper-light}"
    textColor: "{colors.navy}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
  work-filter:
    backgroundColor: "transparent"
    rounded: "{rounded.filter}"
    padding: "9px 16px"
  work-filter-selected:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.white}"
  dashboard-select:
    backgroundColor: "{colors.white}"
    textColor: "{colors.navy}"
    rounded: "{rounded.control}"
    padding: "8px 12px"
  navigation-link:
    textColor: "{colors.ink}"
    typography: "{typography.secondary}"
  chart:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.surface}"
    padding: "clamp(14px, 2vw, 22px)"
  dashboard-kpi:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.data}"
    padding: "14px"
  dashboard-kpi-primary:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.copper-light}"
    rounded: "{rounded.data}"
    padding: "14px"
  method-tab:
    backgroundColor: "transparent"
    rounded: "6px 6px 0 0"
    padding: "8px 4px 16px"
  project-disclosure:
    textColor: "{colors.navy}"
    typography: "{typography.secondary}"
---

# Design System: Harshith Gundeti Portfolio

## Overview

**Creative North Star: "The engineering portfolio"**

This is the existing engineering portfolio world: navy and ivory fields, copper emphasis, muted green data, and a light production-cell stage. Sora supplies measured headings; Manrope carries the reading and controls. The visual character is precise, calm, and direct.

The implemented system uses open rows and dividers for narrative material, with contained surfaces for technical graphics and operational controls. Documents stay readable at length, while data retains labels, provenance, and a clear path to its supporting files. This record describes the final cascade in `styles.css` and the three implemented HTML pages; it does not promote earlier overridden declarations into new rules.

**Key Characteristics:**
- Navy and ivory tonal sections with restrained copper and teal accents.
- Sora headings and Manrope text, with tabular numbers for comparisons.
- Open evidence rows beside contained charts, data tables, and dashboard controls.
- Visible keyboard focus, responsive reading layouts, and user-controlled motion.

## Colors

A warm paper background and deep navy sections carry copper emphasis and muted green engineering data. Frontmatter values are normative; the descriptive roles below explain their application.

### Primary
- **Engineering Navy** (`navy`): headings, selected controls, primary dashboard KPI, and the DMAIC section.
- **Deep Navy** (`navy-deep`): opening sections, contact area, footer, and code blocks.

### Secondary
- **Copper** (`copper`): light-surface actions, focus outlines, chart targets, and concise emphasis.
- **Light Copper** (`copper-light`): dark-surface actions, highlighted KPI values, and selected DMAIC tabs.

### Tertiary
- **Muted Teal** (`teal`): quality information, data series, status, and evidence notes. Do not rely on hue alone to explain data.

### Neutral
- **Ivory Paper** (`paper`) and **White** (`white`): page canvas and technical surfaces; ivory also supplies text on dark fields.
- **Mist** (`mist`): quieter background sections.
- **Ink** (`ink`) and **Muted Ink** (`muted`): primary reading text and secondary copy.
- **Light Reading Ink** (`on-dark-muted`): secondary text on navy.
- **Fine Line** (`line`), **Strong Line** (`line-strong`), and **Dark Line** (`line-dark`): dividers appropriate to their backgrounds.
- **Technical Surface** (`technical-surface`): project graphic stages. **Dashboard Surface** (`dashboard-surface`): the dashboard surround.

**The Contextual Copper Rule.** Use dark copper on light surfaces and light copper on navy surfaces; keep the accent connected to actions, targets, or meaningful emphasis.

## Typography

**Display Font:** locally hosted Sora, with Manrope and sans-serif fallbacks.
**Body Font:** locally hosted Manrope, with Segoe UI, Roboto, Arial, and sans-serif fallbacks.
**Code Font:** the system monospace stack, limited to actual code and schema content.

The pairing combines compact, balanced headings with open reading text. Heading tracking is slightly tight; body and practical labels use normal tracking. Type sizes in the frontmatter are the shared desktop roles, not a mandate to make all headings the same size.

### Hierarchy
- **Display:** the homepage opening uses the display token. Case-study titles use `clamp(2.25rem, 1.3rem + 2.6vw, 3.75rem)` with a more relaxed line height (1.16).
- **Headline:** section titles use the headline token; case-study section titles use `clamp(1.5rem, 2vw, 2rem)` to fit the reading rail.
- **Title:** shared subheadings use the title token. Featured project headings use `clamp(1.5rem, 2.2vw, 2rem)` and line height (1.25); academic project titles use (1.5rem).
- **Body:** regular text uses the body token; phone body text is (1rem). Project summaries also use (1rem). Case-study prose is limited to (72ch), with introductory and about copy generally at (65ch).
- **Secondary and Label:** navigation and controls use the secondary scale, while data captions and metadata use the label scale. Their weights vary with function; there is no universal uppercase label style.
- **Numbers and code:** use tabular figures for KPI comparisons, data tables, and code. The dashboard's primary values remain larger and heavier than supporting labels.

**The Reading Before Ornament Rule.** Headings establish hierarchy directly. Provenance follows the project heading, while metadata remains subordinate to the technical content.

## Layout

The centered container has a maximum width (1320px) and the fluid gutter token on both sides. The final shared rule applies at all viewport sizes, including large displays. Sections use the fluid section token; nearby controls typically use the compact spacing steps rather than extra wrappers.

On desktop the opening is a two-column grid (1.05fr / 1fr) with a gap (5%). At (960px) it remains two columns (1fr / .85fr), then stacks at (640px) with vertical padding (32px) and gap (28px). The light production-cell stage has padding (22px), reducing to (16px) at (960px); its viewport aspect ratio is (1.3), then (1.65) on phones.

Featured projects are full-width rows with a visual and text column. The second row reverses the visual on screens above (960px). The rows stack at (960px); academic work remains a two-column grid until (640px). Technical visuals keep their rounded frames while the surrounding project narrative stays open. Expertise uses two divider-led columns, reducing to one on phones.

Case studies use a left section-heading rail (160–220px) and a reading body with gap (6%), narrowing to a (160px) rail and (28px) gap at (1100px). The rail stacks at (960px). On desktop headings stick beneath the site header and section navigation. The body normally stops at (900px), except the dashboard, which can fill its available column. Tables and code scroll horizontally inside their own boundaries.

The header is (72px), reducing to (64px) when the homepage navigation becomes a disclosure menu at (860px). Case-study section navigation remains a horizontally scrollable sticky strip. Dashboard charts stack at (960px), KPI tiles use two columns on phones, and filters wrap with full-width select controls. Additional narrow breakpoints at (480px), (420px), and (380px) adjust individual components rather than defining a new layout system.

## Elevation & Depth

Depth comes primarily from alternating navy, ivory, mist, and technical surfaces, supported by thin divider lines. Project rows and the production stage are flat. Small ambient shadows remain for the mobile menu, dashboard tooltip, and primary-action hover; these are local affordances, not a general card treatment. The translucent sticky header retains a blurred backdrop.

### Shadow Vocabulary
- **Action hover** (`0 8px 20px #102a4324`): the existing primary action hover.
- **Mobile navigation** (`0 18px 30px #102a4314`): separation beneath the expanded menu.
- **Dashboard tooltip** (`0 8px 20px #102a4333`): a transient data readout above charts.

**The Flat Technical Surfaces Rule.** Use color fields and thin borders for structural depth. The production stage and project rows have no resting shadow.

## Shapes

Controls have gently rounded corners using the control radius. Tables, dashboard tiles, and callouts use the data radius; charts and project graphic frames use the surface radius. The production stage is slightly rounder. Filter buttons and status tags are pills; pause and reset controls are circular. Narrative rows use straight divider lines without a surrounding rounded card.

Most dividers and surfaces have a uniform stroke (1px). Buttons and selected structural boundaries sometimes use (1.5px). The DMAIC practice callout has a uniform border (1px) and asymmetric corner radius (`0 6px 6px 0`); its left edge is not an accent stripe. Technical diagrams may use dashed target lines and their own data-driven geometry.

## Components

### Buttons

Compact, deliberate actions with enough space for labels and inline SVGs. Standard actions use the frontmatter padding and control radius with minimum height (52px), reducing to (48px) for homepage actions on phones. The hero primary uses light copper on navy; its hover changes to `#f6cbaa`. The hero outline is transparent with a muted border (`#6a7c83`), brightening on hover. The contact action uses light copper with navy text and hover background `#e6b18b`.

Visible focus uses a copper outline (3px) and offset (4px); dark sections switch to light copper. Hover does not translate buttons. State transitions are generally (.2s), and reduced-motion mode removes transitions and animations.

### Chips

Project filters are interactive pills with minimum height (44px). Selection uses navy fill and white text with `aria-pressed`; hover strengthens the border. Role tags are passive green-tinted pills. Project method labels are plain inline text separated by spacing, while experience and certification tags retain small lightly bordered shapes. Do not make all metadata look like interactive filters.

### Cards / Containers

Chart frames use white fill, a fine border, the surface radius, and fluid padding. Dashboard chart cards and KPI tiles use the smaller data radius; the first KPI reverses to navy with light-copper values. Project visuals are enclosed, but project bodies and expertise entries use open rows. Provenance sits below each project heading, with evidence notes next to the related methods and action.

### Inputs / Fields

The implemented field is a native select: white fill, navy text, strong-line border (1px), control radius, minimum height (44px), and minimum width (150px) before responsive layout. A visible label sits above it. It inherits the shared visible-focus treatment. There are no custom text-input, validation-error, or disabled-field designs to standardize.

### Navigation

The sticky header uses ivory with a subtle transparent treatment and blur. Links have minimum height (44px); copper identifies hover and the current location. Homepage current links add a short underline, replaced by an inset left marker in the mobile disclosure. Case navigation has a compact filled contact action, whose hover changes to teal. The sticky case-study table of contents uses text links without decorative numbering; the current section has navy fill and white text.

### Production Cell and Motion Controls

A light, flat stage frames the interactive production object with restrained labels and a caption. Inline SVG controls use circular white buttons (44px), visible focus, and hover border changes. The site-wide pause control and scene controls preserve accessible names. Keep the existing fallback available when the enhanced scene cannot run. The confirmed five-second first-visit introduction remains skippable and bypassed for reduced motion, keyboard use, and deep links as implemented; it is not a template for delaying other content.

### DMAIC Tabs

Five equal tabs use Sora initials and Manrope names on navy. The selected tab uses light copper and a short underline; hover brightens text. Focus is drawn inside the tab with light copper. Panel changes are user-controlled, with a short entrance animation only when motion is allowed. Practice notes use the uniform bordered treatment described in Shapes, and panels have no decorative phase number.

### Project Disclosures

Native details and summary reveal academic project depth. The summary is a strong text row with minimum height (56px), a top divider, and a circular CSS plus/minus indicator. Hover changes text to copper; keyboard focus uses the shared outline. The open panel adds reading space without turning into a second card.

## Do's and Don'ts

### Do:
- Do keep project provenance immediately after its heading and distinguish simulated data from professional achievements.
- Do retain the real SVG data graphics and the production-cell fallback with their existing provenance.
- Do use open rows for project and expertise narratives; reserve enclosed surfaces for charts, data, and controls.
- Do pair chart color with labels, values, and target markers.
- Do preserve visible focus, keyboard behavior, reduced motion, and the skippable first-visit introduction.

### Don't:
- Don't restore decorative phase numbers or heading eyebrows as a reusable pattern.
- Don't inherit obsolete shadows, numbered case-navigation markers, or boxed project-card rules from earlier CSS declarations.
- Don't use font glyphs as standalone decorative icons; use the existing inline SVG language.
- Don't present illustrative or simulated graphics as measured employment results.
