import { uploadImage } from "../connection/s3-client";
import { Achievements } from "../enum/achievements";
import HttpStatus from "../enum/httpStatus";
import subscriptionStatus from "../enum/subscriptionStatus";
import HttpResponseError from "../errors/HttpResponseError";
import { getAchievementByName } from "../repository/achievements-repository";
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
  getPreferredTypesFromUser,
  checkIfConcludedAny,
} from "../repository/activities-repository";
import {
  approveParticipantForActivity,
  checkIn,
  getActivityParticipant,
  getAllActivityParticipants,
  subscribe,
  unsubscribe,
  countParticipants,
  checkIfConfirmedAny,
} from "../repository/activityParticipants-repository";
import { getSingleUserAchievement, grantAchievement } from "../repository/userAchievement-repository";
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
import { getUserService, updateUserXpAndLevel } from "./user-service";

export const getAllActivityTypes = async () => {
  const types = await getAllTypes();
  return types;
};

export const getActivities = async (
  params: GetActivitiesPaginatedParams,
  userId: string
) => {
  params = getActivitiesPaginatedParamsSchema.parse(params);
  let preferredTypes: Array<string> = [];
  if (!params.typeId) {
    preferredTypes = await getPreferredTypesFromUser(userId);
  } else {
    preferredTypes = [params.typeId];
  }
  const orderBy = params.orderBy;
  const order = params.order;
  const result = await getActivitiesPaginated(
    preferredTypes,
    Number(params.page),
    Number(params.pageSize),
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
      const isCreator = activity.creator.id === userId;
      let status: string;
      if (!activityParticipant) {
        status = subscriptionStatus.NAO_INSCRITO;
      } else if (activityParticipant.approved) {
        status = subscriptionStatus.INSCRITO;
      } else {
        status = subscriptionStatus.PENDENTE;
      }
      const userSubscriptionStatus = isCreator ? undefined : status;

      return {
        ...activity,
        type: activity.type.name,
        participantCount: count,
        userSubscriptionStatus,
      };
    })
  );
  return { ...result, activities };
};

export const getAll = async (
  params: GetAllActivitiesParams,
  userId: string
) => {
  params = getAllActivitiesSchema.parse(params);
  let preferredTypes: Array<string> = [];
  if (!params.typeId) {
    preferredTypes = await getPreferredTypesFromUser(userId);
  } else {
    preferredTypes = [params.typeId];
  }
  const activities = await getAllActivities(
    preferredTypes,
    params.orderBy,
    params.order,
  );
  const response = await Promise.all(
    activities.map(async (activity) => {
      const count = await countParticipants(activity.id);
      const isCreator = activity.creator.id === userId;
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
      const userSubscriptionStatus = isCreator ? undefined : status;
      return {
        ...activity,
        type: activity.type.name,
        participantCount: count,
        userSubscriptionStatus,
      };
    })
  );
  return response;
};

export const getCreatedByUser = async (data: UserAndPaginationParams) => {
  data = userAndPaginationParamsSchema.parse(data);
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
  data = userAndPaginationParamsSchema.parse(data);
  const result = await findActivitiesUserParticipant(
    data.id,
    Number(data.page),
    Number(data.pageSize)
  );
  const activities = await Promise.all(
    result.activities.map(async (activity) => {
      const activityParticipant = await getActivityParticipant(
        activity.id,
        data.id
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
        userSubscriptionStatus: status,
      };
    })
  );

  return { ...result, activities };
};

export const getAllActivitiesUserIsParticipant = async (userId: string) => {
  const result = await findAllActivitiesUserParticipant(userId);
  const activities = await Promise.all(
    result.map(async (activity) => {
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
        userSubscriptionStatus: status,
      };
    })
  );
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
  data: CreateActivityData,
  file?: Express.Multer.File
) => {
  data = createActivitySchema.parse(data);
  if (file && file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") {
    throw new HttpResponseError(
      HttpStatus.BAD_REQUEST,
      "A imagem deve ser um arquivo PNG ou JPG."
    );
  }
  const url = file
    ? await uploadImage(file)
    : `${process.env.S3_ENDPOINT}/${process.env.BUCKET_NAME}/default-image.jpg`;
  data.image = url;
  data.creatorId = userId;
  data.confirmationCode = Math.floor(100 + Math.random() * 900).toString();
  const parsedAddress = JSON.parse(data.address);
  const parsedData = {
    ...data,
    private: data.private == "true",
    address: parsedAddress,
  };
  // checa achievement de criar primeira atividade
  const userActivities = await getAllCreatedByUser(userId);
  if (userActivities.length === 0) {
    const achievement = await getAchievementByName(Achievements.CRIADOR_INICIANTE);
    if (achievement) await grantAchievement(userId, achievement.id);
  }
  const activity = await create(parsedData);
  return activity;
};

export const subToActivity = async (userId: string, activityId: string) => {
  const activity = await getActivityById(activityId);
  let approved: boolean = false;
  if (!activity || activity.deletedAt) {
    throw new HttpResponseError(
      HttpStatus.NOT_FOUND,
      "Atividade não encontrada"
    );
  }

  if (activity.creatorId === userId) {
    throw new HttpResponseError(
      HttpStatus.FORBIDDEN,
      "O criador da atividade não pode se inscrever como um participante."
    );
  }

  if (activity.completedAt) {
    throw new HttpResponseError(
      HttpStatus.FORBIDDEN,
      "Não é possível se inscrever em uma atividade concluída."
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
  data: UpdateActivityData,
  userId: string,
  file?: Express.Multer.File
) => {
  data = updateActivitySchema.parse(data);

  const activity = await getActivityById(id);

  if (!activity) {
    throw new HttpResponseError(
      HttpStatus.NOT_FOUND,
      "Atividade não encontrada."
    );
  }
  if (activity.creatorId !== userId) {
    throw new HttpResponseError(
      HttpStatus.FORBIDDEN,
      "Apenas o criador da atividade pode editá-la."
    );
  }
  if (file && file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") {
    throw new HttpResponseError(
      HttpStatus.BAD_REQUEST,
      "A imagem deve ser um arquivo PNG ou JPG."
    );
  }
  const parsedData: any = { ...data };
  if (parsedData.address) {
    parsedData.address = JSON.parse(parsedData.address);
  }
  if (parsedData.private) {
    parsedData.private = parsedData.private == "true";
  }
  if (file) {
    const url = await uploadImage(file);
    parsedData.image = url;
  }
  return update(id, parsedData);
};

export const markActivityAsConcluded = async (id: string, userId: string) => {
  const activity = await getActivityById(id);
  if (!activity || activity.deletedAt) {
    throw new HttpResponseError(
      HttpStatus.NOT_FOUND,
      "Atividade não encontrada"
    );
  }

  if (activity.creatorId !== userId) {
    throw new HttpResponseError(
      HttpStatus.FORBIDDEN,
      "Apenas o criador da atividade pode concluí-la."
    );
  }

  if (activity.completedAt) {
    throw new HttpResponseError(
      HttpStatus.FORBIDDEN,
      "A atividade já foi concluída."
    );
  }

  const concluded = await checkIfConcludedAny(userId); 
  if (!concluded) {
    const achievement = await getAchievementByName(Achievements.AMBICIOSO);
    if (achievement) {
      const userAchievement = await getSingleUserAchievement(userId, achievement.id);
      if (!userAchievement) await grantAchievement(userId, achievement.id);
    }
  }

  await concludeActivity(id);
  return;
};

export const approveParticipant = async (
  activityId: string,
  data: ApproveParticipantData,
  userId: string
) => {
  const { participantId, approved } = approveParticipantSchema.parse(data);
  const activity = await getActivityById(activityId);

  if (!activity || activity.deletedAt) {
    throw new HttpResponseError(
      HttpStatus.NOT_FOUND,
      "Atividade não encontrada."
    );
  }

  if (activity.creatorId !== userId) {
    throw new HttpResponseError(
      HttpStatus.FORBIDDEN,
      "Apenas o criador da atividade pode aprovar ou negar participantes."
    );
  }
  const activityParticipant = await getActivityParticipant(
    activityId,
    participantId
  );
  if (!activityParticipant) {
    throw new HttpResponseError(
      HttpStatus.NOT_FOUND,
      "Participante não encontrado."
    );
  }

  if (activityParticipant.approved) {
    throw new HttpResponseError(
      HttpStatus.BAD_REQUEST,
      "Participante já aprovado."
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

  if (activity.completedAt) {
    throw new HttpResponseError(
      HttpStatus.FORBIDDEN,
      "Não é possível confirmar presença em uma atividade concluída."
    );
  }

  const activityParticipant = await getActivityParticipant(activityId, userId);
  if (!activityParticipant) {
    throw new HttpResponseError(
      HttpStatus.NOT_FOUND,
      "Participante não encontrado."
    );
  }

  if (activityParticipant.approved === false) {
    throw new HttpResponseError(
      HttpStatus.FORBIDDEN,
      "Apenas participantes aprovados na atividade podem fazer check-in."
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
      "Código de confirmação incorreto."
    );
  }
  
  const confirmed = await checkIfConfirmedAny(userId); 
  if (!confirmed) {
    const achievement = await getAchievementByName(Achievements.PIONEIRO);
    // verifica se ja tem o achievement
    if (achievement) {
      const userAchievement = await getSingleUserAchievement(userId, achievement.id);
      if (!userAchievement) await grantAchievement(userId, achievement.id);
    }
  }

  await checkIn(activityParticipant.id);
  const xp = process.env.DEFAULT_XP_PER_ACTIVITY ? parseInt(process.env.DEFAULT_XP_PER_ACTIVITY) : 100;
  // Adiciona xp para o usuarios que confirmou presença e para o criador da atividade
  await updateUserXpAndLevel(userId, xp);
  await updateUserXpAndLevel(activity.creatorId, xp);

  // veririfica o achievement de atingir level 5
  const user = await getUserService(userId);
  if (user.level >= 5) {
    const achievement = await getAchievementByName(Achievements.EXPLORADOR);
    if (achievement) {
      const userAchievement = await getSingleUserAchievement(userId, achievement.id);
      if (!userAchievement) await grantAchievement(userId, achievement.id);
    }
  }

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

  if (activityParticipant.confirmedAt) {
    throw new HttpResponseError(
      HttpStatus.BAD_REQUEST,
      "Não é possível cancelar sua inscrição, pois sua presença já foi confirmada."
    );
  }
  await unsubscribe(activityParticipant.id);
  return;
};

export const deleteActivityById = async (id: string, userId: string) => {
  const activity = await getActivityById(id);
  if (!activity || activity.deletedAt) {
    throw new HttpResponseError(
      HttpStatus.NOT_FOUND,
      "Atividade não encontrada."
    );
  }
  
  if (activity.creatorId !== userId) {
    throw new HttpResponseError(
      HttpStatus.FORBIDDEN,
      "Apenas o criador da atividade pode excluí-la."
    );
  }

  await deleteById(id);
  return;
};
