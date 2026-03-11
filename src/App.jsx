import { useState } from 'react';
import { useGame } from './hooks/useGame';
import NameEntry from './components/NameEntry';
import Lobby from './components/Lobby';
import GameRound from './components/GameRound';
import RevealPhase from './components/RevealPhase';
import FinalScreen from './components/FinalScreen';

export default function App() {
  const [localPlayerId, setLocalPlayerId] = useState(null);
  const [localPlayerName, setLocalPlayerName] = useState(null);

  const { gameDoc, players, onlinePlayers, isHost, loading, triggerAdvanceIfNeeded } = useGame(localPlayerId);

  function handleJoined(playerId, name) {
    setLocalPlayerId(playerId);
    setLocalPlayerName(name);
  }

  if (!localPlayerId) {
    return <NameEntry onJoined={handleJoined} />;
  }

  if (loading || !gameDoc) {
    return (
      <div className="screen">
        <div className="card"><p>Conectando...</p></div>
      </div>
    );
  }

  const { status } = gameDoc;

  if (status === 'lobby') {
    return <Lobby gameDoc={gameDoc} players={players} isHost={isHost} localPlayerId={localPlayerId} />;
  }

  if (status === 'playing') {
    const myPlayer = players.find(p => p.playerId === localPlayerId);
    const joinedAfterStart = myPlayer?.joinedAt && gameDoc?.updatedAt &&
      myPlayer.joinedAt.toMillis() > gameDoc.updatedAt.toMillis();
    if (joinedAfterStart) {
      return (
        <div className="screen">
          <div className="card" style={{ textAlign: 'center', gap: '1rem' }}>
            <div className="cake-emoji">⏳</div>
            <h1>Juego en curso</h1>
            <p className="subtitle">Esperá que termine la ronda actual para unirte.</p>
            <p className="rounds-info">
              Ronda {(gameDoc.currentRound ?? 0) + 1} de {gameDoc.totalRounds}
            </p>
          </div>
        </div>
      );
    }
    return (
      <GameRound
        gameDoc={gameDoc}
        localPlayerId={localPlayerId}
        localPlayerName={localPlayerName}
        isHost={isHost}
        triggerAdvanceIfNeeded={triggerAdvanceIfNeeded}
        onlinePlayers={onlinePlayers}
      />
    );
  }

  if (status === 'reveal') {
    return (
      <RevealPhase
        gameDoc={gameDoc}
        players={players}
        isHost={isHost}
        localPlayerId={localPlayerId}
      />
    );
  }

  if (status === 'finished') {
    return (
      <FinalScreen
        players={players}
        isHost={isHost}
        localPlayerId={localPlayerId}
      />
    );
  }

  return null;
}
