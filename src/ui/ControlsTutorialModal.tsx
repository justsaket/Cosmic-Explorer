import React from 'react';
import { 
  Gamepad2, Move, Space, MousePointer, 
  Sparkles, Check, X, Eye, Car, Crosshair, 
  Map, BookOpen, Scale, Volume2, Shield
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface ControlsTutorialModalProps {
  onClose: () => void;
}

export const ControlsTutorialModal: React.FC<ControlsTutorialModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 animate-fade-in select-none">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-cyan-400/60 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/60 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-lg">
              <Gamepad2 className="w-8 h-8" />
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold mb-0.5">
                NASA SPACE APPS CHALLENGE • EXPEDITION FLIGHT MANUAL
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
                Astronaut Flight Control Guide
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playPing();
              onClose();
            }}
            className="p-2.5 rounded-xl bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 transition"
            title="Close guide"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-4 text-slate-200">
          
          {/* Quick Keymap Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* 1. Walk & Traverse */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex items-start gap-4 shadow-md">
              <div className="p-3 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shrink-0">
                <Move className="w-6 h-6" />
              </div>
              <div>
                <div className="text-base font-bold text-white mb-1">Ground Mobility</div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="px-2 py-1 bg-slate-800 rounded-lg border border-cyan-400/40 text-cyan-300 font-mono text-xs font-bold">W</span>
                  <span className="px-2 py-1 bg-slate-800 rounded-lg border border-cyan-400/40 text-cyan-300 font-mono text-xs font-bold">A</span>
                  <span className="px-2 py-1 bg-slate-800 rounded-lg border border-cyan-400/40 text-cyan-300 font-mono text-xs font-bold">S</span>
                  <span className="px-2 py-1 bg-slate-800 rounded-lg border border-cyan-400/40 text-cyan-300 font-mono text-xs font-bold">D</span>
                  <span className="text-xs text-slate-400 ml-1">or Arrows</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Smooth omnidirectional stride across lunar, martian, and terrestrial terrain. Hold <span className="text-cyan-300 font-mono">SHIFT</span> to sprint.
                </p>
              </div>
            </div>

            {/* 2. Jump & Jetpack */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex items-start gap-4 shadow-md">
              <div className="p-3 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                <Space className="w-6 h-6" />
              </div>
              <div>
                <div className="text-base font-bold text-white mb-1">Low-Gravity Leap &amp; Jetpack</div>
                <div className="mb-2">
                  <span className="px-3 py-1 bg-slate-800 rounded-lg border border-amber-400/40 text-amber-300 font-mono text-xs font-bold">
                    SPACEBAR
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Tap to leap with realistic gravity: 1.62 m/s² on Moon, 3.71 m/s² on Mars. Hold Spacebar in mid-air to engage the EVA jetpack assist.
                </p>
              </div>
            </div>

            {/* 3. Camera POV & Shuttle View Toggle */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30 flex items-start gap-4 shadow-md">
              <div className="p-3 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30 shrink-0">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <div className="text-base font-bold text-white mb-1">Dual-Camera &amp; PiP Views</div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className="px-2 py-0.5 bg-slate-800 rounded-lg border border-purple-400/40 text-purple-300 font-mono text-xs font-bold">
                    C / V
                  </span>
                  <span className="px-2 py-0.5 bg-slate-800 rounded-lg border border-cyan-400/40 text-cyan-300 font-mono text-xs font-bold">
                    1: Cockpit • 2: External • P: PiP
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  On foot: [V] toggles POV. Inside Shuttle: [C]/[1]/[2] switches First-Person Cockpit and External Chase cameras live; [P] toggles Picture-in-Picture.
                </p>
              </div>
            </div>

            {/* 4. Planetary Rover */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 flex items-start gap-4 shadow-md">
              <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <div className="text-base font-bold text-white mb-1">6-Wheel Rover &amp; Dust Plumes</div>
                <div className="mb-2">
                  <span className="px-2.5 py-1 bg-slate-800 rounded-lg border border-emerald-400/40 text-emerald-300 font-mono text-xs font-bold">
                    R KEY
                  </span>
                  <span className="text-xs text-slate-400 ml-2">or HUD ROVER Button</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Mount and drive the high-speed 6-wheel planetary rover with surface-specific regolith particle dust plumes.
                </p>
              </div>
            </div>

            {/* 5. Space Shuttle Boarding & Discoveries */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 flex items-start gap-4 shadow-md">
              <div className="p-3 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shrink-0">
                <Volume2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-base font-bold text-white mb-1">Space Shuttle &amp; Inspect</div>
                <div className="mb-2">
                  <span className="px-2.5 py-1 bg-slate-800 rounded-lg border border-cyan-400/40 text-cyan-300 font-mono text-xs font-bold">
                    E KEY
                  </span>
                  <span className="text-xs text-slate-400 ml-2">Enter/Exit Shuttle or Inspect</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Approach the Space Shuttle pad and press E to board the cockpit and fly between Earth, Moon, and Mars — or inspect discoveries.
                </p>
              </div>
            </div>

            {/* 6. Tools & Laboratory */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-blue-500/30 flex items-start gap-4 shadow-md">
              <div className="p-3 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 shrink-0">
                <Crosshair className="w-6 h-6" />
              </div>
              <div>
                <div className="text-base font-bold text-white mb-1">Scientific Tools & Map</div>
                <div className="flex flex-wrap gap-1.5 mb-2 font-mono text-xs">
                  <span className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-cyan-300">F: Scan</span>
                  <span className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-emerald-300">M: Map</span>
                  <span className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-amber-300">N: Log</span>
                  <span className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-purple-300">G: Gravity</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Analyze subsurface strata, view top-down radar telemetry, review verified NASA mission data, and test gravity drops in real time.
                </p>
              </div>
            </div>

          </div>

          {/* Mouse & Touch Guide */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <MousePointer className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <span className="font-bold text-white">Camera Look & Zoom: </span>
                Click and drag anywhere to orbit 360°. Scroll wheel zooms in/out (3.8m to 16.0m).
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-cyan-400 font-mono text-[11px]">
              <span>60 FPS ZERO-LAG OPTIMIZED</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-400 font-mono">
            TEAM XTREAM • MISSION READY
          </div>
          <button
            onClick={() => {
              soundManager.playPing();
              onClose();
            }}
            className="flex items-center gap-2 py-2.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm transition shadow-lg active:scale-95"
          >
            <Check className="w-4 h-4" /> Got It, Let's Explore!
          </button>
        </div>

      </div>
    </div>
  );
};
