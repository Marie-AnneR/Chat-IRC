import React from 'react';

const MessageList = ({ messages, user }) => {
    return (
        <div className="flex-grow overflow-y-auto p-4">
            {messages.map((msg, index) => (
                <p
                    key={index}
                    className={user && msg.sender === user.username ? 'my-message' : ''}
                >
                    <strong>{msg.sender}:</strong> {msg.content}
                </p>
            ))}
        </div>
    );
};

export default MessageList;