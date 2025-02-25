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
    // Always use secure WebSockets for secure pages
    const protocol = 'wss:';
    
    // Use provided host or default
    const wsHost = host || 'rsc-server-production.up.railway.app';
    
    // Use provided port or default
    const wsPort = port || 43595;
    
    return `${protocol}//${wsHost}:${wsPort}`;
}
