# KrishiRent & AgroMart (कृषि-रेंट आणि अ‍ॅग्रोमार्ट) 🌾🚜

**KrishiRent & AgroMart** is a production-oriented, responsive full-stack Indian agricultural marketplace web application designed for farmers, machinery owners, and agro-retailers.

Farmers can:
- **Rent Agricultural Machinery**: Tractors (Mahindra, Sonalika, John Deere), rotavators, combine harvesters, seed drills, threshers, and sprayers with flexible hourly, daily, or per-acre rates and **automated overlapping collision prevention**.
- **Buy New & Used Farm Equipment**: Certified used tractors, power tillers, and implements.
- **Purchase Certified Agricultural Supplies**: Fertilizers (IFFCO DAP, Urea, organic compost), certified seeds (soybean, cotton, wheat), and CIB-registered crop protection insecticides with statutory toxicity warning labels.
- **Pay Online via UPI**: Seamless checkout via official Razorpay UPI supporting **Google Pay, PhonePe, Paytm, BHIM UPI, and UPI QR**, backed by server-side HMAC-SHA256 signature verification and webhook idempotency.
- **Switch Languages**: Full bilingual toggle between **English** and **Marathi (मराठी)**.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + React Router v6.
- **Backend**: Node.js + Express + TypeScript + Prisma ORM + Helmet + Rate Limiter.
- **Database**: SQLite (default zero-friction embedded dev database) / PostgreSQL ready via Prisma.
- **Authentication**: Strict server-side cryptographic 6-digit **Email OTP authentication** with 5-minute expiry, single-use SHA-256 hash checking, 45-second cooldown, and abuse attempt throttling.
- **Payment Gateway**: Official Razorpay SDK integration supporting Indian UPI apps (Google Pay, PhonePe, Paytm), server-side signature validation (`crypto.createHmac('sha256')`), and raw-body webhook verification.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+ or v20+)
- npm

### 2. Backend Setup (`/server`)
```bash
cd server
npm install

# Initialize Database & Run Seed
npx prisma db push
npm run seed

# Run Automated Test Suite (7 tests for OTP, collisions & pricing)
npm test

# Start the Backend Server
npm run dev
```
*Backend runs on: `http://localhost:5000`*

### 3. Frontend Setup (`/client`)
```bash
cd ../client
npm install
npm run dev
```
*Frontend runs on: `http://localhost:5173`*

---

## 🔐 Credentials & Environment Variables

Create `.env` inside `/server` (copy from `.env.example`):
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173

# Razorpay UPI Gateway Credentials
RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
RAZORPAY_KEY_SECRET=rzp_test_secret_placeholder
RAZORPAY_WEBHOOK_SECRET=razorpay_webhook_secret_krishi_2026

# SMTP / Resend Credentials (Optional)
# If left empty in development, OTPs and receipts are safely logged to your server terminal!
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
FROM_EMAIL="KrishiRent <noreply@krishirent.in>"
```

### 💳 Configuring Real Razorpay Merchant UPI Credentials:
1. Sign up on [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Go to **Settings > API Keys** and generate Test or Live Key ID and Key Secret.
3. Replace `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `server/.env`.
4. Go to **Settings > Webhooks** and add `http://your-domain.com/api/payments/webhook` with event `payment.captured` and set `RAZORPAY_WEBHOOK_SECRET`.

---

## 👨‍🌾 Pre-seeded Demo Accounts

| Role | Email | Mobile | Notes |
|---|---|---|---|
| **Platform Admin** | `admin@krishirent.in` | `9876543210` | Full governance, seller verification, audit trail |
| **Verified Seller** | `seller@krishirent.in` | `9822012345` | Patil Krishi Seva Kendra, Baramati (Machinery listing & metrics) |
| **Farmer (Customer)** | `farmer@krishirent.in` | `9423188899` | Tukaram Shinde, Indapur (Rental & purchase history) |

*To sign in as any user, navigate to `/auth?mode=signin`, enter the email, click **Send Verification OTP**, view the 6-digit code logged in the backend terminal console, and verify!*

---

## 🧪 Testing Checklist
- [x] **Email OTP Single-use & Expiry**: Tested via `npm test` and live in browser.
- [x] **Double-Booking Collision Engine**: Confirmed rentals block overlapping calendar slots.
- [x] **UPI Payment & HMAC Signature**: Verified Razorpay checkout modal and server-side HMAC validation.
- [x] **English & Marathi Bilingual UI**: Seamless navbar switch affecting product descriptions and actions.
- [x] **Seller & Admin Portal**: Listing creation, seller license approval, and audit logs.