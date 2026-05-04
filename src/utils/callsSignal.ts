/**
 * Синхронизация звонков через WebSocket.
 * Позволяет разным браузерам обмениваться информацией о комнатах и сигналами WebRTC.
 */

export interface RoomInfo {
  id: string;
  name: string;
  participantsCount: number;
  hasPassword?: boolean;
  password?: string;
  creatorId: string;
}

export type SignalMessage = 
  | { type: 'QUERY_ROOMS' }
  | { type: 'ROOMS_LIST', rooms: RoomInfo[] }
  | { type: 'ROOM_CREATED', room: RoomInfo }
  | { type: 'ROOM_UPDATED', room: RoomInfo }
  | { type: 'ROOM_DELETED', roomId: string }
  | { type: 'SIGNAL', roomId: string, senderId: string, targetId?: string, data: any };

class CallsSignal {
  private socket: WebSocket | null = null;
  private listeners: ((msg: SignalMessage) => void)[] = [];
  private myId = Math.random().toString(36).substr(2, 9);
  private reconnectTimer: any = null;

  constructor() {
    this.connect();
  }

  private connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    // В продакшене (через Nginx) используем путь /ws/ на том же хосте/порту
    // В разработке используем прямой порт 8089
    const isProd = import.meta.env.PROD;
    const wsUrl = isProd 
      ? `${protocol}//${window.location.host}/ws/`
      : `${protocol}//${window.location.hostname}:8089`;
    
    try {
      console.log('Connecting to:', wsUrl);
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log('Connected to signaling server');
        this.send({ type: 'QUERY_ROOMS' });
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
      // Если сокет не готов, пробуем отправить позже или игнорируем ephemeral сообщения
      console.warn('Socket not ready, message not sent:', msg.type);
    }
  }

  getMyId() {
    return this.myId;
  }

  generateId() {
    return Math.random().toString(36).substr(2, 12);
  }
}

export const callsSignal = new CallsSignal();
