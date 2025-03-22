import z from 'zod';

export const createUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  cpf: z.string().length(11),
  password: z.string().min(6),
});

export type CreateUserData = z.infer<typeof createUserSchema>;