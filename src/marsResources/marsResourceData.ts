import {
  IngenuityPhaseSummary,
  MarsAndSpaceResourceConfig,
  MarsAndSpaceResourceId,
  MarsChronologicalEvent,
  MarsSurfaceResourceId,
  MarsSurfaceSiteSpec,
  MerRoverProfile,
  ResourceCategoryId,
  SojournerRockTarget
} from './marsResourceTypes';
import { SHUTTLE_PADS } from '../shuttle/shuttleTravelState';

export const RESOURCE_CATEGORIES: {
  id: ResourceCategoryId;
  title: string;
  subtitle: string;
  badgeColor: string;
  resourceIds: MarsAndSpaceResourceId[];
}[] = [
  {
    id: 'mars',
    title: 'Mars Exploration',
    subtitle: 'Surface rovers, stationary landers, orbiter+lander pairs & powered Mars flight (1976–Present)',
    badgeColor: '#f97316',
    resourceIds: ['sojourner', 'spirit_opportunity', 'viking_1', 'phoenix_insight', 'curiosity', 'ingenuity']
  },
  {
    id: 'outer_solar_system',
    title: 'Outer Solar System Exploration — Beyond Mars',
    subtitle: 'Main-belt asteroid & dwarf planet orbiters and pioneer flybys beyond Mars',
    badgeColor: '#38bdf8',
    resourceIds: ['dawn', 'pioneer']
  },
  {
    id: 'deep_space',
    title: 'Deep Space Astronomy & Exoplanet Exploration',
    subtitle: 'Heliocentric transit photometry discovering worlds orbiting distant stars',
    badgeColor: '#a855f7',
    resourceIds: ['kepler']
  }
];

/**
 * Spatial placement of the 6 historical Mars surface zones on MarsWorld.
 * All 6 Mars zones are >= 29 m from SHUTTLE_PADS.mars and >= 34 m from each other.
 */
export const MARS_SURFACE_SITES: Record<MarsSurfaceResourceId, MarsSurfaceSiteSpec> = {
  viking_1: {
    id: 'viking_1',
    x: -24,
    z: -18,
    approachOffset: [4.5, 6.8],
    interactionRadius: 8.5,
    clearRadius: 10.5,
    year: '1976',
    statusBadge: 'ORBITER + LANDER',
    shortTitle: 'Viking 1 — Chryse Planitia (1976)',
    regionLabel: 'Chryse Planitia (22.483° N, 47.94° W)',
    accentColor: '#eab308',
    markerHeight: 4.5
  },
  sojourner: {
    id: 'sojourner',
    x: 24,
    z: 22,
    approachOffset: [-4.5, 6.2],
    interactionRadius: 8.5,
    clearRadius: 10.5,
    year: '1997',
    statusBadge: 'ROVER & LANDER',
    shortTitle: 'Pathfinder & Sojourner — Ares Vallis (1997)',
    regionLabel: 'Ares Vallis Outflow Channel',
    accentColor: '#f97316',
    markerHeight: 3.8
  },
  spirit_opportunity: {
    id: 'spirit_opportunity',
    x: -29,
    z: 23,
    approachOffset: [6.0, 6.0],
    interactionRadius: 10.0,
    clearRadius: 12.5,
    year: '2004',
    statusBadge: 'TWIN ROVERS',
    shortTitle: 'Spirit & Opportunity — Twin Rovers (2004)',
    regionLabel: 'Gusev Crater & Meridiani Planum',
    accentColor: '#38bdf8',
    markerHeight: 4.0
  },
  phoenix_insight: {
    id: 'phoenix_insight',
    x: 8,
    z: -38,
    approachOffset: [0, 7.5],
    interactionRadius: 10.5,
    clearRadius: 12.5,
    year: '2008 / 2018',
    statusBadge: 'TWIN LANDERS',
    shortTitle: 'Phoenix (2008) & InSight (2018)',
    regionLabel: 'Vastitas Borealis & Elysium Planitia',
    accentColor: '#22d3ee',
    markerHeight: 4.2
  },
  curiosity: {
    id: 'curiosity',
    x: 0,
    z: 48,
    approachOffset: [-4.5, -7.2],
    interactionRadius: 9.5,
    clearRadius: 11.5,
    year: '2012–Present',
    statusBadge: 'NUCLEAR ROVER',
    shortTitle: 'Curiosity — Gale Crater & Mount Sharp',
    regionLabel: 'Gale Crater (4.59° S, 137.44° E)',
    accentColor: '#f59e0b',
    markerHeight: 4.3
  },
  ingenuity: {
    id: 'ingenuity',
    x: 42,
    z: -16,
    approachOffset: [-6.0, 6.0],
    interactionRadius: 9.0,
    clearRadius: 11.0,
    year: '2021–2024',
    statusBadge: 'ROVER + HELICOPTER',
    shortTitle: 'Ingenuity & Perseverance — Jezero Crater',
    regionLabel: 'Wright Brothers Field, Jezero Crater',
    accentColor: '#10b981',
    markerHeight: 4.5
  }
};

/**
 * 3 Elevated Holographic Sky-Projection Stations on Mars Perimeter for Deep-Space / Outer Solar System Craft.
 * These spacecraft NEVER landed on Mars; their 3D models float cleanly in the sky (y + 6.8..7.6m)
 * above interactive holographic ground pedestals so explorers can walk up, inspect, and hear their story.
 */
export const MARS_SKY_EXHIBITS: Record<'dawn' | 'pioneer' | 'kepler', MarsSurfaceSiteSpec> = {
  dawn: {
    id: 'dawn',
    x: -52,
    z: -2,
    approachOffset: [11.5, 2.8],
    interactionRadius: 13.5,
    clearRadius: 12.0,
    year: '2007–2018',
    statusBadge: 'SKY EXHIBIT • ORBITER',
    shortTitle: 'Dawn — Vesta & Ceres Ion Orbiter',
    regionLabel: 'Asteroid Belt Projection (Never Landed on Mars)',
    accentColor: '#38bdf8',
    markerHeight: 3.4,
    isSkyExhibit: true,
    hoverAltitudeMeters: 4.5
  },
  pioneer: {
    id: 'pioneer',
    x: 42,
    z: 44,
    approachOffset: [-9.8, -6.5],
    interactionRadius: 13.5,
    clearRadius: 12.0,
    year: '1972–2003',
    statusBadge: 'SKY EXHIBIT • FLYBY',
    shortTitle: 'Pioneer 10 & 11 — Outer Giants Scouts',
    regionLabel: 'Jupiter / Saturn Trajectory Projection (Flyby Only)',
    accentColor: '#fbbf24',
    markerHeight: 3.4,
    isSkyExhibit: true,
    hoverAltitudeMeters: 4.8
  },
  kepler: {
    id: 'kepler',
    x: 40,
    z: -48,
    approachOffset: [-8.8, 8.0],
    interactionRadius: 13.5,
    clearRadius: 12.0,
    year: '2009–2018',
    statusBadge: 'SKY EXHIBIT • TELESCOPE',
    shortTitle: 'Kepler — Deep Space Exoplanet Hunter',
    regionLabel: 'Heliocentric Orbit Projection (Sun-Orbiting Telescope)',
    accentColor: '#a855f7',
    markerHeight: 3.4,
    isSkyExhibit: true,
    hoverAltitudeMeters: 3.4
  }
};

export const MARS_ALL_SITES: Record<MarsAndSpaceResourceId, MarsSurfaceSiteSpec> = {
  ...MARS_SURFACE_SITES,
  ...MARS_SKY_EXHIBITS
};

export const MARS_CHRONOLOGICAL_TIMELINE: MarsChronologicalEvent[] = [
  {
    id: 'mars_1972_pioneer',
    resourceId: 'pioneer',
    year: '1972',
    dateLabel: 'Mar 2, 1972 & Sep 1, 1979',
    statusBadge: 'SKY EXHIBIT • FLYBY',
    title: 'Pioneer 10 & 11 — Jupiter & First Saturn Flyby',
    regionLabel: 'Deep Space Sky Projection (Outer Giants)',
    summary:
      'First scouts across the Asteroid Belt to Jupiter and Saturn; spin-stabilized spacecraft suspended overhead.',
    coordinates: [MARS_SKY_EXHIBITS.pioneer.x, MARS_SKY_EXHIBITS.pioneer.z],
    accentColor: '#fbbf24'
  },
  {
    id: 'mars_1976_viking',
    resourceId: 'viking_1',
    year: '1976',
    dateLabel: 'July 20, 1976',
    statusBadge: 'ORBITER + LANDER',
    title: 'Viking 1 — First U.S. Mars Surface Ops + Orbiter',
    regionLabel: 'Chryse Planitia + Overhead Mars Orbiter',
    summary:
      'Stationary nuclear lander captured first clear surface photos while Viking Orbiter mapped Mars from the sky above.',
    coordinates: [MARS_SURFACE_SITES.viking_1.x, MARS_SURFACE_SITES.viking_1.z],
    accentColor: '#eab308'
  },
  {
    id: 'mars_1997_sojourner',
    resourceId: 'sojourner',
    year: '1997',
    dateLabel: 'July 4, 1997',
    statusBadge: 'ROVER & LANDER',
    title: 'Mars Pathfinder & Sojourner Rover',
    regionLabel: 'Ares Vallis',
    summary:
      'Airbag-cushioned lander deployed Sojourner, humanity’s first wheeled rover to operate on Mars (83 days).',
    coordinates: [MARS_SURFACE_SITES.sojourner.x, MARS_SURFACE_SITES.sojourner.z],
    accentColor: '#f97316'
  },
  {
    id: 'mars_2004_spirit_opp',
    resourceId: 'spirit_opportunity',
    subFocus: 'opportunity',
    year: '2004',
    dateLabel: 'Jan 3/4 & Jan 24/25, 2004',
    statusBadge: 'TWIN ROVERS',
    title: 'Spirit (Gusev) & Opportunity (Meridiani)',
    regionLabel: 'Gusev Crater & Meridiani Planum',
    summary:
      'Twin 185 kg rovers designed for 90 sols operated for years, proving ancient liquid water altered Martian rocks.',
    coordinates: [MARS_SURFACE_SITES.spirit_opportunity.x, MARS_SURFACE_SITES.spirit_opportunity.z],
    accentColor: '#38bdf8'
  },
  {
    id: 'mars_2007_dawn',
    resourceId: 'dawn',
    year: '2007',
    dateLabel: 'Sep 27, 2007 – Nov 2018',
    statusBadge: 'SKY EXHIBIT • ORBITER',
    title: 'Dawn — Ion Orbiter at Vesta & Ceres',
    regionLabel: 'Deep Space Sky Projection (Asteroid Belt)',
    summary:
      'Xenon ion probe that orbited both giant protoplanet Vesta and icy dwarf planet Ceres.',
    coordinates: [MARS_SKY_EXHIBITS.dawn.x, MARS_SKY_EXHIBITS.dawn.z],
    accentColor: '#38bdf8'
  },
  {
    id: 'mars_2008_phoenix',
    resourceId: 'phoenix_insight',
    subFocus: 'phoenix',
    year: '2008',
    dateLabel: 'May 25, 2008',
    statusBadge: 'STATIONARY LANDER',
    title: 'Phoenix — Northern Arctic Ice Trenching',
    regionLabel: 'Vastitas Borealis (~68.22° N)',
    summary:
      'Stationary arctic lander dug Dodo-Goldilocks trench, observed ice sublimation, and verified shallow water ice.',
    coordinates: [MARS_SURFACE_SITES.phoenix_insight.x - 4, MARS_SURFACE_SITES.phoenix_insight.z],
    accentColor: '#22d3ee'
  },
  {
    id: 'mars_2009_kepler',
    resourceId: 'kepler',
    year: '2009',
    dateLabel: 'Mar 6, 2009 – Oct 30, 2018',
    statusBadge: 'SKY EXHIBIT • TELESCOPE',
    title: 'Kepler — 2,600+ Confirmed Exoplanets',
    regionLabel: 'Deep Space Sky Projection (Heliocentric)',
    summary:
      'Stared at >150,000 stars via transit photometry to prove rocky worlds outnumber stars in our galaxy.',
    coordinates: [MARS_SKY_EXHIBITS.kepler.x, MARS_SKY_EXHIBITS.kepler.z],
    accentColor: '#a855f7'
  },
  {
    id: 'mars_2012_curiosity',
    resourceId: 'curiosity',
    year: '2012',
    dateLabel: 'August 5/6, 2012 – Present',
    statusBadge: 'NUCLEAR ROVER',
    title: 'Curiosity (MSL) — Gale Crater & Mount Sharp',
    regionLabel: 'Gale Crater (4.59° S, 137.44° E)',
    summary:
      'SUV-sized Sky-Crane landed rover carrying ChemCam laser & SAM chemistry lab; proved ancient Gale Crater lakes were habitable.',
    coordinates: [MARS_SURFACE_SITES.curiosity.x, MARS_SURFACE_SITES.curiosity.z],
    accentColor: '#f59e0b'
  },
  {
    id: 'mars_2018_insight',
    resourceId: 'phoenix_insight',
    subFocus: 'insight',
    year: '2018',
    dateLabel: 'Nov 26, 2018',
    statusBadge: 'STATIONARY LANDER',
    title: 'InSight — 1,319 Marsquakes & Deep Interior',
    regionLabel: 'Elysium Planitia (~4.5° N)',
    summary:
      'Deployed SEIS seismometer onto Mars, detecting 1,319 marsquakes and mapping Mars’s crust, mantle, and molten core.',
    coordinates: [MARS_SURFACE_SITES.phoenix_insight.x + 4, MARS_SURFACE_SITES.phoenix_insight.z],
    accentColor: '#f43f5e'
  },
  {
    id: 'mars_2021_ingenuity',
    resourceId: 'ingenuity',
    year: '2021',
    dateLabel: 'Apr 19, 2021 (First Flight)',
    statusBadge: '72 FLIGHTS',
    title: 'Ingenuity Helicopter & Perseverance',
    regionLabel: 'Wright Brothers Field, Jezero Crater',
    summary:
      'Coaxial helicopter hovering overhead after 72 historic flights in <1% Earth atmospheric density beside Perseverance.',
    coordinates: [MARS_SURFACE_SITES.ingenuity.x, MARS_SURFACE_SITES.ingenuity.z],
    accentColor: '#10b981'
  }
];

export function getMarsSiteCoordinates(id: MarsAndSpaceResourceId): {
  x: number;
  z: number;
  yaw: number;
} {
  const site = MARS_ALL_SITES[id];
  const ax = site.x + site.approachOffset[0];
  const az = site.z + site.approachOffset[1];
  const yaw = Math.atan2(site.x - ax, site.z - az);
  return { x: ax, z: az, yaw };
}

export function getMarsShuttlePadDistance(id: MarsAndSpaceResourceId): number {
  const site = MARS_ALL_SITES[id];
  const pad = SHUTTLE_PADS.mars;
  return Math.round(Math.hypot(site.x - pad.x, site.z - pad.z) * 10) / 10;
}

// --- RESOURCE-SPECIFIC STRUCTURED DATA ---

export const SOJOURNER_ROCK_TARGETS: SojournerRockTarget[] = [
  {
    id: 'barnacle_bill',
    name: 'Barnacle Bill',
    worldOffset: [2.8, 1.9],
    nickNote: 'First Mars rock ever chemically analyzed by APXS!',
    physicalSummary: 'Rough, pitted angular dark rock resembling volcanic andesite on Earth.',
    apxsFindings:
      'High silica (~58–62% SiO₂ in dust-corrected educational estimates) similar to terrestrial andesites, showing ancient Martian magma differentiation.',
    spectrumPeaks: [
      { element: 'Silicon', symbol: 'Si', relativeIntensity: 0.92, note: 'Elevated silicate peak' },
      { element: 'Oxygen', symbol: 'O', relativeIntensity: 0.85, note: 'Oxide mineral lattice' },
      { element: 'Aluminum', symbol: 'Al', relativeIntensity: 0.56, note: 'Feldspar component' },
      { element: 'Iron', symbol: 'Fe', relativeIntensity: 0.44, note: 'Lower than surrounding dust' }
    ]
  },
  {
    id: 'yogi',
    name: 'Yogi',
    worldOffset: [-3.2, 2.4],
    nickNote: 'Large two-toned boulder ~1 meter wide in the Rock Garden.',
    physicalSummary: 'Steep-sided angular block with dark basaltic faces and bright dust coatings.',
    apxsFindings:
      'More basaltic composition compared to Barnacle Bill; helped map how ancient floodwaters swept diverse rock types into Ares Vallis.',
    spectrumPeaks: [
      { element: 'Silicon', symbol: 'Si', relativeIntensity: 0.78, note: 'Basaltic silicate' },
      { element: 'Iron', symbol: 'Fe', relativeIntensity: 0.68, note: 'Iron-rich mafic minerals' },
      { element: 'Calcium', symbol: 'Ca', relativeIntensity: 0.48, note: 'Pyroxene / plagioclase' },
      { element: 'Magnesium', symbol: 'Mg', relativeIntensity: 0.52, note: 'Olivine / pyroxene signal' }
    ]
  },
  {
    id: 'scooby_doo',
    name: 'Scooby-Doo',
    worldOffset: [0.6, 3.6],
    nickNote: 'Whitish flat crust slab mistaken at first for solid rock.',
    physicalSummary: 'Smooth, pale cemented surface crust (indurated soil / duricrust).',
    apxsFindings:
      'Rover wheels did not scratch solid rock—APXS showed soil-like chemistry high in sulfur/chlorine salts cementing fine Martian dust.',
    spectrumPeaks: [
      { element: 'Silicon', symbol: 'Si', relativeIntensity: 0.72, note: 'Fine silicate dust matrix' },
      { element: 'Iron', symbol: 'Fe', relativeIntensity: 0.64, note: 'Ferric dust staining' },
      { element: 'Sulfur', symbol: 'S', relativeIntensity: 0.76, note: 'Elevated sulfate cement' },
      { element: 'Chlorine', symbol: 'Cl', relativeIntensity: 0.45, note: 'Evaporite salt trace' }
    ]
  }
];

export const MER_TWIN_PROFILES: MerRoverProfile[] = [
  {
    id: 'spirit',
    name: 'Spirit (MER-A)',
    launchDate: 'June 10, 2003 (Delta II)',
    landingDateLabel: 'January 3, 2004 PST (January 4, 2004 UTC)',
    landingSite: 'Gusev Crater (14.57° S, 175.47° E)',
    plannedSolLife: 90,
    distanceKm: 7.73,
    distanceNote: '~7.7 km traversed across volcanic plains up into Columbia Hills & Home Plate',
    keyLandmarks: ['Bonneville Crater', 'Husband Hill (Columbia Hills)', 'Home Plate volcanic plateau', 'Troy sand trap'],
    keyDiscoveries: [
      'Gusev’s flat floor was mostly basaltic lava rather than exposed lakebed mud.',
      'In the older Columbia Hills, Spirit found carbonate-rich rocks, sulfate soils, and >90% pure silica exposed by its dragging wheel—evidence of past hydrothermal hot springs or steam!',
      'Observed swirling dust devils clean solar panels, extending survival through multiple winters.'
    ],
    finalCommDate: 'March 22, 2010',
    missionEndDate: 'May 25, 2011',
    endCause: 'Embedded in soft sulfate sand ("Troy") in 2009; unable to tilt panels toward northern winter sun, resulting in extreme cold.'
  },
  {
    id: 'opportunity',
    name: 'Opportunity (MER-B)',
    launchDate: 'July 7, 2003 (Delta II Heavy)',
    landingDateLabel: 'January 24, 2004 PST (January 25, 2004 UTC)',
    landingSite: 'Meridiani Planum (1.95° S, 354.47° E)',
    plannedSolLife: 90,
    distanceKm: 45.16,
    distanceNote:
      '~45.16 km (28.06 miles) driven over 14+ years — a record held until NASA’s Perseverance surpassed Opportunity’s off-Earth driving distance record on October 11, 2026.',
    keyLandmarks: ['Eagle Crater (hole-in-one)', 'Endurance Crater', 'Victoria Crater', 'Endeavour Crater rim & Perseverance Valley'],
    keyDiscoveries: [
      'Inside Eagle Crater, bedrock layers contained jarosite (a sulfate mineral formed in acidic liquid water) and ripples formed by ancient surface water.',
      'Discovered spherical iron-rich hematite concretions nicknamed "blueberries" formed inside water-soaked sediments.',
      'Found clay minerals (smectites) on ancient Endeavour Crater rim indicating older, neutral-pH water.'
    ],
    finalCommDate: 'June 10, 2018',
    missionEndDate: 'February 13, 2019',
    endCause: 'Planet-encircling Martian dust storm blocked sunlight to solar arrays during Martian winter.'
  }
];

export const MER_INSTRUMENTS = [
  { id: 'pancam', name: 'Pancam', full: 'Panoramic Stereo Color Camera', detail: 'High-resolution multispectral stereo eyes on top of the mast for 360° geology and sky opacity checks.' },
  { id: 'navcam', name: 'Navcam', full: 'Navigation Stereo Cameras', detail: 'Wide-angle monochrome 3D terrain mapping used to plan safe drives around boulders.' },
  { id: 'minites', name: 'Mini-TES', full: 'Miniature Thermal Emission Spectrometer', detail: 'Infrared spectrometer inside the body peering via the mast periscope to spot water-altered minerals from afar.' },
  { id: 'mossbauer', name: 'Mössbauer Spectrometer', full: 'MIMOS II Iron Mineral Detector', detail: 'Held on the robotic arm turret; identified iron-bearing minerals like hematite and jarosite.' },
  { id: 'apxs', name: 'APXS', full: 'Alpha Particle X-Ray Spectrometer', detail: 'Mounted on the IDD arm to measure chemical element abundances in rocks and soil.' },
  { id: 'magnets', name: 'Magnet Arrays', full: 'Magnetic Dust Capture Targets', detail: 'Collected airborne magnetic Martian dust so APXS and Mössbauer could identify titanium-magnetite grains.' },
  { id: 'mi', name: 'Microscopic Imager', full: 'Hand-Lens Extreme Close-Up Camera', detail: 'Captured millimeter-scale rock grain textures and hematite "blueberry" spherules.' },
  { id: 'rat', name: 'RAT + IDD Arm', full: 'Rock Abrasion Tool & Robotic Arm', detail: '5-degree-of-freedom arm carrying a diamond-tipped grinder that brushed/ground ~5 mm beneath dusty weathering rinds.' }
];

export const INGENUITY_FLIGHT_PHASES: IngenuityPhaseSummary[] = [
  {
    id: 'tech_demo',
    title: 'Phase 1: Technology Demonstration',
    flightRange: 'Flights 1–5 (April–May 2021)',
    summary:
      'Proved powered controlled aerodynamic flight in <1% Earth atmospheric density, progressing from a 3 m hover to one-way airfield relocation.'
  },
  {
    id: 'operations',
    title: 'Phase 2: Operations Demonstration & Scouting',
    flightRange: 'Flights 6–33 (2021–2022)',
    summary:
      'Transitioned from experiment to Perseverance’s aerial scout—previewing Séítah sand dunes, rocky ridges, and safe traverse routes.'
  },
  {
    id: 'engineering',
    title: 'Phase 3: Extended Flight Engineering',
    flightRange: 'Flights 34–72 (2022–Jan 18, 2024)',
    summary:
      'Pushed flight software, variable-pitch takeoff over rough Jezero delta dunes, 24 m max altitude, 10 m/s peak speed, and total 128.8 flight minutes / 17 km distance.'
  }
];

export const INGENUITY_SUMMARY_STATS = {
  totalFlights: 72,
  totalFlightMinutes: 128.8,
  totalDistanceKm: 17.0,
  maxAltitudeMeters: 24,
  maxSpeedMps: 10,
  firstFlightDate: 'April 19, 2021',
  finalFlightDate: 'January 18, 2024 (Flight 72 — rotor blade damage on landing)',
  formalEndDate: 'January 25, 2024'
};

// --- PURE TESTABLE SCIENTIFIC SIMULATION & TRAJECTORY HELPERS ---

export interface PathfinderEdlSnapshot {
  phaseName: string;
  altitudeMeters: number;
  airbagsInflated: boolean;
  petalsOpen01: number;
  rampExtended01: number;
  sojournerRollOffset: number;
}

export function computePathfinderEdlState(progress01: number): PathfinderEdlSnapshot {
  const p = Math.max(0, Math.min(1, progress01));
  if (p < 0.16) {
    const t = p / 0.16;
    return {
      phaseName: 'Atmospheric Aero-Entry & Heat Shield',
      altitudeMeters: Math.round((1 - t) * 125000 + 11000),
      airbagsInflated: false,
      petalsOpen01: 0,
      rampExtended01: 0,
      sojournerRollOffset: 0
    };
  }
  if (p < 0.34) {
    const t = (p - 0.16) / 0.18;
    return {
      phaseName: 'Supersonic Parachute Descent & Heat Shield Separation',
      altitudeMeters: Math.round((1 - t) * 10900 + 120),
      airbagsInflated: t > 0.55,
      petalsOpen01: 0,
      rampExtended01: 0,
      sojournerRollOffset: 0
    };
  }
  if (p < 0.52) {
    const t = (p - 0.34) / 0.18;
    const bounceWave = Math.abs(Math.sin(t * Math.PI * 3.5)) * (1 - t) * 18;
    return {
      phaseName: 'RAD Retro-Rockets Cut & Airbag Bounces on Ares Vallis',
      altitudeMeters: Math.round(bounceWave * 10) / 10,
      airbagsInflated: true,
      petalsOpen01: 0,
      rampExtended01: 0,
      sojournerRollOffset: 0
    };
  }
  if (p < 0.72) {
    const t = (p - 0.52) / 0.2;
    return {
      phaseName: 'Airbags Retract & Tetrahedral Petals Open',
      altitudeMeters: 0,
      airbagsInflated: false,
      petalsOpen01: t,
      rampExtended01: Math.max(0, (t - 0.5) * 2),
      sojournerRollOffset: 0
    };
  }
  const tRoll = (p - 0.72) / 0.28;
  return {
    phaseName: 'July 5, 1997: Ramp Deployed — Sojourner Rolls onto Mars!',
    altitudeMeters: 0,
    airbagsInflated: false,
    petalsOpen01: 1,
    rampExtended01: 1,
    sojournerRollOffset: Math.round(tRoll * 3.4 * 100) / 100
  };
}

export function computeSojournerMissionCounter(progress01: number): {
  designDays: number;
  actualDays: number;
  statusLabel: string;
} {
  const p = Math.max(0, Math.min(1, progress01));
  const actualDays = Math.round(p * 83);
  return {
    designDays: 7,
    actualDays,
    statusLabel:
      actualDays <= 7
        ? `Primary 7-Day Goal (Day ${actualDays} of 7)`
        : `Extended Operations (Day ${actualDays} of 83 — ~12× planned duration!)`
  };
}

export function computeVikingEdlState(progress01: number): {
  phaseLabel: string;
  orbiterAltitudeKm: number;
  landerAltitudeMeters: number;
  orbiterStaysInOrbit: true;
} {
  const p = Math.max(0, Math.min(1, progress01));
  if (p < 0.22) {
    return {
      phaseLabel: 'Viking 1 in Mars Orbit — Re-selecting Safe Chryse Planitia Site',
      orbiterAltitudeKm: 1513,
      landerAltitudeMeters: 1513000,
      orbiterStaysInOrbit: true
    };
  }
  if (p < 0.45) {
    const t = (p - 0.22) / 0.23;
    return {
      phaseLabel: 'Separation (July 20, 1976 08:32 UT) & Aero-Entry',
      orbiterAltitudeKm: 1513,
      landerAltitudeMeters: Math.round((1 - t) * 240000 + 8000),
      orbiterStaysInOrbit: true
    };
  }
  if (p < 0.78) {
    const t = (p - 0.45) / 0.33;
    return {
      phaseLabel: 'Parachute + Terminal Retro-Engine Descent',
      orbiterAltitudeKm: 1513,
      landerAltitudeMeters: Math.round(Math.pow(1 - t, 1.5) * 8000),
      orbiterStaysInOrbit: true
    };
  }
  return {
    phaseLabel: 'Touchdown at Chryse Planitia (11:53:06 UT) • Orbiter Remains in Orbit',
    orbiterAltitudeKm: 1513,
    landerAltitudeMeters: 0,
    orbiterStaysInOrbit: true
  };
}

export function computePhoenixFrostSublimation(solAfterExposure: number): {
  sol: number;
  visibleBrightIcePercent: number;
  phaseNote: string;
} {
  const sol = Math.max(0, Math.min(25, Math.round(solAfterExposure)));
  if (sol < 2) {
    return {
      sol,
      visibleBrightIcePercent: 100,
      phaseNote: 'May 31, 2008: Bright white material exposed inside Dodo-Goldilocks trench.'
    };
  }
  if (sol < 6) {
    const rem = Math.max(18, Math.round(100 - (sol - 1) * 18));
    return {
      sol,
      visibleBrightIcePercent: rem,
      phaseNote: 'Dime-sized bright ice lumps shrinking under thin sunlit CO₂ air (sublimation).'
    };
  }
  return {
    sol,
    visibleBrightIcePercent: 0,
    phaseNote:
      'June 19, 2008: Bright material completely vanished—proving it was frozen water ice that sublimated directly into vapor rather than salt!'
  };
}

export function computeIngenuityFlightStep(params: {
  collectivePitch: number; // 0..1
  rotorRpm: number; // 0..2800
  airDensityRatioToEarth: number; // ~0.01 on Mars
  altitudeMeters: number;
  verticalVelocityMps: number;
  dt: number;
}): {
  altitudeMeters: number;
  verticalVelocityMps: number;
  liftToWeightRatio: number;
  canHover: boolean;
} {
  const dt = Math.max(0.01, Math.min(0.1, params.dt));
  const marsGravity = 3.71;
  // ~2,400–2,537 RPM coaxial 1.2m rotors tuned for <1% Earth air density
  const rpmFactor = Math.max(0, Math.min(1.3, params.rotorRpm / 2537));
  const densityNorm = Math.max(0.002, Math.min(1.0, params.airDensityRatioToEarth / 0.01));
  const liftAccel = params.collectivePitch * rpmFactor * Math.sqrt(densityNorm) * 6.8;
  const netAccel = liftAccel - marsGravity;
  let nextVy = params.verticalVelocityMps + netAccel * dt - params.verticalVelocityMps * 0.45 * dt;
  let nextAlt = params.altitudeMeters + nextVy * dt;
  if (nextAlt <= 0) {
    nextAlt = 0;
    if (nextVy < 0) nextVy = 0;
  }
  if (nextAlt > 24) {
    nextAlt = 24;
    if (nextVy > 0) nextVy = 0;
  }
  const liftToWeightRatio = Math.round((liftAccel / marsGravity) * 100) / 100;
  return {
    altitudeMeters: Math.round(nextAlt * 100) / 100,
    verticalVelocityMps: Math.round(nextVy * 100) / 100,
    liftToWeightRatio,
    canHover: liftToWeightRatio >= 1.0
  };
}

export function computeDawnIonTrajectory(progress01: number): {
  stageName: string;
  dateLabel: string;
  targetBody: 'Deep Space Cruise' | 'Mars Gravity Assist' | 'Vesta Orbit' | 'Ceres Orbit';
  isOrbiterOnly: true;
} {
  const p = Math.max(0, Math.min(1, progress01));
  if (p < 0.2) {
    return {
      stageName: 'Delta II Heavy Launch & Xenon Ion Spiral Outward',
      dateLabel: 'September 27, 2007',
      targetBody: 'Deep Space Cruise',
      isOrbiterOnly: true
    };
  }
  if (p < 0.4) {
    return {
      stageName: 'Mars Gravity Assist Slingshot',
      dateLabel: 'February 17, 2009',
      targetBody: 'Mars Gravity Assist',
      isOrbiterOnly: true
    };
  }
  if (p < 0.68) {
    return {
      stageName: 'Vesta Orbit — Mapping Rheasilvia Basin & Differentiated Interior',
      dateLabel: 'July 2011 – September 2012',
      targetBody: 'Vesta Orbit',
      isOrbiterOnly: true
    };
  }
  if (p < 0.88) {
    return {
      stageName: 'Ceres Orbit — Occator Salt Deposits & Ahuna Mons',
      dateLabel: 'March 6, 2015 – October 2018',
      targetBody: 'Ceres Orbit',
      isOrbiterOnly: true
    };
  }
  return {
    stageName: 'Hydrazine Depleted — Silent Permanent Ceres Orbit (Does Not Crash)',
    dateLabel: 'October 31 / November 1, 2018',
    targetBody: 'Ceres Orbit',
    isOrbiterOnly: true
  };
}

export function computePioneerTrajectories(
  spacecraft: 'pioneer_10' | 'pioneer_11',
  progress01: number
): {
  milestone: string;
  dateLabel: string;
  approxDistanceAU: number;
  missionRole: 'Flyby Only';
} {
  const p = Math.max(0, Math.min(1, progress01));
  if (spacecraft === 'pioneer_10') {
    if (p < 0.25) {
      return {
        milestone: 'First Spacecraft to Traverse the Asteroid Belt',
        dateLabel: 'July 15, 1972 – February 1973',
        approxDistanceAU: 2.8,
        missionRole: 'Flyby Only'
      };
    }
    if (p < 0.55) {
      return {
        milestone: 'First Jupiter Flyby (~130,354 km • ~126,000 km/h)',
        dateLabel: 'December 4, 1973 (02:26 UT)',
        approxDistanceAU: 5.2,
        missionRole: 'Flyby Only'
      };
    }
    if (p < 0.8) {
      return {
        milestone: 'Crossed Neptune’s Orbit into Outer Deep Space',
        dateLabel: 'June 13, 1983',
        approxDistanceAU: 30.1,
        missionRole: 'Flyby Only'
      };
    }
    return {
      milestone: 'Routine Ops Ended Mar 31, 1997 • Last Very Faint Signal Jan 23, 2003',
      dateLabel: '1997 – January 23, 2003',
      approxDistanceAU: 82.2,
      missionRole: 'Flyby Only'
    };
  }

  // Pioneer 11
  if (p < 0.3) {
    return {
      milestone: 'Jupiter Close Flyby (~42,500 km) & Gravity Assist Across Solar System',
      dateLabel: 'December 3, 1974',
      approxDistanceAU: 5.2,
      missionRole: 'Flyby Only'
    };
  }
  if (p < 0.65) {
    return {
      milestone: 'First-Ever Saturn Flyby (~20,900 km) — Discovered F Ring & New Moon',
      dateLabel: 'September 1, 1979',
      approxDistanceAU: 9.5,
      missionRole: 'Flyby Only'
    };
  }
  if (p < 0.85) {
    return {
      milestone: 'Crossed Orbit of Neptune Heading Outward',
      dateLabel: 'February 23, 1990',
      approxDistanceAU: 30.1,
      missionRole: 'Flyby Only'
    };
  }
  return {
    milestone: 'Routine Ops Ended Sep 30, 1995 • Last Engineering Data Nov 24, 1995',
    dateLabel: 'November 24, 1995',
    approxDistanceAU: 44.7,
    missionRole: 'Flyby Only'
  };
}

export function computeKeplerTransitLightCurve(
  phase01: number,
  planetToStarRadiusRatio: number,
  stellarNoiseAmplitude = 0
): {
  relativeBrightness: number;
  inTransit: boolean;
  transitDepthPercent: number;
} {
  const p = ((phase01 % 1) + 1) % 1;
  const r = Math.max(0.01, Math.min(0.25, planetToStarRadiusRatio));
  const depth = r * r; // ΔF ≈ (Rp / R*)^2
  const center = 0.5;
  const halfWidth = 0.095;
  const dist = Math.abs(p - center);

  let dip = 0;
  let inTransit = false;
  if (dist < halfWidth) {
    inTransit = true;
    const u = dist / halfWidth;
    // Smooth ingress/egress limb-darkened transit trough
    dip = depth * Math.pow(Math.max(0, 1 - Math.pow(u, 2.4)), 0.45);
  }
  const noise = stellarNoiseAmplitude * Math.sin(p * Math.PI * 18) * 0.5;
  const relativeBrightness = Math.round((1 - dip + noise) * 100000) / 100000;
  return {
    relativeBrightness,
    inTransit,
    transitDepthPercent: Math.round(depth * 10000) / 100
  };
}

export function isInHabitableZoneAU(
  starLuminositySolar: number,
  orbitalDistanceAU: number
): {
  zone: 'too_hot' | 'habitable_zone' | 'too_cold';
  estimatedEquilibriumCelsius: number;
  note: string;
} {
  const lum = Math.max(0.01, Math.min(5, starLuminositySolar));
  const innerAU = 0.84 * Math.sqrt(lum);
  const outerAU = 1.67 * Math.sqrt(lum);
  const d = Math.max(0.05, orbitalDistanceAU);
  const tKelvin = 255 * Math.pow(lum, 0.25) / Math.sqrt(d);
  const celsius = Math.round(tKelvin - 273.15);

  if (d < innerAU) {
    return {
      zone: 'too_hot',
      estimatedEquilibriumCelsius: celsius,
      note: 'Too Hot — liquid surface water boils into dense steam/runaway greenhouse.'
    };
  }
  if (d > outerAU) {
    return {
      zone: 'too_cold',
      estimatedEquilibriumCelsius: celsius,
      note: 'Too Cold — surface water freezes solid into global ice.'
    };
  }
  return {
    zone: 'habitable_zone',
    estimatedEquilibriumCelsius: celsius,
    note: 'Conservative Habitable Zone — surface liquid water could potentially exist given the right atmosphere (NOT proof of life!).'
  };
}

// --- COMPLETE 8 HISTORICAL MISSION RESOURCE CONFIGURATIONS ---

export const MARS_AND_SPACE_RESOURCES: Record<MarsAndSpaceResourceId, MarsAndSpaceResourceConfig> = {
  sojourner: {
    id: 'sojourner',
    category: 'mars',
    categoryLabel: 'Category 1 • Mars Exploration',
    missionEnvironment: 'mars_surface',
    resourceNumber: 'Resource 01',
    shortTitle: 'Sojourner & Mars Pathfinder (1997)',
    fullTitle: 'SOJOURNER — THE LITTLE ROVER THAT MADE HISTORY',
    subtitle: 'Ares Vallis • Humanity’s First Wheeled Rover to Operate on Mars',
    eraBadge: '1997 • ARES VALLIS',
    transitionHeading: 'BACK TO JULY 1997',
    transitionSubheading: 'Mars Pathfinder & Sojourner — Ares Vallis Outflow Channel',
    timeTravelDisclaimer:
      'Storytelling Device: Your Space Shuttle is your modern exploration craft; the 1997 transition reconstructs NASA’s historical Pathfinder mission at Ares Vallis.',
    accentColor: '#f97316',
    badgeTitle: '1997 MARS PIONEER — SOJOURNER',
    briefingSummary: [
      'On July 4, 1997, NASA’s Mars Pathfinder slammed into the Martian sky inside a blazing aeroshell, popped a supersonic parachute, fired retro-rockets, and bounced to a halt inside giant inflatable airbags at Ares Vallis.',
      'After petal-shaped solar doors unfolded and a ramp extended on July 5, the microwave-sized rover Sojourner rolled onto Martian soil—proving low-cost robotic roving worked on Mars and launching an unbroken line of Mars rovers.'
    ],
    missionObjectives: [
      'Demonstrate low-cost "faster, better, cheaper" NASA Discovery Program planetary exploration.',
      'Validate direct aero-entry, parachute, retro-rocket, and airbag bounce soft landing.',
      'Operate a 6-wheeled mobility system (Sojourner) across Martian dust and rocks.',
      'Measure rock & soil chemistry via APXS (Alpha Proton X-Ray Spectrometer).',
      'Reconstruct ancient catastrophic flood history of Ares Vallis (scientific evidence of past water—NOT proof of life).'
    ],
    teamAndProgram: [
      { name: 'Tony Spear', role: 'Mars Pathfinder Project Manager (NASA JPL)' },
      { name: 'Richard Cook', role: 'Mission Manager & Flight Operations Lead' },
      { name: 'Matthew Golombek', role: 'Project Scientist & Ares Vallis Site Lead' },
      { name: 'Peter Smith', role: 'Principal Investigator for the IMP Stereo Camera' }
    ],
    keySpecs: [
      { label: 'Landing Date', value: 'July 4, 1997 (Deployment: July 5; First imagery pub: July 6)' },
      { label: 'Landing Site', value: 'Ares Vallis Ancient Floodplain' },
      { label: 'Sojourner Mass / Height', value: '10.6 kg (~23 lb) • ~30 cm tall, ~65 cm long' },
      { label: 'Mobility', value: '6-wheel Rocker-Bogie suspension' },
      { label: 'Power', value: 'Top Solar Array (~16 W peak) + non-rechargeable primary LiSOCl2 batteries' },
      { label: 'Duration', value: '7-day design → 83-day actual (Last tx: Sep 27, 1997; Official end: Mar 10, 1998)' }
    ],
    hotspots: [
      {
        id: 'soj_petals',
        label: 'Pathfinder Tetrahedral Petals',
        shortTitle: 'Lander Petals',
        explanation: 'Three solar-covered petals unfolded automatically righting the lander after its airbag bounce.'
      },
      {
        id: 'soj_imp',
        label: 'IMP Stereo Mast & Weather',
        shortTitle: 'IMP Mast',
        explanation: 'Imager for Mars Pathfinder rose ~1.8 m above the base to shoot 360° panoramas and watch Sojourner.'
      },
      {
        id: 'soj_wheels',
        label: '6-Wheel Rocker-Bogie',
        shortTitle: 'Rocker-Bogie',
        explanation: 'Articulated titanium-tube suspension allowed Sojourner to climb rocks up to ~20 cm while keeping all six wheels grounded.'
      },
      {
        id: 'soj_solar',
        label: 'Sojourner Solar Deck & Batteries',
        shortTitle: 'Solar + Battery',
        explanation: 'Top GaAs solar panel powered daytime driving, supplemented by D-cell non-rechargeable primary batteries for cold nights and early operations.'
      },
      {
        id: 'soj_apxs',
        label: 'APXS Chemical Sensor',
        shortTitle: 'Rear APXS',
        explanation: 'Pressed against Barnacle Bill, Yogi, and Scooby-Doo to bombard rocks with alpha particles and read X-ray elemental fingerprints.'
      },
      {
        id: 'soj_comms',
        label: 'Pathfinder Base Relay Link',
        shortTitle: 'Relay Antenna',
        explanation: 'Sojourner could NOT phone Earth directly; its UHF modem relayed telemetry & photos through the Pathfinder lander’s high-gain dish.'
      }
    ],
    timeline: [
      { date: 'Dec 4, 1996', title: 'Delta II Launch', detail: 'Launched from Cape Canaveral Air Station toward Mars.' },
      { date: 'July 4, 1997', title: 'Ares Vallis Airbag Touchdown', detail: 'Bounced across Mars cushioned by 24-lobe airbags and opened petals.' },
      { date: 'July 5, 1997', title: 'Ramp Deployment', detail: 'Sojourner drove down the forward ramp onto Martian soil (imagery released July 6).' },
      { date: 'July 1997', title: 'Rock Garden APXS Analysis', detail: 'Analyzed Barnacle Bill, Yogi, Scooby-Doo, plus soil & wind measurements.' },
      { date: 'Sep 27, 1997', title: 'Last Successful Transmission', detail: '83 sols of surface science—far beyond its 7-day primary warranty.' },
      { date: 'Mar 10, 1998', title: 'Official Mission End', detail: 'NASA formally concluded Mars Pathfinder after months of attempted recovery.' }
    ],
    legacyChain: [
      'Sojourner (1997 • 10.6 kg)',
      'Spirit & Opportunity (2004 • 185 kg)',
      'Curiosity (2012 • 899 kg)',
      'Perseverance (2021 • 1,025 kg)'
    ],
    narrationEn: {
      briefing:
        'Welcome back to 1997! NASA engineers in the Discovery Program proved a tiny microwave-sized rover named Sojourner—honoring Sojourner Truth—could bounce onto Mars inside giant airbags and explore ancient floodplains.',
      time_transition:
        'Engaging 1997 historical reconstruction at Ares Vallis! Remember, our time jump is a storytelling window while your modern shuttle stays safely parked nearby.',
      interactive_3d_lab:
        'Inspect Pathfinder’s solar petals and Sojourner’s 6-wheel rocker-bogie chassis. Notice how Sojourner relies on Pathfinder’s dish to talk back to Earth.',
      historical_sequence:
        'Watch Pathfinder hit the thin Martian air, unfurl its supersonic parachute, fire retro-rockets, bounce inside airbags, and extend the ramp on July fifth, 1997!',
      science_discoveries:
        'Guide Sojourner to Barnacle Bill, Yogi, and Scooby-Doo to inspect simulated APXS chemical spectra. Notice the science rule: these rocks prove ancient floods and water minerals, NOT living organisms.',
      timeline_legacy:
        'Planned for just seven days, Sojourner survived eighty-three days until September twenty-seventh, 1997—paving the way for Spirit, Opportunity, Curiosity, and Perseverance.',
      quiz: 'Test your knowledge of Pathfinder, Sojourner’s APXS findings, and Mars exploration history!'
    },
    narrationHi: {
      briefing:
        'सन् 1997 की मंगल यात्रा में आपका स्वागत है! नासा की पाथफाइंडर टीम ने दिखाया कि एक छोटे 6-पहिया रोवर सोजर्नर (Sojourner Truth के नाम पर) को एयरबैग की मदद से मंगल पर उतारा जा सकता है।',
      time_transition:
        'अब हम 1997 के एरेस वैलिस (Ares Vallis) पुनर्निर्माण में प्रवेश कर रहे हैं। यह समय-यात्रा केवल इतिहास दिखाने का एक माध्यम है।',
      interactive_3d_lab:
        'पाथफाइंडर के सौर पैनल और सोजर्नर के रॉकर-बोगी (rocker-bogie) पहियों को करीब से देखें। सोजर्नर सीधे पृथ्वी से नहीं, बल्कि पाथफाइंडर बेस स्टेशन के ज़रिए बात करता था।',
      historical_sequence:
        'देखें कि कैसे पैराशूट और एयरबैग बाउंस के बाद 5 जुलाई 1997 को रैंप खुला और सोजर्नर मंगल की मिट्टी पर उतरा!',
      science_discoveries:
        'बार्नेकल बिल (Barnacle Bill), योगी (Yogi) और स्कूबी-डू (Scooby-Doo) चट्टानों का शैक्षिक APXS स्पेक्ट्रम देखें। यह प्राचीन बाढ़ और पानी का प्रमाण देता है, जीवन का प्रमाण नहीं।',
      timeline_legacy:
        'केवल 7 दिनों के लिए बना सोजर्नर 83 दिनों तक सक्रिय रहा और आगे चलकर स्पिरिट, ऑपर्च्युनिटी, क्यूरियोसिटी और पर्सिवियरेंस का रास्ता खोला।',
      quiz: 'पाथफाइंडर और सोजर्नर के वैज्ञानिक मिशन पर अपनी समझ की जांच करें!'
    },
    learningSummary: [
      'Sojourner (10.6 kg) was the first wheeled rover to operate on Mars (July–September 1997).',
      'Airbag + retro-rocket EDL proved low-cost landing at Ares Vallis.',
      'APXS chemical spectra of Barnacle Bill, Yogi, and Scooby-Doo revealed volcanic and salt-cemented rocks shaped by ancient water—without proving Martian life.'
    ],
    requiredLabActionLabel: 'Inspect at least 1 Mars rock with APXS & run EDL preview',
    sources: [
      {
        title: 'Mars Pathfinder / Sojourner Mission Overview',
        publisher: 'NASA / JPL',
        url: 'https://science.nasa.gov/mission/mars-pathfinder/',
        missionOrProgram: 'Discovery Program'
      }
    ]
  },

  spirit_opportunity: {
    id: 'spirit_opportunity',
    category: 'mars',
    categoryLabel: 'Category 1 • Mars Exploration',
    missionEnvironment: 'mars_surface',
    resourceNumber: 'Resource 02',
    shortTitle: 'Spirit & Opportunity (2004)',
    fullTitle: 'SPIRIT & OPPORTUNITY — THE TWIN ROBOT GEOLOGISTS',
    subtitle: 'Gusev Crater & Meridiani Planum • Designed for 90 Sols, Endured Up to 14 Years',
    eraBadge: '2004–2018 • TWIN MER ROVERS',
    transitionHeading: 'BACK TO JANUARY 2004',
    transitionSubheading: 'Mars Exploration Rovers: Spirit (Gusev) & Opportunity (Meridiani)',
    timeTravelDisclaimer:
      'Gusev Crater and Meridiani Planum lie on nearly opposite sides of Mars; in the 3D surface simulation their zones are displayed side-by-side for educational comparison.',
    accentColor: '#38bdf8',
    badgeTitle: '90-SOL HERO — SPIRIT & OPPORTUNITY',
    briefingSummary: [
      'Launched weeks apart in summer 2003, twin 185 kg solar-powered geologists Spirit and Opportunity each landed inside giant bouncing airbags in January 2004 on opposite hemispheres of Mars.',
      'Built for just 90 Martian days (sols), dust-cleaning Martian whirlwinds and resilient engineering kept Spirit rolling ~7.7 km until 2010 and Opportunity astonishingly active across ~45.16 km until the 2018 global dust storm.'
    ],
    missionObjectives: [
      'Search for and characterize rocks and soils holding clues to past liquid water activity.',
      'Assess whether ancient Martian environments could once have been habitable (microbial potential, not life proof).',
      'Determine mineral iron, silicate, and sulfate distributions across contrasting geologic sites.',
      'Identify processes that sculpted the Martian crust (volcanism, water, wind, impacts).',
      'Validate mineral signatures spotted earlier from Mars orbiters (MGS & Mars Odyssey).',
      'Compare globally separated landing sites: Gusev Crater vs. Meridiani Planum.'
    ],
    teamAndProgram: [
      { name: 'Steve Squyres', role: 'Principal Investigator (Cornell University)' },
      { name: 'Peter Theisinger & Jennifer Trosper / John Callas', role: 'MER Project & Flight Managers (JPL)' },
      { name: 'Athena Science Payload Team', role: 'Pancam, Mini-TES, Mössbauer, APXS, MI & RAT' }
    ],
    keySpecs: [
      { label: 'Mass (Each)', value: '185 kg robot geologist' },
      { label: 'Design Warranty', value: '90 Martian sols (~92.5 Earth days)' },
      { label: 'Spirit (MER-A)', value: 'Launch Jun 10, 2003 → Land Jan 3 PST / Jan 4 UTC, 2004 • ~7.7 km' },
      { label: 'Opportunity (MER-B)', value: 'Launch Jul 7, 2003 → Land Jan 24 PST / Jan 25 UTC, 2004 • ~45.16 km' },
      { label: 'Record Update Note', value: 'Opportunity’s ~45.16 km record stood until Perseverance surpassed it on Oct 11, 2026' },
      { label: 'End Dates', value: 'Spirit end: May 25, 2011 • Opportunity end: Feb 13, 2019' }
    ],
    hotspots: [
      {
        id: 'mer_pancam',
        label: 'Pancam & Navcam Mast',
        shortTitle: 'Stereo Mast',
        explanation: 'Rose ~1.5 m high; Pancam snapped high-res true/false-color stereo panoramas while Navcams charted 3D hazards.'
      },
      {
        id: 'mer_minites',
        label: 'Mini-TES Periscope',
        shortTitle: 'Mini-TES',
        explanation: 'Thermal infrared spectrometer inside the warm body scanned distant outcrops through the vertical mast mirror.'
      },
      {
        id: 'mer_idd',
        label: 'IDD Arm + 4 Contact Tools',
        shortTitle: 'IDD & RAT',
        explanation: '5-joint arm rotated a turret carrying Mössbauer, APXS, Microscopic Imager (MI), and the Rock Abrasion Tool (RAT) diamond grinder.'
      },
      {
        id: 'mer_magnets',
        label: 'Magnetic Dust Targets',
        shortTitle: 'Magnets',
        explanation: 'Permanent magnets captured airborne red dust to confirm its magnetic iron-oxide content.'
      },
      {
        id: 'mer_solar',
        label: 'Solar Wings & Li-Ion Batteries',
        shortTitle: 'Solar Deck',
        explanation: 'Martian wind gusts ("cleaning events") unexpectedly swept dust off solar arrays—turning 90-sol rovers into multi-year explorers.'
      }
    ],
    timeline: [
      { date: 'Jun 10 & Jul 7, 2003', title: 'Twin Launches', detail: 'Spirit lifted off Jun 10; Opportunity followed Jul 7.' },
      { date: 'Jan 3/4, 2004', title: 'Spirit Lands at Gusev Crater', detail: 'Touched down Jan 3 PST (Jan 4 UTC) in an ancient crater floor.' },
      { date: 'Jan 24/25, 2004', title: 'Opportunity Hole-in-One at Meridiani', detail: 'Bounced right inside Eagle Crater (Jan 24 PST / Jan 25 UTC), uncovering jarosite & hematite "blueberries".' },
      { date: '2005–2008', title: 'Columbia Hills & Endurance/Victoria Craters', detail: 'Spirit climbed Husband Hill & found Home Plate silica; Opportunity descended into layered craters.' },
      { date: 'Mar 22, 2010 / May 25, 2011', title: 'Spirit Concludes', detail: 'Stuck in Troy sand trap (2009); final signal Mar 22, 2010; mission ended May 25, 2011 after ~7.7 km.' },
      { date: 'Jun 10, 2018 / Feb 13, 2019', title: 'Opportunity Concludes (~45.16 km)', detail: 'Silenced by planet-encircling dust storm Jun 10, 2018; ended Feb 13, 2019. (Perseverance surpassed 45.16 km on Oct 11, 2026.)' }
    ],
    narrationEn: {
      briefing:
        'In 2004, NASA landed twin 185-kilogram robot geologists on opposite sides of Mars: Spirit in Gusev Crater and Opportunity on Meridiani Planum.',
      time_transition:
        'Entering January 2004! Notice how we preserve exact U.S. Pacific versus Universal dates—Spirit landed January third Pacific, which was January fourth UTC.',
      interactive_3d_lab:
        'Inspect the twin MER rover hardware: Pancam stereo eyes, Mini-TES infrared spectrometer, magnetic dust targets, and the five-joint arm holding Mössbauer, APXS, Microscopic Imager, and the Rock Abrasion Tool.',
      historical_sequence:
        'Compare Spirit’s ~7.7-kilometer trek up the Columbia Hills and Home Plate against Opportunity’s legendary ~45.16-kilometer marathon across Meridiani Planum!',
      science_discoveries:
        'Both rovers validated orbital mineral maps: Spirit uncovered hydrothermal silica and carbonates, while Opportunity discovered jarosite sulfates and iron-oxide "blueberries"—proof of ancient liquid water!',
      timeline_legacy:
        'Opportunity’s ~45.16-kilometer off-Earth driving milestone stood proudly for years until NASA’s Perseverance rover surpassed that mark on October 11, 2026.',
      quiz: 'Check your mastery of the twin rovers’ instruments, timezones, water minerals, and records!'
    },
    narrationHi: {
      briefing:
        'सन् 2004 में नासा ने मंगल के विपरीत हिस्सों में दो जुड़वा रोवर भेजे—गुसेव क्रेटर में स्पिरिट (Spirit) और मेरिडियानी प्लैनम में ऑपर्च्युनिटी (Opportunity)।',
      time_transition:
        'जनवरी 2004 का पुनर्निर्माण: स्पिरिट 3 जनवरी PST (4 जनवरी UTC) और ऑपर्च्युनिटी 24 जनवरी PST (25 जनवरी UTC) को मंगल पर उतरी।',
      interactive_3d_lab:
        'ट्विन रोवर के 8 वैज्ञानिक उपकरण देखें: पैनकैम (Pancam), मिनी-टेस (Mini-TES), मॉसबाउर, APXS, चुंबक और रॉक एब्रेशन टूल (RAT)।',
      historical_sequence:
        'स्पिरिट ने लगभग 7.7 किमी और ऑपर्च्युनिटी ने लगभग 45.16 किमी की ऐतिहासिक दूरी तय की—जो 90-सोल योजना से कई गुना ज़्यादा थी!',
      science_discoveries:
        'ऑपर्च्युनिटी ने हेमेटाइट "ब्लूबेरीज़" और जारोसाइट पाया, जबकि स्पिरिट ने कोलंबिया हिल्स में सिलिका व गर्म जल के सबूत खोजे—जिससे प्राचीन तरल पानी सिद्ध हुआ।',
      timeline_legacy:
        'ऑपर्च्युनिटी का 45.16 किमी का रिकॉर्ड 11 अक्टूबर 2026 को नासा के पर्सिवियरेंस रोवर ने पार किया।',
      quiz: 'स्पिरिट और ऑपर्च्युनिटी की खोजों और उपकरणों पर क्विज़ खेलें!'
    },
    learningSummary: [
      'Both rovers exceeded a 90-sol warranty through dust-cleaning wind events and careful winter tilting.',
      'Opportunity drove ~45.16 km before the 2018 global dust storm; Perseverance surpassed Opportunity’s off-Earth driving distance record on Oct 11, 2026.',
      'Proved ancient surface and hydrothermal liquid water altered Martian rocks at Gusev and Meridiani.'
    ],
    requiredLabActionLabel: 'Inspect MER instruments & switch between Spirit and Opportunity',
    sources: [
      {
        title: 'Mars Exploration Rovers: Spirit & Opportunity',
        publisher: 'NASA / JPL',
        url: 'https://science.nasa.gov/mission/mer-spirit/',
        missionOrProgram: 'Mars Exploration Rover Program'
      }
    ]
  },

  viking_1: {
    id: 'viking_1',
    category: 'mars',
    categoryLabel: 'Category 1 • Mars Exploration',
    missionEnvironment: 'mars_orbit_and_surface',
    isStationaryLanderOnly: true,
    resourceNumber: 'Resource 03',
    shortTitle: 'Viking 1: Orbiter + Lander (1976)',
    fullTitle: 'VIKING 1 — THE FIRST LONG-TERM EXPLORATION OF MARS',
    subtitle: 'Orbiter Stays in Orbit • Stationary Nuclear Lander Touches Down at Chryse Planitia',
    eraBadge: 'JULY 1976 • CHRYSE PLANITIA',
    transitionHeading: 'BACK TO JULY 1976',
    transitionSubheading: 'Viking 1 Orbiter & Stationary Lander — Chryse Planitia',
    timeTravelDisclaimer:
      'Orbiter Separation Principle: Viking 1 Orbiter never landed on Mars—it orbited high above relaying data and mapping Mars, while only the Stationary Lander touched down on July 20, 1976.',
    accentColor: '#eab308',
    badgeTitle: '1976 MARS LANDER HISTORIAN — VIKING 1',
    briefingSummary: [
      'Launched August 20, 1975 atop a Titan IIIE-Centaur rocket, Viking 1 consisted of two tightly coupled spacecraft: a 2,339 kg solar-powered Orbiter and a 978 kg plutonium-powered Stationary Lander.',
      'After entering orbit June 19, 1976, Viking 1 Orbiter rejected a rough initial Chryse target and selected smooth western Chryse Planitia (22.483° N, 47.94° W)—allowing humanity’s first multi-year Mars surface station to operate until November 1982.'
    ],
    missionObjectives: [
      'Enter Mars orbit safely, map terrain, and certify a safe landing site before lander separation.',
      'Soft-land a stationary nuclear laboratory on Mars and capture high-resolution surface panoramas.',
      'Conduct the first dedicated organic chemistry (GCMS) and metabolic biology experiments on Martian soil.',
      'Measure atmospheric water vapor, thermal properties, winds, pressure, and seasonal dust cycles.',
      'Map Mars globally from orbit across Viking 1 & Viking 2 orbiters (52,663 total images; ~97% at 300 m resolution).'
    ],
    teamAndProgram: [
      { name: 'James S. Martin Jr.', role: 'Viking Project Manager (NASA Langley)' },
      { name: 'Gerald Soffen', role: 'Viking Project Scientist' },
      { name: 'Thomas A. Mutch', role: 'Lander Imaging Team Lead (Station renamed Thomas Mutch Memorial Station in Jan 1982)' }
    ],
    keySpecs: [
      { label: 'Launch', value: 'August 20, 1975 (Titan IIIE-Centaur)' },
      { label: 'Orbit / Separation / Touchdown', value: 'Orbit: Jun 19, 1976 • Sep: Jul 20 08:32 UT • Landed: Jul 20, 1976 11:53:06 UT' },
      { label: 'Mass', value: 'Orbiter: 2,339 kg (Solar) • Lander: 978 kg (2 × SNAP-19 RTG)' },
      { label: 'Coordinates', value: 'Chryse Planitia: 22.483° N, 47.94° W (renamed Thomas Mutch Memorial Station Jan 1982)' },
      { label: 'Surface Temps', value: 'Measured -86°C (dawn) up to -33°C (afternoon)' },
      { label: 'End of Contact', value: 'Last signal Nov 11, 1982 (some summaries cite Nov 13 loss after failed recovery)' }
    ],
    hotspots: [
      {
        id: 'vik_orbiter',
        label: 'Viking 1 Orbiter (Stays in Orbit)',
        shortTitle: 'Orbiter (In Sky)',
        explanation: 'Solar-winged 2,339 kg orbiter carried Visual Imaging cameras, MAWD water vapor detector, and IRTM thermal mapper—and NEVER landed.'
      },
      {
        id: 'vik_rtg',
        label: 'Twin SNAP-19 RTGs',
        shortTitle: '2× SNAP-19 RTG',
        explanation: 'Two plutonium-238 radioisotope thermoelectric generators kept the stationary lander powered day and night through winter dust storms.'
      },
      {
        id: 'vik_arm',
        label: 'Robotic Soil Sampler Arm (Jul 28, 1976)',
        shortTitle: 'Sampler Arm',
        explanation: 'Stationary extendable scoop first dug into Martian soil on July 28, 1976, feeding samples into Biology, GCMS, and XRF hoppers.'
      },
      {
        id: 'vik_cameras',
        label: 'Dual Facsimile Cameras (Line-by-Line Scan)',
        shortTitle: 'Scan Cameras',
        explanation: 'Scanned narrow vertical strips one line at a time, building the first crisp Mars footpad image and 300° boulder-strewn panoramas.'
      },
      {
        id: 'vik_seismometer',
        label: 'Viking 1 Seismometer (Caging Failure)',
        shortTitle: 'Seismometer Note',
        explanation: 'Historical Accuracy Check: Viking 1’s seismometer failed to uncage on Mars and did NOT operate successfully (Viking 2’s worked only briefly/mostly felt wind).'
      }
    ],
    timeline: [
      { date: 'Aug 20, 1975', title: 'Titan IIIE-Centaur Launch', detail: 'Viking 1 departed Cape Canaveral for Mars.' },
      { date: 'Jun 19, 1976', title: 'Mars Orbit Insertion & Site Review', detail: 'Orbiter photographed original Chryse site—found it too rugged and switched to 22.483° N, 47.94° W.' },
      { date: 'Jul 20, 1976', title: 'Sep (08:32 UT) & Touchdown (11:53:06 UT)', detail: 'First successful U.S. surface operations on Mars; immediately transmitted crisp footpad photo.' },
      { date: 'Jul 28, 1976', title: 'First Martian Soil Scoop', detail: 'Robotic sampler arm collected regolith for GCMS, XRF, and Biology experiments.' },
      { date: 'Jan 1982', title: 'Thomas Mutch Memorial Station', detail: 'NASA renamed Viking Lander 1 in honor of Imaging Lead Tim Mutch.' },
      { date: 'Nov 11 / Nov 13, 1982', title: 'Loss of Communications', detail: 'Faulty memory overwrite rotated the antenna; last contact Nov 11 (Nov 13 cited in mission-end summaries).' }
    ],
    narrationEn: {
      briefing:
        'Travel back to July 1976—when Viking 1 became America’s first mission to operate long-term on the Martian surface! Notice the rule: the Orbiter stayed permanently in space while only the nuclear stationary Lander descended.',
      time_transition:
        'Arrival in July 1976 Mars orbit! Orbital photos revealed jagged dangers at the planned landing spot—will you approve moving to smooth western Chryse Planitia?',
      interactive_3d_lab:
        'Examine the stationary Viking Lander’s twin SNAP-19 plutonium generators, line-scanning facsimile cameras, and extendable soil sampler—and remember, Viking 1’s seismometer never successfully uncaged.',
      historical_sequence:
        'At 08:32 Universal Time on July twentieth, 1976, Lander separated from Orbiter, touching down safely at 11:53:06 UT—then watch Mars’s very first line-by-line surface photo appear!',
      science_discoveries:
        'Explore "Did Viking Find Life?": the Labeled Release biology test produced reactive gas signals, yet the GCMS detected zero Martian organic carbon—leaving scientists without confirmed proof of life.',
      timeline_legacy:
        'Renamed Thomas Mutch Memorial Station in January 1982, Viking 1 transmitted weather down to minus eighty-six degrees Celsius until communications were lost in November 1982.',
      quiz: 'Verify your knowledge of Viking 1 Orbiter, Lander RTGs, the life debate, and Chryse Planitia!'
    },
    narrationHi: {
      briefing:
        'जुलाई 1976 में चलें! वाइकिंग 1 मंगल की सतह पर लंबे समय तक काम करने वाला पहला अमेरिकी मिशन था। याद रहे—ऑर्बिटर हमेशा कक्षा में रहा और केवल स्थिर लैंडर सतह पर उतरा।',
      time_transition:
        'ऑर्बिटर तस्वीरों से शुरुआती स्थल बहुत पथरीला दिखा—आइए क्रायस प्लैनिशिया (Chryse Planitia: 22.483° N, 47.94° W) का सुरक्षित स्थल चुनें!',
      interactive_3d_lab:
        'वाइकिंग 1 लैंडर के दो SNAP-19 RTG, स्कैनिंग कैमरे और मिट्टी निकालने वाला रोबोटिक हाथ देखें। ऐतिहासिक तथ्य: वाइकिंग 1 का भूकंपमापी (seismometer) अनलॉक नहीं हो पाया था।',
      historical_sequence:
        '20 जुलाई 1976 को 08:32 UT पर अलगाव और 11:53:06 UT पर सफल लैंडिंग के बाद मंगल की पहली लाइन-बाय-लाइन तस्वीर देखें!',
      science_discoveries:
        '"क्या वाइकिंग को जीवन मिला?": बायोलॉजी प्रयोग में कुछ रासायनिक प्रतिक्रिया दिखी, पर GCMS में कार्बनिक अणु नहीं मिले—इसलिए जीवन की पुष्टि नहीं हुई।',
      timeline_legacy:
        'जनवरी 1982 में इसे थॉमस मच मेमोरियल स्टेशन नाम मिला, और नवंबर 1982 में संपर्क समाप्त हुआ। वाइकिंग 1 व 2 ऑर्बिटर ने मिलकर 52,663 तस्वीरें लीं।',
      quiz: 'वाइकिंग 1 ऑर्बिटर और लैंडर से जुड़े वैज्ञानिक सवालों के जवाब दें!'
    },
    learningSummary: [
      'Viking 1 Orbiter remained permanently in Mars orbit while only the RTG-powered Lander settled safely onto Chryse Planitia.',
      'Landing site selection from orbit saved the mission from hazardous terrain.',
      'Ambiguous Biology results vs. negative GCMS organics did NOT confirm Martian life; Viking 1 seismometer did not operate.'
    ],
    requiredLabActionLabel: 'Approve Chryse Planitia landing decision & inspect Biology vs GCMS',
    sources: [
      {
        title: 'Viking 1 Mission Archive & Press Kit',
        publisher: 'NASA / JPL / Langley',
        url: 'https://science.nasa.gov/mission/viking/',
        missionOrProgram: 'Viking Program'
      }
    ]
  },

  phoenix_insight: {
    id: 'phoenix_insight',
    category: 'mars',
    categoryLabel: 'Category 1 • Mars Exploration',
    missionEnvironment: 'mars_surface',
    isStationaryLanderOnly: true,
    resourceNumber: 'Resource 04',
    shortTitle: 'Phoenix (2008) & InSight (2018)',
    fullTitle: 'PHOENIX & INSIGHT — TWO LANDERS, TWO MYSTERIES',
    subtitle: 'Frozen Arctic Water Ice (Vastitas Borealis) & Deep Marsquakes (Elysium Planitia)',
    eraBadge: '2008 & 2018 • STATIONARY LANDERS',
    transitionHeading: 'BACK TO MAY 2008 & NOVEMBER 2018',
    transitionSubheading: 'Two Stationary Landers — Zero Wheels, Deep Discoveries',
    timeTravelDisclaimer:
      'Geographical & Structural Note: Phoenix (68.22° N Arctic) and InSight (4.5° N Equatorial Elysium Planitia) are both STATIONARY LANDERS—neither ever drove!',
    accentColor: '#22d3ee',
    badgeTitle: 'ARCTIC ICE EXPLORER — PHOENIX',
    secondaryBadgeTitle: 'MARSQUAKE SCIENTIST — INSIGHT',
    briefingSummary: [
      'Unlike rovers, Phoenix (2008) and InSight (2018) had NO wheels—every discovery happened right from their fixed three-legged decks using precision robotic arms.',
      'Phoenix dug into the Arctic soil of Vastitas Borealis to touch & bake subsurface water ice, while a decade later InSight placed the hyper-sensitive SEIS seismometer on Elysium Planitia to record 1,319 marsquakes and peer deep into Mars’s ~1,800 km molten core.'
    ],
    missionObjectives: [
      'Phoenix: Dig shallow Arctic soil at Vastitas Borealis, verify water ice by sublimation & TEGA heating, study soil perchlorates & weather.',
      'InSight: Deploy SEIS seismometer to detect marsquakes and measure the thickness/structure of crust, mantle, and core.',
      'InSight: Track planetary wobble with RISE radio experiment and attempt subsurface heat-flow probing with HP³ ("the mole").'
    ],
    teamAndProgram: [
      { name: 'Peter Smith (Univ. of Arizona) & Barry Goldstein (JPL)', role: 'Phoenix Principal Investigator & Project Manager' },
      { name: 'Bruce Banerdt (JPL) & Suzanne Smrekar (JPL)', role: 'InSight Principal Investigator & Deputy PI' },
      { name: 'MarCO-A & MarCO-B CubeSats', role: 'First deep-space CubeSats relaying InSight’s Nov 26, 2018 entry telemetry live' }
    ],
    keySpecs: [
      { label: 'Phoenix Launch / Landing', value: 'Aug 4, 2007 (Delta II) → May 25, 2008 23:38:38 UT • End: Nov 2, 2008' },
      { label: 'Phoenix Region & Arm', value: 'Vastitas Borealis (~68.22° N) • 2.35 m robotic arm • RAC, SSI, TEGA, MECA, Met' },
      { label: 'InSight Launch / Landing', value: 'May 5, 2018 (Atlas V-401 + MarCO-A/B) → Nov 26, 2018 11:52:59 AM PT' },
      { label: 'InSight Region & Arm', value: 'Elysium Planitia (~4.5° N) • 1.8 m arm • SEIS + Wind/Thermal Shield, HP³, RISE' },
      { label: 'Seismic Record', value: '1,319 marsquakes • 3-layer crust (25–40 km) • molten core (~1,800 km radius)' },
      { label: 'InSight Final Contact', value: 'Last signal Dec 15, 2022 • NASA declared mission end Dec 21, 2022' }
    ],
    hotspots: [
      {
        id: 'phx_arm_trench',
        label: 'Phoenix 2.35 m Arm & Dodo-Goldilocks Trench',
        shortTitle: 'Phoenix Arm',
        explanation: 'Scraped bright ice chunks exposed May 31, 2008; by June 19 chunks sublimated away—plus TEGA baked ice on July 31 to confirm H2O vapor!'
      },
      {
        id: 'phx_tega_meca',
        label: 'TEGA & MECA Chemistry Labs',
        shortTitle: 'TEGA & MECA',
        explanation: 'Baked and dissolved Arctic soil, discovering oxidizing perchlorate salts and confirming alkaline pH minerals + high-altitude laser snow!'
      },
      {
        id: 'ins_seis',
        label: 'InSight SEIS + Wind/Thermal Shield',
        shortTitle: 'SEIS Dome',
        explanation: 'Picked up by the 1.8 m arm and covered by a white dome shield; recorded 1,319 marsquakes and even subtle Martian wind vibrations.'
      },
      {
        id: 'ins_hp3',
        label: 'HP³ Heat Flow Probe ("The Mole")',
        shortTitle: 'HP³ Mole',
        explanation: 'Honest Engineering Challenge: Intended to hammer ~5 m deep, unexpected clumpy duricrust soil prevented traction, stopping shallowly despite arm pushes.'
      },
      {
        id: 'ins_rise',
        label: 'RISE Radio Science Antennas',
        shortTitle: 'RISE X-Band',
        explanation: 'Tracked Mars’s tiny rotational wobble (nutation) to measure the liquid metallic core’s size (~1,800 km).'
      }
    ],
    timeline: [
      { date: 'Aug 4, 2007 → May 25, 2008', title: 'Phoenix Arctic Arrival', detail: 'Launched on Delta II; MRO HiRISE snapped Phoenix descending on parachute into Vastitas Borealis (23:38:38 UT).' },
      { date: 'May 31 – Jul 31, 2008', title: 'Dodo-Goldilocks Ice & TEGA Confirmation', detail: 'Sublimation vanished bright ice by Jun 19; TEGA confirmed water ice Jul 31; perchlorates & falling snow detected.' },
      { date: 'Nov 2, 2008', title: 'Phoenix Arctic Winter Loss', detail: 'Shortening sunlight and encroaching CO2 dry-ice frost ended Phoenix operations.' },
      { date: 'May 5 → Nov 26, 2018', title: 'InSight & MarCO CubeSats Arrive', detail: 'Atlas V-401 launch; landed Elysium Planitia 11:52:59 AM PT as MarCO-A/B relayed data live.' },
      { date: '2019–2022', title: '1,319 Marsquakes & HP³ Lessons', detail: 'SEIS mapped Mars’s 3-layer crust (25–40 km), mantle & ~1,800 km molten core; HP³ mole could not reach 5 m.' },
      { date: 'Dec 15 / Dec 21, 2022', title: 'InSight Concludes', detail: 'Dust blanketing solar wings silenced lander Dec 15; NASA announced mission end Dec 21, 2022.' }
    ],
    narrationEn: {
      briefing:
        'Explore two stationary robotic geologists that never rolled a single centimeter—yet unlocked Mars’s frozen surface and molten heart! Chapter A visits 2008’s Arctic Phoenix; Chapter B enters 2018’s earthquake-listening InSight.',
      time_transition:
        'Jump between May 2008 at 68 degrees north in Vastitas Borealis and November 2018 at equatorial Elysium Planitia!',
      interactive_3d_lab:
        'Switch between Phoenix’s 2.35-meter ice-digging arm and InSight’s 1.8-meter arm that lifted SEIS onto the ground—plus see why HP³ ("the mole") struggled in unexpected sticky soil.',
      historical_sequence:
        'Watch Dodo-Goldilocks ice chunks sublimate into vapor over four days in 2008, then trigger InSight’s SEIS seismograph to feel one of 1,319 marsquakes!',
      science_discoveries:
        'Compare TEGA’s perchlorates and Arctic snow against InSight’s three-layer crust, silicate mantle, and ~1,800-kilometer molten core.',
      timeline_legacy:
        'Both solar landers fell silent to Mars’s seasons and dust—Phoenix in November 2008 and InSight in December 2022—after transforming Mars interior science.',
      quiz: 'Earn both badges—Arctic Ice Explorer (Phoenix) and Marsquake Scientist (InSight)!'
    },
    narrationHi: {
      briefing:
        'दो ऐसे स्थिर लैंडर से मिलें जिनमें एक भी पहिया नहीं था—फिर भी उन्होंने मंगल की बर्फ और अंदरूनी धड़कन खोज निकाली! अध्याय A: फीनिक्स (2008), अध्याय B: इनसाइट (2018)।',
      time_transition:
        'मई 2008 (आर्कटिक वास्टिटास बोरियालिस) और नवंबर 2018 (भूमध्यरेखीय एलिसियम प्लैनिशिया) के बीच स्विच करें।',
      interactive_3d_lab:
        'फीनिक्स का 2.35 मीटर खुदाई हाथ और इनसाइट का SEIS भूकंपमापी देखें—साथ ही जानें कि अनपेक्षित चिपचिपी मिट्टी के कारण HP³ "मोल" 5 मीटर गहराई तक क्यों नहीं जा सका।',
      historical_sequence:
        '2008 में डोडो-गोल्डीलॉक्स खाई की सफेद बर्फ का वाष्पीकरण (sublimation) देखें, और फिर इनसाइट के 1,319 मार्सक्वेक (मंगल भूकंप) का अनुभव करें!',
      science_discoveries:
        'फीनिक्स के पर्क्लोरेट और बर्फबारी की तुलना इनसाइट द्वारा खोजी गई 3-परत क्रस्ट (25–40 किमी), मेंटल और ~1,800 किमी पिघले कोर से करें।',
      timeline_legacy:
        'फीनिक्स नवंबर 2008 में आर्कटिक सर्दी और इनसाइट दिसंबर 2022 में सौर पैनलों पर धूल जमने से शांत हुए।',
      quiz: 'फीनिक्स और इनसाइट दोनों बैज जीतने के लिए 12 प्रश्नों की प्रश्नोत्तरी हल करें!'
    },
    learningSummary: [
      'Both Phoenix (2008) and InSight (2018) were stationary three-legged landers with robotic arms.',
      'Phoenix verified shallow water ice via sublimation + TEGA baking and discovered perchlorates & snow.',
      'InSight recorded 1,319 marsquakes, mapped a 25–40 km 3-layer crust & ~1,800 km molten core, while HP³ demonstrated real geotechnical challenges.'
    ],
    requiredLabActionLabel: 'Run Phoenix sublimation trench & inspect InSight 3-layer core cutaway',
    sources: [
      {
        title: 'NASA Phoenix Mars Lander & InSight Seismic Mission',
        publisher: 'NASA / JPL',
        url: 'https://science.nasa.gov/mission/insight/',
        missionOrProgram: 'Mars Scout & Discovery Programs'
      }
    ]
  },

  ingenuity: {
    id: 'ingenuity',
    category: 'mars',
    categoryLabel: 'Category 1 • Mars Exploration',
    missionEnvironment: 'mars_surface',
    resourceNumber: 'Resource 07',
    shortTitle: 'Ingenuity Mars Helicopter (2021–2024)',
    fullTitle: 'INGENUITY — FIRST POWERED AIRCRAFT FLIGHT ON ANOTHER PLANET',
    subtitle: 'Jezero Crater • 72 Flights in <1% Earth Air Density Beside Perseverance',
    eraBadge: '2021–2024 • JEZERO CRATER',
    transitionHeading: 'BACK TO APRIL 19, 2021',
    transitionSubheading: 'Wright Brothers Field, Jezero Crater — Perseverance & Ingenuity',
    timeTravelDisclaimer:
      'Post-Flight-72 Historical State: After rotor blade damage on January 18, 2024 (Flight 72), Ingenuity remains permanently stationary on Mars beside its Perseverance mission base. Proposed follow-ons like SkyFall remain unflown future concepts.',
    accentColor: '#10b981',
    badgeTitle: 'WRIGHT BROTHERS OF MARS — INGENUITY',
    briefingSummary: [
      'Tucked neatly under Perseverance’s belly on launch (July 30, 2020) and touchdown (February 18, 2021), the 1.8-kilogram Ingenuity helicopter lowered gently onto Jezero Crater in March 2021.',
      'On April 19, 2021, Ingenuity lifted 3 meters above "Wright Brothers Field"—achieving the first powered, controlled aerodynamic flight on another planet despite Martian air being less than 1% as dense as Earth’s sea-level air.'
    ],
    missionObjectives: [
      'Demonstrate powered controlled aerodynamic flight in <1% Earth atmospheric density (~2,400–2,537+ RPM counter-rotating blades).',
      'Survive frigid -90°C Jezero nights on solar-charged Li-ion batteries.',
      'After the 5-flight Technology Demo, assist Perseverance as an operational aerial scout across rocky ridges and dunes.',
      'Push flight software, autonomous hazard avoidance, altitude (24 m), and ground speed (10 m/s) limits across 72 flights.'
    ],
    teamAndProgram: [
      { name: 'MiMi Aung (JPL)', role: 'Ingenuity Project Manager (Technology Demonstration)' },
      { name: 'Håvard Grip & Teddy Tzanetos (JPL)', role: 'Chief Pilot & Extended Team Lead' },
      { name: 'Perseverance (Mars 2020) Relay Team', role: 'Base communication & belly deployment partner' }
    ],
    keySpecs: [
      { label: 'Arrival & First Flight', value: 'Launch Jul 30, 2020 → Landed Feb 18, 2021 → Flight 1: Apr 19, 2021' },
      { label: 'Mass & Rotor Span', value: '1.8 kg • ~1.2 m (4 ft) dual carbon-fiber counter-rotating blades' },
      { label: 'Design vs Achieved', value: '~90 s / ~350 W design • 5 m planned ceiling vs 24 m achieved!' },
      { label: 'Atmospheric Density', value: '<1% of Earth’s surface density' },
      { label: '72-Flight Totals', value: '128.8 flight min • 17 km distance • 24 m max alt • 10 m/s max speed' },
      { label: 'Final Flight & End', value: 'Flight 72 Jan 18, 2024 (rotor damage on sandy ripples) → Formal end Jan 25, 2024' }
    ],
    hotspots: [
      {
        id: 'ing_rotors',
        label: '1.2 m Counter-Rotating Coaxial Rotors',
        shortTitle: 'Dual Rotors',
        explanation: 'Two ultra-stiff carbon-fiber blades spinning in opposite directions (~2,500+ RPM) bite enough thin CO2 air to overcome Mars’s 3.71 m/s² gravity.'
      },
      {
        id: 'ing_solar',
        label: 'Top Solar Panel & Mast',
        shortTitle: 'Solar Array',
        explanation: 'Charged six Li-ion batteries directly above the upper rotor—roughly two-thirds of daily energy kept the electronics warm overnight!'
      },
      {
        id: 'ing_fuselage',
        label: 'Insulated Electronics Box & Cameras',
        shortTitle: 'Body + Cams',
        explanation: 'Downward black-and-white navigation camera tracked surface motion; 13 MP color horizon camera captured scouting vistas.'
      },
      {
        id: 'ing_legs',
        label: '4 Springy Carbon Landing Legs',
        shortTitle: '4 Legs',
        explanation: 'Absorbed touchdown loads and rested stationary after Flight 72 damaged one or more rotor blade tips.'
      },
      {
        id: 'ing_percy',
        label: 'Perseverance Rover Base Station',
        shortTitle: 'Perseverance Link',
        explanation: 'Served as launch carrier until March 2021 drop-off and radio relay between Ingenuity and Earth.'
      }
    ],
    timeline: [
      { date: 'Jul 30, 2020 → Feb 18, 2021', title: 'Cruise & Jezero Crater Touchdown', detail: 'Carried under Perseverance’s belly; dropped onto Mars terrain in March 2021.' },
      { date: 'Apr 19, 2021', title: 'Wright Brothers Moment (Flight 1)', detail: 'Hovered 3 meters for 39.1 seconds—first powered aerodynamic flight beyond Earth.' },
      { date: '2021–2022', title: 'Operations Scouting (Flights 6–33)', detail: 'Scouted Séítah dunes, cliffs, and river delta routes ahead of Perseverance.' },
      { date: '2022–Jan 18, 2024', title: '72 Flights Complete', detail: 'Reached 24 m altitude, 10 m/s speed, 17 km distance, and 128.8 flight minutes total.' },
      { date: 'Jan 18 / Jan 25, 2024', title: 'Flight 72 Rotor Damage & Completion', detail: 'Featureless sand dunes disrupted optical navigation on Flight 72 landing, damaging rotor blades; formally retired Jan 25, 2024 (stationary on Mars).' }
    ],
    narrationEn: {
      briefing:
        'Welcome to Jezero Crater! Hitched underneath Perseverance’s belly rode a 1.8-kilogram daring experiment: Ingenuity, built to test whether blades could spin fast enough to fly in Mars’s ultra-thin air.',
      time_transition:
        'Stepping into April 19, 2021 at Wright Brothers Field! Less than one percent of Earth’s sea-level air density surrounds these two 1.2-meter carbon blades.',
      interactive_3d_lab:
        'Inspect Ingenuity’s solar panel, coaxial counter-rotating rotors, insulated avionics box, and four slender legs beside its Perseverance rover partner.',
      historical_sequence:
        'Test our simplified lift simulator to feel why Martian rotors need high RPM, and trace all three phases of Ingenuity’s astonishing 72 flights!',
      science_discoveries:
        'Planned for five short flights and five meters altitude, Ingenuity flew 72 times for 128.8 minutes across 17 kilometers, reaching 24 meters high and 10 meters per second!',
      timeline_legacy:
        'On January 18, 2024—Flight 72—smooth featureless sand caused a hard landing that damaged its rotor blades. Ingenuity now rests proudly stationary on Mars, inspiring future concepts like SkyFall.',
      quiz: 'Test your aerodynamics and 72-flight history of the Ingenuity Mars Helicopter!'
    },
    narrationHi: {
      briefing:
        'जेज़ेरो क्रेटर में स्वागत है! पर्सिवियरेंस रोवर के नीचे 1.8 किलोग्राम का हेलीकॉप्टर इनजेन्यूटी (Ingenuity) आया था—यह जांचने कि क्या मंगल की बेहद पतली हवा में उड़ान संभव है।',
      time_transition:
        '19 अप्रैल 2021 — "राइट ब्रदर्स फील्ड" पर ऐतिहासिक क्षण! पृथ्वी के मुकाबले 1% से भी कम हवा के घनत्व में उड़ान की तैयारी।',
      interactive_3d_lab:
        'इनजेन्यूटी के सोलर पैनल, 1.2 मीटर के विपरीत घूमने वाले रोटर ब्लेड और 4 हल्के पैरों को पर्सिवियरेंस रोवर के पास देखें।',
      historical_sequence:
        'हमारे सरलीकृत लिफ्ट सिम्युलेटर से जानें कि पतली हवा में हाई RPM क्यों ज़रूरी है, और 72 ऐतिहासिक उड़ानों के तीनों चरण देखें!',
      science_discoveries:
        'सिर्फ 5 उड़ानों के लिए बना इनजेन्यूटी 72 बार उड़ा—कुल 128.8 मिनट, 17 किमी दूरी, 24 मीटर अधिकतम ऊंचाई और 10 मी/सेकंड रफ्तार!',
      timeline_legacy:
        '18 जनवरी 2024 (उड़ान 72) पर रेत की लैंडिंग में रोटर ब्लेड क्षतिग्रस्त होने के बाद यह मंगल पर स्थायी रूप से स्थिर विश्राम कर रहा है। SkyFall अभी केवल भविष्य का कॉन्सेप्ट है।',
      quiz: 'इनजेन्यूटी हेलीकॉप्टर की उड़ान और 72 मिशनों की प्रश्नोत्तरी हल करें!'
    },
    learningSummary: [
      'Ingenuity achieved 72 powered Martian flights (128.8 min, 17 km, 24 m max alt, 10 m/s max speed) despite <1% Earth air density.',
      'On Jan 18, 2024 (Flight 72), rotor damage ended flights; Ingenuity remains stationary beside Perseverance.',
      'Future Mars rotorcraft concepts (such as SkyFall) remain unflown engineering proposals.'
    ],
    requiredLabActionLabel: 'Test thin-atmosphere lift simulator & review 3 phases of 72 flights',
    sources: [
      {
        title: 'Ingenuity Mars Helicopter Flight Log & Summary',
        publisher: 'NASA / JPL',
        url: 'https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/',
        missionOrProgram: 'Mars 2020 / Technology Demonstration'
      }
    ]
  },

  dawn: {
    id: 'dawn',
    category: 'outer_solar_system',
    categoryLabel: 'Category 2 • Outer Solar System Exploration — Beyond Mars',
    missionEnvironment: 'deep_space_orbit',
    isOrbiterOrFlybyOnly: true,
    neverLandsNote: 'Orbiter ONLY — Dawn NEVER landed on Mars, Vesta, or Ceres. After hydrazine depletion in 2018 it stays in silent permanent Ceres orbit.',
    resourceNumber: 'Resource 05',
    shortTitle: 'Dawn: Vesta & Ceres Orbiter (2007–2018)',
    fullTitle: 'DAWN — ION-POWERED TIME MACHINE TO VESTA & CERES',
    subtitle: 'Main Asteroid Belt Orbiter Only • Never Lands • Xenon Ion Propulsion',
    eraBadge: '2007–2018 • VESTA & CERES',
    transitionHeading: 'BEYOND MARS — ASTEROID BELT CRUISE',
    transitionSubheading: 'Dawn Orbiter: Mars Gravity Assist → Vesta (2011) → Ceres (2015)',
    timeTravelDisclaimer:
      'Orbiter Only Notice: Dawn carried zero landers and NEVER touched down on Vesta or Ceres; it remains peacefully parked in unpowered orbit around dwarf planet Ceres.',
    accentColor: '#38bdf8',
    badgeTitle: 'ASTEROID BELT ION NAVIGATOR — DAWN',
    briefingSummary: [
      'Launched September 27, 2007 on a Delta II Heavy, NASA’s Dawn became the first spacecraft ever to enter orbit around TWO extraterrestrial bodies beyond Earth: giant protoplanet Vesta and dwarf planet Ceres.',
      'Powered by three ultra-efficient xenon ion thrusters (plus hydrazine RCS for fine pointing), Dawn used a February 17, 2009 Mars gravity assist to spiral out to Vesta (2011–2012) and then depart Vesta’s orbit for Ceres (2015–2018)!'
    ],
    missionObjectives: [
      'Demonstrate deep-space xenon ion propulsion capable of entering, studying, and escaping orbit around one world to orbit a second world.',
      'Compare dry, rocky protoplanet Vesta against ice/salt-rich dwarf planet Ceres as preserved "embryos" of Solar System formation.',
      'Map Vesta’s giant Rheasilvia impact basin and verify its link to Earth’s HED meteorites.',
      'Investigate Ceres’s Occator Crater bright carbonate salts and Ahuna Mons cryovolcanism while protecting Ceres via planetary protection in stable high orbit.'
    ],
    teamAndProgram: [
      { name: 'Christopher Russell (UCLA)', role: 'Dawn Principal Investigator' },
      { name: 'Marc Rayman (JPL)', role: 'Chief Engineer & Mission Director' },
      { name: 'NASA Discovery Program', role: 'Framing Camera, VIR Spectrometer, GRaND Gamma/Neutron Detector' }
    ],
    keySpecs: [
      { label: 'Launch', value: 'September 27, 2007 (Delta II Heavy)' },
      { label: 'Propulsion', value: '3 Xenon Ion Thrusters (0–60 mph in ~4 days gentle acceleration) + Hydrazine RCS' },
      { label: 'Mars Gravity Assist', value: 'February 17, 2009 (Flyby slingshot—never landed on Mars!)' },
      { label: 'Vesta Orbit', value: 'July 2011 – September 2012 (Triaxial rocky body, Rheasilvia Basin)' },
      { label: 'Ceres Orbit', value: 'March 6, 2015 – November 1, 2018 (Dwarf planet, Occator Crater, Ahuna Mons)' },
      { label: 'Mission End', value: 'Hydrazine depleted Oct 31 / Nov 1, 2018 → permanent silent orbit around Ceres (does not crash)' }
    ],
    hotspots: [
      {
        id: 'dawn_ion',
        label: '3 Xenon Ion Thrusters (Blue Plasma)',
        shortTitle: 'Ion Thrusters',
        explanation: 'Electrically accelerated ionized xenon gas gently but continuously—taking ~4 days to accelerate 0–60 mph while using a fraction of chemical rocket fuel!'
      },
      {
        id: 'dawn_solar',
        label: '20 m Giant Solar Wings',
        shortTitle: 'Solar Wings',
        explanation: 'Massive photovoltaic wings gathered faint sunlight far out in the Asteroid Belt to generate kilowatts of electricity for the xenon ion engines.'
      },
      {
        id: 'dawn_science',
        label: 'Framing Camera, VIR & GRaND',
        shortTitle: 'Science Suite',
        explanation: 'Mapped high-res elevation, surface minerals/salts, and elemental composition down to ~1 m below Vesta and Ceres from orbit.'
      },
      {
        id: 'dawn_rcs',
        label: 'Hydrazine Attitude Thrusters',
        shortTitle: 'Hydrazine RCS',
        explanation: 'Small chemical thrusters kept Dawn’s dish pointed at Earth after reaction wheels degraded; their depletion Oct 31 / Nov 1, 2018 ended mission control.'
      }
    ],
    timeline: [
      { date: 'Sep 27, 2007', title: 'Delta II Heavy Launch', detail: 'Ignited xenon ion engines to spiral outward from Earth orbit.' },
      { date: 'Feb 17, 2009', title: 'Mars Gravity Assist', detail: 'Passed Mars solely to bend trajectory and gain orbital inclination toward the Asteroid Belt.' },
      { date: 'Jul 2011 – Sep 2012', title: 'Vesta Orbit Operations', detail: 'Studied Rheasilvia Basin (~500 km wide + central peak), equatorial chasms, iron core, and HED meteorite origin.' },
      { date: 'Mar 6, 2015', title: 'Ceres Orbit Insertion', detail: 'First spacecraft ever to orbit a dwarf planet (~940 km diameter).' },
      { date: '2015–2018', title: 'Occator Bright Spots & Ahuna Mons', detail: 'Revealed sodium carbonate salts erupted by briny fluids and cryovolcanic mountain Ahuna Mons.' },
      { date: 'Oct 31 / Nov 1, 2018', title: 'Hydrazine Depletion', detail: 'Entered permanent unpowered high orbit around Ceres where planetary protection prevents crash for decades+.' }
    ],
    narrationEn: {
      briefing:
        'Now we leave Mars completely behind and cruise into the Outer Solar System—the Main Asteroid Belt! Meet Dawn: an ion-powered orbiter that never landed anywhere, yet orbited TWO different worlds.',
      time_transition:
        'Following Dawn’s graceful blue xenon spiral past Mars on February 17, 2009 toward Vesta and dwarf planet Ceres!',
      interactive_3d_lab:
        'Toggle Dawn’s glowing blue xenon ion plume! Even though thrust feels lighter than a sheet of paper, running continuously lets Dawn accelerate from zero to sixty miles per hour in roughly four days with extraordinary fuel efficiency.',
      historical_sequence:
        'Trace Dawn’s trajectory from Earth through its Mars gravity assist, into Vesta’s orbit in 2011, and onward to Ceres in 2015.',
      science_discoveries:
        'Compare Vesta’s rocky, potato-like crust, giant Rheasilvia crater, and Earth HED meteorite match against spherical Ceres, Occator’s bright sodium carbonate salts, and cryovolcano Ahuna Mons.',
      timeline_legacy:
        'When Dawn’s attitude hydrazine ran dry around October 31 to November 1, 2018, the spacecraft remained safely in silent, permanent orbit around Ceres—never crashing.',
      quiz: 'Test your knowledge of Dawn’s ion propulsion, Mars gravity assist, Vesta, and Ceres!'
    },
    narrationHi: {
      briefing:
        'अब हम मंगल से आगे मुख्य क्षुद्रग्रह बेल्ट (Asteroid Belt) में चलते हैं! मिलिए डॉन (Dawn) से—एक आयन-चालित ऑर्बिटर जो कभी कहीं उतरा नहीं, लेकिन दो अलग-अलग दुनियाओं (वेस्टा और सेरेस) की परिक्रमा करने वाला पहला यान बना।',
      time_transition:
        '17 फरवरी 2009 के मंगल ग्रेविटी असिस्ट से होते हुए वेस्टा और बौने ग्रह सेरेस की कक्षा तक की यात्रा देखें!',
      interactive_3d_lab:
        'डॉन के नीले ज़ेनॉन (Xenon) आयन थ्रस्टर देखें! यह बहुत धीमा लेकिन लगातार धक्का देता है और लगभग 4 दिनों में 0–60 mph की रफ्तार पकड़ लेता है।',
      historical_sequence:
        'पृथ्वी से मंगल ग्रेविटी असिस्ट, फिर वेस्टा (जुलाई 2011–सितंबर 2012) और फिर सेरेस की कक्षा (6 मार्च 2015) का मार्ग देखें।',
      science_discoveries:
        'वेस्टा के रियोसिल्विया बेसिन व लोहे के कोर की तुलना सेरेस के ओकाटर क्रेटर के चमकदार नमक और अहुना मॉन्स क्रायोवोल्केनो से करें।',
      timeline_legacy:
        '31 अक्टूबर / 1 नवंबर 2018 को हाइड्राज़ीन ईंधन खत्म होने के बाद डॉन बिना टकराए सेरेस की शांत स्थायी कक्षा में परिक्रमा कर रहा है।',
      quiz: 'डॉन मिशन, आयन प्रणोदन, वेस्टा और सेरेस पर क्विज़ हल करें!'
    },
    learningSummary: [
      'Dawn is strictly an ORBITER (never landed), powered by 3 xenon ion thrusters + hydrazine RCS.',
      'Used a Feb 17, 2009 Mars gravity assist to orbit both rocky Vesta (HED meteorites, Rheasilvia) and icy/salty Ceres (Occator salts, Ahuna Mons).',
      'Depleted hydrazine on Oct 31 / Nov 1, 2018; stays permanently in silent orbit around Ceres.'
    ],
    requiredLabActionLabel: 'Toggle Ion Propulsion & compare Vesta vs Ceres interiors',
    sources: [
      {
        title: 'NASA Dawn Mission Overview — Vesta & Ceres',
        publisher: 'NASA / JPL',
        url: 'https://science.nasa.gov/mission/dawn/',
        missionOrProgram: 'Discovery Program'
      }
    ]
  },

  pioneer: {
    id: 'pioneer',
    category: 'outer_solar_system',
    categoryLabel: 'Category 2 • Outer Solar System Exploration — Beyond Mars',
    missionEnvironment: 'deep_space_flyby',
    isOrbiterOrFlybyOnly: true,
    neverLandsNote: 'Outer Solar System Flybys ONLY — Pioneer 10 & 11 flew past the Asteroid Belt, Jupiter, and Saturn and NEVER landed on or orbited Mars!',
    resourceNumber: 'Resource 06',
    shortTitle: 'Pioneer 10 & 11: Beyond Mars (1972–1979+)',
    fullTitle: 'PIONEER 10 & 11 — PATHFINDERS TO JUPITER, SATURN & THE STARS',
    subtitle: 'Outer Solar System Flybys Only • Pioneer Golden Plaque • First Through Asteroid Belt',
    eraBadge: '1972–1995/2003 • OUTER SOLAR SYSTEM',
    transitionHeading: 'BEYOND MARS — OUTER GIANT FLYBY ERA (1972–1979)',
    transitionSubheading: 'Pioneer 10 (Jupiter 1973) & Pioneer 11 (Jupiter 1974 + Saturn 1979)',
    timeTravelDisclaimer:
      'Strict Category Separation: Pioneer 10 and Pioneer 11 belong strictly to Outer Solar System Exploration beyond Mars. They never landed anywhere.',
    accentColor: '#f59e0b',
    badgeTitle: 'OUTER PLANETS TRAILBLAZER — PIONEER 10 & 11',
    briefingSummary: [
      'Before Voyager 1 and 2, twin spin-stabilized scouts Pioneer 10 (1972) and Pioneer 11 (1973) proved spacecraft could survive the Main Asteroid Belt and Jupiter’s ferocious radiation belts.',
      'Pioneer 10 zipped ~130,354 km above Jupiter’s clouds on Dec 4, 1973, while Pioneer 11 swung closer (~42,500 km) in Dec 1974 to catapult across the Solar System for humanity’s FIRST flyby of Saturn on September 1, 1979! Both carry the iconic Pioneer Golden Plaque.'
    ],
    missionObjectives: [
      'Navigate safely across the Asteroid Belt for the first time in history (1972–1973).',
      'Survive intense Jovian radiation to photograph Jupiter and Galilean moons Callisto, Ganymede, and Europa.',
      'Pioneer 11: Use Jupiter’s gravity to bend sharply inward/across toward Saturn’s rings and moons (discovering Saturn’s F ring!).',
      'Carry Earth’s Golden Plaque message encoding human scale, our Sun’s pulsar address, and Solar System origin into interstellar space.'
    ],
    teamAndProgram: [
      { name: 'Charles F. Hall (NASA Ames)', role: 'Pioneer Project Manager' },
      { name: 'Carl Sagan, Frank Drake & Linda Salzman Sagan', role: 'Creators of the Pioneer Golden Plaque' },
      { name: 'NASA Ames Research Center / TRW', role: 'Spin-stabilized spacecraft & SNAP-19 RTG design' }
    ],
    keySpecs: [
      { label: 'Pioneer 10 Launch & Mass', value: 'March 2, 1972 (Atlas Centaur) • 258 kg • High-gain 2.74 m dish' },
      { label: 'Pioneer 10 Jupiter Flyby', value: 'Dec 4, 1973 (02:26 UT) • ~130,354 km • ~126,000 km/h' },
      { label: 'Pioneer 10 Outer / End', value: 'Neptune orbit Jun 13, 1983 • Routine end Mar 31, 1997 • Last signal Jan 23, 2003' },
      { label: 'Pioneer 11 Launch & Mass', value: 'April 6, 1973 • 258.5 kg • First Saturn flyby!' },
      { label: 'Pioneer 11 Jupiter / Saturn', value: 'Jupiter Dec 3, 1974 (~42,500 km) → Saturn Sep 1, 1979 (~20,900 km; F ring)' },
      { label: 'Pioneer 11 Outer / End', value: 'Neptune orbit Feb 23, 1990 • Ops end Sep 30, 1995 • Last data Nov 24, 1995' }
    ],
    hotspots: [
      {
        id: 'pio_dish',
        label: '2.74 m High-Gain Dish Antenna',
        shortTitle: '2.74 m Dish',
        explanation: 'Spin-stabilized parabolic dish beamed weak radio whispers back across billions of kilometers—heard until 2003 from Pioneer 10!'
      },
      {
        id: 'pio_rtgs',
        label: '4× SNAP-19 RTGs on Dual Booms',
        shortTitle: 'RTG Booms',
        explanation: 'Because sunlight at Jupiter/Saturn is 25–100× weaker than at Earth, twin booms held plutonium-238 RTGs clear of instruments.'
      },
      {
        id: 'pio_plaque',
        label: 'Pioneer Golden Plaque (Engraved Plate)',
        shortTitle: 'Golden Plaque',
        explanation: 'Gold-anodized aluminum message showing hydrogen 21-cm transition, 14-pulsar map to our Sun, Solar System diagram, and human figures.'
      },
      {
        id: 'pio_mag',
        label: '6-Meter Magnetometer Boom',
        shortTitle: 'Magnetometer',
        explanation: 'Measured Jupiter’s immense magnetosphere and helped reveal Saturn’s magnetic field is aligned almost directly with its spin axis.'
      }
    ],
    timeline: [
      { date: 'Mar 2, 1972 & Jul 15, 1972–Feb 1973', title: 'Pioneer 10 Launch & Asteroid Belt', detail: 'Became the first spacecraft ever to traverse the Asteroid Belt safely.' },
      { date: 'Dec 4, 1973 (02:26 UT)', title: 'Pioneer 10 Jupiter Flyby', detail: 'Passed ~130,354 km from cloud tops at ~126,000 km/h, imaging Jupiter, Callisto, Ganymede, and Europa.' },
      { date: 'Apr 6, 1973 & Dec 3, 1974', title: 'Pioneer 11 Launch & Polar Jupiter Slingshot', detail: 'Skimmed ~42,500 km above Jupiter to fling across the Solar System toward Saturn.' },
      { date: 'Sep 1, 1979', title: 'First-Ever Saturn Flyby (~20,900 km)', detail: 'Pioneer 11 discovered Saturn’s F ring and a new moon while surviving the ring plane.' },
      { date: 'Jun 13, 1983 & Feb 23, 1990', title: 'Beyond Neptune’s Orbit', detail: 'Both spacecraft crossed Neptune’s orbital distance on trajectories leaving the Solar System.' },
      { date: 'Nov 24, 1995 & Jan 23, 2003', title: 'Final Signals to Earth', detail: 'Pioneer 11 last data Nov 24, 1995; Pioneer 10 routine ops ended Mar 31, 1997 with a final faint carrier ping Jan 23, 2003.' }
    ],
    narrationEn: {
      briefing:
        'Leaving Mars far behind, we journey into the Outer Solar System with Pioneer 10 and Pioneer 11—humanity’s brave 1970s pathfinders that opened Jupiter, Saturn, and interstellar space!',
      time_transition:
        'Following the Outer Giant Flyby Era (1972 to 1979): remember, Pioneer 10 and 11 were high-speed flyby scouts, never landing anywhere.',
      interactive_3d_lab:
        'Rotate the spin-stabilized Pioneer spacecraft, inspect its four plutonium RTG power booms, and decode all four sections of the engraved Pioneer Golden Plaque!',
      historical_sequence:
        'Compare Pioneer 10’s 1973 Jupiter run and Neptune crossing against Pioneer 11’s bold 1974 Jupiter slingshot to achieve humanity’s first encounter with Saturn on September 1, 1979!',
      science_discoveries:
        'Click each symbol on the 3D Golden Plaque decoder: the hydrogen hyperfine clock, the 14-pulsar galactic star map pointing to our Sun, the Solar System trajectory, and human scale figures.',
      timeline_legacy:
        'Pioneer 11 sent final data in November 1995 and Pioneer 10 whispered its last faint signal on January 23, 2003—still drifting silently toward the stars today.',
      quiz: 'Test your knowledge of Pioneer 10, Pioneer 11, Saturn’s F ring, and the Golden Plaque!'
    },
    narrationHi: {
      briefing:
        'मंगल से बहुत दूर, बाहरी सौर मंडल में मिलिए पायनियर 10 और पायनियर 11 से—1970 के दशक के वे अग्रदूत यान जिन्होंने पहली बार क्षुद्रग्रह बेल्ट, बृहस्पति और शनि के रहस्य खोले!',
      time_transition:
        'बाहरी ग्रहों की फ्लाईबाई यात्रा (1972–1979): पायनियर 10 और 11 केवल फ्लाईबाई यान थे, वे कभी कहीं उतरे नहीं।',
      interactive_3d_lab:
        'पायनियर यान का 2.74 मीटर डिश एंटीना, चार SNAP-19 RTG बूम और गोल्डन प्लाक (Golden Plaque) के चारों हिस्सों को डिकोड करें।',
      historical_sequence:
        'पायनियर 10 (बृहस्पति, 4 दिसंबर 1973) और पायनियर 11 (शनि का पहला ऐतिहासिक फ्लाईबाई, 1 सितंबर 1979 — F रिंग की खोज) की तुलना करें!',
      science_discoveries:
        'पायनियर गोल्डन प्लाक डिकोडर में हाइड्रोजन घड़ी, 14 पल्सर तारा मानचित्र, सौर मंडल पथ और मानव आकृतियाँ देखें।',
      timeline_legacy:
        'पायनियर 11 ने नवंबर 1995 और पायनियर 10 ने 23 जनवरी 2003 को आखिरी संकेत भेजा—आज भी ये अंतरतारकीय अंतरिक्ष में आगे बढ़ रहे हैं।',
      quiz: 'पायनियर 10, पायनियर 11 और गोल्डन प्लाक पर अपनी समझ की जांच करें!'
    },
    learningSummary: [
      'Pioneer 10 & 11 belong strictly to Outer Solar System Exploration beyond Mars (flyby missions only).',
      'Pioneer 10 (1972) crossed the Asteroid Belt and flew by Jupiter (Dec 4, 1973); last signal Jan 23, 2003.',
      'Pioneer 11 (1973) used Jupiter (Dec 1974) for the first Saturn flyby (Sep 1, 1979), discovering the F ring; both carry the Pioneer Golden Plaque.'
    ],
    requiredLabActionLabel: 'Decode all 4 regions of the Pioneer Golden Plaque & compare P10/P11 flybys',
    sources: [
      {
        title: 'NASA Pioneer 10 & Pioneer 11 Missions',
        publisher: 'NASA / Ames Research Center',
        url: 'https://science.nasa.gov/mission/pioneer-10/',
        missionOrProgram: 'Pioneer Outer Planets Program'
      }
    ]
  },

  kepler: {
    id: 'kepler',
    category: 'deep_space',
    categoryLabel: 'Category 3 • Deep Space Astronomy & Exoplanet Exploration',
    missionEnvironment: 'heliocentric_observatory',
    isOrbiterOrFlybyOnly: true,
    neverLandsNote: 'Heliocentric Space Telescope ONLY — Kepler NEVER orbited Earth, never orbited Mars, and never physically visited exoplanets.',
    resourceNumber: 'Resource 08',
    shortTitle: 'Kepler Space Telescope (2009–2018)',
    fullTitle: 'KEPLER — THE SPACE TELESCOPE THAT REVEALED THOUSANDS OF EXOPLANETS',
    subtitle: 'Earth-Trailing Heliocentric Orbit • Transit Photometry • K2 Sunlight-Balanced Rescue',
    eraBadge: '2009–2018 • CYGNUS / LYRA & K2',
    transitionHeading: 'DEEP SPACE OBSERVATORY — HELIOCENTRIC ORBIT',
    transitionSubheading: 'Staring at >150,000 Stars Toward Cygnus & Lyra (2009–2018)',
    timeTravelDisclaimer:
      'Observatory Boundary Rule: Kepler trailed Earth around the Sun (~heliocentric orbit) measuring tiny starlight dips—it never visited or landed on any exoplanet.',
    accentColor: '#a855f7',
    badgeTitle: 'EXOPLANET HUNTER — KEPLER & K2',
    briefingSummary: [
      'Before Kepler launched on March 6, 2009, humanity knew only a small handful of confirmed exoplanets—nobody knew if Earth-sized worlds around other stars were common or rare.',
      'By staring continuously at over 150,000 stars in Cygnus and Lyra from an Earth-trailing heliocentric orbit, Kepler watched tiny repeating starlight dips ("transits")—revealing over 2,600 confirmed planets across more than 500,000 stars studied through the ingenious K2 mission!'
    ],
    missionObjectives: [
      'Continuously measure brightness of ~150,000+ Cygnus/Lyra stars looking for tiny repeating planetary transit dips.',
      'Determine how common rocky, super-Earth, sub-Neptune, and habitable-zone planets are in our Milky Way.',
      'Rescue spacecraft pointing in 2013–2014 via the K2 mission using solar radiation pressure after two reaction wheels failed.',
      'Retire safely in stable heliocentric orbit after fuel exhaustion on October 30, 2018.'
    ],
    teamAndProgram: [
      { name: 'William Borucki (NASA Ames)', role: 'Kepler Principal Investigator & Transit Pioneer' },
      { name: 'Natalie Batalha & Jessie Dotson', role: 'Mission & K2 Project Scientists' },
      { name: 'Ball Aerospace / JPL / LASP', role: 'Photometer, Sunlight-Balance K2 Control & Flight Ops' }
    ],
    keySpecs: [
      { label: 'Launch & Orbit', value: 'March 6, 2009 → Earth-trailing Heliocentric Orbit around the Sun' },
      { label: 'Primary Field', value: '~150,000+ stars stared at continuously in Cygnus & Lyra' },
      { label: 'Detection Method', value: 'Transit Photometry — repeating periodic brightness dip ΔF ≈ (Rp/R*)²' },
      { label: 'K2 Rescue (2014–2018)', value: 'May 2013 second reaction wheel failed → sunlight-pressure balance across 19 campaigns' },
      { label: 'Legacy Totals', value: '>2,600 confirmed exoplanets • >500,000 total stars observed' },
      { label: 'Retirement', value: 'Fuel depleted Oct 30, 2018 → powered down in safe heliocentric orbit' }
    ],
    hotspots: [
      {
        id: 'kep_aperture',
        label: '0.95 m Schmidt Aperture & Sunshade',
        shortTitle: 'Telescope Shade',
        explanation: 'Sunshade baffled stray sunlight from reaching the 1.4 m primary mirror inside its heliocentric barrel.'
      },
      {
        id: 'kep_ccd',
        label: '95-Megapixel 42-CCD Focal Plane',
        shortTitle: 'Photometer CCD',
        explanation: 'Never designed for pretty deep-space photos—optimized to measure brightness precision to ~20 parts per million!'
      },
      {
        id: 'kep_wheels',
        label: 'Reaction Wheels & K2 Sunlight Balance',
        shortTitle: 'Reaction Wheels',
        explanation: 'When 2 of 4 reaction wheels failed by May 2013, engineers aimed solar wings symmetrically into sunlight so solar photon pressure balanced roll for 19 K2 campaigns!'
      },
      {
        id: 'kep_solar',
        label: 'Fixed Angled Solar Panels',
        shortTitle: 'Solar Wings',
        explanation: 'Powered telescope electronics and acted as delicate "solar sails" during K2 ecliptic observations.'
      }
    ],
    timeline: [
      { date: 'Mar 6, 2009', title: 'Delta II Launch to Heliocentric Orbit', detail: 'Entered an Earth-trailing orbit around the Sun away from Earth’s glare and shadow.' },
      { date: '2010–2011', title: 'Early Milestone Exoplanets', detail: 'Kepler-4b through Kepler-8b, multi-planet TTV system Kepler-9, and tight 6-planet Kepler-11!' },
      { date: 'May 2013', title: 'Second Reaction Wheel Failure', detail: 'Lost 3-axis fine pointing with reaction wheels, threatening the primary Cygnus stare.' },
      { date: '2014–2018', title: 'The Ingenious K2 Rescue (19 Campaigns)', detail: 'Used sunlight photon pressure + remaining wheels + thrusters to survey 19 strips around the ecliptic.' },
      { date: 'Oct 30, 2018', title: 'Fuel Depletion & Heliocentric Retirement', detail: 'Shut down transmitters safely in heliocentric orbit after discovering >2,600 exoplanets and observing >500,000 stars.' }
    ],
    narrationEn: {
      briefing:
        'Welcome to Deep Space Astronomy! Unlike rovers or outer-planet probes, the Kepler Space Telescope orbited the Sun trailing behind Earth—measuring tiny starlight dips to prove planets outnumber stars in our galaxy!',
      time_transition:
        'Aiming at more than 150,000 stars in Cygnus and Lyra from Kepler’s quiet heliocentric orbit.',
      interactive_3d_lab:
        'Inspect Kepler’s angled sunshade, ninety-five-megapixel photometer detector, and the reaction wheels whose 2013 failure sparked the brilliant K2 sunlight-balancing rescue!',
      historical_sequence:
        'Use our interactive 3D Transit Method simulator: watch a distant planet cross its star face and produce a repeating U-shaped dip on the live Light-Curve graph!',
      science_discoveries:
        'Test the Habitable Zone slider across M, K, and G stars! Remember a vital scientific rule: sitting inside the habitable zone shows liquid water is possible—it is NOT proof of alien life.',
      timeline_legacy:
        'By October 30, 2018, Kepler ran out of fuel after scanning over 500,000 stars across 19 K2 campaigns and revealing over 2,600 confirmed worlds beyond our Solar System.',
      quiz: 'Master exoplanet transits, light curves, K2 sunlight pointing, and the habitable zone!'
    },
    narrationHi: {
      briefing:
        'डीप स्पेस एस्ट्रोनॉमी में आपका स्वागत है! केपलर स्पेस टेलीस्कोप ने न तो किसी ग्रह पर लैंड किया और न ही किसी एक्सोप्लैनेट की यात्रा की—यह सूर्य की कक्षा में रहते हुए दूर के तारों की रोशनी मापता रहा।',
      time_transition:
        'सिग्नस (Cygnus) और लायरा (Lyra) तारामंडल के 1,50,000 से अधिक तारों की लगातार निगरानी।',
      interactive_3d_lab:
        'केपलर का सनशेड, 95-मेगापिक्सेल फोटोमीटर और रिएक्शन व्हील देखें—जिनके मई 2013 में खराब होने के बाद सूर्य के प्रकाश के दबाव से K2 मिशन बचाया गया!',
      historical_sequence:
        'हमारा लाइव 3D ट्रांज़िट सिम्युलेटर चलाएं: देखें कि जब कोई एक्सोप्लैनेट अपने तारे के सामने से गुज़रता है, तो लाइट-कर्व (Light Curve) में हल्की गिरावट कैसे दिखती है!',
      science_discoveries:
        'हैबिटेबल ज़ोन (Habitable Zone) स्लाइडर आज़माएं—याद रहे, हैबिटेबल ज़ोन का अर्थ केवल तरल पानी की संभावना है, जीवन का पक्का सबूत नहीं!',
      timeline_legacy:
        '30 अक्टूबर 2018 को ईंधन समाप्त होने से पहले केपलर ने 5,00,000 से अधिक तारों का अध्ययन कर 2,600 से ज़्यादा एक्सोप्लैनेट खोजे।',
      quiz: 'ट्रांज़िट मेथड, K2 मिशन और हैबिटेबल ज़ोन पर 12 प्रश्नों की प्रश्नोत्तरी हल करें!'
    },
    learningSummary: [
      'Kepler is a heliocentric deep-space telescope (stared at >150,000 Cygnus/Lyra stars via Transit Photometry).',
      'K2 used sunlight pressure to stabilize pointing after May 2013 reaction-wheel loss across 19 campaigns.',
      'Observed >500,000 stars and confirmed >2,600 exoplanets; habitable zone indicates temperature potential for liquid water, NOT proof of life.'
    ],
    requiredLabActionLabel: 'Run Transit Light-Curve Simulator & inspect Habitable Zone boundaries',
    sources: [
      {
        title: 'NASA Kepler & K2 Exoplanet Archive',
        publisher: 'NASA Ames / IPAC',
        url: 'https://science.nasa.gov/mission/kepler/',
        missionOrProgram: 'Discovery Program — Exoplanets'
      }
    ]
  },

  curiosity: {
    id: 'curiosity',
    category: 'mars',
    categoryLabel: 'Category 1 • Mars Exploration',
    missionEnvironment: 'mars_surface',
    resourceNumber: 'Resource 09',
    shortTitle: 'Curiosity Rover (2012–Present)',
    fullTitle: 'CURIOSITY — NUCLEAR MOBILE GEOLOGY LAB IN GALE CRATER',
    subtitle: 'Sky Crane Touchdown • ChemCam Laser • Mount Sharp Ancient Lakebed Habitability',
    eraBadge: '2012–PRESENT • GALE CRATER',
    transitionHeading: 'AUGUST 2012 • GALE CRATER',
    transitionSubheading: 'Seven Minutes of Terror & Rocket Sky Crane Touchdown',
    timeTravelDisclaimer:
      'Historical Mission Reconstruction: Inspect Curiosity’s nuclear MMRTG rover architecture and Gale Crater lakebed stratigraphy as active science continues up Mount Sharp.',
    accentColor: '#f59e0b',
    badgeTitle: 'MARS HABITABILITY LAB — CURIOSITY',
    briefingSummary: [
      'Landing on August 5, 2012 PDT (August 6 UTC) via a rocket-powered Sky Crane, NASA’s 899-kg nuclear Curiosity rover transformed Mars science from "follow the water" to "could Mars have ever supported microbial life?"',
      'Drilling Yellowknife Bay mudstones and climbing Aeolis Mons (Mount Sharp), Curiosity’s onboard SAM and CheMin laboratories detected ancient freshwater lakes, organic carbon molecules, and key chemical building blocks of habitability.'
    ],
    missionObjectives: [
      'Prove rocket Sky Crane precision landing for a heavy (~899 kg) nuclear-powered Mars rover.',
      'Use ChemCam laser spectroscopy to vaporize distant rock dust and read element emission spectra.',
      'Analyze drilled rock powder with SAM (Sample Analysis at Mars) and CheMin X-ray diffraction.',
      'Determine whether ancient Gale Crater lakes offered habitable neutral-pH water, organics, and energy.'
    ],
    teamAndProgram: [
      { name: 'John Grotzinger & Ashwin Vasavada', role: 'Mars Science Laboratory Project Scientists (Caltech / JPL)' },
      { name: 'Adam Steltzner', role: 'EDL Sky Crane Lead Engineer (NASA JPL)' },
      { name: 'Los Alamos / CNES / GSFC', role: 'ChemCam Laser & SAM Analytical Suite' }
    ],
    keySpecs: [
      { label: 'Landing Date', value: 'August 5, 2012 PDT (August 6, 2012 UTC) in Gale Crater' },
      { label: 'Landing System', value: 'Supersonic parachute + rocket Sky Crane tether (~899 kg rover mass)' },
      { label: 'Power Source', value: 'MMRTG plutonium-238 radioisotope battery (works day, night & dust storms)' },
      { label: 'Flagship Instruments', value: 'ChemCam LIBS laser, SAM gas chromatograph, CheMin, Mastcam, RAD' },
      { label: 'Primary Discovery', value: 'Ancient neutral-pH lakes & preserved organic molecules in Gale mudstones' }
    ],
    hotspots: [
      {
        id: 'cur_mmrtg',
        label: 'MMRTG Nuclear Power Source',
        shortTitle: 'MMRTG Battery',
        explanation: 'Finned plutonium-238 radioisotope generator supplying continuous heat and electricity independent of sunlight or dust.'
      },
      {
        id: 'cur_chemcam',
        label: 'ChemCam Laser & Mastcam Head',
        shortTitle: 'ChemCam Mast',
        explanation: 'Fires infrared laser pulses up to 7 m away, turning rock spots into glowing plasma to read elemental fingerprints.'
      },
      {
        id: 'cur_sam',
        label: 'SAM & CheMin Internal Belly Lab',
        shortTitle: 'SAM Organic Lab',
        explanation: 'Chute-fed miniature laboratory inside the body that bakes drilled rock powder to identify organic carbon, sulfur, and isotopes.'
      },
      {
        id: 'cur_arm',
        label: '2.1 m Robotic Arm, Drill & MAHLI',
        shortTitle: 'Percussion Drill',
        explanation: 'Drills centimeters into ancient layered mudstones and images grain-scale textures with MAHLI.'
      }
    ],
    timeline: [
      { date: 'Nov 26, 2011', title: 'Atlas V Launch from Cape Canaveral', detail: 'Carried the 899-kg Mars Science Laboratory toward Gale Crater.' },
      { date: 'Aug 5/6, 2012', title: 'First Sky Crane Touchdown ("Bradbury Landing")', detail: 'Hovering jetpack lowered Curiosity gently onto its 6 aluminum wheels.' },
      { date: '2013', title: 'Yellowknife Bay Ancient Lakebed Discovery', detail: 'First drilled Mars mudstone revealed clay minerals formed in drinkable-pH freshwater.' },
      { date: '2014–Present', title: 'Climbing Mount Sharp (Aeolis Mons)', detail: 'Mapping billion-year climate transitions from wet clay beds to drier sulfate ridges, still exploring today!' }
    ],
    narrationEn: {
      briefing:
        'Meet Curiosity—humanity’s SUV-sized nuclear chemistry laboratory in Gale Crater! Lowered gently on cables by a hovering Sky Crane in August 2012, Curiosity proved ancient Mars once held long-lasting habitable lakes.',
      time_transition:
        'Stepping back to August 2012 in Gale Crater as Sky Crane retro-rockets kick up red dust beneath Curiosity.',
      interactive_3d_lab:
        'Inspect Curiosity’s finned plutonium MMRTG battery, the ChemCam rock-zapping laser on its mast, and the drill arm sampling Mount Sharp!',
      historical_sequence:
        'Watch Curiosity’s rover arm extend toward Gale Crater bedrock and pulse its ChemCam laser onto ancient layered mudstones.',
      science_discoveries:
        'Explore Yellowknife Bay clays, organic carbon molecules found by SAM, and how Mount Sharp records Mars drying out over billions of years.',
      timeline_legacy:
        'More than a decade after landing, Curiosity is still climbing Mount Sharp—and its Sky Crane architecture carried Perseverance to Jezero Crater!',
      quiz: 'Test your mastery of Curiosity, Sky Crane, MMRTG power, ChemCam, and Gale Crater habitability!'
    },
    narrationHi: {
      briefing:
        'मिलिए क्यूरोसिटी (Curiosity) रोवर से—गेल क्रेटर में काम करने वाली परमाणु-संचालित चलती-फिरती रसायन प्रयोगशाला! अगस्त 2012 में स्काई-क्रेन से उतरकर इसने साबित किया कि प्राचीन मंगल की झीलों में जीवन के अनुकूल वातावरण था।',
      time_transition:
        'अगस्त 2012, गेल क्रेटर: स्काई-क्रेन के रॉकेटों ने क्यूरोसिटी को पहली बार सीधे मंगल की धरती पर उतारा।',
      interactive_3d_lab:
        'क्यूरोसिटी की MMRTG परमाणु बैटरी, चट्टानों पर लेज़र दागने वाला ChemCam कैमरा और माउंट शार्प ड्रिल भुजा देखें!',
      historical_sequence:
        'क्यूरोसिटी की रोबोटिक भुजा और ChemCam लेज़र पल्स को गेल क्रेटर की परतदार चट्टानों का विश्लेषण करते देखें।',
      science_discoveries:
        'जानिए कैसे SAM प्रयोगशाला ने प्राचीन झील की मिट्टी में कार्बनिक अणु और चिकनी मिट्टी (Clays) खोजे।',
      timeline_legacy:
        'दस से अधिक वर्षों बाद भी क्यूरोसिटी माउंट शार्प पर चढ़ाई कर रही है, और इसी के स्काई-क्रेन डिज़ाइन ने पर्सिवियरेंस को उतारा!',
      quiz: 'क्यूरोसिटी, स्काई-क्रेन और गेल क्रेटर के विज्ञान पर प्रश्नोत्तरी हल करें!'
    },
    learningSummary: [
      'Curiosity (2012–Present) proved ancient Gale Crater freshwater lakes possessed ingredients for habitability.',
      'Carries a plutonium MMRTG power source and Sky Crane EDL heritage later reused for Perseverance.',
      'ChemCam vaporizes rock dust with a laser while SAM & CheMin analyze drilled samples internally.'
    ],
    requiredLabActionLabel: 'Inspect Curiosity’s ChemCam laser, MMRTG, and Mount Sharp sample drill',
    sources: [
      {
        title: 'NASA Mars Science Laboratory (Curiosity)',
        publisher: 'NASA / JPL-Caltech',
        url: 'https://science.nasa.gov/mission/msl-curiosity/',
        missionOrProgram: 'Mars Science Laboratory'
      }
    ]
  }
};

export function getMarsProximityNarration(id: MarsAndSpaceResourceId, lang: 'en' | 'hi' = 'en'): string {
  const res = MARS_AND_SPACE_RESOURCES[id];
  const isHi = lang === 'hi';
  if (id === 'dawn' || id === 'pioneer' || id === 'kepler') {
    if (isHi) {
      return `ऊपर आकाश में देखिए—यह ${res.shortTitle} का होलोग्राफिक प्रदर्शन है। यह यान कभी मंगल पर नहीं उतरा, बल्कि ${
        id === 'dawn'
          ? 'क्षुद्रग्रह बेल्ट में वेस्ता और सेरेस की परिक्रमा करता रहा।'
          : id === 'pioneer'
          ? 'बाहरी सौर मंडल में बृहस्पति और शनि के पास से गुजरा।'
          : 'सूर्य की कक्षा से दूर के एक्सोप्लैनेट खोजता रहा।'
      } विस्तार से देखने के लिए E दबाएं।`;
    }
    return `Look up into the sky—this holographic station projects ${res.shortTitle}. Note that this spacecraft never landed on Mars; ${
      id === 'dawn'
        ? 'Dawn orbited Vesta and Ceres in the Asteroid Belt.'
        : id === 'pioneer'
        ? 'Pioneer 10 and 11 flew past Jupiter and Saturn toward interstellar space.'
        : 'Kepler orbited the Sun searching over 150,000 stars for exoplanets.'
    } Press E to explore its 3D lab.`;
  }
  if (isHi) {
    return `${res.shortTitle} क्षेत्र में आपका स्वागत है। ${res.narrationHi.briefing} मिशन लैब खोलने के लिए E दबाएं।`;
  }
  return `Approaching ${res.shortTitle}. ${res.narrationEn.briefing} Press E to open its 3D lab.`;
}
