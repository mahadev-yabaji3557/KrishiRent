import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";

const JWT_SECRET = process.env.JWT_SECRET || "krishi_secret_jwt_key_2026_super_secure_entropy_key_99";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export function generateToken(payload: AuthenticatedUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.krishi_token;
    
    let token: string | undefined;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (cookieToken) {
      token = cookieToken;
    }

    if (!token) {
      res.status(401).json({ success: false, message: "Authentication required. Please sign in." });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    
    // Check if user still exists in DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, name: true, isEmailVerified: true }
    });

    if (!user) {
      res.status(401).json({ success: false, message: "User account no longer found." });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid or expired session. Please sign in again." });
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        success: false, 
        message: `Forbidden. Requires one of roles: [${allowedRoles.join(", ")}]. Current role: ${req.user.role}` 
      });
      return;
    }

    next();
  };
}