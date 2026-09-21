// POST /api/openai  — Cloudflare Worker ke /api/openai ka replacement.
// Body:     { email, key, deviceId, payload }   payload = OpenAI chat completion body
// Response: { success, content } ya { success:false, error }
// Yahan plan gating SERVER side pe hoti hai — ₹299 (shipping tier) wale
// AI call nahi kar sakte, chahe extension chhed diya jaye.

const { getLicense } = require("../lib/supabase");
const { cors } = require("../lib/helpers");
const { tierFor, hasFeature } = require("../lib/plans");

const MASTER_KEYS = ["KWT-MASTER-ADMIN-99999", "kwt-master-admin-99999"];

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const body = req.body || {};
  const key = String(body.key || "").toUpperCase().trim();
  const email = String(body.email || "").toLowerCase().trim();
  const deviceId = String(body.deviceId || "").trim();
  const payload = body.payload;

  if (!key || !email) return res.json({ success: false, error: "Login required — popup mein license activate karein" });
  if (!payload || !payload.messages) return res.json({ success: false, error: "Payload missing" });

  // ── License + plan check ──────────────────────────────────────────────
  let plan = "lifetime";
  if (!MASTER_KEYS.includes(key) && !MASTER_KEYS.includes(key.toLowerCase())) {
    try {
      const lic = await getLicense(key);
      if (!lic) return res.json({ success: false, error: "Key nahi mili. Sahi key daalo." });
      if (!lic.is_active) return res.json({ success: false, error: "Key deactivated hai." });
      if (lic.expiry && new Date(lic.expiry) < new Date()) {
        return res.json({ success: false, error: "Key expire ho gayi. Renew karo." });
      }
      if (lic.email && String(lic.email).toLowerCase().trim() !== email) {
        return res.json({ success: false, error: "Yeh key dusre email pe registered hai." });
      }
      if (lic.machine_id && deviceId && lic.machine_id !== deviceId) {
        return res.json({ success: false, error: "Yeh key dusre device pe active hai." });
      }
      plan = lic.plan;
    } catch (e) {
      console.error("openai license check:", e);
      return res.status(500).json({ success: false, error: "Server error. Thodi der baad try karo." });
    }
  }

  if (!hasFeature(plan, "ai_listing")) {
    return res.json({
      success: false,
      locked: true,
      tier: tierFor(plan),
      error: "Yeh AI feature ₹499 wale plan mein hai. Aapka plan sirf Shipping Optimizer ke liye hai — upgrade karein: kiwtech.in/tools",
    });
  }

  // ── OpenAI call (Groq fallback) ───────────────────────────────────────
  const openaiKey = process.env.OPENAI_KEY;
  const groqKey = process.env.GROQ_KEY;

  const callApi = async (url, apiKey, model) => {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: model || payload.model || "gpt-4o",
        messages: payload.messages,
        max_tokens: payload.max_tokens || 2000,
        temperature: payload.temperature !== undefined ? payload.temperature : 0.7,
        ...(payload.response_format ? { response_format: payload.response_format } : {}),
      }),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error?.message || `HTTP ${r.status}`);
    return j?.choices?.[0]?.message?.content || "";
  };

  try {
    if (openaiKey) {
      const content = await callApi("https://api.openai.com/v1/chat/completions", openaiKey, payload.model);
      return res.json({ success: true, content, plan, tier: tierFor(plan) });
    }
    if (groqKey) {
      const content = await callApi("https://api.groq.com/openai/v1/chat/completions", groqKey, "llama-3.3-70b-versatile");
      return res.json({ success: true, content, plan, tier: tierFor(plan) });
    }
    return res.json({ success: false, error: "AI key configure nahi hai — admin se contact karein" });
  } catch (e) {
    if (groqKey && openaiKey) {
      try {
        const content = await callApi("https://api.groq.com/openai/v1/chat/completions", groqKey, "llama-3.3-70b-versatile");
        return res.json({ success: true, content, plan, tier: tierFor(plan), fallback: "groq" });
      } catch (e2) {
        return res.json({ success: false, error: e2.message });
      }
    }
    return res.json({ success: false, error: e.message });
  }
};
