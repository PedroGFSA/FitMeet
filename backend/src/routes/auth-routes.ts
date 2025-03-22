import { Router } from "express";
import { register, handleSignIn} from "../controllers/auth-controller";

const authRouter = Router();

authRouter.post("/auth/register", register);
authRouter.post("/auth/sign-in", handleSignIn);

export default authRouter;