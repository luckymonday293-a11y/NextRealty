/* ==========================================================================
   NEXORA REALTY — FAVORITES
   Sitewide "save property" system. Works without an account by persisting
   property IDs to localStorage. Loaded on every page so the navbar badge
   and any favorite buttons on that page stay in sync.
   ========================================================================== */

const FAVORITES_KEY = "nexora_favorites";

function getFavoriteIds() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn("Could not read favorites from storage:", error);
    return [];
  }
}

function isFavorite(propertyId) {
  return getFavoriteIds().includes(propertyId);
}

function toggleFavorite(propertyId) {
  const current = getFavoriteIds();
  const index = current.indexOf(propertyId);

  if (index === -1) {
    current.push(propertyId);
  } else {
    current.splice(index, 1);
  }

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(current));
  updateFavoritesBadge();
  return current.includes(propertyId);
}

/**
 * Updates every favorite-count badge on the current page (usually just the
 * one in the navbar, but supports multiple in case a page adds another).
 */
function updateFavoritesBadge() {
  const count = getFavoriteIds().length;
  document.querySelectorAll("[data-favorites-count]").forEach((el) => {
    el.textContent = count;
    el.style.display = count > 0 ? "flex" : "none";
  });
}

/**
 * Wires up any element with [data-favorite-toggle="PROPERTY_ID"] so clicking
 * it toggles that property's favorite state and reflects the state visually.
 * Call this again after re-rendering a list of cards.
 */
function initFavoriteButtons(scope = document) {
  scope.querySelectorAll("[data-favorite-toggle]").forEach((button) => {
    const propertyId = button.getAttribute("data-favorite-toggle");
    button.classList.toggle("is-active", isFavorite(propertyId));
    button.setAttribute("aria-pressed", isFavorite(propertyId) ? "true" : "false");

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const nowActive = toggleFavorite(propertyId);
      button.classList.toggle("is-active", nowActive);
      button.setAttribute("aria-pressed", nowActive ? "true" : "false");
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateFavoritesBadge();
});

/* ==========================================================================
   RECENTLY VIEWED
   Same localStorage approach as favorites, tracking the last 6 properties
   a buyer opened the details page for. Recorded from property-details.js;
   any page can read it back with getRecentlyViewedIds().
   ========================================================================== */

const RECENTLY_VIEWED_KEY = "nexora_recently_viewed";
const RECENTLY_VIEWED_LIMIT = 6;

function getRecentlyViewedIds() {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn("Could not read recently viewed from storage:", error);
    return [];
  }
}

function trackRecentlyViewed(propertyId) {
  const current = getRecentlyViewedIds().filter((id) => id !== propertyId);
  current.unshift(propertyId);
  localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(current.slice(0, RECENTLY_VIEWED_LIMIT)));
}

/* ==========================================================================
   FAVORITES PAGE
   Everything below only runs if favorites.html's containers are present on
   the page (same defensive pattern as main.js's homepage renderers), so
   loading favorites.js elsewhere stays a no-op for this section.
   ========================================================================== */

const COMPARE_LIMIT = 3;
let compareSelection = [];

function getValidFavoriteProperties() {
  return getFavoriteIds()
    .map((id) => getPropertyById(id))
    .filter(Boolean);
}

function renderCompareBar() {
  const bar = document.querySelector("[data-compare-bar]");
  if (!bar) return;

  if (compareSelection.length === 0) {
    bar.hidden = true;
    return;
  }

  bar.hidden = false;
  const countLabel = document.querySelector("[data-compare-count]");
  const compareBtn = document.querySelector("[data-compare-go]");

  if (countLabel) {
    countLabel.textContent = `${compareSelection.length} of ${COMPARE_LIMIT} selected`;
  }
  if (compareBtn) {
    const canCompare = compareSelection.length >= 2;
    compareBtn.toggleAttribute("disabled", !canCompare);
    compareBtn.setAttribute("aria-disabled", canCompare ? "false" : "true");
    compareBtn.tabIndex = canCompare ? 0 : -1;
    compareBtn.href = canCompare ? `compare.html?ids=${compareSelection.join(",")}` : "#";
  }
}

function handleCompareToggle(event) {
  const checkbox = event.target.closest("[data-compare-toggle]");
  if (!checkbox) return;

  const propertyId = checkbox.getAttribute("data-compare-toggle");

  if (checkbox.checked) {
    if (compareSelection.length >= COMPARE_LIMIT) {
      checkbox.checked = false;
      const bar = document.querySelector("[data-compare-bar]");
      const countLabel = document.querySelector("[data-compare-count]");
      if (countLabel) {
        countLabel.textContent = `You can compare up to ${COMPARE_LIMIT} properties`;
        setTimeout(renderCompareBar, 1800);
      }
      if (bar) bar.hidden = false;
      return;
    }
    compareSelection.push(propertyId);
  } else {
    compareSelection = compareSelection.filter((id) => id !== propertyId);
  }

  renderCompareBar();
}

function renderFavoritesPage() {
  const grid = document.querySelector("[data-favorites-grid]");
  if (!grid) return; // not on favorites.html

  const emptyState = document.querySelector("[data-favorites-empty]");
  const countEl = document.querySelector("[data-favorites-page-count]");
  const properties = getValidFavoriteProperties();

  // Drop anything from the compare selection that's no longer favorited.
  const stillFavorited = new Set(properties.map((p) => p.id));
  compareSelection = compareSelection.filter((id) => stillFavorited.has(id));

  if (countEl) {
    countEl.textContent =
      properties.length === 0
        ? "No saved properties yet"
        : `${properties.length} propert${properties.length === 1 ? "y" : "ies"} saved`;
  }

  if (properties.length === 0) {
    grid.hidden = true;
    grid.innerHTML = "";
    if (emptyState) emptyState.hidden = false;
    renderCompareBar();
    return;
  }

  if (emptyState) emptyState.hidden = true;
  grid.hidden = false;
  grid.innerHTML = properties
    .map((property) =>
      propertyCardMarkup(property, {
        showCompare: true,
        compareChecked: compareSelection.includes(property.id)
      })
    )
    .join("");

  initFavoriteButtons(grid);

  // Re-render this page whenever a card's favorite heart is un-toggled,
  // so the card disappears immediately rather than just changing color.
  grid.querySelectorAll("[data-favorite-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!isFavorite(button.getAttribute("data-favorite-toggle"))) {
        renderFavoritesPage();
      }
    });
  });

  grid.addEventListener("change", handleCompareToggle);
  renderCompareBar();
}

function renderRecentlyViewedSection() {
  const grid = document.querySelector("[data-recently-viewed-grid]");
  if (!grid) return; // not on favorites.html

  const section = document.querySelector("[data-recently-viewed-section]");
  const properties = getRecentlyViewedIds()
    .map((id) => getPropertyById(id))
    .filter(Boolean);

  if (properties.length === 0) {
    if (section) section.hidden = true;
    return;
  }

  if (section) section.hidden = false;
  grid.innerHTML = properties.map((property) => propertyCardMarkup(property)).join("");
  initFavoriteButtons(grid);
}

document.addEventListener("DOMContentLoaded", () => {
  renderFavoritesPage();
  renderRecentlyViewedSection();
});
