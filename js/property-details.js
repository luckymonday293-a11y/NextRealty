/* ==========================================================================
   NEXORA REALTY — PROPERTY-DETAILS.JS
   Reads ?id= from the URL, renders one property in full (gallery, specs,
   description, amenities, agent card), and wires up Save / Share /
   WhatsApp / Send Inquiry. Relies on data.js, favorites.js, and main.js
   (propertyCardMarkup, typeLabel, typeIcon, buildWhatsAppLink,
   whatsAppMessageForProperty) having already loaded.
   ========================================================================== */

/**
 * Turns an image path like ".../property-01/living-room.jpeg" into the
 * human label "Living Room" for gallery captions and alt text.
 */
function galleryLabelFromPath(path) {
  const filename = path.split("/").pop().replace(/\.[a-z]+$/i, "");
  return filename
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/* ---------- Gallery ---------- */

let galleryIndex = 0;
let galleryImages = [];

function renderGallery(property) {
  galleryImages = property.images || [];

  const thumbsContainer = document.querySelector("[data-gallery-thumbs]");
  if (!thumbsContainer || galleryImages.length === 0) return;

  thumbsContainer.innerHTML = galleryImages
    .map((path, index) => {
      const label = galleryLabelFromPath(path);

      return `
        <button
          type="button"
          class="gallery-thumb ${index === 0 ? "is-active" : ""}"
          data-gallery-index="${index}"
          aria-label="Show ${label} photo"
        >
          <span class="img-placeholder">
            <img
              src="${path}"
              alt="${label}"
              onerror="this.remove()"
            >
            <span>${label}</span>
          </span>
        </button>
      `;
    })
    .join("");

  thumbsContainer.querySelectorAll("[data-gallery-index]").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      setGalleryIndex(Number(thumb.getAttribute("data-gallery-index")));
    });
  });

  setGalleryIndex(0);
}

function setGalleryIndex(index) {
  const total = galleryImages.length;
  if (!total) return;

  galleryIndex = ((index % total) + total) % total;

  const mainImage = document.querySelector("[data-gallery-image]");
  const mainLabel = document.querySelector("[data-gallery-label]");
  const counter = document.querySelector("[data-gallery-counter]");

  const currentPath = galleryImages[galleryIndex];
  const currentLabel = galleryLabelFromPath(currentPath);

  if (mainImage) {
    mainImage.src = currentPath;
    mainImage.alt = currentLabel;
    mainImage.style.display = "block";
  }

  if (mainLabel) {
    mainLabel.textContent = currentLabel;
  }

  if (counter) {
    counter.textContent = `${galleryIndex + 1} / ${total}`;
  }

  document.querySelectorAll("[data-gallery-index]").forEach((thumb) => {
    thumb.classList.toggle(
      "is-active",
      Number(thumb.getAttribute("data-gallery-index")) === galleryIndex
    );
  });
}

function initGalleryControls() {
  document
    .querySelector("[data-gallery-prev]")
    ?.addEventListener("click", () => {
      setGalleryIndex(galleryIndex - 1);
    });

  document
    .querySelector("[data-gallery-next]")
    ?.addEventListener("click", () => {
      setGalleryIndex(galleryIndex + 1);
    });
}

/* ---------- Header, specs, description, amenities ---------- */

function renderHeader(property) {
  document.title = `${property.title} — Nexora Realty`;

  const setText = (selector, text) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = text;
  };

  setText("[data-property-title]", property.title);
  setText("[data-property-location]", property.location);
  setText(
    "[data-property-price]",
    formatPrice(property.price) + (property.listingType === "rent" ? " / year" : "")
  );
  setText("[data-property-views]", `${property.views.toLocaleString("en-NG")} views`);

  const badgesEl = document.querySelector("[data-property-badges]");
  if (badgesEl) {
    const listingBadge =
      property.listingType === "sale"
        ? '<span class="badge badge-sale">For Sale</span>'
        : '<span class="badge badge-rent">For Rent</span>';
    const featuredBadge = property.featured ? '<span class="badge badge-featured">Featured</span>' : "";
    badgesEl.innerHTML = listingBadge + featuredBadge;
  }

  const breadcrumbTitle = document.querySelector("[data-breadcrumb-title]");
  if (breadcrumbTitle) breadcrumbTitle.textContent = property.title;
}

function renderSpecs(property) {
  const specsEl = document.querySelector("[data-property-specs]");
  if (!specsEl) return;

  const specs = [
    property.bedrooms ? { icon: "&#128719;", label: "Bedrooms", value: property.bedrooms } : null,
    property.bathrooms ? { icon: "&#128705;", label: "Bathrooms", value: property.bathrooms } : null,
    { icon: "&#128207;", label: "Area", value: `${property.area} sqm` },
    { icon: typeIcon(property.type), label: "Type", value: typeLabel(property.type) }
  ].filter(Boolean);

  specsEl.innerHTML = specs
    .map(
      (spec) => `
        <div class="spec-item">
          <span class="spec-icon" aria-hidden="true">${spec.icon}</span>
          <span class="spec-value">${spec.value}</span>
          <span class="spec-label">${spec.label}</span>
        </div>
      `
    )
    .join("");
}

function renderDescriptionAndAmenities(property) {
  const descEl = document.querySelector("[data-property-description]");
  if (descEl) descEl.textContent = property.description;

  const amenitiesEl = document.querySelector("[data-property-amenities]");
  if (amenitiesEl) {
    amenitiesEl.innerHTML = property.amenities
      .map((item) => `<li><span aria-hidden="true">&#10003;</span> ${item}</li>`)
      .join("");
  }
}

/* ---------- Agent card & contact actions ---------- */

function renderAgent(property) {
  const agent = getAgentById(property.agent);
  const agentEl = document.querySelector("[data-agent-card]");
  if (!agentEl || !agent) return;

  const verifiedBadge = agent.verified ? '<span class="badge badge-verified">&#10003; Verified</span>' : "";
  const initials = agent.name.split(" ").map((n) => n[0]).join("");

  agentEl.innerHTML = `
    <a href="agent-profile.html?id=${agent.id}" class="agent-mini-photo">
      <!-- Replace with real agent photo: ${agent.photo} -->
      <div class="img-placeholder"><span>${initials}</span></div>
    </a>
    <div class="agent-mini-body">
      <h3 class="agent-mini-name"><a href="agent-profile.html?id=${agent.id}">${agent.name}</a></h3>
      ${verifiedBadge}
      <p class="agent-mini-meta">${agent.experienceYears} yrs experience</p>
      <p class="agent-mini-rating">&#9733; ${agent.rating.toFixed(1)} (${agent.reviewCount} reviews)</p>
    </div>
  `;

  const whatsappBtn = document.querySelector("[data-whatsapp-agent]");
  if (whatsappBtn) {
    whatsappBtn.href = buildWhatsAppLink({
      phone: agent.phone,
      message: whatsAppMessageForProperty(property)
    });
  }
}

function initSaveAndShare(property) {
  const favBtn = document.getElementById("details-fav-btn");
  if (favBtn) favBtn.setAttribute("data-favorite-toggle", property.id);

  initFavoriteButtons(document);

  const shareBtn = document.querySelector("[data-share-property]");
  if (!shareBtn) return;

  shareBtn.addEventListener("click", async () => {
    const shareData = {
      title: property.title,
      text: `${property.title} — ${formatPrice(property.price)} in ${property.location}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled the share sheet — nothing to do.
      }
      return;
    }

    const originalLabel = shareBtn.textContent;
    try {
      await navigator.clipboard.writeText(window.location.href);
      shareBtn.textContent = "Link Copied!";
    } catch (error) {
      window.prompt("Copy this link:", window.location.href);
      shareBtn.textContent = originalLabel;
      return;
    }
    setTimeout(() => {
      shareBtn.textContent = originalLabel;
    }, 2000);
  });
}

/* ---------- Send Inquiry ---------- */

function initInquiryForm(property) {
  const toggleBtn = document.querySelector("[data-inquiry-toggle]");
  const panel = document.querySelector("[data-inquiry-panel]");
  const form = document.querySelector("[data-inquiry-form]");
  const successEl = document.querySelector("[data-inquiry-success]");

  if (!toggleBtn || !panel || !form) return;

  toggleBtn.addEventListener("click", () => {
    const isOpen = panel.classList.toggle("is-open");
    toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    submitInquiry({
      propertyId: property.id,
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      message: formData.get("message")
    });

    form.hidden = true;
    if (successEl) successEl.hidden = false;
  });
}

/* ---------- Similar properties ---------- */

function renderSimilarProperties(property) {
  const grid = document.querySelector("[data-similar-properties]");
  if (!grid) return;

  const sameDistrict = getDistrictName(property.location);
  let similar = NEXORA_PROPERTIES.filter(
    (p) => p.id !== property.id && (p.type === property.type || getDistrictName(p.location) === sameDistrict)
  );

  if (similar.length < 3) {
    const fallback = NEXORA_PROPERTIES.filter((p) => p.id !== property.id && !similar.includes(p));
    similar = similar.concat(fallback);
  }

  grid.innerHTML = similar.slice(0, 3).map(propertyCardMarkup).join("");
  initFavoriteButtons(grid);
}

/* ---------- Init ---------- */

function renderNotFound() {
  document.querySelector("[data-details-content]")?.setAttribute("hidden", "true");
  document.querySelector("[data-not-found]")?.removeAttribute("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get("id");
  // No id at all (e.g. a bare preview visit) falls back to a sample
  // property; an id that's present but doesn't match anything is a real
  // "not found" case.
  const property = requestedId ? getPropertyById(requestedId) : NEXORA_PROPERTIES[0];

  if (!property) {
    renderNotFound();
    return;
  }

  renderHeader(property);
  renderGallery(property);
  initGalleryControls();
  renderSpecs(property);
  renderDescriptionAndAmenities(property);
  renderAgent(property);
  initSaveAndShare(property);
  initInquiryForm(property);
  renderSimilarProperties(property);
  trackRecentlyViewed(property.id);
});
