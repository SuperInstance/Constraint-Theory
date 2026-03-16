#!/usr/bin/env python3
"""
Visualization Tools for Constraint Theory Validation
====================================================

Comprehensive visualization suite for:
- Performance scaling analysis
- Distribution visualization
- Statistical comparison plots
- Convergence diagnostics
- Interactive dashboards

Author: SuperInstance Research Team
Date: 2025-03-16
"""

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import seaborn as sns
from scipy import stats
from typing import List, Dict, Tuple, Optional
import pandas as pd
from dataclasses import dataclass

# Set style
sns.set_style('whitegrid')
plt.rcParams['figure.figsize'] = (12, 8)
plt.rcParams['font.size'] = 10

# ============================================================================
# PLOTTING FUNCTIONS
# ============================================================================

class ConstraintTheoryVisualizer:
    """
    Comprehensive visualization for Constraint Theory validation.
    """

    def __init__(self, results_dir: str = 'results'):
        self.results_dir = results_dir
        self.colors = {
            'primary': '#1f77b4',
            'success': '#2ca02c',
            'warning': '#ff7f0e',
            'danger': '#d62728',
            'info': '#17becf'
        }

    def plot_performance_scaling(self,
                                 scaling_data: Dict,
                                 component_name: str,
                                 save_path: Optional[str] = None):
        """
        Plot performance scaling with log-log axes and power law fit.

        Args:
            scaling_data: Dict with 'sizes', 'times', 'exponent'
            component_name: Name of component being tested
            save_path: Optional path to save figure
        """
        sizes = np.array(scaling_data['sizes'])
        times = np.array(scaling_data['times'])
        exponent = scaling_data.get('exponent', 1.0)

        fig, ax = plt.subplots(figsize=(10, 6))

        # Plot measured data
        ax.loglog(sizes, times, 'o-', label='Measured',
                 color=self.colors['primary'], linewidth=2, markersize=8)

        # Plot power law fit
        fit_range = np.logspace(np.log10(sizes.min()), np.log10(sizes.max()), 100)
        # time = a * n^exponent
        # Find 'a' using first data point
        a = times[0] / (sizes[0] ** exponent)
        fit_times = a * fit_range ** exponent

        ax.loglog(fit_range, fit_times, '--',
                 label=f'O(n^{exponent:.2f})',
                 color=self.colors['success'], linewidth=2)

        # Formatting
        ax.set_xlabel('Input Size (n)', fontsize=12)
        ax.set_ylabel('Time (seconds)', fontsize=12)
        ax.set_title(f'{component_name} Performance Scaling', fontsize=14)
        ax.legend(fontsize=11)
        ax.grid(True, alpha=0.3, which='both')

        # Add throughput annotation
        throughputs = sizes / times
        max_throughput_idx = np.argmax(throughputs)
        max_throughput = throughputs[max_throughput_idx]
        ax.annotate(f'Max throughput: {max_throughput:.0f} ops/s',
                   xy=(sizes[max_throughput_idx], times[max_throughput_idx]),
                   xytext=(10, 10), textcoords='offset points',
                   bbox=dict(boxstyle='round,pad=0.5', fc='yellow', alpha=0.7),
                   arrowprops=dict(arrowstyle='->', connectionstyle='arc3,rad=0'))

        plt.tight_layout()

        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        plt.show()

    def plot_distribution_comparison(self,
                                    data1: np.ndarray,
                                    data2: np.ndarray,
                                    label1: str = 'Distribution 1',
                                    label2: str = 'Distribution 2',
                                    save_path: Optional[str] = None):
        """
        Compare two distributions with multiple visualizations.

        Args:
            data1: First dataset
            data2: Second dataset
            label1: Label for first dataset
            label2: Label for second dataset
            save_path: Optional path to save figure
        """
        fig = plt.figure(figsize=(14, 10))
        gs = gridspec.GridSpec(2, 2, hspace=0.3, wspace=0.3)

        # 1. Histogram with KDE
        ax1 = fig.add_subplot(gs[0, 0])
        ax1.hist(data1, bins=50, alpha=0.5, label=label1,
                color=self.colors['primary'], density=True)
        ax1.hist(data2, bins=50, alpha=0.5, label=label2,
                color=self.colors['success'], density=True)

        # Add KDE
        from scipy.stats import gaussian_kde
        kde1 = gaussian_kde(data1)
        kde2 = gaussian_kde(data2)
        x_range = np.linspace(min(data1.min(), data2.min()),
                             max(data1.max(), data2.max()), 200)
        ax1.plot(x_range, kde1(x_range), color=self.colors['primary'], linewidth=2)
        ax1.plot(x_range, kde2(x_range), color=self.colors['success'], linewidth=2)

        ax1.set_xlabel('Value')
        ax1.set_ylabel('Density')
        ax1.set_title('Distribution Comparison')
        ax1.legend()

        # 2. Q-Q plot
        ax2 = fig.add_subplot(gs[0, 1])
        stats.probplot(data1, dist='norm', plot=ax2)
        ax2.set_title(f'Q-Q Plot: {label1}')

        # 3. Box plot
        ax3 = fig.add_subplot(gs[1, 0])
        bp = ax3.boxplot([data1, data2], labels=[label1, label2],
                        patch_artist=True)
        bp['boxes'][0].set_facecolor(self.colors['primary'])
        bp['boxes'][1].set_facecolor(self.colors['success'])
        ax3.set_ylabel('Value')
        ax3.set_title('Box Plot Comparison')

        # 4. ECDF
        ax4 = fig.add_subplot(gs[1, 1])
        sorted1 = np.sort(data1)
        sorted2 = np.sort(data2)
        ecdf1 = np.arange(1, len(sorted1) + 1) / len(sorted1)
        ecdf2 = np.arange(1, len(sorted2) + 1) / len(sorted2)

        ax4.plot(sorted1, ecdf1, label=label1,
                color=self.colors['primary'], linewidth=2)
        ax4.plot(sorted2, ecdf2, label=label2,
                color=self.colors['success'], linewidth=2)
        ax4.set_xlabel('Value')
        ax4.set_ylabel('ECDF')
        ax4.set_title('Empirical Cumulative Distribution')
        ax4.legend()

        # Statistical test
        ks_stat, ks_p = stats.ks_2samp(data1, data2)

        fig.suptitle(f'Distribution Comparison\nKS Test: p-value = {ks_p:.6f}',
                    fontsize=14, fontweight='bold')

        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        plt.show()

    def plot_convergence_diagnostics(self,
                                   convergence_data: List[Dict],
                                   save_path: Optional[str] = None):
        """
        Plot convergence diagnostics for iterative algorithms.

        Args:
            convergence_data: List of dicts with 'iteration', 'value', 'metric'
            save_path: Optional path to save figure
        """
        fig, axes = plt.subplots(2, 2, figsize=(12, 10))
        fig.suptitle('Convergence Diagnostics', fontsize=14, fontweight='bold')

        # Extract data
        iterations = [d['iteration'] for d in convergence_data]
        values = [d['value'] for d in convergence_data]
        metrics = [d.get('metric', 0) for d in convergence_data]

        # 1. Value convergence
        ax1 = axes[0, 0]
        ax1.plot(iterations, values, 'o-',
                color=self.colors['primary'], markersize=4)
        ax1.set_xlabel('Iteration')
        ax1.set_ylabel('Value')
        ax1.set_title('Value Convergence')
        ax1.grid(True, alpha=0.3)

        # 2. Log-scale convergence
        ax2 = axes[0, 1]
        if any(v > 0 for v in values):
            ax2.semilogy(iterations, np.abs(values), 'o-',
                        color=self.colors['success'], markersize=4)
            ax2.set_xlabel('Iteration')
            ax2.set_ylabel('|Value| (log scale)')
            ax2.set_title('Log-Scale Convergence')
            ax2.grid(True, alpha=0.3, which='both')

        # 3. Rate of change
        ax3 = axes[1, 0]
        if len(values) > 1:
            changes = np.abs(np.diff(values))
            ax3.plot(iterations[1:], changes, 'o-',
                    color=self.colors['warning'], markersize=4)
            ax3.set_xlabel('Iteration')
            ax3.set_ylabel('|ΔValue|')
            ax3.set_title('Rate of Change')
            ax3.grid(True, alpha=0.3)
            ax3.set_yscale('log')

        # 4. Metric evolution
        ax4 = axes[1, 1]
        if any(m > 0 for m in metrics):
            ax4.plot(iterations, metrics, 'o-',
                    color=self.colors['info'], markersize=4)
            ax4.set_xlabel('Iteration')
            ax4.set_ylabel('Metric')
            ax4.set_title('Auxiliary Metric')
            ax4.grid(True, alpha=0.3)

        plt.tight_layout()

        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        plt.show()

    def plot_confidence_intervals(self,
                                 data: Dict[str, np.ndarray],
                                 confidence_level: float = 0.95,
                                 save_path: Optional[str] = None):
        """
        Plot confidence intervals for multiple datasets.

        Args:
            data: Dict mapping labels to data arrays
            confidence_level: Confidence level (0.95 or 0.99)
            save_path: Optional path to save figure
        """
        fig, ax = plt.subplots(figsize=(10, 6))

        x_positions = np.arange(len(data))
        means = []
        errors = []

        for label, values in data.items():
            mean = np.mean(values)
            std = np.std(values, ddof=1)
            se = std / np.sqrt(len(values))

            # Confidence interval
            z = stats.norm.ppf(1 - (1 - confidence_level) / 2)
            ci = z * se

            means.append(mean)
            errors.append(ci)

        # Plot with error bars
        ax.bar(x_positions, means, yerr=errors,
              capsize=5, alpha=0.7,
              color=[self.colors['primary'], self.colors['success'],
                     self.colors['warning'], self.colors['info']][:len(data)])

        ax.set_xticks(x_positions)
        ax.set_xticklabels(data.keys(), rotation=45, ha='right')
        ax.set_ylabel('Mean ± CI')
        ax.set_title(f'{confidence_level*100:.0f}% Confidence Intervals')
        ax.grid(True, alpha=0.3, axis='y')

        plt.tight_layout()

        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        plt.show()

    def plot_scalability_comparison(self,
                                   results: Dict[str, Dict],
                                   save_path: Optional[str] = None):
        """
        Compare scalability across multiple implementations.

        Args:
            results: Dict mapping implementation names to scaling results
            save_path: Optional path to save figure
        """
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))

        # Plot 1: Time vs Size
        for name, data in results.items():
            sizes = np.array(data['sizes'])
            times = np.array(data['times'])

            ax1.loglog(sizes, times, 'o-', label=name,
                      linewidth=2, markersize=6)

        ax1.set_xlabel('Input Size')
        ax1.set_ylabel('Time (seconds)')
        ax1.set_title('Performance Scaling')
        ax1.legend()
        ax1.grid(True, alpha=0.3, which='both')

        # Plot 2: Throughput comparison
        for name, data in results.items():
            sizes = np.array(data['sizes'])
            times = np.array(data['times'])
            throughputs = sizes / times

            ax2.loglog(sizes, throughputs, 'o-', label=name,
                      linewidth=2, markersize=6)

        ax2.set_xlabel('Input Size')
        ax2.set_ylabel('Throughput (ops/sec)')
        ax2.set_title('Throughput Comparison')
        ax2.legend()
        ax2.grid(True, alpha=0.3, which='both')

        plt.tight_layout()

        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        plt.show()

    def plot_latency_distribution(self,
                                  latencies_ms: np.ndarray,
                                  save_path: Optional[str] = None):
        """
        Plot latency distribution with percentiles.

        Args:
            latencies_ms: Latency values in milliseconds
            save_path: Optional path to save figure
        """
        fig, axes = plt.subplots(1, 2, figsize=(14, 6))

        # Histogram with percentiles
        ax1 = axes[0]
        ax1.hist(latencies_ms, bins=50, color=self.colors['primary'],
                alpha=0.7, edgecolor='black')

        # Add percentile lines
        percentiles = [50, 90, 95, 99, 99.9]
        colors = ['green', 'yellow', 'orange', 'red', 'darkred']

        for p, color in zip(percentiles, colors):
            value = np.percentile(latencies_ms, p)
            ax1.axvline(value, color=color, linestyle='--',
                       linewidth=2, label=f'P{p}: {value:.4f}ms')

        ax1.set_xlabel('Latency (ms)')
        ax1.set_ylabel('Frequency')
        ax1.set_title('Latency Distribution')
        ax1.legend()
        ax1.grid(True, alpha=0.3)

        # ECDF
        ax2 = axes[1]
        sorted_latencies = np.sort(latencies_ms)
        ecdf = np.arange(1, len(sorted_latencies) + 1) / len(sorted_latencies)

        ax2.plot(sorted_latencies, ecdf,
                color=self.colors['primary'], linewidth=2)

        # Add percentile markers
        for p, color in zip(percentiles, colors):
            value = np.percentile(latencies_ms, p)
            ax2.plot(value, p/100, 'o', color=color, markersize=8)
            ax2.annotate(f'P{p}', xy=(value, p/100),
                        xytext=(5, 5), textcoords='offset points')

        ax2.set_xlabel('Latency (ms)')
        ax2.set_ylabel('ECDF')
        ax2.set_title('Latency ECDF')
        ax2.grid(True, alpha=0.3)

        # Statistics
        stats_text = f"""
        Statistics:
        Mean: {np.mean(latencies_ms):.4f}ms
        Median: {np.median(latencies_ms):.4f}ms
        Std: {np.std(latencies_ms):.4f}ms
        Min: {np.min(latencies_ms):.4f}ms
        Max: {np.max(latencies_ms):.4f}ms
        """

        fig.text(0.5, 0.02, stats_text, ha='center',
                bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5),
                fontsize=10, family='monospace')

        plt.tight_layout()

        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        plt.show()

    def plot_correlation_matrix(self,
                               df: pd.DataFrame,
                               save_path: Optional[str] = None):
        """
        Plot correlation matrix heatmap.

        Args:
            df: DataFrame with numerical columns
            save_path: Optional path to save figure
        """
        # Compute correlation matrix
        corr = df.corr()

        # Create heatmap
        fig, ax = plt.subplots(figsize=(10, 8))

        sns.heatmap(corr, annot=True, fmt='.2f',
                   cmap='coolwarm', center=0,
                   square=True, linewidths=1,
                   cbar_kws={'label': 'Correlation'},
                   ax=ax)

        ax.set_title('Correlation Matrix', fontsize=14, fontweight='bold')

        plt.tight_layout()

        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        plt.show()

    def plot_3d_manifold(self,
                        manifold_points: np.ndarray,
                        snapped_points: np.ndarray,
                        save_path: Optional[str] = None):
        """
        Plot 3D manifold visualization.

        Args:
            manifold_points: Original points
            snapped_points: Snapped points on manifold
            save_path: Optional path to save figure
        """
        from mpl_toolkits.mplot3d import Axes3D

        fig = plt.figure(figsize=(12, 8))
        ax = fig.add_subplot(111, projection='3d')

        # Plot original points
        ax.scatter(manifold_points[:, 0], manifold_points[:, 1], manifold_points[:, 2],
                  c='blue', alpha=0.3, s=10, label='Original')

        # Plot snapped points
        ax.scatter(snapped_points[:, 0], snapped_points[:, 1], snapped_points[:, 2],
                  c='red', alpha=0.8, s=20, label='Snapped')

        # Plot lines between them
        for i in range(min(len(manifold_points), 100)):  # Limit for clarity
            ax.plot([manifold_points[i, 0], snapped_points[i, 0]],
                   [manifold_points[i, 1], snapped_points[i, 1]],
                   [manifold_points[i, 2], snapped_points[i, 2]],
                   'gray', alpha=0.2, linewidth=0.5)

        ax.set_xlabel('X')
        ax.set_ylabel('Y')
        ax.set_zlabel('Z')
        ax.set_title('Phi-Folding on Pythagorean Manifold')
        ax.legend()

        plt.tight_layout()

        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        plt.show()

    def generate_dashboard(self,
                          validation_results: Dict,
                          save_path: Optional[str] = None):
        """
        Generate comprehensive validation dashboard.

        Args:
            validation_results: Dict with all validation results
            save_path: Optional path to save figure
        """
        fig = plt.figure(figsize=(16, 12))
        gs = gridspec.GridSpec(3, 3, hspace=0.3, wspace=0.3)

        fig.suptitle('Constraint Theory Validation Dashboard',
                    fontsize=16, fontweight='bold')

        # 1. Performance summary
        ax1 = fig.add_subplot(gs[0, 0])
        components = list(validation_results.get('performance', {}).keys())
        times = [validation_results['performance'][c]['mean_time']
                for c in components]

        ax1.barh(components, times, color=self.colors['primary'])
        ax1.set_xlabel('Time (s)')
        ax1.set_title('Performance Summary')

        # 2. Accuracy tests
        ax2 = fig.add_subplot(gs[0, 1])
        accuracy_tests = validation_results.get('accuracy', {})
        test_names = list(accuracy_tests.keys())
        passed = [1 if accuracy_tests[t]['passed'] else 0
                 for t in test_names]

        colors_acc = [self.colors['success'] if p else self.colors['danger']
                     for p in passed]
        ax2.bar(test_names, passed, color=colors_acc)
        ax2.set_ylim(-0.1, 1.1)
        ax2.set_ylabel('Passed')
        ax2.set_title('Accuracy Tests')
        plt.setp(ax2.get_xticklabels(), rotation=45, ha='right')

        # 3. Stress test results
        ax3 = fig.add_subplot(gs[0, 2])
        stress_results = validation_results.get('stress', {})
        if stress_results:
            scales = list(stress_results.keys())
            throughputs = [stress_results[s]['throughput'] for s in scales]

            ax3.plot(scales, throughputs, 'o-',
                    color=self.colors['success'], linewidth=2, markersize=8)
            ax3.set_xlabel('Scale')
            ax3.set_ylabel('Throughput (ops/s)')
            ax3.set_title('Stress Test Throughput')
            ax3.grid(True, alpha=0.3)

        # 4. Distribution test
        ax4 = fig.add_subplot(gs[1, :2])
        if 'snapping_noise' in validation_results:
            noise_data = validation_results['snapping_noise']['values']
            ax4.hist(noise_data, bins=50, color=self.colors['primary'],
                    alpha=0.7, edgecolor='black', density=True)

            # Add expected distribution
            from scipy.stats import norm
            mu, std = norm.fit(noise_data)
            xmin, xmax = ax4.get_xlim()
            x = np.linspace(xmin, xmax, 100)
            p = norm.pdf(x, mu, std)
            ax4.plot(x, p, 'r-', linewidth=2,
                    label=f'Fit: μ={mu:.4f}, σ={std:.4f}')

            ax4.set_xlabel('Noise')
            ax4.set_ylabel('Density')
            ax4.set_title('Snapping Noise Distribution')
            ax4.legend()

        # 5. Convergence plot
        ax5 = fig.add_subplot(gs[1, 2])
        if 'convergence' in validation_results:
            conv_data = validation_results['convergence']
            iterations = conv_data['iterations']
            values = conv_data['values']

            ax5.plot(iterations, values, 'o-',
                    color=self.colors['info'], markersize=4)
            ax5.set_xlabel('Iteration')
            ax5.set_ylabel('Value')
            ax5.set_title('Convergence')
            ax5.grid(True, alpha=0.3)

        # 6. Scaling comparison
        ax6 = fig.add_subplot(gs[2, :])
        if 'scaling' in validation_results:
            scaling_data = validation_results['scaling']

            for component, data in scaling_data.items():
                sizes = np.array(data['sizes'])
                times = np.array(data['times'])

                ax6.loglog(sizes, times, 'o-', label=component,
                          linewidth=2, markersize=6)

            ax6.set_xlabel('Input Size')
            ax6.set_ylabel('Time (s)')
            ax6.set_title('Scaling Comparison')
            ax6.legend()
            ax6.grid(True, alpha=0.3, which='both')

        # Add summary statistics
        stats_text = f"""
        Validation Summary:
        Total Tests: {validation_results.get('total_tests', 'N/A')}
        Passed: {validation_results.get('passed_tests', 'N/A')}
        Failed: {validation_results.get('failed_tests', 'N/A')}
        Success Rate: {validation_results.get('success_rate', 'N/A')}
        """

        fig.text(0.5, 0.01, stats_text, ha='center',
                bbox=dict(boxstyle='round', facecolor='lightblue', alpha=0.8),
                fontsize=11, family='monospace')

        plt.tight_layout()

        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        plt.show()

# ============================================================================
# INTERACTIVE DASHBOARD
# ============================================================================

def create_interactive_dashboard(results: Dict):
    """
    Create interactive Plotly dashboard.

    Args:
        results: Validation results dictionary

    Returns:
        Plotly HTML string
    """
    try:
        import plotly.graph_objects as go
        from plotly.subplots import make_subplots
    except ImportError:
        print("Plotly not installed. Install with: pip install plotly")
        return None

    # Create subplots
    fig = make_subplots(
        rows=2, cols=2,
        subplot_titles=('Performance', 'Accuracy', 'Stress Tests', 'Distributions'),
        specs=[[{'type': 'bar'}, {'type': 'indicator'}],
               [{'type': 'scatter'}, {'type': 'histogram'}]]
    )

    # Performance
    if 'performance' in results:
        components = list(results['performance'].keys())
        times = [results['performance'][c]['mean_time'] for c in components]

        fig.add_trace(
            go.Bar(x=components, y=times, name='Performance'),
            row=1, col=1
        )

    # Accuracy indicator
    if 'accuracy' in results:
        passed = sum(1 for t in results['accuracy'].values() if t['passed'])
        total = len(results['accuracy'])
        success_rate = passed / total if total > 0 else 0

        fig.add_trace(
            go.Indicator(
                mode='gauge+number',
                value=success_rate * 100,
                title={'text': 'Success Rate (%)'},
                gauge={'axis': {'range': [0, 100]},
                      'bar': {'color': 'darkgreen'},
                      'steps': [
                          {'range': [0, 50], 'color': 'lightgray'},
                          {'range': [50, 80], 'color': 'gray'}],
                      'threshold': {
                          'line': {'color': 'red', 'width': 4},
                          'thickness': 0.75,
                          'value': 80}}
            ),
            row=1, col=2
        )

    # Stress tests
    if 'stress' in results:
        for component, data in results['stress'].items():
            sizes = data.get('sizes', [])
            throughputs = data.get('throughputs', [])

            fig.add_trace(
                go.Scatter(x=sizes, y=throughputs,
                          mode='lines+markers', name=component),
                row=2, col=1
            )

    # Distributions
    if 'snapping_noise' in results:
        noise_data = results['snapping_noise']['values']

        fig.add_trace(
            go.Histogram(x=noise_data, name='Noise Distribution'),
            row=2, col=2
        )

    fig.update_layout(
        title_text='Constraint Theory Validation Dashboard',
        showlegend=True,
        height=800
    )

    return fig.to_html()

# ============================================================================
# REPORT GENERATION
# ============================================================================

def generate_validation_report(results: Dict,
                              output_path: str = 'validation_report.html'):
    """
    Generate comprehensive HTML validation report.

    Args:
        results: Validation results dictionary
        output_path: Path to save HTML report
    """
    html_template = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Constraint Theory Validation Report</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                margin: 20px;
                background-color: #f5f5f5;
            }}
            .container {{
                max-width: 1200px;
                margin: 0 auto;
                background-color: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }}
            h1 {{
                color: #333;
                border-bottom: 3px solid #4CAF50;
                padding-bottom: 10px;
            }}
            h2 {{
                color: #666;
                margin-top: 30px;
            }}
            .summary {{
                display: flex;
                justify-content: space-around;
                margin: 20px 0;
            }}
            .metric {{
                text-align: center;
                padding: 20px;
                background-color: #f9f9f9;
                border-radius: 5px;
                flex: 1;
                margin: 0 10px;
            }}
            .metric-value {{
                font-size: 2em;
                font-weight: bold;
                color: #4CAF50;
            }}
            .metric-label {{
                color: #666;
                font-size: 0.9em;
            }}
            .test-result {{
                margin: 10px 0;
                padding: 10px;
                border-radius: 5px;
            }}
            .pass {{
                background-color: #d4edda;
                color: #155724;
            }}
            .fail {{
                background-color: #f8d7da;
                color: #721c24;
            }}
            table {{
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
            }}
            th, td {{
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
            }}
            th {{
                background-color: #4CAF50;
                color: white;
            }}
            tr:nth-child(even) {{
                background-color: #f9f9f9;
            }}
            .chart {{
                margin: 20px 0;
                text-align: center;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Constraint Theory Validation Report</h1>
            <p>Generated: {timestamp}</p>

            <div class="summary">
                <div class="metric">
                    <div class="metric-value">{total_tests}</div>
                    <div class="metric-label">Total Tests</div>
                </div>
                <div class="metric">
                    <div class="metric-value">{passed_tests}</div>
                    <div class="metric-label">Passed</div>
                </div>
                <div class="metric">
                    <div class="metric-value">{failed_tests}</div>
                    <div class="metric-label">Failed</div>
                </div>
                <div class="metric">
                    <div class="metric-value">{success_rate:.1f}%</div>
                    <div class="metric-label">Success Rate</div>
                </div>
            </div>

            <h2>Test Results</h2>
            {test_results_table}

            <h2>Performance Summary</h2>
            {performance_table}

            <h2>Stress Test Results</h2>
            {stress_test_table}

            <h2>Recommendations</h2>
            <ul>
                {recommendations}
            </ul>
        </div>
    </body>
    </html>
    """

    from datetime import datetime

    # Calculate summary metrics
    total_tests = results.get('total_tests', 0)
    passed_tests = results.get('passed_tests', 0)
    failed_tests = results.get('failed_tests', 0)
    success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0

    # Generate test results table
    test_rows = []
    for test_name, test_result in results.get('tests', {}).items():
        status = 'pass' if test_result.get('passed', False) else 'fail'
        row = f"""
        <tr class="{status}">
            <td>{test_name}</td>
            <td>{status.upper()}</td>
            <td>{test_result.get('value', 'N/A')}</td>
            <td>{test_result.get('target', 'N/A')}</td>
        </tr>
        """
        test_rows.append(row)

    test_results_table = f"""
    <table>
        <thead>
            <tr>
                <th>Test Name</th>
                <th>Status</th>
                <th>Value</th>
                <th>Target</th>
            </tr>
        </thead>
        <tbody>
            {''.join(test_rows)}
        </tbody>
    </table>
    """

    # Generate performance table
    perf_rows = []
    for component, perf_data in results.get('performance', {}).items():
        row = f"""
        <tr>
            <td>{component}</td>
            <td>{perf_data.get('mean_time', 'N/A'):.4f}</td>
            <td>{perf_data.get('throughput', 'N/A'):.0f}</td>
            <td>{perf_data.get('complexity', 'N/A')}</td>
        </tr>
        """
        perf_rows.append(row)

    performance_table = f"""
    <table>
        <thead>
            <tr>
                <th>Component</th>
                <th>Mean Time (s)</th>
                <th>Throughput (ops/s)</th>
                <th>Complexity</th>
            </tr>
        </thead>
        <tbody>
            {''.join(perf_rows)}
        </tbody>
    </table>
    """

    # Generate stress test table
    stress_rows = []
    for test_name, stress_data in results.get('stress', {}).items():
        row = f"""
        <tr>
            <td>{test_name}</td>
            <td>{stress_data.get('scale', 'N/A')}</td>
            <td>{stress_data.get('throughput', 'N/A'):.0f}</td>
            <td>{stress_data.get('p99_latency', 'N/A'):.4f}</td>
        </tr>
        """
        stress_rows.append(row)

    stress_test_table = f"""
    <table>
        <thead>
            <tr>
                <th>Test</th>
                <th>Scale</th>
                <th>Throughput</th>
                <th>P99 Latency (ms)</th>
            </tr>
        </thead>
        <tbody>
            {''.join(stress_rows)}
        </tbody>
    </table>
    """

    # Generate recommendations
    recommendations = []
    if success_rate < 100:
        recommendations.append("<li>Review and fix failed tests</li>")
    if success_rate < 95:
        recommendations.append("<li>Consider updating baseline expectations</li>")
    if results.get('stress', {}).get('max_scale', 0) < 1000000:
        recommendations.append("<li>Increase stress test coverage to 1M+ items</li>")
    if not recommendations:
        recommendations.append("<li>All tests passing! Consider adding edge case coverage.</li>")

    # Fill template
    html = html_template.format(
        timestamp=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        total_tests=total_tests,
        passed_tests=passed_tests,
        failed_tests=failed_tests,
        success_rate=success_rate,
        test_results_table=test_results_table,
        performance_table=performance_table,
        stress_test_table=stress_test_table,
        recommendations=''.join(recommendations)
    )

    # Save to file
    with open(output_path, 'w') as f:
        f.write(html)

    print(f"Validation report saved to {output_path}")

# ============================================================================
# MAIN
# ============================================================================

def main():
    """Generate example visualizations"""
    print("\n" + "="*60)
    print("CONSTRAINT THEORY VISUALIZATION TOOLS")
    print("="*60)

    # Create visualizer
    viz = ConstraintTheoryVisualizer()

    # Example: Performance scaling
    print("\n[1/4] Generating performance scaling plot...")
    scaling_data = {
        'sizes': [100, 1000, 10000, 100000],
        'times': [0.01, 0.08, 0.85, 8.5],
        'exponent': 0.95
    }
    viz.plot_performance_scaling(scaling_data, 'Phi-Folding')

    # Example: Distribution comparison
    print("\n[2/4] Generating distribution comparison...")
    data1 = np.random.normal(0, 0.01, 1000)
    data2 = np.random.uniform(0, 1, 1000)
    viz.plot_distribution_comparison(data1, data2, 'Snapping Noise', 'Uniform')

    # Example: Latency distribution
    print("\n[3/4] Generating latency distribution...")
    latencies = np.random.lognormal(mean=-4, sigma=0.5, size=10000)
    viz.plot_latency_distribution(latencies)

    # Example: Dashboard
    print("\n[4/4] Generating validation dashboard...")
    example_results = {
        'total_tests': 50,
        'passed_tests': 48,
        'failed_tests': 2,
        'success_rate': 96.0,
        'tests': {
            'Snapping Accuracy': {'passed': True, 'value': 0.005, 'target': '< 0.01'},
            'Percolation Threshold': {'passed': True, 'value': 0.6603, 'target': '0.6603'},
            'Cohomology H0': {'passed': False, 'value': 2, 'target': 1}
        },
        'performance': {
            'Phi-Folding': {'mean_time': 0.85, 'throughput': 118000, 'complexity': 'O(n^0.95)'},
            'Percolation': {'mean_time': 0.3, 'throughput': 333000, 'complexity': 'O(n log n)'}
        },
        'stress': {
            'Snapping 1M': {'scale': '1M', 'throughput': 118000, 'p99_latency': 0.85}
        },
        'snapping_noise': {'values': data1},
        'convergence': {
            'iterations': list(range(100)),
            'values': np.exp(-np.arange(100) / 20)
        },
        'scaling': {
            'Phi-Folding': {'sizes': [100, 1000, 10000], 'times': [0.01, 0.08, 0.85]},
            'Percolation': {'sizes': [100, 1000, 10000], 'times': [0.005, 0.03, 0.3]}
        }
    }

    viz.generate_dashboard(example_results)
    generate_validation_report(example_results)

    print("\nVisualization complete!")
    print("\nGenerated files:")
    print("  - Performance scaling plots")
    print("  - Distribution comparison plots")
    print("  - Latency distribution plots")
    print("  - Validation dashboard")
    print("  - HTML validation report")

if __name__ == "__main__":
    main()
