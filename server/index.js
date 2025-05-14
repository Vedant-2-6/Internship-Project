const express = require('express');
const cors = require('cors');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const sequelize = require('./config/database');
const User = require('./models/User');
const Note = require('./models/Note');
const Collaborator = require('./models/Collaborator');
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const adminUsersRoutes = require('./routes/adminUsers');
const collaboratorRoutes = require('./routes/collaborator');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/collaborators', collaboratorRoutes);

// Placeholder route
app.get('/', (req, res) => {
  res.send('Notes API is running!');
});

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust as needed for security
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a note room for real-time updates
  socket.on('joinNote', (noteId) => {
    socket.join(`note_${noteId}`);
  });

  // Broadcast note changes to collaborators
  socket.on('noteUpdated', ({ noteId, data }) => {
    socket.to(`note_${noteId}`).emit('noteUpdated', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Sync database and start server
sequelize.sync().then(() => {
  console.log('Database synced');
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});