import React from 'react';
import { ExplorerProfile } from '../types';
import {
  Rocket, Orbit, Globe, Compass,
  Sparkles, ChevronRight, HelpCircle
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface TitleScreenProps {
  profile: ExplorerProfile;
  onStartGame: (destination: 'universe' | 'moon' | 'mars' | 'earth') => void;
  onOpenTutorial: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenTutorial
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/92 animate-fade-in select-none">
      <div className="relative w-full max-w-4xl flex flex-col items-center text-center">
        {/* Aerospace Agency Emblem */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 font-mono-tech text-xs uppercase tracking-widest mb-4 shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> NASA Space Apps Challenge • Official Expedition
        </div>

        {/* Title Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white mb-2 leading-none">
          TEAM XTREAM
        </h1>
        <div className="text-base sm:text-xl lg:text-2xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300 mb-4 tracking-wider uppercase">
          ON ITS MISSION TO NASA SPACE APPS CHALLENGE
        </div>

        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mb-8 leading-relaxed">
          Embark on a scientifically grounded 3D educational odyssey. Pilot the Space Shuttle between Earth, the Moon, and Mars with authentic planetary physics and zero-buffer 60 FPS performance.
        </p>

        {/* Embark Launch Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full max-w-5xl mb-8">
          {/* Option 1: Solar System */}
          <div
            onClick={() => {
              soundManager.playPing();
              onStartGame('universe');
            }}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 hover:border-cyan-400 hover:bg-slate-800 cursor-pointer transition flex flex-col justify-between text-left group hud-glow"
          >
            <div>
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 w-fit mb-3">
                <Orbit className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold font-display text-white group-hover:text-cyan-300 transition">
                Interactive Universe
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Survey the Sun, Mercury, Venus, Earth, Moon, and Mars in clean solar orbit.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-cyan-400">
              <span>Enter Orbit</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Option 2: Earth Space Center (Primary Start CTA) */}
          <div
            data-start="true"
            onClick={() => {
              soundManager.playPing();
              onStartGame('earth');
            }}
            className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/50 hover:border-emerald-400 hover:bg-slate-800 cursor-pointer transition flex flex-col justify-between text-left group hud-glow"
          >
            <div>
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 w-fit mb-3">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold font-display text-white group-hover:text-emerald-300 transition">
                Earth Space Center
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Kennedy Space Center Pad 39A. Board the Space Shuttle to Moon or Mars, 9.81 m/s² gravity.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-emerald-400">
              <span>Launch Base</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Option 3: Moon Descent */}
          <div
            onClick={() => {
              soundManager.playPing();
              onStartGame('moon');
            }}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 hover:border-slate-300 hover:bg-slate-800 cursor-pointer transition flex flex-col justify-between text-left group hud-glow"
          >
            <div>
              <div className="p-2.5 rounded-xl bg-slate-400/20 text-slate-200 w-fit mb-3">
                <Rocket className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold font-display text-white group-hover:text-slate-200 transition">
                Moon Surface Walk
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Land at Artemis Base. Experience 1/6th gravity, Apollo 11, and crater cold traps.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-200">
              <span>Land on Moon</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Option 4: Mars Descent */}
          <div
            onClick={() => {
              soundManager.playPing();
              onStartGame('mars');
            }}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 hover:border-orange-500 hover:bg-slate-800 cursor-pointer transition flex flex-col justify-between text-left group hud-glow"
          >
            <div>
              <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400 w-fit mb-3">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold font-display text-white group-hover:text-orange-300 transition">
                Mars Jezero Crater
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Explore Martian 3.71 m/s² gravity, rendezvous with Perseverance, and ancient river deltas.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-orange-400">
              <span>Land on Mars</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>

        {/* Exploration Status Bar & Flight Controls Guide */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full max-w-2xl text-xs text-slate-300 bg-slate-900 p-3 sm:p-4 rounded-2xl border border-cyan-500/30 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl border border-cyan-400 bg-gradient-to-br from-cyan-950 to-slate-900 shrink-0 shadow-lg flex items-center justify-center text-cyan-400">
              <Rocket className="w-6 h-6 animate-bounce-subtle" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-wider">
                TEAM XTREAM EXPEDITION
              </div>
              <div className="text-white font-bold text-sm">NASA Space Apps Specialist</div>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playPing();
              onOpenTutorial();
            }}
            className="flex items-center gap-2.5 text-white font-bold transition bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-5 py-2.5 rounded-xl border border-cyan-300 shadow-lg text-sm group"
          >
            <HelpCircle className="w-4 h-4 text-cyan-200 group-hover:scale-110 transition-transform" />
            <span>Flight Controls Guide</span>
          </button>
        </div>
      </div>
    </div>
  );
};
