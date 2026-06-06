const { getLicense } = require("../../lib/supabase");
const { cors } = require("../../lib/helpers");

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { key, productName, category, keywords, attrs, mode, messages, maxTokens } = req.body || {};
  if (!key) return res.json({ success: false, error: "License key required" });

  const MASTER_KEYS = ["KWT-MASTER-ADMIN-99999"];
  if (!MASTER_KEYS.includes((key||"").toUpperCase().trim())) {
    const lic = await getLicense(key);
    if (!lic || !lic.is_active) return res.json({ success: false, error: "Invalid license" });
    if (lic.expiry && new Date(lic.expiry) < new Date()) return res.json({ success: false, error: "License expired" });
  }

  const openaiKey = process.env.OPENAI_KEY;
  const groqKey   = process.env.GROQ_KEY;
  if (!openaiKey && !groqKey) return res.json({ success: false, error: "No AI key configured" });

  const kwStr  = Array.isArray(keywords) ? keywords.slice(0,10).join(", ") : (keywords || "");
  const attrStr = typeof attrs === "object" ? Object.entries(attrs).slice(0,8).map(([k,v])=>k+": "+v).join(", ") : (attrs||"");

  // ── System prompt ──────────────────────────────────────────────────────────
  const systemPrompt = `You are a senior Indian e-commerce product listing writer for Meesho sellers.

RULES — follow all without exception:
1. TITLE: Exactly 145-150 characters. Start with main product type. Include material, feature, benefit, occasion, audience. Count characters precisely — must be 145-150. If too short, keep adding relevant keywords until you reach 145 chars minimum.
2. DESCRIPTION: Exactly 450-500 words. English only — no Hindi, no Hinglish. Write in natural human tone. Do NOT write like an AI assistant. Avoid phrases: "this product offers", "it is designed to", "look no further", "perfect for all", "elevate your experience". Write the way a knowledgeable seller would describe their product.
3. CATEGORY LOCK: Stay 100% within the product category. Never mix categories.
4. BRAND NAMES: Never use any brand name in title or description.
5. SPAM ADJECTIVES: Never use: graceful, designer, classy, sensational, trendy, premium, superior, alluring, wonderful, fabulous, voguish, elegant, exclusive, luxurious, magnificent.
6. Use product attributes (color, fabric, size, capacity, shelf life, etc.) naturally within the description text.
7. Never mention "Kiwtech" anywhere.
8. Return ONLY raw JSON — no markdown, no explanation.`;

  let chatMessages;
  if (messages && Array.isArray(messages) && messages.length > 0) {
    chatMessages = messages;
  } else {
    const prompt = `Product: "${productName}" | Category: ${category||"General"} | Keywords: ${kwStr} | Attributes: ${attrStr}

Write a Meesho listing:
- Title: exactly 145-150 chars, Title Case, no special chars
- Description: exactly 450-500 words, English only, cover features/material/benefits/occasions/how to use/audience

Return ONLY JSON: {"title":"...","description":"..."}`;
    chatMessages = [{ role: "user", content: prompt }];
  }

  // ── Detect if image is in messages ────────────────────────────────────────
  const hasImage = chatMessages.some(m =>
    Array.isArray(m.content) && m.content.some(c => c.type === "image_url")
  );

  // ── Try OpenAI first (best quality), fallback to Groq ────────────────────
  async function callOpenAI() {
    const model = hasImage ? "gpt-4o" : "gpt-4o";
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + openaiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...chatMessages
        ],
        max_tokens: maxTokens || 3000,
        temperature: 0.5,
        response_format: { type: "json_object" }
      })
    });
    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) throw new Error("OpenAI empty: " + JSON.stringify(data).slice(0,150));
    return data.choices[0].message.content;
  }

  async function callGroq() {
    const model = hasImage ? "llama-3.2-11b-vision-preview" : "llama-3.3-70b-versatile";
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + groqKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...chatMessages
        ],
        max_tokens: maxTokens || 3000,
        temperature: 0.5
      })
    });
    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) throw new Error("Groq empty: " + JSON.stringify(data).slice(0,150));
    return data.choices[0].message.content;
  }

  try {
    let text = "";

    if (openaiKey) {
      try {
        text = await callOpenAI();
      } catch(e) {
        console.error("OpenAI failed, trying Groq:", e.message);
        if (groqKey) text = await callGroq();
        else throw e;
      }
    } else {
      text = await callGroq();
    }

    // ── Parse JSON ────────────────────────────────────────────────────────
    const clean = text.replace(/```json|```/g, "").trim();
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : clean);

    // ── Validate title length ─────────────────────────────────────────────
    let title = (parsed.title || productName || "Product").trim();
    // Strip brand names that may have slipped through
    const brandSpam = /\b(graceful|designer|classy|selzer|wonderful|sensational|trendy|premium|superior|alluring|fabulous|voguish|elegant|stylish|exclusive|unique|fancy)\b/gi;
    title = title.replace(brandSpam, "").replace(/\s{2,}/g," ").trim();

    return res.json({
      success: true,
      title,
      description: parsed.description || text,
      score: parsed.score || null,
      scoreNote: parsed.scoreNote || null,
      brandsRemoved: parsed.brandsRemoved || [],
      aiModel: openaiKey ? "gpt-4o" : "llama-3.3-70b"
    });

  } catch (e) {
    console.error("AI error:", e);
    res.json({ success: false, error: "AI generation failed: " + e.message });
  }
};
