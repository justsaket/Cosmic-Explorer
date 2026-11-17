import { Mission } from '../types';

export const INITIAL_MISSIONS: Mission[] = [
  // 0. Earth Space Center Operations (Home Base)
  {
    id: 'mission_earth_departure',
    title: 'Artemis Departure: Earth Space Center Operations',
    destination: 'earth',
    level: 'Cadet',
    briefing:
      'Welcome to NASA Kennedy Space Center, Explorer. Calibrate your spacesuit mobility under Earth\'s 9.81 m/s² gravity, collect a geological baseline sample, and board the Space Shuttle for deep-space departure.',
    learningGoal:
      'Calibrate terrestrial gravity before launching from the Space Shuttle launch pad to the Moon and Mars.',
    objectives: [
      {
        id: 'obj_earth_jump',
        description: 'Calibrate standard Earth 9.81 m/s² gravity by executing 3 jumps',
        type: 'perform_jump',
        targetCount: 3,
        currentCount: 0,
        completed: false
      },
      {
        id: 'obj_earth_walk',
        description: 'Traverse 60 meters across Launch Complex 39 to the Space Shuttle Pad',
        type: 'travel_distance',
        targetCount: 60,
        currentCount: 0,
        completed: false
      }
    ],
    rewardPoints: 200,
    badgeName: 'Earth Flight Operations Badge',
    completed: false
  },

  // 1. Cadet Lunar Landing
  {
    id: 'mission_lunar_first_steps',
    title: 'Artemis Path: First Steps on the Lunar South Pole',
    destination: 'moon',
    level: 'Cadet',
    briefing:
      'Welcome to the Moon, Explorer. Step onto the sunlit regolith, test your 1/6th-gravity leaps, and gather pristine highland crustal samples.',
    learningGoal:
      'Experience lunar 1.62 m/s² gravity and traverse ancient crater highlands.',
    objectives: [
      {
        id: 'obj_lunar_jump',
        description: 'Test lunar 1.62 m/s² gravity by executing 3 leaps',
        type: 'perform_jump',
        targetCount: 3,
        currentCount: 0,
        completed: false
      },
      {
        id: 'obj_lunar_walk',
        description: 'Explore 80 meters of sunlit lunar plains',
        type: 'travel_distance',
        targetCount: 80,
        currentCount: 0,
        completed: false
      },
      {
        id: 'obj_lunar_sample',
        description: 'Collect 1 lunar surface field sample',
        type: 'collect_discoveries',
        targetCount: 1,
        currentCount: 0,
        completed: false
      }
    ],
    rewardPoints: 250,
    badgeName: 'Lunar Pioneer Badge',
    completed: false
  },

  // 2. Martian Cadet Expedition
  {
    id: 'mission_mars_rover_rendezvous',
    title: 'Red Horizon: Jezero Crater Recon',
    destination: 'mars',
    level: 'Specialist',
    briefing:
      'You have touched down in Jezero Crater beneath Mars\'s butterscotch sky. Test your mobility under 3.71 m/s² gravity and explore the crater basin.',
    learningGoal:
      'Adapt to Martian gravity, atmospheric dust dynamics, and sedimentary basin terrain.',
    objectives: [
      {
        id: 'obj_mars_walk',
        description: 'Traverse 100 meters across the Martian regolith',
        type: 'travel_distance',
        targetCount: 100,
        currentCount: 0,
        completed: false
      },
      {
        id: 'obj_mars_jump',
        description: 'Execute 3 jet-assisted hops in Martian 3.71 m/s² gravity',
        type: 'perform_jump',
        targetCount: 3,
        currentCount: 0,
        completed: false
      }
    ],
    rewardPoints: 350,
    badgeName: 'Martian Scout Insignia',
    completed: false
  },

  // 3. Ultimate Cosmos Master
  {
    id: 'mission_cosmos_master',
    title: 'Master Planetary Explorer: Dual-World Synthesis',
    destination: 'any',
    level: 'Commander',
    briefing:
      'Gather surface field samples across the worlds you visit and test your planetary science mastery in the Academy Quiz.',
    learningGoal:
      'Demonstrate comparative planetology mastery between Earth, the Moon, and Mars.',
    objectives: [
      {
        id: 'obj_total_collected',
        description: 'Collect at least 3 planetary field samples',
        type: 'collect_discoveries',
        targetCount: 3,
        currentCount: 0,
        completed: false
      },
      {
        id: 'obj_quiz_mastery',
        description: 'Complete the Planetary Science Quiz Academy',
        type: 'complete_quiz',
        targetCount: 1,
        currentCount: 0,
        completed: false
      }
    ],
    rewardPoints: 600,
    badgeName: 'Grand Explorer Laureate',
    completed: false
  }
];

