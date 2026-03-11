import {
  doc, collection, setDoc, updateDoc, runTransaction,
  serverTimestamp, deleteDoc, getDocs, query, where
} from 'firebase/firestore';
import { db } from '../firebase';
import { players } from '../data/players';
import { generateShuffledOrder, generateRound } from './roundGenerator';

const GAME_ID = 'main';
const gameRef = () => doc(db, 'games', GAME_ID);
const playersCol = () => collection(db, 'games', GAME_ID, 'players');
const roundsCol = () => collection(db, 'games', GAME_ID, 'rounds');

// ── Player management ──────────────────────────────────────────────────────

export async function checkNameAvailable(name) {
  const q = query(playersCol(), where('name', '==', name), where('isOnline', '==', true));
  const snap = await getDocs(q);
  return snap.empty;
}

export async function joinGame(playerId, name) {
  const isFirst = await runTransaction(db, async (tx) => {
    const snap = await tx.get(gameRef());
    const existing = snap.exists() ? snap.data() : null;
    const alreadyHasHost = existing?.hostId;
    const playerRef = doc(db, 'games', GAME_ID, 'players', playerId);
    tx.set(playerRef, {
      playerId, name, score: 0,
      joinedAt: serverTimestamp(),
      isHost: !alreadyHasHost,
      isOnline: true,
    });
    if (!snap.exists()) {
      tx.set(gameRef(), {
        status: 'lobby',
        hostId: !alreadyHasHost ? playerId : existing?.hostId,
        currentRound: -1,
        totalRounds: players.length,
        shuffledOrder: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else if (!alreadyHasHost) {
      tx.update(gameRef(), { hostId: playerId, updatedAt: serverTimestamp() });
    }
    return !alreadyHasHost;
  });
  return isFirst;
}

export async function setPlayerOnline(playerId, isOnline) {
  const ref = doc(db, 'games', GAME_ID, 'players', playerId);
  await updateDoc(ref, { isOnline });
}

// ── Game flow ──────────────────────────────────────────────────────────────

export async function startGame(hostId) {
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(gameRef());
    if (snap.data().status !== 'lobby') return;

    const shuffledOrder = generateShuffledOrder();
    const firstRound = generateRound(0, shuffledOrder);
    const roundRef = doc(db, 'games', GAME_ID, 'rounds', '0');

    tx.update(gameRef(), {
      status: 'playing',
      currentRound: 0,
      shuffledOrder,
      updatedAt: serverTimestamp(),
    });
    tx.set(roundRef, {
      ...firstRound,
      startedAt: serverTimestamp(),
      endedAt: null,
      answers: {},
    });
  });
}

export async function submitAnswer(playerId, playerName, roundIndex, answer, correctAnswer, startedAt) {
  const { calculatePoints } = await import('./scoring');
  const now = new Date();
  const answeredAt = { toMillis: () => now.getTime() };
  const startMs = startedAt?.toMillis ? startedAt : { toMillis: () => startedAt.seconds * 1000 };
  const isCorrect = answer === correctAnswer;
  const pointsEarned = calculatePoints(isCorrect, answeredAt, startMs);

  const roundRef = doc(db, 'games', GAME_ID, 'rounds', String(roundIndex));
  const playerRef = doc(db, 'games', GAME_ID, 'players', playerId);

  await runTransaction(db, async (tx) => {
    const playerSnap = await tx.get(playerRef);
    const currentScore = playerSnap.data()?.score ?? 0;

    tx.update(roundRef, {
      [`answers.${playerId}`]: {
        answer,
        answeredAt: serverTimestamp(),
        isCorrect,
        pointsEarned,
        playerName,
      },
    });
    tx.update(playerRef, { score: currentScore + pointsEarned });
  });

  return pointsEarned;
}

export async function advanceToReveal(roundIndex) {
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(gameRef());
    if (snap.data().status !== 'playing') return;
    const roundRef = doc(db, 'games', GAME_ID, 'rounds', String(roundIndex));
    tx.update(gameRef(), { status: 'reveal', updatedAt: serverTimestamp() });
    tx.update(roundRef, { endedAt: serverTimestamp() });
  });
}

export async function advanceToNextRound(currentRound, totalRounds, shuffledOrder) {
  const nextRound = currentRound + 1;
  const isLast = nextRound >= totalRounds;

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(gameRef());
    if (snap.data().status !== 'reveal') return;

    if (isLast) {
      tx.update(gameRef(), { status: 'finished', updatedAt: serverTimestamp() });
    } else {
      const round = generateRound(nextRound, shuffledOrder);
      const roundRef = doc(db, 'games', GAME_ID, 'rounds', String(nextRound));
      tx.update(gameRef(), {
        status: 'playing',
        currentRound: nextRound,
        updatedAt: serverTimestamp(),
      });
      tx.set(roundRef, {
        ...round,
        startedAt: serverTimestamp(),
        endedAt: null,
        answers: {},
      });
    }
  });
}

export async function resetGame() {
  // Delete all subcollection docs then reset game doc
  const playerDocs = await getDocs(playersCol());
  const roundDocs = await getDocs(roundsCol());

  const deletes = [
    ...playerDocs.docs.map(d => deleteDoc(d.ref)),
    ...roundDocs.docs.map(d => deleteDoc(d.ref)),
  ];
  await Promise.all(deletes);

  await setDoc(gameRef(), {
    status: 'lobby',
    hostId: null,
    currentRound: -1,
    totalRounds: players.length,
    shuffledOrder: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
