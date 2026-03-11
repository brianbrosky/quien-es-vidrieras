import { useEffect, useState } from 'react';
import Leaderboard from './Leaderboard';
import ConfettiOverlay from './shared/ConfettiOverlay';
import { resetGame } from '../utils/gameManager';

export default function FinalScreen({ players, isHost, localPlayerId }) {
  const [confetti, setConfetti] = useState(false);
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  useEffect(() => {
    const t = setTimeout(() => setConfetti(true), 300);
    return () => clearTimeout(t);
  }, []);

  async function handlePlayAgain() {
    sessionStorage.removeItem('quien_es_player_id');
    sessionStorage.removeItem('quien_es_player_name');
    await resetGame();
    window.location.reload();
  }

  return (
    <div className="screen final-screen">
      <ConfettiOverlay trigger={confetti} winner />

      <div className="final-card">
        <div className="cake-emoji">🏆</div>
        <h1>¡Fin del juego!</h1>

        {winner && (
          <div className="winner-banner">
            <span className="winner-avatar">{winner.name[0].toUpperCase()}</span>
            <div>
              <p className="winner-label">Ganador</p>
              <p className="winner-name">{winner.name}</p>
              <p className="winner-score">{winner.score.toLocaleString()} puntos</p>
            </div>
          </div>
        )}

        <Leaderboard players={players} title="Clasificación final" localPlayerId={localPlayerId} />

        {isHost && (
          <button className="btn-primary" onClick={handlePlayAgain}>
            Jugar de nuevo
          </button>
        )}
        {!isHost && <p className="waiting-msg">El host puede iniciar una nueva partida</p>}
      </div>
    </div>
  );
}
