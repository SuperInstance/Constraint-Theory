/**
 * Interactive Calculus Tutorials
 *
 * Step-by-step tutorials explaining differentiation, integration,
 * and gradient operations using dodecet geometric encoding.
 *
 * Design principles:
 * - Show actual code, not just visual abstractions
 * - Ground explanations in mathematics
 * - Let the math speak for itself
 */

import {
  DodecetDifferentiation,
  DodecetIntegration,
  DodecetGradient
} from './dodecet-calculus';
import { Dodecet } from './dodecet';

// ===================================
// TUTORIAL STEP INTERFACE
// ===================================

interface TutorialStep {
  title: string;
  description: string;
  code?: string;
  explanation?: string;
  mathFormula?: string;
  interactive?: boolean;
  validate?: () => boolean;
}

// ===================================
// DIFFERENTIATION TUTORIAL
// ===================================

export class DifferentiationTutorial {
  private container: HTMLElement;
  private currentStep: number = 0;
  private steps: TutorialStep[] = [
    {
      title: 'What is Differentiation?',
      description: `
        Differentiation finds the rate of change of a function.
        Geometrically, it gives us the slope of the tangent line at any point.
      `,
      mathFormula: "f'(x) = lim[h->0] (f(x+h) - f(x)) / h",
      explanation: `
        The derivative f'(x) tells us how fast f(x) is changing at point x.
        A positive derivative means the function is increasing; negative means decreasing.
      `
    },
    {
      title: 'Central Difference Method',
      description: `
        We use the central difference approximation for better accuracy:
      `,
      mathFormula: "f'(x) ≈ (f(x+h) - f(x-h)) / 2h",
      code: `
// Central difference implementation
function derivative(f, x, h = 0.001) {
  const fx_plus_h = f(x + h);
  const fx_minus_h = f(x - h);
  return (fx_plus_h - fx_minus_h) / (2 * h);
}

// Example: derivative of sin(x) at x = π/4
const f = (x) => Math.sin(x);
const x = Math.PI / 4;
const result = derivative(f, x);
console.log(result); // ≈ 0.707 (which is cos(π/4))
      `,
      explanation: `
        Central difference is O(h^2) accurate, meaning the error decreases
        quadratically with smaller step sizes. This is more accurate than
        forward difference which is only O(h) accurate.
      `
    },
    {
      title: 'Dodecet Encoding of Slopes',
      description: `
        We encode the derivative value as a 12-bit dodecet for geometric precision:
      `,
      code: `
import { DodecetDifferentiation, Dodecet } from './dodecet-calculus';

// Compute derivative with dodecet encoding
const f = (x) => Math.sin(x);
const { value, encodedSlope, error } = DodecetDifferentiation.derivative(f, Math.PI / 4);

console.log('Derivative value:', value);     // 0.707
console.log('Encoded slope:', encodedSlope.toHexString());  // "59E"
console.log('Error estimate:', error);       // ~0.000001

// The encoding maps slope from [-10, 10] to [0x000, 0xFFF]
// 59E hex = 1438 decimal ≈ (0.707 + 10) / 20 * 4095
      `,
      explanation: `
        The 12-bit dodecet provides 4096 possible values for slope encoding.
        This is 16x more precision than 8-bit encoding (256 values).
        The encoding preserves relative ordering: higher slope = higher hex value.
      `
    },
    {
      title: 'Tangent Line Visualization',
      description: `
        The derivative at a point defines the tangent line:
      `,
      mathFormula: "y - f(x₀) = f'(x₀)(x - x₀)",
      code: `
// Compute tangent line at a point
const x0 = 1.0;
const f = (x) => x * x;  // f(x) = x²

const { slope } = DodecetDifferentiation.tangentLine(f, x0);
const y0 = f(x0);
const intercept = y0 - slope * x0;

// Tangent line equation: y = slope*x + intercept
console.log('Point:', x0, y0);           // (1.0, 1.0)
console.log('Slope:', slope);             // 2.0 (derivative of x² is 2x)
console.log('Intercept:', intercept);     // -1.0

// So tangent line is: y = 2x - 1
      `,
      explanation: `
        At x = 1, the parabola f(x) = x² has derivative 2x = 2.
        The tangent line passes through (1, 1) with slope 2.
        This line "just touches" the curve at that point.
      `,
      interactive: true
    },
    {
      title: 'Try It Yourself',
      description: `
        Experiment with different functions and points:
      `,
      code: `
// Try different functions
const functions = {
  'sin(x)': (x) => Math.sin(x),
  'cos(x)': (x) => Math.cos(x),
  'x²': (x) => x * x,
  'e^x': (x) => Math.exp(x),
  'ln(x)': (x) => Math.log(x)
};

// Compute derivatives for each
Object.entries(functions).forEach(([name, f]) => {
  const x = 0.5;
  const { value, encodedSlope } = DodecetDifferentiation.derivative(f, x);
  console.log(\`\${name} at x=\${x}: f'=\${value.toFixed(4)} (hex: \${encodedSlope.toHexString()})\`);
});
      `,
      interactive: true
    }
  ];

  constructor(containerId: string) {
    this.container = document.getElementById(containerId) || document.body;
  }

  /**
   * Render current step
   */
  render(): void {
    const step = this.steps[this.currentStep];

    let html = `
      <div class="tutorial-step">
        <div class="step-progress">Step ${this.currentStep + 1} of ${this.steps.length}</div>
        <h2 class="step-title">${step.title}</h2>
        <div class="step-description">${step.description}</div>
    `;

    if (step.mathFormula) {
      html += `
        <div class="math-formula">
          <code>${step.mathFormula}</code>
        </div>
      `;
    }

    if (step.code) {
      html += `
        <div class="code-block">
          <pre><code class="language-typescript">${this.escapeHtml(step.code)}</code></pre>
        </div>
      `;
    }

    if (step.explanation) {
      html += `
        <div class="explanation">
          <h4>Explanation</h4>
          <p>${step.explanation}</p>
        </div>
      `;
    }

    html += `
        <div class="step-navigation">
          <button class="btn btn-secondary" ${this.currentStep === 0 ? 'disabled' : ''} onclick="tutorial.prev()">Previous</button>
          <button class="btn btn-primary" ${this.currentStep === this.steps.length - 1 ? 'disabled' : ''} onclick="tutorial.next()">Next</button>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  /**
   * Go to next step
   */
  next(): void {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.render();
    }
  }

  /**
   * Go to previous step
   */
  prev(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.render();
    }
  }

  /**
   * Escape HTML for code display
   */
  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// ===================================
// INTEGRATION TUTORIAL
// ===================================

export class IntegrationTutorial {
  private container: HTMLElement;
  private currentStep: number = 0;
  private steps: TutorialStep[] = [
    {
      title: 'What is Integration?',
      description: `
        Integration finds the accumulated area under a curve.
        It's the reverse operation of differentiation.
      `,
      mathFormula: "∫[a,b] f(x) dx = F(b) - F(a)",
      explanation: `
        The integral represents the total "sum" of infinitesimal areas
        under the curve from x = a to x = b. Each area is f(x) * dx.
      `
    },
    {
      title: "Simpson's Rule",
      description: `
        Simpson's rule approximates the integral using parabolas:
      `,
      mathFormula: "∫[a,b] f(x) dx ≈ (h/3)[f(x₀) + 4f(x₁) + 2f(x₂) + 4f(x₃) + ... + f(xₙ)]",
      code: `
// Simpson's rule implementation
function simpsonIntegrate(f, a, b, n = 100) {
  // n must be even
  if (n % 2 !== 0) n++;

  const h = (b - a) / n;
  let sum = f(a) + f(b);

  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    const weight = (i % 2 === 0) ? 2 : 4;
    sum += weight * f(x);
  }

  return (h / 3) * sum;
}

// Example: integral of sin(x) from 0 to π
const f = (x) => Math.sin(x);
const result = simpsonIntegrate(f, 0, Math.PI);
console.log(result); // ≈ 2.0 (exact answer)
      `,
      explanation: `
        Simpson's rule is O(h^4) accurate - very precise!
        The alternating 4-2-4-2 weights come from fitting parabolas
        to consecutive triplets of points.
      `
    },
    {
      title: 'Dodecet Area Encoding',
      description: `
        The computed integral is encoded as a dodecet:
      `,
      code: `
import { DodecetIntegration } from './dodecet-calculus';

// Integrate with dodecet encoding
const f = (x) => Math.sin(x);
const a = 0, b = Math.PI;

const { value, encodedArea, error, strips } = DodecetIntegration.integrate(
  f, a, b, 100
);

console.log('Integral value:', value);           // 2.0
console.log('Encoded area:', encodedArea.toHexString());  // "FFF" (max)
console.log('Error estimate:', error);           // ~0.000001
console.log('Number of strips:', strips.length); // 102
      `,
      explanation: `
        The area is normalized and encoded. For sin(x) from 0 to π,
        the exact integral is 2, which maps to the maximum dodecet value.
        Each strip's position and height are also encoded as dodecets.
      `
    },
    {
      title: 'Visual Representation',
      description: `
        The integration process creates visual data:
      `,
      code: `
// Get visualization data
const viz = DodecetIntegration.integralVisualization(
  (x) => Math.sin(x),
  0, Math.PI, 50
);

// Curve points
viz.curvePoints.forEach(p => {
  console.log(\`Point: \${p.x.toHexString()}, \${p.y.toHexString()}\`);
});

// Area polygon (for filling)
console.log('Area polygon has', viz.areaPolygon.length, 'vertices');

// Riemann strips (for visualization)
viz.riemannStrips.forEach((strip, i) => {
  console.log(\`Strip \${i}: height=\${strip.height.toHexString()}\`);
});
      `,
      explanation: `
        The visualization data provides:
        - curvePoints: Points along the function curve
        - areaPolygon: Polygon vertices for area fill
        - riemannStrips: Individual rectangles for animation
        All coordinates are dodecet-encoded for geometric precision.
      `,
      interactive: true
    },
    {
      title: 'Accumulated Integral',
      description: `
        Watch the integral accumulate from left to right:
      `,
      code: `
// Compute accumulated integral (antiderivative)
const accumulated = DodecetIntegration.accumulatedIntegral(
  (x) => Math.cos(x),  // derivative of sin(x)
  0, Math.PI,
  100
);

// Each point shows accumulated area up to that x
accumulated.forEach((point, i) => {
  if (i % 20 === 0) {
    console.log(\`x=\${point.x.toFixed(2)}: F(x)=\${point.accumulated.toFixed(4)} (\${point.encodedAccumulated.toHexString()})\`);
  }
});

// Final value should be sin(π) - sin(0) = 0
// Wait... cos(x) integrates to sin(x), so from 0 to π:
// sin(π) - sin(0) = 0 - 0 = 0
      `,
      explanation: `
        The accumulated integral shows how the area builds up.
        For cos(x) from 0 to π, the positive area (0 to π/2) cancels
        with the negative area (π/2 to π), giving total = 0.
      `,
      interactive: true
    }
  ];

  constructor(containerId: string) {
    this.container = document.getElementById(containerId) || document.body;
  }

  render(): void {
    const step = this.steps[this.currentStep];

    let html = `
      <div class="tutorial-step">
        <div class="step-progress">Step ${this.currentStep + 1} of ${this.steps.length}</div>
        <h2 class="step-title">${step.title}</h2>
        <div class="step-description">${step.description}</div>
    `;

    if (step.mathFormula) {
      html += `<div class="math-formula"><code>${step.mathFormula}</code></div>`;
    }

    if (step.code) {
      html += `<div class="code-block"><pre><code>${this.escapeHtml(step.code)}</code></pre></div>`;
    }

    if (step.explanation) {
      html += `<div class="explanation"><h4>Explanation</h4><p>${step.explanation}</p></div>`;
    }

    html += `
        <div class="step-navigation">
          <button class="btn btn-secondary" ${this.currentStep === 0 ? 'disabled' : ''} onclick="intTutorial.prev()">Previous</button>
          <button class="btn btn-primary" ${this.currentStep === this.steps.length - 1 ? 'disabled' : ''} onclick="intTutorial.next()">Next</button>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  next(): void {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.render();
    }
  }

  prev(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.render();
    }
  }

  private escapeHtml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

// ===================================
// GRADIENT TUTORIAL
// ===================================

export class GradientTutorial {
  private container: HTMLElement;
  private currentStep: number = 0;
  private steps: TutorialStep[] = [
    {
      title: 'What is a Gradient?',
      description: `
        The gradient is a vector of partial derivatives for multivariable functions.
        It points in the direction of steepest increase.
      `,
      mathFormula: "∇f = (∂f/∂x, ∂f/∂y, ∂f/∂z)",
      explanation: `
        For a function f(x, y, z), the gradient tells us:
        - Direction of maximum increase
        - Rate of increase in that direction
        - It's perpendicular to level surfaces (contours)
      `
    },
    {
      title: 'Computing Partial Derivatives',
      description: `
        Each component is a partial derivative:
      `,
      code: `
import { DodecetGradient } from './dodecet-calculus';

// Define a 3D scalar field
const f = (x, y, z) => x*x + y*y + z*z;  // f = x² + y² + z²

// Compute gradient at point (1, 2, 3)
const { grad, partials, magnitude } = DodecetGradient.gradient(
  f,
  { x: 1, y: 2, z: 3 }
);

console.log('Partial derivatives:');
console.log('  ∂f/∂x =', partials.dx);  // 2x = 2
console.log('  ∂f/∂y =', partials.dy);  // 2y = 4
console.log('  ∂f/∂z =', partials.dz);  // 2z = 6

console.log('Gradient magnitude:', magnitude);  // √(4+16+36) = √56 ≈ 7.48
      `,
      explanation: `
        For f = x² + y² + z²:
        - ∂f/∂x = 2x (treat y, z as constants)
        - ∂f/∂y = 2y (treat x, z as constants)
        - ∂f/∂z = 2z (treat x, y as constants)
        At (1, 2, 3): gradient = (2, 4, 6)
      `
    },
    {
      title: 'Gradient Field Visualization',
      description: `
        Visualize the gradient as a vector field:
      `,
      code: `
// Generate gradient field over a grid
const field = DodecetGradient.gradientField2D(
  (x, y) => Math.sin(x) * Math.cos(y),
  { min: -Math.PI, max: Math.PI },  // x range
  { min: -Math.PI, max: Math.PI },  // y range
  20  // resolution
);

// Each point has gradient info
field.forEach(point => {
  console.log(\`(\${point.x.toFixed(2)}, \${point.y.toFixed(2)}): \
grad=(\${point.gradX.toFixed(3)}, \${point.gradY.toFixed(3)}) \
|grad|=\${point.magnitude.toFixed(3)}\`);
});
      `,
      explanation: `
        The gradient field shows how the function changes everywhere.
        Arrows point uphill - toward higher values.
        Arrow length indicates steepness.
      `,
      interactive: true
    },
    {
      title: 'Directional Derivative',
      description: `
        How fast does f change in a specific direction?
      `,
      mathFormula: "D_û f = ∇f · û",
      code: `
import { DodecetVector3D } from './dodecet-geometric';

// Define function and direction
const f = (x, y, z) => x*x + y*y + z*z;
const point = { x: 1, y: 2, z: 3 };
const direction = new DodecetVector3D(1, 0, 0);  // x-direction

// Compute directional derivative
const { value, encodedValue } = DodecetGradient.directionalDerivative(
  f, point, direction
);

console.log('Directional derivative:', value);  // 2 (same as ∂f/∂x)

// Try diagonal direction
const diagDir = new DodecetVector3D(1, 1, 1).normalize();
const diagResult = DodecetGradient.directionalDerivative(f, point, diagDir);
console.log('Diagonal derivative:', diagResult.value.toFixed(3));  // ≈ 6.93
      `,
      explanation: `
        The directional derivative is the dot product of gradient and unit direction.
        Maximum when direction aligns with gradient.
        Zero when direction is perpendicular to gradient.
      `
    },
    {
      title: 'Critical Points and Optimization',
      description: `
        Critical points occur where the gradient is zero:
      `,
      code: `
// Find critical points of f(x,y) = x² + y²
const criticalPoints = DodecetGradient.findCriticalPoints(
  (x, y) => x*x + y*y,
  { min: -2, max: 2 },
  { min: -2, max: 2 },
  [{ x: 1, y: 1 }, { x: -1, y: -1 }],  // starting points
  100,  // max iterations
  0.1   // learning rate
);

criticalPoints.forEach(cp => {
  console.log(\`Critical point at (\${cp.x.toFixed(4)}, \${cp.y.toFixed(4)})\`);
  console.log(\`  Type: \${cp.type}\`);
  console.log(\`  Encoded: (\${cp.encodedPoint.x.toHexString()}, \${cp.encodedPoint.y.toHexString()})\`);
});

// For x² + y², the only critical point is (0,0) - a minimum
      `,
      explanation: `
        Critical points are candidates for maxima, minima, or saddle points.
        The Hessian matrix helps classify them:
        - det(H) > 0 and tr(H) > 0: minimum
        - det(H) > 0 and tr(H) < 0: maximum
        - det(H) < 0: saddle point
      `,
      interactive: true
    },
    {
      title: 'Level Curves (Contours)',
      description: `
        Level curves connect points with equal function values:
      `,
      code: `
// Compute level curves
const curves = DodecetGradient.levelCurves(
  (x, y) => x*x + y*y,  // circles centered at origin
  { min: -3, max: 3 },
  { min: -3, max: 3 },
  [1, 2, 4, 9],  // levels: x² + y² = 1, 4, 9, 16
  50
);

curves.forEach((points, level) => {
  console.log(\`Level \${level}: \${points.length} points\`);
  // Points approximate circles of radius √level
});
      `,
      explanation: `
        Level curves are perpendicular to gradient vectors.
        For f(x,y) = x² + y², level curves are circles.
        The gradient points outward (radially), perpendicular to circles.
      `,
      interactive: true
    }
  ];

  constructor(containerId: string) {
    this.container = document.getElementById(containerId) || document.body;
  }

  render(): void {
    const step = this.steps[this.currentStep];

    let html = `
      <div class="tutorial-step">
        <div class="step-progress">Step ${this.currentStep + 1} of ${this.steps.length}</div>
        <h2 class="step-title">${step.title}</h2>
        <div class="step-description">${step.description}</div>
    `;

    if (step.mathFormula) {
      html += `<div class="math-formula"><code>${step.mathFormula}</code></div>`;
    }

    if (step.code) {
      html += `<div class="code-block"><pre><code>${this.escapeHtml(step.code)}</code></pre></div>`;
    }

    if (step.explanation) {
      html += `<div class="explanation"><h4>Explanation</h4><p>${step.explanation}</p></div>`;
    }

    html += `
        <div class="step-navigation">
          <button class="btn btn-secondary" ${this.currentStep === 0 ? 'disabled' : ''} onclick="gradTutorial.prev()">Previous</button>
          <button class="btn btn-primary" ${this.currentStep === this.steps.length - 1 ? 'disabled' : ''} onclick="gradTutorial.next()">Next</button>
        </div>
      </div>
    `;

    this.container.innerHTML = html;
  }

  next(): void {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this.render();
    }
  }

  prev(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.render();
    }
  }

  private escapeHtml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

// ===================================
// TUTORIAL STYLES (inject if needed)
// ===================================

const tutorialStyles = `
.tutorial-step {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px;
}

.step-progress {
  color: var(--color-text-secondary);
  font-size: 0.9em;
  margin-bottom: 10px;
}

.step-title {
  color: var(--color-primary);
  font-family: var(--font-display);
  font-size: 1.8em;
  margin-bottom: 20px;
}

.step-description {
  color: var(--color-text);
  line-height: 1.8;
  margin-bottom: 20px;
  white-space: pre-line;
}

.math-formula {
  background: var(--color-bg);
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 20px;
  border-left: 3px solid var(--color-accent);
}

.math-formula code {
  font-family: var(--font-mono);
  font-size: 1.2em;
  color: var(--color-primary);
}

.code-block {
  background: var(--color-bg);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.code-block pre {
  margin: 0;
  padding: 20px;
  overflow-x: auto;
}

.code-block code {
  font-family: var(--font-mono);
  font-size: 0.9em;
  color: var(--color-text);
  line-height: 1.6;
}

.explanation {
  background: rgba(0, 119, 255, 0.1);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.explanation h4 {
  color: var(--color-secondary);
  margin-bottom: 10px;
}

.explanation p {
  color: var(--color-text-secondary);
  line-height: 1.6;
  white-space: pre-line;
}

.step-navigation {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.step-navigation button {
  flex: 1;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-bg);
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.btn-secondary {
  background: var(--color-bg-secondary);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-bg-tertiary);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = tutorialStyles;
  document.head.appendChild(styleElement);
}

// Global exports
(window as any).DifferentiationTutorial = DifferentiationTutorial;
(window as any).IntegrationTutorial = IntegrationTutorial;
(window as any).GradientTutorial = GradientTutorial;
