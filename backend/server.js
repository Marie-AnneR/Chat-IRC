const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const Message = require('./models/Message'); // Modèle pour les messages
require('dotenv').config();

const app = express();
const server = http.createServer(app);


const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000', // Origine du frontend
        methods: ['GET', 'POST'],
    },
});
// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes); // Définit les routes utilisateurs
app.use('/api/rooms', require('./routes/roomRoutes')); // Définit les routes des canaux
app.use('/api/messages', require('./routes/messageRoutes')); // Définit les routes des messages


// Connexion MongoDB
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connexion MongoDB réussie'))
    .catch((err) => console.error('Erreur MongoDB :', err.message));

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
    console.log('Utilisateur connecté :', socket.id);

    // Rejoindre un canal
    socket.on('join_room', (channel) => {
        socket.join(channel);
        console.log(`Utilisateur rejoint le canal : ${channel}`);
    });

    // Envoi de message
    socket.on('send_message', async (data) => {
        console.log('Message reçu côté serveur :', data);
        try {
            const { sender, channel, content, type } = data;

            // Sauvegarde dans MongoDB
            const message = new Message({ sender, room: channel, content, type });
            const savedMessage = await message.save();

            // Diffuse le message à tous les membres du canal
            io.to(channel).emit('receive_message', savedMessage);
            console.log('Message diffusé :', savedMessage);
        } catch (err) {
            console.error('Erreur lors de l’enregistrement du message :', err.message);
        }
    });

    // Déconnexion
    socket.on('disconnect', () => {
        console.log('Utilisateur déconnecté :', socket.id);
    });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Serveur en écoute sur le port ${PORT}`));