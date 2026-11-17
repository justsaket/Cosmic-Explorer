import * as THREE from 'three';
import { ProceduralTextures } from '../scene/ProceduralTextures';
import { HabitablePlanetId, ShuttleCameraView } from './shuttleTravelState';
import { SpaceShuttleModel, ShuttleCameraLookOffset } from './SpaceShuttleModel';

/**
 * Dedicated 3D Interplanetary Travel Scene rendered during
 * `space_travel` and `approach` phases between Earth, Moon, and Mars.
 *
 * Uses the exact same SpaceShuttleModel instance flying continuously in real 3D
 * space along +Z from origin world (-145) toward destination world (+235), while
 * both Camera A (cockpit), Camera B (external chase), and PiP track the single
 * moving spacecraft with zero teleportation or duplicate worlds.
 */
export class InterplanetaryTravelScene {
  public scene: THREE.Scene;
  private starfield: THREE.Points;
  private originPlanetGroup: THREE.Group;
  private originPlanetMesh: THREE.Mesh;
  private originCloudsMesh: THREE.Mesh;
  private originAtmosphereMat: THREE.MeshBasicMaterial;
  private destPlanetGroup: THREE.Group;
  private destPlanetMesh: THREE.Mesh;
  private destAtmosphereMesh: THREE.Mesh;
  private destCloudsMesh: THREE.Mesh;
  private sunLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;

  private originMat: THREE.MeshStandardMaterial;
  private destMat: THREE.MeshStandardMaterial;
  private destAtmosphereMat: THREE.MeshBasicMaterial;

  constructor(envMap?: THREE.Texture) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x01040a);

    if (envMap) {
      this.scene.environment = envMap;
    }

    this.ambientLight = new THREE.AmbientLight(0x334155, 0.55);
    this.scene.add(this.ambientLight);

    const hemi = new THREE.HemisphereLight(0x93c5fd, 0x0f172a, 0.45);
    this.scene.add(hemi);

    this.sunLight = new THREE.DirectionalLight(0xfffbeb, 3.1);
    this.sunLight.position.set(55, 34, 42);
    this.scene.add(this.sunLight);

    // 1. Deep 3D Starfield distributed cleanly through the flight corridor
    const starCount = 2600;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radial = 28 + Math.random() * 260;
      starPositions[i * 3] = Math.cos(angle) * radial;
      starPositions[i * 3 + 1] = Math.sin(angle) * radial;
      starPositions[i * 3 + 2] = -260 + Math.random() * 720;

      const tint = Math.random();
      if (tint > 0.82) {
        starColors[i * 3] = 0.72;
        starColors[i * 3 + 1] = 0.88;
        starColors[i * 3 + 2] = 1.0;
      } else if (tint > 0.65) {
        starColors[i * 3] = 1.0;
        starColors[i * 3 + 1] = 0.88;
        starColors[i * 3 + 2] = 0.65;
      } else {
        starColors[i * 3] = 0.96;
        starColors[i * 3 + 1] = 0.98;
        starColors[i * 3 + 2] = 1.0;
      }
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 1.45,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      map: ProceduralTextures.getStarParticleTexture()
    });
    this.starfield = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starfield);

    // 2. Origin Planet (positioned aft at -Z so it naturally recedes as shuttle accelerates +Z)
    this.originPlanetGroup = new THREE.Group();
    this.originPlanetGroup.position.set(-22, -7, -140);
    this.scene.add(this.originPlanetGroup);

    this.originMat = new THREE.MeshStandardMaterial({
      map: ProceduralTextures.getEarthTexture(),
      roughness: 0.65,
      metalness: 0.08
    });
    this.originPlanetMesh = new THREE.Mesh(
      new THREE.SphereGeometry(24, 42, 42),
      this.originMat
    );
    this.originPlanetGroup.add(this.originPlanetMesh);

    this.originCloudsMesh = new THREE.Mesh(
      new THREE.SphereGeometry(24.5, 36, 36),
      new THREE.MeshStandardMaterial({
        map: ProceduralTextures.getEarthCloudsTexture(),
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
      })
    );
    this.originPlanetGroup.add(this.originCloudsMesh);

    this.originAtmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide
    });
    const originAtm = new THREE.Mesh(
      new THREE.SphereGeometry(25.8, 32, 32),
      this.originAtmosphereMat
    );
    this.originPlanetGroup.add(originAtm);

    // 3. Destination Planet ahead at +Z (stationary world anchor; shuttle flies toward it!)
    this.destPlanetGroup = new THREE.Group();
    this.destPlanetGroup.position.set(4, 1.5, 225);
    this.scene.add(this.destPlanetGroup);

    this.destMat = new THREE.MeshStandardMaterial({
      map: ProceduralTextures.getMoonTexture(),
      roughness: 0.75,
      metalness: 0.06
    });
    this.destPlanetMesh = new THREE.Mesh(
      new THREE.SphereGeometry(34, 48, 48),
      this.destMat
    );
    this.destPlanetGroup.add(this.destPlanetMesh);

    this.destCloudsMesh = new THREE.Mesh(
      new THREE.SphereGeometry(34.7, 40, 40),
      new THREE.MeshStandardMaterial({
        map: ProceduralTextures.getEarthCloudsTexture(),
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending
      })
    );
    this.destPlanetGroup.add(this.destCloudsMesh);

    this.destAtmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide
    });
    this.destAtmosphereMesh = new THREE.Mesh(
      new THREE.SphereGeometry(36.8, 36, 36),
      this.destAtmosphereMat
    );
    this.destPlanetGroup.add(this.destAtmosphereMesh);
  }

  private applyPlanetStyle(
    mat: THREE.MeshStandardMaterial,
    planet: HabitablePlanetId
  ) {
    if (planet === 'earth') {
      mat.map = ProceduralTextures.getEarthTexture();
      mat.color.setHex(0xffffff);
      mat.roughness = 0.45;
      mat.emissive.setHex(0x0c4a6e);
      mat.emissiveIntensity = 0.14;
    } else if (planet === 'moon') {
      mat.map = ProceduralTextures.getMoonTexture();
      mat.color.setHex(0xf1f5f9);
      mat.roughness = 0.92;
      mat.emissive.setHex(0x334155);
      mat.emissiveIntensity = 0.08;
    } else {
      mat.map = ProceduralTextures.getMarsTexture();
      mat.color.setHex(0xffffff);
      mat.roughness = 0.82;
      mat.emissive.setHex(0x7c2d12);
      mat.emissiveIntensity = 0.14;
    }
    mat.needsUpdate = true;
  }

  public configureRoute(origin: HabitablePlanetId, destination: HabitablePlanetId) {
    this.applyPlanetStyle(this.originMat, origin);
    this.applyPlanetStyle(this.destMat, destination);

    this.originCloudsMesh.visible = origin === 'earth';
    this.originAtmosphereMat.color.setHex(
      origin === 'earth' ? 0x38bdf8 : origin === 'mars' ? 0xea580c : 0x94a3b8
    );
    this.originAtmosphereMat.opacity = origin === 'moon' ? 0.06 : 0.26;
    this.originAtmosphereMat.needsUpdate = true;

    this.destCloudsMesh.visible = destination === 'earth';

    if (destination === 'earth') {
      this.destAtmosphereMat.color.setHex(0x38bdf8);
      this.destAtmosphereMat.opacity = 0.34;
    } else if (destination === 'mars') {
      this.destAtmosphereMat.color.setHex(0xea580c);
      this.destAtmosphereMat.opacity = 0.28;
    } else {
      this.destAtmosphereMat.color.setHex(0x94a3b8);
      this.destAtmosphereMat.opacity = 0.08;
    }
    this.destAtmosphereMat.needsUpdate = true;
  }

  /**
   * Advances real 3D interplanetary spacecraft motion along +Z from origin toward destination,
   * updates vacuum nozzle propulsion + RCS verniers, and rotates origin/target globes.
   * Separated from camera rendering so Main + Picture-in-Picture passes share exact frame state.
   */
  public updateSimulation(
    delta: number,
    time: number,
    shuttle: SpaceShuttleModel,
    phase: 'space_travel' | 'approach',
    phaseProgress: number
  ) {
    if (shuttle.group.parent !== this.scene) {
      this.scene.add(shuttle.group);
    }

    // Continuous combined cruise + approach progress (0..1)
    const combinedT = phase === 'space_travel' ? phaseProgress * 0.62 : 0.62 + phaseProgress * 0.38;

    // Physical 3D spacecraft translation along trajectory arc from z = -68 to z = +158
    const posZ = THREE.MathUtils.lerp(-68, 158, Math.pow(combinedT, 1.05));
    const posX = Math.sin(combinedT * Math.PI) * -6.5 + Math.sin(time * 0.8) * 0.18;
    const posY = Math.sin(combinedT * Math.PI * 0.85) * 3.2 + Math.cos(time * 1.0) * 0.14;

    shuttle.group.position.set(posX, posY, posZ);

    // Subtle pitch-down alignment toward target globe during orbital insertion approach
    const approachPitch = phase === 'approach' ? phaseProgress * 0.12 : 0;
    const yawAlign = THREE.MathUtils.lerp(0.05, 0.015, combinedT);
    shuttle.group.rotation.set(
      approachPitch + Math.sin(time * 0.7) * 0.018,
      yawAlign,
      Math.cos(time * 0.85) * 0.032
    );
    shuttle.setGearAndRampState(0, 0);

    // Vacuum propulsion: clean blue-white plasma plumes & nozzle particles, ZERO atmospheric smoke
    const thrust = phase === 'space_travel' ? 0.94 : Math.max(0.35, 0.72 - phaseProgress * 0.32);
    const rcs = phase === 'approach' ? 0.85 : 0.18;
    shuttle.updatePropulsion({
      delta,
      intensity: thrust,
      time,
      environment: 'space',
      dustIntensity: 0,
      altitudeMeters: 420000,
      rcsActivity: rcs
    });

    // Natural planetary rotation on both globes
    this.originPlanetMesh.rotation.y += delta * 0.08;
    this.originCloudsMesh.rotation.y += delta * 0.1;
    this.destPlanetMesh.rotation.y += delta * 0.09;
    this.destCloudsMesh.rotation.y += delta * 0.11;
  }

  /**
   * Convenience helper combining simulation update + single-camera framing.
   */
  public update(
    delta: number,
    time: number,
    shuttle: SpaceShuttleModel,
    phase: 'space_travel' | 'approach',
    phaseProgress: number,
    camera: THREE.PerspectiveCamera,
    cameraView: ShuttleCameraView,
    lookOffset?: ShuttleCameraLookOffset
  ) {
    this.updateSimulation(delta, time, shuttle, phase, phaseProgress);
    shuttle.applyCockpitOrChaseCamera(camera, cameraView, 1.0, false, lookOffset);
  }
}
