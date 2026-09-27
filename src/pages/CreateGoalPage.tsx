import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserGoal, SkillLevel } from '../types';
import { Sparkles, ArrowRight, BookOpen, Clock, Target, RotateCcw } from 'lucide-react';

interface CreateGoalPageProps {
  onNavigate: (route: string) => void;
}

export const CreateGoalPage: React.FC<CreateGoalPageProps> = ({ onNavigate }) => {
  const { createPlan, isGeneratingPlan, agentStep } = useApp();

  const [targetJob, setTargetJob] = useState('');
  const [education, setEducation] = useState('B.Tech Computer Science');
  const [currentSkillLevel, setCurrentSkillLevel] = useState<SkillLevel>('beginner');
  const [skillsInput, setSkillsInput] = useState('Basic Programming, Logic');
  const [techInput, setTechInput] = useState('Python, SQL');
  const [studyHours, setStudyHours] = useState<number>(2);
  const [targetCompany, setTargetCompany] = useState('');
  const [targetExam, setTargetExam] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const quickRoles = [
    'Python Developer',
    'Frontend React Developer',
    'Full Stack Engineer',
    'Data Scientist',
    'DevOps / Cloud Engineer',
  ];

  const handleSelectQuickRole = (role: string) => {
    setTargetJob(role);
    if (role === 'Python Developer') {
      setTechInput('Python, FastAPI, PostgreSQL, Docker');
      setSkillsInput('Basic Python, Data Structures');
    } else if (role.includes('Frontend')) {
      setTechInput('JavaScript, TypeScript, React, Tailwind CSS');
      setSkillsInput('HTML, CSS, Basic JS');
    } else if (role.includes('Data')) {
      setTechInput('Python, NumPy, Pandas, Scikit-Learn, SQL');
      setSkillsInput('Math, Statistics, Python');
    } else if (role.includes('DevOps')) {
      setTechInput('Linux, Docker, Kubernetes, AWS, CI/CD');
      setSkillsInput('Basic Bash, Networking');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetJob.trim()) {
      setErrorMessage('Please specify your target job or role.');
      return;
    }

    const goal: UserGoal = {
      targetJob: targetJob.trim(),
      education: education.trim(),
      currentSkillLevel,
      existingSkills: skillsInput.split(',').map((s) => s.trim()).filter(Boolean),
      preferredTechnologies: techInput.split(',').map((s) => s.trim()).filter(Boolean),
      studyTimePerDayHours: Number(studyHours) || 2,
      targetCompany: targetCompany.trim() || undefined,
      targetExamOrInterview: targetExam.trim() || undefined,
      targetCompletionDate: targetDate || undefined,
    };

    try {
      await createPlan(goal);
      onNavigate('dashboard');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to synthesize roadmap. Please retry.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8 animate-in fade-in duration-150">
      {/* Page Title */}
      <div className="border-b border-stone-800 pb-5">
        <div className="text-xs font-mono text-amber-500 uppercase tracking-wider mb-1">
          Career Goal Specification
        </div>
        <h1 className="text-3xl font-display font-bold text-stone-100">
          Set Your Target Job Goal
        </h1>
        <p className="text-sm text-stone-400 mt-1">
          ASCEND builds a personalized, stage-gated learning path specifically for the technical hiring bar of your target role.
        </p>
      </div>

      {/* Live AI Agent Progress Stepper */}
      {isGeneratingPlan && (
        <div className="p-5 bg-stone-900/90 border border-amber-500/60 rounded-xl space-y-3.5 shadow-2xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-amber-400 font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
              <span>Gemini AI Curriculum Agent · Step 0{agentStep?.step || 1} of 06</span>
            </span>
            <span className="text-stone-400 tabular-nums">
              {Math.min(100, Math.round(((agentStep?.step || 1) / 6) * 100))}%
            </span>
          </div>

          <div className="w-full bg-stone-950 h-2 rounded-full overflow-hidden border border-stone-800">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.round(((agentStep?.step || 1) / 6) * 100))}%` }}
            />
          </div>

          <div className="space-y-1">
            <div className="text-sm font-semibold text-stone-100">
              {agentStep?.label || 'Synthesizing adaptive stage-gated curriculum...'}
            </div>
            {agentStep?.details && (
              <div className="text-xs text-stone-400 font-mono">
                {agentStep.details}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Role Suggestions */}
      <div className="space-y-2">
        <div className="text-xs font-mono text-stone-400 uppercase">
          Popular Target Roles:
        </div>
        <div className="flex flex-wrap gap-2">
          {quickRoles.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => handleSelectQuickRole(role)}
              className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                targetJob === role
                  ? 'border-amber-500/80 bg-amber-950/30 text-amber-300 font-semibold'
                  : 'border-stone-800 bg-stone-900/60 text-stone-300 hover:border-stone-700'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded text-xs text-rose-300">
          {errorMessage}
        </div>
      )}

      {/* Main Intake Form */}
      <form onSubmit={handleSubmit} className="border border-stone-850 bg-stone-900/40 rounded-lg p-6 space-y-6">
        {/* Target Role */}
        <div className="space-y-1.5">
          <label className="block text-xs font-mono uppercase text-stone-300">
            Target Job / Role <span className="text-amber-500">*</span>
          </label>
          <input
            type="text"
            value={targetJob}
            onChange={(e) => {
              setTargetJob(e.target.value);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder="e.g. Python Developer, Frontend React Engineer, Data Scientist"
            className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-stone-500 font-sans"
            required
          />
        </div>

        {/* Education & Current Skill Level Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-stone-300">
              Current Education / Qualification
            </label>
            <input
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="e.g. B.Tech Computer Science, Self-taught, MCA"
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-stone-500 font-sans"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-stone-300">
              Current Skill Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['beginner', 'intermediate', 'advanced'] as SkillLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setCurrentSkillLevel(lvl)}
                  className={`py-2 text-xs font-mono capitalize rounded border transition-colors ${
                    currentSkillLevel === lvl
                      ? 'border-amber-500 bg-amber-950/40 text-amber-300 font-semibold'
                      : 'border-stone-800 bg-stone-950 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Skills & Technologies */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-stone-300">
              Existing Technical Skills
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="Comma separated: Basic C++, Logic, Loops"
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-stone-500 font-sans"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-stone-300">
              Preferred Technologies / Frameworks
            </label>
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              placeholder="e.g. Python, FastAPI, Docker, PostgreSQL"
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-stone-500 font-sans"
            />
          </div>
        </div>

        {/* Daily Study Time & Optional Targets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-stone-300">
              Study Time / Day
            </label>
            <select
              value={studyHours}
              onChange={(e) => setStudyHours(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded text-xs text-stone-100 focus:outline-none focus:border-stone-500 font-sans"
            >
              <option value={1}>1 hour / day (Gradual)</option>
              <option value={2}>2 hours / day (Recommended)</option>
              <option value={3}>3 hours / day (Accelerated)</option>
              <option value={4}>4+ hours / day (Full-time Bootcamp)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-stone-300">
              Target Company (Optional)
            </label>
            <input
              type="text"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              placeholder="e.g. Google, Amazon, Stripe, Startup"
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-stone-500 font-sans"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-stone-300">
              Target Exam / Interview (Optional)
            </label>
            <input
              type="text"
              value={targetExam}
              onChange={(e) => setTargetExam(e.target.value)}
              placeholder="e.g. FAANG Technical, System Design, GATE"
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-stone-500 font-sans"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase text-stone-300">
              Target Completion Date (Optional)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-950 border border-stone-800 rounded text-xs text-stone-100 focus:outline-none focus:border-stone-500 font-sans"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
          <span className="text-xs text-stone-500 font-mono">
            ASCEND will generate your 8-level adaptive curriculum
          </span>

          <button
            type="submit"
            disabled={isGeneratingPlan}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-stone-100 hover:bg-white text-stone-950 text-xs font-semibold rounded transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 fill-stone-950" />
            <span>{isGeneratingPlan ? 'Synthesizing Roadmap...' : 'Generate My Roadmap'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
