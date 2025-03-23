import { Router } from "express";
import {
  deactivateUser,
  defineUserPreferences,
  getUser,
  getUserPreferences,
  updateUser,
  updateUserAvatar,
} from "../controllers/user-controller";
import { authGuard } from "../middlewares/auth-guard";

const userRouter = Router();

userRouter.get("/user", authGuard, getUser);
// Buscar interesses do usuário
userRouter.get("/user/preferences", authGuard, getUserPreferences);
// Definir interesses do usuário
userRouter.post("/user/preferences/define", authGuard, defineUserPreferences);
// Editar foto de perfil do usuário
userRouter.put("/user/avatar", authGuard, updateUserAvatar);
// Editar dados do usuário
userRouter.put("/user/update", authGuard, updateUser);
// Desativar conta do usuário
userRouter.delete("/user/deactivate", authGuard, deactivateUser);

export default userRouter;
