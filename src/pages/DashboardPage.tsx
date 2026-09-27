import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Target,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Lock,
  Clock,
  AlertTriangle,
  Award,
  Sparkles,
  BarChart2,
  Calendar,
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (route: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { careerPlan, activeLevel, activeLesson, selectLevel, selectDay, loadDemoPlan } = useApp();

  // If no roadmap exists yet, show clean empty state compliant with instruction #11
  if (!careerPlan) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 animate-in fade-in duration-150">
        <div className="border border-stone-850 bg-stone-900/40 p-12 text-center rounded-xl space-y-5">
          <div className="w-14 h-14 mx-auto rounded-full bg-stone-850 border border-stone-750 flex items-center justify-center text-amber-500">
            <Target className="w-7 h-7" />
          </div>

          <div className="text-xs font-mono uppercase tracking-widest text-amber-500">
            Stage 00 · Fresh Studio Slate
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-bold text-stone-100">
            No Roadmap Yet
          </h2>

          <p className="text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
            Tell us your goal and ASCEND will build your personalized, stage-gated learning path.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('new-plan')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-stone-100 hover:bg-white text-stone-950 text-xs font-semibold rounded transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 fill-stone-950" />
              <span>Set My Career Goal</span>
            </button>

            <button
              onClick={loadDemoPlan}
              className="px-5 py-3 bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-300 text-xs rounded transition-colors"
            >
              Load DEMO DATA (Python Developer)
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { goal, levels, currentLevelNumber, currentDayNumber, analytics, jobReadiness, isDemo } = careerPlan;

  const totalLessons = levels.reduce((acc, l) => acc + (l.topics?.length || l.lessons?.length || 0), 0);
  const completedLessons = levels.reduce(
    (acc, l) => acc + (l.topics || l.lessons || []).filter((les) => les.isCompleted).length,
    0
  );
  const percentComplete = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const currentLevelObj = levels.find((l) => l.levelNumber === currentLevelNumber) || levels[0];
  const currentLessonsList = currentLevelObj.topics || currentLevelObj.lessons || [];
  const pendingLessons = currentLessonsList.filter((l) => !l.isCompleted);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8 animate-in fade-in duration-150">
      {/* Demo vs Real AI Track Banner */}
      {isDemo ? (
        <div className="p-3 bg-amber-950/20 border border-amber-900/50 rounded flex items-center justify-between text-xs text-amber-300/90 font-mono">
          <span>DEMO DATA TRACK · Python Developer Roadmap</span>
          <button
            onClick={() => onNavigate('new-plan')}
            className="text-stone-300 hover:text-white underline"
          >
            Create Your Own Real Plan &rarr;
          </button>
        </div>
      ) : (
        <div className="p-3 bg-emerald-950/20 border border-emerald-900/50 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-300/90 font-mono">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI-GENERATED CURRICULUM · Powered by {careerPlan.aiModel || 'Gemini 3.8 Flash'}</span>
          </div>
          <span className="text-[11px] text-stone-400">Adaptive stage-gating active · Tailored for {goal.targetJob}</span>
        </div>
      )}

      {/* Top Banner: Target Job & Key Stats */}
      <div className="border border-stone-850 bg-stone-900/50 p-6 sm:p-8 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="text-xs font-mono text-stone-500 uppercase tracking-wider">
            Active Career Track · Level 0{currentLevelNumber} of 0{levels.length}
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-stone-100">
            {goal.targetJob}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400 font-mono">
            <span>Skill Level: <strong className="text-stone-200 capitalize">{goal.currentSkillLevel}</strong></span>
            <span>·</span>
            <span>Pace: <strong className="text-stone-200">{goal.studyTimePerDayHours}h / day</strong></span>
            {goal.targetCompany && (
              <>
                <span>·</span>
                <span>Target: <strong className="text-amber-400">{goal.targetCompany}</strong></span>
              </>
            )}
          </div>
        </div>

        {/* Overall Progress Stat Box */}
        <div className="p-5 bg-stone-950 border border-stone-850 rounded-lg min-w-[260px] space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-stone-400">Roadmap Progress</span>
            <span className="text-amber-400 font-semibold tabular-nums text-sm">{percentComplete}%</span>
          </div>

          <div className="w-full bg-stone-900 h-2 rounded-full overflow-hidden border border-stone-800">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${percentComplete}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-stone-500">
            <span>{completedLessons} / {totalLessons} Lessons Done</span>
            <span>Day {currentDayNumber}</span>
          </div>
        </div>
      </div>

      {/* Recommended Next Action Banner */}
      <div className="p-5 border border-stone-800 bg-stone-900/30 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-amber-950/40 border border-amber-800/80 text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-amber-500 uppercase">Next Recommended Action</div>
            <div className="text-sm font-semibold text-stone-200">
              {analytics.nextRecommendedAction}
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('todays-class')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-white text-stone-950 text-xs font-semibold rounded transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <span>Open Today&apos;s Class</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Metrics & Diagnostics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 border border-stone-850 bg-stone-900/30 rounded-lg space-y-1">
          <div className="text-xs font-mono text-stone-500 uppercase">Current Level</div>
          <div className="text-xl font-display font-bold text-stone-100">
            Level {currentLevelNumber}
          </div>
          <p className="text-xs text-stone-400 truncate">
            {currentLevelObj.title.split('–')[1] || currentLevelObj.title}
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-5 border border-stone-850 bg-stone-900/30 rounded-lg space-y-1">
          <div className="text-xs font-mono text-stone-500 uppercase">Assessment Score Avg</div>
          <div className="text-xl font-display font-bold text-emerald-400 tabular-nums">
            {analytics.averageScorePercent > 0 ? `${analytics.averageScorePercent}%` : 'Pending'}
          </div>
          <p className="text-xs text-stone-400">
            {analytics.passedAssessmentsCount} of {levels.length} Mock Tests Passed
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-5 border border-stone-850 bg-stone-900/30 rounded-lg space-y-1">
          <div className="text-xs font-mono text-stone-500 uppercase">Pending Level Tasks</div>
          <div className="text-xl font-display font-bold text-stone-100 tabular-nums">
            {pendingLessons.length} Classes
          </div>
          <p className="text-xs text-stone-400">
            Before Level {currentLevelNumber} Assessment Unlock
          </p>
        </div>

        {/* Metric 4 */}
        <div className="p-5 border border-stone-850 bg-stone-900/30 rounded-lg space-y-1">
          <div className="text-xs font-mono text-stone-500 uppercase">Estimated Runway</div>
          <div className="text-xl font-display font-bold text-stone-100 tabular-nums">
            ~{analytics.estimatedDaysRemaining ?? analytics.estimatedRoadmapCompletionDays} Days
          </div>
          <p className="text-xs text-stone-400">
            Based on {goal.studyTimePerDayHours}h daily pace
          </p>
        </div>
      </div>

      {/* Weak & Strong Areas Diagnostic */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strong Areas */}
        <div className="border border-stone-850 bg-stone-900/40 p-6 rounded-lg space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Mastered Concepts & Strong Areas</span>
          </div>
          {analytics.strongAreas.length === 0 ? (
            <p className="text-xs text-stone-500 italic">
              Pass your first level assessment to record verified strong areas.
            </p>
          ) : (
            <ul className="space-y-2 text-xs text-stone-300">
              {analytics.strongAreas.map((area, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-emerald-500 font-mono">✓</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Weak Areas */}
        <div className="border border-stone-850 bg-stone-900/40 p-6 rounded-lg space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>Identified Weak Topics (Requires Revision)</span>
          </div>
          {analytics.weakAreas.length === 0 ? (
            <p className="text-xs text-stone-500 italic">
              No weak areas recorded. Maintain high discipline in daily practice tasks.
            </p>
          ) : (
            <ul className="space-y-2 text-xs text-stone-300">
              {analytics.weakAreas.map((topic, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-amber-400 font-mono">!</span>
                  <span className="text-stone-200">{topic}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Level by Level Runway Overview */}
      <div className="border border-stone-850 bg-stone-900/30 p-6 rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono uppercase tracking-wider text-stone-400">
            Roadmap Levels & Stage-Gating
          </div>
          <button
            onClick={() => onNavigate('roadmap')}
            className="text-xs font-mono text-stone-400 hover:text-stone-200 flex items-center gap-1"
          >
            <span>View Full Roadmap</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {levels.map((lvl) => {
            const isCompleted = lvl.status === 'completed';
            const isUnlocked = lvl.status === 'unlocked' || lvl.status === 'in_progress';
            const isLocked = lvl.status === 'locked';
            const isReview = lvl.status === 'review_required';

            return (
              <div
                key={lvl.levelNumber}
                onClick={() => {
                  if (!isLocked) {
                    selectLevel(lvl.levelNumber);
                    onNavigate('roadmap');
                  }
                }}
                className={`p-4 border rounded transition-all ${
                  isCompleted
                    ? 'border-stone-800 bg-stone-950/60 cursor-pointer hover:border-stone-700'
                    : isUnlocked
                    ? 'border-amber-500/80 bg-stone-900/90 cursor-pointer ring-1 ring-amber-500/20'
                    : isReview
                    ? 'border-rose-900/80 bg-rose-950/20 cursor-pointer'
                    : 'border-stone-850 bg-stone-950/30 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-stone-500">L0{lvl.levelNumber}</span>
                  {isCompleted && <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Passed</span>}
                  {isUnlocked && <span className="text-amber-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Active</span>}
                  {isReview && <span className="text-rose-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Review</span>}
                  {isLocked && <span className="text-stone-600 flex items-center gap-1"><Lock className="w-3 h-3" /> Locked</span>}
                </div>

                <div className="text-xs font-semibold text-stone-200 line-clamp-1">
                  {lvl.title}
                </div>
                <div className="text-[11px] text-stone-400 mt-1 line-clamp-2">
                  {lvl.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
