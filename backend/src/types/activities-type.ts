import z from 'zod';

export const getActivitiesPaginatedParamsSchema = z.object({
  page: z.string().optional().default("1"),
  pageSize: z.string().optional().default("10"),
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

export const userAndPaginationParamsSchema = z.object({
  id: z.string().uuid(),
  page: z.string().optional(),
  pageSize: z.string().optional(),
});

export type UserAndPaginationParams = z.infer<typeof userAndPaginationParamsSchema>;

// TODO: validation for scheduledDate so it only accepts future dates
export const createActivitySchema = z.object({
  title: z.string(),
  description: z.string(),
  typeId: z.string().uuid(),
  address: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  image: z.string(),
  scheduledDate: z.string().datetime(),
  private: z.boolean(),
  creatorId: z.string().optional(),
  confirmationCode: z.string().optional(),
});

export type CreateActivityData = z.infer<typeof createActivitySchema>;

export const updateActivitySchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  typeId: z.string().uuid().optional(),
  address: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  image: z.string().optional(),
  scheduledDate: z.string().datetime().optional(),
  private: z.boolean().optional(),
})

export type UpdateActivityData = z.infer<typeof updateActivitySchema>;

export const approveParticipantSchema = z.object({
  participantId: z.string().uuid(),
  approved: z.boolean(),
})

export type ApproveParticipantData = z.infer<typeof approveParticipantSchema>;

export const checkInSchema = z.object({
  confirmationCode: z.string(),
})

export type CheckInData = z.infer<typeof checkInSchema>;