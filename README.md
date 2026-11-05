# Myrtle Beach Compass

Things to do in Myrtle Beach and along the Grand Strand. Listings live in Airtable; this project
turns them into a fast, free website at **myrtlebeachcompass.com**, hosted on GitHub Pages.

## How it works

1. You edit listings in the Airtable base (named **Grand Strand Pulse** in Airtable).
2. Every night (about 4 AM Eastern), GitHub pulls the latest listings and rebuilds the site.
3. Want a change live right away? On GitHub, open **Actions → Refresh and publish site → Run workflow**.

Only listings with **Published** checked appear on the site. Photos are copied from Airtable
into the site, so they keep working.

## Everyday tasks

| I want to... | Do this |
|---|---|
| Fix a typo or phone number | Edit it in Airtable. It's live by tomorrow morning, or click **Run workflow**. |
| Hide a closed business | Uncheck **Published** in Airtable. |
| Add a photo | Drop it in the **Photo** field, fill **Photo Credit** if it came from the business. |
| Add a new course | Add a row in Airtable with at least Name, Area, Short Description, and Published checked. |

## Adding a new category (breweries, bars, restaurants...)

1. In Airtable, add a table to the same base (for example **Breweries**) with at least:
   Name, Area (same four choices), Short Description, Published (checkbox).
   Optional: Address, Phone, Website, Google Maps Link, Photo, Photo Credit, plus any
   category-specific fields (for example "Dog Friendly" or "Food Trucks").
2. In `site.config.mjs`, copy the `mini-golf` block, then change `slug`, `title`, `noun`,
   `table`, `intro`, and which fields to use for tags, filters and details.
3. Remove it from `comingSoon` in the same file.
4. Commit the change. The site rebuilds with a new section and adds it to the menu.

## One-time setup (already done if the site is live)

- **GitHub repository settings → Secrets and variables → Actions**
  - Secret `AIRTABLE_TOKEN`: an Airtable personal access token with the
    `data.records:read` scope and access to the base.
  - Variable `AIRTABLE_BASE_ID`: `appS1KIy1m8mqqHRS`
- **Settings → Pages**: Source = GitHub Actions. Custom domain = `myrtlebeachcompass.com`,
  then tick **Enforce HTTPS** once it's offered.
- **DNS at Porkbun** for myrtlebeachcompass.com:
  - `A` records for the bare domain: `185.199.108.153`, `185.199.109.153`,
    `185.199.110.153`, `185.199.111.153`
  - `CNAME` for `www` pointing to `<your-github-username>.github.io`

## Working on it locally (optional)

Needs Node.js 20 or newer. No packages to install.

```
npm run build      # builds the site into dist/ from the saved data
npm run preview    # builds, then serves it at http://localhost:8080
npm run fetch      # pulls fresh data (needs AIRTABLE_TOKEN and AIRTABLE_BASE_ID set)
```

## Files

- `site.config.mjs`: site name, areas, and categories. Most changes happen here.
- `data/`: the latest saved copy of each Airtable table.
- `public/`: styles, script, icon, and downloaded photos.
- `scripts/`: the Airtable fetcher, the site builder, and the preview server.
- `.github/workflows/deploy.yml`: the nightly refresh and publish job.
