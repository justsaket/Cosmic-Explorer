import * as THREE from 'three';
import { ScientificDiscovery } from '../types';

export class DiscoveryModelFactory {
  public static createModel(discovery: ScientificDiscovery): THREE.Group {
    const group = new THREE.Group();

    switch (discovery.modelType) {
      case 'apollo_descent': {
        const baseGeo = new THREE.CylinderGeometry(1.6, 1.8, 1.0, 8);
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.2 });
        const base = new THREE.Mesh(baseGeo, goldMat);
        base.position.y = 0.6;
        group.add(base);

        // Rocket engine bell
        const bellGeo = new THREE.ConeGeometry(0.6, 0.8, 16, 1, true);
        const bellMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 });
        const bell = new THREE.Mesh(bellGeo, bellMat);
        bell.position.y = -0.1;
        group.add(bell);

        // Landing legs
        for (let i = 0; i < 4; i++) {
          const leg = new THREE.Group();
          leg.rotation.y = (i * Math.PI) / 2 + Math.PI / 4;
          const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8, 8), goldMat);
          strut.rotation.z = Math.PI / 4;
          strut.position.set(1.0, 0.4, 0);
          leg.add(strut);
          const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.06, 12), bellMat);
          foot.position.set(1.7, -0.2, 0);
          leg.add(foot);
          group.add(leg);
        }
        break;
      }

      case 'perseverance_rover': {
        const bodyGeo = new THREE.BoxGeometry(1.8, 0.7, 1.1);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.4, roughness: 0.3 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.7;
        group.add(body);

        // Mast & Mastcam
        const mastGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.1, 8);
        const mastMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7 });
        const mast = new THREE.Mesh(mastGeo, mastMat);
        mast.position.set(0.6, 1.5, 0.3);
        group.add(mast);

        const camHead = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 0.3), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
        camHead.position.set(0.6, 2.05, 0.3);
        group.add(camHead);

        // Wheels
        const wheelOffsets = [
          [-0.8, 0.3, 0.7], [0, 0.3, 0.7], [0.8, 0.3, 0.7],
          [-0.8, 0.3, -0.7], [0, 0.3, -0.7], [0.8, 0.3, -0.7]
        ];
        wheelOffsets.forEach(([wx, wy, wz]) => {
          const w = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.25, 0.2, 12),
            new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 })
          );
          w.rotation.z = Math.PI / 2;
          w.position.set(wx, wy, wz);
          group.add(w);
        });

        // Sample Arm
        const armGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8);
        const arm = new THREE.Mesh(armGeo, mastMat);
        arm.rotation.z = -Math.PI / 3;
        arm.position.set(0.9, 0.5, -0.3);
        group.add(arm);
        break;
      }

      case 'laser_reflector': {
        const frameGeo = new THREE.BoxGeometry(1.6, 0.4, 1.2);
        const frameMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.4 });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.position.y = 0.4;
        group.add(frame);

        const prismGeo = new THREE.BoxGeometry(1.4, 0.1, 1.0);
        const prismMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          metalness: 0.95,
          roughness: 0.05,
          emissive: 0x0284c7,
          emissiveIntensity: 0.4
        });
        const prisms = new THREE.Mesh(prismGeo, prismMat);
        prisms.position.y = 0.65;
        group.add(prisms);
        break;
      }

      case 'mars_sample_tube': {
        const tubeGeo = new THREE.CylinderGeometry(0.2, 0.2, 2.0, 24);
        tubeGeo.rotateZ(Math.PI / 3);
        const tubeMat = new THREE.MeshStandardMaterial({
          color: 0xf8fafc,
          metalness: 0.98,
          roughness: 0.1,
          emissive: 0x38bdf8,
          emissiveIntensity: 0.25
        });
        const tube = new THREE.Mesh(tubeGeo, tubeMat);
        tube.position.y = 0.8;
        group.add(tube);

        // Hermetic cap
        const capGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.3, 16);
        capGeo.rotateZ(Math.PI / 3);
        const cap = new THREE.Mesh(capGeo, new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9 }));
        cap.position.set(0.65, 1.2, 0);
        group.add(cap);
        break;
      }

      case 'lunar_regolith':
      case 'martian_meteorite': {
        const rockGeo = new THREE.DodecahedronGeometry(1.1);
        const rockMat = new THREE.MeshStandardMaterial({
          color: discovery.planetId === 'moon' ? 0x475569 : 0x7c2d12,
          roughness: 0.85,
          metalness: 0.15
        });
        const rock = new THREE.Mesh(rockGeo, rockMat);
        rock.position.y = 0.9;
        group.add(rock);
        break;
      }

      case 'water_ice_depot': {
        const baseGeo = new THREE.CylinderGeometry(1.5, 1.6, 0.4, 16);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
        const base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = 0.2;
        group.add(base);

        const iceMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          roughness: 0.1,
          metalness: 0.6,
          transparent: true,
          opacity: 0.85,
          emissive: 0x0284c7,
          emissiveIntensity: 0.5
        });
        for (let i = 0; i < 5; i++) {
          const crystal = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.4, 6), iceMat);
          crystal.position.set(Math.cos(i * 1.3) * 0.7, 0.9, Math.sin(i * 1.3) * 0.7);
          crystal.rotation.z = (Math.random() - 0.5) * 0.4;
          group.add(crystal);
        }
        break;
      }

      case 'launch_complex': {
        // Miniature Pad 39B Mobile Launcher & SLS Rocket
        const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.4, 2.4), new THREE.MeshStandardMaterial({ color: 0x475569 }));
        group.add(base);

        const tower = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.2, 0.5), new THREE.MeshStandardMaterial({ color: 0xb91c1c, metalness: 0.7 }));
        tower.position.set(-0.5, 1.8, 0);
        group.add(tower);

        const rocket = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 2.8, 16), new THREE.MeshStandardMaterial({ color: 0xc2410c }));
        rocket.position.set(0.2, 1.6, 0);
        group.add(rocket);

        const capsule = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.6, 16), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
        capsule.position.set(0.2, 3.3, 0);
        group.add(capsule);
        break;
      }

      case 'flight_ops': {
        // Mission Control Console Terminal Cluster
        const desk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 1.2), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
        desk.position.y = 0.4;
        group.add(desk);

        for (let i = -1; i <= 1; i++) {
          const screen = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.05), new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0284c7, emissiveIntensity: 0.6 }));
          screen.position.set(i * 0.75, 1.05, 0.2);
          screen.rotation.x = -0.15;
          group.add(screen);
        }
        break;
      }

      case 'dsn_array': {
        // Miniature 70-meter Deep Space Network Dish
        const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 1.5, 12), new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 }));
        pylon.position.y = 0.75;
        group.add(pylon);

        const dish = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 0.3, 0.6, 24), new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.85, roughness: 0.15 }));
        dish.rotateX(Math.PI / 3);
        dish.position.set(0, 1.6, 0.3);
        group.add(dish);
        break;
      }

      case 'gravity_station': {
        // Absolute Laser Gravimeter Chamber
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 0.3, 16), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 }));
        base.position.y = 0.15;
        group.add(base);

        const vacuumTube = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.35, 2.0, 16),
          new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, roughness: 0.1, clearcoat: 0.9, transparent: true, opacity: 0.55 })
        );
        vacuumTube.position.y = 1.3;
        group.add(vacuumTube);

        const laserEmitter = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.3, 12), new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.8 }));
        laserEmitter.position.y = 2.45;
        group.add(laserEmitter);
        break;
      }

      default: {
        // Universal scientific core exhibit
        const pedestalGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.4, 16);
        const pedMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.4 });
        const ped = new THREE.Mesh(pedestalGeo, pedMat);
        ped.position.y = 0.2;
        group.add(ped);

        const orbGeo = new THREE.IcosahedronGeometry(0.85, 2);
        const orbMat = new THREE.MeshStandardMaterial({
          color: discovery.planetId === 'moon' ? 0x94a3b8 : discovery.planetId === 'earth' ? 0x0284c7 : 0xea580c,
          roughness: 0.4,
          metalness: 0.4,
          emissive: 0x38bdf8,
          emissiveIntensity: 0.2
        });
        const orb = new THREE.Mesh(orbGeo, orbMat);
        orb.position.y = 1.1;
        group.add(orb);
        break;
      }
    }

    return group;
  }
}
