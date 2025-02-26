const Server = require('./server');
const bole = require('bole');

(async () => {
    bole.output({
        level: 'debug',
        stream: {
            write: (buffer) => console.log(buffer.toString())
        }
    });

    addEventListener('message', async (e) => {
        switch (e.data.type) {
            case 'start': {
                const server = new Server(e.data.config);
                await server.init();
                postMessage({ type: 'ready' });

                break;
            }
        }
    });
})();

function getSecureWebSocketUrl(host = null, port = null) {
    // Always use secure WebSockets when connecting from an HTTPS page
    const protocol = 'wss:';
    
    // Use provided host or default
    const wsHost = host || 'rsc-server-production.up.railway.app';
    
    // Don't use a port, use the /ws path instead
    return `${protocol}//${wsHost}/ws`;
}
