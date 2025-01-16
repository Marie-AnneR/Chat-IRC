import React, { useState } from 'react';

const MessageInput = ({ user, channel, onMessageSend, onCommand }) => {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim()) {
            if (message.startsWith('/')) {
                // Gérer une commande
                onCommand(message.trim());
            } else {
                // Envoyer un message normal
                onMessageSend({
                    sender: user.username,
                    channel,
                    content: message.trim(),
                    type: 'channel',
                });
            }
            setMessage(''); // Réinitialise le champ d’entrée
        }
    };

    return (
        <div className="p-4 bg-gray-200 flex items-center">
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tapez un message ou une commande..."
                className="flex-grow p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
                onClick={handleSend}
                className="ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
                Envoyer
            </button>
        </div>
    );
};

export default MessageInput;