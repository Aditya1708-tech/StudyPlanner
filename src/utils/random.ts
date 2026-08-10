/**
 * Simple hashing function (DJB2 algorithm) to produce a deterministic hash number from a string.
 */
export const getSimpleHash = (str: string): number => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
};

/**
 * Seeded Pseudo-Random Number Generator (PRNG) for deterministic randomness.
 */
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  /**
   * Generates a pseudo-random floating-point value between 0 (inclusive) and 1 (exclusive).
   */
  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  /**
   * Generates a pseudo-random integer between min (inclusive) and max (exclusive).
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  /**
   * Deterministically selects a random element from an array.
   */
  select<T>(arr: T[] | readonly T[]): T {
    return arr[this.nextInt(0, arr.length)];
  }

  /**
   * Deterministically shuffles an array.
   */
  shuffle<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
