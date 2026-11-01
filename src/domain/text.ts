/** Générateur pseudo-aléatoire injectable (tests déterministes). */
export type Rng = () => number;

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function randomInt(maxExclusive: number, rng: Rng = Math.random): number {
  return Math.floor(rng() * maxExclusive);
}

export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(i + 1, rng);
    const tmp = out[i] as T;
    out[i] = out[j] as T;
    out[j] = tmp;
  }
  return out;
}

export function pickOne<T>(items: readonly T[], rng: Rng = Math.random): T | undefined {
  return items[randomInt(items.length, rng)];
}

/** Minuscules, sans accents ni ponctuation : sert à comparer des mots. */
export function normalizeWord(value: string | null | undefined): string {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function squashSpaces(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m < 10 ? '0' : ''}${m}:${r < 10 ? '0' : ''}${r}`;
}

export function plural(n: number, one: string, many: string): string {
  return n > 1 ? many : one;
}
