'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, Crown, LogIn } from 'lucide-react';

export function LoginRequiredGate({ featureName }: { featureName: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      backgroundColor: '#ffffff',
      borderRadius: '24px',
      border: '1px solid #e5e3dc',
      boxShadow: '0 12px 40px rgba(0,0,0,0.04)',
      textAlign: 'center',
      maxWidth: '600px',
      margin: '4rem auto'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        backgroundColor: '#efeadd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem'
      }}>
        <Lock size={32} style={{ color: 'var(--accent-green)' }} />
      </div>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
        Authentication Required
      </h2>
      <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
        You must be logged in to access the {featureName} integration and analyze profiles. Sign in to unlock this feature and track your progress.
      </p>
      <Link href="/login" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.8rem 2rem',
        backgroundColor: 'var(--accent-green)',
        color: '#ffffff',
        borderRadius: '12px',
        fontWeight: 600,
        textDecoration: 'none',
        boxShadow: '0 4px 12px rgba(46, 117, 89, 0.2)'
      }}>
        <LogIn size={18} />
        Log In / Sign Up
      </Link>
    </div>
  );
}

export function PremiumFeatureGate({ featureName }: { featureName: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      backgroundColor: '#1b1b19', // Dark premium look
      borderRadius: '24px',
      border: '1px solid #333',
      boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
      textAlign: 'center',
      maxWidth: '600px',
      margin: '2rem auto'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem'
      }}>
        <Crown size={32} style={{ color: '#FFD700' }} />
      </div>
      <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem' }}>
        Search Limit Reached
      </h2>
      <p style={{ fontSize: '1rem', color: '#a7a59a', marginBottom: '2rem', lineHeight: 1.6 }}>
        You have used all 10 of your free {featureName} searches. Upgrade to Premium to unlock unlimited AI analysis, deep technical routing, and priority processing.
      </p>
      <button 
        onClick={() => alert("Payment Gateway Integration Coming Soon!")}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.8rem 2rem',
          background: 'linear-gradient(135deg, #FFD700 0%, #FDB931 100%)',
          color: '#1b1b19',
          borderRadius: '12px',
          fontWeight: 700,
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
        }}
      >
        <Crown size={18} />
        Upgrade to Premium
      </button>
    </div>
  );
}
