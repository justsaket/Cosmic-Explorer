import * as THREE from 'three';
import { PlanetId } from '../types';
import { CELESTIAL_BODIES } from '../planets/planetConfig';
import { soundManager } from '../audio/soundManager';

export interface CylinderObstacle {
  x: number;
  z: number;
  radius: number;
  height?: number;
  baseY?: number;
}

export interface MountainConeObstacle {
  x: number;
  z: number;
  baseRadius: number;
  height: number;
  baseY: number;
}

export interface MoveInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  sprint?: boolean;
  virtualVector?: { x: number; y: number }; // -1 to 1 joystick input
}

export const MAX_WALKABLE_SLOPE_DEG = 38;
export const MAX_WALKABLE_SLOPE_TAN = Math.tan(THREE.MathUtils.degToRad(MAX_WALKABLE_SLOPE_DEG));
export const PLANET_CIRCUMNAVIGATION_RADIUS = 460;
export const MAX_PLAYABLE_RADIUS = PLANET_CIRCUMNAVIGATION_RADIUS;

/**
 * Wraps coordinates smoothly to the antipodal horizon when crossing planetary circumnavigation radius,
 * allowing limitless whole-planet roaming without invisible barriers.
 */
export function resolveCircumnavigationWrap(
  x: number,
  z: number,
  radius: number = PLANET_CIRCUMNAVIGATION_RADIUS
): { x: number; z: number; wrapped: boolean } {
  const dist = Math.hypot(x, z);
  if (dist <= radius) {
    return { x, z, wrapped: false };
  }
  const nx = x / dist;
  const nz = z / dist;
  const reEntry = radius - 18;
  return {
    x: -nx * reEntry,
    z: -nz * reEntry,
    wrapped: true
  };
}

export function getCompassCardinal(azimuthRad: number): { label: string; degrees: number } {
  const rawDeg = ((azimuthRad * 180) / Math.PI) % 360;
  const deg = Math.round(rawDeg < 0 ? rawDeg + 360 : rawDeg) % 360;
  const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const idx = Math.round(deg / 45) % 8;
  return { label: cardinals[idx], degrees: deg };
}

export function getPlanetaryBiomeName(planet: PlanetId, x: number, z: number): string {
  const dist = Math.hypot(x, z);
  if (planet === 'earth') {
    if (dist < 48) return 'Kennedy Pad 39A Complex';
    if (dist > 155) return 'Atlantic Open Coastline';
    return x >= 0 ? 'Cape Canaveral Eastern Dunes' : 'Merritt Island Space Scrubland';
  }
  if (planet === 'moon') {
    if (dist < 28) return 'Artemis South Pole Base';
    if (dist < 95) {
      if (x > 25 && z > 0) return 'Surveyor 3 & ALSEP Crater Plain';
      if (x > 20 && z <= 0) return 'Hadley-Apennine Rover Rille';
      if (x <= -10 && z >= 0) return 'Sea of Tranquility Basin';
      return 'Tycho Ray Highlands';
    }
    return z < 0 ? 'Mare Imbrium Northern Plains' : 'Shackleton Rim Deep Highlands';
  }
  if (planet === 'mars') {
    if (dist < 26) return 'Pathfinder Ares Vallis Apron';
    if (dist < 95) {
      if (x < -15 && z > 15) return 'Viking Chryse Plains';
      if (x > 20 && z < -10) return 'Jezero River Delta Terrace';
      if (x > 20 && z >= -10) return 'Gale Crater Aerodrome';
      return 'Elysium Elysian Dust Flats';
    }
    if (z < -120) return 'Olympus Mons Outer Foothills';
    if (z > 120) return 'Valles Marineris Canyon Rim';
    return x < 0 ? 'Vastitas Borealis Ice Plain' : 'Tharsis Volcanic Frontier';
  }
  return 'Deep Space Frontier';
}

export class PlanetaryPhysicsController {
  public position: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public rotationY: number = 0;
  public isGrounded: boolean = true;
  public isMoving: boolean = false;
  public isSprinting: boolean = false;
  public isJetpacking: boolean = false;

  // Stats accumulator
  public totalDistanceMeters: number = 0;
  public totalJumps: number = 0;

  // Physical constants tuned for responsive, delightful, smooth game feel
  public gravity: number = 3.6; // Default Moon
  public baseSpeed: number = 6.0; // m/s
  public sprintSpeed: number = 9.8; // m/s
  public jumpForce: number = 7.2;
  private accel: number = 32.0;
  private drag: number = 14.0;

  // Camera POV Mode (Third-Person Follow vs First-Person Astronaut Visor POV)
  public cameraMode: 'third-person' | 'first-person' = 'third-person';

  // Professional Third-Person & First-Person Camera Configuration
  public cameraAzimuth: number = 0; // Horizontal orbit angle (radians)
  public cameraPitch: number = 0.24; // Vertical tilt ~14 degrees
  public cameraDistance: number = 7.0; // Distance behind astronaut (full-body framing)
  public minDistance: number = 3.8;
  public maxDistance: number = 16.0;

  // Landing compression for animation
  public landingImpact: number = 0;

  // Solid Obstacles & Mountain Cones for Physical Collision Resolution
  public obstacles: CylinderObstacle[] = [];
  public mountainObstacles: MountainConeObstacle[] = [];

  // Terrain height function hook
  private getTerrainHeight: (x: number, z: number) => number;

  // Pre-allocated scratch vectors to avoid per-frame allocations in 60Hz loop
  private _moveDir = new THREE.Vector3();
  private _prevPos = new THREE.Vector3();
  private _eyePos = new THREE.Vector3();
  private _lookTarget = new THREE.Vector3();
  private _targetLookAt = new THREE.Vector3();
  private _desiredCamPos = new THREE.Vector3();

  constructor(
    initialPlanet: PlanetId,
    terrainHeightFn?: (x: number, z: number) => number
  ) {
    this.getTerrainHeight = terrainHeightFn || (() => 0);
    this.setPlanet(initialPlanet);
  }

  public toggleCameraMode(): 'third-person' | 'first-person' {
    this.cameraMode = this.cameraMode === 'third-person' ? 'first-person' : 'third-person';
    return this.cameraMode;
  }

  public setObstacles(list: CylinderObstacle[]) {
    this.obstacles = list;
  }

  public setMountainObstacles(list: MountainConeObstacle[]) {
    this.mountainObstacles = list;
  }

  /**
   * Computes highest walkable surface elevation considering both procedural terrain
   * and any mountain cone geometry so nothing sinks inside mountain meshes.
   */
  public getEffectiveSurfaceHeight(x: number, z: number): number {
    let h = this.getTerrainHeight(x, z);
    for (let i = 0; i < this.mountainObstacles.length; i++) {
      const m = this.mountainObstacles[i];
      const dist = Math.hypot(x - m.x, z - m.z);
      if (dist < m.baseRadius) {
        const coneY = m.baseY + m.height * (1.0 - dist / m.baseRadius);
        if (coneY > h) {
          h = coneY;
        }
      }
    }
    return h;
  }

  public setPlanet(planetId: PlanetId) {
    if (planetId === 'moon') {
      // Light, floaty, effortless high jumps (~1.62 m/s² feel with smooth airtime)
      this.gravity = 3.6;
      this.jumpForce = 7.2;
      this.baseSpeed = 5.8;
      this.sprintSpeed = 9.4;
    } else if (planetId === 'mars') {
      // Balanced low-gravity jumps (~3.72 m/s² feel with responsive stride)
      this.gravity = 6.4;
      this.jumpForce = 7.4;
      this.baseSpeed = 6.2;
      this.sprintSpeed = 10.0;
    } else {
      // Earth Home Base: Comfortable, grounded, snappy, responsive
      this.gravity = 12.0;
      this.jumpForce = 8.0;
      this.baseSpeed = 6.5;
      this.sprintSpeed = 10.5;
    }
    this.velocity.set(0, 0, 0);
  }

  public setTerrainHeightFn(fn: (x: number, z: number) => number) {
    this.getTerrainHeight = fn;
  }

  public teleport(x: number, z: number) {
    this.position.x = x;
    this.position.z = z;
    this.position.y = this.getEffectiveSurfaceHeight(x, z);
    this.velocity.set(0, 0, 0);
    this.isGrounded = true;
  }

  public zoomCamera(delta: number) {
    this.cameraDistance = Math.max(this.minDistance, Math.min(this.maxDistance, this.cameraDistance + delta));
  }

  public jump() {
    if (this.isGrounded) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
      this.totalJumps++;
      soundManager.playJump();
    }
  }

  public isDrivingRover: boolean = false;

  private resolveHorizontalCollisions(prevX: number, prevZ: number, playerRadius: number) {
    // 1. Cylinder Obstacles (rocks, habitats, shuttle, landers, rovers, towers)
    for (let i = 0; i < this.obstacles.length; i++) {
      const obs = this.obstacles[i];
      // Skip obstacle only if player has jetpacked clearly above its roof
      if (obs.height !== undefined) {
        const obsBaseY = obs.baseY ?? this.getTerrainHeight(obs.x, obs.z);
        if (this.position.y >= obsBaseY + obs.height - 0.15) {
          continue;
        }
      }
      const dx = this.position.x - obs.x;
      const dz = this.position.z - obs.z;
      const dist = Math.hypot(dx, dz);
      const minDist = obs.radius + playerRadius;
      if (dist < minDist) {
        let nx = 0;
        let nz = 1;
        if (dist > 0.0001) {
          nx = dx / dist;
          nz = dz / dist;
        } else {
          const pdx = prevX - obs.x;
          const pdz = prevZ - obs.z;
          const pDist = Math.hypot(pdx, pdz);
          if (pDist > 0.0001) {
            nx = pdx / pDist;
            nz = pdz / pDist;
          }
        }
        const push = minDist - dist;
        this.position.x += nx * push;
        this.position.z += nz * push;
        const dot = this.velocity.x * nx + this.velocity.z * nz;
        if (dot < 0) {
          this.velocity.x -= dot * nx;
          this.velocity.z -= dot * nz;
        }
      }
    }

    // 2. Mountain Cone Obstacles (Moon horizon massifs, Mars Mount Sharp / Jezero rim cones)
    for (let i = 0; i < this.mountainObstacles.length; i++) {
      const m = this.mountainObstacles[i];
      const dx = this.position.x - m.x;
      const dz = this.position.z - m.z;
      const dist = Math.hypot(dx, dz);

      if (dist >= m.baseRadius + playerRadius) continue;

      // Height of the cone mesh at the player's current radial position
      const peakY = m.baseY + m.height;
      if (this.position.y >= peakY + 0.1) continue;

      // Radius of the mountain cross-section at the astronaut's waist/foot height
      const heightRatio = Math.max(0, Math.min(1, (this.position.y + 0.25 - m.baseY) / Math.max(0.1, m.height)));
      const effectiveRadiusAtY = m.baseRadius * (1.0 - heightRatio * 0.85);
      const coneSlope = m.height / Math.max(0.1, m.baseRadius);
      const isSteepMountain = coneSlope > MAX_WALKABLE_SLOPE_TAN * 0.75 || m.height >= 8.0;
      const blockRadius = (isSteepMountain ? effectiveRadiusAtY : effectiveRadiusAtY * 0.65) + playerRadius;

      if (dist < blockRadius) {
        let nx = 0;
        let nz = 1;
        if (dist > 0.0001) {
          nx = dx / dist;
          nz = dz / dist;
        } else {
          const pdx = prevX - m.x;
          const pdz = prevZ - m.z;
          const pDist = Math.hypot(pdx, pdz);
          if (pDist > 0.0001) {
            nx = pdx / pDist;
            nz = pdz / pDist;
          }
        }
        const push = blockRadius - dist;
        this.position.x += nx * push;
        this.position.z += nz * push;
        const dot = this.velocity.x * nx + this.velocity.z * nz;
        if (dot < 0) {
          this.velocity.x -= dot * nx;
          this.velocity.z -= dot * nz;
        }
      }
    }

    // 3. Walkable Slope Limit (prevents walking straight through steep cliff walls/ridges)
    const stepDx = this.position.x - prevX;
    const stepDz = this.position.z - prevZ;
    const stepDist = Math.hypot(stepDx, stepDz);
    if (this.isGrounded && stepDist > 0.001) {
      const prevH = this.getEffectiveSurfaceHeight(prevX, prevZ);
      const nextH = this.getEffectiveSurfaceHeight(this.position.x, this.position.z);
      const rise = nextH - prevH;

      if (rise / stepDist > MAX_WALKABLE_SLOPE_TAN) {
        // Compute uphill gradient normal and slide tangentially along contour
        const eps = 0.6;
        const gx = (this.getEffectiveSurfaceHeight(this.position.x + eps, this.position.z) -
          this.getEffectiveSurfaceHeight(this.position.x - eps, this.position.z)) / (2 * eps);
        const gz = (this.getEffectiveSurfaceHeight(this.position.x, this.position.z + eps) -
          this.getEffectiveSurfaceHeight(this.position.x, this.position.z - eps)) / (2 * eps);
        const gLen = Math.hypot(gx, gz);
        if (gLen > 0.001) {
          const nx = gx / gLen; // uphill direction
          const nz = gz / gLen;
          const moveDot = stepDx * nx + stepDz * nz;
          if (moveDot > 0) {
            this.position.x -= nx * moveDot;
            this.position.z -= nz * moveDot;
            // Re-verify post-slide slope; if still too steep, restore prev horizontal position
            const slidDist = Math.hypot(this.position.x - prevX, this.position.z - prevZ);
            if (slidDist > 0.001) {
              const slidH = this.getEffectiveSurfaceHeight(this.position.x, this.position.z);
              if ((slidH - prevH) / slidDist > MAX_WALKABLE_SLOPE_TAN * 1.15) {
                this.position.x = prevX;
                this.position.z = prevZ;
              }
            }
          }
          const vDot = this.velocity.x * nx + this.velocity.z * nz;
          if (vDot > 0) {
            this.velocity.x -= vDot * nx;
            this.velocity.z -= vDot * nz;
          }
        } else {
          this.position.x = prevX;
          this.position.z = prevZ;
        }
      }
    }

    // 4. Seamless Spherical Planetary Circumnavigation (Zero invisible wall limits!)
    const wrap = resolveCircumnavigationWrap(this.position.x, this.position.z);
    if (wrap.wrapped) {
      this.position.x = wrap.x;
      this.position.z = wrap.z;
    }
  }

  public update(
    delta: number,
    input: MoveInput,
    currentPlanet: 'earth' | 'moon' | 'mars'
  ) {
    const clampedDt = Math.min(delta, 0.05);

    // Decay landing shock compression
    if (this.landingImpact > 0) {
      this.landingImpact = Math.max(0, this.landingImpact - clampedDt * 4.0);
    }

    this.isSprinting = Boolean(input.sprint);

    // 1. Calculate desired move direction in horizontal plane relative to camera view
    this._moveDir.set(0, 0, 0);

    let rightInput = 0;
    let forwardInput = 0;

    // Physical Gamepad Polling if available
    if (typeof navigator !== 'undefined' && 'getGamepads' in navigator) {
      const gamepads = navigator.getGamepads();
      for (let i = 0; i < gamepads.length; i++) {
        const gp = gamepads[i];
        if (gp && gp.connected) {
          const deadzone = 0.15;
          const axisX = Math.abs(gp.axes[0] || 0) > deadzone ? gp.axes[0] : 0;
          const axisY = Math.abs(gp.axes[1] || 0) > deadzone ? gp.axes[1] : 0;
          if (axisX !== 0 || axisY !== 0) {
            rightInput = axisX;
            forwardInput = -axisY;
          }
          if (gp.axes[2] !== undefined && gp.axes[3] !== undefined) {
            const camX = Math.abs(gp.axes[2]) > deadzone ? gp.axes[2] : 0;
            const camY = Math.abs(gp.axes[3]) > deadzone ? gp.axes[3] : 0;
            this.cameraAzimuth -= camX * clampedDt * 2.4;
            this.cameraPitch = Math.max(0.06, Math.min(1.15, this.cameraPitch - camY * clampedDt * 1.8));
          }
          if (gp.buttons[0] && gp.buttons[0].pressed) {
            input.jump = true;
          }
          if ((gp.buttons[10] && gp.buttons[10].pressed) || (gp.buttons[1] && gp.buttons[1].pressed)) {
            this.isSprinting = true;
          }
          break;
        }
      }
    }

    // Virtual Joystick or Keyboard Input
    if (rightInput === 0 && forwardInput === 0) {
      if (input.virtualVector && (Math.abs(input.virtualVector.x) > 0.04 || Math.abs(input.virtualVector.y) > 0.04)) {
        rightInput = input.virtualVector.x;
        forwardInput = -input.virtualVector.y; // Dragging up on screen (y < 0) = +forward
      } else {
        if (input.forward) forwardInput += 1;
        if (input.backward) forwardInput -= 1;
        if (input.right) rightInput += 1;
        if (input.left) rightInput -= 1;
      }
    }

    const inputLen = Math.hypot(rightInput, forwardInput);
    if (inputLen > 0.04) {
      const normFactor = inputLen > 1 ? 1 / inputLen : 1;
      rightInput *= normFactor;
      forwardInput *= normFactor;

      // Camera orientation tangent vectors
      const sinA = Math.sin(this.cameraAzimuth);
      const cosA = Math.cos(this.cameraAzimuth);

      this._moveDir.x = forwardInput * sinA - rightInput * cosA;
      this._moveDir.z = forwardInput * cosA + rightInput * sinA;

      this.isMoving = true;
      const targetRot = Math.atan2(this._moveDir.x, this._moveDir.z);

      // Smooth rotational damping toward movement vector
      let rotDiff = targetRot - this.rotationY;
      while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
      while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
      this.rotationY += rotDiff * Math.min(1.0, clampedDt * (this.isDrivingRover ? 9.0 : 16.0));
    } else {
      this.isMoving = false;
    }

    // 2. Horizontal Velocity Integration
    const roverBoost = this.isDrivingRover ? (this.isSprinting ? 2.85 : 2.2) : 1.0;
    const targetMaxSpeed = (this.isSprinting ? this.sprintSpeed : this.baseSpeed) * roverBoost * Math.min(1, Math.max(0.35, inputLen));

    if (this.isMoving) {
      const targetVx = this._moveDir.x * targetMaxSpeed;
      const targetVz = this._moveDir.z * targetMaxSpeed;
      const accelRate = this.isGrounded ? this.accel : this.accel * 0.65;
      this.velocity.x = THREE.MathUtils.lerp(this.velocity.x, targetVx, 1.0 - Math.exp(-accelRate * clampedDt));
      this.velocity.z = THREE.MathUtils.lerp(this.velocity.z, targetVz, 1.0 - Math.exp(-accelRate * clampedDt));
    } else {
      const dragRate = this.isGrounded ? this.drag : this.drag * 0.2;
      this.velocity.x = THREE.MathUtils.lerp(this.velocity.x, 0, 1.0 - Math.exp(-dragRate * clampedDt));
      this.velocity.z = THREE.MathUtils.lerp(this.velocity.z, 0, 1.0 - Math.exp(-dragRate * clampedDt));
    }

    // 3. Jump & Jetpack Air Assist Physics
    if (this.isGrounded && input.jump) {
      this.velocity.y = this.jumpForce;
      this.isGrounded = false;
      this.totalJumps++;
      soundManager.playJump();
    } else if (!this.isGrounded && input.jump && this.velocity.y < 4.0) {
      // Spacebar Jetpack Boost while airborne: Effortless floaty propulsion!
      this.isJetpacking = true;
      this.velocity.y += (this.gravity * 0.85 + 2.4) * clampedDt;
    } else {
      this.isJetpacking = false;
    }

    // Apply authentic planetary gravity
    this.velocity.y -= this.gravity * clampedDt;

    // 4. Sub-stepped swept motion & obstacle collision (prevents tunneling at rover sprint speeds)
    this._prevPos.copy(this.position);
    const totalDx = this.velocity.x * clampedDt;
    const totalDz = this.velocity.z * clampedDt;
    const totalHoriz = Math.hypot(totalDx, totalDz);
    const subSteps = Math.max(1, Math.min(4, Math.ceil(totalHoriz / 0.45)));
    const playerRadius = this.isDrivingRover ? 1.4 : 0.65;

    for (let s = 0; s < subSteps; s++) {
      const stepPrevX = this.position.x;
      const stepPrevZ = this.position.z;
      this.position.x += totalDx / subSteps;
      this.position.z += totalDz / subSteps;
      this.resolveHorizontalCollisions(stepPrevX, stepPrevZ, playerRadius);
    }

    this.position.y += this.velocity.y * clampedDt;

    // 5. Multi-sample Terrain + Mountain Ground Collision & Snapping (Never sinks, never traps!)
    const groundHeight = this.getEffectiveSurfaceHeight(this.position.x, this.position.z);
    if (this.position.y <= groundHeight) {
      this.position.y = groundHeight;
      if (!this.isGrounded && this.velocity.y < -1.6) {
        soundManager.playLand();
        this.landingImpact = Math.min(1.0, Math.abs(this.velocity.y) / 6.0);
      }
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }

    // Accumulate total distance traveled
    const frameDist = this._prevPos.distanceTo(this.position);
    this.totalDistanceMeters += frameDist;

    // Footstep audio
    const stepFrequency = this.isSprinting ? 4.8 : 3.0;
    if (this.isGrounded && this.isMoving && Math.random() < clampedDt * stepFrequency) {
      soundManager.playFootstep(currentPlanet === 'earth' ? 'earth' : currentPlanet);
    }
  }

  // Smooth Third-Person or First-Person Visor Camera
  public updateCamera(
    camera: THREE.PerspectiveCamera,
    delta: number,
    immediate: boolean = false
  ) {
    const clampedDt = Math.min(delta, 0.05);

    if (this.cameraMode === 'first-person') {
      this.cameraPitch = Math.max(-1.1, Math.min(1.1, this.cameraPitch));
      const eyeHeight = this.isDrivingRover ? 1.05 : 1.58;
      this._eyePos.set(this.position.x, this.position.y + eyeHeight, this.position.z);
      camera.position.copy(this._eyePos);

      const lookDist = 20.0;
      this._lookTarget.set(
        this.position.x + Math.sin(this.cameraAzimuth) * Math.cos(this.cameraPitch) * lookDist,
        this.position.y + eyeHeight + Math.sin(this.cameraPitch) * lookDist,
        this.position.z + Math.cos(this.cameraAzimuth) * Math.cos(this.cameraPitch) * lookDist
      );
      camera.up.set(0, 1, 0);
      camera.lookAt(this._lookTarget);
    } else {
      this.cameraPitch = Math.max(0.06, Math.min(1.15, this.cameraPitch));
      const targetDistance = this.isDrivingRover ? this.cameraDistance + 2.5 : this.cameraDistance;

      this._targetLookAt.set(
        this.position.x,
        this.position.y + (this.isDrivingRover ? 0.9 : 1.1),
        this.position.z
      );

      const hDist = targetDistance * Math.cos(this.cameraPitch);
      const vDist = targetDistance * Math.sin(this.cameraPitch);

      this._desiredCamPos.set(
        this.position.x - Math.sin(this.cameraAzimuth) * hDist,
        this.position.y + vDist + (this.isDrivingRover ? 0.6 : 0.4),
        this.position.z - Math.cos(this.cameraAzimuth) * hDist
      );

      // Prevent camera sinking below terrain or mountain cones
      const camGround = this.getEffectiveSurfaceHeight(this._desiredCamPos.x, this._desiredCamPos.z) + 0.6;
      if (this._desiredCamPos.y < camGround) {
        this._desiredCamPos.y = camGround;
      }

      if (immediate) {
        camera.position.copy(this._desiredCamPos);
      } else {
        const lerpRate = 1.0 - Math.exp(-14.0 * clampedDt);
        camera.position.lerp(this._desiredCamPos, lerpRate);
      }
      camera.up.set(0, 1, 0);
      camera.lookAt(this._targetLookAt);
    }
  }
}
