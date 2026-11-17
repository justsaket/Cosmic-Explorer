import { QuizQuestion } from '../types';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // MOON QUESTIONS
  {
    id: 'quiz_lunar_gravity',
    discoveryId: 'lunar_regolith_sample',
    planetId: 'moon',
    question: 'How does the Moon\'s surface gravity compare to Earth\'s gravity?',
    options: [
      'It is exactly 1/6th of Earth\'s gravity (~1.62 m/s²)',
      'It is twice as strong as Earth\'s gravity',
      'It is exactly the same as Earth\'s gravity',
      'There is zero gravity on the Moon\'s surface'
    ],
    correctIndex: 0,
    explanation: 'Because the Moon has much less mass than Earth, its gravitational pull is only about 1.62 m/s², which is approximately 16.6% or one-sixth of Earth\'s 9.81 m/s².',
    funFact: 'An astronaut weighing 90 kg on Earth weighs only 15 kg on the lunar surface, allowing dramatic kangaroo leaps!',
    difficulty: 'easy'
  },
  {
    id: 'quiz_lunar_laser',
    discoveryId: 'lunar_laser_reflector',
    planetId: 'moon',
    question: 'What crucial scientific discovery did the Apollo Lunar Laser Ranging Retroreflector prove?',
    options: [
      'The Moon is spiraling away from Earth at roughly 3.8 cm per year',
      'The Moon has an active liquid water ocean beneath its surface',
      'The Moon rotates faster than Earth spins',
      'The Moon has an iron core larger than Earth\'s'
    ],
    correctIndex: 0,
    explanation: 'By timing laser pulses bounced off the corner-cube reflectors for over 50 years, astronomers proved that Earth\'s tidal friction causes the Moon to recede by about 3.8 centimeters annually.',
    funFact: 'The retroreflector array requires no electricity, functioning purely through optical geometry!',
    difficulty: 'medium'
  },
  {
    id: 'quiz_lunar_ice',
    discoveryId: 'lunar_water_ice',
    planetId: 'moon',
    question: 'Where is most water ice conserved on the Moon?',
    options: [
      'Inside permanently shadowed craters near the lunar poles',
      'Flowing in rivers across the Sea of Tranquility',
      'Trapped in clouds within the lunar atmosphere',
      'Inside volcanic geysers near the equator'
    ],
    correctIndex: 0,
    explanation: 'Because the Moon has a tiny axial tilt (only 1.5 degrees), deep polar craters never receive sunlight. The frigid temperatures (under -240°C) preserve comet water ice for billions of years.',
    funFact: 'This ice can be split by solar power into hydrogen and oxygen to manufacture rocket propellants for future voyages to Mars!',
    difficulty: 'easy'
  },
  {
    id: 'quiz_lunar_regolith',
    discoveryId: 'lunar_regolith_sample',
    planetId: 'moon',
    question: 'Why is lunar regolith (soil) extremely sharp and abrasive compared to Earth sand?',
    options: [
      'Without wind, rain, or an atmosphere, impact-shattered rocks never get eroded or smoothed',
      'Astronauts accidentally crushed it with their rover wheels',
      'It is made entirely of broken industrial glass manufactured by satellites',
      'The extreme gravity compressed the dirt into razor blades'
    ],
    correctIndex: 0,
    explanation: 'Earth sand is tumbled and rounded by oceans and atmospheric winds. On the airless Moon, hypervelocity micrometeorites shatter rock into jagged, glass-rich shards with razor-sharp edges.',
    funFact: 'During Apollo missions, abrasive regolith wore through the outer layers of spacesuit boots and smelled like spent gunpowder!',
    difficulty: 'medium'
  },
  {
    id: 'quiz_lunar_seismic',
    discoveryId: 'lunar_seismometer',
    planetId: 'moon',
    question: 'What do seismic experiments tell scientists about the interior structure of the Moon?',
    options: [
      'The Moon is layered with a crust, mantle, and metallic iron core',
      'The Moon is completely hollow inside',
      'The Moon is made entirely of uniform solid iron',
      'The Moon has an active molten magma ocean beneath the crust'
    ],
    correctIndex: 0,
    explanation: 'Seismic wave velocities recorded by Apollo instruments proved the Moon is differentiated into a crust, silicate mantle, and partially molten iron core, matching terrestrial planet models.',
    funFact: 'Because the Moon is dry, seismic vibrations ring like a bell for hours instead of dying down in minutes!',
    difficulty: 'hard'
  },

  // MARS QUESTIONS
  {
    id: 'quiz_mars_gravity',
    discoveryId: 'mars_perseverance_rover',
    planetId: 'mars',
    question: 'What is the surface gravity on Mars compared to Earth?',
    options: [
      'Approximately 38% of Earth\'s gravity (3.71 m/s²)',
      'Twice as strong as Earth\'s gravity',
      'Identical to the Moon (1.62 m/s²)',
      '100% of Earth\'s gravity'
    ],
    correctIndex: 0,
    explanation: 'Mars has roughly 11% of Earth\'s mass and a smaller radius, resulting in a surface gravity of 3.71 m/s²—around 38% of Earth\'s gravity.',
    funFact: 'If you can jump 1 meter high on Earth, you could jump nearly 2.6 meters high on Mars!',
    difficulty: 'easy'
  },
  {
    id: 'quiz_mars_jezero',
    discoveryId: 'mars_jezero_delta',
    planetId: 'mars',
    question: 'Why did NASA choose Jezero Crater as the landing site for the Perseverance rover?',
    options: [
      'It preserves an ancient river delta that deposited clay minerals capable of fossilizing biosignatures',
      'It is the hottest volcano on Mars',
      'It is the only place on Mars with currently active liquid rain',
      'It contains abandoned alien cities'
    ],
    correctIndex: 0,
    explanation: 'Orbital spectrometers found abundant smectite clays in Jezero\'s delta. On Earth, mud deposited in calm deltas is exceptional at preserving microscopic organic fossils.',
    funFact: 'Lake Jezero was once over 250 meters deep, fed by a river valley named Neretva Vallis!',
    difficulty: 'medium'
  },
  {
    id: 'quiz_mars_sample_return',
    discoveryId: 'mars_sample_tube',
    planetId: 'mars',
    question: 'What is special about the titanium tubes sealed by the Perseverance rover?',
    options: [
      'They contain hermetically sealed Martian rock cores intended to be returned to Earth',
      'They carry rocket fuel to power the rover',
      'They broadcast radio songs across the solar system',
      'They are pressurized drinking water bottles for astronauts'
    ],
    correctIndex: 0,
    explanation: 'Perseverance drills and seals rock cores in ultra-clean titanium tubes, caching them on the surface for a future international Mars Sample Return mission to bring to terrestrial laboratories.',
    funFact: 'Earth-based laboratories can detect chemical isotopes and fossils with billions of times greater sensitivity than a rover payload!',
    difficulty: 'easy'
  },
  {
    id: 'quiz_mars_methane',
    discoveryId: 'mars_methane_plume',
    planetId: 'mars',
    question: 'Why are atmospheric methane spikes on Mars of tremendous interest to astrobiologists?',
    options: [
      'Methane is quickly destroyed by sunlight, so something active (microbes or geology) must be replenishing it',
      'Methane proves that humans have already colonized Mars secretly',
      'Methane only exists when plants are actively photosynthesizing',
      'Methane makes Mars appear bright red'
    ],
    correctIndex: 0,
    explanation: 'Solar ultraviolet light breaks down methane within ~300 years. Its ongoing presence and seasonal fluctuations imply an active replenishing source: either subsurface microbes or deep water-rock reactions.',
    funFact: 'Curiosity\'s SAM spectrometer detected transient methane spikes up to 21 parts per billion in Gale Crater!',
    difficulty: 'hard'
  },
  {
    id: 'quiz_mars_riverbed',
    discoveryId: 'mars_ancient_riverbed',
    planetId: 'mars',
    question: 'What geological proof demonstrates that water once flowed vigorously in rivers on Mars?',
    options: [
      'Rounded pebbles and cobbles cemented in conglomerates',
      'Sharp jagged glass shards from volcanoes',
      'Pure salt crystals covering every rock',
      'Liquid puddles still sloshing around rover wheels'
    ],
    correctIndex: 0,
    explanation: 'Only sustained collisions inside flowing river water can grind angular broken rocks into smooth, rounded pebbles. Curiosity found gravel that traveled for kilometers down ancient streams.',
    funFact: 'Scientists calculated the river that tumbled these Martian pebbles flowed at roughly ankle to waist depth!',
    difficulty: 'medium'
  }
];
