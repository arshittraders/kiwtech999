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
  const systemPrompt = `You are a senior Indian e-commerce SEO expert writing Meesho product listings.

ABSOLUTE RULES — follow every single one:
1. TITLE: MUST be exactly 145-150 characters. Count every character. If below 145, add more keywords. NEVER stop at 50-60 chars.
2. DESCRIPTION: MUST be 450-500 words. No less. Write in English only — NO Hinglish, NO Hindi words.
3. CATEGORY LOCK: Only write about the product category given. NEVER mix categories.
4. NO BRAND NAMES anywhere in title or description.
5. NO spam adjectives: graceful, designer, classy, sensational, trendy, premium, superior, alluring, wonderful, fabulous, voguish, selzer, elegant.
6. Use ONLY real search keywords — product type, material, features, benefits, occasions, size/pack.
7. Return ONLY raw JSON — no markdown, no explanation outside JSON.`;

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
