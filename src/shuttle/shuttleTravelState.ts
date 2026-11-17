import { CELESTIAL_BODIES } from '../planets/planetConfig';

export type HabitablePlanetId = 'earth' | 'moon' | 'mars';

export type ShuttleInteractionState =
  | 'on_foot'
  | 'boarding'
  | 'seated_cockpit'
  | 'takeoff'
  | 'space_travel'
  | 'approach'
  | 'landing'
  | 'disembark';

export type ShuttleCameraView = 'cockpit' | 'external_chase';

export interface ShuttlePadCoords {
  x: number;
  z: number;
  rotationY: number;
  label: string;
}

export const SHUTTLE_PADS: Record<HabitablePlanetId, ShuttlePadCoords> = {
  earth: {
    x: 16,
    z: -6,
    rotationY: -0.45,
    label: 'Kennedy Space Center — Pad 39A Shuttle Apron'
  },
  moon: {
    x: -16,
    z: 10,
    rotationY: 0.65,
    label: 'Artemis South Pole — Lunar Shuttle Pad'
  },
  mars: {
    x: 14,
    z: -8,
    rotationY: -0.85,
    label: 'Jezero Crater — Ares Shuttle Landing Pad'
  }
};

export const SHUTTLE_BOARDING_RADIUS = 10.5;
export const SHUTTLE_COLLISION_RADIUS = 4.2;

export const TRAVEL_PHASE_DURATIONS = {
  boarding: 0.9,
  takeoff: 4.5,
  space_travel: 5.5,
  approach: 3.5,
  landing: 5.2,
  disembark: 0.65
} as const;

export interface ShuttleDestinationOption {
  id: HabitablePlanetId;
  name: string;
  subtitle: string;
  gravityMss: number;
  distanceLabel: string;
  estimatedTransitLabel: string;
}

export interface TravelTelemetrySnapshot {
  state: ShuttleInteractionState;
  originPlanet: HabitablePlanetId;
  destinationPlanet: HabitablePlanetId | null;
  shuttleLocationPlanet: HabitablePlanetId;
  shuttleCameraView: ShuttleCameraView;
  phaseProgress: number; // 0..1 within current animated phase
  overallProgress: number; // 0..1 across takeoff -> space_travel -> approach -> landing
  altitudeMeters: number;
  velocityKms: number;
  distanceRemainingKm: number;
  phaseLabel: string;
}

export function isHabitablePlanet(id: string): id is HabitablePlanetId {
  return id === 'earth' || id === 'moon' || id === 'mars';
}

/**
 * Returns the two destination worlds reachable from the current planet.
 */
export function getAvailableShuttleDestinations(
  currentPlanet: HabitablePlanetId
): ShuttleDestinationOption[] {
  const all: HabitablePlanetId[] = ['earth', 'moon', 'mars'];
  return all
    .filter((id) => id !== currentPlanet)
    .map((id) => {
      const cfg = CELESTIAL_BODIES[id];
      const distanceLabel =
        (currentPlanet === 'earth' && id === 'moon') ||
        (currentPlanet === 'moon' && id === 'earth')
          ? '384,400 km'
          : '225,000,000 km';
      const estimatedTransitLabel =
        (currentPlanet === 'earth' && id === 'moon') ||
        (currentPlanet === 'moon' && id === 'earth')
          ? 'Trans-Lunar Injection'
          : 'Interplanetary Transfer';
      return {
        id,
        name: cfg.name,
        subtitle: cfg.subtitle,
        gravityMss: cfg.gravityMss,
        distanceLabel,
        estimatedTransitLabel
      };
    });
}

/**
 * Checks whether the astronaut can see/use the "Enter Space Shuttle [E]" prompt.
 */
export function canBoardShuttle(params: {
  playerX: number;
  playerZ: number;
  shuttleX: number;
  shuttleZ: number;
  currentPlanet: HabitablePlanetId;
  shuttlePlanet: HabitablePlanetId;
  state: ShuttleInteractionState;
}): boolean {
  if (params.state !== 'on_foot') return false;
  if (params.currentPlanet !== params.shuttlePlanet) return false;
  const dist = Math.hypot(params.playerX - params.shuttleX, params.playerZ - params.shuttleZ);
  return dist <= SHUTTLE_BOARDING_RADIUS;
}

/**
 * Checks whether foot walking / rover / jetpack must be locked because
 * the astronaut is seated or inside an active flight phase.
 */
export function isAstronautLockedInShuttle(state: ShuttleInteractionState): boolean {
  return state !== 'on_foot';
}

/**
 * Checks whether pressing E is allowed to exit back onto the planetary surface.
 */
export function isShuttleExitAllowed(state: ShuttleInteractionState): boolean {
  return state === 'seated_cockpit';
}

/**
 * Pure state machine advance function for animated shuttle flight phases.
 */
export function advanceShuttleState(
  current: {
    state: ShuttleInteractionState;
    phaseTime: number;
    originPlanet: HabitablePlanetId;
    destinationPlanet: HabitablePlanetId | null;
    shuttlePlanet: HabitablePlanetId;
  },
  delta: number
): {
  state: ShuttleInteractionState;
  phaseTime: number;
  originPlanet: HabitablePlanetId;
  destinationPlanet: HabitablePlanetId | null;
  shuttlePlanet: HabitablePlanetId;
  justEnteredLandingScene: boolean;
  justLanded: boolean;
  justFinishedDisembark: boolean;
} {
  let { state, phaseTime, originPlanet, destinationPlanet, shuttlePlanet } = current;
  let justEnteredLandingScene = false;
  let justLanded = false;
  let justFinishedDisembark = false;

  const dt = Math.max(0, Math.min(delta, 0.25));

  if (state === 'boarding') {
    phaseTime += dt;
    if (phaseTime >= TRAVEL_PHASE_DURATIONS.boarding) {
      state = 'seated_cockpit';
      phaseTime = 0;
    }
  } else if (state === 'takeoff') {
    phaseTime += dt;
    if (phaseTime >= TRAVEL_PHASE_DURATIONS.takeoff) {
      state = 'space_travel';
      phaseTime = 0;
    }
  } else if (state === 'space_travel') {
    phaseTime += dt;
    if (phaseTime >= TRAVEL_PHASE_DURATIONS.space_travel) {
      state = 'approach';
      phaseTime = 0;
    }
  } else if (state === 'approach') {
    phaseTime += dt;
    if (phaseTime >= TRAVEL_PHASE_DURATIONS.approach) {
      state = 'landing';
      phaseTime = 0;
      if (destinationPlanet) {
        shuttlePlanet = destinationPlanet;
      }
      justEnteredLandingScene = true;
    }
  } else if (state === 'landing') {
    phaseTime += dt;
    if (phaseTime >= TRAVEL_PHASE_DURATIONS.landing) {
      state = 'seated_cockpit';
      phaseTime = 0;
      if (destinationPlanet) {
        shuttlePlanet = destinationPlanet;
        originPlanet = destinationPlanet;
      }
      destinationPlanet = null;
      justLanded = true;
    }
  } else if (state === 'disembark') {
    phaseTime += dt;
    if (phaseTime >= TRAVEL_PHASE_DURATIONS.disembark) {
      state = 'on_foot';
      phaseTime = 0;
      justFinishedDisembark = true;
    }
  }

  return {
    state,
    phaseTime,
    originPlanet,
    destinationPlanet,
    shuttlePlanet,
    justEnteredLandingScene,
    justLanded,
    justFinishedDisembark
  };
}

export function buildTravelTelemetry(params: {
  state: ShuttleInteractionState;
  phaseTime: number;
  originPlanet: HabitablePlanetId;
  destinationPlanet: HabitablePlanetId | null;
  shuttlePlanet: HabitablePlanetId;
  shuttleCameraView: ShuttleCameraView;
}): TravelTelemetrySnapshot {
  const { state, phaseTime, originPlanet, destinationPlanet, shuttlePlanet, shuttleCameraView } =
    params;

  const totalFlightDuration =
    TRAVEL_PHASE_DURATIONS.takeoff +
    TRAVEL_PHASE_DURATIONS.space_travel +
    TRAVEL_PHASE_DURATIONS.approach +
    TRAVEL_PHASE_DURATIONS.landing;

  const totalKm =
    (originPlanet === 'moon' && destinationPlanet === 'earth') ||
    (originPlanet === 'earth' && destinationPlanet === 'moon')
      ? 384400
      : 225000000;

  let phaseProgress = 0;
  let elapsedFlight = 0;
  let altitudeMeters = 0;
  let velocityKms = 0;
  let phaseLabel = 'LANDED — READY ON PAD';

  if (state === 'boarding') {
    phaseProgress = Math.min(1, phaseTime / TRAVEL_PHASE_DURATIONS.boarding);
    phaseLabel = 'CREW BOARDING SHUTTLE';
  } else if (state === 'seated_cockpit') {
    phaseLabel = 'FLIGHT DECK ACTIVE — SELECT DESTINATION OR EXIT [E]';
  } else if (state === 'takeoff') {
    phaseProgress = Math.min(1, phaseTime / TRAVEL_PHASE_DURATIONS.takeoff);
    elapsedFlight = phaseTime;
    altitudeMeters = Math.round(Math.pow(phaseProgress, 2.1) * 18000);
    velocityKms = Math.round(phaseProgress * 7.8 * 10) / 10;
    phaseLabel = `LIFTOFF FROM ${originPlanet.toUpperCase()} — MAIN ENGINE IGNITION`;
  } else if (state === 'space_travel') {
    phaseProgress = Math.min(1, phaseTime / TRAVEL_PHASE_DURATIONS.space_travel);
    elapsedFlight = TRAVEL_PHASE_DURATIONS.takeoff + phaseTime;
    altitudeMeters = 420000;
    velocityKms = 11.2;
    phaseLabel = `INTERPLANETARY CRUISE TO ${(destinationPlanet || 'TARGET').toUpperCase()}`;
  } else if (state === 'approach') {
    phaseProgress = Math.min(1, phaseTime / TRAVEL_PHASE_DURATIONS.approach);
    elapsedFlight =
      TRAVEL_PHASE_DURATIONS.takeoff + TRAVEL_PHASE_DURATIONS.space_travel + phaseTime;
    altitudeMeters = Math.round((1 - phaseProgress * 0.85) * 120000);
    velocityKms = Math.round((11.2 - phaseProgress * 8.4) * 10) / 10;
    phaseLabel = `ORBITAL INSERTION & ${(destinationPlanet || 'TARGET').toUpperCase()} APPROACH`;
  } else if (state === 'landing') {
    phaseProgress = Math.min(1, phaseTime / TRAVEL_PHASE_DURATIONS.landing);
    elapsedFlight =
      TRAVEL_PHASE_DURATIONS.takeoff +
      TRAVEL_PHASE_DURATIONS.space_travel +
      TRAVEL_PHASE_DURATIONS.approach +
      phaseTime;
    const altFactor = Math.max(0, Math.pow(1 - Math.min(1, phaseProgress / 0.86), 2.0));
    altitudeMeters = Math.round(altFactor * 95);
    velocityKms = Math.round((1 - phaseProgress) * 1.4 * 10) / 10;
    phaseLabel =
      phaseProgress < 0.85
        ? `RETRO-PROPULSIVE DESCENT TO ${(destinationPlanet || shuttlePlanet).toUpperCase()}`
        : `TOUCHDOWN ON ${(destinationPlanet || shuttlePlanet).toUpperCase()} PAD`;
  } else if (state === 'disembark') {
    phaseProgress = Math.min(1, phaseTime / TRAVEL_PHASE_DURATIONS.disembark);
    phaseLabel = 'DISEMBARKING TO SURFACE';
  }

  const overallProgress = Math.max(0, Math.min(1, elapsedFlight / totalFlightDuration));
  const distanceRemainingKm =
    state === 'takeoff' || state === 'space_travel' || state === 'approach' || state === 'landing'
      ? Math.max(0, Math.round(totalKm * (1 - overallProgress)))
      : 0;

  return {
    state,
    originPlanet,
    destinationPlanet,
    shuttleLocationPlanet: shuttlePlanet,
    shuttleCameraView,
    phaseProgress,
    overallProgress,
    altitudeMeters,
    velocityKms,
    distanceRemainingKm,
    phaseLabel
  };
}

export interface ShuttlePropulsionProfile {
  thrustIntensity: number;
  dustIntensity: number;
  rcsActivity: number;
  gearExtended: number;
  rampExtended: number;
  environment: 'earth' | 'moon' | 'mars' | 'space';
}

export function selectShuttleCameraView(
  current: ShuttleCameraView,
  action: 'toggle' | 'cockpit' | 'external_chase'
): ShuttleCameraView {
  if (action === 'cockpit') return 'cockpit';
  if (action === 'external_chase') return 'external_chase';
  return current === 'cockpit' ? 'external_chase' : 'cockpit';
}

export function computeShuttlePropulsionProfile(params: {
  state: ShuttleInteractionState;
  phaseProgress: number;
  altitudeMeters: number;
  planet: HabitablePlanetId;
}): ShuttlePropulsionProfile {
  const { state, phaseProgress, altitudeMeters, planet } = params;

  if (state === 'takeoff') {
    const ignitionRamp = Math.min(1, phaseProgress / 0.14);
    const thrustIntensity = Math.min(1, 0.25 + ignitionRamp * 0.75);
    const rampExtended = Math.max(0, 1 - phaseProgress * 4.5);
    const gearExtended = phaseProgress < 0.32 ? 1 : Math.max(0, 1 - (phaseProgress - 0.32) * 3.0);
    const dustIntensity = phaseProgress < 0.45 ? (1 - phaseProgress / 0.45) * 0.95 : 0;
    return {
      thrustIntensity,
      dustIntensity,
      rcsActivity: phaseProgress > 0.6 ? 0.35 : 0.1,
      gearExtended,
      rampExtended,
      environment: planet
    };
  }

  if (state === 'space_travel') {
    return {
      thrustIntensity: 0.92,
      dustIntensity: 0, // Zero atmospheric smoke or ground dust in open space
      rcsActivity: 0.2,
      gearExtended: 0,
      rampExtended: 0,
      environment: 'space'
    };
  }

  if (state === 'approach') {
    return {
      thrustIntensity: Math.max(0.35, 0.75 - phaseProgress * 0.35),
      dustIntensity: 0, // Vacuum orbital insertion — zero atmospheric smoke
      rcsActivity: 0.85,
      gearExtended: 0,
      rampExtended: 0,
      environment: 'space'
    };
  }

  if (state === 'landing') {
    const gearExtended =
      phaseProgress < 0.18 ? 0 : Math.min(1, (phaseProgress - 0.18) / 0.42);
    const rampExtended = phaseProgress > 0.9 ? (phaseProgress - 0.9) / 0.1 : 0;
    // Touchdown completes at phaseProgress = 0.86; engines cut smoothly right at contact
    const thrustIntensity =
      phaseProgress < 0.82
        ? 0.88 - phaseProgress * 0.22
        : phaseProgress < 0.89
        ? Math.max(0, (0.89 - phaseProgress) / 0.07) * 0.65
        : 0;

    let dustIntensity = 0;
    if (altitudeMeters < 26 && phaseProgress < 0.95) {
      const altProximity = Math.max(0, 1 - altitudeMeters / 26);
      const settleTail =
        phaseProgress <= 0.86
          ? 1.0
          : Math.max(0, 1 - (phaseProgress - 0.86) / (planet === 'mars' ? 0.13 : 0.07));
      dustIntensity = altProximity * settleTail;
    }

    return {
      thrustIntensity,
      dustIntensity,
      rcsActivity: phaseProgress < 0.82 ? 0.45 : 0,
      gearExtended,
      rampExtended,
      environment: planet
    };
  }

  // Parked or disembarking
  return {
    thrustIntensity: 0,
    dustIntensity: 0,
    rcsActivity: 0,
    gearExtended: 1,
    rampExtended: state === 'seated_cockpit' || state === 'on_foot' || state === 'boarding' || state === 'disembark' ? 1 : 0,
    environment: planet
  };
}

