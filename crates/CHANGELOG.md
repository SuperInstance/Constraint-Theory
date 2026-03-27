# Changelog

All notable changes to constraint-theory-core will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-03-27

Initial research release.

### Features
- **Pythagorean Manifold**: Discrete lattice of exact rational coordinates on the unit circle
- **KD-tree Indexing**: O(log n) nearest-neighbor lookup via balanced KD-tree
- **SIMD Batch Processing**: AVX2-accelerated batch snapping (8-way parallelism)
- **Ricci Flow**: Curvature evolution for geometric analysis
- **Rigidity Percolation**: Laman's theorem for structural rigidity analysis
- **Sheaf Cohomology**: Topological invariant computation
- **Holonomy Transport**: Gauge connection parallel transport
- **Zero Dependencies**: Pure Rust, no runtime dependencies

### Performance
- Single snap: ~100 ns (KD-tree lookup)
- Batch snap: ~74 ns/op (SIMD)
- Manifold build: ~50 μs (200 density, ~1000 states)
- Package size: 22 KB compressed

### Quality
- 82 tests (68 unit + 14 doc tests), all passing
- Zero clippy warnings
- All public APIs documented with examples
- `#![deny(missing_docs)]` enforced

### Known Limitations
- 2D only (Pythagorean triples on unit circle)
- ~1000 states at default density
- No empirical ML validation yet
- Research-grade, not production-battle-tested
