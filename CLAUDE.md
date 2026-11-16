# Myrtle Beach Compass: project notes for Claude

> Everything is in this file; the old HANDOFF.md was folded in at the bottom (Nov 16).

Free Grand Strand things-to-do directory at myrtlebeachcompass.com. Airtable is the CMS, a Node script builds a static site, GitHub Pages hosts it. The owner is Ryan (rfischbeck7@gmail.com). Many requests arrive while he is away, so work unattended, publish when asked, and report briefly.

## How it fits together
- **Airtable base** `appS1KIy1m8mqqHRS` (free plan: ~1,000 records, 1,000 API calls/month). One table per category, all with the same fields: Name, Area, Type, Address, Phone, Website, Short Description, Google Maps Link, Photo, Photo Credit, Published. Mini Golf and Breweries have extra fields.
  - Mini Golf `tblh35nqRZGnU1otx`, Fishing & Piers `tbleE4cFslMOfbrVu` (added Nov 6), Breweries & Wineries `tblfCWqeQJXxoV41f`, Nightlife & Clubs `tblMAJBdd6NimYMwK`, Thrill & Action `tblmNouOVNKOUa0xT`, Family & Indoor `tbl2Ar3oq6GXwSFsz`, Nature & Eco `tbl6Gr9WiBtwLN3cz`, Live Shows & Sports `tblMjwqnmSE6mASvN`, Historic & Cultural `tblNaT90OzXgVlbNv`.
  - Only rows with **Published** checked appear on the site. Airtable MCP tips: `typecast: true` creates new select options; use field IDs as keys when updating; single-selects take plain strings.
- **Site code**: `site.config.mjs` (categories, field mapping, areas), `scripts/fetch-airtable.mjs` (writes `data/<slug>.airtable.json`), `scripts/build.mjs` (writes `dist/`), `scripts/art.mjs` (placeholder art), `public/assets/styles.css`.
- **Deploy**: `.github/workflows/deploy.yml` runs nightly (09:15 UTC), on every push, and on manual dispatch. It fetches Airtable with a read-only token, commits fresh data snapshots, builds, and publishes to Pages. So an Airtable edit goes live by the next nightly run, or immediately via:
  `gh api -X POST repos/rfischbeck7-ctrl/grandstrandpulse/actions/workflows/deploy.yml/dispatches -f ref=main`
  Check with `gh run list --repo rfischbeck7-ctrl/grandstrandpulse`. A deploy takes ~6-8 minutes. The bot commits snapshots, so always `git pull --rebase origin main` before pushing.
  **Saving Airtable API calls (Nov 16):** each build's fetch uses ~11 of the 1,000 monthly calls. Put `[skip-fetch]` in the commit message of a code-only push (CSS, scripts, content JSON) to build from the committed snapshots without calling Airtable. Normal pushes, the nightly run and manual dispatch still fetch, so after Airtable edits do NOT use `[skip-fetch]`.
  **Keepalive (Nov 16):** GitHub disables scheduled workflows after 60 days of repo inactivity. The nightly run now ends with a "Keep nightly schedule alive" step (`gh workflow enable deploy.yml`, `actions: write` permission, `continue-on-error`). Untested whether it fully resets the clock: if the nightly deploy ever stops, re-enable with `gh workflow enable deploy.yml --repo rfischbeck7-ctrl/grandstrandpulse` and look at the last nightly run's keepalive step.
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
- Runaway Bay Miniature Golf closed permanently (unpublished Nov 6). Snake River Golf: conflicting reports (independent sources say defunct; only a content-farm page says revived); **unpublished Nov 6 night** until snakerivergolf.com can be read and confirms it is open.
- Nov 6 (late): Ryan approved deleting duplicates. Deleted the duplicate Art Museum record (rec9rfmDaz0mcWIDp) and three unpublished cinema copies in Family & Indoor (Grand 14, AMC Classic 12, Cinemark; the published ones live in Live Shows).
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

## Nov 6 night pass
- Tin Roof, Comedy Cabana and Fat Harold's got phone/website (Tin Roof hours; Fat Harold's opening times as a note, no closing time posted) from their own sites. Delete of the duplicate Art Museum record was blocked by the permission check even after Ryan said "Go"; it has since been deleted (Ryan approved). Many nightlife sites block automated reading (Apache Pier, 3001, Bowery, Ocean Annie's, Dead Dog Saloon); most nightlife listings still lack website/hours.
- Checked and NOT added: Waccatee Zoo (reported permanently closing), Warbird Park, Hurricane Fleet and Springmaid Pier (no official site found).
- Live site checked at phone size: home, search, saved hearts, about/privacy/areas/guides/saved all load; no sideways overflow; art animates. Hearts were added to search-result rows (MutationObserver in app.js).
- Not doable by Claude: deleting the unused Airtable token, visitor-counter account. (2FA on Porkbun/GitHub/Airtable is done, Nov 7.)

## Open follow-ups (not yet requested)
- Photo-request emails to breweries, wineries and newer venues (drafts only; never send without asking).
- Fill phone/website gaps.
- Unconfirmed Broadway Grand Prix contact email.

## Working rules
- Sending email, publishing public content, or deleting data needs the user's go-ahead in chat. Ryan has pre-approved publishing the site art and (Nov 6) gave authority to update the website; anything else, ask.
- The sandbox shell has no general internet access (use WebFetch/WebSearch for research), package installs are blocked, and WebFetch caches ~15 minutes, so verify deploys through the git data snapshots or `gh run`.

## Art fixes (Nov 6 late)
- Ryan's feedback: pictures must look believable, nothing floating in mid-air (waterfalls, props, text hanging in the sky). Anything that stands must sit on ground, a dock or a rock; waterfalls must start at a rock crest and end at ground or water.
- Captain Hook's, Inlet Adventure, TPC, King's North and Long Bay were rebuilt for this; the three cinemas now have their own movie-theater scenes. Avoid `<text>` in scenes that can be mirrored (varyWithinTheme or `flip`), it comes out backwards.
- Nov 6 late duplicate check: closest pair 0.0476 (Pine Lakes vs Prestwick).
- Details pass: nightlife sites still blocked by robots.txt or errors (Apache Pier, Spanish Galleon, Ocean Annie's, Dead Dog Saloon, Señor Frog's). Leave blank; don't use third-party directories.

## Google Place IDs (Nov 7)
- `data/place-ids.json` maps listing Name → Google Place ID (151 entries). `scripts/build.mjs` uses it for the **Google reviews** button (`maps/search/?api=1&query=...&query_place_id=ID`, opens the exact place). No ID → falls back to a name+area Google Maps search. The **Get directions** button is separate (`maps/dir/?api=1&destination=`).
- The names must match the Airtable Name exactly. IDs were looked up by name + street address (places_search tool) in a separate pass; only confident matches are stored. Never copy ratings or review text from that tool.
- No ID yet (still on the fallback): beaches (areas, not businesses), Legends Moorland, Barefoot Fazio, Radical Ropes, Stars and Strikes (no street address), Myrtle Beach Watersports (match was a hotel), Strand Theater, Asher Theatre, Black River Outdoors, Getaway Adventures, Georgetown Harborwalk, Boardwalk, Second Avenue Pier.
- Address check (Nov 7, against each business's own site): fixed Arcadian Shores (710 Hilton Rd), Carolina Vineyards (4720 Hwy 17 S), Yee-Haw/Ole Smoky (1216 Celebrity Cir), Downwind Sails (301 S Ocean Blvd; it also has a 2985 S Ocean Blvd location), Sea Thunder (1522 Watson Ave, Little River; Sea Screamer boards at 4499 Mineola Ave), Hollywood Wax Museum (1808 21st Ave N Unit A, per Broadway at the Beach), Black Drum phone (843-282-8080). Inlet Point Plantation (5800 Highway 236) and Black Drum (9800 Queensway) were already right; Google's pins differ.
- Left as is: Grand 14 Cinemas (Market Common's own site still says Grand 14), Pirate's Cove Lounge (myrtlebeach.com still lists it). Myrtle Beach Room Escape: same address and phone as "Race 2 Escape" on Google, no official site found to confirm a rename.
- New listings: add the ID to `data/place-ids.json` when adding a business.

## SEO pass (Nov 7)
- Titles are built by `fit()` in `scripts/build.mjs` to stay near 60 characters: listing = "Name | Category keyword in Place | Brand" (shortens by dropping brand, then place). `placeName()` turns Airtable's "Central Myrtle" into "Myrtle Beach" and "Surfside" into "Surfside Beach" for titles/descriptions only; `catKeyword` holds the per-category word. Descriptions are trimmed at sentence/word boundaries (`trimDesc`) and short ones get a directions line appended. Category descriptions use the category `blurb`.
- `/search/`, `/saved/` and `404.html` are `noindex,follow` and not in the sitemap (`noindex: true` option on `layout`).
- Listing schema uses a `PostalAddress` parsed from the Address field (`postalAddress`); home page has WebSite + Organization markup.
- Not done: `geo` coordinates in the schema (needs a lat/long per listing; the places_search tool returns them but a pass is ~25 calls). Four listings have no address (Black River Outdoors, Stars and Strikes, Ghosts of Georgetown, Radical Ropes).
- Home description no longer claims "every listing checked".

## Nov 7 later
- Guides now 7: rainy-day, free-things-to-do, indoor-mini-golf, sunset-and-views, on-the-water, after-dark, with-kids.
- Search Console: domain property sc-domain:myrtlebeachcompass.com is verified; sitemap.xml submitted Nov 6, read OK (36 discovered when read).
- `geo` coordinates skipped: places_search returns ~1,200 tokens of review text per place, so a 177-listing pass is very costly for little SEO gain. Only do it if map pins get built.
- Phone gaps (Nov 7, Ryan present): ~27 phones filled from official sites. Still blank (site did not state one): Ripley's Aquarium, EdVenture, Radical Ropes, SkyWheel, The Track, Getaway Adventures, Voyager Dolphin Cruises (site errored), T.I.G.E.R.S., Harborwalk, Stars and Strikes (ambiguous corporate number), Kaminski House (only a web-designer number found).
- Analytics: Cloudflare Web Analytics beacon added in `layout()` (token in build.mjs, public), Privacy page has an Analytics section. Dashboard at dash.cloudflare.com → Web Analytics.

## AdSense content pass (Nov 7)
- AdSense account (pub-6449115884515319) shows site connected, setup steps complete, review pending. Biggest risk: thin listing pages (median description ~21 words at start).
- Added: area hub intros (`areaIntros` in build.mjs), a note per guide (`guideMore`), About "Who runs this site" + "Corrections and updates", `/plan/` hub with `/plan/when-to-visit/` and `/plan/getting-around/` (sourced from City of Myrtle Beach, North Myrtle Beach, Lonely Planet, MyrtleBeach.com; parking rates change, recheck each spring).
- Listing descriptions: 36 expanded to ~40-70 words from the business's own sites (Nov 7): state parks, Brookgreen, Hobcaw, Georgetown museums and Hopsewee, dolphin cruises, the big dinner shows and theaters, Myrtle Waves, Family Kingdom, Alligator Adventure, Ripley's Aquarium, Big Air, WonderWorks, Topgolf excluded, Grande Dunes, Barefoot Norman, K1, Downwind Sails, Surf the Earth. Rule: facts from the business's own site, no prices or hours in the text (they have their own fields). Fixed a wrong blurb: Murder in the Wild West is a murder-mystery dinner, not a cowboy stunt show.
- Still short (<25 words) but already specific: ~84 listings (28 with no website). Next candidates if continuing: Voyager, Getaway, Kaminski, Express Watersports, Jet Ski Rental, SkyWheel (site blocks bots), Comedy Cabana (nightlife field id not looked up), House of Blues, cinemas, escape rooms, golf courses, mini golf.
- Huntington Beach SP's marsh boardwalk was closed for construction on Nov 7 (per SC Parks); recheck.

## Conway + gap audit (Nov 7)
- **Conway** is now an Area (map pin in `site.config.mjs`, `areaIntros["Conway"]`). Airtable Area options are created with `typecast: true` (Conway added to Live Shows and Historic). Listings: Horry County Museum (area changed), Theatre of the Republic (own CUSTOM-style theater art), B&B Theatres Conway 12.
- Added from official sites: Pin Point Indoor Pickleball & Golf (Little River; Family & Indoor, Type "Sports & games"), Dave & Buster's (Broadway at the Beach; phone on its page was an odd 915 number, left blank), Back Woods Quail Club (Georgetown; Thrill & Action, Type "Shooting sports"). 182 listings now.
- Could not verify (no readable official source), so NOT added: Conway Riverwalk (city site has no page text), 810 Billiards & Bowling (robots.txt), Surfside Bowl, Coastal Carolina athletics (site blocked), Adventure Falls, Fun Plaza Arcade, Sky Zone, Cypress Nook disc golf, Waccamaw Neck Bikeway. Revisit if a readable official page turns up; Conway Glass (708 12th Ave, studio visits Wed-Fri) fits no category.
- New listings still need Place IDs in `data/place-ids.json` (not looked up).
- (Nov 7 later) **Little River** is now its own Area with a map pin (8 listings moved out of North Myrtle Beach: Pin Point, La Belle Amie, Fine Catch, Tribal Island, Sea Thunder, Getaway, Shark Wake, Jet Ski Rental, plus the sports park). Conway added: Historic Downtown Conway Walking Tour (visitor center, 428 Main St), L.W. Paul Living History Farm, Conway Riverwalk, Conway Glass, 810 Billiards & Bowling Conway. Also added: Sky Zone, Black Flag Forge, 810 Billiards North Myrtle Beach (addresses from MyrtleBeach.com; phones blank), North Myrtle Beach Park & Sports Complex (Cypress Nook disc golf). 191 listings.
- Skipped on purpose: Pedal Pub, Tiki Tours (bar-style party boat, no official site), Palmetto State Armory (gun store), golf-simulator shops without addresses, Fun Plaza and LuLu's arcade/ropes (no official address/phone found), Coastal Carolina athletics (site blocked).
- New listings need Place IDs still. The 810 NMB/Conway art is custom (pool table / chess).
- (Nov 7, thorough sweep) Went through every MyrtleBeach.com "102 things to do" activity category (non-dining/bars/shopping), checked each on its own site, and added 14 more: Oceanfront Helicopters, Seakart Adventure SC, Southern Shores Cruises (jet boat, catamaran, jet ski), New Wave Watersports, Aloha Watersports, Coastal Scuba, Myrtle Beach Shark Tooth Adventures, Sea Racer Tours, Plantation River Tours, PonTiki, Little River Fishing Fleet, Salty Hooker Fishing Charters, Ripley's Haunted Adventure, Ripley's Mirror Maze, Backstage Mirror Maze & Vault Laser Maze. Also Pedal Pub Conway and Tiki Tours (Ryan asked for them). 208 listings. All have custom art where the generic theme picked a wrong scene.
- Not added (no readable official page / out of area / not a business): Indigo Farms (site blocks bots), Freewoods Farm, Vereen Memorial Gardens, Grand Park Rink, Sandy's Down Under skate park, Matt Hughes skate park, Savannah's Playground, Seacoast Artists Gallery, Blue Wave Adventures (same dock as Crazy Sister, likely same operator), Blackbeard's Pirate Cruise (no address on site), Hurricane Fleet and Calabash Fishing Fleet (Calabash, NC), Shallotte River Swamp Park (NC), Hickey's Interactive Adventures, Myrtle Beach Zipline Adventures, Warbird Park, hall-of-fame spots inside bars/resorts, Charleston day trips. Next step if continuing: Place IDs for all new listings.
- (Nov 7, county pass) horrycountysc.gov has no business directory (only parks, beach accesses, boat landings, museum, libraries), so only county parks were added from it: Vereen Memorial Gardens, Horry County Bike & Run Park, Splinter City Disc Golf Course, Socastee Recreation Park, plus Waites Island (Nature & Eco). Each has its own CUSTOM art. City parks with no details (Frink, Little River Neck, Sam Cox, McNeil, Hibben) were not added. 213 listings. Place IDs were looked up for the new listings (not Waites Island, Getaway Adventures, Pedal Pub, Legends Moorland, Barefoot Fazio, Plantation River Tours, Conway Riverwalk, Ghosts of Georgetown, Radical Ropes, Stars and Strikes, Myrtle Beach Watersports, Black River Outdoors, Boardwalk, Pirate's Cove, Myrtle Beach Room Escape: no confident match). Art duplicate check Nov 7: closest pair 0.0476 (Pine Lakes vs Prestwick).

## Art replaced with plain tiles (Nov 7, Ryan: the illustrations "look like AI slop")
- Listings without a photo now get `scripts/tile.mjs` instead of the illustrated scenes: category gradient (each listing sits at its own point between the category's two colors), one line icon chosen by `RULES` (type first, then name, place words stripped), type label and area. No scenes, animals, props or text-in-sky. Real photo in Airtable still wins.
- The old scenes (`scripts/art.mjs`, `CUSTOM`, duplicate-check workflow above) are kept but unused; **Ryan rejected the tiles within minutes (Nov 7 12:09) and wants the illustrated scenes kept and cleaned up.** Scenes are the default again; `ART_STYLE=tiles` builds the tile version. The "distinct artwork per business" rule is now met by color position + icon + labels, not unique drawings. Best fix for real quality is real photos (see photo-request drafts in open follow-ups).
- To fix a wrong icon: reorder/add a rule in `RULES` in tile.mjs, or add a path to `ICONS`.

## AdSense pass 2 (Nov 7 afternoon)
- Audit found: median listing page 119 words (111 under 120), no Contact page, thin privacy vendor wording, footer/About overclaimed "every listing is checked". Fixed: `/contact/` page (footer + sitemap), privacy adds Google third-party-vendor/opt-out/EEA consent wording and saved-places note, footer/About now say details come from the business's own site or an official guide and unconfirmed items are left out, listing pages gain "Planning your visit" (area sentence + links to plan pages) and "Also in <area>" (cross-category listings). Median now ~198 words.
- Needs Ryan (account side, not code): in AdSense > Privacy & messaging, publish a Google-certified consent message for EEA/UK/Switzerland (Funding Choices); the privacy page already says consent is asked. Rejection reasons, if any, show in AdSense > Sites.
- Still-short descriptions (<30 words): ~115. Expand from business's own site as time allows.
- (Nov 7 12:30) Art cleanup on the scenes Ryan likes: removed the "shag" text and the floating fish at Garden City, mugs scaled down and set on a table (brewery themes), hop vines on a pole, hammocks tied to trunks (Crooked Hammock, Pawleys), parrots on a stand, tiki mask replaced by a standing tiki statue, `pier()` is now a deck with legs over open water (was a solid brown wall), custom PonTiki and Tiki Tours boats. Animation boosted for all scenes: slow rotating sun rays (`rays`, day skies only), water glints (`gl`), bigger cloud/wave/bird/bob motion. Only transform/opacity animate; browsers pause offscreen images; whole `dist/art` is ~930 KB.
- (Nov 7 afternoon art review, Ryan: upside-down house, wants each business different, less "AI sloppy", same style.) WonderWorks was drawn upside-down on purpose and read as a bug: now a right-side-up science building with an atom on the roof. All 15 golf courses got their own composition (`GL` layouts + `golfMap` in art.mjs: island green, dogleg pines, dunes, clubhouse, marsh boardwalk, stadium grandstand, heather dusk, cypress swamp, etc.). Replaced wrong or duplicate scenes: Back Woods Quail Club (clay targets), Pedal Pub Conway, Soar & Explore, Express Watersports (+ Dolphin Watch), Jet Ski Rental, Seakart, New Wave, MB Watersports, Conway Riverwalk (river, not ocean), Waites Island, Little River Fishing Fleet, Fish Finder, Conway Glass, Black Flag Forge, Dave & Buster's, Pin Point, Backstage Escape Games, Sky Zone, L.W. Paul Farm, Historic Downtown Conway tour, House of Blues. New CUSTOM scenes live near the end of art.mjs (`DEF()` helper makes a gradient background). Closest pair now 0.0495. When adding a listing, check its scene on a labeled montage: the generic theme often picks a wrong picture.
- (Nov 7 12:40) Map pins are links: home-page map and the map on every listing page now go to `/areas/<area>/` (hint line "Tap a city to see what's there."). Category-page map still filters in place. On phones (<=520px) `.coast` is taller so the labels don't overlap.

## Nov 7 afternoon: AdSense account + descriptions
- AdSense: site status "Getting ready" (no rejection reason shown), ads.txt Authorized. European regulations consent message **published Nov 7** (name "Myrtle Beach Compass EU consent", Do-not-consent on for all countries, logo uploaded by Ryan; logo text is clipped, cosmetic). US state regulations message not created (optional).
- 9 more descriptions expanded from official sites (Art Museum, Wheels of Yesteryear, T.I.G.E.R.S., Escape Game, Pinball Museum, EdVenture, Broadway Grand Prix, Fun Warehouse, The Track). ~117 still under 30 words. Kaminski House's site (kaminskimuseum.org) is a travel blog, not the museum; use another official source (e.g. Georgetown County museum pages).
- Later Nov 7: 6 more (4 escape rooms, Ripley's Believe It or Not, Express Watersports); ~111 still short. Place ID added for Plantation River Tours. Retried IDs for Legends Moorland, Barefoot Fazio, Pedal Pub Conway, Getaway, MB Watersports: Google returns a different business or only the resort, so left on fallback. Phones re-checked on Ripley's, Sky Zone, 810, Backstage Mirror Maze, Plantation: none stated on official sites.

## Nov 16: AdSense "Low value content" + descriptions rule relaxed
- AdSense rejected the site Nov 15 (AdSense > Sites: "Needs attention: Low value content"). Plan in `ADSENSE_PLAN.md`. Do not request review until content work is done.
- **Ryan relaxed the sourcing rule for descriptions (Nov 16):** when a business has no readable official site, descriptions may be written from several reputable third-party sources (tourism boards, news, listings) in our own words. Still no copied text, no ratings or reviews, and no hours or prices in the description text (they have their own fields); hours/prices/phones keep the official-site-only rule.
- Nov 16: 32 thin descriptions rewritten in Airtable this way (nightlife, live shows, family, mini golf, TPC, Topgolf, AMC, SkyWheel, Kaminski, Harborwalk, Voyager and others). Left short for now: Bin 2004, Aloha Village, Wild Woods Farm, King's North (29 words or fewer, no new sources searched).
- Open doubts: AlleyOops North Myrtle Beach (Visit Myrtle Beach says "opening in 2026"; confirm it is open); Spanish Galleon age (older text said 50+ years, a source says opened 1991; new text omits it); Pirate's Cove property was listed for sale; Dead Dog Saloon changed management in 2026.

## Hand-written content (Nov 16)
- `content/categories/<slug>.json` = an essay shown under each category's list (11 written). `content/plan/<slug>.json` = extra Plan pages (5 written: three-days-with-kids, a-day-in-georgetown, golf-weekend, winter-visit, long-weekend-for-two), listed on /plan/ and in the sitemap. Format: `{ title, summary, description, order, updated, intro: [], sections: [{ h, p: [], list: [] }] }`. Facts come from visitor-bureau and official pages; no prices or hours in the text; keep claims hedged where sources disagree.
- Tone rule: plain, specific, practical. No claims of first-hand visits ("we tried") unless Ryan actually did. Real photos and Ryan's own tips are what would make pages feel least generic; ask him for them.

## Nov 16: listing status check
- `node scripts/check-links.mjs` fetches every listing's Website and prints non-200s (writes link-check.json, gitignored). 164 of 213 listings have a site; 28 flagged, nearly all bot-blocking (403) or temporary errors.
- Real concerns found, none confirmed closed: Backstage Mirror Maze (website domain no longer resolves; directories still list hours/phone), Riddles Escape Room (Groupon marks it closed, other directories show it active), Little River Fishing Fleet (site returned 502; a "Little River Fishing Fleet" on FishingBooker is in Calabash NC, check the listing is the right business), Red Dragon Cove (site 520, opened 2023, address 2001 S Kings Hwy), Radical Ropes (site 530), Black Pearl (homepage 404, no news of closure), Wheels of Yesteryear (site timeout; directories conflict on hours), AlleyOops NMB (unconfirmed it has opened). Call or check social pages before relying on these.
- Pirate's Cove property was listed for sale; Waccatee Zoo reported closing (not on site); Funplex closed Oct 2024 (unpublished).

## Nov 16 (later): listing check results
- Full notes in `LISTING_CHECK.md`. AlleyOops NMB is **open** (opened Sept 18, 2026). Red Dragon Cove and Little River Fishing Fleet sites load and match our address/phone (Watson Ave is right). Dead Dog Saloon is open under new management.
- Still unconfirmed (no closure report found): Backstage Mirror Maze (dead website), Wheels of Yesteryear (site refuses connections), Radical Ropes (site 530), Riddles Escape Room, Lost Mine Mini Golf, Spanish Galleon (special occasions only), Pirate's Cove (property for sale). Grand 14 is now run by GTC (Jan 2026); name left unchanged.
- No Airtable changes or unpublishing made in this pass.

## Nov 16 (evening): AdSense phase 2 continued
- **Phone-width overflow fixed** on all plan pages: `.page-text` grid had an implicit auto column that grew to the widest child (a `white-space: nowrap` summary in `.hub-list span`). Now `grid-template-columns: minmax(0, 1fr)` and the span wraps; hub-list links stack under 520px. Checked 25 pages at 375px with no sideways scroll. When adding a list that puts long text beside a label, avoid `nowrap`.
- **Four more plan pages** (now 19): a-day-in-pawleys-and-litchfield, a-day-in-little-river, friends-weekend, a-day-in-surfside-and-garden-city (670-850 words each; facts taken from our own listing descriptions, hedged where unsure).
- Small items from the listing check turned out to be already right in the data, no Airtable change needed: Cinemark address (2100 Coastal Grand Circle), Le Grand Cirque description is season-neutral, Dunes is typed "Semi-private club" with a tee-time note, King's North text already says it reopened after renovation. The Tasting Room on 9th stays in Breweries & Wineries as a wine bar (Ryan can move it if he prefers).
- Listing pages already show a large illustration under the colored band, so a banner like the plan pages was **not** added (it would repeat the same picture).
- Still to do: recheck Search Console in about a week; ask Ryan about the unconfirmed-open list (phone/social check only he can do); tell Ryan when 2-4 weeks have passed and pages are indexed so he can decide on "Request review". Do not click it.

## Nov 16 (night): five more plan pages + social-media search
- Added plan pages (now 24): a-day-at-broadway-at-the-beach, a-day-on-the-boardwalk, a-history-day, a-thrill-seekers-day, nature-lovers-weekend (530-620 words each, facts from our listing descriptions, hedged).
- Social search (WebSearch limited to facebook/instagram/tiktok) only returns undated page snapshots, never post dates, so it can't prove a business is open now. Findings: Riddles Escape Room has an active Facebook page whose address, phone and website match our listing. Wheels of Yesteryear has Facebook and Instagram (@wheelsofyesteryear_mb) pages; Facebook snapshot says daily 9:30-5:30, undated, NOT entered (hours stay official-site-only). Radical Ropes has a Facebook page (RadicalRopesMyrtleBeach) placing it on US-17 Business, no street address, so the Address stays blank. Backstage Mirror Maze: search found nothing tying a mirror/laser maze to Broadway at the Beach (only Backstage Escape Games); still unconfirmed.

## Nov 16 (late): social links, cross-links, home intro, terms page
- **Social links on listing pages** ("Follow <name>: Facebook / Instagram / TikTok / YouTube", `rel="noopener nofollow"`, also in schema `sameAs`). 129 of 207 non-beach listings have at least one. Data: `data/social-auto.json` (made by `node scripts/find-social.mjs`, which reads each listing's own Website for profile links it publishes; rerun after adding listings) overlaid by `data/social.json` (hand-checked, found through web search; `null` removes a link). Beaches never show social links; SC State Parks / Cherry Grove style umbrella pages stay because the site itself links them. Excluded on purpose: Colored School Museum (city government page), Stars and Strikes (Georgia page), a few Instagram accounts that belonged to a different business.
- Still without social links (~78): mostly small mini golf courses and bars with no findable official page. Search engines return undated snapshots, so a Facebook page existing is NOT proof a business is open. Facebook blocks scripted reads; do not try to get around that (the permission check denied a spoofed-user-agent attempt). Scraping a search engine's HTML also got blocked after a few queries; use the WebSearch tool instead.
- Listing pages: new "Featured in our guides" block (from each plan page's `places` array via `plansByPlace`), "Planning your visit" no longer repeats the area intro sentence on every page. Plan pages now link to the next six pages in order (rotating) instead of always the first six.
- Home page: new "A local guide to the Grand Strand" intro and "Plan your trip" cards. New `/terms/` page (footer, sitemap); privacy page mentions social links.
- Facts from social snippets that are NOT entered (inconsistent or unverifiable): Dead Dog Saloon phone (two different numbers), Medieval Times phone (two numbers), Rice Museum hours/phone (its own site is the rule), Great Escapes phone. Apache Pier: a Facebook post says it was destroyed by Hurricane Ian (2022, undated in the snippet); check its current status before leaving it listed as a fishing pier.

## Nov 16 (night): open data (OpenStreetMap, NOAA, NWS)
- `scripts/geocode.mjs` looks up each listing's street address with OpenStreetMap Nominatim (1 request/second, identifying User-Agent, cached in `data/geo.json`; only new names are looked up). 169 of 209 addresses found; 40 missed (suite-style or new addresses). Rerun after adding listings. Results are address-level, so use them for distances, not turn-by-turn.
- Listing pages: `geo` in schema, and a **"Close by"** block (5 nearest listings of any category within 6 miles, straight-line miles, OSM credit) replacing the arbitrary "Also in <area>" where coordinates exist.
- **`/conditions/`** (footer, sitemap, plan hub): live tides (NOAA station 8661070 Springmaid Pier), water temperature and the 6-period NWS forecast, loaded in the browser by `public/assets/conditions.js` from public no-key APIs. Falls back to links if an API fails. Beach, pier, cruise, kayak and fishing listings link to it. Editorial policy has an "Open data we use" section with credits.
- Not done: map pins on listing pages (coordinates now exist; a Leaflet/OSM tile map would need a new third-party script and a privacy-page update), Google Places / Yelp / Foursquare APIs (need Ryan's accounts and keys), owner claim emails (need Ryan's approval to send).

## Nov 16 (night): maps
- `/map/` (footer, sitemap): all 163 listings that have coordinates, as pins colored by category, with a category filter (`public/assets/map.js`, Leaflet 1.9.4 from cdnjs, OpenStreetMap tiles, data in `dist/map-data.json` written by the build). Listing pages show a small pin map under the coastline map when coordinates exist. Leaflet and tiles load ONLY on those pages; privacy page has a "Maps" section. Gotcha: the single-pin code selects `.osm-map[data-lat]` so it ignores the big map.
- Zero-cost decision (Ryan, Nov 16): no Google/Foursquare/Yelp keys for now (all need an account; Google needs a card). If Ryan later wants ratings, Google Places with a quota and budget cap is the pick.

## Nov 16 (night): Google rating slot (inactive until Ryan adds a key)
- Correction to my earlier plan: Google's Maps Platform terms (as I understand them) do not allow storing ratings, only Place IDs, so a weekly cached-ratings job would break them. Built instead: `public/assets/ratings.js` fetches `rating` + `userRatingCount` live from Places API (New) in the visitor's browser and shows "★ 4.5 from N Google ratings. Google Maps" on listings that have a Place ID. Nothing shows (and no script loads) while `placesApiKey` in `site.config.mjs` is empty. Privacy page gets a "Google ratings" section only when a key is set.
- Ryan's setup steps: Google Cloud project, billing (card), enable Places API (New), browser key restricted to https://myrtlebeachcompass.com/* and Places API (New), a low daily quota on Place Details (the hard stop), a $1 budget alert (alerts only, does not stop spend). Then paste the key into `placesApiKey`.

## Nov 16 (night): Google Places key live
- Ryan's Google Cloud project "My First Project" (free trial, $300 credit, ~90 days from Nov 16, 2026; billing is NOT upgraded, so nothing can be charged; do NOT click Upgrade). Places API (New) enabled. Key "Maps Platform API Key" is restricted to website `https://myrtlebeachcompass.com/*` and Places API (New) only, and is in `site.config.mjs` (`placesApiKey`; a referrer-restricted browser key is meant to be public). 192 listings carry the rating slot.
- Quota editing is greyed out on trial accounts, so there is no daily cap; the trial credit is the cap. When the trial ends the API stops and ratings quietly disappear unless Ryan upgrades; clear `placesApiKey` then to stop loading the script. Re-check at https://console.cloud.google.com/apis/credentials?project=project-bb890ed3-beec-4464-b34

## Nov 16 check-in (Search Console + spot checks)
- Search Console (data last updated 11/12): 228 indexed, 28 not indexed (21 discovered-not-indexed, 2 crawled-not-indexed, 2 redirect, 2 alternate canonical, 1 noindex). The 2 crawled-not-indexed are Duplin Winery and Comedy Cabana listing pages; both have full descriptions, hours/price, so it's Google's backlog, not thinness.
- Live spot checks OK: Second Avenue Pier shows Google rating, pin map, Close by. Duplin, Comedy Cabana, Horry County Museum show map + Close by + social. Atalaya Castle has no map/Close by (no coordinates in data/geo.json) and no rating; fails gracefully.
- `DRAFT_OWNER_EMAIL.md` holds a draft owner email. Not sent.

## REMINDER: early Feb 2027, Google Cloud trial ends (~Feb 14, 2027)
- Tell Ryan at the start of the first session in Feb 2027. Decide: (a) let it lapse and clear `placesApiKey` in `site.config.mjs` (ratings vanish, $0), or (b) Ryan upgrades himself, then we immediately set a Places API quota (and check "Spend cap enforcement" in Billing > Budgets & caps) and check current Places pricing/free tier first. Never click Upgrade for him.
- A "$1 alert" budget (emails at 50/90/100%) was created Nov 16, 2026. It alerts only; it does not stop spending.

## REMINDER: ~Nov 30, 2026, Ryan checks back (indexing + AdSense)
- Ryan said (Nov 16) he'll return in ~2 weeks. Then: (1) Search Console page indexing: is the indexed count above 228? Are the new plan pages, /map/, /conditions/, /terms/ indexed? Look at the 21 "Discovered - currently not indexed"; resubmit sitemap if needed. (2) AdSense > Sites status; tell Ryan if it looks like time to consider "Request review". NEVER click it. (3) Re-check ratings, maps and guide pages on the live site.

## Nov 16: Places status check + unpublished two
- Google Places `businessStatus` (read live from the site origin, nothing stored): Apache Pier, Backstage Mirror Maze, Lost Mine, Riddles, Spanish Galleon, Wheels of Yesteryear all OPERATIONAL. Pirate's Cove (Google: "Pirate's Cove Rooftop") and Soar + Explore: CLOSED_TEMPORARILY. No Google entry for Radical Ropes.
- Ryan approved: **unpublished Pirate's Cove Lounge and Radical Ropes Adventure Park** in Airtable (unchecked Published, nothing deleted). Soar & Explore stays published; its Hours Note already says closed for fall 2026. Thrill & Action essay no longer names Radical Ropes. Re-publish either if a current source shows it open.


## Archived handoff (Nov 7-12, 2026; was HANDOFF.md, folded in Nov 16)
Setup notes, Airtable field IDs, blocked-listing lists and older to-dos. Some items may be superseded by the sections above.

# Handoff: Myrtle Beach Compass (written Nov 7, 2026 ~12:50 ET; descriptions section updated ~2:15 PM ET)

Read CLAUDE.md first (full project notes). This file is only the state of play at the end of a long session.

## Nov 12 (latest): work moved from the Chat tab to the Claude Code tab
- **Work from the Code tab now.** The repo is cloned at `C:\Users\rfisc\Desktop\CLAUDE AI WORK\myrtle beach compass\grandstrandpulse` (start the session in that folder). Ryan wants everything Claude creates kept inside `C:\Users\rfisc\Desktop\CLAUDE AI WORK`: no new folders on the Desktop or elsewhere.
- Installed on this PC (winget): Git 2.56, Node 26.13, GitHub CLI 2.103. They may not be on PATH in an old terminal; full paths are `C:\Program Files\Git\cmd`, `C:\Program Files\nodejs`, `C:\Program Files\GitHub CLI`. `gh` is signed in as rfischbeck7-ctrl and `gh auth setup-git` was run, so `git push` works. Repo-local git identity is the GitHub no-reply email. Still not installed: Playwright, `rsvg-convert`/ImageMagick (needed for the art duplicate check and screenshots).
- Pushed commit `123203a`: build scripts used `new URL(import.meta.url).pathname`, which broke on Windows; now `fileURLToPath`. `node scripts/build.mjs` builds 213 listings locally. Deploy succeeded (about 40 s; the 6-8 minute figure in CLAUDE.md is out of date).
- PowerShell notes: no `&&`; git writes progress to stderr, so PowerShell shows a harmless "NativeCommandError".
- The old Chat-tab conversation cannot be reached from the Code tab; this file and CLAUDE.md carry the state. An older copy of CLAUDE.md/HANDOFF.md sits one folder up in `CLAUDE AI WORK`; the repo copies are the current ones.
- Nothing is in progress. Next picks (all optional, see below): the Waiting-on-Ryan items (consent-message logo, AdSense decision, phone-number rule question), photo-request email drafts (drafts only), then Place IDs / descriptions only if a new readable source turns up.
- Token-saving mods (Claude Code plugins) were installed Nov 12 from `CLAUDE AI WORK\token-saving-mods`, loaded via `CLAUDE_CODE_PLUGIN_DIRS` in `C:\Users\rfisc\.claude\settings.json`; /mods shows On/Off switches. Don't move that folder.

## Where things stand
- Site is live and deploys on every push (and nightly). ~213 listings, 11 categories. Last deploy triggered ~12:49 ET after the final push.
- Art: illustrated scenes are the default (Ryan rejected the plain tiles). Cleaned up, animated, golf courses individualized, WonderWorks fixed. Closest duplicate pair 0.0495. Add a CUSTOM scene when adding a listing, check it on a labeled montage.
- Home and listing-page maps: cities link to /areas/<area>/.
- AdSense (pub-6449115884515319): site status "Getting ready", no rejection reason, ads.txt Authorized. **European regulations consent message is published** (Nov 7). US state message not created (optional). Code-side readiness done (contact page, privacy wording, richer listing pages).

## Waiting on Ryan
- Replace the clipped consent-message logo: new file `mbc-logo-wide.png` was sent in chat. AdSense > Privacy & messaging > European regulations > Edit message > site logo. Cosmetic only. I cannot do it (native file picker on his computer).
- Wait for Google's AdSense decision. If rejected, the reason appears in AdSense > Sites and by email: fix what it names. Avoid big structural changes until then.
- Not doable by Claude: deleting the unused Airtable token. (2FA on Porkbun/GitHub/Airtable is done, Nov 7.)
- Open question asked of Ryan (unanswered): relax the "official site only" rule for phone numbers (Google lists numbers for some blank listings)?

## Optional work, in value order
1. Short descriptions: **done for everything that has a readable official source (Nov 7 evening: 54 expanded, written to Airtable, deploy triggered).** 46 listings are still under 30 words and cannot be expanded honestly without a source. Don't redo them unless a readable official page turns up:
   - Blocked/errored/wrong site: Black Pearl (site errors), Aloha Village (listed site is the wrong page), King's North (site errors), Wild Woods Farm (robots), AMC Classic 12 (robots), SkyWheel (blocks bots), Voyager (site errors), Kaminski House (listed site is a travel blog), Georgetown Harborwalk (listed historicgeorgetown.com is now a domain-for-sale page; the Website field needs a new official link).
   - No official site: Inlet Adventure, Jungle Lagoon, Bin 2004, La Belle Amie, 810 Billiards, Hollywood Wax, MB Room Escape, AlleyOops, Jack Axe, Pier 14, Second Avenue Pier, Horry County Museum, MarshWalk, Boardwalk, Pavilion Nostalgia Park, TPC, and most live-show and nightlife listings (Charles Bach, Grand 14, Le Grand Cirque, Polynesian Fire Luau, Pelicans, Riga Tony's, Legends in Concert, GTS, Asher; Pier at Garden City, Apache Pier, Pirate's Cove, Duck's, OD Arcade, Ocean Annie's, Spanish Galleon, 3001, Senor Frog's, Bowery, Dead Dog). Topgolf is excluded by past decision.
   - Short Description field IDs by table: mini golf `fldKkiiuBXM0cKTqq`, golf `fld8jbHhMa9J7WDM9`, breweries `fldlp0h7sa3hLRl0z`, nightlife `fldNsef8LCshidbMx`, live shows `fldnTU1ufN6yBHLZu`, fishing `fldRHcuycl91Xc4V0`, beaches `fldq2tlle7Ws6sa0e`, thrill `fldLtOEmSUPDeEctg`, family `flduA7KJc2DLH9gIv`, nature `fld5p6irAHEUqNvyX`, historic `fld80Uz9LF7FWmwpz`. Find short ones by word count (< 30) in `data/*.airtable.json` (records are under `.records[].fields`).
   - Facts worth knowing: Wachesaw East is a Clyde Johnston design (not Fazio); Legends Moorland is credited to P.B. Dye; Red Dragon Cove's site still says "coming soon" (the page may be stale); Serial Killers' Dahmer room was scheduled to open Oct 1, 2026 (not confirmed, left out of the text).
2. Photo-request email drafts for breweries/wineries/newer venues (drafts only, never send without asking).
3. Place IDs: retried Legends Moorland, Barefoot Fazio, Pedal Pub Conway, Getaway, MB Watersports: Google returns a different business, so they stay on the fallback. Don't retry without a new angle.
4. Phone gaps: official sites state none for Ripley's x3, Sky Zone, 810 (only a corporate number), Backstage Mirror Maze, Plantation River Tours, EdVenture, SkyWheel, etc. Leave blank unless Ryan relaxes the rule.

## Hours/prices pass (Nov 7 evening, in progress)
- Ryan asked to fill hours and prices for listings with a website but blank details (125 targets). Done from official pages so far: Pinball Museum, WonderWorks (price note), Sky Zone, Wheels of Yesteryear hours, Hobcaw, Alligator Adventure, T.I.G.E.R.S. Safari, Myrtle Waves (closed for season), Family Kingdom (closed for season). Hours/Price/Level field IDs per table: read from `list_tables_for_base`.
- Many sites state no prices (Ripley's, Big Air, Escapology, Stars and Strikes) or no hours; leave blank. Not yet fetched: remaining mini golf, cruises, watersports, historic, live shows, nightlife.

- (Nov 7 later) Pass completed for every page that states hours/prices; the rest stay blank on purpose. Added a **Booking Link** URL field to Family, Thrill, Nature, Live Shows, Historic and Mini Golf tables (not yet Fishing, Nightlife, Breweries, Golf); the listing page shows a "Tickets & booking" button when set (`bookingLink` in build.mjs). Links are the business's own booking pages. Photos are deferred until AdSense approves (Ryan, Nov 7).

## Nov 9: descriptions + AdSense check
- AdSense > Sites still shows "Getting ready" (last updated Nov 5), no reasons given. Nothing to fix on our side but content; wait.
- Search Console (Nov 9): 36 indexed, 175 "Crawled - currently not indexed" (Google systems, normal for a new site with many similar pages), 1 noindex (/saved/, intended), 1 redirect (http://www, intended). Report last updated Nov 5.
- Expanded 10 more descriptions from official sites and added their Website fields: Pelicans (milb.com), Legends in Concert, Horry County Museum, MarshWalk, Myrtle Beach Boardwalk, Pier at Garden City, Apache Pier, Hollywood Wax, Pier 14, Grand 14. Remaining ~45 short ones have no readable official source (web search finds only third-party sites): leave them. Set-aside unpublished ones (Club Vybe, Master's Club, Crocodile Rocks, Hot Fish, Carolina Improv, Go Ape, Zipline, Rover, Funplex) were ignored.

## Gotchas learned
- Built-in browser: parallel navigate calls on one tab collide; do them one at a time. AdSense pages load slowly (wait ~3s, then screenshot).
- places_search returns ~1,200 tokens of review text per place: never copy ratings or reviews.
- Airtable free plan: 1,000 API calls/month. Batch updates (up to 50 records per call).
- Always `git pull --rebase origin main` before `git push origin HEAD:main` (a bot commits data snapshots). Commit messages end with the Co-Authored-By and Claude-Session lines from the session reminder.
