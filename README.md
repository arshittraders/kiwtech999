# Kiwtech API — Backend Server

## Quick Setup (30 minutes mein ready)

### Step 1: Supabase Database (FREE)
1. supabase.com → Sign Up → New Project
2. SQL Editor → SUPABASE_SCHEMA.sql ka content paste karo → Run
3. Settings → API → copy:
   - Project URL → SUPABASE_URL
   - service_role key → SUPABASE_SERVICE_KEY

### Step 2: Resend Email (FREE - 3000 emails/month)
1. resend.com → Sign Up
2. API Keys → Create → copy RESEND_API_KEY
3. Domains → Add aapka domain (kiwtech.in) → DNS records add karo

### Step 3: Razorpay
1. dashboard.razorpay.com → Settings → API Keys → Generate Key
   - Key ID → RAZORPAY_KEY_ID
   - Key Secret → RAZORPAY_SECRET
2. Settings → Webhooks → Add Webhook:
   - URL: https://kiwtech-api.vercel.app/api/payment/webhook
   - Events: payment.captured
   - Secret → RAZORPAY_WEBHOOK_SECRET

### Step 4: Deploy to Vercel (FREE)
```bash
# Vercel CLI install
npm install -g vercel

# Deploy
cd kiwtech-api
vercel

# Environment variables set karo:
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_KEY
vercel env add RAZORPAY_KEY_ID
vercel env add RAZORPAY_SECRET
vercel env add RAZORPAY_WEBHOOK_SECRET
vercel env add RESEND_API_KEY
vercel env add GROQ_KEY
vercel env add ADMIN_PASS

# Redeploy with env vars
vercel --prod
```

### API Endpoints:
| Method | URL | Use |
|--------|-----|-----|
| POST | /api/payment/create-order | Razorpay order banao |
| POST | /api/payment/webhook | Payment success handle |
| POST | /api/license/validate | Extension license check |
| POST | /api/listing/generate | AI listing generate |
| POST | /api/keywords/process | Keywords process |
| POST | /api/admin/genkey | License key generate |
| POST | /api/admin/listkeys | All keys list |
| POST | /api/admin/deletekey | Key delete |

### Environment Variables:
Copy `.env.example` to `.env` aur fill karo (local testing ke liye)
Vercel pe `vercel env add` se set karo

## Support: WhatsApp karo
