import { Router } from "express";
import { registerInit, signinInit, verifyOtp, getMe, logout } from "../controllers/authController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/register/init", registerInit);
router.post("/signin/init", signinInit);
router.post("/verify-otp", verifyOtp);
router.get("/me", requireAuth, getMe);
router.post("/logout", logout);

export default router;