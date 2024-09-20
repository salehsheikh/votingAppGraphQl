// server.js
import express from 'express';
import mongoose from 'mongoose';
import http from 'http';
import { graphqlHTTP } from 'express-graphql';
import schema from './controller/schema.js';
import { Server as SocketIO } from 'socket.io';
import cors from 'cors';
import Poll from './model/poll.js';

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server, {
  cors: { origin: '*' },
});

app.use(cors());
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true, // Enable GraphiQL
}));

// MongoDB connection
mongoose.connect('mongodb://localhost/pollingApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('vote', async (pollId) => {
    const poll = await Poll.findById(pollId);
    io.emit('pollUpdated', poll);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(5000, () => {
  console.log('Server running on port 5000');
});
