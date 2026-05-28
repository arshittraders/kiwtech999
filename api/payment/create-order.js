const Razorpay = require("razorpay");

const PLANS = {
  demo:    { amount: 5782,   days: 1,  label: "Demo Trial (1 Day)" },    // ₹49 + 18% GST = ₹57.82
  monthly: { amount: 117882, days: 30, label: "Monthly Plan (30 Days)" } // ₹999 + 18% GST = ₹1178.82
};

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { plan, email, name, state } = req.body || {};
  if (!PLANS[plan]) return res.status(400).json({ error: "Invalid plan" });
  if (!email || !name) return res.status(400).json({ error: "Email aur naam required hai" });

  const stateCode = state || "07"; // default Delhi (supplier state)

  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET
    });
    const order = await razorpay.orders.create({
      amount: PLANS[plan].amount,
      currency: "INR",
      receipt: "kwt_" + Date.now(),
      notes: { plan, email, name, state: stateCode }
    });
    res.json({ orderId: order.id, amount: order.amount, keyId: process.env.RAZORPAY_KEY_ID, plan });
  } catch (e) {
    console.error("Order create error:", e);
    res.status(500).json({ error: e.message });
  }
};
