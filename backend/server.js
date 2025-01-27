const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const Room = require("./models/Room");
const User = require("./models/User");
const Message = require("./models/Message"); // Modèle pour les messages
const userRoutes = require("./routes/userRoutes");
const roomRoutes = require("./routes/roomRoutes");
const messageRoutes = require("./routes/messageRoutes");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000", // Origine du frontend
        methods: ["GET", "POST"],
    },
});

// Middlewares
app.use(cors());
app.use(express.json());

// Routes API
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/messages", messageRoutes);

// Connexion MongoDB
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connexion MongoDB réussie"))
    .catch((err) => console.error("Erreur MongoDB :", err.message));

// Gestion des connexions Socket.IO
io.on("connection", (socket) => {
    console.log(`Utilisateur connecté : ${socket.id}`);

    // Gestion des commandes
    socket.on("command", async (data) => {
        const { command, args, user } = data;
        console.log("Commande reçue :", command, "Arguments :", args);

        try {
            switch (command) {
                case "/nick":
                    if (args.length < 1) return socket.emit("error", "Usage : /nick new_username");
                    const oldUsername = user.username;
                    const newUsername = args[0];
                    const updatedUser = await User.findOneAndUpdate(
                        { username: oldUsername },
                        { username: newUsername },
                        { new: true }
                    );
                    if (updatedUser) {
                        user.username = newUsername;
                        socket.emit("nick_updated", newUsername);
                        console.log(`Pseudo changé pour : ${newUsername}`);
                    } else {
                        socket.emit("error", "Utilisateur introuvable");
                    }
                    break;

                case "/create":
                    if (args.length < 1) return socket.emit("error", "Usage : /create channel_name");
                    const channelName = args[0];
                    const existingRoom = await Room.findOne({ name: channelName });
                    if (existingRoom) return socket.emit("error", "Le canal existe déjà.");
                    const newRoom = new Room({ name: channelName, createdBy: user.username });
                    await newRoom.save();
                    socket.emit("channel_created", channelName);
                    console.log(`Canal créé : ${channelName}`);
                    break;

                case "/list":
                    const rooms = await Room.find();
                    socket.emit("room_list", rooms.map((room) => room.name));
                    break;

                case "/join":
                    if (args.length < 1) return socket.emit("error", "Usage : /join channel_name");
                    const joinChannel = args[0];
                    socket.join(joinChannel);
                    socket.emit("joined_channel", joinChannel);
                    socket.to(joinChannel).emit("user_joined", `${user.username} a rejoint ${joinChannel}`);
                    console.log(`Utilisateur ${user.username} a rejoint le canal ${joinChannel}`);
                    break;

                case "/leave":
                    if (args.length < 1) return socket.emit("error", "Usage : /leave channel_name");
                    const leaveChannel = args[0];
                    socket.leave(leaveChannel);
                    socket.emit("left_channel", leaveChannel);
                    socket.to(leaveChannel).emit("user_left", `${user.username} a quitté ${leaveChannel}`);
                    console.log(`Utilisateur ${user.username} a quitté le canal ${leaveChannel}`);
                    break;

                case "/msg":
                    if (args.length < 2) return socket.emit("error", "Usage : /msg username message_content");
                    const recipient = args[0];
                    const messageContent = args.slice(1).join(" ");
                    const privateChannel = `@${[user.username, recipient].sort().join("-")}`;
                    const message = await new Message({
                        sender: user.username,
                        recipient,
                        content: messageContent,
                        room: privateChannel,
                        type: "private",
                    }).save();
                    io.to(privateChannel).emit("receive_message", message);
                    console.log(`Message privé envoyé à ${recipient} : ${messageContent}`);
                    break;

                case "/users":
                    if (args.length < 1) return socket.emit("error", "Usage : /users channel_name");
                    const userChannel = args[0];
                    const channelUsers = await User.find({ channels: userChannel });
                    socket.emit("channel_users", channelUsers.map((u) => u.username));
                    break;

                case "/delete":
                    if (args.length < 1) return socket.emit("error", "Usage : /delete channel_name");
                    const channelToDelete = args[0];
                
                    // Suppression d'un canal public
                    if (!channelToDelete.startsWith("@")) {
                        const deletedRoom = await Room.findOneAndDelete({ name: channelToDelete });
                        if (deletedRoom) {
                            socket.emit("channel_deleted", channelToDelete);
                            io.to(channelToDelete).emit("channel_deleted", `Le canal ${channelToDelete} a été supprimé.`);
                            console.log(`Canal public supprimé : ${channelToDelete}`);
                        } else {
                            socket.emit("error", `Le canal public ${channelToDelete} n'existe pas.`);
                        }
                    } else {
                        // Suppression d'un canal privé (les canaux privés sont dynamiques, donc suppression logique seulement)
                        io.to(channelToDelete).emit("channel_deleted", `Le canal privé ${channelToDelete} a été supprimé.`);
                        console.log(`Canal privé supprimé : ${channelToDelete}`);
                    }
                    break;
                
                case "/help":
                    const helpMessage = `
                        Commandes disponibles :
                        /nick [new_username] - Change votre pseudonyme
                        /create [channel_name] - Crée un canal public
                        /delete [channel_name] - Supprime un canal public ou privé
                        /list - Liste tous les canaux publics
                        /join [channel_name] - Rejoindre un canal
                        /leave [channel_name] - Quitter un canal
                        /msg [username] [message] - Envoyer un message privé
                        /users [channel_name] - Liste les utilisateurs d'un canal
                        /help - Afficher cette aide
                    `;
                    socket.emit("help", helpMessage);
                    break;
                

                default:
                    socket.emit("error", `Commande inconnue : ${command}`);
                    break;
            }
        } catch (err) {
            console.error("Erreur lors de l'exécution de la commande :", err);
            socket.emit("error", "Erreur lors de l'exécution de la commande.");
        }
    });

    // Gestion de l'envoi de messages
    socket.on("send_message", async (data) => {
        const { sender, content, channel, type, recipient } = data;

        try {
            let message;

            if (type === "private") {
                const privateChannel = `@${[sender, recipient].sort().join("-")}`;
                socket.join(privateChannel);

                message = await new Message({
                    sender,
                    recipient,
                    content,
                    room: privateChannel,
                    type,
                }).save();

                io.to(privateChannel).emit("receive_message", message);
            } else if (type === "channel") {
                socket.join(channel);

                message = await new Message({
                    sender,
                    content,
                    room: channel,
                    type,
                }).save();

                io.to(channel).emit("receive_message", message);
            }

            console.log("Message envoyé :", message);
        } catch (error) {
            console.error("Erreur lors de l'envoi du message :", error.message);
        }
    });

    // Déconnexion
    socket.on("disconnect", () => {
        console.log(`Utilisateur déconnecté : ${socket.id}`);
    });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Serveur en écoute sur le port ${PORT}`));
