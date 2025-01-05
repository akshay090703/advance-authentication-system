import { z } from "zod";

export const emailSchema = z.string().trim().email().min(3).max(200);
export const passwordSchema = z.string().trim().min(6).max(200);

export const registerSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((val) => val.password === val.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  userAgent: z.string().optional(),
});