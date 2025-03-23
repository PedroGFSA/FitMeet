import { Request, Response, NextFunction } from "express"
import jwt from 'jsonwebtoken';
import HttpStatus from "../enum/httpStatus";

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
    const user = jwt.verify(token, secret) as { id: string };
    req.userId = user.id;
    next();
  } catch (error : unknown) {
    res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Autenticação necessária. Token inválido.' });
    return;
  }
}