import { candleMA, candles } from '../data/market';

const W = 720;
const H = 380;
const LEFT = 18;
const RIGHT = 656;
const TOP = 42;
const BOTTOM = 246;
const VOL_TOP = 278;
const VOL_BOTTOM = 338;

export function CandleChart() {
  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);
  const max = Math.max(...highs);
  const min = Math.min(...lows);
  const range = max - min || 1;
  const maxVol = Math.max(...candles.map((c) => c.volume));

  const slot = (RIGHT - LEFT) / candles.length;
  const bodyWidth = slot * 0.52;

  const y = (value: number) => BOTTOM - ((value - min) / range) * (BOTTOM - TOP);
  const x = (index: number) => LEFT + slot * index + slot / 2;

  const maPath = candleMA
    .map((value, index) => `${index === 0 ? 'M' : 'L'} ${x(index).toFixed(2)} ${y(value).toFixed(2)}`)
    .join(' ');

  const last = candles[candles.length - 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: '100%', height: '100%' }}
    >
      <defs>
        <linearGradient id="candleFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C7F464" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#C7F464" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* header */}
      <text x={LEFT} y="22" fill="rgba(244,248,245,.78)" fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="1.4">
        NASDAQ · IXIC · 5M
      </text>
      <text x={RIGHT} y="22" textAnchor="end" fill="rgba(199,244,100,.75)" fontFamily="JetBrains Mono, monospace" fontSize="8" letterSpacing="1.1">
        DEMO CHART
      </text>

      {/* grid */}
      {[0, 1, 2, 3, 4].map((i) => {
        const gy = TOP + ((BOTTOM - TOP) / 4) * i;
        const label = max - (range / 4) * i;
        return (
          <g key={`h-${i}`}>
            <line x1={LEFT} y1={gy} x2={RIGHT} y2={gy} stroke="rgba(255,255,255,.07)" strokeDasharray="2 5" />
            <text x={RIGHT + 8} y={gy + 3} fill="rgba(244,248,245,.32)" fontFamily="JetBrains Mono, monospace" fontSize="7">
              {label.toFixed(0)}
            </text>
          </g>
        );
      })}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const gx = LEFT + ((RIGHT - LEFT) / 6) * i;
        return (
          <line key={`v-${i}`} x1={gx} y1={TOP} x2={gx} y2={VOL_BOTTOM} stroke="rgba(255,255,255,.035)" />
        );
      })}

      {/* volume */}
      {candles.map((candle, index) => {
        const up = candle.close >= candle.open;
        const barHeight = (candle.volume / maxVol) * (VOL_BOTTOM - VOL_TOP);
        return (
          <rect
            key={`vol-${index}`}
            x={x(index) - bodyWidth / 2}
            y={VOL_BOTTOM - barHeight}
            width={bodyWidth}
            height={barHeight}
            fill={up ? 'rgba(199,244,100,.3)' : 'rgba(222,76,82,.28)'}
          />
        );
      })}
      <line x1={LEFT} y1={VOL_TOP - 8} x2={RIGHT} y2={VOL_TOP - 8} stroke="rgba(255,255,255,.08)" />
      <text x={LEFT} y={VOL_TOP - 13} fill="rgba(244,248,245,.3)" fontFamily="JetBrains Mono, monospace" fontSize="6.5" letterSpacing="1">
        VOLUME
      </text>

      {/* candles */}
      {candles.map((candle, index) => {
        const up = candle.close >= candle.open;
        const color = up ? '#B4EA45' : '#DE4C52';
        const openY = y(candle.open);
        const closeY = y(candle.close);
        const top = Math.min(openY, closeY);
        const bodyHeight = Math.max(1.6, Math.abs(closeY - openY));
        return (
          <g key={`candle-${index}`}>
            <title>
              {`Open ${candle.open.toFixed(2)} · High ${candle.high.toFixed(2)} · Low ${candle.low.toFixed(2)} · Close ${candle.close.toFixed(2)}`}
            </title>
            <line
              x1={x(index)}
              y1={y(candle.high)}
              x2={x(index)}
              y2={y(candle.low)}
              stroke={color}
              strokeWidth="1"
              opacity="0.8"
            />
            <rect
              x={x(index) - bodyWidth / 2}
              y={top}
              width={bodyWidth}
              height={bodyHeight}
              fill={up ? color : 'rgba(10,19,16,.9)'}
              stroke={color}
              strokeWidth="1"
            />
          </g>
        );
      })}

      {/* moving average */}
      <path d={maPath} stroke="#C7F464" strokeOpacity="0.55" strokeWidth="1.4" strokeLinecap="round" />
      <text x={LEFT} y={TOP - 10} fill="rgba(199,244,100,.6)" fontFamily="JetBrains Mono, monospace" fontSize="6.5" letterSpacing="1">
        MA 6 · 148.62
      </text>

      {/* current price */}
      <line x1={LEFT} y1={y(last.close)} x2={RIGHT} y2={y(last.close)} stroke="rgba(199,244,100,.45)" strokeDasharray="3 4" />
      <rect x={RIGHT + 2} y={y(last.close) - 7} width="50" height="14" rx="2" fill="#C7F464" />
      <text x={RIGHT + 27} y={y(last.close) + 3} textAnchor="middle" fill="#0B1512" fontFamily="JetBrains Mono, monospace" fontSize="7" fontWeight="600">
        {last.close.toFixed(2)}
      </text>

      {/* footer labels */}
      <text x={LEFT} y={H - 8} fill="rgba(244,248,245,.28)" fontFamily="JetBrains Mono, monospace" fontSize="7" letterSpacing=".8">
        09:30
      </text>
      <text x={W / 2} y={H - 8} textAnchor="middle" fill="rgba(244,248,245,.28)" fontFamily="JetBrains Mono, monospace" fontSize="7" letterSpacing=".8">
        12:00
      </text>
      <text x={RIGHT} y={H - 8} textAnchor="end" fill="rgba(244,248,245,.28)" fontFamily="JetBrains Mono, monospace" fontSize="7" letterSpacing=".8">
        15:30
      </text>
    </svg>
  );
}
