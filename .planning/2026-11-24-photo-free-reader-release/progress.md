# Progress

2026-11-24: Inspected sources, app, engine, storage, payment/auth tests and deployment workflow. Baseline: npm test failed only on remaining old public portrait. Saved staged patch, unstaged patch, index and changed/untracked files under production/chapter01/private/workspace-backup/2026-11-24. Created feature/chapter1-photo-free and fetched origin.

Implemented 41 canonical scenes, reusable illustration placeholders, chapter navigation, accurate journal and final completion. Static build now embeds the same engine and omits private map assets. New tests first failed for empty content and missing static completion; after implementation npm test: 23/23 pass. npm run build:pages: pass. Documentation updated.

Final local verification: npm test 25/25 pass, including real HTTP traversal of all 41 scenes and production rejection of demo IDs. npm run build:pages passed; git diff --check passed. No public raster images; secret-pattern scan of 65 changed/new text files found no matches. ZIP contains 42 text prompt files and no images/video. Browser visual verification unavailable: CUA browser access host not connected. Main unchanged.

Staged diff check found original trailing spaces and final blank lines in two verbatim source archives. Preserved their bytes and added narrowly scoped .gitattributes whitespace rules; all other files keep normal whitespace checking. Canonical source SHA-256 values are covered by content tests.

Reconciled origin/main into the feature branch. Initial merge resolution still included two old add/add artwork paths; full test run detected them (24 pass, 1 fail). They were caught in a local intermediate merge commit because the shell did not stop on failure. Removed both in a follow-up commit; use fail-fast shell for dependent verification/commit commands. No remote publication occurred before correction.

Before remote push, object inventory found 313,847,951 bytes of historical blobs and 109 obsolete media blobs in unpublished feature ancestry. Preserved that working history in local backup/chapter1-photo-free-work-2026-11-24. Created a clean publication branch at origin/main and attached the already verified final index/tree without restoring obsolete files or rewriting/deleting old branch history. Only the final tree will be committed and pushed.

Published clean feature/chapter1-photo-free at c6976c7. Remote SHA verified with git ls-remote; main remains 5241a7f. New branch history contains 4,162,383 bytes of blobs and zero image/video/rig files. Opened https://github.com/nepovtor/armyhistory/pull/1; GitHub confirms OPEN, MERGEABLE, CLEAN. Local verification server stopped. No deployment, main merge or payment enablement performed. Remaining manual step: visual browser/Telegram WebView review.
