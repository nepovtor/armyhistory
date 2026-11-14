# Findings & Decisions

## Requirements
- A user must pay 15 Telegram Stars to view the map.
- After successful payment, map access must remain available to that user.
- The payment result must be validated through Telegram/server-side state rather than trusted from the browser alone.

## Research Findings
- The map is not a separate application view. It is rendered by `readerView()` when the current story scene has `background === 'route'`, using `/assets/route.svg`.
- The app already has a Node 20 backend, Telegram `initData` verification, long-polling bot loop, and per-user JSON persistence in `data/progress.json`.
- The GitHub Pages build is a fully static demo with local progress. It cannot securely process Stars, so the production server flow must enforce the entitlement while demo mode stays free.
- Official Telegram Stars flow: create an invoice link with currency `XTR` and exactly one price; open it inside the Mini App with `Telegram.WebApp.openInvoice`; answer `pre_checkout_query` within 10 seconds; grant the digital good only after receiving `successful_payment`; persist `telegram_payment_charge_id` for refund/support needs.
- The invoice UI callback is not authoritative. Even when the client reports `paid`, the app must re-fetch server state and the server must have processed `successful_payment` before revealing the map.
- The exact gated scene is `c1p1-05a` (`background: 'route'`), reached when the reader selects “Посмотреть путь”.
- `public/app.js` currently maps `route` directly to `/assets/route.svg`; leaving that file under `public/` would make a UI-only paywall trivial to bypass.
- `launchBot()` currently polls only `message` updates and skips every non-command message. It must also receive `pre_checkout_query` updates and inspect `message.successful_payment` before command routing.
- The existing storage schema is `{ users: { [userId]: { stories } } }`. Entitlements can be added to each user record without breaking existing files, provided all writes preserve `stories`.
- A protected image cannot be loaded with a plain `<img src="/api/map">` because the browser will not attach the Mini App's `X-Telegram-Init-Data` header. The client must fetch the SVG with the authentication header and render an object URL.

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| Gate route-background scenes, not all story reading | This matches the user's example and the current content model without inventing a new map page. |
| Use `createInvoiceLink` + Mini App `openInvoice` | This produces the native Telegram payment sheet without sending an extra chat message. |
| Keep static/demo mode unlocked | A static page has no secure Bot API callback or server-side entitlement store. |
| Persist entitlement and charge ID in the existing JSON store | It is the project's current persistence mechanism and supports access across devices for the same Telegram user. |
| Serve the paid SVG only from an authenticated API route | Keeping the real map in `public/assets` would bypass the paywall. |
| Grant access on `successful_payment`, never on `openInvoice` callback | This is Telegram's required delivery boundary for digital goods. |

## Issues Encountered
| Issue | Resolution |
|-------|------------|

## Resources
- Telegram Bot Payments API for digital goods: https://core.telegram.org/bots/payments-stars
- Telegram Bot API (`createInvoiceLink`, `answerPreCheckoutQuery`): https://core.telegram.org/bots/api
- Telegram Mini Apps (`openInvoice`): https://core.telegram.org/bots/webapps
