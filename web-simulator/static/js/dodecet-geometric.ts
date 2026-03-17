/**
 * Dodecet Geometric Primitives
 *
 * 3D geometric operations using 12-bit dodecet encoding.
 * Demonstrates precision advantages over 8-bit and float32 encoding.
 *
 * Point3D: 3 dodecets (9 hex digits, 36 bits total)
 * Vector3D: 3 dodecets with direction and magnitude
 * Transform3D: 4x4 matrix with dodecet precision
 */

import { Dodecet, DodecetArray } from './dodecet';

// ===================================
// DODECET VECTOR3D
// ===================================

export class DodecetVector3D {
  private x: Dodecet;
  private y: Dodecet;
  private z: Dodecet;

  constructor(x: Dodecet | number, y: Dodecet | number, z: Dodecet | number) {
    this.x = x instanceof Dodecet ? x : new Dodecet(x);
    this.y = y instanceof Dodecet ? y : new Dodecet(y);
    this.z = z instanceof Dodecet ? z : new Dodecet(z);
  }

  /**
   * Create from hex values
   */
  static fromHex(x: number, y: number, z: number): DodecetVector3D {
    return new DodecetVector3D(
      Dodecet.fromHex(x),
      Dodecet.fromHex(y),
      Dodecet.fromHex(z)
    );
  }

  /**
   * Create from array
   */
  static fromArray(arr: [number, number, number]): DodecetVector3D {
    return new DodecetVector3D(arr[0], arr[1], arr[2]);
  }

  /**
   * Zero vector
   */
  static zero(): DodecetVector3D {
    return new DodecetVector3D(0, 0, 0);
  }

  /**
   * Unit vector along X axis
   */
  static unitX(): DodecetVector3D {
    return new DodecetVector3D(0xFFF, 0, 0); // Max X
  }

  /**
   * Unit vector along Y axis
   */
  static unitY(): DodecetVector3D {
    return new DodecetVector3D(0, 0xFFF, 0); // Max Y
  }

  /**
   * Unit vector along Z axis
   */
  static unitZ(): DodecetVector3D {
    return new DodecetVector3D(0, 0, 0xFFF); // Max Z
  }

  /**
   * Get components
   */
  getX(): Dodecet { return this.x; }
  getY(): Dodecet { return this.y; }
  getZ(): Dodecet { return this.z; }

  /**
   * Convert to normalized array [-1, 1]
   */
  toArray(): [number, number, number] {
    return [
      this.x.toSigned() / 2048,
      this.y.toSigned() / 2048,
      this.z.toSigned() / 2048
    ];
  }

  /**
   * Convert to unsigned array [0, 1]
   * toUnsignedArray(): [number, number, number] {
    return [this.x.normalize(), this.y.normalize(), this.z.normalize()];
  }

  /**
   * Calculate magnitude (length)
   */
  magnitude(): number {
    const [x, y, z] = this.toArray();
    return Math.sqrt(x * x + y * y + z * z);
  }

  /**
   * Calculate squared magnitude (faster, no sqrt)
   */
  magnitudeSquared(): number {
    const [x, y, z] = this.toArray();
    return x * x + y * y + z * z;
  }

  /**
   * Normalize to unit vector
   */
  normalize(): DodecetVector3D {
    const mag = this.magnitude();
    if (mag === 0) return DodecetVector3D.zero();

    const [x, y, z] = this.toArray();
    return new DodecetVector3D(
      Math.round((x / mag) * 2048 + 2048),
      Math.round((y / mag) * 2048 + 2048),
      Math.round((z / mag) * 2048 + 2048)
    );
  }

  /**
   * Dot product with another vector
   */
  dot(other: DodecetVector3D): number {
    const [a1, a2, a3] = this.toArray();
    const [b1, b2, b3] = other.toArray();
    return a1 * b1 + a2 * b2 + a3 * b3;
  }

  /**
   * Cross product with another vector
   */
  cross(other: DodecetVector3D): DodecetVector3D {
    const [a1, a2, a3] = this.toArray();
    const [b1, b2, b3] = other.toArray();

    return new DodecetVector3D(
      Math.round((a2 * b3 - a3 * b2) * 2048 + 2048),
      Math.round((a3 * b1 - a1 * b3) * 2048 + 2048),
      Math.round((a1 * b2 - a2 * b1) * 2048 + 2048)
    );
  }

  /**
   * Add another vector
   */
  add(other: DodecetVector3D): DodecetVector3D {
    return new DodecetVector3D(
      this.x.add(other.x),
      this.y.add(other.y),
      this.z.add(other.z)
    );
  }

  /**
   * Subtract another vector
   */
  sub(other: DodecetVector3D): DodecetVector3D {
    return new DodecetVector3D(
      this.x.sub(other.x),
      this.y.sub(other.y),
      this.z.sub(other.z)
    );
  }

  /**
   * Scale by scalar
   */
  scale(scalar: number): DodecetVector3D {
    return new DodecetVector3D(
      Math.round(this.x.toNumber() * scalar),
      Math.round(this.y.toNumber() * scalar),
      Math.round(this.z.toNumber() * scalar)
    );
  }

  /**
   * Distance to another vector
   */
  distanceTo(other: DodecetVector3D): number {
    return this.sub(other).magnitude();
  }

  /**
   * Angle between this and another vector (in radians)
   */
  angleTo(other: DodecetVector3D): number {
    const dot = this.dot(other);
    const mags = this.magnitude() * other.magnitude();
    if (mags === 0) return 0;
    return Math.acos(Math.max(-1, Math.min(1, dot / mags)));
  }

  /**
   * Linear interpolation to another vector
   */
  lerp(other: DodecetVector3D, t: number): DodecetVector3D {
    return this.scale(1 - t).add(other.scale(t));
  }

  /**
   * Convert to hex string (9 hex digits)
   */
  toHexString(): string {
    return `${this.x.toHexString()}${this.y.toHexString()}${this.z.toHexString()}`;
  }

  /**
   * Convert to spaced hex string (e.g., "ABC DEF 123")
   */
  toSpacedHexString(): string {
    return `${this.x.toHexString()} ${this.y.toHexString()} ${this.z.toHexString()}`;
  }

  /**
   * Clone
   */
  clone(): DodecetVector3D {
    return new DodecetVector3D(this.x.clone(), this.y.clone(), this.z.clone());
  }

  /**
   * String representation
   */
  toString(): string {
    const [x, y, z] = this.toArray();
    return `DodecetVector3D(${x.toFixed(3)}, ${y.toFixed(3)}, ${z.toFixed(3)})`;
  }
}

// ===================================
// DODECET TRANSFORM3D
// ===================================

export class DodecetTransform3D {
  // 4x4 transformation matrix stored as 16 dodecets
  // Column-major order for compatibility with WebGL
  private matrix: Dodecet[];

  constructor() {
    // Initialize to identity matrix
    this.matrix = [
      new Dodecet(0xFFF), new Dodecet(0), new Dodecet(0), new Dodecet(0),     // Column 0
      new Dodecet(0), new Dodecet(0xFFF), new Dodecet(0), new Dodecet(0),     // Column 1
      new Dodecet(0), new Dodecet(0), new Dodecet(0xFFF), new Dodecet(0),     // Column 2
      new Dodecet(0), new Dodecet(0), new Dodecet(0), new Dodecet(0xFFF)      // Column 3
    ];
  }

  /**
   * Create from translation
   */
  static translation(x: number, y: number, z: number): DodecetTransform3D {
    const transform = new DodecetTransform3D();
    transform.matrix[12] = new Dodecet(Math.round((x + 1) * 2048));
    transform.matrix[13] = new Dodecet(Math.round((y + 1) * 2048));
    transform.matrix[14] = new Dodecet(Math.round((z + 1) * 2048));
    return transform;
  }

  /**
   * Create from rotation (axis-angle)
   */
  static rotation(axis: DodecetVector3D, angle: number): DodecetTransform3D {
    const transform = new DodecetTransform3D();
    const [ax, ay, az] = axis.normalize().toArray();

    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const t = 1 - c;

    // Rotation matrix
    const m00 = t * ax * ax + c;
    const m01 = t * ax * ay - s * az;
    const m02 = t * ax * az + s * ay;
    const m10 = t * ax * ay + s * az;
    const m11 = t * ay * ay + c;
    const m12 = t * ay * az - s * ax;
    const m20 = t * ax * az - s * ay;
    const m21 = t * ay * az + s * ax;
    const m22 = t * az * az + c;

    transform.matrix[0] = new Dodecet(Math.round((m00 + 1) * 2048));
    transform.matrix[1] = new Dodecet(Math.round((m01 + 1) * 2048));
    transform.matrix[2] = new Dodecet(Math.round((m02 + 1) * 2048));
    transform.matrix[4] = new Dodecet(Math.round((m10 + 1) * 2048));
    transform.matrix[5] = new Dodecet(Math.round((m11 + 1) * 2048));
    transform.matrix[6] = new Dodecet(Math.round((m12 + 1) * 2048));
    transform.matrix[8] = new Dodecet(Math.round((m20 + 1) * 2048));
    transform.matrix[9] = new Dodecet(Math.round((m21 + 1) * 2048));
    transform.matrix[10] = new Dodecet(Math.round((m22 + 1) * 2048));

    return transform;
  }

  /**
   * Create from scale
   */
  static scale(sx: number, sy: number, sz: number): DodecetTransform3D {
    const transform = new DodecetTransform3D();
    transform.matrix[0] = new Dodecet(Math.round(sx * 2048));
    transform.matrix[5] = new Dodecet(Math.round(sy * 2048));
    transform.matrix[10] = new Dodecet(Math.round(sz * 2048));
    return transform;
  }

  /**
   * Create from Euler angles (XYZ order)
   */
  static fromEuler(x: number, y: number, z: number): DodecetTransform3D {
    const transform = new DodecetTransform3D();

    const cx = Math.cos(x), sx = Math.sin(x);
    const cy = Math.cos(y), sy = Math.sin(y);
    const cz = Math.cos(z), sz = Math.sin(z);

    // Combined rotation matrix
    const m00 = cy * cz;
    const m01 = -cy * sz;
    const m02 = sy;
    const m10 = sx * sy * cz + cx * sz;
    const m11 = -sx * sy * sz + cx * cz;
    const m12 = -sx * cy;
    const m20 = -cx * sy * cz + sx * sz;
    const m21 = cx * sy * sz + sx * cz;
    const m22 = cx * cy;

    transform.matrix[0] = new Dodecet(Math.round((m00 + 1) * 2048));
    transform.matrix[1] = new Dodecet(Math.round((m01 + 1) * 2048));
    transform.matrix[2] = new Dodecet(Math.round((m02 + 1) * 2048));
    transform.matrix[4] = new Dodecet(Math.round((m10 + 1) * 2048));
    transform.matrix[5] = new Dodecet(Math.round((m11 + 1) * 2048));
    transform.matrix[6] = new Dodecet(Math.round((m12 + 1) * 2048));
    transform.matrix[8] = new Dodecet(Math.round((m20 + 1) * 2048));
    transform.matrix[9] = new Dodecet(Math.round((m21 + 1) * 2048));
    transform.matrix[10] = new Dodecet(Math.round((m22 + 1) * 2048));

    return transform;
  }

  /**
   * Multiply with another transform
   */
  multiply(other: DodecetTransform3D): DodecetTransform3D {
    const result = new DodecetTransform3D();

    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 4; row++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          const a = this.toNormalizedArray()[k * 4 + row];
          const b = other.toNormalizedArray()[col * 4 + k];
          sum += a * b;
        }
        result.matrix[col * 4 + row] = new Dodecet(Math.round(sum * 4095));
      }
    }

    return result;
  }

  /**
   * Transform a point
   */
  transformPoint(point: DodecetVector3D): DodecetVector3D {
    const [x, y, z] = point.toArray();
    const m = this.toNormalizedArray();

    const nx = m[0] * x + m[4] * y + m[8] * z + m[12];
    const ny = m[1] * x + m[5] * y + m[9] * z + m[13];
    const nz = m[2] * x + m[6] * y + m[10] * z + m[14];

    return new DodecetVector3D(
      Math.round((nx + 1) * 2048),
      Math.round((ny + 1) * 2048),
      Math.round((nz + 1) * 2048)
    );
  }

  /**
   * Transform a direction vector (ignores translation)
   */
  transformDirection(dir: DodecetVector3D): DodecetVector3D {
    const [x, y, z] = dir.toArray();
    const m = this.toNormalizedArray();

    const nx = m[0] * x + m[4] * y + m[8] * z;
    const ny = m[1] * x + m[5] * y + m[9] * z;
    const nz = m[2] * x + m[6] * y + m[10] * z;

    return new DodecetVector3D(
      Math.round((nx + 1) * 2048),
      Math.round((ny + 1) * 2048),
      Math.round((nz + 1) * 2048)
    );
  }

  /**
   * Invert the transform
   */
  invert(): DodecetTransform3D {
    const m = this.toNormalizedArray();
    const result = new DodecetTransform3D();

    // Calculate inverse (simplified for affine transforms)
    const det = m[0] * (m[5] * m[10] - m[6] * m[9]) -
                m[1] * (m[4] * m[10] - m[6] * m[8]) +
                m[2] * (m[4] * m[9] - m[5] * m[8]);

    if (Math.abs(det) < 0.0001) {
      return result; // Return identity if singular
    }

    const invDet = 1 / det;

    result.matrix[0] = new Dodecet(Math.round(((m[5] * m[10] - m[6] * m[9]) * invDet + 1) * 2048));
    result.matrix[1] = new Dodecet(Math.round(((m[2] * m[9] - m[1] * m[10]) * invDet + 1) * 2048));
    result.matrix[2] = new Dodecet(Math.round(((m[1] * m[6] - m[2] * m[5]) * invDet + 1) * 2048));
    result.matrix[4] = new Dodecet(Math.round(((m[6] * m[8] - m[4] * m[10]) * invDet + 1) * 2048));
    result.matrix[5] = new Dodecet(Math.round(((m[0] * m[10] - m[2] * m[8]) * invDet + 1) * 2048));
    result.matrix[6] = new Dodecet(Math.round(((m[2] * m[4] - m[0] * m[6]) * invDet + 1) * 2048));
    result.matrix[8] = new Dodecet(Math.round(((m[4] * m[9] - m[5] * m[8]) * invDet + 1) * 2048));
    result.matrix[9] = new Dodecet(Math.round(((m[1] * m[8] - m[0] * m[9]) * invDet + 1) * 2048));
    result.matrix[10] = new Dodecet(Math.round(((m[0] * m[5] - m[1] * m[4]) * invDet + 1) * 2048));

    // Translation
    result.matrix[12] = new Dodecet(Math.round((-(m[12] * result.toNormalizedArray()[0] +
                                                 m[13] * result.toNormalizedArray()[4] +
                                                 m[14] * result.toNormalizedArray()[8]) + 1) * 2048));
    result.matrix[13] = new Dodecet(Math.round((-(m[12] * result.toNormalizedArray()[1] +
                                                 m[13] * result.toNormalizedArray()[5] +
                                                 m[14] * result.toNormalizedArray()[9]) + 1) * 2048));
    result.matrix[14] = new Dodecet(Math.round((-(m[12] * result.toNormalizedArray()[2] +
                                                 m[13] * result.toNormalizedArray()[6] +
                                                 m[14] * result.toNormalizedArray()[10]) + 1) * 2048));

    return result;
  }

  /**
   * Convert to normalized array [0, 2]
   */
  toNormalizedArray(): number[] {
    return this.matrix.map(d => d.normalize() * 2);
  }

  /**
   * Convert to column-major Float32Array for WebGL
   */
  toFloat32Array(): Float32Array {
    return new Float32Array(this.toNormalizedArray().map(v => v - 1));
  }

  /**
   * Convert to hex string (48 hex digits for full matrix)
   */
  toHexString(): string {
    return this.matrix.map(d => d.toHexString()).join('');
  }

  /**
   * Convert to spaced hex string (4x4 grid)
   */
  toSpacedHexString(): string {
    let result = '';
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        result += this.matrix[col * 4 + row].toHexString();
        if (col < 3) result += ' ';
      }
      if (row < 3) result += '\n';
    }
    return result;
  }

  /**
   * Clone
   */
  clone(): DodecetTransform3D {
    const transform = new DodecetTransform3D();
    transform.matrix = this.matrix.map(d => d.clone());
    return transform;
  }

  /**
   * String representation
   */
  toString(): string {
    const m = this.toNormalizedArray();
    return `DodecetTransform3D(\n` +
      `  [${m[0].toFixed(3)}, ${m[4].toFixed(3)}, ${m[8].toFixed(3)}, ${m[12].toFixed(3)}],\n` +
      `  [${m[1].toFixed(3)}, ${m[5].toFixed(3)}, ${m[9].toFixed(3)}, ${m[13].toFixed(3)}],\n` +
      `  [${m[2].toFixed(3)}, ${m[6].toFixed(3)}, ${m[10].toFixed(3)}, ${m[14].toFixed(3)}],\n` +
      `  [${m[3].toFixed(3)}, ${m[7].toFixed(3)}, ${m[11].toFixed(3)}, ${m[15].toFixed(3)}]\n` +
      `)`;
  }
}

// ===================================
// GEOMETRIC COMPARISON UTILITIES
// ===================================

export class GeometricComparison {
  /**
   * Compare precision between dodecet, 8-bit, and float32
   */
  static comparePrecision(value: number): {
    dodecet: { value: number; error: number; hex: string };
    eightBit: { value: number; error: number; hex: string };
    float32: { value: number; error: number };
  } {
    // Dodecet encoding (12-bit)
    const dodecetValue = Math.round((value + 1) * 2048) / 2048 - 1;
    const dodecetError = Math.abs(value - dodecetValue);
    const dodecet = new Dodecet(Math.round((value + 1) * 2048) & 0xFFF);

    // 8-bit encoding
    const eightBitValue = Math.round((value + 1) * 128) / 128 - 1;
    const eightBitError = Math.abs(value - eightBitValue);
    const eightBitHex = Math.round((value + 1) * 128).toString(16).toUpperCase().padStart(2, '0');

    // Float32 encoding
    const float32Array = new Float32Array([value]);
    const float32Value = float32Array[0];
    const float32Error = Math.abs(value - float32Value);

    return {
      dodecet: {
        value: dodecetValue,
        error: dodecetError,
        hex: dodecet.toHexString()
      },
      eightBit: {
        value: eightBitValue,
        error: eightBitError,
        hex: eightBitHex
      },
      float32: {
        value: float32Value,
        error: float32Error
      }
    };
  }

  /**
   * Calculate precision improvement factor
   */
  static precisionImprovement(): {
    states: number;
    vs8Bit: number;
    vsFloat32: number;
  } {
    return {
      states: 4096,
      vs8Bit: 16, // 4096 / 256
      vsFloat32: 0.000244 // Approximate relative to float32's 23-bit mantissa
    };
  }

  /**
   * Generate comparison table data
   */
  static generateComparisonTable(samples: number = 10): Array<{
    original: number;
    dodecet: string;
    eightBit: string;
    dodecetError: number;
    eightBitError: number;
  }> {
    const results = [];

    for (let i = 0; i < samples; i++) {
      const value = (Math.random() * 2 - 1); // [-1, 1]
      const comparison = this.comparePrecision(value);

      results.push({
        original: value,
        dodecet: comparison.dodecet.hex,
        eightBit: comparison.eightBit.hex,
        dodecetError: comparison.dodecet.error,
        eightBitError: comparison.eightBit.error
      });
    }

    return results;
  }
}

// ===================================
// EXPORTS
// ===================================

export { Dodecet, DodecetArray, DodecetPoint3D } from './dodecet';
