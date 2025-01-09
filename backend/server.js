const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connecte MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes de test
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Port et démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});