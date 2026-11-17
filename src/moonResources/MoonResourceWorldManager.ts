import * as THREE from 'three';
import { CylinderObstacle, MoveInput } from '../physics/planetaryPhysics';
import {
  Alsep3DHandle,
  ApolloLM3DHandle,
  createAlsepStation3D,
  createApolloColumbiaCSM3D,
  createApolloLunarModule3D,
  createLaserRetroreflector3D,
  createLunarRovingVehicle3D,
  createMoonMuseumMarker3D,
  createSurveyor3Lander3D,
  Lrv3DHandle,
  MoonMuseumMarker3DHandle,
  Retroreflector3DHandle,
  Surveyor3DHandle
} from './MoonModels3D';
import {
  APOLLO_12_ALSEP_INSTRUMENTS,
  APOLLO_12_INTREPID_SITE,
  computeAscentSeparationState,
  computeLaserPulseRoundTrip,
  computeLrvPhysicsStep,
  computeSurveyorBounceHeight,
  computeWalkbackStatus,
  LRV_MISSIONS,
  MOON_RESOURCE_SITES,
  MOON_RESOURCES
} from './moonResourceData';
import { LrvPhysicsState, MoonResourceId } from './moonResourceTypes';

export interface MoonWorldSyncState {
  activeHotspotId: string | null;
  sequenceMode:
    | 'idle'
    | 'eagle_descent'
    | 'eagle_ascent'
    | 'lrv_deploy'
    | 'alsep_deploy'
    | 'surveyor_bounce';
  sequencePlaying: boolean;
  sequenceProgress: number; // 0..1
  laserPulseProgress: number | null; // 0..1 when firing
  lrvMissionId: 'apollo_15' | 'apollo_16' | 'apollo_17';
  lrvEvaIndex: number;
  isDrivingLrv: boolean;
  collectedWaypoints: string[];
  alsepSelectedId: string;
  alsepTransmitting: boolean;
  surveyorSamplerTest: 'idle' | 'trench' | 'bearing' | 'impact';
  surveyorTrenchCount: number;
  surveyorBearingCount: number;
  surveyorImpactCount: number;
  surveyorCameraPov: boolean;
  surveyorCameraPan: number;
  surveyor1969Visit: boolean;
  surveyorRecoveredParts: boolean;
}

export interface MoonWorldRuntimeTelemetry {
  nearbyResourceId: MoonResourceId | null;
  nearbyResourceTitle: string | null;
  nearbyResourceBadge: string | null;
  nearLrvVehicle: boolean;
  lrvDriving: boolean;
  nearbyHotspotId: string | null;
  nearbyHotspotLabel: string | null;
  sequenceProgress: number;
  sequenceLabel: string;
  ascentAltitudeMeters: number;
  descentAltitudeMeters: number;
  laserElapsedSeconds: number | null;
  lrvSpeedKmh: number;
  lrvDistanceMeters: number;
  lrvBatteryPercent: number;
  walkbackDistanceMeters: number;
  walkbackExceeded: boolean;
  walkbackWarning: string | null;
  nearbyWaypointId: string | null;
  nearbyWaypointLabel: string | null;
}

export class MoonResourceWorldManager {
  public rootGroup = new THREE.Group();
  private activeResource: MoonResourceId | null = null;
  private isMuseumBuilt = false;
  private getElevation: (x: number, z: number) => number;
  private staticColliders: CylinderObstacle[] = [];
  private syncState: MoonWorldSyncState;

  // Dynamic 3D Handles across all 4 Moon Sectors
  private apollo11LmHandle: ApolloLM3DHandle | null = null;
  private columbiaGroup: THREE.Group | null = null;
  private retroHandle: Retroreflector3DHandle | null = null;
  private eagleDustRingMesh: THREE.Mesh | null = null;

  // Sector 2: LRV Regional Group (rebuilt when Apollo 15 / 16 / 17 or EVA changes)
  private lrvSectorGroup = new THREE.Group();
  private lrvLmHandle: ApolloLM3DHandle | null = null;
  private lrvHandle: Lrv3DHandle | null = null;
  private walkbackRing: THREE.Mesh | null = null;
  private waypointMeshes: { id: string; label: string; group: THREE.Group; ring: THREE.Mesh }[] = [];
  private lrvDustRingMesh: THREE.Mesh | null = null;

  // Sector 3: Apollo 12 Intrepid & ALSEP
  private intrepidLmHandle: ApolloLM3DHandle | null = null;
  private alsepHandle: Alsep3DHandle | null = null;

  // Sector 4: Surveyor 3 & Crater Slope
  private surveyorHandle: Surveyor3DHandle | null = null;
  private crewPairGroup: THREE.Group | null = null;
  private soilTestMarksGroup: THREE.Group | null = null;

  // Floating Year Labels + Downward Glowing Arrows for all 4 Sites
  private siteMarkers: Partial<Record<MoonResourceId, MoonMuseumMarker3DHandle>> = {};

  // Walkable surface hotspot rings grouped by owning resource
  private hotspotMarkers: {
    resourceId: MoonResourceId;
    id: string;
    label: string;
    worldPos: THREE.Vector3;
    mesh: THREE.Mesh;
  }[] = [];

  // Playable LRV physics state (spawned beside Apollo 15–17 LM pad at (-18, -22))
  public lrvPhysics: LrvPhysicsState = {
    x: MOON_RESOURCE_SITES.lunar_rover.x + 4.4,
    y: 0,
    z: MOON_RESOURCE_SITES.lunar_rover.z + 3.2,
    vx: 0,
    vz: 0,
    headingRad: 0.45,
    steerAngleRad: 0,
    wheelSpinRad: 0,
    speedMps: 0,
    distanceMeters: 0,
    batteryPercent: 98,
    isBraking: false
  };

  private lastLrvMissionId: string = 'apollo_15';
  private lastLrvEvaIdx: number = 0;

  constructor(getElevationFn: (x: number, z: number) => number) {
    this.getElevation = getElevationFn;
    this.syncState = this.createDefaultSyncState();
    this.lrvPhysics.y = this.getElevation(this.lrvPhysics.x, this.lrvPhysics.z);
  }

  private createDefaultSyncState(): MoonWorldSyncState {
    return {
      activeHotspotId: null,
      sequenceMode: 'idle',
      sequencePlaying: false,
      sequenceProgress: 0,
      laserPulseProgress: null,
      lrvMissionId: 'apollo_15',
      lrvEvaIndex: 0,
      isDrivingLrv: false,
      collectedWaypoints: [],
      alsepSelectedId: 'central',
      alsepTransmitting: true,
      surveyorSamplerTest: 'idle',
      surveyorTrenchCount: 0,
      surveyorBearingCount: 0,
      surveyorImpactCount: 0,
      surveyorCameraPov: false,
      surveyorCameraPan: 0,
      surveyor1969Visit: false,
      surveyorRecoveredParts: false
    };
  }

  public mount(scene: THREE.Scene) {
    if (this.rootGroup.parent !== scene) {
      scene.add(this.rootGroup);
    }
    if (!this.isMuseumBuilt) {
      this.buildAllMoonMuseumSites();
    }
  }

  public unmount() {
    this.rootGroup.parent?.remove(this.rootGroup);
  }

  public clearCurrentSet() {
    while (this.rootGroup.children.length > 0) {
      this.rootGroup.remove(this.rootGroup.children[0]);
    }
    while (this.lrvSectorGroup.children.length > 0) {
      this.lrvSectorGroup.remove(this.lrvSectorGroup.children[0]);
    }
    this.apollo11LmHandle = null;
    this.columbiaGroup = null;
    this.retroHandle = null;
    this.eagleDustRingMesh = null;
    this.lrvLmHandle = null;
    this.lrvHandle = null;
    this.walkbackRing = null;
    this.waypointMeshes = [];
    this.lrvDustRingMesh = null;
    this.intrepidLmHandle = null;
    this.alsepHandle = null;
    this.surveyorHandle = null;
    this.crewPairGroup = null;
    this.soilTestMarksGroup = null;
    this.siteMarkers = {};
    this.hotspotMarkers = [];
    this.staticColliders = [];
    this.isMuseumBuilt = false;
  }

  public syncMoonMuseum(activeResource: MoonResourceId | null, nextSync?: MoonWorldSyncState) {
    const resolvedSync = nextSync ?? this.syncState;
    const missionOrEvaChanged =
      resolvedSync.lrvMissionId !== this.lastLrvMissionId ||
      resolvedSync.lrvEvaIndex !== this.lastLrvEvaIdx;

    this.activeResource = activeResource;
    this.syncState = { ...resolvedSync };

    if (!this.isMuseumBuilt) {
      this.buildAllMoonMuseumSites();
    } else if (missionOrEvaChanged) {
      this.lastLrvMissionId = resolvedSync.lrvMissionId;
      this.lastLrvEvaIdx = resolvedSync.lrvEvaIndex;
      this.rebuildLrvSector();
    }
  }

  public setActiveResource(resourceId: MoonResourceId | null, nextSync: MoonWorldSyncState) {
    this.syncMoonMuseum(resourceId, nextSync);
  }

  public updateSyncState(nextSync: MoonWorldSyncState) {
    this.syncMoonMuseum(this.activeResource, nextSync);
  }

  private addHotspotBeacon(
    resourceId: MoonResourceId,
    id: string,
    label: string,
    x: number,
    y: number,
    z: number,
    colorHex: number,
    parent: THREE.Object3D = this.rootGroup
  ) {
    const ringGeo = new THREE.RingGeometry(0.42, 0.56, 20);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMesh = new THREE.Mesh(
      ringGeo,
      new THREE.MeshBasicMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.72
      })
    );
    ringMesh.position.set(x, y + 0.09, z);
    parent.add(ringMesh);
    this.hotspotMarkers.push({
      resourceId,
      id,
      label,
      worldPos: new THREE.Vector3(x, y, z),
      mesh: ringMesh
    });
  }

  private buildCrewFigurePair(): THREE.Group {
    const g = new THREE.Group();
    const suitMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.75, metalness: 0.15 });
    const visorMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.12, metalness: 0.95 });

    [-0.95, 0.95].forEach((offsetX, idx) => {
      const astro = new THREE.Group();
      astro.position.set(offsetX, 0, idx === 0 ? 0.35 : -0.35);
      astro.rotation.y = idx === 0 ? -0.6 : -0.9;
      const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.75, 8), suitMat);
      legL.position.set(-0.14, 0.38, 0);
      const legR = legL.clone();
      legR.position.x = 0.14;
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.62, 0.3), suitMat);
      body.position.set(0, 1.02, 0);
      const plss = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.52, 0.2), suitMat);
      plss.position.set(0, 1.08, -0.22);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 12, 12), suitMat);
      head.position.set(0, 1.5, 0);
      const visor = new THREE.Mesh(new THREE.SphereGeometry(0.175, 12, 12, 0, Math.PI), visorMat);
      visor.position.set(0, 1.5, 0.05);
      astro.add(legL, legR, body, plss, head, visor);
      g.add(astro);
    });
    return g;
  }

  private createSiteMarker(resourceId: MoonResourceId, x: number, y: number, z: number) {
    const spec = MOON_RESOURCE_SITES[resourceId];
    const marker = createMoonMuseumMarker3D({
      year: spec.year,
      statusBadge: spec.statusBadge,
      title: spec.shortTitle,
      subtitle: spec.subtitle,
      accentColor: spec.accentColor,
      markerHeight: spec.markerHeight
    });
    marker.group.position.set(x, y, z);
    this.rootGroup.add(marker.group);
    this.siteMarkers[resourceId] = marker;
  }

  /**
   * Populate ALL 4 Historical Moon Installations simultaneously across clean separated regions.
   */
  private buildAllMoonMuseumSites() {
    this.clearCurrentSet();

    // ================= 1. TRANQUILITY BASE — APOLLO 11 EAGLE (1969) =================
    const a11 = MOON_RESOURCE_SITES.apollo_lm;
    const a11Y = this.getElevation(a11.x, a11.z);
    const eagle = createApolloLunarModule3D({ nameTag: 'eagle', scale: 1.05 });
    eagle.group.position.set(a11.x, a11Y, a11.z);
    // Historically accurate idle state: only Descent Stage Launch Platform remains permanently on Moon
    eagle.setStaticSurfaceMode(true);
    this.rootGroup.add(eagle.group);
    this.apollo11LmHandle = eagle;
    this.staticColliders.push({ x: a11.x, z: a11.z, radius: 3.1, height: 6.2, baseY: a11Y });

    const columbia = createApolloColumbiaCSM3D();
    columbia.scale.setScalar(1.25);
    columbia.position.set(a11.x + 10.5, a11Y + 11.5, a11.z - 7.5);
    columbia.rotation.set(0.15, 0.4, Math.PI / 2);
    this.rootGroup.add(columbia);
    this.columbiaGroup = columbia;

    // EASEP & Laser Ranging Retroreflector (Apollo 11 ONLY — never conflated with Apollo 12 ALSEP)
    const retroX = a11.x + 7.5;
    const retroZ = a11.z + 4.5;
    const retroY = this.getElevation(retroX, retroZ);
    const retro = createLaserRetroreflector3D();
    retro.group.position.set(retroX, retroY, retroZ);
    this.rootGroup.add(retro.group);
    this.retroHandle = retro;
    this.staticColliders.push({ x: retroX, z: retroZ, radius: 0.9, height: 1.4, baseY: retroY });
    this.addHotspotBeacon('apollo_lm', 'easep_retro', 'Apollo 11 EASEP & Retroreflector', retroX, retroY, retroZ, 0x22c55e);

    MOON_RESOURCES.apollo_lm.hotspots.forEach(hs => {
      const hx = a11.x + hs.worldOffset[0];
      const hz = a11.z + hs.worldOffset[2];
      this.addHotspotBeacon('apollo_lm', hs.id, hs.label, hx, this.getElevation(hx, hz), hz, 0xf59e0b);
    });

    const eagleDust = new THREE.Mesh(
      new THREE.RingGeometry(2.6, 5.2, 28),
      new THREE.MeshBasicMaterial({ color: 0x94a3b8, side: THREE.DoubleSide, transparent: true, opacity: 0 })
    );
    eagleDust.rotation.x = -Math.PI / 2;
    eagleDust.position.set(a11.x, a11Y + 0.12, a11.z);
    this.rootGroup.add(eagleDust);
    this.eagleDustRingMesh = eagleDust;
    this.createSiteMarker('apollo_lm', a11.x, a11Y, a11.z);

    // ================= 2. HADLEY / DESCARTES / TAURUS–LITTROW — LRV (1971–1972) =================
    this.rootGroup.add(this.lrvSectorGroup);
    const lrvSite = MOON_RESOURCE_SITES.lunar_rover;
    this.createSiteMarker('lunar_rover', lrvSite.x, this.getElevation(lrvSite.x, lrvSite.z), lrvSite.z);
    this.rebuildLrvSector();

    // ================= 3. OCEANUS PROCELLARUM — APOLLO 12 INTREPID & ALSEP (1969) =================
    const intrepidX = APOLLO_12_INTREPID_SITE.x;
    const intrepidZ = APOLLO_12_INTREPID_SITE.z;
    const intrepidY = this.getElevation(intrepidX, intrepidZ);
    const intrepid = createApolloLunarModule3D({ nameTag: 'intrepid', scale: 1.0 });
    intrepid.group.position.set(intrepidX, intrepidY, intrepidZ);
    intrepid.setStaticSurfaceMode(true);
    this.rootGroup.add(intrepid.group);
    this.intrepidLmHandle = intrepid;
    this.staticColliders.push({ x: intrepidX, z: intrepidZ, radius: 3.0, height: 6.0, baseY: intrepidY });

    const alsepSite = MOON_RESOURCE_SITES.alsep;
    const alsepY = this.getElevation(alsepSite.x, alsepSite.z);
    const alsep = createAlsepStation3D();
    alsep.group.position.set(alsepSite.x, alsepY, alsepSite.z);
    this.rootGroup.add(alsep.group);
    this.alsepHandle = alsep;
    this.staticColliders.push({ x: alsepSite.x, z: alsepSite.z, radius: 1.4, height: 2.2, baseY: alsepY });

    this.addHotspotBeacon('alsep', 'central', 'ALSEP Central Station', alsepSite.x, alsepY, alsepSite.z, 0x10b981);
    this.addHotspotBeacon(
      'alsep',
      'snap27',
      'SNAP-27 RTG Generator',
      alsepSite.x - 2.4,
      alsepY,
      alsepSite.z + 1.8,
      0xf59e0b
    );
    APOLLO_12_ALSEP_INSTRUMENTS.forEach(inst => {
      const ix = alsepSite.x + inst.offsetFromCentral[0] * 0.78;
      const iz = alsepSite.z + inst.offsetFromCentral[1] * 0.78;
      this.addHotspotBeacon('alsep', inst.id, `${inst.code} — ${inst.name}`, ix, this.getElevation(ix, iz), iz, 0x10b981);
    });
    this.createSiteMarker('alsep', alsepSite.x, alsepY, alsepSite.z);

    // ================= 4. OCEANUS PROCELLARUM CRATER — SURVEYOR 3 (1967) =================
    const survSite = MOON_RESOURCE_SITES.surveyor;
    const survY = this.getElevation(survSite.x, survSite.z);
    const craterRim = new THREE.Mesh(
      new THREE.TorusGeometry(7.6, 0.36, 10, 36),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.94, metalness: 0.04 })
    );
    craterRim.rotation.x = Math.PI / 2;
    craterRim.scale.set(1, 1, 0.45);
    craterRim.position.set(survSite.x, survY + 0.32, survSite.z);
    this.rootGroup.add(craterRim);

    const surv = createSurveyor3Lander3D();
    surv.group.position.set(survSite.x, survY, survSite.z);
    this.rootGroup.add(surv.group);
    this.surveyorHandle = surv;
    this.staticColliders.push({ x: survSite.x, z: survSite.z, radius: 1.65, height: 3.0, baseY: survY });

    const marksGroup = new THREE.Group();
    marksGroup.position.set(survSite.x - 0.25, survY + 0.06, survSite.z + 1.35);
    this.rootGroup.add(marksGroup);
    this.soilTestMarksGroup = marksGroup;

    const crew = this.buildCrewFigurePair();
    crew.position.set(survSite.x + 2.2, survY, survSite.z + 1.6);
    crew.visible = this.syncState.surveyor1969Visit;
    this.rootGroup.add(crew);
    this.crewPairGroup = crew;

    MOON_RESOURCES.surveyor.hotspots.forEach(hs => {
      const hx = survSite.x + hs.worldOffset[0];
      const hz = survSite.z + hs.worldOffset[2];
      this.addHotspotBeacon('surveyor', hs.id, hs.label, hx, this.getElevation(hx, hz), hz, 0xc084fc);
    });
    this.createSiteMarker('surveyor', survSite.x, survY, survSite.z);

    this.isMuseumBuilt = true;
  }

  private rebuildLrvSector() {
    while (this.lrvSectorGroup.children.length > 0) {
      this.lrvSectorGroup.remove(this.lrvSectorGroup.children[0]);
    }
    this.waypointMeshes = [];

    const lrvSite = MOON_RESOURCE_SITES.lunar_rover;
    const baseY = this.getElevation(lrvSite.x, lrvSite.z);
    const profile =
      LRV_MISSIONS.find(m => m.missionId === this.syncState.lrvMissionId) || LRV_MISSIONS[0];
    const excursion = profile.excursions[this.syncState.lrvEvaIndex] || profile.excursions[0];

    // Update marker year/title for Apollo 15 (1971), Apollo 16 (1972), or Apollo 17 (1972)
    this.siteMarkers.lunar_rover?.setLabel({
      year: profile.yearLabel,
      statusBadge: 'DEPLOYED ON MOON',
      title: `LUNAR ROVING VEHICLE — ${profile.title.split(' — ')[0].toUpperCase()}`,
      subtitle: `${profile.landingRegion.split(' (')[0]} • ${profile.lunarModuleName} LM`
    });

    // Single regional Lunar Module matching chosen mission (never parking all 3 rovers together)
    const lm = createApolloLunarModule3D({ scale: 1.0 });
    lm.group.position.set(lrvSite.x, baseY, lrvSite.z);
    lm.setStaticSurfaceMode(true);
    this.lrvSectorGroup.add(lm.group);
    this.lrvLmHandle = lm;

    const lrv = createLunarRovingVehicle3D();
    const startX = lrvSite.x + 4.4;
    const startZ = lrvSite.z + 3.2;
    const startY = this.getElevation(startX, startZ);
    lrv.group.position.set(startX, startY, startZ);
    this.lrvSectorGroup.add(lrv.group);
    this.lrvHandle = lrv;

    this.lrvPhysics = {
      x: startX,
      y: startY,
      z: startZ,
      vx: 0,
      vz: 0,
      headingRad: 0.45,
      steerAngleRad: 0,
      wheelSpinRad: 0,
      speedMps: 0,
      distanceMeters: 0,
      batteryPercent: 98,
      isBraking: false
    };

    const wbGeo = new THREE.RingGeometry(
      profile.walkbackLimitMeters - 0.35,
      profile.walkbackLimitMeters,
      64
    );
    wbGeo.rotateX(-Math.PI / 2);
    const wbMesh = new THREE.Mesh(
      wbGeo,
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.42
      })
    );
    wbMesh.position.set(lrvSite.x, baseY + 0.14, lrvSite.z);
    this.lrvSectorGroup.add(wbMesh);
    this.walkbackRing = wbMesh;

    excursion.waypoints.forEach(wp => {
      const wy = this.getElevation(wp.x, wp.z);
      const wpGroup = new THREE.Group();
      wpGroup.position.set(wp.x, wy, wp.z);

      const rockSample = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.58, 0),
        new THREE.MeshStandardMaterial({
          color: wp.id === 'wp_shorty' ? 0xf97316 : 0xe2e8f0,
          roughness: 0.85,
          metalness: 0.1
        })
      );
      rockSample.position.y = 0.38;
      rockSample.castShadow = true;

      const beacon = new THREE.Mesh(
        new THREE.RingGeometry(1.1, 1.35, 24),
        new THREE.MeshBasicMaterial({
          color: 0xfbbf24,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.78
        })
      );
      beacon.rotation.x = -Math.PI / 2;
      beacon.position.y = 0.1;

      const craterRim = new THREE.Mesh(
        new THREE.TorusGeometry(4.2, 0.45, 8, 28),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.94, metalness: 0.04 })
      );
      craterRim.rotation.x = Math.PI / 2;
      craterRim.position.y = -0.1;

      wpGroup.add(rockSample, beacon, craterRim);
      this.lrvSectorGroup.add(wpGroup);
      this.waypointMeshes.push({ id: wp.id, label: wp.label, group: wpGroup, ring: beacon });
    });

    const lrvDust = new THREE.Mesh(
      new THREE.RingGeometry(0.8, 1.6, 20),
      new THREE.MeshBasicMaterial({ color: 0xcbd5e1, side: THREE.DoubleSide, transparent: true, opacity: 0 })
    );
    lrvDust.rotation.x = -Math.PI / 2;
    this.lrvSectorGroup.add(lrvDust);
    this.lrvDustRingMesh = lrvDust;
  }

  public getObstacles(): CylinderObstacle[] {
    const lrvSite = MOON_RESOURCE_SITES.lunar_rover;
    const lrvLmY = this.getElevation(lrvSite.x, lrvSite.z);
    const list: CylinderObstacle[] = [
      ...this.staticColliders,
      { x: lrvSite.x, z: lrvSite.z, radius: 3.0, height: 6.0, baseY: lrvLmY }
    ];
    if (!this.syncState.isDrivingLrv) {
      list.push({
        x: this.lrvPhysics.x,
        z: this.lrvPhysics.z,
        radius: 1.45,
        height: 1.5,
        baseY: this.lrvPhysics.y
      });
    }
    return list;
  }

  public getInteractionContext(playerPos: THREE.Vector3): {
    nearLrvVehicle: boolean;
    lrvDriving: boolean;
    nearbyResourceId: MoonResourceId | null;
    nearbyResourceTitle: string | null;
    nearbyResourceBadge: string | null;
  } {
    const lrvDist = Math.hypot(playerPos.x - this.lrvPhysics.x, playerPos.z - this.lrvPhysics.z);
    const nearLrvVehicle = lrvDist < 4.5 && !this.syncState.isDrivingLrv;

    let closestId: MoonResourceId | null = null;
    let closestTitle: string | null = null;
    let closestBadge: string | null = null;
    let bestSiteDist = Infinity;

    (['apollo_lm', 'lunar_rover', 'alsep', 'surveyor'] as MoonResourceId[]).forEach(id => {
      const site = MOON_RESOURCE_SITES[id];
      const checkX = id === 'lunar_rover' ? this.lrvPhysics.x : site.x;
      const checkZ = id === 'lunar_rover' ? this.lrvPhysics.z : site.z;
      const d = Math.hypot(playerPos.x - checkX, playerPos.z - checkZ);
      const lmBackupDist =
        id === 'lunar_rover' ? Math.hypot(playerPos.x - site.x, playerPos.z - site.z) : d;
      const effDist = Math.min(d, lmBackupDist);
      if (effDist <= site.interactionRadius && effDist < bestSiteDist) {
        bestSiteDist = effDist;
        closestId = id;
        closestTitle = MOON_RESOURCES[id].shortTitle;
        closestBadge = `${site.year} • ${site.statusBadge}`;
      }
    });

    return {
      nearLrvVehicle,
      lrvDriving: this.syncState.isDrivingLrv,
      nearbyResourceId: closestId,
      nearbyResourceTitle: closestTitle,
      nearbyResourceBadge: closestBadge
    };
  }

  public addSoilTestMark(type: 'trench' | 'bearing' | 'impact') {
    if (!this.soilTestMarksGroup) return;
    const count = this.soilTestMarksGroup.children.length;
    const offsetAngle = (count - 3) * 0.14;
    let mesh: THREE.Mesh;
    if (type === 'trench') {
      mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.05, 0.65),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.96, metalness: 0.02 })
      );
    } else if (type === 'bearing') {
      mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.18, 0.04, 12),
        new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.95 })
      );
    } else {
      mesh = new THREE.Mesh(
        new THREE.RingGeometry(0.08, 0.22, 12),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, side: THREE.DoubleSide, roughness: 0.95 })
      );
      mesh.rotation.x = -Math.PI / 2;
    }
    mesh.position.set(Math.sin(offsetAngle) * 1.15, 0.02, Math.cos(offsetAngle) * 0.45 - 0.35);
    mesh.rotation.y = offsetAngle;
    this.soilTestMarksGroup.add(mesh);
  }

  /**
   * Per-frame update across ALL 4 Historical Moon Installations (zero React allocations).
   */
  public update(
    delta: number,
    elapsedSec: number,
    playerPos: THREE.Vector3,
    input: MoveInput,
    camera: THREE.PerspectiveCamera
  ): MoonWorldRuntimeTelemetry {
    const ctx = this.getInteractionContext(playerPos);

    const telemetry: MoonWorldRuntimeTelemetry = {
      nearbyResourceId: ctx.nearbyResourceId,
      nearbyResourceTitle: ctx.nearbyResourceTitle,
      nearbyResourceBadge: ctx.nearbyResourceBadge,
      nearLrvVehicle: ctx.nearLrvVehicle,
      lrvDriving: ctx.lrvDriving,
      nearbyHotspotId: null,
      nearbyHotspotLabel: null,
      sequenceProgress: this.syncState.sequenceProgress,
      sequenceLabel: 'Ready',
      ascentAltitudeMeters: 0,
      descentAltitudeMeters: 0,
      laserElapsedSeconds: null,
      lrvSpeedKmh: 0,
      lrvDistanceMeters: Math.round(this.lrvPhysics.distanceMeters),
      lrvBatteryPercent: Math.round(this.lrvPhysics.batteryPercent),
      walkbackDistanceMeters: 0,
      walkbackExceeded: false,
      walkbackWarning: null,
      nearbyWaypointId: null,
      nearbyWaypointLabel: null
    };

    if (!this.isMuseumBuilt) return telemetry;

    // 0. Update Floating 3D Year Panels + Downward Arrows for all 4 Historical Sites
    (['apollo_lm', 'lunar_rover', 'alsep', 'surveyor'] as MoonResourceId[]).forEach(id => {
      const marker = this.siteMarkers[id];
      const spec = MOON_RESOURCE_SITES[id];
      if (!marker) return;
      const dist = Math.hypot(playerPos.x - spec.x, playerPos.z - spec.z);
      const highlighted = ctx.nearbyResourceId === id || this.activeResource === id;
      marker.update(elapsedSec, highlighted, dist);
    });

    // 1. Proximity check against ground hotspot beacons
    let bestDist = 4.6;
    for (const hm of this.hotspotMarkers) {
      const pulse = 1 + 0.08 * Math.sin(elapsedSec * 4.2);
      hm.mesh.scale.set(pulse, pulse, pulse);
      const d = Math.hypot(playerPos.x - hm.worldPos.x, playerPos.z - hm.worldPos.z);
      if (d < bestDist) {
        bestDist = d;
        telemetry.nearbyHotspotId = hm.id;
        telemetry.nearbyHotspotLabel = hm.label;
      }
    }

    // 2. Apollo 11 Eagle + Columbia CSM + EASEP Retroreflector
    const a11 = MOON_RESOURCE_SITES.apollo_lm;
    const a11Y = this.getElevation(a11.x, a11.z);
    if (this.apollo11LmHandle) {
      const isA11Focused = this.activeResource === 'apollo_lm';
      const a11SeqActive =
        isA11Focused &&
        (this.syncState.sequenceMode === 'eagle_descent' || this.syncState.sequenceMode === 'eagle_ascent');

      // Show Ascent Stage ONLY during animated landing/ascent sequence; otherwise show Descent Launch Platform
      this.apollo11LmHandle.setStaticSurfaceMode(!a11SeqActive);

      this.apollo11LmHandle.setHighlight(
        !isA11Focused
          ? null
          : this.syncState.activeHotspotId === 'lm_legs'
          ? 'legs'
          : this.syncState.activeHotspotId === 'lm_descent_engine'
          ? 'engine'
          : this.syncState.activeHotspotId === 'lm_equipment'
          ? 'easep'
          : this.syncState.activeHotspotId === 'lm_ascent'
          ? 'ascent'
          : this.syncState.activeHotspotId
          ? 'descent'
          : null
      );

      if (this.columbiaGroup) {
        const orbAngle = elapsedSec * 0.22;
        this.columbiaGroup.position.set(
          a11.x + Math.cos(orbAngle) * 10.5,
          a11Y + 11.5,
          a11.z + Math.sin(orbAngle) * 7.5
        );
        this.columbiaGroup.rotation.y = -orbAngle;
      }

      if (isA11Focused && this.syncState.sequenceMode === 'eagle_descent') {
        const p = this.syncState.sequenceProgress;
        const alt = 34 * Math.pow(Math.max(0, 1 - p), 1.65);
        this.apollo11LmHandle.group.position.set(a11.x, a11Y + alt, a11.z);
        this.apollo11LmHandle.setAscentFlightState(0, false);
        if (this.eagleDustRingMesh) {
          const mat = this.eagleDustRingMesh.material as THREE.MeshBasicMaterial;
          mat.opacity = p > 0.35 && p < 0.96 ? (1 - Math.abs(p - 0.72) * 2) * 0.55 : 0;
          const sc = 1 + p * 1.4;
          this.eagleDustRingMesh.scale.set(sc, sc, sc);
        }
        telemetry.sequenceLabel =
          p >= 0.96
            ? 'THE EAGLE HAS LANDED — SEA OF TRANQUILLITY'
            : 'EAGLE POWERED DESCENT TO MARE TRANQUILLITATIS';
      } else if (isA11Focused && this.syncState.sequenceMode === 'eagle_ascent') {
        this.apollo11LmHandle.group.position.set(a11.x, a11Y, a11.z);
        const sep = computeAscentSeparationState(this.syncState.sequenceProgress);
        this.apollo11LmHandle.setAscentFlightState(sep.ascentAltitudeMeters, sep.engineActive);
        telemetry.ascentAltitudeMeters = Math.round(sep.ascentAltitudeMeters * 10) / 10;
        telemetry.descentAltitudeMeters = sep.descentAltitudeMeters;
        telemetry.sequenceLabel = sep.statusBanner;
      } else {
        this.apollo11LmHandle.group.position.set(a11.x, a11Y, a11.z);
        this.apollo11LmHandle.setAscentFlightState(0, false);
        if (this.eagleDustRingMesh) {
          (this.eagleDustRingMesh.material as THREE.MeshBasicMaterial).opacity = 0;
        }
      }

      if (this.retroHandle) {
        if (this.syncState.laserPulseProgress !== null) {
          const laser = computeLaserPulseRoundTrip(this.syncState.laserPulseProgress);
          this.retroHandle.setLaserProgress(this.syncState.laserPulseProgress);
          telemetry.laserElapsedSeconds = Math.round(laser.elapsedSeconds * 1000) / 1000;
        } else {
          this.retroHandle.setLaserProgress(null);
        }
      }
    }

    // 3. Lunar Roving Vehicle (Apollo 15 / 16 / 17)
    const lrvSite = MOON_RESOURCE_SITES.lunar_rover;
    if (this.lrvHandle) {
      const profile =
        LRV_MISSIONS.find(m => m.missionId === this.syncState.lrvMissionId) || LRV_MISSIONS[0];
      const excursion = profile.excursions[this.syncState.lrvEvaIndex] || profile.excursions[0];

      if (this.activeResource === 'lunar_rover' && this.syncState.sequenceMode === 'lrv_deploy') {
        this.lrvHandle.setDeployProgress(this.syncState.sequenceProgress);
        telemetry.sequenceLabel =
          this.syncState.sequenceProgress >= 0.96
            ? 'LUNAR ROVER UNFOLDED & READY TO DRIVE!'
            : 'DEPLOYING LRV FROM DESCENT BAY...';
      } else {
        this.lrvHandle.setDeployProgress(1);
      }

      if (this.syncState.isDrivingLrv) {
        const controls = {
          forward: input.forward || (input.virtualVector ? input.virtualVector.y < -0.12 : false),
          backward: input.backward || (input.virtualVector ? input.virtualVector.y > 0.12 : false),
          left: input.left || (input.virtualVector ? input.virtualVector.x < -0.12 : false),
          right: input.right || (input.virtualVector ? input.virtualVector.x > 0.12 : false),
          brake: input.jump
        };
        this.lrvPhysics = computeLrvPhysicsStep(
          this.lrvPhysics,
          controls,
          delta,
          profile.maxSpeedKmh,
          (x, z) => this.getElevation(x, z),
          82
        );
        this.lrvHandle.setCrewSeated(true);
        this.lrvHandle.setDrivePose(this.lrvPhysics.steerAngleRad, this.lrvPhysics.wheelSpinRad);
      } else {
        this.lrvHandle.setCrewSeated(false);
      }

      this.lrvHandle.group.position.set(this.lrvPhysics.x, this.lrvPhysics.y, this.lrvPhysics.z);
      this.lrvHandle.group.rotation.y = this.lrvPhysics.headingRad;
      this.lrvHandle.setSampleCount(Math.min(3, this.syncState.collectedWaypoints.length));

      if (this.lrvDustRingMesh) {
        this.lrvDustRingMesh.position.set(this.lrvPhysics.x, this.lrvPhysics.y + 0.08, this.lrvPhysics.z);
        const mat = this.lrvDustRingMesh.material as THREE.MeshBasicMaterial;
        mat.opacity = this.syncState.isDrivingLrv && this.lrvPhysics.speedMps > 0.4 ? 0.35 : 0;
      }

      const wb = computeWalkbackStatus(
        this.lrvPhysics.x,
        this.lrvPhysics.z,
        lrvSite.x,
        lrvSite.z,
        profile.walkbackLimitMeters
      );
      if (this.walkbackRing) {
        const wbMat = this.walkbackRing.material as THREE.MeshBasicMaterial;
        wbMat.color.setHex(wb.exceeded ? 0xef4444 : wb.ratio > 0.8 ? 0xf59e0b : 0x38bdf8);
      }

      const refX = this.syncState.isDrivingLrv ? this.lrvPhysics.x : playerPos.x;
      const refZ = this.syncState.isDrivingLrv ? this.lrvPhysics.z : playerPos.z;
      for (const wp of excursion.waypoints) {
        const d = Math.hypot(refX - wp.x, refZ - wp.z);
        if (d < 5.5) {
          telemetry.nearbyWaypointId = wp.id;
          telemetry.nearbyWaypointLabel = wp.label;
          break;
        }
      }

      telemetry.lrvSpeedKmh = Math.round(this.lrvPhysics.speedMps * 3.6 * 10) / 10;
      telemetry.lrvDistanceMeters = Math.round(this.lrvPhysics.distanceMeters);
      telemetry.lrvBatteryPercent = Math.round(this.lrvPhysics.batteryPercent);
      telemetry.walkbackDistanceMeters = Math.round(wb.distanceFromLmMeters);
      telemetry.walkbackExceeded = wb.exceeded;
      telemetry.walkbackWarning = wb.warningText;
    }

    // 4. Apollo 12 ALSEP Station (6 Instruments + SNAP-27 RTG)
    if (this.alsepHandle) {
      this.alsepHandle.setHighlight(
        this.activeResource === 'alsep' ? this.syncState.alsepSelectedId : null
      );
      if (this.activeResource === 'alsep' && this.syncState.sequenceMode === 'alsep_deploy') {
        this.alsepHandle.setDeployProgress(this.syncState.sequenceProgress);
        telemetry.sequenceLabel =
          this.syncState.sequenceProgress >= 0.96
            ? 'ALSEP DEPLOYED & BEAMING CONTINUOUS TELEMETRY TO EARTH'
            : 'DEPLOYING APOLLO 12 ALSEP & SNAP-27 RTG...';
      } else {
        this.alsepHandle.setDeployProgress(1);
      }
      this.alsepHandle.animateTelemetry(elapsedSec, this.syncState.alsepTransmitting);
    }

    // 5. Surveyor 3 Robotic Lander (1967 Bouncing Soft Landing + TV Camera + Surface Sampler)
    const survSite = MOON_RESOURCE_SITES.surveyor;
    const survY = this.getElevation(survSite.x, survSite.z);
    if (this.surveyorHandle) {
      this.surveyorHandle.setHighlight(
        this.activeResource === 'surveyor' ? this.syncState.activeHotspotId : null
      );
      this.surveyorHandle.setMirrorAngles(this.syncState.surveyorCameraPan, 0.25);

      if (this.crewPairGroup) {
        this.crewPairGroup.visible =
          this.syncState.surveyor1969Visit ||
          Math.hypot(playerPos.x - survSite.x, playerPos.z - survSite.z) < 10;
      }
      this.surveyorHandle.setRecoveryState(this.syncState.surveyorRecoveredParts);

      if (this.activeResource === 'surveyor' && this.syncState.sequenceMode === 'surveyor_bounce') {
        const b = computeSurveyorBounceHeight(this.syncState.sequenceProgress);
        this.surveyorHandle.group.position.set(survSite.x, survY + b.altitudeMeters, survSite.z);
        this.surveyorHandle.setVernierThrust(b.engineFiring ? 0.9 : 0);
        telemetry.sequenceLabel = b.phaseLabel;
      } else {
        this.surveyorHandle.group.position.set(survSite.x, survY, survSite.z);
        this.surveyorHandle.setVernierThrust(0);
      }

      if (this.syncState.surveyorSamplerTest !== 'idle') {
        const wave = 0.5 + 0.5 * Math.sin(elapsedSec * 5.0);
        this.surveyorHandle.setSamplerPose(0.85, wave * 0.9, Math.sin(elapsedSec * 1.8) * 0.35);
      } else {
        this.surveyorHandle.setSamplerPose(0.35, 0.15, 0.15);
      }

      if (this.activeResource === 'surveyor' && this.syncState.surveyorCameraPov) {
        const camY = survY + 1.85;
        camera.position.set(survSite.x + 0.4, camY, survSite.z + 0.4);
        const lookDist = 18;
        camera.lookAt(
          survSite.x + Math.sin(this.syncState.surveyorCameraPan) * lookDist,
          camY - 2.4,
          survSite.z + Math.cos(this.syncState.surveyorCameraPan) * lookDist
        );
      }
    }

    return telemetry;
  }
}
