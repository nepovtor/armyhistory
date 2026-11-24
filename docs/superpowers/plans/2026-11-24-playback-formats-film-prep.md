# Playback formats and film preparation implementation plan

**Goal:** Offer free reading plus clearly unavailable audio/video choices; prepare separate Stars products and a reproducible production package.

**Architecture:** Keep the current story engine and map payment API. Add one playback module for two trusted server products and their validation. Generate film deliverables from the existing canonical storyboard, with shot coverage kept in a separate director plan.

**Tech stack:** Existing Node.js ES modules and node:test; FFmpeg/Blender only for later production. No dependencies added.

**Spec:** Current user request and reply, AGENTS.md, canonical source and storyboard.

## Constraints and review focus

- Both new buttons are gray, disabled and labelled «В разработке»; no prices.
- Clients cannot submit their own prices or unlock a format from invoice callbacks.
- Audio, video and route-map entitlements remain independent. Development products reject invoice, checkout and successful-payment claims.
- Static Pages contains no private media, payment credentials or real checkout.
- Film IDs and voice text match all 41 scenes; timings are provisional until recorded voice. Genuine acting is required for final animation.

## Tasks

- [ ] Add failing format/payment/UI tests, implement one trusted playback catalog and guards, wire the server and bot, and simplify the home menu.
- [ ] Create film-specific shot coverage, generated shotlist/voice cues/asset register and a 55-second pilot plan; extend production validation.
- [ ] Run npm test, production validation, build:pages and diff checks; inspect publication artifact.
- [ ] Commit and push tested changes; update the established Pages site after reviewing the final diff. Real media sales remain disabled.

Native execution in this session; no delegation needed.
