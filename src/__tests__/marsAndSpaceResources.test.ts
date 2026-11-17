import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeDawnIonTrajectory,
  computeIngenuityFlightStep,
  computeKeplerTransitLightCurve,
  computePathfinderEdlState,
  computePhoenixFrostSublimation,
  computePioneerTrajectories,
  computeSojournerMissionCounter,
  computeVikingEdlState,
  getMarsProximityNarration,
  getMarsShuttlePadDistance,
  getMarsSiteCoordinates,
  isInHabitableZoneAU,
  MARS_ALL_SITES,
  MARS_AND_SPACE_RESOURCES,
  MARS_CHRONOLOGICAL_TIMELINE,
  MARS_SKY_EXHIBITS,
  MARS_SURFACE_SITES,
  MER_TWIN_PROFILES,
  RESOURCE_CATEGORIES
} from '../marsResources/marsResourceData';
import { getMoonProximityNarration } from '../moonResources/moonResourceData';
import { MARS_AND_SPACE_QUIZZES } from '../marsResources/marsResourceQuizzes';
import {
  MarsAndSpaceResourceId,
  MarsSurfaceResourceId
} from '../marsResources/marsResourceTypes';
import { SHUTTLE_PADS } from '../shuttle/shuttleTravelState';

test('Strict 3-category separation: 6 Mars (incl Curiosity), 2 Outer Solar System (Dawn, Pioneer), 1 Deep Space (Kepler)', () => {
  assert.equal(RESOURCE_CATEGORIES.length, 3);

  const marsCat = RESOURCE_CATEGORIES.find(c => c.id === 'mars')!;
  const outerCat = RESOURCE_CATEGORIES.find(c => c.id === 'outer_solar_system')!;
  const deepCat = RESOURCE_CATEGORIES.find(c => c.id === 'deep_space')!;

  assert.deepEqual(marsCat.resourceIds, [
    'sojourner',
    'spirit_opportunity',
    'viking_1',
    'phoenix_insight',
    'curiosity',
    'ingenuity'
  ]);
  assert.deepEqual(outerCat.resourceIds, ['dawn', 'pioneer']);
  assert.deepEqual(deepCat.resourceIds, ['kepler']);

  const allIds: MarsAndSpaceResourceId[] = [
    'sojourner',
    'spirit_opportunity',
    'viking_1',
    'phoenix_insight',
    'curiosity',
    'ingenuity',
    'dawn',
    'pioneer',
    'kepler'
  ];
  for (const id of allIds) {
    const cfg = MARS_AND_SPACE_RESOURCES[id];
    assert.ok(cfg, `Missing config for ${id}`);
    assert.ok(cfg.sources.length >= 1, `Expected official source for ${id}`);
    assert.ok(cfg.hotspots.length >= 3, `Expected interactive hotspots for ${id}`);
    assert.ok(Object.keys(cfg.narrationEn).length >= 6);
    assert.ok(Object.keys(cfg.narrationHi).length >= 6);
  }
});

test('Dawn, Pioneer 10/11, and Kepler are flagged as off-Mars craft with sky-projected exhibits', () => {
  assert.equal(MARS_AND_SPACE_RESOURCES.dawn.isOrbiterOrFlybyOnly, true);
  assert.equal(MARS_AND_SPACE_RESOURCES.pioneer.isOrbiterOrFlybyOnly, true);
  assert.equal(MARS_AND_SPACE_RESOURCES.kepler.isOrbiterOrFlybyOnly, true);
  assert.equal('dawn' in MARS_SURFACE_SITES, false);
  assert.equal('pioneer' in MARS_SURFACE_SITES, false);
  assert.equal('kepler' in MARS_SURFACE_SITES, false);
  assert.equal(MARS_SKY_EXHIBITS.dawn.isSkyExhibit, true);
  assert.equal(MARS_SKY_EXHIBITS.pioneer.isSkyExhibit, true);
  assert.equal(MARS_SKY_EXHIBITS.kepler.isSkyExhibit, true);
  assert.ok((MARS_SKY_EXHIBITS.dawn.hoverAltitudeMeters ?? 0) >= 3 && (MARS_SKY_EXHIBITS.dawn.hoverAltitudeMeters ?? 0) <= 10);
  assert.ok((MARS_SKY_EXHIBITS.pioneer.hoverAltitudeMeters ?? 0) >= 3 && (MARS_SKY_EXHIBITS.pioneer.hoverAltitudeMeters ?? 0) <= 10);
  assert.ok((MARS_SKY_EXHIBITS.kepler.hoverAltitudeMeters ?? 0) >= 3 && (MARS_SKY_EXHIBITS.kepler.hoverAltitudeMeters ?? 0) <= 10);
});

test('All 9 Mars & Sky zones maintain safe separation from Mars Shuttle Pad and each other', () => {
  const siteIds: MarsSurfaceResourceId[] = [
    'viking_1',
    'sojourner',
    'spirit_opportunity',
    'phoenix_insight',
    'curiosity',
    'ingenuity'
  ];
  const allSiteIds = Object.keys(MARS_ALL_SITES) as MarsAndSpaceResourceId[];
  assert.equal(allSiteIds.length, 9);
  assert.equal(siteIds.length, 6);

  for (const id of allSiteIds) {
    const site = MARS_ALL_SITES[id];
    assert.ok(site.clearRadius >= 10, `clearRadius too small on ${id}`);
    const padDist = getMarsShuttlePadDistance(id);
    assert.ok(
      padDist >= 25,
      `Mars site ${id} too close to Mars shuttle pad (${padDist}m vs ${SHUTTLE_PADS.mars.x},${SHUTTLE_PADS.mars.z})`
    );
    const approach = getMarsSiteCoordinates(id);
    const distFromCenter = Math.hypot(approach.x - site.x, approach.z - site.z);
    assert.ok(distFromCenter >= 4 && distFromCenter <= site.interactionRadius);
  }

  for (let i = 0; i < allSiteIds.length; i++) {
    for (let j = i + 1; j < allSiteIds.length; j++) {
      const a = MARS_ALL_SITES[allSiteIds[i]];
      const b = MARS_ALL_SITES[allSiteIds[j]];
      const pairDist = Math.hypot(a.x - b.x, a.z - b.z);
      assert.ok(
        pairDist >= 26,
        `Sites ${a.id} and ${b.id} must be cleanly separated (${pairDist.toFixed(1)}m)`
      );
    }
  }

  assert.equal(MARS_CHRONOLOGICAL_TIMELINE.length, 10);
});

test('Scientific accuracy checks: Opportunity Oct 11, 2026 record note, Viking 1 seismometer note, Stationary landers', () => {
  const opp = MER_TWIN_PROFILES.find(r => r.id === 'opportunity')!;
  assert.equal(opp.distanceKm, 45.16);
  assert.ok(opp.distanceNote.includes('October 11, 2026'), 'Must cite Oct 11, 2026 Perseverance record update');

  const vikingBlob = JSON.stringify(MARS_AND_SPACE_RESOURCES.viking_1);
  assert.ok(
    /did NOT operate successfully|seismometer.*not|failed/i.test(vikingBlob),
    'Viking 1 must note seismometer failure honestly'
  );

  assert.equal(MARS_AND_SPACE_RESOURCES.phoenix_insight.isStationaryLanderOnly, true);
  assert.ok(MARS_AND_SPACE_RESOURCES.phoenix_insight.secondaryBadgeTitle?.includes('INSIGHT'));
});

test('Pure EDL & Sojourner duration counters advance physically', () => {
  const entry = computePathfinderEdlState(0.05);
  assert.equal(entry.airbagsInflated, false);
  assert.ok(entry.altitudeMeters > 10000);

  const bounce = computePathfinderEdlState(0.4);
  assert.equal(bounce.airbagsInflated, true);

  const rollOff = computePathfinderEdlState(1.0);
  assert.equal(rollOff.petalsOpen01, 1);
  assert.equal(rollOff.rampExtended01, 1);
  assert.ok(rollOff.sojournerRollOffset > 3);

  const ctr7 = computeSojournerMissionCounter(7 / 83);
  assert.equal(ctr7.designDays, 7);
  assert.equal(ctr7.actualDays, 7);
  const ctr83 = computeSojournerMissionCounter(1);
  assert.equal(ctr83.actualDays, 83);
});

test('Viking 1 EDL keeps Viking Orbiter permanently in Mars orbit', () => {
  for (const p of [0, 0.3, 0.6, 1.0]) {
    const v = computeVikingEdlState(p);
    assert.equal(v.orbiterStaysInOrbit, true);
    assert.ok(v.orbiterAltitudeKm > 1000);
  }
  assert.equal(computeVikingEdlState(1.0).landerAltitudeMeters, 0);
});

test('Phoenix frost sublimation & Ingenuity thin-air rotor physics behave monotonically', () => {
  const day0 = computePhoenixFrostSublimation(0);
  const day3 = computePhoenixFrostSublimation(3);
  const day19 = computePhoenixFrostSublimation(19);
  assert.equal(day0.visibleBrightIcePercent, 100);
  assert.ok(day3.visibleBrightIcePercent < 100 && day3.visibleBrightIcePercent > 0);
  assert.equal(day19.visibleBrightIcePercent, 0);

  const zeroRpm = computeIngenuityFlightStep({
    collectivePitch: 0.7,
    rotorRpm: 0,
    airDensityRatioToEarth: 0.01,
    altitudeMeters: 0,
    verticalVelocityMps: 0,
    dt: 0.05
  });
  assert.equal(zeroRpm.canHover, false);
  assert.equal(zeroRpm.altitudeMeters, 0);

  const highRpm = computeIngenuityFlightStep({
    collectivePitch: 0.9,
    rotorRpm: 2537,
    airDensityRatioToEarth: 0.01,
    altitudeMeters: 2,
    verticalVelocityMps: 0,
    dt: 0.05
  });
  assert.equal(highRpm.canHover, true);
  assert.ok(highRpm.liftToWeightRatio >= 1.0);
});

test('Dawn ion trajectory, Pioneer 10/11 trajectories & Kepler transit light curve', () => {
  assert.equal(computeDawnIonTrajectory(0.3).targetBody, 'Mars Gravity Assist');
  assert.equal(computeDawnIonTrajectory(0.55).targetBody, 'Vesta Orbit');
  assert.equal(computeDawnIonTrajectory(0.95).isOrbiterOnly, true);

  assert.equal(computePioneerTrajectories('pioneer_10', 0.4).missionRole, 'Flyby Only');
  const p11Saturn = computePioneerTrajectories('pioneer_11', 0.5);
  assert.ok(p11Saturn.milestone.includes('Saturn Flyby'));

  const outOfTransit = computeKeplerTransitLightCurve(0.05, 0.1, 0);
  assert.equal(outOfTransit.inTransit, false);
  assert.equal(outOfTransit.relativeBrightness, 1);

  const midTransit = computeKeplerTransitLightCurve(0.5, 0.1, 0);
  assert.equal(midTransit.inTransit, true);
  assert.ok(Math.abs(midTransit.relativeBrightness - 0.99) < 0.0005);

  const earthHz = isInHabitableZoneAU(1.0, 1.0);
  assert.equal(earthHz.zone, 'habitable_zone');
  assert.ok(earthHz.note.includes('NOT proof of life'));
  assert.equal(isInHabitableZoneAU(1.0, 0.3).zone, 'too_hot');
  assert.equal(isInHabitableZoneAU(1.0, 3.2).zone, 'too_cold');
});

test('All 87 Mars & Deep Space quiz questions are well-formed', () => {
  const counts: Record<MarsAndSpaceResourceId, number> = {
    sojourner: 7,
    spirit_opportunity: 10,
    viking_1: 8,
    phoenix_insight: 12,
    curiosity: 8,
    dawn: 10,
    pioneer: 10,
    ingenuity: 10,
    kepler: 12
  };
  let total = 0;
  for (const [id, expected] of Object.entries(counts) as [MarsAndSpaceResourceId, number][]) {
    const list = MARS_AND_SPACE_QUIZZES[id];
    assert.equal(list.length, expected, `Unexpected quiz count for ${id}`);
    for (const q of list) {
      assert.equal(q.options.length, 4, `Expected 4 options on ${q.id}`);
      assert.ok(q.correctIndex >= 0 && q.correctIndex < 4);
      assert.ok(q.explanation.length > 12);
    }
    total += list.length;
  }
  assert.equal(total, 87);
});

test('Proximity narration helpers generate non-empty English & Hindi scripts for all 4 Moon & 9 Mars/Sky sites', () => {
  const marsIds = Object.keys(MARS_ALL_SITES) as MarsAndSpaceResourceId[];
  for (const id of marsIds) {
    assert.ok(getMarsProximityNarration(id, 'en').length > 25);
    assert.ok(getMarsProximityNarration(id, 'hi').length > 20);
  }
  const moonIds = ['apollo_lm', 'lunar_rover', 'alsep', 'surveyor'] as const;
  for (const id of moonIds) {
    assert.ok(getMoonProximityNarration(id, 'en').length > 25);
    assert.ok(getMoonProximityNarration(id, 'hi').length > 20);
  }
});
