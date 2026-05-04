const { WebSocketServer } = require('ws');

const port = process.env.PORT || 8089;
const wss = new WebSocketServer({ port });

let rooms = [];
const clientRooms = new Map(); // ws -> roomId

console.log(`Signaling server started on port ${port}`);

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'QUERY_ROOMS':
          ws.send(JSON.stringify({ type: 'ROOMS_LIST', rooms }));
          break;

        case 'ROOM_CREATED':
          // При создании комнаты устанавливаем начальное кол-во 0 (оно увеличится при JOIN)
          const newRoom = { ...message.room, participantsCount: 0 };
          rooms.push(newRoom);
          broadcast(message);
          break;

        case 'ROOM_DELETED':
          rooms = rooms.filter(r => r.id !== message.roomId);
          broadcast(message);
          break;

        case 'SIGNAL':
          if (message.data && message.data.type === 'JOIN') {
            clientRooms.set(ws, message.roomId);
            updateParticipantCount(message.roomId, 1);
          }
          if (message.data && message.data.type === 'LEAVE') {
            handleDisconnect(ws);
          }
          broadcast(ws, message);
          break;

        default:
          broadcast(ws, message);
          break;
      }
    } catch (e) {
      console.error('Error processing message:', e);
    }
  });

  ws.on('close', () => {
    handleDisconnect(ws);
  });
});

function updateParticipantCount(roomId, delta) {
  const room = rooms.find(r => r.id === roomId);
  if (room) {
    room.participantsCount = Math.max(0, room.participantsCount + delta);
    console.log(`Room ${roomId} participants: ${room.participantsCount}`);
    
    if (room.participantsCount <= 0) {
      rooms = rooms.filter(r => r.id !== roomId);
      broadcast({ type: 'ROOM_DELETED', roomId });
    } else {
      broadcast({ type: 'ROOM_UPDATED', room });
    }
  }
}

function handleDisconnect(ws) {
  const roomId = clientRooms.get(ws);
  if (roomId) {
    clientRooms.delete(ws);
    updateParticipantCount(roomId, -1);
  }
}

function broadcast(sender, message) {
  if (!message) {
    message = sender;
    sender = null;
  }
  const payload = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client !== sender && client.readyState === 1) {
      client.send(payload);
    }
  });
}
