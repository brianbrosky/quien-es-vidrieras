import { players } from '../data/players';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateShuffledOrder() {
  return shuffle(players.map(p => p.id));
}

export function generateRound(roundIndex, shuffledOrder) {
  const subjectId = shuffledOrder[roundIndex];
  const subject = players.find(p => p.id === subjectId);

  const decoys = shuffle(players.filter(p => p.id !== subjectId)).slice(0, 3);
  const options = shuffle([subject.name, ...decoys.map(d => d.name)]);

  return {
    roundIndex,
    subjectId: subject.id,
    subjectImage: subject.image,
    correctAnswer: subject.name,
    options,
  };
}
