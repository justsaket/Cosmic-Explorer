import * as THREE from 'three';
import { ProceduralTextures } from '../scene/ProceduralTextures';

export type AstronautPosture = 'stand' | 'sit' | 'sleep';

export class AstronautModel {
  public group: THREE.Group;
  private postureGroup: THREE.Group;

  // Hierarchical limbs for procedural kinematics
  private leftLeg: THREE.Group;
  private rightLeg: THREE.Group;
  private leftArm: THREE.Group;
  private rightArm: THREE.Group;
  private torso: THREE.Mesh;
  private head: THREE.Group;
  private outerVisor: THREE.Mesh;
  private innerVisor: THREE.Mesh;
  private visorFresnelRim: THREE.Mesh;
  private visorHudOverlay: THREE.Mesh;
  private helmetSpotlight: THREE.SpotLight;
  private backpack: THREE.Group;
  private faceGroup: THREE.Group;
  private faceMesh: THREE.Mesh;
  private inHelmetLight: THREE.PointLight;
  private faceMat: THREE.MeshStandardMaterial;

  // Advanced PBR Materials
  private suitFabricMat: THREE.MeshPhysicalMaterial;
  private metallicAlloyMat: THREE.MeshStandardMaterial;
  private goldMetalMat: THREE.MeshStandardMaterial;
  private rubberSealMat: THREE.MeshStandardMaterial;
  private bootSoleMat: THREE.MeshStandardMaterial;

  // Visor Materials
  private goldVisorMat: THREE.MeshPhysicalMaterial;
  private clearVisorMat: THREE.MeshPhysicalMaterial;
  private fresnelRimMat: THREE.ShaderMaterial;
  private hudOverlayMat: THREE.MeshBasicMaterial;

  // State
  private walkTime: number = 0;
  private currentVisorMode: 'gold_mirror' | 'hud_display' | 'clear_face' = 'gold_mirror';
  private isCloaked: boolean = false;
  private isScanning: boolean = false;
  private isCollecting: boolean = false;
  private posture: 'stand' | 'sit' | 'sleep' = 'stand';

  // Field Scanner Equipment
  private scannerTool: THREE.Group;
  private scannerBeamMesh: THREE.Mesh;

  constructor() {
    this.group = new THREE.Group();
    this.postureGroup = new THREE.Group();
    this.group.add(this.postureGroup);

    // 1. PBR SUIT & COMPONENT MATERIALS
    this.suitFabricMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      roughness: 0.42,
      metalness: 0.08,
      clearcoat: 0.16,
      clearcoatRoughness: 0.28,
      sheen: 0.35,
      sheenColor: new THREE.Color(0xffffff)
    });

    this.metallicAlloyMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      metalness: 0.88,
      roughness: 0.20
    });

    this.goldMetalMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.96,
      roughness: 0.12
    });

    this.rubberSealMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.72,
      metalness: 0.22
    });

    this.bootSoleMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.88,
      metalness: 0.15
    });

    // 2. PBR VISOR MATERIALS WITH REFLECTIONS
    this.goldVisorMat = new THREE.MeshPhysicalMaterial({
      color: 0xd97706,
      emissive: 0x451a03,
      emissiveIntensity: 0.15,
      roughness: 0.04,
      metalness: 0.98,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03,
      reflectivity: 1.0
    });

    this.clearVisorMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      roughness: 0.03,
      metalness: 0.18,
      transparent: true,
      opacity: 0.32,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      reflectivity: 1.0,
      depthWrite: false
    });

    // 3. FRESNEL-BASED RIM LIGHT SHADER ON THE VISOR
    // Produces a luminous view-angle dependent halo around the curved outer edge of the visor dome
    const fresnelVertexShader = `
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fresnelFragmentShader = `
      uniform vec3 rimColor;
      uniform float rimPower;
      uniform float rimIntensity;
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);
        float dotNV = max(dot(viewDir, normal), 0.0);
        float fresnel = pow(1.0 - dotNV, rimPower);
        gl_FragColor = vec4(rimColor, fresnel * rimIntensity);
      }
    `;

    this.fresnelRimMat = new THREE.ShaderMaterial({
      uniforms: {
        rimColor: { value: new THREE.Color(0xf59e0b) }, // Warm gold default
        rimPower: { value: 2.8 },
        rimIntensity: { value: 1.4 }
      },
      vertexShader: fresnelVertexShader,
      fragmentShader: fresnelFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.FrontSide
    });

    // 4. IN-VISOR HOLOGRAPHIC COLLIMATED HUD DISPLAY OVERLAY MATERIAL
    const hudTexture = ProceduralTextures.getVisorHudTexture();
    this.hudOverlayMat = new THREE.MeshBasicMaterial({
      map: hudTexture,
      transparent: true,
      opacity: 0.0, // Invisible in gold mode, visible in HUD mode
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    // 5. TORSO ASSEMBLY
    const torsoGeo = new THREE.CylinderGeometry(0.38, 0.33, 0.82, 16);
    this.torso = new THREE.Mesh(torsoGeo, this.suitFabricMat);
    this.torso.position.y = 1.05;
    this.torso.castShadow = true;
    this.postureGroup.add(this.torso);

    // Torso Metallic Girdle / Lumbar Band
    const lumbarBandGeo = new THREE.TorusGeometry(0.36, 0.025, 8, 24);
    lumbarBandGeo.rotateX(Math.PI / 2);
    const lumbarBand = new THREE.Mesh(lumbarBandGeo, this.metallicAlloyMat);
    lumbarBand.position.y = -0.22;
    this.torso.add(lumbarBand);

    // Chest Remote Control Unit (RCU) with Metallic Housings & Umbilicals
    const chestPackGeo = new THREE.BoxGeometry(0.36, 0.32, 0.16);
    const chestPack = new THREE.Mesh(chestPackGeo, this.rubberSealMat);
    chestPack.position.set(0, 0.06, 0.26);
    this.torso.add(chestPack);

    // RCU Metallic Faceplate Frame
    const rcuFrameGeo = new THREE.BoxGeometry(0.34, 0.30, 0.02);
    const rcuFrame = new THREE.Mesh(rcuFrameGeo, this.metallicAlloyMat);
    rcuFrame.position.set(0, 0.06, 0.35);
    this.torso.add(rcuFrame);

    // Dual Anodized Umbilical Quick-Disconnect Couplers (O2 Blue / Water Red)
    const couplerGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.06, 12);
    couplerGeo.rotateX(Math.PI / 2);

    const blueCouplerMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.85, roughness: 0.25 });
    const blueCoupler = new THREE.Mesh(couplerGeo, blueCouplerMat);
    blueCoupler.position.set(-0.10, -0.04, 0.37);
    this.torso.add(blueCoupler);

    const redCouplerMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, metalness: 0.85, roughness: 0.25 });
    const redCoupler = new THREE.Mesh(couplerGeo, redCouplerMat);
    redCoupler.position.set(0.10, -0.04, 0.37);
    this.torso.add(redCoupler);

    // Metallic Control Switch Bar
    const switchBarGeo = new THREE.BoxGeometry(0.18, 0.03, 0.03);
    const switchBar = new THREE.Mesh(switchBarGeo, this.goldMetalMat);
    switchBar.position.set(0, 0.12, 0.37);
    this.torso.add(switchBar);

    // 6. HELMET & VISOR ASSEMBLY
    this.head = new THREE.Group();
    this.head.position.y = 0.60;

    // Golden Neck Seal Ring & Helmet Locking Collar
    const neckRingGeo = new THREE.TorusGeometry(0.28, 0.04, 12, 28);
    neckRingGeo.rotateX(Math.PI / 2);
    const neckRing = new THREE.Mesh(neckRingGeo, this.goldMetalMat);
    neckRing.position.y = -0.15;
    this.head.add(neckRing);

    // Helmet Outer Composite Shell
    const helmetGeo = new THREE.SphereGeometry(0.35, 28, 28);
    const helmet = new THREE.Mesh(helmetGeo, this.suitFabricMat);
    helmet.castShadow = true;
    this.head.add(helmet);

    // Astronaut Head & Face Assembly inside Helmet
    this.faceGroup = new THREE.Group();
    this.faceGroup.position.set(0, 0, 0.04);

    // Anatomical head base (skin tone)
    const headSkinMat = new THREE.MeshStandardMaterial({
      color: 0xcaa07a,
      roughness: 0.68,
      metalness: 0.05
    });
    const headBaseGeo = new THREE.SphereGeometry(0.22, 20, 20);
    const headBaseMesh = new THREE.Mesh(headBaseGeo, headSkinMat);
    this.faceGroup.add(headBaseMesh);

    // Dark curly hair volume on top and sides matching astronaut portrait
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x17120e,
      roughness: 0.88,
      metalness: 0.1
    });
    const hairCrownGeo = new THREE.SphereGeometry(0.228, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.48);
    const hairCrown = new THREE.Mesh(hairCrownGeo, hairMat);
    hairCrown.position.set(0, 0.02, -0.01);
    this.faceGroup.add(hairCrown);

    // Enhanced face mesh with portrait texture
    const faceTexture = ProceduralTextures.getAstronautFaceTexture();
    this.faceMat = new THREE.MeshStandardMaterial({
      map: faceTexture,
      roughness: 0.55,
      metalness: 0.05
    });

    // Attempt to load photo texture directly if available
    const texLoader = new THREE.TextureLoader();
    texLoader.load(
      '/assets/aistudio/Image_November_06__2026_-_10_02PM_4833a130',
      (loadedTex) => {
        loadedTex.colorSpace = THREE.SRGBColorSpace;
        this.faceMat.map = loadedTex;
        this.faceMat.needsUpdate = true;
      },
      undefined,
      () => {
        // Keeps procedural enhanced face texture on error
      }
    );

    const faceGeo = new THREE.SphereGeometry(0.224, 20, 20, 0, Math.PI, 0, Math.PI * 0.65);
    this.faceMesh = new THREE.Mesh(faceGeo, this.faceMat);
    this.faceMesh.rotation.x = -Math.PI / 2;
    this.faceMesh.position.set(0, 0, 0.01);
    this.faceGroup.add(this.faceMesh);

    // In-helmet interior cockpit LED light (illuminates face when clear visor is chosen)
    this.inHelmetLight = new THREE.PointLight(0xbae6fd, 0, 0.8, 1.2);
    this.inHelmetLight.position.set(0, 0.14, 0.12);
    this.faceGroup.add(this.inHelmetLight);

    // Default to hidden when gold mirror is on
    this.faceGroup.visible = false;
    this.head.add(this.faceGroup);

    // Inner Glass Visor Dome
    const innerVisorGeo = new THREE.SphereGeometry(0.285, 24, 24, 0, Math.PI, 0, Math.PI * 0.75);
    this.innerVisor = new THREE.Mesh(innerVisorGeo, this.clearVisorMat);
    this.innerVisor.rotation.x = -Math.PI / 2;
    this.innerVisor.position.set(0, 0, 0.12);
    this.head.add(this.innerVisor);

    // In-Visor Collimated Holographic HUD Display Overlay Mesh
    const hudGeo = new THREE.SphereGeometry(0.288, 24, 24, 0, Math.PI, 0, Math.PI * 0.72);
    this.visorHudOverlay = new THREE.Mesh(hudGeo, this.hudOverlayMat);
    this.visorHudOverlay.rotation.x = -Math.PI / 2;
    this.visorHudOverlay.position.set(0, 0, 0.124);
    this.head.add(this.visorHudOverlay);

    // Outer Protective Visor Dome (Gold Mirror / PBR Clear)
    const outerVisorGeo = new THREE.SphereGeometry(0.30, 24, 24, 0, Math.PI, 0, Math.PI * 0.72);
    this.outerVisor = new THREE.Mesh(outerVisorGeo, this.goldVisorMat);
    this.outerVisor.rotation.x = -Math.PI / 2;
    this.outerVisor.position.set(0, 0, 0.13);
    this.head.add(this.outerVisor);

    // Fresnel Rim Light Shell Mesh (Concentric slightly expanded dome for edge halo)
    const fresnelGeo = new THREE.SphereGeometry(0.306, 24, 24, 0, Math.PI, 0, Math.PI * 0.72);
    this.visorFresnelRim = new THREE.Mesh(fresnelGeo, this.fresnelRimMat);
    this.visorFresnelRim.rotation.x = -Math.PI / 2;
    this.visorFresnelRim.position.set(0, 0, 0.132);
    this.head.add(this.visorFresnelRim);

    // Metallic Helmet Visor Bezel / Rim Bracket
    const bezelGeo = new THREE.TorusGeometry(0.298, 0.015, 8, 24, Math.PI);
    const visorBezel = new THREE.Mesh(bezelGeo, this.metallicAlloyMat);
    visorBezel.position.set(0, 0.04, 0.13);
    this.head.add(visorBezel);

    // Dual Helmet Floodlights with Anodized Bezels
    const lampGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.09, 12);
    lampGeo.rotateX(Math.PI / 2);
    const lampMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.2,
      metalness: 0.8
    });

    const leftLamp = new THREE.Mesh(lampGeo, lampMat);
    leftLamp.position.set(-0.28, 0.14, 0.18);
    this.head.add(leftLamp);

    const rightLamp = new THREE.Mesh(lampGeo, lampMat);
    rightLamp.position.set(0.28, 0.14, 0.18);
    this.head.add(rightLamp);

    // Active forward spotlight from helmet
    this.helmetSpotlight = new THREE.SpotLight(0xf8fafc, 2.5, 30, Math.PI / 4, 0.4, 1.2);
    this.helmetSpotlight.position.set(0, 0.15, 0.3);
    this.helmetSpotlight.target.position.set(0, 0.15, 8.0);
    this.head.add(this.helmetSpotlight);
    this.head.add(this.helmetSpotlight.target);

    this.torso.add(this.head);

    // 7. PLSS BACKPACK (Portable Life Support System)
    this.backpack = new THREE.Group();
    this.backpack.position.set(0, 0.05, -0.34);

    const packBodyGeo = new THREE.BoxGeometry(0.52, 0.74, 0.26);
    const packBody = new THREE.Mesh(packBodyGeo, this.suitFabricMat);
    packBody.castShadow = true;
    this.backpack.add(packBody);

    // Metallic Upper Manifold Plate
    const manifoldGeo = new THREE.BoxGeometry(0.48, 0.08, 0.22);
    const manifold = new THREE.Mesh(manifoldGeo, this.metallicAlloyMat);
    manifold.position.set(0, 0.39, 0);
    this.backpack.add(manifold);

    // Dual High-Pressure Oxygen/Nitrogen Tanks with Brushed Metallic Finish
    const tankGeo = new THREE.CylinderGeometry(0.095, 0.095, 0.58, 16);
    const tankL = new THREE.Mesh(tankGeo, this.metallicAlloyMat);
    tankL.position.set(-0.17, 0.05, -0.06);
    this.backpack.add(tankL);

    const tankR = new THREE.Mesh(tankGeo, this.metallicAlloyMat);
    tankR.position.set(0.17, 0.05, -0.06);
    this.backpack.add(tankR);

    // Metallic High-Pressure Valves
    const valveGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.08, 8);
    const valveL = new THREE.Mesh(valveGeo, this.goldMetalMat);
    valveL.position.set(-0.17, 0.38, -0.06);
    this.backpack.add(valveL);

    const valveR = new THREE.Mesh(valveGeo, this.goldMetalMat);
    valveR.position.set(0.17, 0.38, -0.06);
    this.backpack.add(valveR);

    // Subsurface Georadar Scanner Dish & Comm Antenna
    const antennaMastGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.5, 6);
    const antennaMast = new THREE.Mesh(antennaMastGeo, this.metallicAlloyMat);
    antennaMast.position.set(0.2, 0.52, 0);
    this.backpack.add(antennaMast);

    const radarDishGeo = new THREE.CylinderGeometry(0.08, 0.02, 0.04, 16);
    const radarDish = new THREE.Mesh(radarDishGeo, this.goldMetalMat);
    radarDish.position.set(0.2, 0.77, 0);
    this.backpack.add(radarDish);

    this.torso.add(this.backpack);

    // 8. ARTICULATED LEGS & METALLIC JOINTS
    const legGeo = new THREE.CylinderGeometry(0.13, 0.11, 0.65, 12);
    const bootGeo = new THREE.BoxGeometry(0.23, 0.18, 0.40);
    const kneeRingGeo = new THREE.TorusGeometry(0.125, 0.025, 8, 16);
    kneeRingGeo.rotateX(Math.PI / 2);

    // Left Leg
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-0.21, 0.68, 0);
    const leftThigh = new THREE.Mesh(legGeo, this.suitFabricMat);
    leftThigh.position.y = -0.3;
    leftThigh.castShadow = true;
    this.leftLeg.add(leftThigh);

    const leftKneeRing = new THREE.Mesh(kneeRingGeo, this.metallicAlloyMat);
    leftKneeRing.position.y = -0.3;
    this.leftLeg.add(leftKneeRing);

    const leftBoot = new THREE.Mesh(bootGeo, this.bootSoleMat);
    leftBoot.position.set(0, -0.6, 0.06);
    leftBoot.castShadow = true;
    this.leftLeg.add(leftBoot);
    this.postureGroup.add(this.leftLeg);

    // Right Leg
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(0.21, 0.68, 0);
    const rightThigh = new THREE.Mesh(legGeo, this.suitFabricMat);
    rightThigh.position.y = -0.3;
    rightThigh.castShadow = true;
    this.rightLeg.add(rightThigh);

    const rightKneeRing = new THREE.Mesh(kneeRingGeo, this.metallicAlloyMat);
    rightKneeRing.position.y = -0.3;
    this.rightLeg.add(rightKneeRing);

    const rightBoot = new THREE.Mesh(bootGeo, this.bootSoleMat);
    rightBoot.position.set(0, -0.6, 0.06);
    rightBoot.castShadow = true;
    this.rightLeg.add(rightBoot);
    this.postureGroup.add(this.rightLeg);

    // 9. ARMS & METALLIC WRIST COUPLINGS
    const armGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.56, 12);
    const gloveGeo = new THREE.SphereGeometry(0.11, 12, 12);
    const wristRingGeo = new THREE.TorusGeometry(0.105, 0.02, 8, 16);
    wristRingGeo.rotateX(Math.PI / 2);

    // Left Arm
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-0.48, 1.35, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, this.suitFabricMat);
    leftArmMesh.position.y = -0.26;
    leftArmMesh.castShadow = true;
    this.leftArm.add(leftArmMesh);

    const leftWristRing = new THREE.Mesh(wristRingGeo, this.goldMetalMat);
    leftWristRing.position.y = -0.46;
    this.leftArm.add(leftWristRing);

    const leftGlove = new THREE.Mesh(gloveGeo, this.rubberSealMat);
    leftGlove.position.y = -0.53;
    this.leftArm.add(leftGlove);
    this.postureGroup.add(this.leftArm);

    // Right Arm
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(0.48, 1.35, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, this.suitFabricMat);
    rightArmMesh.position.y = -0.26;
    rightArmMesh.castShadow = true;
    this.rightArm.add(rightArmMesh);

    const rightWristRing = new THREE.Mesh(wristRingGeo, this.goldMetalMat);
    rightWristRing.position.y = -0.46;
    this.rightArm.add(rightWristRing);

    const rightGlove = new THREE.Mesh(gloveGeo, this.rubberSealMat);
    rightGlove.position.y = -0.53;
    this.rightArm.add(rightGlove);

    // 10. Handheld Scientific Field Scanner
    this.scannerTool = new THREE.Group();
    this.scannerTool.position.set(0, -0.56, 0.1);

    const scannerBodyGeo = new THREE.BoxGeometry(0.1, 0.14, 0.18);
    const scannerBody = new THREE.Mesh(scannerBodyGeo, this.metallicAlloyMat);
    this.scannerTool.add(scannerBody);

    const emitterGeo = new THREE.CylinderGeometry(0.035, 0.05, 0.06, 12);
    emitterGeo.rotateX(Math.PI / 2);
    const emitterMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.9
    });
    const emitter = new THREE.Mesh(emitterGeo, emitterMat);
    emitter.position.set(0, 0, 0.1);
    this.scannerTool.add(emitter);

    // Holographic forward scan beam cone (activated on scan)
    const beamGeo = new THREE.ConeGeometry(1.4, 5.5, 16, 1, true);
    beamGeo.rotateX(Math.PI / 2);
    beamGeo.translate(0, 0, 2.75);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.scannerBeamMesh = new THREE.Mesh(beamGeo, beamMat);
    this.scannerTool.add(this.scannerBeamMesh);

    this.rightArm.add(this.scannerTool);
    this.postureGroup.add(this.rightArm);
  }

  // --- ENVIRONMENT MAP & PBR REFLECTIONS ---

  /**
   * Applies the procedural celestial environment map to all suit and visor PBR materials
   */
  public setEnvironmentMap(envMap: THREE.Texture) {
    this.goldVisorMat.envMap = envMap;
    this.goldVisorMat.needsUpdate = true;

    this.clearVisorMat.envMap = envMap;
    this.clearVisorMat.needsUpdate = true;

    this.metallicAlloyMat.envMap = envMap;
    this.metallicAlloyMat.needsUpdate = true;

    this.goldMetalMat.envMap = envMap;
    this.goldMetalMat.needsUpdate = true;

    this.suitFabricMat.envMap = envMap;
    this.suitFabricMat.needsUpdate = true;
  }

  // --- VISOR & SUIT CUSTOMIZATION ---

  /**
   * Toggles between:
   * - 'gold_mirror': 24K Gold Mirror Visor (Max Identity Concealment & Solar Defense - face 100% hidden)
   * - 'clear_face': PBR Sapphire Crystal Visor (Reveals astronaut face with in-helmet cockpit LED illumination)
   * - 'hud_display': Collimated Tactical Flight HUD Overlay
   */
  public setVisorMode(mode: 'gold_mirror' | 'hud_display' | 'clear_face') {
    this.currentVisorMode = mode;

    if (mode === 'gold_mirror') {
      // 24k Gold Sun Mirror (Max Solar Shield & Identity Concealment)
      this.outerVisor.material = this.goldVisorMat;
      this.fresnelRimMat.uniforms.rimColor.value.setHex(0xf59e0b); // Warm solar gold
      this.fresnelRimMat.uniforms.rimPower.value = 2.8;
      this.fresnelRimMat.uniforms.rimIntensity.value = 1.4;
      this.hudOverlayMat.opacity = 0.0;
      this.inHelmetLight.intensity = 0.0;
      this.faceGroup.visible = false; // Hidden behind opaque gold
    } else if (mode === 'clear_face') {
      // Clear PBR Sapphire Crystal revealing the astronaut's enhanced face with cockpit illumination
      this.outerVisor.material = this.clearVisorMat;
      this.clearVisorMat.opacity = 0.20;
      this.fresnelRimMat.uniforms.rimColor.value.setHex(0x38bdf8); // Electric cyan
      this.fresnelRimMat.uniforms.rimPower.value = 2.4;
      this.fresnelRimMat.uniforms.rimIntensity.value = 1.6;
      this.hudOverlayMat.opacity = 0.28; // Subtle collimated edge HUD
      this.inHelmetLight.intensity = 1.4; // Interior cockpit LED light illuminates face
      this.faceGroup.visible = true;
    } else {
      // Tactical Collimated Flight HUD Display
      this.outerVisor.material = this.clearVisorMat;
      this.clearVisorMat.opacity = 0.34;
      this.fresnelRimMat.uniforms.rimColor.value.setHex(0x06b6d4); // Cyan
      this.fresnelRimMat.uniforms.rimPower.value = 2.2;
      this.fresnelRimMat.uniforms.rimIntensity.value = 1.7;
      this.hudOverlayMat.opacity = 0.92; // Full tactical HUD
      this.inHelmetLight.intensity = 0.35;
      this.faceGroup.visible = true;
    }
  }

  public getVisorMode(): 'gold_mirror' | 'hud_display' | 'clear_face' {
    return this.currentVisorMode;
  }

  /**
   * Thermal Cloak / Adaptive Regolith Camouflage
   */
  public setCloakActive(active: boolean, planet: 'moon' | 'mars' = 'moon') {
    this.isCloaked = active;
    const targetColor = active
      ? (planet === 'mars' ? 0x9a3412 : 0x1e293b)
      : 0xf8fafc;

    const targetEmissive = active
      ? (planet === 'mars' ? 0x431407 : 0x0f172a)
      : 0x000000;

    this.suitFabricMat.color.setHex(targetColor);
    this.suitFabricMat.emissive.setHex(targetEmissive);
    this.suitFabricMat.emissiveIntensity = active ? 0.45 : 0;
    this.suitFabricMat.roughness = active ? 0.92 : 0.42;
  }

  public getCloakActive(): boolean {
    return this.isCloaked;
  }

  public setScanning(active: boolean) {
    this.isScanning = active;
    if (this.scannerBeamMesh) {
      (this.scannerBeamMesh.material as THREE.MeshBasicMaterial).opacity = active ? 0.45 : 0;
    }
  }

  public setCollecting(active: boolean) {
    this.isCollecting = active;
  }

  public setFirstPersonHeadHidden(hidden: boolean) {
    this.head.visible = !hidden;
  }

  public setFirstPersonBodyHidden(hidden: boolean) {
    this.postureGroup.visible = !hidden;
  }

  public setPosture(posture: 'stand' | 'sit' | 'sleep') {
    this.posture = posture;
  }

  public snapToPosture(posture: 'stand' | 'sit' | 'sleep') {
    this.posture = posture;
    if (posture === 'stand') {
      this.postureGroup.position.set(0, 0, 0);
      this.postureGroup.rotation.set(0, 0, 0);
      this.torso.position.set(0, 1.05, 0);
      this.torso.rotation.set(0, 0, 0);
      this.leftLeg.rotation.set(0, 0, 0);
      this.rightLeg.rotation.set(0, 0, 0);
      this.leftArm.rotation.set(0, 0, 0);
      this.rightArm.rotation.set(0, 0, 0);
      this.head.rotation.set(0, 0, 0);
    }
  }

  public getPosture(): 'stand' | 'sit' | 'sleep' {
    return this.posture;
  }

  // --- KINEMATICS & ANIMATION ---

  public updateAnimation(
    delta: number,
    isMoving: boolean,
    isGrounded: boolean,
    isSprinting: boolean = false,
    landingImpact: number = 0,
    planet: 'earth' | 'moon' | 'mars' = 'moon'
  ) {
    // Automatically stand up if player starts moving or jumps
    if ((isMoving || !isGrounded) && this.posture !== 'stand') {
      this.posture = 'stand';
    }

    // Smoothly interpolate postureGroup for Sit / Sleep / Stand
    if (this.posture === 'sit') {
      this.walkTime += delta * 1.2;
      const sitBreathe = Math.sin(this.walkTime) * 0.015;
      this.postureGroup.position.x = THREE.MathUtils.lerp(this.postureGroup.position.x, 0, 0.14);
      this.postureGroup.position.y = THREE.MathUtils.lerp(this.postureGroup.position.y, -0.42 + sitBreathe, 0.14);
      this.postureGroup.position.z = THREE.MathUtils.lerp(this.postureGroup.position.z, 0, 0.14);
      this.postureGroup.rotation.x = THREE.MathUtils.lerp(this.postureGroup.rotation.x, 0, 0.14);

      this.torso.position.y = THREE.MathUtils.lerp(this.torso.position.y, 1.02, 0.14);
      this.torso.rotation.x = THREE.MathUtils.lerp(this.torso.rotation.x, -0.14, 0.14);

      // Legs extended forward seated on regolith
      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, -1.42, 0.16);
      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, -1.42, 0.16);
      this.leftLeg.rotation.z = THREE.MathUtils.lerp(this.leftLeg.rotation.z, -0.14, 0.16);
      this.rightLeg.rotation.z = THREE.MathUtils.lerp(this.rightLeg.rotation.z, 0.14, 0.16);

      // Arms resting comfortably on knees
      this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, -0.72, 0.14);
      this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, -0.72, 0.14);
      this.leftArm.rotation.z = THREE.MathUtils.lerp(this.leftArm.rotation.z, 0.12, 0.14);
      this.rightArm.rotation.z = THREE.MathUtils.lerp(this.rightArm.rotation.z, -0.12, 0.14);

      // Subtle head look around while seated
      this.head.rotation.y = Math.sin(this.walkTime * 0.55) * 0.22;
      return;
    }

    if (this.posture === 'sleep') {
      this.walkTime += delta * 0.85;
      const sleepBreathe = Math.sin(this.walkTime) * 0.022;
      // Recline horizontally onto insulated PLSS life-support backpack
      this.postureGroup.position.x = THREE.MathUtils.lerp(this.postureGroup.position.x, 0, 0.12);
      this.postureGroup.position.y = THREE.MathUtils.lerp(this.postureGroup.position.y, 0.36 + sleepBreathe, 0.12);
      this.postureGroup.position.z = THREE.MathUtils.lerp(this.postureGroup.position.z, 0.45, 0.12);
      this.postureGroup.rotation.x = THREE.MathUtils.lerp(this.postureGroup.rotation.x, -1.48, 0.12);

      this.torso.position.y = THREE.MathUtils.lerp(this.torso.position.y, 1.05, 0.12);
      this.torso.rotation.x = THREE.MathUtils.lerp(this.torso.rotation.x, 0, 0.12);

      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, 0.08, 0.12);
      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0.08, 0.12);
      this.leftLeg.rotation.z = THREE.MathUtils.lerp(this.leftLeg.rotation.z, -0.08, 0.12);
      this.rightLeg.rotation.z = THREE.MathUtils.lerp(this.rightLeg.rotation.z, 0.08, 0.12);

      this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, -0.22, 0.12);
      this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, -0.22, 0.12);
      this.leftArm.rotation.z = THREE.MathUtils.lerp(this.leftArm.rotation.z, 0.25, 0.12);
      this.rightArm.rotation.z = THREE.MathUtils.lerp(this.rightArm.rotation.z, -0.25, 0.12);
      this.head.rotation.y = THREE.MathUtils.lerp(this.head.rotation.y, 0, 0.12);
      return;
    }

    // Reset postureGroup to upright standing state
    this.postureGroup.position.x = THREE.MathUtils.lerp(this.postureGroup.position.x, 0, 0.18);
    this.postureGroup.position.y = THREE.MathUtils.lerp(this.postureGroup.position.y, 0, 0.18);
    this.postureGroup.position.z = THREE.MathUtils.lerp(this.postureGroup.position.z, 0, 0.18);
    this.postureGroup.rotation.x = THREE.MathUtils.lerp(this.postureGroup.rotation.x, 0, 0.18);
    this.leftLeg.rotation.z = THREE.MathUtils.lerp(this.leftLeg.rotation.z, 0, 0.18);
    this.rightLeg.rotation.z = THREE.MathUtils.lerp(this.rightLeg.rotation.z, 0, 0.18);
    this.leftArm.rotation.z = THREE.MathUtils.lerp(this.leftArm.rotation.z, 0, 0.18);
    this.rightArm.rotation.z = THREE.MathUtils.lerp(this.rightArm.rotation.z, 0, 0.18);
    this.head.rotation.y = THREE.MathUtils.lerp(this.head.rotation.y, 0, 0.18);

    // 1. Sample Collection Gesture (Kneel & Reach to Ground)
    if (this.isCollecting) {
      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, 0.8, 0.15);
      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, -0.6, 0.15);
      this.torso.rotation.x = THREE.MathUtils.lerp(this.torso.rotation.x, 0.48, 0.15);
      this.torso.position.y = THREE.MathUtils.lerp(this.torso.position.y, 0.72, 0.15);
      this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, -0.95, 0.2);
      this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, 0.35, 0.15);
      return;
    }

    // 2. In-Air Low-Gravity Leap
    if (!isGrounded) {
      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, -0.42, 0.15);
      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0.32, 0.15);
      this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, 0.55, 0.15);
      
      // If scanning, keep right arm raised
      if (this.isScanning) {
        this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, -1.2, 0.25);
      } else {
        this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, -0.5, 0.15);
      }

      this.torso.rotation.x = THREE.MathUtils.lerp(this.torso.rotation.x, -0.06, 0.1);
      this.torso.position.y = THREE.MathUtils.lerp(this.torso.position.y, 1.15, 0.1);
      return;
    }

    // 3. Ground Locomotion with Planet-Specific Cadence
    if (isMoving) {
      let freq = 7.2;
      let amplitude = 0.60;
      let bounceScale = 0.04;

      if (planet === 'moon') {
        // Floaty lunar loping gait
        freq = isSprinting ? 8.8 : 5.4;
        amplitude = isSprinting ? 0.90 : 0.55;
        bounceScale = isSprinting ? 0.12 : 0.08;
      } else if (planet === 'mars') {
        freq = isSprinting ? 10.5 : 6.6;
        amplitude = isSprinting ? 0.92 : 0.58;
        bounceScale = isSprinting ? 0.09 : 0.05;
      } else {
        freq = isSprinting ? 12.0 : 7.2;
        amplitude = isSprinting ? 0.95 : 0.60;
        bounceScale = isSprinting ? 0.08 : 0.04;
      }

      this.walkTime += delta * freq;
      const swing = Math.sin(this.walkTime) * amplitude;

      this.leftLeg.rotation.x = swing;
      this.rightLeg.rotation.x = -swing;

      this.leftArm.rotation.x = -swing * 0.75;
      
      // Right arm aiming scanner if scanning
      if (this.isScanning) {
        this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, -1.25, 0.2);
      } else {
        this.rightArm.rotation.x = swing * 0.75;
      }

      // Athletic forward tilt on sprint
      const targetTilt = isSprinting ? 0.16 : 0.04;
      this.torso.rotation.x = THREE.MathUtils.lerp(this.torso.rotation.x, targetTilt, 0.15);

      const bounce = Math.abs(Math.sin(this.walkTime * 2)) * bounceScale;
      const impactDip = landingImpact * 0.15;
      this.torso.position.y = 1.05 + bounce - impactDip;
    } else {
      // 4. Idle State with Gentle Breathing
      this.walkTime += delta * 1.5;
      const breathe = Math.sin(this.walkTime) * 0.02;
      const impactDip = landingImpact * 0.18;

      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, impactDip * 0.6, 0.12);
      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, impactDip * 0.6, 0.12);
      this.leftArm.rotation.x = THREE.MathUtils.lerp(this.leftArm.rotation.x, 0, 0.1);

      // Right arm aiming scanner if scanning during idle
      if (this.isScanning) {
        this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, -1.25, 0.2);
      } else {
        this.rightArm.rotation.x = THREE.MathUtils.lerp(this.rightArm.rotation.x, 0, 0.1);
      }

      this.torso.rotation.x = THREE.MathUtils.lerp(this.torso.rotation.x, 0, 0.1);
      this.torso.position.y = 1.05 + breathe - impactDip;
    }
  }
}
