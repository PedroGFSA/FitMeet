import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import HttpStatus from "../enum/httpStatus";
import HttpResponseError from "../errors/HttpResponseError";
import { ZodError } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const errorHandler: ErrorRequestHandler = (error: unknown, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof HttpResponseError) {
    res.status(error.statusCode).json({ error: error.message });
  } else if (error instanceof ZodError) {
    res.status(HttpStatus.BAD_REQUEST).json({ error: "Informe os campos obrigatórios corretamente." });
  } else if (error instanceof PrismaClientKnownRequestError) {
    res.status(HttpStatus.BAD_REQUEST).json({  error: error})
  } else if (error instanceof Error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro inesperado." });
  } else {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: "Erro inesperado." });
  }
  next();
}

export default errorHandler;