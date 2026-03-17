/**
 * Navigation Components for Constraint Theory Website
 * Provides consistent navigation across all pages with UX improvements
 */

export interface SimulatorInfo {
  id: string;
  name: string;
  description: string;
  category: 'geometry' | 'calculus' | 'optimization' | 'advanced';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  prerequisites: string[];
  icon: string;
  gradient: string;
}

export const SIMULATORS: SimulatorInfo[] = [
  {
    id: 'voxel',
    name: '3D Voxel Physics',
    description: 'Interactive 3D physics simulation with constraint-based collision detection',
    category: 'geometry',
    difficulty: 'beginner',
    duration: '10 min',
    prerequisites: [],
    icon: '◈',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    id: 'pythagorean',
    name: 'Pythagorean Snapping',
    description: 'Explore how vectors snap to integer Pythagorean ratios',
    category: 'geometry',
    difficulty: 'beginner',
    duration: '5 min',
    prerequisites: [],
    icon: '△',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'rigidity',
    name: 'Rigidity Matroid',
    description: 'Laman\'s Theorem and structural rigidity visualization',
    category: 'geometry',
    difficulty: 'intermediate',
    duration: '10 min',
    prerequisites: ['pythagorean'],
    icon: '△',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    id: 'entropy',
    name: 'Entropy Visualization',
    description: 'Visualize entropy changes in constrained systems',
    category: 'geometry',
    difficulty: 'intermediate',
    duration: '8 min',
    prerequisites: ['pythagorean'],
    icon: '∫',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    id: 'kdtree',
    name: 'KD-Tree Spatial',
    description: 'Spatial partitioning for efficient constraint detection',
    category: 'optimization',
    difficulty: 'intermediate',
    duration: '12 min',
    prerequisites: ['rigidity'],
    icon: '⌬',
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'holonomy',
    name: 'Holonomy Transport',
    description: 'Parallel transport and geometric phase visualization',
    category: 'advanced',
    difficulty: 'advanced',
    duration: '15 min',
    prerequisites: ['rigidity', 'entropy'],
    icon: '∮',
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    id: 'differentiation',
    name: 'Differentiation',
    description: 'Geometric derivatives and rate of change visualization',
    category: 'calculus',
    difficulty: 'intermediate',
    duration: '10 min',
    prerequisites: ['pythagorean'],
    icon: '∂',
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    id: 'integration',
    name: 'Integration',
    description: 'Area under curves and accumulation visualization',
    category: 'calculus',
    difficulty: 'intermediate',
    duration: '10 min',
    prerequisites: ['differentiation'],
    icon: '∫',
    gradient: 'from-teal-500 to-cyan-500'
  },
  {
    id: 'gradient',
    name: 'Gradient Descent',
    description: 'Optimization through gradient-based methods',
    category: 'optimization',
    difficulty: 'advanced',
    duration: '15 min',
    prerequisites: ['integration'],
    icon: '∇',
    gradient: 'from-violet-500 to-purple-500'
  },
  {
    id: 'swarm',
    name: 'Swarm Intelligence',
    description: 'Multi-agent constraint solving and coordination',
    category: 'advanced',
    difficulty: 'advanced',
    duration: '20 min',
    prerequisites: ['rigidity'],
    icon: '☁',
    gradient: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'reasoning',
    name: 'Geometric Reasoning',
    description: 'AI-powered constraint solving and reasoning',
    category: 'advanced',
    difficulty: 'advanced',
    duration: '25 min',
    prerequisites: ['swarm'],
    icon: '◉',
    gradient: 'from-emerald-500 to-green-500'
  },
  {
    id: 'bottleneck',
    name: 'Bottleneck Analysis',
    description: 'Theory of Constraints bottleneck identification',
    category: 'optimization',
    difficulty: 'intermediate',
    duration: '12 min',
    prerequisites: [],
    icon: '⚡',
    gradient: 'from-amber-500 to-yellow-500'
  },
  {
    id: 'flow',
    name: 'Flow Networks',
    description: 'Max-flow min-cut theorem visualization',
    category: 'optimization',
    difficulty: 'intermediate',
    duration: '15 min',
    prerequisites: ['bottleneck'],
    icon: '↝',
    gradient: 'from-sky-500 to-blue-500'
  }
];

export const CATEGORIES = {
  geometry: {
    name: 'Geometric Foundations',
    description: 'Core geometric concepts and visualizations',
    color: 'from-blue-500 to-cyan-500'
  },
  calculus: {
    name: 'Calculus Operations',
    description: 'Derivatives, integrals, and optimization',
    color: 'from-yellow-500 to-orange-500'
  },
  optimization: {
    name: 'Optimization & Performance',
    description: 'Efficient algorithms and performance analysis',
    color: 'from-green-500 to-emerald-500'
  },
  advanced: {
    name: 'Advanced Topics',
    description: 'Complex multi-constraint systems',
    color: 'from-purple-500 to-pink-500'
  }
};

export const DIFFICULTY_LEVELS = {
  beginner: { name: 'Beginner', color: 'text-green-400', bg: 'bg-green-400/10' },
  intermediate: { name: 'Intermediate', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  advanced: { name: 'Advanced', color: 'text-red-400', bg: 'bg-red-400/10' }
};

/**
 * Generate sticky navigation header
 */
export function generateStickyHeader(currentPath: string = ''): string {
  const isActive = (path: string) => currentPath.includes(path) ? 'text-white' : 'text-gray-300';

  return `
    <nav id="main-nav" class="fixed w-full top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 transition-all duration-300">
      <div class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <!-- Logo & Home -->
          <a href="/" class="flex items-center gap-2 group">
            <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <span class="text-white font-bold text-sm">Ω</span>
            </div>
            <span class="text-xl font-bold group-hover:text-purple-400 transition-colors">Constraint Theory</span>
          </a>

          <!-- Desktop Navigation -->
          <div class="hidden lg:flex items-center gap-6">
            <a href="/#simulators" class="${isActive('simulators')} hover:text-white transition-colors">Simulators</a>
            <a href="/#concepts" class="${isActive('concepts')} hover:text-white transition-colors">Concepts</a>
            <a href="/#quickstart" class="${isActive('quickstart')} hover:text-white transition-colors">Quick Start</a>
            <a href="/#docs" class="${isActive('docs')} hover:text-white transition-colors">Documentation</a>
            <a href="/api/docs" class="${isActive('api')} hover:text-white transition-colors">API</a>
          </div>

          <!-- Right Actions -->
          <div class="flex items-center gap-3">
            <!-- Mobile Menu Button -->
            <button id="mobile-menu-btn" class="lg:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>

            <!-- Search Button -->
            <button id="search-btn" class="hidden sm:flex p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition" title="Search simulators (Ctrl+K)">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>

            <!-- GitHub Link -->
            <a href="https://github.com/SuperInstance/constrainttheory" target="_blank" rel="noopener"
               class="hidden sm:flex px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition">
              GitHub
            </a>

            <!-- API Docs Button -->
            <a href="/api/docs" class="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 rounded-lg text-sm font-medium transition">
              API Docs
            </a>
          </div>
        </div>

        <!-- Mobile Navigation Menu -->
        <div id="mobile-menu" class="hidden lg:hidden mt-4 pb-4 border-t border-gray-800 pt-4">
          <div class="flex flex-col gap-3">
            <a href="/#simulators" class="text-gray-300 hover:text-white py-2 transition-colors">Simulators</a>
            <a href="/#concepts" class="text-gray-300 hover:text-white py-2 transition-colors">Concepts</a>
            <a href="/#quickstart" class="text-gray-300 hover:text-white py-2 transition-colors">Quick Start</a>
            <a href="/#docs" class="text-gray-300 hover:text-white py-2 transition-colors">Documentation</a>
            <a href="https://github.com/SuperInstance/constrainttheory" target="_blank" rel="noopener" class="text-gray-300 hover:text-white py-2 transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </nav>

    <script>
      // Mobile menu toggle
      const mobileMenuBtn = document.getElementById('mobile-menu-btn');
      const mobileMenu = document.getElementById('mobile-menu');
      mobileMenuBtn?.addEventListener('click', () => {
        mobileMenu?.classList.toggle('hidden');
      });

      // Keyboard shortcut for search
      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          document.getElementById('search-btn')?.click();
        }
      });

      // Hide/show nav on scroll
      let lastScroll = 0;
      const nav = document.getElementById('main-nav');
      window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > lastScroll && currentScroll > 100) {
          nav?.classList.add('-translate-y-full');
        } else {
          nav?.classList.remove('-translate-y-full');
        }
        lastScroll = currentScroll;
      });
    </script>
  `;
}

/**
 * Generate breadcrumb navigation
 */
export function generateBreadcrumbs(items: Array<{name: string, href?: string}>): string {
  const breadcrumbs = items.map((item, index) => {
    const isLast = index === items.length - 1;
    if (isLast) {
      return `<span class="text-gray-400">${item.name}</span>`;
    }
    return `
      <a href="${item.href || '#'}" class="text-purple-400 hover:text-purple-300 transition-colors">
        ${item.name}
      </a>
      <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
      </svg>
    `;
  }).join('');

  return `
    <nav class="flex items-center gap-2 text-sm py-4 px-4 bg-gray-800/30 border-b border-gray-800">
      ${breadcrumbs}
    </nav>
  `;
}

/**
 * Generate simulator card with metadata
 */
export function generateSimulatorCard(sim: SimulatorInfo, currentSimId?: string): string {
  const difficulty = DIFFICULTY_LEVELS[sim.difficulty];
  const isComplete = currentSimId && sim.prerequisites.includes(currentSimId);
  const isLocked = sim.prerequisites.length > 0 && !isComplete && !currentSimId;

  return `
    <a href="/simulators/${sim.id}/"
       class="group bg-gray-800 rounded-xl p-6 card-hover block relative overflow-hidden ${isLocked ? 'opacity-60' : ''}">
      ${isLocked ? `
        <div class="absolute inset-0 bg-gray-900/50 flex items-center justify-center z-10">
          <div class="text-center">
            <svg class="w-8 h-8 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            <span class="text-sm text-gray-400">Complete prerequisites first</span>
          </div>
        </div>
      ` : ''}

      <div class="w-12 h-12 bg-gradient-to-br ${sim.gradient} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <span class="text-white text-2xl">${sim.icon}</span>
      </div>

      <div class="flex items-start justify-between mb-2">
        <h3 class="text-xl font-semibold group-hover:text-purple-400 transition-colors">${sim.name}</h3>
        <span class="px-2 py-1 ${difficulty.bg} ${difficulty.color} rounded text-xs font-medium">
          ${difficulty.name}
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

      ${sim.prerequisites.length > 0 ? `
        <div class="text-xs text-gray-500">
          <span class="font-medium">Prerequisites:</span>
          ${sim.prerequisites.map(p => {
            const prereqSim = SIMULATORS.find(s => s.id === p);
            return prereqSim ? `<span class="text-purple-400">${prereqSim.name}</span>` : p;
          }).join(', ')}
        </div>
      ` : ''}

      <div class="flex items-center text-purple-400 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <span class="text-sm font-medium">${isLocked ? 'Locked' : 'Start learning'}</span>
        <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </div>
    </a>
  `;
}

/**
 * Generate quick simulator navigation
 */
export function generateQuickNav(currentSimId: string): string {
  const currentIndex = SIMULATORS.findIndex(s => s.id === currentSimId);
  const prevSim = currentIndex > 0 ? SIMULATORS[currentIndex - 1] : null;
  const nextSim = currentIndex < SIMULATORS.length - 1 ? SIMULATORS[currentIndex + 1] : null;

  return `
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
  `;
}

/**
 * Generate search modal
 */
export function generateSearchModal(): string {
  return `
    <div id="search-modal" class="fixed inset-0 z-50 hidden">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" id="search-backdrop"></div>
      <div class="relative max-w-2xl mx-auto mt-32 px-4">
        <div class="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
          <div class="flex items-center gap-3 p-4 border-b border-gray-700">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input type="text" id="search-input" placeholder="Search simulators..."
                   class="flex-1 bg-transparent text-white placeholder-gray-400 outline-none">
            <kbd class="px-2 py-1 bg-gray-700 rounded text-xs text-gray-400">ESC</kbd>
          </div>
          <div id="search-results" class="max-h-96 overflow-y-auto p-2">
            ${SIMULATORS.map(sim => `
              <a href="/simulators/${sim.id}/" class="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg transition">
                <span class="text-2xl">${sim.icon}</span>
                <div class="flex-1">
                  <div class="font-medium">${sim.name}</div>
                  <div class="text-sm text-gray-400">${sim.description}</div>
                </div>
                <span class="px-2 py-1 ${DIFFICULTY_LEVELS[sim.difficulty].bg} ${DIFFICULTY_LEVELS[sim.difficulty].color} rounded text-xs">
                  ${DIFFICULTY_LEVELS[sim.difficulty].name}
                </span>
              </a>
            `).join('')}
          </div>
        </div>
      </div>
    </div>

    <script>
      const searchBtn = document.getElementById('search-btn');
      const searchModal = document.getElementById('search-modal');
      const searchBackdrop = document.getElementById('search-backdrop');
      const searchInput = document.getElementById('search-input');

      function openSearch() {
        searchModal?.classList.remove('hidden');
        searchInput?.focus();
      }

      function closeSearch() {
        searchModal?.classList.add('hidden');
        searchInput.value = '';
      }

      searchBtn?.addEventListener('click', openSearch);
      searchBackdrop?.addEventListener('click', closeSearch);

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSearch();
      });

      // Filter results
      searchInput?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const results = document.getElementById('search-results');
        const items = results?.querySelectorAll('a');
        items?.forEach(item => {
          const text = item.textContent.toLowerCase();
          item.style.display = text.includes(query) ? 'flex' : 'none';
        });
      });
    </script>
  `;
}

/**
 * Generate progress indicator
 */
export function generateProgressIndicator(currentStep: number, totalSteps: number, steps: string[]): string {
  return `
    <div class="bg-gray-800/30 border-b border-gray-800 px-4 py-6">
      <div class="container mx-auto max-w-4xl">
        <div class="flex items-center justify-between mb-4">
          <div class="text-sm text-gray-400">
            Step <span class="text-white font-medium">${currentStep}</span> of ${totalSteps}
          </div>
          <div class="text-sm text-gray-400">
            ${Math.round((currentStep / totalSteps) * 100)}% complete
          </div>
        </div>
        <div class="flex gap-2">
          ${steps.map((step, index) => {
            const stepNum = index + 1;
            const isComplete = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;
            return `
              <div class="flex-1 flex items-center gap-2">
                <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  isComplete ? 'bg-green-500 text-white' :
                  isCurrent ? 'bg-purple-500 text-white' :
                  'bg-gray-700 text-gray-400'
                }">
                  ${isComplete ? '✓' : stepNum}
                </div>
                <div class="flex-1 h-1 rounded ${
                  isComplete ? 'bg-green-500' :
                  isCurrent ? 'bg-purple-500' :
                  'bg-gray-700'
                }"></div>
              </div>
            `;
          }).join('')}
        </div>
        <div class="mt-2 text-sm text-gray-400 text-center">${steps[currentStep - 1]}</div>
      </div>
    </div>
  `;
}
