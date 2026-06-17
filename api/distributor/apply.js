import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, phone, city, why, upi } = req.body;
  if (!name || !email || !phone) return res.status(400).json({ error: 'Name, email, phone required' });

  // Check if already applied
  const { data: existing } = await supabase
    .from('distributors')
    .select('email, status')
    .eq('email', email.toLowerCase())
    .single();

  if (existing) {
    if (existing.status === 'approved') return res.status(400).json({ error: 'Already an approved distributor!' });
    if (existing.status === 'pending')  return res.status(400).json({ error: 'Application already submitted. Wait for approval.' });
    if (existing.status === 'rejected') return res.status(400).json({ error: 'Application was rejected. WhatsApp pe contact karo.' });
  }

  const { error } = await supabase.from('distributors').insert({
    name, email: email.toLowerCase(), phone, city, why, upi_id: upi, status: 'pending'
  });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
}
