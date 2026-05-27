const { getAllLicenses } = require("../../lib/supabase");
const { cors, checkAdminPass } = require("../../lib/helpers");

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { pwd, password } = req.body || {};
  if (!checkAdminPass(pwd || password)) return res.json({ success: false, error: "Wrong admin password" });

  try {
    const keys = await getAllLicenses();
    res.json({ success: true, keys });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};
