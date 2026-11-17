import * as THREE from 'three';
import { ProceduralTextures } from './ProceduralTextures';
import { WorldDiscoveryObject } from './MoonWorld';
import { CylinderObstacle, MountainConeObstacle } from '../physics/planetaryPhysics';
import { SHUTTLE_PADS } from '../shuttle/shuttleTravelState';
import { MARS_ALL_SITES } from '../marsResources/marsResourceData';

export class MarsWorld {
  public scene: THREE.Scene;
  public terrainMesh: THREE.Mesh;
  public discoveryObjects: WorldDiscoveryObject[] = [];
  public directionalLight: THREE.DirectionalLight;
  public ambientLight: THREE.AmbientLight;
  public hemisphereLight: THREE.HemisphereLight;
  private habLights: THREE.PointLight[] = [];
  private solidObstaclesCache: CylinderObstacle[] = [];
  private mountainObstaclesCache: MountainConeObstacle[] = [];

  constructor() {
    this.scene = new THREE.Scene();
    // Luminous butterscotch-salmon Martian sky
    this.scene.background = new THREE.Color(0xcf785b);
    this.scene.fog = new THREE.FogExp2(0xc96e52, 0.0044);

    // Warm sunlit sky + iron-oxide ground bounce fill
    this.hemisphereLight = new THREE.HemisphereLight(0xffedd5, 0x9a3412, 0.95);
    this.scene.add(this.hemisphereLight);

    this.ambientLight = new THREE.AmbientLight(0xfdba74, 0.48);
    this.scene.add(this.ambientLight);

    // Martian Sun
    this.directionalLight = new THREE.DirectionalLight(0xffedd5, 2.75);
    this.directionalLight.position.set(55, 38, -42);
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

    // Build Sky Dome, Phobos & Towering Martian Mountain Ridges (Mount Sharp / Jezero Rim)
    this.buildSkyAndMountains();

    // Build Martian Terrain & Dense Instanced Basalt Rock/Boulder Fields
    this.terrainMesh = this.buildTerrain();
    this.scene.add(this.terrainMesh);
    this.buildInstancedMartianRocks();

    // Build unobstructed Mars Space Shuttle Landing Pad Marker
    this.buildShuttlePadMarker();
  }

  public setLightingMode(mode: 'day' | 'sunset' | 'night') {
    if (mode === 'day') {
      this.scene.background = new THREE.Color(0xcf785b);
      this.scene.fog = new THREE.FogExp2(0xc96e52, 0.0044);
      this.directionalLight.position.set(55, 38, -42);
      this.directionalLight.color.setHex(0xffedd5);
      this.directionalLight.intensity = 2.75;
      this.ambientLight.intensity = 0.48;
      this.hemisphereLight.intensity = 0.95;
      this.habLights.forEach(l => (l.intensity = 1.2));
    } else if (mode === 'sunset') {
      this.scene.background = new THREE.Color(0x7c2d12);
      this.scene.fog = new THREE.FogExp2(0x7c2d12, 0.0068);
      this.directionalLight.position.set(-80, 14, -45);
      this.directionalLight.color.setHex(0xfb923c);
      this.directionalLight.intensity = 2.25;
      this.ambientLight.intensity = 0.35;
      this.hemisphereLight.intensity = 0.55;
      this.habLights.forEach(l => (l.intensity = 2.5));
    } else {
      this.scene.background = new THREE.Color(0x1c0a06);
      this.scene.fog = new THREE.FogExp2(0x1c0a06, 0.0062);
      this.directionalLight.position.set(-30, 45, -30);
      this.directionalLight.color.setHex(0xfdba74);
      this.directionalLight.intensity = 0.55;
      this.ambientLight.intensity = 0.22;
      this.hemisphereLight.intensity = 0.25;
      this.habLights.forEach(l => (l.intensity = 4.2));
    }
  }

  // Exact continuous terrain elevation function
  public static getElevation(x: number, z: number): number {
    const dist = Math.hypot(x, z);

    // Rolling ochre ridges and canyon slopes
    let h = Math.sin(x * 0.035) * Math.sin(z * 0.035) * 2.8;
    h += Math.cos(x * 0.07 + z * 0.05) * 1.4;

    // Smooth landing site around [0, 0]
    if (dist < 16) {
      h *= (dist / 16);
    }

    // Elevated ridge crest around [14, -10]
    const dRidge = Math.hypot(x - 14, z + 10);
    if (dRidge < 16) {
      h += Math.cos((dRidge / 16) * Math.PI * 0.5) * 3.2;
    }

    // Delta terraces around [20, 16]
    const dDelta = Math.hypot(x - 20, z - 16);
    if (dDelta < 18) {
      h += Math.sin((dDelta / 18) * Math.PI) * 3.6;
    }

    // River channel cut around [30, -5]
    const dRiver = Math.abs((x - 30) * 0.8 + (z + 5) * 0.6);
    if (dRiver < 8) {
      h -= (8 - dRiver) * 0.45;
    }

    // Volcanic crag around [32, 28]
    const dSher = Math.hypot(x - 32, z - 28);
    if (dSher < 14) {
      h += Math.cos((dSher / 14) * Math.PI * 0.5) * 4.2;
    }

    // Flattened Space Shuttle Landing Pad apron at SHUTTLE_PADS.mars
    const pad = SHUTTLE_PADS.mars;
    const dPad = Math.hypot(x - pad.x, z - pad.z);
    if (dPad < 11.5) {
      const padBase = 1.2;
      const t = Math.max(0, Math.min(1, (dPad - 7.5) / 4.0));
      h = padBase * (1 - t) + h * t;
    }

    // Flattened museum landing aprons for all 9 Mars & Sky-Exhibit zones
    const sites = Object.values(MARS_ALL_SITES);
    for (let i = 0; i < sites.length; i++) {
      const site = sites[i];
      const ds = Math.hypot(x - site.x, z - site.z);
      if (ds < site.clearRadius + 2.5) {
        const flatH = 0.8 + (i % 2) * 0.25;
        const blend = Math.max(0, Math.min(1, (ds - (site.clearRadius - 1.5)) / 4.0));
        h = flatH * (1 - blend) + h * blend;
      }
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
      let y = MarsWorld.getElevation(x, z);
      // Seamless spherical horizon curvature roll-off far beyond open Martian plains
      if (r > 430) {
        y -= Math.pow(r - 430, 2) / 500;
      }
      pos.setY(i, y);
    }
    geo.computeVertexNormals();

    const terrainColorMap = ProceduralTextures.getMarsTexture().clone();
    terrainColorMap.wrapS = THREE.RepeatWrapping;
    terrainColorMap.wrapT = THREE.RepeatWrapping;
    terrainColorMap.repeat.set(24, 24);
    terrainColorMap.anisotropy = 8;
    terrainColorMap.needsUpdate = true;

    const terrainBumpMap = ProceduralTextures.getRegolithBumpTexture('mars').clone();
    terrainBumpMap.wrapS = THREE.RepeatWrapping;
    terrainBumpMap.wrapT = THREE.RepeatWrapping;
    terrainBumpMap.repeat.set(24, 24);
    terrainBumpMap.anisotropy = 8;
    terrainBumpMap.needsUpdate = true;

    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.04,
      map: terrainColorMap,
      bumpMap: terrainBumpMap,
      bumpScale: 0.45
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;

    // True 3D Spherical Planetary Globe Body underneath (visible on high altitude ascent)
    const globeRadius = 1100;
    const globeGeo = new THREE.SphereGeometry(globeRadius, 64, 48);
    const globeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.04,
      map: ProceduralTextures.getMarsTexture(),
      bumpMap: ProceduralTextures.getRegolithBumpTexture('mars'),
      bumpScale: 0.35
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    globeMesh.position.set(0, -globeRadius, 0);
    this.scene.add(globeMesh);

    return mesh;
  }

  // Solid obstacle colliders aligned strictly with natural Martian boulders
  public getSolidObstacles(): CylinderObstacle[] {
    return this.solidObstaclesCache;
  }

  // Mountain cone colliders covering Mount Sharp, shoulders, and crater rim peaks
  public getMountainObstacles(): MountainConeObstacle[] {
    return this.mountainObstaclesCache;
  }

  private buildSkyAndMountains() {
    // Phobos (irregular potato-shaped moon)
    const phobosGeo = new THREE.DodecahedronGeometry(2.2);
    const phobosMat = new THREE.MeshBasicMaterial({ color: 0xd6d3d1 });
    const phobos = new THREE.Mesh(phobosGeo, phobosMat);
    phobos.position.set(70, 62, -85);
    this.scene.add(phobos);

    // Towering Mount Sharp / Jezero Crater Rim Mountains in the background
    const mountainMatNear = new THREE.MeshStandardMaterial({
      color: 0x8c3b2b,
      roughness: 0.96,
      metalness: 0.03
    });
    const mountainMatFar = new THREE.MeshStandardMaterial({
      color: 0x703437, // Dusty mauve-violet atmospheric scattering on distant peaks
      roughness: 0.98,
      metalness: 0.02
    });

    // Iconic towering left peak
    const mainPeakGeo = new THREE.ConeGeometry(42, 46, 9);
    const mainPeak = new THREE.Mesh(mainPeakGeo, mountainMatNear);
    mainPeak.position.set(-48, 21, -78);
    mainPeak.rotation.y = 0.4;
    this.scene.add(mainPeak);
    this.mountainObstaclesCache.push({ x: -48, z: -78, baseRadius: 42, height: 46, baseY: -2 });

    // Secondary ridge shoulder
    const shoulderGeo = new THREE.ConeGeometry(34, 28, 8);
    const shoulder = new THREE.Mesh(shoulderGeo, mountainMatNear);
    shoulder.position.set(-18, 12, -82);
    this.scene.add(shoulder);
    this.mountainObstaclesCache.push({ x: -18, z: -82, baseRadius: 34, height: 28, baseY: -2 });

    // Distant jagged range on the right horizon
    const farPeakGeo = new THREE.ConeGeometry(38, 32, 8);
    const farPeak = new THREE.Mesh(farPeakGeo, mountainMatFar);
    farPeak.position.set(28, 14, -92);
    this.scene.add(farPeak);
    this.mountainObstaclesCache.push({ x: 28, z: -92, baseRadius: 38, height: 32, baseY: -2 });

    // Open-World Scenic Martian Mountains & Mesas (wide open valleys — zero closed wall trap!)
    const outerMesas = [
      { x: 155, z: 120, w: 32, h: 28 },
      { x: -165, z: 135, w: 34, h: 30 },
      { x: 215, z: -110, w: 36, h: 32 },
      { x: -245, z: -40, w: 38, h: 34 },
      { x: 285, z: 185, w: 46, h: 42 },
      { x: -290, z: 220, w: 44, h: 36 },
      { x: 120, z: -290, w: 48, h: 44 },
      { x: -140, z: -310, w: 46, h: 40 },
      { x: 355, z: -20, w: 42, h: 34 },
      { x: -45, z: 330, w: 40, h: 32 }
    ];
    outerMesas.forEach((mesa, i) => {
      const baseY = -1.5;
      const m = new THREE.Mesh(
        new THREE.ConeGeometry(mesa.w, mesa.h, 8),
        i % 2 === 0 ? mountainMatNear : mountainMatFar
      );
      m.position.set(mesa.x, baseY + mesa.h * 0.5, mesa.z);
      m.rotation.y = i * 0.9;
      this.scene.add(m);
      this.mountainObstaclesCache.push({
        x: mesa.x,
        z: mesa.z,
        baseRadius: mesa.w,
        height: mesa.h,
        baseY
      });
    });
  }

  private buildInstancedMartianRocks() {
    // 1. 640 Dark Angular Basaltic Pebbles & Float Rocks scattered across inner and outer Martian dunes
    const smallCount = 640;
    const smallGeo = new THREE.DodecahedronGeometry(0.32, 0);
    const darkBasaltMat = new THREE.MeshStandardMaterial({
      color: 0x291711,
      roughness: 0.9,
      metalness: 0.12
    });
    const smallInstanced = new THREE.InstancedMesh(smallGeo, darkBasaltMat, smallCount);
    smallInstanced.castShadow = true;
    smallInstanced.receiveShadow = true;

    const sites = Object.values(MARS_ALL_SITES);
    const isNearClearedMarsZone = (rx: number, rz: number) =>
      sites.some(s => Math.hypot(rx - s.x, rz - s.z) < s.clearRadius);

    const dummy = new THREE.Object3D();
    for (let i = 0; i < smallCount; i++) {
      const seed = i * 137.508;
      const r = i < 420 ? 3.5 + ((i * 19) % 85) : 95 + ((i * 47) % 280);
      let x = Math.cos(seed) * r;
      let z = Math.sin(seed) * r;
      if (isNearClearedMarsZone(x, z)) {
        x = -x;
        z = -z;
      }
      const y = MarsWorld.getElevation(x, z);

      const sx = 0.35 + ((i * 11) % 9) * 0.14;
      const sy = 0.25 + ((i * 7) % 7) * 0.12;
      const sz = 0.35 + ((i * 13) % 9) * 0.14;

      dummy.position.set(x, y + sy * 0.18, z);
      dummy.rotation.set(i * 0.7, i * 1.3, i * 0.5);
      dummy.scale.set(sx, sy, sz);
      dummy.updateMatrix();
      smallInstanced.setMatrixAt(i, dummy.matrix);
    }
    smallInstanced.instanceMatrix.needsUpdate = true;
    this.scene.add(smallInstanced);

    // 2. 65 Large Eroded Ventifact Boulders & Outcrops
    const largeCount = 65;
    const largeGeo = new THREE.DodecahedronGeometry(0.95, 1);
    const ochreBoulderMat = new THREE.MeshStandardMaterial({
      color: 0x5c2818,
      roughness: 0.92,
      metalness: 0.08
    });
    const largeInstanced = new THREE.InstancedMesh(largeGeo, ochreBoulderMat, largeCount);
    largeInstanced.castShadow = true;
    largeInstanced.receiveShadow = true;

    const pad = SHUTTLE_PADS.mars;
    for (let i = 0; i < largeCount; i++) {
      const seed = i * 89.23;
      const r = 7 + ((i * 23) % 58);
      let x = Math.cos(seed) * r;
      let z = Math.sin(seed) * r;
      if (Math.hypot(x - pad.x, z - pad.z) < 9.5 || isNearClearedMarsZone(x, z)) {
        x = -x * 0.4;
        z = -z * 0.4;
      }
      if (isNearClearedMarsZone(x, z)) {
        x = 0;
        z = 12;
      }
      const y = MarsWorld.getElevation(x, z);

      const sx = 0.7 + (i % 5) * 0.32;
      const sy = 0.55 + (i % 4) * 0.25;
      const sz = 0.7 + (i % 6) * 0.28;

      dummy.position.set(x, y + sy * 0.35, z);
      dummy.rotation.set(i * 0.3, i * 0.9, i * 0.2);
      dummy.scale.set(sx, sy, sz);
      dummy.updateMatrix();
      largeInstanced.setMatrixAt(i, dummy.matrix);

      // Register large Martian boulders into solid collision cache
      this.solidObstaclesCache.push({
        x,
        z,
        radius: Math.max(sx, sz) * 0.8,
        height: sy * 1.4,
        baseY: y
      });
    }
    largeInstanced.instanceMatrix.needsUpdate = true;
    this.scene.add(largeInstanced);
  }

  private buildShuttlePadMarker() {
    // Dedicated Mars Space Shuttle Landing Pad Marker at SHUTTLE_PADS.mars
    const pad = SHUTTLE_PADS.mars;
    const padMarkerGeo = new THREE.RingGeometry(5.5, 6.1, 32);
    padMarkerGeo.rotateX(-Math.PI / 2);
    const padMarker = new THREE.Mesh(
      padMarkerGeo,
      new THREE.MeshBasicMaterial({ color: 0xf97316, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
    );
    padMarker.position.set(pad.x, MarsWorld.getElevation(pad.x, pad.z) + 0.08, pad.z);
    this.scene.add(padMarker);
  }

  public update(_delta: number, _time: number) {
    // Clean natural Martian terrain; future educational resources can be integrated here.
  }
}
