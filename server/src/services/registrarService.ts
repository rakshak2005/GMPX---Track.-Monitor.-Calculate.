import https from 'node:https';
import crypto from 'node:crypto';

export interface AllotmentResult {
  found: boolean;
  status: 'ALLOTTED' | 'NOT_ALLOTTED' | 'PENDING' | 'NOT_FOUND';
  registrar: string;
  companyName: string;
  pan: string;
  applicantName?: string;
  appliedShares?: number;
  allottedShares?: number;
  appNo?: string;
  dpClid?: string;
  message?: string;
}

export interface RegistrarIpoOption {
  id: string;
  name: string;
  registrar: string;
}

// In-memory cache of registrar active IPO lists with 2-minute TTL
let kfinCache: { timestamp: number; ipos: { clientId: string; name: string }[] } | null = null;
let mufgCache: { timestamp: number; ipos: { clientId: string; name: string }[] } | null = null;
let bigshareCache: { timestamp: number; ipos: { clientId: string; name: string }[] } | null = null;

function postJson(url: string, postData: Record<string, unknown>, extraHeaders: Record<string, string> = {}): Promise<{ statusCode?: number; data?: any; body?: string; headers: any }> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = JSON.stringify(postData);
    const req = https.request(
      u,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': Buffer.byteLength(data),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Origin: 'https://in.mpms.mufg.com',
          Referer: 'https://in.mpms.mufg.com/Initial_Offer/public-issues.html',
          'X-Requested-With': 'XMLHttpRequest',
          ...extraHeaders,
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, data: JSON.parse(body), headers: res.headers });
          } catch {
            resolve({ statusCode: res.statusCode, body, headers: res.headers });
          }
        });
      },
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function encryptMufgToken(plainText: string): string {
  const key = Buffer.from('8080808080808080', 'utf8');
  const iv = Buffer.from('8080808080808080', 'utf8');
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

/**
 * Scrape the current list of available IPOs declared on KFintech portal
 */
export async function getKfintechIpos(): Promise<{ clientId: string; name: string }[]> {
  const now = Date.now();
  if (kfinCache && now - kfinCache.timestamp < 120_000) {
    return kfinCache.ipos;
  }

  return new Promise((resolve) => {
    https.get('https://ipostatus.kfintech.com/', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let html = '';
      res.on('data', (d) => (html += d));
      res.on('end', () => {
        const scriptMatch = html.match(/src="(\.\/static\/js\/main\.[a-f0-9]+\.js)"/);
        if (!scriptMatch) {
          resolve(kfinCache?.ipos || []);
          return;
        }

        const jsUrl = 'https://ipostatus.kfintech.com/' + scriptMatch[1].replace(/^\.\//, '');
        https.get(jsUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (jsRes) => {
          let jsCode = '';
          jsRes.on('data', (d) => (jsCode += d));
          jsRes.on('end', () => {
            const match = jsCode.match(/const\s+rf\s*=\s*JSON\.parse\('(\[.*?\])'\)/);
            if (match) {
              try {
                const list = JSON.parse(match[1]) as { clientId: string; name: string }[];
                kfinCache = { timestamp: now, ipos: list };
                resolve(list);
                return;
              } catch {
                // Ignore parse errors
              }
            }
            resolve(kfinCache?.ipos || []);
          });
        }).on('error', () => resolve(kfinCache?.ipos || []));
      });
    }).on('error', () => resolve(kfinCache?.ipos || []));
  });
}

/**
 * Directly query KFintech AWS API gateway for allotment status using PAN
 */
export async function checkKfintechAllotment(clientId: string, pan: string, companyName = ''): Promise<AllotmentResult> {
  const normPan = pan.trim().toUpperCase();
  const url = `https://0uz601ms56.execute-api.ap-south-1.amazonaws.com/prod/api/query?type=pan`;

  return new Promise((resolve) => {
    const req = https.request(
      url,
      {
        method: 'GET',
        headers: {
          reqparam: normPan,
          client_id: clientId,
          Origin: 'https://ipostatus.kfintech.com',
          Referer: 'https://ipostatus.kfintech.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        },
      },
      (res) => {
        let body = '';
        res.on('data', (d) => (body += d));
        res.on('end', () => {
          try {
            if (res.statusCode !== 200) {
              resolve({
                found: false,
                status: 'PENDING',
                registrar: 'KFintech',
                companyName,
                pan: normPan,
                message: `Registrar returned status ${res.statusCode}. Allotment may not be finalized yet.`,
              });
              return;
            }

            const json = JSON.parse(body);
            const records = json.data;
            if (!Array.isArray(records) || records.length === 0) {
              resolve({
                found: false,
                status: 'NOT_FOUND',
                registrar: 'KFintech',
                companyName,
                pan: normPan,
                message: 'No allotment record found for this PAN.',
              });
              return;
            }

            const r = records[0];
            const applied = parseInt(r.App_Shares || '0', 10);
            const allotted = parseInt(r.All_Shares || '0', 10);
            const isAllotted = allotted > 0;

            resolve({
              found: true,
              status: isAllotted ? 'ALLOTTED' : 'NOT_ALLOTTED',
              registrar: 'KFin Technologies (KFintech)',
              companyName: companyName || 'IPO',
              pan: normPan,
              applicantName: r.Name || undefined,
              appliedShares: applied,
              allottedShares: allotted,
              appNo: r.Appln_No || undefined,
              dpClid: r.DP_CLID || undefined,
              message: isAllotted
                ? `Congratulations! ${allotted} shares allotted to ${r.Name || 'you'}.`
                : `Not allotted. 0 of ${applied} shares allotted. Refund will be credited to bank mandate.`,
            });
          } catch (e) {
            resolve({
              found: false,
              status: 'PENDING',
              registrar: 'KFin Technologies (KFintech)',
              companyName,
              pan: normPan,
              message: 'Failed to parse registrar response. Allotment calculation may still be processing.',
            });
          }
        });
      },
    );

    req.on('error', (err) => {
      resolve({
        found: false,
        status: 'PENDING',
        registrar: 'KFin Technologies (KFintech)',
        companyName,
        pan: normPan,
        message: `Network error connecting to registrar: ${err.message}`,
      });
    });

    req.end();
  });
}

/**
 * Scrape the list of active declared IPOs on MUFG Intime India portal
 */
export async function getMufgIpos(): Promise<{ clientId: string; name: string }[]> {
  const now = Date.now();
  if (mufgCache && now - mufgCache.timestamp < 120_000) {
    return mufgCache.ipos;
  }

  try {
    const res = await postJson('https://in.mpms.mufg.com/Initial_Offer/IPO.aspx/GetDetails', {});
    if (res.statusCode === 200 && res.data && res.data.d) {
      const xml = String(res.data.d);
      const list: { clientId: string; name: string }[] = [];
      const tableRegex = /<Table>([\s\S]*?)<\/Table>/g;
      let match;
      while ((match = tableRegex.exec(xml)) !== null) {
        const itemStr = match[1];
        const idMatch = itemStr.match(/<company_id>([^<]+)<\/company_id>/);
        const nameMatch = itemStr.match(/<companyname>([^<]+)<\/companyname>/);
        if (idMatch && nameMatch) {
          list.push({ clientId: idMatch[1].trim(), name: nameMatch[1].trim() });
        }
      }
      mufgCache = { timestamp: now, ipos: list };
      return list;
    }
  } catch {
    // Return cached if available
  }
  return mufgCache?.ipos || [];
}

/**
 * Directly query MUFG Intime India backend API for allotment status using PAN (No CAPTCHA required)
 */
export async function checkMufgAllotment(clientId: string, pan: string, companyName = ''): Promise<AllotmentResult> {
  const normPan = pan.trim().toUpperCase();
  try {
    // 1. Generate token
    const tokenRes = await postJson('https://in.mpms.mufg.com/Initial_Offer/IPO.aspx/generateToken', {});
    const rawToken = tokenRes.data?.d;
    if (!rawToken) {
      return {
        found: false,
        status: 'PENDING',
        registrar: 'MUFG Intime India',
        companyName,
        pan: normPan,
        message: 'Could not obtain security session token from MUFG Intime. Allotment may still be uploading.',
      };
    }

    const encryptedToken = encryptMufgToken(rawToken);
    const cookieHeader: Record<string, string> = {};
    if (tokenRes.headers?.['set-cookie']) {
      const sc = tokenRes.headers['set-cookie'];
      cookieHeader['Cookie'] = Array.isArray(sc) ? sc.join('; ') : String(sc);
    }

    // 2. Query SearchOnPan directly
    const searchRes = await postJson(
      'https://in.mpms.mufg.com/Initial_Offer/IPO.aspx/SearchOnPan',
      {
        clientid: clientId,
        PAN: normPan,
        IFSC: '',
        CHKVAL: '1',
        token: encryptedToken,
      },
      cookieHeader,
    );

    const xmlStr = String(searchRes.data?.d || '');

    // Check for error/no record messages in Table1
    if (xmlStr.includes('<Table1>')) {
      const msgMatch = xmlStr.match(/<Msg>([^<]+)<\/Msg>/);
      const msg = msgMatch ? msgMatch[1] : 'No record found';
      return {
        found: false,
        status: 'NOT_FOUND',
        registrar: 'MUFG Intime India',
        companyName,
        pan: normPan,
        message: msg || 'No allotment record found for this PAN.',
      };
    }

    // Check for allotment details in Table
    if (xmlStr.includes('<Table>')) {
      const nameMatch = xmlStr.match(/<NAME1>([^<]+)<\/NAME1>/);
      const appliedMatch = xmlStr.match(/<SHARES>([^<]+)<\/SHARES>/);
      const allottedMatch = xmlStr.match(/<ALLOT>([^<]+)<\/ALLOT>/);

      const applicantName = nameMatch ? nameMatch[1].trim() : undefined;
      const appliedShares = appliedMatch ? parseInt(appliedMatch[1], 10) : 0;
      const allottedShares = allottedMatch ? parseInt(allottedMatch[1], 10) : 0;
      const isAllotted = allottedShares > 0;

      return {
        found: true,
        status: isAllotted ? 'ALLOTTED' : 'NOT_ALLOTTED',
        registrar: 'MUFG Intime India',
        companyName: companyName || 'IPO',
        pan: normPan,
        applicantName,
        appliedShares,
        allottedShares,
        message: isAllotted
          ? `Congratulations! ${allottedShares} shares allotted to ${applicantName || 'you'}.`
          : `Not allotted. 0 of ${appliedShares} shares allotted. Refund will be credited to bank mandate.`,
      };
    }

    // Empty or no records
    return {
      found: false,
      status: 'NOT_FOUND',
      registrar: 'MUFG Intime India',
      companyName,
      pan: normPan,
      message: 'No allotment record found for this PAN on MUFG Intime.',
    };
  } catch (err: any) {
    return {
      found: false,
      status: 'PENDING',
      registrar: 'MUFG Intime India',
      companyName,
      pan: normPan,
      message: `Network error connecting to MUFG Intime: ${err.message}`,
    };
  }
}

/**
 * Scrape the list of active declared IPOs from Bigshare Services portal dropdown
 */
export async function getBigshareIpos(): Promise<{ clientId: string; name: string }[]> {
  const now = Date.now();
  if (bigshareCache && now - bigshareCache.timestamp < 120_000) {
    return bigshareCache.ipos;
  }

  return new Promise((resolve) => {
    https
      .get(
        'https://ipo.bigshareonline.com/IPO_Status.html',
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        },
        (res) => {
          let html = '';
          res.on('data', (d) => (html += d));
          res.on('end', () => {
            const list: { clientId: string; name: string }[] = [];
            const selectMatch = html.match(/<select\s+id=["']ddlCompany["'][^>]*>([\s\S]*?)<\/select>/i);
            if (selectMatch) {
              const optionRegex = /<option\s+value=["']([^"']+)["'][^>]*>([\s\S]*?)<\/option>/gi;
              let m;
              while ((m = optionRegex.exec(selectMatch[1])) !== null) {
                const val = m[1].trim();
                const text = m[2].trim();
                if (val && !text.includes('--Select') && val !== '0') {
                  list.push({ clientId: val, name: text });
                }
              }
            }
            bigshareCache = { timestamp: now, ipos: list };
            resolve(list);
          });
        },
      )
      .on('error', () => resolve(bigshareCache?.ipos || []));
  });
}

/**
 * Bulletproof name cleaner that strips legal suffixes, symbols, and punctuation
 */
export function normalizeIpoName(name: string): string {
  return (name || '')
    .toLowerCase()
    .replace(/\s*-\s*(ipo|sme|mainboard)\b/gi, '')
    .replace(/\s+(public\s+issue|initial\s+public\s+offering|ipo|sme)\b/gi, '')
    .replace(/\s+(india|private|pvt|limited|ltd|corp|corporation|industries|holdings|enterprises)\b/gi, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Robust bidirectional and token-overlap fuzzy matcher
 */
export function isNameMatch(siteName: string, registrarName: string): boolean {
  const a = normalizeIpoName(siteName);
  const b = normalizeIpoName(registrarName);

  if (!a || !b) return false;

  // 1. Direct equality or substring containment
  if (a === b || a.includes(b) || b.includes(a)) {
    return true;
  }

  // 2. Token overlap (if 60%+ of words match)
  const aTokens = a.split(' ').filter((w) => w.length > 2);
  const bTokens = b.split(' ').filter((w) => w.length > 2);

  if (aTokens.length === 0 || bTokens.length === 0) return false;

  const matchCount = aTokens.filter((token) => bTokens.some((bt) => bt.includes(token) || token.includes(bt))).length;
  const ratioA = matchCount / aTokens.length;
  const ratioB = matchCount / bTokens.length;

  return ratioA >= 0.6 || ratioB >= 0.6;
}

/**
 * Identify the registrar taking care of an IPO issue
 */
export async function identifyRegistrar(companyOrIpoName: string, knownRegistrar?: string | null): Promise<string> {
  if (knownRegistrar && knownRegistrar.trim() && !knownRegistrar.includes('Unknown')) {
    return knownRegistrar.trim();
  }

  // 1. Check KFintech active dropdown
  const kfinIpos = await getKfintechIpos();
  const matchedKfin = kfinIpos.find((item) => isNameMatch(companyOrIpoName, item.name));
  if (matchedKfin) return 'KFin Technologies (KFintech)';

  // 2. Check MUFG Intime active dropdown
  const mufgIpos = await getMufgIpos();
  const matchedMufg = mufgIpos.find((item) => isNameMatch(companyOrIpoName, item.name));
  if (matchedMufg) return 'MUFG Intime India (Link Intime)';

  // 3. Check Bigshare active dropdown
  const bigshareIpos = await getBigshareIpos();
  const matchedBigshare = bigshareIpos.find((item) => isNameMatch(companyOrIpoName, item.name));
  if (matchedBigshare) return 'Bigshare Services';

  // 4. Known registrar assignments for active mainboard issues
  const KNOWN_MAPPINGS: Record<string, string> = {
    rentomojo: 'KFin Technologies (KFintech)',
    'ss retail': 'KFin Technologies (KFintech)',
    'jindal supreme': 'Bigshare Services',
    apana: 'Bigshare Services',
    pranav: 'MUFG Intime India (Link Intime)',
    prasol: 'MUFG Intime India (Link Intime)',
    steamhouse: 'KFin Technologies (KFintech)',
    'vinod texworld': 'Bigshare Services',
    'lcc projects': 'KFin Technologies (KFintech)',
    'century business': 'KFin Technologies (KFintech)',
  };

  const normQuery = normalizeIpoName(companyOrIpoName);
  for (const [key, reg] of Object.entries(KNOWN_MAPPINGS)) {
    if (normQuery.includes(key) || key.includes(normQuery)) {
      return reg;
    }
  }

  return 'MUFG Intime / KFintech';
}

/**
 * Universal allotment checker: Identifies match across registrars and executes check
 */
export async function checkIpoAllotment(companyOrIpoName: string, pan: string, knownRegistrar?: string | null): Promise<AllotmentResult> {
  // 1. Check KFintech first
  const kfinIpos = await getKfintechIpos();
  const matchedKfin = kfinIpos.find((item) => isNameMatch(companyOrIpoName, item.name));

  if (matchedKfin) {
    return checkKfintechAllotment(matchedKfin.clientId, pan, matchedKfin.name);
  }

  // 2. Check MUFG Intime next (Direct automated API scrape)
  const mufgIpos = await getMufgIpos();
  const matchedMufg = mufgIpos.find((item) => isNameMatch(companyOrIpoName, item.name));

  if (matchedMufg) {
    return checkMufgAllotment(matchedMufg.clientId, pan, matchedMufg.name);
  }

  // 3. Check Bigshare dropdown release detection
  const bigshareIpos = await getBigshareIpos();
  const matchedBigshare = bigshareIpos.find((item) => isNameMatch(companyOrIpoName, item.name));

  if (matchedBigshare) {
    return {
      found: true,
      status: 'PENDING',
      registrar: 'Bigshare Services',
      companyName: matchedBigshare.name,
      pan: pan.trim().toUpperCase(),
      message: `Allotment for ${matchedBigshare.name} is NOW DECLARED & RELEASED on Bigshare Services! Please use 1-click Query to enter the captcha on Bigshare portal.`,
    };
  }

  const detectedRegistrar = await identifyRegistrar(companyOrIpoName, knownRegistrar);

  // Fallback if not yet listed in registrar dropdown
  return {
    found: false,
    status: 'PENDING',
    registrar: detectedRegistrar,
    companyName: companyOrIpoName,
    pan: pan.trim().toUpperCase(),
    message: `Allotment for ${companyOrIpoName} has not yet been declared on ${detectedRegistrar}. Automated polling will check continuously.`,
  };
}
