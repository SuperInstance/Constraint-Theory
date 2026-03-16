//! Simple GPU Simulation Example
//!
//! This example demonstrates basic usage of the GPU simulation framework.

use gpu_simulation::{GPUSimulator, KernelConfig, launch_kernel};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("GPU Simulation Framework - Simple Example\n");

    // Create simulator with RTX 4090 specifications
    let mut sim = GPUSimulator::rtx_4090();

    println!("GPU Specifications:");
    println!("  Model: {}", sim.specs().name);
    println!("  Compute Units: {}", sim.specs().compute_units);
    println!("  Global Memory: {} GB", sim.specs().global_memory_size / (1024 * 1024 * 1024));
    println!("  Memory Bandwidth: {:.1} GB/s", sim.specs().global_memory_bandwidth as f64 / 1e9);
    println!("  Theoretical Peak: {:.2} TFLOPs\n", sim.specs().theoretical_peak_flops() / 1e12);

    // Configure a simple kernel
    let config = KernelConfig::new(256, 10)
        .with_name("simple_kernel")
        .with_shared_memory(4096)
        .with_registers(32);

    println!("Kernel Configuration:");
    println!("  Name: {}", config.name);
    println!("  Threads per Block: {}", config.threads_per_block);
    println!("  Number of Blocks: {}", config.blocks);
    println!("  Total Threads: {}", config.total_threads());
    println!("  Shared Memory: {} bytes\n", config.shared_memory_bytes);

    // Launch the kernel
    println!("Launching kernel...\n");
    let result = launch_kernel(&mut sim, config, |ctx| {
        // Simple kernel: read some data, do computation
        for block in ctx.blocks_mut() {
            for warp_idx in 0..block.warps.len().min(8) {
                // Simulate reading input data
                ctx.global_read(warp_idx * 64, 64, warp_idx);

                // Simulate computation
                for _ in 0..100 {
                    ctx.record_instruction();
                }

                // Simulate writing output
                ctx.global_write(warp_idx * 64, 64, warp_idx);
            }
        }

        Ok(())
    })?;

    // Display results
    println!("Kernel Results:");
    println!("  Total Execution Time: {:.2} μs", result.execution_time.as_secs_f64() * 1e6);
    println!("  Kernel Time: {:.2} μs", result.kernel_time.as_secs_f64() * 1e6);
    println!("  Memory Time: {:.2} μs", result.memory_time.as_secs_f64() * 1e6);
    println!("  Memory Throughput: {:.2} GB/s", result.memory_throughput / 1e9);
    println!("  Instructions Executed: {}", result.instructions_executed);
    println!("  Warp Efficiency: {:.1}%", result.warp_efficiency * 100.0);
    println!("  Memory Efficiency: {:.1}%", result.memory_efficiency * 100.0);
    println!("  Occupancy: {:.1}%\n", result.occupancy * 100.0);

    println!("Execution Statistics:");
    println!("  Global Memory Reads: {} MB", result.stats.global_memory_reads / (1024 * 1024));
    println!("  Global Memory Writes: {} MB", result.stats.global_memory_writes / (1024 * 1024));
    println!("  Shared Memory Accesses: {}", result.stats.shared_memory_accesses);
    println!("  L1 Cache Hit Rate: {:.1}%",
        (result.stats.l1_hits as f64 / (result.stats.l1_hits + result.stats.l1_misses) as f64) * 100.0);
    println!("  Warp Divergences: {}", result.stats.warp_divergences);

    Ok(())
}
