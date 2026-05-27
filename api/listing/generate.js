const { getLicense } = require("../../lib/supabase");
const { cors } = require("../../lib/helpers");

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { key, productName, category, keywords, attrs, mode } = req.body || {};
  if (!key) return res.json({ success: false, error: "License key required" });

  // License validate
  const lic = await getLicense(key);
  if (!lic || !lic.is_active) return res.json({ success: false, error: "Invalid license" });
  if (lic.expiry && new Date(lic.expiry) < new Date()) return res.json({ success: false, error: "License expired" });

  const groqKey = process.env.GROQ_KEY;
  if (!groqKey) return res.json({ success: false, error: "Server configuration error" });

  const kwStr = Array.isArray(keywords) ? keywords.slice(0, 10).join(", ") : (keywords || "");
  const attrStr = typeof attrs === "object" ? Object.entries(attrs).slice(0, 8).map(([k, v]) => k + ": " + v).join(", ") : (attrs || "");

  const prompt = `You are an expert Meesho product listing writer for Indian e-commerce.
Product: "${productName}"
Category: ${category || "General"}
Top Keywords: ${kwStr}
Attributes: ${attrStr}

Create a UNIQUE, SEO-optimized listing:
1. Title: Max 80 chars. Include product type + keywords. Different from competitors.
2. Description: 150-180 words. Hinglish (Hindi+English mix). Include features, size chart if clothing, benefits, wash care. End with "Country of Origin: India". Start with emoji.

Return JSON only: {"title":"...","description":"..."}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + groqKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.7
      })
    });
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    res.json({ success: true, title: parsed.title || productName, description: parsed.description || "" });
  } catch (e) {
    console.error("AI error:", e);
    res.json({ success: false, error: "AI generation failed: " + e.message });
  }
};
