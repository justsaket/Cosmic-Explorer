import React, { useState } from 'react';
import { PlanetId, ScientificDiscovery } from '../types';
import { ACTIVE_SURFACE_DISCOVERIES } from '../education/contentLibrary';
import {
  APOLLO_12_INTREPID_SITE,
  MOON_CHRONOLOGICAL_TIMELINE,
  MOON_RESOURCE_SITES
} from '../moonResources/moonResourceData';
import { MoonChronologicalEvent, MoonResourceId } from '../moonResources/moonResourceTypes';
import {
  MARS_ALL_SITES,
  MARS_CHRONOLOGICAL_TIMELINE
} from '../marsResources/marsResourceData';
import {
  MarsAndSpaceResourceId,
  MarsChronologicalEvent
} from '../marsResources/marsResourceTypes';
import {
  Map, Navigation, Radio, X, Crosshair, Sparkles, Clock, Compass
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { SHUTTLE_PADS } from '../shuttle/shuttleTravelState';
import { ShuttleSurfacePlanet } from '../shuttle/shuttleSystem';

interface PlanetaryMapModalProps {
  currentPlanet: PlanetId;
  playerCoordinates: { x: number; y: number; z: number };
  activeLrvMissionId?: 'apollo_15' | 'apollo_16' | 'apollo_17';
  onClose: () => void;
  onSelectDiscovery: (discovery: ScientificDiscovery) => void;
  onNavigateMoonSite?: (event: MoonChronologicalEvent) => void;
  onOpenMoonResourceFromMap?: (
    resourceId: MoonResourceId,
    lrvMissionId?: 'apollo_15' | 'apollo_16' | 'apollo_17'
  ) => void;
  onNavigateMarsSite?: (event: MarsChronologicalEvent) => void;
  onOpenMarsResourceFromMap?: (
    resourceId: MarsAndSpaceResourceId,
    subFocus?: 'spirit' | 'opportunity' | 'phoenix' | 'insight'
  ) => void;
}

export const PlanetaryMapModal: React.FC<PlanetaryMapModalProps> = ({
  currentPlanet,
  playerCoordinates,
  activeLrvMissionId = 'apollo_15',
  onClose,
  onSelectDiscovery,
  onNavigateMoonSite,
  onOpenMoonResourceFromMap,
  onNavigateMarsSite,
  onOpenMarsResourceFromMap
}) => {
  const [selectedSite, setSelectedSite] = useState<ScientificDiscovery | null>(null);
  const [selectedMoonEvent, setSelectedMoonEvent] = useState<MoonChronologicalEvent>(
    () => MOON_CHRONOLOGICAL_TIMELINE[0]
  );
  const [selectedMarsEvent, setSelectedMarsEvent] = useState<MarsChronologicalEvent>(
    () => MARS_CHRONOLOGICAL_TIMELINE[1]
  );

  // Active surface resources on current planet (Earth kept clean; Moon shows 4 NASA sites; Mars shows 5 historical surface zones)
  const planetDiscoveries = ACTIVE_SURFACE_DISCOVERIES.filter(d => d.planetId === currentPlanet);
  const isMoon = currentPlanet === 'moon';
  const isMars = currentPlanet === 'mars';

  // Sector boundaries in meters (-72 to +72 on Moon, -68 to +68 on Mars so all 9 surface + sky sites fit cleanly)
  const mapExtent = isMoon ? 72 : isMars ? 68 : 120;

  const toMapPercent = (coordX: number, coordZ: number) => {
    const px = ((coordX + mapExtent) / (mapExtent * 2)) * 100;
    const pz = ((coordZ + mapExtent) / (mapExtent * 2)) * 100;
    return {
      left: `${Math.max(6, Math.min(94, px))}%`,
      top: `${Math.max(8, Math.min(92, pz))}%`
    };
  };

  const getDistanceToPlayer = (coordX: number, coordZ: number) => {
    const dx = coordX - playerCoordinates.x;
    const dz = coordZ - playerCoordinates.z;
    return Math.round(Math.hypot(dx, dz));
  };

  const shuttlePlanet: ShuttleSurfacePlanet =
    currentPlanet === 'moon' || currentPlanet === 'mars' ? currentPlanet : 'earth';
  const shuttlePadCoords = SHUTTLE_PADS[shuttlePlanet];

  const moonResourceList = (['surveyor', 'apollo_lm', 'alsep', 'lunar_rover'] as MoonResourceId[]).map(
    id => MOON_RESOURCE_SITES[id]
  );
  const marsResourceList = (
    [
      'pioneer',
      'viking_1',
      'sojourner',
      'spirit_opportunity',
      'dawn',
      'phoenix_insight',
      'kepler',
      'curiosity',
      'ingenuity'
    ] as MarsAndSpaceResourceId[]
  ).map(id => MARS_ALL_SITES[id]);

  return (
    <div
      data-testid="planetary-map-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/92 animate-fade-in select-none"
    >
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400">
                  {isMoon
                    ? 'INTERACTIVE LUNAR MUSEUM RADAR & TIMELINE'
                    : isMars
                    ? 'INTERACTIVE MARS HISTORICAL RADAR & TIMELINE'
                    : 'TOPOGRAPHICAL RADAR GRID'}
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  {isMoon ? '1967–1972 NASA SITES' : isMars ? '1972–2024 MARS & SKY' : 'CLEAN SECTOR'}
                </span>
              </div>
              <h2 className="text-xl font-bold font-display text-white tracking-wide">
                Planetary Navigation Map — {currentPlanet.toUpperCase()}
              </h2>
            </div>
          </div>

          <button
            aria-label="Close Planetary Map"
            onClick={() => {
              soundManager.playPing();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TELEMETRY READOUT */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-950/60 border-b border-slate-800 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">SECTOR</span>
            <span className="text-cyan-300 font-bold">
              {isMoon
                ? 'Educationally Scaled Lunar Basin'
                : isMars
                ? 'Educationally Scaled Mars Basin'
                : 'Kennedy Space Center'}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">ASTRONAUT COORDS</span>
            <span className="text-white font-bold">
              [{Math.round(playerCoordinates.x)}m, {Math.round(playerCoordinates.z)}m]
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">ELEVATION</span>
            <span className="text-emerald-400 font-bold">
              {playerCoordinates.y.toFixed(1)}m ASL
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">
              {isMoon || isMars ? 'HISTORICAL INSTALLATIONS' : 'BEACONS ONLINE'}
            </span>
            <span className="text-amber-400 font-bold">
              {isMoon
                ? '4 NASA RESOURCES (1967–1972)'
                : isMars
                ? '9 MARS & SKY ZONES (1972–2024)'
                : `${planetDiscoveries.length} TRANSMITTERS`}
            </span>
          </div>
        </div>

        {/* CLICKABLE CHRONOLOGICAL TIMELINE (MOON ONLY: 1967–1972) */}
        {isMoon && (
          <div className="px-3 py-2.5 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-amber-300 mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Chronological Timeline (1967–1972):</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {MOON_CHRONOLOGICAL_TIMELINE.map(ev => {
                const isSelected = selectedMoonEvent.id === ev.id;
                const isCurrentLrv = ev.lrvMissionId && ev.lrvMissionId === activeLrvMissionId;
                return (
                  <button
                    key={ev.id}
                    data-testid={`moon-timeline-${ev.id}`}
                    onClick={() => {
                      soundManager.playPing();
                      setSelectedMoonEvent(ev);
                    }}
                    className={`flex flex-col items-start px-2.5 py-1.5 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-slate-800 border-amber-400 shadow-lg ring-1 ring-amber-400/50'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-1 flex-wrap">
                      <span
                        className="text-xs font-black font-mono"
                        style={{ color: ev.accentColor }}
                      >
                        {ev.year}
                      </span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-950 text-slate-300 border border-slate-700">
                        {ev.statusBadge === 'LANDED ON MOON' ? 'LANDED' : 'DEPLOYED'}
                      </span>
                      {isCurrentLrv && (
                        <span className="text-[8px] font-mono px-1 rounded bg-sky-500/20 text-sky-300">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-white truncate w-full mt-0.5">
                      {ev.title.split(' — ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* CLICKABLE CHRONOLOGICAL TIMELINE (MARS & SKY EXHIBITS: 1972–2024) */}
        {isMars && (
          <div className="px-3 py-2.5 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center justify-between gap-2 text-[10px] font-mono uppercase text-orange-300 mb-2">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Mars &amp; Deep Space Chronological Timeline (1972–2024):</span>
              </div>
              <span className="text-[9px] text-sky-300 normal-case">
                Hovering Sky Exhibits (Dawn, Pioneer, Kepler) showcase off-Mars missions above illuminated pedestals
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {MARS_CHRONOLOGICAL_TIMELINE.map(ev => {
                const isSelected = selectedMarsEvent.id === ev.id;
                return (
                  <button
                    key={ev.id}
                    data-testid={`mars-timeline-${ev.id}`}
                    onClick={() => {
                      soundManager.playPing();
                      setSelectedMarsEvent(ev);
                    }}
                    className={`flex flex-col items-start px-2.5 py-1.5 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-slate-800 border-orange-400 shadow-lg ring-1 ring-orange-400/50'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-1 flex-wrap">
                      <span
                        className="text-xs font-black font-mono"
                        style={{ color: ev.accentColor }}
                      >
                        {ev.year}
                      </span>
                      <span className="text-[9px] font-mono px-1 rounded bg-slate-950 text-slate-300 border border-slate-700">
                        {ev.statusBadge}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-white truncate w-full mt-0.5">
                      {ev.title.split(' — ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* MAIN BODY: 2D RADAR DISPLAY + BEACON INSPECTION SIDEBAR */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* RADAR MAP CONTAINER */}
          <div className="flex-1 relative bg-slate-950 overflow-hidden flex items-center justify-center min-h-[300px]">
            <div className="relative w-full h-full min-h-[300px] m-3 rounded-xl border border-cyan-500/25 bg-slate-950/90 overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ea5e915_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e915_1px,transparent_1px)] bg-[size:32px_32px]" />

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[85%] h-[85%] rounded-full border border-cyan-500/20" />
                <div className="w-[60%] h-[60%] rounded-full border border-cyan-500/25" />
                <div className="w-[35%] h-[35%] rounded-full border border-cyan-500/30" />
                <div className="w-[12%] h-[12%] rounded-full border border-cyan-500/40" />
                <div className="absolute w-full h-[1px] bg-cyan-500/20" />
                <div className="absolute h-full w-[1px] bg-cyan-500/20" />
              </div>

              <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-cyan-400 font-bold">
                N
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-cyan-400 font-bold">
                S
              </div>
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-cyan-400 font-bold">
                W
              </div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-cyan-400 font-bold">
                E
              </div>

              {/* Space Shuttle Pad Marker */}
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
                style={toMapPercent(shuttlePadCoords.x, shuttlePadCoords.z)}
              >
                <div className="relative flex flex-col items-center">
                  <div className="w-5 h-5 rounded-full border border-amber-400 bg-amber-500/25 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  </div>
                  <span className="text-[9px] font-mono text-amber-300 font-bold uppercase whitespace-nowrap mt-1 drop-shadow bg-slate-950/80 px-1 rounded">
                    SHUTTLE PAD
                  </span>
                </div>
              </div>

              {/* Player Position Marker */}
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
                style={toMapPercent(playerCoordinates.x, playerCoordinates.z)}
              >
                <div className="relative flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full border-2 border-emerald-400 bg-emerald-500/30 flex items-center justify-center shadow-lg">
                    <Navigation className="w-3.5 h-3.5 text-emerald-300 -rotate-45" />
                  </div>
                  <span className="text-[9px] font-mono text-emerald-300 font-bold uppercase whitespace-nowrap mt-1 bg-slate-950/85 px-1 rounded border border-emerald-500/40">
                    YOU
                  </span>
                </div>
              </div>

              {/* Apollo 12 Intrepid Marker */}
              {isMoon && (
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
                  style={toMapPercent(APOLLO_12_INTREPID_SITE.x, APOLLO_12_INTREPID_SITE.z)}
                >
                  <div className="relative flex flex-col items-center">
                    <span className="absolute bottom-full mb-1 text-[8px] font-mono text-emerald-300 bg-slate-950/90 px-1.5 py-0.5 rounded border border-emerald-500/40 whitespace-nowrap">
                      Intrepid (1969)
                    </span>
                    <div className="w-3 h-3 rounded-full border border-emerald-400 bg-emerald-950" />
                  </div>
                </div>
              )}

              {/* 4 Moon Historical Resource Markers */}
              {isMoon &&
                moonResourceList.map(site => {
                  const pos = toMapPercent(site.x, site.z);
                  const isSelected = selectedMoonEvent.resourceId === site.id;
                  const distance = getDistanceToPlayer(site.x, site.z);
                  const lrvYear =
                    site.id === 'lunar_rover' && selectedMoonEvent.resourceId === 'lunar_rover'
                      ? selectedMoonEvent.year
                      : site.year;

                  return (
                    <button
                      key={site.id}
                      data-testid={`moon-map-marker-${site.id}`}
                      onClick={() => {
                        soundManager.playPing();
                        const match = MOON_CHRONOLOGICAL_TIMELINE.find(
                          ev => ev.resourceId === site.id
                        );
                        if (match) setSelectedMoonEvent(match);
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-transform ${
                        isSelected ? 'scale-115 z-30' : 'hover:scale-110 z-20'
                      }`}
                      style={pos}
                    >
                      <div className="relative flex flex-col items-center">
                        <div
                          className="w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-lg"
                          style={{
                            borderColor: site.accentColor,
                            backgroundColor: isSelected ? site.accentColor : '#020617',
                            color: isSelected ? '#020617' : site.accentColor
                          }}
                        >
                          <Compass className="w-3.5 h-3.5" />
                        </div>
                        <span
                          className="text-[9px] font-mono font-bold whitespace-nowrap px-1.5 py-0.5 rounded mt-0.5 border bg-slate-950/90 text-white"
                          style={{ borderColor: site.accentColor }}
                        >
                          {lrvYear} • {site.id === 'apollo_lm' ? 'Eagle' : site.id === 'lunar_rover' ? 'LRV' : site.id === 'alsep' ? 'ALSEP' : 'Surveyor 3'} ({distance}m)
                        </span>
                      </div>
                    </button>
                  );
                })}

              {/* 9 Mars Surface + Sky Exhibit Resource Markers */}
              {isMars &&
                marsResourceList.map(site => {
                  const pos = toMapPercent(site.x, site.z);
                  const isSelected = selectedMarsEvent.resourceId === site.id;
                  const distance = getDistanceToPlayer(site.x, site.z);
                  const shortPin =
                    site.id === 'viking_1'
                      ? 'Viking 1'
                      : site.id === 'sojourner'
                      ? 'Pathfinder'
                      : site.id === 'spirit_opportunity'
                      ? 'Spirit/Opp.'
                      : site.id === 'phoenix_insight'
                      ? 'Phoenix/InSight'
                      : site.id === 'curiosity'
                      ? 'Curiosity'
                      : site.id === 'ingenuity'
                      ? 'Ingenuity'
                      : site.id === 'dawn'
                      ? 'Dawn (Sky)'
                      : site.id === 'pioneer'
                      ? 'Pioneer (Sky)'
                      : 'Kepler (Sky)';

                  return (
                    <button
                      key={site.id}
                      data-testid={`mars-map-marker-${site.id}`}
                      onClick={() => {
                        soundManager.playPing();
                        const match = MARS_CHRONOLOGICAL_TIMELINE.find(
                          ev => ev.resourceId === site.id
                        );
                        if (match) setSelectedMarsEvent(match);
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-transform ${
                        isSelected ? 'scale-115 z-30' : 'hover:scale-110 z-20'
                      }`}
                      style={pos}
                    >
                      <div className="relative flex flex-col items-center">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-lg ${
                            site.isSkyExhibit ? 'ring-2 ring-sky-400/50' : ''
                          }`}
                          style={{
                            borderColor: site.accentColor,
                            backgroundColor: isSelected ? site.accentColor : '#020617',
                            color: isSelected ? '#020617' : site.accentColor
                          }}
                        >
                          <Compass className="w-3.5 h-3.5" />
                        </div>
                        <span
                          className="text-[9px] font-mono font-bold whitespace-nowrap px-1.5 py-0.5 rounded mt-0.5 border bg-slate-950/90 text-white"
                          style={{ borderColor: site.accentColor }}
                        >
                          {site.year} • {shortPin} ({distance}m)
                        </span>
                      </div>
                    </button>
                  );
                })}

              {/* Legacy Discovery Beacons (Earth only when active) */}
              {!isMoon &&
                !isMars &&
                planetDiscoveries.map(disc => {
                  const pos = toMapPercent(disc.coordinates[0], disc.coordinates[2]);
                  const isSelected = selectedSite?.id === disc.id;
                  const distance = getDistanceToPlayer(disc.coordinates[0], disc.coordinates[2]);

                  return (
                    <button
                      key={disc.id}
                      onClick={() => {
                        soundManager.playPing();
                        setSelectedSite(disc);
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-transform ${
                        isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-10'
                      }`}
                      style={pos}
                    >
                      <div className="relative flex flex-col items-center">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-cyan-300 bg-cyan-400 text-slate-950'
                              : 'border-cyan-500/70 bg-slate-950 text-cyan-300 group-hover:border-cyan-300'
                          }`}
                        >
                          <Radio className="w-2.5 h-2.5 animate-pulse" />
                        </div>
                        <span
                          className={`text-[8px] font-mono whitespace-nowrap px-1 py-0.2 rounded mt-0.5 border ${
                            isSelected
                              ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-bold'
                              : 'bg-slate-950/80 text-slate-300 border-slate-800'
                          }`}
                        >
                          {distance}m
                        </span>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* SIDEBAR: SELECTED MOON SITE OR PLANETARY BEACON */}
          <div className="w-full md:w-88 border-t md:border-t-0 md:border-l border-slate-800 bg-slate-950/90 p-4 flex flex-col justify-between overflow-y-auto">
            {isMoon ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase text-slate-950"
                    style={{ backgroundColor: selectedMoonEvent.accentColor }}
                  >
                    {selectedMoonEvent.statusBadge} • {selectedMoonEvent.year}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    {getDistanceToPlayer(
                      selectedMoonEvent.coordinates[0],
                      selectedMoonEvent.coordinates[1]
                    )}{' '}
                    UNITS AWAY
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    {selectedMoonEvent.title}
                  </h3>
                  <div className="text-[11px] font-mono text-cyan-300 mt-0.5">
                    {selectedMoonEvent.dateLabel} • {selectedMoonEvent.regionLabel}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mt-2">
                    {selectedMoonEvent.summary}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono space-y-1">
                  <div className="text-slate-400">SCALED MUSEUM SECTOR COORDS:</div>
                  <div className="text-slate-200 font-bold">
                    X: {selectedMoonEvent.coordinates[0]}m, Z: {selectedMoonEvent.coordinates[1]}m
                  </div>
                  <div className="text-[10px] text-amber-300/90 pt-1">
                    Note: Lunar distances are educationally scaled so astronauts can explore all 4 NASA regions in one continuous 3D lunar world.
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  {onNavigateMoonSite && (
                    <button
                      data-testid="moon-map-navigate-btn"
                      onClick={() => {
                        soundManager.playPing();
                        onNavigateMoonSite(selectedMoonEvent);
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-bold font-mono text-xs shadow-lg transition flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Travel Nearby to This 3D Site</span>
                    </button>
                  )}

                  {onOpenMoonResourceFromMap && (
                    <button
                      data-testid="moon-map-open-lab-btn"
                      onClick={() => {
                        soundManager.playDiscoveryInspect();
                        onOpenMoonResourceFromMap(
                          selectedMoonEvent.resourceId,
                          selectedMoonEvent.lrvMissionId
                        );
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-xs shadow-lg transition flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Open Interactive 3D Lab</span>
                    </button>
                  )}
                </div>
              </div>
            ) : isMars ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase text-slate-950"
                    style={{ backgroundColor: selectedMarsEvent.accentColor }}
                  >
                    {selectedMarsEvent.statusBadge} • {selectedMarsEvent.year}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    {getDistanceToPlayer(
                      selectedMarsEvent.coordinates[0],
                      selectedMarsEvent.coordinates[1]
                    )}{' '}
                    UNITS AWAY
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    {selectedMarsEvent.title}
                  </h3>
                  <div className="text-[11px] font-mono text-orange-300 mt-0.5">
                    {selectedMarsEvent.dateLabel} • {selectedMarsEvent.regionLabel}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mt-2">
                    {selectedMarsEvent.summary}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono space-y-1">
                  <div className="text-slate-400">SCALED MARS SECTOR COORDS:</div>
                  <div className="text-slate-200 font-bold">
                    X: {selectedMarsEvent.coordinates[0]}m, Z: {selectedMarsEvent.coordinates[1]}m
                  </div>
                  <div className="text-[10px] text-amber-300/90 pt-1">
                    Note: Scaled Martian landing sites let astronauts walk across all 6 Mars missions plus 3 illuminated overhead Sky Exhibits (Dawn, Pioneer 10/11 &amp; Kepler).
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  {onNavigateMarsSite && (
                    <button
                      data-testid="mars-map-navigate-btn"
                      onClick={() => {
                        soundManager.playPing();
                        onNavigateMarsSite(selectedMarsEvent);
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold font-mono text-xs shadow-lg transition flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Travel Nearby to This 3D Site</span>
                    </button>
                  )}

                  {onOpenMarsResourceFromMap && (
                    <button
                      data-testid="mars-map-open-lab-btn"
                      onClick={() => {
                        soundManager.playDiscoveryInspect();
                        onOpenMarsResourceFromMap(
                          selectedMarsEvent.resourceId,
                          selectedMarsEvent.subFocus
                        );
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-xs shadow-lg transition flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Open Interactive 3D Lab</span>
                    </button>
                  )}
                </div>
              </div>
            ) : selectedSite ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                    {selectedSite.category}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    {getDistanceToPlayer(selectedSite.coordinates[0], selectedSite.coordinates[2])} METERS AWAY
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    {selectedSite.name}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1">
                    {selectedSite.headline}
                  </p>
                </div>

                <button
                  onClick={() => {
                    soundManager.playDiscoveryInspect();
                    onSelectDiscovery(selectedSite);
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-mono text-xs shadow-lg transition flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Inspect Scientific Data</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-10 space-y-2 text-slate-400 font-mono text-xs">
                <Crosshair className="w-8 h-8 mx-auto text-slate-600" />
                <p>
                  Clean planetary sector — Space Shuttle Pad and Explorer telemetry are active. Explore {currentPlanet.toUpperCase()} terrain freely.
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-500">
              {isMoon
                ? 'Click any timeline milestone (1967–1972) or radar site to travel & inspect.'
                : isMars
                ? 'Click any timeline milestone (1976–2024) or Mars radar zone to travel & inspect.'
                : 'Navigation telemetry updated continuously from astronaut position.'}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-2.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>
            {isMoon
              ? 'Moon Exploration Radar • 4 Historical Regions'
              : isMars
              ? 'Mars Exploration Radar • 6 Surface Zones + 3 Sky Exhibits'
              : 'Scale: 1:1 Ground Truth Radar Grid'}
          </span>
          <span className="text-cyan-400">Press [M] anytime to toggle</span>
        </div>
      </div>
    </div>
  );
};
