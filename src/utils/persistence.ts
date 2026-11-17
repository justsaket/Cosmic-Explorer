import { ExplorerProfile, GameSettings } from '../types';

const STORAGE_KEY_PROFILE = 'cosmic_explorer_profile_v1';
const STORAGE_KEY_SETTINGS = 'cosmic_explorer_settings_v1';

export const DEFAULT_SETTINGS: GameSettings = {
  graphics: {
    quality: 'high',
    shadows: true,
    antialias: true,
    particleCount: 1500,
    bloomEffect: true,
    reducedMotion: false
  },
  audio: {
    masterVolume: 0.85,
    sfxVolume: 0.78,
    ambienceVolume: 0.55,
    musicVolume: 0.55,
    narrationVolume: 0.92,
    muted: false,
    narrationMuted: false,
    narrationLanguage: 'en',
    narrationSpeed: 1.0
  },
  explorationMode: 'guided',
  showVirtualJoystick: true,
  virtualJoystickSensitivity: 1.0,
  enableCinematicLanding: true,
  detailedScienceMode: false,
  showControlsTutorial: true,
  firstTimeUser: true
};

export const DEFAULT_PROFILE: ExplorerProfile = {
  callsign: 'Team Xtream Lead Explorer',
  rank: 'NASA Space Apps Specialist',
  avatarUrl: undefined,
  visorMode: 'gold_mirror',
  cloakActive: false,
  totalPoints: 250,
  inventory: [],
  collectedSamples: [],
  scannedDiscoveryIds: [],
  savedFrontierQuestionIds: [],
  completedMissionIds: [],
  quizScores: {},
  metersTraveled: 0,
  jumpsPerformed: 0,
  lastVisitedPlanet: 'earth',
  createdAt: Date.now()
};

export function loadProfile(): ExplorerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (!raw) return { ...DEFAULT_PROFILE, createdAt: Date.now() };
    const parsed = JSON.parse(raw);
    const validModes = ['gold_mirror', 'clear_face', 'hud_display'];
    const resolvedVisor = validModes.includes(parsed.visorMode) ? parsed.visorMode : 'gold_mirror';
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      avatarUrl: undefined,
      callsign: parsed.callsign && !parsed.callsign.includes('Saket') && parsed.callsign !== 'Cadet Explorer' ? parsed.callsign : DEFAULT_PROFILE.callsign,
      visorMode: resolvedVisor,
      cloakActive: Boolean(parsed.cloakActive),
      inventory: Array.isArray(parsed.inventory) ? parsed.inventory : [],
      collectedSamples: Array.isArray(parsed.collectedSamples) ? parsed.collectedSamples : [],
      scannedDiscoveryIds: Array.isArray(parsed.scannedDiscoveryIds) ? parsed.scannedDiscoveryIds : [],
      savedFrontierQuestionIds: Array.isArray(parsed.savedFrontierQuestionIds) ? parsed.savedFrontierQuestionIds : [],
      completedMissionIds: Array.isArray(parsed.completedMissionIds) ? parsed.completedMissionIds : [],
      quizScores: typeof parsed.quizScores === 'object' && parsed.quizScores !== null ? parsed.quizScores : {}
    };
  } catch (err) {
    console.warn('Failed to parse saved explorer profile, using default:', err);
    return { ...DEFAULT_PROFILE, createdAt: Date.now() };
  }
}

export function saveProfile(profile: ExplorerProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save explorer profile:', err);
  }
}

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    const rawAudio = parsed.audio || {};
    const resolvedMusicVolume =
      typeof rawAudio.musicVolume === 'number'
        ? rawAudio.musicVolume
        : typeof rawAudio.ambienceVolume === 'number'
        ? rawAudio.ambienceVolume
        : DEFAULT_SETTINGS.audio.musicVolume;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      graphics: { ...DEFAULT_SETTINGS.graphics, ...(parsed.graphics || {}) },
      audio: {
        ...DEFAULT_SETTINGS.audio,
        ...rawAudio,
        musicVolume: resolvedMusicVolume,
        ambienceVolume: resolvedMusicVolume,
        narrationMuted: Boolean(rawAudio.narrationMuted)
      }
    };
  } catch (err) {
    console.warn('Failed to parse saved settings, using default:', err);
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

export function resetAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_PROFILE);
    localStorage.removeItem(STORAGE_KEY_SETTINGS);
  } catch (err) {
    console.error('Failed to clear storage:', err);
  }
}

export function calculateRank(points: number, discoveriesCount: number): ExplorerProfile['rank'] {
  if (points >= 1500 && discoveriesCount >= 10) return 'Chief Planetary Scientist';
  if (points >= 800 || discoveriesCount >= 6) return 'Mars Pioneer';
  if (points >= 300 || discoveriesCount >= 2) return 'Lunar Explorer';
  return 'Astronaut Trainee';
}
