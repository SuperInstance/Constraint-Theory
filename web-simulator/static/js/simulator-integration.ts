/**
 * Dodecet Geometric Integration for All 8 Simulators
 *
 * Shows how to integrate Point3D, Vector3D, and Transform3D
 * into each of the 8 constraint theory simulators.
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
// 1. PYTHAGOREAN SNAPPING INTEGRATION
// ===================================

export class PythagoreanDodecetIntegration {
  private points: DodecetPoint3D[] = [];

  constructor() {
    // Generate Pythagorean triple points using dodecet precision
    this.generatePythagoreanPoints();
  }

  generatePythagoreanPoints(): void {
    // Primitive triples encoded as dodecet points
    const triples = [
      [3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25],
      [20, 21, 29], [12, 35, 37], [9, 40, 41]
    ];

    this.points = triples.map(([a, b, c]) => {
      return new DodecetPoint3D(
        Math.round((a / c) * 4095),
        Math.round((b / c) * 4095),
        0x800 // Z = center
      );
    });
  }

  snapVector(inputX: number, inputY: number): {
    snapped: DodecetPoint3D;
    original: DodecetPoint3D;
    distance: number;
    hexEncoding: string;
  } {
    const input = new DodecetPoint3D(
      Math.round(inputX * 4095),
      Math.round(inputY * 4095),
      0x800
    );

    // Find nearest point
    let nearest = this.points[0];
    let minDist = input.distanceTo(nearest);

    for (const point of this.points) {
      const dist = input.distanceTo(point);
      if (dist < minDist) {
        minDist = dist;
        nearest = point;
      }
    }

    return {
      snapped: nearest,
      original: input,
      distance: minDist,
      hexEncoding: nearest.toHexString()
    };
  }

  getHexVisualization(): string {
    return this.points.map(p => {
      const [x, y] = p.toNormalizedArray();
      return `(${x.toFixed(3)}, ${y.toFixed(3)}) -> ${p.toHexString().substring(0, 6)}`;
    }).join('\n');
  }
}

// ===================================
// 2. RIGIDITY MATROID INTEGRATION
// ===================================

export class RigidityDodecetIntegration {
  private edges: Array<{
    from: DodecetPoint3D;
    to: DodecetPoint3D;
    weight: Dodecet;
    vector: DodecetVector3D;
  }> = [];

  constructor() {
    this.generateRigidStructure();
  }

  generateRigidStructure(): void {
    // Create a triangle with dodecet precision
    const p1 = new DodecetPoint3D(0x400, 0x400, 0x800);
    const p2 = new DodecetPoint3D(0xC00, 0x400, 0x800);
    const p3 = new DodecetPoint3D(0x800, 0xC00, 0x800);

    // Create edges with vector weights
    this.edges.push({
      from: p1,
      to: p2,
      weight: new Dodecet(0xFFF), // Max weight
      vector: new DodecetVector3D(0x800, 0, 0)
    });

    this.edges.push({
      from: p2,
      to: p3,
      weight: new Dodecet(0xFFF),
      vector: new DodecetVector3D(0x800, 0x800, 0)
    });

    this.edges.push({
      from: p3,
      to: p1,
      weight: new Dodecet(0xFFF),
      vector: new DodecetVector3D(0x800, 0x800, 0)
    });
  }

  checkRigidity(): boolean {
    // Laman's theorem: 2n - 3 edges for minimal rigidity
    const n = 3; // Number of vertices
    const m = this.edges.length; // Number of edges
    return m >= 2 * n - 3;
  }

  getEdgeHexEncoding(): string[] {
    return this.edges.map(edge => {
      const [x, y, z] = edge.vector.toArray();
      return `Edge: ${edge.vector.toSpacedHexString()} | Mag: ${edge.vector.magnitude().toFixed(3)}`;
    });
  }
}

// ===================================
// 3. HOLONOMY TRANSPORT INTEGRATION
// ===================================

export class HolonomyDodecetIntegration {
  private path: DodecetPoint3D[] = [];
  private transform: DodecetTransform3D;

  constructor() {
    this.transform = new DodecetTransform3D();
    this.generateTransportPath();
  }

  generateTransportPath(): void {
    // Create a circular path using dodecet points
    const steps = 8;
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const x = Math.round((Math.cos(angle) * 0.5 + 0.5) * 4095);
      const y = Math.round((Math.sin(angle) * 0.5 + 0.5) * 4095);
      this.path.push(new DodecetPoint3D(x, y, 0x800));
    }
  }

  transportVector(vector: DodecetVector3D): {
    final: DodecetVector3D;
    holonomy: number; // Angle of rotation
    hexPath: string;
  } {
    let current = vector;

    // Apply rotation at each point
    for (let i = 0; i < this.path.length; i++) {
      const angle = (Math.PI * 2) / this.path.length;
      const axis = DodecetVector3D.unitZ();
      const rotation = DodecetTransform3D.rotation(axis, angle);
      current = rotation.transformDirection(current);
    }

    // Calculate holonomy (difference from original)
    const holonomy = vector.angleTo(current);

    return {
      final: current,
      holonomy: holonomy,
      hexPath: this.path.map(p => p.toHexString().substring(0, 6)).join(' -> ')
    };
  }

  getPathVisualization(): string {
    return this.path.map(p => {
      const [x, y] = p.toNormalizedArray();
      return `(${x.toFixed(3)}, ${y.toFixed(3)})`;
    }).join(' -> ');
  }
}

// ===================================
// 4. ENTROPY DYNAMICS INTEGRATION
// ===================================

export class EntropyDodecetIntegration {
  private stateSpace: DodecetPoint3D[] = [];

  constructor() {
    this.generateStateSpace();
  }

  generateStateSpace(): void {
    // Create 3D state space grid using dodecet precision
    const resolution = 8;
    for (let x = 0; x < resolution; x++) {
      for (let y = 0; y < resolution; y++) {
        for (let z = 0; z < resolution; z++) {
          const dx = Math.round((x / resolution) * 4095);
          const dy = Math.round((y / resolution) * 4095);
          const dz = Math.round((z / resolution) * 4095);
          this.stateSpace.push(new DodecetPoint3D(dx, dy, dz));
        }
      }
    }
  }

  calculateEntropy(region: DodecetPoint3D[]): number {
    // Shannon entropy calculation
    const total = region.length;
    const counts = new Map<string, number>();

    region.forEach(p => {
      const key = p.toHexString().substring(0, 3); // Coarse-grain
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    let entropy = 0;
    counts.forEach(count => {
      const p = count / total;
      entropy -= p * Math.log2(p);
    });

    return entropy;
  }

  getStateSpaceHex(): string {
    return `State space size: ${this.stateSpace.length} points\n` +
           `Encoding: ${this.stateSpace.length * 9} hex digits\n` +
           `Precision: 12-bit per coordinate`;
  }
}

// ===================================
// 5. KD-TREE SPATIAL INTEGRATION
// ===================================

export class KDTreeDodecetIntegration {
  private points: DodecetPoint3D[] = [];
  private tree: DodecetKDTree | null = null;

  constructor() {
    this.generatePoints();
  }

  generatePoints(): void {
    // Generate random points using dodecet precision
    for (let i = 0; i < 100; i++) {
      const x = Math.floor(Math.random() * 4096);
      const y = Math.floor(Math.random() * 4096);
      const z = Math.floor(Math.random() * 4096);
      this.points.push(new DodecetPoint3D(x, y, z));
    }

    this.tree = new DodecetKDTree(this.points);
  }

  findNearest(query: DodecetPoint3D): {
    nearest: DodecetPoint3D;
    distance: number;
    hexEncoding: string;
  } {
    if (!this.tree) {
      throw new Error('KD-tree not initialized');
    }

    const nearest = this.tree.nearest(query);
    return {
      nearest: nearest.point,
      distance: nearest.distance,
      hexEncoding: nearest.point.toHexString()
    };
  }

  getTreeVisualization(): string {
    return this.points.slice(0, 10).map(p => {
      const [x, y, z] = p.toNormalizedArray();
      return `Point: ${p.toSpacedHexString()} -> (${x.toFixed(3)}, ${y.toFixed(3)}, ${z.toFixed(3)})`;
    }).join('\n');
  }
}

// ===================================
// DODECET KD-TREE IMPLEMENTATION
// ===================================

class DodecetKDTree {
  private root: DodecetKDNode | null = null;

  constructor(points: DodecetPoint3D[]) {
    this.root = this.build(points, 0);
  }

  private build(points: DodecetPoint3D[], depth: number): DodecetKDNode | null {
    if (points.length === 0) return null;

    const axis = depth % 3; // 0=x, 1=y, 2=z
    points.sort((a, b) => {
      const aVal = axis === 0 ? a.getX().toNumber() : axis === 1 ? a.getY().toNumber() : a.getZ().toNumber();
      const bVal = axis === 0 ? b.getX().toNumber() : axis === 1 ? b.getY().toNumber() : b.getZ().toNumber();
      return aVal - bVal;
    });

    const mid = Math.floor(points.length / 2);
    return new DodecetKDNode(
      points[mid],
      this.build(points.slice(0, mid), depth + 1),
      this.build(points.slice(mid + 1), depth + 1),
      axis
    );
  }

  nearest(query: DodecetPoint3D): { point: DodecetPoint3D; distance: number } {
    if (!this.root) {
      throw new Error('Empty tree');
    }

    return this.nearestHelper(this.root, query, this.root.point, Infinity);
  }

  private nearestHelper(
    node: DodecetKDNode | null,
    query: DodecetPoint3D,
    best: DodecetPoint3D,
    bestDist: number
  ): { point: DodecetPoint3D; distance: number } {
    if (!node) return { point: best, distance: bestDist };

    const dist = query.distanceTo(node.point);
    if (dist < bestDist) {
      best = node.point;
      bestDist = dist;
    }

    const axis = node.axis;
    const queryVal = axis === 0 ? query.getX() : axis === 1 ? query.getY() : query.getZ();
    const nodeVal = axis === 0 ? node.point.getX() : axis === 1 ? node.point.getY() : node.point.getZ();

    const near = queryVal.toNumber() < nodeVal.toNumber() ? node.left : node.right;
    const far = queryVal.toNumber() < nodeVal.toNumber() ? node.right : node.left;

    const result = this.nearestHelper(near, query, best, bestDist);
    best = result.point;
    bestDist = result.distance;

    // Check if we need to search the far side
    const diff = (queryVal.toNumber() - nodeVal.toNumber()) / 4095;
    if (diff * diff < bestDist) {
      const farResult = this.nearestHelper(far, query, best, bestDist);
      if (farResult.distance < bestDist) {
        best = farResult.point;
        bestDist = farResult.distance;
      }
    }

    return { point: best, distance: bestDist };
  }
}

class DodecetKDNode {
  constructor(
    public point: DodecetPoint3D,
    public left: DodecetKDNode | null,
    public right: DodecetKDNode | null,
    public axis: number
  ) {}
}

// ===================================
// 6. PERMUTATION GROUPS INTEGRATION
// ===================================

export class PermutationDodecetIntegration {
  private permutations: DodecetTransform3D[] = [];

  constructor() {
    this.generatePermutations();
  }

  generatePermutations(): void {
    // Generate symmetry group using dodecet transforms
    const axes = [
      DodecetVector3D.unitX(),
      DodecetVector3D.unitY(),
      DodecetVector3D.unitZ()
    ];

    const angles = [0, Math.PI / 2, Math.PI, 3 * Math.PI / 2];

    axes.forEach(axis => {
      angles.forEach(angle => {
        this.permutations.push(DodecetTransform3D.rotation(axis, angle));
      });
    });
  }

  applyPermutation(point: DodecetVector3D, index: number): DodecetVector3D {
    if (index >= this.permutations.length) {
      throw new Error('Invalid permutation index');
    }

    return this.permutations[index].transformDirection(point);
  }

  getGroupVisualization(): string {
    return this.permutations.map((t, i) => {
      return `Permutation ${i}: ${t.toHexString().substring(0, 12)}...`;
    }).join('\n');
  }
}

// ===================================
// 7. ORIGAMI MATHEMATICS INTEGRATION
// ===================================

export class OrigamiDodecetIntegration {
  private vertices: DodecetPoint3D[] = [];
  private folds: Array<{
    start: DodecetPoint3D;
    end: DodecetPoint3D;
    normal: DodecetVector3D;
  }> = [];

  constructor() {
    this.generateOrigamiStructure();
  }

  generateOrigamiStructure(): void {
    // Create square paper
    this.vertices = [
      new DodecetPoint3D(0x400, 0x400, 0x800), // Bottom-left
      new DodecetPoint3D(0xC00, 0x400, 0x800), // Bottom-right
      new DodecetPoint3D(0xC00, 0xC00, 0x800), // Top-right
      new DodecetPoint3D(0x400, 0xC00, 0x800)  // Top-left
    ];

    // Add a diagonal fold
    this.folds.push({
      start: this.vertices[0],
      end: this.vertices[2],
      normal: DodecetVector3D.unitZ()
    });
  }

  foldPoint(point: DodecetPoint3D, foldIndex: number): DodecetPoint3D {
    if (foldIndex >= this.folds.length) {
      throw new Error('Invalid fold index');
    }

    const fold = this.folds[foldIndex];
    const transform = DodecetTransform3D.rotation(fold.normal, Math.PI);

    // Transform point relative to fold line
    const vector = new DodecetVector3D(
      point.getX().toNumber(),
      point.getY().toNumber(),
      point.getZ().toNumber()
    );

    const transformed = transform.transformDirection(vector);

    return new DodecetPoint3D(
      transformed.getX().toNumber(),
      transformed.getY().toNumber(),
      transformed.getZ().toNumber()
    );
  }

  getOrigamiVisualization(): string {
    return `Vertices: ${this.vertices.length}\n` +
           `Folds: ${this.folds.length}\n` +
           `Vertex encoding: ${this.vertices.map(v => v.toHexString().substring(0, 6)).join(', ')}`;
  }
}

// ===================================
// 8. CELL BOTS INTEGRATION
// ===================================

export class CellBotsDodecetIntegration {
  private agents: Array<{
    id: number;
    position: DodecetPoint3D;
    velocity: DodecetVector3D;
  }> = [];

  constructor() {
    this.initializeAgents();
  }

  initializeAgents(): void {
    // Create 5 autonomous agents
    for (let i = 0; i < 5; i++) {
      const x = Math.floor(Math.random() * 4096);
      const y = Math.floor(Math.random() * 4096);
      const z = Math.floor(Math.random() * 4096);

      this.agents.push({
        id: i,
        position: new DodecetPoint3D(x, y, z),
        velocity: DodecetVector3D.zero()
      });
    }
  }

  updateAgents(dt: number): void {
    this.agents.forEach(agent => {
      // Apply velocity to position
      const newPos = agent.position.toArray();
      const vel = agent.velocity.toArray();

      agent.position = new DodecetPoint3D(
        Math.round((newPos[0] + vel[0] * dt) * 2048 + 2048),
        Math.round((newPos[1] + vel[1] * dt) * 2048 + 2048),
        Math.round((newPos[2] + vel[2] * dt) * 2048 + 2048)
      );
    });
  }

  getAgentVisualization(): string {
    return this.agents.map(agent => {
      const [x, y, z] = agent.position.toNormalizedArray();
      const [vx, vy, vz] = agent.velocity.toArray();
      return `Agent ${agent.id}: (${x.toFixed(3)}, ${y.toFixed(3)}, ${z.toFixed(3)}) ` +
             `vel: (${vx.toFixed(3)}, ${vy.toFixed(3)}, ${vz.toFixed(3)}) ` +
             `hex: ${agent.position.toHexString().substring(0, 6)}`;
    }).join('\n');
  }
}

// ===================================
// UNIFIED INTEGRATION INTERFACE
// ===================================

export class DodecetSimulatorIntegrator {
  private pythagorean: PythagoreanDodecetIntegration;
  private rigidity: RigidityDodecetIntegration;
  private holonomy: HolonomyDodecetIntegration;
  private entropy: EntropyDodecetIntegration;
  private kdtree: KDTreeDodecetIntegration;
  private permutation: PermutationDodecetIntegration;
  private origami: OrigamiDodecetIntegration;
  private cellbots: CellBotsDodecetIntegration;

  constructor() {
    this.pythagorean = new PythagoreanDodecetIntegration();
    this.rigidity = new RigidityDodecetIntegration();
    this.holonomy = new HolonomyDodecetIntegration();
    this.entropy = new EntropyDodecetIntegration();
    this.kdtree = new KDTreeDodecetIntegration();
    this.permutation = new PermutationDodecetIntegration();
    this.origami = new OrigamiDodecetIntegration();
    this.cellbots = new CellBotsDodecetIntegration();
  }

  getAllSimulations(): {
    pythagorean: string;
    rigidity: string;
    holonomy: string;
    entropy: string;
    kdtree: string;
    permutation: string;
    origami: string;
    cellbots: string;
  } {
    return {
      pythagorean: this.pythagorean.getHexVisualization(),
      rigidity: this.rigidity.getEdgeHexEncoding().join('\n'),
      holonomy: this.holonomy.getPathVisualization(),
      entropy: this.entropy.getStateSpaceHex(),
      kdtree: this.kdtree.getTreeVisualization(),
      permutation: this.permutation.getGroupVisualization(),
      origami: this.origami.getOrigamiVisualization(),
      cellbots: this.cellbots.getAgentVisualization()
    };
  }

  getPrecisionSummary(): string {
    const improvement = GeometricComparison.precisionImprovement();
    return `12-bit Dodecet Precision Summary:\n` +
           `States: ${improvement.states}\n` +
           `vs 8-bit: ${improvement.vs8Bit}x more precision\n` +
           `All 8 simulators using dodecet encoding`;
  }
}
