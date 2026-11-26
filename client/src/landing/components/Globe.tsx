import { globePins } from '../data/market';
import { MiniChart } from './MiniChart';

const PIN_CLASSES = ['pin-nasdaq', 'pin-sp', 'pin-dow', 'pin-nifty', 'pin-sensex', 'pin-ftse'];

export function Globe() {
  return (
    <div className="hero-globe" aria-hidden="true">
      <div className="globe-halo" />
      <div className="globe-orbit one" />
      <div className="globe-orbit two" />
      <div className="globe-orbit three" />

      <svg
        className="globe-svg"
        viewBox="0 0 800 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="presentation"
      >
        <defs>
          <radialGradient id="globeSphere" cx="38%" cy="28%" r="78%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.82" />
            <stop offset="48%" stopColor="#FFFFFF" stopOpacity="0.28" />
            <stop offset="82%" stopColor="#FFFFFF" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="globeArc" x1="180" y1="180" x2="640" y2="620" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8FD83C" stopOpacity="0" />
            <stop offset="0.25" stopColor="#8FD83C" stopOpacity="0.9" />
            <stop offset="0.72" stopColor="#C7F464" />
            <stop offset="1" stopColor="#C7F464" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="globeArcBlue" x1="200" y1="560" x2="650" y2="380" gradientUnits="userSpaceOnUse">
            <stop stopColor="#72B9FF" stopOpacity="0" />
            <stop offset="0.45" stopColor="#72B9FF" stopOpacity="0.55" />
            <stop offset="1" stopColor="#72B9FF" stopOpacity="0" />
          </linearGradient>
          <filter id="globeGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="globeClip">
            <circle cx="400" cy="400" r="298" />
          </clipPath>
          <pattern id="globeDots" width="15" height="15" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.9" fill="#0B1512" fillOpacity="0.2" />
          </pattern>
        </defs>

        {/* frosted sphere */}
        <circle cx="400" cy="400" r="298" fill="url(#globeSphere)" stroke="rgba(11,21,18,0.16)" strokeWidth="1" />
        <circle cx="400" cy="400" r="298" fill="url(#globeDots)" opacity="0.5" />

        <g transform="rotate(-17 400 400)" clipPath="url(#globeClip)">
          {/* longitudes */}
          {[40, 105, 170, 235, 298].map((rx) => (
            <ellipse
              key={`lon-${rx}`}
              cx="400"
              cy="400"
              rx={rx}
              ry="298"
              stroke="#0B1512"
              strokeOpacity="0.15"
              strokeWidth="1"
            />
          ))}
          {/* latitudes */}
          {[-62, -31, 0, 31, 62].map((lat) => {
            const rad = (lat * Math.PI) / 180;
            const cy = 400 + Math.sin(rad) * 298;
            const rx = Math.cos(rad) * 298;
            return (
              <ellipse
                key={`lat-${lat}`}
                cx="400"
                cy={cy}
                rx={rx}
                ry={14 + Math.abs(Math.cos(rad)) * 4}
                stroke="#0B1512"
                strokeOpacity="0.12"
                strokeWidth="1"
              />
            );
          })}
          {/* meridian highlight */}
          <ellipse cx="400" cy="400" rx="298" ry="298" stroke="#0B1512" strokeOpacity="0.06" />
          <ellipse cx="400" cy="400" rx="238" ry="298" stroke="#4C7A1E" strokeOpacity="0.12" strokeWidth="1" />
        </g>

        {/* trade arcs */}
        <g filter="url(#globeGlow)">
          <path
            d="M204 330 C 300 150, 520 160, 610 320"
            stroke="url(#globeArc)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeDasharray="7 9"
            className="animate-dash"
          />
          <path
            d="M236 512 C 350 380, 500 420, 626 486"
            stroke="url(#globeArc)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeDasharray="5 10"
            className="animate-dash"
            style={{ animationDuration: '12s' }}
          />
          <path
            d="M292 630 C 400 470, 540 470, 640 556"
            stroke="url(#globeArcBlue)"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeDasharray="4 11"
            className="animate-dash"
            style={{ animationDuration: '15s' }}
          />
        </g>

        {/* limb highlight */}
        <path
          d="M400 102 A298 298 0 0 1 698 400"
          stroke="#C7F464"
          strokeOpacity="0.75"
          strokeWidth="2"
          strokeLinecap="round"
          filter="url(#globeGlow)"
        />
        <path
          d="M698 400 A298 298 0 0 1 528 672"
          stroke="#0B1512"
          strokeOpacity="0.18"
          strokeWidth="1"
        />

        {/* exchange nodes */}
        {[
          { x: 268, y: 294, delay: 0 },
          { x: 560, y: 272, delay: 0.7 },
          { x: 232, y: 506, delay: 1.4 },
          { x: 470, y: 466, delay: 0.4 },
          { x: 590, y: 538, delay: 1.1 },
          { x: 356, y: 612, delay: 1.8 },
        ].map((node) => (
          <g key={`${node.x}-${node.y}`}>
            <circle cx={node.x} cy={node.y} r="9" fill="#8FD83C" opacity="0.12">
              <animate attributeName="r" values="5;14;5" dur="3.6s" begin={`${node.delay}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0;0.3" dur="3.6s" begin={`${node.delay}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={node.x} cy={node.y} r="3.2" fill="#5F8F14" stroke="#F6F7F2" strokeWidth="1.5" />
          </g>
        ))}

        {/* coordinate ticks */}
        {Array.from({ length: 48 }).map((_, i) => {
          const angle = (i / 48) * Math.PI * 2;
          const inner = i % 4 === 0 ? 286 : 292;
          const x1 = 400 + Math.cos(angle) * inner;
          const y1 = 400 + Math.sin(angle) * inner;
          const x2 = 400 + Math.cos(angle) * 304;
          const y2 = 400 + Math.sin(angle) * 304;
          return (
            <line
              key={`tick-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#0B1512"
              strokeOpacity={i % 4 === 0 ? 0.24 : 0.1}
              strokeWidth="1"
            />
          );
        })}
      </svg>

      {globePins.map((pin, index) => (
        <div key={pin.id} className={`globe-pin ${pin.up ? 'up' : 'down'} ${PIN_CLASSES[index]}`}>
          <div>
            <div className="pin-id">{pin.id}</div>
            <div className="pin-val">{pin.value}</div>
          </div>
          <MiniChart
            points={pin.points}
            width={42}
            height={16}
            color={pin.up ? '#5F8F14' : '#C23B41'}
            className="pin-chart"
            strokeWidth={1.2}
          />
        </div>
      ))}
    </div>
  );
}
