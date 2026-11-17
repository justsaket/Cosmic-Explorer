export type PlanetId =
  | 'sun'
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'moon'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune';

export type ViewMode = 'universe' | 'approach' | 'surface';

export type DiscoveryCategory = 'geology' | 'exploration' | 'atmosphere' | 'technology' | 'astrobiology';

export interface CelestialBodyConfig {
  id: PlanetId;
  name: string;
  subtitle: string;
  diameterKm: number;
  gravityMss: number; // m/s^2 (Earth: 9.81, Moon: 1.62, Mars: 3.71)
  atmosphere: string;
  dayLengthHours: number;
  avgTempCelsius: number;
  distanceFromSunMillionKm: number;
  radiusScene: number;
  orbitRadius: number;
  orbitSpeed: number;
  rotationSpeed: number;
  baseColor: string;
  description: string;
  quickFacts: string[];
  scientificSignificance: string;
  planetOrder?: number;
  isGasGiant?: boolean;
  moonCount?: number;
  kidComparison?: string;
  probeHighlight?: string;
}

export interface ScientificDiscoverySource {
  title: string;
  publisher: string;
  url: string;
  missionOrProgram: string;
}

export interface NasaSatellite {
  id: string;
  name: string;
  shortName: string;
  orbitTarget: 'earth' | 'moon' | 'mars' | 'deep_space' | 'sun';
  orbitRadius: number;
  orbitSpeed: number;
  orbitInclination?: number;
  launchDate: string;
  launchVehicle: string;
  altitudeKm: string;
  velocityKmS: string;
  missionType: string;
  status: 'ACTIVE' | 'EXTENDED' | 'HISTORIC' | 'INTERSTELLAR';
  summary: string;
  storyNarrative: string;
  instruments: string[];
}

export interface ScientificDiscovery {
  id: string;
  name: string;
  planetId: 'earth' | 'moon' | 'mars';
  category: DiscoveryCategory;
  coordinates: [number, number, number];
  headline: string;
  whatIsIt: string;
  howItWorks: string;
  whatScientistsLearned: string;
  whyItMatters: string;
  simpleExplanation: string;
  detailedExplanation: string;
  audioTranscriptEn: string;
  audioTranscriptHi?: string;
  sources: ScientificDiscoverySource[];
  modelType: 
    | 'apollo_descent'
    | 'laser_reflector'
    | 'lunar_regolith'
    | 'crater_rim'
    | 'water_ice_depot'
    | 'lunar_seismometer'
    | 'perseverance_rover'
    | 'jezero_delta'
    | 'sedimentary_strata'
    | 'methane_detector'
    | 'mars_sample_tube'
    | 'ancient_riverbed'
    | 'dust_devil_sensor'
    | 'lava_tube_skylight'
    | 'orange_soil'
    | 'martian_meteorite'
    | 'launch_complex'
    | 'flight_ops'
    | 'dsn_array'
    | 'gravity_station';
  rarity: 'Common' | 'Rare' | 'Pivotal';
}

export type ExplorationMode = 'guided' | 'free' | 'challenge';

export interface FieldSample {
  id: string;
  name: string;
  planetId: 'earth' | 'moon' | 'mars';
  locationName: string;
  coordinates: [number, number, number];
  collectedAt: number;
  composition: string;
  scientificGoal: string;
}

export type FrontierPillar = 'what_we_know' | 'what_we_are_investigating' | 'future_discoveries';

export interface UnknownFrontierTopic {
  id: string;
  planetId: 'moon' | 'mars';
  pillar: FrontierPillar;
  title: string;
  question: string;
  summary: string;
  currentEvidence: string;
  unansweredMystery: string;
  nextGenerationMission: string;
  tags: string[];
}

export interface InventoryItem {
  discoveryId: string;
  discoveryName: string;
  planetId: 'earth' | 'moon' | 'mars';
  category: DiscoveryCategory;
  collectedAt: number;
  rarity: 'Common' | 'Rare' | 'Pivotal';
}

export interface MissionObjective {
  id: string;
  description: string;
  type: 'inspect_discovery' | 'collect_discoveries' | 'travel_distance' | 'perform_jump' | 'complete_quiz';
  targetDiscoveryId?: string;
  targetCount: number;
  currentCount: number;
  completed: boolean;
}

export interface Mission {
  id: string;
  title: string;
  destination: 'earth' | 'moon' | 'mars' | 'any';
  level: 'Cadet' | 'Specialist' | 'Commander';
  briefing: string;
  learningGoal: string;
  objectives: MissionObjective[];
  rewardPoints: number;
  badgeName: string;
  completed: boolean;
}

export interface QuizQuestion {
  id: string;
  discoveryId: string;
  planetId: 'earth' | 'moon' | 'mars';
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  funFact: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GraphicsSettings {
  quality: 'low' | 'balanced' | 'high';
  shadows: boolean;
  antialias: boolean;
  particleCount: number;
  bloomEffect: boolean;
  reducedMotion: boolean;
}

export interface AudioSettings {
  masterVolume: number;
  sfxVolume: number;
  ambienceVolume: number;
  musicVolume: number;
  narrationVolume: number;
  muted: boolean;
  narrationMuted: boolean;
  narrationLanguage: 'en';
  narrationSpeed: number;
  selectedVoiceName?: string;
}

export interface ExplorerProfile {
  callsign: string;
  rank: 'Astronaut Trainee' | 'Lunar Explorer' | 'Mars Pioneer' | 'Chief Planetary Scientist' | 'NASA Space Apps Specialist';
  avatarUrl?: string;
  visorMode: 'gold_mirror' | 'hud_display' | 'clear_face';
  cloakActive: boolean;
  totalPoints: number;
  inventory: InventoryItem[];
  collectedSamples: FieldSample[];
  scannedDiscoveryIds: string[];
  savedFrontierQuestionIds: string[];
  completedMissionIds: string[];
  quizScores: Record<string, number>; // quizId -> score percentage
  metersTraveled: number;
  jumpsPerformed: number;
  lastVisitedPlanet: PlanetId;
  createdAt: number;
}

export interface GameSettings {
  graphics: GraphicsSettings;
  audio: AudioSettings;
  explorationMode: ExplorationMode;
  showVirtualJoystick: boolean;
  virtualJoystickSensitivity: number;
  enableCinematicLanding: boolean;
  detailedScienceMode: boolean;
  showControlsTutorial: boolean;
  firstTimeUser: boolean;
}

