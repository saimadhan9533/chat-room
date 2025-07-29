const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  const filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  const contentType = ext === '.js' ? 'text/javascript' : 'text/html';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Server Error');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

const wss = new WebSocket.Server({ server });

let rooms = {};

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    const { type, payload } = data;

    if (type === 'join') {
      const { room, username } = payload;
      ws.username = username;
      ws.room = room;

      if (!rooms[room]) rooms[room] = new Set();
      rooms[room].add(ws);

      broadcast(room, `${username} joined the room`);
    }

    if (type === 'chat') {
      broadcast(ws.room, `${ws.username}: ${payload.message}`);
    }
  });

  ws.on('close', () => {
    if (ws.room && rooms[ws.room]) {
      rooms[ws.room].delete(ws);
      broadcast(ws.room, `${ws.username} left the room`);
    }
  });
});

function broadcast(room, message) {
  if (!rooms[room]) return;
  rooms[room].forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});