const { getLicense, bindMachine } = require("../../lib/supabase");
const { cors } = require("../../lib/helpers");

// Master keys — kisi bhi machine pe chalenge, expiry nahi
const MASTER_KEYS = ['KWT-MASTER-ADMIN-99999'];

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { key, machineId } = req.body || {};
  if (!key) return res.json({ valid: false, error: "Key nahi diya" });

  // Master key check — seedha valid
  if (MASTER_KEYS.includes(key.trim().toUpperCase())) {
    return res.json({ valid: true, plan: 'lifetime', expiry: null, name: 'Admin' });
  }

  try {
    const lic = await getLicense(key);
    if (!lic) return res.json({ valid: false, error: "Key nahi mili. Sahi key daalo." });
    if (!lic.is_active) return res.json({ valid: false, error: "Key deactivated hai. Support se contact karo." });

    // Expiry check
    if (lic.expiry && new Date(lic.expiry) < new Date()) {
      return res.json({ valid: false, error: "Key expire ho gayi. Renew karo.", expiry: lic.expiry });
    }

    // Machine binding
    if (lic.machine_id && machineId && lic.machine_id !== machineId) {
      return res.json({ valid: false, error: "Yeh key dusre device pe active hai. Support se contact karo." });
    }
    if (!lic.machine_id && machineId) {
      await bindMachine(key, machineId);
    }

    res.json({
      valid: true,
      plan: lic.plan,
      expiry: lic.expiry,
      name: lic.name
    });
  } catch (e) {
    console.error("Validate error:", e);
    res.status(500).json({ valid: false, error: "Server error. Thodi der baad try karo." });
  }
};
