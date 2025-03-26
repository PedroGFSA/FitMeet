import { Request, Response } from "express";
import {
  getUserService,
  getUserPreferencesService,
  defineUserPreferencesService,
  updateUserAvatarService,
  updateUserService,
  deactivateUserService,
} from "../services/user-service";
import HttpStatus from "../enum/httpStatus";
import asyncWrapper from "../utils/async-wrapper";

export const getUser = asyncWrapper(async (req: Request, res: Response) => {
  const user = await getUserService(req.userId);
  res.status(HttpStatus.OK).json(user);
});

export const getUserPreferences = asyncWrapper(
  async (req: Request, res: Response) => {
    const preferences = await getUserPreferencesService(req.userId);
    res.status(HttpStatus.OK).json(preferences);
  }
);

export const defineUserPreferences = asyncWrapper(
  async (req: Request, res: Response) => {
    await defineUserPreferencesService(req.userId, req.body);
    res
      .status(HttpStatus.OK)
      .json({ message: "Preferências atualizadas com sucesso." });
    return;
  }
);

export const updateUserAvatar = asyncWrapper(
  async (req: Request, res: Response) => {
    const user = await updateUserAvatarService(req.userId, req.body);
    res.status(HttpStatus.OK).json(user);
  }
);

export const updateUser = asyncWrapper(async (req: Request, res: Response) => {
  const user = await updateUserService(req.userId, req.body);
  res.status(HttpStatus.OK).json(user);
});

export const deactivateUser = asyncWrapper(
  async (req: Request, res: Response) => {
    const user = await deactivateUserService(req.userId);
    res
      .status(HttpStatus.OK)
      .json({ message: "Conta desativada com sucesso." });
  }
);
