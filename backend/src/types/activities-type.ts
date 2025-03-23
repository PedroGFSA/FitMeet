import z from 'zod';

export const getActivitiesPaginatedParamsSchema = z.object({
  skip: z.string().optional().default("0"),
  take: z.string().optional().default("5"),
  typeId: z.string().optional(),
  orderBy: z.string().optional(),
  order: z.string().optional(),
});

export type GetActivitiesPaginatedParams = z.infer<typeof getActivitiesPaginatedParamsSchema>;

export const getAllActivitiesSchema = z.object({
  typeId: z.string().optional(),
  orderBy: z.string().optional(),
  order: z.string().optional(),
});

export type GetAllActivitiesParams = z.infer<typeof getAllActivitiesSchema>;