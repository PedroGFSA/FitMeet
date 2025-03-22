import { Request, Response } from "express";
import { registerUser } from "../services/user-service";
import { signIn } from "../services/auth-service";
import HttpStatus from "../enum/httpStatus";

export const register = async (req: Request, res: Response) => {
  try {
    await registerUser(req.body);
    res
      .status(HttpStatus.CREATED)
      .json({ message: "Usuário criado com sucesso." });
    return;
  } catch (error) {
    if (error instanceof Error) {
      res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
      return; 
    }
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: "Erro inesperado" });
    return;
  }
};

export const handleSignIn = async (req: Request, res: Response) => {
  try {
    const token = await signIn(req.body);
    res.status(HttpStatus.OK).json(token);
  } catch (error : unknown) {
    if (error instanceof Error) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: error.message });
      return;
    }
    res.status(HttpStatus.UNAUTHORIZED).json({ message: "Erro inesperado." });
    return; 
  }
};
