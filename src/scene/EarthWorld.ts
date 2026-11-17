import * as THREE from 'three';
import { WorldDiscoveryObject } from './MoonWorld';
import { ProceduralTextures } from './ProceduralTextures';
import { CylinderObstacle, MountainConeObstacle } from '../physics/planetaryPhysics';
import { SHUTTLE_PADS } from '../shuttle/shuttleTravelState';

export class EarthWorld {
  public scene: THREE.Scene;
  public terrainMesh: THREE.Mesh;
  public discoveryObjects: WorldDiscoveryObject[] = [];
  public directionalLight: THREE.DirectionalLight;
  public ambientLight: THREE.AmbientLight;
  public hemiLight: THREE.HemisphereLight;
  private animatedAntenna?: THREE.Group;
  private oceanMesh?: THREE.Mesh;
  private cloudGroup?: THREE.Group;
  private padFloodlights: THREE.PointLight[] = [];
  private solidObstaclesCache: CylinderObstacle[] = [];

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x2563eb); // Deep realistic sky blue
    this.scene.fog = new THREE.FogExp2(0x93c5fd, 0.0045);

    // Warm daylight with cool sky hemisphere fill
    this.ambientLight = new THREE.AmbientLight(0xdbeafe, 0.42);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x1e3a2f, 0.72);
    this.scene.add(this.hemiLight);

    this.directionalLight = new THREE.DirectionalLight(0xfffbeb, 2.8);
    this.directionalLight.position.set(60, 72, 45);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 1024;
    this.directionalLight.shadow.mapSize.height = 1024;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 260;
    const d = 70;
    this.directionalLight.shadow.camera.left = -d;
    this.directionalLight.shadow.camera.right = d;
    this.directionalLight.shadow.camera.top = d;
    this.directionalLight.shadow.camera.bottom = -d;
    this.scene.add(this.directionalLight);

    // Build Coastal Ground, Atlantic Ocean & Sky Clouds
    this.terrainMesh = this.buildTerrain();
    this.scene.add(this.terrainMesh);
    this.buildCoastalOceanAndClouds();

    // Build KSC Facilities & Space Shuttle Landing/Launch Pad
    this.buildFacilities();
    this.buildShuttlePad();

    this.solidObstaclesCache = [
      { x: -6, z: -10, radius: 2.6, height: 32, baseY: 0 },
      { x: -6, z: -6.8, radius: 3.4, height: 31, baseY: 0 },
      { x: -11, z: 7, radius: 2.1, height: 2.2, baseY: 0 },
      { x: -36, z: 12, radius: 8.8, height: 7.5, baseY: EarthWorld.getElevation(-36, 12) },
      { x: 38, z: -15, radius: 3.5, height: 14, baseY: EarthWorld.getElevation(38, -15) }
    ];
  }

  public setLightingMode(mode: 'day' | 'sunset' | 'night') {
    if (mode === 'day') {
      this.scene.background = new THREE.Color(0x2563eb);
      this.scene.fog = new THREE.FogExp2(0x93c5fd, 0.0045);
      this.directionalLight.position.set(60, 72, 45);
      this.directionalLight.color.setHex(0xfffbeb);
      this.directionalLight.intensity = 2.8;
      this.ambientLight.intensity = 0.42;
      this.padFloodlights.forEach(l => (l.intensity = 0.8));
    } else if (mode === 'sunset') {
      this.scene.background = new THREE.Color(0x7c2d12);
      this.scene.fog = new THREE.FogExp2(0xfb923c, 0.0055);
      this.directionalLight.position.set(-85, 16, -40);
      this.directionalLight.color.setHex(0xf97316);
      this.directionalLight.intensity = 2.4;
      this.ambientLight.intensity = 0.3;
      this.padFloodlights.forEach(l => (l.intensity = 2.2));
    } else {
      this.scene.background = new THREE.Color(0x020617);
      this.scene.fog = new THREE.FogExp2(0x0f172a, 0.006);
      this.directionalLight.position.set(-40, 50, -30);
      this.directionalLight.color.setHex(0x93c5fd);
      this.directionalLight.intensity = 0.55;
      this.ambientLight.intensity = 0.18;
      this.padFloodlights.forEach(l => (l.intensity = 4.5));
    }
  }

  // Exact continuous terrain elevation function
  public static getElevation(x: number, z: number): number {
    const dist = Math.hypot(x, z);

    // Central concrete launch apron & spaceship pad are flat (y = 0)
    if (dist < 32) {
      return 0;
    }

    // Gentle coastal dunes outside pad perimeter
    let h = Math.sin(x * 0.035) * Math.cos(z * 0.035) * 1.8;
    h += Math.sin(x * 0.07 + 0.5) * Math.cos(z * 0.06) * 0.8;

    const blend = Math.min(1.0, (dist - 32) / 10.0);
    return h * blend;
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
      let y = EarthWorld.getElevation(x, z);
      if (r > 430) {
        y -= Math.pow(r - 430, 2) / 500;
      }
      pos.setY(i, y);
    }
    geo.computeVertexNormals();

    // Rich Cape Canaveral Coastal Grassland & Sandy Scrub Texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#1e4620';
    ctx.fillRect(0, 0, 512, 512);

    ctx.fillStyle = '#276749';
    for (let i = 0; i < 600; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillRect(x, y, 3 + Math.random() * 7, 3 + Math.random() * 7);
    }
    ctx.fillStyle = '#3f6212';
    for (let i = 0; i < 450; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillRect(x, y, 2 + Math.random() * 4, 2 + Math.random() * 4);
    }

    const groundTex = new THREE.CanvasTexture(canvas);
    groundTex.wrapS = THREE.RepeatWrapping;
    groundTex.wrapT = THREE.RepeatWrapping;
    groundTex.repeat.set(28, 28);

    const mat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.86,
      metalness: 0.04
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;

    // True 3D Spherical Earth Globe underneath (visible on high altitude ascent)
    const globeRadius = 1100;
    const globeGeo = new THREE.SphereGeometry(globeRadius, 64, 48);
    const globeMat = new THREE.MeshStandardMaterial({
      map: ProceduralTextures.getEarthTexture(),
      roughness: 0.5,
      metalness: 0.1
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    globeMesh.position.set(0, -globeRadius, 0);
    this.scene.add(globeMesh);

    return mesh;
  }

  // Solid obstacle colliders aligned strictly with rendered Earth structures
  public getSolidObstacles(): CylinderObstacle[] {
    return this.solidObstaclesCache;
  }

  public getMountainObstacles(): MountainConeObstacle[] {
    return [];
  }

  private buildCoastalOceanAndClouds() {
    // Atlantic Ocean surrounding the Cape launch complex
    const oceanGeo = new THREE.RingGeometry(155, 520, 64);
    oceanGeo.rotateX(-Math.PI / 2);
    const oceanMat = new THREE.MeshPhysicalMaterial({
      color: 0x0369a1,
      roughness: 0.15,
      metalness: 0.1,
      clearcoat: 0.9,
      clearcoatRoughness: 0.15
    });
    this.oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    this.oceanMesh.position.y = -0.65;
    this.scene.add(this.oceanMesh);

    // Distant High-Altitude Cumulus Clouds
    this.cloudGroup = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.95,
      metalness: 0.0,
      transparent: true,
      opacity: 0.82
    });

    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const radius = 85 + (i % 3) * 22;
      const cluster = new THREE.Group();
      cluster.position.set(Math.cos(angle) * radius, 38 + (i % 4) * 5, Math.sin(angle) * radius);

      for (let p = 0; p < 4; p++) {
        const puffGeo = new THREE.SphereGeometry(4.5 + (p % 2) * 2.2, 12, 12);
        puffGeo.scale(1.8, 0.55, 1.2);
        const puff = new THREE.Mesh(puffGeo, cloudMat);
        puff.position.set((p - 1.5) * 4.2, (p % 2) * 1.1, Math.sin(p) * 2);
        cluster.add(puff);
      }
      this.cloudGroup.add(cluster);
    }
    this.scene.add(this.cloudGroup);
  }

  private buildShuttlePad() {
    // Clean, unobstructed concrete launch & landing pad for the interactive Space Shuttle
    const pad = SHUTTLE_PADS.earth;
    const shuttlePadGroup = new THREE.Group();
    shuttlePadGroup.position.set(pad.x, 0.12, pad.z);

    const concretePad = new THREE.Mesh(
      new THREE.CylinderGeometry(8.5, 9.2, 0.24, 24),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.78, metalness: 0.1 })
    );
    concretePad.receiveShadow = true;
    shuttlePadGroup.add(concretePad);

    const targetRingGeo = new THREE.RingGeometry(5.6, 6.2, 32);
    targetRingGeo.rotateX(-Math.PI / 2);
    const targetRing = new THREE.Mesh(
      targetRingGeo,
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
    );
    targetRing.position.y = 0.14;
    shuttlePadGroup.add(targetRing);

    const flood = new THREE.PointLight(0x38bdf8, 1.4, 30);
    flood.position.set(-4, 6, 4);
    shuttlePadGroup.add(flood);
    this.padFloodlights.push(flood);

    this.scene.add(shuttlePadGroup);
  }

  private buildFacilities() {
    // 1. Concrete Launch Pad Octagon Apron & Paved Roadways
    const padGeo = new THREE.CylinderGeometry(28, 29, 0.25, 12);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x3b4252,
      roughness: 0.88,
      metalness: 0.08
    });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.set(0, 0.1, 0);
    pad.receiveShadow = true;
    this.scene.add(pad);

    // Helipad / Landing Target Marking Ring on Apron
    const markRingGeo = new THREE.RingGeometry(4.2, 4.6, 32);
    markRingGeo.rotateX(-Math.PI / 2);
    const markRingMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide });
    const markRing = new THREE.Mesh(markRingGeo, markRingMat);
    markRing.position.set(0, 0.24, 4.5);
    this.scene.add(markRing);

    // Inner Launch Flame Trench Opening
    const trenchGeo = new THREE.BoxGeometry(10, 0.4, 6);
    const trenchMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const trench = new THREE.Mesh(trenchGeo, trenchMat);
    trench.position.set(-4, 0.1, -8);
    this.scene.add(trench);

    // 2. Artemis SLS Rocket & Mobile Launcher Tower (North-West of Pad)
    const towerGroup = new THREE.Group();
    towerGroup.position.set(-6, 0, -10);

    const towerGeo = new THREE.BoxGeometry(3.5, 32, 3.5);
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0xb91c1c, // NASA Gantry Red
      metalness: 0.7,
      roughness: 0.3
    });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = 16;
    tower.castShadow = true;
    towerGroup.add(tower);

    const rocketCoreGeo = new THREE.CylinderGeometry(1.8, 1.8, 26, 24);
    const rocketCoreMat = new THREE.MeshStandardMaterial({
      color: 0xc2410c, // Artemis SLS Orange Foam
      roughness: 0.38,
      metalness: 0.18
    });
    const rocketCore = new THREE.Mesh(rocketCoreGeo, rocketCoreMat);
    rocketCore.position.set(0, 13, 3.2);
    rocketCore.castShadow = true;
    towerGroup.add(rocketCore);

    const orionGeo = new THREE.ConeGeometry(1.9, 5, 24);
    const orionMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.3 });
    const orion = new THREE.Mesh(orionGeo, orionMat);
    orion.position.set(0, 28.5, 3.2);
    orion.castShadow = true;
    towerGroup.add(orion);

    const srbGeo = new THREE.CylinderGeometry(0.7, 0.7, 20, 16);
    const srbMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.25, roughness: 0.3 });

    const srbL = new THREE.Mesh(srbGeo, srbMat);
    srbL.position.set(-2.8, 10, 3.2);
    srbL.castShadow = true;
    towerGroup.add(srbL);

    const srbR = new THREE.Mesh(srbGeo, srbMat);
    srbR.position.set(2.8, 10, 3.2);
    srbR.castShadow = true;
    towerGroup.add(srbR);

    this.scene.add(towerGroup);

    // 3. Parked NASA Astrovan / Crew Transport Rover at Pad Edge (-11, 0, 7)
    const crewRover = new THREE.Group();
    crewRover.position.set(-11, 0.22, 7);
    crewRover.rotation.y = 0.45;

    const roverBody = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 1.35, 1.85),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.65, roughness: 0.22 })
    );
    roverBody.position.y = 0.95;
    roverBody.castShadow = true;
    crewRover.add(roverBody);

    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(3.24, 0.22, 1.88),
      new THREE.MeshBasicMaterial({ color: 0x0284c7 })
    );
    stripe.position.y = 0.85;
    crewRover.add(stripe);

    const windshield = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.65, 1.65),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.1 })
    );
    windshield.position.set(1.25, 1.15, 0);
    crewRover.add(windshield);

    const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.32, 16);
    wheelGeo.rotateX(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    [
      [-1.05, 0.42, 0.95],
      [1.05, 0.42, 0.95],
      [-1.05, 0.42, -0.95],
      [1.05, 0.42, -0.95]
    ].forEach(([wx, wy, wz]) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(wx, wy, wz);
      crewRover.add(w);
    });
    this.scene.add(crewRover);

    // 4. Mission Control Flight Operations Facility (West side)
    const hqGroup = new THREE.Group();
    hqGroup.position.set(-36, EarthWorld.getElevation(-36, 12), 12);

    const hqBodyGeo = new THREE.BoxGeometry(16, 7.5, 12);
    const hqMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.45, metalness: 0.35 });
    const hqBody = new THREE.Mesh(hqBodyGeo, hqMat);
    hqBody.position.y = 3.75;
    hqBody.castShadow = true;
    hqGroup.add(hqBody);

    const glassGeo = new THREE.BoxGeometry(14, 2.8, 0.4);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      roughness: 0.08,
      metalness: 0.75,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0.72
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(0, 5.1, 6.1);
    hqGroup.add(glass);

    const hqLight = new THREE.PointLight(0x38bdf8, 1.0, 28);
    hqLight.position.set(0, 6, 8);
    hqGroup.add(hqLight);
    this.padFloodlights.push(hqLight);

    this.scene.add(hqGroup);

    // 5. Deep Space Network (DSN) 70-Meter Parabolic Dish Antenna (East side)
    this.animatedAntenna = new THREE.Group();
    this.animatedAntenna.position.set(38, EarthWorld.getElevation(38, -15), -15);

    const dsnPylonGeo = new THREE.CylinderGeometry(1.5, 3.0, 9, 12);
    const dsnPylonMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
    const dsnPylon = new THREE.Mesh(dsnPylonGeo, dsnPylonMat);
    dsnPylon.position.y = 4.5;
    dsnPylon.castShadow = true;
    this.animatedAntenna.add(dsnPylon);

    const dishHead = new THREE.Group();
    dishHead.position.set(0, 9.5, 0);

    const dishGeo = new THREE.CylinderGeometry(7.0, 1.2, 2.5, 24);
    dishGeo.rotateX(Math.PI / 3);
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.9,
      roughness: 0.15
    });
    const dishMesh = new THREE.Mesh(dishGeo, dishMat);
    dishMesh.castShadow = true;
    dishHead.add(dishMesh);

    const hornGeo = new THREE.CylinderGeometry(0.2, 0.5, 3.5, 8);
    hornGeo.rotateX(Math.PI / 3);
    const horn = new THREE.Mesh(hornGeo, new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 }));
    horn.position.set(0, 1.5, 2.2);
    dishHead.add(horn);

    this.animatedAntenna.add(dishHead);
    this.scene.add(this.animatedAntenna);
  }

  public update(_delta: number, time: number) {
    if (this.animatedAntenna) {
      this.animatedAntenna.rotation.y = Math.sin(time * 0.1) * 0.25;
    }

    // Gentle cloud drift
    if (this.cloudGroup) {
      this.cloudGroup.rotation.y = time * 0.008;
    }
  }
}
