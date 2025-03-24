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
  getActivityById,
  subscribe,
  checkIfAlreadySubcribed,
  update,
  concludeActivity,
  approveParticipantForActivity,
  getActivityParticipant,
  checkIn,
  unsubscribe,
  deleteById,
} from "../repository/activities-repository";
import {
  getActivitiesPaginatedParamsSchema,
  GetActivitiesPaginatedParams,
  getAllActivitiesSchema,
  GetAllActivitiesParams,
  UserAndPaginationParams,
  userAndPaginationParamsSchema,
  createActivitySchema,
  CreateActivityData,
  UpdateActivityData,
  updateActivitySchema,
  ApproveParticipantData,
  approveParticipantSchema,
  CheckInData,
  checkInSchema
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

export const subToActivity = async (userId: string, activityId: string) => {
  const activity = await getActivityById(activityId);
  let approved : boolean = false;
  console.log('ATIVIDADE:' + activity?.title);
  if (!activity || activity.deletedAt) {
    throw new Error("Atividade não encontrada");
  }
  const alreadySubscribed = await checkIfAlreadySubcribed(activityId, userId);
  if (alreadySubscribed) {
    throw new Error("Você já se registrou nessa atividade");
  }
  if (activity?.private === false) {
    approved = true;
  }
  const response = await subscribe(userId, activityId, approved);
  return response;
}

export const updateActivityById = async (id: string, data: UpdateActivityData) => {
  updateActivitySchema.parse(data);
  return update(id, data);
}

export const markActivityAsConcluded = async (id: string) => {
  const checkActivity = await getActivityById(id);
  if (!checkActivity || checkActivity.deletedAt) {
    throw new Error("Atividade não encontrada");
  }
  await concludeActivity(id);
  return;
}

export const approveParticipant = async (activityId: string, data: ApproveParticipantData) => { 
  approveParticipantSchema.parse(data);
  const { participantId, approved } = data;  
  const activityParticipant = await getActivityParticipant(activityId, participantId);
  if (!activityParticipant) {
    throw new Error("Participante não encontrado");
  }
  await approveParticipantForActivity(activityParticipant.id, approved);
  return;
}

export const checkInParticipant = async (activityId: string, userId: string, data: CheckInData) => {
  checkInSchema.parse(data);
  const { confirmationCode: code } = data;
  const activityParticipant = await getActivityParticipant(activityId, userId);
  if (!activityParticipant) {
    throw new Error("Participante não encontrado");
  }
  if (activityParticipant.confirmedAt) {
    throw new Error("Você já confirmou sua participação nessa atividade.");
  }

  const activity = await getActivityById(activityId);

  if (!activity) {
    throw new Error("Atividade não encontrada");
  }
  if (activity.confirmationCode !== code) {
    throw new Error("Código de confirmação inválido");
  }
  await checkIn(activityParticipant.id);
  return;
}

export const unsubscribeFromActivity = async (activityId: string, userId: string) => {
  const activity = await getActivityById(activityId);
  if (!activity || activity.deletedAt) {
    throw new Error("Atividade não encontrada.");
  }

  const activityParticipant = await getActivityParticipant(activityId, userId);
  if (!activityParticipant) {
    throw new Error("Você não se inscreveu nessa atividade.");
  }
  await unsubscribe(activityParticipant.id);
  return;
} 

export const deleteActivityById = async (id: string) => {
  const activity = await getActivityById(id);
  if (!activity || activity.deletedAt) {
    throw new Error("Atividade não encontrada.");
  }
  await deleteById(id);
  return;
}