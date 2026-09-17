/* ==========================================================================
   NEXORA REALTY — COMPARE.JS
   Reads up to 3 property ids from ?ids=p001,p002,p003 (populated by the
   "Compare Now" button on favorites.html) and renders a side-by-side
   comparison table. Relies on data.js and main.js (formatPrice, typeLabel)
   having already loaded.
   ========================================================================== */

const COMPARE_MAX = 3;
let compareProperties = [];

function readComparePropertiesFromURL() {
  const params = new URLSearchParams(window.location.search);
  const ids = (params.get("ids") || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, COMPARE_MAX);

  return ids.map(getPropertyById).filter(Boolean);
}

function syncComparePropertiesToURL() {
  const ids = compareProperties.map((p) => p.id).join(",");
  const newUrl = window.location.pathname + (ids ? `?ids=${ids}` : "");
  history.replaceState(null, "", newUrl);
}

function removeFromCompare(propertyId) {
  compareProperties = compareProperties.filter((p) => p.id !== propertyId);
  syncComparePropertiesToURL();
  renderCompareTable();
}

function compareColumnHeader(property) {
  return `
    <th class="compare-col">
      <button
        type="button"
        class="compare-remove"
        data-compare-remove="${property.id}"
        aria-label="Remove ${property.title} from comparison"
      >&times;</button>
      <a href="property-details.html?id=${property.id}" class="compare-col-media">
        <!-- Replace with the property's exterior photo: ${property.images[0]} -->
        <div class="img-placeholder"><span>Photo</span></div>
      </a>
      <a href="property-details.html?id=${property.id}" class="compare-col-title">${property.title}</a>
    </th>
  `;
}

function addSlotHeader() {
  return `
    <th class="compare-col compare-add-slot">
      <a href="favorites.html" class="compare-add-link">
        <span aria-hidden="true">&#43;</span>
        Add Another Property
      </a>
    </th>
  `;
}

function specRow(label, values) {
  const emptyCell = compareProperties.length < COMPARE_MAX ? "<td></td>" : "";
  return `
    <tr>
      <th class="compare-row-label">${label}</th>
      ${values.map((value) => `<td>${value}</td>`).join("")}
      ${emptyCell}
    </tr>
  `;
}

function amenityRow(amenity) {
  const emptyCell = compareProperties.length < COMPARE_MAX ? "<td></td>" : "";
  const cells = compareProperties
    .map((property) =>
      property.amenities.includes(amenity)
        ? '<td class="has-amenity" aria-label="Included">&#10003;</td>'
        : '<td class="no-amenity" aria-label="Not included">&#8212;</td>'
    )
    .join("");

  return `
    <tr class="compare-amenity-row">
      <th class="compare-row-label">${amenity}</th>
      ${cells}
      ${emptyCell}
    </tr>
  `;
}

function renderCompareTable() {
  const wrap = document.querySelector("[data-compare-table-wrap]");
  const emptyState = document.querySelector("[data-compare-empty]");
  const countLabel = document.querySelector("[data-compare-page-count]");
  if (!wrap) return;

  if (countLabel) {
    countLabel.textContent =
      compareProperties.length === 0
        ? "Select properties from your favorites to compare"
        : `Comparing ${compareProperties.length} propert${compareProperties.length === 1 ? "y" : "ies"}`;
  }

  if (compareProperties.length === 0) {
    wrap.hidden = true;
    if (emptyState) emptyState.hidden = false;
    return;
  }

  if (emptyState) emptyState.hidden = true;
  wrap.hidden = false;

  const amenitySet = [];
  compareProperties.forEach((property) => {
    property.amenities.forEach((amenity) => {
      if (!amenitySet.includes(amenity)) amenitySet.push(amenity);
    });
  });

  const headerCells = compareProperties.map(compareColumnHeader).join("");
  const addSlot = compareProperties.length < COMPARE_MAX ? addSlotHeader() : "";

  const specRows = [
    specRow(
      "Price",
      compareProperties.map((p) => formatPrice(p.price) + (p.listingType === "rent" ? " / year" : ""))
    ),
    specRow("Location", compareProperties.map((p) => p.location)),
    specRow("Type", compareProperties.map((p) => typeLabel(p.type))),
    specRow("Bedrooms", compareProperties.map((p) => p.bedrooms || "\u2014")),
    specRow("Bathrooms", compareProperties.map((p) => p.bathrooms || "\u2014")),
    specRow("Area", compareProperties.map((p) => `${p.area} sqm`))
  ].join("");

  const amenitiesDivider = `
    <tr class="compare-section-divider">
      <th colspan="${1 + compareProperties.length + (addSlot ? 1 : 0)}">Amenities</th>
    </tr>
  `;
  const amenityRows = amenitySet.map(amenityRow).join("");

  wrap.innerHTML = `
    <table class="compare-table">
      <thead>
        <tr>
          <th class="compare-row-label"></th>
          ${headerCells}
          ${addSlot}
        </tr>
      </thead>
      <tbody>
        ${specRows}
        ${amenitiesDivider}
        ${amenityRows}
      </tbody>
    </table>
  `;

  wrap.querySelectorAll("[data-compare-remove]").forEach((button) => {
    button.addEventListener("click", () => removeFromCompare(button.getAttribute("data-compare-remove")));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  compareProperties = readComparePropertiesFromURL();
  renderCompareTable();
});
