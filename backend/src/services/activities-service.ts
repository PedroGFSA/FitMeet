import {
  getActivitiesPaginated,
  getAllActivities,
  getAllTypes,
  getActivitiesCreatedByUser,
  getAllActivitiesCreatedByUser,
  getActivitiesUserParticipant as findActivitiesUserParticipant,
  getAllActivitiesUserParticipant as findAllActivitiesUserParticipant,
  getAllActivityParticipants,
  create,
} from "../repository/activities-repository";
import {
  getActivitiesPaginatedParamsSchema,
  GetActivitiesPaginatedParams,
  getAllActivitiesSchema,
  GetAllActivitiesParams,
  UserAndPaginationParams,
  userAndPaginationParamsSchema,
  createActivitySchema,
  CreateActivityData
} from "../types/activities-type";

export const getAllActivityTypes = async () => {
  const types = await getAllTypes();
  return types;
};

export const getActivities = async (params: GetActivitiesPaginatedParams) => {
  getActivitiesPaginatedParamsSchema.parse(params);
  const typeId = params.typeId;
  const orderBy = params.orderBy;
  const order = params.order;
  return await getActivitiesPaginated(
    Number(params.page),
    Number(params.pageSize),
    typeId,
    orderBy,
    order
  );
};

export const getAll = async (params: GetAllActivitiesParams) => {
  getAllActivitiesSchema.parse(params);
  return await getAllActivities(params.typeId, params.orderBy, params.order);
};

export const getCreatedByUser = async (
  data: UserAndPaginationParams
) => {
  userAndPaginationParamsSchema.parse(data);
  return  getActivitiesCreatedByUser(data.id, Number(data.page), Number(data.pageSize)) ;
};

export const getAllCreatedByUser = async (userId : string) => {
  return await getAllActivitiesCreatedByUser(userId);
}

export const getActivitiesUserIsParticipant = async (data: UserAndPaginationParams) => {
  userAndPaginationParamsSchema.parse(data);
  return await findActivitiesUserParticipant(data.id, Number(data.page), Number(data.pageSize));
}

export const getAllActivitiesUserIsParticipant = async (userId: string) => {
  return await findAllActivitiesUserParticipant(userId);
}

export const getAllParticipantsByActivityId = async (activityId: string) => {
  return await getAllActivityParticipants(activityId);
}

export const createActivity = async (userId: string, data: CreateActivityData) => {
  createActivitySchema.parse(data);
  data = { ...data, creatorId: userId, confirmationCode: Math.floor(100 + Math.random() * 900).toString() };
  const activity = await create(data);
  return activity;
}