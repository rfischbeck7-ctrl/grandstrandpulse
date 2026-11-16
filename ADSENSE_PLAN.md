# AdSense "Low value content" plan (drafted Nov 16, 2026)

**Status:** AdSense > Sites shows myrtlebeachcompass.com as "Needs attention: Low value content" (updated Nov 15, 2026, 2:26 PM ET). ads.txt is Authorized. The rejection email gives no other detail. Search Console (Nov 16) also reported "Alternate page with proper canonical tag"; that is harmless (http/www duplicates, canonical tags on every page point to themselves).

**Do not click "Request review" until Phase 1 and 2 are done.** A second rejection too soon looks worse and the wait grows.

## What the numbers say (from data/*.airtable.json and a fresh local build)
- 213 published listings. About 47 Short Descriptions are under 30 words (19 under 15). Worst by category: nightlife 15 of 20, live shows 8 of 22.
- These have no readable official source, so they cannot be expanded honestly (see HANDOFF.md list: most nightlife, theaters, Black Pearl, Kaminski House, etc.).
- Original, written pages are the strong part: guides (rainy-day, with-kids ~4,900 words incl. cards; indoor-mini-golf only ~460), area hubs (Central Myrtle ~5,400, Surfside ~700, Conway ~800), plan pages (~500 words each), About only ~380.
- Every listing page repeats the same blocks ("Planning your visit", "Also in <area>", review buttons), so the site reads as a template with small facts swapped in.

## Phase 1: stop diluting the site (needs Ryan's OK, reversible)
1. Unpublish (uncheck Published in Airtable) the thinnest listings that have **no official site and under 30 words**: exactly 26 (checked Nov 16; 10 more are short but have a blocked or wrong site), mostly nightlife and live shows. Ryan to choose which of them to keep; see the chat list. Nothing is deleted; they can come back when a source appears. This matches the rule "leave a listing unpublished if it can't be verified".
2. Keep the venues Ryan cares about by name if he wants any of them published anyway (ask for a list).
3. Update the "~N listings" wording on the home page and About if it states a number.

## Phase 2: add real original content (biggest lever)
Target 15 to 20 new pages of 600+ words, written from official/public sources, no copied text, no ratings or reviews:
- **One intro per category** (11 pages' worth, 250-400 words each on the category page): how to choose, what to expect, season, typical visit length, accessibility and parking notes, with links to the best-documented listings.
- **Itineraries:** 3 days with kids, rainy weekend, couples weekend, budget (free) day, winter visit, Golf-trip weekend.
- **Planning guides:** month-by-month calendar (weather, crowds, closures from official sources), "first-time visitor mistakes", beach rules and safety (official city pages), hurricane-season basics.
- **Expand existing thin pages:** About (who runs it, how listings are checked, how to report errors), indoor-mini-golf guide, Surfside and Conway hubs, both plan pages to 900+ words each.
- Add a short **methodology/editorial policy** page (how details are sourced, update cadence). Google reviewers look for this.

## Phase 3: make listing pages feel less templated
- Vary or shorten the repeated boilerplate blocks; show them only where they add something (e.g. skip "Planning your visit" on pages with a full description).
- Make sure each listing has at least the description, hours or "call ahead" note, price level when known, address, and a source line. Where the page would still be bare, fold it into a list on a category or area page instead of its own page (or add `noindex`).
- Real photos beat generated art. Photo-request email drafts (breweries, wineries, newer venues) were deferred until AdSense approval; sending them now is worth doing. Drafts only, Ryan sends or approves.

## Phase 4: wait, measure, then request review
- Push Phase 1-3 changes in batches. Deploys take about 40 seconds.
- Check Search Console weekly: the indexed count was 36 (Nov 9) with 175 "Crawled - currently not indexed". It should climb. Submit the sitemap again after each batch.
- Request AdSense review only when: new pages are live and indexed, thin listings are gone, and about 2 to 4 weeks have passed since the last big change. AdSense also likes steady real traffic, so share the site (local Facebook groups, visitor centers, Google Business Profile) in the meantime.
- If rejected again, the reason appears in AdSense > Sites; adjust from that.

## Honest limits
- There is no guarantee. Google does not say how much content is enough. A new site with a directory format is a hard case.
- Everything above stays within the existing rules: facts only from business or official sources, no invented businesses, no copied reviews or ratings.

## Needs Ryan
1. OK to unpublish the thinnest ~30-35 listings (Phase 1).
2. OK to write the new guides and category intros and publish them (Phase 2). Notes in CLAUDE.md already say Ryan authorised website updates; confirm this size of change.
3. Whether to send photo requests (Phase 3).
