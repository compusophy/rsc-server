// Helper function to get secure WebSocket URL
window.getSecureWebSocketUrl = function(host, port) {
    // Default to secure WebSockets
    const protocol = window.location.protocol === 'http:' ? 'ws:' : 'wss:';
    
    // Use provided host or default
    const wsHost = host || window.serverAddress || 'shinkansen.proxy.rlwy.net';
    
    // Use provided port or default - Railway TCP Proxy port
    const wsPort = port || 55656;
    
    return `${protocol}//${wsHost}:${wsPort}`;
}; 