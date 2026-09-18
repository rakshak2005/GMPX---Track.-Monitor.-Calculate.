import React from 'react';

interface SparklineProps {
  trend?: 'up' | 'down' | 'flat';
  points?: number[];
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function Sparkline({
  trend = 'flat',
  points,
  color,
  width = 56,
  height = 18,
  className = '',
}: SparklineProps) {
  const data = points && points.length >= 2
    ? points
    : trend === 'up'
    ? [20, 24, 22, 28, 26, 32, 36]
    : trend === 'down'
    ? [36, 32, 34, 28, 26, 22, 18]
    : [25, 26, 25, 25, 26, 25, 25];

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max === min ? 1 : max - min;
  const padding = 2;

  const strokeColor = color
    ? color
    : trend === 'up'
    ? '#10B981'
    : trend === 'down'
    ? '#EF4444'
    : '#64748B';

  const coords = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${coords.join(' L ')}`;

  return (
    <svg
      width={width}
      height={height}
      className={`inline-block overflow-visible ${className}`}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={pathD}
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {coords.length > 0 && (
        <circle
          cx={coords[coords.length - 1].split(',')[0]}
          cy={coords[coords.length - 1].split(',')[1]}
          r="1.75"
          fill={strokeColor}
        />
      )}
    </svg>
  );
}
