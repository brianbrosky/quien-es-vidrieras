export default function Leaderboard({ players, title = 'Ranking', localPlayerId }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="leaderboard">
      {title && <h3>{title}</h3>}
      <ol className="leaderboard-list">
        {sorted.map((p, i) => (
          <li
            key={p.playerId}
            className={`leaderboard-row ${p.playerId === localPlayerId ? 'me' : ''} pos-${i + 1}`}
          >
            <span className="lb-position">{i + 1}</span>
            <span className="lb-avatar">{p.name[0].toUpperCase()}</span>
            <span className="lb-name">
              {p.name}
              {p.playerId === localPlayerId && ' (vos)'}
            </span>
            <span className="lb-score">{p.score.toLocaleString()}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
