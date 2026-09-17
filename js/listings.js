/* ==========================================================================
   NEXORA REALTY — LISTINGS.JS
   Data layer for the dashboard's "My Listings" — separate from the
   buyer-facing NEXORA_PROPERTIES catalog in data.js. On first use, it
   seeds itself with the demo agent's (Amaka Chukwu / a001) three existing
   properties so the dashboard has something real to show, then behaves
   as an independent, fully editable store from that point on. New
   listings created through Add Property only exist here — this is a
   frontend demo with no backend to publish them to the public catalog.
   Pure data functions only; dashboard.js handles all the rendering.
   ========================================================================== */

const DASHBOARD_LISTINGS_KEY = "nexora_dashboard_listings";
const DASHBOARD_DEMO_AGENT_ID = "a001";

function seedDashboardListings() {
  if (localStorage.getItem(DASHBOARD_LISTINGS_KEY) !== null) return; // already seeded (or emptied by the user)

  const seed = NEXORA_PROPERTIES.filter((p) => p.agent === DASHBOARD_DEMO_AGENT_ID).map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    type: p.type,
    listingType: p.listingType,
    location: p.location,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    area: p.area,
    description: p.description,
    amenities: [...p.amenities],
    images: [...p.images],
    status: "published",
    views: p.views,
    createdAt: "2026-05-01T09:00:00.000Z",
    updatedAt: "2026-05-01T09:00:00.000Z"
  }));

  localStorage.setItem(DASHBOARD_LISTINGS_KEY, JSON.stringify(seed));
}

function getDashboardListings() {
  seedDashboardListings();
  try {
    const raw = localStorage.getItem(DASHBOARD_LISTINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn("Could not read dashboard listings from storage:", error);
    return [];
  }
}

function getDashboardListingById(id) {
  return getDashboardListings().find((listing) => listing.id === id) || null;
}

function saveDashboardListings(listings) {
  localStorage.setItem(DASHBOARD_LISTINGS_KEY, JSON.stringify(listings));
}

function generateListingId() {
  return "dl_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function createDashboardListing(data) {
  const listings = getDashboardListings();
  const now = new Date().toISOString();
  const listing = {
    id: generateListingId(),
    views: 0,
    ...data,
    createdAt: now,
    updatedAt: now
  };
  listings.unshift(listing);
  saveDashboardListings(listings);
  return listing;
}

function updateDashboardListing(id, data) {
  const listings = getDashboardListings();
  const index = listings.findIndex((listing) => listing.id === id);
  if (index === -1) return null;

  listings[index] = { ...listings[index], ...data, updatedAt: new Date().toISOString() };
  saveDashboardListings(listings);
  return listings[index];
}

function deleteDashboardListing(id) {
  const listings = getDashboardListings().filter((listing) => listing.id !== id);
  saveDashboardListings(listings);
}
