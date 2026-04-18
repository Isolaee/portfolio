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
        'Writing a tailored cover letter for every application is slow — and using cloud AI tools means pasting your personal career history into someone else\'s servers. CVagent solves both problems at once.',
        'It runs a local LLM via Ollama so no data ever leaves your machine. You define your profile once in a YAML file; CVagent then scrapes the target job posting, extracts its key requirements, and passes everything to the model to produce a letter that speaks directly to that role.',
        'Output is written as both Markdown and a formatted Word document, ready to send without any manual reformatting.',
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
        'Retail investors lack the systematic forecasting tools that institutional desks take for granted. This project closes that gap with a hybrid deep-learning model that predicts 6-month forward price returns and dividend yields for S&P 500 constituents.',
        'The model combines an LSTM (for sequential pattern memory) with a Transformer encoder (for long-range dependencies) and ingests 90-day OHLCV windows enriched with 21 engineered features — momentum indicators, volatility measures, and calendar effects.',
        'Training scales from a local GPU to GCP Vertex AI via a Dockerised pipeline. Bayesian hyperparameter optimisation, early stopping, and learning-rate scheduling keep the model from memorising noise rather than learning signal.',
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
        'Building a person-analytics system typically means stitching together several unrelated models, each with different input formats and output schemas. YOLOHuman solves this by providing a single, end-to-end pipeline with a clean handoff between stages.',
        'YOLOv8 handles real-time person detection and produces tight bounding-box crops. Those crops are handed to InsightFace, which estimates age and gender, extracts pose landmarks, and generates face embeddings — enabling identity matching across separate images or video frames.',
        'The modular stage design means individual backends can be swapped without rewriting the pipeline. It runs on both CPU and CUDA-enabled GPUs, scaling from a laptop to a dedicated inference machine.',
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
        'Typing breaks flow — especially when you\'re in the middle of a task and just need a quick answer. This agent removes the keyboard entirely: you speak, it listens, responds, and speaks back.',
        'Microphone input is transcribed by a local STT model, routed to an LLM for a response, then synthesised by a TTS engine and played back — a complete voice loop with no round-trips to the cloud.',
        'Capabilities are split into discrete, independently loadable skills (web search, calendar, reminders, and more). The agent selects the right skill based on intent, so adding a new capability means writing one new module rather than touching the core loop.',
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
        'KeyForge has no official digital client, making remote play dependent on clunky workarounds like webcams and shared spreadsheets. Keyforge is a proof-of-concept that gives the game a proper networked home.',
        'The architecture uses a strict client-server split over TCP: the server owns all authoritative game state and enforces every rule, so neither client can cheat or desync. The macroquad GUI is a thin presentation layer — drag cards, see the board, nothing more.',
        'Rust was chosen deliberately: its ownership model catches entire classes of state-mutation bugs at compile time, making it a natural fit for the complex, branching state machine that card-game rules represent.',
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
        'Most text adventure engines are either too rigid to tell custom stories, or so complex to set up that the authoring overhead kills the fun. MUD aims for the middle: a world engine powerful enough for real RPG depth, simple enough for anyone to write a new adventure in an afternoon.',
        'The engine handles quests, inventories, NPCs with branching dialogue trees, and room generation. Bundled campaigns give players something to explore immediately; a straightforward authoring format lets creators define their own worlds without touching Python.',
        'A lightweight server layer stitches it all together for multiplayer — multiple players share the same live world instance, each affecting the shared state in real time.',
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
        'A large MTG collection becomes unmanageable fast: duplicate tracking, format legality questions, and the endless "what cards synergise with this?" rabbit hole all eat into playtime. MTGSorter V2 puts the collection in a queryable database and adds ML on top.',
        'The SQLite backend is populated from Scryfall\'s bulk export. Every card attribute — colour, mana cost, type, set, format legality — is filterable, and the tool validates entire decklists against current tournament formats in one pass.',
        'A Word2Vec model trained on card oracle text surfaces thematically related cards based on semantic similarity, accelerating deckbuilding without manual cross-referencing. The project is being refactored into a three-tier web app with a REST API and React frontend.',
      ],
      tags: ['Python', 'SQLite', 'Word2Vec', 'REST', 'MTG'],
      category: 'Games',
      github: 'https://github.com/Isolaee/MTGSorter_V2',
      demo: null,
    },
    // Tools & Web
    {
      id: 9,
      title: 'ERP',
      description: 'Internal ERP system built in HTML/JS. Centralises business operations with modules for inventory, orders, and reporting.',
      longDescription: [
        'Commercial ERP suites are expensive, over-engineered, and require weeks of setup — overkill for a small business that just needs to track stock, orders, and revenue in one place. This ERP was built to fill that gap with zero infrastructure.',
        'Built in vanilla HTML and JavaScript with local data persistence, it runs straight from a browser with no server required. Modules cover inventory tracking, purchase and sales orders, and summary reporting — everything a small operation needs to stay on top of day-to-day activity.',
        'The no-dependency approach keeps maintenance trivial and the learning curve flat, letting non-technical staff use it without training.',
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
        'WooCommerce\'s built-in pricing is binary: either a product costs X, or it\'s on sale for Y. That\'s not enough for stores with wholesale accounts, bulk buyers, and promotional conditions all running simultaneously. This plugin adds a proper rule engine.',
        'Store owners configure tiered quantity breaks, user-role-based prices (wholesale vs. retail), and cart-condition discounts — all from the WordPress admin, no code required.',
        'Rules are evaluated in priority order with explicit override semantics, so edge cases like a wholesale customer who also qualifies for a quantity tier are handled predictably rather than producing random results.',
      ],
      tags: ['PHP', 'WordPress', 'WooCommerce'],
      category: 'WordPress',
      github: 'https://github.com/Isolaee/WC-dynamic-pricing',
      demo: null,
    },
    // AI & ML (continued)
    {
      id: 11,
      title: 'YOLO NumberVision',
      description: 'YOLOv8-based digit detection system trained on a MNIST-to-YOLO converted dataset. Detects and classifies digits 0–9 in real-time across images, video files, and live webcam streams.',
      longDescription: [
        'Generic YOLO tutorials focus on objects and people; adapting the pipeline for digit-specific detection — useful in industrial gauges, scoreboards, and accessibility tools — requires a custom training setup that most guides skip over. This project covers the whole path.',
        'MNIST is converted to YOLO annotation format, giving 5,000 training and 1,000 validation images. YOLOv8 is then fine-tuned on that dataset and evaluated with standard detection metrics.',
        'The trained model runs inference on static images, video files, and live webcam streams with a single script switch — making it straightforward to drop into any pipeline that needs reliable digit recognition.',
      ],
      tags: ['Python', 'YOLOv8', 'PyTorch', 'MNIST', 'CV'],
      category: 'AI & ML',
      github: 'https://github.com/Isolaee/YOLO_Numbervision',
      demo: null,
    },
    // Finance & Quant
    {
      id: 12,
      title: 'Bond Evaluation',
      description: 'Python tool that prices a 10-year German government bond using real ECB Nelson-Siegel-Svensson yield curve data, comparing NPV under term-structure discounting against a flat-yield baseline.',
      longDescription: [
        'Using a flat discount rate for bond pricing ignores the actual shape of the yield curve, producing valuations that are systematically biased — especially at the long end. This tool replaces the flat rate with per-year yields derived from real ECB data.',
        'It reads Nelson-Siegel-Svensson beta parameters from CSV, averages yields across each maturity year, and computes the NPV of a 2.6% coupon bond\'s cash flows using those term-structure discount rates. Four pre-built scenarios (IF, PY, SR, and baseline) let you see how different rate environments shift the valuation.',
        'A flat-yield fallback covers any missing year, and the entire dependency chain is just pandas — making the tool easy to extend into multi-bond comparison tables or stress-test loops.',
      ],
      tags: ['Python', 'pandas', 'Finance', 'Yield Curve', 'NSS'],
      category: 'Finance & Quant',
      github: 'https://github.com/Isolaee/BondEvaluation',
      demo: null,
    },
    {
      id: 13,
      title: 'Black-Scholes Greeks',
      description: 'C++ implementation that calculates options Greeks (Delta, Gamma) using three methods — closed-form analytics, classical forward differences, and complex-step differentiation — and compares their accuracy side by side.',
      longDescription: [
        'Quants and students studying options pricing often see Greeks derived analytically, but rarely see a direct accuracy comparison against numerical methods. Understanding those trade-offs matters when you\'re choosing an approach for a production pricer. This project makes the comparison explicit.',
        'Three methods are implemented for Delta and Gamma: closed-form analytic solutions, classical forward finite differences, and complex-step differentiation at O(h²) and O(h⁴) accuracy. Each is run against the same option parameters and the results are written to CSV for plotting.',
        'A CI-backed unit test suite (GitHub Actions) verifies correctness on every push, and gnuplot scripts turn the output into accuracy comparison charts.',
      ],
      tags: ['C++', 'Black-Scholes', 'Finance', 'Numerical Methods', 'Greeks'],
      category: 'Finance & Quant',
      github: 'https://github.com/Isolaee/bsAlg',
      demo: null,
    },
    {
      id: 14,
      title: 'Quant Platform',
      description: 'Full-stack TypeScript market analytics service with an Express REST API, static HTML frontend, and AWS CDK infrastructure-as-code for one-command cloud deployment to ECS and S3.',
      longDescription: [
        'Standing up a cloud-deployed analytics service typically means hours of AWS console clicking before you write a single line of business logic. This project inverts that — the infrastructure is code from day one, and the first deploy is a single CDK command.',
        'The backend is a typed Express API in TypeScript running in a Dockerised ECS container. The frontend is a lightweight HTML/JS app served from S3. AWS CDK wires the two together with CloudFormation, managing the necessary IAM, ECR, and S3 policies as a reproducible stack.',
        'The architecture is intentionally minimal so it can be extended with new API routes and frontend features without touching the infrastructure layer.',
      ],
      tags: ['TypeScript', 'AWS CDK', 'Express', 'Docker', 'ECS', 'S3'],
      category: 'Finance & Quant',
      github: 'https://github.com/Isolaee/quant',
      demo: null,
    },
    // Games (continued)
    {
      id: 15,
      title: 'JumpMan.gb',
      description: 'Work-in-progress Game Boy platformer written entirely in assembly (RGBDS). Compiles to a real .gb ROM playable on any emulator, with no abstractions between the code and the hardware.',
      longDescription: [
        'Writing a Game Boy game in assembly means working with hardware registers, VRAM timing windows, and a 160×144 display — with no engine, no standard library, and no runtime to hide the details. It\'s one of the most direct ways to test your understanding of low-level computing.',
        'JumpMan is a work-in-progress platformer built with RGBDS. The source compiles to a .gb ROM that runs on real hardware or any emulator. Sprite rendering, input polling, and basic physics are handled by hand in the main assembly file.',
        'The project exists as a long-running learning exercise in hardware-level programming and retro game development.',
      ],
      tags: ['Assembly', 'RGBDS', 'Game Boy', 'Homebrew'],
      category: 'Games',
      github: 'https://github.com/Isolaee/gb_jumpman',
      demo: null,
    },
    {
      id: 16,
      title: 'QuestQuest',
      description: 'Multi-crate Rust game engine built from scratch: OpenGL 4.x hex grid rendering, trait-based unit system, turn-based combat, GOAP AI planner, and a runtime encyclopedia — fully tested and documented.',
      longDescription: [
        'Most game engines hide the math behind their hex grids and AI planners behind abstractions. Building them from scratch in Rust forces you to get both right — the ownership model won\'t let you cut corners with state mutations, and the type system makes invalid game states unrepresentable.',
        'The workspace is split into focused crates: Graphics handles OpenGL 4.x rendering with a flat-top axial hex grid, view-frustum culling, and multi-layer sprite rendering. Combat resolves turn-based encounters. Units defines trait-based entities with abilities. AI implements a Goal-Oriented Action Planning system. Encyclopedia provides a dynamic runtime reference system.',
        'Every public function carries Rust docs, and a test suite covers the core logic — the goal is a codebase that\'s as readable and maintainable as it is playable.',
      ],
      tags: ['Rust', 'OpenGL', 'GOAP', 'Hex Grid', 'Game Engine'],
      category: 'Games',
      github: 'https://github.com/Isolaee/QuestQuest',
      demo: null,
    },
    {
      id: 17,
      title: 'MTG Webapp',
      description: 'Three-tier Magic: The Gathering web app: Flask REST API backend, React TypeScript frontend, SQLite database. Supports card search with hover image previews, multi-format deck building, and commander selection.',
      longDescription: [
        'MTGSorter V2 worked well as a desktop tool, but players increasingly want to search and build decks from a browser without installing Python. MTG Webapp is the full three-tier rewrite that enables exactly that.',
        'The Flask backend exposes a REST API over a Scryfall-populated SQLite database. The React TypeScript frontend lets you search cards by name (semicolon-separated for multi-card lookup), preview card images on hover, and add cards to a deck with one click.',
        'Deck building supports nine formats — Commander, Standard, Modern, Pioneer, Legacy, Vintage, Pauper, Brawl, and Historic — with commander selection for EDH. The architecture separates concerns cleanly so swapping the database or adding new API endpoints is straightforward.',
      ],
      tags: ['Python', 'Flask', 'React', 'TypeScript', 'SQLite', 'MTG'],
      category: 'Games',
      github: 'https://github.com/Isolaee/mtg-webapp',
      demo: null,
    },
    {
      id: 18,
      title: 'TravianMap',
      description: 'Full-stack Travian game map explorer: Rust (Axum) REST API backend, React TypeScript frontend, PostgreSQL database. Parses the Travian map export and lets players search, filter, and analyse settlement data.',
      longDescription: [
        'Travian\'s in-game map shows you what\'s there, but it doesn\'t let you search, filter by tribe or population, or track how settlements change over time — all things that serious players need for scouting and planning. TravianMap fills that gap.',
        'The Rust Axum backend ingests the Travian map data export into PostgreSQL and exposes it via a typed REST API. The React TypeScript frontend, built with Vite, queries the API and renders settlement data in a searchable, filterable view.',
        'Rust was chosen for the backend to keep query latency low and memory usage predictable even when working with full-map datasets of hundreds of thousands of cells.',
      ],
      tags: ['Rust', 'Axum', 'React', 'TypeScript', 'PostgreSQL', 'Docker'],
      category: 'Games',
      github: 'https://github.com/Isolaee/TravianMap',
      demo: null,
    },
    {
      id: 19,
      title: 'VR Bad Design Demo',
      description: 'Unity VR application that deliberately showcases bad design practices across 7 scenes — motion sickness triggers, confusing affordances, inaccessible UI — so students feel why the rules exist rather than just reading them.',
      longDescription: [
        'Explaining VR design anti-patterns on a slide deck is ineffective: students nod along and then repeat the same mistakes. The only way to make the lessons stick is to put someone in a headset and let them experience discomfort directly. This project is that experience.',
        'Seven scenes each demonstrate a specific class of design failure — locomotion-induced motion sickness, broken affordances, UI placed in inaccessible locations, and others. Each failure is intentional and visceral; thirty seconds in a bad scene communicates more than a lecture slide ever could.',
        'Built in Unity with the XR Interaction Toolkit, the project is provided as source so educators can modify scenes, add new anti-patterns, or use individual scenes as isolated discussion prompts. Created for Oulu University.',
      ],
      tags: ['C#', 'Unity', 'VR', 'XR', 'Education'],
      category: 'Games',
      github: 'https://github.com/Isolaee/VRBadDesignDemo',
      demo: null,
    },
    // WordPress
    {
      id: 20,
      title: 'Pitchdeck V2',
      description: 'WordPress plugin that converts a PPTX or PDF presentation into a narrated MP4. OpenAI generates per-slide voiceover scripts, TTS converts them to MP3, and ffmpeg renders the final video — all from the browser.',
      longDescription: [
        'Recording a narrated presentation normally means screen-capture software, a microphone, and hours of editing. Pitchdeck V2 automates the entire pipeline from a browser upload.',
        'Upload a PPTX or PDF via a WordPress shortcode. The plugin extracts text from each slide and sends it to OpenAI to generate a voiceover script — in Finnish, English, or Swedish. Scripts are editable before audio is generated, so you can review and adjust tone before committing.',
        'Once approved, OpenAI TTS converts each script to MP3. ffmpeg renders each slide as an image, combines it with its audio clip, then concatenates everything into a final output.mp4. The entire workflow runs server-side through a REST API with no third-party video service required.',
      ],
      tags: ['PHP', 'WordPress', 'OpenAI', 'ffmpeg', 'TTS'],
      category: 'WordPress',
      github: 'https://github.com/Isolaee/pitchdeckv2',
      demo: null,
    },
    {
      id: 21,
      title: 'BV Listing Manager',
      description: 'WordPress plugin providing a full paid-listing ecosystem: AJAX draft saving, WooCommerce payment integration, automatic post-payment publication, and a customer dashboard with expiry tracking.',
      longDescription: [
        'Building a marketplace where users submit and pay for listings requires plumbing that WooCommerce doesn\'t provide out of the box — a draft state that survives page reloads, payment-gated publication, and a customer-facing view of active listings and their expiry dates.',
        'BV Listing Manager handles the entire lifecycle. Users create listings through ACF forms with AJAX auto-save; the plugin manages cart insertion and checkout redirect automatically. On successful payment, the listing is published without any admin intervention.',
        'Paid listings can be hidden and republished without additional payment, and a 90-day expiry is tracked from creation. The customer dashboard shows active listings, draft listings, and purchase history — all from the WooCommerce My Account page.',
      ],
      tags: ['PHP', 'WordPress', 'WooCommerce', 'ACF', 'AJAX'],
      category: 'WordPress',
      github: 'https://github.com/Isolaee/bv-listing-manager',
      demo: null,
    },
    {
      id: 22,
      title: 'Anonymous Feedback',
      description: 'Minimal WordPress plugin that adds an [anonymous_feedback] shortcode rendering a popup form. Feedback is emailed with page URL and timestamp — no personal data collected, no database writes.',
      longDescription: [
        'Linking feedback to user accounts changes what people are willing to say. The most honest responses come when submitters know there\'s no way to trace the message back to them.',
        'This plugin adds a single shortcode that renders a button and modal form. On submission, the feedback text, page URL, and timestamp are emailed to the site address via wp_mail. Nothing is stored in the database and no session or identity data is captured.',
        'Installation is one file copy and plugin activation. The button label is customisable via a shortcode attribute, and the plugin has no front-end dependencies beyond the WordPress core.',
      ],
      tags: ['PHP', 'WordPress', 'Shortcode'],
      category: 'WordPress',
      github: 'https://github.com/Isolaee/feedback',
      demo: null,
    },
    {
      id: 23,
      title: 'Genesis Attendance',
      description: 'WordPress plugin for daily visitor count logging. A shortcode-rendered form lets admins record attendance; resubmitting the same date updates rather than duplicates. Data is stored in a custom DB table for historical reporting.',
      longDescription: [
        'Physical venues — gyms, community halls, clubs — often need to log daily visitor counts without a third-party integration, a paid SaaS, or a developer on call. This plugin reduces that to a form on a WordPress page.',
        'The [attendance_form] shortcode renders an admin-only input that stores counts in a custom database table keyed on DATE PRIMARY KEY, so resubmitting the same day safely updates the record instead of duplicating it.',
        'CSRF protection via nonces, admin-only access enforcement, and no external dependencies make it a zero-maintenance drop-in for any WordPress site with a physical component.',
      ],
      tags: ['PHP', 'WordPress', 'Shortcode', 'MySQL'],
      category: 'WordPress',
      github: 'https://github.com/Isolaee/genesis-wp-admin',
      demo: null,
    },
    {
      id: 24,
      title: 'Genesis WP Members',
      description: 'WordPress plugin that auto-assigns unique alphanumeric membership numbers at registration and backfills all existing users on activation — collision-safe, zero configuration.',
      longDescription: [
        'Membership and association sites need a human-readable identifier for every member that is distinct from the internal WordPress user ID — but WordPress has no built-in mechanism to generate or maintain one.',
        'This plugin hooks into user_register to assign a unique 6-character alphanumeric number the moment a new account is created. On plugin activation, it backfills every existing user who is missing a number in a single pass, with collision checking at each generation step.',
        'Numbers are stored under the membership_number user meta key and are immediately accessible via standard WordPress meta APIs — no custom tables, no composer dependencies.',
      ],
      tags: ['PHP', 'WordPress', 'WooCommerce'],
      category: 'WordPress',
      github: 'https://github.com/Isolaee/genesis-wp-members',
      demo: null,
    },
    {
      id: 25,
      title: 'Genesis Reservations',
      description: 'Lightweight WordPress event reservation plugin. A flexible shortcode handles sign-up forms with capacity limits; an admin panel lists all registrants. No third-party dependencies.',
      longDescription: [
        'Most event registration plugins are built for recurring calendars and complex ticketing flows. For a one-off meeting or club event, all you actually need is a form with a cap and a list of who signed up.',
        'The [reservation] shortcode is fully configurable per instance — event name, time, place, description, and maximum capacity are all set inline. The form shows remaining spots, closes automatically when the limit is reached, and displays a "fully booked" message without any admin action.',
        'All registrations — name, email, timestamp — appear in a dedicated WordPress admin panel where entries can be reviewed or deleted. The entire plugin is a single PHP file with a custom database table and no Composer dependencies.',
      ],
      tags: ['PHP', 'WordPress', 'Shortcode', 'MySQL'],
      category: 'WordPress',
      github: 'https://github.com/Isolaee/genesis-wp-plugin',
      demo: null,
    },
    {
      id: 26,
      title: 'GR Hakuvahti',
      description: 'WordPress plugin for searching posts by ACF field criteria and saving searches as "watches". A daily WP-Cron job emails HTML digests to users whenever new matching posts are published.',
      longDescription: [
        'Real estate and marketplace sites built on WordPress + ACF face a common problem: users want to be notified when a new listing matches what they\'re looking for, but implementing that logic from scratch is significant custom development for every client project.',
        'Hakuvahti provides a reusable solution. Users define search criteria across any ACF fields with AND/OR logic, numeric range comparisons, and nested field access via dot notation. Searches are saved as "watches" attached to their account.',
        'A WP-Cron job runs daily, evaluates all saved watches, tracks which posts are new since the last run, and sends each user a consolidated HTML email listing only the new matches. WP Grid Builder integration maps facets directly to ACF fields for seamless front-end filtering.',
      ],
      tags: ['PHP', 'WordPress', 'ACF', 'WP-Cron', 'WooCommerce'],
      category: 'WordPress',
      github: 'https://github.com/Isolaee/gr-hakuvahti',
      demo: null,
    },
    {
      id: 27,
      title: 'WP SQL Workloads',
      description: 'WordPress admin plugin for database-driven email scheduling. Define a SQL SELECT query and a run time; the plugin fires an email for every row returned, using Contact Form 7 templates for no-code customisation.',
      longDescription: [
        'WordPress sites regularly need to send automated notifications based on database state — expiring memberships, overdue tasks, listings nearing the 90-day mark. Without a dedicated tool, this means a new custom cron function for every use case.',
        'WP SQL Workloads generalises the pattern. You write a SELECT query, set a daily execution time, and optionally attach a Contact Form 7 form as the email template. Each row returned by the query maps to one email, with column values substituted into the template fields.',
        'A test-mode button executes the workload immediately with debug output, a preview shows query results before scheduling, and workloads can be paused without deletion. A dashboard widget shows upcoming runs and last execution times at a glance.',
      ],
      tags: ['PHP', 'WordPress', 'WP-Cron', 'MySQL', 'CF7'],
      category: 'WordPress',
      github: 'https://github.com/Isolaee/time-extension',
      demo: null,
    },
    {
      id: 28,
      title: 'ACF Field Migration',
      description: 'One-time WordPress plugin that renames ACF postmeta keys in bulk — both the value rows and the hidden reference rows — fixing field-name casing issues across thousands of posts safely.',
      longDescription: [
        'Renaming an ACF field key after data has already been collected leaves the existing postmeta rows pointing at the old key. ACF stores both a value row and a hidden _ reference row per field, so a naive UPDATE misses half the data and silently breaks field lookups.',
        'This plugin handles both row types in a single operation, updating the value rows and their corresponding reference rows in one pass. Output shows exactly how many rows were affected per key, so you can verify the migration before signing off.',
        'The plugin is designed to be installed, run once via a URL parameter while logged in as admin, then deleted immediately — a deliberate one-shot tool rather than a persistent dependency.',
      ],
      tags: ['PHP', 'WordPress', 'ACF', 'MySQL', 'Migration'],
      category: 'WordPress',
      github: 'https://github.com/Isolaee/wp-bd-update',
      demo: null,
    },
    {
      id: 29,
      title: 'ACF DB Sync',
      description: 'WordPress admin plugin that bulk-inserts missing postmeta rows for ACF fields across all existing posts. Solves the blank-field problem that appears after adding new ACF fields to a live site.',
      longDescription: [
        'When you add a new ACF field group to an existing WordPress site, every post published before that moment has no postmeta row for the new fields. ACF returns empty values and meta queries exclude those posts entirely — until each post is individually re-saved to trigger ACF\'s own row creation. At scale, that\'s not practical.',
        'ACF DB Sync reads field groups and their field definitions directly from ACF, then inserts the missing postmeta rows in bulk for every affected post type. The operation is idempotent: rows that already exist are skipped, so re-running after a partial sync is safe.',
        'A dedicated admin settings page controls which post types and field groups to sync and shows progress output during the run. The standard recommendation is a database backup first, which the plugin\'s UI prompts for.',
      ],
      tags: ['PHP', 'WordPress', 'ACF', 'MySQL'],
      category: 'WordPress',
      github: 'https://github.com/Isolaee/wp-db-sync',
      demo: null,
    },
    {
      id: 30,
      title: 'Yhteydenotot',
      description: 'WordPress plugin that adds a custom "Contact Submissions" tab to the WooCommerce My Account page, surfacing Flamingo form submissions so customers have a personal inbox for their enquiries.',
      longDescription: [
        'When customers submit a contact form, the message disappears into the admin\'s inbox with no customer-side record of it. For marketplaces and B2B sites where follow-up is expected, that creates friction — customers have no way to review what they sent or when.',
        'Yhteydenotot registers a custom endpoint on the WooCommerce My Account page and renders the customer\'s Flamingo contact submissions there via a shortcode, giving them a dedicated "Contact Submissions" tab in their account.',
        'The plugin provides a template override point so themes can customise the display without modifying plugin files, and the endpoint URL is registered through WordPress rewrite rules for clean, persistent links.',
      ],
      tags: ['PHP', 'WordPress', 'WooCommerce', 'Flamingo'],
      category: 'WordPress',
      github: 'https://github.com/Isolaee/yhteydenotot',
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
  const posts = [
    {
      id: 1,
      slug: 'role-of-junior-dev-in-the-world-of-ai',
      title: 'Role of Junior Dev in the World of AI',
      excerpt:
        'AI tools have quietly replaced what junior developers used to do — and the industry hasn\'t fully reckoned with it yet. Markets that once hired new graduates without hesitation are now hesitating. But the question isn\'t just whether companies still need juniors today; it\'s about what happens if every company assumes someone else will grow the next generation of talent.\n\nThree scenarios shape how this plays out. In the first, AI capability plateaus and becomes a standard productivity tool. Developers become more effective, workloads grow, and the pipeline still matters: today\'s juniors are tomorrow\'s mediors and the seniors of the decade after. If no one hires juniors, that pipeline runs dry — quietly, then all at once.\n\nIn the second scenario, AI keeps improving until anyone with the right tools can build production-grade software without technical depth. At that point, the role of a software developer transforms fundamentally, and the question of juniors becomes moot because the entire profession has shifted.\n\nThe third scenario is AGI — and it applies pressure far beyond software. Law, creative work, consulting, engineering, security: every knowledge profession faces the same question. I hope we never get there, because I don\'t think society has a plan for what comes next.\n\nFor now, the honest answer is this: the skill floor has risen, expectations have shifted, and the easy on-ramp is gone. But as long as companies need senior engineers, they will eventually need to have grown them from somewhere. The role of a junior has always been to learn and specialize. That hasn\'t changed — only the urgency of doing it well.',
      date: '2026-04-18',
      readTime: '3 min',
      tags: ['AI', 'Career', 'Industry'],
    },
  ];
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
