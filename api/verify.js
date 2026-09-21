// POST /api/verify  — Cloudflare Worker ke /api/verify ka replacement.
// Body:     { email, key, deviceId }
// Response: { valid, plan, tier, features, expiresAt, gmail, error }
// Extension isi shape ko expect karta hai (background.js getValidLicense).

const { getLicense, bindMachine } = require("../lib/supabase");
const { cors } = require("../lib/helpers");
const { tierFor, featuresFor } = require("../lib/plans");

const MASTER_KEYS = ["KWT-MASTER-ADMIN-99999", "kwt-master-admin-99999"];

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const body = req.body || {};
  const key = String(body.key || "").toUpperCase().trim();
  const email = String(body.email || "").toLowerCase().trim();
  const deviceId = String(body.deviceId || body.machineId || "").trim();

  if (!key) return res.json({ valid: false, error: "Key nahi diya" });

  // Master key — hamesha pro, koi expiry nahi
  if (MASTER_KEYS.includes(key) || MASTER_KEYS.includes(key.toLowerCase())) {
    return res.json({
      valid: true, plan: "lifetime", tier: "pro",
      features: featuresFor("lifetime"),
      expiresAt: null, expiry: null, gmail: email, name: "Admin",
    });
  }

  try {
    const lic = await getLicense(key);
    if (!lic) return res.json({ valid: false, error: "Key nahi mili. Sahi key daalo." });
    if (!lic.is_active) return res.json({ valid: false, error: "Key deactivated hai. Support se contact karo." });

    if (lic.expiry && new Date(lic.expiry) < new Date()) {
      return res.json({ valid: false, error: "Key expire ho gayi. Renew karo.", expiresAt: lic.expiry });
    }

    // Email match (agar license pe email hai toh)
    if (lic.email && email && String(lic.email).toLowerCase().trim() !== email) {
      return res.json({ valid: false, error: "Yeh key dusre email pe registered hai." });
    }

    // Device binding — pehli baar bind, baad mein match
    if (lic.machine_id && deviceId && lic.machine_id !== deviceId) {
      return res.json({ valid: false, error: "Yeh key dusre device pe active hai. Support se contact karo." });
    }
    if (!lic.machine_id && deviceId) {
      await bindMachine(key, deviceId);
    }

    return res.json({
      valid: true,
      plan: lic.plan,
      tier: tierFor(lic.plan),
      features: featuresFor(lic.plan),
      expiresAt: lic.expiry,
      expiry: lic.expiry,
      gmail: lic.email || email,
      name: lic.name,
    });
  } catch (e) {
    console.error("Verify error:", e);
    return res.status(500).json({ valid: false, error: "Server error. Thodi der baad try karo." });
  }
};
