const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendLicenseEmail({ email, name, key, plan, expiry }) {
  const downloadUrl = process.env.DOWNLOAD_URL || "https://github.com/YOUR_USERNAME/kiwtech-extension/releases/latest";
  const wa = process.env.WHATSAPP || "91XXXXXXXXXX";
  const planLabel = { monthly: "Monthly (30 days)", yearly: "Yearly (365 days)", lifetime: "Lifetime (No Expiry)" }[plan] || plan;

  await resend.emails.send({
    from: "Kiwtech <noreply@kiwtech.in>",
    to: email,
    subject: "Kiwtech Meesho Research Tool — Your License Key",
    html: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f5f5f5">
<div style="background:linear-gradient(135deg,#0066cc,#004499);padding:25px;border-radius:12px 12px 0 0;text-align:center">
  <h1 style="color:#fff;margin:0;font-size:24px">Kiwtech Meesho Research Tool</h1>
  <p style="color:#cce0ff;margin:6px 0;font-size:14px">by Kiwtech Solutions, Noida</p>
</div>
<div style="background:#fff;padding:30px;border-radius:0 0 12px 12px;box-shadow:0 4px 16px rgba(0,0,0,.1)">
  <p style="font-size:16px">Hi <b>${name}</b>,</p>
  <p style="color:#374151">Thank you for purchasing! Aapka license key neeche hai:</p>
  <div style="background:#f0f7ff;border:2px dashed #0066cc;border-radius:12px;padding:25px;text-align:center;margin:20px 0">
    <p style="margin:0;font-size:11px;color:#5577aa;text-transform:uppercase;letter-spacing:1px">YOUR LICENSE KEY</p>
    <p style="margin:12px 0;font-family:monospace;font-size:26px;font-weight:900;color:#0066cc;letter-spacing:3px">${key}</p>
    <p style="margin:0;font-size:13px;color:#5577aa">Plan: <b>${planLabel}</b>${expiry ? ` | Expires: <b>${expiry}</b>` : ""}</p>
  </div>
  <h3 style="color:#0066cc">Extension Install Kaise Karein:</h3>
  <ol style="color:#374151;line-height:2;font-size:14px">
    <li><a href="${downloadUrl}" style="color:#0066cc;font-weight:700">Yahan se ZIP download karein</a></li>
    <li>ZIP extract karo ek folder mein</li>
    <li>Chrome mein <code style="background:#f0f0f0;padding:2px 6px;border-radius:4px">chrome://extensions</code> kholo</li>
    <li><b>Developer mode</b> toggle ON karo (top right)</li>
    <li><b>Load unpacked</b> click karo → extracted folder select karo</li>
    <li>Meesho.com pe jao → Extension icon click karo</li>
    <li>License Key enter karo → <b>Activate</b> click karo</li>
  </ol>
  <div style="background:#fff3cd;border-left:4px solid #f59e0b;border-radius:8px;padding:15px;margin:20px 0">
    <b>Important:</b> Yeh key sirf aapke device ke liye hai. Share karne par key deactivate ho sakti hai.
  </div>
  <div style="background:#ecfdf5;border-radius:10px;padding:15px;text-align:center;margin:20px 0">
    <p style="margin:0;font-size:14px;color:#065f46">Support chahiye?</p>
    <p style="margin:8px 0 0;font-size:16px"><a href="https://wa.me/${wa}" style="color:#25d366;font-weight:700;text-decoration:none">WhatsApp Support</a></p>
  </div>
  <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:25px">Kiwtech Solutions, Noida | kiwtech.in<br>Ye email automatically generate hui hai. Reply na karein.</p>
</div></body></html>`
  });
}
module.exports = { sendLicenseEmail };
