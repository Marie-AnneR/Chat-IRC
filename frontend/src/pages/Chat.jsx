import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import handleCommand from '../components/CommandInput';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const Chat = ({ user }) => {
    const [currentChannel, setCurrentChannel] = useState('management'); // Canal actif
    const [messages, setMessages] = useState([]); // Messages du canal actif
    const [publicChannels, setPublicChannels] = useState([]); // Canaux publics
    const [privateChannels, setPrivateChannels] = useState([]); // Canaux privés dynamiques

    // Charge les canaux publics et privés au chargement de l'utilisateur
    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/users/${user.username}/channels`);
                setPublicChannels(res.data.publicChannels); // Canaux publics
                setPrivateChannels(res.data.privateChannels); // Canaux privés
            } catch (err) {
                console.error('Erreur lors de la récupération des canaux :', err.message);
            }
        };

        fetchChannels();
    }, [user]);

    // Gestion des messages en fonction du canal actif
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const endpoint = currentChannel.startsWith('@')
                    ? `http://localhost:5000/api/messages/private/${user.username}/${currentChannel.slice(1)}`
                    : `http://localhost:5000/api/messages/channel/${currentChannel}`;
                const res = await axios.get(endpoint);
                setMessages(res.data);
            } catch (err) {
                console.error('Erreur lors de la récupération des messages :', err.message);
            }
        };
    
        fetchMessages();
    
        socket.emit('join_room', currentChannel);
    
        socket.on('receive_message', (message) => {
            if (message.type === 'private') {
                const privateChannel = `@${message.sender === user.username ? message.recipient : message.sender}`;
                if (!privateChannels.includes(privateChannel)) {
                    setPrivateChannels((prev) => [...prev, privateChannel]);
                }
            }
            setMessages((prev) => [...prev, message]);
        });
    
        return () => {
            socket.emit('leave_room', currentChannel);
            socket.off('receive_message');
        };
    }, [currentChannel, privateChannels]);
    
    const handleMessageSend = (msg) => {
        socket.emit('send_message', msg);
    };

    const handleCommandWrapper = (command) => {
        const [cmd, ...args] = command.split(' ');
        if (cmd === '/msg' && args.length >= 2) {
            const recipient = args[0];
            const messageContent = args.slice(1).join(' ');
            const privateChannel = `@${recipient}`;

            if (!privateChannels.includes(privateChannel)) {
                setPrivateChannels((prev) => [...prev, privateChannel]);
            }

            socket.emit('send_message', {
                sender: user.username,
                recipient,
                content: messageContent,
                type: 'private',
            });
            alert(`Message privé envoyé à ${recipient}`);
        } else {
            handleCommand(command, user, currentChannel, setCurrentChannel);
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