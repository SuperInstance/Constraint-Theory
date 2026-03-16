//! GPU Memory Hierarchy Simulation
//!
//! Simulates the GPU memory hierarchy including global memory, shared memory,
//! L2 cache, and register files. Models memory access patterns and coalescing.

use std::collections::HashMap;
use std::time::Duration;

/// Memory type classification
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum MemoryType {
    /// Global DRAM (slowest)
    Global,
    /// L2 Cache
    L2,
    /// Shared memory (fast, on-chip)
    Shared,
    /// Register file (fastest)
    Register,
}

impl MemoryType {
    /// Approximate access latency in nanoseconds
    pub fn latency_ns(&self) -> u64 {
        match self {
            MemoryType::Global => 350,  // ~350ns for global memory
            MemoryType::L2 => 25,       // ~25ns for L2 cache
            MemoryType::Shared => 30,   // ~30ns for shared memory
            MemoryType::Register => 1,  // ~1ns for registers
        }
    }

    /// Approximate bandwidth in GB/s
    pub fn bandwidth_gb_per_s(&self) -> f64 {
        match self {
            MemoryType::Global => 1000.0,
            MemoryType::L2 => 3000.0,
            MemoryType::Shared => 20000.0,
            MemoryType::Register => 50000.0,
        }
    }
}

/// Memory access pattern
#[derive(Clone, Debug)]
pub struct MemoryAccess {
    /// Memory type
    pub mem_type: MemoryType,

    /// Access address (byte offset)
    pub address: usize,

    /// Access size (bytes)
    pub size: usize,

    /// Thread ID making the access
    pub thread_id: usize,

    /// Whether this is a read or write
    pub is_write: bool,

    /// Access timestamp
    pub timestamp: Duration,
}

impl MemoryAccess {
    /// Calculate effective access time with coalescing
    pub fn effective_time(&self, coalesced: bool) -> Duration {
        let base_latency = self.mem_type.latency_ns();

        let effective_ns = if coalesced {
            // Coalesced access: multiple threads combined
            base_latency / 8  // Approximate 8x speedup from coalescing
        } else {
            // Uncoalesced access: each transaction separate
            base_latency * 2
        };

        Duration::from_nanos(effective_ns)
    }

    /// Check if this access can be coalesced with another
    pub fn can_coalesce_with(&self, other: &MemoryAccess) -> bool {
        // Same memory type
        if self.mem_type != other.mem_type {
            return false;
        }

        // Same access type (read/write)
        if self.is_write != other.is_write {
            return false;
        }

        // Check address alignment (128-byte cache line)
        let cache_line_mask = 127;
        let self_line = self.address & !cache_line_mask;
        let other_line = other.address & !cache_line_mask;

        self_line == other_line
    }
}

/// Memory hierarchy statistics
#[derive(Clone, Debug, Default)]
pub struct MemoryStats {
    /// Total accesses
    pub total_accesses: usize,

    /// Accesses by memory type
    pub accesses_by_type: HashMap<MemoryType, usize>,

    /// Coalesced accesses
    pub coalesced_accesses: usize,

    /// Cache hits
    pub cache_hits: usize,

    /// Cache misses
    pub cache_misses: usize,

    /// Total bytes transferred
    pub bytes_transferred: usize,

    /// Total memory time
    pub total_memory_time: Duration,
}

impl MemoryStats {
    /// Calculate cache hit rate
    pub fn hit_rate(&self) -> f64 {
        let total = self.cache_hits + self.cache_misses;
        if total == 0 {
            return 0.0;
        }
        (self.cache_hits as f64 / total as f64) * 100.0
    }

    /// Calculate coalescing rate
    pub fn coalescing_rate(&self) -> f64 {
        if self.total_accesses == 0 {
            return 0.0;
        }
        (self.coalesced_accesses as f64 / self.total_accesses as f64) * 100.0
    }

    /// Calculate effective bandwidth
    pub fn effective_bandwidth(&self) -> f64 {
        let seconds = self.total_memory_time.as_secs_f64();
        if seconds == 0.0 {
            return 0.0;
        }
        (self.bytes_transferred as f64) / seconds
    }
}

/// GPU Memory Hierarchy
#[derive(Clone)]
pub struct MemoryHierarchy {
    /// Global memory size
    global_size: usize,

    /// Shared memory size per block
    shared_size: usize,

    /// Register file size per block
    register_size: usize,

    /// L2 cache size
    l2_size: usize,

    /// L2 cache (simplified direct-mapped)
    l2_cache: HashMap<usize, Vec<f32>>,

    /// Memory statistics
    stats: MemoryStats,
}

impl MemoryHierarchy {
    /// Create a new memory hierarchy
    pub fn new(global_size: usize, shared_size: usize, register_size: usize) -> Self {
        Self {
            global_size,
            shared_size,
            register_size,
            l2_size: 40 * 1024 * 1024, // Default 40 MB L2
            l2_cache: HashMap::new(),
            stats: MemoryStats::default(),
        }
    }

    /// Get global memory size
    pub fn global_size(&self) -> usize {
        self.global_size
    }

    /// Get shared memory size
    pub fn shared_size(&self) -> usize {
        self.shared_size
    }

    /// Get register file size
    pub fn register_size(&self) -> usize {
        self.register_size
    }

    /// Get memory statistics
    pub fn stats(&self) -> &MemoryStats {
        &self.stats
    }

    /// Reset statistics
    pub fn reset_stats(&mut self) {
        self.stats = MemoryStats::default();
    }

    /// Simulate memory access with coalescing
    pub fn access(&mut self, accesses: Vec<MemoryAccess>) -> Duration {
        let mut total_time = Duration::ZERO;
        let mut processed = vec![false; accesses.len()];

        for (i, access) in accesses.iter().enumerate() {
            if processed[i] {
                continue;
            }

            // Try to coalesce with subsequent accesses
            let mut coalesced_group = vec![i];
            for (j, other) in accesses.iter().enumerate().skip(i + 1) {
                if !processed[j] && access.can_coalesce_with(other) {
                    coalesced_group.push(j);
                    processed[j] = true;
                }
            }

            processed[i] = true;

            // Calculate effective time
            let coalesced = coalesced_group.len() > 1;
            let access_time = access.effective_time(coalesced);

            // Update statistics
            self.stats.total_accesses += 1;
            *self.stats.accesses_by_type.entry(access.mem_type).or_insert(0) += 1;
            if coalesced {
                self.stats.coalesced_accesses += coalesced_group.len();
            }

            // Check cache
            if access.mem_type == MemoryType::Global {
                if self.l2_cache.contains_key(&access.address) {
                    self.stats.cache_hits += 1;
                } else {
                    self.stats.cache_misses += 1;
                    // Insert into cache
                    let cache_line = access.address / 128; // 128-byte cache line
                    self.l2_cache.insert(cache_line, vec![0.0; 32]);
                }
            }

            self.stats.bytes_transferred += access.size * coalesced_group.len();
            total_time += access_time;
        }

        self.stats.total_memory_time += total_time;
        total_time
    }

    /// Predict memory access pattern efficiency
    pub fn predict_efficiency(&self, pattern: &AccessPattern) -> EfficiencyPrediction {
        // Analyze pattern characteristics
        let spatial_locality = self.analyze_spatial_locality(pattern);
        let temporal_locality = self.analyze_temporal_locality(pattern);
        let coalescing_potential = self.analyze_coalescing_potential(pattern);

        // Calculate overall efficiency
        let overall = (spatial_locality * 0.3
            + temporal_locality * 0.3
            + coalescing_potential * 0.4);

        EfficiencyPrediction {
            overall,
            spatial_locality,
            temporal_locality,
            coalescing_potential,
            predicted_bandwidth_utilization: overall * 0.8, // Max 80% theoretical
            recommended_optimizations: self.generate_recommendations(
                spatial_locality,
                temporal_locality,
                coalescing_potential,
            ),
        }
    }

    /// Analyze spatial locality of access pattern
    fn analyze_spatial_locality(&self, pattern: &AccessPattern) -> f64 {
        if pattern.addresses.is_empty() {
            return 0.0;
        }

        // Count accesses within 128-byte cache lines
        let mut cache_line_hits = 0;
        let mut cache_lines = HashMap::new();

        for &addr in &pattern.addresses {
            let line = addr / 128;
            if cache_lines.contains_key(&line) {
                cache_line_hits += 1;
            } else {
                cache_lines.insert(line, 1);
            }
        }

        let locality_score = cache_line_hits as f64 / pattern.addresses.len() as f64;
        locality_score.min(1.0)
    }

    /// Analyze temporal locality of access pattern
    fn analyze_temporal_locality(&self, pattern: &AccessPattern) -> f64 {
        if pattern.addresses.len() < 2 {
            return 0.0;
        }

        // Count repeated addresses
        let mut address_counts = HashMap::new();
        for &addr in &pattern.addresses {
            *address_counts.entry(addr).or_insert(0) += 1;
        }

        let repeated = address_counts.values().filter(|&&count| count > 1).count();
        let total_unique = address_counts.len();

        if total_unique == 0 {
            0.0
        } else {
            (repeated as f64 / total_unique as f64).min(1.0)
        }
    }

    /// Analyze coalescing potential
    fn analyze_coalescing_potential(&self, pattern: &AccessPattern) -> f64 {
        if pattern.addresses.is_empty() {
            return 0.0;
        }

        // Check alignment and sequentiality
        let mut coalesced_groups = 0;
        let mut i = 0;

        while i < pattern.addresses.len() {
            let group_size = self.find_coalesced_group(&pattern.addresses[i..]);
            if group_size > 1 {
                coalesced_groups += 1;
            }
            i += group_size.max(1);
        }

        (coalesced_groups as f64 / pattern.addresses.len() as f64).min(1.0)
    }

    /// Find size of coalesced access group
    fn find_coalesced_group(&self, addresses: &[usize]) -> usize {
        if addresses.is_empty() {
            return 0;
        }

        let cache_line = addresses[0] / 128;
        let mut count = 0;

        for &addr in addresses {
            if addr / 128 == cache_line {
                count += 1;
            } else {
                break;
            }
        }

        count
    }

    /// Generate optimization recommendations
    fn generate_recommendations(
        &self,
        spatial: f64,
        temporal: f64,
        coalescing: f64,
    ) -> Vec<String> {
        let mut recommendations = Vec::new();

        if spatial < 0.5 {
            recommendations.push(
                "Low spatial locality: Consider using shared memory to cache frequently accessed data".to_string(),
            );
        }

        if temporal < 0.5 {
            recommendations.push(
                "Low temporal locality: Consider restructuring loops to improve cache reuse".to_string(),
            );
        }

        if coalescing < 0.5 {
            recommendations.push(
                "Low coalescing: Ensure memory accesses are aligned and sequential within warps".to_string(),
            );
        }

        if spatial > 0.7 && temporal > 0.7 && coalescing > 0.7 {
            recommendations.push(
                "Excellent memory access pattern! No major optimizations needed.".to_string(),
            );
        }

        recommendations
    }
}

/// Memory access pattern for analysis
#[derive(Clone, Debug)]
pub struct AccessPattern {
    /// Sequence of addresses accessed
    pub addresses: Vec<usize>,

    /// Access sizes
    pub sizes: Vec<usize>,

    /// Thread IDs
    pub thread_ids: Vec<usize>,
}

/// Memory efficiency prediction
#[derive(Clone, Debug)]
pub struct EfficiencyPrediction {
    /// Overall efficiency score (0-1)
    pub overall: f64,

    /// Spatial locality score (0-1)
    pub spatial_locality: f64,

    /// Temporal locality score (0-1)
    pub temporal_locality: f64,

    /// Coalescing potential score (0-1)
    pub coalescing_potential: f64,

    /// Predicted bandwidth utilization (0-1)
    pub predicted_bandwidth_utilization: f64,

    /// Optimization recommendations
    pub recommended_optimizations: Vec<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_memory_type_latencies() {
        assert!(MemoryType::Global.latency_ns() > MemoryType::L2.latency_ns());
        assert!(MemoryType::L2.latency_ns() > MemoryType::Register.latency_ns());
    }

    #[test]
    fn test_coalescing() {
        let access1 = MemoryAccess {
            mem_type: MemoryType::Global,
            address: 0,
            size: 4,
            thread_id: 0,
            is_write: false,
            timestamp: Duration::ZERO,
        };

        let access2 = MemoryAccess {
            mem_type: MemoryType::Global,
            address: 4, // Same cache line
            size: 4,
            thread_id: 1,
            is_write: false,
            timestamp: Duration::ZERO,
        };

        assert!(access1.can_coalesce_with(&access2));
    }

    #[test]
    fn test_memory_access() {
        let mut memory = MemoryHierarchy::new(1024 * 1024 * 1024, 48 * 1024, 64 * 1024);

        let accesses = vec![
            MemoryAccess {
                mem_type: MemoryType::Global,
                address: 0,
                size: 4,
                thread_id: 0,
                is_write: false,
                timestamp: Duration::ZERO,
            },
            MemoryAccess {
                mem_type: MemoryType::Global,
                address: 4,
                size: 4,
                thread_id: 1,
                is_write: false,
                timestamp: Duration::ZERO,
            },
        ];

        let time = memory.access(accesses);
        assert!(time > Duration::ZERO);
    }

    #[test]
    fn test_efficiency_prediction() {
        let memory = MemoryHierarchy::new(1024 * 1024 * 1024, 48 * 1024, 64 * 1024);

        // Sequential access pattern (good coalescing)
        let pattern = AccessPattern {
            addresses: (0..32).map(|i| i * 4).collect(),
            sizes: vec![4; 32],
            thread_ids: (0..32).collect(),
        };

        let prediction = memory.predict_efficiency(&pattern);
        assert!(prediction.overall > 0.5);
    }
}
