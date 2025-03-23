import z from 'zod';

export const createUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  cpf: z.string().length(11),
  password: z.string().min(6),
});

export type CreateUserData = z.infer<typeof createUserSchema>;

export const definePreferencesSchema = z.array(z.object({
  typeId: z.string().uuid()
}))

export type DefinePreferencesData = z.infer<typeof definePreferencesSchema>;

export const updateUserAvatarSchema = z.object({
  avatar: z.string()
});

export type UpdateUserAvatarData = z.infer<typeof updateUserAvatarSchema>;

export const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
});

export type UpdateUserData = z.infer<typeof updateUserSchema>;