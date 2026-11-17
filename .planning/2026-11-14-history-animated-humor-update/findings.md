# Findings & Decisions

## Requirements
- Replacement package: integrate exactly 10 supplied WebP illustrations under `public/assets/chapter-1/` without changing their relative filenames.
- Use `reference/approved-protagonist.png` as the approved identity anchor; all 10 scenes must show the same face and features.
- Preserve the real memoir chronology, 1990–1993 Soviet Navy context, first-person voice, and all known facts.
- Restructure only Chapter 1 Part 1 into 10 sequential scenes: Minsk draft office; news of three years; departure; recruits on train; route map; arrival in Simferopol; first sleep in Simferopol; morning haircut; naval uniform; Sevastopol barracks.
- Scenes 01–07: civilian clothes, plain shirt, long hair, no telnyashka or uniform. Scene 08: haircut before uniform, plain shirt. Scene 09: short hair and naval uniform. Scene 10: lower bunk, ordinary clothes, no uniform.
- Part 1 starts 19 November 1990; do not invent time of day beyond confirmed facts, transport from Simferopol to Sevastopol, names, submarine identifiers, or extra dialogue.
- Preserve Parts 2–3 unchanged in factual structure and retain current branch/progress behavior.
- Keep the route map fully visible and uncropped; its copy must sit below or separately; retain useful tap-to-enlarge behavior.
- Redesign toward a lively, warm, lightly humorous naval graphic novel: navy/cream/red, paper and ink, tactile controls, stamps/rope/insignia used with restraint.
- Add lightweight bounce, reveal, parallax, CTA pulse, transitions, and reduced-motion support.
- Keep the app lightweight, mobile-friendly, readable in Telegram, and maintain map-payment behavior already present in the repository.
- Build and tests must pass; visual checks must cover phone, tablet, and desktop widths.
- Preserve local development, Telegram Mini App behavior, and the self-contained GitHub Pages demo.
- Captions and controls must be separate DOM blocks below images; no copy may cover scene artwork.

## Research Findings
- The ZIP contains a full project snapshot, two requirement files, and 11 new PNG illustrations (about 47.9 MB total archive size).
- Current repository already has newer Telegram Stars payment code and comic-v2 assets not fully represented in the archive snapshot.
- Existing client is dependency-free vanilla HTML/CSS/JS rendered into `#app`; server-provided story content drives reader scenes.
- Existing UI already has the intended navy/cream/red direction, but relies on gradients, shadows, emoji-like symbols, generic comic-v2 artwork, and a cramped reader panel.
- Existing route scene correctly separates the map from the story panel, but uses `/api/map`, limits map height to 40svh, and has no explicit enlargement interaction yet.
- Existing dirty work belongs to the user: README, another planning task, Telegram channel docs, and `public/assets/channel-avatar.png`; do not overwrite or include them in this task.
- All supplied narrative images are 1086×1448 portrait PNGs; the submarine and memorial are 1448×1086 landscape PNGs.
- The protagonist anchor is a deliberately composed character sheet with the same dark curly-haired man shown as recruit and sailor; it contains a baked-in `ГЛАВНЫЙ ГЕРОЙ` title and works best as profile/bonus/identity art rather than a generic scene.
- `рассвет_перед_призывом.png` matches the anchor closely: same face, haircut, brown civilian jacket and duffel bag at the draft office. It is suitable for the first two scenes and the Chapter 1 cover.
- The dealt design direction is `true-black-flat`, seed `1565156597`, adapted to the user-mandated navy/cream/red brand: flat tone steps, no resting shadows or gradients, media-led screens, readable controls, one red accent family.
- Direction deviations are intentional: keep navy (explicit user/brand requirement), retain Georgia for the memoir display voice, and use subtle view/scene entrances (explicit motion requirement for the story app). Inter is now bundled locally for interface text so CSP remains strict and the build stays autonomous.
- The replacement ZIP has 10 production WebP files (roughly 388–681 KB each), a 4.5 KB scene manifest, a 6 KB Russian integration brief, and an approved protagonist PNG.
- The new brief supersedes the previous map of Part 1: the memoir now includes Simferopol sleep, haircut, uniform issue, and a final Sevastopol lower-bunk scene.
- The route illustration remains protected through `/api/map`; its replacement asset should move to the private protected path or the demo builder must substitute it without exposing the paid file through a public URL.
- Visual review 01–02: both use the intended brown/navy/cream printed-comic treatment and civilian clothing with no telnyashka. Scene 01 shows a noticeably shorter, straighter haircut and a narrower face than scene 02's curly-haired protagonist; identity continuity needs comparison against the approved reference before claiming a match.
- Scene 02 clearly conveys the three-year news through posture and expression without baked-in narrative text; it is suitable for a separate caption block below the art.
- Approved reference uses the short-haired, straight-browed face seen most closely in scene 01. Scenes 02–03 use a curlier hairstyle and a more angular, graphic-novel face; they share a coherent pre-haircut version with each other but are not a pixel-close facial match to the reference.
- Scene 03 correctly shows civilian jacket and plain shirt at a Minsk railway platform, with no naval uniform or telnyashka and no text baked into the art.
- Scene 04 maintains the curly-haired pre-haircut version and separates the protagonist from the drinking recruits, matching the memoir detail without implying he drinks.
- Scene 05 is a clean portrait route illustration with three unlabeled red stops and a schematic red path. It must be displayed uncropped and paired with a DOM legend `Минск → Симферополь → Севастополь` plus wording that the route is schematic.
- Scene 06 keeps the civilian plain shirt and curly pre-haircut version at the Simferopol station; no unconfirmed onward transport is shown.
- Scene 07 clearly shows the first Simferopol sleep in ordinary clothes among many recruits, with no uniform or telnyashka. The image carries no overlaid text and supports a concise caption below.
- Scene 08 correctly shows the haircut in a plain shirt before uniform issue; the face transitions toward the approved short-haired reference without adding naval clothing too early.
- Scene 09 is visually identical to the approved protagonist portrait: short hair, pilotka, naval collar, and telnyashka. It is the strongest identity anchor for the post-haircut state.
- Scene 10 meets the explicit composition requirement: dark Sevastopol barracks, many bunks, protagonist on the lower bunk in a plain shirt without uniform. His hair reads slightly fuller than scene 09, but remains shorter than the 02–07 curls; this is a minor continuity caveat to report honestly rather than hide.
- Desktop home fold renders cleanly as a centered 560px Telegram reading column: the approved sailor portrait remains dominant, the large editorial wordmark is legible, and the first CTA enters before the fold.
- Desktop full-page capture confirms all three home actions and the chapter footer fit without overlap. The inspector's full-page composite repeats the narrow app column at capture boundaries, but each rendered instance is internally aligned and uncropped.
- Tablet fold keeps the portrait at a useful scale and exposes the primary CTA; no artwork, wordmark, or button text is clipped at 768px.
- Tablet full-page capture shows the complete menu and footer with consistent gutters. The large wordmark is an intentional editorial cover treatment rather than an app toolbar title, so the title-size warning is accepted.
- Mobile 390px fold is clean at the requested Telegram width: the approved portrait is uncropped, the title wraps nowhere, and the full primary CTA remains visible at the bottom of the viewport.
- Mobile full-page capture keeps all secondary actions at comfortable touch size and the footer separated from them. Cream and red remain intentional brand colours from the supplied brief, so the palette and colour-budget warnings are accepted.
- Live reader scene 01 renders media first with the caption and first-person copy in separate DOM blocks below it; the illustration is fully visible and controls remain reachable.
- Live route scene initially showed a broken image while its legend and copy rendered. Evidence: `/api/map` returned a valid 681,402-byte 1122×1402 WebP, the client converted it to a `blob:` URL, and the server CSP omitted `blob:` from `img-src`. The confirmed root cause is the CSP/client boundary, not the asset or entitlement response.
- After adding `blob:` only to `img-src`, the protected route image renders fully and uncropped; the route legend stays below the art and the narrative panel remains separate.
- The enlarged-map dialog opens with focus on its close button, preserves the complete portrait map in a scrollable region, and repeats the three-stop DOM legend outside the image.
- Bundling Inter exposed an offline-build regression: the asset collector accepted images only and applied replacements only to JavaScript. Extending it to `font/ttf` and replacing asset paths in CSS keeps the Pages demo fully self-contained.
- Live scenes 06–10 preserve the specified sequence and clothing transition. The final Sevastopol art clearly places the protagonist on the lower bunk in ordinary clothes, with copy and controls below the uncropped image.
- The journal still contained the stale phrase `второй ярус`; the new scene contract and spec both require a lower bunk. A focused regression test now rejects that phrase and requires the lower-bunk wording.

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| Use the supplied imagery as the dominant visual material | It is project-specific and the user explicitly provided it; no remote asset search is needed. |
| Preserve vanilla JS and server data contracts | Minimizes risk to authentication, payment, and progress persistence. |
| Add automated coverage for new asset names, map markup, chronology, and key accessibility/motion hooks | These are the acceptance criteria most likely to regress silently. |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| Existing planning state is ambiguous | Pin this task with `PLAN_ID=2026-11-14-history-animated-humor-update` on each planning command. |
| First multi-image preview exceeded the code-mode image output limit | Inspect supplied images one at a time and record observations after every two views. |

## Resources
- `/Users/nepovtor/Downloads/HIStory-full-project-animated-humor.zip`
- `HIStory-full-package/CODEX_PROMPT_FULL_REDESIGN_ANIMATED_HUMOR.txt` inside the archive
- `HIStory-full-package/new-assets/CODEX_PROMPT_HIStory_update.txt` inside the archive
- `/Users/nepovtor/Downloads/Telegram Desktop/HIStory-chapter1-10-webp-for-Codex.zip` (replacement package, 2026-11-15)
- `CODEX_INTEGRATION_PROMPT_RU.md` and `scene-manifest.json` inside the replacement package
