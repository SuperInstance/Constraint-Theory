/**
 * Calculus Visualization Components
 *
 * Interactive visualization system for differentiation, integration,
 * and gradient operations using dodecet encoding.
 *
 * Uses Canvas API for high-performance rendering at 60 FPS.
 */

import {
  DodecetDifferentiation,
  DodecetIntegration,
  DodecetGradient
} from './dodecet-calculus';
import { Dodecet, DodecetPerformance } from './dodecet';

// ===================================
// COLOR PALETTE (Cyberpunk Theme)
// ===================================

const COLORS = {
  primary: '#00FFFF',
  primaryDark: '#00CCCC',
  secondary: '#0077FF',
  accent: '#FF00FF',
  success: '#00FF00',
  warning: '#FFAA00',
  error: '#FF0044',
  background: '#0A0A0A',
  backgroundSecondary: '#1A1A1A',
  grid: '#2A2A2A',
  gridLight: '#3A3A3A',
  text: '#FFFFFF',
  textMuted: '#707070'
};

// ===================================
// DIFFERENTIATION VISUALIZER
// ===================================

export class DifferentiationVisualizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private animationId: number | null = null;
  private currentTime: number = 0;

  // Function to visualize
  private f: (x: number) => number = (x) => Math.sin(x);

  // Viewport
  private xRange = { min: -Math.PI * 2, max: Math.PI * 2 };
  private yRange = { min: -2, max: 2 };

  // Current point for tangent line
  private currentX: number = 0;

  // Performance tracking
  private fps: number = 60;
  private frameCount: number = 0;
  private lastFpsUpdate: number = 0;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.setupInteraction();
  }

  /**
   * Set the function to visualize
   */
  setFunction(f: (x: number) => number): void {
    this.f = f;
    this.render();
  }

  /**
   * Set viewport ranges
   */
  setViewport(xRange: { min: number; max: number }, yRange: { min: number; max: number }): void {
    this.xRange = xRange;
    this.yRange = yRange;
    this.render();
  }

  /**
   * Convert math coordinates to canvas coordinates
   */
  private toCanvas(x: number, y: number): [number, number] {
    const px = ((x - this.xRange.min) / (this.xRange.max - this.xRange.min)) * this.width;
    const py = this.height - ((y - this.yRange.min) / (this.yRange.max - this.yRange.min)) * this.height;
    return [px, py];
  }

  /**
   * Convert canvas coordinates to math coordinates
   */
  private toMath(px: number, py: number): [number, number] {
    const x = this.xRange.min + (px / this.width) * (this.xRange.max - this.xRange.min);
    const y = this.yRange.min + ((this.height - py) / this.height) * (this.yRange.max - this.yRange.min);
    return [x, y];
  }

  /**
   * Setup mouse interaction
   */
  private setupInteraction(): void {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const [x, _] = this.toMath(px * (this.width / rect.width), 0);
      this.currentX = Math.max(this.xRange.min, Math.min(this.xRange.max, x));
      this.render();
    });
  }

  /**
   * Draw grid and axes
   */
  private drawGrid(): void {
    const ctx = this.ctx;
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;

    // Vertical grid lines
    const xStep = (this.xRange.max - this.xRange.min) / 10;
    for (let x = this.xRange.min; x <= this.xRange.max; x += xStep) {
      const [px, _] = this.toCanvas(x, 0);
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, this.height);
      ctx.stroke();
    }

    // Horizontal grid lines
    const yStep = (this.yRange.max - this.yRange.min) / 8;
    for (let y = this.yRange.min; y <= this.yRange.max; y += yStep) {
      const [_, py] = this.toCanvas(0, y);
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(this.width, py);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = COLORS.gridLight;
    ctx.lineWidth = 2;

    // X-axis
    const [ax0, ay0] = this.toCanvas(this.xRange.min, 0);
    const [ax1, _] = this.toCanvas(this.xRange.max, 0);
    ctx.beginPath();
    ctx.moveTo(ax0, ay0);
    ctx.lineTo(ax1, ay0);
    ctx.stroke();

    // Y-axis
    const [bx0, by0] = this.toCanvas(0, this.yRange.min);
    const [__, by1] = this.toCanvas(0, this.yRange.max);
    ctx.beginPath();
    ctx.moveTo(bx0, by0);
    ctx.lineTo(bx0, by1);
    ctx.stroke();
  }

  /**
   * Draw the function curve
   */
  private drawCurve(): void {
    const ctx = this.ctx;
    ctx.strokeStyle = COLORS.primary;
    ctx.lineWidth = 3;

    const steps = 200;
    const dx = (this.xRange.max - this.xRange.min) / steps;

    ctx.beginPath();
    let started = false;

    for (let i = 0; i <= steps; i++) {
      const x = this.xRange.min + i * dx;
      const y = this.f(x);
      const [px, py] = this.toCanvas(x, y);

      if (!started) {
        ctx.moveTo(px, py);
        started = true;
      } else {
        ctx.lineTo(px, py);
      }
    }

    ctx.stroke();

    // Add glow effect
    ctx.shadowColor = COLORS.primary;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  /**
   * Draw tangent line at current point
   */
  private drawTangentLine(): void {
    const ctx = this.ctx;
    const x = this.currentX;
    const y = this.f(x);

    // Compute derivative
    const { value: slope, encodedSlope, error } = DodecetDifferentiation.derivative(this.f, x);

    // Draw tangent line
    const xRange = 3;
    const lineLength = xRange * 2;
    const y1 = y - slope * xRange;
    const y2 = y + slope * xRange;

    ctx.strokeStyle = COLORS.accent;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    const [px1, py1] = this.toCanvas(x - xRange, y1);
    const [px2, py2] = this.toCanvas(x + xRange, y2);

    ctx.beginPath();
    ctx.moveTo(px1, py1);
    ctx.lineTo(px2, py2);
    ctx.stroke();

    ctx.setLineDash([]);

    // Draw point on curve
    const [px, py] = this.toCanvas(x, y);
    ctx.fillStyle = COLORS.success;
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fill();

    // Add glow
    ctx.shadowColor = COLORS.success;
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw tangent vector
    const vectorScale = 0.5;
    const tangentVec = DodecetDifferentiation.tangentVector(this.f, x, vectorScale);
    const [vx, vy, vz] = tangentVec.toArray();

    // Draw arrow
    ctx.strokeStyle = COLORS.warning;
    ctx.lineWidth = 3;
    const arrowLen = 60;
    const [arrowX, arrowY] = this.toCanvas(x + vx * arrowLen, y + vy * arrowLen);

    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(arrowX, arrowY);
    ctx.stroke();

    // Arrowhead
    const angle = Math.atan2(arrowY - py, arrowX - px);
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(arrowX - 10 * Math.cos(angle - 0.3), arrowY - 10 * Math.sin(angle - 0.3));
    ctx.lineTo(arrowX - 10 * Math.cos(angle + 0.3), arrowY - 10 * Math.sin(angle + 0.3));
    ctx.closePath();
    ctx.fillStyle = COLORS.warning;
    ctx.fill();
  }

  /**
   * Draw information overlay
   */
  private drawInfo(): void {
    const ctx = this.ctx;
    const x = this.currentX;
    const y = this.f(x);
    const { value: slope, encodedSlope, error } = DodecetDifferentiation.derivative(this.f, x);

    // Info box
    ctx.fillStyle = 'rgba(26, 26, 26, 0.9)';
    ctx.fillRect(10, 10, 300, 120);

    ctx.strokeStyle = COLORS.primary;
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, 300, 120);

    // Text
    ctx.font = '14px "Fira Code", monospace';
    ctx.fillStyle = COLORS.text;

    const lines = [
      `Point: (${x.toFixed(3)}, ${y.toFixed(3)})`,
      `Derivative: ${slope.toFixed(6)}`,
      `Encoded Slope: 0x${encodedSlope.toHexString()}`,
      `Error: ${error.toExponential(3)}`,
      `FPS: ${this.fps.toFixed(0)}`
    ];

    lines.forEach((line, i) => {
      ctx.fillText(line, 20, 35 + i * 20);
    });
  }

  /**
   * Main render function
   */
  render(): void {
    const ctx = this.ctx;

    // Clear canvas
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, this.width, this.height);

    // Draw components
    this.drawGrid();
    this.drawCurve();
    this.drawTangentLine();
    this.drawInfo();

    // Update FPS
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsUpdate > 1000) {
      this.fps = this.frameCount * 1000 / (now - this.lastFpsUpdate);
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }
  }

  /**
   * Start animation
   */
  startAnimation(): void {
    const animate = () => {
      this.currentTime += 0.016;
      this.render();
      this.animationId = requestAnimationFrame(animate);
    };
    animate();
  }

  /**
   * Stop animation
   */
  stopAnimation(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Get derivative data for external use
   */
  getDerivativeData(): Array<{
    x: number;
    y: number;
    derivative: number;
    encodedDerivative: string;
  }> {
    return DodecetDifferentiation.derivativeArray(
      this.f,
      this.xRange.min,
      this.xRange.max,
      50
    ).map(d => ({
      x: d.x,
      y: d.y,
      derivative: d.derivative,
      encodedDerivative: d.encodedDerivative.toHexString()
    }));
  }
}

// ===================================
// INTEGRATION VISUALIZER
// ===================================

export class IntegrationVisualizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private animationId: number | null = null;

  // Function to integrate
  private f: (x: number) => number = (x) => Math.sin(x) + 1;

  // Integration bounds
  private a: number = 0;
  private b: number = Math.PI;

  // Viewport
  private xRange = { min: -0.5, max: Math.PI + 0.5 };
  private yRange = { min: -0.5, max: 2.5 };

  // Animation
  private currentStrip: number = 0;
  private animating: boolean = false;

  // Performance
  private fps: number = 60;
  private frameCount: number = 0;
  private lastFpsUpdate: number = 0;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }

  /**
   * Set function to integrate
   */
  setFunction(f: (x: number) => number): void {
    this.f = f;
    this.render();
  }

  /**
   * Set integration bounds
   */
  setBounds(a: number, b: number): void {
    this.a = a;
    this.b = b;
    this.render();
  }

  /**
   * Convert math to canvas coordinates
   */
  private toCanvas(x: number, y: number): [number, number] {
    const px = ((x - this.xRange.min) / (this.xRange.max - this.xRange.min)) * this.width;
    const py = this.height - ((y - this.yRange.min) / (this.yRange.max - this.yRange.min)) * this.height;
    return [px, py];
  }

  /**
   * Draw grid
   */
  private drawGrid(): void {
    const ctx = this.ctx;
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;

    // Grid lines
    const xStep = (this.xRange.max - this.xRange.min) / 10;
    const yStep = (this.yRange.max - this.yRange.min) / 6;

    for (let x = this.xRange.min; x <= this.xRange.max; x += xStep) {
      const [px, _] = this.toCanvas(x, 0);
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, this.height);
      ctx.stroke();
    }

    for (let y = this.yRange.min; y <= this.yRange.max; y += yStep) {
      const [_, py] = this.toCanvas(0, y);
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(this.width, py);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = COLORS.gridLight;
    ctx.lineWidth = 2;

    const [ax0, ay0] = this.toCanvas(this.xRange.min, 0);
    const [ax1, __] = this.toCanvas(this.xRange.max, 0);
    ctx.beginPath();
    ctx.moveTo(ax0, ay0);
    ctx.lineTo(ax1, ay0);
    ctx.stroke();
  }

  /**
   * Draw Riemann strips with animation
   */
  private drawRiemannStrips(): void {
    const ctx = this.ctx;
    const n = 20; // Number of strips
    const dx = (this.b - this.a) / n;

    const maxVisible = this.animating ? this.currentStrip : n;

    for (let i = 0; i < maxVisible; i++) {
      const x1 = this.a + i * dx;
      const x2 = this.a + (i + 1) * dx;
      const y = this.f((x1 + x2) / 2); // Midpoint

      const [px1, py0] = this.toCanvas(x1, 0);
      const [px2, py1] = this.toCanvas(x2, y);

      // Gradient fill
      const gradient = ctx.createLinearGradient(px1, py0, px1, py1);
      gradient.addColorStop(0, 'rgba(0, 255, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(0, 255, 255, 0.4)');

      ctx.fillStyle = gradient;
      ctx.fillRect(px1, py1, px2 - px1, py0 - py1);

      // Border
      ctx.strokeStyle = COLORS.primary;
      ctx.lineWidth = 1;
      ctx.strokeRect(px1, py1, px2 - px1, py0 - py1);
    }
  }

  /**
   * Draw function curve
   */
  private drawCurve(): void {
    const ctx = this.ctx;
    ctx.strokeStyle = COLORS.secondary;
    ctx.lineWidth = 3;

    const steps = 200;
    const dx = (this.xRange.max - this.xRange.min) / steps;

    ctx.beginPath();
    let started = false;

    for (let i = 0; i <= steps; i++) {
      const x = this.xRange.min + i * dx;
      const y = this.f(x);
      const [px, py] = this.toCanvas(x, y);

      if (!started) {
        ctx.moveTo(px, py);
        started = true;
      } else {
        ctx.lineTo(px, py);
      }
    }

    ctx.stroke();

    // Glow
    ctx.shadowColor = COLORS.secondary;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  /**
   * Draw integration bounds markers
   */
  private drawBounds(): void {
    const ctx = this.ctx;

    // Draw vertical lines at bounds
    ctx.strokeStyle = COLORS.accent;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    const [pa, _] = this.toCanvas(this.a, 0);
    ctx.beginPath();
    ctx.moveTo(pa, 0);
    ctx.lineTo(pa, this.height);
    ctx.stroke();

    const [pb, __] = this.toCanvas(this.b, 0);
    ctx.beginPath();
    ctx.moveTo(pb, 0);
    ctx.lineTo(pb, this.height);
    ctx.stroke();

    ctx.setLineDash([]);

    // Labels
    ctx.font = '14px "Fira Code", monospace';
    ctx.fillStyle = COLORS.accent;
    ctx.fillText(`a = ${this.a.toFixed(2)}`, pa - 30, this.height - 10);
    ctx.fillText(`b = ${this.b.toFixed(2)}`, pb + 5, this.height - 10);
  }

  /**
   * Draw information panel
   */
  private drawInfo(): void {
    const ctx = this.ctx;

    // Compute integral
    const { value, encodedArea, error, strips } = DodecetIntegration.integrate(this.f, this.a, this.b, 20);

    // Info box
    ctx.fillStyle = 'rgba(26, 26, 26, 0.9)';
    ctx.fillRect(10, 10, 320, 140);

    ctx.strokeStyle = COLORS.primary;
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, 320, 140);

    // Text
    ctx.font = '14px "Fira Code", monospace';
    ctx.fillStyle = COLORS.text;

    const lines = [
      `Simpson's Rule Integration`,
      `Integral: ${value.toFixed(6)}`,
      `Encoded Area: 0x${encodedArea.toHexString()}`,
      `Error: ${error.toExponential(3)}`,
      `Strips: ${strips.length}`,
      `FPS: ${this.fps.toFixed(0)}`
    ];

    lines.forEach((line, i) => {
      ctx.fillText(line, 20, 35 + i * 20);
    });
  }

  /**
   * Main render
   */
  render(): void {
    const ctx = this.ctx;

    // Clear
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, this.width, this.height);

    // Draw
    this.drawGrid();
    this.drawRiemannStrips();
    this.drawCurve();
    this.drawBounds();
    this.drawInfo();

    // FPS
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsUpdate > 1000) {
      this.fps = this.frameCount * 1000 / (now - this.lastFpsUpdate);
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }
  }

  /**
   * Start animation (show strips one by one)
   */
  startAnimation(): void {
    this.animating = true;
    this.currentStrip = 0;

    const animate = () => {
      this.render();

      if (this.currentStrip < 20) {
        this.currentStrip += 0.5;
        this.animationId = requestAnimationFrame(animate);
      } else {
        this.animating = false;
      }
    };

    animate();
  }

  /**
   * Stop animation
   */
  stopAnimation(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.animating = false;
  }

  /**
   * Get integration data
   */
  getIntegrationData(): {
    value: number;
    encodedArea: string;
    strips: number;
  } {
    const { value, encodedArea, strips } = DodecetIntegration.integrate(this.f, this.a, this.b, 20);
    return {
      value,
      encodedArea: encodedArea.toHexString(),
      strips: strips.length
    };
  }
}

// ===================================
// GRADIENT VISUALIZER
// ===================================

export class GradientVisualizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private animationId: number | null = null;

  // Scalar field
  private f: (x: number, y: number) => number = (x, y) => Math.sin(x) * Math.cos(y);

  // Viewport
  private xRange = { min: -2, max: 2 };
  private yRange = { min: -2, max: 2 };

  // Animation
  private particles: Array<{ x: number; y: number; vx: number; vy: number }> = [];

  // Performance
  private fps: number = 60;
  private frameCount: number = 0;
  private lastFpsUpdate: number = 0;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.width = this.canvas.width;
    this.height = this.height = this.canvas.height;

    this.initParticles(50);
  }

  /**
   * Initialize gradient-following particles
   */
  private initParticles(count: number): void {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: this.xRange.min + Math.random() * (this.xRange.max - this.xRange.min),
        y: this.yRange.min + Math.random() * (this.yRange.max - this.yRange.min),
        vx: 0,
        vy: 0
      });
    }
  }

  /**
   * Set scalar field
   */
  setFunction(f: (x: number, y: number) => number): void {
    this.f = f;
    this.render();
  }

  /**
   * Convert to canvas coordinates
   */
  private toCanvas(x: number, y: number): [number, number] {
    const px = ((x - this.xRange.min) / (this.xRange.max - this.xRange.min)) * this.width;
    const py = this.height - ((y - this.yRange.min) / (this.yRange.max - this.yRange.min)) * this.height;
    return [px, py];
  }

  /**
   * Draw background heatmap
   */
  private drawHeatmap(): void {
    const ctx = this.ctx;
    const resolution = 50;
    const dx = (this.xRange.max - this.xRange.min) / resolution;
    const dy = (this.yRange.max - this.yRange.min) / resolution;

    // Find min/max for normalization
    let minF = Infinity;
    let maxF = -Infinity;
    for (let i = 0; i <= resolution; i++) {
      for (let j = 0; j <= resolution; j++) {
        const x = this.xRange.min + i * dx;
        const y = this.yRange.min + j * dy;
        const val = this.f(x, y);
        minF = Math.min(minF, val);
        maxF = Math.max(maxF, val);
      }
    }

    // Draw heatmap
    for (let i = 0; i <= resolution; i++) {
      for (let j = 0; j <= resolution; j++) {
        const x = this.xRange.min + i * dx;
        const y = this.yRange.min + j * dy;
        const val = this.f(x, y);
        const normalized = (val - minF) / (maxF - minF + 0.001);

        const [px, py] = this.toCanvas(x, y);

        // Color gradient: cyan to magenta
        const r = Math.floor(normalized * 255);
        const g = Math.floor((1 - normalized) * 255);
        const b = 255;

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
        ctx.fillRect(
          px - this.width / resolution / 2,
          py - this.height / resolution / 2,
          this.width / resolution + 1,
          this.height / resolution + 1
        );
      }
    }
  }

  /**
   * Draw gradient vector field
   */
  private drawVectorField(): void {
    const ctx = this.ctx;
    const resolution = 15;

    const fieldData = DodecetGradient.gradientField2D(
      this.f,
      this.xRange,
      this.yRange,
      resolution
    );

    // Draw arrows
    fieldData.forEach(point => {
      const [px, py] = this.toCanvas(point.x, point.y);

      // Normalize gradient
      const mag = Math.sqrt(point.gradX * point.gradX + point.gradY * point.gradY) + 0.001;
      const arrowLen = 15;
      const dx = (point.gradX / mag) * arrowLen;
      const dy = (point.gradY / mag) * arrowLen;

      // Draw arrow line
      ctx.strokeStyle = COLORS.warning;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + dx, py - dy);
      ctx.stroke();

      // Arrowhead
      const angle = Math.atan2(-dy, dx);
      ctx.fillStyle = COLORS.warning;
      ctx.beginPath();
      ctx.moveTo(px + dx, py - dy);
      ctx.lineTo(px + dx - 5 * Math.cos(angle - 0.5), py - dy - 5 * Math.sin(angle - 0.5));
      ctx.lineTo(px + dx - 5 * Math.cos(angle + 0.5), py - dy - 5 * Math.sin(angle + 0.5));
      ctx.closePath();
      ctx.fill();
    });
  }

  /**
   * Draw level curves (contours)
   */
  private drawContours(): void {
    const ctx = this.ctx;
    const levels = [-0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75];

    const curves = DodecetGradient.levelCurves(
      this.f,
      this.xRange,
      this.yRange,
      levels,
      50
    );

    curves.forEach((points, level) => {
      ctx.strokeStyle = level === 0 ? COLORS.text : COLORS.accent;
      ctx.lineWidth = level === 0 ? 2 : 1;
      ctx.globalAlpha = level === 0 ? 1 : 0.5;

      points.forEach(p => {
        const px = p.x.normalize() * this.width;
        const py = (1 - p.y.normalize()) * this.height;
        ctx.fillRect(px, py, 2, 2);
      });
    });

    ctx.globalAlpha = 1;
  }

  /**
   * Draw gradient-following particles
   */
  private drawParticles(): void {
    const ctx = this.ctx;

    // Update particles
    const f3d = (x: number, y: number, _z: number) => this.f(x, y);

    this.particles.forEach(p => {
      const { partials } = DodecetGradient.gradient(f3d, { x: p.x, y: p.y, z: 0 });

      // Follow gradient descent
      const speed = 0.02;
      p.vx = -partials.dx * speed;
      p.vy = -partials.dy * speed;

      p.x += p.vx;
      p.y += p.vy;

      // Wrap around
      if (p.x < this.xRange.min) p.x = this.xRange.max;
      if (p.x > this.xRange.max) p.x = this.xRange.min;
      if (p.y < this.yRange.min) p.y = this.yRange.max;
      if (p.y > this.yRange.max) p.y = this.yRange.min;
    });

    // Draw particles
    this.particles.forEach(p => {
      const [px, py] = this.toCanvas(p.x, p.y);

      ctx.fillStyle = COLORS.success;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();

      // Glow
      ctx.shadowColor = COLORS.success;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Trail
      ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, py);
      const trailLen = 20;
      ctx.lineTo(
        px - p.vx * trailLen * this.width / (this.xRange.max - this.xRange.min),
        py + p.vy * trailLen * this.height / (this.yRange.max - this.yRange.min)
      );
      ctx.stroke();
    });
  }

  /**
   * Draw info panel
   */
  private drawInfo(): void {
    const ctx = this.ctx;

    // Info box
    ctx.fillStyle = 'rgba(26, 26, 26, 0.9)';
    ctx.fillRect(10, 10, 280, 100);

    ctx.strokeStyle = COLORS.primary;
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, 280, 100);

    // Text
    ctx.font = '14px "Fira Code", monospace';
    ctx.fillStyle = COLORS.text;

    const lines = [
      `Gradient Field Visualization`,
      `Particles: ${this.particles.length}`,
      `Field: f(x,y) = sin(x) * cos(y)`,
      `FPS: ${this.fps.toFixed(0)}`
    ];

    lines.forEach((line, i) => {
      ctx.fillText(line, 20, 35 + i * 20);
    });
  }

  /**
   * Main render
   */
  render(): void {
    const ctx = this.ctx;

    // Clear
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, this.width, this.height);

    // Draw layers
    this.drawHeatmap();
    this.drawContours();
    this.drawVectorField();
    this.drawParticles();
    this.drawInfo();

    // FPS
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsUpdate > 1000) {
      this.fps = this.frameCount * 1000 / (now - this.lastFpsUpdate);
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }
  }

  /**
   * Start animation
   */
  startAnimation(): void {
    const animate = () => {
      this.render();
      this.animationId = requestAnimationFrame(animate);
    };
    animate();
  }

  /**
   * Stop animation
   */
  stopAnimation(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Get gradient data
   */
  getGradientData(): Array<{
    x: number;
    y: number;
    gradX: number;
    gradY: number;
    magnitude: number;
  }> {
    return DodecetGradient.gradientField2D(
      this.f,
      this.xRange,
      this.yRange,
      10
    ).map(p => ({
      x: p.x,
      y: p.y,
      gradX: p.gradX,
      gradY: p.gradY,
      magnitude: p.magnitude
    }));
  }
}

// ===================================
// UNIFIED CALCULUS DEMO
// ===================================

export class CalculusDemo {
  private diffViz: DifferentiationVisualizer;
  private intViz: IntegrationVisualizer;
  private gradViz: GradientVisualizer;

  constructor(
    diffCanvasId: string,
    intCanvasId: string,
    gradCanvasId: string
  ) {
    this.diffViz = new DifferentiationVisualizer(diffCanvasId);
    this.intViz = new IntegrationVisualizer(intCanvasId);
    this.gradViz = new GradientVisualizer(gradCanvasId);
  }

  /**
   * Start all visualizations
   */
  start(): void {
    this.diffViz.startAnimation();
    this.intViz.startAnimation();
    this.gradViz.startAnimation();
  }

  /**
   * Stop all visualizations
   */
  stop(): void {
    this.diffViz.stopAnimation();
    this.intViz.stopAnimation();
    this.gradViz.stopAnimation();
  }

  /**
   * Get all data for external display
   */
  getAllData(): {
    differentiation: ReturnType<DifferentiationVisualizer['getDerivativeData']>;
    integration: ReturnType<IntegrationVisualizer['getIntegrationData']>;
    gradient: ReturnType<GradientVisualizer['getGradientData']>;
  } {
    return {
      differentiation: this.diffViz.getDerivativeData(),
      integration: this.intViz.getIntegrationData(),
      gradient: this.gradViz.getGradientData()
    };
  }
}

// Export for global access
(window as any).DifferentiationVisualizer = DifferentiationVisualizer;
(window as any).IntegrationVisualizer = IntegrationVisualizer;
(window as any).GradientVisualizer = GradientVisualizer;
(window as any).CalculusDemo = CalculusDemo;
