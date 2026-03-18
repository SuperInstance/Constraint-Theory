# Troubleshooting Guide

This guide helps you diagnose and resolve common issues with the Constraint Theory geometric substrate library.

## Quick Diagnosis

### Issue Categories

- [Installation Issues](#installation-issues)
- [Build Issues](#build-issues)
- [Runtime Issues](#runtime-issues)
- [Performance Issues](#performance-issues)
- [Geometric Computation Issues](#geometric-computation-issues)

---

## Installation Issues

### Problem: `cargo install` fails

**Symptoms:**
- Error during `cargo install constrainttheory`
- Missing dependencies
- Compilation errors

**Solutions:**

1. **Check Rust version:**
   ```bash
   rustc --version
   # Should be 1.70.0 or later
   ```

2. **Update Rust:**
   ```bash
   rustup update stable
   ```

3. **Install system dependencies:**

   **Ubuntu/Debian:**
   ```bash
   sudo apt-get install build-essential libssl-dev pkg-config
   ```

   **macOS:**
   ```bash
   xcode-select --install
   ```

   **Windows:**
   - Install [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
   - Install [Rust](https://rustup.rs/)

### Problem: Git clone fails

**Symptoms:**
- `fatal: unable to access`
- SSL certificate errors
- Timeout errors

**Solutions:**

1. **Check internet connection**
2. **Update git:**
   ```bash
   git update
   ```
3. **Disable SSL verification (temporary):**
   ```bash
   git -c http.sslVerify=false clone https://github.com/SuperInstance/constrainttheory.git
   ```

---

## Build Issues

### Problem: Compilation errors

**Symptoms:**
- `error[E0432]: unresolved import`
- `error[E0277]: the trait bound is not satisfied`
- Type errors

**Solutions:**

1. **Clean build:**
   ```bash
   cargo clean
   cargo build --release
   ```

2. **Update dependencies:**
   ```bash
   cargo update
   ```

3. **Check for Rust updates:**
   ```bash
   rustup update stable
   cargo +stable build --release
   ```

4. **Check for feature conflicts:**
   ```bash
   cargo build --release --features default
   ```

### Problem: WASM build fails

**Symptoms:**
- `error: linking with `wasm-ld` failed`
- WASM-specific errors
- Missing wasm32 target

**Solutions:**

1. **Add WASM target:**
   ```bash
   rustup target add wasm32-unknown-unknown
   ```

2. **Install wasm-pack:**
   ```bash
   cargo install wasm-pack
   ```

3. **Build with wasm-pack:**
   ```bash
   wasm-pack build --web
   ```

4. **Check Node.js version:**
   ```bash
   node --version
   # Should be 16+ for WASM
   ```

### Problem: Out of memory during build

**Symptoms:**
- Build process killed
- `error: out of memory`
- System becomes unresponsive

**Solutions:**

1. **Reduce parallel jobs:**
   ```bash
   cargo build --release -j 2
   ```

2. **Check available memory:**
   ```bash
   # Linux/macOS
   free -h

   # Windows
   wmic OS get FreePhysicalMemory
   ```

3. **Close other applications**
4. **Increase swap space (Linux):**
   ```bash
   sudo fallocate -l 4G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

---

## Runtime Issues

### Problem: KD-tree query fails

**Symptoms:**
- `Error: KD-tree query failed`
- Incorrect results
- Panic during query

**Solutions:**

1. **Verify tree construction:**
   ```rust
   use constrainttheory::spatial::KDTree;

   let tree = KDTree::new(points);
   assert!(tree.validate());
   ```

2. **Check point dimensions:**
   ```rust
   // All points must have same dimension
   let dim = points[0].len();
   assert!(points.iter().all(|p| p.len() == dim));
   ```

3. **Validate query bounds:**
   ```rust
   // Query bounds must be valid
   assert!(bounds.min < bounds.max);
   ```

4. **Check for NaN values:**
   ```rust
   assert!(points.iter().all(|p| p.iter().all(|c| !c.is_nan())));
   ```

### Problem: Dodecet encoding fails

**Symptoms:**
- `Error: Invalid dodecet encoding`
- Encoding/decoding mismatch
- Loss of precision

**Solutions:**

1. **Validate input range:**
   ```rust
   use constrainttheory::encoding::DodecetEncoder;

   // Coordinates must be in valid range
   assert!(coord >= -1.0 && coord <= 1.0);
   ```

2. **Check quantization:**
   ```rust
   let encoder = DodecetEncoder::new();
   let encoded = encoder.encode(coord);
   let decoded = encoder.decode(encoded);

   // Small quantization error expected
   assert!((coord - decoded).abs() < 0.001);
   ```

3. **Verify precision:**
   ```rust
   // Dodecet has ~12-bit precision per coordinate
   let expected_precision = 1.0 / 2048.0;  // 2^11
   ```

4. **Test round-trip:**
   ```rust
   let original = vec![0.5, -0.3, 0.8];
   let encoded = encoder.encode_vector(&original);
   let decoded = encoder.decode_vector(encoded);

   assert_eq!(original.len(), decoded.len());
   ```

### Problem: Orientation calculation errors

**Symptoms:**
- `Error: Invalid orientation`
- Incorrect facing direction
- NaN in results

**Solutions:**

1. **Normalize vectors:**
   ```rust
   use constrainttheory::geometric::Vector;

   let v = Vector::new(x, y, z);
   let normalized = v.normalize();
   ```

2. **Check for zero vectors:**
   ```rust
   let magnitude = (x*x + y*y + z*z).sqrt();
   assert!(magnitude > 1e-10, "Zero vector not allowed");
   ```

3. **Validate quaternion:**
   ```rust
   use constrainttheory::geometric::Quaternion;

   let q = Quaternion::new(w, x, y, z);
   assert!(q.is_normalized(), "Quaternion must be normalized");
   ```

4. **Handle gimbal lock:**
   ```rust
   // Use quaternions instead of Euler angles
   let orientation = Quaternion::from_euler(pitch, yaw, roll);
   ```

---

## Performance Issues

### Problem: Slow KD-tree queries

**Symptoms:**
- >10ms per query
- O(n) instead of O(log n) behavior
- Poor scaling

**Solutions:**

1. **Check tree balance:**
   ```rust
   let tree = KDTree::balanced(points);
   ```

2. **Optimize query:**
   ```rust
   // Use bounded queries when possible
   let results = tree.query_within(bounds);
   ```

3. **Batch queries:**
   ```rust
   let queries = vec![query1, query2, query3];
   let results = tree.batch_query(&queries);
   ```

4. **Profile hotspots:**
   ```bash
   cargo build --release
   cargo flamegraph --example query_benchmark
   ```

### Problem: High memory usage

**Symptoms:**
- >100MB memory footprint
- Memory leak suspected
- Growing allocations

**Solutions:**

1. **Check memory usage:**
   ```bash
   cargo install cargo-bloat
   cargo bloat --release
   ```

2. **Reduce allocations:**
   ```rust
   // Reuse allocations
   let mut results = Vec::with_capacity(100);
   tree.query_into(point, radius, &mut results);
   results.clear();
   ```

3. **Use arena allocation:**
   ```rust
   use constrainttheory::memory::Arena;

   let arena = Arena::new();
   let tree = KDTree::new_in_arena(&arena, points);
   ```

4. **Profile memory:**
   ```bash
   valgrind --leak-check=full ./target/release/examples/query
   ```

### Problem: Slow agent queries

**Symptoms:**
- Poor FPS-style query performance
- No orientation filtering
- Full scans instead of indexed queries

**Solutions:**

1. **Enable spatial indexing:**
   ```rust
   use constrainttheory::agent::AgentQuery;

   let query = AgentQuery::new()
       .with_spatial_indexing(true)
       .with_orientation_filtering(true);
   ```

2. **Optimize view distance:**
   ```rust
   let query = AgentQuery::new()
       .with_max_distance(100.0);
   ```

3. **Use perspective queries:**
   ```rust
   let results = query.by_perspective(agent_position, agent_facing);
   ```

4. **Benchmark performance:**
   ```bash
   cargo bench --bench agent_query
   ```

---

## Geometric Computation Issues

### Problem: Incorrect distance calculations

**Symptoms:**
- Wrong distances between points
- Inconsistent results
- Negative distances

**Solutions:**

1. **Use appropriate metric:**
   ```rust
   use constrainttheory::metric::Metric;

   // Euclidean distance (default)
   let d = Metric::Euclidean.distance(a, b);

   // Manhattan distance
   let d = Metric::Manhattan.distance(a, b);

   // Chebyshev distance
   let d = Metric::Chebyshev.distance(a, b);
   ```

2. **Check coordinate systems:**
   ```rust
   // Ensure consistent coordinate system
   let a = Point3::new(x1, y1, z1);
   let b = Point3::new(x2, y2, z2);
   ```

3. **Validate inputs:**
   ```rust
   assert!(!a.has_nan(), "Point contains NaN");
   assert!(!b.has_nan(), "Point contains NaN");
   ```

4. **Test with known values:**
   ```rust
   let origin = Point3::new(0.0, 0.0, 0.0);
   let unit_x = Point3::new(1.0, 0.0, 0.0);
   assert_eq!(origin.distance(unit_x), 1.0);
   ```

### Problem: Intersection detection fails

**Symptoms:**
- Missed intersections
- False positives
- Edge cases not handled

**Solutions:**

1. **Use robust predicates:**
   ```rust
   use constrainttheory::geometry::robust;

   let intersects = robust::segment_intersection(a1, a2, b1, b2);
   ```

2. **Check bounding boxes first:**
   ```rust
   if !a.bounds().intersects(&b.bounds()) {
       return false;  // Early exit
   }
   ```

3. **Handle edge cases:**
   ```rust
   // Colinear, overlapping, etc.
   let result = robust::segment_intersection_with_edge_case(a1, a2, b1, b2);
   ```

4. **Validate topology:**
   ```rust
   use constrainttheory::topology::Validator;

   let validator = Validator::new();
   validator.check_intersections(mesh);
   ```

### Problem: Constraint solving fails

**Symptoms:**
- `Error: Constraint system unsolvable`
- Solver doesn't converge
- Unexpected solutions

**Solutions:**

1. **Check constraint consistency:**
   ```rust
   use constrainttheory::constraint::System;

   let system = System::new();
   assert!(system.is_consistent(), "Constraints are inconsistent");
   ```

2. **Add tolerance:**
   ```rust
   let solver = Solver::new()
       .with_tolerance(1e-6)
       .with_max_iterations(1000);
   ```

3. **Check for cycles:**
   ```rust
   if system.has_cycles() {
       // Break cycles or use iterative solver
   }
   ```

4. **Use appropriate solver:**
   ```rust
   use constrainttheory::solver::{SolverType, Solver};

   // For linear constraints
   let linear_solver = Solver::new(SolverType::Linear);

   // For non-linear constraints
   let nonlinear_solver = Solver::new(SolverType::NonLinear);
   ```

---

## Getting Help

### Community Resources

- **GitHub Issues:** https://github.com/SuperInstance/constrainttheory/issues
- **GitHub Discussions:** https://github.com/SuperInstance/constrainttheory/discussions
- **Documentation:** https://constraint-theory.superinstance.ai

### Diagnostic Information

When reporting issues, include:

1. **Library version:**
   ```bash
   cargo pkgid constrainttheory
   ```

2. **Rust version:**
   ```bash
   rustc --version
   ```

3. **System information:**
   ```bash
   uname -a  # Linux/macOS
   systeminfo  # Windows
   ```

4. **Minimal reproduction:**
   ```rust
   // Smallest code that reproduces the issue
   use constrainttheory::*;

   fn main() {
       // Your code here
   }
   ```

5. **Error message:**
   - Full error output
   - Backtrace (if panic)
   - Expected vs actual behavior

### Debug Mode

Enable comprehensive debugging:

```rust
// Enable debug logging
use constrainttheory::debug;

debug::set_level(debug::Level::Trace);

// Enable assertions
debug::enable_assertions();

// Trace execution
debug::trace_function("my_function");
```

### Known Issues

Check the [known issues](https://github.com/SuperInstance/constrainttheory/issues?q=is%3Aissue+is%3Aopen+label%3Aknown-issue) page for:
- Workarounds
- Temporary fixes
- Upcoming solutions

---

## Advanced Troubleshooting

### Enable Core Dumps

**Linux:**
```bash
ulimit -c unlimited
echo "/tmp/core.%e.%p" | sudo tee /proc/sys/kernel/core_pattern
```

**macOS:**
```bash
ulimit -c unlimited
```

### Memory Profiling

```bash
# Install tools
cargo install flamegraph

# Generate flamegraph
cargo flamegraph --example query_benchmark

# Analyze with heaptrack
heaptrack ./target/release/examples/query_benchmark
```

### Performance Profiling

```bash
# CPU profiling
perf record -g ./target/release/examples/query_benchmark
perf report

# Memory profiling
valgrind --tool=massif ./target/release/examples/query_benchmark
```

---

**Still having issues?**

Please open a GitHub issue with:
- Detailed description
- Steps to reproduce
- Diagnostic information
- Minimal reproduction case

We'll help you resolve it!
