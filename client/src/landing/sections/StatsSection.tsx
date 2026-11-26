import { CountUp } from '../components/CountUp';
import { Reveal } from '../components/Reveal';

const STATS = [
  { value: 24, suffix: '/7', label: 'Global market monitoring' },
  { value: 50, suffix: '+', label: 'Markets covered' },
  { value: 100, suffix: 'K+', label: 'Financial instruments tracked' },
  { value: 99.9, suffix: '%', decimals: 1, label: 'Platform availability' },
];

export function StatsSection() {
  return (
    <section className="stats-band" aria-label="GMPX platform statistics">
      <div className="gmp-container" style={{ paddingInline: 0 }}>
        <div className="stats-grid">
          {STATS.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.06} className="stat-cell">
              <div className="stat-value">
                <CountUp value={stat.value} suffix={stat.suffix} decimals={stat.decimals ?? 0} />
              </div>
              <div className="stat-label">{stat.label}</div>
            </Reveal>
          ))}
        </div>
        <p className="stats-note">
          Illustrative brand metrics. Sample marketing content — not verified operational claims.
        </p>
      </div>
    </section>
  );
}
