import type { ReactNode } from 'react';

export function Logo({ className = '', wordClassName = '' }: { className?: string; wordClassName?: string }) {
  return (
    <span className={`gmp-logo ${className}`}>
      <svg
        className="gmp-logo-mark"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="28" height="28" rx="7" fill="#C7F464" />
        <path
          d="M7 19.5V14.6M12.3 19.5V10.2M17.6 19.5V12.4M22.9 19.5V7.2"
          stroke="#0B1512"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
        <path
          d="M6.6 9.6L12.2 7.1L17.6 8.9L22.6 4.7"
          stroke="#0B1512"
          strokeOpacity=".32"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={`gmp-logo-word ${wordClassName}`}>GMPX</span>
    </span>
  );
}

export function Chip({
  children,
  dark = false,
  dot = true,
  className = '',
}: {
  children: ReactNode;
  dark?: boolean;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span className={`chip ${dark ? 'chip-dark' : ''} ${className}`}>
      {dot && <span className="chip-dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
