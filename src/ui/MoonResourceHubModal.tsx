import React from 'react';
import { MOON_RESOURCES } from '../moonResources/moonResourceData';
import { MoonResourceId } from '../moonResources/moonResourceTypes';
import { soundManager } from '../audio/soundManager';
import { CheckCircle2, ChevronRight, Compass, Rocket, X } from 'lucide-react';

interface MoonResourceHubModalProps {
  completedResourceIds: MoonResourceId[];
  currentPlanet: string;
  onSelectResource: (id: MoonResourceId) => void;
  onClose: () => void;
}

const RESOURCE_ORDER: MoonResourceId[] = ['apollo_lm', 'lunar_rover', 'alsep', 'surveyor'];

export const MoonResourceHubModal: React.FC<MoonResourceHubModalProps> = ({
  completedResourceIds,
  currentPlanet,
  onSelectResource,
  onClose
}) => {
  const completedCount = RESOURCE_ORDER.filter(id => completedResourceIds.includes(id)).length;

  return (
    <div
      data-testid="moon-resource-hub-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/92 animate-fade-in"
    >
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden hud-glow">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                Historical Moon Exploration Resources (NASA Missions)
              </h2>
              <p className="text-xs text-slate-300">
                4 Interactive 3D Historical Missions • Separate from your Modern Exploration Space Shuttle
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-amber-300">
              <span>COMPLETED:</span>
              <strong className="text-white">
                {completedCount} / {RESOURCE_ORDER.length}
              </strong>
            </div>
            <button
              aria-label="Close Moon Resources Hub"
              onClick={() => {
                soundManager.playPing();
                onClose();
              }}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Shuttle Integration Info Banner */}
        <div className="px-5 py-2.5 bg-slate-950/85 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-cyan-200">
            <Rocket className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              {currentPlanet === 'moon'
                ? 'You are already on the Moon — selecting a mission enters its interactive briefing & 3D reconstruction directly.'
                : 'Starting from Earth opens the Earth Briefing, then guides you aboard your Space Shuttle for the real Earth → Moon flight.'}
            </span>
          </div>
        </div>

        {/* 4 Resource Cards */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {RESOURCE_ORDER.map(id => {
            const res = MOON_RESOURCES[id];
            const isDone = completedResourceIds.includes(id);

            return (
              <div
                key={id}
                data-testid={`moon-resource-card-${id}`}
                className="flex flex-col rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-400/70 transition overflow-hidden shadow-xl"
              >
                <div className="relative h-44 bg-slate-950 overflow-hidden border-b border-slate-800">
                  <img
                    src={res.referenceImage}
                    alt={res.referenceCaption}
                    className="w-full h-full object-cover object-center opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950/90 border border-slate-700 text-[10px] font-mono font-bold text-amber-300 uppercase">
                      {res.resourceNumber}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950/90 border border-slate-700 text-[10px] font-mono text-cyan-300">
                      {res.eraBadge}
                    </span>
                  </div>
                  {isDone && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-500/90 text-slate-950 text-[10px] font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>COMPLETED</span>
                    </div>
                  )}
                  <div className="absolute bottom-2.5 left-3 right-3">
                    <h3 className="text-base font-bold font-display text-white leading-snug">
                      {res.shortTitle}
                    </h3>
                    <p className="text-[11px] text-cyan-200 line-clamp-1">{res.subtitle}</p>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <p className="line-clamp-2">{res.earthBriefingIntro[0]}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {res.crew.slice(0, 3).map(c => (
                        <span
                          key={c.name}
                          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300"
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    data-testid={`launch-moon-resource-${id}`}
                    onClick={() => {
                      soundManager.playPing();
                      onSelectResource(id);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg active:scale-[0.99] transition"
                  >
                    <span>Explore {res.resourceNumber}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
