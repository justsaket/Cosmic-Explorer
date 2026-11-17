import { UnknownFrontierTopic } from '../types';

export const UNKNOWN_FRONTIER_TOPICS: UnknownFrontierTopic[] = [
  // --- MOON: WHAT WE KNOW ---
  {
    id: 'moon_know_origin',
    planetId: 'moon',
    pillar: 'what_we_know',
    title: 'The Giant Impact Hypothesis',
    question: 'How did the Moon originate?',
    summary: 'Planetary isotopic analysis confirms the Moon formed ~4.5 billion years ago when a Mars-sized protoplanet (Theia) collided with early proto-Earth.',
    currentEvidence: 'Oxygen isotope ratios in Apollo rock samples match Earth almost identically, proving a shared ancestry, while the Moon is depleted in volatile elements and iron core mass.',
    unansweredMystery: 'Did the collision vaporize both bodies into a giant spinning disk (synestia), or was it a grazing impact where Earth remained largely intact?',
    nextGenerationMission: 'Artemis deep core sampling at the South Pole-Aitken basin to sample pristine mantle materials thrown out by early impacts.',
    tags: ['Origin', 'Giant Impact', 'Apollo Rocks', 'Geochemistry']
  },
  {
    id: 'moon_know_maria',
    planetId: 'moon',
    pillar: 'what_we_know',
    title: 'Lunar Maria & Basaltic Volcanism',
    question: 'Why are the dark plains smoother than the highlands?',
    summary: 'The dark patches on the Moon (Maria) are enormous basaltic plains formed by ancient flood basalt eruptions that filled giant impact basins between 3.9 and 3.1 billion years ago.',
    currentEvidence: 'Sample return from Apollo 11, 12, 15, and Chang\'e 5 confirms basaltic lava composition with titanium, ilmenite, and iron rich silicates.',
    unansweredMystery: 'Why are almost all maria located on the near side facing Earth, while the far side is nearly entirely mountainous highland crust?',
    nextGenerationMission: 'Far-side seismic networks and heat flow probes deployed by autonomous lunar landers.',
    tags: ['Volcanism', 'Basalt', 'Crustal Asymmetry', 'Highlands']
  },

  // --- MOON: WHAT WE ARE INVESTIGATING ---
  {
    id: 'moon_investigating_ice',
    planetId: 'moon',
    pillar: 'what_we_are_investigating',
    title: 'Polar Cryogenic Water Ice Distribution',
    question: 'Where is lunar water ice located and how accessible is it?',
    summary: 'NASA LCROSS, LRO Diviner, and Chandrayaan-1 detected water molecules and surface frost inside permanently shadowed craters (PSRs) at the lunar poles.',
    currentEvidence: 'Radar backscatter and neutron spectrometer signatures indicate localized concentrations of up to 5.5% water by weight mixed into cold-trap regolith.',
    unansweredMystery: 'Is the ice pure crystalline ice sheets beneath a thin layer of dust, or microscopic frost intimately mixed with abrasive rock fragments?',
    nextGenerationMission: 'NASA VIPER rover and VIPER-class neutron drill instruments to map ice depth in Shackleton and Faustini craters.',
    tags: ['Water Ice', 'Permanently Shadowed Regions', 'VIPER', 'Artemis']
  },
  {
    id: 'moon_investigating_lavatubes',
    planetId: 'moon',
    pillar: 'what_we_are_investigating',
    title: 'Subsurface Lava Tubes as Radiation Shelters',
    question: 'Can underground volcanic caverns shelter future habitats?',
    summary: 'Lunar Reconnaissance Orbiter imaged skylight pits in Marius Hills, indicating collapsed roofs of massive ancient subsurface lava channels.',
    currentEvidence: 'Thermal cameras show stable internal temperatures (~17°C) shielded from the extreme +120°C to -130°C surface swings and cosmic ray bombardment.',
    unansweredMystery: 'How continuous and mechanically stable are these caves? Do they extend for hundreds of meters or are they blocked by basalt rubble?',
    nextGenerationMission: 'Robotic spelunker tether-crawlers and drone lidars to descend into lunar skylights.',
    tags: ['Lava Tubes', 'Radiation Shielding', 'Subsurface', 'Habitats']
  },

  // --- MOON: FUTURE EXPLORERS MAY DISCOVER ---
  {
    id: 'moon_future_isru',
    planetId: 'moon',
    pillar: 'future_discoveries',
    title: 'In-Situ Propellant Refining & Space Architecture',
    question: 'Can future explorers fuel deep-space rockets directly from lunar dirt?',
    summary: 'Lunar regolith contains ~45% oxygen bound in mineral oxides, while polar water ice can be electrolyzed into liquid hydrogen and oxygen propellant.',
    currentEvidence: 'Lab reactors demonstrate carbothermal reduction can extract breathable oxygen from synthetic regolith, but industrial scale durability is unproven.',
    unansweredMystery: 'What will be the most energy-efficient closed-loop extraction method that can survive the abrasive, electrostatic lunar dust environment?',
    nextGenerationMission: 'Pilot molten regolith electrolysis plants deployed at the Artemis Base Camp on the South Pole rim.',
    tags: ['ISRU', 'Propellant', 'Electrolysis', 'Oxygen Generation']
  },
  {
    id: 'moon_future_radioastronomy',
    planetId: 'moon',
    pillar: 'future_discoveries',
    title: 'The Silent Far-Side Cosmic Dark Ages Observatory',
    question: 'What did the universe look like before the first stars formed?',
    summary: 'The lunar far side is the quietest radio environment in the inner Solar System, shielded by 3,474 km of rock from all Earth radio frequency interference.',
    currentEvidence: 'Low-frequency radio measurements require complete silence to detect the faint 21-cm hydrogen absorption signals from 100 million years after the Big Bang.',
    unansweredMystery: 'What dark matter interactions or cosmic filaments seeded the earliest structures in the universe?',
    nextGenerationMission: 'Deploying wire mesh dipole antennas over kilometers of far-side crater basins (Lunar Crater Radio Telescope).',
    tags: ['Cosmology', 'Far Side', 'Dark Ages', 'Radio Astronomy']
  },

  // --- MARS: WHAT WE KNOW ---
  {
    id: 'mars_know_water_past',
    planetId: 'mars',
    pillar: 'what_we_know',
    title: 'Ancient Lakes and Sustained River Deltas',
    question: 'Did Mars once have liquid water on its surface?',
    summary: 'Geomorphology from orbit and ground investigations by Curiosity and Perseverance prove Mars possessed active rivers, deep lakes, and groundwater systems 3.8 billion years ago.',
    currentEvidence: 'Sedimentary mudstones with clay minerals, rounded pebbles in conglomerate rocks, and layered fan deltas in Gale and Jezero craters.',
    unansweredMystery: 'Was ancient Mars warm and wet under a dense greenhouse atmosphere, or mostly cold and icy with transient volcanic heating episodes?',
    nextGenerationMission: 'Mars Sample Return: Bringing sealed titanium tubes back to Earth synchrotron labs for sub-nanometer isotopic analysis.',
    tags: ['Ancient Water', 'Jezero Delta', 'Sedimentology', 'Perseverance']
  },
  {
    id: 'mars_know_atmosphere_loss',
    planetId: 'mars',
    pillar: 'what_we_know',
    title: 'Atmospheric Stripping by the Solar Wind',
    question: 'Why did Mars transition from a wet world to a freeze-dried desert?',
    summary: 'NASA MAVEN spacecraft proved that when Mars\' core dynamo shut down ~4 billion years ago, the planet lost its global magnetic shield, allowing solar wind to strip its atmosphere.',
    currentEvidence: 'Isotope fractionation in atmospheric argon and carbon dioxide reveals that over 85% of Mars\' original atmosphere escaped into interplanetary space.',
    unansweredMystery: 'What specific core cooling event halted the magnetic geodynamo so early in planetary history compared to Earth?',
    nextGenerationMission: 'Deep mantle electromagnetic sounding array to map the Martian core-mantle boundary structure.',
    tags: ['Atmosphere', 'MAVEN', 'Solar Wind', 'Planetary Dynamo']
  },

  // --- MARS: WHAT WE ARE INVESTIGATING ---
  {
    id: 'mars_investigating_biosignatures',
    planetId: 'mars',
    pillar: 'what_we_are_investigating',
    title: 'The Search for Fossilized Microbial Biosignatures',
    question: 'Did microbial life ever evolve in Martian water bodies?',
    summary: 'Perseverance is caching rock cores rich in carbonates, sulfates, and fine-grained silica that on Earth are the premier preservers of ancient microfossils and stromatolites.',
    currentEvidence: 'Organic carbon molecules have been detected in mudstones by Curiosity (SAM instrument) and Perseverance (SHERLOC instrument), but biotic origin is not confirmed.',
    unansweredMystery: 'Are the detected organics remnants of ancient Martian biology or abiotic synthesis from meteoritic chondrites and Fischer-Tropsch geochemical reactions?',
    nextGenerationMission: 'Mars Sample Return campaign with biosignature verification in terrestrial ultra-clean containment laboratories.',
    tags: ['Astrobiology', 'Biosignatures', 'Organics', 'Sample Return']
  },
  {
    id: 'mars_investigating_subsurface_ice',
    planetId: 'mars',
    pillar: 'what_we_are_investigating',
    title: 'Vast Glaciers Buried Under Dust Sheets',
    question: 'How much water ice is preserved beneath the Martian surface today?',
    summary: 'Mars Express and Mars Reconnaissance Orbiter ground-penetrating radars (SHARAD) discovered massive sheets of pure water ice buried under 1 to 10 meters of soil across mid-latitudes.',
    currentEvidence: 'Exposed ice cliffs up to 100 meters thick visible in steep scarps, and fresh meteorite impacts that excavate brilliant white ice that sublimates into vapor.',
    unansweredMystery: 'Could localized geothermal heat create pockets of subglacial liquid brines that remain liquid beneath the ice sheets?',
    nextGenerationMission: 'International Mars Ice Mapper satellite equipped with L-band polarimetric radar to pinpoint accessible ice within 2 meters of the surface.',
    tags: ['Glaciers', 'Subsurface Radar', 'Water Ice', 'Resources']
  },

  // --- MARS: FUTURE EXPLORERS MAY DISCOVER ---
  {
    id: 'mars_future_moxie_settlement',
    planetId: 'mars',
    pillar: 'future_discoveries',
    title: 'Closed-Loop Martian Ecology & Oxygen Architecture',
    question: 'Can humans live self-sufficiently on the Red Planet?',
    summary: 'The MOXIE experiment on Perseverance proved that solid oxide electrolysis can extract 99.6% pure breathable oxygen directly from Mars\' thin CO₂ atmosphere.',
    currentEvidence: 'MOXIE generated over 122 grams of oxygen across 16 test runs in all Martian seasons, day and night.',
    unansweredMystery: 'Can large-scale automated plants extract thousands of tons of oxygen and combine it with drilled subsurface water to fuel return rocket ships before crew arrival?',
    nextGenerationMission: 'Megawatt-class surface nuclear fission reactors (Kilopower) coupled with autonomous chemical propellant refineries.',
    tags: ['Human Settlement', 'MOXIE', 'Life Support', 'Closed-Loop Ecology']
  },
  {
    id: 'mars_future_deep_biosphere',
    planetId: 'mars',
    pillar: 'future_discoveries',
    title: 'The Deep Subsurface Habitable Zone',
    question: 'Could living chemoautotrophic microbes exist kilometers beneath the Martian surface?',
    summary: 'On Earth, the deep continental crust harbors microorganisms that survive without sunlight using hydrogen from rock radiolytic water splitting.',
    currentEvidence: 'Mars Insight lander proved Mars has a fractured, porous crust with residual heat and seismic activity.',
    unansweredMystery: 'Does Mars harbor an extant deep biosphere living in warm saline aquifers 3 to 8 kilometers below the permafrost layer?',
    nextGenerationMission: 'Autonomous deep rotary diamond drilling rigs capable of penetrating 1+ kilometer into the subterranean crust.',
    tags: ['Deep Biosphere', 'Chemoautotrophs', 'Subterranean', 'Astrobiology']
  }
];
