import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Linkedin,
  Github,
  Globe,
  Plus,
  X,
  Save,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  FileText,
  Upload,
  Sparkles,
} from 'lucide-react';
import { userAPI, skillsAPI, resumeService } from '../services/api';
import { calcProfileCompletion } from '../utils/profileCompletion';

const POPULAR_TECH_SKILLS = [
  'React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Java',
  'MongoDB', 'SQL', 'HTML', 'CSS', 'TailwindCSS', 'Next.js',
  'Express', 'Docker', 'AWS', 'Git'
];

const POPULAR_SOFT_SKILLS = [
  'Communication', 'Teamwork', 'Problem Solving', 'Adaptability',
  'Time Management', 'Critical Thinking', 'Leadership'
];

const Settings = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    dateOfBirth: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    headline: '',
    bio: '',
    techSkills: [],
    softSkills: [],
    resume: null,
  });

  const [formData, setFormData] = useState({ ...profile });
  const [techInput, setTechInput] = useState('');
  const [softInput, setSoftInput] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  // Danger Zone modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    document.title = 'Settings – InterGuide';
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/user-login');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const [res, skillsRes] = await Promise.all([
          userAPI.getProfile().catch(() => null),
          skillsAPI.get().catch(() => null),
        ]);

        if (res?.user) {
          const u = res.user;
          const tech = Array.isArray(skillsRes?.technicalSkills) && skillsRes.technicalSkills.length > 0
            ? skillsRes.technicalSkills
            : (Array.isArray(u?.technicalSkills) && u.technicalSkills.length > 0
                ? u.technicalSkills
                : (Array.isArray(u?.profile?.skills) ? u.profile.skills : []));

          const soft = Array.isArray(skillsRes?.softSkills) && skillsRes.softSkills.length > 0
            ? skillsRes.softSkills
            : (Array.isArray(u?.softSkills) ? u.softSkills : []);

          const loaded = {
            fullName:     u?.name || '',
            email:        u?.email || '',
            phone:        u?.profile?.phone || '',
            location:     u?.profile?.location || '',
            dateOfBirth:  u?.profile?.dateOfBirth || '',
            linkedinUrl:  u?.profile?.linkedinUrl || '',
            githubUrl:    u?.profile?.githubUrl || '',
            portfolioUrl: u?.profile?.portfolioUrl || '',
            headline:     u?.profile?.headline || '',
            bio:          u?.profile?.bio || '',
            techSkills:   tech,
            softSkills:   soft,
            resume:       u?.resume || null,
          };

          setProfile(loaded);
          setFormData(loaded);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings data.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const showToast = (msg, type = 'success') => {
    setToast({ text: msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const addTechSkill = (skill) => {
    const val = (skill || techInput).trim();
    if (!val) return;
    const curr = formData.techSkills || [];
    if (!curr.some(s => s.toLowerCase() === val.toLowerCase())) {
      setFormData(prev => ({ ...prev, techSkills: [...curr, val] }));
    }
    setTechInput('');
  };

  const removeTechSkill = (toRemove) => {
    setFormData(prev => ({
      ...prev,
      techSkills: (prev.techSkills || []).filter(s => s !== toRemove),
    }));
  };

  const addSoftSkill = (skill) => {
    const val = (skill || softInput).trim();
    if (!val) return;
    const curr = formData.softSkills || [];
    if (!curr.some(s => s.toLowerCase() === val.toLowerCase())) {
      setFormData(prev => ({ ...prev, softSkills: [...curr, val] }));
    }
    setSoftInput('');
  };

  const removeSoftSkill = (toRemove) => {
    setFormData(prev => ({
      ...prev,
      softSkills: (prev.softSkills || []).filter(s => s !== toRemove),
    }));
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Resume must be under 5MB', 'error');
      return;
    }

    setUploadingResume(true);
    try {
      const res = await resumeService.upload(file);
      if (res?.resume) {
        showToast('Resume uploaded successfully!');
        const updated = await userAPI.getProfile().catch(() => null);
        if (updated?.user) {
          const newResume = updated.user.resume || { fileName: file.name, uploadedAt: new Date() };
          setProfile(p => ({ ...p, resume: newResume }));
          setFormData(p => ({ ...p, resume: newResume }));
          try {
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            Object.assign(stored, updated.user);
            stored.profile = updated.user.profile || stored.profile || {};
            stored.profile.completion = calcProfileCompletion(stored.profile, stored);
            localStorage.setItem('user', JSON.stringify(stored));
            window.dispatchEvent(new Event('storage'));
          } catch (_) {}
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
      showToast(err?.message || 'Resume upload failed', 'error');
    } finally {
      setUploadingResume(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name:            formData.fullName?.trim() || '',
        location:        formData.location?.trim() || '',
        phone:           formData.phone?.trim() || '',
        dateOfBirth:     formData.dateOfBirth?.trim() || '',
        linkedinUrl:     formData.linkedinUrl?.trim() || '',
        githubUrl:       formData.githubUrl?.trim() || '',
        portfolioUrl:    formData.portfolioUrl?.trim() || '',
        headline:        formData.headline?.trim() || '',
        bio:             formData.bio?.trim() || '',
        technicalSkills: formData.techSkills || [],
        softSkills:      formData.softSkills || [],
      };

      const updateRes = await userAPI.updateProfile(payload);
      await skillsAPI.save({
        techSkills: formData.techSkills || [],
        softSkills: formData.softSkills || [],
      }).catch(() => null);

      if (updateRes?.user) {
        try {
          const stored = JSON.parse(localStorage.getItem('user') || '{}');
          Object.assign(stored, updateRes.user);
          stored.name = updateRes.user.name || stored.name;
          stored.profile = updateRes.user.profile || stored.profile || {};
          stored.profile.completion = calcProfileCompletion(stored.profile, stored);
          localStorage.setItem('user', JSON.stringify(stored));
          window.dispatchEvent(new Event('storage'));
        } catch (_) {}
      }

      setProfile({ ...formData });
      showToast('Profile settings saved!');
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError(err?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeleting(true);
    try {
      await userAPI.deleteProfile();
      navigate('/user-login', { replace: true });
    } catch (err) {
      console.error('Delete error:', err);
      showToast(err?.message || 'Failed to delete account.', 'error');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-pulse space-y-6">
        <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-64 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl" />
        <div className="h-44 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl" />
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Toast message */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold text-white ${
          toast.type === 'error' ? 'bg-rose-600 border-rose-500' : 'bg-emerald-600 border-emerald-500'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <button
            onClick={() => navigate('/user-profile-management')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Profile
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Update your profile details and manage your account
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => setFormData(profile)}
            disabled={saving}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-xs hover:bg-indigo-700 transition-colors disabled:opacity-60 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── 1. Personal Information ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Personal Information
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={e => handleChange('fullName', e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              Email Address <span className="text-[10px] text-slate-400 font-normal">(Account Login)</span>
            </label>
            <input
              type="email"
              value={formData.email}
              disabled
              readOnly
              className="w-full border border-slate-200/70 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 rounded-xl px-3.5 py-2 text-sm text-slate-400 dark:text-slate-500 cursor-not-allowed select-none"
            />
          </div>

          {/* Headline */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              Professional Headline
            </label>
            <input
              type="text"
              value={formData.headline}
              onChange={e => handleChange('headline', e.target.value)}
              placeholder="e.g. Full Stack Developer | Aspiring Software Engineer"
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => handleChange('phone', e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={e => handleChange('location', e.target.value)}
              placeholder="City, Country"
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Date of Birth */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={e => handleChange('dateOfBirth', e.target.value)}
              className="w-full sm:w-64 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── 2. Social & Professional Profiles ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Social & Online Links
          </h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              LinkedIn URL
            </label>
            <input
              type="url"
              value={formData.linkedinUrl}
              onChange={e => handleChange('linkedinUrl', e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              GitHub URL
            </label>
            <input
              type="url"
              value={formData.githubUrl}
              onChange={e => handleChange('githubUrl', e.target.value)}
              placeholder="https://github.com/username"
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              Portfolio / Website URL
            </label>
            <input
              type="url"
              value={formData.portfolioUrl}
              onChange={e => handleChange('portfolioUrl', e.target.value)}
              placeholder="https://yourportfolio.dev"
              className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── 3. Skills Management ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Skills & Competencies
          </h2>
        </div>

        {/* Tech Skills */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
            Technical Skills ({formData.techSkills?.length || 0})
          </label>

          <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 items-center">
            {(formData.techSkills || []).length === 0 ? (
              <span className="text-xs text-slate-400 italic">No technical skills added yet.</span>
            ) : (
              formData.techSkills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => removeTechSkill(s)}
                    className="hover:text-rose-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={techInput}
              onChange={e => setTechInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTechSkill();
                }
              }}
              placeholder="Type a skill and press Enter (e.g. React, Python)"
              className="flex-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
            <button
              type="button"
              onClick={() => addTechSkill()}
              disabled={!techInput.trim()}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors disabled:opacity-40 cursor-pointer"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-1 pt-1">
            {POPULAR_TECH_SKILLS.filter(
              s => !(formData.techSkills || []).some(k => k.toLowerCase() === s.toLowerCase())
            ).slice(0, 8).map((suggested) => (
              <button
                key={suggested}
                type="button"
                onClick={() => addTechSkill(suggested)}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                + {suggested}
              </button>
            ))}
          </div>
        </div>

        {/* Soft Skills */}
        <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400">
            Soft Skills ({formData.softSkills?.length || 0})
          </label>

          <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 items-center">
            {(formData.softSkills || []).length === 0 ? (
              <span className="text-xs text-slate-400 italic">No soft skills added yet.</span>
            ) : (
              formData.softSkills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => removeSoftSkill(s)}
                    className="hover:text-rose-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={softInput}
              onChange={e => setSoftInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSoftSkill();
                }
              }}
              placeholder="Type a soft skill and press Enter"
              className="flex-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
            <button
              type="button"
              onClick={() => addSoftSkill()}
              disabled={!softInput.trim()}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors disabled:opacity-40 cursor-pointer"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-1 pt-1">
            {POPULAR_SOFT_SKILLS.filter(
              s => !(formData.softSkills || []).some(k => k.toLowerCase() === s.toLowerCase())
            ).slice(0, 5).map((suggested) => (
              <button
                key={suggested}
                type="button"
                onClick={() => addSoftSkill(suggested)}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                + {suggested}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. Resume Management ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Resume Document
            </h2>
          </div>
          {profile.resume?.fileName && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50">
              Active
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
              {profile.resume?.fileName || 'No resume uploaded yet'}
            </p>
            <p className="text-[11px] text-slate-400">PDF or DOCX format (Max 5MB)</p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingResume}
            className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {uploadingResume ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            <span>{profile.resume?.fileName ? 'Replace Resume' : 'Upload Resume'}</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc"
          onChange={handleResumeUpload}
          className="hidden"
        />
      </div>

      {/* ── Save Action Bar ── */}
      <div className="flex items-center justify-end gap-2.5 pt-1">
        <button
          onClick={() => setFormData(profile)}
          disabled={saving}
          className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors disabled:opacity-50 cursor-pointer"
        >
          Discard
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-xs hover:bg-indigo-700 transition-colors disabled:opacity-60 cursor-pointer"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {/* ── 5. Danger Zone: Delete Profile ── */}
      <div className="bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/50 rounded-2xl p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-rose-100 dark:border-rose-900/30">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <h2 className="text-sm font-bold text-rose-700 dark:text-rose-400">
            Danger Zone
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Delete Profile & Account</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed max-w-lg">
              Permanently delete your profile data, stored resume, and job applications. This action cannot be reversed.
            </p>
          </div>

          <button
            onClick={() => {
              setDeleteConfirmText('');
              setShowDeleteModal(true);
            }}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shrink-0 shadow-xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Profile
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Delete Profile & Account?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This will permanently delete your account and all associated applications.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 text-center space-y-1.5">
              <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                Type <span className="font-mono font-bold">DELETE</span> to confirm:
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value.trim())}
                placeholder="Type DELETE"
                className="w-full text-center border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-800 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/40"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                disabled={deleting}
                className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleting}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Settings;
