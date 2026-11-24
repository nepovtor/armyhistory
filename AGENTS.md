# AGENTS.md — HIStory / FULL 2D ANIMATED FILM

> Applies to the existing `nepovtor/armyhistory` project. This file REPLACES the previous motion-comic instruction set. Read it before changing any project code.

## Mission and non-negotiable outcome

Produce **Chapter 1 as a finished, coherent 2D animated short film**, based on the real source recollections, then integrate it as a premium *Cinematic Mode* in the existing Telegram Mini App. Target initial duration **8–12 minutes**, to be revised after script timing. This is a production target, not an assertion that video exists. The chapter contains **three parts**, not just the train journey.

A finished film includes **character acting** (walking, posture, gestures, head turns and expressions where dramatically justified), shot/reverse shot, closeups, establishing shots, edit rhythm, dialogue or voiceover, Russian subtitles, sound design, and correct continuity. A sliding image, Ken Burns zoom, particle overlay, or unmodified slideshow is an **animatic/preview**, not final character animation. Do not label such a preview a finished cartoon.

Codex is a director/technical producer/implementer, not an autonomous image or video generation model. Detect actual available tools, models, API credentials, permissions and GPU before assigning tasks. If true animated shots cannot be generated, build functional rigs and/or usable animatic plus a factual blocker list; never falsely claim full-film completion.

## First: audit the actual repository

1. Read `README.md`, `package.json`, `server/content.mjs`, `server/engine.mjs`, `server/index.mjs`, `server/bot.mjs`, `server/payments.mjs`, `public/app.js`, `tools/build-demo.mjs`, all tests and existing assets.
2. Read BOTH originals: `docs/source-story-chapter-1-part-1.md` and `docs/source-story-chapter-1-parts-2-3.md`.
3. Read `docs/CINEMATIC_PRODUCTION.md`, `docs/TOOLCHAIN_AND_SETUP.md`, `docs/PAYMENTS_AND_DELIVERY.md`, `docs/OPTIONAL_CODEX_SKILLS.md`, and `production/chapter01/shotlist.json` if present. Validate the shot list against live story IDs.
4. Inventory available source illustrations and approved protagonist reference. NEVER assume an image exists because the code references a path.
5. Preserve existing Node.js ES-module story engine, user progress, Telegram HMAC authentication and the 15 Stars route-map entitlement unless changing these is truly required. Never overwrite user edits.
6. Work in a feature branch. Commit in small, understandable increments; do not merge to `main` or deploy/paywall-enable without review.

## Content reset — 22 November 2026

The user explicitly requested removal of every old photo/illustration and the entire previous story. The new complete corrected recollections have now been supplied and are preserved verbatim at `production/chapter01/source-author-2026-11-22.txt`. The edited three-part script and storyboard are production plans only; the Mini App catalog remains empty pending integration. All earlier chronology, scene text, protagonist references, screenplay and shot lists are obsolete. Do not reconstruct them from Git, backups or prior context. Start new factual work only from the newly supplied author text; do not invent dialogue, appearance or documentary details.

Latest canonical corrections: `production/chapter01/source-author-clarifications-2026-11-23.txt` takes precedence over the original. The hero is18; arrival Simferopol20Nov night, sparring21Nov with the same captain, refusal22Nov via a different officer, arrival Sevastopol training23Nov night.25Nov remains the retrospective summary date by explicit user choice. Use `reference-bible.md` for the four new photos, clothing, upper/lower bunk continuity and limits of the submarine reference. There are now41 image prompts; ordinary version uses still illustrations, animation remains the future paid version.

Style-only reuse authorized by the user on23 November2026: early illustrations S01–S03 may guide ink contour, hatching, print texture and palette. See `production/chapter01/style-bible.md`. They are not documentary sources or protagonist identity references, and must not restore prior events, faces, costume errors or public assets.

Existing application code, Telegram authentication, user progress and purchased entitlements are retained. Story content is empty and map sales are unavailable while its asset is absent. Earlier source paths in the production instructions describe superseded deliverables. Use the new source file and `production/chapter01/editing-notes.md`; do not repopulate the deleted originals.

## Photo-free reader integration — 24 November 2026

The user's latest instruction authorizes integrating the corrected story and publishing all intended changes on a feature branch. This supersedes the earlier statements that the Mini App catalog must remain empty. `server/content.mjs` maps the approved 41 slides in `production/chapter01/storyboard.json` to three free reading parts. Home, chapter and scene art remain empty and render CSS placeholders. No photos or illustrations are included in the current public assets. Storyboard visual directions and film prompts remain plans, not completed media. Main merge, deployment and real paid listing still require review.

## Film language and quality bar

- **2D drawn realism** with credible late-1980s/1990 setting; painterly textures but not watercolor or toy 3D; expressions human and restrained. Cold pre-dawn, warm carriage bulbs, dark dormitory, muted naval harbor; scene-motivated lighting.
- Plan every shot as **wide / medium / close / insert** with emotional beat, duration, 2D layers or animation drawings, camera move, action keys, sound cue and transition.
- Animate actual actions when called for: boarding a train, sitting, speaking, looking out a window, turning, walking, sparring, delivering/receiving papers. Use approved cut-out rigs, pose-to-pose 2D drawing, or inspected image-to-video generated passes. Reuse rigs; don't morph a flat photo into a rubber face.
- For lip sync, start from approved dialogue audio and use a tested tool (e.g. Rhubarb) to generate phoneme/cue timing, then map cues onto **actual mouth drawings**. Audio alone does not make lips animate. Confirm Russian-language output quality manually.
- Do not include random facts in readable background signs, badges, papers or route maps. For a map, verify Minsk → Simferopol → Sevastopol; avoid inaccurate boundaries.
- No looped movement for its own sake, no repeated camera move everywhere, no AI artifacts (extra fingers, drifting facial structure, melting uniforms, disappearing props), no wildly inconsistent lighting.
- Make a 30–60 second **quality pilot** featuring (1) station/train, (2) a character action or dialogue, (3) dark barracks or sparring. Approval criteria: believable acting + continuity + audio + edit + no broken faces, not merely attractive static art.

## Technical production architecture

Recommended lean pipeline:

```text
canonical recollections + server/content.mjs
  -> screenplay (verified dialogue/voiceover) + character/style bibles
  -> shotlist.json + storyboard/animatic
  -> production assets / layered backgrounds + 2D puppet rigs / animated shots
  -> clean Russian dialogue/voiceover + ambience + lip sync timing
  -> frame-accurate editor (Remotion / FFmpeg) + QC
  -> H.264 MP4 + AAC audio + SRT/VTT subtitles + poster + metadata
  -> existing Node/TG Mini App (protected streaming) and separate free reading
```

- Animation authoring: Blender Grease Pencil or similarly appropriate 2D tool; **2.5D parallax is supporting cinematography, not the main animation technique**.
- Post-production: Remotion + FFmpeg for programmatic shots/edits and export; keep any Remotion packages isolated to production tooling and avoid breaking the dependency-free current web app.
- Optional AI/ComfyUI/image-to-video passes require tool availability, documented prompts/seeds, image anchors, rights and visual QC. A 2D character rig can be superior to AI video when continuity matters.
- Image Story Video Wizard can serve as a planning skill if installed/compatible. Miragea Voice MCP is optional and may require an API key and payment. lemo-opuscar may be used only after verifying its local skill contract and actual suitability; never pretend any is connected just because mentioned.
- Mac for editing/assembling/rigging; optional NVIDIA machine for model-heavy image-to-video. Do not assume a specific VRAM amount, local software state, or remotely accessible GPU.
- Store new source files under `production/chapter01/`. Do not commit massive renders or private reference images to a public repository by default. Put final videos in protected storage, not `public/`, `docs/` or GitHub Pages.
- Set up `.gitignore` for `production/**/renders/`, `production/**/private/`, temporary audio, `.env`, model checkpoints, generated video. Keep manifests and instructions tracked.

## Rendering and playback specifications

- Master composition: propose **1920×1080 (16:9), 24 fps**, stereo audio; a separate **1080×1920 (9:16)** cut or carefully reviewed responsive crop for Telegram. Do not automatically crop off faces/action.
- Delivery: H.264 MP4, `yuv420p`, `+faststart`, AAC (48kHz preferred); offer a smaller bitrate rendition on mobile if hosting supports it.
- Subtitles: timed Russian SRT/VTT from final voice recording, properly proofread and safe within Telegram UI. No burned-in unreadable text.
- Film mode: explicit Play/Pause, mute, subtitles, seek/progress, restart and return to free reading, poster/loading states. No forced audio/autoplay. Preserve `prefers-reduced-motion` fallbacks and `aria` labels.
- Add tests for chapter manifest continuity, asset references, story IDs, video metadata/progress where feasible. Playback failure must not break reading.

## Stars access control and distribution — strict

- Keep ordinary interactive story reading free. Premium purchase unlocks **one paid Chapter 1 film** permanently for that Telegram user, subject to documented terms/refunds. Start at **39 XTR as an experiment**, not a verified market price; keep price configurable server-side.
- For digital content INSIDE Telegram: use Telegram Stars / `XTR`, not direct TON checkout. Implement invoices, `pre_checkout_query`, `successful_payment`, idempotent transaction accounting, persistent entitlement and support/refund procedures. Bind entitlement to **validated Telegram user ID**, never a client-controlled demo ID.
- Existing 15 XTR map purchase is **a separate SKU/entitlement**; no accidental cross-unlocks. Simulate payment in tests only. Never grant access based on `openInvoice()` client callback alone.
- Protect real video bytes. A hidden front-end button is not protection. **Do not place unencrypted paid video in `public/`, `docs/`, GitHub Pages, or a public repo/CDN URL**. Use private object storage plus short-lived signed media URLs or an authenticated range-capable streaming endpoint. Think through CDN caches, token expiry, range requests and no-store on entitlements.
- GitHub Pages build remains a free/demo version; remove premium video and real payment assumptions from it. Clearly explain the difference in UI.
- No hardcoded `BOT_TOKEN`, keys or personal identifiers in repo, logs, screenshots, prompts or output.
- Never enable real paid listing until film + secure playback + refund/support path + server infrastructure have been tested.

## Work plan — execute, not just suggest

### Stage 0 — verify and inventory
Run `npm test`, `npm run build:pages`; inspect actual source images and IDs, hardware and available software. Write audit and missing-input checklist.

### Stage 1 — script and direction
Write `production/chapter01/script.md` from verified facts; produce character/style bible and detailed 2D acting/keyframe shot list; create audio plan and timing estimate. Avoid invented quotations.

### Stage 2 — meaningful pilot
Implement one continuously watchable 30–60s film sequence with actual rig/pose changes, deliberate cuts, sound and at least one human action. Render a playable MP4 and attach sample frames. If there is no image generation/rigging capability, provide a marked **animatic**, not a false “final”.

### Stage 3 — complete all three parts
Build shots in order, with voice/SFX, motion, edit continuity, subtitles and QC sheet. Keep each approved shot compositable, with consistent assets. Produce reviewed 16:9 master + 9:16 mobile cut.

### Stage 4 — premium integration and safety
Integrate a premium player in Mini App, add separate XTR invoice/entitlement model, protected media handling, refunds/support and accessibility. Do not touch existing map purchase semantics.

### Stage 5 — test and delivery
Run story tests, media probes, rendering reproducibility checks, responsive layout checks, production vs GitHub Pages auth/payments tests. Produce factual completion report, remaining blockers, screenshots and asset license inventory.

## Definition of done (do not claim prematurely)

- [ ] All three parts have a truthful screenplay and complete edited **video**.
- [ ] At least action-relevant portions feature genuine 2D character motion, not only background parallax.
- [ ] Protagonist face and costume remain consistent; no invented documentary details.
- [ ] Russian audio, subtitles, sound effects, music rights and playback QC complete.
- [ ] MP4 16:9 and portrait delivery evaluated in real Telegram WebView.
- [ ] Existing free reader and map-purchase behavior unaffected.
- [ ] Premium video cannot be downloaded via public website URLs without server authorization (recognize DRM/screen-recording limitations).
- [ ] Real Telegram Stars purchase, idempotency, access restoration, failed payment and refund handling tested on configured deployment.
- [ ] Automated tests/builds pass; no fabricated test results or tool connections.

## Reporting instructions

Every Codex handoff must state: (1) changed files, (2) actual runnable commands, (3) verified outcomes, (4) what is ONLY planned/placeholder/animatic, (5) assets missing or permissions needed, (6) next concrete implementation step. No “everything is ready” unless the finished video was actually rendered and inspected.
