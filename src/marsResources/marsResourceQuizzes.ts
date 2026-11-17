import { MarsAndSpaceQuizQuestion, MarsAndSpaceResourceId } from './marsResourceTypes';

export const MARS_AND_SPACE_QUIZZES: Record<MarsAndSpaceResourceId, MarsAndSpaceQuizQuestion[]> = {
  sojourner: [
    {
      id: 'soj_q1',
      resourceId: 'sojourner',
      discoveryId: 'mars_pathfinder_sojourner',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'On what date did Mars Pathfinder land on Ares Vallis, and when did Sojourner roll down the ramp onto Mars?',
      options: [
        'Landed July 4, 1997; rolled down ramp July 5, 1997',
        'Landed July 20, 1976; rolled down ramp July 28, 1976',
        'Landed January 3, 2004; rolled down ramp January 25, 2004',
        'Landed April 19, 2021; deployed May 2021'
      ],
      correctIndex: 0,
      explanation: 'Pathfinder bounced to a stop at Ares Vallis on July 4, 1997, and Sojourner drove down the forward ramp onto Martian soil on July 5, 1997 (first ramp imagery was published July 6).',
      funFact: 'Sojourner weighed just 10.6 kg (~23 lb) and stood only about 30 cm tall!'
    },
    {
      id: 'soj_q2',
      resourceId: 'sojourner',
      discoveryId: 'mars_pathfinder_sojourner',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'How did Mars Pathfinder absorb the impact shock of hitting the Martian surface without heavy landing legs?',
      options: [
        'Giant pressurized multi-lobe airbags surrounding the tetrahedral lander',
        'A sky-crane tether lowering it gently by cables',
        'Giant glider wings landing on a prepared runway',
        'Ocean splashdown in a salty Martian sea'
      ],
      correctIndex: 0,
      explanation: 'After supersonic parachute deceleration and retro-rocket firing, 24-lobe airbags cushioned Pathfinder across more than a dozen bounces on Ares Vallis.',
      funFact: 'The tetrahedral three-petal design guaranteed the lander could upright itself no matter which side landed down.'
    },
    {
      id: 'soj_q3',
      resourceId: 'sojourner',
      discoveryId: 'mars_pathfinder_sojourner',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'Who was the Sojourner rover named after following NASA’s student naming essay contest?',
      options: [
        'Abolitionist and women’s rights advocate Sojourner Truth',
        'A 19th-century Martian canal astronomer',
        'The chief propulsion engineer at JPL',
        'An ancient Roman deity of travelers'
      ],
      correctIndex: 0,
      explanation: 'Twelve-year-old Valerie Ambroise won the contest by suggesting Sojourner Truth, whose name also means "traveler."',
      funFact: 'Pathfinder itself was informally renamed the Carl Sagan Memorial Station after landing.'
    },
    {
      id: 'soj_q4',
      resourceId: 'sojourner',
      discoveryId: 'mars_pathfinder_sojourner',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'How did Sojourner send its scientific data and rock close-up images back to engineers on Earth?',
      options: [
        'It relayed data over a UHF radio link through the Pathfinder lander base station',
        'It aimed a 3-meter high-gain dish directly at Earth',
        'It stored data on cartridges retrieved later by astronauts',
        'It signaled Earth using Morse-code laser flashes'
      ],
      correctIndex: 0,
      explanation: 'Sojourner lacked a deep-space dish; its short-range UHF modem talked to the Pathfinder lander, which beamed telemetry home.',
      funFact: 'Losing contact with the Pathfinder lander on September 27, 1997 also ended communications with Sojourner.'
    },
    {
      id: 'soj_q5',
      resourceId: 'sojourner',
      discoveryId: 'mars_pathfinder_sojourner',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'Which famous rock was the first Mars rock ever chemically analyzed by Sojourner’s APXS sensor?',
      options: [
        'Barnacle Bill',
        'Occator Bright Spot',
        'Home Plate Silica',
        'Dodo-Goldilocks'
      ],
      correctIndex: 0,
      explanation: 'APXS showed "Barnacle Bill" was high in silica, resembling terrestrial volcanic andesites, alongside later targets Yogi and crust Scooby-Doo.',
      funFact: 'The whimsical rock names helped geologists track individual targets across boulders in Ares Vallis.'
    },
    {
      id: 'soj_q6',
      resourceId: 'sojourner',
      discoveryId: 'mars_pathfinder_sojourner',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'What did Pathfinder and Sojourner’s Ares Vallis observations reveal about Mars—and did they prove Martian life?',
      options: [
        'Evidence of ancient catastrophic floods and water-shaped rocks; they did NOT prove life',
        'Direct fossilized bacteria inside Barnacle Bill',
        'Mars never had liquid water at any time',
        'Subsurface liquid oceans directly beneath Pathfinder’s legs'
      ],
      correctIndex: 0,
      explanation: 'Rounded cobbles, stacked boulders, and outflow channels point to a warmer, wetter ancient Mars, but Pathfinder carried no life-detection proof.',
      funFact: 'Pathfinder was led by JPL Project Manager Tony Spear, Mission Manager Richard Cook, Project Scientist Matthew Golombek, and IMP lead Peter Smith.'
    },
    {
      id: 'soj_q7',
      resourceId: 'sojourner',
      discoveryId: 'mars_pathfinder_sojourner',
      planetId: 'mars',
      difficulty: 'hard',
      question: 'Sojourner was designed for a 7-day primary mission. How long did it actually operate before its final transmission on September 27, 1997?',
      options: [
        '83 days (official mission conclusion March 10, 1998)',
        'Exactly 7 days',
        '14 years across 45 kilometers',
        '6 months powered by plutonium RTGs'
      ],
      correctIndex: 0,
      explanation: 'Sojourner operated 83 days—nearly twelve times its 7-day planned lifetime—until Pathfinder’s final data transmission on September 27, 1997 (formally ended March 10, 1998).',
      funFact: 'Every Mars rover since—Spirit, Opportunity, Curiosity, and Perseverance—traces its six-wheel rocker-bogie heritage straight back to Sojourner.'
    }
  ],

  spirit_opportunity: [
    {
      id: 'mer_q1',
      resourceId: 'spirit_opportunity',
      discoveryId: 'mars_mer_twins',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'What were Spirit and Opportunity’s original planned surface lifetimes (warranty)?',
      options: [
        '90 Martian days (sols)',
        '7 Earth days',
        '10 Earth years',
        '30 Earth days'
      ],
      correctIndex: 0,
      explanation: 'Both 185 kg Mars Exploration Rovers were designed for a 90-sol prime mission (~92.5 Earth days), yet lasted years thanks to wind cleaning solar panels.',
      funFact: 'Martian dust devils unexpectedly swept Opportunity’s and Spirit’s solar arrays clean multiple times!'
    },
    {
      id: 'mer_q2',
      resourceId: 'spirit_opportunity',
      discoveryId: 'mars_mer_twins',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'Which two Martian regions did Spirit and Opportunity explore respectively?',
      options: [
        'Spirit at Gusev Crater; Opportunity at Meridiani Planum',
        'Spirit at Jezero Crater; Opportunity at Chryse Planitia',
        'Both landed side-by-side inside Ares Vallis',
        'Spirit at Vastitas Borealis; Opportunity on asteroid Vesta'
      ],
      correctIndex: 0,
      explanation: 'Spirit (MER-A) touched down at Gusev Crater on Jan 3 PST / Jan 4 UTC, 2004, while Opportunity (MER-B) bounced into Eagle Crater on Meridiani Planum on Jan 24 PST / Jan 25 UTC, 2004.',
      funFact: 'Sending twin rovers to opposite sides of Mars let scientists test global—not just local—evidence of ancient Martian water.'
    },
    {
      id: 'mer_q3',
      resourceId: 'spirit_opportunity',
      discoveryId: 'mars_mer_twins',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'What mineral spheres nicknamed "blueberries" did Opportunity find embedded in Meridiani Planum bedrock?',
      options: [
        'Iron-rich hematite concretions formed in groundwater',
        'Frozen liquid-nitrogen droplets',
        'Artificial titanium bearings left by Viking',
        'Organic algae colonies'
      ],
      correctIndex: 0,
      explanation: 'The grey-blue spherical pebbles turned out to be crystalline hematite concretions grown inside porous rock saturated by ancient groundwater.',
      funFact: 'Combined with jarosite sulfates, they confirmed acidic liquid water once soaked Meridiani Planum.'
    },
    {
      id: 'mer_q4',
      resourceId: 'spirit_opportunity',
      discoveryId: 'mars_mer_twins',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'Which instrument on the rovers’ IDD robotic arm ground ~5 mm beneath dusty weathering rinds to reveal fresh interior rock?',
      options: [
        'RAT — Rock Abrasion Tool',
        'MAWD Water Vapor Detector',
        'SNAP-19 Radioisotope Generator',
        'Laser Altimeter'
      ],
      correctIndex: 0,
      explanation: 'The diamond-tipped Rock Abrasion Tool brushed away loose dust and milled circular holes into fresh Martian bedrock for MI, APXS, and Mössbauer scans.',
      funFact: 'NASA scientists called the RAT the "geologist’s rock hammer" in space.'
    },
    {
      id: 'mer_q5',
      resourceId: 'spirit_opportunity',
      discoveryId: 'mars_mer_twins',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'In Gusev Crater’s Columbia Hills, what unexpected discovery did Spirit’s dragging crippled wheel uncover near Home Plate?',
      options: [
        'Nearly pure silica deposits formed by ancient hot springs or volcanic steam',
        'Pools of liquid brine sitting in shadow',
        'Thick limestone coral reefs',
        'Fossilized fern leaves'
      ],
      correctIndex: 0,
      explanation: 'When Spirit’s right-front wheel locked up, dragging it carved trenches exposing bright >90% silica—hallmark of hydrothermal hot-spring activity!',
      funFact: 'Hot springs are considered prime habitats for ancient microbial chemistry on early Earth and early Mars.'
    },
    {
      id: 'mer_q6',
      resourceId: 'spirit_opportunity',
      discoveryId: 'mars_mer_twins',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'Approximately how far did Opportunity drive across Mars before the 2018 global dust storm ended its mission?',
      options: [
        '~45.16 km (28.06 miles)',
        '~1.2 km',
        '~7.7 km',
        '~105 meters'
      ],
      correctIndex: 0,
      explanation: 'Opportunity drove ~45.16 km over 14+ years—more than a full Earth marathon—while Spirit drove ~7.7 km (~7.73 km).',
      funFact: 'Note: NASA’s Perseverance rover surpassed Opportunity’s ~45.16 km off-Earth driving distance record on October 11, 2026!'
    },
    {
      id: 'mer_q7',
      resourceId: 'spirit_opportunity',
      discoveryId: 'mars_mer_twins',
      planetId: 'mars',
      difficulty: 'hard',
      question: 'What ended Spirit’s communications (last heard March 22, 2010; mission ended May 25, 2011)?',
      options: [
        'Becoming embedded in soft sulfate sand ("Troy") in 2009, unable to tilt panels toward winter sunlight',
        'A rotor blade crash inside Jezero Crater',
        'Running out of hydrazine thruster fuel in dwarf-planet orbit',
        'Striking a deep borehole with HP³'
      ],
      correctIndex: 0,
      explanation: 'Because Spirit got bogged down in soft sand during Martian autumn 2009, it couldn’t drive onto a north-facing slope for winter solar charging.',
      funFact: 'Spirit’s final transmission occurred March 22, 2010; NASA officially concluded recovery efforts May 25, 2011.'
    },
    {
      id: 'mer_q8',
      resourceId: 'spirit_opportunity',
      discoveryId: 'mars_mer_twins',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'What caused NASA to lose contact with Opportunity on June 10, 2018 (mission ended February 13, 2019)?',
      options: [
        'A massive planet-encircling Martian dust storm blotted out sunlight to its solar panels',
        'Its nuclear plutonium generator decayed away',
        'It drove into a volcano crater lava lake',
        'It collided with Viking 1 Lander'
      ],
      correctIndex: 0,
      explanation: 'In June 2018 a global dust storm darkened skies over Perseverance Valley so thickly that Opportunity entered a low-power sleep from which it never woke.',
      funFact: 'Engineers sent over 800 recovery commands before bidding Opportunity farewell on Feb 13, 2019.'
    },
    {
      id: 'mer_q9',
      resourceId: 'spirit_opportunity',
      discoveryId: 'mars_mer_twins',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'Which rover later surpassed Opportunity’s ~45.16 km off-Earth driving distance record on October 11, 2026?',
      options: [
        'Perseverance rover',
        'Sojourner rover',
        'Phoenix lander',
        'Pioneer 11'
      ],
      correctIndex: 0,
      explanation: 'Opportunity held the ~45.16 km record for years until NASA’s nuclear-powered Perseverance rover surpassed Opportunity’s off-Earth driving distance record on October 11, 2026.',
      funFact: 'Together, NASA Mars rovers have logged well over 100 kilometers of off-world geology!'
    },
    {
      id: 'mer_q10',
      resourceId: 'spirit_opportunity',
      discoveryId: 'mars_mer_twins',
      planetId: 'mars',
      difficulty: 'hard',
      question: 'Why did MER rovers carry Magnet Arrays alongside Pancam and Mössbauer/APXS?',
      options: [
        'To capture airborne magnetic dust grains so spectrometers could identify iron-oxide minerals in Martian dust',
        'To levitate the rovers over boulders',
        'To steer Opportunity using Mars’s global compass poles',
        'To attract metallic asteroids from the sky'
      ],
      correctIndex: 0,
      explanation: 'Nearly all Martian airborne dust turned out to be strongly magnetic due to tiny titanium-magnetite grains trapped on the rover magnets.',
      funFact: 'Mini-TES inside the warm rover body also peered through a periscope mirror atop the Pancam mast to spot water-altered clays & sulfates remotely.'
    }
  ],

  viking_1: [
    {
      id: 'vik_q1',
      resourceId: 'viking_1',
      discoveryId: 'mars_viking_1',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'In Viking 1, what happened to the 2,339 kg Orbiter versus the 978 kg Lander on July 20, 1976?',
      options: [
        'Only the stationary Lander touched down at Chryse Planitia while the Orbiter stayed permanently in Mars orbit',
        'Both spacecraft landed together on Mars using airbags',
        'The Lander stayed in orbit and only the Orbiter drove across Mars',
        'Neither reached Mars; both flew past Jupiter'
      ],
      correctIndex: 0,
      explanation: 'Viking 1 Orbiter stayed in Mars orbit (mapping terrain & relaying telemetry) while only the stationary RTG-powered Lander separated at 08:32 UT and landed at 11:53:06 UT.',
      funFact: 'Viking 1 was launched August 20, 1975 aboard a Titan IIIE-Centaur rocket.'
    },
    {
      id: 'vik_q2',
      resourceId: 'viking_1',
      discoveryId: 'mars_viking_1',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'Why did NASA delay Viking 1’s originally scheduled July 4, 1976 landing until July 20, 1976?',
      options: [
        'Viking Orbiter photos revealed the initial Chryse site was too rough and boulder-strewn, prompting relocation to 22.483° N, 47.94° W',
        'Because Viking 1 had to fly past Venus first',
        'To wait for Perseverance to clear the landing pad',
        'Because Mars rotated too fast in early July'
      ],
      correctIndex: 0,
      explanation: 'High-res orbiter imaging saved the lander from jagged terrain by selecting safer western slopes of Chryse Planitia (22.483° N, 47.94° W).',
      funFact: 'Touchdown occurred on the seventh anniversary of Apollo 11’s lunar landing—July 20!'
    },
    {
      id: 'vik_q3',
      resourceId: 'viking_1',
      discoveryId: 'mars_viking_1',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'How did the stationary Viking 1 Lander power its instruments for over six years through dust storms?',
      options: [
        'Two SNAP-19 plutonium-238 radioisotope thermoelectric generators (RTGs)',
        'Six bicycle dynamos',
        'Only non-rechargeable flashlights',
        'Xenon ion thrusters buried underground'
      ],
      correctIndex: 0,
      explanation: 'Unlike the solar-powered Viking Orbiter, Viking Lander 1 used two SNAP-19 RTGs converting nuclear decay heat directly into steady electricity.',
      funFact: 'RTGs kept Viking 1 warm even during -86°C Martian dawn temperatures!'
    },
    {
      id: 'vik_q4',
      resourceId: 'viking_1',
      discoveryId: 'mars_viking_1',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'Which statement is historically TRUE about Viking 1 Lander’s seismometer?',
      options: [
        'Viking 1’s seismometer failed to uncage and did NOT operate successfully',
        'It detected 1,319 marsquakes and mapped the molten core',
        'It walked 10 km away from the lander on wheels',
        'It doubled as a helicopter rotor'
      ],
      correctIndex: 0,
      explanation: 'Historical accuracy check: Viking 1’s seismometer failed to uncage on landing (Viking 2’s worked only slightly and mostly sensed wind gusts). True marsquake discovery awaited InSight in 2018!',
      funFact: 'Viking 1’s robotic soil sampler arm first successfully dug Martian soil on July 28, 1976.'
    },
    {
      id: 'vik_q5',
      resourceId: 'viking_1',
      discoveryId: 'mars_viking_1',
      planetId: 'mars',
      difficulty: 'hard',
      question: 'Why did the "Did Viking Find Life?" question remain scientifically UNCONFIRMED?',
      options: [
        'One biology test (Labeled Release) showed reactive gas release, yet the GCMS detected zero Martian organic carbon molecules',
        'The camera photographed green trees growing on Chryse Planitia',
        'The lander burned up before touching down',
        'Both biology and GCMS confirmed Martian fish'
      ],
      correctIndex: 0,
      explanation: 'Oxidizing perchlorate-like soil chemistry could mimic metabolic gas release, and because GCMS found no organic carbon, scientists concluded Viking did not confirm Martian life.',
      funFact: 'Matching gas trapped in Earth SNC meteorites with Viking’s atmospheric measurements later proved those meteorites came from Mars!'
    },
    {
      id: 'vik_q6',
      resourceId: 'viking_1',
      discoveryId: 'mars_viking_1',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'How did Viking 1’s two facsimile cameras construct the very first crisp Mars surface photographs?',
      options: [
        'Scanning narrow vertical strips line-by-line across the landscape',
        'Dropping film canisters back to Earth by rocket',
        'Using X-ray diffraction plates',
        'Projecting holograms onto Phobos'
      ],
      correctIndex: 0,
      explanation: 'A nodding mirror and photodiode scanned vertical columns line-by-line, building a sharp footpad close-up and sweeping 300° panoramas.',
      funFact: 'Temperatures at Chryse swung from -86°C just before dawn to -33°C in the afternoon.'
    },
    {
      id: 'vik_q7',
      resourceId: 'viking_1',
      discoveryId: 'mars_viking_1',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'What vast global orbital mapping achievement did Viking 1 and Viking 2 Orbiters accomplish together?',
      options: [
        'Captured 52,663 images mapping roughly 97% of Mars at ~300 m resolution',
        'Landed inside Valles Marineris',
        'Photographed every exoplanet in Cygnus',
        'Circled Saturn’s F ring'
      ],
      correctIndex: 0,
      explanation: 'For decades, Viking Orbiter imagery (52,663 combined photos, ~97% global coverage at ~300 m) served as humanity’s primary base atlas of Mars.',
      funFact: 'Viking Lander 1 was renamed the Thomas Mutch Memorial Station in January 1982.'
    },
    {
      id: 'vik_q8',
      resourceId: 'viking_1',
      discoveryId: 'mars_viking_1',
      planetId: 'mars',
      difficulty: 'hard',
      question: 'When did Viking 1 Lander send its final transmission before an antenna pointing error silenced it?',
      options: [
        'November 11, 1982 (with some mission summaries noting November 13 loss of recovery)',
        'July 29, 1976',
        'December 15, 2022',
        'September 27, 1997'
      ],
      correctIndex: 0,
      explanation: 'A memory update overwrote antenna pointing software on Nov 11, 1982; contact was lost around Nov 11–13, 1982 after more than six years of Mars surface operations!',
      funFact: 'That longevity record on Mars stood for nearly 28 years until Opportunity surpassed it in 2010.'
    }
  ],

  phoenix_insight: [
    {
      id: 'pi_q1',
      resourceId: 'phoenix_insight',
      discoveryId: 'mars_phoenix_insight',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'Which statement accurately describes the mobility of both Phoenix (2008) and InSight (2018)?',
      options: [
        'Both were STATIONARY three-legged landers with robotic arms—neither had wheels or drove',
        'Both were 6-wheeled rovers that drove over 30 km',
        'Phoenix was a helicopter and InSight was an orbiter',
        'Only Phoenix stayed in orbit while InSight drove'
      ],
      correctIndex: 0,
      explanation: 'Both Phoenix and InSight were stationary fixed-deck landers—every trench dig and seismometer placement relied on their precision robotic arms.',
      funFact: 'Phoenix used a 2.35 m arm at Mars’s Arctic (~68.22° N), while InSight used a 1.8 m arm near Mars’s equator (~4.5° N).'
    },
    {
      id: 'pi_q2',
      resourceId: 'phoenix_insight',
      discoveryId: 'mars_phoenix_insight',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'Where and when did NASA’s Phoenix lander touch down on Mars?',
      options: [
        'May 25, 2008 (23:38:38 UT) in Mars’s northern Arctic plain Vastitas Borealis (~68.22° N)',
        'November 26, 2018 at Elysium Planitia',
        'July 4, 1997 at Ares Vallis',
        'February 18, 2021 at Jezero Crater'
      ],
      correctIndex: 0,
      explanation: 'Launched August 4, 2007 on a Delta II, Phoenix landed May 25, 2008 23:38:38 UT—even photographed descending on parachute by MRO’s HiRISE camera!',
      funFact: 'Orbital gamma-ray maps had predicted huge ice sheets just centimeters under the northern plains.'
    },
    {
      id: 'pi_q3',
      resourceId: 'phoenix_insight',
      discoveryId: 'mars_phoenix_insight',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'In Phoenix’s "Dodo-Goldilocks" trench, what happened to the exposed bright white lumps between May 31 and June 19, 2008—proving they were water ice rather than salt?',
      options: [
        'They vanished directly into water vapor by sublimation (confirmed by TEGA heating on July 31)',
        'They melted into flowing rivers inside the crater',
        'Wind blew blue quartz pebbles onto the trench',
        'They turned into metallic iron under sunlight'
      ],
      correctIndex: 0,
      explanation: 'Salt crust cannot evaporate into gas at -50°C Martian temperatures; watching the bright dice-sized lumps sublimate away proved they were frozen water ice—further verified by TEGA.',
      funFact: 'Phoenix’s laser lidar also spotted falling snow from high Martian clouds!'
    },
    {
      id: 'pi_q4',
      resourceId: 'phoenix_insight',
      discoveryId: 'mars_phoenix_insight',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'What surprising reactive salt did Phoenix’s wet-chemistry MECA lab discover in Arctic Martian soil?',
      options: [
        'Perchlorates (oxidizing salts affecting chemistry & liquid freezing points)',
        'Table sugar crystals',
        'Pure uranium hexafluoride',
        'Liquid sulfuric acid pools'
      ],
      correctIndex: 0,
      explanation: 'Perchlorate salts help explain why earlier Viking biology tests reacted oddly and can act as both chemical oxidizers and anti-freeze in cold brines.',
      funFact: 'MECA also showed the Arctic soil was mildly alkaline (~pH 7.7) with carbonate minerals.'
    },
    {
      id: 'pi_q5',
      resourceId: 'phoenix_insight',
      discoveryId: 'mars_phoenix_insight',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'Why did Phoenix end communications on November 2, 2008?',
      options: [
        'Worsening Arctic winter darkness, dust, and freezing CO2 dry-ice frost starved its solar panels of power',
        'Its plutonium RTG fell off the deck',
        'Astronauts packed it up',
        'It crashed into Vesta'
      ],
      correctIndex: 0,
      explanation: 'Built for an Arctic summer mission, Phoenix had no heaters strong enough to survive permanent polar winter darkness and solid dry-ice buildup.',
      funFact: 'Mars Reconnaissance Orbiter later photographed winter dry-ice sheets covering the silent lander.'
    },
    {
      id: 'pi_q6',
      resourceId: 'phoenix_insight',
      discoveryId: 'mars_phoenix_insight',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'Which pair of experimental CubeSats launched alongside InSight on May 5, 2018 (Atlas V-401) to relay its Nov 26 landing live?',
      options: [
        'MarCO-A and MarCO-B (Mars Cube One)',
        'Pioneer 10 and Pioneer 11',
        'Viking 1 and Viking 2 Orbiters',
        'Voyager 1 and Dawn'
      ],
      correctIndex: 0,
      explanation: 'Briefcase-sized twins MarCO-A and MarCO-B became the first CubeSats to fly into deep space, beaming InSight’s Nov 26, 2018 (11:52:59 AM PT) landing telemetry straight to Earth.',
      funFact: 'They were nicknamed "WALL-E" and "EVE" by the JPL CubeSat engineering team!'
    },
    {
      id: 'pi_q7',
      resourceId: 'phoenix_insight',
      discoveryId: 'mars_phoenix_insight',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'Where did InSight land on November 26, 2018, and why did its robotic arm place SEIS directly onto the ground?',
      options: [
        'Elysium Planitia; placing SEIS on Martian regolith with a wind/thermal shield isolated seismic signals from wind shaking the lander',
        'Chryse Planitia; because SEIS floated in air',
        'Vastitas Borealis; to drill 5 kilometers through polar ice',
        'Ares Vallis; to attach to Sojourner’s axle'
      ],
      correctIndex: 0,
      explanation: 'Unlike Viking 2’s deck-mounted seismometer that mostly picked up wind buffeting the lander, InSight’s 1.8 m arm set SEIS directly onto Mars under a protective dome.',
      funFact: 'SEIS was so sensitive it detected tiny vibrations even smaller than the diameter of a hydrogen atom!'
    },
    {
      id: 'pi_q8',
      resourceId: 'phoenix_insight',
      discoveryId: 'mars_phoenix_insight',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'How many marsquakes did InSight’s SEIS seismometer detect during its mission?',
      options: [
        '1,319 marsquakes',
        'Zero marsquakes',
        'Exactly 4',
        'Over 500,000 exoplanets'
      ],
      correctIndex: 0,
      explanation: 'SEIS recorded 1,319 seismic events—including meteoroid impacts and magnitude ~4–5 quakes whose waves traveled all the way through Mars’s core!',
      funFact: 'Teams speeded up ultra-low-frequency seismic waves ("sonification") so humans could hear Martian wind & quakes.'
    },
    {
      id: 'pi_q9',
      resourceId: 'phoenix_insight',
      discoveryId: 'mars_phoenix_insight',
      planetId: 'mars',
      difficulty: 'hard',
      question: 'What deep interior structure did InSight’s SEIS and RISE radio experiments reveal inside Mars?',
      options: [
        'A 3-layer crust (~25–40 km thick beneath InSight), rocky mantle, and large liquid/molten core (~1,800 km radius)',
        'A hollow crystal cavern beneath the equator',
        'A completely solid iron core with no crust',
        'Only frozen CO2 from surface to center'
      ],
      correctIndex: 0,
      explanation: 'Seismic wave reflections + RISE planetary wobble measurements showed a fractured 3-layer crust (~25–40 km) and a surprisingly large, low-density molten metallic core (~1,800 km).',
      funFact: 'Knowing Mars’s core size & composition helps explain why Mars lost its global magnetic shield billions of years ago.'
    },
    {
      id: 'pi_q10',
      resourceId: 'phoenix_insight',
      discoveryId: 'mars_phoenix_insight',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'What honest engineering challenge happened to InSight’s HP³ heat-flow probe ("the mole")?',
      options: [
        'Unexpected cohesive, clumpy duricrust soil failed to provide side friction, preventing it from hammering down to its planned ~5 m depth',
        'It drilled cleanly through the planet and emerged on the far side',
        'An alien rover pulled out the tether',
        'Solar panels powered it too fast and melted it'
      ],
      correctIndex: 0,
      explanation: 'Designed to burrow up to ~5 m into loose sand like at Apollo/MER sites, "the mole" bounced out of unexpected sticky Elysium soil despite creative arm-assisted pushes.',
      funFact: 'Honest engineering failures teach crucial planetary soil mechanics for future human subsurface habitats.'
    },
    {
      id: 'pi_q11',
      resourceId: 'phoenix_insight',
      discoveryId: 'mars_phoenix_insight',
      planetId: 'mars',
      difficulty: 'hard',
      question: 'When did InSight transmit its final contact and when did NASA officially declare the mission ended?',
      options: [
        'Final signal December 15, 2022; official NASA mission end declared December 21, 2022',
        'Last signal November 2, 2008',
        'Last signal January 18, 2024',
        'Still transmitting continuously in 2030'
      ],
      correctIndex: 0,
      explanation: 'Thick blankets of Martian dust gradually starved InSight’s two circular solar arrays until final contact on December 15, 2022 (formal end announced December 21, 2022).',
      funFact: 'NASA engineers tried dropping tiny scoops of dirt near the panels so wind gusts would knock off clinging dust—buying precious extra months of marsquake science!'
    },
    {
      id: 'pi_q12',
      resourceId: 'phoenix_insight',
      discoveryId: 'mars_phoenix_insight',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'Why did Phoenix & InSight teach different sides of Mars science despite sharing a similar three-legged lander design?',
      options: [
        'Phoenix probed shallow frozen Arctic ice chemistry (surface/shallow trench), whereas InSight listened to deep interior marsquakes and core waves',
        'Phoenix orbited Ceres while InSight circled Saturn',
        'Both studied only clouds with telescopes',
        'InSight was powered by wind turbines'
      ],
      correctIndex: 0,
      explanation: 'Reusing Viking-era/Surveyor-descended three-legged lander heritage let one mission uncover Mars’s icy outer skin and the other map its deep molten core.',
      funFact: 'Phoenix actually inherited hardware originally built for a cancelled 2001 lander, saving hundreds of millions of dollars!'
    }
  ],

  ingenuity: [
    {
      id: 'ing_q1',
      resourceId: 'ingenuity',
      discoveryId: 'mars_ingenuity_helicopter',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'How did the 1.8 kg Ingenuity Mars Helicopter travel from Earth to Jezero Crater?',
      options: [
        'Attached underneath the belly of NASA’s Perseverance rover (deployed March 2021)',
        'Launched aboard Pioneer 11 in 1973',
        'Flown directly from Earth on its own rocket wings',
        'Dropped from Viking 1 Orbiter in 1976'
      ],
      correctIndex: 0,
      explanation: 'Ingenuity rode protected beneath Perseverance (launched July 30, 2020; landed Feb 18, 2021) and unfolded onto Martian soil in March 2021.',
      funFact: 'Perseverance also served as Ingenuity’s radio base station connecting its flights back to Earth.'
    },
    {
      id: 'ing_q2',
      resourceId: 'ingenuity',
      discoveryId: 'mars_ingenuity_helicopter',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'When did Ingenuity achieve humanity’s first powered, controlled aerodynamic flight on another planet ("Wright Brothers Moment")?',
      options: [
        'April 19, 2021 at Wright Brothers Field, Jezero Crater',
        'July 4, 1997 at Ares Vallis',
        'May 25, 2008 at Vastitas Borealis',
        'March 6, 2015 at Ceres'
      ],
      correctIndex: 0,
      explanation: 'On April 19, 2021, Ingenuity rose 3 meters, hovered for ~39.1 seconds, turned smoothly, and landed—earning the airfield name Wright Brothers Field.',
      funFact: 'It carried a tiny postage-stamp swatch of fabric from the 1903 Wright Flyer!'
    },
    {
      id: 'ing_q3',
      resourceId: 'ingenuity',
      discoveryId: 'mars_ingenuity_helicopter',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'What atmospheric challenge makes aerodynamic helicopter flight extraordinarily difficult on Mars?',
      options: [
        'Mars’s atmospheric density is less than 1% of Earth’s sea-level air density, requiring ultra-light mass and high-RPM 1.2 m blades',
        'Mars’s air is 50 times thicker than Earth’s ocean water',
        'Mars has zero gravity so rotors push you underground',
        'Mars’s air consists entirely of liquid iron'
      ],
      correctIndex: 0,
      explanation: 'Despite lower Martian gravity (3.71 m/s²), having <1% air density means blades must spin ~2,400–2,537+ RPM with minimal mass (1.8 kg) to generate lift.',
      funFact: 'Flying near Mars’s surface equals aerodynamic conditions ~30 kilometers (100,000 ft) high in Earth’s stratosphere!'
    },
    {
      id: 'ing_q4',
      resourceId: 'ingenuity',
      discoveryId: 'mars_ingenuity_helicopter',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'Compare Ingenuity’s original Technology Demo design limits to what it actually achieved across 72 flights:',
      options: [
        'Originally designed for ~5 flights, 5 m altitude (~90 s / ~350 W); actually completed 72 flights, 128.8 min, 17 km, 24 m max alt, and 10 m/s max speed',
        'Designed for 500 flights, flew only once',
        'Limited to hovering 10 cm forever',
        'Powered by hydrazine thrusters instead of solar panels'
      ],
      correctIndex: 0,
      explanation: 'Across three phases (Technology Demo, Operations Scouting, Extended Engineering), Ingenuity shattered every single original target over nearly three years!',
      funFact: 'Flight 1–5 proved basic flight; Flights 6–33 scouted dunes/ridges for Perseverance; Flights 34–72 pushed software & terrain limits.'
    },
    {
      id: 'ing_q5',
      resourceId: 'ingenuity',
      discoveryId: 'mars_ingenuity_helicopter',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'How did Ingenuity generate electricity to survive -90°C Jezero nights and spin its coaxial rotors?',
      options: [
        'A solar panel mounted above the upper rotor charging internal lithium-ion batteries',
        'A tether cable plugged permanently into Perseverance',
        'Twin SNAP-19 plutonium RTGs',
        'Xenon ion exhaust turbines'
      ],
      correctIndex: 0,
      explanation: 'The top solar panel topped up six Sony Li-ion cells each day, with roughly two-thirds of daily power spent just heating electronics overnight.',
      funFact: 'Cold survival heaters actually consumed far more energy overall than the 90-second flights!'
    },
    {
      id: 'ing_q6',
      resourceId: 'ingenuity',
      discoveryId: 'mars_ingenuity_helicopter',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'What happened during Flight 72 on January 18, 2024 that brought Ingenuity’s flying career to a close?',
      options: [
        'Featureless sandy ripples disrupted optical navigation during landing, damaging rotor blade tips; formal completion announced Jan 25, 2024',
        'It flew into Mars orbit and docked with Viking 1',
        'It landed in an ocean at Vastitas Borealis',
        'It collided with Opportunity rover'
      ],
      correctIndex: 0,
      explanation: 'Without distinct rocks for the downward camera to track over smooth sand ripples, Ingenuity touched down hard on Jan 18, 2024—leaving the craft permanently stationary on Mars.',
      funFact: 'NASA officially declared the flight mission complete on January 25, 2024, though electronics still remained healthy enough for long-term data logging.'
    },
    {
      id: 'ing_q7',
      resourceId: 'ingenuity',
      discoveryId: 'mars_ingenuity_helicopter',
      planetId: 'mars',
      difficulty: 'hard',
      question: 'Why must astronauts wait several minutes for light-speed delay and rely on onboard autonomy for Ingenuity’s flights?',
      options: [
        'Earth–Mars radio signals take many minutes each way, so Ingenuity flew every ~90 s sortie completely autonomously using onboard sensors & optical tracking',
        'There are no radios inside Jezero Crater',
        'NASA pilots could joystick-fly it live with zero latency',
        'Ingenuity obeyed only voice commands from Perseverance'
      ],
      correctIndex: 0,
      explanation: 'A round-trip radio command takes 8 to 40+ minutes depending on Mars’s orbit—impossible for balancing a helicopter second-by-second, so Ingenuity stabilized itself.',
      funFact: 'Ingenuity’s commercial-off-the-shelf Snapdragon processor computed navigation updates hundreds of times per second!'
    },
    {
      id: 'ing_q8',
      resourceId: 'ingenuity',
      discoveryId: 'mars_ingenuity_helicopter',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'What was Phase 2 ("Operations Demonstration") of Ingenuity’s mission (roughly Flights 6–33)?',
      options: [
        'Acting as Perseverance’s aerial scout—photographing dunes, cliff faces, and safe drive paths ahead of the rover',
        'Mapping exoplanet transits in Cygnus',
        'Digging Dodo-Goldilocks ice trenches',
        'Analyzing Jupiter’s radiation belts'
      ],
      correctIndex: 0,
      explanation: 'By flying ahead over boulders where wheeled rovers can’t risk driving, Ingenuity saved Perseverance’s science team days of trial-and-error routing.',
      funFact: 'Engineers had originally planned to abandon Ingenuity after Flight 5—its stunning success convinced NASA to keep flying it for years!'
    },
    {
      id: 'ing_q9',
      resourceId: 'ingenuity',
      discoveryId: 'mars_ingenuity_helicopter',
      planetId: 'mars',
      difficulty: 'hard',
      question: 'How does the proposed future "SkyFall" rotorcraft concept differ from the historical Ingenuity mission?',
      options: [
        'SkyFall is an unflown future Mars aerial concept inspired by Ingenuity, NOT an active historical mission that already flew',
        'SkyFall landed on Mars in 1997 alongside Sojourner',
        'SkyFall carried Apollo astronauts to Surveyor 3',
        'Ingenuity was renamed SkyFall on Flight 72'
      ],
      correctIndex: 0,
      explanation: 'Ingenuity is the verified 72-flight pioneer (2021–2024); follow-on Mars chopper concepts like SkyFall remain future exploration designs, clearly distinguished from completed flights.',
      funFact: 'Engineers are studying larger hexacopters and mid-air deployment rotorcraft for steep Mars canyons and polar ice!'
    },
    {
      id: 'ing_q10',
      resourceId: 'ingenuity',
      discoveryId: 'mars_ingenuity_helicopter',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'Why does Ingenuity use two coaxial rotors spinning in OPPOSITE directions instead of a single main rotor + tail rotor?',
      options: [
        'Counter-rotating rotors cancel rotational torque naturally in compact mass without needing a separate power-wasting tail boom',
        'So one rotor can detach and fly separately',
        'To dig into soil like HP³',
        'To reflect starlight for Kepler'
      ],
      correctIndex: 0,
      explanation: 'Coaxial counter-rotation provides symmetrical torque cancellation and double blade disk lift inside the compact folded envelope under Perseverance’s belly.',
      funFact: 'It was the very first extraterrestrial aircraft flight—a true Wright Brothers moment on another world!'
    }
  ],

  dawn: [
    {
      id: 'dawn_q1',
      resourceId: 'dawn',
      discoveryId: 'outer_dawn_orbiter',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'What historic orbital first did NASA’s Dawn spacecraft achieve in the Main Asteroid Belt?',
      options: [
        'Became the first spacecraft to orbit TWO extraterrestrial worlds beyond Earth—protoplanet Vesta and dwarf planet Ceres',
        'Landed on Vesta and drove a rover to Ceres',
        'Discovered exoplanets around Proxima Centauri',
        'Was the first lander on Chryse Planitia'
      ],
      correctIndex: 0,
      explanation: 'Strictly an orbiter (never landed!), Dawn orbited Vesta (Jul 2011–Sep 2012), escaped Vesta’s gravity using xenon ion propulsion, and entered Ceres’s orbit (Mar 6, 2015–Nov 2018).',
      funFact: 'No previous spacecraft could carry enough chemical rocket fuel to orbit, escape, and re-orbit two distant planetary bodies!'
    },
    {
      id: 'dawn_q2',
      resourceId: 'dawn',
      discoveryId: 'outer_dawn_orbiter',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'How did Dawn use Mars in February 2009 on its journey outward?',
      options: [
        'A Mars gravity assist flyby on February 17, 2009 to bend and boost its trajectory—it NEVER landed on or orbited Mars',
        'It landed in Jezero Crater to refuel xenon tanks',
        'It deployed Sojourner at Ares Vallis',
        'It skipped Mars entirely and went to Saturn'
      ],
      correctIndex: 0,
      explanation: 'Launched Sep 27, 2007 on a Delta II Heavy, Dawn skimmed past Mars on Feb 17, 2009 solely for a gravity-assist orbital bend toward the Asteroid Belt.',
      funFact: 'Mars gravity assists act like free gravitational slingshots saving tons of propellant!'
    },
    {
      id: 'dawn_q3',
      resourceId: 'dawn',
      discoveryId: 'outer_dawn_orbiter',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'How does Dawn’s xenon ion propulsion compare to chemical rockets like Delta II?',
      options: [
        'Three solar-electric xenon thrusters delivered tiny whisper-gentle thrust (~0 to 60 mph in ~4 days), achieving huge total velocity over months with very little propellant mass',
        'Ion thrusters explode violently for 2 minutes only',
        'Ion engines burn plutonium pellets directly',
        'Dawn used giant sails pushed exclusively by Martian wind'
      ],
      correctIndex: 0,
      explanation: 'Ion propulsion accelerates xenon gas electrically with over 10× higher exhaust efficiency than chemical rockets—ideal for multi-year Asteroid Belt cruising.',
      funFact: 'In addition to its 3 ion engines, Dawn carried chemical hydrazine RCS thrusters to keep its antenna & instruments pointed accurately.'
    },
    {
      id: 'dawn_q4',
      resourceId: 'dawn',
      discoveryId: 'outer_dawn_orbiter',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'What colossal feature on Vesta (orbited 2011–2012) helped confirm that Earth’s HED meteorites originated from Vesta?',
      options: [
        'The giant ~500 km Rheasilvia south polar impact basin & its towering central peak that excavated mantle rocks into space',
        'Liquid methane lakes on Vesta’s equator',
        'Saturn’s F ring wrapped around Vesta',
        'Ancient dry-ice glaciers built by InSight'
      ],
      correctIndex: 0,
      explanation: 'Rheasilvia’s ancient collision blasted howardite, eucrite, and diogenite (HED) rocky fragments into space—some of which eventually fell to Earth as meteorites!',
      funFact: 'Dawn proved Vesta is a dry, differentiated rocky protoplanet with a metallic iron core, silicate mantle, and basaltic crust!'
    },
    {
      id: 'dawn_q5',
      resourceId: 'dawn',
      discoveryId: 'outer_dawn_orbiter',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'What caused the famous bright spots inside Occator Crater on dwarf planet Ceres?',
      options: [
        'Reflective sodium carbonate salt deposits left behind as briny subsurface fluids erupted and froze/evaporated',
        'Active alien searchlights',
        'Fresh mirrors dropped by Dawn',
        'Molten basaltic lava rivers like Earth’s Hawaii'
      ],
      correctIndex: 0,
      explanation: 'Dawn’s VIR spectrometer showed the dazzling Cerealia & Vinalia Faculae spots are bright carbonate salts left when salty brines welled up through impact fractures.',
      funFact: 'Dawn also discovered Ahuna Mons, an isolated 4-kilometer cryovolcanic ("ice-volcano") mountain on Ceres!'
    },
    {
      id: 'dawn_q6',
      resourceId: 'dawn',
      discoveryId: 'outer_dawn_orbiter',
      planetId: 'mars',
      difficulty: 'hard',
      question: 'Which statement best describes Ceres’s interior science based strictly on Dawn’s measurements?',
      options: [
        'Ceres is a partially differentiated, water-ice and salt-rich dwarf planet with ancient subsurface brines—without claiming a confirmed planet-wide liquid ocean today',
        'Ceres is a solid ball of pure dry iron like Vesta’s core',
        'Dawn drilled 10 km deep and found whale fossils inside a global sea',
        'Ceres consists entirely of nitrogen snow'
      ],
      correctIndex: 0,
      explanation: 'Gravity and topography measurements show Ceres separated into a denser rocky core and an ice/hydrate-rich outer mantle/crust with localized brine pockets—distinct from proving a full modern global liquid ocean.',
      funFact: 'Comparing dry Vesta and wet-mineral Ceres side-by-side explains how water was distributed across the early Solar System!'
    },
    {
      id: 'dawn_q7',
      resourceId: 'dawn',
      discoveryId: 'outer_dawn_orbiter',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'What happened when Dawn depleted its hydrazine attitude-control fuel on October 31 / November 1, 2018?',
      options: [
        'Mission operations ended while Dawn remained peacefully in a silent, stable high orbit around Ceres (it did NOT crash into Ceres)',
        'Dawn intentionally crashed hard into Occator Crater',
        'Dawn flew back to Cape Canaveral for landing',
        'Dawn swung to Jupiter alongside Pioneer 10'
      ],
      correctIndex: 0,
      explanation: 'To satisfy strict NASA planetary protection rules (avoiding contaminating potentially brine-bearing Ceres with terrestrial microbes), Dawn was parked in a quarantine orbit that stays stable for decades+.',
      funFact: 'Chief Engineer Marc Rayman called Dawn’s ion engine tour "the ultimate cosmic road trip."'
    },
    {
      id: 'dawn_q8',
      resourceId: 'dawn',
      discoveryId: 'outer_dawn_orbiter',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'Why does Dawn carry huge ~20-meter solar wings instead of small panels like Pathfinder?',
      options: [
        'Sunlight in the Main Asteroid Belt (~2.4–3.0 AU) is roughly 6–9× fainter than at Earth, yet ion thrusters need kilowatts of electrical power',
        'To serve as helicopter rotor blades at Vesta',
        'To shield Mars from solar flares',
        'To collect cosmic dust samples physically'
      ],
      correctIndex: 0,
      explanation: 'Solar intensity drops with the inverse square of distance from the Sun; huge blue photovoltaic arrays captured enough photons even out at Ceres.',
      funFact: 'Dawn’s wingtip-to-wingtip span was nearly 20 meters—almost as wide as a tennis court!'
    },
    {
      id: 'dawn_q9',
      resourceId: 'dawn',
      discoveryId: 'outer_dawn_orbiter',
      planetId: 'mars',
      difficulty: 'hard',
      question: 'Why is Vesta’s overall shape irregular/triaxial while Ceres is round/spherical?',
      options: [
        'Ceres’s larger mass (~940 km) pulled itself into hydrostatic spherical equilibrium, whereas smaller rocky Vesta (~525 km) retains giant impact scars like Rheasilvia',
        'Vesta melted in Mars’s atmosphere',
        'Ceres was carved round by Pioneer 11',
        'Vesta rotates faster than light'
      ],
      correctIndex: 0,
      explanation: 'Self-gravity rounds bodies above ~600–800 km diameter depending on rock vs ice strength; Vesta sits right below the dwarf-planet rounding threshold and suffered massive southern collisions.',
      funFact: 'Vesta’s Rheasilvia central mountain peaks roughly 22 km high—rivalling Olympus Mons on Mars!'
    },
    {
      id: 'dawn_q10',
      resourceId: 'dawn',
      discoveryId: 'outer_dawn_orbiter',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'In Cosmic Explorer’s curriculum, which category does the Dawn mission belong to?',
      options: [
        'Category 2 — Outer Solar System Exploration (Beyond Mars)',
        'Category 1 — Mars Surface Rovers',
        'Category 3 — Exoplanets Beyond Our Sun',
        'Lunar ALSEP Science'
      ],
      correctIndex: 0,
      explanation: 'Beyond Mars’s orbit lies the Main Asteroid Belt, home to Vesta and Ceres—making Dawn an Outer Solar System Exploration mission (strictly orbiter-only).',
      funFact: 'Dawn launched in September 2007 and wrapped up 11 remarkable years of spaceflight in November 2018.'
    }
  ],

  pioneer: [
    {
      id: 'pio_q1',
      resourceId: 'pioneer',
      discoveryId: 'outer_pioneer_10_11',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'Which category does Pioneer 10 & 11 belong to—and did either spacecraft ever land on Mars or any outer planet?',
      options: [
        'Outer Solar System Exploration (Beyond Mars) — they were strictly flyby scouts and NEVER landed anywhere',
        'Mars Surface Exploration — they drove across Chryse Planitia',
        'Lunar Exploration beside Apollo 11',
        'Deep Space Exoplanet Observatory orbiting the Sun inside Mercury'
      ],
      correctIndex: 0,
      explanation: 'Pioneer 10 (1972) and Pioneer 11 (1973) are strictly Outer Solar System Exploration flyby missions—high-speed scouts beyond Mars, never surface landers.',
      funFact: 'Moving Pioneer out of Mars missions keeps planetary geography and deep-space trajectories 100% accurate!'
    },
    {
      id: 'pio_q2',
      resourceId: 'pioneer',
      discoveryId: 'outer_pioneer_10_11',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'What dangerous region beyond Mars did Pioneer 10 become the first spacecraft ever to cross safely (July 15, 1972 – February 1973)?',
      options: [
        'The Main Asteroid Belt between Mars and Jupiter',
        'Saturn’s F ring',
        'The Moon’s Ocean of Storms',
        'Valles Marineris'
      ],
      correctIndex: 0,
      explanation: 'Launched March 2, 1972 on an Atlas Centaur, Pioneer 10 proved the Asteroid Belt was mostly empty space rather than an impassable boulder wall!',
      funFact: 'That cleared the path for Voyager, Galileo, Juno, and Cassini.'
    },
    {
      id: 'pio_q3',
      resourceId: 'pioneer',
      discoveryId: 'outer_pioneer_10_11',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'When did Pioneer 10 make its closest approach to Jupiter (~130,354 km at ~126,000 km/h), studying Callisto, Ganymede, and Europa?',
      options: [
        'December 4, 1973 (02:26 UT)',
        'September 1, 1979',
        'July 20, 1976',
        'February 17, 2009'
      ],
      correctIndex: 0,
      explanation: 'Pioneer 10 survived Jupiter’s fierce radiation belts on December 4, 1973 (02:26 UT), returning Earth’s very first close-up Jupiter pictures.',
      funFact: 'Because Pioneer 10 was spin-stabilized (~4.8 RPM), its camera built images strip-by-strip as the craft rotated!'
    },
    {
      id: 'pio_q4',
      resourceId: 'pioneer',
      discoveryId: 'outer_pioneer_10_11',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'What historic first did Pioneer 11 achieve on September 1, 1979 (~20,900 km above the clouds)?',
      options: [
        'Humanity’s first-ever flyby of Saturn, discovering Saturn’s F ring and a new moon',
        'First landing inside Vesta’s Rheasilvia crater',
        'First rover drive across Meridiani Planum',
        'First transit detection of Kepler-11'
      ],
      correctIndex: 0,
      explanation: 'Using a closer ~42,500 km Jupiter flyby on Dec 3, 1974 to slingshot across the Solar System, Pioneer 11 became the first spacecraft to visit Saturn on Sep 1, 1979!',
      funFact: 'Pioneer 11 discovered the narrow shepherd-bounded F ring and verified ring safety ahead of Voyager 1 and 2.'
    },
    {
      id: 'pio_q5',
      resourceId: 'pioneer',
      discoveryId: 'outer_pioneer_10_11',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'Why did Pioneer 10 and 11 use four SNAP-19 plutonium RTGs on long booms rather than solar panels?',
      options: [
        'At 5 to 10 AU (Jupiter & Saturn), sunlight is 25× to 100× weaker than at Earth, making 1970s solar arrays impractical',
        'Solar panels melt in cold deep space',
        'Jupiter’s clouds reflect too much green light',
        'NASA wanted to drop RTGs into Jupiter’s Red Spot'
      ],
      correctIndex: 0,
      explanation: 'Just as Apollo’s ALSEP and Viking Lander used RTGs for lunar nights and dust storms, outer-planet missions relied on SNAP-19 plutonium-238 heat beyond Mars.',
      funFact: 'Pioneer 10 weighed ~258 kg and Pioneer 11 ~258.5 kg—remarkably light by modern standards!'
    },
    {
      id: 'pio_q6',
      resourceId: 'pioneer',
      discoveryId: 'outer_pioneer_10_11',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'What cosmic message is engraved onto the gold-anodized aluminum Pioneer Golden Plaque carried by both spacecraft?',
      options: [
        'Human male & female scale figures in front of the dish, a Solar System diagram showing our home planet, a 14-pulsar galactic address map, and the hydrogen 21-cm transition symbol',
        'Only a map of Mars landing pads',
        'A digital Blu-ray disc containing Earth movies',
        'The chemical recipe for perchlorate salt'
      ],
      correctIndex: 0,
      explanation: 'Designed by Carl Sagan, Frank Drake, and Linda Salzman Sagan, the plaque uses universal physics (hydrogen hyperfine wavelength ~21 cm and 14 millisecond pulsars) to identify Earth’s location & time.',
      funFact: 'Each binary tick beside the 14 radial pulsar lines encodes that pulsar’s spin period using the hydrogen clock as unit "1"!'
    },
    {
      id: 'pio_q7',
      resourceId: 'pioneer',
      discoveryId: 'outer_pioneer_10_11',
      planetId: 'mars',
      difficulty: 'hard',
      question: 'When did Pioneer 10 cross the orbit of Neptune, and when was its very last faint signal received on Earth?',
      options: [
        'Crossed Neptune’s orbit June 13, 1983; routine ops ended March 31, 1997; last very faint signal detected January 23, 2003',
        'Crossed Neptune in 2018; still sending HD video today',
        'Turned around at Jupiter in 1974',
        'Crossed Neptune February 23, 1990; ended November 11, 1982'
      ],
      correctIndex: 0,
      explanation: 'Pioneer 10 crossed Neptune’s orbit on June 13, 1983. Although routine science ended March 31, 1997, engineers caught one final faint carrier ping from ~12 billion km away on January 23, 2003!',
      funFact: 'It will take Pioneer 10 roughly two million years to drift near the neighborhood of the star Aldebaran.'
    },
    {
      id: 'pio_q8',
      resourceId: 'pioneer',
      discoveryId: 'outer_pioneer_10_11',
      planetId: 'mars',
      difficulty: 'hard',
      question: 'When did Pioneer 11 cross Neptune’s orbit and transmit its final engineering data?',
      options: [
        'Crossed Neptune’s orbit February 23, 1990; routine ops ended September 30, 1995; last engineering data received November 24, 1995',
        'Crossed Neptune June 13, 1983; last signal Jan 23, 2003',
        'Landed at Saturn in 1981',
        'Orbited Ceres until November 2018'
      ],
      correctIndex: 0,
      explanation: 'After its historic 1979 Saturn encounter, Pioneer 11 crossed Neptune’s orbit on February 23, 1990, ending routine ops Sep 30, 1995 with final data on Nov 24, 1995.',
      funFact: 'Pioneer 11 is heading in a completely different interstellar direction toward the constellation Scutum.'
    },
    {
      id: 'pio_q9',
      resourceId: 'pioneer',
      discoveryId: 'outer_pioneer_10_11',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'Why did Pioneer 10 & 11 carry a 6-meter Magnetometer boom stretching far away from the main body?',
      options: [
        'To measure faint planetary magnetic fields without interference from the spacecraft’s own electronics & RTGs',
        'To physically sample Saturn’s icy rings with a scoop',
        'To serve as a parachute mast',
        'To balance sunlight during the K2 mission'
      ],
      correctIndex: 0,
      explanation: 'Boom separation kept sensitive fluxgate/helium magnetometers far clear of stray currents inside the spacecraft bus—revealing Jupiter’s colossal magnetosphere and Saturn’s surprisingly aligned magnetic dipole.',
      funFact: 'Pioneer 11’s magnetic measurement showed Saturn’s magnetic axis is tilted less than 1° from its rotation pole!'
    },
    {
      id: 'pio_q10',
      resourceId: 'pioneer',
      discoveryId: 'outer_pioneer_10_11',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'How did the 1972–1979 Pioneer missions pave the way directly for Voyager 1 & Voyager 2?',
      options: [
        'Pioneer proved Asteroid Belt safety, mapped Jupiter’s radiation hazards, and verified Saturn’s safe ring-plane gap for Voyager’s Grand Tour cameras',
        'Pioneer dropped Voyager’s rovers onto Ganymede',
        'Pioneer built an Earth-orbiting space station for Voyager',
        'Voyager and Pioneer were identical Mars landers'
      ],
      correctIndex: 0,
      explanation: 'True to their name, Pioneer 10 & 11 took all the risk-scouting hits first—measuring radiation doses & ring debris so Voyager’s delicate imaging systems survived.',
      funFact: 'Today both Pioneers and both Voyagers are sailing permanently beyond the planets as silent ambassadors from Earth.'
    }
  ],

  kepler: [
    {
      id: 'kep_q1',
      resourceId: 'kepler',
      discoveryId: 'deep_kepler_telescope',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'Where did the Kepler Space Telescope operate—and did it ever orbit Earth, Mars, or fly to an exoplanet?',
      options: [
        'An Earth-trailing heliocentric orbit around the Sun—it NEVER orbited planets or physically visited exoplanets',
        'It parked inside Jezero Crater beside Ingenuity',
        'It orbited Jupiter right behind Pioneer 10',
        'It flew across light-years to land on Kepler-186f'
      ],
      correctIndex: 0,
      explanation: 'Strictly a heliocentric deep-space observatory launched March 6, 2009, Kepler orbited the Sun trailing behind Earth so Earth’s glare and shadows wouldn’t interrupt its steady starlight measurements.',
      funFact: 'Trailing Earth let Kepler stare uninterruptedly at the same patch of sky in Cygnus and Lyra!'
    },
    {
      id: 'kep_q2',
      resourceId: 'kepler',
      discoveryId: 'deep_kepler_telescope',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'Approximately how many stars did Kepler monitor continuously in its primary Cygnus / Lyra field?',
      options: [
        'Over 150,000 stars (~150,000 simultaneously in the primary field; >500,000 across Kepler + K2)',
        'Only 3 stars including the Sun',
        'Exactly 72 stars matching Ingenuity’s flights',
        'Only planets inside the Asteroid Belt'
      ],
      correctIndex: 0,
      explanation: 'Monitoring >150,000 stars simultaneously was essential because only roughly ~0.5–1% of planetary systems happen to be aligned edge-on enough to transit from our viewpoint!',
      funFact: 'Across its full 2009–2018 lifetime (Primary + K2), Kepler observed more than 500,000 stars!'
    },
    {
      id: 'kep_q3',
      resourceId: 'kepler',
      discoveryId: 'deep_kepler_telescope',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'How does the Transit Method allow Kepler to discover unseen exoplanets light-years away?',
      options: [
        'By measuring tiny, repeating dips in a star’s brightness (light curve) each time an orbiting planet crosses in front of the star',
        'By landing microphones on the distant star',
        'By bouncing green radar lasers off Proxima Centauri',
        'By photographing mountains on the exoplanet surface'
      ],
      correctIndex: 0,
      explanation: 'During a transit, the planet blocks a tiny fraction of starlight ΔF ≈ (Rp / R*)²; seeing identical dips repeat like clockwork confirms an orbiting planet’s period & size!',
      funFact: 'An Earth-sized planet crossing a Sun-like star causes a brightness dip of only ~0.0084% (84 parts per million)!'
    },
    {
      id: 'kep_q4',
      resourceId: 'kepler',
      discoveryId: 'deep_kepler_telescope',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'What historic systems did Kepler discover during its early milestone phase (2010–2011)?',
      options: [
        'Kepler-4b through 8b, multi-transiting TTV system Kepler-9, and the remarkably compact 6-planet Kepler-11 system',
        'Vesta, Ceres, and Occator Crater',
        'Barnacle Bill and Yogi on Ares Vallis',
        'Saturn’s F ring and Callisto'
      ],
      correctIndex: 0,
      explanation: 'From hot gas planets (4b–8b) to multi-planet gravitational tugs (Kepler-9) and six tightly packed planets around Kepler-11, Kepler transformed planetary architecture science overnight.',
      funFact: 'All six planets of Kepler-11 orbited closer to their star than Venus orbits our Sun!'
    },
    {
      id: 'kep_q5',
      resourceId: 'kepler',
      discoveryId: 'deep_kepler_telescope',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'What mechanical crisis struck Kepler in May 2013—and how did NASA engineers ingeniously rescue it as the K2 Mission?',
      options: [
        'A second reaction wheel failed; engineers aimed the spacecraft’s solar panels evenly into sunlight so photon radiation pressure balanced telescope roll across 19 K2 campaigns',
        'An asteroid broke its mirror, so astronauts repaired it in Mars orbit',
        'All solar panels detached and Dawn towed it',
        'Xenon ion fuel flooded the CCD camera'
      ],
      correctIndex: 0,
      explanation: 'With only two working reaction wheels left, engineers realized the Sun’s gentle photon pressure pushing evenly against symmetrical solar wings could act like a third stabilizer along the ecliptic plane!',
      funFact: 'That rescue extended Kepler’s career by four more years across 19 K2 observing campaigns along the ecliptic!'
    },
    {
      id: 'kep_q6',
      resourceId: 'kepler',
      discoveryId: 'deep_kepler_telescope',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'Roughly how many confirmed exoplanets did Kepler reveal across its primary and K2 missions combined?',
      options: [
        'More than 2,600 confirmed exoplanets',
        'Exactly 4 exoplanets',
        '1,319 marsquakes',
        '52,663 moons'
      ],
      correctIndex: 0,
      explanation: 'Kepler discovered more than 2,600 confirmed exoplanets (plus thousands more candidates), proving statistically that planets outnumber stars in the Milky Way!',
      funFact: 'Its statistical census showed small rocky Earth-to-sub-Neptune worlds are extraordinarily common across the galaxy.'
    },
    {
      id: 'kep_q7',
      resourceId: 'kepler',
      discoveryId: 'deep_kepler_telescope',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'If an exoplanet is discovered orbiting inside its star’s "Habitable Zone," what does that prove scientifically?',
      options: [
        'Only that temperatures could allow liquid water on its surface with a suitable atmosphere—it is NOT proof of alien life',
        'It guarantees forests, cities, and breathable oxygen exist there',
        'It proves Kepler landed on that world',
        'It proves the star has zero magnetic radiation'
      ],
      correctIndex: 0,
      explanation: 'Scientific discipline check: both Venus and Mars sit near our Sun’s habitable-zone edges yet lack surface oceans today; "habitable zone" strictly describes potential liquid-water temperature range, never proof of life.',
      funFact: 'Follow-up telescopes like JWST inspect exoplanet atmospheres during transits for water vapor, CO2, and methane.'
    },
    {
      id: 'kep_q8',
      resourceId: 'kepler',
      discoveryId: 'deep_kepler_telescope',
      planetId: 'mars',
      difficulty: 'hard',
      question: 'In a light-curve graph, if Planet B has twice the radius of Planet A orbiting the same star, how does its transit dip depth ΔF ≈ (Rp/R*)² compare?',
      options: [
        'Four times (4×) deeper transit dip because blocked area scales with radius squared',
        'Half as deep',
        'Identical depth regardless of planet size',
        'One hundred times shallower'
      ],
      correctIndex: 0,
      explanation: 'A planet blocks a circular silhouette πRp² against the star’s disk πR*², so doubling planet radius quadruples the blocked starlight area!',
      funFact: 'Measuring dip depth gives planet size while measuring time between repeating dips gives the planet’s orbital year.'
    },
    {
      id: 'kep_q9',
      resourceId: 'kepler',
      discoveryId: 'deep_kepler_telescope',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'Why must Kepler observe at least THREE identical periodic transits to confidently flag an exoplanet candidate?',
      options: [
        'One dip could be noise or an asteroid; two establish a candidate period; the third confirms the exact repeating orbital period',
        'Kepler’s CCD only saved every third picture',
        'Because stars always vanish completely on transits 1 and 2',
        'Every exoplanet disappears after two orbits'
      ],
      correctIndex: 0,
      explanation: 'Three equally spaced dips prove periodicity—eliminating random starspot flickers or grazing binary false alarms.',
      funFact: 'Confirming multi-year habitable-zone orbits around Sun-like stars is why Kepler needed a 3.5+ year uninterrupted prime stare!'
    },
    {
      id: 'kep_q10',
      resourceId: 'kepler',
      discoveryId: 'deep_kepler_telescope',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'How and when did the Kepler Space Telescope mission formally end?',
      options: [
        'Ran out of thruster fuel on October 30, 2018 and was safely powered down in its permanent heliocentric orbit',
        'Crashed onto Jupiter in December 1973',
        'Lost power on Mars during Phoenix’s polar winter in 2008',
        'Damaged rotor blades on January 18, 2024'
      ],
      correctIndex: 0,
      explanation: 'Even with K2 sunlight balancing, Kepler still needed small thruster firings to point toward Earth & repoint every ~80-day campaign; fuel ran dry October 30, 2018.',
      funFact: 'Kepler retired peacefully into a safe orbit around the Sun—celebrated on the anniversary of astronomer Johannes Kepler’s passing!'
    },
    {
      id: 'kep_q11',
      resourceId: 'kepler',
      discoveryId: 'deep_kepler_telescope',
      planetId: 'mars',
      difficulty: 'hard',
      question: 'Why are compact red-dwarf (M-dwarf) habitable zones much closer to their stars than Earth’s 1 AU orbit around our Sun?',
      options: [
        'Cooler, dimmer M-dwarf stars emit far less luminosity, so a rocky world must orbit much closer (<0.3 AU) to receive Earth-like warmth',
        'M-dwarfs push planets inward with xenon ions',
        'Light travels slower near red stars',
        'Planets farther than 0.5 AU collide with Ceres'
      ],
      correctIndex: 0,
      explanation: 'Equilibrium warmth scales roughly with √Luminosity; faint red dwarfs warm planets only in tight, fast-orbiting habitable zones (where tidal locking & stellar flares pose extra questions!).',
      funFact: 'Kepler-186f—famous as an Earth-sized habitable-zone world—orbits a cool red-dwarf star every ~130 days!'
    },
    {
      id: 'kep_q12',
      resourceId: 'kepler',
      discoveryId: 'deep_kepler_telescope',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'What kind of detector sat inside Kepler’s telescope barrel—and why didn’t it produce colorful Hubble-style nebula posters?',
      options: [
        'A 95-megapixel array of 42 photometer CCDs slightly defocused to measure total star brightness to ~20 parts per million precision',
        'A pair of spinning Pioneer polarimeters',
        'A soil-baking TEGA oven',
        'An APXS alpha-particle X-ray emitter'
      ],
      correctIndex: 0,
      explanation: 'Kepler was a precision light-meter (photometer): spreading each star’s light slightly over multiple pixels kept bright stars from saturating and boosted brightness accuracy!',
      funFact: 'Its legacy lives on through NASA’s TESS and JWST exoplanet atmosphere missions.'
    }
  ],

  curiosity: [
    {
      id: 'cur_q1',
      resourceId: 'curiosity',
      discoveryId: 'mars_curiosity_rover',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'Where did NASA’s nuclear-powered Curiosity rover land on August 5/6, 2012?',
      options: [
        'Inside Gale Crater near the base of Mount Sharp (Aeolis Mons)',
        'At the Martian north polar ice cap (Vastitas Borealis)',
        'Inside Chryse Planitia right beside Viking 1',
        'In orbit around dwarf planet Ceres'
      ],
      correctIndex: 0,
      explanation: 'Gale Crater holds a 5-km-tall layered central peak called Mount Sharp whose ancient rock strata record how Mars shifted from wet to dry.',
      funFact: 'Curiosity’s landing site inside Gale Crater was named "Bradbury Landing" in honor of author Ray Bradbury!'
    },
    {
      id: 'cur_q2',
      resourceId: 'curiosity',
      discoveryId: 'mars_curiosity_rover',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'Why did NASA invent the rocket-powered Sky Crane maneuver to land Curiosity instead of using airbags like Pathfinder?',
      options: [
        'At ~899 kg (the size of an SUV), Curiosity was far too heavy for airbags or tall lander legs',
        'Mars lost its atmosphere in 2012',
        'Sky Cranes reuse helicopter rotor blades',
        'Airbags only work at night'
      ],
      correctIndex: 0,
      explanation: 'An 899 kg rover would bounce violently and tear airbags; lowering Curiosity directly onto its wheels on nylon cables kept the rocket blast above the dust!',
      funFact: 'That Sky Crane architecture worked so cleanly that NASA reused it to land Perseverance in 2021!'
    },
    {
      id: 'cur_q3',
      resourceId: 'curiosity',
      discoveryId: 'mars_curiosity_rover',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'What powers Curiosity through Martian nights, winters, and planet-wide dust storms?',
      options: [
        'A plutonium-238 MMRTG nuclear radioisotope battery',
        'A 20-meter solar wing array like Dawn',
        'Foldable lithium batteries charged by InSight',
        'Wind turbines spun by CO2 dust devils'
      ],
      correctIndex: 0,
      explanation: 'Instead of solar panels that dust can bury, Curiosity’s finned MMRTG converts heat from decaying plutonium-238 into steady electricity year-round.',
      funFact: 'Warm liquid loops around Curiosity’s MMRTG also keep its delicate electronics cozy through -90 °C Martian nights!'
    },
    {
      id: 'cur_q4',
      resourceId: 'curiosity',
      discoveryId: 'mars_curiosity_rover',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'How does Curiosity’s ChemCam instrument analyze rocks up to 7 meters away without even driving over them?',
      options: [
        'It fires infrared laser pulses to turn a pinpoint of rock into glowing plasma and reads the light spectrum',
        'It shoots tiny harpoon scoops on fishing line',
        'It listens for marsquakes inside the boulder',
        'It drops water droplets onto rocks from a tank'
      ],
      correctIndex: 0,
      explanation: 'Laser-Induced Breakdown Spectroscopy (LIBS) vaporizes surface dust and identifies elements in microseconds by the colors emitted by hot atoms.',
      funFact: 'Curiosity has fired its ChemCam laser hundreds of thousands of times across Gale Crater!'
    },
    {
      id: 'cur_q5',
      resourceId: 'curiosity',
      discoveryId: 'mars_curiosity_rover',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'What landmark scientific conclusion did Curiosity achieve by drilling Yellowknife Bay mudstones in 2013?',
      options: [
        'Proved ancient Mars had neutral-pH freshwater lakes, essential elements (C, H, N, O, P, S), and chemical energy capable of supporting microbial life',
        'Discovered living fish swimming beneath Gale Crater',
        'Proved Gale Crater was formed purely by solar wind',
        'Confirmed Mars’s core is solid cold iron'
      ],
      correctIndex: 0,
      explanation: 'Yellowknife Bay clays and gentle sulfate/iron redox chemistry proved ancient lakes were habitable in the past (without proving life actually existed).',
      funFact: 'Curiosity exceeded its original goal within its first Martian year—and kept climbing Mount Sharp!'
    },
    {
      id: 'cur_q6',
      resourceId: 'curiosity',
      discoveryId: 'mars_curiosity_rover',
      planetId: 'mars',
      difficulty: 'medium',
      question: 'What did Curiosity’s internal SAM (Sample Analysis at Mars) laboratory detect inside ancient Gale Crater rocks and air?',
      options: [
        'Preserved organic carbon molecules in ancient mudstones plus seasonal background methane fluctuations in the air',
        'Liquid gasoline reservoirs under Bradbury Landing',
        'Oxygen levels equal to Earth’s rain forests',
        'Metallic aluminum cans left by Viking 1'
      ],
      correctIndex: 0,
      explanation: 'SAM baked powdered mudstone inside miniature ovens and identified chlorinated & sulfur-bearing organic molecules preserved over billions of years.',
      funFact: 'Organic molecules are chemical building blocks of life—though geological processes can form them too!'
    },
    {
      id: 'cur_q7',
      resourceId: 'curiosity',
      discoveryId: 'mars_curiosity_rover',
      planetId: 'mars',
      difficulty: 'hard',
      question: 'What crucial discovery did Curiosity’s RAD radiation detector make on its cruise to Mars and on the surface?',
      options: [
        'Measured cosmic ray and solar storm radiation doses astronauts will face during a round-trip Mars mission',
        'Proved Mars has an Earth-strength dipolar magnetosphere',
        'Detected transit dips around Cygnus stars',
        'Found water ice boiling at 100 °C inside dunes'
      ],
      correctIndex: 0,
      explanation: 'Mars lacks a global magnetic shield and thick atmosphere, so RAD’s real radiation measurements guide human spacecraft and habitat shielding design.',
      funFact: 'Curiosity began taking radiation measurements before it even left Earth’s orbital cruise stage!'
    },
    {
      id: 'cur_q8',
      resourceId: 'curiosity',
      discoveryId: 'mars_curiosity_rover',
      planetId: 'mars',
      difficulty: 'easy',
      question: 'Why does Curiosity climb steadily higher up the slopes of Mount Sharp (Aeolis Mons)?',
      options: [
        'Higher rock layers are younger—reading Mount Sharp’s slope like chapters in a book showing how Mars dried out',
        'To reach orbit without a rocket',
        'Because its wheels only roll uphill',
        'To recharge its solar panels closer to the Sun'
      ],
      correctIndex: 0,
      explanation: 'Lower clay layers record wet ancient lakes, middle sulfate strata track drying lakes, and upper beds reveal windblown desert conditions!',
      funFact: 'Every few hundred meters upward climbs millions of years forward in Martian climate history.'
    }
  ]
};
