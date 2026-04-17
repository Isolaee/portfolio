const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Security & performance middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://avatars.githubusercontent.com"],
      scriptSrc: ["'self'"],
    },
  },
}));
app.use(compression());
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST'],
}));
app.use(express.json());

// Health check for AWS Fargate / ALB
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Portfolio data API
app.get('/api/profile', (req, res) => {
  res.json({
    name: process.env.PORTFOLIO_NAME || 'Your Name',
    title: process.env.PORTFOLIO_TITLE || 'Software Engineer',
    email: process.env.PORTFOLIO_EMAIL || 'you@example.com',
    github: process.env.PORTFOLIO_GITHUB || 'https://github.com/Isolaee',
    linkedin: process.env.PORTFOLIO_LINKEDIN || 'https://www.linkedin.com/in/eero-isola-78b8561b5/',
    bio: process.env.PORTFOLIO_BIO || 'Software developer open to work. Code is just a tool. Learn, build, repeat.',
  });
});

app.get('/api/projects', (req, res) => {
  const projects = [
    // AI & ML
    {
      id: 1,
      title: 'CVagent',
      description: 'Privacy-first cover letter generator powered by a local LLM (Ollama). Reads your profile from YAML, scrapes job postings, and produces tailored markdown / Word documents — no data ever leaves your machine.',
      tags: ['Python', 'Ollama', 'LLM', 'BeautifulSoup', 'python-docx'],
      category: 'AI & ML',
      github: 'https://github.com/Isolaee/CVagent',
      demo: null,
    },
    {
      id: 2,
      title: 'Stocks',
      description: 'LSTM + Transformer hybrid model that forecasts 6-month S&P 500 price returns and dividend yields from 90-day OHLCV windows with 21 engineered features. Trains locally or on GCP Vertex AI with Bayesian hyperparameter tuning.',
      tags: ['Python', 'PyTorch', 'LSTM', 'Transformer', 'GCP', 'Docker'],
      category: 'AI & ML',
      github: 'https://github.com/Isolaee/Stocks',
      demo: null,
    },
    {
      id: 3,
      title: 'YOLOHuman',
      description: 'Computer vision pipeline that detects people with YOLOv8 then hands off crops to InsightFace for age/gender estimation, pose detection, and cross-image face matching via embedding vectors.',
      tags: ['Python', 'YOLOv8', 'InsightFace', 'OpenCV', 'CV'],
      category: 'AI & ML',
      github: 'https://github.com/Isolaee/YOLOHuman',
      demo: null,
    },
    {
      id: 4,
      title: 'Speech Recognition Agent',
      description: 'Voice-driven agent that pipes microphone input through a speech-to-text layer into an LLM, then speaks the response back. Modular skills system makes it easy to extend with new capabilities.',
      tags: ['Python', 'LLM', 'STT', 'TTS', 'Agents'],
      category: 'AI & ML',
      github: 'https://github.com/Isolaee/speech-recognition',
      demo: null,
    },
    // Games
    {
      id: 5,
      title: 'Keyforge',
      description: 'Proof-of-concept digital client for the KeyForge card game written in Rust. TCP client-server architecture where the server holds authoritative state; a macroquad GUI client lets two players drag and play cards with full keyword mechanics.',
      tags: ['Rust', 'TCP', 'macroquad', 'Game'],
      category: 'Games',
      github: 'https://github.com/Isolaee/keyforge',
      demo: null,
    },
    {
      id: 6,
      title: 'MUD',
      description: 'Open-world RPG where players explore pre-written adventures or craft their own — think D&D in a terminal. Built in Python with a modular world engine covering quests, items, NPCs, and a server layer for multiplayer.',
      tags: ['Python', 'RPG', 'CLI', 'Game'],
      category: 'Games',
      github: 'https://github.com/Isolaee/MUD',
      demo: null,
    },
    {
      id: 7,
      title: 'MTGSorter V2',
      description: 'Magic: The Gathering collection manager backed by SQLite. Supports attribute search, format legality validation, and Word2Vec-powered card relationship analysis. Migrating toward a three-tier web architecture with REST APIs.',
      tags: ['Python', 'SQLite', 'Word2Vec', 'REST', 'MTG'],
      category: 'Games',
      github: 'https://github.com/Isolaee/MTGSorter_V2',
      demo: null,
    },
    {
      id: 8,
      title: 'DiceFight',
      description: 'Turn-based dice combat game built with Godot and GDScript. Fast, self-contained prototype exploring game-feel and progression loop design.',
      tags: ['GDScript', 'Godot', 'Game'],
      category: 'Games',
      github: 'https://github.com/Isolaee/DiceFight',
      demo: null,
    },
    // Tools & Web
    {
      id: 9,
      title: 'ERP',
      description: 'Internal ERP system built in HTML/JS. Centralises business operations with modules for inventory, orders, and reporting.',
      tags: ['HTML', 'JavaScript', 'ERP'],
      category: 'Tools & Web',
      github: 'https://github.com/Isolaee/erp',
      demo: null,
    },
    {
      id: 10,
      title: 'WC Dynamic Pricing',
      description: 'WooCommerce plugin implementing rule-based dynamic pricing — discounts based on quantity, user role, and cart conditions.',
      tags: ['PHP', 'WordPress', 'WooCommerce'],
      category: 'Tools & Web',
      github: 'https://github.com/Isolaee/WC-dynamic-pricing',
      demo: null,
    },
  ];
  res.json(projects);
});

app.get('/api/posts', (req, res) => {
  const posts = [
    {
      id: 1,
      slug: 'building-local-llm-tools',
      title: 'Building Privacy-First AI Tools with Local LLMs',
      excerpt: 'Why I stopped sending my data to the cloud and started running models on my own hardware — and how CVagent came out of that experiment.',
      date: '2025-03-12',
      readTime: '6 min',
      tags: ['AI', 'Privacy', 'Ollama', 'Python'],
    },
    {
      id: 2,
      slug: 'lstm-transformer-stocks',
      title: 'Combining LSTMs and Transformers for Stock Forecasting',
      excerpt: 'A walkthrough of the hybrid architecture in my Stocks project: why neither model alone was enough, and what the training curve looked like on Vertex AI.',
      date: '2025-02-01',
      readTime: '9 min',
      tags: ['ML', 'Finance', 'PyTorch', 'GCP'],
    },
    {
      id: 3,
      slug: 'rust-game-networking',
      title: 'TCP Game Networking in Rust: Lessons from Keyforge',
      excerpt: 'Building a card game where the server is the source of truth and clients only see their own hand. Patterns, pitfalls, and why Rust made it easier.',
      date: '2025-01-08',
      readTime: '8 min',
      tags: ['Rust', 'Networking', 'Games'],
    },
    {
      id: 4,
      slug: 'yolo-face-pipeline',
      title: 'Chaining YOLOv8 and InsightFace for Human Analysis',
      excerpt: 'How to build a two-stage CV pipeline that first finds people, then runs deep face analysis — and how to match the same face across multiple images.',
      date: '2024-12-15',
      readTime: '7 min',
      tags: ['Computer Vision', 'YOLOv8', 'Python'],
    },
  ];
  res.json(posts);
});

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email, and message are required' });
  }

  // In production wire up nodemailer or SES here
  console.log(`Contact form submission from ${name} <${email}>: ${message}`);

  res.json({ success: true, message: 'Message received. I will be in touch soon.' });
});

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  const clientBuild = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientBuild, { maxAge: '1y', etag: true }));
  // SPA fallback
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

module.exports = app;
