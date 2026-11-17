import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ScientificDiscovery, DiscoveryCategory } from '../types';
import { DiscoveryModelFactory } from '../education/DiscoveryModelFactory';
import { narrationManager } from '../narration/narrationManager';
import { soundManager } from '../audio/soundManager';
import { 
  Volume2, VolumeX, Play, Pause, RotateCcw, 
  Sparkles, ExternalLink, BookmarkPlus, Check, X, BookOpen, Layers
} from 'lucide-react';

interface DiscoveryViewerProps {
  discovery: ScientificDiscovery;
  isCollected: boolean;
  detailedMode: boolean;
  onToggleDetailedMode: () => void;
  onCollect: (discovery: ScientificDiscovery) => void;
  onClose: () => void;
}

export const DiscoveryViewer: React.FC<DiscoveryViewerProps> = ({
  discovery,
  isCollected,
  detailedMode,
  onToggleDetailedMode,
  onCollect,
  onClose
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'science' | 'sources'>('overview');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [justCollected, setJustCollected] = useState(false);

  // 3D Canvas setup inside modal
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 2.0);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf59e0b, 1.2);
    dirLight2.position.set(-5, -2, -5);
    scene.add(dirLight2);

    // Load Model
    const model = DiscoveryModelFactory.createModel(discovery);
    scene.add(model);

    // Interactive Drag to Rotate
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      model.rotation.y += dx * 0.01;
      model.rotation.x += dy * 0.005;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch support
    let touchStartX = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const dx = e.touches[0].clientX - touchStartX;
        model.rotation.y += dx * 0.015;
        touchStartX = e.touches[0].clientX;
      }
    };
    dom.addEventListener('touchstart', onTouchStart);
    dom.addEventListener('touchmove', onTouchMove);

    // Render loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isDragging) {
        model.rotation.y += 0.005;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('touchstart', onTouchStart);
      dom.removeEventListener('touchmove', onTouchMove);
      renderer.dispose();
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
    };
  }, [discovery]);

  // Voice narration management (English Only)
  const handlePlayNarration = () => {
    soundManager.playPing();
    narrationManager.speak(discovery.audioTranscriptEn, {
      onStart: () => {
        setIsSpeaking(true);
        setIsPaused(false);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setIsPaused(false);
      },
      onError: () => {
        setIsSpeaking(false);
        setIsPaused(false);
      }
    });
  };

  const handlePauseNarration = () => {
    narrationManager.pause();
    setIsPaused(true);
  };

  const handleResumeNarration = () => {
    narrationManager.resume();
    setIsPaused(false);
  };

  const handleStopNarration = () => {
    narrationManager.stop();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const handleCollect = () => {
    if (isCollected || justCollected) return;
    soundManager.playCollect();
    setJustCollected(true);
    onCollect(discovery);
  };

  const getCategoryBadge = (cat: DiscoveryCategory) => {
    switch (cat) {
      case 'geology': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'exploration': return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'technology': return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'astrobiology': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'atmosphere': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col md:flex-row bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden hud-glow">
        
        {/* Close Button */}
        <button
          onClick={() => {
            handleStopNarration();
            onClose();
          }}
          className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          aria-label="Close discovery"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN: 3D Model Viewer & Audio Narration */}
        <div className="w-full md:w-5/12 flex flex-col bg-slate-950/70 border-b md:border-b-0 md:border-r border-slate-800">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <span className={`text-xs uppercase font-mono-tech tracking-wider px-2.5 py-1 rounded-full border ${getCategoryBadge(discovery.category)}`}>
              {discovery.planetId.toUpperCase()} • {discovery.category.toUpperCase()}
            </span>
            <span className="text-xs text-slate-400 font-mono-tech">
              {discovery.rarity} Discovery
            </span>
          </div>

          {/* 3D Canvas Container */}
          <div className="relative flex-1 min-h-[220px] sm:min-h-[260px] flex items-center justify-center cursor-grab active:cursor-grabbing">
            <div ref={mountRef} className="w-full h-full" />
            <div className="absolute bottom-2 left-3 text-[11px] font-mono-tech text-slate-400/80 pointer-events-none flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 animate-spin-slow" /> Drag to inspect 360°
            </div>
          </div>

          {/* Audio Narration Dock */}
          <div className="p-3 bg-slate-900/90 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
                <Volume2 className="w-4 h-4 text-cyan-400" /> Voice Guide Narration
              </div>

              {/* Audio Badge */}
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30 font-bold">
                ENGLISH COMM
              </span>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-2">
              {!isSpeaking || isPaused ? (
                <button
                  onClick={isPaused ? handleResumeNarration : handlePlayNarration}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium text-xs transition shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> {isPaused ? 'Resume Voice' : 'Play Narration'}
                </button>
              ) : (
                <button
                  onClick={handlePauseNarration}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium text-xs transition"
                >
                  <Pause className="w-3.5 h-3.5 fill-current" /> Pause Voice
                </button>
              )}

              {isSpeaking && (
                <button
                  onClick={handleStopNarration}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Stop voice"
                >
                  <VolumeX className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Live Transcript Snippet */}
            <div className="mt-2 text-[11px] text-slate-400/90 italic leading-snug line-clamp-2 bg-slate-950/50 p-1.5 rounded border border-slate-800">
              "{discovery.audioTranscriptEn}"
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Scientific Exhibition & NASA Verification */}
        <div className="w-full md:w-7/12 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-5 pr-12 border-b border-slate-800">
            <h2 className="text-xl sm:text-2xl font-bold font-display text-white mb-1">
              {discovery.name}
            </h2>
            <p className="text-xs sm:text-sm text-cyan-300 font-medium">
              {discovery.headline}
            </p>
          </div>

          {/* Mode Switcher & Tabs */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 bg-slate-950/40 border-b border-slate-800 text-xs">
            {/* Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-1 px-2.5 rounded-md font-medium transition ${activeTab === 'overview' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('science')}
                className={`py-1 px-2.5 rounded-md font-medium transition ${activeTab === 'science' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'}`}
              >
                Scientific Deep Dive
              </button>
              <button
                onClick={() => setActiveTab('sources')}
                className={`py-1 px-2.5 rounded-md font-medium transition ${activeTab === 'sources' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'}`}
              >
                NASA Sources
              </button>
            </div>

            {/* Simple / Detailed Toggle */}
            <button
              onClick={onToggleDetailedMode}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white transition bg-slate-800/80 px-2 py-1 rounded border border-slate-700"
              title="Toggle reading level"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>{detailedMode ? 'Scientist Level' : 'Student Level'}</span>
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-sm text-slate-300 leading-relaxed">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <h4 className="text-xs uppercase font-mono-tech tracking-wider text-cyan-400 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Core Discovery
                  </h4>
                  <p className="text-slate-200">
                    {detailedMode ? discovery.detailedExplanation : discovery.simpleExplanation}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800">
                    <h5 className="text-xs font-mono-tech text-amber-400 uppercase mb-1">What Is It?</h5>
                    <p className="text-xs text-slate-300">{discovery.whatIsIt}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800">
                    <h5 className="text-xs font-mono-tech text-emerald-400 uppercase mb-1">How It Works</h5>
                    <p className="text-xs text-slate-300">{discovery.howItWorks}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'science' && (
              <div className="space-y-3.5">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <h5 className="text-xs font-mono-tech text-cyan-400 uppercase mb-1">What Scientists Learned</h5>
                  <p className="text-xs sm:text-sm text-slate-200">{discovery.whatScientistsLearned}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <h5 className="text-xs font-mono-tech text-purple-400 uppercase mb-1">Why It Matters</h5>
                  <p className="text-xs sm:text-sm text-slate-200">{discovery.whyItMatters}</p>
                </div>
              </div>
            )}

            {activeTab === 'sources' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  Every fact in Team Xtream on its Mission to NASA Space Apps Challenge is grounded in peer-reviewed planetary science and official space agency missions:
                </p>
                {discovery.sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-cyan-300 transition">
                        {src.title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {src.publisher} • {src.missionOrProgram}
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition shrink-0 ml-2 mt-0.5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-3">
            <div className="text-xs text-slate-400 font-mono-tech">
              Status: {isCollected || justCollected ? (
                <span className="text-emerald-400 font-semibold inline-flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> In Backpack
                </span>
              ) : (
                <span className="text-cyan-400">Ready to Collect (+100 XP)</span>
              )}
            </div>

            <button
              onClick={handleCollect}
              disabled={isCollected || justCollected}
              className={`flex items-center gap-2 py-2 px-4 rounded-xl font-medium text-xs sm:text-sm transition shadow-lg ${
                isCollected || justCollected
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold active:scale-95'
              }`}
            >
              {isCollected || justCollected ? (
                <>
                  <Check className="w-4 h-4" /> Collected to Backpack
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-4 h-4" /> Collect Discovery
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
