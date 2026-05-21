"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  LogOut, User as UserIcon, Sparkles, Menu, X, Award,
  Lock, Clock, ShieldCheck, ChevronRight, Crown, Zap
} from 'lucide-react';

// UPI Payment Config
const UPI_ID = '8077213785@superyes';
const PREMIUM_PRICE = 9;
const SESSION_DURATION = 30; // seconds

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [utrInput, setUtrInput] = useState('');
  const [sessionTimer, setSessionTimer] = useState(SESSION_DURATION);
  const [isPremium, setIsPremium] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Check premium status on mount
  useEffect(() => {
    if (user) {
      const premiumFlag = localStorage.getItem(`devdna_premium_${user.email}`);
      if (premiumFlag === 'true') setIsPremium(true);
    }
  }, [user]);

  // Scroll detection for navbar glass effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Session countdown timer
  useEffect(() => {
    if (!showPaymentModal) return;
    setSessionTimer(SESSION_DURATION);
    const interval = setInterval(() => {
      setSessionTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showPaymentModal]);

  const handleAnalyzeClick = useCallback((e: React.MouseEvent) => {
    if (!isPremium) {
      e.preventDefault();
      e.stopPropagation();
      setShowPaymentModal(true);
    }
  }, [isPremium]);

  const handleVerifyPayment = () => {
    if (!utrInput.trim()) return;
    setVerifying(true);
    // Simulate verification (in production, verify against backend)
    setTimeout(() => {
      setVerifying(false);
      setIsPremium(true);
      if (user) {
        localStorage.setItem(`devdna_premium_${user.email}`, 'true');
      }
      setShowPaymentModal(false);
      setUtrInput('');
    }, 2000);
  };

  const amount = selectedPlan === 'monthly' ? 19 : 228;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=${UPI_ID}%26pn=DevDNA%20AI%26am=${amount}%26cu=INR%26tn=DevDNA%20Premium%20${selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'}`;

  // Active link detection
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      <header
        className="header"
        style={{
          position: 'relative',
          transition: 'all 0.3s ease',
        }}
      >
        <Link href="/" className="logo" onClick={closeMobileMenu}>
          <Image src="/logo.png" alt="DevDNA AI Logo" width={180} height={45} priority />
        </Link>

        <nav className="nav" style={{ gap: '0.25rem' }}>
          {[
            { href: '/leetcode', label: 'LeetCode' },
            { href: '/github', label: 'GitHub' },
            { href: '/linkedin', label: 'Internships' },
            { href: '/resume', label: 'Resume' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link"
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 500,
                color: 'var(--text-muted)',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions" style={{ gap: '0.75rem' }}>
          {user ? (
            <>
              {/* Premium Badge */}
              {isPremium && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem 0.7rem',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                  color: '#78350f',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.03em',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
                }}>
                  <Crown size={11} /> PRO
                </div>
              )}

              {/* Analyze Profile Button - Locked/Unlocked */}
              <div style={{ position: 'relative' }}>
                {isPremium ? (
                  <Link
                    href="/analyze"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.55rem 1.25rem',
                      backgroundColor: 'var(--accent-green)',
                      color: '#fff',
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'all 0.2s',
                      boxShadow: '0 2px 12px rgba(46, 117, 89, 0.25)',
                    }}
                  >
                    <Sparkles size={14} /> Analyze Profile
                  </Link>
                ) : (
                  <button
                    onClick={handleAnalyzeClick}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.55rem 1.25rem',
                      backgroundColor: '#e5e3dc',
                      color: '#85785d',
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      border: '1px solid #d1cebf',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Lock size={14} /> Analyze Profile
                  </button>
                )}
              </div>

              {/* Profile Menu */}
              <div className="user-profile-menu" style={{ position: 'relative' }}>
                <button
                  onClick={toggleDropdown}
                  className="user-profile-trigger"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    background: scrolled ? 'rgba(239, 234, 221, 0.6)' : 'none',
                    border: scrolled ? '1px solid #e5e3dc' : '1px solid transparent',
                    cursor: 'pointer',
                    padding: '0.4rem 0.8rem 0.4rem 0.4rem',
                    borderRadius: '2rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={() => setDropdownOpen(true)}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--accent-green) 0%, #3d8b6e 100%)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      boxShadow: '0 2px 6px rgba(46, 117, 89, 0.3)',
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontWeight: 500, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                    {user.name}
                  </span>
                </button>

                {dropdownOpen && (
                  <div
                    className="profile-dropdown"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      right: 0,
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e3dc',
                      borderRadius: '16px',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
                      minWidth: '220px',
                      zIndex: 200,
                      padding: '0.5rem 0',
                      overflow: 'hidden',
                    }}
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div style={{ padding: '0.9rem 1.2rem', borderBottom: '1px solid #efeadd' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all' }}>{user.email}</div>
                      {isPremium && (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          marginTop: '0.4rem',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                          color: '#92400e',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                        }}>
                          <Crown size={10} /> Premium Active
                        </div>
                      )}
                    </div>
                    <Link
                      href="/skill-dna"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.75rem 1.2rem',
                        fontSize: '0.85rem',
                        color: 'var(--text-main)',
                        textDecoration: 'none',
                        transition: 'background-color 0.15s'
                      }}
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Award size={14} style={{ color: 'var(--accent-green)' }} /> Skill DNA
                    </Link>
                    <Link
                      href="/github"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.75rem 1.2rem',
                        fontSize: '0.85rem',
                        color: 'var(--text-main)',
                        textDecoration: 'none',
                        transition: 'background-color 0.15s'
                      }}
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Zap size={14} style={{ color: '#f59e0b' }} /> GitHub Intel
                    </Link>
                    {isPremium ? (
                      <Link
                        href="/analyze"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.75rem 1.2rem',
                          fontSize: '0.85rem',
                          color: 'var(--text-main)',
                          textDecoration: 'none',
                          transition: 'background-color 0.15s'
                        }}
                        className="dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Sparkles size={14} style={{ color: '#8b5cf6' }} /> Analyze Profile
                      </Link>
                    ) : (
                      <button
                        onClick={() => { setDropdownOpen(false); setShowPaymentModal(true); }}
                        style={{
                          display: 'flex',
                          width: '100%',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.75rem 1.2rem',
                          fontSize: '0.85rem',
                          color: 'var(--text-muted)',
                          background: 'none',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s'
                        }}
                        className="dropdown-item"
                      >
                        <Lock size={14} style={{ color: '#94a3b8' }} /> Analyze Profile
                        <span style={{
                          marginLeft: 'auto',
                          fontSize: '0.6rem',
                          fontWeight: 700,
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          background: '#fef3c7',
                          color: '#92400e'
                        }}>PRO</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        width: '100%',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.75rem 1.2rem',
                        fontSize: '0.85rem',
                        color: '#dc2626',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s',
                        borderTop: '1px solid #efeadd'
                      }}
                      className="dropdown-item"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-login" style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 500,
                color: 'var(--text-muted)',
                textDecoration: 'none',
                transition: 'all 0.2s',
              }}>
                Login
              </Link>
              <button
                onClick={(e) => {
                  if (!isPremium) {
                    setShowPaymentModal(true);
                  } else {
                    window.location.href = '/analyze';
                  }
                }}
                className="btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                }}
              >
                <Lock size={14} /> Analyze Profile
              </button>
            </>
          )}
        </div>

        {/* Hamburger Menu Toggle Button */}
        <button
          className="menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu Drawer */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav">
            <Link href="/leetcode" className="nav-link" onClick={closeMobileMenu}>LeetCode</Link>
            <Link href="/github" className="nav-link" onClick={closeMobileMenu}>GitHub</Link>
            <Link href="/linkedin" className="nav-link" onClick={closeMobileMenu}>Internships</Link>
            <Link href="/resume" className="nav-link" onClick={closeMobileMenu}>Resume</Link>
          </div>
          <div className="mobile-actions">
            {user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>{user.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
                </div>
                <Link
                  href="/skill-dna"
                  className="btn-primary"
                  style={{ justifyContent: 'center', backgroundColor: 'var(--accent-green)' }}
                  onClick={closeMobileMenu}
                >
                  <Award size={14} /> Skill DNA
                </Link>
                <button
                  onClick={() => { closeMobileMenu(); isPremium ? (window.location.href = '/analyze') : setShowPaymentModal(true); }}
                  className="btn-secondary"
                  style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {isPremium ? <Sparkles size={14} /> : <Lock size={14} />} Analyze Profile
                </button>
                <button
                  onClick={() => {
                    logout();
                    closeMobileMenu();
                  }}
                  className="btn-secondary"
                  style={{ color: '#c93b3b', borderColor: '#c93b3b', width: '100%' }}
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="btn-login" onClick={closeMobileMenu}>Login</Link>
                <button
                  onClick={() => { closeMobileMenu(); setShowPaymentModal(true); }}
                  className="btn-primary"
                  style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Lock size={14} /> Analyze Profile
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ===== Premium Payment Modal ===== */}
      {showPaymentModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(30, 29, 26, 0.65)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '1rem',
          }}
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '420px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
              position: 'relative',
              animation: 'modalSlideUp 0.35s ease-out',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setShowPaymentModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                border: 'none',
                background: 'none',
                fontSize: '1.3rem',
                color: '#94a3b8',
                cursor: 'pointer',
                zIndex: 1,
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
            >
              ×
            </button>

            {/* Header */}
            <div style={{
              textAlign: 'center',
              padding: '2rem 2rem 1.5rem',
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}>
                <Lock size={24} style={{ color: '#2563eb' }} />
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: '#0f172a',
                margin: '0 0 0.4rem',
                fontFamily: 'var(--font-serif, Georgia, serif)',
              }}>
                Premium Feature Access
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
                This premium tool requires active access.
              </p>

              {/* Session Timer */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                marginTop: '0.75rem',
                padding: '0.3rem 0.8rem',
                borderRadius: '20px',
                border: '1px solid #fecaca',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                fontSize: '0.78rem',
                fontWeight: 600,
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
            <div style={{
              textAlign: 'center',
              padding: '1.5rem 2rem',
            }}>
              <div style={{
                display: 'inline-block',
                padding: '12px',
                borderRadius: '16px',
                border: '2px dashed #cbd5e1',
                backgroundColor: '#ffffff',
              }}>
                <img
                  src={qrUrl}
                  alt="UPI Payment QR Code"
                  width={200}
                  height={200}
                  style={{ display: 'block', borderRadius: '8px' }}
                />
              </div>
              <p style={{
                margin: '0.75rem 0 0',
                fontSize: '0.82rem',
                color: '#64748b',
                lineHeight: 1.5,
              }}>
                Scan QR to pay <strong style={{ color: '#0f172a' }}>₹{amount}</strong> to
                <br />
                <strong style={{ color: '#2563eb' }}>{UPI_ID}</strong>
              </p>
            </div>

            {/* UTR Input */}
            <div style={{ padding: '0 2rem 1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '0.5rem',
              }}>
                Enter UPI Transaction ID (UTR)
              </label>
              <input
                type="text"
                value={utrInput}
                onChange={(e) => setUtrInput(e.target.value)}
                placeholder="e.g. 4028391..."
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.88rem',
                  color: '#0f172a',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#60a5fa'; e.target.style.boxShadow = '0 0 0 3px rgba(96, 165, 250, 0.15)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#d1d5db'; e.target.style.boxShadow = 'none'; }}
              />

              <button
                onClick={handleVerifyPayment}
                disabled={verifying || !utrInput.trim()}
                style={{
                  width: '100%',
                  marginTop: '0.75rem',
                  padding: '0.85rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: utrInput.trim()
                    ? 'linear-gradient(135deg, #34d399 0%, #10b981 100%)'
                    : '#e2e8f0',
                  color: utrInput.trim() ? '#ffffff' : '#94a3b8',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: utrInput.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                  boxShadow: utrInput.trim() ? '0 4px 15px rgba(16, 185, 129, 0.3)' : 'none',
                }}
              >
                {verifying ? (
                  <>
                    <span style={{
                      width: '16px', height: '16px', border: '2px solid #fff',
                      borderTopColor: 'transparent', borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite', display: 'inline-block'
                    }}></span>
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} /> Verify & Unlock
                  </>
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
    </>
  );
}
