import React, { useState } from 'react';
import { Mission, MissionObjective } from '../types';
import { 
  Compass, CheckCircle2, Circle, Trophy, 
  Target, Sparkles, ChevronRight, X, ShieldAlert 
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import type { HistoricalMissionVehicle } from '../scene/LandingSequence';
import type { HabitablePlanetId } from '../shuttle/shuttleTravelState';
import type { MoonResourceId } from '../moonResources/moonResourceTypes';
import type { MarsAndSpaceResourceId } from '../marsResources/marsResourceTypes';

interface MissionsModalProps {
  missions: Mission[];
  activeMissionId: string;
  onSelectActiveMission: (missionId: string) => void;
  onLaunchHistoricalSequence?: (planet: HabitablePlanetId, vehicle: HistoricalMissionVehicle) => void;
  onOpenMoonResource?: (id: MoonResourceId) => void;
  onOpenMarsResource?: (id: MarsAndSpaceResourceId) => void;
  onClose: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  missions,
  activeMissionId,
  onSelectActiveMission,
  onLaunchHistoricalSequence,
  onOpenMoonResource,
  onOpenMarsResource,
  onClose
}) => {
  const [selectedLevel, setSelectedLevel] = useState<'All' | 'Cadet' | 'Specialist' | 'Commander'>('All');

  const filteredMissions = missions.filter(m => {
    if (selectedLevel === 'All') return true;
    return m.level === selectedLevel;
  });

  const completedCount = missions.filter(m => m.completed).length;

  const getDifficultyBadge = (lvl: Mission['level']) => {
    switch (lvl) {
      case 'Cadet': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Specialist': return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'Commander': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden hud-glow">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-white">
                Mission Command Directives
              </h2>
              <p className="text-xs text-slate-400">
                Data-Driven Scientific Exploration Objectives & Flight Certification
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playPing();
              onClose();
            }}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress summary & Level Tabs */}
        <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono-tech text-slate-300">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>DIRECTIVES COMPLETED:</span>
            <span className="text-amber-400 font-bold">{completedCount} / {missions.length}</span>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            {(['All', 'Cadet', 'Specialist', 'Commander'] as const).map(lvl => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  selectedLevel === lvl
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Historical Moon Exploration Resources */}
        {onOpenMoonResource && (
          <div className="px-5 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-mono uppercase text-amber-300 font-bold">
              Interactive NASA Moon Missions:
            </span>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
              {(
                [
                  { id: 'apollo_lm', label: '01: Apollo Lunar Modules' },
                  { id: 'lunar_rover', label: '02: Lunar Rovers (LRV)' },
                  { id: 'alsep', label: '03: ALSEP Stations' },
                  { id: 'surveyor', label: '04: Surveyor 3 Lander' }
                ] as const
              ).map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    soundManager.playPing();
                    onOpenMoonResource(item.id);
                  }}
                  className="px-2.5 py-1 rounded bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-bold transition"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 9 Interactive Mars, Outer Solar System & Exoplanet Resources */}
        {onOpenMarsResource && (
          <div className="px-5 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-mono uppercase text-orange-300 font-bold">
              Mars &amp; Deep Space Missions (9):
            </span>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
              {(
                [
                  { id: 'sojourner', label: '01: Sojourner' },
                  { id: 'spirit_opportunity', label: '02: Spirit & Opp.' },
                  { id: 'viking_1', label: '03: Viking 1' },
                  { id: 'phoenix_insight', label: '04: Phoenix & InSight' },
                  { id: 'dawn', label: '05: Dawn (Sky/Belt)' },
                  { id: 'pioneer', label: '06: Pioneer 10/11' },
                  { id: 'ingenuity', label: '07: Ingenuity' },
                  { id: 'kepler', label: '08: Kepler (Sky/Space)' },
                  { id: 'curiosity', label: '09: Curiosity' }
                ] as const
              ).map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    soundManager.playPing();
                    onOpenMarsResource(item.id);
                  }}
                  className="px-2 py-1 rounded bg-orange-500/15 hover:bg-orange-500/30 border border-orange-500/40 text-orange-200 font-bold transition"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Historical Spacecraft Reenactments (Distinct Vehicles) */}
        {onLaunchHistoricalSequence && (
          <div className="px-5 py-2.5 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-mono uppercase text-cyan-300 font-bold">
              Historical Spacecraft Replay:
            </span>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
              <button
                onClick={() => {
                  soundManager.playPing();
                  onLaunchHistoricalSequence('moon', 'moon_apollo');
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-400 text-slate-200 transition"
              >
                Apollo LM (Moon)
              </button>
              <button
                onClick={() => {
                  soundManager.playPing();
                  onLaunchHistoricalSequence('moon', 'moon_surveyor');
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-400 text-slate-200 transition"
              >
                Surveyor 3 (Moon)
              </button>
              <button
                onClick={() => {
                  soundManager.playPing();
                  onLaunchHistoricalSequence('mars', 'mars_skycrane');
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-amber-500/20 border border-slate-700 hover:border-amber-400 text-amber-200 transition"
              >
                Mars Sky Crane
              </button>
              <button
                onClick={() => {
                  soundManager.playPing();
                  onLaunchHistoricalSequence('mars', 'mars_orbiter');
                }}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-sky-500/20 border border-slate-700 hover:border-sky-400 text-sky-200 transition"
              >
                Mars Orbiter (Orbit Pass)
              </button>
            </div>
          </div>
        )}

        {/* Missions List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {filteredMissions.map(m => {
            const isActive = m.id === activeMissionId;
            return (
              <div
                key={m.id}
                className={`p-4 rounded-xl border transition ${
                  m.completed 
                    ? 'bg-slate-950/40 border-emerald-500/30'
                    : isActive
                    ? 'bg-slate-950/70 border-cyan-500/60 hud-glow'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Title line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono-tech uppercase px-2 py-0.5 rounded border ${getDifficultyBadge(m.level)}`}>
                      {m.level}
                    </span>
                    <span className="text-xs font-mono-tech uppercase text-slate-400">
                      Target: {m.destination.toUpperCase()}
                    </span>
                    {m.completed && (
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono-tech text-amber-400">
                      +{m.rewardPoints} XP
                    </span>

                    {!m.completed && (
                      <button
                        onClick={() => {
                          soundManager.playPing();
                          onSelectActiveMission(m.id);
                        }}
                        className={`text-xs px-2.5 py-1 rounded font-medium transition ${
                          isActive
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cursor-default'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {isActive ? 'Tracking Active' : 'Track Mission'}
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold font-display text-white mb-1">
                  {m.title}
                </h3>
                <p className="text-xs text-slate-300 mb-3">
                  {m.briefing}
                </p>

                {/* Objectives Checklist */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  <div className="text-[11px] font-mono-tech uppercase text-slate-400 mb-1">
                    Flight Objectives:
                  </div>
                  {m.objectives.map((obj: MissionObjective) => (
                    <div
                      key={obj.id}
                      className="flex items-center justify-between text-xs p-1.5 rounded bg-slate-900/60 border border-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        {obj.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span className={obj.completed ? 'text-slate-400 line-through' : 'text-slate-200'}>
                          {obj.description}
                        </span>
                      </div>

                      <span className="font-mono-tech text-[11px] text-slate-400 ml-2">
                        {obj.currentCount} / {obj.targetCount}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Awarded Badge */}
                <div className="mt-3 text-[11px] text-slate-400 font-mono-tech flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Reward Insignia: <span className="text-white font-medium">{m.badgeName}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950/90 border-t border-slate-800 text-center text-xs text-slate-500">
          Tracked missions display real-time progress on your active flight HUD while exploring worlds.
        </div>

      </div>
    </div>
  );
};
