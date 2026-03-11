import { useState } from 'react';
import { joinGame, checkNameAvailable } from '../utils/gameManager';

export default function NameEntry({ onJoined }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');
    try {
      const available = await checkNameAvailable(trimmed);
      if (!available) {
        setError(`Ya hay alguien con el nombre "${trimmed}" en la sala.`);
        setLoading(false);
        return;
      }
      const playerId = crypto.randomUUID();
      await joinGame(playerId, trimmed);
      onJoined(playerId, trimmed);
    } catch (err) {
      console.error(err);
      setError('Error al conectar. Revisá tu conexión.');
      setLoading(false);
    }
  }

  return (
    <div className="screen name-entry">
      <div className="card">
        <div className="cake-emoji">🎂</div>
        <h1>¿Quién es?</h1>
        <p className="subtitle">El juego del filtro de torta</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={20}
            autoFocus
            disabled={loading}
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={!name.trim() || loading} className="btn-primary">
            {loading ? 'Conectando...' : 'Entrar al juego'}
          </button>
        </form>
      </div>
    </div>
  );
}
