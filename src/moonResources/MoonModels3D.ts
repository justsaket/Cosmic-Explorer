import * as THREE from 'three';
import { ProceduralTextures } from '../scene/ProceduralTextures';

export interface ApolloLM3DHandle {
  group: THREE.Group;
  descentStageGroup: THREE.Group;
  ascentStageGroup: THREE.Group;
  setExplodeProgress: (t: number) => void;
  setHighlight: (part: 'descent' | 'ascent' | 'easep' | 'engine' | 'legs' | null) => void;
  setAscentFlightState: (altitudeMeters: number, engineOn: boolean) => void;
  setStaticSurfaceMode: (descentOnly: boolean) => void;
}

export interface SaturnV3DHandle {
  group: THREE.Group;
  setStageSeparation: (t: number) => void;
}

export interface Lrv3DHandle {
  group: THREE.Group;
  setDeployProgress: (t: number) => void;
  setDrivePose: (steerRad: number, wheelSpinRad: number) => void;
  setCrewSeated: (seated: boolean) => void;
  setSampleCount: (count: number) => void;
  setHighlight: (part: string | null) => void;
}

export interface Alsep3DHandle {
  group: THREE.Group;
  setDeployProgress: (t: number) => void;
  setRtgCutaway: (open: boolean) => void;
  setHighlight: (part: string | null) => void;
  animateTelemetry: (elapsedSec: number, pulseActive: boolean) => void;
}

export interface Retroreflector3DHandle {
  group: THREE.Group;
  setLaserProgress: (progress01: number | null) => void;
}

export interface Surveyor3DHandle {
  group: THREE.Group;
  setMirrorAngles: (panRad: number, tiltRad: number) => void;
  setSamplerPose: (reach01: number, depth01: number, yawRad: number) => void;
  setVernierThrust: (intensity: number) => void;
  setRecoveryState: (componentsRecovered: boolean) => void;
  setHighlight: (part: string | null) => void;
}

function makeMat(
  color: number,
  metalness: number,
  roughness: number,
  emissive: number = 0x000000,
  emissiveIntensity: number = 0
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    metalness,
    roughness,
    emissive,
    emissiveIntensity
  });
}

function makeGoldFoilMat(metalness = 0.72, roughness = 0.28): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: ProceduralTextures.getGoldFoilTexture(),
    metalness,
    roughness
  });
}

function makeSolarMat(metalness = 0.55, roughness = 0.22): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: ProceduralTextures.getSolarPanelTexture(),
    metalness,
    roughness
  });
}

function addContactShadow(parent: THREE.Object3D, radius: number, y = 0.015) {
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 24),
    new THREE.MeshBasicMaterial({
      color: 0x030508,
      transparent: true,
      opacity: 0.4,
      depthWrite: false
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = y;
  parent.add(shadow);
}

function setEmissiveRecursive(root: THREE.Object3D, hex: number, intensity: number) {
  root.traverse(obj => {
    if (obj instanceof THREE.Mesh && obj.material instanceof THREE.MeshStandardMaterial) {
      if (obj.userData.baseEmissive === undefined) {
        obj.userData.baseEmissive = obj.material.emissive.getHex();
        obj.userData.baseEmissiveInt = obj.material.emissiveIntensity;
      }
      if (intensity > 0) {
        obj.material.emissive.setHex(hex);
        obj.material.emissiveIntensity = intensity;
      } else {
        obj.material.emissive.setHex(obj.userData.baseEmissive);
        obj.material.emissiveIntensity = obj.userData.baseEmissiveInt;
      }
    }
  });
}

/**
 * 1. Apollo Lunar Module (Eagle / Intrepid / Falcon):
 * Authentic two-stage design where the lower Descent Stage stays permanently on the Moon
 * as a launch platform, and only the upper Ascent Stage ignites & rises.
 */
export function createApolloLunarModule3D(options?: {
  nameTag?: 'eagle' | 'intrepid' | 'falcon';
  scale?: number;
}): ApolloLM3DHandle {
  const scale = options?.scale ?? 1.0;
  const group = new THREE.Group();
  group.scale.setScalar(scale);

  const goldFoilMat = makeGoldFoilMat();
  const copperFoilMat = makeMat(0xb45309, 0.72, 0.28);
  const silverAlumMat = makeMat(0xdbe2ea, 0.62, 0.34);
  const darkThermalMat = makeMat(0x1e293b, 0.42, 0.72);
  const cabinWhiteMat = makeMat(0xcbd5e1, 0.35, 0.52);
  const nozzleMat = makeMat(0x334155, 0.68, 0.44);

  // ---------------- DESCENT STAGE ----------------
  const descentStageGroup = new THREE.Group();
  addContactShadow(descentStageGroup, 3.05, 0.015);

  // Octagonal Descent Chassis
  const bodyOct = new THREE.Mesh(
    new THREE.CylinderGeometry(1.72, 1.78, 1.28, 8),
    goldFoilMat.clone()
  );
  bodyOct.position.y = 1.62;
  bodyOct.rotation.y = Math.PI / 8;
  bodyOct.castShadow = true;
  bodyOct.receiveShadow = true;
  descentStageGroup.add(bodyOct);

  // Interstage Upper Launch Platform Deck & Blast Deflector Collar
  const launchDeck = new THREE.Mesh(
    new THREE.CylinderGeometry(1.66, 1.72, 0.14, 8),
    silverAlumMat.clone()
  );
  launchDeck.position.y = 2.31;
  launchDeck.rotation.y = Math.PI / 8;
  launchDeck.castShadow = true;
  descentStageGroup.add(launchDeck);

  const blastDeflector = new THREE.Mesh(
    new THREE.ConeGeometry(0.95, 0.36, 12),
    darkThermalMat.clone()
  );
  blastDeflector.position.y = 2.46;
  descentStageGroup.add(blastDeflector);

  // Descent Engine Bell (LMDE) underneath
  const descentEngineBell = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.62, 0.92, 16, 1, true),
    nozzleMat.clone()
  );
  descentEngineBell.material.side = THREE.DoubleSide;
  descentEngineBell.position.y = 0.72;
  descentStageGroup.add(descentEngineBell);

  // Forward Porch & 9-Rung Climb Ladder
  const porch = new THREE.Mesh(
    new THREE.BoxGeometry(0.96, 0.08, 0.65),
    silverAlumMat.clone()
  );
  porch.position.set(0, 2.28, 1.88);
  descentStageGroup.add(porch);

  const ladderGroup = new THREE.Group();
  const railGeo = new THREE.CylinderGeometry(0.024, 0.024, 1.55, 6);
  const railL = new THREE.Mesh(railGeo, silverAlumMat.clone());
  railL.position.set(-0.22, 1.48, 2.12);
  railL.rotation.x = 0.22;
  const railR = railL.clone();
  railR.position.x = 0.22;
  ladderGroup.add(railL, railR);
  for (let i = 0; i < 6; i++) {
    const rung = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.44, 6),
      silverAlumMat.clone()
    );
    rung.rotation.z = Math.PI / 2;
    rung.position.set(0, 0.82 + i * 0.24, 2.26 - i * 0.052);
    ladderGroup.add(rung);
  }
  descentStageGroup.add(ladderGroup);

  // Side Equipment / EASEP MESA Storage Bay
  const easepBayGroup = new THREE.Group();
  const bayFrame = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.72, 0.16),
    copperFoilMat.clone()
  );
  bayFrame.position.set(1.48, 1.62, -0.58);
  bayFrame.rotation.y = Math.PI / 4;
  easepBayGroup.add(bayFrame);
  const plaque = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.2, 0.04),
    silverAlumMat.clone()
  );
  plaque.position.set(0, 1.65, 1.76);
  easepBayGroup.add(plaque);
  descentStageGroup.add(easepBayGroup);

  // Four Shock-Absorbing Landing Legs & Saucer Footpads grounded cleanly at y = 0
  const legsGroup = new THREE.Group();
  const legAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
  legAngles.forEach(ang => {
    const legAssembly = new THREE.Group();
    legAssembly.rotation.y = ang;

    // Main primary diagonal strut (chassis outer corner (1.58, 2.1) -> footpad (2.72, 0.08))
    const primaryStrut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.075, 2.34, 8),
      goldFoilMat.clone()
    );
    primaryStrut.position.set(2.14, 1.12, 0);
    primaryStrut.rotation.z = 0.51;
    primaryStrut.castShadow = true;
    legAssembly.add(primaryStrut);

    // Upper A-frame brace struts
    const braceL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 1.38, 6),
      darkThermalMat.clone()
    );
    braceL.position.set(1.9, 1.24, 0.34);
    braceL.rotation.z = 1.04;
    braceL.rotation.y = -0.28;
    const braceR = braceL.clone();
    braceR.position.z = -0.34;
    braceR.rotation.y = 0.28;
    legAssembly.add(braceL, braceR);

    // Saucer footpad resting flat at y = 0
    const footpad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.46, 0.54, 0.12, 14),
      goldFoilMat.clone()
    );
    footpad.position.set(2.74, 0.06, 0);
    footpad.castShadow = true;
    footpad.receiveShadow = true;
    legAssembly.add(footpad);

    // Surface Contact Probe Wire hanging off footpad
    const probe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.42, 6),
      silverAlumMat.clone()
    );
    probe.position.set(3.02, 0.21, 0);
    probe.rotation.z = -0.25;
    legAssembly.add(probe);

    legsGroup.add(legAssembly);
  });
  descentStageGroup.add(legsGroup);

  // ---------------- ASCENT STAGE ----------------
  const ascentStageGroup = new THREE.Group();
  const baseAscentY = 2.42;
  ascentStageGroup.position.y = baseAscentY;

  // Main Asymmetric Pressurized Crew Cabin
  const cabinCenter = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, 1.52, 1.72),
    cabinWhiteMat.clone()
  );
  cabinCenter.position.set(0, 0.92, 0.16);
  cabinCenter.castShadow = true;
  ascentStageGroup.add(cabinCenter);

  // Dark Thermal-Protected Forward Bulkhead
  const forwardMask = new THREE.Mesh(
    new THREE.BoxGeometry(1.88, 1.28, 0.45),
    darkThermalMat.clone()
  );
  forwardMask.position.set(0, 0.9, 1.02);
  forwardMask.castShadow = true;
  ascentStageGroup.add(forwardMask);

  // Two Angled Crew Windows with Soft Interior Cockpit Glow
  const winMat = makeMat(0x0f172a, 0.9, 0.12, 0x38bdf8, 0.48);
  const winL = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.34, 0.08), winMat);
  winL.position.set(-0.48, 1.12, 1.24);
  winL.rotation.set(-0.18, 0.18, -0.06);
  const winR = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.34, 0.08), winMat.clone());
  winR.position.set(0.48, 1.12, 1.24);
  winR.rotation.set(-0.18, -0.18, 0.06);
  ascentStageGroup.add(winL, winR);

  // Forward Egress Hatch
  const hatch = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.62, 0.1),
    silverAlumMat.clone()
  );
  hatch.position.set(0, 0.54, 1.22);
  ascentStageGroup.add(hatch);

  // Side Oxygen/Helium Cylindrical Saddle Tanks + Aft Equipment Section
  const aftEquip = new THREE.Mesh(
    new THREE.CylinderGeometry(0.86, 0.9, 1.38, 10),
    darkThermalMat.clone()
  );
  aftEquip.position.set(0, 0.92, -0.88);
  aftEquip.rotation.z = Math.PI / 2;
  aftEquip.castShadow = true;
  ascentStageGroup.add(aftEquip);

  const sidePodL = new THREE.Mesh(
    new THREE.CylinderGeometry(0.54, 0.54, 1.15, 8),
    silverAlumMat.clone()
  );
  sidePodL.rotation.x = Math.PI / 2;
  sidePodL.position.set(-1.12, 0.92, -0.15);
  const sidePodR = sidePodL.clone();
  sidePodR.position.x = 1.12;
  ascentStageGroup.add(sidePodL, sidePodR);

  // Upper Docking Tunnel & Collar
  const dockingCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.48, 0.56, 0.32, 14),
    silverAlumMat.clone()
  );
  dockingCollar.position.set(0, 1.82, 0.05);
  ascentStageGroup.add(dockingCollar);

  // 4 RCS Thruster Quads at Upper Corners
  const rcsOffsets: [number, number, number][] = [
    [-1.18, 1.38, 0.95],
    [1.18, 1.38, 0.95],
    [-1.18, 1.38, -0.72],
    [1.18, 1.38, -0.72]
  ];
  rcsOffsets.forEach(([rx, ry, rz]) => {
    const boom = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.24), darkThermalMat.clone());
    boom.position.set(rx, ry, rz);
    ascentStageGroup.add(boom);
    for (let j = 0; j < 2; j++) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.16, 8), silverAlumMat.clone());
      cone.position.set(rx, ry + (j === 0 ? 0.14 : -0.14), rz);
      if (j === 1) cone.rotation.x = Math.PI;
      ascentStageGroup.add(cone);
    }
  });

  // Steerable S-Band Parabolic Dish & Rendezvous Radar
  const dishMast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.55, 6), silverAlumMat.clone());
  dishMast.position.set(0.75, 1.88, 0.6);
  const sbandDish = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.08, 0.18, 14),
    silverAlumMat.clone()
  );
  sbandDish.position.set(0.75, 2.15, 0.6);
  sbandDish.rotation.x = Math.PI / 3;
  ascentStageGroup.add(dishMast, sbandDish);

  // Ascent Propulsion Bell & Hypergolic Plume (hidden until ignition)
  const ascentBell = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.42, 0.55, 12, 1, true),
    nozzleMat.clone()
  );
  ascentBell.material.side = THREE.DoubleSide;
  ascentBell.position.set(0, 0.08, 0);
  ascentStageGroup.add(ascentBell);

  const flameMat = new THREE.MeshBasicMaterial({
    color: 0xfef08a,
    transparent: true,
    opacity: 0.92
  });
  const ascentFlame = new THREE.Mesh(new THREE.ConeGeometry(0.46, 2.4, 14), flameMat);
  ascentFlame.rotation.x = Math.PI;
  ascentFlame.position.set(0, -1.25, 0);
  ascentFlame.visible = false;
  ascentStageGroup.add(ascentFlame);

  const flameGlow = new THREE.PointLight(0xfbbf24, 0, 14);
  flameGlow.position.set(0, -0.8, 0);
  ascentStageGroup.add(flameGlow);

  group.add(descentStageGroup);
  group.add(ascentStageGroup);

  let currentExplode = 0;
  let currentAscentAlt = 0;

  return {
    group,
    descentStageGroup,
    ascentStageGroup,
    setExplodeProgress: (t: number) => {
      currentExplode = Math.max(0, Math.min(1, t));
      ascentStageGroup.position.y = baseAscentY + currentExplode * 2.45 + currentAscentAlt;
      descentStageGroup.position.y = 0;
    },
    setHighlight: part => {
      setEmissiveRecursive(descentStageGroup, 0x000000, 0);
      setEmissiveRecursive(ascentStageGroup, 0x000000, 0);
      if (part === 'descent') setEmissiveRecursive(descentStageGroup, 0xf59e0b, 0.45);
      else if (part === 'ascent') setEmissiveRecursive(ascentStageGroup, 0x38bdf8, 0.45);
      else if (part === 'easep') setEmissiveRecursive(easepBayGroup, 0x10b981, 0.75);
      else if (part === 'engine') setEmissiveRecursive(descentEngineBell, 0xf97316, 0.75);
      else if (part === 'legs') setEmissiveRecursive(legsGroup, 0xfbbf24, 0.55);
    },
    setAscentFlightState: (altitudeMeters: number, engineOn: boolean) => {
      currentAscentAlt = altitudeMeters;
      descentStageGroup.position.y = 0; // Descent stage stays locked to lunar ground!
      ascentStageGroup.position.y = baseAscentY + currentExplode * 2.45 + altitudeMeters;
      ascentFlame.visible = engineOn;
      if (engineOn) {
        const flicker = 0.85 + Math.sin(performance.now() * 0.03) * 0.25;
        ascentFlame.scale.set(1, flicker, 1);
        flameGlow.intensity = 4.2 * flicker;
      } else {
        flameGlow.intensity = 0;
      }
    },
    setStaticSurfaceMode: (descentOnly: boolean) => {
      ascentStageGroup.visible = !descentOnly;
      blastDeflector.visible = true;
    }
  };
}

/**
 * 2. Apollo Command & Service Module (Columbia / CSM)
 */
export function createApolloColumbiaCSM3D(): THREE.Group {
  const csm = new THREE.Group();
  const hullSilver = makeMat(0xcbd5e1, 0.78, 0.26);
  const cmHeatShield = makeMat(0x1e293b, 0.45, 0.62);
  const goldTrim = makeMat(0xeab308, 0.85, 0.24);
  const bellMat = makeMat(0x334155, 0.75, 0.42);

  // Command Module (Conical reentry capsule)
  const cmCone = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 1.15, 1.5, 20), hullSilver);
  cmCone.position.y = 2.05;
  csm.add(cmCone);

  // Service Module Cylinder
  const smBody = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 2.35, 20), hullSilver);
  smBody.position.y = 0.15;
  csm.add(smBody);

  // Radiator & Gold Instrument Band
  const band = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.18, 0.42, 20), goldTrim);
  band.position.y = 0.75;
  csm.add(band);

  // Heatshield ring between CM and SM
  const shield = new THREE.Mesh(new THREE.CylinderGeometry(1.17, 1.17, 0.14, 20), cmHeatShield);
  shield.position.y = 1.3;
  csm.add(shield);

  // SPS Main Engine Bell
  const sps = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.72, 1.25, 16, 1, true), bellMat);
  sps.material.side = THREE.DoubleSide;
  sps.position.y = -1.6;
  csm.add(sps);

  // High-Gain 4-Dish S-Band Array
  const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 6), hullSilver);
  boom.rotation.z = Math.PI / 2;
  boom.position.set(1.5, -0.75, 0);
  csm.add(boom);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.06, 0.1, 10), goldTrim);
    dish.position.set(1.98, -0.75 + Math.cos(a) * 0.24, Math.sin(a) * 0.24);
    dish.rotation.z = -Math.PI / 2;
    csm.add(dish);
  }

  return csm;
}

/**
 * 3. Saturn V + Columbia CSM + Eagle LM Three-Part Stack
 */
export function createSaturnV3D(): SaturnV3DHandle {
  const group = new THREE.Group();
  const whiteHull = makeMat(0xf1f5f9, 0.28, 0.56);
  const blackBand = makeMat(0x0f172a, 0.32, 0.65);
  const metalGrey = makeMat(0x475569, 0.78, 0.36);

  const s1Group = new THREE.Group();
  const s1Body = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.92, 2.8, 16), whiteHull);
  s1Body.position.y = 1.4;
  const s1FinRing = new THREE.Mesh(new THREE.CylinderGeometry(0.93, 0.93, 0.75, 16), blackBand);
  s1FinRing.position.y = 0.45;
  s1Group.add(s1Body, s1FinRing);
  for (let i = 0; i < 4; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.65, 0.06), whiteHull);
    const ang = (i / 4) * Math.PI * 2;
    fin.position.set(Math.cos(ang) * 1.04, 0.38, Math.sin(ang) * 1.04);
    fin.rotation.y = -ang;
    const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.45, 10), metalGrey);
    nozzle.position.set(Math.cos(ang) * 0.48, -0.15, Math.sin(ang) * 0.48);
    s1Group.add(fin, nozzle);
  }
  const centerNozzle = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.45, 10), metalGrey);
  centerNozzle.position.y = -0.15;
  s1Group.add(centerNozzle);

  const s2Group = new THREE.Group();
  const s2Body = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.88, 2.1, 16), whiteHull);
  s2Body.position.y = 3.85;
  const s2Black = new THREE.Mesh(new THREE.CylinderGeometry(0.89, 0.89, 0.28, 16), blackBand);
  s2Black.position.y = 2.95;
  s2Group.add(s2Body, s2Black);

  const lmMiniature = createApolloLunarModule3D({ scale: 0.28 }).group;
  lmMiniature.position.set(0, 5.1, 0);

  const csmGroup = createApolloColumbiaCSM3D();
  csmGroup.scale.setScalar(0.45);
  csmGroup.position.set(0, 6.2, 0);

  group.add(s1Group, s2Group, lmMiniature, csmGroup);

  return {
    group,
    setStageSeparation: t => {
      const s = Math.max(0, Math.min(1, t));
      s1Group.position.y = -s * 1.6;
      s2Group.position.y = -s * 0.35;
      lmMiniature.position.y = 5.1 + s * 1.1;
      csmGroup.position.y = 6.2 + s * 2.4;
    }
  };
}

/**
 * 4. Lunar Roving Vehicle (Apollo LRV-1 / 2 / 3):
 * Hinged folding chassis, 4 wire-mesh hub-motor wheels, dual-axle steering,
 * twin 36V front batteries, T-handle console, crew seats + astronauts, dish & sample rack.
 */
export function createLunarRovingVehicle3D(): Lrv3DHandle {
  const group = new THREE.Group();
  addContactShadow(group, 1.45, 0.015);

  const goldMat = makeGoldFoilMat();
  const alumMat = makeMat(0xe2e8f0, 0.65, 0.32);
  const darkMeshMat = makeMat(0x334155, 0.65, 0.58);
  const orangeFenderMat = makeMat(0xf97316, 0.28, 0.65);
  const batteryMat = makeMat(0x0ea5e9, 0.62, 0.38, 0x0284c7, 0.12);
  const seatMat = makeMat(0x64748b, 0.3, 0.78);
  const suitMat = makeMat(0xf8fafc, 0.2, 0.72);
  const visorMat = makeMat(0xf59e0b, 0.95, 0.12);

  // Main Center Frame (2.3m wheelbase proportions scaled ~1.0)
  const centerFrameGroup = new THREE.Group();
  const mainDeck = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.14, 1.32), goldMat.clone());
  mainDeck.position.y = 0.54;
  mainDeck.castShadow = true;
  centerFrameGroup.add(mainDeck);

  // Console & T-Handle Control Post
  const consoleGroup = new THREE.Group();
  const consolePost = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.52, 0.22), alumMat.clone());
  consolePost.position.set(0, 0.86, 0.38);
  consolePost.rotation.x = -0.18;
  const displayFace = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.24, 0.04),
    makeMat(0x0f172a, 0.7, 0.25, 0x38bdf8, 0.35)
  );
  displayFace.position.set(0, 0.98, 0.28);
  const tHandleStem = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.28, 8), alumMat.clone());
  tHandleStem.position.set(0, 0.88, 0.18);
  tHandleStem.rotation.x = -0.25;
  const tHandleBar = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.24, 8), goldMat.clone());
  tHandleBar.rotation.z = Math.PI / 2;
  tHandleBar.position.set(0, 1.0, 0.14);
  consoleGroup.add(consolePost, displayFace, tHandleStem, tHandleBar);
  centerFrameGroup.add(consoleGroup);

  // Two Webbed Crew Seats (hinge flat when folded)
  const seatsGroup = new THREE.Group();
  seatsGroup.position.set(0, 0.62, -0.32);
  [-0.44, 0.44].forEach(sx => {
    const pan = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.08, 0.52), seatMat.clone());
    pan.position.set(sx, 0.04, 0.15);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.58, 0.07), seatMat.clone());
    back.position.set(sx, 0.34, -0.12);
    back.rotation.x = -0.15;
    seatsGroup.add(pan, back);
  });
  centerFrameGroup.add(seatsGroup);

  // Two Seated Suit Crew Figures
  const crewGroup = new THREE.Group();
  [-0.44, 0.44].forEach(sx => {
    const astro = new THREE.Group();
    astro.position.set(sx, 0.68, -0.18);
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.48, 0.24), suitMat.clone());
    torso.position.y = 0.28;
    const plss = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.42, 0.18), suitMat.clone());
    plss.position.set(0, 0.3, -0.18);
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), suitMat.clone());
    helmet.position.set(0, 0.64, 0.02);
    const visor = new THREE.Mesh(new THREE.SphereGeometry(0.145, 12, 12, 0, Math.PI), visorMat.clone());
    visor.position.set(0, 0.64, 0.06);
    const legs = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.14, 0.44), suitMat.clone());
    legs.position.set(0, 0.08, 0.22);
    astro.add(torso, plss, helmet, visor, legs);
    crewGroup.add(astro);
  });
  centerFrameGroup.add(crewGroup);

  // Forward Hinged Chassis (Batteries + High-Gain Umbrella Dish + TV Camera)
  const frontChassisGroup = new THREE.Group();
  frontChassisGroup.position.set(0, 0.54, 0.66);

  const frontDeck = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.16, 0.92), goldMat.clone());
  frontDeck.position.set(0, 0, 0.48);
  frontChassisGroup.add(frontDeck);

  // Twin 36-Volt Silver-Zinc Batteries in front bay
  const batteriesGroup = new THREE.Group();
  [-0.36, 0.36].forEach(bx => {
    const batt = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.28, 0.58), batteryMat.clone());
    batt.position.set(bx, 0.18, 0.48);
    batteriesGroup.add(batt);
  });
  frontChassisGroup.add(batteriesGroup);

  // Gold-Mesh High-Gain Umbrella Dish + TV Camera
  const commsGroup = new THREE.Group();
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.72, 8), alumMat.clone());
  mast.position.set(-0.28, 0.5, 0.65);
  const dishRib = new THREE.Mesh(
    new THREE.ConeGeometry(0.48, 0.26, 12, 1, true),
    goldMat.clone()
  );
  dishRib.material.side = THREE.DoubleSide;
  dishRib.position.set(-0.28, 0.92, 0.65);
  dishRib.rotation.x = Math.PI * 0.78;
  const tvCam = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.32), alumMat.clone());
  tvCam.position.set(0.32, 0.58, 0.78);
  commsGroup.add(mast, dishRib, tvCam);
  frontChassisGroup.add(commsGroup);

  // Aft Hinged Chassis (Sample Rack & Genesis Rock Collection Boxes)
  const aftChassisGroup = new THREE.Group();
  aftChassisGroup.position.set(0, 0.54, -0.66);

  const aftDeck = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.14, 0.84), goldMat.clone());
  aftDeck.position.set(0, 0, -0.44);
  aftChassisGroup.add(aftDeck);

  const sampleRackGroup = new THREE.Group();
  const rackFrame = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.36, 0.52), alumMat.clone());
  rackFrame.position.set(0, 0.25, -0.46);
  sampleRackGroup.add(rackFrame);

  const sampleBoxes: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const rockBox = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.14, 0),
      makeMat(0x94a3b8, 0.15, 0.85)
    );
    rockBox.position.set(-0.32 + i * 0.32, 0.48, -0.46);
    rockBox.visible = false;
    sampleBoxes.push(rockBox);
    sampleRackGroup.add(rockBox);
  }
  aftChassisGroup.add(sampleRackGroup);

  // 4 Steerable Wire-Mesh Wheels (Front Left, Front Right, Rear Left, Rear Right)
  interface WheelRig {
    pivot: THREE.Group;
    spinGroup: THREE.Group;
    isFront: boolean;
    sideSign: number;
  }
  const wheelRigs: WheelRig[] = [];
  const allWheelsGroup = new THREE.Group();

  const wheelDefs: { x: number; z: number; isFront: boolean; parent: THREE.Group }[] = [
    { x: -0.92, z: 0.48, isFront: true, parent: frontChassisGroup },
    { x: 0.92, z: 0.48, isFront: true, parent: frontChassisGroup },
    { x: -0.92, z: -0.46, isFront: false, parent: aftChassisGroup },
    { x: 0.92, z: -0.46, isFront: false, parent: aftChassisGroup }
  ];

  wheelDefs.forEach(wd => {
    const pivot = new THREE.Group();
    pivot.position.set(wd.x, -0.14, wd.z);

    // Suspension wishbone arm
    const sideSign = Math.sign(wd.x);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.08, 0.12), alumMat.clone());
    arm.position.set(-sideSign * 0.16, 0.12, 0);
    arm.rotation.z = -sideSign * 0.25;
    pivot.add(arm);

    // Fiberglass Dust Fender
    const fender = new THREE.Mesh(
      new THREE.CylinderGeometry(0.46, 0.46, 0.26, 14, 1, true, 0, Math.PI),
      orangeFenderMat.clone()
    );
    fender.material.side = THREE.DoubleSide;
    fender.rotation.z = Math.PI / 2;
    fender.rotation.x = Math.PI / 2;
    fender.position.y = 0.06;
    pivot.add(fender);

    // Rotating Wire-Mesh Wheel
    const spinGroup = new THREE.Group();
    const tire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 0.22, 18),
      darkMeshMat.clone()
    );
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    const hubCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.16, 0.25, 12),
      goldMat.clone()
    );
    hubCap.rotation.z = Math.PI / 2;
    spinGroup.add(tire, hubCap);

    // Chevron spokes so wheel rotation is super obvious!
    for (let s = 0; s < 6; s++) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.76), alumMat.clone());
      spoke.rotation.x = (s / 6) * Math.PI;
      spinGroup.add(spoke);
    }

    pivot.add(spinGroup);
    wd.parent.add(pivot);
    wheelRigs.push({ pivot, spinGroup, isFront: wd.isFront, sideSign });
  });

  group.add(centerFrameGroup, frontChassisGroup, aftChassisGroup, allWheelsGroup);

  return {
    group,
    setDeployProgress: t => {
      const p = Math.max(0, Math.min(1, t));
      // When folded (p=0): front and aft fold upward like clamshell, seats fold down, crew hidden
      const foldAngle = (1 - p) * 1.48;
      frontChassisGroup.rotation.x = -foldAngle;
      aftChassisGroup.rotation.x = foldAngle;
      seatsGroup.scale.y = Math.max(0.18, p);
      commsGroup.scale.setScalar(Math.max(0.1, p));
      crewGroup.visible = p > 0.92;
      group.position.y = (1 - p) * 0.45;
    },
    setDrivePose: (steerRad, wheelSpinRad) => {
      wheelRigs.forEach(w => {
        // Dual front + rear counter-steering!
        w.pivot.rotation.y = w.isFront ? steerRad : -steerRad * 0.72;
        w.spinGroup.rotation.x = wheelSpinRad;
      });
    },
    setCrewSeated: seated => {
      crewGroup.visible = seated;
    },
    setSampleCount: count => {
      sampleBoxes.forEach((b, idx) => {
        b.visible = idx < count;
      });
    },
    setHighlight: part => {
      setEmissiveRecursive(group, 0x000000, 0);
      if (part === 'lrv_batteries') setEmissiveRecursive(batteriesGroup, 0x38bdf8, 0.65);
      else if (part === 'lrv_controls') setEmissiveRecursive(consoleGroup, 0x38bdf8, 0.65);
      else if (part === 'lrv_comms') setEmissiveRecursive(commsGroup, 0xfbbf24, 0.65);
      else if (part === 'lrv_samples') setEmissiveRecursive(sampleRackGroup, 0x10b981, 0.65);
      else if (part === 'lrv_wheels' || part === 'lrv_steering') {
        wheelRigs.forEach(w => setEmissiveRecursive(w.spinGroup, 0xf59e0b, 0.55));
      }
    }
  };
}

/**
 * 5. Apollo 12 ALSEP Station (Central Station + SNAP-27 RTG + All 6 Instruments):
 * - PSE (Passive Seismic Experiment)
 * - LSM (Lunar Surface Magnetometer)
 * - SWS (Solar Wind Spectrometer)
 * - SIDE (Suprathermal Ion Detector Experiment)
 * - CCIG (Cold Cathode Ion Gauge)
 * - LDD (Lunar Dust Detector)
 */
export function createAlsepStation3D(): Alsep3DHandle {
  const group = new THREE.Group();
  addContactShadow(group, 1.15, 0.015);

  const whiteMat = makeMat(0xf1f5f9, 0.35, 0.5);
  const goldMat = makeGoldFoilMat();
  const darkMetal = makeMat(0x1e293b, 0.72, 0.42);
  const rtgFinMat = makeMat(0x0f172a, 0.68, 0.52);
  const puMat = makeMat(0xf97316, 0.75, 0.35, 0xea580c, 0.65);
  const cableMat = makeMat(0xf59e0b, 0.3, 0.6, 0xf59e0b, 0.15);

  const partGroups: Record<string, THREE.Group> = {};
  const pulseDots: { mesh: THREE.Mesh; start: THREE.Vector3; end: THREE.Vector3 }[] = [];

  // ---- CENTRAL STATION ----
  const centralGroup = new THREE.Group();
  const csBase = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.55, 0.78), whiteMat.clone());
  csBase.position.y = 0.32;
  csBase.castShadow = true;
  const sunshield = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.05, 0.94), goldMat.clone());
  sunshield.position.y = 0.64;
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 1.35, 8), whiteMat.clone());
  mast.position.set(0, 1.32, 0);
  const helicalDish = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.56, 12), goldMat.clone());
  helicalDish.position.set(0.15, 2.02, -0.1);
  helicalDish.rotation.set(-0.35, 0, -0.2);
  centralGroup.add(csBase, sunshield, mast, helicalDish);
  group.add(centralGroup);
  partGroups.central = centralGroup;

  // Skyward Telemetry Beam (toward Earth)
  const skyBeamMat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    transparent: true,
    opacity: 0.32
  });
  const skyBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.28, 7.5, 12, 1, true), skyBeamMat);
  skyBeam.position.set(0.85, 5.4, -0.7);
  skyBeam.rotation.set(-0.22, 0, -0.22);
  centralGroup.add(skyBeam);

  // ---- SNAP-27 RTG + Pu-238 Capsule ----
  const snapGroup = new THREE.Group();
  snapGroup.position.set(-2.4, 0, 1.8);
  const rtgBody = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.68, 12), rtgFinMat.clone());
  rtgBody.position.y = 0.42;
  snapGroup.add(rtgBody);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.64, 0.22), darkMetal.clone());
    fin.position.set(Math.cos(a) * 0.28, 0.42, Math.sin(a) * 0.28);
    fin.rotation.y = -a;
    snapGroup.add(fin);
  }
  const puCapsule = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.44, 12), puMat.clone());
  puCapsule.position.y = 0.56;
  snapGroup.add(puCapsule);
  group.add(snapGroup);
  partGroups.snap27 = snapGroup;

  // Helper to connect cable + pulse dot from Central Station to module
  const addCableTo = (tx: number, tz: number) => {
    const dist = Math.hypot(tx, tz);
    const cable = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.02, dist), cableMat.clone());
    cable.position.set(tx * 0.5, 0.02, tz * 0.5);
    cable.rotation.y = Math.atan2(tx, tz);
    group.add(cable);

    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x34d399 })
    );
    dot.position.set(tx, 0.08, tz);
    group.add(dot);
    pulseDots.push({
      mesh: dot,
      start: new THREE.Vector3(tx, 0.08, tz),
      end: new THREE.Vector3(0, 0.14, 0)
    });
  };

  addCableTo(-2.4, 1.8);

  // 1. PSE (Passive Seismic Experiment)
  const pseGroup = new THREE.Group();
  pseGroup.position.set(3.2, 0, 1.8);
  const pseSkirt = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.72, 0.14, 16), goldMat.clone());
  pseSkirt.position.y = 0.07;
  const pseCylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.52, 16), whiteMat.clone());
  pseCylinder.position.y = 0.34;
  pseGroup.add(pseSkirt, pseCylinder);
  group.add(pseGroup);
  partGroups.pse = pseGroup;
  addCableTo(3.2, 1.8);

  // 2. LSM (Lunar Surface Magnetometer - 3 orthogonal boom arms)
  const lsmGroup = new THREE.Group();
  lsmGroup.position.set(-3.4, 0, -2.2);
  const lsmHub = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.32, 0.38), whiteMat.clone());
  lsmHub.position.y = 0.35;
  lsmGroup.add(lsmHub);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.3;
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.15, 6), goldMat.clone());
    arm.position.set(Math.cos(a) * 0.45, 0.65, Math.sin(a) * 0.45);
    arm.rotation.set(Math.sin(a) * 0.65, 0, -Math.cos(a) * 0.65);
    const sensor = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.16, 8), darkMetal.clone());
    sensor.position.set(Math.cos(a) * 0.78, 0.96, Math.sin(a) * 0.78);
    lsmGroup.add(arm, sensor);
  }
  group.add(lsmGroup);
  partGroups.lsm = lsmGroup;
  addCableTo(-3.4, -2.2);

  // 3. SWS (Solar Wind Spectrometer - octagonal 7-cup turret)
  const swsGroup = new THREE.Group();
  swsGroup.position.set(2.8, 0, -2.2);
  const swsBase = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.24, 0.48), goldMat.clone());
  swsBase.position.y = 0.14;
  const swsDome = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 0.22, 7), whiteMat.clone());
  swsDome.position.y = 0.36;
  swsGroup.add(swsBase, swsDome);
  group.add(swsGroup);
  partGroups.sws = swsGroup;
  addCableTo(2.8, -2.2);

  // 4. SIDE (Suprathermal Ion Detector)
  const sideGroup = new THREE.Group();
  sideGroup.position.set(-1.6, 0, -3.2);
  const sideBox = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.56, 0.34), whiteMat.clone());
  sideBox.position.y = 0.3;
  const sideAperture = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.18, 10), goldMat.clone());
  sideAperture.position.set(0, 0.64, 0);
  sideGroup.add(sideBox, sideAperture);
  group.add(sideGroup);
  partGroups.side = sideGroup;
  addCableTo(-1.6, -3.2);

  // 5. CCIG (Cold Cathode Ion Gauge)
  const ccigGroup = new THREE.Group();
  ccigGroup.position.set(0.4, 0, -3.4);
  const ccigProbe = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.34, 10), darkMetal.clone());
  ccigProbe.position.y = 0.2;
  const ccigRim = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.03, 8, 16), goldMat.clone());
  ccigRim.rotation.x = Math.PI / 2;
  ccigRim.position.y = 0.34;
  ccigGroup.add(ccigProbe, ccigRim);
  group.add(ccigGroup);
  partGroups.ccig = ccigGroup;
  addCableTo(0.4, -3.4);

  // 6. LDD (Lunar Dust Detector)
  const lddGroup = new THREE.Group();
  lddGroup.position.set(1.4, 0, 3.0);
  const lddStand = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.32), whiteMat.clone());
  lddStand.position.y = 0.14;
  const lddSolarPanel = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.04, 0.24),
    makeSolarMat()
  );
  lddSolarPanel.position.y = 0.28;
  lddSolarPanel.rotation.x = 0.22;
  lddGroup.add(lddStand, lddSolarPanel);
  group.add(lddGroup);
  partGroups.ldd = lddGroup;
  addCableTo(1.4, 3.0);

  return {
    group,
    setDeployProgress: t => {
      const p = Math.max(0, Math.min(1, t));
      Object.entries(partGroups).forEach(([key, g]) => {
        if (key === 'central') {
          g.scale.setScalar(0.4 + 0.6 * p);
        } else {
          g.scale.setScalar(Math.max(0.05, p));
        }
      });
    },
    setRtgCutaway: open => {
      puCapsule.position.y = open ? 1.15 : 0.56;
      rtgBody.material.transparent = open;
      rtgBody.material.opacity = open ? 0.38 : 1.0;
    },
    setHighlight: part => {
      Object.values(partGroups).forEach(g => setEmissiveRecursive(g, 0x000000, 0));
      if (part && partGroups[part]) {
        setEmissiveRecursive(partGroups[part], 0x10b981, 0.65);
      }
    },
    animateTelemetry: (elapsedSec, pulseActive) => {
      skyBeam.visible = pulseActive;
      if (pulseActive) {
        skyBeamMat.opacity = 0.2 + 0.22 * (0.5 + 0.5 * Math.sin(elapsedSec * 5.0));
      }
      pulseDots.forEach((pd, i) => {
        pd.mesh.visible = pulseActive;
        if (pulseActive) {
          const u = (elapsedSec * 0.8 + i * 0.17) % 1;
          pd.mesh.position.lerpVectors(pd.start, pd.end, u);
        }
      });
    }
  };
}

/**
 * 6. Passive Laser Ranging Retroreflector (Apollo 11 EASEP / 14 / 15)
 */
export function createLaserRetroreflector3D(): Retroreflector3DHandle {
  const group = new THREE.Group();
  const frameMat = makeMat(0xe2e8f0, 0.8, 0.32);
  const prismMat = makeMat(0x38bdf8, 0.92, 0.08, 0x0ea5e9, 0.35);

  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.38, 0.32, 6), frameMat);
  stand.position.y = 0.16;
  const panel = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.12, 0.65), frameMat);
  panel.position.y = 0.42;
  panel.rotation.x = -0.58;
  group.add(stand, panel);

  for (let r = -2; r <= 2; r++) {
    for (let c = -1; c <= 1; c++) {
      const prism = new THREE.Mesh(new THREE.OctahedronGeometry(0.055, 0), prismMat);
      prism.position.set(r * 0.14, 0.47 - c * 0.08, 0.05 + c * 0.12);
      panel.add(prism);
    }
  }

  const laserLineMat = new THREE.MeshBasicMaterial({
    color: 0x22c55e,
    transparent: true,
    opacity: 0.78
  });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 28, 8), laserLineMat);
  beam.position.set(2.5, 11.2, -5.2);
  beam.rotation.set(0.45, 0, -0.2);
  beam.visible = false;

  const pulseOrb = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0x4ade80 })
  );
  pulseOrb.visible = false;
  group.add(beam, pulseOrb);

  return {
    group,
    setLaserProgress: progress01 => {
      if (progress01 === null) {
        beam.visible = false;
        pulseOrb.visible = false;
        return;
      }
      beam.visible = true;
      pulseOrb.visible = true;
      const start = new THREE.Vector3(5.0, 22.0, -10.4);
      const target = new THREE.Vector3(0, 0.48, 0);
      if (progress01 <= 0.5) {
        pulseOrb.position.lerpVectors(start, target, progress01 / 0.5);
      } else {
        pulseOrb.position.lerpVectors(target, start, (progress01 - 0.5) / 0.5);
      }
    }
  };
}

/**
 * 7. Surveyor 3 Robotic Lander (1967 Bouncing Soft Landing + Surface Sampler + 25/100mm TV Camera)
 */
export function createSurveyor3Lander3D(): Surveyor3DHandle {
  const group = new THREE.Group();
  addContactShadow(group, 1.65, 0.015);

  const alumMat = makeMat(0xe2e8f0, 0.65, 0.34);
  const goldMat = makeGoldFoilMat();
  const darkMat = makeMat(0x1e293b, 0.58, 0.48);
  const solarMat = makeSolarMat();

  // Triangular Aluminum Mast Frame & 3 Crushable Honeycomb Footpads at y = 0
  const legsGroup = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
    const legArm = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.65, 8), alumMat.clone());
    legArm.position.set(Math.cos(a) * 0.92, 0.52, Math.sin(a) * 0.92);
    legArm.rotation.set(Math.sin(a) * 0.92, 0, -Math.cos(a) * 0.92);
    legArm.castShadow = true;

    const footpad = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.1, 14), goldMat.clone());
    footpad.position.set(Math.cos(a) * 1.48, 0.05, Math.sin(a) * 1.48);
    footpad.castShadow = true;

    const vernierFlame = new THREE.Mesh(
      new THREE.ConeGeometry(0.14, 0.85, 10),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.85 })
    );
    vernierFlame.rotation.x = Math.PI;
    vernierFlame.position.set(Math.cos(a) * 0.55, 0.05, Math.sin(a) * 0.55);
    vernierFlame.name = 'vernierFlame';
    vernierFlame.visible = false;

    legsGroup.add(legArm, footpad, vernierFlame);
  }
  group.add(legsGroup);

  // Retro Cavity & Thermal Compartment Box
  const engineGroup = new THREE.Group();
  const centerHub = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.62, 12), darkMat.clone());
  centerHub.position.y = 0.68;
  const thermalBox = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.52, 0.52), goldMat.clone());
  thermalBox.position.set(-0.32, 0.78, -0.25);
  engineGroup.add(centerHub, thermalBox);
  group.add(engineGroup);

  // Tall Central Mast + Solar Panel + Planar High-Gain Antenna
  const solarMast = new THREE.Group();
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.9, 8), alumMat.clone());
  mast.position.y = 1.65;
  const solarPanel = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.05, 0.75), solarMat.clone());
  solarPanel.position.set(0, 2.58, 0);
  solarPanel.rotation.x = 0.35;
  const planarAntenna = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.88, 0.04), whiteMatOrAlum());
  planarAntenna.position.set(0, 2.25, -0.35);
  planarAntenna.rotation.x = -0.32;
  solarMast.add(mast, solarPanel, planarAntenna);
  group.add(solarMast);

  function whiteMatOrAlum() {
    return makeMat(0xf8fafc, 0.3, 0.55);
  }

  // 25/100 mm Television Camera Tube + Rotating Mirror Hood
  const cameraGroup = new THREE.Group();
  cameraGroup.position.set(0.38, 1.05, 0.38);
  const camTube = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.11, 0.78, 12), alumMat.clone());
  camTube.position.y = 0.39;
  const mirrorHead = new THREE.Group();
  mirrorHead.position.y = 0.82;
  const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.24, 12), goldMat.clone());
  const lensEye = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 10, 10),
    makeMat(0x0ea5e9, 0.9, 0.1, 0x38bdf8, 0.4)
  );
  lensEye.position.z = 0.09;
  mirrorHead.add(hood, lensEye);
  cameraGroup.add(camTube, mirrorHead);
  group.add(cameraGroup);

  // Extendable Pantograph Soil Mechanics Surface Sampler Arm + Scoop
  const samplerYawPivot = new THREE.Group();
  samplerYawPivot.position.set(-0.22, 0.62, 0.45);
  const samplerArm1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.85), alumMat.clone());
  samplerArm1.position.set(0, 0, 0.42);
  const samplerArm2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.85), goldMat.clone());
  samplerArm2.position.set(0, -0.1, 0.72);
  const scoop = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.22), darkMat.clone());
  scoop.position.set(0, -0.22, 1.15);
  samplerYawPivot.add(samplerArm1, samplerArm2, scoop);
  group.add(samplerYawPivot);

  return {
    group,
    setMirrorAngles: (panRad, tiltRad) => {
      mirrorHead.rotation.y = panRad;
      lensEye.position.y = Math.sin(tiltRad) * 0.06;
    },
    setSamplerPose: (reach01, depth01, yawRad) => {
      const r = Math.max(0, Math.min(1, reach01));
      const d = Math.max(0, Math.min(1, depth01));
      samplerYawPivot.rotation.y = yawRad;
      samplerArm2.position.z = 0.42 + r * 0.52;
      scoop.position.z = 0.78 + r * 0.62;
      samplerYawPivot.rotation.x = d * 0.36;
    },
    setVernierThrust: intensity => {
      legsGroup.traverse(obj => {
        if (obj.name === 'vernierFlame' && obj instanceof THREE.Mesh) {
          obj.visible = intensity > 0.05;
          obj.scale.set(1, 0.6 + intensity * 0.9, 1);
        }
      });
    },
    setRecoveryState: componentsRecovered => {
      // Historically accurate: Apollo 12 astronauts Pete Conrad & Alan Bean removed ONLY
      // the TV camera and surface sampler components; the rest remained on the Moon.
      cameraGroup.visible = !componentsRecovered;
      samplerYawPivot.visible = !componentsRecovered;
    },
    setHighlight: part => {
      setEmissiveRecursive(group, 0x000000, 0);
      if (part === 'surv_legs') setEmissiveRecursive(legsGroup, 0xc084fc, 0.55);
      else if (part === 'surv_engine') setEmissiveRecursive(engineGroup, 0xf97316, 0.6);
      else if (part === 'surv_camera') setEmissiveRecursive(cameraGroup, 0x38bdf8, 0.65);
      else if (part === 'surv_sampler') setEmissiveRecursive(samplerYawPivot, 0x10b981, 0.65);
    }
  };
}

export interface MoonMuseumMarker3DHandle {
  group: THREE.Group;
  setLabel: (opts: {
    year: string;
    statusBadge: 'LANDED ON MOON' | 'DEPLOYED ON MOON';
    title: string;
    subtitle: string;
  }) => void;
  update: (elapsedSec: number, highlighted: boolean, distanceMeters: number) => void;
}

/**
 * 8. Floating 3D Museum Site Label + Glowing Animated Downward Arrow & Locator Beam
 * Rendered cleanly above each of the 4 Historical Moon Installations.
 */
export function createMoonMuseumMarker3D(options: {
  year: string;
  statusBadge: 'LANDED ON MOON' | 'DEPLOYED ON MOON';
  title: string;
  subtitle: string;
  accentColor: string;
  markerHeight?: number;
}): MoonMuseumMarker3DHandle {
  const height = Math.min(3.55, (options.markerHeight ?? 4.5) * 0.78);
  const accentNum = parseInt(options.accentColor.replace('#', ''), 16) || 0x38bdf8;
  const group = new THREE.Group();

  // Offscreen crisp label canvas -> Sprite
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const drawLabel = (lbl: {
    year: string;
    statusBadge: 'LANDED ON MOON' | 'DEPLOYED ON MOON';
    title: string;
    subtitle: string;
  }) => {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Outer dark slate glass panel
    const r = 28;
    const w = canvas.width - 16;
    const h = canvas.height - 16;
    ctx.beginPath();
    ctx.roundRect(8, 8, w, h, r);
    ctx.fillStyle = 'rgba(2, 6, 23, 0.90)';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = options.accentColor;
    ctx.stroke();

    // Accent header strip pill
    ctx.fillStyle = options.accentColor;
    ctx.beginPath();
    ctx.roundRect(36, 32, 290, 44, 14);
    ctx.fill();

    ctx.fillStyle = '#020617';
    ctx.font = 'bold 23px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(lbl.statusBadge, 181, 55);

    // Huge Prominent Year Stamp on Right
    ctx.fillStyle = options.accentColor;
    ctx.font = '900 72px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(lbl.year, canvas.width - 42, 24);

    // Resource Mission Title
    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 38px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(lbl.title, 36, 108, canvas.width - 72);

    // Concise Subtitle
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 25px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillText(lbl.subtitle, 36, 166, canvas.width - 72);

    // Bottom interaction cue
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 21px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillText('WALK NEARBY & PRESS [E] TO INSPECT', 36, 232);

    texture.needsUpdate = true;
  };

  drawLabel(options);

  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.position.set(0, height + 0.8, 0);
  sprite.scale.set(3.9, 1.52, 1);
  group.add(sprite);

  // Subtle vertical translucent locator beam from surface up to arrow
  const beamMat = new THREE.MeshBasicMaterial({
    color: accentNum,
    transparent: true,
    opacity: 0.16,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.24, height - 0.6, 12, 1, true),
    beamMat
  );
  beam.position.y = (height - 0.6) * 0.5 + 0.15;
  group.add(beam);

  // Animated Glowing Downward Arrow Group
  const arrowGroup = new THREE.Group();
  arrowGroup.position.set(0, height, 0);
  const arrowMat = new THREE.MeshBasicMaterial({
    color: accentNum,
    transparent: true,
    opacity: 0.94
  });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.62, 10), arrowMat);
  shaft.position.y = 0.28;
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.58, 12), arrowMat);
  tip.rotation.x = Math.PI; // Point straight downward (-Y)!
  tip.position.y = -0.22;
  const chevronRing = new THREE.Mesh(
    new THREE.RingGeometry(0.42, 0.54, 24),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.72
    })
  );
  chevronRing.rotation.x = -Math.PI / 2;
  chevronRing.position.y = -0.05;
  arrowGroup.add(shaft, tip, chevronRing);
  group.add(arrowGroup);

  return {
    group,
    setLabel: next => {
      drawLabel(next);
    },
    update: (elapsedSec, highlighted, distanceMeters) => {
      const bob = Math.sin(elapsedSec * 3.1) * 0.22;
      arrowGroup.position.y = height + bob;
      arrowGroup.rotation.y = elapsedSec * 1.1;

      const boost = highlighted ? 1.04 : 1.0;
      const distScale = Math.max(0.72, Math.min(1.30, 0.70 + distanceMeters * 0.01));
      sprite.scale.set(4.1 * distScale * boost, 1.6 * distScale * boost, 1);
      arrowGroup.scale.setScalar(highlighted ? 1.15 : 1.0);
      beamMat.opacity = highlighted ? 0.34 : 0.14;
      arrowMat.opacity = highlighted ? 1.0 : 0.86 + 0.12 * Math.sin(elapsedSec * 4.5);
    }
  };
}
