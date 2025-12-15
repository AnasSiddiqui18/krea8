import { z } from "zod"

export const email = z
    .email({ message: "Please enter a valid email address" })
    .max(128, "Email cannot exceed 127 characters.")

export const password = z
    .string()
    .min(6, { message: "Password must be at least of 6 characters." })
    .max(128, "Password cannot exceed 128 characters.")

export const signUpValidation = z.object({
    name: z.string().min(3).max(30),
    email,
    password,
})

export const signInValidation = z.object({
    email,
    password,
})
