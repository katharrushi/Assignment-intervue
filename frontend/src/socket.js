import { io } from "socket.io-client";

// Use environment variable or fallback to localhost for development
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// Check if we're in production (Vercel sets NODE_ENV to production)
const isProduction = import.meta.env.PROD;

const socket = io(BACKEND_URL, {
    transports: isProduction ? ['polling'] : ['polling', 'websocket'], // Force polling in production
    upgrade: !isProduction, // Only allow upgrade in development
    rememberUpgrade: false, // Don't remember upgrade for better reliability
    timeout: 30000, // Increased timeout
    forceNew: false, // Don't force new connection
    reconnection: true,
    reconnectionDelay: 2000, // Increased delay
    reconnectionAttempts: 10, // More attempts
    maxReconnectionAttempts: 10,
    // Additional options for Render compatibility
    autoConnect: true,
    randomizationFactor: 0.5,
    reconnectionDelayMax: 5000
}); 

// Debug connection events
socket.on('connect', () => {
    console.log('✅ Connected to server:', socket.id);
    console.log('Transport:', socket.io.engine.transport.name);
    console.log('Backend URL:', BACKEND_URL);
});

socket.on('disconnect', (reason) => {
    console.log('❌ Disconnected:', reason);
});

socket.on('connect_error', (error) => {
    console.error('🔴 Connection error:', error);
    console.log('Trying to connect to:', BACKEND_URL);
    console.log('Available transports:', socket.io.opts.transports);
});

socket.io.on('upgrade', () => {
    console.log('⬆️ Upgraded to transport:', socket.io.engine.transport.name);
});

socket.io.on('upgradeError', (error) => {
    console.log('⚠️ Upgrade error (falling back to polling):', error.message);
});

// Add reconnection logging
socket.io.on('reconnect', (attemptNumber) => {
    console.log('🔄 Reconnected after', attemptNumber, 'attempts');
});

socket.io.on('reconnect_attempt', (attemptNumber) => {
    console.log('🔄 Reconnection attempt', attemptNumber);
});

socket.io.on('reconnect_error', (error) => {
    console.log('❌ Reconnection error:', error.message);
});

socket.io.on('reconnect_failed', () => {
    console.log('❌ Reconnection failed - max attempts reached');
});

export default socket;
