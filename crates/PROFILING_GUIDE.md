# Performance Profiling Guide for Constraint Theory Core

This guide provides step-by-step instructions for profiling the Constraint Theory Core implementation to identify bottlenecks and validate optimization opportunities.

---

## Quick Start Profiling

### 1. Flamegraph (Hotspot Analysis)

**Install:**
```bash
cargo install flamegraph
```

**Run:**
```bash
cd C:/Users/casey/polln/constrainttheory/crates/constraint-theory-core
cargo flamegraph --example bench --features simd
```

**Output:**
- `flamegraph.svg` - Interactive flamegraph visualization
- Open in browser to see hotspot functions

**What to look for:**
- Wide bars = time spent in that function
- Nested bars = call stack
- Look for functions consuming >20% of total time

---

### 2. Cargo Profiling (Built-in)

**Run with time reporting:**
```bash
cd C:/Users/casey/polln/constrainttheory/crates/constraint-theory-core

# Windows PowerShell
Measure-Command { cargo run --release --example bench }

# Linux/macOS
time cargo run --release --example bench
```

**Interpretation:**
- Wall clock time = total execution time
- Compare before/after optimizations

---

### 3. Custom Instrumentation

Add to `examples/bench.rs`:

```rust
use std::time::Instant;

fn main() {
    // ... setup code ...

    let mut timing_breakdown = Vec::new();

    // Benchmark with timing breakdown
    for iter in 0..iterations {
        let t_start = Instant::now();

        // Phase 1: Normalization
        let t_norm = Instant::now();
        let mut normalized = Vec::with_capacity(n);
        for vec in &vectors {
            let norm = (vec[0] * vec[0] + vec[1] * vec[1]).sqrt();
            normalized.push([vec[0] / norm, vec[1] / norm]);
        }
        let norm_time = t_norm.elapsed();

        // Phase 2: SIMD snapping
        let t_snap = Instant::now();
        let mut results = vec![([0.0f32, 0.0], 0.0f32); n];
        manifold.snap_batch_simd_into(&vectors, &mut results);
        let snap_time = t_snap.elapsed();

        // Phase 3: Result validation
        let t_validate = Instant::now();
        let total_noise: f32 = results.iter().map(|(_, n)| *n).sum();
        let validate_time = t_validate.elapsed();

        let total_time = t_start.elapsed();

        timing_breakdown.push((norm_time, snap_time, validate_time, total_time));

        println!("Iter {}: Total={:.2}ms, Norm={:.2}ms, Snap={:.2}ms, Valid={:.2}ms",
            iter,
            total_time.as_secs_f64() * 1000.0,
            norm_time.as_secs_f64() * 1000.0,
            snap_time.as_secs_f64() * 1000.0,
            validate_time.as_secs_f64() * 1000.0
        );
    }

    // Summary
    let avg_norm: f64 = timing_breakdown.iter()
        .map(|(n, _, _, _)| n.as_secs_f64()).sum::<f64>() / iterations as f64;
    let avg_snap: f64 = timing_breakdown.iter()
        .map(|(_, s, _, _)| s.as_secs_f64()).sum::<f64>() / iterations as f64;
    let avg_valid: f64 = timing_breakdown.iter()
        .map(|(_, _, v, _)| v.as_secs_f64()).sum::<f64>() / iterations as f64;

    println!("\n=== Timing Breakdown ===");
    println!("Normalization: {:.2}ms ({:.1}%)", avg_norm * 1000.0, (avg_norm / (avg_norm + avg_snap)) * 100.0);
    println!("Snapping:      {:.2}ms ({:.1}%)", avg_snap * 1000.0, (avg_snap / (avg_norm + avg_snap)) * 100.0);
    println!("Validation:    {:.2}ms", avg_valid * 1000.0);
}
```

**Run:**
```bash
cargo run --release --example bench_instrumented
```

---

## Platform-Specific Profiling

### Linux: perf

**Install:**
```bash
# Ubuntu/Debian
sudo apt-get install linux-tools-generic

# RHEL/CentOS
sudo yum install perf
```

**Record performance:**
```bash
# Record with call graph
perf record -g --call-graph dwarf cargo run --release --example bench

# Report top functions
perf report --stdio | head -50

# Specific metrics
perf stat -e cycles,instructions,cache-references,cache-misses,branches,branch-misses \
    cargo run --release --example bench
```

**Key metrics:**
```
# Instructions per cycle (IPC)
# Higher is better (max ~4 for modern CPUs)
IPC = instructions / cycles

# Cache miss rate
# Lower is better (<5% is good)
Miss rate = cache-misses / cache-references

# Branch misprediction rate
# Lower is better (<2% is good)
Mispredict rate = branch-misses / branches
```

**Analyze hot function:**
```bash
# Annotate source code with performance data
perf annotate --stdio snap_batch_avx2

# Show disassembly with cycle counts
perf record -b cargo run --release --example bench
perf annotate --stdio
```

---

### Windows: VTune (Intel)

**Install:**
- Download from Intel OneAPI
- Requires Intel CPU (Xeon/Core)

**Run:**
```powershell
# Basic hotspot analysis
vtune -collect hotspots -result-dir vtune_hotspots -- cargo run --release --example bench

# Memory access analysis
vtune -collect memory-access -result-dir vtune_memory -- cargo run --release --example bench

# Microarchitecture analysis
vtune -collect uarch-exploration -result-dir vtune_uarch -- cargo run --release --example bench
```

**View results:**
```bash
# Open GUI (recommended)
vtune -report hotspots -result-dir vtune_hotspots -format html

# Or command-line summary
vtune -report -result-dir vtune_hotspots -format text
```

---

### Windows: Windows Performance Analyzer (WPA)

**Record:**
```powershell
# Install Windows Performance Toolkit (part of Windows SDK)
wpr -start GeneralProfile -start CPU
cargo run --release --example bench
wpr -stop trace.etl
```

**Analyze:**
- Open `trace.etl` in Windows Performance Analyzer (WPA)
- View CPU usage, context switches, memory access

---

### macOS: Instruments

**Run:**
```bash
# Open Instruments.app
# Select "Time Profiler"
# Target: cargo run --release --example bench
# Record
```

**Or command-line:**
```bash
# Install xcrun
xcrun xctrace record --template "Time Profiler" --launch -- cargo run --release --example bench
```

---

## Hardware Performance Counters

### Using Criterion (Rust benchmarking)

**Add to Cargo.toml:**
```toml
[dev-dependencies]
criterion = "0.5"

[[bench]]
name = "snap_benchmark"
harness = false
```

**Create `benches/snap_benchmark.rs`:**
```rust
use criterion::{black_box, criterion_group, criterion_main, Criterion, BenchmarkId};
use constraint_theory_core::PythagoreanManifold;

fn bench_snap(c: &mut Criterion) {
    let mut group = c.benchmark_group("snap");

    for density in [100, 200, 400, 800].iter() {
        let manifold = PythagoreanManifold::new(*density);

        group.bench_with_input(
            BenchmarkId::new("density", density),
            density,
            |b, _| {
                b.iter(|| {
                    let vec = [0.6f32, 0.8];
                    black_box(manifold.snap(vec))
                })
            },
        );
    }

    group.finish();
}

fn bench_snap_batch(c: &mut Criterion) {
    let mut group = c.benchmark_group("snap_batch");

    for size in [1000, 10000, 100000].iter() {
        let manifold = PythagoreanManifold::new(200);
        let vectors: Vec<[f32; 2]> = (0..*size)
            .map(|i| {
                let angle = (i as f32) * 0.0001;
                [angle.sin(), angle.cos()]
            })
            .collect();

        group.bench_with_input(
            BenchmarkId::new("size", size),
            size,
            |b, vectors| {
                b.iter(|| {
                    black_box(manifold.snap_batch_simd(black_box(vectors)))
                })
            },
        );
    }

    group.finish();
}

criterion_group!(benches, bench_snap, bench_snap_batch);
criterion_main!(benches);
```

**Run:**
```bash
cargo bench --bench snap_benchmark
```

**Output:**
- Detailed statistics (mean, median, stddev)
- Comparison across different input sizes
- HTML report with plots

---

## Memory Profiling

### Valgrind (Linux)

**Install:**
```bash
sudo apt-get install valgrind
```

**Run:**
```bash
# Memory leak check
valgrind --leak-check=full --show-leak-kinds=all cargo run --release --example bench

# Cache simulation
valgrind --tool=cachegrind cargo run --release --example bench

# View cache results
cg_annotate cachegrind.out.<pid>
```

### dhat (Rust heap profiler)

**Add to Cargo.toml:**
```toml
[dependencies]
dhat = "0.3"
```

**Instrument code:**
```rust
#[cfg(feature = "dhat")]
fn main() {
    let mut profiler = dhat::Profiler::new_heap();

    // ... benchmark code ...

    drop(profiler);
}

#[cfg(not(feature = "dhat"))]
fn main() {
    // ... normal benchmark code ...
}
```

**Run:**
```bash
cargo run --release --example bench --features dhat
```

**Output:**
- Heap allocation profile
- Memory leaks
- Allocation hotspots

---

## Identifying Bottlenecks

### Step 1: Where is time spent?

Run flamegraph:
```bash
cargo flamegraph --example bench
```

**Look for:**
1. `snap_batch_avx2` - Main SIMD function
2. `snap` - Scalar fallback
3. Normalization code (before SIMD)
4. KD-tree operations (if integrated)

### Step 2: Is it memory-bound or compute-bound?

Check arithmetic intensity:
```rust
// Add to benchmark
let flops = vectors.len() as f64 * manifold.state_count() as f64 * 2.0;
let bytes = (vectors.len() * 16 + manifold.state_count() * 8) as f64;
let ai = flops / bytes;  // FLOPs/byte

println!("Arithmetic Intensity: {:.2} FLOPs/byte", ai);
println!("Memory-bound? {}", ai < 1.0);
```

**Interpretation:**
- AI < 1: Memory-bound (optimize memory access)
- AI > 1: Compute-bound (optimize computations)

### Step 3: Cache efficiency

Run with perf:
```bash
perf stat -e cache-references,cache-misses,L1-dcache-loads,L1-dcache-load-misses \
    cargo run --release --example bench
```

**Calculate:**
```
L1 miss rate = L1-dcache-load-misses / L1-dcache-loads
LLC miss rate = cache-misses / cache-references

Good: L1 miss rate < 5%
Good: LLC miss rate < 1%
```

### Step 4: SIMD efficiency

Check theoretical vs actual speedup:
```rust
// In benchmark
let theoretical_speedup = 8.0;  // AVX2 processes 8 floats
let actual_speedup = scalar_time / simd_time;
let efficiency = actual_speedup / theoretical_speedup;

println!("SIMD Efficiency: {:.1}%", efficiency * 100.0);
```

**Interpretation:**
- Efficiency > 80%: Good SIMD utilization
- Efficiency 50-80%: Some scalar overhead
- Efficiency < 50%: Significant scalar code

---

## Optimization Validation

### After each optimization:

1. **Run full benchmark suite**
   ```bash
   cargo run --release --example bench > before.txt
   # Make changes
   cargo run --release --example bench > after.txt

   # Compare
   diff before.txt after.txt
   ```

2. **Generate new flamegraph**
   ```bash
   cargo flamegraph --example bench -o after.svg
   # Compare with baseline flamegraph
   ```

3. **Check regression**
   ```bash
   cargo bench --bench snap_benchmark
   # Criterion will detect regressions automatically
   ```

4. **Profile again**
   ```bash
   # Verify bottleneck moved elsewhere
   perf stat -e cycles,instructions,cache-misses cargo run --release --example bench
   ```

---

## Common Bottleneck Patterns

### Pattern 1: Scalar code in SIMD function

**Symptoms:**
- Flamegraph shows scalar operations
- SIMD efficiency < 50%

**Fix:**
- Move scalar code to SIMD
- Use `_mm256_` intrinsics

### Pattern 2: Cache misses

**Symptoms:**
- High LLC miss rate (>10%)
- Flamegraph shows memory access

**Fix:**
- Reorder data for better locality
- Add prefetching
- Use cache-aligned structures

### Pattern 3: Branch mispredictions

**Symptoms:**
- High branch misprediction rate (>5%)
- Conditional in hot loop

**Fix:**
- Use branchless SIMD (`_mm256_blendv_ps`)
- Replace `if` with ternary operator

### Pattern 4: Small batches

**Symptoms:**
- Per-tile time decreases with batch size
- SIMD underutilization

**Fix:**
- Increase batch size
- Process in larger chunks

---

## Automation Script

Create `scripts/profile.sh`:
```bash
#!/bin/bash

set -e

echo "=== Constraint Theory Performance Profiling ==="
echo

# 1. Run benchmark
echo "1. Running benchmark..."
cargo run --release --example bench | tee benchmark_output.txt

# 2. Generate flamegraph
echo
echo "2. Generating flamegraph..."
cargo flamegraph --example bench --features simd
echo "   Generated: flamegraph.svg"

# 3. Run perf (Linux only)
if command -v perf &> /dev/null; then
    echo
    echo "3. Running perf analysis..."
    perf stat -e cycles,instructions,cache-references,cache-misses,branches,branch-misses \
        cargo run --release --example bench 2>&1 | tee perf_stats.txt
fi

# 4. Run Criterion benchmarks
echo
echo "4. Running Criterion benchmarks..."
cargo bench --bench snap_benchmark

echo
echo "=== Profiling complete ==="
echo "Results:"
echo "  - benchmark_output.txt"
echo "  - flamegraph.svg"
echo "  - perf_stats.txt (Linux)"
echo "  - criterion report (target/criterion)"
```

**Run:**
```bash
chmod +x scripts/profile.sh
./scripts/profile.sh
```

---

## Next Steps

After profiling:

1. **Identify top bottleneck**
   - Usually the function with most time in flamegraph

2. **Hypothesize optimization**
   - "KD-tree would reduce time from O(N) to O(log N)"

3. **Implement optimization**
   - Make targeted change

4. **Measure impact**
   - Re-run profiling
   - Compare before/after

5. **Iterate**
   - Move to next bottleneck

---

**Remember:** Premature optimization is the root of all evil. Always profile first, optimize second.
