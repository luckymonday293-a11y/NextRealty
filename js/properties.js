/* ==========================================================================
   NEXORA REALTY — PROPERTIES.JS
   Drives the property listings page: reads filters from the URL (so links
   from the homepage search and nav keep working), filters/sorts the shared
   NEXORA_PROPERTIES array, paginates the results, and keeps the URL in
   sync as the user changes filters so the page stays bookmarkable.
   Relies on data.js (NEXORA_PROPERTIES, formatPrice) and main.js
   (propertyCardMarkup, initFavoriteButtons) having already loaded.
   ========================================================================== */

const PROPERTIES_PER_PAGE = 6;
const RESULTS_LOAD_DELAY_MS = 350; // simulates first-fetch latency against a future API

let currentFilters = {
  search: "",
  type: "",
  listingType: "",
  minPrice: null,
  maxPrice: null,
  bedrooms: 0,
  bathrooms: 0
};
let currentSort = "featured";
let currentPage = 1;

function debounce(fn, delayMs) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
}

/* ---------- URL <-> state ---------- */

function readStateFromURL() {
  const params = new URLSearchParams(window.location.search);
  currentFilters.search = params.get("location") || params.get("search") || "";
  currentFilters.type = params.get("type") || "";
  currentFilters.listingType = params.get("listingType") || "";
  currentFilters.minPrice = params.get("minPrice") ? Number(params.get("minPrice")) : null;
  currentFilters.maxPrice = params.get("maxPrice") ? Number(params.get("maxPrice")) : null;
  currentFilters.bedrooms = params.get("bedrooms") ? Number(params.get("bedrooms")) : 0;
  currentFilters.bathrooms = params.get("bathrooms") ? Number(params.get("bathrooms")) : 0;
  currentSort = params.get("sort") || "featured";
}

function applyStateToForm() {
  const setValue = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  };

  setValue("filter-search", currentFilters.search);
  setValue("filter-type", currentFilters.type);
  setValue("filter-listing", currentFilters.listingType);
  setValue("filter-min-price", currentFilters.minPrice ?? "");
  setValue("filter-max-price", currentFilters.maxPrice ?? "");
  setValue("filter-bedrooms", String(currentFilters.bedrooms));
  setValue("filter-bathrooms", String(currentFilters.bathrooms));
  setValue("sort-select", currentSort);
}

function syncStateToURL() {
  const params = new URLSearchParams();
  if (currentFilters.search) params.set("location", currentFilters.search);
  if (currentFilters.type) params.set("type", currentFilters.type);
  if (currentFilters.listingType) params.set("listingType", currentFilters.listingType);
  if (currentFilters.minPrice) params.set("minPrice", currentFilters.minPrice);
  if (currentFilters.maxPrice) params.set("maxPrice", currentFilters.maxPrice);
  if (currentFilters.bedrooms) params.set("bedrooms", currentFilters.bedrooms);
  if (currentFilters.bathrooms) params.set("bathrooms", currentFilters.bathrooms);
  if (currentSort !== "featured") params.set("sort", currentSort);

  const query = params.toString();
  const newUrl = window.location.pathname + (query ? `?${query}` : "");
  history.replaceState(null, "", newUrl);
}

/* ---------- Filtering & sorting ---------- */

function getFilteredProperties() {
  const search = currentFilters.search.trim().toLowerCase();

  return NEXORA_PROPERTIES.filter((property) => {
    if (
      search &&
      !property.title.toLowerCase().includes(search) &&
      !property.location.toLowerCase().includes(search)
    ) {
      return false;
    }
    if (currentFilters.type && property.type !== currentFilters.type) return false;
    if (currentFilters.listingType && property.listingType !== currentFilters.listingType) return false;
    if (currentFilters.minPrice && property.price < currentFilters.minPrice) return false;
    if (currentFilters.maxPrice && property.price > currentFilters.maxPrice) return false;
    if (currentFilters.bedrooms && property.bedrooms < currentFilters.bedrooms) return false;
    if (currentFilters.bathrooms && property.bathrooms < currentFilters.bathrooms) return false;
    return true;
  });
}

function sortProperties(list) {
  const sorted = [...list];

  switch (currentSort) {
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price);
      break;
    case "most-viewed":
      sorted.sort((a, b) => b.views - a.views);
      break;
    default: // "featured"
      sorted.sort((a, b) => Number(b.featured) - Number(a.featured) || b.views - a.views);
  }

  return sorted;
}

/* ---------- Rendering ---------- */

function renderPagination(totalPages) {
  const nav = document.querySelector("[data-pagination]");
  if (!nav) return;

  if (totalPages <= 1) {
    nav.innerHTML = "";
    return;
  }

  let markup = `<button type="button" class="pagination-btn" data-page="prev" ${
    currentPage === 1 ? "disabled" : ""
  } aria-label="Previous page">&larr;</button>`;

  for (let page = 1; page <= totalPages; page++) {
    markup += `<button type="button" class="pagination-btn ${
      page === currentPage ? "is-active" : ""
    }" data-page="${page}" aria-current="${page === currentPage ? "page" : "false"}">${page}</button>`;
  }

  markup += `<button type="button" class="pagination-btn" data-page="next" ${
    currentPage === totalPages ? "disabled" : ""
  } aria-label="Next page">&rarr;</button>`;

  nav.innerHTML = markup;

  nav.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.getAttribute("data-page");
      if (value === "prev") currentPage -= 1;
      else if (value === "next") currentPage += 1;
      else currentPage = Number(value);

      renderResults();
      document.querySelector(".listings-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function renderResults() {
  const grid = document.querySelector("[data-properties-grid]");
  const emptyState = document.querySelector("[data-empty-state]");
  const countLabel = document.querySelector("[data-results-count]");
  if (!grid) return;

  const filtered = sortProperties(getFilteredProperties());
  const totalPages = Math.max(1, Math.ceil(filtered.length / PROPERTIES_PER_PAGE));
  currentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const start = (currentPage - 1) * PROPERTIES_PER_PAGE;
  const pageItems = filtered.slice(start, start + PROPERTIES_PER_PAGE);

  if (countLabel) {
    countLabel.textContent =
      filtered.length === 0
        ? "No properties found"
        : `Showing ${start + 1}\u2013${start + pageItems.length} of ${filtered.length} propert${
            filtered.length === 1 ? "y" : "ies"
          }`;
  }

  if (pageItems.length === 0) {
    grid.innerHTML = "";
    grid.hidden = true;
    if (emptyState) emptyState.hidden = false;
  } else {
    grid.hidden = false;
    if (emptyState) emptyState.hidden = true;
    grid.innerHTML = pageItems.map(propertyCardMarkup).join("");
    initFavoriteButtons(grid);
  }

  renderPagination(totalPages);
}

/* ---------- Filter wiring ---------- */

function resetFilters() {
  currentFilters = { search: "", type: "", listingType: "", minPrice: null, maxPrice: null, bedrooms: 0, bathrooms: 0 };
  currentSort = "featured";
  currentPage = 1;
  applyStateToForm();
  syncStateToURL();
  renderResults();
}

function initFilters() {
  applyStateToForm();

  const searchInput = document.getElementById("filter-search");
  if (searchInput) {
    searchInput.addEventListener(
      "input",
      debounce((event) => {
        currentFilters.search = event.target.value;
        currentPage = 1;
        syncStateToURL();
        renderResults();
      }, 300)
    );
  }

  document.querySelectorAll("[data-filter]").forEach((field) => {
    if (field.type === "text") return; // search field is wired above with debounce

    field.addEventListener("change", (event) => {
      const key = field.getAttribute("data-filter");
      const raw = event.target.value;

      if (key === "minPrice" || key === "maxPrice") {
        currentFilters[key] = raw ? Number(raw) : null;
      } else if (key === "bedrooms" || key === "bathrooms") {
        currentFilters[key] = raw ? Number(raw) : 0;
      } else {
        currentFilters[key] = raw;
      }

      currentPage = 1;
      syncStateToURL();
      renderResults();
    });
  });

  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", (event) => {
      currentSort = event.target.value;
      currentPage = 1;
      syncStateToURL();
      renderResults();
    });
  }

  document.querySelectorAll("[data-filters-reset], [data-empty-reset]").forEach((button) => {
    button.addEventListener("click", resetFilters);
  });
}

function initFilterToggle() {
  const toggle = document.querySelector("[data-filters-toggle]");
  const panel = document.querySelector("[data-filters-panel]");
  if (!toggle || !panel) return;

  toggle.addEventListener("click", () => {
    const isOpen = panel.classList.toggle("is-open");
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  readStateFromURL();
  initFilters();
  initFilterToggle();

  // The skeleton cards already in the HTML stay visible briefly to mirror
  // how this page will behave once results come from a real API call.
  window.setTimeout(renderResults, RESULTS_LOAD_DELAY_MS);
});
