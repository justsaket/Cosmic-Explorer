import * as THREE from 'three';

export class ProceduralTextures {
  private static cache: Map<string, THREE.CanvasTexture> = new Map();

  // Create Sun Photosphere Canvas Texture
  public static getSunTexture(): THREE.CanvasTexture {
    if (this.cache.has('sun')) return this.cache.get('sun')!;

    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Solar gradient
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, '#fffbeb');
    grad.addColorStop(0.3, '#fef08a');
    grad.addColorStop(0.7, '#f59e0b');
    grad.addColorStop(0.9, '#ea580c');
    grad.addColorStop(1, '#991b1b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Turbulent solar flares / granulation
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 10 + Math.random() * 40;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 237, 213, ${0.05 + Math.random() * 0.12})`;
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    this.cache.set('sun', texture);
    return texture;
  }

  // Create Earth Globe Canvas Texture (Continents, Oceans, Atmosphere)
  public static getEarthTexture(): THREE.CanvasTexture {
    if (this.cache.has('earth')) return this.cache.get('earth')!;

    const width = 2048;
    const height = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Deep ocean blue
    ctx.fillStyle = '#0f3875';
    ctx.fillRect(0, 0, width, height);

    // Shallow continental shelf waters
    ctx.fillStyle = '#1e5ca8';
    for (let i = 0; i < 80; i++) {
      const cx = (width * 0.2 + (i * 123) % (width * 0.7));
      const cy = (height * 0.25 + (i * 97) % (height * 0.5));
      ctx.beginPath();
      ctx.ellipse(cx, cy, 60 + (i % 5) * 30, 40 + (i % 4) * 25, (i % 6) * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Continents (Americas, Eurasia, Africa, Australia)
    ctx.fillStyle = '#2d6a4f';
    const landBlobs = [
      // North America
      { x: width * 0.22, y: height * 0.32, rx: 140, ry: 90 },
      { x: width * 0.26, y: height * 0.28, rx: 110, ry: 70 },
      // South America
      { x: width * 0.32, y: height * 0.62, rx: 80, ry: 130 },
      // Europe
      { x: width * 0.52, y: height * 0.30, rx: 70, ry: 50 },
      // Africa
      { x: width * 0.53, y: height * 0.52, rx: 100, ry: 120 },
      // Asia
      { x: width * 0.72, y: height * 0.34, rx: 180, ry: 110 },
      { x: width * 0.65, y: height * 0.42, rx: 80, ry: 60 },
      // Australia
      { x: width * 0.82, y: height * 0.68, rx: 70, ry: 50 }
    ];

    landBlobs.forEach(blob => {
      ctx.beginPath();
      ctx.ellipse(blob.x, blob.y, blob.rx, blob.ry, 0.2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Deserts (Sahara, Australia, Middle East)
    ctx.fillStyle = '#b49f68';
    ctx.beginPath();
    ctx.ellipse(width * 0.52, height * 0.44, 70, 40, 0, 0, Math.PI * 2);
    ctx.fill();

    // Polar ice caps
    ctx.fillStyle = '#f8fafc';
    // North pole
    ctx.fillRect(0, 0, width, height * 0.08);
    // South pole
    ctx.fillRect(0, height * 0.92, width, height * 0.08);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    this.cache.set('earth', texture);
    return texture;
  }

  // Create Earth Clouds Canvas Texture
  public static getEarthCloudsTexture(): THREE.CanvasTexture {
    if (this.cache.has('earth_clouds')) return this.cache.get('earth_clouds')!;

    const width = 1024;
    const height = 512;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';

    for (let i = 0; i < 90; i++) {
      const cx = (i * 73) % width;
      const cy = 60 + (i * 37) % (height - 120);
      const rx = 40 + (i % 7) * 20;
      const ry = 15 + (i % 5) * 8;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0.15, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;
    this.cache.set('earth_clouds', texture);
    return texture;
  }

  // Create Lunar Surface Texture (2048x1024 silver-white highlands, basaltic maria, radiant impact rays, micro-craters)
  public static getMoonTexture(): THREE.CanvasTexture {
    if (this.cache.has('moon')) return this.cache.get('moon')!;

    const size = 2048;
    const half = size / 2;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = half;
    const ctx = canvas.getContext('2d')!;

    // Pure pale silver-white lunar anorthosite highlands base
    ctx.fillStyle = '#d3dce6';
    ctx.fillRect(0, 0, size, half);

    // Deterministic micro-regolith grain
    for (let i = 0; i < 1600; i++) {
      const gx = (i * 499.7) % size;
      const gy = (i * 271.3) % half;
      const gw = 2 + (i % 7) * 1.6;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(248, 250, 252, 0.16)' : 'rgba(100, 116, 139, 0.12)';
      ctx.fillRect(gx, gy, gw, gw);
    }

    // Basaltic Lunar Maria
    ctx.fillStyle = '#64748b';
    const maria = [
      { x: size * 0.35, y: half * 0.44, rx: 220, ry: 150, rot: 0.1 },
      { x: size * 0.52, y: half * 0.48, rx: 180, ry: 120, rot: -0.1 },
      { x: size * 0.64, y: half * 0.40, rx: 140, ry: 100, rot: 0.2 },
      { x: size * 0.28, y: half * 0.64, rx: 160, ry: 110, rot: 0.15 },
      { x: size * 0.70, y: half * 0.60, rx: 120, ry: 90, rot: -0.2 }
    ];

    maria.forEach(m => {
      ctx.beginPath();
      ctx.ellipse(m.x, m.y, m.rx, m.ry, m.rot, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#475569';
    maria.forEach(m => {
      ctx.beginPath();
      ctx.ellipse(m.x, m.y, m.rx * 0.65, m.ry * 0.65, m.rot, 0, Math.PI * 2);
      ctx.fill();
    });

    // Tycho and Copernicus radiant bright impact rays
    ctx.strokeStyle = 'rgba(248, 250, 252, 0.35)';
    ctx.lineWidth = 2.2;
    const rayCenters = [
      { x: size * 0.42, y: half * 0.76 },
      { x: size * 0.25, y: half * 0.40 }
    ];
    rayCenters.forEach(c => {
      for (let r = 0; r < 32; r++) {
        const angle = (r / 32) * Math.PI * 2;
        const len = 85 + ((r * 37) % 210);
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x + Math.cos(angle) * len, c.y + Math.sin(angle) * len);
        ctx.stroke();
      }
    });

    // Crisp multi-scale impact craters with illuminated rim + shadowed floor
    for (let i = 0; i < 520; i++) {
      const x = (i * 773.9) % size;
      const y = (i * 419.1) % half;
      const r = 3 + (i % 13) * 1.7;

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(30, 41, 59, 0.42)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x - r * 0.22, y - r * 0.22, r * 0.86, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(248, 250, 252, 0.52)';
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 8;
    this.cache.set('moon', texture);
    return texture;
  }

  // Create Martian Surface Texture (2048x1024 sunlit iron-oxide ochre, butterscotch dunes, volcanic provinces, polar ice)
  public static getMarsTexture(): THREE.CanvasTexture {
    if (this.cache.has('mars')) return this.cache.get('mars')!;

    const size = 2048;
    const half = size / 2;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = half;
    const ctx = canvas.getContext('2d')!;

    // Luminous warm sunlit iron-oxide ochre geological base
    ctx.fillStyle = '#dc7a46';
    ctx.fillRect(0, 0, size, half);

    // Layered ochre & cinnamon wind-blown regolith patches
    for (let i = 0; i < 42; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(194, 86, 44, 0.45)' : 'rgba(245, 158, 11, 0.24)';
      ctx.beginPath();
      ctx.ellipse(
        (i * 389.3) % size,
        (i * 211.7) % half,
        90 + (i % 7) * 35,
        42 + (i % 5) * 20,
        (i % 6) * 0.25,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Dark volcanic basalt provinces (Syrtis Major, Acidalia Planitia, Sinus Meridiani)
    ctx.fillStyle = 'rgba(120, 53, 25, 0.55)';
    const darkFeatures = [
      { x: size * 0.42, y: half * 0.52, rx: 240, ry: 120, rot: 0.15 },
      { x: size * 0.72, y: half * 0.64, rx: 185, ry: 95, rot: -0.1 },
      { x: size * 0.22, y: half * 0.72, rx: 165, ry: 85, rot: 0.25 }
    ];
    darkFeatures.forEach(feat => {
      ctx.beginPath();
      ctx.ellipse(feat.x, feat.y, feat.rx, feat.ry, feat.rot, 0, Math.PI * 2);
      ctx.fill();
    });

    // Bright salmon/butterscotch dust streaks & aeolian ripples
    for (let i = 0; i < 360; i++) {
      const rx = (i * 541.3) % size;
      const ry = (i * 313.7) % half;
      const rad = 10 + (i % 9) * 5;
      ctx.fillStyle = i % 3 === 0 ? 'rgba(253, 186, 116, 0.26)' : 'rgba(154, 52, 18, 0.18)';
      ctx.beginPath();
      ctx.ellipse(rx, ry, rad * 1.4, rad * 0.65, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Fine pebble & crater rim highlights
    for (let i = 0; i < 240; i++) {
      const cx = (i * 683.1) % size;
      const cy = (i * 359.3) % half;
      const cr = 3 + (i % 8) * 1.4;
      ctx.strokeStyle = 'rgba(255, 237, 213, 0.25)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Polar caps (Perennial water ice and seasonal CO2 dry ice frost)
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.ellipse(size / 2, 14, 130, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(size / 2, half - 14, 105, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 8;
    this.cache.set('mars', texture);
    return texture;
  }

  // Create Star Particle Sprite Canvas
  public static getStarParticleTexture(): THREE.CanvasTexture {
    if (this.cache.has('star_particle')) return this.cache.get('star_particle')!;

    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(224, 242, 254, 0.8)');
    grad.addColorStop(0.7, 'rgba(56, 189, 248, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set('star_particle', texture);
    return texture;
  }

  // Create Target Beacon Hologram Canvas
  public static getHologramRingTexture(): THREE.CanvasTexture {
    if (this.cache.has('beacon_ring')) return this.cache.get('beacon_ring')!;

    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, size, size);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 54, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 44, 0, Math.PI * 2);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set('beacon_ring', texture);
    return texture;
  }

  // Create High Dynamic Range Procedural Celestial Environment Texture for Visor & PBR Reflections
  public static getSpaceEnvironmentTexture(): THREE.CanvasTexture {
    if (this.cache.has('space_env')) return this.cache.get('space_env')!;

    const width = 1024;
    const height = 512;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Cosmic deep background with nebula dust
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#030712');
    grad.addColorStop(0.3, '#020617');
    grad.addColorStop(0.6, '#080d1a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle celestial nebula clouds (indigo & cyan)
    for (let i = 0; i < 6; i++) {
      const cx = (width * 0.15 + i * 150) % width;
      const cy = height * 0.35 + (i % 3) * 60;
      const radGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 220);
      radGrad.addColorStop(0, i % 2 === 0 ? 'rgba(56, 189, 248, 0.18)' : 'rgba(168, 85, 247, 0.14)');
      radGrad.addColorStop(0.6, 'rgba(30, 58, 138, 0.08)');
      radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // Distant Stars
    for (let i = 0; i < 700; i++) {
      const x = (i * 997.3) % width;
      const y = (i * 613.7) % height;
      const r = 0.5 + ((i % 5) * 0.35);
      const alpha = 0.4 + ((i % 7) * 0.08);
      ctx.fillStyle = `rgba(248, 250, 252, ${alpha})`;
      ctx.fillRect(x, y, r, r);
    }

    // Directional Sun Disk for realistic sharp specular reflection on Visor & Metal
    const sunX = width * 0.72;
    const sunY = height * 0.38;
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 180);
    sunGlow.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    sunGlow.addColorStop(0.08, 'rgba(254, 240, 138, 0.95)');
    sunGlow.addColorStop(0.25, 'rgba(245, 158, 11, 0.4)');
    sunGlow.addColorStop(0.6, 'rgba(234, 88, 12, 0.1)');
    sunGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 180, 0, Math.PI * 2);
    ctx.fill();

    // Distant Earth crescent horizon reflection
    const earthX = width * 0.28;
    const earthY = height * 0.65;
    const earthGlow = ctx.createRadialGradient(earthX, earthY, 10, earthX, earthY, 70);
    earthGlow.addColorStop(0, 'rgba(56, 189, 248, 0.8)');
    earthGlow.addColorStop(0.5, 'rgba(14, 116, 144, 0.3)');
    earthGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = earthGlow;
    ctx.beginPath();
    ctx.arc(earthX, earthY, 70, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.mapping = THREE.EquirectangularReflectionMapping;
    this.cache.set('space_env', texture);
    return texture;
  }

  // Create In-Visor Holographic Collimated HUD Display Overlay Texture
  public static getVisorHudTexture(): THREE.CanvasTexture {
    if (this.cache.has('visor_hud')) return this.cache.get('visor_hud')!;

    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, size, size);

    // Subtle cyan holographic grid background
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 120; x <= size - 120; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 140);
      ctx.lineTo(x, size - 140);
      ctx.stroke();
    }
    for (let y = 140; y <= size - 140; y += 80) {
      ctx.beginPath();
      ctx.moveTo(120, y);
      ctx.lineTo(size - 120, y);
      ctx.stroke();
    }

    const cx = size / 2;
    const cy = size / 2;

    // Center Collimated Aiming Reticle & Flight Crosshairs
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.lineWidth = 2.5;

    // Inner reticle circle
    ctx.beginPath();
    ctx.arc(cx, cy, 42, 0, Math.PI * 2);
    ctx.stroke();

    // Center dot
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();

    // Crosshair ticks
    ctx.beginPath();
    ctx.moveTo(cx - 70, cy);
    ctx.lineTo(cx - 50, cy);
    ctx.moveTo(cx + 50, cy);
    ctx.lineTo(cx + 70, cy);
    ctx.moveTo(cx, cy - 70);
    ctx.lineTo(cx, cy - 50);
    ctx.moveTo(cx, cy + 50);
    ctx.lineTo(cx, cy + 70);
    ctx.stroke();

    // Pitch Ladder Lines (Collimated Horizon & Pitch Degrees)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.lineWidth = 2;
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#38bdf8';

    // 0° Artificial Horizon Line
    ctx.beginPath();
    ctx.moveTo(cx - 160, cy);
    ctx.lineTo(cx - 90, cy);
    ctx.moveTo(cx + 90, cy);
    ctx.lineTo(cx + 160, cy);
    ctx.stroke();
    ctx.fillText('0°', cx - 190, cy + 5);
    ctx.fillText('0°', cx + 168, cy + 5);

    // +10° Pitch line
    ctx.beginPath();
    ctx.moveTo(cx - 120, cy - 70);
    ctx.lineTo(cx - 75, cy - 70);
    ctx.lineTo(cx - 75, cy - 60);
    ctx.moveTo(cx + 120, cy - 70);
    ctx.lineTo(cx + 75, cy - 70);
    ctx.lineTo(cx + 75, cy - 60);
    ctx.stroke();
    ctx.fillText('+10', cx - 155, cy - 65);

    // -10° Pitch line (dashed)
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(cx - 120, cy + 70);
    ctx.lineTo(cx - 75, cy + 70);
    ctx.moveTo(cx + 120, cy + 70);
    ctx.lineTo(cx + 75, cy + 70);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillText('-10', cx - 155, cy + 75);

    // Top Heading Compass Ribbon
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.fillRect(cx - 200, 160, 400, 36);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.strokeRect(cx - 200, 160, 400, 36);
    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('340 • 350 • N • 010 • 020', cx - 145, 185);

    // Heading Caret indicator
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(cx, 196);
    ctx.lineTo(cx - 6, 206);
    ctx.lineTo(cx + 6, 206);
    ctx.closePath();
    ctx.fill();

    // Left Telemetry Ladder: O2 Pressure & Flow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.fillRect(140, cy - 140, 130, 280);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.strokeRect(140, cy - 140, 130, 280);

    ctx.font = 'bold 15px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('EVA SUIT SYS', 150, cy - 115);

    ctx.font = '13px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('O₂ LVL:', 150, cy - 85);
    ctx.fillStyle = '#34d399';
    ctx.fillText('98.4 %', 205, cy - 85);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText('PRESS:', 150, cy - 55);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('4.3 PSI', 205, cy - 55);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText('CO₂ LVL:', 150, cy - 25);
    ctx.fillStyle = '#34d399';
    ctx.fillText('0.02 %', 205, cy - 25);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText('FLOW:', 150, cy + 5);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('NOMINAL', 200, cy + 5);

    // O2 Step Bar Graph
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.fillRect(150, cy + 25, 110, 100);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(150, cy + 25 + 15, 110, 85);

    // Right Telemetry Ladder: Power, Rad, Inertial Data
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.fillRect(size - 270, cy - 140, 130, 280);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.strokeRect(size - 270, cy - 140, 130, 280);

    ctx.font = 'bold 15px monospace';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('BIOMETRICS', size - 260, cy - 115);

    ctx.font = '13px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('PULSE:', size - 260, cy - 85);
    ctx.fillStyle = '#f43f5e';
    ctx.fillText('74 BPM', size - 200, cy - 85);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText('RAD LVL:', size - 260, cy - 55);
    ctx.fillStyle = '#34d399';
    ctx.fillText('0.08 mSv', size - 195, cy - 55);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText('PWR BAT:', size - 260, cy - 25);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('94.8 %', size - 195, cy - 25);

    ctx.fillStyle = '#94a3b8';
    ctx.fillText('SYS STAT:', size - 260, cy + 5);
    ctx.fillStyle = '#34d399';
    ctx.fillText('GREEN', size - 190, cy + 5);

    // Heart rate wave miniature
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(size - 260, cy + 80);
    ctx.lineTo(size - 235, cy + 80);
    ctx.lineTo(size - 225, cy + 45);
    ctx.lineTo(size - 215, cy + 105);
    ctx.lineTo(size - 205, cy + 70);
    ctx.lineTo(size - 195, cy + 80);
    ctx.lineTo(size - 150, cy + 80);
    ctx.stroke();

    // Bottom Tactical Mission Callout Banner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.fillRect(cx - 240, size - 195, 480, 42);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.strokeRect(cx - 240, size - 195, 480, 42);
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#e0f2fe';
    ctx.fillText('EVA TACTICAL HUD // ARTEMIS MK-IV', cx - 180, size - 168);

    // Four Corner Tactical HUD Brackets
    const bLen = 45;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(110, 110 + bLen);
    ctx.lineTo(110, 110);
    ctx.lineTo(110 + bLen, 110);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(size - 110 - bLen, 110);
    ctx.lineTo(size - 110, 110);
    ctx.lineTo(size - 110, 110 + bLen);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(110, size - 110 - bLen);
    ctx.lineTo(110, size - 110);
    ctx.lineTo(110 + bLen, size - 110);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(size - 110 - bLen, size - 110);
    ctx.lineTo(size - 110, size - 110);
    ctx.lineTo(size - 110, size - 110 - bLen);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set('visor_hud', texture);
    return texture;
  }

  // Collimated In-Helmet HUD Flight Telemetry Texture (Clear Visor HUD Mode)
  public static getAstronautFaceTexture(): THREE.CanvasTexture {
    if (this.cache.has('astronaut_hud')) return this.cache.get('astronaut_hud')!;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Transparent HUD backdrop with faint cyan hex grid
    ctx.fillStyle = 'rgba(2, 6, 23, 0.2)';
    ctx.fillRect(0, 0, size, size);

    // Outer HUD Reticle Ring
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.42, 0, Math.PI * 2);
    ctx.stroke();

    // Center Crosshairs
    const cX = size / 2;
    const cY = size / 2;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cX - 25, cY); ctx.lineTo(cX - 8, cY);
    ctx.moveTo(cX + 8, cY); ctx.lineTo(cX + 25, cY);
    ctx.moveTo(cX, cY - 25); ctx.lineTo(cX, cY - 8);
    ctx.moveTo(cX, cY + 8); ctx.lineTo(cX, cY + 25);
    ctx.stroke();

    // Artificial Horizon Pitch Ladder
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cX - 40, cY - 30); ctx.lineTo(cX + 40, cY - 30);
    ctx.moveTo(cX - 30, cY - 60); ctx.lineTo(cX + 30, cY - 60);
    ctx.moveTo(cX - 40, cY + 30); ctx.lineTo(cX + 40, cY + 30);
    ctx.moveTo(cX - 30, cY + 60); ctx.lineTo(cX + 30, cY + 60);
    ctx.stroke();

    // Cybernetic biometric edge telemetry overlay
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('EVA SYSTEMS // NOMINAL', 45, 50);
    ctx.fillText('O2 LEVEL: 98.6% // PRESS: 4.3 PSI', 45, 68);
    ctx.fillText('PULSE: 72 BPM // SUIT BATT: 94%', 45, size - 50);

    ctx.fillStyle = '#f59e0b';
    ctx.fillText('NASA SPACE APPS • TEAM XTREAM', 45, size - 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set('astronaut_hud', texture);
    return texture;
  }

  // Solar Panel Photovoltaic Cell Texture
  public static getSolarPanelTexture(): THREE.CanvasTexture {
    if (this.cache.has('solar_panel')) return this.cache.get('solar_panel')!;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Deep iridescent photovoltaic blue
    ctx.fillStyle = '#0a192f';
    ctx.fillRect(0, 0, size, size);

    // Silicon solar cell grid
    const cols = 8;
    const rows = 16;
    const cellW = size / cols;
    const cellH = size / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? '#102a45' : '#0c233c';
        ctx.fillRect(c * cellW + 1, r * cellH + 1, cellW - 2, cellH - 2);

        // Fine silver busbars
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.55)';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(c * cellW + 1, r * cellH + 1, cellW - 2, cellH - 2);
        // Fine silver photovoltaic busbars
        ctx.fillStyle = 'rgba(226, 232, 240, 0.28)';
        ctx.fillRect(c * cellW + cellW * 0.48, r * cellH + 2, 1.5, cellH - 4);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 8;
    this.cache.set('solar_panel', texture);
    return texture;
  }

  // Gold Multi-Layer Thermal Insulation (MLI) Foil Texture
  public static getGoldFoilTexture(): THREE.CanvasTexture {
    if (this.cache.has('gold_foil')) return this.cache.get('gold_foil')!;

    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#d97706';
    ctx.fillRect(0, 0, size, size);

    // Rich Kapton foil crinkle facets
    for (let i = 0; i < 650; i++) {
      const fx = (i * 443.7) % size;
      const fy = (i * 289.1) % size;
      const fw = 16 + (i % 11) * 4;
      const fh = 14 + (i % 9) * 4;
      ctx.fillStyle =
        i % 3 === 0
          ? 'rgba(253, 224, 71, 0.42)'
          : i % 3 === 1
          ? 'rgba(180, 83, 9, 0.38)'
          : 'rgba(245, 158, 11, 0.34)';
      ctx.fillRect(fx, fy, fw, fh);
    }

    // Subtle Kapton quilt stitch seams
    ctx.strokeStyle = 'rgba(120, 53, 15, 0.32)';
    ctx.lineWidth = 2;
    for (let g = 128; g < size; g += 128) {
      ctx.beginPath();
      ctx.moveTo(g, 0);
      ctx.lineTo(g, size);
      ctx.moveTo(0, g);
      ctx.lineTo(size, g);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 8;
    this.cache.set('gold_foil', texture);
    return texture;
  }

  // Seamless Tileable Regolith & Aeolian Ripple Micro-Bump Texture for Moon & Mars Terrains
  public static getRegolithBumpTexture(kind: 'moon' | 'mars'): THREE.CanvasTexture {
    const key = `bump_${kind}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, size, size);

    if (kind === 'mars') {
      // Wind-blown aeolian sand ripples
      for (let y = 0; y < size; y += 16) {
        ctx.fillStyle = y % 32 === 0 ? 'rgba(215, 215, 215, 0.24)' : 'rgba(55, 55, 55, 0.24)';
        ctx.fillRect(0, y, size, 8);
      }
    }

    // Deterministic micro-craters & regolith clasts (tiled seamlessly near edges)
    for (let i = 0; i < 900; i++) {
      const cx = (i * 577.3) % size;
      const cy = (i * 397.9) % size;
      const r = 2 + (i % 9) * 1.8;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(35, 35, 35, 0.34)' : 'rgba(225, 225, 225, 0.32)';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 16);
    texture.anisotropy = 8;
    this.cache.set(key, texture);
    return texture;
  }

  // Space Shuttle Ceramic Thermal Tile & Fuselage Seam Texture
  public static getShuttleHullTexture(): THREE.CanvasTexture {
    if (this.cache.has('shuttle_hull')) return this.cache.get('shuttle_hull')!;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Aerospace ceramic white composite base
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, size, size);

    // Subtle tile grid & thermal weathering variations
    const step = 32;
    for (let y = 0; y < size; y += step) {
      const offset = ((y / step) % 2) * (step / 2);
      for (let x = -step; x < size + step; x += step) {
        const shade = 236 + ((x * 7 + y * 13) % 16);
        ctx.fillStyle = `rgb(${shade}, ${shade + 2}, ${Math.min(255, shade + 6)})`;
        ctx.fillRect(x + offset + 1, y + 1, step - 2, step - 2);
      }
    }

    // Crisp panel seams & inspection markings
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.35)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i <= size; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, size);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(size, i);
      ctx.stroke();
    }

    // Aerospace stripe & emblem band
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, size * 0.46, size, 12);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, size * 0.50, size, 5);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set('shuttle_hull', texture);
    return texture;
  }

  // Space Shuttle Cockpit Multi-Function Instrument (MFI) Console Texture
  public static getShuttleConsoleTexture(): THREE.CanvasTexture {
    if (this.cache.has('shuttle_console')) return this.cache.get('shuttle_console')!;

    const width = 512;
    const height = 256;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // 3 Glass-Cockpit MFD Screens
    const drawMfd = (x: number, y: number, w: number, h: number, title: string, accent: string) => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      ctx.fillStyle = accent;
      ctx.font = 'bold 12px monospace';
      ctx.fillText(title, x + 8, y + 18);

      // Horizon / Telemetry Bars
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h * 0.58, Math.min(w, h) * 0.25, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x + 12, y + h * 0.58);
      ctx.lineTo(x + w - 12, y + h * 0.58);
      ctx.stroke();

      for (let b = 0; b < 4; b++) {
        ctx.fillStyle = b < 3 ? '#34d399' : '#f59e0b';
        ctx.fillRect(x + 10 + b * 16, y + h - 22, 10, 12);
      }
    };

    drawMfd(18, 22, 144, 175, 'ATTITUDE // ADI', '#38bdf8');
    drawMfd(182, 22, 148, 175, 'ORBITAL NAV', '#34d399');
    drawMfd(350, 22, 144, 175, 'PROPULSION', '#f59e0b');

    // Bottom annunciator switches
    for (let s = 0; s < 14; s++) {
      ctx.fillStyle = s % 3 === 0 ? '#38bdf8' : s % 3 === 1 ? '#f59e0b' : '#334155';
      ctx.fillRect(24 + s * 34, 214, 20, 18);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.cache.set('shuttle_console', texture);
    return texture;
  }

  // Mercury Cratered Silicate & Iron Surface Texture
  public static getMercuryTexture(): THREE.CanvasTexture {
    if (this.cache.has('mercury')) return this.cache.get('mercury')!;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size / 2;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#78716c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 240; i++) {
      const x = (i * 193.7) % canvas.width;
      const y = (i * 97.3) % canvas.height;
      const r = 3 + (i % 14);
      ctx.fillStyle = i % 3 === 0 ? '#57534e' : i % 3 === 1 ? '#a8a29e' : '#64748b';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(214, 211, 209, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set('mercury', tex);
    return tex;
  }

  // Venus Swirling Golden Sulfuric Cloud Deck Texture
  public static getVenusTexture(): THREE.CanvasTexture {
    if (this.cache.has('venus')) return this.cache.get('venus')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#fde68a');
    grad.addColorStop(0.25, '#f59e0b');
    grad.addColorStop(0.5, '#fef08a');
    grad.addColorStop(0.75, '#d97706');
    grad.addColorStop(1, '#fde68a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 12; y < canvas.height - 12; y += 14) {
      ctx.strokeStyle = y % 28 === 0 ? 'rgba(255, 251, 235, 0.36)' : 'rgba(180, 83, 9, 0.25)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      for (let x = 0; x <= canvas.width; x += 24) {
        const wave = Math.sin(x * 0.03 + y * 0.1) * 8;
        if (x === 0) ctx.moveTo(x, y + wave);
        else ctx.lineTo(x, y + wave);
      }
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    this.cache.set('venus', tex);
    return tex;
  }

  // Jupiter Banded Ammonia Clouds + Great Red Spot Texture
  public static getJupiterTexture(): THREE.CanvasTexture {
    if (this.cache.has('jupiter')) return this.cache.get('jupiter')!;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    const bands = [
      '#78350f', '#d97706', '#fef3c7', '#b45309', '#f59e0b',
      '#fffbeb', '#c2410c', '#fde68a', '#9a3412', '#f59e0b',
      '#fef3c7', '#7c2d12', '#d97706', '#78350f'
    ];
    const bandH = canvas.height / bands.length;
    bands.forEach((col, idx) => {
      ctx.fillStyle = col;
      ctx.fillRect(0, idx * bandH, canvas.width, bandH + 2);
    });

    // Subtle turbulent zonal swirls
    for (let i = 0; i < 60; i++) {
      const y = (i / 60) * canvas.height;
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(255, 251, 235, 0.25)' : 'rgba(124, 45, 18, 0.28)';
      ctx.lineWidth = 4 + (i % 5);
      ctx.beginPath();
      for (let x = 0; x <= canvas.width; x += 24) {
        const dy = Math.sin(x * 0.025 + i) * 5;
        if (x === 0) ctx.moveTo(x, y + dy);
        else ctx.lineTo(x, y + dy);
      }
      ctx.stroke();
    }

    // Iconic Great Red Spot
    const gx = canvas.width * 0.62;
    const gy = canvas.height * 0.64;
    const spotGrad = ctx.createRadialGradient(gx, gy, 8, gx, gy, 54);
    spotGrad.addColorStop(0, '#ea580c');
    spotGrad.addColorStop(0.55, '#c2410c');
    spotGrad.addColorStop(0.85, '#fed7aa');
    spotGrad.addColorStop(1, 'rgba(254, 215, 170, 0)');
    ctx.fillStyle = spotGrad;
    ctx.save();
    ctx.translate(gx, gy);
    ctx.scale(1.45, 0.85);
    ctx.beginPath();
    ctx.arc(0, 0, 54, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    this.cache.set('jupiter', tex);
    return tex;
  }

  // Saturn Butterscotch & Cream Banded Globe Texture
  public static getSaturnTexture(): THREE.CanvasTexture {
    if (this.cache.has('saturn')) return this.cache.get('saturn')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#a16207');
    grad.addColorStop(0.2, '#fde047');
    grad.addColorStop(0.4, '#fef9c3');
    grad.addColorStop(0.55, '#eab308');
    grad.addColorStop(0.75, '#fef08a');
    grad.addColorStop(1, '#854d0e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 10; y < canvas.height - 10; y += 10) {
      ctx.fillStyle = y % 20 === 0 ? 'rgba(254, 249, 195, 0.25)' : 'rgba(133, 77, 14, 0.18)';
      ctx.fillRect(0, y, canvas.width, 4);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    this.cache.set('saturn', tex);
    return tex;
  }

  // Saturn Radial Ring Texture with Authentic Cassini Division Gap
  public static getSaturnRingTexture(): THREE.CanvasTexture {
    if (this.cache.has('saturn_ring')) return this.cache.get('saturn_ring')!;

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const cx = size / 2;
    const cy = size / 2;

    ctx.clearRect(0, 0, size, size);

    const drawRingBand = (innerR: number, outerR: number, color: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = outerR - innerR;
      ctx.beginPath();
      ctx.arc(cx, cy, (innerR + outerR) / 2, 0, Math.PI * 2);
      ctx.stroke();
    };

    // C Ring (faint inner), B Ring (bright wide), Cassini Gap, A Ring (bright outer)
    drawRingBand(112, 132, 'rgba(203, 213, 225, 0.35)');
    drawRingBand(134, 178, 'rgba(254, 240, 138, 0.88)');
    drawRingBand(145, 162, 'rgba(255, 251, 235, 0.72)');
    // Cassini gap left dark/transparent around r = 179..190
    drawRingBand(191, 232, 'rgba(226, 232, 240, 0.75)');
    drawRingBand(236, 242, 'rgba(254, 243, 199, 0.48)');

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set('saturn_ring', tex);
    return tex;
  }

  // Uranus Pale Aqua-Cyan Methane Ice Giant Texture
  public static getUranusTexture(): THREE.CanvasTexture {
    if (this.cache.has('uranus')) return this.cache.get('uranus')!;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#cffafe');
    grad.addColorStop(0.5, '#67e8f9');
    grad.addColorStop(1, '#22d3ee');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.cache.set('uranus', tex);
    return tex;
  }

  // Neptune Deep Cobalt Azure + Supersonic Cloud Streaks Texture
  public static getNeptuneTexture(): THREE.CanvasTexture {
    if (this.cache.has('neptune')) return this.cache.get('neptune')!;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#1d4ed8');
    grad.addColorStop(0.4, '#2563eb');
    grad.addColorStop(0.7, '#1e40af');
    grad.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // High-altitude white methane cirrus streaks & Great Dark Spot
    ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
    ctx.beginPath();
    ctx.ellipse(310, 148, 34, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(224, 242, 254, 0.55)';
    for (let i = 0; i < 14; i++) {
      ctx.fillRect((i * 83) % 460, 30 + ((i * 29) % 190), 48, 3);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    this.cache.set('neptune', tex);
    return tex;
  }
}
