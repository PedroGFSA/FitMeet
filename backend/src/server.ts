import express from 'express';
import dotenv from 'dotenv';
import userRouter from './routes/user-routes';
import authRouter from './routes/auth-routes';
import activitiesRouter from './routes/activities-routes';
import errorHandler from './middlewares/error-handler';
import { createBucket } from './connection/s3-client';
dotenv.config();

const server = express(); 
const port = process.env.PORT || 3000;

server.use(express.json());

server.use(authRouter);
server.use(userRouter);
server.use(activitiesRouter);

server.use(errorHandler);

const start = async () => {
  await createBucket()
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

start();