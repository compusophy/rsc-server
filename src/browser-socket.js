const { EventEmitter } = require('events');

class BrowserSocket extends EventEmitter {
    constructor(id, ip = null) {
        super();
        this.id = id;
        
        // Use the provided IP or a default that works with Railway
        // This ensures the socket uses the correct remote address
        this.remoteAddress = ip || (typeof window !== 'undefined' && window.serverAddress) || 
                             'rsc-server-production.up.railway.app';
    }

    write(data) {
        postMessage({
            id: this.id,
            type: 'data',
            data
        });
    }

    connect() {}

    destroy() {}

    end() {}

    setKeepAlive() {}

    setTimeout() {}
}

module.exports = BrowserSocket; 