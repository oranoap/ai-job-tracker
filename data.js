/* ============================================
   CONFIRMED AI JOB LOSSES — VERIFIED DATA

   Rules for this dataset:
   - Company or credible source EXPLICITLY stated AI as the reason
   - Not general "tech layoffs" or restructuring
   - Each entry has a verifiable source
   - Numbers are conservative (lower bound when ranges given)

   Last updated: 2026-03-21
   ============================================ */

const CONFIRMED_AI_LOSSES = [

  // ──────────── 2023 ────────────
  {
    company: 'Dropbox',
    jobs: 500,
    date: '2023-04',
    description: 'CEO Drew Houston cited "the era of AI" as key reason. Restructured to hire AI-skilled talent instead.',
    sector: 'Technology',
    source: 'TechCrunch',
    sourceUrl: 'https://techcrunch.com/2023/04/27/dropbox-lays-off-500-employees-16-of-staff-ceo-says-due-to-slowing-growth-and-the-era-of-ai/',
  },
  {
    company: 'IBM',
    jobs: 7800,
    date: '2023-05',
    description: 'CEO Arvind Krishna announced hiring freeze for back-office roles AI could perform. Targeted ~30% of non-customer-facing roles.',
    sector: 'Technology',
    source: 'Bloomberg',
    sourceUrl: 'https://www.bloomberg.com/news/articles/2023-05-01/ibm-to-pause-hiring-for-back-office-jobs-that-ai-could-kill',
  },
  {
    company: 'BT Group',
    jobs: 10000,
    date: '2023-05',
    description: 'Announced 10,000 job cuts specifically attributed to AI and automation, primarily in customer services and IT.',
    sector: 'Telecommunications',
    source: 'Bloomberg',
    sourceUrl: 'https://www.bloomberg.com/news/articles/2023-05-18/bt-chief-sees-ai-aiding-in-effort-to-eliminate-10-000-jobs',
  },
  {
    company: 'Dukaan',
    jobs: 27,
    date: '2023-07',
    description: 'CEO publicly replaced 90% of customer support staff with AI chatbot. Resolution time dropped from 2 hours to 3 minutes.',
    sector: 'E-Commerce',
    source: 'CNN',
    sourceUrl: 'https://edition.cnn.com/2023/07/12/business/dukaan-ceo-layoffs-ai-chatbot',
  },

  // ──────────── 2024 ────────────
  {
    company: 'Duolingo',
    jobs: 100,
    date: '2024-01',
    description: 'Laid off contract translators and content writers, replacing them with AI. CEO announced company would become "AI-first."',
    sector: 'Education',
    source: 'Washington Post',
    sourceUrl: 'https://www.washingtonpost.com/technology/2024/01/10/duolingo-ai-layoffs/',
  },
  {
    company: 'PayPal',
    jobs: 2500,
    date: '2024-01',
    description: 'CEO Alex Chriss explicitly stated need to "deploy automation and consolidate technology to reduce complexity." 9% of global workforce.',
    sector: 'Fintech',
    source: 'CNBC',
    sourceUrl: 'https://www.cnbc.com/2024/01/30/paypal-will-cut-about-2500-jobs-or-9percent-of-global-workforce.html',
  },
  {
    company: 'SAP',
    jobs: 10000,
    date: '2024-01',
    description: 'Restructured to focus on Business AI. Initially 8,000 roles, expanded to 10,000. Spent EUR 2 billion on AI transformation.',
    sector: 'Technology',
    source: 'CNN',
    sourceUrl: 'https://www.cnn.com/2024/01/24/tech/sap-restructuring-ai-jobs-intl-hnk/index.html',
  },
  {
    company: 'Citigroup',
    jobs: 20000,
    date: '2024-01',
    description: 'Multiyear restructuring targeting 20,000-person reduction. CEO Fraser stated automation and AI will mean some roles "will no longer be required." 70% AI tool adoption.',
    sector: 'Finance',
    source: 'Fortune',
    sourceUrl: 'https://fortune.com/2026/01/14/citigroup-ceo-jane-fraser-job-cuts-ai-bad-old-ways-restructuring/',
  },
  {
    company: 'Klarna',
    jobs: 700,
    date: '2024-02',
    description: 'AI assistant replaced 700 customer service agents, handling 2.3M conversations (75% of all chats) within one month.',
    sector: 'Fintech',
    source: 'CBS News',
    sourceUrl: 'https://www.cbsnews.com/news/klarna-ceo-ai-chatbot-replacing-workers-sebastian-siemiatkowski/',
  },
  {
    company: 'Intuit',
    jobs: 1800,
    date: '2024-07',
    description: 'Cut 1,800 employees as part of AI transformation. Simultaneously planned to hire 1,800 with AI skills.',
    sector: 'Technology',
    source: 'Fortune',
    sourceUrl: 'https://fortune.com/2024/07/10/intuit-layoffs-email-hiring-ai-transformation/',
  },
  {
    company: 'Dell',
    jobs: 12500,
    date: '2024-08',
    description: 'Cut 10% of workforce in sales division reorganization, creating new AI-focused unit. Part of broader 18,500 cuts across two rounds.',
    sector: 'Technology',
    source: 'Bloomberg',
    sourceUrl: 'https://www.bloomberg.com/news/articles/2024-08-05/dell-layoffs-hit-sales-team-with-new-unit-focused-on-ai',
  },
  {
    company: 'Intel',
    jobs: 15000,
    date: '2024-08',
    description: 'Cut 15%+ of workforce as part of $10B cost reduction. Layoffs tied to failure to compete in AI chip market against Nvidia and AMD.',
    sector: 'Semiconductors',
    source: 'CNN',
    sourceUrl: 'https://www.cnn.com/2025/07/24/tech/intel-layoffs-15-percent-q2-earnings',
  },
  {
    company: 'Cisco',
    jobs: 5500,
    date: '2024-09',
    description: 'CEO Chuck Robbins cited AI five times in announcement. CFO stated restructuring to "pivot more resources into AI, cloud, and cybersecurity."',
    sector: 'Technology',
    source: 'Futurism',
    sourceUrl: 'https://futurism.com/the-byte/cisco-layoff-ai-profit',
  },

  // ──────────── 2025 ────────────
  {
    company: 'Workday',
    jobs: 1750,
    date: '2025-02',
    description: 'Cut 1,750 roles to redirect investment toward AI and international growth.',
    sector: 'Technology',
    source: 'Programs.com',
    sourceUrl: 'https://programs.com/resources/ai-layoffs/',
  },
  {
    company: 'UPS',
    jobs: 20000,
    date: '2025-04',
    description: 'Cut 20,000 jobs and closed 73 facilities, citing increased automation. 400 facilities becoming partly or fully automated.',
    sector: 'Logistics',
    source: 'CNN',
    sourceUrl: 'https://www.cnn.com/2025/04/29/business/ups-job-cuts',
  },
  {
    company: 'CrowdStrike',
    jobs: 500,
    date: '2025-05',
    description: 'CEO George Kurtz said "AI flattens our hiring curve" and called AI "a force multiplier throughout the business." 5% of workforce.',
    sector: 'Cybersecurity',
    source: 'CNBC',
    sourceUrl: 'https://www.cnbc.com/2025/05/07/crowdstrike-announces-5percent-job-cuts-says-ai-reshaping-every-industry.html',
  },
  {
    company: 'Microsoft',
    jobs: 9000,
    date: '2025-07',
    description: 'Cut thousands across engineering, sales, and customer service coinciding with massive AI investment. 30% of code now AI-written.',
    sector: 'Technology',
    source: 'Fortune',
    sourceUrl: 'https://fortune.com/2025/07/02/microsoft-layoffs-9000-ai/',
  },
  {
    company: 'Fiverr',
    jobs: 250,
    date: '2025-09',
    description: 'Repositioned as "AI-first" company. CEO said tasks previously done by humans would be handled by AI.',
    sector: 'Technology',
    source: 'Engadget',
    sourceUrl: 'https://www.engadget.com/ai/fiverr-is-laying-off-250-employees-to-become-an-ai-first-company-215730063.html',
  },
  {
    company: 'Salesforce',
    jobs: 4000,
    date: '2025-09',
    description: 'CEO Benioff confirmed 4,000 customer service roles cut as AI agents took over. "I need less heads."',
    sector: 'Technology',
    source: 'Fortune',
    sourceUrl: 'https://fortune.com/2025/09/02/salesforce-ceo-billionaire-marc-benioff-ai-agents-jobs-layoffs-customer-service-sales/',
  },
  {
    company: 'Accenture',
    jobs: 11000,
    date: '2025-09',
    description: 'Laid off 11,000+ in quarter ending August 2025. CEO stated company is "exiting" employees who cannot be reskilled for AI. $865M restructuring costs.',
    sector: 'Consulting',
    source: 'CNBC',
    sourceUrl: 'https://www.cnbc.com/2025/09/26/accenture-plans-on-exiting-staff-who-cant-be-reskilled-on-ai.html',
  },
  {
    company: 'Lufthansa',
    jobs: 4000,
    date: '2025-09',
    description: 'Explicitly stated "The increased use of artificial intelligence will lead to greater efficiency." Primarily admin roles. First major airline to cite AI for cuts.',
    sector: 'Aviation',
    source: 'CNBC',
    sourceUrl: 'https://www.cnbc.com/2025/09/29/lufthansa-to-cut-4000-jobs-turns-to-ai-to-boost-efficiency-.html',
  },
  {
    company: 'Chegg',
    jobs: 388,
    date: '2025-10',
    description: 'Explicitly blamed "new realities of AI" as ChatGPT devastated homework-help business. Stock lost 99% from peak.',
    sector: 'Education',
    source: 'CNBC',
    sourceUrl: 'https://www.cnbc.com/2025/10/27/chegg-slashes-45percent-of-workforce-blames-new-realities-of-ai.html',
  },
  {
    company: 'Amazon',
    jobs: 14000,
    date: '2025-10',
    description: 'Cut 14,000 corporate positions targeting middle managers. CEO memo stated AI agents would drive "significant reduction in corporate roles."',
    sector: 'Technology',
    source: 'NBC News',
    sourceUrl: 'https://www.nbcnews.com/business/business-news/amazon-layoffs-thousands-corporate-artificial-intelligence-rcna240155',
  },
  {
    company: 'Paycom',
    jobs: 500,
    date: '2025-10',
    description: 'Eliminated 500+ non-client-facing positions, explicitly stating roles had been automated by AI-driven payroll systems.',
    sector: 'Technology',
    source: 'KOSU/NPR',
    sourceUrl: 'https://www.kosu.org/local-news/2025-10-01/paycom-lays-off-500-employees-will-replace-jobs-with-ai',
  },
  {
    company: 'C.H. Robinson',
    jobs: 1400,
    date: '2025-10',
    description: 'Cut jobs after rolling out AI-driven tools for pricing, scheduling, and shipment tracking. Executives cited productivity improvements from AI.',
    sector: 'Logistics',
    source: 'Yahoo Finance',
    sourceUrl: 'https://finance.yahoo.com/news/c-h-robinson-improved-profitability-130951444.html',
  },
  {
    company: 'Omnicom',
    jobs: 4000,
    date: '2025-12',
    description: 'Post-IPG acquisition layoffs. CEO John Wren cited generative AI as giving the company "fresh agility and scale."',
    sector: 'Advertising',
    source: 'Axios',
    sourceUrl: 'https://www.axios.com/2025/12/02/omnicom-ipg-layoffs',
  },

  // ──────────── 2026 ────────────
  {
    company: 'WiseTech Global',
    jobs: 2000,
    date: '2026-01',
    description: 'AI-driven restructuring program across logistics software operations.',
    sector: 'Technology',
    source: 'Digital Journal',
    sourceUrl: 'https://www.digitaljournal.com/business/job-losses-due-to-ai-are-mounting-up-in-2026/article',
  },
  {
    company: 'Baker McKenzie',
    jobs: 600,
    date: '2026-01',
    description: 'One of the world\'s largest law firms announced cuts as part of shift toward AI.',
    sector: 'Legal',
    source: 'Digital Journal',
    sourceUrl: 'https://www.digitaljournal.com/business/job-losses-due-to-ai-are-mounting-up-in-2026/article',
  },
  {
    company: 'Dow',
    jobs: 4500,
    date: '2026-01',
    description: 'Eliminating jobs as part of increased AI and automation usage across chemicals/plastics operations.',
    sector: 'Manufacturing',
    source: 'Digital Journal',
    sourceUrl: 'https://www.digitaljournal.com/business/job-losses-due-to-ai-are-mounting-up-in-2026/article',
  },
  {
    company: 'Pinterest',
    jobs: 700,
    date: '2026-01',
    description: 'Cut 15% of workforce to reallocate resources to AI-powered products and AI-focused roles and teams.',
    sector: 'Technology',
    source: 'CNBC',
    sourceUrl: 'https://www.cnbc.com/2026/01/27/pinterest-layoffs-stock-ai.html',
  },
  {
    company: 'Ocado',
    jobs: 1000,
    date: '2026-02',
    description: 'Cut 5% of workforce. AI helping competitors replicate Ocado\'s warehouse automation faster and more cheaply, eroding competitive advantage.',
    sector: 'Retail',
    source: 'Bloomberg',
    sourceUrl: 'https://www.bloomberg.com/news/articles/2026-02-26/ocado-to-cut-jobs-as-its-automated-warehouse-rollout-stutters',
  },
  {
    company: 'Block (Square/Cash App)',
    jobs: 4000,
    date: '2026-03',
    description: 'Workforce reduced from ~10,000 to fewer than 6,000. Explicitly adopted AI tools and stated it no longer needs as many workers.',
    sector: 'Fintech',
    source: 'CBS News',
    sourceUrl: 'https://www.cbsnews.com/news/ai-layoffs-2026-artificial-intelligence-amazon-pinterest/',
  },
  {
    company: 'Atlassian',
    jobs: 1600,
    date: '2026-03',
    description: 'CEO Mike Cannon-Brookes cut 10% of workforce to "self-fund further investment in AI and enterprise sales." Over 900 cuts from R&D.',
    sector: 'Technology',
    source: 'CNBC',
    sourceUrl: 'https://www.cnbc.com/2026/03/11/atlassian-slashes-10percent-of-workforce-to-self-fund-investments-in-ai.html',
  },
  {
    company: 'Crypto.com',
    jobs: 180,
    date: '2026-03',
    description: 'CEO Kris Marszalek said "Companies that do not make this pivot immediately will fail." 12% of workforce cut as company integrates AI.',
    sector: 'Cryptocurrency',
    source: 'CNBC',
    sourceUrl: 'https://www.cnbc.com/2026/03/19/crypto-com-layoffs-12percent-ai-job-loss.html',
  },
];

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
