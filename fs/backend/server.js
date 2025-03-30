const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const server = http.createServer((req, res) => {
    let filePath = req.url === '/' ? "https://dashing-brigadeiros-f9f16e.netlify.app/" : req.url;
    
    // Favicon का error रोकने के लिए
    if (req.url === '/favicon.ico') {
        res.writeHead(204);
        return res.end();
    }

    filePath = path.join(__dirname, filePath);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Page not found');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        }
    });
});

const wss = new WebSocket.Server({ server });

let clients = {};

wss.on('connection', (ws) => {
    const clientId = Math.random().toString(36).substr(2, 9);
    clients[clientId] = ws;

    console.log(`New client connected: ${clientId}`);

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        const targetClient = Object.keys(clients).find(id => id !== clientId);

        if (targetClient && clients[targetClient] && clients[targetClient].readyState === WebSocket.OPEN) {
            clients[targetClient].send(JSON.stringify(data));
        }
    });

    ws.on('close', () => {
        delete clients[clientId];
        console.log(`Client disconnected: ${clientId}`);
    });
});

server.listen(3000, () => {
    console.log('Server is running at http://localhost:3000');
});
