import { Request, Response, NextFunction } from "express"
import jwt from 'jsonwebtoken';
import HttpStatus from "../enum/httpStatus";
import { getUserService } from "../services/user-service";

const secret = process.env.JWT_SECRET!;

declare module 'express-serve-static-core' {
  interface Request {
    userId: string
  }
}

export const authGuard = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Autenticação necessária.' });
    return; 
  }

  const token = authHeader.split(' ')[1];

  try {
    const user = jwt.verify(token, secret) as { id: string, deletedAt: Date | null };
    // Não verificado pelo token, pois se usuário for desativado depois de gerar o token, o deletedAt permanece null 
    const { deletedAt } = await getUserService(user.id) as { deletedAt: Date | null };
    if (deletedAt) {
      res.status(HttpStatus.FORBIDDEN).json({ message: "Esta conta foi desativada e não pode ser utilizada." });
      return;
    }
    req.userId = user.id;
    next();
  } catch (error : unknown) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Autenticação necessária.' });
    return;
  }
}