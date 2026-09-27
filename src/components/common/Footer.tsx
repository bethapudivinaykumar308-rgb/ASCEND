import React from 'react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full border-t border-stone-850 bg-stone-950 text-stone-400 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <div className="text-base font-display font-bold tracking-tight text-stone-100">ASCEND</div>
          <p className="text-xs text-stone-400 mt-1 max-w-sm">
            Train for the role you want. Your goal. Your roadmap. Your next level. Stage-gated technical career preparation platform.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs font-sans">
          <button onClick={() => onNavigate('dashboard')} className="hover:text-stone-200 transition-colors">
            Dashboard
          </button>
          <button onClick={() => onNavigate('roadmap')} className="hover:text-stone-200 transition-colors">
            My Roadmap
          </button>
          <button onClick={() => onNavigate('todays-class')} className="hover:text-stone-200 transition-colors">
            Today&apos;s Class
          </button>
          <button onClick={() => onNavigate('mock-tests')} className="hover:text-stone-200 transition-colors">
            Mock Tests
          </button>
          <button onClick={() => onNavigate('resources')} className="hover:text-stone-200 transition-colors">
            Resources
          </button>
          <span className="text-stone-600">·</span>
          <span className="text-stone-400 font-mono text-[11px] tabular-nums">
            ASCEND Career System
          </span>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-stone-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400">
        <span>&copy; {new Date().getFullYear()} ASCEND Career Training. Free AI-powered learning path.</span>
        <span className="mt-2 sm:mt-0 text-stone-400">
          Built for students and aspiring engineers.
        </span>
      </div>
    </footer>
  );
};
