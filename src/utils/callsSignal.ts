/**
 * Синхронизация звонков через WebSocket.
 */

export interface RoomInfo {
  id: string;
  name: string;
  participants: number;   // Поле от сервера
}

export type SignalMessage =
  | { type: 'QUERY_ROOMS' }
  | { type: 'CREATE_ROOM'; roomId: string; name: string; senderId: string }
  | { type: 'JOIN'; roomId: string; senderId: string }
  | { type: 'LEAVE'; roomId: string; senderId: string }
  | { type: 'ROOMS_LIST'; rooms: RoomInfo[] }
  | { type: 'ROOM_UPDATED'; room: RoomInfo }
  | { type: 'ROOM_DELETED'; roomId: string }
  | { type: 'SIGNAL'; roomId: string; senderId: string; targetId?: string; data: any };

class CallsSignal {
  private socket: WebSocket | null = null;
  private listeners: ((msg: SignalMessage) => void)[] = [];
  private myId = Math.random().toString(36).substr(2, 9);
  private reconnectTimer: any = null;
  // Запоминаем, в какой комнате сейчас пользователь, для переподключения
  private currentRoomId: string | null = null;

  constructor() {
    this.connect();
  }

  private connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const isProd = import.meta.env.PROD;
    const wsUrl = isProd
      ? `${protocol}//${window.location.host}/ws/`
      : `${protocol}//${window.location.hostname}:8089`;

    try {
      console.log('Connecting to:', wsUrl);
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('Connected to signaling server');
        // Сразу запрашиваем список комнат
        this.sendRaw({ type: 'QUERY_ROOMS' });
        // Если мы были в комнате до переподключения — переотправляем JOIN
        if (this.currentRoomId) {
          console.log('Rejoining room after reconnect:', this.currentRoomId);
          this.sendRaw({ type: 'JOIN', roomId: this.currentRoomId, senderId: this.myId });
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.listeners.forEach(l => l(msg));
        } catch (e) {
          console.error('Error parsing WS message', e);
        }
      };

      this.socket.onclose = () => {
        console.log('Disconnected from signaling server, reconnecting...');
        this.reconnect();
      };

      this.socket.onerror = (err) => {
        console.error('WebSocket error', err);
        this.socket?.close();
      };
    } catch (e) {
      console.error('Failed to connect to WebSocket', e);
      this.reconnect();
    }
  }

  private reconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 3000);
  }

  private sendRaw(msg: object) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(msg));
    }
  }

  subscribe(listener: (msg: SignalMessage) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  send(msg: SignalMessage) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(msg));
    } else {
      console.warn('Socket not ready, message not sent:', msg.type);
    }
  }

  // Вызывается из RoomPage при входе в комнату
  joinRoom(roomId: string) {
    this.currentRoomId = roomId;
    this.send({ type: 'JOIN', roomId, senderId: this.myId });
  }

  // Вызывается из RoomPage при выходе из комнаты
  leaveRoom(roomId: string) {
    this.currentRoomId = null;
    this.send({ type: 'LEAVE', roomId, senderId: this.myId });
  }

  getMyId() {
    return this.myId;
  }

  generateId() {
    return Math.random().toString(36).substr(2, 12);
  }
}

export const callsSignal = new CallsSignal();
