import { soundManager } from '../audio/soundManager';
import {
  estimateStoryDurationMs,
  getLandingStoryLine,
  pickBestFemaleStorytellerVoice,
  StoryDialogueQueue,
  StoryPriority,
  StoryQueueItem
} from './storyDialogue';

export interface NarrationCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  onPause?: () => void;
  onResume?: () => void;
}

export interface SpeakOptions {
  priority?: StoryPriority;
  dedupeKey?: string;
  cooldownMs?: number;
  lang?: 'en' | 'hi';
  callbacks?: NarrationCallbacks;
}

export interface NarrationStatusSnapshot {
  isSpeaking: boolean;
  isPaused: boolean;
  isMuted: boolean;
  currentText: string;
}

export type CaptionListener = (caption: string | null) => void;
export type StatusListener = (status: NarrationStatusSnapshot) => void;

class NarrationManager {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;
  private isPaused = false;
  private masterMuted = false;
  private narrationMuted = false;
  private voices: SpeechSynthesisVoice[] = [];
  private currentText = '';
  private lastCompletedText = '';
  private rate = 0.96; // Expressive natural storyteller pacing
  private volume = 0.92;
  private preferredVoiceName: string | null = null;
  private callbacks: NarrationCallbacks = {};
  private captionListeners: Set<CaptionListener> = new Set();
  private statusListeners: Set<StatusListener> = new Set();
  private queue = new StoryDialogueQueue();
  private captionTimerId: ReturnType<typeof setTimeout> | null = null;
  private remainingCaptionMs = 0;
  private captionStartMs = 0;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    try {
      this.voices = this.synth.getVoices();
    } catch {
      this.voices = [];
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.voices.length) this.loadVoices();
    return this.voices.filter(v => v.lang.toLowerCase().startsWith('en'));
  }

  public setPreferredVoice(name: string | null) {
    this.preferredVoiceName = name;
  }

  public subscribeCaption(listener: CaptionListener): () => void {
    this.captionListeners.add(listener);
    listener(this.isSpeaking ? this.currentText : null);
    return () => {
      this.captionListeners.delete(listener);
    };
  }

  public subscribeStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.getStatus());
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private notifyCaption(caption: string | null) {
    this.captionListeners.forEach(listener => {
      try {
        listener(caption);
      } catch (err) {
        console.warn('Caption listener error:', err);
      }
    });
    this.notifyStatus();
  }

  private notifyStatus() {
    const snap = this.getStatus();
    this.statusListeners.forEach(listener => {
      try {
        listener(snap);
      } catch {
        // Safe ignore
      }
    });
  }

  private clearCaptionTimer() {
    if (this.captionTimerId !== null) {
      clearTimeout(this.captionTimerId);
      this.captionTimerId = null;
    }
  }

  private isAudioSilenced(): boolean {
    return this.masterMuted || this.narrationMuted || this.volume <= 0.01;
  }

  private syncDucking() {
    soundManager.setNarrationDucking(this.isSpeaking && !this.isPaused && !this.isAudioSilenced());
  }

  private itemLanguages: Map<number, 'en' | 'hi'> = new Map();
  private lastSpokenLang: 'en' | 'hi' = 'en';

  public speak(text: string, callbacksOrOptions?: NarrationCallbacks | SpeakOptions) {
    let options: SpeakOptions = {};
    if (callbacksOrOptions) {
      const maybeOpts = callbacksOrOptions as SpeakOptions;
      if (
        'priority' in maybeOpts ||
        'dedupeKey' in maybeOpts ||
        'callbacks' in maybeOpts ||
        'cooldownMs' in maybeOpts ||
        'lang' in maybeOpts
      ) {
        options = maybeOpts;
      } else {
        options = { priority: 'high', callbacks: callbacksOrOptions as NarrationCallbacks };
      }
    }

    const priority: StoryPriority = options.priority ?? 'high';
    const langCode: 'en' | 'hi' = options.lang ?? 'en';
    const { item, interruptCurrent } = this.queue.enqueue(
      text,
      priority,
      options.dedupeKey,
      Date.now(),
      options.cooldownMs ?? 5000
    );
    if (!item) return;

    this.itemLanguages.set(item.id, langCode);
    if (options.callbacks) {
      this.callbacks = options.callbacks;
    }

    if (interruptCurrent || !this.isSpeaking) {
      this.playItem(item);
    }
  }

  private playItem(item: StoryQueueItem) {
    this.cancelActiveUtteranceOnly();
    this.clearCaptionTimer();

    this.currentText = item.text;
    this.lastCompletedText = item.text;
    this.isSpeaking = true;
    this.isPaused = false;

    const estimatedMs = estimateStoryDurationMs(item.text, this.rate);
    this.remainingCaptionMs = estimatedMs;
    this.captionStartMs = Date.now();

    this.notifyCaption(item.text);
    this.syncDucking();
    this.callbacks.onStart?.();

    const finishItem = () => {
      this.clearCaptionTimer();
      this.currentUtterance = null;
      this.isSpeaking = false;
      this.isPaused = false;
      this.syncDucking();

      const next = this.queue.dequeueNext();
      if (next) {
        this.playItem(next);
        return;
      }

      this.currentText = '';
      this.notifyCaption(null);
      this.callbacks.onEnd?.();
    };

    // If narration voice is muted, master is muted, or Web Speech isn't available/populated,
    // keep synchronized HUD captions active cleanly on a pauseable timer!
    if (this.isAudioSilenced() || !this.synth) {
      this.captionTimerId = setTimeout(finishItem, estimatedMs);
      return;
    }

    const langCode: 'en' | 'hi' = this.itemLanguages.get(item.id) ?? 'en';
    this.itemLanguages.delete(item.id);
    this.lastSpokenLang = langCode;

    try {
      if (!this.voices.length) this.loadVoices();
      const femaleVoice = pickBestFemaleStorytellerVoice(
        this.voices,
        this.preferredVoiceName,
        langCode
      );

      // Headless environments (or missing Hindi TTS pack) run silent timed captions reliably
      if (!femaleVoice && (this.voices.length === 0 || langCode === 'hi')) {
        this.captionTimerId = setTimeout(finishItem, estimatedMs);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.lang = langCode === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = this.rate;
      utterance.volume = this.volume;
      // Expressive warm female storyteller inflection pitch
      utterance.pitch = 1.07;

      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      let settled = false;
      const safeFinish = () => {
        if (settled) return;
        settled = true;
        finishItem();
      };

      // Safety watchdog timer in case a browser speech engine drops onend
      this.captionTimerId = setTimeout(safeFinish, estimatedMs + 3500);

      utterance.onend = () => safeFinish();
      utterance.onerror = () => {
        // Fall back smoothly to remaining caption reading time instead of wiping subtitles abruptly
        if (settled) return;
        const elapsed = Date.now() - this.captionStartMs;
        const left = Math.max(1200, estimatedMs - elapsed);
        this.clearCaptionTimer();
        this.captionTimerId = setTimeout(safeFinish, left);
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    } catch {
      this.captionTimerId = setTimeout(finishItem, estimatedMs);
    }
  }

  private cancelActiveUtteranceOnly() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // Safe disposal
      }
    }
    this.currentUtterance = null;
  }

  public speakLandingWelcome(planet: 'moon' | 'mars' | 'earth', onEnd?: () => void) {
    this.speak(getLandingStoryLine(planet), {
      priority: 'high',
      dedupeKey: `landing_${planet}`,
      cooldownMs: 3000,
      callbacks: { onEnd }
    });
  }

  public pause() {
    if (!this.isSpeaking || this.isPaused) return;
    this.isPaused = true;
    const elapsed = Date.now() - this.captionStartMs;
    this.remainingCaptionMs = Math.max(900, this.remainingCaptionMs - elapsed);
    this.clearCaptionTimer();

    if (this.synth && !this.isAudioSilenced()) {
      try {
        this.synth.pause();
      } catch {
        // Safe ignore
      }
    }
    this.syncDucking();
    this.notifyStatus();
    this.callbacks.onPause?.();
  }

  public resume() {
    if (!this.isSpeaking || !this.isPaused) return;
    this.isPaused = false;
    this.captionStartMs = Date.now();

    const resumeTimer = () => {
      this.clearCaptionTimer();
      const finishAfterResume = () => {
        this.currentUtterance = null;
        this.isSpeaking = false;
        this.isPaused = false;
        this.syncDucking();
        const next = this.queue.dequeueNext();
        if (next) {
          this.playItem(next);
          return;
        }
        this.currentText = '';
        this.notifyCaption(null);
        this.callbacks.onEnd?.();
      };
      this.captionTimerId = setTimeout(
        finishAfterResume,
        this.isAudioSilenced() ? this.remainingCaptionMs : this.remainingCaptionMs + 3000
      );
    };

    if (this.synth && !this.isAudioSilenced() && this.currentUtterance) {
      try {
        this.synth.resume();
      } catch {
        // Safe ignore
      }
    }
    resumeTimer();
    this.syncDucking();
    this.notifyStatus();
    this.callbacks.onResume?.();
  }

  public stop() {
    this.queue.clear();
    this.clearCaptionTimer();
    this.cancelActiveUtteranceOnly();
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentText = '';
    this.syncDucking();
    this.notifyCaption(null);
  }

  public replay() {
    const textToReplay = this.currentText || this.lastCompletedText;
    if (textToReplay) {
      this.speak(textToReplay, {
        priority: 'high',
        lang: this.lastSpokenLang,
        callbacks: this.callbacks
      });
    }
  }

  public setRate(rate: number) {
    this.rate = Math.max(0.6, Math.min(1.6, rate));
    if (this.currentUtterance) {
      this.currentUtterance.rate = this.rate;
    }
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1.0, volume));
    if (this.currentUtterance) {
      this.currentUtterance.volume = this.volume;
    }
    this.syncDucking();
  }

  public setMuted(muted: boolean) {
    this.narrationMuted = muted;
    if (muted && this.synth) {
      // Silence spoken voice immediately, while keeping HUD caption timer running uninterrupted!
      try {
        this.synth.cancel();
      } catch {
        // Safe ignore
      }
      this.currentUtterance = null;
      if (this.isSpeaking && !this.isPaused) {
        this.clearCaptionTimer();
        const elapsed = Date.now() - this.captionStartMs;
        const left = Math.max(1200, this.remainingCaptionMs - elapsed);
        this.captionTimerId = setTimeout(() => {
          this.isSpeaking = false;
          const next = this.queue.dequeueNext();
          if (next) {
            this.playItem(next);
          } else {
            this.currentText = '';
            this.notifyCaption(null);
            this.callbacks.onEnd?.();
          }
        }, left);
      }
    }
    this.syncDucking();
    this.notifyStatus();
  }

  public setMasterMuted(muted: boolean) {
    this.masterMuted = muted;
    if (muted && this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // Safe ignore
      }
    }
    this.syncDucking();
    this.notifyStatus();
  }

  public getIsMuted(): boolean {
    return this.narrationMuted;
  }

  public getStatus(): NarrationStatusSnapshot {
    return {
      isSpeaking: this.isSpeaking,
      isPaused: this.isPaused,
      isMuted: this.narrationMuted || this.masterMuted,
      currentText: this.currentText
    };
  }
}

export const narrationManager = new NarrationManager();
