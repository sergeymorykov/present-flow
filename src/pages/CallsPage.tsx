import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { callsSignal, RoomInfo } from '../utils/callsSignal';

export const CallsPage: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [enteredPasswords, setEnteredPasswords] = useState<{ [roomId: string]: string }>({});
  const [error, setError] = useState('');
  const [isHttpsWarning, setIsHttpsWarning] = useState(false);

  const myId = useRef(callsSignal.getMyId()).current;

  useEffect(() => {
    // Проверка на HTTPS (необходимо для камеры на удаленных серверах)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      setIsHttpsWarning(true);
    }

    const unsubscribe = callsSignal.subscribe((msg) => {
      console.log('Received message in CallsPage:', msg.type);
      
      if (msg.type === 'ROOMS_LIST') {
        setRooms(msg.rooms);
      } else if (msg.type === 'ROOM_CREATED' || msg.type === 'ROOM_UPDATED') {
        setRooms(prev => {
          const filtered = prev.filter(r => r.id !== msg.room.id);
          return [...filtered, msg.room];
        });
      } else if (msg.type === 'ROOM_DELETED') {
        setRooms(prev => prev.filter(r => r.id !== msg.roomId));
      }
    });

    // Запрашиваем список комнат у сервера
    callsSignal.send({ type: 'QUERY_ROOMS' });

    return () => unsubscribe();
  }, []);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) {
      setError('Название комнаты не может быть пустым');
      return;
    }

    const newRoom: RoomInfo = {
      id: callsSignal.generateId(),
      name: newRoomName,
      hasPassword: usePassword,
      password: usePassword ? password : undefined,
      participantsCount: 0,
      creatorId: myId
    };

    callsSignal.send({ type: 'ROOM_CREATED', room: newRoom });
    navigate(`/calls/${newRoom.id}`);
  };

  const handleJoinRoom = (room: RoomInfo) => {
    if (room.participantsCount >= 20) {
      alert('В комнате уже максимум участников.');
      return;
    }

    if (room.hasPassword) {
      const p = enteredPasswords[room.id] || '';
      if (p !== room.password) {
        alert('Неверный пароль.');
        return;
      }
    }

    navigate(`/calls/${room.id}`);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {isHttpsWarning && (
          <div style={styles.httpsWarning}>
            ⚠️ <strong>Внимание:</strong> Вы используете незащищенное соединение (HTTP). 
            Камера и микрофон будут работать только на <strong>localhost</strong> или через <strong>HTTPS</strong>.
          </div>
        )}

        <div style={styles.hero}>
          <h1 style={styles.title}>📞 Звонки Present Flow</h1>
          <p style={styles.subtitle}>Межбраузерные видеовстречи. Данные не сохраняются.</p>
        </div>

        <div style={styles.grid}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Создать комнату</h2>
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleCreateRoom} style={styles.form}>
              <input
                type="text"
                placeholder="Название комнаты"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                style={styles.input}
              />
              <label style={styles.checkboxLabel}>
                <input type="checkbox" checked={usePassword} onChange={(e) => setUsePassword(e.target.checked)} />
                Использовать пароль
              </label>
              {usePassword && (
                <input
                  type="password"
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.input}
                />
              )}
              <button type="submit" style={styles.createBtn}>Создать комнату</button>
            </form>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Активные комнаты</h2>
            {rooms.length === 0 ? (
              <div style={styles.empty}>Нет активных комнат.</div>
            ) : (
              <div style={styles.roomsList}>
                {rooms.map((room) => (
                  <div key={room.id} style={styles.roomItem}>
                    <div>
                      <div style={styles.roomName}>{room.name} {room.hasPassword ? '🔒' : ''}</div>
                      <div style={styles.roomMeta}>Участников: {room.participantsCount}/20</div>
                    </div>
                    <div style={styles.actionBlock}>
                      {room.hasPassword && (
                        <input
                          type="password"
                          placeholder="Пароль"
                          value={enteredPasswords[room.id] || ''}
                          onChange={(e) => setEnteredPasswords({...enteredPasswords, [room.id]: e.target.value})}
                          style={styles.passwordInput}
                        />
                      )}
                      <button onClick={() => handleJoinRoom(room)} style={styles.joinBtn}>Войти</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  page: { backgroundColor: '#0f0f1a', color: '#fff', minHeight: '100%', padding: '2rem' },
  container: { maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' },
  httpsWarning: { backgroundColor: '#ffcc00', color: '#000', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', fontWeight: 500 },
  hero: { textAlign: 'center' },
  title: { fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #00d9ff, #4ecdc4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { color: '#a0a0b8' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' },
  card: { backgroundColor: '#1a1a2e', borderRadius: '16px', padding: '2rem', border: '1px solid rgba(255, 255, 255, 0.1)' },
  cardTitle: { fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  input: { backgroundColor: '#0f0f1a', border: '1px solid #20203a', borderRadius: '8px', color: '#fff', padding: '0.75rem' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a0a0b8', cursor: 'pointer' },
  createBtn: { backgroundColor: '#00d9ff', color: '#000', border: 'none', borderRadius: '8px', padding: '0.85rem', fontWeight: 'bold', cursor: 'pointer' },
  error: { color: '#ff6b6b', marginBottom: '1rem' },
  empty: { color: '#a0a0b8', fontStyle: 'italic', textAlign: 'center' },
  roomsList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  roomItem: { backgroundColor: '#0f0f1a', padding: '1rem', borderRadius: '12px', border: '1px solid #20203a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  roomName: { fontWeight: 'bold', fontSize: '1.1rem' },
  roomMeta: { fontSize: '0.8rem', color: '#4ecdc4' },
  actionBlock: { display: 'flex', gap: '0.5rem' },
  passwordInput: { backgroundColor: '#1a1a2e', border: '1px solid #20203a', borderRadius: '4px', color: '#fff', padding: '0.3rem', width: '80px' },
  joinBtn: { backgroundColor: 'transparent', border: '1px solid #00d9ff', color: '#00d9ff', borderRadius: '4px', padding: '0.3rem 0.7rem', cursor: 'pointer' }
};
