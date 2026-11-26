import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, BrainCircuit, Layers3, RefreshCw, ShieldCheck, Sparkles, Waypoints } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { SectionHeading } from '../components/SectionHeading';
import { Reveal } from '../components/Reveal';
import { Button } from '../components/Button';
import { FinalCTA } from '../sections/FinalCTA';
import { insights } from '../data/market';

const FEATURES = [
  {
    icon: Waypoints,
    title: 'Signal detection',
    copy: 'GMPX monitors breadth, flows, volatility and relative strength to surface changes that deserve attention.',
  },
  {
    icon: Layers3,
    title: 'Narrative context',
    copy: 'A number without context is noise. Every signal is framed against the market regime it belongs to.',
  },
  {
    icon: ShieldCheck,
    title: 'Risk framing',
    copy: 'Confidence is always paired with uncertainty. GMPX tells you what could invalidate the view, not just what supports it.',
  },
];

const STEPS = [
  { n: '01', title: 'Ingest', copy: 'Global prices, breadth, volatility and sector data are normalized into one coherent market state.' },
  { n: '02', title: 'Interpret', copy: 'The signal engine compares the current state with historical regimes and identifies meaningful deviations.' },
  { n: '03', title: 'Illuminate', copy: 'The result is a readable signal: a thesis, the supporting factors, and a confidence level.' },
];

export function IntelligencePage() {
  const [index, setIndex] = useState(0);
  const current = insights[index];
  const reduce = useReducedMotion();
  const circumference = 2 * Math.PI * 42;

  return (
    <>
      <PageHero
        eyebrow="Intelligence · AI-assisted context"
        title={
          <>
            The signal
            <br />
            beneath the noise.
          </>
        }
        description="GMPX intelligence reads the market as a system — breadth, flows, volatility and narrative — then explains what changed in language built for decisions."
        actions={
          <>
            <Button href="#signals" variant="ink" arrow>
              Explore Signals
            </Button>
            <Button to="/pricing" variant="ghost">
              See Plans
            </Button>
          </>
        }
        aside={
          <div className="dark-card p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="eyebrow" style={{ color: 'rgba(244,248,245,.45)', fontSize: 8 }}>
                GMPX signal · demo
              </span>
              <span className="live-pill">
                <i aria-hidden="true" />
                87% confidence
              </span>
            </div>
            <div className="mt-5">
              <span
                className="inline-flex items-center rounded-[3px] px-2 py-1 font-mono text-[7.5px] uppercase tracking-[.14em]"
                style={{ background: 'rgba(199,244,100,.12)', color: '#D3FA8C', border: '1px solid rgba(199,244,100,.2)' }}
              >
                Momentum
              </span>
              <h3 style={{ color: '#F4F8F5', fontSize: 23, lineHeight: 1.05, letterSpacing: '-.04em', marginTop: 12 }}>
                Breadth is improving beneath the index.
              </h3>
              <p style={{ color: 'rgba(244,248,245,.52)', fontSize: 11.5, lineHeight: 1.6, marginTop: 10 }}>
                Advancing issues are outpacing decliners while volatility compresses. The move looks broad, not
                defensive.
              </p>
            </div>
            <div className="mt-5 space-y-2">
              {['Market breadth +18.4%', 'VIX 14.2 (-1.8)', 'Tech leadership intact'].map((factor) => (
                <div
                  key={factor}
                  className="flex items-center justify-between rounded-[4px] border px-3 py-2"
                  style={{ borderColor: 'rgba(255,255,255,.08)', background: 'rgba(255,255,255,.03)' }}
                >
                  <span className="num-mono" style={{ fontSize: 9, color: 'rgba(244,248,245,.6)' }}>
                    {factor}
                  </span>
                  <span style={{ color: '#B4EA45', fontSize: 9 }}>●</span>
                </div>
              ))}
            </div>
            <p className="mt-4" style={{ color: 'rgba(244,248,245,.28)', fontSize: 8, lineHeight: 1.6 }}>
              Illustrative AI output. Not investment advice.
            </p>
          </div>
        }
      />

      <section className="page-section" id="signals" aria-label="Interactive signal engine">
        <div className="gmp-container">
          <SectionHeading
            kicker="Signal engine"
            title="One view. Three ways to read it."
            sub="Cycle through deterministic sample signals. Each one shows the thesis, the supporting factors and the confidence attached to the view."
          />

          <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,.65fr)]">
            <Reveal>
              <div className="dark-card overflow-hidden" style={{ minHeight: 470 }}>
                <div className="flex items-center justify-between gap-3 border-b px-5 py-3" style={{ borderColor: 'rgba(255,255,255,.08)' }}>
                  <div className="flex items-center gap-2">
                    <span className="chip-dot" aria-hidden="true" />
                    <span className="num-mono" style={{ fontSize: 8, color: 'rgba(244,248,245,.45)', letterSpacing: '.12em' }}>
                      GMPX SIGNAL ENGINE · DEMO
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIndex((value) => (value + 1) % insights.length)}
                    className="inline-flex items-center gap-1.5 rounded-[3px] border px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[.12em] transition hover:bg-white/10"
                    style={{ borderColor: 'rgba(255,255,255,.14)', color: 'rgba(244,248,245,.7)' }}
                  >
                    <RefreshCw size={10} />
                    Next signal
                  </button>
                </div>

                <div className="p-5 sm:p-7">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={index}
                      initial={reduce ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                      transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
                    >
                      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                        <div className="max-w-[520px]">
                          <span
                            className="inline-flex items-center rounded-[3px] px-2 py-1 font-mono text-[7.5px] uppercase tracking-[.14em]"
                            style={{ background: 'rgba(199,244,100,.12)', color: '#D3FA8C', border: '1px solid rgba(199,244,100,.2)' }}
                          >
                            {current.tag}
                          </span>
                          <h3 className="mt-4 text-[clamp(24px,3vw,34px)] font-medium leading-[1.03] tracking-[-.045em]" style={{ color: '#F4F8F5' }}>
                            {current.title}
                          </h3>
                          <p className="mt-4 text-[12.5px] leading-[1.7]" style={{ color: 'rgba(244,248,245,.55)' }}>
                            {current.body}
                          </p>
                        </div>

                        <div className="relative flex-none self-start">
                          <svg width="112" height="112" viewBox="0 0 112 112" aria-hidden="true">
                            <circle cx="56" cy="56" r="42" stroke="rgba(255,255,255,.1)" strokeWidth="6" fill="none" />
                            <circle
                              cx="56"
                              cy="56"
                              r="42"
                              stroke="#C7F464"
                              strokeWidth="6"
                              fill="none"
                              strokeLinecap="round"
                              strokeDasharray={circumference}
                              strokeDashoffset={circumference * (1 - current.confidence / 100)}
                              transform="rotate(-90 56 56)"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="num-mono" style={{ fontSize: 20, color: '#F4F8F5', letterSpacing: '-.04em' }}>
                              {current.confidence}%
                            </span>
                            <span className="eyebrow" style={{ fontSize: 6.5, color: 'rgba(244,248,245,.35)' }}>
                              confidence
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-7 grid gap-2 sm:grid-cols-3">
                        {current.factors.map((factor) => (
                          <div
                            key={factor}
                            className="rounded-[4px] border px-3 py-2.5"
                            style={{ borderColor: 'rgba(255,255,255,.08)', background: 'rgba(255,255,255,.03)' }}
                          >
                            <div className="eyebrow" style={{ fontSize: 6.5, color: 'rgba(244,248,245,.3)' }}>
                              Factor
                            </div>
                            <div className="num-mono mt-1" style={{ fontSize: 9.5, color: 'rgba(244,248,245,.72)' }}>
                              {factor}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,.08)' }}>
                    <span className="eyebrow" style={{ fontSize: 7, color: 'rgba(244,248,245,.3)' }}>
                      Deterministic sample output · not live AI
                    </span>
                    <div className="flex items-center gap-1.5">
                      {insights.map((insight, dotIndex) => (
                        <button
                          key={insight.tag}
                          type="button"
                          aria-label={`View signal ${dotIndex + 1}: ${insight.title}`}
                          onClick={() => setIndex(dotIndex)}
                          className="h-1.5 w-1.5 rounded-full transition"
                          style={{ background: dotIndex === index ? '#C7F464' : 'rgba(255,255,255,.2)' }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.08} className="flex flex-col gap-3">
              <div className="light-card p-5">
                <BrainCircuit size={18} style={{ color: '#4C7A1E' }} aria-hidden="true" />
                <h3 className="mt-4 text-[16px] font-medium tracking-[-.02em]">What you are reading</h3>
                <p className="mt-2 text-[12px] leading-relaxed" style={{ color: '#6E7A73' }}>
                  A structured market view: a thesis, three supporting factors and a confidence score. It is designed
                  to improve understanding, not to make a decision for you.
                </p>
              </div>
              <div className="light-card p-5">
                <Sparkles size={18} style={{ color: '#4C7A1E' }} aria-hidden="true" />
                <h3 className="mt-4 text-[16px] font-medium tracking-[-.02em]">Built to be questioned</h3>
                <p className="mt-2 text-[12px] leading-relaxed" style={{ color: '#6E7A73' }}>
                  Every signal shows its factors. If the factors change, the signal changes. Nothing is hidden behind
                  a black box.
                </p>
              </div>
              <div className="light-card p-5">
                <span className="eyebrow" style={{ fontSize: 7.5 }}>
                  Responsible by design
                </span>
                <ul className="mt-3 space-y-2 text-[11.5px]" style={{ color: '#4A5750' }}>
                  <li>— No guaranteed returns.</li>
                  <li>— No automated trading.</li>
                  <li>— No substitute for your judgement.</li>
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="page-section page-section-alt" aria-label="Intelligence capabilities">
        <div className="gmp-container">
          <SectionHeading
            kicker="Three layers of intelligence"
            title="Detection. Context. Risk."
            sub="The signal is only useful if you can see how it was formed and what could prove it wrong."
          />
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <Reveal key={feature.title} delay={index * 0.06} className="light-card p-5">
                <feature.icon size={19} style={{ color: '#4C7A1E' }} aria-hidden="true" />
                <h3 className="mt-6 text-[18px] font-medium tracking-[-.03em]">{feature.title}</h3>
                <p className="mt-3 text-[12px] leading-relaxed" style={{ color: '#6E7A73' }}>
                  {feature.copy}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section" aria-label="How the signal engine works">
        <div className="gmp-container">
          <SectionHeading
            kicker="How it works"
            title="From raw market state to readable signal."
            sub="A disciplined sequence, repeated continuously as the market changes."
          />
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <Reveal key={step.n} delay={index * 0.06} className="relative border-t pt-5" >
                <div className="flex items-start justify-between gap-3">
                  <span className="num-mono text-[11px]" style={{ color: '#4C7A1E' }}>
                    {step.n}
                  </span>
                  {index < STEPS.length - 1 && <ArrowRight size={14} style={{ color: '#82909D' }} aria-hidden="true" />}
                </div>
                <h3 className="mt-5 text-[22px] font-medium tracking-[-.035em]">{step.title}</h3>
                <p className="mt-2 max-w-[330px] text-[12px] leading-relaxed" style={{ color: '#6E7A73' }}>
                  {step.copy}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA
        eyebrow="Understanding is the edge"
        title="See what the market is telling you."
        description="Bring GMPX intelligence into your daily process. Less noise, more context, better questions."
        primaryLabel="Get Started"
        primaryTo="/pricing"
        secondaryLabel="Explore Markets"
        secondaryTo="/markets"
      />
    </>
  );
}
