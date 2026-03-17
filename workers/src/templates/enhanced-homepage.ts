/**
 * Enhanced Homepage with UX Flow Improvements
 * Implements better navigation, simulator discovery, and user journey
 */

import { SIMULATORS, CATEGORIES, DIFFICULTY_LEVELS, generateStickyHeader, generateSearchModal, SimulatorInfo } from '../components/navigation';

export function ENHANCED_HOMEPAGE_HTML(): string {
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
        .loading-spinner {
            border: 3px solid rgba(255,255,255,0.1);
            border-top: 3px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .fade-in {
            animation: fadeIn 0.5s ease-in;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
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
        .simulator-iframe {
            border: none;
            border-radius: 12px;
            width: 100%;
            height: 400px;
            background: #1a1a2e;
        }
        .category-tab {
            transition: all 0.3s ease;
        }
        .category-tab.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
    </style>
</head>
<body class="bg-gray-900 text-white">
    ${generateStickyHeader('/')}

    ${generateSearchModal()}

    <!-- Hero Section with Embedded Preview -->
    <section class="pt-32 pb-12 px-4">
        <div class="container mx-auto max-w-6xl">
            <div class="grid lg:grid-cols-2 gap-12 items-center">
                <!-- Left: Hero Content -->
                <div class="fade-in">
                    <div class="inline-block mb-6 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full">
                        <span class="text-purple-400 text-sm font-medium">Open Source Research Implementation</span>
                    </div>
                    <h1 class="text-5xl md:text-6xl font-bold mb-6">
                        <span class="gradient-text">Constraint Theory</span>
                        <br>
                        <span class="text-white">Deterministic Geometric Logic</span>
                    </h1>
                    <p class="text-xl text-gray-400 mb-8 leading-relaxed">
                        A research implementation of deterministic geometric logic for computational systems.
                        Explore mathematical foundations through interactive visualizations.
                    </p>
                    <div class="flex flex-wrap gap-4 mb-8">
                        <a href="#simulators" class="px-8 py-4 hero-gradient hover:opacity-90 rounded-lg text-lg font-semibold transition flex items-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            Explore Simulators
                        </a>
                        <a href="#quickstart" class="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg text-lg font-semibold transition">
                            Quick Start Guide
                        </a>
                    </div>

                    <!-- Key Concepts -->
                    <div class="grid grid-cols-4 gap-4">
                        <div class="text-center">
                            <div class="metric-value text-purple-400">Ω</div>
                            <div class="text-xs text-gray-400 mt-1">Origin-Centric</div>
                        </div>
                        <div class="text-center">
                            <div class="metric-value text-green-400">Φ</div>
                            <div class="text-xs text-gray-400 mt-1">Geometric Folding</div>
                        </div>
                        <div class="text-center">
                            <div class="metric-value text-blue-400">△</div>
                            <div class="text-xs text-gray-400 mt-1">Pythagorean</div>
                        </div>
                        <div class="text-center">
                            <div class="metric-value">📐</div>
                            <div class="text-xs text-gray-400 mt-1">Rigidity</div>
                        </div>
                    </div>
                </div>

                <!-- Right: Interactive Preview -->
                <div class="relative">
                    <div class="absolute -inset-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-2xl opacity-20"></div>
                    <div class="relative bg-gray-800 rounded-xl p-2 border border-gray-700">
                        <div class="flex items-center justify-between mb-2 px-2">
                            <div class="flex items-center gap-2">
                                <div class="w-3 h-3 rounded-full bg-red-500"></div>
                                <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div class="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <span class="text-xs text-gray-400">Live Preview</span>
                        </div>
                        <iframe src="/simulators/voxel/" class="simulator-iframe" loading="lazy"></iframe>
                        <div class="mt-2 text-center">
                            <a href="/simulators/voxel/" class="text-sm text-purple-400 hover:text-purple-300 transition">
                                Open in full screen →
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Learning Path Section -->
    <section class="py-16 px-4 bg-gray-800/30">
        <div class="container mx-auto max-w-6xl">
            <div class="text-center mb-12">
                <h2 class="text-4xl font-bold mb-4">Recommended Learning Path</h2>
                <p class="text-xl text-gray-400">Follow our curated journey through constraint theory concepts</p>
            </div>

            <div class="relative">
                <!-- Learning Path Timeline -->
                <div class="hidden lg:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-purple-500 to-pink-500"></div>

                <div class="space-y-12">
                    <!-- Step 1 -->
                    <div class="relative flex items-center justify-center">
                        <div class="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-purple-500 rounded-full border-4 border-gray-900 z-10"></div>
                        <div class="grid lg:grid-cols-2 gap-8 w-full">
                            <div class="lg:text-right">
                                <div class="bg-gray-800 rounded-xl p-6 card-hover">
                                    <div class="flex items-center gap-3 mb-4 lg:justify-end">
                                        <span class="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">Beginner</span>
                                        <span class="text-gray-400 text-sm">5 min</span>
                                    </div>
                                    <h3 class="text-2xl font-bold mb-2">1. Start with Pythagorean Snapping</h3>
                                    <p class="text-gray-400 mb-4">Learn how vectors snap to integer ratios for deterministic alignment</p>
                                    <a href="/simulators/pythagorean/" class="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300">
                                        Start learning
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                            <div></div>
                        </div>
                    </div>

                    <!-- Step 2 -->
                    <div class="relative flex items-center justify-center">
                        <div class="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-purple-400 rounded-full border-4 border-gray-900 z-10"></div>
                        <div class="grid lg:grid-cols-2 gap-8 w-full">
                            <div></div>
                            <div>
                                <div class="bg-gray-800 rounded-xl p-6 card-hover">
                                    <div class="flex items-center gap-3 mb-4">
                                        <span class="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">Intermediate</span>
                                        <span class="text-gray-400 text-sm">10 min</span>
                                    </div>
                                    <h3 class="text-2xl font-bold mb-2">2. Explore Rigidity Matroid</h3>
                                    <p class="text-gray-400 mb-4">Understand Laman's Theorem and structural rigidity visualization</p>
                                    <a href="/simulators/rigidity/" class="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300">
                                        Continue learning
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Step 3 -->
                    <div class="relative flex items-center justify-center">
                        <div class="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-pink-500 rounded-full border-4 border-gray-900 z-10"></div>
                        <div class="grid lg:grid-cols-2 gap-8 w-full">
                            <div class="lg:text-right">
                                <div class="bg-gray-800 rounded-xl p-6 card-hover">
                                    <div class="flex items-center gap-3 mb-4 lg:justify-end">
                                        <span class="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">Intermediate</span>
                                        <span class="text-gray-400 text-sm">8 min</span>
                                    </div>
                                    <h3 class="text-2xl font-bold mb-2">3. Visualize Entropy</h3>
                                    <p class="text-gray-400 mb-4">See how entropy changes in constrained systems</p>
                                    <a href="/simulators/entropy/" class="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300">
                                        Deepen understanding
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                            <div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Interactive Simulators Section -->
    <section id="simulators" class="py-20 px-4">
        <div class="container mx-auto max-w-6xl">
            <div class="text-center mb-12">
                <h2 class="text-4xl font-bold mb-4">Interactive Simulators</h2>
                <p class="text-xl text-gray-400 mb-8">Explore all available visualizations</p>

                <!-- Category Filter Tabs -->
                <div class="flex flex-wrap justify-center gap-2 mb-8">
                    <button class="category-tab active px-4 py-2 rounded-lg text-sm font-medium transition" data-category="all">
                        All Simulators
                    </button>
                    ${Object.entries(CATEGORIES).map(([key, cat]) => `
                        <button class="category-tab px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 hover:bg-gray-700 transition" data-category="${key}">
                            ${cat.name}
                        </button>
                    `).join('')}
                </div>

                <!-- Difficulty Filter -->
                <div class="flex flex-wrap justify-center gap-2">
                    <button class="difficulty-filter px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 transition" data-difficulty="all">
                        All Levels
                    </button>
                    ${Object.entries(DIFFICULTY_LEVELS).map(([key, diff]) => `
                        <button class="difficulty-filter px-3 py-1 rounded-full text-xs font-medium ${diff.bg} ${diff.color} transition" data-difficulty="${key}">
                            ${diff.name}
                        </button>
                    `).join('')}
                </div>
            </div>

            <!-- Simulators Grid -->
            <div id="simulators-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${SIMULATORS.map(sim => generateSimulatorCard(sim)).join('')}
            </div>
        </div>
    </section>

    <!-- Quick Start Section -->
    <section id="quickstart" class="py-20 px-4 bg-gray-800/30">
        <div class="container mx-auto max-w-4xl">
            <div class="text-center mb-12">
                <h2 class="text-4xl font-bold mb-4">Quick Start Guide</h2>
                <p class="text-xl text-gray-400">Get started with constraint theory in 3 simple steps</p>
            </div>

            <div class="space-y-6">
                <div class="bg-gray-800 rounded-xl p-6 card-hover">
                    <div class="flex items-start gap-4">
                        <div class="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span class="text-white font-bold">1</span>
                        </div>
                        <div>
                            <h3 class="text-xl font-semibold mb-2">Choose Your Starting Point</h3>
                            <p class="text-gray-400 mb-4">Begin with Pythagorean Snapping if you're new, or jump to any simulator that matches your interests.</p>
                            <a href="#simulators" class="text-purple-400 hover:text-purple-300">Browse simulators →</a>
                        </div>
                    </div>
                </div>

                <div class="bg-gray-800 rounded-xl p-6 card-hover">
                    <div class="flex items-start gap-4">
                        <div class="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span class="text-white font-bold">2</span>
                        </div>
                        <div>
                            <h3 class="text-xl font-semibold mb-2">Interact & Experiment</h3>
                            <p class="text-gray-400 mb-4">Each simulator includes interactive controls. Try different parameters and observe how constraints affect the system.</p>
                            <a href="/simulators/pythagorean/" class="text-purple-400 hover:text-purple-300">Try Pythagorean Snapping →</a>
                        </div>
                    </div>
                </div>

                <div class="bg-gray-800 rounded-xl p-6 card-hover">
                    <div class="flex items-start gap-4">
                        <div class="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span class="text-white font-bold">3</span>
                        </div>
                        <div>
                            <h3 class="text-xl font-semibold mb-2">Follow the Learning Path</h3>
                            <p class="text-gray-400 mb-4">Progress through recommended simulators to build a comprehensive understanding of constraint theory.</p>
                            <a href="#learning-path" class="text-purple-400 hover:text-purple-300">View learning path →</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Documentation Section -->
    <section id="docs" class="py-20 px-4">
        <div class="container mx-auto max-w-6xl">
            <div class="text-center mb-12">
                <h2 class="text-4xl font-bold mb-4">Documentation & Resources</h2>
                <p class="text-xl text-gray-400">Deep dive into constraint theory concepts</p>
            </div>

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <a href="/api/docs" class="bg-gray-800 rounded-xl p-6 card-hover block">
                    <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">API Documentation</h3>
                    <p class="text-gray-400 mb-4">Complete API reference for integrating constraint theory into your projects</p>
                    <div class="flex items-center text-blue-400">
                        <span class="text-sm font-medium">View API docs</span>
                        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                </a>

                <a href="https://github.com/SuperInstance/constrainttheory" target="_blank" rel="noopener" class="bg-gray-800 rounded-xl p-6 card-hover block">
                    <div class="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                        <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Source Code</h3>
                    <p class="text-gray-400 mb-4">Explore the complete implementation on GitHub</p>
                    <div class="flex items-center text-gray-400">
                        <span class="text-sm font-medium">View on GitHub</span>
                        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                        </svg>
                    </div>
                </a>

                <a href="https://github.com/SuperInstance/SuperInstance-papers" target="_blank" rel="noopener" class="bg-gray-800 rounded-xl p-6 card-hover block">
                    <div class="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                        </svg>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Research Papers</h3>
                    <p class="text-gray-400 mb-4">Read the theoretical foundations and mathematical proofs</p>
                    <div class="flex items-center text-green-400">
                        <span class="text-sm font-medium">Explore papers</span>
                        <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </div>
                </a>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 px-4 bg-gray-800/50 border-t border-gray-800">
        <div class="container mx-auto max-w-6xl">
            <div class="grid md:grid-cols-4 gap-8">
                <div>
                    <div class="flex items-center gap-2 mb-4">
                        <div class="w-8 h-8 hero-gradient rounded-lg flex items-center justify-center">
                            <span class="text-white font-bold text-sm">Ω</span>
                        </div>
                        <span class="font-bold">Constraint Theory</span>
                    </div>
                    <p class="text-gray-400 text-sm">Deterministic geometric logic for computational systems.</p>
                </div>
                <div>
                    <h4 class="font-semibold mb-4">Simulators</h4>
                    <ul class="space-y-2 text-sm text-gray-400">
                        <li><a href="/simulators/pythagorean/" class="hover:text-white transition">Pythagorean Snapping</a></li>
                        <li><a href="/simulators/rigidity/" class="hover:text-white transition">Rigidity Matroid</a></li>
                        <li><a href="/simulators/voxel/" class="hover:text-white transition">3D Physics</a></li>
                        <li><a href="/simulators/entropy/" class="hover:text-white transition">Entropy</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold mb-4">Resources</h4>
                    <ul class="space-y-2 text-sm text-gray-400">
                        <li><a href="/api/docs" class="hover:text-white transition">API Documentation</a></li>
                        <li><a href="https://github.com/SuperInstance/constrainttheory" class="hover:text-white transition">Source Code</a></li>
                        <li><a href="https://github.com/SuperInstance/SuperInstance-papers" class="hover:text-white transition">Research Papers</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold mb-4">Community</h4>
                    <ul class="space-y-2 text-sm text-gray-400">
                        <li><a href="https://github.com/SuperInstance/constrainttheory/issues" class="hover:text-white transition">Report Issues</a></li>
                        <li><a href="https://github.com/SuperInstance/constrainttheory/discussions" class="hover:text-white transition">Discussions</a></li>
                        <li><a href="https://github.com/SuperInstance/constrainttheory" class="hover:text-white transition">GitHub</a></li>
                    </ul>
                </div>
            </div>
            <div class="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
                <p>© 2024 SuperInstance. Open source research implementation.</p>
            </div>
        </div>
    </footer>

    <script>
        // Category filter functionality
        const categoryTabs = document.querySelectorAll('.category-tab');
        const difficultyFilters = document.querySelectorAll('.difficulty-filter');
        const simulatorCards = document.querySelectorAll('#simulators-grid > a');

        let activeCategory = 'all';
        let activeDifficulty = 'all';

        function filterSimulators() {
            simulatorCards.forEach(card => {
                const cardCategory = card.dataset.category;
                const cardDifficulty = card.dataset.difficulty;

                const categoryMatch = activeCategory === 'all' || cardCategory === activeCategory;
                const difficultyMatch = activeDifficulty === 'all' || cardDifficulty === activeDifficulty;

                card.style.display = (categoryMatch && difficultyMatch) ? 'block' : 'none';
            });
        }

        categoryTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                categoryTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                activeCategory = tab.dataset.category;
                filterSimulators();
            });
        });

        difficultyFilters.forEach(filter => {
            filter.addEventListener('click', () => {
                activeDifficulty = filter.dataset.difficulty;
                filterSimulators();
            });
        });

        // Smooth scroll for anchor links
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

        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.card-hover').forEach(card => {
            observer.observe(card);
        });
    </script>
</body>
</html>`;
}

// Helper function to generate simulator card HTML
function generateSimulatorCard(sim: SimulatorInfo): string {
  return `
    <a href="/simulators/${sim.id}/"
       class="bg-gray-800 rounded-xl p-6 card-hover block"
       data-category="${sim.category}"
       data-difficulty="${sim.difficulty}">
        <div class="w-12 h-12 bg-gradient-to-br ${sim.gradient} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span class="text-white text-2xl">${sim.icon}</span>
        </div>
        <div class="flex items-start justify-between mb-2">
            <h3 class="text-xl font-semibold">${sim.name}</h3>
            <span class="px-2 py-1 ${DIFFICULTY_LEVELS[sim.difficulty].bg} ${DIFFICULTY_LEVELS[sim.difficulty].color} rounded text-xs font-medium">
                ${DIFFICULTY_LEVELS[sim.difficulty].name}
            </span>
        </div>
        <p class="text-gray-400 mb-4 text-sm">${sim.description}</p>
        <div class="flex items-center gap-4 text-xs text-gray-500 mb-4">
            <span class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                ${sim.duration}
            </span>
            <span class="px-2 py-1 bg-gray-700 rounded text-xs">
                ${CATEGORIES[sim.category].name}
            </span>
        </div>
        <div class="flex items-center text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <span class="text-sm font-medium">Start learning</span>
            <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
        </div>
    </a>
  `;
}
