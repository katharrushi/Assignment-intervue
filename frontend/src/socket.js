import { io } from "socket.io-client";

// Use environment variable or fallback to localhost for development
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// Check if we're in production (Vercel sets NODE_ENV to production)
const isProduction = import.meta.env.PROD;

console.log('Socket configuration:', {
    BACKEND_URL,
    isProduction,
    env: import.meta.env.MODE
});

const socket = io(BACKEND_URL, {
    transports: ['polling'], // Start with polling only for better compatibility
    upgrade: false, // Disable upgrade to websocket for now
    rememberUpgrade: false,
    timeout: 30000,
    forceNew: false,
    reconnection: true,
    reconnectionDelay: 2000,
    reconnectionAttempts: 15, // More attempts
    maxReconnectionAttempts: 15,
    autoConnect: true,
    randomizationFactor: 0.5,
    reconnectionDelayMax: 10000, // Increased max delay
    // Add withCredentials for CORS
    withCredentials: true,
    // Add extra headers
    extraHeaders: {
        "Access-Control-Allow-Credentials": "true"
    }
}); 

// Test CORS connectivity before socket connection
const testCORS = async () => {
    try {
        const response = await fetch(`${BACKEND_URL}/api/cors-test`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('CORS test successful:', data);
            return true;
        } else {
            console.error('CORS test failed:', response.status, response.statusText);
            return false;
        }
    } catch (error) {
        console.error('CORS test error:', error);
        return false;
    }
};

// Test CORS on load
testCORS();

// Debug connection events
socket.on('connect', () => {
    console.log('Connected to server:', socket.id);
    console.log('Transport:', socket.io.engine.transport.name);
    console.log('Backend URL:', BACKEND_URL);
});

socket.on('disconnect', (reason) => {
    console.log('Disconnected:', reason);
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
    console.log('Trying to connect to:', BACKEND_URL);
    console.log('Available transports:', socket.io.opts.transports);
    
    // Test CORS again on connection error
    setTimeout(() => {
        console.log('Testing CORS after connection error...');
        testCORS();
    }, 1000);
});

socket.io.on('upgrade', () => {
    console.log('Upgraded to transport:', socket.io.engine.transport.name);
});

socket.io.on('upgradeError', (error) => {
    console.log('Upgrade error (falling back to polling):', error.message);
});

// Add reconnection logging
socket.io.on('reconnect', (attemptNumber) => {
    console.log('Reconnected after', attemptNumber, 'attempts');
});

socket.io.on('reconnect_attempt', (attemptNumber) => {
    console.log('Reconnection attempt', attemptNumber);
});

socket.io.on('reconnect_error', (error) => {
    console.log('Reconnection error:', error.message);
});

socket.io.on('reconnect_failed', () => {
    console.log('Reconnection failed - max attempts reached');
});

export default socket;
