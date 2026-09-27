import React from 'react';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  Lock,
  Clock,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Code,
  FileCheck2,
  Sparkles,
} from 'lucide-react';

interface RoadmapPageProps {
  onNavigate: (route: string) => void;
}

export const RoadmapPage: React.FC<RoadmapPageProps> = ({ onNavigate }) => {
  const {
    careerPlan,
    activeLevelNumber,
    selectLevel,
    selectDay,
    toggleLessonCompletion,
    unlockLevel,
  } = useApp();

  if (!careerPlan) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center space-y-4">
        <h2 className="text-2xl font-display font-bold text-stone-100">No Roadmap Generated</h2>
        <p className="text-sm text-stone-400">
          Enter your career target to generate your structured learning roadmap.
        </p>
        <button
          onClick={() => onNavigate('new-plan')}
          className="px-5 py-2.5 bg-stone-100 text-stone-950 text-xs font-semibold rounded"
        >
          Create Career Roadmap
        </button>
      </div>
    );
  }

  const { levels, goal } = careerPlan;

  const handleOpenDayLesson = (levelNumber: number, dayNumber: number) => {
    selectLevel(levelNumber);
    selectDay(dayNumber);
    onNavigate('todays-class');
  };

  const handleOpenAssessment = (levelNumber: number) => {
    selectLevel(levelNumber);
    onNavigate('mock-tests');
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10 animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="border-b border-stone-850 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-stone-500 uppercase tracking-wider mb-1">
            Stage-Gated Curriculum · {goal.targetJob}
          </div>
          <h1 className="text-3xl font-display font-bold text-stone-100">
            My Learning Roadmap
          </h1>
          <p className="text-sm text-stone-400 mt-1 max-w-2xl">
            Sequential progression engineered to qualify you for technical hiring expectations. Each level requires passing the assessment to unlock subsequent topics.
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-1.5 text-xs font-mono">
          <div className="text-stone-400">
            Status: <span className="text-amber-400 font-semibold">Stage-Gating Active</span>
          </div>
          {careerPlan.isDemo ? (
            <span className="text-[11px] text-amber-500/90 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-900/50">
              DEMO DATA TRACK
            </span>
          ) : (
            <span className="text-[11px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/60 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>AI-GENERATED ({careerPlan.aiModel || 'Gemini 3.8 Flash'})</span>
            </span>
          )}
        </div>
      </div>

      {/* Levels Timeline */}
      <div className="space-y-6">
        {levels.map((lvl) => {
          const isCompleted = lvl.status === 'completed';
          const isUnlocked = lvl.status === 'unlocked' || lvl.status === 'in_progress';
          const isLocked = lvl.status === 'locked';
          const isReview = lvl.status === 'review_required';
          const isCurrentActive = activeLevelNumber === lvl.levelNumber;
          const lessonsList = (lvl.topics && lvl.topics.length > 0) ? lvl.topics : (lvl.lessons || []);

          const completedLessonsCount = lessonsList.filter((l) => l.isCompleted).length;
          const allLessonsCompleted = completedLessonsCount === lessonsList.length;

          return (
            <div
              key={lvl.levelNumber}
              className={`border rounded-xl p-6 transition-all space-y-5 ${
                isCompleted
                  ? 'border-stone-850 bg-stone-900/30'
                  : isReview
                  ? 'border-rose-900/70 bg-rose-950/20 ring-1 ring-rose-900/40'
                  : isUnlocked
                  ? 'border-stone-700 bg-stone-900/60 shadow-lg'
                  : 'border-stone-850/60 bg-stone-950/40 opacity-60'
              }`}
            >
              {/* Level Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-800/80 pb-4 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
                    <span className="uppercase">Level 0{lvl.levelNumber}</span>
                    <span>·</span>
                    <span className="text-stone-400">{lessonsList.length} Daily Classes</span>
                  </div>
                  <h3 className="text-xl font-display font-bold text-stone-100">
                    {lvl.title}
                  </h3>
                  <p className="text-xs text-stone-400 max-w-2xl leading-relaxed">
                    {lvl.description}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/40 border border-emerald-800/80 text-emerald-400 rounded text-xs font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Level Passed ({lvl.assessment.latestScorePercent}%)</span>
                    </span>
                  )}
                  {isUnlocked && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950/40 border border-amber-800/80 text-amber-300 rounded text-xs font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Active Level</span>
                    </span>
                  )}
                  {isReview && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-950/40 border border-rose-800/80 text-rose-300 rounded text-xs font-mono">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Review Required ({lvl.assessment.latestScorePercent}%)</span>
                    </span>
                  )}
                  {isLocked && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-900 border border-stone-800 text-stone-500 rounded text-xs font-mono">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Locked (Pass Level {lvl.levelNumber - 1})</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Review Notification Box if failed */}
              {isReview && lvl.assessment.weakTopics && lvl.assessment.weakTopics.length > 0 && (
                <div className="p-4 bg-rose-950/30 border border-rose-900/60 rounded text-xs space-y-2">
                  <div className="text-rose-300 font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Assessment did not pass the 75% threshold.</span>
                  </div>
                  <p className="text-stone-300">
                    Identified weak topics: <span className="font-mono text-rose-200">{lvl.assessment.weakTopics.join(', ')}</span>.
                    Review the daily lessons below, re-solve the practice code, and retake the mock test.
                  </p>
                </div>
              )}

              {/* Lessons Subgrid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="uppercase tracking-wider text-stone-400">
                    Daily Classes ({completedLessonsCount}/{lessonsList.length} Completed)
                  </span>
                  <span className="text-stone-500">
                    {lessonsList.length > 0 ? Math.round((completedLessonsCount / lessonsList.length) * 100) : 0}%
                  </span>
                </div>

                {/* Level Progress Bar */}
                <div className="w-full bg-stone-950 h-1.5 rounded-full overflow-hidden border border-stone-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isCompleted
                        ? 'bg-emerald-500'
                        : isReview
                        ? 'bg-rose-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${lessonsList.length > 0 ? (completedLessonsCount / lessonsList.length) * 100 : 0}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {lessonsList.map((lesson) => {
                    const isLessonDone = lesson.isCompleted;

                    return (
                      <div
                        key={lesson.id}
                        className={`p-3.5 border rounded flex items-start justify-between gap-3 transition-colors ${
                          isLessonDone
                            ? 'border-emerald-900/50 bg-emerald-950/10'
                            : isLocked
                            ? 'border-stone-850 bg-stone-950/30 opacity-60'
                            : 'border-stone-800 bg-stone-900/40 hover:border-stone-700'
                        }`}
                      >
                        <div
                          className={`space-y-1 flex-1 ${!isLocked ? 'cursor-pointer' : ''}`}
                          onClick={() => {
                            if (!isLocked) {
                              handleOpenDayLesson(lvl.levelNumber, lesson.dayNumber);
                            }
                          }}
                        >
                          <div className="flex items-center gap-2 text-[11px] font-mono text-stone-500">
                            <span>Day {lesson.dayNumber.toString().padStart(2, '0')}</span>
                            <span>·</span>
                            <span className="text-stone-400">{lesson.resources.length} Verified Resources</span>
                            {isLessonDone && (
                              <span className="text-emerald-400 font-mono text-[10px] ml-auto">Done</span>
                            )}
                          </div>

                          <h4 className={`text-xs font-semibold ${isLessonDone ? 'text-stone-300' : 'text-stone-100'}`}>
                            {lesson.topic}
                          </h4>

                          <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                            {lesson.shortExplanation}
                          </p>
                        </div>

                        {!isLocked && (
                          <div className="flex items-center gap-1 shrink-0 pt-0.5">
                            {/* Toggle Completion Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLessonCompletion(lvl.levelNumber, lesson.id);
                              }}
                              className={`p-1.5 rounded border transition-colors ${
                                isLessonDone
                                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400 hover:bg-emerald-900/50'
                                  : 'bg-stone-950 border-stone-800 text-stone-500 hover:border-stone-600 hover:text-stone-300'
                              }`}
                              title={isLessonDone ? 'Mark as incomplete' : 'Mark as completed'}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Open Class Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenDayLesson(lvl.levelNumber, lesson.dayNumber)}
                              className="p-1.5 rounded text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
                              title="Open Today's Class"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Level Assessment Footer Action */}
              <div className="pt-3 border-t border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs font-mono text-stone-400 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-amber-500" />
                  <span>{lvl.assessment.title}</span>
                  <span>·</span>
                  <span className="text-stone-500">{lvl.assessment.questions.length} Questions (Passing: 75%)</span>
                </div>

                {!isLocked && (
                  <button
                    onClick={() => handleOpenAssessment(lvl.levelNumber)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-white text-stone-950 text-xs font-semibold rounded transition-colors whitespace-nowrap self-start sm:self-auto"
                  >
                    <span>{isCompleted ? 'Retake Mock Test' : isReview ? 'Retake Assessment' : 'Take Mock Test'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
