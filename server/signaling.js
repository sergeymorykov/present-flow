const { WebSocketServer } = require('ws');

const port = process.env.PORT || 8089;
const wss = new WebSocketServer({ port });

let rooms = [];
const clientRooms = new Map(); // ws -> roomId

console.log(`Signaling server started on port ${port}`);

// Механизм Keep-alive (Heartbeat)
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      console.log('Client not responding, terminating...');
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      // console.log('Received:', data.type, 'from', ws._socket.remoteAddress);

      switch (data.type) {
        case 'QUERY_ROOMS':
          ws.send(JSON.stringify({ type: 'ROOMS_LIST', rooms }));
          break;

        case 'CREATE_ROOM':
          const newRoom = {
            id: data.roomId,
            name: data.name,
            participants: 1
          };
          rooms.push(newRoom);
          clientRooms.set(ws, data.roomId);
          broadcast({ type: 'ROOMS_LIST', rooms });
          break;

        case 'JOIN':
          const roomToJoin = rooms.find(r => r.id === data.roomId);
          if (roomToJoin) {
            roomToJoin.participants++;
            clientRooms.set(ws, data.roomId);
            broadcast({ type: 'ROOM_UPDATED', room: roomToJoin });
            broadcast({ type: 'SIGNAL', roomId: data.roomId, senderId: 'server', data: { type: 'JOIN', senderId: data.senderId } });
          }
          break;

        case 'SIGNAL':
          // Пробрасываем сигнал другим участникам в той же комнате
          wss.clients.forEach(client => {
            if (client !== ws && client.readyState === 1) {
              client.send(JSON.stringify(data));
            }
          });
          break;
      }
    } catch (e) {
      console.error('Error handling message:', e);
    }
  });

  ws.on('close', () => {
    const roomId = clientRooms.get(ws);
    if (roomId) {
      const room = rooms.find(r => r.id === roomId);
      if (room) {
        room.participants--;
        if (room.participants <= 0) {
          rooms = rooms.filter(r => r.id !== roomId);
          broadcast({ type: 'ROOMS_LIST', rooms });
        } else {
          broadcast({ type: 'ROOM_UPDATED', room });
        }
      }
      clientRooms.delete(ws);
    }
  });
});

wss.on('close', () => {
  clearInterval(interval);
});

function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(msg);
    }
  });
}
