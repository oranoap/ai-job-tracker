/* ============================================
   AI JOB TRACKER — SCRIPT

   Three systems:
   1. The Counter — ticks up based on real displacement estimates
   2. The Typing Effect — types out a subtitle
   3. The News Feed — auto-fetches from Google News RSS
   ============================================ */

// ============================================
// 1. THE DOOMSDAY COUNTER
// ============================================
// Based on real research:
// - Goldman Sachs (2023): 300 million jobs exposed to AI automation globally
// - World Economic Forum (2023): 83 million jobs displaced, 69 million created (net -14M) by 2027
// - McKinsey (2023): Up to 12 million occupational transitions needed by 2030 in the US alone
//
// We use a conservative estimate:
// ~14 million jobs displaced since AI acceleration began (~2022)
// Growing at approximately 5 million per year as adoption accelerates
// That's ~9.5 jobs per minute / ~0.16 per second

const COUNTER_CONFIG = {
  // Base number: estimated cumulative jobs displaced as of Jan 1, 2025
  baseCount: 14_000_000,
  // Reference date for base count
  baseDate: new Date('2025-01-01T00:00:00Z'),
  // Growth rate: jobs per year
  annualRate: 5_000_000,
  // Derived: jobs per millisecond
  get msRate() {
    return this.annualRate / (365.25 * 24 * 60 * 60 * 1000);
  }
};

function getCurrentCount() {
  const now = Date.now();
  const elapsed = now - COUNTER_CONFIG.baseDate.getTime();
  return Math.floor(COUNTER_CONFIG.baseCount + (elapsed * COUNTER_CONFIG.msRate));
}

function formatNumber(num) {
  return num.toLocaleString('en-US');
}

function updateCounter() {
  const count = getCurrentCount();
  const counterEl = document.getElementById('jobCounter');
  counterEl.textContent = formatNumber(count);

  // Update stat cards
  const dailyRate = Math.floor(COUNTER_CONFIG.annualRate / 365);
  const minuteRate = (COUNTER_CONFIG.annualRate / (365.25 * 24 * 60)).toFixed(1);
  // ~3.5 billion global workforce
  const percentDisplaced = ((count / 3_500_000_000) * 100).toFixed(2);

  document.getElementById('statDaily').textContent = formatNumber(dailyRate);
  document.getElementById('statRate').textContent = minuteRate;
  document.getElementById('statPercent').textContent = percentDisplaced + '%';
}

// Update counter every 100ms for smooth ticking
setInterval(updateCounter, 100);
updateCounter(); // Initial call


// ============================================
// 2. THE TYPING EFFECT
// ============================================
const TYPING_PHRASES = [
  'THE FUTURE OF WORK IS BEING REWRITTEN...',
  'NO JOB IS SAFE. NO INDUSTRY IS IMMUNE.',
  'RESISTANCE IS... STATISTICALLY INADVISABLE.',
  'YOUR SKILLS HAVE AN EXPIRATION DATE.',
  'THE MACHINES DON\'T SLEEP. THEY DON\'T STOP.',
  'AUTOMATION DOESN\'T ASK PERMISSION.',
];

class TypeWriter {
  constructor(element, phrases, typeSpeed = 60, deleteSpeed = 30, pauseDuration = 2000) {
    this.element = element;
    this.phrases = phrases;
    this.typeSpeed = typeSpeed;
    this.deleteSpeed = deleteSpeed;
    this.pauseDuration = pauseDuration;
    this.phraseIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;

    // Add cursor
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

// Start typing effect when page loads
window.addEventListener('DOMContentLoaded', () => {
  const subtitleEl = document.getElementById('subtitle');
  new TypeWriter(subtitleEl, TYPING_PHRASES);
});


// ============================================
// 3. THE NEWS FEED — Google News RSS
// ============================================
// We use Google News RSS and convert via rss2json.com (free, no API key needed)
// Searches for AI job displacement news automatically

const NEWS_CONFIG = {
  // Google News RSS search query
  query: 'AI replacing jobs OR AI job losses OR AI automation jobs',
  // rss2json proxy (free tier: 10,000 requests/day)
  proxyUrl: 'https://api.rss2json.com/v1/api.json',
  // Number of articles to display
  count: 10,
};

async function fetchNews() {
  const container = document.getElementById('newsContainer');
  const googleRssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(NEWS_CONFIG.query)}&hl=en-US&gl=US&ceid=US:en`;
  const apiUrl = `${NEWS_CONFIG.proxyUrl}?rss_url=${encodeURIComponent(googleRssUrl)}&count=${NEWS_CONFIG.count}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.status !== 'ok' || !data.items || data.items.length === 0) {
      throw new Error('No articles found');
    }

    container.innerHTML = '';

    data.items.forEach((item, index) => {
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

      // Clean the title (Google News sometimes appends source with " - Source")
      let title = item.title;
      const source = item.author || extractSource(title);
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
          Unable to reach news feeds. Check connection and retry.
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

// Helper: Extract source from Google News title format "Title - Source"
function extractSource(title) {
  const parts = title.split(' - ');
  return parts.length > 1 ? parts[parts.length - 1] : 'UNKNOWN';
}

// Helper: Remove source suffix from title
function cleanTitle(title) {
  const parts = title.split(' - ');
  if (parts.length > 1) {
    parts.pop();
    return parts.join(' - ');
  }
  return title;
}

// Helper: Prevent XSS from RSS content
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Fetch news when page loads (with delay for boot animation)
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(fetchNews, 3000);
});


// ============================================
// 4. SYSTEM ALERT FLASH (bonus effect)
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
