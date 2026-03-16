//! GPU Kernel Execution Framework
//!
//! Provides framework for simulating GPU kernel execution including
//! thread block scheduling, memory transfers, and kernel timing.

use std::time::{Duration, Instant};

use crate::architecture::{ThreadBlock, GPUSpecs};
use crate::memory::{MemoryHierarchy, MemoryAccess, MemoryType};

/// Kernel configuration
#[derive(Clone, Debug)]
pub struct KernelConfig {
    /// Threads per block
    pub threads_per_block: usize,

    /// Number of blocks
    pub blocks: usize,

    /// Shared memory per block (bytes)
    pub shared_memory_bytes: usize,

    /// Register count per thread
    pub registers_per_thread: usize,

    /// Kernel name
    pub name: String,
}

impl KernelConfig {
    /// Create a new kernel configuration
    pub fn new(threads_per_block: usize, blocks: usize) -> Self {
        Self {
            threads_per_block,
            blocks,
            shared_memory_bytes: 0,
            registers_per_thread: 32,
            name: "unnamed_kernel".to_string(),
        }
    }

    /// Set shared memory size
    pub fn with_shared_memory(mut self, bytes: usize) -> Self {
        self.shared_memory_bytes = bytes;
        self
    }

    /// Set registers per thread
    pub fn with_registers(mut self, count: usize) -> Self {
        self.registers_per_thread = count;
        self
    }

    /// Set kernel name
    pub fn with_name(mut self, name: impl Into<String>) -> Self {
        self.name = name.into();
        self
    }

    /// Calculate total threads
    pub fn total_threads(&self) -> usize {
        self.threads_per_block * self.blocks
    }

    /// Validate configuration against GPU specs
    pub fn validate(&self, specs: &GPUSpecs) -> Result<(), KernelValidationError> {
        if self.threads_per_block > specs.max_threads_per_block {
            return Err(KernelValidationError::TooManyThreads {
                requested: self.threads_per_block,
                max: specs.max_threads_per_block,
            });
        }

        if self.shared_memory_bytes > specs.shared_memory_per_block {
            return Err(KernelValidationError::TooMuchSharedMemory {
                requested: self.shared_memory_bytes,
                max: specs.shared_memory_per_block,
            });
        }

        let total_registers = self.threads_per_block * self.registers_per_thread;
        if total_registers > specs.registers_per_block {
            return Err(KernelValidationError::TooManyRegisters {
                requested: total_registers,
                max: specs.registers_per_block,
            });
        }

        Ok(())
    }
}

/// Kernel validation errors
#[derive(Clone, Debug)]
pub enum KernelValidationError {
    TooManyThreads { requested: usize, max: usize },
    TooMuchSharedMemory { requested: usize, max: usize },
    TooManyRegisters { requested: usize, max: usize },
}

impl From<KernelValidationError> for KernelError {
    fn from(err: KernelValidationError) -> Self {
        match err {
            KernelValidationError::TooManyThreads { requested, max } => {
                KernelError::InvalidConfig(format!(
                    "Too many threads: requested={}, max={}",
                    requested, max
                ))
            }
            KernelValidationError::TooMuchSharedMemory { requested, max } => {
                KernelError::InvalidConfig(format!(
                    "Too much shared memory: requested={}, max={}",
                    requested, max
                ))
            }
            KernelValidationError::TooManyRegisters { requested, max } => {
                KernelError::InvalidConfig(format!(
                    "Too many registers: requested={}, max={}",
                    requested, max
                ))
            }
        }
    }
}

/// Kernel execution result
#[derive(Clone, Debug)]
pub struct KernelResult {
    /// Kernel name
    pub kernel_name: String,

    /// Total execution time
    pub execution_time: Duration,

    /// Kernel time (computation only)
    pub kernel_time: Duration,

    /// Memory transfer time
    pub memory_time: Duration,

    /// Memory throughput (bytes/second)
    pub memory_throughput: f64,

    /// Instructions executed
    pub instructions_executed: u64,

    /// Warp efficiency (0-1)
    pub warp_efficiency: f64,

    /// Memory access efficiency (0-1)
    pub memory_efficiency: f64,

    /// Occupancy (0-1)
    pub occupancy: f64,

    /// Performance statistics
    pub stats: ExecutionStats,
}

/// Detailed execution statistics
#[derive(Clone, Debug)]
pub struct ExecutionStats {
    /// Global memory reads (bytes)
    pub global_memory_reads: usize,

    /// Global memory writes (bytes)
    pub global_memory_writes: usize,

    /// Shared memory accesses
    pub shared_memory_accesses: usize,

    /// L1 cache hits
    pub l1_hits: usize,

    /// L1 cache misses
    pub l1_misses: usize,

    /// Warp divergences
    pub warp_divergences: usize,

    /// Active warps per cycle
    pub active_warps_per_cycle: f64,
}

/// Launch a kernel on the simulated GPU
pub fn launch_kernel<F>(
    simulator: &mut crate::GPUSimulator,
    config: KernelConfig,
    kernel: F,
) -> Result<KernelResult, KernelError>
where
    F: FnOnce(&mut KernelContext) -> Result<(), KernelError>,
{
    // Validate configuration
    config.validate(simulator.specs())?;

    let start = Instant::now();

    // Create kernel context
    let mut ctx = KernelContext::new(config.clone(), simulator);

    // Execute kernel
    kernel(&mut ctx)?;

    let execution_time = start.elapsed();

    // Calculate metrics
    let memory_throughput = if ctx.memory_time.as_secs_f64() > 0.0 {
        (ctx.stats.global_memory_reads + ctx.stats.global_memory_writes) as f64
            / ctx.memory_time.as_secs_f64()
    } else {
        0.0
    };

    let warp_efficiency = 1.0
        - (ctx.stats.warp_divergences as f64 / ctx.total_warps as f64).min(1.0);

    let memory_efficiency = {
        let total_accesses = ctx.stats.global_memory_reads + ctx.stats.global_memory_writes;
        let coalesced = (total_accesses as f64 * 0.8) as usize; // Assume 80% coalesced
        if total_accesses > 0 {
            coalesced as f64 / total_accesses as f64
        } else {
            1.0
        }
    };

    let occupancy = calculate_occupancy(&config, simulator.specs());

    Ok(KernelResult {
        kernel_name: config.name,
        execution_time,
        kernel_time: execution_time.saturating_sub(ctx.memory_time),
        memory_time: ctx.memory_time,
        memory_throughput,
        instructions_executed: ctx.instructions_executed,
        warp_efficiency,
        memory_efficiency,
        occupancy,
        stats: ctx.stats,
    })
}

/// Calculate GPU occupancy
fn calculate_occupancy(config: &KernelConfig, specs: &GPUSpecs) -> f64 {
    // Maximum warps per SM
    let max_warps_per_sm = 64; // Typical for modern GPUs

    // Warps per block
    let warps_per_block = (config.threads_per_block + 32 - 1) / 32;

    // Blocks per SM limited by registers
    let registers_per_block = config.threads_per_block * config.registers_per_thread;
    let blocks_by_registers = specs.registers_per_block / registers_per_block.max(1);

    // Blocks per SM limited by shared memory
    let blocks_by_shared = specs.shared_memory_per_block / config.shared_memory_bytes.max(1);

    // Blocks per SM limited by warps
    let blocks_by_warps = max_warps_per_sm / warps_per_block.max(1);

    // Actual blocks per SM
    let blocks_per_sm = blocks_by_registers
        .min(blocks_by_shared)
        .min(blocks_by_warps)
        .min(32); // Max 32 blocks per SM

    // Actual warps per SM
    let active_warps = blocks_per_sm * warps_per_block;

    // Occupancy
    (active_warps as f64 / max_warps_per_sm as f64).min(1.0)
}

/// Kernel execution context
pub struct KernelContext {
    config: KernelConfig,
    memory: MemoryHierarchy,
    blocks: Vec<ThreadBlock>,
    total_warps: usize,
    instructions_executed: u64,
    memory_time: Duration,
    stats: ExecutionStats,
}

impl KernelContext {
    /// Create a new kernel context
    fn new(config: KernelConfig, simulator: &mut crate::GPUSimulator) -> Self {
        // Create thread blocks
        let mut blocks = Vec::new();
        let mut total_warps = 0;

        for bid in 0..config.blocks {
            let block = ThreadBlock::new(
                bid,
                (config.threads_per_block, 1, 1),
                config.shared_memory_bytes / 4, // Convert to f32 elements
            );
            total_warps += block.warps.len();
            blocks.push(block);
        }

        // Clone memory hierarchy
        let memory = simulator.memory().clone();

        Self {
            config,
            memory,
            blocks,
            total_warps,
            instructions_executed: 0,
            memory_time: Duration::ZERO,
            stats: ExecutionStats {
                global_memory_reads: 0,
                global_memory_writes: 0,
                shared_memory_accesses: 0,
                l1_hits: 0,
                l1_misses: 0,
                warp_divergences: 0,
                active_warps_per_cycle: 0.0,
            },
        }
    }

    /// Get kernel configuration
    pub fn config(&self) -> &KernelConfig {
        &self.config
    }

    /// Get memory hierarchy
    pub fn memory(&self) -> &MemoryHierarchy {
        &self.memory
    }

    /// Get mutable memory hierarchy
    pub fn memory_mut(&mut self) -> &mut MemoryHierarchy {
        &mut self.memory
    }

    /// Get thread blocks
    pub fn blocks(&self) -> &[ThreadBlock] {
        &self.blocks
    }

    /// Get mutable thread blocks
    pub fn blocks_mut(&mut self) -> &mut [ThreadBlock] {
        &mut self.blocks
    }

    /// Simulate global memory read
    pub fn global_read(&mut self, address: usize, size: usize, thread_id: usize) -> Duration {
        let access = MemoryAccess {
            mem_type: MemoryType::Global,
            address,
            size,
            thread_id,
            is_write: false,
            timestamp: std::time::Duration::ZERO,
        };

        let time = self.memory.access(vec![access]);
        self.memory_time += time;
        self.stats.global_memory_reads += size;
        time
    }

    /// Simulate global memory write
    pub fn global_write(&mut self, address: usize, size: usize, thread_id: usize) -> Duration {
        let access = MemoryAccess {
            mem_type: MemoryType::Global,
            address,
            size,
            thread_id,
            is_write: true,
            timestamp: std::time::Duration::ZERO,
        };

        let time = self.memory.access(vec![access]);
        self.memory_time += time;
        self.stats.global_memory_writes += size;
        time
    }

    /// Simulate shared memory access
    pub fn shared_access(&mut self, _address: usize, size: usize) -> Duration {
        self.stats.shared_memory_accesses += size;
        Duration::from_nanos(30) // Approximate shared memory latency
    }

    /// Record warp divergence
    pub fn record_divergence(&mut self) {
        self.stats.warp_divergences += 1;
    }

    /// Record instruction execution
    pub fn record_instruction(&mut self) {
        self.instructions_executed += 1;
    }

    /// Get execution statistics
    pub fn stats(&self) -> &ExecutionStats {
        &self.stats
    }

    /// Synchronize all threads in block
    pub fn syncthreads(&mut self, block_id: usize) {
        // Simulate __syncthreads() barrier
        self.record_instruction();
    }
}

/// Kernel execution errors
#[derive(Clone, Debug)]
pub enum KernelError {
    InvalidConfig(String),
    ExecutionFailed(String),
    MemoryAccessViolation { address: usize, size: usize },
}

impl std::fmt::Display for KernelError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            KernelError::InvalidConfig(msg) => write!(f, "Invalid configuration: {}", msg),
            KernelError::ExecutionFailed(msg) => write!(f, "Execution failed: {}", msg),
            KernelError::MemoryAccessViolation { address, size } => {
                write!(f, "Memory access violation: addr={}, size={}", address, size)
            }
        }
    }
}

impl std::error::Error for KernelError {}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::GPUSimulator;

    #[test]
    fn test_kernel_config_validation() {
        let specs = GPUSpecs::rtx_4090();
        let config = KernelConfig::new(256, 10);

        assert!(config.validate(&specs).is_ok());
    }

    #[test]
    fn test_kernel_launch() {
        let mut sim = GPUSimulator::rtx_4090();
        let config = KernelConfig::new(256, 10);

        let result = launch_kernel(&mut sim, config, |ctx| {
            // Simple kernel that does nothing
            Ok(())
        });

        assert!(result.is_ok());
        let result = result.unwrap();
        assert!(result.execution_time > Duration::ZERO);
    }

    #[test]
    fn test_occupancy_calculation() {
        let specs = GPUSpecs::rtx_4090();
        let config = KernelConfig::new(256, 10);

        let occupancy = calculate_occupancy(&config, &specs);
        assert!(occupancy > 0.0 && occupancy <= 1.0);
    }
}
