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

userRouter.use(authGuard);

// Buscar dados do usuário
userRouter.get("/user", getUser);
// Buscar interesses do usuário
userRouter.get("/user/preferences", getUserPreferences);
// Definir interesses do usuário
userRouter.post("/user/preferences/define", defineUserPreferences);
// Editar foto de perfil do usuário
userRouter.put("/user/avatar", updateUserAvatar);
// Editar dados do usuário
userRouter.put("/user/update", updateUser);
// Desativar conta do usuário
userRouter.delete("/user/deactivate", deactivateUser);

export default userRouter;
