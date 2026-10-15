const list = [
  'bonfiglioli-transmissions-ipo',
  'paras-healthcare-ipo',
  'sahajanand-medical-technologies-ipo',
  'zetwerk-manufacturing-business-ipo',
  'fusion-cx-ipo',
  'tonbo-imaging-india-ipo',
  'hd-fire-protect-ipo'
];

async function check() {
  for (const slug of list) {
    try {
      const r = await fetch('https://www.ipoguru.in/ipo/' + slug, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(6000)
      });
      const html = await r.text();
      const issueSizeMatch = html.match(/Issue\s+Size[\s\S]*?₹\s*([0-9,.]+)\s*Cr/i);
      const isize = issueSizeMatch ? parseFloat(issueSizeMatch[1].replace(/,/g, '')) : null;
      let retailShares = null;
      let retailPct = null;
      const resv = html.match(/<div[^>]*class=["']dc-resv-row["'][^>]*title=["']([^"']+)["'][^>]*>[\s\S]*?<\/div>/gi) || [];
      for (const row of resv) {
        if (/Retail/i.test(row)) {
          const title = (row.match(/title=["']([^"']+)["']/i) || [])[1] || '';
          const shM = title.match(/([0-9,]+)\s*shares/i);
          if (shM) retailShares = parseInt(shM[1].replace(/,/g, ''), 10);
          const pM = title.match(/([0-9.]+)%/);
          if (pM) retailPct = parseFloat(pM[1]);
        }
      }
      console.log(slug, JSON.stringify({ isize, retailShares, retailPct }));
    } catch (e) {
      console.log(slug, 'error:', e.message);
    }
  }
}
check();
