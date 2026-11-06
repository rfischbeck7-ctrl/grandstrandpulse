# Myrtle Beach Compass: project notes for Claude

Free Grand Strand things-to-do directory at myrtlebeachcompass.com. Airtable is the CMS, a Node script builds a static site, GitHub Pages hosts it. The owner is Ryan (rfischbeck7@gmail.com). Many requests arrive while he is away, so work unattended, publish when asked, and report briefly.

## How it fits together
- **Airtable base** `appS1KIy1m8mqqHRS` (free plan: ~1,000 records, 1,000 API calls/month). One table per category, all with the same fields: Name, Area, Type, Address, Phone, Website, Short Description, Google Maps Link, Photo, Photo Credit, Published. Mini Golf and Breweries have extra fields.
  - Mini Golf `tblh35nqRZGnU1otx`, Fishing & Piers `tbleE4cFslMOfbrVu` (added Nov 6), Breweries & Wineries `tblfCWqeQJXxoV41f`, Nightlife & Clubs `tblMAJBdd6NimYMwK`, Thrill & Action `tblmNouOVNKOUa0xT`, Family & Indoor `tbl2Ar3oq6GXwSFsz`, Nature & Eco `tbl6Gr9WiBtwLN3cz`, Live Shows & Sports `tblMjwqnmSE6mASvN`, Historic & Cultural `tblNaT90OzXgVlbNv`.
  - Only rows with **Published** checked appear on the site. Airtable MCP tips: `typecast: true` creates new select options; use field IDs as keys when updating; single-selects take plain strings.
- **Site code**: `site.config.mjs` (categories, field mapping, areas), `scripts/fetch-airtable.mjs` (writes `data/<slug>.airtable.json`), `scripts/build.mjs` (writes `dist/`), `scripts/art.mjs` (placeholder art), `public/assets/styles.css`.
- **Deploy**: `.github/workflows/deploy.yml` runs nightly (09:15 UTC), on every push, and on manual dispatch. It fetches Airtable with a read-only token, commits fresh data snapshots, builds, and publishes to Pages. So an Airtable edit goes live by the next nightly run, or immediately via:
  `gh api -X POST repos/rfischbeck7-ctrl/grandstrandpulse/actions/workflows/deploy.yml/dispatches -f ref=main`
  Check with `gh run list --repo rfischbeck7-ctrl/grandstrandpulse`. A deploy takes ~6-8 minutes. The bot commits snapshots, so always `git pull --rebase origin main` before pushing.
- Directions links fall back to a Google Maps search from name + address when the Google Maps Link field is empty.

## Design (cleaned up Nov 6, 2026)
- Header: brand on one row, all 11 categories on one row below (scrolls sideways on phones).
- Home: ocean-colored hero (headline, "Browse N places" button, static coastline map with total listings per area), then a "Pick your kind of fun" grid of 11 category cards, then "Coming soon". No badges, no eyebrow labels.
- **Each category has its own colors** in `site.config.mjs` (`theme: { a, b, tint }`): a/b color the header band on that category's page and on every listing page in it; tint is the page background. Also `blurb` (home card text) and `cover` (listing whose art or photo shows on the home card).
  Mini golf green, breweries amber/wine, nightlife plum, thrill coral, family indigo, nature sage, live shows velvet red, historic brick.
- Listing pages: name, type/area and buttons sit in the colored band with a "← Category" link; "More <category> in <area>" at the bottom.
- Ryan wants it professional but fun and friendly: avoid gimmicky labels, overpromises ("checked in person") or text that doesn't fit where it sits.
- Preview: `node scripts/build.mjs`, `PORT=8080 node scripts/serve.mjs`, then Playwright screenshots at 1280 and 390 wide.

## Visitor details (added Nov 6, 2026)
- Every table has: **Hours** (one line per day group, 24h: `Daily 09:00-23:00`, `Mon-Thu 16:00-22:00`, `Sun Closed`, `Sun Call` = not posted, past midnight OK), **Hours Note**, **Price**, **Price Level** (Free/$/$$/$$$), **Good to Know** (multi-select), **Details Source** (URL), **Details Checked** (date). New tables need the same fields.
- `scripts/hours.mjs` parses Hours (build warns and skips a line it can't read). The site shows a weekly hours table (today highlighted), an Open now / Closed badge worked out in Eastern time in the browser, an "Open now" filter on category pages, price, Good-to-know chips, and Google + Yelp review buttons (links only; never copy ratings: against their terms and goes stale).
- Rule: hours and prices only from the business's own site (or SC Parks for state parks); leave blank if not stated. Many off-season hours aren't posted, so Hours Note says "call ahead".
- Nov 6 pass: 72 of the original 134 listings filled. Not yet done: all nightlife spots, most live shows, small mini golf courses with no official site, and every listing added on Nov 6 (Fishing & piers etc.). Sites that block automated reading: Carolina Vineyards, Crooked Hammock, Snake River, Black Pearl, Capt. Dick's, Children's Museum of SC.
- Runaway Bay Miniature Golf closed permanently (unpublished Nov 6). Snake River Golf: conflicting reports (defunct vs revived); verify.
- A duplicate "Myrtle Beach Art Museum" record (rec9rfmDaz0mcWIDp) was created by mistake and unpublished; safe to delete.
- Added Nov 6: **Golf courses** (table Golf Courses `tblq22Z2f9YBZoKkO`, 16 courses) and **Beaches** (table `tbl7jPW1l49fiufTl`, 6 beaches), 11 categories total. Live Shows is now "Concerts, shows & movies" with House of Blues Myrtle Beach and Cinemark Myrtle Beach. Hours/prices for these are mostly blank (courses: tee times on each site). Other cinemas not verified.

## Placeholder art (added Nov 2026)
- Every listing **without a photo** gets a generated flat retro-poster illustration (400x240 SVG, sunset gradients, no faces, no outlines, beachy). It is written to `dist/art/<category>/<slug>.svg` and shown on list and detail pages.
- **A real photo uploaded to the Photo field in Airtable always wins**; the art disappears for that listing automatically.
- `scripts/art.mjs` picks a scene from the listing's name, type and description using the `RULES` keyword list (first match on name/type, then on the full text). Category fallbacks apply if nothing matches. Variants within a theme are chosen by a hash of the name, so similar listings differ.
- To fix a wrong picture: add or reorder a rule in `RULES` (order matters; specific rules go first), or add a new scene function in the `S` object. Preview with a Playwright contact sheet of `dist/art` before pushing.
- Art is animated with CSS inside each SVG (only the rules a picture uses are included). Helpers in `scripts/art.mjs` are wrapped by `anim(..., "class")` so boats/ships bob, dolphins leap, fish swim, disco balls swing with flashing tiles, neon rings flash, torch/lava flames flicker, Ferris wheels turn, string lights twinkle, flags wave, smoke rises, palms sway, waves roll, clouds drift, suns pulse, birds fly, stars twinkle. Classes live in the `ANIM` map; `prefers-reduced-motion` turns everything off. Rule: never put a CSS transform on an element that already has a `transform` attribute; wrap it. Wrapped helper originals are named `__name`. Pictures with no tagged parts get twinkling stars and a gliding bird as a fallback. To animate a new CUSTOM motif, build it from the wrapped helpers or add a class + `ANIM` rule.
- Gotchas: always quote SVG attributes; keep gradient ids unique per file (each SVG is loaded as an `<img>`, so ids don't clash on the page).
- **Ryan's rule: every business gets its own distinct artwork, nothing may look close to another listing.** Tone: warm Myrtle Beach vacation colors (sunset, golden-hour, dawn, coral, pastel, aqua skies by day; warm dusk/plum/neon at night), teal water, sand, palms, coral-pink accents. No hue-rotation tricks (they turned skies green and oceans pink).
- `CUSTOM` in `scripts/art.mjs` holds one-off scenes keyed by listing name (or `category/name` when a name exists in two categories, e.g. AlleyOops). Theaters have their own curtain color + prop (`THEATER_PROPS`/`THEATER_CURTAIN`). Anything left on the generic themes gets a different sky and mirrored layout per listing (`varyWithinTheme`).
- Before pushing art changes, run a duplicate check: render every `dist/art` SVG to 80x48 with `rsvg-convert` and compare mean pixel difference pairwise (numpy). Nov 6 baseline: no pair below 0.045. Then eyeball an 8-wide `montage` contact sheet. A new listing on a generic theme should get its own `CUSTOM` scene if it lands close to another.

## Site features (beyond category pages)
- Site-wide search (`/search/`, client-side over `/search-index.json`), area hubs (`/areas/<area>/`), themed guides (`/guides/<slug>/`, defined by the `guides` rules in `scripts/build.mjs`), About, Privacy (mentions AdSense cookies and Google Fonts; update if analytics or forms are added), Add-or-fix-a-listing (mailto template), Share button, BreadcrumbList/ItemList/typed schema.org markup, Open Graph + Twitter cards (`public/og.png`), sitemap includes all of these.
- Saved places: heart buttons are added by `public/assets/app.js` to every card and detail page; the list lives in the visitor's own browser (localStorage `mbc-saved`) and shows on `/saved/`. No upkeep.
- JS gotcha: one uncaught error in `app.js` stops every script after it. Filter groups are `.chips[data-filter]` only (the "Open now" chip row has no legend).
- Ideas not built yet (all need upkeep, an account or data): events calendar, newsletter signup, map pins (needs coordinates per listing), visitor ratings/reviews (moderation).

## Content status
- ~177 listings published across 11 categories (154 across 9 before golf/beaches/venues) after the Nov 6 additions (new **Fishing & piers** category: 4 piers + 2 charters; plus Shark Wake Park, Action Water Sportz, Inlet Point Plantation horseback, Great Escapes Kayaking, Visit Murrells Inlet eco cruises, Wild Woods Farm, EdVenture, Interactive Experience Unleashed, Pinball Museum, Ripley's Believe It or Not!, Art Museum, Wheels of Yesteryear, Colored School Museum, Serial Killers: The Experience).
- Unpublished and **set aside by Ryan (Nov 6): ignore these, don't raise them as follow-ups:** Go Ape, Adrenaline Adventure Zipline, Rover Boat Tours, Crocodile Rocks, Master's Club, Club Vybe, Carolina Improv, Hot Fish Club. Funplex is **closed for good** (its own site says so) and stays unpublished. Also closed: Wild Water & Wheels (Surfside). Not yet added because current details couldn't be confirmed: Springmaid Pier, Warbird Park, Waccatee Zoo, Hurricane Fleet, Surf's Up laser tag; Thompson Farm is seasonal (closed after Nov 1). Laser tag is already covered by WonderWorks, Fun Warehouse and Stars and Strikes.
- Rules we follow: don't invent businesses or addresses; use the business's own website for phones and addresses; leave a listing unpublished if it can't be verified.
- **Things to do only (Ryan, Nov 6): no restaurants, bars or shopping categories.** The existing Nightlife and Breweries categories stay.

## Open follow-ups (not yet requested)
- Photo-request emails to breweries, wineries and newer venues (drafts only; never send without asking).
- Fill phone/website gaps.
- Unconfirmed Broadway Grand Prix contact email.

## Working rules
- Sending email, publishing public content, or deleting data needs the user's go-ahead in chat. Ryan has pre-approved publishing the site art and (Nov 6) gave authority to update the website; anything else, ask.
- The sandbox shell has no general internet access (use WebFetch/WebSearch for research), package installs are blocked, and WebFetch caches ~15 minutes, so verify deploys through the git data snapshots or `gh run`.
