import { CelestialBodyConfig, PlanetId } from '../types';

export const CELESTIAL_BODIES: Record<PlanetId, CelestialBodyConfig> = {
  sun: {
    id: 'sun',
    name: 'The Sun',
    subtitle: 'G-Type Main-Sequence Star (Yellow Dwarf)',
    diameterKm: 1392700,
    gravityMss: 274.0,
    atmosphere: 'Hydrogen (73.46%), Helium (24.85%) Plasma',
    dayLengthHours: 609.12,
    avgTempCelsius: 5500,
    distanceFromSunMillionKm: 0,
    radiusScene: 8.5,
    orbitRadius: 0,
    orbitSpeed: 0,
    rotationSpeed: 0.0025,
    baseColor: '#fbbf24',
    planetOrder: 0,
    kidComparison: 'Over 1.3 million Earths could fit inside the Sun!',
    probeHighlight: 'NASA Parker Solar Probe literally flies through the Sun’s outer corona.',
    description:
      'A luminous G-type star containing 99.86% of all mass in the solar system. Its photosphere glows at ~5,500°C with giant swirling magnetic storms.',
    quickFacts: [
      'Core fusion reaches 15,000,000°C turning hydrogen into helium',
      'Sunlight takes only 8 minutes and 20 seconds to reach Earth',
      'No solid ground—pure glowing ionized plasma and magnetic loops'
    ],
    scientificSignificance:
      'Provides gravity to hold all 8 planets in orbit and energy that drives weather and life on Earth.'
  },
  mercury: {
    id: 'mercury',
    name: 'Mercury',
    subtitle: '1st Planet • Swift Cratered Iron World',
    diameterKm: 4879,
    gravityMss: 3.7,
    atmosphere: 'Ultra-thin Exosphere (Oxygen, Sodium, Hydrogen)',
    dayLengthHours: 1407.6,
    avgTempCelsius: 167,
    distanceFromSunMillionKm: 57.9,
    radiusScene: 1.55,
    orbitRadius: 15.0,
    orbitSpeed: 0.011,
    rotationSpeed: 0.0022,
    baseColor: '#94a3b8',
    planetOrder: 1,
    moonCount: 0,
    kidComparison: 'Your weight on Mercury is only 38% of Earth—almost the same as on Mars!',
    probeHighlight: 'NASA MESSENGER orbited Mercury for 4 years and found water ice in polar craters.',
    description:
      'The smallest and fastest planet in the solar system, zipping around the Sun in just 88 Earth days across a heavily cratered silicate crust.',
    quickFacts: [
      'Swings from +430°C in sunlight to -180°C at night without air to trap heat',
      'Giant iron core makes up nearly 85% of the planet’s radius',
      'Zero moons and zero rings'
    ],
    scientificSignificance:
      'Helps planetary scientists understand how extreme solar heat and tidal forces shaped rocky inner planets.'
  },
  venus: {
    id: 'venus',
    name: 'Venus',
    subtitle: '2nd Planet • Super-Greenhouse Cloud World',
    diameterKm: 12104,
    gravityMss: 8.87,
    atmosphere: 'Dense Carbon Dioxide (96.5%) & Sulfuric Acid Clouds',
    dayLengthHours: 5832.5,
    avgTempCelsius: 464,
    distanceFromSunMillionKm: 108.2,
    radiusScene: 2.65,
    orbitRadius: 22.0,
    orbitSpeed: 0.0075,
    rotationSpeed: -0.0014,
    baseColor: '#facc15',
    planetOrder: 2,
    moonCount: 0,
    kidComparison: 'Venus spins backwards—so on Venus the Sun rises in the West and sets in the East!',
    probeHighlight: 'Upcoming NASA VERITAS & DAVINCI missions will map Venus through its thick clouds.',
    description:
      'Earth’s near-twin in size, wrapped in thick golden sulfuric clouds that trap runaway greenhouse heat hotter than an oven.',
    quickFacts: [
      'Hottest planet in the solar system (464°C)—hot enough to melt lead',
      'One day on Venus lasts longer than its entire year around the Sun',
      'Covered by thousands of ancient volcanoes and vast lava plains'
    ],
    scientificSignificance:
      'Shows how runaway carbon dioxide greenhouse warming can transform a once-temperate rocky world.'
  },
  earth: {
    id: 'earth',
    name: 'Earth',
    subtitle: '3rd Planet • Mission HQ & Living Ocean World',
    diameterKm: 12742,
    gravityMss: 9.81,
    atmosphere: 'Nitrogen (78%), Oxygen (21%), Argon (0.9%)',
    dayLengthHours: 24,
    avgTempCelsius: 15,
    distanceFromSunMillionKm: 149.6,
    radiusScene: 3.15,
    orbitRadius: 33.0,
    orbitSpeed: 0.0052,
    rotationSpeed: 0.007,
    baseColor: '#2563eb',
    planetOrder: 3,
    moonCount: 1,
    kidComparison: 'Our cosmic home! A 30 kg explorer weighs 30 kg here—the benchmark for every planet.',
    probeHighlight: 'Kennedy Space Center launches our Space Shuttle toward the Moon and Mars.',
    description:
      'Our blue ocean marble—the third rock from the Sun and only known world harboring life, protected by a magnetic shield and breathable sky.',
    quickFacts: [
      'Liquid water oceans cover 71% of the planetary crust',
      'Molten iron core generates a magnetic shield blocking solar storms',
      'Home to NASA Kennedy Space Center and Mission Control'
    ],
    scientificSignificance:
      'The living reference baseline for planetary habitability, geology, and biosphere resilience.'
  },
  moon: {
    id: 'moon',
    name: 'The Moon',
    subtitle: 'Earth’s Natural Satellite • Apollo & Artemis Base',
    diameterKm: 3474,
    gravityMss: 1.62,
    atmosphere: 'Ultra-thin Vacuum Exosphere',
    dayLengthHours: 708.7,
    avgTempCelsius: -20,
    distanceFromSunMillionKm: 149.6,
    radiusScene: 1.45,
    orbitRadius: 7.2,
    orbitSpeed: 0.014,
    rotationSpeed: 0.004,
    baseColor: '#e2e8f0',
    moonCount: 0,
    kidComparison: 'Six times lighter! A 30 kg kid weighs just 5 kg here and can jump 6x higher!',
    probeHighlight: 'Explore 4 real historical installations: Apollo LM Eagle, LRV Buggy, ALSEP & Surveyor 3.',
    description:
      'Our battered, silver-grey companion preserving 4.5 billion years of cosmic craters and the historic footprints of Apollo astronauts.',
    quickFacts: [
      '1/6th Earth gravity lets astronauts bound effortlessly across craters',
      'Shackleton Crater rim holds sunlight while dark craters trap water ice',
      'Stepping stone for NASA’s Artemis sustainable lunar exploration'
    ],
    scientificSignificance:
      'Acts as a fossil record of early solar system impacts and a proving ground for human deep-space flight.'
  },
  mars: {
    id: 'mars',
    name: 'Mars',
    subtitle: '4th Planet • The Red Frontier & Ancient Rivers',
    diameterKm: 6779,
    gravityMss: 3.71,
    atmosphere: 'Carbon Dioxide (95.3%), Nitrogen (2.6%), Argon (1.9%)',
    dayLengthHours: 24.62,
    avgTempCelsius: -62,
    distanceFromSunMillionKm: 227.9,
    radiusScene: 2.35,
    orbitRadius: 45.5,
    orbitSpeed: 0.0038,
    rotationSpeed: 0.0062,
    baseColor: '#ea580c',
    planetOrder: 4,
    moonCount: 2,
    kidComparison: 'A 30 kg explorer weighs only 11.3 kg on Mars—38% of Earth’s pull!',
    probeHighlight: 'Visit 9 real Mars & Deep Space sites including Sojourner, Curiosity & Ingenuity helicopter!',
    description:
      'The rusty Red Planet, carved by ancient rivers and giant canyons like Valles Marineris, plus Olympus Mons—a volcano three times taller than Everest.',
    quickFacts: [
      'Mars days ("Sols") are 24 hours 37 minutes—almost identical to Earth!',
      'Jezero Crater was once an ancient lake fed by flowing rivers',
      'Orbiters, landers, rovers, and even the Ingenuity helicopter explored its skies'
    ],
    scientificSignificance:
      'Humanity’s top target for searching for ancient microbial life and future planetary exploration.'
  },
  jupiter: {
    id: 'jupiter',
    name: 'Jupiter',
    subtitle: '5th Planet • King of Gas Giants & Great Red Spot',
    diameterKm: 139820,
    gravityMss: 24.79,
    atmosphere: 'Hydrogen (89.8%), Helium (10.2%), Ammonia Clouds',
    dayLengthHours: 9.93,
    avgTempCelsius: -110,
    distanceFromSunMillionKm: 778.5,
    radiusScene: 5.8,
    orbitRadius: 68.0,
    orbitSpeed: 0.0022,
    rotationSpeed: 0.014,
    baseColor: '#d97706',
    planetOrder: 5,
    isGasGiant: true,
    moonCount: 95,
    kidComparison: 'A 30 kg kid would feel 2.5x heavier (76 kg)! Over 1,300 Earths fit inside Jupiter!',
    probeHighlight: 'NASA Juno spacecraft & Europa Clipper explore Jupiter’s storms and icy ocean moon.',
    description:
      'The largest planet in the solar system—a giant swirling world of striped ammonia clouds and a hurricane larger than Earth called the Great Red Spot.',
    quickFacts: [
      'Spins fastest of any planet—one full Jupiter day lasts under 10 hours!',
      'Surrounded by 95 moons including volcanic Io and icy ocean Europa',
      'No solid surface to walk on—deep liquid metallic hydrogen interior'
    ],
    scientificSignificance:
      'Its giant gravity acts like a cosmic shield deflecting comets away from the inner planets.'
  },
  saturn: {
    id: 'saturn',
    name: 'Saturn',
    subtitle: '6th Planet • Jewel of the Solar System & Icy Rings',
    diameterKm: 116460,
    gravityMss: 10.44,
    atmosphere: 'Hydrogen (96.3%), Helium (3.25%), Golden Haze',
    dayLengthHours: 10.7,
    avgTempCelsius: -140,
    distanceFromSunMillionKm: 1434,
    radiusScene: 4.85,
    orbitRadius: 90.0,
    orbitSpeed: 0.0016,
    rotationSpeed: 0.012,
    baseColor: '#eab308',
    planetOrder: 6,
    isGasGiant: true,
    moonCount: 146,
    kidComparison: 'Saturn is less dense than water—if you had a giant bathtub, Saturn would float!',
    probeHighlight: 'NASA Cassini orbiter studied Saturn’s rings for 13 years and landed Huygens on Titan.',
    description:
      'Celebrated for its dazzling rings of billions of sparkling ice and rock chunks spanning 282,000 km wide yet thin as a skyscraper.',
    quickFacts: [
      'Rings are made of water ice from dust grains to house-sized icebergs',
      'Largest moon Titan has liquid methane lakes and a thick nitrogen sky',
      'North pole features a mysterious giant six-sided hexagon jet stream'
    ],
    scientificSignificance:
      'A natural laboratory revealing how planetary rings, moons, and miniature solar systems form.'
  },
  uranus: {
    id: 'uranus',
    name: 'Uranus',
    subtitle: '7th Planet • Sideways Tilted Ice Giant',
    diameterKm: 50724,
    gravityMss: 8.69,
    atmosphere: 'Hydrogen (82.5%), Helium (15.2%), Methane (2.3%)',
    dayLengthHours: 17.24,
    avgTempCelsius: -195,
    distanceFromSunMillionKm: 2871,
    radiusScene: 3.55,
    orbitRadius: 112.0,
    orbitSpeed: 0.0011,
    rotationSpeed: -0.009,
    baseColor: '#67e8f9',
    planetOrder: 7,
    isGasGiant: true,
    moonCount: 28,
    kidComparison: 'Uranus rolls around the Sun on its side at a 98° tilt—and has weaker gravity than Earth!',
    probeHighlight: 'NASA Voyager 2 flew past Uranus in 1986 and discovered 10 new moons & vertical rings.',
    description:
      'An icy aqua-blue giant tipped completely onto its side, giving its poles 42 years of continuous summer daylight followed by 42 years of winter night.',
    quickFacts: [
      'Methane gas absorbs red sunlight, giving Uranus its serene cyan color',
      'Rotates sideways at a 98-degree axial tilt with faint vertical rings',
      'Coldest planetary atmosphere recorded in the solar system (-224°C)'
    ],
    scientificSignificance:
      'Represents the most common class of planets ("ice giants") discovered orbiting distant stars.'
  },
  neptune: {
    id: 'neptune',
    name: 'Neptune',
    subtitle: '8th Planet • Supersonic Cobalt Storm World',
    diameterKm: 49244,
    gravityMss: 11.15,
    atmosphere: 'Hydrogen (80%), Helium (19%), Methane Clouds',
    dayLengthHours: 16.11,
    avgTempCelsius: -200,
    distanceFromSunMillionKm: 4495,
    radiusScene: 3.45,
    orbitRadius: 132.0,
    orbitSpeed: 0.0008,
    rotationSpeed: 0.0095,
    baseColor: '#3b82f6',
    planetOrder: 8,
    isGasGiant: true,
    moonCount: 16,
    kidComparison: 'Neptune winds blast faster than supersonic fighter jets—over 2,100 km/h!',
    probeHighlight: 'NASA Voyager 2 photographed Triton’s icy nitrogen geysers during its 1989 flyby.',
    description:
      'The most distant major planet—a deep cobalt-blue ice giant whipped by the fastest winds in the solar system, taking 165 Earth years per orbit.',
    quickFacts: [
      'First planet discovered using mathematics before anyone saw it in a telescope!',
      'Completed its first full orbit since its 1846 discovery only in 2011',
      'Largest moon Triton orbits backwards and erupts cold nitrogen plumes'
    ],
    scientificSignificance:
      'Marks the outer frontier of the planetary neighborhood bordering the icy Kuiper Belt.'
  }
};
