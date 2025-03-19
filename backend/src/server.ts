import express from 'express';

const server = express(); 

server.use('/hello', (req, res) => {
  res.send('Hello World!');
})

const start = () => {
  server.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
}

start();