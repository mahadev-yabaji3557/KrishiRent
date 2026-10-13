import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { generateCryptoOtp, hashOtp, verifyOtpHash } from "../utils/otp";
import { sendEmailOtp } from "../services/emailService";
import { generateToken, AuthRequest } from "../middleware/auth";

const registerInitSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid 10-digit mobile number required"),
  villageOrTown: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  role: z.enum(["FARMER", "SELLER"]).default("FARMER"),
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
  purpose: z.enum(["REGISTRATION", "SIGNIN"]),
});

const signinInitSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// 1. Initiate Registration: sends OTP to email
export async function registerInit(req: Request, res: Response): Promise<void> {
  try {
    const data = registerInitSchema.parse(req.body);
    const normalizedEmail = data.email.trim().toLowerCase();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existing && existing.isEmailVerified) {
      res.status(400).json({ 
        success: false, 
        message: "An account with this email already exists. Please sign in instead." 
      });
      return;
    }

    // Rate-limiting / Cooldown check: 45 seconds
    const lastChallenge = await prisma.otpChallenge.findFirst({
      where: { 
        email: normalizedEmail,
        purpose: "REGISTRATION",
      },
      orderBy: { createdAt: "desc" }
    });

    if (lastChallenge) {
      const msSinceLast = Date.now() - new Date(lastChallenge.createdAt).getTime();
      if (msSinceLast < 45000) {
        res.status(429).json({ 
          success: false, 
          message: `Please wait ${Math.ceil((45000 - msSinceLast) / 1000)} seconds before requesting a new OTP.` 
        });
        return;
      }
    }

    // Upsert unverified user placeholder
    await prisma.user.upsert({
      where: { email: normalizedEmail },
      update: {
        name: data.name,
        phone: data.phone,
        villageOrTown: data.villageOrTown || null,
        district: data.district || null,
        state: data.state || null,
        role: data.role,
      },
      create: {
        email: normalizedEmail,
        name: data.name,
        phone: data.phone,
        villageOrTown: data.villageOrTown || null,
        district: data.district || null,
        state: data.state || null,
        role: data.role,
        isEmailVerified: false,
      }
    });

    // Create OTP
    const rawOtp = generateCryptoOtp();
    const otpHash = hashOtp(rawOtp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.otpChallenge.create({
      data: {
        email: normalizedEmail,
        otpHash,
        purpose: "REGISTRATION",
        expiresAt,
      }
    });

    await sendEmailOtp({
      toEmail: normalizedEmail,
      otp: rawOtp,
      purpose: "REGISTRATION",
      userName: data.name,
    });

    res.json({
      success: true,
      message: `Verification OTP sent to ${normalizedEmail}. Valid for 5 minutes.`,
      email: normalizedEmail,
      devOtp: process.env.NODE_ENV !== "production" ? rawOtp : undefined,
    });
  } catch (error: any) {
    res.status(400).json({ 
      success: false, 
      message: error.errors?.[0]?.message || error.message || "Failed to initiate registration" 
    });
  }
}

// 2. Initiate Sign-In: sends fresh OTP to registered email
export async function signinInit(req: Request, res: Response): Promise<void> {
  try {
    const data = signinInitSchema.parse(req.body);
    const normalizedEmail = data.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user || !user.isEmailVerified) {
      res.status(404).json({ 
        success: false, 
        message: "No registered account found with this email. Please register first." 
      });
      return;
    }

    // Cooldown check (45s)
    const lastChallenge = await prisma.otpChallenge.findFirst({
      where: { 
        email: normalizedEmail,
        purpose: "SIGNIN",
      },
      orderBy: { createdAt: "desc" }
    });

    if (lastChallenge) {
      const msSinceLast = Date.now() - new Date(lastChallenge.createdAt).getTime();
      if (msSinceLast < 45000) {
        res.status(429).json({ 
          success: false, 
          message: `Please wait ${Math.ceil((45000 - msSinceLast) / 1000)} seconds before requesting a new OTP.` 
        });
        return;
      }
    }

    const rawOtp = generateCryptoOtp();
    const otpHash = hashOtp(rawOtp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.otpChallenge.create({
      data: {
        email: normalizedEmail,
        otpHash,
        purpose: "SIGNIN",
        expiresAt,
      }
    });

    await sendEmailOtp({
      toEmail: normalizedEmail,
      otp: rawOtp,
      purpose: "SIGNIN",
      userName: user.name,
    });

    res.json({
      success: true,
      message: `Fresh sign-in OTP sent to ${normalizedEmail}. Valid for 5 minutes.`,
      email: normalizedEmail,
      devOtp: process.env.NODE_ENV !== "production" ? rawOtp : undefined,
    });
  } catch (error: any) {
    res.status(400).json({ 
      success: false, 
      message: error.errors?.[0]?.message || error.message || "Failed to initiate sign in" 
    });
  }
}

// 3. Verify OTP
export async function verifyOtp(req: Request, res: Response): Promise<void> {
  try {
    const { email, otp, purpose } = verifyOtpSchema.parse(req.body);
    const normalizedEmail = email.trim().toLowerCase();

    const challenge = await prisma.otpChallenge.findFirst({
      where: {
        email: normalizedEmail,
        purpose,
        consumedAt: null,
      },
      orderBy: { createdAt: "desc" }
    });

    if (!challenge) {
      res.status(400).json({ 
        success: false, 
        message: "No pending OTP verification request found. Please request a new OTP." 
      });
      return;
    }

    if (new Date() > new Date(challenge.expiresAt)) {
      res.status(400).json({ 
        success: false, 
        message: "This OTP has expired. Please request a fresh OTP." 
      });
      return;
    }

    if (challenge.attempts >= challenge.maxAttempts) {
      res.status(429).json({ 
        success: false, 
        message: "Too many incorrect attempts. This OTP is invalidated. Request a new one." 
      });
      return;
    }

    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { attempts: challenge.attempts + 1 }
    });

    const isValid = verifyOtpHash(otp.trim(), challenge.otpHash);
    if (!isValid) {
      const remaining = challenge.maxAttempts - (challenge.attempts + 1);
      res.status(400).json({ 
        success: false, 
        message: `Invalid OTP code. ${remaining > 0 ? `${remaining} attempts remaining.` : "OTP invalidated."}` 
      });
      return;
    }

    await prisma.otpChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() }
    });

    const user = await prisma.user.update({
      where: { email: normalizedEmail },
      data: { isEmailVerified: true },
      include: { sellerProfile: true }
    });

    if (user.role === "SELLER" && !user.sellerProfile) {
      await prisma.sellerProfile.create({
        data: {
          userId: user.id,
          businessName: `${user.name}'s Agro Equipment & Rentals`,
          farmOrShopAddress: user.villageOrTown || "Rural Agri Center",
          district: user.district || "Pune",
          state: user.state || "Maharashtra",
          pincode: "411001",
          isVerified: true,
        }
      });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.cookie("krishi_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: purpose === "REGISTRATION" ? "USER_REGISTERED_VERIFIED" : "USER_LOGGED_IN",
        detailsJson: JSON.stringify({ email: normalizedEmail, role: user.role })
      }
    });

    res.json({
      success: true,
      message: "Successfully verified and authenticated!",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        villageOrTown: user.villageOrTown,
        district: user.district,
        state: user.state,
        isEmailVerified: user.isEmailVerified,
      }
    });
  } catch (error: any) {
    res.status(400).json({ 
      success: false, 
      message: error.errors?.[0]?.message || error.message || "OTP verification failed" 
    });
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        sellerProfile: true,
        addresses: true,
      }
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        villageOrTown: user.villageOrTown,
        district: user.district,
        state: user.state,
        isEmailVerified: user.isEmailVerified,
        sellerProfile: user.sellerProfile,
        addresses: user.addresses,
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  res.clearCookie("krishi_token");
  res.json({ success: true, message: "Logged out successfully" });
}