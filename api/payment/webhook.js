const crypto = require("crypto");
const { saveLicense, saveOrder } = require("../../lib/supabase");
const { sendLicenseEmail } = require("../../lib/email");
const { genKey } = require("../../lib/helpers");

const PLANS = {
  demo:    { days: 1,  paise: 5782   }, // ₹57.82
  monthly: { days: 30, paise: 117882 }, // ₹1178.82
};

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();

  const sig = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(req.body);
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body).digest("hex");
  if (sig !== expected) {
    console.error("Invalid webhook signature");
    return res.status(400).json({ error: "Invalid signature" });
  }

  const event = req.body.event;
  if (event !== "payment.captured") return res.json({ ok: true, skipped: event });

  const payment = req.body.payload.payment.entity;
  const { plan, email, name, state } = payment.notes || {};

  if (!email || !plan) {
    console.error("Missing notes in payment:", payment.notes);
    return res.status(400).json({ error: "Missing payment notes" });
  }

  const planCfg = PLANS[plan];
  if (!planCfg) {
    console.error("Unknown plan in notes:", plan);
    return res.status(400).json({ error: "Unknown plan" });
  }

  // SECURITY: amount plan se match karta hai?
  if (payment.amount !== planCfg.paise) {
    console.error(`Amount mismatch: paid ${payment.amount}, expected ${planCfg.paise} for ${plan}`);
    return res.status(400).json({ error: "Amount mismatch" });
  }

  try {
    const key = genKey();
    const days = planCfg.days;
    const expiry = new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

    await saveLicense({ key, email, name: name || "Customer", plan, expiry });
    await saveOrder({
      paymentId: payment.id,
      orderId: payment.order_id,
      email, name: name || "Customer", plan,
      amount: payment.amount
    });
    await sendLicenseEmail({
      email, name: name || "Customer", key, plan, expiry,
      amount: payment.amount, state: state || "07"
    });

    console.log("License sent:", key, "to", email);
    res.json({ ok: true });
  } catch (e) {
    console.error("Webhook processing error:", e);
    res.status(500).json({ error: e.message });
  }
};
