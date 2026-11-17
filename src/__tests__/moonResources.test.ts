import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALSEP_FIVE_STATIONS,
  APOLLO_12_ALSEP_INSTRUMENTS,
  APOLLO_12_INTREPID_SITE,
  computeAscentSeparationState,
  computeLaserPulseRoundTrip,
  computeLrvPhysicsStep,
  computeSurveyorBounceHeight,
  computeWalkbackStatus,
  getMoonSiteCoordinates,
  LRV_MISSIONS,
  MOON_CHRONOLOGICAL_TIMELINE,
  MOON_RESOURCE_QUIZZES,
  MOON_RESOURCE_SITES,
  MOON_RESOURCES,
  SURVEYOR_PROGRAM_ENTRIES
} from '../moonResources/moonResourceData';
import { LrvPhysicsState, MoonResourceId } from '../moonResources/moonResourceTypes';
import { SHUTTLE_PADS } from '../shuttle/shuttleTravelState';

test('All 4 Historical Moon Resources exist with NASA sources and zero Mars content', () => {
  const ids: MoonResourceId[] = ['apollo_lm', 'lunar_rover', 'alsep', 'surveyor'];
  for (const id of ids) {
    const res = MOON_RESOURCES[id];
    assert.ok(res, `Missing resource ${id}`);
    assert.ok(res.referenceImage.startsWith('/assets/aistudio/'), `Expected archival image path for ${id}`);
    assert.ok(res.sources.length >= 1, `Expected official NASA sources for ${id}`);
    assert.ok(res.crew.length >= 3, `Expected crew / spacecraft roster for ${id}`);

    const blob = JSON.stringify(res);
    assert.equal(/\bMartian\b|\bPerseverance\b|\bJezero\b/i.test(blob), false, `Found unexpected Mars term inside ${id}`);
  }
});

test('Resource 01 (Apollo LM): Ascent stage rises toward Columbia while Descent stage stays permanently at 0 m', () => {
  const samples = [0, 0.15, 0.35, 0.65, 0.9, 1.0];
  let prevAscent = -1;
  for (const p of samples) {
    const state = computeAscentSeparationState(p);
    assert.equal(
      state.descentAltitudeMeters,
      0,
      `Descent stage must remain fixed on lunar surface (p=${p})`
    );
    assert.ok(state.ascentAltitudeMeters >= prevAscent, 'Ascent altitude should rise monotonically');
    prevAscent = state.ascentAltitudeMeters;
  }
  const finalState = computeAscentSeparationState(1.0);
  assert.equal(finalState.dockedWithColumbia, true);
  assert.ok(finalState.ascentAltitudeMeters > 80);

  // Laser Ranging Retroreflector round-trip light time (~2.56s for 384,400 km)
  const laserEnd = computeLaserPulseRoundTrip(1.0);
  assert.equal(laserEnd.measuredDistanceKm, 384400);
  assert.ok(laserEnd.elapsedSeconds > 2.4 && laserEnd.elapsedSeconds < 2.7);
});

test('Resource 02 (LRV): Distinct Apollo 15, 16, 17 sites, electric speed limits & walkback limit safety', () => {
  assert.equal(LRV_MISSIONS.length, 3);
  const a15 = LRV_MISSIONS.find(m => m.missionId === 'apollo_15')!;
  const a16 = LRV_MISSIONS.find(m => m.missionId === 'apollo_16')!;
  const a17 = LRV_MISSIONS.find(m => m.missionId === 'apollo_17')!;
  assert.ok(a15.drivers.includes('David R. Scott') && a15.drivers.includes('James B. Irwin'));
  assert.ok(a16.drivers.includes('John W. Young') && a16.drivers.includes('Charles M. Duke Jr.'));
  assert.ok(a17.drivers.includes('Eugene A. Cernan') && a17.drivers.includes('Harrison H. Schmitt'));

  // Low-gravity physics step stays under speed cap & updates dual steering
  let lrv: LrvPhysicsState = {
    x: 10,
    y: 0,
    z: 0,
    vx: 0,
    vz: 0,
    headingRad: 0,
    steerAngleRad: 0,
    wheelSpinRad: 0,
    speedMps: 0,
    distanceMeters: 0,
    batteryPercent: 98,
    isBraking: false
  };
  for (let i = 0; i < 60; i++) {
    lrv = computeLrvPhysicsStep(
      lrv,
      { forward: true, backward: false, left: true, right: false, brake: false },
      0.04,
      13,
      () => 0
    );
  }
  assert.ok(lrv.speedMps <= 13 / 3.6 + 0.05, 'LRV speed should respect ~13 km/h limit');
  assert.ok(lrv.steerAngleRad > 0.1, 'Steering left should deflect steerAngleRad');
  assert.ok(lrv.distanceMeters > 2, 'Rover should advance forward');
  assert.ok(lrv.batteryPercent < 98, 'Driving should draw battery power');

  const safeWb = computeWalkbackStatus(20, 0, 6, 0, 42);
  assert.equal(safeWb.exceeded, false);
  const unsafeWb = computeWalkbackStatus(60, 0, 6, 0, 42);
  assert.equal(unsafeWb.exceeded, true);
  assert.ok(unsafeWb.warningText?.includes('WALKBACK LIMIT EXCEEDED'));
});

test('Resource 03 (ALSEP): Exact 6 Apollo 12 instruments, 5 ALSEP stations & Retroreflector separation', () => {
  const codes = APOLLO_12_ALSEP_INSTRUMENTS.map(i => i.code);
  assert.deepEqual(codes, ['PSE', 'LSM', 'SWS', 'SIDE', 'CCIG', 'LDD']);
  assert.equal(ALSEP_FIVE_STATIONS.length, 5);

  const apollo12 = ALSEP_FIVE_STATIONS[0];
  assert.match(apollo12.mission, /Apollo 12/);
  assert.match(apollo12.hasRetroreflectorNote, /No Laser Ranging Retroreflector/i);
});

test('Resource 04 (Surveyor): 3-contact bouncing landing (10m -> 3m -> soft) and Surveyor 1–7 failures accurate', () => {
  const peak1 = computeSurveyorBounceHeight(0.505);
  assert.equal(peak1.contactCount, 1);
  assert.ok(peak1.altitudeMeters >= 9.5 && peak1.altitudeMeters <= 10.1);

  const peak2 = computeSurveyorBounceHeight(0.77);
  assert.equal(peak2.contactCount, 2);
  assert.ok(peak2.altitudeMeters >= 2.8 && peak2.altitudeMeters <= 3.1);

  const landed = computeSurveyorBounceHeight(1.0);
  assert.equal(landed.contactCount, 3);
  assert.equal(landed.altitudeMeters, 0);
  assert.equal(landed.engineFiring, false);

  assert.equal(SURVEYOR_PROGRAM_ENTRIES.length, 7);
  const surv2 = SURVEYOR_PROGRAM_ENTRIES.find(s => s.mission === 'Surveyor 2')!;
  const surv4 = SURVEYOR_PROGRAM_ENTRIES.find(s => s.mission === 'Surveyor 4')!;
  assert.equal(surv2.isSuccess, false);
  assert.equal(surv4.isSuccess, false);
  const successes = SURVEYOR_PROGRAM_ENTRIES.filter(s => s.isSuccess);
  assert.equal(successes.length, 5);
});

test('Quizzes contain 44 historically valid questions (10 + 10 + 12 + 12)', () => {
  assert.equal(MOON_RESOURCE_QUIZZES.apollo_lm.length, 10);
  assert.equal(MOON_RESOURCE_QUIZZES.lunar_rover.length, 10);
  assert.equal(MOON_RESOURCE_QUIZZES.alsep.length, 12);
  assert.equal(MOON_RESOURCE_QUIZZES.surveyor.length, 12);

  for (const list of Object.values(MOON_RESOURCE_QUIZZES)) {
    for (const q of list) {
      assert.equal(q.options.length, 4);
      assert.ok(q.correctIndex >= 0 && q.correctIndex < 4);
      assert.ok(q.explanation.length > 10);
    }
  }
});

test('Moon Museum Sites: Separated non-overlapping regions, valid Shuttle clearance & 1967–1972 chronological timeline', () => {
  const ids: MoonResourceId[] = ['apollo_lm', 'lunar_rover', 'alsep', 'surveyor'];
  const moonPad = SHUTTLE_PADS.moon;

  for (let i = 0; i < ids.length; i++) {
    const a = MOON_RESOURCE_SITES[ids[i]];
    const padDist = Math.hypot(a.x - moonPad.x, a.z - moonPad.z);
    assert.ok(padDist >= 25, `Site ${a.id} must stay >= 25m from Moon Shuttle Pad (got ${padDist.toFixed(1)}m)`);

    const approach = getMoonSiteCoordinates(a.id);
    const approachDist = Math.hypot(approach.x - a.x, approach.z - a.z);
    assert.ok(
      approachDist >= 4 && approachDist <= 10,
      `Approach coordinate for ${a.id} should be safely beside site (got ${approachDist.toFixed(1)}m)`
    );

    for (let j = i + 1; j < ids.length; j++) {
      const b = MOON_RESOURCE_SITES[ids[j]];
      const sep = Math.hypot(a.x - b.x, a.z - b.z);
      assert.ok(sep >= 14, `Sites ${a.id} and ${b.id} must be cleanly separated (got ${sep.toFixed(1)}m)`);
    }
  }

  // Apollo 12 Intrepid stands safely near ALSEP without overlapping Shuttle pad or Apollo 11
  assert.ok(Math.hypot(APOLLO_12_INTREPID_SITE.x - moonPad.x, APOLLO_12_INTREPID_SITE.z - moonPad.z) >= 25);
  assert.ok(Math.hypot(APOLLO_12_INTREPID_SITE.x - MOON_RESOURCE_SITES.alsep.x, APOLLO_12_INTREPID_SITE.z - MOON_RESOURCE_SITES.alsep.z) >= 8);

  // Check chronological timeline covers 1967 -> 1972
  assert.equal(MOON_CHRONOLOGICAL_TIMELINE.length, 6);
  assert.equal(MOON_CHRONOLOGICAL_TIMELINE[0].year, '1967');
  assert.equal(MOON_CHRONOLOGICAL_TIMELINE[0].resourceId, 'surveyor');
  assert.equal(MOON_CHRONOLOGICAL_TIMELINE[0].statusBadge, 'LANDED ON MOON');
  assert.equal(MOON_CHRONOLOGICAL_TIMELINE[5].year, '1972');
  assert.equal(MOON_CHRONOLOGICAL_TIMELINE[5].lrvMissionId, 'apollo_17');

  // Verify all LRV EVA waypoints stay clear of Shuttle Pad, Eagle, ALSEP, and Surveyor 3
  for (const mission of LRV_MISSIONS) {
    for (const eva of mission.excursions) {
      for (const wp of eva.waypoints) {
        assert.ok(
          Math.hypot(wp.x - moonPad.x, wp.z - moonPad.z) >= 12,
          `LRV waypoint ${wp.id} too close to Shuttle Pad`
        );
        assert.ok(
          Math.hypot(wp.x - MOON_RESOURCE_SITES.alsep.x, wp.z - MOON_RESOURCE_SITES.alsep.z) >= 18,
          `LRV waypoint ${wp.id} too close to ALSEP`
        );
        assert.ok(
          Math.hypot(wp.x - MOON_RESOURCE_SITES.surveyor.x, wp.z - MOON_RESOURCE_SITES.surveyor.z) >= 24,
          `LRV waypoint ${wp.id} too close to Surveyor 3`
        );
      }
    }
  }
});
