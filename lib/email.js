<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Kiwtech Meesho Research Tool — India Ka #1 Seller Tool</title>
<meta name="description" content="AI Listing + Keyword Research + Rank Checker + Auto-Fill. Meesho sellers ke liye.">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:"Segoe UI",Arial,sans-serif;background:#f0f4ff;color:#1a2c44}
.hero{background:linear-gradient(135deg,#0066cc 0%,#003d99 100%);color:#fff;padding:70px 20px 60px;text-align:center}
.hero-badge{background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.3);border-radius:20px;padding:6px 16px;font-size:13px;font-weight:600;display:inline-block;margin-bottom:18px}
.hero h1{font-size:clamp(26px,5vw,42px);font-weight:900;margin-bottom:12px;line-height:1.2}
.hero h1 span{color:#66b3ff}
.hero p{font-size:clamp(14px,2.5vw,18px);opacity:.85;max-width:600px;margin:0 auto 28px;line-height:1.6}
.hero-sub{font-size:13px;opacity:.65;margin-top:8px}
.stars{color:#fbbf24;font-size:20px;margin-bottom:5px}
.section{max-width:960px;margin:0 auto;padding:50px 20px}
.section-title{text-align:center;font-size:clamp(20px,3vw,28px);font-weight:800;margin-bottom:8px}
.section-sub{text-align:center;color:#5577aa;font-size:14px;margin-bottom:35px}
.feat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px}
.feat{background:#fff;border-radius:12px;padding:22px;border:1px solid #dde4f0;box-shadow:0 2px 8px rgba(0,0,0,.05);transition:.2s}
.feat:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,102,204,.12)}
.feat-icon{font-size:28px;margin-bottom:10px}
.feat h3{font-size:15px;font-weight:700;color:#0066cc;margin-bottom:6px}
.feat p{font-size:13px;color:#5577aa;line-height:1.6}
.pricing-section{background:linear-gradient(135deg,#f0f7ff,#e8f0ff);padding:50px 20px}
.pricing-inner{max-width:700px;margin:0 auto}
.plan-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin:30px 0}
.plan{background:#fff;border:2px solid #dde4f0;border-radius:14px;padding:24px;text-align:center;cursor:pointer;transition:.2s;position:relative}
.plan:hover{border-color:#0066cc;transform:translateY(-2px)}
.plan.selected{border-color:#0066cc;background:#f0f7ff;box-shadow:0 4px 16px rgba(0,102,204,.15)}
.plan.popular::before{content:"BEST VALUE";position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:#0066cc;color:#fff;font-size:10px;font-weight:800;padding:3px 12px;border-radius:10px;letter-spacing:1px}
.plan-name{font-size:12px;color:#5577aa;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px}
.plan-price{font-size:32px;font-weight:900;color:#0066cc}
.plan-price sup{font-size:16px;font-weight:600;vertical-align:super}
.plan-price .gst{font-size:14px;font-weight:600;color:#5577aa}
.plan-period{font-size:13px;color:#5577aa;margin-top:4px}
.plan-save{font-size:11px;color:#0a8f4f;font-weight:700;background:#ecfdf5;border-radius:6px;padding:2px 8px;display:inline-block;margin-top:6px}
.form-card{background:#fff;border-radius:14px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,.08)}
.form-card h3{font-size:18px;font-weight:700;margin-bottom:18px;text-align:center}
.form-card input,.form-card select{width:100%;border:1.5px solid #dde4f0;border-radius:9px;padding:12px 14px;font-size:14px;outline:none;margin-bottom:12px;color:#1a2c44;background:#fff;transition:.2s}
.form-card input:focus,.form-card select:focus{border-color:#0066cc;box-shadow:0 0 0 3px rgba(0,102,204,.1)}
.buy-btn{width:100%;padding:15px;background:linear-gradient(135deg,#0066cc,#004499);color:#fff;border:none;border-radius:10px;font-size:16px;font-weight:800;cursor:pointer;transition:.2s;letter-spacing:.5px}
.buy-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,102,204,.35)}
.trust-row{display:flex;justify-content:center;gap:20px;flex-wrap:wrap;margin-top:14px}
.trust-item{font-size:12px;color:#5577aa;display:flex;align-items:center;gap:4px}
.how-steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
.step{text-align:center;padding:20px}
.step-num{width:40px;height:40px;background:#0066cc;color:#fff;border-radius:50%;font-size:18px;font-weight:800;display:flex;align-items:center;justify-content:center;margin:0 auto 12px}
.step h4{font-size:14px;font-weight:700;margin-bottom:6px}
.step p{font-size:13px;color:#5577aa}
.testi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}
.testi{background:#fff;border-radius:10px;padding:18px;border:1px solid #dde4f0;box-shadow:0 2px 8px rgba(0,0,0,.04)}
.testi p{font-size:13px;color:#374151;line-height:1.6;margin-bottom:10px}
.testi-meta{display:flex;align-items:center;gap:8px}
.testi-avatar{width:34px;height:34px;background:linear-gradient(135deg,#0066cc,#003d99);border-radius:50%;color:#fff;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center}
.testi-name{font-size:12px;font-weight:600;color:#374151}
.testi-loc{font-size:11px;color:#9ca3af}
.faq{max-width:700px;margin:0 auto}
.faq-item{background:#fff;border-radius:10px;margin-bottom:10px;border:1px solid #dde4f0;overflow:hidden}
.faq-q{padding:16px 20px;font-weight:600;font-size:14px;cursor:pointer;display:flex;justify-content:space-between;align-items:center}
.faq-a{padding:0 20px 16px;font-size:13px;color:#5577aa;line-height:1.6;display:none}
.faq-item.open .faq-a{display:block}
.cta-section{background:linear-gradient(135deg,#0066cc,#003d99);color:#fff;text-align:center;padding:50px 20px}
.cta-section h2{font-size:clamp(22px,4vw,32px);font-weight:800;margin-bottom:12px}
.cta-section p{font-size:16px;opacity:.85;margin-bottom:25px}
.cta-btn{background:#fff;color:#0066cc;border:none;border-radius:10px;padding:14px 35px;font-size:16px;font-weight:800;cursor:pointer;display:inline-block;text-decoration:none;transition:.2s}
.cta-btn:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(0,0,0,.2)}
footer{background:#1a2c44;color:#6b7a9a;text-align:center;padding:25px 20px;font-size:13px}
footer a{color:#6b7a9a;text-decoration:none}
footer a:hover{color:#fff}
.footer-links{display:flex;justify-content:center;gap:20px;flex-wrap:wrap;margin-bottom:10px}
</style>
</head>
<body>

<div class="hero">
  <div class="hero-badge">🇮🇳 India Ka #1 Meesho Seller Tool</div>
  <h1>Kiwtech <span>Meesho</span> Research Tool</h1>
  <p>AI Listing Generator + Keyword Research + Rank Checker + Auto-Fill.<br>Ek Chrome Extension mein sab kuch — seconds mein!</p>
  <div class="stars">★★★★★</div>
  <div class="hero-sub">500+ Active Sellers | India</div>
</div>

<div class="section">
  <div class="section-title">Kya Milega Aapko?</div>
  <div class="section-sub">6 powerful features, ek hi extension mein</div>
  <div class="feat-grid">
    <div class="feat"><div class="feat-icon">🤖</div><h3>AI Listing Generator</h3><p>Product naam se seconds mein SEO-optimized Hinglish title + description. Groq AI powered!</p></div>
    <div class="feat"><div class="feat-icon">🔍</div><h3>Keyword Research</h3><p>Meesho.com se real trending keywords nikalo. Competitor analysis + frequency ranking.</p></div>
    <div class="feat"><div class="feat-icon">📊</div><h3>Rank Checker</h3><p>Apna product rank pata karo. Keyword se exact page + position — real time check.</p></div>
    <div class="feat"><div class="feat-icon">⚡</div><h3>Smart Auto-Fill</h3><p>Seller panel mein GST, HSN, price, inventory, description — sab ek click mein fill!</p></div>
    <div class="feat"><div class="feat-icon">📈</div><h3>Growth Tracker</h3><p>Daily orders estimate karo ratings delta se. Competitor growth track karo.</p></div>
    <div class="feat"><div class="feat-icon">🚚</div><h3>Shipping Optimizer</h3><p>Image variation se shipping cost kam karo. Profit margin badhao automatically.</p></div>
  </div>
</div>

<div style="background:#fff;padding:50px 20px">
  <div class="section-title">Kaise Kaam Karta Hai?</div>
  <div class="section-sub">3 steps — 5 minutes setup</div>
  <div style="max-width:800px;margin:0 auto">
  <div class="how-steps">
    <div class="step"><div class="step-num">1</div><h4>Payment Karo</h4><p>Razorpay se secure payment. Sabhi cards, UPI, wallets accept hote hain.</p></div>
    <div class="step"><div class="step-num">2</div><h4>Email Check Karo</h4><p>License key aur download link turant email pe aayega. Spam folder bhi check karo.</p></div>
    <div class="step"><div class="step-num">3</div><h4>Install Karo</h4><p>ZIP download karo → Chrome mein load karo → License key enter karo → Done!</p></div>
  </div>
  </div>
</div>

<div class="pricing-section">
  <div class="pricing-inner">
    <div class="section-title">Simple Pricing</div>
    <div class="section-sub">GST-inclusive. Pehle ₹49 mein 1 din try karo, phir monthly lo.</div>
    <div class="plan-grid">
      <div class="plan" id="plan-demo" onclick="selectPlan('demo')">
        <div class="plan-name">Demo Trial</div>
        <div class="plan-price"><sup>₹</sup>49<span class="gst"> +GST</span></div>
        <div class="plan-period">1 day access · Total ₹57.82</div>
        <div class="plan-save">TRY FIRST</div>
      </div>
      <div class="plan popular selected" id="plan-monthly" onclick="selectPlan('monthly')">
        <div class="plan-name">Monthly</div>
        <div class="plan-price"><sup>₹</sup>999<span class="gst"> +GST</span></div>
        <div class="plan-period">30 days access · Total ₹1178.82</div>
        <div class="plan-save">FULL ACCESS</div>
      </div>
    </div>

    <div class="form-card">
      <h3>Aaj Hi Shuru Karein 🚀</h3>
      <input type="text" id="buyerName" placeholder="Aapka naam">
      <input type="email" id="buyerEmail" placeholder="Email address (license yahan aayegi)">
      <select id="buyerState">
        <option value="">-- Apna State chuno (GST invoice ke liye) --</option>
        <option value="07">Delhi</option>
        <option value="09">Uttar Pradesh</option>
        <option value="06">Haryana</option>
        <option value="08">Rajasthan</option>
        <option value="03">Punjab</option>
        <option value="05">Uttarakhand</option>
        <option value="02">Himachal Pradesh</option>
        <option value="01">Jammu & Kashmir</option>
        <option value="04">Chandigarh</option>
        <option value="10">Bihar</option>
        <option value="20">Jharkhand</option>
        <option value="19">West Bengal</option>
        <option value="21">Odisha</option>
        <option value="22">Chhattisgarh</option>
        <option value="23">Madhya Pradesh</option>
        <option value="24">Gujarat</option>
        <option value="27">Maharashtra</option>
        <option value="30">Goa</option>
        <option value="29">Karnataka</option>
        <option value="32">Kerala</option>
        <option value="33">Tamil Nadu</option>
        <option value="36">Telangana</option>
        <option value="37">Andhra Pradesh</option>
        <option value="34">Puducherry</option>
        <option value="18">Assam</option>
        <option value="16">Tripura</option>
        <option value="17">Meghalaya</option>
        <option value="11">Sikkim</option>
        <option value="12">Arunachal Pradesh</option>
        <option value="13">Nagaland</option>
        <option value="14">Manipur</option>
        <option value="15">Mizoram</option>
        <option value="26">Dadra & Nagar Haveli & Daman & Diu</option>
        <option value="31">Lakshadweep</option>
        <option value="35">Andaman & Nicobar</option>
        <option value="38">Ladakh</option>
      </select>
      <button class="buy-btn" onclick="startPayment()">🔒 Secure Payment — Razorpay</button>
      <div class="trust-row">
        <span class="trust-item">✅ Instant Delivery</span>
        <span class="trust-item">🔒 SSL Secured</span>
        <span class="trust-item">📧 Email pe License</span>
        <span class="trust-item">💬 WhatsApp Support</span>
      </div>
    </div>
  </div>
</div>

<div class="section">
  <div class="section-title">Sellers Kya Kehte Hain</div>
  <div class="section-sub">Real customers, real results</div>
  <div class="testi-grid">
    <div class="testi"><p>"AI listing se mera listing time 30 min se 2 min ho gaya! Ab ek din mein 50 products list kar leta hoon."</p><div class="testi-meta"><div class="testi-avatar">R</div><div><div class="testi-name">Rahul Sharma</div><div class="testi-loc">Surat, Gujarat ★★★★★</div></div></div></div>
    <div class="testi"><p>"Rank checker bahut helpful hai. Pata chala mera product page 3 par tha, keyword optimize kiya ab page 1 pe hai!"</p><div class="testi-meta"><div class="testi-avatar">P</div><div><div class="testi-name">Priya Mehta</div><div class="testi-loc">Jaipur, Rajasthan ★★★★★</div></div></div></div>
    <div class="testi"><p>"Auto-fill feature se bahut time bachta hai. GST, HSN sab auto fill — koi mistake nahi hoti."</p><div class="testi-meta"><div class="testi-avatar">A</div><div><div class="testi-name">Amit Kumar</div><div class="testi-loc">Delhi ★★★★★</div></div></div></div>
  </div>
</div>

<div style="background:#fff;padding:50px 20px">
  <div class="section-title">Frequently Asked Questions</div>
  <div class="section-sub" style="margin-bottom:30px">Koi doubt? Yahan dekho</div>
  <div class="faq">
    <div class="faq-item open"><div class="faq-q" onclick="toggleFaq(this)">License key kab milegi? <span>▼</span></div><div class="faq-a">Payment successful hone ke 2-3 minutes mein aapki email pe license key aur download link aayega. Spam folder zaroor check karo.</div></div>
    <div class="faq-item"><div class="faq-q" onclick="toggleFaq(this)">Demo trial kya hai? <span>▼</span></div><div class="faq-a">₹49 (+GST) mein 1 din ka full access. Tool try karo, pasand aaye to Monthly plan le lo. Demo ki key 1 din baad expire ho jayegi.</div></div>
    <div class="faq-item"><div class="faq-q" onclick="toggleFaq(this)">Kitne devices pe use kar sakte hain? <span>▼</span></div><div class="faq-a">Ek license key sirf ek device pe use ho sakti hai. Dusra device chahiye to WhatsApp pe contact karo.</div></div>
    <div class="faq-item"><div class="faq-q" onclick="toggleFaq(this)">Kya Chrome ke alawa browser mein kaam karta hai? <span>▼</span></div><div class="faq-a">Abhi sirf Chrome support hai. Brave bhi kaam karta hai kyunki woh Chromium based hai.</div></div>
    <div class="faq-item"><div class="faq-q" onclick="toggleFaq(this)">Support kaise milega? <span>▼</span></div><div class="faq-a">WhatsApp pe message karo — 24 ghante mein response milega.</div></div>
  </div>
</div>

<div class="cta-section">
  <h2>Aaj Hi Apna Time Bachao!</h2>
  <p>500+ Meesho sellers already use kar rahe hain. Tumhari baari hai.</p>
  <a href="#" class="cta-btn" onclick="document.getElementById('buyerName').focus();document.querySelector('.pricing-section').scrollIntoView({behavior:'smooth'});return false;">Abhi Purchase Karo →</a>
</div>

<footer>
  <div class="footer-links">
    <a href="#">Privacy Policy</a>
    <a href="#">Refund Policy</a>
    <a href="#">Terms of Service</a>
    <a href="https://wa.me/918377065737">WhatsApp Support</a>
  </div>
  <p>© 2026 Kiwtech (Arshit Traders) | kiwtech.in | All rights reserved</p>
  <p style="margin-top:6px;font-size:11px;opacity:.6">GSTIN: 07BUDPS8342F1ZF (Delhi) | Registered in India</p>
</footer>

<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script>
const API = 'https://kiwtech999.vercel.app';
let selectedPlan = 'monthly';

function selectPlan(plan) {
  document.querySelectorAll('.plan').forEach(p => p.classList.remove('selected'));
  document.getElementById('plan-' + plan).classList.add('selected');
  selectedPlan = plan;
}

async function startPayment() {
  const name = document.getElementById('buyerName').value.trim();
  const email = document.getElementById('buyerEmail').value.trim();
  const state = document.getElementById('buyerState').value;
  if (!name) { alert('Naam daalo please'); return; }
  if (!email || !email.includes('@')) { alert('Sahi email daalo'); return; }
  if (!state) { alert('Apna State chuno (GST invoice ke liye zaroori hai)'); return; }

  const btn = document.querySelector('.buy-btn');
  btn.disabled = true;
  btn.textContent = 'Loading...';

  try {
    const r = await fetch(API + '/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: selectedPlan, email, name, state })
    }).then(r => r.json());

    if (!r.orderId) throw new Error(r.error || 'Order create failed');

    const options = {
      key: r.keyId,
      amount: r.amount,
      currency: 'INR',
      order_id: r.orderId,
      name: 'Kiwtech Meesho Research Tool',
      description: (selectedPlan === 'demo' ? 'Demo Trial (1 Day)' : 'Monthly Plan (30 Days)'),
      image: 'https://kiwtech.in/logo.png',
      prefill: { name, email },
      theme: { color: '#0066cc' },
      modal: { ondismiss: function() { btn.disabled = false; btn.textContent = '🔒 Secure Payment — Razorpay'; }},
      handler: function(response) {
        btn.disabled = false;
        btn.textContent = '🔒 Secure Payment — Razorpay';
        alert('Payment successful!\n\nLicense key aapki email pe bhej di gayi hai: ' + email + '\n\nSpam folder bhi check karein.');
        document.getElementById('buyerName').value = '';
        document.getElementById('buyerEmail').value = '';
        document.getElementById('buyerState').value = '';
      }
    };
    new Razorpay(options).open();
  } catch(e) {
    btn.disabled = false;
    btn.textContent = '🔒 Secure Payment — Razorpay';
    alert('Error: ' + e.message);
  }
}

function toggleFaq(el) {
  const item = el.parentElement;
  item.classList.toggle('open');
  el.querySelector('span').textContent = item.classList.contains('open') ? '▲' : '▼';
}
</script>
</body>
</html>
