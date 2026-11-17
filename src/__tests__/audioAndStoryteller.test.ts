import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeShuttleFlightAudioTarget,
  resolveAudioGains
} from '../audio/flightAudioMath';
import {
  getBoardingStoryLine,
  getLandingStoryLine,
  getQuizFeedbackLine,
  getTakeoffStoryLine,
  pickBestFemaleStorytellerVoice,
  scoreVoiceForFemaleStoryteller,
  StoryDialogueQueue
} from '../narration/storyDialogue';

test('4-Channel Audio Mixer & Smooth Storyteller Ducking', () => {
  const normal = resolveAudioGains({
    masterVolume: 0.8,
    sfxVolume: 0.75,
    musicVolume: 0.6,
    narrationVolume: 0.9,
    muted: false,
    narrationMuted: false,
    duckingActive: false
  });
  assert.equal(normal.masterGain, 0.8);
  assert.equal(normal.flightBusGain, 0.75);
  assert.equal(normal.musicBusGain, 0.6);
  assert.ok(Math.abs(normal.narrationGain - 0.72) < 1e-6);

  // Ducking active lowers spacecraft flight SFX & background music without silencing them
  const ducked = resolveAudioGains({
    masterVolume: 0.8,
    sfxVolume: 0.75,
    musicVolume: 0.6,
    narrationVolume: 0.9,
    muted: false,
    narrationMuted: false,
    duckingActive: true
  });
  assert.ok(ducked.flightBusGain < normal.flightBusGain && ducked.flightBusGain > 0);
  assert.ok(ducked.musicBusGain < normal.musicBusGain && ducked.musicBusGain > 0);
  assert.equal(ducked.narrationGain, normal.narrationGain);

  // Narration-only mute silences storyteller voice while keeping spacecraft SFX & music intact
  const voiceMuted = resolveAudioGains({
    masterVolume: 0.8,
    sfxVolume: 0.75,
    musicVolume: 0.6,
    narrationVolume: 0.9,
    muted: false,
    narrationMuted: true,
    duckingActive: false
  });
  assert.equal(voiceMuted.narrationGain, 0);
  assert.equal(voiceMuted.flightBusGain, 0.75);
  assert.equal(voiceMuted.musicBusGain, 0.6);
});

test('Shuttle Flight Audio Profile - Continuous Camera Crossfade & Planet Acoustics', () => {
  const cockpitTakeoff = computeShuttleFlightAudioTarget({
    state: 'takeoff',
    phaseProgress: 0.5,
    altitudeMeters: 25,
    velocityKms: 4.0,
    planet: 'earth',
    cameraView: 'cockpit',
    rcsActivity: 0.5
  });

  const externalTakeoff = computeShuttleFlightAudioTarget({
    state: 'takeoff',
    phaseProgress: 0.5,
    altitudeMeters: 25,
    velocityKms: 4.0,
    planet: 'earth',
    cameraView: 'external_chase',
    rcsActivity: 0.5
  });

  // Both remain active seamlessly, while cockpit is warmer/muffled with stronger cabin hum
  assert.equal(cockpitTakeoff.isActive, true);
  assert.equal(externalTakeoff.isActive, true);
  assert.ok(cockpitTakeoff.lowpassCutoffHz < externalTakeoff.lowpassCutoffHz);
  assert.ok(cockpitTakeoff.cabinHumGain > externalTakeoff.cabinHumGain);
  assert.ok(externalTakeoff.mainRoarGain > cockpitTakeoff.mainRoarGain);

  // Planet atmosphere accuracy: Moon landing has zero wind (airless), Mars has thin wind
  const moonLanding = computeShuttleFlightAudioTarget({
    state: 'landing',
    phaseProgress: 0.6,
    altitudeMeters: 18,
    velocityKms: 1.1,
    planet: 'moon',
    cameraView: 'external_chase',
    rcsActivity: 0.7
  });
  const marsLanding = computeShuttleFlightAudioTarget({
    state: 'landing',
    phaseProgress: 0.6,
    altitudeMeters: 18,
    velocityKms: 1.1,
    planet: 'mars',
    cameraView: 'external_chase',
    rcsActivity: 0.7
  });
  assert.equal(moonLanding.isAirless, true);
  assert.equal(moonLanding.windHissGain, 0);
  assert.equal(marsLanding.isAirless, false);
  assert.ok(marsLanding.windHissGain > 0);
});

test('Female Storyteller Voice Selection, Queueing & Encouraging Dialogue', () => {
  const voices = [
    { name: 'Google UK English Male', lang: 'en-GB' },
    { name: 'Daniel', lang: 'en-GB' },
    { name: 'Microsoft Aria Online (Natural) - English (United States)', lang: 'en-US' },
    { name: 'Samantha', lang: 'en-US' }
  ];

  const picked = pickBestFemaleStorytellerVoice(voices);
  assert.ok(picked !== null);
  assert.ok(picked!.name.includes('Aria'), `Expected Aria female neural voice, got ${picked!.name}`);
  assert.ok(
    scoreVoiceForFemaleStoryteller({ name: 'Daniel', lang: 'en-GB' }) <
      scoreVoiceForFemaleStoryteller({ name: 'Samantha', lang: 'en-US' })
  );

  // Queue deduplication and high-priority preemption
  const q = new StoryDialogueQueue();
  const r1 = q.enqueue('Line one', 'normal', 'boarding_earth', 1000, 5000);
  const r2 = q.enqueue('Duplicate line', 'normal', 'boarding_earth', 2000, 5000);
  assert.ok(r1.item !== null);
  assert.equal(r2.item, null, 'Duplicate key inside cooldown must be suppressed');

  const urgent = q.enqueue('Touchdown!', 'high', 'land_moon', 2500, 5000);
  assert.equal(urgent.interruptCurrent, true);

  // Encouraging wording for wrong quiz answers & expressive mission lines
  const wrongFeedback = getQuizFeedbackLine({
    isCorrect: false,
    explanation: 'Lunar south pole shadows trap water ice.',
    funFact: 'Some craters have been dark for billions of years.'
  });
  assert.ok(!/incorrect|wrong answer/i.test(wrongFeedback));
  assert.ok(/good try|ooh/i.test(wrongFeedback));

  assert.ok(getBoardingStoryLine('earth').length > 20);
  assert.ok(getTakeoffStoryLine('earth', 'moon').includes('Moon'));
  assert.ok(getLandingStoryLine('mars').includes('Jezero Crater'));
});
