import * as THREE from 'three';
import { PlanetId } from '../types';

export class RoverDustParticles {
  public points: THREE.Points;
  private maxParticles = 180;
  private particleIndex = 0;

  private positions: Float32Array;
  private velocities: Float32Array;
  private lives: Float32Array;
  private maxLives: Float32Array;
  private colors: Float32Array;

  private geo: THREE.BufferGeometry;
  private mat: THREE.PointsMaterial;

  constructor() {
    this.positions = new Float32Array(this.maxParticles * 3);
    this.velocities = new Float32Array(this.maxParticles * 3);
    this.lives = new Float32Array(this.maxParticles);
    this.maxLives = new Float32Array(this.maxParticles);
    this.colors = new Float32Array(this.maxParticles * 3);

    // Initialize all off-screen
    for (let i = 0; i < this.maxParticles; i++) {
      this.positions[i * 3] = 0;
      this.positions[i * 3 + 1] = -999;
      this.positions[i * 3 + 2] = 0;
      this.lives[i] = 0;
      this.maxLives[i] = 1.0;
    }

    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geo.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    // Particle sprite
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.45)');
    grad.addColorStop(0.8, 'rgba(255, 255, 255, 0.1)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const spriteTex = new THREE.CanvasTexture(canvas);

    this.mat = new THREE.PointsMaterial({
      size: 0.45,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      map: spriteTex,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    this.points = new THREE.Points(this.geo, this.mat);
    this.points.frustumCulled = false;
  }

  public update(
    delta: number,
    isDrivingRover: boolean,
    isMoving: boolean,
    isGrounded: boolean,
    roverPos: THREE.Vector3,
    roverRotY: number,
    planet: PlanetId
  ) {
    const clampedDt = Math.min(delta, 0.05);

    // Gravity and lifetime properties per planet
    const isMoon = planet === 'moon';
    const isMars = planet === 'mars';
    const dustGravity = isMoon ? 0.45 : isMars ? 0.85 : 2.2;
    const maxLife = isMoon ? 1.6 : isMars ? 1.2 : 0.85; // Low-gravity suspension on Moon!

    // Base colors per planetary regolith
    const baseR = isMoon ? 0.72 : isMars ? 0.88 : 0.48;
    const baseG = isMoon ? 0.76 : isMars ? 0.42 : 0.42;
    const baseB = isMoon ? 0.82 : isMars ? 0.18 : 0.35;

    // Emit new dust particles behind the 6 wheels when driving
    if (isDrivingRover && isMoving && isGrounded) {
      const emitCount = isMoon ? 3 : 2;
      const wheelOffsets = [
        [-1.0, 0.1, 0.8], [1.0, 0.1, 0.8],
        [-1.0, 0.1, 0], [1.0, 0.1, 0],
        [-1.0, 0.1, -0.8], [1.0, 0.1, -0.8]
      ];

      for (let e = 0; e < emitCount; e++) {
        const i = this.particleIndex;
        this.particleIndex = (this.particleIndex + 1) % this.maxParticles;

        const w = wheelOffsets[Math.floor(Math.random() * wheelOffsets.length)];
        const cosR = Math.cos(roverRotY);
        const sinR = Math.sin(roverRotY);

        // World position of wheel
        const wx = roverPos.x + (w[0] * cosR + w[2] * sinR);
        const wy = roverPos.y + w[1];
        const wz = roverPos.z + (-w[0] * sinR + w[2] * cosR);

        this.positions[i * 3] = wx + (Math.random() - 0.5) * 0.2;
        this.positions[i * 3 + 1] = wy + 0.05;
        this.positions[i * 3 + 2] = wz + (Math.random() - 0.5) * 0.2;

        // Velocity: launched backward and up
        const backwardAngle = roverRotY + Math.PI;
        const speed = 1.2 + Math.random() * 2.0;
        this.velocities[i * 3] = Math.sin(backwardAngle) * speed + (Math.random() - 0.5) * 0.8;
        this.velocities[i * 3 + 1] = (isMoon ? 1.2 : 0.8) + Math.random() * 1.4;
        this.velocities[i * 3 + 2] = Math.cos(backwardAngle) * speed + (Math.random() - 0.5) * 0.8;

        this.lives[i] = maxLife;
        this.maxLives[i] = maxLife;

        // Set color with slight variation
        this.colors[i * 3] = baseR + (Math.random() - 0.5) * 0.08;
        this.colors[i * 3 + 1] = baseG + (Math.random() - 0.5) * 0.08;
        this.colors[i * 3 + 2] = baseB + (Math.random() - 0.5) * 0.08;
      }
    }

    // Step existing particles
    for (let i = 0; i < this.maxParticles; i++) {
      if (this.lives[i] > 0) {
        this.lives[i] -= clampedDt;
        if (this.lives[i] <= 0) {
          this.positions[i * 3 + 1] = -999;
          continue;
        }

        // Apply low gravity and drag
        this.velocities[i * 3 + 1] -= dustGravity * clampedDt;
        this.positions[i * 3] += this.velocities[i * 3] * clampedDt;
        this.positions[i * 3 + 1] += this.velocities[i * 3 + 1] * clampedDt;
        this.positions[i * 3 + 2] += this.velocities[i * 3 + 2] * clampedDt;

        // Fade out color intensity as life decays
        const alphaRatio = this.lives[i] / this.maxLives[i];
        this.colors[i * 3] = baseR * alphaRatio;
        this.colors[i * 3 + 1] = baseG * alphaRatio;
        this.colors[i * 3 + 2] = baseB * alphaRatio;
      }
    }

    (this.geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    (this.geo.attributes.color as THREE.BufferAttribute).needsUpdate = true;
  }
}
