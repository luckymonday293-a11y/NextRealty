/* ==========================================================================
   NEXORA REALTY — AGENTS.JS
   Drives both agents.html (directory: search, verified filter, sort) and
   agent-profile.html (header, listings, reviews, review submission).
   Each page's functions check for their own containers before doing
   anything, so this one file is safe to load on both pages (and any other
   page, since it will just no-op there).
   Relies on data.js (NEXORA_AGENTS, NEXORA_PROPERTIES, NEXORA_AGENT_REVIEWS,
   getAgentById, formatPrice) and main.js (agentCardMarkup, propertyCardMarkup,
   buildWhatsAppLink, initFavoriteButtons) having already loaded.
   ========================================================================== */

/* ==========================================================================
   AGENTS DIRECTORY (agents.html)
   ========================================================================== */

let agentFilters = { search: "", verifiedOnly: false };
let agentSort = "rating";

function getFilteredAgents() {
  const search = agentFilters.search.trim().toLowerCase();

  return NEXORA_AGENTS.filter((agent) => {
    if (agentFilters.verifiedOnly && !agent.verified) return false;
    if (!search) return true;
    const haystack = [agent.name, ...(agent.specialties || [])].join(" ").toLowerCase();
    return haystack.includes(search);
  });
}

function sortAgents(list) {
  const sorted = [...list];
  const listingsCount = (agent) => getPublicProperties().filter((p) => p.agent === agent.id).length;

  switch (agentSort) {
    case "experience":
      sorted.sort((a, b) => b.experienceYears - a.experienceYears);
      break;
    case "listings":
      sorted.sort((a, b) => listingsCount(b) - listingsCount(a));
      break;
    default: // "rating"
      sorted.sort((a, b) => b.rating - a.rating);
  }
  return sorted;
}

function renderAgentsDirectory() {
  const grid = document.querySelector("[data-agents-grid]");
  if (!grid) return; // not on agents.html

  const emptyState = document.querySelector("[data-agents-empty]");
  const countLabel = document.querySelector("[data-agents-count]");
  const results = sortAgents(getFilteredAgents());

  if (countLabel) {
    countLabel.textContent =
      results.length === 0
        ? "No agents found"
        : `${results.length} agent${results.length === 1 ? "" : "s"}`;
  }

  if (results.length === 0) {
    grid.hidden = true;
    if (emptyState) emptyState.hidden = false;
    return;
  }

  grid.hidden = false;
  if (emptyState) emptyState.hidden = true;
  grid.innerHTML = results.map(agentCardMarkup).join("");
}

function initAgentsDirectoryControls() {
  const grid = document.querySelector("[data-agents-grid]");
  if (!grid) return; // not on agents.html

  const searchInput = document.getElementById("agent-search");
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      agentFilters.search = event.target.value;
      renderAgentsDirectory();
    });
  }

  const verifiedToggle = document.getElementById("agent-verified-only");
  if (verifiedToggle) {
    verifiedToggle.addEventListener("change", (event) => {
      agentFilters.verifiedOnly = event.target.checked;
      renderAgentsDirectory();
    });
  }

  const sortSelect = document.getElementById("agent-sort");
  if (sortSelect) {
    sortSelect.addEventListener("change", (event) => {
      agentSort = event.target.value;
      renderAgentsDirectory();
    });
  }

  renderAgentsDirectory();
}

/* ==========================================================================
   AGENT PROFILE (agent-profile.html)
   ========================================================================== */

const AGENT_REVIEWS_KEY = "nexora_agent_reviews";

function getStoredAgentReviews() {
  try {
    const raw = localStorage.getItem(AGENT_REVIEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn("Could not read agent reviews from storage:", error);
    return [];
  }
}

function submitAgentReview({ agentId, author, rating, comment }) {
  const stored = getStoredAgentReviews();
  const review = {
    id: "rev_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    agentId,
    author,
    rating,
    comment,
    date: new Date().toISOString().slice(0, 10)
  };
  stored.unshift(review);
  localStorage.setItem(AGENT_REVIEWS_KEY, JSON.stringify(stored));
  return review;
}

function getReviewsForAgent(agentId) {
  const seed = NEXORA_AGENT_REVIEWS.filter((r) => r.agentId === agentId);
  const stored = getStoredAgentReviews().filter((r) => r.agentId === agentId);
  // Newly submitted reviews appear first, then seed reviews newest-first.
  return [...stored, ...seed].sort((a, b) => (a.date < b.date ? 1 : -1));
}

/**
 * Blends the agent's seed rating/count with any locally-submitted reviews,
 * so the header stat updates immediately after someone leaves a review
 * without needing a backend to recompute it.
 */
function getAgentStats(agent) {
  const stored = getStoredAgentReviews().filter((r) => r.agentId === agent.id);
  if (stored.length === 0) {
    return { rating: agent.rating, count: agent.reviewCount };
  }
  const seedTotal = agent.rating * agent.reviewCount;
  const storedTotal = stored.reduce((sum, r) => sum + r.rating, 0);
  const count = agent.reviewCount + stored.length;
  return { rating: (seedTotal + storedTotal) / count, count };
}

function formatReviewDate(isoDate) {
  return new Date(isoDate + "T00:00:00").toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function reviewCardMarkup(review) {
  const stars = "&#9733;".repeat(review.rating) + "&#9734;".repeat(5 - review.rating);
  const initials = review.author.split(" ").map((n) => n[0]).join("");

  return `
    <article class="review-card">
      <div class="review-card-header">
        <div class="review-avatar"><span>${initials}</span></div>
        <div>
          <p class="review-author">${review.author}</p>
          <p class="review-stars" aria-label="${review.rating} out of 5 stars">${stars}</p>
        </div>
        <p class="review-date">${formatReviewDate(review.date)}</p>
      </div>
      <p class="review-comment">${review.comment}</p>
    </article>
  `;
}

function renderAgentHeader(agent) {
  document.title = `${agent.name} — Nexora Realty`;

  const setText = (selector, text) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = text;
  };

  const stats = getAgentStats(agent);
  const initials = agent.name.split(" ").map((n) => n[0]).join("");

  setText("[data-agent-name]", agent.name);
  setText("[data-agent-experience]", `${agent.experienceYears} years experience`);
  setText("[data-agent-rating]", `★ ${stats.rating.toFixed(1)} (${stats.count} reviews)`);
  setText("[data-agent-about]", agent.about);
  setText("[data-breadcrumb-agent-name]", agent.name);

  const photoEl = document.querySelector("[data-agent-photo]");
  if (photoEl) {
    photoEl.innerHTML = `
      <div class="img-placeholder">
        <img src="${getAssetPath(agent.photo)}" alt="${agent.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <span style="display:none;">${initials}</span>
      </div>
    `;
  }

  const verifiedEl = document.querySelector("[data-agent-verified]");
  if (verifiedEl) {
    verifiedEl.innerHTML = agent.verified
      ? '<span class="badge badge-verified">&#10003; Verified Agent</span>'
      : "";
  }

  const specialtiesEl = document.querySelector("[data-agent-specialties]");
  if (specialtiesEl) {
    specialtiesEl.innerHTML = (agent.specialties || [])
      .map((s) => `<span class="specialty-tag">${s}</span>`)
      .join("");
  }

  const whatsappBtn = document.querySelector("[data-whatsapp-agent-profile]");
  if (whatsappBtn) {
    whatsappBtn.href = buildWhatsAppLink({
      phone: agent.phone,
      message: `Hi ${agent.name}, I found your profile on Nexora Realty and I'd like to talk about a property.`
    });
  }
}

function renderAgentListings(agent) {
  const grid = document.querySelector("[data-agent-listings]");
  const emptyState = document.querySelector("[data-agent-listings-empty]");
  if (!grid) return;

  const listings = getPublicProperties().filter((p) => p.agent === agent.id);

  if (listings.length === 0) {
    grid.hidden = true;
    if (emptyState) emptyState.hidden = false;
    return;
  }

  grid.hidden = false;
  if (emptyState) emptyState.hidden = true;
  grid.innerHTML = listings.map(propertyCardMarkup).join("");
  initFavoriteButtons(grid);
}

function renderReviews(agent) {
  const list = document.querySelector("[data-reviews-list]");
  if (!list) return;

  const reviews = getReviewsForAgent(agent.id);
  const countLabel = document.querySelector("[data-reviews-count]");
  if (countLabel) countLabel.textContent = `${getAgentStats(agent).count} Reviews`;

  list.innerHTML = reviews.map(reviewCardMarkup).join("");
}

function initReviewForm(agent) {
  const toggleBtn = document.querySelector("[data-review-toggle]");
  const panel = document.querySelector("[data-review-panel]");
  const form = document.querySelector("[data-review-form]");
  if (!toggleBtn || !panel || !form) return;

  toggleBtn.addEventListener("click", () => {
    const isOpen = panel.classList.toggle("is-open");
    toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const rating = Number(formData.get("rating"));

    submitAgentReview({
      agentId: agent.id,
      author: formData.get("author"),
      rating,
      comment: formData.get("comment")
    });

    form.reset();
    panel.classList.remove("is-open");
    toggleBtn.setAttribute("aria-expanded", "false");

    renderReviews(agent);
    renderAgentHeader(agent); // refresh the rating/count in the header
  });
}

function renderAgentNotFound() {
  document.querySelector("[data-profile-content]")?.setAttribute("hidden", "true");
  document.querySelector("[data-not-found]")?.removeAttribute("hidden");
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initAgentsDirectoryControls();

  // Agent profile page only runs if its content wrapper exists.
  if (!document.querySelector("[data-profile-content]")) return;

  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get("id");
  const agent = requestedId ? getAgentById(requestedId) : NEXORA_AGENTS[0];

  if (!agent) {
    renderAgentNotFound();
    return;
  }

  renderAgentHeader(agent);
  renderAgentListings(agent);
  renderReviews(agent);
  initReviewForm(agent);
});
