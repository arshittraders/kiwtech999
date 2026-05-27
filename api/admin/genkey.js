const { saveLicense } = require("../../lib/supabase");
const { sendLicenseEmail } = require("../../lib/email");
const { genKey, cors, checkAdminPass } = require("../../lib/helpers");

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { pwd, password, name, plan, expiry, days, email, sendEmail } = req.body || {};
  const pass = pwd || password;

  if (!checkAdminPass(pass)) return res.json({ success: false, error: "Wrong admin password" });

  try {
    const key = genKey();
    const finalExpiry = plan === "lifetime" ? null :
      expiry || (days ? new Date(Date.now() + parseInt(days) * 86400000).toISOString().slice(0, 10) : null);
    const finalEmail = email || "manual@kiwtech.in";

    await saveLicense({ key, email: finalEmail, name: name || "Manual", plan: plan || "monthly", expiry: finalExpiry });

    // Agar email diya ho to send karo
    if (email && sendEmail) {
      await sendLicenseEmail({ email, name: name || "Customer", key, plan: plan || "monthly", expiry: finalExpiry });
    }

    res.json({ success: true, key });
  } catch (e) {
    console.error("Genkey error:", e);
    res.status(500).json({ success: false, error: e.message });
  }
};
