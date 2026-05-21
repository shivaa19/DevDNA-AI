"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Terminal, Award, Bell, Search, ExternalLink, Flame, 
  CheckCircle2, Compass, BarChart2, Cpu, RefreshCw, 
  ChevronRight, Filter, Sparkles, BookOpen, Target,
  Database, Activity, GitPullRequest, LogOut, GitBranch, Star, GitFork, Users, Layout
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFeatureAccess } from '../../hooks/useFeatureAccess';
import { LoginRequiredGate, PremiumFeatureGate } from '../../components/AccessGates';

interface GitHubStats {
  username: string;
  realName: string;
  avatar: string;
  bio: string;
  company: string;
  location: string;
  followers: number;
  following: number;
  publicRepos: number;
  repoStats: {
    totalStars: number;
    totalForks: number;
    languages: Array<{ name: string; percentage: number; color: string }>;
  };
  repositories: Array<{
    name: string;
    description: string;
    language: string;
    languageColor: string;
    stars: number;
    forks: number;
    url: string;
    updatedAt: string;
  }>;
  calendar: {
    streak: number;
    totalContributions: number;
    totalActiveDays: number;
    submissionCalendar: string;
  };
  isFallback?: boolean;
}

// Helper to format date
const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
};

// Falls back to seeded mock statistics generator
const getFallbackStats = (username: string): GitHubStats => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  
  const reposCount = (hash % 20) + 15;
  const followers = (hash % 150) + 40;
  const following = (hash % 80) + 30;
  const totalStars = (hash % 300) + 50;
  const totalForks = (hash % 100) + 15;

  const mockRepos = [
    {
      name: `${username}-portfolio`,
      description: 'Personal portfolio website showcasing software engineering projects, experience, and DevDNA metrics.',
      language: 'TypeScript',
      languageColor: '#3178c6',
      stars: Math.round(totalStars * 0.15),
      forks: Math.round(totalForks * 0.1),
      url: `https://github.com/${username}/${username}-portfolio`,
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      name: 'neural-analyzer',
      description: 'A lightweight machine learning module that analyzes text patterns using transformers and tokenizers.',
      language: 'Python',
      languageColor: '#3776ab',
      stars: Math.round(totalStars * 0.4),
      forks: Math.round(totalForks * 0.45),
      url: `https://github.com/${username}/neural-analyzer`,
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      name: 'nextjs-dashboard-template',
      description: 'Premium administration and analytical dashboard UI template engineered with React, Next.js, and vanilla CSS.',
      language: 'TypeScript',
      languageColor: '#3178c6',
      stars: Math.round(totalStars * 0.25),
      forks: Math.round(totalForks * 0.25),
      url: `https://github.com/${username}/nextjs-dashboard-template`,
      updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      name: 'async-task-runner',
      description: 'A high-performance concurrent job queue scheduler designed for heavy event-driven workloads.',
      language: 'Rust',
      languageColor: '#dea584',
      stars: Math.round(totalStars * 0.12),
      forks: Math.round(totalForks * 0.15),
      url: `https://github.com/${username}/async-task-runner`,
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      name: 'chrome-focus-extension',
      description: 'Minimalist developer productivity web extension to isolate workspace distraction and log keystrokes.',
      language: 'JavaScript',
      languageColor: '#f7df1e',
      stars: Math.round(totalStars * 0.08),
      forks: Math.round(totalForks * 0.05),
      url: `https://github.com/${username}/chrome-focus-extension`,
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const submissionCalendar: Record<string, number> = {};
  const nowSec = Math.floor(Date.now() / 1000);
  const daySec = 24 * 60 * 60;
  for (let i = 0; i < 365; i++) {
    const seed = Math.sin(hash + i) * 0.5 + 0.5;
    if (seed > 0.45) {
      const ts = nowSec - i * daySec - Math.floor(seed * 12 * 60 * 60);
      submissionCalendar[ts.toString()] = Math.floor(1 + seed * 6);
    }
  }

  return {
    username,
    realName: username.charAt(0).toUpperCase() + username.slice(1).replace(/[_-]/g, ' '),
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&h=256&q=80',
    bio: 'Full Stack Engineer | Open Source Contributor | Architectural Synthesizer',
    company: 'Independent Developer',
    location: 'Remote Node',
    followers,
    following,
    publicRepos: reposCount,
    repoStats: {
      totalStars,
      totalForks,
      languages: [
        { name: 'TypeScript', percentage: 45, color: '#3178c6' },
        { name: 'Python', percentage: 25, color: '#3776ab' },
        { name: 'JavaScript', percentage: 15, color: '#f7df1e' },
        { name: 'Rust', percentage: 10, color: '#dea584' },
        { name: 'HTML/CSS', percentage: 5, color: '#e34c26' }
      ]
    },
    repositories: mockRepos,
    calendar: {
      streak: (hash % 15) + 5,
      totalContributions: (hash % 400) + 150,
      totalActiveDays: (hash % 50) + 40,
      submissionCalendar: JSON.stringify(submissionCalendar)
    },
    isFallback: true
  };
};

const parseRealCalendarHeatmap = (submissionCalendarStr: string, username: string) => {
  if (!submissionCalendarStr || submissionCalendarStr === '{}') {
    const data = [];
    let seed = 0;
    for (let i = 0; i < username.length; i++) {
      seed += username.charCodeAt(i);
    }
    for (let i = 0; i < 365; i++) {
      const dayOfWeek = i % 7;
      let level = 0;
      const rand = Math.sin(seed + i) * 0.5 + 0.5;
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        level = rand > 0.88 ? 1 : 0;
      } else {
        if (rand > 0.84) level = 3;
        else if (rand > 0.6) level = 2;
        else if (rand > 0.3) level = 1;
      }
      data.push(level);
    }
    return data;
  }

  let calendarObj: Record<string, number> = {};
  try {
    calendarObj = JSON.parse(submissionCalendarStr);
  } catch (e) {
    console.error(e);
  }

  const data = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    
    const dayStart = new Date(d);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(d);
    dayEnd.setHours(23, 59, 59, 999);
    
    const startSec = Math.floor(dayStart.getTime() / 1000);
    const endSec = Math.floor(dayEnd.getTime() / 1000);
    
    let count = 0;
    for (const tsStr in calendarObj) {
      const ts = parseInt(tsStr, 10);
      if (ts >= startSec && ts <= endSec) {
        count += calendarObj[tsStr];
      }
    }
    
    let level = 0;
    if (count > 0) {
      if (count <= 2) level = 1;
      else if (count <= 5) level = 2;
      else level = 3;
    }
    data.push(level);
  }
  return data;
};

const getMonthlyActivity = (submissionCalendarStr: string) => {
  let calendarObj: Record<string, number> = {};
  try {
    calendarObj = JSON.parse(submissionCalendarStr || '{}');
  } catch (e) {}

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const counts = Array(12).fill(0);
  const today = new Date();
  
  let hasData = false;
  for (const tsStr in calendarObj) {
    const count = calendarObj[tsStr];
    const date = new Date(parseInt(tsStr, 10) * 1000);
    if (today.getTime() - date.getTime() < 365 * 24 * 60 * 60 * 1000) {
      const monthIdx = date.getMonth();
      counts[monthIdx] += count;
      hasData = true;
    }
  }

  if (!hasData) {
    counts[0] = 12;
    counts[1] = 18;
    counts[2] = 14;
    counts[3] = 22;
    counts[4] = 35;
    counts[5] = 42;
    counts[6] = 24;
    counts[7] = 28;
    counts[8] = 19;
    counts[9] = 31;
  }

  const result = [];
  const currentMonth = today.getMonth();
  for (let i = 9; i >= 0; i--) {
    const idx = (currentMonth - i + 12) % 12;
    result.push({
      month: months[idx],
      count: counts[idx]
    });
  }
  return result;
};

const ingestionSteps = [
  { id: 1, label: 'Establishing connection to GitHub API gateway...' },
  { id: 2, label: 'Retrieving public repository catalog...' },
  { id: 3, label: 'Parsing commit history and code volumes...' },
  { id: 4, label: 'Synthesizing developer language DNA...' },
  { id: 5, label: 'Generating DevDNA repository map profile...' }
];

interface ProjectBlueprint {
  title: string;
  level: 'Intermediate' | 'Advanced' | 'Expert';
  tags: string[];
  description: string;
  lift: string;
  whyThis: string;
  architecture: string[];
  fileStructure: string[];
  dbSchema?: string;
}

const BLUEPRINT_LIBRARY: Record<string, ProjectBlueprint[]> = {
  TypeScript: [
    {
      title: "Real-Time Collaborative Document Canvas",
      level: "Advanced",
      tags: ["TypeScript", "WebSockets", "CRDTs (Y.js)", "Node.js"],
      description: "Build an online cooperative design board where multiple users draw and edit concurrently with conflict-free replicated data types.",
      lift: "+16.8% WebSockets & Collaborative States",
      whyThis: "Expands your knowledge of real-time server synchronizations and low-latency client state management using CRDTs.",
      architecture: [
        "Client: React/TypeScript rendering vector pathways using HTML5 Canvas or SVG.",
        "Collaboration Engine: Y.js binding to local canvas edits.",
        "Network Layer: WebSockets connecting users to a central Node.js room coordinator.",
        "Persistence: Redis pub/sub queue backing up canvas coordinates to PostgreSQL."
      ],
      fileStructure: [
        "├── src/",
        "│   ├── client/",
        "│   │   ├── components/Canvas.tsx",
        "│   │   └── hooks/useCollaboration.ts",
        "│   └── server/",
        "│       ├── roomCoordinator.ts",
        "│       └── socketHandler.ts"
      ],
      dbSchema: "CREATE TABLE rooms (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  name VARCHAR(255) NOT NULL,\n  state BYTEA, -- serialized Y.js document\n  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n);"
    },
    {
      title: "Custom Type-Safe RPC Framework",
      level: "Expert",
      tags: ["TypeScript", "AST Parsing", "Node.js", "Type Inference"],
      description: "Create an RPC interface mimicking tRPC that generates runtime validation schemas from compile-time TypeScript type signatures.",
      lift: "+22.4% TypeScript AST & Metaprogramming",
      whyThis: "Deep dives into TypeScript compiler APIs, generic inferences, and automatic API client bindings.",
      architecture: [
        "Type Extractor: Uses the TypeScript Compiler API (AST) to generate runtime JSON validation structures.",
        "Routing Engine: A lightweight HTTP request dispatcher matching procedure calls.",
        "Client Generator: Generates typed hooks for immediate utilization in client codebases."
      ],
      fileStructure: [
        "├── packages/",
        "│   ├── core/      # AST extractor & server dispatcher",
        "│   └── client/    # Generates type-safe React Query hooks"
      ],
      dbSchema: "No database required. Relies on HTTP requests and JSON serialization."
    }
  ],
  Python: [
    {
      title: "Vector Embeddings Semantic Document Search",
      level: "Advanced",
      tags: ["Python", "FastAPI", "FAISS", "SentenceTransformers"],
      description: "Develop a semantic search engine matching user resume vectors against enterprise profiles utilizing flat L2 indices.",
      lift: "+18.2% Python AI & Vector Math",
      whyThis: "Introduces real-world AI similarity calculations and data structure optimizations for semantic parsing.",
      architecture: [
        "FastAPI Server: Exposes high-speed inference endpoints.",
        "Model Processor: Employs all-MiniLM-L6-v2 to compute 384-dimensional document embeddings.",
        "Indexing Layer: FAISS flat index stores vectors and performs L2 nearest-neighbor search."
      ],
      fileStructure: [
        "├── app/",
        "│   ├── api/routes.py",
        "│   ├── core/embeddings.py",
        "│   └── main.py",
        "└── requirements.txt"
      ],
      dbSchema: "CREATE TABLE document_embeddings (\n  id SERIAL PRIMARY KEY,\n  document_hash VARCHAR(64) UNIQUE,\n  content TEXT,\n  embedding_vector REAL[] -- mapped to FAISS Index ID\n);"
    },
    {
      title: "High-Throughput Asynchronous Scraper",
      level: "Intermediate",
      tags: ["Python", "Asyncio", "Playwright", "Redis"],
      description: "An event-driven scraping pipeline utilizing headless browsers to bypass dynamic rendering locks.",
      lift: "+12.5% Async Core Concurrency",
      whyThis: "Builds rigorous mastery over Python async event loops, connection pools, and queue backpressure.",
      architecture: [
        "Queue Broker: Redis lists act as the URL crawl queue.",
        "Scraper Workers: Async workers consuming URLs and launching Playwright browser contexts.",
        "Data pipeline: Cleans and serializes dynamic DOM outputs to disk."
      ],
      fileStructure: [
        "├── scraper/",
        "│   ├── worker.py",
        "│   ├── scheduler.py",
        "│   └── parser.py"
      ],
      dbSchema: "CREATE TABLE crawled_data (\n  url_hash VARCHAR(64) PRIMARY KEY,\n  url TEXT NOT NULL,\n  raw_html TEXT,\n  extracted_meta JSONB,\n  crawled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()\n);"
    }
  ],
  Rust: [
    {
      title: "LSM-Tree Key-Value Storage Engine",
      level: "Expert",
      tags: ["Rust", "Systems Programming", "Disk I/O", "Concurrency"],
      description: "Implement a persistent Key-Value storage engine featuring Write-Ahead Logs (WAL), MemTables, and SSTables.",
      lift: "+25.6% Systems Architecture & Rust Safety",
      whyThis: "Deeply exercises Rust memory layouts, thread synchronizations, and low-level disk formatting concepts.",
      architecture: [
        "MemTable: SkipList or Red-Black tree in memory for write buffering.",
        "WAL: Append-only disk log to restore MemTable on crashes.",
        "SSTable: Sorted, immutable byte blocks on disk with index files and Bloom filters.",
        "Compactor: Background threads executing size-tiered compaction algorithms."
      ],
      fileStructure: [
        "├── src/",
        "│   ├── db.rs",
        "│   ├── memtable.rs",
        "│   ├── sstable.rs",
        "│   ├── wal.rs",
        "│   └── bloom.rs"
      ]
    }
  ],
  JavaScript: [
    {
      title: "Reactivity Signals Engine & Virtual DOM",
      level: "Intermediate",
      tags: ["JavaScript", "DOM Parsing", "Reactivity", "Algorithms"],
      description: "Write a lightweight declarative UI framework utilizing reactive getter/setter triggers and a simple Virtual DOM diff scheduler.",
      lift: "+14.0% JavaScript V8 Engine Optimization",
      whyThis: "Demystifies modern frontend frameworks by building reactivity triggers from scratch using Proxies.",
      architecture: [
        "Reactive Signal Engine: Uses proxy interception to track component dependencies.",
        "Virtual DOM: Renders custom component trees into lightweight JS objects.",
        "Reconciliation Algorithm: Simple Tree Diffing updating raw elements only when values mutate."
      ],
      fileStructure: [
        "├── reactive-framework/",
        "│   ├── core/reactivity.js",
        "│   ├── core/vdom.js",
        "│   └── index.js"
      ]
    }
  ],
  Go: [
    {
      title: "P2P BitTorrent Client & File Parser",
      level: "Expert",
      tags: ["Go", "Networking", "BitTorrent Protocol", "Concurrency"],
      description: "Build a peer-to-peer file downloader that parses .torrent files, connects to trackers, and downloads pieces concurrently.",
      lift: "+21.2% Go Network Programming & Concurrency",
      whyThis: "Teaches binary protocol parsing, TCP connection multiplexing, and worker synchronization using channels.",
      architecture: [
        "Torrent Parser: Bencode decoder to extract trackers, files, and piece SHA-1 hashes.",
        "Tracker Client: Connects to UDP/HTTP trackers to receive peer lists.",
        "Peer Connection: Initiates TCP handshakes, keeps track of client and peer choking/interested states.",
        "Download Scheduler: Spawns concurrent workers requesting 16KB blocks in parallel."
      ],
      fileStructure: [
        "├── main.go",
        "├── bencode/parser.go",
        "├── tracker/client.go",
        "├── peer/connection.go",
        "└── torrent/scheduler.go"
      ]
    }
  ],
  Java: [
    {
      title: "Distributed Logging & Replication Engine",
      level: "Advanced",
      tags: ["Java", "Distributed Systems", "gRPC", "Concurrency"],
      description: "Create a Java-based replication storage hub executing the Raft Consensus Protocol to safely preserve logs across servers.",
      lift: "+23.5% Java Distributed Consensus & Threads",
      whyThis: "Master concurrency controls, synchronized networking buffers, and partition recovery dynamics.",
      architecture: [
        "State Machine: In-memory hash-map mapping key-value logs.",
        "Raft Node: Thread-loop execution representing Follower, Candidate, and Leader states.",
        "Replicator: Pushes logs via gRPC channels and monitors heartbeat thresholds."
      ],
      fileStructure: [
        "├── src/main/java/com/devdna/",
        "│   ├── RaftNode.java",
        "│   ├── ConsensusEngine.java",
        "│   └── NetworkTransport.java"
      ]
    }
  ],
  "C++": [
    {
      title: "Custom High-Speed Garbage Collector",
      level: "Expert",
      tags: ["C++", "Memory Management", "Pointers", "Low-Level"],
      description: "Write a drop-in C++ Mark-and-Sweep garbage collector replacing malloc/free with block allocators.",
      lift: "+28.4% C++ Raw Pointers & Memory Page Allocation",
      whyThis: "Requires solid knowledge of raw pointer offsets, virtual pages, and CPU register traversal.",
      architecture: [
        "Memory Arena: Pre-allocates raw memory pages to custom class limits.",
        "Mark Phase: Traverses stack roots to identify active pointer structures.",
        "Sweep Phase: Free pages of dead allocations, coalescing contiguous blocks."
      ],
      fileStructure: [
        "├── include/gc.h",
        "├── src/arena.cpp",
        "├── src/collector.cpp",
        "└── test/benchmark.cpp"
      ]
    }
  ]
};

const DEFAULT_BLUEPRINTS: ProjectBlueprint[] = [
  {
    title: "Serverless Analytics API Pipeline",
    level: "Intermediate",
    tags: ["REST API", "Microservices", "Docker", "Database Tuning"],
    description: "Architect a clean event-driven statistics logging pipe with rate limiting and database optimizations.",
    lift: "+11.8% Microservices Architecture",
    whyThis: "Familiarizes you with modern microservices design patterns, load balancers, and cache caching layers.",
    architecture: [
      "Gateway Router: Directs traffic to underlying Node.js or Python handlers.",
      "Rate Limiter: Uses token-bucket algorithms mapped inside memory caches.",
      "Database Store: Normalizes logs with weekly archiving tables."
    ],
    fileStructure: [
      "├── api-gateway/",
      "├── ingestion-worker/",
      "├── docker-compose.yml",
      "└── README.md"
    ]
  }
];

const getUpskillingProjects = (languages: Array<{ name: string; percentage: number }>) => {
  const sortedLangs = [...languages].sort((a, b) => b.percentage - a.percentage);
  const suggested: ProjectBlueprint[] = [];
  
  for (const lang of sortedLangs) {
    const projectsForLang = BLUEPRINT_LIBRARY[lang.name];
    if (projectsForLang) {
      for (const p of projectsForLang) {
        if (!suggested.find(s => s.title === p.title)) {
          suggested.push(p);
        }
      }
    }
  }
  
  let defaultIdx = 0;
  while (suggested.length < 3) {
    if (defaultIdx < DEFAULT_BLUEPRINTS.length) {
      suggested.push(DEFAULT_BLUEPRINTS[defaultIdx]);
      defaultIdx++;
    } else {
      const tsProjects = BLUEPRINT_LIBRARY["TypeScript"] || [];
      const pyProjects = BLUEPRINT_LIBRARY["Python"] || [];
      const pool = [...tsProjects, ...pyProjects];
      let added = false;
      for (const p of pool) {
        if (!suggested.find(s => s.title === p.title)) {
          suggested.push(p);
          added = true;
          break;
        }
      }
      if (!added) break;
    }
  }
  
  return suggested.slice(0, 3);
};

export default function GitHubDashboard() {
  const { user } = useAuth();
  const { remainingSearches, consumeSearch, isLocked } = useFeatureAccess('github');
  const [isClient, setIsClient] = useState(false);
  const [githubUser, setGithubUser] = useState('');
  const [inputUser, setInputUser] = useState('');
  const [githubStats, setGithubStats] = useState<GitHubStats | null>(null);
  
  // Ingest states
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestionStep, setIngestionStep] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [repos, setRepos] = useState<any[]>([]);
  const [dailyGoalVal, setDailyGoalVal] = useState(2);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedBlueprint, setSelectedBlueprint] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    
    let savedUser = null;
    let savedStats = null;
    
    if (user) {
      const savedProfileStr = localStorage.getItem(`devdna_profile_${user.email}`);
      if (savedProfileStr) {
        try {
          const profile = JSON.parse(savedProfileStr);
          savedUser = profile.github_username || (profile.formData && profile.formData.github);
          savedStats = profile.github_stats;
        } catch (e) {
          console.error("Failed to parse saved user profile", e);
        }
      }
    }
    
    if (!savedUser) {
      savedUser = localStorage.getItem('devdna_github_user');
    }
    if (!savedStats) {
      savedStats = localStorage.getItem('devdna_github_stats');
    }

    if (savedUser) {
      setGithubUser(savedUser);
      setInputUser(savedUser);
    }
    if (savedStats) {
      try {
        const parsed = typeof savedStats === 'string' ? JSON.parse(savedStats) : savedStats;
        setGithubStats(parsed);
      } catch (e) {
        console.error("Failed to parse saved GitHub stats", e);
      }
    }
  }, [user]);

  // Automatic background synchronization for real statistics
  useEffect(() => {
    if (!isClient || !githubUser) return;

    const needsFetch = !githubStats || githubStats.isFallback;

    if (needsFetch && !isRefreshing) {
      const fetchRealStats = async () => {
        setIsRefreshing(true);
        try {
          const res = await fetch(`/api/github?username=${encodeURIComponent(githubUser)}`);
          if (res.ok) {
            const data = await res.json();
            setGithubStats(data);
            localStorage.setItem('devdna_github_stats', JSON.stringify(data));
            if (user) {
              const existingProfileStr = localStorage.getItem(`devdna_profile_${user.email}`);
              let profile = existingProfileStr ? JSON.parse(existingProfileStr) : {};
              profile.github_username = githubUser;
              profile.github_stats = data;
              localStorage.setItem(`devdna_profile_${user.email}`, JSON.stringify(profile));
            }
          }
        } catch (e) {
          console.error("Auto-fetch GitHub stats failed", e);
        } finally {
          setIsRefreshing(false);
        }
      };
      fetchRealStats();
    }
  }, [isClient, githubUser, githubStats, user, isRefreshing]);

  // Map repos to table display
  useEffect(() => {
    if (!isClient) return;

    if (githubStats && githubStats.repositories && githubStats.repositories.length > 0) {
      const mapped = githubStats.repositories.map((repo, idx) => ({
        id: idx + 1,
        name: repo.name,
        description: repo.description,
        language: repo.language,
        languageColor: repo.languageColor,
        stars: repo.stars,
        forks: repo.forks,
        external: repo.url,
        updatedAt: repo.updatedAt
      }));
      setRepos(mapped);
    } else {
      const fallback = getFallbackStats(githubUser || 'satoshin');
      const mapped = fallback.repositories.map((repo, idx) => ({
        id: idx + 1,
        name: repo.name,
        description: repo.description,
        language: repo.language,
        languageColor: repo.languageColor,
        stars: repo.stars,
        forks: repo.forks,
        external: repo.url,
        updatedAt: repo.updatedAt
      }));
      setRepos(mapped);
    }
  }, [githubStats, githubUser, isClient]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    const sourceList = githubStats && githubStats.repositories && githubStats.repositories.length > 0 
      ? githubStats.repositories.map((repo, idx) => ({
          id: idx + 1,
          name: repo.name,
          description: repo.description,
          language: repo.language,
          languageColor: repo.languageColor,
          stars: repo.stars,
          forks: repo.forks,
          external: repo.url,
          updatedAt: repo.updatedAt
        }))
      : getFallbackStats('satoshin').repositories.map((repo, idx) => ({
          id: idx + 1,
          name: repo.name,
          description: repo.description,
          language: repo.language,
          languageColor: repo.languageColor,
          stars: repo.stars,
          forks: repo.forks,
          external: repo.url,
          updatedAt: repo.updatedAt
        }));

    if (term.trim() === '') {
      setRepos(sourceList);
    } else {
      const filtered = sourceList.filter(r => 
        r.name.toLowerCase().includes(term.toLowerCase()) || 
        r.language.toLowerCase().includes(term.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(term.toLowerCase()))
      );
      setRepos(filtered);
    }
  };

  const handleRefresh = async () => {
    if (!githubUser) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/github?username=${encodeURIComponent(githubUser)}`);
      if (res.ok) {
        const data = await res.json();
        setGithubStats(data);
        localStorage.setItem('devdna_github_stats', JSON.stringify(data));
      }
    } catch (e) {
      console.error("Failed to refresh github profile stats", e);
    } finally {
      setIsRefreshing(false);
      if (dailyGoalVal < 5) {
        setDailyGoalVal(prev => prev + 1);
      }
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUser.trim()) return;

    if (isLocked) return;
    if (!consumeSearch()) return;

    setIsIngesting(true);
    setIngestionStep(0);

    const stepInterval = setInterval(() => {
      setIngestionStep(prev => {
        if (prev < ingestionSteps.length - 2) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    try {
      const res = await fetch(`/api/github?username=${encodeURIComponent(inputUser.trim())}`);
      
      clearInterval(stepInterval);
      setIngestionStep(4);

      if (res.ok) {
        const data = await res.json();
        setTimeout(() => {
          localStorage.setItem('devdna_github_user', inputUser.trim());
          localStorage.setItem('devdna_github_stats', JSON.stringify(data));
          
          if (user) {
            const existingProfileStr = localStorage.getItem(`devdna_profile_${user.email}`);
            let profile = existingProfileStr ? JSON.parse(existingProfileStr) : {};
            profile.github_username = inputUser.trim();
            profile.github_stats = data;
            localStorage.setItem(`devdna_profile_${user.email}`, JSON.stringify(profile));
          }

          setGithubUser(inputUser.trim());
          setGithubStats(data);
          setIsIngesting(false);
        }, 600);
      } else {
        const fallback = getFallbackStats(inputUser.trim());
        setTimeout(() => {
          localStorage.setItem('devdna_github_user', inputUser.trim());
          localStorage.setItem('devdna_github_stats', JSON.stringify(fallback));
          
          if (user) {
            const existingProfileStr = localStorage.getItem(`devdna_profile_${user.email}`);
            let profile = existingProfileStr ? JSON.parse(existingProfileStr) : {};
            profile.github_username = inputUser.trim();
            profile.github_stats = fallback;
            localStorage.setItem(`devdna_profile_${user.email}`, JSON.stringify(profile));
          }

          setGithubUser(inputUser.trim());
          setGithubStats(fallback);
          setIsIngesting(false);
        }, 600);
      }
    } catch (err) {
      clearInterval(stepInterval);
      const fallback = getFallbackStats(inputUser.trim());
      setTimeout(() => {
        localStorage.setItem('devdna_github_user', inputUser.trim());
        localStorage.setItem('devdna_github_stats', JSON.stringify(fallback));
        
        if (user) {
          const existingProfileStr = localStorage.getItem(`devdna_profile_${user.email}`);
          let profile = existingProfileStr ? JSON.parse(existingProfileStr) : {};
          profile.github_username = inputUser.trim();
          profile.github_stats = fallback;
          localStorage.setItem(`devdna_profile_${user.email}`, JSON.stringify(profile));
        }

        setGithubUser(inputUser.trim());
        setGithubStats(fallback);
        setIsIngesting(false);
      }, 600);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('devdna_github_user');
    localStorage.removeItem('devdna_github_stats');
    
    if (user) {
      const existingProfileStr = localStorage.getItem(`devdna_profile_${user.email}`);
      if (existingProfileStr) {
        try {
          let profile = JSON.parse(existingProfileStr);
          delete profile.github_username;
          delete profile.github_stats;
          localStorage.setItem(`devdna_profile_${user.email}`, JSON.stringify(profile));
        } catch (e) {}
      }
    }

    setGithubUser('');
    setGithubStats(null);
    setInputUser('');
  };

  if (!isClient) return null;

  // Resolve values
  const fallback = getFallbackStats(githubUser || 'satoshin');
  const userDetails = githubStats || fallback;
  
  const starsCount = userDetails.repoStats.totalStars;
  const forksCount = userDetails.repoStats.totalForks;
  const followersCount = userDetails.followers;
  const reposCount = userDetails.publicRepos;
  const userStreak = userDetails.calendar.streak;
  
  // Resolve recommended projects based on languages DNA
  const recommendedProjects = getUpskillingProjects(userDetails.repoStats.languages);

  // Calculate readiness score
  const readinessVal = Math.min(99, Math.max(50, Math.round(((starsCount * 1.5 + forksCount * 2.0 + followersCount * 0.5) / 100) * 10) + 60));

  // Calendar
  const calendarString = userDetails.calendar.submissionCalendar || '{}';
  const monthlyActivityData = getMonthlyActivity(calendarString);
  const maxMonthlyCount = Math.max(1, ...monthlyActivityData.map(d => d.count));
  const dynamicHeatmapData = parseRealCalendarHeatmap(calendarString, githubUser || 'satoshin');

  // If no user connected
  if (!user) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f6f5f0',
        padding: '2rem',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <LoginRequiredGate featureName="GitHub" />
      </div>
    );
  }

  if (!githubUser) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f6f5f0',
        backgroundImage: 'url("/github_background.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        color: '#2d3732',
        fontFamily: 'var(--font-inter), sans-serif',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Floating Orbs */}
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(63,112,85,0.06) 0%, rgba(255,255,255,0) 70%)',
          top: '-100px',
          left: '-100px',
          pointerEvents: 'none'
        }}></div>
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(46,117,89,0.05) 0%, rgba(255,255,255,0) 70%)',
          bottom: '-150px',
          right: '-100px',
          pointerEvents: 'none'
        }}></div>

        <div className="login-container" style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(24px)',
          padding: '3rem',
          borderRadius: '24px',
          border: '1px solid #e5e3dc',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.04)',
          width: '100%',
          maxWidth: '540px',
          textAlign: 'center',
          zIndex: 10,
          boxSizing: 'border-box'
        }}>
          {isLocked ? (
            <PremiumFeatureGate featureName="GitHub" />
          ) : !isIngesting ? (
            <form onSubmit={handleConnect} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Image src="/github_logo.png" alt="GitHub Logo" width={150} height={42} style={{ objectFit: 'contain' }} />
              </div>

              <div>
                <h2 className="serif" style={{ fontSize: '1.75rem', fontWeight: 500, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>
                  Ingest GitHub Ecosystem
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                  Sync your public repositories to map commits, language distribution, and developer trajectory dna.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  GITHUB USERNAME OR PROFILE URL
                </label>
                <input 
                  type="text" 
                  value={inputUser}
                  onChange={(e) => setInputUser(e.target.value)}
                  placeholder="e.g. https://github.com/satoshin" 
                  required
                  style={{
                    padding: '0.9rem 1.1rem',
                    border: '1px solid #e5e3dc',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    width: '100%',
                    boxSizing: 'border-box',
                    transition: 'all 0.3s'
                  }}
                  className="top-search"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ 
                    justifyContent: 'center', 
                    padding: '0.9rem', 
                    borderRadius: '12px', 
                    fontSize: '1rem', 
                    fontWeight: 600,
                    backgroundColor: 'var(--accent-green)',
                    borderColor: 'var(--accent-green)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  <span>Extract Repository DNA</span>
                  <ChevronRight size={18} />
                </button>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {remainingSearches} / 10 free searches remaining
                </span>
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
                  &larr; Back to Platform Homepage
                </Link>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem 0' }}>
              {/* Spinner */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  position: 'relative',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    border: '4px solid rgba(63,112,85,0.1)',
                    borderTop: '4px solid var(--accent-green)',
                    borderRadius: '50%'
                  }} className="spin-anim"></div>
                  <Database size={28} style={{ color: 'var(--accent-green)' }} />
                </div>
              </div>

              <div>
                <h3 className="serif" style={{ fontSize: '1.25rem', fontWeight: 500, margin: '0 0 0.5rem 0' }}>
                  Ingesting Repository DNA...
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <Activity size={14} className="spin-anim" />
                  <span>Connecting to GitHub REST API...</span>
                </div>
              </div>

              {/* Progress Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left', background: '#faf9f5', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e5e3dc' }}>
                {ingestionSteps.map((step, idx) => {
                  const isDone = idx < ingestionStep;
                  const isActive = idx === ingestionStep;
                  return (
                    <div key={step.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      fontSize: '0.8rem',
                      color: isDone ? 'var(--accent-green)' : isActive ? 'var(--text-main)' : 'var(--text-muted)',
                      fontWeight: isActive || isDone ? 600 : 400,
                      opacity: isDone || isActive ? 1 : 0.5,
                      transition: 'all 0.3s'
                    }}>
                      {isDone ? (
                        <CheckCircle2 size={14} style={{ color: 'var(--accent-green)' }} />
                      ) : isActive ? (
                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2.5px solid var(--accent-green)', borderTopColor: 'transparent' }} className="spin-anim" />
                      ) : (
                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #e5e3dc' }} />
                      )}
                      <span>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout" style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f6f5f0',
      color: '#2d3732',
      fontFamily: 'var(--font-inter), sans-serif'
    }}>
      
      {/* Sidebar - Desktop */}
      <aside className="dashboard-sidebar" style={{
        width: '260px',
        backgroundColor: '#faf9f5',
        borderRight: '1px solid #e5e3dc',
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem 1.5rem',
        position: 'sticky',
        top: '81px',
        height: 'calc(100vh - 81px)',
        boxSizing: 'border-box'
      }}>
        {/* Sidebar Nav Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <Link href="/skill-dna" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.8rem 1rem',
            borderRadius: '12px',
            textDecoration: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.95rem',
            fontWeight: 500,
            transition: 'all 0.2s'
          }} className="sidebar-link">
            <Compass size={18} />
            <span>DNA Overview</span>
          </Link>
          
          <Link href="/skill-matrix" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.8rem 1rem',
            borderRadius: '12px',
            textDecoration: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.95rem',
            fontWeight: 500,
            transition: 'all 0.2s'
          }} className="sidebar-link">
            <Award size={18} />
            <span>Skill Matrix</span>
          </Link>

          <Link href="/linkedin" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.8rem 1rem',
            borderRadius: '12px',
            textDecoration: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.95rem',
            fontWeight: 500,
            transition: 'all 0.2s'
          }} className="sidebar-link">
            <Layout size={18} />
            <span>LinkedIn Intel</span>
          </Link>

          <Link href="/github" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.8rem 1rem',
            borderRadius: '12px',
            textDecoration: 'none',
            color: '#ffffff',
            backgroundColor: 'var(--accent-green)',
            fontSize: '0.95rem',
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(46, 117, 89, 0.15)'
          }}>
            <Users size={18} />
            <span>Repository Map</span>
          </Link>
          
          <Link href="/skill-matrix" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.8rem 1rem',
            borderRadius: '12px',
            textDecoration: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.95rem',
            fontWeight: 500,
            transition: 'all 0.2s'
          }} className="sidebar-link">
            <BarChart2 size={18} />
            <span>Career Path</span>
          </Link>
          
          <Link href="/analyze" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.8rem 1rem',
            borderRadius: '12px',
            textDecoration: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.95rem',
            fontWeight: 500,
            transition: 'all 0.2s'
          }} className="sidebar-link">
            <Cpu size={18} />
            <span>Resources</span>
          </Link>
        </nav>

        {/* Pro Feature card at bottom of sidebar */}
        <div style={{
          background: '#e2efea',
          borderRadius: '16px',
          padding: '1.25rem',
          border: '1px solid #d1e6db',
          marginBottom: '1rem',
          textAlign: 'left'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-green)', letterSpacing: '0.05em' }}>PRO FEATURE</span>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', margin: '0.25rem 0 1rem 0', lineHeight: 1.4 }}>
            Unlock advanced DNA competitive mapping.
          </p>
          <button style={{
            width: '100%',
            backgroundColor: 'var(--accent-green)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.6rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}>
            Upgrade to Pro
          </button>
        </div>

        {/* Disconnect Option */}
        <button 
          onClick={handleDisconnect}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            padding: '0.8rem 1rem',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#ef4444',
            fontSize: '0.9rem',
            fontWeight: 500,
            cursor: 'pointer',
            textAlign: 'left',
            marginBottom: '1rem',
            transition: 'all 0.2s'
          }}
          className="sidebar-link"
        >
          <LogOut size={16} />
          <span>Disconnect GitHub</span>
        </button>

        {/* Daily Goal Box */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '1.25rem',
          border: '1px solid #e5e3dc',
          boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Daily Goal</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-green)' }}>{dailyGoalVal}/5</span>
          </div>
          
          {/* Progress bar */}
          <div style={{ width: '100%', height: '8px', backgroundColor: '#efeadd', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
            <div style={{ width: `${(dailyGoalVal / 5) * 100}%`, height: '100%', backgroundColor: 'var(--accent-green)', borderRadius: '4px', transition: 'width 0.4s ease' }}></div>
          </div>

          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              border: '1px solid var(--accent-green)',
              borderRadius: '8px',
              padding: '0.6rem',
              backgroundColor: 'transparent',
              color: 'var(--accent-green)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            className="refresh-btn"
          >
            <RefreshCw size={14} className={isRefreshing ? 'spin-anim' : ''} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh Analysis'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        padding: '2rem 3rem',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        overflowX: 'hidden'
      }}>
        
        {/* Top Navbar */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '1rem',
          borderBottom: '1px solid #e5e3dc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <nav style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', fontWeight: 500 }}>
              <Link href="/skill-matrix" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>DNA Overview</Link>
              <Link href="/skill-matrix" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Skill Matrix</Link>
              <Link href="/github" style={{ color: 'var(--text-main)', textDecoration: 'none', borderBottom: '2px solid var(--accent-green)', paddingBottom: '1.1rem' }}>Repository Map</Link>
              <Link href="/skill-matrix" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Trajectory</Link>
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8c9c94' }} />
              <input 
                type="text" 
                placeholder="Search repository..." 
                style={{
                  padding: '0.5rem 1rem 0.5rem 2.2rem',
                  borderRadius: '20px',
                  border: '1px solid #e5e3dc',
                  backgroundColor: '#ffffff',
                  fontSize: '0.85rem',
                  width: '200px',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                className="top-search"
              />
            </div>
            
            <button style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', position: 'relative' }}>
              <Bell size={18} />
              <span style={{ position: 'absolute', top: 0, right: 0, width: '6px', height: '6px', backgroundColor: '#ef4444', borderRadius: '50%' }}></span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <Image 
                src={userDetails.avatar} 
                alt="Profile Pic" 
                width={36} 
                height={36} 
                unoptimized
                style={{ borderRadius: '50%', border: '2px solid var(--accent-green)', objectFit: 'cover' }} 
              />
            </div>
          </div>
        </header>

        {/* Dashboard Grid - Two Columns */}
        <div className="dashboard-columns" style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          gap: '2rem'
        }}>
          
          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* User Profile Card */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '2rem',
              border: '1px solid #e5e3dc',
              position: 'relative',
              boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              {/* Badge */}
              <span style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                backgroundColor: 'var(--accent-light-green)',
                color: 'var(--accent-green)',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.35rem 0.75rem',
                borderRadius: '20px',
                border: '1px solid rgba(63, 112, 85, 0.3)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                ACTIVE INGESTION
              </span>

              {/* Avatar Photo */}
              <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <Image 
                  src={userDetails.avatar} 
                  alt="User Profile" 
                  width={90} 
                  height={90} 
                  unoptimized
                  style={{ borderRadius: '50%', border: '3px solid var(--accent-green)', objectFit: 'cover' }} 
                />
              </div>

              {/* User info */}
              <h2 className="serif" style={{ fontSize: '1.75rem', fontWeight: 500, margin: '0 0 0.25rem 0', color: 'var(--text-main)' }}>{userDetails.realName}</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0 0.5rem 0' }}>
                GitHub Synced Handle: <code style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{githubUser}</code>
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1.5rem 0', maxWidth: '80%', lineHeight: 1.4 }}>
                {userDetails.bio}
              </p>

              {/* Solved Statistics */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                width: '100%',
                backgroundColor: '#faf9f5',
                borderRadius: '16px',
                padding: '1.25rem',
                border: '1px solid #e5e3dc',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-green)', margin: 0 }}>{reposCount}</h4>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>REPOSITORIES</span>
                </div>
                <div style={{ borderLeft: '1px solid #e5e3dc', borderRight: '1px solid #e5e3dc' }}>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b', margin: 0 }}>{starsCount}</h4>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>STARS</span>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6', margin: 0 }}>{forksCount}</h4>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>FORKS</span>
                </div>
              </div>

              {/* Total Stars vs Forks metrics */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Followers</span>
                  <span style={{ color: 'var(--text-main)' }}>{followersCount} Followers</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#efeadd', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', width: '100%', height: '100%' }}>
                    <div style={{ width: `${starsCount > 0 ? (starsCount / (starsCount + forksCount)) * 100 : 50}%`, height: '100%', backgroundColor: '#f59e0b' }}></div>
                    <div style={{ width: `${forksCount > 0 ? (forksCount / (starsCount + forksCount)) * 100 : 50}%`, height: '100%', backgroundColor: '#3b82f6' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interview Readiness Card */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '2rem',
              border: '1px solid #e5e3dc',
              boxShadow: '0 4px 20px rgba(0,0,0,0.01)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '32px', height: '32px', backgroundColor: '#faf9f5', border: '1px solid #e5e3dc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b29a6f' }}>
                  <Target size={16} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>Ecosystem Target Readiness</h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.8rem', marginBottom: '1.5rem' }}>
                <span className="serif" style={{ fontSize: '3rem', fontWeight: 500, color: 'var(--accent-green)', lineHeight: 1 }}>{readinessVal}%</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Quality Index</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#10b981' }}>&uarr; {(starsCount % 5) + 2}.{(forksCount % 9)}%</span>
                </div>
              </div>

              {/* Ready Levels */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#faf9f5', borderRadius: '12px', border: '1px solid #e5e3dc' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Open Source Fit</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: readinessVal > 75 ? '#10b981' : '#f59e0b' }}>
                    {readinessVal > 85 ? 'Very High' : 'High'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#faf9f5', borderRadius: '12px', border: '1px solid #e5e3dc' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Enterprise Tier-1 Fit</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: readinessVal > 80 ? '#10b981' : '#f59e0b' }}>
                    {readinessVal > 80 ? 'High' : 'Moderate'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#faf9f5', borderRadius: '12px', border: '1px solid #e5e3dc' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Startup Velocity Index</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981' }}>
                    Very High
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Current Focus Path Card */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '2rem',
              border: '1px solid #e5e3dc',
              boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '2rem',
                right: '2rem',
                backgroundColor: 'var(--bg-color)',
                border: '1px solid rgba(46, 117, 89, 0.15)',
                borderRadius: '16px',
                padding: '0.6rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Sparkles size={14} style={{ color: 'var(--accent-green)' }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-green)', letterSpacing: '0.02em' }}>AI Optimized</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>4 Modules mapped</span>
                </div>
              </div>

              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-green)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
                CURRENT DEVELOPMENT PATH
              </span>
              
              <h3 className="serif" style={{ fontSize: '1.75rem', fontWeight: 500, color: 'var(--text-main)', margin: '0 0 0.5rem 0', maxWidth: '65%' }}>
                System Architecture
              </h3>
              
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 1.5rem 0', maxWidth: '65%' }}>
                Extend system boundaries. Progress from serverless execution routines to distributed caching layers and custom network protocols.
              </p>

              {/* Progress slider */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Path Progress</span>
                  <span style={{ color: 'var(--text-main)' }}>{Math.min(95, Math.max(30, Math.round((reposCount / 40) * 100)))}% Complete</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#efeadd', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(95, Math.max(30, Math.round((reposCount / 40) * 100)))}%`, height: '100%', backgroundColor: 'var(--accent-green)', borderRadius: '4px' }}></div>
                </div>
              </div>

              {/* Resume button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {['TS', 'PY', 'RS'].map((tag, i) => (
                    <span key={i} style={{ width: '28px', height: '28px', border: '1px solid #e5e3dc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', backgroundColor: '#faf9f5' }}>
                      {tag}
                    </span>
                  ))}
                  <span style={{ width: '28px', height: '28px', border: '1px solid #e5e3dc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#ffffff', backgroundColor: 'var(--accent-green)' }}>
                    +2
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
                    Next focus: Concurrent Queues
                  </span>
                </div>

                <Link href="/analyze" className="btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem', fontWeight: 600, borderRadius: '8px', textDecoration: 'none' }}>
                  Resume Pathway
                </Link>
              </div>
            </div>

            {/* Commit / Contribution Trajectory Card */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '2rem',
              border: '1px solid #e5e3dc',
              boxShadow: '0 4px 20px rgba(0,0,0,0.01)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '32px', height: '32px', backgroundColor: '#faf9f5', border: '1px solid #e5e3dc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b29a6f' }}>
                    <BarChart2 size={16} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                    Commit Density Trajectory
                  </h3>
                </div>
                
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Active Days: {userDetails.calendar.totalActiveDays || 64}
                </span>
              </div>

              {/* Bar Chart representing commits per month */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                height: '180px',
                paddingTop: '1rem',
                position: 'relative'
              }}>
                <div style={{ position: 'absolute', left: 0, right: 0, top: '25%', height: '1px', backgroundColor: '#f6f5f0' }}></div>
                <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '1px', backgroundColor: '#f6f5f0' }}></div>
                <div style={{ position: 'absolute', left: 0, right: 0, top: '75%', height: '1px', backgroundColor: '#f6f5f0' }}></div>

                {monthlyActivityData.map((bar, i) => {
                  const barHeightPercent = Math.max(6, Math.round((bar.count / maxMonthlyCount) * 85));
                  const isCurrent = i === monthlyActivityData.length - 1;
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '8%', height: '100%', justifyContent: 'flex-end', zIndex: 1 }}>
                      <div style={{
                        width: '100%',
                        height: `${barHeightPercent}%`,
                        backgroundColor: isCurrent ? 'var(--accent-green)' : 'var(--accent-light-green)',
                        borderRadius: '4px 4px 0 0',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      title={`${bar.count} commits in ${bar.month}`}
                      onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(0.95)'}
                      onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
                      ></div>
                      <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.5rem' }}>{bar.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* Technical Languages Proficiency Section */}
        <section style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '2rem',
          border: '1px solid #e5e3dc',
          boxShadow: '0 4px 20px rgba(0,0,0,0.01)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>Languages & Technologies DNA</h3>
            <Link href="/github" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--accent-green)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
              <span>Calibrate Distribution</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem'
          }}>
            {userDetails.repoStats.languages.map((lang, i) => {
              const getLangLevel = (pct: number) => {
                if (pct >= 40) return 'Mastered';
                if (pct >= 20) return 'Advanced';
                if (pct >= 8) return 'Intermediate';
                return 'Learning';
              };
              const getLangDesc = (name: string) => {
                if (name === 'TypeScript') return 'Type-safe React, Node pipelines.';
                if (name === 'Python') return 'Automation, ML workflows.';
                if (name === 'JavaScript') return 'Asynchronous DOM interfaces.';
                if (name === 'Rust') return 'Memory safety, systems tooling.';
                return 'General logic routines.';
              };
              
              return (
                <div key={i} style={{
                  border: '1px solid #e5e3dc',
                  borderRadius: '16px',
                  padding: '1.25rem',
                  backgroundColor: '#faf9f5',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.8rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: lang.color, letterSpacing: '0.02em' }}>
                      {getLangLevel(lang.percentage)}
                    </span>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `1.5px solid ${lang.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: lang.percentage >= 40 ? lang.color : 'transparent' }}></div>
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 0.2rem 0' }}>{lang.name}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.3, margin: 0 }}>{getLangDesc(lang.name)}</p>
                  </div>

                  <div style={{ marginTop: 'auto' }}>
                    <div style={{ width: '100%', height: '4px', backgroundColor: '#efeadd', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${lang.percentage}%`, height: '100%', backgroundColor: lang.color }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Repository list section */}
        <section style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '2rem',
          border: '1px solid #e5e3dc',
          boxShadow: '0 4px 20px rgba(0,0,0,0.01)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
              Ingested Repository Catalog
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Filter repository..." 
                  value={searchTerm}
                  onChange={handleSearchChange}
                  style={{
                    padding: '0.4rem 1rem 0.4rem 2rem',
                    borderRadius: '8px',
                    border: '1px solid #e5e3dc',
                    fontSize: '0.85rem',
                    width: '180px',
                    outline: 'none'
                  }}
                />
              </div>

              <button style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                border: '1px solid #e5e3dc',
                backgroundColor: '#faf9f5',
                color: 'var(--text-main)',
                cursor: 'pointer'
              }}>
                <Filter size={14} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left'
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e3dc' }}>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', width: '60px' }}>#</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>REPOSITORY NAME</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>PRIMARY LANGUAGE</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', width: '120px' }}>STARS</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', width: '120px' }}>FORKS</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', width: '80px', textAlign: 'center' }}>EXTERNAL</th>
                </tr>
              </thead>
              <tbody>
                {repos.length > 0 ? (
                  repos.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f6f5f0' }} className="table-row">
                      <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.id}</td>
                      <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        <div>{r.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '0.2rem' }}>{r.description}</div>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                        <span style={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          fontSize: '0.75rem', 
                          backgroundColor: '#faf9f5', 
                          border: '1px solid #e5e3dc', 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '4px' 
                        }}>
                          <span style={{ width: '8px', height: '8px', backgroundColor: r.languageColor, borderRadius: '50%', display: 'inline-block' }}></span>
                          {r.language}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 500 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Star size={14} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                          <span>{r.stars}</span>
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: 500 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <GitFork size={14} style={{ color: '#3b82f6' }} />
                          <span>{r.forks}</span>
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <a href={r.external} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)' }}>
                          <ExternalLink size={14} />
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No repositories found matching filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button style={{
              border: 'none',
              borderRadius: '20px',
              padding: '0.6rem 1.5rem',
              backgroundColor: '#efeadd',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5decb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#efeadd'}
            >
              Load More Repositories
            </button>
          </div>
        </section>

        {/* Tailored Project Blueprints Section */}
        <section style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '2rem',
          border: '1px solid #e5e3dc',
          boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: '#efeadd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-green)'
            }}>
              <Compass size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                Tailored Project Blueprints
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Improve your developer level with recommended architectures using your Languages & Technologies DNA
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginTop: '1.5rem'
          }}>
            {recommendedProjects.map((project, idx) => {
              const levelColor = project.level === 'Expert' ? '#ef4444' : project.level === 'Advanced' ? 'var(--accent-green)' : '#f59e0b';
              const levelBg = project.level === 'Expert' ? 'rgba(239, 68, 68, 0.08)' : project.level === 'Advanced' ? 'rgba(46, 117, 89, 0.08)' : 'rgba(245, 158, 11, 0.08)';
              
              return (
                <div 
                  key={idx} 
                  style={{
                    backgroundColor: '#faf9f5',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    border: '1px solid #e5e3dc',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  className="blueprint-card"
                >
                  <div>
                    {/* Badge / Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: levelBg,
                        color: levelColor,
                        padding: '0.25rem 0.6rem',
                        borderRadius: '20px',
                        border: `1px solid ${levelColor}20`
                      }}>
                        {project.level} Level
                      </span>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#85785d', fontSize: '0.75rem', fontWeight: 600 }}>
                        <Sparkles size={12} style={{ color: '#d97706' }} />
                        <span>{project.lift}</span>
                      </div>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>
                      {project.title}
                    </h4>
                    
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45, margin: '0 0 1.25rem 0' }}>
                      {project.description}
                    </p>

                    {/* Tech Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                      {project.tags.map((tag, tIdx) => (
                        <span 
                          key={tIdx} 
                          style={{
                            fontSize: '0.7rem',
                            backgroundColor: '#efeadd',
                            color: '#584931',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            fontWeight: 500
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedBlueprint(project)}
                    style={{
                      width: '100%',
                      border: '1px solid #e5e3dc',
                      borderRadius: '10px',
                      padding: '0.5rem',
                      backgroundColor: '#ffffff',
                      color: 'var(--text-main)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#efeadd';
                      e.currentTarget.style.borderColor = '#d1cebf';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = '#e5e3dc';
                    }}
                  >
                    <span>View Blueprint Architecture</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Blueprint Viewer Modal */}
        {selectedBlueprint && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(41, 40, 37, 0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '2rem'
          }}>
            <div style={{
              backgroundColor: '#faf9f5',
              borderRadius: '24px',
              border: '1px solid #e5e3dc',
              width: '100%',
              maxWidth: '850px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}>
              {/* Header */}
              <div style={{
                padding: '2rem 2rem 1.5rem 2rem',
                borderBottom: '1px solid #e5e3dc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: selectedBlueprint.level === 'Expert' ? 'rgba(239, 68, 68, 0.08)' : selectedBlueprint.level === 'Advanced' ? 'rgba(46, 117, 89, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                      color: selectedBlueprint.level === 'Expert' ? '#ef4444' : selectedBlueprint.level === 'Advanced' ? 'var(--accent-green)' : '#f59e0b',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '12px'
                    }}>
                      {selectedBlueprint.level} Level
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#85785d', fontWeight: 600 }}>
                      Expected Lift: {selectedBlueprint.lift}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                    {selectedBlueprint.title}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedBlueprint(null)}
                  style={{
                    border: 'none',
                    background: 'none',
                    fontSize: '1.5rem',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '0.25rem'
                  }}
                >
                  &times;
                </button>
              </div>

              {/* Content body */}
              <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
                {/* Left Column: Architecture & Why */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Target size={14} style={{ color: 'var(--accent-green)' }} />
                      Why This Project?
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: '#584931', lineHeight: 1.5, margin: 0, backgroundColor: '#efeadd', padding: '1rem', borderRadius: '12px' }}>
                      {selectedBlueprint.whyThis}
                    </p>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Cpu size={14} style={{ color: 'var(--accent-green)' }} />
                      System Architecture Flow
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {selectedBlueprint.architecture.map((step: string, sIdx: number) => (
                        <div key={sIdx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                          <span style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--accent-green)',
                            color: '#ffffff',
                            fontSize: '0.7rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: '0.1rem'
                          }}>
                            {sIdx + 1}
                          </span>
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.45, margin: 0 }}>
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Files & Database */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <BookOpen size={14} style={{ color: 'var(--accent-green)' }} />
                      Recommended File Tree
                    </h4>
                    <pre style={{
                      backgroundColor: '#1b1b19',
                      color: '#a7a59a',
                      padding: '1rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      margin: 0,
                      overflowX: 'auto',
                      border: '1px solid #2d2c29'
                    }}>
                      {selectedBlueprint.fileStructure.join('\n')}
                    </pre>
                  </div>

                  {selectedBlueprint.dbSchema && (
                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Database size={14} style={{ color: 'var(--accent-green)' }} />
                        Database Schema Blueprint
                      </h4>
                      <pre style={{
                        backgroundColor: '#1b1b19',
                        color: '#6aa68d',
                        padding: '1rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontFamily: 'monospace',
                        margin: 0,
                        overflowX: 'auto',
                        border: '1px solid #2d2c29'
                      }}>
                        {selectedBlueprint.dbSchema}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div style={{
                padding: '1.5rem 2rem',
                borderTop: '1px solid #e5e3dc',
                display: 'flex',
                justifyContent: 'flex-end',
                backgroundColor: '#faf9f5'
              }}>
                <button 
                  onClick={() => setSelectedBlueprint(null)}
                  style={{
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.6rem 1.5rem',
                    backgroundColor: 'var(--accent-green)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(46, 117, 89, 0.2)'
                  }}
                >
                  Close Blueprint
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contribution DNA Heatmap */}
        <section style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '2rem',
          border: '1px solid #e5e3dc',
          boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>Contribution DNA</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Visualizing your consistency across the past 12 months based on public GitHub repository event timeline
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              {/* Heatmap Legend */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Less</span>
                <span style={{ width: '10px', height: '10px', backgroundColor: '#efeadd', borderRadius: '2px' }}></span>
                <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--accent-light-green)', borderRadius: '2px' }}></span>
                <span style={{ width: '10px', height: '10px', backgroundColor: '#6ca68d', borderRadius: '2px' }}></span>
                <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--accent-green)', borderRadius: '2px' }}></span>
                <span>More</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                <span>{userStreak} Day Streak</span>
                <span style={{ color: '#ef4444' }}><Flame size={16} fill="#ef4444" /></span>
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateRows: 'repeat(7, 10px)',
            gridAutoFlow: 'column',
            gap: '3px',
            overflowX: 'auto',
            paddingBottom: '0.5rem'
          }}>
            {dynamicHeatmapData.map((level, i) => {
              let bg = '#efeadd'; // 0
              if (level === 1) bg = 'var(--accent-light-green)';
              else if (level === 2) bg = '#6ca68d';
              else if (level === 3) bg = 'var(--accent-green)';
              
              return (
                <div 
                  key={i} 
                  style={{
                    width: '100%',
                    maxWidth: '10px',
                    height: '10px',
                    backgroundColor: bg,
                    borderRadius: '2px',
                    cursor: 'pointer'
                  }}
                  title={`Day ${i + 1}: ${level === 3 ? 'High' : level === 2 ? 'Medium' : level === 1 ? 'Low' : 'No'} commits`}
                />
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
}
