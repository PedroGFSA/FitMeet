import { Request, Response } from "express";
import { getActivities, getAll as getEveryActivity } from "../services/activities-service";
import HttpStatus from "../enum/httpStatus";

export const getActivitiesPaginated = async (req: Request, res: Response) => {
  try {
    const params = req.query as { skip: string, take: string, typeId?: string, orderBy?: string, order?: string };
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
  return
}