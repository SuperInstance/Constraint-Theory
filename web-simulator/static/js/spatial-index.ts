/**
 * Spatial Index for 3D Geometric Queries
 *
 * Optimized spatial partitioning for fast proximity queries
 */

import { DodecetVector3D } from './dodecet-geometric';

/**
 * Spatial index using uniform grid partitioning
 */
export class SpatialIndex {
  private _cells: Map<string, DodecetVector3D[]> = new Map();
  private readonly _cellSize: number;

  constructor(cellSize = 0.1) {
    this._cellSize = cellSize;
  }

  /**
   * Insert a point into the spatial index
   */
  insert(point: DodecetVector3D): void {
    const key = this._getCellKey(point);
    let cell = this._cells.get(key);

    if (!cell) {
      cell = [];
      this._cells.set(key, cell);
    }

    cell.push(point);
  }

  /**
   * Remove a point from the spatial index
   */
  remove(point: DodecetVector3D): void {
    const key = this._getCellKey(point);
    const cell = this._cells.get(key);

    if (cell) {
      const index = cell.indexOf(point);
      if (index !== -1) {
        cell.splice(index, 1);

        // Clean up empty cells
        if (cell.length === 0) {
          this._cells.delete(key);
        }
      }
    }
  }

  /**
   * Query all points within a radius
   */
  queryRadius(center: DodecetVector3D, radius: number): DodecetVector3D[] {
    const results: DodecetVector3D[] = [];
    const [cx, cy, cz] = center.toArray();
    const radiusSquared = radius * radius;

    // Calculate cell range to check
    const cellRadius = Math.ceil(radius / this._cellSize);
    const minCellX = Math.floor((cx - radius) / this._cellSize);
    const maxCellX = Math.floor((cx + radius) / this._cellSize);
    const minCellY = Math.floor((cy - radius) / this._cellSize);
    const maxCellY = Math.floor((cy + radius) / this._cellSize);
    const minCellZ = Math.floor((cz - radius) / this._cellSize);
    const maxCellZ = Math.floor((cz + radius) / this._cellSize);

    // Check all cells in range
    for (let gx = minCellX; gx <= maxCellX; gx++) {
      for (let gy = minCellY; gy <= maxCellY; gy++) {
        for (let gz = minCellZ; gz <= maxCellZ; gz++) {
          const key = `${gx},${gy},${gz}`;
          const cell = this._cells.get(key);

          if (cell) {
            for (const point of cell) {
              const distSquared = point.distanceToSquared(center);
              if (distSquared <= radiusSquared) {
                results.push(point);
              }
            }
          }
        }
      }
    }

    return results;
  }

  /**
   * Find nearest neighbor
   */
  findNearest(center: DodecetVector3D, maxRadius = Infinity): DodecetVector3D | null {
    let nearest: DodecetVector3D | null = null;
    let minDistSquared = maxRadius * maxRadius;

    const candidates = this.queryRadius(center, maxRadius);

    for (const point of candidates) {
      if (point === center) continue;

      const distSquared = point.distanceToSquared(center);
      if (distSquared < minDistSquared) {
        minDistSquared = distSquared;
        nearest = point;
      }
    }

    return nearest;
  }

  /**
   * Clear all points from the index
   */
  clear(): void {
    this._cells.clear();
  }

  /**
   * Get index statistics
   */
  getStats(): { cellCount: number; pointCount: number; cellSize: number } {
    let pointCount = 0;
    for (const cell of this._cells.values()) {
      pointCount += cell.length;
    }

    return {
      cellCount: this._cells.size,
      pointCount,
      cellSize: this._cellSize
    };
  }

  /**
   * Get cell key for a point
   */
  private _getCellKey(point: DodecetVector3D): string {
    const [x, y, z] = point.toArray();
    const gx = Math.floor(x / this._cellSize);
    const gy = Math.floor(y / this._cellSize);
    const gz = Math.floor(z / this._cellSize);
    return `${gx},${gy},${gz}`;
  }
}

/**
 * Extended DodecetVector3D with cached squared distance
 */
declare module './dodecet-geometric' {
  interface DodecetVector3D {
    distanceToSquared(other: DodecetVector3D): number;
  }
}

// Add distanceToSquared method to DodecetVector3D prototype
DodecetVector3D.prototype.distanceToSquared = function(other: DodecetVector3D): number {
  const [a1, a2, a3] = this.toArray();
  const [b1, b2, b3] = other.toArray();
  const dx = a1 - b1;
  const dy = a2 - b2;
  const dz = a3 - b3;
  return dx * dx + dy * dy + dz * dz;
};
