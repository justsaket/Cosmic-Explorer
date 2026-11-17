import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SHUTTLE_PLANET_CONFIGS,
  createInitialShuttleState,
  isPlayerNearShuttle,
  getShuttleHatchWorldPos,
  getShuttleDisembarkWorldPos,
  getShuttleObstacles,
  getDestinationOptions,
  canLaunchMission,
  computeTakeoffTransform,
  computeCruiseProgress,
  computeLandingTransform
} from '../shuttle/shuttleSystem';

test('ShuttleSystem - Boarding Proximity & Disembark Safety', () => {
  for (const planet of ['earth', 'moon', 'mars'] as const) {
    const hatch = getShuttleHatchWorldPos(planet);
    const disembark = getShuttleDisembarkWorldPos(planet);

    const nearHatch = isPlayerNearShuttle(hatch.x, hatch.z, planet);
    assert.equal(nearHatch.near, true, `Player at ${planet} hatch must trigger boarding prompt`);
    assert.ok(nearHatch.distance <= 0.1, `Hatch distance should be ~0, got ${nearHatch.distance}`);

    const nearDisembark = isPlayerNearShuttle(disembark.x, disembark.z, planet);
    assert.equal(nearDisembark.near, true, `Disembark spot on ${planet} should be within boarding range`);

    const farAway = isPlayerNearShuttle(hatch.x + 25, hatch.z + 25, planet);
    assert.equal(farAway.near, false, `Far away player on ${planet} must NOT trigger boarding prompt`);
  }
});

test('ShuttleSystem - Obstacle Colliders Active Only While Parked/Cockpit', () => {
  const parkedObstacles = getShuttleObstacles('earth', 'parked');
  assert.equal(parkedObstacles.length, 3, 'Parked shuttle exposes fuselage, nose, and aft colliders');

  const disembarkPos = getShuttleDisembarkWorldPos('earth');
  for (const obs of parkedObstacles) {
    const dist = Math.hypot(disembarkPos.x - obs.x, disembarkPos.z - obs.z);
    assert.ok(dist > obs.radius + 0.65, `Disembark spot must clear shuttle obstacle collider (dist=${dist}, radius=${obs.radius})`);
  }

  assert.equal(getShuttleObstacles('earth', 'takeoff').length, 0, 'No ground obstacles during takeoff');
  assert.equal(getShuttleObstacles('moon', 'cruise').length, 0, 'No ground obstacles during cruise');
  assert.equal(getShuttleObstacles('mars', 'landing').length, 0, 'No ground obstacles during landing');
});

test('ShuttleSystem - Destination Cards & Launch Confirmation Guard', () => {
  const state = createInitialShuttleState('earth');
  assert.equal(canLaunchMission(state), false, 'Cannot launch from parked state');

  state.phase = 'cockpit';
  assert.equal(canLaunchMission(state), false, 'Cannot launch without destination');

  // Trying to launch to current planet must be blocked
  state.selectedDestination = 'earth';
  state.launchConfirmed = true;
  assert.equal(canLaunchMission(state), false, 'Cannot launch to the planet already parked on');

  // Selecting Moon without confirmation must be blocked
  state.selectedDestination = 'moon';
  state.launchConfirmed = false;
  assert.equal(canLaunchMission(state), false, 'Requires explicit confirmation step');

  // Confirming Moon launch passes
  state.launchConfirmed = true;
  assert.equal(canLaunchMission(state), true, 'Valid confirmed Earth -> Moon launch allowed');

  // Verify round-trip destination options from Moon & Mars include Earth
  const moonOptions = getDestinationOptions('moon');
  assert.equal(moonOptions.find(o => o.planetId === 'moon')?.isCurrentLocation, true);
  assert.equal(moonOptions.find(o => o.planetId === 'earth')?.isCurrentLocation, false);
  assert.equal(moonOptions.find(o => o.planetId === 'mars')?.isCurrentLocation, false);

  const marsOptions = getDestinationOptions('mars');
  assert.equal(marsOptions.find(o => o.planetId === 'mars')?.isCurrentLocation, true);
  assert.equal(marsOptions.find(o => o.planetId === 'earth')?.ctaLabel, 'Return to Earth Home Base');
});

test('ShuttleSystem - Takeoff, Cruise, and Landing Curves', () => {
  const tStart = computeTakeoffTransform(0);
  const tIgnition = computeTakeoffTransform(0.2);
  const tClimb = computeTakeoffTransform(0.55);
  const tOrbit = computeTakeoffTransform(1.0);

  assert.equal(tStart.altitudeY, 0);
  assert.ok(tIgnition.throttle > 0.8);
  assert.ok(tClimb.altitudeY > 10);
  assert.ok(tOrbit.altitudeY > 100);
  assert.equal(tOrbit.gearExtended, 0, 'Landing gear retracted in orbital ascent');

  const cStart = computeCruiseProgress(0);
  const cMid = computeCruiseProgress(0.5);
  const cEnd = computeCruiseProgress(1.0);
  assert.ok(cEnd.originDistance > cStart.originDistance, 'Origin planet recedes during cruise');
  assert.ok(cEnd.targetDistance < cStart.targetDistance, 'Destination planet approaches during cruise');
  assert.ok(cEnd.targetScale > cStart.targetScale, 'Destination planet grows in perspective');
  assert.ok(cMid.speedKms > 20, 'Cruise velocity realistic in mid-flight');

  const approachAlt = SHUTTLE_PLANET_CONFIGS.moon.approachAltitude;
  const lStart = computeLandingTransform(0, approachAlt);
  const lFlare = computeLandingTransform(0.75, approachAlt);
  const lTouch = computeLandingTransform(0.88, approachAlt);
  const lEnd = computeLandingTransform(1.0, approachAlt);

  assert.equal(lStart.altitudeY, approachAlt);
  assert.ok(lFlare.altitudeY > 0 && lFlare.altitudeY < 20);
  assert.equal(lFlare.gearExtended, 1, 'Landing gear deployed prior to flare');
  assert.ok(lTouch.suspensionCompression > 0, 'Suspension compresses on touchdown');
  assert.equal(lEnd.altitudeY, 0);
  assert.equal(lEnd.isSettled, true);
});
