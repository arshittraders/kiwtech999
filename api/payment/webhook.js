const crypto = require("crypto");
const { saveLicense, saveOrder } = require("../../lib/supabase");
const { sendLicenseEmail } = require("../../lib/email");
const { genKey } = require("../../lib/helpers");

const PLAN_DAYS = { monthly: 30, yearly: 365, lifetime: null };

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();

  // Razorpay signature verify
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
  const { plan, email, name } = payment.notes;

  if (!email || !plan) {
    console.error("Missing notes in payment:", payment.notes);
    return res.status(400).json({ error: "Missing payment notes" });
  }

  try {
    const key = genKey();
    const days = PLAN_DAYS[plan];
    const expiry = days ? new Date(Date.now() + days * 86400000).toISOString().slice(0, 10) : null;

    await saveLicense({ key, email, name: name || "Customer", plan, expiry });
    await saveOrder({
      paymentId: payment.id,
      orderId: payment.order_id,
      email, name: name || "Customer", plan,
      amount: payment.amount
    });
    await sendLicenseEmail({ email, name: name || "Customer", key, plan, expiry });

    console.log("License sent:", key, "to", email);
    res.json({ ok: true });
  } catch (e) {
    console.error("Webhook processing error:", e);
    res.status(500).json({ error: e.message });
  }
};
