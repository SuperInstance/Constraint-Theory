/**
 * Dodecet Geometric Primitives Demo
 *
 * Interactive demonstration of Point3D, Vector3D, and Transform3D
 * with real-time hex encoding display and precision comparisons.
 */

import {
  Dodecet,
  DodecetArray,
  DodecetPoint3D,
  DodecetVector3D,
  DodecetTransform3D,
  GeometricComparison
} from './dodecet-geometric';

// ===================================
// GEOMETRIC DEMO CLASS
// ===================================

export class GeometricDemo {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private showComparison: boolean = true;
  private animationSpeed: number = 1.0;
  private rotation: number = 0;

  // Geometric objects
  private point: DodecetPoint3D;
  private vector: DodecetVector3D;
  private transform: DodecetTransform3D;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) {
      throw new Error(`Canvas element ${canvasId} not found`);
    }

    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context');
    }
    this.ctx = ctx;

    // Initialize geometric objects
    this.point = new DodecetPoint3D(0x800, 0x800, 0x800); // Center point
    this.vector = new DodecetVector3D(0xFFF, 0x800, 0x000); // Direction vector
    this.transform = DodecetTransform3D.translation(0, 0, 0);

    this.setupCanvas();
    this.setupControls();
  }

  setupCanvas(): void {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);

    // Handle resize
    window.addEventListener('resize', () => {
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.scale(dpr, dpr);
      this.render();
    });
  }

  setupControls(): void {
    // Comparison toggle
    const comparisonToggle = document.getElementById('comparisonToggle') as HTMLInputElement;
    if (comparisonToggle) {
      comparisonToggle.addEventListener('change', (e) => {
        this.showComparison = e.target.checked;
      });
    }

    // Animation speed slider
    const speedSlider = document.getElementById('speedSlider') as HTMLInputElement;
    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => {
        this.animationSpeed = parseFloat(e.target.value);
      });
    }

    // Point controls
    const pointX = document.getElementById('pointX') as HTMLInputElement;
    const pointY = document.getElementById('pointY') as HTMLInputElement;
    const pointZ = document.getElementById('pointZ') as HTMLInputElement;

    const updatePoint = () => {
      if (pointX && pointY && pointZ) {
        this.point = new DodecetPoint3D(
          parseInt(pointX.value, 16),
          parseInt(pointY.value, 16),
          parseInt(pointZ.value, 16)
        );
      }
    };

    if (pointX) pointX.addEventListener('input', updatePoint);
    if (pointY) pointY.addEventListener('input', updatePoint);
    if (pointZ) pointZ.addEventListener('input', updatePoint);

    // Vector controls
    const vectorX = document.getElementById('vectorX') as HTMLInputElement;
    const vectorY = document.getElementById('vectorY') as HTMLInputElement;
    const vectorZ = document.getElementById('vectorZ') as HTMLInputElement;

    const updateVector = () => {
      if (vectorX && vectorY && vectorZ) {
        this.vector = new DodecetVector3D(
          parseInt(vectorX.value, 16),
          parseInt(vectorY.value, 16),
          parseInt(vectorZ.value, 16)
        );
      }
    };

    if (vectorX) vectorX.addEventListener('input', updateVector);
    if (vectorY) vectorY.addEventListener('input', updateVector);
    if (vectorZ) vectorZ.addEventListener('input', updateVector);
  }

  render(): void {
    const width = this.canvas.width / window.devicePixelRatio;
    const height = this.canvas.height / window.devicePixelRatio;

    // Clear canvas
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, width, height);

    // Draw title
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillText('Dodecet Geometric Primitives', 20, 40);

    // Draw Point3D section
    this.drawPoint3D(width, height);

    // Draw Vector3D section
    this.drawVector3D(width, height);

    // Draw Transform3D section
    this.drawTransform3D(width, height);

    // Draw comparison if enabled
    if (this.showComparison) {
      this.drawPrecisionComparison(width, height);
    }

    // Animate
    this.rotation += 0.01 * this.animationSpeed;
  }

  drawPoint3D(width: number, height: number): void {
    const x = 20;
    const y = 80;
    const w = 350;
    const h = 200;

    // Background
    this.ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
    this.ctx.fillRect(x, y, w, h);
    this.ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
    this.ctx.strokeRect(x, y, w, h);

    // Title
    this.ctx.fillStyle = '#818cf8';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.fillText('Point3D', x + 10, y + 25);

    // Point info
    const [px, py, pz] = this.point.toNormalizedArray();
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '14px monospace';
    this.ctx.fillText(`Position: (${px.toFixed(3)}, ${py.toFixed(3)}, ${pz.toFixed(3)})`, x + 10, y + 50);

    // Hex encoding
    this.ctx.fillStyle = '#10b981';
    this.ctx.fillText(`Hex: ${this.point.toHexString()}`, x + 10, y + 70);

    // Draw 3D representation
    this.draw3DPoint(x + 200, y + 120, this.point);

    // Precision info
    const comparison = GeometricComparison.comparePrecision(px);
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.fillText(`Precision: ${comparison.dodecet.error.toExponential(2)}`, x + 10, y + 180);
  }

  drawVector3D(width: number, height: number): void {
    const x = 390;
    const y = 80;
    const w = 350;
    const h = 200;

    // Background
    this.ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
    this.ctx.fillRect(x, y, w, h);
    this.ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
    this.ctx.strokeRect(x, y, w, h);

    // Title
    this.ctx.fillStyle = '#34d399';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.fillText('Vector3D', x + 10, y + 25);

    // Vector info
    const [vx, vy, vz] = this.vector.toArray();
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '14px monospace';
    this.ctx.fillText(`Direction: (${vx.toFixed(3)}, ${vy.toFixed(3)}, ${vz.toFixed(3)})`, x + 10, y + 50);

    // Magnitude
    const mag = this.vector.magnitude();
    this.ctx.fillText(`Magnitude: ${mag.toFixed(3)}`, x + 10, y + 70);

    // Hex encoding
    this.ctx.fillStyle = '#10b981';
    this.ctx.fillText(`Hex: ${this.vector.toSpacedHexString()}`, x + 10, y + 90);

    // Draw 3D representation
    this.draw3DVector(x + 200, y + 120, this.vector);

    // Operations
    const normalized = this.vector.normalize();
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.fillText(`Normalized: (${normalized.toArray()[0].toFixed(3)}, ...)`, x + 10, y + 180);
  }

  drawTransform3D(width: number, height: number): void {
    const x = 20;
    const y = 300;
    const w = 720;
    const h = 200;

    // Background
    this.ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
    this.ctx.fillRect(x, y, w, h);
    this.ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
    this.ctx.strokeRect(x, y, w, h);

    // Title
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.fillText('Transform3D (4x4 Matrix)', x + 10, y + 25);

    // Create rotation transform
    const axis = DodecetVector3D.unitY();
    this.transform = DodecetTransform3D.rotation(axis, this.rotation);

    // Matrix display
    const m = this.transform.toNormalizedArray();
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px monospace';

    for (let row = 0; row < 4; row++) {
      let line = '';
      for (let col = 0; col < 4; col++) {
        const val = m[col * 4 + row];
        line += `[${val.toFixed(2)}] `;
      }
      this.ctx.fillText(line, x + 10, y + 50 + row * 20);
    }

    // Hex encoding
    this.ctx.fillStyle = '#10b981';
    this.ctx.font = '11px monospace';
    const hexLines = this.transform.toSpacedHexString().split('\n');
    hexLines.forEach((line, i) => {
      this.ctx.fillText(line, x + 350, y + 50 + i * 15);
    });

    // Transform example
    const testPoint = DodecetVector3D.unitX();
    const transformed = this.transform.transformDirection(testPoint);
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.font = '14px monospace';
    this.ctx.fillText(`Transform [1,0,0]: [${transformed.toArray().map(v => v.toFixed(3)).join(', ')}]`, x + 10, y + 180);
  }

  drawPrecisionComparison(width: number, height: number): void {
    const x = 20;
    const y = 520;
    const w = 720;
    const h = 150;

    // Background
    this.ctx.fillStyle = 'rgba(139, 92, 246, 0.1)';
    this.ctx.fillRect(x, y, w, h);
    this.ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
    this.ctx.strokeRect(x, y, w, h);

    // Title
    this.ctx.fillStyle = '#a78bfa';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.fillText('Precision Comparison (12-bit vs 8-bit vs Float32)', x + 10, y + 25);

    // Generate comparison data
    const table = GeometricComparison.generateComparisonTable(5);

    // Headers
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.fillText('Original', x + 10, y + 50);
    this.ctx.fillText('12-bit Dodecet', x + 100, y + 50);
    this.ctx.fillText('8-bit', x + 250, y + 50);
    this.ctx.fillText('12-bit Error', x + 350, y + 50);
    this.ctx.fillText('8-bit Error', x + 470, y + 50);
    this.ctx.fillText('Improvement', x + 590, y + 50);

    // Data rows
    this.ctx.font = '11px monospace';
    table.forEach((row, i) => {
      const y_pos = y + 70 + i * 15;

      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText(row.original.toFixed(4), x + 10, y_pos);

      this.ctx.fillStyle = '#10b981';
      this.ctx.fillText(row.dodecet, x + 100, y_pos);

      this.ctx.fillStyle = '#f59e0b';
      this.ctx.fillText(row.eightBit, x + 250, y_pos);

      this.ctx.fillStyle = '#10b981';
      this.ctx.fillText(row.dodecetError.toExponential(2), x + 350, y_pos);

      this.ctx.fillStyle = '#f59e0b';
      this.ctx.fillText(row.eightBitError.toExponential(2), x + 470, y_pos);

      this.ctx.fillStyle = '#818cf8';
      const improvement = row.eightBitError / (row.dodecetError || 1e-10);
      this.ctx.fillText(`${improvement.toFixed(1)}x`, x + 590, y_pos);
    });
  }

  draw3DPoint(cx: number, cy: number, point: DodecetPoint3D): void {
    const [x, y, z] = point.toNormalizedArray();

    // Simple isometric projection
    const px = cx + (x - y) * 30;
    const py = cy + (x + y) * 15 - z * 30;

    // Draw point
    this.ctx.fillStyle = '#818cf8';
    this.ctx.beginPath();
    this.ctx.arc(px, py, 8, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw axes
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy);
    this.ctx.lineTo(cx + 30, cy); // X
    this.ctx.moveTo(cx, cy);
    this.ctx.lineTo(cx - 15, cy + 15); // Y
    this.ctx.moveTo(cx, cy);
    this.ctx.lineTo(cx, cy - 30); // Z
    this.ctx.stroke();

    // Labels
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.font = '10px Arial';
    this.ctx.fillText('X', cx + 35, cy);
    this.ctx.fillText('Y', cx - 20, cy + 20);
    this.ctx.fillText('Z', cx + 5, cy - 35);
  }

  draw3DVector(cx: number, cy: number, vector: DodecetVector3D): void {
    const [x, y, z] = vector.toArray();
    const mag = vector.magnitude();
    const normalized = vector.normalize();
    const [nx, ny, nz] = normalized.toArray();

    // Simple isometric projection
    const px = cx + (nx - ny) * 30 * mag;
    const py = cy + (nx + ny) * 15 - nz * 30 * mag;

    // Draw vector arrow
    this.ctx.strokeStyle = '#34d399';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy);
    this.ctx.lineTo(px, py);
    this.ctx.stroke();

    // Draw arrowhead
    const angle = Math.atan2(py - cy, px - cx);
    this.ctx.beginPath();
    this.ctx.moveTo(px, py);
    this.ctx.lineTo(px - 10 * Math.cos(angle - Math.PI / 6), py - 10 * Math.sin(angle - Math.PI / 6));
    this.ctx.moveTo(px, py);
    this.ctx.lineTo(px - 10 * Math.cos(angle + Math.PI / 6), py - 10 * Math.sin(angle + Math.PI / 6));
    this.ctx.stroke();

    // Draw origin
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw axes
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy);
    this.ctx.lineTo(cx + 30, cy); // X
    this.ctx.moveTo(cx, cy);
    this.ctx.lineTo(cx - 15, cy + 15); // Y
    this.ctx.moveTo(cx, cy);
    this.ctx.lineTo(cx, cy - 30); // Z
    this.ctx.stroke();

    // Labels
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.font = '10px Arial';
    this.ctx.fillText('X', cx + 35, cy);
    this.ctx.fillText('Y', cx - 20, cy + 20);
    this.ctx.fillText('Z', cx + 5, cy - 35);
  }
}

// ===================================
// DEMO INITIALIZATION
// ===================================

export function initGeometricDemo(canvasId: string = 'geometricCanvas'): GeometricDemo {
  const demo = new GeometricDemo(canvasId);

  // Start render loop
  const renderLoop = () => {
    demo.render();
    requestAnimationFrame(renderLoop);
  };
  renderLoop();

  return demo;
}

// Auto-initialize if DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Check if canvas exists
    const canvas = document.getElementById('geometricCanvas');
    if (canvas) {
      window.geometricDemo = initGeometricDemo('geometricCanvas');
    }
  });
}
