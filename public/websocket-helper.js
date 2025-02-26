// Helper function to get WebSocket URL
window.getSecureWebSocketUrl = function(host, port) {
    // Always use secure WebSockets when connecting from an HTTPS page
    const protocol = 'wss:';
    
    // Use provided host or default
    const wsHost = host || window.serverAddress || 'rsc-server-production.up.railway.app';
    
    // Don't use a port, use the /ws path instead
    return `${protocol}//${wsHost}/ws`;
}; 