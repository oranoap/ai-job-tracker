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
    lastUpdate.textContent = '2026-05-14';
  }
}


// ============================================
// 2. CONFIRMED LOG — THE EVIDENCE TABLE
// ============================================

function renderConfirmedLog(filterYear = '2026') {
  const container = document.getElementById('confirmedTable');
  const stats = getConfirmedStats();

  // Build year filter buttons
  const yearFilters = document.getElementById('yearFilters');
  const years = Object.keys(stats.byYear).sort();
  // Only rebuild if not already populated
  if (yearFilters.children.length <= 1) {
    years.forEach(year => {
      const btn = document.createElement('button');
      btn.className = year === '2026' ? 'year-btn active' : 'year-btn';
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
  count: 5,
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
// 6. BODY COUNT LEADERBOARD
// ============================================

function renderLeaderboard() {
  const container = document.getElementById('leaderboardTable');
  if (!container) return;

  // Aggregate jobs by company (some companies appear multiple times)
  const companyTotals = {};
  CONFIRMED_AI_LOSSES.forEach(entry => {
    const key = entry.company;
    if (!companyTotals[key]) {
      companyTotals[key] = { company: key, jobs: 0, sector: entry.sector, entries: 0 };
    }
    companyTotals[key].jobs += entry.jobs;
    companyTotals[key].entries++;
  });

  // Sort by jobs descending, take top 15
  const ranked = Object.values(companyTotals)
    .sort((a, b) => b.jobs - a.jobs)
    .slice(0, 15);

  const maxJobs = ranked[0] ? ranked[0].jobs : 1;

  container.innerHTML = ranked.map((entry, i) => {
    const pct = (entry.jobs / maxJobs) * 100;
    const rank = i + 1;
    const medal = rank === 1 ? 'KILL LEADER' : rank === 2 ? '2ND' : rank === 3 ? '3RD' : `${rank}TH`;
    const rankClass = rank <= 3 ? `rank-${rank}` : '';

    return `
      <div class="lb-row ${rankClass}" style="animation-delay: ${i * 0.06}s">
        <div class="lb-rank">#${rank}</div>
        <div class="lb-info">
          <div class="lb-company">${escapeHtml(entry.company)}</div>
          <div class="lb-sector">${escapeHtml(entry.sector)}</div>
        </div>
        <div class="lb-bar-wrapper">
          <div class="lb-bar" style="width: ${pct}%"></div>
        </div>
        <div class="lb-jobs">${entry.jobs.toLocaleString('en-US')}</div>
        <div class="lb-badge">${medal}</div>
      </div>
    `;
  }).join('');
}


// ============================================
// 7. "IS YOUR JOB SAFE?" QUIZ
// ============================================

const JOB_THREATS = [
  // [job title, threat % (0-100), message, details]
  { job: 'Accountant', threat: 82, msg: 'CRITICAL — AI is coming for your spreadsheets', detail: 'Automated bookkeeping, tax prep, and auditing tools are already replacing junior accountants.' },
  { job: 'Administrative Assistant', threat: 88, msg: 'SEVERE — You are already being replaced', detail: 'AI scheduling, email drafting, and document management are mainstream.' },
  { job: 'Barista', threat: 12, msg: 'MINIMAL — Robots can\'t do latte art (yet)', detail: 'Human interaction and craft beverage making remain difficult to automate.' },
  { job: 'Bus Driver', threat: 35, msg: 'MODERATE — Autonomous vehicles are delayed but coming', detail: 'Self-driving buses are in trials but regulatory hurdles buy you time.' },
  { job: 'Cashier', threat: 75, msg: 'HIGH — Self-checkout already won', detail: 'Amazon Go-style stores and self-checkout have already eliminated millions of cashier positions.' },
  { job: 'Construction Worker', threat: 8, msg: 'SAFE — Robots hate ladders', detail: 'Physical dexterity, unpredictable environments, and on-site problem-solving keep you safe.' },
  { job: 'Content Writer', threat: 85, msg: 'CRITICAL — ChatGPT sends its regards', detail: 'AI can generate articles, blog posts, and marketing copy at scale for pennies.' },
  { job: 'Customer Service Rep', threat: 92, msg: 'EXTREME — Klarna already proved it', detail: 'AI chatbots handle 75%+ of customer queries. Klarna replaced 700 agents with one AI.' },
  { job: 'Data Analyst', threat: 65, msg: 'HIGH — AI is your competitor AND your tool', detail: 'AI can analyze datasets faster, but humans still needed for interpretation and strategy.' },
  { job: 'Data Entry Clerk', threat: 95, msg: 'TERMINAL — This job is already gone', detail: 'OCR, automated form processing, and AI data extraction have eliminated most data entry roles.' },
  { job: 'Dentist', threat: 5, msg: 'SAFE — AI can\'t drill your teeth', detail: 'Physical procedures, patient trust, and regulation protect this profession.' },
  { job: 'Doctor / Physician', threat: 15, msg: 'LOW — AI assists, doesn\'t replace', detail: 'AI aids diagnostics but patients still need human doctors for treatment, empathy, and complex cases.' },
  { job: 'Electrician', threat: 7, msg: 'SAFE — Good luck, robots', detail: 'Complex physical work in unpredictable environments. Strong union protection too.' },
  { job: 'Financial Advisor', threat: 55, msg: 'ELEVATED — Robo-advisors are growing', detail: 'Algorithmic investing handles basic portfolios. Human advisors still needed for complex wealth management.' },
  { job: 'Graphic Designer', threat: 72, msg: 'HIGH — Midjourney has entered the chat', detail: 'AI image generation is disrupting design. Senior creative directors are safer than junior designers.' },
  { job: 'HR Recruiter', threat: 70, msg: 'HIGH — AI screening is the new normal', detail: 'Resume screening, candidate matching, and initial outreach are increasingly automated.' },
  { job: 'Insurance Underwriter', threat: 78, msg: 'CRITICAL — Algorithms do it faster', detail: 'AI risk assessment models are faster and more accurate than manual underwriting.' },
  { job: 'Journalist', threat: 60, msg: 'ELEVATED — AP already uses AI for earnings reports', detail: 'Routine reporting is automated. Investigative journalism and opinion pieces remain human.' },
  { job: 'Lawyer', threat: 50, msg: 'ELEVATED — Baker McKenzie is already cutting', detail: 'AI handles document review and research. Courtroom advocacy and client counsel remain human.' },
  { job: 'Marketing Manager', threat: 58, msg: 'ELEVATED — AI generates campaigns now', detail: 'AI writes copy, creates ads, and optimizes targeting. Strategy and brand vision still need humans.' },
  { job: 'Mechanic', threat: 10, msg: 'SAFE — AI can\'t change your oil', detail: 'Physical repair work in variable conditions keeps mechanics safe from automation.' },
  { job: 'Nurse', threat: 8, msg: 'SAFE — Patients need human care', detail: 'Hands-on patient care, emotional support, and clinical judgment are irreplaceable.' },
  { job: 'Pharmacist', threat: 45, msg: 'MODERATE — Automated dispensing is growing', detail: 'Robot pharmacies exist but complex medication management still needs human oversight.' },
  { job: 'Plumber', threat: 3, msg: 'IMMUNE — The safest job in the AI age', detail: 'No robot can crawl under your house to fix a burst pipe at 2 AM. You\'re untouchable.' },
  { job: 'Programmer / Developer', threat: 48, msg: 'MODERATE — You\'re building your replacement', detail: 'AI writes 30% of code at Microsoft already. Senior architects are safe; junior coders less so.' },
  { job: 'Radiologist', threat: 40, msg: 'MODERATE — AI reads scans, but you interpret', detail: 'AI matches radiologists in scan reading but clinical context and rare cases need humans.' },
  { job: 'Real Estate Agent', threat: 42, msg: 'MODERATE — Zillow tried and failed (so far)', detail: 'Online platforms handle listings but negotiations, showings, and local knowledge remain human.' },
  { job: 'Retail Sales Associate', threat: 68, msg: 'HIGH — E-commerce + AI is a double hit', detail: 'Online shopping with AI recommendations is replacing in-store retail workers.' },
  { job: 'Social Media Manager', threat: 62, msg: 'ELEVATED — AI can post, but can it meme?', detail: 'AI generates content and schedules posts. Authentic brand voice and community management still need humans.' },
  { job: 'Software Engineer', threat: 48, msg: 'MODERATE — Copilot is your frenemy', detail: 'AI coding assistants boost productivity but also reduce headcount needed. Architect-level thinking is safe.' },
  { job: 'Teacher', threat: 18, msg: 'LOW — Humans teach humans best', detail: 'AI tutoring exists but classroom management, mentoring, and social development need human teachers.' },
  { job: 'Translator', threat: 90, msg: 'EXTREME — Duolingo already fired you', detail: 'AI translation quality has surpassed most human translators for common languages.' },
  { job: 'Truck Driver', threat: 38, msg: 'MODERATE — Self-driving trucks are coming... slowly', detail: 'Autonomous trucking is in trials but last-mile delivery and regulations slow adoption.' },
  { job: 'UX Designer', threat: 55, msg: 'ELEVATED — AI generates wireframes now', detail: 'AI tools create layouts and prototypes, but user research and strategic design remain human.' },
  { job: 'Warehouse Worker', threat: 80, msg: 'CRITICAL — Amazon is automating everything', detail: 'Robots handle picking, packing, and sorting. Amazon has 750,000+ robots in warehouses.' },
  { job: 'Welder', threat: 6, msg: 'SAFE — Sparks fly, robots cry', detail: 'Custom welding in construction, repair, and fabrication requires human skill and judgment.' },
];

function initQuiz() {
  const select = document.getElementById('quizSelect');
  const btn = document.getElementById('quizBtn');
  const result = document.getElementById('quizResult');
  if (!select || !btn) return;

  // Populate dropdown
  JOB_THREATS.sort((a, b) => a.job.localeCompare(b.job));
  JOB_THREATS.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.job;
    opt.textContent = item.job;
    select.appendChild(opt);
  });

  btn.addEventListener('click', () => {
    const selected = select.value;
    if (!selected) return;

    const data = JOB_THREATS.find(j => j.job === selected);
    if (!data) return;

    // Show result
    result.classList.remove('hidden');

    // Determine threat label and color
    let level, color;
    if (data.threat >= 90) { level = 'TERMINAL'; color = '#ff0000'; }
    else if (data.threat >= 75) { level = 'CRITICAL'; color = '#ff3300'; }
    else if (data.threat >= 60) { level = 'HIGH'; color = '#ff6600'; }
    else if (data.threat >= 40) { level = 'ELEVATED'; color = '#ffaa00'; }
    else if (data.threat >= 20) { level = 'MODERATE'; color = '#ffcc00'; }
    else if (data.threat >= 10) { level = 'LOW'; color = '#88ff00'; }
    else { level = 'MINIMAL'; color = '#00ff00'; }

    document.getElementById('threatLevel').textContent = level;
    document.getElementById('threatLevel').style.color = color;
    document.getElementById('threatLevel').style.textShadow = `0 0 10px ${color}`;

    // Animate bar
    const bar = document.getElementById('threatBar');
    bar.style.background = `linear-gradient(90deg, #1a0000, ${color})`;
    bar.style.boxShadow = `0 0 8px ${color}`;
    bar.style.width = '0%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bar.style.width = `${data.threat}%`;
      });
    });

    document.getElementById('threatPercent').textContent = `${data.threat}% PROBABILITY OF AI REPLACEMENT`;
    document.getElementById('threatPercent').style.color = color;
    document.getElementById('threatMessage').textContent = data.msg;
    document.getElementById('threatDetails').textContent = data.detail;

    // Scroll to result
    result.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // Share button
  document.getElementById('quizShare').addEventListener('click', () => {
    const selected = select.value;
    const data = JOB_THREATS.find(j => j.job === selected);
    if (!data) return;

    const text = `My job as a ${data.job} has a ${data.threat}% chance of being replaced by AI.\n\n${data.msg}\n\nCheck yours:`;
    const url = 'https://oranoap.github.io/ai-job-tracker/';
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  });
}


// ============================================
// 8. SURVIVORS — JOBS AI CAN'T DO (YET)
// ============================================

const SURVIVORS = [
  { job: 'Plumber', status: 'IMMUNE', note: 'No robot can crawl under your house at 2 AM to fix a burst pipe. You\'re untouchable.', icon: '&#128295;' },
  { job: 'Electrician', status: 'SAFE', note: 'Complex wiring in unpredictable buildings. Plus, robots are afraid of getting shocked.', icon: '&#9889;' },
  { job: 'Welder', status: 'SAFE', note: 'Custom fabrication in the field requires human judgment. Sparks fly, robots cry.', icon: '&#128293;' },
  { job: 'Nurse', status: 'SAFE', note: 'Patients need human empathy, bedside manner, and hands-on care. AI can\'t hold your hand.', icon: '&#129657;' },
  { job: 'Surgeon', status: 'SAFE', note: 'AI assists, but nobody wants a robot holding the scalpel unsupervised. Yet.', icon: '&#129658;' },
  { job: 'Firefighter', status: 'IMMUNE', note: 'Running into burning buildings requires courage, not algorithms.', icon: '&#128658;' },
  { job: 'Kindergarten Teacher', status: 'SAFE', note: 'Try getting an AI to manage 20 five-year-olds hopped up on juice boxes.', icon: '&#127979;' },
  { job: 'Construction Worker', status: 'SAFE', note: 'Physical labor in chaotic environments. Robots can\'t navigate a job site... yet.', icon: '&#128679;' },
  { job: 'Therapist', status: 'SAFE', note: 'AI can chat, but it can\'t truly understand human trauma. Empathy isn\'t code.', icon: '&#129504;' },
  { job: 'Emergency Room Doctor', status: 'SAFE', note: 'Split-second life-or-death decisions in chaos. AI freezes. Humans adapt.', icon: '&#127973;' },
  { job: 'Mechanic', status: 'SAFE', note: 'Diagnosing weird engine noises by feel? That\'s a human superpower.', icon: '&#128663;' },
  { job: 'Midwife', status: 'IMMUNE', note: 'Delivering babies requires human touch, literally. No exceptions.', icon: '&#128118;' },
];

function renderSurvivors() {
  const container = document.getElementById('survivorsList');
  if (!container) return;

  container.innerHTML = SURVIVORS.map((s, i) => {
    const statusClass = s.status === 'IMMUNE' ? 'status-immune' : 'status-safe';
    return `
      <div class="survivor-card" style="animation-delay: ${i * 0.08}s">
        <div class="survivor-icon">${s.icon}</div>
        <div class="survivor-info">
          <div class="survivor-job">${escapeHtml(s.job)}</div>
          <div class="survivor-note">${escapeHtml(s.note)}</div>
        </div>
        <div class="survivor-status ${statusClass}">${s.status}</div>
      </div>
    `;
  }).join('');
}


// ============================================
// 9. KONAMI CODE EASTER EGG
// ============================================

const KONAMI_SEQUENCE = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiProgress = 0;

function initKonami() {
  document.addEventListener('keydown', (e) => {
    const expected = KONAMI_SEQUENCE[konamiProgress];
    if (e.key === expected || e.key.toLowerCase() === expected) {
      konamiProgress++;
      if (konamiProgress === KONAMI_SEQUENCE.length) {
        konamiProgress = 0;
        activateKonami();
      }
    } else {
      konamiProgress = 0;
    }
  });

  // Close button
  const closeBtn = document.getElementById('konamiClose');
  if (closeBtn) {
    closeBtn.addEventListener('click', deactivateKonami);
  }
}

function activateKonami() {
  const overlay = document.getElementById('konamiOverlay');
  overlay.classList.remove('hidden');
  startMatrixRain();

  // Auto-close after 10 seconds
  setTimeout(deactivateKonami, 10000);
}

function deactivateKonami() {
  const overlay = document.getElementById('konamiOverlay');
  overlay.classList.add('hidden');
  stopMatrixRain();
}

let matrixAnimId = null;

function startMatrixRain() {
  const canvas = document.getElementById('matrixCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*SKYNETJOBSAI';
  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize);
  const drops = new Array(columns).fill(1);

  function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00ff00';
    ctx.font = `${fontSize}px Share Tech Mono`;

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }

    matrixAnimId = requestAnimationFrame(draw);
  }

  draw();
}

function stopMatrixRain() {
  if (matrixAnimId) {
    cancelAnimationFrame(matrixAnimId);
    matrixAnimId = null;
  }
}


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

  // Render leaderboard
  renderLeaderboard();

  // Initialize quiz
  initQuiz();

  // Render survivors
  renderSurvivors();

  // Initialize Konami code listener
  initKonami();

  // Fetch live news (delayed for boot animation)
  setTimeout(fetchNews, 3000);
});
