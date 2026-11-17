export type ShuttleSurfacePlanet = 'earth' | 'moon' | 'mars';

export type ShuttleFlightPhase =
  | 'parked'
  | 'boarding'
  | 'cockpit'
  | 'takeoff'
  | 'cruise'
  | 'approach'
  | 'landing'
  | 'disembarking';

export interface ShuttlePlanetConfig {
  planetId: ShuttleSurfacePlanet;
  name: string;
  landingSiteName: string;
  gravityMss: number;
  parkPosition: { x: number; z: number };
  headingRad: number;
  /** Local offset from shuttle center where the port-side boarding hatch sits */
  hatchLocalOffset: { x: number; z: number };
  /** Local offset from shuttle center where the astronaut spawns/exits safely */
  disembarkLocalOffset: { x: number; z: number };
  approachAltitude: number;
  shortDescription: string;
  accentColor: string;
}

export interface ShuttleMissionState {
  phase: ShuttleFlightPhase;
  originPlanet: ShuttleSurfacePlanet;
  currentPlanet: ShuttleSurfacePlanet;
  selectedDestination: ShuttleSurfacePlanet | null;
  launchConfirmed: boolean;
  phaseProgress: number; // 0..1 within current timed phase
  canDisembark: boolean;
  cameraPerspective: 'cockpit' | 'chase';
}

export interface ShuttleTelemetrySnapshot {
  phase: ShuttleFlightPhase;
  phaseLabel: string;
  originPlanet: ShuttleSurfacePlanet;
  targetPlanet: ShuttleSurfacePlanet;
  altitudeMeters: number;
  velocityDisplay: string;
  progress: number;
  etaSeconds: number;
  cameraPerspective: 'cockpit' | 'chase';
  canDisembark: boolean;
}

export const SHUTTLE_INTERACTION_RADIUS = 6.2;

export const SHUTTLE_PLANET_CONFIGS: Record<ShuttleSurfacePlanet, ShuttlePlanetConfig> = {
  earth: {
    planetId: 'earth',
    name: 'Earth',
    landingSiteName: 'Kennedy Space Center — Shuttle Apron',
    gravityMss: 9.81,
    parkPosition: { x: 15.5, z: -5.5 },
    headingRad: -0.68,
    hatchLocalOffset: { x: -2.4, z: 1.6 },
    disembarkLocalOffset: { x: -4.4, z: 2.0 },
    approachAltitude: 72,
    shortDescription: 'Return to Earth Home Base, Pad 39B, Mission Control, and Deep Space Network.',
    accentColor: '#38bdf8'
  },
  moon: {
    planetId: 'moon',
    name: 'The Moon',
    landingSiteName: 'Mare Tranquillitatis — Lunar Landing Zone',
    gravityMss: 1.62,
    parkPosition: { x: -14.0, z: -14.0 },
    headingRad: 0.65,
    hatchLocalOffset: { x: -2.4, z: 1.6 },
    disembarkLocalOffset: { x: -4.4, z: 2.2 },
    approachAltitude: 68,
    shortDescription: 'Begin Lunar Exploration: 1/6th gravity, Apollo 11 site, water ice craters & lava tubes.',
    accentColor: '#e2e8f0'
  },
  mars: {
    planetId: 'mars',
    name: 'Mars',
    landingSiteName: 'Jezero Crater — Martian Touchdown Pad',
    gravityMss: 3.71,
    parkPosition: { x: -16.0, z: -4.0 },
    headingRad: 0.52,
    hatchLocalOffset: { x: -2.4, z: 1.6 },
    disembarkLocalOffset: { x: -4.4, z: 2.2 },
    approachAltitude: 70,
    shortDescription: 'Begin Martian Exploration: 38% Earth gravity, Perseverance rover & ancient river deltas.',
    accentColor: '#fb923c'
  }
};

export interface ShuttleDestinationOption {
  planetId: ShuttleSurfacePlanet;
  title: string;
  ctaLabel: string;
  subtitle: string;
  distanceLabel: string;
  gravityMss: number;
  description: string;
  isCurrentLocation: boolean;
}

export function createInitialShuttleState(
  initialPlanet: ShuttleSurfacePlanet = 'earth'
): ShuttleMissionState {
  return {
    phase: 'parked',
    originPlanet: initialPlanet,
    currentPlanet: initialPlanet,
    selectedDestination: null,
    launchConfirmed: false,
    phaseProgress: 0,
    canDisembark: true,
    cameraPerspective: 'cockpit'
  };
}

/**
 * Transform a shuttle-local offset (x, z) into world-space (x, z) using planet config heading.
 */
export function localToShuttleWorld(
  planet: ShuttleSurfacePlanet,
  localOffset: { x: number; z: number }
): { x: number; z: number } {
  const cfg = SHUTTLE_PLANET_CONFIGS[planet];
  const cos = Math.cos(cfg.headingRad);
  const sin = Math.sin(cfg.headingRad);
  return {
    x: cfg.parkPosition.x + localOffset.x * cos + localOffset.z * sin,
    z: cfg.parkPosition.z - localOffset.x * sin + localOffset.z * cos
  };
}

export function getShuttleHatchWorldPos(planet: ShuttleSurfacePlanet): { x: number; z: number } {
  const cfg = SHUTTLE_PLANET_CONFIGS[planet];
  return localToShuttleWorld(planet, cfg.hatchLocalOffset);
}

export function getShuttleDisembarkWorldPos(planet: ShuttleSurfacePlanet): { x: number; z: number } {
  const cfg = SHUTTLE_PLANET_CONFIGS[planet];
  return localToShuttleWorld(planet, cfg.disembarkLocalOffset);
}

/**
 * Checks if astronaut is within interactive boarding radius of the parked Space Shuttle hatch or center.
 */
export function isPlayerNearShuttle(
  playerX: number,
  playerZ: number,
  planet: ShuttleSurfacePlanet,
  radius: number = SHUTTLE_INTERACTION_RADIUS
): { near: boolean; distance: number; hatchWorldPos: { x: number; z: number } } {
  const cfg = SHUTTLE_PLANET_CONFIGS[planet];
  const hatch = getShuttleHatchWorldPos(planet);
  const distToHatch = Math.hypot(playerX - hatch.x, playerZ - hatch.z);
  const distToCenter = Math.hypot(playerX - cfg.parkPosition.x, playerZ - cfg.parkPosition.z);
  const effectiveDist = Math.min(distToHatch, Math.max(0, distToCenter - 1.2));
  return {
    near: effectiveDist <= radius,
    distance: Math.round(effectiveDist * 10) / 10,
    hatchWorldPos: hatch
  };
}

/**
 * Returns solid physical collision spheres for the parked shuttle fuselage & wings
 * so the astronaut never walks through the hull while still allowing walking up to the hatch.
 */
export function getShuttleObstacles(
  planet: ShuttleSurfacePlanet,
  phase: ShuttleFlightPhase
): Array<{ x: number; z: number; radius: number }> {
  if (phase === 'takeoff' || phase === 'cruise' || phase === 'approach' || phase === 'landing') {
    return [];
  }
  const cfg = SHUTTLE_PLANET_CONFIGS[planet];
  const fwdNose = localToShuttleWorld(planet, { x: 0, z: 3.1 });
  const aftBody = localToShuttleWorld(planet, { x: 0, z: -2.6 });
  return [
    { x: cfg.parkPosition.x, z: cfg.parkPosition.z, radius: 2.35 },
    { x: fwdNose.x, z: fwdNose.z, radius: 1.55 },
    { x: aftBody.x, z: aftBody.z, radius: 2.15 }
  ];
}

export function getDestinationOptions(currentPlanet: ShuttleSurfacePlanet): ShuttleDestinationOption[] {
  const order: ShuttleSurfacePlanet[] =
    currentPlanet === 'earth'
      ? ['moon', 'mars', 'earth']
      : currentPlanet === 'moon'
      ? ['mars', 'earth', 'moon']
      : ['moon', 'earth', 'mars'];

  const distanceMap: Record<string, string> = {
    'earth->moon': '384,400 km • ~3-Day Trans-Lunar Trajectory',
    'earth->mars': '225M km • Interplanetary Hohmann Transfer',
    'moon->mars': '225M km • Deep-Space Orbital Slingshot',
    'moon->earth': '384,400 km • Trans-Earth Return Trajectory',
    'mars->earth': '225M km • Earth Home Base Return',
    'mars->moon': '225M km • Lunar Gateway Direct Approach'
  };

  return order.map((pid) => {
    const cfg = SHUTTLE_PLANET_CONFIGS[pid];
    const isCurrent = pid === currentPlanet;
    return {
      planetId: pid,
      title: pid === 'moon' ? 'MOON' : pid === 'mars' ? 'MARS' : 'EARTH',
      ctaLabel:
        pid === 'moon'
          ? 'Begin Lunar Exploration'
          : pid === 'mars'
          ? 'Begin Martian Exploration'
          : 'Return to Earth Home Base',
      subtitle: cfg.landingSiteName,
      distanceLabel: isCurrent
        ? 'SHUTTLE CURRENTLY PARKED HERE'
        : distanceMap[`${currentPlanet}->${pid}`] || 'Interplanetary Flight',
      gravityMss: cfg.gravityMss,
      description: cfg.shortDescription,
      isCurrentLocation: isCurrent
    };
  });
}

export function canLaunchMission(state: Pick<ShuttleMissionState, 'phase' | 'currentPlanet' | 'selectedDestination' | 'launchConfirmed'>): boolean {
  if (state.phase !== 'cockpit') return false;
  if (!state.selectedDestination) return false;
  if (state.selectedDestination === state.currentPlanet) return false;
  if (!state.launchConfirmed) return false;
  return true;
}

export interface TakeoffTransform {
  altitudeY: number;
  pitchRad: number;
  forwardTravel: number;
  throttle: number;
  gearExtended: number; // 1 = down, 0 = retracted
  phaseLabel: string;
}

/**
 * Pure kinematic curve for Shuttle launch:
 * 0.00 - 0.22: Main engine ignition & pad hold-down vibration
 * 0.22 - 0.58: Vertical liftoff & clearing tower/pad
 * 0.58 - 1.00: Pitch-over gravity turn & rapid orbital acceleration
 */
export function computeTakeoffTransform(progress: number): TakeoffTransform {
  const p = Math.max(0, Math.min(1, progress));

  if (p < 0.22) {
    const t = p / 0.22;
    return {
      altitudeY: 0,
      pitchRad: 0,
      forwardTravel: 0,
      throttle: 0.35 + t * 0.65,
      gearExtended: 1,
      phaseLabel: 'MAIN ENGINE IGNITION'
    };
  }

  if (p < 0.58) {
    const t = (p - 0.22) / 0.36;
    const ease = t * t;
    return {
      altitudeY: ease * 26,
      pitchRad: -t * 0.24,
      forwardTravel: ease * 10,
      throttle: 1.0,
      gearExtended: Math.max(0, 1 - t * 1.4),
      phaseLabel: 'LIFTOFF & ASCENT'
    };
  }

  const t = (p - 0.58) / 0.42;
  const climbEase = t * t;
  return {
    altitudeY: 26 + climbEase * 115,
    pitchRad: -0.24 - t * 0.62,
    forwardTravel: 10 + climbEase * 85,
    throttle: 1.0,
    gearExtended: 0,
    phaseLabel: 'ORBITAL INSERTION BURN'
  };
}

export interface CruiseTransform {
  originDistance: number;
  originScale: number;
  targetDistance: number;
  targetScale: number;
  speedKms: number;
  progress: number;
  phaseLabel: string;
}

/**
 * Pure interpolation for interplanetary cruise: origin recedes behind, target grows ahead.
 */
export function computeCruiseProgress(progress: number): CruiseTransform {
  const p = Math.max(0, Math.min(1, progress));
  const smooth = p * p * (3 - 2 * p);

  return {
    originDistance: 24 + smooth * 145,
    originScale: Math.max(0.22, 1.4 - smooth * 1.15),
    targetDistance: 165 - smooth * 132,
    targetScale: 0.25 + smooth * 1.35,
    speedKms: Math.round((11.2 + Math.sin(p * Math.PI) * 28.4) * 10) / 10,
    progress: p,
    phaseLabel: p < 0.35 ? 'TRANS-PLANETARY INJECTION' : p < 0.78 ? 'DEEP SPACE CRUISE' : 'PLANETARY CAPTURE BURN'
  };
}

export interface LandingTransform {
  altitudeY: number;
  pitchRad: number;
  throttle: number;
  gearExtended: number;
  dustOpacity: number;
  suspensionCompression: number;
  phaseLabel: string;
  isSettled: boolean;
}

/**
 * Pure kinematic curve for planetary approach, retro-burn flare, gear deployment & touchdown.
 */
export function computeLandingTransform(progress: number, approachAltitude: number): LandingTransform {
  const p = Math.max(0, Math.min(1, progress));

  if (p < 0.50) {
    const t = p / 0.50;
    const altFactor = Math.pow(1 - t * 0.72, 1.7);
    return {
      altitudeY: approachAltitude * altFactor,
      pitchRad: 0.26 * (1 - t * 0.45),
      throttle: 0.75 + t * 0.2,
      gearExtended: Math.min(1, Math.max(0, (t - 0.45) / 0.45)),
      dustOpacity: 0,
      suspensionCompression: 0,
      phaseLabel: 'ATMOSPHERIC / ORBITAL APPROACH',
      isSettled: false
    };
  }

  if (p < 0.84) {
    const t = (p - 0.50) / 0.34;
    const alt = approachAltitude * Math.pow(0.28, 1.7) * Math.pow(1 - t, 2.1);
    const proximity = Math.max(0, 1 - alt / 16);
    return {
      altitudeY: alt,
      pitchRad: 0.14 * (1 - t),
      throttle: 0.92 - t * 0.35,
      gearExtended: 1,
      dustOpacity: proximity * 0.7,
      suspensionCompression: 0,
      phaseLabel: 'FINAL RETRO-DESCENT & FLARE',
      isSettled: false
    };
  }

  if (p < 0.93) {
    const t = (p - 0.84) / 0.09;
    return {
      altitudeY: 0,
      pitchRad: Math.sin(t * Math.PI) * -0.025,
      throttle: Math.max(0, 0.2 * (1 - t)),
      gearExtended: 1,
      dustOpacity: (1 - t) * 0.65,
      suspensionCompression: Math.sin(t * Math.PI) * 0.18,
      phaseLabel: 'TOUCHDOWN & GEAR SETTLE',
      isSettled: false
    };
  }

  return {
    altitudeY: 0,
    pitchRad: 0,
    throttle: 0,
    gearExtended: 1,
    dustOpacity: 0,
    suspensionCompression: 0,
    phaseLabel: 'SHUTDOWN COMPLETE — READY TO DISEMBARK',
    isSettled: true
  };
}
