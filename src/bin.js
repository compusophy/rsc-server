#!/usr/bin/env node

// For local development only, not needed in production
if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config();
  } catch (e) {
    console.log('No .env file found, using default environment');
  }
}

// Rest of your imports and code
const process = require('process');
const Server = require('./server');
const bole = require('bole');
const fs = require('fs').promises;
const pkg = require('../package');
const yargs = require('yargs');
const { connectToDataServer } = require('./data-client');
const { loadConfig } = require('./config');

const log = require('bole')('bin');

const argv = yargs
    .scriptName('rsc-server')
    .alias('h', 'help')
    .option('c', {
        alias: 'config',
        type: 'string',
        describe: 'use a specific config.json file',
        default: './config.json'
    })
    .option('v', {
        alias: 'verbose',
        type: 'string',
        describe: 'the logging verbosity level',
        default: 'info',
        choices: ['debug', 'info', 'warn', 'error']
    })
    .version(pkg.version).argv;

bole.output({
    level: argv.verbose,
    stream: process.stdout
});

(async () => {
    let config;

    try {
        config = await loadConfig(argv.config);
    } catch (e) {
        process.exitCode = 1;
        log.error(e);
        return;
    }

    const server = new Server(config);
    await server.init();

    // Use environment variables with fallbacks
    const port = process.env.PORT || 9002;
    const tcpPort = process.env.TCP_PORT || 43594;
    const websocketPort = process.env.WEBSOCKET_PORT || 43595;

    // Start your server
    const tcpServer = startTCPServer(tcpPort);
    const wsServer = startWebSocketServer(websocketPort);

    // Connect to data server
    const dataClient = connectToDataServer();

    // Your server logic here...

    function startTCPServer(port) {
        // TCP server logic
        console.log(`TCP server listening on port ${port}`);
    }

    function startWebSocketServer(port) {
        // WebSocket server logic
        console.log(`WebSocket server listening on port ${port}`);
    }
})();
