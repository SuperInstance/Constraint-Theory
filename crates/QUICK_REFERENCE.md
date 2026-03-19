# Performance Optimization Quick Reference

**For developers implementing the Constraint Theory optimizations**

---

## Current Status (2026-03-16)

```
Performance: 5.07 μs/tile
Target:      0.10 μs/tile
Gap:         51x slower

Bottleneck:  O(N) linear search through 40,384 states
Status:      Ready for Phase 1 (KD-tree integration)
```

---

## Quick Commands

### Benchmark Current Performance
```bash
cd C:/Users/casey/polln/constrainttheory/crates/constraint-theory-core
cargo run --release --example bench_profiled
```

### Generate Flamegraph
```bash
cargo install flamegraph
cargo flamegraph --example bench_profiled
# Open flamegraph.svg in browser
```

### Run All Tests
```bash
cargo test --release
```

### Check Compilation
```bash
cargo build --release
```

---

## File Locations

### Performance Files
```
C:/Users/casey/polln/constrainttheory/crates/constraint-theory-core/
├── OPTIMIZATION_ROADMAP.md           # Detailed optimization plan
├── PROFILING_GUIDE.md                # Platform-specific profiling
├── PERFORMANCE_ANALYSIS_SUMMARY.md   # Executive summary
├── QUICK_REFERENCE.md                # This file
└── examples/
    ├── bench.rs                      # Basic benchmark
    └── bench_profiled.rs             # Detailed profiling benchmark
```

### Source Files
```
src/
├── simd.rs           # SIMD implementation (HOTSPOT)
├── manifold.rs       # PythagoreanManifold (needs KD-tree)
├── kdtree.rs         # KD-tree implementation (ready to integrate)
└── lib.rs            # Module exports
```

---

## Optimization Checklist

### Phase 1: KD-tree Integration (HIGH PRIORITY)
- [ ] Fix KD-tree compilation error (line 246)
- [ ] Add `kdtree` field to `PythagoreanManifold`
- [ ] Implement `snap()` using KD-tree
- [ ] Add fallback to linear search
- [ ] Benchmark KD-tree vs linear
- [ ] Validate 5-10x speedup
- [ ] Update documentation

**Code snippet:**
```rust
// In manifold.rs
pub struct PythagoreanManifold {
    valid_states: Vec<[f32; 2]>,
    kdtree: Option<KDTree>,  // ADD THIS
}

impl PythagoreanManifold {
    pub fn new(density: usize) -> Self {
        let states = /* ... generate states ... */;
        let kdtree = Some(KDTree::build(&states));  // BUILD TREE
        Self { valid_states: states, kdtree }
    }

    pub fn snap(&self, vector: [f32; 2]) -> ([f32; 2], f32) {
        if let Some(tree) = &self.kdtree {
            if let Some((nearest, _idx, dist_sq)) = tree.nearest(&vector) {
                let noise = 1.0 - (1.0 - dist_sq.sqrt()).max(0.0);
                return (nearest, noise);
            }
        }
        // Fallback to linear search
        // ... existing code ...
    }
}
```

### Phase 2: Memory Optimization (MEDIUM PRIORITY)
- [ ] Profile cache performance (perf/VTune)
- [ ] Add cache alignment to data structures
- [ ] Implement spatial clustering of states
- [ ] Add prefetching in SIMD code
- [ ] Benchmark cache improvements
- [ ] Validate 2-3x speedup

**Code snippet:**
```rust
// Cache-aligned states
#[repr(align(64))]
pub struct AlignedStates {
    states: Vec<[f32; 2]>,
}

// Prefetching
#[cfg(target_arch = "x86_64")]
unsafe {
    _mm_prefetch(&states[next_idx] as *const _ as *const i8, _MM_HINT_T0);
}
```

### Phase 3: Multi-threading (LOW PRIORITY)
- [ ] Add Rayon dependency
- [ ] Implement parallel batch processing
- [ ] Tune thread pool configuration
- [ ] Benchmark scaling with cores
- [ ] Validate 4-8x speedup

**Code snippet:**
```toml
# In Cargo.toml
[dependencies]
rayon = "1.8"
```

```rust
// In manifold.rs
use rayon::prelude::*;

impl PythagoreanManifold {
    pub fn snap_batch_parallel(&self, vectors: &[[f32; 2]]) -> Vec<([f32; 2], f32)> {
        vectors.par_iter()
            .map(|&vec| self.snap(vec))
            .collect()
    }
}
```

---

## Performance Targets

### Phase 1 Complete
```
Per-tile:  < 1.0 μs
Speedup:   5-10x from baseline
Progress:  10-20% toward target
```

### Phase 2 Complete
```
Per-tile:  < 0.5 μs
Speedup:   10-30x from baseline
Progress:  33-100% toward target
```

### Phase 3 Complete
```
Per-tile:  < 0.1 μs (single-core)
           < 0.02 μs (8-core)
Speedup:   50-400x from baseline
Progress:  TARGET MET (and exceeded)
```

---

## Common Issues

### Issue: KD-tree compilation error
```
error[E0308]: mismatched types
   --> src\kdtree.rs:246:29
    |
246 |                 if let Some(&worst_dist) = results.worst_distance() {
    |                             ^^^^^^^^^^^    ------------------------ this expression has type `Option<f32>
```

**Fix:**
```bash
cd C:/Users/casey/polln/constrainttheory/crates/constraint-theory-core
sed -i 's/if let Some(&worst_dist)/if let Some(worst_dist)/' src/kdtree.rs
```

### Issue: SIMD not available
```
panic: "AVX2 not available"
```

**Fix:** Check CPU supports AVX2:
```rust
use std::arch::x86_64::_mm256_check_cpuid;

if !is_x86_feature_detected!("avx2") {
    println!("AVX2 not supported, falling back to scalar");
}
```

### Issue: Performance regression
```
Per-tile: 10.2 μs (slower than 5.07 μs baseline!)
```

**Debug:**
1. Run flamegraph to find new bottleneck
2. Check for accidental scalar fallback
3. Verify compiler optimization level (`--release`)
4. Check for debug assertions (`debug_assertions`)

---

## Benchmarking Tips

### Always Run in Release Mode
```bash
cargo run --release --example bench_profiled
# NOT: cargo run --example bench_profiled
```

### Warm Up Before Measuring
```rust
// Always warm up (3-5 iterations)
for _ in 0..3 {
    let _ = manifold.snap_batch_simd(&warmup_vectors);
}

// Then measure
let start = Instant::now();
// ... benchmark code ...
```

### Run Multiple Iterations
```rust
let iterations = 5;
for iter in 0..iterations {
    // ... benchmark code ...
}
// Report average, not single run
```

### Check for Correctness
```rust
// Always verify results match reference
let simd_results = manifold.snap_batch_simd(&vectors);
let scalar_results = /* ... scalar version ... */;

assert_eq!(simd_results, scalar_results, "SIMD results differ!");
```

---

## Profiling Quick Start

### Linux (perf)
```bash
# Record performance
perf record -g cargo run --release --example bench_profiled

# Report top functions
perf report --stdio | head -50

# Cache statistics
perf stat -e cache-references,cache-misses,L1-dcache-loads,L1-dcache-load-misses \
    cargo run --release --example bench_profiled
```

### Windows (VTune)
```powershell
# Hotspot analysis
vtune -collect hotspots -result-dir vtune_hotspots -- cargo run --release --example bench_profiled

# Memory access
vtune -collect memory-access -result-dir vtune_memory -- cargo run --release --example bench_profiled
```

### macOS (Instruments)
```bash
# Open Instruments.app
# Select "Time Profiler"
# Target: cargo run --release --example bench_profiled
```

---

## Key Metrics to Track

| Metric | Current | Target | How to Measure |
|--------|---------|--------|----------------|
| Per-tile latency | 5.07 μs | 0.10 μs | `bench_profiled` |
| SIMD efficiency | 86% | >90% | Compare to scalar |
| L1 cache hit rate | Unknown | >80% | `perf stat -e L1-dcache-loads` |
| Memory bandwidth | 63.67 GB/s | N/A | `bench_profiled` |
| Arithmetic intensity | 0.25 | N/A | `bench_profiled` |

---

## Getting Help

### Documentation
- `OPTIMIZATION_ROADMAP.md` - Detailed optimization plan
- `PROFILING_GUIDE.md` - Platform-specific profiling
- `PERFORMANCE_ANALYSIS_SUMMARY.md` - Executive summary

### Code Comments
- `src/simd.rs` - SIMD implementation details
- `src/manifold.rs` - Pythagorean manifold API
- `src/kdtree.rs` - KD-tree implementation

### Online Resources
- [Rust Performance Book](https://nnethercote.github.io/perf-book/)
- [Intel Intrinsics Guide](https://www.intel.com/content/www/us/en/docs/intrinsics-guide/)
- [SIMD for C++ Developers](https://www.codeproject.com/Articles/874396/Crunching-Numbers-with-AVX-and-AVX)

---

## Summary

**Current bottleneck:** Linear search through 40,384 states

**Solution:** KD-tree integration (already implemented in `src/kdtree.rs`)

**Expected speedup:** 5-10x

**Time to implement:** 3-5 days

**Next action:** Integrate KD-tree into `PythagoreanManifold`

**Files to modify:**
- `src/manifold.rs` - Add KD-tree field and methods
- `src/kdtree.rs` - Already fixed compilation error

**Success criteria:**
- Benchmark shows 5-10x speedup
- Per-tile latency < 1.0 μs
- Zero correctness regressions

---

**Last Updated:** 2026-03-16
**Status:** Ready for Phase 1 implementation
