# Constraint Theory

A Rust library that snaps continuous vectors to exact Pythagorean coordinates via O(log n) KD-tree lookup.

[![CI](https://github.com/SuperInstance/Constraint-Theory/actions/workflows/ci.yml/badge.svg)](https://github.com/SuperInstance/Constraint-Theory/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![crate](https://img.shields.io/badge/crates.io-v0.1.0-orange)](https://crates.io/crates/constraint-theory-core)

---

## What Is This?

Constraint Theory builds a discrete manifold of [Pythagorean triples](https://en.wikipedia.org/wiki/Pythagorean_triple) (integer-ratio points on the unit circle), indexes them in a KD-tree, and provides a "snap" operator that maps any continuous 2D vector to its nearest exact geometric state. The output is deterministic and always satisfies the constraint predicate — invalid states are excluded by construction, not by validation.

**Status:** Research release (v0.1.0). 2D only, ~1000 states at default density. Zero dependencies.

---

## Quick Start

```bash
git clone https://github.com/SuperInstance/Constraint-Theory.git
cd Constraint-Theory/crates/constraint-theory-core
cargo test --release
```

### Usage

```rust
use constraint_theory_core::{PythagoreanManifold, snap};

// Build manifold: 200 density → ~1000 Pythagorean states
let manifold = PythagoreanManifold::new(200);

// Snap a continuous vector to its nearest exact state
let (snapped, noise) = snap(&manifold, [0.6, 0.8]);

// (0.6, 0.8) = (3/5, 4/5) — an exact Pythagorean triple
assert!(noise < 0.001);
```

### Batch Processing (SIMD)

```rust
use constraint_theory_core::PythagoreanManifold;

let manifold = PythagoreanManifold::new(200);
let vectors = vec![[0.6, 0.8], [0.8, 0.6], [0.1, 0.99]];
let results = manifold.snap_batch_simd(&vectors);

for (snapped, noise) in results {
    println!("({:.4}, {:.4}) noise={:.6}", snapped[0], snapped[1], noise);
}
```

---

## How It Works

```
Input: continuous vector v ∈ ℝ²
         ↓
KD-tree nearest-neighbor search: O(log n)
         ↓
Output: exact Pythagorean triple (a/c, b/c) where a² + b² = c²
```

1. **Build the manifold**: Generate all primitive Pythagorean triples up to a given density, normalize them to unit vectors, and insert into a KD-tree.
2. **Snap**: Given any 2D vector, find the nearest manifold point via KD-tree lookup. The result is always an exact rational coordinate — no floating-point drift.
3. **Batch snap**: Process thousands of vectors using AVX2 SIMD intrinsics for throughput-sensitive applications.

The key insight: by restricting the output space to a discrete set of geometrically valid states, you get deterministic computation for free. The constraint predicate `a² + b² = c²` is satisfied by construction, not checked after the fact.

---

## Benchmarks

All benchmarks run on a 200-density manifold (~1000 states), release build. These are hand-rolled `Instant::now()` measurements — criterion benchmarks are planned.

| Operation | Time | Complexity |
|-----------|------|------------|
| Manifold build | ~50 μs | O(n log n) |
| Single snap (KD-tree) | ~100 ns | O(log n) |
| Batch snap (SIMD) | ~74 ns/op | O(log n) |
| Brute-force snap (no KD-tree) | ~10.9 μs | O(n) |

**Context**: The ~100ns KD-tree lookup is consistent with other Rust spatial indexing crates like [kiddo](https://crates.io/crates/kiddo) and [kd-tree](https://crates.io/crates/kd-tree). The contribution here isn't a faster KD-tree — it's the framework for constraining outputs to exact Pythagorean coordinates.

**What the README used to say**: "109× faster than NumPy." That comparison (Rust KD-tree vs Python brute-force) is technically accurate but misleading. See [BENCHMARKS.md](docs/BENCHMARKS.md) for honest methodology and proper baselines.

---

## Limitations

Be upfront about these:

- **2D only** — the manifold is a set of Pythagorean triples on the unit circle. Higher dimensions are an open research problem.
- **~1000 states** at default density — this is a discrete lattice, not a continuous space. Resolution is finite.
- **Research-grade** — core algorithms work and are tested (82 tests), but this hasn't been battle-tested in production.
- **No ML validation** — theoretical connections to vector quantization exist but are unvalidated empirically.
- **Exact arithmetic, not general CSP** — for general constraint satisfaction, use [OR-Tools](https://developers.google.com/optimization) or [Gecode](https://www.gecode.org/).

See [DISCLAIMERS.md](docs/DISCLAIMERS.md) for detailed scope clarifications.

---

## Project Structure

```
Constraint-Theory/
├── crates/
│   └── constraint-theory-core/   # The Rust library (zero deps)
│       ├── src/
│       │   ├── manifold.rs       # PythagoreanManifold + snap
│       │   ├── kdtree.rs         # Spatial indexing
│       │   ├── simd.rs           # AVX2 batch processing
│       │   ├── curvature.rs      # Ricci flow evolution
│       │   ├── cohomology.rs     # Sheaf cohomology
│       │   ├── percolation.rs    # Rigidity percolation
│       │   └── gauge.rs          # Holonomy transport
│       └── examples/             # Runnable benchmarks
├── web/                          # Interactive demos (HTML/JS)
│   └── simulators/               # 45 visualizations
├── docs/                         # Research documents
└── CONTRIBUTING.md
```

The core library is **~73KB of Rust** with zero production dependencies. The `web/` directory contains interactive demos — these are supplementary, not part of the crate.

---

## Documentation

- **[TUTORIAL.md](docs/TUTORIAL.md)** — Step-by-step guide
- **[BENCHMARKS.md](docs/BENCHMARKS.md)** — Performance methodology and honest comparisons
- **[DISCLAIMERS.md](docs/DISCLAIMERS.md)** — Scope clarifications (read this before citing the project)
- **[Mathematical Foundations](docs/MATHEMATICAL_FOUNDATIONS_DEEP_DIVE.md)** — Full theoretical treatment

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for build instructions, code style, and PR process.

Areas where contributions would be especially valuable:
- Higher-dimensional generalizations (3D Pythagorean quadruples, nD)
- Empirical validation on ML tasks (vector quantization, embeddings)
- Criterion benchmarks and comparison with other spatial indexing crates
- GPU implementations (CUDA, WebGPU)

---

## Citation

```bibtex
@software{constraint_theory,
  title={Constraint Theory: Deterministic Manifold Snapping via Pythagorean Geometry},
  author={SuperInstance},
  year={2026},
  url={https://github.com/SuperInstance/Constraint-Theory},
  version={0.1.0}
}
```

## License

MIT — see [LICENSE](LICENSE).
