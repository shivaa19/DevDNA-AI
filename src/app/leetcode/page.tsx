"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFeatureAccess } from '../../hooks/useFeatureAccess';
import { LoginRequiredGate, PremiumFeatureGate } from '../../components/AccessGates';

export default function LeetcodeIngest() {
  const router = useRouter();
  const { user } = useAuth();
  const { remainingSearches, consumeSearch, isLocked } = useFeatureAccess('leetcode');
  const [username, setUsername] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    if (isLocked) return;
    if (!consumeSearch()) return;

    setIsExtracting(true);
    setError('');
    setStatusMessage('Connecting to LeetCode API...');

    try {
      const res = await fetch(`/api/leetcode?username=${encodeURIComponent(username.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
      }

      setStatusMessage('Synthesizing algorithmic skill profile...');
      
      // Simulate brief processing for UX
      setTimeout(() => {
        setProfileData(data);
        setIsExtracting(false);
      }, 800);

    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setIsExtracting(false);
    }
  };

  const confirmAndProceed = () => {
    if (profileData) {
      localStorage.setItem('devdna_leetcode_user', profileData.username);
      localStorage.setItem('devdna_leetcode_stats', JSON.stringify(profileData));
      router.push('/skill-matrix');
    }
  };

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEVm10itaY4iVE9Pxbf7Kk25XbJAwsrBM5-Q&s")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(247, 246, 241, 0.65)', backdropFilter: 'blur(3px)', zIndex: 1 }}></div>
        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '540px' }}>
          <LoginRequiredGate featureName="LeetCode" />
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: 'url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEVm10itaY4iVE9Pxbf7Kk25XbJAwsrBM5-Q&s")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: '#fdfdfc',
      padding: '2rem',
      position: 'relative'
    }}>
      {/* Background Overlay */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(247, 246, 241, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 1
      }}></div>

      {/* Center card */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '460px',
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(230, 225, 210, 0.8)',
        borderRadius: '24px',
        padding: '3rem 2.5rem',
        boxShadow: '0 20px 50px rgba(60, 50, 30, 0.08)',
        textAlign: 'center'
      }}>
        {/* LeetCode Logo Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <Image src="/leetcode_logo.png" alt="LeetCode" width={180} height={45} style={{ objectFit: 'contain' }} />
        </div>

        {!profileData ? (
          <>
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: '0.5rem',
              fontFamily: 'var(--font-serif, Georgia, serif)'
            }}>
              LeetCode Intelligence
            </h2>
            <p style={{
              fontSize: '0.9rem',
              color: '#64748b',
              lineHeight: 1.6,
              marginBottom: '2rem'
            }}>
              Provide your LeetCode username or profile link below to synthesize your solving patterns, completion speeds, and algorithmic DNA.
            </p>
          </>
        ) : (
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: '#1e293b',
            marginBottom: '1.5rem',
            fontFamily: 'var(--font-serif, Georgia, serif)'
          }}>
            Profile Verified
          </h2>
        )}

        {isLocked ? (
          <PremiumFeatureGate featureName="LeetCode" />
        ) : !isExtracting && !profileData ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#475569',
                marginBottom: '0.5rem'
              }}>
                LeetCode Username or Profile URL
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g., lc_ninja or leetcode.com/lc_ninja"
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.9rem',
                  color: '#0f172a',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
              />
              {error && (
                <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  {error}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', width: '100%' }}>
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ffa116 0%, #f59e0b 100%)',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 15px rgba(255, 161, 22, 0.25)',
                  transition: 'all 0.2s'
                }}
              >
                Analyze LeetCode Profile
                <Sparkles size={16} />
              </button>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {remainingSearches} / 10 free searches remaining
              </span>
            </div>
          </form>
        ) : isExtracting ? (
          <div style={{ padding: '1rem 0' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #ffeedb',
              borderTopColor: '#ffa116',
              borderRadius: '50%',
              margin: '0 auto 1.5rem',
              animation: 'spin 1s linear infinite'
            }}></div>
            <div style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: '0.25rem'
            }}>
              Analyzing Developer DNA
            </div>
            <div style={{
              fontSize: '0.82rem',
              color: '#ffa116',
              fontWeight: 500,
              letterSpacing: '0.01em'
            }}>
              {statusMessage}
            </div>
          </div>
        ) : profileData ? (
          <div style={{ textAlign: 'center' }}>
            {profileData.avatar ? (
              <img src={profileData.avatar} alt="Avatar" style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 1rem', display: 'block', border: '3px solid #ffa116' }} />
            ) : (
              <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', border: '3px solid #ffa116', fontSize: '1.5rem', fontWeight: 'bold', color: '#475569' }}>
                {profileData.username?.charAt(0).toUpperCase()}
              </div>
            )}
            
            <h3 style={{ margin: '0 0 0.2rem', fontSize: '1.2rem', color: '#1e293b' }}>
              {profileData.realName || profileData.username}
            </h3>
            <p style={{ margin: '0 0 1rem', color: '#64748b', fontSize: '0.9rem' }}>
              @{profileData.username}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981' }}>{profileData.solved?.total || 0}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Solved</div>
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffa116' }}>#{profileData.ranking || 'N/A'}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Rank</div>
              </div>
            </div>

            <button
              onClick={confirmAndProceed}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '12px',
                border: 'none',
                background: '#10b981',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              Confirm & Continue <ChevronRight size={16} />
            </button>
            <button
              onClick={() => { setProfileData(null); setUsername(''); }}
              style={{
                width: '100%',
                padding: '0.85rem',
                marginTop: '0.75rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                background: 'transparent',
                color: '#64748b',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Not You? Try Again
            </button>
          </div>
        ) : null}

        <div style={{
          marginTop: '2.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #efeadd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontSize: '0.78rem',
          color: '#64748b'
        }}>
          <Sparkles size={14} style={{ color: '#ffa116' }} /> Public profile details are securely ingested and modeled.
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
