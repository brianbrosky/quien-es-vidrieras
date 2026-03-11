import { useEffect, useState, useCallback } from 'react';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { advanceToReveal, advanceToNextRound, setPlayerOnline } from '../utils/gameManager';

const GAME_ID = 'main';

export function useGame(localPlayerId) {
  const [gameDoc, setGameDoc] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Listen to game doc
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'games', GAME_ID), snap => {
      if (snap.exists()) setGameDoc({ id: snap.id, ...snap.data() });
      setLoading(false);
    });
    return unsub;
  }, []);

  // Listen to players subcollection
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'games', GAME_ID, 'players'), snap => {
      setPlayers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  // Presence: mark online/offline
  useEffect(() => {
    if (!localPlayerId) return;
    setPlayerOnline(localPlayerId, true).catch(() => {});
    const handleUnload = () => setPlayerOnline(localPlayerId, false).catch(() => {});
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      setPlayerOnline(localPlayerId, false).catch(() => {});
    };
  }, [localPlayerId]);

  const myPlayer = players.find(p => p.playerId === localPlayerId);
  const isHost = myPlayer?.isHost === true;
  const onlinePlayers = players.filter(p => p.isOnline);

  // Host: trigger advance to reveal when all online players answered
  const triggerAdvanceIfNeeded = useCallback((roundDoc) => {
    if (!isHost || !gameDoc || gameDoc.status !== 'playing') return;
    if (!roundDoc?.answers) return;
    const answeredIds = Object.keys(roundDoc.answers);
    const allAnswered = onlinePlayers.every(p => answeredIds.includes(p.playerId));
    if (allAnswered && onlinePlayers.length > 0) {
      advanceToReveal(gameDoc.currentRound).catch(() => {});
    }
  }, [isHost, gameDoc, onlinePlayers]);

  return { gameDoc, players, onlinePlayers, isHost, loading, triggerAdvanceIfNeeded };
}
