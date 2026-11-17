import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ACTIVE_SURFACE_DISCOVERIES } from '../education/contentLibrary';
import { INITIAL_MISSIONS } from '../missions/missionData';

const readSrc = (relPath: string) =>
  fs.readFileSync(path.join(process.cwd(), 'src', relPath), 'utf8');

test('All Legacy Educational Resources Removed from Active Earth, Moon, and Mars Worlds', () => {
  assert.equal(ACTIVE_SURFACE_DISCOVERIES.length, 0);

  // Missions must no longer depend on removed surface discovery IDs
  for (const mission of INITIAL_MISSIONS) {
    for (const obj of mission.objectives) {
      assert.notEqual(
        obj.type,
        'inspect_discovery',
        `Removed discovery objective leaked in mission ${mission.id}`
      );
    }
  }

  const moonSrc = readSrc('scene/MoonWorld.ts');
  const marsSrc = readSrc('scene/MarsWorld.ts');
  const earthSrc = readSrc('scene/EarthWorld.ts');

  // Legacy resource beacons / habitats must stay removed
  assert.ok(!moonSrc.includes('buildDiscoveries'));
  assert.ok(!moonSrc.includes('buildArtemisLunarBaseCamp'));
  assert.ok(!moonSrc.includes('addDiscoveryBeacon'));

  assert.ok(!marsSrc.includes('buildDiscoveries'));
  assert.ok(!marsSrc.includes('buildMarsHabitatAndRidgeRover'));
  assert.ok(!marsSrc.includes('addDiscoveryBeacon'));

  assert.ok(!earthSrc.includes('buildDiscoveries'));
  assert.ok(!earthSrc.includes('earth_pad39b'));

  // Essential structures and terrain collision caches must still remain intact
  assert.ok(moonSrc.includes('buildShuttlePadMarker'));
  assert.ok(moonSrc.includes('mountainObstaclesCache'));
  assert.ok(marsSrc.includes('buildShuttlePadMarker'));
  assert.ok(marsSrc.includes('mountainObstaclesCache'));
  assert.ok(earthSrc.includes('buildFacilities'));
  assert.ok(earthSrc.includes('buildShuttlePad'));
});

test('Cockpit Body Occlusion & Post-Disembark Upright Posture Safeguards Exist in WorldCanvas', () => {
  const worldCanvasSrc = readSrc('scene/WorldCanvas.tsx');
  assert.ok(worldCanvasSrc.includes('setFirstPersonBodyHidden(primaryView === \'cockpit\')'));
  assert.ok(worldCanvasSrc.includes('snapToPosture(\'stand\')'));
  assert.ok(worldCanvasSrc.includes('onSetDrivingRover?.(false)'));
  assert.ok(worldCanvasSrc.includes('updateShuttleFlightAudio'));
});
