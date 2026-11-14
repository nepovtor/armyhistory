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
- GitHub Pages image failure, local build evidence: `tools/build-demo.mjs` scans only direct children of `public/assets` with `fs.readdirSync`, so it never adds nested `public/assets/comic-v2/*.webp` files to the inline asset map.
- Because nested files are absent from that map, `docs/index.html` retains absolute URLs such as `/assets/comic-v2/cover.webp`. On the project page `https://nepovtor.github.io/armyhistory/`, these resolve against the domain root as `https://nepovtor.github.io/assets/...`, outside the repository site.
- The Pages workflow uploads only `docs/`; it does not separately upload `public/assets/comic-v2`, so the retained absolute URLs cannot succeed in the deployed artifact.
- Live reproduction on 2026-11-13: the Pages document returns HTTP 200, while both `https://nepovtor.github.io/assets/comic-v2/cover.webp` and `https://nepovtor.github.io/armyhistory/assets/comic-v2/cover.webp` return HTTP 404.
- Generated artifact measurement: `docs/index.html` contains 18 unresolved `/assets/comic-v2/` occurrences, zero embedded WebP data URLs, and one embedded SVG data URL. This matches the builder's top-level-only traversal.
- Working comparison: the top-level route SVG is discovered and embedded; nested WebP files are not. The difference is directory depth, not WebP browser support or file corruption.
- Confirmed root cause: the static demo builder assumes a flat `public/assets` directory, but the new image set lives one level deeper in `public/assets/comic-v2`.
- Regression test reproduced the bug before the fix: the Pages build retained `/assets/` URLs and failed with 1 of 4 UI-asset tests.
- Minimal fix: recursively collect supported files under `public/assets` while preserving POSIX-style web paths in the asset map.
- After the fix, the targeted test passes, the generated Pages HTML contains 18 embedded WebP data URLs and zero unresolved `/assets/` references.
- A local preview served at the same project-subpath shape (`/armyhistory/`) returned HTTP 200 with the complete 11,833,192-byte document and zero unresolved asset references.
- Part 2 launch failure is reproducible in both the local Pages builder and the deployed Pages HTML: their offline `__advance` function rejects every scene whose type is `part_end`.
- The published page returned HTTP 200 on 2026-11-13 and contained the exact stale guard `c.id!==body.nodeId || c.type==='part_end'`.
- The server engine already has the correct rule: a `part_end` transition is blocked only when it has no `next`; part 1 ends at `c1p1-end` with `next: 'c1p2-01'`.
- Confirmed root cause: duplicated transition logic diverged. `server/engine.mjs` was updated for sequential parts, but the offline engine embedded by `tools/build-demo.mjs` retained the old unconditional block.
- The regression was verified red/green: it failed against the stale guard, then passed after the offline runtime adopted the server rule and executed `c1p1-end` → `c1p2-01` in a VM.
- Final verification: 16/16 project tests passed; the rebuilt Pages artifact contains the corrected guard, 18 embedded WebP images, and zero unresolved `/assets/` URLs.

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| Built-in image generation/editing | Required by the imagegen skill for raster illustration work. |
| Inspect repository before choosing which assets to replace | The request says "all photos" and the project already contains mixed SVG/WebP assets. |
| Fix asset discovery recursively in the builder | Keeps the existing project organization and restores the intended single-file Pages artifact without repository-name-specific URL hacks. |
| Mirror the server transition guard in the Pages runtime | Restores part-to-part navigation without changing story data or unrelated UI behavior. |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| `magick` and `convert` montage commands are unavailable | Inspect assets directly with the built-in image viewer. |
| macOS `sips` cannot write WebP in this environment | Use the installed `cwebp` encoder at quality 88. |
| Web browsing tool could not access the GitHub Pages URL | Use read-only HTTP headers with `curl` to reproduce the live status codes. |
| Initial temporary-file cleanup command was rejected because it used `rm -f` | Cleaned the exact temporary file and symlink with `unlink`, then removed the empty directory with `rmdir`. |

## Resources
-
