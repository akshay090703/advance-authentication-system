import { Router } from "express";
import { authController } from "./auth.module";

const authRoutes = Router();

authRoutes.post("/register", authController.register);
authRoutes.post("/login", authController.login);
authRoutes.post("/verify-email", authController.verifyEmail);
authRoutes.get("/refresh", authController.refresh);

export default authRoutes;
