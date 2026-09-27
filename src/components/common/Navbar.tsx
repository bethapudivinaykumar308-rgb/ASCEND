import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MessageSquare, Sparkles, Menu, X } from 'lucide-react';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, onNavigate }) => {
  const { userProfile, careerPlan, toggleTrainer } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { route: 'dashboard', label: 'Dashboard' },
    { route: 'roadmap', label: 'My Roadmap' },
    { route: 'todays-class', label: "Today's Class" },
    { route: 'practice', label: 'Practice' },
    { route: 'mock-tests', label: 'Mock Tests' },
    { route: 'progress', label: 'Progress' },
    { route: 'resources', label: 'Resources' },
    { route: 'profile', label: 'Profile' },
  ];

  const handleNavClick = (route: string) => {
    onNavigate(route);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-850 bg-stone-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('landing')}
            className="text-lg font-display font-bold tracking-tight text-stone-100 hover:text-white transition-colors text-left"
          >
            ASCEND
          </button>
          {careerPlan && (
            <span
              className={`hidden md:inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded border ${
                careerPlan.isDemo
                  ? 'border-amber-900/60 bg-amber-950/30 text-amber-400'
                  : 'border-emerald-800/60 bg-emerald-950/30 text-emerald-400'
              }`}
            >
              {careerPlan.goal.targetJob} · {careerPlan.isDemo ? 'Demo' : 'AI Plan'}
            </span>
          )}
        </div>

        {/* Zone 2: Nav links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-sans font-medium text-stone-400">
          {navLinks.map((link) => {
            const isActive = currentRoute === link.route;
            return (
              <button
                key={link.route}
                onClick={() => handleNavClick(link.route)}
                className={`transition-colors whitespace-nowrap hover:text-stone-100 ${
                  isActive ? 'text-stone-100 font-semibold border-b border-stone-200 pb-0.5' : ''
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-3">
          {/* AI Trainer quick toggle button */}
          <button
            onClick={() => toggleTrainer()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-medium text-amber-300 bg-amber-950/30 hover:bg-amber-950/50 border border-amber-800/60 rounded transition-colors whitespace-nowrap"
            title="Ask AI Career Trainer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">AI Trainer</span>
          </button>

          <button
            onClick={() => onNavigate('new-plan')}
            className="hidden sm:inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-sans font-semibold text-stone-950 bg-stone-100 hover:bg-white rounded transition-colors whitespace-nowrap"
          >
            + New Plan
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-stone-400 hover:text-stone-200"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-stone-850 bg-stone-950 px-6 py-4 space-y-2 animate-in fade-in duration-150">
          {careerPlan && (
            <div className="text-[11px] font-mono pb-2 border-b border-stone-850 flex items-center justify-between">
              <span className="text-stone-300">Goal: {careerPlan.goal.targetJob}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded border ${
                  careerPlan.isDemo
                    ? 'border-amber-900/60 bg-amber-950/30 text-amber-400'
                    : 'border-emerald-800/60 bg-emerald-950/30 text-emerald-400'
                }`}
              >
                {careerPlan.isDemo ? 'Demo' : 'AI Plan'}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2">
            {navLinks.map((link) => (
              <button
                key={link.route}
                onClick={() => handleNavClick(link.route)}
                className={`text-left py-2 px-3 text-xs rounded transition-colors ${
                  currentRoute === link.route
                    ? 'bg-stone-900 text-stone-100 font-semibold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-stone-850 flex items-center justify-between">
            <button
              onClick={() => handleNavClick('new-plan')}
              className="w-full py-2 bg-stone-100 text-stone-950 text-xs font-semibold rounded text-center"
            >
              + Create New Plan
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
