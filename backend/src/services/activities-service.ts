import { getActivitiesPaginated, getAllActivities } from "../repository/activities-repository";
import { getActivitiesPaginatedParamsSchema, GetActivitiesPaginatedParams, getAllActivitiesSchema, GetAllActivitiesParams } from "../types/activities-type";

export const getActivities = async (params : GetActivitiesPaginatedParams) => {
  getActivitiesPaginatedParamsSchema.parse(params);
  const skip = parseInt(params.skip);
  const take = parseInt(params.take);
  const typeId = params.typeId;
  const orderBy = params.orderBy;
  const order = params.order;
  return await getActivitiesPaginated(skip, take, typeId, orderBy, order);
}

export const getAll = async (params : GetAllActivitiesParams) => {
  getAllActivitiesSchema.parse(params);
  return await getAllActivities(params.typeId, params.orderBy, params.order); 
}	