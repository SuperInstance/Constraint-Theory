# UX/Flow Implementation Guide

## Quick Start Integration

### Step 1: Update Main Router

**File:** `workers/src/index.ts`

```typescript
import { ENHANCED_HOMEPAGE_HTML } from './templates/enhanced-homepage';
import { ENHANCED_SIMULATOR_PAGE } from './templates/simulator-page';

// Replace homepage route
router.get('/', () => {
  return new Response(ENHANCED_HOMEPAGE_HTML(), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
});

// Example: Update Pythagorean simulator
router.get('/simulators/pythagorean/', () => {
  return new Response(ENHANCED_SIMULATOR_PAGE(
    'pythagorean',
    'Pythagorean Snapping',
    'Explore how vectors snap to integer Pythagorean ratios for deterministic alignment',
    PYTHAGOREAN_CONTENT(),
    PYTHAGOREAN_SCRIPTS
  ), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
});
```

### Step 2: Create Simulator Content Templates

**File:** `workers/src/templates/simulator-contents.ts`

```typescript
export function PYTHAGOREAN_CONTENT(): string {
  return `
    <canvas id="simulator-canvas"></canvas>
    <div class="controls">
      <!-- Simulator controls here -->
    </div>
  `;
}

export function PYTHAGOREAN_SCRIPTS(): string {
  return `
    <!-- Include existing simulator scripts -->
    <script src="/simulators/pythagorean/app.js"></script>

    // Add progress tracking integration
    window.resetSimulation = function() {
      // Reset logic
    };

    window.randomizeParameters = function() {
      // Randomize logic
    };
  `;
}
```

### Step 3: Build and Deploy

```bash
# Build the project
npm run build

# Deploy to Cloudflare
wrangler deploy

# Or test locally
wrangler dev
```

---

## Component Usage Examples

### Using Navigation Components

**Import:**
```typescript
import {
  generateStickyHeader,
  generateBreadcrumbs,
  generateQuickNav,
  generateSearchModal,
  generateProgressIndicator,
  generateSimulatorCard
} from '../components/navigation';
```

**Generate Header:**
```typescript
const html = `
  <!DOCTYPE html>
  <html>
  <head>...</head>
  <body>
    ${generateStickyHeader('/simulators/pythagorean/')}
    ${generateSearchModal()}
    <!-- Rest of content -->
  </body>
  </html>
`;
```

**Generate Breadcrumbs:**
```typescript
const breadcrumbs = generateBreadcrumbs([
  { name: 'Home', href: '/' },
  { name: 'Simulators', href: '/#simulators' },
  { name: 'Pythagorean Snapping' }
]);
```

**Generate Simulator Card:**
```typescript
import { SIMULATORS, generateSimulatorCard } from '../components/navigation';

const pythagorean = SIMULATORS.find(s => s.id === 'pythagorean');
const card = generateSimulatorCard(pythagorean);
```

---

## Customization Guide

### Styling Customization

**Update CSS Variables:**
```css
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --bg-dark: #111827;
  --bg-card: #1f2937;
  --text-primary: #ffffff;
  --text-secondary: #9ca3af;
}
```

**Custom Card Styles:**
```css
.simulator-card {
  background: var(--bg-card);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.simulator-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}
```

### Content Customization

**Custom Tutorial Steps:**
```typescript
const customTutorialSteps = [
  'Step 1: Understand the basics',
  'Step 2: Practice with examples',
  'Step 3: Apply to problems'
];

// Use in ENHANCED_SIMULATOR_PAGE
ENHANCED_SIMULATOR_PAGE(
  simId,
  title,
  description,
  content,
  scripts,
  customTutorialSteps  // Pass custom steps
);
```

**Custom Challenges:**
```typescript
const customChallenges = [
  { id: 'challenge-1', label: 'Complete the tutorial' },
  { id: 'challenge-2', label: 'Solve the problem' },
  { id: 'challenge-3', label: 'Optimize the solution' }
];
```

---

## Simulator Migration Guide

### Migrating Existing Simulators

**Before (Basic HTML):**
```typescript
export function PYTHAGOREAN_HTML(): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Pythagorean Snapping</title>
    </head>
    <body>
      <canvas id="canvas"></canvas>
      <script>
        // Simulator code
      </script>
    </body>
    </html>
  `;
}
```

**After (Enhanced UX):**
```typescript
export function PYTHAGOREAN_HTML(): string {
  return ENHANCED_SIMULATOR_PAGE(
    'pythagorean',
    'Pythagorean Snapping',
    'Explore how vectors snap to integer Pythagorean ratios',
    PYTHAGOREAN_CONTENT(),
    PYTHAGOREAN_SCRIPTS()
  );
}

function PYTHAGOREAN_CONTENT(): string {
  return `
    <canvas id="canvas"></canvas>
    <div class="controls">
      <button id="reset">Reset</button>
      <button id="randomize">Randomize</button>
    </div>
  `;
}

function PYTHAGOREAN_SCRIPTS(): string {
  return `
    <script>
      // Existing simulator code
      const canvas = document.getElementById('canvas');
      // ... canvas setup

      // Add progress tracking integration
      window.resetSimulation = function() {
        // Reset logic
      };

      window.randomizeParameters = function() {
        // Randomize logic
      };
    </script>
  `;
}
```

### Migration Checklist

- [ ] Extract simulator content into separate function
- [ ] Extract simulator scripts into separate function
- [ ] Add reset and randomize functions
- [ ] Update route to use ENHANCED_SIMULATOR_PAGE
- [ ] Test all simulator features
- [ ] Verify progress tracking works
- [ ] Check navigation flows correctly

---

## Testing Strategy

### Unit Testing

**Test Navigation Components:**
```typescript
import { generateStickyHeader, generateBreadcrumbs } from './navigation';

describe('Navigation', () => {
  test('generateStickyHeader includes all navigation elements', () => {
    const header = generateStickyHeader('/');
    expect(header).toContain('nav');
    expect(header).toContain('Simulators');
    expect(header).toContain('API Docs');
  });

  test('generateBreadcrumbs creates correct hierarchy', () => {
    const breadcrumbs = generateBreadcrumbs([
      { name: 'Home', href: '/' },
      { name: 'Simulators', href: '/#simulators' }
    ]);
    expect(breadcrumbs).toContain('Home');
    expect(breadcrumbs).toContain('Simulators');
  });
});
```

### Integration Testing

**Test Complete User Flow:**
```typescript
describe('User Flow', () => {
  test('Homepage loads with embedded preview', async () => {
    const response = await fetch('/');
    const html = await response.text();
    expect(html).toContain('voxel');
    expect(html).toContain('simulator-iframe');
  });

  test('Simulator page includes progress tracking', async () => {
    const response = await fetch('/simulators/pythagorean/');
    const html = await response.text();
    expect(html).toContain('progress-bar');
    expect(html).toContain('challenge-checkbox');
  });
});
```

### End-to-End Testing

**Test User Journey:**
```typescript
describe('User Journey', () => {
  test('Complete learning path flow', async () => {
    // Start at homepage
    await page.goto('https://constraint-theory.superinstance.ai');

    // Click on first simulator
    await page.click('a[href="/simulators/pythagorean/"]');

    // Wait for simulator to load
    await page.waitForSelector('#loading-overlay', { state: 'hidden' });

    // Complete a challenge
    await page.click('#challenge-1');
    await page.waitForFunction(
      () => localStorage.getItem('simulator-pythagorean-progress') === '25'
    );

    // Navigate to next simulator
    await page.click('a[href="/simulators/rigidity/"]');

    // Verify progress persists
    const progress = await page.evaluate(() =>
      localStorage.getItem('simulator-pythagorean-progress')
    );
    expect(progress).toBe('25');
  });
});
```

---

## Performance Optimization

### Code Splitting

**Implement Dynamic Imports:**
```typescript
// Instead of importing all simulators upfront
const simulators = {
  pythagorean: () => import('./simulators/pythagorean'),
  rigidity: () => import('./simulators/rigidity'),
  // ...
};

// Load on demand
async function loadSimulator(id: string) {
  const simulator = await simulators[id]();
  return simulator.default;
}
```

### Lazy Loading Images

**Use Intersection Observer:**
```javascript
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      imageObserver.unobserve(img);
    }
  });
});

document.querySelectorAll('img[data-src]').forEach(img => {
  imageObserver.observe(img);
});
```

### Debounce Event Handlers

**Optimize Filter Performance:**
```javascript
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Use on filter inputs
searchInput.addEventListener('input', debounce((e) => {
  filterSimulators(e.target.value);
}, 300));
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] No console errors
- [ ] All links working
- [ ] Images optimized
- [ ] CSS minified
- [ ] JavaScript bundled
- [ ] Meta tags complete
- [ ] Favicon added

### Deployment Steps

```bash
# 1. Run tests
npm test

# 2. Build production bundle
npm run build

# 3. Test production build locally
npm run preview

# 4. Deploy to Cloudflare
wrangler deploy

# 5. Verify deployment
curl https://constraint-theory.superinstance.ai

# 6. Run smoke tests
npm run test:smoke
```

### Post-Deployment

- [ ] Check all pages load
- [ ] Test simulator functionality
- [ ] Verify analytics tracking
- [ ] Check mobile responsiveness
- [ ] Test keyboard navigation
- [ ] Verify SEO meta tags
- [ ] Check performance metrics

---

## Troubleshooting

### Common Issues

**Issue: Navigation not appearing**
```typescript
// Check if navigation component is imported
import { generateStickyHeader } from '../components/navigation';

// Verify it's called in template
${generateStickyHeader(currentPath)}
```

**Issue: Progress not saving**
```javascript
// Check localStorage is available
if (typeof localStorage !== 'undefined') {
  localStorage.setItem('test', '1');
  console.log('localStorage available');
}

// Check for browser security settings
// Some browsers block localStorage in iframes
```

**Issue: Simulator not loading**
```typescript
// Verify canvas element exists
const canvas = document.getElementById('simulator-canvas');
if (!canvas) {
  console.error('Canvas not found');
}

// Check if scripts are loading
<script src="/simulators/pythagorean/app.js" onerror="console.error('Script failed to load')"></script>
```

**Issue: Filters not working**
```javascript
// Check data attributes
simulatorCards.forEach(card => {
  console.log('Category:', card.dataset.category);
  console.log('Difficulty:', card.dataset.difficulty);
});

// Verify event listeners are attached
categoryTabs.forEach(tab => {
  tab.addEventListener('click', (e) => {
    console.log('Category clicked:', tab.dataset.category);
  });
});
```

---

## Analytics Integration

### Google Analytics

```html
<!-- Add to head section -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');

  // Track simulator views
  gtag('event', 'page_view', {
    'page_title': 'Pythagorean Snapping',
    'page_path': '/simulators/pythagorean/'
  });
</script>
```

### Custom Events

```javascript
// Track progress milestones
function trackProgress(progress) {
  if (progress === 25) {
    gtag('event', 'simulator_progress', {
      'simulator': 'pythagorean',
      'milestone': '25_percent'
    });
  }
  if (progress === 50) {
    gtag('event', 'simulator_progress', {
      'simulator': 'pythagorean',
      'milestone': '50_percent'
    });
  }
  if (progress === 100) {
    gtag('event', 'simulator_complete', {
      'simulator': 'pythagorean'
    });
  }
}
```

---

## Maintenance Schedule

### Weekly Tasks

- [ ] Check analytics for issues
- [ ] Review user feedback
- [ ] Test critical paths
- [ ] Update documentation

### Monthly Tasks

- [ ] Review performance metrics
- [ ] Update dependencies
- [ ] Security audit
- [ ] Content review

### Quarterly Tasks

- [ ] Major feature review
- [ ] User testing sessions
- [ ] Competitor analysis
- [ ] Roadmap planning

---

**Last Updated:** 2026-03-16
**Version:** 1.0.0
**Maintained By:** SuperInstance Team
