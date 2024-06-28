
const express = require('express'); 
const mongoose = require('mongoose'); 
const http = require('http');
const socketIo = require('socket.io'); 
const bodyParser = require('body-parser'); 

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server); 

// Server configuration
const port = process.env.PORT || 3001; 
const mongoUri = 'mongodb://127.0.0.1:27017/scalable-chat-app'; // MongoDB URI


app.use(bodyParser.json()); 

// Connect to MongoDB
async function connectToMongo() {
  try {
    await mongoose.connect(mongoUri, {
      //useNewUrlParser: true,
      //useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB', err);
    setTimeout(connectToMongo, 5000); // Retry connection after 5 seconds if it fails
  }
}

connectToMongo(); 

// Define Message schema and model for storing chat messages
const messageSchema = new mongoose.Schema({
  user: String,
  message: String
}, { timestamps: true }); 

const Message = mongoose.model('Message', messageSchema); 

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html'); 
});

// Handle Socket.IO connections
io.on('connection', async (socket) => {
  console.log('A user connected');
  try {
    const messages = await Message.find({}).exec(); 
    socket.emit('output-messages', messages); 
  } catch (err) {
    console.error(err);
  }

  // Listen for chat-message events from clients
  socket.on('chat-message', async (data) => {
    const { user, message } = data; 
    const newMessage = new Message({ user, message }); 
    try {
      await newMessage.save(); 
      io.emit('chat-message', data); // Broadcast the message 
    } catch (err) {
      console.error(err);
    }
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
app.use(express.static('public'));

