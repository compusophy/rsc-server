const BrowserSocket = require('./browser-socket');

const DataClient = process.browser
    ? require('./browser-data-client')
    : require('./data-client');

const RSCSocket = require('@2003scape/rsc-socket');
const World = require('./model/world');
const log = require('bole')('server');
const net = require('net');
const packetHandlers = require('./packet-handlers');
const toBuffer = process.browser ? require('typedarray-to-buffer') : undefined;
const ws = require('ws');

class Server {
    constructor(config) {
        this.config = config;
        this.isBrowser = !!process.browser;

        this.world = new World(this);
        this.dataClient = new DataClient(this);

        this.incomingMessages = new Map();
        this.outgoingMessages = [];

        if (process.browser) {
            this.browserSockets = {};
        }
    }

    loadPacketHandlers() {
        this.handlers = {};

        for (const file of Object.keys(packetHandlers)) {
            const handlers = packetHandlers[file];

            for (const handlerName of Object.keys(handlers)) {
                this.handlers[handlerName] = handlers[handlerName];
            }
        }
    }

    handleConnection(socket) {
        socket = new RSCSocket(socket);
        socket.setTimeout(5000);
        socket.server = this;

        this.incomingMessages.set(socket, []);

        socket.on('error', (err) => log.error(err));
        socket.on('timeout', () => socket.close());

        socket.on('message', async (message) => {
            if (
                !socket.player &&
                !/register|login|session|closeConnection/.test(message.type)
            ) {
                log.warn(`${socket} sending ${message.type} before login`);
                socket.close();
                return;
            }

            const queue = this.incomingMessages.get(socket);
            //const messagesSent = queue.length;

            log.debug(`incoming message from ${socket}`, message);
            queue.push(message);

            if (queue.length >= 10) {
                queue.shift();
            }
        });

        socket.on('close', async () => {
            if (socket.player) {
                if (socket.player.loggedIn) {
                    await socket.player.logout();
                }

                delete socket.player;
                delete socket.server;
            }

            socket.removeAllListeners();
            this.incomingMessages.delete(this);
            log.info(`${socket} disconnected`);
        });

        log.info(`${socket} connected`);
    }

    bindTCP() {
        this.tcpServer = new net.Server();

        this.tcpServer.on('error', (err) => log.error(err));

        this.tcpServer.on('connection', (socket) => {
            this.handleConnection(socket);
        });

        return new Promise((resolve, reject) => {
            this.tcpServer.once('error', reject);

            this.tcpServer.once('listening', () => {
                this.tcpServer.removeListener('error', reject);
                log.info(`listening for TCP connections on port ${port}`);
                resolve();
            });

            const port = this.config.tcpPort;
            this.tcpServer.listen({ port });
        });
    }

    bindWebSocket() {
        const port = this.config.websocketPort; // This should be 43595 internally
        
        // Configure WebSocket server to work with Railway's proxy
        const options = {
            port,
            // This allows the server to work behind a proxy that terminates SSL
            perMessageDeflate: {
                zlibDeflateOptions: {
                    // Required for Railway's proxy
                    finishFlush: require('zlib').Z_SYNC_FLUSH
                }
            }
        };
        
        this.websocketServer = new ws.Server(options);
        this.websocketServer.on('error', (err) => log.error(err));
        
        this.websocketServer.on('connection', (socket, req) => {
            // Log the connection details to help with debugging
            log.info(`WebSocket connection from ${req.socket.remoteAddress}`);
            
            // Check for secure connection
            const isSecure = req.headers['x-forwarded-proto'] === 'https';
            log.info(`Connection is ${isSecure ? 'secure' : 'not secure'}`);
            
            this.handleConnection(socket);
        });
        
        log.info(`listening for websocket connections on port ${port} (exposed via Railway TCP Proxy at shinkansen.proxy.rlwy.net:55656)`);
    }

    bindWebWorker() {
        addEventListener('message', (e) => {
            switch (e.data.type) {
                case 'connect': {
                    const browserSocket = new BrowserSocket(e.data.id);
                    this.browserSockets[browserSocket.id] = browserSocket;
                    this.handleConnection(browserSocket);
                    break;
                }
                case 'disconnect': {
                    const browserSocket = this.browserSockets[e.data.id];
                    browserSocket.emit('close', false);
                    delete this.browserSockets[browserSocket.id];
                    break;
                }
                case 'data': {
                    const browserSocket = this.browserSockets[e.data.id];
                    browserSocket.emit('data', toBuffer(e.data.data));
                    break;
                }
            }
        });
    }

    readMessages() {
        for (const [socket, queue] of this.incomingMessages) {
            for (const message of queue) {
                const handler = this.handlers[message.type];

                if (!handler) {
                    log.warn(`${socket} no handler for type ${message.type}`);
                    continue;
                }

                handler(socket, message).catch((e) => {
                    log.error(e, socket.toString());
                });
            }

            queue.length = 0;
        }
    }

    sendMessages() {
        while (this.outgoingMessages.length) {
            const { socket, message } = this.outgoingMessages.shift();
            socket.sendMessage(message);
        }
    }

    async init() {
        try {
            await this.dataClient.init();

            await this.world.loadData();
            this.world.tick();

            this.loadPacketHandlers();

            if (this.isBrowser) {
                this.bindWebWorker();
                postMessage({ type: 'ready' });
            } else {
                await this.bindTCP();
                this.bindWebSocket();
            }
        } catch (e) {
            console.error(e);
            log.error(e);
            process.exit(1);
        }
    }
}

module.exports = Server;
