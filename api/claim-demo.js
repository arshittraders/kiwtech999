// api/claim-demo.js — Simple version: CF Worker se key banao + Resend se email
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ success: false, error: 'Email required.' });
    const gmail = email.trim().toLowerCase();
    if (!gmail.endsWith('@gmail.com')) return res.status(400).json({ success: false, error: 'Sirf Gmail accept hoti hai.' });

    const cfToken = process.env.CF_ADMIN_TOKEN;
    if (!cfToken) return res.status(500).json({ success: false, error: 'Server config missing.' });

    // Step 1: Check if already exists in CF KV (via list + search)
    // Simple approach: Try to create — CF worker handles duplicate gmail check nahi karta
    // So hum note mein gmail likhenge, aur create karenge

    // Step 2: Create demo key in Cloudflare Worker
    const cfRes = await fetch('https://kiwtech-backend.kiwtech.workers.dev/api/admin/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': cfToken },
      body: JSON.stringify({ gmail, plan: 'demo', days: 1, note: 'free-demo-auto' })
    });

    const cfData = await cfRes.json();
    if (!cfData.success || !cfData.key) {
      return res.status(500).json({ success: false, error: 'Key generate nahi ho payi. WhatsApp karo: +91 83770 65737' });
    }

    const key = cfData.key;

    // Step 3: Send email via Resend
    await resend.emails.send({
      from: 'Kiwtech <noreply@kiwtech.in>',
      to: gmail,
      subject: 'Tumhari Free Demo Key - Kiwtech Meesho Tool',
      html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f6ff;font-family:'Segoe UI',Arial,sans-serif;">
<div style="max-width:500px;margin:0 auto;padding:28px 16px;">
  <div style="text-align:center;margin-bottom:20px;">
    <div style="font-size:24px;font-weight:900;color:#0d1424;">KIW<span style="background:#fff200;padding:1px 6px;border-radius:4px;">TECH</span></div>
    <div style="font-size:11px;color:#6b7280;margin-top:3px;text-transform:uppercase;letter-spacing:1px;">Meesho Seller Tool</div>
  </div>
  <div style="background:#fff;border-radius:14px;overflow:hidden;border:2px solid #e2e5f5;">
    <div style="background:#fff200;padding:18px 24px;">
      <div style="font-size:18px;font-weight:900;color:#000;">Tumhari Free Demo Key!</div>
      <div style="font-size:12px;color:rgba(0,0,0,.6);margin-top:3px;">1 din ka full access</div>
    </div>
    <div style="padding:24px;">
      <div style="background:#f4f6ff;border:2px dashed #0d1424;border-radius:10px;padding:18px;text-align:center;margin-bottom:18px;">
        <div style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">License Key</div>
        <div style="font-family:'Courier New',monospace;font-size:18px;font-weight:900;color:#0d1424;letter-spacing:2px;">${key}</div>
        <div style="font-size:11px;color:#6b7280;margin-top:5px;">24 ghante valid</div>
      </div>
      <div style="margin-bottom:18px;">
        <div style="font-size:13px;font-weight:700;color:#0d1424;margin-bottom:10px;">Kaise Use Karein:</div>
        <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">1. kiwtech.in/tool.html pe extension download karo</div>
        <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">2. Chrome mein load karo, Gmail <strong>${gmail}</strong> + upar wali key dalo</div>
        <div style="font-size:12px;color:#6b7280;">3. Meesho seller panel pe jaao aur AI listing generate karo!</div>
      </div>
      <div style="background:rgba(255,45,120,.07);border:1px solid rgba(255,45,120,.25);border-radius:8px;padding:10px;margin-bottom:18px;font-size:12px;color:#ff2d78;font-weight:600;">
        Key sirf usi device pe chalegi jisme pehli baar use karoge.
      </div>
      <div style="text-align:center;">
        <a href="https://kiwtech.in/tool.html#pricing" style="display:inline-block;padding:11px 24px;background:#0d1424;color:#fff;font-size:13px;font-weight:800;border-radius:9px;text-decoration:none;">Monthly Plan - Rs 999</a>
      </div>
    </div>
  </div>
  <div style="text-align:center;margin-top:16px;font-size:11px;color:#9ca3af;">Kiwtech (Arshit Traders) | kiwtech.in</div>
</div>
</body></html>`
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('claim-demo error:', err);
    return res.status(500).json({ success: false, error: 'Server error. WhatsApp karo: +91 83770 65737' });
  }
}
