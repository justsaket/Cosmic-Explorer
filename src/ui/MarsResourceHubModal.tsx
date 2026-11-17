import React from 'react';
import { MARS_AND_SPACE_RESOURCES, RESOURCE_CATEGORIES } from '../marsResources/marsResourceData';
import { MarsAndSpaceResourceId } from '../marsResources/marsResourceTypes';
import { soundManager } from '../audio/soundManager';
import { CheckCircle2, ChevronRight, Compass, Globe2, Orbit, Rocket, Sparkles, X } from 'lucide-react';

interface MarsResourceHubModalProps {
  completedResourceIds: MarsAndSpaceResourceId[];
  currentPlanet: string;
  onSelectResource: (id: MarsAndSpaceResourceId) => void;
  onClose: () => void;
}

const TOTAL_RESOURCES = 9;

export const MarsResourceHubModal: React.FC<MarsResourceHubModalProps> = ({
  completedResourceIds,
  currentPlanet,
  onSelectResource,
  onClose
}) => {
  const completedCount = completedResourceIds.length;

  return (
    <div
      data-testid="mars-resource-hub-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/92 animate-fade-in"
    >
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-900 border border-orange-500/40 rounded-2xl shadow-2xl overflow-hidden hud-glow">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-300 border border-orange-500/40">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-white">
                Mars &amp; Deep Space Historical Exploration Resources
              </h2>
              <p className="text-xs text-slate-300">
                9 Interactive 3D Missions Across Mars, Outer Solar System &amp; Exoplanet Astronomy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-orange-300">
              <span>COMPLETED:</span>
              <strong className="text-white">
                {completedCount} / {TOTAL_RESOURCES}
              </strong>
            </div>
            <button
              aria-label="Close Mars and Deep Space Hub"
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

        {/* Route Banner */}
        <div className="px-5 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center gap-2 text-xs text-cyan-200">
          <Rocket className="w-4 h-4 text-orange-400 shrink-0" />
          <span>
            {currentPlanet === 'mars'
              ? 'You are on Mars — explore all 6 Mars surface sites (including Curiosity!) on foot, or visit the 3 illuminated Sky Exhibits (Dawn, Pioneer 10/11 & Kepler) floating overhead.'
              : 'Select any of the 9 missions: fly aboard your Space Shuttle from Earth → Mars, or launch Outer Solar System (Dawn, Pioneer 10 & 11) and Deep Space Astronomy (Kepler) directly.'}
          </span>
        </div>

        {/* 3 Strictly Separated Category Sections */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {RESOURCE_CATEGORIES.map(cat => (
            <section
              key={cat.id}
              data-testid={`resource-category-${cat.id}`}
              className="space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div
                    className="p-1.5 rounded-lg border"
                    style={{
                      borderColor: cat.badgeColor,
                      backgroundColor: '#020617',
                      color: cat.badgeColor
                    }}
                  >
                    {cat.id === 'mars' ? (
                      <Globe2 className="w-4 h-4" />
                    ) : cat.id === 'outer_solar_system' ? (
                      <Orbit className="w-4 h-4" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold font-display text-white">
                      {cat.title}
                    </h3>
                    <p className="text-[11px] text-slate-400">{cat.subtitle}</p>
                  </div>
                </div>

                <span
                  className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase text-slate-950"
                  style={{ backgroundColor: cat.badgeColor }}
                >
                  {cat.resourceIds.length}{' '}
                  {cat.resourceIds.length === 1 ? 'RESOURCE' : 'RESOURCES'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {cat.resourceIds.map(id => {
                  const res = MARS_AND_SPACE_RESOURCES[id];
                  const isDone = completedResourceIds.includes(id);

                  return (
                    <div
                      key={id}
                      data-testid={`mars-resource-card-${id}`}
                      className="flex flex-col justify-between rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-400/70 transition p-4 gap-3 shadow-lg"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase text-slate-950"
                            style={{ backgroundColor: res.accentColor }}
                          >
                            {res.resourceNumber}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {res.eraBadge}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold font-display text-white leading-snug">
                            {res.shortTitle}
                          </h4>
                          <p className="text-[11px] text-cyan-300 mt-0.5 line-clamp-2">
                            {res.subtitle}
                          </p>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                          {res.briefingSummary[0]}
                        </p>

                        {res.neverLandsNote && (
                          <div className="px-2 py-1 rounded bg-sky-950/80 border border-sky-500/40 text-[10px] font-mono text-sky-200">
                            {res.missionEnvironment === 'deep_space_orbit'
                              ? 'ORBITER ONLY — NEVER LANDS'
                              : res.missionEnvironment === 'deep_space_flyby'
                              ? 'OUTER FLYBY ONLY — NOT MARS'
                              : 'HELIOCENTRIC TELESCOPE — NEVER LANDS'}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 pt-1">
                        {isDone && (
                          <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>COMPLETED • BADGE EARNED</span>
                          </div>
                        )}

                        <button
                          data-testid={`launch-mars-resource-${id}`}
                          onClick={() => {
                            soundManager.playPing();
                            onSelectResource(id);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-md transition"
                        >
                          <span>Launch {res.resourceNumber}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};
