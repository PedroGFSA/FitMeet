import { Request, Response } from 'express';
import { getUserService, getUserPreferencesService, defineUserPreferencesService, updateUserAvatarService, updateUserService, deactivateUserService} from '../services/user-service';
import HttpStatus from '../enum/httpStatus';

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await getUserService(req.userId);
    res.status(HttpStatus.OK).json(user);    
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
  };
}

export const getUserPreferences = async (req: Request, res: Response) => {
  try {
    const preferences = await getUserPreferencesService(req.userId);
    res.status(HttpStatus.OK).json(preferences);
  } catch (error: unknown) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
  }
}

export const defineUserPreferences = async (req: Request, res: Response) => {
  try {
    await defineUserPreferencesService(req.userId, req.body);
    res.status(HttpStatus.OK).json({ message: "Preferências atualizadas com sucesso." });
  } catch (error) {
    if ( error instanceof Error ) {
      res.status(HttpStatus.BAD_REQUEST).json({ error: "Um ou mais IDs informados não são válidos" });
    }
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
  }
  return;
}

export const updateUserAvatar = async (req: Request, res: Response) => {
  try {
    const user = await updateUserAvatarService(req.userId, req.body);
    res.status(HttpStatus.OK).json(user);
  } catch (error) {
    if ( error instanceof Error ) {
      res.status(HttpStatus.BAD_REQUEST).json({ error: "A imagem informada não é válida" });
    }
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
  }
  return;
}

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await updateUserService(req.userId, req.body);
    res.status(HttpStatus.OK).json(user);
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
  }
}

export const deactivateUser = async (req: Request, res: Response) => {
  try {
    const user = await deactivateUserService(req.userId);
    res.status(HttpStatus.OK).json({ message: "Conta desativada com sucesso." });
  } catch (error) {
    if (error instanceof Error) {
      res.status(HttpStatus.FORBIDDEN).json({ error: error.message });
    }
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
  }
}