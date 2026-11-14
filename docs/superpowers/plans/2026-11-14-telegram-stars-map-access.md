# Telegram Stars Map Access Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Require a one-time 15 Telegram Stars payment before a Telegram user can view the route map, while keeping the static demo usable and remembering paid access across devices.

**Architecture:** The server creates a native Stars invoice link bound to the authenticated Telegram user. The bot validates the pre-checkout payload, currency, and amount, then persists the entitlement only after a matching `successful_payment`. The map SVG moves out of public static assets and is served through an authenticated entitlement-protected endpoint; the client shows a purchase card until the server reports access.

**Tech Stack:** Node.js 20 ESM, built-in HTTP server, Telegram Bot API, Telegram Mini App WebApp API, JSON file persistence, Node test runner.

**Spec:** `.planning/2026-11-14-telegram-stars-map-access/findings.md`

## Global Constraints

- The one-time price is exactly 15 Telegram Stars (`XTR`).
- Production access is bound to verified Telegram `initData` and stored server-side.
- Access is granted only after a valid `successful_payment` update.
- The real route-map asset is not publicly addressable in production.
- Local development and the static GitHub Pages demo remain unlocked and require no real payment.
- No third-party dependencies are added.

## Review Focus

- A forged payload, wrong Telegram user, wrong currency, or amount other than 15 must be rejected at pre-checkout.
- An invoice callback that says `paid` before the server processes `successful_payment` must not unlock the map.
- Replayed `successful_payment` updates must be idempotent and must not corrupt or duplicate the entitlement.
- Existing `progress.json` files without entitlement fields must load and retain story progress.
- The protected SVG must return 403 to unpaid production users while remaining available in demo mode and the static build.

---

### Task 1: Stars payment domain and persistence

**Files:**
- Create: `server/payments.mjs`
- Modify: `server/storage.mjs`
- Create: `tests/payments.test.mjs`
- Modify: `tests/storage.test.mjs`

**Interfaces:**
- Produces: `MAP_ACCESS_PRODUCT`, `MAP_ACCESS_PRICE`, `createMapInvoiceLink(token, telegramId, fetchImpl?)`, `validateMapPayment(update, storage)`, `Storage.hasEntitlement(userId, product)`, and `Storage.grantEntitlement(userId, product, payment)`.
- Consumes: the existing JSON storage file and Telegram Bot API HTTPS endpoint.

- [ ] **Step 1: Write failing payment validation and storage migration tests**

Assert that the canonical payload validates only for its bound Telegram user with `currency === 'XTR'` and `total_amount === 15`; assert that a valid successful payment stores one entitlement with its charge ID; assert old story progress survives the schema extension.

- [ ] **Step 2: Run the targeted tests and confirm they fail**

Run: `node --test tests/payments.test.mjs tests/storage.test.mjs`

Expected: FAIL because the payment module and entitlement methods do not exist.

- [ ] **Step 3: Implement the minimal payment helpers and entitlement storage**

Use a payload format tied to the Telegram numeric user ID, one `XTR` labeled price of 15, strict validation of user/currency/amount, and idempotency by `telegram_payment_charge_id`. Preserve the existing `{ users: { ...stories } }` data shape.

- [ ] **Step 4: Run the targeted tests**

Run: `node --test tests/payments.test.mjs tests/storage.test.mjs`

Expected: PASS.

### Task 2: Bot checkout handling and server endpoints

**Files:**
- Modify: `server/bot.mjs`
- Modify: `server/index.mjs`
- Move: `public/assets/route.svg` → `private/route.svg`
- Modify: `tests/payments.test.mjs`

**Interfaces:**
- Consumes: Task 1 payment constants/helpers and storage entitlement methods.
- Produces: `POST /api/map/invoice`, `GET /api/map`, bootstrap `mapAccess`, bot handling for `pre_checkout_query` and `successful_payment`.

- [ ] **Step 1: Add failing tests for checkout/update handling**

Use injected Bot API/fetch fakes to assert valid pre-checkout approval, invalid checkout rejection, successful entitlement grant, and replay idempotency.

- [ ] **Step 2: Run the targeted payment tests and confirm they fail**

Run: `node --test tests/payments.test.mjs`

Expected: FAIL on the missing bot update handler.

- [ ] **Step 3: Implement bot update handling and protected endpoints**

Poll `message` and `pre_checkout_query`; answer every checkout within the update loop; process `successful_payment` before command messages. Return a native invoice link only for an authenticated unpaid Telegram user. Serve `private/route.svg` only to entitled users or local demo users. Report `{ unlocked, price: 15, currency: 'XTR' }` in bootstrap.

- [ ] **Step 4: Run targeted tests**

Run: `node --test tests/payments.test.mjs tests/storage.test.mjs tests/auth.test.mjs`

Expected: PASS.

### Task 3: Locked map purchase UI and static demo

**Files:**
- Modify: `public/app.js`
- Modify: `public/styles.css`
- Modify: `tools/build-demo.mjs`
- Modify: `tests/ui-assets.test.mjs`
- Modify: `README.md`

**Interfaces:**
- Consumes: bootstrap `mapAccess`, `POST /api/map/invoice`, `GET /api/map`, and `Telegram.WebApp.openInvoice(url, callback)`.
- Produces: a locked-map card, native purchase action, server-state refresh after invoice close, and an unlocked offline demo.

- [ ] **Step 1: Add failing UI/build assertions**

Assert the production client uses `/api/map`, contains the `buy-map` action and `openInvoice`, does not trust the callback as an entitlement, and the static build embeds the protected map as a data URI with `mapAccess.unlocked === true`.

- [ ] **Step 2: Run UI tests and confirm they fail**

Run: `node --test tests/ui-assets.test.mjs`

Expected: FAIL on the missing protected-map and payment UI behavior.

- [ ] **Step 3: Implement the purchase card and native invoice flow**

On a route scene, render the SVG only when `state.mapAccess.unlocked`. Otherwise render the 15-star purchase card. On purchase, request an invoice link, call `openInvoice`, then re-fetch bootstrap state and unlock only if the server says so; show clear cancelled, failed, pending, and not-yet-confirmed messages.

- [ ] **Step 4: Keep the offline demo free and document deployment**

Teach `build-demo.mjs` to load `private/route.svg`, replace `/api/map` with its data URI, and return unlocked demo access. Document that Stars require the Node server/bot and cannot work on GitHub Pages alone.

- [ ] **Step 5: Run UI and build tests**

Run: `node --test tests/ui-assets.test.mjs && npm run build:pages`

Expected: PASS and a regenerated `docs/index.html`.

### Task 4: Full verification

**Files:**
- Modify: `.planning/2026-11-14-telegram-stars-map-access/progress.md`

**Interfaces:**
- Consumes: all completed tasks.
- Produces: fresh verification evidence and a requirement-to-change review.

- [ ] **Step 1: Run the full automated test suite**

Run: `npm test`

Expected: all tests pass with zero failures.

- [ ] **Step 2: Build the static Pages artifact**

Run: `npm run build:pages`

Expected: exit code 0 and `docs/index.html` regenerated.

- [ ] **Step 3: Inspect tracked changes and security-sensitive paths**

Run: `git diff --check && git status --short && git diff --stat`

Expected: no whitespace errors; only feature, planning, documentation, test, and generated demo files are changed.

- [ ] **Step 4: Re-read this plan and record evidence**

Confirm each global constraint and Review Focus item has code or a test, then record the commands and observed results in the progress log.
