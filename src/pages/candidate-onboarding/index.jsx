import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, skillsAPI, currentUserAPI } from '../../services/api';
import {
  UserPlus, MapPin, GraduationCap, Briefcase, Code2, Brain,
  Plus, X, Sparkles, ArrowRight, CheckCircle2, Loader2, Save
} from 'lucide-react';
import ThemeToggle from '../../components/ui/ThemeToggle';

/* ─── Popular suggestions ─────────────────────────────────────────── */
const POPULAR_TECH = ['JavaScript', 'Python', 'React', 'Node.js', 'Java', 'C++', 'TypeScript', 'SQL', 'Git'];
const POPULAR_SOFT = ['Communication', 'Leadership', 'Teamwork', 'Problem Solving', 'Time Management', 'Adaptability'];
const SECTORS = ['Software', 'Data Science', 'AI / ML', 'Finance', 'Marketing', 'Design', 'Product', 'Consulting', 'Research'];

/* ─── Step indicator ──────────────────────────────────────────────── */
const steps = [
  { id: 1, label: 'Basic Info',   icon: UserPlus },
  { id: 2, label: 'Tech Skills', icon: Code2 },
  { id: 3, label: 'Soft Skills', icon: Brain },
];

const CandidateOnboarding = () => {
  const navigate = useNavigate();

  /* ── State ─────────────────────────────────────────────────────── */
  const [step, setStep]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [userName, setUserName]   = useState('');

  // Step 1
  const [location, setLocation]   = useState('');
  const [education, setEducation] = useState('');
  const [sector, setSector]       = useState('');

  // Step 2 & 3
  const [techSkills, setTechSkills] = useState([]);
  const [softSkills, setSoftSkills] = useState([]);
  const [newTech, setNewTech]       = useState('');
  const [newSoft, setNewSoft]       = useState('');

  /* ── Init: load existing profile ────────────────────────────────── */
  useEffect(() => {
    const init = async () => {
      try {
        const me = await currentUserAPI.me();
        if (me?.user?.hasOnboarded) {
          navigate('/main-dashboard', { replace: true });
          return;
        }
        const user = me?.user || {};
        setUserName(user.name?.split(' ')[0] || 'there');
        setLocation(user.profile?.location || '');
        setEducation(user.profile?.education || '');
        setSector(user.profile?.sector || '');
        const s = await skillsAPI.get();
        if (s?.skills) {
          setTechSkills(s.skills.techSkills || []);
          setSoftSkills(s.skills.softSkills || []);
        } else if (user.profile?.skills?.length) {
          setTechSkills(user.profile.skills);
        }
      } catch {
        // non-blocking
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  /* ── Skill helpers ───────────────────────────────────────────────── */
  const addTech = () => {
    const v = newTech.trim();
    if (!v || techSkills.includes(v)) { setNewTech(''); return; }
    setTechSkills(prev => [...prev, v]);
    setNewTech('');
  };
  const addSoft = () => {
    const v = newSoft.trim();
    if (!v || softSkills.includes(v)) { setNewSoft(''); return; }
    setSoftSkills(prev => [...prev, v]);
    setNewSoft('');
  };
  const removeTech = (s) => setTechSkills(prev => prev.filter(x => x !== s));
  const removeSoft = (s) => setSoftSkills(prev => prev.filter(x => x !== s));
  const togglePopularTech = (s) =>
    techSkills.includes(s) ? removeTech(s) : setTechSkills(prev => [...prev, s]);
  const togglePopularSoft = (s) =>
    softSkills.includes(s) ? removeSoft(s) : setSoftSkills(prev => [...prev, s]);

  /* ── Save & navigate ─────────────────────────────────────────────── */
  const saveAll = async () => {
    setSaving(true);
    try {
      // Primary profile update — syncs with dashboard, profile page and applications
      const payload = {
        education,
        skills: techSkills,          // used for internship matching on dashboard
        technicalSkills: techSkills, // alternate field used by some views
        sector,
        location,
        locations: location ? location.split(',').map(s => s.trim()).filter(Boolean) : [],
      };
      const res = await userAPI.updateProfile(payload);
      if (!res?.user) throw new Error('Profile update failed');

      // Update localStorage so dashboard & sidebar pick up instantly
      try {
        localStorage.setItem('userSkills', JSON.stringify(techSkills));
        const stored = JSON.parse(localStorage.getItem('userData') || '{}');
        stored.profile = { ...(stored.profile || {}), ...payload };
        stored.technicalSkills = techSkills;
        localStorage.setItem('userData', JSON.stringify(stored));
        window.dispatchEvent(new Event('storage'));
      } catch {}

      // Mark onboarding done (non-blocking)
      try { await currentUserAPI.markOnboarded(); } catch {}

      // Persist separate skills document (non-blocking, best-effort)
      try { await skillsAPI.save({ techSkills, softSkills }); } catch {}

      navigate('/main-dashboard', { replace: true });
    } catch {
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /* ── Loading skeleton ─────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="ob-root">
        <div className="ob-bg"><div className="ob-ambient-top"/><div className="ob-ambient-bottom"/></div>
        <div className="ob-shell">
          <div className="ob-skeleton ob-sk-header"/>
          <div className="ob-skeleton ob-sk-body"/>
        </div>
        <ObStyles />
      </div>
    );
  }

  /* ── Progress % ───────────────────────────────────────────────────── */
  const progress = ((step - 1) / (steps.length - 1)) * 100;

  return (
    <div className="ob-root">
      {/* Ambient background */}
      <div className="ob-bg" aria-hidden="true">
        <div className="ob-ambient-top"/>
        <div className="ob-ambient-bottom"/>
        <div className="ob-grid"/>
      </div>

      <div className="ob-shell">

        {/* ── Top branding bar ─────────────────────────────────────── */}
        <div className="ob-topbar">
          <div className="ob-logo">
            <div className="ob-logo-icon"><Briefcase size={16} color="white"/></div>
            <span className="ob-logo-text">InternGuide AI</span>
          </div>
          <div className="ob-topbar-actions">
            <ThemeToggle />
            <span className="ob-skip" onClick={() => navigate('/main-dashboard')}>
              Skip for now →
            </span>
          </div>
        </div>

        {/* ── Welcome heading ──────────────────────────────────────── */}
        <div className="ob-welcome">
          <div className="ob-welcome-badge">
            <Sparkles size={13}/>
            <span>Welcome aboard!</span>
          </div>
          <h1 className="ob-welcome-title">
            Hey {userName}, let's set up your profile 🚀
          </h1>
          <p className="ob-welcome-sub">
            Takes less than 2 minutes. Your answers improve AI matching on the dashboard.
          </p>
        </div>

        {/* ── Step tracker ─────────────────────────────────────────── */}
        <div className="ob-stepper">
          <div className="ob-progress-bar">
            <div className="ob-progress-fill" style={{ width: `${progress}%` }}/>
          </div>
          <div className="ob-steps">
            {steps.map((s) => {
              const StepIcon = s.icon;
              const done = step > s.id;
              const active = step === s.id;
              return (
                <div key={s.id} className={`ob-step ${active ? 'ob-step-active' : ''} ${done ? 'ob-step-done' : ''}`}>
                  <div className="ob-step-circle">
                    {done ? <CheckCircle2 size={14}/> : <StepIcon size={14}/>}
                  </div>
                  <span className="ob-step-label">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Card ─────────────────────────────────────────────────── */}
        <div className="ob-card">

          {/* ── STEP 1: Basic Info ─────────────────────────────────── */}
          {step === 1 && (
            <div className="ob-step-content">
              <div className="ob-section-head">
                <div className="ob-section-icon ob-icon-blue"><UserPlus size={18}/></div>
                <div>
                  <h2 className="ob-section-title">Basic Information</h2>
                  <p className="ob-section-sub">Tell us a bit about yourself</p>
                </div>
              </div>

              <div className="ob-fields">
                {/* Location */}
                <div className="ob-field">
                  <label className="ob-label">
                    <MapPin size={13}/> Preferred Location
                  </label>
                  <input
                    className="ob-input"
                    type="text"
                    placeholder="e.g. Bangalore, Mumbai, Remote"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                  />
                  <p className="ob-hint">Separate multiple cities with commas</p>
                </div>

                {/* Education */}
                <div className="ob-field">
                  <label className="ob-label">
                    <GraduationCap size={13}/> Education
                  </label>
                  <input
                    className="ob-input"
                    type="text"
                    placeholder="e.g. B.Tech CSE, 3rd Year"
                    value={education}
                    onChange={e => setEducation(e.target.value)}
                  />
                </div>

                {/* Sector */}
                <div className="ob-field">
                  <label className="ob-label">
                    <Briefcase size={13}/> Preferred Sector
                  </label>
                  <div className="ob-sector-grid">
                    {SECTORS.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSector(s)}
                        className={`ob-sector-btn ${sector === s ? 'ob-sector-active' : ''}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <input
                    className="ob-input ob-input-sm"
                    type="text"
                    placeholder="Or type your own sector…"
                    value={sector}
                    onChange={e => setSector(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Technical Skills ──────────────────────────── */}
          {step === 2 && (
            <div className="ob-step-content">
              <div className="ob-section-head">
                <div className="ob-section-icon ob-icon-violet"><Code2 size={18}/></div>
                <div>
                  <h2 className="ob-section-title">Technical Skills</h2>
                  <p className="ob-section-sub">Used for AI-powered internship matching on your dashboard</p>
                </div>
              </div>

              {/* Add custom */}
              <div className="ob-add-row">
                <input
                  className="ob-input"
                  placeholder="Type a skill and press Enter or click Add"
                  value={newTech}
                  onChange={e => setNewTech(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTech()}
                />
                <button className="ob-add-btn" onClick={addTech} type="button">
                  <Plus size={15}/> Add
                </button>
              </div>

              {/* Popular */}
              <div className="ob-popular">
                <p className="ob-popular-label">Popular skills:</p>
                <div className="ob-popular-grid">
                  {POPULAR_TECH.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => togglePopularTech(s)}
                      className={`ob-popular-btn ${techSkills.includes(s) ? 'ob-popular-active' : ''}`}
                    >
                      {techSkills.includes(s) && <CheckCircle2 size={11}/>}
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected chips */}
              {techSkills.length > 0 && (
                <div className="ob-chips-section">
                  <p className="ob-chips-label">Your skills ({techSkills.length})</p>
                  <div className="ob-chips">
                    {techSkills.map((s, i) => (
                      <span key={i} className="ob-chip ob-chip-tech">
                        {s}
                        <button type="button" onClick={() => removeTech(s)} className="ob-chip-remove">
                          <X size={12}/>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: Soft Skills ──────────────────────────────── */}
          {step === 3 && (
            <div className="ob-step-content">
              <div className="ob-section-head">
                <div className="ob-section-icon ob-icon-emerald"><Brain size={18}/></div>
                <div>
                  <h2 className="ob-section-title">Soft Skills</h2>
                  <p className="ob-section-sub">Stored in your profile and shown in applications</p>
                </div>
              </div>

              {/* Add custom */}
              <div className="ob-add-row">
                <input
                  className="ob-input"
                  placeholder="Type a soft skill and press Enter or click Add"
                  value={newSoft}
                  onChange={e => setNewSoft(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSoft()}
                />
                <button className="ob-add-btn" onClick={addSoft} type="button">
                  <Plus size={15}/> Add
                </button>
              </div>

              {/* Popular */}
              <div className="ob-popular">
                <p className="ob-popular-label">Popular soft skills:</p>
                <div className="ob-popular-grid">
                  {POPULAR_SOFT.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => togglePopularSoft(s)}
                      className={`ob-popular-btn ${softSkills.includes(s) ? 'ob-popular-active' : ''}`}
                    >
                      {softSkills.includes(s) && <CheckCircle2 size={11}/>}
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected chips */}
              {softSkills.length > 0 && (
                <div className="ob-chips-section">
                  <p className="ob-chips-label">Your soft skills ({softSkills.length})</p>
                  <div className="ob-chips">
                    {softSkills.map((s, i) => (
                      <span key={i} className="ob-chip ob-chip-soft">
                        {s}
                        <button type="button" onClick={() => removeSoft(s)} className="ob-chip-remove">
                          <X size={12}/>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary preview before save */}
              <div className="ob-summary">
                <p className="ob-summary-label">Profile summary</p>
                <div className="ob-summary-grid">
                  {location && <div className="ob-sum-item"><MapPin size={13}/><span>{location}</span></div>}
                  {education && <div className="ob-sum-item"><GraduationCap size={13}/><span>{education}</span></div>}
                  {sector && <div className="ob-sum-item"><Briefcase size={13}/><span>{sector}</span></div>}
                  <div className="ob-sum-item"><Code2 size={13}/><span>{techSkills.length} tech skill{techSkills.length !== 1 ? 's' : ''}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* ── Navigation buttons ───────────────────────────────── */}
          <div className="ob-nav">
            {step > 1 && (
              <button className="ob-btn-back" onClick={() => setStep(s => s - 1)} type="button">
                ← Back
              </button>
            )}
            <div style={{ flex: 1 }}/>
            {step < steps.length ? (
              <button className="ob-btn-next" onClick={() => setStep(s => s + 1)} type="button">
                Continue <ArrowRight size={15}/>
              </button>
            ) : (
              <button className="ob-btn-save" onClick={saveAll} disabled={saving} type="button" id="onboarding-save-btn">
                {saving ? (
                  <><Loader2 size={15} className="ob-spin"/> Saving…</>
                ) : (
                  <><Save size={15}/> Save & Go to Dashboard</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <ObStyles/>
    </div>
  );
};

/* ─── Scoped styles ───────────────────────────────────────────────── */
const ObStyles = () => (
  <style>{`
    /* Root */
    .ob-root {
      position: relative;
      min-height: 100vh;
      background: #0B1120;
      color: #F8FAFC;
      font-family: 'Plus Jakarta Sans', sans-serif;
      display: flex; flex-direction: column;
      overflow-x: hidden;
      transition: background-color 0.2s ease, color 0.2s ease;
    }

    /* Ambient background */
    .ob-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
    .ob-ambient-top {
      position: absolute;
      top: -120px;
      left: 50%;
      transform: translateX(-50%);
      width: 800px;
      height: 400px;
      background: radial-gradient(ellipse at center, rgba(79, 70, 229, 0.08) 0%, transparent 70%);
    }
    .ob-ambient-bottom {
      position: absolute;
      bottom: 0;
      right: 5%;
      width: 600px;
      height: 350px;
      background: radial-gradient(ellipse at center, rgba(99, 102, 241, 0.05) 0%, transparent 70%);
    }
    .ob-grid {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(148, 163, 184, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(148, 163, 184, 0.03) 1px, transparent 1px);
      background-size: 40px 40px;
    }

    /* Shell */
    .ob-shell {
      position: relative; z-index: 1;
      max-width: 720px; margin: 0 auto;
      width: 100%; padding: 0 1.25rem 3rem;
    }

    /* Top bar */
    .ob-topbar {
      display: flex; align-items: center;
      justify-content: space-between;
      padding: 1.25rem 0 0;
      margin-bottom: 2rem;
    }
    .ob-logo { display: flex; align-items: center; gap: 9px; }
    .ob-logo-icon {
      width: 32px; height: 32px; border-radius: 9px;
      background: #4F46E5;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 1px 3px rgba(79, 70, 229, 0.3);
    }
    .ob-logo-text { font-size: 0.95rem; font-weight: 700; letter-spacing: -0.02em; color: #FFFFFF; }
    .ob-topbar-actions {
      display: flex; align-items: center; gap: 12px;
    }
    .ob-skip {
      font-size: 0.8rem; color: #94A3B8;
      cursor: pointer; transition: color 0.18s;
      font-weight: 500;
    }
    .ob-skip:hover { color: #FFFFFF; }

    /* Welcome */
    .ob-welcome { text-align: center; margin-bottom: 2rem; }
    .ob-welcome-badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 12px; border-radius: 999px;
      background: rgba(79, 70, 229, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
      font-size: 0.75rem; font-weight: 600; color: #818CF8;
      margin-bottom: 0.75rem;
    }
    .ob-welcome-title {
      font-size: clamp(1.4rem, 3vw, 1.9rem);
      font-weight: 800; letter-spacing: -0.03em;
      color: #FFFFFF; margin-bottom: 0.5rem; line-height: 1.25;
    }
    .ob-welcome-sub { font-size: 0.88rem; color: #94A3B8; }

    /* Stepper */
    .ob-stepper { margin-bottom: 1.5rem; }
    .ob-progress-bar {
      height: 3px; border-radius: 4px;
      background: #1E293B;
      margin-bottom: 1rem; overflow: hidden;
    }
    .ob-progress-fill {
      height: 100%; border-radius: 4px;
      background: #4F46E5;
      transition: width 0.4s cubic-bezier(0.4,0,0.2,1);
    }
    .ob-steps { display: flex; gap: 1rem; justify-content: center; }
    .ob-step {
      display: flex; align-items: center; gap: 7px;
      font-size: 0.8rem; font-weight: 500;
      color: #94A3B8;
      transition: color 0.18s;
    }
    .ob-step-active { color: #818CF8; font-weight: 700; }
    .ob-step-done { color: #34D399; }
    .ob-step-circle {
      width: 26px; height: 26px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      background: #1E293B;
      border: 2px solid #334155;
      color: #94A3B8;
      transition: background 0.18s, border-color 0.18s;
    }
    .ob-step-active .ob-step-circle {
      background: rgba(79, 70, 229, 0.15);
      border-color: #6366F1;
      color: #818CF8;
    }
    .ob-step-done .ob-step-circle {
      background: rgba(16, 185, 129, 0.15);
      border-color: #10B981;
      color: #34D399;
    }

    /* Card */
    .ob-card {
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid #1E293B;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
      transition: background-color 0.2s ease, border-color 0.2s ease;
    }
    .ob-card::before {
      content: '';
      display: block; height: 3px;
      background: linear-gradient(90deg, #4F46E5, #7C3AED, #EC4899);
    }

    .ob-step-content { padding: 1.75rem 1.75rem 0; }

    /* Section header */
    .ob-section-head { display: flex; align-items: flex-start; gap: 0.9rem; margin-bottom: 1.5rem; }
    .ob-section-icon {
      width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .ob-icon-blue    { background: rgba(79, 70, 229, 0.15); color: #818CF8; }
    .ob-icon-violet  { background: rgba(139, 92, 246, 0.15); color: #A78BFA; }
    .ob-icon-emerald { background: rgba(16, 185, 129, 0.15); color: #34D399; }
    .ob-section-title { font-size: 1rem; font-weight: 700; color: #FFFFFF; margin: 0 0 2px; }
    .ob-section-sub { font-size: 0.82rem; color: #94A3B8; margin: 0; }

    /* Fields */
    .ob-fields { display: flex; flex-direction: column; gap: 1.1rem; }
    .ob-field { display: flex; flex-direction: column; gap: 6px; }
    .ob-label {
      display: flex; align-items: center; gap: 5px;
      font-size: 0.8rem; font-weight: 600;
      color: #CBD5E1;
    }
    .ob-input {
      width: 100%; padding: 10px 14px;
      background: #1E293B;
      border: 1px solid #334155;
      border-radius: 10px;
      color: #F8FAFC;
      font-size: 0.875rem;
      font-family: inherit;
      outline: none;
      transition: border-color 0.18s, box-shadow 0.18s;
      box-sizing: border-box;
    }
    .ob-input:focus {
      border-color: #6366F1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }
    .ob-input::placeholder { color: #64748B; }
    .ob-input-sm { margin-top: 8px; }
    .ob-hint { font-size: 0.75rem; color: #64748B; margin: 0; }

    /* Sector pills */
    .ob-sector-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 4px; }
    .ob-sector-btn {
      padding: 5px 14px; border-radius: 999px;
      font-size: 0.8rem; font-weight: 500;
      background: #1E293B;
      border: 1px solid #334155;
      color: #94A3B8;
      cursor: pointer; transition: all 0.15s;
    }
    .ob-sector-btn:hover { border-color: #64748B; color: #F8FAFC; }
    .ob-sector-active {
      background: rgba(79, 70, 229, 0.2) !important;
      border-color: #6366F1 !important;
      color: #818CF8 !important;
      font-weight: 600;
    }

    /* Add row */
    .ob-add-row { display: flex; gap: 8px; margin-bottom: 1rem; }
    .ob-add-btn {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 10px 16px; border-radius: 10px;
      font-size: 0.85rem; font-weight: 600; white-space: nowrap;
      color: #fff;
      background: #4F46E5;
      border: none; cursor: pointer;
      box-shadow: 0 1px 3px rgba(79, 70, 229, 0.25);
      transition: all 0.18s ease;
      flex-shrink: 0;
    }
    .ob-add-btn:hover { background: #4338CA; transform: translateY(-1px); }

    /* Popular */
    .ob-popular { margin-bottom: 1rem; }
    .ob-popular-label { font-size: 0.75rem; font-weight: 600; color: #64748B; margin-bottom: 8px; }
    .ob-popular-grid { display: flex; flex-wrap: wrap; gap: 7px; }
    .ob-popular-btn {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 4px 12px; border-radius: 999px;
      font-size: 0.78rem; font-weight: 500;
      background: #1E293B;
      border: 1px solid #334155;
      color: #94A3B8;
      cursor: pointer; transition: all 0.15s;
    }
    .ob-popular-btn:hover { border-color: #64748B; color: #F8FAFC; }
    .ob-popular-active {
      background: rgba(79, 70, 229, 0.2) !important;
      border-color: #6366F1 !important;
      color: #818CF8 !important;
      font-weight: 600;
    }

    /* Chips */
    .ob-chips-section { margin-bottom: 0.5rem; }
    .ob-chips-label { font-size: 0.75rem; font-weight: 600; color: #64748B; margin-bottom: 8px; }
    .ob-chips { display: flex; flex-wrap: wrap; gap: 7px; }
    .ob-chip {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 5px 12px; border-radius: 999px;
      font-size: 0.8rem; font-weight: 500;
    }
    .ob-chip-tech { background: rgba(79, 70, 229, 0.15); color: #818CF8; border: 1px solid rgba(99, 102, 241, 0.25); }
    .ob-chip-soft { background: rgba(16, 185, 129, 0.15);  color: #34D399; border: 1px solid rgba(16, 185, 129, 0.25); }
    .ob-chip-remove {
      display: flex; align-items: center; justify-content: center;
      background: none; border: none; cursor: pointer;
      opacity: 0.6; transition: opacity 0.15s; padding: 0;
      color: inherit;
    }
    .ob-chip-remove:hover { opacity: 1; }

    /* Summary */
    .ob-summary {
      margin-top: 1.5rem; padding: 1rem;
      background: #1E293B;
      border: 1px solid #334155;
      border-radius: 12px;
    }
    .ob-summary-label { font-size: 0.72rem; font-weight: 700; color: #818CF8; margin-bottom: 0.6rem; text-transform: uppercase; letter-spacing: 0.06em; }
    .ob-summary-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .ob-sum-item {
      display: inline-flex; align-items: center; gap: 5px;
      font-size: 0.8rem; color: #F8FAFC;
      background: #0F172A;
      border: 1px solid #334155;
      padding: 4px 10px; border-radius: 8px;
    }

    /* Nav buttons */
    .ob-nav {
      display: flex; align-items: center; gap: 0.75rem;
      padding: 1.25rem 1.75rem;
      border-top: 1px solid #1E293B;
    }
    .ob-btn-back {
      padding: 9px 18px; border-radius: 10px;
      font-size: 0.875rem; font-weight: 600;
      background: #1E293B;
      border: 1px solid #334155;
      color: #CBD5E1;
      cursor: pointer; transition: all 0.18s;
    }
    .ob-btn-back:hover { background: #334155; color: #FFFFFF; }
    .ob-btn-next {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 9px 22px; border-radius: 10px;
      font-size: 0.875rem; font-weight: 600; color: #fff;
      background: #4F46E5;
      border: none; cursor: pointer;
      box-shadow: 0 1px 3px rgba(79, 70, 229, 0.25);
      transition: all 0.18s ease;
    }
    .ob-btn-next:hover { background: #4338CA; transform: translateY(-1px); }
    .ob-btn-save {
      display: inline-flex; align-items: center; gap: 7px;
      padding: 9px 22px; border-radius: 10px;
      font-size: 0.875rem; font-weight: 600; color: #fff;
      background: #059669;
      border: none; cursor: pointer;
      box-shadow: 0 1px 3px rgba(5, 150, 105, 0.25);
      transition: all 0.18s ease;
    }
    .ob-btn-save:hover:not(:disabled) { background: #047857; transform: translateY(-1px); }
    .ob-btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
    .ob-spin { animation: obSpin 0.7s linear infinite; }
    @keyframes obSpin { to { transform: rotate(360deg); } }

    /* Skeleton */
    .ob-skeleton {
      border-radius: 16px;
      background: linear-gradient(90deg, #1E293B 25%, #334155 50%, #1E293B 75%);
      background-size: 200% 100%;
      animation: obSkWave 1.5s ease-in-out infinite;
    }
    .ob-sk-header { height: 80px; margin: 2rem 0 1rem; }
    .ob-sk-body   { height: 380px; }
    @keyframes obSkWave { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

    @media (max-width: 500px) {
      .ob-step-label { display: none; }
      .ob-step-content { padding: 1.25rem 1.25rem 0; }
      .ob-nav { padding: 1rem 1.25rem; }
    }

    /* ═══════════════════════════════════════════════════════════
       LIGHT MODE OVERRIDES — Main Dashboard Slate & White
    ═══════════════════════════════════════════════════════════ */
    :root:not(.dark) .ob-root {
      background: #F8FAFC;
      color: #0F172A;
    }
    :root:not(.dark) .ob-ambient-top {
      background: radial-gradient(ellipse at center, rgba(79, 70, 229, 0.05) 0%, transparent 70%);
    }
    :root:not(.dark) .ob-ambient-bottom {
      background: radial-gradient(ellipse at center, rgba(148, 163, 184, 0.08) 0%, transparent 70%);
    }
    :root:not(.dark) .ob-grid {
      background-image:
        linear-gradient(rgba(203, 213, 225, 0.4) 1px, transparent 1px),
        linear-gradient(90deg, rgba(203, 213, 225, 0.4) 1px, transparent 1px);
    }
    :root:not(.dark) .ob-logo-text { color: #0F172A; }
    :root:not(.dark) .ob-skip { color: #64748B; }
    :root:not(.dark) .ob-skip:hover { color: #0F172A; }
    :root:not(.dark) .ob-welcome-badge {
      background: #EEF2FF;
      border-color: #C7D2FE;
      color: #4F46E5;
    }
    :root:not(.dark) .ob-welcome-title { color: #0F172A; }
    :root:not(.dark) .ob-welcome-sub { color: #64748B; }
    :root:not(.dark) .ob-progress-bar { background: #E2E8F0; }
    :root:not(.dark) .ob-step { color: #64748B; }
    :root:not(.dark) .ob-step-active { color: #4F46E5; }
    :root:not(.dark) .ob-step-done { color: #059669; }
    :root:not(.dark) .ob-step-circle {
      background: #F1F5F9;
      border-color: #CBD5E1;
      color: #64748B;
    }
    :root:not(.dark) .ob-step-active .ob-step-circle {
      background: #EEF2FF;
      border-color: #4F46E5;
      color: #4F46E5;
    }
    :root:not(.dark) .ob-step-done .ob-step-circle {
      background: #ECFDF5;
      border-color: #10B981;
      color: #059669;
    }
    :root:not(.dark) .ob-card {
      background: #FFFFFF;
      border-color: #E2E8F0;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
    }
    :root:not(.dark) .ob-section-title { color: #0F172A; }
    :root:not(.dark) .ob-section-sub { color: #64748B; }
    :root:not(.dark) .ob-label { color: #334155; }
    :root:not(.dark) .ob-input {
      background: #FFFFFF;
      border-color: #CBD5E1;
      color: #0F172A;
    }
    :root:not(.dark) .ob-input:focus {
      border-color: #4F46E5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
    }
    :root:not(.dark) .ob-input::placeholder { color: #94A3B8; }
    :root:not(.dark) .ob-hint { color: #64748B; }
    :root:not(.dark) .ob-sector-btn {
      background: #F1F5F9;
      border-color: #E2E8F0;
      color: #475569;
    }
    :root:not(.dark) .ob-sector-btn:hover {
      border-color: #CBD5E1;
      color: #0F172A;
    }
    :root:not(.dark) .ob-sector-active {
      background: #EEF2FF !important;
      border-color: #4F46E5 !important;
      color: #4F46E5 !important;
    }
    :root:not(.dark) .ob-popular-label { color: #64748B; }
    :root:not(.dark) .ob-popular-btn {
      background: #F1F5F9;
      border-color: #E2E8F0;
      color: #475569;
    }
    :root:not(.dark) .ob-popular-btn:hover {
      border-color: #CBD5E1;
      color: #0F172A;
    }
    :root:not(.dark) .ob-popular-active {
      background: #EEF2FF !important;
      border-color: #4F46E5 !important;
      color: #4F46E5 !important;
    }
    :root:not(.dark) .ob-chips-label { color: #64748B; }
    :root:not(.dark) .ob-summary {
      background: #F8FAFC;
      border-color: #E2E8F0;
    }
    :root:not(.dark) .ob-summary-label { color: #4F46E5; }
    :root:not(.dark) .ob-sum-item {
      background: #FFFFFF;
      border-color: #E2E8F0;
      color: #0F172A;
    }
    :root:not(.dark) .ob-nav { border-top-color: #E2E8F0; }
    :root:not(.dark) .ob-btn-back {
      background: #F1F5F9;
      border-color: #E2E8F0;
      color: #475569;
    }
    :root:not(.dark) .ob-btn-back:hover {
      background: #E2E8F0;
      color: #0F172A;
    }
    :root:not(.dark) .ob-skeleton {
      background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
      background-size: 200% 100%;
    }
  `}</style>
);

export default CandidateOnboarding;
