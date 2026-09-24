/* ==========================================================================
   NEXORA REALTY — DATA LAYER
   Sample in-memory data standing in for a future API/backend.
   Replace NEXORA_PROPERTIES / NEXORA_AGENTS with fetch() calls once a
   backend exists — every other script only reads from these two arrays,
   so that's the one place a real integration needs to change.
   ========================================================================== */

const NEXORA_PROPERTIES = [
  {
    id: "p001",
    title: "Maple Grove Modern Villa",
    price: 285000000,
    location: "Maitama, Abuja",
    type: "villa",
    listingType: "sale", // sale | rent
    bedrooms: 5,
    bathrooms: 5,
    area: 480, // sqm
    description:
      "A spacious contemporary villa set on a quiet cul-de-sac, built around a private courtyard and finished with locally sourced stone throughout.",
    amenities: ["Swimming Pool", "24/7 Security", "Smart Home", "Private Garden", "Boys Quarters", "Solar Backup"],
    featured: true,
    views: 342,
    agent: "a001",
    images: [
      "assets/images/properties/property-01/exterior.jpeg",
      "assets/images/properties/property-01/living-room.jpeg",
      "assets/images/properties/property-01/kitchen.jpeg",
      "assets/images/properties/property-01/bedroom.jpeg",
      "assets/images/properties/property-01/bathroom.jpeg",
      "assets/images/properties/property-01/additional-space.jpeg"
    ]
  },
  {
    id: "p002",
    title: "Riverside Two-Bedroom Apartment",
    price: 1800000,
    location: "Jabi, Abuja",
    type: "apartment",
    listingType: "rent",
    bedrooms: 2,
    bathrooms: 2,
    area: 110,
    description:
      "Bright, low-maintenance apartment with lake views, an open-plan living area, and access to a shared rooftop lounge.",
    amenities: ["Lake View", "Gym Access", "Elevator", "Parking", "24/7 Security"],
    featured: true,
    views: 210,
    agent: "a002",
    images: [
      "assets/images/properties/property-02/exterior.jpeg",
      "assets/images/properties/property-02/living-room.jpeg",
      "assets/images/properties/property-02/kitchen.jpeg",
      "assets/images/properties/property-02/bedroom.jpeg",
      "assets/images/properties/property-02/bathroom.jpeg",
      "assets/images/properties/property-02/additional-space.jpeg"
    ]
  },
  {
    id: "p003",
    title: "Willowbrook Family Home",
    price: 165000000,
    location: "Gwarinpa, Abuja",
    type: "house",
    listingType: "sale",
    bedrooms: 4,
    bathrooms: 4,
    area: 320,
    description:
      "A well-kept family home on a tree-lined street, with a renovated kitchen and a fenced backyard ready for entertaining.",
    amenities: ["Fenced Yard", "Renovated Kitchen", "Garage", "Study Room", "Borehole"],
    featured: true,
    views: 178,
    agent: "a003",
    images: [
      "assets/images/properties/property-03/exterior.jpeg",
      "assets/images/properties/property-03/living-room.jpeg",
      "assets/images/properties/property-03/kitchen.jpeg",
      "assets/images/properties/property-03/bedroom.jpeg",
      "assets/images/properties/property-03/bathroom.jpeg",
      "assets/images/properties/property-03/additional-space.jpeg"
    ]
  },
  {
    id: "p004",
    title: "Skyline Business Loft",
    price: 4200000,
    location: "Central Business District, Abuja",
    type: "office",
    listingType: "rent",
    bedrooms: 0,
    bathrooms: 2,
    area: 240,
    description:
      "Full-floor office space with floor-to-ceiling windows, three meeting rooms, and dedicated basement parking.",
    amenities: ["Meeting Rooms", "Basement Parking", "Backup Generator", "Fiber Internet"],
    featured: true,
    views: 96,
    agent: "a002",
    images: [
      "assets/images/properties/property-04/exterior.jpeg",
      "assets/images/properties/property-04/living-room.jpeg",
      "assets/images/properties/property-04/kitchen.jpeg",
      "assets/images/properties/property-04/bedroom.jpeg",
      "assets/images/properties/property-04/bathroom.jpeg",
      "assets/images/properties/property-04/additional-space.jpeg"
    ]
  },
  {
    id: "p005",
    title: "Cedar Heights Penthouse",
    price: 320000000,
    location: "Asokoro, Abuja",
    type: "apartment",
    listingType: "sale",
    bedrooms: 4,
    bathrooms: 5,
    area: 390,
    description:
      "Top-floor residence with a wraparound terrace, private elevator access, and panoramic views over the city.",
    amenities: ["Private Terrace", "Private Elevator", "Swimming Pool", "Concierge", "Smart Home"],
    featured: true,
    views: 401,
    agent: "a001",
    images: [
      "assets/images/properties/property-05/exterior.jpeg",
      "assets/images/properties/property-05/living-room.jpeg",
      "assets/images/properties/property-05/kitchen.jpeg",
      "assets/images/properties/property-05/bedroom.jpeg",
      "assets/images/properties/property-05/bathroom.jpeg",
      "assets/images/properties/property-05/additional-space.jpeg"
    ]
  },
  {
    id: "p006",
    title: "Greenfield Residential Plot",
    price: 45000000,
    location: "Lugbe, Abuja",
    type: "land",
    listingType: "sale",
    bedrooms: 0,
    bathrooms: 0,
    area: 650,
    description:
      "Fenced and gazetted residential plot in a fast-developing estate, with survey and title documents ready.",
    amenities: ["Gazetted Title", "Fenced", "Estate Road Access", "Close to Expressway"],
    featured: true,
    views: 64,
    agent: "a003",
    images: [
      "assets/images/properties/property-06/exterior.jpeg",
      "assets/images/properties/property-06/living-room.jpeg",
      "assets/images/properties/property-06/kitchen.jpeg",
      "assets/images/properties/property-06/bedroom.jpeg",
      "assets/images/properties/property-06/bathroom.jpeg",
      "assets/images/properties/property-06/additional-space.jpeg"
    ]
  },
  {
    id: "p007",
    title: "Harbor View Duplex",
    price: 2600000,
    location: "Wuse II, Abuja",
    type: "house",
    listingType: "rent",
    bedrooms: 3,
    bathrooms: 3,
    area: 260,
    description:
      "Modern duplex on a serene close, featuring an en-suite master bedroom and a compact home office nook.",
    amenities: ["En-suite Bedrooms", "Home Office", "Parking", "24/7 Security"],
    featured: false,
    views: 132,
    agent: "a002",
    images: [
      "assets/images/properties/property-07/exterior.jpeg",
      "assets/images/properties/property-07/living-room.jpeg",
      "assets/images/properties/property-07/kitchen.jpeg",
      "assets/images/properties/property-07/bedroom.jpeg",
      "assets/images/properties/property-07/bathroom.jpeg",
      "assets/images/properties/property-07/additional-space.jpeg"
    ]
  },
  {
    id: "p008",
    title: "Oakridge Commercial Plaza",
    price: 610000000,
    location: "Garki, Abuja",
    type: "commercial",
    listingType: "sale",
    bedrooms: 0,
    bathrooms: 6,
    area: 1200,
    description:
      "Multi-unit commercial plaza with existing tenants, street-facing retail frontage, and ample customer parking.",
    amenities: ["Retail Frontage", "Tenant Parking", "Backup Generator", "Loading Bay"],
    featured: true,
    views: 88,
    agent: "a001",
    images: [
      "assets/images/properties/property-08/exterior.jpeg",
      "assets/images/properties/property-08/living-room.jpeg",
      "assets/images/properties/property-08/kitchen.jpeg",
      "assets/images/properties/property-08/bedroom.jpeg",
      "assets/images/properties/property-08/bathroom.jpeg",
      "assets/images/properties/property-08/additional-space.jpeg"
    ]
  },

  {
    id: "p009",
    title: "Harbor View Duplex",
    price: 2600000,
    location: "Wuse II, Abuja",
    type: "house",
    listingType: "rent",
    bedrooms: 3,
    bathrooms: 3,
    area: 260,
    description:
      "Modern duplex on a serene close, featuring an en-suite master bedroom and a compact home office nook.",
    amenities: ["En-suite Bedrooms", "Home Office", "Parking", "24/7 Security"],
    featured: false,
    views: 132,
    agent: "a002",
    images: [
      "assets/images/properties/property-07/exterior.jpeg",
      "assets/images/properties/property-07/living-room.jpeg",
      "assets/images/properties/property-07/kitchen.jpeg",
      "assets/images/properties/property-07/bedroom.jpeg",
      "assets/images/properties/property-07/bathroom.jpeg",
      "assets/images/properties/property-07/additional-space.jpeg"
    ]
  },
  {
    id: "p0010",
    title: "Lucky office",
    price: 2600000,
    location: "Wuse II, Abuja",
    type: "house",
    listingType: "rent",
    bedrooms: 3,
    bathrooms: 3,
    area: 260,
    description:
      "Modern duplex on a serene close, featuring an en-suite master bedroom and a compact home office nook.",
    amenities: ["En-suite Bedrooms", "Home Office", "Parking", "24/7 Security"],
    featured: true,
    views: 132,
    agent: "a002",
    images: [
      "assets/images/properties/property-07/exterior.jpeg",
      "assets/images/properties/property-07/living-room.jpeg",
      "assets/images/properties/property-07/kitchen.jpeg",
      "assets/images/properties/property-07/bedroom.jpeg",
      "assets/images/properties/property-07/bathroom.jpeg",
      "assets/images/properties/property-07/additional-space.jpeg"
    ]
  },
];

const NEXORA_DEFAULT_PROPERTY_IMAGES = [
  "assets/images/properties/property-01/exterior.jpeg",
  "assets/images/properties/property-01/living-room.jpeg",
  "assets/images/properties/property-01/kitchen.jpeg",
  "assets/images/properties/property-01/bedroom.jpeg",
  "assets/images/properties/property-01/bathroom.jpeg",
  "assets/images/properties/property-01/additional-space.jpeg"
];

// Add each real location image path here. Replace this map with the image URL
// returned by the backend when location data is connected to an API.
const NEXORA_LOCATION_IMAGES = {
   Maitama: "assets/images/locations/bokkos.jpeg",
   Jabi: "assets/images/locations/kunet.jpeg",
   Gwarinpa: "assets/images/locations/pankshin.jpeg",
  "Central Business District": "assets/images/locations/deres.jpeg",
   Asokoro: "assets/images/locations/tanti.jpeg",
   Lugbe: "assets/images/locations/tudu.jpeg",
   "Wuse II": "assets/images/locations/wuse.jpeg",
  Garki: "assets/images/locations/garke.jpeg"
};

// Add future page images here so uploads can be connected in one place.
// Use paths relative to the page that renders the image, or backend URLs later.
const NEXORA_MEDIA_IMAGES = {
  hero: "assets/images/hero/hero-property.jpeg",
  aboutHero: "assets/images/about/about-hero.jpg", 
  aboutStory: "assets/images/about/about-story.jpg", 
  authVisual: "assets/images/about/auth.jpg", 
  agentPhotos: "assets/images/agents/",
  testimonialAvatars: "assets/images/testimonials/",
  propertyPhotos: "assets/images/properties/",
  locationPhotos: "assets/images/locations/"
};

const NEXORA_AGENTS = [
  {
    id: "a001",
    name: "Amaka Chukwu",
    photo: "assets/images/agents/agent-01.jpeg",
    verified: true,
    rating: 4.9,
    reviewCount: 58,
    experienceYears: 9,
    phone: "+2348030000001",
    about:
      "Amaka specializes in premium residential sales across Abuja's Maitama and Asokoro districts, with a focus on first-time luxury buyers.",
    specialties: ["Luxury Homes", "New Developments"]
  },
  {
    id: "a002",
    name: "Tunde Bakare",
    photo: "assets/images/agents/agent-02.jpeg",
    verified: true,
    rating: 4.7,
    reviewCount: 41,
    experienceYears: 6,
    phone: "+2348030000002",
    about:
      "Tunde helps tenants and landlords move quickly on rentals, from studio apartments to full commercial office floors.",
    specialties: ["Rentals", "Commercial"]
  },
  {
    id: "a003",
    name: "Ifeoma Eze",
    photo: "assets/images/agents/agent-03.jpeg",
    verified: false,
    rating: 4.5,
    reviewCount: 19,
    experienceYears: 3,
    phone: "+2348030000003",
    about:
      "Ifeoma works closely with families relocating to Abuja, guiding them from shortlist to closing on family homes and plots.",
    specialties: ["Family Homes", "Land"]
  }
];

const NEXORA_TESTIMONIALS = [
  {
    id: "t001",
    name: "Grace Okon",
    role: "Bought a home in Gwarinpa",
    quote:
      "Nexora made comparing properties simple. I shortlisted three homes, compared them side by side, and reached out to the agent directly on WhatsApp.",
    avatar: "assets/images/testimonials/client-01.jpeg"
  },
  {
    id: "t002",
    name: "David Ilesanmi",
    role: "Rented an apartment in Jabi",
    quote:
      "I could see exactly what was included with each listing before contacting anyone, which saved me a lot of back and forth.",
    avatar: "assets/images/testimonials/client-02.jpeg"
  },
  {
    id: "t003",
    name: "Blessing Nwachukwu",
    role: "Listed a property as an owner",
    quote:
      "Publishing my listing took minutes and I started getting serious inquiries within the first week.",
    avatar: "assets/images/testimonials/client-03.jpeg"
  }
];

const NEXORA_AGENT_REVIEWS = [
  {
    id: "rev001",
    agentId: "a001",
    author: "Grace Okon",
    rating: 5,
    comment:
      "Amaka was patient through every viewing and never pushed us toward something outside our budget. Closing on our Gwarinpa home went smoothly because of her.",
    date: "2026-06-14"
  },
  {
    id: "rev002",
    agentId: "a001",
    author: "Chinedu Obi",
    rating: 5,
    comment:
      "Extremely knowledgeable about the Maitama market. She spotted a title issue on one property before we wasted time on it.",
    date: "2026-04-02"
  },
  {
    id: "rev003",
    agentId: "a002",
    author: "David Ilesanmi",
    rating: 4,
    comment:
      "Quick to respond on WhatsApp and flexible with viewing times. The apartment had a minor issue not mentioned upfront, but Tunde sorted it with the landlord fast.",
    date: "2026-05-20"
  },
  {
    id: "rev004",
    agentId: "a002",
    author: "Funmi Adeyemi",
    rating: 5,
    comment:
      "Helped us move our office into a new space in under two weeks, paperwork included. Would use again for any commercial lease.",
    date: "2026-03-11"
  },
  {
    id: "rev005",
    agentId: "a003",
    author: "Blessing Nwachukwu",
    rating: 4,
    comment:
      "Ifeoma is new but works hard — she followed up consistently and was honest when a plot's paperwork wasn't ready yet instead of rushing the sale.",
    date: "2026-06-01"
  },
  {
    id: "rev006",
    agentId: "a003",
    author: "Samuel Eze",
    rating: 5,
    comment:
      "Found us a family home in Gwarinpa within our exact price range. Very responsive and easy to reach.",
    date: "2026-02-18"
  }
];

/* ---------- Small shared helpers used across pages ---------- */

/**
 * Formats a number as Naira currency, e.g. 285000000 -> "₦285,000,000"
 */
function formatPrice(amount) {
  return "₦" + Number(amount).toLocaleString("en-NG");
}

function getAgentById(agentId) {
  return NEXORA_AGENTS.find((agent) => agent.id === agentId) || null;
}

function getAssetPath(path) {
  if (!path) return "";
  return window.location.pathname.includes("/dashboard/") && path.startsWith("assets/")
    ? `../${path}`
    : path;
}

function getPublicProperties() {
  let dashboardListings = [];

  try {
    const raw = localStorage.getItem("nexora_dashboard_listings");
    dashboardListings = raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn("Could not read published dashboard listings:", error);
  }

  const publishedListings = dashboardListings
    .filter((listing) => listing.status === "published")
    .map((listing) => ({
      ...listing,
      agent: listing.agent || "a001",
      images: Array.isArray(listing.images) && listing.images.length
        ? listing.images.map((path) => path.replace("assets/images/properties/new-listing/", "assets/images/properties/property-01/").replace(/\.jpg$/i, ".jpeg"))
        : [...NEXORA_DEFAULT_PROPERTY_IMAGES]
    }));
  const dashboardIds = new Set(publishedListings.map((listing) => listing.id));

  return [
    ...NEXORA_PROPERTIES.filter((property) => !dashboardIds.has(property.id)),
    ...publishedListings
  ];
}

function getPropertyById(propertyId) {
  return getPublicProperties().find((property) => property.id === propertyId) || null;
}

/**
 * Returns just the district/area name from a "District, City" location
 * string, e.g. "Maitama, Abuja" -> "Maitama". Used for the homepage's
 * Popular Locations section.
 */
function getDistrictName(location) {
  return location.split(",")[0].trim();
}
