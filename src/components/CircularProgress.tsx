export function CircularProgress({ score, size = 80 }: { score: number; size?: number }) {
  const strokeWidth = 7;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = Math.min((score / 100) * circumference, circumference);
  const center = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ flexShrink: 0 }}
    >
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#e7e5e4"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#d97706"
        strokeWidth={strokeWidth}
        strokeDasharray={`${strokeDash} ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dy=".35em"
        fontSize={size * 0.24}
        fontWeight="700"
        fill="#1c1917"
      >
        {score}
      </text>
    </svg>
  );
}
