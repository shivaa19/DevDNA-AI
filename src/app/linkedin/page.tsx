"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Compass, BarChart2, Cpu, ChevronRight, HelpCircle, 
  CheckCircle2, Target, Database, Activity, LogOut, Layout, 
  Code, Star, AlertCircle, Award, Network, Shield, ArrowUpRight, 
  TrendingUp, Edit3, Award as AwardIcon, PenTool, ExternalLink,
  MessageSquare, UserPlus, Users, Plus, Check, Play, Search, Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LinkedInStats {
  username: string;
  realName: string;
  avatar: string;
  score: number;
  positioning: string;
  headline: string;
  bio: string;
  analysisParagraph?: string;
  enhancements: {
    headline: string;
    alternatives: string[];
    experience: string[];
    drafts: string[];
    skills: string[];
  };
  networking: Array<{
    name: string;
    role: string;
    avatar: string;
  }>;
  endorsements: Array<{
    skill: string;
    count: number;
    level: string;
  }>;
  isFallback?: boolean;
}

// Parses LinkedIn username/profile from URL
const parseLinkedinUsername = (input: string): string => {
  let cleaned = input.trim();
  cleaned = cleaned.replace(/^(https?:\/\/)?(www\.)?/, '');
  if (cleaned.includes('linkedin.com/in/')) {
    cleaned = cleaned.substring(cleaned.indexOf('linkedin.com/in/') + 'linkedin.com/in/'.length);
  }
  return cleaned.split('/')[0].split('?')[0].trim();
};

// Generates dynamic name
const extractNameFromLinkedin = (username: string): string => {
  let cleaned = username.trim();
  cleaned = cleaned.replace(/^(iam|im|developer|engineer|code|dev|the)-?/i, '');
  cleaned = cleaned.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  if (cleaned.toLowerCase().includes('amitsrivastava') || cleaned.toLowerCase().replace(/[-_]/g, '').includes('amitsrivastava')) {
    return 'Amit Srivastava';
  }
  
  cleaned = cleaned.replace(/[_-]/g, ' ');
  return cleaned.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

// Generate LinkedIn details dynamically based on username
const getLinkedInStats = (username: string): LinkedInStats => {
  const parsedUser = parseLinkedinUsername(username);
  const displayName = extractNameFromLinkedin(parsedUser);
  
  let hash = 0;
  for (let i = 0; i < parsedUser.length; i++) {
    hash = parsedUser.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  
  const score = (hash % 15) + 80; // 80 - 95

  // Check if username/name matches Amit
  const isAmit = displayName.toLowerCase().includes('amit') || 
                 displayName.toLowerCase().includes('srivastava') || 
                 parsedUser.toLowerCase().includes('amit') || 
                 parsedUser.toLowerCase().includes('srivastava') ||
                 parsedUser.toLowerCase().includes('108');

  // Attempt to read connected GitHub profile details
  let githubStats: any = null;
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('devdna_github_stats');
    if (saved) {
      try {
        githubStats = JSON.parse(saved);
      } catch (e) {}
    }
  }

  if (isAmit) {
    return {
      username: parsedUser,
      realName: "AMIT SRIVASTAVA",
      avatar: "https://github.com/iamamitsrivastava.png",
      score: 94,
      positioning: "High-Potential Tech Explorer & Full-Stack Developer",
      headline: "Computer Science Undergrad at Parul University | Full-Stack Developer | React, Node.js & Python Enthusiast",
      bio: "Computer Science undergraduate at Parul University with strong skills in DSA and full-stack development. Experienced in building AI-driven applications and real-time web platforms using React, Node.js, and Python. Passionate about problem-solving, scalable systems, and continuous learning through hands-on projects.",
      analysisParagraph: "Your profile effectively showcases strong DSA and full-stack projects, but there is a gap in demonstrating industry-scale metrics. To land a premium internship or Software Engineer role, we need to highlight metrics from your projects (like vision-test-app and ICBD-2026) and emphasize your TypeScript expertise.",
      enhancements: {
        headline: "Computer Science Undergrad at Parul University | Full-Stack Developer | React, Node.js & Python Enthusiast",
        alternatives: [
          `Full-Stack Developer & AI Enthusiast | CS Undergrad at Parul University | Building scalable React, TypeScript & Node.js web systems`,
          `Software Engineering Intern / Student Developer | React, Node.js, Python | Creator of vision-test-app & DevDNA AI integration`,
          `Undergraduate Developer at Parul University | Open-Source Contributor | Specialized in TypeScript, React, and Interactive Web Platforms`
        ],
        experience: [
          `Add scale/impact metrics to your project vision-test-app (e.g., frontend rendering speedups or error reductions)`,
          `Highlight TypeScript strict-typing migration in your ICBD-2026 portal development`,
          `Detail database scalability and logs automation in your impact-attendance system`
        ],
        drafts: [
          `Engineered web-based vision testing dashboard (vision-test-app) using React & TypeScript, optimizing image rendering speed by 35%.`,
          `Migrated legacy frontend components of the ICBD-2026 portal to strict TypeScript, preventing runtime errors by 25% during deployment.`,
          `Built the Node.js backend for the impact-attendance system, supporting automated event attendance logs for university events.`
        ],
        skills: ["TypeScript", "Data Structures & Algorithms (DSA)", "REST APIs", "Node.js", "Git & Version Control"]
      },
      networking: [
        { name: "Vikram Mehta", role: "Tech Recruiter at L&T Technology Services, Vadodara", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80" },
        { name: "Nisha Sharma", role: "Software Engineer at Microsoft | Parul University Alumna", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80" },
        { name: "Dr. Rajesh Patel", role: "Head of CSE Department at Parul University", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80" }
      ],
      endorsements: [
        { skill: "ReactJS", count: 12, level: "Medium Social Proof" },
        { skill: "TypeScript", count: 2, level: "Low Social Proof" }
      ]
    };
  }

  if (githubStats) {
    const repos = githubStats.repositories || [];
    const mainLangs = githubStats.repoStats?.languages?.slice(0, 3).map((l: any) => l.name) || ["JavaScript", "TypeScript", "Python"];
    const repoNames = repos.slice(0, 3).map((r: any) => r.name);
    
    return {
      username: parsedUser,
      realName: githubStats.realName || displayName,
      avatar: githubStats.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80",
      score: score,
      positioning: score > 90 ? "Visionary Architect & Leader" : "Technical Problem Solver",
      headline: `${githubStats.bio ? githubStats.bio.split('|')[0].trim() : 'Full Stack Developer'} | Developer DNA Synced`,
      bio: githubStats.bio || `Passionate developer focused on building scalable, performant architectures using ${mainLangs.join(', ')}.`,
      analysisParagraph: `Your profile effectively showcases repositories like ${repoNames.slice(0, 2).join(' and ')} in ${mainLangs[0] || 'modern stack'}, but could highlight production-level impact. We need to shift the narrative to emphasize your metrics-driven contributions and architectural ownership.`,
      enhancements: {
        headline: `${githubStats.bio ? githubStats.bio.split('|')[0].trim() : 'Full Stack Developer'} | Developer DNA Synced`,
        alternatives: [
          `Lead Full-Stack Architect | Building scalable systems using ${mainLangs.slice(0,2).join('/')} to power high-traffic applications`,
          `Senior Software Engineer | Specialized in ${mainLangs.join(', ')} and microservices optimization`,
          `Technical Lead | Driving frontend and backend scalability with automated CI/CD and clean code practices`
        ],
        experience: [
          repos[0] ? `Add metrics (e.g. latency, user capacity) to your public repository: ${repos[0].name}` : `Quantify user scaling metrics on your primary web application`,
          repos[1] ? `Mention modular refactoring or code quality improvements made on ${repos[1].name}` : `Detail cloud deployment automation using Docker or serverless workflows`
        ],
        drafts: [
          repos[0] ? `Developed and optimized ${repos[0].name} using ${repos[0].language || mainLangs[0]}, improving data latency by 30%.` : `Engineered responsive web applications, increasing user interaction speed by 25%.`,
          repos[1] ? `Architected ${repos[1].name} using ${repos[1].language || mainLangs[1]}, automating data synchronization across clients.` : `Built backend REST endpoints with optimized Node services, supporting up to 10k concurrent sessions.`,
          repos[2] ? `Led code modernization of ${repos[2].name}, improving modular structure and increasing unit test coverage.` : `Configured CI/CD automation flows, reducing deployment times by 40%.`
        ],
        skills: [...mainLangs, "REST APIs", "Git & Version Control"]
      },
      networking: [
        { name: "Sarah Chen", role: "CTO at Velocity Finance", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80" },
        { name: "Marcus Thorne", role: "Principal Engineer @ Stripe", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80" }
      ],
      endorsements: [
        { skill: mainLangs[0] || "ReactJS", count: 15, level: "Medium Social Proof" },
        { skill: mainLangs[1] || "TypeScript", count: 4, level: "Low Social Proof" }
      ]
    };
  }

  return {
    username: parsedUser,
    realName: displayName,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80",
    score: score,
    positioning: score > 90 ? "Visionary Architect & Leader" : "Technical Problem Solver",
    headline: "Senior Full Stack Engineer | React & Node Expert",
    bio: "Passionate developer focused on building scalable, performant architectures and clean code systems.",
    analysisParagraph: "Your profile effectively highlights core full-stack capabilities, but there is a gap in demonstrating architectural leadership. To reach your target role as a Lead Engineer, we need to shift the narrative from 'executing tasks' to 'owning outcomes'.",
    enhancements: {
      headline: "Senior Full Stack Engineer | React & Node Expert",
      alternatives: [
        `Lead Full-Stack Architect | Building scalable React/Node systems to power 10M+ user traffic`,
        `Senior Engineer & Technical Lead | Delivering high-performance distributed systems in React/TypeScript & Node`,
        `Software Architect | Leading frontend modernization, microservices architecture, and mentoring engineering teams`
      ],
      experience: [
        `Add scale (e.g., "Scaled web applications to 50k+ active users")`,
        `Mention cost savings or latency reductions achieved with serverless/Next.js`
      ],
      drafts: [
        `Engineered React micro-frontend framework, scaling user load capacity by 200%.`,
        `Architected backend Node.js services that reduced API latencies by 40% under peak load.`,
        `Led modernization of core product suite, migrating legacy modules to modern Next.js architecture.`
      ],
      skills: ["Distributed Systems", "Kubernetes", "Mentorship"]
    },
    networking: [
      { name: "Sarah Chen", role: "CTO at Velocity Finance", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80" },
      { name: "Marcus Thorne", role: "Principal Engineer @ Stripe", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80" }
    ],
    endorsements: [
      { skill: "System Architecture", count: 3, level: "Low Social Proof" },
      { skill: "React Infrastructure", count: 18, level: "Medium Social Proof" }
    ]
  };
};

const ingestionSteps = [
  { id: 1, label: 'Establishing secure link to LinkedIn public registry...' },
  { id: 2, label: 'Retrieving user professional history & headline...' },
  { id: 3, label: 'Parsing experiences for scale and impact metrics...' },
  { id: 4, label: 'Synthesizing professional narrative positioning...' },
  { id: 5, label: 'Generating customized actionable enhancements...' }
];

export default function LinkedInIntel() {
  const { user } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [linkedinUser, setLinkedinUser] = useState('');
  const [inputUser, setInputUser] = useState('');
  const [linkedinStats, setLinkedinStats] = useState<LinkedInStats | null>(null);

  // Ingestion states
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestionStep, setIngestionStep] = useState(0);

  // Interactive UI states
  const [showHeadlineAlts, setShowHeadlineAlts] = useState(false);
  const [showImpactDrafts, setShowImpactDrafts] = useState(false);
  const [connectionsRequested, setConnectionsRequested] = useState<string[]>([]);
  const [skillsAdded, setSkillsAdded] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    let savedUser = null;
    let savedStats = null;

    if (user) {
      const savedProfileStr = localStorage.getItem(`devdna_profile_${user.email}`);
      if (savedProfileStr) {
        try {
          const profile = JSON.parse(savedProfileStr);
          savedUser = profile.formData?.linkedin || profile.linkedin_username;
          savedStats = profile.linkedin_stats;
        } catch (e) {
          console.error("Failed to parse saved user profile", e);
        }
      }
    }

    if (!savedUser) {
      savedUser = localStorage.getItem('devdna_linkedin_user');
    }
    if (!savedStats) {
      savedStats = localStorage.getItem('devdna_linkedin_stats');
    }

    if (savedUser) {
      setLinkedinUser(savedUser);
      setInputUser(savedUser);
    }
    if (savedStats) {
      try {
        const parsed = typeof savedStats === 'string' ? JSON.parse(savedStats) : savedStats;
        setLinkedinStats(parsed);
      } catch (e) {
        console.error("Failed to parse LinkedIn stats", e);
      }
    }
  }, [user]);

  // If we have a username but no stats, generate them
  useEffect(() => {
    if (linkedinUser && !linkedinStats) {
      const stats = getLinkedInStats(linkedinUser);
      setLinkedinStats(stats);
      localStorage.setItem('devdna_linkedin_stats', JSON.stringify(stats));
    }
  }, [linkedinUser, linkedinStats]);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUser.trim()) return;

    setIsIngesting(true);
    setIngestionStep(0);

    const stepInterval = setInterval(() => {
      setIngestionStep(prev => {
        if (prev < ingestionSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 400);

    setTimeout(() => {
      clearInterval(stepInterval);
      const stats = getLinkedInStats(inputUser);
      
      localStorage.setItem('devdna_linkedin_user', inputUser.trim());
      localStorage.setItem('devdna_linkedin_stats', JSON.stringify(stats));

      if (user) {
        const existingProfileStr = localStorage.getItem(`devdna_profile_${user.email}`);
        let profile = existingProfileStr ? JSON.parse(existingProfileStr) : {};
        if (!profile.formData) profile.formData = {};
        profile.formData.linkedin = inputUser.trim();
        profile.linkedin_username = inputUser.trim();
        profile.linkedin_stats = stats;
        localStorage.setItem(`devdna_profile_${user.email}`, JSON.stringify(profile));
      }

      setLinkedinUser(inputUser.trim());
      setLinkedinStats(stats);
      setIsIngesting(false);
    }, 2200);
  };

  const handleDisconnect = () => {
    localStorage.removeItem('devdna_linkedin_user');
    localStorage.removeItem('devdna_linkedin_stats');

    if (user) {
      const existingProfileStr = localStorage.getItem(`devdna_profile_${user.email}`);
      if (existingProfileStr) {
        try {
          let profile = JSON.parse(existingProfileStr);
          if (profile.formData) {
            profile.formData.linkedin = '';
          }
          delete profile.linkedin_username;
          delete profile.linkedin_stats;
          localStorage.setItem(`devdna_profile_${user.email}`, JSON.stringify(profile));
        } catch (e) {}
      }
    }

    setLinkedinUser('');
    setLinkedinStats(null);
    setInputUser('');
    setShowHeadlineAlts(false);
    setShowImpactDrafts(false);
    setConnectionsRequested([]);
    setSkillsAdded([]);
  };

  const handleConnectRequest = (name: string) => {
    if (connectionsRequested.includes(name)) return;
    setConnectionsRequested([...connectionsRequested, name]);
  };

  const handleAddSkill = (skill: string) => {
    if (skillsAdded.includes(skill)) return;
    setSkillsAdded([...skillsAdded, skill]);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1200);
  };

  if (!isClient) return null;

  if (!linkedinUser) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f6f5f0',
        backgroundImage: 'url("/linkedin_background.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: '#2d3732',
        fontFamily: 'var(--font-inter), sans-serif',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Orbs */}
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, rgba(255,255,255,0) 70%)',
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

        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(24px)',
          padding: '3rem',
          borderRadius: '24px',
          width: '100%',
          maxHeight: '100%',
          maxWidth: '500px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
          border: '1px solid #e5e3dc',
          textAlign: 'center'
        }}>
          {!isIngesting ? (
            <form onSubmit={handleConnect} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                <Image src="/logo_linkedin.png" alt="LinkedIn Logo" width={180} height={50} style={{ objectFit: 'contain' }} />
              </div>

              <div>
                <h2 className="serif" style={{ fontSize: '1.75rem', fontWeight: 500, margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>
                  LinkedIn Ingestion
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                  Extract professional signals and narrative analytics to calibrate your resume and brand trajectory.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  LINKEDIN PROFILE URL OR USERNAME
                </label>
                <input 
                  type="text" 
                  value={inputUser}
                  onChange={(e) => setInputUser(e.target.value)}
                  placeholder="e.g. https://linkedin.com/in/iamamitsrivastava" 
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
                />
              </div>

              <button 
                type="submit" 
                style={{ 
                  justifyContent: 'center', 
                  padding: '0.9rem', 
                  borderRadius: '12px', 
                  fontSize: '1rem', 
                  fontWeight: 600,
                  backgroundColor: '#0a66c2',
                  border: '1px solid #0a66c2',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <span>Extract Professional DNA</span>
                <ChevronRight size={18} />
              </button>

              <div style={{ marginTop: '0.5rem' }}>
                <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
                  &larr; Back to Platform Homepage
                </Link>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem 0' }}>
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
                    border: '4px solid rgba(10,102,194,0.1)',
                    borderTop: '4px solid #0a66c2',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <Database size={28} style={{ color: '#0a66c2' }} />
                </div>
              </div>
              <div>
                <h3 className="serif" style={{ fontSize: '1.25rem', fontWeight: 500, margin: '0 0 0.5rem 0' }}>
                  Analyzing Professional Brand...
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <Activity size={14} style={{ animation: 'spin 2s linear infinite' }} />
                  <span>Connecting to Professional Graph APIs...</span>
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
                      fontSize: '0.85rem',
                      color: isDone ? 'var(--accent-green)' : isActive ? 'var(--text-main)' : 'var(--text-muted)',
                      fontWeight: isActive || isDone ? 600 : 400,
                      opacity: isDone || isActive ? 1 : 0.5,
                      transition: 'all 0.3s'
                    }}>
                      {isDone ? (
                        <CheckCircle2 size={14} style={{ color: 'var(--accent-green)' }} />
                      ) : isActive ? (
                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2.5px solid #0a66c2', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
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

        <style jsx global>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Load stats
  const stats = linkedinStats || getLinkedInStats(linkedinUser);
  const name = stats.realName;

  // Added skills mapped
  const currentEndorsements = [
    ...stats.endorsements,
    ...skillsAdded.map(s => ({ skill: s, count: 1, level: 'Pending Endorsement' }))
  ];

  return (
    <div style={{
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
            <Code size={18} />
            <span>Skill Matrix</span>
          </Link>

          <Link href="/linkedin" style={{
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
            color: 'var(--text-muted)',
            fontSize: '0.95rem',
            fontWeight: 500,
            transition: 'all 0.2s'
          }} className="sidebar-link">
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
            marginBottom: '0.5rem',
            transition: 'all 0.2s'
          }}
          className="sidebar-link"
        >
          <LogOut size={16} />
          <span>Disconnect LinkedIn</span>
        </button>
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
              <Link href="/linkedin" style={{ color: 'var(--text-main)', textDecoration: 'none', borderBottom: '2px solid var(--accent-green)', paddingBottom: '1.1rem' }}>LinkedIn Intel</Link>
              <Link href="/github" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Repository Map</Link>
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8c9c94' }} />
              <input 
                type="text" 
                placeholder="Search metrics..." 
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
              />
            </div>
            
            <button style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', position: 'relative' }}>
              <Bell size={18} />
              <span style={{ position: 'absolute', top: 0, right: 0, width: '6px', height: '6px', backgroundColor: '#ef4444', borderRadius: '50%' }}></span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-green)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '0.9rem',
                border: '2px solid var(--accent-green)'
              }}>
                {name ? name.charAt(0) : 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Title & Subtitle */}
        <div>
          <h1 className="serif" style={{ fontSize: '2.5rem', fontWeight: 500, color: 'var(--accent-green)', marginBottom: '0.5rem' }}>LinkedIn Intelligence</h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '900px', lineHeight: 1.5 }}>
            Harness your professional data to architect a narrative that resonates with industry-leading technical teams.
          </p>
        </div>

        {/* Score & Narrative Analysis Box */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '2.5rem',
          border: '1px solid #e5e3dc',
          display: 'flex',
          gap: '3rem',
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.01)'
        }}>
          {/* Progress Circle SVG */}
          <div style={{ position: 'relative', width: '180px', height: '180px', flexShrink: 0 }}>
            <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background circle */}
              <circle 
                cx="90" 
                cy="90" 
                r="74" 
                fill="transparent" 
                stroke="#efeadd" 
                strokeWidth="12" 
              />
              {/* Foreground circle */}
              <circle 
                cx="90" 
                cy="90" 
                r="74" 
                fill="transparent" 
                stroke="var(--accent-green)" 
                strokeWidth="12" 
                strokeDasharray={2 * Math.PI * 74}
                strokeDashoffset={2 * Math.PI * 74 * (1 - stats.score / 100)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{stats.score}%</span>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '-0.2rem' }}>Narrative Score</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex' }}>
              <span style={{
                backgroundColor: '#f3e6cd',
                color: '#8f6820',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '0.3rem 0.75rem',
                borderRadius: '20px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                Highly Optimized
              </span>
            </div>

            <h2 className="serif" style={{ fontSize: '1.8rem', fontWeight: 500, color: 'var(--text-main)', lineHeight: 1.2 }}>
              Your professional brand is currently positioned as a &quot;{stats.positioning}.&quot;
            </h2>

            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {stats.analysisParagraph || "Your profile effectively highlights core full-stack capabilities, but there is a gap in demonstrating architectural leadership. To reach your target role as a Lead Engineer, we need to shift the narrative from 'executing tasks' to 'owning outcomes'."}
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--accent-green)' }} />
                <span>Impact Driven</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                <TrendingUp size={16} style={{ color: 'var(--accent-green)' }} />
                <span>Growth Oriented</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actionable Enhancements */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Activity size={18} style={{ color: 'var(--accent-green)' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>Actionable Enhancements</h3>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
              3 ITEMS REQUIRING ATTENTION
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
            
            {/* Enhancement 1 */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '1.75rem',
              border: '1px solid #e5e3dc',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 15px rgba(0,0,0,0.01)'
            }}>
              <div>
                <div style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: '#e2efea',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-green)',
                  marginBottom: '1.25rem'
                }}>
                  <Edit3 size={18} />
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Headline Optimization</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  Current headline is generic. Let&apos;s make it punchy and outcome-focused.
                </p>

                <div style={{
                  backgroundColor: '#faf9f5',
                  border: '1px dashed #e5e3dc',
                  borderRadius: '10px',
                  padding: '0.8rem 1rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  fontStyle: 'italic',
                  lineHeight: 1.4,
                  marginBottom: '1rem'
                }}>
                  &quot;{stats.enhancements.headline}&quot;
                </div>

                {showHeadlineAlts && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-green)' }}>AI SUGGESTIONS:</span>
                    {stats.enhancements.alternatives.map((alt, idx) => (
                      <div key={idx} style={{
                        backgroundColor: '#e2efea',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        color: 'var(--accent-green)',
                        lineHeight: 1.3
                      }}>
                        {alt}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={() => setShowHeadlineAlts(!showHeadlineAlts)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-green)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  padding: 0,
                  textAlign: 'left'
                }}
              >
                <span>{showHeadlineAlts ? 'Hide alternatives' : 'View 3 AI-generated alternatives'}</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Enhancement 2 */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '1.75rem',
              border: '1px solid #e5e3dc',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 15px rgba(0,0,0,0.01)'
            }}>
              <div>
                <div style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: '#e2efea',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-green)',
                  marginBottom: '1.25rem'
                }}>
                  <TrendingUp size={18} />
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Experience Narrative</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  You&apos;re missing metrics. Quantify your impact at your last two roles.
                </p>

                <ul style={{
                  paddingLeft: '1.2rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.6,
                  marginBottom: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem'
                }}>
                  {stats.enhancements.experience.map((exp, idx) => (
                    <li key={idx} style={{ listStyleType: 'none', position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '-1rem', color: 'var(--accent-green)', fontWeight: 'bold' }}>+</span>
                      {exp}
                    </li>
                  ))}
                </ul>

                {showImpactDrafts && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-green)' }}>DRAFT BULLET POINTS:</span>
                    {stats.enhancements.drafts.map((draft, idx) => (
                      <div key={idx} style={{
                        backgroundColor: '#faf9f5',
                        border: '1px solid #e5e3dc',
                        padding: '0.6rem 0.8rem',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        color: 'var(--text-main)',
                        lineHeight: 1.3
                      }}>
                        {draft}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={() => setShowImpactDrafts(!showImpactDrafts)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-green)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  padding: 0,
                  textAlign: 'left'
                }}
              >
                <span>{showImpactDrafts ? 'Hide auto-drafts' : 'Auto-draft impact statements'}</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Enhancement 3 */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: '1.75rem',
              border: '1px solid #e5e3dc',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 15px rgba(0,0,0,0.01)'
            }}>
              <div>
                <div style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: '#e2efea',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-green)',
                  marginBottom: '1.25rem'
                }}>
                  <PenTool size={18} />
                </div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Skills Alignment</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  Missing 4 high-demand keywords found in Staff Engineer job descriptions.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {stats.enhancements.skills.map((skill, idx) => {
                    const isAdded = skillsAdded.includes(skill);
                    return (
                      <span 
                        key={idx} 
                        onClick={() => handleAddSkill(skill)}
                        style={{
                          backgroundColor: isAdded ? 'var(--accent-green)' : '#faf9f5',
                          color: isAdded ? '#ffffff' : 'var(--text-muted)',
                          border: '1px solid #e5e3dc',
                          borderRadius: '8px',
                          padding: '0.4rem 0.8rem',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        {skill}
                        {isAdded ? <Check size={12} /> : <Plus size={12} />}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--accent-green)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <span>Click skill tags to align & add</span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Two-Column Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          gap: '2rem'
        }}>
          
          {/* Column 1: Networking Pathfinding */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '2rem',
            border: '1px solid #e5e3dc',
            boxShadow: '0 4px 20px rgba(0,0,0,0.01)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <Network size={18} style={{ color: 'var(--accent-green)' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>Networking Pathfinding</h3>
            </div>
            
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Connecting with these individuals will increase your profile visibility by <strong>14%</strong> within the Fintech sector.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {stats.networking.map((person, idx) => {
                const requested = connectionsRequested.includes(person.name);
                return (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.8rem 1rem',
                    backgroundColor: '#faf9f5',
                    borderRadius: '16px',
                    border: '1px solid #e5e3dc'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <Image 
                        src={person.avatar} 
                        alt={person.name} 
                        width={40} 
                        height={40} 
                        unoptimized
                        style={{ borderRadius: '50%', objectFit: 'cover' }} 
                      />
                      <div>
                        <h5 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>{person.name}</h5>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{person.role}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleConnectRequest(person.name)}
                      style={{
                        padding: '0.45rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        backgroundColor: requested ? '#e2efea' : 'transparent',
                        color: requested ? 'var(--accent-green)' : 'var(--text-main)',
                        border: requested ? '1px solid #d1e6db' : '1px solid #e5e3dc',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      {requested ? (
                        <>
                          <Check size={12} />
                          <span>Requested</span>
                        </>
                      ) : (
                        <span>Connect</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2: Endorsement Strategy */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '2rem',
            border: '1px solid #e5e3dc',
            boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <Shield size={18} style={{ color: 'var(--accent-green)' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>Endorsement Strategy</h3>
              </div>
              
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                Strengthen your social proof for specific core competencies.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {currentEndorsements.map((item, idx) => {
                  const maxCount = 20;
                  const percent = Math.min(100, (item.count / maxCount) * 100);
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                        <span style={{ color: 'var(--text-main)' }}>{item.skill}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{item.level} ({item.count})</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: '#efeadd', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${percent}%`,
                          height: '100%',
                          backgroundColor: percent > 60 ? 'var(--accent-green)' : '#ffa116',
                          borderRadius: '4px',
                          transition: 'width 0.4s ease'
                        }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{
              marginTop: '1.5rem',
              backgroundColor: '#faf9f5',
              border: '1px solid #e5e3dc',
              borderRadius: '12px',
              padding: '0.8rem 1rem',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              lineHeight: 1.4
            }}>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                Tip: Ask Sarah or Marcus for an endorsement on this skill.
              </div>
              You&apos;re doing great here. Keep it up!
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}
