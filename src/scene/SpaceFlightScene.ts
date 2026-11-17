import * as THREE from 'three';
import { ProceduralTextures } from './ProceduralTextures';
import { ShuttleSurfacePlanet, computeCruiseProgress } from '../shuttle/shuttleSystem';

export class SpaceFlightScene {
  public scene: THREE.Scene;
  private starPoints: THREE.Points;
  private starPositions: Float32Array;
  private starCount: number = 1400;

  private originGroup: THREE.Group;
  private originMesh: THREE.Mesh;
  private originMat: THREE.MeshStandardMaterial;
  private originGlowMat: THREE.MeshBasicMaterial;
  private originClouds: THREE.Mesh;

  private targetGroup: THREE.Group;
  private targetMesh: THREE.Mesh;
  private targetMat: THREE.MeshStandardMaterial;
  private targetGlowMat: THREE.MeshBasicMaterial;
  private targetClouds: THREE.Mesh;

  private sunLight: THREE.DirectionalLight;
  private rimLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;
  private elapsed: number = 0;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020617);

    this.ambientLight = new THREE.AmbientLight(0x334155, 0.52);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xfffbeb, 3.0);
    this.sunLight.position.set(45, 28, 32);
    this.scene.add(this.sunLight);

    this.rimLight = new THREE.DirectionalLight(0x38bdf8, 0.9);
    this.rimLight.position.set(-35, -12, -25);
    this.scene.add(this.rimLight);

    // 1. Streaming Deep-Space Starfield
    const starGeo = new THREE.BufferGeometry();
    this.starPositions = new Float32Array(this.starCount * 3);
    for (let i = 0; i < this.starCount; i++) {
      const r = 18 + Math.random() * 140;
      const a = Math.random() * Math.PI * 2;
      this.starPositions[i * 3] = Math.cos(a) * r;
      this.starPositions[i * 3 + 1] = Math.sin(a) * r;
      this.starPositions[i * 3 + 2] = (Math.random() - 0.5) * 320;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(this.starPositions, 3));
    this.starPoints = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({
        color: 0xf8fafc,
        size: 1.15,
        transparent: true,
        opacity: 0.92,
        map: ProceduralTextures.getStarParticleTexture()
      })
    );
    this.scene.add(this.starPoints);

    // 2. Origin Planet Rig (Receding behind -Z)
    this.originGroup = new THREE.Group();
    this.originMat = new THREE.MeshStandardMaterial({ roughness: 0.65, metalness: 0.08 });
    this.originMesh = new THREE.Mesh(new THREE.SphereGeometry(14, 48, 36), this.originMat);
    this.originGroup.add(this.originMesh);

    this.originClouds = new THREE.Mesh(
      new THREE.SphereGeometry(14.3, 36, 28),
      new THREE.MeshStandardMaterial({
        map: ProceduralTextures.getEarthCloudsTexture(),
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      })
    );
    this.originGroup.add(this.originClouds);

    this.originGlowMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide
    });
    this.originGroup.add(new THREE.Mesh(new THREE.SphereGeometry(15.2, 32, 24), this.originGlowMat));
    this.scene.add(this.originGroup);

    // 3. Target Planet Rig (Approaching ahead +Z)
    this.targetGroup = new THREE.Group();
    this.targetMat = new THREE.MeshStandardMaterial({ roughness: 0.65, metalness: 0.08 });
    this.targetMesh = new THREE.Mesh(new THREE.SphereGeometry(16, 48, 36), this.targetMat);
    this.targetGroup.add(this.targetMesh);

    this.targetClouds = new THREE.Mesh(
      new THREE.SphereGeometry(16.3, 36, 28),
      new THREE.MeshStandardMaterial({
        map: ProceduralTextures.getEarthCloudsTexture(),
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      })
    );
    this.targetGroup.add(this.targetClouds);

    this.targetGlowMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.24,
      side: THREE.BackSide
    });
    this.targetGroup.add(new THREE.Mesh(new THREE.SphereGeometry(17.4, 32, 24), this.targetGlowMat));
    this.scene.add(this.targetGroup);
  }

  private applyPlanetStyle(
    planet: ShuttleSurfacePlanet,
    mat: THREE.MeshStandardMaterial,
    glowMat: THREE.MeshBasicMaterial,
    clouds: THREE.Mesh
  ) {
    if (planet === 'earth') {
      mat.map = ProceduralTextures.getEarthTexture();
      mat.color.setHex(0xffffff);
      mat.roughness = 0.45;
      glowMat.color.setHex(0x38bdf8);
      glowMat.opacity = 0.28;
      clouds.visible = true;
    } else if (planet === 'moon') {
      mat.map = ProceduralTextures.getMoonTexture();
      mat.color.setHex(0xf1f5f9);
      mat.roughness = 0.92;
      glowMat.color.setHex(0x94a3b8);
      glowMat.opacity = 0.1;
      clouds.visible = false;
    } else {
      mat.map = ProceduralTextures.getMarsTexture();
      mat.color.setHex(0xffffff);
      mat.roughness = 0.82;
      glowMat.color.setHex(0xf97316);
      glowMat.opacity = 0.24;
      clouds.visible = false;
    }
    mat.needsUpdate = true;
  }

  public configureRoute(origin: ShuttleSurfacePlanet, target: ShuttleSurfacePlanet) {
    this.elapsed = 0;
    this.applyPlanetStyle(origin, this.originMat, this.originGlowMat, this.originClouds);
    this.applyPlanetStyle(target, this.targetMat, this.targetGlowMat, this.targetClouds);
  }

  public update(delta: number, progress: number) {
    this.elapsed += delta;
    const cruise = computeCruiseProgress(progress);

    // Stream stars backward along -Z to convey smooth orbital travel
    const starSpeed = 38 + Math.sin(progress * Math.PI) * 52;
    for (let i = 0; i < this.starCount; i++) {
      let z = this.starPositions[i * 3 + 2] - delta * starSpeed;
      if (z < -160) z += 320;
      this.starPositions[i * 3 + 2] = z;
    }
    (this.starPoints.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;

    // Position Origin receding behind (-Z, slight lower left)
    this.originGroup.position.set(-14 - progress * 16, -6 - progress * 8, -cruise.originDistance);
    this.originGroup.scale.setScalar(cruise.originScale);
    this.originMesh.rotation.y += delta * 0.08;
    this.originClouds.rotation.y += delta * 0.1;

    // Position Target approaching ahead (+Z, slight upper right settling toward center)
    const offsetX = 12 * (1 - progress);
    const offsetY = 4 * (1 - progress);
    this.targetGroup.position.set(offsetX, offsetY, cruise.targetDistance);
    this.targetGroup.scale.setScalar(cruise.targetScale);
    this.targetMesh.rotation.y += delta * 0.06;
    this.targetClouds.rotation.y += delta * 0.08;
  }

  public dispose() {
    this.starPoints.geometry.dispose();
    (this.starPoints.material as THREE.Material).dispose();
    this.originMesh.geometry.dispose();
    this.originMat.dispose();
    this.originGlowMat.dispose();
    this.originClouds.geometry.dispose();
    (this.originClouds.material as THREE.Material).dispose();
    this.targetMesh.geometry.dispose();
    this.targetMat.dispose();
    this.targetGlowMat.dispose();
    this.targetClouds.geometry.dispose();
    (this.targetClouds.material as THREE.Material).dispose();
  }
}
