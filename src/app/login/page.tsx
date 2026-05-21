"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';


export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const [error, setError] = useState('');
  
  const [mounted, setMounted] = useState(false);
  const [cubes, setCubes] = useState<any[]>([]);
  const colHeights = useRef<number[]>([]);
  const nextId = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    setMounted(true);
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const spawnCube = () => {
    if (!isMountedRef.current) return;

    const colWidth = 72;
    const cubeHeight = 58;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const numCols = Math.max(4, Math.floor(windowWidth / colWidth));
    
    if (colHeights.current.length === 0) {
      colHeights.current = new Array(numCols).fill(0);
    }

    let validColumns: number[] = [];
    for (let i = 0; i < numCols; i++) {
      if ((colHeights.current[i] || 0) < 9) {
        validColumns.push(i);
      }
    }

    if (validColumns.length === 0) {
      colHeights.current = new Array(numCols).fill(0);
      setCubes([]);
      // Start fresh after a short delay
      setTimeout(spawnCube, 1000);
      return;
    }

    const randomCol = validColumns[Math.floor(Math.random() * validColumns.length)];
    
    const LOGO_POOL = [
      { logo: "/github_logo.png", alt: "GitHub" },
      { logo: "/logo_linkedin.png", alt: "LinkedIn" },
      { logo: "/leetcode_logo.png", alt: "LeetCode" },
      { logo: "/logo_resume_io.png", alt: "Resume.io" },
      { logo: "/logo.png", alt: "DevDNA", padding: "10px" }
    ];

    const logoItem = LOGO_POOL[Math.floor(Math.random() * LOGO_POOL.length)];
    const spinClasses = ["cube-1", "cube-2", "cube-3", "cube-4", "cube-5"];
    const randomSpin = spinClasses[Math.floor(Math.random() * spinClasses.length)];

    const currentHeight = colHeights.current[randomCol] || 0;
    const targetY = windowHeight - 75 - (currentHeight * cubeHeight);
    
    colHeights.current[randomCol] = currentHeight + 1;

    const gridWidth = numCols * colWidth;
    const sideOffset = Math.max(10, (windowWidth - gridWidth) / 2);

    const cubeId = nextId.current++;
    const newCube = {
      id: cubeId,
      logo: logoItem.logo,
      alt: logoItem.alt,
      padding: logoItem.padding || "8px",
      column: randomCol,
      x: sideOffset + randomCol * colWidth,
      targetY: targetY,
      startY: -(windowHeight + 120),
      duration: 3.8 + Math.random() * 0.8, // Slow fall: 3.8s to 4.6s
      landed: false,
      spinClass: randomSpin
    };

    setCubes((prev) => [...prev, newCube]);
  };

  const handleTransitionEnd = (cubeId: number) => {
    if (!isMountedRef.current) return;
    
    setCubes((prev) =>
      prev.map((c) => (c.id === cubeId ? { ...c, landed: true } : c))
    );

    // After the current cube lands, wait 800ms and spawn the next one!
    setTimeout(spawnCube, 800);
  };

  useEffect(() => {
    if (!mounted) return;
    spawnCube();
  }, [mounted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (email && password) {
      const success = login(email);
      if (success) {
        router.push('/');
      } else {
        setError('User not found. Please sign up first.');
      }
    }
  };

  return (
    <main className="login-page" style={{
      backgroundImage: 'url("/login_background_green.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        .login-page {
          --bounce-easing: linear(0, 0.214 14.7%, 0.386 23.7%, 0.598 31.9%, 0.999 44.7%, 0.807 52.6%, 0.762 56%, 0.747 59.4%, 0.758 62.4%, 0.793 65.6%, 0.999 77.4%, 0.961 81.2%, 0.949 84.8%, 0.956 88%, 0.993 95.5%, 1);
        }

        .falling-container {
          position: absolute;
          width: 60px;
          height: 60px;
          z-index: 2;
          perspective: 600px;
          pointer-events: none;
          will-change: transform;
          animation-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
        }

        .falling-container.landed .cube {
          animation-play-state: paused !important;
        }

        .cube {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
        }

        .cube-1 { animation: spin 12s linear infinite; }
        .cube-2 { animation: spin-reverse 15s linear infinite; }
        .cube-3 { animation: spin 14s linear infinite; }
        .cube-4 { animation: spin-reverse 16s linear infinite; }
        .cube-5 { animation: spin-diagonal 13s linear infinite; }

        .face {
          position: absolute;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0.1) 100%);
          border: 1.5px solid rgba(255, 255, 255, 0.45);
          border-radius: 12px;
          box-shadow: 
            inset 0 0 10px rgba(255, 255, 255, 0.5), 
            0 8px 20px rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }

        .top, .bottom {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.38) 0%, rgba(255, 255, 255, 0.12) 100%);
        }

        .falling-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 8px;
          user-select: none;
          pointer-events: none;
        }

        /* 3D Cube Face Positions (radius = 30px for 60px wide cube) */
        .front  { transform: rotateY(0deg) translateZ(30px); }
        .back   { transform: rotateY(180deg) translateZ(30px); }
        .left   { transform: rotateY(-90deg) translateZ(30px); }
        .right  { transform: rotateY(90deg) translateZ(30px); }
        .top    { transform: rotateX(90deg) translateZ(30px); }
        .bottom { transform: rotateX(-90deg) translateZ(30px); }

        @keyframes fall-and-bounce {
          0% {
            transform: translate3d(0, -120vh, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes spin {
          0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
          100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg); }
        }

        @keyframes spin-reverse {
          0% { transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg); }
          100% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
        }

        @keyframes spin-diagonal {
          0% { transform: rotate3d(1, 1, 0, 0deg); }
          100% { transform: rotate3d(1, 1, 0, 360deg); }
        }
      `}} />

      {/* Animated Glowing Background Orbs */}
      <div className="login-orb-1"></div>
      <div className="login-orb-2"></div>

      {/* Falling & Storing 3D Cube Elements */}
      {mounted && cubes.map((cube) => (
        <div 
          key={cube.id} 
          className={`falling-container ${cube.landed ? 'landed' : ''}`} 
          style={{ 
            left: `${cube.x}px`, 
            top: `${cube.targetY}px`,
            animationName: 'fall-and-bounce',
            animationDuration: `${cube.duration}s`,
            animationTimingFunction: 'var(--bounce-easing)',
            animationFillMode: 'forwards'
          }}
          onAnimationEnd={() => handleTransitionEnd(cube.id)}
        >
          <div className={`cube ${cube.spinClass}`}>
            <div className="face front">
              <img src={cube.logo} alt={cube.alt} className="falling-img" style={{ padding: cube.padding }} />
            </div>
            <div className="face back">
              <img src={cube.logo} alt={cube.alt} className="falling-img" style={{ padding: cube.padding }} />
            </div>
            <div className="face left">
              <img src={cube.logo} alt={cube.alt} className="falling-img" style={{ padding: cube.padding }} />
            </div>
            <div className="face right">
              <img src={cube.logo} alt={cube.alt} className="falling-img" style={{ padding: cube.padding }} />
            </div>
            <div className="face top"></div>
            <div className="face bottom"></div>
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: '1000px', zIndex: 10, position: 'relative', flexWrap: 'wrap' }}>
        <div className="login-plans" style={{
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(24px)',
          padding: '2.5rem',
          borderRadius: '28px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 30px 60px rgba(0,0,0,0.04)',
          border: '1px solid rgba(225, 222, 214, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          <h2 className="serif" style={{ fontSize: '1.75rem', margin: 0, textAlign: 'center', color: 'var(--text-main)' }}>Choose Your Plan</h2>
          
          <div style={{
            padding: '1.5rem',
            borderRadius: '16px',
            border: '2px solid #e5e3dc',
            backgroundColor: '#ffffff'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Free Plan</h3>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <li>Access to all features</li>
              <li>Limit of <strong style={{color: 'var(--text-main)'}}>10 free searches</strong> per feature</li>
              <li>Basic AI insights</li>
            </ul>
          </div>

          <div style={{
            padding: '1.5rem',
            borderRadius: '16px',
            border: '2px solid var(--accent-green)',
            backgroundColor: 'var(--accent-light-green)',
            position: 'relative'
          }}>
            <div style={{ position: 'absolute', top: '-10px', right: '15px', backgroundColor: 'var(--accent-green)', color: '#ffffff', fontSize: '0.7rem', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Recommended</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--accent-green)', marginBottom: '0.5rem' }}>Pro Plan</h3>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem', color: '#2d5440', lineHeight: 1.6 }}>
              <li><strong>Unlimited</strong> searches across all modules</li>
              <li>Deep Developer DNA Analysis</li>
              <li>Priority support & tailored upskilling</li>
            </ul>
          </div>
        </div>

        <div className="login-container">
          <div className="login-header">
          <h1 className="serif">Welcome Back</h1>
          <p>Enter your credentials to access your trajectory dashboard.</p>
        </div>

        {error && (
          <div style={{ padding: '0.8rem', marginBottom: '1rem', borderRadius: '8px', backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '0.88rem', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-actions">
            <label className="remember-me">
              <input type="checkbox" /> Remember me
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>

          <button type="submit" className="btn-primary login-submit">
            Sign In
          </button>
        </form>

        <div className="login-footer">
          Don't have an account? <Link href="/register">Sign Up</Link>
        </div>
      </div>
      </div>
    </main>
  );
}
