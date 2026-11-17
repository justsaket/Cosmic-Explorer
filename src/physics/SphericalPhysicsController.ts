import * as THREE from 'three';
import { PlanetId } from '../types';
import { SphericalPlanetaryBody, GlobeElevationResult } from '../scene/SphericalPlanetaryEngine';

export interface SphericalMoveInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  sprint?: boolean;
  virtualVector?: { x: number; y: number }; // -1 to 1 joystick input
}

export type TraversalMode = 'astronaut' | 'rover' | 'flight';

export class SphericalPhysicsController {
  public position: THREE.Vector3 = new THREE.Vector3(0, 52, 0);
  public velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  public rotationQuaternion: THREE.Quaternion = new THREE.Quaternion();
  public upVector: THREE.Vector3 = new THREE.Vector3(0, 1, 0);

  public isGrounded: boolean = true;
  public isMoving: boolean = false;
  public isSprinting: boolean = false;
  public traversalMode: TraversalMode = 'astronaut';

  // Stats accumulator
  public totalDistanceMeters: number = 0;
  public totalJumps: number = 0;
  public landingImpact: number = 0;

  // Camera Orbit around player
  public cameraAzimuth: number = 0; // Relative to player local heading
  public cameraPitch: number = 0.22;
  public cameraDistance: number = 6.8;

  // Real NASA physical constants per celestial body
  public gravityMagnitude: number = 9.81;
  public atmosphericDensity: number = 1.0; // Earth = 1.0, Mars = 0.01, Moon = 0.0

  private body: SphericalPlanetaryBody;
  private playerLocalHeading: number = 0;

  constructor(body: SphericalPlanetaryBody) {
    this.body = body;
    this.setPlanet(body.planetId);
  }

  public setPlanet(planetId: 'earth' | 'moon' | 'mars') {
    if (planetId === 'earth') {
      this.gravityMagnitude = 9.81;
      this.atmosphericDensity = 1.0;
    } else if (planetId === 'moon') {
      this.gravityMagnitude = 1.62;
      this.atmosphericDensity = 0.0;
    } else {
      this.gravityMagnitude = 3.72;
      this.atmosphericDensity = 0.01;
    }
  }

  public setBody(body: SphericalPlanetaryBody) {
    this.body = body;
    this.setPlanet(body.planetId);
  }

  public setTraversalMode(mode: TraversalMode) {
    this.traversalMode = mode;
    if (mode === 'flight') {
      this.isGrounded = false;
    }
  }

  public teleportToCoords(lat: number, lon: number, altitudeOffset = 0.2) {
    const unit = SphericalPlanetaryBody.latLonToUnitVector(lat, lon);
    const crust = this.body.getCrustPoint(unit.clone().multiplyScalar(this.body.radius));
    this.position.copy(crust.surfacePos).addScaledVector(crust.normal, altitudeOffset);
    this.upVector.copy(crust.normal);
    this.velocity.set(0, 0, 0);
    this.isGrounded = true;
  }

  public update(delta: number, input: SphericalMoveInput) {
    const clampedDt = Math.min(delta, 0.05);

    // 1. Calculate local spherical gravity toward planet center (0, 0, 0)
    const distToCenter = this.position.length();
    this.upVector.copy(this.position).normalize();
    const gravityDir = this.upVector.clone().negate();

    // Query crust elevation & normal at current position
    const crust = this.body.getCrustPoint(this.position);
    const currentAltitudeAboveCrust = distToCenter - (this.body.radius + crust.elevation);

    // 2. Traversal Mode Physics Tuning
    let maxSpeed = 5.4; // EVA Walk default
    let accel = 28.0;
    let drag = 12.0;

    if (this.traversalMode === 'rover') {
      maxSpeed = input.sprint ? 24.0 : 15.0; // 6-wheel NASA Rover high-speed cruise
      accel = 35.0;
      drag = 6.0;
    } else if (this.traversalMode === 'flight') {
      maxSpeed = input.sprint ? 95.0 : 45.0; // Supersonic atmospheric/orbital cruiser
      accel = 70.0;
      drag = 3.0;
    } else {
      // Astronaut EVA
      if (input.sprint) maxSpeed = 8.8;
      if (this.body.planetId === 'moon') {
        maxSpeed *= 1.15; // Low-gravity lunar bunny-hop stride
      }
    }

    // 3. Movement input resolution relative to local camera orientation
    let fwdInput = 0;
    let sideInput = 0;

    if (input.forward) fwdInput += 1;
    if (input.backward) fwdInput -= 1;
    if (input.right) sideInput += 1;
    if (input.left) sideInput -= 1;

    if (input.virtualVector) {
      if (Math.abs(input.virtualVector.x) > 0.05) sideInput = input.virtualVector.x;
      if (Math.abs(input.virtualVector.y) > 0.05) fwdInput = -input.virtualVector.y;
    }

    // Camera reference basis tangent to sphere
    const northApprox = new THREE.Vector3(0, 1, 0);
    let eastTangent = new THREE.Vector3().crossVectors(northApprox, this.upVector).normalize();
    if (eastTangent.lengthSq() < 0.01) {
      eastTangent.set(1, 0, 0);
    }
    const northTangent = new THREE.Vector3().crossVectors(this.upVector, eastTangent).normalize();

    // Rotate local tangent plane by cameraAzimuth
    const camHeading = this.cameraAzimuth;
    const fwdVec = northTangent.clone().multiplyScalar(Math.cos(camHeading)).addScaledVector(eastTangent, Math.sin(camHeading)).normalize();
    const rightVec = new THREE.Vector3().crossVectors(this.upVector, fwdVec).normalize();

    const desiredMove = new THREE.Vector3()
      .addScaledVector(fwdVec, fwdInput)
      .addScaledVector(rightVec, sideInput);

    const inputLen = desiredMove.length();
    this.isMoving = inputLen > 0.1;

    if (this.isMoving) {
      desiredMove.normalize();
      this.playerLocalHeading = Math.atan2(sideInput, fwdInput);
    }

    // 4. Flight Mode vs Ground Surface Physics
    if (this.traversalMode === 'flight') {
      // 3D Orbital Cruiser Physics
      const thrust = desiredMove.clone().multiplyScalar(accel * (inputLen > 1 ? 1 : inputLen));
      
      // Altitude control in flight: Jump ascends, crouch/backward can pitch
      if (input.jump) {
        thrust.addScaledVector(this.upVector, accel * 0.85);
      }

      this.velocity.addScaledVector(thrust, clampedDt);
      this.velocity.multiplyScalar(Math.max(0, 1.0 - drag * clampedDt));
      this.position.addScaledVector(this.velocity, clampedDt);

      // Floor collision clamp
      const minFlightAlt = 1.5;
      if (currentAltitudeAboveCrust < minFlightAlt) {
        this.position.copy(crust.surfacePos).addScaledVector(crust.normal, minFlightAlt);
        const normalVel = this.velocity.dot(crust.normal);
        if (normalVel < 0) {
          this.velocity.addScaledVector(crust.normal, -normalVel);
        }
      }
    } else {
      // Surface Locomotion (Astronaut or Rover)
      // Tangential velocity component
      const tangentialVel = this.velocity.clone().addScaledVector(this.upVector, -this.velocity.dot(this.upVector));
      
      if (this.isMoving) {
        const targetVel = desiredMove.clone().multiplyScalar(maxSpeed * Math.min(1.0, inputLen));
        tangentialVel.lerp(targetVel, accel * clampedDt * (this.isGrounded ? 1.0 : 0.3));
      } else {
        tangentialVel.multiplyScalar(Math.max(0, 1.0 - drag * clampedDt));
      }

      // Vertical velocity along local planet normal
      let verticalSpeed = this.velocity.dot(this.upVector);

      if (this.isGrounded) {
        if (input.jump) {
          // Jump impulse scaled by authentic planetary gravity
          const jumpPower = this.body.planetId === 'moon' ? 7.2 : this.body.planetId === 'mars' ? 6.5 : 5.8;
          verticalSpeed = jumpPower;
          this.isGrounded = false;
          this.totalJumps++;
        } else {
          verticalSpeed = 0;
        }
      } else {
        // Fall under authentic spherical gravity
        verticalSpeed -= this.gravityMagnitude * clampedDt;
      }

      // Reassemble velocity vector
      this.velocity.copy(tangentialVel).addScaledVector(this.upVector, verticalSpeed);

      // Advance position
      this.position.addScaledVector(this.velocity, clampedDt);

      // Check ground collision against spherical planetary crust
      const newDist = this.position.length();
      const crustRadius = this.body.radius + crust.elevation;

      if (newDist <= crustRadius + 0.05) {
        // Touchdown / Grounded
        this.position.copy(this.upVector).multiplyScalar(crustRadius + 0.05);
        if (!this.isGrounded && verticalSpeed < -2.0) {
          this.landingImpact = Math.min(1.0, Math.abs(verticalSpeed) / 10.0);
        }
        this.isGrounded = true;
        this.velocity.addScaledVector(this.upVector, -verticalSpeed);
      } else {
        this.isGrounded = false;
      }

      // Accumulate travel distance
      const frameDist = tangentialVel.length() * clampedDt;
      this.totalDistanceMeters += frameDist;
    }

    // Align player orientation quaternion to local surface normal + movement heading
    const targetQuat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), this.upVector);
    const headingQuat = new THREE.Quaternion().setFromAxisAngle(this.upVector, camHeading + this.playerLocalHeading);
    this.rotationQuaternion.copy(headingQuat.multiply(targetQuat));

    // Decay landing shock
    if (this.landingImpact > 0) {
      this.landingImpact = Math.max(0, this.landingImpact - clampedDt * 4.0);
    }
  }

  // Smooth third-person orbital camera framing with spherical collision avoidance
  public updateCamera(camera: THREE.PerspectiveCamera, delta: number) {
    const targetDistance = this.traversalMode === 'flight' ? 14.0 : this.traversalMode === 'rover' ? 9.5 : this.cameraDistance;

    const northApprox = new THREE.Vector3(0, 1, 0);
    let eastTangent = new THREE.Vector3().crossVectors(northApprox, this.upVector).normalize();
    if (eastTangent.lengthSq() < 0.01) eastTangent.set(1, 0, 0);
    const northTangent = new THREE.Vector3().crossVectors(this.upVector, eastTangent).normalize();

    const hAngle = this.cameraAzimuth;
    const vAngle = this.cameraPitch;

    const eyeOffset = northTangent.clone().multiplyScalar(-Math.cos(hAngle) * Math.cos(vAngle) * targetDistance)
      .addScaledVector(eastTangent, -Math.sin(hAngle) * Math.cos(vAngle) * targetDistance)
      .addScaledVector(this.upVector, Math.sin(vAngle) * targetDistance + (this.traversalMode === 'rover' ? 1.4 : 1.8));

    const desiredCamPos = this.position.clone().add(eyeOffset);

    // Exponential damping camera follow
    const lerpFactor = 1.0 - Math.exp(-14.0 * Math.min(delta, 0.05));
    camera.position.lerp(desiredCamPos, lerpFactor);
    camera.up.lerp(this.upVector, lerpFactor);

    const lookTarget = this.position.clone().addScaledVector(this.upVector, 1.2);
    camera.lookAt(lookTarget);
  }

  public zoomCamera(delta: number) {
    this.cameraDistance = Math.max(3.5, Math.min(25.0, this.cameraDistance + delta));
  }
}

