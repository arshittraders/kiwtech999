// ── Kiwtech plan → tier → features map ────────────────────────────────────
// Ek hi jagah se sab plan gating control hoti hai.
//   shipping tier → sirf Shipping Optimizer (₹299/month, unlimited)
//   pro tier      → sab kuch (₹499/month)
// Purane active plans (monthly / 3month / yearly / lifetime) → pro tier,
// taaki existing customers pe koi asar na pade.

const FEATURES = {
  shipping: [
    "shipping",      // Shipping Optimizer — image variations, lowest shipping
    "fetch_basic",   // Catalog fetch — price / shipping / MRP
  ],
  pro: [
    "shipping",
    "fetch_basic",
    "fetch_full",    // Seller cost, margin, RTO, competitors
    "ai_listing",    // AI listing generation (OpenAI)
    "kw_hunter",
    "rank",
    "scribbles",
    "vizsearch",
    "image",
    "defaults",
  ],
};

// plan string (licenses.plan column) → tier
const PLAN_TIER = {
  // naye plans
  allinone: "pro",        // ₹349 All-in-One — sab features
  shipping_only: "shipping",
  pro: "pro",

  // purane / legacy plans — sab pro rahenge (grandfathered)
  demo: "pro",
  monthly: "pro",
  "3month": "pro",
  quarterly: "pro",
  yearly: "pro",
  annual: "pro",
  lifetime: "pro",
  local: "pro",
};

// Anjaan plan aaye toh pro maan lo — purane customers kabhi lock na ho jayein.
const DEFAULT_TIER = "pro";

function tierFor(plan) {
  if (!plan) return DEFAULT_TIER;
  return PLAN_TIER[String(plan).toLowerCase().trim()] || DEFAULT_TIER;
}

function featuresFor(plan) {
  return FEATURES[tierFor(plan)] || FEATURES[DEFAULT_TIER];
}

function hasFeature(plan, feature) {
  return featuresFor(plan).includes(feature);
}

module.exports = { FEATURES, PLAN_TIER, DEFAULT_TIER, tierFor, featuresFor, hasFeature };
