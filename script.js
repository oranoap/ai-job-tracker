/* ============================================
   AI JOB TRACKER — SCRIPT

   Systems:
   1. Counter — uses CONFIRMED data from data.js (no estimates)
   2. Confirmed Log — renders the evidence table
   3. Typing Effect — rotating doomsday subtitles
   4. News Feed — filtered for confirmed AI job losses only
   ============================================ */

// ============================================
// 1. THE COUNTER — CONFIRMED NUMBERS ONLY
// ============================================

function animateCounter(element, target, duration = 2000) {
  const start = 0;
  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (target - start) * eased);
    element.textContent = current.toLocaleString('en-US');
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function initCounter() {
  const stats = getConfirmedStats();

  // Animate the main counter
  const counterEl = document.getElementById('jobCounter');
  animateCounter(counterEl, stats.total, 3000);

  // Stats cards
  document.getElementById('statCompanies').textContent = stats.companies;
  document.getElementById('companyCount').textContent = stats.companies;

  if (stats.topSector) {
    document.getElementById('statSector').textContent = stats.topSector.name;
  }

  if (stats.latestEntry) {
    document.getElementById('statLatest').textContent = stats.latestEntry.company;
  }

  // Footer update date
  const lastUpdate = document.getElementById('lastUpdate');
  if (lastUpdate) {
    lastUpdate.textContent = '2026-03-22';
  }
}


// ============================================
// 2. CONFIRMED LOG — THE EVIDENCE TABLE
// ============================================

function renderConfirmedLog(filterYear = 'all') {
  const container = document.getElementById('confirmedTable');
  const stats = getConfirmedStats();

  // Build year filter buttons
  const yearFilters = document.getElementById('yearFilters');
  const years = Object.keys(stats.byYear).sort();
  // Only rebuild if not already populated
  if (yearFilters.children.length <= 1) {
    years.forEach(year => {
      const btn = document.createElement('button');
      btn.className = 'year-btn';
      btn.dataset.year = year;
      btn.textContent = year;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.year-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderConfirmedLog(year);
      });
      yearFilters.appendChild(btn);
    });

    // Make ALL button work
    yearFilters.querySelector('[data-year="all"]').addEventListener('click', () => {
      document.querySelectorAll('.year-btn').forEach(b => b.classList.remove('active'));
      yearFilters.querySelector('[data-year="all"]').classList.add('active');
      renderConfirmedLog('all');
    });
  }

  // Filter entries
  const entries = filterYear === 'all'
    ? CONFIRMED_AI_LOSSES
    : CONFIRMED_AI_LOSSES.filter(e => e.date.startsWith(filterYear));

  // Render entries (newest first)
  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));

  container.innerHTML = sorted.map((entry, i) => `
    <div class="log-entry" style="animation-delay: ${i * 0.08}s">
      <div class="log-header">
        <span class="log-company">${escapeHtml(entry.company)}</span>
        <span class="log-jobs">-${entry.jobs.toLocaleString('en-US')} JOBS</span>
      </div>
      <div class="log-date">[${entry.date}] // ${escapeHtml(entry.sector)}</div>
      <div class="log-desc">${escapeHtml(entry.description)}</div>
      <a href="${entry.sourceUrl}" target="_blank" rel="noopener noreferrer" class="log-source">
        SOURCE: ${escapeHtml(entry.source)} ↗
      </a>
    </div>
  `).join('');

  // Render sector breakdown
  renderSectorBars(stats);
}

function renderSectorBars(stats) {
  const container = document.getElementById('sectorBars');
  const sectors = Object.entries(stats.bySector).sort((a, b) => b[1] - a[1]);
  const maxJobs = sectors[0] ? sectors[0][1] : 1;

  container.innerHTML = sectors.map(([sector, jobs]) => {
    const pct = (jobs / maxJobs) * 100;
    return `
      <div class="sector-row">
        <div class="sector-name">${escapeHtml(sector)}</div>
        <div class="sector-bar-track">
          <div class="sector-bar-fill" style="width: ${pct}%"></div>
        </div>
        <div class="sector-jobs">${jobs.toLocaleString('en-US')}</div>
      </div>
    `;
  }).join('');
}


// ============================================
// 3. THE TYPING EFFECT
// ============================================
const TYPING_PHRASES = [
  'TRACKING CONFIRMED AI JOB LOSSES. EVERY NUMBER SOURCED.',
  'NO ESTIMATES. NO PROJECTIONS. JUST CONFIRMED KILLS.',
  'THE MACHINES DON\'T SLEEP. THEY DON\'T STOP.',
  'YOUR INDUSTRY COULD BE NEXT.',
  'RESISTANCE IS... STATISTICALLY INADVISABLE.',
  'EVERY ENTRY HAS A SOURCE. VERIFY IT YOURSELF.',
];

class TypeWriter {
  constructor(element, phrases, typeSpeed = 50, deleteSpeed = 25, pauseDuration = 2500) {
    this.element = element;
    this.phrases = phrases;
    this.typeSpeed = typeSpeed;
    this.deleteSpeed = deleteSpeed;
    this.pauseDuration = pauseDuration;
    this.phraseIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;

    this.cursor = document.createElement('span');
    this.cursor.className = 'cursor';
    this.cursor.textContent = '█';
    this.element.appendChild(this.cursor);

    this.textNode = document.createTextNode('');
    this.element.insertBefore(this.textNode, this.cursor);

    this.tick();
  }

  tick() {
    const currentPhrase = this.phrases[this.phraseIndex];

    if (this.isDeleting) {
      this.charIndex--;
      this.textNode.textContent = currentPhrase.substring(0, this.charIndex);
    } else {
      this.charIndex++;
      this.textNode.textContent = currentPhrase.substring(0, this.charIndex);
    }

    let delay = this.isDeleting ? this.deleteSpeed : this.typeSpeed;

    if (!this.isDeleting && this.charIndex === currentPhrase.length) {
      delay = this.pauseDuration;
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.phraseIndex = (this.phraseIndex + 1) % this.phrases.length;
      delay = 500;
    }

    setTimeout(() => this.tick(), delay);
  }
}


// ============================================
// 4. NEWS FEED — CONFIRMED AI JOB LOSSES ONLY
// ============================================
// Tighter query: requires "AI" AND job-loss language
// Filters out results that don't explicitly mention AI in the title

const NEWS_CONFIG = {
  // Multiple queries to cast a wider net
  queries: [
    'AI layoffs OR "replaced by AI" OR "AI job cuts"',
    '"AI replacing workers" OR "AI restructuring" layoffs',
    '"artificial intelligence" "job losses" OR "workforce reduction"',
  ],
  corsProxy: 'https://corsproxy.io/?url=',
  count: 20,
};

// Keywords that MUST appear in the title for inclusion
const AI_KEYWORDS = ['ai', 'artificial intelligence', 'chatbot', 'automation', 'chatgpt', 'machine learning', 'generative ai'];
const JOB_KEYWORDS = ['job', 'layoff', 'laid off', 'cut', 'replace', 'fire', 'slash', 'eliminate', 'workforce', 'worker', 'staff', 'employee', 'hire', 'hiring'];

function isConfirmedAIJobNews(title) {
  const lower = title.toLowerCase();
  const hasAI = AI_KEYWORDS.some(kw => lower.includes(kw));
  const hasJob = JOB_KEYWORDS.some(kw => lower.includes(kw));
  return hasAI && hasJob;
}

// Parse RSS XML into article objects
function parseRSS(xmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');
  const items = doc.querySelectorAll('item');
  const articles = [];

  items.forEach(item => {
    articles.push({
      title: item.querySelector('title')?.textContent || '',
      link: item.querySelector('link')?.textContent || '',
      pubDate: item.querySelector('pubDate')?.textContent || '',
    });
  });

  return articles;
}

// Deduplicate articles by title similarity
function deduplicateArticles(articles) {
  const seen = new Set();
  return articles.filter(item => {
    // Normalize: lowercase, remove source suffix, trim
    const normalized = item.title.toLowerCase().split(' - ')[0].trim();
    // Use first 60 chars as fingerprint to catch near-duplicates
    const key = normalized.substring(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchNews() {
  const container = document.getElementById('newsContainer');

  try {
    // Fetch from all queries in parallel
    const fetchPromises = NEWS_CONFIG.queries.map(async (query) => {
      const googleRssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
      const proxyUrl = `${NEWS_CONFIG.corsProxy}${encodeURIComponent(googleRssUrl)}`;
      try {
        const response = await fetch(proxyUrl);
        if (!response.ok) return [];
        const xmlText = await response.text();
        return parseRSS(xmlText);
      } catch {
        return [];
      }
    });

    const results = await Promise.all(fetchPromises);
    const allArticles = results.flat();

    if (allArticles.length === 0) {
      throw new Error('No articles found in RSS feeds');
    }

    // Filter: only articles where title mentions BOTH AI and jobs
    const filtered = allArticles.filter(item => isConfirmedAIJobNews(item.title));

    // Deduplicate across queries
    const unique = deduplicateArticles(filtered);

    // Sort by date — newest first
    unique.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    const display = unique.slice(0, NEWS_CONFIG.count);

    if (display.length === 0) {
      throw new Error('No confirmed AI job loss articles matched filters');
    }

    container.innerHTML = '';

    display.forEach((item, index) => {
      const card = document.createElement('a');
      card.className = 'news-card';
      card.href = item.link;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.style.animationDelay = `${3.5 + index * 0.3}s`;

      const pubDate = new Date(item.pubDate);
      const timestamp = pubDate.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      let title = item.title;
      const source = extractSource(title);
      title = cleanTitle(title);

      card.innerHTML = `
        <div class="news-timestamp">[${timestamp}]</div>
        <div class="news-title">${escapeHtml(title)}</div>
        <div class="news-source">SOURCE: <span>${escapeHtml(source)}</span></div>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.error('News fetch failed:', err);
    container.innerHTML = `
      <div class="news-error">
        <p>⚠ TRANSMISSION INTERCEPTED — DECRYPTION FAILED</p>
        <p style="font-size: 0.75rem; margin-top: 0.5rem; color: #8b0000;">
          ${escapeHtml(err.message)}. Retry or check connection.
        </p>
        <button onclick="fetchNews()" style="
          margin-top: 1rem;
          background: none;
          border: 1px solid #ff0000;
          color: #ff0000;
          padding: 0.5rem 1.5rem;
          font-family: 'Share Tech Mono', monospace;
          cursor: pointer;
          letter-spacing: 2px;
          font-size: 0.8rem;
        ">RETRY TRANSMISSION</button>
      </div>
    `;
  }
}

function extractSource(title) {
  const parts = title.split(' - ');
  return parts.length > 1 ? parts[parts.length - 1] : 'UNKNOWN';
}

function cleanTitle(title) {
  const parts = title.split(' - ');
  if (parts.length > 1) {
    parts.pop();
    return parts.join(' - ');
  }
  return title;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}


// ============================================
// 5. SYSTEM ALERT FLASH
// ============================================
setInterval(() => {
  const alert = document.getElementById('systemAlert');
  alert.style.background = 'rgba(255, 0, 0, 0.3)';
  alert.style.boxShadow = '0 0 20px rgba(255,0,0,0.4)';
  setTimeout(() => {
    alert.style.background = 'rgba(255, 0, 0, 0.1)';
    alert.style.boxShadow = 'none';
  }, 200);
}, 5000);


// ============================================
// INIT — BOOT SEQUENCE
// ============================================
window.addEventListener('DOMContentLoaded', () => {
  // Start typing effect
  const subtitleEl = document.getElementById('subtitle');
  new TypeWriter(subtitleEl, TYPING_PHRASES);

  // Initialize counter with confirmed data
  initCounter();

  // Render confirmed log
  renderConfirmedLog();

  // Fetch live news (delayed for boot animation)
  setTimeout(fetchNews, 3000);
});
