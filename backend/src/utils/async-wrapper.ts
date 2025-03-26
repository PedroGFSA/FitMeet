import { Request, Response, NextFunction } from 'express';

type asyncController = ( 
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

const asyncWrapper = (controller : asyncController): asyncController => {
  return async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      next(error);
    }
  }
} 

export default asyncWrapper;