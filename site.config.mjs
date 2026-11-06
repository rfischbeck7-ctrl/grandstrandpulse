// Myrtle Beach Compass — site settings.
// To add a new category (breweries, bars, restaurants...):
//   1. Create a table for it in the Airtable base (still named "Grand Strand Pulse"; renaming it is fine).
//      Give it at least: Name, Area, Short Description, Published (checkbox).
//      Optional: Address, Phone, Website, Google Maps Link, Photo, Photo Credit.
//   2. Copy the mini-golf block below, change slug/title/table and the field names.
//   3. Push the change; the site rebuilds on its own.

export default {
  siteName: "Myrtle Beach Compass",
  domain: "myrtlebeachcompass.com",
  tagline: "Things to do, from North Myrtle to Murrells Inlet",
  description:
    "Things to do in Myrtle Beach and along the Grand Strand, from North Myrtle Beach to Murrells Inlet. Every listing checked before it goes up.",
  // Google AdSense publisher ID, like "pub-1234567890123456" (also accepts "ca-pub-...").
  // Adds the AdSense script to every page and creates /ads.txt. Leave empty to turn ads off.
  adsensePublisherId: "ca-pub-6449115884515319",
  // Shown in the footer for corrections. Leave empty to hide.
  contactEmail: "contact@myrtlebeachcompass.com",

  // Areas, listed north to south. "x"/"y" place each area on the coastline map (percent).
  areas: [
    { name: "North Myrtle Beach", x: 84, y: 24 },
    { name: "Central Myrtle", x: 61, y: 46 },
    { name: "Surfside", x: 38, y: 66 },
    { name: "Murrells Inlet", x: 19, y: 81 },
  ],

  // Categories that aren't live yet. Shown on the home page as "Next up".
  comingSoon: ["Restaurants", "Bars & nightlife"],

  categories: [
    {
      slug: "mini-golf",
      title: "Mini golf",
      noun: { one: "course", many: "courses" },
      table: "Mini Golf",
      intro:
        "Pirate ships, volcanoes, dinosaurs and a crashed cargo plane. They don't call Myrtle Beach the mini golf capital of the world for nothing. Here's every course on the Strand, sorted by where you're staying.",
      fields: {
        name: "Name",
        area: "Area",
        description: "Short Description",
        subtitle: "Theme",
        address: "Address",
        phone: "Phone",
        website: "Website",
        maps: "Google Maps Link",
        photo: "Photo",
        photoCredit: "Photo Credit",
        published: "Published",
      },
      // Small labels on each listing.
      tags: ["Indoor / Outdoor", "Amenities"],
      // Filter buttons above the list (besides area and search).
      filters: [
        { field: "Indoor / Outdoor", label: "Setting" },
        { field: "Amenities", label: "Extras" },
      ],
      // Facts on each listing's own page.
      details: [
        { label: "Theme", field: "Theme" },
        { label: "Setting", field: "Indoor / Outdoor" },
        { label: "Extras", field: "Amenities", empty: "None listed" },
      ],
    },
    {
      slug: "breweries-wineries",
      title: "Breweries & wineries",
      noun: { one: "spot", many: "spots" },
      table: "Breweries & Wineries",
      searchHint: "Search a name or vibe, like patio",
      intro:
        "Backyards with hammocks, taprooms in old five-and-dimes and sweet Southern wine. Here are the breweries, wineries and wine bars along the Strand, sorted by where you're staying.",
      fields: {
        name: "Name",
        area: "Area",
        description: "Short Description",
        subtitle: "Vibe",
        address: "Address",
        phone: "Phone",
        website: "Website",
        maps: "Google Maps Link",
        photo: "Photo",
        photoCredit: "Photo Credit",
        published: "Published",
      },
      tags: ["Type", "Features"],
      filters: [
        { field: "Type", label: "Type" },
        { field: "Features", label: "Extras" },
      ],
      details: [
        { label: "Type", field: "Type" },
        { label: "Vibe", field: "Vibe" },
        { label: "Extras", field: "Features", empty: "None listed" },
      ],
    },
  ],
};
