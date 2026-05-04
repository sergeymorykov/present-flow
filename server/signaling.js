const { WebSocketServer } = require('ws');

const port = process.env.PORT || 8089;
const wss = new WebSocketServer({ port });

// Храним объекты комнат: { id, name, participants: Set([userId1, userId2]) }
let rooms = [];
// Карта для быстрого поиска: ws -> { roomId, userId }
const clients = new Map();

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
          // Отправляем список комнат с количеством уникальных участников
          const roomList = rooms.map(r => ({ id: r.id, name: r.name, participants: r.participants.size }));
          ws.send(JSON.stringify({ type: 'ROOMS_LIST', rooms: roomList }));
          break;

        case 'CREATE_ROOM':
          // Если комната уже есть, просто заходим в нее
          let room = rooms.find(r => r.id === data.roomId);
          if (!room) {
            room = {
              id: data.roomId,
              name: data.name,
              participants: new Set([data.senderId])
            };
            rooms.push(room);
          } else {
            room.participants.add(data.senderId);
          }
          clients.set(ws, { roomId: data.roomId, userId: data.senderId });
          broadcastRoomUpdate(room);
          break;

        case 'JOIN':
          const targetRoom = rooms.find(r => r.id === data.roomId);
          if (targetRoom) {
            targetRoom.participants.add(data.senderId);
            clients.set(ws, { roomId: data.roomId, userId: data.senderId });
            broadcastRoomUpdate(targetRoom);
            // Уведомляем других о входе (для WebRTC)
            broadcastToRoom(data.roomId, { 
              type: 'SIGNAL', 
              roomId: data.roomId, 
              senderId: 'server', 
              data: { type: 'JOIN', senderId: data.senderId } 
            }, ws);
          }
          break;

        case 'SIGNAL':
          // Пересылаем сигнал всем, кроме отправителя
          broadcastToRoom(data.roomId, data, ws);
          break;
      }
    } catch (e) {
      console.error('Error handling message:', e);
    }
  });

  ws.on('close', () => {
    const clientInfo = clients.get(ws);
    if (clientInfo) {
      const { roomId, userId } = clientInfo;
      const room = rooms.find(r => r.id === roomId);
      if (room) {
        // Важно: мы не удаляем пользователя из Set сразу, 
        // чтобы дать ему пару секунд на переподключение, 
        // ИЛИ проверяем, нет ли у него другого открытого сокета.
        
        // Проверяем, есть ли у этого же пользователя другие активные сокеты
        const hasOtherSockets = Array.from(clients.entries()).some(([socket, info]) => 
          socket !== ws && socket.readyState === 1 && info.userId === userId && info.roomId === roomId
        );

        if (!hasOtherSockets) {
          room.participants.delete(userId);
          if (room.participants.size === 0) {
            rooms = rooms.filter(r => r.id !== roomId);
            broadcast({ type: 'ROOMS_LIST', rooms: rooms.map(r => ({ id: r.id, name: r.name, participants: r.participants.size })) });
          } else {
            broadcastRoomUpdate(room);
          }
        }
      }
      clients.delete(ws);
    }
  });
});

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
    if (client !== excludeWs && client.readyState === 1 && info && info.roomId === roomId) {
      client.send(msg);
    }
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
