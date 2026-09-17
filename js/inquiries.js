/* ==========================================================================
   NEXORA REALTY — INQUIRIES
   Buyers don't need an account to send an inquiry, so submissions are kept
   in localStorage for now — structured the way a real API payload would
   look, so swapping in a POST /inquiries call later is a one-function change.
   Submitted from property-details.js; read and managed from dashboard.js
   (dashboard/inquiries.html).
   ========================================================================== */

const INQUIRIES_KEY = "nexora_inquiries";

/**
 * Seeds a couple of sample inquiries against the demo agent's listings
 * (see js/listings.js — the dashboard demo persona owns p001/p005/p008)
 * so the dashboard has something to show on a first visit, rather than
 * starting completely empty. Only runs once: if the key already exists
 * (even as an empty array from real usage), it's left alone.
 */
function seedInquiries() {
  if (localStorage.getItem(INQUIRIES_KEY) !== null) return;

  const seed = [
    {
      id: "inq_seed001",
      propertyId: "p001",
      name: "Chidi Umeh",
      email: "chidi.umeh@example.com",
      phone: "+2348022223333",
      message: "Is this villa still available? I'd like to schedule a viewing this weekend if possible.",
      status: "New",
      createdAt: "2026-08-20T09:15:00.000Z"
    },
    {
      id: "inq_seed002",
      propertyId: "p005",
      name: "Ngozi Kalu",
      email: "ngozi.kalu@example.com",
      phone: "+2348033334444",
      message: "Interested in the penthouse. Can you share more photos of the terrace?",
      status: "Contacted",
      createdAt: "2026-08-15T14:30:00.000Z"
    },
    {
      id: "inq_seed003",
      propertyId: "p008",
      name: "Tobenna Nwosu",
      email: "tobenna.n@example.com",
      phone: "+2348044445555",
      message: "Are the existing tenants on long-term leases? Looking to buy as an investment.",
      status: "New",
      createdAt: "2026-08-24T11:00:00.000Z"
    }
  ];

  localStorage.setItem(INQUIRIES_KEY, JSON.stringify(seed));
}

function getInquiries() {
  seedInquiries();
  try {
    const raw = localStorage.getItem(INQUIRIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn("Could not read inquiries from storage:", error);
    return [];
  }
}

function generateInquiryId() {
  return "inq_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/**
 * Stores a new buyer inquiry. Every inquiry starts with status "New" —
 * matches the New / Contacted / Closed lifecycle from the project spec.
 */
function submitInquiry({ propertyId, name, email, phone, message }) {
  const inquiries = getInquiries();
  const inquiry = {
    id: generateInquiryId(),
    propertyId,
    name,
    email,
    phone,
    message,
    status: "New",
    createdAt: new Date().toISOString()
  };
  inquiries.unshift(inquiry);
  localStorage.setItem(INQUIRIES_KEY, JSON.stringify(inquiries));
  return inquiry;
}

function getInquiriesForProperty(propertyId) {
  return getInquiries().filter((inquiry) => inquiry.propertyId === propertyId);
}

/**
 * Updates an inquiry's status (New / Contacted / Closed) — used by the
 * dashboard when an owner/agent works through their inbox.
 */
function updateInquiryStatus(inquiryId, status) {
  const inquiries = getInquiries();
  const index = inquiries.findIndex((inquiry) => inquiry.id === inquiryId);
  if (index === -1) return null;
  inquiries[index].status = status;
  localStorage.setItem(INQUIRIES_KEY, JSON.stringify(inquiries));
  return inquiries[index];
}
