/* ==========================================================================
   NEXORA REALTY — DASHBOARD.JS
   Drives every page under dashboard/: the shared sidebar (mobile toggle,
   session-aware user card, sign out), Overview stats, My Listings
   (list/delete), the shared Add/Edit Property form (draft/preview/publish),
   Inquiries (filter/status update), and Profile.
   Each section's init function checks for its own page's container before
   doing anything, so this one file is safe to load on all 6 pages.
   Relies on data.js, auth.js, listings.js, inquiries.js, and main.js
   (propertyCardMarkup, typeLabel, formatPrice) having already loaded.
   ========================================================================== */

const AMENITY_OPTIONS = [
  "Swimming Pool",
  "24/7 Security",
  "Smart Home",
  "Private Garden",
  "Parking",
  "Gym Access",
  "Elevator",
  "Fenced Yard",
  "Renovated Kitchen",
  "Backup Generator",
  "Study Room",
  "Borehole"
];

const PENDING_LISTING_PUBLISH_KEY = "nexora_pending_listing_publish";
const DEMO_PERSONA = { name: "Amaka Chukwu", email: "demo@nexorarealty.com", role: "agent" };

/**
 * Returns the real signed-in session if one exists, otherwise a fixed demo
 * persona so the dashboard is fully explorable without requiring sign-up —
 * a real build would redirect to login instead of falling back like this.
 */
function getDashboardUser() {
  return getSession() || DEMO_PERSONA;
}

/* ==========================================================================
   SHARED SIDEBAR
   ========================================================================== */

function initSidebar() {
  const toggle = document.querySelector("[data-sidebar-toggle]");
  const sidebar = document.querySelector("[data-dashboard-sidebar]");
  const overlay = document.querySelector("[data-sidebar-overlay]");

  if (toggle && sidebar) {
    toggle.addEventListener("click", () => {
      sidebar.classList.toggle("is-open");
      overlay?.classList.toggle("is-open");
    });
  }
  overlay?.addEventListener("click", () => {
    sidebar?.classList.remove("is-open");
    overlay.classList.remove("is-open");
  });

  const user = getDashboardUser();
  const initials = user.name.split(" ").map((n) => n[0]).join("");
  const setText = (selector, text) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = text;
  };
  setText("[data-dashboard-user-name]", user.name);
  setText("[data-dashboard-user-role]", user.role === "agent" ? "Agent" : "Property Owner");
  setText("[data-dashboard-user-initials]", initials);

  const banner = document.querySelector("[data-demo-banner]");
  if (banner) banner.hidden = !!getSession();

  document.querySelector("[data-sign-out]")?.addEventListener("click", (event) => {
    event.preventDefault();
    clearSession();
    window.location.href = "../index.html";
  });
}

/* ==========================================================================
   SHARED HELPERS
   ========================================================================== */

function statusBadgeMarkup(status) {
  return status === "published"
    ? '<span class="badge badge-status-published">Published</span>'
    : '<span class="badge badge-status-draft">Draft</span>';
}

function inquiryStatusBadgeMarkup(status) {
  const classMap = { New: "badge-status-new", Contacted: "badge-status-contacted", Closed: "badge-status-closed" };
  return `<span class="badge ${classMap[status] || "badge-status-new"}">${status}</span>`;
}

function formatDashboardDate(isoDate) {
  return new Date(isoDate).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" });
}

function redirectToPublishLogin(pendingPublish, form = null) {
  try {
    localStorage.setItem(PENDING_LISTING_PUBLISH_KEY, JSON.stringify(pendingPublish));
    window.location.href = "../auth/login.html?intent=publish-listing";
  } catch (error) {
    const message = "We couldn't save this listing for sign-in. Please try again.";
    if (form) showFormError(form, message);
    else window.alert(message);
  }
}

function listingPublisherData(session) {
  const linkedAgent = session.role === "agent" && typeof NEXORA_AGENTS !== "undefined"
    ? NEXORA_AGENTS.find((agent) =>
        agent.email?.toLowerCase() === session.email.toLowerCase() ||
        agent.name.toLowerCase() === session.name.toLowerCase()
      )
    : null;

  return {
    status: "published",
    listedByRole: session.role,
    accountId: session.accountId,
    accountName: session.name,
    accountEmail: session.email,
    accountPhone: session.phone || "",
    ownerId: session.role === "owner" ? session.accountId : null,
    agentId: session.role === "agent" ? session.accountId : null,
    agent: linkedAgent?.id || null,
    publishedAt: new Date().toISOString()
  };
}

function readUploadedImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.onload = () => {
      const dataUrl = reader.result;
      if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) {
        resolve(dataUrl);
        return;
      }

      const image = new Image();
      image.onerror = () => resolve(dataUrl);
      image.onload = () => {
        const maxDimension = 1600;
        const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
        if (scale === 1 && file.size <= 350 * 1024) {
          resolve(dataUrl);
          return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext("2d");
        if (!context) {
          resolve(dataUrl);
          return;
        }

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      image.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

/* ==========================================================================
   OVERVIEW (dashboard/index.html)
   ========================================================================== */

function listingRowCompactMarkup(listing) {
  const image = listing.images?.[0] ? getAssetPath(listing.images[0]) : "";
  return `
    <a href="properties.html" class="dashboard-mini-row">
      ${image ? `<img class="dashboard-mini-image" src="${image}" alt="${listing.title}" />` : ""}
      <div>
        <p class="dashboard-mini-title">${listing.title}</p>
        <p class="dashboard-mini-meta">${listing.location}</p>
      </div>
      <div class="dashboard-mini-right">
        ${statusBadgeMarkup(listing.status)}
        <p class="dashboard-mini-price">${formatPrice(listing.price)}</p>
      </div>
    </a>
  `;
}

function inquiryRowCompactMarkup(inquiry, listing) {
  return `
    <a href="inquiries.html" class="dashboard-mini-row">
      <div>
        <p class="dashboard-mini-title">${inquiry.name}</p>
        <p class="dashboard-mini-meta">${listing ? listing.title : "Unknown property"}</p>
      </div>
      <div class="dashboard-mini-right">
        ${inquiryStatusBadgeMarkup(inquiry.status)}
        <p class="dashboard-mini-price">${formatDashboardDate(inquiry.createdAt)}</p>
      </div>
    </a>
  `;
}

function renderOverview() {
  const statsEl = document.querySelector("[data-overview-stats]");
  if (!statsEl) return; // not on dashboard/index.html

  const listings = getDashboardListings();
  const listingIds = listings.map((l) => l.id);
  const inquiries = getInquiries().filter((inq) => listingIds.includes(inq.propertyId));

  const activeListings = listings.filter((l) => l.status === "published").length;
  const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);
  const newInquiries = inquiries.filter((inq) => inq.status === "New").length;

  const setText = (selector, text) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = text;
  };
  setText("[data-stat-active-listings]", activeListings);
  setText("[data-stat-total-views]", totalViews.toLocaleString("en-NG"));
  setText("[data-stat-new-inquiries]", newInquiries);

  const recentListings = document.querySelector("[data-recent-listings]");
  if (recentListings) {
    const recent = [...listings].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)).slice(0, 4);
    recentListings.innerHTML = recent.length
      ? recent.map(listingRowCompactMarkup).join("")
      : '<p class="dashboard-empty-inline">No listings yet.</p>';
  }

  const recentInquiries = document.querySelector("[data-recent-inquiries]");
  if (recentInquiries) {
    const recent = [...inquiries].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 4);
    recentInquiries.innerHTML = recent.length
      ? recent.map((inq) => inquiryRowCompactMarkup(inq, getDashboardListingById(inq.propertyId))).join("")
      : '<p class="dashboard-empty-inline">No inquiries yet.</p>';
  }
}

/* ==========================================================================
   MY LISTINGS (dashboard/properties.html)
   ========================================================================== */

function listingRowFullMarkup(listing) {
  const image = listing.images?.[0] ? getAssetPath(listing.images[0]) : "";
  return `
    <div class="listing-row" data-listing-row="${listing.id}">
      <div class="listing-row-media">
        <div class="img-placeholder">
          ${image ? `<img src="${image}" alt="${listing.title}" onload="this.nextElementSibling.style.display='none'" onerror="this.remove()" />` : ""}
          <span>Photo</span>
        </div>
      </div>
      <div class="listing-row-title">
        <p class="listing-row-name">${listing.title}</p>
        <p class="listing-row-location">${listing.location}</p>
      </div>
      <div class="listing-row-cell" data-label="Status">${statusBadgeMarkup(listing.status)}</div>
      <div class="listing-row-cell" data-label="Price">${formatPrice(listing.price)}</div>
      <div class="listing-row-cell" data-label="Views">${listing.views.toLocaleString("en-NG")}</div>
      <div class="listing-row-actions">
        <a href="edit-property.html?id=${listing.id}" class="btn btn-secondary btn-sm">Edit</a>
        ${
          listing.status === "draft"
            ? `<button type="button" class="btn btn-primary btn-sm" data-quick-publish="${listing.id}">Publish</button>`
            : ""
        }
        <button type="button" class="btn-icon listing-row-delete" data-delete-listing="${listing.id}" aria-label="Delete ${listing.title}">${lucideIcon("trash-2")}</button>
      </div>
    </div>
  `;
}

function renderListingsPage() {
  const list = document.querySelector("[data-listings-list]");
  if (!list) return; // not on dashboard/properties.html

  const emptyState = document.querySelector("[data-listings-empty]");
  const listings = getDashboardListings().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  if (listings.length === 0) {
    list.hidden = true;
    if (emptyState) emptyState.hidden = false;
    return;
  }

  list.hidden = false;
  if (emptyState) emptyState.hidden = true;
  list.innerHTML = listings.map(listingRowFullMarkup).join("");

  list.querySelectorAll("[data-delete-listing]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const listing = getDashboardListingById(btn.getAttribute("data-delete-listing"));
      if (listing && window.confirm(`Delete "${listing.title}"? This can't be undone.`)) {
        deleteDashboardListing(listing.id);
        renderListingsPage();
      }
    });
  });

  list.querySelectorAll("[data-quick-publish]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const listingId = btn.getAttribute("data-quick-publish");
      const session = getSession();
      if (!session || !["owner", "agent"].includes(session.role)) {
        redirectToPublishLogin({ action: "update", listingId, data: { status: "published" } });
        return;
      }
      updateDashboardListing(listingId, { status: "published", listedByRole: session.role });
      renderListingsPage();
    });
  });
}

/* ==========================================================================
   ADD / EDIT PROPERTY (dashboard/add-property.html, edit-property.html)
   ========================================================================== */

function renderAmenityCheckboxes(container, checkedValues = []) {
  if (!container) return;
  // Union of the curated list and whatever this listing actually has, so
  // editing and re-saving never silently drops an amenity that isn't one
  // of the common ones (e.g. a seed listing's "Boys Quarters").
  const extras = checkedValues.filter((value) => !AMENITY_OPTIONS.includes(value));
  const allOptions = [...AMENITY_OPTIONS, ...extras];

  container.innerHTML = allOptions
    .map(
      (amenity) => `
        <label class="amenity-checkbox">
          <input type="checkbox" name="amenities" value="${amenity}" ${checkedValues.includes(amenity) ? "checked" : ""} />
          ${amenity}
        </label>
      `
    )
    .join("");
}

function fillFormFromListing(form, listing) {
  const setValue = (name, value) => {
    const el = form.querySelector(`[name="${name}"]`);
    if (el) el.value = value;
  };
  setValue("title", listing.title);
  setValue("price", listing.price);
  setValue("type", listing.type);
  setValue("listingType", listing.listingType);
  setValue("location", listing.location);
  setValue("bedrooms", listing.bedrooms);
  setValue("bathrooms", listing.bathrooms);
  setValue("area", listing.area);
  setValue("description", listing.description);
}

function initImageInput(form, existingImages = []) {
  const input = form.querySelector("[data-image-input]");
  const chips = form.querySelector("[data-image-chips]");
  if (!input || !chips) return async () => [];

  input.required = existingImages.length === 0;

  let selectedImages = null;
  let pendingRead = Promise.resolve();
  let readFailed = false;

  const renderChips = (labels) => {
    chips.replaceChildren(...labels.map((label) => {
      const chip = document.createElement("span");
      chip.className = "image-chip";
      chip.textContent = label;
      return chip;
    }));
  };

  if (existingImages.length) {
    renderChips(existingImages.map((image, index) => {
      if (image.startsWith("data:")) return `Current photo ${index + 1}`;
      return image.split("/").pop();
    }));
  }

  input.addEventListener("change", () => {
    const files = Array.from(input.files || []);
    if (!files.length) return;

    selectedImages = null;
    readFailed = false;
    renderChips(files.map((file) => file.name));
    pendingRead = Promise.all(files.map(readUploadedImage))
      .then((images) => {
        selectedImages = images;
        hideFormError(form);
      })
      .catch((error) => {
        readFailed = true;
        showFormError(form, error.message || "Could not read the selected images.");
      });
  });

  return async () => {
    await pendingRead;
    if (readFailed) throw new Error("Could not read the selected images.");
    if (selectedImages?.length) return [...selectedImages];
    return [...existingImages];
  };
}

function collectPropertyFormData(form, images) {
  const fd = new FormData(form);
  const amenities = Array.from(form.querySelectorAll('input[name="amenities"]:checked')).map((cb) => cb.value);

  return {
    title: fd.get("title") || "",
    price: Number(fd.get("price")) || 0,
    type: fd.get("type") || "house",
    listingType: fd.get("listingType") || "sale",
    location: fd.get("location") || "",
    bedrooms: Number(fd.get("bedrooms")) || 0,
    bathrooms: Number(fd.get("bathrooms")) || 0,
    area: Number(fd.get("area")) || 0,
    description: fd.get("description") || "",
    amenities,
    images: [...images]
  };
}

function renderPropertyPreview(data) {
  const panel = document.querySelector("[data-preview-panel]");
  const formWrap = document.querySelector("[data-property-form-wrap]");
  const grid = document.querySelector("[data-preview-card]");
  if (!panel || !grid) return;

  const previewProperty = { id: "preview", featured: false, views: 0, ...data };
  grid.innerHTML = propertyCardMarkup(previewProperty);
  grid.querySelectorAll("a").forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));

  if (formWrap) formWrap.hidden = true;
  panel.hidden = false;
}

function initPropertyForm() {
  const form = document.querySelector("[data-property-form]");
  if (!form) return; // not on add-property.html or edit-property.html

  const mode = form.dataset.mode; // "add" | "edit"
  const amenitiesContainer = form.querySelector("[data-amenities-checkboxes]");
  let existingListing = null;

  if (mode === "edit") {
    const params = new URLSearchParams(window.location.search);
    existingListing = getDashboardListingById(params.get("id"));

    if (!existingListing) {
      document.querySelector("[data-property-form-wrap]")?.setAttribute("hidden", "true");
      document.querySelector("[data-property-not-found]")?.removeAttribute("hidden");
      return;
    }

    fillFormFromListing(form, existingListing);
    renderAmenityCheckboxes(amenitiesContainer, existingListing.amenities);
  } else {
    renderAmenityCheckboxes(amenitiesContainer, []);
  }

  const getFormImages = initImageInput(form, existingListing?.images || []);
  const collectCurrentFormData = async () => collectPropertyFormData(form, await getFormImages());
  let draftListingId = existingListing?.id || null;

  const params = new URLSearchParams(window.location.search);
  if (mode === "add" && params.get("publishPending") === "1" && getSession()) {
    try {
      const pendingListing = JSON.parse(localStorage.getItem(PENDING_LISTING_PUBLISH_KEY) || "null");
      if (!pendingListing) throw new Error("The listing draft could not be found.");
      const listing = getDashboardListingById(pendingListing.listingId);
      const session = getSession();
      if (!listing) throw new Error("The saved listing draft could not be found.");
      if (!session || !["owner", "agent"].includes(session.role)) {
        throw new Error("Please sign in with an owner or agent account to publish this listing.");
      }

      const updatedListing = updateDashboardListing(listing.id, {
        ...(pendingListing.action === "update" ? pendingListing.data : {}),
        ...listingPublisherData(session)
      });
      if (!updatedListing) throw new Error("The saved listing draft could not be published.");
      localStorage.removeItem(PENDING_LISTING_PUBLISH_KEY);
      window.location.href = "properties.html";
      return;
    } catch (error) {
      console.warn("Could not restore the pending listing:", error);
      showFormError(form, error.name === "QuotaExceededError"
        ? "Your account is ready, but the listing could not be published because browser storage is full."
        : error.message || "Your account is ready, but the listing could not be restored. Please try again.");
    }
  }

  async function persistAndRedirect(status, submittedData = null) {
    try {
      const data = submittedData || await collectCurrentFormData();
      data.status = status;
      if (status === "published") {
        const session = getSession();
        if (!session || !["owner", "agent"].includes(session.role)) {
          showFormError(form, "Please sign in with an owner or agent account to publish this listing.");
          return;
        }
        Object.assign(data, listingPublisherData(session));
      }

      if (draftListingId) {
        updateDashboardListing(draftListingId, data);
      } else {
        draftListingId = createDashboardListing(data).id;
      }
      window.location.href = "properties.html";
    } catch (error) {
      showFormError(
        form,
        error.name === "QuotaExceededError"
          ? "These images exceed available browser storage. Choose fewer or smaller images and try again."
          : error.message || "We couldn't save this listing. Please try again."
      );
    }
  }

  async function requestPublish() {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    let data;
    try {
      data = await collectCurrentFormData();
    } catch (error) {
      showFormError(form, error.message || "Could not load the selected images.");
      return;
    }

    if (!getSession()) {
      try {
        data.status = "draft";
        const savedListing = draftListingId
          ? updateDashboardListing(draftListingId, data)
          : createDashboardListing(data);
        if (!savedListing) throw new Error("We couldn't save this listing draft. Please try again.");
        draftListingId = savedListing.id;
        redirectToPublishLogin({ listingId: savedListing.id }, form);
      } catch (error) {
        showFormError(
          form,
          error.name === "QuotaExceededError"
            ? "These images exceed available browser storage. Choose fewer or smaller images and try again."
            : error.message || "We couldn't save your listing for sign-in. Please try again."
        );
      }
      return;
    }

    await persistAndRedirect("published", data);
  }

  form.querySelector("[data-save-draft]")?.addEventListener("click", async () => {
    const titleInput = form.querySelector('[name="title"]');
    if (!titleInput.value.trim()) {
      showFormError(form, "Give the listing a title before saving it as a draft.");
      titleInput.focus();
      return;
    }
    hideFormError(form);
    await persistAndRedirect("draft");
  });

  form.querySelector("[data-publish]")?.addEventListener("click", () => requestPublish());

  form.querySelector("[data-preview]")?.addEventListener("click", async () => {
    try {
      renderPropertyPreview(await collectCurrentFormData());
    } catch (error) {
      showFormError(form, error.message || "Could not load the selected images.");
    }
  });

  document.querySelector("[data-preview-back]")?.addEventListener("click", () => {
    document.querySelector("[data-preview-panel]").hidden = true;
    document.querySelector("[data-property-form-wrap]").hidden = false;
  });

  document.querySelector("[data-preview-publish]")?.addEventListener("click", () => {
    if (!form.checkValidity()) {
      document.querySelector("[data-preview-panel]").hidden = true;
      document.querySelector("[data-property-form-wrap]").hidden = false;
      form.reportValidity();
      return;
    }
    requestPublish();
  });
}

/* ==========================================================================
   INQUIRIES (dashboard/inquiries.html)
   ========================================================================== */

let inquiryStatusFilter = "all";

function inquiryRowMarkup(inquiry, listing) {
  return `
    <article class="inquiry-row">
      <div class="inquiry-row-header">
        <div>
          <p class="inquiry-row-name">${inquiry.name}</p>
          <p class="inquiry-row-property">${listing ? listing.title : "Listing no longer available"}</p>
        </div>
        <select class="form-select inquiry-status-select" data-inquiry-status="${inquiry.id}">
          <option value="New" ${inquiry.status === "New" ? "selected" : ""}>New</option>
          <option value="Contacted" ${inquiry.status === "Contacted" ? "selected" : ""}>Contacted</option>
          <option value="Closed" ${inquiry.status === "Closed" ? "selected" : ""}>Closed</option>
        </select>
      </div>
      <p class="inquiry-row-message">${inquiry.message}</p>
      <div class="inquiry-row-footer">
        <a href="mailto:${inquiry.email}">${inquiry.email}</a>
        <a href="tel:${inquiry.phone}">${inquiry.phone}</a>
        <span>${formatDashboardDate(inquiry.createdAt)}</span>
      </div>
    </article>
  `;
}

function renderInquiriesPage() {
  const list = document.querySelector("[data-inquiries-list]");
  if (!list) return; // not on dashboard/inquiries.html

  const emptyState = document.querySelector("[data-inquiries-empty]");
  const countLabel = document.querySelector("[data-inquiries-count]");
  const listingIds = getDashboardListings().map((l) => l.id);

  let inquiries = getInquiries()
    .filter((inq) => listingIds.includes(inq.propertyId))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  if (inquiryStatusFilter !== "all") {
    inquiries = inquiries.filter((inq) => inq.status === inquiryStatusFilter);
  }

  if (countLabel) {
    countLabel.textContent = `${inquiries.length} inquir${inquiries.length === 1 ? "y" : "ies"}`;
  }

  if (inquiries.length === 0) {
    list.hidden = true;
    if (emptyState) emptyState.hidden = false;
    return;
  }

  list.hidden = false;
  if (emptyState) emptyState.hidden = true;
  list.innerHTML = inquiries.map((inq) => inquiryRowMarkup(inq, getDashboardListingById(inq.propertyId))).join("");

  list.querySelectorAll("[data-inquiry-status]").forEach((select) => {
    select.addEventListener("change", (event) => {
      updateInquiryStatus(select.getAttribute("data-inquiry-status"), event.target.value);
      renderInquiriesPage();
    });
  });
}

function initInquiriesFilter() {
  const filterSelect = document.getElementById("inquiry-filter");
  if (!filterSelect) return;
  filterSelect.addEventListener("change", (event) => {
    inquiryStatusFilter = event.target.value;
    renderInquiriesPage();
  });
}

/* ==========================================================================
   PROFILE (dashboard/profile.html)
   ========================================================================== */

function initProfileForm() {
  const form = document.querySelector("[data-profile-form]");
  if (!form) return; // not on dashboard/profile.html

  const user = getDashboardUser();
  const setValue = (name, value) => {
    const el = form.querySelector(`[name="${name}"]`);
    if (el) el.value = value;
  };
  setValue("name", user.name);
  setValue("email", user.email);
  setValue("role", user.role === "agent" ? "Real Estate Agent" : "Property Owner");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const successEl = document.querySelector("[data-profile-success]");
    if (successEl) {
      successEl.hidden = false;
      setTimeout(() => {
        successEl.hidden = true;
      }, 3000);
    }
  });
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initSidebar();
  renderOverview();
  renderListingsPage();
  initPropertyForm();
  renderInquiriesPage();
  initInquiriesFilter();
  initProfileForm();
});
