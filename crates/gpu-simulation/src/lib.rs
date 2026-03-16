//! GPU Simulation Framework for Constraint Theory
//!
//! This crate provides a simulated GPU architecture for testing and validating
//! constraint theory algorithms before implementing them in actual CUDA code.
//!
//! # Features
//!
//! - Simulated GPU memory hierarchy (global, shared, register files)
//! - Thread block scheduler for testing parallel algorithms
//! - Memory coalescing simulation
//! - Benchmarking framework for comparing approaches
//! - Performance prediction for actual GPU implementation
//!
//! # Architecture
//!
//! The simulation models a modern NVIDIA GPU architecture:
//! - **Global Memory**: Large, slow, off-chip memory (~400 GB/s bandwidth)
//! - **Shared Memory**: Fast, on-chip memory shared by thread block (~20 TB/s)
//! - **Register Files**: Fastest, per-thread storage
//! - **Memory Coalescing**: Combines memory accesses from adjacent threads
//! - **Warp Scheduling**: SIMT execution model (32 threads per warp)
//!
//! # Example
//!
//! ```no_run
//! use gpu_simulation::{GPUSimulator, KernelConfig, launch_kernel};
//!
//! # fn main() -> Result<(), Box<dyn std::error::Error>> {
//! // Create simulator with RTX 4090 specifications
//! let mut sim = GPUSimulator::rtx_4090();
//!
//! // Configure kernel
//! let config = KernelConfig {
//!     threads_per_block: 256,
//!     blocks: (1000 + 256 - 1) / 256,
//!     shared_memory_bytes: 4096,
//! };
//!
//! // Launch kernel and measure performance
//! let result = launch_kernel(&mut sim, config, |sim| {
//!     // Your kernel logic here
//!     Ok(())
//! })?;
//!
//! println!("Simulated execution time: {:?}", result.execution_time);
//! println!("Memory throughput: {:.2} GB/s", result.memory_throughput);
//! # Ok(())
//! # }
//! ```

pub mod architecture;
pub mod memory;
pub mod kernel;
pub mod benchmark;
pub mod prediction;
pub mod visualization;

pub use architecture::{GPUSpecs, Warp, ThreadBlock};
pub use memory::{MemoryHierarchy, MemoryAccess, MemoryType};
pub use kernel::{KernelConfig, KernelResult, launch_kernel};
pub use benchmark::{BenchmarkSuite, BenchmarkResult};
pub use prediction::{PerformancePredictor, GPUProjection};
pub use visualization::{Visualizer, ReportFormat};

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_simulator_creation() {
        let sim = GPUSimulator::rtx_4090();
        assert_eq!(sim.specs().compute_units, 128); // RTX 4090 SM count
    }

    #[test]
    fn test_memory_hierarchy() {
        let mem = MemoryHierarchy::new(24 * 1024 * 1024 * 1024, 100 * 1024, 256);
        assert_eq!(mem.global_size(), 24 * 1024 * 1024 * 1024);
        assert_eq!(mem.shared_size(), 100 * 1024);
    }
}

/// Helper function to create a simulator with common GPU specifications
pub struct GPUSimulator {
    specs: GPUSpecs,
    memory: MemoryHierarchy,
}

impl GPUSimulator {
    /// Create a simulator with custom specifications
    pub fn new(specs: GPUSpecs) -> Self {
        let memory = MemoryHierarchy::new(
            specs.global_memory_size,
            specs.shared_memory_per_block,
            specs.registers_per_block,
        );
        Self { specs, memory }
    }

    /// Create simulator with RTX 4090 specifications
    pub fn rtx_4090() -> Self {
        Self::new(GPUSpecs::rtx_4090())
    }

    /// Create simulator with A100 specifications
    pub fn a100() -> Self {
        Self::new(GPUSpecs::a100())
    }

    /// Create simulator with H100 specifications
    pub fn h100() -> Self {
        Self::new(GPUSpecs::h100())
    }

    /// Get GPU specifications
    pub fn specs(&self) -> &GPUSpecs {
        &self.specs
    }

    /// Get memory hierarchy
    pub fn memory(&self) -> &MemoryHierarchy {
        &self.memory
    }

    /// Get mutable memory hierarchy
    pub fn memory_mut(&mut self) -> &mut MemoryHierarchy {
        &mut self.memory
    }
}
