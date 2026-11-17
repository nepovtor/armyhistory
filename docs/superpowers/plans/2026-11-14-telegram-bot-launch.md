# Telegram Bot Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Launch a branded Telegram bot that opens HIStory as a Mini App, replace the channel's broken game CTA with the bot link, and preserve a clear path to the existing 15-Star production flow.

**Architecture:** Use BotFather for the public bot identity and menu button. Launch the first durable version against the verified GitHub Pages build; keep the existing Node.js bot/payment backend unchanged for a later persistent HTTPS deployment because GitHub Pages cannot process Stars updates.

**Tech Stack:** Telegram BotFather, Telegram Mini Apps, GitHub Pages, Node.js 20, Telegram Bot API, Telegram Stars.

**Spec:** `.planning/2026-11-14-telegram-channel-launch/task_plan.md`

## Global Constraints

- Never print, commit, or place the BotFather token in planning files, logs, or generated assets.
- Use `https://nepovtor.github.io/armyhistory/` as the initial Mini App URL.
- Do not claim the static Pages demo enforces the 15-Star map purchase.
- Run only one long-polling production bot instance when the Node.js backend is deployed.
- Keep `.env` and `data/` outside Git.

## Review Focus

- Bot username availability: retry with a close brand-safe alternative ending in `bot`.
- Mini App launch: the menu button must open HTTPS inside Telegram, not an external 404 page.
- Public CTA consistency: channel description and launch posts must link to the bot, not the stale Pages path.
- Secret handling: the token must remain in BotFather or a secret-variable UI and never appear in terminal output.
- Payment expectations: the public copy must not advertise enforced Stars until the Node.js host passes a real Telegram payment test.

---

### Task 1: Validate the launch target

**Files:**
- Modify: `README.md`
- Modify: `docs/telegram-channel-content.md`
- Test: `tests/*.test.mjs`

**Interfaces:**
- Consumes: GitHub Pages workflow and `tools/build-demo.mjs`
- Produces: verified initial Mini App URL `https://nepovtor.github.io/armyhistory/`

- [x] **Step 1: Run the complete automated test suite**

Run: `npm test`
Expected: 22 tests pass, 0 fail.

- [x] **Step 2: Rebuild the Pages artifact**

Run: `npm run build:pages`
Expected: `docs/index.html` is generated successfully.

- [x] **Step 3: Verify the deployed URL**

Run: `curl -fsSIL https://nepovtor.github.io/armyhistory/`
Expected: HTTP 200.

### Task 2: Create and brand the bot

**Files:**
- Reuse: `public/assets/channel-avatar.png`

**Interfaces:**
- Consumes: BotFather and the prepared channel identity
- Produces: public `https://t.me/<bot_username>` link and a private bot token

- [ ] **Step 1: Receive action-time confirmation for token issuance**

Expected: the user explicitly confirms creation of the bot and its persistent token.

- [ ] **Step 2: Create the bot in BotFather**

Use display name `HIStory | Три года до дома`; try `history_three_years_bot` first and choose the nearest available brand-safe username if unavailable.

- [ ] **Step 3: Configure the public profile**

Set the prepared avatar, a concise about line, the full product description, and `/start` plus `/help` commands.

- [ ] **Step 4: Configure the Mini App menu button**

Set button text `Играть` and URL `https://nepovtor.github.io/armyhistory/`.

### Task 3: Verify the bot launch and update the channel funnel

**Files:**
- Modify: `docs/telegram-channel-content.md`

**Interfaces:**
- Consumes: public bot username from Task 2
- Produces: channel description and launch posts that route visitors through the bot

- [ ] **Step 1: Open the bot and launch the Mini App**

Expected: the game loads inside Telegram and shows the HIStory home screen.

- [ ] **Step 2: Correct the channel description and three CTA posts**

Replace the stale Pages link with the public bot link while preserving the approved Russian copy.

- [ ] **Step 3: Publish one bot-launch post**

State that the game opens through the bot; do not promise active Stars enforcement on the static build.

### Task 4: Deploy the full Stars backend

**Files:**
- Reuse: `server/index.mjs`
- Reuse: `server/bot.mjs`
- Reuse: `server/auth.mjs`
- Reuse: `server/payments.mjs`
- Reuse: `server/storage.mjs`

**Interfaces:**
- Consumes: an authenticated persistent HTTPS host, `BOT_TOKEN`, `APP_URL`, and a persistent data volume
- Produces: server-authenticated Mini App with a one-time 15 XTR map entitlement

- [ ] **Step 1: Select and authenticate a persistent Node.js host**

Expected: Node.js 20+, HTTPS domain, one running instance, and a persistent volume are available.

- [ ] **Step 2: Configure secret variables without exposing them**

Set `BOT_TOKEN`, `APP_URL`, `NODE_ENV=production`, `DEMO_MODE=0`, and `DATA_DIR` in the host's secret-variable UI.

- [ ] **Step 3: Deploy and verify health**

Run remotely: `npm start`; verify `GET /health` returns `{ "ok": true }`.

- [ ] **Step 4: Point BotFather's menu button to the production URL**

Expected: the Mini App authenticates with Telegram init data and server progress persists.

- [ ] **Step 5: Perform a real Stars purchase test**

Expected: invoice amount is 15 XTR, checkout succeeds, the map unlocks only after `successful_payment`, and access remains after reopening.
