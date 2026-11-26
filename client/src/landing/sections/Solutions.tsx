import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Chip } from '../components/Brand';
import { LazyMount } from '../components/LazyMount';
import { Reveal, SplitWords } from '../components/Reveal';
import { TiltCard } from '../components/TiltCard';
import { WorldMap } from '../components/WorldMap';
import { CandleChart } from '../components/CandleChart';
import { PortfolioVisual } from '../components/PortfolioVisual';

const CARDS = [
  {
    label: '[ Global Market Access ]',
    title: 'Every Market. One View.',
    description:
      'Track global indices, discover market movements, and stay connected to financial markets worldwide.',
    to: '/markets',
    visual: <WorldMap />,
    accent: '#C7F464',
  },
  {
    label: '[ Advanced Analytics ]',
    title: 'Data Into Decisions.',
    description:
      'Explore market trends, analyze price movements, and uncover insights through powerful financial analytics.',
    to: '/intelligence',
    visual: <CandleChart />,
    accent: '#72B9FF',
  },
  {
    label: '[ Portfolio Management ]',
    title: 'Your Wealth. In Focus.',
    description:
      'Monitor your portfolio, understand performance, and track your investments through one unified experience.',
    to: '/products#portfolio',
    visual: <PortfolioVisual />,
    accent: '#B4EA45',
  },
];

export function Solutions() {
  return (
    <section id="solutions" className="solutions">
      <div className="gmp-container" style={{ paddingInline: 0 }}>
        <div className="solutions-head">
          <div>
            <Reveal>
              <Chip>The GMPX Ecosystem</Chip>
            </Reveal>
            <h2 className="solutions-title">
              <SplitWords text="One Platform. Every Market Opportunity." />
            </h2>
          </div>
          <Reveal delay={0.1}>
            <p className="solutions-sub">
              From tracking global markets to understanding individual stocks, GMPX gives you the intelligence to
              navigate financial markets with confidence.
            </p>
          </Reveal>
        </div>

        <div className="solutions-grid">
          {CARDS.map((card, index) => (
            <Reveal key={card.title} delay={index * 0.08}>
              <TiltCard className="solution-card">
                <LazyMount className="solution-visual" minHeight="100%">
                  {card.visual}
                </LazyMount>
                <div className="solution-veil" aria-hidden="true" />
                <div className="solution-content">
                  <div className="solution-top">
                    <span className="solution-label">{card.label}</span>
                    <Link to={card.to} className="solution-arrow" aria-label={`Explore ${card.title}`}>
                      <ArrowUpRight size={14} strokeWidth={1.8} />
                    </Link>
                  </div>
                  <div>
                    <h3 className="solution-title">{card.title}</h3>
                    <p className="solution-desc">{card.description}</p>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
