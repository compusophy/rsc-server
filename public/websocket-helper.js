// Helper function to get secure WebSocket URL
window.getSecureWebSocketUrl = function(host, port) {
    // Always use secure WebSockets
    const protocol = 'wss:';
    
    // Use provided host or default
    const wsHost = host || window.serverAddress || 'rsc-server-production.up.railway.app';
    
    // Use provided port or default
    const wsPort = port || 43595;
    
    return `${protocol}//${wsHost}:${wsPort}`;
}; 