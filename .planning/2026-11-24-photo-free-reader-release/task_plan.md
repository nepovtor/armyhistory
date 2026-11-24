# Task Plan: Photo-free Chapter 1 release

## Goal
Publish all intended working-tree changes on a feature branch and provide the corrected three-part reader with illustration placeholders.

## Next Step
Push the verified feature branch and create a pull request for review.

## Current Phase
Phase 5

## Phases

### Phase 1: Requirements & Discovery
- [x] Inspect branch, dirty files, canonical sources and application.
- [x] Preserve existing work in ignored local backup.
- **Status:** complete

### Phase 2: Planning & Structure
- [x] Use storyboard text and existing story engine; keep photos private.
- [x] Preserve authentication, progress and map entitlements.
- **Status:** complete

### Phase 3: Implementation
- [x] Publish 41 factual scenes across three parts with empty image fields.
- [x] Add accessible placeholders on home, chapters and reader; fix offline parity.
- [x] Update documentation and regression checks.
- **Status:** complete

### Phase 4: Testing & Verification
- [x] Run npm test, npm run build:pages and HTTP checks; browser host unavailable.
- [x] Review diff, assets, secrets and Git status.
- **Status:** complete

### Phase 5: Delivery
- [ ] Commit intended changes in understandable increments and push feature branch.
- [ ] Verify GitHub head and prepare reviewable pull request.
- **Status:** in_progress

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| New branch feature/chapter1-photo-free | Scope now delivers a reader rather than a film |
| Storyboard text supplies runtime catalog | Already approved source segmentation; avoid duplicate text |
| Film assets remain plans | User requests photo-free reading release |
| No merge to main or deployment | Project requires review first |

## Errors Encountered
| Error | Resolution |
|-------|------------|
| Baseline npm test: 20 pass, 1 fail | Old public portrait remains; preserve locally and remove from public assets |
