import React, { useEffect, useState } from 'react';
import {
  computeDawnIonTrajectory,
  computeIngenuityFlightStep,
  computeKeplerTransitLightCurve,
  computePathfinderEdlState,
  computePhoenixFrostSublimation,
  computePioneerTrajectories,
  computeSojournerMissionCounter,
  computeVikingEdlState,
  INGENUITY_FLIGHT_PHASES,
  INGENUITY_SUMMARY_STATS,
  isInHabitableZoneAU,
  MARS_AND_SPACE_RESOURCES,
  MER_INSTRUMENTS,
  MER_TWIN_PROFILES,
  SOJOURNER_ROCK_TARGETS
} from '../marsResources/marsResourceData';
import { MARS_AND_SPACE_QUIZZES } from '../marsResources/marsResourceQuizzes';
import {
  MarsAndSpaceResourceId,
  MarsResourceStage,
  MarsSurfaceResourceId
} from '../marsResources/marsResourceTypes';
import { MarsWorldSyncState } from '../marsResources/MarsResourceWorldManager';
import { SpaceMission3DStage } from '../marsResources/SpaceMission3DStage';
import { PlanetId } from '../types';
import { ShuttleInteractionState } from '../shuttle/shuttleTravelState';
import { narrationManager } from '../narration/narrationManager';
import { soundManager } from '../audio/soundManager';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Compass,
  ExternalLink,
  Languages,
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
  XCircle
} from 'lucide-react';

interface MarsResourceOverlayProps {
  resourceId: MarsAndSpaceResourceId;
  stage: MarsResourceStage;
  onStageChange: (stage: MarsResourceStage) => void;
  currentPlanet: PlanetId;
  shuttleState: ShuttleInteractionState;
  syncState: MarsWorldSyncState;
  onUpdateSyncState: (patch: Partial<MarsWorldSyncState>) => void;
  onTeleportNearShuttlePad: () => void;
  onTeleportNearMarsSite: (id: MarsAndSpaceResourceId) => void;
  onOpenShuttlePanel: () => void;
  onRecordQuizScore: (quizId: string, scorePercent: number) => void;
  onMarkCompleted: (id: MarsAndSpaceResourceId, secondaryBadge?: string) => void;
  onReturnToHub: () => void;
  onClose: () => void;
}

const STAGE_TABS: { id: MarsResourceStage; label: string }[] = [
  { id: 'briefing', label: 'Briefing' },
  { id: 'time_transition', label: 'Era Jump' },
  { id: 'interactive_3d_lab', label: '3D Model' },
  { id: 'historical_sequence', label: 'Mission Lab' },
  { id: 'science_discoveries', label: 'Discoveries' },
  { id: 'timeline_legacy', label: 'Timeline' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'completed', label: 'Complete' }
];

const PLAQUE_REGIONS = [
  {
    id: 'hydrogen',
    title: 'Hydrogen Hyperfine Clock (21-cm Transition)',
    detail:
      'Top-left circles show a hydrogen atom flipping its electron spin—a universal cosmic ruler (~1,420 MHz frequency / 21 cm wavelength) used to measure all lengths and times on the plaque.'
  },
  {
    id: 'pulsars',
    title: '14-Pulsar Galactic Map to Our Sun',
    detail:
      'Fourteen radial lines show directions and binary-encoded spin periods of bright neutron stars (pulsars) relative to our Sun—allowing interstellar finders to triangulate Earth’s location and launch epoch.'
  },
  {
    id: 'trajectory',
    title: 'Solar System & Pioneer Trajectory',
    detail:
      'Across the bottom sit the Sun and planets (including ringed Saturn), with a miniature Pioneer arrow curving past Jupiter/Saturn out into deep space—showing where the probe departed from.'
  },
  {
    id: 'humans',
    title: 'Human Figures & Spacecraft Scale Silhouette',
    detail:
      'Drawn in front of the 2.74 m dish silhouette at matching scale so anyone comparing the figures to the real spacecraft immediately knows human height and proportions.'
  }
];

export const MarsResourceOverlay: React.FC<MarsResourceOverlayProps> = ({
  resourceId,
  stage,
  onStageChange,
  currentPlanet,
  shuttleState,
  syncState,
  onUpdateSyncState,
  onTeleportNearShuttlePad,
  onTeleportNearMarsSite,
  onOpenShuttlePanel,
  onRecordQuizScore,
  onMarkCompleted,
  onReturnToHub,
  onClose
}) => {
  const res = MARS_AND_SPACE_RESOURCES[resourceId];
  const quizList = MARS_AND_SPACE_QUIZZES[resourceId];
  const isMarsSurfaceMission =
    res.category === 'mars' &&
    (resourceId === 'sojourner' ||
      resourceId === 'spirit_opportunity' ||
      resourceId === 'viking_1' ||
      resourceId === 'phoenix_insight' ||
      resourceId === 'curiosity' ||
      resourceId === 'ingenuity');

  const [isMinimized, setIsMinimized] = useState(false);
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [showTranscript, setShowTranscript] = useState(false);
  const [didInteractLab, setDidInteractLab] = useState(false);

  // Sojourner states
  const [edlProgress, setEdlProgress] = useState(0.82);
  const [selectedRockId, setSelectedRockId] = useState<'barnacle_bill' | 'yogi' | 'scooby_doo'>(
    'barnacle_bill'
  );
  const [solCounter01, setSolCounter01] = useState(1);

  // Spirit & Opportunity states
  const [merRover, setMerRover] = useState<'spirit' | 'opportunity'>('opportunity');
  const [merInstrumentId, setMerInstrumentId] = useState<string>('pancam');
  const [merArmExt, setMerArmExt] = useState<number>(0.6);

  // Viking 1 states
  const [vikingEdl, setVikingEdl] = useState(0.92);
  const [vikingSiteChoice, setVikingSiteChoice] = useState<'rough_initial' | 'safe_chryse'>('safe_chryse');
  const [vikingScanLines, setVikingScanLines] = useState(72);

  // Phoenix & InSight states
  const [piChapter, setPiChapter] = useState<'phoenix' | 'insight'>(
    syncState.phoenixOrInsightChapter
  );
  const [frostSol, setFrostSol] = useState(1);
  const [quakeView, setQuakeView] = useState<'waveform' | 'interior'>('waveform');

  // Curiosity states
  const [curLaserOn, setCurLaserOn] = useState(syncState.curiosityLaserActive ?? true);
  const [curArmExt, setCurArmExt] = useState(syncState.curiosityArmExtended ? 1 : 0.45);
  const [curiosityStagePhase, setCuriosityStagePhase] = useState<'skycrane' | 'yellowknife' | 'mount_sharp'>('yellowknife');

  // Ingenuity states
  const [ingPitch, setIngPitch] = useState(0.85);
  const [ingRpm, setIngRpm] = useState(2537);
  const [ingSimAlt, setIngSimAlt] = useState(3.2);
  const [ingSimVy, setIngSimVy] = useState(0);
  const [ingDamagedView, setIngDamagedView] = useState(false);

  // Dawn states
  const [dawnBody, setDawnBody] = useState<'vesta' | 'ceres'>('ceres');
  const [dawnCutaway, setDawnCutaway] = useState(false);
  const [dawnIonOn, setDawnIonOn] = useState(true);
  const [dawnDays, setDawnDays] = useState(4);
  const [dawnProgress, setDawnProgress] = useState(0.62);

  // Pioneer states
  const [pioneerCraft, setPioneerCraft] = useState<'pioneer_10' | 'pioneer_11'>('pioneer_11');
  const [pioneerProgress, setPioneerProgress] = useState(0.5);
  const [pioneer3dMode, setPioneer3dMode] = useState<'spacecraft' | 'plaque' | 'flyby'>('plaque');
  const [plaqueRegionId, setPlaqueRegionId] = useState<string>('pulsars');

  // Kepler states
  const [kepler3dMode, setKepler3dMode] = useState<'observatory' | 'transit'>('transit');
  const [keplerPhase, setKeplerPhase] = useState(0.5);
  const [keplerRadiusRatio, setKeplerRadiusRatio] = useState(0.12);
  const [keplerNoise, setKeplerNoise] = useState(0.001);
  const [keplerK2Roll, setKeplerK2Roll] = useState(0);
  const [hzStarLum, setHzStarLum] = useState(1.0);
  const [hzDistAu, setHzDistAu] = useState(1.0);

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  useEffect(() => {
    setQuizIndex(0);
    setSelectedOption(null);
    setQuizCorrectCount(0);
    setQuizDone(false);
    setIsMinimized(false);
    setDidInteractLab(false);
  }, [resourceId]);

  const currentScript =
    (lang === 'hi' ? res.narrationHi[stage] : res.narrationEn[stage]) ||
    (lang === 'hi' ? res.narrationHi.briefing : res.narrationEn.briefing) ||
    res.briefingSummary[0];

  useEffect(() => {
    if (currentScript) {
      narrationManager.speak(currentScript, {
        priority: 'normal',
        dedupeKey: `mars_res_${resourceId}_${stage}_${lang}`,
        cooldownMs: 2500,
        lang
      });
    }
  }, [resourceId, stage, lang, currentScript]);

  const handleLaunchFromBriefing = () => {
    soundManager.playPing();
    if (!isMarsSurfaceMission) {
      if (currentPlanet === 'mars') {
        onTeleportNearMarsSite(resourceId);
      }
      onStageChange('time_transition');
      return;
    }
    if (currentPlanet === 'mars') {
      onStageChange('time_transition');
      onTeleportNearMarsSite(resourceId);
    } else {
      onStageChange('awaiting_shuttle');
      narrationManager.speak(
        'Step aboard your Space Shuttle on Earth, press E to enter the cockpit, and select Mars for your real space flight!',
        { priority: 'high', lang }
      );
    }
  };

  if (isMinimized) {
    return (
      <div
        data-testid="mars-resource-minimized-bar"
        className="fixed top-16 left-4 z-30 pointer-events-auto max-w-md rounded-2xl bg-slate-950 border-2 border-orange-400/70 p-3 shadow-2xl space-y-2"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono uppercase text-orange-300 font-bold">
              {res.resourceNumber} • {res.eraBadge}
            </div>
            <div className="text-xs font-bold text-white">{res.shortTitle}</div>
          </div>
          <button
            data-testid="mars-resource-expand-btn"
            onClick={() => {
              soundManager.playPing();
              setIsMinimized(false);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-500 text-slate-950 font-mono text-[11px] font-bold"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Open Lab</span>
          </button>
        </div>
      </div>
    );
  }

  const edlState = computePathfinderEdlState(edlProgress);
  const sojCounter = computeSojournerMissionCounter(solCounter01);
  const selectedRock =
    SOJOURNER_ROCK_TARGETS.find(r => r.id === selectedRockId) || SOJOURNER_ROCK_TARGETS[0];
  const merProfile = MER_TWIN_PROFILES.find(m => m.id === merRover) || MER_TWIN_PROFILES[1];
  const selectedMerInst =
    MER_INSTRUMENTS.find(i => i.id === merInstrumentId) || MER_INSTRUMENTS[0];
  const vikState = computeVikingEdlState(vikingEdl);
  const phoenixFrost = computePhoenixFrostSublimation(frostSol);
  const dawnTraj = computeDawnIonTrajectory(dawnProgress);
  const pioneerTraj = computePioneerTrajectories(pioneerCraft, pioneerProgress);
  const keplerSample = computeKeplerTransitLightCurve(keplerPhase, keplerRadiusRatio, keplerNoise);
  const hzEval = isInHabitableZoneAU(hzStarLum, hzDistAu);
  const ingFlightEval = computeIngenuityFlightStep({
    collectivePitch: ingPitch,
    rotorRpm: ingRpm,
    airDensityRatioToEarth: 0.01,
    altitudeMeters: ingSimAlt,
    verticalVelocityMps: ingSimVy,
    dt: 0.08
  });

  // Build clean SVG light-curve points for Kepler
  const lightCurvePoints: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const ph = i / 40;
    const pt = computeKeplerTransitLightCurve(ph, keplerRadiusRatio, keplerNoise);
    const x = 12 + ph * 276;
    const dipNormalized = Math.max(-0.08, Math.min(0.01, pt.relativeBrightness - 1));
    const y = 18 - dipNormalized * 950;
    lightCurvePoints.push(`${x.toFixed(1)},${Math.min(92, Math.max(10, y)).toFixed(1)}`);
  }

  const markLabAction = () => {
    if (!didInteractLab) setDidInteractLab(true);
  };

  return (
    <div
      data-testid="mars-resource-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-950/92 animate-fade-in"
    >
      <div className="relative w-full max-w-5xl max-h-[94vh] flex flex-col bg-slate-900 border border-orange-500/40 rounded-2xl shadow-2xl overflow-hidden hud-glow">
        {/* TOP BAR */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase text-slate-950 shrink-0"
              style={{ backgroundColor: res.accentColor }}
            >
              {res.resourceNumber}
            </span>
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase text-slate-400 truncate">
                {res.categoryLabel}
              </div>
              <h2 className="text-sm sm:text-base font-bold font-display text-white truncate">
                {res.fullTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Bilingual EN / Hindi Selector */}
            <button
              data-testid="mars-lang-toggle"
              onClick={() => {
                soundManager.playPing();
                setLang(prev => (prev === 'en' ? 'hi' : 'en'));
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-mono font-bold transition ${
                lang === 'hi'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                  : 'bg-slate-800 border-slate-700 text-cyan-200'
              }`}
              title="Switch Narration & Story Language (English / Hindi)"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'EN / हिंदी' : 'हिंदी / EN'}</span>
            </button>

            <button
              onClick={() => {
                soundManager.playPing();
                narrationManager.speak(currentScript, { priority: 'high', lang });
              }}
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-cyan-300 hover:text-white transition"
              title="Listen / Replay Female Storyteller"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowTranscript(v => !v)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-200 hover:text-white"
            >
              {showTranscript ? 'Hide Script' : 'Transcript'}
            </button>

            {(isMarsSurfaceMission || currentPlanet === 'mars') && currentPlanet === 'mars' && (
              <button
                onClick={() => {
                  soundManager.playPing();
                  setIsMinimized(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-cyan-500/40 text-cyan-200 text-[11px] font-mono"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Explore 3D Mars</span>
              </button>
            )}

            <button
              onClick={() => {
                soundManager.playPing();
                narrationManager.stop();
                onReturnToHub();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-[11px] font-mono"
            >
              All 9 Missions
            </button>

            <button
              aria-label="Close Resource Overlay"
              onClick={() => {
                soundManager.playPing();
                onClose();
              }}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Optional Transcript Drawer */}
        {showTranscript && (
          <div className="px-5 py-2.5 bg-slate-950 border-b border-cyan-500/30 text-xs text-cyan-100 leading-relaxed">
            <span className="font-mono text-[10px] uppercase text-cyan-400 mr-2 font-bold">
              {lang === 'hi' ? 'STORYTELLER (HINDI):' : 'STORYTELLER (ENGLISH):'}
            </span>
            {currentScript}
          </div>
        )}

        {/* STAGE NAVIGATION TABS */}
        <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto">
          {STAGE_TABS.map(tab => {
            const active = stage === tab.id;
            return (
              <button
                key={tab.id}
                data-testid={`mars-stage-tab-${tab.id}`}
                onClick={() => {
                  soundManager.playPing();
                  onStageChange(tab.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold whitespace-nowrap transition border ${
                  active
                    ? 'bg-orange-500 text-slate-950 border-white shadow'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-600'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* STAGE BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* STAGE 1: BRIEFING */}
          {stage === 'briefing' && (
            <div className="space-y-4">
              {res.neverLandsNote && (
                <div className="p-3 rounded-xl bg-sky-950/70 border border-sky-400/50 text-xs text-sky-100 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-sky-300 shrink-0 mt-0.5" />
                  <span>{res.neverLandsNote}</span>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-[11px] font-mono uppercase text-orange-300 font-bold">
                      Mission Briefing • {res.eraBadge}
                    </div>
                    {res.briefingSummary.map((p, idx) => (
                      <p key={idx} className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                        {p}
                      </p>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-[11px] font-mono uppercase text-cyan-300 font-bold">
                      Scientific &amp; Engineering Objectives
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {res.missionObjectives.map((obj, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-[11px] font-mono uppercase text-amber-300 font-bold">
                      Mission Key Figures &amp; Program Team
                    </div>
                    {res.teamAndProgram.map(member => (
                      <div
                        key={member.name}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                      >
                        <strong className="text-white">{member.name}</strong>
                        <span className="text-slate-400 text-[11px]">{member.role}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {res.keySpecs.map(sp => (
                      <div key={sp.label} className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <div className="text-[10px] font-mono uppercase text-slate-400">{sp.label}</div>
                        <div className="text-xs font-semibold text-white mt-0.5">{sp.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => onStageChange('interactive_3d_lab')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono font-bold text-slate-200"
                >
                  Open Interactive 3D Lab Directly
                </button>

                <button
                  data-testid="mars-briefing-launch-btn"
                  onClick={handleLaunchFromBriefing}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-lg"
                >
                  <Rocket className="w-4 h-4" />
                  <span>
                    {!isMarsSurfaceMission
                      ? 'Launch Deep Space Historical Simulation'
                      : currentPlanet === 'mars'
                      ? 'Teleport to Mars Historical Site'
                      : 'Board Space Shuttle to Fly to Mars'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 1B: AWAITING SHUTTLE FLIGHT */}
          {stage === 'awaiting_shuttle' && (
            <div className="p-6 rounded-2xl bg-slate-950 border border-cyan-500/40 text-center space-y-4">
              <Rocket className="w-10 h-10 text-orange-400 mx-auto" />
              <h3 className="text-lg font-bold text-white font-display">
                Board Your Space Shuttle on Earth &amp; Fly to Mars
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                Remember: your reusable Space Shuttle is your modern exploration craft connecting planets—once you land on Mars, this overlay automatically transitions into the historical reconstruction!
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => {
                    onTeleportNearShuttlePad();
                    setIsMinimized(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold text-xs"
                >
                  Walk to Shuttle Pad ({shuttleState === 'seated_cockpit' ? 'Ready' : 'Teleport Near Pad'})
                </button>
                <button
                  onClick={() => onOpenShuttlePanel()}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  Open Shuttle Destination Selector
                </button>
                <button
                  onClick={() => onStageChange('time_transition')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono"
                >
                  Skip Shuttle Flight → Enter Historical Simulation
                </button>
              </div>
            </div>
          )}

          {/* STAGE 2: TIME TRANSITION */}
          {stage === 'time_transition' && (
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-950 border-2 border-orange-500/50 text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-500/20 border border-orange-400/50 text-orange-300 text-xs font-mono font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>HISTORICAL RECONSTRUCTION WINDOW</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-black font-display tracking-wide text-white">
                {res.transitionHeading}
              </h3>
              <p className="text-sm text-cyan-300 font-semibold">{res.transitionSubheading}</p>
              <p className="text-xs text-slate-300 max-w-2xl mx-auto leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800">
                {res.timeTravelDisclaimer}
              </p>
              <div className="pt-2">
                <button
                  data-testid="mars-enter-3d-lab-btn"
                  onClick={() => {
                    soundManager.playDiscoveryInspect();
                    onStageChange('interactive_3d_lab');
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg"
                >
                  <span>Enter Interactive 3D Hardware &amp; Mission Lab</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 3: INTERACTIVE 3D HARDWARE LAB */}
          {stage === 'interactive_3d_lab' && (
            <div className="space-y-3">
              <SpaceMission3DStage
                resourceId={resourceId}
                activeHotspotId={syncState.activeHotspotId}
                edlProgress={edlProgress}
                merVariant={merRover}
                merArmExt={merArmExt}
                vikingOrbiterSep={vikingEdl < 0.3 ? 0.1 : 1}
                vikingArmScoop={vikingEdl}
                phoenixInsightMode={piChapter}
                phoenixFrostSol={frostSol}
                curiosityLaserOn={curLaserOn}
                curiosityArmExt={curArmExt}
                ingenuityAltMeters={ingSimAlt}
                ingenuityFlight72Damaged={ingDamagedView}
                dawnTargetWorld={dawnBody}
                dawnCutaway={dawnCutaway}
                dawnIonOn={dawnIonOn}
                pioneerMode={pioneer3dMode}
                pioneerFlybyPlanet={pioneerCraft === 'pioneer_11' ? 'saturn' : 'jupiter'}
                keplerMode={kepler3dMode}
                keplerTransitPhase={keplerPhase}
                keplerRadiusRatio={keplerRadiusRatio}
                keplerK2Roll={keplerK2Roll}
              />

              {/* Per-Resource Quick 3D Toggles */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                {resourceId === 'spirit_opportunity' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-cyan-300 font-bold">ROVER SKIN:</span>
                    {(['spirit', 'opportunity'] as const).map(v => (
                      <button
                        key={v}
                        onClick={() => {
                          markLabAction();
                          setMerRover(v);
                        }}
                        className={`px-2.5 py-1 rounded border uppercase font-bold ${
                          merRover === v
                            ? 'bg-cyan-500 text-slate-950 border-white'
                            : 'bg-slate-900 text-slate-300 border-slate-700'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                    <span className="text-slate-400 ml-2">IDD Arm Reach:</span>
                    <input
                      aria-label="MER IDD arm reach"
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={merArmExt}
                      onChange={e => {
                        markLabAction();
                        setMerArmExt(parseFloat(e.target.value));
                      }}
                      className="w-24 accent-cyan-400"
                    />
                  </div>
                )}

                {resourceId === 'phoenix_insight' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-cyan-300 font-bold">CHAPTER LANDER:</span>
                    <button
                      onClick={() => {
                        markLabAction();
                        setPiChapter('phoenix');
                      }}
                      className={`px-2.5 py-1 rounded border font-bold ${
                        piChapter === 'phoenix'
                          ? 'bg-cyan-500 text-slate-950 border-white'
                          : 'bg-slate-900 text-slate-300 border-slate-700'
                      }`}
                    >
                      Chapter A: Phoenix (2008)
                    </button>
                    <button
                      onClick={() => {
                        markLabAction();
                        setPiChapter('insight');
                      }}
                      className={`px-2.5 py-1 rounded border font-bold ${
                        piChapter === 'insight'
                          ? 'bg-rose-500 text-slate-950 border-white'
                          : 'bg-slate-900 text-slate-300 border-slate-700'
                      }`}
                    >
                      Chapter B: InSight (2018)
                    </button>
                  </div>
                )}

                {resourceId === 'curiosity' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-amber-300 font-bold">CURIOSITY CONTROLS:</span>
                    <button
                      onClick={() => {
                        markLabAction();
                        const next = !curLaserOn;
                        setCurLaserOn(next);
                        onUpdateSyncState({ curiosityLaserActive: next });
                      }}
                      className={`px-2.5 py-1 rounded border font-bold ${
                        curLaserOn
                          ? 'bg-rose-500 text-white border-white'
                          : 'bg-slate-900 text-slate-300 border-slate-700'
                      }`}
                    >
                      ChemCam Laser: {curLaserOn ? 'FIRING' : 'STANDBY'}
                    </button>
                    <span className="text-slate-400 ml-1">2.1m Drill Arm:</span>
                    <input
                      aria-label="Curiosity robotic drill arm reach"
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={curArmExt}
                      onChange={e => {
                        markLabAction();
                        const val = parseFloat(e.target.value);
                        setCurArmExt(val);
                        onUpdateSyncState({ curiosityArmExtended: val > 0.5 });
                      }}
                      className="w-24 accent-amber-400"
                    />
                  </div>
                )}

                {resourceId === 'ingenuity' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-emerald-300 font-bold">INGENUITY MODE:</span>
                    <button
                      onClick={() => {
                        markLabAction();
                        setIngDamagedView(false);
                        setIngSimAlt(3.5);
                      }}
                      className={`px-2.5 py-1 rounded border font-bold ${
                        !ingDamagedView
                          ? 'bg-emerald-500 text-slate-950 border-white'
                          : 'bg-slate-900 text-slate-300 border-slate-700'
                      }`}
                    >
                      Flight 1–71 Active Rotors
                    </button>
                    <button
                      onClick={() => {
                        markLabAction();
                        setIngDamagedView(true);
                        setIngSimAlt(0);
                      }}
                      className={`px-2.5 py-1 rounded border font-bold ${
                        ingDamagedView
                          ? 'bg-rose-500 text-slate-950 border-white'
                          : 'bg-slate-900 text-slate-300 border-slate-700'
                      }`}
                    >
                      Flight 72 Rotor Damage (Stationary)
                    </button>
                  </div>
                )}

                {resourceId === 'dawn' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        markLabAction();
                        setDawnBody('vesta');
                      }}
                      className={`px-2.5 py-1 rounded border font-bold ${
                        dawnBody === 'vesta'
                          ? 'bg-amber-400 text-slate-950 border-white'
                          : 'bg-slate-900 text-slate-300 border-slate-700'
                      }`}
                    >
                      Vesta Orbit (2011–12)
                    </button>
                    <button
                      onClick={() => {
                        markLabAction();
                        setDawnBody('ceres');
                      }}
                      className={`px-2.5 py-1 rounded border font-bold ${
                        dawnBody === 'ceres'
                          ? 'bg-sky-400 text-slate-950 border-white'
                          : 'bg-slate-900 text-slate-300 border-slate-700'
                      }`}
                    >
                      Ceres Orbit (2015–18)
                    </button>
                    <button
                      onClick={() => {
                        markLabAction();
                        setDawnCutaway(v => !v);
                      }}
                      className="px-2.5 py-1 rounded border border-cyan-500/50 bg-slate-900 text-cyan-200"
                    >
                      {dawnCutaway ? 'Solid Crust' : 'Interior Cutaway'}
                    </button>
                    <button
                      onClick={() => {
                        markLabAction();
                        setDawnIonOn(v => !v);
                      }}
                      className="px-2.5 py-1 rounded border border-sky-500/50 bg-slate-900 text-sky-300"
                    >
                      Ion Thruster: {dawnIonOn ? 'ON' : 'OFF'}
                    </button>
                  </div>
                )}

                {resourceId === 'pioneer' && (
                  <div className="flex flex-wrap items-center gap-2">
                    {(['spacecraft', 'plaque', 'flyby'] as const).map(m => (
                      <button
                        key={m}
                        onClick={() => {
                          markLabAction();
                          setPioneer3dMode(m);
                        }}
                        className={`px-2.5 py-1 rounded border uppercase font-bold ${
                          pioneer3dMode === m
                            ? 'bg-amber-400 text-slate-950 border-white'
                            : 'bg-slate-900 text-slate-300 border-slate-700'
                        }`}
                      >
                        {m === 'plaque' ? 'Golden Plaque 3D' : m}
                      </button>
                    ))}
                  </div>
                )}

                {resourceId === 'kepler' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        markLabAction();
                        setKepler3dMode('observatory');
                      }}
                      className={`px-2.5 py-1 rounded border font-bold ${
                        kepler3dMode === 'observatory'
                          ? 'bg-purple-400 text-slate-950 border-white'
                          : 'bg-slate-900 text-slate-300 border-slate-700'
                      }`}
                    >
                      Kepler Telescope
                    </button>
                    <button
                      onClick={() => {
                        markLabAction();
                        setKepler3dMode('transit');
                      }}
                      className={`px-2.5 py-1 rounded border font-bold ${
                        kepler3dMode === 'transit'
                          ? 'bg-amber-400 text-slate-950 border-white'
                          : 'bg-slate-900 text-slate-300 border-slate-700'
                      }`}
                    >
                      Star + Transiting Exoplanet
                    </button>
                  </div>
                )}

                <span className="text-[11px] text-slate-400">
                  Click any component badge below to highlight &amp; inspect:
                </span>
              </div>

              {/* Hotspots */}
              <div className="flex flex-wrap gap-1.5">
                {res.hotspots.map(hs => {
                  const selected = syncState.activeHotspotId === hs.id;
                  return (
                    <button
                      key={hs.id}
                      onClick={() => {
                        soundManager.playPing();
                        markLabAction();
                        onUpdateSyncState({ activeHotspotId: hs.id });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition ${
                        selected
                          ? 'bg-orange-500/25 border-orange-400 text-orange-200 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {hs.shortTitle}
                    </button>
                  );
                })}
              </div>

              {(() => {
                const hs = res.hotspots.find(h => h.id === syncState.activeHotspotId) || res.hotspots[0];
                return (
                  <div className="p-3 rounded-xl bg-slate-950 border border-orange-500/30 text-xs text-slate-200">
                    <strong className="text-orange-300">{hs.label}: </strong>
                    {hs.explanation}
                  </div>
                );
              })()}

              <div className="flex justify-end">
                <button
                  onClick={() => onStageChange('historical_sequence')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  <span>Next: Interactive Mission Lab</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 4: HISTORICAL SEQUENCE & ENGINEERING LAB */}
          {stage === 'historical_sequence' && (
            <div className="space-y-4">
              {resourceId === 'sojourner' && (
                <div className="space-y-3">
                  <SpaceMission3DStage resourceId="sojourner" edlProgress={edlProgress} />
                  <div className="p-4 rounded-xl bg-slate-950 border border-orange-500/40 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                      <span className="text-orange-300 font-bold">{edlState.phaseName}</span>
                      <span className="text-cyan-300">ALTITUDE: {edlState.altitudeMeters} m</span>
                    </div>
                    <input
                      aria-label="Pathfinder EDL timeline slider"
                      type="range"
                      min={0}
                      max={1}
                      step={0.02}
                      value={edlProgress}
                      onChange={e => {
                        markLabAction();
                        setEdlProgress(parseFloat(e.target.value));
                      }}
                      className="w-full accent-orange-400"
                    />
                    <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                      {[
                        { label: '1. Aero-Entry', v: 0.08 },
                        { label: '2. Parachute', v: 0.25 },
                        { label: '3. Airbag Bounce', v: 0.42 },
                        { label: '4. Petals Open', v: 0.64 },
                        { label: '5. July 5 Ramp Roll-Off', v: 0.98 }
                      ].map(step => (
                        <button
                          key={step.label}
                          onClick={() => {
                            soundManager.playPing();
                            markLabAction();
                            setEdlProgress(step.v);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200 hover:border-orange-400"
                        >
                          {step.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {resourceId === 'spirit_opportunity' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {MER_TWIN_PROFILES.map(prof => (
                    <div
                      key={prof.id}
                      className={`p-4 rounded-xl bg-slate-950 border space-y-2 ${
                        merRover === prof.id ? 'border-cyan-400' : 'border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white">{prof.name}</h4>
                        <button
                          onClick={() => {
                            markLabAction();
                            setMerRover(prof.id);
                          }}
                          className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-[10px] font-mono text-cyan-200"
                        >
                          Select {prof.id === 'spirit' ? 'Spirit' : 'Opportunity'}
                        </button>
                      </div>
                      <div className="text-[11px] font-mono text-amber-300">{prof.landingDateLabel}</div>
                      <div className="text-xs text-slate-300">{prof.landingSite}</div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800 text-xs text-cyan-200">
                        {prof.distanceNote}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Final Comm: {prof.finalCommDate} • End: {prof.missionEndDate} — {prof.endCause}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {resourceId === 'viking_1' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-950 border border-yellow-500/40 space-y-2">
                    <div className="text-xs font-mono font-bold text-yellow-300">
                      CRITICAL ENGINEERING DECISION: LANDING SITE SAFETY DELAY (JULY 1976)
                    </div>
                    <p className="text-xs text-slate-300">
                      Original pre-launch plan targeted July 4, 1976, but Viking 1 Orbiter photos revealed the initial Chryse region was dangerously rough! Pick the landing target:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          markLabAction();
                          setVikingSiteChoice('rough_initial');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono border ${
                          vikingSiteChoice === 'rough_initial'
                            ? 'bg-rose-500/25 border-rose-400 text-rose-200 font-bold'
                            : 'bg-slate-900 border-slate-700 text-slate-300'
                        }`}
                      >
                        Force July 4 Target (High Boulder Risk!)
                      </button>
                      <button
                        onClick={() => {
                          markLabAction();
                          setVikingSiteChoice('safe_chryse');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono border ${
                          vikingSiteChoice === 'safe_chryse'
                            ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 font-bold'
                            : 'bg-slate-900 border-slate-700 text-slate-300'
                        }`}
                      >
                        Delay to Smooth Western Chryse Planitia (22.483° N, 47.94° W — July 20)
                      </button>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200">
                      {vikingSiteChoice === 'rough_initial'
                        ? 'Hazard Warning: Early orbital imagery showed rocky channels—NASA engineers rejected July 4 and waited 16 extra days to save the lander!'
                        : 'Historic Success: Viking 1 Lander separated July 20, 1976 (08:32 UT) and touched down safely at 11:53:06 UT while Viking 1 Orbiter stayed in orbit.'}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-yellow-300 font-bold">{vikState.phaseLabel}</span>
                      <span className="text-cyan-300">
                        Orbiter: {vikState.orbiterAltitudeKm} km (NEVER LANDS)
                      </span>
                    </div>
                    <input
                      aria-label="Viking 1 orbital separation and descent slider"
                      type="range"
                      min={0}
                      max={1}
                      step={0.02}
                      value={vikingEdl}
                      onChange={e => {
                        markLabAction();
                        setVikingEdl(parseFloat(e.target.value));
                      }}
                      className="w-full accent-yellow-400"
                    />
                  </div>
                </div>
              )}

              {resourceId === 'phoenix_insight' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        markLabAction();
                        setPiChapter('phoenix');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border ${
                        piChapter === 'phoenix'
                          ? 'bg-cyan-500 text-slate-950 border-white'
                          : 'bg-slate-950 text-slate-300 border-slate-700'
                      }`}
                    >
                      Chapter A: Phoenix Arctic Ice Trench (2008)
                    </button>
                    <button
                      onClick={() => {
                        markLabAction();
                        setPiChapter('insight');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border ${
                        piChapter === 'insight'
                          ? 'bg-rose-500 text-slate-950 border-white'
                          : 'bg-slate-950 text-slate-300 border-slate-700'
                      }`}
                    >
                      Chapter B: InSight SEIS &amp; HP³ Mole (2018)
                    </button>
                  </div>

                  {piChapter === 'phoenix' ? (
                    <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-cyan-300 font-bold">
                          DODO-GOLDILOCKS ICE SUBLIMATION TRACKER
                        </span>
                        <span className="text-white">
                          Bright Ice Remaining: {phoenixFrost.visibleBrightIcePercent}%
                        </span>
                      </div>
                      <input
                        aria-label="Phoenix trench sublimation sol slider"
                        type="range"
                        min={0}
                        max={20}
                        step={1}
                        value={frostSol}
                        onChange={e => {
                          markLabAction();
                          setFrostSol(parseInt(e.target.value, 10));
                        }}
                        className="w-full accent-cyan-400"
                      />
                      <p className="text-xs text-slate-200">{phoenixFrost.phaseNote}</p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/40 space-y-2 text-xs text-slate-200">
                      <div className="font-mono font-bold text-rose-300">
                        STATIONARY LANDER • 1.8m ROBOTIC ARM + DEPLOYED INSTRUMENTS
                      </div>
                      <p>
                        <strong>SEIS Success:</strong> Placed directly onto Elysium Planitia regolith under a domed Wind &amp; Thermal Shield—detecting <strong>1,319 marsquakes</strong>.
                      </p>
                      <p className="text-amber-200">
                        <strong>HP³ ("The Mole") Engineering Honesty:</strong> Designed to hammer ~5 meters underground, the self-hammering heat probe encountered unexpectedly cohesive "duricrust" soil with insufficient wall friction and could not burrow deeply.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {resourceId === 'curiosity' && (
                <div className="space-y-3">
                  <SpaceMission3DStage
                    resourceId="curiosity"
                    curiosityLaserOn={curLaserOn}
                    curiosityArmExt={curArmExt}
                    activeHotspotId={
                      curiosityStagePhase === 'yellowknife' ? 'cur_arm' : curiosityStagePhase === 'mount_sharp' ? 'cur_chemcam' : 'cur_mmrtg'
                    }
                  />
                  <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-2.5">
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          { id: 'skycrane', label: '1. Aug 2012 Sky Crane Touchdown' },
                          { id: 'yellowknife', label: '2. 2013 Yellowknife Bay Lakebed Drill' },
                          { id: 'mount_sharp', label: '3. 2014–Present Climbing Mount Sharp' }
                        ] as const
                      ).map(ph => (
                        <button
                          key={ph.id}
                          onClick={() => {
                            soundManager.playPing();
                            markLabAction();
                            setCuriosityStagePhase(ph.id);
                            if (ph.id === 'yellowknife') {
                              setCurArmExt(0.95);
                              setCurLaserOn(true);
                            } else if (ph.id === 'mount_sharp') {
                              setCurArmExt(0.35);
                              setCurLaserOn(true);
                            } else {
                              setCurArmExt(0.1);
                              setCurLaserOn(false);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border ${
                            curiosityStagePhase === ph.id
                              ? 'bg-amber-400 text-slate-950 border-white'
                              : 'bg-slate-900 text-slate-300 border-slate-700'
                          }`}
                        >
                          {ph.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {curiosityStagePhase === 'skycrane'
                        ? 'Too heavy (~899 kg) for Pathfinder airbags, Curiosity descended beneath a supersonic parachute and hovering rocket Sky Crane before gently lowering its wheels onto Gale Crater.'
                        : curiosityStagePhase === 'yellowknife'
                        ? 'At Yellowknife Bay, Curiosity’s percussion drill bored into fine-grained mudstone—delivering sample powder to SAM & CheMin and proving ancient freshwater lakes were chemically habitable.'
                        : 'Ascending 5-km-tall Aeolis Mons (Mount Sharp), Curiosity reads billions of years of Martian climate shift from clay-rich lakes to salty sulfate slopes.'}
                    </p>
                  </div>
                </div>
              )}

              {resourceId === 'ingenuity' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                      <span className="text-emerald-300 font-bold">
                        AERODYNAMIC LIFT TEST IN &lt;1% EARTH AIR DENSITY
                      </span>
                      <span
                        className={
                          ingFlightEval.canHover ? 'text-emerald-300 font-bold' : 'text-amber-300'
                        }
                      >
                        Lift / Weight Ratio: {ingFlightEval.liftToWeightRatio}× (
                        {ingFlightEval.canHover ? 'HOVER ACHIEVED' : 'TOO LOW — SPIN FASTER'})
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                      <div>
                        <label className="text-slate-300 block mb-1">
                          Rotor Speed: {ingRpm} RPM (Mars Flight ~2,537 RPM)
                        </label>
                        <input
                          aria-label="Ingenuity rotor RPM"
                          type="range"
                          min={800}
                          max={2800}
                          step={50}
                          value={ingRpm}
                          onChange={e => {
                            markLabAction();
                            setIngRpm(parseInt(e.target.value, 10));
                          }}
                          className="w-full accent-emerald-400"
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 block mb-1">
                          Collective Blade Pitch: {Math.round(ingPitch * 100)}%
                        </label>
                        <input
                          aria-label="Ingenuity collective pitch"
                          type="range"
                          min={0.2}
                          max={1.0}
                          step={0.05}
                          value={ingPitch}
                          onChange={e => {
                            markLabAction();
                            setIngPitch(parseFloat(e.target.value));
                          }}
                          className="w-full accent-emerald-400"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          soundManager.playPing();
                          markLabAction();
                          const step = computeIngenuityFlightStep({
                            collectivePitch: ingPitch,
                            rotorRpm: ingRpm,
                            airDensityRatioToEarth: 0.01,
                            altitudeMeters: ingSimAlt,
                            verticalVelocityMps: ingSimVy,
                            dt: 0.1
                          });
                          setIngSimAlt(step.altitudeMeters);
                          setIngSimVy(step.verticalVelocityMps);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs font-mono"
                      >
                        Step Hover Impulse ({ingSimAlt} m)
                      </button>
                      <span className="text-[11px] text-slate-400">
                        April 19, 2021 Wright Brothers Field: first powered flight on another planet!
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {resourceId === 'dawn' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/40 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                      <span className="text-sky-300 font-bold">{dawnTraj.stageName}</span>
                      <span className="text-amber-300">{dawnTraj.dateLabel}</span>
                    </div>
                    <input
                      aria-label="Dawn mission trajectory slider"
                      type="range"
                      min={0}
                      max={1}
                      step={0.02}
                      value={dawnProgress}
                      onChange={e => {
                        markLabAction();
                        setDawnProgress(parseFloat(e.target.value));
                      }}
                      className="w-full accent-sky-400"
                    />
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
                      <div className="font-mono text-cyan-300 font-bold">
                        XENON ION THRUST ACCELERATION SIMULATOR (~0–60 mph in 4 days)
                      </div>
                      <input
                        aria-label="Days of xenon ion thrust"
                        type="range"
                        min={1}
                        max={120}
                        value={dawnDays}
                        onChange={e => {
                          markLabAction();
                          setDawnDays(parseInt(e.target.value, 10));
                        }}
                        className="w-full accent-sky-400"
                      />
                      <div className="text-slate-200">
                        After <strong>{dawnDays} continuous days</strong> of gentle xenon-ion thrust: cumulative speed change ≈{' '}
                        <strong className="text-sky-300">{dawnDays * 15} mph</strong> (~{Math.round(dawnDays * 24.1)} km/h) with tiny fuel mass!
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {resourceId === 'pioneer' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          markLabAction();
                          setPioneerCraft('pioneer_10');
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border ${
                          pioneerCraft === 'pioneer_10'
                            ? 'bg-amber-400 text-slate-950 border-white'
                            : 'bg-slate-900 text-slate-300 border-slate-700'
                        }`}
                      >
                        Pioneer 10 (1972 • Jupiter 1973)
                      </button>
                      <button
                        onClick={() => {
                          markLabAction();
                          setPioneerCraft('pioneer_11');
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border ${
                          pioneerCraft === 'pioneer_11'
                            ? 'bg-amber-400 text-slate-950 border-white'
                            : 'bg-slate-900 text-slate-300 border-slate-700'
                        }`}
                      >
                        Pioneer 11 (1973 • First Saturn 1979)
                      </button>
                    </div>
                    <input
                      aria-label="Pioneer outer solar system trajectory slider"
                      type="range"
                      min={0}
                      max={1}
                      step={0.02}
                      value={pioneerProgress}
                      onChange={e => {
                        markLabAction();
                        setPioneerProgress(parseFloat(e.target.value));
                      }}
                      className="w-full accent-amber-400"
                    />
                    <div className="text-xs text-slate-200 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <div className="font-mono text-amber-300 font-bold">
                        {pioneerTraj.dateLabel} • ~{pioneerTraj.approxDistanceAU} AU ({pioneerTraj.missionRole})
                      </div>
                      <p className="mt-1">{pioneerTraj.milestone}</p>
                    </div>
                  </div>
                </div>
              )}

              {resourceId === 'kepler' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <SpaceMission3DStage
                      resourceId="kepler"
                      keplerMode="transit"
                      keplerTransitPhase={keplerPhase}
                      keplerRadiusRatio={keplerRadiusRatio}
                      keplerK2Roll={keplerK2Roll}
                    />
                    <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/40 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-purple-300 font-bold">LIVE TRANSIT LIGHT CURVE</span>
                        <span className="text-amber-300">
                          Dip Depth ≈ {keplerSample.transitDepthPercent}%
                        </span>
                      </div>
                      <svg
                        viewBox="0 0 300 100"
                        className="w-full h-28 bg-slate-900 rounded-lg border border-slate-800"
                      >
                        <line x1="10" y1="18" x2="290" y2="18" stroke="#334155" strokeDasharray="3 3" />
                        <polyline
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="2.5"
                          points={lightCurvePoints.join(' ')}
                        />
                        <circle
                          cx={12 + keplerPhase * 276}
                          cy={Math.min(
                            92,
                            Math.max(10, 18 - (keplerSample.relativeBrightness - 1) * 950)
                          )}
                          r="4.5"
                          fill="#fbbf24"
                        />
                      </svg>
                      <div className="space-y-1.5 text-[11px] font-mono">
                        <div>
                          <label className="text-slate-300">
                            Orbital Phase: {keplerPhase.toFixed(2)} ({keplerSample.inTransit ? 'IN TRANSIT' : 'BASELINE'})
                          </label>
                          <input
                            aria-label="Kepler transit orbital phase"
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={keplerPhase}
                            onChange={e => {
                              markLabAction();
                              setKeplerPhase(parseFloat(e.target.value));
                            }}
                            className="w-full accent-purple-400"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-slate-300">
                              Planet Size Rp/R*: {keplerRadiusRatio.toFixed(2)}
                            </label>
                            <input
                              aria-label="Exoplanet radius ratio"
                              type="range"
                              min={0.03}
                              max={0.22}
                              step={0.01}
                              value={keplerRadiusRatio}
                              onChange={e => {
                                markLabAction();
                                setKeplerRadiusRatio(parseFloat(e.target.value));
                              }}
                              className="w-full accent-cyan-400"
                            />
                          </div>
                          <div>
                            <label className="text-slate-300">K2 Sunlight Roll Balance</label>
                            <input
                              aria-label="K2 sunlight pressure balance roll"
                              type="range"
                              min={-0.6}
                              max={0.6}
                              step={0.05}
                              value={keplerK2Roll}
                              onChange={e => {
                                markLabAction();
                                setKeplerK2Roll(parseFloat(e.target.value));
                              }}
                              className="w-full accent-amber-400"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => onStageChange('science_discoveries')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  <span>Next: Science Discoveries</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 5: SCIENCE DISCOVERIES */}
          {stage === 'science_discoveries' && (
            <div className="space-y-4">
              {resourceId === 'sojourner' && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {SOJOURNER_ROCK_TARGETS.map(r => (
                      <button
                        key={r.id}
                        data-testid={`sojourner-rock-${r.id}`}
                        onClick={() => {
                          soundManager.playDiscoveryInspect();
                          markLabAction();
                          setSelectedRockId(r.id);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border ${
                          selectedRockId === r.id
                            ? 'bg-orange-500 text-slate-950 border-white'
                            : 'bg-slate-950 text-slate-300 border-slate-700'
                        }`}
                      >
                        {r.name}
                      </button>
                    ))}
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-orange-500/40 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white">{selectedRock.name}</h4>
                      <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-[10px] font-mono text-cyan-200">
                        SIMULATED EDUCATIONAL APXS SPECTRUM
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{selectedRock.nickNote} {selectedRock.apxsFindings}</p>
                    <div className="space-y-1.5">
                      {selectedRock.spectrumPeaks.map(pk => (
                        <div key={pk.symbol} className="flex items-center gap-2 text-xs font-mono">
                          <span className="w-10 text-amber-300 font-bold">{pk.symbol}</span>
                          <div className="flex-1 h-3 rounded bg-slate-900 overflow-hidden border border-slate-800">
                            <div
                              className="h-full bg-gradient-to-r from-orange-500 to-cyan-400"
                              style={{ width: `${Math.round(pk.relativeIntensity * 100)}%` }}
                            />
                          </div>
                          <span className="text-slate-400 w-44 text-[11px] truncate">{pk.note}</span>
                        </div>
                      ))}
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-center justify-between gap-3 flex-wrap">
                      <span>
                        Longevity Counter: <strong className="text-emerald-300">{sojCounter.statusLabel}</strong>
                      </span>
                      <input
                        aria-label="Sojourner mission duration slider"
                        type="range"
                        min={0}
                        max={1}
                        step={0.02}
                        value={solCounter01}
                        onChange={e => setSolCounter01(parseFloat(e.target.value))}
                        className="w-36 accent-emerald-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {resourceId === 'spirit_opportunity' && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {MER_INSTRUMENTS.map(inst => (
                      <button
                        key={inst.id}
                        onClick={() => {
                          markLabAction();
                          setMerInstrumentId(inst.id);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono border ${
                          merInstrumentId === inst.id
                            ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        {inst.name}
                      </button>
                    ))}
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/40 text-xs text-slate-200">
                    <strong className="text-cyan-300">{selectedMerInst.full}: </strong>
                    {selectedMerInst.detail}
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                    <strong className="text-white">{merProfile.name} Major Discoveries:</strong>
                    {merProfile.keyDiscoveries.map(d => (
                      <div key={d} className="text-slate-300">• {d}</div>
                    ))}
                    <div className="text-amber-300 pt-1 font-mono text-[11px]">
                      Distance Milestone Note: NASA’s Perseverance surpassed Opportunity’s ~45.16 km off-Earth driving distance record on October 11, 2026.
                    </div>
                  </div>
                </div>
              )}

              {resourceId === 'viking_1' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-950 border border-yellow-500/40 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-yellow-300 font-bold">FIRST CLEAR SURFACE PHOTO LINE-SCAN</span>
                      <span className="text-white">{vikingScanLines}% Transmitted</span>
                    </div>
                    <input
                      aria-label="Viking 1 line-by-line photo reveal"
                      type="range"
                      min={10}
                      max={100}
                      value={vikingScanLines}
                      onChange={e => {
                        markLabAction();
                        setVikingScanLines(parseInt(e.target.value, 10));
                      }}
                      className="w-full accent-yellow-400"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="font-mono font-bold text-amber-300">DID VIKING FIND LIFE? (SCIENTIFIC CONSENSUS)</div>
                      <p className="text-slate-300">
                        Labeled Release (LR) gave positive gas reactivity—yet the <strong>GCMS detected zero organic carbon</strong>, leading scientists to suspect reactive Martian soil oxidants (perchlorates/peroxides). Result: <strong>Inconclusive / Unconfirmed</strong>.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="font-mono font-bold text-rose-300">WEATHER &amp; SEISMOMETER HONESTY NOTE</div>
                      <p className="text-slate-300">
                        Chryse Weather logged dawn lows near <strong>-86°C</strong> to afternoon highs near <strong>-33°C</strong>. Viking 1’s seismometer boom latch jammed, so <strong>Viking 1’s seismometer did NOT operate successfully</strong>. Combined Orbiters captured 52,663 images (~97% at 300 m).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {resourceId === 'phoenix_insight' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setQuakeView('waveform')}
                      className={`px-3 py-1 rounded text-xs font-mono border ${
                        quakeView === 'waveform'
                          ? 'bg-rose-500 text-slate-950 border-white font-bold'
                          : 'bg-slate-950 text-slate-300 border-slate-700'
                      }`}
                    >
                      1,319 Marsquakes &amp; Wind Sonification
                    </button>
                    <button
                      onClick={() => setQuakeView('interior')}
                      className={`px-3 py-1 rounded text-xs font-mono border ${
                        quakeView === 'interior'
                          ? 'bg-amber-400 text-slate-950 border-white font-bold'
                          : 'bg-slate-950 text-slate-300 border-slate-700'
                      }`}
                    >
                      3-Layer Mars Interior (Crust / Mantle / Core)
                    </button>
                  </div>
                  {quakeView === 'waveform' ? (
                    <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/40 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-mono text-rose-300">
                        <span>INSIGHT SEIS WAVEFORM • 1,319 MARSQUAKES</span>
                        <span>Audio Sonification / Data Translation</span>
                      </div>
                      <button
                        onClick={() => {
                          markLabAction();
                          soundManager.playDiscoveryInspect();
                        }}
                        className="px-3 py-1.5 rounded bg-rose-500/20 border border-rose-400 text-rose-200 font-mono font-bold"
                      >
                        <Play className="w-3 h-3 inline mr-1" /> Play Simulated Marsquake Tone
                      </button>
                      <p className="text-slate-300">
                        Mars sounds silent like thin wind—InSight engineers sped up ultra-low-frequency SEIS tremors into audible seismic sonifications. Also discovered Phoenix perchlorates &amp; high-altitude falling Martian snow!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-3 rounded-xl bg-slate-950 border border-orange-500/40">
                        <strong className="text-orange-300">Crust (25–40 km)</strong>
                        <p className="text-slate-300 mt-1">Thinner/fractured upper layer beneath Elysium.</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/40">
                        <strong className="text-amber-300">Silicate Mantle</strong>
                        <p className="text-slate-300 mt-1">Cooler rigid rocky mantle transmitting S &amp; P waves.</p>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-rose-500/40">
                        <strong className="text-rose-300">Molten Core (~1,800 km)</strong>
                        <p className="text-slate-300 mt-1">Liquid iron alloy enriched with lighter sulfur/oxygen/carbon.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {resourceId === 'curiosity' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-1.5">
                    <h4 className="font-bold text-amber-300">ChemCam Laser &amp; Habitability Verdict</h4>
                    <p className="text-slate-300">• ChemCam fires pulsed infrared laser beams up to 7 meters, reading glowing plasma wavelengths for Si, Fe, Mg, Mn &amp; hydrogen.</p>
                    <p className="text-slate-300">• Yellowknife Bay mudstones held neutral-pH clays plus carbon, hydrogen, oxygen, nitrogen, phosphorus &amp; sulfur—all key chemical ingredients for microbial life.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-1.5">
                    <h4 className="font-bold text-cyan-300">SAM Organic Molecules &amp; MMRTG Power</h4>
                    <p className="text-slate-300">• SAM detected preserved organic carbon molecules and fluctuating seasonal methane spikes in Gale Crater’s atmosphere.</p>
                    <p className="text-slate-300">• Plutonium-238 MMRTG keeps Curiosity exploring Mount Sharp year-round even when global dust storms darken solar rovers.</p>
                  </div>
                </div>
              )}

              {resourceId === 'ingenuity' && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block">TOTAL FLIGHTS</span>
                      <strong className="text-emerald-300 text-base">{INGENUITY_SUMMARY_STATS.totalFlights}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block">FLIGHT TIME</span>
                      <strong className="text-white text-base">{INGENUITY_SUMMARY_STATS.totalFlightMinutes} min</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block">TOTAL DISTANCE</span>
                      <strong className="text-cyan-300 text-base">{INGENUITY_SUMMARY_STATS.totalDistanceKm} km</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 block">PEAK ALT / SPEED</span>
                      <strong className="text-amber-300 text-base">24 m / 10 m/s</strong>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {INGENUITY_FLIGHT_PHASES.map(ph => (
                      <div key={ph.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="text-emerald-300 font-bold">{ph.title}</div>
                        <div className="text-[11px] font-mono text-slate-400">{ph.flightRange}</div>
                        <p className="text-slate-300 mt-1">{ph.summary}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-rose-500/40 text-slate-300">
                    <strong>Flight 72 Stationary Legacy ({INGENUITY_SUMMARY_STATS.formalEndDate}):</strong>{' '}
                    Blade damage during Jan 18, 2024 landing ended flight ops permanently. Future multi-rotor concepts such as NASA’s <strong>SkyFall</strong> remain unflown engineering proposals.
                  </div>
                </div>
              )}

              {resourceId === 'dawn' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-1.5">
                    <h4 className="font-bold text-amber-300">Vesta (2011–2012) — Rocky Protoplanet</h4>
                    <p className="text-slate-300">• South-polar <strong>Rheasilvia Basin</strong> (~500 km wide) &amp; soaring central peak.</p>
                    <p className="text-slate-300">• Differentiated rocky iron core, mantle &amp; crust; matched the <strong>HED meteorites</strong> found on Earth.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/40 space-y-1.5">
                    <h4 className="font-bold text-sky-300">Ceres (2015–2018) — Ice &amp; Salt Dwarf Planet</h4>
                    <p className="text-slate-300">• Bright sodium-carbonate salt spots inside <strong>Occator Crater</strong> &amp; 4 km <strong>Ahuna Mons</strong> cryovolcano.</p>
                    <p className="text-slate-300">• Water-rich differentiated interior with ancient brines (does NOT claim an intact global liquid ocean). Remains silently orbiting Ceres after Oct 31 / Nov 1, 2018 hydrazine end.</p>
                  </div>
                </div>
              )}

              {resourceId === 'pioneer' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-3">
                    <div className="text-xs font-mono font-bold text-amber-300">
                      INTERACTIVE PIONEER GOLDEN PLAQUE DECODER (CARL SAGAN, FRANK DRAKE &amp; LINDA SALZMAN SAGAN)
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {PLAQUE_REGIONS.map(reg => (
                        <button
                          key={reg.id}
                          onClick={() => {
                            soundManager.playPing();
                            markLabAction();
                            setPlaqueRegionId(reg.id);
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-mono border ${
                            plaqueRegionId === reg.id
                              ? 'bg-amber-400 text-slate-950 border-white font-bold'
                              : 'bg-slate-900 text-slate-300 border-slate-700'
                          }`}
                        >
                          {reg.title.split(' (')[0]}
                        </button>
                      ))}
                    </div>
                    {(() => {
                      const reg =
                        PLAQUE_REGIONS.find(r => r.id === plaqueRegionId) || PLAQUE_REGIONS[0];
                      return (
                        <div className="p-3 rounded-lg bg-slate-900 border border-amber-500/30 text-xs text-slate-200">
                          <strong className="text-amber-300">{reg.title}: </strong>
                          {reg.detail}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {resourceId === 'kepler' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/40 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                      <span className="text-purple-300 font-bold">HABITABLE ZONE SIMULATOR</span>
                      <span className="text-emerald-300 font-bold">
                        {hzEval.zone === 'habitable_zone'
                          ? 'CONSERVATIVE HABITABLE ZONE'
                          : hzEval.zone === 'too_hot'
                          ? 'TOO HOT (RUNAWAY STEAM)'
                          : 'TOO COLD (FROZEN ICE)'}{' '}
                        • Eq. Temp ≈ {hzEval.estimatedEquilibriumCelsius}°C
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                      <div>
                        <label className="text-slate-300 block mb-1">
                          Star Luminosity (Sun = 1.0): {hzStarLum.toFixed(2)} L☉
                        </label>
                        <input
                          aria-label="Host star luminosity"
                          type="range"
                          min={0.05}
                          max={2.5}
                          step={0.05}
                          value={hzStarLum}
                          onChange={e => {
                            markLabAction();
                            setHzStarLum(parseFloat(e.target.value));
                          }}
                          className="w-full accent-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 block mb-1">
                          Planet Orbital Distance: {hzDistAu.toFixed(2)} AU
                        </label>
                        <input
                          aria-label="Exoplanet orbital distance AU"
                          type="range"
                          min={0.15}
                          max={2.5}
                          step={0.05}
                          value={hzDistAu}
                          onChange={e => {
                            markLabAction();
                            setHzDistAu(parseFloat(e.target.value));
                          }}
                          className="w-full accent-purple-400"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-slate-200 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      {hzEval.note}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => onStageChange('timeline_legacy')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  <span>Next: Timeline &amp; Legacy</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 6: TIMELINE & LEGACY */}
          {stage === 'timeline_legacy' && (
            <div className="space-y-4">
              {res.legacyChain && (
                <div className="p-3 rounded-xl bg-slate-950 border border-orange-500/40 flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span className="text-orange-300 font-bold">ROVER LINEAGE:</span>
                  {res.legacyChain.map((item, i) => (
                    <React.Fragment key={item}>
                      <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white">
                        {item}
                      </span>
                      {i < res.legacyChain!.length - 1 && <span className="text-cyan-400">→</span>}
                    </React.Fragment>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                {res.timeline.map(ev => (
                  <div
                    key={ev.date + ev.title}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center gap-2"
                  >
                    <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-[11px] font-mono text-amber-300 shrink-0">
                      {ev.date}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white">{ev.title}</div>
                      <div className="text-xs text-slate-300">{ev.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <div className="font-mono font-bold text-cyan-300">OFFICIAL REFERENCES</div>
                {res.sources.map(src => (
                  <a
                    key={src.url}
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-cyan-200 hover:underline mr-4"
                  >
                    <span>{src.title} ({src.publisher})</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  data-testid="mars-go-quiz-btn"
                  onClick={() => onStageChange('quiz')}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold text-xs shadow-lg"
                >
                  <span>Take Mission Knowledge Quiz ({quizList.length} Questions)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 7: INTERACTIVE MISSION QUIZ */}
          {stage === 'quiz' && (
            <div className="space-y-4">
              {!didInteractLab && (
                <div className="p-2.5 rounded-xl bg-amber-950/70 border border-amber-500/40 text-xs text-amber-200 flex items-center justify-between gap-2">
                  <span>Tip: Try {res.requiredLabActionLabel} in the 3D/Science labs if you haven’t yet!</span>
                  <button
                    onClick={() => onStageChange('interactive_3d_lab')}
                    className="px-2.5 py-1 rounded bg-amber-400 text-slate-950 font-bold text-[11px]"
                  >
                    Open Lab
                  </button>
                </div>
              )}

              {!quizDone ? (
                (() => {
                  const q = quizList[quizIndex];
                  return (
                    <div
                      data-testid="mars-quiz-card"
                      className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
                        <span>
                          QUESTION {quizIndex + 1} OF {quizList.length}
                        </span>
                        <span>SCORE SO FAR: {quizCorrectCount}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white">{q.question}</h3>

                      <div className="space-y-2">
                        {q.options.map((opt, idx) => {
                          const answered = selectedOption !== null;
                          const isPick = selectedOption === idx;
                          const isCorrectOpt = q.correctIndex === idx;
                          let cls = 'bg-slate-900 border-slate-700 text-slate-200 hover:border-cyan-400';
                          if (answered) {
                            if (isCorrectOpt)
                              cls = 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold';
                            else if (isPick)
                              cls = 'bg-rose-500/20 border-rose-400 text-rose-200';
                          }
                          return (
                            <button
                              key={idx}
                              data-testid={`mars-quiz-opt-${idx}`}
                              disabled={answered}
                              onClick={() => {
                                soundManager.playPing();
                                setSelectedOption(idx);
                                if (idx === q.correctIndex) {
                                  setQuizCorrectCount(c => c + 1);
                                }
                              }}
                              className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm transition ${cls}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {selectedOption !== null && (
                        <div className="space-y-2 pt-2">
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 flex items-start gap-2">
                            {selectedOption === q.correctIndex ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            )}
                            <span>{q.explanation}</span>
                          </div>
                          <button
                            data-testid="mars-quiz-next-btn"
                            onClick={() => {
                              if (quizIndex + 1 < quizList.length) {
                                setQuizIndex(i => i + 1);
                                setSelectedOption(null);
                              } else {
                                const pct = Math.round((quizCorrectCount / quizList.length) * 100);
                                setQuizDone(true);
                                onRecordQuizScore(`mars_res_${resourceId}`, pct);
                                onMarkCompleted(resourceId, res.secondaryBadgeTitle);
                                onStageChange('completed');
                              }
                            }}
                            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                          >
                            {quizIndex + 1 < quizList.length ? 'Next Question' : 'Finish Quiz & Claim Badge'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : null}
            </div>
          )}

          {/* STAGE 8: COMPLETED SUMMARY & BADGE */}
          {stage === 'completed' && (
            <div
              data-testid="mars-resource-completed"
              className="p-6 rounded-2xl bg-slate-950 border-2 border-emerald-500/60 text-center space-y-4"
            >
              <Award className="w-12 h-12 text-amber-400 mx-auto" />
              <div className="space-y-1">
                <div className="text-xs font-mono uppercase text-emerald-400 font-bold">
                  MISSION COMPLETED • SCORE {Math.round((quizCorrectCount / quizList.length) * 100)}%
                </div>
                <h3 className="text-xl font-black font-display text-white">{res.badgeTitle}</h3>
                {res.secondaryBadgeTitle && (
                  <div className="text-xs font-mono text-rose-300 font-bold">
                    + {res.secondaryBadgeTitle}
                  </div>
                )}
              </div>

              <div className="max-w-xl mx-auto text-left space-y-1.5 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200">
                {res.learningSummary.map(item => (
                  <div key={item} className="flex items-start gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => {
                    setQuizIndex(0);
                    setSelectedOption(null);
                    setQuizCorrectCount(0);
                    setQuizDone(false);
                    onStageChange('quiz');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Quiz</span>
                </button>
                <button
                  onClick={() => {
                    narrationManager.stop();
                    onReturnToHub();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold text-xs"
                >
                  Explore More Missions (9 Total)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
