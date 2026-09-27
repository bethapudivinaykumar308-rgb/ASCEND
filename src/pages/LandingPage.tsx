import React from 'react';
import { ArrowRight, CheckCircle2, Lock, Sparkles, BookOpen, Target, Award, Code, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { loadDemoPlan } = useApp();

  const handleStartDemo = () => {
    loadDemoPlan();
    onNavigate('dashboard');
  };

  const steps = [
    {
      num: '01',
      title: 'Tell ASCEND Your Goal',
      description: 'Specify your target role, existing skill level, preferred technology stack, and daily available study time.',
      icon: <Target className="w-4 h-4 text-stone-300" />,
    },
    {
      num: '02',
      title: 'Get Your Personalized Roadmap',
      description: 'Receive a stage-gated, level-by-level curriculum engineered specifically to qualify you for technical hiring bars.',
      icon: <Sparkles className="w-4 h-4 text-stone-300" />,
    },
    {
      num: '03',
      title: 'Learn Every Day',
      description: 'Follow focused daily classes with exact explanations, verified documentation, and laser-targeted learning resources.',
      icon: <BookOpen className="w-4 h-4 text-stone-300" />,
    },
    {
      num: '04',
      title: 'Practice & Take Mock Tests',
      description: 'Solve real practice tasks and take rigorous level assessments to measure genuine topic comprehension.',
      icon: <Code className="w-4 h-4 text-stone-300" />,
    },
    {
      num: '05',
      title: 'Unlock the Next Level',
      description: 'Strict stage-gating: score 75%+ to unlock subsequent levels, or receive instant diagnostic review on weak topics.',
      icon: <Lock className="w-4 h-4 text-stone-300" />,
    },
    {
      num: '06',
      title: 'Become Job Ready',
      description: 'Complete capstone projects, polish your resume with verified skills, and simulate technical & behavioral mock interviews.',
      icon: <Award className="w-4 h-4 text-stone-300" />,
    },
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-stone-800">
      {/* 1. Hero Section */}
      <section className="relative pt-24 pb-20 px-6 border-b border-stone-850">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-stone-400 tracking-wider uppercase mb-2">
            <span>Free AI-Powered Career Training</span>
            <span>·</span>
            <span>Stage-Gated Mastery</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-bold tracking-tight text-stone-100 text-balance leading-[1.08]">
            Turn Your Career Goal Into a Clear Path to Job Readiness.
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-stone-400 max-w-2xl mx-auto font-sans leading-relaxed text-balance">
            ASCEND creates a personalized learning roadmap, gives you the right classes and resources for each day, tests your knowledge, and unlocks the next level as you progress.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('new-plan')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-stone-100 hover:bg-white text-stone-950 text-sm font-semibold rounded transition-colors"
            >
              <span>Create My Roadmap</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleStartDemo}
              className="w-full sm:w-auto px-6 py-3.5 bg-stone-900 hover:bg-stone-850 text-stone-300 text-sm font-medium rounded border border-stone-800 transition-colors"
            >
              Explore Demo Track (Python Developer)
            </button>
          </div>

          <div className="pt-2 text-xs text-stone-500 font-mono">
            Train for the role you want · Your goal · Your roadmap · Your next level
          </div>
        </div>

        {/* Hero Visual Asset */}
        <div className="max-w-5xl mx-auto mt-14 rounded-lg overflow-hidden border border-stone-800 shadow-2xl relative bg-stone-950">
          <img
            src="/src/assets/images/brand_workspace_hero_1790486534052.jpg"
            alt="ASCEND Career Training Study Workspace"
            referrerPolicy="no-referrer"
            className="w-full h-72 sm:h-96 object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent pointer-events-none" />
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-stone-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Personalized Stage-Gated Curriculum Engine</span>
            </div>
            <span className="text-stone-400">Zero Superficial Fluff · Verifiable Assessments</span>
          </div>
        </div>
      </section>

      {/* 2. Structured Process Steps (01 to 06) */}
      <section className="py-24 px-6 border-b border-stone-850 max-w-7xl mx-auto">
        <div className="max-w-3xl mb-14">
          <div className="text-xs font-mono text-amber-500 uppercase tracking-wider mb-2">
            The ASCEND Methodology
          </div>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-stone-100">
            Structured Progression, Not Infinite Random Tutorials.
          </h2>
          <p className="text-sm text-stone-400 mt-2 leading-relaxed">
            Most learners get stuck in tutorial hell because traditional platforms lack rigorous stage-gating. ASCEND tests your actual retention before unlocking the next level.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="p-6 border border-stone-850 bg-stone-900/40 rounded-lg hover:border-stone-750 transition-colors flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-stone-500 mb-4">
                  <span className="text-amber-500 font-semibold">{step.num}</span>
                  <div className="p-1 rounded bg-stone-800/80 border border-stone-700/60">
                    {step.icon}
                  </div>
                </div>

                <h3 className="text-base font-display font-bold text-stone-100 mb-2">
                  {step.title}
                </h3>

                <p className="text-xs text-stone-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-850 text-[11px] font-mono text-stone-500">
                ASCEND STAGE-GATED STEP
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. The Stage-Gated Loop */}
      <section className="py-24 px-6 border-b border-stone-850 max-w-7xl mx-auto">
        <div className="border border-stone-800 bg-stone-900/40 p-8 sm:p-12 rounded-xl space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-mono text-amber-500 uppercase">
              Core Training Loop
            </span>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-stone-100">
              Goal → Roadmap → Daily Class → Practice → Mock Test → Next Level Unlocked
            </h3>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed pt-1">
              Every level requires passing a comprehensive assessment with 75% or higher. If you fall short, ASCEND identifies your weak topics and recommends exact remedial lessons.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 bg-stone-950 border border-stone-850 rounded space-y-1">
              <span className="text-emerald-400">PASSED (&ge; 75%)</span>
              <p className="text-stone-300 font-sans text-xs">
                Level marked Complete. Immediate unlock of next technical module and capstone project milestones.
              </p>
            </div>
            <div className="p-4 bg-stone-950 border border-stone-850 rounded space-y-1">
              <span className="text-amber-400">REVIEW REQUIRED (&lt; 75%)</span>
              <p className="text-stone-300 font-sans text-xs">
                Identifies specific weak topics, links to focused documentation, and enables retakes. Next level remains locked.
              </p>
            </div>
            <div className="p-4 bg-stone-950 border border-stone-850 rounded space-y-1">
              <span className="text-stone-400">JOB READINESS</span>
              <p className="text-stone-300 font-sans text-xs">
                All levels synthesized into resume preparation, behavioral interview practice, and full qualifying mock interviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bottom CTA */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-center space-y-6">
        <h2 className="text-3xl sm:text-5xl font-display font-bold text-stone-100 tracking-tight">
          Ready to Train for Your Target Role?
        </h2>
        <p className="text-sm sm:text-base text-stone-400 max-w-xl mx-auto leading-relaxed">
          Tell us the job you want. ASCEND creates the personalized learning path you need to get there.
        </p>
        <div className="pt-2">
          <button
            onClick={() => onNavigate('new-plan')}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-stone-100 hover:bg-white text-stone-950 text-sm font-semibold rounded transition-colors"
          >
            <span>Create My Personalized Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
