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

  const groqKey = process.env.GROQ_KEY;
  if (!groqKey) return res.json({ success: false, error: "Server configuration error" });

  const kwStr = Array.isArray(keywords) ? keywords.slice(0, 10).join(", ") : (keywords || "");
  const attrStr = typeof attrs === "object" ? Object.entries(attrs).slice(0, 8).map(([k, v]) => k + ": " + v).join(", ") : (attrs || "");

  const systemPrompt = `You are an expert Indian e-commerce SEO specialist for Meesho sellers.
Your job is to generate product listings STRICTLY based on the product category given.
CRITICAL RULES:
- NEVER mix product categories. If the product is a saree, write ONLY about sarees. Never mention hair, shampoo, oil, skincare, or any unrelated category.
- If product is clothing/fashion: focus on fabric, design, occasion, color, style, blouse piece, drape.
- If product is hair care: focus on ingredients, hair benefits, how to use.
- If product is electronics: focus on specs, compatibility, warranty.
- Title MUST be 145-150 characters. Count carefully. If too short, add more keywords.
- Description MUST be 450-500 words. Do not write less.
- Always detect the product category and stay 100% within that category.
- Return ONLY valid JSON. No markdown. No explanation outside JSON.`;

  let chatMessages;
  if (messages && Array.isArray(messages) && messages.length > 0) {
    chatMessages = messages;
  } else {
    const prompt = \`You are an expert Meesho product listing writer.
Product: "\${productName}"
Category: \${category || "General"}
Keywords: \${kwStr}
Attributes: \${attrStr}

Create SEO-optimized listing:
- Title: 145-150 chars. Title Case. NO special chars.
- Description: 450-500 words. Hinglish. Features, material, occasions, benefits.

Return ONLY JSON: {"title":"...","description":"..."}\`;
    chatMessages = [{ role: "user", content: prompt }];
  }

  // Detect if vision message (has image_url)
  const hasImage = chatMessages.some(m =>
    Array.isArray(m.content) && m.content.some(c => c.type === "image_url")
  );
  const model = hasImage ? "llama-3.2-11b-vision-preview" : "llama-3.3-70b-versatile";

  try {
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
        temperature: 0.7
      })
    });

    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      console.error("Groq response:", JSON.stringify(data));
      return res.json({ success: false, error: "AI response empty: " + JSON.stringify(data).slice(0,200) });
    }

    const text = data.choices[0].message.content;

    try {
      const clean = text.replace(/\`\`\`json|\`\`\`/g, "").trim();
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : clean);
      return res.json({
        success: true,
        title: parsed.title || productName || "Product",
        description: parsed.description || text,
        score: parsed.score || null,
        scoreNote: parsed.scoreNote || null,
        brandsRemoved: parsed.brandsRemoved || []
      });
    } catch(parseErr) {
      return res.json({ success: true, title: productName || "Product", description: text });
    }

  } catch (e) {
    console.error("AI error:", e);
    res.json({ success: false, error: "AI generation failed: " + e.message });
  }
};
