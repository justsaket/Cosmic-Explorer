import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ViewMode, PlanetId, ExplorerProfile, GameSettings,
  ScientificDiscovery, Mission, InventoryItem, FieldSample
} from './types';
import {
  loadProfile, saveProfile, loadSettings, saveSettings,
  resetAllData, calculateRank
} from './utils/persistence';
import { INITIAL_MISSIONS } from './missions/missionData';
import { WorldCanvas, SphericalTelemetryData } from './scene/WorldCanvas';
import { HUD } from './ui/HUD';
import { TitleScreen } from './ui/TitleScreen';
import { DestinationSelector } from './ui/DestinationSelector';
import { DiscoveryViewer } from './ui/DiscoveryViewer';
import { BackpackModal } from './ui/BackpackModal';
import { MissionsModal } from './ui/MissionsModal';
import { QuizModal } from './ui/QuizModal';
import { MissionControlModal } from './ui/MissionControlModal';
import { SettingsModal } from './ui/SettingsModal';
import { ControlsTutorialModal } from './ui/ControlsTutorialModal';
import { GravityLabModal } from './ui/GravityLabModal';
import { PlanetaryMapModal } from './ui/PlanetaryMapModal';
import { FieldNotebookModal } from './ui/FieldNotebookModal';
import { UnknownFrontierModal } from './ui/UnknownFrontierModal';
import { AiCoPilotModal } from './ui/AiCoPilotModal';
import { LandingTelemetry, HistoricalMissionVehicle } from './scene/LandingSequence';
import { AstronautPosture } from './astronaut/AstronautModel';
import {
  HabitablePlanetId,
  ShuttleCameraView,
  TravelTelemetrySnapshot,
  ShuttleInteractionState,
  SHUTTLE_PADS,
  isHabitablePlanet
} from './shuttle/shuttleTravelState';
import { MoonResourceHubModal } from './ui/MoonResourceHubModal';
import { MoonResourceOverlay } from './ui/MoonResourceOverlay';
import {
  MoonChronologicalEvent,
  MoonResourceId,
  MoonResourceStage
} from './moonResources/moonResourceTypes';
import { getMoonSiteCoordinates, getMoonProximityNarration } from './moonResources/moonResourceData';
import {
  MoonWorldRuntimeTelemetry,
  MoonWorldSyncState
} from './moonResources/MoonResourceWorldManager';
import { MarsResourceHubModal } from './ui/MarsResourceHubModal';
import { MarsResourceOverlay } from './ui/MarsResourceOverlay';
import {
  MarsAndSpaceResourceId,
  MarsChronologicalEvent,
  MarsResourceStage
} from './marsResources/marsResourceTypes';
import { getMarsSiteCoordinates, getMarsProximityNarration } from './marsResources/marsResourceData';
import {
  MarsWorldRuntimeTelemetry,
  MarsWorldSyncState
} from './marsResources/MarsResourceWorldManager';
import { soundManager } from './audio/soundManager';
import { narrationManager } from './narration/narrationManager';
import {
  getDestinationConfirmLine,
  getRoverStoryLine,
  getSampleReactionLine,
  getScannerReactionLine
} from './narration/storyDialogue';
import confetti from 'canvas-confetti';

const DEFAULT_MARS_SYNC_STATE: MarsWorldSyncState = {
  activeHotspotId: null,
  sequencePlaying: false,
  sequenceProgress: 1,
  selectedRockId: 'barnacle_bill',
  selectedMerRover: 'opportunity',
  phoenixOrInsightChapter: 'phoenix',
  phoenixFrostSol: 1,
  curiosityLaserActive: true,
  curiosityArmExtended: false,
  ingenuityTestFlying: true
};

const DEFAULT_MOON_SYNC_STATE: MoonWorldSyncState = {
  activeHotspotId: null,
  sequenceMode: 'idle',
  sequencePlaying: false,
  sequenceProgress: 0,
  laserPulseProgress: null,
  lrvMissionId: 'apollo_15',
  lrvEvaIndex: 0,
  isDrivingLrv: false,
  collectedWaypoints: [],
  alsepSelectedId: 'central',
  alsepTransmitting: true,
  surveyorSamplerTest: 'idle',
  surveyorTrenchCount: 0,
  surveyorBearingCount: 0,
  surveyorImpactCount: 0,
  surveyorCameraPov: false,
  surveyorCameraPan: 0,
  surveyor1969Visit: false,
  surveyorRecoveredParts: false
};

function getInitialRouteParams(): {
  autostart: boolean;
  viewMode: ViewMode;
  planet: PlanetId;
} {
  if (typeof window === 'undefined') {
    return { autostart: false, viewMode: 'universe', planet: 'earth' };
  }
  const params = new URLSearchParams(window.location.search);
  const autostart = params.get('autostart') === '1';
  const p = params.get('planet');
  if (autostart) {
    if (p === 'universe') {
      return { autostart: true, viewMode: 'universe', planet: 'earth' };
    }
    const targetPlanet: PlanetId = p === 'moon' || p === 'mars' ? p : 'earth';
    return { autostart: true, viewMode: 'surface', planet: targetPlanet };
  }
  return { autostart: false, viewMode: 'universe', planet: 'earth' };
}

export default function App() {
  const initialRoute = useMemo(() => getInitialRouteParams(), []);

  // 1. Persistent State
  const [profile, setProfile] = useState<ExplorerProfile>(() => loadProfile());
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());
  const [missions, setMissions] = useState<Mission[]>(() => {
    const saved = loadProfile();
    return INITIAL_MISSIONS.map(m => ({
      ...m,
      completed: saved.completedMissionIds.includes(m.id)
    }));
  });

  // 2. Navigation State
  const [showTitleScreen, setShowTitleScreen] = useState(!initialRoute.autostart);
  const [viewMode, setViewMode] = useState<ViewMode>(initialRoute.viewMode);
  const [currentPlanet, setCurrentPlanet] = useState<PlanetId>(initialRoute.planet);
  const [selectedPlanetTarget, setSelectedPlanetTarget] = useState<PlanetId | null>(null);

  // 3. Gameplay & Modal State
  const [activeMissionId, setActiveMissionId] = useState<string>('mission_lunar_first_steps');
  const [nearbyDiscovery, setNearbyDiscovery] = useState<ScientificDiscovery | null>(null);
  const [inspectedDiscovery, setInspectedDiscovery] = useState<ScientificDiscovery | null>(null);

  const [isBackpackOpen, setIsBackpackOpen] = useState(false);
  const [isMissionsOpen, setIsMissionsOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isMissionControlOpen, setIsMissionControlOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isGravityLabOpen, setIsGravityLabOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [isFrontierOpen, setIsFrontierOpen] = useState(false);

  // 4. Suit, Rover, Posture & Lighting State
  const [cameraMode, setCameraMode] = useState<'third-person' | 'first-person'>('third-person');
  const [isAiCoPilotOpen, setIsAiCoPilotOpen] = useState(false);
  const [georadarTrigger, setGeoradarTrigger] = useState(0);
  const [isGeoradarPulsing, setIsGeoradarPulsing] = useState(false);
  const [resetUniverseCameraTrigger, setResetUniverseCameraTrigger] = useState(0);
  const [posture, setPosture] = useState<AstronautPosture>('stand');
  const [isDrivingRover, setIsDrivingRover] = useState(false);
  const [sphericalTelemetry, setSphericalTelemetry] = useState<SphericalTelemetryData | null>(null);
  const [lightingMode, setLightingMode] = useState<'day' | 'sunset' | 'night'>('day');
  const [teleportRequest, setTeleportRequest] = useState<{
    x: number;
    z: number;
    seq: number;
    lat?: number;
    lon?: number;
    yaw?: number;
  } | null>(null);

  // 5. Space Shuttle & Interplanetary Travel State
  const [nearShuttle, setNearShuttle] = useState(false);
  const [shuttleTelemetry, setShuttleTelemetry] = useState<TravelTelemetrySnapshot | null>(null);
  const [shuttleCameraView, setShuttleCameraView] = useState<ShuttleCameraView>('cockpit');
  const [isPipEnabled, setIsPipEnabled] = useState(true);
  const [isShuttleDestinationOpen, setIsShuttleDestinationOpen] = useState(false);
  const [shuttleDestinationRequest, setShuttleDestinationRequest] = useState<{
    target: HabitablePlanetId;
    seq: number;
  } | null>(null);
  const [shuttleDirectLandingRequest, setShuttleDirectLandingRequest] = useState<{
    target: HabitablePlanetId;
    seq: number;
  } | null>(null);
  const [shuttleEnterTrigger, setShuttleEnterTrigger] = useState(0);
  const [shuttleExitTrigger, setShuttleExitTrigger] = useState(0);
  const [historicalMissionTrigger, setHistoricalMissionTrigger] = useState<{
    vehicle: HistoricalMissionVehicle;
    planet: HabitablePlanetId;
    seq: number;
  } | null>(null);
  const prevShuttleStateRef = useRef<ShuttleInteractionState>('on_foot');

  // 5b. Historical Moon Exploration Resources (01–04)
  const [isMoonResourceHubOpen, setIsMoonResourceHubOpen] = useState(false);
  const [activeMoonResource, setActiveMoonResource] = useState<MoonResourceId | null>(null);
  const [moonResourceStage, setMoonResourceStage] = useState<MoonResourceStage>('earth_briefing');
  const [moonResourceSyncState, setMoonResourceSyncState] = useState<MoonWorldSyncState>(
    DEFAULT_MOON_SYNC_STATE
  );
  const [moonSoilMarkRequest, setMoonSoilMarkRequest] = useState<{
    type: 'trench' | 'bearing' | 'impact';
    seq: number;
  } | null>(null);
  const [moonRuntimeTelemetry, setMoonRuntimeTelemetry] =
    useState<MoonWorldRuntimeTelemetry | null>(null);

  // 5c. Historical Mars, Outer Solar System & Exoplanet Resources (01–08)
  const [isMarsResourceHubOpen, setIsMarsResourceHubOpen] = useState(false);
  const [activeMarsResource, setActiveMarsResource] = useState<MarsAndSpaceResourceId | null>(null);
  const [marsResourceStage, setMarsResourceStage] = useState<MarsResourceStage>('briefing');
  const [marsResourceSyncState, setMarsResourceSyncState] = useState<MarsWorldSyncState>(
    DEFAULT_MARS_SYNC_STATE
  );
  const [marsRuntimeTelemetry, setMarsRuntimeTelemetry] =
    useState<MarsWorldRuntimeTelemetry | null>(null);

  // 6. Direct Landing & Scientific Exploration Triggers
  const [isLandingActive, setIsLandingActive] = useState(false);
  const [landingTelemetry, setLandingTelemetry] = useState<LandingTelemetry | null>(null);
  const [skipLandingTrigger, setSkipLandingTrigger] = useState(0);
  const [isScanningTrigger, setIsScanningTrigger] = useState(0);
  const [isCollectingTrigger, setIsCollectingTrigger] = useState(0);
  const [playerCoordinates, setPlayerCoordinates] = useState({ x: 0, y: 0, z: 0 });

  // 7. Virtual Controls
  const [virtualMoveVector, setVirtualMoveVector] = useState({ x: 0, y: 0 });
  const [virtualJumpTrigger, setVirtualJumpTrigger] = useState(0);

  // Keep document.body.dataset.* synced for automated Playwright inspection
  useEffect(() => {
    document.body.dataset.state = showTitleScreen ? 'title' : 'playing';
    document.body.dataset.cameraView = shuttleCameraView;
    document.body.dataset.pip = isPipEnabled ? 'true' : 'false';
  }, [showTitleScreen, shuttleCameraView, isPipEnabled]);

  // Open/close Shuttle Destination UI cleanly when boarding / launching / disembarking
  useEffect(() => {
    const nextState = shuttleTelemetry?.state ?? 'on_foot';
    const prevState = prevShuttleStateRef.current;
    if (nextState !== prevState) {
      prevShuttleStateRef.current = nextState;
      if (nextState === 'seated_cockpit') {
        setIsShuttleDestinationOpen(true);
      } else {
        setIsShuttleDestinationOpen(false);
      }
    }
  }, [shuttleTelemetry?.state]);

  // Advance Moon Resource from awaiting_shuttle -> time_transition once Space Shuttle lands & disembarks on Moon
  useEffect(() => {
    if (
      activeMoonResource &&
      moonResourceStage === 'awaiting_shuttle' &&
      currentPlanet === 'moon' &&
      viewMode === 'surface' &&
      (shuttleTelemetry?.state ?? 'on_foot') === 'on_foot'
    ) {
      setMoonResourceStage('time_transition');
      const coords = getMoonSiteCoordinates(activeMoonResource);
      setTeleportRequest(prev => ({
        x: coords.x,
        z: coords.z,
        yaw: coords.yaw,
        seq: (prev?.seq ?? 0) + 1
      }));
    }
  }, [activeMoonResource, moonResourceStage, currentPlanet, viewMode, shuttleTelemetry?.state]);

  // Advance Mars & Sky Resource from awaiting_shuttle -> time_transition once Space Shuttle lands & disembarks on Mars
  useEffect(() => {
    if (
      activeMarsResource &&
      marsResourceStage === 'awaiting_shuttle' &&
      currentPlanet === 'mars' &&
      viewMode === 'surface' &&
      (shuttleTelemetry?.state ?? 'on_foot') === 'on_foot'
    ) {
      setMarsResourceStage('time_transition');
      const coords = getMarsSiteCoordinates(activeMarsResource);
      setTeleportRequest(prev => ({
        x: coords.x,
        z: coords.z,
        yaw: coords.yaw,
        seq: (prev?.seq ?? 0) + 1
      }));
    }
  }, [activeMarsResource, marsResourceStage, currentPlanet, viewMode, shuttleTelemetry?.state]);

  // Proximity Storyteller Audio Lifecycle: auto-narrate on arrival, stop on leave/close, switch cleanly between objects
  const prevMoonProxRef = useRef<MoonResourceId | null>(null);
  const prevMarsProxRef = useRef<MarsAndSpaceResourceId | null>(null);
  const proxNarrationSeqRef = useRef(0);

  useEffect(() => {
    const canTrackMoonSurface =
      !showTitleScreen &&
      viewMode === 'surface' &&
      currentPlanet === 'moon' &&
      !isLandingActive &&
      (shuttleTelemetry?.state ?? 'on_foot') === 'on_foot';

    if (!canTrackMoonSurface) {
      if (prevMoonProxRef.current !== null) {
        prevMoonProxRef.current = null;
        narrationManager.stop();
      }
      return;
    }

    if (activeMoonResource || isMoonResourceHubOpen) {
      if (isMoonResourceHubOpen && prevMoonProxRef.current !== null) {
        prevMoonProxRef.current = null;
        narrationManager.stop();
      }
      return;
    }

    const curr = moonRuntimeTelemetry?.nearbyResourceId ?? null;
    if (curr === prevMoonProxRef.current) return;
    prevMoonProxRef.current = curr;
    narrationManager.stop();
    if (curr) {
      proxNarrationSeqRef.current += 1;
      narrationManager.speak(getMoonProximityNarration(curr), {
        priority: 'high',
        dedupeKey: `moon_prox_${curr}_${proxNarrationSeqRef.current}`,
        cooldownMs: 250
      });
    }
  }, [
    showTitleScreen,
    viewMode,
    currentPlanet,
    isLandingActive,
    shuttleTelemetry?.state,
    activeMoonResource,
    isMoonResourceHubOpen,
    moonRuntimeTelemetry?.nearbyResourceId
  ]);

  useEffect(() => {
    const canTrackMarsSurface =
      !showTitleScreen &&
      viewMode === 'surface' &&
      currentPlanet === 'mars' &&
      !isLandingActive &&
      (shuttleTelemetry?.state ?? 'on_foot') === 'on_foot';

    if (!canTrackMarsSurface) {
      if (prevMarsProxRef.current !== null) {
        prevMarsProxRef.current = null;
        narrationManager.stop();
      }
      return;
    }

    if (activeMarsResource || isMarsResourceHubOpen) {
      if (isMarsResourceHubOpen && prevMarsProxRef.current !== null) {
        prevMarsProxRef.current = null;
        narrationManager.stop();
      }
      return;
    }

    const curr = marsRuntimeTelemetry?.nearbyResourceId ?? null;
    if (curr === prevMarsProxRef.current) return;
    prevMarsProxRef.current = curr;
    narrationManager.stop();
    if (curr) {
      proxNarrationSeqRef.current += 1;
      narrationManager.speak(getMarsProximityNarration(curr), {
        priority: 'high',
        dedupeKey: `mars_prox_${curr}_${proxNarrationSeqRef.current}`,
        cooldownMs: 250
      });
    }
  }, [
    showTitleScreen,
    viewMode,
    currentPlanet,
    isLandingActive,
    shuttleTelemetry?.state,
    activeMarsResource,
    isMarsResourceHubOpen,
    marsRuntimeTelemetry?.nearbyResourceId
  ]);

  // Sync profile & settings to localStorage
  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveSettings(settings);
    soundManager.setVolumes(
      settings.audio.masterVolume,
      settings.audio.sfxVolume,
      settings.audio.musicVolume ?? settings.audio.ambienceVolume,
      settings.audio.muted,
      settings.audio.narrationVolume,
      settings.audio.narrationMuted
    );
    narrationManager.setVolume(settings.audio.narrationVolume * settings.audio.masterVolume);
    narrationManager.setRate(settings.audio.narrationSpeed || 0.96);
    narrationManager.setMasterMuted(settings.audio.muted);
    narrationManager.setMuted(Boolean(settings.audio.narrationMuted));
  }, [settings]);

  const missionsRef = useRef(missions);
  missionsRef.current = missions;

  // Objective progress updater
  const updateObjectiveProgress = useCallback(
    (
      type:
        | 'inspect_discovery'
        | 'collect_discoveries'
        | 'travel_distance'
        | 'perform_jump'
        | 'complete_quiz',
      valueIncrement: number,
      targetDiscoveryId?: string
    ) => {
      const prevMissions = missionsRef.current;
      let updatedAny = false;
      let newlyCompletedPoints = 0;
      const newlyCompletedIds: string[] = [];

      const nextMissions = prevMissions.map(m => {
        if (m.completed) return m;

        let missionComplete = true;
        const nextObjectives = m.objectives.map(obj => {
          if (obj.completed) return obj;

          let matches = false;
          if (obj.type === type) {
            if (type === 'inspect_discovery') {
              matches = obj.targetDiscoveryId === targetDiscoveryId;
            } else {
              matches = true;
            }
          }

          if (matches) {
            updatedAny = true;
            const newCount = Math.min(obj.targetCount, obj.currentCount + valueIncrement);
            const isFinished = newCount >= obj.targetCount;
            if (!isFinished) missionComplete = false;
            return {
              ...obj,
              currentCount: newCount,
              completed: isFinished
            };
          } else {
            if (!obj.completed) missionComplete = false;
            return obj;
          }
        });

        if (missionComplete && !m.completed) {
          newlyCompletedPoints += m.rewardPoints;
          newlyCompletedIds.push(m.id);
          return {
            ...m,
            objectives: nextObjectives,
            completed: true
          };
        }

        return {
          ...m,
          objectives: nextObjectives
        };
      });

      if (updatedAny) {
        setMissions(nextMissions);
      }

      if (newlyCompletedIds.length > 0) {
        soundManager.playMissionComplete();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.5 }
        });
        setProfile(p => {
          const nextPoints = p.totalPoints + newlyCompletedPoints;
          return {
            ...p,
            totalPoints: nextPoints,
            completedMissionIds: Array.from(new Set([...p.completedMissionIds, ...newlyCompletedIds])),
            rank: calculateRank(nextPoints, p.inventory.length)
          };
        });
      }
    },
    []
  );

  // Scientific Field Scanner Action
  const handleTriggerScanner = useCallback(() => {
    setIsScanningTrigger(prev => prev + 1);
    const pId: HabitablePlanetId = isHabitablePlanet(currentPlanet) ? currentPlanet : 'earth';
    narrationManager.speak(getScannerReactionLine(pId), {
      priority: 'low',
      dedupeKey: `scan_${pId}`,
      cooldownMs: 12000
    });
    if (nearbyDiscovery) {
      setTimeout(() => {
        setInspectedDiscovery(nearbyDiscovery);
      }, 700);
    }
  }, [nearbyDiscovery, currentPlanet]);

  // Geological Sample Collection Action
  const handleCollectSample = useCallback(() => {
    setIsCollectingTrigger(prev => prev + 1);

    const sampleCatalogs = {
      moon: [
        {
          name: 'Anorthosite Highland Crust',
          comp: 'Plagioclase Feldspar (92%), Pyroxene (5%), Ilmenite (3%)',
          goal: 'Measure lunar magma ocean cooling chronology and mantle crystallization'
        },
        {
          name: 'Titanium Ilmenite Basalt',
          comp: 'Ilmenite (FeTiO3 14%), Pyroxene (52%), Plagioclase (34%)',
          goal: 'Analyze deep mantle source temperatures during mare flooding'
        },
        {
          name: 'Cryogenic Cold-Trap Regolith',
          comp: 'Silicate Glass Dust (94.5%), Cryogenic H2O Frost (5.5%)',
          goal: 'Characterize solar wind implantation and cometary ice delivery'
        },
        {
          name: 'Orange Pyroclastic Bead',
          comp: 'Volcanic Glass with Zinc, Sulfur, and Chlorine coatings',
          goal: 'Investigate deep volatile degassing from lunar interior fire fountains'
        }
      ],
      mars: [
        {
          name: 'Smectite Clay Mudstone',
          comp: 'Hydrated Aluminum Phyllosilicate, Iron Hydroxide',
          goal: 'Identify organic carbon preservation in ancient lacustrine sediments'
        },
        {
          name: 'Hematite Spherical Concretion',
          comp: 'Crystalline Ferric Oxide (Fe2O3 96%), Quartz (4%)',
          goal: 'Determine neutral pH groundwater percolation and diagenetic history'
        },
        {
          name: 'Basaltic Olivine Regolith',
          comp: 'Olivine (Mg-Fe Silicate 42%), Augite (38%), Plagioclase (20%)',
          goal: 'Model volcanic weathering and atmospheric escape over 3.5 billion years'
        },
        {
          name: 'Sulfate-Rich Evaporite Strata',
          comp: 'Magnesium and Calcium Sulfates (Epsomite / Gypsum)',
          goal: 'Trace catastrophic drying sequences of ancient Martian paleolakes'
        }
      ],
      earth: [
        {
          name: 'Cape Canaveral Coquina Stone',
          comp: 'Calcite (Shell Fragments 85%), Quartz Sand (15%)',
          goal: 'Baseline comparative planetary geology sample'
        }
      ]
    };

    const list = sampleCatalogs[currentPlanet as 'moon' | 'mars' | 'earth'] || sampleCatalogs.moon;
    const item = list[Math.floor(Math.random() * list.length)];

    const newSample: FieldSample = {
      id: `sample_${Date.now()}`,
      name: item.name,
      planetId: currentPlanet as 'earth' | 'moon' | 'mars',
      locationName:
        currentPlanet === 'moon'
          ? 'South Pole-Aitken Rim'
          : currentPlanet === 'mars'
          ? 'Jezero Delta Sector'
          : 'Kennedy Space Complex',
      coordinates: [playerCoordinates.x, playerCoordinates.y, playerCoordinates.z],
      collectedAt: Date.now(),
      composition: item.comp,
      scientificGoal: item.goal
    };

    setProfile(p => ({
      ...p,
      collectedSamples: [...(p.collectedSamples || []), newSample],
      totalPoints: p.totalPoints + 150,
      rank: calculateRank(p.totalPoints + 150, p.inventory.length)
    }));

    updateObjectiveProgress('collect_discoveries', 1);
    const pId: HabitablePlanetId = isHabitablePlanet(currentPlanet) ? currentPlanet : 'earth';
    narrationManager.speak(getSampleReactionLine(pId), {
      priority: 'normal',
      dedupeKey: `sample_${pId}`,
      cooldownMs: 7000
    });
  }, [currentPlanet, playerCoordinates, updateObjectiveProgress]);

  const handleToggleVisor = () => {
    soundManager.playPing();
    let nextMode: 'gold_mirror' | 'clear_face' | 'hud_display' = 'gold_mirror';
    if (profile.visorMode === 'gold_mirror') nextMode = 'clear_face';
    else if (profile.visorMode === 'clear_face') nextMode = 'hud_display';
    else nextMode = 'gold_mirror';
    setProfile(p => ({ ...p, visorMode: nextMode }));
  };

  const handleToggleCloak = () => {
    soundManager.playPing();
    const nextCloak = !profile.cloakActive;
    setProfile(p => ({ ...p, cloakActive: nextCloak }));
  };

  const handleTriggerGeoradar = () => {
    soundManager.playDiscoveryInspect();
    setGeoradarTrigger(prev => prev + 1);
    setIsGeoradarPulsing(true);
    setTimeout(() => {
      setIsGeoradarPulsing(false);
    }, 1500);
  };

  const isDrivingRoverRef = useRef(isDrivingRover);
  isDrivingRoverRef.current = isDrivingRover;

  const handleToggleRover = useCallback(() => {
    soundManager.playPing();
    const pId: HabitablePlanetId = isHabitablePlanet(currentPlanet) ? currentPlanet : 'earth';
    const next = !isDrivingRoverRef.current;
    setIsDrivingRover(next);
    setPosture(next ? 'sit' : 'stand');
    narrationManager.speak(getRoverStoryLine(next, pId), {
      priority: 'low',
      dedupeKey: `rover_${next ? 'in' : 'out'}_${pId}`,
      cooldownMs: 9000
    });
  }, [currentPlanet]);

  const handleSetDrivingRover = useCallback((active: boolean) => {
    setIsDrivingRover(active);
    if (!active) {
      setPosture('stand');
    }
  }, []);

  const isMasterMutedRef = useRef(settings.audio.muted);
  isMasterMutedRef.current = settings.audio.muted;

  const handleToggleMasterMute = useCallback(() => {
    const nextMuted = !isMasterMutedRef.current;
    if (!nextMuted) soundManager.playPing();
    setSettings(s => ({ ...s, audio: { ...s.audio, muted: nextMuted } }));
  }, []);

  const handleToggleNarrationMute = useCallback(() => {
    setSettings(s => ({
      ...s,
      audio: { ...s.audio, narrationMuted: !s.audio.narrationMuted }
    }));
  }, []);

  const handleTeleportTo = useCallback((x: number, z: number) => {
    setTeleportRequest(prev => ({ x, z, seq: (prev?.seq ?? 0) + 1 }));
  }, []);

  const handleTeleportToCoords = useCallback((lat: number, lon: number, _label?: string) => {
    setTeleportRequest(prev => ({ x: 0, z: 0, seq: (prev?.seq ?? 0) + 1, lat, lon }));
  }, []);

  // Global Keyboard Shortcuts (KeyV reserved strictly for POV / Shuttle Camera in WorldCanvas)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'KeyB') {
        setIsBackpackOpen(prev => !prev);
      } else if (e.code === 'KeyN') {
        setIsNotebookOpen(prev => !prev);
      } else if (e.code === 'KeyM') {
        if (viewMode === 'surface') {
          setIsMapOpen(prev => !prev);
        } else {
          setIsMissionsOpen(prev => !prev);
        }
      } else if (e.code === 'KeyU') {
        setIsFrontierOpen(prev => !prev);
      } else if (e.code === 'KeyF') {
        handleTriggerScanner();
      } else if (e.code === 'KeyQ') {
        setIsQuizOpen(prev => !prev);
      } else if (e.code === 'KeyH') {
        setIsMissionControlOpen(prev => !prev);
      } else if (e.code === 'KeyG') {
        setIsGravityLabOpen(prev => !prev);
      } else if (e.code === 'KeyI') {
        handleToggleVisor();
      } else if (e.code === 'KeyC') {
        if (!shuttleTelemetry || shuttleTelemetry.state === 'on_foot') {
          handleToggleCloak();
        }
      } else if (e.code === 'KeyX') {
        handleTriggerGeoradar();
      } else if (e.code === 'Escape') {
        const anyModalOpen =
          isBackpackOpen ||
          isMissionsOpen ||
          isQuizOpen ||
          isMissionControlOpen ||
          isSettingsOpen ||
          isTutorialOpen ||
          isGravityLabOpen ||
          isMapOpen ||
          isNotebookOpen ||
          isFrontierOpen ||
          Boolean(inspectedDiscovery) ||
          Boolean(selectedPlanetTarget) ||
          Boolean(activeMoonResource) ||
          isMoonResourceHubOpen ||
          Boolean(activeMarsResource) ||
          isMarsResourceHubOpen ||
          isShuttleDestinationOpen;

        if (anyModalOpen) {
          setIsBackpackOpen(false);
          setIsMissionsOpen(false);
          setIsQuizOpen(false);
          setIsMissionControlOpen(false);
          setIsSettingsOpen(false);
          setIsTutorialOpen(false);
          setIsGravityLabOpen(false);
          setIsMapOpen(false);
          setIsNotebookOpen(false);
          setIsFrontierOpen(false);
          if (activeMoonResource || activeMarsResource) {
            narrationManager.stop();
          }
          setInspectedDiscovery(null);
          setSelectedPlanetTarget(null);
          setActiveMoonResource(null);
          setIsMoonResourceHubOpen(false);
          setActiveMarsResource(null);
          setIsMarsResourceHubOpen(false);
          setIsShuttleDestinationOpen(false);
        } else if (shuttleTelemetry?.state === 'seated_cockpit') {
          setIsShuttleDestinationOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    profile.visorMode,
    profile.cloakActive,
    viewMode,
    handleTriggerScanner,
    shuttleTelemetry?.state,
    isBackpackOpen,
    isMissionsOpen,
    isQuizOpen,
    isMissionControlOpen,
    isSettingsOpen,
    isTutorialOpen,
    isGravityLabOpen,
    isMapOpen,
    isNotebookOpen,
    isFrontierOpen,
    inspectedDiscovery,
    selectedPlanetTarget,
    activeMoonResource,
    isMoonResourceHubOpen,
    activeMarsResource,
    isMarsResourceHubOpen,
    isShuttleDestinationOpen
  ]);

  const activeMission = useMemo(() => {
    return missions.find(m => m.id === activeMissionId) || missions[0];
  }, [missions, activeMissionId]);

  const handleCollectDiscovery = (discovery: ScientificDiscovery) => {
    const isAlreadyCollected = profile.inventory.some(item => item.discoveryId === discovery.id);
    if (isAlreadyCollected) return;

    const newItem: InventoryItem = {
      discoveryId: discovery.id,
      discoveryName: discovery.name,
      planetId: discovery.planetId,
      category: discovery.category,
      collectedAt: Date.now(),
      rarity: discovery.rarity
    };

    const nextPoints = profile.totalPoints + 100;
    const nextInventory = [...profile.inventory, newItem];
    const nextRank = calculateRank(nextPoints, nextInventory.length);

    setProfile(p => ({
      ...p,
      inventory: nextInventory,
      totalPoints: nextPoints,
      rank: nextRank
    }));

    updateObjectiveProgress('inspect_discovery', 1, discovery.id);
    updateObjectiveProgress('collect_discoveries', 1);
  };

  // Launching descent to surface from universe, title screen, or top-bar planet switcher
  const handleInitiateDescent = (planetId: PlanetId) => {
    narrationManager.stop();
    setSelectedPlanetTarget(null);
    if (!isHabitablePlanet(planetId)) return;

    const shouldPlayShuttleLanding =
      planetId === 'moon' ||
      planetId === 'mars' ||
      (planetId === 'earth' && (viewMode === 'universe' || currentPlanet !== 'earth'));

    setCurrentPlanet(planetId);
    setViewMode('surface');
    setShowTitleScreen(false);
    setPosture('stand');
    setIsDrivingRover(false);
    setIsLandingActive(false);

    if (shouldPlayShuttleLanding) {
      setShuttleCameraView('external_chase');
      setShuttleDirectLandingRequest(prev => ({
        target: planetId,
        seq: (prev?.seq ?? 0) + 1
      }));
    }
  };

  const handleReturnToSpace = () => {
    narrationManager.stop();
    if (shuttleTelemetry?.state === 'seated_cockpit') {
      setShuttleExitTrigger(prev => prev + 1);
    }
    setIsShuttleDestinationOpen(false);
    setViewMode('universe');
    setSelectedPlanetTarget(null);
    setIsLandingActive(false);
    setLandingTelemetry(null);
    setIsDrivingRover(false);
    setPosture('stand');
  };

  const handleUpdateDistance = useCallback(
    (meters: number) => {
      setProfile(p => {
        if (Math.abs(p.metersTraveled - meters) > 10) {
          return { ...p, metersTraveled: meters };
        }
        return p;
      });
      updateObjectiveProgress('travel_distance', 1);
    },
    [updateObjectiveProgress]
  );

  const handleUpdateJumps = useCallback(
    (jumps: number) => {
      setProfile(p => {
        if (p.jumpsPerformed !== jumps) {
          return { ...p, jumpsPerformed: jumps };
        }
        return p;
      });
      updateObjectiveProgress('perform_jump', 1);
    },
    [updateObjectiveProgress]
  );

  const handleRecordQuizScore = (quizId: string, scorePercent: number) => {
    setProfile(p => {
      const nextScores = { ...p.quizScores, [quizId]: scorePercent };
      const nextPoints = p.totalPoints + (scorePercent >= 70 ? 200 : 50);
      return {
        ...p,
        quizScores: nextScores,
        totalPoints: nextPoints,
        rank: calculateRank(nextPoints, p.inventory.length)
      };
    });
    updateObjectiveProgress('complete_quiz', 1);
  };

  const handleToggleSaveQuestion = (topicId: string) => {
    setProfile(p => {
      const current = p.savedFrontierQuestionIds || [];
      const exists = current.includes(topicId);
      const next = exists ? current.filter(id => id !== topicId) : [...current, topicId];
      return { ...p, savedFrontierQuestionIds: next };
    });
  };

  const handleResetData = () => {
    resetAllData();
    const fresh = loadProfile();
    setProfile(fresh);
    setMissions(INITIAL_MISSIONS);
    setIsSettingsOpen(false);
  };

  const handleStartMoonResource = useCallback((id: MoonResourceId) => {
    setIsMoonResourceHubOpen(false);
    setIsMissionsOpen(false);
    setShowTitleScreen(false);
    setActiveMoonResource(id);
    setMoonResourceStage('earth_briefing');
    setMoonResourceSyncState(DEFAULT_MOON_SYNC_STATE);
    setMoonRuntimeTelemetry(null);
  }, []);

  const handleMarkMoonResourceCompleted = useCallback((id: MoonResourceId) => {
    const token = `moon_res_${id}`;
    soundManager.playMissionComplete();
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.55 } });
    setProfile(p => {
      if (p.completedMissionIds.includes(token)) return p;
      const nextPoints = p.totalPoints + 250;
      return {
        ...p,
        totalPoints: nextPoints,
        completedMissionIds: [...p.completedMissionIds, token],
        rank: calculateRank(nextPoints, p.inventory.length)
      };
    });
  }, []);

  const handleInspectMoonResourceFromWorld = useCallback((id: MoonResourceId) => {
    soundManager.playDiscoveryInspect();
    setIsMoonResourceHubOpen(false);
    setIsMissionsOpen(false);
    setIsMapOpen(false);
    setActiveMoonResource(id);
    setMoonResourceStage('surface_exploration');
  }, []);

  const handleToggleMoonLrv = useCallback(() => {
    soundManager.playPing();
    setMoonResourceSyncState(prev => ({
      ...prev,
      isDrivingLrv: !prev.isDrivingLrv
    }));
  }, []);

  const completedMoonResourceIds = useMemo(() => {
    const ids: MoonResourceId[] = ['apollo_lm', 'lunar_rover', 'alsep', 'surveyor'];
    return ids.filter(id => profile.completedMissionIds.includes(`moon_res_${id}`));
  }, [profile.completedMissionIds]);

  const handleStartMarsResource = useCallback((id: MarsAndSpaceResourceId) => {
    setIsMarsResourceHubOpen(false);
    setIsMissionsOpen(false);
    setShowTitleScreen(false);
    setActiveMarsResource(id);
    setMarsResourceStage('briefing');
    setMarsResourceSyncState(DEFAULT_MARS_SYNC_STATE);
    setMarsRuntimeTelemetry(null);
  }, []);

  const handleMarkMarsResourceCompleted = useCallback(
    (id: MarsAndSpaceResourceId, secondaryBadge?: string) => {
      const token = `mars_res_${id}`;
      const secondaryToken = secondaryBadge
        ? `mars_res_${id}_${secondaryBadge.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`
        : null;
      soundManager.playMissionComplete();
      confetti({ particleCount: 95, spread: 70, origin: { y: 0.55 } });
      setProfile(p => {
        const nextTokens = [...p.completedMissionIds];
        let added = false;
        if (!nextTokens.includes(token)) {
          nextTokens.push(token);
          added = true;
        }
        if (secondaryToken && !nextTokens.includes(secondaryToken)) {
          nextTokens.push(secondaryToken);
          added = true;
        }
        if (!added) return p;
        const nextPoints = p.totalPoints + 250;
        return {
          ...p,
          totalPoints: nextPoints,
          completedMissionIds: nextTokens,
          rank: calculateRank(nextPoints, p.inventory.length)
        };
      });
    },
    []
  );

  const handleInspectMarsResourceFromWorld = useCallback((id: MarsAndSpaceResourceId) => {
    soundManager.playDiscoveryInspect();
    setIsMarsResourceHubOpen(false);
    setIsMissionsOpen(false);
    setIsMapOpen(false);
    setActiveMarsResource(id);
    setMarsResourceStage('interactive_3d_lab');
  }, []);

  const completedMarsResourceIds = useMemo(() => {
    const ids: MarsAndSpaceResourceId[] = [
      'sojourner',
      'spirit_opportunity',
      'viking_1',
      'phoenix_insight',
      'curiosity',
      'ingenuity',
      'dawn',
      'pioneer',
      'kepler'
    ];
    return ids.filter(id => profile.completedMissionIds.includes(`mars_res_${id}`));
  }, [profile.completedMissionIds]);

  const habitableCurrentPlanet: HabitablePlanetId = isHabitablePlanet(currentPlanet)
    ? currentPlanet
    : 'earth';

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* 3D WebGL Canvas Viewport */}
      <WorldCanvas
        viewMode={viewMode}
        currentPlanet={currentPlanet}
        graphicsQuality={settings.graphics.quality}
        avatarUrl={profile.avatarUrl}
        visorMode={profile.visorMode}
        isCloaked={profile.cloakActive}
        georadarTrigger={georadarTrigger}
        resetUniverseCameraTrigger={resetUniverseCameraTrigger}
        cameraMode={cameraMode}
        onToggleCameraMode={mode => setCameraMode(mode)}
        onSelectPlanetInUniverse={pId => {
          setSelectedPlanetTarget(pId);
        }}
        onHoverPlanetInUniverse={() => {}}
        onNearbyDiscoveryChange={disc => setNearbyDiscovery(disc)}
        onInspectDiscovery={disc => setInspectedDiscovery(disc)}
        onToggleVisor={handleToggleVisor}
        onToggleCloak={handleToggleCloak}
        onTriggerGeoradar={handleTriggerGeoradar}
        onOpenGravityLab={() => setIsGravityLabOpen(true)}
        onUpdateDistanceTraveled={handleUpdateDistance}
        onUpdateJumps={handleUpdateJumps}
        virtualMoveVector={virtualMoveVector}
        virtualJumpTrigger={virtualJumpTrigger}
        posture={posture}
        onPostureChange={p => {
          if (isDrivingRover && p !== 'sit') setIsDrivingRover(false);
          setPosture(p);
        }}
        isDrivingRover={isDrivingRover}
        onToggleRover={handleToggleRover}
        onSetDrivingRover={handleSetDrivingRover}
        lightingMode={lightingMode}
        teleportRequest={teleportRequest}
        isLandingActive={isLandingActive}
        onLandingTelemetryChange={telem => setLandingTelemetry(telem)}
        onLandingComplete={() => setIsLandingActive(false)}
        skipLandingTrigger={skipLandingTrigger}
        isScanningTrigger={isScanningTrigger}
        isCollectingTrigger={isCollectingTrigger}
        onPlayerCoordinatesChange={telem => {
          setSphericalTelemetry(telem);
          setPlayerCoordinates({ x: telem.x, y: telem.y, z: telem.z });
        }}
        shuttleDestinationRequest={shuttleDestinationRequest}
        shuttleDirectLandingRequest={shuttleDirectLandingRequest}
        focusedOrbitPlanet={selectedPlanetTarget}
        shuttleEnterTrigger={shuttleEnterTrigger}
        shuttleExitTrigger={shuttleExitTrigger}
        shuttleCameraView={shuttleCameraView}
        isPipEnabled={isPipEnabled}
        onSetShuttleCameraView={view => setShuttleCameraView(view)}
        onToggleShuttleCameraView={() =>
          setShuttleCameraView(prev => (prev === 'cockpit' ? 'external_chase' : 'cockpit'))
        }
        onTogglePip={() => setIsPipEnabled(prev => !prev)}
        onNearShuttleChange={near => setNearShuttle(near)}
        onShuttleTravelChange={telem => setShuttleTelemetry(telem)}
        onShuttlePlanetArrival={planet => {
          setCurrentPlanet(planet);
          setViewMode('surface');
          setIsLandingActive(false);
        }}
        historicalMissionTrigger={historicalMissionTrigger}
        activeMoonResource={activeMoonResource}
        moonResourceSyncState={moonResourceSyncState}
        moonSoilMarkRequest={moonSoilMarkRequest}
        onMoonResourceSequenceProgress={(progress01, done) => {
          setMoonResourceSyncState(prev => ({
            ...prev,
            sequenceProgress: progress01,
            sequencePlaying: done ? false : prev.sequencePlaying
          }));
        }}
        onMoonLaserProgress={progress01 => {
          setMoonResourceSyncState(prev => ({ ...prev, laserPulseProgress: progress01 }));
        }}
        onMoonResourceTelemetryChange={telem => setMoonRuntimeTelemetry(telem)}
        onInspectMoonResource={handleInspectMoonResourceFromWorld}
        onToggleMoonLrv={handleToggleMoonLrv}
        activeMarsResource={activeMarsResource}
        marsResourceSyncState={marsResourceSyncState}
        onMarsResourceSequenceProgress={(progress01, done) => {
          setMarsResourceSyncState(prev => ({
            ...prev,
            sequenceProgress: progress01,
            sequencePlaying: done ? false : prev.sequencePlaying
          }));
        }}
        onMarsResourceTelemetryChange={telem => setMarsRuntimeTelemetry(telem)}
        onInspectMarsResource={handleInspectMarsResourceFromWorld}
      />

      {/* Main Flight HUD */}
      {!showTitleScreen && (
        <HUD
          viewMode={viewMode}
          currentPlanet={currentPlanet}
          profile={profile}
          activeMission={activeMission}
          nearbyDiscovery={nearbyDiscovery}
          isCloaked={profile.cloakActive}
          visorMode={profile.visorMode}
          isGeoradarPulsing={isGeoradarPulsing}
          landingTelemetry={landingTelemetry}
          sphericalTelemetry={sphericalTelemetry}
          posture={posture}
          onPostureChange={p => {
            if (isDrivingRover) setIsDrivingRover(false);
            setPosture(p);
          }}
          isDrivingRover={isDrivingRover}
          onToggleRover={handleToggleRover}
          lightingMode={lightingMode}
          onLightingModeChange={m => setLightingMode(m)}
          onSelectPlanet={planetId => handleInitiateDescent(planetId)}
          onTeleportTo={handleTeleportTo}
          onTeleportToCoords={handleTeleportToCoords}
          onOpenBackpack={() => setIsBackpackOpen(true)}
          onOpenMissions={() => setIsMissionsOpen(true)}
          onOpenQuiz={() => setIsQuizOpen(true)}
          onOpenMissionControl={() => setIsMissionControlOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenTutorial={() => setIsTutorialOpen(true)}
          onOpenGravityLab={() => setIsGravityLabOpen(true)}
          onOpenMap={() => setIsMapOpen(true)}
          onOpenNotebook={() => setIsNotebookOpen(true)}
          onOpenFrontier={() => setIsFrontierOpen(true)}
          onTriggerScanner={handleTriggerScanner}
          onCollectSample={handleCollectSample}
          onToggleVisor={handleToggleVisor}
          onToggleCloak={handleToggleCloak}
          onTriggerGeoradar={handleTriggerGeoradar}
          onInspectNearby={() => nearbyDiscovery && setInspectedDiscovery(nearbyDiscovery)}
          onReturnToSpace={handleReturnToSpace}
          onResetUniverseCamera={() => {
            setSelectedPlanetTarget(null);
            setResetUniverseCameraTrigger(prev => prev + 1);
          }}
          selectedOrbitPlanet={selectedPlanetTarget}
          onSelectOrbitPlanet={pid => setSelectedPlanetTarget(pid)}
          onSkipLanding={() => {
            setIsLandingActive(false);
            setLandingTelemetry(null);
            setSkipLandingTrigger(prev => prev + 1);
          }}
          cameraMode={cameraMode}
          onToggleCameraMode={() =>
            setCameraMode(prev => (prev === 'third-person' ? 'first-person' : 'third-person'))
          }
          onOpenAiCoPilot={() => setIsAiCoPilotOpen(true)}
          onTouchMove={vec => setVirtualMoveVector(vec)}
          onTouchJump={() => setVirtualJumpTrigger(prev => prev + 1)}
          nearShuttle={nearShuttle}
          shuttleTelemetry={shuttleTelemetry}
          shuttleCameraView={shuttleCameraView}
          isPipEnabled={isPipEnabled}
          onEnterShuttle={() => setShuttleEnterTrigger(prev => prev + 1)}
          onExitShuttle={() => setShuttleExitTrigger(prev => prev + 1)}
          onOpenShuttleDestinations={() => setIsShuttleDestinationOpen(true)}
          onSetShuttleCameraView={view => setShuttleCameraView(view)}
          onToggleShuttleCameraView={() =>
            setShuttleCameraView(prev => (prev === 'cockpit' ? 'external_chase' : 'cockpit'))
          }
          onTogglePip={() => setIsPipEnabled(prev => !prev)}
          isAudioMuted={settings.audio.muted}
          isNarrationMuted={settings.audio.narrationMuted}
          onToggleMasterMute={handleToggleMasterMute}
          onToggleNarrationMute={handleToggleNarrationMute}
          onOpenMoonResources={() => setIsMoonResourceHubOpen(true)}
          moonRuntimeTelemetry={moonRuntimeTelemetry}
          onInspectMoonResource={handleInspectMoonResourceFromWorld}
          onToggleMoonLrv={handleToggleMoonLrv}
          onOpenMarsResources={() => setIsMarsResourceHubOpen(true)}
          marsRuntimeTelemetry={marsRuntimeTelemetry}
          onInspectMarsResource={handleInspectMarsResourceFromWorld}
        />
      )}

      {/* Title Screen Overlay */}
      {showTitleScreen && (
        <TitleScreen
          profile={profile}
          onStartGame={dest => {
            if (dest === 'universe') {
              setViewMode('universe');
              setShowTitleScreen(false);
            } else if (dest === 'earth') {
              setCurrentPlanet('earth');
              setViewMode('surface');
              setShowTitleScreen(false);
            } else {
              handleInitiateDescent(dest);
            }
          }}
          onOpenTutorial={() => setIsTutorialOpen(true)}
        />
      )}

      {/* Planet Destination Selector (Universe Inspection View) */}
      {viewMode === 'universe' && selectedPlanetTarget && (
        <DestinationSelector
          mode="universe"
          selectedPlanetId={selectedPlanetTarget}
          onInitiateDescent={handleInitiateDescent}
          onClose={() => setSelectedPlanetTarget(null)}
        />
      )}

      {/* Space Shuttle Cockpit Destination Selector (Seated in Shuttle) */}
      {viewMode === 'surface' &&
        shuttleTelemetry?.state === 'seated_cockpit' &&
        isShuttleDestinationOpen && (
          <DestinationSelector
            mode="shuttle"
            currentPlanet={habitableCurrentPlanet}
            onLaunchShuttle={dest => {
              setIsShuttleDestinationOpen(false);
              narrationManager.speak(getDestinationConfirmLine(dest), {
                priority: 'normal',
                dedupeKey: `dest_${dest}`,
                cooldownMs: 3000
              });
              setShuttleDestinationRequest(prev => ({
                target: dest,
                seq: (prev?.seq ?? 0) + 1
              }));
            }}
            onExitShuttle={() => {
              setIsShuttleDestinationOpen(false);
              setShuttleExitTrigger(prev => prev + 1);
            }}
            onClose={() => setIsShuttleDestinationOpen(false)}
          />
        )}

      {/* NASA Space Apps AI Mission Co-Pilot Modal */}
      {isAiCoPilotOpen && (
        <AiCoPilotModal
          currentPlanet={currentPlanet}
          viewMode={viewMode === 'universe' ? 'universe' : 'surface'}
          nearbyDiscovery={nearbyDiscovery}
          onClose={() => setIsAiCoPilotOpen(false)}
        />
      )}

      {/* 3D Museum Discovery Inspector Modal */}
      {inspectedDiscovery && (
        <DiscoveryViewer
          discovery={inspectedDiscovery}
          isCollected={profile.inventory.some(i => i.discoveryId === inspectedDiscovery.id)}
          detailedMode={settings.detailedScienceMode}
          onToggleDetailedMode={() =>
            setSettings(s => ({ ...s, detailedScienceMode: !s.detailedScienceMode }))
          }
          onCollect={handleCollectDiscovery}
          onClose={() => setInspectedDiscovery(null)}
        />
      )}

      {/* Virtual Explorer Backpack Modal */}
      {isBackpackOpen && (
        <BackpackModal
          inventory={profile.inventory}
          onSelectDiscovery={disc => {
            setIsBackpackOpen(false);
            setInspectedDiscovery(disc);
          }}
          onClose={() => setIsBackpackOpen(false)}
        />
      )}

      {/* Mission Directives Modal */}
      {isMissionsOpen && (
        <MissionsModal
          missions={missions}
          activeMissionId={activeMissionId}
          onSelectActiveMission={id => setActiveMissionId(id)}
          onLaunchHistoricalSequence={(planet, vehicle) => {
            setIsMissionsOpen(false);
            setShowTitleScreen(false);
            setCurrentPlanet(planet);
            setViewMode('surface');
            setIsLandingActive(false);
            setHistoricalMissionTrigger(prev => ({
              planet,
              vehicle,
              seq: (prev?.seq ?? 0) + 1
            }));
          }}
          onOpenMoonResource={handleStartMoonResource}
          onOpenMarsResource={handleStartMarsResource}
          onClose={() => setIsMissionsOpen(false)}
        />
      )}

      {/* Educational Science Quiz Modal */}
      {isQuizOpen && (
        <QuizModal onRecordScore={handleRecordQuizScore} onClose={() => setIsQuizOpen(false)} />
      )}

      {/* Earth Mission Control HQ Modal */}
      {isMissionControlOpen && (
        <MissionControlModal
          profile={profile}
          onUpdateProfile={p => setProfile(p)}
          onSelectDestination={handleInitiateDescent}
          onOpenTutorial={() => setIsTutorialOpen(true)}
          onClose={() => setIsMissionControlOpen(false)}
        />
      )}

      {/* Planetary Navigation Map Modal */}
      {isMapOpen && (
        <PlanetaryMapModal
          currentPlanet={currentPlanet}
          playerCoordinates={playerCoordinates}
          activeLrvMissionId={moonResourceSyncState.lrvMissionId}
          onSelectDiscovery={disc => {
            setIsMapOpen(false);
            setInspectedDiscovery(disc);
          }}
          onNavigateMoonSite={(ev: MoonChronologicalEvent) => {
            if (ev.lrvMissionId) {
              setMoonResourceSyncState(prev => ({
                ...prev,
                lrvMissionId: ev.lrvMissionId!,
                lrvEvaIndex: 0,
                isDrivingLrv: false
              }));
            }
            const coords = getMoonSiteCoordinates(ev.resourceId);
            setViewMode('surface');
            setTeleportRequest(prev => ({
              x: coords.x,
              z: coords.z,
              yaw: coords.yaw,
              seq: (prev?.seq ?? 0) + 1
            }));
            setIsMapOpen(false);
          }}
          onOpenMoonResourceFromMap={(id, lrvMissionId) => {
            setIsMapOpen(false);
            setActiveMoonResource(id);
            setMoonResourceStage('interactive_3d_lab');
            if (lrvMissionId) {
              setMoonResourceSyncState(prev => ({
                ...prev,
                lrvMissionId,
                lrvEvaIndex: 0
              }));
            }
          }}
          onNavigateMarsSite={(ev: MarsChronologicalEvent) => {
            if (ev.subFocus === 'spirit' || ev.subFocus === 'opportunity') {
              setMarsResourceSyncState(prev => ({ ...prev, selectedMerRover: ev.subFocus as 'spirit' | 'opportunity' }));
            } else if (ev.subFocus === 'phoenix' || ev.subFocus === 'insight') {
              setMarsResourceSyncState(prev => ({ ...prev, phoenixOrInsightChapter: ev.subFocus as 'phoenix' | 'insight' }));
            }
            const coords = getMarsSiteCoordinates(ev.resourceId);
            setViewMode('surface');
            setTeleportRequest(prev => ({
              x: coords.x,
              z: coords.z,
              yaw: coords.yaw,
              seq: (prev?.seq ?? 0) + 1
            }));
            setIsMapOpen(false);
          }}
          onOpenMarsResourceFromMap={(id, subFocus) => {
            setIsMapOpen(false);
            setActiveMarsResource(id);
            setMarsResourceStage('interactive_3d_lab');
            if (subFocus === 'spirit' || subFocus === 'opportunity') {
              setMarsResourceSyncState(prev => ({ ...prev, selectedMerRover: subFocus }));
            } else if (subFocus === 'phoenix' || subFocus === 'insight') {
              setMarsResourceSyncState(prev => ({ ...prev, phoenixOrInsightChapter: subFocus }));
            }
          }}
          onClose={() => setIsMapOpen(false)}
        />
      )}

      {/* Planetary Field Notebook Modal */}
      {isNotebookOpen && (
        <FieldNotebookModal
          profile={profile}
          onSelectDiscovery={disc => {
            setIsNotebookOpen(false);
            setInspectedDiscovery(disc);
          }}
          onOpenFrontier={() => {
            setIsNotebookOpen(false);
            setIsFrontierOpen(true);
          }}
          onClose={() => setIsNotebookOpen(false)}
        />
      )}

      {/* The Unknown Frontier Modal */}
      {isFrontierOpen && (
        <UnknownFrontierModal
          savedQuestionIds={profile.savedFrontierQuestionIds || []}
          onToggleSaveQuestion={handleToggleSaveQuestion}
          onClose={() => setIsFrontierOpen(false)}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={s => setSettings(s)}
          onResetData={handleResetData}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {/* Controls Walkthrough Modal */}
      {isTutorialOpen && <ControlsTutorialModal onClose={() => setIsTutorialOpen(false)} />}

      {/* Interactive Gravity Comparison Laboratory Modal */}
      {isGravityLabOpen && <GravityLabModal onClose={() => setIsGravityLabOpen(false)} />}

      {/* Historical Moon Exploration Resources Hub */}
      {isMoonResourceHubOpen && (
        <MoonResourceHubModal
          completedResourceIds={completedMoonResourceIds}
          currentPlanet={currentPlanet}
          onSelectResource={handleStartMoonResource}
          onClose={() => setIsMoonResourceHubOpen(false)}
        />
      )}

      {/* Active Historical Moon Resource Experience Overlay */}
      {activeMoonResource && !isMoonResourceHubOpen && (
        <MoonResourceOverlay
          resourceId={activeMoonResource}
          stage={moonResourceStage}
          onStageChange={setMoonResourceStage}
          currentPlanet={currentPlanet}
          shuttleState={shuttleTelemetry?.state ?? 'on_foot'}
          syncState={moonResourceSyncState}
          onUpdateSyncState={patch =>
            setMoonResourceSyncState(prev => ({ ...prev, ...patch }))
          }
          onAddSoilTestMark={type =>
            setMoonSoilMarkRequest(prev => ({ type, seq: (prev?.seq ?? 0) + 1 }))
          }
          runtimeTelemetry={moonRuntimeTelemetry}
          onTeleportNearShuttlePad={() => {
            const pId: HabitablePlanetId = isHabitablePlanet(currentPlanet)
              ? currentPlanet
              : 'earth';
            const pad = SHUTTLE_PADS[pId];
            setViewMode('surface');
            setTeleportRequest(prev => ({
              x: pad.x - 5.5,
              z: pad.z + 2,
              seq: (prev?.seq ?? 0) + 1
            }));
          }}
          onTeleportNearHistoricalSite={() => {
            const coords = getMoonSiteCoordinates(activeMoonResource);
            setViewMode('surface');
            setTeleportRequest(prev => ({
              x: coords.x,
              z: coords.z,
              yaw: coords.yaw,
              seq: (prev?.seq ?? 0) + 1
            }));
          }}
          onOpenShuttlePanel={() => setIsShuttleDestinationOpen(true)}
          onRecordQuizScore={handleRecordQuizScore}
          onMarkCompleted={handleMarkMoonResourceCompleted}
          onReturnToHub={() => {
            narrationManager.stop();
            setActiveMoonResource(null);
            setIsMoonResourceHubOpen(true);
          }}
          onClose={() => {
            narrationManager.stop();
            setActiveMoonResource(null);
            setMoonResourceSyncState(DEFAULT_MOON_SYNC_STATE);
          }}
        />
      )}

      {/* Historical Mars, Outer Solar System & Exoplanet Exploration Hub */}
      {isMarsResourceHubOpen && (
        <MarsResourceHubModal
          completedResourceIds={completedMarsResourceIds}
          currentPlanet={currentPlanet}
          onSelectResource={handleStartMarsResource}
          onClose={() => setIsMarsResourceHubOpen(false)}
        />
      )}

      {/* Active Historical Mars / Outer Solar System / Deep Space Overlay */}
      {activeMarsResource && !isMarsResourceHubOpen && (
        <MarsResourceOverlay
          resourceId={activeMarsResource}
          stage={marsResourceStage}
          onStageChange={setMarsResourceStage}
          currentPlanet={currentPlanet}
          shuttleState={shuttleTelemetry?.state ?? 'on_foot'}
          syncState={marsResourceSyncState}
          onUpdateSyncState={patch =>
            setMarsResourceSyncState(prev => ({ ...prev, ...patch }))
          }
          onTeleportNearShuttlePad={() => {
            const pId: HabitablePlanetId = isHabitablePlanet(currentPlanet)
              ? currentPlanet
              : 'earth';
            const pad = SHUTTLE_PADS[pId];
            setViewMode('surface');
            setTeleportRequest(prev => ({
              x: pad.x - 5.5,
              z: pad.z + 2,
              seq: (prev?.seq ?? 0) + 1
            }));
          }}
          onTeleportNearMarsSite={id => {
            const coords = getMarsSiteCoordinates(id);
            setViewMode('surface');
            setTeleportRequest(prev => ({
              x: coords.x,
              z: coords.z,
              yaw: coords.yaw,
              seq: (prev?.seq ?? 0) + 1
            }));
          }}
          onOpenShuttlePanel={() => setIsShuttleDestinationOpen(true)}
          onRecordQuizScore={handleRecordQuizScore}
          onMarkCompleted={handleMarkMarsResourceCompleted}
          onReturnToHub={() => {
            narrationManager.stop();
            setActiveMarsResource(null);
            setIsMarsResourceHubOpen(true);
          }}
          onClose={() => {
            narrationManager.stop();
            setActiveMarsResource(null);
            setMarsResourceSyncState(DEFAULT_MARS_SYNC_STATE);
          }}
        />
      )}
    </div>
  );
}
