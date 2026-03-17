/**
 * TypeScript Definitions for Dodecet Geometric Primitives
 */

export { Dodecet, DodecetArray, DodecetPoint3D } from './dodecet';

// ===================================
// DODECET VECTOR3D
// ===================================

export class DodecetVector3D {
  constructor(x: Dodecet | number, y: Dodecet | number, z: Dodecet | number);

  static fromHex(x: number, y: number, z: number): DodecetVector3D;
  static fromArray(arr: [number, number, number]): DodecetVector3D;
  static zero(): DodecetVector3D;
  static unitX(): DodecetVector3D;
  static unitY(): DodecetVector3D;
  static unitZ(): DodecetVector3D;

  getX(): Dodecet;
  getY(): Dodecet;
  getZ(): Dodecet;

  toArray(): [number, number, number];
  toUnsignedArray(): [number, number, number];

  magnitude(): number;
  magnitudeSquared(): number;
  normalize(): DodecetVector3D;

  dot(other: DodecetVector3D): number;
  cross(other: DodecetVector3D): DodecetVector3D;

  add(other: DodecetVector3D): DodecetVector3D;
  sub(other: DodecetVector3D): DodecetVector3D;
  scale(scalar: number): DodecetVector3D;

  distanceTo(other: DodecetVector3D): number;
  angleTo(other: DodecetVector3D): number;
  lerp(other: DodecetVector3D, t: number): DodecetVector3D;

  toHexString(): string;
  toSpacedHexString(): string;
  clone(): DodecetVector3D;
  toString(): string;
}

// ===================================
// DODECET TRANSFORM3D
// ===================================

export class DodecetTransform3D {
  constructor();

  static translation(x: number, y: number, z: number): DodecetTransform3D;
  static rotation(axis: DodecetVector3D, angle: number): DodecetTransform3D;
  static scale(sx: number, sy: number, sz: number): DodecetTransform3D;
  static fromEuler(x: number, y: number, z: number): DodecetTransform3D;

  multiply(other: DodecetTransform3D): DodecetTransform3D;
  transformPoint(point: DodecetVector3D): DodecetVector3D;
  transformDirection(dir: DodecetVector3D): DodecetVector3D;
  invert(): DodecetTransform3D;

  toNormalizedArray(): number[];
  toFloat32Array(): Float32Array;

  toHexString(): string;
  toSpacedHexString(): string;
  clone(): DodecetTransform3D;
  toString(): string;
}

// ===================================
// GEOMETRIC COMPARISON
// ===================================

export class GeometricComparison {
  static comparePrecision(value: number): {
    dodecet: { value: number; error: number; hex: string };
    eightBit: { value: number; error: number; hex: string };
    float32: { value: number; error: number };
  };

  static precisionImprovement(): {
    states: number;
    vs8Bit: number;
    vsFloat32: number;
  };

  static generateComparisonTable(samples: number): Array<{
    original: number;
    dodecet: string;
    eightBit: string;
    dodecetError: number;
    eightBitError: number;
  }>;
}

// ===================================
// SIMULATOR INTEGRATIONS
// ===================================

export class PythagoreanDodecetIntegration {
  constructor();
  snapVector(inputX: number, inputY: number): {
    snapped: DodecetPoint3D;
    original: DodecetPoint3D;
    distance: number;
    hexEncoding: string;
  };
  getHexVisualization(): string;
}

export class RigidityDodecetIntegration {
  constructor();
  checkRigidity(): boolean;
  getEdgeHexEncoding(): string[];
}

export class HolonomyDodecetIntegration {
  constructor();
  transportVector(vector: DodecetVector3D): {
    final: DodecetVector3D;
    holonomy: number;
    hexPath: string;
  };
  getPathVisualization(): string;
}

export class EntropyDodecetIntegration {
  constructor();
  calculateEntropy(region: DodecetPoint3D[]): number;
  getStateSpaceHex(): string;
}

export class KDTreeDodecetIntegration {
  constructor();
  findNearest(query: DodecetPoint3D): {
    nearest: DodecetPoint3D;
    distance: number;
    hexEncoding: string;
  };
  getTreeVisualization(): string;
}

export class PermutationDodecetIntegration {
  constructor();
  applyPermutation(point: DodecetVector3D, index: number): DodecetVector3D;
  getGroupVisualization(): string;
}

export class OrigamiDodecetIntegration {
  constructor();
  foldPoint(point: DodecetPoint3D, foldIndex: number): DodecetPoint3D;
  getOrigamiVisualization(): string;
}

export class CellBotsDodecetIntegration {
  constructor();
  updateAgents(dt: number): void;
  getAgentVisualization(): string;
}

export class DodecetSimulatorIntegrator {
  constructor();

  getAllSimulations(): {
    pythagorean: string;
    rigidity: string;
    holonomy: string;
    entropy: string;
    kdtree: string;
    permutation: string;
    origami: string;
    cellbots: string;
  };

  getPrecisionSummary(): string;
}

// ===================================
// GEOMETRIC DEMO
// ===================================

export class GeometricDemo {
  constructor(canvasId: string);

  render(): void;

  private setupCanvas(): void;
  private setupControls(): void;
  private drawPoint3D(width: number, height: number): void;
  private drawVector3D(width: number, height: number): void;
  private drawTransform3D(width: number, height: number): void;
  private drawPrecisionComparison(width: number, height: number): void;
  private draw3DPoint(cx: number, cy: number, point: DodecetPoint3D): void;
  private draw3DVector(cx: number, cy: number, vector: DodecetVector3D): void;
}

export function initGeometricDemo(canvasId?: string): GeometricDemo;
