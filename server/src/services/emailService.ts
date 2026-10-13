import nodemailer from "nodemailer";

interface SendOtpParams {
  toEmail: string;
  otp: string;
  purpose: "REGISTRATION" | "SIGNIN";
  userName?: string;
}

export async function sendEmailOtp({ toEmail, otp, purpose, userName }: SendOtpParams): Promise<boolean> {
  const subject = purpose === "REGISTRATION" 
    ? "🌾 KrishiRent & AgroMart - Verify Your Farmer/Seller Account"
    : "🌾 KrishiRent & AgroMart - Your Login OTP Code";

  const messageHtml = `
    <div style="font-family: Arial, sans-serif; background-color: #f4fbf4; padding: 25px; border-radius: 8px; max-width: 550px; margin: auto; border: 1px solid #c7e9c0;">
      <h2 style="color: #166534; margin-top: 0;">🌾 KrishiRent & AgroMart</h2>
      <p style="font-size: 15px; color: #1f2937;">Namaste ${userName ? `<strong>${userName}</strong>` : "Farmer / Merchant"},</p>
      <p style="font-size: 14px; color: #374151;">
        Your single-use 6-digit verification code for <strong>${purpose === "REGISTRATION" ? "Account Registration" : "Sign In"}</strong> is:
      </p>
      <div style="background-color: #15803d; color: #ffffff; font-size: 32px; letter-spacing: 6px; font-weight: bold; text-align: center; padding: 14px 20px; border-radius: 6px; margin: 20px 0;">
        ${otp}
      </div>
      <p style="font-size: 13px; color: #4b5563;">
        ⏱️ This OTP code is valid for <strong>5 minutes</strong>. Do not share this OTP with anyone, including KrishiRent representatives.
      </p>
      <hr style="border: none; border-top: 1px solid #d1fae5; margin: 20px 0;" />
      <p style="font-size: 12px; color: #6b7280; line-height: 1.4;">
        Serving Indian Agriculture 🚜 | Tractors, Harvesters, Fertilizers & Seeds<br/>
        Kisan Helpline / WhatsApp: +91 1800-180-1551
      </p>
    </div>
  `;

  // Always log to terminal console for transparency
  console.log(`\n=============================================================`);
  console.log(`[EMAIL OTP DISPATCH] To: ${toEmail} | Purpose: ${purpose}`);
  console.log(`[EMAIL OTP CODE] >>> ${otp} <<< (Valid 5 mins)`);
  console.log(`=============================================================\n`);

  // Send via Google Gmail SMTP (direct delivery to any inbox)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 465),
        secure: Number(process.env.SMTP_PORT || 465) === 465, // true for port 465
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: process.env.FROM_EMAIL || `"KrishiRent & AgroMart" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject,
        html: messageHtml,
      });

      console.log(`✅ [GMAIL SMTP SENT TO INBOX] Message ID: ${info.messageId} to ${toEmail}`);
      return true;
    } catch (error) {
      console.error("[SMTP ERROR]", error);
    }
  }

  return true;
}

export async function sendOrderReceiptEmail(toEmail: string, orderNumber: string, amountPaise: number, itemsSummary: string): Promise<void> {
  console.log(`\n=============================================================`);
  console.log(`[ORDER RECEIPT] To: ${toEmail} | Order: ${orderNumber} | Amount: ₹${(amountPaise / 100).toFixed(2)}`);
  console.log(`[ITEMS] ${itemsSummary}`);
  console.log(`=============================================================\n`);

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 465),
        secure: Number(process.env.SMTP_PORT || 465) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.FROM_EMAIL || `"KrishiRent & AgroMart" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: `🌾 Order Confirmed #${orderNumber} - KrishiRent & AgroMart`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #c7e9c0; border-radius: 8px;">
            <h2 style="color: #166534;">🌾 Payment Verified - Order #${orderNumber}</h2>
            <p>Thank you for choosing KrishiRent. Your agricultural order has been confirmed.</p>
            <p><strong>Total Amount Paid:</strong> ₹${(amountPaise / 100).toFixed(2)} via UPI</p>
            <p><strong>Items:</strong> ${itemsSummary}</p>
          </div>
        `,
      });
    } catch (e) {
      console.error("[SMTP RECEIPT ERROR]", e);
    }
  }
}