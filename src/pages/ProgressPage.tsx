import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Award,
  CheckCircle2,
  FileText,
  Terminal,
  Users,
  Briefcase,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface ProgressPageProps {
  onNavigate: (route: string) => void;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({ onNavigate }) => {
  const { careerPlan, toggleTrainer } = useApp();

  if (!careerPlan) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center space-y-4">
        <h2 className="text-2xl font-display font-bold text-stone-100">No Career Progress Recorded</h2>
        <p className="text-sm text-stone-400">
          Create a career goal and start completing daily lessons to build your job readiness score.
        </p>
        <button
          onClick={() => onNavigate('new-plan')}
          className="px-5 py-2.5 bg-stone-100 text-stone-950 text-xs font-semibold rounded"
        >
          Create Career Goal
        </button>
      </div>
    );
  }

  const { goal, levels, jobReadiness, analytics } = careerPlan;
  const completedLevels = levels.filter((l) => l.status === 'completed');
  const allLevelsDone = completedLevels.length === levels.length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10 animate-in fade-in duration-150">
      {/* Header */}
      <div className="border-b border-stone-850 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-stone-500 uppercase tracking-wider mb-1">
            Job Readiness Diagnostic · {goal.targetJob}
          </div>
          <h1 className="text-3xl font-display font-bold text-stone-100">
            Career Readiness Evaluation
          </h1>
          <p className="text-sm text-stone-400 mt-1 max-w-2xl">
            Comprehensive audit synthesizing completed technical skills, assessment scores, projects, resume readiness, and interview mock credentials.
          </p>
        </div>

        <button
          onClick={() => toggleTrainer(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/40 border border-amber-800 text-amber-300 text-xs font-medium rounded hover:bg-amber-900/50 transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Simulate Mock Interview with Trainer</span>
        </button>
      </div>

      {/* Primary Qualification Status Monolith */}
      <div
        className={`p-8 border rounded-xl space-y-4 ${
          allLevelsDone
            ? 'border-emerald-800/80 bg-emerald-950/20'
            : 'border-stone-850 bg-stone-900/40'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase tracking-widest text-amber-500">
              Technical Qualification Status
            </div>
            <h2 className="text-2xl font-display font-bold text-stone-100">
              {allLevelsDone
                ? `Job Ready: Fully Qualified for ${goal.targetJob}`
                : `In Training: Level 0${careerPlan.currentLevelNumber} of 0${levels.length} Active`}
            </h2>
            <p className="text-xs text-stone-400">
              {completedLevels.length} of {levels.length} Levels Passed · Assessment Mean: {analytics.averageScorePercent}%
            </p>
          </div>

          <div className="p-4 bg-stone-950 border border-stone-800 rounded-lg min-w-[200px] text-center space-y-1">
            <div className="text-[11px] font-mono text-stone-400 uppercase">Hiring Bar Readiness</div>
            <div className="text-2xl font-display font-bold text-amber-400 tabular-nums">
              {Math.round((completedLevels.length / levels.length) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 1. Skills & Topics Mastered vs Capstone Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills & Topics Mastered */}
        <div className="border border-stone-850 bg-stone-900/40 p-6 rounded-lg space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Mastered Technical Competencies</span>
          </div>

          <div>
            <div className="text-xs text-stone-500 font-mono mb-2">Completed Levels:</div>
            {completedLevels.length === 0 ? (
              <p className="text-xs text-stone-500 italic">No levels completed yet. Complete level tests to verify skills.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {completedLevels.map((lvl) => (
                  <span
                    key={lvl.levelNumber}
                    className="px-2.5 py-1 bg-stone-950 border border-stone-800 rounded text-xs font-mono text-stone-300"
                  >
                    {lvl.title.split('–')[1] || lvl.title}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-stone-800/80">
            <div className="text-xs text-stone-500 font-mono mb-2">Completed Daily Classes:</div>
            <div className="text-xs text-stone-300">
              <strong>{analytics.completedLessonsCount}</strong> classes completed with verified practice solutions.
            </div>
          </div>
        </div>

        {/* Capstone Projects */}
        <div className="border border-stone-850 bg-stone-900/40 p-6 rounded-lg space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-amber-400" />
            <span>Portfolio Capstone Milestones</span>
          </div>

          <div className="space-y-3">
            {jobReadiness.projects.map((proj, i) => (
              <div key={i} className="p-3.5 bg-stone-950 border border-stone-850 rounded space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-200">{proj.title}</span>
                  <span className="text-[11px] font-mono text-stone-500 uppercase">{proj.status}</span>
                </div>
                <p className="text-xs text-stone-400">{proj.description}</p>
                <div className="text-[11px] font-mono text-amber-500/90 pt-1">
                  Stack: {proj.tech}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: 2. Resume Preparation & Interview Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Resume Preparation */}
        <div className="border border-stone-850 bg-stone-900/40 p-6 rounded-lg space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-stone-400" />
            <span>Resume Formulation</span>
          </div>
          <p className="text-xs text-stone-300">
            Tailored specifically for <strong>{goal.targetJob}</strong> roles.
          </p>
          <div className="space-y-2 pt-2 border-t border-stone-800/80 text-xs">
            <div className="text-stone-500 font-mono text-[11px] uppercase">Bullet Highlights</div>
            <ul className="space-y-1 text-stone-400">
              {jobReadiness.resumePreparation.bulletHighlights.map((b, i) => (
                <li key={i}>· {b}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Technical Interview Preparation */}
        <div className="border border-stone-850 bg-stone-900/40 p-6 rounded-lg space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-stone-400" />
            <span>Technical Screening</span>
          </div>
          <p className="text-xs text-stone-300">
            Readiness score: <strong className="font-mono text-amber-400">{jobReadiness.technicalInterviewPreparation.readinessScore}%</strong>
          </p>
          <div className="space-y-2 pt-2 border-t border-stone-800/80 text-xs">
            <div className="text-stone-500 font-mono text-[11px] uppercase">Critical Checkpoints</div>
            <ul className="space-y-1 text-stone-400">
              {jobReadiness.technicalInterviewPreparation.criticalCheckpoints.map((c, i) => (
                <li key={i}>· {c}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* HR & Behavioral Interview Practice */}
        <div className="border border-stone-850 bg-stone-900/40 p-6 rounded-lg space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-stone-400" />
            <span>Behavioral & HR Prep</span>
          </div>
          <p className="text-xs text-stone-300">
            Status: <span className="font-mono text-stone-400 capitalize">{jobReadiness.hrBehavioralPreparation.status}</span>
          </p>
          <div className="space-y-2 pt-2 border-t border-stone-800/80 text-xs">
            <div className="text-stone-500 font-mono text-[11px] uppercase">STAR Scenarios</div>
            <ul className="space-y-1 text-stone-400">
              {jobReadiness.hrBehavioralPreparation.suggestedScenarios.map((s, i) => (
                <li key={i} className="leading-snug">· {s}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
