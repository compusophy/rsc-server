const fs = require('fs').promises;

async function loadConfig(configPath) {
    // Load config from file with no environment variable overrides
    const fileConfig = JSON.parse(await fs.readFile(configPath));
    return fileConfig;
}

module.exports = { loadConfig }; 