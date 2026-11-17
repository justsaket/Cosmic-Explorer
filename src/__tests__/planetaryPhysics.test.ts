import test from 'node:test';
import assert from 'node:assert/strict';
import { PlanetaryPhysicsController } from '../physics/planetaryPhysics';

test('PlanetaryPhysicsController - Gravity & Jump Tuning', () => {
  // 1. Earth: Snappy, brisk running
  const earthPhysics = new PlanetaryPhysicsController('earth', () => 0);
  assert.equal(earthPhysics.gravity, 12.0, 'Earth gravity should be comfortable & responsive');
  assert.equal(earthPhysics.jumpForce, 8.0, 'Earth jump force should allow responsive leaping');
  assert.equal(earthPhysics.isGrounded, true, 'Starts on the ground');

  earthPhysics.jump();
  assert.equal(earthPhysics.isGrounded, false, 'Should be airborne after jump');
  assert.equal(earthPhysics.velocity.y, 8.0, 'Initial upward vertical velocity');

  // Step simulation forward
  earthPhysics.update(0.05, { forward: false, backward: false, left: false, right: false, sprint: false, jump: false }, 'earth');
  assert.ok(earthPhysics.position.y > 0, 'Character should rise above ground level');
  assert.ok(earthPhysics.velocity.y < 8.0, 'Gravity should decelerate vertical velocity');

  // 2. Moon: Float, high effortless leap (1.62 feel)
  const moonPhysics = new PlanetaryPhysicsController('moon', () => 0);
  assert.equal(moonPhysics.gravity, 3.6, 'Moon gravity should be floaty and light');
  assert.equal(moonPhysics.jumpForce, 7.2, 'Moon jump force should give high airtime');

  moonPhysics.jump();
  moonPhysics.update(0.05, { forward: true, backward: false, left: false, right: false, sprint: false, jump: false }, 'moon');
  assert.ok(moonPhysics.position.y > 0.3, 'Moon jumps provide effortless high arcs');

  // 3. Mars: Balanced 3.72 feel
  const marsPhysics = new PlanetaryPhysicsController('mars', () => 0);
  assert.equal(marsPhysics.gravity, 6.4, 'Mars gravity should provide balanced stride');
  assert.equal(marsPhysics.jumpForce, 7.4, 'Mars jump force should provide smooth landing');
});

test('PlanetaryPhysicsController - Zero Sink Ground Collision', () => {
  // Test irregular terrain profile
  const terrainHeightFunc = (x: number, z: number) => Math.sin(x * 0.1) * 5 + Math.cos(z * 0.1) * 3;
  const physics = new PlanetaryPhysicsController('moon', terrainHeightFunc);

  physics.teleport(15, 25);
  const expectedGround = terrainHeightFunc(15, 25);
  assert.ok(Math.abs(physics.position.y - expectedGround) < 0.01, 'Character snaps directly onto terrain surface with zero sinking');

  // Fall from 20m above terrain
  physics.position.y = expectedGround + 20;
  physics.isGrounded = false;
  for (let i = 0; i < 80; i++) {
    physics.update(0.05, { forward: false, backward: false, left: false, right: false, sprint: false, jump: false }, 'moon');
  }
  assert.ok(physics.position.y >= expectedGround, 'Character must never sink beneath terrain elevation');
  assert.equal(physics.isGrounded, true, 'Character safely grounded');
});

test('PlanetaryPhysicsController - Camera Zoom Range', () => {
  const physics = new PlanetaryPhysicsController('earth', () => 0);
  assert.equal(physics.cameraDistance, 7.0, 'Default camera distance');

  // Zoom in
  physics.zoomCamera(-5);
  assert.ok(physics.cameraDistance >= 3.8, 'Camera distance clamped at min bound 3.8m');

  // Zoom out
  physics.zoomCamera(20);
  assert.ok(physics.cameraDistance <= 16.0, 'Camera distance clamped at max bound 16.0m');
});
