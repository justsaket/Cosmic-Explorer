import React, { useState, useEffect, useRef } from 'react';
import { 
  Orbit, Play, RotateCcw, X, Sparkles, 
  BarChart3, Scale, Clock, ArrowUp 
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface GravityLabModalProps {
  onClose: () => void;
}

export const GravityLabModal: React.FC<GravityLabModalProps> = ({ onClose }) => {
  const [takeoffSpeed, setTakeoffSpeed] = useState(3.5); // m/s
  const [astronautMass, setAstronautMass] = useState(120); // kg (suit + body)
  const [isSimulating, setIsSimulating] = useState(false);
  const [simTime, setSimTime] = useState(0);

  // Exact gravitational accelerations
  const planets = [
    {
      id: 'earth',
      name: 'Earth',
      gravity: 9.81,
      color: '#38bdf8',
      desc: '1.0g Standard Terrestrial Baseline'
    },
    {
      id: 'moon',
      name: 'The Moon',
      gravity: 1.62,
      color: '#e2e8f0',
      desc: '0.166g (1/6th of Earth gravity)'
    },
    {
      id: 'mars',
      name: 'Mars',
      gravity: 3.71,
      color: '#f97316',
      desc: '0.38g (38% of Earth gravity)'
    }
  ];

  // Mathematical outputs
  const calculations = planets.map(p => {
    const peakHeight = (takeoffSpeed * takeoffSpeed) / (2 * p.gravity);
    const totalHangTime = (2 * takeoffSpeed) / p.gravity;
    const apparentWeightN = astronautMass * p.gravity;
    return {
      ...p,
      peakHeight: peakHeight.toFixed(2),
      totalHangTime: totalHangTime.toFixed(2),
      apparentWeightN: apparentWeightN.toFixed(1),
      apparentWeightKg: (apparentWeightN / 9.81).toFixed(1)
    };
  });

  // Animation ticker for jump simulation
  useEffect(() => {
    if (!isSimulating) return;
    let animId: number;
    let last = performance.now();

    const tick = (now: number) => {
      const delta = (now - last) / 1000;
      last = now;

      setSimTime(prev => {
        const next = prev + delta;
        // Max hang time is Moon's hang time
        const maxMoonHang = (2 * takeoffSpeed) / 1.62;
        if (next >= maxMoonHang + 0.5) {
          setIsSimulating(false);
          return 0;
        }
        return next;
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isSimulating, takeoffSpeed]);

  const handleStartSim = () => {
    soundManager.playJump();
    setSimTime(0);
    setIsSimulating(true);
  };

  const handleResetSim = () => {
    soundManager.playPing();
    setIsSimulating(false);
    setSimTime(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900/95 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden hud-glow">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-white">
                Planetary Gravitational Mechanics Laboratory
              </h2>
              <p className="text-xs text-slate-400">
                Comparative Physics Simulation: Earth (9.81 m/s²) vs Moon (1.62 m/s²) vs Mars (3.71 m/s²)
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Simulation Viewport & Animated Leap Stage */}
          <div className="relative h-64 sm:h-72 rounded-2xl bg-slate-950/90 border border-slate-800 p-4 flex flex-col justify-between overflow-hidden">
            
            {/* Height meter scale grid */}
            <div className="absolute inset-x-4 top-4 bottom-12 flex flex-col justify-between pointer-events-none opacity-20 border-l border-dashed border-cyan-400">
              {[4, 3, 2, 1, 0].map(h => (
                <div key={h} className="w-full flex items-center gap-2 text-[10px] font-mono text-cyan-300">
                  <span className="w-6">{h}m</span>
                  <div className="flex-1 border-b border-slate-700" />
                </div>
              ))}
            </div>

            {/* Astronaut Jump Tracks */}
            <div className="relative flex-1 grid grid-cols-3 gap-4 items-end pb-2">
              {calculations.map(calc => {
                const g = calc.gravity;
                const v0 = takeoffSpeed;
                const hang = (2 * v0) / g;
                
                // Current height: y(t) = v0*t - 0.5*g*t^2 clamped >= 0
                let currentY = 0;
                if (simTime > 0 && simTime <= hang) {
                  currentY = Math.max(0, v0 * simTime - 0.5 * g * simTime * simTime);
                }

                // Scale max height 4.5m to container height percentage
                const heightPercent = Math.min(92, (currentY / 4.2) * 100);

                return (
                  <div key={calc.id} className="relative flex flex-col items-center h-full justify-end">
                    
                    {/* Floating Height Indicator */}
                    {simTime > 0 && currentY > 0.05 && (
                      <div 
                        className="absolute text-[11px] font-mono-tech font-bold px-1.5 py-0.5 rounded bg-slate-900 border text-white shadow-lg pointer-events-none transition-all duration-75"
                        style={{ 
                          bottom: `calc(${heightPercent}% + 56px)`,
                          borderColor: calc.color,
                          color: calc.color
                        }}
                      >
                        {currentY.toFixed(2)}m
                      </div>
                    )}

                    {/* Animated Astronaut Silhouette */}
                    <div
                      className="w-12 h-14 rounded-xl flex items-center justify-center font-bold text-xs shadow-2xl transition-all duration-75 border-2"
                      style={{
                        transform: `translateY(-${heightPercent * 1.8}px)`,
                        backgroundColor: `${calc.color}20`,
                        borderColor: calc.color,
                        color: calc.color
                      }}
                    >
                      <ArrowUp className="w-6 h-6 animate-pulse" />
                    </div>

                    {/* Ground Pad */}
                    <div 
                      className="w-full h-2 rounded-full mt-2" 
                      style={{ backgroundColor: calc.color }}
                    />

                    {/* Label */}
                    <div className="text-center mt-2">
                      <div className="text-xs font-bold font-display" style={{ color: calc.color }}>
                        {calc.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        g = {calc.gravity} m/s²
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Timer readout */}
            <div className="flex items-center justify-between text-xs font-mono-tech text-slate-400 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Elapsed Airtime: <strong>{simTime.toFixed(2)}s</strong></span>
              </div>
              <div className="text-[11px] text-slate-500">
                Equations: h = v₀² / 2g • t = 2v₀ / g
              </div>
            </div>
          </div>

          {/* Controls & Variables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            {/* Takeoff Velocity Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span className="font-semibold text-white">Initial Jump Velocity (v₀)</span>
                <span className="font-mono-tech text-cyan-400">{takeoffSpeed.toFixed(1)} m/s</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="5.5"
                step="0.1"
                value={takeoffSpeed}
                onChange={(e) => {
                  setTakeoffSpeed(parseFloat(e.target.value));
                  setIsSimulating(false);
                  setSimTime(0);
                }}
                className="w-full accent-cyan-400"
              />
              <div className="text-[11px] text-slate-500">
                Standard human muscular takeoff push: ~2.8 to 4.2 m/s
              </div>
            </div>

            {/* Astronaut Mass Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span className="font-semibold text-white">Astronaut + Extravehicular Suit Mass</span>
                <span className="font-mono-tech text-cyan-400">{astronautMass} kg</span>
              </div>
              <input
                type="range"
                min="70"
                max="180"
                step="5"
                value={astronautMass}
                onChange={(e) => setAstronautMass(parseInt(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <div className="text-[11px] text-slate-500">
                Apollo A7L spacesuit: ~35 kg • Artemis xEMU suit: ~55 kg
              </div>
            </div>
          </div>

          {/* Scientific Output Metrics Table */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {calculations.map(calc => (
              <div 
                key={calc.id} 
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-display text-white">{calc.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                    {calc.gravity} m/s²
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Peak Jump Height:</span>
                    <strong className="font-mono" style={{ color: calc.color }}>{calc.peakHeight} m</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Airtime:</span>
                    <strong className="font-mono text-white">{calc.totalHangTime} s</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800 text-[11px]">
                    <span className="text-slate-500">Apparent Weight:</span>
                    <span className="font-mono text-slate-300">{calc.apparentWeightKg} kg ({calc.apparentWeightN} N)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Observation: On the Moon, an astronaut stays airborne for over <strong>4 seconds</strong> per leap!
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetSim}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              title="Reset simulation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleStartSim}
              className="flex items-center gap-2 py-2 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm transition shadow-lg"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isSimulating ? 'Simulating Jump...' : 'Simulate Simultaneous Jump'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
