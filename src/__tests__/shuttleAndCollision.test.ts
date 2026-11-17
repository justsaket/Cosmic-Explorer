import test from 'node:test';
import assert from 'node:assert/strict';
import { PlanetaryPhysicsController } from '../physics/planetaryPhysics';
import {
  SHUTTLE_PADS,
  SHUTTLE_BOARDING_RADIUS,
  TRAVEL_PHASE_DURATIONS,
  getAvailableShuttleDestinations,
  canBoardShuttle,
  isAstronautLockedInShuttle,
  isShuttleExitAllowed,
  advanceShuttleState,
  buildTravelTelemetry,
  selectShuttleCameraView,
  computeShuttlePropulsionProfile,
  HabitablePlanetId,
  ShuttleInteractionState
} from '../shuttle/shuttleTravelState';

test('PlanetaryPhysicsController - Blocks astronaut from entering solid obstacles and mountains', () => {
  const physics = new PlanetaryPhysicsController('mars', () => 0);

  // 1. Solid Habitat / Boulder cylinder obstacle at (0, 8) radius 3.0
  physics.setObstacles([{ x: 0, z: 8, radius: 3.0, height: 6.0, baseY: 0 }]);
  physics.teleport(0, 2);

  for (let i = 0; i < 60; i++) {
    physics.update(
      0.03,
      { forward: true, backward: false, left: false, right: false, sprint: true, jump: false },
      'mars'
    );
  }

  const distFromCylinder = Math.hypot(physics.position.x - 0, physics.position.z - 8);
  assert.ok(
    distFromCylinder >= 3.0 + 0.65 - 0.05,
    `Astronaut must be blocked outside obstacle radius (${distFromCylinder.toFixed(2)}m)`
  );

  // 2. Towering steep mountain cone (Mars Mount Sharp / Moon horizon massif)
  const mountain = { x: 0, z: 32, baseRadius: 20, height: 34, baseY: 0 };
  physics.setObstacles([]);
  physics.setMountainObstacles([mountain]);
  physics.teleport(0, 6);

  for (let i = 0; i < 120; i++) {
    physics.update(
      0.03,
      { forward: true, backward: false, left: false, right: false, sprint: true, jump: false },
      'mars'
    );
  }

  const distFromPeak = Math.hypot(physics.position.x - mountain.x, physics.position.z - mountain.z);
  assert.ok(
    distFromPeak >= 16.0,
    `Astronaut must NOT walk through steep mountain base (${distFromPeak.toFixed(2)}m)`
  );
});

test('PlanetaryPhysicsController - Steep cliff slope limit rejects vertical penetration while gentle slopes remain walkable', () => {
  // Steep sheer step at z > 10 (grade >> 38 deg)
  const steepTerrain = (_x: number, z: number) => (z > 10 ? (z - 10) * 3.5 : 0);
  const cliffPhysics = new PlanetaryPhysicsController('moon', steepTerrain);
  cliffPhysics.teleport(0, 6);

  for (let i = 0; i < 60; i++) {
    cliffPhysics.update(
      0.03,
      { forward: true, backward: false, left: false, right: false, sprint: false, jump: false },
      'moon'
    );
  }
  assert.ok(
    cliffPhysics.position.z <= 11.2,
    `Steep cliff must block straight-up climb (z=${cliffPhysics.position.z.toFixed(2)})`
  );

  // Gentle 15-degree ramp (tan 15 deg ~= 0.268 << tan 38 deg ~= 0.781) is smoothly walkable
  const gentleTerrain = (_x: number, z: number) => (z > 0 ? z * 0.25 : 0);
  const gentlePhysics = new PlanetaryPhysicsController('moon', gentleTerrain);
  gentlePhysics.teleport(0, 0);

  for (let i = 0; i < 60; i++) {
    gentlePhysics.update(
      0.03,
      { forward: true, backward: false, left: false, right: false, sprint: false, jump: false },
      'moon'
    );
  }
  assert.ok(
    gentlePhysics.position.z > 6.0 && gentlePhysics.position.y > 1.2,
    `Gentle walkable slope should ascend smoothly (z=${gentlePhysics.position.z.toFixed(2)}, y=${gentlePhysics.position.y.toFixed(2)})`
  );
});

test('Shuttle Destination Filtering - Always offers the 2 other habitable planets', () => {
  const fromEarth = getAvailableShuttleDestinations('earth').map(d => d.id);
  assert.deepEqual(fromEarth, ['moon', 'mars']);

  const fromMoon = getAvailableShuttleDestinations('moon').map(d => d.id);
  assert.deepEqual(fromMoon, ['earth', 'mars']);

  const fromMars = getAvailableShuttleDestinations('mars').map(d => d.id);
  assert.deepEqual(fromMars, ['earth', 'moon']);
});

test('Shuttle Boarding, Lock, Exit Rules & Round-Trip Interplanetary Flight State Machine', () => {
  const padEarth = SHUTTLE_PADS.earth;

  // Too far from pad -> cannot board
  assert.equal(
    canBoardShuttle({
      playerX: 0,
      playerZ: 0,
      shuttleX: padEarth.x,
      shuttleZ: padEarth.z,
      currentPlanet: 'earth',
      shuttlePlanet: 'earth',
      state: 'on_foot'
    }),
    false
  );

  // Within boarding radius -> can board
  assert.equal(
    canBoardShuttle({
      playerX: padEarth.x - (SHUTTLE_BOARDING_RADIUS - 0.5),
      playerZ: padEarth.z,
      shuttleX: padEarth.x,
      shuttleZ: padEarth.z,
      currentPlanet: 'earth',
      shuttlePlanet: 'earth',
      state: 'on_foot'
    }),
    true
  );

  // Walking locked while seated/flying, exit allowed only in seated_cockpit
  assert.equal(isAstronautLockedInShuttle('on_foot'), false);
  assert.equal(isAstronautLockedInShuttle('seated_cockpit'), true);
  assert.equal(isAstronautLockedInShuttle('space_travel'), true);
  assert.equal(isShuttleExitAllowed('seated_cockpit'), true);
  assert.equal(isShuttleExitAllowed('takeoff'), false);
  assert.equal(isShuttleExitAllowed('space_travel'), false);

  // Helper to simulate stepping a full trip from origin -> dest
  const runFlight = (origin: HabitablePlanetId, dest: HabitablePlanetId) => {
    let state: ShuttleInteractionState = 'takeoff';
    let phaseTime = 0;
    let originPlanet: HabitablePlanetId = origin;
    let destinationPlanet: HabitablePlanetId | null = dest;
    let shuttlePlanet: HabitablePlanetId = origin;

    const seenPhases = new Set<ShuttleInteractionState>([state]);
    let enteredLanding = false;
    let landed = false;

    const totalSimSteps = Math.ceil(
      (TRAVEL_PHASE_DURATIONS.takeoff +
        TRAVEL_PHASE_DURATIONS.space_travel +
        TRAVEL_PHASE_DURATIONS.approach +
        TRAVEL_PHASE_DURATIONS.landing +
        1.0) /
        0.05
    );

    for (let i = 0; i < totalSimSteps; i++) {
      const res = advanceShuttleState(
        { state, phaseTime, originPlanet, destinationPlanet, shuttlePlanet },
        0.05
      );
      state = res.state;
      phaseTime = res.phaseTime;
      originPlanet = res.originPlanet;
      destinationPlanet = res.destinationPlanet;
      shuttlePlanet = res.shuttlePlanet;
      seenPhases.add(state);
      if (res.justEnteredLandingScene) enteredLanding = true;
      if (res.justLanded) {
        landed = true;
        break;
      }
    }

    assert.ok(seenPhases.has('takeoff'), 'Must pass through takeoff');
    assert.ok(seenPhases.has('space_travel'), 'Must pass through space_travel');
    assert.ok(seenPhases.has('approach'), 'Must pass through approach');
    assert.ok(seenPhases.has('landing'), 'Must pass through landing');
    assert.equal(enteredLanding, true, 'Must trigger landing scene transition');
    assert.equal(landed, true, 'Must reach landing touchdown');
    assert.equal(state, 'seated_cockpit', 'Astronaut stays seated after touchdown ready to exit');
    assert.equal(shuttlePlanet, dest, 'Shuttle must arrive at destination planet');
  };

  // Multi-planet round-trip chain: Earth -> Moon -> Mars -> Earth
  runFlight('earth', 'moon');
  runFlight('moon', 'mars');
  runFlight('mars', 'earth');

  // Verify telemetry snapshot calculation mid-flight
  const midFlightTelem = buildTravelTelemetry({
    state: 'space_travel',
    phaseTime: TRAVEL_PHASE_DURATIONS.space_travel * 0.5,
    originPlanet: 'earth',
    destinationPlanet: 'moon',
    shuttlePlanet: 'earth',
    shuttleCameraView: 'external_chase'
  });
  assert.ok(midFlightTelem.overallProgress > 0.3 && midFlightTelem.overallProgress < 0.6);
  assert.ok(midFlightTelem.distanceRemainingKm > 0 && midFlightTelem.distanceRemainingKm < 384400);
});

test('Dual Camera Selection & Environment-Distinct Propulsion Profiles', () => {
  // 1. Camera view selection/toggle preserves continuity without altering flight state
  assert.equal(selectShuttleCameraView('cockpit', 'toggle'), 'external_chase');
  assert.equal(selectShuttleCameraView('external_chase', 'toggle'), 'cockpit');
  assert.equal(selectShuttleCameraView('external_chase', 'cockpit'), 'cockpit');
  assert.equal(selectShuttleCameraView('cockpit', 'external_chase'), 'external_chase');

  // 2. Open space cruise/approach has active thrust & zero ground dust / atmospheric smoke
  const spaceCruise = computeShuttlePropulsionProfile({
    state: 'space_travel',
    phaseProgress: 0.5,
    altitudeMeters: 420000,
    planet: 'earth'
  });
  assert.equal(spaceCruise.environment, 'space');
  assert.ok(spaceCruise.thrustIntensity > 0.8);
  assert.equal(spaceCruise.dustIntensity, 0);
  assert.equal(spaceCruise.gearExtended, 0);

  // 3. Landing near ground kicks up dust, cuts engine cleanly after touchdown, and Mars dust settles longer than Moon
  const moonLowDescent = computeShuttlePropulsionProfile({
    state: 'landing',
    phaseProgress: 0.72,
    altitudeMeters: 8,
    planet: 'moon'
  });
  assert.equal(moonLowDescent.environment, 'moon');
  assert.ok(moonLowDescent.thrustIntensity > 0.5);
  assert.ok(moonLowDescent.dustIntensity > 0.4);
  assert.equal(moonLowDescent.gearExtended, 1);

  // Post-touchdown (progress 0.94): Moon ballistic dust has settled to 0, while Mars thin atmosphere retains faint suspended dust slightly longer
  const moonSettled = computeShuttlePropulsionProfile({
    state: 'landing',
    phaseProgress: 0.94,
    altitudeMeters: 0,
    planet: 'moon'
  });
  const marsSettling = computeShuttlePropulsionProfile({
    state: 'landing',
    phaseProgress: 0.94,
    altitudeMeters: 0,
    planet: 'mars'
  });
  assert.equal(moonSettled.thrustIntensity, 0, 'Engines must shut down cleanly after touchdown');
  assert.equal(marsSettling.thrustIntensity, 0, 'Engines must shut down cleanly after touchdown');
  assert.equal(moonSettled.dustIntensity, 0, 'Moon ballistic dust settles rapidly in vacuum');
  assert.ok(marsSettling.dustIntensity > moonSettled.dustIntensity, 'Mars dust lingers slightly longer in thin atmosphere');
});

