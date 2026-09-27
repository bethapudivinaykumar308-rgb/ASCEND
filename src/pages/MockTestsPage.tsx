import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  RotateCcw,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

interface MockTestsPageProps {
  onNavigate: (route: string) => void;
}

export const MockTestsPage: React.FC<MockTestsPageProps> = ({ onNavigate }) => {
  const { careerPlan, activeLevelNumber, selectLevel, submitAssessment, toggleTrainer, showToast } = useApp();

  const [selectedLevelNum, setSelectedLevelNum] = useState<number>(activeLevelNumber);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [resultState, setResultState] = useState<{
    submitted: boolean;
    passed: boolean;
    scorePercent: number;
    weakTopics: string[];
  } | null>(null);

  // Sync selectedLevelNum when activeLevelNumber changes
  React.useEffect(() => {
    setSelectedLevelNum(activeLevelNumber);
    setSelectedAnswers({});
    setResultState(null);
  }, [activeLevelNumber]);

  if (!careerPlan) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center space-y-4">
        <h2 className="text-2xl font-display font-bold text-stone-100">No Assessment Active</h2>
        <p className="text-sm text-stone-400">
          Create a career goal roadmap to access stage-gated mock tests.
        </p>
        <button
          onClick={() => onNavigate('new-plan')}
          className="px-5 py-2.5 bg-stone-100 text-stone-950 text-xs font-semibold rounded"
        >
          Create Roadmap
        </button>
      </div>
    );
  }

  const { levels } = careerPlan;
  const currentLvl = levels.find((l) => l.levelNumber === selectedLevelNum) || levels[0];
  const assessment = currentLvl.assessment;
  const isLocked = currentLvl.status === 'locked';

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (resultState?.submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitTest = async () => {
    // Verify all questions answered
    const unanswered = assessment.questions.some((q) => selectedAnswers[q.id] === undefined);
    if (unanswered) {
      showToast('Please answer all questions before submitting your assessment.', 'warning');
      return;
    }

    const res = await submitAssessment(currentLvl.levelNumber, selectedAnswers);
    setResultState({
      submitted: true,
      passed: res.passed,
      scorePercent: res.scorePercent,
      weakTopics: res.weakTopics,
    });
  };

  const handleResetTest = () => {
    setSelectedAnswers({});
    setResultState(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="border-b border-stone-850 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-stone-500 uppercase tracking-wider mb-1">
            Stage-Gated Technical Assessment
          </div>
          <h1 className="text-3xl font-display font-bold text-stone-100">
            {assessment.title}
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Passing threshold: <span className="text-amber-400 font-semibold font-mono">75%</span>. {currentLvl.levelNumber < levels.length ? `Passing unlocks Level 0${currentLvl.levelNumber + 1}.` : 'Passing completes your stage-gated roadmap and unlocks Job Readiness verification!'}
          </p>
        </div>

        {/* Level Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
          {levels.map((lvl) => {
            const isLvlLocked = lvl.status === 'locked';
            const isPassed = lvl.status === 'completed';
            const isSelected = lvl.levelNumber === currentLvl.levelNumber;

            return (
              <button
                key={lvl.levelNumber}
                onClick={() => {
                  if (!isLvlLocked) {
                    setSelectedLevelNum(lvl.levelNumber);
                    selectLevel(lvl.levelNumber);
                    handleResetTest();
                  }
                }}
                disabled={isLvlLocked}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-colors whitespace-nowrap flex items-center gap-1 ${
                  isSelected
                    ? 'bg-stone-100 text-stone-950 font-semibold'
                    : isPassed
                    ? 'bg-stone-900 border border-stone-800 text-emerald-400 hover:text-emerald-300'
                    : isLvlLocked
                    ? 'opacity-40 cursor-not-allowed text-stone-600'
                    : 'bg-stone-900 border border-stone-800 text-stone-300 hover:text-white'
                }`}
              >
                <span>L0{lvl.levelNumber}</span>
                {isPassed && <Check className="w-3 h-3 text-emerald-400" />}
                {isLvlLocked && <Lock className="w-2.5 h-2.5 text-stone-600" />}
              </button>
            );
          })}
        </div>
      </div>

      {isLocked ? (
        <div className="border border-stone-850 bg-stone-900/30 p-12 text-center rounded-xl space-y-4">
          <Lock className="w-8 h-8 text-stone-500 mx-auto" />
          <h3 className="text-lg font-display font-bold text-stone-200">
            Level {currentLvl.levelNumber} Assessment is Locked
          </h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            You must successfully pass the Level {currentLvl.levelNumber - 1} assessment with &ge; 75% score before taking this test.
          </p>
          <button
            onClick={() => {
              setSelectedLevelNum(currentLvl.levelNumber - 1);
              selectLevel(currentLvl.levelNumber - 1);
            }}
            className="px-4 py-2 bg-stone-850 border border-stone-700 text-stone-200 text-xs rounded hover:bg-stone-800 transition-colors"
          >
            Go to Level {currentLvl.levelNumber - 1} Assessment
          </button>
        </div>
      ) : (
        <>
          {/* Result Banner after submission */}
          {resultState && (
            <div
              className={`p-6 border rounded-xl space-y-4 animate-in fade-in duration-200 ${
                resultState.passed
                  ? 'border-emerald-800/80 bg-emerald-950/20'
                  : 'border-rose-900/80 bg-rose-950/20'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {resultState.passed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-rose-400" />
                  )}
                  <div>
                    <h3 className="text-lg font-display font-bold text-stone-100">
                      {resultState.passed ? 'Level Complete · Assessment Passed' : 'Review Required · Assessment Failed'}
                    </h3>
                    <p className="text-xs text-stone-400">
                      Score: <strong className="font-mono text-stone-200 text-sm">{resultState.scorePercent}%</strong> (Threshold: 75%)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetTest}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 border border-stone-800 text-stone-300 text-xs rounded hover:bg-stone-800 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Retake Test</span>
                  </button>

                  {resultState.passed && currentLvl.levelNumber < levels.length && (
                    <button
                      onClick={() => {
                        setSelectedLevelNum(currentLvl.levelNumber + 1);
                        selectLevel(currentLvl.levelNumber + 1);
                        handleResetTest();
                        onNavigate('roadmap');
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-stone-100 text-stone-950 font-semibold text-xs rounded hover:bg-white transition-colors"
                    >
                      <span>Advance to Level {currentLvl.levelNumber + 1}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {!resultState.passed && resultState.weakTopics.length > 0 && (
                <div className="pt-3 border-t border-rose-900/40 text-xs space-y-1">
                  <span className="text-rose-300 font-semibold font-mono uppercase block">
                    Diagnostic Weak Areas Identified:
                  </span>
                  <p className="text-stone-300">
                    {resultState.weakTopics.join(', ')}. Review the related daily classes and practice code before attempting your retake.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Questions List */}
          <div className="space-y-6">
            {assessment.questions.map((q, idx) => {
              const selectedIdx = selectedAnswers[q.id];
              const isSubmitted = resultState?.submitted;
              const isCorrect = selectedIdx === q.correctOptionIndex;

              return (
                <div
                  key={q.id}
                  className={`border rounded-lg p-6 space-y-4 transition-all ${
                    isSubmitted
                      ? isCorrect
                        ? 'border-emerald-900/60 bg-emerald-950/10'
                        : 'border-rose-900/60 bg-rose-950/10'
                      : 'border-stone-850 bg-stone-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono text-stone-500">
                    <span>Question 0{idx + 1} of 0{assessment.questions.length}</span>
                    <span className="uppercase text-stone-400">Topic: {q.topic}</span>
                  </div>

                  <h3 className="text-sm font-semibold text-stone-100 leading-snug">
                    {q.question}
                  </h3>

                  <div className="space-y-2 pt-2">
                    {q.options.map((option, optIdx) => {
                      const isChosen = selectedIdx === optIdx;
                      const isOptionCorrect = optIdx === q.correctOptionIndex;

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          disabled={isSubmitted}
                          className={`w-full text-left p-3.5 rounded text-xs transition-colors flex items-start gap-3 border ${
                            isSubmitted
                              ? isOptionCorrect
                                ? 'border-emerald-700 bg-emerald-950/30 text-emerald-200 font-medium'
                                : isChosen
                                ? 'border-rose-700 bg-rose-950/30 text-rose-300 line-through'
                                : 'border-stone-850 bg-stone-950 text-stone-500'
                              : isChosen
                              ? 'border-amber-500 bg-amber-950/40 text-amber-200 font-semibold'
                              : 'border-stone-800 bg-stone-950 text-stone-300 hover:border-stone-700'
                          }`}
                        >
                          <span className="font-mono text-stone-500 shrink-0">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          <span className="leading-relaxed">{option}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation after submission */}
                  {isSubmitted && (
                    <div className="pt-3 border-t border-stone-800/80 text-xs text-stone-300 space-y-1">
                      <span className="font-mono text-[10px] uppercase text-stone-500 block">
                        Detailed Explanation:
                      </span>
                      <p className="leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Action Bar */}
          {!resultState?.submitted && (
            <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
              <span className="text-xs font-mono text-stone-500">
                {Object.keys(selectedAnswers).length} of {assessment.questions.length} answered
              </span>

              <button
                type="button"
                onClick={handleSubmitTest}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-stone-100 hover:bg-white text-stone-950 text-xs font-semibold rounded transition-colors"
              >
                <span>Submit Assessment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
