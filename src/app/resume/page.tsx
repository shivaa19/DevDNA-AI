"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  LayoutDashboard, Code2, TrendingUp, Compass, 
  BookOpen, HelpCircle, LogOut, Bell, Settings,
  Search, Upload, FileText, CheckCircle2, 
  Sparkles, Plus, AlertCircle, RefreshCw, X, HelpCircle as HelpIcon
} from 'lucide-react';

// Interfaces for our parsed resume structure
interface ResumeExperience {
  title: string;
  company: string;
  period: string;
  bullets: string[];
}

interface ResumeProject {
  name: string;
  description: string;
}

interface ResumeEducation {
  degree: string;
  university: string;
  graduated: string;
}

interface ParsedResume {
  name: string;
  email: string;
  location: string;
  portfolio: string;
  experience: ResumeExperience[];
  projects: ResumeProject[];
  education: ResumeEducation;
}

interface Suggestion {
  original: string;
  improvement: string;
  reason: string;
  type?: 'experience' | 'project';
}

export default function ResumeOptimizer() {
  const [step, setStep] = useState<1 | 2>(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [showPasteInput, setShowPasteInput] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // States for parsed results
  const [parsedData, setParsedData] = useState<ParsedResume | null>(null);
  const [suggestions, setSuggestions] = useState<{
    quantify: Suggestion[];
    missingKeywords: string[];
    actionVerbs: string[];
    score: number;
  }>({
    quantify: [],
    missingKeywords: [],
    actionVerbs: [],
    score: 70
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to dynamically load PDFJS from CDN for client-side parsing
  const loadPdfJS = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).pdfjsLib) {
        resolve((window as any).pdfjsLib);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
      script.onload = () => {
        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        resolve(pdfjsLib);
      };
      script.onerror = () => reject(new Error('Failed to load PDF.js'));
      document.head.appendChild(script);
    });
  };

  const parsePdf = async (file: File): Promise<string> => {
    const pdfjsLib = await loadPdfJS();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      
      let lastY = -1;
      let pageText = '';
      
      for (const item of content.items as any[]) {
        const str = item.str;
        const y = item.transform[5]; // vertical coordinate
        
        if (lastY !== -1 && Math.abs(y - lastY) > 5) {
          // Significant vertical gap means a new line!
          pageText += '\n';
        } else if (lastY !== -1 && str.trim().length > 0 && pageText.length > 0 && !pageText.endsWith('\n') && !pageText.endsWith(' ')) {
          pageText += ' ';
        }
        
        pageText += str;
        lastY = y;
      }
      
      text += pageText + '\n';
    }
    return text;
  };

  // Perform heuristic parsing of raw resume text
  const parseResumeText = (text: string): ParsedResume => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // Heuristics for premium defaults (fallbacks on registered user data if no info is parsed)
    let defaultName = 'Alex Sterling';
    let defaultEmail = 'alex.sterling@devdna.ai';
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('devdna_user');
      if (storedUser) {
        try {
          const userObj = JSON.parse(storedUser);
          if (userObj.name) defaultName = userObj.name;
          if (userObj.email) defaultEmail = userObj.email;
        } catch (e) {
          console.error(e);
        }
      }
    }

    let name = defaultName;
    let email = defaultEmail;
    let location = 'Gujarat Technological University, CG';
    let portfolio = 'portfolio.dev/asterling';
    
    // 1. Parse Name (look for the first short non-header, non-email/url line)
    for (const l of lines) {
      const trimmed = l.trim();
      if (
        trimmed.length > 2 && 
        trimmed.length < 40 && 
        !trimmed.includes('@') && 
        !trimmed.includes('.') && 
        !trimmed.includes('/') &&
        !/\d/.test(trimmed) &&
        !/resume|curriculum|vitae|portfolio/i.test(trimmed)
      ) {
        name = trimmed;
        break;
      }
    }
    
    // 2. Email regex search
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      email = emailMatch[0];
    }
    
    // 3. GitHub/Portfolio link search
    const linkMatch = text.match(/(?:github\.com|linkedin\.com|portfolio\.[a-z]+)\/[a-zA-Z0-9_-]+/i);
    if (linkMatch) {
      portfolio = linkMatch[0];
    }

    // 4. Location search (heuristic for cities, states, universities or standard addresses)
    const locMatch = text.match(/[A-Z][a-zA-Z\s]+,\s*[A-Z]{2}/);
    if (locMatch) {
      location = locMatch[0];
    } else {
      // Find university or institute if no standard city/state location is found
      for (const l of lines) {
        if (/university|college|institute|iit|nit|iiit|gtu|technological/i.test(l) && l.length < 60) {
          location = l;
          break;
        }
      }
    }

    // Advanced Section Slicing
    const sections: { [key: string]: string[] } = {
      header: [],
      experience: [],
      projects: [],
      education: [],
      skills: []
    };

    let currentSection = 'header';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Clean leading dashes/bullets, colons, or numbers
      const cleanLine = line.replace(/^[\s#\d.*\-\–\|•·]+\s*/, '').replace(/[:\s]+$/, '').trim();
      const cleanLower = cleanLine.toLowerCase();
      
      let detectedSection = '';
      if (
        cleanLower === 'experience' || 
        cleanLower === 'work experience' || 
        cleanLower === 'professional experience' || 
        cleanLower === 'employment' || 
        cleanLower === 'work history' ||
        cleanLower === 'experience history'
      ) {
        detectedSection = 'experience';
      } else if (
        cleanLower === 'projects' || 
        cleanLower === 'personal projects' || 
        cleanLower === 'key projects' || 
        cleanLower === 'technical projects' || 
        cleanLower === 'academic projects' ||
        cleanLower === 'my projects'
      ) {
        detectedSection = 'projects';
      } else if (
        cleanLower === 'education' || 
        cleanLower === 'academic background' || 
        cleanLower === 'academic profile' || 
        cleanLower === 'qualifications' ||
        cleanLower === 'educational details' ||
        cleanLower === 'educational qualifications'
      ) {
        detectedSection = 'education';
      } else if (
        cleanLower === 'skills' || 
        cleanLower === 'technical skills' || 
        cleanLower === 'skills & tools' || 
        cleanLower === 'technologies' ||
        cleanLower === 'core skills' ||
        cleanLower === 'key skills'
      ) {
        detectedSection = 'skills';
      }

      if (detectedSection) {
        currentSection = detectedSection;
      } else {
        sections[currentSection].push(line);
      }
    }

    // 5. Parse Experience Section
    const experience: ResumeExperience[] = [];
    let currentExp: ResumeExperience | null = null;

    for (let i = 0; i < sections.experience.length; i++) {
      const line = sections.experience[i].trim();
      if (line.length === 0) continue;

      const isBullet = line.startsWith('-') || line.startsWith('•') || line.startsWith('*');
      const hasDate = /\b(19|20)\d{2}\b/i.test(line) || /\b(present|current|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i.test(line);
      const hasTitle = /\b(engineer|developer|intern|analyst|manager|lead|consultant|architect|programmer|specialist|designer|member|head|officer|scientist|fellow|assistant|associate|instructor)\b/i.test(line);
      
      const isNewJobHeader = !isBullet && (hasTitle || hasDate || (line.length < 65 && !line.includes('.') && i === 0));

      if (isNewJobHeader) {
        if (currentExp) {
          experience.push(currentExp);
        }
        
        let title = line;
        let company = 'Tech Organization';
        let period = '2024 — PRESENT';

        // Split by separators if present
        const separators = /[|—•·\t]|\s{2,}/;
        if (separators.test(line)) {
          const parts = line.split(separators).map(p => p.trim()).filter(p => p.length > 0);
          if (parts.length >= 3) {
            title = parts[0];
            company = parts[1];
            period = parts[2];
          } else if (parts.length === 2) {
            title = parts[0];
            company = parts[1];
            if (hasDate && (/\b(19|20)\d{2}\b/i.test(parts[1]) || /\b(present|current)\b/i.test(parts[1]))) {
              title = parts[0];
              period = parts[1];
              company = '';
            }
          }
        } else {
          // If no separator, inspect the next line as company name
          const nextLine = sections.experience[i + 1]?.trim();
          if (nextLine && !nextLine.startsWith('-') && !nextLine.startsWith('•') && !nextLine.startsWith('*') && nextLine.length < 60) {
            company = nextLine;
            i++;
            
            const thirdLine = sections.experience[i + 1]?.trim();
            if (thirdLine && /\b(19|20)\d{2}\b/i.test(thirdLine)) {
              period = thirdLine;
              i++;
            }
          }
        }

        // Extract dates embedded in headers
        const dateMatch = line.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\s*(19|20)\d{2}\s*[-–—to\s]+\s*(present|current|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\s*(19|20)?\d{2}\b/i);
        if (dateMatch) {
          period = dateMatch[0];
          title = title.replace(dateMatch[0], '').replace(/[()]/g, '').trim();
        }

        currentExp = {
          title: title || 'Software Intern',
          company: company || 'Technology Solutions',
          period: period === 'Date' ? '2024 — PRESENT' : period,
          bullets: []
        };
      } else if (currentExp) {
        const bulletText = line.replace(/^[-•*]\s*/, '').trim();
        if (bulletText.length > 0) {
          currentExp.bullets.push(bulletText);
        }
      } else {
        // Safe starter block
        currentExp = {
          title: 'Developer',
          company: 'Technology Firm',
          period: '2024 — PRESENT',
          bullets: [line.replace(/^[-•*]\s*/, '').trim()]
        };
      }
    }
    if (currentExp) experience.push(currentExp);

    // 6. Parse Projects Section
    const projects: ResumeProject[] = [];
    let currentProj: ResumeProject | null = null;

    for (let i = 0; i < sections.projects.length; i++) {
      const line = sections.projects[i].trim();
      if (line.length === 0) continue;

      const isBullet = line.startsWith('-') || line.startsWith('•') || line.startsWith('*');
      
      if (!isBullet && line.length < 55 && !line.includes('.') && !line.includes(',')) {
        if (currentProj) {
          projects.push(currentProj);
        }
        currentProj = {
          name: line,
          description: ''
        };
      } else if (currentProj) {
        const descPart = line.replace(/^[-•*]\s*/, '').trim();
        if (descPart.length > 0) {
          currentProj.description += (currentProj.description ? ' ' : '') + descPart;
        }
      } else {
        currentProj = {
          name: 'Personal Project',
          description: line.replace(/^[-•*]\s*/, '').trim()
        };
      }
    }
    if (currentProj) projects.push(currentProj);

    // 7. Parse Education Section
    let degree = 'B.Tech in Computer Science';
    let university = 'Gujarat Technological University';
    let graduated = '2026';

    for (let i = 0; i < sections.education.length; i++) {
      const line = sections.education[i].trim();
      if (line.length === 0) continue;

      const hasDegree = /\b(b\.?tech|m\.?tech|b\.?s|m\.?s|b\.?e|m\.?e|ph\.?d|b\.?c\.?a|m\.?c\.?a|bachelor|master|degree|diploma|school|senior|secondary)\b/i.test(line);
      const hasUniv = /\b(university|college|institute|school|academy|iit|nit|iiit|bits|gtu|technological|science|polytechnic)\b/i.test(line);
      const yearMatch = line.match(/\b(19|20)\d{2}\b/);

      if (hasDegree) {
        degree = line;
        if (yearMatch) {
          graduated = yearMatch[0];
          degree = degree.replace(yearMatch[0], '').replace(/[()–-]/g, '').trim();
        }
      } else if (hasUniv) {
        university = line;
      } else if (yearMatch && graduated === '2026') {
        graduated = yearMatch[0];
      }
    }
    const education: ResumeEducation = { degree, university, graduated };

    // Fallbacks if parsed lists are empty (guarantee the user's uploaded layout displays nicely)
    if (experience.length === 0) {
      // Put non-header lines into bullets
      const validLines = lines.slice(Math.min(5, lines.length)).filter(l => l.length > 25);
      if (validLines.length > 0) {
        experience.push({
          title: 'Professional Profile Summary',
          company: 'Resume Details',
          period: '2024 — PRESENT',
          bullets: validLines.slice(0, 5)
        });
      } else {
        experience.push({
          title: 'Software Developer',
          company: 'Tech Solutions Inc.',
          period: '2021 — PRESENT',
          bullets: [
            'Worked on internal software systems to improve performance.',
            'Collaborated with different engineering and design teams.',
            'Managed cloud infrastructures and deployment setups.'
          ]
        });
      }
    }

    if (projects.length === 0) {
      projects.push({
        name: 'Career Intelligence Intelligence Engine',
        description: 'Developed an automated resume analyzer and skill alignment dashboard built using Next.js and TailwindCSS.'
      });
    }

    return { name, email, location, portfolio, experience, projects, education };
  };

// Helper to rewrite bullets contextually while upgrading weak verbs and appending realistic metrics
function rewriteBullet(bullet: string): { improvement: string; reason: string } {
  const clean = bullet.trim();
  if (!clean) return { improvement: '', reason: '' };

  const hasMetric = /\b\d+(%|x|ms|s|kb|mb|gb|tb|k|m|b)?\b/i.test(clean) || /\b(percent|times|seconds|milliseconds)\b/i.test(clean);

  let rest = clean;
  let detectedVerb = '';

  const prefixPattern = /^(worked\s+on\s+building|worked\s+on\s+developing|worked\s+on\s+designing|worked\s+on|worked\s+to|helped\s+build|helped\s+develop|helped\s+design|helped\s+to|helped|assisted\s+in\s+building|assisted\s+in\s+developing|assisted\s+in\s+designing|assisted\s+in|assisted|responsible\s+for\s+building|responsible\s+for\s+developing|responsible\s+for\s+designing|responsible\s+for|responsible|managed|handled|created|built|developed|designed)\s+/i;

  const match = clean.match(prefixPattern);
  if (match) {
    const matchedPhrase = match[0].toLowerCase().trim();
    rest = clean.substring(match[0].length).trim();
    
    if (matchedPhrase.includes('design')) {
      detectedVerb = 'Spearheaded the design of';
    } else if (matchedPhrase.includes('build') || matchedPhrase.includes('develop')) {
      detectedVerb = 'Engineered';
    } else if (matchedPhrase.includes('creat')) {
      detectedVerb = 'Architected';
    } else if (matchedPhrase.includes('manag') || matchedPhrase.includes('handl') || matchedPhrase.includes('respons')) {
      detectedVerb = 'Orchestrated';
    } else {
      detectedVerb = 'Engineered';
    }
  }

  if (detectedVerb) {
    let firstChar = rest.charAt(0);
    if (firstChar === firstChar.toUpperCase() && !/^[a-zA-Z]/.test(firstChar)) {
      // not a letter
    } else {
      rest = firstChar.toLowerCase() + rest.slice(1);
    }
    rest = `${detectedVerb} ${rest}`;
  } else {
    rest = clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  const bLower = clean.toLowerCase();
  let metricSuffix = '';
  let reason = '';

  if (bLower.includes('perform') || bLower.includes('speed') || bLower.includes('fast') || bLower.includes('optimi') || bLower.includes('latenc')) {
    metricSuffix = ', resulting in a 35% reduction in latency and a 200ms decrease in page load times';
    reason = 'Add clear metrics (e.g., response latency or page load speeds) to quantify your performance optimizations.';
  } else if (bLower.includes('database') || bLower.includes('db') || bLower.includes('sql') || bLower.includes('postgres') || bLower.includes('mongodb') || bLower.includes('queries') || bLower.includes('query')) {
    metricSuffix = ', optimizing query execution paths and reducing database response latency by 38% under high concurrency';
    reason = 'Include query latency, scaling statistics, or execution plans to demonstrate database optimization skills.';
  } else if (bLower.includes('react') || bLower.includes('frontend') || bLower.includes('ui') || bLower.includes('ux') || bLower.includes('web') || bLower.includes('components') || bLower.includes('next')) {
    metricSuffix = ', improving Google Lighthouse performance scores by 25% and core web vitals (LCP/INP)';
    reason = 'Quantify UI rendering optimizations and performance using metrics like Lighthouse or LCP/INP.';
  } else if (bLower.includes('api') || bLower.includes('backend') || bLower.includes('django') || bLower.includes('fastapi') || bLower.includes('express') || bLower.includes('node') || bLower.includes('server')) {
    metricSuffix = ', reducing server response times by 30% and supporting over 10,000 active daily users';
    reason = 'Incorporate load capabilities, active users, or latency improvements to showcase backend scalability.';
  } else if (bLower.includes('docker') || bLower.includes('kubernetes') || bLower.includes('cicd') || bLower.includes('ci/cd') || bLower.includes('pipeline') || bLower.includes('deploy') || bLower.includes('aws') || bLower.includes('cloud')) {
    metricSuffix = ', decreasing end-to-end integration and deployment build times by 45%';
    reason = 'Quantify deployment cycle speeds, cost reductions, or pipeline efficiencies.';
  } else if (bLower.includes('leetcode') || bLower.includes('dsa') || bLower.includes('solved') || bLower.includes('competit') || bLower.includes('problem')) {
    metricSuffix = ', solving 500+ problems and placing in the top 5% of global competitors';
    reason = 'Add specific counts of solved problems and national/global ranking percentages.';
  } else if (bLower.includes('collaborat') || bLower.includes('team') || bLower.includes('work with') || bLower.includes('partner') || bLower.includes('mentor') || bLower.includes('led')) {
    metricSuffix = ' across a cross-functional team of 6 engineers to deliver releases 2 weeks ahead of schedule';
    reason = 'Specify team sizes and accelerated project timelines to highlight collaboration and leadership.';
  } else if (bLower.includes('test') || bLower.includes('testing') || bLower.includes('qa') || bLower.includes('cypress') || bLower.includes('jest')) {
    metricSuffix = ', boosting system code coverage from 55% to 88% and reducing regression bugs';
    reason = 'Showcase quality assurance impact with code coverage and regression prevention metrics.';
  } else {
    metricSuffix = ', increasing overall workflow efficiency by 22%';
    reason = 'Add a clear quantitative outcome or percentage metric to highlight the impact of your work.';
  }

  if (rest.endsWith('.')) {
    rest = rest.slice(0, -1);
  }

  if (!hasMetric) {
    rest = `${rest}${metricSuffix}.`;
  } else {
    rest = `${rest}.`;
  }

  return {
    improvement: rest,
    reason
  };
}

  // Analyze the extracted data to build dynamic improvements
  const generateDynamicSuggestions = (data: ParsedResume, role: string) => {
    const roleLower = role.toLowerCase();
    
    // 1. Content Optimization Suggestions (smart context-based rewrites)
    const quantify: Suggestion[] = [];
    
    // Scan experience bullets for improvement
    data.experience.forEach(exp => {
      exp.bullets.forEach(bullet => {
        const clean = bullet.trim();
        if (clean.length === 0) return;
        
        const hasNumber = /\b\d+%?\b/.test(clean);
        const firstWord = clean.split(' ')[0] || '';
        const isWeakVerb = /^(worked|helped|assisted|responsible|managed|handled|created|built|developed|designed|made|did|used|wrote|coded)/i.test(firstWord);
        
        if (!hasNumber || isWeakVerb) {
          const { improvement, reason } = rewriteBullet(clean);
          if (improvement && reason) {
            quantify.push({ original: bullet, improvement, reason, type: 'experience' });
          }
        }
      });
    });

    // Scan projects for short descriptions or lack of metrics
    data.projects.forEach(proj => {
      const desc = proj.description.trim();
      if (desc.length > 0) {
        const hasNumber = /\b\d+%?\b/.test(desc);
        const bLower = desc.toLowerCase();
        
        if (!hasNumber || desc.length < 120) {
          let improvement = desc;
          let reason = '';
          
          if (bLower.includes('web') || bLower.includes('app') || bLower.includes('dashboard') || bLower.includes('portfolio') || bLower.includes('frontend')) {
            improvement = `${desc} Integrated modern state management and responsive styling, improving Lighthouse accessibility and performance ratings to 98%.`;
            reason = `Expand "${proj.name}" description to detail the responsive layout, state management, and performance scoring.`;
          } else if (bLower.includes('api') || bLower.includes('backend') || bLower.includes('server') || bLower.includes('service')) {
            improvement = `${desc} Engineered RESTful microservices architecture, implementing Redis caching to reduce peak API payload retrieval latency by 40%.`;
            reason = `Add architectural elements like caching, microservices, and database performance metrics to "${proj.name}".`;
          } else if (bLower.includes('ml') || bLower.includes('ai') || bLower.includes('model') || bLower.includes('data')) {
            improvement = `${desc} Implemented vector embeddings and similarity metrics, increasing query matching recall accuracy to 94%.`;
            reason = `Detail the model metrics, vector space, or training accuracy improvements in "${proj.name}".`;
          } else {
            improvement = `${desc} Built modular components and optimized system workflows, resulting in a 25% increase in operational throughput.`;
            reason = `Include a clear technological scope and system-wide performance metric for "${proj.name}".`;
          }
          
          quantify.push({
            original: desc,
            improvement,
            reason,
            type: 'project'
          });
        }
      }
    });

    // Fallback if they have numbers/strong verbs in all bullets and good project sizes
    if (quantify.length === 0) {
      quantify.push({
        original: 'Maintained cloud servers.',
        improvement: 'Optimized server allocation, reducing cloud infrastructure expenditure by 15% annually.',
        reason: 'Quantify impact metrics.',
        type: 'experience'
      });
    }

    // 2. Keyword Alignment Tags based on target role
    let missingKeywords = ['Docker', 'Kubernetes', 'CI/CD Pipelines'];
    if (roleLower.includes('front') || roleLower.includes('react') || roleLower.includes('ui') || roleLower.includes('web')) {
      missingKeywords = ['Next.js', 'TypeScript', 'TailwindCSS', 'Framer Motion', 'Web Accessibility (a11y)'];
    } else if (roleLower.includes('back') || roleLower.includes('api') || roleLower.includes('node') || roleLower.includes('server')) {
      missingKeywords = ['Redis', 'PostgreSQL', 'System Design', 'Kafka', 'GraphQL', 'gRPC'];
    } else if (roleLower.includes('ml') || roleLower.includes('ai') || roleLower.includes('learning') || roleLower.includes('nlp')) {
      missingKeywords = ['PyTorch', 'RAG Frameworks', 'Vector Databases', 'Model Fine-Tuning', 'Hugging Face'];
    } else if (roleLower.includes('devops') || roleLower.includes('cloud') || roleLower.includes('sre') || roleLower.includes('infrastructure')) {
      missingKeywords = ['Terraform', 'Kubernetes', 'Prometheus & Grafana', 'AWS Hosting', 'Ansible'];
    } else if (roleLower.includes('java')) {
      missingKeywords = ['Spring Boot', 'Hibernate', 'Microservices', 'REST APIs', 'JUnit'];
    } else if (roleLower.includes('python')) {
      missingKeywords = ['FastAPI', 'Django', 'Pandas', 'NumPy', 'PostgreSQL'];
    } else if (roleLower.includes('mobile') || roleLower.includes('android') || roleLower.includes('ios') || roleLower.includes('swift') || roleLower.includes('kotlin') || roleLower.includes('flutter')) {
      missingKeywords = ['React Native', 'Flutter', 'SwiftUI', 'Kotlin', 'Mobile UX', 'App Store Deployment'];
    } else {
      missingKeywords = ['Docker', 'CI/CD Pipelines', 'System Design', 'Unit Testing', 'RESTful APIs'];
    }

    // Filter out keywords they already mention in their resume (case-insensitive)
    const resumeTextNormalized = JSON.stringify(data).toLowerCase();
    missingKeywords = missingKeywords.filter(kw => !resumeTextNormalized.includes(kw.toLowerCase()));

    // 3. Action Verbs (provide contextual strong verbs matching their field)
    let actionVerbs = ['Orchestrated', 'Spearheaded', 'Engineered', 'Streamlined'];
    if (roleLower.includes('front') || roleLower.includes('ui')) {
      actionVerbs = ['Re-engineered', 'Architected', 'Spearheaded', 'Optimized'];
    } else if (roleLower.includes('ml') || roleLower.includes('ai')) {
      actionVerbs = ['Synthesized', 'Fine-tuned', 'Deployed', 'Engineered'];
    } else if (roleLower.includes('devops') || roleLower.includes('cloud')) {
      actionVerbs = ['Automated', 'Provisioned', 'Orchestrated', 'Hardened'];
    }

    // 4. Calculate Score
    let score = 95;
    if (quantify.filter(q => q.type === 'experience').length > 0) score -= (quantify.filter(q => q.type === 'experience').length * 5);
    if (quantify.filter(q => q.type === 'project').length > 0) score -= 5;
    if (missingKeywords.length > 2) score -= 8;
    score = Math.max(50, Math.min(98, score));

    return { quantify, missingKeywords, actionVerbs, score };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const startAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole) return;
    if (!file && !pastedText) return;

    setIsAnalyzing(true);
    setLoadingStep(1);

    try {
      let text = '';
      
      if (file) {
        // Read file
        if (file.type === 'application/pdf') {
          setLoadingStep(2);
          text = await parsePdf(file);
        } else {
          setLoadingStep(2);
          text = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string || '');
            reader.readAsText(file);
          });
        }
      } else {
        text = pastedText;
      }

      setLoadingStep(3);
      
      // Delay for premium feedback animation loop
      setTimeout(() => {
        const parsed = parseResumeText(text);
        const results = generateDynamicSuggestions(parsed, targetRole);
        
        setParsedData(parsed);
        setSuggestions(results);
        setIsAnalyzing(false);
        setStep(2);
      }, 2000);

    } catch (err) {
      console.error(err);
      alert('Error parsing resume. Falling back to default structured preview.');
      // Fallback
      const parsed = parseResumeText(pastedText || 'Alex Sterling\nalex@devdna.ai\nSan Francisco');
      const results = generateDynamicSuggestions(parsed, targetRole);
      setParsedData(parsed);
      setSuggestions(results);
      setIsAnalyzing(false);
      setStep(2);
    }
  };

  const applySuggestion = (sug: Suggestion) => {
    if (!parsedData) return;
    
    if (sug.type === 'project') {
      const updatedProjects = parsedData.projects.map(proj => {
        if (proj.description.trim() === sug.original || proj.description === sug.original) {
          return { ...proj, description: sug.improvement };
        }
        return proj;
      });
      setParsedData({ ...parsedData, projects: updatedProjects });
    } else {
      const updatedExperience = parsedData.experience.map(exp => {
        const updatedBullets = exp.bullets.map(b => (b === sug.original ? sug.improvement : b));
        return { ...exp, bullets: updatedBullets };
      });
      setParsedData({ ...parsedData, experience: updatedExperience });
    }

    setSuggestions(prev => {
      const remainingQuantify = prev.quantify.filter(s => s.original !== sug.original);
      let score = 95;
      if (remainingQuantify.filter(q => q.type === 'experience').length > 0) {
        score -= (remainingQuantify.filter(q => q.type === 'experience').length * 5);
      }
      if (remainingQuantify.filter(q => q.type === 'project').length > 0) {
        score -= 5;
      }
      if (prev.missingKeywords.length > 2) {
        score -= 8;
      }
      score = Math.max(50, Math.min(100, score));

      return {
        ...prev,
        quantify: remainingQuantify,
        score
      };
    });
  };


  return (
    <div className="dashboard-layout" style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f7f6f1',
      color: '#1a1a1a',
      fontFamily: 'var(--font-inter), sans-serif'
    }}>
      


      <main style={{
        flex: 1,
        padding: '2rem 3rem',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        overflowX: 'hidden',
        backgroundImage: 'url("/resume_background.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        


        {step === 1 ? (
          /* STEP 1: UPLOAD STATE */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            maxWidth: '600px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <h1 className="serif" style={{ fontSize: '2.5rem', fontWeight: 500, color: '#1a1a1a', marginBottom: '0.5rem' }}>Resume Optimizer</h1>
            <p style={{ color: '#6b6b6b', marginBottom: '2.5rem' }}>Align your resume dynamically to your target job preparation track.</p>
            
            <form onSubmit={startAnalysis} style={{ 
              width: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1.5rem', 
              backgroundColor: '#ffffff', 
              padding: '2.5rem', 
              borderRadius: '24px', 
              border: '1px solid #e5e3dc', 
              boxShadow: '0 10px 40px rgba(0,0,0,0.02)' 
            }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b6b6b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  What role are you preparing for?
                </label>
                <input 
                  type="text" 
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g., Frontend Developer, DevOps Architect"
                  required
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px solid #e5e3dc',
                    fontSize: '0.95rem',
                    outline: 'none',
                    backgroundColor: '#faf9f5'
                  }}
                  onFocus={(e) => e.target.style.border = '1px solid #3f7055'}
                  onBlur={(e) => e.target.style.border = '1px solid #e5e3dc'}
                />
              </div>

              {!showPasteInput ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b6b6b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Upload Resume
                  </label>
                  <div style={{
                    border: '2px dashed #d1e6db',
                    borderRadius: '16px',
                    padding: '3rem 2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#faf9f5',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.txt,.json"
                      style={{ display: 'none' }}
                    />
                    
                    {file ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={42} style={{ color: '#3f7055' }} />
                        <span style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1a1a' }}>{file.name}</span>
                        <span style={{ fontSize: '0.75rem', color: '#6b6b6b' }}>{(file.size / 1024).toFixed(1)} KB</span>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                          }}
                          style={{
                            marginTop: '0.5rem',
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem'
                          }}
                        >
                          <X size={14} /> Remove File
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Custom Ingestion Style Button */}
                        <div style={{
                          border: '1.5px solid #3f7055',
                          borderRadius: '24px',
                          color: '#3f7055',
                          padding: '0.6rem 2rem',
                          fontWeight: 600,
                          fontSize: '1rem',
                          backgroundColor: '#eef6f2',
                          marginBottom: '1rem',
                          transition: 'all 0.2s',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#3f7055';
                          e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#eef6f2';
                          e.currentTarget.style.color = '#3f7055';
                        }}
                        >
                          Upload & Ingest Resume
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#6b6b6b' }}>Supports PDF, TXT, JSON (Max 5MB)</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPasteInput(true);
                          }}
                          style={{
                            marginTop: '1.5rem',
                            background: 'none',
                            border: 'none',
                            color: '#3f7055',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            textDecoration: 'underline',
                            cursor: 'pointer'
                          }}
                        >
                          Or paste plain text resume
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b6b6b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      Paste Resume Text
                    </label>
                    <button 
                      type="button"
                      onClick={() => {
                        setShowPasteInput(false);
                        setPastedText('');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#6b6b6b',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Back to file upload
                    </button>
                  </div>
                  <textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Paste the full text of your resume here..."
                    rows={8}
                    required
                    style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '1px solid #e5e3dc',
                      fontSize: '0.9rem',
                      outline: 'none',
                      backgroundColor: '#faf9f5',
                      fontFamily: 'monospace',
                      resize: 'vertical'
                    }}
                  />
                </div>
              )}

              <button 
                type="submit" 
                disabled={isAnalyzing || (!file && !pastedText) || !targetRole}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  backgroundColor: '#3f7055',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: (isAnalyzing || (!file && !pastedText) || !targetRole) ? 'not-allowed' : 'pointer',
                  opacity: (isAnalyzing || (!file && !pastedText) || !targetRole) ? 0.7 : 1,
                  transition: 'all 0.2s',
                  marginTop: '0.5rem'
                }}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw size={18} className="spin-anim" />
                    <span>
                      {loadingStep === 1 && "Ingesting file..."}
                      {loadingStep === 2 && "Extracting text via PDFJS..."}
                      {loadingStep === 3 && "Analyzing role alignment..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Analyze & Get Recommendations</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* STEP 2: ANALYSIS RESULTS STATE */
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.3fr 1fr',
            gap: '2.5rem',
            alignItems: 'start'
          }}>
            
            {/* Left Column: Parsed Resume (Interactive Document View) */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '3rem',
              border: '1px solid #e5e3dc',
              boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
              position: 'relative'
            }}>
              
              {/* Reset/New Upload Button */}
              <button 
                onClick={() => {
                  setStep(1);
                  setFile(null);
                  setPastedText('');
                }}
                style={{
                  position: 'absolute',
                  top: '1.5rem',
                  right: '1.5rem',
                  background: 'none',
                  border: '1px solid #e5e3dc',
                  borderRadius: '16px',
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.8rem',
                  color: '#6b6b6b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.2s'
                }}
              >
                <Upload size={12} /> Upload New
              </button>

              {/* Watermark */}
              <div style={{ position: 'absolute', top: '4rem', right: '3rem', opacity: 0.08, pointerEvents: 'none' }}>
                <svg width="100" height="150" viewBox="0 0 100 150" fill="none">
                  <path d="M20 10 Q 50 75, 80 10 M20 140 Q 50 75, 80 140 M20 75 L 80 75 M35 42 L 65 42 M35 107 L 65 107" stroke="#3f7055" strokeWidth="8" strokeLinecap="round"/>
                </svg>
              </div>

              {/* Resume Header */}
              <div style={{ borderBottom: '2px solid #efeadd', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                <h1 className="serif" style={{ fontSize: '2.8rem', fontWeight: 600, color: '#3f7055', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
                  {parsedData?.name}
                </h1>
                <div style={{ display: 'flex', gap: '1.5rem', color: '#5b6b63', fontSize: '0.85rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    {parsedData?.email}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    {parsedData?.location}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    {parsedData?.portfolio}
                  </span>
                </div>
              </div>

              {/* Experience */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#3f7055', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3f7055' }}></span>
                  Experience
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {parsedData?.experience.map((exp, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.2rem' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>{exp.title}</h4>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, backgroundColor: '#efeadd', padding: '0.2rem 0.6rem', borderRadius: '12px', color: '#5b6b63', letterSpacing: '0.05em' }}>{exp.period}</span>
                      </div>
                      <span style={{ fontSize: '0.9rem', color: '#3f7055', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>{exp.company}</span>
                      
                      <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem', color: '#1a1a1a', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {exp.bullets.map((b, bi) => {
                          // Highlight the first bullet that we target for quantify improvement
                          const isTarget = suggestions.quantify.some(s => s.original === b);
                          return (
                            <li 
                              key={bi} 
                              style={{ 
                                lineHeight: 1.5, 
                                position: 'relative',
                                padding: isTarget ? '0.25rem 0.5rem' : '0',
                                backgroundColor: isTarget ? 'rgba(255, 161, 22, 0.08)' : 'transparent',
                                border: isTarget ? '1px dashed #ffa116' : 'none',
                                borderRadius: isTarget ? '6px' : 'none'
                              }}
                            >
                              {b}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#3f7055', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3f7055' }}></span>
                  Projects
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {parsedData?.projects.map((proj, i) => {
                    const isTarget = suggestions.quantify.some(s => s.original === proj.description.trim());
                    return (
                      <div key={i}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1a1a', margin: '0 0 0.2rem 0' }}>{proj.name}</h4>
                        <p 
                          style={{ 
                            fontSize: '0.9rem', 
                            color: '#1a1a1a', 
                            margin: 0, 
                            lineHeight: 1.5,
                            position: 'relative',
                            padding: isTarget ? '0.25rem 0.5rem' : '0',
                            backgroundColor: isTarget ? 'rgba(255, 161, 22, 0.08)' : 'transparent',
                            border: isTarget ? '1px dashed #ffa116' : 'none',
                            borderRadius: isTarget ? '6px' : 'none'
                          }}
                        >
                          {proj.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Education */}
              <div>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#3f7055', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3f7055' }}></span>
                  Education
                </h3>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1a1a', margin: '0 0 0.2rem 0' }}>{parsedData?.education.degree}</h4>
                    <span style={{ fontSize: '0.9rem', color: '#5b6b63', fontStyle: 'italic' }}>{parsedData?.education.university}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#5b6b63' }}>Graduated {parsedData?.education.graduated}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Suggestions & Custom Improvement Score */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '2rem' }}>
              
              <div style={{ padding: '0 0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#3f7055', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                    <Sparkles size={16} />
                  </div>
                  <h2 className="serif" style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>AI Suggestions</h2>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#6b6b6b', margin: 0 }}>
                  Tailored suggestions based on your target role: <strong style={{ color: '#3f7055' }}>{targetRole}</strong>
                </p>
              </div>

              {/* Suggestion 1: Quantifying Impact */}
              {suggestions.quantify.length > 0 && (
                <div style={{ 
                  backgroundColor: '#ffffff', 
                  borderRadius: '16px', 
                  padding: '1.5rem', 
                  border: '1px solid #e5e3dc', 
                  boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={16} style={{ color: '#3f7055' }} />
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>Quantifying Impact</h3>
                    </div>
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, backgroundColor: 'rgba(255, 161, 22, 0.1)', color: '#d68200', padding: '0.25rem 0.6rem', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {suggestions.quantify.length} Suggestion{suggestions.quantify.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <p style={{ fontSize: '0.85rem', color: '#6b6b6b', lineHeight: 1.5, margin: 0 }}>
                    Some bullets lack numbers or percentages. Recruiters scan for quantitative results.
                  </p>

                  <div style={{ 
                    maxHeight: '350px', 
                    overflowY: 'auto', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '1rem',
                    paddingRight: '4px'
                  }}>
                    {suggestions.quantify.map((sug, idx) => (
                      <div key={idx} style={{ 
                        backgroundColor: '#faf9f5', 
                        border: '1px solid #e5e3dc', 
                        borderRadius: '12px', 
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        textAlign: 'left'
                      }}>
                        {/* Type/Reason Label */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ 
                            fontSize: '0.7rem', 
                            fontWeight: 700, 
                            color: sug.type === 'project' ? '#a17204' : '#3f7055',
                            backgroundColor: sug.type === 'project' ? '#faf2db' : '#eef6f2',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                            textTransform: 'uppercase'
                          }}>
                            {sug.type === 'project' ? 'Project' : 'Experience'}
                          </span>
                        </div>

                        {/* Reason */}
                        <p style={{ fontSize: '0.8rem', color: '#6b6b6b', margin: 0, fontWeight: 500 }}>
                          💡 {sug.reason}
                        </p>

                        {/* Before (Original) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Before:</span>
                          <p style={{ fontSize: '0.8rem', color: '#7f8c8d', margin: 0, textDecoration: 'line-through', lineHeight: 1.4 }}>
                            "{sug.original}"
                          </p>
                        </div>

                        {/* After (Improvement) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>After:</span>
                          <p style={{ fontSize: '0.85rem', color: '#1a1a1a', margin: 0, lineHeight: 1.4, fontWeight: 500 }}>
                            "{sug.improvement}"
                          </p>
                        </div>

                        {/* Apply Button */}
                        <button
                          onClick={() => applySuggestion(sug)}
                          style={{
                            alignSelf: 'flex-end',
                            backgroundColor: '#eef6f2',
                            border: '1px solid #c9dfd3',
                            borderRadius: '8px',
                            color: '#3f7055',
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#3f7055';
                            e.currentTarget.style.color = '#ffffff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#eef6f2';
                            e.currentTarget.style.color = '#3f7055';
                          }}
                        >
                          <Sparkles size={12} /> Apply Rewrite
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestion 2: Keyword Alignment */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e5e3dc', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={16} style={{ color: '#3f7055' }} />
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>Keyword Alignment</h3>
                  </div>
                  <span style={{ fontSize: '0.6rem', fontWeight: 800, backgroundColor: '#efeadd', color: '#5b6b63', padding: '0.25rem 0.6rem', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    SEO Fix
                  </span>
                </div>
                
                <p style={{ fontSize: '0.85rem', color: '#6b6b6b', lineHeight: 1.5, marginBottom: '1rem' }}>
                  {suggestions.missingKeywords.length > 0 ? (
                    <>Add these critical terms to rank higher in searches for <strong style={{ color: '#1a1a1a' }}>{targetRole}</strong>:</>
                  ) : (
                    <>Fantastic! Your resume is highly keyword-aligned for this role.</>
                  )}
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {suggestions.missingKeywords.map((kw, idx) => (
                    <span key={idx} style={{ fontSize: '0.75rem', fontWeight: 500, color: '#5b6b63', backgroundColor: '#efeadd', padding: '0.4rem 0.8rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Plus size={12} /> {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Suggestion 3: Action Verbs */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e5e3dc', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <TrendingUp size={16} style={{ color: '#3f7055' }} />
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>Action Verbs</h3>
                </div>
                
                <p style={{ fontSize: '0.85rem', color: '#6b6b6b', lineHeight: 1.5, marginBottom: '1rem' }}>
                  Boost readability by replacing weak or passive phrasing with active industry verbs.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {suggestions.actionVerbs.map((verb, idx) => (
                    <div key={idx} style={{ border: '1px solid #e5e3dc', borderRadius: '16px', padding: '0.5rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 500, color: '#1a1a1a' }}>
                      {verb}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Score Card */}
              <div style={{ backgroundColor: '#3f7055', borderRadius: '16px', padding: '1.5rem', color: '#ffffff', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', width: '120px', height: '120px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={48} style={{ color: 'rgba(255,255,255,0.8)' }} />
                </div>
                
                <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.9, display: 'block', marginBottom: '0.5rem' }}>
                  Current Resume Score
                </span>
                
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem', marginBottom: '1.5rem' }}>
                  <span className="serif" style={{ fontSize: '3rem', fontWeight: 600, lineHeight: 1 }}>{suggestions.score}</span>
                  <span style={{ fontSize: '1rem', fontWeight: 500, opacity: 0.8 }}>/100</span>
                </div>

                <button 
                  onClick={() => {
                    if (parsedData) {
                      // Apply to experience bullets
                      const updatedExperience = parsedData.experience.map(exp => {
                        const updatedBullets = exp.bullets.map(b => {
                          const matchingSuggestion = suggestions.quantify.find(s => s.original === b && s.type !== 'project');
                          return matchingSuggestion ? matchingSuggestion.improvement : b;
                        });
                        return { ...exp, bullets: updatedBullets };
                      });
                      
                      // Apply to projects
                      const updatedProjects = parsedData.projects.map(proj => {
                        const matchingSuggestion = suggestions.quantify.find(s => s.original === proj.description.trim() && s.type === 'project');
                        return {
                          ...proj,
                          description: matchingSuggestion ? matchingSuggestion.improvement : proj.description
                        };
                      });

                      setParsedData({
                        ...parsedData,
                        experience: updatedExperience,
                        projects: updatedProjects
                      });
                      setSuggestions({
                        ...suggestions,
                        quantify: [],
                        score: 100
                      });
                    }
                  }}
                  style={{ backgroundColor: '#ffffff', color: '#3f7055', border: 'none', borderRadius: '24px', padding: '0.8rem 1.5rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', zIndex: 1, position: 'relative', transition: 'all 0.2s' }}
                >
                  Apply All Improvements
                </button>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
