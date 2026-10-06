/* ==========================================================================
   NEXORA REALTY — MAIN.JS
   Sitewide behavior shared by every page: navbar (mobile menu + scroll
   shadow), scroll-reveal animation, counter animation, and the WhatsApp
   deep-link helper used anywhere an agent or owner can be contacted.
   Page-specific rendering lives in its own file (e.g. home.js if a page
   needs it) and runs after this file.
   ========================================================================== */

/* ---------- Navbar ---------- */
function initNavbar() {
  const navbar = document.querySelector("[data-navbar]");
  const toggle = document.querySelector("[data-navbar-toggle]");
  const mobileMenu = document.querySelector("[data-navbar-mobile]");

  if (!navbar) return;

  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const currentListingType = new URLSearchParams(window.location.search).get("listingType");
  const isCurrentLink = (link) => {
    const url = new URL(link.href, window.location.href);
    const linkPage = url.pathname.split("/").pop() || "index.html";
    const linkListingType = url.searchParams.get("listingType");

    if (linkPage === "properties.html") {
      return currentPage === "properties.html" && linkListingType === currentListingType;
    }

    return linkPage === currentPage;
  };

  navbar.querySelectorAll(".navbar-link").forEach((link) => {
    link.classList.toggle("is-active", isCurrentLink(link));
    if (link.classList.contains("is-active")) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  window.addEventListener(
    "scroll",
    () => {
      navbar.classList.toggle("is-scrolled", window.scrollY > 8);
    },
    { passive: true }
  );

  if (toggle && mobileMenu) {
    toggle.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("is-open");
      toggle.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close the mobile menu when a link inside it is tapped
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }
}

/* ---------- Scroll reveal ---------- */
function initScrollReveal() {
  const revealEls = document.querySelectorAll(".reveal");
  if (!revealEls.length) return;

  if (!("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => observer.observe(el));
}

/* ---------- Counter animation ---------- */
function initCounters() {
  const counters = document.querySelectorAll("[data-counter-target]");
  if (!counters.length) return;

  const animateCounter = (el) => {
    const target = Number(el.getAttribute("data-counter-target"));
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(target * eased).toLocaleString("en-NG");
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
}

/* ---------- WhatsApp deep link helper ----------
   Reused on property details, agent profile, and the "list with agent" flow.
   Always routes through wa.me so it works with or without WhatsApp installed. */
function buildWhatsAppLink({ phone, message }) {
  const digitsOnly = String(phone).replace(/[^\d]/g, "");
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}

function whatsAppMessageForProperty(property) {
  return (
    `Hi, I'm interested in "${property.title}" in ${property.location} ` +
    `listed at ${formatPrice(property.price)}. Is it still available?`
  );
}

const LUCIDE_ICON_PATHS = {
  "arrow-left": '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  "arrow-right": '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  "badge-check": '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.77 4 4 0 0 1 0 6.76 4 4 0 0 1-4.78 4.77 4 4 0 0 1-6.74 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
  bath: '<path d="M9 6 6.5 3.5a2.12 2.12 0 0 0-3 3L6 9"/><path d="M10 5 8 7"/><path d="M2 12h20"/><path d="M7 12v4a5 5 0 0 0 10 0v-4"/><path d="M5 21v-2"/><path d="M19 21v-2"/>',
  bed: '<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/><path d="M6 12h4"/>',
  building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
  "building-2": '<path d="M6 22V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v19"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 8h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2"/><path d="M10 6h4M10 10h4M10 14h4M10 18h4"/>',
  "chart-no-axes-column": '<path d="M5 21v-6"/><path d="M12 21V3"/><path d="M19 21V9"/>',
  check: '<path d="m20 6-11 11-5-5"/>',
  "chevron-down": '<path d="m6 9 6 6 6-6"/>',
  "chevron-left": '<path d="m15 18-6-6 6-6"/>',
  "chevron-right": '<path d="m9 18 6-6-6-6"/>',
  eye: '<path d="M2.06 12.34a1 1 0 0 1 0-.68 10 10 0 0 1 19.88 0 1 1 0 0 1 0 .68 10 10 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>',
  heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"/>',
  home: '<path d="m3 10 9-7 9 7"/><path d="M5 9v12h14V9"/><path d="M9 21v-7h6v7"/>',
  "tree-pine": '<path d="m17 14 3 5H4l3-5"/><path d="m15 8 3 5H6l3-5"/><path d="m12 2 3 5H9l3-5"/><path d="M12 19v3"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  "map-pin": '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  "message-circle": '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  minus: '<path d="M5 12h14"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  ruler: '<path d="M21.3 8.7 15.3 2.7a1 1 0 0 0-1.4 0L2.7 13.9a1 1 0 0 0 0 1.4l6 6a1 1 0 0 0 1.4 0L21.3 10.1a1 1 0 0 0 0-1.4Z"/><path d="m7.5 10.5 2 2M10.5 7.5l2 2M13.5 4.5l2 2M4.5 13.5l2 2"/>',
  scale: '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 4-1 5-3h4c1 2 3 3 5 3h2"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
  star: '<path d="m12 3 2.8 5.67 6.26.91-4.53 4.42 1.07 6.24L12 17.29l-5.6 2.95 1.07-6.24L2.94 9.58l6.26-.91L12 3Z"/>',
  "trash-2": '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m19 6-1 14H6L5 6"/><path d="M10 11v5M14 11v5"/>',
  "user-round": '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  "x": '<path d="m18 6-12 12"/><path d="m6 6 12 12"/>'
};

function lucideIcon(name, { filled = false } = {}) {
  const paths = LUCIDE_ICON_PATHS[name];
  if (!paths) return "";
  return `<svg class="lucide-icon${filled ? " lucide-icon-filled" : ""}" viewBox="0 0 24 24" fill="${filled ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

function ratingStarsMarkup(rating) {
  return Array.from({ length: 5 }, (_, index) =>
    lucideIcon("star", { filled: index < rating })
  ).join("");
}

/* ---------- Property type metadata ----------
   Shared label/icon lookup for property.type, used on the specs bar
   (property-details.js) and the comparison table (compare.js). */
const TYPE_META = {
  house: { label: "House", icon: "home" },
  apartment: { label: "Apartment", icon: "building-2" },
  villa: { label: "Villa", icon: "home" },
  land: { label: "Land", icon: "tree-pine" },
  commercial: { label: "Commercial", icon: "building" },
  office: { label: "Office", icon: "building-2" }
};

function typeLabel(type) {
  return (TYPE_META[type] && TYPE_META[type].label) || type;
}

function typeIcon(type) {
  return lucideIcon((TYPE_META[type] && TYPE_META[type].icon) || "home");
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function propertyPublisherLabel(property) {
  if (property.listedByRole === "owner") {
    return property.accountName
      ? `Owner: ${escapeHTML(property.accountName)}`
      : "Listed by Owner";
  }
  return property.listedByRole === "agent" ? "Listed by Agent" : "";
}

/* ---------- Homepage renderers ----------
   These only run if the target containers exist, so main.js stays safe to
   load on every page even though this markup only lives on index.html. */

function propertyCardMarkup(property, options = {}) {
  const badge =
    property.listingType === "sale"
      ? '<span class="badge badge-sale">For Sale</span>'
      : '<span class="badge badge-rent">For Rent</span>';
  const featuredBadge = property.featured
    ? '<span class="badge badge-featured">Featured</span>'
    : "";
  const publisherLabel = propertyPublisherLabel(property);
  const listedByBadge = publisherLabel ? `<span class="badge">${publisherLabel}</span>` : "";
  const priceSuffix = property.listingType === "rent" ? " / year" : "";
  const primaryImage = property.images?.[0] || "";
  const imagePath = getAssetPath(primaryImage);

  const compareToggle = options.showCompare
    ? `
      <label class="property-card-compare">
        <input
          type="checkbox"
          data-compare-toggle="${property.id}"
          ${options.compareChecked ? "checked" : ""}
        />
        <span>Compare</span>
      </label>
    `
    : "";

  return `
    <article class="property-card card card-hover">
      <a href="property-details.html?id=${property.id}" class="property-card-media">
        <div class="img-placeholder">
          ${imagePath ? `<img
            src="${imagePath}"
            alt="${property.title}"
            onload="this.nextElementSibling.style.display='none'"
            onerror="this.remove()"
          />` : ""}
          <span>Photo coming soon</span>
        </div>
        <div class="property-card-badges">${badge}${featuredBadge}${listedByBadge}</div>
        <button
          class="btn-icon property-card-fav"
          data-favorite-toggle="${property.id}"
          aria-label="Save ${property.title} to favorites"
          aria-pressed="false"
        >${lucideIcon("heart")}</button>
      </a>
      <div class="property-card-body">
        <p class="property-card-price">${formatPrice(property.price)}${priceSuffix}</p>
        <h3 class="property-card-title">
          <a href="property-details.html?id=${property.id}">${property.title}</a>
        </h3>
        <p class="property-card-location">${property.location}</p>
        <ul class="property-card-specs">
          ${property.bedrooms ? `<li>${property.bedrooms} Beds</li>` : ""}
          ${property.bathrooms ? `<li>${property.bathrooms} Baths</li>` : ""}
          <li>${property.area} sqm</li>
        </ul>
        <div class="property-card-footer-row">
          <a href="property-details.html?id=${property.id}" class="property-card-cta">
            View Property ${lucideIcon("arrow-right")}
          </a>
          ${compareToggle}
        </div>
      </div>
    </article>
  `;
}

function renderFeaturedProperties() {
  const grid = document.querySelector("[data-featured-properties]");
  if (!grid) return;

  const latestProperties = [...getPublicProperties()]
    .sort((a, b) => {
      const publishedAt = (property) =>
        Date.parse(property.publishedAt || property.createdAt || property.updatedAt || "") || 0;
      return publishedAt(b) - publishedAt(a);
    })
    .slice(0, 6);
  grid.innerHTML = latestProperties.map(propertyCardMarkup).join("");
  initFavoriteButtons(grid);
}

function agentCardMarkup(agent) {
  const verifiedBadge = agent.verified
    ? `<span class="badge badge-verified">${lucideIcon("badge-check")} Verified</span>`
    : "";

  const listingsCount = getPublicProperties().filter(
    (p) => p.agent === agent.id
  ).length;

  const initials = agent.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return `
    <article class="agent-card card card-hover">
      <a href="agent-profile.html?id=${agent.id}" class="agent-card-photo">
        <div class="img-placeholder">
          <img
            src="${getAssetPath(agent.photo)}"
            alt="${agent.name}"
            loading="lazy"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
          >
          <span style="${agent.photo ? "display:none;" : "display:flex;"}">${initials}</span>
        </div>
      </a>

      <div class="agent-card-body">
        <h3 class="agent-card-name">
          <a href="agent-profile.html?id=${agent.id}">${agent.name}</a>
        </h3>

        ${verifiedBadge}

        <p class="agent-card-meta">
          ${agent.experienceYears} yrs experience &middot; ${listingsCount} listings
        </p>

        <p class="agent-card-rating">
          ${lucideIcon("star", { filled: true })} ${agent.rating.toFixed(1)} (${agent.reviewCount} reviews)
        </p>

        <a href="agent-profile.html?id=${agent.id}" class="agent-card-cta">
          View Profile ${lucideIcon("arrow-right")}
        </a>
      </div>
    </article>
  `;
}

function renderFeaturedAgents() {
  const grid = document.querySelector("[data-featured-agents]");
  if (!grid) return;
  grid.innerHTML = NEXORA_AGENTS.map(agentCardMarkup).join("");
}

function testimonialCardMarkup(testimonial) {
  return `
    <article class="testimonial-card card">
      <p class="testimonial-quote">&ldquo;${testimonial.quote}&rdquo;</p>
      <div class="testimonial-author">
        <div class="img-placeholder testimonial-avatar">
          <img
            src="${testimonial.avatar || ""}"
            alt="${testimonial.name}"
            loading="lazy"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
          >
          <span style="${testimonial.avatar ? "display:none;" : "display:flex;"}">${testimonial.name.split(" ").map((n) => n[0]).join("")}</span>
        </div>
        <div>
          <p class="testimonial-name">${testimonial.name}</p>
          <p class="testimonial-role">${testimonial.role}</p>
        </div>
      </div>
    </article>
  `;
}

function renderTestimonials() {
  const grid = document.querySelector("[data-testimonials]");
  if (!grid) return;
  grid.innerHTML = NEXORA_TESTIMONIALS.map(testimonialCardMarkup).join("");
}

function locationCardMarkup(district, count) {
  const locationProperties = getPublicProperties().filter(
    (property) => getDistrictName(property.location) === district
  );
  const locationProperty =
    locationProperties.find((property) => property.images?.some((image) => image.startsWith("data:image/"))) ||
    locationProperties.find((property) => property.images?.length);
  const uploadedImage = locationProperty?.images?.find((image) => image.startsWith("data:image/"));
  const locationImage = getAssetPath(
    uploadedImage || locationProperty?.images?.[0] || NEXORA_LOCATION_IMAGES[district] || ""
  );

  return `
    <a class="location-card card card-hover" href="properties.html?location=${encodeURIComponent(district)}">
      <div class="img-placeholder location-card-media">
        <img
          src="${locationImage}"
          alt="Properties in ${district}"
          loading="lazy"
          onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
        >
        <span style="${locationImage ? "display:none;" : "display:flex;"}">${district}</span>
      </div>
      <div class="location-card-body">
        <h3 class="location-card-name">${district}</h3>
        <p class="location-card-count">${count} Listing${count === 1 ? "" : "s"}</p>
      </div>
    </a>
  `;
}

function renderPopularLocations() {
  const grid = document.querySelector("[data-popular-locations]");
  if (!grid) return;

  const counts = new Map();
  getPublicProperties().forEach((property) => {
    const district = getDistrictName(property.location);
    counts.set(district, (counts.get(district) || 0) + 1);
  });

  const topLocations = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  grid.innerHTML = topLocations.map(([district, count]) => locationCardMarkup(district, count)).join("");
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  renderFeaturedProperties();
  renderPopularLocations();
  renderFeaturedAgents();
  renderTestimonials();
  initScrollReveal();
  initCounters();
  // Not every page loads favorites.js (e.g. the dashboard's sidebar has no
  // favorites icon), so guard against it being undefined rather than
  // forcing every page to load a script it doesn't otherwise need.
  if (typeof updateFavoritesBadge === "function") updateFavoritesBadge();
});
