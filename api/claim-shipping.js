// api/claim-shipping.js — Free 10 credits for Shipping Optimizer
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const SUPABASE_URL = process.env.SHIPPING_SUPABASE_URL;
const SUPABASE_KEY = process.env.SHIPPING_SUPABASE_KEY;
const SHIPPING_ZIP = 'https://github.com/arshittraders/kiwtech999/releases/download/v2.7/kiwtech-shipping-optimizer-v2.7.2.zip';

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
    if (!gmail.includes('@')) return res.status(400).json({ success: false, error: 'Valid email daalo.' });

    // Check if already registered
    const checkRes = await fetch(
      `${SUPABASE_URL}/rest/v1/shipping_credits?email=eq.${encodeURIComponent(gmail)}&select=credits`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const existing = await checkRes.json();

    let credits = 10;
    let isNew = true;

    if (existing.length > 0) {
      // Already registered — send current balance
      credits = existing[0].credits;
      isNew = false;
    } else {
      // New user — add 10 free credits
      await fetch(`${SUPABASE_URL}/rest/v1/shipping_credits`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({ email: gmail, credits: 10 })
      });
    }

    // Send email
    await resend.emails.send({
      from: 'Kiwtech <noreply@kiwtech.in>',
      to: gmail,
      subject: isNew ? '🚀 Shipping Optimizer — 10 Free Credits Mil Gaye!' : '🚀 Shipping Optimizer — Tumhara Account',
      html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0d1424;font-family:'Segoe UI',Arial,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:28px 16px;">
  <div style="text-align:center;margin-bottom:20px;">
    <div style="font-size:24px;font-weight:900;color:#fff;">KIW<span style="background:#fff200;color:#000;padding:1px 6px;border-radius:4px;">TECH</span></div>
    <div style="font-size:11px;color:rgba(255,255,255,.5);margin-top:3px;text-transform:uppercase;letter-spacing:1px;">Shipping Optimizer</div>
  </div>

  <div style="background:linear-gradient(135deg,#1a1040,#0d1424);border:2px solid rgba(108,71,255,.4);border-radius:14px;overflow:hidden;">
    <div style="background:#6C47FF;padding:18px 24px;">
      <div style="font-size:18px;font-weight:900;color:#fff;">${isNew ? '🎉 10 Free Credits Mil Gaye!' : '👋 Welcome Back!'}</div>
      <div style="font-size:12px;color:rgba(255,255,255,.8);margin-top:3px;">${isNew ? 'Shipping Optimizer ab free try karo' : 'Tumhara account already registered hai'}</div>
    </div>
    <div style="padding:24px;">

      <div style="background:rgba(57,255,20,.1);border:2px solid rgba(57,255,20,.3);border-radius:10px;padding:18px;text-align:center;margin-bottom:20px;">
        <div style="font-size:10px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Tumhare Credits</div>
        <div style="font-size:42px;font-weight:900;color:#39ff14;">${credits}</div>
        <div style="font-size:12px;color:rgba(255,255,255,.5);margin-top:4px;">1 credit = 1 image optimization</div>
      </div>

      <div style="background:#fff200;border-radius:10px;padding:14px;text-align:center;margin-bottom:16px;">
        <a href="${SHIPPING_ZIP}" style="display:block;font-size:14px;font-weight:900;color:#000;text-decoration:none;">⬇️ Shipping Optimizer Download Karo</a>
        <div style="font-size:11px;color:rgba(0,0,0,.6);margin-top:4px;">ZIP file — Chrome mein load karo</div>
      </div>

      <div style="margin-bottom:18px;">
        <div style="font-size:13px;font-weight:800;color:#fff;margin-bottom:12px;">📋 Install Kaise Karein:</div>
        <div style="font-size:12px;color:rgba(255,255,255,.7);margin-bottom:8px;padding:8px;background:rgba(255,255,255,.05);border-radius:6px;">
          <b style="color:#fff;">Step 1:</b> ZIP download karo → Extract karo
        </div>
        <div style="font-size:12px;color:rgba(255,255,255,.7);margin-bottom:8px;padding:8px;background:rgba(255,255,255,.05);border-radius:6px;">
          <b style="color:#fff;">Step 2:</b> Chrome mein <code style="background:rgba(255,255,255,.1);padding:1px 5px;border-radius:3px;">chrome://extensions</code> kholo
        </div>
        <div style="font-size:12px;color:rgba(255,255,255,.7);margin-bottom:8px;padding:8px;background:rgba(255,255,255,.05);border-radius:6px;">
          <b style="color:#fff;">Step 3:</b> Developer mode ON → Load unpacked → Folder select karo
        </div>
        <div style="font-size:12px;color:rgba(255,255,255,.7);padding:8px;background:rgba(255,255,255,.05);border-radius:6px;">
          <b style="color:#fff;">Step 4:</b> Extension open karo → Gmail <b style="color:#39ff14;">${gmail}</b> se login karo
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">
        <a href="https://rzp.io/rzp/gU2nuEQC" style="display:block;text-align:center;padding:10px;background:rgba(108,71,255,.3);color:#fff;font-size:12px;font-weight:800;border-radius:10px;text-decoration:none;border:1px solid rgba(108,71,255,.5);">50 Credits<br>₹50</a>
        <a href="https://rzp.io/rzp/Ec5hRggu" style="display:block;text-align:center;padding:10px;background:rgba(108,71,255,.3);color:#fff;font-size:12px;font-weight:800;border-radius:10px;text-decoration:none;border:1px solid rgba(108,71,255,.5);">150 Credits<br>₹120</a>
        <a href="https://rzp.io/rzp/nc8MtyNi" style="display:block;text-align:center;padding:10px;background:rgba(255,45,120,.2);color:#fff;font-size:12px;font-weight:800;border-radius:10px;text-decoration:none;border:1px solid rgba(255,45,120,.4);">300 Credits<br>₹220</a>
        <a href="https://rzp.io/rzp/dlYuwTe5" style="display:block;text-align:center;padding:10px;background:rgba(57,255,20,.15);color:#39ff14;font-size:12px;font-weight:800;border-radius:10px;text-decoration:none;border:1px solid rgba(57,255,20,.4);">Unlimited<br>₹299/month</a>
      </div>

      <div style="text-align:center;">
        <div style="font-size:11px;color:rgba(255,255,255,.4);">Credits payment ke baad 1-2 min mein add ho jaate hain</div>
      </div>
    </div>
  </div>

  <div style="text-align:center;margin-top:16px;font-size:11px;color:rgba(255,255,255,.3);">
    Kiwtech (Arshit Traders) | kiwtech.in | WhatsApp: 8377065737
  </div>
</div>
</body></html>`
    });

    return res.status(200).json({ success: true, isNew, credits });

  } catch (err) {
    console.error('claim-shipping error:', err.message);
    return res.status(500).json({ success: false, error: 'Server error. WhatsApp karo: 8377065737' });
  }
}
