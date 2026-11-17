import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  Alsep3DHandle,
  ApolloLM3DHandle,
  createAlsepStation3D,
  createApolloLunarModule3D,
  createLunarRovingVehicle3D,
  createSaturnV3D,
  createSurveyor3Lander3D,
  Lrv3DHandle,
  SaturnV3DHandle,
  Surveyor3DHandle
} from '../moonResources/MoonModels3D';
import { MoonResourceId } from '../moonResources/moonResourceTypes';
import {
  APOLLO_12_ALSEP_INSTRUMENTS,
  APOLLO_LM_COMPARISON,
  LRV_SPECIFICATIONS,
  MOON_RESOURCES
} from '../moonResources/moonResourceData';
import { RotateCcw, Layers, Cpu, Zap, Camera, Shovel, ShieldCheck } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface InteractiveModelInspectorProps {
  resourceId: MoonResourceId;
  accentColor: string;
}

function detectSoftwareWebGL(): boolean {
  try {
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
    if (!gl) return false;
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const str = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '';
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(str);
  } catch {
    return false;
  }
}

export const InteractiveModelInspector: React.FC<InteractiveModelInspectorProps> = ({
  resourceId
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Resource 01 controls
  const [lmViewTab, setLmViewTab] = useState<'eagle' | 'saturn_v'>('eagle');
  const [explodeValue, setExplodeValue] = useState<number>(0.45);
  const [lmHighlight, setLmHighlight] = useState<'descent' | 'ascent' | 'easep' | 'engine' | 'legs' | null>('descent');

  // Resource 02 controls
  const [lrvConfig, setLrvConfig] = useState<'folded' | 'deploying' | 'unfolded'>('unfolded');
  const [lrvHotspot, setLrvHotspot] = useState<string>('lrv_wheels');
  const [lrvSteerTest, setLrvSteerTest] = useState<number>(0);

  // Resource 03 controls
  const [alsepPart, setAlsepPart] = useState<string>('central');
  const [rtgCutaway, setRtgCutaway] = useState<boolean>(true);
  const [telemetryFlowOn, setTelemetryFlowOn] = useState<boolean>(true);

  // Resource 04 controls
  const [surveyorPart, setSurveyorPart] = useState<string>('surv_sampler');
  const [samplerReach, setSamplerReach] = useState<number>(0.7);
  const [samplerDepth, setSamplerDepth] = useState<number>(0.45);
  const [mirrorPan, setMirrorPan] = useState<number>(0.2);

  // Shared live refs for 3D scene mutation without re-creating renderer
  const handlesRef = useRef<{
    lm?: ApolloLM3DHandle;
    saturnV?: SaturnV3DHandle;
    lrv?: Lrv3DHandle;
    alsep?: Alsep3DHandle;
    surveyor?: Surveyor3DHandle;
    requestRender?: () => void;
  }>({});

  // Create WebGL Inspector Scene cleanly per resource/tab change
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 290;
    const isSoftwareGl = detectSoftwareWebGL();

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.shadowMap.enabled = !isSoftwareGl;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060b16);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTex = pmrem.fromScene(roomEnv, 0.04).texture;
    scene.environment = envTex;

    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
    camera.position.set(5.4, 3.6, 6.2);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.4);
    keyLight.position.set(8, 12, 9);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.9);
    fillLight.position.set(-7, 4, -5);
    scene.add(fillLight);

    scene.add(new THREE.AmbientLight(0x94a3b8, 0.45));

    // Regolith Turntable Pad
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(4.8, 5.2, 0.22, 48),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.92, metalness: 0.06 })
    );
    pad.position.y = -0.11;
    pad.receiveShadow = true;
    scene.add(pad);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(4.85, 4.98, 48),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.45 })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    scene.add(ring);

    const modelPivot = new THREE.Group();
    scene.add(modelPivot);

    handlesRef.current = {};

    if (resourceId === 'apollo_lm') {
      if (lmViewTab === 'saturn_v') {
        const saturn = createSaturnV3D();
        saturn.group.scale.setScalar(0.62);
        saturn.group.position.y = -0.15;
        modelPivot.add(saturn.group);
        handlesRef.current.saturnV = saturn;
        camera.position.set(6.2, 3.8, 7.6);
      } else {
        const lm = createApolloLunarModule3D({ scale: 0.88 });
        modelPivot.add(lm.group);
        handlesRef.current.lm = lm;
        camera.position.set(5.2, 3.4, 6.4);
      }
    } else if (resourceId === 'lunar_rover') {
      const lrv = createLunarRovingVehicle3D();
      lrv.group.scale.setScalar(1.38);
      modelPivot.add(lrv.group);
      handlesRef.current.lrv = lrv;
      camera.position.set(3.8, 2.2, 4.4);
    } else if (resourceId === 'alsep') {
      const alsep = createAlsepStation3D();
      alsep.group.scale.setScalar(0.85);
      modelPivot.add(alsep.group);
      handlesRef.current.alsep = alsep;
      camera.position.set(5.4, 3.8, 6.6);
    } else if (resourceId === 'surveyor') {
      const surv = createSurveyor3Lander3D();
      surv.group.scale.setScalar(1.35);
      modelPivot.add(surv.group);
      handlesRef.current.surveyor = surv;
      camera.position.set(3.8, 2.4, 4.8);
    }

    let azimuth = 0.65;
    let pitch = 0.42;
    let distance = camera.position.length();
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    const updateCamera = () => {
      const lookY = resourceId === 'apollo_lm' ? 2.1 : 1.05;
      const h = distance * Math.cos(pitch);
      const v = distance * Math.sin(pitch);
      camera.position.set(Math.sin(azimuth) * h, Math.max(0.6, v + 0.6), Math.cos(azimuth) * h);
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
      pitch = Math.max(0.08, Math.min(1.2, pitch + (e.clientY - prevY) * 0.008));
      prevX = e.clientX;
      prevY = e.clientY;
      updateCamera();
    };
    const onUp = () => {
      isDragging = false;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      distance = Math.max(2.6, Math.min(14, distance + e.deltaY * 0.004));
      updateCamera();
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    let disposed = false;
    let animId = 0;
    let paceId: number | null = null;
    const startMs = performance.now();

    const animate = () => {
      if (disposed) return;
      const elapsedSec = (performance.now() - startMs) / 1000;
      if (!isDragging) {
        azimuth += isSoftwareGl ? 0.008 : 0.003;
        updateCamera();
      }
      if (handlesRef.current.alsep) {
        handlesRef.current.alsep.animateTelemetry(elapsedSec, telemetryFlowOn);
      }
      if (handlesRef.current.lrv && lrvConfig === 'deploying') {
        handlesRef.current.lrv.setDeployProgress(0.5 + 0.4 * Math.sin(elapsedSec * 1.4));
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        paceId = window.setTimeout(() => {
          if (!disposed) animId = requestAnimationFrame(animate);
        }, 70);
      } else {
        animId = requestAnimationFrame(animate);
      }
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(animId);
      if (paceId !== null) clearTimeout(paceId);
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
  }, [resourceId, lmViewTab, telemetryFlowOn, lrvConfig]);

  // Apply interactive sliders & buttons without recreating renderer
  useEffect(() => {
    const h = handlesRef.current;
    if (h.lm) {
      h.lm.setExplodeProgress(explodeValue);
      h.lm.setHighlight(lmHighlight);
    }
    if (h.saturnV) {
      h.saturnV.setStageSeparation(explodeValue);
    }
    if (h.lrv) {
      if (lrvConfig === 'folded') h.lrv.setDeployProgress(0);
      else if (lrvConfig === 'unfolded') h.lrv.setDeployProgress(1);
      h.lrv.setDrivePose(lrvSteerTest, performance.now() * 0.001);
      h.lrv.setHighlight(lrvHotspot);
    }
    if (h.alsep) {
      h.alsep.setRtgCutaway(rtgCutaway);
      h.alsep.setHighlight(alsepPart);
    }
    if (h.surveyor) {
      h.surveyor.setSamplerPose(samplerReach, samplerDepth, 0.15);
      h.surveyor.setMirrorAngles(mirrorPan, 0.25);
      h.surveyor.setHighlight(surveyorPart);
    }
  }, [
    explodeValue,
    lmHighlight,
    lrvConfig,
    lrvHotspot,
    lrvSteerTest,
    alsepPart,
    rtgCutaway,
    surveyorPart,
    samplerReach,
    samplerDepth,
    mirrorPan
  ]);

  const activeConfig = MOON_RESOURCES[resourceId];
  const selectedHotspotInfo =
    activeConfig.hotspots.find(
      hs =>
        (resourceId === 'lunar_rover' && hs.id === lrvHotspot) ||
        (resourceId === 'surveyor' && hs.id === surveyorPart) ||
        (resourceId === 'alsep' && hs.id === `alsep_${alsepPart}`)
    ) || null;

  return (
    <div className="space-y-3" data-testid="interactive-3d-inspector">
      {/* 3D Viewport Box */}
      <div className="relative w-full h-[255px] sm:h-[290px] rounded-xl overflow-hidden border border-cyan-500/40 bg-slate-950">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-slate-950/90 border border-slate-700 text-[10px] font-mono text-cyan-300 flex items-center gap-1.5 pointer-events-none">
          <RotateCcw className="w-3 h-3" />
          <span>DRAG TO ROTATE 360° • SCROLL TO ZOOM</span>
        </div>
        {resourceId === 'apollo_lm' && (
          <div className="absolute top-2.5 right-2.5 flex gap-1 pointer-events-auto">
            <button
              onClick={() => {
                soundManager.playPing();
                setLmViewTab('eagle');
              }}
              className={`px-2 py-1 rounded text-[10px] font-mono font-bold border ${
                lmViewTab === 'eagle'
                  ? 'bg-amber-500 text-slate-950 border-white'
                  : 'bg-slate-950/90 text-slate-300 border-slate-700'
              }`}
            >
              Eagle 2-Stage LM
            </button>
            <button
              onClick={() => {
                soundManager.playPing();
                setLmViewTab('saturn_v');
              }}
              className={`px-2 py-1 rounded text-[10px] font-mono font-bold border ${
                lmViewTab === 'saturn_v'
                  ? 'bg-cyan-500 text-slate-950 border-white'
                  : 'bg-slate-950/90 text-slate-300 border-slate-700'
              }`}
            >
              Saturn V + Columbia + Eagle
            </button>
          </div>
        )}
      </div>

      {/* Resource-Specific Interactive 3D Controls */}
      {resourceId === 'apollo_lm' && (
        <div className="space-y-2.5">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-300 font-bold">
              <Layers className="w-4 h-4" />
              <span>
                {lmViewTab === 'eagle'
                  ? 'SPLIT ASCENT / DESCENT STAGES:'
                  : 'SATURN V STAGE SEPARATION:'}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <input
                aria-label="Stage separation slider"
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={explodeValue}
                onChange={e => setExplodeValue(parseFloat(e.target.value))}
                className="w-full accent-amber-400"
              />
              <button
                onClick={() => {
                  soundManager.playPing();
                  setExplodeValue(v => (v > 0.5 ? 0 : 1));
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-[10px] font-bold shrink-0"
              >
                {explodeValue > 0.5 ? 'Assemble' : 'Separate'}
              </button>
            </div>
          </div>

          {lmViewTab === 'eagle' && (
            <>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { id: 'descent', label: 'Descent Stage (Stay on Moon)' },
                    { id: 'ascent', label: 'Ascent Stage (Return to Orbit)' },
                    { id: 'legs', label: 'Landing Legs & Footpads' },
                    { id: 'engine', label: 'Descent Engine (LMDE)' },
                    { id: 'easep', label: 'EASEP Bay' }
                  ] as const
                ).map(btn => (
                  <button
                    key={btn.id}
                    onClick={() => {
                      soundManager.playPing();
                      setLmHighlight(btn.id);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono border transition ${
                      lmHighlight === btn.id
                        ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              <div className="rounded-xl overflow-hidden border border-slate-800 text-[11px]">
                <div className="grid grid-cols-3 bg-slate-950 px-3 py-1.5 font-mono font-bold text-cyan-300 border-b border-slate-800">
                  <span>Feature</span>
                  <span className="text-amber-300">Descent Stage</span>
                  <span className="text-sky-300">Ascent Stage</span>
                </div>
                {APOLLO_LM_COMPARISON.map(row => (
                  <div key={row.metric} className="grid grid-cols-3 px-3 py-1.5 bg-slate-900/60 border-b border-slate-800/60 text-slate-200">
                    <span className="font-bold text-slate-400">{row.metric}</span>
                    <span>{row.descent}</span>
                    <span>{row.ascent}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {resourceId === 'lunar_rover' && (
        <div className="space-y-2.5">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-sky-500/40 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-mono font-bold text-sky-300">LRV DEPLOYMENT STATE:</span>
            <div className="flex gap-1.5">
              {(['folded', 'deploying', 'unfolded'] as const).map(cfg => (
                <button
                  key={cfg}
                  onClick={() => {
                    soundManager.playPing();
                    setLrvConfig(cfg);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold uppercase border ${
                    lrvConfig === cfg
                      ? 'bg-sky-500 text-slate-950 border-white'
                      : 'bg-slate-900 text-slate-300 border-slate-700'
                  }`}
                >
                  {cfg}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-300">
              <span>Steer Wheels:</span>
              <input
                aria-label="Test dual axle steering"
                type="range"
                min={-0.45}
                max={0.45}
                step={0.05}
                value={lrvSteerTest}
                onChange={e => setLrvSteerTest(parseFloat(e.target.value))}
                className="w-24 accent-sky-400"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {activeConfig.hotspots.map(hs => (
              <button
                key={hs.id}
                onClick={() => {
                  soundManager.playPing();
                  setLrvHotspot(hs.id);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono border transition ${
                  lrvHotspot === hs.id
                    ? 'bg-sky-500/25 border-sky-400 text-sky-200 font-bold'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {hs.shortTitle}
              </button>
            ))}
          </div>

          {selectedHotspotInfo && (
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-sky-500/30 text-xs text-slate-200">
              <strong className="text-sky-300">{selectedHotspotInfo.label}: </strong>
              {selectedHotspotInfo.explanation}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px]">
            {LRV_SPECIFICATIONS.map(sp => (
              <div key={sp.label} className="p-2 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase">{sp.label}</div>
                <div className="font-semibold text-white">{sp.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {resourceId === 'alsep' && (
        <div className="space-y-2.5">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={() => {
                soundManager.playPing();
                setRtgCutaway(v => !v);
                setAlsepPart('snap27');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold border ${
                rtgCutaway
                  ? 'bg-amber-500/25 border-amber-400 text-amber-200'
                  : 'bg-slate-900 border-slate-700 text-slate-300'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{rtgCutaway ? 'SNAP-27 Pu-238 Cutaway: OPEN' : 'Open SNAP-27 Fuel Capsule'}</span>
            </button>

            <button
              onClick={() => {
                soundManager.playPing();
                setTelemetryFlowOn(v => !v);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold border ${
                telemetryFlowOn
                  ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                  : 'bg-slate-900 border-slate-700 text-slate-300'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Earth Radio Link: {telemetryFlowOn ? 'TRANSMITTING' : 'PAUSED'}</span>
            </button>
          </div>

          {/* SNAP-27 Energy Conversion Diagram */}
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 text-[11px]">
            <div className="font-mono font-bold text-amber-300 mb-1">
              SNAP-27 RTG ENERGY FLOW (~17 kg generator • ~4 kg Pu-238 capsule • ~70 W DC at ~16 V)
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-emerald-200">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40">Pu-238 Decay</span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded bg-orange-500/20 border border-orange-500/40">Heat</span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded bg-yellow-500/20 border border-yellow-500/40">Thermoelectric Conversion</span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40">DC Electricity</span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40">6 ALSEP Instruments</span>
            </div>
          </div>

          {/* Central + 6 Apollo 12 Instruments Selector */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => {
                soundManager.playPing();
                setAlsepPart('central');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono border ${
                alsepPart === 'central'
                  ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 font-bold'
                  : 'bg-slate-900 border-slate-700 text-slate-300'
              }`}
            >
              Central Station
            </button>
            <button
              onClick={() => {
                soundManager.playPing();
                setAlsepPart('snap27');
              }}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono border ${
                alsepPart === 'snap27'
                  ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold'
                  : 'bg-slate-900 border-slate-700 text-slate-300'
              }`}
            >
              SNAP-27 RTG
            </button>
            {APOLLO_12_ALSEP_INSTRUMENTS.map(inst => (
              <button
                key={inst.id}
                onClick={() => {
                  soundManager.playPing();
                  setAlsepPart(inst.id);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono border ${
                  alsepPart === inst.id
                    ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 font-bold'
                    : 'bg-slate-900 border-slate-700 text-slate-300'
                }`}
              >
                {inst.code} — {inst.name}
              </button>
            ))}
          </div>

          {(() => {
            const inst = APOLLO_12_ALSEP_INSTRUMENTS.find(i => i.id === alsepPart);
            if (inst) {
              return (
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-xs text-slate-200">
                  <strong className="text-emerald-300">
                    {inst.code} — {inst.name}:{' '}
                  </strong>
                  {inst.purpose} <span className="text-slate-400">({inst.plainExplanation})</span>
                </div>
              );
            }
            return (
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-xs text-slate-200">
                {alsepPart === 'snap27'
                  ? 'SNAP-27 supplied ~70 W at ~16 V DC continuously through blazing 14-day lunar days and -170°C lunar nights.'
                  : 'Apollo 12 Central Station distributed power, multiplexed all 6 instruments via ribbon cables, and beamed data nonstop to Earth.'}
              </div>
            );
          })()}
        </div>
      )}

      {resourceId === 'surveyor' && (
        <div className="space-y-2.5">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/40 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] font-mono">
            <div>
              <div className="flex items-center gap-1 text-purple-300 font-bold mb-1">
                <Shovel className="w-3.5 h-3.5" /> SAMPLER REACH (~1.5 m)
              </div>
              <input
                aria-label="Surveyor sampler reach"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={samplerReach}
                onChange={e => {
                  setSurveyorPart('surv_sampler');
                  setSamplerReach(parseFloat(e.target.value));
                }}
                className="w-full accent-purple-400"
              />
            </div>
            <div>
              <div className="flex items-center gap-1 text-emerald-300 font-bold mb-1">
                <ShieldCheck className="w-3.5 h-3.5" /> DIG DEPTH (~18 cm)
              </div>
              <input
                aria-label="Surveyor sampler dig depth"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={samplerDepth}
                onChange={e => {
                  setSurveyorPart('surv_sampler');
                  setSamplerDepth(parseFloat(e.target.value));
                }}
                className="w-full accent-emerald-400"
              />
            </div>
            <div>
              <div className="flex items-center gap-1 text-cyan-300 font-bold mb-1">
                <Camera className="w-3.5 h-3.5" /> TV MIRROR PAN (25/100 mm)
              </div>
              <input
                aria-label="Surveyor TV camera mirror pan"
                type="range"
                min={-1.5}
                max={1.5}
                step={0.1}
                value={mirrorPan}
                onChange={e => {
                  setSurveyorPart('surv_camera');
                  setMirrorPan(parseFloat(e.target.value));
                }}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {activeConfig.hotspots.map(hs => (
              <button
                key={hs.id}
                onClick={() => {
                  soundManager.playPing();
                  setSurveyorPart(hs.id);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono border transition ${
                  surveyorPart === hs.id
                    ? 'bg-purple-500/25 border-purple-400 text-purple-200 font-bold'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {hs.shortTitle}
              </button>
            ))}
          </div>

          {selectedHotspotInfo && (
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-purple-500/30 text-xs text-slate-200">
              <strong className="text-purple-300">{selectedHotspotInfo.label}: </strong>
              {selectedHotspotInfo.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
