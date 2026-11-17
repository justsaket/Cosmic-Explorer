import * as THREE from 'three';

// 1. Atmosphere Scattering Shader Material for Earth & Mars
export function createAtmosphereMaterial(planetId: 'earth' | 'moon' | 'mars'): THREE.ShaderMaterial {
  const isEarth = planetId === 'earth';
  const isMars = planetId === 'mars';

  const atmosphereColor = isEarth
    ? new THREE.Color(0.22, 0.58, 1.0) // Deep nitrogen-oxygen Rayleigh blue
    : isMars
    ? new THREE.Color(0.85, 0.45, 0.25) // Ferric aerosol dust butterscotch-salmon
    : new THREE.Color(0.0, 0.0, 0.0);

  const sunsetColor = isEarth
    ? new THREE.Color(1.0, 0.62, 0.28) // Golden sunset Rayleigh
    : isMars
    ? new THREE.Color(0.25, 0.48, 0.82) // Martian twilight blue sunset!
    : new THREE.Color(0.0, 0.0, 0.0);

  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: atmosphereColor },
      uSunsetColor: { value: sunsetColor },
      uSunDirection: { value: new THREE.Vector3(1, 0.4, 0.8).normalize() },
      uAtmosphereDensity: { value: isEarth ? 1.0 : isMars ? 0.45 : 0.0 },
      uRimPower: { value: isEarth ? 3.2 : 2.6 }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * vec4(vPosition, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform vec3 uSunsetColor;
      uniform vec3 uSunDirection;
      uniform float uAtmosphereDensity;
      uniform float uRimPower;

      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        if (uAtmosphereDensity <= 0.001) {
          discard;
        }

        vec3 viewDir = normalize(-vPosition);
        float fresnel = dot(viewDir, vNormal);
        fresnel = clamp(fresnel, 0.0, 1.0);
        float rim = pow(1.0 - fresnel, uRimPower);

        // Sun angle influence
        vec3 worldNormal = vNormal;
        float sunDot = dot(worldNormal, uSunDirection);
        float sunsetFactor = clamp(1.0 - abs(sunDot), 0.0, 1.0);
        vec3 col = mix(uColor, uSunsetColor, sunsetFactor * 0.7);

        float alpha = rim * uAtmosphereDensity;
        if (alpha < 0.01) discard;

        gl_FragColor = vec4(col, alpha);
      }
    `,
    side: THREE.BackSide,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
}

// 2. High-Performance Regolith Dust Particle FX (zero-allocation ring buffer)
export class RegolithParticleSystem {
  public group: THREE.Group;
  private particleCount = 200;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private positions: Float32Array;
  private velocities: Float32Array;
  private life: Float32Array;
  private maxLife: Float32Array;
  private points: THREE.Points;
  private nextIndex = 0;

  constructor(planetId: 'earth' | 'moon' | 'mars') {
    this.group = new THREE.Group();
    this.positions = new Float32Array(this.particleCount * 3);
    this.velocities = new Float32Array(this.particleCount * 3);
    this.life = new Float32Array(this.particleCount);
    this.maxLife = new Float32Array(this.particleCount);

    // Seed off-screen initially
    for (let i = 0; i < this.particleCount; i++) {
      this.positions[i * 3] = 0;
      this.positions[i * 3 + 1] = -9999;
      this.positions[i * 3 + 2] = 0;
      this.life[i] = 0;
      this.maxLife[i] = 1.0;
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    const color = planetId === 'mars' ? 0xd97736 : planetId === 'moon' ? 0x94a3b8 : 0x65a30d;

    this.material = new THREE.PointsMaterial({
      size: 0.22,
      color,
      transparent: true,
      opacity: 0.65,
      blending: THREE.NormalBlending,
      depthWrite: false
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.group.add(this.points);
  }

  public emitDust(origin: THREE.Vector3, upDir: THREE.Vector3, count = 3, spread = 0.4, speed = 1.2) {
    for (let c = 0; c < count; c++) {
      const idx = this.nextIndex;
      this.nextIndex = (this.nextIndex + 1) % this.particleCount;

      this.positions[idx * 3] = origin.x + (Math.random() - 0.5) * spread;
      this.positions[idx * 3 + 1] = origin.y + (Math.random() - 0.5) * spread;
      this.positions[idx * 3 + 2] = origin.z + (Math.random() - 0.5) * spread;

      // Random kick tangent + small upward boost
      const tangent = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      const vel = upDir.clone().multiplyScalar(speed * (0.5 + Math.random() * 0.8))
        .addScaledVector(tangent, speed * 0.6);

      this.velocities[idx * 3] = vel.x;
      this.velocities[idx * 3 + 1] = vel.y;
      this.velocities[idx * 3 + 2] = vel.z;

      this.life[idx] = 0.0;
      this.maxLife[idx] = 0.8 + Math.random() * 0.6;
    }
  }

  public update(delta: number, gravityDir: THREE.Vector3, gravityStrength: number) {
    const posAttr = this.geometry.attributes.position as THREE.BufferAttribute;
    const clampedDt = Math.min(delta, 0.05);

    let activeParticles = 0;
    for (let i = 0; i < this.particleCount; i++) {
      if (this.life[i] < this.maxLife[i]) {
        this.life[i] += clampedDt;
        activeParticles++;

        // Apply spherical gravity
        this.velocities[i * 3] += gravityDir.x * gravityStrength * clampedDt;
        this.velocities[i * 3 + 1] += gravityDir.y * gravityStrength * clampedDt;
        this.velocities[i * 3 + 2] += gravityDir.z * gravityStrength * clampedDt;

        // Apply velocity to position
        this.positions[i * 3] += this.velocities[i * 3] * clampedDt;
        this.positions[i * 3 + 1] += this.velocities[i * 3 + 1] * clampedDt;
        this.positions[i * 3 + 2] += this.velocities[i * 3 + 2] * clampedDt;
      } else if (this.positions[i * 3 + 1] > -9000) {
        // Hide dead particle
        this.positions[i * 3 + 1] = -9999;
      }
    }

    if (activeParticles > 0) {
      posAttr.needsUpdate = true;
    }
  }

  public dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}

// 3. Supersonic Orbital Cruiser 3D Mesh
export function buildOrbitalCruiserMesh(): THREE.Group {
  const cruiser = new THREE.Group();

  // Aerodynamic Fuselage
  const bodyGeo = new THREE.ConeGeometry(1.2, 4.6, 6);
  bodyGeo.rotateX(Math.PI / 2);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    metalness: 0.88,
    roughness: 0.18
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.castShadow = true;
  cruiser.add(body);

  // Delta Wings
  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 1.2);
  wingShape.lineTo(-3.4, -1.6);
  wingShape.lineTo(3.4, -1.6);
  wingShape.closePath();
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05 });
  wingGeo.rotateX(-Math.PI / 2);
  wingGeo.translate(0, 0.05, 0);
  const wingMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.7,
    roughness: 0.3
  });
  const wings = new THREE.Mesh(wingGeo, wingMat);
  wings.castShadow = true;
  cruiser.add(wings);

  // Cockpit Tinted Visor Canopy
  const canopyGeo = new THREE.SphereGeometry(0.55, 16, 16);
  canopyGeo.scale(0.8, 0.5, 1.8);
  const canopyMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    metalness: 0.7,
    roughness: 0.08,
    transparent: true,
    opacity: 0.65,
    clearcoat: 1.0
  });
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.set(0, 0.55, 0.4);
  cruiser.add(canopy);

  // Twin Glowing Ion Thrusters
  const thrusterGeo = new THREE.CylinderGeometry(0.3, 0.4, 0.8, 16);
  thrusterGeo.rotateX(Math.PI / 2);
  const thrusterMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });

  const leftThruster = new THREE.Mesh(thrusterGeo, thrusterMat);
  leftThruster.position.set(-0.85, 0.1, -2.1);
  const leftGlow = new THREE.Mesh(new THREE.CircleGeometry(0.36, 16), glowMat);
  leftGlow.position.set(0, 0, -0.42);
  leftGlow.rotateY(Math.PI);
  leftThruster.add(leftGlow);
  cruiser.add(leftThruster);

  const rightThruster = new THREE.Mesh(thrusterGeo, thrusterMat);
  rightThruster.position.set(0.85, 0.1, -2.1);
  const rightGlow = new THREE.Mesh(new THREE.CircleGeometry(0.36, 16), glowMat);
  rightGlow.position.set(0, 0, -0.42);
  rightGlow.rotateY(Math.PI);
  rightThruster.add(rightGlow);
  cruiser.add(rightThruster);

  // Point light for plasma engine exhaust
  const engineLight = new THREE.PointLight(0x38bdf8, 2.5, 12);
  engineLight.position.set(0, 0.1, -2.8);
  cruiser.add(engineLight);

  return cruiser;
}

// 4. Instanced Geological Rock & Boulder Scatter Generator
export function createInstancedRocks(planetId: 'earth' | 'moon' | 'mars', baseRadius: number, count = 400): THREE.InstancedMesh {
  const rockGeo = new THREE.DodecahedronGeometry(0.4, 1);
  // Deform geometry slightly for authentic jagged regolith / basalt chunks
  const posAttr = rockGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vy = posAttr.getY(i);
    const vz = posAttr.getZ(i);
    const noise = 1.0 + (Math.sin(vx * 9) + Math.cos(vy * 9) + Math.sin(vz * 9)) * 0.18;
    posAttr.setXYZ(i, vx * noise, vy * (noise * 0.8), vz * noise);
  }
  rockGeo.computeVertexNormals();

  const rockColor = planetId === 'mars' ? 0xa84826 : planetId === 'moon' ? 0x64748b : 0x475569;
  const rockMat = new THREE.MeshStandardMaterial({
    color: rockColor,
    roughness: 0.95,
    metalness: 0.08,
    flatShading: true
  });

  const instancedMesh = new THREE.InstancedMesh(rockGeo, rockMat, count);
  instancedMesh.castShadow = true;
  instancedMesh.receiveShadow = true;

  const dummy = new THREE.Object3D();
  const up = new THREE.Vector3();
  const quat = new THREE.Quaternion();

  for (let i = 0; i < count; i++) {
    // Generate random point on unit sphere
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const sinPhi = Math.sin(phi);

    const unitX = sinPhi * Math.cos(theta);
    const unitY = sinPhi * Math.sin(theta);
    const unitZ = Math.cos(phi);

    up.set(unitX, unitY, unitZ).normalize();
    quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);

    // Random rock scale (from pebble 0.3x to boulder 2.5x)
    const s = 0.25 + Math.pow(Math.random(), 3) * 2.2;
    dummy.scale.set(s, s * (0.6 + Math.random() * 0.6), s);
    dummy.position.copy(up).multiplyScalar(baseRadius + (Math.random() - 0.5) * 0.1);
    dummy.quaternion.copy(quat);
    dummy.rotateY(Math.random() * Math.PI * 2);
    dummy.updateMatrix();

    instancedMesh.setMatrixAt(i, dummy.matrix);
  }

  instancedMesh.instanceMatrix.needsUpdate = true;
  return instancedMesh;
}
