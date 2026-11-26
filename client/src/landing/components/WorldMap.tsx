import { useId } from 'react';

export function WorldMap() {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
  const maskId = `map-mask-${id}`;
  const dotId = `map-dots-${id}`;
  const glowId = `map-glow-${id}`;
  const arcId = `map-arc-${id}`;

  const nodes = [
    { x: 148, y: 122, label: 'NYSE', labelX: 148, labelY: 108 },
    { x: 306, y: 92, label: 'LSE', labelX: 306, labelY: 78 },
    { x: 420, y: 168, label: 'NSE', labelX: 420, labelY: 184 },
    { x: 543, y: 120, label: 'TSE', labelX: 543, labelY: 106 },
    { x: 489, y: 196, label: 'SGX', labelX: 489, labelY: 212 },
    { x: 558, y: 268, label: 'ASX', labelX: 558, labelY: 284 },
  ];

  const arcs = [
    'M148 122 Q 230 62 306 92',
    'M306 92 Q 375 112 420 168',
    'M420 168 Q 455 166 489 196',
    'M489 196 Q 530 140 543 120',
    'M543 120 Q 575 190 558 268',
    'M148 122 Q 250 240 420 168',
  ];

  return (
    <svg
      viewBox="0 0 640 360"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <pattern id={dotId} width="11" height="11" patternUnits="userSpaceOnUse">
          <circle cx="1.6" cy="1.6" r="1.15" fill="#C7F464" fillOpacity="0.62" />
        </pattern>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="640" height="360">
          <g fill="#fff">
            <path d="M52 92 L96 64 L158 62 L196 78 L212 102 L188 124 L162 132 L152 162 L128 180 L106 160 L88 136 L58 122 Z" />
            <ellipse cx="206" cy="58" rx="23" ry="12" />
            <path d="M148 194 L186 184 L206 210 L198 248 L184 292 L166 306 L152 278 L148 238 Z" />
            <path d="M272 80 L306 66 L342 78 L352 96 L332 112 L304 118 L284 104 Z" />
            <path d="M296 130 L342 126 L368 152 L360 190 L344 226 L318 246 L300 232 L290 196 L282 158 Z" />
            <path d="M350 68 L430 52 L500 66 L548 92 L562 112 L538 134 L506 146 L474 132 L452 148 L420 142 L388 122 L362 106 Z" />
            <path d="M404 148 L430 142 L440 166 L428 198 L412 180 Z" />
            <path d="M454 164 L492 156 L520 176 L510 202 L480 208 L458 188 Z" />
            <path d="M502 232 L554 220 L588 244 L578 278 L546 298 L514 286 L498 258 Z" />
            <ellipse cx="572" cy="150" rx="8" ry="17" />
            <ellipse cx="576" cy="198" rx="5" ry="10" />
            <ellipse cx="291" cy="72" rx="9" ry="6" />
            <ellipse cx="218" cy="300" rx="14" ry="5" />
            <ellipse cx="128" cy="228" rx="10" ry="6" />
          </g>
        </mask>
        <filter id={glowId} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={arcId} x1="100" y1="80" x2="560" y2="280" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C7F464" stopOpacity="0.15" />
          <stop offset="0.45" stopColor="#C7F464" stopOpacity="0.7" />
          <stop offset="1" stopColor="#8FD83C" stopOpacity="0.25" />
        </linearGradient>
      </defs>

      <rect width="640" height="360" fill="#0A1310" />

      {/* ocean grid */}
      {Array.from({ length: 9 }).map((_, i) => (
        <line
          key={`v-${i}`}
          x1={i * 80}
          y1="0"
          x2={i * 80}
          y2="360"
          stroke="rgba(255,255,255,.035)"
        />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <line
          key={`h-${i}`}
          x1="0"
          y1={i * 72}
          x2="640"
          y2={i * 72}
          stroke="rgba(255,255,255,.035)"
        />
      ))}

      {/* continents as dot matrix */}
      <rect width="640" height="360" fill={`url(#${dotId})`} mask={`url(#${maskId})`} />
      <rect width="640" height="360" fill={`url(#${dotId})`} mask={`url(#${maskId})`} opacity="0.35" transform="translate(2 2)" />

      {/* connection arcs */}
      <g filter={`url(#${glowId})`}>
        {arcs.map((d, index) => (
          <path
            key={`arc-${index}`}
            d={d}
            stroke={`url(#${arcId})`}
            strokeWidth={index === 5 ? 0.8 : 1.2}
            strokeDasharray="4 6"
            className="animate-dash"
            style={{ animationDuration: `${10 + index * 2}s` }}
          />
        ))}
      </g>

      {/* nodes */}
      {nodes.map((node, index) => (
        <g key={node.label}>
          <circle cx={node.x} cy={node.y} r="10" fill="#C7F464" opacity="0.1">
            <animate
              attributeName="r"
              values="5;14;5"
              dur="3.8s"
              begin={`${index * 0.55}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.3;0;0.3"
              dur="3.8s"
              begin={`${index * 0.55}s`}
              repeatCount="indefinite"
            />
          </circle>
          <circle cx={node.x} cy={node.y} r="3" fill="#D3FA8C" stroke="#0A1310" strokeWidth="1.4" />
          <text
            x={node.labelX}
            y={node.labelY}
            textAnchor="middle"
            fill="rgba(244,248,245,.58)"
            fontFamily="JetBrains Mono, monospace"
            fontSize="6.5"
            letterSpacing="1"
          >
            {node.label}
          </text>
        </g>
      ))}

      {/* decorative labels */}
      <text x="22" y="340" fill="rgba(199,244,100,.5)" fontFamily="JetBrains Mono, monospace" fontSize="6.5" letterSpacing="1.2">
        GLOBAL EXCHANGE NETWORK
      </text>
      <text x="618" y="28" textAnchor="end" fill="rgba(244,248,245,.3)" fontFamily="JetBrains Mono, monospace" fontSize="6.5" letterSpacing="1">
        24 / 7
      </text>
    </svg>
  );
}
