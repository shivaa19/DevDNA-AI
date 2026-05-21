"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, ChevronRight } from 'lucide-react';

export default function LeetcodeIngest() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Initiating pipeline...');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setIsExtracting(true);

    let finalUsername = username.trim();
    if (finalUsername.includes('leetcode.com/')) {
      const parts = finalUsername.split('leetcode.com/');
      if (parts.length > 1) {
        finalUsername = parts[1].split('/')[0].trim();
      }
    }

    const stages = [
      'Connecting to LeetCode API...',
      'Fetching solved problem statistics...',
      'Analyzing complexity & runtime efficiency...',
      'Synthesizing algorithmic skill profile...',
      'Redirecting to intelligence dashboard...'
    ];

    let currentStage = 0;
    const interval = setInterval(() => {
      if (currentStage < stages.length) {
        setStatusMessage(stages[currentStage]);
        currentStage++;
      } else {
        clearInterval(interval);
        localStorage.setItem('devdna_leetcode_user', finalUsername);
        router.push('/skill-matrix');
      }
    }, 800);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(253, 239, 219, 0.4) 0%, rgba(244, 240, 227, 0.5) 90%), url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEVm10itaY4iVE9Pxbf7Kk25XbJAwsrBM5-Q&s")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: '#f7f6f1',
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

      {/* Back button */}
      <Link href="/" style={{
        position: 'absolute',
        top: '2rem',
        left: '2rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#475569',
        fontSize: '0.88rem',
        fontWeight: 600,
        textDecoration: 'none',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        border: '1px solid #efeadd',
        zIndex: 10,
        transition: 'all 0.2s'
      }}>
        <ArrowLeft size={16} /> Back to Hub
      </Link>

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
        {/* LeetCode Icon Header */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 8px 20px rgba(255, 161, 22, 0.12)',
          border: '1px solid #ffe8cc'
        }}>
          <svg viewBox="0 0 24 24" width="32" height="32" fill="#ffa116">
            <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.074-1.954l-5.63-6.17c-.208-.227-.376-.484-.505-.765l2.062-2.208c.54-.54.54-1.414.074-1.954l-2.396-2.392a1.374 1.374 0 0 0-1.016-.438h-.038zm-1.802 11.238l-2.072 2.217a1.37 1.37 0 0 0 .505 2.133l5.63 6.17c.54.54 1.414.54 1.954 0l2.396-2.392c.54-.54.54-1.414 0-1.954l-5.63-6.17c-.217-.236-.505-.424-.812-.537l-.039-.019-.048-.009h-.038a1.37 1.37 0 0 0-.859.575z"/>
          </svg>
        </div>

        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: 600,
          color: '#1e293b',
          marginBottom: '0.5rem',
          fontFamily: 'var(--font-serif, Georgia, serif)'
        }}>
          Algorithmic Ingestion
        </h2>
        <p style={{
          fontSize: '0.9rem',
          color: '#64748b',
          lineHeight: 1.6,
          marginBottom: '2rem'
        }}>
          Provide your LeetCode username or profile link below to synthesize your solving patterns, completion speeds, and algorithmic DNA.
        </p>

        {!isExtracting ? (
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
            </div>

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
              Connect Profile <ChevronRight size={16} />
            </button>
          </form>
        ) : (
          <div style={{ padding: '1rem 0' }}>
            {/* Loading spinner */}
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
        )}

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
