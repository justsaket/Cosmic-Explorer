import * as THREE from 'three';
import { ProceduralTextures } from '../scene/ProceduralTextures';

function makeMat(
  color: number,
  metalness: number,
  roughness: number,
  emissive = 0x000000,
  emissiveIntensity = 0
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
      color: 0x050302,
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

// ============================================================================
// Floating Historical Mars Marker Billboard + Downward Pointer Arrow
// ============================================================================
export interface MarsMuseumMarker3DHandle {
  group: THREE.Group;
  setLabel: (opts: { year: string; statusBadge: string; title: string; subtitle: string }) => void;
  update: (elapsedSec: number, highlighted: boolean, distanceMeters: number) => void;
}

export function createMarsMuseumMarker3D(options: {
  year: string;
  statusBadge: string;
  title: string;
  subtitle: string;
  accentColor: string;
  markerHeight?: number;
}): MarsMuseumMarker3DHandle {
  const group = new THREE.Group();
  const height = Math.min(3.5, (options.markerHeight ?? 4.2) * 0.8);
  const accentNum = new THREE.Color(options.accentColor).getHex();

  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 280;
  const ctx = canvas.getContext('2d')!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const drawLabel = (lbl: { year: string; statusBadge: string; title: string; subtitle: string }) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width - 16;
    const h = canvas.height - 16;
    ctx.beginPath();
    ctx.roundRect(8, 8, w, h, 26);
    ctx.fillStyle = 'rgba(15, 10, 8, 0.92)';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = options.accentColor;
    ctx.stroke();

    ctx.fillStyle = options.accentColor;
    ctx.beginPath();
    ctx.roundRect(36, 30, 310, 44, 12);
    ctx.fill();

    ctx.fillStyle = '#090d16';
    ctx.font = 'bold 22px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(lbl.statusBadge, 191, 52);

    ctx.fillStyle = options.accentColor;
    ctx.font = '900 58px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(lbl.year, canvas.width - 40, 26);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 36px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(lbl.title, 36, 104, canvas.width - 72);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '600 24px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillText(lbl.subtitle, 36, 162, canvas.width - 72);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 21px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillText('WALK NEARBY & PRESS [E] TO EXPLORE', 36, 226);

    texture.needsUpdate = true;
  };

  drawLabel(options);

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false })
  );
  sprite.position.set(0, height + 0.85, 0);
  sprite.scale.set(4.1, 1.5, 1);
  group.add(sprite);

  const beamMat = new THREE.MeshBasicMaterial({
    color: accentNum,
    transparent: true,
    opacity: 0.16,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.25, Math.max(1.2, height - 0.6), 12, 1, true),
    beamMat
  );
  beam.position.y = (height - 0.6) * 0.5 + 0.15;
  group.add(beam);

  const arrowGroup = new THREE.Group();
  arrowGroup.position.set(0, height, 0);
  const arrowMat = new THREE.MeshBasicMaterial({ color: accentNum, transparent: true, opacity: 0.94 });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.58, 10), arrowMat);
  shaft.position.y = 0.26;
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.55, 12), arrowMat);
  tip.rotation.x = Math.PI;
  tip.position.y = -0.22;
  arrowGroup.add(shaft, tip);
  group.add(arrowGroup);

  return {
    group,
    setLabel: next => drawLabel(next),
    update: (elapsedSec, highlighted, distanceMeters) => {
      arrowGroup.position.y = height + Math.sin(elapsedSec * 3.0) * 0.2;
      arrowGroup.rotation.y = elapsedSec * 1.1;
      const boost = highlighted ? 1.04 : 1.0;
      const distScale = Math.max(0.72, Math.min(1.28, 0.70 + distanceMeters * 0.01));
      sprite.scale.set(4.2 * distScale * boost, 1.55 * distScale * boost, 1);
      arrowGroup.scale.setScalar(highlighted ? 1.15 : 1.0);
      beamMat.opacity = highlighted ? 0.34 : 0.14;
    }
  };
}

// ============================================================================
// 1. Mars Pathfinder & Sojourner (1997)
// ============================================================================
export interface PathfinderSojourner3DHandle {
  group: THREE.Group;
  landerGroup: THREE.Group;
  roverGroup: THREE.Group;
  setSequencePose: (params: {
    altitudeMeters: number;
    airbagsVisible: boolean;
    petalsOpen01: number;
    rampExtended01: number;
    sojournerOffsetZ: number;
  }) => void;
  setHighlight: (part: string | null) => void;
}

export function createPathfinderAndSojourner3D(): PathfinderSojourner3DHandle {
  const group = new THREE.Group();
  const landerGroup = new THREE.Group();
  group.add(landerGroup);

  const goldFoil = makeGoldFoilMat();
  const darkSolar = makeSolarMat();
  const alumMat = makeMat(0xdbe2ea, 0.58, 0.34);
  const airbagMat = makeMat(0xead9c6, 0.1, 0.78);
  const copperMat = makeMat(0xb45309, 0.72, 0.26);
  addContactShadow(landerGroup, 1.55, 0.015);

  // Central base deck
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.15, 0.28, 6), goldFoil.clone());
  base.position.y = 0.18;
  base.castShadow = true;
  landerGroup.add(base);

  // Three articulated tetrahedral solar petals
  const petalsGroup = new THREE.Group();
  const petalPivots: THREE.Group[] = [];
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    const pivot = new THREE.Group();
    pivot.position.set(Math.sin(angle) * 0.85, 0.22, Math.cos(angle) * 0.85);
    pivot.rotation.y = angle;
    const panel = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.08, 1.18), darkSolar.clone());
    panel.position.set(0, 0.04, 0.65);
    panel.castShadow = true;
    const rim = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.1, 1.22), goldFoil.clone());
    rim.position.set(0, 0.02, 0.65);
    pivot.add(rim, panel);
    petalsGroup.add(pivot);
    petalPivots.push(pivot);
  }
  landerGroup.add(petalsGroup);

  // Deployable Forward Ramp
  const rampGroup = new THREE.Group();
  rampGroup.position.set(0, 0.22, 1.9);
  const rampMesh = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.05, 1.35), alumMat.clone());
  rampMesh.position.set(0, 0, 0.65);
  rampMesh.rotation.x = 0.16;
  rampGroup.add(rampMesh);
  landerGroup.add(rampGroup);

  // IMP Mast & High-Gain Dish
  const impGroup = new THREE.Group();
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.45, 10), alumMat.clone());
  mast.position.set(-0.28, 1.0, -0.15);
  const camHead = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.18, 0.22), darkSolar.clone());
  camHead.position.set(-0.28, 1.75, -0.15);
  const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.08, 0.14, 18), alumMat.clone());
  dish.position.set(0.32, 0.82, -0.32);
  dish.rotation.x = 0.55;
  impGroup.add(mast, camHead, dish);
  landerGroup.add(impGroup);

  // Inflatable Airbag Lobes (visible during terminal EDL)
  const airbagsGroup = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const lobe = new THREE.Mesh(new THREE.SphereGeometry(0.75, 12, 10), airbagMat.clone());
    lobe.position.set(Math.cos(a) * 1.1, 0.65, Math.sin(a) * 1.1);
    airbagsGroup.add(lobe);
  }
  airbagsGroup.visible = false;
  landerGroup.add(airbagsGroup);

  // ---- SOJOURNER 6-WHEEL ROCKER-BOGIE ROVER ----
  const roverGroup = new THREE.Group();
  roverGroup.position.set(0, 0, 3.2);
  group.add(roverGroup);
  addContactShadow(roverGroup, 0.68, 0.016);

  const webBox = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.24, 0.68), goldFoil.clone());
  webBox.position.y = 0.24;
  webBox.castShadow = true;
  roverGroup.add(webBox);

  const solarDeckGroup = new THREE.Group();
  const solarTop = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.04, 0.74), darkSolar.clone());
  solarTop.position.y = 0.38;
  solarDeckGroup.add(solarTop);
  roverGroup.add(solarDeckGroup);

  const wheelsGroup = new THREE.Group();
  const wheelMat = makeMat(0x1e293b, 0.75, 0.42);
  [-0.36, 0.36].forEach(wx => {
    [-0.28, 0, 0.28].forEach(wz => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.09, 14), wheelMat.clone());
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, 0.11, wz);
      wheel.castShadow = true;
      wheelsGroup.add(wheel);
      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.2, 6), alumMat.clone());
      strut.position.set(wx * 0.85, 0.21, wz);
      wheelsGroup.add(strut);
    });
  });
  roverGroup.add(wheelsGroup);

  const apxsGroup = new THREE.Group();
  const apxsCone = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.16, 12), copperMat.clone());
  apxsCone.rotation.x = Math.PI / 2;
  apxsCone.position.set(0, 0.22, -0.4);
  apxsGroup.add(apxsCone);
  roverGroup.add(apxsGroup);

  const commsGroup = new THREE.Group();
  const whip = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 6), alumMat.clone());
  whip.position.set(0.2, 0.62, -0.22);
  commsGroup.add(whip);
  roverGroup.add(commsGroup);

  // Named Rock Garden Boulders
  const rockMatDark = makeMat(0x33221c, 0.08, 0.9);
  const rockMatPale = makeMat(0xb69c84, 0.05, 0.92);
  const barnacle = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32, 0), rockMatDark);
  barnacle.position.set(2.8, 0.2, 1.9);
  const yogi = new THREE.Mesh(new THREE.DodecahedronGeometry(0.68, 1), rockMatDark.clone());
  yogi.position.set(-3.2, 0.42, 2.4);
  const scooby = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.16, 0.85), rockMatPale);
  scooby.position.set(0.6, 0.08, 3.6);
  group.add(barnacle, yogi, scooby);

  return {
    group,
    landerGroup,
    roverGroup,
    setSequencePose: ({ altitudeMeters, airbagsVisible, petalsOpen01, rampExtended01, sojournerOffsetZ }) => {
      landerGroup.position.y = altitudeMeters;
      airbagsGroup.visible = airbagsVisible;
      const tilt = (1 - petalsOpen01) * 1.12;
      petalPivots.forEach(p => {
        p.rotation.x = -tilt;
      });
      rampGroup.visible = rampExtended01 > 0.05;
      rampGroup.scale.z = Math.max(0.1, rampExtended01);
      roverGroup.position.z = 1.1 + sojournerOffsetZ;
      roverGroup.position.y = Math.max(0, altitudeMeters);
    },
    setHighlight: part => {
      setEmissiveRecursive(petalsGroup, 0, 0);
      setEmissiveRecursive(impGroup, 0, 0);
      setEmissiveRecursive(wheelsGroup, 0, 0);
      setEmissiveRecursive(solarDeckGroup, 0, 0);
      setEmissiveRecursive(apxsGroup, 0, 0);
      setEmissiveRecursive(commsGroup, 0, 0);
      if (part === 'soj_petals') setEmissiveRecursive(petalsGroup, 0xf97316, 0.55);
      else if (part === 'soj_imp') setEmissiveRecursive(impGroup, 0x38bdf8, 0.6);
      else if (part === 'soj_wheels') setEmissiveRecursive(wheelsGroup, 0xfbbf24, 0.65);
      else if (part === 'soj_solar') setEmissiveRecursive(solarDeckGroup, 0x38bdf8, 0.65);
      else if (part === 'soj_apxs') setEmissiveRecursive(apxsGroup, 0xf43f5e, 0.7);
      else if (part === 'soj_comms') setEmissiveRecursive(commsGroup, 0x22d3ee, 0.7);
    }
  };
}

// ============================================================================
// 2. Twin MER Rovers: Spirit & Opportunity (2004)
// ============================================================================
export interface MerRover3DHandle {
  group: THREE.Group;
  setArmExtended: (ext01: number) => void;
  setHighlight: (part: string | null) => void;
}

export function createMerRover3D(variant: 'spirit' | 'opportunity'): MerRover3DHandle {
  const group = new THREE.Group();
  addContactShadow(group, 1.25, 0.015);
  const goldFoil = makeGoldFoilMat();
  const solarMat = makeSolarMat();
  const alumMat = makeMat(0xe2e8f0, 0.62, 0.34);
  const darkMetal = makeMat(0x1e293b, 0.68, 0.44);
  const accentColor = variant === 'spirit' ? 0xf97316 : 0x38bdf8;
  const trimMat = makeMat(accentColor, 0.45, 0.38);

  const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.52, 1.15), goldFoil.clone());
  chassis.position.y = 0.62;
  chassis.castShadow = true;
  group.add(chassis);

  // Triangulated Solar Wings
  const solarGroup = new THREE.Group();
  const wingCenter = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.05, 1.38), solarMat.clone());
  wingCenter.position.y = 0.92;
  const wingTrim = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.03, 1.44), trimMat.clone());
  wingTrim.position.y = 0.89;
  solarGroup.add(wingCenter, wingTrim);
  group.add(solarGroup);

  // Rocker-bogie 6 wheels
  const wheelGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.14, 16);
  wheelGeo.rotateZ(Math.PI / 2);
  [-0.78, 0.78].forEach(wx => {
    [-0.58, 0, 0.58].forEach(wz => {
      const w = new THREE.Mesh(wheelGeo, darkMetal.clone());
      w.position.set(wx, 0.2, wz);
      w.castShadow = true;
      group.add(w);
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.46, 6), alumMat.clone());
      leg.position.set(wx * 0.82, 0.42, wz);
      group.add(leg);
    });
  });

  // Pancam / Navcam Mast
  const mastGroup = new THREE.Group();
  const mastCol = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.95, 10), alumMat.clone());
  mastCol.position.set(0.18, 1.38, 0.35);
  const headBar = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.14, 0.18), alumMat.clone());
  headBar.position.set(0.18, 1.88, 0.35);
  const eyeL = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.08, 10), darkMetal.clone());
  eyeL.rotation.x = Math.PI / 2;
  eyeL.position.set(0.06, 1.88, 0.44);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.3;
  mastGroup.add(mastCol, headBar, eyeL, eyeR);
  group.add(mastGroup);

  // Mini-TES & Magnet Targets
  const miniTesGroup = new THREE.Group();
  const mirrorBox = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.12), trimMat.clone());
  mirrorBox.position.set(0.18, 1.72, 0.35);
  miniTesGroup.add(mirrorBox);
  group.add(miniTesGroup);

  const magnetsGroup = new THREE.Group();
  const magBar = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.14), darkMetal.clone());
  magBar.position.set(-0.34, 0.98, 0.42);
  magnetsGroup.add(magBar);
  group.add(magnetsGroup);

  // 5-DOF IDD Robotic Arm + Turret (Mössbauer, APXS, MI, RAT)
  const iddGroup = new THREE.Group();
  iddGroup.position.set(-0.22, 0.55, 0.62);
  const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.62, 8), alumMat.clone());
  shoulder.rotation.x = Math.PI / 2;
  shoulder.position.z = 0.3;
  const turret = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.14, 12), goldFoil.clone());
  turret.position.set(0, -0.05, 0.64);
  iddGroup.add(shoulder, turret);
  group.add(iddGroup);

  return {
    group,
    setArmExtended: ext01 => {
      iddGroup.rotation.x = -0.35 + ext01 * 0.55;
      iddGroup.position.y = 0.55 - ext01 * 0.18;
    },
    setHighlight: part => {
      [solarGroup, mastGroup, miniTesGroup, magnetsGroup, iddGroup].forEach(g =>
        setEmissiveRecursive(g, 0, 0)
      );
      if (part === 'mer_pancam') setEmissiveRecursive(mastGroup, 0x38bdf8, 0.65);
      else if (part === 'mer_minites') setEmissiveRecursive(miniTesGroup, 0xa855f7, 0.7);
      else if (part === 'mer_magnets') setEmissiveRecursive(magnetsGroup, 0xf59e0b, 0.7);
      else if (part === 'mer_idd') setEmissiveRecursive(iddGroup, 0x10b981, 0.65);
      else if (part === 'mer_solar') setEmissiveRecursive(solarGroup, 0x38bdf8, 0.55);
    }
  };
}

// ============================================================================
// 3. Viking 1: Orbiter (Orbiting Only!) + Stationary Lander (1976)
// ============================================================================
export interface Viking1Pair3DHandle {
  group: THREE.Group;
  orbiterGroup: THREE.Group;
  landerGroup: THREE.Group;
  setSequenceState: (params: { orbiterSeparation01: number; armScoop01: number }) => void;
  setHighlight: (part: string | null) => void;
}

export function createViking1Pair3D(): Viking1Pair3DHandle {
  const group = new THREE.Group();
  const landerGroup = new THREE.Group();
  const orbiterGroup = new THREE.Group();
  group.add(landerGroup, orbiterGroup);

  const whiteThermal = makeMat(0xe2e8f0, 0.25, 0.58);
  const goldFoil = makeGoldFoilMat();
  const alumMat = makeMat(0xcbd5e1, 0.62, 0.34);
  const darkMetal = makeMat(0x1e293b, 0.68, 0.42);
  const solarMat = makeSolarMat();
  addContactShadow(landerGroup, 1.75, 0.015);

  // ---- STATIONARY 3-LEGGED LANDER ----
  const landerBody = new THREE.Mesh(
    new THREE.CylinderGeometry(1.18, 1.18, 0.48, 6),
    whiteThermal.clone()
  );
  landerBody.position.y = 0.84;
  landerBody.castShadow = true;
  landerGroup.add(landerBody);

  // 3 Landing Legs (strictly stationary!)
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3 + Math.PI / 6;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 1.15, 8), alumMat.clone());
    leg.position.set(Math.sin(a) * 1.12, 0.46, Math.cos(a) * 1.12);
    leg.rotation.z = -Math.sin(a) * 0.42;
    leg.rotation.x = Math.cos(a) * 0.42;
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.08, 12), alumMat.clone());
    pad.position.set(Math.sin(a) * 1.42, 0.04, Math.cos(a) * 1.42);
    landerGroup.add(leg, pad);
  }

  // Twin SNAP-19 RTG Windshields
  const rtgGroup = new THREE.Group();
  [-1.08, 1.08].forEach(rx => {
    const rtg = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.56, 12), darkMetal.clone());
    rtg.position.set(rx, 1.16, -0.2);
    rtgGroup.add(rtg);
  });
  landerGroup.add(rtgGroup);

  // S-Band Dish + Twin Facsimile Cameras
  const camerasGroup = new THREE.Group();
  [-0.36, 0.36].forEach(cx => {
    const cam = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.45, 12), whiteThermal.clone());
    cam.position.set(cx, 1.32, 0.36);
    camerasGroup.add(cam);
  });
  const sDish = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.06, 0.14, 18), whiteThermal.clone());
  sDish.position.set(0, 1.56, -0.45);
  sDish.rotation.x = 0.48;
  camerasGroup.add(sDish);
  landerGroup.add(camerasGroup);

  // Weather Boom & Seismometer Cap (Explicitly marked failed)
  const metSeismoGroup = new THREE.Group();
  const metMast = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.95, 8), alumMat.clone());
  metMast.position.set(-0.62, 1.52, 0.48);
  const seismoCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    makeMat(0xf43f5e, 0.35, 0.55)
  );
  seismoCap.position.set(0.62, 1.08, 0.32);
  metSeismoGroup.add(metMast, seismoCap);
  landerGroup.add(metSeismoGroup);

  // 3 m Surface Sampler Arm
  const armGroup = new THREE.Group();
  armGroup.position.set(0, 0.94, 0.72);
  const boom = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.09, 1.55), alumMat.clone());
  boom.position.z = 0.75;
  const scoop = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.24), goldFoil.clone());
  scoop.position.set(0, -0.05, 1.55);
  armGroup.add(boom, scoop);
  landerGroup.add(armGroup);

  // ---- VIKING ORBITER (NEVER LANDS) ----
  orbiterGroup.position.set(0, 3.6, -0.6);
  const orbBus = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.42, 8), goldFoil.clone());
  const orbDish = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.06, 0.16, 18), whiteThermal.clone());
  orbDish.position.set(0, 0.45, 0);
  orbiterGroup.add(orbBus, orbDish);
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 1.75), solarMat.clone());
    wing.position.set(Math.sin(a) * 1.45, 0, Math.cos(a) * 1.45);
    wing.rotation.y = a;
    orbiterGroup.add(wing);
  }

  return {
    group,
    orbiterGroup,
    landerGroup,
    setSequenceState: ({ orbiterSeparation01, armScoop01 }) => {
      orbiterGroup.position.y = 2.6 + orbiterSeparation01 * 2.2;
      armGroup.rotation.x = 0.18 + Math.sin(armScoop01 * Math.PI) * 0.28;
    },
    setHighlight: part => {
      [orbiterGroup, rtgGroup, camerasGroup, armGroup, metSeismoGroup].forEach(g =>
        setEmissiveRecursive(g, 0, 0)
      );
      if (part === 'vik_orbiter') setEmissiveRecursive(orbiterGroup, 0x38bdf8, 0.6);
      else if (part === 'vik_rtg') setEmissiveRecursive(rtgGroup, 0xeab308, 0.65);
      else if (part === 'vik_cameras') setEmissiveRecursive(camerasGroup, 0x38bdf8, 0.65);
      else if (part === 'vik_sampler') setEmissiveRecursive(armGroup, 0x10b981, 0.65);
      else if (part === 'vik_seismo') setEmissiveRecursive(metSeismoGroup, 0xf43f5e, 0.65);
    }
  };
}

// ============================================================================
// 4. Phoenix (2008 Arctic Lander) & InSight (2018 Geophysical Lander)
// ============================================================================
export interface PhoenixInsight3DHandle {
  group: THREE.Group;
  phoenixGroup: THREE.Group;
  insightGroup: THREE.Group;
  setMode: (mode: 'phoenix' | 'insight' | 'both') => void;
  setPhoenixFrostPercent: (percent0To100: number) => void;
  setHighlight: (part: string | null) => void;
}

export function createPhoenixAndInsight3D(): PhoenixInsight3DHandle {
  const group = new THREE.Group();
  const phoenixGroup = new THREE.Group();
  const insightGroup = new THREE.Group();
  group.add(phoenixGroup, insightGroup);

  const solarMat = makeSolarMat();
  const goldFoil = makeGoldFoilMat();
  const alumMat = makeMat(0xdbe2ea, 0.62, 0.34);
  const copperMat = makeMat(0xb45309, 0.72, 0.22);
  addContactShadow(phoenixGroup, 1.45, 0.015);
  addContactShadow(insightGroup, 1.45, 0.015);

  const buildCircularSolarLander = (parent: THREE.Group, bodyColor: number) => {
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.76, 0.76, 0.36, 8),
      makeMat(bodyColor, 0.55, 0.35)
    );
    body.position.y = 0.76;
    body.castShadow = true;
    parent.add(body);
    for (let i = 0; i < 3; i++) {
      const a = (i * Math.PI * 2) / 3;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.88, 8), alumMat.clone());
      leg.position.set(Math.sin(a) * 0.86, 0.42, Math.cos(a) * 0.86);
      leg.rotation.z = -Math.sin(a) * 0.45;
      leg.rotation.x = Math.cos(a) * 0.45;
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.06, 10), alumMat.clone());
      pad.position.set(Math.sin(a) * 1.1, 0.03, Math.cos(a) * 1.1);
      parent.add(leg, pad);
    }
    [-1.48, 1.48].forEach(sx => {
      const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 0.86, 0.04, 10), solarMat.clone());
      fan.position.set(sx, 0.86, 0);
      parent.add(fan);
    });
  };

  // --- PHOENIX + DODO-GOLDILOCKS ICE TRENCH ---
  buildCircularSolarLander(phoenixGroup, 0xdbe2ea);
  const phxArm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 1.45), alumMat.clone());
  phxArm.position.set(0.25, 0.78, 0.95);
  phxArm.rotation.x = 0.42;
  phoenixGroup.add(phxArm);

  const trench = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 0.06, 0.55),
    makeMat(0x271915, 0.05, 0.96)
  );
  trench.position.set(0.25, 0.02, 1.75);
  const brightIceMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    roughness: 0.3,
    metalness: 0.1,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.28,
    transparent: true,
    opacity: 0.95
  });
  const brightIce = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.04, 0.36), brightIceMat);
  brightIce.position.set(0.25, 0.06, 1.75);
  phoenixGroup.add(trench, brightIce);

  // --- INSIGHT + DEPLOYED SEIS + SHALLOW HP3 MOLE ---
  buildCircularSolarLander(insightGroup, 0xd97706);
  const insArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.3), alumMat.clone());
  insArm.position.set(-0.2, 0.78, 0.85);
  insArm.rotation.x = 0.25;
  insightGroup.add(insArm);

  const seisGroup = new THREE.Group();
  seisGroup.position.set(-0.85, 0, 1.65);
  const seisDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    copperMat.clone()
  );
  const seisApron = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.46, 0.12, 16), alumMat.clone());
  seisApron.position.y = 0.06;
  seisGroup.add(seisApron, seisDome);
  insightGroup.add(seisGroup);

  const hp3Group = new THREE.Group();
  hp3Group.position.set(0.85, 0, 1.68);
  const hp3Frame = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.36, 0.22), goldFoil.clone());
  hp3Frame.position.y = 0.18;
  const moleTip = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.025, 0.24, 10), makeMat(0xf43f5e, 0.6, 0.35));
  moleTip.position.set(0, 0.06, 0.16);
  moleTip.rotation.x = 0.35; // Partially sticking out—honestly stuck in sticky duricrust
  hp3Group.add(hp3Frame, moleTip);
  insightGroup.add(hp3Group);

  return {
    group,
    phoenixGroup,
    insightGroup,
    setMode: mode => {
      if (mode === 'phoenix') {
        phoenixGroup.visible = true;
        insightGroup.visible = false;
        phoenixGroup.position.x = 0;
      } else if (mode === 'insight') {
        phoenixGroup.visible = false;
        insightGroup.visible = true;
        insightGroup.position.x = 0;
      } else {
        phoenixGroup.visible = true;
        insightGroup.visible = true;
        phoenixGroup.position.x = -3.8;
        insightGroup.position.x = 3.8;
      }
    },
    setPhoenixFrostPercent: pct => {
      const f = Math.max(0, Math.min(1, pct / 100));
      brightIceMat.opacity = f * 0.95;
      brightIce.visible = f > 0.02;
      brightIce.scale.set(0.3 + f * 0.7, 1, 0.3 + f * 0.7);
    },
    setHighlight: part => {
      [phxArm, seisGroup, hp3Group].forEach(g => setEmissiveRecursive(g, 0, 0));
      if (part === 'phx_arm' || part === 'phx_trench') setEmissiveRecursive(phxArm, 0x22d3ee, 0.7);
      else if (part === 'ins_seis') setEmissiveRecursive(seisGroup, 0xf97316, 0.7);
      else if (part === 'ins_hp3') setEmissiveRecursive(hp3Group, 0xf43f5e, 0.7);
    }
  };
}

// ============================================================================
// 5. Ingenuity Mars Helicopter + Perseverance Carrier (2021–2024)
// ============================================================================
export interface Ingenuity3DHandle {
  group: THREE.Group;
  helicopterGroup: THREE.Group;
  setFlightPose: (params: {
    altitudeMeters: number;
    rotorSpinRad: number;
    flight72Damaged: boolean;
  }) => void;
  setHighlight: (part: string | null) => void;
}

export function createIngenuityAndPerseverance3D(): Ingenuity3DHandle {
  const group = new THREE.Group();

  const whiteBody = makeMat(0xf1f5f9, 0.35, 0.5);
  const goldFoil = makeGoldFoilMat();
  const carbonMat = makeMat(0x0f172a, 0.4, 0.45);
  const solarMat = makeSolarMat();
  const alumMat = makeMat(0xdbe2ea, 0.62, 0.34);

  // Perseverance Base Carrier Rover (parked overlooking Wright Brothers Field)
  const persy = new THREE.Group();
  persy.position.set(-3.2, 0, -1.6);
  persy.rotation.y = 0.55;
  addContactShadow(persy, 1.5, 0.015);
  const pBody = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.62, 1.9), whiteBody.clone());
  pBody.position.y = 0.78;
  pBody.castShadow = true;
  const pRtg = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.75, 10), goldFoil.clone());
  pRtg.rotation.x = 0.35;
  pRtg.position.set(0, 1.02, -1.05);
  const pMast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 10), alumMat.clone());
  pMast.position.set(0.32, 1.45, 0.65);
  const pHead = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.22, 0.24), whiteBody.clone());
  pHead.position.set(0.32, 1.92, 0.65);
  persy.add(pBody, pRtg, pMast, pHead);
  [-0.85, 0.85].forEach(wx => {
    [-0.78, 0, 0.78].forEach(wz => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.18, 14), carbonMat.clone());
      w.rotation.z = Math.PI / 2;
      w.position.set(wx, 0.26, wz);
      persy.add(w);
    });
  });
  group.add(persy);

  // Wright Brothers Field helipad marker ring
  const helipad = new THREE.Mesh(
    new THREE.RingGeometry(0.75, 0.92, 24),
    new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.7 })
  );
  helipad.rotation.x = -Math.PI / 2;
  helipad.position.y = 0.04;
  group.add(helipad);

  // ---- INGENUITY HELICOPTER (scaled slightly 1.6x for crisp readability) ----
  const helicopterGroup = new THREE.Group();
  helicopterGroup.scale.setScalar(1.6);
  group.add(helicopterGroup);

  const fuselage = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 0.26), goldFoil.clone());
  fuselage.position.y = 0.34;
  fuselage.castShadow = true;
  helicopterGroup.add(fuselage);

  const legsGroup = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.012, 0.56, 6), carbonMat.clone());
    leg.position.set(Math.cos(a) * 0.2, 0.22, Math.sin(a) * 0.2);
    leg.rotation.z = -Math.cos(a) * 0.48;
    leg.rotation.x = Math.sin(a) * 0.48;
    legsGroup.add(leg);
  }
  helicopterGroup.add(legsGroup);

  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.54, 8), carbonMat.clone());
  mast.position.y = 0.64;
  helicopterGroup.add(mast);

  // Coaxial counter-rotating 1.2 m carbon-fiber rotors
  const upperRotor = new THREE.Group();
  upperRotor.position.y = 0.82;
  const blade1 = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.015, 0.11), carbonMat.clone());
  const blade1TipDamage = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, 0.022, 0.12),
    makeMat(0xf43f5e, 0.4, 0.5)
  );
  blade1TipDamage.position.set(0.5, 0.01, 0);
  blade1TipDamage.visible = false;
  upperRotor.add(blade1, blade1TipDamage);

  const lowerRotor = new THREE.Group();
  lowerRotor.position.y = 0.72;
  const blade2 = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.015, 0.11), carbonMat.clone());
  blade2.rotation.y = Math.PI / 2;
  lowerRotor.add(blade2);
  helicopterGroup.add(upperRotor, lowerRotor);

  const topSolarPanel = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.025, 0.2), solarMat.clone());
  topSolarPanel.position.y = 0.92;
  helicopterGroup.add(topSolarPanel);

  return {
    group,
    helicopterGroup,
    setFlightPose: ({ altitudeMeters, rotorSpinRad, flight72Damaged }) => {
      helicopterGroup.position.y = Math.max(0, altitudeMeters);
      upperRotor.rotation.y = rotorSpinRad;
      lowerRotor.rotation.y = -rotorSpinRad * 1.02;
      blade1TipDamage.visible = flight72Damaged;
      blade1.rotation.z = flight72Damaged ? 0.09 : 0;
    },
    setHighlight: part => {
      [upperRotor, lowerRotor, topSolarPanel, fuselage, legsGroup].forEach(g =>
        setEmissiveRecursive(g, 0, 0)
      );
      if (part === 'ing_rotors') {
        setEmissiveRecursive(upperRotor, 0x10b981, 0.75);
        setEmissiveRecursive(lowerRotor, 0x10b981, 0.75);
      } else if (part === 'ing_solar') setEmissiveRecursive(topSolarPanel, 0x38bdf8, 0.75);
      else if (part === 'ing_core') setEmissiveRecursive(fuselage, 0xf59e0b, 0.75);
      else if (part === 'ing_legs') setEmissiveRecursive(legsGroup, 0x10b981, 0.75);
    }
  };
}

// ============================================================================
// 6. Dawn Orbiter + Vesta & Ceres Cutaways (2007–2018)
// ============================================================================
export interface DawnMission3DHandle {
  group: THREE.Group;
  dawnGroup: THREE.Group;
  targetBodyGroup: THREE.Group;
  setTargetWorld: (body: 'vesta' | 'ceres', showCutaway: boolean, ionThrustOn: boolean) => void;
  animate: (elapsedSec: number) => void;
  setHighlight: (part: string | null) => void;
}

export function createDawnAndWorlds3D(): DawnMission3DHandle {
  const group = new THREE.Group();
  const dawnGroup = new THREE.Group();
  const targetBodyGroup = new THREE.Group();
  group.add(targetBodyGroup, dawnGroup);

  const goldFoil = makeGoldFoilMat();
  const graphiteBus = makeMat(0x334155, 0.58, 0.42);
  const solarMat = makeSolarMat();
  const alumMat = makeMat(0xdbe2ea, 0.64, 0.32);

  // Target body positioned at origin, Dawn orbits above it
  const vestaGroup = new THREE.Group();
  const vestaOuter = new THREE.Mesh(
    new THREE.SphereGeometry(1.45, 22, 18),
    makeMat(0x94a3b8, 0.08, 0.88)
  );
  vestaOuter.scale.set(1.15, 0.86, 1.05); // Oblate triaxial protoplanet Vesta
  const rheasilviaCrater = new THREE.Mesh(
    new THREE.ConeGeometry(0.32, 0.35, 14),
    makeMat(0x64748b, 0.1, 0.9)
  );
  rheasilviaCrater.position.set(0, -1.24, 0);
  rheasilviaCrater.rotation.x = Math.PI;
  const vestaCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.62, 16, 14),
    makeMat(0xf97316, 0.85, 0.25, 0xf97316, 0.3)
  );
  vestaGroup.add(vestaOuter, rheasilviaCrater, vestaCore);

  const ceresGroup = new THREE.Group();
  const ceresOuter = new THREE.Mesh(
    new THREE.SphereGeometry(1.55, 24, 20),
    makeMat(0x64748b, 0.1, 0.86)
  );
  const occatorSalt1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 10, 10),
    makeMat(0xf8fafc, 0.2, 0.3, 0xe0f2fe, 0.45)
  );
  occatorSalt1.position.set(0.62, 0.58, 1.28);
  const ahunaMons = new THREE.Mesh(
    new THREE.ConeGeometry(0.24, 0.34, 10),
    makeMat(0x94a3b8, 0.15, 0.78)
  );
  ahunaMons.position.set(-0.78, -0.35, 1.32);
  ahunaMons.rotation.x = 1.2;
  const ceresIceMantle = new THREE.Mesh(
    new THREE.SphereGeometry(0.88, 16, 14),
    makeMat(0x38bdf8, 0.4, 0.25, 0x0284c7, 0.25)
  );
  ceresGroup.add(ceresOuter, occatorSalt1, ahunaMons, ceresIceMantle);
  targetBodyGroup.add(vestaGroup, ceresGroup);
  targetBodyGroup.position.y = 1.6;

  // Dawn Spacecraft (20 m wide wings scaled proportionally)
  const bus = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.56, 0.68), graphiteBus);
  const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.08, 0.12, 16), alumMat);
  dish.rotation.x = Math.PI / 2;
  dish.position.set(0, 0, 0.42);
  const wingL = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.04, 0.68), solarMat);
  wingL.position.set(-1.62, 0, 0);
  const wingR = wingL.clone();
  wingR.position.x = 1.62;
  const rcsTanks = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.42, 10), goldFoil);
  rcsTanks.position.set(0, 0.36, 0);

  const ionGroup = new THREE.Group();
  const thruster = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.22, 12), alumMat);
  thruster.rotation.x = Math.PI / 2;
  thruster.position.set(0, 0, -0.45);
  const plumeMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.78
  });
  const plume = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.95, 14), plumeMat);
  plume.rotation.x = -Math.PI / 2;
  plume.position.set(0, 0, -0.95);
  ionGroup.add(thruster, plume);

  dawnGroup.add(bus, dish, wingL, wingR, rcsTanks, ionGroup);
  dawnGroup.position.set(0, 4.1, 0);

  return {
    group,
    dawnGroup,
    targetBodyGroup,
    setTargetWorld: (body, showCutaway, ionThrustOn) => {
      vestaGroup.visible = body === 'vesta';
      ceresGroup.visible = body === 'ceres';
      (vestaOuter.material as THREE.MeshStandardMaterial).wireframe = showCutaway;
      (ceresOuter.material as THREE.MeshStandardMaterial).wireframe = showCutaway;
      plume.visible = ionThrustOn;
    },
    animate: elapsedSec => {
      targetBodyGroup.rotation.y = elapsedSec * 0.25;
      const orbA = elapsedSec * 0.55;
      dawnGroup.position.set(Math.cos(orbA) * 2.55, 2.2 + Math.sin(orbA * 0.5) * 0.4, Math.sin(orbA) * 2.55);
      dawnGroup.rotation.y = -orbA;
    },
    setHighlight: part => {
      [ionGroup, wingL, wingR, rcsTanks, dish].forEach(g => setEmissiveRecursive(g, 0, 0));
      if (part === 'dawn_ion') setEmissiveRecursive(ionGroup, 0x38bdf8, 0.75);
      else if (part === 'dawn_solar') {
        setEmissiveRecursive(wingL, 0x38bdf8, 0.65);
        setEmissiveRecursive(wingR, 0x38bdf8, 0.65);
      } else if (part === 'dawn_hydrazine') setEmissiveRecursive(rcsTanks, 0xf59e0b, 0.75);
      else if (part === 'dawn_science') setEmissiveRecursive(dish, 0x22d3ee, 0.75);
    }
  };
}

// ============================================================================
// 7. Pioneer 10 & 11 + Interactive Golden Plaque + Outer Giants (1972–1979+)
// ============================================================================
export interface Pioneer3DHandle {
  group: THREE.Group;
  spacecraftGroup: THREE.Group;
  plaqueGroup: THREE.Group;
  setMode: (mode: 'spacecraft' | 'plaque' | 'flyby', planet?: 'jupiter' | 'saturn') => void;
  animate: (elapsedSec: number) => void;
  setHighlight: (part: string | null) => void;
}

export function createPioneer3D(): Pioneer3DHandle {
  const group = new THREE.Group();
  const spacecraftGroup = new THREE.Group();
  const plaqueGroup = new THREE.Group();
  const flybyGroup = new THREE.Group();
  group.add(spacecraftGroup, plaqueGroup, flybyGroup);

  const whiteDish = makeMat(0xf1f5f9, 0.35, 0.48);
  const goldFoil = makeGoldFoilMat();
  const alumMat = makeMat(0xcbd5e1, 0.65, 0.32);
  const darkRtg = makeMat(0x1e293b, 0.62, 0.45);

  // ---- PIONEER 10/11 SPACECRAFT ----
  spacecraftGroup.position.y = 1.9;
  const dish = new THREE.Mesh(new THREE.CylinderGeometry(1.42, 0.22, 0.35, 24), whiteDish);
  dish.rotation.x = Math.PI / 2;
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.38, 6), goldFoil.clone());
  hub.rotation.x = Math.PI / 2;
  hub.position.z = -0.35;
  spacecraftGroup.add(dish, hub);

  const rtgBooms = new THREE.Group();
  [-1, 1].forEach(dir => {
    const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.9, 8), alumMat.clone());
    boom.rotation.z = Math.PI / 2;
    boom.position.set(dir * 1.15, 0, -0.35);
    const canister1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.36, 10), darkRtg.clone());
    canister1.position.set(dir * 2.05, 0.14, -0.35);
    const canister2 = canister1.clone();
    canister2.position.y = -0.14;
    rtgBooms.add(boom, canister1, canister2);
  });
  spacecraftGroup.add(rtgBooms);

  const magBoomGroup = new THREE.Group();
  const magBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.5, 8), alumMat.clone());
  magBoom.rotation.x = Math.PI / 2;
  magBoom.position.set(0, -0.8, -1.35);
  magBoomGroup.add(magBoom);
  spacecraftGroup.add(magBoomGroup);

  const smallPlaque = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.03), goldFoil.clone());
  smallPlaque.position.set(0, -0.25, -0.58);
  spacecraftGroup.add(smallPlaque);

  // ---- DEDICATED INSPECTABLE PIONEER GOLDEN PLAQUE (CanvasTexture) ----
  const pCanvas = document.createElement('canvas');
  pCanvas.width = 768;
  pCanvas.height = 512;
  const ctx = pCanvas.getContext('2d')!;
  ctx.fillStyle = '#d4af37';
  ctx.fillRect(0, 0, 768, 512);
  ctx.strokeStyle = '#4a3706';
  ctx.lineWidth = 4;
  ctx.strokeRect(14, 14, 740, 484);

  // 1. Hydrogen 21-cm transition diagram (top-left)
  ctx.beginPath();
  ctx.arc(105, 90, 32, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(215, 90, 32, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#3a2b04';
  ctx.font = 'bold 20px monospace';
  ctx.fillText('H (21cm)', 118, 148);

  // 2. 14-Pulsar Sun Map (left-center)
  const cx = 185;
  const cy = 290;
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const len = 55 + (i % 4) * 28;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, 8, 0, Math.PI * 2);
  ctx.fill();

  // 3. Human Scale Silhouettes + Pioneer Dish behind (right)
  ctx.strokeRect(505, 110, 195, 250);
  ctx.fillText('HUMAN SCALE', 540, 96);
  ctx.beginPath();
  ctx.arc(560, 175, 16, 0, Math.PI * 2); // figure 1 head
  ctx.moveTo(560, 191);
  ctx.lineTo(560, 275);
  ctx.lineTo(540, 340);
  ctx.moveTo(560, 275);
  ctx.lineTo(580, 340);
  ctx.moveTo(535, 225);
  ctx.lineTo(585, 225);
  ctx.arc(635, 185, 15, 0, Math.PI * 2); // figure 2 head
  ctx.moveTo(635, 200);
  ctx.lineTo(635, 278);
  ctx.lineTo(620, 340);
  ctx.moveTo(635, 278);
  ctx.lineTo(650, 340);
  ctx.stroke();

  // 4. Solar System Trajectory Bar (bottom)
  ctx.beginPath();
  ctx.moveTo(52, 438);
  ctx.lineTo(710, 438);
  ctx.stroke();
  [70, 120, 165, 210, 265, 360, 465, 560, 640].forEach((px, idx) => {
    ctx.beginPath();
    ctx.arc(px, 438, idx === 4 ? 18 : idx === 5 ? 14 : 6, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillText('SUN  E  -> JUPITER / SATURN TRAJECTORY', 220, 480);

  const plaqueTex = new THREE.CanvasTexture(pCanvas);
  plaqueTex.colorSpace = THREE.SRGBColorSpace;
  const plaquePlate = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 2.4, 0.1),
    new THREE.MeshStandardMaterial({ map: plaqueTex, metalness: 0.78, roughness: 0.22 })
  );
  plaquePlate.position.y = 1.9;
  plaqueGroup.add(plaquePlate);
  plaqueGroup.visible = false;

  // ---- JUPITER & SATURN FLYBY TARGETS ----
  const jupiter = new THREE.Mesh(
    new THREE.SphereGeometry(1.35, 24, 18),
    makeMat(0xd97706, 0.08, 0.8)
  );
  jupiter.position.set(0, 1.8, 0);
  const saturnGrp = new THREE.Group();
  saturnGrp.position.set(0, 1.8, 0);
  const satBody = new THREE.Mesh(
    new THREE.SphereGeometry(1.12, 22, 18),
    makeMat(0xfde68a, 0.08, 0.82)
  );
  const satRings = new THREE.Mesh(
    new THREE.RingGeometry(1.4, 2.35, 36),
    new THREE.MeshStandardMaterial({ color: 0xfef3c7, side: THREE.DoubleSide, roughness: 0.6 })
  );
  satRings.rotation.x = Math.PI / 2.4;
  const fRing = new THREE.Mesh(
    new THREE.RingGeometry(2.48, 2.58, 36),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide })
  );
  fRing.rotation.x = Math.PI / 2.4;
  saturnGrp.add(satBody, satRings, fRing);
  flybyGroup.add(jupiter, saturnGrp);
  flybyGroup.visible = false;

  return {
    group,
    spacecraftGroup,
    plaqueGroup,
    setMode: (mode, planet = 'jupiter') => {
      spacecraftGroup.visible = mode === 'spacecraft' || mode === 'flyby';
      plaqueGroup.visible = mode === 'plaque';
      flybyGroup.visible = mode === 'flyby';
      jupiter.visible = planet === 'jupiter';
      saturnGrp.visible = planet === 'saturn';
      if (mode === 'flyby') {
        spacecraftGroup.scale.setScalar(0.55);
      } else {
        spacecraftGroup.scale.setScalar(1.0);
        spacecraftGroup.position.set(0, 1.9, 0);
      }
    },
    animate: elapsedSec => {
      if (spacecraftGroup.visible) {
        spacecraftGroup.rotation.z = elapsedSec * 0.8;
      }
      if (flybyGroup.visible) {
        const t = (elapsedSec * 0.25) % 1;
        spacecraftGroup.position.set(-3.2 + t * 6.4, 2.1 + Math.sin(t * Math.PI) * 0.4, 2.1);
      }
    },
    setHighlight: part => {
      [dish, rtgBooms, magBoomGroup, smallPlaque].forEach(g => setEmissiveRecursive(g, 0, 0));
      if (part === 'pio_dish') setEmissiveRecursive(dish, 0x38bdf8, 0.7);
      else if (part === 'pio_rtgs') setEmissiveRecursive(rtgBooms, 0xf59e0b, 0.7);
      else if (part === 'pio_mag') setEmissiveRecursive(magBoomGroup, 0x22d3ee, 0.7);
      else if (part === 'pio_plaque') setEmissiveRecursive(smallPlaque, 0xfbbf24, 0.85);
    }
  };
}

// ============================================================================
// 8. Kepler Space Telescope + Live Exoplanet Transit Rig (2009–2018)
// ============================================================================
export interface KeplerObservatory3DHandle {
  group: THREE.Group;
  telescopeGroup: THREE.Group;
  transitRigGroup: THREE.Group;
  setMode: (mode: 'observatory' | 'transit') => void;
  setTransitState: (phase01: number, radiusRatio: number, k2RollAngleRad: number) => void;
  setHighlight: (part: string | null) => void;
}

export function createKeplerObservatory3D(): KeplerObservatory3DHandle {
  const group = new THREE.Group();
  const telescopeGroup = new THREE.Group();
  const transitRigGroup = new THREE.Group();
  group.add(telescopeGroup, transitRigGroup);

  const blackBaffle = makeMat(0x1e293b, 0.55, 0.5);
  const goldFoil = makeGoldFoilMat();
  const alumMat = makeMat(0xdbe2ea, 0.62, 0.34);
  const solarMat = makeSolarMat();

  // ---- KEPLER TELESCOPE ----
  telescopeGroup.position.y = 2.0;
  const barrelGroup = new THREE.Group();
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 2.2, 18), blackBaffle);
  barrel.rotation.x = Math.PI / 2;
  const sunshade = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.68, 0.72, 18, 1, true), alumMat);
  sunshade.material.side = THREE.DoubleSide;
  sunshade.rotation.x = Math.PI / 2;
  sunshade.position.z = 1.3;
  barrelGroup.add(barrel, sunshade);

  const busGroup = new THREE.Group();
  const bus = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.76, 0.65, 6), goldFoil.clone());
  bus.rotation.x = Math.PI / 2;
  bus.position.z = -1.2;
  busGroup.add(bus);

  const ccdDisk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.45, 0.06, 16),
    makeMat(0x38bdf8, 0.6, 0.2, 0x38bdf8, 0.45)
  );
  ccdDisk.rotation.x = Math.PI / 2;
  ccdDisk.position.z = 0.2;

  const solarWingGroup = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const pan = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.04, 0.95), solarMat.clone());
    pan.position.set(i < 2 ? -1.15 : 1.15, -0.55, (i % 2 === 0 ? -0.45 : 0.45));
    pan.rotation.z = i < 2 ? 0.38 : -0.38;
    solarWingGroup.add(pan);
  }
  telescopeGroup.add(barrelGroup, busGroup, ccdDisk, solarWingGroup);

  // ---- LIVE 3D TRANSIT SYSTEM ----
  transitRigGroup.position.y = 2.1;
  const hostStar = new THREE.Mesh(
    new THREE.SphereGeometry(1.35, 24, 20),
    new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
  );
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 18, 14),
    makeMat(0x1e293b, 0.2, 0.85)
  );
  const orbitRing = new THREE.Mesh(
    new THREE.RingGeometry(2.58, 2.63, 48),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.35 })
  );
  orbitRing.rotation.x = Math.PI / 2;
  transitRigGroup.add(hostStar, planet, orbitRing);
  transitRigGroup.visible = false;

  return {
    group,
    telescopeGroup,
    transitRigGroup,
    setMode: mode => {
      telescopeGroup.visible = mode === 'observatory';
      transitRigGroup.visible = mode === 'transit';
    },
    setTransitState: (phase01, radiusRatio, k2RollAngleRad) => {
      telescopeGroup.rotation.z = k2RollAngleRad;
      const angle = (phase01 - 0.5) * Math.PI * 2; // phase 0.5 places planet straight in front of star (+Z)
      const rOrbit = 2.6;
      planet.position.set(Math.sin(angle) * rOrbit, 0, Math.cos(angle) * rOrbit);
      const sc = Math.max(0.35, Math.min(2.6, radiusRatio / 0.1));
      planet.scale.setScalar(sc);
    },
    setHighlight: part => {
      [barrelGroup, ccdDisk, busGroup, solarWingGroup].forEach(g => setEmissiveRecursive(g, 0, 0));
      if (part === 'kep_aperture') setEmissiveRecursive(barrelGroup, 0xa855f7, 0.65);
      else if (part === 'kep_ccd') setEmissiveRecursive(ccdDisk, 0x38bdf8, 0.85);
      else if (part === 'kep_wheels') setEmissiveRecursive(busGroup, 0xf59e0b, 0.7);
      else if (part === 'kep_solar') setEmissiveRecursive(solarWingGroup, 0x38bdf8, 0.65);
    }
  };
}

// ============================================================================
// 9. Curiosity Mars Science Laboratory Rover (2012–Present, Gale Crater)
// ============================================================================
export interface Curiosity3DHandle {
  group: THREE.Group;
  setLaserActive: (active: boolean, elapsedSec?: number) => void;
  setArmExtended: (ext01: number) => void;
  setHighlight: (part: string | null) => void;
}

export function createCuriosityRover3D(): Curiosity3DHandle {
  const group = new THREE.Group();
  addContactShadow(group, 1.8, 0.015);

  const whiteHull = makeMat(0xf1f5f9, 0.25, 0.48);
  const goldFoil = makeGoldFoilMat();
  const alumMat = makeMat(0xdbe2ea, 0.62, 0.34);
  const wheelMat = makeMat(0x1e293b, 0.65, 0.44);
  const rtgMat = makeMat(0x334155, 0.6, 0.48);

  // Car-sized Warm Electronics Box & SAM/CheMin Instrument Deck
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.66, 1.98), whiteHull);
  chassis.position.y = 0.84;
  chassis.castShadow = true;
  const foilSkirt = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.24, 2.02), goldFoil);
  foilSkirt.position.y = 0.62;
  group.add(chassis, foilSkirt);

  const samDeckGroup = new THREE.Group();
  const samBay = new THREE.Mesh(
    new THREE.BoxGeometry(0.92, 0.14, 1.05),
    makeMat(0x0ea5e9, 0.48, 0.32, 0x0284c7, 0.16)
  );
  samBay.position.set(0, 1.22, 0.05);
  const hgaDish = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.06, 0.1, 18), alumMat.clone());
  hgaDish.position.set(-0.48, 1.46, -0.58);
  hgaDish.rotation.x = 0.55;
  samDeckGroup.add(samBay, hgaDish);
  group.add(samDeckGroup);

  // 6 Grooved Aluminum Wheels & Rocker-Bogie Suspension
  const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.22, 18);
  wheelGeo.rotateZ(Math.PI / 2);
  [-0.96, 0.96].forEach(wx => {
    [-0.86, 0, 0.86].forEach(wz => {
      const w = new THREE.Mesh(wheelGeo, wheelMat.clone());
      w.position.set(wx, 0.28, wz);
      w.castShadow = true;
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.25, 10), goldFoil.clone());
      hub.rotation.z = Math.PI / 2;
      hub.position.set(wx, 0.28, wz);
      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.62, 8), alumMat.clone());
      strut.position.set(wx * 0.82, 0.54, wz);
      strut.rotation.z = wx > 0 ? 0.28 : -0.28;
      group.add(w, hub, strut);
    });
  });

  // Rear Tilted Finned MMRTG Nuclear Power Source
  const mmrtgGroup = new THREE.Group();
  mmrtgGroup.position.set(0, 0.96, -1.25);
  mmrtgGroup.rotation.x = -0.46;
  const mmrtgCore = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.72, 12), rtgMat);
  mmrtgGroup.add(mmrtgCore);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const fin = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 0.68, 0.18),
      makeMat(0xf59e0b, 0.55, 0.35, 0xea580c, 0.25)
    );
    fin.position.set(Math.cos(a) * 0.26, 0, Math.sin(a) * 0.26);
    fin.rotation.y = -a;
    mmrtgGroup.add(fin);
  }
  group.add(mmrtgGroup);

  // Remote Sensing Mast & ChemCam Cyclops Laser Head
  const chemcamGroup = new THREE.Group();
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.075, 1.05, 10), alumMat.clone());
  mast.position.set(0.36, 1.66, 0.65);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.26, 0.28), whiteHull.clone());
  head.position.set(0.36, 2.22, 0.68);
  const cyclopsLens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.1, 14),
    makeMat(0x22d3ee, 0.8, 0.15, 0x06b6d4, 0.55)
  );
  cyclopsLens.rotation.x = Math.PI / 2;
  cyclopsLens.position.set(0.36, 2.22, 0.84);
  chemcamGroup.add(mast, head, cyclopsLens);
  group.add(chemcamGroup);

  // Sedimentary Gale Crater Mudstone Target Rock + ChemCam Laser Beam
  const targetRock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.48, 1),
    makeMat(0x7c4a35, 0.06, 0.9)
  );
  targetRock.scale.set(1.2, 0.72, 1.05);
  targetRock.position.set(0.28, 0.28, 2.55);
  targetRock.castShadow = true;
  group.add(targetRock);

  const laserBeamMat = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    transparent: true,
    opacity: 0.85
  });
  const laserStart = new THREE.Vector3(0.36, 2.22, 0.86);
  const laserEnd = new THREE.Vector3(0.28, 0.44, 2.45);
  const laserLen = laserStart.distanceTo(laserEnd);
  const laserBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.025, laserLen, 8), laserBeamMat);
  laserBeam.position.copy(laserStart).add(laserEnd).multiplyScalar(0.5);
  laserBeam.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    laserEnd.clone().sub(laserStart).normalize()
  );
  const sparkOrb = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  );
  sparkOrb.position.copy(laserEnd);
  group.add(laserBeam, sparkOrb);

  // 2.1m 5-Jointed Robotic Arm + MAHLI / APXS / Percussion Drill Turret
  const armGroup = new THREE.Group();
  armGroup.position.set(-0.28, 0.76, 1.02);
  const armSeg1 = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.11, 0.88), alumMat.clone());
  armSeg1.position.set(0, 0, 0.44);
  const turret = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.16, 12), goldFoil.clone());
  turret.position.set(0, -0.05, 0.94);
  const drillBit = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.28, 8), alumMat.clone());
  drillBit.rotation.x = Math.PI / 2;
  drillBit.position.set(0, -0.08, 1.14);
  armGroup.add(armSeg1, turret, drillBit);
  group.add(armGroup);

  return {
    group,
    setLaserActive: (active, elapsedSec = 0) => {
      laserBeam.visible = active;
      sparkOrb.visible = active;
      if (active) {
        const pulse = 0.65 + 0.35 * Math.sin(elapsedSec * 14);
        laserBeamMat.opacity = 0.55 + 0.4 * pulse;
        sparkOrb.scale.setScalar(0.75 + 0.6 * pulse);
      }
    },
    setArmExtended: ext01 => {
      const t = Math.max(0, Math.min(1, ext01));
      armGroup.rotation.x = -0.32 + t * 0.52;
      armGroup.position.y = 0.76 - t * 0.2;
    },
    setHighlight: part => {
      [mmrtgGroup, chemcamGroup, samDeckGroup, armGroup].forEach(g => setEmissiveRecursive(g, 0, 0));
      if (part === 'cur_mmrtg') setEmissiveRecursive(mmrtgGroup, 0xf59e0b, 0.75);
      else if (part === 'cur_chemcam') setEmissiveRecursive(chemcamGroup, 0xef4444, 0.75);
      else if (part === 'cur_sam') setEmissiveRecursive(samDeckGroup, 0x38bdf8, 0.75);
      else if (part === 'cur_arm') setEmissiveRecursive(armGroup, 0x10b981, 0.75);
    }
  };
}

// ============================================================================
// Holographic Sky-Projection Station Pedestal for Orbital / Deep-Space Exhibits
// ============================================================================
export function createSkyExhibitPedestal3D(accentHex: number, hoverAltitude: number): THREE.Group {
  const ped = new THREE.Group();
  const baseMetal = makeMat(0x1e293b, 0.65, 0.38);
  const trimMat = makeMat(accentHex, 0.45, 0.28, accentHex, 0.4);

  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.85, 0.24, 8), baseMetal);
  plinth.position.y = 0.12;
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.9, 2.25, 32),
    new THREE.MeshBasicMaterial({ color: accentHex, side: THREE.DoubleSide, transparent: true, opacity: 0.78 })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.04;

  const emitterCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.92, 0.26, 8), trimMat);
  emitterCrown.position.y = 0.32;

  const beamH = Math.max(4, hoverAltitude - 1.5);
  const holoColumn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.72, beamH, 16, 1, true),
    new THREE.MeshBasicMaterial({
      color: accentHex,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
      depthWrite: false
    })
  );
  holoColumn.position.y = 0.44 + beamH * 0.5;

  ped.add(plinth, ring, emitterCrown, holoColumn);
  return ped;
}
