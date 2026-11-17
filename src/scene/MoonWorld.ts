import * as THREE from 'three';
import { ProceduralTextures } from './ProceduralTextures';
import { CylinderObstacle, MountainConeObstacle } from '../physics/planetaryPhysics';
import { SHUTTLE_PADS } from '../shuttle/shuttleTravelState';
import {
  APOLLO_12_INTREPID_SITE,
  MOON_RESOURCE_SITES
} from '../moonResources/moonResourceData';

export interface WorldDiscoveryObject {
  id: string;
  position: THREE.Vector3;
  meshGroup: THREE.Group;
  beaconRing: THREE.Mesh;
  interactionRadius: number;
}

export class MoonWorld {
  public scene: THREE.Scene;
  public terrainMesh: THREE.Mesh;
  public discoveryObjects: WorldDiscoveryObject[] = [];
  public directionalLight: THREE.DirectionalLight;
  public ambientLight: THREE.AmbientLight;
  public hemisphereLight: THREE.HemisphereLight;
  private baseFloodlights: THREE.PointLight[] = [];
  private solidObstaclesCache: CylinderObstacle[] = [];
  private mountainObstaclesCache: MountainConeObstacle[] = [];

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x010409); // Airless pitch-black lunar sky

    // Harsh direct sunlight with subtle regolith bounce fill
    this.hemisphereLight = new THREE.HemisphereLight(0xe2e8f0, 0x1e293b, 0.35);
    this.scene.add(this.hemisphereLight);

    this.ambientLight = new THREE.AmbientLight(0x1e293b, 0.28);
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xfffbeb, 2.9);
    this.directionalLight.position.set(65, 36, 48);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 1024;
    this.directionalLight.shadow.mapSize.height = 1024;
    this.directionalLight.shadow.bias = -0.0005;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 260;
    const d = 68;
    this.directionalLight.shadow.camera.left = -d;
    this.directionalLight.shadow.camera.right = d;
    this.directionalLight.shadow.camera.top = d;
    this.directionalLight.shadow.camera.bottom = -d;
    this.scene.add(this.directionalLight);

    // Build Starfield, Distant Earth on Horizon & Orbital Gateway Satellites
    this.buildSkyAndEarth();

    // Build Lunar Terrain & Instanced Angular Lunar Boulders & Massifs
    this.terrainMesh = this.buildTerrain();
    this.scene.add(this.terrainMesh);
    this.buildInstancedRocksAndHorizonMountains();

    // Build unobstructed Space Shuttle Landing Pad Marker (no mission-resource clutter)
    this.buildShuttlePadMarker();
  }

  public setLightingMode(mode: 'day' | 'sunset' | 'night') {
    if (mode === 'day') {
      this.directionalLight.position.set(65, 36, 48);
      this.directionalLight.color.setHex(0xfffbeb);
      this.directionalLight.intensity = 2.9;
      this.ambientLight.intensity = 0.28;
      this.baseFloodlights.forEach(l => (l.intensity = 1.6));
    } else if (mode === 'sunset') {
      // Low-angle South Pole grazing illumination (long dramatic shadows)
      this.directionalLight.position.set(-85, 11, -35);
      this.directionalLight.color.setHex(0xfef3c7);
      this.directionalLight.intensity = 2.5;
      this.ambientLight.intensity = 0.2;
      this.baseFloodlights.forEach(l => (l.intensity = 3.2));
    } else {
      // Earthshine Operations
      this.directionalLight.position.set(-40, 45, -60);
      this.directionalLight.color.setHex(0x93c5fd);
      this.directionalLight.intensity = 0.65;
      this.ambientLight.intensity = 0.16;
      this.baseFloodlights.forEach(l => (l.intensity = 5.0));
    }
  }

  // Exact continuous terrain elevation function
  public static getElevation(x: number, z: number): number {
    const dist = Math.hypot(x, z);

    // Large lunar highland undulations
    let h = Math.sin(x * 0.04) * Math.cos(z * 0.04) * 2.2;
    h += Math.sin(x * 0.09 + 1.2) * Math.cos(z * 0.08) * 1.1;

    // Center landing zone smoothing (Mare plain)
    if (dist < 22) {
      h *= (dist / 22);
    }

    // Tycho highlands ridge relocated northeast so eastern ALSEP/Surveyor plain stays clear
    const dTycho = Math.hypot(x - 58, z - 44);
    if (dTycho < 16) {
      h += Math.cos((dTycho / 16) * Math.PI) * 4.5;
    }

    // Cold trap depression around [-30, -32]
    const dIce = Math.hypot(x + 30, z + 32);
    if (dIce < 14) {
      h -= Math.cos((dIce / 14) * Math.PI * 0.5) * 3.8;
    }

    // Marius skylight crater around [-38, 5]
    const dTube = Math.hypot(x + 38, z - 5);
    if (dTube < 12) {
      h -= Math.cos((dTube / 12) * Math.PI * 0.5) * 3.2;
    }

    // Flattened aprons for Space Shuttle Pad + Tranquility Base + Hadley LRV Base + Apollo 12 Intrepid + ALSEP
    const pad = SHUTTLE_PADS.moon;
    const flatPads = [
      { x: pad.x, z: pad.z, inner: 7.5, outer: 11.5, targetY: 0.0 },
      { x: MOON_RESOURCE_SITES.apollo_lm.x, z: MOON_RESOURCE_SITES.apollo_lm.z, inner: 7.5, outer: 12.0, targetY: 0.05 },
      { x: MOON_RESOURCE_SITES.lunar_rover.x, z: MOON_RESOURCE_SITES.lunar_rover.z, inner: 8.0, outer: 13.0, targetY: 0.1 },
      { x: APOLLO_12_INTREPID_SITE.x, z: APOLLO_12_INTREPID_SITE.z, inner: 5.0, outer: 9.0, targetY: 0.1 },
      { x: MOON_RESOURCE_SITES.alsep.x, z: MOON_RESOURCE_SITES.alsep.z, inner: 7.0, outer: 11.5, targetY: 0.15 }
    ];
    for (const fp of flatPads) {
      const dp = Math.hypot(x - fp.x, z - fp.z);
      if (dp < fp.outer) {
        const t = Math.max(0, Math.min(1, (dp - fp.inner) / (fp.outer - fp.inner)));
        const smoothT = t * t * (3 - 2 * t);
        h = fp.targetY * (1 - smoothT) + h * smoothT;
      }
    }

    // Gentle shallow crater saucer for Surveyor 3 at (40, 26)
    const surv = MOON_RESOURCE_SITES.surveyor;
    const dSurv = Math.hypot(x - surv.x, z - surv.z);
    if (dSurv < 15.0) {
      const targetFloor = dSurv < 5.5 ? -0.75 : -0.75 + ((dSurv - 5.5) / 9.5) * 0.9;
      const t = Math.max(0, Math.min(1, (dSurv - 7.5) / 7.5));
      const smoothT = t * t * (3 - 2 * t);
      h = targetFloor * (1 - smoothT) + h * smoothT;
    }

    return h;
  }

  private buildTerrain(): THREE.Mesh {
    const size = 1200;
    const segments = 160;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const r = Math.hypot(x, z);
      let y = MoonWorld.getElevation(x, z);
      // Seamless spherical horizon curvature roll-off far outside open exploration plains
      if (r > 430) {
        y -= Math.pow(r - 430, 2) / 500;
      }
      pos.setY(i, y);
    }
    geo.computeVertexNormals();

    const terrainColorMap = ProceduralTextures.getMoonTexture().clone();
    terrainColorMap.wrapS = THREE.RepeatWrapping;
    terrainColorMap.wrapT = THREE.RepeatWrapping;
    terrainColorMap.repeat.set(24, 24);
    terrainColorMap.anisotropy = 8;
    terrainColorMap.needsUpdate = true;

    const terrainBumpMap = ProceduralTextures.getRegolithBumpTexture('moon').clone();
    terrainBumpMap.wrapS = THREE.RepeatWrapping;
    terrainBumpMap.wrapT = THREE.RepeatWrapping;
    terrainBumpMap.repeat.set(24, 24);
    terrainBumpMap.anisotropy = 8;
    terrainBumpMap.needsUpdate = true;

    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.94,
      metalness: 0.04,
      map: terrainColorMap,
      bumpMap: terrainBumpMap,
      bumpScale: 0.42
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;

    // True 3D Spherical Planetary Globe Body underneath (visible on high altitude ascent)
    const globeRadius = 1100;
    const globeGeo = new THREE.SphereGeometry(globeRadius, 64, 48);
    const globeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.94,
      metalness: 0.04,
      map: ProceduralTextures.getMoonTexture(),
      bumpMap: ProceduralTextures.getRegolithBumpTexture('moon'),
      bumpScale: 0.3
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    globeMesh.position.set(0, -globeRadius, 0);
    this.scene.add(globeMesh);

    return mesh;
  }

  // Solid obstacle colliders aligned strictly with natural lunar boulders
  public getSolidObstacles(): CylinderObstacle[] {
    return this.solidObstaclesCache;
  }

  // Horizon mountain cone colliders so astronaut never clips through lunar massifs
  public getMountainObstacles(): MountainConeObstacle[] {
    return this.mountainObstaclesCache;
  }

  private buildSkyAndEarth() {
    // 1. Crisp Starfield in airless black sky
    const starCount = 1200;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.48; // Upper hemisphere
      const r = 175;
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.cos(phi) + 8;
      starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.65, transparent: true, opacity: 0.85 })
    );
    this.scene.add(stars);

    // 2. Blue Marble Earth Rising Over Lunar Horizon (Astronomically calibrated ~1.9° angular diameter)
    const earthGroup = new THREE.Group();
    earthGroup.position.set(28, 30, -210);

    const earthGeo = new THREE.SphereGeometry(3.5, 32, 32);
    const earthMat = new THREE.MeshStandardMaterial({
      map: ProceduralTextures.getEarthTexture(),
      roughness: 0.45,
      metalness: 0.1,
      emissive: 0x082f49,
      emissiveIntensity: 0.15
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    const atmosphereGeo = new THREE.SphereGeometry(3.68, 32, 32);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.38,
      side: THREE.BackSide
    });
    earthGroup.add(new THREE.Mesh(atmosphereGeo, atmosphereMat));
    this.scene.add(earthGroup);
  }

  private buildInstancedRocksAndHorizonMountains() {
    // 1. Open-World Scenic Lunar Massifs & Highlands (wide navigable passes — zero perimeter wall cage!)
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.95,
      metalness: 0.04
    });

    const scenicMassifs = [
      { x: 145, z: -130, r: 28, h: 24 },
      { x: -165, z: -140, r: 34, h: 30 },
      { x: 220, z: 95, r: 32, h: 26 },
      { x: -210, z: 120, r: 30, h: 22 },
      { x: 60, z: -260, r: 42, h: 36 },
      { x: -110, z: 255, r: 38, h: 32 },
      { x: 285, z: -220, r: 46, h: 40 },
      { x: -310, z: -195, r: 44, h: 38 },
      { x: 310, z: 230, r: 40, h: 34 },
      { x: -280, z: 270, r: 36, h: 28 },
      { x: 360, z: 15, r: 38, h: 30 },
      { x: -370, z: -10, r: 36, h: 26 }
    ];

    scenicMassifs.forEach((m, i) => {
      const baseY = -1.5;
      const mountainGeo = new THREE.ConeGeometry(m.r, m.h, 8);
      const mountain = new THREE.Mesh(mountainGeo, rimMat);
      mountain.position.set(m.x, baseY + m.h * 0.5, m.z);
      mountain.rotation.y = i * 0.75;
      this.scene.add(mountain);

      this.mountainObstaclesCache.push({
        x: m.x,
        z: m.z,
        baseRadius: m.r,
        height: m.h,
        baseY
      });
    });

    // 2. Instanced Angular Lunar Basalt Boulders & Ejecta Rocks (480 rocks spanning inner & far plains)
    const rockCount = 480;
    const rockGeo = new THREE.DodecahedronGeometry(0.45, 0);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.92,
      metalness: 0.08
    });
    const instancedRocks = new THREE.InstancedMesh(rockGeo, rockMat, rockCount);
    instancedRocks.castShadow = true;
    instancedRocks.receiveShadow = true;

    const pad = SHUTTLE_PADS.moon;
    const exclusionZones = [
      { x: pad.x, z: pad.z, r: 13.0 },
      { x: 0, z: 4.5, r: 11.0 },
      { x: MOON_RESOURCE_SITES.apollo_lm.x, z: MOON_RESOURCE_SITES.apollo_lm.z, r: 15.5 },
      { x: MOON_RESOURCE_SITES.apollo_lm.x + 7.5, z: MOON_RESOURCE_SITES.apollo_lm.z + 4.5, r: 6.5 },
      { x: MOON_RESOURCE_SITES.lunar_rover.x, z: MOON_RESOURCE_SITES.lunar_rover.z, r: 15.5 },
      { x: APOLLO_12_INTREPID_SITE.x, z: APOLLO_12_INTREPID_SITE.z, r: 10.5 },
      { x: MOON_RESOURCE_SITES.alsep.x, z: MOON_RESOURCE_SITES.alsep.z, r: 14.5 },
      { x: MOON_RESOURCE_SITES.surveyor.x, z: MOON_RESOURCE_SITES.surveyor.z, r: 15.5 }
    ];
    const dummy = new THREE.Object3D();
    for (let i = 0; i < rockCount; i++) {
      // Deterministic distribution across inner base AND open outer highlands (10m .. 380m)
      const seed = i * 137.508;
      const r = i < 280 ? 10 + ((i * 29) % 85) : 96 + ((i * 53) % 280);
      let x = Math.cos(seed) * r;
      let z = Math.sin(seed) * r;
      if (exclusionZones.some(ez => Math.hypot(x - ez.x, z - ez.z) < ez.r)) {
        const outerR = 110 + (i % 40);
        x = Math.cos(seed + 1.9) * outerR;
        z = Math.sin(seed + 1.9) * outerR;
      }
      const y = MoonWorld.getElevation(x, z);

      const scaleX = 0.35 + ((i * 17) % 10) * 0.14;
      const scaleY = 0.25 + ((i * 13) % 8) * 0.11;
      const scaleZ = 0.35 + ((i * 23) % 10) * 0.14;

      dummy.position.set(x, y + scaleY * 0.28, z);
      dummy.rotation.set(i * 0.4, i * 1.1, i * 0.7);
      dummy.scale.set(scaleX, scaleY, scaleZ);
      dummy.updateMatrix();
      instancedRocks.setMatrixAt(i, dummy.matrix);

      // Register significant boulders into physical collision cache
      const approxRadius = Math.max(scaleX, scaleZ) * 0.42;
      if (approxRadius >= 0.48) {
        this.solidObstaclesCache.push({
          x,
          z,
          radius: approxRadius,
          height: scaleY * 0.9,
          baseY: y
        });
      }
    }
    instancedRocks.instanceMatrix.needsUpdate = true;
    this.scene.add(instancedRocks);
  }

  private buildShuttlePadMarker() {
    // Dedicated Space Shuttle Landing Pad Marker at SHUTTLE_PADS.moon
    const pad = SHUTTLE_PADS.moon;
    const padMarkerGeo = new THREE.RingGeometry(5.5, 6.1, 32);
    padMarkerGeo.rotateX(-Math.PI / 2);
    const padMarker = new THREE.Mesh(
      padMarkerGeo,
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
    );
    padMarker.position.set(pad.x, MoonWorld.getElevation(pad.x, pad.z) + 0.08, pad.z);
    this.scene.add(padMarker);
  }

  public update(_delta: number, _time: number) {
    // Clean natural lunar environment; animation updates only apply to future integrated resources.
  }
}
