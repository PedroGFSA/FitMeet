import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import swagger from 'swagger-ui-express';
import docs from '../swagger.json';
import userRouter from './routes/user-routes';
import authRouter from './routes/auth-routes';
import activitiesRouter from './routes/activities-routes';
import errorHandler from './middlewares/error-handler';
import { createBucket } from './connection/s3-client';
import { uploadDefaultImages } from './utils/uploadDefaultImages';

dotenv.config();

const server = express(); 
const port = process.env.PORT || 3333;

server.use(express.json());
server.use(cors())

server.use('/docs', swagger.serve, swagger.setup(docs));
server.use(authRouter);
server.use(userRouter);
server.use(activitiesRouter);

server.use(errorHandler);

const start = async () => {
  await createBucket()
  await uploadDefaultImages();
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

start();