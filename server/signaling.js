const { WebSocketServer } = require('ws');

const port = process.env.PORT || 8089;
const wss = new WebSocketServer({ port });

let rooms = [];
const clients = new Map();
// Таймеры на удаление комнат: roomId -> setTimeout object
const roomDeleteTimeouts = new Map();

console.log(`Signaling server started on port ${port}`);

const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', () => ws.isAlive = true);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'QUERY_ROOMS':
          ws.send(JSON.stringify({ type: 'ROOMS_LIST', rooms: getCleanRooms() }));
          break;

        case 'CREATE_ROOM':
        case 'JOIN':
          handleJoin(ws, data);
          break;

        case 'LEAVE':
          handleLeave(ws);
          break;

        case 'SIGNAL':
          broadcastToRoom(data.roomId, data, ws);
          break;
      }
    } catch (e) {
      console.error('Error handling message:', e);
    }
  });

  ws.on('close', () => handleLeave(ws));
});

function handleJoin(ws, data) {
  const { roomId, senderId, name } = data;
  let room = rooms.find(r => r.id === roomId);

  if (!room) {
    room = {
      id: roomId,
      name: name || `Room ${roomId}`,
      participants: new Set()
    };
    rooms.push(room);
  }

  // Если был запущен таймер удаления комнаты - отменяем его
  if (roomDeleteTimeouts.has(roomId)) {
    console.log(`Cancelling delete timeout for room ${roomId}`);
    clearTimeout(roomDeleteTimeouts.get(roomId));
    roomDeleteTimeouts.delete(roomId);
  }

  room.participants.add(senderId);
  clients.set(ws, { roomId, userId: senderId });
  
  // Отправляем ВСЕМ обновление комнаты
  broadcastRoomUpdate(room);
  // Отправляем вошедшему актуальный список (чтобы RoomPage точно нашел свою комнату)
  ws.send(JSON.stringify({ type: 'ROOMS_LIST', rooms: getCleanRooms() }));
  
  if (data.type === 'JOIN') {
    broadcastToRoom(roomId, { 
      type: 'SIGNAL', 
      roomId: roomId, 
      senderId: 'server', 
      data: { type: 'JOIN', senderId } 
    }, ws);
  }
}

function handleLeave(ws) {
  const clientInfo = clients.get(ws);
  if (!clientInfo) return;

  const { roomId, userId } = clientInfo;
  const room = rooms.find(r => r.id === roomId);
  
  clients.delete(ws);

  if (room) {
    // Проверяем, нет ли у этого пользователя других активных сокетов
    const hasOtherSockets = Array.from(clients.entries()).some(([socket, info]) => 
      info.userId === userId && info.roomId === roomId
    );

    if (!hasOtherSockets) {
      room.participants.delete(userId);
      console.log(`User ${userId} left room ${roomId}. Participants left: ${room.participants.size}`);

      if (room.participants.size === 0) {
        // Запускаем таймер на удаление комнаты (10 секунд)
        console.log(`Room ${roomId} is empty. Starting 10s delete timeout.`);
        const timeout = setTimeout(() => {
          rooms = rooms.filter(r => r.id !== roomId);
          roomDeleteTimeouts.delete(roomId);
          broadcast({ type: 'ROOMS_LIST', rooms: getCleanRooms() });
          console.log(`Room ${roomId} deleted after grace period.`);
        }, 10000);
        
        roomDeleteTimeouts.set(roomId, timeout);
      } else {
        broadcastRoomUpdate(room);
      }
    }
  }
}

function getCleanRooms() {
  return rooms.map(r => ({ id: r.id, name: r.name, participants: r.participants.size }));
}

function broadcastRoomUpdate(room) {
  broadcast({ 
    type: 'ROOM_UPDATED', 
    room: { id: room.id, name: room.name, participants: room.participants.size } 
  });
}

function broadcastToRoom(roomId, data, excludeWs) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(client => {
    const info = clients.get(client);
    if (client === excludeWs || client.readyState !== 1 || !info || info.roomId !== roomId) return;
    // Если указан targetId — слать только ему
    if (data.targetId && info.userId !== data.targetId) return;
    client.send(msg);
  });
}

function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(msg);
    }
  });
}
