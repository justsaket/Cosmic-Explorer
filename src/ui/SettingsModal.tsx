import React from 'react';
import { GameSettings } from '../types';
import {
  Settings,
  Volume2,
  VolumeX,
  Monitor,
  BookOpen,
  X,
  ShieldAlert,
  Sparkles,
  Music
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { narrationManager } from '../narration/narrationManager';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onResetData: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetData,
  onClose
}) => {
  const handleVolumeChange = (
    field: 'masterVolume' | 'sfxVolume' | 'musicVolume' | 'narrationVolume',
    val: number
  ) => {
    const nextAudio = {
      ...settings.audio,
      [field]: val,
      ...(field === 'musicVolume' ? { ambienceVolume: val } : {})
    };
    const updated: GameSettings = {
      ...settings,
      audio: nextAudio
    };
    onUpdateSettings(updated);
    soundManager.setVolumes(
      nextAudio.masterVolume,
      nextAudio.sfxVolume,
      nextAudio.musicVolume,
      nextAudio.muted,
      nextAudio.narrationVolume,
      nextAudio.narrationMuted
    );
    if (field === 'narrationVolume') {
      narrationManager.setVolume(val * nextAudio.masterVolume);
    }
  };

  const handleToggleNarrationMute = (muted: boolean) => {
    const updated: GameSettings = {
      ...settings,
      audio: {
        ...settings.audio,
        narrationMuted: muted
      }
    };
    onUpdateSettings(updated);
    narrationManager.setMuted(muted);
  };

  const handleGraphicsQuality = (quality: 'low' | 'balanced' | 'high') => {
    soundManager.playPing();
    onUpdateSettings({
      ...settings,
      graphics: {
        ...settings.graphics,
        quality,
        shadows: quality !== 'low',
        antialias: quality === 'high'
      }
    });
  };

  return (
    <div
      data-testid="settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 animate-fade-in"
    >
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden hud-glow">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-cyan-400 border border-slate-700">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-white">
                Explorer Systems &amp; Settings
              </h2>
              <p className="text-xs text-slate-400">
                4-channel audio mixer, storyteller captions, and graphics profiles
              </p>
            </div>
          </div>

          <button
            aria-label="Close Settings"
            onClick={() => {
              soundManager.playPing();
              onClose();
            }}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* 4-CHANNEL AUDIO MIXER & FEMALE STORYTELLER */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-mono-tech tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4" /> Audio Channels &amp; Female Storyteller
            </h3>

            {/* 1. Master Volume */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300">
                <label htmlFor="slider-master-vol">Overall Master Volume</label>
                <span className="font-mono-tech">
                  {Math.round(settings.audio.masterVolume * 100)}%
                </span>
              </div>
              <input
                id="slider-master-vol"
                data-testid="slider-master-volume"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.audio.masterVolume}
                onChange={e => handleVolumeChange('masterVolume', parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* 2. Spacecraft SFX Volume */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300">
                <label htmlFor="slider-sfx-vol">
                  Spacecraft SFX (Engines, RCS Thrusters, Footsteps)
                </label>
                <span className="font-mono-tech">
                  {Math.round(settings.audio.sfxVolume * 100)}%
                </span>
              </div>
              <input
                id="slider-sfx-vol"
                data-testid="slider-sfx-volume"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.audio.sfxVolume}
                onChange={e => handleVolumeChange('sfxVolume', parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* 3. Background Music & Ambience Volume */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300">
                <label htmlFor="slider-music-vol" className="flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-purple-300" />
                  Background Music &amp; Planetary Ambience
                </label>
                <span className="font-mono-tech">
                  {Math.round(settings.audio.musicVolume * 100)}%
                </span>
              </div>
              <input
                id="slider-music-vol"
                data-testid="slider-music-volume"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.audio.musicVolume}
                onChange={e => handleVolumeChange('musicVolume', parseFloat(e.target.value))}
                className="w-full accent-purple-400"
              />
            </div>

            {/* 4. Female Storyteller Narration Volume */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-300">
                <label htmlFor="slider-narration-vol" className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Female Storyteller Narration Voice
                </label>
                <span className="font-mono-tech">
                  {Math.round(settings.audio.narrationVolume * 100)}%
                </span>
              </div>
              <input
                id="slider-narration-vol"
                data-testid="slider-narration-volume"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.audio.narrationVolume}
                onChange={e => handleVolumeChange('narrationVolume', parseFloat(e.target.value))}
                className="w-full accent-amber-400"
              />
            </div>

            {/* Narration-Only Mute Toggle (Captions Remain Active) */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-white font-semibold flex items-center gap-1.5">
                    {settings.audio.narrationMuted ? (
                      <VolumeX className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-cyan-400" />
                    )}
                    Mute Storyteller Voice (Keep HUD Captions On)
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Silences spoken narration independently while spacecraft SFX, music, and synchronized captions continue uninterrupted.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.audio.narrationMuted}
                  aria-label="Toggle Female Storyteller Voice Mute"
                  data-testid="toggle-narration-mute"
                  onClick={() => handleToggleNarrationMute(!settings.audio.narrationMuted)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition shrink-0 ${
                    settings.audio.narrationMuted
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                  }`}
                >
                  {settings.audio.narrationMuted ? 'VOICE MUTED' : 'VOICE ACTIVE'}
                </button>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400">
                  Warm, expressive English female storyteller with automatic flight audio ducking.
                </span>
                <button
                  type="button"
                  data-testid="test-storyteller-btn"
                  onClick={() => {
                    narrationManager.speak(
                      'Welcome aboard, Explorer! Engines are warmed, captions are synced, and the stars are wide open for our next story.',
                      { priority: 'high' }
                    );
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 text-xs font-medium border border-cyan-500/40 transition shrink-0"
                >
                  Test Storyteller Voice
                </button>
              </div>
            </div>
          </div>

          {/* GRAPHICS SECTION */}
          <div className="space-y-3.5 pt-4 border-t border-slate-800">
            <h3 className="text-xs uppercase font-mono-tech tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Monitor className="w-4 h-4" /> 3D Rendering &amp; Display Profile
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {(['low', 'balanced', 'high'] as const).map(q => (
                <button
                  key={q}
                  onClick={() => handleGraphicsQuality(q)}
                  className={`p-2.5 rounded-xl text-xs font-medium border text-center capitalize transition ${
                    settings.graphics.quality === q
                      ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold hud-glow'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {q}
                  <div className="text-[10px] text-slate-500 font-normal">
                    {q === 'low'
                      ? 'Fast performance'
                      : q === 'balanced'
                      ? 'Standard 60fps'
                      : 'Crisp shadows & PBR'}
                  </div>
                </button>
              ))}
            </div>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800 cursor-pointer">
              <span className="text-xs text-slate-300">
                Reduced Motion (Limits camera zoom transitions)
              </span>
              <input
                type="checkbox"
                checked={settings.graphics.reducedMotion}
                onChange={e =>
                  onUpdateSettings({
                    ...settings,
                    graphics: { ...settings.graphics, reducedMotion: e.target.checked }
                  })
                }
                className="w-4 h-4 accent-cyan-400"
              />
            </label>
          </div>

          {/* EDUCATIONAL COMPLEXITY */}
          <div className="space-y-3.5 pt-4 border-t border-slate-800">
            <h3 className="text-xs uppercase font-mono-tech tracking-wider text-cyan-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Educational Mode
            </h3>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800 cursor-pointer">
              <div>
                <div className="text-xs text-white font-medium">
                  Default to Planetary Scientist Deep Dive
                </div>
                <div className="text-[11px] text-slate-400">
                  Shows in-depth geochemical mineralogy and orbital physics by default
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.detailedScienceMode}
                onChange={e =>
                  onUpdateSettings({
                    ...settings,
                    detailedScienceMode: e.target.checked
                  })
                }
                className="w-4 h-4 accent-cyan-400"
              />
            </label>
          </div>

          {/* DATA RESET */}
          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-rose-400 font-semibold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Reset Local Flight Data
                </div>
                <div className="text-[11px] text-slate-500">
                  Clears saved samples, mission progress, and quiz scores
                </div>
              </div>

              <button
                onClick={() => {
                  onResetData();
                }}
                className="py-1.5 px-3 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-medium transition"
              >
                Reset Progress
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950/90 border-t border-slate-800 text-center text-xs text-slate-400 font-mono">
          Team Xtream on its Mission to NASA Space Apps Challenge • Production 4K Edition
        </div>
      </div>
    </div>
  );
};
