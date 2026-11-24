# Findings

- Starting HEAD bec2492 on feature/history-cinematic-chapter1; no active merge/rebase.
- Existing changes intentionally remove obsolete stories, images and film prototypes.
- Canonical script contains three parts; storyboard.json contains 41 scenes with matching full text, imageFile=null, animationFile=null.
- Existing renderer emits undefined image src when art is absent; chapter poster requires same fallback.
- Static preview has a 30-step rewind limit, incomplete part statuses and no completed flag.
- origin/main has seven art/text commits equivalent in purpose to local history; branch integration must preserve the content reset.
- Repository is public. Private images, backups, env and user database stay ignored.

- Canonical script and all 41 runtime texts match after whitespace normalization. Public artwork fields are null; no image requests are emitted for placeholders.
- HTTP: missing Telegram initData rejected; production ignores DEMO_MODE=1. Missing map GET/invoice return 404.
- Remote main changes only obsolete art mappings, art, old story, generated demo and corresponding old asset tests. Resolve integration against the corrected reader without restoring those assets.
- Visual browser check could not run because CUA host is unavailable.

- Publication branch is rebuilt from current origin/main with the final verified tree. Historical intermediate assets remain only in the existing local feature/backup branches, avoiding 314 MB of unnecessary public uploads.
