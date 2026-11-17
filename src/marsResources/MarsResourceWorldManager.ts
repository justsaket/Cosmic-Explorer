import * as THREE from 'three';
import { CylinderObstacle } from '../physics/planetaryPhysics';
import {
  computePathfinderEdlState,
  computePhoenixFrostSublimation,
  MARS_ALL_SITES,
  MARS_AND_SPACE_RESOURCES
} from './marsResourceData';
import { MarsAndSpaceResourceId } from './marsResourceTypes';
import {
  createCuriosityRover3D,
  createDawnAndWorlds3D,
  createIngenuityAndPerseverance3D,
  createKeplerObservatory3D,
  createMarsMuseumMarker3D,
  createMerRover3D,
  createPathfinderAndSojourner3D,
  createPhoenixAndInsight3D,
  createPioneer3D,
  createSkyExhibitPedestal3D,
  createViking1Pair3D,
  Curiosity3DHandle,
  DawnMission3DHandle,
  Ingenuity3DHandle,
  KeplerObservatory3DHandle,
  MarsMuseumMarker3DHandle,
  MerRover3DHandle,
  PathfinderSojourner3DHandle,
  PhoenixInsight3DHandle,
  Pioneer3DHandle,
  Viking1Pair3DHandle
} from './MarsModels3D';

export interface MarsWorldSyncState {
  activeHotspotId: string | null;
  sequencePlaying: boolean;
  sequenceProgress: number; // 0..1
  selectedRockId: 'barnacle_bill' | 'yogi' | 'scooby_doo';
  selectedMerRover: 'spirit' | 'opportunity';
  phoenixOrInsightChapter: 'phoenix' | 'insight';
  phoenixFrostSol: number;
  ingenuityTestFlying: boolean;
  curiosityLaserActive?: boolean;
  curiosityArmExtended?: boolean;
}

export interface MarsWorldRuntimeTelemetry {
  nearbyResourceId: MarsAndSpaceResourceId | null;
  nearbyResourceTitle: string | null;
  nearbyResourceBadge: string | null;
  sequenceProgress: number;
  sequenceLabel: string;
}

const ALL_MARS_WORLD_SITE_IDS: MarsAndSpaceResourceId[] = [
  'viking_1',
  'sojourner',
  'spirit_opportunity',
  'phoenix_insight',
  'ingenuity',
  'curiosity',
  'dawn',
  'pioneer',
  'kepler'
];

/**
 * Populates all 9 Mars & Deep-Space Museum installations on MarsWorld:
 * - 6 surface-grounded Mars missions (Viking 1 + sky orbiter, Pathfinder/Sojourner,
 *   Spirit/Opportunity, Phoenix/InSight, Perseverance/hovering Ingenuity, Curiosity)
 * - 3 Sky-Suspended Holographic Projection Exhibits (Dawn, Pioneer 10/11, Kepler)
 *   visibly hovering at 12.5-13.5m above illuminated ground pedestals.
 */
export class MarsResourceWorldManager {
  public rootGroup = new THREE.Group();
  private activeResource: MarsAndSpaceResourceId | null = null;
  private isBuilt = false;
  private getElevation: (x: number, z: number) => number;
  private staticColliders: CylinderObstacle[] = [];
  private syncState: MarsWorldSyncState;

  private pathfinderHandle: PathfinderSojourner3DHandle | null = null;
  private spiritHandle: MerRover3DHandle | null = null;
  private opportunityHandle: MerRover3DHandle | null = null;
  private vikingHandle: Viking1Pair3DHandle | null = null;
  private skyVikingOrbiter: THREE.Group | null = null;
  private phoenixInsightHandle: PhoenixInsight3DHandle | null = null;
  private ingenuityHandle: Ingenuity3DHandle | null = null;
  private curiosityHandle: Curiosity3DHandle | null = null;
  private dawnSkyHandle: DawnMission3DHandle | null = null;
  private pioneerSkyHandle: Pioneer3DHandle | null = null;
  private keplerSkyHandle: KeplerObservatory3DHandle | null = null;

  private siteMarkers: Partial<Record<MarsAndSpaceResourceId, MarsMuseumMarker3DHandle>> = {};

  constructor(getElevationFn: (x: number, z: number) => number) {
    this.getElevation = getElevationFn;
    this.syncState = {
      activeHotspotId: null,
      sequencePlaying: false,
      sequenceProgress: 1,
      selectedRockId: 'barnacle_bill',
      selectedMerRover: 'opportunity',
      phoenixOrInsightChapter: 'phoenix',
      phoenixFrostSol: 1,
      ingenuityTestFlying: true,
      curiosityLaserActive: true,
      curiosityArmExtended: false
    };
  }

  public mount(scene: THREE.Scene) {
    if (this.rootGroup.parent !== scene) {
      scene.add(this.rootGroup);
    }
    if (!this.isBuilt) {
      this.buildMarsSurfaceSites();
    }
  }

  public unmount() {
    this.rootGroup.parent?.remove(this.rootGroup);
  }

  public clearCurrentSet() {
    while (this.rootGroup.children.length > 0) {
      this.rootGroup.remove(this.rootGroup.children[0]);
    }
    this.pathfinderHandle = null;
    this.spiritHandle = null;
    this.opportunityHandle = null;
    this.vikingHandle = null;
    this.skyVikingOrbiter = null;
    this.phoenixInsightHandle = null;
    this.ingenuityHandle = null;
    this.curiosityHandle = null;
    this.dawnSkyHandle = null;
    this.pioneerSkyHandle = null;
    this.keplerSkyHandle = null;
    this.siteMarkers = {};
    this.staticColliders = [];
    this.isBuilt = false;
  }

  public syncMarsMuseum(activeId: MarsAndSpaceResourceId | null, nextSync?: MarsWorldSyncState) {
    this.activeResource = activeId;
    if (nextSync) {
      this.syncState = { ...nextSync };
    }
    if (!this.isBuilt) {
      this.buildMarsSurfaceSites();
    }
  }

  private createSiteMarker(id: MarsAndSpaceResourceId, x: number, y: number, z: number) {
    const spec = MARS_ALL_SITES[id];
    const marker = createMarsMuseumMarker3D({
      year: spec.year,
      statusBadge: spec.statusBadge,
      title: spec.shortTitle,
      subtitle: spec.regionLabel,
      accentColor: spec.accentColor,
      markerHeight: spec.markerHeight
    });
    marker.group.position.set(x, y, z);
    this.rootGroup.add(marker.group);
    this.siteMarkers[id] = marker;
  }

  private buildMarsSurfaceSites() {
    this.clearCurrentSet();

    // 1. VIKING 1 (1976) — Chryse Planitia Stationary Lander + Clearly Visible Sky Orbiter
    const vikSite = MARS_ALL_SITES.viking_1;
    const vikY = this.getElevation(vikSite.x, vikSite.z);
    const vik = createViking1Pair3D();
    vik.landerGroup.position.set(vikSite.x, vikY, vikSite.z);
    vik.orbiterGroup.visible = false;
    this.rootGroup.add(vik.landerGroup);
    this.vikingHandle = vik;
    this.staticColliders.push({ x: vikSite.x, z: vikSite.z, radius: 1.9, height: 2.2, baseY: vikY });

    const skyOrb = vik.orbiterGroup.clone();
    skyOrb.visible = true;
    skyOrb.scale.setScalar(1.45);
    skyOrb.position.set(vikSite.x + 7.2, vikY + 7.0, vikSite.z);
    this.rootGroup.add(skyOrb);
    this.skyVikingOrbiter = skyOrb;

    const vikOrbitRing = new THREE.Mesh(
      new THREE.RingGeometry(7.05, 7.3, 48),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, transparent: true, opacity: 0.28 })
    );
    vikOrbitRing.rotation.x = Math.PI / 2;
    vikOrbitRing.position.set(vikSite.x, vikY + 7.0, vikSite.z);
    this.rootGroup.add(vikOrbitRing);
    this.createSiteMarker('viking_1', vikSite.x, vikY, vikSite.z);

    // 2. PATHFINDER & SOJOURNER (1997) — Ares Vallis
    const sojSite = MARS_ALL_SITES.sojourner;
    const sojY = this.getElevation(sojSite.x, sojSite.z);
    const soj = createPathfinderAndSojourner3D();
    soj.group.position.set(sojSite.x, sojY, sojSite.z);
    soj.setSequencePose({
      altitudeMeters: 0,
      airbagsVisible: false,
      petalsOpen01: 1,
      rampExtended01: 1,
      sojournerOffsetZ: 2.8
    });
    this.rootGroup.add(soj.group);
    this.pathfinderHandle = soj;
    this.staticColliders.push({ x: sojSite.x, z: sojSite.z, radius: 1.7, height: 1.8, baseY: sojY });
    this.createSiteMarker('sojourner', sojSite.x, sojY, sojSite.z);

    // 3. SPIRIT & OPPORTUNITY (2004) — Twin MER Rovers
    const merSite = MARS_ALL_SITES.spirit_opportunity;
    const merY = this.getElevation(merSite.x, merSite.z);
    const spirit = createMerRover3D('spirit');
    spirit.group.position.set(merSite.x - 2.6, merY, merSite.z - 0.8);
    spirit.group.rotation.y = 0.45;
    const opportunity = createMerRover3D('opportunity');
    opportunity.group.position.set(merSite.x + 2.6, merY, merSite.z + 0.8);
    opportunity.group.rotation.y = -0.35;
    this.rootGroup.add(spirit.group, opportunity.group);
    this.spiritHandle = spirit;
    this.opportunityHandle = opportunity;
    this.staticColliders.push(
      { x: merSite.x - 2.6, z: merSite.z - 0.8, radius: 1.3, height: 1.8, baseY: merY },
      { x: merSite.x + 2.6, z: merSite.z + 0.8, radius: 1.3, height: 1.8, baseY: merY }
    );
    this.createSiteMarker('spirit_opportunity', merSite.x, merY, merSite.z);

    // 4. PHOENIX (2008) & INSIGHT (2018) — Two Stationary Three-Legged Landers
    const piSite = MARS_ALL_SITES.phoenix_insight;
    const piY = this.getElevation(piSite.x, piSite.z);
    const pi = createPhoenixAndInsight3D();
    pi.setMode('both');
    pi.group.position.set(piSite.x, piY, piSite.z);
    this.rootGroup.add(pi.group);
    this.phoenixInsightHandle = pi;
    this.staticColliders.push(
      { x: piSite.x - 3.8, z: piSite.z, radius: 1.8, height: 1.6, baseY: piY },
      { x: piSite.x + 3.8, z: piSite.z, radius: 1.8, height: 1.6, baseY: piY }
    );
    this.createSiteMarker('phoenix_insight', piSite.x, piY, piSite.z);

    // 5. INGENUITY HELICOPTER & PERSEVERANCE (2021–2024) — Hovering above Wright Brothers Field
    const ingSite = MARS_ALL_SITES.ingenuity;
    const ingY = this.getElevation(ingSite.x, ingSite.z);
    const ing = createIngenuityAndPerseverance3D();
    ing.group.position.set(ingSite.x, ingY, ingSite.z);
    ing.setFlightPose({ altitudeMeters: 2.8, rotorSpinRad: 0, flight72Damaged: false });
    this.rootGroup.add(ing.group);
    this.ingenuityHandle = ing;
    this.staticColliders.push({ x: ingSite.x - 3.2, z: ingSite.z - 1.6, radius: 1.5, height: 2.0, baseY: ingY });
    this.createSiteMarker('ingenuity', ingSite.x, ingY, ingSite.z);

    // 6. CURIOSITY MSL ROVER (2012–Present) — Gale Crater / Mount Sharp
    const curSite = MARS_ALL_SITES.curiosity;
    const curY = this.getElevation(curSite.x, curSite.z);
    const cur = createCuriosityRover3D();
    cur.group.position.set(curSite.x, curY, curSite.z);
    cur.group.rotation.y = Math.PI; // Facing south toward central exploration corridor
    cur.group.scale.setScalar(1.18);
    cur.setLaserActive(true, 0);
    this.rootGroup.add(cur.group);
    this.curiosityHandle = cur;
    this.staticColliders.push({ x: curSite.x, z: curSite.z, radius: 1.8, height: 2.3, baseY: curY });
    this.createSiteMarker('curiosity', curSite.x, curY, curSite.z);

    // 7. DAWN ASTEROID ORBITER — Holographic Sky Exhibit (y + 4.5m)
    const dawnSite = MARS_ALL_SITES.dawn;
    const dawnY = this.getElevation(dawnSite.x, dawnSite.z);
    const dawnAlt = dawnSite.hoverAltitudeMeters ?? 4.5;
    const dawnPed = createSkyExhibitPedestal3D(0x38bdf8, dawnAlt);
    dawnPed.position.set(dawnSite.x, dawnY, dawnSite.z);
    const dawnModel = createDawnAndWorlds3D();
    dawnModel.setTargetWorld('ceres', true, true);
    dawnModel.group.position.set(dawnSite.x, dawnY + dawnAlt, dawnSite.z);
    dawnModel.group.scale.setScalar(1.3);
    this.rootGroup.add(dawnPed, dawnModel.group);
    this.dawnSkyHandle = dawnModel;
    this.staticColliders.push({ x: dawnSite.x, z: dawnSite.z, radius: 1.85, height: 1.0, baseY: dawnY });
    this.createSiteMarker('dawn', dawnSite.x, dawnY, dawnSite.z);

    // 8. PIONEER 10 & 11 — Holographic Sky Exhibit (y + 4.8m)
    const pioSite = MARS_ALL_SITES.pioneer;
    const pioY = this.getElevation(pioSite.x, pioSite.z);
    const pioAlt = pioSite.hoverAltitudeMeters ?? 4.8;
    const pioPed = createSkyExhibitPedestal3D(0xf59e0b, pioAlt);
    pioPed.position.set(pioSite.x, pioY, pioSite.z);
    const pioModel = createPioneer3D();
    pioModel.setMode('spacecraft');
    pioModel.group.position.set(pioSite.x, pioY + pioAlt, pioSite.z);
    pioModel.group.scale.setScalar(1.3);
    this.rootGroup.add(pioPed, pioModel.group);
    this.pioneerSkyHandle = pioModel;
    this.staticColliders.push({ x: pioSite.x, z: pioSite.z, radius: 1.85, height: 1.0, baseY: pioY });
    this.createSiteMarker('pioneer', pioSite.x, pioY, pioSite.z);

    // 9. KEPLER SPACE TELESCOPE — Holographic Sky Exhibit (y + 3.4m base + 2.0m inner mount)
    const kepSite = MARS_ALL_SITES.kepler;
    const kepY = this.getElevation(kepSite.x, kepSite.z);
    const kepAlt = kepSite.hoverAltitudeMeters ?? 3.4;
    const kepPed = createSkyExhibitPedestal3D(0xa855f7, kepAlt + 1.5);
    kepPed.position.set(kepSite.x, kepY, kepSite.z);
    const kepModel = createKeplerObservatory3D();
    kepModel.setMode('observatory');
    kepModel.group.position.set(kepSite.x, kepY + kepAlt, kepSite.z);
    kepModel.group.scale.setScalar(1.3);
    this.rootGroup.add(kepPed, kepModel.group);
    this.keplerSkyHandle = kepModel;
    this.staticColliders.push({ x: kepSite.x, z: kepSite.z, radius: 1.85, height: 1.0, baseY: kepY });
    this.createSiteMarker('kepler', kepSite.x, kepY, kepSite.z);

    this.isBuilt = true;
  }

  public getObstacles(): CylinderObstacle[] {
    return this.staticColliders;
  }

  public getInteractionContext(playerPos: THREE.Vector3): {
    nearbyResourceId: MarsAndSpaceResourceId | null;
    nearbyResourceTitle: string | null;
    nearbyResourceBadge: string | null;
  } {
    let closestId: MarsAndSpaceResourceId | null = null;
    let closestTitle: string | null = null;
    let closestBadge: string | null = null;
    let bestDist = Infinity;

    for (const id of ALL_MARS_WORLD_SITE_IDS) {
      const site = MARS_ALL_SITES[id];
      const d = Math.hypot(playerPos.x - site.x, playerPos.z - site.z);
      if (d <= site.interactionRadius && d < bestDist) {
        bestDist = d;
        closestId = id;
        closestTitle = MARS_AND_SPACE_RESOURCES[id].shortTitle;
        closestBadge = `${site.year} • ${site.statusBadge}`;
      }
    }

    return {
      nearbyResourceId: closestId,
      nearbyResourceTitle: closestTitle,
      nearbyResourceBadge: closestBadge
    };
  }

  public update(elapsedSec: number, playerPos: THREE.Vector3): MarsWorldRuntimeTelemetry {
    const ctx = this.getInteractionContext(playerPos);
    const telemetry: MarsWorldRuntimeTelemetry = {
      nearbyResourceId: ctx.nearbyResourceId,
      nearbyResourceTitle: ctx.nearbyResourceTitle,
      nearbyResourceBadge: ctx.nearbyResourceBadge,
      sequenceProgress: this.syncState.sequenceProgress,
      sequenceLabel: 'Ready'
    };

    if (!this.isBuilt) return telemetry;

    for (const id of ALL_MARS_WORLD_SITE_IDS) {
      const marker = this.siteMarkers[id];
      const site = MARS_ALL_SITES[id];
      if (!marker) continue;
      const dist = Math.hypot(playerPos.x - site.x, playerPos.z - site.z);
      marker.update(elapsedSec, ctx.nearbyResourceId === id || this.activeResource === id, dist);
    }

    // Overhead Viking 1 Orbiter gliding visibly in Mars sky (y + 7.0m)
    if (this.skyVikingOrbiter) {
      const vikSite = MARS_ALL_SITES.viking_1;
      const a = elapsedSec * 0.28;
      this.skyVikingOrbiter.position.set(
        vikSite.x + Math.cos(a) * 7.2,
        this.getElevation(vikSite.x, vikSite.z) + 7.0,
        vikSite.z + Math.sin(a) * 7.2
      );
      this.skyVikingOrbiter.rotation.y = -a;
    }

    if (this.pathfinderHandle) {
      if (this.activeResource === 'sojourner' && this.syncState.sequencePlaying) {
        const edl = computePathfinderEdlState(this.syncState.sequenceProgress);
        this.pathfinderHandle.setSequencePose({
          altitudeMeters: Math.min(18, edl.altitudeMeters * 0.002),
          airbagsVisible: edl.airbagsInflated,
          petalsOpen01: edl.petalsOpen01,
          rampExtended01: edl.rampExtended01,
          sojournerOffsetZ: edl.sojournerRollOffset
        });
        telemetry.sequenceLabel = edl.phaseName;
      } else {
        this.pathfinderHandle.setSequencePose({
          altitudeMeters: 0,
          airbagsVisible: false,
          petalsOpen01: 1,
          rampExtended01: 1,
          sojournerOffsetZ: 2.6
        });
      }
      this.pathfinderHandle.setHighlight(
        this.activeResource === 'sojourner' ? this.syncState.activeHotspotId : null
      );
    }

    if (this.spiritHandle && this.opportunityHandle) {
      const activeMer = this.activeResource === 'spirit_opportunity';
      this.spiritHandle.setHighlight(activeMer ? this.syncState.activeHotspotId : null);
      this.opportunityHandle.setHighlight(activeMer ? this.syncState.activeHotspotId : null);
    }

    if (this.vikingHandle) {
      const scoop = 0.5 + 0.5 * Math.sin(elapsedSec * 1.4);
      this.vikingHandle.setSequenceState({
        orbiterSeparation01: 1,
        armScoop01: this.activeResource === 'viking_1' ? scoop : 0.25
      });
      this.vikingHandle.setHighlight(
        this.activeResource === 'viking_1' ? this.syncState.activeHotspotId : null
      );
    }

    if (this.phoenixInsightHandle) {
      const frost = computePhoenixFrostSublimation(this.syncState.phoenixFrostSol);
      this.phoenixInsightHandle.setPhoenixFrostPercent(frost.visibleBrightIcePercent);
      this.phoenixInsightHandle.setHighlight(
        this.activeResource === 'phoenix_insight' ? this.syncState.activeHotspotId : null
      );
    }

    // Ingenuity hovers continuously above Wright Brothers Field unless grounded inside Flight 72 overlay
    if (this.ingenuityHandle) {
      const isFocusedGround =
        this.activeResource === 'ingenuity' && !this.syncState.ingenuityTestFlying;
      const flying = !isFocusedGround;
      this.ingenuityHandle.setFlightPose({
        altitudeMeters: flying ? 2.8 + Math.sin(elapsedSec * 2.5) * 0.35 : 0,
        rotorSpinRad: flying ? elapsedSec * 28 : 0,
        flight72Damaged: isFocusedGround
      });
      this.ingenuityHandle.setHighlight(
        this.activeResource === 'ingenuity' ? this.syncState.activeHotspotId : null
      );
    }

    // Curiosity MSL Rover — pulsed ChemCam LIBS laser & extended sample arm
    if (this.curiosityHandle) {
      const laserOn =
        this.activeResource === 'curiosity'
          ? this.syncState.curiosityLaserActive ?? true
          : Math.sin(elapsedSec * 0.9) > -0.2;
      this.curiosityHandle.setLaserActive(laserOn, elapsedSec);
      this.curiosityHandle.setArmExtended(
        this.activeResource === 'curiosity' && this.syncState.curiosityArmExtended ? 1 : 0.25
      );
      this.curiosityHandle.setHighlight(
        this.activeResource === 'curiosity' ? this.syncState.activeHotspotId : null
      );
    }

    // Sky-Suspended Exhibits gently animate overhead so players clearly spot them in Mars sky
    if (this.dawnSkyHandle) {
      this.dawnSkyHandle.animate(elapsedSec);
      this.dawnSkyHandle.setHighlight(
        this.activeResource === 'dawn' ? this.syncState.activeHotspotId : null
      );
    }
    if (this.pioneerSkyHandle) {
      this.pioneerSkyHandle.spacecraftGroup.rotation.z = elapsedSec * 0.65;
      this.pioneerSkyHandle.group.rotation.y = Math.sin(elapsedSec * 0.25) * 0.35;
      this.pioneerSkyHandle.setHighlight(
        this.activeResource === 'pioneer' ? this.syncState.activeHotspotId : null
      );
    }
    if (this.keplerSkyHandle) {
      this.keplerSkyHandle.telescopeGroup.rotation.y = elapsedSec * 0.28;
      this.keplerSkyHandle.telescopeGroup.position.y = 2.0 + Math.sin(elapsedSec * 1.1) * 0.28;
      this.keplerSkyHandle.setHighlight(
        this.activeResource === 'kepler' ? this.syncState.activeHotspotId : null
      );
    }

    return telemetry;
  }
}
