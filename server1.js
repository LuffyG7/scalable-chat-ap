const cluster = require('cluster');
const os = require('os');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');

// Your existing app setup
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

if (cluster.isMaster) {
  const numCPUs = os.cpus().length;
  console.log(`Master ${process.pid} is running`);

  // Fork workers for each CPU
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    console.log('Forking a new worker');
    cluster.fork();
  });
} else {
  // Workers can share any TCP connection
  // In this case, it is an HTTP server
  io.on('connection', (socket) => {
    console.error(err);
    socket.on('chat-message', async (data) => {
      const { user, message } = data;
      const newMessage = new Message({ user, message });
      try {
        await newMessage.save();
        io.emit('chat-message', data);
      } catch (err) {
        console.error(err);
      }
    });
  });

  // Start the server
  server.listen(port, () => {
    console.log(`Worker ${process.pid} started on port ${port}`);
  });

  app.use(express.static('public'));
}