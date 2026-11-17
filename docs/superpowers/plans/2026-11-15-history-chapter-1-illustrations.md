# HIStory Chapter 1 Illustration Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Chapter 1 Part 1 with the supplied 10-scene documentary sequence and redesign the reader so artwork, copy, map access, and controls remain clear and functional on Telegram mobile.

**Architecture:** Keep the existing vanilla HTML/CSS/JS client and server-driven story graph. Add explicit scene-to-asset keys, retain the reader choice as a documented attention choice whose branches converge, keep the route map behind `/api/map`, and let the demo builder inline the private WebP. The reader becomes a scrollable media-first document with artwork above a separate text/action sheet and an accessible map dialog.

**Tech Stack:** Node.js 20+, ES modules, vanilla HTML/CSS/JS, Node test runner, Telegram WebApp API.

**Spec:** `docs/specs/2026-11-15-chapter-1-visual-integration.md`

## Global Constraints

- Change only Chapter 1 Part 1 narrative structure; keep Parts 2–3 and existing data contracts.
- Preserve local development, Telegram Mini App, Telegram Stars map entitlement, and GitHub Pages demo.
- Keep the supplied WebP filenames stable; do not add runtime dependencies or remote fonts.
- Do not invent dates, transport, names, dialogue, submarine identifiers, or additional events.
- Keep all scene copy and controls in DOM blocks below artwork; the route map must use `object-fit: contain`.
- Respect `prefers-reduced-motion` and 44px minimum touch targets.
- Do not commit from the shared dirty worktree; isolate the final diff by path and report unrelated existing changes.

## Review Focus

- Existing saved progress may point to an old Part 1 branch node: storage fallback must remain safe and tests must exercise the current start/transition graph.
- Both `route` and `mood` choices must record the chosen detail but converge on scene 05 without skipping any later scene.
- The protected WebP must be served with `image/webp` and must not appear under `public/assets/`.
- The self-contained Pages build must replace every `/assets/` and `/api/map` reference with embedded data.
- On short 390×844 viewports, the document must scroll without trapping the text panel or cropping the route map.

---

### Task 1: Assets, documentary sequence, and graph tests

**Files:**
- Create: `public/assets/chapter-1/01_minsk_draft_office.webp`
- Create: `public/assets/chapter-1/02_three_years_in_navy.webp`
- Create: `public/assets/chapter-1/03_evening_train_departure.webp`
- Create: `public/assets/chapter-1/04_train_recruits.webp`
- Create: `public/assets/chapter-1/06_arrival_simferopol.webp`
- Create: `public/assets/chapter-1/07_simferopol_first_sleep.webp`
- Create: `public/assets/chapter-1/08_morning_haircut.webp`
- Create: `public/assets/chapter-1/09_naval_uniform.webp`
- Create: `public/assets/chapter-1/10_sevastopol_barracks.webp`
- Create: `private/chapter-1/05_route_map.webp`
- Modify: `server/content.mjs`
- Modify: `server/storage.mjs`
- Modify: `docs/source-story-chapter-1-part-1.md`
- Modify: `tests/engine.test.mjs`
- Modify: `tests/storage.test.mjs`
- Modify: `tests/ui-assets.test.mjs`

**Interfaces:**
- Consumes: current `stories[0]` graph and supplied archive filenames.
- Produces: ten ordered Part 1 scene keys, `sceneCount: 10`, unchanged Part 2 start `c1p2-01`, and existing choice ids `route`/`mood` converging on `c1p1-05`.

- [ ] Add failing tests for the exact ten scene backgrounds/order, convergence of both choices, and unchanged transition to Part 2.
- [ ] Add a failing storage test proving an obsolete removed scene id resets safely to the story start without affecting valid saved progress.
- [ ] Run `node --test tests/engine.test.mjs tests/ui-assets.test.mjs`; expect failures for missing `chapter-1` files and old branch ids.
- [ ] Copy the nine public WebPs and one private map WebP from the archive without renaming.
- [ ] Rewrite only Part 1 in `server/content.mjs` with concise first-person copy and the confirmed sequence.
- [ ] Add a dated clarification section to the documentary source file without deleting the original testimony.
- [ ] Re-run the two targeted test files; expect all graph and asset assertions to pass.

### Task 2: Protected map and autonomous build

**Files:**
- Modify: `server/index.mjs`
- Modify: `tools/build-demo.mjs`
- Modify: `tests/ui-assets.test.mjs`

**Interfaces:**
- Consumes: private `private/chapter-1/05_route_map.webp` and existing `/api/map` entitlement check.
- Produces: `/api/map` response with `image/webp`; the demo builder maps `/api/map` to an embedded WebP data URL.

- [ ] Add assertions that production serves no public `05_route_map.webp`, the server uses the private WebP, and the Pages artifact contains at least ten embedded WebPs with no unresolved local asset URLs.
- [ ] Run `node --test tests/ui-assets.test.mjs`; expect failures while the old SVG path remains.
- [ ] Update `sendProtectedMap()` and the demo builder to read the private WebP and emit the correct MIME type.
- [ ] Run `node --test tests/ui-assets.test.mjs`; expect all protected-map and Pages assertions to pass.

### Task 3: Media-first reader and accessible map enlargement

**Files:**
- Modify: `public/app.js`
- Modify: `public/styles.css`
- Modify: `public/index.html`
- Modify: `tests/ui-assets.test.mjs`

**Interfaces:**
- Consumes: scene `background` keys, protected `art.route`, current `navigate()` dispatcher and Telegram haptics.
- Produces: `sceneMedia(scene, image)` markup, `data-action="zoom-map"`/`close-map`, a native modal dialog, a DOM route legend, and separate artwork/text blocks.

- [ ] Add source-level tests for all 10 asset mappings, separate reader media/panel markup, `object-fit: contain`, dialog actions, route legend, async decoding, and reduced-motion CSS.
- [ ] Run `node --test tests/ui-assets.test.mjs`; expect failures for the old overlay reader.
- [ ] Update `art`, chapter thumbnails, home/chapter imagery, and reader markup while preserving existing API/payment/navigation calls.
- [ ] Implement map open/close behavior with focus-safe native dialog handling and a non-dialog fallback.
- [ ] Replace the overlay layout with a scrollable 390px-first composition: flat navy surfaces, cream paper sheet, red control accent, no copy over images, tactile press feedback, and reduced-motion overrides.
- [ ] Run `node --test tests/ui-assets.test.mjs`; expect the UI contract tests to pass.

### Task 4: Full verification and visual QA

**Files:**
- Modify if needed: `public/app.js`, `public/styles.css`, tests, and planning notes.
- Create: `.taste-skill/after/` screenshots and critique artifacts (untracked verification output).

**Interfaces:**
- Consumes: running `npm run dev`, the final client/server graph, and design direction `true-black-flat` seed `1565156597` adapted to the navy/cream/red brand.
- Produces: passing tests/build, responsive screenshots, interaction checks, and an evidence-backed handoff.

- [ ] Run `npm test`; expect zero failures.
- [ ] Run `npm run build:pages`; expect a self-contained `docs/index.html` with no `/assets/` or `/api/map` references.
- [ ] Run the frontend lint/inspector against the local app at 1440, 768, and 390 widths; fix every applicable `FAIL` or document a justified tool false positive.
- [ ] Walk Part 1 at 390×844 through both choices, map enlargement, back navigation, Part 2 transition, journal, and reduced-motion mode.
- [ ] Open every final screenshot, write the final critique, and fix the three highest-impact visual issues if any remain.
- [ ] Review `git diff --check`, scoped diff, and `git status --short`; confirm unrelated user files are untouched.
