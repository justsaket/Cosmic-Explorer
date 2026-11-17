import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { 
  SphericalPlanetaryBody, 
  REAL_NASA_LANDMARKS 
} from '../scene/SphericalPlanetaryEngine';
import { SphericalPhysicsController } from '../physics/SphericalPhysicsController';

test('SphericalPlanetaryBody - Coordinate Conversions', () => {
  // Test North Pole
  const northPoleUnit = SphericalPlanetaryBody.latLonToUnitVector(90, 0);
  assert.ok(Math.abs(northPoleUnit.y - 1.0) < 0.001, 'North pole unit vector should point up along Y');

  // Test Equator at prime meridian
  const equatorUnit = SphericalPlanetaryBody.latLonToUnitVector(0, 0);
  assert.ok(Math.abs(equatorUnit.y) < 0.001, 'Equator should have Y close to 0');

  // Test Inverse conversion: Cartesian back to Lat/Lon
  const converted = SphericalPlanetaryBody.cartesianToLatLon(equatorUnit.multiplyScalar(48.0), 48.0);
  assert.ok(Math.abs(converted.lat - 0) < 0.05, `Lat should invert to ~0, got ${converted.lat}`);
  assert.ok(Math.abs(converted.lon - 0) < 0.05, `Lon should invert to ~0, got ${converted.lon}`);
});

test('SphericalPlanetaryBody - Elevation & Biome Evaluation', () => {
  const earth = new SphericalPlanetaryBody('earth', 48.0);
  const moon = new SphericalPlanetaryBody('moon', 48.0);
  const mars = new SphericalPlanetaryBody('mars', 48.0);

  // Earth crust sample
  const earthSample = earth.getCrustPoint(new THREE.Vector3(0, 48, 0));
  assert.ok(earthSample.surfacePos.length() > 40, 'Earth surface position should be valid radius');
  assert.ok(earthSample.normal.length() > 0.99, 'Earth normal should be unit length');
  assert.ok(['ocean', 'polar_ice', 'mountain', 'temperate'].includes(earthSample.biome), 'Earth biome should be recognized');

  // Moon crust sample
  const moonSample = moon.getCrustPoint(new THREE.Vector3(24, 0, 24));
  assert.ok(['maria', 'highlands'].includes(moonSample.biome), 'Moon biome should be maria or highlands');

  // Mars crust sample
  const marsSample = mars.getCrustPoint(new THREE.Vector3(0, -48, 0));
  assert.ok(['volcano', 'canyon', 'regolith', 'polar_dry_ice'].includes(marsSample.biome), 'Mars biome should be valid');
});

test('REAL_NASA_LANDMARKS - Integrity & NASA Site Data', () => {
  assert.ok(REAL_NASA_LANDMARKS.length >= 15, 'Should have at least 15 verified NASA landmarks across 3 planets');
  
  const earthKSC = REAL_NASA_LANDMARKS.find(l => l.id === 'earth_ksc');
  assert.ok(earthKSC, 'Kennedy Space Center must be defined');
  assert.ok(Math.abs(earthKSC.lat - 28.57) < 0.1, 'KSC Latitude should be ~28.57°');

  const apollo11 = REAL_NASA_LANDMARKS.find(l => l.id === 'lunar_tranquility');
  assert.ok(apollo11, 'Apollo 11 Tranquility Base must be defined');

  const jezero = REAL_NASA_LANDMARKS.find(l => l.id === 'mars_jezero');
  assert.ok(jezero, 'Jezero Crater must be defined');
});

test('SphericalPhysicsController - Traversal Modes & NASA Gravity Constants', () => {
  const mars = new SphericalPlanetaryBody('mars', 48.0);
  const physics = new SphericalPhysicsController(mars);

  assert.equal(physics.gravityMagnitude, 3.72, 'Mars gravity must equal NASA authentic 3.72 m/s²');
  assert.equal(physics.traversalMode, 'astronaut');

  // Switch to rover
  physics.setTraversalMode('rover');
  assert.equal(physics.traversalMode, 'rover');

  // Switch to flight
  physics.setTraversalMode('flight');
  assert.equal(physics.traversalMode, 'flight');

  // Teleport to Jezero Crater
  physics.teleportToCoords(18.38, 77.58);
  assert.ok(physics.position.length() >= 40.0 && physics.position.length() <= 60.0, 'Position should be on the planetary crust');
});
