import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const Chat = ({ user }) => {
    const [currentChannel, setCurrentChannel] = useState("management"); // Canal actif
    const [messages, setMessages] = useState([]); // Messages du canal actif
    const [publicChannels, setPublicChannels] = useState([]); // Canaux publics
    const [privateChannels, setPrivateChannels] = useState([]); // Canaux privés dynamiques

    // **1. Chargement des canaux au démarrage**
    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:5000/api/users/${user.username}/channels`
                );
                setPublicChannels(res.data.publicChannels);
                setPrivateChannels(res.data.privateChannels);
            } catch (err) {
                console.error("Erreur lors de la récupération des canaux :", err.message);
            }
        };

        fetchChannels();
    }, [user.username]);

    // **2. Gestion des messages et des événements Socket.IO**
    useEffect(() => {
        const fetchMessages = async () => {
            const endpoint = currentChannel.startsWith("@")
                ? `http://localhost:5000/api/messages/private/${user.username}/${currentChannel.slice(1)}`
                : `http://localhost:5000/api/messages/channel/${currentChannel}`;

            try {
                const response = await axios.get(endpoint);
                setMessages(response.data);
                console.log("Messages initiaux chargés :", response.data);
            } catch (error) {
                console.error("Erreur lors de la récupération des messages :", error);
            }
        };

        fetchMessages();

        // Rejoindre le canal
        socket.emit("join_channel", currentChannel);

        // Écoute des messages en temps réel
        const handleReceiveMessage = (message) => {
            console.log("Message reçu :", message);

            if (message.type === "private") {
                const privateChannel = `@${[message.sender, message.recipient]
                    .sort()
                    .join("-")}`;

                if (!privateChannels.includes(privateChannel)) {
                    setPrivateChannels((prev) => [...prev, privateChannel]);
                }

                if (currentChannel === privateChannel) {
                    setMessages((prev) => [...prev, message]);
                }
            } else if (currentChannel === message.room) {
                setMessages((prev) => [...prev, message]);
            }
        };

        socket.on("receive_message", handleReceiveMessage);

        return () => {
            socket.emit("leave_channel", currentChannel);
            socket.off("receive_message", handleReceiveMessage);
        };
    }, [currentChannel]);

    // **3. Écoute des commandes Socket.IO**
    useEffect(() => {
        const handleNickUpdated = (newUsername) => {
            alert(`Votre pseudonyme a été changé en ${newUsername}`);
            user.username = newUsername;
        };

        const handleChannelCreated = (channelName) => {
            alert(`Canal créé : ${channelName}`);
            setPublicChannels((prev) => [...prev, channelName]);
        };

        const handleChannelDeleted = (channelName) => {
            alert(`Le canal ${channelName} a été supprimé.`);
            setPublicChannels((prev) => prev.filter((ch) => ch !== channelName));
            setPrivateChannels((prev) => prev.filter((ch) => ch !== channelName));

            if (currentChannel === channelName) {
                setCurrentChannel("management"); // Revenir au canal par défaut
            }
        };

        socket.on("nick_updated", handleNickUpdated);
        socket.on("channel_created", handleChannelCreated);
        socket.on("channel_deleted", handleChannelDeleted);
        socket.on("room_list", (rooms) => alert(`Canaux disponibles :\n${rooms.join("\n")}`));
        socket.on("help", (commands) => alert(commands));
        socket.on("error", (message) => alert(`Erreur : ${message}`));

        return () => {
            socket.off("nick_updated", handleNickUpdated);
            socket.off("channel_created", handleChannelCreated);
            socket.off("channel_deleted", handleChannelDeleted);
            socket.off("room_list");
            socket.off("help");
            socket.off("error");
        };
    }, []);

    // **4. Gestion de l'envoi de messages**
    const handleMessageSend = (msg) => {
        console.log("Message envoyé :", msg);
        socket.emit("send_message", msg);
    };

    // **5. Gestion des commandes**
    const handleCommandWrapper = (command) => {
        const [cmd, ...args] = command.trim().split(" ");
        console.log("Commande envoyée :", cmd, "Arguments :", args);

        if (cmd === "/msg" && args.length >= 2) {
            const recipient = args[0];
            const content = args.slice(1).join(" ");
            const privateChannel = `@${[user.username, recipient].sort().join("-")}`;

            if (!privateChannels.includes(privateChannel)) {
                setPrivateChannels((prev) => [...prev, privateChannel]);
            }

            socket.emit("send_message", {
                sender: user.username,
                recipient,
                content,
                type: "private",
            });

            setCurrentChannel(privateChannel);
        } else {
            socket.emit("command", { command: cmd, args, user });
        }
    };

    return (
        <div className="flex h-screen bg-gradient-to-r from-violet-200 to-pink-200 pt-10 pb-10">
            <div className="container mx-auto flex flex-col lg:flex-row h-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
                <Sidebar
                    user={user}
                    currentChannel={currentChannel}
                    onChannelSelect={setCurrentChannel}
                    publicChannels={publicChannels}
                    privateChannels={privateChannels}
                />
                <div className="flex flex-col flex-grow bg-white shadow-md">
                    <MessageList messages={messages} user={user} />
                    <MessageInput
                        user={user}
                        channel={currentChannel}
                        onMessageSend={handleMessageSend}
                        onCommand={handleCommandWrapper}
                    />
                </div>
            </div>
        </div>
    );
};

export default Chat;
