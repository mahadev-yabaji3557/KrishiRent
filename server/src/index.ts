import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

import authRoutes from "./routes/authRoutes";
import { 
  productRouter, 
  cartRouter, 
  paymentRouter, 
  customerRouter, 
  sellerRouter, 
  adminRouter 
} from "./routes/apiRoutes";

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl) or any onrender.com domain or localhost
    if (!origin || origin.endsWith(".onrender.com") || origin.includes("localhost")) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in production for agricultural portal
    }
  },
  credentials: true,
}));

// Cookie Parser
app.use(cookieParser());

// Raw body parser support for Webhook HMAC verification
app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: "Too many requests. Please slow down." }
});
app.use("/api", globalLimiter);

// Specific Auth Rate Limiting for OTP abuse protection
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  message: { success: false, message: "Too many verification requests. Please try again in 5 minutes." }
});
app.use("/api/auth", authLimiter);

// Health Check
app.get("/api/health", (_req, res) => {
  res.json({ 
    status: "healthy", 
    service: "KrishiRent & AgroMart API", 
    timestamp: new Date().toISOString() 
  });
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/customer", customerRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/admin", adminRouter);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[SERVER ERROR]", err);
  res.status(500).json({ 
    success: false, 
    message: err.message || "An unexpected server error occurred." 
  });
});

app.listen(PORT, () => {
  console.log(`\n🌾 KrishiRent & AgroMart Server running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔐 Razorpay Gateway configured: Key ID [${process.env.RAZORPAY_KEY_ID?.slice(0, 8)}...]`);
});