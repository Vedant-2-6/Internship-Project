const express = require('express');
const cors = require('cors');
require('dotenv').config();

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

// Sync database and start server
sequelize.sync().then(() => {
  console.log('Database synced');
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});