import { Request, Response } from "express";
import { registerUser } from "../services/user-service";
import { signIn } from "../services/auth-service";
import HttpStatus from "../enum/httpStatus";
import asyncWrapper from "../utils/async-wrapper";

export const register = asyncWrapper(async (req: Request, res: Response) => {
  await registerUser(req.body);
  res
    .status(HttpStatus.CREATED)
    .json({ message: "Usuário criado com sucesso." });
  return;
});

export const handleSignIn = asyncWrapper(
  async (req: Request, res: Response) => {
    const token = await signIn(req.body);
    res.status(HttpStatus.OK).json(token);
  }
);
