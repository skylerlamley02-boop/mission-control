# LPE-GM Mission Control Site

Static HTML/CSS/JS per Project-Specification-Rev-B.md Section 4 and Development-Plan.md Phase 4 —
no server, no database, no build step. Opened via the NTAG215 NFC tap.

## What's draft vs. real
The industrial HMI/SCADA styling, the config-driven personalization pattern (Section 9 — one site,
per-unit content via `units.json`, no code changes between units), and the general shape (personnel
record, mission objectives, a hidden/service menu) are built. `units.json` now has real content for
all 3 units (Jake/Best Man, Alex/Groomsman, Ben/Groomsman, wedding date 10.20.2028) — see
[../Engineering-Log.md](../Engineering-Log.md). The **hidden menu** trigger (5 taps on the small dot
in the footer within 3 seconds) — not a spec'd mechanism, just a reasonable one; swap it for whatever
Rev A actually specified if that turns up.

## Hidden switch-puzzle clue + per-groomsman link
Each unit's entry in `units.json` has three puzzle-related fields:
- `puzzleClue` — the cryptic riddle text about the order-sensitive switch mechanic. Currently
  identical across all 3 units (same physical puzzle mechanic on every build), shown inside the
  hidden service menu under "AUX CHANNEL — RECOVERED FRAGMENT."
- `puzzleLinkUrl` — **currently blank for all 3 units on purpose.** Each groomsman gets a different
  destination once solved, so only Skyler fills these in.
- `puzzleLinkText` — the clickable link's visible text, defaults to "CLICK HERE TO SOLVE PUZZLE."

**To add Jake's, Alex's, or Ben's link:** open `units.json`, find that unit's block
(`LPE-GM-001` = Jake, `LPE-GM-002` = Alex, `LPE-GM-003` = Ben), and paste the real URL between the
quotes on that unit's `puzzleLinkUrl` line, e.g.:
```json
"puzzleLinkUrl": "https://your-actual-destination.example",
```
Save the file, then redeploy (re-upload `units.json` to the GitHub repo, or `git push` — see
Deploying section below; GitHub Pages picks it up within a minute or two). No HTML/CSS/JS changes
needed — the page automatically renders the link once the URL is non-empty, and shows
`[ CHANNEL NOT YET PATCHED ]` (inert, unclickable) for any unit still blank.

**Discovery flow (by design, "layered"):** the main screen shows no obvious mention of a puzzle. A
few seconds after load, a dim, easy-to-miss line appears under SYSTEM STATUS
("ANOMALY: UNSCHEDULED SIGNAL ON AUX CHANNEL...") — the only hint anything is hidden. It doesn't
explain how to open the hidden menu; they have to find the small dot in the footer and tap it 5
times within 3 seconds (same existing gesture as the personal message). Inside, the riddle and the
link both live under "AUX CHANNEL — RECOVERED FRAGMENT."

## Local preview
Opening `index.html` directly (double-click / `file://`) mostly works — it falls back to inline
placeholder data since browsers block `fetch()` of local JSON over `file://`. To see the real
`units.json`-driven behavior (and to test `?unit=LPE-GM-002` style personalization), serve the
folder over HTTP instead, e.g. `npx serve` or `python -m http.server` from this directory, then open
`http://localhost:<port>/?unit=LPE-GM-001`.

## Deploying to GitHub Pages (Development-Plan.md Phase 4)
**No git or command-line experience required** — GitHub's website supports drag-and-drop upload.
Full first-time walkthrough: [../Assembly-Guide.md](../Assembly-Guide.md) Part 0.5, Step 0.5.9.
Quick version:
1. Create a free account at [github.com](https://github.com) if you don't already have one.
2. **+ → New repository** (top right of any GitHub page). Name it (e.g. `mission-control`), keep it
   **Public** (required for the free Pages URL), **Create repository**.
3. On the new repo page: **Add file → Upload files**, drag in this `site/` folder's contents
   (`index.html`, `style.css`, `script.js`, `units.json` — the files, not the folder itself; or use a
   `/docs` subfolder if you prefer, matching whatever you pick in step 4). **Commit changes**. (If
   you already use Git/GitHub Desktop, `git push` to the repo works identically.)
4. Repo **Settings → Pages** → under "Build and deployment," Source: **Deploy from a branch** →
   Branch: `main` / `(root)` (or `/docs`, matching step 3) → **Save**. GitHub shows the live URL
   after a minute or two: `https://<username>.github.io/<repo>/` (or `.../mission-control/` if
   that's the repo name, matching Spec Section 4's example).
5. Update **both**:
   - `firmware/config.h`'s `Personalization::MISSION_URL` (cosmetic/reference only — the ESP32
     doesn't do anything with this URL itself, it's just kept in sync for whoever's reading the
     firmware later)
   - The NTAG215 sticker's actual programmed URL — install **NFC Tools** (free:
     [iOS](https://apps.apple.com/app/nfc-tools/id1252962749) /
     [Android](https://play.google.com/store/apps/details?id=wakdev.wdnfc)), open it, **Write → Add
     a record → URL/URI**, paste the site URL (per-unit format below), then hold the phone against
     the NTAG215 sticker to write it. Do this per Development-Plan.md Phase 4's exit criterion
     (confirm the tap opens the site on both iPhone and Android).
6. Per-unit links: point each groomsman's NFC sticker at `<pages-url>/?unit=LPE-GM-00N` so the one
   deployed site shows that unit's personnel/mission content — matches the "one site, config-driven"
   goal in Spec Section 9 instead of needing 3 separate deployments.
