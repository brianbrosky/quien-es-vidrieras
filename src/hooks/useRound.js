import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const GAME_ID = 'main';

export function useRound(roundIndex) {
  const [roundDoc, setRoundDoc] = useState(null);

  useEffect(() => {
    if (roundIndex == null || roundIndex < 0) return;
    const unsub = onSnapshot(
      doc(db, 'games', GAME_ID, 'rounds', String(roundIndex)),
      snap => {
        if (snap.exists()) setRoundDoc({ id: snap.id, ...snap.data() });
        else setRoundDoc(null);
      }
    );
    return unsub;
  }, [roundIndex]);

  return roundDoc;
}
