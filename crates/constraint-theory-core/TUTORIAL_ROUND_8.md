# ConstraintTheory Core - Tutorial with Examples

**Version:** 0.1.0
**Date:** 2026-03-18
**Round:** 8

---

## Table of Contents

1. [Introduction](#introduction)
2. [Quick Start](#quick-start)
3. [Core Concepts](#core-concepts)
4. [Pythagorean Manifold](#pythagorean-manifold)
5. [KD-Tree Spatial Indexing](#kd-tree-spatial-indexing)
6. [Ricci Flow](#ricci-flow)
7. [Rigidity Percolation](#rigidity-percolation)
8. [Performance Optimization](#performance-optimization)
9. [Advanced Examples](#advanced-examples)
10. [Best Practices](#best-practices)

---

## Introduction

ConstraintTheory Core is a high-performance geometric constraint engine that provides:

- **Pythagorean Snapping:** Map continuous vectors to discrete Pythagorean triples
- **Spatial Indexing:** O(log N) nearest neighbor queries via KD-tree
- **Curvature Flow:** Ricci flow for geometric evolution
- **Rigidity Analysis:** Laman's theorem for structural rigidity

### Key Features

- **Zero Dependencies:** No external runtime dependencies
- **Fast:** O(log N) spatial queries, SIMD-optimized batch operations
- **Safe:** Rust memory safety with comprehensive testing
- **Well-Documented:** Extensive API documentation and examples

---

## Quick Start

### Installation

Add to your `Cargo.toml`:

```toml
[dependencies]
constraint-theory-core = "0.1.0"
```

### Basic Usage

```rust
use constraint_theory_core::{PythagoreanManifold, snap};

fn main() {
    // Create a Pythagorean manifold with 200 density
    let manifold = PythagoreanManifold::new(200);

    // Snap a continuous vector to nearest Pythagorean triple
    let vector = [0.6, 0.8];  // Close to (3, 4, 5) triple
    let (snapped, noise) = manifold.snap(vector);

    println!("Original: {:?}", vector);
    println!("Snapped: {:?}", snapped);
    println!("Noise: {:.4}", noise);
}
```

**Output:**
```
Original: [0.6, 0.8]
Snapped: [0.6, 0.8]
Noise: 0.0000
```

---

## Core Concepts

### Pythagorean Triples

A Pythagorean triple (a, b, c) satisfies: a² + b² = c²

**Examples:**
- (3, 4, 5) → normalized: (0.6, 0.8)
- (5, 12, 13) → normalized: (0.3846, 0.9231)
- (8, 15, 17) → normalized: (0.4706, 0.8824)

### Manifold Density

The density parameter controls how many Pythagorean triples are generated:

| Density | States | Memory | Precision |
|---------|--------|--------|-----------|
| 10 | ~100 | ~3 KB | Low |
| 50 | ~1,200 | ~38 KB | Medium |
| 200 | ~40,000 | ~1.25 MB | High |
| 500 | ~100,000 | ~3.1 MB | Very High |

**Recommendation:** Start with density 50-200 for most applications.

### Noise and Resonance

- **Resonance:** Dot product between input and snapped vector (0 to 1)
- **Noise:** 1 - resonance (0 = perfect match, 1 = orthogonal)

```rust
let vector = [0.6, 0.8];
let (snapped, noise) = manifold.snap(vector);

// High resonance (close to 1.0) = low noise
assert!(noise < 0.01);

let random = [0.123, 0.456];
let (snapped2, noise2) = manifold.snap(random);

// Lower resonance = higher noise
assert!(noise2 > 0.1);
```

---

## Pythagorean Manifold

### Creating a Manifold

```rust
use constraint_theory_core::PythagoreanManifold;

// Low density (fast, less precise)
let low_density = PythagoreanManifold::new(10);

// Medium density (balanced)
let medium_density = PythagoreanManifold::new(50);

// High density (precise, slower)
let high_density = PythagoreanManifold::new(200);
```

### Single Vector Snapping

```rust
let manifold = PythagoreanManifold::new(100);

// Snap a vector
let vector = [0.707, 0.707];  // Close to 45 degrees
let (snapped, noise) = manifold.snap(vector);

println!("Input: {:?}", vector);
println!("Snapped: {:?}", snapped);
println!("Noise: {:.4}", noise);
```

### Batch Processing (Scalar)

```rust
let manifold = PythagoreanManifold::new(100);

// Generate test vectors
let vectors: Vec<[f32; 2]> = vec![
    [0.6, 0.8],
    [0.707, 0.707],
    [1.0, 0.0],
    [0.0, 1.0],
];

// Pre-allocate results buffer
let mut results = vec![([0.0, 0.0], 0.0); vectors.len()];

// Snap all vectors (scalar implementation)
manifold.snap_batch(&vectors, &mut results);

for (i, (input, (snapped, noise))) in vectors.iter().zip(results.iter()).enumerate() {
    println!("{}: {:?} -> {:?} (noise: {:.4})", i, input, snapped, noise);
}
```

### Batch Processing (SIMD)

**Warning:** SIMD is only faster for large batches (> 1000 vectors). Use scalar for typical use cases.

```rust
let manifold = PythagoreanManifold::new(200);

// Large batch (SIMD beneficial)
let large_batch: Vec<[f32; 2]> = (0..10_000)
    .map(|i| {
        let angle = (i as f32) * 0.0001;
        [angle.sin(), angle.cos()]
    })
    .collect();

let mut results = vec![([0.0, 0.0], 0.0); large_batch.len()];

// SIMD implementation (only for large batches)
manifold.snap_batch_simd_into(&large_batch, &mut results);
```

---

## KD-Tree Spatial Indexing

### Understanding the KD-tree

The KD-tree provides O(log N) nearest neighbor lookup, which is crucial for performance:

| Operation | Without KD-tree | With KD-tree |
|-----------|----------------|--------------|
| Single snap | O(N) | O(log N) |
| 1000 snaps | O(1000N) | O(1000 log N) |
| 100K states | 100K operations | ~17 operations |

### Using the KD-tree Directly

```rust
use constraint_theory_core::kdtree::KDTree;

// Create some 2D points
let points = vec![
    [0.0, 0.0],
    [1.0, 0.0],
    [0.0, 1.0],
    [1.0, 1.0],
];

// Build KD-tree
let kdtree = KDTree::build(&points);

// Find nearest neighbor
let query = [0.3, 0.4];
if let Some((nearest, idx, dist_sq)) = kdtree.nearest(&query) {
    println!("Nearest: {:?} at index {} (distance²: {:.4})",
             nearest, idx, dist_sq);
}

// Find k-nearest neighbors
let k_neighbors = kdtree.nearest_k(&query, 2);
for (i, (point, idx, dist_sq)) in k_neighbors.iter().enumerate() {
    println!("Neighbor {}: {:?} at {} (distance²: {:.4})",
             i + 1, point, idx, dist_sq);
}
```

### Performance Comparison

```rust
use std::time::Instant;
use constraint_theory_core::PythagoreanManifold;

let manifold = PythagoreanManifold::new(500);  // ~100K states
let test_vectors: Vec<[f32; 2]> = (0..1000)
    .map(|i| {
        let angle = (i as f32) * 0.001;
        [angle.sin(), angle.cos()]
    })
    .collect();

// Time single-vector snaps
let start = Instant::now();
for vec in &test_vectors {
    let _ = manifold.snap(*vec);
}
let single_time = start.elapsed();

println!("1000 single-vector snaps: {:?}", single_time);
println!("Average per snap: {:.2} µs",
         single_time.as_micros() as f32 / 1000.0);
```

---

## Ricci Flow

### What is Ricci Flow?

Ricci flow is a geometric evolution equation that smooths curvature over time. It's used in:

- **Riemannian geometry:** Metric evolution
- **Geometric analysis:** Proof of Poincaré conjecture
- **Computer graphics:** Mesh smoothing
- **Manifold learning:** Dimensionality reduction

### Basic Usage

```rust
use constraint_theory_core::curvature::{RicciFlow, ricci_flow_step};

// Create Ricci flow with alpha=0.1, targeting zero curvature
let mut rf = RicciFlow::new(0.1, 0.0);

// Initial curvatures
let mut curvatures = vec![1.0, 0.5, -0.5, 0.0, 0.8];

// Evolve for 10 steps
rf.evolve(&mut curvatures, 10);

println!("Evolved curvatures: {:?}", curvatures);
// All values should be closer to 0.0 now
```

### Single Step Evolution

```rust
use constraint_theory_core::curvature::ricci_flow_step;

let curvature = 1.0;
let alpha = 0.1;
let target = 0.0;

let new_curvature = ricci_flow_step(curvature, alpha, target);

println!("Original: {:.4}", curvature);
println!("New: {:.4}", new_curvature);
// new_curvature = 1.0 + 0.1 * (0.0 - 1.0) = 0.9
```

### Convergence Example

```rust
use constraint_theory_core::curvature::RicciFlow;

let mut rf = RicciFlow::new(0.1, 0.0);
let mut curvature = 2.0;

println!("Step 0: {:.6}", curvature);
for step in 1..=20 {
    rf.evolve(&mut [curvature], 1);
    println!("Step {}: {:.6}", step, curvature);
}

// Curvature should converge to 0.0
```

---

## Rigidity Percolation

### Laman's Theorem

A graph with V vertices is minimally rigid if:
1. It has exactly 2V - 3 edges
2. Every subgraph with k vertices has at most 2k - 3 edges

### Basic Usage

```rust
use constraint_theory_core::percolation::{FastPercolation, RigidityResult};

// Create percolation structure for 5 nodes
let mut perc = FastPercolation::new(5);

// Define edges
let edges = vec![
    (0, 1),
    (1, 2),
    (2, 3),
    (3, 4),
    (4, 0),  // Close the loop
];

// Compute rigidity
let result = perc.compute_rigidity(&edges, 5);

println!("Is rigid: {}", result.is_rigid);
println!("Rank: {}", result.rank);
println!("Deficiency: {}", result.deficiency);
println!("Clusters: {}", result.n_clusters);
println!("Rigid fraction: {:.2}", result.rigid_fraction);
```

### Rigid vs Non-Rigid Examples

```rust
use constraint_theory_core::percolation::FastPercolation;

// Triangle (rigid)
let mut triangle = FastPercolation::new(3);
let triangle_edges = vec![(0, 1), (1, 2), (2, 0)];
let triangle_result = triangle.compute_rigidity(&triangle_edges, 3);
assert!(triangle_result.is_rigid);

// Line (non-rigid)
let mut line = FastPercolation::new(3);
let line_edges = vec![(0, 1), (1, 2)];
let line_result = line.compute_rigidity(&line_edges, 3);
assert!(!line_result.is_rigid);
```

---

## Performance Optimization

### Choosing the Right Manifold Density

```rust
use constraint_theory_core::PythagoreanManifold;
use std::time::Instant;

fn benchmark_density(density: usize) {
    let manifold = PythagoreanManifold::new(density);
    let vectors: Vec<[f32; 2]> = (0..10_000)
        .map(|i| {
            let angle = (i as f32) * 0.0001;
            [angle.sin(), angle.cos()]
        })
        .collect();

    let start = Instant::now();
    for vec in &vectors {
        let _ = manifold.snap(*vec);
    }
    let elapsed = start.elapsed();

    println!("Density {}: {} states, {:?} total, {:.2} µs/snap",
             density, manifold.state_count(), elapsed,
             elapsed.as_micros() as f32 / 10_000.0);
}

// Benchmark different densities
benchmark_density(10);
benchmark_density(50);
benchmark_density(100);
benchmark_density(200);
benchmark_density(500);
```

### Scalar vs SIMD Decision Tree

```
┌─────────────────────────────────────┐
│  How many vectors to process?       │
└──────────────┬──────────────────────┘
               │
        ┌──────┴──────┐
        │             │
    < 1000        >= 1000
        │             │
        ▼             ▼
    Use Scalar    Use SIMD
  (snap_batch)  (snap_batch_simd)
```

### Memory-Efficient Batch Processing

```rust
use constraint_theory_core::PythagoreanManifold;

let manifold = PythagoreanManifold::new(100);

// Process in chunks to avoid large allocations
let large_dataset: Vec<[f32; 2]> = /* ... */;
let chunk_size = 1000;

for chunk in large_dataset.chunks(chunk_size) {
    let mut results = vec![([0.0, 0.0], 0.0); chunk.len()];
    manifold.snap_batch(chunk, &mut results);

    // Process results...
    for (snapped, noise) in results {
        // Do something with snapped vector
    }
}
```

---

## Advanced Examples

### Custom Pythagorean Triple Generation

```rust
use constraint_theory_core::manifold::PythagoreanTriple;

// Generate custom triple
let triple = PythagoreanTriple::new(3.0, 4.0, 5.0);

assert!(triple.is_valid());

// Convert to normalized vector
let vector = triple.to_vector();
println!("Triple (3, 4, 5) -> vector {:?}", vector);
// Output: [0.6, 0.8]
```

### Noise Filtering

```rust
use constraint_theory_core::PythagoreanManifold;

let manifold = PythagoreanManifold::new(100);
let vectors: Vec<[f32; 2]> = vec![
    [0.6, 0.8],      // Low noise
    [0.123, 0.456],  // High noise
    [1.0, 0.0],      // Zero noise (exact)
];

// Filter by noise threshold
let noise_threshold = 0.1;
let filtered: Vec<_> = vectors.iter()
    .filter_map(|&vec| {
        let (snapped, noise) = manifold.snap(vec);
        if noise < noise_threshold {
            Some((vec, snapped, noise))
        } else {
            None
        }
    })
    .collect();

println!("Vectors with noise < {:.2}:", noise_threshold);
for (original, snapped, noise) in filtered {
    println!("  {:?} -> {:?} (noise: {:.4})",
             original, snapped, noise);
}
```

### Iterative Refinement

```rust
use constraint_theory_core::PythagoreanManifold;

let manifold = PythagoreanManifold::new(200);
let mut vector = [0.55, 0.75];  // Not exactly on a triple

println!("Initial: {:?}", vector);

// Iteratively snap to converge to exact triple
for iteration in 0..5 {
    let (snapped, noise) = manifold.snap(vector);
    println!("  {}: {:?} -> {:?} (noise: {:.6})",
             iteration, vector, snapped, noise);

    vector = snapped;

    if noise < 1e-6 {
        println!("  Converged!");
        break;
    }
}
```

---

## Best Practices

### 1. Choose Appropriate Density

```rust
// ❌ Too low - poor precision
let too_low = PythagoreanManifold::new(5);

// ✅ Good balance
let balanced = PythagoreanManifold::new(50);

// ✅ High precision for critical applications
let high_precision = PythagoreanManifold::new(200);

// ❌ Usually unnecessary - diminishing returns
let excessive = PythagoreanManifold::new(1000);
```

### 2. Reuse Manifold Instances

```rust
// ❌ Creates new manifold each time (slow)
fn process_vector(vec: [f32; 2]) -> ([f32; 2], f32) {
    let manifold = PythagoreanManifold::new(100);
    manifold.snap(vec)
}

// ✅ Reuse manifold (fast)
struct Processor {
    manifold: PythagoreanManifold,
}

impl Processor {
    fn new() -> Self {
        Self {
            manifold: PythagoreanManifold::new(100),
        }
    }

    fn process(&self, vec: [f32; 2]) -> ([f32; 2], f32) {
        self.manifold.snap(vec)
    }
}
```

### 3. Use Scalar for Typical Workloads

```rust
let manifold = PythagoreanManifold::new(100);
let vectors: Vec<[f32; 2]> = /* ... */;

// ❌ SIMD for small batch (slower)
if vectors.len() < 100 {
    let mut results = vec![([0.0, 0.0], 0.0); vectors.len()];
    manifold.snap_batch_simd_into(&vectors, &mut results);
}

// ✅ Scalar for small batch (faster)
if vectors.len() < 100 {
    let mut results = vec![([0.0, 0.0], 0.0); vectors.len()];
    manifold.snap_batch(&vectors, &mut results);
}

// ✅ SIMD only for large batches
if vectors.len() >= 1000 {
    let mut results = vec![([0.0, 0.0], 0.0); vectors.len()];
    manifold.snap_batch_simd_into(&vectors, &mut results);
}
```

### 4. Pre-Allocate Result Buffers

```rust
// ❌ Allocates on each call
for vec in &vectors {
    let mut results = vec![([0.0, 0.0], 0.0); 1];
    manifold.snap_batch(&[*vec], &mut results);
}

// ✅ Allocate once, reuse
let mut results = vec![([0.0, 0.0], 0.0); vectors.len()];
manifold.snap_batch(&vectors, &mut results);
```

### 5. Handle Edge Cases

```rust
use constraint_theory_core::PythagoreanManifold;

let manifold = PythagoreanManifold::new(100);

// Handle zero vector
let zero = [0.0, 0.0];
let (snapped, noise) = manifold.snap(zero);
assert_eq!(snapped, [1.0, 0.0]);  // Default fallback

// Handle very small vectors
let tiny = [1e-20, 1e-20];
let (snapped, noise) = manifold.snap(tiny);
// Should handle gracefully, not panic

// Handle very large vectors
let huge = [1e20, 1e20];
let (snapped, noise) = manifold.snap(huge);
// Should normalize and snap correctly
```

---

## Troubleshooting

### Problem: SIMD is slower than scalar

**Solution:** This is expected for small batches. Use scalar for < 1000 vectors.

```rust
// Benchmark to confirm
let vectors: Vec<[f32; 2]> = /* ... */;

if vectors.len() < 1000 {
    // Use scalar
    manifold.snap_batch(&vectors, &mut results);
} else {
    // Try SIMD, but benchmark to verify it's faster
    // SIMD has overhead that may not be worth it
}
```

### Problem: High noise values

**Solution:** Increase manifold density for better precision.

```rust
// Low precision
let low = PythagoreanManifold::new(10);
let (_, noise) = low.snap([0.123, 0.456]);
// noise might be 0.3 or higher

// High precision
let high = PythagoreanManifold::new(200);
let (_, noise) = high.snap([0.123, 0.456]);
// noise should be lower
```

### Problem: Memory usage too high

**Solution:** Process in chunks or reduce density.

```rust
// Process large dataset in chunks
for chunk in large_dataset.chunks(1000) {
    let mut results = vec![([0.0, 0.0], 0.0); chunk.len()];
    manifold.snap_batch(chunk, &mut results);
    // Process results...
}
```

---

## Further Reading

- **API Documentation:** `src/lib.rs`
- **Performance Guide:** `PERFORMANCE_ANALYSIS_SUMMARY.md`
- **Optimization Roadmap:** `OPTIMIZATION_ROADMAP.md`
- **Profiling Guide:** `PROFILING_GUIDE.md`

---

**Last Updated:** 2026-03-18
**Version:** 0.1.0
**Round:** 8
