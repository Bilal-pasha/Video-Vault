import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8, 'Password must be at least 8 characters'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;
