const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: `email-smtp.${process.env.SES_REGION || 'eu-north-1'}.amazonaws.com`,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SES_USER,
    pass: process.env.SES_PASS,
  },
});

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
    email: process.env.PORTFOLIO_EMAIL || 'eero.isola@gmail.com',
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
      longDescription: [
        'CVagent is a privacy-first cover letter generator that runs entirely on your own hardware. It uses Ollama to run a local LLM, meaning no data is ever sent to external servers.',
        'Your profile is defined in a YAML file. The tool scrapes the target job posting, extracts the key requirements, and passes everything to the model to produce a tailored cover letter.',
        'Output is exported as both Markdown and a formatted Word document (.docx), ready to send.',
      ],
      tags: ['Python', 'Ollama', 'LLM', 'BeautifulSoup', 'python-docx'],
      category: 'AI & ML',
      github: 'https://github.com/Isolaee/CVagent',
      demo: null,
    },
    {
      id: 2,
      title: 'Stocks',
      description: 'LSTM + Transformer hybrid model that forecasts 6-month S&P 500 price returns and dividend yields from 90-day OHLCV windows with 21 engineered features. Trains locally or on GCP Vertex AI with Bayesian hyperparameter tuning.',
      longDescription: [
        'A hybrid LSTM + Transformer model built with PyTorch that predicts 6-month forward price returns and dividend yields for S&P 500 constituents.',
        'The model ingests 90-day OHLCV windows enriched with 21 engineered features — momentum indicators, volatility measures, and calendar effects. Training runs locally or scales to GCP Vertex AI via a Dockerised pipeline.',
        'Hyperparameters are tuned with Bayesian optimisation, and the training loop supports early stopping and learning-rate scheduling to avoid overfitting.',
      ],
      tags: ['Python', 'PyTorch', 'LSTM', 'Transformer', 'GCP', 'Docker'],
      category: 'AI & ML',
      github: 'https://github.com/Isolaee/Stocks',
      demo: null,
    },
    {
      id: 3,
      title: 'YOLOHuman',
      description: 'Computer vision pipeline that detects people with YOLOv8 then hands off crops to InsightFace for age/gender estimation, pose detection, and cross-image face matching via embedding vectors.',
      longDescription: [
        'YOLOHuman is a multi-stage computer vision pipeline built around YOLOv8 for real-time person detection.',
        'Detected bounding-box crops are passed to InsightFace, which estimates age and gender, identifies body pose landmarks, and extracts face embeddings for cross-image identity matching.',
        'The modular design makes it straightforward to swap detection or recognition backends, and the pipeline runs on both CPU and CUDA-enabled GPUs.',
      ],
      tags: ['Python', 'YOLOv8', 'InsightFace', 'OpenCV', 'CV'],
      category: 'AI & ML',
      github: 'https://github.com/Isolaee/YOLOHuman',
      demo: null,
    },
    {
      id: 4,
      title: 'Speech Recognition Agent',
      description: 'Voice-driven agent that pipes microphone input through a speech-to-text layer into an LLM, then speaks the response back. Modular skills system makes it easy to extend with new capabilities.',
      longDescription: [
        'A fully voice-driven AI agent that listens through the microphone, transcribes speech with a local STT model, and routes the query to an LLM for a response.',
        'The reply is synthesised with a TTS engine and played back — creating a natural back-and-forth conversation loop without touching a keyboard.',
        'Capabilities are split into discrete skills (e.g. web search, calendar, reminders) that the agent can invoke based on intent, making it easy to add new features without changing the core loop.',
      ],
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
      longDescription: [
        'A digital client for the KeyForge card game, built from scratch in Rust as a proof-of-concept.',
        'The architecture follows a strict client-server split over TCP: the server owns all authoritative game state and enforces rules, while the macroquad GUI client is a thin presentation layer. Two players connect and play cards with full keyword mechanics in real time.',
        'The project was driven by an interest in networked game architecture and Rust\'s ownership model as a safety net for complex state machines.',
      ],
      tags: ['Rust', 'TCP', 'macroquad', 'Game'],
      category: 'Games',
      github: 'https://github.com/Isolaee/keyforge',
      demo: null,
    },
    {
      id: 6,
      title: 'MUD',
      description: 'Open-world RPG where players explore pre-written adventures or craft their own — think D&D in a terminal. Built in Python with a modular world engine covering quests, items, NPCs, and a server layer for multiplayer.',
      longDescription: [
        'A text-based open-world RPG in the tradition of classic MUDs — think Dungeons & Dragons played entirely in a terminal.',
        'The world engine handles quests, inventories, NPCs with dialogue trees, and procedural room generation. Players can explore bundled adventures or build their own using a simple authoring format.',
        'A lightweight server layer enables multiplayer sessions, letting multiple players share the same world instance simultaneously.',
      ],
      tags: ['Python', 'RPG', 'CLI', 'Game'],
      category: 'Games',
      github: 'https://github.com/Isolaee/MUD',
      demo: null,
    },
    {
      id: 7,
      title: 'MTGSorter V2',
      description: 'Magic: The Gathering collection manager backed by SQLite. Supports attribute search, format legality validation, and Word2Vec-powered card relationship analysis. Migrating toward a three-tier web architecture with REST APIs.',
      longDescription: [
        'A desktop collection manager for Magic: The Gathering cards, backed by a local SQLite database populated from the Scryfall bulk-data export.',
        'Cards can be searched and filtered by any attribute — colour, mana cost, type, set, format legality — and the tool validates deck legality against current tournament formats.',
        'A Word2Vec model trained on card text surfaces thematically related cards, useful for deckbuilding. The project is being refactored into a three-tier web application with a REST API and React frontend.',
      ],
      tags: ['Python', 'SQLite', 'Word2Vec', 'REST', 'MTG'],
      category: 'Games',
      github: 'https://github.com/Isolaee/MTGSorter_V2',
      demo: null,
    },
    {
      id: 8,
      title: 'DiceFight',
      description: 'Turn-based dice combat game built with Godot and GDScript. Fast, self-contained prototype exploring game-feel and progression loop design.',
      longDescription: [
        'DiceFight is a fast turn-based combat prototype built in Godot with GDScript.',
        'Players and enemies roll dice each turn; combinations trigger different attack and defence outcomes, creating meaningful tactical decisions without complex rules.',
        'The project was a focused experiment in game-feel — visual feedback, timing, and a short progression loop — rather than feature breadth.',
      ],
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
      longDescription: [
        'A lightweight internal ERP system built with vanilla HTML and JavaScript, designed for small businesses that need a simple operations hub without the overhead of a full commercial suite.',
        'Modules cover inventory tracking, purchase and sales orders, and summary reporting. All data is persisted locally, keeping setup minimal.',
      ],
      tags: ['HTML', 'JavaScript', 'ERP'],
      category: 'Tools & Web',
      github: 'https://github.com/Isolaee/erp',
      demo: null,
    },
    {
      id: 10,
      title: 'WC Dynamic Pricing',
      description: 'WooCommerce plugin implementing rule-based dynamic pricing — discounts based on quantity, user role, and cart conditions.',
      longDescription: [
        'A WooCommerce plugin that adds a flexible rule engine for dynamic product pricing, going beyond the built-in simple discount options.',
        'Store owners can configure tiered quantity breaks, user-role-based pricing (e.g. wholesale vs. retail), and cart-condition discounts — all from the WordPress admin without touching code.',
        'Rules are evaluated in priority order, with clear override semantics to handle edge cases like a logged-in wholesale customer also qualifying for a quantity tier.',
      ],
      tags: ['PHP', 'WordPress', 'WooCommerce'],
      category: 'Tools & Web',
      github: 'https://github.com/Isolaee/WC-dynamic-pricing',
      demo: null,
    },
  ];
  res.json(projects);
});

app.get('/api/posts', (req, res) => {
  // To add a blog post, append an object to this array:
  // {
  //   id:       <unique number>,
  //   slug:     'my-post-slug',          // used in the URL
  //   title:    'Post title',
  //   excerpt:  'Short summary shown in the card.',
  //   date:     'YYYY-MM-DD',
  //   readTime: '5 min',
  //   tags:     ['Tag1', 'Tag2'],
  // }
  const posts = [];
  res.json(posts);
});

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email, and message are required' });
  }

  const to = process.env.PORTFOLIO_EMAIL;
  if (!to || !process.env.SES_USER || !process.env.SES_PASS) {
    console.log(`Contact form submission from ${name} <${email}>: ${message}`);
    return res.json({ success: true, message: 'Message received. I will be in touch soon.' });
  }

  await transporter.sendMail({
    from: `"Portfolio Contact" <${process.env.SES_FROM || to}>`,
    to,
    replyTo: email,
    subject: `Portfolio message from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
    html: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p><p>${message.replace(/\n/g, '<br>')}</p>`,
  });

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
