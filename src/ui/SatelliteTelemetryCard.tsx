import React from 'react';
import { NasaSatellite } from '../types';
import { 
  Radio, Rocket, Calendar, Gauge, 
  Layers, Volume2, X, Compass, ExternalLink 
} from 'lucide-react';
import { narrationManager } from '../narration/narrationManager';
import { soundManager } from '../audio/soundManager';

interface SatelliteTelemetryCardProps {
  satellite: NasaSatellite;
  onClose: () => void;
  onAskAi: (sat: NasaSatellite) => void;
}

export const SatelliteTelemetryCard: React.FC<SatelliteTelemetryCardProps> = ({
  satellite,
  onClose,
  onAskAi
}) => {
  const handlePlayVoice = () => {
    soundManager.playPing();
    narrationManager.speak(`${satellite.name}. ${satellite.summary} ${satellite.storyNarrative}`);
  };

  return (
    <div className="absolute top-20 right-4 sm:right-6 w-96 max-w-[92vw] z-40 bg-slate-900/95 border-2 border-cyan-400/70 rounded-3xl shadow-[0_0_40px_rgba(34,211,238,0.3)] backdrop-blur-xl overflow-hidden animate-fade-in select-none">
      
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/60 border-b border-cyan-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[9px] font-mono uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-1.5">
              <span>NASA SATELLITE NETWORK</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <h3 className="text-base font-bold font-display text-white truncate max-w-[210px]">
              {satellite.shortName}
            </h3>
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playPing();
            onClose();
          }}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3.5 text-xs text-slate-200">
        
        {/* Full Official Designation */}
        <div>
          <div className="text-[10px] font-mono text-slate-400 uppercase">OFFICIAL DESIGNATION</div>
          <div className="text-sm font-bold text-cyan-300 font-display">{satellite.name}</div>
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-slate-400 text-[10px] flex items-center gap-1 mb-0.5">
              <Calendar className="w-3 h-3 text-cyan-400" /> LAUNCH
            </div>
            <div className="font-bold text-white truncate">{satellite.launchDate}</div>
            <div className="text-[10px] text-slate-400 truncate">{satellite.launchVehicle}</div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-slate-400 text-[10px] flex items-center gap-1 mb-0.5">
              <Gauge className="w-3 h-3 text-amber-400" /> ALTITUDE / ORBIT
            </div>
            <div className="font-bold text-amber-300 truncate">{satellite.altitudeKm}</div>
            <div className="text-[10px] text-slate-400 truncate">{satellite.velocityKmS}</div>
          </div>
        </div>

        {/* Mission Type & Status */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] font-mono">
          <span className="text-slate-400">STATUS:</span>
          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
            satellite.status === 'ACTIVE' 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
          }`}>
            {satellite.status}
          </span>
        </div>

        {/* Summary Description */}
        <p className="text-slate-300 text-xs leading-relaxed">
          {satellite.summary}
        </p>

        {/* Story Narrative Box */}
        <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-200 text-xs leading-relaxed">
          <div className="text-[9px] font-mono uppercase text-cyan-400 font-bold mb-1">
            MISSION STORYTELLING
          </div>
          "{satellite.storyNarrative}"
        </div>

        {/* Primary Instruments */}
        <div>
          <div className="text-[10px] font-mono text-slate-400 uppercase mb-1.5">
            PRIMARY INSTRUMENT SUITE
          </div>
          <div className="flex flex-wrap gap-1">
            {satellite.instruments.map((inst, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-[10px] font-mono"
              >
                {inst}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Footer Action Buttons */}
      <div className="p-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2">
        <button
          onClick={handlePlayVoice}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition shadow-lg active:scale-95"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Listen Telemetry</span>
        </button>

        <button
          onClick={() => onAskAi(satellite)}
          className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-cyan-400/40 text-cyan-300 font-bold text-xs transition"
        >
          <span>Ask Co-Pilot</span>
        </button>
      </div>

    </div>
  );
};
