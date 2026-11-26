import { useId } from 'react';

const ALLOCATIONS = [
  { label: 'Equities', value: 52, color: '#C7F464' },
  { label: 'Fixed income', value: 24, color: '#72B9FF' },
  { label: 'Alternatives', value: 14, color: '#8FD83C' },
  { label: 'Cash', value: 10, color: 'rgba(255,255,255,.28)' },
];

export function PortfolioVisual() {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
  const areaId = `pf-area-${id}`;
  const glowId = `pf-glow-${id}`;

  const r = 84;
  const circumference = 2 * Math.PI * r;
  let cumulative = 0;

  const chartPoints = [46, 54, 49, 63, 69, 64, 78, 84, 80, 93, 101, 97, 112, 121];
  const cx = 300;
  const cy = 258;
  const cw = 300;
  const ch = 150;

  const coords = chartPoints.map((value, index) => {
    const x = cx + (index / (chartPoints.length - 1)) * cw;
    const y = cy - ((value - 40) / 90) * ch;
    return { x, y };
  });

  const line = coords.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L ${coords[coords.length - 1].x} ${cy} L ${coords[0].x} ${cy} Z`;
  const end = coords[coords.length - 1];

  return (
    <svg
      viewBox="0 0 640 400"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <linearGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C7F464" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#C7F464" stopOpacity="0" />
        </linearGradient>
        <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={`pf-bg-${id}`} cx="28%" cy="28%" r="75%">
          <stop offset="0%" stopColor="#C7F464" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#C7F464" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="640" height="400" fill={`url(#pf-bg-${id})`} />

      <text x="26" y="34" fill="rgba(244,248,245,.72)" fontFamily="JetBrains Mono, monospace" fontSize="8" letterSpacing="1.5">
        PORTFOLIO PERFORMANCE
      </text>
      <text x="26" y="50" fill="rgba(244,248,245,.3)" fontFamily="JetBrains Mono, monospace" fontSize="6.5" letterSpacing="1">
        ALL ACCOUNTS · DEMO
      </text>

      {/* allocation donut */}
      <g transform="translate(170 205)">
        <circle r={r + 17} stroke="rgba(255,255,255,.08)" strokeDasharray="1 6" />
        <circle r={r} stroke="rgba(255,255,255,.06)" strokeWidth="16" />
        {ALLOCATIONS.map((slice) => {
          const length = (slice.value / 100) * circumference;
          const offset = -cumulative * circumference;
          cumulative += slice.value / 100;
          return (
            <circle
              key={slice.label}
              r={r}
              stroke={slice.color}
              strokeWidth="15"
              strokeDasharray={`${Math.max(0, length - 6)} ${circumference}`}
              strokeDashoffset={offset}
              transform="rotate(-90)"
              strokeLinecap="round"
            />
          );
        })}
        <text textAnchor="middle" y="-16" fill="rgba(244,248,245,.36)" fontFamily="JetBrains Mono, monospace" fontSize="6.5" letterSpacing="1.3">
          TOTAL VALUE
        </text>
        <text textAnchor="middle" y="7" fill="#F4F8F5" fontFamily="Inter Tight, sans-serif" fontSize="25" letterSpacing="-1">
          $284,120
        </text>
        <text textAnchor="middle" y="26" fill="#B4EA45" fontFamily="JetBrains Mono, monospace" fontSize="7.5" letterSpacing=".6">
          +18.4% YTD
        </text>
        <circle r="3" cy="-52" fill="#C7F464" />
      </g>

      {/* legend */}
      <g transform="translate(26 318)">
        {ALLOCATIONS.map((slice, index) => (
          <g key={slice.label} transform={`translate(${(index % 2) * 130} ${Math.floor(index / 2) * 18})`}>
            <rect width="6" height="6" rx="1" fill={slice.color} />
            <text x="11" y="6" fill="rgba(244,248,245,.5)" fontFamily="JetBrains Mono, monospace" fontSize="6.5" letterSpacing=".5">
              {slice.label.toUpperCase()}
            </text>
            <text x="105" y="6" textAnchor="end" fill="rgba(244,248,245,.78)" fontFamily="JetBrains Mono, monospace" fontSize="6.5">
              {slice.value}%
            </text>
          </g>
        ))}
      </g>

      {/* performance chart */}
      <text x={cx} y="54" fill="rgba(244,248,245,.5)" fontFamily="JetBrains Mono, monospace" fontSize="6.5" letterSpacing="1.1">
        PERFORMANCE · 12M
      </text>
      <text x={cx + cw} y="54" textAnchor="end" fill="rgba(199,244,100,.75)" fontFamily="JetBrains Mono, monospace" fontSize="7" letterSpacing=".6">
        +18.4%
      </text>

      {[0, 1, 2, 3].map((i) => {
        const gy = 108 + i * 50;
        return <line key={`g-${i}`} x1={cx} y1={gy} x2={cx + cw} y2={gy} stroke="rgba(255,255,255,.05)" strokeDasharray="2 5" />;
      })}

      <path d={area} fill={`url(#${areaId})`} />
      <path d={line} stroke="#C7F464" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" filter={`url(#${glowId})`} />
      <line x1={end.x} y1={end.y} x2={end.x} y2={cy} stroke="rgba(199,244,100,.2)" strokeDasharray="2 4" />
      <circle cx={end.x} cy={end.y} r="3" fill="#C7F464" stroke="#0A1310" strokeWidth="1.5" />

      {['JAN', 'MAR', 'MAY', 'JUL', 'SEP', 'NOV'].map((label, index) => (
        <text
          key={label}
          x={cx + (index / 5) * cw}
          y={cy + 16}
          textAnchor={index === 0 ? 'start' : index === 5 ? 'end' : 'middle'}
          fill="rgba(244,248,245,.24)"
          fontFamily="JetBrains Mono, monospace"
          fontSize="6"
          letterSpacing=".6"
        >
          {label}
        </text>
      ))}

      <g transform="translate(300 296)">
        <rect width="84" height="28" rx="4" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.08)" />
        <text x="8" y="11" fill="rgba(244,248,245,.34)" fontFamily="JetBrains Mono, monospace" fontSize="5.5" letterSpacing=".8">
          BEST PERFORMER
        </text>
        <text x="8" y="21" fill="#D3FA8C" fontFamily="JetBrains Mono, monospace" fontSize="7">
          NVDA · +42.8%
        </text>
      </g>
    </svg>
  );
}
