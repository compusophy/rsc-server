const fs = require('fs').promises;

async function loadConfig(configPath) {
    // Load base config from file
    const fileConfig = JSON.parse(await fs.readFile(configPath));
    
    // Override with environment variables if available
    return {
        ...fileConfig,
        dataServerTCP: process.env.DATA_SERVER_HOST 
            ? `${process.env.DATA_SERVER_HOST}:${process.env.DATA_SERVER_PORT}` 
            : fileConfig.dataServerTCP,
        dataServerPassword: process.env.DATA_SERVER_PASSWORD || fileConfig.dataServerPassword,
        port: process.env.PORT ? parseInt(process.env.PORT) : fileConfig.port,
        tcpPort: process.env.TCP_PORT ? parseInt(process.env.TCP_PORT) : fileConfig.tcpPort,
        websocketPort: process.env.WEBSOCKET_PORT ? parseInt(process.env.WEBSOCKET_PORT) : fileConfig.websocketPort
    };
}

module.exports = { loadConfig }; 