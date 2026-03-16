//! Visualization and Reporting Module
//!
//! Provides tools for visualizing simulation results and generating
//! comprehensive reports.

use std::io::Write;
use serde::{Deserialize, Serialize};

use crate::benchmark::{BenchmarkReport, ComparisonTable};
use crate::prediction::{GPUProjection, GPUComparison};
use crate::kernel::KernelResult;

/// Visualization output format
#[derive(Clone, Copy, Debug)]
pub enum ReportFormat {
    /// Plain text
    Text,

    /// Markdown
    Markdown,

    /// JSON
    Json,

    /// HTML
    Html,
}

/// Report visualizer
pub struct Visualizer {
    format: ReportFormat,
}

impl Visualizer {
    /// Create a new visualizer
    pub fn new(format: ReportFormat) -> Self {
        Self { format }
    }

    /// Generate benchmark report
    pub fn benchmark_report(&self, report: &BenchmarkReport) -> String {
        match self.format {
            ReportFormat::Text => self.text_benchmark_report(report),
            ReportFormat::Markdown => self.markdown_benchmark_report(report),
            ReportFormat::Json => self.json_report(report),
            ReportFormat::Html => self.html_benchmark_report(report),
        }
    }

    /// Generate performance projection report
    pub fn projection_report(&self, projection: &GPUProjection) -> String {
        match self.format {
            ReportFormat::Text => self.text_projection_report(projection),
            ReportFormat::Markdown => self.markdown_projection_report(projection),
            ReportFormat::Json => self.json_projection(projection),
            ReportFormat::Html => self.html_projection_report(projection),
        }
    }

    /// Generate GPU comparison report
    pub fn gpu_comparison_report(&self, comparison: &GPUComparison) -> String {
        match self.format {
            ReportFormat::Text => comparison.format_table(),
            ReportFormat::Markdown => self.markdown_gpu_comparison(comparison),
            ReportFormat::Json => self.json_gpu_comparison(comparison),
            ReportFormat::Html => self.html_gpu_comparison(comparison),
        }
    }

    /// Generate comparison table
    pub fn comparison_table(&self, table: &ComparisonTable) -> String {
        match self.format {
            ReportFormat::Text => table.format(),
            ReportFormat::Markdown => self.markdown_comparison_table(table),
            ReportFormat::Json => self.json_comparison_table(table),
            ReportFormat::Html => self.html_comparison_table(table),
        }
    }

    /// Text format benchmark report
    fn text_benchmark_report(&self, report: &BenchmarkReport) -> String {
        let mut output = String::new();

        output.push_str(&format!("Benchmark Suite: {}\n", report.suite_name));
        output.push_str(&str::repeat("=", 80));
        output.push_str("\n\n");

        let table = ComparisonTable::from_report(report);
        output.push_str(&table.format());

        output
    }

    /// Markdown format benchmark report
    fn markdown_benchmark_report(&self, report: &BenchmarkReport) -> String {
        let mut output = String::new();

        output.push_str(&format!("# Benchmark Report: {}\n\n", report.suite_name));

        let table = ComparisonTable::from_report(report);
        output.push_str("## Results\n\n");
        output.push_str("| Benchmark | Avg (ms) | Min (ms) | StdDev (ms) | Throughput (GB/s) |\n");
        output.push_str("|-----------|----------|----------|-------------|-------------------|\n");

        for row in &table.rows {
            output.push_str(&format!(
                "| {} | {:.3} | {:.3} | {:.3} | {:.2} |\n",
                row.benchmark, row.avg_time_ms, row.min_time_ms, row.std_dev_ms, row.throughput_gb_s
            ));
        }

        output.push_str("\n## Performance Analysis\n\n");

        if let Some(fastest) = table.fastest() {
            output.push_str(&format!("**Fastest:** {} ({:.3} ms)\n\n", fastest.benchmark, fastest.avg_time_ms));
        }

        if let Some(slowest) = table.slowest() {
            output.push_str(&format!("**Slowest:** {} ({:.3} ms)\n\n", slowest.benchmark, slowest.avg_time_ms));
        }

        output
    }

    /// HTML format benchmark report
    fn html_benchmark_report(&self, report: &BenchmarkReport) -> String {
        let mut output = String::new();

        output.push_str("<!DOCTYPE html>\n");
        output.push_str("<html>\n");
        output.push_str("<head>\n");
        output.push_str("  <title>Benchmark Report</title>\n");
        output.push_str("  <style>\n");
        output.push_str("    body { font-family: Arial, sans-serif; margin: 20px; }\n");
        output.push_str("    h1 { color: #333; }\n");
        output.push_str("    table { border-collapse: collapse; width: 100%; }\n");
        output.push_str("    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }\n");
        output.push_str("    th { background-color: #4CAF50; color: white; }\n");
        output.push_str("    tr:nth-child(even) { background-color: #f2f2f2; }\n");
        output.push_str("    .fastest { background-color: #d4edda; }\n");
        output.push_str("    .slowest { background-color: #f8d7da; }\n");
        output.push_str("  </style>\n");
        output.push_str("</head>\n");
        output.push_str("<body>\n");

        output.push_str(&format!("  <h1>Benchmark Report: {}</h1>\n", report.suite_name));

        let table = ComparisonTable::from_report(report);

        output.push_str("  <h2>Results</h2>\n");
        output.push_str("  <table>\n");
        output.push_str("    <tr>\n");
        output.push_str("      <th>Benchmark</th>\n");
        output.push_str("      <th>Avg (ms)</th>\n");
        output.push_str("      <th>Min (ms)</th>\n");
        output.push_str("      <th>StdDev (ms)</th>\n");
        output.push_str("      <th>Throughput (GB/s)</th>\n");
        output.push_str("    </tr>\n");

        for (i, row) in table.rows.iter().enumerate() {
            let class = if i == 0 { "fastest" } else if i == table.rows.len() - 1 { "slowest" } else { "" };
            output.push_str(&format!("    <tr class=\"{}\">\n", class));
            output.push_str(&format!("      <td>{}</td>\n", row.benchmark));
            output.push_str(&format!("      <td>{:.3}</td>\n", row.avg_time_ms));
            output.push_str(&format!("      <td>{:.3}</td>\n", row.min_time_ms));
            output.push_str(&format!("      <td>{:.3}</td>\n", row.std_dev_ms));
            output.push_str(&format!("      <td>{:.2}</td>\n", row.throughput_gb_s));
            output.push_str("    </tr>\n");
        }

        output.push_str("  </table>\n");
        output.push_str("</body>\n");
        output.push_str("</html>\n");

        output
    }

    /// JSON report
    fn json_report(&self, report: &BenchmarkReport) -> String {
        serde_json::to_string_pretty(report).unwrap_or_else(|_| "{}".to_string())
    }

    /// Text format projection report
    fn text_projection_report(&self, projection: &GPUProjection) -> String {
        let mut output = String::new();

        output.push_str("Performance Projection\n");
        output.push_str(&str::repeat("=", 80));
        output.push_str("\n\n");

        output.push_str(&format!("Predicted Execution Time: {:.2} ms\n", projection.predicted_time.as_secs_f64() * 1000.0));
        output.push_str(&format!("Speedup over CPU: {:.1}x\n", projection.speedup_over_cpu));
        output.push_str(&format!("Confidence: {:.1}%\n", projection.confidence * 100.0));
        output.push_str("\n");

        output.push_str("Utilization:\n");
        output.push_str(&format!("  Bandwidth: {:.1}%\n", projection.bandwidth_utilization * 100.0));
        output.push_str(&format!("  Compute: {:.1}%\n", projection.compute_utilization * 100.0));
        output.push_str("\n");

        output.push_str("Performance Breakdown:\n");
        output.push_str(&format!("  Computation: {:.1}%\n", projection.breakdown.computation_pct));
        output.push_str(&format!("  Memory: {:.1}%\n", projection.breakdown.memory_pct));
        output.push_str(&format!("  Overhead: {:.1}%\n", projection.breakdown.overhead_pct));
        output.push_str("\n");

        output.push_str("Bottleneck Analysis:\n");
        match &projection.breakdown.bottleneck {
            crate::prediction::BottleneckAnalysis::ComputeBound { severity, reason } => {
                output.push_str(&format!("  Type: Compute Bound ({:.1}% severity)\n", severity * 100.0));
                output.push_str(&format!("  Reason: {}\n", reason));
            }
            crate::prediction::BottleneckAnalysis::MemoryBound { severity, reason } => {
                output.push_str(&format!("  Type: Memory Bound ({:.1}% severity)\n", severity * 100.0));
                output.push_str(&format!("  Reason: {}\n", reason));
            }
            crate::prediction::BottleneckAnalysis::LatencyBound { severity, reason } => {
                output.push_str(&format!("  Type: Latency Bound ({:.1}% severity)\n", severity * 100.0));
                output.push_str(&format!("  Reason: {}\n", reason));
            }
            crate::prediction::BottleneckAnalysis::Balanced { compute_fraction, memory_fraction } => {
                output.push_str("  Type: Balanced\n");
                output.push_str(&format!("  Compute: {:.1}%, Memory: {:.1}%\n", compute_fraction * 100.0, memory_fraction * 100.0));
            }
        }
        output.push_str("\n");

        if !projection.recommendations.is_empty() {
            output.push_str("Recommendations:\n");
            for (i, rec) in projection.recommendations.iter().enumerate() {
                output.push_str(&format!("  {}. {}\n", i + 1, rec));
            }
        }

        output
    }

    /// Markdown format projection report
    fn markdown_projection_report(&self, projection: &GPUProjection) -> String {
        let mut output = String::new();

        output.push_str("# Performance Projection\n\n");
        output.push_str(&format!("**Predicted Time:** {:.2} ms  \n", projection.predicted_time.as_secs_f64() * 1000.0));
        output.push_str(&format!("**Speedup:** {:.1}x over CPU  \n", projection.speedup_over_cpu));
        output.push_str(&format!("**Confidence:** {:.1}%\n\n", projection.confidence * 100.0));

        output.push_str("## Utilization\n\n");
        output.push_str(&format!("- **Bandwidth:** {:.1}%\n", projection.bandwidth_utilization * 100.0));
        output.push_str(&format!("- **Compute:** {:.1}%\n\n", projection.compute_utilization * 100.0));

        output.push_str("## Performance Breakdown\n\n");
        output.push_str(&format!("- Computation: {:.1}%\n", projection.breakdown.computation_pct));
        output.push_str(&format!("- Memory: {:.1}%\n", projection.breakdown.memory_pct));
        output.push_str(&format!("- Overhead: {:.1}%\n\n", projection.breakdown.overhead_pct));

        output.push_str("## Bottleneck Analysis\n\n");
        match &projection.breakdown.bottleneck {
            crate::prediction::BottleneckAnalysis::ComputeBound { severity, reason } => {
                output.push_str(&format!("**Compute Bound** ({:.1}% severity)\n\n", severity * 100.0));
                output.push_str(&format!("{}\n\n", reason));
            }
            crate::prediction::BottleneckAnalysis::MemoryBound { severity, reason } => {
                output.push_str(&format!("**Memory Bound** ({:.1}% severity)\n\n", severity * 100.0));
                output.push_str(&format!("{}\n\n", reason));
            }
            crate::prediction::BottleneckAnalysis::LatencyBound { severity, reason } => {
                output.push_str(&format!("**Latency Bound** ({:.1}% severity)\n\n", severity * 100.0));
                output.push_str(&format!("{}\n\n", reason));
            }
            crate::prediction::BottleneckAnalysis::Balanced { .. } => {
                output.push_str("**Balanced** - Good balance between compute and memory\n\n");
            }
        }

        if !projection.recommendations.is_empty() {
            output.push_str("## Recommendations\n\n");
            for rec in &projection.recommendations {
                output.push_str(&format!("- {}\n", rec));
            }
        }

        output
    }

    /// HTML format projection report
    fn html_projection_report(&self, projection: &GPUProjection) -> String {
        let mut output = String::new();

        output.push_str("<!DOCTYPE html>\n");
        output.push_str("<html>\n");
        output.push_str("<head>\n");
        output.push_str("  <title>Performance Projection</title>\n");
        output.push_str("  <style>\n");
        output.push_str("    body { font-family: Arial, sans-serif; margin: 20px; }\n");
        output.push_str("    .metric { margin: 10px 0; }\n");
        output.push_str("    .bar { height: 20px; background: #4CAF50; }\n");
        output.push_str("    .recommendation { background: #e7f3ff; padding: 10px; margin: 5px 0; }\n");
        output.push_str("  </style>\n");
        output.push_str("</head>\n");
        output.push_str("<body>\n");

        output.push_str(&format!("  <h1>Performance Projection</h1>\n"));

        output.push_str("  <div class=\"metric\">\n");
        output.push_str(&format!("    <strong>Predicted Time:</strong> {:.2} ms<br>\n", projection.predicted_time.as_secs_f64() * 1000.0));
        output.push_str(&format!("    <strong>Speedup:</strong> {:.1}x over CPU<br>\n", projection.speedup_over_cpu));
        output.push_str(&format!("    <strong>Confidence:</strong> {:.1}%\n", projection.confidence * 100.0));
        output.push_str("  </div>\n");

        output.push_str("  <h2>Utilization</h2>\n");
        output.push_str(&format!("  <p><strong>Bandwidth:</strong> {:.1}%</p>\n", projection.bandwidth_utilization * 100.0));
        output.push_str(&format!("  <div class=\"bar\" style=\"width: {:.1}%\"></div>\n", projection.bandwidth_utilization * 100.0));
        output.push_str(&format!("  <p><strong>Compute:</strong> {:.1}%</p>\n", projection.compute_utilization * 100.0));
        output.push_str(&format!("  <div class=\"bar\" style=\"width: {:.1}%\"></div>\n", projection.compute_utilization * 100.0));

        if !projection.recommendations.is_empty() {
            output.push_str("  <h2>Recommendations</h2>\n");
            for rec in &projection.recommendations {
                output.push_str(&format!("  <div class=\"recommendation\">{}</div>\n", rec));
            }
        }

        output.push_str("</body>\n");
        output.push_str("</html>\n");

        output
    }

    /// JSON projection
    fn json_projection(&self, projection: &GPUProjection) -> String {
        serde_json::to_string_pretty(projection).unwrap_or_else(|_| "{}".to_string())
    }

    /// Markdown comparison table
    fn markdown_comparison_table(&self, table: &ComparisonTable) -> String {
        let mut output = String::new();

        output.push_str("| Benchmark | Avg (ms) | Min (ms) | StdDev (ms) | Throughput (GB/s) |\n");
        output.push_str("|-----------|----------|----------|-------------|-------------------|\n");

        for row in &table.rows {
            output.push_str(&format!(
                "| {} | {:.3} | {:.3} | {:.3} | {:.2} |\n",
                row.benchmark, row.avg_time_ms, row.min_time_ms, row.std_dev_ms, row.throughput_gb_s
            ));
        }

        output
    }

    /// HTML comparison table
    fn html_comparison_table(&self, table: &ComparisonTable) -> String {
        let mut output = String::new();

        output.push_str("<table>\n");
        output.push_str("  <tr>\n");
        output.push_str("    <th>Benchmark</th>\n");
        output.push_str("    <th>Avg (ms)</th>\n");
        output.push_str("    <th>Min (ms)</th>\n");
        output.push_str("    <th>StdDev (ms)</th>\n");
        output.push_str("    <th>Throughput (GB/s)</th>\n");
        output.push_str("  </tr>\n");

        for row in &table.rows {
            output.push_str("  <tr>\n");
            output.push_str(&format!("    <td>{}</td>\n", row.benchmark));
            output.push_str(&format!("    <td>{:.3}</td>\n", row.avg_time_ms));
            output.push_str(&format!("    <td>{:.3}</td>\n", row.min_time_ms));
            output.push_str(&format!("    <td>{:.3}</td>\n", row.std_dev_ms));
            output.push_str(&format!("    <td>{:.2}</td>\n", row.throughput_gb_s));
            output.push_str("  </tr>\n");
        }

        output.push_str("</table>\n");

        output
    }

    /// JSON comparison table
    fn json_comparison_table(&self, table: &ComparisonTable) -> String {
        serde_json::to_string_pretty(table).unwrap_or_else(|_| "{}".to_string())
    }

    /// Markdown GPU comparison
    fn markdown_gpu_comparison(&self, comparison: &GPUComparison) -> String {
        let mut output = String::new();

        output.push_str("# GPU Performance Comparison\n\n");

        output.push_str(&format!("## {}\n", comparison.current_gpu));
        output.push_str(&format!("- Predicted Time: {:.2} ms\n", comparison.current_projection.predicted_time.as_secs_f64() * 1000.0));
        output.push_str(&format!("- Speedup over CPU: {:.1}x\n\n", comparison.current_projection.speedup_over_cpu));

        output.push_str("## NVIDIA A100\n");
        output.push_str(&format!("- Predicted Time: {:.2} ms\n", comparison.a100_projection.predicted_time.as_secs_f64() * 1000.0));
        output.push_str(&format!("- Speedup vs current: {:.1}x\n\n",
            comparison.current_projection.predicted_time.as_secs_f64() / comparison.a100_projection.predicted_time.as_secs_f64()));

        output.push_str("## NVIDIA H100\n");
        output.push_str(&format!("- Predicted Time: {:.2} ms\n", comparison.h100_projection.predicted_time.as_secs_f64() * 1000.0));
        output.push_str(&format!("- Speedup vs current: {:.1}x\n",
            comparison.current_projection.predicted_time.as_secs_f64() / comparison.h100_projection.predicted_time.as_secs_f64()));

        output
    }

    /// HTML GPU comparison
    fn html_gpu_comparison(&self, comparison: &GPUComparison) -> String {
        let mut output = String::new();

        output.push_str("<!DOCTYPE html>\n");
        output.push_str("<html>\n");
        output.push_str("<head>\n");
        output.push_str("  <title>GPU Comparison</title>\n");
        output.push_str("  <style>\n");
        output.push_str("    body { font-family: Arial, sans-serif; margin: 20px; }\n");
        output.push_str("    .gpu-section { margin: 20px 0; padding: 15px; background: #f5f5f5; }\n");
        output.push_str("  </style>\n");
        output.push_str("</head>\n");
        output.push_str("<body>\n");

        output.push_str("  <h1>GPU Performance Comparison</h1>\n");

        output.push_str(&format!("  <div class=\"gpu-section\">\n"));
        output.push_str(&format!("    <h2>{}</h2>\n", comparison.current_gpu));
        output.push_str(&format!("    <p>Predicted Time: {:.2} ms</p>\n", comparison.current_projection.predicted_time.as_secs_f64() * 1000.0));
        output.push_str(&format!("    <p>Speedup over CPU: {:.1}x</p>\n", comparison.current_projection.speedup_over_cpu));
        output.push_str("  </div>\n");

        output.push_str("  <div class=\"gpu-section\">\n");
        output.push_str("    <h2>NVIDIA A100</h2>\n");
        output.push_str(&format!("    <p>Predicted Time: {:.2} ms</p>\n", comparison.a100_projection.predicted_time.as_secs_f64() * 1000.0));
        output.push_str(&format!("    <p>Speedup vs current: {:.1}x</p>\n",
            comparison.current_projection.predicted_time.as_secs_f64() / comparison.a100_projection.predicted_time.as_secs_f64()));
        output.push_str("  </div>\n");

        output.push_str("  <div class=\"gpu-section\">\n");
        output.push_str("    <h2>NVIDIA H100</h2>\n");
        output.push_str(&format!("    <p>Predicted Time: {:.2} ms</p>\n", comparison.h100_projection.predicted_time.as_secs_f64() * 1000.0));
        output.push_str(&format!("    <p>Speedup vs current: {:.1}x</p>\n",
            comparison.current_projection.predicted_time.as_secs_f64() / comparison.h100_projection.predicted_time.as_secs_f64()));
        output.push_str("  </div>\n");

        output.push_str("</body>\n");
        output.push_str("</html>\n");

        output
    }

    /// JSON GPU comparison
    fn json_gpu_comparison(&self, comparison: &GPUComparison) -> String {
        serde_json::to_string_pretty(comparison).unwrap_or_else(|_| "{}".to_string())
    }

    /// Write report to file
    pub fn write_report(&self, content: &str, path: impl AsRef<std::path::Path>) -> Result<(), std::io::Error> {
        std::fs::write(path, content)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_text_visualization() {
        let viz = Visualizer::new(ReportFormat::Text);

        let report = BenchmarkReport {
            suite_name: "test".to_string(),
            benchmarks: vec!["bench1".to_string()],
            results: std::collections::HashMap::new(),
        };

        let output = viz.benchmark_report(&report);
        assert!(output.contains("Benchmark Suite"));
    }

    #[test]
    fn test_markdown_visualization() {
        let viz = Visualizer::new(ReportFormat::Markdown);

        let projection = GPUProjection {
            predicted_time: std::time::Duration::from_micros(1000),
            speedup_over_cpu: 100.0,
            bandwidth_utilization: 0.8,
            compute_utilization: 0.7,
            confidence: 0.9,
            breakdown: crate::prediction::PerformanceBreakdown {
                computation_pct: 60.0,
                memory_pct: 30.0,
                overhead_pct: 10.0,
                bottleneck: crate::prediction::BottleneckAnalysis::Balanced {
                    compute_fraction: 0.6,
                    memory_fraction: 0.3,
                },
            },
            recommendations: vec!["Test recommendation".to_string()],
        };

        let output = viz.projection_report(&projection);
        assert!(output.contains("# Performance Projection"));
        assert!(output.contains("Test recommendation"));
    }

    #[test]
    fn test_json_visualization() {
        let viz = Visualizer::new(ReportFormat::Json);

        let report = BenchmarkReport {
            suite_name: "test".to_string(),
            benchmarks: vec!["bench1".to_string()],
            results: std::collections::HashMap::new(),
        };

        let output = viz.benchmark_report(&report);
        assert!(output.starts_with('{'));
        assert!(output.contains("suite_name"));
    }
}
