import React, { useState, useEffect } from 'react';
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
  ExternalLink,
  Edit,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
} from 'lucide-react';
import { userAPI, skillsAPI } from '../../services/api';
import { calcProfileCompletion } from '../../utils/profileCompletion';

const UserProfileManagement = () => {
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'My Profile – InterGuide';
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/user-login');
      return;
    }

    const loadProfile = async () => {
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

          setProfile({
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
          });
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const userInitial = (profile.fullName?.charAt(0) || 'C').toUpperCase();

  // Completion calculation
  const mappedProfileForScore = {
    location:    profile.location,
    phone:       profile.phone,
    dateOfBirth: profile.dateOfBirth,
    linkedinUrl: profile.linkedinUrl,
    githubUrl:   profile.githubUrl,
    skills:      profile.techSkills,
    techSkills:  profile.techSkills,
    softSkills:  profile.softSkills,
  };
  const mappedUserForScore = {
    name:   profile.fullName,
    email:  profile.email,
    resume: profile.resume,
  };
  const profileProgress = calcProfileCompletion(mappedProfileForScore, mappedUserForScore);

  if (loading) {
    return (
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
        <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        <div className="h-44 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="h-56 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl" />
          <div className="h-56 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl" />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            My Profile
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            View your candidate profile and professional details
          </p>
        </div>

        {/* Edit Profile Button -> Navigates to /settings */}
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-xs hover:bg-indigo-700 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Edit className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── User Overview Card (Sidebar-aligned design) ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {/* User Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-xs shrink-0 select-none">
              {userInitial}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {profile.fullName || 'Candidate'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50">
                  Candidate
                </span>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    Active
                  </span>
                </div>
              </div>

              {profile.headline ? (
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                  {profile.headline}
                </p>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                  No headline set yet
                </p>
              )}

              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap pt-0.5">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {profile.email}
                </span>
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {profile.location}
                  </span>
                )}
                {profile.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {profile.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Profile Progress Box (Sidebar exact style) */}
          <div className="w-full sm:w-56 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2 shrink-0">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="uppercase tracking-wider text-slate-500 dark:text-slate-400">
                PROFILE PROGRESS
              </span>
              <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-xs">
                {profileProgress}%
              </span>
            </div>

            <div className="w-full h-1.5 rounded-full bg-slate-200/70 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${profileProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
              <span>{profileProgress >= 80 ? 'Ready for matching' : 'Incomplete'}</span>
              <button
                onClick={() => navigate('/settings')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Complete →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main 2-Column Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Personal Info & Links */}
        <div className="space-y-6">
          {/* Personal Details */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Personal Details
                </h3>
              </div>
              <button
                onClick={() => navigate('/settings')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Edit
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                  Full Name
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {profile.fullName || 'Not provided'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                  Email
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                  {profile.email || 'Not provided'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                  Phone
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {profile.phone || 'Not provided'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                  Location
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {profile.location || 'Not provided'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 sm:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                  Date of Birth
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not provided'}
                </span>
              </div>
            </div>
          </div>

          {/* Social Profiles */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Social & Professional Links
                </h3>
              </div>
              <button
                onClick={() => navigate('/settings')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Edit
              </button>
            </div>

            <div className="space-y-2">
              {/* LinkedIn */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
                    <Linkedin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">LinkedIn</span>
                    <span className="text-[11px] text-slate-400 truncate max-w-[200px] block">
                      {profile.linkedinUrl || 'Not linked'}
                    </span>
                  </div>
                </div>
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl.startsWith('http') ? profile.linkedinUrl : `https://${profile.linkedinUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    Visit <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* GitHub */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                    <Github className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">GitHub</span>
                    <span className="text-[11px] text-slate-400 truncate max-w-[200px] block">
                      {profile.githubUrl || 'Not linked'}
                    </span>
                  </div>
                </div>
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl.startsWith('http') ? profile.githubUrl : `https://${profile.githubUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    Visit <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Portfolio */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Portfolio</span>
                    <span className="text-[11px] text-slate-400 truncate max-w-[200px] block">
                      {profile.portfolioUrl || 'Not linked'}
                    </span>
                  </div>
                </div>
                {profile.portfolioUrl && (
                  <a
                    href={profile.portfolioUrl.startsWith('http') ? profile.portfolioUrl : `https://${profile.portfolioUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    Visit <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Skills & Resume */}
        <div className="space-y-6">
          {/* Skills Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Skills & Competencies
                </h3>
              </div>
              <button
                onClick={() => navigate('/settings')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Manage
              </button>
            </div>

            {/* Technical Skills */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Technical Skills ({profile.techSkills?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(profile.techSkills || []).length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No technical skills added yet.</span>
                ) : (
                  profile.techSkills.map((s) => (
                    <span
                      key={s}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50"
                    >
                      {s}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Soft Skills */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Soft Skills ({profile.softSkills?.length || 0})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(profile.softSkills || []).length === 0 ? (
                  <span className="text-xs text-slate-400 italic">No soft skills added yet.</span>
                ) : (
                  profile.softSkills.map((s) => (
                    <span
                      key={s}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50"
                    >
                      {s}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Attached Resume Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Resume Document
                </h3>
              </div>
              {profile.resume?.atsScore > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50">
                  ATS {profile.resume.atsScore}
                </span>
              )}
            </div>

            {profile.resume?.fileName ? (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {profile.resume.fileName}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Uploaded {profile.resume.uploadedAt ? new Date(profile.resume.uploadedAt).toLocaleDateString() : 'Active'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/ats-analyzer')}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 ml-2 cursor-pointer"
                >
                  Analyze ATS
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-2">
                <p className="text-xs text-slate-500">No resume attached to profile yet.</p>
                <button
                  onClick={() => navigate('/settings')}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  + Upload in Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default UserProfileManagement;