# Findings & Decisions

## Requirements
- Create and brand a Telegram channel for the HIStory game.
- Make the channel understandable to first-time visitors and lead them into the game.
- Add several useful starter content areas: product promotion plus contextual/community material.
- Use the Telegram access already available in the shared environment.

## Research Findings
- Telegram Desktop is open and authenticated under the user's account.
- A global search for `HIStory` did not reveal an existing local HIStory game bot or channel; results were unrelated public history channels.
- BotFather is available in the account, but no public bot identity for this project has yet been identified.
- The repository has no local `.env`, so no configured `BOT_TOKEN` or production `APP_URL` can be recovered from the project.
- The existing cover art provides a strong channel identity: a young Soviet sailor, navy/cream palette, anchor badge, Sevastopol harbor, and vintage comic texture.
- The verified public game destination is the GitHub Pages demo: `https://nepovtor.github.io/armyhistory/`. It opens the game but does not run the Stars/server flow.
- A square, crop-safe avatar was generated from the existing cover art and saved as `public/assets/channel-avatar.png`.
- Launch copy is saved in `docs/telegram-channel-content.md`: channel description, discussion description, pinned welcome post, story hook, gameplay explainer, and channel-content promise.
- The public channel is live at `https://t.me/history_three_years` with the title `HIStory | Три года до дома`.
- The discussion group `HIStory | Обсуждение` is connected, and comment entry points are visible beneath publications.
- Four starter posts are present in the channel feed. Three posts and the channel description currently contain the stale `/HIStory/` CTA; the corrected local copy uses `/armyhistory/`.
- The repository already contains a production Telegram bot and Mini App backend: `server/bot.mjs` configures the menu button and `/start`, `server/auth.mjs` verifies Telegram init data, and `server/payments.mjs` creates a 15 XTR invoice and grants map access after `successful_payment`.
- The live GitHub Pages build is a static offline demo. Its build stub intentionally reports the map as already unlocked and cannot receive Bot API updates, so it can launch inside a bot but cannot enforce the 15-Star map purchase.
- Full Stars behavior requires an always-on HTTPS Node.js deployment with persistent storage plus `BOT_TOKEN` and `APP_URL`; GitHub Pages alone cannot host that server process.
- `cloudflared` and Railway CLI are installed locally, but Railway is not linked to an authenticated project. A Cloudflare quick tunnel would be temporary and is not suitable as the permanent public game URL.
- The current code is ready for a production bot host: `.env` and `data/` are ignored, the Node.js version floor is 20, and the complete automated suite passes before bot creation.

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| Treat the brief as Situation A (blank brief) | The user supplied the desired outcome but no existing channel copy or content structure. |
| Use `HIStory | Три года до дома` as the channel name | It connects the product name to the clearest story promise already present in the game. |
| Create one channel plus one discussion group | This gives a clear broadcast funnel and a place for reader comments without fragmenting a new audience across empty chats. |
| Use the verified Pages URL as the initial CTA | No production bot username or APP_URL is available; using a guessed destination would break the funnel. |
| Keep the copy grounded in the supplied story | There are no audience metrics, testimonials, or other proof that would support stronger marketing claims. |
| Reuse the existing bot/backend implementation | It already covers the requested menu, Telegram authentication, and 15-Star map payment without adding unnecessary code. |
| Launch the bot first with the verified Pages URL | It provides a durable in-Telegram game immediately; do not claim Stars are enforced until the Node.js server is deployed. |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| Telegram Desktop's avatar control did not expose a working file picker through UI automation | Keep `public/assets/channel-avatar.png` as the ready-to-upload asset; do not claim that the avatar is live. |
| The welcome post context menu could not be opened reliably through UI automation | Do not claim that the post is pinned; it remains published in the feed. |
| The initially published CTA returned HTTP 404 | The repository is `nepovtor/armyhistory`, so the GitHub Pages project path is `/armyhistory/`. The live Telegram description and three posts need a confirmed public edit. |

## Resources
-
