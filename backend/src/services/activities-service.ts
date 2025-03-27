import HttpStatus from "../enum/httpStatus";
import subscriptionStatus from "../enum/subscriptionStatus";
import HttpResponseError from "../errors/HttpResponseError";
import {
  getActivitiesPaginated,
  getAllActivities,
  getAllTypes,
  getActivitiesCreatedByUser,
  getAllActivitiesCreatedByUser,
  getActivitiesUserParticipant as findActivitiesUserParticipant,
  getAllActivitiesUserParticipant as findAllActivitiesUserParticipant,
  create,
  getActivityById,
  update,
  concludeActivity,
  deleteById,
} from "../repository/activities-repository";
import {
  approveParticipantForActivity,
  checkIn,
  getActivityParticipant,
  getAllActivityParticipants,
  subscribe,
  unsubscribe,
  countParticipants,
} from "../repository/activityParticipants-repository";
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
  checkInSchema,
} from "../types/activities-type";

export const getAllActivityTypes = async () => {
  const types = await getAllTypes();
  return types;
};

export const getActivities = async (
  params: GetActivitiesPaginatedParams,
  userId: string
) => {
  getActivitiesPaginatedParamsSchema.parse(params);
  const typeId = params.typeId;
  const orderBy = params.orderBy;
  const order = params.order;
  const result = await getActivitiesPaginated(
    Number(params.page),
    Number(params.pageSize),
    typeId,
    orderBy,
    order
  );
  const activities: any = await Promise.all(
    result.activities.map(async (activity) => {
      const count = await countParticipants(activity.id);
      const activityParticipant = await getActivityParticipant(
        activity.id,
        userId
      );
      let status: string;
      if (!activityParticipant) {
        status = subscriptionStatus.NAO_INSCRITO;
      } else if (activityParticipant.approved) {
        status = subscriptionStatus.INSCRITO;
      } else {
        status = subscriptionStatus.PENDENTE;
      }
      return {
        ...activity,
        participantCount: count,
        userSubscriptionStatus: status,
      };
    })
  );
  return { ...result, activities };
};

export const getAll = async (
  params: GetAllActivitiesParams,
  userId: string
) => {
  getAllActivitiesSchema.parse(params);
  const activities = await getAllActivities(
    params.typeId,
    params.orderBy,
    params.order
  );
  const response = await Promise.all(
    activities.map(async (activity) => {
      const count = await countParticipants(activity.id);
      const activityParticipant = await getActivityParticipant(
        activity.id,
        userId
      );
      let status: string;
      if (!activityParticipant) {
        status = subscriptionStatus.NAO_INSCRITO;
      } else if (activityParticipant.approved) {
        status = subscriptionStatus.INSCRITO;
      } else {
        status = subscriptionStatus.PENDENTE;
      }
      return {
        ...activity,
        participantCount: count,
        userSubscriptionStatus: status,
      };
    })
  );
  return response;
};

export const getCreatedByUser = async (data: UserAndPaginationParams) => {
  userAndPaginationParamsSchema.parse(data);
  return getActivitiesCreatedByUser(
    data.id,
    Number(data.page),
    Number(data.pageSize)
  );
};

export const getAllCreatedByUser = async (userId: string) => {
  return await getAllActivitiesCreatedByUser(userId);
};

export const getActivitiesUserIsParticipant = async (
  data: UserAndPaginationParams
) => {
  userAndPaginationParamsSchema.parse(data);
  const result = await findActivitiesUserParticipant(
    data.id,
    Number(data.page),
    Number(data.pageSize)
  );
  const activities = await Promise.all(result.activities.map(async (activity) => {
    const activityParticipant = await getActivityParticipant(activity.id, data.id);
    let status: string;
    if (!activityParticipant) {
      status = subscriptionStatus.NAO_INSCRITO;
    } else if (activityParticipant.approved) {
      status = subscriptionStatus.INSCRITO;
    } else {
      status = subscriptionStatus.PENDENTE;
    }
    return {
      ...activity,
      userSubscriptionStatus: status,
    };
  }));

  return { ...result, activities };
};

export const getAllActivitiesUserIsParticipant = async (userId: string) => {
  const result = await findAllActivitiesUserParticipant(userId);
  const activities = await Promise.all(result.map(async (activity) => {
    const activityParticipant = await getActivityParticipant(activity.id, userId);
    let status: string;
    if (!activityParticipant) {
      status = subscriptionStatus.NAO_INSCRITO;
    } else if (activityParticipant.approved) {
      status = subscriptionStatus.INSCRITO;
    } else {
      status = subscriptionStatus.PENDENTE;
    }
    return {
      ...activity,
      userSubscriptionStatus: status,
    };
  }));
  return activities;
};

export const getAllParticipantsByActivityId = async (activityId: string) => {
  const participants = await getAllActivityParticipants(activityId);
  // Remove objeto aninhado e coloca os dados do objeto user no mesmo nível
  const response = participants.map((participant) => {
    let status: string;
    if (!participant) {
      status = subscriptionStatus.NAO_INSCRITO;
    } else if (participant.approved) {
      status = subscriptionStatus.INSCRITO;
    } else {
      status = subscriptionStatus.PENDENTE;
    }
    return {
      id: participant.id,
      userId: participant.userId,
      name: participant.user.name,
      avatar: participant.user.avatar,
      userSubscriptionStatus: status,
      confirmedAt: participant.confirmedAt,
    };
  });
  return response;
};

export const createActivity = async (
  userId: string,
  data: CreateActivityData
) => {
  data = createActivitySchema.parse(data);
  data.creatorId = userId;
  data.confirmationCode = Math.floor(100 + Math.random() * 900).toString();
  const activity = await create(data);
  return activity;
};

export const subToActivity = async (userId: string, activityId: string) => {
  const activity = await getActivityById(activityId);
  let approved: boolean = false;
  console.log("ATIVIDADE:" + activity?.title);
  if (!activity || activity.deletedAt) {
    throw new HttpResponseError(
      HttpStatus.NOT_FOUND,
      "Atividade não encontrada"
    );
  }
  const alreadySubscribed = await getActivityParticipant(activityId, userId);
  if (alreadySubscribed) {
    throw new HttpResponseError(
      HttpStatus.CONFLICT,
      "Você já se registrou nessa atividade"
    );
  }
  if (activity?.private === false) {
    approved = true;
  }
  const activityParticipant = await subscribe(userId, activityId, approved);
  let status: string;
  if (!activityParticipant) {
    status = subscriptionStatus.NAO_INSCRITO;
  } else if (activityParticipant.approved) {
    status = subscriptionStatus.INSCRITO;
  } else {
    status = subscriptionStatus.PENDENTE;
  }
  return {
    id: activityParticipant.id,
    userId: activityParticipant.userId,
    activityId: activityParticipant.activityId,
    userSubscriptionStatus: status,
    confirmedAt: activityParticipant.confirmedAt,
  };
};

export const updateActivityById = async (
  id: string,
  data: UpdateActivityData
) => {
  updateActivitySchema.parse(data);
  return update(id, data);
};

export const markActivityAsConcluded = async (id: string) => {
  const checkActivity = await getActivityById(id);
  if (!checkActivity || checkActivity.deletedAt) {
    throw new HttpResponseError(
      HttpStatus.NOT_FOUND,
      "Atividade não encontrada"
    );
  }
  await concludeActivity(id);
  return;
};

export const approveParticipant = async (
  activityId: string,
  data: ApproveParticipantData
) => {
  approveParticipantSchema.parse(data);
  const { participantId, approved } = data;
  const activityParticipant = await getActivityParticipant(
    activityId,
    participantId
  );
  if (!activityParticipant) {
    throw new HttpResponseError(
      HttpStatus.NOT_FOUND,
      "Participante não encontrado"
    );
  }
  await approveParticipantForActivity(activityParticipant.id, approved);
  return;
};

export const checkInParticipant = async (
  activityId: string,
  userId: string,
  data: CheckInData
) => {
  data = checkInSchema.parse(data);
  const { confirmationCode: code } = data;

  const activity = await getActivityById(activityId);
  if (!activity) {
    throw new HttpResponseError(
      HttpStatus.NOT_FOUND,
      "Atividade não encontrada."
    );
  }

  const activityParticipant = await getActivityParticipant(activityId, userId);
  console.log(activityId + "\n" + userId);
  if (!activityParticipant) {
    throw new HttpResponseError(
      HttpStatus.NOT_FOUND,
      "Participante não encontrado."
    );
  }
  if (activityParticipant.confirmedAt) {
    throw new HttpResponseError(
      HttpStatus.CONFLICT,
      "Você já confirmou sua participação nessa atividade."
    );
  }

  if (activity.confirmationCode !== code) {
    throw new HttpResponseError(
      HttpStatus.BAD_REQUEST,
      "Informe os campos obrigatórios corretamente."
    );
  }
  await checkIn(activityParticipant.id);
  return;
};

export const unsubscribeFromActivity = async (
  activityId: string,
  userId: string
) => {
  const activity = await getActivityById(activityId);
  if (!activity || activity.deletedAt) {
    throw new HttpResponseError(
      HttpStatus.NOT_FOUND,
      "Atividade não encontrada."
    );
  }

  const activityParticipant = await getActivityParticipant(activityId, userId);
  if (!activityParticipant) {
    throw new HttpResponseError(
      HttpStatus.BAD_REQUEST,
      "Você não se inscreveu nessa atividade."
    );
  }
  await unsubscribe(activityParticipant.id);
  return;
};

export const deleteActivityById = async (id: string) => {
  const activity = await getActivityById(id);
  if (!activity || activity.deletedAt) {
    throw new HttpResponseError(
      HttpStatus.NOT_FOUND,
      "Atividade não encontrada."
    );
  }
  await deleteById(id);
  return;
};
