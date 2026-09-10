import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText, Sparkles, Download, Loader2, Briefcase, Code,
    User, BookOpen, Layers, Award, ChevronDown, ChevronUp, ChevronRight,
    Trash2, Plus, ZoomIn, ZoomOut, Eye, Check, Palette,
    Type, ExternalLink, Maximize2, Trophy
} from 'lucide-react';
import axios from '../../utils/axios';
import { currentUserAPI } from '../../services/api';
import Skeleton from '../../components/ui/Skeleton';
import { customConfirm } from '../../components/layout/ConfirmDialog';

const SAMPLE_ATS_URL = 'https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs.pdf';

const ATS_FONTS = [
    { label: 'Template Default', value: 'default' },
    { label: 'Arial', value: "Arial, Helvetica, sans-serif" },
    { label: 'Calibri', value: "Calibri, 'Segoe UI', sans-serif" },
    { label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
    { label: 'Georgia', value: "Georgia, serif" },
    { label: 'Garamond', value: "Garamond, serif" },
    { label: 'Trebuchet MS', value: "'Trebuchet MS', sans-serif" }
];

/* ═══════════════════════════════════════════════════════════════════════════
   TEMPLATE DEFINITIONS — each template is a style-config object.
   The resume renderer reads these values and applies them as inline styles
   so that the print output is 100% reliable (no Tailwind dependency).
   ═══════════════════════════════════════════════════════════════════════════ */
const TEMPLATES = {
    classic: {
        id: 'classic',
        name: 'Classic',
        desc: 'Traditional ATS format',
        font: "'Times New Roman', Times, serif",
        nameSize: '18pt', nameWeight: 700, nameTransform: 'uppercase', nameSpacing: '0',
        headingSize: '12.5pt',
        heading: { fontWeight: 700, textTransform: 'uppercase', borderBottom: '1.5px solid #000', paddingBottom: '1px', color: '#000', letterSpacing: '0' },
        bodySize: '11pt', lineHeight: '1.18',
        pagePadding: '10mm 14mm 10mm 14mm',
        linkColor: '#0563C1',
        sectionGap: '4px', itemGap: '3px',
        bullet: '•', subBullet: '◦',
        contactSep: ' | ',
    },
    modern: {
        id: 'modern',
        name: 'Modern',
        desc: 'Clean blue accents',
        font: "'Calibri', 'Segoe UI', 'Helvetica Neue', sans-serif",
        nameSize: '20pt', nameWeight: 700, nameTransform: 'none', nameSpacing: '0.5px',
        headingSize: '12pt',
        heading: { fontWeight: 700, textTransform: 'uppercase', borderBottom: '2px solid #2563EB', paddingBottom: '2px', color: '#1e40af', letterSpacing: '1px' },
        bodySize: '11pt', lineHeight: '1.22',
        pagePadding: '12mm 15mm 12mm 15mm',
        linkColor: '#2563EB',
        sectionGap: '6px', itemGap: '4px',
        bullet: '▪', subBullet: '–',
        contactSep: '  •  ',
    },
    crisp: {
        id: 'crisp',
        name: 'Crisp',
        desc: 'Compact & clean',
        font: "'Arial', Helvetica, sans-serif",
        nameSize: '17pt', nameWeight: 700, nameTransform: 'uppercase', nameSpacing: '2px',
        headingSize: '12pt',
        heading: { fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #444', paddingBottom: '1px', color: '#222', letterSpacing: '1px' },
        bodySize: '11pt', lineHeight: '1.18',
        pagePadding: '9mm 12mm 9mm 12mm',
        linkColor: '#0066cc',
        sectionGap: '4px', itemGap: '3px',
        bullet: '•', subBullet: '–',
        contactSep: ' | ',
    },
    elegant: {
        id: 'elegant',
        name: 'Elegant',
        desc: 'Refined serif styling',
        font: "'Georgia', Cambria, 'Times New Roman', serif",
        nameSize: '20pt', nameWeight: 700, nameTransform: 'uppercase', nameSpacing: '2px',
        headingSize: '12.5pt',
        heading: { fontWeight: 700, textTransform: 'uppercase', borderBottom: '1.5px solid #1a1a2e', paddingBottom: '2px', color: '#1a1a2e', letterSpacing: '1.5px' },
        bodySize: '11pt', lineHeight: '1.2',
        pagePadding: '12mm 15mm 12mm 15mm',
        linkColor: '#2c3e6b',
        sectionGap: '5px', itemGap: '4px',
        bullet: '■', subBullet: '•',
        contactSep: '  |  ',
    },
};

/* ═══════════════════════════════════════════════════════════════════════════
   REUSABLE FORM UI COMPONENTS
   ═══════════════════════════════════════════════════════════════════════════ */
const inputCls = "w-full bg-slate-50/60 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all shadow-xs";
const labelCls = "block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5";

const Section = ({ icon: Icon, title, number, color, children, accent, count }) => {
    const [open, setOpen] = useState(true);
    return (
        <div className="mb-4 bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs transition-colors">
            <button 
                type="button"
                onClick={() => setOpen(o => !o)} 
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left group hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
            >
                <span className={`w-6 h-6 rounded-lg ${accent} flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs`}>
                    {number}
                </span>
                <Icon className={`w-4 h-4 ${color} shrink-0`} />
                <span className="font-bold text-slate-800 dark:text-slate-100 text-sm flex-1">
                    {title}
                </span>
                {count !== undefined && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mr-1">
                        {count}
                    </span>
                )}
                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">
                    {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </button>
            {open && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    {children}
                </div>
            )}
        </div>
    );
};

const ItemCard = ({ onDelete, children }) => (
    <div className="relative p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/70 rounded-2xl mb-3.5 group hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all shadow-xs">
        {children}
        <button 
            type="button"
            onClick={onDelete} 
            className="absolute -top-2.5 -right-2.5 p-1.5 rounded-xl bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:border-rose-200 dark:hover:border-rose-900 transition-all z-20 flex items-center justify-center cursor-pointer" 
            title="Remove"
        >
            <Trash2 className="w-3.5 h-3.5" />
        </button>
    </div>
);

const AiBtn = ({ onClick, loading, label = 'AI Enhance', colorCls = 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/70 dark:border-indigo-800/60' }) => (
    <button 
        type="button"
        onClick={onClick} 
        disabled={loading} 
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer active:scale-95 ${colorCls}`}
    >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
        {label}
    </button>
);

const AddBtn = ({ onClick, label }) => (
    <button 
        type="button"
        onClick={onClick} 
        className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer mt-1 group"
    >
        <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-colors">
            <Plus className="w-2.5 h-2.5" />
        </span>
        {label}
    </button>
);

/* ═══════════════════════════════════════════════════════════════════════════
   RESUME RENDERER — All inline styles, zero Tailwind inside.
   Produces clean, ATS-parseable HTML that prints perfectly.
   ═══════════════════════════════════════════════════════════════════════════ */
const ResumeContent = ({ data, templateId, fontSizeOffset = 0, fontFamily = 'default' }) => {
    const t = TEMPLATES[templateId] || TEMPLATES.classic;
    const d = data;

    const activeFont = fontFamily !== 'default' ? fontFamily : t.font;

    // Parse pt values and apply user's font size offset
    const adjustSize = (sizeStr) => {
        const val = parseFloat(sizeStr);
        return `${(val + fontSizeOffset).toFixed(1)}pt`;
    };
    const bodySize = adjustSize(t.bodySize);
    const headingSize = adjustSize(t.headingSize);
    const nameSize = adjustSize(t.nameSize);

    // Filter to only non-empty items
    const education = (d.education || []).filter(e => e.institution || e.degree);
    const experience = (d.experience || []).filter(e => e.company || e.title);
    const projects = (d.projects || []).filter(p => p.name);
    const certifications = (d.certifications || []).filter(c => c.name);
    const skills = (d.skills || []).filter(s => s.category || s.items);
    const achievements = (d.achievements || []).filter(a => a.title);
    const hasSummary = d.summary && d.summary.trim();

    // Dynamic section gap: more sections → tighter spacing
    const activeSections = [hasSummary, education.length, experience.length, projects.length, certifications.length, skills.length, achievements.length].filter(Boolean).length;
    const sGap = activeSections <= 3 ? '8px' : activeSections <= 5 ? t.sectionGap : '3px';

    // Contact info builder
    const contactParts = [d.personal.phone, d.personal.email, d.personal.location].filter(Boolean);
    const mkHref = (url) => url.startsWith('http') ? url : `https://${url}`;

    // Inline icon helpers — small logos for the resume
    const ico = (src, alt, size = '11px') => (
        <img src={src} alt={alt} style={{ width: size, height: size, display: 'inline', verticalAlign: '-1px', marginRight: '3px' }} />
    );
    const linkedInIco = (size = '11px') => (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: '-1px', marginRight: '3px' }}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
    );
    const extLinkIco = (size = '12px') => (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: '-1px', marginRight: '2px' }}><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
    );

    // Build link parts with icons
    const linkParts = [
        d.personal.linkedin && { label: 'LinkedIn', href: mkHref(d.personal.linkedin), icon: linkedInIco() },
        d.personal.github && { label: 'GitHub', href: mkHref(d.personal.github), icon: ico('/icons/github.svg', 'GitHub') },
        d.personal.leetcode && { label: 'LeetCode', href: mkHref(d.personal.leetcode), icon: ico('/icons/leetcode.svg', 'LeetCode') },
        d.personal.gfg && { label: 'GFG', href: mkHref(d.personal.gfg), icon: ico('/icons/geeksforgeeks.svg', 'GFG') },
    ].filter(Boolean);

    const headingStyle = {
        fontSize: headingSize, fontWeight: t.heading.fontWeight, textTransform: t.heading.textTransform,
        borderBottom: t.heading.borderBottom, paddingBottom: t.heading.paddingBottom, color: t.heading.color,
        letterSpacing: t.heading.letterSpacing, marginTop: '0', marginBottom: '3px', lineHeight: '1.4',
    };

    const parseBullets = (text) => {
        if (!text) return [];
        return text.split('\n').filter(l => l.trim()).map(l => l.replace(/^[\s]*[-•◦▪▸●–■]\s*/, '').trim()).filter(Boolean);
    };

    return (
        <div style={{ fontFamily: activeFont, fontSize: bodySize, lineHeight: t.lineHeight, color: '#000', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
            {/* ── HEADER ── */}
            <header style={{ textAlign: 'center', marginBottom: sGap }}>
                <h1 style={{ fontSize: nameSize, fontWeight: t.nameWeight, textTransform: t.nameTransform, letterSpacing: t.nameSpacing, margin: '0 0 2px 0', lineHeight: '1.15', color: '#000' }}>
                    {d.personal.name || 'YOUR NAME'}
                </h1>
                <div style={{ fontSize: bodySize, lineHeight: '1.4' }}>
                    {contactParts.length > 0 && <div>{contactParts.join(t.contactSep)}</div>}
                    {linkParts.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            {linkParts.map((lnk, i) => (
                                <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
                                    {i > 0 && <span style={{ margin: '0 3px', color: '#666' }}>|</span>}
                                    <a href={lnk.href} style={{ color: t.linkColor, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }} target="_blank" rel="noreferrer">
                                        {lnk.icon}{lnk.label}
                                    </a>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </header>

            {/* ── CAREER OBJECTIVE ── */}
            {hasSummary && (
                <div style={{ marginBottom: sGap }}>
                    <h2 style={headingStyle}>Career Objective</h2>
                    <p style={{ margin: 0, textAlign: 'justify', fontSize: bodySize, lineHeight: t.lineHeight }}>{d.summary}</p>
                </div>
            )}

            {/* ── EDUCATION ── */}
            {education.length > 0 && (
                <div style={{ marginBottom: sGap }}>
                    <h2 style={headingStyle}>Education</h2>
                    {education.map((edu, i) => (
                        <div key={i} style={{ marginBottom: i < education.length - 1 ? t.itemGap : '0', fontSize: bodySize, lineHeight: t.lineHeight }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontWeight: 700 }}>
                                <span>{t.bullet} {edu.institution}</span>
                                <span style={{ fontWeight: 400, flexShrink: 0, marginLeft: '8px' }}>{edu.duration}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontStyle: 'italic', paddingLeft: '12px' }}>
                                <span>{edu.degree}</span>
                                <span style={{ fontStyle: 'normal', fontWeight: 400, flexShrink: 0, marginLeft: '8px' }}>{edu.location}</span>
                            </div>
                            {edu.cgpa && <div style={{ paddingLeft: '12px', marginTop: '1px' }}>{t.subBullet} CGPA: {edu.cgpa}</div>}
                        </div>
                    ))}
                </div>
            )}

            {/* ── EXPERIENCE ── */}
            {experience.length > 0 && (
                <div style={{ marginBottom: sGap }}>
                    <h2 style={headingStyle}>Experience</h2>
                    {experience.map((exp, i) => {
                        const bullets = parseBullets(exp.description);
                        return (
                            <div key={i} style={{ marginBottom: i < experience.length - 1 ? t.itemGap : '0', fontSize: bodySize }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontWeight: 700 }}>
                                    <span>{t.bullet} {exp.company}</span>
                                    <span style={{ fontWeight: 400, flexShrink: 0, marginLeft: '8px' }}>{exp.duration}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontStyle: 'italic', paddingLeft: '12px' }}>
                                    <span>{exp.title}{exp.techStack ? ` | ${exp.techStack}` : ''}</span>
                                    <span style={{ fontStyle: 'normal', fontWeight: 400, flexShrink: 0, marginLeft: '8px' }}>{exp.location}</span>
                                </div>
                                {bullets.length > 0 && (
                                    <ul style={{ paddingLeft: '12px', margin: '2px 0 0 0', listStyle: 'none', lineHeight: t.lineHeight }}>
                                        {bullets.map((line, j) => (
                                            <li key={j} style={{ display: 'flex', gap: '5px', alignItems: 'flex-start', textAlign: 'justify', marginBottom: '1px' }}>
                                                <span style={{ flexShrink: 0 }}>{t.subBullet}</span><span>{line}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── PROJECTS ── */}
            {projects.length > 0 && (
                <div style={{ marginBottom: sGap }}>
                    <h2 style={headingStyle}>Projects</h2>
                    {projects.map((proj, i) => {
                        const bullets = parseBullets(proj.description);
                        return (
                            <div key={i} style={{ marginBottom: i < projects.length - 1 ? t.itemGap : '0', fontSize: bodySize }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                        <span>{t.bullet} {proj.name}</span>
                                        {(proj.github || proj.liveLink) && <span style={{ color: '#666' }}>|</span>}
                                        {proj.github && (
                                            <a href={mkHref(proj.github)} style={{ color: t.linkColor, fontWeight: 400, display: 'inline-flex', alignItems: 'center' }} target="_blank" rel="noreferrer" title="GitHub">
                                                {ico('/icons/github.svg', 'GitHub', '12px')}
                                            </a>
                                        )}
                                        {proj.liveLink && (
                                            <a href={mkHref(proj.liveLink)} style={{ color: t.linkColor, fontWeight: 400, display: 'inline-flex', alignItems: 'center' }} target="_blank" rel="noreferrer" title="Live Demo">
                                                {extLinkIco('12px')}
                                            </a>
                                        )}
                                    </div>
                                    <span style={{ fontWeight: 400, flexShrink: 0, marginLeft: '8px' }}>{proj.duration}</span>
                                </div>
                                {proj.techStack && <div style={{ fontStyle: 'italic', paddingLeft: '12px', marginBottom: '1px' }}>Tools: {proj.techStack}</div>}
                                {bullets.length > 0 && (
                                    <ul style={{ paddingLeft: '12px', margin: '2px 0 0 0', listStyle: 'none', lineHeight: t.lineHeight }}>
                                        {bullets.map((line, j) => (
                                            <li key={j} style={{ display: 'flex', gap: '5px', alignItems: 'flex-start', textAlign: 'justify', marginBottom: '1px' }}>
                                                <span style={{ flexShrink: 0 }}>{t.subBullet}</span><span>{line}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── CERTIFICATIONS ── */}
            {certifications.length > 0 && (
                <div style={{ marginBottom: sGap }}>
                    <h2 style={headingStyle}>Certifications</h2>
                    <ul style={{ paddingLeft: '12px', margin: 0, listStyle: 'none', fontSize: bodySize, lineHeight: t.lineHeight }}>
                        {certifications.map((cert, i) => (
                            <li key={i} style={{ display: 'flex', gap: '5px', alignItems: 'flex-start', marginBottom: '1px' }}>
                                <span style={{ flexShrink: 0 }}>{t.bullet}</span>
                                <span>{cert.link ? <a href={cert.link.startsWith('http') ? cert.link : `https://${cert.link}`} style={{ color: t.linkColor, textDecoration: 'underline' }} target="_blank" rel="noreferrer">{cert.name}</a> : cert.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* ── SKILLS ── */}
            {skills.length > 0 && (
                <div style={{ marginBottom: achievements.length > 0 ? sGap : '0' }}>
                    <h2 style={headingStyle}>Skills</h2>
                    <div style={{ paddingLeft: '12px', fontSize: bodySize, lineHeight: t.lineHeight }}>
                        {skills.map((skill, i) => (
                            <div key={i} style={{ marginBottom: '1px' }}>
                                <span style={{ fontWeight: 700, marginRight: '4px' }}>{t.bullet} {skill.category}{skill.category ? ':' : ''}</span>{skill.items}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── ACHIEVEMENTS & AWARDS (OTHER SECTION) ── */}
            {achievements.length > 0 && (
                <div style={{ marginBottom: '0' }}>
                    <h2 style={headingStyle}>Achievements & Awards</h2>
                    <ul style={{ paddingLeft: '12px', margin: 0, listStyle: 'none', fontSize: bodySize, lineHeight: t.lineHeight }}>
                        {achievements.map((ach, i) => (
                            <li key={i} style={{ display: 'flex', gap: '5px', alignItems: 'flex-start', marginBottom: '1px' }}>
                                <span style={{ flexShrink: 0 }}>{t.bullet}</span>
                                <span>
                                    <strong style={{ fontWeight: 700 }}>{ach.title}</strong>
                                    {ach.description ? `: ${ach.description}` : ''}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════════════
   SAMPLE DATA — Professional candidate details to fully fill the A4 preview page.
   ═══════════════════════════════════════════════════════════════════════════ */
const SAMPLE_DATA = {
    personal: {
        name: 'John Doe',
        email: 'johndoe@email.com',
        phone: '+1 (555) 019-2834',
        linkedin: 'linkedin.com/in/johndoe',
        github: 'github.com/johndoe',
        leetcode: 'leetcode.com/u/johndoe',
        gfg: 'geeksforgeeks.org/user/johndoe',
        location: 'San Francisco, CA'
    },
    summary: 'Highly motivated Software Engineering student with experience building scalable web applications and REST APIs. Proficient in React, Node.js, and cloud technologies, with a strong foundation in data structures and algorithms.',
    education: [
        { institution: 'University of California, Berkeley', degree: 'Bachelor of Science in Computer Science', duration: '2022 – 2026', location: 'Berkeley, CA', cgpa: '3.92 / 4.0' },
        { institution: 'High School of Science & Tech', degree: 'Advanced Regents Diploma', duration: '2018 – 2022', location: 'New York, NY', cgpa: '98.5 / 100' }
    ],
    experience: [
        {
            title: 'Software Engineering Intern',
            company: 'Google',
            techStack: 'TypeScript, React, Go, Docker',
            duration: 'June 2025 – August 2025',
            location: 'Mountain View, CA',
            description: '• Engineered and deployed a real-time analytics dashboard using React and Go, reducing data latency by 40%.\n• Containerized microservices using Docker and orchestrated deployments on Kubernetes cluster, improving scalability.\n• Collaborative team member in an Agile environment, contributing to daily stand-ups and code reviews.'
        },
        {
            title: 'Junior Frontend Developer',
            company: 'Acme Software Corp',
            techStack: 'JavaScript, React, Tailwind CSS, Git',
            duration: 'June 2024 – May 2025',
            location: 'San Francisco, CA',
            description: '• Designed and implemented 15+ responsive React components, improving UI/UX consistency across 3 web products.\n• Optimized web asset delivery and API queries, boosting page load speeds by 25%.\n• Wrote comprehensive unit tests using Jest and React Testing Library, raising code coverage from 70% to 88%.'
        }
    ],
    projects: [
        {
            name: 'AI-Powered Job Portal',
            github: 'github.com/johndoe/ai-job-portal',
            liveLink: 'ai-job-portal.demo.com',
            techStack: 'Node.js, Express, MongoDB, React, Tailwind CSS',
            duration: 'Jan 2026 – Present',
            description: '• Developed an interactive AI mock interview platform featuring real-time speech transcription and scoring.\n• Integrated Fireworks AI DeepSeek models to automate resume optimization and candidate evaluation pipelines.\n• Designed and implemented JWT-based authentication and secure file storage for resume uploads.'
        },
        {
            name: 'Collaborative Task Planner',
            github: 'github.com/johndoe/task-planner',
            liveLink: 'task-planner.demo.com',
            techStack: 'React, Node.js, Socket.io, Redis',
            duration: 'Sept 2025 – Dec 2025',
            description: '• Built a real-time collaborative kanban board supporting simultaneous edits for up to 100 active users.\n• Leveraged Redis Pub/Sub and WebSocket connections to achieve sub-100ms state updates.\n• Implemented drag-and-drop tasks using React Beautiful DND with optimistic UI rendering.'
        },
        {
            name: 'Distributed Web Crawler',
            github: 'github.com/johndoe/dist-crawler',
            liveLink: 'crawler-monitor.demo.com',
            techStack: 'Python, Go, Redis, ElasticSearch, Docker',
            duration: 'March 2025 – May 2025',
            description: '• Designed and implemented a high-throughput distributed web crawler capable of parsing 5,000+ pages per minute.\n• Leveraged Redis sorting sets as a centralized URL frontier queue to ensure politeness and avoid duplicate crawls.\n• Indexed scraped web document data into ElasticSearch clusters, enabling sub-second keyword search queries.'
        }
    ],
    certifications: [
        { name: 'AWS Certified Solutions Architect – Associate', link: 'aws.amazon.com/verification' },
        { name: 'Google IT Support Professional Certificate', link: 'coursera.org/verify/google' }
    ],
    skills: [
        { category: 'Languages', items: 'JavaScript, TypeScript, Python, C++, Go, HTML/CSS' },
        { category: 'Frameworks', items: 'React.js, Next.js, Node.js, Express.js, Tailwind CSS' },
        { category: 'Developer Tools', items: 'Git, Docker, Kubernetes, AWS (S3, EC2), MongoDB, PostgreSQL, Redis' }
    ],
    achievements: [
        { title: '1st Place Winner — National Hackathon 2025', description: 'Built an AI-powered accessibility tool competing against 250+ engineering teams nationwide.' },
        { title: 'Dean\'s Honor List (All Semesters)', description: 'Maintained 3.9+ GPA throughout academic coursework at UC Berkeley.' },
        { title: 'Global Top 1% — LeetCode Biweekly Contest', description: 'Solved 4/4 algorithmic problems with optimal time/space complexity under contest time limits.' }
    ]
};

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
const AiResumeBuilder = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [loadingExp, setLoadingExp] = useState(null);
    const [sessionRewriteCount, setSessionRewriteCount] = useState(0);
    const [zoom, setZoom] = useState(75);
    const [mobileTab, setMobileTab] = useState('edit');
    const [selectedTemplate, setSelectedTemplate] = useState('classic');
    const [fontSizeOffset, setFontSizeOffset] = useState(0);
    const [fontFamily, setFontFamily] = useState('default');

    const previewContainerRef = useRef(null);
    const printRef = useRef(null);

    const fitZoom = useCallback(() => {
        if (previewContainerRef.current) {
            const containerWidth = previewContainerRef.current.clientWidth - 48; // account for p-4/p-6 padding
            if (containerWidth > 200) {
                const calculated = Math.floor((containerWidth / 794) * 100);
                setZoom(Math.max(35, Math.min(calculated, 100)));
                return;
            }
        }
        setZoom(70);
    }, []);

    useEffect(() => {
        if (window.innerWidth >= 1024) {
            const timer = setTimeout(fitZoom, 150);
            const handleResize = () => fitZoom();
            window.addEventListener('resize', handleResize);
            return () => {
                clearTimeout(timer);
                window.removeEventListener('resize', handleResize);
            };
        }
    }, [fitZoom]);

    const [resumeData, setResumeData] = useState(SAMPLE_DATA);

    const markAsEdited = () => {
        localStorage.setItem('hyrego_resume_edited', 'true');
    };

    useEffect(() => { 
        let hasSavedProgress = false;
        const savedDataStr = localStorage.getItem('hyrego_resume_progress');
        const wasEdited = localStorage.getItem('hyrego_resume_edited') === 'true';

        if (wasEdited && savedDataStr) {
            try {
                const saved = JSON.parse(savedDataStr);
                if (saved.resumeData && (saved.resumeData.personal?.name || saved.resumeData.summary)) {
                    // Deep merge with SAMPLE_DATA so that any missing or empty sections are always populated
                    setResumeData({
                        ...SAMPLE_DATA,
                        ...saved.resumeData,
                        personal: { ...SAMPLE_DATA.personal, ...(saved.resumeData.personal || {}) },
                        education: (saved.resumeData.education && saved.resumeData.education.length > 0) ? saved.resumeData.education : SAMPLE_DATA.education,
                        experience: (saved.resumeData.experience && saved.resumeData.experience.length > 0) ? saved.resumeData.experience : SAMPLE_DATA.experience,
                        projects: (saved.resumeData.projects && saved.resumeData.projects.length > 0) ? saved.resumeData.projects : SAMPLE_DATA.projects,
                        certifications: (saved.resumeData.certifications && saved.resumeData.certifications.length > 0) ? saved.resumeData.certifications : SAMPLE_DATA.certifications,
                        skills: (saved.resumeData.skills && saved.resumeData.skills.length > 0) ? saved.resumeData.skills : SAMPLE_DATA.skills,
                        achievements: (saved.resumeData.achievements && saved.resumeData.achievements.length > 0) ? saved.resumeData.achievements : SAMPLE_DATA.achievements,
                    });
                    hasSavedProgress = true;
                }
                if (saved.selectedTemplate) setSelectedTemplate(saved.selectedTemplate);
                if (saved.fontSizeOffset !== undefined) setFontSizeOffset(saved.fontSizeOffset);
                if (saved.fontFamily) setFontFamily(saved.fontFamily);
            } catch (e) {
                console.error("Failed to parse resume progress", e);
            }
        }
        
        if (!hasSavedProgress) {
            // Show sample data by default!
            setResumeData(SAMPLE_DATA);
        }
        setLoading(false);
    }, []);
 
    useEffect(() => {
        // Save progress whenever these states change, unless it's still loading
        if (!loading) {
            const saveData = {
                resumeData,
                selectedTemplate,
                fontSizeOffset,
                fontFamily
            };
            localStorage.setItem('hyrego_resume_progress', JSON.stringify(saveData));
        }
    }, [resumeData, selectedTemplate, fontSizeOffset, fontFamily, loading]);
 
    const fetchInitialData = async () => {
        try {
            const profile = await currentUserAPI.me();
            if (profile) {
                setResumeData(prev => {
                    const profileName = `${profile.name || ''}`.trim();
                    return {
                        ...prev,
                        personal: {
                            name: profileName || prev.personal.name,
                            email: profile.email || prev.personal.email,
                            phone: profile.phone || prev.personal.phone,
                            location: profile.profile?.location || prev.personal.location,
                            linkedin: profile.profile?.linkedin || prev.personal.linkedin,
                            github: profile.profile?.github || prev.personal.github,
                            leetcode: profile.profile?.leetcode || prev.personal.leetcode,
                            gfg: profile.profile?.gfg || prev.personal.gfg,
                        },
                        summary: profile.profile?.summary || prev.summary,
                        education: profile.experience && profile.experience.length > 0 ? profile.experience : prev.education,
                        experience: profile.experience && profile.experience.length > 0 ? profile.experience : prev.experience,
                        projects: (p.projects && p.projects.length > 0 && p.projects.some(proj => proj.name)) ? p.projects : prev.projects,
                        skills: (p.skills && p.skills.length > 0) ? [{ category: 'Skills', items: p.skills.join(', ') }] : prev.skills
                    };
                });
            }
        } catch (err) { console.error("Failed to fetch profile for resume", err); }
        finally { setLoading(false); }
    };

    const handleMobileTabChange = (tab) => {
        setMobileTab(tab);
        if (tab === 'preview' && window.innerWidth < 1024) {
            const screenZoom = Math.floor(((window.innerWidth - 32) / 794) * 100);
            setZoom(Math.max(30, Math.min(screenZoom, 100)));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const loadSampleData = async () => {
        const confirmed = await customConfirm(
            "Loading sample data will replace your current edits. Are you sure you want to proceed?",
            "Load Sample Data?"
        );
        if (confirmed) {
            setResumeData(SAMPLE_DATA);
            localStorage.setItem('hyrego_resume_edited', 'false');
        }
    };

    const handlePersonalChange = useCallback((e) => {
        setResumeData(prev => ({ ...prev, personal: { ...prev.personal, [e.target.name]: e.target.value } }));
        markAsEdited();
    }, []);
    const handleArrayChange = useCallback((group, index, field, value) => {
        setResumeData(prev => { const a = [...prev[group]]; a[index] = { ...a[index], [field]: value }; return { ...prev, [group]: a }; });
        markAsEdited();
    }, []);
    const removeArrayItem = useCallback((group, index) => {
        setResumeData(prev => ({ ...prev, [group]: prev[group].filter((_, i) => i !== index) }));
        markAsEdited();
    }, []);
    const addArrayItem = useCallback((group, template) => {
        setResumeData(prev => ({ ...prev, [group]: [...prev[group], template] }));
        markAsEdited();
    }, []);

    const handleOptimizeSummary = async () => {
        if (!resumeData.summary || resumeData.summary.trim().length < 10) { alert('Please write a rough career objective first.'); return; }
        if (sessionRewriteCount >= 10) {
            alert('You have reached the limit of 10 AI rewrites per resume builder session. Please download your resume or start a new session.');
            return;
        }
        setLoadingSummary(true);
        try { 
            const res = await axios.post('/resume/optimize-summary', { text: resumeData.summary }); 
            if (res.data.success) {
                setResumeData(prev => ({ ...prev, summary: res.data.optimizedText })); 
                markAsEdited();
                setSessionRewriteCount(prev => prev + 1);
            }
        }
        catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to connect to AI for summary optimization.');
        }
        finally { setLoadingSummary(false); }
    };

    const handleOptimizeExp = async (index, type = 'experience') => {
        const item = resumeData[type][index];
        const textToOptimize = item.description || item.title || '';
        if (!textToOptimize || textToOptimize.trim().length < 5) { alert(`Please write a rough ${type} description or title first.`); return; }
        if (sessionRewriteCount >= 10) {
            alert('You have reached the limit of 10 AI rewrites per resume builder session. Please download your resume or start a new session.');
            return;
        }
        setLoadingExp(`${type}-${index}`);
        try { 
            const res = await axios.post('/resume/optimize-experience', { text: textToOptimize, type }); 
            if (res.data.success) {
                handleArrayChange(type, index, 'description', res.data.optimizedText); 
                markAsEdited();
                setSessionRewriteCount(prev => prev + 1);
            }
        }
        catch (err) {
            console.error(err);
            alert(err.response?.data?.message || `Failed to connect to AI for ${type} optimization.`);
        }
        finally { setLoadingExp(null); };
    };

    const handleDownload = () => {
        // Direct download - no payment gates
        const t = document.title;
        document.title = `${resumeData.personal.name || 'Resume'}_Resume`;
        window.print();
        document.title = t;
    };

    // Progress
    const filled = [
        resumeData.personal.name,
        resumeData.personal.email,
        resumeData.personal.phone,
        resumeData.summary,
        (resumeData.education || []).some(e => e.institution),
        (resumeData.experience || []).some(e => e.company),
        (resumeData.projects || []).some(p => p.name),
        (resumeData.skills || []).some(s => s.items),
        (resumeData.achievements || []).some(a => a.title),
    ].filter(Boolean).length;
    const progress = Math.round((filled / 9) * 100);

    const currentTpl = TEMPLATES[selectedTemplate] || TEMPLATES.classic;

    if (loading) {
        return (
            <div className="w-full flex-1 flex flex-col lg:flex-row items-stretch gap-5 lg:gap-6 min-h-0 h-full overflow-hidden pb-16 lg:pb-0">
                <div className="w-full lg:w-[48%] xl:w-[47%] h-full overflow-hidden space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
                        <Skeleton className="h-10 w-48 rounded-xl" />
                        <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
                        <Skeleton className="h-6 w-36 rounded-lg" />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
                        </div>
                    </div>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 space-y-3">
                            <Skeleton className="h-6 w-40 rounded-lg" />
                            <Skeleton className="h-24 w-full rounded-xl" />
                        </div>
                    ))}
                </div>
                <div className="hidden lg:flex w-full lg:w-[52%] xl:w-[53%] h-full bg-slate-100 dark:bg-slate-950 rounded-2xl p-8 items-center justify-center border border-slate-200/80 dark:border-slate-800">
                    <Skeleton className="h-[90%] w-[80%] rounded-xl shadow-lg" />
                </div>
            </div>
        );
    }

    const scaledWidth = Math.round(794 * (zoom / 100));
    const scaledHeight = Math.round(1123 * (zoom / 100));

    return (
        <div className="w-full flex-1 min-h-0 h-full animate-in fade-in duration-300 flex flex-col lg:flex-row items-stretch gap-5 lg:gap-6 overflow-hidden print:block print:pb-0 print:w-full pb-16 lg:pb-0">
            {/* ── PRINT & SCROLLBAR CSS ── */}
            <style>{`
                .custom-builder-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(99, 102, 241, 0.45) transparent;
                }
                .custom-builder-scroll::-webkit-scrollbar {
                    width: 7px;
                    height: 7px;
                }
                .custom-builder-scroll::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.03);
                    border-radius: 9999px;
                }
                .custom-builder-scroll::-webkit-scrollbar-thumb {
                    background: rgba(99, 102, 241, 0.45);
                    border-radius: 9999px;
                }
                .custom-builder-scroll::-webkit-scrollbar-thumb:hover {
                    background: rgba(99, 102, 241, 0.75);
                }
                .dark .custom-builder-scroll::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.03);
                }
                .dark .custom-builder-scroll::-webkit-scrollbar-thumb {
                    background: rgba(129, 140, 248, 0.45);
                }
                .dark .custom-builder-scroll::-webkit-scrollbar-thumb:hover {
                    background: rgba(129, 140, 248, 0.75);
                }
                @media print {
                    @page { size: A4; margin: 0; }
                    body * { visibility: hidden !important; }
                    #resume-print, #resume-print * { visibility: visible !important; }
                    #preview-zoom-container {
                        transform: none !important;
                        position: static !important;
                        width: 210mm !important;
                    }
                    #resume-print {
                        position: absolute !important;
                        left: 0 !important; top: 0 !important;
                        width: 210mm !important;
                        transform: none !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                    .resume-item { break-inside: avoid; }
                }
            `}</style>

            {/* ═══ LEFT: Independently Scrollable Form Panel ═══ */}
            <div 
                className={`w-full lg:w-[48%] xl:w-[47%] h-full min-h-0 max-h-full overflow-y-auto custom-builder-scroll pr-1 lg:pr-3 flex flex-col space-y-4 print:hidden ${mobileTab === 'edit' ? 'flex' : 'hidden lg:flex'}`}
            >

                {/* Header & Progress Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
                            <FileText className="w-4 h-4 text-white" />
                        </span>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight whitespace-nowrap">
                                    Resume Builder
                                </h2>
                                <span className="text-[10px] md:text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 px-2 py-0.5 rounded-full whitespace-nowrap">
                                    ATS 95+ Ready
                                </span>
                            </div>
                            <div className="hidden sm:flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                                <span>Fill details</span>
                                <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                                <span>Pick template</span>
                                <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                                <span>Export PDF</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={loadSampleData}
                            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-3 py-1.5 rounded-xl transition-all border border-indigo-200/60 dark:border-indigo-800/60 shadow-xs shrink-0 active:scale-95 cursor-pointer"
                        >
                            <Sparkles className="w-3.5 h-3.5" /> 
                            <span>Load Sample</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-700" 
                                style={{ width: `${progress}%` }} 
                            />
                        </div>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0 font-mono">
                            {progress}%
                        </span>
                    </div>
                </div>

                {/* ── SECTION QUICK JUMP BAR (8 Sections) ── */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Resume Sections (8 Total)</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">Click to jump</span>
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-builder-scroll">
                        {[
                            { id: 'section-personal', label: '1. Contact', icon: User },
                            { id: 'section-summary', label: '2. Summary', icon: Sparkles },
                            { id: 'section-education', label: '3. Education', icon: BookOpen },
                            { id: 'section-experience', label: '4. Experience', icon: Briefcase },
                            { id: 'section-projects', label: '5. Projects', icon: Layers },
                            { id: 'section-certifications', label: '6. Certs', icon: Award },
                            { id: 'section-skills', label: '7. Skills', icon: Code },
                            { id: 'section-achievements', label: '8. Awards & Other', icon: Trophy },
                        ].map((sec) => (
                            <button
                                key={sec.id}
                                type="button"
                                onClick={() => {
                                    const el = document.getElementById(sec.id);
                                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/60 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all shrink-0 cursor-pointer shadow-xs active:scale-95"
                            >
                                <sec.icon className="w-3 h-3 shrink-0" />
                                <span>{sec.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── TEMPLATE SELECTOR ── */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Choose ATS Template</span>
                        </div>
                        <a
                            href={SAMPLE_ATS_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                            <ExternalLink className="w-3 h-3" />
                            Sample PDF
                        </a>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                        {Object.values(TEMPLATES).map(tpl => {
                            const active = selectedTemplate === tpl.id;
                            return (
                                <button 
                                    key={tpl.id} 
                                    type="button"
                                    onClick={() => { setSelectedTemplate(tpl.id); setFontSizeOffset(0); }}
                                    className={`relative flex flex-col items-center p-2.5 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                                        active 
                                            ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-xs' 
                                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/50'
                                    }`}
                                >
                                    {active && (
                                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center shadow-xs">
                                            <Check className="w-3 h-3 text-white stroke-[3]" />
                                        </span>
                                    )}
                                    {/* Mini resume preview */}
                                    <div className="w-full aspect-[1/1.3] mb-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 flex flex-col gap-[2.5px] overflow-hidden shadow-xs" style={{ fontFamily: tpl.font }}>
                                        <div className="h-[3px] w-10 mx-auto rounded-full bg-slate-800 dark:bg-slate-200" />
                                        <div className="h-[1.5px] w-12 mx-auto bg-slate-300 dark:bg-slate-600" />
                                        <div className="flex-1 flex flex-col gap-[2px] mt-1">
                                            <div className="h-[2px] w-full rounded-full" style={{ backgroundColor: tpl.heading.color, opacity: .7 }} />
                                            <div className="h-[1.5px] w-3/4 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                            <div className="h-[1.5px] w-5/6 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                            <div className="h-[2px] w-full rounded-full mt-[2px]" style={{ backgroundColor: tpl.heading.color, opacity: .7 }} />
                                            <div className="h-[1.5px] w-2/3 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                            <div className="h-[1.5px] w-4/5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                        </div>
                                    </div>
                                    <span className={`text-xs font-bold leading-tight ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>{tpl.name}</span>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight mt-0.5">{tpl.desc}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── TYPOGRAPHY ── */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center gap-2 mb-3.5">
                        <Type className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Typography & Page Fit</span>
                    </div>
                    <div className="space-y-3.5">
                        {/* Font Family Selector */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Font Style</label>
                            <select 
                                className="w-full bg-slate-50/60 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 font-semibold px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer shadow-xs"
                                value={fontFamily}
                                onChange={e => setFontFamily(e.target.value)}
                            >
                                {ATS_FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                            </select>
                        </div>
                        
                        {/* Font Size Slider */}
                        <div>
                            <div className="flex justify-between items-end mb-1.5">
                                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Font Size Scaling</label>
                                <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800/60">
                                    {(parseFloat(currentTpl.bodySize) + fontSizeOffset).toFixed(1)}pt
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold shrink-0">-2pt</span>
                                <input
                                    type="range"
                                    min="-2"
                                    max="3"
                                    step="0.5"
                                    value={fontSizeOffset}
                                    onChange={(e) => setFontSizeOffset(parseFloat(e.target.value))}
                                    className="flex-1 h-1.5 accent-indigo-600 cursor-pointer"
                                />
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold shrink-0">+3pt</span>
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 leading-snug">
                                Adjust slider to expand or fit your resume onto exactly 1 standard A4 page.
                            </p>
                        </div>
                    </div>
                </div>

                {/* 1. Personal */}
                <div id="section-personal">
                    <Section icon={User} title="Header & Contact" number="1" color="text-indigo-600 dark:text-indigo-400" accent="bg-indigo-600">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2"><label className={labelCls}>Full Name</label><input name="name" value={resumeData.personal.name} onChange={handlePersonalChange} className={inputCls} placeholder="e.g. Alex Johnson" /></div>
                            <div><label className={labelCls}>Email</label><input name="email" value={resumeData.personal.email} onChange={handlePersonalChange} className={inputCls} placeholder="alex@email.com" /></div>
                            <div><label className={labelCls}>Phone</label><input name="phone" value={resumeData.personal.phone} onChange={handlePersonalChange} className={inputCls} placeholder="+1 234 567" /></div>
                            <div><label className={labelCls}>LinkedIn</label><input name="linkedin" value={resumeData.personal.linkedin} onChange={handlePersonalChange} className={inputCls} placeholder="linkedin.com/in/..." /></div>
                            <div><label className={labelCls}>GitHub</label><input name="github" value={resumeData.personal.github} onChange={handlePersonalChange} className={inputCls} placeholder="github.com/..." /></div>
                            <div><label className={labelCls}>LeetCode</label><input name="leetcode" value={resumeData.personal.leetcode} onChange={handlePersonalChange} className={inputCls} placeholder="leetcode.com/u/..." /></div>
                            <div><label className={labelCls}>GFG Practice</label><input name="gfg" value={resumeData.personal.gfg} onChange={handlePersonalChange} className={inputCls} placeholder="geeksforgeeks.org/..." /></div>
                            <div className="col-span-2"><label className={labelCls}>Location</label><input name="location" value={resumeData.personal.location} onChange={handlePersonalChange} className={inputCls} placeholder="City, State" /></div>
                        </div>
                    </Section>
                </div>

                {/* 2. Summary */}
                <div id="section-summary">
                    <Section icon={Sparkles} title="Career Objective" number="2" color="text-blue-600 dark:text-blue-400" accent="bg-blue-600">
                        <textarea value={resumeData.summary} onChange={(e) => { setResumeData(prev => ({ ...prev, summary: e.target.value })); markAsEdited(); }} className={`${inputCls} h-24 resize-none pb-2`} placeholder="Write a rough summary — AI will polish it..." />
                        <div className="flex justify-end mt-2"><AiBtn onClick={handleOptimizeSummary} loading={loadingSummary} /></div>
                    </Section>
                </div>

                {/* 3. Education */}
                <div id="section-education">
                    <Section icon={BookOpen} title="Education" number="3" color="text-emerald-600 dark:text-emerald-400" accent="bg-emerald-600" count={(resumeData.education || []).length}>
                        {(resumeData.education || []).map((edu, i) => (
                            <ItemCard key={i} onDelete={() => removeArrayItem('education', i)}>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <input placeholder="Institution" value={edu.institution} onChange={e => handleArrayChange('education', i, 'institution', e.target.value)} className={`${inputCls} col-span-2`} />
                                    <input placeholder="Degree / Program" value={edu.degree} onChange={e => handleArrayChange('education', i, 'degree', e.target.value)} className={inputCls} />
                                    <input placeholder="Duration (e.g. 2023–2027)" value={edu.duration} onChange={e => handleArrayChange('education', i, 'duration', e.target.value)} className={inputCls} />
                                    <input placeholder="Location" value={edu.location} onChange={e => handleArrayChange('education', i, 'location', e.target.value)} className={inputCls} />
                                    <input placeholder="CGPA / Grade" value={edu.cgpa} onChange={e => handleArrayChange('education', i, 'cgpa', e.target.value)} className={inputCls} />
                                </div>
                            </ItemCard>
                        ))}
                        <AddBtn onClick={() => addArrayItem('education', { institution: '', degree: '', duration: '', location: '', cgpa: '' })} label="Add Education" />
                    </Section>
                </div>

                {/* 4. Experience */}
                <div id="section-experience">
                    <Section icon={Briefcase} title="Work Experience" number="4" color="text-purple-600 dark:text-purple-400" accent="bg-purple-600" count={(resumeData.experience || []).length}>
                        {(resumeData.experience || []).map((exp, i) => (
                            <ItemCard key={i} onDelete={() => removeArrayItem('experience', i)}>
                                <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                                    <input placeholder="Job Title" value={exp.title} onChange={e => handleArrayChange('experience', i, 'title', e.target.value)} className={inputCls} />
                                    <input placeholder="Company" value={exp.company} onChange={e => handleArrayChange('experience', i, 'company', e.target.value)} className={inputCls} />
                                    <input placeholder="Tech Stack" value={exp.techStack} onChange={e => handleArrayChange('experience', i, 'techStack', e.target.value)} className={inputCls} />
                                    <input placeholder="Duration" value={exp.duration} onChange={e => handleArrayChange('experience', i, 'duration', e.target.value)} className={inputCls} />
                                    <input placeholder="Location" value={exp.location} onChange={e => handleArrayChange('experience', i, 'location', e.target.value)} className={`${inputCls} col-span-2`} />
                                </div>
                                <textarea placeholder="Describe what you did — use rough notes, AI will rewrite..." value={exp.description} onChange={e => handleArrayChange('experience', i, 'description', e.target.value)} className={`${inputCls} h-24 resize-none mb-2`} />
                                <div className="flex justify-end">
                                    <AiBtn onClick={() => handleOptimizeExp(i, 'experience')} loading={loadingExp === `experience-${i}`} label="AI Rewrite" colorCls="bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200/60 dark:border-purple-800/60" />
                                </div>
                            </ItemCard>
                        ))}
                        <AddBtn onClick={() => addArrayItem('experience', { title: '', company: '', techStack: '', duration: '', location: '', description: '' })} label="Add Experience" />
                    </Section>
                </div>

                {/* 5. Projects */}
                <div id="section-projects">
                    <Section icon={Layers} title="Key Projects" number="5" color="text-amber-600 dark:text-amber-400" accent="bg-amber-600" count={(resumeData.projects || []).length}>
                        {(resumeData.projects || []).map((proj, i) => (
                            <ItemCard key={i} onDelete={() => removeArrayItem('projects', i)}>
                                <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                                    <input placeholder="Project Name" value={proj.name} onChange={e => handleArrayChange('projects', i, 'name', e.target.value)} className={`${inputCls} col-span-2`} />
                                    <input placeholder="GitHub URL" value={proj.github} onChange={e => handleArrayChange('projects', i, 'github', e.target.value)} className={inputCls} />
                                    <input placeholder="Live URL" value={proj.liveLink} onChange={e => handleArrayChange('projects', i, 'liveLink', e.target.value)} className={inputCls} />
                                    <input placeholder="Tech Stack" value={proj.techStack} onChange={e => handleArrayChange('projects', i, 'techStack', e.target.value)} className={inputCls} />
                                    <input placeholder="Date / Duration" value={proj.duration} onChange={e => handleArrayChange('projects', i, 'duration', e.target.value)} className={inputCls} />
                                </div>
                                <textarea placeholder="Key highlights & accomplishments..." value={proj.description} onChange={e => handleArrayChange('projects', i, 'description', e.target.value)} className={`${inputCls} h-24 resize-none mb-2`} />
                                <div className="flex justify-end">
                                    <AiBtn onClick={() => handleOptimizeExp(i, 'projects')} loading={loadingExp === `projects-${i}`} label="AI Rewrite" colorCls="bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200/60 dark:border-amber-800/60" />
                                </div>
                            </ItemCard>
                        ))}
                        <AddBtn onClick={() => addArrayItem('projects', { name: '', github: '', liveLink: '', techStack: '', duration: '', description: '' })} label="Add Project" />
                    </Section>
                </div>

                {/* 6. Certifications */}
                <div id="section-certifications">
                    <Section icon={Award} title="Certifications" number="6" color="text-orange-600 dark:text-orange-400" accent="bg-orange-600" count={(resumeData.certifications || []).length}>
                        <div className="space-y-3 mb-3">
                            {(resumeData.certifications || []).map((cert, i) => (
                                <div key={i} className="flex gap-2 items-start group">
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <input value={cert.name} onChange={e => handleArrayChange('certifications', i, 'name', e.target.value)} className={inputCls} placeholder="Certification Name" />
                                        <input value={cert.link} onChange={e => handleArrayChange('certifications', i, 'link', e.target.value)} className={inputCls} placeholder="Credential URL (Optional)" />
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => removeArrayItem('certifications', i)} 
                                        className="shrink-0 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:border-rose-200 dark:hover:border-rose-900 transition-all flex items-center justify-center h-[42px] w-[42px] cursor-pointer shadow-xs" 
                                        title="Remove"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <AddBtn onClick={() => addArrayItem('certifications', { name: '', link: '' })} label="Add Certification" />
                    </Section>
                </div>

                {/* 7. Skills */}
                <div id="section-skills">
                    <Section icon={Code} title="Technical Skills" number="7" color="text-pink-600 dark:text-pink-400" accent="bg-pink-600" count={(resumeData.skills || []).length}>
                        <div className="space-y-3 mb-3">
                            {(resumeData.skills || []).map((skill, i) => (
                                <div key={i} className="flex gap-2 items-center group">
                                    <div className="flex-1 grid grid-cols-[110px_1fr] gap-2">
                                        <input value={skill.category} onChange={e => handleArrayChange('skills', i, 'category', e.target.value)} className={`${inputCls} font-semibold !px-2`} placeholder="Category" />
                                        <input value={skill.items} onChange={e => handleArrayChange('skills', i, 'items', e.target.value)} className={inputCls} placeholder="Python, React, Node.js..." />
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => removeArrayItem('skills', i)} 
                                        className="shrink-0 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:border-rose-200 dark:hover:border-rose-900 transition-all flex items-center justify-center h-[42px] w-[42px] cursor-pointer shadow-xs" 
                                        title="Remove"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <AddBtn onClick={() => addArrayItem('skills', { category: '', items: '' })} label="Add Skill Category" />
                    </Section>
                </div>

                {/* 8. Achievements & Awards (Other Sections) */}
                <div id="section-achievements">
                    <Section icon={Trophy} title="Achievements & Awards" number="8" color="text-amber-500 dark:text-amber-400" accent="bg-amber-500" count={(resumeData.achievements || []).length}>
                        <div className="space-y-3 mb-3">
                            {(resumeData.achievements || []).map((ach, i) => (
                                <ItemCard key={i} onDelete={() => removeArrayItem('achievements', i)}>
                                    <div className="space-y-2">
                                        <input 
                                            placeholder="Achievement Title (e.g. 1st Place National Hackathon 2025)" 
                                            value={ach.title || ''} 
                                            onChange={e => handleArrayChange('achievements', i, 'title', e.target.value)} 
                                            className={`${inputCls} font-semibold`} 
                                        />
                                        <textarea 
                                            placeholder="Brief description, metrics, or impact..." 
                                            value={ach.description || ''} 
                                            onChange={e => handleArrayChange('achievements', i, 'description', e.target.value)} 
                                            className={`${inputCls} h-16 resize-none`} 
                                        />
                                        <div className="flex justify-end pt-1">
                                            <AiBtn onClick={() => handleOptimizeExp(i, 'achievements')} loading={loadingExp === `achievements-${i}`} label="AI Polish" colorCls="bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200/60 dark:border-amber-800/60" />
                                        </div>
                                    </div>
                                </ItemCard>
                            ))}
                        </div>
                        <AddBtn onClick={() => addArrayItem('achievements', { title: '', description: '' })} label="Add Achievement / Award" />
                    </Section>
                </div>
                {/* Bottom padding spacer for smooth scrolling */}
                <div className="h-12 shrink-0" aria-hidden="true" />
            </div>

            {/* ═══ RIGHT: 100% Fixed Live Preview Panel ═══ */}
            <div className={`w-full lg:w-[52%] xl:w-[53%] h-full min-h-0 max-h-full flex flex-col bg-slate-100/90 dark:bg-slate-950/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs shrink-0 print:w-full print:bg-white print:border-none print:static print:h-auto ${mobileTab === 'preview' ? 'flex' : 'hidden lg:flex'}`}>

                {/* ── Toolbar ── */}
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-4 md:px-5 py-3 print:hidden shrink-0 gap-3">
                    <div className="flex items-center gap-2.5 shrink-0">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                        </span>
                        <span className="text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-bold">Live ATS Preview</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 hidden sm:inline-block">
                            Standard A4
                        </span>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl px-1.5 py-1 shadow-xs">
                            <button 
                                type="button"
                                onClick={() => setZoom(z => Math.max(30, z - 10))} 
                                className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer" 
                                title="Zoom Out"
                            >
                                <ZoomOut className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs text-slate-700 dark:text-slate-200 font-mono w-9 text-center font-bold">{zoom}%</span>
                            <button 
                                type="button"
                                onClick={() => setZoom(z => Math.min(120, z + 10))} 
                                className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer" 
                                title="Zoom In"
                            >
                                <ZoomIn className="w-3.5 h-3.5" />
                            </button>
                            <button 
                                type="button"
                                onClick={fitZoom} 
                                className="p-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer ml-0.5" 
                                title="Fit Width"
                            >
                                <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <button 
                            type="button"
                            onClick={handleDownload} 
                            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm hover:shadow-md hover:shadow-indigo-500/20 cursor-pointer shrink-0"
                        >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Download PDF</span>
                            <span className="sm:hidden">PDF</span>
                        </button>
                    </div>
                </div>

                {/* ── Preview area ── */}
                <div 
                    ref={previewContainerRef}
                    className="flex-1 min-h-0 overflow-y-auto overflow-x-auto w-full bg-slate-200/60 dark:bg-slate-950 print:bg-white flex justify-center items-start p-4 sm:p-6 print:p-0 select-none custom-builder-scroll"
                    style={{ overscrollBehavior: 'contain' }}
                >
                    <div
                        style={{
                            width: `${scaledWidth}px`,
                            height: `${scaledHeight}px`,
                            position: 'relative',
                            flexShrink: 0,
                            transition: 'width 0.15s ease-out, height 0.15s ease-out',
                        }}
                    >
                        <div
                            id="preview-zoom-container"
                            style={{
                                transform: `scale(${zoom / 100})`,
                                transformOrigin: 'top left',
                                width: '794px',
                                minHeight: '1123px',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                            }}
                        >
                            <div
                                id="resume-print"
                                ref={printRef}
                                style={{
                                    background: '#ffffff',
                                    color: '#000000',
                                    boxShadow: '0 20px 40px -15px rgba(0,0,0,0.3)',
                                    minHeight: '1123px',
                                    width: '794px',
                                    padding: currentTpl.pagePadding,
                                    boxSizing: 'border-box',
                                }}
                            >
                                <ResumeContent
                                    data={resumeData}
                                    templateId={selectedTemplate}
                                    fontSizeOffset={fontSizeOffset}
                                    fontFamily={fontFamily}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── MOBILE: Sticky bottom tab bar ── */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] print:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 flex items-center shadow-lg"
                style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
                <button 
                    type="button"
                    onClick={() => handleMobileTabChange('edit')} 
                    className={`relative flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors cursor-pointer ${mobileTab === 'edit' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400 dark:text-slate-500'}`}
                >
                    <FileText className="w-5 h-5" /><span className="text-[11px]">Edit Details</span>
                    {mobileTab === 'edit' && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-indigo-600 rounded-full" />}
                </button>
                <button 
                    type="button"
                    onClick={handleDownload} 
                    className="mx-4 -mt-6 w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center shadow-xl shadow-indigo-600/40 active:scale-95 transition-transform shrink-0 cursor-pointer text-white" 
                    title="Download PDF"
                >
                    <Download className="w-6 h-6 text-white" />
                </button>
                <button 
                    type="button"
                    onClick={() => handleMobileTabChange('preview')} 
                    className={`relative flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors cursor-pointer ${mobileTab === 'preview' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400 dark:text-slate-500'}`}
                >
                    <Eye className="w-5 h-5" /><span className="text-[11px]">Live Preview</span>
                    {mobileTab === 'preview' && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-indigo-600 rounded-full" />}
                </button>
            </div>
        </div>
    );
};

export default AiResumeBuilder;
