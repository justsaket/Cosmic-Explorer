import * as THREE from 'three';
import type { ShuttleCameraView } from './shuttleTravelState';

export interface ShuttleCameraLookOffset {
  cockpitYaw: number;
  cockpitPitch: number;
  chaseYaw: number;
  chasePitch: number;
}

/**
 * Single consistent multi-part composite Space Shuttle 3D model
 * shared identically across Earth, Moon, Mars, and Interplanetary Travel.
 *
 * Coordinate convention:
 * - Local +Z points forward (nose cone direction)
 * - Local +Y points up (tail fin & cockpit dorsal spine)
 * - Bottom of extended landing gear pads sits strictly at local y = 0
 *   so placing group.position.y = padElevation grounds the shuttle flush.
 */
export class SpaceShuttleModel {
  public group: THREE.Group;

  // Interior crew & cockpit anchors (visible through transparent canopy)
  public cockpitSeatAnchor: THREE.Group;
  public cockpitCameraAnchor: THREE.Object3D;
  public cockpitLookAnchor: THREE.Object3D;
  public chaseCameraAnchor: THREE.Object3D;
  public chaseLookAnchor: THREE.Object3D;
  public parkedExternalCameraAnchor: THREE.Object3D;

  // Animated sub-assemblies
  private fuselageGroup: THREE.Group;
  private hatchDoorGroup: THREE.Group;
  private boardingRamp: THREE.Mesh;
  private landingGearGroups: THREE.Group[] = [];
  private canopyGlass: THREE.Mesh;
  private canopyGlassMat: THREE.MeshPhysicalMaterial;
  private cockpitDashLight: THREE.PointLight;
  private hudScreenMat: THREE.MeshBasicMaterial;

  // Nozzle-attached Propulsion Meshes & Particles
  private engineNozzlePos: THREE.Vector3[] = [];
  private innerFlames: THREE.Mesh[] = [];
  private thrusterFlames: THREE.Mesh[] = [];
  private thrusterCoreLight: THREE.PointLight;
  private rcsGlowMeshes: THREE.Mesh[] = [];

  // Nozzle Exhaust Particle System (attached in fuselage local space behind bells)
  private exhaustPoints: THREE.Points;
  private exhaustPositions: Float32Array;
  private exhaustVelocities: Float32Array;
  private exhaustAges: Float32Array;
  private exhaustLifetimes: Float32Array;
  private exhaustMat: THREE.PointsMaterial;
  private readonly exhaustCount = 150;

  // Surface Dust Particle System (Moon ballistic grit vs Mars swirling atmospheric dust)
  private dustPoints: THREE.Points;
  private dustPositions: Float32Array;
  private dustVelocities: Float32Array;
  private dustAges: Float32Array;
  private dustLifetimes: Float32Array;
  private dustMat: THREE.PointsMaterial;
  private readonly dustCount = 140;

  private groundDustRing: THREE.Mesh;
  private groundDustMat: THREE.MeshBasicMaterial;
  private reentryPlasmaMesh!: THREE.Mesh;
  private reentryPlasmaMat!: THREE.MeshBasicMaterial;
  private landingFloodlight: THREE.SpotLight;
  private padBeaconMat: THREE.MeshBasicMaterial;

  // Scratch vectors to prevent GC churn
  private scratchCam = new THREE.Vector3();
  private scratchLook = new THREE.Vector3();
  private scratchRight = new THREE.Vector3();
  private scratchForward = new THREE.Vector3();
  private scratchRel = new THREE.Vector3();

  constructor(options?: { isSoftwareGl?: boolean }) {
    const isSoftwareGl = options?.isSoftwareGl ?? false;
    this.group = new THREE.Group();

    // --- PBR MATERIALS ---
    const whiteTileMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.36,
      metalness: 0.12
    });
    const blackHeatShieldMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.78,
      metalness: 0.18
    });
    const titaniumAlloyMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.28,
      metalness: 0.85
    });
    const darkCarbonMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.55,
      metalness: 0.45
    });
    const accentStripeMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.35,
      metalness: 0.3
    });
    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.22,
      metalness: 0.9
    });

    // Transparent cockpit windshield (avoids expensive transmission pass on software WebGL)
    this.canopyGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0x7dd3fc,
      roughness: 0.06,
      metalness: 0.12,
      transparent: true,
      opacity: isSoftwareGl ? 0.34 : 0.28,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    // 1. PRIMARY FUSELAGE & PAYLOAD BAY SPINE (raised cleanly on landing gear above y=0)
    this.fuselageGroup = new THREE.Group();
    this.fuselageGroup.position.y = 1.65;
    this.group.add(this.fuselageGroup);
    const fuselageGroup = this.fuselageGroup;

    // Main Cylindrical Fuselage Hull
    const hullGeo = new THREE.CylinderGeometry(1.42, 1.52, 8.6, 24);
    hullGeo.rotateX(Math.PI / 2);
    const hull = new THREE.Mesh(hullGeo, whiteTileMat);
    hull.position.set(0, 0.5, -0.4);
    hull.castShadow = true;
    hull.receiveShadow = true;
    fuselageGroup.add(hull);

    // Lower Thermal Protection System (TPS) Black Belly Heat Shield
    const bellyGeo = new THREE.BoxGeometry(2.6, 0.42, 8.2);
    const belly = new THREE.Mesh(bellyGeo, blackHeatShieldMat);
    belly.position.set(0, -0.78, -0.3);
    belly.castShadow = true;
    fuselageGroup.add(belly);

    // Subtle Atmospheric Reentry Plasma Shield Bow (illuminates nose & belly during high-altitude entry)
    const plasmaGeo = new THREE.SphereGeometry(2.2, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.52);
    plasmaGeo.rotateX(Math.PI * 0.56);
    plasmaGeo.scale(1.35, 0.65, 2.35);
    this.reentryPlasmaMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    this.reentryPlasmaMesh = new THREE.Mesh(plasmaGeo, this.reentryPlasmaMat);
    this.reentryPlasmaMesh.position.set(0, -0.55, 1.35);
    this.reentryPlasmaMesh.visible = false;
    fuselageGroup.add(this.reentryPlasmaMesh);

    // Tapered Forward Nose Section (sloped cleanly below cockpit windshield sill)
    const forwardDeckGeo = new THREE.CylinderGeometry(0.86, 1.38, 2.25, 20);
    forwardDeckGeo.rotateX(Math.PI / 2);
    const forwardDeck = new THREE.Mesh(forwardDeckGeo, whiteTileMat);
    forwardDeck.position.set(0, 0.06, 4.92);
    forwardDeck.scale.set(0.98, 0.56, 1.0);
    forwardDeck.castShadow = true;
    fuselageGroup.add(forwardDeck);

    // Matte Dark Anti-Glare Forward Nose Shroud (eliminates cockpit windshield reflection/glare)
    const antiGlareShroud = new THREE.Mesh(
      new THREE.BoxGeometry(1.42, 0.16, 1.45),
      new THREE.MeshStandardMaterial({ color: 0x0b1220, roughness: 0.96, metalness: 0.04 })
    );
    antiGlareShroud.position.set(0, 0.72, 5.25);
    antiGlareShroud.rotation.x = 0.24;
    fuselageGroup.add(antiGlareShroud);

    // Black Carbon-Carbon Reinforced Nose Cap
    const noseTipGeo = new THREE.ConeGeometry(0.88, 2.15, 20);
    noseTipGeo.rotateX(Math.PI / 2);
    const noseTip = new THREE.Mesh(noseTipGeo, blackHeatShieldMat);
    noseTip.position.set(0, 0.04, 6.95);
    noseTip.scale.set(0.98, 0.68, 1.0);
    noseTip.castShadow = true;
    fuselageGroup.add(noseTip);

    // Nose RCS Thruster Blister + Subtle Attitude Jets
    const rcsPod = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.25, 0.55), darkCarbonMat);
    rcsPod.position.set(0, 0.55, 6.0);
    fuselageGroup.add(rcsPod);

    for (const side of [-1, 1]) {
      const rcsJet = new THREE.Mesh(
        new THREE.ConeGeometry(0.12, 0.65, 8),
        new THREE.MeshBasicMaterial({
          color: 0xe0f2fe,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      rcsJet.position.set(side * 0.42, 0.58, 6.0);
      rcsJet.rotation.z = side * -Math.PI * 0.5;
      fuselageGroup.add(rcsJet);
      this.rcsGlowMeshes.push(rcsJet);
    }

    // Dorsal Payload Bay Spine Fairing & Team Xtream NASA Blue Accent Stripes
    const dorsalGeo = new THREE.BoxGeometry(0.9, 0.45, 7.2);
    const dorsal = new THREE.Mesh(dorsalGeo, whiteTileMat);
    dorsal.position.set(0, 1.98, -0.8);
    fuselageGroup.add(dorsal);

    for (const side of [-1, 1]) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 7.4), accentStripeMat);
      stripe.position.set(side * 1.48, 0.45, -0.2);
      fuselageGroup.add(stripe);
    }

    // 2. DELTA WINGS, LEADING-EDGE TPS & ELEVONS
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, -4.4);
    wingShape.lineTo(4.9, -4.4);
    wingShape.lineTo(4.9, -2.8);
    wingShape.lineTo(1.2, 2.8);
    wingShape.lineTo(0, 2.8);
    wingShape.closePath();

    const wingExtrudeGeo = new THREE.ExtrudeGeometry(wingShape, {
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.08,
      bevelSegments: 2
    });
    wingExtrudeGeo.rotateX(Math.PI / 2);

    const rightWing = new THREE.Mesh(wingExtrudeGeo, whiteTileMat);
    rightWing.position.set(0.95, -0.52, -0.5);
    rightWing.castShadow = true;
    rightWing.receiveShadow = true;
    fuselageGroup.add(rightWing);

    const leftWing = rightWing.clone();
    leftWing.scale.x = -1;
    leftWing.position.x = -0.95;
    fuselageGroup.add(leftWing);

    for (const side of [-1, 1]) {
      const edge = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.24, 6.2), blackHeatShieldMat);
      edge.position.set(side * 3.15, -0.62, -1.2);
      edge.rotation.y = side * -0.49;
      fuselageGroup.add(edge);
    }

    // 3. VERTICAL TAIL STABILIZER FIN
    const tailShape = new THREE.Shape();
    tailShape.moveTo(0, 0);
    tailShape.lineTo(2.9, 0);
    tailShape.lineTo(2.1, 3.6);
    tailShape.lineTo(0.85, 3.6);
    tailShape.closePath();

    const tailGeo = new THREE.ExtrudeGeometry(tailShape, {
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 2
    });
    tailGeo.rotateY(Math.PI / 2);
    const tailFin = new THREE.Mesh(tailGeo, whiteTileMat);
    tailFin.position.set(-0.11, 1.85, -2.0);
    tailFin.castShadow = true;
    fuselageGroup.add(tailFin);

    const tailTip = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.65, 1.35), blackHeatShieldMat);
    tailTip.position.set(0, 5.15, -3.55);
    fuselageGroup.add(tailTip);

    this.padBeaconMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const tailBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), this.padBeaconMat);
    tailBeacon.position.set(0, 5.6, -3.9);
    fuselageGroup.add(tailBeacon);

    // 4. AFT ENGINE PODS, OMS THRUSTERS & 3 RS-25 MAIN ENGINE BELLS + MULTI-LAYER EXHAUST
    const aftBulkhead = new THREE.Mesh(
      new THREE.CylinderGeometry(1.48, 1.48, 0.4, 24).rotateX(Math.PI / 2),
      darkCarbonMat
    );
    aftBulkhead.position.set(0, 0.45, -4.75);
    fuselageGroup.add(aftBulkhead);

    for (const side of [-1, 1]) {
      const oms = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.95, 2.3), whiteTileMat);
      oms.position.set(side * 1.15, 1.55, -3.85);
      oms.castShadow = true;
      fuselageGroup.add(oms);

      const omsNozzle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.3, 0.55, 14).rotateX(Math.PI / 2),
        titaniumAlloyMat
      );
      omsNozzle.position.set(side * 1.15, 1.55, -5.2);
      fuselageGroup.add(omsNozzle);
    }

    const engineOffsets: [number, number, number][] = [
      [0, 1.02, -5.2],
      [-0.68, 0.12, -5.2],
      [0.68, 0.12, -5.2]
    ];
    const bellGeo = new THREE.CylinderGeometry(0.26, 0.58, 1.05, 18);
    bellGeo.rotateX(Math.PI / 2);

    const outerFlameGeo = new THREE.ConeGeometry(0.68, 5.2, 16);
    outerFlameGeo.rotateX(-Math.PI / 2);
    outerFlameGeo.translate(0, 0, -2.6);

    const innerFlameGeo = new THREE.ConeGeometry(0.32, 3.0, 14);
    innerFlameGeo.rotateX(-Math.PI / 2);
    innerFlameGeo.translate(0, 0, -1.5);

    const outerFlameMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.78,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const innerFlameMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    engineOffsets.forEach(([ex, ey, ez]) => {
      const bell = new THREE.Mesh(bellGeo, titaniumAlloyMat);
      bell.position.set(ex, ey, ez);
      fuselageGroup.add(bell);

      // Nozzle rim glowing throat ring
      const throat = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 12, 10),
        innerFlameMat.clone()
      );
      throat.position.set(ex, ey, ez - 0.42);
      throat.visible = false;
      fuselageGroup.add(throat);

      const outerFlame = new THREE.Mesh(outerFlameGeo, outerFlameMat.clone());
      outerFlame.position.set(ex, ey, ez - 0.4);
      outerFlame.visible = false;
      fuselageGroup.add(outerFlame);
      this.thrusterFlames.push(outerFlame);

      const innerFlame = new THREE.Mesh(innerFlameGeo, innerFlameMat.clone());
      innerFlame.position.set(ex, ey, ez - 0.4);
      innerFlame.visible = false;
      fuselageGroup.add(innerFlame);
      this.innerFlames.push(innerFlame);

      this.engineNozzlePos.push(new THREE.Vector3(ex, ey, ez - 0.5));
    });

    this.thrusterCoreLight = new THREE.PointLight(0x38bdf8, 0, 48);
    this.thrusterCoreLight.position.set(0, 0.4, -7.2);
    fuselageGroup.add(this.thrusterCoreLight);

    // Nozzle-Emitted Particle Plume (attached directly to fuselageGroup so it tracks shuttle rotation!)
    this.exhaustPositions = new Float32Array(this.exhaustCount * 3);
    this.exhaustVelocities = new Float32Array(this.exhaustCount * 3);
    this.exhaustAges = new Float32Array(this.exhaustCount);
    this.exhaustLifetimes = new Float32Array(this.exhaustCount);
    for (let i = 0; i < this.exhaustCount; i++) {
      this.exhaustAges[i] = 99; // Inactive until ignited
      this.exhaustLifetimes[i] = 0.5;
      this.exhaustPositions[i * 3 + 2] = -9999;
    }
    const exhaustGeo = new THREE.BufferGeometry();
    exhaustGeo.setAttribute('position', new THREE.BufferAttribute(this.exhaustPositions, 3));
    this.exhaustMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.65,
      transparent: true,
      opacity: 0.82,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.exhaustPoints = new THREE.Points(exhaustGeo, this.exhaustMat);
    this.exhaustPoints.frustumCulled = false;
    fuselageGroup.add(this.exhaustPoints);

    // Surface Touchdown Dust Particle System (Moon regolith spray vs Mars dust vortex)
    this.dustPositions = new Float32Array(this.dustCount * 3);
    this.dustVelocities = new Float32Array(this.dustCount * 3);
    this.dustAges = new Float32Array(this.dustCount);
    this.dustLifetimes = new Float32Array(this.dustCount);
    for (let i = 0; i < this.dustCount; i++) {
      this.dustAges[i] = 99;
      this.dustLifetimes[i] = 1.2;
      this.dustPositions[i * 3 + 1] = -9999;
    }
    const dustParticlesGeo = new THREE.BufferGeometry();
    dustParticlesGeo.setAttribute('position', new THREE.BufferAttribute(this.dustPositions, 3));
    this.dustMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.52,
      transparent: true,
      opacity: 0,
      depthWrite: false
    });
    this.dustPoints = new THREE.Points(dustParticlesGeo, this.dustMat);
    this.dustPoints.frustumCulled = false;
    this.group.add(this.dustPoints);

    // 5. VISIBLE COCKPIT INTERIOR, INSTRUMENT CONSOLE, PILOT SEAT & GLASS CANOPY
    const cockpitGroup = new THREE.Group();
    cockpitGroup.position.set(0, 0.72, 4.25);
    fuselageGroup.add(cockpitGroup);

    const cockpitFloor = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 0.12, 2.3),
      darkCarbonMat
    );
    cockpitFloor.position.set(0, -0.05, 0.1);
    cockpitGroup.add(cockpitFloor);

    const rearBulkhead = new THREE.Mesh(
      new THREE.BoxGeometry(1.95, 1.35, 0.16),
      darkCarbonMat
    );
    rearBulkhead.position.set(0, 0.65, -0.95);
    cockpitGroup.add(rearBulkhead);

    // High-Back Commander Flight Seat
    const seatBase = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.24, 0.72), darkCarbonMat);
    seatBase.position.set(0, 0.15, -0.15);
    cockpitGroup.add(seatBase);

    const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.05, 0.18), titaniumAlloyMat);
    seatBack.position.set(0, 0.68, -0.52);
    seatBack.rotation.x = -0.14;
    cockpitGroup.add(seatBack);

    const seatHeadrest = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.28, 0.2), goldTrimMat);
    seatHeadrest.position.set(0, 1.28, -0.6);
    cockpitGroup.add(seatHeadrest);

    // Illuminated Multi-Function Flight Control Console & Matte Anti-Glare Coaming
    const cockpitMatteMat = new THREE.MeshStandardMaterial({
      color: 0x0b1120,
      roughness: 0.95,
      metalness: 0.04
    });

    const dashBody = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.34, 0.42), cockpitMatteMat);
    dashBody.position.set(0, 0.76, 0.84);
    dashBody.rotation.x = -0.22;
    cockpitGroup.add(dashBody);

    const glareShield = new THREE.Mesh(new THREE.BoxGeometry(1.66, 0.05, 0.34), cockpitMatteMat);
    glareShield.position.set(0, 0.96, 0.82);
    cockpitGroup.add(glareShield);

    const makeMfdTex = (mode: 'pfd' | 'traj' | 'nav') => {
      const c = document.createElement('canvas');
      c.width = 256;
      c.height = 160;
      const ctx = c.getContext('2d')!;
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, 256, 160);
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 3;
      ctx.strokeRect(4, 4, 248, 152);
      ctx.font = 'bold 16px monospace';
      if (mode === 'pfd') {
        ctx.fillStyle = '#0c4a6e';
        ctx.fillRect(28, 32, 200, 50);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(28, 82, 200, 50);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(28, 82);
        ctx.lineTo(228, 82);
        ctx.stroke();
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('ATTITUDE // ADI', 48, 24);
      } else if (mode === 'traj') {
        ctx.fillStyle = '#10b981';
        ctx.fillText('PROPULSION // OMS', 36, 24);
        ctx.strokeStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(24, 130);
        ctx.quadraticCurveTo(120, 42, 232, 34);
        ctx.stroke();
        ctx.fillStyle = '#34d399';
        ctx.fillRect(28, 108, 42, 18);
        ctx.fillRect(80, 96, 42, 30);
        ctx.fillRect(132, 82, 42, 44);
      } else {
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('ORBITAL // NAV', 48, 24);
        ctx.strokeStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(128, 92, 44, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(128, 92, 24, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(154, 74, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      const tex = new THREE.CanvasTexture(c);
      tex.needsUpdate = true;
      return tex;
    };

    this.hudScreenMat = new THREE.MeshBasicMaterial({ map: makeMfdTex('pfd') });
    const mfdLeft = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.14), this.hudScreenMat);
    mfdLeft.position.set(-0.28, 0.87, 0.68);
    mfdLeft.rotation.x = -0.22;
    mfdLeft.rotation.y = Math.PI;
    cockpitGroup.add(mfdLeft);

    const mfdCenter = new THREE.Mesh(
      new THREE.PlaneGeometry(0.24, 0.14),
      new THREE.MeshBasicMaterial({ map: makeMfdTex('traj') })
    );
    mfdCenter.position.set(0, 0.87, 0.68);
    mfdCenter.rotation.x = -0.22;
    mfdCenter.rotation.y = Math.PI;
    cockpitGroup.add(mfdCenter);

    const mfdRight = new THREE.Mesh(
      new THREE.PlaneGeometry(0.24, 0.14),
      new THREE.MeshBasicMaterial({ map: makeMfdTex('nav') })
    );
    mfdRight.position.set(0.28, 0.87, 0.68);
    mfdRight.rotation.x = -0.22;
    mfdRight.rotation.y = Math.PI;
    cockpitGroup.add(mfdRight);

    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.42, 8), titaniumAlloyMat);
    stick.position.set(0, 0.45, 0.42);
    stick.rotation.x = -0.2;
    cockpitGroup.add(stick);

    // Angled Cockpit Windshield A-Pillars framing the forward canopy cleanly
    for (const side of [-1, 1]) {
      const aPillar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.65, 0.08), cockpitMatteMat);
      aPillar.position.set(side * 0.72, 1.02, 0.96);
      aPillar.rotation.x = -0.58;
      aPillar.rotation.z = side * 0.26;
      cockpitGroup.add(aPillar);
    }

    this.cockpitDashLight = new THREE.PointLight(0x38bdf8, 0.24, 3.0);
    this.cockpitDashLight.position.set(0, 1.02, 0.32);
    cockpitGroup.add(this.cockpitDashLight);

    // Astronaut Seat Anchor (tucked cleanly inside cockpit canopy)
    this.cockpitSeatAnchor = new THREE.Group();
    this.cockpitSeatAnchor.position.set(0, -0.04, -0.05);
    this.cockpitSeatAnchor.scale.set(0.74, 0.74, 0.74);
    cockpitGroup.add(this.cockpitSeatAnchor);

    // Camera A: Astronaut's Seated First-Person Eye-Level Cockpit Anchor
    // Looks cleanly over matte glare shield & MFDs through the unobstructed forward glass windshield
    this.cockpitCameraAnchor = new THREE.Object3D();
    this.cockpitCameraAnchor.position.set(0, 1.18, 0.04);
    cockpitGroup.add(this.cockpitCameraAnchor);

    this.cockpitLookAnchor = new THREE.Object3D();
    this.cockpitLookAnchor.position.set(0, 0.78, 18.0);
    cockpitGroup.add(this.cockpitLookAnchor);

    // Camera B: External Cinematic Chase Anchor (follows full shuttle + exhaust + destination)
    this.chaseCameraAnchor = new THREE.Object3D();
    this.chaseCameraAnchor.position.set(8.6, 5.2, -16.2);
    this.group.add(this.chaseCameraAnchor);

    this.chaseLookAnchor = new THREE.Object3D();
    this.chaseLookAnchor.position.set(0, 2.0, 3.8);
    this.group.add(this.chaseLookAnchor);

    // Parked Front-3/4 External Anchor (shows seated astronaut through glass canopy + pad ramp)
    this.parkedExternalCameraAnchor = new THREE.Object3D();
    this.parkedExternalCameraAnchor.position.set(-6.2, 4.1, 9.2);
    this.group.add(this.parkedExternalCameraAnchor);

    // Forward Cockpit Glass Canopy Dome + Sleek Aerodynamic Frame Struts
    const canopyGeo = new THREE.CylinderGeometry(
      0.76,
      1.08,
      2.35,
      18,
      1,
      true,
      -Math.PI * 0.52,
      Math.PI * 1.04
    );
    canopyGeo.rotateX(Math.PI / 2);
    this.canopyGlass = new THREE.Mesh(canopyGeo, this.canopyGlassMat);
    this.canopyGlass.position.set(0, 0.56, 0.16);
    this.canopyGlass.scale.set(0.98, 0.94, 1.0);
    cockpitGroup.add(this.canopyGlass);

    const ribConfigs: [number, number][] = [
      [-0.85, 1.06],
      [0.32, 0.96]
    ];
    for (const [ribZ, ribR] of ribConfigs) {
      const ribGeo = new THREE.TorusGeometry(ribR, 0.042, 8, 18, Math.PI * 1.02);
      const rib = new THREE.Mesh(ribGeo, darkCarbonMat);
      rib.position.set(0, 0.56, ribZ);
      rib.scale.set(0.98, 0.94, 1.0);
      cockpitGroup.add(rib);
    }

    // 6. SIDE CREW HATCH & BOARDING RAMP (Port Side ahead of wing leading edge at z = 3.25)
    this.hatchDoorGroup = new THREE.Group();
    this.hatchDoorGroup.position.set(-1.32, 0.55, 3.25);
    const hatchDoor = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.35, 0.95), titaniumAlloyMat);
    hatchDoor.position.set(0, 0.62, 0);
    this.hatchDoorGroup.add(hatchDoor);

    const hatchWindow = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.35, 0.38),
      this.canopyGlassMat
    );
    hatchWindow.position.set(0, 0.9, 0);
    this.hatchDoorGroup.add(hatchWindow);
    fuselageGroup.add(this.hatchDoorGroup);

    const rampGeo = new THREE.BoxGeometry(2.5, 0.12, 1.25);
    this.boardingRamp = new THREE.Mesh(rampGeo, titaniumAlloyMat);
    this.boardingRamp.position.set(-2.28, 0.74, 3.25);
    this.boardingRamp.rotation.z = 0.56;
    this.boardingRamp.castShadow = true;
    this.group.add(this.boardingRamp);

    const rampLight = new THREE.Mesh(
      new THREE.BoxGeometry(2.3, 0.06, 0.14),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    rampLight.position.set(0, 0.08, 0.56);
    this.boardingRamp.add(rampLight);

    // 7. RETRACTABLE 3-POINT LANDING GEAR STRUTS & FOOT PADS (Rest strictly at y = 0)
    const gearCoords: [number, number, number][] = [
      [0, 0, 5.1],
      [-2.3, 0, -1.8],
      [2.3, 0, -1.8]
    ];

    gearCoords.forEach(([gx, _gy, gz]) => {
      const gearGroup = new THREE.Group();
      gearGroup.position.set(gx, 0, gz);

      const strut = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11, 0.14, 1.25, 10),
        titaniumAlloyMat
      );
      strut.position.y = 0.65;
      strut.castShadow = true;
      gearGroup.add(strut);

      const footPad = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.58, 0.14, 14),
        darkCarbonMat
      );
      footPad.position.y = 0.07;
      footPad.castShadow = true;
      gearGroup.add(footPad);

      this.landingGearGroups.push(gearGroup);
      this.group.add(gearGroup);
    });

    // 8. LANDING FLOODLIGHT & RETRO-THRUST GROUND DUST BLAST RING
    this.landingFloodlight = new THREE.SpotLight(0xe0f2fe, 1.8, 38, Math.PI / 4, 0.5, 1.2);
    this.landingFloodlight.position.set(0, 2.1, 6.2);
    this.landingFloodlight.target.position.set(0, 0, 14);
    this.group.add(this.landingFloodlight);
    this.group.add(this.landingFloodlight.target);

    const dustGeo = new THREE.RingGeometry(1.8, 9.0, 32);
    dustGeo.rotateX(-Math.PI / 2);
    this.groundDustMat = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.groundDustRing = new THREE.Mesh(dustGeo, this.groundDustMat);
    this.groundDustRing.position.y = 0.08;
    this.group.add(this.groundDustRing);
  }

  public setEnvironmentMap(envMap: THREE.Texture) {
    this.canopyGlassMat.envMap = envMap;
    this.canopyGlassMat.needsUpdate = true;
  }

  /**
   * Coordinates engine ignition, multi-layer Mach shock plumes, nozzle-emitted particles,
   * RCS verniers, and environment-distinct surface dust particles (Earth vs Moon vs Mars vs Space).
   */
  public updatePropulsion(params: {
    delta: number;
    intensity: number;
    time: number;
    environment: 'earth' | 'moon' | 'mars' | 'space';
    dustIntensity?: number;
    altitudeMeters?: number;
    rcsActivity?: number;
  }) {
    const {
      delta,
      intensity,
      time,
      environment,
      dustIntensity = 0,
      altitudeMeters = 0,
      rcsActivity = 0
    } = params;

    const dt = Math.min(0.08, Math.max(0.001, delta));
    const active = intensity > 0.03;
    const flicker = 0.86 + Math.sin(time * 34) * 0.14;

    const outerHex =
      environment === 'earth'
        ? 0xf97316
        : environment === 'mars'
        ? 0xfb923c
        : environment === 'moon'
        ? 0x7dd3fc
        : 0x38bdf8;
    const innerHex = environment === 'earth' ? 0xfef3c7 : 0xe0f2fe;

    // 1. Update inner Mach-diamond cores and outer exhaust cones
    this.thrusterFlames.forEach((flame, idx) => {
      flame.visible = active;
      const inner = this.innerFlames[idx];
      if (inner) inner.visible = active;
      if (active) {
        const s = intensity * (0.9 + (idx % 2) * 0.12) * flicker;
        const spread = environment === 'space' ? 1.15 : 0.88;
        flame.scale.set(
          (0.7 + intensity * 0.48) * spread,
          (0.7 + intensity * 0.48) * spread,
          Math.max(0.25, s * (environment === 'space' ? 1.75 : 1.45))
        );
        const mat = flame.material as THREE.MeshBasicMaterial;
        mat.color.setHex(outerHex);
        mat.opacity = Math.min(0.88, intensity * 0.82);

        if (inner) {
          inner.scale.set(0.7 + intensity * 0.35, 0.7 + intensity * 0.35, Math.max(0.2, s * 1.15));
          const iMat = inner.material as THREE.MeshBasicMaterial;
          iMat.color.setHex(innerHex);
          iMat.opacity = Math.min(0.98, intensity * 0.96);
        }
      }
    });

    this.thrusterCoreLight.intensity = active ? intensity * 5.2 * flicker : 0;
    this.thrusterCoreLight.color.setHex(outerHex);

    // Subtle RCS nose vernier pulses during approach/maneuvers
    this.rcsGlowMeshes.forEach((m, idx) => {
      const mat = m.material as THREE.MeshBasicMaterial;
      const pulse = rcsActivity > 0.05 ? (0.4 + 0.6 * Math.abs(Math.sin(time * 9 + idx * 1.6))) * rcsActivity : 0;
      mat.opacity = pulse * 0.65;
      m.visible = pulse > 0.05;
    });

    // 2. Step Nozzle-Emitted Propulsion Particles
    this.exhaustMat.color.setHex(outerHex);
    this.exhaustMat.size = environment === 'earth' ? 0.92 : environment === 'space' ? 0.52 : 0.64;

    const exPosAttr = this.exhaustPoints.geometry.attributes.position as THREE.BufferAttribute;
    const spawnBudget = active ? Math.ceil(intensity * 9) : 0;
    let spawned = 0;

    for (let i = 0; i < this.exhaustCount; i++) {
      this.exhaustAges[i] += dt;
      if (this.exhaustAges[i] >= this.exhaustLifetimes[i]) {
        if (spawned < spawnBudget) {
          spawned++;
          const nozzle = this.engineNozzlePos[i % this.engineNozzlePos.length];
          this.exhaustAges[i] = 0;
          this.exhaustLifetimes[i] =
            environment === 'earth' ? 0.55 : environment === 'space' ? 0.42 : 0.48;
          this.exhaustPositions[i * 3] = nozzle.x + (Math.random() - 0.5) * 0.35;
          this.exhaustPositions[i * 3 + 1] = nozzle.y + (Math.random() - 0.5) * 0.35;
          this.exhaustPositions[i * 3 + 2] = nozzle.z - 0.25;

          const radialSpread = environment === 'space' ? 3.2 : environment === 'mars' ? 2.6 : 1.8;
          const speed = (environment === 'space' ? 24 : 18) * (0.7 + intensity * 0.5);
          this.exhaustVelocities[i * 3] = (Math.random() - 0.5) * radialSpread;
          this.exhaustVelocities[i * 3 + 1] = (Math.random() - 0.5) * radialSpread;
          this.exhaustVelocities[i * 3 + 2] = -speed;
        } else {
          this.exhaustPositions[i * 3 + 2] = -9999;
        }
      } else {
        this.exhaustPositions[i * 3] += this.exhaustVelocities[i * 3] * dt;
        this.exhaustPositions[i * 3 + 1] += this.exhaustVelocities[i * 3 + 1] * dt;
        this.exhaustPositions[i * 3 + 2] += this.exhaustVelocities[i * 3 + 2] * dt;
      }
    }
    exPosAttr.needsUpdate = true;

    // 3. Environment-Specific Surface Dust Blast (Moon ballistic ejecta vs Mars airborne ochre swirl)
    const dustColorHex =
      environment === 'mars' ? 0xd97742 : environment === 'earth' ? 0xe2e8f0 : 0x94a3b8;
    this.groundDustMat.color.setHex(dustColorHex);
    this.groundDustMat.opacity = Math.max(0, Math.min(0.68, dustIntensity * 0.62));
    const dustScale = 1.0 + dustIntensity * 1.9;
    this.groundDustRing.scale.set(dustScale, 1, dustScale);
    this.groundDustRing.position.y = Math.max(0.08, -altitudeMeters + 0.1);
    this.groundDustRing.visible = dustIntensity > 0.02 && environment !== 'space';

    this.dustMat.color.setHex(dustColorHex);
    this.dustMat.size = environment === 'mars' ? 0.78 : 0.42;

    const dustPosAttr = this.dustPoints.geometry.attributes.position as THREE.BufferAttribute;
    const dustBudget = dustIntensity > 0.08 && environment !== 'space' ? Math.ceil(dustIntensity * 8) : 0;
    let dustSpawned = 0;
    let anyDustAlive = false;

    for (let i = 0; i < this.dustCount; i++) {
      this.dustAges[i] += dt;
      if (this.dustAges[i] >= this.dustLifetimes[i]) {
        if (dustSpawned < dustBudget) {
          dustSpawned++;
          const theta = Math.random() * Math.PI * 2;
          const r = 1.4 + Math.random() * 2.5;
          this.dustAges[i] = 0;
          // Mars thin atmosphere keeps fine dust suspended longer; Moon dust is ballistic & settles rapidly!
          this.dustLifetimes[i] = environment === 'mars' ? 1.55 : environment === 'moon' ? 0.85 : 1.1;
          const groundOffset = -altitudeMeters + 0.18;
          this.dustPositions[i * 3] = Math.cos(theta) * r;
          this.dustPositions[i * 3 + 1] = groundOffset;
          this.dustPositions[i * 3 + 2] = Math.sin(theta) * r - 1.5;

          const radialSpeed = (environment === 'moon' ? 9.5 : 7.0) * (0.6 + dustIntensity * 0.6);
          this.dustVelocities[i * 3] = Math.cos(theta) * radialSpeed;
          this.dustVelocities[i * 3 + 1] =
            environment === 'mars' ? 2.4 + Math.random() * 2.2 : 0.9 + Math.random() * 1.2;
          this.dustVelocities[i * 3 + 2] = Math.sin(theta) * radialSpeed;
          anyDustAlive = true;
        } else {
          this.dustPositions[i * 3 + 1] = -9999;
        }
      } else {
        anyDustAlive = true;
        this.dustPositions[i * 3] += this.dustVelocities[i * 3] * dt;
        this.dustPositions[i * 3 + 1] += this.dustVelocities[i * 3 + 1] * dt;
        this.dustPositions[i * 3 + 2] += this.dustVelocities[i * 3 + 2] * dt;
        // Moon vacuum gravity pulls ballistic dust grit down faster; Mars air drags & swirls
        if (environment === 'moon') {
          this.dustVelocities[i * 3 + 1] -= 3.2 * dt;
        } else {
          this.dustVelocities[i * 3] *= 1 - 0.9 * dt;
          this.dustVelocities[i * 3 + 2] *= 1 - 0.9 * dt;
          this.dustVelocities[i * 3 + 1] -= 1.1 * dt;
        }
      }
    }
    this.dustMat.opacity = anyDustAlive ? Math.max(0.22, Math.min(0.75, dustIntensity * 0.72 + 0.25)) : 0;
    dustPosAttr.needsUpdate = true;

    const pulse = Math.sin(time * 4.2) > 0.2 ? 0x38bdf8 : 0x0284c7;
    this.padBeaconMat.color.setHex(pulse);
  }

  public setReentryPlasma(intensity: number) {
    const clamped = Math.max(0, Math.min(1, intensity));
    this.reentryPlasmaMesh.visible = clamped > 0.02;
    this.reentryPlasmaMat.opacity = clamped * 0.36;
  }

  /**
   * Backwards-compatible wrapper for simple intensity calls.
   */
  public setEngineThrust(
    intensity: number,
    time: number,
    planetType: 'earth' | 'moon' | 'mars' | 'space' = 'space',
    dustIntensity: number = 0
  ) {
    this.updatePropulsion({
      delta: 0.016,
      intensity,
      time,
      environment: planetType,
      dustIntensity,
      altitudeMeters: 0
    });
  }

  public setGearAndRampState(gearExtended: number, rampExtended: number) {
    const g = Math.max(0, Math.min(1, gearExtended));
    const r = Math.max(0, Math.min(1, rampExtended));

    this.landingGearGroups.forEach((gear) => {
      gear.scale.y = 0.15 + g * 0.85;
      gear.visible = g > 0.08;
    });

    this.boardingRamp.visible = r > 0.08;
    this.boardingRamp.scale.set(r, 1, r);
    this.hatchDoorGroup.rotation.y = r * 1.15;
  }

  public getBoardingWorldPosition(out: THREE.Vector3): THREE.Vector3 {
    out.set(-2.7, 0, 3.25);
    this.group.localToWorld(out);
    return out;
  }

  public getExitWorldPosition(out: THREE.Vector3): THREE.Vector3 {
    out.set(-5.0, 0, 3.25);
    this.group.localToWorld(out);
    return out;
  }

  /**
   * Positions any PerspectiveCamera (Main or PiP) onto the exact same live shuttle
   * in either First-Person Cockpit View or External Cinematic Chase View,
   * optionally applying user mouse look offsets.
   */
  public applyCockpitOrChaseCamera(
    camera: THREE.PerspectiveCamera,
    view: ShuttleCameraView,
    lerpAlpha: number = 1.0,
    isParked: boolean = false,
    lookOffset?: ShuttleCameraLookOffset
  ) {
    this.canopyGlass.visible = view !== 'cockpit';
    this.group.updateMatrixWorld(true);

    if (view === 'cockpit') {
      this.cockpitCameraAnchor.getWorldPosition(this.scratchCam);
      if (lerpAlpha >= 0.99) {
        camera.position.copy(this.scratchCam);
      } else {
        camera.position.lerp(this.scratchCam, lerpAlpha);
      }

      this.cockpitLookAnchor.getWorldPosition(this.scratchLook);
      if (lookOffset && (lookOffset.cockpitYaw !== 0 || lookOffset.cockpitPitch !== 0)) {
        this.scratchForward.subVectors(this.scratchLook, this.scratchCam).normalize();
        this.scratchRight.crossVectors(this.scratchForward, camera.up).normalize();
        const dist = 16.0;
        this.scratchLook
          .copy(this.scratchCam)
          .addScaledVector(this.scratchForward, Math.cos(lookOffset.cockpitYaw) * dist)
          .addScaledVector(this.scratchRight, Math.sin(lookOffset.cockpitYaw) * dist);
        this.scratchLook.y += Math.sin(lookOffset.cockpitPitch) * dist;
      }

      camera.up.set(0, 1, 0);
      camera.lookAt(this.scratchLook);
    } else {
      const baseAnchor = isParked ? this.parkedExternalCameraAnchor : this.chaseCameraAnchor;
      baseAnchor.getWorldPosition(this.scratchCam);
      this.chaseLookAnchor.getWorldPosition(this.scratchLook);

      if (lookOffset && (lookOffset.chaseYaw !== 0 || lookOffset.chasePitch !== 0)) {
        const rel = this.scratchRel.subVectors(this.scratchCam, this.scratchLook);
        const radius = rel.length();
        const baseAz = Math.atan2(rel.x, rel.z) + lookOffset.chaseYaw;
        const baseElev = Math.max(
          -0.25,
          Math.min(1.05, Math.asin(Math.max(-0.99, Math.min(0.99, rel.y / radius))) + lookOffset.chasePitch)
        );
        this.scratchCam.set(
          this.scratchLook.x + Math.sin(baseAz) * Math.cos(baseElev) * radius,
          this.scratchLook.y + Math.sin(baseElev) * radius,
          this.scratchLook.z + Math.cos(baseAz) * Math.cos(baseElev) * radius
        );
      }

      if (lerpAlpha >= 0.99) {
        camera.position.copy(this.scratchCam);
      } else {
        camera.position.lerp(this.scratchCam, lerpAlpha);
      }
      camera.up.set(0, 1, 0);
      camera.lookAt(this.scratchLook);
    }
  }
}
