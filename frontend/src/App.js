import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:5000'); // Adresse de votre backend

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Écoute les messages entrants
    socket.on('receive_message', (newMessage) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.tempId === newMessage.tempId
            ? { ...msg, status: 'sent' }
            : msg
        )
      );
    });

    // Nettoyage à la fin
    return () => socket.off('receive_message');
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      const timestamp = new Date().toISOString(); // Obtenir la date et l'heure actuelles
      const tempId = `${timestamp}-${Math.random()}`; // ID temporaire unique
      const newMessage = {
        text: message,
        timestamp,
        status: 'sending',
        tempId,
      };

      // Ajouter le message au state avec le statut "sending"
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      // Envoyer le message au backend
      socket.emit('send_message', newMessage, (ack) => {
        if (!ack) {
          // Si le backend ne confirme pas, marquer comme "failed"
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.tempId === tempId ? { ...msg, status: 'failed' } : msg
            )
          );
        }
      });

      setMessage(''); // Réinitialiser le champ d'entrée
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>IRC Chat</h1>
        <div className="chat-container">
          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className="message">
                <div className="message-text">{msg.text}</div>
                <div className="message-meta">
                  <span className="timestamp">{formatDate(msg.timestamp)}</span>
                  <span className={`status ${msg.status}`}>
                    {msg.status === 'sending' && '⏳'}
                    {msg.status === 'sent' && '✔️'}
                    {msg.status === 'failed' && '❌'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="input-container">
            <input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
