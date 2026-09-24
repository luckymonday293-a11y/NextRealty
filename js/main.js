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

/* ---------- Property type metadata ----------
   Shared label/icon lookup for property.type, used on the specs bar
   (property-details.js) and the comparison table (compare.js). */
const TYPE_META = {
  house: { label: "House", icon: "&#127968;" },
  apartment: { label: "Apartment", icon: "&#127970;" },
  villa: { label: "Villa", icon: "&#127969;" },
  land: { label: "Land", icon: "&#127793;" },
  commercial: { label: "Commercial", icon: "&#127974;" },
  office: { label: "Office", icon: "&#128188;" }
};

function typeLabel(type) {
  return (TYPE_META[type] && TYPE_META[type].label) || type;
}

function typeIcon(type) {
  return (TYPE_META[type] && TYPE_META[type].icon) || "&#127968;";
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
  const priceSuffix = property.listingType === "rent" ? " / year" : "";
  const primaryImage = property.images?.[0] || NEXORA_DEFAULT_PROPERTY_IMAGES[0];
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
        <!-- Replace this placeholder with the property's exterior photo: ${imagePath} -->
        <div class="img-placeholder">
  <img
    src="${imagePath}"
    alt="${property.title}"
    onerror="this.remove()"
  />
  <span>Photo coming soon</span>
</div>
        <div class="property-card-badges">${badge}${featuredBadge}</div>
        <button
          class="btn-icon property-card-fav"
          data-favorite-toggle="${property.id}"
          aria-label="Save ${property.title} to favorites"
          aria-pressed="false"
        >&#9825;</button>
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
            View Property <span aria-hidden="true">&rarr;</span>
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

  const properties = getPublicProperties();
  const featured = [
    ...properties.filter((property) => property.featured),
    ...properties.filter((property) => !property.featured)
  ];
  grid.innerHTML = featured.slice(0, 6).map(propertyCardMarkup).join("");
  initFavoriteButtons(grid);
}

function agentCardMarkup(agent) {
  const verifiedBadge = agent.verified
    ? '<span class="badge badge-verified">&#10003; Verified</span>'
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
          &#9733; ${agent.rating.toFixed(1)} (${agent.reviewCount} reviews)
        </p>

        <a href="agent-profile.html?id=${agent.id}" class="agent-card-cta">
          View Profile <span aria-hidden="true">&rarr;</span>
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
  const locationProperty = NEXORA_PROPERTIES.find(
    (property) => getDistrictName(property.location) === district
  );
  const locationImage = getAssetPath(
    NEXORA_LOCATION_IMAGES[district] || locationProperty?.images?.[0] || ""
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
