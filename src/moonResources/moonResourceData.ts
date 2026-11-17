import {
  AlsepInstrumentSpec,
  AlsepStationSummary,
  LrvMissionProfile,
  LrvPhysicsState,
  MoonChronologicalEvent,
  MoonQuizQuestion,
  MoonResourceConfig,
  MoonResourceId,
  MoonResourceSiteSpec,
  SurveyorProgramEntry
} from './moonResourceTypes';

/**
 * Spatial allocation for the 4 Historical Moon Exploration Sites across the lunar surface.
 * Kept strictly separated from each other and from SHUTTLE_PADS.moon (-16, 10).
 */
export const MOON_RESOURCE_SITES: Record<MoonResourceId, MoonResourceSiteSpec> = {
  apollo_lm: {
    id: 'apollo_lm',
    x: 12,
    z: -12,
    approachOffset: [0, 6.2],
    interactionRadius: 7.4,
    clearRadius: 9.0,
    year: '1969',
    statusBadge: 'LANDED ON MOON',
    shortTitle: 'APOLLO 11 — EAGLE',
    subtitle: 'Descent Launch Platform & EASEP',
    accentColor: '#f59e0b',
    markerHeight: 4.5
  },
  lunar_rover: {
    id: 'lunar_rover',
    x: -18,
    z: -22,
    approachOffset: [4.2, 6.8],
    interactionRadius: 7.6,
    clearRadius: 9.5,
    year: '1971',
    statusBadge: 'DEPLOYED ON MOON',
    shortTitle: 'LUNAR ROVING VEHICLE — APOLLO 15',
    subtitle: 'Electric Moon Buggy (Apollo 15–17)',
    accentColor: '#38bdf8',
    markerHeight: 4.8
  },
  alsep: {
    id: 'alsep',
    x: 24,
    z: 16,
    approachOffset: [-4.5, 5.5],
    interactionRadius: 7.4,
    clearRadius: 8.5,
    year: '1969',
    statusBadge: 'DEPLOYED ON MOON',
    shortTitle: 'APOLLO 12 — ALSEP',
    subtitle: '6 Instruments & SNAP-27 RTG',
    accentColor: '#10b981',
    markerHeight: 5.0
  },
  surveyor: {
    id: 'surveyor',
    x: 40,
    z: 26,
    approachOffset: [-4.0, 4.0],
    interactionRadius: 7.0,
    clearRadius: 8.0,
    year: '1967',
    statusBadge: 'LANDED ON MOON',
    shortTitle: 'SURVEYOR 3 LANDER',
    subtitle: 'Uncrewed Robotic Pioneer',
    accentColor: '#c084fc',
    markerHeight: 4.3
  }
};

export const APOLLO_12_INTREPID_SITE = { x: 15, z: 10 };

export function getMoonSiteCoordinates(
  resourceId: MoonResourceId
): { x: number; z: number; yaw: number } {
  const site = MOON_RESOURCE_SITES[resourceId];
  const x = site.x + site.approachOffset[0];
  const z = site.z + site.approachOffset[1];
  const yaw = Math.atan2(site.x - x, site.z - z);
  return { x, z, yaw };
}

export const MOON_CHRONOLOGICAL_TIMELINE: MoonChronologicalEvent[] = [
  {
    id: 'timeline_surveyor_3',
    resourceId: 'surveyor',
    year: '1967',
    dateLabel: 'April 20, 1967',
    statusBadge: 'LANDED ON MOON',
    title: 'Surveyor 3 Robotic Lander',
    regionLabel: 'Oceanus Procellarum (~3° S, 23.41° W)',
    summary:
      'Bounced three times before touching down inside a crater. Took 6,326 television photos and dug 4 lunar soil trenches.',
    coordinates: [MOON_RESOURCE_SITES.surveyor.x, MOON_RESOURCE_SITES.surveyor.z],
    accentColor: '#c084fc'
  },
  {
    id: 'timeline_apollo_11',
    resourceId: 'apollo_lm',
    year: '1969',
    dateLabel: 'July 20, 1969',
    statusBadge: 'LANDED ON MOON',
    title: 'Apollo 11 — Eagle LM & EASEP',
    regionLabel: 'Mare Tranquillitatis (Sea of Tranquility)',
    summary:
      'First crewed lunar landing. Eagle’s Descent Stage remained on the Moon as the launch platform for the returning Ascent Stage.',
    coordinates: [MOON_RESOURCE_SITES.apollo_lm.x, MOON_RESOURCE_SITES.apollo_lm.z],
    accentColor: '#f59e0b'
  },
  {
    id: 'timeline_apollo_12',
    resourceId: 'alsep',
    year: '1969',
    dateLabel: 'November 19, 1969',
    statusBadge: 'DEPLOYED ON MOON',
    title: 'Apollo 12 — Intrepid & ALSEP Station',
    regionLabel: 'Oceanus Procellarum (~180 m from Surveyor 3)',
    summary:
      'Six nuclear-powered scientific instruments powered by the SNAP-27 RTG transmitted continuous lunar data to Earth until September 30, 1977.',
    coordinates: [MOON_RESOURCE_SITES.alsep.x, MOON_RESOURCE_SITES.alsep.z],
    accentColor: '#10b981'
  },
  {
    id: 'timeline_apollo_15_lrv',
    resourceId: 'lunar_rover',
    lrvMissionId: 'apollo_15',
    year: '1971',
    dateLabel: 'July 30, 1971',
    statusBadge: 'DEPLOYED ON MOON',
    title: 'Apollo 15 — Lunar Roving Vehicle (LRV-1)',
    regionLabel: 'Hadley–Apennine (Falcon LM)',
    summary:
      'First crewed electric rover driven on another world (~27.9 km traversed). Unfolded from Falcon’s descent stage quadrant bay.',
    coordinates: [MOON_RESOURCE_SITES.lunar_rover.x, MOON_RESOURCE_SITES.lunar_rover.z],
    accentColor: '#38bdf8'
  },
  {
    id: 'timeline_apollo_16_lrv',
    resourceId: 'lunar_rover',
    lrvMissionId: 'apollo_16',
    year: '1972',
    dateLabel: 'April 20, 1972',
    statusBadge: 'DEPLOYED ON MOON',
    title: 'Apollo 16 — Lunar Roving Vehicle (LRV-2)',
    regionLabel: 'Descartes Highlands (Orion LM)',
    summary:
      'Driven across steep ancient highland craters including North Ray and Stone Mountain (~26.7 km traversed).',
    coordinates: [MOON_RESOURCE_SITES.lunar_rover.x, MOON_RESOURCE_SITES.lunar_rover.z],
    accentColor: '#38bdf8'
  },
  {
    id: 'timeline_apollo_17_lrv',
    resourceId: 'lunar_rover',
    lrvMissionId: 'apollo_17',
    year: '1972',
    dateLabel: 'December 11, 1972',
    statusBadge: 'DEPLOYED ON MOON',
    title: 'Apollo 17 — Lunar Roving Vehicle (LRV-3)',
    regionLabel: 'Taurus–Littrow Valley (Challenger LM)',
    summary:
      'Longest Apollo surface drive (~35.9 km) and final crewed Moon mission, discovering volcanic orange glass beads at Shorty Crater.',
    coordinates: [MOON_RESOURCE_SITES.lunar_rover.x, MOON_RESOURCE_SITES.lunar_rover.z],
    accentColor: '#38bdf8'
  }
];

export const MOON_RESOURCES: Record<MoonResourceId, MoonResourceConfig> = {
  apollo_lm: {
    id: 'apollo_lm',
    resourceNumber: 'Moon Resource 01',
    shortTitle: 'Apollo Lunar Modules',
    fullTitle: 'APOLLO LUNAR MODULES: THE MACHINE THAT LANDED HUMANS ON THE MOON',
    subtitle: 'The Descent Stage That Became a Lunar Launch Platform',
    eraBadge: 'JULY 1969 • APOLLO 11',
    transitionYearHeading: 'BACK TO JULY 1969',
    transitionMissionHeading: 'APOLLO 11 — THE FIRST CREWED LUNAR LANDING',
    accentColor: '#f59e0b',
    referenceImage: '/assets/aistudio/image__3__d71cd898.png',
    referenceCaption: 'NASA Archival Reference: Apollo 11 Lunar Module Eagle & EASEP at Tranquility Base (1969).',
    earthBriefingIntro: [
      'Apollo 11 was the first crewed mission to land humans on the Moon in July 1969.',
      'The Lunar Module (LM) was the dedicated spacecraft built only to fly in space—carrying astronauts from lunar orbit down to the Moon and back into lunar orbit.',
      'It had two separate stages: a lower Descent Stage to land safely, and an upper Ascent Stage to carry the crew back up.',
      'The Descent Stage was never meant to fly back to Earth. It stayed behind on the Moon and acted as the physical launch platform for the Ascent Stage.',
      'The Ascent Stage carried Neil Armstrong and Buzz Aldrin back into lunar orbit to dock with Michael Collins aboard Columbia.'
    ],
    crew: [
      { name: 'Neil Armstrong', role: 'Commander', spacecraft: 'Eagle (Lunar Module)' },
      { name: 'Buzz Aldrin', role: 'Lunar Module Pilot', spacecraft: 'Eagle (Lunar Module)' },
      { name: 'Michael Collins', role: 'Command Module Pilot', spacecraft: 'Columbia (Command & Service Module)' }
    ],
    spacecraftPair: [
      {
        name: 'Columbia — Command & Service Module (CSM)',
        role: 'Remained in lunar orbit with Michael Collins, and later carried all three astronauts safely back to Earth.'
      },
      {
        name: 'Eagle — Lunar Module (LM-5)',
        role: 'Separated from Columbia in lunar orbit to land Armstrong and Aldrin at the Sea of Tranquility.'
      }
    ],
    timeline: [
      {
        date: 'July 16, 1969',
        title: 'Apollo 11 Launched from Earth',
        detail: 'Saturn V lifted off from Kennedy Space Center Launch Complex 39A carrying Columbia, Eagle, and three astronauts.'
      },
      {
        date: 'July 20, 1969',
        title: 'Eagle Landed on the Moon',
        detail: 'Eagle separated from Columbia and touched down at the Sea of Tranquility (Mare Tranquillitatis) at 20:17:40 UT.'
      },
      {
        date: 'July 20, 1969 EDT',
        title: 'Armstrong Stepped onto the Moon',
        detail: 'In U.S. Eastern Daylight Time (10:56 PM EDT), Neil Armstrong became the first human to step onto the lunar surface.',
        timezoneNote: 'July 20 EDT corresponds to 02:56 UT on July 21 in Universal Time—different calendar dates refer to different time zones.'
      },
      {
        date: 'July 21, 1969 UT',
        title: 'Surface Activities & EASEP Deployment',
        detail: 'Armstrong and Aldrin deployed the Apollo 11 EASEP experiments and Laser Ranging Retroreflector, and collected 21.55 kg of lunar samples.'
      },
      {
        date: 'July 21, 1969 UT',
        title: 'Ascent Stage Lifted Off from the Descent Stage',
        detail: 'At 17:54 UT, Eagle’s upper Ascent Stage ignited its engine and lifted off using the lower Descent Stage as a lunar launch platform.'
      },
      {
        date: 'July 22, 1969 UT',
        title: 'Ascent Stage Jettisoned After Rendezvous',
        detail: 'After Armstrong, Aldrin, and samples transferred into Columbia, Eagle’s Ascent Stage was jettisoned in lunar orbit. Its eventual lunar impact site is not definitively known.'
      }
    ],
    hotspots: [
      {
        id: 'lm_legs',
        label: 'Landing Legs & Footpads',
        stageTag: 'descent',
        worldOffset: [-3.4, 0.9, 3.4],
        shortTitle: 'Landing Legs & Footpads',
        explanation:
          'Four shock-absorbing legs with wide round footpads supported Eagle safely after touchdown on the dusty lunar regolith.'
      },
      {
        id: 'lm_descent_engine',
        label: 'Descent Engine (LMDE)',
        stageTag: 'descent',
        worldOffset: [0, 0.7, 0],
        shortTitle: 'Descent Engine',
        explanation:
          'This throttleable rocket engine slowed Eagle down during powered descent so it could land gently on the Sea of Tranquility.'
      },
      {
        id: 'lm_equipment',
        label: 'Descent Storage & EASEP Bay',
        stageTag: 'descent',
        worldOffset: [2.6, 1.8, -1.8],
        shortTitle: 'Equipment Storage',
        explanation:
          'Fuel tanks, oxidizer tanks, batteries, and scientific instruments like EASEP were packed inside the octagonal descent bays.'
      },
      {
        id: 'lm_platform',
        label: 'Interstage Launch Platform',
        stageTag: 'descent',
        worldOffset: [0, 2.7, 2.2],
        shortTitle: 'Launch Platform',
        explanation:
          'The descent stage remained permanently behind on the Moon. Its upper deck acted as the physical launch pad from which the ascent stage lifted off!'
      },
      {
        id: 'lm_ascent',
        label: 'Ascent Cabin & Engine',
        stageTag: 'ascent',
        worldOffset: [0, 4.4, 0],
        shortTitle: 'Ascent Stage (Upper Section)',
        explanation:
          'The upper pressurized crew cabin carried Neil Armstrong and Buzz Aldrin off the Moon using its own ascent engine and RCS thrusters back to Columbia.'
      }
    ],
    narrationScripts: {
      earth_briefing:
        'Welcome to Moon Resource One! Before you launch to the Moon, meet Eagle—the two-stage Apollo 11 Lunar Module that landed humans on the Moon in 1969.',
      time_transition:
        'Set your mission clock back to July 1969. You are viewing an educational reconstruction of Apollo 11 at the Sea of Tranquility.',
      interactive_3d_lab:
        'Rotate and split the two stages of Eagle. Notice how the lower descent stage held the landing legs and descent engine, while the upper ascent stage carried the crew cabin.',
      historical_sequence:
        'Watch Eagle separate from Columbia, ignite its descent engine, and settle gently onto Mare Tranquillitatis. Next, witness the historic moment when only the upper ascent stage blasts off while the descent stage remains forever on the Moon!',
      surface_exploration:
        'Explore Tranquility Base on foot! Inspect the descent stage hotspots and test the passive Laser Ranging Retroreflector by bouncing a laser pulse from Earth.',
      quiz: 'Time for a quick knowledge check on Apollo 11’s two-stage Lunar Module and EASEP science.',
      completed:
        'Mission completed! You discovered why the Lunar Module needed two separate stages—one to land and stay as a launch platform, and one to fly back to lunar orbit.'
    },
    learningSummary: [
      "Apollo 11's Lunar Module Eagle had two distinct stages: Descent Stage and Ascent Stage.",
      'The Descent Stage slowed Eagle for touchdown and remained permanently on the Moon as a launch platform.',
      'The Ascent Stage carried Armstrong and Aldrin back to lunar orbit to dock with Michael Collins aboard Columbia.',
      'Apollo 11 deployed EASEP (distinct from later ALSEP stations) and the passive Laser Ranging Retroreflector.'
    ],
    sources: [
      {
        title: 'Apollo 11 Lunar Module / EASEP (NSSDCA 1969-059C)',
        publisher: 'NASA Space Science Data Coordinated Archive',
        url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C',
        missionOrProgram: 'Apollo 11'
      },
      {
        title: 'Apollo 11 Mission Overview',
        publisher: 'NASA History & Science',
        url: 'https://www.nasa.gov/mission/apollo-11/',
        missionOrProgram: 'Apollo 11'
      }
    ]
  },

  lunar_rover: {
    id: 'lunar_rover',
    resourceNumber: 'Moon Resource 02',
    shortTitle: 'Lunar Roving Vehicles',
    fullTitle: 'LUNAR ROVING VEHICLES — THE FIRST ELECTRIC CARS ON THE MOON',
    subtitle: 'The Electric Moon Buggies That Changed Lunar Exploration',
    eraBadge: '1971–1972 • APOLLO 15, 16 & 17',
    transitionYearHeading: 'BACK TO 1971',
    transitionMissionHeading: 'APOLLO 15 — THE FIRST LUNAR ROVER MISSION',
    accentColor: '#38bdf8',
    referenceImage: '/assets/aistudio/image__2__90ca326b.png',
    referenceCaption: 'NASA Archival Reference: Apollo 15 Lunar Module Falcon & Hadley–Apennine Exploration (1971).',
    earthBriefingIntro: [
      'NASA developed the Lunar Roving Vehicle (LRV)—nicknamed the Moon Buggy—so astronauts could travel much farther from their Lunar Module than walking allowed.',
      'Each LRV was a lightweight four-wheel electric vehicle powered by two 36-volt batteries, built to drive across airless, low-gravity lunar dust.',
      'It folded tightly into a storage bay on the Lunar Module descent stage, then unfolded like origami once astronauts reached the Moon.',
      'Three operational Lunar Roving Vehicles were driven on the Moon: one each on Apollo 15 (1971), Apollo 16 (1972), and Apollo 17 (1972)—never all together in one place!',
      'All three rovers were designed strictly for lunar exploration and remained parked permanently at their respective landing sites.'
    ],
    crew: [
      { name: 'David R. Scott', role: 'Commander (LRV Driver)', spacecraft: 'Apollo 15 LM Falcon (1971)' },
      { name: 'James B. Irwin', role: 'Lunar Module Pilot', spacecraft: 'Apollo 15 LM Falcon (1971)' },
      { name: 'Alfred M. Worden', role: 'Command Module Pilot', spacecraft: 'Apollo 15 CSM Endeavour (Lunar Orbit)' }
    ],
    timeline: [
      {
        date: 'July 26, 1971',
        title: 'Apollo 15 Launched from Earth',
        detail: 'First Apollo J-mission carrying an operational Lunar Roving Vehicle tucked inside LM Falcon.'
      },
      {
        date: 'July 30, 1971',
        title: 'Falcon Landed at Hadley–Apennine',
        detail: 'David Scott and James Irwin touched down near Hadley Rille and the Apennine Mountains.'
      },
      {
        date: 'July 31 – Aug 2, 1971',
        title: 'Three Apollo 15 Rover Excursions (~27.9 km)',
        detail: 'EVA 1 (~10.3 km), EVA 2 (~12.5 km, discovering the Genesis Rock), and EVA 3 (~5.1 km) along Hadley Rille, leaving LRV-1 on the Moon.'
      },
      {
        date: 'April 20, 1972',
        title: 'Apollo 16 LRV-2 at Descartes Highlands',
        detail: 'John Young and Charles Duke drove LRV-2 approximately 26.7 km exploring ancient lunar highlands while Thomas Mattingly orbited above.'
      },
      {
        date: 'December 11, 1972',
        title: 'Apollo 17 LRV-3 at Taurus–Littrow Valley',
        detail: 'Eugene Cernan and Harrison Schmitt drove LRV-3 approximately 35.9 km during the final crewed Apollo landing while Ronald Evans orbited above.'
      }
    ],
    hotspots: [
      {
        id: 'lrv_wheels',
        label: 'Four Wire-Mesh Motorized Wheels',
        stageTag: 'lrv',
        worldOffset: [-1.1, 0.35, 1.15],
        shortTitle: 'Four Hub-Motor Wheels',
        explanation:
          'Each of the four woven steel-wire wheels had its own 1/4-horsepower electric drive motor—no petrol engine needed because there is no air on the Moon!'
      },
      {
        id: 'lrv_batteries',
        label: 'Twin 36-Volt Silver-Zinc Batteries',
        stageTag: 'lrv',
        worldOffset: [0, 0.6, 1.25],
        shortTitle: 'Two 36V Batteries',
        explanation:
          'Two independent 36-volt non-rechargeable batteries sat up front. Either battery alone could power the entire rover back to safety!'
      },
      {
        id: 'lrv_steering',
        label: 'Front & Rear Dual Steering',
        stageTag: 'lrv',
        worldOffset: [1.1, 0.35, -1.15],
        shortTitle: 'Redundant Dual Steering',
        explanation:
          'Both the front and rear wheels steered together for tight crater turns—and if either steering motor failed, astronauts could disengage it and steer with the other.'
      },
      {
        id: 'lrv_controls',
        label: 'T-Handle Controller & Crew Seats',
        stageTag: 'lrv',
        worldOffset: [0, 0.9, 0.1],
        shortTitle: 'Astronaut Seats & T-Handle',
        explanation:
          'Instead of a steering wheel and pedals—too hard in bulky spacesuits—astronauts steered with a single central T-shaped hand controller!'
      },
      {
        id: 'lrv_comms',
        label: 'High-Gain Dish & TV Camera',
        stageTag: 'lrv',
        worldOffset: [0, 1.3, 0.9],
        shortTitle: 'Navigation & Communications',
        explanation:
          'A gold-mesh umbrella antenna sent live television and telemetry to Earth while a dead-reckoning gyro compass tracked distance back to the Lunar Module.'
      },
      {
        id: 'lrv_samples',
        label: 'Aft Sample & Tool Carrier',
        stageTag: 'lrv',
        worldOffset: [0, 0.85, -1.2],
        shortTitle: 'Geological Sample Rack',
        explanation:
          'The rear cargo rack held cameras, core tubes, scoops, and sealed sample bags like Apollo 15’s famous Genesis Rock.'
      }
    ],
    narrationScripts: {
      earth_briefing:
        'Imagine driving across the Moon! No roads, no petrol stations, and no air—just dust, craters, mountains, and an electric buggy that folded neatly onto the side of the Lunar Module.',
      time_transition:
        'Turn back the clock to July 1971. Apollo 15 Lunar Module Falcon has landed at Hadley-Apennine, ready to deploy humanity’s very first lunar car.',
      interactive_3d_lab:
        'Switch between Folded, Deploying, and Unfolded stages! Click the wheels, twin 36-volt batteries, front-and-rear steering, and T-handle controller.',
      historical_sequence:
        'Click Deploy Rover to watch LRV-1 unfold out of Falcon’s descent equipment bay, lower its wire wheels onto the regolith, and power up.',
      surface_exploration:
        'Climb aboard the Lunar Roving Vehicle! Drive carefully across Hadley Rille terrain, stay inside your Walkback Limit, collect lunar rock samples, and compare Apollo 15, 16, and 17.',
      quiz: 'Ready to test your Moon Buggy engineering and Apollo 15, 16, and 17 knowledge?',
      completed:
        'Mission completed! You mastered how three separate electric Lunar Roving Vehicles transformed lunar geology—and why each stayed parked forever on the Moon.'
    },
    learningSummary: [
      'Three operational electric Lunar Roving Vehicles were driven on the Moon: one each on Apollo 15, Apollo 16, and Apollo 17.',
      'Each four-wheel electric rover folded onto the Lunar Module descent stage and carried two astronauts with dual 36V batteries.',
      'Astronauts respected a strict Walkback Limit so they could safely walk back to the Lunar Module if a rover stopped working.',
      'Apollo 15 explored Hadley–Apennine (~27.9 km), Apollo 16 explored Descartes (~26.7 km), and Apollo 17 explored Taurus–Littrow (~35.9 km).'
    ],
    sources: [
      {
        title: 'Apollo 15 Lunar Module / ALSEP (NSSDCA 1971-063C)',
        publisher: 'NASA NSSDCA',
        url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C',
        missionOrProgram: 'Apollo 15'
      },
      {
        title: 'The Apollo Lunar Roving Vehicle',
        publisher: 'NASA NSSDCA',
        url: 'https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo_lrv.html',
        missionOrProgram: 'Apollo LRV'
      },
      {
        title: 'Apollo 15 Mission Page',
        publisher: 'NASA',
        url: 'https://www.nasa.gov/mission/apollo-15/',
        missionOrProgram: 'Apollo 15'
      }
    ]
  },

  alsep: {
    id: 'alsep',
    resourceNumber: 'Moon Resource 03',
    shortTitle: 'ALSEP Science Stations',
    fullTitle: 'ALSEP — THE SCIENTIFIC STATIONS LEFT BEHIND ON THE MOON',
    subtitle: 'The Scientific Stations That Continued Working After Astronauts Left the Moon',
    eraBadge: 'NOV 1969 – SEPT 1977 • APOLLO 12–17',
    transitionYearHeading: 'BACK TO NOVEMBER 1969',
    transitionMissionHeading: 'APOLLO 12 — THE FIRST FULL ALSEP STATION',
    accentColor: '#10b981',
    referenceImage: '/assets/aistudio/image__1__354a3423.png',
    referenceCaption: 'NASA Archival Reference: Apollo 12 Lunar Module Intrepid descending toward Oceanus Procellarum (1969).',
    earthBriefingIntro: [
      'Imagine leaving a full science laboratory on the Moon! You return safely to Earth, while your instruments keep measuring moonquakes, solar wind, and magnetic fields for years.',
      'Apollo 11 tested a smaller Early Apollo Scientific Experiments Package (EASEP). Beginning with Apollo 12 in November 1969, NASA deployed full long-lived ALSEP stations.',
      'Five ALSEP stations were installed across Apollo 12, 14, 15, 16, and 17—each powered day and night by a nuclear SNAP-27 Radioisotope Thermoelectric Generator (RTG).',
      'Apollo 12’s crew—Pete Conrad and Alan Bean—deployed six ALSEP instruments about 90 metres northwest of Lunar Module Intrepid in Oceanus Procellarum, and also visited nearby Surveyor 3.',
      'Many ALSEP instruments operated far longer than expected until NASA shut down the network on September 30, 1977.'
    ],
    crew: [
      { name: 'Charles "Pete" Conrad', role: 'Commander', spacecraft: 'Apollo 12 LM Intrepid' },
      { name: 'Alan L. Bean', role: 'Lunar Module Pilot', spacecraft: 'Apollo 12 LM Intrepid' },
      { name: 'Richard F. Gordon Jr.', role: 'Command Module Pilot', spacecraft: 'Apollo 12 CSM Yankee Clipper' }
    ],
    timeline: [
      {
        date: 'April 20, 1967',
        title: 'Surveyor 3 Landed in Oceanus Procellarum',
        detail: 'Uncrewed robotic lander arrived over two and a half years before Apollo 12.'
      },
      {
        date: 'November 14, 1969',
        title: 'Apollo 12 Launched from Earth',
        detail: 'Pete Conrad, Alan Bean, and Richard Gordon departed for Oceanus Procellarum.'
      },
      {
        date: 'November 19, 1969',
        title: 'Intrepid Landed & Deployed First Full ALSEP',
        detail: 'Astronauts positioned the ALSEP central station ~90 m NW of Intrepid and linked six scientific instruments to the SNAP-27 RTG—plus walked ~180 m to inspect Surveyor 3.'
      },
      {
        date: '1971 – 1972',
        title: 'Four More ALSEP Stations Deployed',
        detail: 'Apollo 14 (Fra Mauro), Apollo 15 (Hadley–Apennine), Apollo 16 (Descartes), and Apollo 17 (Taurus–Littrow) each carried tailored scientific instrument arrays.'
      },
      {
        date: 'September 30, 1977',
        title: 'End of ALSEP Operations',
        detail: 'NASA officially powered down the five ALSEP stations after nearly eight years of continuous lunar telemetry (though individual instruments varied in longevity).'
      }
    ],
    hotspots: [
      {
        id: 'alsep_central',
        label: 'ALSEP Central Station & Helical Antenna',
        stageTag: 'alsep',
        worldOffset: [0, 1.0, 0],
        shortTitle: 'Central Station & Earth Link',
        explanation:
          'Distributed DC power, collected science telemetry from every instrument over ribbon cables, received Earth commands, and beamed data back via its directional antenna.'
      },
      {
        id: 'alsep_snap27',
        label: 'SNAP-27 RTG Power Generator',
        stageTag: 'alsep',
        worldOffset: [-3.2, 0.7, 2.2],
        shortTitle: 'SNAP-27 RTG (~70 W DC)',
        explanation:
          'Used heat from radioactive decay of ~4 kg Plutonium-238 inside a ~17 kg finned generator to produce ~70 W at ~16 V DC—even through two-week freezing lunar nights!'
      },
      {
        id: 'alsep_pse',
        label: 'Passive Seismic Experiment (PSE)',
        stageTag: 'alsep',
        worldOffset: [4.2, 0.5, 2.4],
        shortTitle: 'Passive Seismic Experiment',
        explanation:
          'Detected moonquakes and meteorite vibrations so scientists could study the Moon’s crust, mantle, and deep internal layers.'
      },
      {
        id: 'alsep_lsm',
        label: 'Lunar Surface Magnetometer (LSM)',
        stageTag: 'alsep',
        worldOffset: [-4.5, 0.8, -3.1],
        shortTitle: 'Lunar Surface Magnetometer',
        explanation:
          'Three orthogonal fluxgate sensors on folding arms measured weak magnetic fields at the lunar surface and how solar wind interacted with the Moon.'
      },
      {
        id: 'alsep_sws',
        label: 'Solar Wind Spectrometer (SWS)',
        stageTag: 'alsep',
        worldOffset: [3.6, 0.5, -3.2],
        shortTitle: 'Solar Wind Spectrometer',
        explanation:
          'Measured energy and direction of solar electrons and protons streaming from the Sun onto the airless lunar surface.'
      },
      {
        id: 'alsep_side_ccig',
        label: 'SIDE & Cold Cathode Ion Gauge',
        stageTag: 'alsep',
        worldOffset: [-0.8, 0.5, -4.6],
        shortTitle: 'SIDE & CCIG Atmosphere Sensors',
        explanation:
          'SIDE measured low-energy positive ions near the surface while CCIG investigated the Moon’s ultra-thin exosphere gas density.'
      },
      {
        id: 'alsep_ldd',
        label: 'Lunar Dust Detector (LDD)',
        stageTag: 'alsep',
        worldOffset: [1.8, 0.6, 4.1],
        shortTitle: 'Lunar Dust Detector',
        explanation:
          'Tracked lunar dust accumulation, radiation damage to solar cells, reflected infrared energy, and surface temperatures.'
      }
    ],
    narrationScripts: {
      earth_briefing:
        'Imagine leaving a science laboratory on the Moon! Astronauts returned home, while ALSEP stations stayed behind for years—measuring moonquakes, solar wind, and lunar magnetism.',
      time_transition:
        'Jump back to November 1969! Apollo 12 Lunar Module Intrepid has landed at Oceanus Procellarum, about 180 metres from Surveyor 3.',
      interactive_3d_lab:
        'Inspect Apollo 12’s six ALSEP instruments, the central station, and the nuclear SNAP-27 RTG that turned Plutonium-238 decay heat into steady electrical power.',
      historical_sequence:
        'Click Deploy ALSEP to watch astronauts set up the central station 90 metres from Intrepid, connect each instrument, install the SNAP-27 fuel capsule, and beam telemetry back to Earth.',
      surface_exploration:
        'Walk across Oceanus Procellarum! Test each of Apollo 12’s six ALSEP instruments, visit historic Surveyor 3 nearby, and explore the five Apollo ALSEP stations on the Moon map.',
      quiz: 'Test your knowledge of ALSEP, SNAP-27 RTG, Apollo 12’s six instruments, and how EASEP differed from ALSEP!',
      completed:
        'Mission completed! Astronauts left the Moon, yet their ALSEP stations kept listening and transmitting science back to Earth until September 30, 1977.'
    },
    learningSummary: [
      'Apollo 11 used EASEP (simpler early experiments), while Apollo 12, 14, 15, 16, and 17 deployed full long-lived ALSEP stations.',
      'Apollo 12’s ALSEP at Oceanus Procellarum included six listed instruments: PSE, LSM, SWS, SIDE, CCIG, and LDD.',
      'The SNAP-27 RTG converted Plutonium-238 radioactive decay heat into ~70 W DC at ~16 V to run instruments through lunar night.',
      'The Laser Ranging Retroreflector was a separate passive experiment (Apollo 11, 14, 15)—not part of Apollo 12 ALSEP.',
      'NASA operated the five ALSEP stations until September 30, 1977.'
    ],
    sources: [
      {
        title: 'Apollo 12 Lunar Module / ALSEP (NSSDCA 1969-099C)',
        publisher: 'NASA NSSDCA',
        url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-099C',
        missionOrProgram: 'Apollo 12'
      },
      {
        title: 'ALSEP Arrays and Status (SP-4029)',
        publisher: 'NASA History',
        url: 'https://www.nasa.gov/wp-content/uploads/static/history/SP-4029/Apollo_18-31_ALSEP_Arrays_and_Status.htm',
        missionOrProgram: 'Apollo Program'
      }
    ]
  },

  surveyor: {
    id: 'surveyor',
    resourceNumber: 'Moon Resource 04',
    shortTitle: 'Surveyor 3 Robotic Pioneer',
    fullTitle: 'SURVEYOR — THE ROBOTIC PIONEERS OF THE MOON',
    subtitle: 'The Robotic Pioneers That Proved Humans Could Safely Land on the Moon',
    eraBadge: 'APRIL 1967 & NOV 1969 • SURVEYOR 3',
    transitionYearHeading: 'BACK TO APRIL 1967',
    transitionMissionHeading: 'SURVEYOR 3 — A ROBOTIC SPACECRAFT THAT TESTED THE MOON’S SURFACE',
    accentColor: '#c084fc',
    referenceImage: '/assets/aistudio/image_b33601bf.png',
    referenceCaption: 'NASA Archival Reference: Apollo 12 Commander Pete Conrad inspecting Surveyor 3 with Intrepid in the background (1969).',
    earthBriefingIntro: [
      'Before astronauts could safely land on the Moon, NASA had urgent questions: Was the Moon’s dust too soft? Would a heavy Lunar Module sink out of sight?',
      'NASA launched the uncrewed robotic Surveyor program to prove controlled soft landings were possible and to test the strength of real lunar soil.',
      'Surveyor 3—the third engineering flight in the series and second to achieve a soft landing—touched down on April 20, 1967 in Southeastern Oceanus Procellarum (approx. 3° S, 23.41° W).',
      'During descent, shiny rocks confused its radar, causing Surveyor 3 to bounce twice—10 metres, then 3 metres—before making a third gentle contact and landing safely!',
      'More than two and a half years later, Apollo 12 astronauts Pete Conrad and Alan Bean landed ~180 metres away and recovered Surveyor 3’s camera and soil sampler for Earth study.'
    ],
    crew: [
      { name: 'Surveyor 3 (Surveyor-C)', role: 'Uncrewed Robotic Lander (1967)', spacecraft: '2nd Successful Surveyor Soft Landing' },
      { name: 'Charles "Pete" Conrad', role: 'Apollo 12 Commander (1969 Visit)', spacecraft: 'LM Intrepid (~180 m away)' },
      { name: 'Alan L. Bean', role: 'Apollo 12 Lunar Module Pilot (1969 Visit)', spacecraft: 'LM Intrepid (Recovered Camera & Sampler)' }
    ],
    timeline: [
      {
        date: 'April 17, 1967 (07:05:01 UT)',
        title: 'Surveyor 3 Launched from Earth',
        detail: 'Launched aboard Atlas-Centaur as Surveyor-C, the third engineering flight of the Surveyor series.'
      },
      {
        date: 'April 20, 1967 (00:04:17 UT)',
        title: 'Three-Contact Bouncing Soft Landing',
        detail: 'Bright lunar rocks confused the radar so engines remained firing—causing a ~10 m first bounce and ~3 m second bounce before final soft landing at ~3° S, 23.41° W.'
      },
      {
        date: 'April 20, 1967',
        title: 'First TV Images & Soil Sampling',
        detail: 'Returned the first surface images under an hour after landing; transmitted 6,326 pictures and ran 4 trenching, 4 bearing, and 13 impact soil tests.'
      },
      {
        date: 'May 4, 1967',
        title: 'Last Communication with Surveyor 3',
        detail: 'Final signal received two days after lunar nightfall. Surveyor 3 remained silently on the crater slope.'
      },
      {
        date: 'November 19, 1969',
        title: 'Apollo 12 Astronauts Visit & Recover Parts',
        detail: 'Pete Conrad and Alan Bean walked from Intrepid (~180 m away) to inspect Surveyor 3 and returned its TV camera and soil sampler components to Earth.'
      }
    ],
    hotspots: [
      {
        id: 'surv_legs',
        label: 'Tripod Landing Structure & Footpads',
        stageTag: 'surveyor',
        worldOffset: [-1.8, 0.4, 1.5],
        shortTitle: 'Crushable Honeycomb Legs',
        explanation:
          'Three lightweight tubular aluminum legs with crushable honeycomb shock pads absorbed all three bouncing touchdowns safely.'
      },
      {
        id: 'surv_engine',
        label: 'Vernier & Retro Descent Engines',
        stageTag: 'surveyor',
        worldOffset: [0, 0.65, 0],
        shortTitle: 'Throttleable Vernier Propulsion',
        explanation:
          'Three small vernier engines stayed running past touchdown when radar became confused by bright rocks—creating the famous 10 m and 3 m bounces!'
      },
      {
        id: 'surv_camera',
        label: '25/100 mm Television Camera',
        stageTag: 'surveyor',
        worldOffset: [0.45, 1.65, 0.55],
        shortTitle: 'Surveyor 3 TV Camera (6,326 Pictures)',
        explanation:
          'Looked straight up into a rotating, tilting mirror with 25 mm wide and 100 mm telephoto lenses to return 6,326 television pictures—and was later recovered by Apollo 12!'
      },
      {
        id: 'surv_sampler',
        label: 'Surface Sampler Robotic Arm',
        stageTag: 'surveyor',
        worldOffset: [-0.4, 0.85, 1.4],
        shortTitle: 'Soil Mechanics Surface Sampler',
        explanation:
          'Extended up to ~1.5 metres and dug ~18 cm deep to conduct 4 trenching tests, 4 bearing tests, and 13 impact tests—proving lunar soil could support ~10 psi (~98 kPa)!'
      }
    ],
    narrationScripts: {
      earth_briefing:
        'Before astronauts could walk on the Moon, robots had to go first! Surveyor 3 tested the lunar soil, snapped thousands of photos, and proved human landing legs would not sink.',
      time_transition:
        'Set the clock back to April 1967. Robotic lander Surveyor 3 is approaching Southeastern Oceanus Procellarum.',
      interactive_3d_lab:
        'Inspect Surveyor 3’s tripod landing structure, vernier propulsion, tilting 25-and-100 millimetre television camera mirror, and extendable soil sampler arm.',
      historical_sequence:
        'Watch Surveyor 3’s famous three-contact landing reconstruction! Confused by bright rocks, its engine stayed on—bouncing ten metres high, then three metres, before settling gently.',
      surface_exploration:
        'Operate the robotic Surface Sampler to dig trenches and press soil bearing tests, switch into Surveyor 3’s 1967 TV camera view, then fast-forward to November 1969 when Apollo 12 astronauts visited!',
      quiz: 'Ready to test what you discovered about Surveyor 3’s bounces, soil experiments, and the Apollo 12 visit?',
      completed:
        'Mission completed! You explored how uncrewed robotic Surveyor landers paved a safe path for Apollo astronauts—and how Apollo 12 returned Surveyor 3 parts home for study.'
    },
    learningSummary: [
      'Surveyor 3 (Surveyor-C) was an uncrewed robotic lander—the 3rd engineering flight and 2nd Surveyor to achieve a soft landing (April 20, 1967).',
      'Radar confusion caused two bounces (~10 m then ~3 m) before a third soft touchdown at ~3° S, 23.41° W.',
      'It transmitted 6,326 TV pictures and ran 4 trenching, 4 bearing, and 13 impact soil tests (~10 psi / ~0.7 kg/cm² / ~98 kPa bearing strength).',
      'Last contact was May 4, 1967. On November 19, 1969, Apollo 12 astronauts Pete Conrad and Alan Bean visited from ~180 m away and recovered the camera and sampler parts.'
    ],
    sources: [
      {
        title: 'Surveyor 3 Mission Overview',
        publisher: 'NASA Science',
        url: 'https://science.nasa.gov/mission/surveyor-3/',
        missionOrProgram: 'Surveyor Program'
      }
    ]
  }
};

export const APOLLO_LM_COMPARISON = [
  { metric: 'Position', descent: 'Lower section', ascent: 'Upper section' },
  { metric: 'Primary Role', descent: 'Helped land safely on Moon', ascent: 'Carried astronauts back to lunar orbit' },
  { metric: 'Key Hardware', descent: 'Descent engine & 4 landing legs', ascent: 'Ascent engine, RCS & crew cabin' },
  { metric: 'After Mission', descent: 'Remained permanently on the Moon as launch pad', ascent: 'Separated, docked with Columbia, later jettisoned' }
];

export const LRV_SPECIFICATIONS = [
  { label: 'Vehicle Type', value: 'Four-wheel electric lunar rover' },
  { label: 'Dimensions (L × W × H)', value: 'Approx. 3.1 m × 1.8 m × 1.14 m' },
  { label: 'Wheelbase', value: 'Approx. 2.3 m' },
  { label: 'Power Source', value: 'Two 36-volt batteries' },
  { label: 'Crew Capacity', value: 'Two suited astronauts' },
  { label: 'Max Speed (Apollo 15 / 16)', value: 'Approx. 13 km/h (A15) / Approx. 17 km/h (A16)' }
];

export const LRV_MISSIONS: LrvMissionProfile[] = [
  {
    missionId: 'apollo_15',
    title: 'Apollo 15 — Hadley–Apennine (LRV-1)',
    yearLabel: '1971',
    launchDate: 'July 26, 1971',
    landingDate: 'July 30, 1971',
    landingRegion: 'Hadley–Apennine (Hadley Rille & Apennine Front)',
    lunarModuleName: 'Falcon',
    drivers: ['David R. Scott', 'James B. Irwin'],
    cmp: 'Alfred M. Worden',
    approxDistanceKm: 27.9,
    maxSpeedKmh: 13,
    walkbackLimitMeters: 42, // Scaled surface play radius (conceptually models NASA's walkback safety constraint)
    evaSummary: '3 rover excursions • ~27.9 km approx. traverse • ~18h 35m total moonwalk activity (driving time was shorter than total EVA time)',
    samplesWeightLabel: 'Approx. 77.31 kg of rock & soil samples',
    referenceImage: '/assets/aistudio/image__2__90ca326b.png',
    excursions: [
      {
        id: 'a15_eva1',
        name: 'EVA 1 — Hadley Rille & Elbow / St. George Craters',
        date: 'July 31, 1971',
        approxKm: 10.3,
        landmarks: ['Falcon Pad', 'Elbow Crater', 'St. George Crater', 'Hadley Rille Rim'],
        description: 'First operational LRV drive on the Moon—testing electric traction, dust spray, and rille geology.',
        waypoints: [
          {
            id: 'wp_elbow',
            label: 'Elbow Crater Rim',
            x: -34,
            z: -10,
            sampleName: 'Hadley Mare Basalt (Sample 15016)',
            significance: 'Vesicular mare basalt from ancient volcanic lava flows filling Palus Putredinis.'
          },
          {
            id: 'wp_stgeorge',
            label: 'St. George Crater Flank',
            x: -40,
            z: -34,
            sampleName: 'Apennine Front Breccia',
            significance: 'Excavated deep highland material along the Apennine Mountain front.'
          }
        ]
      },
      {
        id: 'a15_eva2',
        name: 'EVA 2 — Apennine Base, Spur & Crescent Craters',
        date: 'August 1, 1971',
        approxKm: 12.5,
        landmarks: ['Index', 'Arbeit', 'Crescent', 'Dune', 'Spur Crater'],
        description: 'Longest Apollo 15 traverse along Hadley Delta’s base—where Scott & Irwin discovered the famous Genesis Rock.',
        waypoints: [
          {
            id: 'wp_dune',
            label: 'Dune Crater Edge',
            x: -6,
            z: -38,
            sampleName: 'Vesicular Olivine Basalt',
            significance: 'Reveals multiple volcanic flooding episodes across Hadley plain.'
          },
          {
            id: 'wp_spur',
            label: 'Spur Crater (Genesis Rock Site)',
            x: -32,
            z: -46,
            sampleName: 'Genesis Rock (Anorthosite 15415)',
            significance: 'Over 4-billion-year-old crystalline anorthosite from the Moon’s earliest primordial crust!'
          }
        ]
      },
      {
        id: 'a15_eva3',
        name: 'EVA 3 — Scarp Crater & Hadley Rille Terrace',
        date: 'August 2, 1971',
        approxKm: 5.1,
        landmarks: ['Scarp Crater', 'Hadley Rille Edge'],
        description: 'Final geological survey photographing bedrock layers exposed in the steep wall of Hadley Rille.',
        waypoints: [
          {
            id: 'wp_scarp',
            label: 'Scarp Crater & Rille Terrace',
            x: -44,
            z: -20,
            sampleName: 'Layered Rille Bedrock Core',
            significance: 'Confirmed stacked horizontal basalt lava flows inside the canyon walls of Hadley Rille.'
          }
        ]
      }
    ]
  },
  {
    missionId: 'apollo_16',
    title: 'Apollo 16 — Descartes Highlands (LRV-2)',
    yearLabel: '1972',
    launchDate: 'April 16, 1972',
    landingDate: 'April 20, 1972',
    landingRegion: 'Descartes Highlands (Stone Mountain & North Ray Crater)',
    lunarModuleName: 'Orion',
    drivers: ['John W. Young', 'Charles M. Duke Jr.'],
    cmp: 'Thomas K. Mattingly II',
    approxDistanceKm: 26.7,
    maxSpeedKmh: 17,
    walkbackLimitMeters: 42,
    evaSummary: '3 highland excursions • Approx. 26.7 km total traverse (approx. figure across NASA records) • LRV-2 remained parked at Descartes',
    samplesWeightLabel: 'Approx. 95.71 kg of highland samples',
    excursions: [
      {
        id: 'a16_eva1',
        name: 'EVA 1 — Flag & Spook Craters',
        date: 'April 21, 1972',
        approxKm: 4.2,
        landmarks: ['Orion Pad', 'Flag Crater', 'Spook Crater'],
        description: 'Investigated impact breccias instead of expected volcanic highland domes.',
        waypoints: [
          {
            id: 'wp_flag',
            label: 'Flag Crater Highland Outcrop',
            x: -32,
            z: -12,
            sampleName: 'Descartes Impact Breccia',
            significance: 'Surprised geologists—proving Descartes highlands formed from giant basin impacts rather than volcanoes!'
          }
        ]
      },
      {
        id: 'a16_eva2',
        name: 'EVA 2 — Stone Mountain Steep Slopes',
        date: 'April 22, 1972',
        approxKm: 11.1,
        landmarks: ['Stone Mountain', 'Cinco Craters'],
        description: 'Tested LRV-2 hill-climbing traction up dusty highland slopes.',
        waypoints: [
          {
            id: 'wp_stone',
            label: 'Stone Mountain Station',
            x: -42,
            z: -32,
            sampleName: 'Highland Anorthositic Breccia',
            significance: 'Sampled ejecta blankets from ancient Descartes highland ridges.'
          }
        ]
      },
      {
        id: 'a16_eva3',
        name: 'EVA 3 — North Ray Crater Rim',
        date: 'April 23, 1972',
        approxKm: 11.4,
        landmarks: ['North Ray Crater', 'House Rock'],
        description: 'Reached House Rock boulder on the rim of 1-km-wide North Ray Crater.',
        waypoints: [
          {
            id: 'wp_northray',
            label: 'House Rock (North Ray Rim)',
            x: -10,
            z: -40,
            sampleName: 'North Ray Highland Impactite',
            significance: 'Excavated from ~200 m depth beneath the Descartes plain.'
          }
        ]
      }
    ]
  },
  {
    missionId: 'apollo_17',
    title: 'Apollo 17 — Taurus–Littrow Valley (LRV-3)',
    yearLabel: '1972',
    launchDate: 'December 7, 1972',
    landingDate: 'December 11, 1972',
    landingRegion: 'Taurus–Littrow Valley (Final Crewed Apollo Landing)',
    lunarModuleName: 'Challenger',
    drivers: ['Eugene A. Cernan', 'Harrison H. Schmitt'],
    cmp: 'Ronald E. Evans',
    approxDistanceKm: 35.9,
    maxSpeedKmh: 17,
    walkbackLimitMeters: 42,
    evaSummary: '3 valley & massif excursions • Approx. 35.9 km total traverse (longest Apollo drive) • LRV-3 parked permanently at Taurus–Littrow',
    samplesWeightLabel: 'Approx. 110.5 kg of samples (highest Apollo haul)',
    excursions: [
      {
        id: 'a17_eva1',
        name: 'EVA 1 — Steno Crater & Valley Floor',
        date: 'December 11, 1972',
        approxKm: 3.3,
        landmarks: ['Challenger Pad', 'Steno Crater'],
        description: 'Initial geological traverse with geologist-astronaut Harrison Schmitt aboard LRV-3.',
        waypoints: [
          {
            id: 'wp_steno',
            label: 'Steno Crater Floor',
            x: -34,
            z: -14,
            sampleName: 'High-Titanium Valley Basalt',
            significance: 'Dated early volcanic filling of the deep Taurus–Littrow rift valley.'
          }
        ]
      },
      {
        id: 'a17_eva2',
        name: 'EVA 2 — South Massif & Shorty Crater Orange Soil',
        date: 'December 12, 1972',
        approxKm: 20.4,
        landmarks: ['Nansen Crater', 'South Massif', 'Shorty Crater'],
        description: 'Covered ~20.4 km in a single excursion and spotted famous orange volcanic glass beads at Shorty Crater!',
        waypoints: [
          {
            id: 'wp_shorty',
            label: 'Shorty Crater (Orange Glass Soil)',
            x: -42,
            z: -36,
            sampleName: 'Pyroclastic Orange Glass Beads (74220)',
            significance: 'Microscopic volcanic fire-fountain droplets erupted from deep inside the Moon 3.6 billion years ago!'
          }
        ]
      },
      {
        id: 'a17_eva3',
        name: 'EVA 3 — North Massif & Sculptured Hills',
        date: 'December 13, 1972',
        approxKm: 12.2,
        landmarks: ['North Massif', 'Split Rock', 'Sculptured Hills'],
        description: 'Final human rover excursion on the Moon before LRV-3 was parked to film Challenger’s liftoff.',
        waypoints: [
          {
            id: 'wp_splitrock',
            label: 'Split Rock (North Massif)',
            x: -12,
            z: -42,
            sampleName: 'Ancient Highland Impact Melt',
            significance: 'Sampled boulders rolled down from the towering North Massif mountain wall.'
          }
        ]
      }
    ]
  }
];

export const APOLLO_12_ALSEP_INSTRUMENTS: AlsepInstrumentSpec[] = [
  {
    id: 'pse',
    code: 'PSE',
    name: 'Passive Seismic Experiment',
    purpose: 'Measure lunar seismic activity (moonquakes & impacts) and investigate physical properties of the lunar crust and interior.',
    plainExplanation: 'Acts like an ultra-sensitive stethoscope resting on the Moon—listening for tiny vibrations travelling through lunar rock.',
    simulationTitle: 'Simulated Lunar Seismic Wave Trace',
    unitLabel: 'Ground Displacement (nm)',
    offsetFromCentral: [4.2, 2.4]
  },
  {
    id: 'lsm',
    code: 'LSM',
    name: 'Lunar Surface Magnetometer',
    purpose: 'Measure the strength and time variations of the magnetic field at the lunar surface.',
    plainExplanation: 'Three sensor arms point in X, Y, and Z directions to measure tiny magnetic fields washing over Oceanus Procellarum.',
    simulationTitle: 'Simulated Tri-Axis Magnetic Field Vectors',
    unitLabel: 'Magnetic Flux Density (nT)',
    offsetFromCentral: [-4.5, -3.1]
  },
  {
    id: 'sws',
    code: 'SWS',
    name: 'Solar Wind Spectrometer',
    purpose: 'Measure the fluxes and energy spectra of electrons and protons streaming from the Sun onto the Moon.',
    plainExplanation: 'Because the Moon has no thick magnetic shield or atmosphere, fast particles from the Sun hit the ground directly!',
    simulationTitle: 'Simulated Solar Proton & Electron Flux',
    unitLabel: 'Charged Particle Flux',
    offsetFromCentral: [3.6, -3.2]
  },
  {
    id: 'side',
    code: 'SIDE',
    name: 'Suprathermal Ion Detector Experiment',
    purpose: 'Measure the flux, composition, energy, and velocity of low-energy positive ions near the lunar surface.',
    plainExplanation: 'Catches electrically charged atoms drifting just above the lunar ground when sunlight ionizes trace gases.',
    simulationTitle: 'Simulated Ion Energy Channel Spectrum',
    unitLabel: 'Relative Ion Counts',
    offsetFromCentral: [-2.4, -4.4]
  },
  {
    id: 'ccig',
    code: 'CCIG',
    name: 'Cold Cathode Ion Gauge',
    purpose: 'Investigate the extremely thin lunar atmosphere (exosphere) and how trace gases change between lunar day and night.',
    plainExplanation: 'Measures a vacuum trillions of times thinner than Earth’s air—proving the Moon has virtually no breathable atmosphere.',
    simulationTitle: 'Earth Air vs. Lunar Vacuum Density',
    unitLabel: 'Relative Gas Density',
    offsetFromCentral: [0.6, -4.6]
  },
  {
    id: 'ldd',
    code: 'LDD',
    name: 'Lunar Dust Detector',
    purpose: 'Measure lunar dust accumulation, radiation effects on solar cells, reflected infrared energy, and surface temperatures.',
    plainExplanation: 'Watches how clingy moon dust settles on sensors and how wildly temperatures swing between scorching noon and freezing night.',
    simulationTitle: 'Simulated Dust & Thermal Cycle Response',
    unitLabel: 'Surface Temp / Accumulation',
    offsetFromCentral: [1.8, 4.1]
  }
];

export const ALSEP_FIVE_STATIONS: AlsepStationSummary[] = [
  {
    mission: 'Apollo 12 (Array A)',
    year: 1969,
    landingRegion: 'Oceanus Procellarum',
    deploymentDate: 'November 19, 1969',
    coordinatesLabel: '3.01° S, 23.42° W',
    mapPercent: [33, 55],
    instruments: [
      'Passive Seismic Experiment (PSE)',
      'Lunar Surface Magnetometer (LSM)',
      'Solar Wind Spectrometer (SWS)',
      'Suprathermal Ion Detector (SIDE)',
      'Cold Cathode Ion Gauge (CCIG)',
      'Lunar Dust Detector (LDD)'
    ],
    objectives: 'First long-lived nuclear-powered ALSEP station studying moonquakes, magnetism, solar wind, dust, and trace exosphere.',
    hasRetroreflectorNote: 'No Laser Ranging Retroreflector at Apollo 12 (LRRR was separate at Apollo 11, 14, and 15).'
  },
  {
    mission: 'Apollo 14 (Array B)',
    year: 1971,
    landingRegion: 'Fra Mauro Highlands',
    deploymentDate: 'February 5, 1971',
    coordinatesLabel: '3.65° S, 17.47° W',
    mapPercent: [38, 56],
    instruments: [
      'Passive Seismic Experiment (PSE)',
      'Active Seismic Experiment (ASE)',
      'Suprathermal Ion Detector (SIDE)',
      'Cold Cathode Ion Gauge (CCIG)',
      'Charged Particle Lunar Environment (CPLEE)',
      'Lunar Dust Detector (LDD)'
    ],
    objectives: 'Expanded seismic network with active thumper explosions and studied charged particles in the Imbrium ejecta highlands.',
    hasRetroreflectorNote: 'Apollo 14 also deployed a separate Laser Ranging Retroreflector near the site.'
  },
  {
    mission: 'Apollo 15 (Array C)',
    year: 1971,
    landingRegion: 'Hadley–Apennine',
    deploymentDate: 'July 31, 1971',
    coordinatesLabel: '26.13° N, 3.63° E',
    mapPercent: [53, 29],
    instruments: [
      'Passive Seismic Experiment (PSE)',
      'Lunar Surface Magnetometer (LSM)',
      'Solar Wind Spectrometer (SWS)',
      'Suprathermal Ion Detector (SIDE)',
      'Cold Cathode Ion Gauge (CCIG)',
      'Heat Flow Experiment (HFE)',
      'Lunar Dust Detector (LDD)'
    ],
    objectives: 'Added deep borehole Heat Flow probes to measure heat escaping from the Moon’s interior alongside seismic & solar wind arrays.',
    hasRetroreflectorNote: 'Apollo 15 crew separately deployed the largest (300-prism) Laser Ranging Retroreflector.'
  },
  {
    mission: 'Apollo 16 (Array D)',
    year: 1972,
    landingRegion: 'Descartes Highlands',
    deploymentDate: 'April 21, 1972',
    coordinatesLabel: '8.97° S, 15.50° E',
    mapPercent: [62, 61],
    instruments: [
      'Passive Seismic Experiment (PSE)',
      'Active Seismic Experiment (ASE)',
      'Lunar Surface Magnetometer (LSM)',
      'Heat Flow Experiment (HFE)'
    ],
    objectives: 'Focused on highland crust seismic profiling and stronger localized highland magnetic anomalies.',
    hasRetroreflectorNote: 'No Laser Ranging Retroreflector deployed on Apollo 16.'
  },
  {
    mission: 'Apollo 17 (Array E)',
    year: 1972,
    landingRegion: 'Taurus–Littrow Valley',
    deploymentDate: 'December 12, 1972',
    coordinatesLabel: '20.19° N, 30.77° E',
    mapPercent: [73, 35],
    instruments: [
      'Heat Flow Experiment (HFE)',
      'Lunar Seismic Profiling Experiment (LSPE)',
      'Lunar Atmospheric Composition Experiment (LACE)',
      'Lunar Ejecta and Meteorites Experiment (LEAM)',
      'Lunar Surface Gravimeter (LSG)'
    ],
    objectives: 'Specialized final ALSEP array measuring valley subsurface layering, trace neutral gases, and micrometeoroid impacts.',
    hasRetroreflectorNote: 'No Laser Ranging Retroreflector deployed on Apollo 17.'
  }
];

export const SURVEYOR_PROGRAM_ENTRIES: SurveyorProgramEntry[] = [
  {
    mission: 'Surveyor 1',
    launchDate: 'May 30, 1966',
    outcome: 'Successful Soft Landing',
    isSuccess: true,
    location: 'Oceanus Procellarum (2.47° S, 43.34° W)',
    objective: 'First U.S. spacecraft to attempt a controlled soft landing on the Moon.',
    contribution: 'Proved soft touchdown worked and returned >11,000 photos of solid lunar soil.'
  },
  {
    mission: 'Surveyor 2',
    launchDate: 'September 20, 1966',
    outcome: 'Mission Failed (Crashed)',
    isSuccess: false,
    location: 'Near Copernicus Crater (crashed)',
    objective: 'Second engineering test lander.',
    contribution: 'One vernier engine failed to ignite during midcourse correction, causing tumble and lunar impact.'
  },
  {
    mission: 'Surveyor 3',
    launchDate: 'April 17, 1967',
    outcome: 'Successful Soft Landing',
    isSuccess: true,
    location: 'SE Oceanus Procellarum (~3° S, 23.41° W)',
    objective: '3rd engineering flight; carried TV camera and Surface Sampler soil-digging arm.',
    contribution: 'Survived 2 bounces to settle gently, tested ~10 psi soil strength, returned 6,326 photos, and was later visited by Apollo 12.'
  },
  {
    mission: 'Surveyor 4',
    launchDate: 'July 14, 1967',
    outcome: 'Contact Lost Prior to Landing',
    isSuccess: false,
    location: 'Sinus Medii (signal lost during retro burn)',
    objective: 'Robotic landing in Sinus Medii with soil sampler.',
    contribution: 'Radio signals abruptly stopped ~2.5 minutes before touchdown; did not achieve confirmed soft landing.'
  },
  {
    mission: 'Surveyor 5',
    launchDate: 'September 8, 1967',
    outcome: 'Successful Soft Landing',
    isSuccess: true,
    location: 'Mare Tranquillitatis',
    objective: 'Chemical soil analysis using alpha-scattering instrument.',
    contribution: 'Confirmed Moon’s mare plains are volcanic basalt rocks similar to Earth basalt.'
  },
  {
    mission: 'Surveyor 6',
    launchDate: 'November 7, 1967',
    outcome: 'Successful Soft Landing',
    isSuccess: true,
    location: 'Sinus Medii',
    objective: 'Surface chemistry, photography, and engine restart hop test.',
    contribution: 'Executed the first controlled liftoff/hop from the lunar surface (~2.4 m sideways).'
  },
  {
    mission: 'Surveyor 7',
    launchDate: 'January 7, 1968',
    outcome: 'Successful Soft Landing',
    isSuccess: true,
    location: 'Tycho Crater Ejecta Blanket (Highlands)',
    objective: 'Explore rugged lunar highlands for the first time.',
    contribution: 'Revealed light-colored highland composition rich in calcium and aluminum silicates.'
  }
];

export const MOON_RESOURCE_QUIZZES: Record<MoonResourceId, MoonQuizQuestion[]> = {
  apollo_lm: [
    {
      id: 'qm1_1',
      resourceId: 'apollo_lm',
      discoveryId: 'apollo_lm',
      planetId: 'moon',
      question: 'What were the two main stages of the Apollo Lunar Module?',
      options: [
        'Booster stage and re-entry capsule',
        'Descent stage and ascent stage',
        'Command stage and service stage',
        'Solar stage and nuclear stage'
      ],
      correctIndex: 1,
      explanation: 'Eagle consisted of a lower Descent Stage (for landing) and an upper Ascent Stage (for returning the astronauts to lunar orbit).',
      funFact: 'The Lunar Module was the first crewed spacecraft designed to operate solely in the vacuum of space.',
      difficulty: 'easy'
    },
    {
      id: 'qm1_2',
      resourceId: 'apollo_lm',
      discoveryId: 'apollo_lm',
      planetId: 'moon',
      question: 'Which stage remained permanently on the Moon after Apollo 11 departed?',
      options: [
        'Only the ascent stage',
        'The Command Module Columbia',
        'The descent stage',
        'Both stages stayed on the Moon'
      ],
      correctIndex: 2,
      explanation: 'The descent stage stayed on the Moon at Tranquility Base and served as the launch platform for the ascent stage.',
      funFact: 'Leaving the heavy landing legs and empty descent tanks behind saved massive amounts of rocket fuel for liftoff!',
      difficulty: 'easy'
    },
    {
      id: 'qm1_3',
      resourceId: 'apollo_lm',
      discoveryId: 'apollo_lm',
      planetId: 'moon',
      question: 'Which stage carried Neil Armstrong and Buzz Aldrin back into lunar orbit?',
      options: [
        'The descent stage',
        'The ascent stage',
        'Saturn V third stage',
        'The EASEP carrier'
      ],
      correctIndex: 1,
      explanation: 'The upper ascent stage contained the pressurized crew cabin and ascent rocket engine that returned Armstrong and Aldrin to orbit.',
      funFact: 'The ascent engine used hypergolic fuels that ignited automatically on contact for maximum reliability.',
      difficulty: 'easy'
    },
    {
      id: 'qm1_4',
      resourceId: 'apollo_lm',
      discoveryId: 'apollo_lm',
      planetId: 'moon',
      question: 'What was the name of Apollo 11’s Lunar Module?',
      options: ['Intrepid', 'Falcon', 'Eagle', 'Columbia'],
      correctIndex: 2,
      explanation: 'Apollo 11’s Lunar Module was named Eagle.',
      funFact: 'Armstrong radioed "Houston, Tranquility Base here. The Eagle has landed." on July 20, 1969.',
      difficulty: 'easy'
    },
    {
      id: 'qm1_5',
      resourceId: 'apollo_lm',
      discoveryId: 'apollo_lm',
      planetId: 'moon',
      question: 'What was the name of Apollo 11’s Command and Service Module?',
      options: ['Eagle', 'Columbia', 'Yankee Clipper', 'Challenger'],
      correctIndex: 1,
      explanation: 'Columbia was Apollo 11’s Command and Service Module that waited in lunar orbit and returned the crew to Earth.',
      funFact: 'Only Columbia’s conical Command Module returned all the way through Earth’s atmosphere.',
      difficulty: 'easy'
    },
    {
      id: 'qm1_6',
      resourceId: 'apollo_lm',
      discoveryId: 'apollo_lm',
      planetId: 'moon',
      question: 'Who remained aboard Columbia in lunar orbit while Armstrong and Aldrin landed?',
      options: ['David Scott', 'Alan Bean', 'Michael Collins', 'Pete Conrad'],
      correctIndex: 2,
      explanation: 'Command Module Pilot Michael Collins piloted Columbia alone in lunar orbit until Eagle’s ascent stage returned.',
      funFact: 'Collins orbited behind the far side of the Moon out of radio contact every orbit while his crewmates walked below.',
      difficulty: 'easy'
    },
    {
      id: 'qm1_7',
      resourceId: 'apollo_lm',
      discoveryId: 'apollo_lm',
      planetId: 'moon',
      question: 'Where on the Moon did Apollo 11 land on July 20, 1969?',
      options: [
        'Hadley–Apennine',
        'Sea of Tranquility (Mare Tranquillitatis)',
        'Taurus–Littrow Valley',
        'Descartes Highlands'
      ],
      correctIndex: 1,
      explanation: 'Eagle touched down on the flat dark basalt plains of the Sea of Tranquility (Mare Tranquillitatis).',
      funFact: 'They named their exact landing spot Tranquility Base.',
      difficulty: 'easy'
    },
    {
      id: 'qm1_8',
      resourceId: 'apollo_lm',
      discoveryId: 'apollo_lm',
      planetId: 'moon',
      question: 'What was the purpose of the Laser Ranging Retroreflector?',
      options: [
        'To power Eagle’s headlights from Earth',
        'To reflect Earth laser pulses so scientists can measure the Earth–Moon distance',
        'To shoot laser beams at lunar craters',
        'To transmit astronaut television video'
      ],
      correctIndex: 1,
      explanation: 'Its passive corner-cube prisms bounce laser pulses from Earth observatories directly back, letting scientists time round-trip light travel.',
      funFact: 'It uses zero electricity and still reflects laser pulses from Earth decades later!',
      difficulty: 'medium'
    },
    {
      id: 'qm1_9',
      resourceId: 'apollo_lm',
      discoveryId: 'apollo_lm',
      planetId: 'moon',
      question: 'What does EASEP stand for?',
      options: [
        'Earth-to-Apollo Solar Energy Platform',
        'Early Apollo Scientific Experiments Package',
        'External Ascent Stage Engineering Pod',
        'Extended Astronaut Surface Exploration Program'
      ],
      correctIndex: 1,
      explanation: 'EASEP stands for Early Apollo Scientific Experiments Package, deployed specifically on Apollo 11 before full ALSEP stations began on Apollo 12.',
      funFact: 'EASEP was streamlined so Armstrong and Aldrin could deploy science quickly during their single ~2.5-hour moonwalk.',
      difficulty: 'medium'
    },
    {
      id: 'qm1_10',
      resourceId: 'apollo_lm',
      discoveryId: 'apollo_lm',
      planetId: 'moon',
      question: 'Why was the descent stage important even after landing was finished?',
      options: [
        'It flew back to Earth with rock samples',
        'It acted as the physical launch platform for the ascent stage liftoff',
        'It orbited the Moon alongside Columbia',
        'It turned into a four-wheel rover'
      ],
      correctIndex: 1,
      explanation: 'Once pyrotechnic bolts severed the connections, the descent stage’s sturdy top deck acted as a steady launch pad for the ascent stage.',
      funFact: 'Why did NASA show July 20 EDT vs July 21 UT? Because Universal Time in London was already past midnight when Armstrong stepped onto the Moon!',
      difficulty: 'medium'
    }
  ],

  lunar_rover: [
    {
      id: 'qm2_1',
      resourceId: 'lunar_rover',
      discoveryId: 'lunar_rover',
      planetId: 'moon',
      question: 'What does LRV stand for?',
      options: [
        'Lunar Rocket Vessel',
        'Lunar Roving Vehicle',
        'Low-Gravity Research Van',
        'Lunar Radio Van'
      ],
      correctIndex: 1,
      explanation: 'LRV stands for Lunar Roving Vehicle—NASA’s four-wheel electric moon buggy.',
      funFact: 'Its lightweight aluminum frame weighed only about 210 kg on Earth—and felt like ~35 kg in lunar 1/6th gravity!',
      difficulty: 'easy'
    },
    {
      id: 'qm2_2',
      resourceId: 'lunar_rover',
      discoveryId: 'lunar_rover',
      planetId: 'moon',
      question: 'How many operational Lunar Roving Vehicles were driven on the Moon?',
      options: ['One', 'Three', 'Six', 'Twelve'],
      correctIndex: 1,
      explanation: 'Exactly three operational LRVs were driven on the Moon—one each on Apollo 15, Apollo 16, and Apollo 17.',
      funFact: 'Each rover remained parked permanently at its own separate landing site.',
      difficulty: 'easy'
    },
    {
      id: 'qm2_3',
      resourceId: 'lunar_rover',
      discoveryId: 'lunar_rover',
      planetId: 'moon',
      question: 'Which Apollo mission first used a Lunar Roving Vehicle?',
      options: ['Apollo 11', 'Apollo 12', 'Apollo 15', 'Apollo 17'],
      correctIndex: 2,
      explanation: 'Apollo 15 (July–August 1971) was the first mission to drive an LRV on the Moon.',
      funFact: 'The Apollo 15 rover covered approximately 27.9 km across Hadley–Apennine!',
      difficulty: 'easy'
    },
    {
      id: 'qm2_4',
      resourceId: 'lunar_rover',
      discoveryId: 'lunar_rover',
      planetId: 'moon',
      question: 'Which two astronauts drove the Apollo 15 Lunar Rover?',
      options: [
        'Neil Armstrong and Buzz Aldrin',
        'David Scott and James Irwin',
        'John Young and Charles Duke',
        'Eugene Cernan and Harrison Schmitt'
      ],
      correctIndex: 1,
      explanation: 'Commander David R. Scott and Lunar Module Pilot James B. Irwin drove LRV-1 at Hadley–Apennine while Alfred Worden orbited in Endeavour.',
      funFact: 'They discovered the 4-billion-year-old Genesis Rock during EVA 2 at Spur Crater.',
      difficulty: 'medium'
    },
    {
      id: 'qm2_5',
      resourceId: 'lunar_rover',
      discoveryId: 'lunar_rover',
      planetId: 'moon',
      question: 'What powered the Lunar Roving Vehicle?',
      options: [
        'A gasoline/petrol engine',
        'Two 36-volt electric batteries',
        'A nuclear rocket turbine',
        'Wind sails'
      ],
      correctIndex: 1,
      explanation: 'Because the Moon lacks oxygen to burn fuel, the LRV used electric hub motors powered by two 36-volt batteries.',
      funFact: 'Each wheel had its own quarter-horsepower electric drive motor!',
      difficulty: 'easy'
    },
    {
      id: 'qm2_6',
      resourceId: 'lunar_rover',
      discoveryId: 'lunar_rover',
      planetId: 'moon',
      question: 'How many wheels did the Lunar Roving Vehicle have?',
      options: ['Two', 'Four', 'Six', 'Eight'],
      correctIndex: 1,
      explanation: 'The LRV was a four-wheel electric vehicle with woven wire-mesh tires and chevron treads.',
      funFact: 'Wire-mesh wheels avoided flat tires and kept rubber from cracking in extreme lunar cold and heat.',
      difficulty: 'easy'
    },
    {
      id: 'qm2_7',
      resourceId: 'lunar_rover',
      discoveryId: 'lunar_rover',
      planetId: 'moon',
      question: 'What was the purpose of the Walkback Limit?',
      options: [
        'To stop astronauts from getting speeding tickets',
        'To keep astronauts close enough to walk safely back to the Lunar Module if the rover broke down',
        'To save battery power for Earth return',
        'To avoid driving onto other rovers'
      ],
      correctIndex: 1,
      explanation: 'Mission safety required astronauts to stay within walking distance of the Lunar Module’s oxygen and life support in case the LRV failed.',
      funFact: 'As oxygen was consumed during an EVA, the allowed walkback radius shrank accordingly.',
      difficulty: 'medium'
    },
    {
      id: 'qm2_8',
      resourceId: 'lunar_rover',
      discoveryId: 'lunar_rover',
      planetId: 'moon',
      question: 'Which Apollo mission drove LRV-2 in the Descartes Highlands?',
      options: ['Apollo 14', 'Apollo 15', 'Apollo 16', 'Apollo 17'],
      correctIndex: 2,
      explanation: 'Apollo 16 (John Young and Charles Duke) drove LRV-2 approximately 26.7 km in the Descartes Highlands in April 1972.',
      funFact: 'Their highland samples proved Descartes formed from huge ancient impacts rather than volcanoes.',
      difficulty: 'medium'
    },
    {
      id: 'qm2_9',
      resourceId: 'lunar_rover',
      discoveryId: 'lunar_rover',
      planetId: 'moon',
      question: 'Which Apollo mission drove LRV-3 in the Taurus–Littrow Valley?',
      options: ['Apollo 12', 'Apollo 15', 'Apollo 16', 'Apollo 17'],
      correctIndex: 3,
      explanation: 'Apollo 17 (Eugene Cernan and Harrison Schmitt) drove LRV-3 approximately 35.9 km in Taurus–Littrow Valley in December 1972.',
      funFact: 'Apollo 17 was the final crewed Apollo mission and set the longest lunar rover traverse (~35.9 km).',
      difficulty: 'medium'
    },
    {
      id: 'qm2_10',
      resourceId: 'lunar_rover',
      discoveryId: 'lunar_rover',
      planetId: 'moon',
      question: 'Why were all three Lunar Roving Vehicles left behind on the Moon?',
      options: [
        'They got stuck in deep mud',
        'They were designed strictly for lunar exploration and had no return payload space',
        'Astronauts forgot their keys inside Falcon',
        'They needed to drive back to Earth by themselves'
      ],
      correctIndex: 1,
      explanation: 'Ascent stages had strict mass and volume limits—only astronauts, film, and precious lunar rocks could return, so each rover stayed parked at its landing site.',
      funFact: 'Before leaving Taurus–Littrow, Apollo 17 parked LRV-3 away from Challenger so Earth viewers could watch liftoff live via its TV camera!',
      difficulty: 'easy'
    }
  ],

  alsep: [
    {
      id: 'qm3_1',
      resourceId: 'alsep',
      discoveryId: 'alsep',
      planetId: 'moon',
      question: 'What does ALSEP stand for?',
      options: [
        'Apollo Lunar Surface Experiments Package',
        'Astronaut Life Support Engineering Pod',
        'Automated Lunar Satellite Energy Platform',
        'Apollo Landing System Exploration Program'
      ],
      correctIndex: 0,
      explanation: 'ALSEP stands for Apollo Lunar Surface Experiments Package—scientific stations left working on the Moon.',
      funFact: 'NASA powered down the five ALSEP stations on September 30, 1977 after years of continuous lunar observations.',
      difficulty: 'easy'
    },
    {
      id: 'qm3_2',
      resourceId: 'alsep',
      discoveryId: 'alsep',
      planetId: 'moon',
      question: 'Which Apollo mission first deployed the full ALSEP station?',
      options: ['Apollo 11', 'Apollo 12', 'Apollo 15', 'Apollo 17'],
      correctIndex: 1,
      explanation: 'Apollo 12 (November 1969) deployed the very first full ALSEP station; Apollo 11 had deployed the simpler EASEP package.',
      funFact: 'Apollo 12 set up its ALSEP central station about 90 metres northwest of Lunar Module Intrepid.',
      difficulty: 'easy'
    },
    {
      id: 'qm3_3',
      resourceId: 'alsep',
      discoveryId: 'alsep',
      planetId: 'moon',
      question: 'What was the name of Apollo 12’s Lunar Module?',
      options: ['Eagle', 'Intrepid', 'Falcon', 'Challenger'],
      correctIndex: 1,
      explanation: 'Apollo 12’s Lunar Module was named Intrepid, flown by Pete Conrad and Alan Bean.',
      funFact: 'Richard Gordon remained in lunar orbit aboard Command Module Yankee Clipper.',
      difficulty: 'easy'
    },
    {
      id: 'qm3_4',
      resourceId: 'alsep',
      discoveryId: 'alsep',
      planetId: 'moon',
      question: 'What was the purpose of the Passive Seismic Experiment (PSE)?',
      options: [
        'To measure solar wind protons',
        'To detect moonquakes and investigate the Moon’s internal structure',
        'To dig trenches in the regolith',
        'To power the antenna'
      ],
      correctIndex: 1,
      explanation: 'The Passive Seismic Experiment recorded lunar vibrations and moonquakes so scientists could study the Moon’s crust and interior.',
      funFact: 'Seismometers on the Moon detected shallow moonquakes, deep tidal moonquakes, and meteorite impacts!',
      difficulty: 'easy'
    },
    {
      id: 'qm3_5',
      resourceId: 'alsep',
      discoveryId: 'alsep',
      planetId: 'moon',
      question: 'Which Apollo 12 ALSEP instrument measured the magnetic field at the lunar surface?',
      options: [
        'Cold Cathode Ion Gauge (CCIG)',
        'Lunar Surface Magnetometer (LSM)',
        'Lunar Dust Detector (LDD)',
        'Solar Wind Spectrometer (SWS)'
      ],
      correctIndex: 1,
      explanation: 'The Lunar Surface Magnetometer (LSM) used three orthogonal boom sensors to measure local lunar magnetic fields.',
      funFact: 'LSM discovered that localized magnetized rocks on the Moon’s surface interact with incoming solar wind.',
      difficulty: 'easy'
    },
    {
      id: 'qm3_6',
      resourceId: 'alsep',
      discoveryId: 'alsep',
      planetId: 'moon',
      question: 'What did the Solar Wind Spectrometer (SWS) measure?',
      options: [
        'Moonquake wave speeds',
        'Fluxes and energy spectra of electrons and protons from the Sun',
        'Heat flow 2 metres underground',
        'Surface rover tire tracks'
      ],
      correctIndex: 1,
      explanation: 'SWS measured electrons and protons arriving directly from the Sun onto the airless lunar surface.',
      funFact: 'Its array of collector cups looked outward in multiple directions to track particle angles.',
      difficulty: 'medium'
    },
    {
      id: 'qm3_7',
      resourceId: 'alsep',
      discoveryId: 'alsep',
      planetId: 'moon',
      question: 'What was the purpose of the Cold Cathode Ion Gauge (CCIG)?',
      options: [
        'To investigate the extremely thin lunar atmosphere (exosphere)',
        'To take 600-line television photos',
        'To generate nuclear electricity',
        'To reflect Earth laser pulses'
      ],
      correctIndex: 0,
      explanation: 'CCIG investigated the minuscule amount of gas and particles near the lunar surface—confirming the Moon has no substantial atmosphere.',
      funFact: 'Even small astronaut exhaust plumes temporarily overwhelmed the ultra-sensitive gauge!',
      difficulty: 'medium'
    },
    {
      id: 'qm3_8',
      resourceId: 'alsep',
      discoveryId: 'alsep',
      planetId: 'moon',
      question: 'Which Apollo 12 instrument measured dust accumulation, radiation effects, and temperatures?',
      options: [
        'Suprathermal Ion Detector (SIDE)',
        'Passive Seismic Experiment (PSE)',
        'Lunar Dust Detector (LDD)',
        'SNAP-27 Generator'
      ],
      correctIndex: 2,
      explanation: 'The Lunar Dust Detector (LDD) monitored clingy lunar dust, solar-cell degradation, infrared reflection, and temperatures.',
      funFact: 'Lunar dust clings electrostatically to surfaces, making dust monitoring crucial for long-term hardware.',
      difficulty: 'easy'
    },
    {
      id: 'qm3_9',
      resourceId: 'alsep',
      discoveryId: 'alsep',
      planetId: 'moon',
      question: 'What powered the Apollo 12 ALSEP station day and night?',
      options: [
        'A gasoline generator',
        'The SNAP-27 Radioisotope Thermoelectric Generator (RTG)',
        'Large wind turbines',
        'Eagle’s ascent engine'
      ],
      correctIndex: 1,
      explanation: 'SNAP-27 converted heat from Plutonium-238 radioactive decay into ~70 W DC at ~16 V, operating continuously through freezing 14-day lunar nights.',
      funFact: 'SNAP-27 had a generator mass of ~17 kg and a Plutonium-238 fuel capsule of ~4 kg.',
      difficulty: 'medium'
    },
    {
      id: 'qm3_10',
      resourceId: 'alsep',
      discoveryId: 'alsep',
      planetId: 'moon',
      question: 'What was the main job of the ALSEP Central Station?',
      options: [
        'To carry astronauts back into orbit',
        'To distribute power, process instrument data, receive commands, and transmit telemetry to Earth',
        'To dig lunar soil trenches',
        'To drive across craters'
      ],
      correctIndex: 1,
      explanation: 'The Central Station acted as the station’s electrical hub, computer, and radio link between all instruments and Earth.',
      funFact: 'Its helical antenna pointed carefully toward Earth so telemetry streamed home nonstop.',
      difficulty: 'easy'
    },
    {
      id: 'qm3_11',
      resourceId: 'alsep',
      discoveryId: 'alsep',
      planetId: 'moon',
      question: 'How did Apollo 11’s EASEP differ from later ALSEP stations?',
      options: [
        'EASEP was a simpler, shorter-lived early package; ALSEP stations had central hubs, SNAP-27 power, and lasted years',
        'EASEP had 10 nuclear reactors while ALSEP used none',
        'They were 100% identical',
        'EASEP was placed on Mars'
      ],
      correctIndex: 0,
      explanation: 'Apollo 11 deployed the simpler EASEP (without a SNAP-27 RTG central hub), whereas Apollo 12, 14, 15, 16, and 17 deployed full multi-year ALSEP stations.',
      funFact: 'Also, Laser Ranging Retroreflectors were separate passive experiments deployed on Apollo 11, 14, and 15—not installed at Apollo 12!',
      difficulty: 'medium'
    },
    {
      id: 'qm3_12',
      resourceId: 'alsep',
      discoveryId: 'alsep',
      planetId: 'moon',
      question: 'Why did ALSEP stations stay on the Moon after the astronauts went home?',
      options: [
        'So they could perform continuous long-term scientific measurements and send data back to Earth for years',
        'Because they were too muddy to lift',
        'Because astronauts planned to live inside the central station',
        'To serve as lunar landing pads'
      ],
      correctIndex: 0,
      explanation: 'Long-term measurements of moonquakes, solar wind, and thermal flow required years of continuous monitoring after the short crewed stays ended.',
      funFact: 'ALSEP remained active until NASA shut down operations on September 30, 1977!',
      difficulty: 'easy'
    }
  ],

  surveyor: [
    {
      id: 'qm4_1',
      resourceId: 'surveyor',
      discoveryId: 'surveyor',
      planetId: 'moon',
      question: 'What was the primary purpose of NASA’s Surveyor program?',
      options: [
        'To carry astronauts to the Moon before Apollo',
        'To demonstrate controlled robotic soft landings and test whether the lunar surface could support Apollo Lunar Modules',
        'To build lunar bases',
        'To mine water ice'
      ],
      correctIndex: 1,
      explanation: 'Surveyor robotic landers proved soft landings worked and measured soil bearing strength and terrain safety before Apollo crews landed.',
      funFact: 'Five of seven Surveyor missions achieved successful soft landings between 1966 and 1968.',
      difficulty: 'easy'
    },
    {
      id: 'qm4_2',
      resourceId: 'surveyor',
      discoveryId: 'surveyor',
      planetId: 'moon',
      question: 'Was Surveyor 3 a robotic lander or a crewed spacecraft?',
      options: [
        'A crewed spacecraft with two astronauts',
        'A four-wheel rover driven by Michael Collins',
        'An uncrewed robotic lander',
        'An orbiting space station'
      ],
      correctIndex: 2,
      explanation: 'Surveyor 3 (Surveyor-C) was strictly an uncrewed robotic lander—the 3rd engineering flight and 2nd Surveyor soft landing.',
      funFact: 'Later, Apollo 12 astronauts Pete Conrad and Alan Bean visited it in person!',
      difficulty: 'easy'
    },
    {
      id: 'qm4_3',
      resourceId: 'surveyor',
      discoveryId: 'surveyor',
      planetId: 'moon',
      question: 'When did Surveyor 3 launch from Earth?',
      options: ['July 16, 1969', 'April 17, 1967', 'November 14, 1969', 'May 4, 1967'],
      correctIndex: 1,
      explanation: 'Surveyor 3 launched on April 17, 1967 at 07:05:01 UT.',
      funFact: 'It took less than three days to reach Southeastern Oceanus Procellarum.',
      difficulty: 'medium'
    },
    {
      id: 'qm4_4',
      resourceId: 'surveyor',
      discoveryId: 'surveyor',
      planetId: 'moon',
      question: 'When did Surveyor 3 land on the Moon?',
      options: ['April 20, 1967 (00:04:17 UT)', 'May 4, 1967', 'July 20, 1969', 'November 19, 1969'],
      correctIndex: 0,
      explanation: 'Surveyor 3 settled on the lunar surface at 00:04:17 UT on April 20, 1967.',
      funFact: 'Its landing coordinates were approximately 3° south latitude, 23.41° west longitude.',
      difficulty: 'medium'
    },
    {
      id: 'qm4_5',
      resourceId: 'surveyor',
      discoveryId: 'surveyor',
      planetId: 'moon',
      question: 'Why did Surveyor 3 bounce during its landing sequence?',
      options: [
        'Its astronauts pressed the jump button',
        'Highly reflective lunar rocks confused the descent radar so its vernier engines did not shut down on time',
        'The Moon has giant trampolines',
        'A meteor struck its leg'
      ],
      correctIndex: 1,
      explanation: 'Bright reflective rocks confused the radar, keeping the vernier engines firing past initial touchdown—causing two bounces (~10 m, then ~3 m)!',
      funFact: 'Ground controllers quickly commanded the engines off so the 3rd contact became a gentle landing.',
      difficulty: 'medium'
    },
    {
      id: 'qm4_6',
      resourceId: 'surveyor',
      discoveryId: 'surveyor',
      planetId: 'moon',
      question: 'How many times did Surveyor 3 contact the lunar surface before settling?',
      options: ['Once', 'Twice', 'Three contacts (two bounces before the final soft landing)', 'Seven times'],
      correctIndex: 2,
      explanation: 'Three contacts total: first contact -> ~10 m bounce -> second contact -> ~3 m bounce -> third final soft landing.',
      funFact: 'Surveyor 3 landed inside a shallow crater slope, which Apollo 12 astronauts later walked down into!',
      difficulty: 'easy'
    },
    {
      id: 'qm4_7',
      resourceId: 'surveyor',
      discoveryId: 'surveyor',
      planetId: 'moon',
      question: 'What was the purpose of Surveyor 3’s Surface Sampler arm?',
      options: [
        'To dig trenches, press bearing tests, and conduct impact tests in the lunar soil',
        'To launch rockets back to Earth',
        'To measure solar wind ions',
        'To steer Surveyor 3 like a car'
      ],
      correctIndex: 0,
      explanation: 'The robotic arm reached ~1.5 m out and dug ~18 cm deep to test soil consistency via 4 trenching, 4 bearing, and 13 impact tests.',
      funFact: 'Scientists realized lunar regolith behaved much like firm wet sand!',
      difficulty: 'easy'
    },
    {
      id: 'qm4_8',
      resourceId: 'surveyor',
      discoveryId: 'surveyor',
      planetId: 'moon',
      question: 'How many television pictures did Surveyor 3 transmit to Earth?',
      options: ['120 pictures', '1,000 pictures', '6,326 pictures', '50,000 pictures'],
      correctIndex: 2,
      explanation: 'Surveyor 3’s movable-mirror television camera (with 25 mm and 100 mm lenses) returned 6,326 television pictures!',
      funFact: 'It transmitted standard 200-line frames in ~20 seconds as well as crisp 600-line digital images.',
      difficulty: 'medium'
    },
    {
      id: 'qm4_9',
      resourceId: 'surveyor',
      discoveryId: 'surveyor',
      planetId: 'moon',
      question: 'What did Surveyor 3’s bearing tests help scientists investigate?',
      options: [
        'How strong and firm the lunar soil was under weight',
        'How deep the Moon’s iron core is',
        'How bright stars appear from orbit',
        'Whether plants could grow inside the camera'
      ],
      correctIndex: 0,
      explanation: 'Bearing tests pressed the sampler against the ground to determine approximate bearing strength (~10 psi / ~0.7 kg/cm² / ~98 kPa).',
      funFact: 'That was strong enough to support an Apollo Lunar Module without sinking!',
      difficulty: 'easy'
    },
    {
      id: 'qm4_10',
      resourceId: 'surveyor',
      discoveryId: 'surveyor',
      planetId: 'moon',
      question: 'Why was lunar soil bearing strength so important for Apollo?',
      options: [
        'Because astronauts wanted to surf on lunar dunes',
        'It confirmed the Moon’s soil would safely support the weight of an Apollo Lunar Module without sinking',
        'Because rovers used steam engines',
        'It proved the Moon had thick mud oceans'
      ],
      correctIndex: 1,
      explanation: 'Without knowing soil strength beforehand, NASA worried a crewed Lunar Module might sink or tip over in deep dust.',
      funFact: 'Surveyor 3 eliminated that fear two years before Apollo 11!',
      difficulty: 'easy'
    },
    {
      id: 'qm4_11',
      resourceId: 'surveyor',
      discoveryId: 'surveyor',
      planetId: 'moon',
      question: 'Which Apollo mission landed ~180 metres away and visited Surveyor 3 in 1969?',
      options: ['Apollo 11', 'Apollo 12', 'Apollo 15', 'Apollo 17'],
      correctIndex: 1,
      explanation: 'Apollo 12 (Pete Conrad and Alan Bean aboard LM Intrepid) touched down ~180 m from Surveyor 3 on November 19, 1969.',
      funFact: 'Seeing Intrepid perched on the crater rim behind Pete Conrad and Surveyor 3 is one of the most iconic photos of Apollo!',
      difficulty: 'easy'
    },
    {
      id: 'qm4_12',
      resourceId: 'surveyor',
      discoveryId: 'surveyor',
      planetId: 'moon',
      question: 'Which Surveyor 3 components did Apollo 12 astronauts recover and bring back to Earth?',
      options: [
        'The entire spacecraft and all three landing legs',
        'Only the main rocket fuel tank',
        'Television camera system components and soil sampler components',
        'Nothing—they did not touch it'
      ],
      correctIndex: 2,
      explanation: 'Conrad and Bean removed Surveyor 3’s TV camera and surface sampler components so Earth scientists could study >2.5 years of lunar exposure.',
      funFact: 'The rest of Surveyor 3 remains quietly on the Moon in Oceanus Procellarum!',
      difficulty: 'medium'
    }
  ]
};

/**
 * Pure simulation helper for Resource 01: Apollo 11 Ascent Stage separation & orbit profile.
 * Ensures the Descent Stage remains fixed on the lunar surface (descentAltitude === 0)
 * while ONLY the Ascent Stage rises from t=0..1.
 */
export function computeAscentSeparationState(progress01: number): {
  descentAltitudeMeters: number;
  ascentAltitudeMeters: number;
  engineActive: boolean;
  dockedWithColumbia: boolean;
  statusBanner: string;
} {
  const p = Math.max(0, Math.min(1, progress01));
  if (p < 0.18) {
    return {
      descentAltitudeMeters: 0,
      ascentAltitudeMeters: 0,
      engineActive: p > 0.1,
      dockedWithColumbia: false,
      statusBanner: 'T-MINUS IGNITION SEQUENCE — ARMSTRONG & ALDRIN ABOARD EAGLE ASCENT STAGE'
    };
  }
  const risePhase = (p - 0.18) / 0.82;
  const ascentAltitudeMeters = Math.pow(risePhase, 1.55) * 95;
  const dockedWithColumbia = p >= 0.94;
  return {
    descentAltitudeMeters: 0, // Descent stage MUST remain permanently on the lunar surface!
    ascentAltitudeMeters,
    engineActive: !dockedWithColumbia,
    dockedWithColumbia,
    statusBanner: dockedWithColumbia
      ? 'RENDEZVOUS & DOCKING COMPLETE WITH COLUMBIA (MICHAEL COLLINS)'
      : 'THE ASCENT STAGE IS RETURNING TO LUNAR ORBIT — DESCENT STAGE REMAINS ON MOON'
  };
}

/**
 * Pure simulation helper for Resource 01 & 03: Passive Laser Ranging Retroreflector round-trip math.
 * Mean Earth–Moon distance ~384,400 km, c = 299,792.458 km/s -> ~2.564 s round trip.
 */
export function computeLaserPulseRoundTrip(progress01: number): {
  leg: 'earth_to_moon' | 'reflecting' | 'moon_to_earth' | 'measured';
  pulseProgressOnLeg: number;
  elapsedSeconds: number;
  measuredDistanceKm: number;
} {
  const p = Math.max(0, Math.min(1, progress01));
  const roundTripSeconds = (2 * 384400) / 299792.458;
  if (p < 0.45) {
    return {
      leg: 'earth_to_moon',
      pulseProgressOnLeg: p / 0.45,
      elapsedSeconds: (p / 0.9) * roundTripSeconds,
      measuredDistanceKm: 384400
    };
  }
  if (p < 0.52) {
    return {
      leg: 'reflecting',
      pulseProgressOnLeg: (p - 0.45) / 0.07,
      elapsedSeconds: 0.5 * roundTripSeconds,
      measuredDistanceKm: 384400
    };
  }
  if (p < 0.96) {
    return {
      leg: 'moon_to_earth',
      pulseProgressOnLeg: (p - 0.52) / 0.44,
      elapsedSeconds: (0.5 + 0.5 * ((p - 0.52) / 0.44)) * roundTripSeconds,
      measuredDistanceKm: 384400
    };
  }
  return {
    leg: 'measured',
    pulseProgressOnLeg: 1,
    elapsedSeconds: roundTripSeconds,
    measuredDistanceKm: 384400
  };
}

/**
 * Pure simulation helper for Resource 04: Surveyor 3 historically accurate 3-contact bouncing landing!
 * Contact 1 (~0.35) -> ~10 m bounce -> Contact 2 (~0.66) -> ~3 m bounce -> Contact 3 (~0.88) soft landing.
 */
export function computeSurveyorBounceHeight(progress01: number): {
  altitudeMeters: number;
  contactCount: 0 | 1 | 2 | 3;
  engineFiring: boolean;
  phaseLabel: string;
} {
  const p = Math.max(0, Math.min(1, progress01));
  if (p < 0.35) {
    const t = p / 0.35;
    return {
      altitudeMeters: 28 * Math.pow(1 - t, 1.35),
      contactCount: 0,
      engineFiring: true,
      phaseLabel: 'Radar confused by bright rocks — Vernier engines still firing during approach'
    };
  }
  if (p < 0.66) {
    const t = (p - 0.35) / 0.31;
    // Parabolic 10m bounce arc
    const h = 4 * 10.0 * t * (1 - t);
    return {
      altitudeMeters: Math.max(0, h),
      contactCount: 1,
      engineFiring: t < 0.6,
      phaseLabel: 'First Contact! Surveyor 3 rebounds approximately 10 metres above the surface'
    };
  }
  if (p < 0.88) {
    const t = (p - 0.66) / 0.22;
    // Parabolic 3m second bounce arc
    const h = 4 * 3.0 * t * (1 - t);
    return {
      altitudeMeters: Math.max(0, h),
      contactCount: 2,
      engineFiring: t < 0.25,
      phaseLabel: 'Second Contact! Rebounds approximately 3 metres as engines shut down'
    };
  }
  return {
    altitudeMeters: 0,
    contactCount: 3,
    engineFiring: false,
    phaseLabel: 'Third Contact — Successful Soft Landing at 00:04:17 UT (April 20, 1967)'
  };
}

/**
 * Pure physics step for Resource 02: Historically grounded Apollo LRV low-gravity driving model.
 * Simulates ~13–17 km/h speed limit, low-gravity wheel momentum, dual-axle steering, and battery draw.
 */
export function computeLrvPhysicsStep(
  state: LrvPhysicsState,
  controls: { forward: boolean; backward: boolean; left: boolean; right: boolean; brake: boolean },
  dt: number,
  maxSpeedKmh: number = 13,
  terrainHeightFn: (x: number, z: number) => number = () => 0,
  maxRadius: number = 82
): LrvPhysicsState {
  const clampedDt = Math.max(0, Math.min(dt, 0.05));
  const maxSpeedMps = maxSpeedKmh / 3.6; // ~3.61 m/s for 13 km/h, ~4.72 m/s for 17 km/h

  const steerInput = (controls.left ? 1 : 0) - (controls.right ? 1 : 0);
  const targetSteer = steerInput * 0.42;
  const steerLerp = 1 - Math.exp(-8.5 * clampedDt);
  const steerAngleRad = state.steerAngleRad + (targetSteer - state.steerAngleRad) * steerLerp;

  const throttle = (controls.forward ? 1 : 0) - (controls.backward ? 0.65 : 0);
  const currentFwdSpeed =
    state.vx * Math.sin(state.headingRad) + state.vz * Math.cos(state.headingRad);

  let nextFwdSpeed = currentFwdSpeed;
  if (controls.brake) {
    // Limited lunar regolith braking traction — smooth deceleration rather than instant car stop
    const brakeRate = 3.2 * clampedDt;
    if (Math.abs(nextFwdSpeed) <= brakeRate) nextFwdSpeed = 0;
    else nextFwdSpeed -= Math.sign(nextFwdSpeed) * brakeRate;
  } else if (throttle !== 0) {
    nextFwdSpeed += throttle * 3.8 * clampedDt;
  } else {
    // Low rolling resistance in lunar dust
    nextFwdSpeed *= Math.exp(-1.15 * clampedDt);
  }

  nextFwdSpeed = Math.max(-maxSpeedMps * 0.65, Math.min(maxSpeedMps, nextFwdSpeed));

  // Turn rate scales with forward velocity and dual-axle steering
  const wheelbase = 2.3;
  const turnFactor = Math.abs(nextFwdSpeed) > 0.08 ? (nextFwdSpeed / wheelbase) * Math.tan(steerAngleRad) * 1.45 : steerInput * 0.45;
  const headingRad = state.headingRad + turnFactor * clampedDt;

  const vx = Math.sin(headingRad) * nextFwdSpeed;
  const vz = Math.cos(headingRad) * nextFwdSpeed;

  let nextX = state.x + vx * clampedDt;
  let nextZ = state.z + vz * clampedDt;

  const r = Math.hypot(nextX, nextZ);
  if (r > maxRadius) {
    const scale = maxRadius / r;
    nextX *= scale;
    nextZ *= scale;
  }

  const nextY = terrainHeightFn(nextX, nextZ);
  const stepDist = Math.hypot(nextX - state.x, nextZ - state.z);
  const wheelRadius = 0.41;
  const wheelSpinRad = state.wheelSpinRad + (nextFwdSpeed * clampedDt) / wheelRadius;
  const batteryDrain = (Math.abs(throttle) > 0 ? 0.045 : 0.004) * clampedDt;

  return {
    x: nextX,
    y: nextY,
    z: nextZ,
    vx,
    vz,
    headingRad,
    steerAngleRad,
    wheelSpinRad,
    speedMps: Math.abs(nextFwdSpeed),
    distanceMeters: state.distanceMeters + stepDist,
    batteryPercent: Math.max(12, state.batteryPercent - batteryDrain),
    isBraking: controls.brake
  };
}

/**
 * Pure safety helper for Resource 02: Walkback Limit indicator relative to the parked Lunar Module.
 */
export function computeWalkbackStatus(
  roverX: number,
  roverZ: number,
  lmX: number,
  lmZ: number,
  walkbackLimitMeters: number
): {
  distanceFromLmMeters: number;
  limitMeters: number;
  ratio: number;
  exceeded: boolean;
  warningText: string | null;
} {
  const distanceFromLmMeters = Math.hypot(roverX - lmX, roverZ - lmZ);
  const ratio = walkbackLimitMeters > 0 ? distanceFromLmMeters / walkbackLimitMeters : 0;
  const exceeded = distanceFromLmMeters > walkbackLimitMeters;
  return {
    distanceFromLmMeters,
    limitMeters: walkbackLimitMeters,
    ratio,
    exceeded,
    warningText: exceeded
      ? 'WALKBACK LIMIT EXCEEDED — Return closer to the Lunar Module so oxygen reserves allow a safe walk back!'
      : ratio > 0.8
      ? 'Approaching Mission Walkback Safety Limit'
      : null
  };
}

export function getMoonProximityNarration(id: MoonResourceId, lang: 'en' | 'hi' = 'en'): string {
  const res = MOON_RESOURCES[id];
  const hiMap: Record<MoonResourceId, string> = {
    apollo_lm: `${res.shortTitle} (ईगल) के पास आपका स्वागत है। जानिए कि दो-चरणीय लूनर मॉड्यूल कैसे चंद्रमा पर उतरा और इसका निचला हिस्सा लॉन्च पैड बना। खोजने के लिए E दबाएं।`,
    lunar_rover: `${res.shortTitle} क्षेत्र में आपका स्वागत है। अपोलो 15, 16 और 17 की इन इलेक्ट्रिक मून बगीज़ ने अंतरिक्ष यात्रियों को मीलों दूर तक पहुंचाया। चलाने या खोजने के लिए E दबाएं।`,
    alsep: `${res.shortTitle} स्टेशन के पास आपका स्वागत है। परमाणु ऊर्जा से चलने वाले इन वैज्ञानिक उपकरणों ने वर्षों तक चंद्र भूकंप और सौर पवन का अध्ययन किया। E दबाएं।`,
    surveyor: `${res.shortTitle} लैंडर के पास आपका स्वागत है। 1967 में रोबोटिक सॉफ्ट-लैंडिंग से पहले इसने चंद्र मिट्टी की मजबूती साबित की। निरीक्षण के लिए E दबाएं।`
  };
  if (lang === 'hi') {
    return hiMap[id];
  }
  const briefing = res.narrationScripts.earth_briefing || res.earthBriefingIntro[0] || res.subtitle;
  return `Approaching ${res.shortTitle}. ${briefing} Press E to explore.`;
}
