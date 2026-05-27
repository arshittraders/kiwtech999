const Razorpay = require("razorpay");

const PLANS = {
  monthly:  { amount: 99900,  days: 30,  label: "Monthly Plan" },
  yearly:   { amount: 599900, days: 365, label: "Yearly Plan" },
  lifetime: { amount: 199900, days: null,label: "Lifetime Plan" }
};

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { plan, email, name } = req.body || {};
  if (!PLANS[plan]) return res.status(400).json({ error: "Invalid plan" });
  if (!email || !name) return res.status(400).json({ error: "Email aur naam required hai" });

  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET
    });
    const order = await razorpay.orders.create({
      amount: PLANS[plan].amount,
      currency: "INR",
      receipt: "kwt_" + Date.now(),
      notes: { plan, email, name }
    });
    res.json({ orderId: order.id, amount: order.amount, keyId: process.env.RAZORPAY_KEY_ID, plan });
  } catch (e) {
    console.error("Order create error:", e);
    res.status(500).json({ error: e.message });
  }
};
