# Constraint Theory Performance Analysis & Optimization Roadmap

**Date:** 2026-03-16
**Current Performance:** 5.10 μs/tile (SIMD), 29.4 μs/tile (scalar)
**Target Performance:** 0.10 μs/tile
**Current Gap:** 51x slower than target

---

## Executive Summary

The current SIMD implementation achieves **5.8x speedup** over scalar code but remains **51x slower** than the target of 0.10 μs/tile. This analysis identifies the bottlenecks and provides a data-driven roadmap to reach target performance through a combination of algorithmic improvements, memory optimizations, and hardware acceleration.

### Current Performance Baseline

| Implementation | Time (μs) | Speedup vs Scalar | Gap to Target |
|----------------|-----------|-------------------|---------------|
| Python NumPy   | 10.93     | 0.5x              | 109x          |
| Rust Scalar    | 29.40     | 1.0x              | 294x          |
| Rust SIMD      | 5.10      | 5.8x              | 51x           |
| **Target**     | **0.10**  | **294x**          | **1x**        |

### Key Findings

1. **Current SIMD efficiency is only 36% of theoretical AVX2 maximum**
   - Theoretical: 8x speedup (8 floats per AVX2 register)
   - Actual: 5.8x speedup
   - **Opportunity:** 2.2x additional speedup from better SIMD utilization

2. **Linear search through 40,384 states is the primary bottleneck**
   - Current: O(N) where N = 40,384 states
   - Each vector computes dot product with ALL states
   - **Opportunity:** 5-10x speedup from spatial indexing (KD-tree)

3. **Memory bandwidth and cache misses are limiting factors**
   - States array: 40,384 × 8 bytes = 323 KB (fits in L2 cache)
   - But accessed randomly, causing cache thrashing
   - **Opportunity:** 2-3x speedup from cache optimization

4. **CPU utilization is suboptimal**
   - Only 8 vectors processed at once (AVX2)
   - AVX-512 would process 16 vectors (2x speedup)
   - Multi-threading could utilize all cores (4-8x speedup)

---

## Performance Model & Roofline Analysis

### Arithmetic Intensity

**Current Implementation:**
```
Operations per vector:
- Normalization: 5 FLOPs (sqrt, 2 mul, 2 div)
- Dot products: 2 FLOPs × 40,384 states = 80,768 FLOPs
- Comparisons: 2 FLOPs × 40,384 states = 80,768 FLOPs
Total: ~161,541 FLOPs per vector

Memory accessed per vector:
- Read vectors: 8 bytes
- Read states: 323 KB (40,384 × 8 bytes)
- Write results: 12 bytes
Total: ~323 KB per vector

Arithmetic Intensity = FLOPs / Bytes
= 161,541 / 323,000
= 0.5 FLOPs/byte
```

**Interpretation:**
- **Memory-bound** kernel (arithmetic intensity < 1 FLOPs/byte)
- CPU can't compute fast enough to saturate memory bandwidth
- **Optimization priority:** Reduce memory access, improve cache utilization

### Roofline Model (Intel i7-12700K assumed)

```
Peak Performance: 16 FP32 operations/cycle × 4.8 GHz = 76.8 GFLOPS
Memory Bandwidth: ~68 GB/s (DDR4-3200)

Ridge Point (where compute-bound becomes memory-bound):
= Peak Performance / Memory Bandwidth
= 76.8 GFLOPS / 68 GB/s
= 1.13 FLOPs/byte

Current: 0.5 FLOPs/byte (BELOW ridge point)
=> Memory-bound, not compute-bound

Performance limit at 0.5 FLOPs/byte:
= Memory Bandwidth × Arithmetic Intensity
= 68 GB/s × 0.5 FLOPs/byte
= 34 GFLOPS theoretical max

Actual performance:
= 100,000 vectors / 0.51 seconds
= 196,134 vectors/sec
= 161,541 FLOPs/vector × 196,134 vectors/sec
= 31.7 GFLOPS

Efficiency = 31.7 / 34 = 93% of memory bandwidth limit
```

**Conclusion:** Current implementation is **93% efficient** for the algorithm being used. Further improvements require **algorithmic changes**, not just micro-optimizations.

---

## Bottleneck Analysis

### 1. Linear Search Bottleneck (Primary)

**Problem:** Every vector performs dot product with ALL 40,384 states

```
Current: 40,384 dot products per vector
Time: 161,541 FLOPs × 100,000 vectors = 16.2 GFLOPs
Memory: 323 KB × 100,000 = 32.3 GB read

With KD-tree (logarithmic search):
Expected: ~log2(40,384) ≈ 15 dot products per vector
Time: 15 × 2 FLOPs × 100,000 = 3 MFLOPs (5400x reduction!)
Memory: 15 × 8 bytes × 100,000 = 12 MB read (2700x reduction!)

Estimated speedup: 5-10x (conservative, accounts for tree overhead)
```

**Evidence from code:**
```rust
// Current: Linear search through all states
for state_idx in 0..state_count {
    let state = valid_states[state_idx];
    // Compute dot product with EVERY state
    let resonance = state[0] * v_in[0] + state[1] * v_in[1];
    // Compare and track best
}
```

### 2. SIMD Underutilization (Secondary)

**Problem:** Only 5.8x speedup vs 8x theoretical

**Causes:**
1. **Scalar normalization before SIMD**
   ```rust
   // Lines 55-60: Scalar normalization
   for i in 0..8 {
       let vec = vectors[base + i];
       let norm = (vec[0] * vec[0] + vec[1] * vec[1]).sqrt().max(1e-10);
       vx_arr[i] = vec[0] / norm;  // Scalar division!
       vy_arr[i] = vec[1] / norm;  // Scalar division!
   }
   ```

2. **Horizontal max reduction**
   ```rust
   // Lines 91-95: Horizontal operations (expensive in SIMD)
   _mm256_storeu_ps(max_res_arr.as_mut_ptr(), max_res);
   // Then scalar search through results
   for i in 0..8 {
       let state_idx = best_idx_arr[i] as usize;
       // More scalar work...
   }
   ```

**Impact:** 2.2x lost performance (8x theoretical - 5.8x actual)

### 3. Cache Misses (Tertiary)

**Problem:** Random access to 323 KB state array

**Cache analysis (assuming 32 KB L1, 512 KB L2):**
```
States array: 323 KB (fits in L2, not L1)
Access pattern: Random (same 40,384 states for each vector)

L1 miss rate: ~100% (states don't fit in L1)
L2 hit rate: Unknown (need profiling)

Expected: High L2 hit rate after first few vectors
But: Each vector random access causes cache thrash

Solution: Spatial clustering or reordering states
```

### 4. Branch Prediction Issues (Minor)

**Problem:** Conditional in hot loop

```rust
// Line 82: Branch in innermost loop
let cmp = _mm256_cmp_ps(resonance, max_res, _CMP_GT_OS);
// This is OK: SIMD comparison (no branch)

// But line 100: Scalar branch
if state_idx < valid_states.len() {
    // Branch misprediction possible
}
```

**Impact:** Minimal (SIMD avoids most branching)

---

## Optimization Roadmap

### Phase 1: Algorithmic Optimization (KD-tree Integration)

**Estimated Impact:** 5-10x speedup
**Effort:** 3-5 days
**Priority:** HIGHEST

**Implementation Plan:**

1. **Integrate existing KD-tree module**
   ```rust
   // Current code already has KD-tree!
   // File: src/kdtree.rs (407 lines, complete implementation)
   // Need to: Fix compilation error, integrate into manifold

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
           // Use KD-tree for nearest neighbor
           if let Some(tree) = &self.kdtree {
               let (nearest, _idx, _dist) = tree.nearest(&vector).unwrap();
               // Compute noise from distance
           }
       }
   }
   ```

2. **Benchmark KD-tree performance**
   ```bash
   cargo run --release --example bench_kdtree
   # Compare: Linear search vs KD-tree
   # Expected: 5-10x speedup for 40K states
   ```

3. **Optimize KD-tree for SIMD**
   - Batch nearest neighbor queries
   - SIMD-accelerated distance computation in leaf nodes
   - Pre-compute dot products for common angles

**Expected Performance After Phase 1:**
- Per-tile: 0.5-1.0 μs (down from 5.1 μs)
- **5-10x speedup**
- Progress: 10-20% toward target

---

### Phase 2: SIMD Optimization

**Estimated Impact:** 2x speedup
**Effort:** 2-3 days
**Priority:** HIGH (after KD-tree)

**Implementation Plan:**

1. **SIMD normalization**
   ```rust
   // Current: Scalar normalization (lines 55-60)
   // Optimized: SIMD normalization

   #[cfg(target_arch = "x86_64")]
   #[target_feature(enable = "avx2")]
   unsafe fn normalize_batch_avx2(vectors: &[[f32; 2]], vx: &mut [f32], vy: &mut [f32]) {
       for i in (0..vectors.len()).step_by(8) {
           // Load 8 vectors
           let vxy = _mm256_loadu_ps(&vectors[i] as *const [f32; 2] as *const f32);

           // Compute norms with SIMD
           let xx = _mm256_mul_ps(vxy, vxy);
           let yy = _mm256_shuffle_ps(xx, xx, 0xB1);  // Shuffle y*y
           let norm_sq = _mm256_add_ps(xx, yy);
           let norm = _mm256_rsqrt_ps(norm_sq);  // Fast inverse sqrt!

           // Normalize
           let vx_norm = _mm256_mul_ps(vxy, norm);
           let vy_norm = _mm256_shuffle_ps(vxy, vxy, 0xB1);
           let vy_norm = _mm256_mul_ps(vy_norm, norm);

           _mm256_storeu_ps(&mut vx[i], vx_norm);
           _mm256_storeu_ps(&mut vy[i], vy_norm);
       }
   }
   ```

2. **Avoid horizontal operations**
   ```rust
   // Current: Horizontal max (lines 91-95)
   // Optimized: Keep results in SIMD registers

   // Instead of: Extract to array, search scalar
   // Use: Keep max in register, compare directly

   // Or better: Process states in batches, track best per vector
   ```

3. **AVX-512 support**
   ```toml
   # Cargo.toml
   [dependencies]
   std = { version = "0.2", features = ["avx512_target_feature"] }
   ```

   ```rust
   #[cfg(target_arch = "x86_64")]
   #[target_feature(enable = "avx512f")]
   unsafe fn snap_batch_avx512(/* ... */) {
       // Process 16 vectors at once (2x AVX2)
       // Use _mm512_ functions
   }
   ```

**Expected Performance After Phase 2:**
- Per-tile: 0.25-0.5 μs (down from 0.5-1.0 μs)
- **Additional 2x speedup**
- Total: 10-20x from baseline
- Progress: 25-50% toward target

---

### Phase 3: Memory & Cache Optimization

**Estimated Impact:** 2-3x speedup
**Effort:** 2-3 days
**Priority:** MEDIUM

**Implementation Plan:**

1. **Cache-aligned data structures**
   ```rust
   use std::mem::align_of;

   #[repr(align(64))]  // Cache line alignment
   pub struct AlignedStates {
       states: Vec<[f32; 2]>,
   }

   // Ensure each cache line has coherent states
   // Reduce false sharing between threads
   ```

2. **Spatial clustering of states**
   ```rust
   // Reorder states to improve cache locality
   // Group states by angular position
   // Neighboring states likely to be accessed together

   pub fn cluster_states_angular(states: &mut [[f32; 2]]) {
       // Sort by angle
       states.sort_by(|a, b| {
           let angle_a = a[1].atan2(a[0]);
           let angle_b = b[1].atan2(b[0]);
           angle_a.partial_cmp(&angle_b).unwrap()
       });
   }
   ```

3. **Prefetching**
   ```rust
   #[cfg(target_arch = "x86_64")]
   #[target_feature(enable = "avx2")]
   unsafe fn snap_batch_with_prefetch(/* ... */) {
       // Prefetch next cache line while processing current
       for chunk_idx in 0..chunks {
           let next_base = (chunk_idx + 1) * 8;
           _mm_prefetch(
               &vectors[next_base] as *const _ as *const i8,
               _MM_HINT_T0  // Prefetch to L1
           );
           // Process current chunk...
       }
   }
   ```

**Expected Performance After Phase 3:**
- Per-tile: 0.1-0.2 μs (down from 0.25-0.5 μs)
- **Additional 2-3x speedup**
- Total: 25-50x from baseline
- Progress: 50-100% toward target

---

### Phase 4: Multi-threading

**Estimated Impact:** 4-8x speedup (CPU cores)
**Effort:** 3-5 days
**Priority:** MEDIUM (after single-core optimized)

**Implementation Plan:**

1. **Rayon parallelization**
   ```toml
   [dependencies]
   rayon = "1.8"
   ```

   ```rust
   use rayon::prelude::*;

   impl PythagoreanManifold {
       pub fn snap_batch_parallel(&self, vectors: &[[f32; 2]]) -> Vec<([f32; 2], f32)> {
           vectors.par_iter()  // Parallel iterator
               .map(|&vec| self.snap(vec))
               .collect()
       }
   }
   ```

2. **Work-stealing scheduler**
   - Rayon automatically handles work distribution
   - Load balancing across threads
   - Minimal overhead

3. **NUMA awareness** (for multi-socket systems)
   ```rust
   // Pin threads to NUMA nodes
   // Allocate memory locally to each node
   // Use: numa-rs crate
   ```

**Expected Performance After Phase 4:**
- Per-tile: 0.015-0.05 μs on 8-core system
- **4-8x speedup** over single-threaded
- Total: 100-400x from baseline
- **EXCEEDS TARGET** on multi-core systems

---

### Phase 5: GPU Acceleration (Optional)

**Estimated Impact:** 100-1000x speedup
**Effort:** 2-4 weeks
**Priority:** LOW (if CPU target met)

**Implementation Plan:**

1. **CUDA kernel for snapping**
   ```cuda
   __global__ void snap_batch_kernel(
       const float2* states,
       int num_states,
       const float2* vectors,
       float2* results,
       float* noise,
       int num_vectors
   ) {
       int idx = blockIdx.x * blockDim.x + threadIdx.x;
       if (idx >= num_vectors) return;

       float2 vec = vectors[idx];
       float norm = sqrtf(vec.x * vec.x + vec.y * vec.y);
       float2 v_in = make_float2(vec.x / norm, vec.y / norm);

       float max_resonance = -1.0f;
       float2 best_state = make_float2(1.0f, 0.0f);

       for (int i = 0; i < num_states; i++) {
           float2 state = states[i];
           float resonance = state.x * v_in.x + state.y * v_in.y;
           if (resonance > max_resonance) {
               max_resonance = resonance;
               best_state = state;
           }
       }

       results[idx] = best_state;
       noise[idx] = 1.0f - max_resonance;
   }
   ```

2. **Rust-CUDA integration**
   ```toml
   [dependencies]
   cudarc = "0.10"
   ```

   ```rust
   use cudarc::driver::CudaDevice;

   let device = CudaDevice::new(0).unwrap();
   let states_gpu = device.htod_sync_copy(&states).unwrap();
   let vectors_gpu = device.htod_sync_copy(&vectors).unwrap();

   // Launch kernel
   snap_batch_kernel(
       &device,
       &states_gpu,
       &vectors_gpu,
       &mut results_gpu,
       &mut noise_gpu,
       num_vectors
   );
   ```

3. **Shared memory optimization**
   ```cuda
   __shared__ float2 s_states[256];  // Cache states in shared memory
   // Load states in cooperative groups
   // Reduce global memory accesses
   ```

**Expected Performance After Phase 5:**
- Per-tile: 0.005-0.05 μs on GPU
- **100-1000x speedup** over CPU baseline
- **Massively exceeds target**

---

## Profiling Strategy

### Tools to Use

1. **Flamegraph**
   ```bash
   cargo install flamegraph
   cargo flamegraph --example bench
   # flamegraph.svg shows hotspot functions
   ```

2. **perf (Linux) or VTune (Intel)**
   ```bash
   # Linux
   perf record -g cargo run --release --example bench
   perf report

   # Metrics to collect:
   # - Cache misses (LLC-load-misses)
   # - Branch mispredictions (branch-misses)
   # - CPU cycles (cycles)
   # - Instructions (instructions)
   ```

3. **Custom instrumentation**
   ```rust
   use std::time::Instant;

   pub fn snap_batch_instrumented(&self, vectors: &[[f32; 2]]) -> Vec<([f32; 2], f32)> {
       let t0 = Instant::now();

       // Phase 1: Normalization
       let t1 = Instant::now();

       // Phase 2: KD-tree search
       let t2 = Instant::now();

       // Phase 3: Result assembly
       let t3 = Instant::now();

       println!("Normalization: {:?}", t1 - t0);
       println!("KD-tree search: {:?}", t2 - t1);
       println!("Assembly: {:?}", t3 - t2);

       results
   }
   ```

### Metrics to Track

| Metric | Current | Target | Tool |
|--------|---------|--------|------|
| Per-tile latency | 5.1 μs | 0.1 μs | benchmark |
| CPU utilization | 12.5% (1/8 cores) | 100% (all cores) | perf |
| L1 cache hit rate | ~0% | >80% | perf |
| L2 cache hit rate | Unknown | >95% | perf |
| Branch prediction | Unknown | >95% | perf |
| SIMD efficiency | 36% (5.8/16) | >90% | VTune |

---

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| KD-tree overhead exceeds benefits | High | Medium | Profile first, fallback to linear for small N |
| Multi-threading diminishing returns | Medium | Low | Use work-stealing, tune chunk size |
| GPU overhead for small batches | Low | High | Batching, hybrid CPU/GPU |
| AVX-512 unavailability | Low | Medium | Fallback to AVX2 |
| Memory exhaustion with large manifolds | Medium | Low | Streaming, incremental processing |

---

## Timeline & Milestones

### Week 1: Algorithmic Foundation
- [ ] Fix KD-tree compilation errors
- [ ] Integrate KD-tree into manifold
- [ ] Benchmark KD-tree vs linear search
- [ ] **Milestone: 5-10x speedup achieved**

### Week 2: SIMD Optimization
- [ ] Implement SIMD normalization
- [ ] Eliminate horizontal operations
- [ ] Add AVX-512 support
- [ ] **Milestone: Additional 2x speedup**

### Week 3: Memory Optimization
- [ ] Add cache alignment
- [ ] Implement state clustering
- [ ] Add prefetching
- [ ] **Milestone: Additional 2-3x speedup**

### Week 4: Parallelization
- [ ] Add Rayon multi-threading
- [ ] Tune thread pool configuration
- [ **Milestone: 4-8x speedup on multi-core**

### Week 5+: GPU (Optional)
- [ ] Implement CUDA kernel
- [ ] Rust-CUDA integration
- [ ] Shared memory optimization
- [ ] **Milestone: 100-1000x speedup on GPU**

---

## Expected Performance Trajectory

```
Current:          5.10 μs/tile  (100% baseline)
After Phase 1:    0.5-1.0 μs   (5-10x)  ← KD-tree
After Phase 2:    0.25-0.5 μs  (2x)     ← SIMD optimization
After Phase 3:    0.1-0.2 μs   (2-3x)   ← Memory optimization
After Phase 4:    0.015-0.05 μs (4-8x)  ← Multi-threading
After Phase 5:    0.005-0.05 μs (10x)   ← GPU
────────────────────────────────────────────
TARGET:           0.10 μs/tile
```

**Conservative estimate (Phases 1-3 only):**
- 0.1-0.2 μs/tile
- **25-50x speedup**
- **50-100% of target**

**Aggressive estimate (all phases):**
- 0.015-0.05 μs/tile (CPU)
- 0.005-0.05 μs/tile (GPU)
- **100-1000x speedup**
- **2-20x BETTER than target**

---

## Next Immediate Actions

1. **Fix KD-tree compilation error** (1 hour)
   ```bash
   # Line 246 in src/kdtree.rs
   - if let Some(&worst_dist) = results.worst_distance() {
   + if let Some(worst_dist) = results.worst_distance() {
   ```

2. **Generate flamegraph** (30 minutes)
   ```bash
   cargo install flamegraph
   cd C:/Users/casey/polln/constrainttheory/crates/constraint-theory-core
   cargo flamegraph --example bench
   # Open flamegraph.svg in browser
   ```

3. **Profile cache performance** (30 minutes)
   ```bash
   # On Linux with perf
   perf stat -e cache-references,cache-misses,L1-dcache-load-misses,L1-dcache-loads cargo run --release --example bench

   # On Windows with VTune
   vtune -collect hotspots -result-dir vtune_results -- cargo run --release --example bench
   ```

4. **Implement KD-tree integration** (1 day)
   - Modify `PythagoreanManifold` to include KD-tree
   - Add benchmark comparing linear vs KD-tree
   - Tune leaf size for optimal performance

5. **Measure and iterate** (ongoing)
   - After each change, run benchmarks
   - Update this roadmap with actual measurements
   - Adjust priorities based on data

---

## Conclusion

The current SIMD implementation is **93% efficient** for the linear search algorithm, which means we've hit a **algorithmic ceiling**, not a hardware ceiling. To reach the 0.10 μs target, we must:

1. **Replace linear search with KD-tree** (5-10x speedup)
2. **Optimize SIMD utilization** (2x speedup)
3. **Improve cache locality** (2-3x speedup)
4. **Add multi-threading** (4-8x speedup)

With Phases 1-3, we expect to **reach or exceed the target** on a single core. With Phase 4, we'll **dramatically exceed** it on multi-core systems. Phase 5 (GPU) is optional but would provide massive headroom for future scaling.

**Key insight:** The problem is **memory-bound**, not compute-bound. Focus on reducing memory access (KD-tree) and improving cache efficiency before optimizing compute.

**Estimated time to target:** 2-3 weeks for Phases 1-3 (single-core target reached)
