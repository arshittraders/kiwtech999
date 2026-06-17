import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const { data: dist, error } = await supabase
    .from('distributors').select('*').eq('email', email.toLowerCase()).single();

  if (error || !dist) return res.status(404).json({ error: 'Distributor not found' });
  if (dist.status === 'pending') return res.json({ distributor: { status: 'pending', ref_code: null }, wallet_balance: 0, total_earned: 0, total_sales: 0, total_withdrawn: 0, commissions: [], withdrawals: [] });

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
