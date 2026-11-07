# Handoff: Myrtle Beach Compass (written Nov 7, 2026 ~12:50 ET; descriptions section updated ~2:15 PM ET)

Read CLAUDE.md first (full project notes). This file is only the state of play at the end of a long session.

## Where things stand
- Site is live and deploys on every push (and nightly). ~213 listings, 11 categories. Last deploy triggered ~12:49 ET after the final push.
- Art: illustrated scenes are the default (Ryan rejected the plain tiles). Cleaned up, animated, golf courses individualized, WonderWorks fixed. Closest duplicate pair 0.0495. Add a CUSTOM scene when adding a listing, check it on a labeled montage.
- Home and listing-page maps: cities link to /areas/<area>/.
- AdSense (pub-6449115884515319): site status "Getting ready", no rejection reason, ads.txt Authorized. **European regulations consent message is published** (Nov 7). US state message not created (optional). Code-side readiness done (contact page, privacy wording, richer listing pages).

## Waiting on Ryan
- Replace the clipped consent-message logo: new file `mbc-logo-wide.png` was sent in chat. AdSense > Privacy & messaging > European regulations > Edit message > site logo. Cosmetic only. I cannot do it (native file picker on his computer).
- Wait for Google's AdSense decision. If rejected, the reason appears in AdSense > Sites and by email: fix what it names. Avoid big structural changes until then.
- Not doable by Claude: 2FA on Porkbun/GitHub/Airtable, deleting unused Airtable token.
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

## Gotchas learned
- Built-in browser: parallel navigate calls on one tab collide; do them one at a time. AdSense pages load slowly (wait ~3s, then screenshot).
- places_search returns ~1,200 tokens of review text per place: never copy ratings or reviews.
- Airtable free plan: 1,000 API calls/month. Batch updates (up to 50 records per call).
- Always `git pull --rebase origin main` before `git push origin HEAD:main` (a bot commits data snapshots). Commit messages end with the Co-Authored-By and Claude-Session lines from the session reminder.
