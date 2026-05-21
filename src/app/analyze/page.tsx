"use client";

import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { 
  Network, Cloud, GraduationCap, GitBranch, Layers, Smile, Globe, 
  BarChart, Terminal, CloudLightning, Building, FileUp, Award, 
  Sparkles, BarChart2, BookOpen, X, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AnalyzeProfile() {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    github: '',
    stackoverflow: '',
    huggingface: '',
    portfolio: '',
    kaggle: '',
    competitiveSelect: 'LeetCode',
    competitiveUsername: '',
    cloudProject: '',
    publications: '',
    linkedin: ''
  });

  const [cloudProvider, setCloudProvider] = useState('GCP');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [certInput, setCertInput] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
const [unsolvedProblems, setUnsolvedProblems] = useState<Array<{ id: string; title: string; titleSlug: string; difficulty: string }>>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user-specific profile details if logged in
  useEffect(() => {
    if (user) {
      const savedProfileStr = localStorage.getItem(`devdna_profile_${user.email}`);
      if (savedProfileStr) {
        try {
          const profile = JSON.parse(savedProfileStr);
          if (profile.formData) {
            setFormData(prev => ({ ...prev, ...profile.formData }));
          }
          if (profile.cloudProvider) {
            setCloudProvider(profile.cloudProvider);
          }
          if (profile.certifications) {
            setCertifications(profile.certifications);
          }
        } catch (e) {
          console.error("Failed to load saved profile", e);
        }
      }
    }
  }, [user]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addCertification = (e: React.MouseEvent) => {
    e.preventDefault();
    if (certInput.trim() && !certifications.includes(certInput.trim())) {
      setCertifications([...certifications, certInput.trim()]);
      setCertInput('');
    }
  };

  const removeCertification = (cert: string) => {
    setCertifications(certifications.filter(c => c !== cert));
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeFile(e.target.files[0]);
    }
  };

  const calculateProgress = () => {
    let score = 0;
    const totalFields = 11;
    
    if (formData.github) score++;
    if (formData.stackoverflow) score++;
    if (formData.huggingface) score++;
    if (formData.portfolio) score++;
    if (formData.kaggle) score++;
    if (formData.competitiveUsername) score++;
    if (formData.cloudProject) score++;
    if (formData.publications) score++;
    if (formData.linkedin) score++;
    if (certifications.length > 0) score++;
    if (resumeFile) score++;

    return Math.round((score / totalFields) * 100);
  };

  const progress = calculateProgress();

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let githubStats = null;
      let leetcodeStats = null;

      const fetchPromises = [];

      if (formData.github) {
        fetchPromises.push(
          fetch(`/api/github?username=${encodeURIComponent(formData.github.trim())}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
              githubStats = data;
              if (data) {
                localStorage.setItem('devdna_github_user', formData.github.trim());
                localStorage.setItem('devdna_github_stats', JSON.stringify(data));
              }
            })
            .catch(err => console.error("GitHub sync error:", err))
        );
      }

      if (formData.competitiveSelect === 'LeetCode' && formData.competitiveUsername) {
        // Fetch LeetCode stats
        fetchPromises.push(
          fetch(`/api/leetcode?username=${encodeURIComponent(formData.competitiveUsername.trim())}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
              leetcodeStats = data;
              if (data) {
                localStorage.setItem('devdna_leetcode_user', formData.competitiveUsername.trim());
                localStorage.setItem('devdna_leetcode_stats', JSON.stringify(data));
              }
            })
            .catch(err => console.error("LeetCode sync error:", err))
        );
        // Fetch unsolved problem suggestions
        fetchPromises.push(
          fetch(`/api/leetcode/unsolved?username=${encodeURIComponent(formData.competitiveUsername.trim())}`)
            .then(res => res.ok ? res.json() : null)
            .then(data => {
              if (data && data.unsolved) {
                setUnsolvedProblems(data.unsolved);
              }
            })
            .catch(err => console.error("LeetCode unsolved fetch error:", err))
        );
      }

      await Promise.all(fetchPromises);

      const profile = {
        formData,
        cloudProvider,
        certifications,
        github_username: formData.github.trim(),
        leetcode_username: formData.competitiveSelect === 'LeetCode' ? formData.competitiveUsername.trim() : '',
        github_stats: githubStats,
        leetcode_stats: leetcodeStats
      };
      
      // Save user-specific profile
      if (user) {
        localStorage.setItem(`devdna_profile_${user.email}`, JSON.stringify(profile));
      }
      
      // Save global keys for immediate dashboard updates
      if (formData.github) {
        localStorage.setItem('devdna_github_user', formData.github.trim());
      }
      if (formData.competitiveSelect === 'LeetCode' && formData.competitiveUsername) {
        localStorage.setItem('devdna_leetcode_user', formData.competitiveUsername.trim());
      }
      
      setIsSuccess(true);
      // Reset success message after 3 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Synthesize error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="analyze-page">
      <div className="analyze-container">
        <div className="analyze-header">
          <h1 className="serif">
            <span className="italic-highlight">DNA Extraction.</span> Enterprise Intelligence Ingestion.
          </h1>
          <p>
            Synchronize your professional ecosystem. Our neural engine synthesizes repositories, cloud 
            deployments, and research contributions into a unified strategic trajectory.
          </p>
        </div>

        <form className="analyze-grid">
          {/* Column 1 */}
          <div className="analyze-col">
            <h3 className="col-title"><Network size={20} /> Code Ecosystems</h3>
            
            <div className="input-card">
              <div className="input-group">
                <label><GitBranch size={14} /> GITHUB USERNAME</label>
                <input type="text" name="github" value={formData.github} onChange={handleInputChange} placeholder="e.g. satoshin" />
              </div>
              <div className="input-group">
                <label><Layers size={14} /> STACK OVERFLOW ID</label>
                <input type="text" name="stackoverflow" value={formData.stackoverflow} onChange={handleInputChange} placeholder="e.g. 1234567" />
              </div>
              <div className="input-group">
                <label><Smile size={14} /> HUGGING FACE PROFILE</label>
                <input type="text" name="huggingface" value={formData.huggingface} onChange={handleInputChange} placeholder="e.g. username" />
              </div>
              <div className="input-group">
                <label><Globe size={14} /> PORTFOLIO/PERSONAL SITE</label>
                <input type="text" name="portfolio" value={formData.portfolio} onChange={handleInputChange} placeholder="https://yourportfolio.dev" />
              </div>
            </div>

            <div className="input-card specialized-card">
              <h4 className="sub-card-title">SPECIALIZED INSIGHTS</h4>
              <div className="specialized-row">
                <div className="spec-label"><BarChart size={16} /> Kaggle Rank</div>
                <input type="text" name="kaggle" value={formData.kaggle} onChange={handleInputChange} placeholder="ID" className="small-input" />
              </div>
              <div className="specialized-row">
                <div className="spec-label"><Terminal size={16} /> Competitive Coding</div>
                <select name="competitiveSelect" value={formData.competitiveSelect} onChange={handleInputChange} className="small-select">
                  <option value="LeetCode">LeetCode</option>
                  <option value="Codeforces">Codeforces</option>
                  <option value="HackerRank">HackerRank</option>
                </select>
              </div>
              <div className="specialized-row">
                <div className="spec-label"><Sparkles size={16} /> Username</div>
                <input type="text" name="competitiveUsername" value={formData.competitiveUsername} onChange={handleInputChange} placeholder="e.g. satoshin" className="small-input" />
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div className="analyze-col">
            <h3 className="col-title"><Cloud size={20} /> Cloud & Infrastructure</h3>
            
            <div className="input-card">
              <div className="cloud-providers">
                <button type="button" onClick={() => setCloudProvider('AWS')} className={`provider-btn ${cloudProvider === 'AWS' ? 'active' : ''}`}><CloudLightning size={24} /> <span>AWS</span></button>
                <button type="button" onClick={() => setCloudProvider('AZURE')} className={`provider-btn ${cloudProvider === 'AZURE' ? 'active' : ''}`}><Building size={24} /> <span>AZURE</span></button>
                <button type="button" onClick={() => setCloudProvider('GCP')} className={`provider-btn ${cloudProvider === 'GCP' ? 'active' : ''}`}><Globe size={24} /> <span>GCP</span></button>
              </div>
              <div className="input-group">
                <label>CLOUD PROJECT ID / ARN</label>
                <input type="text" name="cloudProject" value={formData.cloudProject} onChange={handleInputChange} placeholder="Project-alpha-9901" />
              </div>
            </div>

            <div className="input-card upload-card">
              <div className="upload-zone" onClick={handleFileClick} style={{ borderColor: resumeFile ? 'var(--accent-green)' : '#d1e6db' }}>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".pdf,.docx" />
                {resumeFile ? (
                  <>
                    <CheckCircle2 size={32} color="var(--accent-green)" />
                    <h4 style={{ color: 'var(--accent-green)' }}>{resumeFile.name}</h4>
                    <p>File attached successfully</p>
                  </>
                ) : (
                  <>
                    <FileUp size={32} color="var(--accent-green)" />
                    <h4>Upload Core Resume</h4>
                    <p>PDF, DOCX (Max 10MB). Our AI parses the semantic layer of your history.</p>
                  </>
                )}
              </div>
            </div>

            <div className="cert-section">
              <label><Award size={14} /> TECHNICAL CERTIFICATIONS</label>
              <div className="cert-input-row">
                <input type="text" value={certInput} onChange={(e) => setCertInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCertification(e as any)} placeholder="Verify via ID (CKA, Solutions Architect...)" />
                <button type="button" onClick={addCertification} className="add-btn">+</button>
              </div>
              {certifications.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                  {certifications.map((cert, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', backgroundColor: '#e2efea', color: 'var(--accent-green)', padding: '0.3rem 0.6rem', borderRadius: '12px' }}>
                      {cert}
                      <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeCertification(cert)} />
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Column 3 */}
          <div className="analyze-col">
            <h3 className="col-title"><BookOpen size={20} /> Academic & Research</h3>
            
            <div className="input-card">
              <div className="input-group">
                <label><BookOpen size={14} /> TECHNICAL PUBLICATIONS</label>
                <input type="text" name="publications" value={formData.publications} onChange={handleInputChange} placeholder="ArXiv, ResearchGate, or DOI links" />
              </div>
              <div className="input-group">
                <label><Network size={14} /> PROFESSIONAL NETWORK</label>
                <input type="text" name="linkedin" value={formData.linkedin} onChange={handleInputChange} placeholder="LinkedIn Profile URL" />
              </div>
            </div>

            <div className="input-card readiness-card">
              <div className="readiness-header">
                <div className="icon-circle"><Sparkles size={16} /></div>
                <h4>INGESTION READINESS</h4>
              </div>
              <div className="progress-info">
                <span>Profile Density</span>
                <span className="percent">{progress}% Complete</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%`, transition: 'width 0.5s ease' }}></div>
              </div>
              <p className="readiness-desc">
                {progress > 80 ? 'High-density ingestion detected. Trajectory precision estimated at 94.2%.' : 
                 progress > 40 ? 'Moderate ingestion detected. Add more profiles for better precision.' : 
                 'Low ingestion density. Please connect your accounts.'}
              </p>
            </div>
          </div>
        </form>

{/* LeetCode Suggested Problems */}
{unsolvedProblems.length > 0 && (
  <section className="unsolved-section">
    <h3 className="col-title"><Sparkles size={20} /> Next in Striver's A2Z Roadmap</h3>
    <ul className="unsolved-list">
      {unsolvedProblems.map(p => (
        <li key={p.id} className="unsolved-item">
          <a href={`https://leetcode.com/problems/${p.titleSlug}`} target="_blank" rel="noopener noreferrer">{p.title} ({p.difficulty})</a>
        </li>
      ))}
    </ul>
  </section>
)}

        <div className="analyze-footer">
          <button type="button" onClick={handleSubmit} disabled={isSubmitting || isSuccess} className="btn-primary btn-large" style={{ opacity: isSubmitting ? 0.8 : 1, transition: 'all 0.3s' }}>
            {isSubmitting ? 'Synthesizing...' : isSuccess ? 'DNA Successfully Synthesized!' : (
              <>Synthesize Developer DNA <BarChart2 size={20} /></>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
