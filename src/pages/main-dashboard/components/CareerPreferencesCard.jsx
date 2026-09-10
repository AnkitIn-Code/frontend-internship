import React, { useState } from 'react';
import {
  Building2, MapPin, Code, Sparkles, CheckCircle2,
  X, ChevronDown, Laptop, Layers, Cpu,
  Database, Cloud, Globe, Check
} from 'lucide-react';

const DOMAIN_OPTIONS = [
  { label: 'Technology & Software', icon: Laptop },
  { label: 'Frontend Development', icon: Code },
  { label: 'Full Stack Development', icon: Layers },
  { label: 'Backend Development', icon: Database },
  { label: 'Data Science & AI / ML', icon: Cpu },
  { label: 'Mobile App Development', icon: Laptop },
  { label: 'DevOps & Cloud Computing', icon: Cloud },
  { label: 'Cybersecurity', icon: Building2 },
  { label: 'UI/UX & Product Design', icon: Layers },
  { label: 'Product Management', icon: Building2 },
  { label: 'Business Analytics & Data', icon: Database },
  { label: 'Digital Marketing & Growth', icon: Globe },
  { label: 'Finance & FinTech', icon: Building2 },
  { label: 'Core Engineering', icon: Building2 },
  { label: 'General / All Sectors', icon: Globe },
];

const MASTER_LOCATIONS_POOL = [
  'Pan India',
  'Remote / Work From Home',
  'Bengaluru',
  'Hyderabad',
  'Pune',
  'Mumbai',
  'Delhi NCR',
  'Noida',
  'Gurgaon',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Chandigarh',
  'Kochi',
  'Indore',
  'Coimbatore'
];

const SKILL_CATEGORIES = {
  'All': null,
  'Frontend': ['React', 'JavaScript', 'TypeScript', 'Next.js', 'HTML/CSS', 'Tailwind CSS', 'Redux', 'Vue.js', 'Angular', 'Figma'],
  'Backend': ['Node.js', 'Express.js', 'Python', 'Java', 'Spring Boot', 'PHP', 'Django', 'FastAPI', 'C#', '.NET', 'Go', 'Rust', 'REST APIs', 'GraphQL'],
  'Data & AI': ['Python', 'Machine Learning', 'Data Analysis', 'SQL', 'PostgreSQL', 'MongoDB', 'AI Prompting'],
  'Cloud & DevOps': ['AWS', 'Docker', 'Kubernetes', 'Linux', 'Git', 'Firebase', 'DevOps', 'Cloud Computing', 'Cybersecurity', 'Agile/Scrum'],
};

const ALL_SKILLS_LIST = Array.from(
  new Set(
    Object.values(SKILL_CATEGORIES)
      .filter(Boolean)
      .flat()
  )
).sort((a, b) => a.localeCompare(b));

const CareerPreferencesCard = ({
  userData = {},
  userSkills = [],
  onUpdatePreferences,
  saving = false
}) => {
  const [saveMessage, setSaveMessage] = useState('');
  const [domainListOpen, setDomainListOpen] = useState(false);
  const [activeSkillCategory, setActiveSkillCategory] = useState('All');

  const currentSector = userData?.profile?.sector || 'General / All Sectors';

  // Parse multi-locations
  const currentLocations = Array.isArray(userData?.profile?.locations) && userData.profile.locations.length > 0
    ? userData.profile.locations
    : (userData?.profile?.location
        ? userData.profile.location.split(',').map(s => s.trim()).filter(Boolean)
        : ['Pan India']);

  // Available locations option list (Pool MINUS currently selected)
  const availableLocations = MASTER_LOCATIONS_POOL.filter(
    loc => !currentLocations.some(existing => existing.toLowerCase() === loc.toLowerCase())
  );

  // Available skills option list (Pool MINUS currently selected, filtered by category)
  const categorySkills = activeSkillCategory === 'All'
    ? ALL_SKILLS_LIST
    : (SKILL_CATEGORIES[activeSkillCategory] || ALL_SKILLS_LIST);

  const availableSkills = categorySkills.filter(
    skill => !userSkills.some(existing => existing.toLowerCase() === skill.toLowerCase())
  );

  const showFeedback = (msg = 'Saved to profile') => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(''), 2200);
  };

  // Domain change handler
  const handleSelectDomain = (domain) => {
    onUpdatePreferences({ sector: domain });
    setDomainListOpen(false);
    showFeedback('Domain updated & saved');
  };

  // Add location from option list
  const handleAddLocation = (locToAdd) => {
    if (!locToAdd) return;
    if (currentLocations.some(l => l.toLowerCase() === locToAdd.toLowerCase())) return;
    const updated = [...currentLocations, locToAdd];
    onUpdatePreferences({
      locations: updated,
      location: updated.join(', ')
    });
    showFeedback(`Added ${locToAdd}`);
  };

  // Remove location (returns back to available option list)
  const handleRemoveLocation = (locToRemove) => {
    const updated = currentLocations.filter(l => l !== locToRemove);
    const finalLocations = updated.length > 0 ? updated : ['Pan India'];
    onUpdatePreferences({
      locations: finalLocations,
      location: finalLocations.join(', ')
    });
    showFeedback(`Removed ${locToRemove}`);
  };

  // Add skill from option list
  const handleAddSkill = (skillToAdd) => {
    if (!skillToAdd) return;
    if (userSkills.some(s => s.toLowerCase() === skillToAdd.toLowerCase())) return;
    const updated = [...userSkills, skillToAdd];
    onUpdatePreferences({ skills: updated });
    showFeedback(`Added ${skillToAdd}`);
  };

  // Remove skill (returns back to available option list)
  const handleRemoveSkill = (skillToRemove) => {
    const updated = userSkills.filter(s => s !== skillToRemove);
    onUpdatePreferences({ skills: updated });
    showFeedback(`Removed ${skillToRemove}`);
  };

  const selectedDomainObj = DOMAIN_OPTIONS.find(d => d.label === currentSector) || DOMAIN_OPTIONS[0];
  const DomainIcon = selectedDomainObj.icon || Building2;

  return (
    <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs p-5 backdrop-blur-sm transition-colors space-y-5">
      {/* Top accent bar & status */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Recommendations Setup
          </span>
        </div>
        {saveMessage ? (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full animate-fade-in border border-emerald-200/60 dark:border-emerald-900/50">
            <CheckCircle2 className="w-3 h-3" /> {saveMessage}
          </span>
        ) : (
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-500" /> Auto-sync
          </span>
        )}
      </div>

      {/* Candidate Profile Info Header */}
      <div className="flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-indigo-500/20 shrink-0">
          {(userData.name?.charAt(0) || 'C').toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
            {userData.name || 'Candidate'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {userData.email || '—'}
          </p>
        </div>
      </div>

      {/* ── 1. DOMAIN OPTION LIST ─────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Target Domain</span>
          </label>
          <button
            type="button"
            onClick={() => setDomainListOpen(!domainListOpen)}
            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>{domainListOpen ? 'Close list' : 'Change domain'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${domainListOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Current Active Domain Badge */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-900/50">
          <div className="w-7 h-7 rounded-xl bg-white dark:bg-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-300 shadow-2xs shrink-0">
            <DomainIcon className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 truncate">
            {currentSector}
          </span>
        </div>

        {/* Available Domain Option List (shown on click or toggle) */}
        {domainListOpen && (
          <div className="p-2 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 max-h-48 overflow-y-auto space-y-1 animate-in fade-in duration-150">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-1">
              Select domain from option list:
            </div>
            {DOMAIN_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = opt.label === currentSector;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleSelectDomain(opt.label)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all text-left ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 2. PREFERRED LOCATIONS (PURE OPTION LIST) ──────────────── */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Preferred Locations</span>
          </label>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/50">
            {currentLocations.length} active
          </span>
        </div>

        {/* Selected Locations Chips */}
        <div className="flex flex-wrap gap-1.5 p-2.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 max-h-28 overflow-y-auto">
          {currentLocations.map((loc) => (
            <span
              key={loc}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/80 shadow-2xs transition-all"
            >
              <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
              <span className="truncate max-w-[130px]">{loc}</span>
              <button
                type="button"
                onClick={() => handleRemoveLocation(loc)}
                title={`Remove ${loc}`}
                className="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors ml-0.5"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>

        {/* Available Location Option List (Tap any to add — removes from this list) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span>Option list (tap to add):</span>
            <span className="text-[10px] text-slate-400">{availableLocations.length} remaining</span>
          </div>

          <div className="p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 max-h-40 overflow-y-auto">
            {availableLocations.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {availableLocations.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => handleAddLocation(loc)}
                    className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50/70 dark:hover:bg-amber-950/50 hover:text-amber-800 dark:hover:text-amber-300 transition-all cursor-pointer active:scale-95 shadow-2xs"
                  >
                    <span>{loc}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 italic text-center py-2">
                All location options have been selected.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. PROFILE SKILLS (PURE OPTION LIST) ───────────────────── */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Code className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Profile Skills</span>
          </label>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/50">
            {userSkills.length} selected
          </span>
        </div>

        {/* Selected Skills Chips */}
        {userSkills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 p-2.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 max-h-28 overflow-y-auto">
            {userSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/80 shadow-2xs transition-all"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  title={`Remove ${skill}`}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors ml-0.5"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-700 dark:text-amber-300">
            Tap any skill option below to add it to your matching profile!
          </div>
        )}

        {/* Category Tabs for Skill Option List */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5">
          {Object.keys(SKILL_CATEGORIES).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveSkillCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition-all ${
                activeSkillCategory === cat
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Available Skills Option List (Tap any to add — removes from this list) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <span>Option list (tap to add):</span>
            <span className="text-[10px] text-slate-400">{availableSkills.length} remaining</span>
          </div>

          <div className="p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 max-h-40 overflow-y-auto">
            {availableSkills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {availableSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleAddSkill(skill)}
                    className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all cursor-pointer active:scale-95 shadow-2xs"
                  >
                    <span>{skill}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 italic text-center py-2">
                All skills in this category have been selected.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sync Note Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
        <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
        <span>Selections immediately update live job recommendations and profile readiness.</span>
      </div>
    </div>
  );
};

export default CareerPreferencesCard;
