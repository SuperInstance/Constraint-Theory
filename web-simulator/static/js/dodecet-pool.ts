/**
 * Dodecet Object Pool
 *
 * Reduces GC pressure by pooling Dodecet instances
 */

import { Dodecet } from './dodecet';

/**
 * Object pool for Dodecet instances
 */
export class DodecetPool {
  private _pool: Dodecet[] = [];
  private readonly _maxPoolSize: number;

  constructor(maxPoolSize = 1000) {
    this._maxPoolSize = maxPoolSize;
  }

  /**
   * Acquire a dodecet from the pool
   */
  acquire(value?: number): Dodecet {
    if (this._pool.length > 0) {
      const dodecet = this._pool.pop()!;
      if (value !== undefined) {
        // Reinitialize with new value
        Object.assign(dodecet, { value: value & 0xFFF });
      }
      return dodecet;
    }
    return new Dodecet(value ?? 0);
  }

  /**
   * Release a dodecet back to the pool
   */
  release(dodecet: Dodecet): void {
    if (this._pool.length < this._maxPoolSize) {
      this._pool.push(dodecet);
    }
  }

  /**
   * Release multiple dodecets
   */
  releaseArray(dodecets: Dodecet[]): void {
    for (let i = 0; i < dodecets.length && this._pool.length < this._maxPoolSize; i++) {
      this._pool.push(dodecets[i]);
    }
  }

  /**
   * Get pool statistics
   */
  getStats(): { size: number; maxSize: number } {
    return {
      size: this._pool.length,
      maxSize: this._maxPoolSize
    };
  }

  /**
   * Clear the pool
   */
  clear(): void {
    this._pool = [];
  }
}

/**
 * Global dodecet pool instance
 */
export const globalDodecetPool = new DodecetPool();

/**
 * Convenience function to acquire from global pool
 */
export function acquireDodecet(value?: number): Dodecet {
  return globalDodecetPool.acquire(value);
}

/**
 * Convenience function to release to global pool
 */
export function releaseDodecet(dodecet: Dodecet): void {
  globalDodecetPool.release(dodecet);
}
