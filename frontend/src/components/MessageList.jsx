import React from 'react';

const MessageList = ({ messages, user }) => {
    return (
        <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => {
                const isOwnMessage = msg.sender === user.username;
                return (
                    <div
                        key={index}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xs p-4 rounded-lg shadow-md ${
                                isOwnMessage
                                    ? 'bg-indigo-600 text-white self-end'
                                    : 'bg-gray-200 text-gray-800 self-start'
                            }`}
                        >
                            <p className="font-bold">{!isOwnMessage && msg.sender}</p>
                            <p>{msg.content}</p>
                            <p className="text-xs text-white-500 mt-2 text-right">
                                {new Date(msg.createdAt).toLocaleString('fr-FR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MessageList;