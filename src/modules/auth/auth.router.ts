import { Router } from "express";
import { authController } from "./auth.module";
import { authenticateJWT } from "../../lib/strategies/jwt.strategy";

const authRoutes = Router();

authRoutes.post("/register", authController.register);
authRoutes.post("/login", authController.login);
authRoutes.post("/verify-email", authController.verifyEmail);
authRoutes.post("/forgot-password", authController.forgotPassword);
authRoutes.post("/reset-password", authController.resetPassword);

authRoutes.get("/logout", authenticateJWT, authController.logout);
authRoutes.get("/refresh", authController.refresh);

export default authRoutes;
