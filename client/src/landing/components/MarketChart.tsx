import { useId, useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { RANGES, rangeMeta, seriesForRange, type Range } from '../data/market';
import { usePrefersReducedMotion } from '../hooks/useEnvironment';

interface TipPayload {
  value?: number;
  payload?: { label: string; value: number };
}

function ChartTip({
  active,
  payload,
  dark,
}: {
  active?: boolean;
  payload?: TipPayload[];
  dark?: boolean;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  const value = item.value ?? item.payload?.value ?? 0;
  return (
    <div
      style={{
        background: dark ? 'rgba(13,23,19,.96)' : 'rgba(255,255,255,.97)',
        border: `1px solid ${dark ? 'rgba(255,255,255,.14)' : 'rgba(11,21,18,.12)'}`,
        borderRadius: 4,
        padding: '7px 9px',
        boxShadow: '0 12px 30px -18px rgba(0,0,0,.5)',
      }}
    >
      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 7.5,
          letterSpacing: '.12em',
          color: dark ? 'rgba(244,247,250,.45)' : '#6E7A73',
          textTransform: 'uppercase',
        }}
      >
        {item.payload?.label ?? ''}
      </div>
      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 12,
          marginTop: 3,
          color: dark ? '#D3FA8C' : '#0B1512',
        }}
      >
        {value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
    </div>
  );
}

export function RangeSwitcher({
  range,
  onChange,
  dark = false,
}: {
  range: Range;
  onChange: (range: Range) => void;
  dark?: boolean;
}) {
  return (
    <div className="flex items-center gap-1 flex-wrap" role="group" aria-label="Chart time range">
      {RANGES.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          aria-pressed={range === item}
          className={`range-btn ${range === item ? 'is-active' : ''}`}
          style={
            !dark && range !== item
              ? { color: '#6E7A73' }
              : !dark && range === item
                ? { background: '#0B1512', color: '#F4F8F5' }
                : undefined
          }
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export function MarketChart({
  range,
  dark = false,
  height = 260,
  showGrid = true,
  scale = 1,
}: {
  range: Range;
  dark?: boolean;
  height?: number;
  showGrid?: boolean;
  scale?: number;
}) {
  const rawId = useId();
  const gradientId = `chart-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const source = useMemo(() => seriesForRange(range), [range]);
  const data = useMemo(
    () =>
      scale === 1
        ? source
        : source.map((point) => ({ ...point, value: Number((point.value * scale).toFixed(2)) })),
    [source, scale],
  );
  const meta = rangeMeta(range);
  const reduce = usePrefersReducedMotion();

  const { domain, ticks } = useMemo(() => {
    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = (max - min) * 0.14;
    const low = Math.floor(min - pad);
    const high = Math.ceil(max + pad);
    return {
      domain: [low, high] as [number, number],
      ticks: [low, Math.round((low + high) / 2), high],
    };
  }, [data]);

  const last = data[data.length - 1];
  const line = dark ? '#C7F464' : '#4C7A1E';
  const grid = dark ? 'rgba(255,255,255,.06)' : 'rgba(11,21,18,.07)';
  const axis = dark ? 'rgba(244,247,250,.35)' : 'rgba(11,21,18,.4)';

  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={line} stopOpacity={dark ? 0.32 : 0.22} />
              <stop offset="70%" stopColor={line} stopOpacity={dark ? 0.06 : 0.04} />
              <stop offset="100%" stopColor={line} stopOpacity="0" />
            </linearGradient>
          </defs>
          {showGrid && (
            <CartesianGrid stroke={grid} strokeDasharray="2 6" vertical={false} />
          )}
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, fill: axis }}
            interval={Math.max(0, Math.floor(data.length / 5) - 1)}
            dy={6}
            minTickGap={18}
          />
          <YAxis
            orientation={dark ? 'right' : 'left'}
            domain={domain}
            ticks={ticks}
            tickLine={false}
            axisLine={false}
            width={46}
            tick={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 7.5, fill: axis }}
            tickFormatter={(value: number) => value.toLocaleString('en-US')}
          />
          <Tooltip
            content={<ChartTip dark={dark} />}
            cursor={{ stroke: dark ? 'rgba(255,255,255,.2)' : 'rgba(11,21,18,.2)', strokeDasharray: '3 4' }}
          />
          <ReferenceLine
            y={last.value}
            stroke={dark ? 'rgba(199,244,100,.28)' : 'rgba(76,122,30,.3)'}
            strokeDasharray="3 5"
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={line}
            strokeWidth={dark ? 1.8 : 1.7}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 3, fill: line, stroke: dark ? '#0A1310' : '#fff', strokeWidth: 2 }}
            isAnimationActive={!reduce}
            animationDuration={650}
          />
          <ReferenceDot
            x={last.label}
            y={last.value}
            r={3}
            fill={line}
            stroke={dark ? '#0A1310' : '#FFFFFF'}
            strokeWidth={2}
            isFront
          />
        </AreaChart>
      </ResponsiveContainer>
      <span className="sr-only">
        {range} market performance chart. High {meta.high}, low {meta.low}, change {meta.changePct}%.
      </span>
    </div>
  );
}
