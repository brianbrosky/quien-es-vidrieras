import { useState, useEffect, useCallback } from 'react';
import { useRound } from '../hooks/useRound';
import { useCountdown } from '../hooks/useCountdown';
import { submitAnswer, advanceToReveal } from '../utils/gameManager';
import CountdownRing from './shared/CountdownRing';

export default function GameRound({ gameDoc, localPlayerId, localPlayerName, isHost, triggerAdvanceIfNeeded, onlinePlayers }) {
  const roundDoc = useRound(gameDoc?.currentRound);
  const [selectedOption, setSelectedOption] = useState(null);
  const [locked, setLocked] = useState(false);

  const hasAnswered = roundDoc?.answers?.[localPlayerId] != null;
  const answeredCount = Object.keys(roundDoc?.answers ?? {}).length;
  const totalPlayers = onlinePlayers?.length ?? 0;

  // Reset state on new round
  useEffect(() => {
    setSelectedOption(null);
    setLocked(false);
  }, [gameDoc?.currentRound]);

  // Trigger advance check whenever answers update
  useEffect(() => {
    if (roundDoc) triggerAdvanceIfNeeded(roundDoc);
  }, [roundDoc, triggerAdvanceIfNeeded]);

  const handleExpire = useCallback(() => {
    if (isHost) advanceToReveal(gameDoc.currentRound).catch(() => {});
  }, [isHost, gameDoc?.currentRound]);

  const { seconds, progress } = useCountdown(roundDoc?.startedAt, handleExpire);

  async function handleAnswer(option) {
    if (locked || hasAnswered || !roundDoc) return;
    setSelectedOption(option);
    setLocked(true);
    await submitAnswer(
      localPlayerId,
      localPlayerName,
      gameDoc.currentRound,
      option,
      roundDoc.correctAnswer,
      roundDoc.startedAt,
    );
  }

  if (!roundDoc) {
    return (
      <div className="screen game-round">
        <div className="card"><p>Cargando ronda...</p></div>
      </div>
    );
  }

  const roundNumber = (gameDoc.currentRound ?? 0) + 1;
  const totalRounds = gameDoc.totalRounds ?? 0;

  return (
    <div className="screen game-round">
      <div className="round-header">
        <span className="round-counter">Ronda {roundNumber} / {totalRounds}</span>
        <CountdownRing seconds={seconds} progress={progress} />
      </div>

      <div className="photo-container">
        <img
          src={`/images/${roundDoc.subjectImage}`}
          alt="¿Quién es?"
          className="subject-photo"
        />
        <p className="photo-hint">¿Quién es esta persona?</p>
      </div>

      <div className="options-grid">
        {roundDoc.options.map(option => (
          <button
            key={option}
            className={`option-btn ${selectedOption === option ? 'selected' : ''} ${locked ? 'disabled' : ''}`}
            onClick={() => handleAnswer(option)}
            disabled={locked}
          >
            {option}
          </button>
        ))}
      </div>

      <p className="answered-msg">
        {answeredCount} / {totalPlayers} respondieron
      </p>
    </div>
  );
}
