import { QuizQuestion, ScientificDiscoverySource } from '../types';

export type MoonResourceId =
  | 'apollo_lm'
  | 'lunar_rover'
  | 'alsep'
  | 'surveyor';

export type MoonResourceStage =
  | 'earth_briefing'
  | 'awaiting_shuttle'
  | 'time_transition'
  | 'interactive_3d_lab'
  | 'historical_sequence'
  | 'surface_exploration'
  | 'comparison_and_timeline'
  | 'quiz'
  | 'completed';

export interface MoonResourceHotspot {
  id: string;
  label: string;
  stageTag?: 'descent' | 'ascent' | 'easep' | 'lrv' | 'alsep' | 'surveyor';
  worldOffset: [number, number, number];
  shortTitle: string;
  explanation: string;
  accuracyNote?: string;
}

export interface MoonTimelineEvent {
  date: string;
  title: string;
  detail: string;
  timezoneNote?: string;
}

export interface MoonQuizQuestion extends QuizQuestion {
  resourceId: MoonResourceId;
}

export interface MoonResourceConfig {
  id: MoonResourceId;
  resourceNumber: string; // "Moon Resource 01"
  shortTitle: string;
  fullTitle: string;
  subtitle: string;
  eraBadge: string;
  transitionYearHeading: string;
  transitionMissionHeading: string;
  accentColor: string;
  referenceImage: string;
  referenceCaption: string;
  earthBriefingIntro: string[];
  crew: { name: string; role: string; spacecraft: string }[];
  spacecraftPair?: { name: string; role: string }[];
  timeline: MoonTimelineEvent[];
  hotspots: MoonResourceHotspot[];
  narrationScripts: Record<string, string>;
  learningSummary: string[];
  sources: ScientificDiscoverySource[];
}

export interface LrvMissionProfile {
  missionId: 'apollo_15' | 'apollo_16' | 'apollo_17';
  title: string;
  yearLabel: string;
  launchDate: string;
  landingDate: string;
  landingRegion: string;
  lunarModuleName: string;
  drivers: [string, string];
  cmp: string;
  approxDistanceKm: number;
  maxSpeedKmh: number;
  walkbackLimitMeters: number;
  evaSummary: string;
  samplesWeightLabel?: string;
  excursions: {
    id: string;
    name: string;
    date: string;
    approxKm: number;
    landmarks: string[];
    description: string;
    waypoints: { id: string; label: string; x: number; z: number; sampleName: string; significance: string }[];
  }[];
  referenceImage?: string;
}

export interface AlsepInstrumentSpec {
  id: 'pse' | 'lsm' | 'sws' | 'side' | 'ccig' | 'ldd';
  code: string;
  name: string;
  purpose: string;
  plainExplanation: string;
  simulationTitle: string;
  unitLabel: string;
  offsetFromCentral: [number, number];
}

export interface AlsepStationSummary {
  mission: string;
  year: number;
  landingRegion: string;
  deploymentDate: string;
  coordinatesLabel: string;
  mapPercent: [number, number]; // [x%, y%] on simplified near-side Moon map
  instruments: string[];
  objectives: string;
  hasRetroreflectorNote: string;
}

export interface SurveyorProgramEntry {
  mission: string;
  launchDate: string;
  outcome: 'Successful Soft Landing' | 'Mission Failed (Crashed)' | 'Contact Lost Prior to Landing';
  isSuccess: boolean;
  location: string;
  objective: string;
  contribution: string;
}

export interface LrvPhysicsState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vz: number;
  headingRad: number;
  steerAngleRad: number;
  wheelSpinRad: number;
  speedMps: number;
  distanceMeters: number;
  batteryPercent: number;
  isBraking: boolean;
}

export interface MoonResourceSiteSpec {
  id: MoonResourceId;
  x: number;
  z: number;
  approachOffset: [number, number];
  interactionRadius: number;
  clearRadius: number;
  year: string;
  statusBadge: 'LANDED ON MOON' | 'DEPLOYED ON MOON';
  shortTitle: string;
  subtitle: string;
  accentColor: string;
  markerHeight: number;
}

export interface MoonChronologicalEvent {
  id: string;
  resourceId: MoonResourceId;
  lrvMissionId?: 'apollo_15' | 'apollo_16' | 'apollo_17';
  year: string;
  dateLabel: string;
  statusBadge: 'LANDED ON MOON' | 'DEPLOYED ON MOON';
  title: string;
  regionLabel: string;
  summary: string;
  coordinates: [number, number];
  accentColor: string;
}

