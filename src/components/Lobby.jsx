import { startGame } from '../utils/gameManager';
import { players as teamPlayers } from '../data/players';

export default function Lobby({ gameDoc, players, isHost, localPlayerId }) {
  // Solo mostrar jugadores que se unieron DESPUÉS de que se creó esta sesión de juego
  // Esto elimina "jugadores zombie" de partidas anteriores
  const gameCreatedAt = gameDoc?.createdAt?.toMillis?.() ?? 0;
  const onlinePlayers = players.filter(p =>
    p.isOnline && (p.joinedAt?.toMillis?.() ?? 0) >= gameCreatedAt
  );

  return (
    <div className="screen lobby">
      <div className="card">
        <div className="cake-emoji">🎂</div>
        <h1>Sala de espera</h1>
        <p className="subtitle">
          {onlinePlayers.length} jugador{onlinePlayers.length !== 1 ? 'es' : ''} conectado{onlinePlayers.length !== 1 ? 's' : ''}
        </p>

        <ul className="player-list">
          {onlinePlayers.map(p => (
            <li key={p.playerId} className="player-item">
              <span className="player-avatar">{p.name[0].toUpperCase()}</span>
              <span className="player-name">
                {p.name}
                {p.playerId === localPlayerId && ' (vos)'}
                {p.isHost && <span className="host-badge">HOST</span>}
              </span>
            </li>
          ))}
        </ul>

        <p className="rounds-info">
          Se jugarán <strong>{teamPlayers.length} rondas</strong> — una por cada integrante del equipo
        </p>

        {isHost ? (
          <button
            className="btn-primary"
            onClick={() => startGame(localPlayerId)}
            disabled={onlinePlayers.length < 2}
          >
            {onlinePlayers.length < 2 ? 'Esperando jugadores...' : '¡Empezar!'}
          </button>
        ) : (
          <p className="waiting-msg">Esperando que el host inicie el juego...</p>
        )}
      </div>
    </div>
  );
}
