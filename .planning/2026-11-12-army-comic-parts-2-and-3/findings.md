# Findings & Decisions

## Requirements
- Improve the quality of the project's current images.
- Use a consistent, simple, humorous army-comic style.
- Create story parts 2 and 3 from the supplied account of 25 November 1990 at the distribution point.
- Keep the tone warm and funny, while preserving the actual sequence of events.
- Preserve user files and save generated assets inside the project.

## Research Findings
- The project is a mobile-first Telegram Mini App. Part 1 has 9 scenes; parts 2 and 3 are placeholders and unpublished.
- Existing WebP art is 840x1120 portrait, dark dramatic graphic-novel style with blurred top/bottom padding. It is visually polished but not the simpler humorous army-cartoon tone requested.
- Existing content engine blocks advancing from a `part_end`; implementation must add a safe transition to the next published part.
- The supplied story naturally splits into: Part 2 — the marine officer's taekwondo test and two sparring rounds; Part 3 — the offer, evening refusal, returned documents, and missed diver-training departure.
- Existing cover and enlist art establish the protagonist as a dark-haired young man; new art should preserve that recognizable character while simplifying the drawing style.
- Commissariat and train art contain large blurred filler bands and inconsistent chronology (the train passengers are already shown as sailors). New assets should be full-frame portrait illustrations; train passengers should still look like conscripts/recruits.
- Harbor and submarine art repeat the same dramatic close-up and the same blurred filler. They should become clean full-height portrait compositions, with the submarine kept generic and without a model or hull number.
- Planned refreshed art: cover, enlist/commissariat, draft paper, train, Sevastopol arrival, and a generic submarine. Planned new art: officer interview, sparring, evening decision, and missed diver group/finale.
- Visual continuity: same dark-haired 19-year-old protagonist; simple expressive faces, slightly exaggerated gestures, warm paper texture, navy/red/cream palette, Soviet-era 1990 details, no embedded text, no logos, no watermarks.
- Part 2 beats: 25 November distribution point; captain-lieutenant asks about taekwondo; barracks sparring; protagonist knocks him down; deliberately loses the second round; officer says the exam is passed.
- Part 3 beats: offer to join; evening request for an answer; humorous inner thought about enough fights and harsh hazing; refusal; documents returned; headquarters says diver-training group already left; wait for next assignment.
- Generated 11 consistent full-frame WebP illustrations at 1086x1448 in `public/assets/comic-v2/`; total size is about 4.9 MB.
- The draft-office illustration initially rendered an English calendar; a targeted edit removed all text and replaced it with a plain red star.

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| Built-in image generation/editing | Required by the imagegen skill for raster illustration work. |
| Inspect repository before choosing which assets to replace | The request says "all photos" and the project already contains mixed SVG/WebP assets. |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| `magick` and `convert` montage commands are unavailable | Inspect assets directly with the built-in image viewer. |
| macOS `sips` cannot write WebP in this environment | Use the installed `cwebp` encoder at quality 88. |

## Resources
-
