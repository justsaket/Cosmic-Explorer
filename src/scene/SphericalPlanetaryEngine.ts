import * as THREE from 'three';

// 3D Simplex / Perlin Gradient Noise Implementation (pure JS, deterministic, zero-allocation)
// Generates authentic tectonic mountain ridges, Maria plains, dunes, and crater ejecta
class SimplexNoise3D {
  private p: Uint8Array;
  private perm: Uint8Array;
  private permMod12: Uint8Array;

  constructor(seed = 42) {
    this.p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      this.p[i] = i;
    }
    // Seeded Fisher-Yates shuffle
    let s = seed;
    const lcg = () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(lcg() * (i + 1));
      const tmp = this.p[i];
      this.p[i] = this.p[j];
      this.p[j] = tmp;
    }
    this.perm = new Uint8Array(512);
    this.permMod12 = new Uint8Array(512);
    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }
  }

  private static G3 = [
    [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
    [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
    [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
  ];

  public noise(xin: number, yin: number, zin: number): number {
    const F3 = 1.0 / 3.0;
    const G3 = 1.0 / 6.0;

    let n0 = 0, n1 = 0, n2 = 0, n3 = 0;
    const s = (xin + yin + zin) * F3;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const k = Math.floor(zin + s);
    const t = (i + j + k) * G3;
    const X0 = i - t;
    const Y0 = j - t;
    const Z0 = k - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;
    const z0 = zin - Z0;

    let i1: number, j1: number, k1: number;
    let i2: number, j2: number, k2: number;
    if (x0 >= y0) {
      if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
      else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
      else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
    } else {
      if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
      else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
      else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
    }

    const x1 = x0 - i1 + G3;
    const y1 = y0 - j1 + G3;
    const z1 = z0 - k1 + G3;
    const x2 = x0 - i2 + 2.0 * G3;
    const y2 = y0 - j2 + 2.0 * G3;
    const z2 = z0 - k2 + 2.0 * G3;
    const x3 = x0 - 1.0 + 3.0 * G3;
    const y3 = y0 - 1.0 + 3.0 * G3;
    const z3 = z0 - 1.0 + 3.0 * G3;

    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;

    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 > 0) {
      const gi0 = this.permMod12[ii + this.perm[jj + this.perm[kk]]];
      const g = SimplexNoise3D.G3[gi0];
      t0 *= t0;
      n0 = t0 * t0 * (g[0] * x0 + g[1] * y0 + g[2] * z0);
    }

    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 > 0) {
      const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]];
      const g = SimplexNoise3D.G3[gi1];
      t1 *= t1;
      n1 = t1 * t1 * (g[0] * x1 + g[1] * y1 + g[2] * z1);
    }

    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 > 0) {
      const gi2 = this.permMod12[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]];
      const g = SimplexNoise3D.G3[gi2];
      t2 *= t2;
      n2 = t2 * t2 * (g[0] * x2 + g[1] * y2 + g[2] * z2);
    }

    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 > 0) {
      const gi3 = this.permMod12[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]];
      const g = SimplexNoise3D.G3[gi3];
      t3 *= t3;
      n3 = t3 * t3 * (g[0] * x3 + g[1] * y3 + g[2] * z3);
    }

    return 32.0 * (n0 + n1 + n2 + n3);
  }

  // Multi-octave Fractal Brownian Motion (fBm)
  public fbm(x: number, y: number, z: number, octaves = 5, lacunarity = 2.0, gain = 0.5): number {
    let sum = 0;
    let freq = 1.0;
    let amp = 1.0;
    let max = 0;
    for (let o = 0; o < octaves; o++) {
      sum += this.noise(x * freq, y * freq, z * freq) * amp;
      max += amp;
      freq *= lacunarity;
      amp *= gain;
    }
    return sum / max;
  }
}

export interface GlobeElevationResult {
  elevation: number;        // Elevation above baseline radius (meters in scene scale)
  normal: THREE.Vector3;    // Surface normal pointing outward
  surfacePos: THREE.Vector3;// Exact 3D point on the planetary crust
  biome: string;
}

export interface PlanetLandmark {
  id: string;
  name: string;
  planetId: 'earth' | 'moon' | 'mars';
  lat: number;              // Degrees [-90, 90]
  lon: number;              // Degrees [-180, 180]
  description: string;
  category: 'exploration' | 'geology' | 'technology';
  elevationOffsetM: number;
}

export const REAL_NASA_LANDMARKS: PlanetLandmark[] = [
  // EARTH LANDMARKS
  { id: 'earth_ksc', name: 'Kennedy Space Center Launch Complex 39', planetId: 'earth', lat: 28.57, lon: -80.64, description: 'Historic home of Apollo 11 and Artemis launches on the Florida Space Coast.', category: 'exploration', elevationOffsetM: 2 },
  { id: 'earth_everest', name: 'Mount Everest (Chomolungma)', planetId: 'earth', lat: 27.98, lon: 86.92, description: 'Earth\'s highest mountain peak above sea level (8,848m) in the Himalayas.', category: 'geology', elevationOffsetM: 14 },
  { id: 'earth_grand_canyon', name: 'Grand Canyon Colorado Basin', planetId: 'earth', lat: 36.10, lon: -112.11, description: '2 billion years of Earth\'s exposed geologic strata carved by the Colorado River.', category: 'geology', elevationOffsetM: -4 },
  { id: 'earth_mauna_loa', name: 'Mauna Loa Shield Volcano', planetId: 'earth', lat: 19.47, lon: -155.60, description: 'The world\'s most massive active shield volcano rising from the Pacific floor.', category: 'geology', elevationOffsetM: 8 },
  { id: 'earth_richat', name: 'Richat Structure (Eye of the Sahara)', planetId: 'earth', lat: 21.12, lon: -11.40, description: 'Prominent 40km circular geologic dome landmark visible from Earth orbit.', category: 'geology', elevationOffsetM: 3 },

  // MOON LANDMARKS
  { id: 'lunar_tranquility', name: 'Apollo 11 Tranquility Base', planetId: 'moon', lat: 0.67, lon: 23.47, description: 'Humanity\'s inaugural landing site where Neil Armstrong and Buzz Aldrin stepped onto the Moon.', category: 'exploration', elevationOffsetM: 1 },
  { id: 'lunar_tycho', name: 'Tycho Crater & Central Peak', planetId: 'moon', lat: -43.31, lon: -11.36, description: 'Prominent 85km young impact crater with brilliant 1,500km rays across the lunar disk.', category: 'geology', elevationOffsetM: 10 },
  { id: 'lunar_copernicus', name: 'Copernicus Impact Crater', planetId: 'moon', lat: 9.62, lon: -20.08, description: 'Magnificent 93km multi-ring crater demonstrating terraced crater wall geology.', category: 'geology', elevationOffsetM: 8 },
  { id: 'lunar_shackleton', name: 'Shackleton South Pole Water Ice Crater', planetId: 'moon', lat: -89.9, lon: 0.0, description: 'Permanently shadowed cryogenic crater harboring billions of tons of water ice for Artemis Base Camp.', category: 'technology', elevationOffsetM: -8 },
  { id: 'lunar_imbrium', name: 'Mare Imbrium (Sea of Rains)', planetId: 'moon', lat: 32.8, lon: -15.6, description: 'Colossal 1,100km basaltic impact basin created 3.9 billion years ago.', category: 'geology', elevationOffsetM: 0 },

  // MARS LANDMARKS
  { id: 'mars_jezero', name: 'Jezero Crater (Perseverance Landing Site)', planetId: 'mars', lat: 18.38, lon: 77.58, description: 'Ancient Martian river delta where NASA\'s Perseverance rover searches for fossil biosignatures.', category: 'exploration', elevationOffsetM: 0 },
  { id: 'mars_olympus', name: 'Olympus Mons Shield Volcano', planetId: 'mars', lat: 18.65, lon: -133.8, description: 'The tallest volcano in the Solar System, rising 21.9 km above the Martian datum.', category: 'geology', elevationOffsetM: 22 },
  { id: 'mars_valles', name: 'Valles Marineris Grand Canyon', planetId: 'mars', lat: -13.9, lon: -59.2, description: 'Vast 4,000km tectonic rift system dwarfing the Grand Canyon by 10x.', category: 'geology', elevationOffsetM: -12 },
  { id: 'mars_gale', name: 'Gale Crater & Mount Sharp', planetId: 'mars', lat: -5.4, lon: 137.8, description: 'Curiosity rover\'s home world exploring 5km high sedimentary mudstones.', category: 'exploration', elevationOffsetM: 6 },
  { id: 'mars_cydonia', name: 'Cydonia Mensae Mesa Field', planetId: 'mars', lat: 40.75, lon: -9.46, description: 'Distinctive eroded mesas and isolated hills in the northern Martian lowlands.', category: 'geology', elevationOffsetM: 4 }
];

export class SphericalPlanetaryBody {
  public planetId: 'earth' | 'moon' | 'mars';
  public radius: number;
  private noise: SimplexNoise3D;

  constructor(planetId: 'earth' | 'moon' | 'mars', radius = 48.0) {
    this.planetId = planetId;
    this.radius = radius;
    this.noise = new SimplexNoise3D(planetId === 'earth' ? 101 : planetId === 'moon' ? 202 : 303);
  }

  // Convert (Lat, Lon) in degrees to a unit direction vector (X, Y, Z)
  public static latLonToUnitVector(lat: number, lon: number): THREE.Vector3 {
    const phi = THREE.MathUtils.degToRad(90 - lat);
    const theta = THREE.MathUtils.degToRad(lon + 180);
    return new THREE.Vector3(
      -Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta)
    ).normalize();
  }

  // Convert 3D point on globe to (Lat, Lon, Altitude)
  public static cartesianToLatLon(pos: THREE.Vector3, baseRadius = 48.0): { lat: number; lon: number; altitude: number } {
    const len = pos.length();
    const unit = pos.clone().normalize();
    const lat = 90 - THREE.MathUtils.radToDeg(Math.acos(Math.max(-1, Math.min(1, unit.y))));
    let lon = THREE.MathUtils.radToDeg(Math.atan2(unit.z, -unit.x)) - 180;
    while (lon < -180) lon += 360;
    while (lon > 180) lon -= 360;
    const altitude = len - baseRadius;
    return { lat, lon, altitude };
  }

  // Exact continuous mathematical elevation function for every point on the entire globe
  public getElevationAtUnit(dir: THREE.Vector3): { elevation: number; biome: string } {
    const x = dir.x;
    const y = dir.y;
    const z = dir.z;

    if (this.planetId === 'earth') {
      // 1. Continental Shelf vs Deep Ocean Basin mask
      const continents = this.noise.fbm(x * 1.5, y * 1.5, z * 1.5, 4, 2.0, 0.5);
      
      // Sea level threshold: ~0.08
      if (continents < 0.05) {
        // Ocean Floor (bathymetry)
        const depth = Math.min(0, (continents - 0.05) * 8.5);
        return { elevation: depth, biome: 'ocean' };
      }

      // Land topography: mountains, plains, highlands
      const ridgeNoise = Math.abs(this.noise.fbm(x * 3.8, y * 3.8, z * 3.8, 5, 2.1, 0.52));
      const micro = this.noise.noise(x * 12.0, y * 12.0, z * 12.0) * 0.45;
      const elevation = (continents - 0.05) * 4.2 + (1.0 - ridgeNoise) * 3.6 + micro;

      // Latitude check for polar ice
      if (Math.abs(y) > 0.82) {
        return { elevation: elevation + 0.6, biome: 'polar_ice' };
      }
      if (elevation > 4.5) return { elevation, biome: 'mountain' };
      return { elevation, biome: 'temperate' };
    }

    if (this.planetId === 'moon') {
      // Lunar Highlands vs Low Basaltic Maria
      const maria = this.noise.fbm(x * 1.2, y * 1.2, z * 1.2, 3, 2.0, 0.45);
      const isMaria = maria < -0.08;

      // Multi-scale impact craters
      let craterDip = 0;
      const c1 = this.noise.noise(x * 4.5, y * 4.5, z * 4.5);
      if (c1 > 0.45) craterDip -= (c1 - 0.45) * 4.2;

      const c2 = this.noise.noise(x * 9.2, y * 9.2, z * 9.2);
      if (c2 > 0.48) craterDip -= (c2 - 0.48) * 2.4;

      const highlands = this.noise.fbm(x * 3.2, y * 3.2, z * 3.2, 5, 2.0, 0.5) * 2.8;
      const micro = this.noise.noise(x * 14.0, y * 14.0, z * 14.0) * 0.35;

      const elevation = (isMaria ? -0.8 : 1.2) + highlands + craterDip + micro;
      return { elevation, biome: isMaria ? 'maria' : 'highlands' };
    }

    // MARS: Olympus Mons, Valles Marineris, Dunes, Impact Basins
    const crust = this.noise.fbm(x * 1.4, y * 1.4, z * 1.4, 4, 2.0, 0.5);
    
    // Shield Volcanoes (high-amplitude localized peaks)
    const volcanoProbe = this.noise.noise(x * 2.4 + 1.2, y * 2.4, z * 2.4 - 0.8);
    let volcanoH = 0;
    if (volcanoProbe > 0.52) {
      volcanoH = Math.pow((volcanoProbe - 0.52) * 2.8, 2.2) * 14.0;
    }

    // Canyon rifts (sharp negative cuts like Valles Marineris)
    const rift = Math.abs(this.noise.noise(x * 3.0, y * 4.0, z * 3.0));
    let riftH = 0;
    if (rift < 0.12) {
      riftH = -((0.12 - rift) / 0.12) * 5.5;
    }

    const regolith = this.noise.fbm(x * 4.0, y * 4.0, z * 4.0, 5, 2.0, 0.5) * 3.2;
    const micro = this.noise.noise(x * 13.0, y * 13.0, z * 13.0) * 0.4;
    const elevation = crust * 2.2 + volcanoH + riftH + regolith + micro;

    if (Math.abs(y) > 0.88) {
      return { elevation: elevation + 0.8, biome: 'polar_dry_ice' };
    }
    return { elevation, biome: volcanoH > 3.0 ? 'volcano' : riftH < -2.0 ? 'canyon' : 'regolith' };
  }

  // Query exact crust position and surface normal for any world coordinate
  public getCrustPoint(worldPoint: THREE.Vector3): GlobeElevationResult {
    const dir = worldPoint.clone().normalize();
    const { elevation, biome } = this.getElevationAtUnit(dir);
    const radiusAt = this.radius + elevation;
    const surfacePos = dir.clone().multiplyScalar(radiusAt);

    // Finite difference normal calculation along spherical tangent directions
    const eps = 0.003;
    const tangent1 = new THREE.Vector3(-dir.z, 0, dir.x).normalize();
    if (tangent1.lengthSq() < 0.001) tangent1.set(1, 0, 0);
    const tangent2 = new THREE.Vector3().crossVectors(dir, tangent1).normalize();

    const pA = dir.clone().addScaledVector(tangent1, eps).normalize();
    const pB = dir.clone().addScaledVector(tangent2, eps).normalize();

    const eA = this.getElevationAtUnit(pA).elevation;
    const eB = this.getElevationAtUnit(pB).elevation;

    const vA = pA.multiplyScalar(this.radius + eA);
    const vB = pB.multiplyScalar(this.radius + eB);

    const d1 = vA.sub(surfacePos);
    const d2 = vB.sub(surfacePos);
    const normal = new THREE.Vector3().crossVectors(d1, d2).normalize();

    // Ensure normal points outward from planet center
    if (normal.dot(dir) < 0) {
      normal.negate();
    }

    return { elevation, normal, surfacePos, biome };
  }

  // Build a seamless 3D spherical mesh with multi-biome procedural surface vertex shading
  public buildGlobeMesh(): THREE.Mesh {
    const segments = 128;
    const geo = new THREE.SphereGeometry(this.radius, segments, segments);
    const posAttr = geo.attributes.position as THREE.BufferAttribute;
    const vertexColors = new Float32Array(posAttr.count * 3);

    const dir = new THREE.Vector3();
    const col = new THREE.Color();

    for (let i = 0; i < posAttr.count; i++) {
      dir.set(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i)).normalize();
      const { elevation, biome } = this.getElevationAtUnit(dir);
      const r = this.radius + elevation;
      posAttr.setXYZ(i, dir.x * r, dir.y * r, dir.z * r);

      // Procedural PBR Vertex Coloring
      if (this.planetId === 'earth') {
        if (biome === 'ocean') {
          col.setHex(0x0f4c81); // Deep oceanic blue
        } else if (biome === 'polar_ice') {
          col.setHex(0xf8fafc); // Crisp Arctic/Antarctic ice
        } else if (biome === 'mountain') {
          col.setHex(0x78716c); // Tectonic granite crests
        } else {
          // Lush forest green to golden savanna
          col.setHex(elevation > 2.0 ? 0x2d6a4f : 0x1b4332);
        }
      } else if (this.planetId === 'moon') {
        if (biome === 'maria') {
          col.setHex(0x334155); // Dark basaltic lava plain
        } else {
          // Brilliant anorthositic highlands
          const tone = 0.82 + Math.min(0.18, elevation * 0.03);
          col.setRGB(tone, tone + 0.02, tone + 0.05);
        }
      } else {
        // MARS
        if (biome === 'polar_dry_ice') {
          col.setHex(0xf1f5f9);
        } else if (biome === 'volcano') {
          col.setHex(0x7c2d12); // Dark volcanic basalt
        } else if (biome === 'canyon') {
          col.setHex(0x9a3412); // Deep canyon wall ochre
        } else {
          col.setHex(0xc25e35); // Classic ferric oxide salmon-rust
        }
      }

      vertexColors[i * 3] = col.r;
      vertexColors[i * 3 + 1] = col.g;
      vertexColors[i * 3 + 2] = col.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(vertexColors, 3));
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: this.planetId === 'earth' ? 0.65 : 0.94,
      metalness: this.planetId === 'earth' ? 0.12 : 0.04,
      flatShading: false
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }
}

// 3D NASA Landmark Structures & Surface Installations on the Spherical Globe
export function createLandmarkStructures(planetId: 'earth' | 'moon' | 'mars', body: SphericalPlanetaryBody): THREE.Group {
  const rootGroup = new THREE.Group();
  const landmarks = REAL_NASA_LANDMARKS.filter(l => l.planetId === planetId);

  landmarks.forEach(lm => {
    const unit = SphericalPlanetaryBody.latLonToUnitVector(lm.lat, lm.lon);
    const crust = body.getCrustPoint(unit.clone().multiplyScalar(body.radius));

    const siteGroup = new THREE.Group();
    siteGroup.position.copy(crust.surfacePos);

    // Orient site to planet surface normal
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), crust.normal);
    siteGroup.quaternion.copy(quat);

    // 1. Holographic vertical beacon pillar (visible from high orbit!)
    const pillarColor = lm.category === 'exploration' ? 0x06b6d4 : lm.category === 'geology' ? 0xf59e0b : 0xa855f7;
    const beamGeo = new THREE.CylinderGeometry(0.12, 0.45, 12, 16);
    beamGeo.translate(0, 6, 0);
    const beamMat = new THREE.MeshBasicMaterial({
      color: pillarColor,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    siteGroup.add(beam);

    // Pulsing base ring
    const ringGeo = new THREE.RingGeometry(0.8, 1.2, 24);
    ringGeo.rotateX(-Math.PI / 2);
    ringGeo.translate(0, 0.1, 0);
    const ringMat = new THREE.MeshBasicMaterial({
      color: pillarColor,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    siteGroup.add(new THREE.Mesh(ringGeo, ringMat));

    // 2. Specific Detailed Architectural & NASA Engineering Assets per Landmark
    if (lm.id === 'earth_ksc') {
      // Launch Pad 39 + Artemis SLS / Starship Rocket & Umbilical Gantry Tower
      const padGeo = new THREE.CylinderGeometry(2.4, 2.8, 0.6, 8);
      const padMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.y = 0.3;
      pad.castShadow = true;
      siteGroup.add(pad);

      // Massive Multi-Stage Rocket
      const rocketCoreGeo = new THREE.CylinderGeometry(0.35, 0.35, 4.2, 16);
      rocketCoreGeo.translate(0, 2.7, 0);
      const rocketMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.3, roughness: 0.2 });
      const rocket = new THREE.Mesh(rocketCoreGeo, rocketMat);
      rocket.castShadow = true;
      siteGroup.add(rocket);

      // Rocket Cone
      const coneGeo = new THREE.ConeGeometry(0.35, 0.9, 16);
      coneGeo.translate(0, 5.25, 0);
      const cone = new THREE.Mesh(coneGeo, rocketMat);
      siteGroup.add(cone);

      // Orange External Fuel Tank Accent
      const tankGeo = new THREE.CylinderGeometry(0.38, 0.38, 2.2, 16);
      tankGeo.translate(0, 2.2, 0);
      const tankMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.4 });
      siteGroup.add(new THREE.Mesh(tankGeo, tankMat));

      // Launch Gantry Tower with Red Warning Beacon
      const towerGeo = new THREE.BoxGeometry(0.6, 5.8, 0.6);
      towerGeo.translate(0.9, 3.0, 0);
      const towerMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, metalness: 0.8, roughness: 0.3 });
      const tower = new THREE.Mesh(towerGeo, towerMat);
      siteGroup.add(tower);

      const redBeacon = new THREE.PointLight(0xef4444, 2, 8);
      redBeacon.position.set(0.9, 6.0, 0);
      siteGroup.add(redBeacon);
    } else if (lm.id === 'lunar_tranquility') {
      // Apollo 11 Lunar Module Descent Stage
      const lmBase = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.9, 0),
        new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.15 })
      );
      lmBase.scale.set(1.1, 0.5, 1.1);
      lmBase.position.y = 0.6;
      lmBase.castShadow = true;
      siteGroup.add(lmBase);

      // 4 Landing Struts
      for (let i = 0; i < 4; i++) {
        const legAngle = (i * Math.PI) / 2 + Math.PI / 4;
        const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2);
        legGeo.rotateZ(0.5);
        legGeo.translate(0.55, 0.45, 0);
        const legMesh = new THREE.Mesh(legGeo, new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8 }));
        legMesh.rotation.y = legAngle;
        siteGroup.add(legMesh);
      }

      // American Flag on Lunar Surface
      const poleGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.4);
      poleGeo.translate(1.4, 0.7, 0.5);
      siteGroup.add(new THREE.Mesh(poleGeo, new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8 })));
      const flagGeo = new THREE.PlaneGeometry(0.5, 0.3);
      flagGeo.translate(1.65, 1.25, 0.5);
      const flagMat = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide });
      siteGroup.add(new THREE.Mesh(flagGeo, flagMat));
    } else if (lm.id === 'lunar_shackleton' || lm.id === 'lunar_imbrium') {
      // Artemis Base Camp Habitats & Solar Arrays (inspired by reference photo!)
      const domeMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3, metalness: 0.2 });
      
      // Main inflatable habitat module
      const habDome = new THREE.Mesh(new THREE.SphereGeometry(1.4, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), domeMat);
      habDome.position.set(0, 0, 0);
      siteGroup.add(habDome);

      // Secondary habitat pod connected by pressurized airlock tunnel
      const pod = new THREE.Mesh(new THREE.SphereGeometry(0.9, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), domeMat);
      pod.position.set(2.2, 0, 0);
      siteGroup.add(pod);

      const tunnel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 1.4, 8),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.5 })
      );
      tunnel.rotateZ(Math.PI / 2);
      tunnel.position.set(1.1, 0.4, 0);
      siteGroup.add(tunnel);

      // High-efficiency vertical solar power wings
      const solarMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.9, roughness: 0.1 });
      const solarPanel = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.2, 1.6), solarMat);
      solarPanel.position.set(-2.0, 1.2, 1.2);
      siteGroup.add(solarPanel);

      // Habitat safety floodlight
      const flood = new THREE.PointLight(0x67e8f9, 2.5, 10);
      flood.position.set(0, 2.4, 0);
      siteGroup.add(flood);
    } else if (lm.id === 'mars_jezero' || lm.id === 'mars_gale') {
      // NASA Perseverance Rover & Ingenuity Helicopter Site
      const roverChassis = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.4, 1.8),
        new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.6, roughness: 0.35 })
      );
      roverChassis.position.set(0, 0.45, 0);
      roverChassis.castShadow = true;
      siteGroup.add(roverChassis);

      // SuperCam Remote Sensing Mast
      const mastGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.1);
      mastGeo.translate(0.3, 0.95, 0.6);
      siteGroup.add(new THREE.Mesh(mastGeo, new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })));

      const superCamHead = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.16, 0.22),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 })
      );
      superCamHead.position.set(0.3, 1.55, 0.6);
      siteGroup.add(superCamHead);

      // RTG Nuclear Power Generator (cylinder on rear)
      const rtg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.5, 12),
        new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7 })
      );
      rtg.position.set(0, 0.65, -0.85);
      siteGroup.add(rtg);

      // 6 Articulated Aluminum Cleated Wheels
      const wheelGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.18, 12);
      wheelGeo.rotateZ(Math.PI / 2);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.4 });
      const wheelOffsets = [
        [-0.75, 0.22, 0.75], [0.75, 0.22, 0.75],
        [-0.8, 0.22, 0], [0.8, 0.22, 0],
        [-0.75, 0.22, -0.75], [0.75, 0.22, -0.75]
      ];
      wheelOffsets.forEach(([wx, wy, wz]) => {
        const w = new THREE.Mesh(wheelGeo, wheelMat);
        w.position.set(wx, wy, wz);
        siteGroup.add(w);
      });

      // Ingenuity Scout Helicopter nearby
      const heliBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.18, 0.18),
        new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8 })
      );
      heliBase.position.set(2.4, 0.25, 1.2);
      siteGroup.add(heliBase);

      const blades = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.02, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x0284c7 })
      );
      blades.position.set(2.4, 0.45, 1.2);
      siteGroup.add(blades);
    } else {
      // Geological Survey Obelisk / Research Station
      const obeliskGeo = new THREE.ConeGeometry(0.4, 2.2, 4);
      obeliskGeo.translate(0, 1.1, 0);
      const obeliskMat = new THREE.MeshStandardMaterial({
        color: pillarColor,
        metalness: 0.8,
        roughness: 0.2
      });
      const obelisk = new THREE.Mesh(obeliskGeo, obeliskMat);
      obelisk.castShadow = true;
      siteGroup.add(obelisk);
    }

    siteGroup.userData = {
      landmarkId: lm.id,
      landmarkName: lm.name,
      description: lm.description,
      category: lm.category
    };

    rootGroup.add(siteGroup);
  });

  return rootGroup;
}

