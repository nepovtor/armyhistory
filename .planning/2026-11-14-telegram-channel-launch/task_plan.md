# Task Plan: Telegram channel launch for HIStory

## Goal
Create and launch a Telegram channel that immediately explains HIStory, directs visitors into the game, and includes initial promotional and community content.

## Next Step
Obtain action-time confirmation, then create and brand the public bot in BotFather, point its Mini App menu to the verified Pages build, and replace the channel CTA with the bot link.

## Current Phase
Phase 6

## Phases

### Phase 1: Requirements & Discovery
- [x] Inspect the available Telegram account and existing bot/app destination
- [x] Inspect reusable visual assets and factual product positioning
- [x] Decide channel, discussion, and starter-content structure
- [x] Document findings and assumptions
- **Status:** complete

### Phase 2: Brand & Content Preparation
- [x] Create channel identity and avatar
- [x] Draft description, pinned post, and starter posts
- [x] Prepare CTA links without unsupported claims
- **Status:** complete

### Phase 3: Telegram Setup
- [x] Create and configure the channel
- [x] Create and connect a discussion space
- [x] Publish the starter content
- **Status:** complete

### Phase 4: Testing & Verification
- [x] Verify title, description, posts, and game CTA
- [x] Verify public visibility and discussion entry point
- [x] Document observed results and remaining gaps
- **Status:** complete

### Phase 5: Delivery
- [x] Prepare created Telegram entity and link for handoff
- [x] Record the remaining avatar and pin limitations
- **Status:** complete

### Phase 6: Bot Launch Preparation
- [x] Inspect the existing bot, Mini App, payment, and deployment implementation
- [x] Verify the static Pages build and current HTTPS URL
- [x] Document the static-demo versus production-Stars limitation
- [ ] Receive confirmation for BotFather bot creation and token issuance
- **Status:** in_progress

### Phase 7: BotFather Setup
- [ ] Create a public bot with an available username
- [ ] Set the bot description, about text, avatar, and commands
- [ ] Configure the Mini App menu button to the verified HTTPS URL
- **Status:** pending

### Phase 8: Channel-to-Bot Funnel
- [ ] Verify the bot opens the game inside Telegram
- [ ] Replace the broken channel CTA with the bot link
- [ ] Publish or update a clear launch post for the bot
- **Status:** pending

### Phase 9: Production Stars Hosting
- [ ] Determine an authenticated persistent HTTPS hosting target
- [ ] Deploy one Node.js instance with persistent storage and secret variables
- [ ] Verify Telegram authentication, 15-Star invoice, and entitlement persistence
- [ ] Upload the prepared avatar and pin the welcome post if UI automation permits
- **Status:** pending

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Primary action is opening the game | The user wants channel visitors to understand the product and then enter the game. |
| No fabricated popularity or testimonial claims | The repository provides product facts but no audience metrics or reviews. |

## Errors Encountered
| Error | Resolution |
|-------|------------|
| Telegram Desktop did not open its file picker from the avatar control through UI automation | Kept the generated avatar at `public/assets/channel-avatar.png` and reported the upload as a remaining cosmetic action. |
| The welcome post's context menu could not be opened reliably through UI automation | Left the welcome post published as the first item and reported pinning as a remaining cosmetic action. |
| The initially documented Pages URL returned HTTP 404 | Root cause: the repository is named `armyhistory`, so project Pages is served at `/armyhistory/`, while README copy still referenced `/HIStory/`. Updated local source copy; public Telegram edits require confirmation. |
| Railway CLI is installed but not linked to an authenticated project | Use the verified static Pages build for the initial bot launch; production Stars deployment remains a separate hosting phase. |
