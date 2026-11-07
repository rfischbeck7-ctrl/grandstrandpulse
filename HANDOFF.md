# Handoff: Myrtle Beach Compass (written Nov 7, 2026 ~12:50 ET)

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
1. Expand short descriptions: ~111 listings under 30 words. Use the business's own site via WebFetch, no prices/hours in text. Airtable Short Description field IDs by table: thrill `fldLtOEmSUPDeEctg`, family `flduA7KJc2DLH9gIv`, nature `fld5p6irAHEUqNvyX`, historic `fld80Uz9LF7FWmwpz` (others: run get_table_schema; it is the multilineText right after the Website url). Find short ones by reading `data/*.airtable.json` (word count < 30). Can't be done honestly: Kaminski House (listed site is a travel blog), Voyager (site errors), most nightlife/theaters (no official site). Topgolf is excluded by past decision.
2. Photo-request email drafts for breweries/wineries/newer venues (drafts only, never send without asking).
3. Place IDs: retried Legends Moorland, Barefoot Fazio, Pedal Pub Conway, Getaway, MB Watersports: Google returns a different business, so they stay on the fallback. Don't retry without a new angle.
4. Phone gaps: official sites state none for Ripley's x3, Sky Zone, 810 (only a corporate number), Backstage Mirror Maze, Plantation River Tours, EdVenture, SkyWheel, etc. Leave blank unless Ryan relaxes the rule.

## Gotchas learned
- Built-in browser: parallel navigate calls on one tab collide; do them one at a time. AdSense pages load slowly (wait ~3s, then screenshot).
- places_search returns ~1,200 tokens of review text per place: never copy ratings or reviews.
- Airtable free plan: 1,000 API calls/month. Batch updates (up to 50 records per call).
- Always `git pull --rebase origin main` before `git push origin HEAD:main` (a bot commits data snapshots). Commit messages end with the Co-Authored-By and Claude-Session lines from the session reminder.
