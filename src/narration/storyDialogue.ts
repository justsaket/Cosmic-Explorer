import { HabitablePlanetId } from '../shuttle/shuttleTravelState';

export type StoryPriority = 'low' | 'normal' | 'high';

export interface StoryQueueItem {
  id: number;
  text: string;
  priority: StoryPriority;
  dedupeKey?: string;
  durationMs?: number;
}

export interface VoiceCandidateLike {
  name: string;
  lang: string;
  localService?: boolean;
  default?: boolean;
}

const FEMALE_VOICE_PATTERNS = [
  'aria',
  'jenny',
  'samantha',
  'victoria',
  'karen',
  'serena',
  'moira',
  'tessa',
  'zira',
  'susan',
  'hazel',
  'libby',
  'sonia',
  'emma',
  'olivia',
  'ava',
  'allison',
  'fiona',
  'kate',
  'martha',
  'catherine',
  'siri female',
  'google uk english female',
  'google us english',
  'female',
  'natural'
];

const MALE_VOICE_PATTERNS = [
  'daniel',
  'george',
  'alex',
  'fred',
  'david',
  'mark',
  'paul',
  'oliver',
  'arthur',
  'ryan',
  'guy',
  'tom',
  'james',
  'christopher',
  'eric',
  'steffan',
  'aaron',
  'rishi',
  'male',
  'google uk english male'
];

const HINDI_FEMALE_VOICE_PATTERNS = [
  'swara',
  'lekha',
  'heera',
  'kalpana',
  'neerja',
  'ananya',
  'google हिन्दी',
  'hindi',
  'female',
  'natural'
];

const HINDI_MALE_VOICE_PATTERNS = ['madhur', 'hemant', 'prabhat', 'male'];

/**
 * Scores a SpeechSynthesisVoice for a warm, clear, expressive female storyteller ('en' or 'hi').
 * Explicitly penalizes known male voices and prioritizes expressive female voice profiles.
 */
export function scoreVoiceForFemaleStoryteller(
  voice: VoiceCandidateLike,
  langCode: 'en' | 'hi' = 'en'
): number {
  const lang = (voice.lang || '').toLowerCase();
  const name = (voice.name || '').toLowerCase();

  if (langCode === 'hi') {
    if (!lang.startsWith('hi') && !name.includes('hindi') && !name.includes('हिन्दी')) {
      return -1000;
    }
    let score = 30;
    if (lang === 'hi-in') score += 15;
    for (const male of HINDI_MALE_VOICE_PATTERNS) {
      if (name.includes(male)) {
        score -= 140;
        break;
      }
    }
    for (let i = 0; i < HINDI_FEMALE_VOICE_PATTERNS.length; i++) {
      if (name.includes(HINDI_FEMALE_VOICE_PATTERNS[i])) {
        score += 120 - Math.min(40, i * 2);
        break;
      }
    }
    if (name.includes('online') || name.includes('neural') || name.includes('natural')) {
      score += 18;
    }
    return score;
  }

  if (!lang.startsWith('en')) return -1000;

  let score = 20;

  if (lang === 'en-us' || lang === 'en-gb') score += 10;

  // Strong rejection of male voices so storyteller remains consistently female
  for (const male of MALE_VOICE_PATTERNS) {
    if (name.includes(male)) {
      score -= 140;
      break;
    }
  }

  for (let i = 0; i < FEMALE_VOICE_PATTERNS.length; i++) {
    if (name.includes(FEMALE_VOICE_PATTERNS[i])) {
      // Earlier candidates (Aria, Jenny, Samantha, Victoria...) score highest
      score += 120 - Math.min(40, i * 2);
      break;
    }
  }

  if (name.includes('online') || name.includes('neural') || name.includes('enhanced')) {
    score += 18;
  }

  return score;
}

export function pickBestFemaleStorytellerVoice<T extends VoiceCandidateLike>(
  voices: T[],
  preferredVoiceName?: string | null,
  langCode: 'en' | 'hi' = 'en'
): T | null {
  if (!voices.length) return null;

  if (preferredVoiceName && langCode === 'en') {
    const exact = voices.find(v => v.name === preferredVoiceName);
    if (exact && scoreVoiceForFemaleStoryteller(exact, langCode) > -50) {
      return exact;
    }
  }

  const matching =
    langCode === 'hi'
      ? voices.filter(v => {
          const l = (v.lang || '').toLowerCase();
          const n = (v.name || '').toLowerCase();
          return l.startsWith('hi') || n.includes('hindi') || n.includes('हिन्दी');
        })
      : voices.filter(v => (v.lang || '').toLowerCase().startsWith('en'));

  if (langCode === 'hi' && matching.length === 0) {
    return null;
  }

  const pool = matching.length > 0 ? matching : voices;

  let best: T | null = null;
  let bestScore = -Infinity;
  for (const voice of pool) {
    const sc = scoreVoiceForFemaleStoryteller(voice, langCode);
    if (sc > bestScore) {
      bestScore = sc;
      best = voice;
    }
  }
  return best;
}

/**
 * Computes comfortable caption reading duration in ms when speech synthesis is muted
 * or unavailable in headless browsers.
 */
export function estimateStoryDurationMs(text: string, speedMultiplier = 1.0): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const baseMs = Math.max(2800, Math.min(12500, words * 330 + 1100));
  return Math.round(baseMs / Math.max(0.6, Math.min(1.6, speedMultiplier)));
}

/**
 * Pure priority queue helper preventing overlapping storyteller lines and rapid repeats.
 */
export class StoryDialogueQueue {
  private queue: StoryQueueItem[] = [];
  private cooldownMap: Map<string, number> = new Map();
  private seq = 1;

  public shouldAccept(dedupeKey: string | undefined, nowMs: number, cooldownMs = 6000): boolean {
    if (!dedupeKey) return true;
    const prev = this.cooldownMap.get(dedupeKey);
    if (prev !== undefined && nowMs - prev < cooldownMs) {
      return false;
    }
    this.cooldownMap.set(dedupeKey, nowMs);
    return true;
  }

  public enqueue(
    text: string,
    priority: StoryPriority,
    dedupeKey?: string,
    nowMs = Date.now(),
    cooldownMs = 5500
  ): { item: StoryQueueItem | null; interruptCurrent: boolean } {
    const clean = text.trim();
    if (!clean) return { item: null, interruptCurrent: false };
    if (!this.shouldAccept(dedupeKey, nowMs, cooldownMs)) {
      return { item: null, interruptCurrent: false };
    }

    const item: StoryQueueItem = {
      id: this.seq++,
      text: clean,
      priority,
      dedupeKey
    };

    if (priority === 'high') {
      // High-priority flight/quiz beat clears stale low/normal chatter and interrupts cleanly
      this.queue = this.queue.filter(q => q.priority === 'high');
      this.queue.push(item);
      return { item, interruptCurrent: true };
    }

    // Cap pending queue at 2 items so captions never lag far behind gameplay
    if (this.queue.length >= 2) {
      this.queue.shift();
    }
    this.queue.push(item);
    return { item, interruptCurrent: false };
  }

  public dequeueNext(): StoryQueueItem | null {
    return this.queue.shift() || null;
  }

  public clear(): void {
    this.queue = [];
  }

  public peekCount(): number {
    return this.queue.length;
  }
}

// --- EXPRESSIVE FEMALE STORYTELLER DIALOGUE LIBRARY ---

function pickVariant(options: string[], seedHint: number): string {
  const idx = Math.abs(Math.floor(seedHint)) % options.length;
  return options[idx];
}

export function getPlanetDisplayName(planet: HabitablePlanetId): string {
  if (planet === 'moon') return 'the Moon';
  if (planet === 'mars') return 'Mars';
  return 'Earth';
}

export function getBoardingStoryLine(planet: HabitablePlanetId, variant = 0): string {
  const world = getPlanetDisplayName(planet);
  return pickVariant(
    [
      `Stepping aboard the shuttle on ${world}. Take your seat in the cockpit and pick where our story takes us next.`,
      `Hatch sealing nicely. Welcome to the flight deck—choose your next destination across the stars whenever you're ready.`
    ],
    variant
  );
}

export function getDestinationConfirmLine(dest: HabitablePlanetId, variant = 0): string {
  if (dest === 'moon') {
    return pickVariant(
      [
        'Trajectory locked for the Moon! Settle back—those dusty grey plains and ancient craters are waiting for us.',
        'Lunar course plotted and confirmed. Strap in tight as our engines spin up for the Moon.'
      ],
      variant
    );
  }
  if (dest === 'mars') {
    return pickVariant(
      [
        'Mars awaits! Plotting an interplanetary burn toward Jezero Crater and its rust-red horizon.',
        'Course set for the Red Planet. Ready your visor for that amber Martian sky.'
      ],
      variant
    );
  }
  return pickVariant(
    [
      'Heading home to Earth! Guiding us gracefully back toward Cape Canaveral and blue skies.',
      'Return course to Earth confirmed. Let us ride the stars back to Launch Pad 39B.'
    ],
    variant
  );
}

export function getTakeoffStoryLine(origin: HabitablePlanetId, dest: HabitablePlanetId): string {
  const from = getPlanetDisplayName(origin);
  const to = getPlanetDisplayName(dest);
  return `Main engines roaring to life! Lifting clear of ${from} now—next stop, ${to}. Switch between Cockpit and External cameras anytime you want a fresh perspective.`;
}

export function getCruiseStoryLine(origin: HabitablePlanetId, dest: HabitablePlanetId): string {
  const to = getPlanetDisplayName(dest);
  if (origin === 'earth' && dest === 'moon') {
    return `Look out through the stars—we're gliding across the quiet expanse between Earth and the Moon, leaving every blue ocean far behind.`;
  }
  if (dest === 'mars') {
    return `Deep space unfolds all around us. Somewhere ahead in this velvet dark lies Mars, glowing softly like an ember.`;
  }
  return `Zero-gravity cruise feels so peaceful, doesn't it? Keep watching the viewport as ${to} draws closer.`;
}

export function getApproachStoryLine(dest: HabitablePlanetId): string {
  if (dest === 'moon') {
    return `There she is—the Moon's scarred crust filling our windshield. Firing thrusters gently to enter lunar descent.`;
  }
  if (dest === 'mars') {
    return `Look at that warm Martian crescent rising ahead! Retro-thrusters armed as we dip toward Jezero Crater.`;
  }
  return `Welcome home sight—Earth's shimmering blue halo is right in front of us. Preparing for final approach.`;
}

export function getLandingStoryLine(dest: HabitablePlanetId): string {
  if (dest === 'moon') {
    return `Gentle touchdown on the Moon! Dust settles swiftly in the airless stillness. Whenever you're ready, open the hatch and feel that light one-sixth gravity.`;
  }
  if (dest === 'mars') {
    return `Touchdown confirmed in Jezero Crater! Listen to that thin Martian wind whisper outside the hull. Open the airlock when you're ready to step onto Mars.`;
  }
  return `Home sweet Earth—we've touched down smoothly at Kennedy Space Center! Step outside anytime you'd like to stretch your boots.`;
}

export function getDisembarkStoryLine(planet: HabitablePlanetId): string {
  if (planet === 'moon') {
    return `First breath of lunar adventure—notice how quietly your boots meet this ancient silver dust.`;
  }
  if (planet === 'mars') {
    return `Out onto the red regolith! Take a moment to soak in Mount Sharp rising on the Martian horizon.`;
  }
  return `Back on solid Florida concrete. Look around the pad whenever you're ready for your next launch.`;
}

export function getScannerReactionLine(planet: HabitablePlanetId): string {
  if (planet === 'moon') {
    return `Nice scan! You're reading undisturbed anorthosite crust older than Earth's oldest oceans.`;
  }
  if (planet === 'mars') {
    return `Scanner sweeping smoothly—iron-rich dust and ancient lakebed minerals tell Mars's watery past.`;
  }
  return `Field scanner active—comparing Earth's coastal geology as our mission baseline.`;
}

export function getSampleReactionLine(planet: HabitablePlanetId): string {
  if (planet === 'moon') {
    return `Wonderful specimen collected! That lunar rock is a tiny time capsule from the early Solar System.`;
  }
  if (planet === 'mars') {
    return `Specimen secured! Every pinch of Martian soil helps scientists piece together an ancient wet world.`;
  }
  return `Sample logged safely into your field pack—great eye, Explorer!`;
}

export function getRoverStoryLine(entering: boolean, planet: HabitablePlanetId): string {
  if (entering) {
    return planet === 'moon'
      ? `Hopping into the lunar rover! Let's kick up some grey regolith across the plains.`
      : planet === 'mars'
      ? `Six wheels rolling on Mars! Great way to cover serious crater ground.`
      : `Rover systems engaged—enjoy the ride around the launch apron.`;
  }
  return `Parking the rover safely and hopping back out on foot.`;
}

export function getQuizFeedbackLine(input: {
  isCorrect: boolean;
  explanation: string;
  funFact: string;
}): string {
  if (input.isCorrect) {
    return `Spot on, Explorer! ${input.explanation} Fun little secret: ${input.funFact}`;
  }
  return `Ooh, good try—not quite that one! Here's what's happening: ${input.explanation}`;
}
