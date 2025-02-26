// Helper function to get WebSocket URL
window.getSecureWebSocketUrl = function(host, port) {
    // Use the appropriate protocol based on the page's protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    // Use provided host or default
    const wsHost = host || window.serverAddress || 'rsc-server-production.up.railway.app';
    
    // Don't use a port, use the /ws path instead
    return `${protocol}//${wsHost}/ws`;
}; 