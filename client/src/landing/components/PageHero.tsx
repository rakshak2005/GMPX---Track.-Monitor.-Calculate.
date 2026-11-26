import type { ReactNode } from 'react';
import { Chip } from '../components/Brand';
import { Reveal } from '../components/Reveal';

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  aside,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  actions?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="page-hero grain">
      <div className="page-hero-grid fin-grid" aria-hidden="true" />
      <div className="gmp-container page-hero-inner">
        <div>
          <Reveal>
            <Chip>{eyebrow}</Chip>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="page-title">{title}</h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="page-sub">{description}</p>
          </Reveal>
          {actions && (
            <Reveal delay={0.18}>
              <div className="page-hero-actions">{actions}</div>
            </Reveal>
          )}
        </div>
        {aside && (
          <Reveal delay={0.16} className="page-hero-aside">
            {aside}
          </Reveal>
        )}
      </div>
    </section>
  );
}
