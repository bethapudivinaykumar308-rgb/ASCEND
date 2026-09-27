import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ExternalLink, CheckCircle2, Search, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { LearningResource } from '../types';

interface ResourcesPageProps {
  onNavigate: (route: string) => void;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({ onNavigate }) => {
  const { careerPlan } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  if (!careerPlan) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center space-y-4">
        <h2 className="text-2xl font-display font-bold text-stone-100">No Learning Track Active</h2>
        <p className="text-sm text-stone-400">
          Create a career goal roadmap to aggregate verified topic resources.
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

  // Aggregate all resources across all levels and lessons (Requirement B)
  const allResources: { resource: LearningResource; levelNumber: number; dayNumber: number; topicName: string }[] = [];
  careerPlan.levels.forEach((lvl) => {
    const list = lvl.topics && lvl.topics.length > 0 ? lvl.topics : lvl.lessons;
    list.forEach((les) => {
      (les.resources || []).forEach((r) => {
        allResources.push({
          resource: r,
          levelNumber: lvl.levelNumber,
          dayNumber: les.dayNumber,
          topicName: les.topic,
        });
      });
    });
  });

  const filtered = allResources.filter(({ resource, topicName }) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      resource.title.toLowerCase().includes(q) ||
      (resource.topic || topicName).toLowerCase().includes(q) ||
      resource.provider.toLowerCase().includes(q) ||
      (resource.description || '').toLowerCase().includes(q);

    const matchesType =
      selectedType === 'all' ||
      resource.type === selectedType ||
      (selectedType === 'documentation' && (resource.type === 'documentation' || resource.type === 'official_documentation')) ||
      (selectedType === 'video' && (resource.type === 'video' || resource.type === 'youtube_video'));

    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="border-b border-stone-850 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-stone-500 uppercase tracking-wider mb-1">
            Curated Resource Library · {careerPlan.goal.targetJob}
          </div>
          <h1 className="text-3xl font-display font-bold text-stone-100">
            Verified Learning Resources
          </h1>
          <p className="text-sm text-stone-400 mt-1 max-w-2xl">
            Authoritative documentation, official tutorials, and technical specifications organized by specific lesson topics without fabricated links.
          </p>
        </div>

        <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 self-start sm:self-auto">
          <CheckCircle2 className="w-4 h-4" />
          <span>Zero Fabricated URLs</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources by topic, provider, or title..."
            className="w-full pl-9 pr-4 py-2 bg-stone-950 border border-stone-800 rounded text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-stone-600 font-sans"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-stone-900 border border-stone-800 rounded text-xs font-mono">
          {['all', 'documentation', 'video', 'tutorial'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded capitalize transition-colors ${
                selectedType === type
                  ? 'bg-stone-800 text-stone-100 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 p-8 border border-stone-850 bg-stone-900/30 rounded text-center text-xs text-stone-400 font-mono">
            No verified resources match your filter criteria.
          </div>
        ) : (
          filtered.map(({ resource, levelNumber, dayNumber, topicName }) => {
            const isVerified = resource.isVerified && resource.verificationStatus === 'verified';
            const durationDisplay = resource.estimatedDuration || resource.duration || '20 min read';
            const descriptionText = resource.description || resource.selectionReason;

            return (
              <div
                key={`${resource.id}-${dayNumber}`}
                className="p-5 border border-stone-850 bg-stone-900/40 rounded-lg space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-stone-500">
                    <span className="text-amber-500">Level 0{levelNumber} · Day {dayNumber}</span>
                    <span className="capitalize">{resource.type?.replace('_', ' ')} · {durationDisplay}</span>
                  </div>

                  <h3 className="text-sm font-semibold text-stone-100 leading-snug">
                    {resource.title}
                  </h3>

                  <div className="text-xs text-stone-400">
                    Provider: <strong className="text-stone-300">{resource.provider}</strong>
                  </div>

                  <div className="text-xs text-stone-400">
                    Topic: <span className="font-mono text-stone-300">{resource.topic || topicName}</span>
                  </div>

                  <div className="pt-2 text-xs text-stone-400 space-y-1">
                    <span className="text-[10px] font-mono text-stone-500 uppercase block">Why this was selected:</span>
                    <p className="leading-relaxed">{descriptionText}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between">
                  <span className={`text-[10px] font-mono ${isVerified ? 'text-emerald-400' : 'text-stone-500'}`}>
                    {isVerified ? 'VERIFIED OFFICIAL RESOURCE' : 'VERIFICATION PENDING'}
                  </span>

                  <a
                    href={resource.directUrl || resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-stone-200 hover:text-white font-medium transition-colors"
                  >
                    <span>Open Resource</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
