import React, { useState } from 'react';
import { ExplorerProfile, FieldSample, ScientificDiscovery } from '../types';
import { UNKNOWN_FRONTIER_TOPICS } from '../education/unknownFrontierData';
import { ALL_DISCOVERIES } from '../education/contentLibrary';
import { 
  BookOpen, BookmarkCheck, Package, MapPin, 
  Sparkles, CheckCircle2, ChevronRight, X, Compass, Globe, Award
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface FieldNotebookModalProps {
  profile: ExplorerProfile;
  onSelectDiscovery: (discovery: ScientificDiscovery) => void;
  onOpenFrontier: () => void;
  onClose: () => void;
}

export const FieldNotebookModal: React.FC<FieldNotebookModalProps> = ({
  profile,
  onSelectDiscovery,
  onOpenFrontier,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'samples' | 'discoveries' | 'mysteries' | 'log'>('samples');

  const savedTopics = UNKNOWN_FRONTIER_TOPICS.filter(t => 
    profile.savedFrontierQuestionIds?.includes(t.id)
  );

  const scannedDiscoveries = ALL_DISCOVERIES.filter(d => 
    profile.scannedDiscoveryIds?.includes(d.id) || profile.inventory.some(i => i.discoveryId === d.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-amber-500/40 shadow-2xl overflow-hidden">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">
                  OFFICIAL ASTRONAUT SCIENTIFIC LOG
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  PART 7.4
                </span>
              </div>
              <h2 className="text-xl font-bold font-display text-white tracking-wide">
                Planetary Field Notebook
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

        {/* SUMMARY STATS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4 bg-slate-950/60 border-b border-slate-800 font-mono text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-400">SAMPLES COLLECTED</span>
            <span className="text-lg font-bold text-amber-400">
              {profile.collectedSamples?.length || 0}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-400">DISCOVERIES SCANNED</span>
            <span className="text-lg font-bold text-cyan-400">
              {scannedDiscoveries.length}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-400">DISTANCE TRAVELED</span>
            <span className="text-lg font-bold text-emerald-400">
              {Math.round(profile.metersTraveled)} m
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-400">EXPLORER RANK</span>
            <span className="text-xs font-bold text-purple-300 truncate mt-1">
              {profile.rank}
            </span>
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-2 gap-2">
          <button
            onClick={() => {
              soundManager.playPing();
              setActiveTab('samples');
            }}
            className={`px-4 py-2 text-xs font-mono font-medium rounded-t-lg transition border-t border-x ${
              activeTab === 'samples'
                ? 'bg-slate-900 text-amber-300 border-amber-500/50 font-bold'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            Geological Samples ({profile.collectedSamples?.length || 0})
          </button>
          <button
            onClick={() => {
              soundManager.playPing();
              setActiveTab('discoveries');
            }}
            className={`px-4 py-2 text-xs font-mono font-medium rounded-t-lg transition border-t border-x ${
              activeTab === 'discoveries'
                ? 'bg-slate-900 text-cyan-300 border-cyan-500/50 font-bold'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            Scanned Sites ({scannedDiscoveries.length})
          </button>
          <button
            onClick={() => {
              soundManager.playPing();
              setActiveTab('mysteries');
            }}
            className={`px-4 py-2 text-xs font-mono font-medium rounded-t-lg transition border-t border-x ${
              activeTab === 'mysteries'
                ? 'bg-slate-900 text-purple-300 border-purple-500/50 font-bold'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            Saved Mysteries ({savedTopics.length})
          </button>
          <button
            onClick={() => {
              soundManager.playPing();
              setActiveTab('log');
            }}
            className={`px-4 py-2 text-xs font-mono font-medium rounded-t-lg transition border-t border-x ${
              activeTab === 'log'
                ? 'bg-slate-900 text-emerald-300 border-emerald-500/50 font-bold'
                : 'text-slate-400 border-transparent hover:text-white'
            }`}
          >
            Mission History
          </button>
        </div>

        {/* TAB CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          
          {/* TAB 1: SAMPLES */}
          {activeTab === 'samples' && (
            <div className="space-y-3">
              {(!profile.collectedSamples || profile.collectedSamples.length === 0) ? (
                <div className="text-center py-16 space-y-3 text-slate-400 font-mono text-xs">
                  <Package className="w-10 h-10 mx-auto text-slate-600 animate-pulse" />
                  <p>No geological samples collected in your field kit yet.</p>
                  <p className="text-slate-500 text-[11px]">
                    Approach rocks, regolith, or mineral outcroppings on Moon or Mars and press [E] or click "Collect Sample".
                  </p>
                </div>
              ) : (
                profile.collectedSamples.map(sample => (
                  <div
                    key={sample.id}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 transition space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <h4 className="font-bold font-display text-white text-sm">
                          {sample.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-amber-300 border border-amber-500/30">
                          {sample.planetId}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {sample.locationName}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1">
                      <div className="p-2 rounded bg-slate-900/80 border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 block mb-0.5">COMPOSITION</span>
                        <span className="text-slate-200">{sample.composition}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900/80 border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 block mb-0.5">SCIENTIFIC GOAL</span>
                        <span className="text-slate-200">{sample.scientificGoal}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: DISCOVERIES */}
          {activeTab === 'discoveries' && (
            <div className="space-y-3">
              {scannedDiscoveries.length === 0 ? (
                <div className="text-center py-16 text-slate-400 font-mono text-xs">
                  No discoveries investigated yet. Explore the planetary surface to detect scientific beacons.
                </div>
              ) : (
                scannedDiscoveries.map(disc => (
                  <div
                    key={disc.id}
                    onClick={() => onSelectDiscovery(disc)}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/60 transition cursor-pointer flex items-center justify-between group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                          {disc.planetId}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {disc.category.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold font-display text-white group-hover:text-cyan-300 transition">
                        {disc.name}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {disc.headline}
                      </p>
                    </div>

                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition" />
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: MYSTERIES */}
          {activeTab === 'mysteries' && (
            <div className="space-y-3">
              {savedTopics.length === 0 ? (
                <div className="text-center py-16 space-y-3 text-slate-400 font-mono text-xs">
                  <BookmarkCheck className="w-10 h-10 mx-auto text-slate-600" />
                  <p>You haven't bookmarked any frontier mysteries to your notebook yet.</p>
                  <button
                    onClick={() => {
                      soundManager.playPing();
                      onOpenFrontier();
                    }}
                    className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition"
                  >
                    Open The Unknown Frontier [U]
                  </button>
                </div>
              ) : (
                savedTopics.map(topic => (
                  <div
                    key={topic.id}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-purple-950 text-purple-300 border border-purple-500/30">
                          {topic.planetId}
                        </span>
                        <h4 className="font-bold font-display text-white text-sm">
                          {topic.title}
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-amber-400">
                        BOOKMARKED
                      </span>
                    </div>

                    <p className="text-xs text-cyan-300 font-mono">
                      {topic.question}
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {topic.summary}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: MISSION HISTORY */}
          {activeTab === 'log' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-white font-display flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  Astronaut Dossier
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                  <div>Callsign: <span className="text-cyan-300 font-bold">{profile.callsign}</span></div>
                  <div>Rank: <span className="text-amber-300 font-bold">{profile.rank}</span></div>
                  <div>Total Points: <span className="text-white font-bold">{profile.totalPoints}</span></div>
                  <div>Completed Missions: <span className="text-emerald-400 font-bold">{profile.completedMissionIds.length}</span></div>
                  <div>Jumps in Low Gravity: <span className="text-white font-bold">{profile.jumpsPerformed}</span></div>
                  <div>Last Destination: <span className="text-cyan-300 uppercase font-bold">{profile.lastVisitedPlanet}</span></div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Astronaut Scientific Record // NASA Guidelines</span>
          <span className="text-amber-400">Press [N] anytime to toggle</span>
        </div>

      </div>
    </div>
  );
};
