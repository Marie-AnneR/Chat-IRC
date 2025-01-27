import React from "react";

const MessageList = ({ messages, user }) => {
    console.log("Messages à afficher :", messages); // Log pour débogage

    if (!messages || messages.length === 0) {
        return (
            <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4">
                <p className="text-gray-500 text-center">Aucun message pour l'instant.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => {
                // Vérifie que le message a toutes les données nécessaires
                if (!msg.content || !msg.sender) {
                    console.warn("Message incomplet ignoré :", msg);
                    return null;
                }

                const isOwnMessage = msg.sender === user.username;
                const formattedDate = msg.createdAt
                    ? new Date(msg.createdAt).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                      })
                    : "Date inconnue";

                return (
                    <div
                        key={index}
                        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-xs p-4 rounded-lg shadow-md ${
                                isOwnMessage
                                    ? "bg-indigo-600 text-white self-end"
                                    : "bg-gray-200 text-gray-800 self-start"
                            }`}
                        >
                            <p className="font-bold">{!isOwnMessage && msg.sender}</p>
                            <p>{msg.content}</p>
                            <p className="text-xs text-gray-500 mt-2 text-right">{formattedDate}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MessageList;