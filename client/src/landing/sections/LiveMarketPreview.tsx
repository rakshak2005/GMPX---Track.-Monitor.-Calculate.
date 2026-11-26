import { Chip } from '../components/Brand';
import { Button } from '../components/Button';
import { MiniChart } from '../components/MiniChart';
import { Reveal, SplitWords } from '../components/Reveal';
import { marketRows, tickerItems } from '../data/market';

const price = (value: number) =>
  value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const change = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}`;
const pct = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

function Ticker() {
  const items = [...tickerItems, ...tickerItems];
  return (
    <div className="ticker-strip" aria-hidden="true">
      <div className="ticker-track">
        {items.map((item, index) => (
          <span key={`${item.id}-${index}`} className={`ticker-item ${item.up ? 'up' : 'down'}`}>
            {item.id}
            <b>{item.value}</b>
            {item.pct}
          </span>
        ))}
      </div>
    </div>
  );
}

export function LiveMarketPreview() {
  const rows = marketRows.slice(0, 6);

  return (
    <section className="live-band" id="live-markets" aria-label="Live market overview preview">
      <div className="live-grid-bg fin-grid-dark" aria-hidden="true" />

      <Ticker />

      <div className="gmp-container">
        <div className="live-head">
          <div>
            <Reveal>
              <Chip dark>Market overview · demo data</Chip>
            </Reveal>
            <h2 className="live-title">
              <SplitWords text="The Markets Never Sleep." />
            </h2>
            <p className="live-sub">Stay ahead with a real-time view of global market movements.</p>
          </div>
          <Reveal delay={0.1}>
            <span className="demo-badge">
              <span className="chip-dot" aria-hidden="true" />
              Illustrative data · not live
            </span>
          </Reveal>
        </div>

        <Reveal delay={0.05}>
          <div className="mkt-table-wrap">
            <table className="mkt-table">
              <caption className="sr-only">Illustrative global market overview</caption>
              <thead>
                <tr>
                  <th scope="col">Asset</th>
                  <th scope="col">Price</th>
                  <th scope="col">Change</th>
                  <th scope="col">Change %</th>
                  <th scope="col">Market status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.asset}>
                    <td>
                      <div className="mkt-asset">
                        <span className="mkt-asset-mark" aria-hidden="true">
                          {row.code.slice(0, 3)}
                        </span>
                        <div>
                          <div className="mkt-asset-name">{row.asset}</div>
                          <div className="mkt-asset-sub">
                            {row.code} · {row.region.toUpperCase()}
                          </div>
                        </div>
                        <MiniChart
                          points={row.points}
                          width={64}
                          height={18}
                          color={row.pct >= 0 ? '#B4EA45' : '#FF7A80'}
                          strokeWidth={1.2}
                          className="ml-3 opacity-80"
                        />
                      </div>
                    </td>
                    <td className="mkt-price">{price(row.price)}</td>
                    <td className={row.change >= 0 ? 'mkt-up num-mono' : 'mkt-down num-mono'}>
                      {change(row.change)}
                    </td>
                    <td className={row.pct >= 0 ? 'mkt-up num-mono' : 'mkt-down num-mono'}>
                      {pct(row.pct)}
                    </td>
                    <td>
                      <span className={`status-pill ${row.status === 'BEARISH' ? 'bear' : ''}`}>
                        <i aria-hidden="true" />
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <div className="mkt-cards">
          {rows.map((row) => (
            <div key={row.asset} className="mkt-card">
              <div className="mkt-card-top">
                <div className="mkt-asset">
                  <span className="mkt-asset-mark" aria-hidden="true">
                    {row.code.slice(0, 3)}
                  </span>
                  <div>
                    <div className="mkt-asset-name">{row.asset}</div>
                    <div className="mkt-asset-sub">
                      {row.code} · {row.region.toUpperCase()}
                    </div>
                  </div>
                </div>
                <span className={`status-pill ${row.status === 'BEARISH' ? 'bear' : ''}`}>
                  <i aria-hidden="true" />
                  {row.status}
                </span>
              </div>
              <div className="mkt-card-row">
                <div className="mkt-card-price">{price(row.price)}</div>
                <div className={`mkt-card-change ${row.pct >= 0 ? 'mkt-up' : 'mkt-down'}`}>
                  {change(row.change)} · {pct(row.pct)}
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <MiniChart
                  points={row.points}
                  width={300}
                  height={26}
                  color={row.pct >= 0 ? '#B4EA45' : '#FF7A80'}
                  fill
                  strokeWidth={1.3}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="live-foot">
          <p className="live-note">
            Sample data for demonstration only. GMPX has no live market-data provider configured in this environment.
            Prices, changes and statuses are illustrative and must not be used for trading or investment decisions.
          </p>
          <Button to="/markets" variant="lime" arrow>
            Explore All Markets
          </Button>
        </div>
      </div>
    </section>
  );
}
