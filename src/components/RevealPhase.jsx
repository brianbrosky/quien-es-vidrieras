import { useState, useEffect } from 'react';
import { useRound } from '../hooks/useRound';
import { advanceToNextRound } from '../utils/gameManager';
import ConfettiOverlay from './shared/ConfettiOverlay';

export default function RevealPhase({ gameDoc, players, isHost, localPlayerId }) {
  const roundDoc = useRound(gameDoc?.currentRound);
  const [revealed, setRevealed] = useState(false);

  // Reset suspense on new round
  useEffect(() => {
    setRevealed(false);
    const t = setTimeout(() => setRevealed(true), 1500);
    return () => clearTimeout(t);
  }, [gameDoc?.currentRound]);

  if (!roundDoc) return <div className="screen"><div className="card"><p>Cargando...</p></div></div>;

  const myAnswer = roundDoc.answers?.[localPlayerId];
  const isCorrect = myAnswer?.isCorrect;

  const results = Object.entries(roundDoc.answers ?? {}).map(([pid, data]) => ({
    playerId: pid,
    ...data,
  }));

  function handleNext() {
    advanceToNextRound(gameDoc.currentRound, gameDoc.totalRounds, gameDoc.shuffledOrder).catch(() => {});
  }

  return (
    <div className="screen reveal-phase">
      <ConfettiOverlay trigger={revealed && isCorrect} />

      <div className="reveal-card">
        <img
          src={`/images/${roundDoc.subjectImage}`}
          alt={revealed ? roundDoc.correctAnswer : '¿Quién es?'}
          className="reveal-photo"
        />

        {!revealed ? (
          <div className="reveal-suspense">
            <span className="suspense-dots">. . .</span>
            <p className="suspense-text">¿Quién era?</p>
          </div>
        ) : (
          <div className={`reveal-answer ${isCorrect ? 'correct' : 'wrong'}`}>
            <span className="reveal-icon">{isCorrect ? '✓' : '✗'}</span>
            <span className="reveal-name">{roundDoc.correctAnswer}</span>
          </div>
        )}

        {revealed && myAnswer && (
          <p className="my-result">
            {isCorrect
              ? `+${myAnswer.pointsEarned} puntos`
              : `Respondiste: ${myAnswer.answer}`}
          </p>
        )}
      </div>

      {revealed && (
        <div className="results-list">
          <h3>Resultados de la ronda</h3>
          {results
            .sort((a, b) => b.pointsEarned - a.pointsEarned)
            .map(r => (
              <div key={r.playerId} className={`result-row ${r.isCorrect ? 'correct' : 'wrong'}`}>
                <span className="result-icon">{r.isCorrect ? '✓' : '✗'}</span>
                <span className="result-name">{r.playerName}</span>
                <span className="result-points">
                  {r.isCorrect ? `+${r.pointsEarned}` : '0'}
                </span>
              </div>
            ))}
        </div>
      )}

      {revealed && isHost && (
        <button className="btn-primary" onClick={handleNext}>
          {gameDoc.currentRound + 1 >= gameDoc.totalRounds ? 'Ver resultado final' : 'Siguiente ronda'}
        </button>
      )}
      {revealed && !isHost && <p className="waiting-msg">Esperando al host...</p>}
    </div>
  );
}
