import * as THREE from 'three';
import { PlanetId } from '../types';
import { soundManager } from '../audio/soundManager';
import { narrationManager } from '../narration/narrationManager';

export type HistoricalMissionVehicle =
  | 'moon_apollo'
  | 'moon_surveyor'
  | 'mars_skycrane'
  | 'mars_orbiter';

export interface LandingTelemetry {
  altitudeMeters: number;
  descentSpeedMps: number;
  phase: 'deorbit' | 'terminal_descent' | 'touchdown' | 'settled' | 'orbital_pass';
  progress: number; // 0 to 1
  isLandingActive: boolean;
  vehicleLabel?: string;
}

export class LandingSequenceManager {
  public landerGroup: THREE.Group;
  private planet: PlanetId;
  private vehicleMode: HistoricalMissionVehicle;
  private landingTarget: THREE.Vector3;
  private groundElevation: number;
  private timeElapsed: number = 0;
  private totalDuration: number = 8.5;
  private isActive: boolean = false;
  private isComplete: boolean = false;
  private hasWelcomed: boolean = false;

  // Visual sub-components
  private thrusterPlume: THREE.Mesh;
  private thrusterLight: THREE.PointLight;
  private dustRing: THREE.Mesh;
  private dustRingMat: THREE.MeshBasicMaterial;
  private landingLegs: THREE.Group[] = [];
  private suspensionPistons: THREE.Mesh[] = [];

  constructor(
    planet: PlanetId,
    landingTarget: THREE.Vector3,
    groundElevation: number,
    vehicleMode?: HistoricalMissionVehicle
  ) {
    this.planet = planet;
    this.vehicleMode =
      vehicleMode ?? (planet === 'mars' ? 'mars_skycrane' : 'moon_apollo');
    this.landingTarget = landingTarget.clone();
    this.groundElevation = groundElevation;
    this.landerGroup = new THREE.Group();

    if (this.vehicleMode === 'mars_orbiter') {
      this.totalDuration = 7.5;
    }

    // 1. Build Vehicle-Specific Historical Spacecraft
    if (this.vehicleMode === 'mars_orbiter') {
      this.buildMarsOrbiter();
    } else if (this.vehicleMode === 'mars_skycrane') {
      this.buildMarsDescentVehicle();
    } else if (this.vehicleMode === 'moon_surveyor') {
      this.buildSurveyorLander();
    } else {
      this.buildMoonLunarLander();
    }

    // 2. Thruster Plasma Exhaust Cone
    const plumeGeo = new THREE.ConeGeometry(0.85, 3.2, 16);
    plumeGeo.rotateX(Math.PI);
    plumeGeo.translate(0, -1.6, 0);

    const plumeColor =
      this.vehicleMode === 'mars_skycrane'
        ? 0xf97316
        : this.vehicleMode === 'mars_orbiter'
        ? 0x38bdf8
        : 0x38bdf8;
    const plumeMat = new THREE.MeshBasicMaterial({
      color: plumeColor,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.thrusterPlume = new THREE.Mesh(plumeGeo, plumeMat);
    if (this.vehicleMode === 'mars_orbiter') {
      this.thrusterPlume.rotation.x = Math.PI / 2;
      this.thrusterPlume.position.set(0, 0, -2.0);
    }
    this.landerGroup.add(this.thrusterPlume);

    // Glowing thruster light
    this.thrusterLight = new THREE.PointLight(plumeColor, 3.0, 25);
    this.thrusterLight.position.set(0, -1.2, 0);
    this.landerGroup.add(this.thrusterLight);

    // 3. Ground Dust Blast Ring
    const dustGeo = new THREE.RingGeometry(1.5, 6.5, 32);
    dustGeo.rotateX(-Math.PI / 2);
    const dustColor = planet === 'mars' ? 0xc2410c : 0x94a3b8;
    this.dustRingMat = new THREE.MeshBasicMaterial({
      color: dustColor,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.dustRing = new THREE.Mesh(dustGeo, this.dustRingMat);
    this.dustRing.position.set(landingTarget.x, groundElevation + 0.1, landingTarget.z);

    // Initial position
    if (this.vehicleMode === 'mars_orbiter') {
      this.landerGroup.position.set(landingTarget.x + 52, groundElevation + 44, landingTarget.z);
    } else {
      this.landerGroup.position.set(landingTarget.x, groundElevation + 65, landingTarget.z);
    }
  }

  public getVehicleLabel(): string {
    switch (this.vehicleMode) {
      case 'moon_surveyor':
        return 'Surveyor 3 Lunar Lander (1967)';
      case 'mars_skycrane':
        return 'Mars 2020 Sky Crane & Rover';
      case 'mars_orbiter':
        return 'Mars Reconnaissance Orbiter (Orbital Pass)';
      default:
        return 'Apollo Lunar Module (Eagle)';
    }
  }

  // --- MOON: APOLLO LUNAR MODULE ---
  private buildMoonLunarLander() {
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.15
    });

    const alloyMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.85,
      roughness: 0.25
    });

    const darkAlloyMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.9,
      roughness: 0.35
    });

    const descentStageGeo = new THREE.CylinderGeometry(2.4, 2.6, 1.8, 8);
    const descentStage = new THREE.Mesh(descentStageGeo, goldMat);
    descentStage.position.y = 1.6;
    descentStage.castShadow = true;
    this.landerGroup.add(descentStage);

    const cabinGeo = new THREE.CylinderGeometry(1.8, 2.2, 2.4, 16);
    const cabin = new THREE.Mesh(cabinGeo, alloyMat);
    cabin.position.y = 3.6;
    cabin.castShadow = true;
    this.landerGroup.add(cabin);

    const noseGeo = new THREE.ConeGeometry(1.4, 0.9, 16);
    const nose = new THREE.Mesh(noseGeo, darkAlloyMat);
    nose.position.y = 5.25;
    this.landerGroup.add(nose);

    const engineGeo = new THREE.CylinderGeometry(0.3, 0.95, 1.2, 16);
    const engine = new THREE.Mesh(engineGeo, darkAlloyMat);
    engine.position.y = 0.4;
    this.landerGroup.add(engine);

    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const legGroup = new THREE.Group();
      legGroup.position.set(Math.cos(angle) * 1.8, 1.4, Math.sin(angle) * 1.8);
      legGroup.rotation.y = angle;

      const strutGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.6, 8);
      const strut = new THREE.Mesh(strutGeo, alloyMat);
      strut.rotation.z = -0.55;
      strut.position.set(0.65, -0.9, 0);
      legGroup.add(strut);

      const pistonGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.4, 8);
      const piston = new THREE.Mesh(pistonGeo, darkAlloyMat);
      piston.rotation.z = -0.55;
      piston.position.set(0.4, -0.6, 0);
      legGroup.add(piston);
      this.suspensionPistons.push(piston);

      const padGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.1, 12);
      const pad = new THREE.Mesh(padGeo, goldMat);
      pad.position.set(1.4, -2.1, 0);
      legGroup.add(pad);

      this.landingLegs.push(legGroup);
      this.landerGroup.add(legGroup);
    }
  }

  // --- MOON: SURVEYOR 3 TRIPOD ROBOTIC LANDER ---
  private buildSurveyorLander() {
    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.35,
      roughness: 0.4
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.2
    });
    const solarMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      metalness: 0.7,
      roughness: 0.22
    });
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.8,
      roughness: 0.4
    });

    // Triangular aluminum frame core + gold thermal box
    const bus = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.35, 1.1, 3), whiteMat);
    bus.position.y = 1.4;
    this.landerGroup.add(bus);

    const thermalBox = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.85, 0.95), goldMat);
    thermalBox.position.set(0.25, 1.9, 0.2);
    this.landerGroup.add(thermalBox);

    // Tall central telemetry mast + Top Solar Panel + High-Gain Dish
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.8, 10), whiteMat);
    mast.position.y = 3.1;
    this.landerGroup.add(mast);

    const solarWing = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.08, 1.1), solarMat);
    solarWing.position.set(0, 4.5, 0);
    solarWing.rotation.x = 0.35;
    this.landerGroup.add(solarWing);

    const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.12, 0.32, 16), whiteMat);
    dish.position.set(-0.6, 3.3, 0.5);
    dish.rotation.z = 0.6;
    this.landerGroup.add(dish);

    // Center Vernier retro engine
    const retroBell = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.62, 0.8, 14), darkMat);
    retroBell.position.y = 0.55;
    this.landerGroup.add(retroBell);

    // 3 Tripod Landing Legs
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const legGroup = new THREE.Group();
      legGroup.position.set(Math.cos(angle) * 1.2, 1.4, Math.sin(angle) * 1.2);
      legGroup.rotation.y = angle;

      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.3, 8), whiteMat);
      strut.rotation.z = -0.62;
      strut.position.set(0.65, -0.75, 0);
      legGroup.add(strut);

      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.12, 12), goldMat);
      pad.position.set(1.35, -1.65, 0);
      legGroup.add(pad);

      this.landingLegs.push(legGroup);
      this.landerGroup.add(legGroup);
    }
  }

  // --- MARS: AEROSHELL & SKY CRANE SYSTEM ---
  private buildMarsDescentVehicle() {
    const heatShieldMat = new THREE.MeshStandardMaterial({
      color: 0x451a03,
      metalness: 0.4,
      roughness: 0.85
    });

    const carbonCompositeMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.3
    });

    const goldFoilMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.95,
      roughness: 0.2
    });

    const shellGeo = new THREE.ConeGeometry(3.2, 2.2, 24);
    const shell = new THREE.Mesh(shellGeo, heatShieldMat);
    shell.position.y = 2.4;
    shell.castShadow = true;
    this.landerGroup.add(shell);

    const trussGeo = new THREE.BoxGeometry(2.8, 0.6, 2.8);
    const truss = new THREE.Mesh(trussGeo, carbonCompositeMat);
    truss.position.y = 1.1;
    this.landerGroup.add(truss);

    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const pod = new THREE.Group();
      pod.position.set(Math.cos(angle) * 1.6, 1.0, Math.sin(angle) * 1.6);

      const nozzleGeo = new THREE.CylinderGeometry(0.18, 0.45, 0.9, 12);
      const nozzle = new THREE.Mesh(nozzleGeo, carbonCompositeMat);
      nozzle.rotation.z = Math.cos(angle) * 0.25;
      nozzle.rotation.x = Math.sin(angle) * 0.25;
      pod.add(nozzle);

      this.landerGroup.add(pod);
    }

    const roverBodyGeo = new THREE.BoxGeometry(2.0, 1.0, 1.6);
    const roverBody = new THREE.Mesh(roverBodyGeo, goldFoilMat);
    roverBody.position.y = 0.2;
    this.landerGroup.add(roverBody);

    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.PI / 4;
      const legGroup = new THREE.Group();
      legGroup.position.set(Math.cos(angle) * 1.5, 0.8, Math.sin(angle) * 1.5);

      const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.0, 8);
      const leg = new THREE.Mesh(legGeo, carbonCompositeMat);
      leg.rotation.z = -0.4;
      leg.position.set(0.5, -0.8, 0);
      legGroup.add(leg);

      const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 12);
      wheelGeo.rotateZ(Math.PI / 2);
      const wheel = new THREE.Mesh(wheelGeo, carbonCompositeMat);
      wheel.position.set(1.0, -1.6, 0);
      legGroup.add(wheel);

      this.landingLegs.push(legGroup);
      this.landerGroup.add(legGroup);
    }
  }

  // --- MARS: RECONNAISSANCE ORBITER (NON-LANDING ORBITAL PASS) ---
  private buildMarsOrbiter() {
    const goldBusMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.92,
      roughness: 0.18
    });
    const solarMat = new THREE.MeshStandardMaterial({
      color: 0x1e40af,
      metalness: 0.78,
      roughness: 0.2
    });
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.45,
      roughness: 0.3
    });
    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.35
    });

    // Hexagonal Gold Spacecraft Bus
    const bus = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 2.4, 6), goldBusMat);
    bus.rotation.x = Math.PI / 2;
    this.landerGroup.add(bus);

    // Twin Sweeping Deep-Space Solar Array Wings
    for (const side of [-1, 1]) {
      const wingArm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.4, 8), darkMat);
      wingArm.rotation.z = Math.PI / 2;
      wingArm.position.set(side * 1.9, 0, 0);
      this.landerGroup.add(wingArm);

      const wingPanel = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.08, 2.2), solarMat);
      wingPanel.position.set(side * 5.1, 0, 0);
      this.landerGroup.add(wingPanel);
    }

    // 3-Meter High-Gain Parabolic Dish
    const dish = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 0.18, 0.55, 20), dishMat);
    dish.position.set(0, 1.55, 0.3);
    this.landerGroup.add(dish);

    // Aft Ion/Hydrazine Thruster Nozzle
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.52, 0.95, 16), darkMat);
    nozzle.rotation.x = Math.PI / 2;
    nozzle.position.set(0, 0, -1.55);
    this.landerGroup.add(nozzle);
  }

  public start() {
    this.timeElapsed = 0;
    this.isActive = true;
    this.isComplete = false;
    this.hasWelcomed = false;
    soundManager.playLandingThruster(this.vehicleMode === 'mars_orbiter' ? 3.5 : 6.5);
  }

  public skip() {
    if (this.isComplete) return;
    this.timeElapsed = this.totalDuration;
    this.isComplete = true;
    this.isActive = false;
    if (this.vehicleMode !== 'mars_orbiter') {
      this.landerGroup.position.y = this.groundElevation;
    }
    if (this.thrusterPlume) this.thrusterPlume.visible = false;
    if (this.thrusterLight) this.thrusterLight.intensity = 0;
    if (this.dustRingMat) this.dustRingMat.opacity = 0;
  }

  public update(delta: number): LandingTelemetry {
    if (!this.isActive) {
      return {
        altitudeMeters: this.vehicleMode === 'mars_orbiter' ? 44 : 0,
        descentSpeedMps: 0,
        phase: this.vehicleMode === 'mars_orbiter' ? 'orbital_pass' : 'settled',
        progress: 1.0,
        isLandingActive: false,
        vehicleLabel: this.getVehicleLabel()
      };
    }

    this.timeElapsed += delta;
    const progress = Math.min(1.0, this.timeElapsed / this.totalDuration);

    // Special Mode: Mars Orbiter executes orbital flyby without landing on terrain
    if (this.vehicleMode === 'mars_orbiter') {
      const orbitAngle = progress * Math.PI * 1.15 - 0.55;
      const orbitRadius = 52;
      const alt = 44 + Math.sin(progress * Math.PI) * 8;
      this.landerGroup.position.set(
        this.landingTarget.x + Math.cos(orbitAngle) * orbitRadius,
        this.groundElevation + alt,
        this.landingTarget.z + Math.sin(orbitAngle) * orbitRadius
      );
      this.landerGroup.rotation.set(0, -orbitAngle, 0.14);
      const flicker = 0.8 + Math.sin(this.timeElapsed * 22) * 0.2;
      this.thrusterPlume.visible = true;
      this.thrusterPlume.scale.set(0.6, flicker * 1.1, 0.6);
      this.thrusterLight.intensity = 1.8 * flicker;
      this.dustRingMat.opacity = 0;

      if (progress >= 1.0 && !this.isComplete) {
        this.isComplete = true;
        this.isActive = false;
      }

      return {
        altitudeMeters: Math.round(alt * 10) / 10,
        descentSpeedMps: 3.4,
        phase: 'orbital_pass',
        progress,
        isLandingActive: this.isActive,
        vehicleLabel: this.getVehicleLabel()
      };
    }

    // Standard Surface Lander Descent (Apollo LM / Surveyor 3 / Mars Sky Crane)
    const startAltitude = 65;
    let currentAltitude = 0;
    let descentSpeed = 0;

    if (progress < 0.78) {
      const t = progress / 0.78;
      const altitudeFactor = Math.pow(1.0 - t, 2.2);
      currentAltitude = startAltitude * altitudeFactor;
      descentSpeed = (startAltitude * 2.2 * Math.pow(1.0 - t, 1.2)) / (this.totalDuration * 0.78);
    } else {
      currentAltitude = 0;
      descentSpeed = 0;
    }

    this.landerGroup.position.y = this.groundElevation + currentAltitude;

    if (progress < 0.78) {
      const wobble = Math.sin(this.timeElapsed * 4.0) * 0.03;
      const pitch = Math.cos(this.timeElapsed * 3.5) * 0.025;
      this.landerGroup.rotation.z = wobble;
      this.landerGroup.rotation.x = pitch;
    } else {
      this.landerGroup.rotation.z = 0;
      this.landerGroup.rotation.x = 0;
    }

    if (progress < 0.78) {
      const flicker = 0.85 + Math.sin(this.timeElapsed * 28.0) * 0.15;
      this.thrusterPlume.visible = true;
      this.thrusterPlume.scale.set(flicker, flicker * 1.2, flicker);
      this.thrusterLight.intensity = 2.5 * flicker;
    } else {
      this.thrusterPlume.visible = false;
      this.thrusterLight.intensity = 0;
    }

    if (currentAltitude < 14 && progress < 0.95) {
      const proximity = Math.max(0, 1.0 - currentAltitude / 14);
      const ringScale = 1.0 + proximity * 3.5;
      this.dustRing.scale.set(ringScale, ringScale, ringScale);
      this.dustRingMat.opacity =
        proximity * 0.65 * (1.0 - Math.max(0, (progress - 0.78) / 0.17));
    } else {
      this.dustRingMat.opacity = 0;
    }

    if (progress >= 0.78 && progress < 0.85) {
      const impactT = (progress - 0.78) / 0.07;
      const compression = Math.sin(impactT * Math.PI) * 0.28;
      this.landingLegs.forEach(leg => {
        leg.position.y = 1.4 - compression;
      });
      if (this.timeElapsed - delta < 0.78 * this.totalDuration) {
        soundManager.playTouchdown();
      }
    } else if (progress >= 0.85) {
      this.landingLegs.forEach(leg => {
        leg.position.y = 1.4;
      });
    }

    if (progress >= 0.88 && !this.hasWelcomed) {
      this.hasWelcomed = true;
      if (this.planet === 'moon' || this.planet === 'mars' || this.planet === 'earth') {
        narrationManager.speakLandingWelcome(this.planet);
      }
    }

    if (progress >= 1.0 && !this.isComplete) {
      this.isComplete = true;
      this.isActive = false;
    }

    const phase =
      progress < 0.55
        ? 'deorbit'
        : progress < 0.78
        ? 'terminal_descent'
        : progress < 0.88
        ? 'touchdown'
        : 'settled';

    return {
      altitudeMeters: Math.round(currentAltitude * 10) / 10,
      descentSpeedMps: Math.round(descentSpeed * 10) / 10,
      phase,
      progress,
      isLandingActive: this.isActive,
      vehicleLabel: this.getVehicleLabel()
    };
  }

  public updateCinematicCamera(camera: THREE.PerspectiveCamera, astronautPos: THREE.Vector3) {
    const progress = Math.min(1.0, this.timeElapsed / this.totalDuration);
    const target = new THREE.Vector3();

    if (this.vehicleMode === 'mars_orbiter') {
      target.copy(this.landerGroup.position);
      camera.position.set(
        this.landerGroup.position.x + 12,
        this.landerGroup.position.y + 4.5,
        this.landerGroup.position.z + 14
      );
      camera.lookAt(target);
      return;
    }

    if (progress < 0.78) {
      target.copy(this.landerGroup.position).add(new THREE.Vector3(0, 1.5, 0));
      const dist = 16.0 + (1.0 - progress / 0.78) * 22.0;
      const angle = 0.8 + progress * 0.4;
      const camY = this.landerGroup.position.y + 4.5 + (1.0 - progress / 0.78) * 12.0;

      camera.position.set(
        this.landingTarget.x + Math.sin(angle) * dist,
        camY,
        this.landingTarget.z + Math.cos(angle) * dist
      );
      camera.lookAt(target);
    } else {
      const blendT = (progress - 0.78) / 0.22;
      const easedBlend = 0.5 - 0.5 * Math.cos(blendT * Math.PI);

      const landerFocus = new THREE.Vector3(
        this.landingTarget.x,
        this.groundElevation + 1.5,
        this.landingTarget.z
      );
      const astronautFocus = new THREE.Vector3(
        astronautPos.x,
        astronautPos.y + 1.05,
        astronautPos.z
      );
      target.lerpVectors(landerFocus, astronautFocus, easedBlend);

      const startCam = new THREE.Vector3(
        this.landingTarget.x + 12.0,
        this.groundElevation + 5.0,
        this.landingTarget.z + 12.0
      );
      const endCam = new THREE.Vector3(
        astronautPos.x,
        astronautPos.y + 2.5,
        astronautPos.z - 7.2
      );

      camera.position.lerpVectors(startCam, endCam, easedBlend);
      camera.lookAt(target);
    }
  }

  public getDustRing(): THREE.Mesh {
    return this.dustRing;
  }

  public getIsActive(): boolean {
    return this.isActive;
  }

  public getIsComplete(): boolean {
    return this.isComplete;
  }
}
