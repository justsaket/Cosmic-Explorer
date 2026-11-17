import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ViewMode, PlanetId, ScientificDiscovery } from '../types';
import { SpaceUniverse } from './SpaceUniverse';
import { EarthWorld } from './EarthWorld';
import { MoonWorld } from './MoonWorld';
import { MarsWorld } from './MarsWorld';
import { AstronautModel, AstronautPosture } from '../astronaut/AstronautModel';
import {
  PlanetaryPhysicsController,
  MoveInput,
  CylinderObstacle,
  getCompassCardinal,
  getPlanetaryBiomeName
} from '../physics/planetaryPhysics';
import { soundManager } from '../audio/soundManager';
import { narrationManager } from '../narration/narrationManager';
import {
  getApproachStoryLine,
  getBoardingStoryLine,
  getCruiseStoryLine,
  getDisembarkStoryLine,
  getLandingStoryLine,
  getTakeoffStoryLine
} from '../narration/storyDialogue';
import { getDiscoveryById } from '../education/contentLibrary';
import { ProceduralTextures } from './ProceduralTextures';
import { LandingSequenceManager, LandingTelemetry, HistoricalMissionVehicle } from './LandingSequence';
import { RoverDustParticles } from './RoverDustParticles';
import { SpaceShuttleModel, ShuttleCameraLookOffset } from '../shuttle/SpaceShuttleModel';
import { InterplanetaryTravelScene } from '../shuttle/InterplanetaryTravelScene';
import {
  HabitablePlanetId,
  ShuttleInteractionState,
  ShuttleCameraView,
  TravelTelemetrySnapshot,
  SHUTTLE_PADS,
  SHUTTLE_COLLISION_RADIUS,
  TRAVEL_PHASE_DURATIONS,
  isHabitablePlanet,
  canBoardShuttle,
  isAstronautLockedInShuttle,
  isShuttleExitAllowed,
  advanceShuttleState,
  buildTravelTelemetry,
  computeShuttlePropulsionProfile
} from '../shuttle/shuttleTravelState';
import { MoonResourceId } from '../moonResources/moonResourceTypes';
import {
  MoonResourceWorldManager,
  MoonWorldRuntimeTelemetry,
  MoonWorldSyncState
} from '../moonResources/MoonResourceWorldManager';
import { MarsAndSpaceResourceId } from '../marsResources/marsResourceTypes';
import {
  MarsResourceWorldManager,
  MarsWorldRuntimeTelemetry,
  MarsWorldSyncState
} from '../marsResources/MarsResourceWorldManager';

export interface TelemetryData {
  x: number;
  y: number;
  z: number;
  lat: number;
  lon: number;
  altitude: number;
  speed: number;
  gravity: number;
  biome: string;
  headingLabel?: string;
  headingDeg?: number;
  nearestLandmark?: string;
  nearestLandmarkDist?: number;
}

export type SphericalTelemetryData = TelemetryData;

interface WorldCanvasProps {
  viewMode: ViewMode;
  currentPlanet: PlanetId;
  graphicsQuality: 'low' | 'balanced' | 'high';
  avatarUrl?: string;
  visorMode: 'gold_mirror' | 'hud_display' | 'clear_face';
  isCloaked: boolean;
  georadarTrigger: number;
  resetUniverseCameraTrigger: number;
  cameraMode?: 'third-person' | 'first-person';
  onToggleCameraMode?: (mode: 'third-person' | 'first-person') => void;
  onSelectPlanetInUniverse: (planetId: PlanetId) => void;
  onHoverPlanetInUniverse: (planetId: PlanetId | null) => void;
  onNearbyDiscoveryChange: (discovery: ScientificDiscovery | null) => void;
  onInspectDiscovery: (discovery: ScientificDiscovery) => void;
  onToggleVisor: () => void;
  onToggleCloak: () => void;
  onTriggerGeoradar: () => void;
  onOpenGravityLab: () => void;
  onUpdateDistanceTraveled: (meters: number) => void;
  onUpdateJumps: (jumps: number) => void;
  virtualMoveVector: { x: number; y: number };
  virtualJumpTrigger: number;
  posture: AstronautPosture;
  onPostureChange: (posture: AstronautPosture) => void;
  isDrivingRover: boolean;
  onToggleRover: () => void;
  onSetDrivingRover?: (active: boolean) => void;
  lightingMode: 'day' | 'sunset' | 'night';
  teleportRequest: { x: number; z: number; seq: number; lat?: number; lon?: number; yaw?: number } | null;
  isLandingActive?: boolean;
  onLandingTelemetryChange?: (telemetry: LandingTelemetry | null) => void;
  onLandingComplete?: () => void;
  skipLandingTrigger?: number;
  isScanningTrigger?: number;
  isCollectingTrigger?: number;
  onPlayerCoordinatesChange?: (telemetry: TelemetryData) => void;
  // Interactive Space Shuttle & Interplanetary Travel props
  shuttleDestinationRequest?: { target: HabitablePlanetId; seq: number } | null;
  shuttleDirectLandingRequest?: { target: HabitablePlanetId; seq: number } | null;
  focusedOrbitPlanet?: PlanetId | null;
  shuttleEnterTrigger?: number;
  shuttleExitTrigger?: number;
  shuttleCameraView?: ShuttleCameraView;
  isPipEnabled?: boolean;
  onSetShuttleCameraView?: (view: ShuttleCameraView) => void;
  onToggleShuttleCameraView?: () => void;
  onTogglePip?: () => void;
  onNearShuttleChange?: (near: boolean) => void;
  onShuttleTravelChange?: (telemetry: TravelTelemetrySnapshot) => void;
  onShuttlePlanetArrival?: (planet: HabitablePlanetId) => void;
  historicalMissionTrigger?: {
    vehicle: HistoricalMissionVehicle;
    planet: HabitablePlanetId;
    seq: number;
  } | null;
  // Interactive 4 Moon Resources props
  activeMoonResource?: MoonResourceId | null;
  moonResourceSyncState?: MoonWorldSyncState;
  moonSoilMarkRequest?: { type: 'trench' | 'bearing' | 'impact'; seq: number } | null;
  onMoonResourceSequenceProgress?: (progress01: number, done: boolean) => void;
  onMoonLaserProgress?: (progress01: number | null) => void;
  onMoonResourceTelemetryChange?: (telemetry: MoonWorldRuntimeTelemetry) => void;
  onInspectMoonResource?: (resourceId: MoonResourceId) => void;
  onToggleMoonLrv?: () => void;
  // Interactive Mars Surface & Sky Exhibit Resources (All 9 sites)
  activeMarsResource?: MarsAndSpaceResourceId | null;
  marsResourceSyncState?: MarsWorldSyncState;
  onMarsResourceSequenceProgress?: (progress01: number, done: boolean) => void;
  onMarsResourceTelemetryChange?: (telemetry: MarsWorldRuntimeTelemetry) => void;
  onInspectMarsResource?: (resourceId: MarsAndSpaceResourceId) => void;
}

function detectSoftwareWebGL(): boolean {
  try {
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
    if (!gl) return false;
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererStr = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererStr);
  } catch {
    return false;
  }
}

export const WorldCanvas: React.FC<WorldCanvasProps> = ({
  viewMode,
  currentPlanet,
  graphicsQuality,
  cameraMode = 'third-person',
  onToggleCameraMode,
  visorMode,
  isCloaked,
  georadarTrigger,
  resetUniverseCameraTrigger,
  onSelectPlanetInUniverse,
  onHoverPlanetInUniverse,
  onNearbyDiscoveryChange,
  onInspectDiscovery,
  onToggleVisor,
  onToggleCloak,
  onTriggerGeoradar,
  onOpenGravityLab,
  onUpdateDistanceTraveled,
  onUpdateJumps,
  virtualMoveVector,
  virtualJumpTrigger,
  posture,
  onPostureChange,
  isDrivingRover,
  onToggleRover,
  onSetDrivingRover,
  lightingMode,
  teleportRequest,
  isLandingActive = false,
  onLandingTelemetryChange,
  onLandingComplete,
  skipLandingTrigger = 0,
  isScanningTrigger = 0,
  isCollectingTrigger = 0,
  onPlayerCoordinatesChange,
  shuttleDestinationRequest = null,
  shuttleDirectLandingRequest = null,
  focusedOrbitPlanet = null,
  shuttleEnterTrigger = 0,
  shuttleExitTrigger = 0,
  shuttleCameraView = 'cockpit',
  isPipEnabled = true,
  onSetShuttleCameraView,
  onToggleShuttleCameraView,
  onTogglePip,
  onNearShuttleChange,
  onShuttleTravelChange,
  onShuttlePlanetArrival,
  historicalMissionTrigger = null,
  activeMoonResource = null,
  moonResourceSyncState,
  moonSoilMarkRequest = null,
  onMoonResourceSequenceProgress,
  onMoonLaserProgress,
  onMoonResourceTelemetryChange,
  onInspectMoonResource,
  onToggleMoonLrv,
  activeMarsResource = null,
  marsResourceSyncState,
  onMarsResourceSequenceProgress,
  onMarsResourceTelemetryChange,
  onInspectMarsResource
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Live prop refs for the persistent render loop (Zero React re-render lag)
  const viewModeRef = useRef(viewMode);
  viewModeRef.current = viewMode;

  const currentPlanetRef = useRef(currentPlanet);
  currentPlanetRef.current = currentPlanet;

  const isLandingActivePropRef = useRef(isLandingActive);
  isLandingActivePropRef.current = isLandingActive;

  const virtualMoveVectorRef = useRef(virtualMoveVector);
  virtualMoveVectorRef.current = virtualMoveVector;

  const virtualJumpPropRef = useRef(virtualJumpTrigger);
  virtualJumpPropRef.current = virtualJumpTrigger;

  const georadarPropRef = useRef(georadarTrigger);
  georadarPropRef.current = georadarTrigger;

  const resetCamPropRef = useRef(resetUniverseCameraTrigger);
  resetCamPropRef.current = resetUniverseCameraTrigger;

  const skipLandingPropRef = useRef(skipLandingTrigger);
  skipLandingPropRef.current = skipLandingTrigger;

  const scanPropRef = useRef(isScanningTrigger);
  scanPropRef.current = isScanningTrigger;

  const collectPropRef = useRef(isCollectingTrigger);
  collectPropRef.current = isCollectingTrigger;

  const visorModeRef = useRef(visorMode);
  visorModeRef.current = visorMode;

  const isCloakedRef = useRef(isCloaked);
  isCloakedRef.current = isCloaked;

  const posturePropRef = useRef(posture);
  posturePropRef.current = posture;

  const isDrivingRoverPropRef = useRef(isDrivingRover);
  isDrivingRoverPropRef.current = isDrivingRover;

  const lightingModePropRef = useRef(lightingMode);
  lightingModePropRef.current = lightingMode;

  const teleportReqPropRef = useRef(teleportRequest);
  teleportReqPropRef.current = teleportRequest;

  const cameraModePropRef = useRef(cameraMode);
  cameraModePropRef.current = cameraMode;

  const shuttleDestReqPropRef = useRef(shuttleDestinationRequest);
  shuttleDestReqPropRef.current = shuttleDestinationRequest;

  const shuttleDirectLandingReqPropRef = useRef(shuttleDirectLandingRequest);
  shuttleDirectLandingReqPropRef.current = shuttleDirectLandingRequest;

  const focusedOrbitPlanetRef = useRef(focusedOrbitPlanet);
  focusedOrbitPlanetRef.current = focusedOrbitPlanet;

  const shuttleEnterPropRef = useRef(shuttleEnterTrigger);
  shuttleEnterPropRef.current = shuttleEnterTrigger;

  const shuttleExitPropRef = useRef(shuttleExitTrigger);
  shuttleExitPropRef.current = shuttleExitTrigger;

  const shuttleCameraViewPropRef = useRef(shuttleCameraView);
  shuttleCameraViewPropRef.current = shuttleCameraView;

  const isPipEnabledPropRef = useRef(isPipEnabled);
  isPipEnabledPropRef.current = isPipEnabled;

  const historicalMissionPropRef = useRef(historicalMissionTrigger);
  historicalMissionPropRef.current = historicalMissionTrigger;

  const activeMoonResourcePropRef = useRef(activeMoonResource);
  activeMoonResourcePropRef.current = activeMoonResource;

  const moonSyncPropRef = useRef(moonResourceSyncState);
  moonSyncPropRef.current = moonResourceSyncState;

  const moonSoilMarkPropRef = useRef(moonSoilMarkRequest);
  moonSoilMarkPropRef.current = moonSoilMarkRequest;

  const activeMarsResourcePropRef = useRef(activeMarsResource);
  activeMarsResourcePropRef.current = activeMarsResource;

  const marsSyncPropRef = useRef(marsResourceSyncState);
  marsSyncPropRef.current = marsResourceSyncState;

  // Callback refs
  const callbacksRef = useRef({
    onSelectPlanetInUniverse,
    onHoverPlanetInUniverse,
    onNearbyDiscoveryChange,
    onInspectDiscovery,
    onToggleVisor,
    onToggleCloak,
    onTriggerGeoradar,
    onOpenGravityLab,
    onUpdateDistanceTraveled,
    onUpdateJumps,
    onPostureChange,
    onToggleRover,
    onSetDrivingRover,
    onToggleCameraMode,
    onLandingTelemetryChange,
    onLandingComplete,
    onPlayerCoordinatesChange,
    onSetShuttleCameraView,
    onToggleShuttleCameraView,
    onTogglePip,
    onNearShuttleChange,
    onShuttleTravelChange,
    onShuttlePlanetArrival,
    onMoonResourceSequenceProgress,
    onMoonLaserProgress,
    onMoonResourceTelemetryChange,
    onInspectMoonResource,
    onToggleMoonLrv,
    onMarsResourceSequenceProgress,
    onMarsResourceTelemetryChange,
    onInspectMarsResource
  });
  callbacksRef.current = {
    onSelectPlanetInUniverse,
    onHoverPlanetInUniverse,
    onNearbyDiscoveryChange,
    onInspectDiscovery,
    onToggleVisor,
    onToggleCloak,
    onTriggerGeoradar,
    onOpenGravityLab,
    onUpdateDistanceTraveled,
    onUpdateJumps,
    onPostureChange,
    onToggleRover,
    onSetDrivingRover,
    onToggleCameraMode,
    onLandingTelemetryChange,
    onLandingComplete,
    onPlayerCoordinatesChange,
    onSetShuttleCameraView,
    onToggleShuttleCameraView,
    onTogglePip,
    onNearShuttleChange,
    onShuttleTravelChange,
    onShuttlePlanetArrival,
    onMoonResourceSequenceProgress,
    onMoonLaserProgress,
    onMoonResourceTelemetryChange,
    onInspectMoonResource,
    onToggleMoonLrv,
    onMarsResourceSequenceProgress,
    onMarsResourceTelemetryChange,
    onInspectMarsResource
  };

  const currentNearbyRef = useRef<ScientificDiscovery | null>(null);
  const inputRef = useRef<MoveInput>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false
  });

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    const isSoftwareGl = detectSoftwareWebGL();

    // 1. Persistent High-Performance WebGLRenderer
    const renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: !isSoftwareGl && graphicsQuality !== 'low',
      alpha: false
    });
    renderer.setSize(width, height);
    const pixelRatio = isSoftwareGl
      ? 1.0
      : graphicsQuality === 'high'
      ? Math.min(window.devicePixelRatio, 1.5)
      : 1.0;
    renderer.setPixelRatio(pixelRatio);
    renderer.shadowMap.enabled = !isSoftwareGl && graphicsQuality !== 'low';
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    const gl = renderer.getContext();
    const gl2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext ? gl : null;

    // 2. Dual Camera setup (Main Perspective + Secondary PiP Perspective)
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1200);
    camera.position.set(0, 18, 45);
    const pipCamera = new THREE.PerspectiveCamera(54, 16 / 9, 0.1, 1200);

    // 3. PMREM Space Environment Map (compiled once)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const envTexture = ProceduralTextures.getSpaceEnvironmentTexture();
    const spaceEnvMap = pmremGenerator.fromEquirectangular(envTexture).texture;

    // 4. Instantiate 3D Worlds + Dedicated Interplanetary Travel Scene
    const universe = new SpaceUniverse();
    const earthWorld = new EarthWorld();
    const moonWorld = new MoonWorld();
    const marsWorld = new MarsWorld();
    const travelScene = new InterplanetaryTravelScene(spaceEnvMap);
    const moonResourceManager = new MoonResourceWorldManager((x, z) => MoonWorld.getElevation(x, z));
    const marsResourceManager = new MarsResourceWorldManager((x, z) => MarsWorld.getElevation(x, z));

    earthWorld.scene.environment = spaceEnvMap;
    moonWorld.scene.environment = spaceEnvMap;
    marsWorld.scene.environment = spaceEnvMap;
    universe.scene.environment = spaceEnvMap;

    // 5. Instantiate PBR Astronaut Model, 6-Wheel Rover, and Single Consistent Space Shuttle
    const astronaut = new AstronautModel();
    astronaut.setEnvironmentMap(spaceEnvMap);

    const shuttle = new SpaceShuttleModel({ isSoftwareGl });
    shuttle.setEnvironmentMap(spaceEnvMap);

    // Pre-compile WebGL shaders on GPU hardware so planet swaps never hitch frames
    if (!isSoftwareGl) {
      try {
        renderer.compile(universe.scene, camera);
        renderer.compile(earthWorld.scene, camera);
        renderer.compile(moonWorld.scene, camera);
        renderer.compile(marsWorld.scene, camera);
        renderer.compile(travelScene.scene, camera);
      } catch {
        // Ignore optional pre-warm failures on constrained contexts
      }
    }

    // 6-Wheel Planetary Rover Mesh
    const playerRoverGroup = new THREE.Group();
    const roverChassis = new THREE.Mesh(
      new THREE.BoxGeometry(1.85, 0.38, 2.65),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.75, roughness: 0.25 })
    );
    roverChassis.position.y = 0.48;
    roverChassis.castShadow = true;
    playerRoverGroup.add(roverChassis);

    const goldDeck = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.06, 1.6),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.95, roughness: 0.15 })
    );
    goldDeck.position.set(0, 0.72, -0.3);
    playerRoverGroup.add(goldDeck);

    const steeringConsole = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.65, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 })
    );
    steeringConsole.position.set(0, 0.82, 0.75);
    steeringConsole.rotation.x = -0.22;
    playerRoverGroup.add(steeringConsole);

    const roverWheels: THREE.Mesh[] = [];
    const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.4 });
    const wheelPositions = [
      [-1.05, 0.32, 0.9], [1.05, 0.32, 0.9],
      [-1.1, 0.32, 0], [1.1, 0.32, 0],
      [-1.05, 0.32, -0.9], [1.05, 0.32, -0.9]
    ];
    wheelPositions.forEach(([wx, wy, wz]) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(wx, wy, wz);
      w.castShadow = true;
      roverWheels.push(w);
      playerRoverGroup.add(w);
    });

    // Master Player Object holding avatar and rover
    const playerMasterGroup = new THREE.Group();
    playerMasterGroup.add(astronaut.group);
    playerMasterGroup.add(playerRoverGroup);

    // 6. Terrain elevation querying
    const getElevationForPlanet = (x: number, z: number, planet: PlanetId) => {
      if (planet === 'earth') return EarthWorld.getElevation(x, z);
      if (planet === 'mars') return MarsWorld.getElevation(x, z);
      return MoonWorld.getElevation(x, z);
    };

    // 7. Planetary Physics Controller
    const initialPid: HabitablePlanetId = isHabitablePlanet(currentPlanetRef.current)
      ? currentPlanetRef.current
      : 'earth';
    const physics = new PlanetaryPhysicsController(
      initialPid,
      (x, z) => getElevationForPlanet(x, z, initialPid)
    );
    physics.cameraMode = cameraModePropRef.current;
    physics.teleport(0, 4.5);
    if (initialPid === 'moon') {
      physics.cameraAzimuth = Math.PI;
      physics.rotationY = Math.PI;
    }
    let shouldSnapCamera = viewModeRef.current === 'surface';

    const roverDust = new RoverDustParticles();

    // Subsurface Georadar Holographic Pulse Ring
    const radarRingGeo = new THREE.RingGeometry(0.8, 1.6, 32);
    radarRingGeo.rotateX(-Math.PI / 2);
    const radarRingMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0
    });
    const radarRing = new THREE.Mesh(radarRingGeo, radarRingMat);
    let radarPulseProgress = 1.0;

    // 8. Shuttle & World State Tracking
    let activePlanetState: HabitablePlanetId = initialPid;
    let activeViewState: ViewMode = viewModeRef.current;
    let landingManager: LandingSequenceManager | null = null;

    let shuttleState: ShuttleInteractionState = 'on_foot';
    let shuttlePhaseTime = 0;
    let shuttleOriginPlanet: HabitablePlanetId = initialPid;
    let shuttleDestinationPlanet: HabitablePlanetId | null = null;
    let shuttleLocationPlanet: HabitablePlanetId = initialPid;
    let pendingAutoDisembark = false;
    let wasNearShuttle = false;

    const boardingVec = new THREE.Vector3();
    const exitVec = new THREE.Vector3();
    const combinedObstacles: CylinderObstacle[] = [];

    let handledJumpTrigger = virtualJumpPropRef.current;
    let handledRadarTrigger = georadarPropRef.current;
    let handledResetCamTrigger = resetCamPropRef.current;
    let handledSkipLanding = skipLandingPropRef.current;
    let handledScanTrigger = scanPropRef.current;
    let handledCollectTrigger = collectPropRef.current;
    let handledTeleportSeq = teleportReqPropRef.current?.seq ?? -1;
    let handledShuttleDestSeq = shuttleDestReqPropRef.current?.seq ?? -1;
    let handledDirectLandingSeq = shuttleDirectLandingReqPropRef.current?.seq ?? -1;
    let handledShuttleEnterTrigger = shuttleEnterPropRef.current;
    let handledShuttleExitTrigger = shuttleExitPropRef.current;
    let handledHistoricalSeq = historicalMissionPropRef.current?.seq ?? -1;
    let handledSoilMarkSeq = moonSoilMarkPropRef.current?.seq ?? -1;
    let lastMrTelemetry: MoonWorldRuntimeTelemetry | null = null;
    let lastMarsTelemetry: MarsWorldRuntimeTelemetry | null = null;
    let wasDrivingHistoricalLrv = false;
    let shouldSnapUniverseCamera = true;
    let appliedLightingMode: 'day' | 'sunset' | 'night' = 'day';

    const shuttleLookOffset: ShuttleCameraLookOffset = {
      cockpitYaw: 0,
      cockpitPitch: 0,
      chaseYaw: 0,
      chasePitch: 0
    };

    // Throttled Telemetry Sync Timers
    let lastTelemetryTime = 0;
    let lastShuttleTelemetryTime = 0;
    let lastLandingTelemTime = 0;

    const emitShuttleTelemetry = () => {
      callbacksRef.current.onShuttleTravelChange?.(
        buildTravelTelemetry({
          state: shuttleState,
          phaseTime: shuttlePhaseTime,
          originPlanet: shuttleOriginPlanet,
          destinationPlanet: shuttleDestinationPlanet,
          shuttlePlanet: shuttleLocationPlanet,
          shuttleCameraView: shuttleCameraViewPropRef.current
        })
      );
      document.body.dataset.shuttleState = shuttleState;
      document.body.dataset.planet = activePlanetState;
      document.body.dataset.nearShuttle = wasNearShuttle ? 'true' : 'false';
      document.body.dataset.cameraView = shuttleCameraViewPropRef.current;
      document.body.dataset.pip = isPipEnabledPropRef.current ? 'true' : 'false';
    };

    let boardingVariant = 0;

    const seatAstronautInCockpit = () => {
      if (isDrivingRoverPropRef.current) {
        isDrivingRoverPropRef.current = false;
        callbacksRef.current.onSetDrivingRover?.(false);
      }
      if (astronaut.group.parent !== shuttle.cockpitSeatAnchor) {
        shuttle.cockpitSeatAnchor.add(astronaut.group);
      }
      astronaut.group.position.set(0, 0, 0);
      astronaut.group.rotation.set(0, 0, 0);
      astronaut.group.visible = true;
      astronaut.setPosture('sit');
      astronaut.setScanning(false);
      astronaut.setCollecting(false);
      playerMasterGroup.visible = false;
      playerRoverGroup.visible = false;
    };

    const tryBoardOrExitShuttle = (action: 'auto' | 'enter' | 'exit') => {
      if (viewModeRef.current !== 'surface') return false;
      if (landingManager && landingManager.getIsActive()) return false;

      if ((action === 'auto' || action === 'exit') && isShuttleExitAllowed(shuttleState)) {
        shuttleState = 'disembark';
        shuttlePhaseTime = 0;
        if (astronaut.group.parent !== playerMasterGroup) {
          playerMasterGroup.add(astronaut.group);
        }
        astronaut.group.position.set(0, 0, 0);
        astronaut.group.rotation.set(0, 0, 0);
        astronaut.setFirstPersonBodyHidden(false);
        astronaut.setFirstPersonHeadHidden(false);
        astronaut.snapToPosture('stand');
        if (posturePropRef.current !== 'stand') {
          callbacksRef.current.onPostureChange('stand');
        }
        shuttle.getExitWorldPosition(exitVec);
        physics.teleport(exitVec.x, exitVec.z);
        playerMasterGroup.position.copy(physics.position);
        playerMasterGroup.visible = true;
        astronaut.group.visible = physics.cameraMode !== 'first-person';
        soundManager.playPing();
        narrationManager.speak(getDisembarkStoryLine(activePlanetState), {
          priority: 'normal',
          dedupeKey: `disembark_${activePlanetState}`,
          cooldownMs: 8000
        });
        emitShuttleTelemetry();
        return true;
      }

      if ((action === 'auto' || action === 'enter') && shuttleState === 'on_foot') {
        const pad = SHUTTLE_PADS[activePlanetState];
        const near = canBoardShuttle({
          playerX: physics.position.x,
          playerZ: physics.position.z,
          shuttleX: pad.x,
          shuttleZ: pad.z,
          currentPlanet: activePlanetState,
          shuttlePlanet: shuttleLocationPlanet,
          state: shuttleState
        });
        if (near) {
          if (isDrivingRoverPropRef.current) {
            isDrivingRoverPropRef.current = false;
            callbacksRef.current.onSetDrivingRover?.(false);
          }
          if (posturePropRef.current !== 'stand') {
            callbacksRef.current.onPostureChange('stand');
          }
          shuttleOriginPlanet = activePlanetState;
          shuttleState = 'boarding';
          shuttlePhaseTime = 0;
          soundManager.playPing();
          narrationManager.speak(getBoardingStoryLine(activePlanetState, boardingVariant++), {
            priority: 'normal',
            dedupeKey: `boarding_${activePlanetState}`,
            cooldownMs: 6000
          });
          emitShuttleTelemetry();
          return true;
        }
      }
      return false;
    };

    // 9. Global Keyboard Event Listeners
    const onKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        if (landingManager && landingManager.getIsActive()) {
          landingManager.skip();
          e.preventDefault();
          return;
        }
        if (shuttleState === 'landing') {
          shuttlePhaseTime = TRAVEL_PHASE_DURATIONS.landing;
          shuttle.setReentryPlasma(0);
          emitShuttleTelemetry();
          e.preventDefault();
          return;
        }
        if (isAstronautLockedInShuttle(shuttleState)) {
          e.preventDefault();
          return;
        }
        inputRef.current.jump = true;
        if (posturePropRef.current !== 'stand') {
          callbacksRef.current.onPostureChange('stand');
        }
        e.preventDefault();
        return;
      }

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          if (!isAstronautLockedInShuttle(shuttleState)) inputRef.current.forward = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          if (!isAstronautLockedInShuttle(shuttleState)) inputRef.current.backward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          if (!isAstronautLockedInShuttle(shuttleState)) inputRef.current.left = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          if (!isAstronautLockedInShuttle(shuttleState)) inputRef.current.right = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          inputRef.current.sprint = true;
          break;
        case 'KeyR':
          if (!isAstronautLockedInShuttle(shuttleState)) {
            callbacksRef.current.onToggleRover();
          }
          break;
        case 'KeyE':
          if (tryBoardOrExitShuttle('auto')) {
            e.preventDefault();
            break;
          }
          if (!isAstronautLockedInShuttle(shuttleState) && activePlanetState === 'moon') {
            const ctx = moonResourceManager.getInteractionContext(physics.position);
            if (ctx.lrvDriving || ctx.nearLrvVehicle) {
              soundManager.playPing();
              callbacksRef.current.onToggleMoonLrv?.();
              e.preventDefault();
              break;
            }
            if (ctx.nearbyResourceId) {
              soundManager.playDiscoveryInspect();
              callbacksRef.current.onInspectMoonResource?.(ctx.nearbyResourceId);
              e.preventDefault();
              break;
            }
          }
          if (!isAstronautLockedInShuttle(shuttleState) && activePlanetState === 'mars') {
            const ctx = marsResourceManager.getInteractionContext(physics.position);
            if (ctx.nearbyResourceId) {
              soundManager.playDiscoveryInspect();
              callbacksRef.current.onInspectMarsResource?.(ctx.nearbyResourceId);
              e.preventDefault();
              break;
            }
          }
          if (!isAstronautLockedInShuttle(shuttleState) && currentNearbyRef.current) {
            soundManager.playDiscoveryInspect();
            callbacksRef.current.onInspectDiscovery(currentNearbyRef.current);
          }
          break;
        case 'KeyV': {
          if (isAstronautLockedInShuttle(shuttleState)) {
            callbacksRef.current.onToggleShuttleCameraView?.();
            soundManager.playPing();
            emitShuttleTelemetry();
          } else {
            const nextMode = physics.toggleCameraMode();
            callbacksRef.current.onToggleCameraMode?.(nextMode);
            soundManager.playPing();
          }
          break;
        }
        case 'KeyC':
          if (isAstronautLockedInShuttle(shuttleState)) {
            callbacksRef.current.onToggleShuttleCameraView?.();
            soundManager.playPing();
            emitShuttleTelemetry();
          } else {
            callbacksRef.current.onToggleCloak();
          }
          break;
        case 'Digit1':
          if (isAstronautLockedInShuttle(shuttleState)) {
            callbacksRef.current.onSetShuttleCameraView?.('cockpit');
            soundManager.playPing();
            emitShuttleTelemetry();
          }
          break;
        case 'Digit2':
          if (isAstronautLockedInShuttle(shuttleState)) {
            callbacksRef.current.onSetShuttleCameraView?.('external_chase');
            soundManager.playPing();
            emitShuttleTelemetry();
          }
          break;
        case 'KeyP':
          if (isAstronautLockedInShuttle(shuttleState)) {
            callbacksRef.current.onTogglePip?.();
            soundManager.playPing();
            emitShuttleTelemetry();
          }
          break;
        case 'KeyX':
          if (!isAstronautLockedInShuttle(shuttleState)) {
            callbacksRef.current.onTriggerGeoradar();
          }
          break;
        case 'KeyG':
          callbacksRef.current.onOpenGravityLab();
          break;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          inputRef.current.forward = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          inputRef.current.backward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          inputRef.current.left = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          inputRef.current.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          inputRef.current.sprint = false;
          break;
        case 'Space':
          inputRef.current.jump = false;
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // 10. Mouse Orbit & Raycasting (Planetary Universe Only)
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();

    let universeAzimuth = 0.55;
    let universePitch = 0.52;
    let universeDistance = 154;
    const universeFocusTarget = new THREE.Vector3(0, 0, 0);
    const universeFocusScratch = new THREE.Vector3();

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isDragging = true;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - prevMouseX;
        const dy = e.clientY - prevMouseY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;

        if (viewModeRef.current === 'surface') {
          if (isAstronautLockedInShuttle(shuttleState)) {
            if (shuttleCameraViewPropRef.current === 'cockpit') {
              shuttleLookOffset.cockpitYaw = Math.max(
                -0.85,
                Math.min(0.85, shuttleLookOffset.cockpitYaw - dx * 0.0045)
              );
              shuttleLookOffset.cockpitPitch = Math.max(
                -0.42,
                Math.min(0.45, shuttleLookOffset.cockpitPitch - dy * 0.0038)
              );
            } else {
              shuttleLookOffset.chaseYaw -= dx * 0.0055;
              shuttleLookOffset.chasePitch = Math.max(
                -0.4,
                Math.min(0.85, shuttleLookOffset.chasePitch - dy * 0.0045)
              );
            }
          } else {
            physics.cameraAzimuth -= dx * 0.0055;
            physics.cameraPitch = Math.max(0.06, Math.min(1.15, physics.cameraPitch - dy * 0.0045));
          }
        } else {
          universeAzimuth -= dx * 0.005;
          universePitch = Math.max(0.1, Math.min(1.4, universePitch - dy * 0.004));
        }
      } else if (viewModeRef.current === 'universe') {
        const rect = renderer.domElement.getBoundingClientRect();
        mouseCoord.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseCoord.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouseCoord, camera);

        const hits = raycaster.intersectObjects(universe.getRaycastTargets(), false);

        if (hits.length > 0) {
          const pid = hits[0].object.userData.planetId as PlanetId;
          universe.setHoveredPlanet(pid);
          renderer.domElement.style.cursor = 'pointer';
          callbacksRef.current.onHoverPlanetInUniverse(pid);
        } else {
          universe.setHoveredPlanet(null);
          renderer.domElement.style.cursor = 'default';
          callbacksRef.current.onHoverPlanetInUniverse(null);
        }
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        isDragging = false;
      }
      if (
        viewModeRef.current === 'universe' &&
        Math.abs(e.clientX - prevMouseX) < 4 &&
        Math.abs(e.clientY - prevMouseY) < 4
      ) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouseCoord.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseCoord.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouseCoord, camera);

        const hits = raycaster.intersectObjects(universe.getRaycastTargets(), false);
        if (hits.length > 0) {
          const pid = hits[0].object.userData.planetId as PlanetId;
          soundManager.playPing();
          universe.setSelectedPlanet(pid);
          callbacksRef.current.onSelectPlanetInUniverse(pid);
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (viewModeRef.current === 'universe') {
        universeDistance = Math.max(16, Math.min(260, universeDistance + e.deltaY * 0.08));
      } else {
        physics.zoomCamera(e.deltaY * 0.005);
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: true });

    const onResize = () => {
      if (!mountRef.current) return;
      width = mountRef.current.clientWidth || window.innerWidth;
      height = mountRef.current.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    // 11. Master Render Loop (with software-WebGL afterDraw pacing per threejs skill)
    let disposed = false;
    let lastTime = performance.now();
    let animId = 0;
    let paceTimerId: number | null = null;
    let startTime = performance.now();

    const afterDraw = (onNext: () => void) => {
      if (disposed) return;
      if (!isSoftwareGl) {
        animId = requestAnimationFrame(onNext);
        return;
      }
      if (gl2) {
        const sync = gl2.fenceSync(gl2.SYNC_GPU_COMMANDS_COMPLETE, 0);
        if (sync) {
          const poll = () => {
            if (disposed) {
              gl2.deleteSync(sync);
              return;
            }
            const status = gl2.clientWaitSync(sync, 0, 0);
            if (status === gl2.TIMEOUT_EXPIRED) {
              paceTimerId = window.setTimeout(poll, 16);
            } else {
              gl2.deleteSync(sync);
              paceTimerId = window.setTimeout(() => {
                if (!disposed) animId = requestAnimationFrame(onNext);
              }, 60);
            }
          };
          paceTimerId = window.setTimeout(poll, 16);
          return;
        }
      }
      paceTimerId = window.setTimeout(() => {
        if (!disposed) animId = requestAnimationFrame(onNext);
      }, 60);
    };

    const scheduleNextFrame = () => afterDraw(render);

    const desireCamScratch = new THREE.Vector3();

    const renderWithOptionalPip = (
      targetScene: THREE.Scene,
      shuttleCamState: { isActive: boolean; isParked: boolean }
    ) => {
      const primaryView = shuttleCameraViewPropRef.current;

      if (shuttleCamState.isActive) {
        astronaut.setFirstPersonHeadHidden(primaryView === 'cockpit');
        astronaut.setFirstPersonBodyHidden(primaryView === 'cockpit');
        shuttle.applyCockpitOrChaseCamera(
          camera,
          primaryView,
          1.0,
          shuttleCamState.isParked,
          shuttleLookOffset
        );
      } else {
        astronaut.setFirstPersonHeadHidden(false);
        astronaut.setFirstPersonBodyHidden(false);
      }

      renderer.autoClear = true;
      renderer.setScissorTest(false);
      renderer.setViewport(0, 0, width, height);
      renderer.render(targetScene, camera);

      if (
        shuttleCamState.isActive &&
        isPipEnabledPropRef.current &&
        width >= 640 &&
        height >= 400
      ) {
        const secondaryView: ShuttleCameraView =
          primaryView === 'cockpit' ? 'external_chase' : 'cockpit';
        const pipW = Math.max(220, Math.min(340, Math.round(width * 0.24)));
        const pipH = Math.round((pipW * 9) / 16);
        const pipX = width - pipW - 20;
        const pipY = 86;

        pipCamera.aspect = pipW / pipH;
        pipCamera.updateProjectionMatrix();
        astronaut.setFirstPersonHeadHidden(secondaryView === 'cockpit');
        astronaut.setFirstPersonBodyHidden(secondaryView === 'cockpit');
        shuttle.applyCockpitOrChaseCamera(
          pipCamera,
          secondaryView,
          1.0,
          shuttleCamState.isParked,
          shuttleLookOffset
        );

        renderer.autoClear = false;
        renderer.setScissorTest(true);
        renderer.setViewport(pipX, pipY, pipW, pipH);
        renderer.setScissor(pipX, pipY, pipW, pipH);
        renderer.clearDepth();
        renderer.render(targetScene, pipCamera);
        renderer.setScissorTest(false);
        renderer.setViewport(0, 0, width, height);
        renderer.autoClear = true;

        astronaut.setFirstPersonHeadHidden(primaryView === 'cockpit');
        astronaut.setFirstPersonBodyHidden(primaryView === 'cockpit');
      }
    };

    const render = () => {
      if (disposed) return;
      const now = performance.now();
      const rawDelta = Math.max(0.001, (now - lastTime) / 1000);
      const delta = Math.min(rawDelta, 0.05);
      const shuttleDelta = Math.min(rawDelta, 0.25);
      const elapsedSec = (now - startTime) / 1000;
      lastTime = now;

      const liveViewMode = viewModeRef.current;
      const rawPlanet = currentPlanetRef.current;
      const livePlanet: HabitablePlanetId = isHabitablePlanet(rawPlanet) ? rawPlanet : 'earth';

      // Sync CameraMode if toggled from React HUD button
      if (physics.cameraMode !== cameraModePropRef.current) {
        physics.cameraMode = cameraModePropRef.current;
      }

      // Handle Celestial Body / ViewMode Switch cleanly
      if (livePlanet !== activePlanetState || liveViewMode !== activeViewState) {
        if (livePlanet !== activePlanetState) {
          activePlanetState = livePlanet;
          physics.setPlanet(livePlanet);
          physics.setTerrainHeightFn((x, z) => getElevationForPlanet(x, z, livePlanet));
          if (shuttleState === 'on_foot') {
            physics.teleport(0, 4.5);
            if (livePlanet === 'moon') {
              physics.cameraAzimuth = Math.PI;
              physics.rotationY = Math.PI;
            }
            shouldSnapCamera = true;
            shuttleLocationPlanet = livePlanet;
            shuttleOriginPlanet = livePlanet;
            astronaut.setFirstPersonBodyHidden(false);
            astronaut.snapToPosture('stand');
          }
          currentNearbyRef.current = null;
          callbacksRef.current.onNearbyDiscoveryChange(null);
        }
        if (liveViewMode === 'surface' && activeViewState !== 'surface') {
          shouldSnapCamera = true;
        }
        if (liveViewMode === 'universe' && activeViewState !== 'universe') {
          shouldSnapUniverseCamera = true;
        }
        activeViewState = liveViewMode;
        soundManager.startAmbience(liveViewMode === 'universe' ? 'universe' : livePlanet);
        emitShuttleTelemetry();
      }

      // Check Lighting Mode Change
      if (lightingModePropRef.current !== appliedLightingMode) {
        appliedLightingMode = lightingModePropRef.current;
        earthWorld.setLightingMode(appliedLightingMode);
        moonWorld.setLightingMode(appliedLightingMode);
        marsWorld.setLightingMode(appliedLightingMode);
      }

      // Check 1-Click Waypoint / Landmark Teleport Request
      if (teleportReqPropRef.current && teleportReqPropRef.current.seq !== handledTeleportSeq) {
        handledTeleportSeq = teleportReqPropRef.current.seq;
        if (shuttleState === 'on_foot') {
          const req = teleportReqPropRef.current;
          physics.teleport(req.x, req.z);
          if (req.yaw !== undefined) {
            physics.cameraAzimuth = req.yaw;
            physics.rotationY = req.yaw;
          }
          shouldSnapCamera = true;
          if (posturePropRef.current !== 'stand') {
            callbacksRef.current.onPostureChange('stand');
          }
        }
      }

      // Check UI-driven Shuttle Enter / Exit triggers
      if (shuttleEnterPropRef.current !== handledShuttleEnterTrigger) {
        handledShuttleEnterTrigger = shuttleEnterPropRef.current;
        tryBoardOrExitShuttle('enter');
      }
      if (shuttleExitPropRef.current !== handledShuttleExitTrigger) {
        handledShuttleExitTrigger = shuttleExitPropRef.current;
        tryBoardOrExitShuttle('exit');
      }

      // Check Shuttle Interplanetary Destination Launch Request
      if (
        shuttleDestReqPropRef.current &&
        shuttleDestReqPropRef.current.seq !== handledShuttleDestSeq
      ) {
        handledShuttleDestSeq = shuttleDestReqPropRef.current.seq;
        const targetDest = shuttleDestReqPropRef.current.target;
        if (
          targetDest !== shuttleLocationPlanet &&
          (shuttleState === 'seated_cockpit' || shuttleState === 'on_foot')
        ) {
          pendingAutoDisembark = false;
          seatAstronautInCockpit();
          shuttleOriginPlanet = shuttleLocationPlanet;
          shuttleDestinationPlanet = targetDest;
          shuttleState = 'takeoff';
          shuttlePhaseTime = 0;
          travelScene.configureRoute(shuttleOriginPlanet, targetDest);
          soundManager.playIgnitionTransient(shuttleCameraViewPropRef.current === 'cockpit');
          narrationManager.speak(getTakeoffStoryLine(shuttleOriginPlanet, targetDest), {
            priority: 'high',
            dedupeKey: `takeoff_${shuttleOriginPlanet}_${targetDest}`,
            cooldownMs: 8000
          });
          emitShuttleTelemetry();
        }
      }

      // Check Direct Orbital Descent into Planet Pad using the actual Space Shuttle
      if (
        shuttleDirectLandingReqPropRef.current &&
        shuttleDirectLandingReqPropRef.current.seq !== handledDirectLandingSeq
      ) {
        handledDirectLandingSeq = shuttleDirectLandingReqPropRef.current.seq;
        const targetDest = shuttleDirectLandingReqPropRef.current.target;
        if (landingManager) {
          landingManager.landerGroup.parent?.remove(landingManager.landerGroup);
          landingManager.getDustRing().parent?.remove(landingManager.getDustRing());
          landingManager = null;
        }
        activePlanetState = targetDest;
        physics.setPlanet(targetDest);
        physics.setTerrainHeightFn((x, z) => getElevationForPlanet(x, z, targetDest));
        shuttleOriginPlanet = targetDest;
        shuttleDestinationPlanet = targetDest;
        shuttleLocationPlanet = targetDest;
        shuttleState = 'landing';
        shuttlePhaseTime = 0;
        pendingAutoDisembark = true;
        seatAstronautInCockpit();
        soundManager.startAmbience(targetDest);
        soundManager.playIgnitionTransient(shuttleCameraViewPropRef.current === 'cockpit');
        narrationManager.speak(getApproachStoryLine(targetDest), {
          priority: 'high',
          dedupeKey: `direct_landing_${targetDest}`,
          cooldownMs: 5000
        });
        emitShuttleTelemetry();
      }

      // Check Virtual Jump Button
      if (virtualJumpPropRef.current !== handledJumpTrigger) {
        handledJumpTrigger = virtualJumpPropRef.current;
        if (!isAstronautLockedInShuttle(shuttleState)) {
          inputRef.current.jump = true;
          if (posturePropRef.current !== 'stand') {
            callbacksRef.current.onPostureChange('stand');
          }
          setTimeout(() => {
            inputRef.current.jump = false;
          }, 120);
        }
      }

      // Check Georadar Trigger
      if (georadarPropRef.current !== handledRadarTrigger) {
        handledRadarTrigger = georadarPropRef.current;
        radarPulseProgress = 0.0;
        radarRing.position.set(physics.position.x, physics.position.y + 0.15, physics.position.z);
      }

      // Check Reset Universe Camera Trigger
      if (resetCamPropRef.current !== handledResetCamTrigger) {
        handledResetCamTrigger = resetCamPropRef.current;
        universeAzimuth = 0.55;
        universePitch = 0.52;
        universeDistance = 154;
        universeFocusTarget.set(0, 0, 0);
      }

      // Check Scanning Tool Trigger
      if (scanPropRef.current !== handledScanTrigger) {
        handledScanTrigger = scanPropRef.current;
        if (!isAstronautLockedInShuttle(shuttleState)) {
          astronaut.setScanning(true);
          soundManager.playFieldScanner();
          setTimeout(() => {
            astronaut.setScanning(false);
          }, 2500);
        }
      }

      // Check Sample Collection Trigger
      if (collectPropRef.current !== handledCollectTrigger) {
        handledCollectTrigger = collectPropRef.current;
        if (!isAstronautLockedInShuttle(shuttleState)) {
          astronaut.setCollecting(true);
          soundManager.playSampleCollect();
          setTimeout(() => {
            astronaut.setCollecting(false);
          }, 1800);
        }
      }

      // Pass Virtual Analog Joystick Vector Every Frame
      inputRef.current.virtualVector = isAstronautLockedInShuttle(shuttleState)
        ? { x: 0, y: 0 }
        : virtualMoveVectorRef.current;

      // Sync Rover Driving & Posture when on foot
      const drivingRover = !isAstronautLockedInShuttle(shuttleState) && isDrivingRoverPropRef.current;
      physics.isDrivingRover = drivingRover;
      playerRoverGroup.visible = drivingRover;

      if (shuttleState === 'on_foot') {
        if (astronaut.group.parent !== playerMasterGroup) {
          playerMasterGroup.add(astronaut.group);
        }
        if (drivingRover) {
          astronaut.setPosture('sit');
          astronaut.group.position.set(0, 0.42, 0.2);
        } else {
          astronaut.setPosture(posturePropRef.current);
          astronaut.group.position.set(0, 0, 0);
        }
        astronaut.group.rotation.set(0, 0, 0);
      }

      // Update Suit Customization
      astronaut.setVisorMode(visorModeRef.current);
      astronaut.setCloakActive(isCloakedRef.current, livePlanet === 'mars' ? 'mars' : 'moon');

      if (liveViewMode === 'universe') {
        universe.update(delta);

        const focusedPid = focusedOrbitPlanetRef.current;
        if (focusedPid && universe.planets.has(focusedPid)) {
          universe.setSelectedPlanet(focusedPid);
          universe.getPlanetPosition(focusedPid, universeFocusScratch);
          universeFocusTarget.lerp(universeFocusScratch, 0.08);
        } else {
          universe.setSelectedPlanet(null);
          universeFocusScratch.set(0, 0, 0);
          universeFocusTarget.lerp(universeFocusScratch, 0.08);
        }

        const hDist = universeDistance * Math.cos(universePitch);
        const vDist = universeDistance * Math.sin(universePitch);
        desireCamScratch.set(
          universeFocusTarget.x + Math.sin(universeAzimuth) * hDist,
          universeFocusTarget.y + vDist,
          universeFocusTarget.z + Math.cos(universeAzimuth) * hDist
        );
        if (shouldSnapUniverseCamera) {
          camera.position.copy(desireCamScratch);
          shouldSnapUniverseCamera = false;
        } else {
          camera.position.lerp(desireCamScratch, 0.08);
        }
        camera.up.set(0, 1, 0);
        camera.lookAt(universeFocusTarget);

        renderer.render(universe.scene, camera);
        scheduleNextFrame();
        return;
      }

      // --- SURFACE / SHUTTLE / INTERPLANETARY TRAVEL RENDERING ---
      const activeWorld =
        livePlanet === 'earth' ? earthWorld : livePlanet === 'mars' ? marsWorld : moonWorld;

      // Step world animations (discoveries, KSC radar/clouds)
      activeWorld.update(delta, elapsedSec);

      // Step Shuttle State Machine
      const stepRes = advanceShuttleState(
        {
          state: shuttleState,
          phaseTime: shuttlePhaseTime,
          originPlanet: shuttleOriginPlanet,
          destinationPlanet: shuttleDestinationPlanet,
          shuttlePlanet: shuttleLocationPlanet
        },
        shuttleDelta
      );

      shuttleState = stepRes.state;
      shuttlePhaseTime = stepRes.phaseTime;
      shuttleOriginPlanet = stepRes.originPlanet;
      shuttleDestinationPlanet = stepRes.destinationPlanet;
      shuttleLocationPlanet = stepRes.shuttlePlanet;

      if (shuttleState === 'seated_cockpit' && astronaut.group.parent !== shuttle.cockpitSeatAnchor) {
        seatAstronautInCockpit();
      }

      if (stepRes.justEnteredLandingScene) {
        const targetW = shuttleLocationPlanet;
        activePlanetState = targetW;
        physics.setPlanet(targetW);
        physics.setTerrainHeightFn((x, z) => getElevationForPlanet(x, z, targetW));
        callbacksRef.current.onShuttlePlanetArrival?.(targetW);
        soundManager.startAmbience(targetW);
        emitShuttleTelemetry();
      }

      if (stepRes.justLanded) {
        const landedPad = SHUTTLE_PADS[shuttleLocationPlanet];
        const landedPadY = getElevationForPlanet(landedPad.x, landedPad.z, shuttleLocationPlanet);
        shuttle.group.position.set(landedPad.x, landedPadY, landedPad.z);
        shuttle.group.rotation.set(0, landedPad.rotationY, 0);
        shuttle.setReentryPlasma(0);
        shuttle.getExitWorldPosition(exitVec);
        physics.teleport(exitVec.x, exitVec.z);
        soundManager.playTouchdown();
        narrationManager.speakLandingWelcome(shuttleLocationPlanet);
        if (pendingAutoDisembark) {
          pendingAutoDisembark = false;
          shuttleState = 'disembark';
          shuttlePhaseTime = 0;
          if (astronaut.group.parent !== playerMasterGroup) {
            playerMasterGroup.add(astronaut.group);
          }
          astronaut.group.position.set(0, 0, 0);
          astronaut.group.rotation.set(0, 0, 0);
          astronaut.setFirstPersonBodyHidden(false);
          astronaut.setFirstPersonHeadHidden(false);
          astronaut.snapToPosture('stand');
          playerMasterGroup.position.copy(physics.position);
          playerMasterGroup.visible = true;
          astronaut.group.visible = physics.cameraMode !== 'first-person';
          shouldSnapCamera = true;
        }
        emitShuttleTelemetry();
      }

      if (stepRes.justFinishedDisembark) {
        astronaut.snapToPosture('stand');
        astronaut.setFirstPersonBodyHidden(false);
        emitShuttleTelemetry();
      }

      // Check if Interplanetary Space Travel / Approach Scene is currently active
      if (shuttleState === 'space_travel' || shuttleState === 'approach') {
        const phaseDur =
          shuttleState === 'space_travel'
            ? TRAVEL_PHASE_DURATIONS.space_travel
            : TRAVEL_PHASE_DURATIONS.approach;
        const pProgress = Math.min(1, shuttlePhaseTime / phaseDur);
        const destForAudio = shuttleDestinationPlanet || activePlanetState;

        seatAstronautInCockpit();
        astronaut.updateAnimation(delta, false, true, false, 0, 'moon');

        travelScene.updateSimulation(
          shuttleDelta,
          elapsedSec,
          shuttle,
          shuttleState,
          pProgress
        );

        soundManager.updateShuttleFlightAudio({
          state: shuttleState,
          phaseProgress: pProgress,
          altitudeMeters: shuttleState === 'space_travel' ? 420000 : 120000 * (1 - pProgress),
          velocityKms: shuttleState === 'space_travel' ? 11.2 : 4.2,
          planet: destForAudio,
          cameraView: shuttleCameraViewPropRef.current,
          rcsActivity: shuttleState === 'approach' ? 0.65 : 0.35
        });

        if (shuttleState === 'space_travel' && pProgress > 0.32 && pProgress < 0.45 && shuttleDestinationPlanet) {
          narrationManager.speak(getCruiseStoryLine(shuttleOriginPlanet, shuttleDestinationPlanet), {
            priority: 'normal',
            dedupeKey: `cruise_${shuttleOriginPlanet}_${shuttleDestinationPlanet}`,
            cooldownMs: 25000
          });
        } else if (shuttleState === 'approach' && pProgress > 0.08 && pProgress < 0.25 && shuttleDestinationPlanet) {
          narrationManager.speak(getApproachStoryLine(shuttleDestinationPlanet), {
            priority: 'normal',
            dedupeKey: `approach_${shuttleDestinationPlanet}`,
            cooldownMs: 25000
          });
        }

        if (now - lastShuttleTelemetryTime > 120) {
          lastShuttleTelemetryTime = now;
          emitShuttleTelemetry();
        }

        renderWithOptionalPip(travelScene.scene, { isActive: true, isParked: false });
        scheduleNextFrame();
        return;
      }

      // Otherwise we are in a planetary world (on_foot, boarding, seated_cockpit, takeoff, landing, disembark)
      const destWorldForRender =
        shuttleState === 'landing'
          ? shuttleLocationPlanet === 'earth'
            ? earthWorld
            : shuttleLocationPlanet === 'mars'
            ? marsWorld
            : moonWorld
          : activeWorld;
      const worldPlanetId: HabitablePlanetId =
        shuttleState === 'landing' ? shuttleLocationPlanet : livePlanet;

      // Feed solid obstacles + shuttle collider + optional Moon/Mars resource colliders (zero heap allocations)
      const pad = SHUTTLE_PADS[worldPlanetId];
      const padY = getElevationForPlanet(pad.x, pad.z, worldPlanetId);
      combinedObstacles.length = 0;
      const worldSolidObs = destWorldForRender.getSolidObstacles();
      for (let i = 0; i < worldSolidObs.length; i++) {
        combinedObstacles.push(worldSolidObs[i]);
      }
      if (shuttleLocationPlanet === worldPlanetId && shuttleState === 'on_foot') {
        combinedObstacles.push({
          x: pad.x,
          z: pad.z,
          radius: SHUTTLE_COLLISION_RADIUS,
          height: 5.5,
          baseY: padY
        });
      }

      const mrSync = moonSyncPropRef.current;
      const activeMR = worldPlanetId === 'moon' ? activeMoonResourcePropRef.current : null;
      if (worldPlanetId === 'moon') {
        moonResourceManager.mount(moonWorld.scene);
        moonResourceManager.syncMoonMuseum(activeMR, mrSync);
        if (
          moonSoilMarkPropRef.current &&
          moonSoilMarkPropRef.current.seq !== handledSoilMarkSeq
        ) {
          handledSoilMarkSeq = moonSoilMarkPropRef.current.seq;
          moonResourceManager.addSoilTestMark(moonSoilMarkPropRef.current.type);
        }
        const mrObstacles = moonResourceManager.getObstacles();
        for (let i = 0; i < mrObstacles.length; i++) {
          combinedObstacles.push(mrObstacles[i]);
        }
      } else {
        moonResourceManager.unmount();
      }

      const rawMarsId = activeMarsResourcePropRef.current;
      if (worldPlanetId === 'mars') {
        marsResourceManager.mount(marsWorld.scene);
        marsResourceManager.syncMarsMuseum(rawMarsId, marsSyncPropRef.current);
        const marsObstacles = marsResourceManager.getObstacles();
        for (let i = 0; i < marsObstacles.length; i++) {
          combinedObstacles.push(marsObstacles[i]);
        }
      } else {
        marsResourceManager.unmount();
      }

      physics.setObstacles(combinedObstacles);
      physics.setMountainObstacles(destWorldForRender.getMountainObstacles());

      // Attach Shuttle, Player, Radar Ring, Dust Particles to active planetary world
      if (shuttleLocationPlanet === worldPlanetId) {
        if (shuttle.group.parent !== destWorldForRender.scene) {
          destWorldForRender.scene.add(shuttle.group);
        }
      } else if (shuttle.group.parent === destWorldForRender.scene) {
        destWorldForRender.scene.remove(shuttle.group);
      }

      if (playerMasterGroup.parent !== destWorldForRender.scene) {
        destWorldForRender.scene.add(playerMasterGroup);
      }
      if (radarRing.parent !== destWorldForRender.scene) {
        destWorldForRender.scene.add(radarRing);
      }
      if (roverDust.points.parent !== destWorldForRender.scene) {
        destWorldForRender.scene.add(roverDust.points);
      }

      // Radar pulse animation
      if (radarPulseProgress < 1.0) {
        radarPulseProgress += delta * 0.7;
        const scale = 1.0 + radarPulseProgress * 42;
        radarRing.scale.set(scale, scale, scale);
        radarRingMat.opacity = Math.max(0, (1.0 - radarPulseProgress) * 0.85);
      } else {
        radarRingMat.opacity = 0;
      }

      // Optional Historical Mission Vehicle Sequence (Apollo, Surveyor, Mars Sky Crane, Mars Orbiter)
      if (
        historicalMissionPropRef.current &&
        historicalMissionPropRef.current.seq !== handledHistoricalSeq
      ) {
        handledHistoricalSeq = historicalMissionPropRef.current.seq;
        const hist = historicalMissionPropRef.current;
        if (landingManager) {
          landingManager.landerGroup.parent?.remove(landingManager.landerGroup);
          landingManager.getDustRing().parent?.remove(landingManager.getDustRing());
        }
        const groundElev = getElevationForPlanet(0, 0, hist.planet);
        landingManager = new LandingSequenceManager(
          hist.planet,
          new THREE.Vector3(0, 0, 0),
          groundElev,
          hist.vehicle
        );
        landingManager.start();
      }

      if (skipLandingPropRef.current !== handledSkipLanding) {
        handledSkipLanding = skipLandingPropRef.current;
        if (landingManager && landingManager.getIsActive()) {
          landingManager.skip();
          callbacksRef.current.onLandingComplete?.();
          callbacksRef.current.onLandingTelemetryChange?.(null);
        }
        if (shuttleState === 'landing') {
          shuttlePhaseTime = TRAVEL_PHASE_DURATIONS.landing;
          shuttle.setReentryPlasma(0);
          emitShuttleTelemetry();
        }
      }

      const landingIsActive = Boolean(landingManager && landingManager.getIsActive());

      if (landingIsActive && landingManager) {
        if (landingManager.landerGroup.parent !== destWorldForRender.scene) {
          destWorldForRender.scene.add(landingManager.landerGroup);
        }
        const lmDust = landingManager.getDustRing();
        if (lmDust.parent !== destWorldForRender.scene) {
          destWorldForRender.scene.add(lmDust);
        }

        playerMasterGroup.visible = false;
        astronaut.group.visible = false;
        shuttle.group.position.set(pad.x, padY, pad.z);
        shuttle.group.rotation.set(0, pad.rotationY, 0);
        shuttle.setReentryPlasma(0);
        shuttle.setGearAndRampState(1, 1);
        shuttle.updatePropulsion({
          delta: shuttleDelta,
          intensity: 0,
          time: elapsedSec,
          environment: worldPlanetId,
          dustIntensity: 0
        });

        const telem = landingManager.update(delta);
        if (now - lastLandingTelemTime > 100 || landingManager.getIsComplete()) {
          lastLandingTelemTime = now;
          callbacksRef.current.onLandingTelemetryChange?.(telem);
        }
        landingManager.updateCinematicCamera(camera, physics.position);
        if (landingManager.getIsComplete()) {
          landingManager.landerGroup.parent?.remove(landingManager.landerGroup);
          lmDust.parent?.remove(lmDust);
          callbacksRef.current.onLandingComplete?.();
          callbacksRef.current.onLandingTelemetryChange?.(null);
        }
      } else if (shuttleState === 'boarding') {
        // Animate astronaut walking/stepping onto the boarding ramp
        const p = Math.min(1, shuttlePhaseTime / TRAVEL_PHASE_DURATIONS.boarding);
        shuttle.group.position.set(pad.x, padY, pad.z);
        shuttle.group.rotation.set(0, pad.rotationY, 0);
        shuttle.setGearAndRampState(1, 1);
        shuttle.updatePropulsion({
          delta: shuttleDelta,
          intensity: 0,
          time: elapsedSec,
          environment: worldPlanetId,
          dustIntensity: 0
        });

        shuttle.getBoardingWorldPosition(boardingVec);
        physics.position.lerp(boardingVec, Math.min(1, delta * 7.5));
        playerMasterGroup.position.copy(physics.position);
        const dx = pad.x - physics.position.x;
        const dz = pad.z - physics.position.z;
        playerMasterGroup.rotation.y = Math.atan2(dx, dz);
        playerMasterGroup.visible = true;
        astronaut.group.visible = true;
        astronaut.setFirstPersonHeadHidden(false);
        astronaut.setFirstPersonBodyHidden(false);
        astronaut.setPosture('stand');
        astronaut.updateAnimation(delta, p < 0.85, true, false, 0, worldPlanetId);
        physics.updateCamera(camera, delta);
        soundManager.updateShuttleFlightAudio({
          state: 'boarding',
          phaseProgress: p,
          altitudeMeters: 0,
          velocityKms: 0,
          planet: worldPlanetId,
          cameraView: shuttleCameraViewPropRef.current,
          rcsActivity: 0
        });
      } else if (shuttleState === 'seated_cockpit') {
        shuttle.group.position.set(pad.x, padY, pad.z);
        shuttle.group.rotation.set(0, pad.rotationY, 0);
        shuttle.setReentryPlasma(0);
        shuttle.setGearAndRampState(1, 1);
        shuttle.updatePropulsion({
          delta: shuttleDelta,
          intensity: 0,
          time: elapsedSec,
          environment: worldPlanetId,
          dustIntensity: 0
        });
        seatAstronautInCockpit();
        astronaut.updateAnimation(delta, false, true, false, 0, worldPlanetId);
        soundManager.updateShuttleFlightAudio({
          state: 'seated_cockpit',
          phaseProgress: 0,
          altitudeMeters: 0,
          velocityKms: 0,
          planet: worldPlanetId,
          cameraView: shuttleCameraViewPropRef.current,
          rcsActivity: 0
        });
      } else if (shuttleState === 'takeoff') {
        const p = Math.min(1, shuttlePhaseTime / TRAVEL_PHASE_DURATIONS.takeoff);
        const altitude = Math.pow(p, 1.45) * 110;
        const forwardDist = Math.pow(p, 1.4) * 44;
        const fwdX = Math.sin(pad.rotationY);
        const fwdZ = Math.cos(pad.rotationY);
        const pitchUp = THREE.MathUtils.smoothstep(p, 0.08, 0.9) * 0.42;

        const prop = computeShuttlePropulsionProfile({
          state: 'takeoff',
          phaseProgress: p,
          altitudeMeters: altitude,
          planet: worldPlanetId
        });

        shuttle.group.position.set(
          pad.x + fwdX * forwardDist,
          padY + altitude,
          pad.z + fwdZ * forwardDist
        );
        shuttle.group.rotation.set(-pitchUp, pad.rotationY, 0);
        shuttle.setReentryPlasma(0);
        shuttle.setGearAndRampState(prop.gearExtended, prop.rampExtended);
        shuttle.updatePropulsion({
          delta: shuttleDelta,
          intensity: prop.thrustIntensity,
          time: elapsedSec,
          environment: prop.environment,
          dustIntensity: prop.dustIntensity,
          altitudeMeters: altitude,
          rcsActivity: prop.rcsActivity
        });
        soundManager.updateShuttleFlightAudio({
          state: 'takeoff',
          phaseProgress: p,
          altitudeMeters: altitude,
          velocityKms: 0.4 + p * 7.4,
          planet: worldPlanetId,
          cameraView: shuttleCameraViewPropRef.current,
          rcsActivity: prop.rcsActivity
        });
        seatAstronautInCockpit();
        astronaut.updateAnimation(delta, false, true, false, 0, worldPlanetId);
      } else if (shuttleState === 'landing') {
        const p = Math.min(1, shuttlePhaseTime / TRAVEL_PHASE_DURATIONS.landing);
        const descentFactor = Math.max(0, 1 - p / 0.86);
        const altitude = Math.pow(descentFactor, 1.85) * 96;
        const aftDist = Math.pow(descentFactor, 1.25) * 56;
        const fwdX = Math.sin(pad.rotationY);
        const fwdZ = Math.cos(pad.rotationY);

        let pitchRad = 0;
        if (p < 0.55) {
          pitchRad = 0.16;
        } else if (p < 0.78) {
          const tFlare = (p - 0.55) / 0.23;
          pitchRad = THREE.MathUtils.lerp(0.16, -0.07, tFlare);
        } else if (p < 0.86) {
          const tLevel = (p - 0.78) / 0.08;
          pitchRad = THREE.MathUtils.lerp(-0.07, 0, tLevel);
        }

        const prop = computeShuttlePropulsionProfile({
          state: 'landing',
          phaseProgress: p,
          altitudeMeters: altitude,
          planet: worldPlanetId
        });

        shuttle.group.position.set(
          pad.x - fwdX * aftDist,
          padY + altitude,
          pad.z - fwdZ * aftDist
        );
        shuttle.group.rotation.set(pitchRad, pad.rotationY, 0);
        // Atmospheric thermal plasma bow shield during upper descent on Earth & Mars
        const plasmaHeat = worldPlanetId !== 'moon' && p < 0.42 ? (1 - p / 0.42) * 0.95 : 0;
        shuttle.setReentryPlasma(plasmaHeat);
        shuttle.setGearAndRampState(prop.gearExtended, prop.rampExtended);
        shuttle.updatePropulsion({
          delta: shuttleDelta,
          intensity: prop.thrustIntensity,
          time: elapsedSec,
          environment: prop.environment,
          dustIntensity: prop.dustIntensity,
          altitudeMeters: altitude,
          rcsActivity: prop.rcsActivity
        });
        soundManager.updateShuttleFlightAudio({
          state: 'landing',
          phaseProgress: p,
          altitudeMeters: altitude,
          velocityKms: (1 - p) * 2.2,
          planet: worldPlanetId,
          cameraView: shuttleCameraViewPropRef.current,
          rcsActivity: prop.rcsActivity
        });
        seatAstronautInCockpit();
        astronaut.updateAnimation(delta, false, true, false, 0, worldPlanetId);
      } else {
        // 'on_foot' or 'disembark' -> Full grounded / jetpack surface exploration
        shuttle.group.position.set(pad.x, padY, pad.z);
        shuttle.group.rotation.set(0, pad.rotationY, 0);
        shuttle.setReentryPlasma(0);
        shuttle.setGearAndRampState(1, 1);
        shuttle.updatePropulsion({
          delta: shuttleDelta,
          intensity: 0,
          time: elapsedSec,
          environment: worldPlanetId,
          dustIntensity: 0
        });
        soundManager.updateShuttleFlightAudio({
          state: shuttleState,
          phaseProgress: 0,
          altitudeMeters: 0,
          velocityKms: 0,
          planet: worldPlanetId,
          cameraView: shuttleCameraViewPropRef.current,
          rcsActivity: 0
        });

        physics.setTerrainHeightFn((x, z) => getElevationForPlanet(x, z, worldPlanetId));

        const activeMRNow = worldPlanetId === 'moon' ? activeMoonResourcePropRef.current : null;
        const mrSyncNow = moonSyncPropRef.current;
        const isDrivingHistoricalLrv = Boolean(
          worldPlanetId === 'moon' && mrSyncNow?.isDrivingLrv
        );
        const isSurveyorTvCamera = Boolean(
          activeMRNow === 'surveyor' && mrSyncNow?.surveyorCameraPov
        );

        if (worldPlanetId === 'moon' && mrSyncNow) {
          if (mrSyncNow.sequencePlaying) {
            const nextProg = Math.min(1, mrSyncNow.sequenceProgress + delta * 0.14);
            mrSyncNow.sequenceProgress = nextProg;
            if (nextProg >= 1) mrSyncNow.sequencePlaying = false;
            callbacksRef.current.onMoonResourceSequenceProgress?.(nextProg, nextProg >= 1);
          }
          if (mrSyncNow.laserPulseProgress !== null) {
            const nextLaser = mrSyncNow.laserPulseProgress + delta * 0.4;
            if (nextLaser >= 1) {
              mrSyncNow.laserPulseProgress = null;
              callbacksRef.current.onMoonLaserProgress?.(null);
            } else {
              mrSyncNow.laserPulseProgress = nextLaser;
              callbacksRef.current.onMoonLaserProgress?.(nextLaser);
            }
          }
          moonResourceManager.updateSyncState(mrSyncNow);
          lastMrTelemetry = moonResourceManager.update(
            delta,
            elapsedSec,
            physics.position,
            inputRef.current,
            camera
          );
        } else {
          lastMrTelemetry = null;
        }

        const marsSyncNow = marsSyncPropRef.current;
        if (worldPlanetId === 'mars') {
          if (marsSyncNow && marsSyncNow.sequencePlaying) {
            const nextMarsProg = Math.min(1, marsSyncNow.sequenceProgress + delta * 0.14);
            marsSyncNow.sequenceProgress = nextMarsProg;
            if (nextMarsProg >= 1) marsSyncNow.sequencePlaying = false;
            callbacksRef.current.onMarsResourceSequenceProgress?.(nextMarsProg, nextMarsProg >= 1);
          }
          lastMarsTelemetry = marsResourceManager.update(elapsedSec, physics.position);
        } else {
          lastMarsTelemetry = null;
        }

        if (wasDrivingHistoricalLrv && !isDrivingHistoricalLrv) {
          const h = moonResourceManager.lrvPhysics.headingRad;
          physics.teleport(
            moonResourceManager.lrvPhysics.x + Math.cos(h) * 2.2,
            moonResourceManager.lrvPhysics.z - Math.sin(h) * 2.2
          );
        }
        wasDrivingHistoricalLrv = isDrivingHistoricalLrv;

        if (isDrivingHistoricalLrv) {
          physics.position.set(
            moonResourceManager.lrvPhysics.x,
            moonResourceManager.lrvPhysics.y,
            moonResourceManager.lrvPhysics.z
          );
          physics.rotationY = moonResourceManager.lrvPhysics.headingRad;
          physics.isDrivingRover = true;
          playerMasterGroup.visible = false;
          playerRoverGroup.visible = false;
          physics.updateCamera(camera, delta, shouldSnapCamera);
          shouldSnapCamera = false;
        } else {
          physics.update(delta, inputRef.current, worldPlanetId);

          if (physics.isMoving && !drivingRover && posturePropRef.current !== 'stand') {
            callbacksRef.current.onPostureChange('stand');
          }

          if (drivingRover && physics.isMoving) {
            roverWheels.forEach(w => {
              w.rotation.x += delta * 12.0;
            });
          }

          roverDust.update(
            delta,
            drivingRover,
            physics.isMoving,
            physics.isGrounded,
            physics.position,
            physics.rotationY,
            worldPlanetId
          );

          playerMasterGroup.visible = true;
          playerMasterGroup.position.copy(physics.position);
          playerMasterGroup.rotation.y = physics.rotationY;
          astronaut.group.visible = physics.cameraMode !== 'first-person';

          astronaut.updateAnimation(
            delta,
            drivingRover ? false : physics.isMoving,
            physics.isGrounded,
            physics.isSprinting,
            physics.landingImpact,
            worldPlanetId
          );

          if (!isSurveyorTvCamera) {
            physics.updateCamera(camera, delta, shouldSnapCamera);
            shouldSnapCamera = false;
          }
        }
      }

      // Throttled Telemetry & Proximity Sync
      if (now - lastShuttleTelemetryTime > 150) {
        lastShuttleTelemetryTime = now;
        const nearNow = canBoardShuttle({
          playerX: physics.position.x,
          playerZ: physics.position.z,
          shuttleX: pad.x,
          shuttleZ: pad.z,
          currentPlanet: worldPlanetId,
          shuttlePlanet: shuttleLocationPlanet,
          state: shuttleState
        });
        if (nearNow !== wasNearShuttle) {
          wasNearShuttle = nearNow;
          callbacksRef.current.onNearShuttleChange?.(nearNow);
        }
        emitShuttleTelemetry();
      }

      if (now - lastTelemetryTime > 180) {
        lastTelemetryTime = now;
        const speed = physics.velocity.length();
        const altitude = Math.max(
          0,
          physics.position.y - getElevationForPlanet(physics.position.x, physics.position.z, worldPlanetId)
        );

        let closestDiscovery: ScientificDiscovery | null = null;
        let minDistance = Infinity;

        if (shuttleState === 'on_foot') {
          destWorldForRender.discoveryObjects.forEach(obj => {
            const dist = physics.position.distanceTo(obj.position);
            if (dist < obj.interactionRadius && dist < minDistance) {
              minDistance = dist;
              closestDiscovery = getDiscoveryById(obj.id) || null;
            }
          });
        }

        if (closestDiscovery !== currentNearbyRef.current) {
          currentNearbyRef.current = closestDiscovery;
          callbacksRef.current.onNearbyDiscoveryChange(closestDiscovery);
        }

        if (callbacksRef.current.onPlayerCoordinatesChange) {
          const lat = Math.round((28.5 + (physics.position.z / 60) * 1.5) * 100) / 100;
          const lon = Math.round((-80.6 + (physics.position.x / 60) * 1.5) * 100) / 100;
          const compass = getCompassCardinal(physics.cameraAzimuth);

          callbacksRef.current.onPlayerCoordinatesChange({
            x: Math.round(physics.position.x * 10) / 10,
            y: Math.round(physics.position.y * 10) / 10,
            z: Math.round(physics.position.z * 10) / 10,
            lat,
            lon,
            altitude: Math.round(altitude * 10) / 10,
            speed: Math.round(speed * 10) / 10,
            gravity: physics.gravity,
            biome: getPlanetaryBiomeName(worldPlanetId, physics.position.x, physics.position.z),
            headingLabel: compass.label,
            headingDeg: compass.degrees,
            nearestLandmark: closestDiscovery ? (closestDiscovery as ScientificDiscovery).name : undefined,
            nearestLandmarkDist: minDistance < 50 ? Math.round(minDistance * 10) / 10 : undefined
          });
        }

        callbacksRef.current.onUpdateDistanceTraveled(Math.round(physics.totalDistanceMeters));
        callbacksRef.current.onUpdateJumps(physics.totalJumps);
        if (lastMrTelemetry && callbacksRef.current.onMoonResourceTelemetryChange) {
          callbacksRef.current.onMoonResourceTelemetryChange(lastMrTelemetry);
        }
        if (lastMarsTelemetry && callbacksRef.current.onMarsResourceTelemetryChange) {
          callbacksRef.current.onMarsResourceTelemetryChange(lastMarsTelemetry);
        }
      }

      const useShuttleCameras =
        !landingIsActive &&
        (shuttleState === 'seated_cockpit' ||
          shuttleState === 'takeoff' ||
          shuttleState === 'landing');

      renderWithOptionalPip(destWorldForRender.scene, {
        isActive: useShuttleCameras,
        isParked: shuttleState === 'seated_cockpit'
      });
      scheduleNextFrame();
    };

    render();
    soundManager.startAmbience(viewModeRef.current === 'universe' ? 'universe' : initialPid);

    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      if (paceTimerId !== null) clearTimeout(paceTimerId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      soundManager.stopAmbience();

      moonResourceManager.unmount();
      marsResourceManager.unmount();
      radarRingGeo.dispose();
      radarRingMat.dispose();
      pmremGenerator.dispose();
      renderer.dispose();
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
    };
  }, [graphicsQuality]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
    />
  );
};
