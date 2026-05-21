"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowRight, Share2, Printer, Sparkles, Lock, Crown,
  Clock, ShieldCheck
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const UPI_ID = '8077213785@superyes';
const PREMIUM_PRICE = 9;
const SESSION_DURATION = 30;

export default function Home() {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [utrInput, setUtrInput] = useState('');
  const [sessionTimer, setSessionTimer] = useState(SESSION_DURATION);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (user) {
      const flag = localStorage.getItem(`devdna_premium_${user.email}`);
      if (flag === 'true') setIsPremium(true);
    }
  }, [user]);

  useEffect(() => {
    if (!showPaymentModal) return;
    setSessionTimer(SESSION_DURATION);
    const interval = setInterval(() => {
      setSessionTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showPaymentModal]);

  const handleVerifyPayment = () => {
    if (!utrInput.trim()) return;
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setIsPremium(true);
      if (user) localStorage.setItem(`devdna_premium_${user.email}`, 'true');
      setShowPaymentModal(false);
      setUtrInput('');
    }, 2000);
  };

  const amount = selectedPlan === 'monthly' ? 19 : 228;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=${UPI_ID}%26pn=DevDNA%20AI%26am=${amount}%26cu=INR%26tn=DevDNA%20Premium%20${selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'}`;

  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <div className="hero-tag">
          <Sparkles size={14} /> Intelligence-Based on Model, Not Will-o-Wisps
        </div>
        <h1 className="serif">
          Understand Your <br />
          <span className="highlight">Developer DNA</span>
        </h1>
        <p>
          The world's first trajectory intelligence platform. AI on your precisely, predict
          career milestones, and master the technical stack of the future using deep
          learning profile analysis.
        </p>
        <div className="hero-actions">
          {isPremium ? (
            <Link href="/analyze" className="btn-primary">
              Analyze Profile <ArrowRight size={16} />
            </Link>
          ) : (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="btn-primary"
              style={{ cursor: 'pointer' }}
            >
              <Lock size={16} /> Analyze Profile <ArrowRight size={16} />
            </button>
          )}
          <Link href="#ecosystem" className="btn-secondary">
            View Demo
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="stats">
        <div className="stat-item">
          <div className="stat-number">3</div>
          <div className="stat-label">LIVE INTEGRATIONS</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">6</div>
          <div className="stat-label">DATA SIGNALS INGESTED</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">ML</div>
          <div className="stat-label">POWERED ANALYSIS</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">&lt;3s</div>
          <div className="stat-label">REAL-TIME SYNC</div>
        </div>
      </section>

      {/* Ecosystem Ingestion */}
      <section id="ecosystem" className="ecosystem" style={{ padding: '6rem 2rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'center', scrollMarginTop: '5rem' }}>
        <h2 className="section-title serif" style={{ fontSize: '3.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>Native Ecosystem Ingestion</h2>
        <p className="section-subtitle" style={{ maxWidth: '800px', margin: '0 auto 4rem', fontSize: '1.1rem', color: '#4a4a4a', lineHeight: 1.6 }}>
          Direct synchronization with the platforms where you build and solve. We translate raw activity into architectural signals.
        </p>

        <div className="ecosystem-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', textAlign: 'left' }}>
          {/* Card 1 */}
          <div className="ecosystem-card" style={{ background: '#f8f7f2', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '3rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden' }}>
            <div style={{ margin: '-3rem -3rem 0 -3rem', height: '140px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border-color)' }}>
              <Image src="/github_logo.png" alt="GitHub Logo" width={180} height={50} style={{ objectFit: 'contain' }} />
            </div>
            <h3 className="serif" style={{ fontSize: '2rem', fontWeight: 400, color: 'var(--text-main)', lineHeight: 1.2 }}>Automated Repository<br/>Mapping</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1.05rem', marginBottom: '1rem' }}>
              DevDNA maps your technical DNA by analyzing repository structures, commit patterns, and documentation styles directly from GitHub.
            </p>



            <div style={{ marginBottom: '1.5rem' }}>
              <Link href="/github" className="btn-secondary" style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.6rem', 
                borderColor: '#24292e',
                color: '#24292e',
                padding: '0.6rem 1.2rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                borderRadius: '8px',
                background: 'rgba(36, 41, 46, 0.05)',
                transition: 'all 0.2s ease',
                textDecoration: 'none'
              }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>Connect GitHub Profile</span>
              </Link>
            </div>
            <div style={{ marginTop: 'auto', height: '280px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <Image src="/repository_mapping.png" alt="GitHub Integration Mockup" width={600} height={400} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
            </div>
          </div>

          {/* Card 2 */}
          <div className="ecosystem-card" style={{ background: '#f8f7f2', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '3rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden' }}>
            <div style={{ margin: '-3rem -3rem 0 -3rem', height: '140px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border-color)' }}>
              <Image src="/leetcode_logo_light.png" alt="LeetCode Logo" width={180} height={50} style={{ objectFit: 'contain' }} />
            </div>
            <h3 className="serif" style={{ fontSize: '2rem', fontWeight: 400, color: 'var(--text-main)', lineHeight: 1.2 }}>Algorithmic Skill<br/>Synthesis</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1.05rem', marginBottom: '1rem' }}>
              The platform ingests signals from LeetCode and other coding environments to quantify problem-solving speed and algorithmic technical mastery. We calculate your complexity efficiency and pattern recognition scores in real-time.
            </p>



            <div style={{ marginBottom: '1.5rem' }}>
              <Link href="/leetcode" className="btn-secondary" style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.6rem', 
                borderColor: '#ffa116',
                color: '#d68200',
                padding: '0.6rem 1.2rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                borderRadius: '8px',
                background: 'rgba(255, 161, 22, 0.05)',
                transition: 'all 0.2s ease',
                textDecoration: 'none'
              }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ color: '#ffa116' }}>
                  <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.074-1.954l-5.63-6.17c-.208-.227-.376-.484-.505-.765l2.062-2.208c.54-.54.54-1.414.074-1.954l-2.396-2.392a1.374 1.374 0 0 0-1.016-.438h-.038zm-1.802 11.238l-2.072 2.217a1.37 1.37 0 0 0 .505 2.133l5.63 6.17c.54.54 1.414.54 1.954 0l2.396-2.392c.54-.54.54-1.414 0-1.954l-5.63-6.17c-.217-.236-.505-.424-.812-.537l-.039-.019-.048-.009h-.038a1.37 1.37 0 0 0-.859.575z"/>
                </svg>
                <span>Connect LeetCode Profile</span>
              </Link>
            </div>
            <div style={{ marginTop: 'auto', height: '280px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEVm10itaY4iVE9Pxbf7Kk25XbJAwsrBM5-Q&s" alt="LeetCode Integration Mockup" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
            </div>
          </div>

          {/* Card 3 - Resume Ingestion */}
          <div className="ecosystem-card" style={{ background: '#f8f7f2', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '3rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden' }}>
            <div className="logo-slider-container">
              <div className="logo-slide logo-slide-1">
                <Image src="/logo_overleaf.png" alt="Overleaf Logo" width={180} height={50} style={{ objectFit: 'contain' }} />
              </div>
              <div className="logo-slide logo-slide-2">
                <Image src="/logo_resume_io.png" alt="Resume.io Logo" width={180} height={50} style={{ objectFit: 'contain' }} />
              </div>
              <div className="logo-slide logo-slide-3">
                <Image src="/logo_teal.png" alt="Teal Logo" width={180} height={50} style={{ objectFit: 'contain' }} />
              </div>
            </div>
            <h3 className="serif" style={{ fontSize: '2rem', fontWeight: 400, color: 'var(--text-main)', lineHeight: 1.2 }}>Automated Resume<br/>Mapping</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1.05rem', marginBottom: '1rem' }}>
              Upload your career resume to automatically extract structured technical skills, project logs, and educational credentials. The platform calibrates your history to match top-tier engineering roles instantly.
            </p>
            <div style={{ marginBottom: '1.5rem' }}>
              <Link href="/resume" className="btn-secondary" style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.6rem', 
                borderColor: '#10b981',
                color: '#059669',
                padding: '0.6rem 1.2rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.05)',
                transition: 'all 0.2s ease',
                textDecoration: 'none'
              }}>
                <span>Upload & Ingest Resume</span>
              </Link>
            </div>
            <div style={{ marginTop: 'auto', height: '280px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <Image src="/resume_anim.gif" alt="Resume Builder Ingestion Mockup" width={600} height={400} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} unoptimized />
            </div>
          </div>

          {/* Card 4 - Internship Ingestion */}
          <div className="ecosystem-card" style={{ background: '#f8f7f2', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '3rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden' }}>
            <div style={{ margin: '-3rem -3rem 0 -3rem', height: '140px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border-color)' }}>
              <Image src="/logo_linkedin.png" alt="LinkedIn Logo" width={240} height={90} style={{ objectFit: 'contain' }} />
            </div>
            <h3 className="serif" style={{ fontSize: '2rem', fontWeight: 400, color: 'var(--text-main)', lineHeight: 1.2 }}>Internship & Project<br/>Telemetry</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1.05rem', marginBottom: '1rem' }}>
              Verify and analyze your summer internships, industrial training programs, and project milestones. Calibrate your performance relative to industry metrics to showcase real-world execution velocity.
            </p>
            <div style={{ marginBottom: '1.5rem' }}>
              <Link href="/linkedin" className="btn-secondary" style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.6rem', 
                borderColor: '#3b82f6',
                color: '#1d4ed8',
                padding: '0.6rem 1.2rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                borderRadius: '8px',
                background: 'rgba(59, 130, 246, 0.05)',
                transition: 'all 0.2s ease',
                textDecoration: 'none'
              }}>
                <span>Calibrate Project Data</span>
              </Link>
            </div>
            <div style={{ marginTop: 'auto', height: '280px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <Image src="/internship_banner.png" alt="Internship Tracking Mockup" width={600} height={400} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
            </div>
          </div>
        </div>
      </section>

      {/* DevDNA Helix Framework Concept */}
      <section className="dna-concept" style={{
        padding: '6rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
        borderTop: '1px solid var(--border-color)',
      }}>
        <div className="section-header" style={{ marginBottom: '4rem' }}>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--accent-green)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '0.5rem'
          }}>
            THE CORE METAPHOR
          </span>
          <h2 className="section-title serif" style={{ fontSize: '3.5rem', marginBottom: '1rem', color: '#1a1a1a' }}>
            The DevDNA Helix Framework
          </h2>
          <p className="section-subtitle" style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1.15rem', color: '#4a4a4a', lineHeight: 1.6 }}>
            Our platform synthesizes distinct signals across your entire online workspace to build a multi-dimensional, live representation of your professional profile.
          </p>
        </div>

        <div className="concept-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr',
          gap: '4rem',
          alignItems: 'center',
          textAlign: 'left'
        }}>
          {/* Image side */}
          <div style={{
            background: '#ffffff',
            padding: '1.5rem',
            borderRadius: '32px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.03)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Image 
              src="/dna_concept.jpg" 
              alt="DevDNA Platform Concept Double Helix" 
              width={500} 
              height={500} 
              style={{
                borderRadius: '20px',
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
          </div>

          {/* Details side */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 className="serif" style={{ fontSize: '2.25rem', color: 'var(--text-main)', margin: 0, fontWeight: 500 }}>
              Unified Technical Synthesis
            </h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1.05rem', margin: 0 }}>
              Just like biological DNA, your engineering competency is shaped by distinct markers. DevDNA maps these individual sources to evaluate and recommend target growth plans:
            </p>

            <div className="concept-items-grid" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.25rem',
              marginTop: '1rem'
            }}>
              {[
                { name: 'LeetCode', desc: 'Problem Solving DNA', color: '#ffa116' },
                { name: 'GitHub', desc: 'Version Control & Style', color: '#24292e' },
                { name: 'TensorFlow', desc: 'Machine Learning Capability', color: '#ff6f00' },
                { name: 'HackerRank', desc: 'Syntax & Coding Practice', color: '#2ec866' },
                { name: 'Resume', desc: 'Historical Summary Data', color: '#4a90e2' },
                { name: 'LinkedIn', desc: 'Professional Networking Signal', color: '#0077b5' },
                { name: 'Projects', desc: 'Real-world Execution Proof', color: 'var(--accent-green)' },
                { name: 'Certifications', desc: 'Structured Continuous Learning', color: '#9013fe' }
              ].map((item, idx) => (
                <div key={idx} style={{
                  padding: '1rem 1.25rem',
                  background: '#f8f7f2',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: item.color,
                    flexShrink: 0
                  }}></div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>{item.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-col" style={{ gridColumn: 'span 2' }}>
            <div className="logo footer-logo">
              <Image src="/logo.png" alt="DevDNA AI Logo" width={180} height={45} />
            </div>
            <p className="footer-desc">
              Empowering the next generation of software architects with data-driven career intelligence and predictive growth modeling.
            </p>
            <div className="footer-socials">
              <a href="#" className="social-icon"><Share2 size={16} /></a>
              <a href="#" className="social-icon"><Printer size={16} /></a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Platform</h4>
            <ul className="footer-links">
              <li><Link href="#">Dashboard</Link></li>
              <li><Link href="#">Synthesis</Link></li>
              <li><Link href="#">Predictive</Link></li>
              <li><Link href="#">Team Matrix</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <ul className="footer-links">
              <li><Link href="#">Documentation</Link></li>
              <li><Link href="#">API Reference</Link></li>
              <li><Link href="#">System Status</Link></li>
              <li><Link href="#">Help Center</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul className="footer-links">
              <li><Link href="#">About Us</Link></li>
              <li><Link href="#">Careers</Link></li>
              <li><Link href="#">Blog</Link></li>
              <li><Link href="#">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 DevDNA AI Intelligence. All rights reserved.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', background: 'var(--accent-green)', borderRadius: '50%', display: 'inline-block' }}></span>
            SYSTEMS OPERATIONAL
          </p>
        </div>
      </footer>
      {/* Payment Gateway Modal */}
      {showPaymentModal && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(30, 29, 26, 0.65)',
            backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10000, padding: '1rem',
          }}
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff', borderRadius: '24px',
              width: '100%', maxWidth: '420px', maxHeight: '90vh',
              overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
              position: 'relative',
              animation: 'modalSlideUp 0.35s ease-out',
            }}
          >
            <button
              onClick={() => setShowPaymentModal(false)}
              style={{
                position: 'absolute', top: '1rem', right: '1rem',
                border: 'none', background: 'none', fontSize: '1.3rem',
                color: '#94a3b8', cursor: 'pointer', zIndex: 1,
                width: '28px', height: '28px', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%', transition: 'all 0.2s',
              }}
            >
              ×
            </button>

            <div style={{ textAlign: 'center', padding: '2rem 2rem 1.5rem' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem',
              }}>
                <Lock size={24} style={{ color: '#2563eb' }} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.4rem', fontFamily: 'var(--font-serif, Georgia, serif)' }}>
                Premium Feature Access
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
                This premium tool requires active access.
              </p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                marginTop: '0.75rem', padding: '0.3rem 0.8rem', borderRadius: '20px',
                border: '1px solid #fecaca', backgroundColor: '#fef2f2',
                color: '#dc2626', fontSize: '0.78rem', fontWeight: 600,
              }}>
                <Clock size={13} />
                Session Expires in: {sessionTimer}s
              </div>
            </div>

            {/* Plan Cards */}
            <div style={{ padding: '0 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Monthly Card */}
              <div 
                onClick={() => setSelectedPlan('monthly')}
                style={{
                  backgroundColor: selectedPlan === 'monthly' ? '#f0fdf4' : '#f8fafc',
                  borderRadius: '14px',
                  padding: '1rem 1.25rem',
                  border: selectedPlan === 'monthly' ? '2px solid #22c55e' : '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input 
                    type="radio" 
                    checked={selectedPlan === 'monthly'} 
                    onChange={() => setSelectedPlan('monthly')}
                    style={{ accentColor: '#22c55e', cursor: 'pointer' }}
                  />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Monthly Access</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Unlocks all premium features</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>₹19</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>/mo</span>
                </div>
              </div>

              {/* Yearly Card */}
              <div 
                onClick={() => setSelectedPlan('yearly')}
                style={{
                  backgroundColor: selectedPlan === 'yearly' ? '#f0fdf4' : '#f8fafc',
                  borderRadius: '14px',
                  padding: '1rem 1.25rem',
                  border: selectedPlan === 'yearly' ? '2px solid #22c55e' : '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Save badge */}
                <div style={{
                  position: 'absolute',
                  top: '0px',
                  right: '0px',
                  backgroundColor: '#f59e0b',
                  color: '#ffffff',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '0 0 0 8px',
                  textTransform: 'uppercase'
                }}>
                  Best Value
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input 
                    type="radio" 
                    checked={selectedPlan === 'yearly'} 
                    onChange={() => setSelectedPlan('yearly')}
                    style={{ accentColor: '#22c55e', cursor: 'pointer' }}
                  />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Yearly Premium</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>12 months full access</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', marginRight: '40px' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>₹228</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>/yr</span>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div style={{ textAlign: 'center', padding: '1.5rem 2rem' }}>
              <div style={{
                display: 'inline-block', padding: '12px', borderRadius: '16px',
                border: '2px dashed #cbd5e1', backgroundColor: '#ffffff',
              }}>
                <img src={qrUrl} alt="UPI Payment QR Code" width={200} height={200} style={{ display: 'block', borderRadius: '8px' }} />
              </div>
              <p style={{ margin: '0.75rem 0 0', fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
                Scan QR to pay <strong style={{ color: '#0f172a' }}>₹{amount}</strong> to
                <br />
                <strong style={{ color: '#2563eb' }}>{UPI_ID}</strong>
              </p>
            </div>

            <div style={{ padding: '0 2rem 1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                Enter UPI Transaction ID (UTR)
              </label>
              <input
                type="text" value={utrInput}
                onChange={(e) => setUtrInput(e.target.value)}
                placeholder="e.g. 4028391..."
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: '10px',
                  border: '1px solid #d1d5db', fontSize: '0.88rem', color: '#0f172a',
                  outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#60a5fa'; e.target.style.boxShadow = '0 0 0 3px rgba(96, 165, 250, 0.15)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                onClick={handleVerifyPayment}
                disabled={verifying || !utrInput.trim()}
                style={{
                  width: '100%', marginTop: '0.75rem', padding: '0.85rem',
                  borderRadius: '12px', border: 'none',
                  background: utrInput.trim() ? 'linear-gradient(135deg, #34d399 0%, #10b981 100%)' : '#e2e8f0',
                  color: utrInput.trim() ? '#ffffff' : '#94a3b8',
                  fontSize: '0.95rem', fontWeight: 700,
                  cursor: utrInput.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  transition: 'all 0.2s',
                  boxShadow: utrInput.trim() ? '0 4px 15px rgba(16, 185, 129, 0.3)' : 'none',
                }}
              >
                {verifying ? (
                  <><span style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }}></span> Verifying...</>
                ) : (
                  <><ShieldCheck size={18} /> Verify & Unlock</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
