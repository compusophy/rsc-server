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
    // Use the appropriate protocol based on the page's protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    // Use provided host or default
    const wsHost = host || 'rsc-server-production.up.railway.app';
    
    // Don't use a port, use the /ws path instead
    return `${protocol}//${wsHost}/ws`;
}
