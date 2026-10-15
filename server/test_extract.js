const testUrls = [
  'https://www.ipoguru.in/ipo/hd-fire-protect-ipo',
  'https://www.ipoguru.in/ipo/fusion-cx-ipo',
  'https://www.ipoguru.in/ipo/zetwerk-manufacturing-business-ipo',
  'https://www.ipoguru.in/ipo/bonfiglioli-transmissions-ipo'
];

function extractIpoDetails(html) {
  // 1. Lot size
  let lotSize = null;
  const lotMatch = html.match(/Lot\s+Size\s*<\/td>\s*<td[^>]*>\s*(\d+)\s*Shares/i) ||
    html.match(/Retail\s*\(min\)[^<]*<\/td>\s*<td[^>]*>[^<]*<\/td>\s*<td[^>]*>\s*(\d+)/i) ||
    html.match(/(\d+)\s*Shares/i);
  if (lotMatch) {
    const parsed = parseInt(lotMatch[1], 10);
    if (Number.isFinite(parsed) && parsed > 0) lotSize = parsed;
  }

  // 2. Issue Size in Crores
  let issueSizeCr = null;
  const issueSizeMatch = html.match(/Issue\s+Size\s*<\/td>\s*<td[^>]*>[^<]*₹\s*([0-9,.]+)\s*Cr/i) ||
    html.match(/Issue\s+Size\s*:[^₹\n<]*₹\s*([0-9,.]+)\s*Cr/i) ||
    html.match(/Issue\s+Size\s*₹\s*([0-9,.]+)\s*Cr/i);
  if (issueSizeMatch) {
    const parsed = parseFloat(issueSizeMatch[1].replace(/,/g, ''));
    if (Number.isFinite(parsed) && parsed > 0) issueSizeCr = parsed;
  }

  // 3. Retail Quota Percentage and Exact Shares from Reservation block
  let retailReservedShares = null;
  let retailQuotaPct = null;

  // Look for dc-resv-row elements
  const resvRows = html.match(/<div[^>]*class=["'][^"']*dc-resv-row[^"']*["'][^>]*>[\s\S]*?<\/div>/gi) || [];
  for (const row of resvRows) {
    if (/Retail/i.test(row)) {
      // e.g. title="91,74,677 shares (35.00% of the Offer)"
      const titleMatch = row.match(/title=["']([^"']+)["']/i);
      if (titleMatch) {
        const titleText = titleMatch[1];
        const shMatch = titleText.match(/([0-9,]+)\s*shares/i);
        if (shMatch) {
          const s = parseInt(shMatch[1].replace(/,/g, ''), 10);
          if (Number.isFinite(s) && s > 0) retailReservedShares = s;
        }
        const pctMatch = titleText.match(/([0-9.]+)%/);
        if (pctMatch) {
          const p = parseFloat(pctMatch[1]);
          if (Number.isFinite(p) && p > 0) retailQuotaPct = p;
        }
      }
      if (!retailQuotaPct) {
        const pctSpan = row.match(/<span[^>]*class=["'][^"']*dc-resv-pct[^"']*["'][^>]*>\s*([0-9.]+)%/i);
        if (pctSpan) {
          retailQuotaPct = parseFloat(pctSpan[1]);
        }
      }
    }
  }

  return { lotSize, issueSizeCr, retailReservedShares, retailQuotaPct };
}

async function run() {
  for (const url of testUrls) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await res.text();
      const extracted = extractIpoDetails(html);
      console.log(url.split('/').pop(), extracted);
    } catch (e) {
      console.error(e.message);
    }
  }
}

run();
