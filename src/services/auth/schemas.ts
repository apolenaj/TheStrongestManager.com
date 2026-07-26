import { z } from "zod";

export const signUpSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(254),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

export const deleteAccountSchema = z.object({
  confirmation: z
    .string()
    .refine((value) => value === "DELETE", {
      message: "Type DELETE to confirm account deletion",
    }),
  password: z.string().optional(),
});
