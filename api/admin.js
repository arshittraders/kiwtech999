const { deleteLicense, saveLicense, getAllLicenses } = require("../lib/supabase");
const { sendLicenseEmail } = require("../lib/email");
const { genKey, cors, checkAdminPass } = require("../lib/helpers");

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { pwd, password, action, key, name, plan, expiry, days, email, sendEmail: doSendEmail } = req.body || {};
  const pass = pwd || password;

  if (!checkAdminPass(pass)) return res.json({ success: false, error: "Wrong admin password" });

  try {
    // ── genkey ──
    if (action === "genkey" || (!action && name !== undefined)) {
      // All-in-One (Research Tool v5) extension verifies keys on the Cloudflare worker,
      // so paid All-in-One keys must be created there (same as the worker /admin panel).
      if (plan === "allinone" || plan === "trial") {
        const CF = "https://kiwtech-backend.kiwtech.workers.dev";
        const gmail = String(email || "").trim().toLowerCase();
        if (!gmail) return res.json({ success: false, error: "Email required" });
        if (!process.env.CF_ADMIN_PASSWORD) return res.json({ success: false, error: "CF_ADMIN_PASSWORD missing on Vercel" });
        const lr = await fetch(CF + "/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: process.env.CF_ADMIN_PASSWORD }) });
        const ld = await lr.json().catch(() => ({}));
        if (!ld.success) return res.json({ success: false, error: "CF login failed: " + (ld.error || lr.status) });
        const d = parseInt(days) || (plan === "trial" ? 3 : 30);
        const cr = await fetch(CF + "/api/admin/create", { method: "POST", headers: { "Content-Type": "application/json", "X-Admin-Token": ld.token }, body: JSON.stringify({ gmail, plan: "monthly", days: d, note: (plan === "trial" ? "trial99 " : "auto-paid ") + (name || "") }) });
        const cd = await cr.json().catch(() => ({}));
        if (!cd.success || !cd.key) return res.json({ success: false, error: "CF key create failed: " + (cd.error || cr.status) });
        const cfExpiry = new Date(Date.now() + d * 86400000).toISOString().slice(0, 10);
        if (doSendEmail) await sendLicenseEmail({ email: gmail, name: name || "Customer", key: cd.key, plan, expiry: cfExpiry });
        return res.json({ success: true, key: cd.key, via: "cf" });
      }
      const newKey = genKey();
      const finalExpiry = plan === "lifetime" ? null :
        expiry || (days ? new Date(Date.now() + parseInt(days) * 86400000).toISOString().slice(0, 10) : null);
      const finalEmail = email || "manual@kiwtech.in";
      await saveLicense({ key: newKey, email: finalEmail, name: name || "Manual", plan: plan || "monthly", expiry: finalExpiry });
      if (email && doSendEmail) {
        await sendLicenseEmail({ email, name: name || "Customer", key: newKey, plan: plan || "monthly", expiry: finalExpiry });
      }
      return res.json({ success: true, key: newKey });
    }

    // ── listkeys ──
    if (action === "listkeys") {
      const keys = await getAllLicenses();
      return res.json({ success: true, keys });
    }

    // ── deletekey ──
    if (action === "deletekey") {
      if (!key) return res.json({ success: false, error: "Key required" });
      await deleteLicense(key);
      return res.json({ success: true });
    }

    return res.json({ success: false, error: "Unknown action" });
  } catch (e) {
    console.error("Admin error:", e);
    return res.status(500).json({ success: false, error: e.message });
  }
};
