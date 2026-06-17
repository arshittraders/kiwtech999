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
