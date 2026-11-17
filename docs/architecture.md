# System Architecture: Cosmic Explorer: Beyond Earth

## 1. Modular Overview
```
src/
├── types/
│   └── index.ts                 # Authoritative TypeScript domain models
├── planets/
│   └── planetConfig.ts          # Physical & orbital parameters (gravity, radius, atmosphere)
├── education/
│   ├── contentLibrary.ts        # 16 verified NASA educational records (Moon & Mars)
│   └── DiscoveryModelFactory.ts # 3D procedural model archetypes for museum viewer
├── missions/
│   └── missionData.ts           # Cadet, Specialist, and Commander mission trees
├── quiz/
│   └── quizData.ts              # Curated question bank with constructive feedback
├── audio/
│   └── soundManager.ts          # Procedural Web Audio API sound generator
├── narration/
│   └── narrationManager.ts      # Web Speech API engine supporting English & Hindi
├── physics/
│   └── planetaryPhysics.ts      # Camera-relative movement, planet gravity & ground snapping
├── astronaut/
│   └── AstronautModel.ts        # Composite 8-part procedural spacesuit with kinematics
├── scene/
│   ├── ProceduralTextures.ts    # Procedural canvas textures for Earth, Moon, Mars, Sun
│   ├── SpaceUniverse.ts         # Inner solar system orbital simulation
│   ├── MoonWorld.ts             # Explorable 3D lunar terrain with Apollo 11 & specimens
│   ├── MarsWorld.ts             # Explorable 3D Martian terrain with Perseverance & delta
│   └── WorldCanvas.tsx          # Master WebGL canvas manager with raycasting & loop
├── ui/
│   ├── TitleScreen.tsx          # Cinematic mission launch title screen
│   ├── HUD.tsx                  # Flight HUD, proximity prompts & mobile touch controls
│   ├── DestinationSelector.tsx  # Orbital inspection & descent launch panel
│   ├── DiscoveryViewer.tsx      # Museum-grade 3D specimen inspection with narration
│   ├── BackpackModal.tsx        # Filterable & searchable discovery inventory
│   ├── MissionsModal.tsx        # Interactive mission checklist & badge system
│   ├── QuizModal.tsx            # Multiple-choice exam with feedback
│   ├── MissionControlModal.tsx  # Earth headquarters & explorer profile
│   ├── SettingsModal.tsx        # Audio sliders, voice language, & graphics quality
│   └── ControlsTutorialModal.tsx# Visual mobility & controls guide
└── utils/
    └── persistence.ts           # Versioned localStorage profile & settings manager
```

## 2. Decoupled Rendering & Game Loops
- Physics calculations execute in continuous variable delta-time (`clock.getDelta()`).
- Camera tracking utilizes exponential damping (`1.0 - Math.exp(-decay * delta)`) to eliminate jitter and nausea.
- Memory lifecycle is strictly managed with event listener and WebGL resource disposal on teardown.
