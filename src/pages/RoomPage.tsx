import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { callsSignal, RoomInfo } from '../utils/callsSignal';

export const RoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const myId = useRef(callsSignal.getMyId()).current;

  const [room, setRoom] = useState<RoomInfo | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [peers, setPeers] = useState<{ [id: string]: MediaStream }>({});
  const peerConnections = useRef<{ [id: string]: RTCPeerConnection }>({});
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      {
        urls: 'turn:presentation.tatcon.ru:3478',
        username: 'present_user',
        credential: 'present_secret_2024'
      }
    ]
  };

  // 1. Инициализация медиа
  useEffect(() => {
    async function startMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true
        });
        setLocalStream(stream);
      } catch (err: any) {
        console.error('Media error:', err);
        let msg = 'Не удалось получить доступ к камере/микрофону.';
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
          msg = 'Chrome блокирует камеру на незащищенных сайтах (нужен HTTPS или localhost).';
        }
        setError(msg);
      }
    }

    startMedia();

    return () => {
      Object.values(peerConnections.current).forEach(pc => pc.close());
    };
  }, []);

  // Синхронизация локального видео с элементом
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, room]); // Перепривязываем, когда комната загрузилась

  // Синхронизация mute/unmute
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => t.enabled = !isAudioMuted);
      localStream.getVideoTracks().forEach(t => t.enabled = !isVideoMuted);
    }
  }, [isAudioMuted, isVideoMuted, localStream]);

  // 2. Логика WebRTC и событий
  useEffect(() => {
    if (!roomId || !localStream) return;

    const leaveRoom = () => {
      callsSignal.leaveRoom(roomId);
    };

    window.addEventListener('beforeunload', leaveRoom);

    const unsubscribe = callsSignal.subscribe(async (msg) => {
      if (msg.type === 'ROOMS_LIST' && !room) {
        const found = msg.rooms.find(r => r.id === roomId);
        if (found) setRoom(found);
      }
      if (msg.type === 'ROOM_UPDATED' && msg.room.id === roomId) {
        setRoom(msg.room);
      }
      if (msg.type === 'ROOM_DELETED' && msg.roomId === roomId) {
        alert('Комната была удалена.');
        navigate('/calls');
      }
      if (msg.type === 'ERROR') {
        alert(`Ошибка: ${msg.message}`);
        navigate('/calls');
      }
      if (msg.type === 'SIGNAL' && msg.roomId === roomId) {
        const { senderId, targetId, data } = msg;
        if (targetId && targetId !== myId) return;

        if (data.type === 'JOIN' && senderId !== myId) {
          createPeerConnection(senderId, true);
        } else if (data.type === 'offer') {
          const pc = createPeerConnection(senderId, false);
          await pc.setRemoteDescription(new RTCSessionDescription(data));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          callsSignal.send({ type: 'SIGNAL', roomId, senderId: myId, targetId: senderId, data: answer });
        } else if (data.type === 'answer') {
          peerConnections.current[senderId]?.setRemoteDescription(new RTCSessionDescription(data));
        } else if (data.candidate) {
          peerConnections.current[senderId]?.addIceCandidate(new RTCIceCandidate(data.candidate));
        } else if (data.type === 'LEAVE') {
          closePeer(senderId);
        }
      }
    });

    // Сообщаем серверу, что мы вошли, передаем пароль если есть
    const password = location.state?.password;
    callsSignal.joinRoom(roomId, password);
    callsSignal.send({ type: 'QUERY_ROOMS' });

    return () => {
      window.removeEventListener('beforeunload', leaveRoom);
      leaveRoom();
      unsubscribe();
      // Останавливаем локальные треки
      localStream.getTracks().forEach(t => t.stop());
    };
  }, [roomId, localStream]);

  const createPeerConnection = (peerId: string, isInitiator: boolean) => {
    if (peerConnections.current[peerId]) return peerConnections.current[peerId];

    const pc = new RTCPeerConnection(rtcConfig);
    peerConnections.current[peerId] = pc;

    localStream?.getTracks().forEach(track => pc.addTrack(track, localStream));

    pc.ontrack = (e) => {
      setPeers(prev => ({ ...prev, [peerId]: e.streams[0] }));
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        callsSignal.send({
          type: 'SIGNAL',
          roomId: roomId!,
          senderId: myId,
          targetId: peerId,
          data: { candidate: e.candidate }
        });
      }
    };

    if (isInitiator) {
      pc.onnegotiationneeded = async () => {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          callsSignal.send({ type: 'SIGNAL', roomId: roomId!, senderId: myId, targetId: peerId, data: offer });
        } catch (e) {
          console.error('Negotiation error:', e);
        }
      };
    }

    return pc;
  };

  const closePeer = (peerId: string) => {
    if (peerConnections.current[peerId]) {
      peerConnections.current[peerId].close();
      delete peerConnections.current[peerId];
    }
    setPeers(prev => {
      const next = { ...prev };
      delete next[peerId];
      return next;
    });
  };

  if (error) {
    return (
      <div style={styles.errorPage}>
        <div style={styles.errorCard}>
          <h2>⚠️ Ошибка доступа</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} style={styles.retryBtn}>Попробовать снова</button>
          <button onClick={() => navigate('/calls')} style={styles.backBtn}>Вернуться к списку</button>
        </div>
      </div>
    );
  }

  if (!room) return <div style={styles.loading}>Подключение к комнате...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.roomInfo}>
            <h1 style={styles.roomName}>{room.name}</h1>
            <span style={styles.badge}>{room.participants} уч.</span>
          </div>
          <button onClick={() => navigate('/calls')} style={styles.leaveBtn}>🚪 Покинуть</button>
        </div>

        <div style={styles.videoGrid}>
          {/* Локальное видео */}
          <div style={styles.videoCard}>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              style={{
                ...styles.video,
                opacity: isVideoMuted ? 0 : 1,
                transform: 'scaleX(-1)' // Зеркальное отображение
              }}
            />
            {isVideoMuted && <div style={styles.videoOffPlaceholder}>📷 Камера выключена</div>}
            <div style={styles.label}>Вы {isAudioMuted && '🔇'}</div>

            {/* Кнопки управления локальным видео */}
            <div style={styles.controls}>
              <button
                onClick={() => setIsAudioMuted(!isAudioMuted)}
                style={{ ...styles.controlBtn, backgroundColor: isAudioMuted ? '#ff4d4d' : 'rgba(255,255,255,0.2)' }}
                title={isAudioMuted ? "Включить микрофон" : "Выключить микрофон"}
              >
                {isAudioMuted ? '🎤' : '🎙️'}
              </button>
              <button
                onClick={() => setIsVideoMuted(!isVideoMuted)}
                style={{ ...styles.controlBtn, backgroundColor: isVideoMuted ? '#ff4d4d' : 'rgba(255,255,255,0.2)' }}
                title={isVideoMuted ? "Включить камеру" : "Выключить камеру"}
              >
                {isVideoMuted ? '❌' : '📹'}
              </button>
            </div>
          </div>

          {/* Удаленные участники */}
          {Object.entries(peers).map(([id, stream]) => (
            <div key={id} style={styles.videoCard}>
              <RemoteVideo stream={stream} />
              <div style={styles.label}>Участник {id.slice(0, 4)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const RemoteVideo: React.FC<{ stream: MediaStream }> = ({ stream }) => {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  return <video ref={ref} autoPlay playsInline style={styles.video} />;
};

const styles: { [key: string]: React.CSSProperties } = {
  page: { backgroundColor: '#0f0f1a', minHeight: '100vh', padding: '2rem', color: '#fff', fontFamily: 'sans-serif' },
  container: { maxWidth: '1400px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  roomInfo: { display: 'flex', alignItems: 'center', gap: '1rem' },
  roomName: { fontSize: '1.8rem', fontWeight: 'bold', margin: 0 },
  badge: { backgroundColor: '#4a4ae2', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.9rem' },
  leaveBtn: { backgroundColor: '#ff4d4d', border: 'none', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  videoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' },
  videoCard: { position: 'relative', backgroundColor: '#1a1a2e', borderRadius: '16px', overflow: 'hidden', aspectRatio: '16/9', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' },
  video: { width: '100%', height: '100%', objectFit: 'cover' },
  videoOffPlaceholder: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', color: '#666', fontSize: '1.2rem' },
  label: { position: 'absolute', bottom: '15px', left: '15px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '4px 12px', borderRadius: '8px', fontSize: '0.9rem', zIndex: 5 },
  controls: { position: 'absolute', bottom: '15px', right: '15px', display: 'flex', gap: '10px', zIndex: 5 },
  controlBtn: { width: '40px', height: '40px', borderRadius: '50%', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', transition: 'all 0.2s' },
  loading: { color: '#fff', textAlign: 'center', marginTop: '10rem', fontSize: '1.2rem' },
  errorPage: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0f1a', color: '#fff' },
  errorCard: { backgroundColor: '#1a1a2e', padding: '3rem', borderRadius: '20px', textAlign: 'center', maxWidth: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' },
  retryBtn: { backgroundColor: '#4a4ae2', color: '#fff', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer', marginRight: '1rem', fontWeight: 'bold' },
  backBtn: { backgroundColor: 'transparent', color: '#aaa', border: '1px solid #444', padding: '0.8rem 1.5rem', borderRadius: '8px', cursor: 'pointer' }
};
