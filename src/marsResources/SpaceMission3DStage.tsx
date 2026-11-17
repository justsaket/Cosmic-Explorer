import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { MarsAndSpaceResourceId } from './marsResourceTypes';
import {
  createCuriosityRover3D,
  createDawnAndWorlds3D,
  createIngenuityAndPerseverance3D,
  createKeplerObservatory3D,
  createMerRover3D,
  createPathfinderAndSojourner3D,
  createPhoenixAndInsight3D,
  createPioneer3D,
  createViking1Pair3D,
  Curiosity3DHandle,
  DawnMission3DHandle,
  Ingenuity3DHandle,
  KeplerObservatory3DHandle,
  MerRover3DHandle,
  PathfinderSojourner3DHandle,
  PhoenixInsight3DHandle,
  Pioneer3DHandle,
  Viking1Pair3DHandle
} from './MarsModels3D';
import { computePathfinderEdlState, computePhoenixFrostSublimation } from './marsResourceData';

export interface SpaceMission3DStageProps {
  resourceId: MarsAndSpaceResourceId;
  activeHotspotId?: string | null;
  // Pathfinder / Sojourner
  edlProgress?: number;
  // MER Spirit / Opportunity
  merVariant?: 'spirit' | 'opportunity';
  merArmExt?: number;
  // Viking 1
  vikingOrbiterSep?: number;
  vikingArmScoop?: number;
  // Phoenix / InSight
  phoenixInsightMode?: 'phoenix' | 'insight';
  phoenixFrostSol?: number;
  // Curiosity
  curiosityLaserOn?: boolean;
  curiosityArmExt?: number;
  // Ingenuity
  ingenuityAltMeters?: number;
  ingenuityFlight72Damaged?: boolean;
  // Dawn
  dawnTargetWorld?: 'vesta' | 'ceres';
  dawnCutaway?: boolean;
  dawnIonOn?: boolean;
  // Pioneer 10 / 11
  pioneerMode?: 'spacecraft' | 'plaque' | 'flyby';
  pioneerFlybyPlanet?: 'jupiter' | 'saturn';
  // Kepler
  keplerMode?: 'observatory' | 'transit';
  keplerTransitPhase?: number;
  keplerRadiusRatio?: number;
  keplerK2Roll?: number;
}

function probeSoftwareWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const str = String(gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(str);
  } catch {
    return false;
  }
}

export const SpaceMission3DStage: React.FC<SpaceMission3DStageProps> = ({
  resourceId,
  activeHotspotId = null,
  edlProgress = 1,
  merVariant = 'opportunity',
  merArmExt = 0.5,
  vikingOrbiterSep = 0.85,
  vikingArmScoop = 0.4,
  phoenixInsightMode = 'phoenix',
  phoenixFrostSol = 1,
  curiosityLaserOn = true,
  curiosityArmExt = 0.45,
  ingenuityAltMeters = 0,
  ingenuityFlight72Damaged = true,
  dawnTargetWorld = 'ceres',
  dawnCutaway = false,
  dawnIonOn = true,
  pioneerMode = 'spacecraft',
  pioneerFlybyPlanet = 'saturn',
  keplerMode = 'observatory',
  keplerTransitPhase = 0.5,
  keplerRadiusRatio = 0.12,
  keplerK2Roll = 0
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  const propsRef = useRef({
    activeHotspotId,
    edlProgress,
    merArmExt,
    vikingOrbiterSep,
    vikingArmScoop,
    phoenixInsightMode,
    phoenixFrostSol,
    curiosityLaserOn,
    curiosityArmExt,
    ingenuityAltMeters,
    ingenuityFlight72Damaged,
    dawnTargetWorld,
    dawnCutaway,
    dawnIonOn,
    pioneerMode,
    pioneerFlybyPlanet,
    keplerMode,
    keplerTransitPhase,
    keplerRadiusRatio,
    keplerK2Roll
  });
  propsRef.current = {
    activeHotspotId,
    edlProgress,
    merArmExt,
    vikingOrbiterSep,
    vikingArmScoop,
    phoenixInsightMode,
    phoenixFrostSol,
    curiosityLaserOn,
    curiosityArmExt,
    ingenuityAltMeters,
    ingenuityFlight72Damaged,
    dawnTargetWorld,
    dawnCutaway,
    dawnIonOn,
    pioneerMode,
    pioneerFlybyPlanet,
    keplerMode,
    keplerTransitPhase,
    keplerRadiusRatio,
    keplerK2Roll
  };

  const handlesRef = useRef<{
    pathfinder?: PathfinderSojourner3DHandle;
    mer?: MerRover3DHandle;
    viking?: Viking1Pair3DHandle;
    phoenixInsight?: PhoenixInsight3DHandle;
    curiosity?: Curiosity3DHandle;
    ingenuity?: Ingenuity3DHandle;
    dawn?: DawnMission3DHandle;
    pioneer?: Pioneer3DHandle;
    kepler?: KeplerObservatory3DHandle;
  }>({});

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 520;
    const height = container.clientHeight || 290;
    const isSoftwareGl = probeSoftwareWebGL();
    const isDeepSpace =
      resourceId === 'dawn' || resourceId === 'pioneer' || resourceId === 'kepler';

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance'
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDeepSpace ? 0x030712 : 0x26120c);
    scene.fog = new THREE.FogExp2(isDeepSpace ? 0x030712 : 0x26120c, 0.026);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTex = pmrem.fromScene(roomEnv, 0.04).texture;
    scene.environment = envTex;

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);

    // Balanced warm/cool lighting rig
    const keyLight = new THREE.DirectionalLight(0xffedd5, 2.5);
    keyLight.position.set(8, 12, 9);
    scene.add(keyLight);
    scene.add(new THREE.HemisphereLight(0x38bdf8, isDeepSpace ? 0x0f172a : 0x7c2d12, 0.85));

    // Ground/space turntable base
    if (!isDeepSpace) {
      const pad = new THREE.Mesh(
        new THREE.CylinderGeometry(5.2, 5.6, 0.24, 48),
        new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.94, metalness: 0.04 })
      );
      pad.position.y = -0.12;
      pad.receiveShadow = true;
      scene.add(pad);
    } else {
      // Subtle deep-space grid ring
      const orbitGuide = new THREE.Mesh(
        new THREE.RingGeometry(4.6, 4.72, 48),
        new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.25
        })
      );
      orbitGuide.rotation.x = -Math.PI / 2;
      scene.add(orbitGuide);
    }

    const pivot = new THREE.Group();
    scene.add(pivot);
    handlesRef.current = {};

    let defaultDist = 7.4;
    let lookY = 1.15;

    if (resourceId === 'sojourner') {
      const h = createPathfinderAndSojourner3D();
      pivot.add(h.group);
      handlesRef.current.pathfinder = h;
      defaultDist = 7.8;
      lookY = 0.85;
    } else if (resourceId === 'spirit_opportunity') {
      const h = createMerRover3D(merVariant);
      h.group.scale.setScalar(1.3);
      pivot.add(h.group);
      handlesRef.current.mer = h;
      defaultDist = 5.4;
      lookY = 1.0;
    } else if (resourceId === 'viking_1') {
      const h = createViking1Pair3D();
      pivot.add(h.group);
      handlesRef.current.viking = h;
      defaultDist = 7.8;
      lookY = 2.0;
    } else if (resourceId === 'phoenix_insight') {
      const h = createPhoenixAndInsight3D();
      h.group.scale.setScalar(1.15);
      pivot.add(h.group);
      handlesRef.current.phoenixInsight = h;
      defaultDist = 6.2;
      lookY = 0.8;
    } else if (resourceId === 'curiosity') {
      const h = createCuriosityRover3D();
      h.group.scale.setScalar(1.22);
      pivot.add(h.group);
      handlesRef.current.curiosity = h;
      defaultDist = 5.8;
      lookY = 1.05;
    } else if (resourceId === 'ingenuity') {
      const h = createIngenuityAndPerseverance3D();
      pivot.add(h.group);
      handlesRef.current.ingenuity = h;
      defaultDist = 6.8;
      lookY = 1.15;
    } else if (resourceId === 'dawn') {
      const h = createDawnAndWorlds3D();
      pivot.add(h.group);
      handlesRef.current.dawn = h;
      defaultDist = 7.6;
      lookY = 1.75;
    } else if (resourceId === 'pioneer') {
      const h = createPioneer3D();
      pivot.add(h.group);
      handlesRef.current.pioneer = h;
      defaultDist = 6.8;
      lookY = 1.85;
    } else if (resourceId === 'kepler') {
      const h = createKeplerObservatory3D();
      pivot.add(h.group);
      handlesRef.current.kepler = h;
      defaultDist = 6.6;
      lookY = 2.0;
    }

    let azimuth = 0.6;
    let pitch = 0.34;
    let distance = defaultDist;
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    const updateCamera = () => {
      const horiz = distance * Math.cos(pitch);
      const vert = distance * Math.sin(pitch);
      camera.position.set(Math.sin(azimuth) * horiz, Math.max(0.5, vert + lookY * 0.45), Math.cos(azimuth) * horiz);
      camera.lookAt(0, lookY, 0);
    };
    updateCamera();

    const onDown = (e: MouseEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onMove = (e: MouseEvent) => {
      if (!isDragging) return;
      azimuth -= (e.clientX - prevX) * 0.01;
      pitch = Math.max(0.05, Math.min(1.22, pitch + (e.clientY - prevY) * 0.008));
      prevX = e.clientX;
      prevY = e.clientY;
      updateCamera();
    };
    const onUp = () => {
      isDragging = false;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      distance = Math.max(3.0, Math.min(16, distance + e.deltaY * 0.004));
      updateCamera();
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    const gl2 = renderer.getContext() as WebGL2RenderingContext;
    let disposed = false;
    let animId = 0;
    let timerId = 0;
    const startMs = performance.now();

    const afterDraw = (cb: () => void) => {
      if (disposed) return;
      if (typeof gl2?.fenceSync === 'function') {
        const sync = gl2.fenceSync(gl2.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl2.flush();
        const poll = () => {
          if (disposed) {
            if (sync) gl2.deleteSync(sync);
            return;
          }
          const status = sync && gl2.getSyncParameter(sync, gl2.SYNC_STATUS);
          if (status === gl2.UNSIGNALED) {
            timerId = window.setTimeout(poll, 8);
          } else {
            if (sync) gl2.deleteSync(sync);
            timerId = window.setTimeout(cb, 80);
          }
        };
        timerId = window.setTimeout(poll, 8);
      } else {
        timerId = window.setTimeout(cb, 80);
      }
    };

    const tick = () => {
      if (disposed) return;
      const elapsedSec = (performance.now() - startMs) / 1000;
      const live = propsRef.current;

      if (!isDragging && !(resourceId === 'pioneer' && live.pioneerMode === 'plaque')) {
        azimuth += isSoftwareGl ? 0.006 : 0.0028;
        updateCamera();
      } else if (resourceId === 'pioneer' && live.pioneerMode === 'plaque' && !isDragging) {
        azimuth = THREE.MathUtils.damp(azimuth, 0, 5, 0.04);
        pitch = THREE.MathUtils.damp(pitch, 0.14, 5, 0.04);
        updateCamera();
      }

      const h = handlesRef.current;
      if (h.pathfinder) {
        const edl = computePathfinderEdlState(live.edlProgress ?? 1);
        h.pathfinder.setSequencePose({
          altitudeMeters: Math.min(3.5, edl.altitudeMeters * 0.0005),
          airbagsVisible: edl.airbagsInflated,
          petalsOpen01: edl.petalsOpen01,
          rampExtended01: edl.rampExtended01,
          sojournerOffsetZ: edl.sojournerRollOffset
        });
        h.pathfinder.setHighlight(live.activeHotspotId ?? null);
      }
      if (h.mer) {
        h.mer.setArmExtended(live.merArmExt ?? 0.5);
        h.mer.setHighlight(live.activeHotspotId ?? null);
      }
      if (h.viking) {
        h.viking.setSequenceState({
          orbiterSeparation01: live.vikingOrbiterSep ?? 0.85,
          armScoop01: live.vikingArmScoop ?? 0.4
        });
        h.viking.setHighlight(live.activeHotspotId ?? null);
      }
      if (h.phoenixInsight) {
        h.phoenixInsight.setMode(live.phoenixInsightMode ?? 'phoenix');
        const frost = computePhoenixFrostSublimation(live.phoenixFrostSol ?? 1);
        h.phoenixInsight.setPhoenixFrostPercent(frost.visibleBrightIcePercent);
        h.phoenixInsight.setHighlight(live.activeHotspotId ?? null);
      }
      if (h.curiosity) {
        h.curiosity.setLaserActive(Boolean(live.curiosityLaserOn), elapsedSec);
        h.curiosity.setArmExtended(live.curiosityArmExt ?? 0.45);
        h.curiosity.setHighlight(live.activeHotspotId ?? null);
      }
      if (h.ingenuity) {
        const flying = (live.ingenuityAltMeters ?? 0) > 0.05 && !live.ingenuityFlight72Damaged;
        h.ingenuity.setFlightPose({
          altitudeMeters: flying ? live.ingenuityAltMeters ?? 0 : 0,
          rotorSpinRad: flying ? elapsedSec * 24 : 0,
          flight72Damaged: Boolean(live.ingenuityFlight72Damaged)
        });
        h.ingenuity.setHighlight(live.activeHotspotId ?? null);
      }
      if (h.dawn) {
        h.dawn.setTargetWorld(
          live.dawnTargetWorld ?? 'ceres',
          Boolean(live.dawnCutaway),
          Boolean(live.dawnIonOn)
        );
        h.dawn.animate(elapsedSec);
        h.dawn.setHighlight(live.activeHotspotId ?? null);
      }
      if (h.pioneer) {
        h.pioneer.setMode(live.pioneerMode ?? 'spacecraft', live.pioneerFlybyPlanet ?? 'saturn');
        h.pioneer.animate(elapsedSec);
        h.pioneer.setHighlight(live.activeHotspotId ?? null);
      }
      if (h.kepler) {
        h.kepler.setMode(live.keplerMode ?? 'observatory');
        h.kepler.setTransitState(
          live.keplerTransitPhase ?? 0.5,
          live.keplerRadiusRatio ?? 0.12,
          live.keplerK2Roll ?? 0
        );
        h.kepler.setHighlight(live.activeHotspotId ?? null);
      }

      renderer.render(scene, camera);
      if (isSoftwareGl) {
        afterDraw(() => {
          if (!disposed) animId = requestAnimationFrame(tick);
        });
      } else {
        animId = requestAnimationFrame(tick);
      }
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      clearTimeout(timerId);
      dom.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      dom.removeEventListener('wheel', onWheel);
      roomEnv.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (container.contains(dom)) container.removeChild(dom);
    };
  }, [resourceId, merVariant]);

  return (
    <div className="relative w-full h-[250px] sm:h-[290px] rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
      <div
        ref={mountRef}
        data-testid={`space-3d-stage-${resourceId}`}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />
      <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-[10px] font-mono text-cyan-300 pointer-events-none">
        DRAG TO ROTATE 360° • SCROLL TO ZOOM
      </div>
    </div>
  );
};
