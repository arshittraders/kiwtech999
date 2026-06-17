import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const ADMIN_KEY = process.env.ADMIN_KEY || 'kiwtech@admin2026';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (req.headers['x-admin-key'] !== ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });

  const { withdrawal_id, payment_proof } = req.body;
  if (!withdrawal_id || !payment_proof) return res.status(400).json({ error: 'withdrawal_id and payment_proof required' });

  // Get withdrawal
  const { data: w } = await supabase.from('dist_withdrawals').select('*').eq('id', withdrawal_id).single();
  if (!w) return res.status(404).json({ error: 'Withdrawal not found' });

  // Mark paid
  await supabase.from('dist_withdrawals').update({
    status: 'paid', paid_at: new Date().toISOString(), payment_proof
  }).eq('id', withdrawal_id);

  // Deduct from distributor wallet
  const { data: dist } = await supabase.from('distributors')
    .select('wallet_balance, total_withdrawn').eq('email', w.distributor_email).single();
  
  if (dist) {
    await supabase.from('distributors').update({
      wallet_balance: Math.max(0, dist.wallet_balance - w.amount),
      total_withdrawn: (dist.total_withdrawn || 0) + w.amount
    }).eq('email', w.distributor_email);
  }

  return res.json({ success: true });
}
