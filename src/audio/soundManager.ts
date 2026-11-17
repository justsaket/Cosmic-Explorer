import { PlanetId } from '../types';
import {
  computeShuttleFlightAudioTarget,
  resolveAudioGains,
  ShuttleAudioInput
} from './flightAudioMath';

interface FlightAudioRig {
  roarOsc1: OscillatorNode;
  roarOsc2: OscillatorNode;
  roarGain: GainNode;
  roarFilter: BiquadFilterNode;
  noiseSource: AudioBufferSourceNode;
  noiseLowpass: BiquadFilterNode;
  noiseRoarGain: GainNode;
  windBandpass: BiquadFilterNode;
  windGain: GainNode;
  cabinHumOsc: OscillatorNode;
  cabinHumGain: GainNode;
  spacePadOsc1: OscillatorNode;
  spacePadOsc2: OscillatorNode;
  spacePadGain: GainNode;
}

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private flightBusGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  private ambienceNodes: { osc: OscillatorNode; noise?: AudioNode; gain: GainNode } | null = null;
  private flightRig: FlightAudioRig | null = null;
  private lastRcsBurstMs = 0;

  // 4-channel mixer + ducking state
  private masterVol = 0.85;
  private sfxVol = 0.78;
  private musicVol = 0.55;
  private narrationVol = 0.92;
  private isMuted = false;
  private narrationMuted = false;
  private duckingActive = false;

  private initContext() {
    if (typeof window === 'undefined') return;
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVol, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(this.sfxVol, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);

    this.flightBusGain = this.ctx.createGain();
    this.flightBusGain.gain.setValueAtTime(this.sfxVol, this.ctx.currentTime);
    this.flightBusGain.connect(this.masterGain);

    this.ambienceGain = this.ctx.createGain();
    this.ambienceGain.gain.setValueAtTime(this.musicVol, this.ctx.currentTime);
    this.ambienceGain.connect(this.masterGain);

    this.applyResolvedGains();
  }

  private applyResolvedGains() {
    const gains = resolveAudioGains({
      masterVolume: this.masterVol,
      sfxVolume: this.sfxVol,
      musicVolume: this.musicVol,
      narrationVolume: this.narrationVol,
      muted: this.isMuted,
      narrationMuted: this.narrationMuted,
      duckingActive: this.duckingActive
    });

    if (!this.ctx || !this.masterGain || !this.sfxGain || !this.flightBusGain || !this.ambienceGain) {
      return;
    }
    const now = this.ctx.currentTime;
    const tc = this.duckingActive ? 0.14 : 0.22;
    this.masterGain.gain.setTargetAtTime(gains.masterGain, now, 0.05);
    this.sfxGain.gain.setTargetAtTime(gains.sfxGain, now, 0.05);
    this.flightBusGain.gain.setTargetAtTime(gains.flightBusGain, now, tc);
    this.ambienceGain.gain.setTargetAtTime(gains.musicBusGain, now, tc);
  }

  public setVolumes(
    master: number,
    sfx: number,
    ambience: number,
    muted: boolean,
    narrationVolume?: number,
    narrationMuted?: boolean
  ) {
    this.initContext();
    this.masterVol = Math.max(0, Math.min(1, master));
    this.sfxVol = Math.max(0, Math.min(1, sfx));
    this.musicVol = Math.max(0, Math.min(1, ambience));
    this.isMuted = muted;
    if (typeof narrationVolume === 'number') {
      this.narrationVol = Math.max(0, Math.min(1, narrationVolume));
    }
    if (typeof narrationMuted === 'boolean') {
      this.narrationMuted = narrationMuted;
    }
    this.applyResolvedGains();
  }

  public setNarrationDucking(active: boolean) {
    if (this.duckingActive === active) return;
    this.duckingActive = active;
    this.applyResolvedGains();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    this.applyResolvedGains();
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  private createPinkNoiseBuffer(ctx: AudioContext, seconds = 2.0): AudioBuffer {
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = Math.max(-1, Math.min(1, (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08));
      b6 = white * 0.115926;
    }
    return buffer;
  }

  private ensureFlightRig(): FlightAudioRig | null {
    this.initContext();
    if (!this.ctx || !this.flightBusGain || !this.ambienceGain) return null;
    if (this.flightRig) return this.flightRig;

    const now = this.ctx.currentTime;

    // 1. Sub-bass & turbine core engine roar
    const roarOsc1 = this.ctx.createOscillator();
    roarOsc1.type = 'sawtooth';
    roarOsc1.frequency.setValueAtTime(52, now);

    const roarOsc2 = this.ctx.createOscillator();
    roarOsc2.type = 'triangle';
    roarOsc2.frequency.setValueAtTime(78, now);

    const roarFilter = this.ctx.createBiquadFilter();
    roarFilter.type = 'lowpass';
    roarFilter.frequency.setValueAtTime(420, now);
    roarFilter.Q.setValueAtTime(1.1, now);

    const roarGain = this.ctx.createGain();
    roarGain.gain.setValueAtTime(0, now);

    roarOsc1.connect(roarFilter);
    roarOsc2.connect(roarFilter);
    roarFilter.connect(roarGain);
    roarGain.connect(this.flightBusGain);

    // 2. Broadband exhaust & atmospheric wind loop
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = this.createPinkNoiseBuffer(this.ctx, 2.5);
    noiseSource.loop = true;

    const noiseLowpass = this.ctx.createBiquadFilter();
    noiseLowpass.type = 'lowpass';
    noiseLowpass.frequency.setValueAtTime(520, now);

    const noiseRoarGain = this.ctx.createGain();
    noiseRoarGain.gain.setValueAtTime(0, now);

    const windBandpass = this.ctx.createBiquadFilter();
    windBandpass.type = 'bandpass';
    windBandpass.frequency.setValueAtTime(640, now);
    windBandpass.Q.setValueAtTime(1.8, now);

    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0, now);

    noiseSource.connect(noiseLowpass);
    noiseLowpass.connect(noiseRoarGain);
    noiseRoarGain.connect(this.flightBusGain);

    noiseSource.connect(windBandpass);
    windBandpass.connect(windGain);
    windGain.connect(this.flightBusGain);

    // 3. Cockpit internal pressurized hull hum
    const cabinHumOsc = this.ctx.createOscillator();
    cabinHumOsc.type = 'sine';
    cabinHumOsc.frequency.setValueAtTime(118, now);

    const cabinHumGain = this.ctx.createGain();
    cabinHumGain.gain.setValueAtTime(0, now);
    cabinHumOsc.connect(cabinHumGain);
    cabinHumGain.connect(this.flightBusGain);

    // 4. Deep-space harmonic ambient pad (routed to ambience/music channel)
    const spacePadOsc1 = this.ctx.createOscillator();
    spacePadOsc1.type = 'sine';
    spacePadOsc1.frequency.setValueAtTime(146.83, now); // D3

    const spacePadOsc2 = this.ctx.createOscillator();
    spacePadOsc2.type = 'triangle';
    spacePadOsc2.frequency.setValueAtTime(220.0, now); // A3

    const padFilter = this.ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.setValueAtTime(480, now);

    const spacePadGain = this.ctx.createGain();
    spacePadGain.gain.setValueAtTime(0, now);

    spacePadOsc1.connect(padFilter);
    spacePadOsc2.connect(padFilter);
    padFilter.connect(spacePadGain);
    spacePadGain.connect(this.ambienceGain);

    roarOsc1.start(now);
    roarOsc2.start(now);
    noiseSource.start(now);
    cabinHumOsc.start(now);
    spacePadOsc1.start(now);
    spacePadOsc2.start(now);

    this.flightRig = {
      roarOsc1,
      roarOsc2,
      roarGain,
      roarFilter,
      noiseSource,
      noiseLowpass,
      noiseRoarGain,
      windBandpass,
      windGain,
      cabinHumOsc,
      cabinHumGain,
      spacePadOsc1,
      spacePadOsc2,
      spacePadGain
    };
    return this.flightRig;
  }

  /**
   * Synchronizes the continuous Web Audio spacecraft soundscape smoothly with live flight state,
   * planet atmosphere, velocity, and camera perspective (cockpit vs external chase).
   * Never stops or resets playback during camera switches!
   */
  public updateShuttleFlightAudio(input: ShuttleAudioInput) {
    if (this.isMuted && !this.flightRig) return;

    const target = computeShuttleFlightAudioTarget(input);
    if (!target.isActive && !this.flightRig) return;

    const rig = this.ensureFlightRig();
    if (!rig || !this.ctx) return;

    const now = this.ctx.currentTime;
    const smoothTau = 0.08;

    rig.roarOsc1.frequency.setTargetAtTime(target.subBassFreqHz, now, 0.1);
    rig.roarOsc2.frequency.setTargetAtTime(target.subBassFreqHz * 1.49, now, 0.1);
    rig.roarFilter.frequency.setTargetAtTime(target.lowpassCutoffHz, now, smoothTau);
    rig.roarGain.gain.setTargetAtTime(target.mainRoarGain * 0.24, now, smoothTau);

    rig.noiseLowpass.frequency.setTargetAtTime(target.lowpassCutoffHz * 1.35, now, smoothTau);
    rig.noiseRoarGain.gain.setTargetAtTime(target.mainRoarGain * 0.42, now, smoothTau);

    // Mars thin wind sounds whisper-high; Earth sounds fuller
    const windCenterFreq = input.planet === 'mars' ? 920 : 520;
    rig.windBandpass.frequency.setTargetAtTime(windCenterFreq, now, 0.12);
    rig.windGain.gain.setTargetAtTime(target.windHissGain * 0.38, now, smoothTau);

    rig.cabinHumGain.gain.setTargetAtTime(target.cabinHumGain * 0.22, now, smoothTau);
    rig.spacePadGain.gain.setTargetAtTime(target.spacePadGain * 0.16, now, 0.25);

    // Trigger subtle crisp RCS reaction thruster puff pulses when RCS activity peaks
    const msNow = performance.now();
    if (target.rcsBurstLevel > 0.1 && msNow - this.lastRcsBurstMs > 950) {
      this.lastRcsBurstMs = msNow;
      this.playRcsBurst(target.rcsBurstLevel, target.isCockpit);
    }
  }

  public playRcsBurst(level = 0.25, isCockpit = true) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.flightBusGain) return;

    const now = this.ctx.currentTime;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createPinkNoiseBuffer(this.ctx, 0.35);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isCockpit ? 420 : 1250, now);
    filter.Q.setValueAtTime(1.4, now);

    const gain = this.ctx.createGain();
    const peak = Math.min(0.28, Math.max(0.05, level * 0.65));
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.flightBusGain);

    noise.start(now);
    noise.stop(now + 0.24);
  }

  public playIgnitionTransient(isCockpit = true) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.flightBusGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(36, now);
    osc.frequency.exponentialRampToValueAtTime(68, now + 0.65);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isCockpit ? 380 : 1100, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(isCockpit ? 0.26 : 0.42, now + 0.14);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.flightBusGain);
    osc.start(now);
    osc.stop(now + 0.9);
  }

  // --- SOUND EFFECTS ---

  public playFootstep(planet: 'earth' | 'moon' | 'mars') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    let baseFreq = 90 + Math.random() * 20;
    let filterFreq = 300;

    if (planet === 'mars') {
      baseFreq = 130 + Math.random() * 30;
      filterFreq = 550;
    } else if (planet === 'earth') {
      baseFreq = 160 + Math.random() * 35;
      filterFreq = 750;
    }

    osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.12);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.28, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.13);
  }

  public playJump() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.22);

    gain.gain.setValueAtTime(0.32, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.26);
  }

  public playLand() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(25, this.ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.36, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.19);
  }

  // Legacy one-shot retro thruster sweep (used by historical mission landers)
  public playLandingThruster(durationSec: number = 3.5) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.flightBusGain) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(55, this.ctx.currentTime);
    osc1.frequency.linearRampToValueAtTime(42, this.ctx.currentTime + durationSec);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(82, this.ctx.currentTime);
    osc2.frequency.linearRampToValueAtTime(60, this.ctx.currentTime + durationSec);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, this.ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(95, this.ctx.currentTime + durationSec);

    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.4);
    gain.gain.setValueAtTime(0.28, now + durationSec - 0.5);
    gain.gain.linearRampToValueAtTime(0.001, now + durationSec);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.flightBusGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + durationSec + 0.05);
    osc2.stop(now + durationSec + 0.05);
  }

  // Touchdown impact with pneumatic leg strut compression & cabin depressurization bleed
  public playTouchdown() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.flightBusGain) return;

    const now = this.ctx.currentTime;

    // 1. Low strut thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(118, now);
    osc.frequency.exponentialRampToValueAtTime(22, now + 0.55);

    gain.gain.setValueAtTime(0.58, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(this.flightBusGain);
    osc.start(now);
    osc.stop(now + 0.65);

    // 2. Hydraulic strut hiss
    const hiss = this.ctx.createBufferSource();
    hiss.buffer = this.createPinkNoiseBuffer(this.ctx, 0.6);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1450, now);
    filter.frequency.exponentialRampToValueAtTime(520, now + 0.45);
    const hissGain = this.ctx.createGain();
    hissGain.gain.setValueAtTime(0.001, now + 0.04);
    hissGain.gain.linearRampToValueAtTime(0.18, now + 0.09);
    hissGain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);

    hiss.connect(filter);
    filter.connect(hissGain);
    hissGain.connect(this.flightBusGain);
    hiss.start(now);
    hiss.stop(now + 0.56);
  }

  // Astronaut Field Scanner Beam Audio Sweep
  public playFieldScanner() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(850, now + 0.35);

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  // Geological Sample Collected Chime
  public playSampleCollect() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      const t = this.ctx!.currentTime + idx * 0.07;
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.26, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  }

  public playPing() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
  }

  public playDiscoveryInspect() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const chord = [523.25, 659.25, 783.99, 1046.5];
    chord.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.06);

      gain.gain.setValueAtTime(0, this.ctx!.currentTime + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.24, this.ctx!.currentTime + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.06 + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(this.ctx!.currentTime + idx * 0.06);
      osc.stop(this.ctx!.currentTime + idx * 0.06 + 0.45);
    });
  }

  public playCollect() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.07);

      gain.gain.setValueAtTime(0, this.ctx!.currentTime + i * 0.07);
      gain.gain.linearRampToValueAtTime(0.28, this.ctx!.currentTime + i * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + i * 0.07 + 0.5);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(this.ctx!.currentTime + i * 0.07);
      osc.stop(this.ctx!.currentTime + i * 0.07 + 0.55);
    });
  }

  public playMissionComplete() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [392.0, 523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.1);

      gain.gain.setValueAtTime(0, this.ctx!.currentTime + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.32, this.ctx!.currentTime + i * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + i * 0.1 + 0.8);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(this.ctx!.currentTime + i * 0.1);
      osc.stop(this.ctx!.currentTime + i * 0.1 + 0.85);
    });
  }

  public playQuizSuccess() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    [587.33, 880].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0.24, this.ctx!.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + i * 0.1 + 0.4);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(this.ctx!.currentTime + i * 0.1);
      osc.stop(this.ctx!.currentTime + i * 0.1 + 0.42);
    });
  }

  public playQuizFail() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    // Warm supportive chime rather than harsh buzzer
    [349.23, 329.63].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + i * 0.14);
      gain.gain.setValueAtTime(0.16, this.ctx!.currentTime + i * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + i * 0.14 + 0.35);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(this.ctx!.currentTime + i * 0.14);
      osc.stop(this.ctx!.currentTime + i * 0.14 + 0.38);
    });
  }

  // --- PROCEDURAL AMBIENCE ---

  public startAmbience(type: 'universe' | PlanetId) {
    this.stopAmbience();
    this.initContext();
    if (!this.ctx || !this.ambienceGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    if (type === 'mars') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(64, this.ctx.currentTime);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(145, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    } else if (type === 'moon') {
      // Quiet lunar stillness with ultra-soft subharmonic presence
      osc.type = 'sine';
      osc.frequency.setValueAtTime(48, this.ctx.currentTime);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(95, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110, this.ctx.currentTime);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(310, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambienceGain);

    osc.start();
    this.ambienceNodes = { osc, gain };
  }

  public stopAmbience() {
    if (this.ambienceNodes) {
      try {
        this.ambienceNodes.osc.stop();
        this.ambienceNodes.osc.disconnect();
        this.ambienceNodes.gain.disconnect();
      } catch {
        // Safe disposal
      }
      this.ambienceNodes = null;
    }
  }
}

export const soundManager = new SoundManager();
