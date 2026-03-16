//! Performance Prediction Module
//!
//! Predicts performance on actual GPU hardware based on simulation results
//! and architectural characteristics.

use std::collections::HashMap;
use serde::{Deserialize, Serialize};

use crate::architecture::GPUSpecs;
use crate::kernel::KernelResult;

/// Performance predictor for actual GPU hardware
#[derive(Clone)]
pub struct PerformancePredictor {
    /// GPU specifications
    specs: GPUSpecs,

    /// Calibration data from real hardware
    calibration: Option<CalibrationData>,

    /// Historical performance data
    history: Vec<PerformanceRecord>,
}

/// Calibration data from real hardware measurements
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CalibrationData {
    /// GPU model
    pub gpu_model: String,

    /// Actual vs simulated performance ratio
    pub performance_ratio: f64,

    /// Memory bandwidth scaling factor
    pub memory_bandwidth_factor: f64,

    /// Compute scaling factor
    pub compute_factor: f64,

    /// Latency overhead (nanoseconds)
    pub latency_overhead_ns: u64,
}

/// Historical performance record
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PerformanceRecord {
    /// Kernel name
    pub kernel_name: String,

    /// Problem size
    pub problem_size: usize,

    /// Simulated time
    pub simulated_time_us: f64,

    /// Actual time (if available)
    pub actual_time_us: Option<f64>,
}

/// GPU performance projection
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GPUProjection {
    /// Predicted execution time on GPU
    pub predicted_time: std::time::Duration,

    /// Expected speedup over CPU
    pub speedup_over_cpu: f64,

    /// Expected bandwidth utilization (0-1)
    pub bandwidth_utilization: f64,

    /// Expected compute utilization (0-1)
    pub compute_utilization: f64,

    /// Confidence level (0-1)
    pub confidence: f64,

    /// Performance breakdown
    pub breakdown: PerformanceBreakdown,

    /// Optimization recommendations
    pub recommendations: Vec<String>,
}

/// Performance breakdown
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PerformanceBreakdown {
    /// Computation time percentage
    pub computation_pct: f64,

    /// Memory transfer time percentage
    pub memory_pct: f64,

    /// Overhead percentage
    pub overhead_pct: f64,

    /// Bottleneck identification
    pub bottleneck: BottleneckAnalysis,
}

/// Bottleneck analysis
#[derive(Clone, Debug, Serialize, Deserialize)]
pub enum BottleneckAnalysis {
    /// Computation bound
    ComputeBound {
        severity: f64,
        reason: String,
    },

    /// Memory bandwidth bound
    MemoryBound {
        severity: f64,
        reason: String,
    },

    /// Latency bound
    LatencyBound {
        severity: f64,
        reason: String,
    },

    /// Balanced
    Balanced {
        compute_fraction: f64,
        memory_fraction: f64,
    },
}

impl PerformancePredictor {
    /// Create a new performance predictor
    pub fn new(specs: GPUSpecs) -> Self {
        Self {
            specs,
            calibration: None,
            history: Vec::new(),
        }
    }

    /// Add calibration data from real hardware
    pub fn calibrate(&mut self, data: CalibrationData) {
        self.calibration = Some(data);
    }

    /// Predict performance on actual GPU
    pub fn predict(&self, result: &KernelResult) -> GPUProjection {
        // Get calibration factors
        let perf_ratio = self
            .calibration
            .as_ref()
            .map(|c| c.performance_ratio)
            .unwrap_or(1.0);

        let memory_factor = self
            .calibration
            .as_ref()
            .map(|c| c.memory_bandwidth_factor)
            .unwrap_or(1.0);

        let compute_factor = self
            .calibration
            .as_ref()
            .map(|c| c.compute_factor)
            .unwrap_or(1.0);

        let latency_ns = self
            .calibration
            .as_ref()
            .map(|c| c.latency_overhead_ns)
            .unwrap_or(1000);

        // Calculate predicted time
        let simulated_ns = result.execution_time.as_nanos() as f64;
        let predicted_ns = (simulated_ns / perf_ratio) + latency_ns as f64;
        let predicted_time = std::time::Duration::from_nanos(predicted_ns as u64);

        // Calculate utilization
        let bandwidth_utilization = (result.memory_throughput / self.specs.global_memory_bandwidth as f64)
            * memory_factor;

        let theoretical_flops = self.specs.theoretical_peak_flops();
        let achieved_flops = result.instructions_executed as f64 / result.kernel_time.as_secs_f64();
        let compute_utilization = (achieved_flops / theoretical_flops) * compute_factor;

        // Analyze bottleneck
        let total_time = result.kernel_time.as_secs_f64() + result.memory_time.as_secs_f64();
        let computation_pct = (result.kernel_time.as_secs_f64() / total_time) * 100.0;
        let memory_pct = (result.memory_time.as_secs_f64() / total_time) * 100.0;
        let overhead_pct = 100.0 - computation_pct - memory_pct;

        let bottleneck = if computation_pct > 60.0 {
            BottleneckAnalysis::ComputeBound {
                severity: computation_pct / 100.0,
                reason: format!(
                    "Computation dominates ({}% of time). Consider optimizing algorithm or using more parallel threads.",
                    computation_pct
                ),
            }
        } else if memory_pct > 60.0 {
            BottleneckAnalysis::MemoryBound {
                severity: memory_pct / 100.0,
                reason: format!(
                    "Memory bandwidth dominates ({}% of time). Consider improving memory coalescing or using shared memory.",
                    memory_pct
                ),
            }
        } else if overhead_pct > 20.0 {
            BottleneckAnalysis::LatencyBound {
                severity: overhead_pct / 100.0,
                reason: format!(
                    "Overhead is significant ({}% of time). Consider kernel fusion or reducing synchronization.",
                    overhead_pct
                ),
            }
        } else {
            BottleneckAnalysis::Balanced {
                compute_fraction: computation_pct / 100.0,
                memory_fraction: memory_pct / 100.0,
            }
        };

        // Generate recommendations
        let recommendations = self.generate_recommendations(&bottleneck, result);

        // Calculate confidence based on warp and memory efficiency
        let confidence = (result.warp_efficiency * 0.5 + result.memory_efficiency * 0.5).min(1.0);

        // Estimate speedup over CPU (naive estimate)
        let cpu_time = result.execution_time.as_secs_f64() * 100.0; // Assume 100x slower CPU
        let speedup_over_cpu = cpu_time / predicted_time.as_secs_f64();

        GPUProjection {
            predicted_time,
            speedup_over_cpu,
            bandwidth_utilization: bandwidth_utilization.min(1.0),
            compute_utilization: compute_utilization.min(1.0),
            confidence,
            breakdown: PerformanceBreakdown {
                computation_pct,
                memory_pct,
                overhead_pct,
                bottleneck,
            },
            recommendations,
        }
    }

    /// Generate optimization recommendations
    fn generate_recommendations(
        &self,
        bottleneck: &BottleneckAnalysis,
        result: &KernelResult,
    ) -> Vec<String> {
        let mut recommendations = Vec::new();

        // Bottleneck-specific recommendations
        match bottleneck {
            BottleneckAnalysis::ComputeBound { severity, .. } => {
                if *severity > 0.7 {
                    recommendations.push(
                        "High compute utilization: Consider algorithmic optimizations".to_string()
                    );
                }
            }
            BottleneckAnalysis::MemoryBound { severity, .. } => {
                if *severity > 0.7 {
                    recommendations.push(
                        "Memory bandwidth bound: Increase shared memory usage".to_string()
                    );
                    recommendations.push(
                        "Consider memory coalescing optimizations".to_string()
                    );
                }
            }
            BottleneckAnalysis::LatencyBound { .. } => {
                recommendations.push(
                    "Consider kernel fusion to reduce kernel launch overhead".to_string()
                );
            }
            BottleneckAnalysis::Balanced { .. } => {
                recommendations.push(
                    "Well-balanced kernel! Minor optimizations only.".to_string()
                );
            }
        }

        // Efficiency-based recommendations
        if result.warp_efficiency < 0.7 {
            recommendations.push(
                format!("Low warp efficiency ({:.1}%): Reduce branch divergence", result.warp_efficiency * 100.0)
            );
        }

        if result.memory_efficiency < 0.7 {
            recommendations.push(
                format!("Low memory efficiency ({:.1}%): Improve memory access patterns", result.memory_efficiency * 100.0)
            );
        }

        if result.occupancy < 0.5 {
            recommendations.push(
                format!("Low occupancy ({:.1}%): Increase thread count or reduce resource usage", result.occupancy * 100.0)
            );
        }

        recommendations
    }

    /// Compare predicted performance across GPUs
    pub fn compare_gpus(&self, result: &KernelResult) -> GPUComparison {
        let current_projection = self.predict(result);

        // Compare with other GPUs
        let a100_specs = GPUSpecs::a100();
        let a100_predictor = PerformancePredictor::new(a100_specs);
        let a100_projection = a100_predictor.predict(result);

        let h100_specs = GPUSpecs::h100();
        let h100_predictor = PerformancePredictor::new(h100_specs);
        let h100_projection = h100_predictor.predict(result);

        GPUComparison {
            current_gpu: self.specs.name.clone(),
            current_projection,
            a100_projection,
            h100_projection,
        }
    }

    /// Add performance record to history
    pub fn record_performance(&mut self, record: PerformanceRecord) {
        self.history.push(record);
    }

    /// Get prediction accuracy based on historical data
    pub fn accuracy(&self) -> Option<f64> {
        let records_with_actual: Vec<_> = self
            .history
            .iter()
            .filter(|r| r.actual_time_us.is_some())
            .collect();

        if records_with_actual.is_empty() {
            return None;
        }

        let errors: Vec<f64> = records_with_actual
            .iter()
            .map(|r| {
                let actual = r.actual_time_us.unwrap();
                let predicted = r.simulated_time_us;
                ((actual - predicted).abs() / actual) * 100.0
            })
            .collect();

        let mean_error = errors.iter().sum::<f64>() / errors.len() as f64;
        Some(100.0 - mean_error) // Return accuracy percentage
    }
}

/// Comparison across GPU models
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct GPUComparison {
    pub current_gpu: String,
    pub current_projection: GPUProjection,
    pub a100_projection: GPUProjection,
    pub h100_projection: GPUProjection,
}

impl GPUComparison {
    /// Format comparison as table
    pub fn format_table(&self) -> String {
        let mut output = String::new();

        output.push_str("GPU Performance Comparison\n");
        output.push_str(&str::repeat("=", 80));
        output.push_str("\n\n");

        // Current GPU
        output.push_str(&format!("{}\n", self.current_gpu));
        output.push_str(&format!("  Predicted Time: {:.2} ms\n", self.current_projection.predicted_time.as_secs_f64() * 1000.0));
        output.push_str(&format!("  Speedup over CPU: {:.1}x\n", self.current_projection.speedup_over_cpu));
        output.push_str("\n");

        // A100
        output.push_str("NVIDIA A100\n");
        output.push_str(&format!("  Predicted Time: {:.2} ms\n", self.a100_projection.predicted_time.as_secs_f64() * 1000.0));
        output.push_str(&format!("  Speedup: {:.1}x vs current\n", self.current_projection.predicted_time.as_secs_f64() / self.a100_projection.predicted_time.as_secs_f64()));
        output.push_str("\n");

        // H100
        output.push_str("NVIDIA H100\n");
        output.push_str(&format!("  Predicted Time: {:.2} ms\n", self.h100_projection.predicted_time.as_secs_f64() * 1000.0));
        output.push_str(&format!("  Speedup: {:.1}x vs current\n", self.current_projection.predicted_time.as_secs_f64() / self.h100_projection.predicted_time.as_secs_f64()));

        output
    }
}

/// Performance projection for specific constraint theory operations
#[derive(Clone, Debug)]
pub struct ConstraintTheoryProjection {
    /// Operation name
    pub operation: String,

    /// Current performance (CPU)
    pub current_time_us: f64,

    /// Predicted GPU time
    pub predicted_gpu_time_us: f64,

    /// Expected speedup
    pub speedup: f64,

    /// Problem size
    pub problem_size: usize,

    /// Scalability analysis
    pub scalability: ScalabilityAnalysis,
}

/// Scalability analysis
#[derive(Clone, Debug)]
pub struct ScalabilityAnalysis {
    /// Strong scaling efficiency (fixed problem size)
    pub strong_scaling: Vec<(usize, f64)>, // (thread count, efficiency)

    /// Weak scaling efficiency (fixed work per thread)
    pub weak_scaling: Vec<(usize, f64)>, // (thread count, efficiency)

    /// Recommended thread count
    pub optimal_threads: usize,

    /// Maximum useful threads
    pub max_useful_threads: usize,
}

impl ScalabilityAnalysis {
    /// Create scalability analysis for given problem size
    pub fn analyze(problem_size: usize, max_threads: usize) -> Self {
        let thread_counts: Vec<usize> = [32, 64, 128, 256, 512, 1024, 2048]
            .iter()
            .filter(|&&t| t <= max_threads)
            .copied()
            .collect();

        // Strong scaling: fixed problem size
        let strong_scaling: Vec<_> = thread_counts
            .iter()
            .map(|&threads| {
                let efficiency = Self::estimate_strong_scaling_efficiency(problem_size, threads);
                (threads, efficiency)
            })
            .collect();

        // Weak scaling: fixed work per thread
        let weak_scaling: Vec<_> = thread_counts
            .iter()
            .map(|&threads| {
                let efficiency = Self::estimate_weak_scaling_efficiency(threads);
                (threads, efficiency)
            })
            .collect();

        // Find optimal thread count
        let optimal_threads = *thread_counts
            .iter()
            .filter(|&&t| t <= 1024)
            .max_by_key(|&t| {
                strong_scaling.iter().find(|&&(threads, _)| threads == t).map(|(_, e)| e).unwrap_or(0.0)
            })
            .unwrap_or(&256);

        // Maximum useful threads (where efficiency drops below 50%)
        let max_useful_threads = *strong_scaling
            .iter()
            .find(|(_, efficiency)| *efficiency < 0.5)
            .map(|(threads, _)| *threads)
            .unwrap_or(max_threads);

        Self {
            strong_scaling,
            weak_scaling,
            optimal_threads,
            max_useful_threads,
        }
    }

    /// Estimate strong scaling efficiency
    fn estimate_strong_scaling_efficiency(problem_size: usize, threads: usize) -> f64 {
        // Amdahl's law approximation
        let serial_fraction = 0.05; // Assume 5% serial work
        let parallel_fraction = 1.0 - serial_fraction;
        let speedup = 1.0 / (serial_fraction + parallel_fraction / threads as f64);
        let ideal_speedup = threads as f64;
        speedup / ideal_speedup
    }

    /// Estimate weak scaling efficiency
    fn estimate_weak_scaling_efficiency(threads: usize) -> f64 {
        // Gustafson's law approximation
        // Assume slight overhead from communication/synchronization
        let overhead = (threads as f64).log2() * 0.01; // 1% overhead per doubling of threads
        (1.0 - overhead).max(0.1)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::kernel::{KernelConfig, launch_kernel};

    #[test]
    fn test_performance_prediction() {
        let specs = GPUSpecs::rtx_4090();
        let predictor = PerformancePredictor::new(specs);

        let mut sim = crate::GPUSimulator::rtx_4090();
        let config = KernelConfig::new(256, 10);
        let result = launch_kernel(&mut sim, config, |ctx| {
            // Simulate some work
            for block in ctx.blocks_mut() {
                for _ in 0..1000 {
                    ctx.record_instruction();
                    ctx.global_read(0, 4, 0);
                }
            }
            Ok(())
        }).unwrap();

        let projection = predictor.predict(&result);
        assert!(projection.predicted_time > std::time::Duration::ZERO);
        assert!(projection.speedup_over_cpu > 1.0);
    }

    #[test]
    fn test_scalability_analysis() {
        let analysis = ScalabilityAnalysis::analyze(100000, 2048);

        assert!(!analysis.strong_scaling.is_empty());
        assert!(!analysis.weak_scaling.is_empty());
        assert!(analysis.optimal_threads > 0);
        assert!(analysis.max_useful_threads > 0);
    }

    #[test]
    fn test_gpu_comparison() {
        let specs = GPUSpecs::rtx_4090();
        let predictor = PerformancePredictor::new(specs);

        let result = KernelResult {
            kernel_name: "test".to_string(),
            execution_time: std::time::Duration::from_micros(1000),
            kernel_time: std::time::Duration::from_micros(800),
            memory_time: std::time::Duration::from_micros(200),
            memory_throughput: 100_000_000_000.0,
            instructions_executed: 1_000_000,
            warp_efficiency: 0.9,
            memory_efficiency: 0.85,
            occupancy: 0.75,
            stats: crate::kernel::ExecutionStats {
                global_memory_reads: 1_000_000,
                global_memory_writes: 500_000,
                shared_memory_accesses: 100_000,
                l1_hits: 800_000,
                l1_misses: 200_000,
                warp_divergences: 100,
                active_warps_per_cycle: 48.0,
            },
        };

        let comparison = predictor.compare_gpus(&result);
        assert!(comparison.current_projection.predicted_time > std::time::Duration::ZERO);
        assert!(comparison.a100_projection.predicted_time > std::time::Duration::ZERO);
        assert!(comparison.h100_projection.predicted_time > std::time::Duration::ZERO);
    }
}
