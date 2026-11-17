import React from 'react';
import { PlanetId, CelestialBodyConfig } from '../types';
import { CELESTIAL_BODIES } from '../planets/planetConfig';
import {
  HabitablePlanetId,
  getAvailableShuttleDestinations,
  SHUTTLE_PADS
} from '../shuttle/shuttleTravelState';
import {
  Rocket, Thermometer, Orbit, Layers, Sparkles, X, Globe, DoorOpen
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface DestinationSelectorProps {
  mode?: 'universe' | 'shuttle';
  selectedPlanetId?: PlanetId;
  currentPlanet?: HabitablePlanetId;
  onInitiateDescent?: (planetId: PlanetId) => void;
  onLaunchShuttle?: (destination: HabitablePlanetId) => void;
  onExitShuttle?: () => void;
  onClose: () => void;
}

export const DestinationSelector: React.FC<DestinationSelectorProps> = ({
  mode = 'universe',
  selectedPlanetId = 'earth',
  currentPlanet = 'earth',
  onInitiateDescent,
  onLaunchShuttle,
  onExitShuttle,
  onClose
}) => {
  if (mode === 'shuttle') {
    const destinations = getAvailableShuttleDestinations(currentPlanet);
    const originName = CELESTIAL_BODIES[currentPlanet]?.name || currentPlanet.toUpperCase();

    return (
      <div
        data-testid="shuttle-destination-selector"
        className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/75 pointer-events-auto select-none animate-fade-in"
      >
        <div className="w-full max-w-2xl bg-slate-900/95 border-2 border-cyan-400/70 rounded-3xl shadow-2xl overflow-hidden hud-glow">
          {/* Header */}
          <div className="p-5 bg-slate-950 border-b border-cyan-500/30 flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                SPACE SHUTTLE FLIGHT COMPUTER // CURRENTLY AT {originName.toUpperCase()}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-white mt-1">
                SELECT YOUR DESTINATION
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Astronaut seated &amp; secured in flight deck. Choose an interplanetary trajectory below or press [E] to disembark.
              </p>
            </div>
            <button
              onClick={() => {
                soundManager.playPing();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              title="Minimize destination panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Two Reachable Planetary Destinations */}
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {destinations.map((dest) => {
              const padInfo = SHUTTLE_PADS[dest.id];
              const accentClass =
                dest.id === 'earth'
                  ? 'border-blue-500/60 hover:border-blue-400 bg-slate-950/85'
                  : dest.id === 'moon'
                  ? 'border-slate-400/60 hover:border-slate-200 bg-slate-950/85'
                  : 'border-orange-500/60 hover:border-orange-400 bg-slate-950/85';
              const btnClass =
                dest.id === 'earth'
                  ? 'from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white'
                  : dest.id === 'moon'
                  ? 'from-slate-200 to-slate-400 hover:from-white hover:to-slate-300 text-slate-950'
                  : 'from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-slate-950';

              return (
                <div
                  key={dest.id}
                  className={`p-4 rounded-2xl border-2 transition flex flex-col justify-between gap-4 ${accentClass}`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                        {dest.estimatedTransitLabel}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {dest.distanceLabel}
                      </span>
                    </div>
                    <h3 className="text-xl font-black font-display text-white">
                      {dest.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{dest.subtitle}</p>

                    <div className="mt-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-[11px] font-mono">
                      <div className="flex justify-between text-slate-300">
                        <span>Surface Gravity:</span>
                        <span className="text-cyan-300 font-bold">{dest.gravityMss} m/s²</span>
                      </div>
                      <div className="text-slate-400 truncate" title={padInfo.label}>
                        Pad: {padInfo.label}
                      </div>
                    </div>
                  </div>

                  <button
                    data-shuttle-dest={dest.id}
                    onClick={() => {
                      soundManager.playPing();
                      onLaunchShuttle?.(dest.id);
                    }}
                    className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm bg-gradient-to-r ${btnClass} shadow-lg active:scale-95 transition`}
                  >
                    <Rocket className="w-4 h-4" />
                    <span>Launch to {dest.name}</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer: Exit Shuttle Option */}
          <div className="px-5 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
            <span className="text-xs font-mono text-slate-400">
              Press [V] anytime in flight to switch Cockpit / External Chase Camera
            </span>
            {onExitShuttle && (
              <button
                data-shuttle-exit="true"
                onClick={() => {
                  soundManager.playPing();
                  onExitShuttle();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 text-xs font-mono font-bold transition"
              >
                <DoorOpen className="w-4 h-4 text-amber-400" />
                <span>Exit Space Shuttle [E]</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Universe Planetary Target Inspection Mode
  const config: CelestialBodyConfig = CELESTIAL_BODIES[selectedPlanetId];

  const handleLaunch = () => {
    soundManager.playPing();
    onInitiateDescent?.(selectedPlanetId);
  };

  const getPlanetTheme = (id: PlanetId) => {
    switch (id) {
      case 'mercury':
        return {
          border: 'border-slate-400/50',
          badge: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
          btn: 'from-slate-500 to-slate-600 text-white'
        };
      case 'venus':
        return {
          border: 'border-amber-400/50',
          badge: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
          btn: 'from-amber-500 to-orange-500 text-slate-950 font-bold'
        };
      case 'earth':
        return {
          border: 'border-blue-500/50',
          badge: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
          btn: 'from-blue-600 to-indigo-600 text-white'
        };
      case 'moon':
        return {
          border: 'border-slate-400/50',
          badge: 'bg-slate-400/20 text-slate-200 border-slate-400/40',
          btn: 'from-slate-200 to-slate-400 text-slate-950 font-bold'
        };
      case 'mars':
        return {
          border: 'border-orange-500/50',
          badge: 'bg-orange-500/20 text-orange-300 border-orange-400/40',
          btn: 'from-orange-600 to-amber-600 text-white'
        };
      case 'jupiter':
        return {
          border: 'border-amber-500/50',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
          btn: 'from-amber-600 to-orange-600 text-white'
        };
      case 'saturn':
        return {
          border: 'border-yellow-400/50',
          badge: 'bg-yellow-500/20 text-yellow-200 border-yellow-400/40',
          btn: 'from-yellow-500 to-amber-500 text-slate-950 font-bold'
        };
      case 'uranus':
        return {
          border: 'border-cyan-400/50',
          badge: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/40',
          btn: 'from-cyan-500 to-sky-500 text-slate-950 font-bold'
        };
      case 'neptune':
        return {
          border: 'border-blue-400/50',
          badge: 'bg-blue-500/20 text-blue-200 border-blue-400/40',
          btn: 'from-blue-500 to-indigo-600 text-white'
        };
      case 'sun':
      default:
        return {
          border: 'border-amber-500/50',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
          btn: 'from-amber-500 to-yellow-500 text-slate-950 font-bold'
        };
    }
  };

  const theme = getPlanetTheme(selectedPlanetId);
  const gRatio = Math.round((config.gravityMss / 9.81) * 100) / 100;
  const weight30Kg = Math.round(((30 * config.gravityMss) / 9.81) * 10) / 10;
  const isLandable =
    selectedPlanetId === 'moon' || selectedPlanetId === 'mars' || selectedPlanetId === 'earth';

  const getFlybyNotice = (id: PlanetId) => {
    if (id === 'sun') return 'Solar Corona (5,500°C) — Robotic Parker Solar Probe Study Only';
    if (id === 'mercury') return 'Extreme +430°C / -180°C Cratered World — Orbiter Survey Only';
    if (id === 'venus') return 'Crushing 464°C Acid Clouds — Atmospheric Probe Study Only';
    if (id === 'jupiter' || id === 'saturn') return 'Gas Giant (No Solid Ground) — Study Orbits & Moons Here';
    return 'Deep-Freeze Ice Giant (No Solid Ground) — Orbital Flyby Study Only';
  };

  return (
    <div
      data-testid="universe-planet-inspector"
      className={`absolute right-4 top-20 bottom-20 w-80 sm:w-96 z-30 flex flex-col bg-slate-900/95 border ${theme.border} rounded-2xl shadow-2xl overflow-hidden hud-glow animate-fade-in pointer-events-auto`}
    >
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[10px] font-mono-tech uppercase px-2 py-0.5 rounded border ${theme.badge}`}>
              {config.planetOrder === 0
                ? 'Host Star'
                : config.planetOrder
                ? `Planet #${config.planetOrder} from Sun`
                : 'Earth Natural Satellite'}
            </span>
            {config.moonCount !== undefined && (
              <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {config.moonCount} {config.moonCount === 1 ? 'Moon' : 'Moons'}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white mt-1.5">
            {config.name}
          </h2>
          <p className="text-xs text-slate-400">{config.subtitle}</p>
        </div>

        <button
          aria-label="Close Planet Details"
          onClick={() => {
            soundManager.playPing();
            onClose();
          }}
          className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Planetary Metrics Grid */}
      <div className="p-4 grid grid-cols-2 gap-2.5 bg-slate-950/70 border-b border-slate-800 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
          <div className="text-[10px] font-mono-tech text-slate-400 uppercase flex items-center gap-1">
            <Orbit className="w-3 h-3 text-cyan-400" /> Surface Gravity
          </div>
          <div className="text-sm font-bold font-mono-tech text-white mt-0.5">
            {config.gravityMss} m/s²
          </div>
          <div className="text-[10px] text-cyan-300/90 font-mono">
            {gRatio}x Earth ({weight30Kg} kg for a 30 kg kid!)
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
          <div className="text-[10px] font-mono-tech text-slate-400 uppercase flex items-center gap-1">
            <Thermometer className="w-3 h-3 text-amber-400" /> Avg Temperature
          </div>
          <div className="text-sm font-bold font-mono-tech text-white mt-0.5">
            {config.avgTempCelsius}°C
          </div>
          <div className="text-[10px] text-slate-400">
            {config.distanceFromSunMillionKm.toLocaleString()}M km from Sun
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 col-span-2">
          <div className="text-[10px] font-mono-tech text-slate-400 uppercase flex items-center gap-1 mb-0.5">
            <Layers className="w-3 h-3 text-purple-400" /> Atmospheric Envelope
          </div>
          <div className="text-xs text-slate-300">{config.atmosphere}</div>
        </div>
      </div>

      {/* Description, Kid Comparison & Scientific Value */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs text-slate-300 leading-relaxed">
        <p>{config.description}</p>

        {config.kidComparison && (
          <div className="p-3 rounded-xl bg-cyan-950/45 border border-cyan-500/40 text-[11px]">
            <span className="text-cyan-300 font-mono-tech uppercase font-bold block mb-0.5">
              Explorer Comparison
            </span>
            <span className="text-slate-100">{config.kidComparison}</span>
          </div>
        )}

        <div className="p-3 rounded-xl bg-slate-950/75 border border-slate-800">
          <h4 className="text-[11px] uppercase font-mono-tech text-cyan-400 mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Key Exploration Facts:
          </h4>
          <ul className="space-y-1 text-[11px] text-slate-300">
            {config.quickFacts.map((fact, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-cyan-400 font-bold">•</span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>

        {config.probeHighlight && (
          <div className="p-2.5 rounded-lg bg-amber-950/35 border border-amber-500/35 text-[11px]">
            <span className="text-amber-300 font-mono-tech uppercase block mb-0.5">
              NASA Mission Spotlight:
            </span>
            <span className="text-slate-200">{config.probeHighlight}</span>
          </div>
        )}

        <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px]">
          <span className="text-emerald-400 font-mono-tech uppercase block mb-0.5">
            Scientific Mission Objective:
          </span>
          <span className="text-slate-300">{config.scientificSignificance}</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-slate-950 border-t border-slate-800">
        {isLandable ? (
          <button
            data-testid={`descend-to-${selectedPlanetId}-btn`}
            onClick={handleLaunch}
            className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm bg-gradient-to-r ${theme.btn} shadow-lg active:scale-95 transition`}
          >
            {selectedPlanetId === 'earth' ? <Globe className="w-4 h-4" /> : <Rocket className="w-4 h-4" />}
            <span>
              {selectedPlanetId === 'earth'
                ? 'Shuttle Descent to Earth Space Center'
                : `Shuttle Descent to ${config.name} Surface`}
            </span>
          </button>
        ) : (
          <div className="text-center text-xs text-amber-300 font-mono-tech py-2 px-2 rounded-xl bg-slate-900 border border-amber-500/30">
            {getFlybyNotice(selectedPlanetId)}
          </div>
        )}
      </div>
    </div>
  );
};
