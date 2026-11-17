import * as THREE from 'three';
import { PlanetId } from '../types';
import { CELESTIAL_BODIES } from '../planets/planetConfig';
import { ProceduralTextures } from './ProceduralTextures';

export interface PlanetMeshEntry {
  id: PlanetId;
  pivot: THREE.Group;
  mesh: THREE.Mesh;
  clouds?: THREE.Mesh;
  glowMesh?: THREE.Mesh;
  moonsGroup?: THREE.Group;
  orbitLine: THREE.Line;
  orbitRadius: number;
  orbitSpeed: number;
  rotationSpeed: number;
  currentOrbitAngle: number;
}

export class SpaceUniverse {
  public scene: THREE.Scene;
  public planets: Map<PlanetId, PlanetMeshEntry> = new Map();
  public starfield: THREE.Points;
  public asteroidBelt: THREE.InstancedMesh;
  public sunLight: THREE.PointLight;
  public ambientLight: THREE.AmbientLight;
  public hemisphereLight: THREE.HemisphereLight;
  public selectionRing: THREE.Mesh;

  private raycastMeshesCache: THREE.Mesh[] = [];
  private hoveredPlanet: PlanetId | null = null;
  private selectedPlanet: PlanetId | null = null;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020617);

    // Balanced space ambient fill so outer planets & night hemispheres remain legible and vivid
    this.ambientLight = new THREE.AmbientLight(0x64748b, 0.85);
    this.scene.add(this.ambientLight);

    this.hemisphereLight = new THREE.HemisphereLight(0x475569, 0x0f172a, 0.6);
    this.scene.add(this.hemisphereLight);

    // Primary Sun Point Light at origin (0, 0, 0) covering all 8 planets cleanly
    this.sunLight = new THREE.PointLight(0xfffbeb, 5.2, 700, 0.35);
    this.sunLight.position.set(0, 0, 0);
    this.scene.add(this.sunLight);

    // 3D Starfield in deep space
    this.starfield = this.createStarfield(4500);
    this.scene.add(this.starfield);

    // Build Central Host Star (Sun)
    this.buildSun();

    // Build All 8 Planets + Moon in Astronomical Order
    this.buildSolarPlanet('mercury', 0.45);
    this.buildSolarPlanet('venus', 1.65);
    this.buildSolarPlanet('earth', 0.82);
    this.buildSolarPlanet('moon', 0.25);
    this.buildSolarPlanet('mars', 2.45);

    // Main Asteroid Belt between Mars (44.5) and Jupiter (68.0)
    this.asteroidBelt = this.createAsteroidBelt(520, 52.0, 60.5);
    this.scene.add(this.asteroidBelt);

    this.buildSolarPlanet('jupiter', 3.65);
    this.buildSolarPlanet('saturn', 5.25);
    this.buildSolarPlanet('uranus', 2.25);
    this.buildSolarPlanet('neptune', 4.35);

    // Selection Hologram Ring
    const ringGeo = new THREE.RingGeometry(1.25, 1.48, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      map: ProceduralTextures.getHologramRingTexture()
    });
    this.selectionRing = new THREE.Mesh(ringGeo, ringMat);
    this.scene.add(this.selectionRing);

    this.raycastMeshesCache = Array.from(this.planets.values()).map(p => p.mesh);
  }

  public getRaycastTargets(): THREE.Mesh[] {
    return this.raycastMeshesCache;
  }

  private createStarfield(count: number): THREE.Points {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const radius = 520;
    for (let i = 0; i < count; i++) {
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * (0.75 + 0.25 * Math.random());

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const tint = Math.random();
      if (tint > 0.85) {
        colors[i * 3] = 0.7; colors[i * 3 + 1] = 0.88; colors[i * 3 + 2] = 1.0;
      } else if (tint > 0.7) {
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.86; colors[i * 3 + 2] = 0.6;
      } else {
        colors[i * 3] = 0.96; colors[i * 3 + 1] = 0.98; colors[i * 3 + 2] = 1.0;
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 1.9,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      map: ProceduralTextures.getStarParticleTexture()
    });

    return new THREE.Points(geo, mat);
  }

  private createAsteroidBelt(count: number, minR: number, maxR: number): THREE.InstancedMesh {
    const geo = new THREE.DodecahedronGeometry(0.28, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.92,
      metalness: 0.14
    });
    const inst = new THREE.InstancedMesh(geo, mat, count);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + (i % 7) * 0.13;
      const r = minR + ((i * 37.3) % (maxR - minR));
      const y = ((i % 11) - 5) * 0.28;
      dummy.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
      dummy.rotation.set(i * 0.6, i * 1.1, i * 0.3);
      const s = 0.55 + (i % 5) * 0.25;
      dummy.scale.set(s * 1.2, s * 0.85, s);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
    return inst;
  }

  private createOrbitLine(radius: number, color: number, opacity: number, moonTilt = false): THREE.Line {
    const segments = 128;
    const lineGeo = new THREE.BufferGeometry();
    const linePos = new Float32Array((segments + 1) * 3);
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      linePos[i * 3] = Math.cos(angle) * radius;
      linePos[i * 3 + 1] = moonTilt ? Math.sin(angle) * 0.65 : 0;
      linePos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity
    });
    return new THREE.Line(lineGeo, lineMat);
  }

  private buildSun() {
    const config = CELESTIAL_BODIES.sun;
    const pivot = new THREE.Group();
    this.scene.add(pivot);

    const sunGeo = new THREE.SphereGeometry(config.radiusScene, 36, 36);
    const sunMat = new THREE.MeshBasicMaterial({
      map: ProceduralTextures.getSunTexture()
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.userData = { planetId: 'sun' };
    pivot.add(sunMesh);

    const coronaGeo = new THREE.SphereGeometry(config.radiusScene * 1.2, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide
    });
    const corona = new THREE.Mesh(coronaGeo, coronaMat);
    pivot.add(corona);

    const dummyOrbit = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial());

    this.planets.set('sun', {
      id: 'sun',
      pivot,
      mesh: sunMesh,
      glowMesh: corona,
      orbitLine: dummyOrbit,
      orbitRadius: 0,
      orbitSpeed: 0,
      rotationSpeed: config.rotationSpeed,
      currentOrbitAngle: 0
    });
  }

  private buildSolarPlanet(id: PlanetId, initialAngle: number) {
    const config = CELESTIAL_BODIES[id];
    const pivot = new THREE.Group();
    this.scene.add(pivot);

    const orbitR = config.orbitRadius;
    const orbitColor =
      id === 'moon'
        ? 0xcbd5e1
        : id === 'mars'
        ? 0xea580c
        : id === 'earth'
        ? 0x38bdf8
        : id === 'venus'
        ? 0xf59e0b
        : id === 'jupiter'
        ? 0xd97706
        : id === 'saturn'
        ? 0xeab308
        : id === 'uranus'
        ? 0x67e8f9
        : id === 'neptune'
        ? 0x3b82f6
        : 0x94a3b8;

    const orbitLine = this.createOrbitLine(orbitR, orbitColor, id === 'moon' ? 0.55 : 0.34, id === 'moon');
    this.scene.add(orbitLine);

    const sphereGeo = new THREE.SphereGeometry(config.radiusScene, 40, 40);
    let planetMat: THREE.MeshStandardMaterial;

    switch (id) {
      case 'mercury':
        planetMat = new THREE.MeshStandardMaterial({
          map: ProceduralTextures.getMercuryTexture(),
          roughness: 0.88,
          metalness: 0.08,
          emissive: 0x292524,
          emissiveIntensity: 0.14
        });
        break;
      case 'venus':
        planetMat = new THREE.MeshStandardMaterial({
          map: ProceduralTextures.getVenusTexture(),
          roughness: 0.52,
          metalness: 0.05,
          emissive: 0x78350f,
          emissiveIntensity: 0.16
        });
        break;
      case 'earth':
        planetMat = new THREE.MeshStandardMaterial({
          map: ProceduralTextures.getEarthTexture(),
          roughness: 0.42,
          metalness: 0.1,
          emissive: 0x0c4a6e,
          emissiveIntensity: 0.14
        });
        break;
      case 'moon':
        planetMat = new THREE.MeshStandardMaterial({
          map: ProceduralTextures.getMoonTexture(),
          bumpMap: ProceduralTextures.getRegolithBumpTexture('moon'),
          bumpScale: 0.07,
          roughness: 0.9,
          metalness: 0.04,
          emissive: 0x334155,
          emissiveIntensity: 0.14
        });
        break;
      case 'mars':
        planetMat = new THREE.MeshStandardMaterial({
          map: ProceduralTextures.getMarsTexture(),
          bumpMap: ProceduralTextures.getRegolithBumpTexture('mars'),
          bumpScale: 0.08,
          roughness: 0.82,
          metalness: 0.08,
          emissive: 0x7c2d12,
          emissiveIntensity: 0.14
        });
        break;
      case 'jupiter':
        planetMat = new THREE.MeshStandardMaterial({
          map: ProceduralTextures.getJupiterTexture(),
          roughness: 0.48,
          metalness: 0.06,
          emissive: 0x78350f,
          emissiveIntensity: 0.18
        });
        break;
      case 'saturn':
        planetMat = new THREE.MeshStandardMaterial({
          map: ProceduralTextures.getSaturnTexture(),
          roughness: 0.5,
          metalness: 0.05,
          emissive: 0x713f12,
          emissiveIntensity: 0.18
        });
        break;
      case 'uranus':
        planetMat = new THREE.MeshStandardMaterial({
          map: ProceduralTextures.getUranusTexture(),
          roughness: 0.44,
          metalness: 0.06,
          emissive: 0x155e75,
          emissiveIntensity: 0.22
        });
        break;
      default:
        planetMat = new THREE.MeshStandardMaterial({
          map: ProceduralTextures.getNeptuneTexture(),
          roughness: 0.42,
          metalness: 0.08,
          emissive: 0x1e3a8a,
          emissiveIntensity: 0.22
        });
        break;
    }

    const mesh = new THREE.Mesh(sphereGeo, planetMat);
    mesh.userData = { planetId: id };

    if (id === 'moon') {
      const earthCfg = CELESTIAL_BODIES.earth;
      const earthAngle = 0.82;
      const ex = Math.cos(earthAngle) * earthCfg.orbitRadius;
      const ez = Math.sin(earthAngle) * earthCfg.orbitRadius;
      mesh.position.set(ex + Math.cos(initialAngle) * orbitR, 0.3, ez + Math.sin(initialAngle) * orbitR);
      orbitLine.position.set(ex, 0, ez);
    } else {
      mesh.position.set(Math.cos(initialAngle) * orbitR, 0, Math.sin(initialAngle) * orbitR);
    }
    pivot.add(mesh);

    let cloudsMesh: THREE.Mesh | undefined;
    if (id === 'earth') {
      const cloudGeo = new THREE.SphereGeometry(config.radiusScene * 1.03, 32, 32);
      const cloudMat = new THREE.MeshStandardMaterial({
        map: ProceduralTextures.getEarthCloudsTexture(),
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending
      });
      cloudsMesh = new THREE.Mesh(cloudGeo, cloudMat);
      mesh.add(cloudsMesh);
    }

    let moonsGroup: THREE.Group | undefined;

    if (id === 'jupiter') {
      moonsGroup = new THREE.Group();
      const galilean = [
        { dist: 8.0, color: 0xfef08a, r: 0.32 }, // Io
        { dist: 9.6, color: 0xe2e8f0, r: 0.28 }, // Europa
        { dist: 11.4, color: 0x94a3b8, r: 0.38 }, // Ganymede
        { dist: 13.0, color: 0x64748b, r: 0.34 } // Callisto
      ];
      galilean.forEach((m, idx) => {
        const gMoon = new THREE.Mesh(
          new THREE.SphereGeometry(m.r, 12, 12),
          new THREE.MeshStandardMaterial({ color: m.color, roughness: 0.85, emissive: m.color, emissiveIntensity: 0.12 })
        );
        const a = idx * 1.5;
        gMoon.position.set(Math.cos(a) * m.dist, (idx % 2 === 0 ? 1 : -1) * 0.2, Math.sin(a) * m.dist);
        moonsGroup!.add(gMoon);
      });
      mesh.add(moonsGroup);
    }

    if (id === 'saturn') {
      const ringGeo = new THREE.RingGeometry(config.radiusScene * 1.32, config.radiusScene * 2.45, 72);
      // Map UVs cleanly from radial distance for crisp circular ring texture
      const pos = ringGeo.attributes.position as THREE.BufferAttribute;
      const uv = ringGeo.attributes.uv as THREE.BufferAttribute;
      const maxR = config.radiusScene * 2.45;
      for (let i = 0; i < pos.count; i++) {
        const vx = pos.getX(i);
        const vy = pos.getY(i);
        uv.setXY(i, 0.5 + (vx / maxR) * 0.5, 0.5 + (vy / maxR) * 0.5);
      }
      const ringMat = new THREE.MeshBasicMaterial({
        map: ProceduralTextures.getSaturnRingTexture(),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.94,
        depthWrite: false
      });
      const saturnRing = new THREE.Mesh(ringGeo, ringMat);
      saturnRing.rotation.x = Math.PI / 2 - 0.44; // Authentic 26.7° ring tilt
      mesh.add(saturnRing);

      moonsGroup = new THREE.Group();
      const titan = new THREE.Mesh(
        new THREE.SphereGeometry(0.45, 14, 14),
        new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.7, emissive: 0x78350f, emissiveIntensity: 0.18 })
      );
      titan.position.set(13.5, 0.4, 2.0);
      moonsGroup.add(titan);
      mesh.add(moonsGroup);
    }

    if (id === 'uranus') {
      const uRingGeo = new THREE.RingGeometry(config.radiusScene * 1.38, config.radiusScene * 1.78, 48);
      const uRingMat = new THREE.MeshBasicMaterial({
        color: 0xa5f3fc,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35,
        depthWrite: false
      });
      const uRing = new THREE.Mesh(uRingGeo, uRingMat);
      uRing.rotation.y = 0.35; // Near-vertical 98° sideways axial ring system!
      mesh.add(uRing);
    }

    this.planets.set(id, {
      id,
      pivot,
      mesh,
      clouds: cloudsMesh,
      moonsGroup,
      orbitLine,
      orbitRadius: orbitR,
      orbitSpeed: config.orbitSpeed,
      rotationSpeed: config.rotationSpeed,
      currentOrbitAngle: initialAngle
    });
  }

  public update(delta: number) {
    this.starfield.rotation.y += delta * 0.004;
    this.asteroidBelt.rotation.y += delta * 0.0018;

    const earthEntry = this.planets.get('earth');

    this.planets.forEach((p) => {
      p.mesh.rotation.y += p.rotationSpeed;
      if (p.clouds) {
        p.clouds.rotation.y += p.rotationSpeed * 1.25;
      }
      if (p.moonsGroup) {
        p.moonsGroup.rotation.y += delta * 0.25;
      }

      if (p.id === 'moon') {
        if (earthEntry) {
          p.currentOrbitAngle += p.orbitSpeed * delta * 3.2;
          p.mesh.position.x = earthEntry.mesh.position.x + Math.cos(p.currentOrbitAngle) * p.orbitRadius;
          p.mesh.position.z = earthEntry.mesh.position.z + Math.sin(p.currentOrbitAngle) * p.orbitRadius;
          p.mesh.position.y = Math.sin(p.currentOrbitAngle) * 0.65;
          p.orbitLine.position.copy(earthEntry.mesh.position);
        }
      } else if (p.orbitRadius > 0) {
        p.currentOrbitAngle += p.orbitSpeed * delta;
        p.mesh.position.x = Math.cos(p.currentOrbitAngle) * p.orbitRadius;
        p.mesh.position.z = Math.sin(p.currentOrbitAngle) * p.orbitRadius;
      }
    });

    const activePlanetId = this.selectedPlanet || this.hoveredPlanet;
    if (activePlanetId && this.planets.has(activePlanetId)) {
      const entry = this.planets.get(activePlanetId)!;
      const targetPos = entry.mesh.position;
      const radius = CELESTIAL_BODIES[activePlanetId].radiusScene * 1.55;

      this.selectionRing.position.set(targetPos.x, targetPos.y, targetPos.z);
      this.selectionRing.scale.set(radius, radius, radius);
      this.selectionRing.rotation.y += delta * 0.8;
      (this.selectionRing.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp(
        (this.selectionRing.material as THREE.MeshBasicMaterial).opacity,
        0.85,
        0.1
      );
    } else {
      (this.selectionRing.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp(
        (this.selectionRing.material as THREE.MeshBasicMaterial).opacity,
        0,
        0.1
      );
    }
  }

  public getPlanetPosition(id: PlanetId, out?: THREE.Vector3): THREE.Vector3 {
    const entry = this.planets.get(id);
    if (!entry) return out ? out.set(0, 0, 0) : new THREE.Vector3(0, 0, 0);
    return out ? out.copy(entry.mesh.position) : entry.mesh.position.clone();
  }

  public setHoveredPlanet(id: PlanetId | null) {
    this.hoveredPlanet = id;
  }

  public setSelectedPlanet(id: PlanetId | null) {
    this.selectedPlanet = id;
  }
}
