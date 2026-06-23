import { z } from 'zod';

const passwordRule = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export const loginSchema = z.object({
  identifier: z.string().min(1, 'auth.validation.identifierRequired'),
  password: z.string().min(1, 'auth.validation.passwordRequired'),
});

export const registerSchema = z
  .object({
    username: z.string().min(3, 'auth.validation.usernameMin'),
    email: z.string().email('auth.validation.emailInvalid'),
    password: z.string().regex(passwordRule, 'auth.validation.passwordRule'),
    confirm_password: z
      .string()
      .min(1, 'auth.validation.confirmPasswordRequired'),
    full_name: z.string().min(2, 'auth.validation.fullNameRequired'),
    phone: z.string().min(8, 'auth.validation.phoneInvalid'),
  })
  .refine((value) => value.password === value.confirm_password, {
    message: 'auth.validation.passwordMismatch',
    path: ['confirm_password'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('auth.validation.emailInvalid'),
});

export const resetPasswordSchema = z
  .object({
    new_password: z
      .string()
      .regex(passwordRule, 'auth.validation.passwordRule'),
    confirm_password: z
      .string()
      .min(1, 'auth.validation.confirmPasswordRequired'),
  })
  .refine((value) => value.new_password === value.confirm_password, {
    message: 'auth.validation.passwordMismatch',
    path: ['confirm_password'],
  });

export const updateProfileSchema = z.object({
  full_name: z.string().min(2, 'auth.validation.fullNameRequired'),
  phone: z.string().min(8, 'auth.validation.phoneInvalid'),
});

export const changePasswordSchema = z
  .object({
    current_password: z
      .string()
      .min(1, 'auth.validation.currentPasswordRequired'),
    new_password: z
      .string()
      .regex(passwordRule, 'auth.validation.passwordRule'),
    confirm_password: z
      .string()
      .min(1, 'auth.validation.confirmPasswordRequired'),
  })
  .refine((value) => value.new_password === value.confirm_password, {
    message: 'auth.validation.passwordMismatch',
    path: ['confirm_password'],
  });

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
