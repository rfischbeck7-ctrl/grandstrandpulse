# Myrtle Beach Compass: project notes for Claude

Free Grand Strand things-to-do directory at myrtlebeachcompass.com. Airtable is the CMS, a Node script builds a static site, GitHub Pages hosts it. The owner is Ryan (rfischbeck7@gmail.com). Many requests arrive while he is away, so work unattended, publish when asked, and report briefly.

## How it fits together
- **Airtable base** `appS1KIy1m8mqqHRS` (free plan: ~1,000 records, 1,000 API calls/month). One table per category, all with the same fields: Name, Area, Type, Address, Phone, Website, Short Description, Google Maps Link, Photo, Photo Credit, Published. Mini Golf and Breweries have extra fields.
  - Mini Golf `tblh35nqRZGnU1otx`, Breweries & Wineries `tblfCWqeQJXxoV41f`, Nightlife & Clubs `tblMAJBdd6NimYMwK`, Thrill & Action `tblmNouOVNKOUa0xT`, Family & Indoor `tbl2Ar3oq6GXwSFsz`, Nature & Eco `tbl6Gr9WiBtwLN3cz`, Live Shows & Sports `tblMjwqnmSE6mASvN`, Historic & Cultural `tblNaT90OzXgVlbNv`.
  - Only rows with **Published** checked appear on the site. Airtable MCP tips: `typecast: true` creates new select options; use field IDs as keys when updating; single-selects take plain strings.
- **Site code**: `site.config.mjs` (categories, field mapping, areas), `scripts/fetch-airtable.mjs` (writes `data/<slug>.airtable.json`), `scripts/build.mjs` (writes `dist/`), `scripts/art.mjs` (placeholder art), `public/assets/styles.css`.
- **Deploy**: `.github/workflows/deploy.yml` runs nightly (09:15 UTC), on every push, and on manual dispatch. It fetches Airtable with a read-only token, commits fresh data snapshots, builds, and publishes to Pages. So an Airtable edit goes live by the next nightly run, or immediately via:
  `gh api -X POST repos/rfischbeck7-ctrl/grandstrandpulse/actions/workflows/deploy.yml/dispatches -f ref=main`
  Check with `gh run list --repo rfischbeck7-ctrl/grandstrandpulse`. A deploy takes ~6-8 minutes. The bot commits snapshots, so always `git pull --rebase origin main` before pushing.
- Directions links fall back to a Google Maps search from name + address when the Google Maps Link field is empty.

## Placeholder art (added Nov 2026)
- Every listing **without a photo** gets a generated flat retro-poster illustration (400x240 SVG, sunset gradients, no faces, no outlines, beachy). It is written to `dist/art/<category>/<slug>.svg` and shown on list and detail pages.
- **A real photo uploaded to the Photo field in Airtable always wins**; the art disappears for that listing automatically.
- `scripts/art.mjs` picks a scene from the listing's name, type and description using the `RULES` keyword list (first match on name/type, then on the full text). Category fallbacks apply if nothing matches. Variants within a theme are chosen by a hash of the name, so similar listings differ.
- To fix a wrong picture: add or reorder a rule in `RULES` (order matters; specific rules go first), or add a new scene function in the `S` object. Preview with a Playwright contact sheet of `dist/art` before pushing.
- Gotchas: always quote SVG attributes; keep gradient ids unique per file (each SVG is loaded as an `<img>`, so ids don't clash on the page).
- **Ryan's rule: every business gets its own distinct artwork, nothing may look close to another listing.** Tone: warm Myrtle Beach vacation colors (sunset, golden-hour, dawn, coral, pastel, aqua skies by day; warm dusk/plum/neon at night), teal water, sand, palms, coral-pink accents. No hue-rotation tricks (they turned skies green and oceans pink).
- `CUSTOM` in `scripts/art.mjs` holds one-off scenes keyed by listing name (or `category/name` when a name exists in two categories, e.g. AlleyOops). Theaters have their own curtain color + prop (`THEATER_PROPS`/`THEATER_CURTAIN`). Anything left on the generic themes gets a different sky and mirrored layout per listing (`varyWithinTheme`).
- Before pushing art changes, run a duplicate check: render every `dist/art` SVG to 80x48 with `rsvg-convert` and compare mean pixel difference pairwise (numpy). Nov 6 baseline: no pair below 0.045. Then eyeball an 8-wide `montage` contact sheet. A new listing on a generic theme should get its own `CUSTOM` scene if it lands close to another.

## Content status
- 134 listings published across 8 categories (mini golf 34, breweries 14, nightlife 15, thrill 15, family-indoor 15, nature 16, live shows 16, historic 9).
- Unpublished and **set aside by Ryan (Nov 6): ignore these, don't raise them as follow-ups:** Go Ape, Adrenaline Adventure Zipline, Rover Boat Tours, Crocodile Rocks, Master's Club, Club Vybe, Carolina Improv, Hot Fish Club. (Funplex and Ripley's Believe It or Not! are also unpublished in Airtable.)
- Rules we follow: don't invent businesses or addresses; use the business's own website for phones and addresses; leave a listing unpublished if it can't be verified.
- No restaurants yet (shown as "coming soon").

## Open follow-ups (not yet requested)
- Photo-request emails to breweries, wineries and newer venues (drafts only; never send without asking).
- Fill phone/website gaps.
- Home-page Georgetown map pin quirk; README and config comments still say "Grand Strand Pulse".
- Unconfirmed Broadway Grand Prix contact email.

## Working rules
- Sending email, publishing public content, or deleting data needs the user's go-ahead in chat. Ryan has pre-approved publishing the site art and (Nov 6) gave authority to update the website; anything else, ask.
- The sandbox shell has no general internet access (use WebFetch/WebSearch for research), package installs are blocked, and WebFetch caches ~15 minutes, so verify deploys through the git data snapshots or `gh run`.
