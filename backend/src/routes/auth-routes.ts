import { Router } from "express";
import { register } from "../controllers/auth-controller";

const authRouter = Router();

authRouter.post("/auth/register", register);
authRouter.post("/auth/sign-in", (req, res) => {});

export default authRouter;