"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Layout, Award, GitBranch, Cpu, Search, Bell, Settings,
  Edit2, Download, Sparkles, CheckCircle2, ChevronRight,
  RefreshCw, FileUp, Zap, HelpCircle, Target, BookOpen, Brain, Terminal, Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface UserProfileData {
  name: string;
  headline: string;
  leetcodeBadge: string;
  ossBadge: string;
  avatar: string;
}

export default function SkillDNA() {
  const { user } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [profileName, setProfileName] = useState('James LaFritz');
  const [headline, setHeadline] = useState('Full Stack Developer & AI Architect');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80');

  // Integrations active states
  const [githubConnected, setGithubConnected] = useState(true);
  const [leetcodeConnected, setLeetcodeConnected] = useState(true);
  const [linkedinConnected, setLinkedinConnected] = useState(true);

  // Stats
  const [githubUser, setGithubUser] = useState('distributed-mesh-author');
  const [githubStars, setGithubStars] = useState('1.2k');
  const [githubForks, setGithubForks] = useState('428');
  
  const [leetcodeUser, setLeetcodeUser] = useState('lafritz_leet');
  const [leetcodeSolved, setLeetcodeSolved] = useState({ total: 712, easy: 452, medium: 218, hard: 42 });
  const [leetcodeStreak, setLeetcodeStreak] = useState(42);

  const [linkedinUser, setLinkedinUser] = useState('james-lafritz');
  const [linkedinScore, setLinkedinScore] = useState(92);
  const [linkedinQuote, setLinkedinQuote] = useState("James has a 'Strong Expert' profile presence in the Cloud Architecture domain.");

  // Interactivity states
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStep, setSyncStep] = useState(0);

  // AI Recommendations State
  interface AIRecommendations {
    recommended_role: string;
    suggested_projects: string[];
    missing_skills: string[];
    closest_matches?: Array<{ name: string; distance: number }>;
  }
  const [aiRecs, setAiRecs] = useState<AIRecommendations | null>(null);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  const compileCombinedUserData = () => {
    const localGithub = localStorage.getItem('devdna_github_user') || '';
    const localGithubStats = localStorage.getItem('devdna_github_stats');
    const localLeetcode = localStorage.getItem('devdna_leetcode_user') || '';
    const localLeetcodeStats = localStorage.getItem('devdna_leetcode_stats');
    
    let githubBio = `Username: ${localGithub}`;
    let repoList = 'None connected';
    if (localGithubStats) {
      try {
        const stats = JSON.parse(localGithubStats);
        githubBio += `\nTotal Stars: ${stats.repoStats?.totalStars || 0}\nTotal Forks: ${stats.repoStats?.totalForks || 0}`;
        if (stats.repos && Array.isArray(stats.repos)) {
          repoList = stats.repos.slice(0, 5).map((r: any) => `- ${r.name}: ${r.description || ''} (Stars: ${r.stargazers_count || 0}, Lang: ${r.language || 'JS'})`).join('\n');
        }
      } catch (e) {}
    }

    let leetcodeBio = `Username: ${localLeetcode}\nNo competitive coding stats synced.`;
    if (localLeetcodeStats) {
      try {
        const stats = JSON.parse(localLeetcodeStats);
        leetcodeBio = `Username: ${localLeetcode}
Solved: ${stats.solved?.total || 0} questions (Easy: ${stats.solved?.easy || 0}, Medium: ${stats.solved?.medium || 0}, Hard: ${stats.solved?.hard || 0})
Streak: ${stats.calendar?.streak || 0} days
Active Days: ${stats.calendar?.totalActiveDays || 0} days`;
        if (stats.submissions && Array.isArray(stats.submissions)) {
          leetcodeBio += `\nRecent solved problems: ${stats.submissions.slice(0, 5).map((s: any) => s.title).join(', ')}`;
        }
      } catch (e) {}
    }

    let resumeText = 'No resume uploaded yet. Defaulting to general engineering parameters.';
    let skillsList = 'React, TypeScript, Next.js, Node.js';
    if (user) {
      const savedProfileStr = localStorage.getItem(`devdna_profile_${user.email}`);
      if (savedProfileStr) {
        try {
          const profile = JSON.parse(savedProfileStr);
          if (profile.formData) {
            resumeText = `Certifications: ${profile.certifications || 'None'}\nCloud Provider: ${profile.cloudProvider || 'None'}\nIndustry Focus: ${profile.formData.industrySelect || 'Software Engineering'}`;
            skillsList = profile.formData.skills || skillsList;
          }
        } catch (e) {}
      }
    }

    return `
GitHub:
${githubBio}

Repositories:
${repoList}

LeetCode:
${leetcodeBio}

Resume:
${resumeText}

Skills:
${skillsList}
`;
  };

  const fetchAIRecommendations = async (forceCombinedData?: string) => {
    setIsLoadingRecs(true);
    try {
      const profileData = forceCombinedData || compileCombinedUserData();
      const response = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile: profileData,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`AI Server returned ${response.status}`);
      }
      
      const data = await response.json();
      setAiRecs({
        recommended_role: data.recommended_role,
        suggested_projects: data.suggested_projects,
        missing_skills: data.missing_skills,
        closest_matches: data.closest_matches
      });
    } catch (err: any) {
      console.warn("AI Server not available, using dynamic local heuristic recommendations:", err);
      // Dynamic fallback recommendations based on user profile
      const localGithub = localStorage.getItem('devdna_github_user') || '';
      const localLeetcode = localStorage.getItem('devdna_leetcode_user') || '';
      
      let role = "Full Stack + AI Engineer";
      let projects = [
        "AI Resume Analyzer with Vector Embeddings",
        "Real-time Distributed Event Hub",
        "Automated DevOps Pipeline Orchestrator"
      ];
      let missing = ["Docker", "Kubernetes", "System Design", "AWS Deployments"];
      
      if (localLeetcode && !localGithub) {
        role = "Backend / Platform Engineer";
        projects = [
          "Distributed Event-Driven Logging System",
          "High-Throughput Redis-backed Caching Engine",
          "Custom Graph Database visualizer"
        ];
        missing = ["Docker", "System Design", "AWS Infrastructure", "GraphQL API design"];
      } else if (localGithub && !localLeetcode) {
        role = "Frontend / UI Engineer";
        projects = [
          "Glassmorphic design system catalog",
          "Web performance dashboard tool",
          "Interactive multiplayer canvas editor"
        ];
        missing = ["System Design", "Kubernetes", "Database Optimization", "GraphQL"];
      }
      
      setAiRecs({
        recommended_role: role,
        suggested_projects: projects,
        missing_skills: missing
      });
    } finally {
      setIsLoadingRecs(false);
    }
  };

  useEffect(() => {
    setIsClient(true);

    // Load user specifics if logged in
    if (user) {
      setProfileName(user.name);
      
      const savedProfileStr = localStorage.getItem(`devdna_profile_${user.email}`);
      if (savedProfileStr) {
        try {
          const profile = JSON.parse(savedProfileStr);
          if (profile.formData?.linkedin) {
            setLinkedinUser(profile.formData.linkedin);
          }
          if (profile.linkedin_stats) {
            setLinkedinScore(profile.linkedin_stats.score || 92);
            setLinkedinQuote(`"${profile.linkedin_stats.realName} has a '${profile.linkedin_stats.score > 90 ? 'Visionary' : 'Strong Expert'}' presence in full stack ecosystems."`);
          }
        } catch (e) {
          console.error("Failed to parse saved user profile data", e);
        }
      }
    }

    // Check localStorage integrations
    const localGithub = localStorage.getItem('devdna_github_user');
    const localGithubStats = localStorage.getItem('devdna_github_stats');
    if (localGithub) {
      setGithubUser(localGithub);
      setGithubConnected(true);
      if (localGithubStats) {
        try {
          const stats = JSON.parse(localGithubStats);
          setGithubStars(stats.repoStats?.totalStars?.toLocaleString() || '1.2k');
          setGithubForks(stats.repoStats?.totalForks?.toLocaleString() || '428');
        } catch (e) {}
      }
    }

    const localLeetcode = localStorage.getItem('devdna_leetcode_user');
    const localLeetcodeStats = localStorage.getItem('devdna_leetcode_stats');
    if (localLeetcode) {
      setLeetcodeUser(localLeetcode);
      setLeetcodeConnected(true);
      if (localLeetcodeStats) {
        try {
          const stats = JSON.parse(localLeetcodeStats);
          setLeetcodeSolved({
            total: stats.solved?.total || 712,
            easy: stats.solved?.easy || 452,
            medium: stats.solved?.medium || 218,
            hard: stats.solved?.hard || 42
          });
          setLeetcodeStreak(stats.calendar?.streak || 42);
        } catch (e) {}
      }
    }

    const localLinkedin = localStorage.getItem('devdna_linkedin_user');
    const localLinkedinStats = localStorage.getItem('devdna_linkedin_stats');
    if (localLinkedin) {
      setLinkedinUser(localLinkedin);
      setLinkedinConnected(true);
      if (localLinkedinStats) {
        try {
          const stats = JSON.parse(localLinkedinStats);
          setLinkedinScore(stats.score || 92);
          setLinkedinQuote(`"${stats.realName} has a '${stats.positioning || 'Strong Expert'}' presence in the sector."`);
        } catch (e) {}
      }
    }

    // Fetch initial recommendations
    fetchAIRecommendations();
  }, [user]);

  const handleStartSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncStep(1);

    const interval = setInterval(() => {
      setSyncStep(prev => {
        if (prev < 4) return prev + 1;
        clearInterval(interval);
        setTimeout(() => {
          setIsSyncing(false);
          setSyncStep(0);
          fetchAIRecommendations();
        }, 1000);
        return prev;
      });
    }, 1200);
  };

  if (!isClient) return null;

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
          <Link href="/" style={{
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
            <span>Dashboard</span>
          </Link>
          
          <Link href="/skill-dna" style={{
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
            <Award size={18} />
            <span>Skill DNA</span>
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
            <GitBranch size={18} />
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
            <span>Integrations</span>
          </Link>
        </nav>

        {/* AI Insights Card at bottom of sidebar */}
        <div style={{
          background: '#ebdcb9',
          borderRadius: '16px',
          padding: '1.25rem',
          border: '1px solid #ebdcb9',
          marginBottom: '1rem',
          textAlign: 'left',
          position: 'relative'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c6847', letterSpacing: '0.05em' }}>AI INSIGHTS READY</span>
          <p style={{ fontSize: '0.8rem', color: '#584931', margin: '0.25rem 0 1rem 0', lineHeight: 1.4 }}>
            Your technical identity has evolved since last week.
          </p>
          <Link href="/skill-matrix" style={{
            display: 'block',
            width: '100%',
            backgroundColor: '#584931',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.6rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'center',
            textDecoration: 'none',
            transition: 'background-color 0.2s'
          }}>
            View Report
          </Link>
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
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8c9c94' }} />
              <input 
                type="text" 
                placeholder="Search developer DNA..." 
                style={{
                  padding: '0.5rem 1rem 0.5rem 2.2rem',
                  borderRadius: '20px',
                  border: '1px solid #e5e3dc',
                  backgroundColor: '#ffffff',
                  fontSize: '0.85rem',
                  width: '320px',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', position: 'relative' }}>
              <Bell size={18} />
              <span style={{ position: 'absolute', top: 0, right: 0, width: '6px', height: '6px', backgroundColor: '#ef4444', borderRadius: '50%' }}></span>
            </button>
            
            <button style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
              <Settings size={18} />
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
                {profileName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Profile Card Section */}
        <section style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '2.2rem',
          border: '1px solid #e5e3dc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {/* Avatar container with golden ring checkmark badge */}
            <div style={{ position: 'relative', width: '100px', height: '100px' }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '24px',
                border: '2px solid #d68200',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                backgroundColor: '#ffffff'
              }}>
                <Image 
                  src={avatarUrl} 
                  alt="James Profile Pic" 
                  width={90} 
                  height={90} 
                  style={{ borderRadius: '18px', objectFit: 'cover' }} 
                />
              </div>
              <div style={{
                position: 'absolute',
                bottom: '-4px',
                right: '-4px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#d68200',
                border: '2px solid #ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <Sparkles size={12} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <h2 className="serif" style={{ fontSize: '2.25rem', fontWeight: 500, color: 'var(--text-main)', margin: 0 }}>
                  {profileName}
                </h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{
                    backgroundColor: '#e3f0e8',
                    color: '#2e7559',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.6rem',
                    borderRadius: '20px',
                    letterSpacing: '0.02em'
                  }}>
                    LeetCode Guardian
                  </span>
                  <span style={{
                    backgroundColor: '#f5ece3',
                    color: '#a3724c',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.6rem',
                    borderRadius: '20px',
                    letterSpacing: '0.02em'
                  }}>
                    OSS Contributor
                  </span>
                </div>
              </div>
              
              <p style={{ fontSize: '1.15rem', color: 'var(--accent-green)', fontWeight: 500, margin: 0 }}>
                {headline}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/analyze" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--accent-green)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '20px',
              padding: '0.6rem 1.2rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
              boxShadow: '0 4px 10px rgba(46, 117, 89, 0.15)'
            }}>
              <Edit2 size={14} />
              <span>Edit Profile</span>
            </Link>

            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#ffffff',
              color: 'var(--text-main)',
              border: '1px solid #e5e3dc',
              borderRadius: '20px',
              padding: '0.6rem 1.2rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <Download size={14} />
              <span>Download CV</span>
            </button>
          </div>
        </section>

        {/* Row 2: DNA Helix & Career Trajectory Grid */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '2rem'
        }}>
          {/* Card 1: Technical DNA Helix */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '2rem',
            border: '1px solid #e5e3dc',
            boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}>
            {/* Top Right Rank */}
            <div style={{ position: 'absolute', top: '2rem', right: '2rem', textAlign: 'right' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-green)', lineHeight: 1 }}>Top 5%</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '0.2rem' }}>ALGORITHMIC RANK</div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 className="serif" style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>Technical DNA Helix</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Genetic mapping of engineering strengths</p>
            </div>

            {/* Helix Visual and Metrics Split */}
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flex: 1 }}>
              {/* Animated Double Helix SVG */}
              <div style={{ flex: 1, height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <svg width="220" height="200" viewBox="0 0 220 200">
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4a7c59" />
                      <stop offset="100%" stopColor="#8ebd9b" />
                    </linearGradient>
                    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8c7853" />
                      <stop offset="100%" stopColor="#c5b290" />
                    </linearGradient>
                  </defs>
                  
                  {/* Drawing Helix strands */}
                  <g style={{ transform: 'translate(10px, 0)' }}>
                    {Array.from({ length: 11 }).map((_, idx) => {
                      const y = 20 + idx * 16;
                      const offset = idx * 0.55;
                      return (
                        <g key={idx} className="helix-rung">
                          {/* Connection line */}
                          <line 
                            x1={100 + Math.sin(offset) * 45} 
                            y1={y} 
                            x2={100 - Math.sin(offset) * 45} 
                            y2={y} 
                            stroke="#e5e3dc" 
                            strokeWidth="2" 
                          />
                          {/* Left Strand Node */}
                          <circle 
                            cx={100 + Math.sin(offset) * 45} 
                            cy={y} 
                            r="5" 
                            fill="url(#grad1)" 
                          />
                          {/* Right Strand Node */}
                          <circle 
                            cx={100 - Math.sin(offset) * 45} 
                            cy={y} 
                            r="5" 
                            fill="url(#grad2)" 
                          />
                        </g>
                      );
                    })}
                  </g>
                </svg>
              </div>

              {/* Core Cards Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '240px' }}>
                <div style={{ background: '#faf9f5', borderRadius: '16px', padding: '1rem', border: '1px solid #e5e3dc' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>CORE STACK</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>TypeScript / Go</div>
                </div>
                
                <div style={{ background: '#faf9f5', borderRadius: '16px', padding: '1rem', border: '1px solid #e5e3dc' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>TOTAL CONTRIBUTIONS</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>2,482 commits</div>
                </div>

                <div style={{ background: '#faf9f5', borderRadius: '16px', padding: '1rem', border: '1px solid #e5e3dc' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>PRIMARY DOMAIN</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>AI Infrastructure</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Career Trajectory */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '2rem',
            border: '1px solid #e5e3dc',
            boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 className="serif" style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>Career Trajectory</h3>
            </div>

            {/* Trajectory Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, position: 'relative', paddingLeft: '2rem' }}>
              {/* Timeline Connector Line */}
              <div style={{
                position: 'absolute',
                left: '9px',
                top: '10px',
                bottom: '10px',
                width: '2px',
                backgroundColor: '#efeadd'
              }}></div>

              {/* Node 1 */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '-26px',
                  top: '2px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-green)',
                  border: '4px solid #ffffff',
                  boxShadow: '0 0 0 2px var(--accent-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}></div>
                <div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-green)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>FUTURE MILESTONE (AI PREDICTION)</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.1rem' }}>Chief Architect</div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Predicted for Q3 2026</span>
                </div>
              </div>

              {/* Node 2 */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '-25px',
                  top: '2px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  border: '3px solid var(--accent-green)'
                }}></div>
                <div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>CURRENT ROLE</span>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.1rem' }}>Senior Dev at Stripe</div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Jan 2022 &mdash; Present</span>
                </div>
              </div>

              {/* Node 3 */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '-24px',
                  top: '4px',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#c5b290'
                }}></div>
                <div style={{ marginTop: '0.1rem' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>SDE at Google</div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>June 2019 &mdash; Dec 2021</span>
                </div>
              </div>

              {/* Button */}
              <div style={{ marginTop: 'auto' }}>
                <Link href="/skill-matrix" style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#faf9f5',
                  color: 'var(--text-main)',
                  border: '1px solid #e5e3dc',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}>
                  <span>View Full History</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Row 3: Connected Integration Cards */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2rem'
        }}>
          {/* GitHub Status Card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '1.75rem',
            border: '1px solid #e5e3dc',
            boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#24292e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </div>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>GitHub</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: githubConnected ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                {githubConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Contribution Mini Heatmap Graphic */}
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                Contribution Heatmap
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[3, 2, 4, 1, 3, 2, 4, 2, 3, 1, 2].map((lvl, idx) => {
                  const colors = ['#e5e3dc', '#8ebd9b', '#629e73', '#3e7d52', '#225d36'];
                  return (
                    <div 
                      key={idx} 
                      style={{ 
                        flex: 1, 
                        height: '32px', 
                        borderRadius: '4px', 
                        backgroundColor: colors[lvl] 
                      }} 
                    />
                  );
                })}
              </div>
            </div>

            {/* Top Repository */}
            <div style={{ background: '#faf9f5', borderRadius: '12px', padding: '0.85rem', border: '1px solid #e5e3dc' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>TOP REPO</span>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.1rem', wordBreak: 'break-all' }}>
                distributed-vector-mesh
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>★ {githubStars}</span>
                <span>⑂ {githubForks}</span>
              </div>
            </div>
          </div>

          {/* LeetCode Status Card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '1.75rem',
            border: '1px solid #e5e3dc',
            boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#d68200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}>LC</div>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>LeetCode</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: leetcodeConnected ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                {leetcodeConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Solve Progress Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                <span>Easy: {leetcodeSolved.easy}</span>
                <span>Med: {leetcodeSolved.medium}</span>
                <span>Hard: {leetcodeSolved.hard}</span>
              </div>
              
              <div style={{ width: '100%', height: '10px', backgroundColor: '#efeadd', borderRadius: '5px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${(leetcodeSolved.easy / leetcodeSolved.total) * 100}%`, height: '100%', backgroundColor: '#2e7559' }}></div>
                <div style={{ width: `${(leetcodeSolved.medium / leetcodeSolved.total) * 100}%`, height: '100%', backgroundColor: '#c5b290' }}></div>
                <div style={{ width: `${(leetcodeSolved.hard / leetcodeSolved.total) * 100}%`, height: '100%', backgroundColor: '#c2584f' }}></div>
              </div>
            </div>

            {/* Current Streak */}
            <div style={{ background: '#faf9f5', borderRadius: '12px', padding: '0.85rem', border: '1px solid #e5e3dc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>CURRENT STREAK</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.1rem' }}>
                  {leetcodeStreak} Days
                </div>
              </div>
              <div style={{ fontSize: '1.5rem' }}>🔥</div>
            </div>
          </div>

          {/* LinkedIn Status Card */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '1.75rem',
            border: '1px solid #e5e3dc',
            boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#0a66c2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff'
                }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </div>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>LinkedIn</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: linkedinConnected ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                {linkedinConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Narrative Score Progress Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                <span>Narrative Score</span>
                <span>{linkedinScore}/100</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#efeadd', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${linkedinScore}%`, height: '100%', backgroundColor: 'var(--accent-green)', borderRadius: '3px' }}></div>
              </div>
            </div>

            {/* Quote container */}
            <div style={{ 
              background: '#fcfcfc', 
              borderRadius: '12px', 
              padding: '0.75rem 0.85rem', 
              border: '1px solid #e5e3dc',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
              lineHeight: '1.35',
              minHeight: '42px',
              display: 'flex',
              alignItems: 'center'
            }}>
              {linkedinQuote}
            </div>

            {/* Refresh Insight Button */}
            <button style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-green)',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textAlign: 'center',
              cursor: 'pointer',
              textTransform: 'uppercase',
              marginTop: 'auto',
              padding: '0.2rem'
            }}>
              Refresh Insight
            </button>
          </div>
        </section>

        {/* Row 3.5: AI Insights Section */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <Brain size={24} style={{ color: 'var(--accent-green)' }} />
            <h3 className="serif" style={{ fontSize: '1.6rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
              AI Trajectory Insights
            </h3>
            <span style={{
              backgroundColor: '#ebdcb9',
              color: '#584931',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              FAISS Semantics Loaded
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0 0.5rem 0' }}>
            Multi-profile vector embedding analysis mapping GitHub, LeetCode, and LinkedIn footprints into a unified trajectory.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem',
            position: 'relative'
          }}>
            {/* Recommended Role Card */}
            <div className="recommendation-card" style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '2rem',
              border: '1px solid #e5e3dc',
              boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '260px',
              boxSizing: 'border-box',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.2s'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, rgba(46, 117, 89, 0.1) 0%, rgba(46, 117, 89, 0) 100%)',
                borderBottomLeftRadius: '100%'
              }}></div>
              
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(46, 117, 89, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-green)'
                  }}>
                    <Target size={18} />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Recommended Role</span>
                </div>

                {isLoadingRecs ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '1rem 0' }}>
                    <div style={{ height: '24px', width: '80%', backgroundColor: '#eee', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
                    <div style={{ height: '14px', width: '60%', backgroundColor: '#eee', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
                  </div>
                ) : (
                  <div>
                    <h4 className="serif" style={{ fontSize: '1.6rem', fontWeight: 500, color: 'var(--text-main)', margin: '0 0 0.5rem 0', lineHeight: 1.25 }}>
                      {aiRecs?.recommended_role || 'Full Stack + AI Engineer'}
                    </h4>
                    {aiRecs?.closest_matches && aiRecs.closest_matches.length > 0 && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                        FAISS Match: <strong style={{ color: 'var(--text-main)' }}>{aiRecs.closest_matches[0].name}</strong> (dist: {aiRecs.closest_matches[0].distance.toFixed(3)})
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div style={{
                borderTop: '1px solid #efeadd',
                paddingTop: '1rem',
                marginTop: '1.5rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                lineHeight: 1.4
              }}>
                Targeting enterprise platforms, full stack integration pipelines, and custom AI agent architectures.
              </div>
            </div>

            {/* Suggested Projects Card */}
            <div className="recommendation-card" style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '2rem',
              border: '1px solid #e5e3dc',
              boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '260px',
              boxSizing: 'border-box',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.2s'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(197, 178, 144, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#8c7853'
                  }}>
                    <BookOpen size={18} />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Suggested Projects</span>
                </div>

                {isLoadingRecs ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', margin: '0.5rem 0' }}>
                    <div style={{ height: '14px', width: '90%', backgroundColor: '#eee', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
                    <div style={{ height: '14px', width: '80%', backgroundColor: '#eee', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
                    <div style={{ height: '14px', width: '85%', backgroundColor: '#eee', borderRadius: '4px', animation: 'pulse 1.5s infinite' }}></div>
                  </div>
                ) : (
                  <ul style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {(aiRecs?.suggested_projects || [
                      "AI Resume Analyzer with Vector Embeddings",
                      "Real-time Distributed Event Hub",
                      "Automated DevOps Pipeline Orchestrator"
                    ]).map((project, idx) => (
                      <li key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500, lineHeight: 1.35 }}>
                        {project}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '1rem' }}>
                * Build these next to optimize GitHub and portfolio trajectory.
              </span>
            </div>

            {/* Missing Skills Card */}
            <div className="recommendation-card" style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              padding: '2rem',
              border: '1px solid #e5e3dc',
              boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '260px',
              boxSizing: 'border-box',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.2s'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(194, 88, 79, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#c2584f'
                  }}>
                    <Terminal size={18} />
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Missing Skills</span>
                </div>

                {isLoadingRecs ? (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '0.5rem 0' }}>
                    <div style={{ height: '24px', width: '60px', backgroundColor: '#eee', borderRadius: '12px', animation: 'pulse 1.5s infinite' }}></div>
                    <div style={{ height: '24px', width: '80px', backgroundColor: '#eee', borderRadius: '12px', animation: 'pulse 1.5s infinite' }}></div>
                    <div style={{ height: '24px', width: '70px', backgroundColor: '#eee', borderRadius: '12px', animation: 'pulse 1.5s infinite' }}></div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {(aiRecs?.missing_skills || ["Docker", "Kubernetes", "System Design", "AWS Deployments"]).map((skill, idx) => (
                      <span key={idx} style={{
                        backgroundColor: '#faf9f5',
                        color: 'var(--text-main)',
                        border: '1px solid #e5e3dc',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        padding: '0.35rem 0.8rem',
                        borderRadius: '20px',
                        display: 'inline-block'
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{
                backgroundColor: '#fdfcf7',
                border: '1px solid #ebdcb9',
                borderRadius: '12px',
                padding: '0.75rem',
                marginTop: '1.25rem',
                fontSize: '0.75rem',
                color: '#584931',
                lineHeight: 1.35
              }}>
                Acquiring these missing credentials raises your compatibility index by <strong>+18.4%</strong>.
              </div>
            </div>

          {!isPremium && (
            <div style={{
              position: 'absolute',
              top: '-15px',
              left: '-15px',
              right: '-15px',
              bottom: '-15px',
              backgroundColor: 'rgba(246, 245, 240, 0.45)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 20,
              padding: '2rem',
              textAlign: 'center'
            }}>
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                padding: '2.5rem 3rem',
                maxWidth: '460px',
                boxShadow: '0 20px 50px rgba(45, 55, 50, 0.08)',
                border: '1px solid #ebdcb9',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.25rem'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(197, 178, 144, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#8c7853'
                }}>
                  <Lock size={28} />
                </div>
                
                <div>
                  <h4 className="serif" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>
                    Premium Trajectory Insights
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
                    Unlock full semantic matching against enterprise developer profiles, personalized project paths, and continuous gap mapping.
                  </p>
                </div>

                <button 
                  onClick={() => setIsPremium(true)}
                  style={{
                    backgroundColor: 'var(--accent-green)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.75rem 2rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(46, 117, 89, 0.2)',
                    transition: 'all 0.2s',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginTop: '0.5rem'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#235943'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-green)'}
                >
                  Upgrade to Premium
                </button>
              </div>
            </div>
          )}
        </div>
        </section>

        {/* Row 4: Bottom Grid */}
        <section style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem'
        }}>
          {/* Analyze New Resume */}
          <div style={{
            background: 'linear-gradient(135deg, #406d57 0%, #294c3c 100%)',
            borderRadius: '24px',
            padding: '2.5rem',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '180px',
            boxSizing: 'border-box'
          }}>
            <div>
              <h3 className="serif" style={{ fontSize: '1.75rem', fontWeight: 500, margin: '0 0 0.5rem 0' }}>Analyze New Resume</h3>
              <p style={{ fontSize: '0.85rem', color: '#bce4ce', margin: 0, lineHeight: 1.4 }}>
                Upload your latest PDF to recalibrate your Technical DNA mapping.
              </p>
            </div>
            <div>
              <Link href="/analyze" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#ffffff',
                color: '#294c3c',
                border: 'none',
                borderRadius: '8px',
                padding: '0.6rem 1.2rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}>
                <FileUp size={14} />
                <span>Choose File</span>
              </Link>
            </div>
          </div>

          {/* Refresh Social Intel */}
          <div style={{
            background: 'linear-gradient(135deg, #7c6847 0%, #584931 100%)',
            borderRadius: '24px',
            padding: '2.5rem',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '180px',
            boxSizing: 'border-box'
          }}>
            <div>
              <h3 className="serif" style={{ fontSize: '1.75rem', fontWeight: 500, margin: '0 0 0.5rem 0' }}>
                {isSyncing ? 'Recrawling Ecosystem...' : 'Refresh Social Intel'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#dfd2ba', margin: 0, lineHeight: 1.4 }}>
                {isSyncing 
                  ? syncStep === 1 ? 'Fetching repository updates...'
                    : syncStep === 2 ? 'Analyzing LeetCode milestones...'
                    : syncStep === 3 ? 'Recalibrating narrative graph...'
                    : 'Finalizing synchronization...'
                  : 'Recrawl your GitHub and LeetCode activity for real-time updates.'
                }
              </p>
            </div>
            <div>
              <button 
                onClick={handleStartSync}
                disabled={isSyncing}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#ffffff',
                  color: '#584931',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.6rem 1.2rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: isSyncing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <RefreshCw size={14} className={isSyncing ? 'spin-anim' : ''} />
                <span>{isSyncing ? 'Syncing...' : 'Start Sync'}</span>
              </button>
            </div>
          </div>
        </section>

      </main>

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin-anim {
          animation: spin 1s linear infinite;
        }
        .helix-rung {
          animation: rungPulse 3s ease-in-out infinite;
        }
        @keyframes rungPulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .recommendation-card:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 12px 30px rgba(0,0,0,0.04) !important;
        }
      `}</style>

    </div>
  );
}
