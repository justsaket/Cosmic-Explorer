import React from 'react';
import {
  Rocket, ArrowRight, Globe, Compass, Eye, LogOut, CheckCircle2, X, Gauge, Navigation
} from 'lucide-react';
import {
  ShuttleFlightPhase,
  ShuttleSurfacePlanet,
  ShuttleTelemetrySnapshot,
  SHUTTLE_PLANET_CONFIGS,
  getDestinationOptions
} from '../shuttle/shuttleSystem';
import { soundManager } from '../audio/soundManager';

interface ShuttleCockpitOverlayProps {
  phase: ShuttleFlightPhase;
  currentPlanet: ShuttleSurfacePlanet;
  selectedDestination: ShuttleSurfacePlanet | null;
  cameraPerspective: 'cockpit' | 'chase';
  telemetry: ShuttleTelemetrySnapshot | null;
  onSelectDestination: (dest: ShuttleSurfacePlanet | null) => void;
  onConfirmLaunch: () => void;
  onExitShuttle: () => void;
  onToggleCameraPerspective: () => void;
}

export const ShuttleCockpitOverlay: React.FC<ShuttleCockpitOverlayProps> = ({
  phase,
  currentPlanet,
  selectedDestination,
  cameraPerspective,
  telemetry,
  onSelectDestination,
  onConfirmLaunch,
  onExitShuttle,
  onToggleCameraPerspective
}) => {
  if (phase === 'parked') return null;

  const currentCfg = SHUTTLE_PLANET_CONFIGS[currentPlanet];
  const destinationOptions = getDestinationOptions(currentPlanet);
  const selectedOpt = destinationOptions.find((o) => o.planetId === selectedDestination) || null;

  const getPlanetBadgeColor = (pid: ShuttleSurfacePlanet) => {
    if (pid === 'earth') return 'from-sky-400 to-blue-700 border-sky-300/70';
    if (pid === 'moon') return 'from-slate-200 to-slate-500 border-slate-200/70';
    return 'from-orange-400 to-red-700 border-orange-300/70';
  };

  if (phase === 'boarding') {
    return (
      <div className="fixed inset-0 z-30 pointer-events-none flex flex-col items-center justify-start pt-5 px-4">
        <div className="pointer-events-auto px-5 py-2.5 rounded-xl bg-slate-950/90 border border-cyan-400/60 shadow-2xl flex items-center gap-3 font-mono text-xs text-cyan-200">
          <Rocket className="w-4 h-4 text-cyan-400" />
          <span className="font-bold tracking-wider uppercase">
            BOARDING SPACE SHUTTLE — ENTERING FLIGHT DECK...
          </span>
        </div>
      </div>
    );
  }

  if (phase === 'cockpit') {
    return (
      <div className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-between p-3 sm:p-5">
        {/* Top Cockpit Instrument Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
          <div className="px-4 py-2 rounded-xl bg-slate-950/90 border border-cyan-500/45 shadow-xl flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                SPACE SHUTTLE // FLIGHT DECK
              </div>
              <div className="text-xs sm:text-sm font-bold text-white">
                Docked at {currentCfg.landingSiteName}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundManager.playPing();
                onToggleCameraPerspective();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-700 hover:border-cyan-400 text-slate-200 hover:text-white text-xs font-mono font-bold transition shadow-lg"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>VIEW: {cameraPerspective === 'cockpit' ? 'COCKPIT' : 'EXTERIOR'} [V]</span>
            </button>

            <button
              type="button"
              data-testid="exit-shuttle-btn"
              onClick={() => {
                soundManager.playPing();
                onExitShuttle();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950/90 border border-amber-500/50 hover:border-amber-300 text-amber-300 hover:text-white text-xs font-mono font-bold transition shadow-lg"
            >
              <LogOut className="w-4 h-4" />
              <span>EXIT SHUTTLE [E]</span>
            </button>
          </div>
        </div>

        {/* Bottom Flight Deck Destination Selection Console (Leaves center windshield open) */}
        <div className="pointer-events-auto w-full max-w-4xl mx-auto rounded-2xl bg-slate-950/92 border border-cyan-500/45 shadow-2xl p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                ASTROGATION COMPUTER // SELECT TARGET WORLD
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Choose your interplanetary destination and confirm ignition
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Drag view to inspect cockpit • Press [E] to disembark
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {destinationOptions.map((opt) => {
              const isSelected = selectedDestination === opt.planetId;
              const disabled = opt.isCurrentLocation;

              return (
                <button
                  key={opt.planetId}
                  type="button"
                  disabled={disabled}
                  data-testid={`shuttle-dest-${opt.planetId}`}
                  onClick={() => {
                    if (disabled) return;
                    soundManager.playPing();
                    onSelectDestination(isSelected ? null : opt.planetId);
                  }}
                  className={`text-left p-3 rounded-xl border transition flex flex-col justify-between gap-2 ${
                    disabled
                      ? 'bg-slate-900/50 border-slate-800 text-slate-500 cursor-not-allowed opacity-65'
                      : isSelected
                      ? 'bg-cyan-950/80 border-cyan-300 ring-2 ring-cyan-400/50 text-white shadow-lg'
                      : 'bg-slate-900/90 border-slate-700 hover:border-cyan-400 text-slate-200 hover:bg-slate-800/90'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-7 h-7 rounded-full bg-gradient-to-br border shrink-0 shadow-inner ${getPlanetBadgeColor(
                          opt.planetId
                        )}`}
                      />
                      <div>
                        <div className="text-sm font-black tracking-wide flex items-center gap-1.5">
                          <span>{opt.title}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-300" />}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {opt.gravityMss} m/s²
                        </div>
                      </div>
                    </div>

                    {disabled ? (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] font-mono font-bold">
                        CURRENT
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 text-[9px] font-mono font-bold border border-cyan-500/30">
                        READY
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-300 leading-snug">
                    {opt.ctaLabel}
                  </div>
                  <div className="text-[10px] font-mono text-cyan-300/80 truncate">
                    {opt.distanceLabel}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explicit Launch Confirmation Bar */}
          {selectedOpt && !selectedOpt.isCurrentLocation && (
            <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs">
                <span className="text-cyan-300 font-mono font-bold uppercase mr-2">
                  FLIGHT PLAN LOCKED:
                </span>
                <span className="text-white font-semibold">
                  {currentCfg.name} → {selectedOpt.title} ({selectedOpt.subtitle})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playPing();
                    onSelectDestination(null);
                  }}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-mono font-bold transition"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>CANCEL</span>
                </button>

                <button
                  type="button"
                  data-testid="confirm-launch-btn"
                  onClick={() => {
                    soundManager.playPing();
                    onConfirmLaunch();
                  }}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-xl transition active:scale-95"
                >
                  <Rocket className="w-4 h-4" />
                  <span>CONFIRM & LAUNCH TO {selectedOpt.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'disembarking') {
    return (
      <div className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-between p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2 pointer-events-auto">
          <div className="px-4 py-2 rounded-xl bg-slate-950/90 border border-emerald-400/60 shadow-xl font-mono text-xs">
            <div className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest">
              TOUCHDOWN CONFIRMED
            </div>
            <div className="text-white font-bold">{currentCfg.landingSiteName}</div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundManager.playPing();
              onToggleCameraPerspective();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-700 hover:border-cyan-400 text-slate-200 text-xs font-mono font-bold transition"
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>VIEW: {cameraPerspective === 'cockpit' ? 'COCKPIT' : 'EXTERIOR'} [V]</span>
          </button>
        </div>

        <div className="flex justify-center pointer-events-auto pb-2">
          <button
            type="button"
            data-testid="disembark-shuttle-btn"
            onClick={() => {
              soundManager.playPing();
              onExitShuttle();
            }}
            className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black text-sm shadow-2xl border border-white/70 transition active:scale-95"
          >
            <Compass className="w-5 h-5" />
            <span>EXIT SHUTTLE & EXPLORE {currentCfg.name.toUpperCase()}</span>
            <span className="px-2 py-0.5 rounded bg-slate-950 text-emerald-300 text-xs font-mono">[E]</span>
          </button>
        </div>
      </div>
    );
  }

  // Active Flight Telemetry HUD (takeoff | cruise | approach | landing)
  const pct = Math.round((telemetry?.progress ?? 0) * 100);
  const altMeters = telemetry?.altitudeMeters ?? 0;
  const altDisplay = altMeters >= 1000 ? `${(altMeters / 1000).toFixed(1)} km` : `${Math.round(altMeters)} m`;

  return (
    <div className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-between">
      {/* Top Aerospace Flight Letterbox */}
      <div className="pointer-events-auto w-full bg-slate-950/92 border-b border-cyan-500/40 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-400/50 text-amber-300">
            <Rocket className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold">
              {(telemetry?.originPlanet || currentPlanet).toUpperCase()} →{' '}
              {(telemetry?.targetPlanet || selectedDestination || currentPlanet).toUpperCase()}
            </div>
            <div className="text-xs sm:text-sm font-mono font-bold text-white">
              {telemetry?.phaseLabel || phase.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 font-mono text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">ALTITUDE</span>
            <span className="text-cyan-300 font-bold tabular-nums">{altDisplay}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">VELOCITY</span>
            <span className="text-amber-300 font-bold tabular-nums">
              {telemetry?.velocityDisplay || '0.0 km/s'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">STAGE PROGRESS</span>
            <span className="text-emerald-300 font-bold tabular-nums">{pct}%</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            soundManager.playPing();
            onToggleCameraPerspective();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-cyan-300 text-xs font-mono font-bold transition"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{cameraPerspective === 'cockpit' ? 'COCKPIT VIEW' : 'CHASE CAM'} [V]</span>
        </button>
      </div>

      {/* Bottom Flight Status Strip */}
      <div className="pointer-events-auto w-full bg-slate-950/92 border-t border-cyan-500/35 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
          <Gauge className="w-4 h-4 shrink-0" />
          <span>
            {phase === 'cruise'
              ? 'INTERPLANETARY TRANSFER TRAJECTORY NOMINAL'
              : phase === 'takeoff'
              ? 'RS-25 MAIN ENGINES AT FULL THRUST — PITCH-OVER MANEUVER'
              : 'RETRO-THRUSTERS FIRING — TARGETING SURFACE TOUCHDOWN PAD'}
          </span>
        </div>

        <div className="w-36 sm:w-56 h-2 rounded-full bg-slate-800 overflow-hidden shrink-0">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 transition-all duration-100"
            style={{ width: `${Math.max(4, Math.min(100, pct))}%` }}
          />
        </div>
      </div>
    </div>
  );
};
