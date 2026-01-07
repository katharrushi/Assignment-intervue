import { io } from "socket.io-client";

// Use environment variable or fallback to localhost for development
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const socket = io(BACKEND_URL, {
    transports: ['websocket', 'polling'],
    upgrade: true,
    rememberUpgrade: true,
    timeout: 20000,
    forceNew: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    maxReconnectionAttempts: 5
}); 

// Debug connection events
socket.on('connect', () => {
    console.log('✅ Connected to server:', socket.id);
    console.log('Transport:', socket.io.engine.transport.name);
});

socket.on('disconnect', (reason) => {
    console.log('❌ Disconnected:', reason);
});

socket.on('connect_error', (error) => {
    console.error('🔴 Connection error:', error);
});

socket.io.on('upgrade', () => {
    console.log('⬆️ Upgraded to transport:', socket.io.engine.transport.name);
});

export default socket;
