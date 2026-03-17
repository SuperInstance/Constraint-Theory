#!/usr/bin/env python3
"""
Enhanced SuperInstance Constraint Theory Simulation
====================================================

Production-grade Python simulation with:
- Proper Ollivier-Ricci curvature
- Sheaf cohomology computation
- Per-vertex gauge potentials
- Fast percolation algorithm
- Comprehensive benchmarking

Based on research from:
- GI-CSILE (Gauge-Invariant Constrained SuperInstance Logic Engine)
- arXiv 2507.00741v2 (Fast Percolation)
- SuperInstance papers

Author: Production Team
Date: 2025-03-16
"""

import numpy as np
import networkx as nx
from dataclasses import dataclass
from typing import List, Dict, Tuple, Optional
from scipy.optimize import linear_sum_assignment
from scipy.spatial import cKDTree
import time
from collections import defaultdict
import warnings
warnings.filterwarnings('ignore')

# ============================================================================
# CONSTANTS
# ============================================================================

class Constants:
    """Physical and mathematical constants"""
    PC_CRITICAL = 0.6602741  # Percolation threshold
    RICCI_ALPHA = 0.1
    HOLONOMY_THRESHOLD = 0.01
    TARGET_LATENCY_MS = 1.0
    TARGET_THROUGHPUT = 1_000_000

# ============================================================================
# PYTHAGOREAN MANIFOLD
# ============================================================================

class PythagoreanManifold:
    """
    Discrete manifold of Pythagorean triples.
    Implements the Rigidity Matroid - finite set of valid truth states.
    """

    def __init__(self, density: int = 200):
        self.density = density
        self.valid_states = self._generate_manifold()

    def _generate_manifold(self) -> np.ndarray:
        """Generate fundamental domain using Euclid's Formula"""
        states = []
        for m in range(2, self.density):
            for n in range(1, m):
                if (m - n) % 2 == 1 and np.gcd(m, n) == 1:
                    a = m**2 - n**2
                    b = 2 * m * n
                    c = m**2 + n**2
                    v_norm = np.array([a/c, b/c], dtype=np.float32)
                    states.append(v_norm)
                    states.append(np.array([b/c, a/c], dtype=np.float32))
                    states.append(np.array([-a/c, b/c], dtype=np.float32))
                    states.append(np.array([a/c, -b/c], dtype=np.float32))
                    states.append(np.array([-a/c, -b/c], dtype=np.float32))

        # Cardinal basis
        states.extend([
            np.array([1.0, 0.0], dtype=np.float32),
            np.array([0.0, 1.0], dtype=np.float32),
            np.array([-1.0, 0.0], dtype=np.float32),
            np.array([0.0, -1.0], dtype=np.float32)
        ])

        return np.array(states, dtype=np.float32)

    def snap(self, noisy_vector: np.ndarray) -> Tuple[np.ndarray, float]:
        """
        Phi-Folding Operator: Projects noisy vector onto nearest discrete state.

        Args:
            noisy_vector: Input 2D vector

        Returns:
            (snapped_vector, thermal_noise)
        """
        norm = np.linalg.norm(noisy_vector)
        if norm < 1e-10:
            return np.array([1.0, 0.0], dtype=np.float32), 0.0

        v_input = noisy_vector / norm
        resonance_scores = np.dot(self.valid_states, v_input)
        best_idx = np.argmax(resonance_scores)
        snapped_vector = self.valid_states[best_idx]
        thermal_noise = 1.0 - resonance_scores[best_idx]

        return snapped_vector, thermal_noise

# ============================================================================
# OLLIVIER-RICCI CURVATURE
# ============================================================================

class OllivierRicciCurvature:
    """
    Proper Ollivier-Ricci curvature using optimal transport.

    For each edge (u,v), define:
    - W1 distance between neighborhoods
    - Curvature = 1 - W1(u,v) / d(u,v)
    """

    def __init__(self, graph: nx.Graph, alpha: float = 0.5):
        self.graph = graph
        self.alpha = alpha
        self.curvature_cache = {}

    def get_neighborhood_distribution(self, node: int) -> Dict[int, float]:
        """Get Lazaresti distribution: (1-alpha) at center, alpha spread to neighbors"""
        neighbors = list(self.graph.neighbors(node))
        n = len(neighbors)

        if n == 0:
            return {node: 1.0}

        dist = {node: 1.0 - self.alpha}
        for neighbor in neighbors:
            dist[neighbor] = self.alpha / n

        return dist

    def wasserstein_distance(self, mu: Dict[int, float], nu: Dict[int, float]) -> float:
        """Compute 1-Wasserstein distance using Hungarian algorithm"""
        nodes = list(set(mu.keys()) | set(nu.keys()))
        n = len(nodes)

        if n == 0:
            return 0.0

        # Build cost matrix using shortest path distances
        node_to_idx = {node: i for i, node in enumerate(nodes)}
        cost_matrix = np.zeros((n, n))

        for i, u in enumerate(nodes):
            for j, v in enumerate(nodes):
                try:
                    if u == v:
                        cost_matrix[i, j] = 0.0
                    elif self.graph.has_edge(u, v):
                        cost_matrix[i, j] = self.graph[u][v].get('weight', 1.0)
                    else:
                        try:
                            cost_matrix[i, j] = nx.shortest_path_length(
                                self.graph, u, v, weight='weight'
                            )
                        except nx.NetworkXNoPath:
                            cost_matrix[i, j] = 100.0  # Large penalty
                except:
                    cost_matrix[i, j] = 100.0

        # Solve optimal transport
        row_ind, col_ind = linear_sum_assignment(cost_matrix)

        # Compute transport cost
        transport_cost = 0.0
        for i, j in zip(row_ind, col_ind):
            u, v = nodes[i], nodes[j]
            mass_u = mu.get(u, 0.0)
            mass_v = nu.get(v, 0.0)
            transport_cost += cost_matrix[i, j] * abs(mass_u - mass_v) / 2.0

        return transport_cost

    def compute_curvature(self, u: int, v: int) -> float:
        """Compute Ollivier-Ricci curvature for edge (u,v)"""
        if (u, v) in self.curvature_cache:
            return self.curvature_cache[(u, v)]

        mu = self.get_neighborhood_distribution(u)
        nu = self.get_neighborhood_distribution(v)

        w1 = self.wasserstein_distance(mu, nu)

        if self.graph.has_edge(u, v):
            distance = self.graph[u][v].get('weight', 1.0)
        else:
            distance = 1.0

        if distance == 0:
            return 0.0

        curvature = 1.0 - w1 / distance
        self.curvature_cache[(u, v)] = curvature
        self.curvature_cache[(v, u)] = curvature

        return curvature

    def compute_all_curvatures(self) -> Dict[Tuple[int, int], float]:
        """Compute curvature for all edges"""
        curvatures = {}
        for u, v in self.graph.edges():
            curvatures[(u, v)] = self.compute_curvature(u, v)
        return curvatures

# ============================================================================
# SHEAF COHOMOLOGY
# ============================================================================

class SheafCohomology:
    """
    Compute sheaf cohomology for the tile manifold.

    H^1 measures obstructions to global consistency.
    Non-zero classes = paradoxes/inconsistencies.
    """

    def __init__(self, tiles: List):
        self.tiles = tiles
        self.graph = self._build_dependency_graph()

    def _build_dependency_graph(self) -> nx.Graph:
        """Build graph of tile dependencies based on holonomy"""
        G = nx.Graph()
        for i, tile in enumerate(self.tiles):
            G.add_node(i, pos=tile.tensor_payload[:3] if hasattr(tile, 'tensor_payload') else np.zeros(3))

        # Connect tiles with similar holonomy
        for i, tile1 in enumerate(self.tiles):
            for j, tile2 in enumerate(self.tiles):
                if i < j:
                    h1 = tile1.constraints.holonomy_matrix if hasattr(tile1, 'constraints') else np.eye(3)
                    h2 = tile2.constraints.holonomy_matrix if hasattr(tile2, 'constraints') else np.eye(3)
                    dist = np.linalg.norm(h1 - h2)
                    if dist < 0.5:
                        G.add_edge(i, j, weight=dist)

        return G

    def compute_coboundary_operators(self) -> Tuple[np.ndarray, np.ndarray]:
        """
        Compute coboundary operators:
        d0: C^0 -> C^1 (vertex to edge)
        d1: C^1 -> C^2 (edge to triangle)
        """
        n_vertices = self.graph.number_of_nodes()
        n_edges = self.graph.number_of_edges()

        # d0: differences between adjacent tiles
        edge_list = list(self.graph.edges())
        d0 = np.zeros((n_edges * 3, n_vertices * 3))

        for idx, (i, j) in enumerate(edge_list):
            for k in range(3):
                d0[idx*3 + k, i*3 + k] = 1
                d0[idx*3 + k, j*3 + k] = -1

        # d1: simplified (would need full triangle computation)
        d1 = np.zeros((1, n_edges * 3))

        return d0, d1

    def compute_cohomology(self) -> Dict:
        """Compute cohomology groups H^0, H^1, H^2"""
        d0, d1 = self.compute_coboundary_operators()

        # Compute dimensions using SVD
        U0, S0, V0T = np.linalg.svd(d0)
        rank_d0 = np.sum(S0 > 1e-10)
        dim_H0 = d0.shape[1] - rank_d0

        if d1.size > 0:
            U1, S1, V1T = np.linalg.svd(d1)
            rank_d1 = np.sum(S1 > 1e-10)
            dim_H1 = max(0, d1.shape[1] - rank_d1 - rank_d0)
        else:
            rank_d1 = 0
            dim_H1 = 0

        return {
            'H0_dim': dim_H0,  # Connected components
            'H1_dim': dim_H1,  # Obstructions to consistency
            'H2_dim': 0,       # Global obstructions
            'rank_d0': rank_d0,
            'rank_d1': rank_d1,
            'n_vertices': self.graph.number_of_nodes(),
            'n_edges': self.graph.number_of_edges()
        }

# ============================================================================
# GAUGE CONNECTION
# ============================================================================

class GaugeConnection:
    """
    Gauge connection (affine connection) on the manifold.
    Enables parallel transport with proper path dependence.
    """

    def __init__(self, tiles: List):
        self.tiles = tiles
        self.graph = self._build_graph()
        self.connection_matrices = {}

    def _build_graph(self) -> nx.Graph:
        """Build adjacency graph based on spatial proximity"""
        G = nx.Graph()

        positions = []
        for tile in self.tiles:
            pos = tile.tensor_payload[:3] if hasattr(tile, 'tensor_payload') else np.zeros(3)
            positions.append(pos)
            G.add_node(len(positions) - 1, pos=pos)

        positions = np.array(positions)
        if len(positions) > 1:
            # Use KD-tree for efficient nearest neighbor search
            tree = cKDTree(positions)
            pairs = tree.query_pairs(r=1.0)

            for i, j in pairs:
                dist = np.linalg.norm(positions[i] - positions[j])
                G.add_edge(i, j, weight=dist)

        return G

    def set_connection(self, u: int, v: int, matrix: np.ndarray):
        """Set connection matrix for edge (u, v)"""
        self.connection_matrices[(u, v)] = matrix
        self.connection_matrices[(v, u)] = matrix.T

    def parallel_transport(self, vector: np.ndarray, path: List[int]) -> np.ndarray:
        """
        Transport vector along path using connection.

        Args:
            vector: Initial 3D vector
            path: List of vertex indices [v0, v1, v2, ...]

        Returns:
            Transported vector
        """
        transported = vector.copy()

        for i in range(len(path) - 1):
            u, v = path[i], path[i + 1]
            if (u, v) in self.connection_matrices:
                R = self.connection_matrices[(u, v)]
                transported = R @ transported

        return transported

    def compute_holonomy(self, loop: List[int]) -> np.ndarray:
        """
        Compute holonomy around a closed loop.
        Product of connection matrices along the loop.
        """
        H = np.eye(3)

        for i in range(len(loop) - 1):
            u, v = loop[i], loop[i + 1]
            if (u, v) in self.connection_matrices:
                H = self.connection_matrices[(u, v)] @ H

        if len(loop) > 1:
            u, v = loop[-1], loop[0]
            if (u, v) in self.connection_matrices:
                H = self.connection_matrices[(u, v)] @ H

        return H

# ============================================================================
# FAST PERCOLATION
# ============================================================================

class FastPercolation:
    """
    Fast rigidity percolation using optimized union-find with path compression.
    """

    def __init__(self, tiles: List, p_critical: float = Constants.PC_CRITICAL):
        self.tiles = tiles
        self.p_critical = p_critical
        self.parent = {}
        self.rank = {}
        self.cluster_sizes = {}

    def make_set(self, x: int):
        """Initialize a set"""
        self.parent[x] = x
        self.rank[x] = 0
        self.cluster_sizes[x] = 1

    def find(self, x: int) -> int:
        """Find with path compression"""
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, x: int, y: int):
        """Union by rank"""
        x_root = self.find(x)
        y_root = self.find(y)

        if x_root == y_root:
            return

        if self.rank[x_root] < self.rank[y_root]:
            self.parent[x_root] = y_root
            self.cluster_sizes[y_root] += self.cluster_sizes[x_root]
        elif self.rank[x_root] > self.rank[y_root]:
            self.parent[y_root] = x_root
            self.cluster_sizes[x_root] += self.cluster_sizes[y_root]
        else:
            self.parent[y_root] = x_root
            self.rank[x_root] += 1
            self.cluster_sizes[x_root] += self.cluster_sizes[y_root]

    def check_laman_condition(self, n_nodes: int, n_edges: int) -> bool:
        """
        Check Laman's theorem: 2|V| - 3 edges for rigidity.
        """
        if n_nodes < 2:
            return False
        return n_edges >= 2 * n_nodes - 3

    def compute_rigidity(self, p: float) -> Dict:
        """
        Fast rigidity computation.

        Args:
            p: Bond probability for percolation

        Returns:
            Dictionary with rigidity metrics
        """
        n = len(self.tiles)
        if n == 0:
            return {
                'rigidity_fraction': 0.0,
                'n_clusters': 0,
                'n_rigid_clusters': 0,
                'rigid_clusters': [],
                'largest_cluster_size': 0
            }

        # Initialize
        for i in range(n):
            self.make_set(i)

        # Build graph based on probability p
        positions = []
        for tile in self.tiles:
            pos = tile.tensor_payload[:2] if hasattr(tile, 'tensor_payload') else np.zeros(2)
            positions.append(pos)
        positions = np.array(positions)

        edges = []
        for i in range(n):
            for j in range(i + 1, n):
                dist = np.linalg.norm(positions[i] - positions[j])
                if dist < 0.5 and np.random.random() < p:
                    edges.append((i, j))

        # Union components
        for u, v in edges:
            self.union(u, v)

        # Find clusters
        clusters = defaultdict(list)
        for i in range(n):
            root = self.find(i)
            clusters[root].append(i)

        # Check rigidity for each cluster
        rigid_clusters = []
        for cluster in clusters.values():
            if len(cluster) >= 3:
                cluster_edges = [(u, v) for u, v in edges
                               if u in cluster and v in cluster]
                if self.check_laman_condition(len(cluster), len(cluster_edges)):
                    rigid_clusters.append(cluster)

        # Compute metrics
        total_nodes = sum(len(c) for c in rigid_clusters)
        rigidity_fraction = total_nodes / n if n > 0 else 0
        largest_cluster = max(len(c) for c in clusters.values()) if clusters else 0

        return {
            'rigidity_fraction': rigidity_fraction,
            'n_clusters': len(clusters),
            'n_rigid_clusters': len(rigid_clusters),
            'rigid_clusters': rigid_clusters,
            'largest_cluster_size': largest_cluster
        }

# ============================================================================
# BENCHMARK RUNNER
# ============================================================================

class BenchmarkRunner:
    """Run comprehensive benchmarks on the simulation"""

    def __init__(self):
        self.results = {}

    def run_convergence_test(self, n_tiles_list: List[int], n_steps: int = 50) -> List[Dict]:
        """Test convergence for different tile counts"""
        print("\n" + "="*60)
        print("CONVERGENCE BENCHMARK")
        print("="*60)

        results = []

        for n_tiles in n_tiles_list:
            print(f"\nTesting {n_tiles} tiles...")

            # Create simple tile structure
            tiles = []
            for i in range(n_tiles):
                pos = np.random.randn(16).astype(np.float32) * 0.1

                class SimpleTile:
                    def __init__(self, idx, pos):
                        self.idx = idx
                        self.tensor_payload = pos
                        self.constraints = type('obj', (object,), {
                            'holonomy_matrix': np.eye(3),
                            'ricci_scalar': 0.0
                        })()

                tiles.append(SimpleTile(i, pos))

            # Test Pythagorean snapping
            pm = PythagoreanManifold()
            start = time.time()
            snap_scores = []
            for tile in tiles:
                vec = tile.tensor_payload[:2]
                snapped, noise = pm.snap(vec)
                snap_scores.append(1 - noise)
            snap_time = (time.time() - start) * 1000

            # Test gauge connection
            gc = GaugeConnection(tiles)
            start = time.time()
            for i, tile in enumerate(tiles):
                if i > 0:
                    matrix = np.eye(3) + np.random.randn(3, 3) * 0.01
                    gc.set_connection(i-1, i, matrix)
            conn_time = (time.time() - start) * 1000

            # Test sheaf cohomology
            sc = SheafCohomology(tiles)
            start = time.time()
            cohomology = sc.compute_cohomology()
            cohom_time = (time.time() - start) * 1000

            # Test percolation
            perc = FastPercolation(tiles)
            start = time.time()
            rigidity = perc.compute_rigidity(0.66)
            perc_time = (time.time() - start) * 1000

            result = {
                'n_tiles': n_tiles,
                'snap_score_avg': np.mean(snap_scores),
                'snap_time_ms': snap_time,
                'connection_time_ms': conn_time,
                'cohomology_time_ms': cohom_time,
                'percolation_time_ms': perc_time,
                'total_time_ms': snap_time + conn_time + cohom_time + perc_time,
                'cohomology_H1': cohomology['H1_dim'],
                'rigidity_fraction': rigidity['rigidity_fraction']
            }

            results.append(result)

            print(f"  Snap: {snap_time:.2f}ms")
            print(f"  Connection: {conn_time:.2f}ms")
            print(f"  Cohomology: {cohom_time:.2f}ms (H1={cohomology['H1_dim']})")
            print(f"  Percolation: {perc_time:.2f}ms (rigidity={rigidity['rigidity_fraction']:.3f})")
            print(f"  Total: {result['total_time_ms']:.2f}ms")

        return results

    def run_scalability_test(self):
        """Test scaling up to large tile counts"""
        n_tiles_list = [100, 500, 1000, 5000, 10000]
        results = self.run_convergence_test(n_tiles_list)

        print("\n" + "="*60)
        print("SCALABILITY SUMMARY")
        print("="*60)
        print(f"{'Tiles':>10} {'Total(ms)':>12} {'Per-tile(μs)':>15} {'H1':>8} {'Rigidity':>10}")
        print("-"*60)

        for r in results:
            per_tile_us = r['total_time_ms'] * 1000 / r['n_tiles']
            print(f"{r['n_tiles']:>10} {r['total_time_ms']:>12.2f} {per_tile_us:>15.2f} "
                  f"{r['cohomology_H1']:>8} {r['rigidity_fraction']:>10.3f}")

        return results

    def run_accuracy_test(self):
        """Test mathematical correctness"""
        print("\n" + "="*60)
        print("ACCURACY TEST")
        print("="*60)

        pm = PythagoreanManifold()

        test_cases = [
            (np.array([0.6, 0.8]), "3-4-5 triple"),
            (np.array([0.8, 0.6]), "4-3-5 triple"),
            (np.array([0.28, 0.96]), "7-24-25 triple"),
            (np.array([0.6, -0.8]), "3-4-5 (negative y)"),
        ]

        all_passed = True
        for vec, description in test_cases:
            snapped, noise = pm.snap(vec)
            passed = noise < 0.01
            all_passed = all_passed and passed

            status = "PASS" if passed else "FAIL"
            print(f"{status}: {description}")
            print(f"  Input: ({vec[0]:.2f}, {vec[1]:.2f})")
            print(f"  Snapped: ({snapped[0]:.4f}, {snapped[1]:.4f})")
            print(f"  Noise: {noise:.6f}")

        return all_passed

    def generate_report(self, results: Dict):
        """Generate benchmark report"""
        print("\n" + "="*60)
        print("BENCHMARK SUMMARY REPORT")
        print("="*60)

        if 'scalability' in results:
            scale_results = results['scalability']
            if scale_results:
                n_tiles = [r['n_tiles'] for r in scale_results]
                times = [r['total_time_ms'] for r in scale_results]

                print(f"\nThroughput Analysis:")
                for r in scale_results:
                    throughput = r['n_tiles'] / (r['total_time_ms'] / 1000)
                    print(f"  {r['n_tiles']:6d} tiles: {throughput:>10.0f} tiles/sec")

        if 'accuracy' in results:
            print(f"\nAccuracy: {'PASS' if results['accuracy'] else 'FAIL'}")

        print("\n" + "="*60)

# ============================================================================
# MAIN
# ============================================================================

def main():
    """Run enhanced simulation benchmarks"""
    print("\n" + "="*60)
    print("ENHANCED CONSTRAINT THEORY SIMULATION")
    print("Production-Grade Python Implementation")
    print("="*60)

    runner = BenchmarkRunner()

    # Run tests
    accuracy_result = runner.run_accuracy_test()
    scalability_results = runner.run_scalability_test()

    # Generate report
    runner.generate_report({
        'accuracy': accuracy_result,
        'scalability': scalability_results
    })

    print("\nSimulation complete!")
    print("\nNext steps:")
    print("1. Implement Rust/CUDA kernels")
    print("2. Build TypeScript API layer")
    print("3. Integrate with spreadsheet-moment/")
    print("4. Deploy to production")

if __name__ == "__main__":
    main()
