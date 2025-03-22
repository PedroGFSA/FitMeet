import { Request, Response} from 'express';
import { registerUser } from '../services/user-service';
import HttpStatus from '../enum/httpStatus';

export const register = async (req : Request, res : Response) => {
  try {
    await registerUser(req.body);
    res.status(HttpStatus.CREATED).json({ message: 'Usuário criado com sucesso.' });
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Erro inesperado' });
  }
}
