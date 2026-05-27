const { getLicense } = require("../../lib/supabase");
const { cors } = require("../../lib/helpers");

const STOPWORDS = new Set(["for","and","the","with","of","in","to","a","an","by","on","at","is","are","ka","ki","ke","hai","aur","se","mein","ko","ek","this","that","or","from","as","not"]);

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { key, titles } = req.body || {};
  if (!key) return res.json({ success: false, error: "License key required" });

  const lic = await getLicense(key);
  if (!lic || !lic.is_active) return res.json({ success: false, error: "Invalid license" });
  if (lic.expiry && new Date(lic.expiry) < new Date()) return res.json({ success: false, error: "License expired" });

  if (!Array.isArray(titles) || titles.length === 0)
    return res.json({ success: false, error: "Titles array required" });

  // Frequency analysis
  const freq = {};
  titles.forEach(title => {
    if (typeof title !== "string") return;
    title.toLowerCase()
      .replace(/[|&]/g, " ")
      .split(/[\s,\/\-\+\|]+/)
      .filter(w => w.length > 2 && !STOPWORDS.has(w) && !/^\d+$/.test(w))
      .forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  });

  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .map(([kw]) => kw);

  res.json({ success: true, keywords: sorted });
};
