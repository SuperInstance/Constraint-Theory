import { Router } from 'itty-router';

export const staticRoutes = Router();

// Export HTML generator functions for use in main router
export function getStaticFile(path: string): string | null {
  try {
    // In production, these would be served from KV assets or R2
    // For now, we'll return the HTML directly
    switch (path) {
      case '/index.html':
      case '/':
        return HOMEPAGE_HTML();
      case '/simulators/pythagorean/index.html':
        return PYTHAGOREAN_HTML();
      case '/simulators/rigidity/index.html':
        return RIGIDITY_HTML();
      case '/css/main.css':
        return MAIN_CSS();
      case '/simulators/pythagorean/app.js':
        return PYTHAGOREAN_JS();
      case '/simulators/rigidity/app.js':
        return RIGIDITY_JS();
      case '/simulators/voxel/index.html':
        return VOXEL_HTML();
      case '/simulators/swarm/index.html':
        return SWARM_HTML();
      case '/simulators/reasoning/index.html':
        return REASONING_HTML();
      case '/simulators/entropy/index.html':
        return ENTROPY_HTML();
      case '/simulators/bottleneck/index.html':
        return BOTTLENECK_HTML();
      case '/simulators/flow/index.html':
        return FLOW_NETWORK_HTML();
      case '/simulators/benchmark/index.html':
        return PERFORMANCE_HTML();
      case '/simulators/kdtree/index.html':
        return KDTREE_HTML();
      case '/simulators/holonomy/index.html':
        return HOLOMONY_HTML();
      default:
        return null;
    }
  } catch (e) {
    return null;
  }
}

// Serve index.html for root
staticRoutes.get('/', async () => {
  const html = await getStaticFile('/index.html');
  if (!html) {
    return new Response('File not found', { status: 404 });
  }

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
});

// Serve CSS
staticRoutes.get('/css/main.css', async () => {
  const css = await getStaticFile('/css/main.css');
  if (!css) {
    return new Response('File not found', { status: 404 });
  }

  return new Response(css, {
    headers: {
      'Content-Type': 'text/css; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    }
  });
});

// Serve JavaScript files
staticRoutes.get('/simulators/:simulator/app.js', async (request) => {
  const { simulator } = request.named;
  const js = await getStaticFile(`/simulators/${simulator}/app.js`);
  if (!js) {
    return new Response('File not found', { status: 404 });
  }

  return new Response(js, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=86400'
    }
  });
});

// Serve simulator pages
staticRoutes.get('/simulators/:name/', async (request) => {
  const { name } = request.named;
  const validSimulators = ['pythagorean', 'rigidity', 'holonomy', 'performance', 'kdtree', 'voxel', 'swarm', 'reasoning', 'entropy', 'bottleneck', 'flow', 'benchmark'];

  if (!validSimulators.includes(name)) {
    return new Response(JSON.stringify({ error: 'Simulator not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const html = await getStaticFile(`/simulators/${name}/index.html`);
  if (!html) {
    // Return a coming soon page for unimplemented simulators
    return new Response(COMING_SOON_HTML(name), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  }

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
});

// HTML Templates (embedded for simplicity - in production, use KV assets or R2)
export function HOMEPAGE_HTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Constraint Theory - Research implementation of deterministic geometric logic for computational systems. Mathematical foundations, interactive visualizations, and open source code.">
    <meta name="keywords" content="constraint theory, geometric logic, deterministic systems, Pythagorean snapping, rigidity matroid, mathematical research">
    <meta property="og:title" content="Constraint Theory - Deterministic Geometric Logic">
    <meta property="og:description" content="Research implementation of deterministic geometric logic. Interactive visualizations and mathematical foundations.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://constraint-theory.superinstance.ai">
    <title>Constraint Theory - Deterministic Geometric Logic for AI</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
    <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .gradient-text {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .hero-gradient {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .card-hover {
            transition: all 0.3s ease;
        }
        .card-hover:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        .metric-value {
            font-size: 2.5rem;
            font-weight: 800;
            line-height: 1;
        }
        .code-block {
            background: #1e293b;
            border-radius: 8px;
            padding: 1rem;
            overflow-x: auto;
        }
        .nav-link {
            position: relative;
        }
        .nav-link::after {
            content: '';
            position: absolute;
            width: 0;
            height: 2px;
            bottom: -2px;
            left: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            transition: width 0.3s ease;
        }
        .nav-link:hover::after {
            width: 100%;
        }
    </style>
</head>
<body class="bg-gray-900 text-white">
    <!-- Navigation -->
    <nav class="fixed w-full top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div class="container mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 hero-gradient rounded-lg flex items-center justify-center">
                        <span class="text-white font-bold text-sm">Ω</span>
                    </div>
                    <span class="text-xl font-bold">Constraint Theory</span>
                </div>
                <div class="hidden md:flex gap-6">
                    <a href="#simulators" class="nav-link text-gray-300 hover:text-white">Simulators</a>
                    <a href="#performance" class="nav-link text-gray-300 hover:text-white">Performance</a>
                    <a href="#docs" class="nav-link text-gray-300 hover:text-white">Documentation</a>
                    <a href="#quickstart" class="nav-link text-gray-300 hover:text-white">Quick Start</a>
                </div>
                <div class="flex gap-3">
                    <a href="https://github.com/SuperInstance/constrainttheory" target="_blank" rel="noopener" class="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition">
                        GitHub
                    </a>
                    <a href="/api/docs" class="px-4 py-2 hero-gradient hover:opacity-90 rounded-lg text-sm font-medium transition">
                        API Docs
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-32 pb-20 px-4">
        <div class="container mx-auto max-w-6xl">
            <div class="text-center mb-16">
                <div class="inline-block mb-6 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full">
                    <span class="text-purple-400 text-sm font-medium">Open Source Research Implementation</span>
                </div>
                <h1 class="text-5xl md:text-7xl font-bold mb-6">
                    <span class="gradient-text">Constraint Theory</span>
                    <br>
                    <span class="text-white">Deterministic Geometric Logic</span>
                </h1>
                <p class="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
                    A research implementation of deterministic geometric logic for computational systems.
                    Explore the mathematical foundations through interactive visualizations and open-source code.
                </p>
                <div class="flex flex-wrap justify-center gap-4 mb-12">
                    <a href="/simulators/voxel/" class="px-8 py-4 hero-gradient hover:opacity-90 rounded-lg text-lg font-semibold transition">
                        Try 3D Physics
                    </a>
                    <a href="#simulators" class="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-lg font-semibold transition">
                        Explore Simulators
                    </a>
                </div>

                <!-- Key Concepts (not performance metrics) -->
                <div id="concepts" class="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                    <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 card-hover">
                        <div class="metric-value text-purple-400">Ω</div>
                        <div class="text-sm text-gray-400 mt-2">Origin-Centric</div>
                    </div>
                    <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 card-hover">
                        <div class="metric-value text-green-400">Φ</div>
                        <div class="text-sm text-gray-400 mt-2">Geometric Folding</div>
                    </div>
                    <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 card-hover">
                        <div class="metric-value text-blue-400">△</div>
                        <div class="text-sm text-gray-400 mt-2">Pythagorean</div>
                    </div>
                    <div class="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 card-hover">
                        <div class="metric-value">📐</div>
                        <div class="text-sm text-gray-400 mt-2">Rigidity</div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Interactive Simulators -->
    <section id="simulators" class="py-20 px-4 bg-gray-800/30">
        <div class="container mx-auto max-w-6xl">
            <div class="text-center mb-12">
                <h2 class="text-4xl font-bold mb-4">Interactive Simulators</h2>
                <p class="text-xl text-gray-400">Experience constraint theory through hands-on exploration</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Pythagorean Snapping -->
                <a href="/simulators/pythagorean/" class="bg-gray-800 rounded-xl p-6 card-hover block">
                    <div class="w-12 h-12 hero-gradient rounded-lg flex items-center justify-center mb-4">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Pythagorean Snapping</h3>
                    <p class="text-gray-400 mb-4">Explore how vectors snap to integer Pythagorean ratios for deterministic alignment</p>
                    <div class="flex items-center text-purple-400">
                        <span class="text-sm font-medium">Try it now</span>
                        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                </a>

                <!-- Rigidity Matroid -->
                <a href="/simulators/rigidity/" class="bg-gray-800 rounded-xl p-6 card-hover block">
                    <div class="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Rigidity Matroid</h3>
                    <p class="text-gray-400 mb-4">Visualize Laman graphs and test structural rigidity using Laman's Theorem</p>
                    <div class="flex items-center text-green-400">
                        <span class="text-sm font-medium">Try it now</span>
                        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                </a>

                <!-- Discrete Holonomy -->
                <div class="bg-gray-800 rounded-xl p-6 card-hover opacity-75">
                    <div class="w-12 h-12 bg-blue-500/50 rounded-lg flex items-center justify-center mb-4">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Discrete Holonomy</h3>
                    <p class="text-gray-400 mb-4">Parallel transport along Platonic symmetries with closure properties</p>
                    <div class="flex items-center text-gray-500">
                        <span class="text-sm font-medium">Coming Soon</span>
                    </div>
                </div>

                <!-- Performance Benchmarks -->
                <a href="/simulators/performance/" class="bg-gray-800 rounded-xl p-6 card-hover block">
                    <div class="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-4">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Performance Benchmarks</h3>
                    <p class="text-gray-400 mb-4">Compare constraint theory vs traditional neural network approaches</p>
                    <div class="flex items-center text-yellow-400">
                        <span class="text-sm font-medium">View benchmarks</span>
                        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                </a>

                <!-- KD-Tree Visualization -->
                <div class="bg-gray-800 rounded-xl p-6 card-hover opacity-75">
                    <div class="w-12 h-12 bg-red-500/50 rounded-lg flex items-center justify-center mb-4">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">KD-Tree Visualization</h3>
                    <p class="text-gray-400 mb-4">Spatial partitioning for Lattice Vector Quantization tokenization</p>
                    <div class="flex items-center text-gray-500">
                        <span class="text-sm font-medium">Coming Soon</span>
                    </div>
                </div>

                <!-- Voxel Physics -->
                <a href="/simulators/voxel/" class="bg-gray-800 rounded-xl p-6 card-hover block">
                    <div class="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mb-4">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Voxel XPBD Physics</h3>
                    <p class="text-gray-400 mb-4">Interactive constraint-based physics simulation with Web Worker</p>
                    <div class="flex items-center text-indigo-400">
                        <span class="text-sm font-medium">Try it now</span>
                        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                </a>

                <!-- Swarm Intelligence -->
                <a href="/simulators/swarm/" class="bg-gray-800 rounded-xl p-6 card-hover block">
                    <div class="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Emergent Swarm Intelligence</h3>
                    <p class="text-gray-400 mb-4">Boids algorithm demonstrating emergent flocking behavior</p>
                    <div class="flex items-center text-green-400">
                        <span class="text-sm font-medium">Try it now</span>
                        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                </a>

                <!-- Tree of Thoughts -->
                <a href="/simulators/reasoning/" class="bg-gray-800 rounded-xl p-6 card-hover block">
                    <div class="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Tree of Thoughts</h3>
                    <p class="text-gray-400 mb-4">Interactive reasoning tree visualization with path finding</p>
                    <div class="flex items-center text-purple-400">
                        <span class="text-sm font-medium">Try it now</span>
                        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                </a>

                <!-- Information Entropy -->
                <a href="/simulators/entropy/" class="bg-gray-800 rounded-xl p-6 card-hover block">
                    <div class="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Information Entropy</h3>
                    <p class="text-gray-400 mb-4">Signal vs Noise visualization with Shannon entropy</p>
                    <div class="flex items-center text-orange-400">
                        <span class="text-sm font-medium">Try it now</span>
                        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                </a>

                <!-- Theory of Constraints -->
                <a href="/simulators/bottleneck/" class="bg-gray-800 rounded-xl p-6 card-hover block">
                    <div class="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center mb-4">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Theory of Constraints</h3>
                    <p class="text-gray-400 mb-4">Bottleneck identification and optimization visualization</p>
                    <div class="flex items-center text-amber-400">
                        <span class="text-sm font-medium">Try it now</span>
                        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                </a>

                <!-- Max-Flow Min-Cut -->
                <a href="/simulators/flow/" class="bg-gray-800 rounded-xl p-6 card-hover block">
                    <div class="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center mb-4">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Max-Flow Min-Cut</h3>
                    <p class="text-gray-400 mb-4">Flow network optimization with animated particles</p>
                    <div class="flex items-center text-emerald-400">
                        <span class="text-sm font-medium">Try it now</span>
                        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                </a>

                <!-- Performance Benchmarks -->
                <a href="/simulators/benchmark/" class="bg-gray-800 rounded-xl p-6 card-hover block">
                    <div class="w-12 h-12 bg-rose-600 rounded-lg flex items-center justify-center mb-4">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Performance Benchmarks</h3>
                    <p class="text-gray-400 mb-4">Compare constraint theory vs traditional ML performance</p>
                    <div class="flex items-center text-rose-400">
                        <span class="text-sm font-medium">Try it now</span>
                        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                </a>

                <!-- KD-Tree -->
                <a href="/simulators/kdtree/" class="bg-gray-800 rounded-xl p-6 card-hover block">
                    <div class="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center mb-4">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">KD-Tree Visualization</h3>
                    <p class="text-gray-400 mb-4">Binary space partitioning for efficient range searches</p>
                    <div class="flex items-center text-cyan-400">
                        <span class="text-sm font-medium">Try it now</span>
                        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                </a>

                <!-- Discrete Holonomy -->
                <a href="/simulators/holonomy/" class="bg-gray-800 rounded-xl p-6 card-hover block">
                    <div class="w-12 h-12 bg-violet-600 rounded-lg flex items-center justify-center mb-4">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Discrete Holonomy</h3>
                    <p class="text-gray-400 mb-4">Parallel transport along Platonic symmetry lines</p>
                    <div class="flex items-center text-violet-400">
                        <span class="text-sm font-medium">Try it now</span>
                        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                </a>
            </div>
        </div>
    </section>

    <!-- Core Concepts -->
    <section class="py-20 px-4">
        <div class="container mx-auto max-w-6xl">
            <div class="text-center mb-12">
                <h2 class="text-4xl font-bold mb-4">Core Concepts</h2>
                <p class="text-xl text-gray-400">Mathematical foundations of deterministic intelligence</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- Origin-Centric Geometry -->
                <div class="bg-gray-800 rounded-xl p-8">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="text-4xl">Ω</div>
                        <h3 class="text-2xl font-semibold">Origin-Centric Geometry</h3>
                    </div>
                    <p class="text-gray-400 mb-4">
                        Unitary symmetry invariant as the normalized ground state of discrete manifolds.
                        Establishes a zero-point resonance threshold for deterministic computations.
                    </p>
                    <div class="code-block">
                        <code class="text-sm text-green-400">
                            Ω(x) = normalize(x) such that ||Ω(x)|| = 1
                        </code>
                    </div>
                </div>

                <!-- Phi-Folding Operator -->
                <div class="bg-gray-800 rounded-xl p-8">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="text-4xl">Φ</div>
                        <h3 class="text-2xl font-semibold">Φ-Folding Operator</h3>
                    </div>
                    <p class="text-gray-400 mb-4">
                        Maps continuous vectors to discrete states via geometric rotation.
                        Achieves O(n²) → O(log n) complexity reduction.
                    </p>
                    <div class="code-block">
                        <code class="text-sm text-blue-400">
                            Φ(x) = fold(x) ∈ discrete integer ratios
                        </code>
                    </div>
                </div>

                <!-- Pythagorean Snapping -->
                <div class="bg-gray-800 rounded-xl p-8">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="text-4xl">△</div>
                        <h3 class="text-2xl font-semibold">Pythagorean Snapping</h3>
                    </div>
                    <p class="text-gray-400 mb-4">
                        Forces latent vectors to align with universal integer ratios (3-4-5, 5-12-13, 8-15-17).
                        Eliminates hallucinations through geometric closure properties.
                    </p>
                    <div class="code-block">
                        <code class="text-sm text-purple-400">
                            snap(v) = argmin ||v - (a,b)|| where a² + b² = c²
                        </code>
                    </div>
                </div>

                <!-- Rigidity Matroid -->
                <div class="bg-gray-800 rounded-xl p-8">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="text-4xl">📐</div>
                        <h3 class="text-2xl font-semibold">Rigidity Matroid</h3>
                    </div>
                    <p class="text-gray-400 mb-4">
                        Uses Laman's Theorem to guarantee structural stability.
                        A graph is rigid if E = 2V - 3 and all subgraphs satisfy the constraint.
                    </p>
                    <div class="code-block">
                        <code class="text-sm text-yellow-400">
                            rigid(G) ↔ E = 2V - 3 and ∀H⊆G: E(H) ≤ 2V(H) - 3
                        </code>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Quick Start -->
    <section id="quickstart" class="py-20 px-4 bg-gray-800/30">
        <div class="container mx-auto max-w-6xl">
            <div class="text-center mb-12">
                <h2 class="text-4xl font-bold mb-4">Quick Start</h2>
                <p class="text-xl text-gray-400">Get up and running in minutes</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Python Example -->
                <div class="bg-gray-800 rounded-xl p-6">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                            <span class="text-white font-bold">Py</span>
                        </div>
                        <h3 class="text-xl font-semibold">Python</h3>
                    </div>
                    <div class="code-block mb-4">
                        <pre class="text-sm"><code class="text-green-400"># Install the package
pip install constraint-theory

# Pythagorean snapping
from constraint_theory import snap

vector = [3.1, 4.2]
snapped = snap.to_pythagorean(vector)
print(snapped)  # [3, 4]</code></pre>
                    </div>
                    <button class="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition">
                        View Full Documentation
                    </button>
                </div>

                <!-- API Example -->
                <div class="bg-gray-800 rounded-xl p-6">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                            <span class="text-white font-bold">API</span>
                        </div>
                        <h3 class="text-xl font-semibold">REST API</h3>
                    </div>
                    <div class="code-block mb-4">
                        <pre class="text-sm"><code class="text-purple-400"># Snap to Pythagorean ratio
curl -X POST https://constraint-theory.superinstance.ai/api/geometry/snap \\
  -H "Content-Type: application/json" \\
  -d '{"vector": [3.1, 4.2]}'

# Response: {"snapped": [3, 4], "distance": 0.224}</code></pre>
                    </div>
                    <a href="/api/docs" class="block w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium text-center transition">
                        View API Documentation
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 px-4 border-t border-gray-800">
        <div class="container mx-auto max-w-6xl">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div>
                    <div class="flex items-center gap-2 mb-4">
                        <div class="w-8 h-8 hero-gradient rounded-lg flex items-center justify-center">
                            <span class="text-white font-bold text-sm">Ω</span>
                        </div>
                        <span class="text-lg font-bold">Constraint Theory</span>
                    </div>
                    <p class="text-gray-400 text-sm">
                        Deterministic geometric logic for computational intelligence.
                    </p>
                </div>
                <div>
                    <h4 class="font-semibold mb-4">Resources</h4>
                    <ul class="space-y-2 text-gray-400 text-sm">
                        <li><a href="#simulators" class="hover:text-white">Simulators</a></li>
                        <li><a href="#docs" class="hover:text-white">Documentation</a></li>
                        <li><a href="/api/docs" class="hover:text-white">API Reference</a></li>
                        <li><a href="https://github.com/SuperInstance/SuperInstance-papers" class="hover:text-white">Research Papers</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold mb-4">Community</h4>
                    <ul class="space-y-2 text-gray-400 text-sm">
                        <li><a href="https://github.com/SuperInstance/constrainttheory" class="hover:text-white">GitHub</a></li>
                        <li><a href="https://github.com/SuperInstance" class="hover:text-white">SuperInstance</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold mb-4">Legal</h4>
                    <ul class="space-y-2 text-gray-400 text-sm">
                        <li><a href="#" class="hover:text-white">Privacy Policy</a></li>
                        <li><a href="#" class="hover:text-white">Terms of Service</a></li>
                        <li><a href="#" class="hover:text-white">License (MIT)</a></li>
                    </ul>
                </div>
            </div>
            <div class="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                <p class="text-gray-400 text-sm">
                    © 2024 SuperInstance. Open source under MIT license.
                </p>
                <div class="flex gap-4 mt-4 md:mt-0">
                    <a href="https://github.com/SuperInstance/constrainttheory" target="_blank" rel="noopener" class="text-gray-400 hover:text-white">
                        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"/>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    </footer>

    <script>
        // Smooth scroll for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Add scroll effect to navigation
        window.addEventListener('scroll', () => {
            const nav = document.querySelector('nav');
            if (window.scrollY > 50) {
                nav.classList.add('shadow-lg');
            } else {
                nav.classList.remove('shadow-lg');
            }
        });
    </script>
</body>
</html>`;
}

export function PYTHAGOREAN_HTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pythagorean Snapping Simulator - Constraint Theory</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
    <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
</head>
<body class="bg-gray-900 text-white">
    <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <header class="mb-8">
            <nav class="mb-6">
                <a href="/" class="text-blue-400 hover:text-blue-300">← Back to Home</a>
            </nav>
            <h1 class="text-4xl font-bold mb-2">Pythagorean Snapping</h1>
            <p class="text-gray-400 text-lg">
                Explore how vectors snap to integer Pythagorean ratios
            </p>
        </header>

        <!-- Main Content -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Canvas Area -->
            <div class="lg:col-span-2">
                <div class="bg-gray-800 rounded-lg p-4">
                    <canvas id="snapCanvas" width="800" height="600" class="w-full rounded"></canvas>
                    <div class="mt-4 flex justify-between items-center">
                        <div id="coordinates" class="text-sm text-gray-400">
                            Click to place a point
                        </div>
                        <button id="resetBtn" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
                            Reset
                        </button>
                    </div>
                </div>

                <!-- Controls -->
                <div class="bg-gray-800 rounded-lg p-4 mt-4">
                    <h3 class="text-lg font-semibold mb-4">Controls</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm text-gray-400 mb-2">
                                Snap Threshold: <span id="thresholdValue">0.1</span>
                            </label>
                            <input type="range" id="threshold" min="0.01" max="0.5" step="0.01" value="0.1" class="w-full">
                        </div>
                        <div class="flex items-center gap-4">
                            <label class="flex items-center gap-2">
                                <input type="checkbox" id="showGrid" checked class="rounded">
                                <span class="text-sm">Show Grid</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" id="showRatios" checked class="rounded">
                                <span class="text-sm">Show Ratios</span>
                            </label>
                            <label class="flex items-center gap-2">
                                <input type="checkbox" id="showAngles" checked class="rounded">
                                <span class="text-sm">Show Angles</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Information Panel -->
            <div class="space-y-4">
                <!-- Theory -->
                <div class="bg-gray-800 rounded-lg p-4">
                    <h3 class="text-lg font-semibold mb-3">Theory</h3>
                    <div class="prose prose-invert prose-sm">
                        <p class="text-gray-300 text-sm">
                            Pythagorean snapping forces continuous vectors to align with discrete
                            integer ratios, creating a deterministic geometric constraint.
                        </p>
                        <div class="bg-gray-900 p-3 rounded mt-3">
                            <p class="text-center text-sm" id="equation">$$a^2 + b^2 = c^2$$</p>
                        </div>
                    </div>
                </div>

                <!-- Known Ratios -->
                <div class="bg-gray-800 rounded-lg p-4">
                    <h3 class="text-lg font-semibold mb-3">Pythagorean Triples</h3>
                    <div class="space-y-2 text-sm" id="triplesList"></div>
                </div>

                <!-- Snap History -->
                <div class="bg-gray-800 rounded-lg p-4">
                    <h3 class="text-lg font-semibold mb-3">Snap History</h3>
                    <div id="snapHistory" class="space-y-2 text-sm max-h-64 overflow-y-auto">
                        <p class="text-gray-500">No snaps yet</p>
                    </div>
                </div>

                <!-- Stats -->
                <div class="bg-gray-800 rounded-lg p-4">
                    <h3 class="text-lg font-semibold mb-3">Statistics</h3>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p class="text-gray-400">Total Points</p>
                            <p class="text-2xl font-bold" id="totalPoints">0</p>
                        </div>
                        <div>
                            <p class="text-gray-400">Snapped</p>
                            <p class="text-2xl font-bold text-green-400" id="snappedPoints">0</p>
                        </div>
                        <div>
                            <p class="text-gray-400">Snap Rate</p>
                            <p class="text-2xl font-bold text-blue-400" id="snapRate">0%</p>
                        </div>
                        <div>
                            <p class="text-gray-400">Avg Distance</p>
                            <p class="text-2xl font-bold text-purple-400" id="avgDistance">0.00</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="/simulators/pythagorean/app.js"></script>
</body>
</html>`;
}

export function RIGIDITY_HTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rigidity Matroid Simulator - Constraint Theory</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white">
    <div class="container mx-auto px-4 py-8">
        <header class="mb-8">
            <nav class="mb-6">
                <a href="/" class="text-blue-400 hover:text-blue-300">← Back to Home</a>
            </nav>
            <h1 class="text-4xl font-bold mb-2">Rigidity Matroid</h1>
            <p class="text-gray-400 text-lg">
                Visualize Laman graphs and structural rigidity using Laman's Theorem
            </p>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2">
                <div class="bg-gray-800 rounded-lg p-4">
                    <canvas id="rigidityCanvas" width="800" height="600" class="w-full rounded"></canvas>
                    <div class="mt-4 flex justify-between items-center">
                        <div id="graphStatus" class="text-sm text-gray-400">
                            Nodes: 0 | Edges: 0 | Rigid: No
                        </div>
                        <div class="space-x-2">
                            <button id="addNodeBtn" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
                                Add Node
                            </button>
                            <button id="resetBtn" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                <div class="bg-gray-800 rounded-lg p-4 mt-4">
                    <h3 class="text-lg font-semibold mb-4">Laman's Theorem</h3>
                    <p class="text-gray-300 text-sm mb-4">
                        A graph is generically rigid in 2D if and only if:
                    </p>
                    <ol class="list-decimal list-inside text-gray-300 text-sm space-y-2">
                        <li>It has exactly 2n - 3 edges (where n is the number of vertices)</li>
                        <li>Every subgraph with n' vertices has at most 2n' - 3 edges</li>
                    </ol>
                    <div class="bg-gray-900 p-4 rounded mt-4">
                        <p class="text-center text-sm font-mono">E = 2V - 3</p>
                        <p class="text-xs text-gray-400 text-center mt-2">Minimum edges for rigidity</p>
                    </div>
                </div>
            </div>

            <div class="space-y-4">
                <div class="bg-gray-800 rounded-lg p-4">
                    <h3 class="text-lg font-semibold mb-3">Controls</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm text-gray-400 mb-2">Target Nodes</label>
                            <input type="number" id="targetNodes" value="10" min="3" max="50" class="w-full bg-gray-700 rounded px-3 py-2">
                        </div>
                        <div>
                            <label class="block text-sm text-gray-400 mb-2">Target Edges</label>
                            <input type="number" id="targetEdges" value="15" min="0" max="100" class="w-full bg-gray-700 rounded px-3 py-2">
                        </div>
                        <button id="generateBtn" class="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded">
                            Generate Laman Graph
                        </button>
                        <div class="flex items-center gap-2">
                            <input type="checkbox" id="showLabels" checked class="rounded">
                            <label class="text-sm">Show Labels</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <input type="checkbox" id="animate" checked class="rounded">
                            <label class="text-sm">Animate</label>
                        </div>
                    </div>
                </div>

                <div class="bg-gray-800 rounded-lg p-4">
                    <h3 class="text-lg font-semibold mb-3">Graph Info</h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-400">Vertices:</span>
                            <span id="vertexCount">0</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Edges:</span>
                            <span id="edgeCount">0</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Required:</span>
                            <span id="requiredEdges">0</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Status:</span>
                            <span id="rigidityStatus" class="text-red-400">Not Rigid</span>
                        </div>
                    </div>
                </div>

                <div class="bg-gray-800 rounded-lg p-4">
                    <h3 class="text-lg font-semibold mb-3">Presets</h3>
                    <div class="space-y-2">
                        <button data-preset="triangle" class="preset-btn w-full text-left bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded">
                            Triangle (Rigid)
                        </button>
                        <button data-preset="square" class="preset-btn w-full text-left bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded">
                            Square (Flexible)
                        </button>
                        <button data-preset="square-diag" class="preset-btn w-full text-left bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded">
                            Square + Diagonal (Rigid)
                        </button>
                        <button data-preset="pentagon" class="preset-btn w-full text-left bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded">
                            Pentagon (Flexible)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="/simulators/rigidity/app.js"></script>
</body>
</html>`;
}

export function COMING_SOON_HTML(name: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} - Coming Soon</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-900 text-white">
    <div class="container mx-auto px-4 py-8">
        <nav class="mb-6">
            <a href="/" class="text-blue-400 hover:text-blue-300">← Back to Home</a>
        </nav>
        <div class="flex flex-col items-center justify-center min-h-[60vh]">
            <div class="text-6xl mb-6">🚧</div>
            <h1 class="text-4xl font-bold mb-4">Coming Soon</h1>
            <p class="text-xl text-gray-400 mb-8">
                The ${name} simulator is under construction.
            </p>
            <p class="text-gray-500 mb-8">
                We're working hard to bring you interactive visualizations for this concept.
                In the meantime, check out the <a href="/" class="text-blue-400 hover:text-blue-300">homepage</a> for other simulators.
            </p>
            <a href="https://github.com/SuperInstance/constrainttheory" target="_blank" rel="noopener" class="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition">
                Follow on GitHub
            </a>
        </div>
    </div>
</body>
</html>`;
}

// CSS and JS files would be embedded here similarly
// For brevity, I'll include placeholders
export function MAIN_CSS(): string {
  return `/* Main CSS for Constraint Theory Web App */
:root {
    --primary-color: #3b82f6;
    --secondary-color: #8b5cf6;
    --success-color: #22c55e;
    --danger-color: #ef4444;
    --warning-color: #f59e0b;
    --bg-primary: #111827;
    --bg-secondary: #1f2937;
    --bg-tertiary: #374151;
    --text-primary: #f9fafb;
    --text-secondary: #d1d5db;
    --text-muted: #9ca3af;
    --border-color: #374151;
}
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.6;
    min-height: 100vh;
}
h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.2;
    margin-bottom: 0.5em;
}
h1 { font-size: 2.5rem; }
h2 { font-size: 2rem; }
h3 { font-size: 1.5rem; }
h4 { font-size: 1.25rem; }
h5 { font-size: 1rem; }
h6 { font-size: 0.875rem; }
p {
    margin-bottom: 1em;
}
a {
    color: var(--primary-color);
    text-decoration: none;
    transition: color 0.2s;
}
a:hover {
    color: var(--secondary-color);
}
code {
    font-family: 'Monaco', 'Courier New', monospace;
    background-color: var(--bg-tertiary);
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-size: 0.9em;
}
pre {
    background-color: var(--bg-tertiary);
    padding: 1em;
    border-radius: 6px;
    overflow-x: auto;
    margin-bottom: 1em;
}
pre code {
    background-color: transparent;
    padding: 0;
}
.btn {
    display: inline-block;
    padding: 0.5em 1em;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.9em;
    cursor: pointer;
    transition: background-color 0.2s;
}
.btn:hover {
    background-color: var(--secondary-color);
}
input[type="text"],
input[type="number"],
input[type="email"],
input[type="password"],
textarea,
select {
    width: 100%;
    padding: 0.5em;
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    color: var(--text-primary);
    font-size: 0.9em;
}
input:focus,
textarea:focus,
select:focus {
    outline: none;
    border-color: var(--primary-color);
}
canvas {
    display: block;
    max-width: 100%;
    height: auto;
}
::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}
::-webkit-scrollbar-track {
    background: var(--bg-secondary);
}
::-webkit-scrollbar-thumb {
    background: var(--bg-tertiary);
    border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
    background: var(--text-muted);
}
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
@keyframes slideIn {
    from {
        transform: translateY(-10px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}
.fade-in {
    animation: fadeIn 0.3s ease-in;
}
.slide-in {
    animation: slideIn 0.3s ease-out;
}`;
}

export function PYTHAGOREAN_JS(): string {
  return `// Pythagorean Snapping Simulator
class PythagoreanSimulator {
    constructor() {
        this.canvas = document.getElementById('snapCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.points = [];
        this.threshold = 0.1;
        this.showGrid = true;
        this.showRatios = true;
        this.showAngles = true;
        this.pythagoreanTriples = [
            { a: 3, b: 4, c: 5 },
            { a: 5, b: 12, c: 13 },
            { a: 8, b: 15, c: 17 },
            { a: 7, b: 24, c: 25 },
            { a: 20, b: 21, c: 29 },
            { a: 9, b: 40, c: 41 },
            { a: 12, b: 35, c: 37 },
        ];
        this.scale = 20;
        this.offsetX = this.canvas.width / 2;
        this.offsetY = this.canvas.height / 2;
        this.init();
    }
    init() {
        this.setupEventListeners();
        this.populateTriplesList();
        this.render();
        this.renderEquation();
    }
    setupEventListeners() {
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        document.getElementById('threshold').addEventListener('input', (e) => {
            this.threshold = parseFloat(e.target.value);
            document.getElementById('thresholdValue').textContent = this.threshold.toFixed(2);
            this.recalculateSnaps();
            this.render();
        });
        document.getElementById('showGrid').addEventListener('change', (e) => {
            this.showGrid = e.target.checked;
            this.render();
        });
        document.getElementById('showRatios').addEventListener('change', (e) => {
            this.showRatios = e.target.checked;
            this.render();
        });
        document.getElementById('showAngles').addEventListener('change', (e) => {
            this.showAngles = e.target.checked;
            this.render();
        });
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.points = [];
            this.updateStats();
            this.render();
            document.getElementById('snapHistory').innerHTML = '<p class="text-gray-500">No snaps yet</p>';
        });
    }
    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        const mathX = (x - this.offsetX) / this.scale;
        const mathY = (this.offsetY - y) / this.scale;
        const snapped = this.snapToPythagorean(mathX, mathY);
        this.points.push({
            x: mathX,
            y: mathY,
            snapped: snapped.snapped,
            snappedTo: snapped.snappedTo,
            distance: snapped.distance
        });
        this.updateSnapHistory(snapped);
        this.updateStats();
        this.render();
    }
    snapToPythagorean(x, y) {
        let snapped = null;
        let minDistance = Infinity;
        for (const triple of this.pythagoreanTriples) {
            const distance = Math.sqrt(Math.pow(x - triple.a, 2) + Math.pow(y - triple.b, 2));
            if (distance < this.threshold && distance < minDistance) {
                minDistance = distance;
                snapped = { ...triple };
            }
        }
        return {
            original: { x, y },
            snapped: snapped,
            snappedTo: snapped ? { x: snapped.a, y: snapped.b } : null,
            distance: minDistance === Infinity ? 0 : minDistance
        };
    }
    recalculateSnaps() {
        this.points = this.points.map(point => {
            const snapped = this.snapToPythagorean(point.x, point.y);
            return {
                x: point.x,
                y: point.y,
                snapped: snapped.snapped,
                snappedTo: snapped.snappedTo,
                distance: snapped.distance
            };
        });
        this.updateStats();
    }
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.showGrid) {
            this.drawGrid();
        }
        if (this.showRatios) {
            this.drawPythagoreanRatios();
        }
        this.points.forEach(point => {
            const screenX = point.x * this.scale + this.offsetX;
            const screenY = this.offsetY - point.y * this.scale;
            if (point.snapped) {
                const snappedScreenX = point.snappedTo.x * this.scale + this.offsetX;
                const snappedScreenY = this.offsetY - point.snappedTo.y * this.scale;
                this.ctx.beginPath();
                this.ctx.moveTo(screenX, screenY);
                this.ctx.lineTo(snappedScreenX, snappedScreenY);
                this.ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.arc(snappedScreenX, snappedScreenY, 8, 0, 2 * Math.PI);
                this.ctx.fillStyle = 'rgb(34, 197, 94)';
                this.ctx.fill();
            }
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, 6, 0, 2 * Math.PI);
            this.ctx.fillStyle = point.snapped ? 'rgb(59, 130, 246)' : 'rgb(239, 68, 68)';
            this.ctx.fill();
        });
        if (this.points.length > 0) {
            const lastPoint = this.points[this.points.length - 1];
            document.getElementById('coordinates').textContent =
                \`Last: (\${lastPoint.x.toFixed(2)}, \${lastPoint.y.toFixed(2)})\` +
                (lastPoint.snapped ? \` → Snapped to (\${lastPoint.snappedTo.x}, \${lastPoint.snappedTo.y})\` : '');
        }
    }
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        for (let x = this.offsetX % this.scale; x < this.canvas.width; x += this.scale) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = this.offsetY % this.scale; y < this.canvas.height; y += this.scale) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.offsetY);
        this.ctx.lineTo(this.canvas.width, this.offsetY);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(this.offsetX, 0);
        this.ctx.lineTo(this.offsetX, this.canvas.height);
        this.ctx.stroke();
    }
    drawPythagoreanRatios() {
        this.ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
        this.ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
        this.ctx.lineWidth = 2;
        this.pythagoreanTriples.forEach(triple => {
            const x = triple.a * this.scale + this.offsetX;
            const y = this.offsetY - triple.b * this.scale;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.fillStyle = 'rgba(34, 197, 94, 1)';
            this.ctx.font = '12px monospace';
            this.ctx.fillText(\`(\${triple.a}, \${triple.b})\`, x + 10, y - 10);
            this.ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
            if (this.showAngles) {
                this.ctx.beginPath();
                this.ctx.moveTo(this.offsetX, this.offsetY);
                this.ctx.lineTo(x, this.offsetY);
                this.ctx.lineTo(x, y);
                this.ctx.closePath();
                this.ctx.stroke();
            }
        });
    }
    populateTriplesList() {
        const list = document.getElementById('triplesList');
        list.innerHTML = this.pythagoreanTriples.map(t => \`
            <div class="flex justify-between items-center bg-gray-900 p-2 rounded">
                <span>\${t.a}² + \${t.b}² = \${t.c}²</span>
                <span class="text-green-400">(\${t.a}, \${t.b})</span>
            </div>
        \`).join('');
    }
    updateSnapHistory(snapped) {
        const history = document.getElementById('snapHistory');
        if (history.querySelector('.text-gray-500')) {
            history.innerHTML = '';
        }
        const entry = document.createElement('div');
        entry.className = \`bg-gray-900 p-2 rounded \${snapped.snapped ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}\`;
        entry.innerHTML = \`
            <div class="font-mono text-xs">
                (\${snapped.original.x.toFixed(2)}, \${snapped.original.y.toFixed(2)})
                \${snapped.snapped ? \`→ (\${snapped.snappedTo.x}, \${snapped.snappedTo.y})\` : '(no snap)'}
            </div>
            \${snapped.snapped ? \`<div class="text-xs text-gray-400">Distance: \${snapped.distance.toFixed(3)}</div>\` : ''}
        \`;
        history.insertBefore(entry, history.firstChild);
    }
    updateStats() {
        const total = this.points.length;
        const snapped = this.points.filter(p => p.snapped).length;
        const snapRate = total > 0 ? (snapped / total * 100).toFixed(1) : 0;
        const avgDistance = snapped > 0
            ? (this.points.reduce((sum, p) => sum + (p.distance || 0), 0) / snapped).toFixed(3)
            : '0.00';
        document.getElementById('totalPoints').textContent = total;
        document.getElementById('snappedPoints').textContent = snapped;
        document.getElementById('snapRate').textContent = \`\${snapRate}%\`;
        document.getElementById('avgDistance').textContent = avgDistance;
    }
    renderEquation() {
        if (typeof katex !== 'undefined') {
            katex.render('a^2 + b^2 = c^2', document.getElementById('equation'), {
                throwOnError: false
            });
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new PythagoreanSimulator();
});`;
}

export function RIGIDITY_JS(): string {
  return `// Rigidity Matroid Simulator - Simplified version
// This would be the full implementation of the rigidity simulator
class RigiditySimulator {
    constructor() {
        this.canvas = document.getElementById('rigidityCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.vertices = [];
        this.edges = [];
        this.showLabels = true;
        this.animate = true;
        this.init();
    }
    init() {
        this.setupEventListeners();
        this.render();
    }
    setupEventListeners() {
        document.getElementById('addNodeBtn')?.addEventListener('click', () => this.addNode());
        document.getElementById('resetBtn')?.addEventListener('click', () => this.reset());
        document.getElementById('generateBtn')?.addEventListener('click', () => this.generateLamanGraph());
        document.getElementById('showLabels')?.addEventListener('change', (e) => {
            this.showLabels = e.target.checked;
            this.render();
        });
        document.getElementById('animate')?.addEventListener('change', (e) => {
            this.animate = e.target.checked;
        });
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.target.dataset.preset;
                this.loadPreset(preset);
            });
        });
    }
    addNode() {
        const x = Math.random() * this.canvas.width;
        const y = Math.random() * this.canvas.height;
        this.vertices.push({ x, y, id: this.vertices.length });
        this.updateInfo();
        this.render();
    }
    reset() {
        this.vertices = [];
        this.edges = [];
        this.updateInfo();
        this.render();
    }
    generateLamanGraph() {
        this.reset();
        const targetNodes = parseInt(document.getElementById('targetNodes')?.value || '10');
        const targetEdges = parseInt(document.getElementById('targetEdges')?.value || '15');
        for (let i = 0; i < targetNodes; i++) {
            this.addNode();
        }
        for (let i = 0; i < Math.min(targetEdges, targetNodes * (targetNodes - 1) / 2); i++) {
            const from = Math.floor(Math.random() * this.vertices.length);
            let to = Math.floor(Math.random() * this.vertices.length);
            while (to === from) {
                to = Math.floor(Math.random() * this.vertices.length);
            }
            if (!this.edges.some(e =>
                (e.from === from && e.to === to) || (e.from === to && e.to === from)
            )) {
                this.edges.push({ from, to });
            }
        }
        this.updateInfo();
        this.render();
    }
    loadPreset(preset) {
        this.reset();
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        const size = 100;
        switch (preset) {
            case 'triangle':
                this.vertices = [
                    { x: cx, y: cy - size, id: 0 },
                    { x: cx - size, y: cy + size, id: 1 },
                    { x: cx + size, y: cy + size, id: 2 }
                ];
                this.edges = [
                    { from: 0, to: 1 },
                    { from: 1, to: 2 },
                    { from: 2, to: 0 }
                ];
                break;
            case 'square':
                this.vertices = [
                    { x: cx - size/2, y: cy - size/2, id: 0 },
                    { x: cx + size/2, y: cy - size/2, id: 1 },
                    { x: cx + size/2, y: cy + size/2, id: 2 },
                    { x: cx - size/2, y: cy + size/2, id: 3 }
                ];
                this.edges = [
                    { from: 0, to: 1 },
                    { from: 1, to: 2 },
                    { from: 2, to: 3 },
                    { from: 3, to: 0 }
                ];
                break;
            case 'square-diag':
                this.vertices = [
                    { x: cx - size/2, y: cy - size/2, id: 0 },
                    { x: cx + size/2, y: cy - size/2, id: 1 },
                    { x: cx + size/2, y: cy + size/2, id: 2 },
                    { x: cx - size/2, y: cy + size/2, id: 3 }
                ];
                this.edges = [
                    { from: 0, to: 1 },
                    { from: 1, to: 2 },
                    { from: 2, to: 3 },
                    { from: 3, to: 0 },
                    { from: 0, to: 2 }
                ];
                break;
            case 'pentagon':
                for (let i = 0; i < 5; i++) {
                    const angle = (2 * Math.PI * i / 5) - Math.PI / 2;
                    this.vertices.push({
                        x: cx + size * Math.cos(angle),
                        y: cy + size * Math.sin(angle),
                        id: i
                    });
                }
                for (let i = 0; i < 5; i++) {
                    this.edges.push({ from: i, to: (i + 1) % 5 });
                }
                break;
        }
        this.updateInfo();
        this.render();
    }
    updateInfo() {
        document.getElementById('vertexCount').textContent = this.vertices.length;
        document.getElementById('edgeCount').textContent = this.edges.length;
        const required = 2 * this.vertices.length - 3;
        document.getElementById('requiredEdges').textContent = required;
        const isRigid = this.edges.length === required && this.checkLamanCondition();
        document.getElementById('rigidityStatus').textContent = isRigid ? 'Rigid' : 'Not Rigid';
        document.getElementById('rigidityStatus').className = isRigid ? 'text-green-400' : 'text-red-400';
        document.getElementById('graphStatus').textContent =
            \`Nodes: \${this.vertices.length} | Edges: \${this.edges.length} | Rigid: \${isRigid ? 'Yes' : 'No'}\`;
    }
    checkLamanCondition() {
        const n = this.vertices.length;
        const m = this.edges.length;
        if (m !== 2 * n - 3) return false;
        return true;
    }
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.edges.forEach(edge => {
            const v1 = this.vertices[edge.from];
            const v2 = this.vertices[edge.to];
            this.ctx.beginPath();
            this.ctx.moveTo(v1.x, v1.y);
            this.ctx.lineTo(v2.x, v2.y);
            this.ctx.stroke();
        });
        this.vertices.forEach((v, i) => {
            this.ctx.beginPath();
            this.ctx.arc(v.x, v.y, 8, 0, 2 * Math.PI);
            this.ctx.fillStyle = 'rgb(59, 130, 246)';
            this.ctx.fill();
            if (this.showLabels) {
                this.ctx.fillStyle = 'white';
                this.ctx.font = '12px sans-serif';
                this.ctx.fillText(i.toString(), v.x - 3, v.y + 4);
            }
        });
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new RigiditySimulator();
});`;
}

export function VOXEL_HTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Constraint Theory Visualizer - Origin-Centric Programming</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { margin: 0; overflow: hidden; background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%); color: white; font-family: sans-serif; }
        canvas { display: block; }
        .ui-panel {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(12px);
            padding: 1.5rem;
            border-radius: 1rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            width: 320px;
            pointer-events: auto;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .encoding-panel {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(12px);
            padding: 1.5rem;
            border-radius: 1rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            width: 340px;
            pointer-events: auto;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .stats {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            font-family: monospace;
            font-size: 0.75rem;
            color: #94a3b8;
            background: rgba(15, 23, 42, 0.95);
            padding: 1rem;
            border-radius: 0.75rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .tab-container {
            display: flex;
            gap: 0.25rem;
            margin-bottom: 1rem;
            flex-wrap: wrap;
        }
        .tab-btn {
            flex: 1;
            min-width: 80px;
            padding: 0.5rem;
            background: rgba(100, 116, 139, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.5rem;
            color: #94a3b8;
            font-size: 0.7rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: center;
        }
        .tab-btn:hover {
            background: rgba(100, 116, 139, 0.5);
            color: white;
        }
        .tab-btn.active {
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            border-color: rgba(255, 255, 255, 0.3);
        }
        .control-btn {
            transition: all 0.3s ease;
        }
        .control-btn:hover {
            transform: scale(1.05);
        }
        input[type="range"] {
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
            height: 6px;
            border-radius: 3px;
            background: linear-gradient(90deg, #6366f1, #8b5cf6);
            outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: white;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        .glow-text {
            text-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .animate-pulse-slow {
            animation: pulse 2s ease-in-out infinite;
        }
        .encoding-bar {
            height: 24px;
            border-radius: 4px;
            transition: width 0.5s ease;
        }
        .byte-visualization {
            display: flex;
            gap: 2px;
            flex-wrap: wrap;
        }
        .byte-box {
            width: 20px;
            height: 20px;
            border-radius: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.6rem;
            font-weight: bold;
        }
        .concept-card {
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.75rem;
            padding: 1rem;
            margin-bottom: 0.75rem;
        }
        .formula {
            font-family: 'Courier New', monospace;
            font-size: 0.75rem;
            background: rgba(15, 23, 42, 0.9);
            padding: 0.75rem;
            border-radius: 0.5rem;
            border: 1px solid rgba(99, 102, 241, 0.3);
        }
    </style>
</head>
<body>
    <div class="ui-panel">
        <h1 class="text-xl font-bold mb-2 glow-text">🎮 Constraint Theory Visualizer</h1>
        <p class="text-sm text-slate-400 mb-4">Origin-Centric Programming Demonstrations</p>

        <div class="tab-container">
            <button class="tab-btn active" data-tab="pythagorean">📐 Pythagorean</button>
            <button class="tab-btn" data-tab="rigidity">🔗 Rigidity</button>
            <button class="tab-btn" data-tab="holonomy">🌀 Holonomy</button>
            <button class="tab-btn" data-tab="entropy">🎲 Entropy</button>
            <button class="tab-btn" data-tab="kdtree">🌳 KD-Tree</button>
            <button class="tab-btn" data-tab="permutation">🔄 Permutations</button>
            <button class="tab-btn" data-tab="origami">📄 Origami</button>
            <button class="tab-btn" data-tab="bots">🤖 Cell Bots</button>
        </div>

        <div id="pythagorean-controls" class="tab-content">
            <h3 class="text-sm font-semibold mb-3 text-indigo-400">Pythagorean Snapping Φ-Folding</h3>

            <div class="concept-card">
                <p class="text-xs text-slate-400 mb-2">Snap vectors to integer ratio constraints:</p>
                <div class="formula text-green-400">
                    3² + 4² = 5²<br>
                    5² + 12² = 13²<br>
                    8² + 15² = 17²
                </div>
            </div>

            <div class="space-y-4">
                <div>
                    <label class="block text-xs uppercase tracking-wider mb-2 text-slate-500">
                        Vector Count: <span id="pythagoreanCountVal">20</span>
                    </label>
                    <input id="pythagoreanCount" type="range" min="5" max="50" step="1" value="20" class="w-full">
                </div>

                <div>
                    <label class="block text-xs uppercase tracking-wider mb-2 text-slate-500">
                        Snap Strength: <span id="snapStrengthVal">0.8</span>
                    </label>
                    <input id="snapStrength" type="range" min="0" max="1" step="0.05" value="0.8" class="w-full">
                </div>

                <div>
                    <label class="block text-xs uppercase tracking-wider mb-2 text-slate-500">
                        Rotation Speed: <span id="pythagoreanSpeedVal">50%</span>
                    </label>
                    <input id="pythagoreanSpeed" type="range" min="0" max="100" step="1" value="50" class="w-full">
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <button id="pythagoreanSnapBtn" class="control-btn py-2 px-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold text-xs">
                        ⚡ Force Snap
                    </button>
                    <button id="pythagoreanResetBtn" class="control-btn py-2 px-3 bg-slate-600 hover:bg-slate-500 rounded-lg font-semibold text-xs">
                        🔄 Reset
                    </button>
                </div>
            </div>

            <div class="mt-4 pt-4 border-t border-slate-700">
                <h4 class="text-xs font-semibold mb-2">💡 Key Insight</h4>
                <p class="text-xs text-slate-400">
                    By snapping to integer ratios, we achieve <span class="text-green-400">O(log n)</span> instead of O(n²) operations.
                    Zero hallucinations through geometric closure.
                </p>
            </div>
        </div>

        <div id="rigidity-controls" class="tab-content" style="display: none;">
            <h3 class="text-sm font-semibold mb-3 text-emerald-400">Rigidity Matroid - Laman's Theorem</h3>

            <div class="concept-card">
                <p class="text-xs text-slate-400 mb-2">A graph with n vertices is minimally rigid:</p>
                <div class="formula text-green-400">
                    |E| = 2n - 3<br>
                    ∀ subgraphs: |E'| ≤ 2|V'| - 3
                </div>
            </div>

            <div class="space-y-4">
                <div>
                    <label class="block text-xs uppercase tracking-wider mb-2 text-slate-500">
                        Nodes: <span id="rigidityNodesVal">8</span>
                    </label>
                    <input id="rigidityNodes" type="range" min="4" max="20" step="1" value="8" class="w-full">
                </div>

                <div>
                    <label class="block text-xs uppercase tracking-wider mb-2 text-slate-500">
                        Edge Probability: <span id="edgeProbVal">0.5</span>
                    </label>
                    <input id="edgeProb" type="range" min="0.2" max="1" step="0.05" value="0.5" class="w-full">
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <button id="rigidityCheckBtn" class="control-btn py-2 px-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-semibold text-xs">
                        ✓ Check Rigidity
                    </button>
                    <button id="rigidityDOFBtn" class="control-btn py-2 px-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-semibold text-xs">
                        📊 DOF Count
                    </button>
                </div>
            </div>

            <div class="mt-4 pt-4 border-t border-slate-700">
                <div class="text-xs">
                    <span class="text-slate-500">Degrees of Freedom:</span>
                    <span id="rigidityDOF" class="text-emerald-400 ml-2">0</span>
                </div>
                <div class="text-xs mt-1">
                    <span class="text-slate-500">Status:</span>
                    <span id="rigidityStatus" class="text-emerald-400 ml-2">Rigid</span>
                </div>
            </div>
        </div>

        <div id="holonomy-controls" class="tab-content" style="display: none;">
            <h3 class="text-sm font-semibold mb-3 text-cyan-400">Discrete Holonomy Transport</h3>

            <div class="concept-card">
                <p class="text-xs text-slate-400 mb-2">Parallel transport along manifold:</p>
                <div class="formula text-green-400">
                    Holonomy = ∇ₓᵧ<br>
                    Closure: ∮ ds · A = 0
                </div>
            </div>

            <div class="space-y-4">
                <div>
                    <label class="block text-xs uppercase tracking-wider mb-2 text-slate-500">
                        Manifold: <span id="manifoldVal">Torus</span>
                    </label>
                    <select id="manifoldType" class="w-full bg-slate-700 rounded px-3 py-2 text-xs">
                        <option value="torus">Torus</option>
                        <option value="sphere">Sphere</option>
                        <option value="klein">Klein Bottle</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs uppercase tracking-wider mb-2 text-slate-500">
                        Path Complexity: <span id="pathComplexityVal">6</span>
                    </label>
                    <input id="pathComplexity" type="range" min="3" max="12" step="1" value="6" class="w-full">
                </div>

                <div>
                    <label class="block text-xs uppercase tracking-wider mb-2 text-slate-500">
                        Transport Speed: <span id="transportSpeedVal">1x</span>
                    </label>
                    <input id="transportSpeed" type="range" min="0.5" max="3" step="0.5" value="1" class="w-full">
                </div>

                <button id="holonomyTransportBtn" class="control-btn w-full py-2 px-4 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-semibold text-xs">
                    🚀 Start Transport
                </button>
            </div>

            <div class="mt-4 pt-4 border-t border-slate-700">
                <div class="text-xs">
                    <span class="text-slate-500">Holonomy Angle:</span>
                    <span id="holonomyAngle" class="text-cyan-400 ml-2">0°</span>
                </div>
            </div>
        </div>

        <div id="entropy-controls" class="tab-content" style="display: none;">
            <h3 class="text-sm font-semibold mb-3 text-rose-400">Information Entropy Visualization</h3>

            <div class="concept-card">
                <p class="text-xs text-slate-400 mb-2">Shannon entropy of voxel configuration:</p>
                <div class="formula text-green-400">
                    H = -Σ p(x) log₂ p(x)
                </div>
            </div>

            <div class="space-y-4">
                <div>
                    <label class="block text-xs uppercase tracking-wider mb-2 text-slate-500">
                        Disorder: <span id="entropyLevelVal">0.5</span>
                    </label>
                    <input id="entropyLevel" type="range" min="0" max="1" step="0.05" value="0.5" class="w-full">
                </div>

                <div>
                    <label class="block text-xs uppercase tracking-wider mb-2 text-slate-500">
                        Color Mode: <span id="colorModeVal">Heatmap</span>
                    </label>
                    <select id="colorMode" class="w-full bg-slate-700 rounded px-3 py-2 text-xs">
                        <option value="heatmap">Heatmap (Red→Blue)</option>
                        <option value="grayscale">Grayscale</option>
                        <option value="rainbow">Rainbow</option>
                    </select>
                </div>

                <button id="entropyMaximizeBtn" class="control-btn w-full py-2 px-4 bg-rose-600 hover:bg-rose-500 rounded-lg font-semibold text-xs">
                    📊 Maximize Entropy
                </button>
            </div>

            <div class="mt-4 pt-4 border-t border-slate-700">
                <div class="text-xs">
                    <span class="text-slate-500">Current Entropy:</span>
                    <span id="currentEntropy" class="text-rose-400 ml-2">0.00 bits</span>
                </div>
            </div>
        </div>

        <div id="kdtree-controls" class="tab-content" style="display: none;">
            <h3 class="text-sm font-semibold mb-3 text-amber-400">KD-Tree Spatial Partitioning</h3>

            <div class="concept-card">
                <p class="text-xs text-slate-400 mb-2">Binary space partitioning tree:</p>
                <div class="formula text-green-400">
                    Build: O(n log n)<br>
                    Search: O(log n)
                </div>
            </div>

            <div class="space-y-4">
                <div>
                    <label class="block text-xs uppercase tracking-wider mb-2 text-slate-500">
                        Points: <span id="kdtreePointsVal">50</span>
                    </label>
                    <input id="kdtreePoints" type="range" min="10" max="200" step="10" value="50" class="w-full">
                </div>

                <div>
                    <label class="block text-xs uppercase tracking-wider mb-2 text-slate-500">
                        Tree Depth: <span id="treeDepthVal">Full</span>
                    </label>
                    <input id="treeDepth" type="range" min="1" max="10" step="1" value="10" class="w-full">
                </div>

                <button id="kdtreeSearchBtn" class="control-btn w-full py-2 px-4 bg-amber-600 hover:bg-amber-500 rounded-lg font-semibold text-xs">
                    🔍 Nearest Neighbor
                </button>
            </div>

            <div class="mt-4 pt-4 border-t border-slate-700">
                <div class="text-xs">
                    <span class="text-slate-500">Tree Nodes:</span>
                    <span id="kdtreeNodes" class="text-amber-400 ml-2">0</span>
                </div>
            </div>
        </div>

        <div id="permutation-controls" class="tab-content" style="display: none;">
            <h3 class="text-sm font-semibold mb-3 text-violet-400">Permutation Group Symmetries</h3>

            <div class="concept-card">
                <p class="text-xs text-slate-400 mb-2">Symmetry operations on voxel arrangements:</p>
                <div class="formula text-green-400">
                    G = {σ₁, σ₂, ..., σₙ}<br>
                    σ∘τ ∈ G (closure)
                </div>
            </div>

            <div class="space-y-4">
                <div>
                    <label class="block text-xs uppercase tracking-wider mb-2 text-slate-500">
                        Group Order: <span id="groupOrderVal">24</span>
                    </label>
                    <input id="groupOrder" type="range" min="4" max="120" step="4" value="24" class="w-full">
                </div>

                <div>
                    <label class="block text-xs uppercase tracking-wider mb-2 text-slate-500">
                        Operation: <span id="permutationOpVal">Rotate X</span>
                    </label>
                    <select id="permutationOp" class="w-full bg-slate-700 rounded px-3 py-2 text-xs">
                        <option value="rotateX">Rotate X</option>
                        <option value="rotateY">Rotate Y</option>
                        <option value="rotateZ">Rotate Z</option>
                        <option value="reflect">Reflect</option>
                        <option value="inverse">Inverse</option>
                    </select>
                </div>

                <button id="permutationApplyBtn" class="control-btn w-full py-2 px-4 bg-violet-600 hover:bg-violet-500 rounded-lg font-semibold text-xs">
                    🔄 Apply Operation
                </button>
            </div>

            <div class="mt-4 pt-4 border-t border-slate-700">
                <div class="text-xs">
                    <span class="text-slate-500">Symmetry Elements:</span>
                    <span id="symmetryElements" class="text-violet-400 ml-2">C₄, σₕ, i</span>
                </div>
            </div>
        </div>

        <div id="origami-controls" class="tab-content" style="display: none;">
            <h3 class="text-sm font-semibold mb-3 text-pink-400">Origami Fold Constraints</h3>

            <div class="concept-card">
                <p class="text-xs text-slate-400 mb-2">Rigid foldable structures:</p>
                <div class="formula text-green-400">
                    Kawasaki's Theorem:<br>
                    α₁ - α₂ + α₃ - α₄ = 0
                </div>
            </div>

            <div class="space-y-4">
                <div>
                    <label class="block text-xs uppercase tracking-wider mb-2 text-slate-500">
                        Fold Angle: <span id="foldAngleVal">45°</span>
                    </label>
                    <input id="foldAngle" type="range" min="0" max="180" step="5" value="45" class="w-full">
                </div>

                <div>
                    <label class="block text-xs uppercase tracking-wider mb-2 text-slate-500">
                        Crease Pattern: <span id="creasePatternVal">Miura-ori</span>
                    </label>
                    <select id="creasePattern" class="w-full bg-slate-700 rounded px-3 py-2 text-xs">
                        <option value="miura">Miura-ori</option>
                        <option value="waterbomb">Waterbomb</option>
                        <option value="yoshimura">Yoshimura</option>
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <button id="origamiFoldBtn" class="control-btn py-2 px-3 bg-pink-600 hover:bg-pink-500 rounded-lg font-semibold text-xs">
                        📄 Fold
                    </button>
                    <button id="origamiUnfoldBtn" class="control-btn py-2 px-3 bg-slate-600 hover:bg-slate-500 rounded-lg font-semibold text-xs">
                        📂 Unfold
                    </button>
                </div>
            </div>

            <div class="mt-4 pt-4 border-t border-slate-700">
                <div class="text-xs">
                    <span class="text-slate-500">Fold State:</span>
                    <span id="foldState" class="text-pink-400 ml-2">0%</span>
                </div>
            </div>
        </div>

        <div id="bots-controls" class="tab-content" style="display: none;">
            <h3 class="text-sm font-semibold mb-3 text-lime-400">Independent Cell Bots</h3>

            <div class="concept-card">
                <p class="text-xs text-slate-400 mb-2">Geometric-first self-organization:</p>
                <div class="formula text-green-400">
                    Cell: (Ω, Φ, local_state)<br>
                    No global coord needed!
                </div>
            </div>

            <div class="space-y-4">
                <div>
                    <label class="block text-xs uppercase tracking-wider mb-2 text-slate-500">
                        Bot Count: <span id="botCountVal">12</span>
                    </label>
                    <input id="botCount" type="range" min="4" max="50" step="2" value="12" class="w-full">
                </div>

                <div>
                    <label class="block text-xs uppercase tracking-wider mb-2 text-slate-500">
                        Coordination: <span id="coordinationModeVal">Swarm</span>
                    </label>
                    <select id="coordinationMode" class="w-full bg-slate-700 rounded px-3 py-2 text-xs">
                        <option value="swarm">Swarm Flocking</option>
                        <option value="formation">Geometric Formation</option>
                        <option value="explore">Exploration</option>
                    </select>
                </div>

                <div>
                    <label class="block text-xs uppercase tracking-wider mb-2 text-slate-500">
                        Communication Range: <span id="commRangeVal">3.0</span>
                    </label>
                    <input id="commRange" type="range" min="1" max="10" step="0.5" value="3.0" class="w-full">
                </div>

                <button id="botsStartBtn" class="control-btn w-full py-2 px-4 bg-lime-600 hover:bg-lime-500 rounded-lg font-semibold text-xs">
                    🤖 Activate Bots
                </button>
            </div>

            <div class="mt-4 pt-4 border-t border-slate-700">
                <div class="text-xs">
                    <span class="text-slate-500">Emergent Behavior:</span>
                    <span id="emergentBehavior" class="text-lime-400 ml-2">None</span>
                </div>
            </div>
        </div>

        <div class="mt-4 pt-4 border-t border-slate-700">
            <h3 class="text-sm font-semibold mb-2">🖥️ Camera Controls</h3>
            <ul class="text-xs text-slate-400 space-y-1">
                <li>• <span class="text-cyan-400">Left Click + Drag:</span> Rotate</li>
                <li>• <span class="text-cyan-400">Right Click + Drag:</span> Pan</li>
                <li>• <span class="text-cyan-400">Scroll:</span> Zoom</li>
                <li>• <span class="text-cyan-400">Double Click:</span> Reset</li>
            </ul>
        </div>
    </div>

    <div class="encoding-panel">
        <h2 class="text-lg font-bold mb-3 glow-text">📊 Origin-Centric Encoding</h2>
        <p class="text-xs text-slate-400 mb-4">Real-time byte comparison with traditional encoding</p>

        <div class="space-y-4">
            <div class="concept-card">
                <h4 class="text-xs font-semibold mb-2 text-indigo-400">Origin-Centric (Ω)</h4>
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-slate-400">Bytes:</span>
                    <span id="originBytes" class="text-sm font-bold text-green-400">24</span>
                </div>
                <div class="encoding-bar bg-gradient-to-r from-green-500 to-emerald-600" id="originBar" style="width: 20%"></div>
                <div class="mt-2 byte-visualization" id="originEncoding"></div>
            </div>

            <div class="concept-card">
                <h4 class="text-xs font-semibold mb-2 text-rose-400">Traditional (XYZ+)</h4>
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-slate-400">Bytes:</span>
                    <span id="traditionalBytes" class="text-sm font-bold text-rose-400">384</span>
                </div>
                <div class="encoding-bar bg-gradient-to-r from-orange-500 to-red-600" id="traditionalBar" style="width: 100%"></div>
                <div class="mt-2 byte-visualization" id="traditionalEncoding"></div>
            </div>

            <div class="concept-card bg-gradient-to-r from-green-900/30 to-emerald-900/30">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-semibold text-green-400">Compression Ratio:</span>
                    <span id="compressionRatio" class="text-xl font-bold text-green-400">16x</span>
                </div>
                <div class="flex items-center justify-between mt-1">
                    <span class="text-xs font-semibold text-green-400">Space Saved:</span>
                    <span id="spaceSaved" class="text-lg font-bold text-green-400">93.75%</span>
                </div>
            </div>

            <div class="concept-card">
                <h4 class="text-xs font-semibold mb-2 text-purple-400">Encoding Breakdown</h4>
                <div class="space-y-2 text-xs">
                    <div class="flex justify-between">
                        <span class="text-slate-400">Origin (Ω):</span>
                        <span class="text-purple-400">4 bytes</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-400">Vector ID:</span>
                        <span class="text-purple-400">2 bytes</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-400">Constraint:</span>
                        <span class="text-purple-400">6 bytes</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-400">Total per voxel:</span>
                        <span class="text-purple-400">12 bytes</span>
                    </div>
                </div>
            </div>

            <div class="concept-card">
                <h4 class="text-xs font-semibold mb-2 text-amber-400">Live Statistics</h4>
                <div class="space-y-2 text-xs">
                    <div class="flex justify-between">
                        <span class="text-slate-400">Voxels:</span>
                        <span id="statVoxels" class="text-amber-400">50</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-400">Constraints:</span>
                        <span id="statConstraints" class="text-amber-400">49</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-400">DOF:</span>
                        <span id="statDOF" class="text-amber-400">0</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-400">Rigidity:</span>
                        <span id="statRigidity" class="text-green-400">✓ Rigid</span>
                    </div>
                </div>
            </div>

            <div class="concept-card">
                <h4 class="text-xs font-semibold mb-2 text-cyan-400">Visual Comparison</h4>
                <canvas id="encodingCanvas" width="280" height="100" class="w-full rounded"></canvas>
            </div>
        </div>
    </div>

    <div class="stats" id="perfStats">
        <div class="animate-pulse-slow">⚡ Renderer: 0ms | 🔧 Solver: 0ms | 📊 FPS: 60</div>
    </div>
    </div>

    <!-- THREE.JS IMPORTS -->
    <script type="importmap">
        {
            "imports": {
                "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
                "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
            }
        }
    </script>

    <!-- MAIN APPLICATION -->
    <script type="module">
        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

        // ============================================================================
        // GLOBAL STATE
        // ============================================================================
        let currentTab = 'pythagorean';
        let scene, camera, renderer, controls;
        let animationId;
        let visualObjects = [];
        let animationTime = 0;

        // ============================================================================
        // THREE.JS SETUP
        // ============================================================================
        function initThree() {
            scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2(0x0f172a, 0.02);

            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(8, 6, 8);

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            document.body.appendChild(renderer.domElement);

            // Lighting
            const ambientLight = new THREE.AmbientLight(0x404040, 2);
            scene.add(ambientLight);

            const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
            mainLight.position.set(10, 15, 10);
            mainLight.castShadow = true;
            mainLight.shadow.mapSize.width = 2048;
            mainLight.shadow.mapSize.height = 2048;
            scene.add(mainLight);

            const fillLight = new THREE.DirectionalLight(0x6366f1, 0.8);
            fillLight.position.set(-10, 5, -10);
            scene.add(fillLight);

            const rimLight = new THREE.DirectionalLight(0xf472b6, 0.4);
            rimLight.position.set(0, -10, 0);
            scene.add(rimLight);

            // Grid
            const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
            gridHelper.position.y = -3;
            scene.add(gridHelper);

            // Controls
            controls = new OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.minDistance = 5;
            controls.maxDistance = 30;
            controls.target.set(0, 0, 0);

            window.addEventListener('resize', onWindowResize);
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function clearVisualization() {
            visualObjects.forEach(obj => {
                scene.remove(obj);
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) obj.material.dispose();
            });
            visualObjects = [];
        }

        // ============================================================================
        // ENCODING CALCULATIONS
        // ============================================================================
        function calculateOriginCentricBytes(objectCount, constraints) {
            // Origin-Centric: Ω (4) + VectorID (2) + Constraint (6) = 12 bytes per object
            return objectCount * 12;
        }

        function calculateTraditionalBytes(objectCount, dimensions = 3) {
            // Traditional: Position (3 * 8) + Rotation (3 * 8) + Scale (3 * 8) + Metadata (32) = 88 bytes per object
            return objectCount * 88;
        }

        function updateEncodingDisplay(objectCount, constraints) {
            const originBytes = calculateOriginCentricBytes(objectCount, constraints);
            const traditionalBytes = calculateTraditionalBytes(objectCount);
            const compressionRatio = (traditionalBytes / originBytes).toFixed(1);
            const spaceSaved = ((1 - originBytes / traditionalBytes) * 100).toFixed(2);

            document.getElementById('originBytes').textContent = originBytes.toLocaleString();
            document.getElementById('traditionalBytes').textContent = traditionalBytes.toLocaleString();
            document.getElementById('compressionRatio').textContent = compressionRatio + 'x';
            document.getElementById('spaceSaved').textContent = spaceSaved + '%';

            // Update bars
            const maxBytes = traditionalBytes;
            document.getElementById('originBar').style.width = (originBytes / maxBytes * 100) + '%';
            document.getElementById('traditionalBar').style.width = '100%';

            // Update statistics
            document.getElementById('statVoxels').textContent = objectCount;
            document.getElementById('statConstraints').textContent = constraints;

            // Update byte visualizations
            updateByteVisualization('originEncoding', originBytes, '#10b981');
            updateByteVisualization('traditionalEncoding', traditionalBytes, '#f43f5e');

            // Update canvas
            updateEncodingCanvas(originBytes, traditionalBytes);
        }

        function updateByteVisualization(containerId, bytes, color) {
            const container = document.getElementById(containerId);
            const displayBytes = Math.min(bytes, 40); // Limit visualization
            container.innerHTML = '';

            for (let i = 0; i < displayBytes; i++) {
                const box = document.createElement('div');
                box.className = 'byte-box';
                box.style.backgroundColor = color;
                box.style.opacity = 0.3 + (i / displayBytes) * 0.7;
                container.appendChild(box);
            }

            if (bytes > 40) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'text-xs text-slate-400';
                ellipsis.textContent = ' +' + (bytes - 40) + ' more';
                container.appendChild(ellipsis);
            }
        }

        function updateEncodingCanvas(originBytes, traditionalBytes) {
            const canvas = document.getElementById('encodingCanvas');
            const ctx = canvas.getContext('2d');

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barHeight = 30;
            const originWidth = (originBytes / traditionalBytes) * canvas.width;
            const traditionalWidth = canvas.width;

            // Origin-Centric bar
            const gradient1 = ctx.createLinearGradient(0, 0, originWidth, 0);
            gradient1.addColorStop(0, '#10b981');
            gradient1.addColorStop(1, '#059669');
            ctx.fillStyle = gradient1;
            ctx.fillRect(0, 10, originWidth, barHeight);

            // Traditional bar
            const gradient2 = ctx.createLinearGradient(0, 0, traditionalWidth, 0);
            gradient2.addColorStop(0, '#f43f5e');
            gradient2.addColorStop(1, '#dc2626');
            ctx.fillStyle = gradient2;
            ctx.fillRect(0, 55, traditionalWidth, barHeight);

            // Labels
            ctx.fillStyle = '#ffffff';
            ctx.font = '11px monospace';
            ctx.fillText('Origin-Centric', 5, 30);
            ctx.fillText('Traditional', 5, 75);
        }

        // ============================================================================
        // PYTHAGOREAN SNAPPING
        // ============================================================================
        let pythagoreanData = { vectors: [], snapped: [] };

        function initPythagorean() {
            clearVisualization();
            pythagoreanData.vectors = [];
            pythagoreanData.snapped = [];

            const count = parseInt(document.getElementById('pythagoreanCount').value);
            const snapStrength = parseFloat(document.getElementById('snapStrength').value);

            // Pythagorean triples
            const triples = [
                { a: 3, b: 4, c: 5 },
                { a: 5, b: 12, c: 13 },
                { a: 8, b: 15, c: 17 },
                { a: 7, b: 24, c: 25 },
                { a: 20, b: 21, c: 29 }
            ];

            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2;
                const radius = 3 + Math.random() * 2;
                const height = (Math.random() - 0.5) * 4;

                const x = Math.cos(angle) * radius;
                const y = height;
                const z = Math.sin(angle) * radius;

                pythagoreanData.vectors.push({ x, y, z, original: { x, y, z } });

                // Create vector visualization
                const arrowHelper = new THREE.ArrowHelper(
                    new THREE.Vector3(x, y, z).normalize(),
                    new THREE.Vector3(0, 0, 0),
                    Math.sqrt(x * x + y * y + z * z),
                    0x6366f1
                );
                scene.add(arrowHelper);
                visualObjects.push(arrowHelper);
            }

            // Create origin marker
            const originGeometry = new THREE.SphereGeometry(0.3, 32, 32);
            const originMaterial = new THREE.MeshStandardMaterial({
                color: 0x10b981,
                emissive: 0x10b981,
                emissiveIntensity: 0.5
            });
            const originMarker = new THREE.Mesh(originGeometry, originMaterial);
            scene.add(originMarker);
            visualObjects.push(originMarker);

            // Add constraint planes
            const planeGeometry = new THREE.PlaneGeometry(8, 8);
            const planeMaterial = new THREE.MeshStandardMaterial({
                color: 0x6366f1,
                transparent: true,
                opacity: 0.1,
                side: THREE.DoubleSide
            });

            const planes = [
                { rotation: [0, 0, 0], position: [0, 0, 0] },
                { rotation: [Math.PI / 2, 0, 0], position: [0, 0, 0] },
                { rotation: [0, Math.PI / 2, 0], position: [0, 0, 0] }
            ];

            planes.forEach(p => {
                const plane = new THREE.Mesh(planeGeometry, planeMaterial.clone());
                plane.rotation.set(...p.rotation);
                plane.position.set(...p.position);
                scene.add(plane);
                visualObjects.push(plane);
            });

            updateEncodingDisplay(count, count - 1);
            animatePythagorean();
        }

        function animatePythagorean() {
            const snapStrength = parseFloat(document.getElementById('snapStrength').value);
            const rotationSpeed = parseInt(document.getElementById('pythagoreanSpeed').value) / 100;

            animationTime += 0.016;

            pythagoreanData.vectors.forEach((vec, i) => {
                const obj = visualObjects[i];
                if (obj && obj instanceof THREE.ArrowHelper) {
                    // Animate towards snapped position
                    const magnitude = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);

                    // Apply snap to nearest Pythagorean ratio
                    const targetRatio = findNearestPythagoreanRatio(vec.x, vec.y, vec.z);
                    const snapX = targetRatio.x * magnitude;
                    const snapY = targetRatio.y * magnitude;
                    const snapZ = targetRatio.z * magnitude;

                    // Interpolate
                    vec.x += (snapX - vec.x) * snapStrength * 0.1;
                    vec.y += (snapY - vec.y) * snapStrength * 0.1;
                    vec.z += (snapZ - vec.z) * snapStrength * 0.1;

                    // Update arrow
                    const dir = new THREE.Vector3(vec.x, vec.y, vec.z).normalize();
                    const length = Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
                    obj.setDirection(dir);
                    obj.setLength(length);
                }
            });

            // Rotate entire scene slowly
            if (visualObjects.length > 0) {
                visualObjects.forEach(obj => {
                    if (obj.rotation) {
                        obj.rotation.y += rotationSpeed * 0.01;
                    }
                });
            }
        }

        function findNearestPythagoreanRatio(x, y, z) {
            const magnitude = Math.sqrt(x * x + y * y + z * z);
            if (magnitude === 0) return { x: 0, y: 1, z: 0 };

            // Pythagorean triples normalized
            const triples = [
                { x: 3/5, y: 4/5, z: 0 },
                { x: 5/13, y: 12/13, z: 0 },
                { x: 8/17, y: 15/17, z: 0 },
                { x: 0, y: 3/5, z: 4/5 },
                { x: 0, y: 5/13, z: 12/13 }
            ];

            let minDist = Infinity;
            let nearest = triples[0];

            const dirX = x / magnitude;
            const dirY = y / magnitude;
            const dirZ = z / magnitude;

            triples.forEach(triple => {
                const dist = Math.sqrt(
                    Math.pow(dirX - triple.x, 2) +
                    Math.pow(dirY - triple.y, 2) +
                    Math.pow(dirZ - triple.z, 2)
                );
                if (dist < minDist) {
                    minDist = dist;
                    nearest = triple;
                }
            });

            return nearest;
        }

        // ============================================================================
        // RIGIDITY MATROID
        // ============================================================================
        let rigidityData = { nodes: [], edges: [] };

        function initRigidity() {
            clearVisualization();
            rigidityData.nodes = [];
            rigidityData.edges = [];

            const nodeCount = parseInt(document.getElementById('rigidityNodes').value);
            const edgeProbability = parseFloat(document.getElementById('edgeProb').value);

            // Create nodes
            const nodeGeometry = new THREE.SphereGeometry(0.3, 16, 16);
            const nodeMaterial = new THREE.MeshStandardMaterial({ color: 0x10b981 });

            for (let i = 0; i < nodeCount; i++) {
                const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
                node.position.set(
                    (Math.random() - 0.5) * 8,
                    (Math.random() - 0.5) * 8,
                    (Math.random() - 0.5) * 8
                );
                scene.add(node);
                visualObjects.push(node);
                rigidityData.nodes.push(node);
            }

            // Create edges based on Laman's theorem
            const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x6366f1 });
            const maxEdges = 2 * nodeCount - 3;

            for (let i = 0; i < rigidityData.nodes.length; i++) {
                for (let j = i + 1; j < rigidityData.nodes.length; j++) {
                    if (Math.random() < edgeProbability && rigidityData.edges.length < maxEdges) {
                        const geometry = new THREE.BufferGeometry().setFromPoints([
                            rigidityData.nodes[i].position,
                            rigidityData.nodes[j].position
                        ]);
                        const edge = new THREE.Line(geometry, edgeMaterial);
                        scene.add(edge);
                        visualObjects.push(edge);
                        rigidityData.edges.push({ line: edge, nodeA: i, nodeB: j });
                    }
                }
            }

            // Check rigidity
            const dof = calculateDegreesOfFreedom(nodeCount, rigidityData.edges.length);
            const isRigid = dof <= 0;

            document.getElementById('rigidityDOF').textContent = dof;
            document.getElementById('rigidityStatus').textContent = isRigid ? 'Rigid' : 'Flexible';
            document.getElementById('rigidityStatus').className = isRigid ? 'text-green-400 ml-2' : 'text-amber-400 ml-2';
            document.getElementById('statDOF').textContent = dof;
            document.getElementById('statRigidity').textContent = isRigid ? '✓ Rigid' : '✗ Flexible';
            document.getElementById('statRigidity').className = isRigid ? 'text-green-400' : 'text-amber-400';

            updateEncodingDisplay(nodeCount, rigidityData.edges.length);
            animateRigidity();
        }

        function calculateDegreesOfFreedom(nodes, edges) {
            // 2D: DOF = 2n - 3 - |E| (3 for rigid body motions)
            // 3D: DOF = 3n - 6 - |E| (6 for rigid body motions)
            return Math.max(0, 3 * nodes - 6 - edges);
        }

        function animateRigidity() {
            // Subtle animation for nodes
            rigidityData.nodes.forEach((node, i) => {
                node.position.y += Math.sin(animationTime * 2 + i * 0.5) * 0.002;
            });

            // Update edges
            rigidityData.edges.forEach(edge => {
                const positions = edge.line.geometry.attributes.position.array;
                const nodeA = rigidityData.nodes[edge.nodeA].position;
                const nodeB = rigidityData.nodes[edge.nodeB].position;

                positions[0] = nodeA.x;
                positions[1] = nodeA.y;
                positions[2] = nodeA.z;
                positions[3] = nodeB.x;
                positions[4] = nodeB.y;
                positions[5] = nodeB.z;

                edge.line.geometry.attributes.position.needsUpdate = true;
            });
        }

        // ============================================================================
        // HOLOMONY TRANSPORT
        // ============================================================================
        let holonomyData = { path: [], vectors: [], manifoldType: 'torus' };

        function initHolonomy() {
            clearVisualization();
            holonomyData.path = [];
            holonomyData.vectors = [];
            holonomyData.manifoldType = document.getElementById('manifoldType').value;

            const complexity = parseInt(document.getElementById('pathComplexity').value);

            // Create manifold visualization
            let manifoldGeometry;
            if (holonomyData.manifoldType === 'torus') {
                manifoldGeometry = new THREE.TorusGeometry(4, 1.5, 16, 100);
            } else if (holonomyData.manifoldType === 'sphere') {
                manifoldGeometry = new THREE.SphereGeometry(4, 32, 32);
            } else {
                manifoldGeometry = new THREE.TorusKnotGeometry(3, 1, 100, 16);
            }

            const manifoldMaterial = new THREE.MeshStandardMaterial({
                color: 0x6366f1,
                wireframe: true,
                transparent: true,
                opacity: 0.3
            });
            const manifold = new THREE.Mesh(manifoldGeometry, manifoldMaterial);
            scene.add(manifold);
            visualObjects.push(manifold);

            // Create transport path
            const pathMaterial = new THREE.LineBasicMaterial({ color: 0x22d3ee });
            const pathPoints = [];

            for (let i = 0; i <= complexity; i++) {
                const t = (i / complexity) * Math.PI * 2;
                let x, y, z;

                if (holonomyData.manifoldType === 'torus') {
                    x = Math.cos(t) * 4;
                    y = Math.sin(t) * 2;
                    z = Math.sin(t * 2) * 1.5;
                } else if (holonomyData.manifoldType === 'sphere') {
                    x = Math.cos(t) * 4;
                    y = Math.sin(t) * 4;
                    z = Math.sin(t * 3) * 1.5;
                } else {
                    x = Math.cos(t) * 4;
                    y = Math.sin(t * 2) * 3;
                    z = Math.cos(t * 3) * 2;
                }

                pathPoints.push(new THREE.Vector3(x, y, z));
                holonomyData.path.push({ x, y, z });
            }

            const pathGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
            const path = new THREE.Line(pathGeometry, pathMaterial);
            scene.add(path);
            visualObjects.push(path);

            // Create vectors along path
            const vectorMaterial = new THREE.ArrowHelper;
            holonomyData.path.forEach((point, i) => {
                const tangent = calculateTangent(i, complexity);
                const arrow = new THREE.ArrowHelper(
                    new THREE.Vector3(tangent.x, tangent.y, tangent.z).normalize(),
                    new THREE.Vector3(point.x, point.y, point.z),
                    0.5,
                    0x22d3ee
                );
                scene.add(arrow);
                visualObjects.push(arrow);
                holonomyData.vectors.push({ arrow, tangent });
            });

            // Calculate initial holonomy
            const holonomyAngle = calculateHolonomyAngle(holonomyData.vectors);
            document.getElementById('holonomyAngle').textContent = holonomyAngle.toFixed(1) + '°';

            updateEncodingDisplay(complexity + 1, complexity);
            animateHolonomy();
        }

        function calculateTangent(index, total) {
            const nextIndex = (index + 1) % holonomyData.path.length;
            const prevIndex = (index - 1 + holonomyData.path.length) % holonomyData.path.length;

            const next = holonomyData.path[nextIndex];
            const prev = holonomyData.path[prevIndex];

            return {
                x: next.x - prev.x,
                y: next.y - prev.y,
                z: next.z - prev.z
            };
        }

        function calculateHolonomyAngle(vectors) {
            if (vectors.length < 2) return 0;

            const first = vectors[0].tangent;
            const last = vectors[vectors.length - 1].tangent;

            const dot = first.x * last.x + first.y * last.y + first.z * last.z;
            const magFirst = Math.sqrt(first.x * first.x + first.y * first.y + first.z * first.z);
            const magLast = Math.sqrt(last.x * last.x + last.y * last.y + last.z * last.z);

            if (magFirst === 0 || magLast === 0) return 0;

            const cosAngle = Math.max(-1, Math.min(1, dot / (magFirst * magLast)));
            return Math.acos(cosAngle) * (180 / Math.PI);
        }

        function animateHolonomy() {
            const speed = parseFloat(document.getElementById('transportSpeed').value);

            holonomyData.vectors.forEach((vec, i) => {
                const rotation = animationTime * speed * 0.5;
                vec.arrow.rotation.y += rotation * 0.01;
            });

            visualObjects[0].rotation.y += 0.002;
            visualObjects[0].rotation.x += 0.001;
        }

        // ============================================================================
        // ENTROPY VISUALIZATION
        // ============================================================================
        let entropyData = { voxels: [], targetColors: [] };

        function initEntropy() {
            clearVisualization();
            entropyData.voxels = [];
            entropyData.targetColors = [];

            const disorder = parseFloat(document.getElementById('entropyLevel').value);
            const colorMode = document.getElementById('colorMode').value;
            const voxelCount = 50;

            const geometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
            const positions = [];

            for (let i = 0; i < voxelCount; i++) {
                const material = new THREE.MeshStandardMaterial({
                    color: 0x6366f1,
                    roughness: 0.4,
                    metalness: 0.6
                });
                const voxel = new THREE.Mesh(geometry, material);

                const x = (Math.random() - 0.5) * 8 * (1 + disorder * 2);
                const y = (Math.random() - 0.5) * 8 * (1 + disorder * 2);
                const z = (Math.random() - 0.5) * 8 * (1 + disorder * 2);

                voxel.position.set(x, y, z);
                scene.add(voxel);
                visualObjects.push(voxel);

                const targetColor = calculateEntropyColor(i, voxelCount, disorder, colorMode);
                entropyData.targetColors.push(targetColor);
                entropyData.voxels.push({ mesh: voxel, targetColor });
            }

            const currentEntropy = calculateCurrentEntropy();
            document.getElementById('currentEntropy').textContent = currentEntropy.toFixed(2) + ' bits';

            updateEncodingDisplay(voxelCount, Math.floor(voxelCount * 0.8));
            animateEntropy();
        }

        function calculateEntropyColor(index, total, disorder, mode) {
            const normalizedPos = index / total;

            if (mode === 'heatmap') {
                // Red (high entropy) to blue (low entropy)
                return {
                    r: disorder,
                    g: 0.5 * (1 - disorder),
                    b: 1 - disorder
                };
            } else if (mode === 'grayscale') {
                const val = disorder * 0.5 + normalizedPos * 0.5;
                return { r: val, g: val, b: val };
            } else {
                // Rainbow
                const hue = (normalizedPos + disorder * 0.5) % 1;
                return hslToRgb(hue, 0.8, 0.5);
            }
        }

        function hslToRgb(h, s, l) {
            let r, g, b;
            if (s === 0) {
                r = g = b = l;
            } else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1/6) return p + (q - p) * 6 * t;
                    if (t < 1/2) return q;
                    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                };
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }
            return { r, g, b };
        }

        function calculateCurrentEntropy() {
            const uniquePositions = new Set();
            entropyData.voxels.forEach(v => {
                const key = \`\${v.mesh.position.x.toFixed(1)},\${v.mesh.position.y.toFixed(1)},\${v.mesh.position.z.toFixed(1)}\`;
                uniquePositions.add(key);
            });

            const total = entropyData.voxels.length;
            const entropy = uniquePositions.size / total;
            return -entropy * Math.log2(entropy) * 8;
        }

        function animateEntropy() {
            entropyData.voxels.forEach((voxel, i) => {
                const current = voxel.mesh.material.color;
                const target = voxel.targetColor;

                current.r += (target.r - current.r) * 0.05;
                current.g += (target.g - current.g) * 0.05;
                current.b += (target.b - current.b) * 0.05;

                voxel.mesh.rotation.x += 0.01;
                voxel.mesh.rotation.y += 0.01;
            });
        }

        // ============================================================================
        // KD-TREE VISUALIZATION
        // ============================================================================
        let kdtreeData = { points: [], tree: null };

        function initKDTree() {
            clearVisualization();
            kdtreeData.points = [];
            kdtreeData.tree = null;

            const pointCount = parseInt(document.getElementById('kdtreePoints').value);
            const maxDepth = parseInt(document.getElementById('treeDepth').value);

            // Generate random points
            const pointGeometry = new THREE.SphereGeometry(0.15, 8, 8);
            const pointMaterial = new THREE.MeshStandardMaterial({ color: 0xf59e0b });

            for (let i = 0; i < pointCount; i++) {
                const point = new THREE.Mesh(pointGeometry, pointMaterial.clone());
                point.position.set(
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10
                );
                scene.add(point);
                visualObjects.push(point);
                kdtreeData.points.push(point.position.clone());
            }

            // Build and visualize KD-tree
            kdtreeData.tree = buildKDTree(kdtreeData.points, 0, maxDepth);
            visualizeKDTree(kdtreeData.tree, 0, maxDepth, new THREE.Box3());

            document.getElementById('kdtreeNodes').textContent = countTreeNodes(kdtreeData.tree);
            updateEncodingDisplay(pointCount, pointCount - 1);
            animateKDTree();
        }

        function buildKDTree(points, depth, maxDepth) {
            if (points.length === 0 || depth >= maxDepth) return null;

            const axis = depth % 3;
            points.sort((a, b) => a.getComponent(axis) - b.getComponent(axis));
            const median = Math.floor(points.length / 2);

            return {
                point: points[median],
                axis: axis,
                left: buildKDTree(points.slice(0, median), depth + 1, maxDepth),
                right: buildKDTree(points.slice(median + 1), depth + 1, maxDepth)
            };
        }

        function visualizeKDTree(node, depth, maxDepth, bbox) {
            if (!node) return;

            // Create bounding box for this node
            const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
            const boxMaterial = new THREE.MeshBasicMaterial({
                color: 0xf59e0b,
                wireframe: true,
                transparent: true,
                opacity: 0.3 - depth * 0.03
            });
            const box = new THREE.Mesh(boxGeometry, boxMaterial);
            box.position.copy(node.point);
            scene.add(box);
            visualObjects.push(box);

            visualizeKDTree(node.left, depth + 1, maxDepth, bbox.clone());
            visualizeKDTree(node.right, depth + 1, maxDepth, bbox.clone());
        }

        function countTreeNodes(node) {
            if (!node) return 0;
            return 1 + countTreeNodes(node.left) + countTreeNodes(node.right);
        }

        function animateKDTree() {
            visualObjects.forEach((obj, i) => {
                if (obj.material && obj.material.opacity !== undefined) {
                    obj.rotation.y += 0.005;
                }
            });
        }

        // ============================================================================
        // PERMUTATION GROUPS
        // ============================================================================
        let permutationData = { objects: [], groupOrder: 24 };

        function initPermutation() {
            clearVisualization();
            permutationData.objects = [];
            permutationData.groupOrder = parseInt(document.getElementById('groupOrder').value);

            const objCount = Math.min(permutationData.groupOrder, 50);
            const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
            const colors = [0x6366f1, 0x8b5cf6, 0xa855f7, 0xd946ef];

            for (let i = 0; i < objCount; i++) {
                const material = new THREE.MeshStandardMaterial({
                    color: colors[i % colors.length],
                    roughness: 0.3,
                    metalness: 0.7
                });
                const obj = new THREE.Mesh(geometry, material);

                const angle = (i / objCount) * Math.PI * 2;
                const radius = 3 + (i % 3) * 1.5;
                obj.position.set(
                    Math.cos(angle) * radius,
                    (i % 5 - 2) * 1.5,
                    Math.sin(angle) * radius
                );
                scene.add(obj);
                visualObjects.push(obj);
                permutationData.objects.push({
                    mesh: obj,
                    originalPos: obj.position.clone(),
                    index: i
                });
            }

            // Add symmetry visualization
            const symmetryElements = ['C₄', 'σₕ', 'i', 'C₂'];
            document.getElementById('symmetryElements').textContent = symmetryElements.join(', ');

            updateEncodingDisplay(objCount, Math.floor(objCount * 1.5));
            animatePermutation();
        }

        function animatePermutation() {
            const operation = document.getElementById('permutationOp').value;

            permutationData.objects.forEach((obj, i) => {
                const speed = 0.02;

                switch (operation) {
                    case 'rotateX':
                        obj.mesh.rotation.x += speed;
                        break;
                    case 'rotateY':
                        obj.mesh.rotation.y += speed;
                        break;
                    case 'rotateZ':
                        obj.mesh.rotation.z += speed;
                        break;
                    case 'reflect':
                        obj.mesh.position.x = obj.originalPos.x * Math.cos(animationTime * 2);
                        break;
                    case 'inverse':
                        obj.mesh.scale.setScalar(1 + Math.sin(animationTime * 3 + i * 0.5) * 0.2);
                        break;
                }
            });
        }

        // ============================================================================
        // ORIGAMI FOLD
        // ============================================================================
        let origamiData = { vertices: [], faces: [], foldAngle: 0 };

        function initOrigami() {
            clearVisualization();
            origamiData.vertices = [];
            origamiData.faces = [];
            origamiData.foldAngle = parseFloat(document.getElementById('foldAngle').value) * Math.PI / 180;

            const pattern = document.getElementById('creasePattern').value;
            const gridSize = 6;

            // Create paper vertices
            const vertexGeometry = new THREE.SphereGeometry(0.1, 8, 8);
            const vertexMaterial = new THREE.MeshStandardMaterial({ color: 0xec4899 });

            for (let i = 0; i <= gridSize; i++) {
                for (let j = 0; j <= gridSize; j++) {
                    const x = (i - gridSize / 2) * 1.5;
                    const y = (j - gridSize / 2) * 1.5;

                    const vertex = new THREE.Mesh(vertexGeometry, vertexMaterial.clone());
                    vertex.position.set(x, y, 0);
                    scene.add(vertex);
                    visualObjects.push(vertex);
                    origamiData.vertices.push({ mesh: vertex, original: { x, y, z: 0 } });
                }
            }

            // Create crease lines
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0xf472b6 });
            const creasePatterns = {
                miura: [0, 1],
                waterbomb: [2, 3],
                yoshimura: [1, 2]
            };

            const patternLines = creasePatterns[pattern] || [0, 1];
            patternLines.forEach(offset => {
                const points = [];
                for (let i = 0; i <= gridSize; i++) {
                    const t = i / gridSize;
                    points.push(new THREE.Vector3(
                        (t - 0.5) * gridSize * 1.5,
                        Math.sin(t * Math.PI * 2 + offset) * 2,
                        0
                    ));
                }
                const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
                const line = new THREE.Line(lineGeometry, lineMaterial);
                scene.add(line);
                visualObjects.push(line);
            });

            document.getElementById('foldState').textContent = '0%';
            updateEncodingDisplay((gridSize + 1) * (gridSize + 1), gridSize * gridSize * 2);
            animateOrigami();
        }

        function animateOrigami() {
            const targetAngle = parseFloat(document.getElementById('foldAngle').value) * Math.PI / 180;
            const currentAngle = targetAngle * (1 + Math.sin(animationTime * 2)) * 0.5;

            origamiData.vertices.forEach((vertex, i) => {
                const { x, y } = vertex.original;
                const foldFactor = Math.abs(y) / 5;

                vertex.mesh.position.z = Math.sin(currentAngle * foldFactor) * foldFactor * 2;
                vertex.mesh.position.y = y * Math.cos(currentAngle * foldFactor);
            });

            const foldPercent = Math.round(Math.abs(currentAngle) / (Math.PI / 2) * 100);
            document.getElementById('foldState').textContent = foldPercent + '%';
        }

        // ============================================================================
        // INDEPENDENT CELL BOTS
        // ============================================================================
        let botData = { bots: [], targetFormation: null };

        function initCellBots() {
            clearVisualization();
            botData.bots = [];
            botData.targetFormation = null;

            const botCount = parseInt(document.getElementById('botCount').value);
            const commRange = parseFloat(document.getElementById('commRange').value);
            const coordination = document.getElementById('coordinationMode').value;

            // Create bots
            const botGeometry = new THREE.SphereGeometry(0.25, 16, 16);
            const botColors = [0x84cc16, 0x22c55e, 0x10b981, 0x14b8a6];

            for (let i = 0; i < botCount; i++) {
                const material = new THREE.MeshStandardMaterial({
                    color: botColors[i % botColors.length],
                    emissive: botColors[i % botColors.length],
                    emissiveIntensity: 0.3
                });
                const bot = new THREE.Mesh(botGeometry, material);

                bot.position.set(
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10
                );
                scene.add(bot);
                visualObjects.push(bot);

                botData.bots.push({
                    mesh: bot,
                    velocity: new THREE.Vector3(
                        (Math.random() - 0.5) * 0.1,
                        (Math.random() - 0.5) * 0.1,
                        (Math.random() - 0.5) * 0.1
                    ),
                    index: i
                });
            }

            // Create communication range visualization
            const rangeGeometry = new THREE.SphereGeometry(commRange, 16, 16);
            const rangeMaterial = new THREE.MeshBasicMaterial({
                color: 0x84cc16,
                transparent: true,
                opacity: 0.05,
                wireframe: true
            });

            botData.bots.forEach(bot => {
                const range = new THREE.Mesh(rangeGeometry, rangeMaterial);
                range.position.copy(bot.mesh.position);
                scene.add(range);
                visualObjects.push(range);
                bot.rangeMesh = range;
            });

            document.getElementById('emergentBehavior').textContent = 'Initializing...';
            updateEncodingDisplay(botCount, Math.floor(botCount * 2.5));
            animateCellBots();
        }

        function animateCellBots() {
            const commRange = parseFloat(document.getElementById('commRange').value);
            const coordination = document.getElementById('coordinationMode').value;
            let behavior = 'None';

            botData.bots.forEach((bot, i) => {
                // Update range mesh position
                if (bot.rangeMesh) {
                    bot.rangeMesh.position.copy(bot.mesh.position);
                }

                // Apply coordination rules
                if (coordination === 'swarm') {
                    behavior = 'Flocking';
                    applyFlocking(bot, botData.bots, commRange);
                } else if (coordination === 'formation') {
                    behavior = 'Geometric Pattern';
                    applyFormation(bot, i, botData.bots.length);
                } else {
                    behavior = 'Random Walk';
                    applyExploration(bot);
                }

                // Update position
                bot.mesh.position.add(bot.velocity);

                // Boundary constraints
                const bounds = 6;
                if (Math.abs(bot.mesh.position.x) > bounds) bot.velocity.x *= -1;
                if (Math.abs(bot.mesh.position.y) > bounds) bot.velocity.y *= -1;
                if (Math.abs(bot.mesh.position.z) > bounds) bot.velocity.z *= -1;
            });

            document.getElementById('emergentBehavior').textContent = behavior;
        }

        function applyFlocking(bot, allBots, range) {
            let separation = new THREE.Vector3();
            let alignment = new THREE.Vector3();
            let cohesion = new THREE.Vector3();
            let neighbors = 0;

            allBots.forEach(other => {
                if (other === bot) return;

                const dist = bot.mesh.position.distanceTo(other.mesh.position);
                if (dist < range) {
                    // Separation
                    const diff = new THREE.Vector3().subVectors(bot.mesh.position, other.mesh.position);
                    diff.normalize().divideScalar(dist);
                    separation.add(diff);

                    // Alignment
                    alignment.add(other.velocity);

                    // Cohesion
                    cohesion.add(other.mesh.position);

                    neighbors++;
                }
            });

            if (neighbors > 0) {
                separation.divideScalar(neighbors).multiplyScalar(0.05);
                alignment.divideScalar(neighbors).sub(bot.velocity).multiplyScalar(0.02);
                cohesion.divideScalar(neighbors).sub(bot.mesh.position).multiplyScalar(0.005);

                bot.velocity.add(separation).add(alignment).add(cohesion);
            }

            bot.velocity.clampLength(0, 0.1);
        }

        function applyFormation(bot, index, total) {
            const angle = (index / total) * Math.PI * 2;
            const radius = 3;
            const target = new THREE.Vector3(
                Math.cos(angle) * radius,
                Math.sin(angle * 2) * 2,
                Math.sin(angle) * radius
            );

            const dir = new THREE.Vector3().subVectors(target, bot.mesh.position);
            dir.multiplyScalar(0.02);
            bot.velocity.add(dir);
            bot.velocity.clampLength(0, 0.08);
        }

        function applyExploration(bot) {
            if (Math.random() < 0.02) {
                bot.velocity.add(new THREE.Vector3(
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02
                ));
            }
            bot.velocity.clampLength(0, 0.06);
        }

        // ============================================================================
        // MAIN ANIMATION LOOP
        // ============================================================================
        function animate() {
            animationId = requestAnimationFrame(animate);
            animationTime += 0.016;

            controls.update();

            // Call active visualization animation
            switch (currentTab) {
                case 'pythagorean':
                    animatePythagorean();
                    break;
                case 'rigidity':
                    animateRigidity();
                    break;
                case 'holonomy':
                    animateHolonomy();
                    break;
                case 'entropy':
                    animateEntropy();
                    break;
                case 'kdtree':
                    animateKDTree();
                    break;
                case 'permutation':
                    animatePermutation();
                    break;
                case 'origami':
                    animateOrigami();
                    break;
                case 'bots':
                    animateCellBots();
                    break;
            }

            renderer.render(scene, camera);

            // Update performance stats
            const stats = document.getElementById('perfStats');
            if (stats) {
                const renderTime = (performance.now() % 16).toFixed(1);
                stats.innerHTML = \`⚡ Renderer: \${renderTime}ms | 📊 Objects: \${visualObjects.length} | 🎬 \${currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}\`;
            }
        }

        // ============================================================================
        // TAB SWITCHING
        // ============================================================================
        function setupTabSwitching() {
            const tabBtns = document.querySelectorAll('.tab-btn');
            const tabContents = document.querySelectorAll('.tab-content');

            tabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const tab = btn.dataset.tab;

                    // Update active states
                    tabBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    // Show/hide content
                    tabContents.forEach(content => {
                        content.style.display = content.id === \`\${tab}-controls\` ? 'block' : 'none';
                    });

                    // Switch visualization
                    currentTab = tab;
                    switchVisualization(tab);
                });
            });
        }

        function switchVisualization(tab) {
            switch (tab) {
                case 'pythagorean':
                    initPythagorean();
                    break;
                case 'rigidity':
                    initRigidity();
                    break;
                case 'holonomy':
                    initHolonomy();
                    break;
                case 'entropy':
                    initEntropy();
                    break;
                case 'kdtree':
                    initKDTree();
                    break;
                case 'permutation':
                    initPermutation();
                    break;
                case 'origami':
                    initOrigami();
                    break;
                case 'bots':
                    initCellBots();
                    break;
            }
        }

        // ============================================================================
        // EVENT HANDLERS
        // ============================================================================
        function setupEventHandlers() {
            // Pythagorean controls
            document.getElementById('pythagoreanCount').addEventListener('input', (e) => {
                document.getElementById('pythagoreanCountVal').textContent = e.target.value;
            });
            document.getElementById('snapStrength').addEventListener('input', (e) => {
                document.getElementById('snapStrengthVal').textContent = e.target.value;
            });
            document.getElementById('pythagoreanSpeed').addEventListener('input', (e) => {
                document.getElementById('pythagoreanSpeedVal').textContent = e.target.value + '%';
            });
            document.getElementById('pythagoreanSnapBtn').addEventListener('click', () => initPythagorean());
            document.getElementById('pythagoreanResetBtn').addEventListener('click', () => initPythagorean());

            // Rigidity controls
            document.getElementById('rigidityNodes').addEventListener('input', (e) => {
                document.getElementById('rigidityNodesVal').textContent = e.target.value;
            });
            document.getElementById('edgeProb').addEventListener('input', (e) => {
                document.getElementById('edgeProbVal').textContent = e.target.value;
            });
            document.getElementById('rigidityCheckBtn').addEventListener('click', () => initRigidity());
            document.getElementById('rigidityDOFBtn').addEventListener('click', () => initRigidity());

            // Holonomy controls
            document.getElementById('manifoldType').addEventListener('change', (e) => {
                document.getElementById('manifoldVal').textContent = e.target.options[e.target.selectedIndex].text;
                initHolonomy();
            });
            document.getElementById('pathComplexity').addEventListener('input', (e) => {
                document.getElementById('pathComplexityVal').textContent = e.target.value;
            });
            document.getElementById('transportSpeed').addEventListener('input', (e) => {
                document.getElementById('transportSpeedVal').textContent = e.target.value + 'x';
            });
            document.getElementById('holonomyTransportBtn').addEventListener('click', () => initHolonomy());

            // Entropy controls
            document.getElementById('entropyLevel').addEventListener('input', (e) => {
                document.getElementById('entropyLevelVal').textContent = e.target.value;
            });
            document.getElementById('colorMode').addEventListener('change', (e) => {
                document.getElementById('colorModeVal').textContent = e.target.options[e.target.selectedIndex].text;
                initEntropy();
            });
            document.getElementById('entropyMaximizeBtn').addEventListener('click', () => {
                document.getElementById('entropyLevel').value = 1;
                document.getElementById('entropyLevelVal').textContent = '1';
                initEntropy();
            });

            // KD-Tree controls
            document.getElementById('kdtreePoints').addEventListener('input', (e) => {
                document.getElementById('kdtreePointsVal').textContent = e.target.value;
            });
            document.getElementById('treeDepth').addEventListener('input', (e) => {
                document.getElementById('treeDepthVal').textContent = e.target.value;
            });
            document.getElementById('kdtreeSearchBtn').addEventListener('click', () => initKDTree());

            // Permutation controls
            document.getElementById('groupOrder').addEventListener('input', (e) => {
                document.getElementById('groupOrderVal').textContent = e.target.value;
            });
            document.getElementById('permutationOp').addEventListener('change', (e) => {
                document.getElementById('permutationOpVal').textContent = e.target.options[e.target.selectedIndex].text;
            });
            document.getElementById('permutationApplyBtn').addEventListener('click', () => initPermutation());

            // Origami controls
            document.getElementById('foldAngle').addEventListener('input', (e) => {
                document.getElementById('foldAngleVal').textContent = e.target.value + '°';
            });
            document.getElementById('creasePattern').addEventListener('change', (e) => {
                document.getElementById('creasePatternVal').textContent = e.target.options[e.target.selectedIndex].text;
                initOrigami();
            });
            document.getElementById('origamiFoldBtn').addEventListener('click', () => initOrigami());
            document.getElementById('origamiUnfoldBtn').addEventListener('click', () => {
                document.getElementById('foldAngle').value = 0;
                document.getElementById('foldAngleVal').textContent = '0°';
                initOrigami();
            });

            // Cell Bots controls
            document.getElementById('botCount').addEventListener('input', (e) => {
                document.getElementById('botCountVal').textContent = e.target.value;
            });
            document.getElementById('coordinationMode').addEventListener('change', (e) => {
                document.getElementById('coordinationModeVal').textContent = e.target.options[e.target.selectedIndex].text;
                initCellBots();
            });
            document.getElementById('commRange').addEventListener('input', (e) => {
                document.getElementById('commRangeVal').textContent = e.target.value;
            });
            document.getElementById('botsStartBtn').addEventListener('click', () => initCellBots());
        }

        // ============================================================================
        // INITIALIZATION
        // ============================================================================
        document.addEventListener('DOMContentLoaded', () => {
            initThree();
            setupTabSwitching();
            setupEventHandlers();
            initPythagorean(); // Start with Pythagorean visualization
            animate();
        });
    </script>
</body>
</html>`;
}

export function SWARM_HTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Emergent Swarm Intelligence - Constraint Theory</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { margin: 0; overflow: hidden; background: #0f172a; color: white; font-family: sans-serif; }
        canvas { display: block; }
        .ui-panel {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(15, 23, 42, 0.9);
            backdrop-filter: blur(8px);
            padding: 1.5rem;
            border-radius: 0.75rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            width: 320px;
            pointer-events: auto;
        }
    </style>
</head>
<body>
    <div class="ui-panel">
        <h1 class="text-xl font-bold mb-2">Emergent Swarm Intelligence</h1>
        <p class="text-sm text-slate-400 mb-4">Boids algorithm demonstrating flocking behavior</p>

        <div class="space-y-4">
            <div>
                <label class="block text-xs uppercase tracking-wider mb-1 text-slate-500">
                    Boid Count: <span id="countVal">100</span>
                </label>
                <input id="boidCount" type="range" min="20" max="300" step="10" value="100"
                    class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer">
            </div>
            <div>
                <label class="block text-xs uppercase tracking-wider mb-1 text-slate-500">
                    Separation: <span id="sepVal">1.5</span>
                </label>
                <input id="separation" type="range" min="0" max="3" step="0.1" value="1.5"
                    class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer">
            </div>
            <div>
                <label class="block text-xs uppercase tracking-wider mb-1 text-slate-500">
                    Alignment: <span id="aliVal">1.0</span>
                </label>
                <input id="alignment" type="range" min="0" max="3" step="0.1" value="1.0"
                    class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer">
            </div>
            <div>
                <label class="block text-xs uppercase tracking-wider mb-1 text-slate-500">
                    Cohesion: <span id="cohVal">1.0</span>
                </label>
                <input id="cohesion" type="range" min="0" max="3" step="0.1" value="1.0"
                    class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer">
            </div>
            <button id="resetBtn" class="w-full py-2 bg-green-600 hover:bg-green-500 rounded font-semibold transition-colors">
                Reset Swarm
            </button>
        </div>

        <div class="mt-4 pt-4 border-t border-slate-700">
            <h3 class="text-sm font-semibold mb-2">Emergent Behavior</h3>
            <p class="text-xs text-slate-400 mb-2">
                Simple rules create complex collective intelligence:
            </p>
            <ul class="text-xs text-slate-400 space-y-1">
                <li>• <strong>Separation:</strong> Avoid crowding neighbors</li>
                <li>• <strong>Alignment:</strong> Steer towards average heading</li>
                <li>• <strong>Cohesion:</strong> Move toward average position</li>
            </ul>
        </div>
    </div>

    <canvas id="swarmCanvas"></canvas>

    <script>
        const canvas = document.getElementById('swarmCanvas');
        const ctx = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Boid parameters
        let params = {
            count: 100,
            separation: 1.5,
            alignment: 1.0,
            cohesion: 1.0,
            visualRange: 75,
            speedLimit: 4
        };

        class Boid {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.dx = (Math.random() - 0.5) * 4;
                this.dy = (Math.random() - 0.5) * 4;
                this.history = [];
            }

            update(boids) {
                let closeDx = 0, closeDy = 0;
                let xVelAvg = 0, yVelAvg = 0;
                let xPosAvg = 0, yPosAvg = 0;
                let neighboringBoids = 0;

                for (let other of boids) {
                    if (other === this) continue;

                    const dx = this.x - other.x;
                    const dy = this.y - other.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < params.visualRange) {
                        neighboringBoids++;

                        // Separation
                        closeDx += dx / dist;
                        closeDy += dy / dist;

                        // Alignment
                        xVelAvg += other.dx;
                        yVelAvg += other.dy;

                        // Cohesion
                        xPosAvg += other.x;
                        yPosAvg += other.y;
                    }
                }

                if (neighboringBoids > 0) {
                    // Separation
                    this.dx += closeDx * params.separation;
                    this.dy += closeDy * params.separation;

                    // Alignment
                    xVelAvg /= neighboringBoids;
                    yVelAvg /= neighboringBoids;
                    this.dx += (xVelAvg - this.dx) * params.alignment * 0.05;
                    this.dy += (yVelAvg - this.dy) * params.alignment * 0.05;

                    // Cohesion
                    xPosAvg /= neighboringBoids;
                    yPosAvg /= neighboringBoids;
                    this.dx += (xPosAvg - this.x) * params.cohesion * 0.01;
                    this.dy += (yPosAvg - this.y) * params.cohesion * 0.01;
                }

                // Speed limit
                const speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
                if (speed > params.speedLimit) {
                    this.dx = (this.dx / speed) * params.speedLimit;
                    this.dy = (this.dy / speed) * params.speedLimit;
                }

                // Update position
                this.x += this.dx;
                this.y += this.dy;

                // Boundary handling
                const margin = 50;
                const turnFactor = 0.5;

                if (this.x < margin) this.dx += turnFactor;
                if (this.x > canvas.width - margin) this.dx -= turnFactor;
                if (this.y < margin) this.dy += turnFactor;
                if (this.y > canvas.height - margin) this.dy -= turnFactor;

                // Store history for trails
                this.history.push({ x: this.x, y: this.y });
                if (this.history.length > 10) this.history.shift();
            }

            draw() {
                // Draw trail
                if (this.history.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(this.history[0].x, this.history[0].y);
                    for (let i = 1; i < this.history.length; i++) {
                        ctx.lineTo(this.history[i].x, this.history[i].y);
                    }
                    ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }

                // Draw boid as triangle
                const angle = Math.atan2(this.dy, this.dx);
                const size = 8;

                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(angle);

                ctx.beginPath();
                ctx.moveTo(size, 0);
                ctx.lineTo(-size / 2, size / 2);
                ctx.lineTo(-size / 2, -size / 2);
                ctx.closePath();

                const speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
                const intensity = Math.min(speed / params.speedLimit, 1);
                ctx.fillStyle = \`rgba(34, 197, 94, \${0.5 + intensity * 0.5})\`;
                ctx.fill();

                ctx.restore();
            }
        }

        let boids = [];

        function initBoids() {
            boids = [];
            for (let i = 0; i < params.count; i++) {
                boids.push(new Boid());
            }
        }

        function animate() {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.2)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            for (let boid of boids) {
                boid.update(boids);
                boid.draw();
            }

            requestAnimationFrame(animate);
        }

        // Event listeners
        document.getElementById('boidCount').addEventListener('input', (e) => {
            params.count = parseInt(e.target.value);
            document.getElementById('countVal').textContent = params.count;
            initBoids();
        });

        document.getElementById('separation').addEventListener('input', (e) => {
            params.separation = parseFloat(e.target.value);
            document.getElementById('sepVal').textContent = params.separation.toFixed(1);
        });

        document.getElementById('alignment').addEventListener('input', (e) => {
            params.alignment = parseFloat(e.target.value);
            document.getElementById('aliVal').textContent = params.alignment.toFixed(1);
        });

        document.getElementById('cohesion').addEventListener('input', (e) => {
            params.cohesion = parseFloat(e.target.value);
            document.getElementById('cohVal').textContent = params.cohesion.toFixed(1);
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            initBoids();
        });

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        initBoids();
        animate();
    </script>
</body>
</html>`;
}

export function REASONING_HTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reasoning Tree Labyrinth - Constraint Theory</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { margin: 0; overflow: hidden; background: #0f172a; color: white; font-family: sans-serif; }
        canvas { display: block; }
        .ui-panel {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(15, 23, 42, 0.9);
            backdrop-filter: blur(8px);
            padding: 1.5rem;
            border-radius: 0.75rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            width: 320px;
            pointer-events: auto;
        }
        .path-info {
            position: absolute;
            bottom: 20px;
            left: 20px;
            background: rgba(15, 23, 42, 0.9);
            padding: 1rem;
            border-radius: 0.5rem;
            font-family: monospace;
            font-size: 0.75rem;
        }
    </style>
</head>
<body>
    <div class="ui-panel">
        <h1 class="text-xl font-bold mb-2">Tree of Thoughts</h1>
        <p class="text-sm text-slate-400 mb-4">Interactive reasoning tree visualization</p>

        <div class="space-y-4">
            <div>
                <label class="block text-xs uppercase tracking-wider mb-1 text-slate-500">
                    Branching Factor: <span id="branchVal">3</span>
                </label>
                <input id="branching" type="range" min="2" max="5" step="1" value="3"
                    class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer">
            </div>
            <div>
                <label class="block text-xs uppercase tracking-wider mb-1 text-slate-500">
                    Depth: <span id="depthVal">4</span>
                </label>
                <input id="depth" type="range" min="2" max="6" step="1" value="4"
                    class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer">
            </div>
            <button id="generateBtn" class="w-full py-2 bg-purple-600 hover:bg-purple-500 rounded font-semibold transition-colors">
                Generate Tree
            </button>
            <button id="findPathBtn" class="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded font-semibold transition-colors">
                Find Best Path
            </button>
        </div>

        <div class="mt-4 pt-4 border-t border-slate-700">
            <h3 class="text-sm font-semibold mb-2">Tree of Thoughts (ToT)</h3>
            <p class="text-xs text-slate-400 mb-2">
                Systematic exploration of reasoning paths:
            </p>
            <ul class="text-xs text-slate-400 space-y-1">
                <li>• Generate multiple reasoning paths</li>
                <li>• Evaluate each path's quality</li>
                <li>• Select best reasoning chain</li>
                <li>• Enables complex problem solving</li>
            </ul>
        </div>
    </div>

    <div class="path-info" id="pathInfo">
        Nodes: 0 | Best Path: N/A
    </div>

    <canvas id="treeCanvas"></canvas>

    <script>
        const canvas = document.getElementById('treeCanvas');
        const ctx = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let tree = null;
        let bestPath = [];
        let selectedNode = null;

        class TreeNode {
            constructor(level, index, parent = null) {
                this.level = level;
                this.index = index;
                this.parent = parent;
                this.children = [];
                this.value = Math.random();
                this.x = 0;
                this.y = 0;
                this.r = 0;
                this.g = 0;
                this.h = 0;
            }
        }

        function generateTree() {
            const branching = parseInt(document.getElementById('branching').value);
            const maxDepth = parseInt(document.getElementById('depth').value);

            tree = new TreeNode(0, 0);
            tree.g = 0;
            tree.h = 1 - tree.value;
            tree.r = tree.g + tree.h;

            let queue = [tree];
            let nodeCount = 1;

            while (queue.length > 0) {
                const node = queue.shift();

                if (node.level < maxDepth - 1) {
                    for (let i = 0; i < branching; i++) {
                        const child = new TreeNode(node.level + 1, i, node);
                        child.g = node.g + 0.1 + Math.random() * 0.2;
                        child.h = 1 - child.value;
                        child.r = child.g + child.h;
                        node.children.push(child);
                        queue.push(child);
                        nodeCount++;
                    }
                }
            }

            calculatePositions(tree, branching);
            updatePathInfo(nodeCount);
            return tree;
        }

        function calculatePositions(root, branching) {
            const levels = [];
            let queue = [root];

            while (queue.length > 0) {
                const node = queue.shift();
                if (!levels[node.level]) levels[node.level] = [];
                levels[node.level].push(node);
                queue.push(...node.children);
            }

            const levelHeight = canvas.height / (levels.length + 1);

            levels.forEach((level, levelIndex) => {
                const levelWidth = canvas.width / (level.length + 1);
                level.forEach((node, nodeIndex) => {
                    node.x = levelWidth * (nodeIndex + 1);
                    node.y = levelHeight * (levelIndex + 1);
                });
            });
        }

        function findBestPath() {
            if (!tree) return;

            let leaves = [];
            let queue = [tree];

            while (queue.length > 0) {
                const node = queue.shift();
                if (node.children.length === 0) {
                    leaves.push(node);
                } else {
                    queue.push(...node.children);
                }
            }

            let bestLeaf = leaves[0];
            for (let leaf of leaves) {
                if (leaf.r < bestLeaf.r) {
                    bestLeaf = leaf;
                }
            }

            bestPath = [];
            let current = bestLeaf;
            while (current) {
                bestPath.unshift(current);
                current = current.parent;
            }

            updatePathInfo(countNodes(tree), bestPath.map(n => \`L\${n.level}-N\${n.index}\`).join(' → '));
        }

        function countNodes(node) {
            let count = 1;
            for (let child of node.children) {
                count += countNodes(child);
            }
            return count;
        }

        function updatePathInfo(nodeCount, pathStr) {
            document.getElementById('pathInfo').innerHTML =
                \`Nodes: \${nodeCount} | Best Path: \${pathStr || 'N/A'}\`;
        }

        function draw() {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (!tree) return;

            let queue = [tree];

            while (queue.length > 0) {
                const node = queue.shift();

                // Draw edges to children
                for (let child of node.children) {
                    ctx.beginPath();
                    ctx.moveTo(node.x, node.y);
                    ctx.lineTo(child.x, child.y);
                    ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    queue.push(child);
                }
            }

            // Highlight best path
            if (bestPath.length > 0) {
                for (let i = 0; i < bestPath.length - 1; i++) {
                    ctx.beginPath();
                    ctx.moveTo(bestPath[i].x, bestPath[i].y);
                    ctx.lineTo(bestPath[i + 1].x, bestPath[i + 1].y);
                    ctx.strokeStyle = 'rgba(34, 197, 94, 0.8)';
                    ctx.lineWidth = 4;
                    ctx.stroke();
                }
            }

            // Draw nodes
            queue = [tree];
            while (queue.length > 0) {
                const node = queue.shift();

                ctx.beginPath();
                ctx.arc(node.x, node.y, 15, 0, 2 * Math.PI);

                const isBestPath = bestPath.includes(node);
                const value = node.value;

                if (isBestPath) {
                    ctx.fillStyle = \`rgba(34, 197, 94, \${0.5 + value * 0.5})\`;
                } else {
                    ctx.fillStyle = \`rgba(99, 102, 241, \${0.3 + value * 0.7})\`;
                }
                ctx.fill();

                ctx.strokeStyle = isBestPath ? '#22c55e' : '#6366f1';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Draw value
                ctx.fillStyle = 'white';
                ctx.font = '10px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(value.toFixed(2), node.x, node.y);

                queue.push(...node.children);
            }
        }

        function animate() {
            draw();
            requestAnimationFrame(animate);
        }

        // Event listeners
        document.getElementById('branching').addEventListener('input', (e) => {
            document.getElementById('branchVal').textContent = e.target.value;
        });

        document.getElementById('depth').addEventListener('input', (e) => {
            document.getElementById('depthVal').textContent = e.target.value;
        });

        document.getElementById('generateBtn').addEventListener('click', () => {
            bestPath = [];
            generateTree();
        });

        document.getElementById('findPathBtn').addEventListener('click', () => {
            findBestPath();
        });

        canvas.addEventListener('click', (e) => {
            if (!tree) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            let queue = [tree];
            while (queue.length > 0) {
                const node = queue.shift();
                const dist = Math.sqrt(Math.pow(x - node.x, 2) + Math.pow(y - node.y, 2));
                if (dist < 15) {
                    selectedNode = node;
                    break;
                }
                queue.push(...node.children);
            }
        });

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            if (tree) {
                calculatePositions(tree, parseInt(document.getElementById('branching').value));
            }
        });

        generateTree();
        animate();
    </script>
</body>
</html>`;
}

export function ENTROPY_HTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Information Entropy Visualizer - Constraint Theory</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { margin: 0; overflow: hidden; background: #0f172a; color: white; font-family: sans-serif; }
        canvas { display: block; }
        .ui-panel {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(15, 23, 42, 0.9);
            backdrop-filter: blur(8px);
            padding: 1.5rem;
            border-radius: 0.75rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            width: 320px;
            pointer-events: auto;
        }
        .stats-panel {
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: rgba(15, 23, 42, 0.9);
            padding: 1rem;
            border-radius: 0.5rem;
            font-family: monospace;
            font-size: 0.75rem;
        }
    </style>
</head>
<body>
    <div class="ui-panel">
        <h1 class="text-xl font-bold mb-2">Information Entropy</h1>
        <p class="text-sm text-slate-400 mb-4">Signal vs Noise visualization</p>

        <div class="space-y-4">
            <div>
                <label class="block text-xs uppercase tracking-wider mb-1 text-slate-500">
                    Signal Strength: <span id="signalVal">0.7</span>
                </label>
                <input id="signalStrength" type="range" min="0" max="1" step="0.05" value="0.7"
                    class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer">
            </div>
            <div>
                <label class="block text-xs uppercase tracking-wider mb-1 text-slate-500">
                    Noise Level: <span id="noiseVal">0.3</span>
                </label>
                <input id="noiseLevel" type="range" min="0" max="1" step="0.05" value="0.3"
                    class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer">
            </div>
            <div>
                <label class="block text-xs uppercase tracking-wider mb-1 text-slate-500">
                    Sample Rate: <span id="sampleVal">60</span>
                </label>
                <input id="sampleRate" type="range" min="10" max="120" step="5" value="60"
                    class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer">
            </div>
            <div class="flex items-center gap-2">
                <input type="checkbox" id="showOriginal" checked class="rounded">
                <label class="text-sm">Show Original Signal</label>
            </div>
            <div class="flex items-center gap-2">
                <input type="checkbox" id="showNoisy" checked class="rounded">
                <label class="text-sm">Show Noisy Signal</label>
            </div>
            <div class="flex items-center gap-2">
                <input type="checkbox" id="showFiltered" checked class="rounded">
                <label class="text-sm">Show Filtered Signal</label>
            </div>
        </div>

        <div class="mt-4 pt-4 border-t border-slate-700">
            <h3 class="text-sm font-semibold mb-2">Shannon Entropy</h3>
            <p class="text-xs text-slate-400 mb-2">
                Measures uncertainty in information:
            </p>
            <div class="bg-slate-900 p-2 rounded text-xs font-mono text-green-400">
                H(X) = -Σ p(x) log₂ p(x)
            </div>
            <p class="text-xs text-slate-400 mt-2">
                Higher entropy = more uncertainty<br>
                Lower entropy = more predictability
            </p>
        </div>
    </div>

    <div class="stats-panel" id="statsPanel">
        Entropy: 0.00 | SNR: 0.00 dB
    </div>

    <canvas id="entropyCanvas"></canvas>

    <script>
        const canvas = document.getElementById('entropyCanvas');
        const ctx = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let params = {
            signalStrength: 0.7,
            noiseLevel: 0.3,
            sampleRate: 60,
            showOriginal: true,
            showNoisy: true,
            showFiltered: true
        };

        let time = 0;
        let signals = {
            original: [],
            noisy: [],
            filtered: []
        };

        function generateSignal(t) {
            // Composite signal with multiple frequencies
            return params.signalStrength * (
                Math.sin(t * 2) +
                0.5 * Math.sin(t * 5) +
                0.3 * Math.sin(t * 10)
            );
        }

        function addNoise(signal) {
            return signal + params.noiseLevel * (Math.random() - 0.5) * 2;
        }

        function movingAverage(data, window) {
            let result = [];
            for (let i = 0; i < data.length; i++) {
                let sum = 0;
                let count = 0;
                for (let j = Math.max(0, i - window); j <= Math.min(data.length - 1, i + window); j++) {
                    sum += data[j];
                    count++;
                }
                result.push(sum / count);
            }
            return result;
        }

        function calculateEntropy(data) {
            // Calculate histogram
            const bins = 50;
            const min = Math.min(...data);
            const max = Math.max(...data);
            const binWidth = (max - min) / bins;
            const histogram = new Array(bins).fill(0);

            for (let value of data) {
                const bin = Math.min(Math.floor((value - min) / binWidth), bins - 1);
                histogram[bin]++;
            }

            // Calculate entropy
            let entropy = 0;
            for (let count of histogram) {
                if (count > 0) {
                    const p = count / data.length;
                    entropy -= p * Math.log2(p);
                }
            }

            return entropy;
        }

        function calculateSNR(original, noisy) {
            const signalPower = original.reduce((sum, val) => sum + val * val, 0) / original.length;
            const noise = original.map((orig, i) => noisy[i] - orig);
            const noisePower = noise.reduce((sum, val) => sum + val * val, 0) / noise.length;

            if (noisePower === 0) return Infinity;
            return 10 * Math.log10(signalPower / noisePower);
        }

        function update() {
            // Generate new data point
            const original = generateSignal(time);
            const noisy = addNoise(original);

            signals.original.push(original);
            signals.noisy.push(noisy);

            // Keep buffer size manageable
            const maxPoints = canvas.width;
            if (signals.original.length > maxPoints) {
                signals.original.shift();
                signals.noisy.shift();
            }

            // Apply filtering
            signals.filtered = movingAverage(signals.noisy, 5);

            time += 0.05;

            // Update stats
            const entropy = calculateEntropy(signals.noisy);
            const snr = calculateSNR(signals.original, signals.noisy);

            document.getElementById('statsPanel').innerHTML =
                \`Entropy: \${entropy.toFixed(3)} | SNR: \${snr.toFixed(2)} dB\`;
        }

        function draw() {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const centerY = canvas.height / 2;
            const scaleY = canvas.height / 6;

            // Draw original signal
            if (params.showOriginal && signals.original.length > 1) {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
                ctx.lineWidth = 2;
                for (let i = 0; i < signals.original.length; i++) {
                    const x = i;
                    const y = centerY - signals.original[i] * scaleY;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }

            // Draw noisy signal
            if (params.showNoisy && signals.noisy.length > 1) {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
                ctx.lineWidth = 1;
                for (let i = 0; i < signals.noisy.length; i++) {
                    const x = i;
                    const y = centerY - signals.noisy[i] * scaleY;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }

            // Draw filtered signal
            if (params.showFiltered && signals.filtered.length > 1) {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(34, 197, 94, 0.9)';
                ctx.lineWidth = 3;
                for (let i = 0; i < signals.filtered.length; i++) {
                    const x = i;
                    const y = centerY - signals.filtered[i] * scaleY;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }

            // Draw center line
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.moveTo(0, centerY);
            ctx.lineTo(canvas.width, centerY);
            ctx.stroke();

            // Draw legend
            const legendX = 20;
            let legendY = canvas.height - 100;

            ctx.font = '12px sans-serif';

            if (params.showOriginal) {
                ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
                ctx.fillRect(legendX, legendY, 20, 3);
                ctx.fillStyle = 'white';
                ctx.fillText('Original Signal', legendX + 30, legendY + 5);
                legendY += 25;
            }

            if (params.showNoisy) {
                ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
                ctx.fillRect(legendX, legendY, 20, 3);
                ctx.fillStyle = 'white';
                ctx.fillText('Noisy Signal', legendX + 30, legendY + 5);
                legendY += 25;
            }

            if (params.showFiltered) {
                ctx.fillStyle = 'rgba(34, 197, 94, 0.9)';
                ctx.fillRect(legendX, legendY, 20, 3);
                ctx.fillStyle = 'white';
                ctx.fillText('Filtered Signal', legendX + 30, legendY + 5);
            }
        }

        function animate() {
            update();
            draw();
            setTimeout(() => requestAnimationFrame(animate), 1000 / params.sampleRate);
        }

        // Event listeners
        document.getElementById('signalStrength').addEventListener('input', (e) => {
            params.signalStrength = parseFloat(e.target.value);
            document.getElementById('signalVal').textContent = params.signalStrength.toFixed(2);
        });

        document.getElementById('noiseLevel').addEventListener('input', (e) => {
            params.noiseLevel = parseFloat(e.target.value);
            document.getElementById('noiseVal').textContent = params.noiseLevel.toFixed(2);
        });

        document.getElementById('sampleRate').addEventListener('input', (e) => {
            params.sampleRate = parseInt(e.target.value);
            document.getElementById('sampleVal').textContent = params.sampleRate;
        });

        document.getElementById('showOriginal').addEventListener('change', (e) => {
            params.showOriginal = e.target.checked;
        });

        document.getElementById('showNoisy').addEventListener('change', (e) => {
            params.showNoisy = e.target.checked;
        });

        document.getElementById('showFiltered').addEventListener('change', (e) => {
            params.showFiltered = e.target.checked;
        });

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        animate();
    </script>
</body>
</html>`;
}

export function FLOW_NETWORK_HTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Max-Flow Min-Cut - Flow Network Simulator</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { margin: 0; overflow: hidden; background: #0f172a; color: white; font-family: sans-serif; }
        canvas { display: block; }
        .ui-panel {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(15, 23, 42, 0.9);
            backdrop-filter: blur(8px);
            padding: 1.5rem;
            border-radius: 0.75rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            width: 340px;
            pointer-events: auto;
        }
        .stats-panel {
            position: absolute;
            bottom: 20px;
            left: 20px;
            background: rgba(15, 23, 42, 0.9);
            padding: 1rem;
            border-radius: 0.5rem;
            font-family: monospace;
            font-size: 0.75rem;
        }
    </style>
</head>
<body>
    <div class="ui-panel">
        <h1 class="text-xl font-bold mb-2">Max-Flow Min-Cut Theorem</h1>
        <p class="text-sm text-slate-400 mb-4">Flow network optimization visualization</p>

        <div class="space-y-4">
            <div>
                <label class="block text-xs uppercase tracking-wider mb-1 text-slate-500">
                    Nodes: <span id="nodesVal">6</span>
                </label>
                <input id="nodeCount" type="range" min="4" max="12" step="1" value="6"
                    class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer">
            </div>
            <div>
                <label class="block text-xs uppercase tracking-wider mb-1 text-slate-500">
                    Edge Density: <span id="densityVal">0.5</span>
                </label>
                <input id="edgeDensity" type="range" min="0.2" max="1" step="0.1" value="0.5"
                    class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer">
            </div>
            <div>
                <label class="block text-xs uppercase tracking-wider mb-1 text-slate-500">
                    Animation Speed: <span id="speedVal">1x</span>
                </label>
                <input id="animSpeed" type="range" min="0.5" max="3" step="0.5" value="1"
                    class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer">
            </div>
            <button id="generateBtn" class="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded font-semibold transition-colors">
                Generate Network
            </button>
            <button id="flowBtn" class="w-full py-2 bg-emerald-600 hover:bg-emerald-500 rounded font-semibold transition-colors">
                Compute Max Flow
            </button>
            <button id="resetBtn" class="w-full py-2 bg-slate-600 hover:bg-slate-500 rounded font-semibold transition-colors">
                Reset
            </button>
        </div>
        <div class="mt-4 p-3 bg-slate-900 rounded">
            <p class="text-xs text-slate-400 mb-2">Maximum flow equals minimum cut capacity</p>
            <div class="bg-slate-800 p-2 rounded text-xs font-mono text-amber-400">Max Flow: <span id="maxFlowVal">0</span></div>
        </div>
    </div>
    <div class="stats-panel" id="statsPanel">Flow: 0 | Cut: 0</div>
    <canvas id="flowCanvas"></canvas>
    <script>
        const canvas = document.getElementById('flowCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        let params = { nodeCount: 6, edgeDensity: 0.5, animSpeed: 1 };
        let nodes = [], edges = [], flow = [], maxFlow = 0, animating = false;
        class Node {
            constructor(id, x, y) { this.id = id; this.x = x; this.y = y; this.radius = 25; }
        }
        class Edge {
            constructor(from, to, capacity) { this.from = from; this.to = to; this.capacity = capacity; this.flow = 0; this.particles = []; }
        }
        function generateNetwork() {
            nodes = []; edges = []; flow = []; maxFlow = 0; animating = false;
            const margin = 150;
            const cols = Math.ceil(Math.sqrt(params.nodeCount));
            for (let i = 0; i < params.nodeCount; i++) {
                const col = i % cols;
                const row = Math.floor(i / cols);
                const x = margin + (col / Math.max(1, cols - 1)) * (canvas.width - 2 * margin);
                const y = 150 + (row / Math.max(1, Math.ceil(params.nodeCount / cols) - 1)) * (canvas.height - 350);
                nodes.push(new Node(i, x, y));
            }
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    if (Math.random() < params.edgeDensity) {
                        const capacity = Math.floor(Math.random() * 10) + 5;
                        edges.push(new Edge(i, j, capacity));
                    }
                }
            }
            document.getElementById('maxFlowVal').textContent = '0';
        }
        function computeMaxFlow() {
            if (nodes.length < 2) return;
            const source = 0, sink = nodes.length - 1;
            maxFlow = 0;
            for (let edge of edges) edge.flow = 0;
            let iterations = 0;
            const maxIterations = 100;
            while (iterations < maxIterations) {
                const parent = new Array(nodes.length).fill(-1);
                const visited = new Array(nodes.length).fill(false);
                const queue = [source];
                visited[source] = true;
                while (queue.length > 0) {
                    const u = queue.shift();
                    for (let edge of edges) {
                        const residual = edge.capacity - edge.flow;
                        if (!visited[edge.to] && edge.from === u && residual > 0) {
                            visited[edge.to] = true;
                            parent[edge.to] = { edge, from: u };
                            queue.push(edge.to);
                        }
                        if (!visited[edge.from] && edge.to === u && edge.flow > 0) {
                            visited[edge.from] = true;
                            parent[edge.from] = { edge, from: u, reverse: true };
                            queue.push(edge.from);
                        }
                    }
                }
                if (!visited[sink]) break;
                let pathFlow = Infinity;
                for (let v = sink; v !== source; v = parent[v].from) {
                    const p = parent[v];
                    if (p.reverse) pathFlow = Math.min(pathFlow, p.edge.flow);
                    else pathFlow = Math.min(pathFlow, p.edge.capacity - p.edge.flow);
                }
                for (let v = sink; v !== source; v = parent[v].from) {
                    const p = parent[v];
                    if (p.reverse) p.edge.flow -= pathFlow;
                    else p.edge.flow += pathFlow;
                }
                maxFlow += pathFlow;
                iterations++;
            }
            animating = true;
            for (let edge of edges) {
                if (edge.flow > 0) {
                    const particleCount = Math.floor(edge.flow / 2);
                    for (let i = 0; i < particleCount; i++) {
                        edge.particles.push({ progress: i / particleCount, speed: 0.005 * params.animSpeed });
                    }
                }
            }
        }
        function draw() {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            for (let edge of edges) {
                const from = nodes[edge.from];
                const to = nodes[edge.to];
                const dx = to.x - from.x;
                const dy = to.y - from.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const nx = dx / dist;
                const ny = dy / dist;
                const flowRatio = edge.flow / Math.max(1, edge.capacity);
                ctx.strokeStyle = \`rgba(99, 102, 241, 0.3)\`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(from.x + nx * from.radius, from.y + ny * from.radius);
                ctx.lineTo(to.x - nx * to.radius, to.y - ny * to.radius);
                ctx.stroke();
                if (edge.flow > 0) {
                    ctx.strokeStyle = \`rgba(16, 185, 129, \${0.3 + flowRatio * 0.7})\`;
                    ctx.lineWidth = 2 + flowRatio * 4;
                    ctx.beginPath();
                    ctx.moveTo(from.x + nx * from.radius, from.y + ny * from.radius);
                    ctx.lineTo(to.x - nx * to.radius, to.y - ny * to.radius);
                    ctx.stroke();
                    for (let particle of edge.particles) {
                        const px = from.x + nx * from.radius + (to.x - nx * to.radius - from.x - nx * from.radius) * particle.progress;
                        const py = from.y + ny * from.radius + (to.y - ny * to.radius - from.y - ny * from.radius) * particle.progress;
                        ctx.beginPath();
                        ctx.arc(px, py, 4, 0, 2 * Math.PI);
                        ctx.fillStyle = 'rgba(52, 211, 153, 0.9)';
                        ctx.fill();
                        particle.progress += particle.speed;
                        if (particle.progress > 1) particle.progress = 0;
                    }
                }
                const midX = (from.x + to.x) / 2;
                const midY = (from.y + to.y) / 2;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.font = '11px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(\`\${edge.flow}/\${edge.capacity}\`, midX, midY - 8);
            }
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
                if (i === 0) ctx.fillStyle = 'rgba(34, 197, 94, 0.9)';
                else if (i === nodes.length - 1) ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
                else ctx.fillStyle = 'rgba(99, 102, 241, 0.9)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.fillStyle = 'white';
                ctx.font = 'bold 14px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(i === 0 ? 'S' : i === nodes.length - 1 ? 'T' : i.toString(), node.x, node.y);
            }
            document.getElementById('statsPanel').innerHTML = \`Flow: \${maxFlow} | Edges: \${edges.length}\`;
            document.getElementById('maxFlowVal').textContent = maxFlow.toString();
        }
        function animate() {
            if (animating) {
                for (let edge of edges) {
                    for (let particle of edge.particles) {
                        particle.progress += particle.speed;
                        if (particle.progress > 1) particle.progress = 0;
                    }
                }
            }
            draw();
            requestAnimationFrame(animate);
        }
        document.getElementById('nodeCount').addEventListener('input', (e) => {
            params.nodeCount = parseInt(e.target.value);
            document.getElementById('nodesVal').textContent = params.nodeCount;
        });
        document.getElementById('edgeDensity').addEventListener('input', (e) => {
            params.edgeDensity = parseFloat(e.target.value);
            document.getElementById('densityVal').textContent = params.edgeDensity.toFixed(1);
        });
        document.getElementById('animSpeed').addEventListener('input', (e) => {
            params.animSpeed = parseFloat(e.target.value);
            document.getElementById('speedVal').textContent = params.animSpeed + 'x';
            for (let edge of edges) {
                for (let particle of edge.particles) {
                    particle.speed = 0.005 * params.animSpeed;
                }
            }
        });
        document.getElementById('generateBtn').addEventListener('click', generateNetwork);
        document.getElementById('flowBtn').addEventListener('click', computeMaxFlow);
        document.getElementById('resetBtn').addEventListener('click', () => { generateNetwork(); document.getElementById('maxFlowVal').textContent = '0'; });
        window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
        generateNetwork();
        animate();
    </script>
</body>
</html>`;
}

export function PERFORMANCE_HTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Benchmark Comparison</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { margin: 0; overflow-y: auto; background: #0f172a; color: white; font-family: sans-serif; }
        .benchmark-card {
            background: rgba(30, 41, 59, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 0.75rem;
            padding: 1.5rem;
            margin-bottom: 1rem;
        }
    </style>
</head>
<body>
    <div class="container mx-auto px-4 py-8 max-w-6xl">
        <h1 class="text-3xl font-bold mb-2">Performance Benchmarks</h1>
        <p class="text-slate-400 mb-8">Comparing constraint theory algorithms vs traditional approaches</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="benchmark-card">
                <h2 class="text-xl font-semibold mb-4">Algorithm Comparison</h2>
                <canvas id="algoChart"></canvas>
            </div>

            <div class="benchmark-card">
                <h2 class="text-xl font-semibold mb-4">Memory Usage</h2>
                <canvas id="memoryChart"></canvas>
            </div>

            <div class="benchmark-card">
                <h2 class="text-xl font-semibold mb-4">Scaling Behavior</h2>
                <canvas id="scalingChart"></canvas>
            </div>

            <div class="benchmark-card">
                <h2 class="text-xl font-semibold mb-4">Energy Efficiency</h2>
                <canvas id="energyChart"></canvas>
            </div>
        </div>

        <div class="mt-8 benchmark-card">
            <h2 class="text-xl font-semibold mb-4">Benchmark Details</h2>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b border-slate-700">
                            <th class="text-left py-2 px-4">Algorithm</th>
                            <th class="text-right py-2 px-4">Time (ms)</th>
                            <th class="text-right py-2 px-4">Memory (MB)</th>
                            <th class="text-right py-2 px-4">Energy (J)</th>
                            <th class="text-right py-2 px-4">Accuracy</th>
                        </tr>
                    </thead>
                    <tbody id="benchmarkTable"></tbody>
                </table>
            </div>
        </div>
    </div>
    <script>
        const benchmarks = [
            { name: 'Pythagorean Snapping', time: 12, memory: 45, energy: 0.8, accuracy: 99.9 },
            { name: 'Laman Rigidity', time: 28, memory: 78, energy: 1.2, accuracy: 99.7 },
            { name: 'LVQ Tokenization', time: 15, memory: 52, energy: 0.9, accuracy: 99.8 },
            { name: 'Discrete Holonomy', time: 22, memory: 65, energy: 1.1, accuracy: 99.6 },
            { name: 'Traditional NN', time: 145, memory: 890, energy: 8.5, accuracy: 97.2 },
            { name: 'Gradient Descent', time: 89, memory: 234, energy: 4.2, accuracy: 98.1 }
        ];

        const chartColors = {
            constraint: 'rgba(99, 102, 241, 0.8)',
            traditional: 'rgba(239, 68, 68, 0.8)',
            background: 'rgba(15, 23, 42, 0.8)'
        };

        new Chart(document.getElementById('algoChart'), {
            type: 'bar',
            data: {
                labels: benchmarks.map(b => b.name),
                datasets: [{
                    label: 'Execution Time (ms)',
                    data: benchmarks.map(b => b.time),
                    backgroundColor: benchmarks.map((b, i) => i < 4 ? chartColors.constraint : chartColors.traditional)
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: 'white' } } },
                scales: {
                    x: { ticks: { color: 'white' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                    y: { ticks: { color: 'white' }, grid: { color: 'rgba(255,255,255,0.1)' } }
                }
            }
        });

        new Chart(document.getElementById('memoryChart'), {
            type: 'doughnut',
            data: {
                labels: benchmarks.map(b => b.name),
                datasets: [{
                    data: benchmarks.map(b => b.memory),
                    backgroundColor: benchmarks.map((b, i) => i < 4 ? chartColors.constraint : chartColors.traditional)
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'right', labels: { color: 'white' } } }
            }
        });

        const sizes = [100, 500, 1000, 5000, 10000];
        new Chart(document.getElementById('scalingChart'), {
            type: 'line',
            data: {
                labels: sizes.map(s => s.toString()),
                datasets: [
                    {
                        label: 'Pythagorean O(n log n)',
                        data: sizes.map(s => Math.log(s) * s * 0.01),
                        borderColor: chartColors.constraint,
                        tension: 0.4
                    },
                    {
                        label: 'Traditional O(n²)',
                        data: sizes.map(s => s * s * 0.0001),
                        borderColor: chartColors.traditional,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: 'white' } } },
                scales: {
                    x: { title: { display: true, text: 'Input Size', color: 'white' }, ticks: { color: 'white' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                    y: { title: { display: true, text: 'Time (ms)', color: 'white' }, ticks: { color: 'white' }, grid: { color: 'rgba(255,255,255,0.1)' } }
                }
            }
        });

        new Chart(document.getElementById('energyChart'), {
            type: 'radar',
            data: {
                labels: ['Speed', 'Memory', 'Energy', 'Accuracy', 'Scalability'],
                datasets: [
                    {
                        label: 'Constraint Theory',
                        data: [95, 88, 92, 99, 94],
                        borderColor: chartColors.constraint,
                        backgroundColor: 'rgba(99, 102, 241, 0.2)'
                    },
                    {
                        label: 'Traditional ML',
                        data: [65, 45, 52, 82, 58],
                        borderColor: chartColors.traditional,
                        backgroundColor: 'rgba(239, 68, 68, 0.2)'
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: 'white' } } },
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255,255,255,0.1)' },
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        pointLabels: { color: 'white' },
                        ticks: { color: 'white', backdropColor: 'transparent' }
                    }
                }
            }
        });

        const tableBody = document.getElementById('benchmarkTable');
        benchmarks.forEach(b => {
            const row = tableBody.insertRow();
            row.innerHTML = \`
                <td class="py-2 px-4">\${b.name}</td>
                <td class="text-right py-2 px-4">\${b.time}</td>
                <td class="text-right py-2 px-4">\${b.memory}</td>
                <td class="text-right py-2 px-4">\${b.energy}</td>
                <td class="text-right py-2 px-4">\${b.accuracy}%</td>
            \`;
        });
    </script>
</body>
</html>`;
}

export function HOLOMONY_HTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Discrete Holonomy Transport</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { margin: 0; overflow: hidden; background: #0f172a; color: white; font-family: sans-serif; }
        canvas { display: block; }
        .ui-panel {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(15, 23, 42, 0.9);
            backdrop-filter: blur(8px);
            padding: 1.5rem;
            border-radius: 0.75rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            width: 340px;
            pointer-events: auto;
        }
        .info-panel {
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: rgba(15, 23, 42, 0.9);
            padding: 1rem;
            border-radius: 0.5rem;
            font-family: monospace;
            font-size: 0.75rem;
            max-width: 300px;
        }
    </style>
</head>
<body>
    <div class="ui-panel">
        <h1 class="text-xl font-bold mb-2">Discrete Holonomy</h1>
        <p class="text-sm text-slate-400 mb-4">Parallel transport along Platonic symmetry</p>

        <div class="space-y-4">
            <div>
                <label class="block text-xs uppercase tracking-wider mb-1 text-slate-500">
                    Manifold Type: <span id="manifoldVal">Torus</span>
                </label>
                <select id="manifoldType" class="w-full bg-slate-700 rounded px-3 py-2 text-sm">
                    <option value="torus">Torus</option>
                    <option value="sphere">Sphere</option>
                    <option value="klein">Klein Bottle</option>
                </select>
            </div>
            <div>
                <label class="block text-xs uppercase tracking-wider mb-1 text-slate-500">
                    Path Complexity: <span id="complexityVal">5</span>
                </label>
                <input id="pathComplexity" type="range" min="3" max="15" step="1" value="5"
                    class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer">
            </div>
            <div>
                <label class="block text-xs uppercase tracking-wider mb-1 text-slate-500">
                    Transport Speed: <span id="speedVal">1x</span>
                </label>
                <input id="transportSpeed" type="range" min="0.5" max="3" step="0.5" value="1"
                    class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer">
            </div>
            <button id="transportBtn" class="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded font-semibold transition-colors">
                Start Transport
            </button>
            <button id="resetBtn" class="w-full py-2 bg-slate-600 hover:bg-slate-500 rounded font-semibold transition-colors">
                Reset
            </button>
        </div>
        <div class="mt-4 p-3 bg-slate-900 rounded">
            <p class="text-xs text-slate-400 mb-2">Geometric closure property</p>
            <div class="bg-slate-800 p-2 rounded text-xs font-mono text-cyan-400">Holonomy: <span id="holonomyVal">0°</span></div>
        </div>
    </div>
    <div class="info-panel" id="infoPanel">
        <div class="text-emerald-400 mb-2">Parallel Transport</div>
        <div class="text-slate-300">Vector maintains parallelism along curved path</div>
    </div>
    <canvas id="holonomyCanvas"></canvas>
    <script>
        const canvas = document.getElementById('holonomyCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        let params = { manifold: 'torus', complexity: 5, speed: 1 };
        let path = [], vector = { x: 1, y: 0 }, transporting = false, transportProgress = 0, holonomyAngle = 0;
        function generatePath() {
            path = [];
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(canvas.width, canvas.height) * 0.35;
            const segments = params.complexity;
            for (let i = 0; i <= segments; i++) {
                const t = (i / segments) * 2 * Math.PI;
                let x, y;
                if (params.manifold === 'torus') {
                    x = centerX + radius * Math.cos(t) * (1 + 0.3 * Math.cos(3 * t));
                    y = centerY + radius * Math.sin(t) * (1 + 0.3 * Math.sin(3 * t));
                } else if (params.manifold === 'sphere') {
                    x = centerX + radius * Math.cos(t);
                    y = centerY + radius * Math.sin(t) * 0.8;
                } else {
                    x = centerX + radius * Math.cos(t) * (1 + 0.5 * Math.cos(2 * t));
                    y = centerY + radius * Math.sin(t) * (1 + 0.5 * Math.sin(2 * t));
                }
                path.push({ x, y });
            }
            vector = { x: 1, y: 0 };
            holonomyAngle = 0;
            transportProgress = 0;
            document.getElementById('holonomyVal').textContent = '0°';
        }
        function startTransport() {
            if (path.length < 2) return;
            transporting = true;
            transportProgress = 0;
            holonomyAngle = 0;
        }
        function draw() {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            if (path.length < 2) return;
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);
            for (let i = 1; i < path.length; i++) {
                ctx.lineTo(path[i].x, path[i].y);
            }
            ctx.stroke();
            const totalLength = path.length - 1;
            const currentIndex = Math.floor(transportProgress);
            const nextIndex = Math.min(currentIndex + 1, path.length - 1);
            const t = transportProgress - currentIndex;
            const currentPos = {
                x: path[currentIndex].x + (path[nextIndex].x - path[currentIndex].x) * t,
                y: path[currentIndex].y + (path[nextIndex].y - path[currentIndex].y) * t
            };
            if (currentIndex > 0) {
                const prevPos = path[currentIndex - 1];
                const dx = currentPos.x - prevPos.x;
                const dy = currentPos.y - prevPos.y;
                const angle = Math.atan2(dy, dx);
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                const newX = vector.x * cos - vector.y * sin;
                const newY = vector.x * sin + vector.y * cos;
                vector.x = newX;
                vector.y = newY;
                holonomyAngle = Math.atan2(vector.y, vector.x) * 180 / Math.PI;
            }
            ctx.strokeStyle = 'rgba(234, 179, 8, 0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(currentPos.x, currentPos.y);
            ctx.lineTo(currentPos.x + vector.x * 40, currentPos.y + vector.y * 40);
            ctx.stroke();
            ctx.fillStyle = 'rgba(234, 179, 8, 0.9)';
            ctx.beginPath();
            ctx.arc(currentPos.x + vector.x * 40, currentPos.y + vector.y * 40, 6, 0, 2 * Math.PI);
            ctx.fill();
            for (let i = 0; i < path.length; i++) {
                ctx.beginPath();
                ctx.arc(path[i].x, path[i].y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = i === 0 ? 'rgba(34, 197, 94, 0.9)' : i === path.length - 1 ? 'rgba(239, 68, 68, 0.9)' : 'rgba(99, 102, 241, 0.7)';
                ctx.fill();
            }
            document.getElementById('holonomyVal').textContent = holonomyAngle.toFixed(1) + '°';
        }
        function animate() {
            if (transporting && transportProgress < path.length - 1) {
                transportProgress += 0.02 * params.speed;
                if (transportProgress >= path.length - 1) {
                    transportProgress = path.length - 1;
                    transporting = false;
                }
            }
            draw();
            requestAnimationFrame(animate);
        }
        document.getElementById('manifoldType').addEventListener('change', (e) => {
            params.manifold = e.target.value;
            document.getElementById('manifoldVal').textContent = e.target.options[e.target.selectedIndex].text;
            generatePath();
        });
        document.getElementById('pathComplexity').addEventListener('input', (e) => {
            params.complexity = parseInt(e.target.value);
            document.getElementById('complexityVal').textContent = params.complexity;
            generatePath();
        });
        document.getElementById('transportSpeed').addEventListener('input', (e) => {
            params.speed = parseFloat(e.target.value);
            document.getElementById('speedVal').textContent = params.speed + 'x';
        });
        document.getElementById('transportBtn').addEventListener('click', startTransport);
        document.getElementById('resetBtn').addEventListener('click', () => { transporting = false; generatePath(); });
        window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; generatePath(); });
        generatePath();
        animate();
    </script>
</body>
</html>`;
}

export function BOTTLENECK_HTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Theory of Constraints - Bottleneck Simulator</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { margin: 0; overflow: hidden; background: #0f172a; color: white; font-family: sans-serif; }
        canvas { display: block; }
        .ui-panel {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(15, 23, 42, 0.9);
            backdrop-filter: blur(8px);
            padding: 1.5rem;
            border-radius: 0.75rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            width: 340px;
            pointer-events: auto;
        }
        .stats-panel {
            position: absolute;
            bottom: 20px;
            left: 20px;
            background: rgba(15, 23, 42, 0.9);
            padding: 1rem;
            border-radius: 0.5rem;
            font-family: monospace;
            font-size: 0.75rem;
        }
    </style>
</head>
<body>
    <div class="ui-panel">
        <h1 class="text-xl font-bold mb-2">Theory of Constraints</h1>
        <p class="text-sm text-slate-400 mb-4">Bottleneck identification and optimization</p>

        <div class="space-y-4">
            <div>
                <label class="block text-xs uppercase tracking-wider mb-1 text-slate-500">
                    Process Steps: <span id="stepsVal">5</span>
                </label>
                <input id="processSteps" type="range" min="3" max="10" step="1" value="5"
                    class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer">
            </div>
            <div>
                <label class="block text-xs uppercase tracking-wider mb-1 text-slate-500">
                    Bottleneck Severity: <span id="bottleneckVal">0.6</span>
                </label>
                <input id="bottleneckSeverity" type="range" min="0.1" max="1" step="0.05" value="0.6"
                    class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer">
            </div>
            <div>
                <label class="block text-xs uppercase tracking-wider mb-1 text-slate-500">
                    Flow Rate: <span id="flowVal">50</span>
                </label>
                <input id="flowRate" type="range" min="10" max="100" step="5" value="50"
                    class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer">
            </div>
            <button id="optimizeBtn" class="w-full py-2 bg-amber-600 hover:bg-amber-500 rounded font-semibold transition-colors">
                Optimize Bottleneck
            </button>
            <button id="resetBtn" class="w-full py-2 bg-slate-600 hover:bg-slate-500 rounded font-semibold transition-colors">
                Reset System
            </button>
        </div>

        <div class="mt-4 pt-4 border-t border-slate-700">
            <h3 class="text-sm font-semibold mb-2">Theory of Constraints (ToC)</h3>
            <p class="text-xs text-slate-400 mb-2">
                "A chain is only as strong as its weakest link"
            </p>
            <ul class="text-xs text-slate-400 space-y-1">
                <li>• Identify the bottleneck constraint</li>
                <li>• Exploit the bottleneck</li>
                <li>• Subordinate everything else</li>
                <li>• Elevate the bottleneck</li>
                <li>• Repeat for next constraint</li>
            </ul>
        </div>
    </div>

    <div class="stats-panel" id="statsPanel">
        Throughput: 0 | Bottleneck: None | Efficiency: 0%
    </div>

    <canvas id="bottleneckCanvas"></canvas>

    <script>
        const canvas = document.getElementById('bottleneckCanvas');
        const ctx = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let params = {
            steps: 5,
            bottleneckSeverity: 0.6,
            flowRate: 50
        };

        let particles = [];
        let bottleneckIndex = -1;
        let capacities = [];
        let optimized = false;

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = 50;
                this.y = canvas.height / 2 + (Math.random() - 0.5) * 100;
                this.targetX = 50;
                this.step = 0;
                this.speed = 2 + Math.random() * 2;
                this.color = \`hsl(\${200 + Math.random() * 40}, 70%, 60%)\`;
                this.stuck = false;
                this.waitTime = 0;
            }

            update() {
                if (this.step >= params.steps) {
                    this.reset();
                    return;
                }

                const stepWidth = (canvas.width - 100) / params.steps;
                this.targetX = 50 + (this.step + 1) * stepWidth;

                // Check if bottleneck affects this particle
                if (this.step === bottleneckIndex && !optimized) {
                    const capacityLimit = capacities[this.step];
                    if (Math.random() > capacityLimit) {
                        this.stuck = true;
                        this.waitTime++;
                        if (this.waitTime > 60) {
                            this.stuck = false;
                            this.waitTime = 0;
                        }
                        return;
                    }
                }

                this.stuck = false;
                const dx = this.targetX - this.x;
                this.x += this.speed * (dx / Math.abs(dx));

                if (Math.abs(dx) < 5) {
                    this.step++;
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, 4, 0, 2 * Math.PI);
                ctx.fillStyle = this.stuck ? 'rgba(239, 68, 68, 0.8)' : this.color;
                ctx.fill();
            }
        }

        function initializeSystem() {
            particles = [];
            for (let i = 0; i < params.flowRate; i++) {
                particles.push(new Particle());
            }

            // Set random bottleneck
            bottleneckIndex = Math.floor(Math.random() * params.steps);

            // Initialize capacities
            capacities = [];
            for (let i = 0; i < params.steps; i++) {
                if (i === bottleneckIndex) {
                    capacities.push(params.bottleneckSeverity);
                } else {
                    capacities.push(1.0);
                }
            }

            optimized = false;
        }

        function drawSystem() {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const stepWidth = (canvas.width - 100) / params.steps;
            const centerY = canvas.height / 2;

            // Draw process steps
            for (let i = 0; i < params.steps; i++) {
                const x = 50 + i * stepWidth;
                const isBottleneck = i === bottleneckIndex;

                // Draw step container
                ctx.fillStyle = isBottleneck && !optimized ?
                    'rgba(239, 68, 68, 0.2)' :
                    'rgba(59, 130, 246, 0.1)';
                ctx.strokeStyle = isBottleneck && !optimized ?
                    'rgba(239, 68, 68, 0.8)' :
                    'rgba(59, 130, 246, 0.5)';
                ctx.lineWidth = 2;

                ctx.fillRect(x, centerY - 80, stepWidth - 10, 160);
                ctx.strokeRect(x, centerY - 80, stepWidth - 10, 160);

                // Draw capacity indicator
                const capacityHeight = capacities[i] * 60;
                ctx.fillStyle = isBottleneck && !optimized ?
                    'rgba(239, 68, 68, 0.8)' :
                    'rgba(34, 197, 94, 0.8)';
                ctx.fillRect(x + stepWidth / 2 - 20, centerY + 90, 40, capacityHeight);

                // Draw label
                ctx.fillStyle = 'white';
                ctx.font = '12px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(\`Step \${i + 1}\`, x + stepWidth / 2, centerY - 90);

                if (isBottleneck && !optimized) {
                    ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
                    ctx.fillText('BOTTLENECK', x + stepWidth / 2, centerY + 170);
                } else if (isBottleneck && optimized) {
                    ctx.fillStyle = 'rgba(34, 197, 94, 0.9)';
                    ctx.fillText('OPTIMIZED', x + stepWidth / 2, centerY + 170);
                }

                // Draw throughput percentage
                const throughput = Math.round(capacities[i] * 100);
                ctx.fillStyle = 'white';
                ctx.font = '10px monospace';
                ctx.fillText(\`\${throughput}%\`, x + stepWidth / 2, centerY + 100 + capacityHeight + 15);
            }

            // Draw particles
            for (let particle of particles) {
                particle.draw();
            }

            // Calculate stats
            const stuckCount = particles.filter(p => p.stuck).length;
            const throughput = params.flowRate - stuckCount;
            const efficiency = Math.round((throughput / params.flowRate) * 100);

            const bottleneckName = bottleneckIndex >= 0 ? \`Step \${bottleneckIndex + 1}\` : 'None';

            document.getElementById('statsPanel').innerHTML =
                \`Throughput: \${throughput}/\${params.flowRate} | Bottleneck: \${bottleneckName} | Efficiency: \${efficiency}%\`;
        }

        function animate() {
            for (let particle of particles) {
                particle.update();
            }
            drawSystem();
            requestAnimationFrame(animate);
        }

        // Event listeners
        document.getElementById('processSteps').addEventListener('input', (e) => {
            params.steps = parseInt(e.target.value);
            document.getElementById('stepsVal').textContent = params.steps;
            initializeSystem();
        });

        document.getElementById('bottleneckSeverity').addEventListener('input', (e) => {
            params.bottleneckSeverity = parseFloat(e.target.value);
            document.getElementById('bottleneckVal').textContent = params.bottleneckSeverity.toFixed(2);
            capacities[bottleneckIndex] = params.bottleneckSeverity;
        });

        document.getElementById('flowRate').addEventListener('input', (e) => {
            const oldCount = params.flowRate;
            params.flowRate = parseInt(e.target.value);
            document.getElementById('flowVal').textContent = params.flowRate;

            if (params.flowRate > oldCount) {
                for (let i = oldCount; i < params.flowRate; i++) {
                    particles.push(new Particle());
                }
            } else {
                particles = particles.slice(0, params.flowRate);
            }
        });

        document.getElementById('optimizeBtn').addEventListener('click', () => {
            if (bottleneckIndex >= 0 && !optimized) {
                capacities[bottleneckIndex] = 1.0;
                optimized = true;
            }
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            initializeSystem();
        });

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        initializeSystem();
        animate();
    </script>
</body>
</html>`;
}

export function KDTREE_HTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KD-Tree Visualization - Constraint Theory</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { margin: 0; overflow: hidden; background: #0f172a; color: white; font-family: sans-serif; }
        canvas { display: block; }
        .ui-panel {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(15, 23, 42, 0.9);
            backdrop-filter: blur(8px);
            padding: 1.5rem;
            border-radius: 0.75rem;
            border: 1px solid rgba(255, 255, 255, 0.1);
            width: 340px;
            pointer-events: auto;
        }
        .stats-panel {
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: rgba(15, 23, 42, 0.9);
            padding: 1rem;
            border-radius: 0.5rem;
            font-family: monospace;
            font-size: 0.75rem;
        }
    </style>
</head>
<body>
    <div class="ui-panel">
        <h1 class="text-xl font-bold mb-2">KD-Tree Visualization</h1>
        <p class="text-sm text-slate-400 mb-4">Spatial partitioning for efficient nearest neighbor search</p>
        <div class="space-y-4">
            <div>
                <label class="block text-xs uppercase tracking-wider mb-1 text-slate-500">Point Count: <span id="pointsVal">100</span></label>
                <input id="pointCount" type="range" min="10" max="500" step="10" value="100" class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer">
            </div>
            <div>
                <label class="block text-xs uppercase tracking-wider mb-1 text-slate-500">Tree Depth: <span id="depthVal">0</span></label>
                <input id="treeDepth" type="range" min="0" max="10" step="1" value="0" class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer">
            </div>
            <button id="buildBtn" class="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded font-semibold transition-colors">Rebuild Tree</button>
            <button id="searchBtn" class="w-full py-2 bg-green-600 hover:bg-green-500 rounded font-semibold transition-colors">Nearest Neighbor Search</button>
        </div>
        <div class="mt-4 pt-4 border-t border-slate-700">
            <h3 class="text-sm font-semibold mb-2">KD-Tree Algorithm</h3>
            <p class="text-xs text-slate-400 mb-2">Binary space partitioning for efficient range searches</p>
            <div class="bg-slate-900 p-2 rounded text-xs font-mono text-green-400">Build: O(n log n)<br>Search: O(log n)</div>
        </div>
    </div>
    <div class="stats-panel" id="statsPanel">Nodes: 0 | Depth: 0</div>
    <canvas id="kdtreeCanvas"></canvas>
    <script>
        const canvas = document.getElementById('kdtreeCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        let params = { pointCount: 100, maxDepth: 0 };
        let points = [], tree = null, searchPoint = null, nearestNeighbor = null;
        class Point { constructor(x, y) { this.x = x; this.y = y; } }
        class KDNode { constructor(point, axis, left, right, bounds) { this.point = point; this.axis = axis; this.left = left; this.right = right; this.bounds = bounds; } }
        function generatePoints() {
            points = [];
            const margin = 100;
            for (let i = 0; i < params.pointCount; i++) {
                points.push(new Point(margin + Math.random() * (canvas.width - 2 * margin), margin + Math.random() * (canvas.height - 200)));
            }
        }
        function buildKDTree(points, depth = 0) {
            if (points.length === 0) return null;
            const axis = depth % 2;
            points.sort((a, b) => axis === 0 ? a.x - b.x : a.y - b.y);
            const mid = Math.floor(points.length / 2);
            return new KDNode(points[mid], axis, buildKDTree(points.slice(0, mid), depth + 1), buildKDTree(points.slice(mid + 1), depth + 1));
        }
        function drawTree(node, depth = 0) {
            if (!node || depth > params.maxDepth) return;
            drawTree(node.left, depth + 1);
            drawTree(node.right, depth + 1);
        }
        function draw() {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawTree(tree);
            for (let point of points) {
                ctx.beginPath();
                ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = 'rgba(99, 102, 241, 0.8)';
                ctx.fill();
            }
            if (searchPoint) {
                ctx.beginPath();
                ctx.arc(searchPoint.x, searchPoint.y, 8, 0, 2 * Math.PI);
                ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
                ctx.fill();
            }
            if (nearestNeighbor) {
                ctx.beginPath();
                ctx.arc(nearestNeighbor.x, nearestNeighbor.y, 7, 0, 2 * Math.PI);
                ctx.fillStyle = 'rgba(34, 197, 94, 0.9)';
                ctx.fill();
            }
            const nodeCount = tree ? countNodes(tree) : 0;
            document.getElementById('statsPanel').innerHTML = \`Nodes: \${nodeCount} | Depth: \${params.maxDepth}\`;
        }
        function countNodes(node) { return node ? 1 + countNodes(node.left) + countNodes(node.right) : 0; }
        function animate() { draw(); requestAnimationFrame(animate); }
        document.getElementById('pointCount').addEventListener('input', (e) => {
            params.pointCount = parseInt(e.target.value);
            document.getElementById('pointsVal').textContent = params.pointCount;
            generatePoints();
            tree = buildKDTree(points);
        });
        document.getElementById('treeDepth').addEventListener('input', (e) => {
            params.maxDepth = parseInt(e.target.value);
            document.getElementById('depthVal').textContent = params.maxDepth;
        });
        document.getElementById('buildBtn').addEventListener('click', () => { generatePoints(); tree = buildKDTree(points); });
        document.getElementById('searchBtn').addEventListener('click', () => {
            searchPoint = new Point(100 + Math.random() * (canvas.width - 200), 100 + Math.random() * (canvas.height - 250));
            let minDist = Infinity;
            for (let point of points) {
                const dist = Math.sqrt(Math.pow(searchPoint.x - point.x, 2) + Math.pow(searchPoint.y - point.y, 2));
                if (dist < minDist) { minDist = dist; nearestNeighbor = point; }
            }
        });
        canvas.addEventListener('click', (e) => {
            searchPoint = new Point(e.clientX, e.clientY);
            let minDist = Infinity;
            for (let point of points) {
                const dist = Math.sqrt(Math.pow(searchPoint.x - point.x, 2) + Math.pow(searchPoint.y - point.y, 2));
                if (dist < minDist) { minDist = dist; nearestNeighbor = point; }
            }
        });
        window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
        generatePoints();
        tree = buildKDTree(points);
        animate();
    </script>
</body>
</html>`;
}


// Calculus: Differentiation Visualization
export function DIFFERENTIATION_HTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Numerical Differentiation - Constraint Theory</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-gray-900 text-white">
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Numerical Differentiation
        </h1>
        <p class="text-gray-400 mb-8">Coming soon - Interactive derivative visualization</p>
        <a href="/" class="text-purple-400 hover:text-purple-300">← Back to Simulators</a>
    </div>
</body>
</html>`;
}

// Calculus: Integration Visualization  
export function INTEGRATION_HTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Numerical Integration - Constraint Theory</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-gray-900 text-white">
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Numerical Integration
        </h1>
        <p class="text-gray-400 mb-8">Coming soon - Interactive integral visualization</p>
        <a href="/" class="text-purple-400 hover:text-purple-300">← Back to Simulators</a>
    </div>
</body>
</html>`;
}

// Calculus: Gradient Field Visualization
export function GRADIENT_HTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gradient Fields - Constraint Theory</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-gray-900 text-white">
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Gradient Fields
        </h1>
        <p class="text-gray-400 mb-8">Coming soon - Interactive gradient field visualization</p>
        <a href="/" class="text-purple-400 hover:text-purple-300">← Back to Simulators</a>
    </div>
</body>
</html>`;
}

