const crypto = require("crypto");
const { saveLicense, saveOrder, getLicenseByEmail, deactivateLicense } = require("../../lib/supabase");
const { sendLicenseEmail } = require("../../lib/email");
const { genKey } = require("../../lib/helpers");

const PLANS = {
  demo:    { days: 1,  paise: 5782   },   // ₹57.82 — 1 din
  monthly: { days: 30, paise: 117882 },   // ₹1178.82 — 30 din
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

  if (!email) {
    console.error("Missing email in notes:", payment.notes);
    return res.status(400).json({ error: "Missing email" });
  }

  // ── SHIPPING CREDITS PLAN ─────────────────────────────────
  const CREDIT_PLANS = {
    shipping_50:  { credits: 50,  paise: 5000  },
    shipping_150: { credits: 150, paise: 12000 },
    shipping_300: { credits: 300, paise: 22000 },
    shipping_700: { credits: 700, paise: 49000 },
  };

  // Also detect by amount if plan note missing
  const detectCreditPlan = (amount) => {
    if (amount >= 45000 && amount <= 55000)  return CREDIT_PLANS.shipping_50;
    if (amount >= 10000 && amount <= 13000)  return CREDIT_PLANS.shipping_150;
    if (amount >= 20000 && amount <= 25000)  return CREDIT_PLANS.shipping_300;
    if (amount >= 45000 && amount <= 52000)  return CREDIT_PLANS.shipping_700;
    return null;
  };

  const creditPlan = CREDIT_PLANS[plan] || detectCreditPlan(payment.amount);

  if (creditPlan) {
    // Handle shipping credits top-up
    try {
      const { createClient } = require("@supabase/supabase-js");
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

      // Check existing balance
      const { data: existing } = await supabase
        .from("shipping_credits")
        .select("credits")
        .eq("email", email.toLowerCase())
        .single();

      const currentCredits = existing?.credits || 0;
      const newCredits = currentCredits + creditPlan.credits;

      if (existing) {
        await supabase.from("shipping_credits")
          .update({ credits: newCredits, updated_at: new Date().toISOString() })
          .eq("email", email.toLowerCase());
      } else {
        await supabase.from("shipping_credits")
          .insert({ email: email.toLowerCase(), credits: newCredits });
      }

      console.log("Shipping credits added:", creditPlan.credits, "for", email, "total:", newCredits);
      return res.json({ ok: true, type: "shipping_credits", credits: newCredits });
    } catch(e) {
      console.error("Credits error:", e);
      return res.status(500).json({ error: e.message });
    }
  }

  if (!plan) {
    console.error("Missing plan in notes:", payment.notes);
    return res.status(400).json({ error: "Missing plan" });
  }

  // Plan config
  let resolvedPlan = plan;
  let planCfg = PLANS[plan];
  if (!planCfg) {
    resolvedPlan = payment.amount >= 100000 ? 'monthly' : 'demo';
    planCfg = PLANS[resolvedPlan];
  }

  // Amount check — 10% tolerance
  if (payment.amount < planCfg.paise * 0.9) {
    console.error(`Amount too low: ${payment.amount} for ${resolvedPlan}`);
    return res.status(400).json({ error: "Amount too low" });
  }

  try {
    const key = genKey();
    const days = planCfg.days;
    const expiry = new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

    // Same email pe purani key deactivate karo (upgrade logic)
    try {
      const oldLic = await getLicenseByEmail(email);
      if (oldLic && oldLic.key) {
        await deactivateLicense(oldLic.key);
        console.log("Old license deactivated:", oldLic.key, "for", email);
      }
    } catch(e) {
      console.log("No old license found or deactivate failed:", e.message);
    }

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

    console.log("License sent:", key, "to", email, "plan:", resolvedPlan, "expiry:", expiry);
    res.json({ ok: true });
  } catch (e) {
    console.error("Webhook error:", e);
    res.status(500).json({ error: e.message });
  }
};
