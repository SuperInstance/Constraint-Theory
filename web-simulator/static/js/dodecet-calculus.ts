/**
 * Dodecet Calculus Operations
 *
 * Implements differentiation, integration, and gradient operations
 * using 12-bit dodecet geometric encoding.
 *
 * Mathematical foundations:
 * - Differentiation: Finite difference approximation with dodecet precision
 * - Integration: Simpson's rule with visual area representation
 * - Gradient: Multivariable calculus with dodecet vector encoding
 */

import { Dodecet, DodecetArray } from './dodecet';
import { DodecetVector3D, DodecetTransform3D } from './dodecet-geometric';

// ===================================
// DODECET DIFFERENTIATION
// ===================================

/**
 * Differentiation using dodecet-encoded functions
 *
 * Uses finite difference methods with geometric precision.
 * The step size h is encoded as a dodecet for consistent precision.
 */
export class DodecetDifferentiation {
  private static readonly DEFAULT_H = 0.001; // Step size for differentiation

  /**
   * Compute derivative at a point using central difference
   *
   * f'(x) = (f(x+h) - f(x-h)) / 2h
   */
  static derivative(
    f: (x: number) => number,
    x: number,
    h: number = this.DEFAULT_H
  ): { value: number; encodedSlope: Dodecet; error: number } {
    // Compute forward and backward values
    const fx_plus_h = f(x + h);
    const fx_minus_h = f(x - h);

    // Central difference
    const derivative = (fx_plus_h - fx_minus_h) / (2 * h);

    // Encode slope as dodecet (normalized to [0, 1])
    // Map from [-maxSlope, maxSlope] to [0, 4095]
    const maxSlope = 10; // Maximum expected slope
    const normalizedSlope = Math.max(0, Math.min(1, (derivative + maxSlope) / (2 * maxSlope)));
    const encodedSlope = new Dodecet(Math.round(normalizedSlope * 4095));

    // Estimate truncation error (O(h^2) for central difference)
    const error = Math.abs(h * h * this.estimateThirdDerivative(f, x, h));

    return {
      value: derivative,
      encodedSlope,
      error
    };
  }

  /**
   * Compute derivative array over an interval
   *
   * Returns array of derivatives with dodecet encoding
   */
  static derivativeArray(
    f: (x: number) => number,
    xStart: number,
    xEnd: number,
    steps: number = 100
  ): Array<{
    x: number;
    y: number;
    derivative: number;
    encodedDerivative: Dodecet;
    error: number;
  }> {
    const results = [];
    const dx = (xEnd - xStart) / steps;
    const h = dx / 10; // Step size proportional to grid

    for (let i = 0; i <= steps; i++) {
      const x = xStart + i * dx;
      const y = f(x);
      const { value, encodedSlope, error } = this.derivative(f, x, h);

      results.push({
        x,
        y,
        derivative: value,
        encodedDerivative: encodedSlope,
        error
      });
    }

    return results;
  }

  /**
   * Compute tangent line at a point
   *
   * Returns points along the tangent line with dodecet encoding
   */
  static tangentLine(
    f: (x: number) => number,
    x0: number,
    xRange: number = 1,
    steps: number = 20
  ): {
    slope: number;
    intercept: number;
    points: Array<{ x: Dodecet; y: Dodecet }>;
    encodedSlope: Dodecet;
  } {
    const { value: slope } = this.derivative(f, x0);
    const y0 = f(x0);
    const intercept = y0 - slope * x0;

    const points: Array<{ x: Dodecet; y: Dodecet }> = [];
    const xMin = x0 - xRange;
    const xMax = x0 + xRange;
    const dx = (xMax - xMin) / steps;

    // Normalize to [0, 1] for dodecet encoding
    const normalizeX = (x: number) => (x - xMin) / (xMax - xMin);
    const yMin = slope * xMin + intercept;
    const yMax = slope * xMax + intercept;
    const normalizeY = (y: number) => (y - Math.min(yMin, yMax)) / (Math.abs(yMax - yMin) + 0.001);

    for (let i = 0; i <= steps; i++) {
      const x = xMin + i * dx;
      const y = slope * x + intercept;
      points.push({
        x: new Dodecet(Math.round(normalizeX(x) * 4095)),
        y: new Dodecet(Math.round(normalizeY(y) * 4095))
      });
    }

    // Encode slope
    const maxSlope = 10;
    const normalizedSlope = Math.max(0, Math.min(1, (slope + maxSlope) / (2 * maxSlope)));
    const encodedSlope = new Dodecet(Math.round(normalizedSlope * 4095));

    return {
      slope,
      intercept,
      points,
      encodedSlope
    };
  }

  /**
   * Estimate third derivative for error analysis
   */
  private static estimateThirdDerivative(
    f: (x: number) => number,
    x: number,
    h: number
  ): number {
    const f2h = f(x + 2 * h);
    const fh = f(x + h);
    const f0 = f(x);
    const fmh = f(x - h);
    const fm2h = f(x - 2 * h);

    // Third derivative approximation
    return (f2h - 2 * fh + 2 * fmh - fm2h) / (2 * Math.pow(h, 3));
  }

  /**
   * Visualize derivative as tangent vector
   */
  static tangentVector(
    f: (x: number) => number,
    x: number,
    scale: number = 0.5
  ): DodecetVector3D {
    const { value: slope } = this.derivative(f, x);
    const y = f(x);

    // Create unit tangent vector
    const magnitude = Math.sqrt(1 + slope * slope);
    const dx = scale / magnitude;
    const dy = (slope * scale) / magnitude;

    // Encode as dodecet vector
    return new DodecetVector3D(
      Math.round((dx + 1) * 2048),
      Math.round((dy + 1) * 2048),
      0x800 // Z = center
    );
  }
}

// ===================================
// DODECET INTEGRATION
// ===================================

/**
 * Integration using Simpson's rule with dodecet encoding
 *
 * Provides visual area representation and error estimation.
 */
export class DodecetIntegration {
  /**
   * Integrate function using Simpson's rule
   *
   * Integral = (h/3) * [f(x0) + 4*f(x1) + 2*f(x2) + 4*f(x3) + ... + f(xn)]
   */
  static integrate(
    f: (x: number) => number,
    a: number,
    b: number,
    n: number = 100 // Must be even for Simpson's rule
  ): {
    value: number;
    encodedArea: Dodecet;
    error: number;
    strips: Array<{
      x: number;
      y: number;
      weight: number;
      encodedX: Dodecet;
      encodedY: Dodecet;
    }>;
  } {
    // Ensure n is even
    if (n % 2 !== 0) n++;

    const h = (b - a) / n;
    let sum = f(a) + f(b);

    const strips: Array<{
      x: number;
      y: number;
      weight: number;
      encodedX: Dodecet;
      encodedY: Dodecet;
    }> = [];

    // Add first and last points
    strips.push({
      x: a,
      y: f(a),
      weight: 1,
      encodedX: new Dodecet(0),
      encodedY: new Dodecet(Math.round(Math.max(0, f(a)) * 4095))
    });

    // Simpson's rule coefficients
    for (let i = 1; i < n; i++) {
      const x = a + i * h;
      const y = f(x);
      const weight = i % 2 === 0 ? 2 : 4;
      sum += weight * y;

      strips.push({
        x,
        y,
        weight,
        encodedX: new Dodecet(Math.round((i / n) * 4095)),
        encodedY: new Dodecet(Math.round(Math.max(0, y) * 4095))
      });
    }

    // Add last point
    strips.push({
      x: b,
      y: f(b),
      weight: 1,
      encodedX: new Dodecet(0xFFF),
      encodedY: new Dodecet(Math.round(Math.max(0, f(b)) * 4095))
    });

    const integral = (h / 3) * sum;

    // Encode area (normalized to [0, 1])
    // Assume max area is width * maxHeight
    const maxHeight = 2; // Expected maximum function value
    const maxArea = (b - a) * maxHeight;
    const normalizedArea = Math.max(0, Math.min(1, integral / maxArea));
    const encodedArea = new Dodecet(Math.round(normalizedArea * 4095));

    // Error estimate for Simpson's rule: O(h^4)
    const fourthDerivative = this.estimateFourthDerivative(f, a, b);
    const error = Math.abs(((b - a) * Math.pow(h, 4) / 180) * fourthDerivative);

    return {
      value: integral,
      encodedArea,
      error,
      strips
    };
  }

  /**
   * Compute integral visualization data
   *
   * Returns data for drawing the area under the curve
   */
  static integralVisualization(
    f: (x: number) => number,
    a: number,
    b: number,
    steps: number = 50
  ): {
    curvePoints: Array<{ x: Dodecet; y: Dodecet }>;
    areaPolygon: Array<{ x: Dodecet; y: Dodecet }>;
    riemannStrips: Array<{
      x1: Dodecet;
      y1: Dodecet;
      x2: Dodecet;
      y2: Dodecet;
      height: Dodecet;
    }>;
  } {
    const curvePoints: Array<{ x: Dodecet; y: Dodecet }> = [];
    const areaPolygon: Array<{ x: Dodecet; y: Dodecet }> = [];
    const riemannStrips: Array<{
      x1: Dodecet;
      y1: Dodecet;
      x2: Dodecet;
      y2: Dodecet;
      height: Dodecet;
    }> = [];

    const dx = (b - a) / steps;
    const maxY = 2; // Normalize y values

    // Build curve points
    for (let i = 0; i <= steps; i++) {
      const x = a + i * dx;
      const y = f(x);
      curvePoints.push({
        x: new Dodecet(Math.round((i / steps) * 4095)),
        y: new Dodecet(Math.round(Math.max(0, y / maxY) * 4095))
      });
    }

    // Build area polygon (starts at origin, follows curve, returns to origin)
    areaPolygon.push({ x: new Dodecet(0), y: new Dodecet(0) });
    areaPolygon.push(...curvePoints);
    areaPolygon.push({ x: new Dodecet(0xFFF), y: new Dodecet(0) });

    // Build Riemann strips for visualization
    for (let i = 0; i < steps; i++) {
      const x1 = a + i * dx;
      const x2 = a + (i + 1) * dx;
      const y = f((x1 + x2) / 2); // Midpoint rule

      riemannStrips.push({
        x1: new Dodecet(Math.round((i / steps) * 4095)),
        y1: new Dodecet(0),
        x2: new Dodecet(Math.round(((i + 1) / steps) * 4095)),
        y2: new Dodecet(Math.round(Math.max(0, y / maxY) * 4095)),
        height: new Dodecet(Math.round(Math.max(0, y / maxY) * 4095))
      });
    }

    return {
      curvePoints,
      areaPolygon,
      riemannStrips
    };
  }

  /**
   * Estimate fourth derivative for error analysis
   */
  private static estimateFourthDerivative(
    f: (x: number) => number,
    a: number,
    b: number
  ): number {
    // Sample at midpoint
    const x = (a + b) / 2;
    const h = 0.001;

    const f2h = f(x + 2 * h);
    const fh = f(x + h);
    const f0 = f(x);
    const fmh = f(x - h);
    const fm2h = f(x - 2 * h);

    // Fourth derivative approximation
    return (f2h - 4 * fh + 6 * f0 - 4 * fmh + fm2h) / Math.pow(h, 4);
  }

  /**
   * Accumulated integral (antiderivative visualization)
   */
  static accumulatedIntegral(
    f: (x: number) => number,
    a: number,
    b: number,
    steps: number = 100
  ): Array<{
    x: number;
    accumulated: number;
    encodedAccumulated: Dodecet;
  }> {
    const results: Array<{
      x: number;
      accumulated: number;
      encodedAccumulated: Dodecet;
    }> = [];

    const dx = (b - a) / steps;
    let accumulated = 0;

    // Estimate max accumulated value for normalization
    const maxAccumulated = (b - a) * 2; // Rough estimate

    for (let i = 0; i <= steps; i++) {
      const x = a + i * dx;

      if (i > 0) {
        // Trapezoid rule for accumulation
        const y1 = f(a + (i - 1) * dx);
        const y2 = f(x);
        accumulated += (y1 + y2) * dx / 2;
      }

      const normalized = Math.max(0, Math.min(1, (accumulated + maxAccumulated) / (2 * maxAccumulated)));
      results.push({
        x,
        accumulated,
        encodedAccumulated: new Dodecet(Math.round(normalized * 4095))
      });
    }

    return results;
  }
}

// ===================================
// DODECET GRADIENT
// ===================================

/**
 * Gradient computation for multivariable calculus
 *
 * Computes partial derivatives and gradient vectors
 * using dodecet encoding.
 */
export class DodecetGradient {
  private static readonly DEFAULT_H = 0.001;

  /**
   * Compute gradient of a scalar field
   *
   * grad(f) = (df/dx, df/dy, df/dz)
   */
  static gradient(
    f: (x: number, y: number, z: number) => number,
    point: { x: number; y: number; z: number },
    h: number = this.DEFAULT_H
  ): {
    grad: DodecetVector3D;
    partials: { dx: number; dy: number; dz: number };
    magnitude: number;
  } {
    const { x, y, z } = point;

    // Compute partial derivatives using central difference
    const dx = (f(x + h, y, z) - f(x - h, y, z)) / (2 * h);
    const dy = (f(x, y + h, z) - f(x, y - h, z)) / (2 * h);
    const dz = (f(x, y, z + h) - f(x, y, z - h)) / (2 * h);

    // Create gradient vector
    const grad = new DodecetVector3D(
      Math.round((dx + 1) * 2048),
      Math.round((dy + 1) * 2048),
      Math.round((dz + 1) * 2048)
    );

    const magnitude = Math.sqrt(dx * dx + dy * dy + dz * dz);

    return {
      grad,
      partials: { dx, dy, dz },
      magnitude
    };
  }

  /**
   * Compute gradient field over a 2D grid
   *
   * Returns grid of gradient vectors with dodecet encoding
   */
  static gradientField2D(
    f: (x: number, y: number) => number,
    xRange: { min: number; max: number },
    yRange: { min: number; max: number },
    resolution: number = 20
  ): Array<{
    x: number;
    y: number;
    fx: number;
    gradX: number;
    gradY: number;
    encodedGrad: { x: Dodecet; y: Dodecet };
    magnitude: number;
  }> {
    const results = [];
    const dx = (xRange.max - xRange.min) / resolution;
    const dy = (yRange.max - yRange.min) / resolution;
    const h = Math.min(dx, dy) / 10;

    for (let i = 0; i <= resolution; i++) {
      for (let j = 0; j <= resolution; j++) {
        const x = xRange.min + i * dx;
        const y = yRange.min + j * dy;

        const f3d = (x: number, y: number, _z: number) => f(x, y);
        const { grad, partials, magnitude } = this.gradient(f3d, { x, y, z: 0 }, h);

        results.push({
          x,
          y,
          fx: f(x, y),
          gradX: partials.dx,
          gradY: partials.dy,
          encodedGrad: {
            x: grad.getX(),
            y: grad.getY()
          },
          magnitude
        });
      }
    }

    return results;
  }

  /**
   * Directional derivative
   *
   * D_u f = grad(f) . u
   */
  static directionalDerivative(
    f: (x: number, y: number, z: number) => number,
    point: { x: number; y: number; z: number },
    direction: DodecetVector3D,
    h: number = this.DEFAULT_H
  ): {
    value: number;
    encodedValue: Dodecet;
  } {
    const { grad, partials } = this.gradient(f, point, h);

    // Normalize direction vector
    const dir = direction.normalize();
    const [ux, uy, uz] = dir.toArray();

    // Directional derivative = grad . u
    const value = partials.dx * ux + partials.dy * uy + partials.dz * uz;

    // Encode (normalized to [0, 1])
    const maxValue = 10; // Expected maximum
    const normalized = Math.max(0, Math.min(1, (value + maxValue) / (2 * maxValue)));
    const encodedValue = new Dodecet(Math.round(normalized * 4095));

    return {
      value,
      encodedValue
    };
  }

  /**
   * Compute level curves (contours) for visualization
   *
   * Returns points along level curves for given values
   */
  static levelCurves(
    f: (x: number, y: number) => number,
    xRange: { min: number; max: number },
    yRange: { min: number; max: number },
    levels: number[],
    resolution: number = 100
  ): Map<number, Array<{ x: Dodecet; y: Dodecet }>> {
    const curves = new Map<number, Array<{ x: Dodecet; y: Dodecet }>>();

    const dx = (xRange.max - xRange.min) / resolution;
    const dy = (yRange.max - yRange.min) / resolution;

    for (const level of levels) {
      const points: Array<{ x: Dodecet; y: Dodecet }> = [];

      // March along grid to find contour points
      for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
          const x = xRange.min + i * dx;
          const y = yRange.min + j * dy;

          // Check if level crosses this cell
          const corners = [
            f(x, y),
            f(x + dx, y),
            f(x, y + dy),
            f(x + dx, y + dy)
          ];

          const minCorner = Math.min(...corners);
          const maxCorner = Math.max(...corners);

          if (level >= minCorner && level <= maxCorner) {
            // Interpolate to find contour point
            const centerX = x + dx / 2;
            const centerY = y + dy / 2;

            points.push({
              x: new Dodecet(Math.round(((centerX - xRange.min) / (xRange.max - xRange.min)) * 4095)),
              y: new Dodecet(Math.round(((centerY - yRange.min) / (yRange.max - yRange.min)) * 4095))
            });
          }
        }
      }

      curves.set(level, points);
    }

    return curves;
  }

  /**
   * Compute Hessian matrix (second partial derivatives)
   *
   * H = [[d2f/dx2, d2f/dxdy], [d2f/dydx, d2f/dy2]]
   */
  static hessian(
    f: (x: number, y: number) => number,
    point: { x: number; y: number },
    h: number = this.DEFAULT_H
  ): {
    matrix: [[number, number], [number, number]];
    encodedMatrix: [[Dodecet, Dodecet], [Dodecet, Dodecet]];
    determinant: number;
    trace: number;
  } {
    const { x, y } = point;

    // Second partial derivatives
    const fxx = (f(x + h, y) - 2 * f(x, y) + f(x - h, y)) / (h * h);
    const fyy = (f(x, y + h) - 2 * f(x, y) + f(x, y - h)) / (h * h);
    const fxy = (f(x + h, y + h) - f(x + h, y - h) - f(x - h, y + h) + f(x - h, y - h)) / (4 * h * h);

    const matrix: [[number, number], [number, number]] = [
      [fxx, fxy],
      [fxy, fyy]
    ];

    // Encode matrix elements
    const maxVal = 10;
    const encode = (v: number) => new Dodecet(Math.round(Math.max(0, Math.min(1, (v + maxVal) / (2 * maxVal))) * 4095));

    const encodedMatrix: [[Dodecet, Dodecet], [Dodecet, Dodecet]] = [
      [encode(fxx), encode(fxy)],
      [encode(fxy), encode(fyy)]
    ];

    const determinant = fxx * fyy - fxy * fxy;
    const trace = fxx + fyy;

    return {
      matrix,
      encodedMatrix,
      determinant,
      trace
    };
  }

  /**
   * Find critical points (where gradient is zero)
   *
   * Uses gradient descent to locate minima
   */
  static findCriticalPoints(
    f: (x: number, y: number) => number,
    xRange: { min: number; max: number },
    yRange: { min: number; max: number },
    startPoints: Array<{ x: number; y: number }>,
    maxIterations: number = 100,
    learningRate: number = 0.01
  ): Array<{
    x: number;
    y: number;
    type: 'minimum' | 'maximum' | 'saddle';
    encodedPoint: { x: Dodecet; y: Dodecet };
  }> {
    const criticalPoints: Array<{
      x: number;
      y: number;
      type: 'minimum' | 'maximum' | 'saddle';
      encodedPoint: { x: Dodecet; y: Dodecet };
    }> = [];

    const f3d = (x: number, y: number, _z: number) => f(x, y);

    for (const start of startPoints) {
      let x = start.x;
      let y = start.y;

      // Gradient descent
      for (let i = 0; i < maxIterations; i++) {
        const { partials, magnitude } = this.gradient(f3d, { x, y, z: 0 });

        if (magnitude < 0.0001) break;

        x -= learningRate * partials.dx;
        y -= learningRate * partials.dy;

        // Clamp to range
        x = Math.max(xRange.min, Math.min(xRange.max, x));
        y = Math.max(yRange.min, Math.min(yRange.max, y));
      }

      // Classify critical point using Hessian
      const { determinant, trace } = this.hessian(f, { x, y });

      let type: 'minimum' | 'maximum' | 'saddle';
      if (determinant > 0 && trace > 0) {
        type = 'minimum';
      } else if (determinant > 0 && trace < 0) {
        type = 'maximum';
      } else {
        type = 'saddle';
      }

      // Encode point
      const encodedX = new Dodecet(Math.round(((x - xRange.min) / (xRange.max - xRange.min)) * 4095));
      const encodedY = new Dodecet(Math.round(((y - yRange.min) / (yRange.max - yRange.min)) * 4095));

      criticalPoints.push({
        x,
        y,
        type,
        encodedPoint: { x: encodedX, y: encodedY }
      });
    }

    return criticalPoints;
  }
}

// ===================================
// EXPORTS
// ===================================

export { Dodecet, DodecetArray, DodecetVector3D, DodecetTransform3D };
