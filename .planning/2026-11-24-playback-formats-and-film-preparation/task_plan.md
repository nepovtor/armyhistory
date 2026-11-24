# Task Plan: Playback formats and film preparation

## Goal
Add free reading and two development-only playback choices, prepare independent Stars purchases without accepting payments, and deliver a usable film production package.

## Next Step
Implement and verify separate format products, disabled UI and payment guards.

## Current Phase
Phase 2

## Phases

### Phase 1: Inspect and define scope
- [x] Inspect current reader, payment and production sources; verify clean baseline.
- [x] Confirm separate audio/video purchases and hidden prices with user.
- **Status:** complete

### Phase 2: Playback choices and billing preparation
- [ ] Add two gray disabled format buttons and simplify home styling/copy.
- [ ] Define separate product IDs, server invoice/checkout/payment validation and entitlement isolation.
- [ ] Keep unavailable media unpurchasable and static Pages payment-free.
- **Status:** in_progress

### Phase 3: Film production package
- [ ] Prepare frame-based shotlist, voice cues, asset register and a 30–60 second acting pilot plan.
- [ ] Document current tools, factual continuity, widescreen composition, audio, QC and blockers.
- [ ] Validate all runtime scene IDs and regenerate package reproducibly.
- **Status:** pending

### Phase 4: Verify and publish
- [ ] Run focused tests, npm test, film checks, Pages build and diff review.
- [ ] Commit/push branch and deliver reviewable results; publish interface update within established Pages scope.
- **Status:** pending

## Decisions Made
| Decision | Reason |
|----------|--------|
| Audio and video purchased separately; no visible prices | Explicit user reply |
| No real media sales during development | User asks disabled development states; no finished media exists |
| Manual UNSLOP pass | No installed UNSLOP skill found; no remote installation |
| Retain existing engine, map SKU and author sources | Preserve working behavior and factual continuity |

## Errors Encountered
| Error | Resolution |
|-------|------------|
| None | Baseline npm test: 25/25 pass |
