// ============================================================
// VALCRION — GLOBAL CONSTANTS
// Update all links, images, and social media handles here.
// ============================================================

export const COMPANY = {
  name: "Valcrion",
  tagline: "Where clients meet creators.",
  description:
    "Valcrion is an anonymous platform connecting clients with elite web developers. No calls. No reveals. Just results.",
  email: "hello@valcrion.com",       // 🔴 TODO: update with your real email
  foundedYear: 2025,
};

// ─── Social Media ────────────────────────────────────────────
// 🔴 TODO: replace "#" with your real profile URLs when ready
export const SOCIAL = {
  linkedin:        "https://linkedin.com/company/valcrion",
  linkedinHandle:  "Valcrion",
  instagram:       "https://instagram.com/valcrion.dev",
  instagramHandle: "@valcrion.dev",
  website:         "/",
  websiteHandle:   "valcrion",
};

// ─── Navigation Routes ───────────────────────────────────────
export const ROUTES = {
  home: "/",
  about: "/about",
  services: "/services",
  blog: "/blog",
  job: "/job",
  login: "/login",
  register: "/register",
  profile: "/profile",
  devProfile: "/dev/profile",
  adminPanel: "/admin",
};

// ─── Images / Assets ─────────────────────────────────────────
// Replace these placeholder URLs with your actual image links
// export const IMAGES = {
//   logo: "/assets/logo.png",              //d Company logo (PNG, SVG, etc.)
//   logoDark: "/assets/logo-dark.png",     //d Logo for dark theme
//   heroBackground: "/assets/hero-bg.jpeg", //d Hero section background
//   aboutBanner: "/assets/about.jpg",      //d About page banner
//   ogImage: "/assets/og-image.jpg",       // Open Graph / social share image
//   favicon: "/assets/favicon.ico",        // Favicon

//   // Team / founder photos
//   founderPhoto: "/assets/founder.jpg",   // Founder / admin photo

//   // Blog default cover (used if a post has no image)
//   blogDefaultCover: "/assets/blog-default.jpg",
// };

// ─── Pricing Plans ───────────────────────────────────────────
export const PRICING = {
  frontendOnly: {
    label: "Frontend Only",
    price: "₹4,999",
    description: "Pixel-perfect UI, responsive design, animations. No backend.",
    features: [
      "Responsive HTML/CSS/JS or React",
      "Up to 5 pages",
      "Mobile-first design",
      "Basic SEO setup",
      "2 revision rounds",
    ],
  },
  backendHeavy: {
    label: "Backend + 10% Frontend",
    price: "₹7,999",
    description:
      "Robust backend APIs with minimal functional frontend interface.",
    features: [
      "Node.js / Express / Django APIs",
      "Database design & integration",
      "Auth system",
      "Minimal functional UI",
      "3 revision rounds",
    ],
  },
  fullStack: {
    label: "Full Stack",
    price: "₹14,999",
    description: "Complete frontend + backend solution built from scratch.",
    features: [
      "Complete frontend UI",
      "Complete backend & database",
      "Auth + dashboard",
      "Deployment ready",
      "4 revision rounds",
    ],
  },
  fullDetailed: {
    label: "Full Detailed Website",
    price: "₹24,999",
    description:
      "Enterprise-grade detailed website with animations, CMS, and everything.",
    features: [
      "Everything in Full Stack",
      "CMS / Admin panel",
      "Advanced animations",
      "SEO optimization",
      "Performance tuning",
      "Unlimited revisions (30 days)",
    ],
  },
};

// ─── Dev Job Listing ─────────────────────────────────────────
export const JOB_LISTING = {
  title: "Web Developer @ Valcrion",
  perks: [
    "Work anonymously — your identity stays private",
    "Pick projects that match your skill set",
    "Flexible hours — work whenever you want",
    "Competitive payout per project",
    "Build your internal reputation score",
    "Access to a growing client base",
  ],
  requirements: [
    "Proficiency in at least one frontend framework (React, Vue, etc.)",
    "Understanding of REST APIs or full-stack development",
    "Ability to read and understand client briefs",
    "Deliver on time",
    "No agency or outsourcing — individual contributors only",
  ],
};
