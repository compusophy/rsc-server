#!/usr/bin/env node

// Import all dependencies first
const Server = require('./server');
const bole = require('bole');
const fs = require('fs').promises;
const pkg = require('../package');
const process = require('process');
const yargs = require('yargs');
const DataClient = require('./data-client');
const { connectToDataServer } = DataClient;
const { loadConfig } = require('./config');

// Now it's safe to use process
// Only load dotenv in non-production environments
if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config();
  } catch (e) {
    console.log('No .env file found, using default environment');
  }
}

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
        log.info('Configuration loaded successfully');
        log.debug('Config:', config);
    } catch (e) {
        process.exitCode = 1;
        log.error('Failed to load configuration:', e);
        return;
    }

    try {
        const server = new Server(config);
        await server.init();
        log.info('Server initialized successfully');
    } catch (e) {
        process.exitCode = 1;
        log.error('Failed to initialize server:', e);
    }
})().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
