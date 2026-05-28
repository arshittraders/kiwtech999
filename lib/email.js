const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

const SELLER = {
  name: "Arshit Traders",
  gstin: "07BUDPS8342F1ZF", // <-- apna actual Delhi GSTIN daalo
  stateCode: "07"           // Delhi
};

function gstBreakdown(amountPaise, buyerStateCode) {
  const total = amountPaise / 100;
  const base = Math.round((total / 1.18) * 100) / 100;
  const gst = Math.round((total - base) * 100) / 100;
  const intra = String(buyerStateCode) === SELLER.stateCode; // Delhi buyer = intra-state
  return {
    base: base.toFixed(2),
    gst: gst.toFixed(2),
    total: total.toFixed(2),
    cgst: intra ? (gst / 2).toFixed(2) : null,
    sgst: intra ? (gst / 2).toFixed(2) : null,
    igst: intra ? null : gst.toFixed(2),
    intra
  };
}

async function sendLicenseEmail({ email, name, key, plan, expiry, amount, state }) {
  const downloadUrl = process.env.DOWNLOAD_URL || "https://github.com/YOUR_USERNAME/kiwtech-extension/releases/latest";
  const wa = process.env.WHATSAPP || "918377065737";
  const planLabel = { demo: "Demo Trial (1 Day)", monthly: "Monthly (30 Days)" }[plan] || plan;

  let gstRows = "";
  if (amount) {
    const g = gstBreakdown(amount, state);
    const taxRows = g.intra
      ? `<tr><td style="padding:4px 0;color:#5577aa">CGST (9%)</td><td style="text-align:right">₹${g.cgst}</td></tr>
         <tr><td style="padding:4px 0;color:#5577aa">SGST (9%)</td><td style="text-align:right">₹${g.sgst}</td></tr>`
      : `<tr><td style="padding:4px 0;color:#5577aa">IGST (18%)</td><td style="text-align:right">₹${g.igst}</td></tr>`;
    gstRows = `
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:18px;margin:20px 0">
      <p style="margin:0 0 10px;font-size:12px;color:#5577aa;text-transform:uppercase;letter-spacing:1px;font-weight:700">Tax Invoice</p>
      <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse">
        <tr><td style="padding:4px 0">Base Amount</td><td style="text-align:right">₹${g.base}</td></tr>
        ${taxRows}
        <tr><td style="padding:8px 0 0;font-weight:800;border-top:1px solid #e5e7eb">Total Paid</td><td style="text-align:right;font-weight:800;border-top:1px solid #e5e7eb;padding-top:8px">₹${g.total}</td></tr>
      </table>
      <p style="margin:12px 0 0;font-size:11px;color:#9ca3af">Seller: ${SELLER.name} · GSTIN: ${SELLER.gstin}</p>
    </div>`;
  }

  await resend.emails.send({
    from: "Kiwtech <noreply@kiwtech.in>",
    to: email,
    subject: "Kiwtech Meesho Research Tool — Your License Key",
    html: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f5f5f5">
<div style="background:linear-gradient(135deg,#0066cc,#004499);padding:25px;border-radius:12px 12px 0 0;text-align:center">
  <h1 style="color:#fff;margin:0;font-size:24px">Kiwtech Meesho Research Tool</h1>
  <p style="color:#cce0ff;margin:6px 0;font-size:14px">by Kiwtech (Arshit Traders)</p>
</div>
<div style="background:#fff;padding:30px;border-radius:0 0 12px 12px;box-shadow:0 4px 16px rgba(0,0,0,.1)">
  <p style="font-size:16px">Hi <b>${name}</b>,</p>
  <p style="color:#374151">Thank you for purchasing! Aapka license key neeche hai:</p>
  <div style="background:#f0f7ff;border:2px dashed #0066cc;border-radius:12px;padding:25px;text-align:center;margin:20px 0">
    <p style="margin:0;font-size:11px;color:#5577aa;text-transform:uppercase;letter-spacing:1px">YOUR LICENSE KEY</p>
    <p style="margin:12px 0;font-family:monospace;font-size:26px;font-weight:900;color:#0066cc;letter-spacing:3px">${key}</p>
    <p style="margin:0;font-size:13px;color:#5577aa">Plan: <b>${planLabel}</b>${expiry ? ` | Expires: <b>${expiry}</b>` : ""}</p>
  </div>
  ${gstRows}
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
  <p style="color:#9ca3af;font-size:12px;text-align:center;margin-top:25px">Kiwtech (Arshit Traders) | kiwtech.in<br>Ye email automatically generate hui hai. Reply na karein.</p>
</div></body></html>`
  });
}

module.exports = { sendLicenseEmail };
