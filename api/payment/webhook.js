const crypto = require("crypto");
const { saveLicense, saveOrder } = require("../../lib/supabase");
const { sendLicenseEmail } = require("../../lib/email");
const { genKey } = require("../../lib/helpers");

const PLANS = {
  demo:    { days: 1,  paise: 5782   },
  monthly: { days: 30, paise: 117882 },
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

  // Plan auto-detect karo agar notes mein sahi nahi hai
  let resolvedPlan = plan;
  let planCfg = PLANS[plan];
  
  // Agar plan nahi mila toh amount se detect karo
  if (!planCfg) {
    if (payment.amount >= 100000) {
      resolvedPlan = 'monthly';
      planCfg = PLANS['monthly'];
    } else {
      resolvedPlan = 'demo';
      planCfg = PLANS['demo'];
    }
    console.log("Plan auto-detected from amount:", resolvedPlan);
  }

  // Amount check — sirf minimum check, exact nahi
  if (payment.amount < planCfg.paise * 0.9) {
    console.error(`Amount too low: paid ${payment.amount}, expected ~${planCfg.paise} for ${resolvedPlan}`);
    return res.status(400).json({ error: "Amount too low" });
  }

  try {
    const key = genKey();
    const days = planCfg.days;
    const expiry = new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

    await saveLicense({ key, email, name: name || "Customer", plan: resolvedPlan, expiry });
    await saveOrder({
      paymentId: payment.id,
      orderId: payment.order_id,
      email, name: name || "Customer", plan: resolvedPlan,
      amount: payment.amount
    });
    await sendLicenseEmail({
      email, name: name || "Customer", key, plan: resolvedPlan, expiry,
      amount: payment.amount, state: state || "07"
    });

    console.log("License sent:", key, "to", email);
    res.json({ ok: true });
  } catch (e) {
    console.error("Webhook processing error:", e);
    res.status(500).json({ error: e.message });
  }
};
