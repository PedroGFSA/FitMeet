import { Request, Response } from "express";
import {
  getActivities,
  getAll as getEveryActivity,
  getAllActivityTypes,
  getCreatedByUser,
  getAllCreatedByUser,
  getActivitiesUserIsParticipant,
  getAllActivitiesUserIsParticipant,
  getAllParticipantsByActivityId,
  createActivity,
  subToActivity,
  updateActivityById,
  markActivityAsConcluded,
  approveParticipant,
  checkInParticipant,
  unsubscribeFromActivity,
  deleteActivityById,
} from "../services/activities-service";
import HttpStatus from "../enum/httpStatus";
import asyncWrapper from "../utils/async-wrapper";

export const getActivityTypes = asyncWrapper(
  async (req: Request, res: Response) => {
    const types = await getAllActivityTypes();
    res.status(HttpStatus.OK).json(types);
    return;
  }
);

export const getActivitiesPaginated = asyncWrapper(
  async (req: Request, res: Response) => {
    const params = req.query as {
      page: string;
      pageSize: string;
      typeId?: string;
      orderBy?: string;
      order?: string;
    };
    const activities = await getActivities(params, req.userId);
    res.status(HttpStatus.OK).json(activities);
    return;
  }
);

export const getAllActivities = asyncWrapper(
  async (req: Request, res: Response) => {
    const activities = await getEveryActivity(req.query, req.userId);
    res.status(HttpStatus.OK).json(activities);
    return;
  }
);

export const getActivitiesCreatedByUser = asyncWrapper(
  async (req: Request, res: Response) => {
    const { page = "1", pageSize = "10" } = req.query as {
      page?: string;
      pageSize?: string;
    };
    const data = { id: req.userId, page, pageSize };
    const activities = await getCreatedByUser(data);
    res.status(HttpStatus.OK).json(activities);
    return;
  }
);

export const getAllActivitiesCreatedByUser = asyncWrapper(
  async (req: Request, res: Response) => {
    const activities = await getAllCreatedByUser(req.userId);
    res.status(HttpStatus.OK).json(activities);
    return;
  }
);

export const getActivitiesUserParticipant = asyncWrapper(
  async (req: Request, res: Response) => {
    const { page = "1", pageSize = "10" } = req.query as {
      page?: string;
      pageSize?: string;
    };
    const data = { id: req.userId, page, pageSize };
    const activities = await getActivitiesUserIsParticipant(data);
    res.status(HttpStatus.OK).json(activities);
    return;
  }
);

export const getAllActivitiesUserParticipant = asyncWrapper(
  async (req: Request, res: Response) => {
    const activities = await getAllActivitiesUserIsParticipant(req.userId);
    res.status(HttpStatus.OK).json(activities);
    return;
  }
);

export const getAllActivityParticipants = asyncWrapper(
  async (req: Request, res: Response) => {
    const activityId = req.params.id;
    const participants = await getAllParticipantsByActivityId(activityId);
    res.status(HttpStatus.OK).json(participants);
    return;
  }
);

export const createNewActivity = asyncWrapper(
  async (req: Request, res: Response) => {
    const activity = await createActivity(req.userId, req.body, req.file);
    res.status(HttpStatus.CREATED).json(activity);
    return;
  }
);

export const subscribeToActivity = asyncWrapper(
  async (req: Request, res: Response) => {
    const activityId = req.params.id;
    const response = await subToActivity(req.userId, activityId);
    res.status(HttpStatus.OK).json(response);
    return;
  }
);

export const updateActivity = asyncWrapper(
  async (req: Request, res: Response) => {
    const activityId = req.params.id;
    const response = await updateActivityById(activityId, req.body, req.file);
    res.status(HttpStatus.OK).json(response);
    return;
  }
);

export const concludeActivity = asyncWrapper(
  async (req: Request, res: Response) => {
    const activityId = req.params.id;
    await markActivityAsConcluded(activityId);
    res
      .status(HttpStatus.OK)
      .json({ message: "Atividade concluída com sucesso." });
    return;
  }
);

export const approveParticipantForActivity = asyncWrapper(
  async (req: Request, res: Response) => {
    const activityId = req.params.id;
    await approveParticipant(activityId, req.body);
    res
      .status(HttpStatus.OK)
      .json({ message: "Solicitação de participação aprovada com sucesso." });
    return;
  }
);

export const checkInForActivity = asyncWrapper(
  async (req: Request, res: Response) => {
    const activityId = req.params.id;
    const userId = req.userId;
    await checkInParticipant(activityId, userId, req.body);
    res
      .status(HttpStatus.OK)
      .json({ message: "Participação confirmada com sucesso." });
    return;
  }
);

export const unsubscribeToActivity = asyncWrapper(
  async (req: Request, res: Response) => {
    const activityId = req.params.id;
    const userId = req.userId;
    const something = await unsubscribeFromActivity(activityId, userId);
    res
      .status(HttpStatus.OK)
      .json({ message: "Participação cancelada com sucesso." });
    return;
  }
);

export const deleteActivity = asyncWrapper(
  async (req: Request, res: Response) => {
    const activityId = req.params.id;
    await deleteActivityById(activityId);
    res
      .status(HttpStatus.OK)
      .json({ message: "Atividade deletada com sucesso." });
    return;
  }
);
