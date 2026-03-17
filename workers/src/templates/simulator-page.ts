/**
 * Enhanced Simulator Page Template
 * Includes breadcrumb navigation, quick nav, progress tracking, and improved UX
 */

import { SIMULATORS, generateStickyHeader, generateBreadcrumbs, generateQuickNav, SIMULATORS as SimulatorList } from '../components/navigation';

export function ENHANCED_SIMULATOR_PAGE(
  simulatorId: string,
  title: string,
  description: string,
  content: string,
  additionalScripts: string = ''
): string {
  const sim = SimulatorList.find(s => s.id === simulatorId);
  const currentIndex = SimulatorList.findIndex(s => s.id === simulatorId);
  const prevSim = currentIndex > 0 ? SimulatorList[currentIndex - 1] : null;
  const nextSim = currentIndex < SimulatorList.length - 1 ? SimulatorList[currentIndex + 1] : null;

  const tutorialSteps = [
    'Read the concept overview',
    'Interact with the visualization',
    'Experiment with parameters',
    'Complete the challenge'
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${description}">
    <title>${title} - Constraint Theory</title>
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
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .loading-overlay {
            position: fixed;
            inset: 0;
            background: rgba(17, 24, 39, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
            transition: opacity 0.3s ease;
        }
        .loading-spinner {
            border: 4px solid rgba(255,255,255,0.1);
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 50px;
            height: 50px;
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
        .tutorial-panel {
            transition: all 0.3s ease;
        }
        .tutorial-panel.collapsed {
            max-height: 60px;
            overflow: hidden;
        }
        .tutorial-panel.expanded {
            max-height: none;
        }
    </style>
</head>
<body class="bg-gray-900 text-white">
    <!-- Loading Overlay -->
    <div id="loading-overlay" class="loading-overlay">
        <div class="text-center">
            <div class="loading-spinner mx-auto mb-4"></div>
            <p class="text-gray-400">Loading simulator...</p>
        </div>
    </div>

    ${generateStickyHeader(`/simulators/${simulatorId}/`)}

    ${generateBreadcrumbs([
      { name: 'Home', href: '/' },
      { name: 'Simulators', href: '/#simulators' },
      { name: title }
    ])}

    <!-- Progress Indicator -->
    <div class="bg-gray-800/30 border-b border-gray-800 px-4 py-4">
        <div class="container mx-auto max-w-6xl">
            <div class="flex items-center justify-between mb-3">
                <div class="text-sm text-gray-400">
                    Your progress: <span class="text-white font-medium" id="progress-percent">0%</span>
                </div>
                <button id="toggle-tutorial" class="text-sm text-purple-400 hover:text-purple-300 transition">
                    Show Tutorial Guide
                </button>
            </div>
            <div class="w-full bg-gray-700 rounded-full h-2">
                <div id="progress-bar" class="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500" style="width: 0%"></div>
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <main class="pt-8 pb-20 px-4">
        <div class="container mx-auto max-w-6xl">
            <!-- Header Section -->
            <div class="mb-8 fade-in">
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <h1 class="text-4xl font-bold mb-2">${title}</h1>
                        <p class="text-xl text-gray-400">${description}</p>
                    </div>
                    ${sim ? `
                        <div class="flex flex-col gap-2 items-end">
                            <span class="px-3 py-1 ${sim.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' : sim.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'} rounded-full text-sm font-medium">
                                ${sim.difficulty.charAt(0).toUpperCase() + sim.difficulty.slice(1)}
                            </span>
                            <span class="text-sm text-gray-400">
                                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                ${sim.duration}
                            </span>
                        </div>
                    ` : ''}
                </div>
            </div>

            <div class="grid lg:grid-cols-3 gap-8">
                <!-- Main Content Area -->
                <div class="lg:col-span-2">
                    <!-- Simulator Canvas -->
                    <div class="bg-gray-800 rounded-xl overflow-hidden mb-8">
                        ${content}
                    </div>

                    <!-- Concept Explanation -->
                    <div class="bg-gray-800 rounded-xl p-6 mb-8">
                        <h2 class="text-2xl font-bold mb-4">Understanding the Concept</h2>
                        <div id="concept-content" class="prose prose-invert max-w-none">
                            <p class="text-gray-300 mb-4">
                                This simulator demonstrates key concepts from constraint theory.
                                Use the interactive controls to explore how geometric constraints affect the system.
                            </p>
                            <div class="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                                <h3 class="font-semibold text-purple-400 mb-2">Key Takeaways</h3>
                                <ul class="list-disc list-inside text-gray-300 space-y-1">
                                    <li>Observe how the system responds to constraint changes</li>
                                    <li>Experiment with different parameter combinations</li>
                                    <li>Notice patterns in the geometric relationships</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Challenge Section -->
                    <div class="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/30">
                        <h2 class="text-2xl font-bold mb-4">🎯 Challenge</h2>
                        <p class="text-gray-300 mb-4">
                            Try to achieve the following goals with this simulator:
                        </p>
                        <ul class="space-y-2">
                            <li class="flex items-start gap-2">
                                <input type="checkbox" id="challenge-1" class="mt-1 challenge-checkbox">
                                <label for="challenge-1" class="text-gray-300">Create a stable configuration</label>
                            </li>
                            <li class="flex items-start gap-2">
                                <input type="checkbox" id="challenge-2" class="mt-1 challenge-checkbox">
                                <label for="challenge-2" class="text-gray-300">Find the optimal parameter setting</label>
                            </li>
                            <li class="flex items-start gap-2">
                                <input type="checkbox" id="challenge-3" class="mt-1 challenge-checkbox">
                                <label for="challenge-3" class="text-gray-300">Observe and explain the behavior</label>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Sidebar -->
                <div class="space-y-6">
                    <!-- Tutorial Guide -->
                    <div id="tutorial-panel" class="tutorial-panel collapsed bg-gray-800 rounded-xl p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="font-bold">Tutorial Guide</h3>
                            <button id="expand-tutorial" class="text-purple-400 hover:text-purple-300">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                                </svg>
                            </button>
                        </div>
                        <div class="space-y-3">
                            ${tutorialSteps.map((step, i) => `
                                <div class="flex items-start gap-3">
                                    <div class="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-medium flex-shrink-0">
                                        ${i + 1}
                                    </div>
                                    <p class="text-sm text-gray-300">${step}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Parameters Reference -->
                    <div class="bg-gray-800 rounded-xl p-6">
                        <h3 class="font-bold mb-4">Parameters</h3>
                        <div class="space-y-3 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-400">Resolution</span>
                                <span class="text-white">Adjustable</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Speed</span>
                                <span class="text-white">Real-time</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-400">Interactive</span>
                                <span class="text-green-400">Yes</span>
                            </div>
                        </div>
                    </div>

                    <!-- Related Simulators -->
                    <div class="bg-gray-800 rounded-xl p-6">
                        <h3 class="font-bold mb-4">Continue Learning</h3>
                        <div class="space-y-3">
                            ${prevSim ? `
                                <a href="/simulators/${prevSim.id}/" class="flex items-center gap-3 text-gray-300 hover:text-white transition">
                                    <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                                    </svg>
                                    <div>
                                        <div class="text-xs text-gray-500">Previous</div>
                                        <div class="font-medium">${prevSim.name}</div>
                                    </div>
                                </a>
                            ` : ''}
                            ${nextSim ? `
                                <a href="/simulators/${nextSim.id}/" class="flex items-center gap-3 text-gray-300 hover:text-white transition">
                                    <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                    </svg>
                                    <div>
                                        <div class="text-xs text-gray-500">Next</div>
                                        <div class="font-medium">${nextSim.name}</div>
                                    </div>
                                </a>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="bg-gray-800 rounded-xl p-6">
                        <h3 class="font-bold mb-4">Quick Actions</h3>
                        <div class="space-y-2">
                            <button id="reset-sim" class="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition">
                                Reset Simulator
                            </button>
                            <button id="randomize" class="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition">
                                Randomize Parameters
                            </button>
                            <a href="/#simulators" class="block text-center px-4 py-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg text-sm transition">
                                Back to All Simulators
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Quick Navigation (Bottom Right) -->
    <div class="fixed bottom-6 right-6 z-40 flex flex-col gap-2">
        ${prevSim ? `
            <a href="/simulators/${prevSim.id}/"
               class="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg shadow-lg transition group">
                <svg class="w-5 h-5 text-gray-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                <div class="text-left">
                    <div class="text-xs text-gray-400">Previous</div>
                    <div class="text-sm font-medium">${prevSim.name}</div>
                </div>
            </a>
        ` : ''}
        ${nextSim ? `
            <a href="/simulators/${nextSim.id}/"
               class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg hover:opacity-90 transition group">
                <div class="text-right">
                    <div class="text-xs text-purple-200">Next</div>
                    <div class="text-sm font-medium">${nextSim.name}</div>
                </div>
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
            </a>
        ` : ''}
    </div>

    <script>
        // Hide loading overlay when page is ready
        window.addEventListener('load', () => {
            setTimeout(() => {
                const overlay = document.getElementById('loading-overlay');
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.style.display = 'none';
                }, 300);
            }, 500);
        });

        // Progress tracking
        let progress = 0;
        const progressBar = document.getElementById('progress-bar');
        const progressPercent = document.getElementById('progress-percent');
        const challengeCheckboxes = document.querySelectorAll('.challenge-checkbox');

        function updateProgress() {
            const checked = Array.from(challengeCheckboxes).filter(cb => cb.checked).length;
            progress = Math.round((checked / challengeCheckboxes.length) * 100);
            progressBar.style.width = progress + '%';
            progressPercent.textContent = progress + '%';

            // Save progress to localStorage
            localStorage.setItem('simulator-${simulatorId}-progress', progress);
            localStorage.setItem('simulator-${simulatorId}-challenges', JSON.stringify(
                Array.from(challengeCheckboxes).map(cb => cb.checked)
            ));
        }

        // Load saved progress
        const savedProgress = localStorage.getItem('simulator-${simulatorId}-progress');
        const savedChallenges = localStorage.getItem('simulator-${simulatorId}-challenges');
        if (savedProgress) {
            progress = parseInt(savedProgress);
            progressBar.style.width = progress + '%';
            progressPercent.textContent = progress + '%';
        }
        if (savedChallenges) {
            const challenges = JSON.parse(savedChallenges);
            challengeCheckboxes.forEach((cb, i) => {
                if (challenges[i]) cb.checked = true;
            });
        }

        challengeCheckboxes.forEach(cb => {
            cb.addEventListener('change', updateProgress);
        });

        // Tutorial panel toggle
        const tutorialPanel = document.getElementById('tutorial-panel');
        const expandTutorial = document.getElementById('expand-tutorial');
        const toggleTutorial = document.getElementById('toggle-tutorial');

        function toggleTutorialPanel() {
            tutorialPanel.classList.toggle('collapsed');
            tutorialPanel.classList.toggle('expanded');
        }

        expandTutorial?.addEventListener('click', toggleTutorialPanel);
        toggleTutorial?.addEventListener('click', toggleTutorialPanel);

        // Quick action buttons
        document.getElementById('reset-sim')?.addEventListener('click', () => {
            if (typeof resetSimulation === 'function') {
                resetSimulation();
            } else {
                window.location.reload();
            }
        });

        document.getElementById('randomize')?.addEventListener('click', () => {
            if (typeof randomizeParameters === 'function') {
                randomizeParameters();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Left Arrow - Previous simulator
            if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowLeft') {
                ${prevSim ? `window.location.href = '/simulators/${prevSim.id}/';` : ''}
            }
            // Ctrl/Cmd + Right Arrow - Next simulator
            if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowRight') {
                ${nextSim ? `window.location.href = '/simulators/${nextSim.id}/';` : ''}
            }
            // Ctrl/Cmd + R - Reset simulator
            if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                e.preventDefault();
                document.getElementById('reset-sim')?.click();
            }
        });

        ${additionalScripts}
    </script>
</body>
</html>`;
}
