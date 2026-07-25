/**
 * Deterministic pseudo-random number generator (mulberry32) so mock GIS
 * data is stable across reloads/builds instead of reshuffling every
 * render — makes screenshots, demos, and future snapshot tests reliable.
 */
export function createSeededRandom(seed: number) {
  let state = seed
  return function random(): number {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randomInRange(random: () => number, min: number, max: number): number {
  return min + random() * (max - min)
}

export function pickRandom<T>(random: () => number, items: readonly T[]): T {
  return items[Math.floor(random() * items.length)]!
}
