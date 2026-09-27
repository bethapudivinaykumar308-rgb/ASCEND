import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { AITrainerDrawer } from './components/trainer/AITrainerDrawer';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateGoalPage } from './pages/CreateGoalPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { TodaysClassPage } from './pages/TodaysClassPage';
import { PracticePage } from './pages/PracticePage';
import { MockTestsPage } from './pages/MockTestsPage';
import { ProgressPage } from './pages/ProgressPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ProfilePage } from './pages/ProfilePage';

const AppContent: React.FC = () => {
  const { careerPlan } = useApp();
  // Default to landing page if no plan, or dashboard if plan active
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return careerPlan ? 'dashboard' : 'landing';
  });

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentRoute]);

  const handleNavigate = (route: string) => {
    setCurrentRoute(route);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-950 text-stone-100 font-sans antialiased selection:bg-stone-800 selection:text-white">
      <Navbar currentRoute={currentRoute} onNavigate={handleNavigate} />

      <main className="flex-1">
        {currentRoute === 'landing' && <LandingPage onNavigate={handleNavigate} />}
        {currentRoute === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
        {currentRoute === 'new-plan' && <CreateGoalPage onNavigate={handleNavigate} />}
        {currentRoute === 'roadmap' && <RoadmapPage onNavigate={handleNavigate} />}
        {currentRoute === 'todays-class' && <TodaysClassPage onNavigate={handleNavigate} />}
        {currentRoute === 'practice' && <PracticePage onNavigate={handleNavigate} />}
        {currentRoute === 'mock-tests' && <MockTestsPage onNavigate={handleNavigate} />}
        {currentRoute === 'progress' && <ProgressPage onNavigate={handleNavigate} />}
        {currentRoute === 'resources' && <ResourcesPage onNavigate={handleNavigate} />}
        {currentRoute === 'profile' && <ProfilePage onNavigate={handleNavigate} />}
      </main>

      <Footer onNavigate={handleNavigate} />
      <AITrainerDrawer onNavigate={handleNavigate} />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
