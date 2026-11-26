import { useState } from 'react';
import { Check, ChevronDown, Minus, ShieldCheck, Sparkles } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { SectionHeading } from '../components/SectionHeading';
import { Reveal } from '../components/Reveal';
import { Button } from '../components/Button';
import { FinalCTA } from '../sections/FinalCTA';
import { plans } from '../data/market';

const FAQS = [
  {
    q: 'Is GMPX live market data?',
    a: 'Not in this demonstration. Every price, chart and metric on this site is clearly labelled sample data. A production deployment can connect a licensed market-data provider; until then, nothing here should be treated as a live quote.',
  },
  {
    q: 'Can I use GMPX without a subscription?',
    a: 'The Explorer plan is designed as a free entry point with delayed data and a limited watchlist. Pro adds real-time indices, advanced charting and AI-assisted signals.',
  },
  {
    q: 'Does GMPX give investment advice?',
    a: 'No. GMPX is an information and analytics platform. Signals and narratives are illustrative, are not recommendations, and do not account for your personal circumstances.',
  },
  {
    q: 'Can my team share access?',
    a: 'Institutional plans include shared workspaces, role-based access and audit trails. Contact the team to scope coverage and seats.',
  },
  {
    q: 'How does the trial work?',
    a: 'The 14-day Pro trial is illustrative in this demo and no payment is collected. In a production environment, billing would be handled by a secure payment provider.',
  },
];

const COMPARISON = [
  { feature: 'Global market overview', explorer: true, pro: true, inst: true },
  { feature: 'Real-time indices', explorer: false, pro: true, inst: true },
  { feature: 'Advanced charting', explorer: 'Basic', pro: true, inst: true },
  { feature: 'AI market insights', explorer: false, pro: true, inst: true },
  { feature: 'Portfolio analytics', explorer: false, pro: true, inst: true },
  { feature: 'Team workspaces', explorer: false, pro: false, inst: true },
  { feature: 'API & exports', explorer: false, pro: 'Limited', inst: true },
  { feature: 'SSO & audit trails', explorer: false, pro: false, inst: true },
];

function Value({ value }: { value: boolean | string }) {
  if (typeof value === 'string') {
    return <span className="num-mono" style={{ fontSize: 9, color: '#6E7A73' }}>{value}</span>;
  }
  return value ? (
    <Check size={14} style={{ color: '#4C7A1E' }} aria-label="Included" />
  ) : (
    <Minus size={14} style={{ color: '#B9C0BA' }} aria-label="Not included" />
  );
}

export function PricingPage() {
  const [annual, setAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      <PageHero
        eyebrow="Pricing · Plans"
        title={
          <>
            Clarity is
            <br />
            the product.
          </>
        }
        description="Start with the market overview. Move up when you need real-time context, deeper analytics and AI-assisted signals. No hidden tiers, no surprise data fees."
        aside={
          <div className="light-card p-5">
            <div className="flex items-center gap-2">
              <span className="chip-dot" aria-hidden="true" />
              <span className="eyebrow" style={{ fontSize: 7.5 }}>
                Every plan includes
              </span>
            </div>
            <div className="mt-4 space-y-3">
              {[
                'Global market coverage',
                'Deterministic sample data in this demo',
                'A clear, ad-free interface',
                'Cancel anytime',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-[12px]" style={{ color: '#4A5750' }}>
                  <Check size={13} style={{ color: '#4C7A1E', marginTop: 1, flex: 'none' }} aria-hidden="true" />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-5 border-t pt-4" style={{ borderColor: 'rgba(11,21,18,.08)' }}>
              <p className="stats-note" style={{ marginTop: 0 }}>
                Demo pricing. No payment is processed on this site.
              </p>
            </div>
          </div>
        }
      />

      <section className="page-section" aria-label="Pricing plans">
        <div className="gmp-container">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading kicker="Plans" title="Choose your level of context." />
            <div className="price-toggle" role="group" aria-label="Billing period">
              <button type="button" className={!annual ? 'is-active' : ''} onClick={() => setAnnual(false)} aria-pressed={!annual}>
                Monthly
              </button>
              <button type="button" className={annual ? 'is-active' : ''} onClick={() => setAnnual(true)} aria-pressed={annual}>
                Annual <span className="save">−20%</span>
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-3 lg:grid-cols-3">
            {plans.map((plan, index) => {
              const price = plan.monthly === null ? null : annual ? plan.annual : plan.monthly;
              return (
                <Reveal key={plan.name} delay={index * 0.06}>
                  <div className={`price-card ${plan.featured ? 'featured' : ''}`} style={{ height: '100%' }}>
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-[20px] font-medium tracking-[-.03em]">{plan.name}</h3>
                      {plan.featured && (
                        <span
                          className="inline-flex items-center gap-1 rounded-[3px] px-2 py-1 font-mono text-[7px] uppercase tracking-[.12em]"
                          style={{ background: '#C7F464', color: '#0B1512' }}
                        >
                          <Sparkles size={9} aria-hidden="true" />
                          Most popular
                        </span>
                      )}
                    </div>
                    <p className="price-muted mt-2 text-[12px] leading-relaxed" style={{ color: '#6E7A73' }}>
                      {plan.tagline}
                    </p>

                    <div className="mt-7 flex items-end gap-1.5">
                      <span className="price-amount">
                        {price === null ? 'Custom' : price === 0 ? 'Free' : `$${price}`}
                      </span>
                      {price !== null && price > 0 && (
                        <small className="price-amount" style={{ marginBottom: 4 }}>
                          <small>/mo</small>
                        </small>
                      )}
                    </div>
                    <p className="price-muted mt-2 text-[10px]" style={{ color: '#82909D' }}>
                      {price === null
                        ? 'Scoped to your team and coverage'
                        : price === 0
                          ? 'Free forever'
                          : annual
                            ? 'Billed annually · demo pricing'
                            : 'Billed monthly · demo pricing'}
                    </p>

                    <div className="mt-6 flex flex-col gap-0.5">
                      {plan.features.map((feature) => (
                        <div key={feature} className="price-feature">
                          <Check size={13} aria-hidden="true" />
                          {feature}
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto pt-6">
                      {plan.name === 'Institutional' ? (
                        <Button href="mailto:hello@gmpx.example" variant={plan.featured ? 'lime' : 'ghost'} className="w-full" arrow>
                          {plan.cta}
                        </Button>
                      ) : (
                        <Button
                          to="/dashboard"
                          variant={plan.featured ? 'lime' : 'ghost'}
                          className="w-full"
                          arrow
                        >
                          {plan.cta}
                        </Button>
                      )}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <p className="stats-note" style={{ marginTop: 22 }}>
            Prices are illustrative sample content. No payment is collected. Institutional pricing is quoted after a
            coverage conversation.
          </p>
        </div>
      </section>

      <section className="page-section page-section-alt" aria-label="Compare plans">
        <div className="gmp-container">
          <SectionHeading kicker="Compare" title="The difference is depth, not access." />
          <Reveal className="light-card mt-8 overflow-x-auto gmp-scrollbar">
            <table className="data-table" style={{ minWidth: 620 }}>
              <caption className="sr-only">Plan comparison</caption>
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  <th scope="col">Explorer</th>
                  <th scope="col">Pro</th>
                  <th scope="col">Institutional</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.feature}>
                    <td style={{ color: '#0B1512', fontWeight: 500 }}>{row.feature}</td>
                    <td><Value value={row.explorer} /></td>
                    <td><Value value={row.pro} /></td>
                    <td><Value value={row.inst} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </section>

      <section className="page-section" id="faq" aria-label="Frequently asked questions">
        <div className="gmp-container">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,.7fr)_minmax(0,1.3fr)]">
            <div>
              <SectionHeading kicker="FAQ" title="Questions, answered." sub="If something is still unclear, the team is one message away." />
              <div className="mt-6 flex items-center gap-2">
                <ShieldCheck size={15} style={{ color: '#4C7A1E' }} aria-hidden="true" />
                <span className="eyebrow" style={{ fontSize: 7.5 }}>
                  No advice · no hidden fees
                </span>
              </div>
            </div>
            <Reveal delay={0.06}>
              <div>
                {FAQS.map((faq, index) => {
                  const open = openFaq === index;
                  return (
                    <div key={faq.q} className="faq-item">
                      <button
                        type="button"
                        className="faq-q"
                        aria-expanded={open}
                        onClick={() => setOpenFaq(open ? null : index)}
                      >
                        {faq.q}
                        <ChevronDown
                          size={16}
                          style={{ transition: 'transform .3s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flex: 'none' }}
                          aria-hidden="true"
                        />
                      </button>
                      {open && <div className="faq-a">{faq.a}</div>}
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <FinalCTA
        eyebrow="Start with clarity"
        title="The market rewards preparation."
        description="Open GMPX, explore the market layer and see how a connected intelligence experience changes the questions you ask."
        primaryLabel="Get Started"
        primaryTo="/dashboard"
        secondaryLabel="Explore the Platform"
        secondaryTo="/products"
      />
    </>
  );
}
