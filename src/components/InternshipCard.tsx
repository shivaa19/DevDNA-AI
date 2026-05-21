'use client';
import React from 'react';
import Link from 'next/link';
import { ExternalLink, MapPin, Building, Target } from 'lucide-react';

interface InternshipProps {
  title: string;
  company: string;
  location: string;
  url: string;
  source: string;
  description: string;
  skills: string[];
}

export default function InternshipCard({ title, company, location, url, source, description, skills }: InternshipProps) {
  return (
    <div style={{
      padding: '1.25rem',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(12px)',
      borderRadius: '16px',
      border: '1px solid #e5e3dc',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
      height: '100%'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.05)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>{title}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Building size={14} />
            <span>{company}</span>
          </div>
        </div>
        <span style={{
          fontSize: '0.7rem',
          fontWeight: 600,
          backgroundColor: '#e2efea',
          color: 'var(--accent-green)',
          padding: '0.2rem 0.5rem',
          borderRadius: '4px',
          textTransform: 'uppercase'
        }}>
          {source}
        </span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <MapPin size={14} />
        <span style={{ 
          color: location.toLowerCase().includes('remote') ? 'var(--accent-green)' : 'inherit',
          fontWeight: location.toLowerCase().includes('remote') ? 500 : 400
        }}>
          {location}
        </span>
      </div>

      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5, flex: 1 }}>
        {description}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: 'auto', paddingTop: '0.5rem' }}>
        {skills.map(skill => (
          <span key={skill} style={{
            fontSize: '0.75rem',
            backgroundColor: '#f6f5f0',
            color: 'var(--text-muted)',
            padding: '0.2rem 0.6rem',
            borderRadius: '12px',
            border: '1px solid #e5e3dc'
          }}>
            {skill}
          </span>
        ))}
      </div>

      <div style={{ marginTop: '0.75rem', borderTop: '1px solid #e5e3dc', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
        <Link href={url} target="_blank" rel="noopener noreferrer" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.9rem',
          fontWeight: 500,
          color: '#0a66c2',
          textDecoration: 'none'
        }}>
          Apply Now <ExternalLink size={14} />
        </Link>
      </div>
    </div>
  );
}
