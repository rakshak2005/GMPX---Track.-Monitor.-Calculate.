import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

export function SectionHeading({
  kicker,
  title,
  sub,
  actions,
  className = '',
}: {
  kicker: string;
  title: ReactNode;
  sub?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${className}`}>
      <div>
        <Reveal>
          <div className="section-kicker">{kicker}</div>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="section-title">{title}</h2>
        </Reveal>
        {sub && (
          <Reveal delay={0.1}>
            <p className="section-sub">{sub}</p>
          </Reveal>
        )}
      </div>
      {actions && <Reveal delay={0.12}>{actions}</Reveal>}
    </div>
  );
}
