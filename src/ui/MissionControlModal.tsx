import React, { useState } from 'react';
import { ExplorerProfile, PlanetId } from '../types';
import { 
  Building2, User, Award, Rocket, Compass, 
  Sparkles, Check, X, Shield, Activity, Edit3 
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface MissionControlModalProps {
  profile: ExplorerProfile;
  onUpdateProfile: (profile: ExplorerProfile) => void;
  onSelectDestination: (planetId: PlanetId) => void;
  onOpenTutorial: () => void;
  onClose: () => void;
}

export const MissionControlModal: React.FC<MissionControlModalProps> = ({
  profile,
  onUpdateProfile,
  onSelectDestination,
  onOpenTutorial,
  onClose
}) => {
  const [isEditingCallsign, setIsEditingCallsign] = useState(false);
  const [callsignInput, setCallsignInput] = useState(profile.callsign);

  const handleSaveCallsign = () => {
    if (!callsignInput.trim()) return;
    soundManager.playPing();
    onUpdateProfile({
      ...profile,
      callsign: callsignInput.trim()
    });
    setIsEditingCallsign(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900/95 border border-blue-500/40 rounded-2xl shadow-2xl overflow-hidden hud-glow">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-white">
                Earth Mission Control Center
              </h2>
              <p className="text-xs text-slate-400">
                Houston Flight Operations • Planetary Exploration Division
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
          
          {/* Astronaut ID Badge & Stats */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-950/90 to-blue-950/40 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-cyan-400 shrink-0 shadow-lg hud-glow bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center">
                <svg className="w-11 h-11 text-cyan-400" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="24" cy="22" r="14" strokeOpacity="0.6" />
                  <path d="M14 22 C14 15, 34 15, 34 22 C34 28, 14 28, 14 22 Z" fill="rgba(56, 189, 248, 0.45)" stroke="#38bdf8" />
                  <path d="M12 36 L12 42 L36 42 L36 36" strokeOpacity="0.4" />
                  <circle cx="24" cy="22" r="2" fill="#38bdf8" />
                </svg>
                <div className="absolute bottom-0 inset-x-0 bg-cyan-950/90 text-[8px] font-mono text-center py-0.5 text-cyan-300 font-bold">
                  TEAM XTREAM
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  {isEditingCallsign ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={callsignInput}
                        onChange={(e) => setCallsignInput(e.target.value)}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-cyan-400 text-sm font-bold text-white focus:outline-none"
                        maxLength={24}
                      />
                      <button
                        onClick={handleSaveCallsign}
                        className="p-1 rounded bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white font-display">
                        {profile.callsign}
                      </h3>
                      <button
                        onClick={() => setIsEditingCallsign(true)}
                        className="text-slate-400 hover:text-cyan-400"
                        title="Edit Callsign"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-xs text-cyan-400 font-mono-tech mt-0.5">
                  RANK: {profile.rank.toUpperCase()}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Registered: {new Date(profile.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Flight Metrics */}
            <div className="grid grid-cols-3 gap-3 w-full sm:w-auto text-center font-mono-tech">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400">EXP POINTS</div>
                <div className="text-sm font-bold text-amber-400">{profile.totalPoints}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400">DISTANCE</div>
                <div className="text-sm font-bold text-cyan-400">{Math.round(profile.metersTraveled)}m</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-[10px] text-slate-400">LEAPS</div>
                <div className="text-sm font-bold text-purple-400">{profile.jumpsPerformed}</div>
              </div>
            </div>
          </div>

          {/* Astronaut Suit & Advanced Hiding Features */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs uppercase font-mono-tech tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-cyan-400" /> Astronaut Suit & Stealth Hiding System:
              </h4>
              <span className="text-[10px] font-mono-tech text-emerald-400">
                {profile.cloakActive ? 'STEALTH CLOAK: ACTIVE' : 'NOMINAL FLIGHT MODE'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              {/* Mode 1: Gold Mirror */}
              <button
                onClick={() => {
                  soundManager.playPing();
                  onUpdateProfile({ ...profile, visorMode: 'gold_mirror' });
                }}
                className={`p-3 rounded-xl border text-left transition ${
                  profile.visorMode === 'gold_mirror'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 ring-1 ring-amber-400'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-sm mb-1 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-400" /> 24K Gold Mirror
                </div>
                <div className="text-[11px] text-slate-400">
                  Maximum identity concealment and solar radiation flash deflection. Face is 100% hidden.
                </div>
              </button>

              {/* Mode 2: Clear Visor */}
              <button
                onClick={() => {
                  soundManager.playPing();
                  onUpdateProfile({ ...profile, visorMode: 'clear_face' });
                }}
                className={`p-3 rounded-xl border text-left transition ${
                  profile.visorMode === 'clear_face'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-sm mb-1 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-400" /> Clear Visor (Face)
                </div>
                <div className="text-[11px] text-slate-400">
                  Sapphire crystal visor reveals astronaut face with soft in-helmet cockpit illumination.
                </div>
              </button>

              {/* Mode 3: Tactical HUD */}
              <button
                onClick={() => {
                  soundManager.playPing();
                  onUpdateProfile({ ...profile, visorMode: 'hud_display' });
                }}
                className={`p-3 rounded-xl border text-left transition ${
                  profile.visorMode === 'hud_display'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-sm mb-1 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-cyan-400" /> Tactical HUD Visor
                </div>
                <div className="text-[11px] text-slate-400">
                  Collimated holographic targeting reticle, artificial horizon, and navigation telemetry.
                </div>
              </button>
            </div>

            {/* Chameleon Cloak Toggle */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <div className="text-[11px] text-slate-300">
                <span className="font-bold text-white">Chameleon Regolith Camouflage Cloak:</span> Dynamic metamaterial adapts suit weave to match Moon basalt, Mars dust, or Earth ground.
              </div>
              <button
                onClick={() => {
                  soundManager.playPing();
                  onUpdateProfile({ ...profile, cloakActive: !profile.cloakActive });
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech font-bold transition shrink-0 ml-3 ${
                  profile.cloakActive
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {profile.cloakActive ? 'Disengage Cloak [C]' : 'Engage Cloak [C]'}
              </button>
            </div>
          </div>

          {/* Quick Flight Departure Hangar */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-mono-tech tracking-wider text-slate-400 flex items-center gap-1.5">
              <Rocket className="w-4 h-4 text-cyan-400" /> Active Planetary Expeditions:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Earth Space Center */}
              <div
                onClick={() => {
                  soundManager.playPing();
                  onSelectDestination('earth');
                  onClose();
                }}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-emerald-400 hover:bg-slate-900/60 cursor-pointer transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono-tech uppercase text-emerald-300">Earth (KSC)</span>
                    <span className="text-[11px] font-mono-tech text-emerald-400">9.81 m/s²</span>
                  </div>
                  <h5 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                    Launch Pad 39B & DSN
                  </h5>
                  <p className="text-xs text-slate-400 mt-1">
                    Artemis SLS rocket, gantry launch tower, Mission Control Center, and Deep Space Network dish.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-emerald-400">
                  <span>Enter Space Center</span>
                  <Rocket className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>

              {/* Moon Expedition */}
              <div
                onClick={() => {
                  soundManager.playPing();
                  onSelectDestination('moon');
                  onClose();
                }}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-400 hover:bg-slate-900/60 cursor-pointer transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono-tech uppercase text-slate-300">The Moon (Artemis)</span>
                    <span className="text-[11px] font-mono-tech text-cyan-400">1.62 m/s²</span>
                  </div>
                  <h5 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                    Mare Tranquillitatis & South Pole
                  </h5>
                  <p className="text-xs text-slate-400 mt-1">
                    Examine Apollo 11 relics, laser retroreflectors, and cryogenic water ice reserves.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-cyan-400">
                  <span>Launch to Lunar Surface</span>
                  <Rocket className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>

              {/* Mars Expedition */}
              <div
                onClick={() => {
                  soundManager.playPing();
                  onSelectDestination('mars');
                  onClose();
                }}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-orange-500 hover:bg-slate-900/60 cursor-pointer transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono-tech uppercase text-orange-400">Mars (Jezero Crater)</span>
                    <span className="text-[11px] font-mono-tech text-orange-400">3.71 m/s²</span>
                  </div>
                  <h5 className="text-sm font-bold text-white group-hover:text-orange-300 transition">
                    Ancient Lakebed & River Delta
                  </h5>
                  <p className="text-xs text-slate-400 mt-1">
                    Rendezvous with Perseverance, survey titanium sample tubes, and investigate ancient rivers.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-orange-400">
                  <span>Launch to Martian Surface</span>
                  <Rocket className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 gap-3">
            <div className="text-xs text-slate-300">
              Need a refresher on astronaut spacesuit mobility and scientific controls?
            </div>
            <button
              onClick={() => {
                soundManager.playPing();
                onOpenTutorial();
              }}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium transition shrink-0"
            >
              Open Controls Guide
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={() => {
              soundManager.playPing();
              onClose();
            }}
            className="py-2 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm transition"
          >
            Return to Orbital View
          </button>
        </div>

      </div>
    </div>
  );
};
