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
