# Photo-free Chapter 1 Implementation Plan

> **For agentic workers:** Execute natively in this session under the user's instruction to finish and update GitHub. Keep progress in `.planning/2026-11-24-photo-free-reader-release/`.

**Goal:** Deliver all three corrected parts as a functional reader with illustration slots and publish a reviewable feature branch.

**Architecture:** `server/content.mjs` maps approved `storyboard.json` slides into existing engine scenes. Public views render placeholders for absent art. Static Pages uses the same engine functions to keep navigation and progress consistent.

**Tech Stack:** Node.js 20+ ES modules, vanilla HTML/CSS/JS, node:test. No dependencies added.

**Spec:** `AGENTS.md`, current user request, `production/chapter01/script.md`, author clarifications.

## Global Constraints

- Preserve Telegram HMAC authentication, stored progress and separate 15 XTR map entitlement.
- No public photos, fabricated dialogue or real payment activation.
- No main merge/deployment before review.

## Review Focus

- Traverse all three parts and rewind beyond 30 scenes.
- Resume/restart and recover obsolete saved progress.
- Absent covers and scene art never generate broken image requests.
- Exact source text and corrected chronology remain intact.
- Free static build excludes private assets, paid map and real checkout.

### Task 1: Integrate corrected reader

**Files:** `server/content.mjs`, `public/app.js`, `public/styles.css`, `server/engine.mjs`, `tools/build-demo.mjs`, `tests/engine.test.mjs`, `tests/ui-assets.test.mjs`, `tests/content.test.mjs`.

- [x] Add content traversal and no-photo regression cases; run focused tests and observe failures.
- [x] Map 41 slides with stable IDs, labels, empty artwork and last scene of each part marked part_end.
- [x] Render reusable CSS placeholders and meaningful chapter progress in journal.
- [x] Reuse engine functions in static build; verify traversal, back, reset and saved progress.
- [x] Run npm test and npm run build:pages; inspect mobile/desktop UI and local HTTP API.

### Task 2: Publish reviewed changes

**Files:** `README.md`, `AGENTS.md`, production status docs, generated `docs/index.html`, existing intended working-tree changes.

- [x] Update current status and explain illustration/film plans.
- [x] Check git diff --check, staged files, public assets and secret patterns.
- [x] Commit source/reset and release changes in understandable commits; reconcile origin/main without restoring obsolete content.
- [ ] Push feature branch, verify remote SHA and open reviewable PR; leave main unchanged.
