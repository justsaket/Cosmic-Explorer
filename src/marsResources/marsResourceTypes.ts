import { QuizQuestion, ScientificDiscoverySource } from '../types';

export type MarsAndSpaceResourceId =
  | 'sojourner'
  | 'spirit_opportunity'
  | 'viking_1'
  | 'phoenix_insight'
  | 'curiosity'
  | 'dawn'
  | 'pioneer'
  | 'ingenuity'
  | 'kepler';

export type MarsSurfaceResourceId =
  | 'sojourner'
  | 'spirit_opportunity'
  | 'viking_1'
  | 'phoenix_insight'
  | 'curiosity'
  | 'ingenuity';

export type MarsWorldSiteId = MarsAndSpaceResourceId;

export type ResourceCategoryId = 'mars' | 'outer_solar_system' | 'deep_space';

export type MarsResourceStage =
  | 'briefing'
  | 'awaiting_shuttle'
  | 'time_transition'
  | 'interactive_3d_lab'
  | 'historical_sequence'
  | 'science_discoveries'
  | 'timeline_legacy'
  | 'quiz'
  | 'completed';

export interface SpaceHotspot {
  id: string;
  label: string;
  shortTitle: string;
  explanation: string;
  accuracyNote?: string;
}

export interface SpaceTimelineEvent {
  date: string;
  title: string;
  detail: string;
  timezoneNote?: string;
}

export interface MarsAndSpaceQuizQuestion extends QuizQuestion {
  resourceId: MarsAndSpaceResourceId;
}

export interface MarsAndSpaceResourceConfig {
  id: MarsAndSpaceResourceId;
  category: ResourceCategoryId;
  categoryLabel: string;
  missionEnvironment: 'mars_surface' | 'mars_orbit_and_surface' | 'deep_space_orbit' | 'deep_space_flyby' | 'heliocentric_observatory';
  isStationaryLanderOnly?: boolean;
  isOrbiterOrFlybyOnly?: boolean;
  neverLandsNote?: string;
  resourceNumber: string; // e.g. "Resource 01"
  shortTitle: string;
  fullTitle: string;
  subtitle: string;
  eraBadge: string;
  transitionHeading: string;
  transitionSubheading: string;
  timeTravelDisclaimer: string;
  accentColor: string;
  badgeTitle: string;
  secondaryBadgeTitle?: string;
  briefingSummary: string[];
  missionObjectives: string[];
  teamAndProgram: { name: string; role: string }[];
  keySpecs: { label: string; value: string }[];
  hotspots: SpaceHotspot[];
  timeline: SpaceTimelineEvent[];
  legacyChain?: string[];
  narrationEn: Record<string, string>;
  narrationHi: Record<string, string>;
  learningSummary: string[];
  requiredLabActionLabel: string;
  sources: ScientificDiscoverySource[];
}

export interface MarsSurfaceSiteSpec {
  id: MarsAndSpaceResourceId;
  x: number;
  z: number;
  approachOffset: [number, number];
  interactionRadius: number;
  clearRadius: number;
  year: string;
  statusBadge:
    | 'ROVER & LANDER'
    | 'TWIN ROVERS'
    | 'ORBITER + LANDER'
    | 'TWIN LANDERS'
    | 'NUCLEAR ROVER'
    | 'ROVER + HELICOPTER'
    | 'SKY EXHIBIT • ORBITER'
    | 'SKY EXHIBIT • FLYBY'
    | 'SKY EXHIBIT • TELESCOPE';
  shortTitle: string;
  regionLabel: string;
  accentColor: string;
  markerHeight: number;
  isSkyExhibit?: boolean;
  hoverAltitudeMeters?: number;
}

export interface MarsChronologicalEvent {
  id: string;
  resourceId: MarsAndSpaceResourceId;
  subFocus?: 'spirit' | 'opportunity' | 'phoenix' | 'insight';
  year: string;
  dateLabel: string;
  statusBadge: string;
  title: string;
  regionLabel: string;
  summary: string;
  coordinates: [number, number];
  accentColor: string;
}

export interface SojournerRockTarget {
  id: 'barnacle_bill' | 'yogi' | 'scooby_doo';
  name: string;
  worldOffset: [number, number];
  nickNote: string;
  physicalSummary: string;
  apxsFindings: string;
  spectrumPeaks: { element: string; symbol: string; relativeIntensity: number; note: string }[];
}

export interface MerRoverProfile {
  id: 'spirit' | 'opportunity';
  name: string;
  launchDate: string;
  landingDateLabel: string;
  landingSite: string;
  plannedSolLife: number;
  distanceKm: number;
  distanceNote: string;
  keyLandmarks: string[];
  keyDiscoveries: string[];
  finalCommDate: string;
  missionEndDate: string;
  endCause: string;
}

export interface IngenuityPhaseSummary {
  id: 'tech_demo' | 'operations' | 'engineering';
  title: string;
  flightRange: string;
  summary: string;
}
