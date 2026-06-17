import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const ADMIN_KEY = process.env.ADMIN_KEY || 'kiwtech@admin2026';
const MIN_WITHDRAW = 500;

const COMMISSIONS = {
  meesho_basic:      { name: 'Research Tool Basic',      commission: 349 },
  meesho_advanced:   { name: 'Research Tool Advanced',   commission: 499 },
  shipping_topup_50: { name: 'Shipping Optimizer ₹50',   commission: 25  },
  shipping_topup_120:{ name: 'Shipping Optimizer ₹120',  commission: 60  },
  shipping_topup_220:{ name: 'Shipping Optimizer ₹220',  commission: 110 },
  shipping_topup_490:{ name: 'Shipping Optimizer ₹490',  commission: 245 },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-admin-key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = req.query.action;

  // ── DISTRIBUTOR: Apply ──────────────────────────────────────
  if (action === 'apply' && req.method === 'POST') {
    const { name, email, phone, city, why, upi } = req.body;
    if (!name || !email || !phone)
      return res.status(400).json({ error: 'Name, email, phone required' });

    const { data: existing } = await supabase
      .from('distributors').select('email, status')
      .eq('email', email.toLowerCase()).single();

    if (existing) {
      if (existing.status === 'approved')
        return res.status(400).json({ error: 'Already an approved distributor!' });
      if (existing.status === 'pending')
        return res.status(400).json({ error: 'Application already submitted. Wait for approval.' });
      if (existing.status === 'rejected')
        return res.status(400).json({ error: 'Application was rejected. WhatsApp pe contact karo.' });
    }

    const { error } = await supabase.from('distributors').insert({
      name, email: email.toLowerCase(), phone, city, why, upi_id: upi, status: 'pending'
    });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }

  // ── DISTRIBUTOR: Dashboard ──────────────────────────────────
  if (action === 'dashboard' && req.method === 'GET') {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const { data: dist } = await supabase
      .from('distributors').select('*').eq('email', email.toLowerCase()).single();

    if (!dist) return res.status(404).json({ error: 'Distributor not found' });

    if (dist.status === 'pending')
      return res.json({ distributor: { status: 'pending', ref_code: null }, wallet_balance: 0, total_earned: 0, total_sales: 0, total_withdrawn: 0, commissions: [], withdrawals: [] });

    const { data: commissions } = await supabase
      .from('dist_commissions').select('*').eq('distributor_email', email.toLowerCase())
      .order('created_at', { ascending: false }).limit(50);

    const { data: withdrawals } = await supabase
      .from('dist_withdrawals').select('*').eq('distributor_email', email.toLowerCase())
      .order('requested_at', { ascending: false }).limit(20);

    return res.json({
      distributor: dist,
      wallet_balance: dist.wallet_balance,
      total_earned: dist.total_earned,
      total_sales: dist.total_sales,
      total_withdrawn: dist.total_withdrawn,
      commissions: commissions || [],
      withdrawals: withdrawals || []
    });
  }

  // ── ADMIN: List distributors ────────────────────────────────
  if (action === 'admin-list' && req.method === 'GET') {
    if (req.headers['x-admin-key'] !== ADMIN_KEY)
      return res.status(401).json({ error: 'Unauthorized' });
    const { data, error } = await supabase.from('distributors').select('*')
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ distributors: data });
  }

  // ── ADMIN: Approve/Reject ───────────────────────────────────
  if (action === 'admin-approve' && req.method === 'POST') {
    if (req.headers['x-admin-key'] !== ADMIN_KEY)
      return res.status(401).json({ error: 'Unauthorized' });
    const { email, act } = req.body;
    if (!email || !act) return res.status(400).json({ error: 'Email and act required' });
    const updates = { status: act === 'approve' ? 'approved' : 'rejected' };
    if (act === 'approve') updates.approved_at = new Date().toISOString();
    const { error } = await supabase.from('distributors').update(updates)
      .eq('email', email.toLowerCase());
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true });
  }

  // ── ADMIN: List withdrawals ─────────────────────────────────
  if (action === 'admin-withdrawals' && req.method === 'GET') {
    if (req.headers['x-admin-key'] !== ADMIN_KEY)
      return res.status(401).json({ error: 'Unauthorized' });
    const { data, error } = await supabase.from('dist_withdrawals').select('*')
      .order('requested_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ withdrawals: data });
  }

  // ── ADMIN: Mark withdrawal paid ─────────────────────────────
  if (action === 'mark-paid' && req.method === 'POST') {
    if (req.headers['x-admin-key'] !== ADMIN_KEY)
      return res.status(401).json({ error: 'Unauthorized' });
    const { withdrawal_id, payment_proof } = req.body;
    if (!withdrawal_id || !payment_proof)
      return res.status(400).json({ error: 'withdrawal_id and payment_proof required' });

    const { data: w } = await supabase.from('dist_withdrawals')
      .select('*').eq('id', withdrawal_id).single();
    if (!w) return res.status(404).json({ error: 'Withdrawal not found' });

    await supabase.from('dist_withdrawals').update({
      status: 'paid', paid_at: new Date().toISOString(), payment_proof
    }).eq('id', withdrawal_id);

    const { data: dist } = await supabase.from('distributors')
      .select('wallet_balance, total_withdrawn').eq('email', w.distributor_email).single();
    if (dist) {
      await supabase.from('distributors').update({
        wallet_balance: Math.max(0, (dist.wallet_balance || 0) - w.amount),
        total_withdrawn: (dist.total_withdrawn || 0) + w.amount
      }).eq('email', w.distributor_email);
    }
    return res.json({ success: true });
  }

  // ── Add commission (called from webhook) ────────────────────
  if (action === 'add-commission' && req.method === 'POST') {
    const secret = req.headers['x-webhook-secret'];
    if (secret !== process.env.RAZORPAY_WEBHOOK_SECRET)
      return res.status(401).json({ error: 'Unauthorized' });

    const { planId, buyerEmail, paymentId, amount, refCode } = req.body;
    if (!refCode) return res.json({ skipped: 'no ref code' });

    const { data: dist } = await supabase.from('distributors')
      .select('*').eq('ref_code', refCode).single();
    if (!dist || dist.status !== 'approved')
      return res.json({ skipped: 'distributor not found or not approved' });

    const commInfo = COMMISSIONS[planId];
    if (!commInfo) return res.json({ skipped: 'no commission for plan: ' + planId });

    await supabase.from('dist_commissions').insert({
      distributor_id: dist.id,
      distributor_email: dist.email,
      referee_email: buyerEmail,
      tool_name: commInfo.name,
      tool_key: planId,
      sale_amount: amount / 100,
      commission: commInfo.commission,
      payment_id: paymentId,
    });

    await supabase.from('distributors').update({
      wallet_balance: (dist.wallet_balance || 0) + commInfo.commission,
      total_earned:   (dist.total_earned   || 0) + commInfo.commission,
      total_sales:    (dist.total_sales    || 0) + 1,
    }).eq('id', dist.id);

    return res.json({ success: true, commission: commInfo.commission });
  }

  return res.status(404).json({ error: 'Unknown action: ' + action });
}
