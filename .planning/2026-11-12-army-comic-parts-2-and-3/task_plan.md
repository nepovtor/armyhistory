# Task Plan: Army Comic Parts 2 and 3

## Goal
Refresh the project's visual assets into one simple, funny army-comic style and add polished second and third story parts based on the user's Russian text.

## Next Step
Commit and push the verified Pages fix so GitHub Actions redeploys the corrected artifact.

## Current Phase
Phase 7

## Phases

### Phase 1: Requirements & Discovery
- [x] Understand user intent
- [x] Identify constraints
- [x] Document in findings.md
- **Status:** complete

### Phase 2: Planning & Structure
- [x] Define approach
- [x] Define character/style continuity and page breakdown
- **Status:** complete

### Phase 3: Implementation
- [x] Generate or upgrade image assets non-destructively
- [x] Add parts 2 and 3 to the project
- **Status:** complete

### Phase 4: Testing & Verification
- [x] Verify image quality, Russian text, and responsive rendering
- [x] Document test results
- **Status:** complete

### Phase 5: Delivery
- [x] Review final visuals at presentation size
- [x] Deliver to user
- **Status:** complete

### Phase 6: GitHub Pages Root-Cause Diagnosis
- [x] Reproduce the published asset failure
- [x] Trace generated asset URLs and deployment inputs
- [x] Record the confirmed root cause
- **Status:** complete

### Phase 7: GitHub Pages Fix & Verification
- [x] Add a failing regression check
- [x] Implement the minimal path/deployment fix
- [x] Rebuild and verify local and published-style URLs
- **Status:** complete

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Use the existing comic as visual direction, not a pixel-for-pixel edit target | The user asked for a simpler, funny army style and new parts 2 and 3. |
| Split the supplied event into "Экзамен для морпеха" and "Отказ и упущенные водолазы" | Each part gets a clear comic arc and preserves the factual order. |
| Keep text out of generated art | Russian captions remain crisp and editable in the app UI. |

## Errors Encountered
| Error | Resolution |
|-------|------------|
| `magick` / `convert` not available | Use direct `view_image` inspection. |
| `sips` cannot encode WebP | Convert generated PNG files with installed `cwebp`. |
| Native browser automation pipe failed after the part 2 visual check | Retained the successful local render check and completed automated story, asset, and build verification. |
| Web browsing tool could not open GitHub Pages | Fall back to read-only `curl` status/header checks. |
| Temp cleanup command using `rm -f` was rejected | Used explicit `unlink` targets and `rmdir`. |
