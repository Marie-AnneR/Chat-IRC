import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import handleCommand from '../components/CommandInput'; 
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Assure-toi que cette URL est correcte

const ChatPage = ({ user }) => {
    const [currentChannel, setCurrentChannel] = useState('management');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/messages/channel/${currentChannel}`);
                setMessages(res.data);
            } catch (err) {
                console.error('Erreur lors de la récupération des messages :', err.message);
            }
        };

        fetchMessages();

        socket.emit('join_room', currentChannel);

        socket.on('receive_message', (message) => {
            console.log('Message reçu côté frontend :', message);
            setMessages((prev) => [...prev, message]); // Ajoute le message reçu
        });

        return () => {
            socket.emit('leave_room', currentChannel);
            socket.off('receive_message');
        };
    }, [currentChannel]);

    const handleMessageSend = (msg) => {
        console.log('Message envoyé côté frontend :', msg);
        socket.emit('send_message', msg);
    };
    const handleCommandWrapper = (command) => {
        handleCommand(command, user, currentChannel, setCurrentChannel);
    };
    
    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar user={user} currentChannel={currentChannel} onChannelSelect={setCurrentChannel} />
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
    );
};

export default ChatPage;