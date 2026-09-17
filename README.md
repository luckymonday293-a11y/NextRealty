# Nexora Realty

A modern, premium, fully responsive real estate marketplace. Frontend-only
(HTML5, CSS3, vanilla JavaScript), built so a backend/API can be dropped in
later without restructuring the app — all data currently lives in
`js/data.js` as sample arrays that stand in for future API responses.

## Status: Complete

Every page in the original project structure is built: the homepage,
property listings, property details, favorites, compare, agents +
profiles, about, auth (login/signup), and the full owner/agent dashboard.

- Full folder structure for the whole site (see below)
- `css/global.css` — the complete design system: colors, two-font type
  scale (Playfair Display for headings, Inter for body), spacing, radius,
  shadows, buttons, badges, navbar, footer, cards (with an optional compare
  checkbox), agent cards, forms, password field/toggle, form-error banner,
  pagination, breadcrumb, shared detail-page patterns, skeleton loading,
  empty states, scroll-reveal, and image placeholders
- `js/data.js` — shared sample data (8 properties, 3 agents, 6 agent
  reviews, 3 testimonials) and small helpers (`formatPrice`,
  `getAgentById`, `getPropertyById`, `getDistrictName`)
- `js/favorites.js` — sitewide localStorage favorites (no login required)
  with a navbar count badge, recently-viewed tracking (last 6), and the
  favorites.html page logic (grid, empty state, compare selection bar)
- `js/inquiries.js` — shared localStorage-backed inquiry submissions
  (New / Contacted / Closed) with seed data, read and managed from the
  dashboard's Inquiries page
- `js/main.js` — navbar (mobile menu + scroll shadow), scroll-reveal,
  counter animation, WhatsApp deep-link helper, shared property-type
  labels/icons, and homepage renderers (featured properties, popular
  locations, featured agents, testimonials)
- `index.html` + `css/home.css` — the full homepage
- `properties.html` + `css/properties.css` + `js/properties.js` — full
  listings page: search, type/listing/price/bedroom/bathroom filters
  (synced to the URL), sort, pagination, skeleton loading, empty state
- `property-details.html` + `css/property-details.css` +
  `js/property-details.js` — interactive 6-photo gallery (thumbnails +
  prev/next), specs bar, description, amenities, sticky agent card,
  Save/Share (native Web Share API with clipboard fallback)/WhatsApp/Send
  Inquiry actions, similar properties, and a not-found state for bad IDs
- `favorites.html` + `css/favorites.css` — saved properties grid (cards
  disappear immediately on un-save), a "select up to 3 to compare" bar,
  and a Recently Viewed section fed by the tracking in `favorites.js`
- `compare.html` + `css/compare.css` + `js/compare.js` — side-by-side
  comparison table (price, location, type, bedrooms, bathrooms, area, and
  a deduplicated union of amenities with check/dash cells), reads
  `?ids=p001,p002,p003` from the URL, lets you remove a column or add
  another, and scrolls horizontally *within* the table on mobile (sticky
  row-label column) rather than ever overflowing the page
- `agents.html` + `agent-profile.html` + `css/agents.css` + `js/agents.js`
  — agent directory (search by name/specialty, verified-only filter, sort
  by rating/experience/listings) and a full profile page (photo, verified
  badge, rating, specialties, WhatsApp CTA, active listings, and a review
  list with a working "Leave a Review" form — new reviews blend into the
  displayed rating via a weighted average and appear immediately, stored
  in localStorage the same way inquiries are)
- `auth/login.html` + `auth/signup.html` + `css/auth.css` + `js/auth.js` —
  split-screen auth layout (Owner/Agent role selector on signup, no buyer
  accounts per spec), simulated account creation and login backed by
  localStorage (clearly commented as demo-only, structured so a real
  backend can swap in), a working Forgot Password view, and a fully
  accessible password show/hide toggle (real `<button type="button">` so
  it never submits the form, keyboard-operable, `aria-label`/`aria-pressed`
  update on toggle, cursor position and typed value preserved, icon stays
  contained on mobile) applied consistently to login, signup, and confirm
  password
- `dashboard/` (index, properties, add-property, edit-property, inquiries,
  profile) + `css/dashboard.css` + `js/dashboard.js` + `js/listings.js` —
  a sidebar-based workspace (off-canvas drawer on mobile) shared by owners
  and agents alike:
  - **Overview**: Active Listings / Property Views / New Inquiries stat
    cards (no retail metrics), plus Recent Listings and Recent Inquiries
  - **My Listings**: a responsive listing table that collapses to labeled
    stacked cards on mobile, with Edit, quick-Publish (for drafts), and
    Delete (with confirmation)
  - **Add/Edit Property**: one shared form (title, price, type, listing
    type, location, beds/baths/area, description, amenities, simulated
    image upload) driving Save Draft, Preview (renders a real property
    card inline before committing), and Publish
  - **Inquiries**: status filter (All/New/Contacted/Closed) and an inline
    status-change dropdown per inquiry — genuinely connected to the
    buyer-facing inquiry form: submit an inquiry on any property owned by
    the demo agent (Amaka Chukwu) from `property-details.html` and it
    appears here immediately
  - **Profile**: editable contact details, pre-filled from the signed-in
    session when one exists
  - The dashboard is fully explorable without signing in — a demo banner
    explains you're viewing sample data as the demo agent persona, and
    signing up/in seamlessly replaces that persona everywhere (sidebar,
    stats, Profile) without needing to touch a single dashboard file
  - Dashboard listings are seeded once (the demo agent's 3 existing
    properties) into their own localStorage-backed store, independent of
    the buyer-facing `NEXORA_PROPERTIES` catalog — new listings created
    here are a genuine addition to *that* store, not published back to
    the public site (there's no backend to do that safely)
- `about.html` + `css/about.css` — reuses the homepage's hero, stats, and
  values-grid components directly (see `css/home.css`) rather than
  duplicating them; adds a two-column story section and a numbered
  "How It Works" process — with distinct company-values copy rather than
  restating the homepage's product features

## What's next, if this goes further

Everything the original spec asked for is here. If this became a real
product, the natural next steps would be a backend (the localStorage
layers in `favorites.js`, `inquiries.js`, `listings.js`, and `auth.js` are
all written as thin wrappers specifically so each one is a small, isolated
swap to real API calls), real image upload/storage, and connecting
dashboard-published listings back into the public `properties.html`
catalog.

## Design system reference

| Token | Value |
|---|---|
| Primary | `#0F766E` (hover `#115E59`) |
| Accent / gold highlight | `#D97706` |
| Background / Surface | `#F8FAFC` / `#FFFFFF` |
| Text / Secondary / Muted | `#0F172A` / `#64748B` / `#94A3B8` |
| Success / Favorite / Warning / Error | `#16A34A` / `#EF4444` / `#F59E0B` / `#DC2626` |
| Headings | Playfair Display, 400–700 |
| Body | Inter, 400–700 |
| Radius scale | 8 / 12 / 16 / 24px |
| Spacing scale | 8 / 16 / 24 / 32 / 48 / 64 / 80px |
| Container | 1200px max-width |

All tokens live as CSS custom properties at the top of `css/global.css` —
change them once, and the whole site updates. Gold (the accent color) is
used sparingly and intentionally: the Featured badge and price highlights
only, per the "premium, not e-commerce" direction.

## Data model

Each property in `js/data.js` follows this shape (matches the spec exactly
so a real API response can drop in later with no other code changes):

```js
{
  id, title, price, location, type, listingType,
  bedrooms, bathrooms, area, description, amenities,
  featured, views, agent, images: [ /* 6 paths */ ]
}
```

## Images

No fake/generated images are included. Every image spot is a styled
`.img-placeholder` with an HTML comment above it stating the exact path
the real photo should use. Property photos follow a per-property folder
structure:

```
assets/images/properties/property-01/
  exterior.jpg
  living-room.jpg
  kitchen.jpg
  bedroom.jpg
  bathroom.jpg
  additional-space.jpg
```

...through `property-08/`, matching the 8 sample properties in
`js/data.js` in order. Drop real photos in using those exact filenames and
the placeholders just need swapping for `<img>` tags — no other code
changes required. Agent and testimonial photos follow the same pattern
under `assets/images/agents/` and `assets/images/testimonials/`.

## Running it locally

No build step. From the project root:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.
