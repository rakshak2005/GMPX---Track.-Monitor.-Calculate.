import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

type Variant = 'lime' | 'ink' | 'ghost' | 'dark-ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  to?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  arrow?: boolean;
  icon?: ReactNode;
  type?: 'button' | 'submit';
  ariaLabel?: string;
}

export function Button({
  children,
  variant = 'lime',
  size = 'md',
  to,
  href,
  onClick,
  className = '',
  arrow = false,
  icon,
  type = 'button',
  ariaLabel,
}: ButtonProps) {
  const classes = [
    'btn',
    `btn-${variant}`,
    size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const inner = (
    <>
      {icon}
      <span>{children}</span>
      {arrow && <ArrowRight size={15} strokeWidth={1.8} className="btn-arrow" aria-hidden="true" />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} aria-label={ariaLabel}>
        {inner}
      </Link>
    );
  }
  if (href) {
    return (
      <a
        href={href}
        className={classes}
        aria-label={ariaLabel}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {inner}
      </a>
    );
  }
  return (
    <button type={type} className={classes} onClick={onClick} aria-label={ariaLabel}>
      {inner}
    </button>
  );
}
