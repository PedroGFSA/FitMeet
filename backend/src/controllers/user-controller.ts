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

export const getUserPreferences = (req: Request, res: Response) => {
  try {
    const preferences = getUserPreferencesService(req.params.id);
    res.status(HttpStatus.OK).json(preferences);
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
  }
}

export const defineUserPreferences = (req: Request, res: Response) => {
  try {
    const preferences = defineUserPreferencesService(req.params.id, req.body);
    res.status(HttpStatus.OK).json(preferences);
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
  }
}

export const updateUserAvatar = (req: Request, res: Response) => {
  try {
    const user = updateUserAvatarService(req.params.id, req.body.avatar);
    res.status(HttpStatus.OK).json(user);
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
  }
}

export const updateUser = (req: Request, res: Response) => {
  try {
    const user = updateUserService(req.params.id, req.body);
    res.status(HttpStatus.OK).json(user);
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
  }
}

export const deactivateUser = (req: Request, res: Response) => {
  try {
    const user = deactivateUserService(req.params.id);
    res.status(HttpStatus.NO_CONTENT).json(user);
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
  }
}