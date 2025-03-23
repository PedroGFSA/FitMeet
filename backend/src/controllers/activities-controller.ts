import { Request, Response } from "express";
import { getActivities, getAll as getEveryActivity, getAllActivityTypes, getCreatedByUser, getAllCreatedByUser,
  getActivitiesUserIsParticipant, getAllActivitiesUserIsParticipant, getAllParticipantsByActivityId, createActivity
 } from "../services/activities-service";
import HttpStatus from "../enum/httpStatus";

export const getActivityTypes = async (req: Request, res: Response) => {
  try {
    const types = await getAllActivityTypes();
    res.status(HttpStatus.OK).json(types);
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Erro inesperado." });
  }
  return;
}

export const getActivitiesPaginated = async (req: Request, res: Response) => {
  try {
    const params = req.query as { page: string, pageSize: string, typeId?: string, orderBy?: string, order?: string };
    const activities = await getActivities(params);
    res.status(HttpStatus.OK).json(activities);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Erro inesperado." });
  }
  return
} 

export const getAllActivities = async (req: Request, res: Response) => {
  try {
    const activities = await getEveryActivity(req.query);
    res.status(HttpStatus.OK).json(activities);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Erro inesperado." });
  }
  return;
}

export const getActivitiesCreatedByUser = async (req: Request, res: Response) => {
  try {
    const { page = "1", pageSize = "10" } = req.query as { page?: string, pageSize?: string };
    const data = { id: req.userId, page, pageSize};
    const activities = await getCreatedByUser(data);
    res.status(HttpStatus.OK).json(activities);
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Erro inesperado." });
  }
  return;
}

export const getAllActivitiesCreatedByUser = async (req: Request, res: Response) => {
  try {
    const activities = await getAllCreatedByUser(req.userId);
    res.status(HttpStatus.OK).json(activities);
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Erro inesperado." });
  }
  return;
}

export const getActivitiesUserParticipant = async (req: Request, res: Response) => {
  try {
    const { page = "1", pageSize = "10" } = req.query as { page?: string, pageSize?: string };
    const data = { id: req.userId, page, pageSize};
    const activities = await getActivitiesUserIsParticipant(data);
    res.status(HttpStatus.OK).json(activities);
  } catch (error) {
    if (error instanceof Error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Erro inesperado." });
  }
  return;
}

export const getAllActivitiesUserParticipant = async (req: Request, res: Response) => {
  try {
    const activities = await getAllActivitiesUserIsParticipant(req.userId);
    res.status(HttpStatus.OK).json(activities);
  } catch (error) {
    if (error instanceof Error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Erro inesperado." });
  }
  return;
}

export const getAllActivityParticipants = async (req: Request, res: Response) => {
  try {
    const activityId = req.params.id;
    const participants = await getAllParticipantsByActivityId(activityId);
    res.status(HttpStatus.OK).json(participants);
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Erro inesperado." });
  }
  return;
}

export const createNewActivity = async (req: Request, res: Response) => {
  try {
    const activity = await createActivity(req.userId, req.body);
    res.status(HttpStatus.CREATED).json(activity);
  } catch (error) {
    if (error instanceof Error) {
      console.log(error)
      res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
    }
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Erro inesperado." });
  }
  return;
}