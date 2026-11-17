import React, { useState, useRef, useEffect } from 'react';
import { ViewMode, PlanetId, ExplorerProfile, Mission, ScientificDiscovery } from '../types';
import { CELESTIAL_BODIES } from '../planets/planetConfig';
import { AstronautPosture } from '../astronaut/AstronautModel';
import { TelemetryData } from '../scene/WorldCanvas';
import {
  TravelTelemetrySnapshot,
  ShuttleCameraView
} from '../shuttle/shuttleTravelState';
import { MoonWorldRuntimeTelemetry } from '../moonResources/MoonResourceWorldManager';
import { MoonResourceId } from '../moonResources/moonResourceTypes';
import { MarsWorldRuntimeTelemetry } from '../marsResources/MarsResourceWorldManager';
import { MarsAndSpaceResourceId } from '../marsResources/marsResourceTypes';
import {
  Package, Compass, GraduationCap, Settings,
  Rocket, HelpCircle,
  Sparkles, ArrowLeft, Eye,
  Radio, Scale, RotateCcw,
  Map, BookOpen, Crosshair, FastForward,
  Car, Footprints, Armchair, BedDouble, ArrowUp,
  Volume2, VolumeX, Camera, DoorOpen, Play, Pause
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { narrationManager } from '../narration/narrationManager';
import { LandingTelemetry } from '../scene/LandingSequence';

interface HUDProps {
  viewMode: ViewMode;
  currentPlanet: PlanetId;
  profile: ExplorerProfile;
  activeMission?: Mission;
  nearbyDiscovery: ScientificDiscovery | null;
  isCloaked: boolean;
  visorMode: 'gold_mirror' | 'hud_display' | 'clear_face';
  isGeoradarPulsing: boolean;
  landingTelemetry: LandingTelemetry | null;
  sphericalTelemetry?: TelemetryData | null;
  posture: AstronautPosture;
  onPostureChange: (posture: AstronautPosture) => void;
  isDrivingRover: boolean;
  onToggleRover: () => void;
  lightingMode: 'day' | 'sunset' | 'night';
  onLightingModeChange: (mode: 'day' | 'sunset' | 'night') => void;
  onSelectPlanet?: (planetId: PlanetId) => void;
  onTeleportTo: (x: number, z: number, label: string) => void;
  onTeleportToCoords?: (lat: number, lon: number, label?: string) => void;
  onOpenBackpack: () => void;
  onOpenMissions: () => void;
  onOpenQuiz: () => void;
  onOpenMissionControl: () => void;
  onOpenSettings: () => void;
  onOpenTutorial: () => void;
  onOpenGravityLab: () => void;
  onOpenMap: () => void;
  onOpenNotebook: () => void;
  onOpenFrontier: () => void;
  onTriggerScanner: () => void;
  onCollectSample: () => void;
  onToggleVisor: () => void;
  onToggleCloak: () => void;
  onTriggerGeoradar: () => void;
  onInspectNearby: () => void;
  onReturnToSpace: () => void;
  onResetUniverseCamera?: () => void;
  onSkipLanding?: () => void;
  cameraMode?: 'third-person' | 'first-person';
  onToggleCameraMode?: () => void;
  onOpenAiCoPilot?: () => void;
  onTouchMove?: (vector: { x: number; y: number }) => void;
  onTouchJump?: () => void;
  // Interactive Space Shuttle props
  nearShuttle?: boolean;
  shuttleTelemetry?: TravelTelemetrySnapshot | null;
  shuttleCameraView?: ShuttleCameraView;
  isPipEnabled?: boolean;
  onEnterShuttle?: () => void;
  onExitShuttle?: () => void;
  onOpenShuttleDestinations?: () => void;
  onToggleShuttleCameraView?: () => void;
  onSetShuttleCameraView?: (view: ShuttleCameraView) => void;
  onTogglePip?: () => void;
  // Audio mixer & storyteller controls
  isAudioMuted?: boolean;
  isNarrationMuted?: boolean;
  onToggleMasterMute?: () => void;
  onToggleNarrationMute?: () => void;
  onOpenMoonResources?: () => void;
  moonRuntimeTelemetry?: MoonWorldRuntimeTelemetry | null;
  onInspectMoonResource?: (id: MoonResourceId) => void;
  onToggleMoonLrv?: () => void;
  onOpenMarsResources?: () => void;
  marsRuntimeTelemetry?: MarsWorldRuntimeTelemetry | null;
  onInspectMarsResource?: (id: MarsAndSpaceResourceId) => void;
  selectedOrbitPlanet?: PlanetId | null;
  onSelectOrbitPlanet?: (planetId: PlanetId | null) => void;
}

export const HUD: React.FC<HUDProps> = ({
  viewMode,
  currentPlanet,
  profile,
  activeMission,
  nearbyDiscovery,
  landingTelemetry,
  sphericalTelemetry,
  posture,
  onPostureChange,
  isDrivingRover,
  onToggleRover,
  onSelectPlanet,
  onOpenBackpack,
  onOpenMissions,
  onOpenQuiz,
  onOpenSettings,
  onOpenTutorial,
  onOpenGravityLab,
  onOpenMap,
  onOpenNotebook,
  onTriggerScanner,
  onCollectSample,
  onInspectNearby,
  onReturnToSpace,
  onResetUniverseCamera,
  onSkipLanding,
  cameraMode = 'third-person',
  onToggleCameraMode,
  onOpenAiCoPilot,
  onTouchMove,
  onTouchJump,
  nearShuttle = false,
  shuttleTelemetry = null,
  shuttleCameraView = 'cockpit',
  isPipEnabled = true,
  onEnterShuttle,
  onExitShuttle,
  onOpenShuttleDestinations,
  onToggleShuttleCameraView,
  onSetShuttleCameraView,
  onTogglePip,
  isAudioMuted: propAudioMuted,
  isNarrationMuted: propNarrationMuted,
  onToggleMasterMute,
  onToggleNarrationMute,
  onOpenMoonResources,
  moonRuntimeTelemetry = null,
  onInspectMoonResource,
  onToggleMoonLrv,
  onOpenMarsResources,
  marsRuntimeTelemetry = null,
  onInspectMarsResource,
  selectedOrbitPlanet = null,
  onSelectOrbitPlanet
}) => {
  const [liveCaption, setLiveCaption] = useState<string | null>(null);
  const [narrationPaused, setNarrationPaused] = useState(false);
  const [localAudioMuted, setLocalAudioMuted] = useState(false);
  const [localNarrationMuted, setLocalNarrationMuted] = useState(false);

  const isAudioMuted = propAudioMuted ?? localAudioMuted;
  const isNarrationMuted = propNarrationMuted ?? localNarrationMuted;

  // Virtual Joystick Pointer tracking
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const isDraggingJoystickRef = useRef<boolean>(false);
  const [joystickActive, setJoystickActive] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const unsubscribeCaption = narrationManager.subscribeCaption(caption => {
      setLiveCaption(caption);
    });
    const unsubscribeStatus = narrationManager.subscribeStatus(status => {
      setNarrationPaused(status.isPaused);
      setLocalNarrationMuted(status.isMuted);
    });
    return () => {
      unsubscribeCaption();
      unsubscribeStatus();
    };
  }, []);

  const updateJoystickFromEvent = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const maxRadius = rect.width / 2;
    let dx = clientX - centerX;
    let dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    setKnobPos({ x: dx, y: dy });

    if (onTouchMove) {
      onTouchMove({
        x: dx / maxRadius,
        y: dy / maxRadius
      });
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!joystickBaseRef.current) return;
    isDraggingJoystickRef.current = true;
    setJoystickActive(true);
    try {
      joystickBaseRef.current.setPointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
    updateJoystickFromEvent(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingJoystickRef.current) return;
    e.stopPropagation();
    updateJoystickFromEvent(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingJoystickRef.current) return;
    e.stopPropagation();
    isDraggingJoystickRef.current = false;
    if (joystickBaseRef.current) {
      try {
        joystickBaseRef.current.releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
    }
    setJoystickActive(false);
    setKnobPos({ x: 0, y: 0 });
    if (onTouchMove) {
      onTouchMove({ x: 0, y: 0 });
    }
  };

  const handleToggleAudio = () => {
    if (onToggleMasterMute) {
      onToggleMasterMute();
      return;
    }
    const nextMuted = !localAudioMuted;
    setLocalAudioMuted(nextMuted);
    soundManager.setMuted(nextMuted);
    narrationManager.setMasterMuted(nextMuted);
    if (!nextMuted) {
      soundManager.playPing();
    }
  };

  const handleToggleNarrationMute = () => {
    if (onToggleNarrationMute) {
      onToggleNarrationMute();
      return;
    }
    const nextMuted = !localNarrationMuted;
    setLocalNarrationMuted(nextMuted);
    narrationManager.setMuted(nextMuted);
  };

  const currentConfig = CELESTIAL_BODIES[currentPlanet] || CELESTIAL_BODIES.earth;
  const isLanding = landingTelemetry?.isLandingActive ?? false;
  const shuttleState = shuttleTelemetry?.state ?? 'on_foot';
  const isInShuttle = shuttleState !== 'on_foot';
  const isShuttleFlying =
    shuttleState === 'takeoff' ||
    shuttleState === 'space_travel' ||
    shuttleState === 'approach' ||
    shuttleState === 'landing';

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-20 flex flex-col justify-between p-3 sm:p-5 overflow-hidden">
      {/* CINEMATIC LANDING LETTERBOX OVERLAY (Direct Planet Entry) */}
      {isLanding && (
        <div className="absolute inset-0 pointer-events-auto flex flex-col justify-between z-30 animate-fade-in">
          <div className="w-full h-16 sm:h-20 bg-black/95 border-b border-cyan-500/30 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase text-amber-300 tracking-wider">
                  DESCENT &amp; TOUCHDOWN TELEMETRY // {currentPlanet.toUpperCase()}
                </span>
                <span className="text-xs font-bold text-white font-mono">
                  {landingTelemetry?.phase?.toUpperCase() || 'APPROACH'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-slate-300">
                ALTITUDE: <span className="text-cyan-300 font-bold">{landingTelemetry?.altitudeMeters ?? 0}m</span>
              </div>
              <div className="text-slate-300">
                DESCENT RATE: <span className="text-amber-300 font-bold">{landingTelemetry?.descentSpeedMps ?? 0} m/s</span>
              </div>
            </div>

            {onSkipLanding && (
              <button
                onClick={() => {
                  soundManager.playPing();
                  onSkipLanding();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white transition text-xs font-mono"
              >
                <FastForward className="w-3.5 h-3.5 text-amber-400" />
                <span>SKIP [SPACE]</span>
              </button>
            )}
          </div>

          <div className="w-full h-16 sm:h-20 bg-black/95 border-t border-cyan-500/30 flex items-center justify-center px-6 text-xs font-mono text-cyan-300/80">
            <span>TERMINAL DESCENT AUTOPILOT ACTIVE — STANDBY FOR SURFACE CONTACT</span>
          </div>
        </div>
      )}

      {/* SYNCHRONIZED FEMALE STORYTELLER CAPTIONS BANNER */}
      {liveCaption && (
        <div
          data-testid="storyteller-caption-banner"
          className={`absolute left-1/2 -translate-x-1/2 max-w-2xl w-[92%] z-40 pointer-events-auto animate-fade-in ${
            viewMode === 'surface' &&
            !landingTelemetry &&
            (!shuttleTelemetry || shuttleTelemetry.state === 'on_foot')
              ? 'bottom-[152px]'
              : 'top-16 sm:top-20'
          }`}
        >
          <div className="px-4 py-2.5 rounded-2xl bg-slate-950/95 border border-cyan-400/70 shadow-2xl flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 shrink-0">
                <Radio className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="text-[9px] font-mono uppercase tracking-widest text-cyan-400 font-bold flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    MISSION STORYTELLER
                  </span>
                  {(isNarrationMuted || isAudioMuted) && (
                    <span
                      data-testid="caption-muted-badge"
                      className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40"
                    >
                      VOICE MUTED • CAPTIONS ON
                    </span>
                  )}
                </div>
                <p className="text-xs font-sans text-white leading-relaxed line-clamp-3">
                  "{liveCaption}"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                aria-label={narrationPaused ? 'Resume Storyteller' : 'Pause Storyteller'}
                onClick={() => (narrationPaused ? narrationManager.resume() : narrationManager.pause())}
                className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition text-xs"
                title={narrationPaused ? 'Resume narration' : 'Pause narration'}
              >
                {narrationPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                aria-label="Replay Storyteller Line"
                onClick={() => narrationManager.replay()}
                className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition text-xs"
                title="Replay line"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label="Mute Storyteller Voice Only"
                onClick={handleToggleNarrationMute}
                className={`p-1.5 rounded-lg hover:bg-slate-800 transition text-xs ${
                  isNarrationMuted ? 'text-amber-300' : 'text-cyan-300 hover:text-white'
                }`}
                title={isNarrationMuted ? 'Unmute storyteller voice' : 'Mute storyteller voice (captions stay on)'}
              >
                {isNarrationMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                aria-label="Dismiss Storyteller Caption"
                onClick={() => narrationManager.stop()}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition text-xs"
                title="Dismiss caption"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP HEADER BAR */}
      <div className="flex items-start justify-between gap-2 pointer-events-auto w-full">
        {/* Top-Left: Destination Selector & Orbit Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          {viewMode === 'surface' ? (
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-lg">
              <button
                onClick={() => {
                  soundManager.playPing();
                  onReturnToSpace();
                }}
                className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-500/20 border border-slate-700 hover:border-cyan-400 text-cyan-300 text-xs font-medium transition whitespace-nowrap"
                title="Return to Space Orbit"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Orbit</span>
              </button>

              <div className="h-4 w-[1px] bg-slate-800" />

              {(['earth', 'moon', 'mars'] as const).map(pId => (
                <button
                  key={pId}
                  disabled={isShuttleFlying}
                  onClick={() => {
                    soundManager.playPing();
                    if (onSelectPlanet) onSelectPlanet(pId);
                  }}
                  className={`px-2 py-1 rounded-xl text-xs font-medium transition whitespace-nowrap ${
                    currentPlanet === pId
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent disabled:opacity-40'
                  }`}
                >
                  {pId.toUpperCase()}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              {onResetUniverseCamera && (
                <button
                  onClick={() => {
                    soundManager.playPing();
                    onResetUniverseCamera();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-cyan-400 text-slate-300 hover:text-white transition text-xs font-mono shadow-md whitespace-nowrap"
                  title="Reset Camera View"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset View</span>
                </button>
              )}
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/90 border border-cyan-500/30 text-xs font-mono text-cyan-300 whitespace-nowrap">
                SOLAR SYSTEM ORBITAL VIEW • CLICK ANY WORLD TO DESCEND
              </div>
            </div>
          )}
        </div>

        {/* Top-Center: Telemetry Pill OR Space Shuttle Flight Telemetry Banner */}
        {viewMode === 'surface' && !isLanding && !isShuttleFlying && (
          <div
            data-testid="surface-telemetry-pill"
            className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-950/90 border border-cyan-500/30 shadow-xl text-[11px] font-mono whitespace-nowrap shrink-0"
          >
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{currentConfig.name.toUpperCase()}</span>
            </div>
            <span className="text-slate-600">•</span>
            <span className="text-sky-300 font-bold">
              {sphericalTelemetry?.headingLabel || 'N'} {sphericalTelemetry?.headingDeg ?? 0}°
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-300">
              {sphericalTelemetry ? `${Math.round(sphericalTelemetry.speed * 3.6)} km/h` : '0 km/h'}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">
              {isInShuttle
                ? 'Space Shuttle Flight Deck'
                : sphericalTelemetry?.nearestLandmark || sphericalTelemetry?.biome || 'Surface Frontier'}
            </span>
          </div>
        )}

        {isShuttleFlying && shuttleTelemetry && (
          <div
            data-testid="shuttle-flight-telemetry"
            className="flex flex-col gap-1 px-3 py-2 rounded-2xl bg-slate-950/95 border-2 border-cyan-400/70 shadow-2xl min-w-[240px] sm:min-w-[330px] max-w-[380px]"
          >
            <div className="flex items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <Rocket className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>{shuttleTelemetry.phaseLabel}</span>
              </div>
              <span className="text-amber-300 font-bold">
                {Math.round(shuttleTelemetry.overallProgress * 100)}%
              </span>
            </div>

            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-amber-400 transition-all duration-150"
                style={{ width: `${Math.round(shuttleTelemetry.overallProgress * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between gap-3 text-[11px] font-mono text-slate-300">
              <span>ALT: <strong className="text-white">{shuttleTelemetry.altitudeMeters.toLocaleString()} m</strong></span>
              <span>VEL: <strong className="text-cyan-300">{shuttleTelemetry.velocityKms} km/s</strong></span>
              <span>REM: <strong className="text-amber-300">{shuttleTelemetry.distanceRemainingKm.toLocaleString()} km</strong></span>
            </div>
          </div>
        )}

        {/* Top-Right: Quick-Action Icon Dock */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            aria-label={isAudioMuted ? 'Unmute Master Audio' : 'Mute Master Audio'}
            onClick={handleToggleAudio}
            className={`p-2 rounded-xl border transition shadow-md shrink-0 ${
              isAudioMuted
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-300 hover:bg-rose-900'
                : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400'
            }`}
            title={isAudioMuted ? 'Unmute Master Audio' : 'Mute Master Audio'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {onOpenMoonResources && (
            <button
              data-testid="hud-moon-resources-btn"
              aria-label="Open Historical Moon Resources"
              onClick={() => {
                soundManager.playPing();
                onOpenMoonResources();
              }}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-900/95 border border-amber-400/80 text-amber-300 hover:text-white hover:border-amber-300 transition shadow-lg active:scale-95 whitespace-nowrap shrink-0"
              title="Historical Moon Exploration Resources (Apollo LM, LRV, ALSEP, Surveyor)"
            >
              <Rocket className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="text-[11px] font-mono font-bold tracking-wide">MOON MISSIONS</span>
            </button>
          )}

          {onOpenMarsResources && (
            <button
              data-testid="hud-mars-resources-btn"
              aria-label="Open Mars and Deep Space Resources"
              onClick={() => {
                soundManager.playPing();
                onOpenMarsResources();
              }}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-900/95 border border-orange-400/80 text-orange-300 hover:text-white hover:border-orange-300 transition shadow-lg active:scale-95 whitespace-nowrap shrink-0"
              title="Mars, Outer Solar System & Exoplanet Exploration Resources (9 Missions: Sojourner, Twin Rovers, Viking 1, Phoenix/InSight, Curiosity, Ingenuity, Dawn, Pioneer, Kepler)"
            >
              <Compass className="w-3.5 h-3.5 text-orange-300 shrink-0" />
              <span className="text-[11px] font-mono font-bold tracking-wide">MARS &amp; BEYOND</span>
            </button>
          )}

          {onOpenAiCoPilot && (
            <button
              onClick={() => {
                soundManager.playPing();
                onOpenAiCoPilot();
              }}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-900/95 border border-cyan-400/80 text-cyan-300 hover:text-white hover:border-cyan-300 transition shadow-lg active:scale-95 whitespace-nowrap shrink-0"
              title="NASA Space Apps AI Mission Co-Pilot"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <span className="text-[11px] font-mono font-bold tracking-wide">AI CO-PILOT</span>
            </button>
          )}

          {viewMode === 'surface' && (
            <button
              onClick={() => {
                soundManager.playPing();
                onOpenMap();
              }}
              className="p-2 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition shadow-md"
              title="Planetary Radar Map [M]"
            >
              <Map className="w-4 h-4 text-cyan-400" />
            </button>
          )}

          <button
            onClick={() => {
              soundManager.playPing();
              onOpenNotebook();
            }}
            className="p-2 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white transition shadow-md"
            title="Field Notebook [N]"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
          </button>

          <button
            onClick={() => {
              soundManager.playPing();
              onOpenGravityLab();
            }}
            className="p-2 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition shadow-md"
            title="Gravity Lab [G]"
          >
            <Scale className="w-4 h-4 text-cyan-400" />
          </button>

          <button
            onClick={() => {
              soundManager.playPing();
              onOpenBackpack();
            }}
            className="relative p-2 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition shadow-md"
            title="Backpack [B]"
          >
            <Package className="w-4 h-4 text-cyan-400" />
            {profile.inventory.length > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-bold font-mono">
                {profile.inventory.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              soundManager.playPing();
              onOpenMissions();
            }}
            className="relative p-2 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white transition shadow-md"
            title="Mission Directives"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            {activeMission && !activeMission.completed && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>

          <button
            onClick={() => {
              soundManager.playPing();
              onOpenQuiz();
            }}
            className="p-2 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-purple-400 text-slate-300 hover:text-white transition shadow-md"
            title="Science Quiz [Q]"
          >
            <GraduationCap className="w-4 h-4 text-purple-400" />
          </button>

          <button
            aria-label="Controls Guide"
            onClick={() => {
              soundManager.playPing();
              onOpenTutorial();
            }}
            className="p-2 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white transition shadow-md"
            title="Controls Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            aria-label="Open Settings"
            onClick={() => {
              soundManager.playPing();
              onOpenSettings();
            }}
            className="p-2 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white transition shadow-md"
            title="Settings [S]"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CENTER-BOTTOM PROMPT: SPACE SHUTTLE BOARDING OR NEARBY DISCOVERY */}
      <div className="fixed bottom-[84px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none w-max max-w-[92vw]">
        {viewMode === 'surface' && !isLanding && nearShuttle && !isInShuttle && (
          <div className="pointer-events-auto animate-bounce-subtle">
            <button
              data-shuttle-enter="true"
              onClick={() => {
                soundManager.playPing();
                onEnterShuttle?.();
              }}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold shadow-2xl border-2 border-white active:scale-95 transition"
            >
              <Rocket className="w-5 h-5 text-slate-950" />
              <div className="text-left">
                <div className="text-sm font-black leading-tight">Enter Space Shuttle</div>
                <div className="text-[11px] font-mono font-bold text-slate-900">
                  Press E to Enter
                </div>
              </div>
            </button>
          </div>
        )}

        {viewMode === 'surface' && nearbyDiscovery && !isLanding && !isInShuttle && (
          <div className="pointer-events-auto animate-bounce-subtle flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playDiscoveryInspect();
                onInspectNearby();
              }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-2xl transition active:scale-95 border border-white/60"
            >
              <Sparkles className="w-4 h-4 text-slate-950 animate-spin-slow" />
              <div className="text-left">
                <div className="text-[9px] uppercase font-mono tracking-wider text-slate-900/80">
                  SCIENTIFIC DISCOVERY
                </div>
                <div className="text-xs font-bold text-slate-950 flex items-center gap-1.5">
                  <span>{nearbyDiscovery.name}</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-950 text-cyan-300 text-[10px] font-mono">
                    [E]
                  </span>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                soundManager.playPing();
                onCollectSample();
              }}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-900/95 border border-amber-400 text-amber-300 hover:bg-amber-500/20 font-mono text-xs font-bold shadow-xl transition"
            >
              + Sample
            </button>
          </div>
        )}

        {/* HISTORICAL MOON MUSEUM PROXIMITY & LRV PROMPTS */}
        {viewMode === 'surface' &&
          currentPlanet === 'moon' &&
          !isLanding &&
          !isInShuttle &&
          moonRuntimeTelemetry &&
          (moonRuntimeTelemetry.lrvDriving ||
            moonRuntimeTelemetry.nearLrvVehicle ||
            moonRuntimeTelemetry.nearbyResourceId) && (
            <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2">
              {moonRuntimeTelemetry.lrvDriving ? (
                <button
                  data-testid="hud-exit-lrv-btn"
                  onClick={() => {
                    soundManager.playPing();
                    onToggleMoonLrv?.();
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold shadow-2xl border-2 border-white active:scale-95 transition"
                >
                  <Car className="w-4 h-4 text-slate-950" />
                  <div className="text-left">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-900">
                      DRIVING APOLLO LRV • {moonRuntimeTelemetry.lrvSpeedKmh} km/h • BATT {moonRuntimeTelemetry.lrvBatteryPercent}%
                    </div>
                    <div className="text-xs font-black text-slate-950">
                      EXIT LUNAR ROVER — PRESS [E]
                    </div>
                  </div>
                </button>
              ) : (
                moonRuntimeTelemetry.nearLrvVehicle && (
                  <button
                    data-testid="hud-enter-lrv-btn"
                    onClick={() => {
                      soundManager.playPing();
                      onToggleMoonLrv?.();
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 font-bold shadow-2xl border-2 border-white active:scale-95 transition"
                  >
                    <Car className="w-5 h-5 text-slate-950" />
                    <div className="text-left">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-slate-900">
                        LUNAR ROVING VEHICLE (ELECTRIC BUGGY)
                      </div>
                      <div className="text-xs font-black text-slate-950">
                        ENTER LUNAR ROVER — PRESS E
                      </div>
                    </div>
                  </button>
                )
              )}

              {moonRuntimeTelemetry.nearbyResourceId && !moonRuntimeTelemetry.lrvDriving && (
                <button
                  data-testid="hud-discover-moon-resource-btn"
                  onClick={() => {
                    soundManager.playDiscoveryInspect();
                    if (moonRuntimeTelemetry.nearbyResourceId) {
                      onInspectMoonResource?.(moonRuntimeTelemetry.nearbyResourceId);
                    }
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold shadow-2xl border-2 border-white active:scale-95 transition"
                >
                  <Sparkles className="w-5 h-5 text-slate-950" />
                  <div className="text-left">
                    <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-900">
                      DISCOVER THIS HISTORICAL RESOURCE • {moonRuntimeTelemetry.nearbyResourceBadge}
                    </div>
                    <div className="text-xs font-black text-slate-950 flex items-center gap-1.5">
                      <span>{moonRuntimeTelemetry.nearbyResourceTitle}</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-950 text-amber-300 text-[10px] font-mono">
                        Press E to Explore
                      </span>
                    </div>
                  </div>
                </button>
              )}
            </div>
          )}

        {/* HISTORICAL MARS SURFACE PROXIMITY DISCOVERY PROMPT */}
        {viewMode === 'surface' &&
          currentPlanet === 'mars' &&
          !isLanding &&
          !isInShuttle &&
          marsRuntimeTelemetry?.nearbyResourceId && (
            <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2">
              <button
                data-testid="hud-discover-mars-resource-btn"
                onClick={() => {
                  soundManager.playDiscoveryInspect();
                  if (marsRuntimeTelemetry.nearbyResourceId) {
                    onInspectMarsResource?.(marsRuntimeTelemetry.nearbyResourceId);
                  }
                }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold shadow-2xl border-2 border-white active:scale-95 transition"
              >
                <Sparkles className="w-5 h-5 text-slate-950" />
                <div className="text-left">
                  <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-900">
                    DISCOVER MARS MISSION SITE • {marsRuntimeTelemetry.nearbyResourceBadge}
                  </div>
                  <div className="text-xs font-black text-slate-950 flex items-center gap-1.5">
                    <span>{marsRuntimeTelemetry.nearbyResourceTitle}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-950 text-orange-300 text-[10px] font-mono">
                      Press E to Explore
                    </span>
                  </div>
                </div>
              </button>
            </div>
          )}
      </div>

      {/* ACTIVE CAMERA MODE INDICATOR & SYNCHRONIZED PICTURE-IN-PICTURE FRAME */}
      {viewMode === 'surface' && !isLanding && isInShuttle && shuttleState !== 'boarding' && shuttleState !== 'disembark' && (
        <>
          <div
            data-testid="shuttle-camera-indicator"
            className="pointer-events-none fixed top-[74px] left-4 sm:left-6 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-cyan-400/60 shadow-lg text-[11px] font-mono"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-cyan-200 font-bold tracking-wider">
              {shuttleCameraView === 'cockpit'
                ? 'CAMERA A — FIRST-PERSON COCKPIT VIEW'
                : 'CAMERA B — EXTERNAL CINEMATIC VIEW'}
            </span>
          </div>

          {isPipEnabled && (
            <div
              data-testid="shuttle-pip-frame"
              className="hidden sm:flex flex-col justify-between fixed right-[20px] bottom-[86px] w-[clamp(220px,24vw,340px)] aspect-video rounded-xl border-2 border-cyan-400/85 shadow-2xl pointer-events-none z-20 overflow-hidden"
            >
              <div className="flex items-center justify-between px-2.5 py-1 bg-slate-950/90 border-b border-cyan-400/40 text-[10px] font-mono pointer-events-auto">
                <span className="text-cyan-300 font-bold truncate">
                  {shuttleCameraView === 'cockpit'
                    ? 'PiP • EXTERNAL VIEW'
                    : 'PiP • COCKPIT VIEW'}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  {onToggleShuttleCameraView && (
                    <button
                      onClick={() => {
                        soundManager.playPing();
                        onToggleShuttleCameraView();
                      }}
                      className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-cyan-500/20 text-cyan-200 border border-slate-700 text-[9px]"
                      title="Swap Main & PiP Cameras [C]"
                    >
                      SWAP [C]
                    </button>
                  )}
                  {onTogglePip && (
                    <button
                      onClick={() => {
                        soundManager.playPing();
                        onTogglePip();
                      }}
                      className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-rose-500/20 text-slate-300 border border-slate-700 text-[9px]"
                      title="Hide Picture-in-Picture [P]"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              <div className="px-2 py-0.5 bg-slate-950/75 text-[9px] font-mono text-slate-300 self-start m-1.5 rounded border border-slate-700/80">
                LIVE SYNC • DRAG TO LOOK
              </div>
            </div>
          )}
        </>
      )}

      {/* BOTTOM DOCK: SHUTTLE COCKPIT/FLIGHT CONTROLS OR ON-FOOT EXPLORATION CONTROLS */}
      {viewMode === 'surface' && !isLanding && isInShuttle && (
        <div className="flex items-center justify-center w-full pointer-events-auto pb-1">
          <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-950/95 px-3.5 py-2 rounded-2xl border-2 border-cyan-400/60 shadow-2xl">
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase px-1.5">
              {shuttleState === 'seated_cockpit'
                ? `FLIGHT DECK • ${currentPlanet.toUpperCase()}`
                : shuttleState === 'boarding'
                ? 'BOARDING SHUTTLE...'
                : shuttleState === 'disembark'
                ? 'DISEMBARKING...'
                : 'INTERPLANETARY TRANSIT'}
            </span>

            {shuttleState === 'seated_cockpit' && onOpenShuttleDestinations && (
              <button
                data-shuttle-open-dest="true"
                onClick={() => {
                  soundManager.playPing();
                  onOpenShuttleDestinations();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg"
              >
                <Rocket className="w-4 h-4" />
                <span>Select Destination</span>
              </button>
            )}

            {onSetShuttleCameraView && (
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
                <button
                  data-shuttle-cam-cockpit="true"
                  onClick={() => {
                    soundManager.playPing();
                    onSetShuttleCameraView('cockpit');
                  }}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition ${
                    shuttleCameraView === 'cockpit'
                      ? 'bg-cyan-500 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  [1] Cockpit
                </button>
                <button
                  data-shuttle-cam-external="true"
                  onClick={() => {
                    soundManager.playPing();
                    onSetShuttleCameraView('external_chase');
                  }}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition ${
                    shuttleCameraView === 'external_chase'
                      ? 'bg-cyan-500 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  [2] External
                </button>
              </div>
            )}

            {onToggleShuttleCameraView && (
              <button
                data-shuttle-cam="true"
                onClick={() => {
                  soundManager.playPing();
                  onToggleShuttleCameraView();
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-400/50 text-cyan-200 font-mono text-[11px] font-bold transition"
                title="Switch Cockpit <-> External Camera [C]"
              >
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span>Switch [C]</span>
              </button>
            )}

            {onTogglePip && (
              <button
                data-shuttle-pip="true"
                onClick={() => {
                  soundManager.playPing();
                  onTogglePip();
                }}
                className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border font-mono text-[11px] font-bold transition ${
                  isPipEnabled
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                }`}
                title="Toggle Picture-in-Picture Window [P]"
              >
                <span>PiP [P]: {isPipEnabled ? 'ON' : 'OFF'}</span>
              </button>
            )}

            {shuttleState === 'seated_cockpit' && onExitShuttle && (
              <button
                data-shuttle-exit="true"
                onClick={() => {
                  soundManager.playPing();
                  onExitShuttle();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-amber-400/50 text-amber-300 font-mono text-xs font-bold transition"
              >
                <DoorOpen className="w-4 h-4" />
                <span>Exit Shuttle [E]</span>
              </button>
            )}

            {shuttleState === 'landing' && onSkipLanding && (
              <button
                data-testid="shuttle-skip-landing-btn"
                onClick={() => {
                  soundManager.playPing();
                  onSkipLanding();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-extrabold transition shadow-md"
                title="Complete Space Shuttle landing immediately [SPACE]"
              >
                <FastForward className="w-4 h-4" />
                <span>SKIP TO PAD [SPACE]</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ORBIT VIEW BOTTOM SOLAR SYSTEM QUICK-FOCUS DOCK (SUN + 8 PLANETS + MOON) */}
      {viewMode === 'universe' && (
        <div className="flex items-center justify-center w-full pointer-events-auto pb-1">
          <div
            data-testid="solar-system-orbit-dock"
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-950/95 border border-cyan-500/40 shadow-2xl overflow-x-auto max-w-[95vw]"
          >
            {(
              [
                { id: 'sun', label: 'Sun', dot: 'bg-amber-400' },
                { id: 'mercury', label: 'Mercury', dot: 'bg-slate-400' },
                { id: 'venus', label: 'Venus', dot: 'bg-yellow-300' },
                { id: 'earth', label: 'Earth', dot: 'bg-blue-500' },
                { id: 'moon', label: 'Moon', dot: 'bg-slate-200' },
                { id: 'mars', label: 'Mars', dot: 'bg-orange-500' },
                { id: 'jupiter', label: 'Jupiter', dot: 'bg-amber-500' },
                { id: 'saturn', label: 'Saturn', dot: 'bg-yellow-400' },
                { id: 'uranus', label: 'Uranus', dot: 'bg-cyan-300' },
                { id: 'neptune', label: 'Neptune', dot: 'bg-blue-400' }
              ] as const
            ).map(body => {
              const active = selectedOrbitPlanet === body.id;
              return (
                <button
                  key={body.id}
                  data-orbit-body={body.id}
                  onClick={() => {
                    soundManager.playPing();
                    onSelectOrbitPlanet?.(body.id);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition whitespace-nowrap shrink-0 border ${
                    active
                      ? 'bg-cyan-500/25 border-cyan-400 text-white shadow-md'
                      : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:border-slate-600'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${body.dot} shrink-0`} />
                  <span>{body.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'surface' && !isLanding && !isInShuttle && (
        <div className="flex items-end justify-between w-full pointer-events-auto pb-1">
          {/* Bottom-Left: Virtual Analog Joystick */}
          <div className="flex flex-col items-center gap-1">
            <div
              ref={joystickBaseRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`relative w-24 h-24 rounded-full bg-slate-950/85 border-2 ${
                joystickActive ? 'border-cyan-300 shadow-[0_0_20px_rgba(56,189,248,0.5)]' : 'border-cyan-500/40'
              } flex items-center justify-center touch-none cursor-grab active:cursor-grabbing shadow-xl transition-colors`}
              title="Drag in any direction to move or steer the rover"
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
                <div className="w-full h-[1px] bg-cyan-400" />
                <div className="h-full w-[1px] bg-cyan-400" />
              </div>

              <div
                className="w-10 h-10 rounded-full bg-gradient-to-b from-cyan-400 to-blue-600 border border-white shadow-lg pointer-events-none flex items-center justify-center"
                style={{
                  transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
                }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-white/90" />
              </div>
            </div>
            <span className="text-[8px] font-mono uppercase text-cyan-300/80 bg-slate-950/90 px-2 py-0.5 rounded border border-cyan-500/20">
              {joystickActive ? 'MOVING' : 'JOYSTICK / WASD'}
            </span>
          </div>

          {/* Desktop Keyboard Hints in Center */}
          <div className="hidden md:flex items-center gap-2.5 bg-slate-950/95 px-4 py-2 rounded-2xl border-2 border-cyan-500/50 text-xs font-mono text-slate-200 shadow-2xl">
            <span className="text-cyan-300 font-extrabold tracking-wide uppercase">FLIGHT GUIDE:</span>
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-700 font-bold text-white">W A S D</span>
            <span className="text-slate-400">Move</span>
            <span>•</span>
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-amber-500/40 font-bold text-amber-300">SPACE</span>
            <span className="text-amber-200">Jump / Jetpack</span>
            <span>•</span>
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-cyan-500/40 font-bold text-cyan-300">V</span>
            <span className="text-cyan-200">POV / Shuttle View</span>
            <span>•</span>
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-orange-500/40 font-bold text-orange-300">R</span>
            <span className="text-orange-200">Rover</span>
            <span>•</span>
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-purple-500/40 font-bold text-purple-300">E</span>
            <span className="text-purple-200">Shuttle / Inspect</span>
          </div>

          {/* Bottom-Right Action Buttons */}
          <div className="flex items-center gap-2">
            {onToggleCameraMode && (
              <button
                onClick={() => {
                  soundManager.playPing();
                  onToggleCameraMode();
                }}
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl border transition active:scale-95 shadow-lg ${
                  cameraMode === 'first-person'
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 font-bold ring-1 ring-cyan-400/50'
                    : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Toggle First-Person / Third-Person POV [V]"
              >
                <Eye className="w-4 h-4" />
                <span className="text-[9px] font-mono mt-0.5 font-bold">
                  {cameraMode === 'first-person' ? '1ST POV' : '3RD POV'}
                </span>
              </button>
            )}

            <button
              onClick={() => {
                soundManager.playPing();
                onTriggerScanner();
              }}
              className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-slate-900/90 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 transition active:scale-95 shadow-lg"
              title="Scan Geologic Strata [F]"
            >
              <Crosshair className="w-4 h-4" />
              <span className="text-[9px] font-mono mt-0.5">SCAN</span>
            </button>

            <button
              onClick={() => {
                soundManager.playPing();
                if (posture === 'stand') onPostureChange('sit');
                else if (posture === 'sit') onPostureChange('sleep');
                else onPostureChange('stand');
              }}
              className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl border transition active:scale-95 shadow-lg ${
                posture === 'sit'
                  ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300'
                  : posture === 'sleep'
                  ? 'bg-indigo-500/25 border-indigo-400 text-indigo-300'
                  : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="Change Posture: Stand / Sit / Sleep"
            >
              {posture === 'sleep' ? <BedDouble className="w-4 h-4" /> : <Armchair className="w-4 h-4" />}
              <span className="text-[9px] font-mono mt-0.5">
                {posture === 'stand' ? 'SIT' : posture === 'sit' ? 'SLEEP' : 'STAND'}
              </span>
            </button>

            <button
              onClick={() => {
                soundManager.playPing();
                onToggleRover();
              }}
              className={`flex flex-col items-center justify-center w-13 h-13 rounded-xl border transition active:scale-95 shadow-lg ${
                isDrivingRover
                  ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 border-white font-bold'
                  : 'bg-slate-900/90 border-amber-500/40 text-amber-300 hover:text-white'
              }`}
              title="Summon & Drive Planetary Rover [R]"
            >
              {isDrivingRover ? <Footprints className="w-4 h-4" /> : <Car className="w-4 h-4" />}
              <span className="text-[9px] font-mono mt-0.5">
                {isDrivingRover ? 'EXIT' : 'ROVER'}
              </span>
            </button>

            <button
              onPointerDown={(e) => {
                e.preventDefault();
                soundManager.playPing();
                if (onTouchJump) onTouchJump();
              }}
              className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 active:scale-95 border-2 border-white text-slate-950 font-bold shadow-xl transition"
              title="Jump & Jetpack [SPACE]"
            >
              <ArrowUp className="w-5 h-5 stroke-[2.5]" />
              <span className="text-[10px] font-mono font-extrabold">JUMP</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
