import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
    transports: ["websocket"],
    withCredentials: true, // Si le backend utilise des cookies
});

export default socket;