import { HabitablePlanetId, ShuttleCameraView, ShuttleInteractionState } from '../shuttle/shuttleTravelState';

export interface AudioMixConfig {
  masterVolume: number; // 0..1
  sfxVolume: number; // 0..1
  musicVolume: number; // 0..1 (Background Music & Space/Planet Ambience)
  narrationVolume: number; // 0..1 (Female Storyteller Voice)
  muted: boolean; // Global master mute
  narrationMuted: boolean; // Storyteller voice-only mute (HUD captions stay active)
  duckingActive: boolean; // True while storyteller is speaking
}

export interface ResolvedAudioGains {
  masterGain: number;
  sfxGain: number;
  flightBusGain: number;
  musicBusGain: number;
  narrationGain: number;
}

export interface ShuttleAudioInput {
  state: ShuttleInteractionState;
  phaseProgress: number; // 0..1
  altitudeMeters: number;
  velocityKms: number;
  planet: HabitablePlanetId;
  cameraView: ShuttleCameraView;
  rcsActivity: number; // 0..1
}

export interface ShuttleFlightAudioTarget {
  isActive: boolean;
  isAirless: boolean;
  isCockpit: boolean;
  mainRoarGain: number; // Low-mid turbine & exhaust roar
  subBassFreqHz: number; // Core propulsion fundamental frequency
  lowpassCutoffHz: number; // Acoustic filter cutoff (muffled in cockpit, open externally)
  cabinHumGain: number; // Cockpit environmental console & hull vibration hum
  windHissGain: number; // Atmospheric rush (Earth strong, Mars thin CO2, Moon strictly 0)
  spacePadGain: number; // Deep-space harmonic music pad swell during cruise/approach
  rcsBurstLevel: number; // Vernier thruster hiss target
}

function clamp01(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

/**
 * Pure audio gain mixer calculation enforcing:
 * - Independent Master, SFX, Music/Ambience, and Storyteller Narration sliders
 * - Smooth automatic audio ducking on spacecraft SFX & music while storyteller speaks
 * - Narration-only mute without muting spacecraft SFX/music
 */
export function resolveAudioGains(config: AudioMixConfig): ResolvedAudioGains {
  const master = config.muted ? 0 : clamp01(config.masterVolume);
  const sfx = clamp01(config.sfxVolume);
  const music = clamp01(config.musicVolume);
  const narration = config.muted || config.narrationMuted ? 0 : clamp01(config.narrationVolume);

  // Ducking lowers flight engine roar & background music gently so storyteller shines through clearly
  const flightDuck = config.duckingActive ? 0.38 : 1.0;
  const musicDuck = config.duckingActive ? 0.30 : 1.0;

  return {
    masterGain: master,
    sfxGain: sfx,
    flightBusGain: sfx * flightDuck,
    musicBusGain: music * musicDuck,
    narrationGain: master * narration
  };
}

/**
 * Continuous real-time spacecraft flight acoustic synthesizer profile.
 * Smoothly shifts timbre when switching between Camera A (Cockpit) and Camera B (External)
 * WITHOUT interrupting playback, and models planet-specific atmospheres (vacuum vs thin Mars vs Earth).
 */
export function computeShuttleFlightAudioTarget(
  input: ShuttleAudioInput
): ShuttleFlightAudioTarget {
  const p = clamp01(input.phaseProgress);
  const isCockpit = input.cameraView === 'cockpit';
  const altFactor = Math.max(0, 1 - input.altitudeMeters / 95);

  // Moon surface/vicinity is airless vacuum; space_travel & approach are also vacuum
  const isSpacePhase = input.state === 'space_travel' || input.state === 'approach';
  const isAirless = isSpacePhase || input.planet === 'moon';

  if (input.state === 'on_foot' || input.state === 'boarding' || input.state === 'disembark') {
    return {
      isActive: false,
      isAirless: input.planet === 'moon',
      isCockpit,
      mainRoarGain: 0,
      subBassFreqHz: 46,
      lowpassCutoffHz: isCockpit ? 360 : 900,
      cabinHumGain: 0,
      windHissGain: 0,
      spacePadGain: 0,
      rcsBurstLevel: 0
    };
  }

  if (input.state === 'seated_cockpit') {
    // Parked flight deck idle: soft avionics hum inside cockpit, faint standby vent outside
    return {
      isActive: true,
      isAirless: input.planet === 'moon',
      isCockpit,
      mainRoarGain: isCockpit ? 0.03 : 0.04,
      subBassFreqHz: 48,
      lowpassCutoffHz: isCockpit ? 310 : 720,
      cabinHumGain: isCockpit ? 0.16 : 0.05,
      windHissGain: input.planet === 'earth' ? (isCockpit ? 0.02 : 0.09) : input.planet === 'mars' ? (isCockpit ? 0.01 : 0.05) : 0,
      spacePadGain: 0.04,
      rcsBurstLevel: 0
    };
  }

  if (input.state === 'takeoff') {
    const ignitionRamp = Math.min(1, p / 0.18);
    const roarBase = (0.34 + 0.56 * ignitionRamp) * (isCockpit ? 0.56 : 1.0);
    const atmosScale = input.planet === 'earth' ? 1.0 : input.planet === 'mars' ? 0.42 : 0;

    return {
      isActive: true,
      isAirless,
      isCockpit,
      mainRoarGain: roarBase,
      subBassFreqHz: 52 + ignitionRamp * 28,
      lowpassCutoffHz: isCockpit ? 380 + ignitionRamp * 120 : 1450 + ignitionRamp * 950,
      cabinHumGain: isCockpit ? 0.24 : 0.06,
      windHissGain: atmosScale * altFactor * (isCockpit ? 0.14 : 0.48),
      spacePadGain: 0.08 + p * 0.18,
      rcsBurstLevel: clamp01(input.rcsActivity) * (isCockpit ? 0.14 : 0.28)
    };
  }

  if (input.state === 'space_travel') {
    // Deep-space orbital glide: steady low interior hull resonance + soaring cosmic pad
    const engineTaper = 0.28 + Math.sin(p * Math.PI) * 0.18;
    return {
      isActive: true,
      isAirless: true,
      isCockpit,
      mainRoarGain: engineTaper * (isCockpit ? 0.52 : 0.78),
      subBassFreqHz: 44 + Math.sin(p * Math.PI) * 10,
      lowpassCutoffHz: isCockpit ? 290 : 1050,
      cabinHumGain: isCockpit ? 0.22 : 0.08,
      windHissGain: 0, // Vacuum of space has zero external aerodynamic wind
      spacePadGain: 0.34 + Math.sin(p * Math.PI) * 0.16,
      rcsBurstLevel: clamp01(input.rcsActivity) * (isCockpit ? 0.12 : 0.24)
    };
  }

  if (input.state === 'approach') {
    // Orbital capture braking & vernier pulses
    const brakeIntensity = 0.36 + p * 0.36;
    const enteringAtmos = p > 0.65 && input.planet !== 'moon';
    const atmosDensity = input.planet === 'earth' ? 0.35 : input.planet === 'mars' ? 0.14 : 0;

    return {
      isActive: true,
      isAirless: !enteringAtmos,
      isCockpit,
      mainRoarGain: brakeIntensity * (isCockpit ? 0.58 : 0.88),
      subBassFreqHz: 50 + p * 16,
      lowpassCutoffHz: isCockpit ? 340 : 1280,
      cabinHumGain: isCockpit ? 0.24 : 0.08,
      windHissGain: enteringAtmos ? atmosDensity * ((p - 0.65) / 0.35) * (isCockpit ? 0.14 : 0.36) : 0,
      spacePadGain: 0.38 - p * 0.12,
      rcsBurstLevel: clamp01(input.rcsActivity) * (isCockpit ? 0.2 : 0.36)
    };
  }

  // 'landing' phase: retro-burn up until touchdown (0.86), then clean spool-down to idle
  const settled = p >= 0.86;
  const spoolDecay = settled ? Math.max(0, 1 - (p - 0.86) / 0.14) : 1;
  const descentThrottle = settled ? spoolDecay * 0.22 : 0.45 + 0.42 * (1 - p / 0.86);
  const atmosScale = input.planet === 'earth' ? 0.72 : input.planet === 'mars' ? 0.32 : 0;

  return {
    isActive: true,
    isAirless: input.planet === 'moon',
    isCockpit,
    mainRoarGain: descentThrottle * (isCockpit ? 0.55 : 0.94),
    subBassFreqHz: 46 + (1 - p) * 20,
    lowpassCutoffHz: isCockpit ? 350 : 1380,
    cabinHumGain: isCockpit ? 0.22 : 0.07,
    windHissGain: settled ? atmosScale * 0.06 : atmosScale * altFactor * (isCockpit ? 0.14 : 0.42),
    spacePadGain: 0.14 * (1 - p),
    rcsBurstLevel: settled ? 0 : clamp01(input.rcsActivity) * (isCockpit ? 0.18 : 0.34)
  };
}
