import test from 'node:test';
import assert from 'node:assert/strict';
import { CELESTIAL_BODIES } from '../planets/planetConfig';
import {
  PLANET_CIRCUMNAVIGATION_RADIUS,
  resolveCircumnavigationWrap,
  getCompassCardinal,
  getPlanetaryBiomeName
} from '../physics/planetaryPhysics';
import { PlanetId } from '../types';
import { isHabitablePlanet } from '../shuttle/shuttleTravelState';

const ALL_SOLAR_BODIES: PlanetId[] = [
  'sun',
  'mercury',
  'venus',
  'earth',
  'moon',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune'
];

test('all 8 solar planets plus Sun and Moon are configured with kid-friendly facts', () => {
  for (const id of ALL_SOLAR_BODIES) {
    const cfg = CELESTIAL_BODIES[id];
    assert.ok(cfg, `Missing config for ${id}`);
    assert.ok(cfg.gravityMss > 0, `Gravity must be positive for ${id}`);
    assert.ok(cfg.radiusScene > 0, `Scene radius must be positive for ${id}`);
    assert.ok(cfg.quickFacts.length >= 3, `Quick facts missing for ${id}`);
    assert.ok(Boolean(cfg.kidComparison && cfg.kidComparison.length > 10), `Kid comparison missing for ${id}`);
    assert.ok(Boolean(cfg.probeHighlight && cfg.probeHighlight.length > 10), `Probe highlight missing for ${id}`);
  }
});

test('orbital radii keep Earth, Moon, Venus, and Mars completely separated with zero clipping', () => {
  const venusR = CELESTIAL_BODIES.venus.orbitRadius;
  const earthR = CELESTIAL_BODIES.earth.orbitRadius;
  const moonOrbitR = CELESTIAL_BODIES.moon.orbitRadius;
  const marsR = CELESTIAL_BODIES.mars.orbitRadius;

  assert.ok(
    earthR - moonOrbitR > venusR,
    `Moon inner orbit (${earthR - moonOrbitR}) must stay outside Venus (${venusR})`
  );
  assert.ok(
    earthR + moonOrbitR < marsR,
    `Moon outer orbit (${earthR + moonOrbitR}) must stay inside Mars (${marsR})`
  );
  assert.ok(
    moonOrbitR > CELESTIAL_BODIES.earth.radiusScene + CELESTIAL_BODIES.moon.radiusScene + 1.5,
    'Moon must maintain visible orbital separation from Earth sphere'
  );
  assert.ok(
    CELESTIAL_BODIES.jupiter.orbitRadius < CELESTIAL_BODIES.saturn.orbitRadius &&
      CELESTIAL_BODIES.saturn.orbitRadius < CELESTIAL_BODIES.uranus.orbitRadius &&
      CELESTIAL_BODIES.uranus.orbitRadius < CELESTIAL_BODIES.neptune.orbitRadius,
    'Outer planets must increase monotonically in orbital distance'
  );
});

test('habitable landing planets filter cleanly from gas giants and extreme worlds', () => {
  assert.equal(isHabitablePlanet('earth'), true);
  assert.equal(isHabitablePlanet('moon'), true);
  assert.equal(isHabitablePlanet('mars'), true);
  assert.equal(isHabitablePlanet('jupiter'), false);
  assert.equal(isHabitablePlanet('saturn'), false);
  assert.equal(isHabitablePlanet('uranus'), false);
  assert.equal(isHabitablePlanet('neptune'), false);
  assert.equal(isHabitablePlanet('mercury'), false);
  assert.equal(isHabitablePlanet('venus'), false);
  assert.equal(isHabitablePlanet('sun'), false);
});

test('open-world planetary roaming allows travel past 250m and wraps smoothly at circumnavigation horizon', () => {
  assert.ok(PLANET_CIRCUMNAVIGATION_RADIUS >= 400);
  const freeZone = resolveCircumnavigationWrap(260, 0);
  assert.equal(freeZone.wrapped, false);
  assert.equal(freeZone.x, 260);

  const overHorizon = resolveCircumnavigationWrap(PLANET_CIRCUMNAVIGATION_RADIUS + 20, 0);
  assert.equal(overHorizon.wrapped, true);
  assert.ok(overHorizon.x < 0, 'Wrapping around horizon should emerge on antipodal hemisphere');
  assert.ok(Math.hypot(overHorizon.x, overHorizon.z) < PLANET_CIRCUMNAVIGATION_RADIUS);
});

test('compass cardinal directions and dynamic biome names map accurately', () => {
  assert.deepEqual(getCompassCardinal(0), { label: 'N', degrees: 0 });
  assert.deepEqual(getCompassCardinal(Math.PI / 2), { label: 'E', degrees: 90 });
  assert.deepEqual(getCompassCardinal(Math.PI), { label: 'S', degrees: 180 });
  assert.deepEqual(getCompassCardinal(-Math.PI / 2), { label: 'W', degrees: 270 });

  assert.equal(getPlanetaryBiomeName('mars', 0, 0), 'Pathfinder Ares Vallis Apron');
  assert.equal(getPlanetaryBiomeName('mars', 0, -180), 'Olympus Mons Outer Foothills');
  assert.equal(getPlanetaryBiomeName('moon', 0, 0), 'Artemis South Pole Base');
  assert.equal(getPlanetaryBiomeName('earth', 200, 0), 'Atlantic Open Coastline');
});
