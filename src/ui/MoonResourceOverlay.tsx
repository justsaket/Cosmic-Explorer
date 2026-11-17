import React, { useEffect, useState } from 'react';
import {
  ALSEP_FIVE_STATIONS,
  APOLLO_12_ALSEP_INSTRUMENTS,
  APOLLO_LM_COMPARISON,
  computeLaserPulseRoundTrip,
  LRV_MISSIONS,
  LRV_SPECIFICATIONS,
  MOON_RESOURCE_QUIZZES,
  MOON_RESOURCES,
  SURVEYOR_PROGRAM_ENTRIES
} from '../moonResources/moonResourceData';
import {
  MoonResourceId,
  MoonResourceStage
} from '../moonResources/moonResourceTypes';
import {
  MoonWorldRuntimeTelemetry,
  MoonWorldSyncState
} from '../moonResources/MoonResourceWorldManager';
import { InteractiveModelInspector } from './InteractiveModelInspector';
import { PlanetId } from '../types';
import { ShuttleInteractionState } from '../shuttle/shuttleTravelState';
import { narrationManager } from '../narration/narrationManager';
import { soundManager } from '../audio/soundManager';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  Camera,
  Car,
  CheckCircle2,
  Clock,
  Compass,
  ExternalLink,
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  Play,
  Radio,
  RotateCcw,
  Rocket,
  ShieldCheck,
  Sparkles,
  Volume2,
  X,
  XCircle,
  Zap
} from 'lucide-react';

interface MoonResourceOverlayProps {
  resourceId: MoonResourceId;
  stage: MoonResourceStage;
  onStageChange: (stage: MoonResourceStage) => void;
  currentPlanet: PlanetId;
  shuttleState: ShuttleInteractionState;
  syncState: MoonWorldSyncState;
  onUpdateSyncState: (patch: Partial<MoonWorldSyncState>) => void;
  onAddSoilTestMark: (type: 'trench' | 'bearing' | 'impact') => void;
  runtimeTelemetry: MoonWorldRuntimeTelemetry | null;
  onTeleportNearShuttlePad: () => void;
  onTeleportNearHistoricalSite: () => void;
  onOpenShuttlePanel: () => void;
  onRecordQuizScore: (quizId: string, scorePercent: number) => void;
  onMarkCompleted: (resourceId: MoonResourceId) => void;
  onReturnToHub: () => void;
  onClose: () => void;
}

const STAGE_TABS: { id: MoonResourceStage; label: string }[] = [
  { id: 'earth_briefing', label: 'Briefing' },
  { id: 'time_transition', label: 'Era Jump' },
  { id: 'interactive_3d_lab', label: '3D Model' },
  { id: 'historical_sequence', label: 'Sequence' },
  { id: 'surface_exploration', label: 'Surface Lab' },
  { id: 'comparison_and_timeline', label: 'Compare & Timeline' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'completed', label: 'Complete' }
];

export const MoonResourceOverlay: React.FC<MoonResourceOverlayProps> = ({
  resourceId,
  stage,
  onStageChange,
  currentPlanet,
  shuttleState,
  syncState,
  onUpdateSyncState,
  onAddSoilTestMark,
  runtimeTelemetry,
  onTeleportNearShuttlePad,
  onTeleportNearHistoricalSite,
  onOpenShuttlePanel,
  onRecordQuizScore,
  onMarkCompleted,
  onReturnToHub,
  onClose
}) => {
  const resource = MOON_RESOURCES[resourceId];
  const quizQuestions = MOON_RESOURCE_QUIZZES[resourceId];

  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedMapStationIdx, setSelectedMapStationIdx] = useState<number>(0);

  // Embedded Quiz state (never reveals correct answer prior to selection)
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  // Auto-reset quiz UI if switching resource
  useEffect(() => {
    setQuizIndex(0);
    setSelectedOption(null);
    setQuizCorrectCount(0);
    setQuizDone(false);
    setIsMinimized(false);
  }, [resourceId]);

  // Speak stage narration cleanly when stage changes
  useEffect(() => {
    const script = resource.narrationScripts[stage];
    if (script) {
      narrationManager.speak(script, {
        priority: 'normal',
        dedupeKey: `mr_${resourceId}_${stage}`,
        cooldownMs: 3000
      });
    }
  }, [resourceId, stage, resource.narrationScripts]);

  const speakCurrentStage = () => {
    const script = resource.narrationScripts[stage] || resource.earthBriefingIntro[0];
    narrationManager.speak(script, { priority: 'high', dedupeKey: undefined });
  };

  const handleBriefingLaunch = () => {
    soundManager.playPing();
    if (currentPlanet === 'moon') {
      onStageChange('time_transition');
      onTeleportNearHistoricalSite();
    } else {
      onStageChange('awaiting_shuttle');
      narrationManager.speak(
        'Head over to your Space Shuttle on the Earth Launch Pad, press E to enter the cockpit, and select the Moon for your real space flight!',
        { priority: 'high' }
      );
    }
  };

  const activeLrvProfile =
    LRV_MISSIONS.find(m => m.missionId === syncState.lrvMissionId) || LRV_MISSIONS[0];
  const activeLrvExcursion =
    activeLrvProfile.excursions[syncState.lrvEvaIndex] || activeLrvProfile.excursions[0];

  const selectedAlsepInst =
    APOLLO_12_ALSEP_INSTRUMENTS.find(i => i.id === syncState.alsepSelectedId) ||
    APOLLO_12_ALSEP_INSTRUMENTS[0];

  const laserPreview =
    syncState.laserPulseProgress !== null
      ? computeLaserPulseRoundTrip(syncState.laserPulseProgress)
      : null;

  // Surveyor 3 1967 600-line B&W TV Camera Viewfinder Overlay when active
  const renderSurveyorCameraFrame =
    resourceId === 'surveyor' && syncState.surveyorCameraPov && currentPlanet === 'moon';

  // Minimized floating bar so 3D viewport is completely open for walking / driving LRV!
  if (isMinimized) {
    return (
      <>
        {renderSurveyorCameraFrame && (
          <div
            data-testid="surveyor-tv-viewfinder"
            className="fixed inset-0 pointer-events-none z-10 border-[18px] border-slate-950/80"
          >
            <div className="w-full h-full border border-white/40 bg-slate-900/20 mix-blend-saturation flex flex-col justify-between p-4 font-mono text-xs text-white">
              <div className="flex items-center justify-between bg-black/75 px-3 py-1.5 rounded">
                <span>SURVEYOR 3 TELEVISION CAMERA (25/100 mm • APRIL 1967 RECONSTRUCTION)</span>
                <span>600-LINE SIMULATION FEED</span>
              </div>
              <div className="self-center text-white/50 text-2xl">+</div>
              <div className="flex items-center justify-between bg-black/75 px-3 py-1.5 rounded pointer-events-auto">
                <span>MIRROR PAN: {Math.round((syncState.surveyorCameraPan * 180) / Math.PI)}°</span>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      onUpdateSyncState({
                        surveyorCameraPan: Math.max(-1.4, syncState.surveyorCameraPan - 0.3)
                      })
                    }
                    className="px-2 py-0.5 rounded bg-slate-800 border border-slate-600"
                  >
                    Pan Left
                  </button>
                  <button
                    onClick={() =>
                      onUpdateSyncState({
                        surveyorCameraPan: Math.min(1.4, syncState.surveyorCameraPan + 0.3)
                      })
                    }
                    className="px-2 py-0.5 rounded bg-slate-800 border border-slate-600"
                  >
                    Pan Right
                  </button>
                  <button
                    onClick={() => onUpdateSyncState({ surveyorCameraPov: false })}
                    className="px-2 py-0.5 rounded bg-purple-500 text-slate-950 font-bold"
                  >
                    Switch to Human View
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div
          data-testid="moon-resource-minimized-bar"
          className="fixed top-16 left-4 z-30 pointer-events-auto max-w-md rounded-2xl bg-slate-950/95 border-2 border-cyan-400/70 p-3 shadow-2xl space-y-2"
        >
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-mono uppercase text-amber-300 font-bold">
                {resource.resourceNumber} • {resource.eraBadge}
              </div>
              <div className="text-xs font-bold text-white">{resource.shortTitle}</div>
            </div>
            <button
              data-testid="moon-resource-expand-btn"
              onClick={() => {
                soundManager.playPing();
                setIsMinimized(false);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-mono text-[11px] font-bold"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Open Panel</span>
            </button>
          </div>

          {runtimeTelemetry && (
            <div className="text-[11px] font-mono text-slate-200 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800 space-y-1">
              {resourceId === 'lunar_rover' && (
                <>
                  <div className="flex justify-between">
                    <span>SPEED: <strong className="text-sky-300">{runtimeTelemetry.lrvSpeedKmh} km/h</strong></span>
                    <span>DIST: <strong className="text-amber-300">{runtimeTelemetry.lrvDistanceMeters} m</strong></span>
                    <span>BATT: <strong className="text-emerald-300">{runtimeTelemetry.lrvBatteryPercent}%</strong></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>From LM: {runtimeTelemetry.walkbackDistanceMeters} m</span>
                    {runtimeTelemetry.walkbackWarning && (
                      <span className="text-rose-300 font-bold">WALKBACK ALERT!</span>
                    )}
                  </div>
                </>
              )}

              {runtimeTelemetry.nearbyHotspotLabel && (
                <div className="text-amber-300 font-bold">
                  Nearby: {runtimeTelemetry.nearbyHotspotLabel}
                </div>
              )}

              {runtimeTelemetry.nearbyWaypointLabel && resourceId === 'lunar_rover' && (
                <button
                  onClick={() => {
                    const id = runtimeTelemetry.nearbyWaypointId!;
                    if (!syncState.collectedWaypoints.includes(id)) {
                      soundManager.playSampleCollect();
                      onUpdateSyncState({
                        collectedWaypoints: [...syncState.collectedWaypoints, id]
                      });
                    }
                  }}
                  className="w-full py-1 rounded bg-amber-500 text-slate-950 font-bold text-[10px]"
                >
                  Collect Sample at {runtimeTelemetry.nearbyWaypointLabel}
                </button>
              )}
            </div>
          )}

          {resourceId === 'lunar_rover' && currentPlanet === 'moon' && (
            <button
              onClick={() => {
                soundManager.playPing();
                onUpdateSyncState({ isDrivingLrv: !syncState.isDrivingLrv });
              }}
              className={`w-full py-1.5 rounded-lg font-mono text-xs font-bold border ${
                syncState.isDrivingLrv
                  ? 'bg-rose-500/20 border-rose-400 text-rose-200'
                  : 'bg-sky-500 text-slate-950 border-white'
              }`}
            >
              {syncState.isDrivingLrv ? 'Exit LRV Driver Seat' : 'Drive Lunar Roving Vehicle (WASD)'}
            </button>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      {renderSurveyorCameraFrame && (
        <div
          data-testid="surveyor-tv-viewfinder"
          className="fixed inset-0 pointer-events-none z-20 border-[14px] border-slate-950/75"
        >
          <div className="p-3 font-mono text-[11px] text-white bg-black/70 inline-block m-3 rounded border border-white/40">
            SURVEYOR 3 TELEVISION CAMERA VIEW (1967 SIMULATION)
          </div>
        </div>
      )}

      <div
        data-testid="moon-resource-overlay"
        className="fixed inset-0 z-40 flex items-center justify-center p-2 sm:p-5 bg-slate-950/75 pointer-events-auto"
      >
        <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-900 border border-cyan-500/45 rounded-2xl shadow-2xl overflow-hidden hud-glow">
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between gap-2 bg-slate-950/80">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold uppercase">
                  {resource.resourceNumber}
                </span>
                <span className="text-[10px] font-mono text-cyan-300">{resource.eraBadge}</span>
              </div>
              <h2 className="text-sm sm:text-lg font-bold font-display text-white truncate mt-0.5">
                {resource.fullTitle}
              </h2>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                aria-label="Replay Storyteller Voice"
                onClick={() => {
                  soundManager.playPing();
                  speakCurrentStage();
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 border border-slate-700 text-cyan-300 text-xs font-mono"
                title="Replay Female Storyteller Narration"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Narrate</span>
              </button>

              {currentPlanet === 'moon' && (
                <button
                  type="button"
                  data-testid="moon-resource-minimize-btn"
                  onClick={() => {
                    soundManager.playPing();
                    setIsMinimized(true);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono"
                  title="Minimize to explore 3D Moon surface"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Explore 3D</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  soundManager.playPing();
                  onReturnToHub();
                }}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-mono"
              >
                All Missions
              </button>

              <button
                type="button"
                aria-label="Exit Moon Resource"
                onClick={() => {
                  soundManager.playPing();
                  onClose();
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/25 text-slate-300 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stage Navigation Strip (when on Moon or after briefing) */}
          {stage !== 'awaiting_shuttle' && (
            <div className="px-3 py-2 bg-slate-950/90 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono">
              {STAGE_TABS.map(tab => {
                const lockedBeforeMoon =
                  currentPlanet !== 'moon' && tab.id !== 'earth_briefing';
                return (
                  <button
                    key={tab.id}
                    disabled={lockedBeforeMoon}
                    onClick={() => {
                      soundManager.playPing();
                      onStageChange(tab.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition border ${
                      stage === tab.id
                        ? 'bg-cyan-500 text-slate-950 border-white font-bold'
                        : lockedBeforeMoon
                        ? 'bg-slate-900/40 text-slate-600 border-slate-800 cursor-not-allowed'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-cyan-500/50 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* 1. EARTH BRIEFING */}
            {stage === 'earth_briefing' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4" data-testid="stage-earth-briefing">
                <div className="md:col-span-5 space-y-3">
                  <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                    <img
                      src={resource.referenceImage}
                      alt={resource.referenceCaption}
                      className="w-full h-56 object-cover"
                    />
                    <div className="p-2.5 text-[11px] text-slate-300 border-t border-slate-800">
                      {resource.referenceCaption}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="text-[11px] font-mono font-bold uppercase text-cyan-300">
                      Key Crew &amp; Spacecraft
                    </div>
                    {resource.crew.map(c => (
                      <div key={c.name} className="text-xs flex flex-col border-b border-slate-800/70 pb-1.5 last:border-b-0 last:pb-0">
                        <span className="font-bold text-white">{c.name}</span>
                        <span className="text-slate-400">
                          {c.role} • {c.spacecraft}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-7 flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-amber-300 font-display">
                      {resource.subtitle}
                    </h3>
                    <div className="space-y-2 text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {resource.earthBriefingIntro.map((line, i) => (
                        <p key={i} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                          {line}
                        </p>
                      ))}
                    </div>

                    {resource.spacecraftPair && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {resource.spacecraftPair.map(sp => (
                          <div key={sp.name} className="p-3 rounded-xl bg-slate-950 border border-amber-500/30">
                            <div className="text-xs font-bold text-amber-300">{sp.name}</div>
                            <p className="text-[11px] text-slate-300 mt-1">{sp.role}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    data-testid="moon-resource-launch-btn"
                    onClick={handleBriefingLaunch}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-xl transition"
                  >
                    <Rocket className="w-5 h-5" />
                    <span>
                      {currentPlanet === 'moon'
                        ? `Enter ${resource.transitionYearHeading} Reconstruction`
                        : 'Launch Space Shuttle to the Moon (Real Flight)'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* 2. AWAITING REAL SPACE SHUTTLE FLIGHT EARTH -> MOON */}
            {stage === 'awaiting_shuttle' && (
              <div className="space-y-4 max-w-2xl mx-auto text-center py-4" data-testid="stage-awaiting-shuttle">
                <div className="p-4 rounded-2xl bg-slate-950 border-2 border-cyan-400/60 space-y-3">
                  <Rocket className="w-10 h-10 text-amber-400 mx-auto animate-pulse" />
                  <h3 className="text-lg font-bold font-display text-white">
                    Step 1: Fly Your Modern Space Shuttle from {currentPlanet.toUpperCase()} to the Moon
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Your Space Shuttle stays separate from historic Apollo &amp; Surveyor spacecraft. Board your Space Shuttle on the Landing Pad, choose <strong className="text-cyan-300">MOON</strong>, and experience the continuous real-time takeoff, space flight, and lunar landing. Once your shuttle lands on the Moon, this mission’s historical timeline will open automatically!
                  </p>
                  <div className="text-xs font-mono text-amber-300 bg-slate-900 p-2 rounded-lg border border-slate-800">
                    Current Shuttle Status: <strong className="uppercase">{shuttleState.replace('_', ' ')}</strong>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                    <button
                      onClick={() => {
                        soundManager.playPing();
                        onTeleportNearShuttlePad();
                        setIsMinimized(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg"
                    >
                      Walk to Shuttle Launch Pad &amp; Press [E]
                    </button>

                    {shuttleState === 'seated_cockpit' && (
                      <button
                        onClick={() => {
                          soundManager.playPing();
                          onOpenShuttlePanel();
                        }}
                        className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg"
                      >
                        Open Shuttle Destination Screen
                      </button>
                    )}

                    <button
                      onClick={() => onStageChange('earth_briefing')}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
                    >
                      Back to Briefing
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. HISTORICAL TIME TRANSITION SCREEN */}
            {stage === 'time_transition' && (
              <div
                data-testid="stage-time-transition"
                className="p-6 rounded-2xl bg-slate-950 border-2 border-amber-400/70 text-center space-y-4 max-w-3xl mx-auto"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-mono font-bold">
                  <Clock className="w-4 h-4" />
                  <span>HISTORICAL MOON TRANSITION</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black font-display text-white tracking-wide">
                  {resource.transitionYearHeading}
                </h3>
                <p className="text-sm sm:text-base font-bold text-cyan-300">
                  {resource.transitionMissionHeading}
                </p>
                <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
                  Educational Reconstruction Mode: Step into NASA’s historical mission site while keeping your modern landing shuttle parked separately on the South-Polar apron.
                </p>
                {resourceId === 'apollo_lm' && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs text-cyan-200 max-w-xl mx-auto">
                    <strong>Time Zone Fact:</strong> Neil Armstrong stepped onto the Moon on{' '}
                    <strong>July 20, 1969 (U.S. EDT)</strong>, which equals{' '}
                    <strong>July 21, 1969 (02:56 UT)</strong> in Universal Time!
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      soundManager.playPing();
                      onStageChange('interactive_3d_lab');
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-lg"
                  >
                    <Layers className="w-4 h-4" />
                    <span>Open Interactive 3D Hardware Inspector</span>
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playPing();
                      onStageChange('historical_sequence');
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-lg"
                  >
                    <Play className="w-4 h-4" />
                    <span>Jump Straight to 3D Sequence</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. INTERACTIVE 3D MODEL LAB */}
            {stage === 'interactive_3d_lab' && (
              <div className="space-y-4">
                <InteractiveModelInspector
                  resourceId={resourceId}
                  accentColor={resource.accentColor}
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      soundManager.playPing();
                      onStageChange('historical_sequence');
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs shadow-lg"
                  >
                    <span>Continue to Live 3D Moon Sequence</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* 5. HISTORICAL 3D SEQUENCE */}
            {stage === 'historical_sequence' && (
              <div className="space-y-4" data-testid="stage-historical-sequence">
                <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-white font-display">
                      Live 3D Historical Sequence on the Lunar Surface
                    </h3>
                    <button
                      onClick={() => {
                        soundManager.playPing();
                        onTeleportNearHistoricalSite();
                        setIsMinimized(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 border border-cyan-500/40 text-cyan-300 font-mono text-xs"
                    >
                      Minimize Panel to Watch Outside
                    </button>
                  </div>

                  {/* Resource 01 Sequence */}
                  {resourceId === 'apollo_lm' && (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            soundManager.playPing();
                            onTeleportNearHistoricalSite();
                            onUpdateSyncState({
                              sequenceMode: 'eagle_descent',
                              sequencePlaying: true,
                              sequenceProgress: 0
                            });
                          }}
                          className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                        >
                          1. Play Eagle Descent &amp; Touchdown
                        </button>
                        <button
                          data-testid="play-apollo-ascent-btn"
                          onClick={() => {
                            soundManager.playIgnitionTransient(false);
                            onTeleportNearHistoricalSite();
                            onUpdateSyncState({
                              sequenceMode: 'eagle_ascent',
                              sequencePlaying: true,
                              sequenceProgress: 0
                            });
                            narrationManager.speak(
                              'Countdown to lunar liftoff! Watch the upper Ascent Stage ignite its rocket and blast off toward Columbia, while the lower Descent Stage stays permanently on the Moon as the launch platform!',
                              { priority: 'high' }
                            );
                          }}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-lg"
                        >
                          2. Play Ascent Stage Liftoff (Main Highlight)
                        </button>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-cyan-300 font-bold">
                            {runtimeTelemetry?.sequenceLabel || 'Select Descent or Ascent Liftoff above'}
                          </span>
                          <span className="text-amber-300 font-bold">
                            {Math.round(syncState.sequenceProgress * 100)}%
                          </span>
                        </div>
                        <input
                          aria-label="Scrub Apollo sequence progress"
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={syncState.sequenceProgress}
                          onChange={e =>
                            onUpdateSyncState({
                              sequencePlaying: false,
                              sequenceProgress: parseFloat(e.target.value)
                            })
                          }
                          className="w-full accent-amber-400"
                        />
                        {syncState.sequenceMode === 'eagle_ascent' && (
                          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                            <div className="p-2 rounded bg-slate-950 border border-amber-500/40 text-amber-200">
                              Descent Stage Altitude: <strong>{runtimeTelemetry?.descentAltitudeMeters ?? 0} m (Fixed Launch Pad)</strong>
                            </div>
                            <div className="p-2 rounded bg-slate-950 border border-sky-500/40 text-sky-200">
                              Ascent Stage Altitude: <strong>{runtimeTelemetry?.ascentAltitudeMeters ?? 0} m</strong>
                            </div>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                        <strong>July 22, 1969 UT Jettison Fact:</strong> After Armstrong and Aldrin safely transferred back into <em>Columbia</em> with Michael Collins, the Ascent Stage was jettisoned in lunar orbit. Its eventual lunar impact site is not definitively known.
                      </p>
                    </div>
                  )}

                  {/* Resource 02 Sequence */}
                  {resourceId === 'lunar_rover' && (
                    <div className="space-y-3">
                      <button
                        data-testid="deploy-lrv-btn"
                        onClick={() => {
                          soundManager.playPing();
                          onTeleportNearHistoricalSite();
                          onUpdateSyncState({
                            sequenceMode: 'lrv_deploy',
                            sequencePlaying: true,
                            sequenceProgress: 0
                          });
                        }}
                        className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg"
                      >
                        Deploy Lunar Rover from Falcon LM Bay
                      </button>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-sky-300 font-bold">
                            {runtimeTelemetry?.sequenceLabel || 'Click Deploy Rover to unfold wheels, batteries & seats'}
                          </span>
                          <span>{Math.round(syncState.sequenceProgress * 100)}%</span>
                        </div>
                        <input
                          aria-label="Scrub LRV deployment"
                          type="range"
                          min={0}
                          max={1}
                          step={0.02}
                          value={syncState.sequenceProgress}
                          onChange={e =>
                            onUpdateSyncState({
                              sequenceMode: 'lrv_deploy',
                              sequencePlaying: false,
                              sequenceProgress: parseFloat(e.target.value)
                            })
                          }
                          className="w-full accent-sky-400"
                        />
                      </div>
                    </div>
                  )}

                  {/* Resource 03 Sequence */}
                  {resourceId === 'alsep' && (
                    <div className="space-y-3">
                      <button
                        data-testid="deploy-alsep-btn"
                        onClick={() => {
                          soundManager.playPing();
                          onTeleportNearHistoricalSite();
                          onUpdateSyncState({
                            sequenceMode: 'alsep_deploy',
                            sequencePlaying: true,
                            sequenceProgress: 0,
                            alsepTransmitting: true
                          });
                        }}
                        className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg"
                      >
                        Deploy Apollo 12 ALSEP Station (~90 m NW of Intrepid)
                      </button>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-emerald-300 font-bold">
                            {runtimeTelemetry?.sequenceLabel || 'Deploy Central Station, SNAP-27 Pu-238 fuel capsule, and 6 instruments'}
                          </span>
                          <span>{Math.round(syncState.sequenceProgress * 100)}%</span>
                        </div>
                        <input
                          aria-label="Scrub ALSEP deployment"
                          type="range"
                          min={0}
                          max={1}
                          step={0.02}
                          value={syncState.sequenceProgress}
                          onChange={e =>
                            onUpdateSyncState({
                              sequenceMode: 'alsep_deploy',
                              sequencePlaying: false,
                              sequenceProgress: parseFloat(e.target.value)
                            })
                          }
                          className="w-full accent-emerald-400"
                        />
                      </div>
                    </div>
                  )}

                  {/* Resource 04 Sequence */}
                  {resourceId === 'surveyor' && (
                    <div className="space-y-3">
                      <button
                        data-testid="replay-surveyor-bounce-btn"
                        onClick={() => {
                          soundManager.playPing();
                          onTeleportNearHistoricalSite();
                          onUpdateSyncState({
                            sequenceMode: 'surveyor_bounce',
                            sequencePlaying: true,
                            sequenceProgress: 0
                          });
                        }}
                        className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs shadow-lg"
                      >
                        Play Surveyor 3 Three-Contact Bouncing Landing (April 20, 1967)
                      </button>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-purple-300 font-bold">
                            {runtimeTelemetry?.sequenceLabel || 'Reconstruct Contact 1 -> ~10 m Bounce -> Contact 2 -> ~3 m Bounce -> Soft Landing'}
                          </span>
                          <span>{Math.round(syncState.sequenceProgress * 100)}%</span>
                        </div>
                        <input
                          aria-label="Scrub Surveyor 3 bounce landing"
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={syncState.sequenceProgress}
                          onChange={e =>
                            onUpdateSyncState({
                              sequenceMode: 'surveyor_bounce',
                              sequencePlaying: false,
                              sequenceProgress: parseFloat(e.target.value)
                            })
                          }
                          className="w-full accent-purple-400"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      soundManager.playPing();
                      onStageChange('surface_exploration');
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-lg"
                  >
                    <span>Open Surface Science &amp; Exploration Lab</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* 6. SURFACE EXPLORATION & RESOURCE-SPECIFIC INTERACTIVE LABS */}
            {stage === 'surface_exploration' && (
              <div className="space-y-4" data-testid="stage-surface-exploration">
                {/* RESOURCE 01: Hotspots + Passive Laser Ranging Retroreflector + EASEP */}
                {resourceId === 'apollo_lm' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                        <div className="text-xs font-mono font-bold text-amber-300 uppercase">
                          Eagle Surface Hotspots
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {resource.hotspots.map(hs => (
                            <button
                              key={hs.id}
                              onClick={() => {
                                soundManager.playPing();
                                onUpdateSyncState({ activeHotspotId: hs.id });
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border ${
                                syncState.activeHotspotId === hs.id
                                  ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold'
                                  : 'bg-slate-900 border-slate-700 text-slate-300'
                              }`}
                            >
                              {hs.shortTitle}
                            </button>
                          ))}
                        </div>
                        {(() => {
                          const activeHs =
                            resource.hotspots.find(h => h.id === syncState.activeHotspotId) ||
                            resource.hotspots[3];
                          return (
                            <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-200">
                              <strong className="text-amber-300">{activeHs.label}: </strong>
                              {activeHs.explanation}
                            </div>
                          );
                        })()}
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-emerald-300 uppercase">
                            EASEP: Laser Ranging Retroreflector
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-[10px] font-mono text-cyan-300">
                            PASSIVE • NO POWER NEEDED
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Apollo 11 deployed EASEP (distinct from later full ALSEP stations on Apollo 12–17), including the passive Solar Wind Composition foil, PSE, Dust Detector, and this corner-cube Laser Retroreflector.
                        </p>
                        <button
                          data-testid="fire-retroreflector-laser-btn"
                          onClick={() => {
                            soundManager.playPing();
                            onUpdateSyncState({ laserPulseProgress: 0.01 });
                          }}
                          className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow"
                        >
                          Fire Earth → Moon Laser Pulse (3D Light Beam)
                        </button>
                        {laserPreview && (
                          <div className="p-2 rounded-lg bg-slate-900 border border-emerald-500/30 text-[11px] font-mono text-emerald-200 flex justify-between">
                            <span>LEG: {laserPreview.leg.replace(/_/g, ' ').toUpperCase()}</span>
                            <span>TIME: {laserPreview.elapsedSeconds.toFixed(3)} s</span>
                            <span>DIST: {laserPreview.measuredDistanceKm.toLocaleString()} km</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* RESOURCE 02: Playable LRV Driving + Apollo 15 / 16 / 17 Switcher + Walkback Limit */}
                {resourceId === 'lunar_rover' && (
                  <div className="space-y-3">
                    {/* Mission Selector (Separate Apollo 15, 16, 17 Sites — NEVER all 3 together!) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-950 border border-sky-500/40">
                      <span className="text-xs font-mono font-bold text-sky-300">
                        SELECT HISTORICAL LRV SITE (ONE AT A TIME):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {LRV_MISSIONS.map(m => (
                          <button
                            key={m.missionId}
                            data-testid={`select-lrv-mission-${m.missionId}`}
                            onClick={() => {
                              soundManager.playPing();
                              onUpdateSyncState({ lrvMissionId: m.missionId, lrvEvaIndex: 0 });
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border ${
                              syncState.lrvMissionId === m.missionId
                                ? 'bg-sky-500 text-slate-950 border-white'
                                : 'bg-slate-900 text-slate-300 border-slate-700'
                            }`}
                          >
                            {m.missionId === 'apollo_15'
                              ? 'Apollo 15 (Hadley)'
                              : m.missionId === 'apollo_16'
                              ? 'Apollo 16 (Descartes)'
                              : 'Apollo 17 (Taurus–Littrow)'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      <div className="md:col-span-7 p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="text-xs font-bold text-white">{activeLrvProfile.title}</div>
                            <div className="text-[11px] text-slate-400">
                              Drivers: {activeLrvProfile.drivers.join(' & ')} • CMP: {activeLrvProfile.cmp} • LM: {activeLrvProfile.lunarModuleName}
                            </div>
                          </div>
                          <button
                            data-testid="toggle-lrv-drive-btn"
                            onClick={() => {
                              soundManager.playPing();
                              onTeleportNearHistoricalSite();
                              onUpdateSyncState({ isDrivingLrv: !syncState.isDrivingLrv });
                              setIsMinimized(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-slate-950 font-black text-xs shadow"
                          >
                            <Car className="w-4 h-4" />
                            <span>
                              {syncState.isDrivingLrv ? 'Driving LRV (Minimize)' : 'Drive 3D LRV on Moon'}
                            </span>
                          </button>
                        </div>

                        {/* EVA Excursion Tabs */}
                        <div className="flex flex-wrap gap-1.5">
                          {activeLrvProfile.excursions.map((ex, idx) => (
                            <button
                              key={ex.id}
                              onClick={() => {
                                soundManager.playPing();
                                onUpdateSyncState({ lrvEvaIndex: idx });
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border ${
                                syncState.lrvEvaIndex === idx
                                  ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold'
                                  : 'bg-slate-900 border-slate-700 text-slate-300'
                              }`}
                            >
                              EVA {idx + 1} (~{ex.approxKm} km)
                            </button>
                          ))}
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                          <div className="font-bold text-amber-300">{activeLrvExcursion.name}</div>
                          <p className="text-slate-300">{activeLrvExcursion.description}</p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {activeLrvExcursion.waypoints.map(wp => {
                              const done = syncState.collectedWaypoints.includes(wp.id);
                              return (
                                <button
                                  key={wp.id}
                                  onClick={() => {
                                    soundManager.playSampleCollect();
                                    if (!done) {
                                      onUpdateSyncState({
                                        collectedWaypoints: [...syncState.collectedWaypoints, wp.id]
                                      });
                                    }
                                  }}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border ${
                                    done
                                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                                      : 'bg-slate-950 border-amber-500/40 text-amber-200'
                                  }`}
                                >
                                  {done ? 'Collected: ' : 'Sample: '}
                                  {wp.sampleName}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Walkback Safety Limit & Live Telemetry */}
                      <div className="md:col-span-5 p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                        <div className="text-xs font-mono font-bold text-amber-300 uppercase flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Walkback Limit &amp; Telemetry</span>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          Safety Rule: Never drive farther than your spacesuit oxygen lets you walk back on foot if the LRV stops! (Two 36V batteries provided redundancy.)
                        </p>
                        <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                          <div className="p-2 rounded bg-slate-900 border border-slate-800">
                            SPEED: <strong className="text-sky-300">{runtimeTelemetry?.lrvSpeedKmh ?? 0} km/h</strong>
                          </div>
                          <div className="p-2 rounded bg-slate-900 border border-slate-800">
                            BATTERY: <strong className="text-emerald-300">{runtimeTelemetry?.lrvBatteryPercent ?? 98}%</strong>
                          </div>
                          <div className="p-2 rounded bg-slate-900 border border-slate-800">
                            FROM LM: <strong className="text-white">{runtimeTelemetry?.walkbackDistanceMeters ?? 0} m</strong>
                          </div>
                          <div className="p-2 rounded bg-slate-900 border border-slate-800">
                            SAMPLES: <strong className="text-amber-300">{syncState.collectedWaypoints.length}</strong>
                          </div>
                        </div>
                        {runtimeTelemetry?.walkbackWarning && (
                          <div className="p-2 rounded bg-rose-950/80 border border-rose-500 text-rose-200 text-[11px] font-bold">
                            {runtimeTelemetry.walkbackWarning}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* RESOURCE 03: Apollo 12 ALSEP 6-Instrument Lab + Surveyor Visit + 5-Station Map */}
                {resourceId === 'alsep' && (
                  <div className="space-y-3">
                    <div className="px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-[11px] font-mono font-bold text-amber-200 flex items-center justify-between">
                      <span>EDUCATIONAL SIMULATION — NOT HISTORICAL MISSION DATA</span>
                      <span className="text-emerald-300">SNAP-27 POWER: ~70 W DC (~16 V) • ACTIVE</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      <div className="md:col-span-6 p-3.5 rounded-xl bg-slate-950 border border-emerald-500/35 space-y-2.5">
                        <div className="text-xs font-mono font-bold text-emerald-300">
                          APOLLO 12 SIX-INSTRUMENT SIMULATION LAB
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {APOLLO_12_ALSEP_INSTRUMENTS.map(inst => (
                            <button
                              key={inst.id}
                              data-testid={`alsep-inst-${inst.id}`}
                              onClick={() => {
                                soundManager.playPing();
                                onUpdateSyncState({ alsepSelectedId: inst.id });
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border ${
                                syncState.alsepSelectedId === inst.id
                                  ? 'bg-emerald-500 text-slate-950 border-white font-bold'
                                  : 'bg-slate-900 text-slate-300 border-slate-700'
                              }`}
                            >
                              {inst.code}
                            </button>
                          ))}
                        </div>

                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                          <div className="font-bold text-white">
                            {selectedAlsepInst.code} — {selectedAlsepInst.name}
                          </div>
                          <p className="text-slate-300">{selectedAlsepInst.plainExplanation}</p>

                          {/* Instrument-Specific Educational Visualization */}
                          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                            <div className="text-[10px] font-mono text-cyan-300 uppercase">
                              {selectedAlsepInst.simulationTitle} ({selectedAlsepInst.unitLabel})
                            </div>
                            {selectedAlsepInst.id === 'pse' && (
                              <div className="flex items-end gap-1 h-12">
                                {[20, 48, 88, 35, 95, 62, 24, 52, 74, 30, 18, 40].map((v, i) => (
                                  <div
                                    key={i}
                                    className="flex-1 bg-emerald-400/80 rounded-t"
                                    style={{ height: `${v}%` }}
                                  />
                                ))}
                              </div>
                            )}
                            {selectedAlsepInst.id === 'lsm' && (
                              <div className="space-y-1 font-mono text-[10px]">
                                <div>X-Axis Boom: +18 nT [██████░░░░]</div>
                                <div>Y-Axis Boom: -12 nT [████░░░░░░]</div>
                                <div>Z-Axis Boom: +31 nT [█████████░]</div>
                              </div>
                            )}
                            {selectedAlsepInst.id === 'sws' && (
                              <div className="text-[11px] font-mono text-amber-300">
                                Solar Proton Flux: ~420 km/s streaming directly onto airless regolith
                              </div>
                            )}
                            {selectedAlsepInst.id === 'side' && (
                              <div className="flex items-end gap-2 h-10 font-mono text-[9px] text-cyan-200">
                                <div className="flex-1 bg-cyan-500/70 h-5 text-center">10 eV</div>
                                <div className="flex-1 bg-cyan-500/85 h-9 text-center">100 eV</div>
                                <div className="flex-1 bg-cyan-400/60 h-6 text-center">500 eV</div>
                                <div className="flex-1 bg-cyan-500/40 h-3 text-center">3.5 keV</div>
                              </div>
                            )}
                            {selectedAlsepInst.id === 'ccig' && (
                              <div className="space-y-1 font-mono text-[10px]">
                                <div>Earth Sea-Level Air: 1.00 atm [████████████]</div>
                                <div className="text-emerald-300">Moon Surface Exosphere: &lt;10⁻¹² atm [▏]</div>
                              </div>
                            )}
                            {selectedAlsepInst.id === 'ldd' && (
                              <div className="text-[11px] font-mono text-amber-200">
                                Regolith Dust Layering &amp; Thermal Range (-170°C night to +120°C day) Monitored
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 5-Station Moon Map (Apollo 12, 14, 15, 16, 17) */}
                      <div className="md:col-span-6 p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                        <div className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          <span>5 ALSEP Stations Across Near-Side Moon</span>
                        </div>

                        <div className="relative w-full h-36 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 overflow-hidden">
                          <div className="absolute inset-4 rounded-full border border-slate-600/40 bg-slate-700/20" />
                          {ALSEP_FIVE_STATIONS.map((st, idx) => (
                            <button
                              key={st.mission}
                              onClick={() => {
                                soundManager.playPing();
                                setSelectedMapStationIdx(idx);
                              }}
                              style={{ left: `${st.mapPercent[0]}%`, top: `${st.mapPercent[1]}%` }}
                              className={`-translate-x-1/2 -translate-y-1/2 absolute px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border transition ${
                                selectedMapStationIdx === idx
                                  ? 'bg-emerald-400 text-slate-950 border-white scale-110 z-10'
                                  : 'bg-slate-950/90 text-emerald-300 border-emerald-500/50'
                              }`}
                            >
                              {st.mission.split(' ')[1]}
                            </button>
                          ))}
                        </div>

                        {(() => {
                          const st = ALSEP_FIVE_STATIONS[selectedMapStationIdx] || ALSEP_FIVE_STATIONS[0];
                          return (
                            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                              <div className="font-bold text-emerald-300">
                                {st.mission} ({st.year}) — {st.landingRegion} ({st.coordinatesLabel})
                              </div>
                              <div className="text-slate-200">
                                <strong>Instruments:</strong> {st.instruments.join(', ')}
                              </div>
                              <div className="text-amber-300 text-[10px]">{st.hasRetroreflectorNote}</div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* RESOURCE 04: Surface Sampler Soil Tests + Surveyor TV Camera View + 1969 Apollo 12 Visit */}
                {resourceId === 'surveyor' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      <div className="md:col-span-7 p-3.5 rounded-xl bg-slate-950 border border-purple-500/40 space-y-2.5">
                        <div className="text-xs font-mono font-bold text-purple-300 uppercase">
                          Soil Mechanics Surface Sampler Control (~1.5 m reach • ~18 cm deep)
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            data-testid="surveyor-trench-btn"
                            onClick={() => {
                              soundManager.playSampleCollect();
                              onAddSoilTestMark('trench');
                              onUpdateSyncState({
                                surveyorSamplerTest: 'trench',
                                surveyorTrenchCount: Math.min(4, syncState.surveyorTrenchCount + 1)
                              });
                            }}
                            className="px-3 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs"
                          >
                            Dig Trench ({syncState.surveyorTrenchCount}/4)
                          </button>
                          <button
                            data-testid="surveyor-bearing-btn"
                            onClick={() => {
                              soundManager.playPing();
                              onAddSoilTestMark('bearing');
                              onUpdateSyncState({
                                surveyorSamplerTest: 'bearing',
                                surveyorBearingCount: Math.min(4, syncState.surveyorBearingCount + 1)
                              });
                            }}
                            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                          >
                            Press Bearing Test ({syncState.surveyorBearingCount}/4)
                          </button>
                          <button
                            onClick={() => {
                              soundManager.playPing();
                              onAddSoilTestMark('impact');
                              onUpdateSyncState({
                                surveyorSamplerTest: 'impact',
                                surveyorImpactCount: Math.min(13, syncState.surveyorImpactCount + 1)
                              });
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                          >
                            Impact Drop ({syncState.surveyorImpactCount}/13)
                          </button>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                          <div className="font-bold text-emerald-300">
                            Soil Strength Result: ~10 psi / ~0.7 kg/cm² (~98 kPa)
                          </div>
                          <p className="text-slate-300">
                            The lunar soil held vertical trench walls like damp firm wet sand—proving an Apollo Lunar Module landing pad would NOT sink out of sight!
                          </p>
                        </div>
                      </div>

                      <div className="md:col-span-5 p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
                        <div className="text-xs font-mono font-bold text-cyan-300 uppercase">
                          Camera View &amp; Nov 1969 Apollo 12 Visit
                        </div>
                        <button
                          data-testid="toggle-surveyor-camera-btn"
                          onClick={() => {
                            soundManager.playPing();
                            onUpdateSyncState({ surveyorCameraPov: !syncState.surveyorCameraPov });
                            setIsMinimized(true);
                          }}
                          className="w-full py-2 rounded-lg bg-slate-900 hover:bg-cyan-500/20 border border-cyan-500/50 text-cyan-200 font-bold flex items-center justify-center gap-1.5"
                        >
                          <Camera className="w-4 h-4" />
                          <span>
                            {syncState.surveyorCameraPov
                              ? 'Switch to Human View'
                              : 'View Through 1967 TV Camera (6,326 Photos)'}
                          </span>
                        </button>

                        <button
                          data-testid="toggle-apollo12-visit-btn"
                          onClick={() => {
                            soundManager.playPing();
                            onUpdateSyncState({ surveyor1969Visit: !syncState.surveyor1969Visit });
                          }}
                          className={`w-full py-2 rounded-lg font-bold border ${
                            syncState.surveyor1969Visit
                              ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                              : 'bg-slate-900 border-slate-700 text-slate-200'
                          }`}
                        >
                          {syncState.surveyor1969Visit
                            ? '1969 Mode: Intrepid (~180 m) & Crew Visible'
                            : 'BACK TO NOVEMBER 1969 — Apollo 12 Visit'}
                        </button>

                        {syncState.surveyor1969Visit && (
                          <button
                            data-testid="recover-surveyor-parts-btn"
                            onClick={() => {
                              soundManager.playSampleCollect();
                              onUpdateSyncState({
                                surveyorRecoveredParts: !syncState.surveyorRecoveredParts
                              });
                            }}
                            className="w-full py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold"
                          >
                            {syncState.surveyorRecoveredParts
                              ? 'Recovered: TV Camera & Sampler Returned (Body Stays)'
                              : 'Recover Only TV Camera & Sampler for Earth Study'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      soundManager.playPing();
                      onStageChange('comparison_and_timeline');
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-lg"
                  >
                    <span>Review Timeline &amp; Engineering Comparison</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* 7. COMPARISON & TIMELINE */}
            {stage === 'comparison_and_timeline' && (
              <div className="space-y-4" data-testid="stage-comparison-timeline">
                {resourceId === 'apollo_lm' && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/40">
                      <h4 className="text-xs font-mono font-bold text-amber-300 uppercase mb-2">
                        Descent Stage vs. Ascent Stage + EASEP Note
                      </h4>
                      {APOLLO_LM_COMPARISON.map(r => (
                        <div key={r.metric} className="grid grid-cols-3 text-xs py-1.5 border-b border-slate-800/70">
                          <span className="font-bold text-slate-400">{r.metric}</span>
                          <span className="text-amber-200">{r.descent}</span>
                          <span className="text-sky-200">{r.ascent}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {resourceId === 'lunar_rover' && (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-sky-500/40 text-center">
                      <h4 className="text-sm font-black font-display text-white">
                        THE LAST DRIVE — THREE SEPARATE ROVERS PARKED FOREVER ON THE MOON
                      </h4>
                      <p className="text-xs text-slate-300 mt-1">
                        Notice each rover stayed strictly at its own landing valley—never all three in one spot!
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {LRV_MISSIONS.map(m => (
                        <div key={m.missionId} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                          <div className="font-bold text-sky-300">{m.title}</div>
                          <div className="text-slate-300">{m.landingDate} • {m.landingRegion}</div>
                          <div className="text-slate-200">Crew: {m.drivers.join(' & ')}</div>
                          <div className="text-amber-300 font-mono font-bold">
                            Approx. Distance: {m.approxDistanceKm} km
                          </div>
                          <div className="text-[11px] text-slate-400">{m.samplesWeightLabel}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {resourceId === 'alsep' && (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/45 text-center space-y-1">
                      <h4 className="text-sm sm:text-base font-black font-display text-white">
                        THE ASTRONAUTS WENT HOME. THE SCIENCE CONTINUED.
                      </h4>
                      <p className="text-xs text-emerald-300 font-mono font-bold">
                        NETWORK SHUTDOWN: SEPTEMBER 30, 1977 (EASEP on Apollo 11 vs. Full ALSEP on 12, 14, 15, 16, 17)
                      </p>
                      <p className="text-[11px] text-slate-300">
                        Separate Fact: Laser Ranging Retroreflectors were separate passive arrays on Apollo 11, 14, and 15—NOT installed at Apollo 12!
                      </p>
                    </div>
                  </div>
                )}

                {resourceId === 'surveyor' && (
                  <div className="space-y-2">
                    <div className="text-xs font-mono font-bold text-purple-300 uppercase">
                      Complete NASA Surveyor 1–7 Program Outcomes (1966–1968)
                    </div>
                    <div className="space-y-1.5">
                      {SURVEYOR_PROGRAM_ENTRIES.map(e => (
                        <div
                          key={e.mission}
                          className={`p-2.5 rounded-xl border text-xs grid grid-cols-1 sm:grid-cols-4 gap-2 ${
                            e.isSuccess
                              ? 'bg-slate-950 border-emerald-500/35'
                              : 'bg-rose-950/25 border-rose-500/40'
                          }`}
                        >
                          <div className="font-bold text-white">
                            {e.mission} <span className="block text-[10px] font-mono text-slate-400">{e.launchDate}</span>
                          </div>
                          <div className={`font-mono font-bold ${e.isSuccess ? 'text-emerald-300' : 'text-rose-300'}`}>
                            {e.outcome}
                          </div>
                          <div className="text-slate-300">{e.location}</div>
                          <div className="text-slate-200">{e.contribution}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shared Historical Timeline */}
                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold text-cyan-300 uppercase">
                    Mission Historical Timeline
                  </div>
                  <div className="space-y-2">
                    {resource.timeline.map((ev, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950/85 border border-slate-800 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{ev.title}</span>
                          <span className="font-mono text-amber-300 text-[11px]">{ev.date}</span>
                        </div>
                        <p className="text-slate-300 mt-1">{ev.detail}</p>
                        {ev.timezoneNote && (
                          <p className="text-cyan-300 text-[11px] mt-1 font-mono">{ev.timezoneNote}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    data-testid="start-resource-quiz-btn"
                    onClick={() => {
                      soundManager.playPing();
                      onStageChange('quiz');
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-slate-950 font-black text-xs shadow-lg"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Take {quizQuestions.length}-Question Mission Quiz</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* 8. EMBEDDED HISTORICAL MISSION QUIZ */}
            {stage === 'quiz' && (
              <div className="max-w-3xl mx-auto space-y-4" data-testid="stage-quiz">
                {!quizDone ? (
                  (() => {
                    const q = quizQuestions[quizIndex];
                    const isAnswered = selectedOption !== null;
                    const isCorrect = selectedOption === q.correctIndex;
                    return (
                      <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-3">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-purple-300 font-bold">
                            QUESTION {quizIndex + 1} / {quizQuestions.length}
                          </span>
                          <span className="text-emerald-300">SCORE: {quizCorrectCount}</span>
                        </div>

                        <h3 className="text-base font-bold text-white">{q.question}</h3>

                        <div className="space-y-2">
                          {q.options.map((opt, idx) => {
                            let cls = 'bg-slate-900 border-slate-700 text-slate-200 hover:border-cyan-400';
                            if (isAnswered) {
                              if (idx === q.correctIndex) {
                                cls = 'bg-emerald-950/70 border-emerald-400 text-emerald-200 font-bold';
                              } else if (idx === selectedOption) {
                                cls = 'bg-rose-950/70 border-rose-400 text-rose-200';
                              } else {
                                cls = 'bg-slate-900/50 border-slate-800 text-slate-500';
                              }
                            }
                            return (
                              <button
                                key={idx}
                                data-testid={`quiz-option-${idx}`}
                                disabled={isAnswered}
                                onClick={() => {
                                  setSelectedOption(idx);
                                  if (idx === q.correctIndex) {
                                    soundManager.playMissionComplete();
                                    setQuizCorrectCount(c => c + 1);
                                    narrationManager.speak(`Correct! ${q.explanation}`, { priority: 'normal' });
                                  } else {
                                    soundManager.playPing();
                                    narrationManager.speak(`Good try! ${q.explanation}`, { priority: 'normal' });
                                  }
                                }}
                                className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between transition ${cls}`}
                              >
                                <span>{opt}</span>
                                {isAnswered && idx === q.correctIndex && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                )}
                                {isAnswered && idx === selectedOption && idx !== q.correctIndex && (
                                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {isAnswered && (
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                            <div className={isCorrect ? 'text-emerald-300 font-bold' : 'text-amber-300 font-bold'}>
                              {isCorrect ? 'Great Answer!' : 'Historical Explanation:'}
                            </div>
                            <p className="text-slate-200">{q.explanation}</p>
                            <p className="text-cyan-300 italic">Fun Fact: {q.funFact}</p>
                          </div>
                        )}

                        {isAnswered && (
                          <div className="flex justify-end">
                            <button
                              data-testid="quiz-next-btn"
                              onClick={() => {
                                soundManager.playPing();
                                if (quizIndex + 1 < quizQuestions.length) {
                                  setQuizIndex(i => i + 1);
                                  setSelectedOption(null);
                                } else {
                                  const finalPercent = Math.round(
                                    (quizCorrectCount / quizQuestions.length) * 100
                                  );
                                  onRecordQuizScore(`moon_${resourceId}`, finalPercent);
                                  onMarkCompleted(resourceId);
                                  setQuizDone(true);
                                  onStageChange('completed');
                                }
                              }}
                              className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
                            >
                              {quizIndex + 1 < quizQuestions.length ? 'Next Question' : 'Complete Mission'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : null}
              </div>
            )}

            {/* 9. MISSION COMPLETED & NASA REFERENCE SOURCES */}
            {stage === 'completed' && (
              <div className="space-y-4 max-w-3xl mx-auto" data-testid="stage-completed">
                <div className="p-5 rounded-2xl bg-slate-950 border-2 border-emerald-400/70 text-center space-y-2">
                  <Award className="w-12 h-12 text-amber-400 mx-auto" />
                  <h3 className="text-xl font-black font-display text-white">
                    MISSION COMPLETED — {resource.shortTitle.toUpperCase()}
                  </h3>
                  <p className="text-xs text-emerald-300 font-mono">
                    {quizDone
                      ? `Quiz Score: ${quizCorrectCount} / ${quizQuestions.length} (${Math.round(
                          (quizCorrectCount / quizQuestions.length) * 100
                        )}%)`
                      : 'Educational Mission Complete & Verified'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-mono font-bold text-cyan-300 uppercase">
                    What You Learned
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-200 list-disc list-inside">
                    {resource.learningSummary.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-xs font-mono font-bold text-amber-300 uppercase">
                    Official NASA Sources
                  </div>
                  {resource.sources.map(src => (
                    <a
                      key={src.url}
                      href={src.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-400 text-xs text-slate-200"
                    >
                      <span>
                        <strong>{src.title}</strong> ({src.publisher})
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    </a>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  <button
                    onClick={() => {
                      soundManager.playPing();
                      onStageChange('historical_sequence');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Replay Sequence</span>
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playPing();
                      onStageChange('interactive_3d_lab');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold"
                  >
                    Revisit 3D Model
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playPing();
                      setQuizIndex(0);
                      setSelectedOption(null);
                      setQuizCorrectCount(0);
                      setQuizDone(false);
                      onStageChange('quiz');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-bold"
                  >
                    Repeat Quiz
                  </button>
                  <button
                    onClick={() => {
                      soundManager.playPing();
                      onReturnToHub();
                    }}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs flex items-center gap-1.5"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Explore Other Moon Resources</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
