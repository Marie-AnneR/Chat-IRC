import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Appels pour les utilisateurs
export const fetchUsers = () => API.get('/users');
export const createUser = (userData) => API.post('/users', userData);

// Appels pour les salons
export const fetchRooms = () => API.get('/rooms');
export const createRoom = (roomData) => API.post('/rooms', roomData);

// Appels pour les messages
export const fetchMessages = (roomId) => API.get(`/messages/${roomId}`);
export const sendMessage = (messageData) => API.post('/messages', messageData);