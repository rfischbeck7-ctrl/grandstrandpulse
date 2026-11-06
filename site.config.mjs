// Myrtle Beach Compass — site settings.
// Each category has a theme (a = dark band color, b = light band color, tint = page background),
// a short blurb for its home-page card, and a cover listing whose art or photo shows on that card.
// To add a new category (breweries, bars, restaurants...):
//   1. Create a table for it in the Airtable base .
//      Give it at least: Name, Area, Short Description, Published (checkbox).
//      Optional: Address, Phone, Website, Google Maps Link, Photo, Photo Credit.
//   2. Copy the mini-golf block below, change slug/title/table and the field names.
//   3. Push the change; the site rebuilds on its own.

export default {
  siteName: "Myrtle Beach Compass",
  domain: "myrtlebeachcompass.com",
  tagline: "Things to do, from Little River to Georgetown",
  description:
    "Things to do in Myrtle Beach and along the Grand Strand, from Little River to Georgetown. Every listing checked before it goes up.",
  // Google AdSense publisher ID, like "pub-1234567890123456" (also accepts "ca-pub-...").
  // Adds the AdSense script to every page and creates /ads.txt. Leave empty to turn ads off.
  adsensePublisherId: "ca-pub-6449115884515319",
  // Shown in the footer for corrections. Leave empty to hide.
  contactEmail: "contact@myrtlebeachcompass.com",

  // Areas, listed north to south. "x"/"y" place each area on the coastline map (percent).
  areas: [
    { name: "North Myrtle Beach", x: 87, y: 21 },
    { name: "Central Myrtle", x: 66, y: 42 },
    { name: "Surfside", x: 46, y: 59 },
    { name: "Murrells Inlet", x: 28, y: 72 },
    { name: "Georgetown", x: 11, y: 89 },
  ],

  // Categories that aren't live yet, shown on the home page as "Coming soon". This is a things-to-do guide only: no restaurants, bars or shopping.
  comingSoon: [],

  categories: [
    {
      slug: "mini-golf",
      theme: { a: "#0d5c3c", b: "#2f9a5a", tint: "#edf7ef" },
      blurb: "Pirate ships, volcanoes, dinosaurs and a crashed cargo plane.",
      cover: "Mutiny Bay Miniature Golf",
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
      theme: { a: "#5e2233", b: "#b06a28", tint: "#fbf3ea" },
      blurb: "Taprooms, backyard brewpubs and sweet Southern wine.",
      cover: "New South Brewing",
      title: "Breweries & wineries",
      noun: { one: "spot", many: "spots" },
      table: "Breweries & Wineries",
      searchHint: "Search name or vibe",
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
    {
      slug: "nightlife",
      theme: { a: "#24124a", b: "#7a2a74", tint: "#f5effa" },
      blurb: "Shag dancing, beach bars, honky tonks and comedy.",
      cover: "Fat Harold's Beach Club", title: "Nightlife & clubs",
      noun: { one: "spot", many: "spots" }, table: "Nightlife & Clubs",
      searchHint: "Search name or type",
      intro:
        "Dance floors, beach clubs, honky tonks and comedy stages. Here is where the Strand stays up late, sorted by where you're staying.",
      fields: { name: "Name", area: "Area", description: "Short Description", subtitle: "Type", address: "Address", phone: "Phone", website: "Website", maps: "Google Maps Link", photo: "Photo", photoCredit: "Photo Credit", published: "Published" },
      tags: ["Type"],
      filters: [{ field: "Type", label: "Type" }],
      details: [{ label: "Type", field: "Type" }],
    },
    {
      slug: "thrill-action",
      theme: { a: "#8f2414", b: "#e05a34", tint: "#fff1eb" },
      blurb: "Go-karts, ziplines, water parks and jet skis.",
      cover: "Myrtle Beach SkyWheel", title: "Thrill & action",
      noun: { one: "spot", many: "spots" }, table: "Thrill & Action",
      searchHint: "Search name or type",
      intro:
        "Go-karts, ziplines, water parks, parasailing and jet skis. Pick your adrenaline.",
      fields: { name: "Name", area: "Area", description: "Short Description", subtitle: "Type", address: "Address", phone: "Phone", website: "Website", maps: "Google Maps Link", photo: "Photo", photoCredit: "Photo Credit", published: "Published" },
      tags: ["Type"],
      filters: [{ field: "Type", label: "Type" }],
      details: [{ label: "Type", field: "Type" }],
    },
    {
      slug: "family-indoor",
      theme: { a: "#2b2f8f", b: "#5560d8", tint: "#eff0fd" },
      blurb: "Escape rooms, bowling and rainy-day fun for the whole crew.",
      cover: "WonderWorks", title: "Family & indoor fun",
      noun: { one: "spot", many: "spots" }, table: "Family & Indoor",
      searchHint: "Search name or type",
      intro:
        "Escape rooms, bowling, axe throwing, trampolines and hands-on museums for rainy days and restless kids.",
      fields: { name: "Name", area: "Area", description: "Short Description", subtitle: "Type", address: "Address", phone: "Phone", website: "Website", maps: "Google Maps Link", photo: "Photo", photoCredit: "Photo Credit", published: "Published" },
      tags: ["Type"],
      filters: [{ field: "Type", label: "Type" }],
      details: [{ label: "Type", field: "Type" }],
    },
    {
      slug: "nature-eco",
      theme: { a: "#1f4a40", b: "#5f844a", tint: "#f0f5ec" },
      blurb: "State parks, gardens, marsh boardwalks and dolphin cruises.",
      cover: "Brookgreen Gardens", title: "Nature & eco",
      noun: { one: "spot", many: "spots" }, table: "Nature & Eco",
      searchHint: "Search name or type",
      intro:
        "State parks, sculpture gardens, gators, dolphin cruises, boardwalks and harborwalks.",
      fields: { name: "Name", area: "Area", description: "Short Description", subtitle: "Type", address: "Address", phone: "Phone", website: "Website", maps: "Google Maps Link", photo: "Photo", photoCredit: "Photo Credit", published: "Published" },
      tags: ["Type"],
      filters: [{ field: "Type", label: "Type" }],
      details: [{ label: "Type", field: "Type" }],
    },
    {
      slug: "live-shows",
      theme: { a: "#5c0b22", b: "#b0213f", tint: "#fbeff2" },
      blurb: "Dinner shows, variety theaters and Pelicans baseball.",
      cover: "Medieval Times", title: "Live shows & sports",
      noun: { one: "spot", many: "spots" }, table: "Live Shows & Sports",
      searchHint: "Search name or type",
      intro:
        "Variety theaters, dinner shows and minor-league baseball.",
      fields: { name: "Name", area: "Area", description: "Short Description", subtitle: "Type", address: "Address", phone: "Phone", website: "Website", maps: "Google Maps Link", photo: "Photo", photoCredit: "Photo Credit", published: "Published" },
      tags: ["Type"],
      filters: [{ field: "Type", label: "Type" }],
      details: [{ label: "Type", field: "Type" }],
    },
    {
      slug: "historic-cultural",
      theme: { a: "#57301c", b: "#a96a37", tint: "#f8f0e8" },
      blurb: "Plantations, a seaside castle and Lowcountry museums.",
      cover: "Atalaya Castle", title: "Historic & cultural",
      noun: { one: "spot", many: "spots" }, table: "Historic & Cultural",
      searchHint: "Search name or type",
      intro:
        "Plantations, castles, museums and boat tours from Georgetown to the Grand Strand.",
      fields: { name: "Name", area: "Area", description: "Short Description", subtitle: "Type", address: "Address", phone: "Phone", website: "Website", maps: "Google Maps Link", photo: "Photo", photoCredit: "Photo Credit", published: "Published" },
      tags: ["Type"],
      filters: [{ field: "Type", label: "Type" }],
      details: [{ label: "Type", field: "Type" }],
    },
  ],
};
