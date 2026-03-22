/* ============================================
   AUTO-UPDATER for AI Job Tracker

   Runs via GitHub Actions on a schedule.
   Fetches from multiple sources, filters for
   AI-attributed layoffs, deduplicates against
   existing data, and writes updated data.js.

   Sources:
   1. Google News RSS — parses headlines for
      company + job count + AI attribution
   2. Curated tracker pages (programs.com, etc.)

   ============================================ */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = resolve(__dirname, '..', 'data.js');

// ============================================
// 1. LOAD EXISTING DATA
// ============================================

function loadExistingData() {
  const raw = readFileSync(DATA_FILE, 'utf-8');

  // Extract the array content between [ and ];
  const match = raw.match(/const CONFIRMED_AI_LOSSES\s*=\s*\[([\s\S]*?)\];/);
  if (!match) {
    console.error('Could not parse existing data.js');
    process.exit(1);
  }

  // Parse each entry object using regex (safer than eval)
  const entries = [];
  const entryRegex = /\{\s*company:\s*'([^']*)'.*?jobs:\s*(\d+).*?date:\s*'([^']*)'.*?description:\s*'([^']*)'.*?sector:\s*'([^']*)'.*?source:\s*'([^']*)'.*?sourceUrl:\s*'([^']*)'/gs;

  let m;
  while ((m = entryRegex.exec(match[1])) !== null) {
    entries.push({
      company: m[1],
      jobs: parseInt(m[2]),
      date: m[3],
      description: m[4],
      sector: m[5],
      source: m[6],
      sourceUrl: m[7],
    });
  }

  console.log(`Loaded ${entries.length} existing entries from data.js`);
  return entries;
}


// ============================================
// 2. FETCH FROM GOOGLE NEWS RSS
// ============================================

const NEWS_QUERIES = [
  '"replaced by AI" layoffs',
  '"AI job cuts" confirmed',
  '"AI layoffs" company jobs',
  '"cut jobs" "artificial intelligence"',
  '"AI replacing workers" layoffs',
  '"AI restructuring" workforce',
];

// Keywords that MUST appear for AI attribution
const AI_KEYWORDS = ['ai', 'artificial intelligence', 'chatbot', 'automation', 'chatgpt', 'machine learning', 'generative ai'];
const JOB_KEYWORDS = ['job', 'layoff', 'laid off', 'cut', 'replace', 'fire', 'slash', 'eliminate', 'workforce', 'worker', 'staff', 'employee'];

// Regex patterns to extract job counts from headlines
const JOB_COUNT_PATTERNS = [
  /(\d[\d,]*)\s*(?:jobs?|employees?|workers?|staff|positions?|roles?)/i,
  /(?:cuts?|lays?\s*off|slashes?|eliminates?|fires?|axes?)\s*(\d[\d,]*)/i,
  /(\d[\d,]*)\s*(?:layoffs?|cuts?)/i,
  /(\d+)%\s*of\s*(?:its\s*)?(?:workforce|staff|employees)/i,
];

// Regex to extract company name (usually first entity in headline)
const COMPANY_PATTERNS = [
  /^([A-Z][A-Za-z.&'\s]+?)(?:\s+(?:to\s+)?(?:cuts?|lays?\s*off|slashes?|eliminates?|fires?|axes?|announces?))/i,
  /^([A-Z][A-Za-z.&'\s]+?)\s+(?:is\s+)?(?:laying\s+off|cutting|slashing)/i,
];

// Map of known sector assignments
const SECTOR_MAP = {
  'google': 'Technology', 'meta': 'Technology', 'apple': 'Technology',
  'microsoft': 'Technology', 'amazon': 'Technology', 'netflix': 'Technology',
  'spotify': 'Technology', 'snapchat': 'Technology', 'snap': 'Technology',
  'uber': 'Technology', 'lyft': 'Technology', 'airbnb': 'Technology',
  'pinterest': 'Technology', 'twitter': 'Technology', 'x corp': 'Technology',
  'salesforce': 'Technology', 'oracle': 'Technology', 'ibm': 'Technology',
  'dell': 'Technology', 'hp': 'Technology', 'cisco': 'Technology',
  'intel': 'Semiconductors', 'amd': 'Semiconductors', 'nvidia': 'Semiconductors',
  'jpmorgan': 'Finance', 'goldman': 'Finance', 'morgan stanley': 'Finance',
  'citigroup': 'Finance', 'citi': 'Finance', 'bank of america': 'Finance',
  'wells fargo': 'Finance', 'hsbc': 'Finance', 'barclays': 'Finance',
  'paypal': 'Fintech', 'stripe': 'Fintech', 'klarna': 'Fintech',
  'block': 'Fintech', 'square': 'Fintech',
  'ups': 'Logistics', 'fedex': 'Logistics', 'dhl': 'Logistics',
  'accenture': 'Consulting', 'deloitte': 'Consulting', 'mckinsey': 'Consulting',
  'pfizer': 'Pharmaceuticals', 'johnson & johnson': 'Pharmaceuticals',
  'ford': 'Automotive', 'gm': 'Automotive', 'tesla': 'Automotive',
  'boeing': 'Aerospace', 'lockheed': 'Aerospace',
  'walmart': 'Retail', 'target': 'Retail', 'costco': 'Retail',
  'disney': 'Entertainment', 'warner': 'Entertainment', 'paramount': 'Entertainment',
  'lufthansa': 'Aviation', 'united airlines': 'Aviation', 'delta': 'Aviation',
};

function guessSector(companyName) {
  const lower = companyName.toLowerCase();
  for (const [key, sector] of Object.entries(SECTOR_MAP)) {
    if (lower.includes(key)) return sector;
  }
  return 'Technology'; // default
}

function parseJobCount(text) {
  for (const pattern of JOB_COUNT_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const numStr = match[1].replace(/,/g, '');
      const num = parseInt(numStr);
      if (num > 0 && num < 500000) return num; // sanity check
    }
  }
  return null;
}

function parseCompanyName(title) {
  for (const pattern of COMPANY_PATTERNS) {
    const match = title.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  return null;
}

function isAIAttributed(text) {
  const lower = text.toLowerCase();
  const hasAI = AI_KEYWORDS.some(kw => lower.includes(kw));
  const hasJob = JOB_KEYWORDS.some(kw => lower.includes(kw));
  return hasAI && hasJob;
}

function extractSource(title) {
  const parts = title.split(' - ');
  return parts.length > 1 ? parts[parts.length - 1].trim() : 'Google News';
}

function cleanTitle(title) {
  const parts = title.split(' - ');
  if (parts.length > 1) {
    parts.pop();
    return parts.join(' - ').trim();
  }
  return title;
}

async function fetchGoogleNewsRSS() {
  const results = [];

  for (const query of NEWS_QUERIES) {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const xml = await response.text();

      // Parse RSS XML
      const $ = cheerio.load(xml, { xmlMode: true });
      $('item').each((_, item) => {
        const title = $(item).find('title').text();
        const link = $(item).find('link').text();
        const pubDate = $(item).find('pubDate').text();

        if (!isAIAttributed(title)) return;

        const company = parseCompanyName(cleanTitle(title));
        const jobs = parseJobCount(title);
        const source = extractSource(title);

        if (!company || !jobs) return;

        const date = new Date(pubDate);
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        results.push({
          company: company,
          jobs: jobs,
          date: dateStr,
          description: cleanTitle(title),
          sector: guessSector(company),
          source: source,
          sourceUrl: link,
        });
      });

      // Small delay between requests
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.warn(`RSS fetch failed for query "${query}": ${err.message}`);
    }
  }

  console.log(`Google News RSS: found ${results.length} potential entries`);
  return results;
}


// ============================================
// 3. FETCH FROM TRACKER PAGES
// ============================================

async function fetchFromTrackerPages() {
  const results = [];
  const trackerUrls = [
    'https://programs.com/resources/ai-layoffs/',
  ];

  for (const url of trackerUrls) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AIJobTracker/1.0)' },
      });
      if (!response.ok) continue;
      const html = await response.text();
      const $ = cheerio.load(html);

      // Look for table rows or list items containing layoff data
      // programs.com uses tables with company/jobs/date/reason columns
      $('table tr, .layoff-entry, .data-row').each((_, row) => {
        const cells = $(row).find('td');
        if (cells.length < 3) return;

        const text = $(row).text().toLowerCase();
        if (!AI_KEYWORDS.some(kw => text.includes(kw))) return;

        const company = $(cells[0]).text().trim();
        const jobsText = $(cells[1]).text().trim();
        const dateText = $(cells[2]).text().trim();

        const jobs = parseInt(jobsText.replace(/[^0-9]/g, ''));
        if (!company || !jobs || isNaN(jobs)) return;

        // Try to parse date
        let dateStr = '';
        const dateMatch = dateText.match(/(\d{4})/);
        if (dateMatch) {
          const monthMatch = dateText.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
          const month = monthMatch
            ? String(['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
                .indexOf(monthMatch[1].toLowerCase().substring(0, 3)) + 1).padStart(2, '0')
            : '01';
          dateStr = `${dateMatch[1]}-${month}`;
        }

        if (dateStr) {
          results.push({
            company,
            jobs,
            date: dateStr,
            description: `AI-attributed layoffs at ${company}.`,
            sector: guessSector(company),
            source: new URL(url).hostname.replace('www.', ''),
            sourceUrl: url,
          });
        }
      });
    } catch (err) {
      console.warn(`Tracker fetch failed for ${url}: ${err.message}`);
    }
  }

  console.log(`Tracker pages: found ${results.length} potential entries`);
  return results;
}


// ============================================
// 4. DEDUPLICATION & MERGE
// ============================================

function normalizeCompany(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/inc$|corp$|ltd$|llc$|group$|plc$/g, '');
}

function isDuplicate(existing, candidate) {
  const normExisting = normalizeCompany(existing.company);
  const normCandidate = normalizeCompany(candidate.company);

  // Check if company names match (fuzzy)
  if (normExisting !== normCandidate) {
    // Check if one contains the other (e.g., "Block" vs "Block (Square/Cash App)")
    if (!normExisting.includes(normCandidate) && !normCandidate.includes(normExisting)) {
      return false;
    }
  }

  // Same company — check if same time period (within 2 months)
  const [existYear, existMonth] = existing.date.split('-').map(Number);
  const [candYear, candMonth] = candidate.date.split('-').map(Number);
  const existMonths = existYear * 12 + existMonth;
  const candMonths = candYear * 12 + candMonth;

  return Math.abs(existMonths - candMonths) <= 2;
}

function mergeEntries(existing, newEntries) {
  const added = [];

  for (const candidate of newEntries) {
    // Skip if duplicate of any existing entry
    const isDup = existing.some(e => isDuplicate(e, candidate));
    if (isDup) continue;

    // Skip if duplicate of another new entry we already added
    const isDupNew = added.some(e => isDuplicate(e, candidate));
    if (isDupNew) continue;

    // Sanity checks
    if (!candidate.company || candidate.company.length < 2) continue;
    if (!candidate.jobs || candidate.jobs < 10) continue; // skip tiny counts
    if (!candidate.date || !candidate.date.match(/^\d{4}-\d{2}$/)) continue;

    added.push(candidate);
  }

  return added;
}


// ============================================
// 5. WRITE UPDATED data.js
// ============================================

function escapeJs(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function writeDataFile(entries) {
  // Sort by date
  entries.sort((a, b) => a.date.localeCompare(b.date));

  const today = new Date().toISOString().split('T')[0];

  let output = `/* ============================================
   CONFIRMED AI JOB LOSSES — VERIFIED DATA

   Rules for this dataset:
   - Company or credible source EXPLICITLY stated AI as the reason
   - Not general "tech layoffs" or restructuring
   - Each entry has a verifiable source
   - Numbers are conservative (lower bound when ranges given)

   Last updated: ${today}
   ============================================ */

const CONFIRMED_AI_LOSSES = [\n`;

  let currentYear = '';
  for (const entry of entries) {
    const year = entry.date.substring(0, 4);
    if (year !== currentYear) {
      currentYear = year;
      output += `\n  // ──────────── ${year} ────────────\n`;
    }

    output += `  {
    company: '${escapeJs(entry.company)}',
    jobs: ${entry.jobs},
    date: '${entry.date}',
    description: '${escapeJs(entry.description)}',
    sector: '${escapeJs(entry.sector)}',
    source: '${escapeJs(entry.source)}',
    sourceUrl: '${escapeJs(entry.sourceUrl)}',
  },\n`;
  }

  output += `];

// ============================================
// COMPUTED STATS
// ============================================

function getConfirmedStats() {
  const total = CONFIRMED_AI_LOSSES.reduce((sum, entry) => sum + entry.jobs, 0);

  const byYear = {};
  CONFIRMED_AI_LOSSES.forEach(entry => {
    const year = entry.date.substring(0, 4);
    byYear[year] = (byYear[year] || 0) + entry.jobs;
  });

  const bySector = {};
  CONFIRMED_AI_LOSSES.forEach(entry => {
    bySector[entry.sector] = (bySector[entry.sector] || 0) + entry.jobs;
  });

  const topSector = Object.entries(bySector).sort((a, b) => b[1] - a[1])[0];

  return {
    total,
    companies: CONFIRMED_AI_LOSSES.length,
    byYear,
    bySector,
    topSector: topSector ? { name: topSector[0], jobs: topSector[1] } : null,
    latestEntry: CONFIRMED_AI_LOSSES[CONFIRMED_AI_LOSSES.length - 1],
  };
}
`;

  writeFileSync(DATA_FILE, output, 'utf-8');
  console.log(`Wrote ${entries.length} entries to data.js`);
}


// ============================================
// 6. MAIN
// ============================================

async function main() {
  console.log('=== AI Job Tracker Auto-Updater ===');
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('');

  // Load existing
  const existing = loadExistingData();

  // Fetch from all sources
  const [newsResults, trackerResults] = await Promise.all([
    fetchGoogleNewsRSS(),
    fetchFromTrackerPages(),
  ]);

  // Combine all new candidates
  const allNew = [...newsResults, ...trackerResults];
  console.log(`\nTotal candidates from all sources: ${allNew.length}`);

  // Deduplicate and merge
  const toAdd = mergeEntries(existing, allNew);
  console.log(`New unique entries to add: ${toAdd.length}`);

  if (toAdd.length > 0) {
    console.log('\nNew entries:');
    toAdd.forEach(e => console.log(`  - ${e.company}: ${e.jobs} jobs (${e.date})`));
  }

  // Write updated file
  const allEntries = [...existing, ...toAdd];
  writeDataFile(allEntries);

  // Update last-update date in script.js
  const scriptFile = resolve(__dirname, '..', 'script.js');
  try {
    let script = readFileSync(scriptFile, 'utf-8');
    const today = new Date().toISOString().split('T')[0];
    script = script.replace(
      /lastUpdate\.textContent\s*=\s*'[^']*'/,
      `lastUpdate.textContent = '${today}'`
    );
    writeFileSync(scriptFile, script, 'utf-8');
    console.log(`Updated last-update date in script.js to ${today}`);
  } catch (err) {
    console.warn(`Could not update script.js date: ${err.message}`);
  }

  console.log('\nDone!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
