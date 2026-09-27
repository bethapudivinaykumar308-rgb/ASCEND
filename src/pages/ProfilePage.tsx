import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Shield, Key, Database, RefreshCw, Check, Sparkles, BookOpen } from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (route: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { userProfile, updateUserProfile, careerPlan, clearPlan, loadDemoPlan } = useApp();

  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [isSaved, setIsSaved] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, email });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleConfirmReset = () => {
    clearPlan();
    setShowConfirmReset(false);
    onNavigate('dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-10 animate-in fade-in duration-150">
      {/* Header */}
      <div className="border-b border-stone-850 pb-5">
        <div className="text-xs font-mono text-stone-500 uppercase tracking-wider mb-1">
          Learner Identity & Configuration
        </div>
        <h1 className="text-3xl font-display font-bold text-stone-100">
          Profile & Training Settings
        </h1>
        <p className="text-sm text-stone-400 mt-1">
          Manage your credentials, career track preferences, and backend integration readiness.
        </p>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="border border-stone-850 bg-stone-900/40 rounded-lg p-6 space-y-6">
        <div className="text-xs font-mono uppercase tracking-wider text-stone-400">
          Learner Credentials
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-stone-400 uppercase">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded text-xs text-stone-100 focus:outline-none focus:border-stone-600 font-sans"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-stone-400 uppercase">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded text-xs text-stone-100 focus:outline-none focus:border-stone-600 font-sans"
              required
            />
          </div>
        </div>

        {careerPlan && (
          <div className="p-4 bg-stone-950 border border-stone-850 rounded space-y-2 text-xs">
            <div className="text-[11px] font-mono text-amber-500 uppercase">Active Career Goal Track</div>
            <div className="text-sm font-semibold text-stone-200">{careerPlan.goal.targetJob}</div>
            <div className="text-stone-400 font-mono text-[11px]">
              Education: {careerPlan.goal.education} · Pace: {careerPlan.goal.studyTimePerDayHours}h/day · Level: {careerPlan.currentLevelNumber} of {careerPlan.levels.length}
            </div>
          </div>
        )}

        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs text-stone-500 font-mono">
            User ID: {userProfile.id}
          </span>

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-white text-stone-950 text-xs font-semibold rounded transition-colors"
          >
            {isSaved && <Check className="w-3.5 h-3.5" />}
            <span>{isSaved ? 'Saved' : 'Save Changes'}</span>
          </button>
        </div>
      </form>

      {/* Backend & AI Integration Readiness Status */}
      <div className="border border-stone-850 bg-stone-900/40 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono uppercase tracking-wider text-stone-400">
            Backend & Intelligence Architecture
          </div>
          <span className="text-[11px] font-mono text-amber-400">
            Services Decoupled & Ready
          </span>
        </div>

        <p className="text-xs text-stone-400 leading-relaxed">
          ASCEND is engineered with clean service boundaries. Remote Firebase Auth, Cloud Firestore data persistence, and Gemini LLM models can connect directly through the existing service abstractions without rebuilding the frontend.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-3 bg-stone-950 border border-stone-850 rounded space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-200">
              <Key className="w-3.5 h-3.5 text-stone-400" />
              <span>Gemini AI Trainer</span>
            </div>
            <p className="text-[11px] text-stone-400">
              Configured via /src/services/aiTrainerService.ts for streaming responses and mock test generation.
            </p>
          </div>

          <div className="p-3 bg-stone-950 border border-stone-850 rounded space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-200">
              <Database className="w-3.5 h-3.5 text-stone-400" />
              <span>Persistence Store</span>
            </div>
            <p className="text-[11px] text-stone-400">
              Active local storage abstraction ready for Firestore / Cloud SQL synchronization.
            </p>
          </div>

          <div className="p-3 bg-stone-950 border border-stone-850 rounded space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-200">
              <Shield className="w-3.5 h-3.5 text-stone-400" />
              <span>Stage-Gating Logic</span>
            </div>
            <p className="text-[11px] text-stone-400">
              Strict client & server validation enforcing 75%+ assessment thresholds before unlocking levels.
            </p>
          </div>
        </div>
      </div>

      {/* Reset & Quick Demo Actions */}
      <div className="border border-stone-850 bg-stone-950 p-6 rounded-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-stone-300">Reset Roadmap Track</div>
            <p className="text-xs text-stone-500 mt-0.5">
              Clear current progress and configure a completely new target role from scratch.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadDemoPlan}
              className="px-3 py-2 bg-stone-900 border border-stone-800 text-stone-300 hover:text-white rounded text-xs transition-colors"
            >
              Load Demo Track
            </button>

            <button
              onClick={() => setShowConfirmReset(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-900 border border-rose-900/60 text-rose-400 hover:bg-rose-950/40 rounded text-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Roadmap</span>
            </button>
          </div>
        </div>

        {showConfirmReset && (
          <div className="p-4 bg-rose-950/20 border border-rose-900/60 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
            <div className="text-xs text-rose-300">
              <strong className="block font-semibold">Are you sure you want to reset your career roadmap?</strong>
              All current topic completions and mock test results will be cleared.
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-3 py-1.5 bg-stone-900 border border-stone-700 text-stone-300 text-xs rounded hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded transition-colors"
              >
                Yes, Reset Roadmap
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
