// api/claim-demo.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const CF_WORKER = 'https://kiwtech-backend.kiwtech.workers.dev';
const CF_PASSWORD = process.env.CF_ADMIN_PASSWORD;

const RESEARCH_TOOL_ZIP = 'https://github.com/arshittraders/kiwtech999/releases/download/v1.0.3/kiwtech-v5-new.zip';

async function getCFToken() {
  const r = await fetch(CF_WORKER + '/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: CF_PASSWORD })
  });
  const d = await r.json();
  if (!d.success) throw new Error('CF login failed: ' + d.error);
  return d.token;
}

async function createDemoKey(token, gmail) {
  const r = await fetch(CF_WORKER + '/api/admin/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
    body: JSON.stringify({ gmail, plan: 'demo', days: 1, note: 'auto-demo' })
  });
  const d = await r.json();
  if (!d.success) throw new Error('Key create failed: ' + d.error);
  return d.key;
}

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
    if (!CF_PASSWORD) return res.status(500).json({ success: false, error: 'Server config missing. WhatsApp karo.' });

    const token = await getCFToken();
    const key = await createDemoKey(token, gmail);

    await resend.emails.send({
      from: 'Kiwtech <noreply@kiwtech.in>',
      to: gmail,
      subject: '🎁 Tumhari Free Demo Key — Kiwtech Research Tool',
      html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f6ff;font-family:'Segoe UI',Arial,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:28px 16px;">
  <div style="text-align:center;margin-bottom:20px;">
    <div style="font-size:24px;font-weight:900;color:#0d1424;">KIW<span style="background:#fff200;padding:1px 6px;border-radius:4px;">TECH</span></div>
    <div style="font-size:11px;color:#6b7280;margin-top:3px;text-transform:uppercase;letter-spacing:1px;">Meesho Research Tool</div>
  </div>
  <div style="background:#fff;border-radius:14px;overflow:hidden;border:2px solid #e2e5f5;">
    <div style="background:#ff2d78;padding:18px 24px;">
      <div style="font-size:18px;font-weight:900;color:#fff;">🎁 Tumhari Free Demo Key!</div>
      <div style="font-size:12px;color:rgba(255,255,255,.8);margin-top:3px;">Research Tool — 1 din ka full access</div>
    </div>
    <div style="padding:24px;">

      <div style="background:#f4f6ff;border:2px dashed #0d1424;border-radius:10px;padding:18px;text-align:center;margin-bottom:20px;">
        <div style="font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">License Key</div>
        <div style="font-family:'Courier New',monospace;font-size:18px;font-weight:900;color:#0d1424;letter-spacing:2px;">${key}</div>
        <div style="font-size:11px;color:#6b7280;margin-top:5px;">24 ghante valid</div>
      </div>

      <div style="background:#fff200;border-radius:10px;padding:14px;text-align:center;margin-bottom:20px;">
        <a href="${RESEARCH_TOOL_ZIP}" style="display:block;font-size:14px;font-weight:900;color:#000;text-decoration:none;">⬇️ Step 1: Extension ZIP Download Karo</a>
        <div style="font-size:11px;color:rgba(0,0,0,.6);margin-top:4px;">Click karke ZIP file save karo</div>
      </div>

      <div style="margin-bottom:18px;">
        <div style="font-size:13px;font-weight:800;color:#0d1424;margin-bottom:12px;">📋 Install Kaise Karein:</div>
        <div style="font-size:12px;color:#374151;margin-bottom:8px;padding:8px;background:#f9fafb;border-radius:6px;">
          <b>Step 2:</b> ZIP extract karo (Right click → Extract All)
        </div>
        <div style="font-size:12px;color:#374151;margin-bottom:8px;padding:8px;background:#f9fafb;border-radius:6px;">
          <b>Step 3:</b> Chrome mein <code style="background:#e5e7eb;padding:1px 5px;border-radius:3px;">chrome://extensions</code> kholo
        </div>
        <div style="font-size:12px;color:#374151;margin-bottom:8px;padding:8px;background:#f9fafb;border-radius:6px;">
          <b>Step 4:</b> <b>Developer mode</b> ON karo (top right toggle)
        </div>
        <div style="font-size:12px;color:#374151;margin-bottom:8px;padding:8px;background:#f9fafb;border-radius:6px;">
          <b>Step 5:</b> <b>Load unpacked</b> → extracted folder select karo
        </div>
        <div style="font-size:12px;color:#374151;padding:8px;background:#f9fafb;border-radius:6px;">
          <b>Step 6:</b> Gmail <b>${gmail}</b> + upar wali key dalo → Activate!
        </div>
      </div>

      <div style="background:rgba(255,45,120,.07);border:1px solid rgba(255,45,120,.25);border-radius:8px;padding:10px;margin-bottom:18px;font-size:12px;color:#ff2d78;font-weight:600;">
        ⚠️ Key sirf usi device pe chalegi jisme pehli baar use karoge.
      </div>

      <div style="text-align:center;">
        <a href="https://kiwtech.in/tools.html#pricing" style="display:inline-block;padding:12px 28px;background:#0d1424;color:#fff;font-size:13px;font-weight:800;border-radius:9px;text-decoration:none;">Full Plan Lo — ₹499/month →</a>
      </div>
    </div>
  </div>
  <div style="text-align:center;margin-top:16px;font-size:11px;color:#9ca3af;">
    Kiwtech (Arshit Traders) | kiwtech.in | WhatsApp: 8377065737
  </div>
</div>
</body></html>`
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('claim-demo error:', err.message);
    return res.status(500).json({ success: false, error: 'Server error. WhatsApp karo: +91 83770 65737' });
  }
}
