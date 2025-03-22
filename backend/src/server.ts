import express from 'express';
import dotenv from 'dotenv';
import userRouter from './routes/user-routes';
import authRouter from './routes/auth-routes';

dotenv.config();

const server = express(); 
const port = process.env.PORT || 3000;

server.use(express.json());

server.use(authRouter);
server.use(userRouter);

const start = () => {
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

start();