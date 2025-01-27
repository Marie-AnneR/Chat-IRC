import React, { useState } from "react";
import socket from "../utils/socket";

const CommandInput = ({ user, currentChannel, setCurrentChannel }) => {
    const [command, setCommand] = useState("");
    const [privateChannels, setPrivateChannels] = useState("");

    // Fonction pour gérer les commandes
    const handleCommand = () => {
        if (command.trim()) {
            const [cmd, ...args] = command.split(" ");
            if (cmd === "/msg" && args.length >= 2) {
                const recipient = args[0];
                const content = args.slice(1).join(" ");
                const privateChannel = `@${[user.username, recipient].sort().join("-")}`;
    
                // Ajoute le canal privé si nécessaire
                if (!privateChannels.includes(privateChannel)) {
                    setPrivateChannels((prev) => [...prev, privateChannel]);
                }
    
                // Émet un message privé via Socket.IO
                socket.emit("send_message", {
                    sender: user.username,
                    recipient,
                    content,
                    type: "private",
                });
    
                setCurrentChannel(privateChannel); // Change le canal actif
            } else {
                socket.emit("command", { command: cmd, args, user });
            }
            setCommand("");
        }
    };
    

    // Gestion de la saisie et de l'envoi
    const handleSend = () => {
        if (command.trim()) {
            handleCommand(command);
            setCommand(""); // Réinitialise la saisie
        }
    };

    return (
        <div className="p-4">
            <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Tapez une commande ou un message..."
                className="w-full px-4 py-2 border rounded"
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
        </div>
    );
};

export default CommandInput;
