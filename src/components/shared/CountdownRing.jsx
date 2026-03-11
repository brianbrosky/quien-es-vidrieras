export default function CountdownRing({ seconds, progress }) {
  const size = 80;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  const color = progress > 0.5 ? '#22c55e' : progress > 0.25 ? '#f59e0b' : '#ef4444';

  return (
    <div className="countdown-ring">
      <svg width={size} height={size}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s' }}
        />
      </svg>
      <span className="countdown-number" style={{ color }}>{seconds}</span>
    </div>
  );
}
