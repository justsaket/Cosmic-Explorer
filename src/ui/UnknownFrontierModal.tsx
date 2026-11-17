import React, { useState, useMemo } from 'react';
import { UnknownFrontierTopic, FrontierPillar } from '../types';
import { UNKNOWN_FRONTIER_TOPICS } from '../education/unknownFrontierData';
import { 
  Compass, Bookmark, BookmarkCheck, Search, Sparkles, 
  HelpCircle, ChevronRight, X, Atom, Microscope, Rocket, Globe
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface UnknownFrontierModalProps {
  savedQuestionIds: string[];
  onToggleSaveQuestion: (topicId: string) => void;
  onClose: () => void;
}

export const UnknownFrontierModal: React.FC<UnknownFrontierModalProps> = ({
  savedQuestionIds,
  onToggleSaveQuestion,
  onClose
}) => {
  const [activePillar, setActivePillar] = useState<FrontierPillar | 'all'>('all');
  const [selectedPlanet, setSelectedPlanet] = useState<'all' | 'moon' | 'mars'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  const filteredTopics = useMemo(() => {
    return UNKNOWN_FRONTIER_TOPICS.filter(t => {
      if (activePillar !== 'all' && t.pillar !== activePillar) return false;
      if (selectedPlanet !== 'all' && t.planetId !== selectedPlanet) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesSummary = t.summary.toLowerCase().includes(q);
        const matchesQuestion = t.question.toLowerCase().includes(q);
        const matchesTags = t.tags.some(tag => tag.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSummary && !matchesQuestion && !matchesTags) return false;
      }
      return true;
    });
  }, [activePillar, selectedPlanet, searchQuery]);

  const getPillarBadge = (pillar: FrontierPillar) => {
    switch (pillar) {
      case 'what_we_know':
        return {
          label: 'WHAT WE KNOW',
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          icon: <Microscope className="w-3.5 h-3.5 text-emerald-400" />
        };
      case 'what_we_are_investigating':
        return {
          label: 'WHAT WE ARE INVESTIGATING',
          color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          icon: <Atom className="w-3.5 h-3.5 text-cyan-400" />
        };
      case 'future_discoveries':
        return {
          label: 'FUTURE DISCOVERIES',
          color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          icon: <Rocket className="w-3.5 h-3.5 text-purple-400" />
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-2xl overflow-hidden">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">
                  NASA / JPL SCIENTIFIC KNOWLEDGE ARCHIVE
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  PART 8
                </span>
              </div>
              <h2 className="text-xl font-bold font-display text-white tracking-wide">
                The Unknown Frontier
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playPing();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PILLAR EXPLANATION BANNER */}
        <div className="px-6 py-2.5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/80 text-xs text-slate-300 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            Science advances by understanding what is confirmed, what is actively being researched, and what mysteries await future generations of astronauts.
          </span>
        </div>

        {/* CONTROLS: PILLAR TABS + PLANET FILTER + SEARCH */}
        <div className="p-4 sm:p-6 border-b border-slate-800 space-y-3 bg-slate-950/40">
          {/* Pillar Selector */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                soundManager.playPing();
                setActivePillar('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition ${
                activePillar === 'all'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              All Pillars ({UNKNOWN_FRONTIER_TOPICS.length})
            </button>
            <button
              onClick={() => {
                soundManager.playPing();
                setActivePillar('what_we_know');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition ${
                activePillar === 'what_we_know'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <Microscope className="w-3.5 h-3.5" />
              1. What We Know
            </button>
            <button
              onClick={() => {
                soundManager.playPing();
                setActivePillar('what_we_are_investigating');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition ${
                activePillar === 'what_we_are_investigating'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <Atom className="w-3.5 h-3.5" />
              2. What We Are Investigating
            </button>
            <button
              onClick={() => {
                soundManager.playPing();
                setActivePillar('future_discoveries');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition ${
                activePillar === 'future_discoveries'
                  ? 'bg-purple-500 text-slate-950 border-purple-400 font-bold'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              3. Future Discoveries
            </button>
          </div>

          {/* Sub-row: Planet filter and Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <span className="text-[11px] font-mono text-slate-400 mr-1">PLANET:</span>
              {(['all', 'moon', 'mars'] as const).map(planet => (
                <button
                  key={planet}
                  onClick={() => {
                    soundManager.playPing();
                    setSelectedPlanet(planet);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-mono uppercase transition border ${
                    selectedPlanet === planet
                      ? 'bg-slate-700 text-white border-cyan-400'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {planet}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search mysteries, ice, basalt..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* TOPIC LIST */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
          {filteredTopics.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-mono text-xs">
              No frontier topics found matching query.
            </div>
          ) : (
            filteredTopics.map(topic => {
              const isExpanded = expandedTopicId === topic.id;
              const isSaved = savedQuestionIds.includes(topic.id);
              const badge = getPillarBadge(topic.pillar);

              return (
                <div
                  key={topic.id}
                  className={`rounded-xl border transition overflow-hidden bg-slate-950/70 ${
                    isExpanded ? 'border-cyan-500/70 shadow-lg' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Topic Header Bar */}
                  <div
                    onClick={() => {
                      soundManager.playPing();
                      setExpandedTopicId(prev => prev === topic.id ? null : topic.id);
                    }}
                    className="p-4 flex items-start justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badge.color}`}>
                          {badge.icon}
                          {badge.label}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-300">
                          {topic.planetId}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white font-display">
                        {topic.title}
                      </h3>
                      <div className="text-xs text-cyan-300/90 font-mono flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                        <span>{topic.question}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Bookmark to notebook button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundManager.playPing();
                          onToggleSaveQuestion(topic.id);
                        }}
                        className={`p-2 rounded-lg border transition ${
                          isSaved
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                        title={isSaved ? 'Saved to Planetary Notebook' : 'Save to Planetary Notebook'}
                      >
                        {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      </button>

                      <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </div>

                  {/* Summary row */}
                  <div className="px-4 pb-3 text-xs text-slate-300 leading-relaxed border-t border-slate-800/50 pt-2.5">
                    {topic.summary}
                  </div>

                  {/* Expanded Scientific Breakdown */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-800 space-y-3 bg-slate-900/60">
                      
                      {/* Current Confirmed Evidence */}
                      <div className="rounded-lg p-3 bg-slate-950/80 border border-emerald-500/30">
                        <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-400 uppercase mb-1">
                          <Microscope className="w-3.5 h-3.5" />
                          CONFIRMED SCIENTIFIC EVIDENCE
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {topic.currentEvidence}
                        </p>
                      </div>

                      {/* Active Unanswered Mystery */}
                      <div className="rounded-lg p-3 bg-slate-950/80 border border-cyan-500/30">
                        <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-cyan-400 uppercase mb-1">
                          <HelpCircle className="w-3.5 h-3.5" />
                          ACTIVE UNANSWERED MYSTERY
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {topic.unansweredMystery}
                        </p>
                      </div>

                      {/* Next Generation Mission */}
                      <div className="rounded-lg p-3 bg-slate-950/80 border border-purple-500/30">
                        <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-purple-400 uppercase mb-1">
                          <Rocket className="w-3.5 h-3.5" />
                          NEXT-GENERATION EXPLORATION MISSION
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {topic.nextGenerationMission}
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {topic.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Saved to Notebook: {savedQuestionIds.length} topics</span>
          <span className="text-cyan-400">Press [U] anytime to toggle</span>
        </div>

      </div>
    </div>
  );
};
