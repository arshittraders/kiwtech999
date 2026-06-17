import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const ADMIN_KEY = process.env.ADMIN_KEY || 'kiwtech@admin2026';

export default async function handler(req, res) {
  if (req.headers['x-admin-key'] !== ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });

  const { data, error } = await supabase.from('dist_withdrawals').select('*')
    .order('requested_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ withdrawals: data });
}
