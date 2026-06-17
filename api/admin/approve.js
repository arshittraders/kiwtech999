import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const ADMIN_KEY = process.env.ADMIN_KEY || 'kiwtech@admin2026';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (req.headers['x-admin-key'] !== ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });

  const { email, action } = req.body;
  if (!email || !action) return res.status(400).json({ error: 'Email and action required' });

  const updates = { status: action === 'approve' ? 'approved' : 'rejected' };
  if (action === 'approve') updates.approved_at = new Date().toISOString();

  const { error } = await supabase.from('distributors').update(updates).eq('email', email.toLowerCase());
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
}
