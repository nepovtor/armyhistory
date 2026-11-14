# Task Plan: Telegram Stars access to the map

## Goal
Require a successful 15 Telegram Stars payment before a user can open the map, while preserving access for users who already paid.

## Next Step
Deploy the Node server with a real BOT_TOKEN and APP_URL, then test one Stars payment in Telegram's test environment.

## Current Phase
Complete

## Phases

### Phase 1: Requirements & Discovery
- [x] Inspect repository instructions and current worktree state
- [x] Trace the map entry point, backend, user identity, and persistence
- [x] Identify the existing Telegram bot/Mini App payment integration
- [x] Document constraints and findings in findings.md
- **Status:** complete

### Phase 2: Implementation Plan
- [x] Define the smallest secure entitlement and Stars-payment flow
- [x] Write the detailed implementation plan under docs/superpowers/plans
- [x] Validate the persistent plan structure
- **Status:** complete

### Phase 3: Implementation
- [x] Add backend payment and entitlement behavior
- [x] Add frontend locked-map purchase flow
- [x] Add or update automated tests
- **Status:** complete

### Phase 4: Testing & Verification
- [x] Run targeted tests and static checks
- [x] Run the production build or equivalent project verification
- [x] Review the diff against the requirement
- **Status:** complete

### Phase 5: Delivery
- [x] Record changed files and fresh verification evidence
- [x] Explain the payment flow and any deployment configuration
- **Status:** complete

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Price is 15 Stars | This is the concrete value requested by the user. |
| Entitlement is verified server-side | Client-only unlocks would be bypassable and could be lost across devices. |
| Protected map is loaded with authenticated fetch | Image elements cannot attach Telegram initData headers. |

## Errors Encountered
| Error | Resolution |
|-------|------------|
| Expected red tests failed on missing payment/storage/UI behavior | Implemented the feature and reran the same tests to green. |
| A multi-file patch missed an exact findings line | Reapplied the same changes with the correct context. |
| Sandbox rejected a cleanup command containing `rm -rf` | Used `rmdir` on the known empty smoke-test directory. |
