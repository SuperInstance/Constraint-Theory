# Constraint Theory Website

**Version:** 1.0
**Date:** 2026-03-18
**Status:** Complete - Ready for Deployment

---

## Overview

Mild cyberpunk redesign of the constraint-theory website, featuring:
- Dark theme with high-contrast teal accents
- Interactive agent simulation demo
- Responsive design (mobile, tablet, desktop)
- Accessible (WCAG 2.1 AA compliant)
- Performance optimized

---

## File Structure

```
web/
├── index.html          # Main landing page
├── css/
│   ├── design-system.css   # Design tokens and utility classes
│   └── styles.css          # Component styles
├── js/
│   └── main.js             # Interactive functionality
└── assets/                 # Static assets (images, icons)
```

---

## Features

### Design System
- **OKLCH color space** for perceptual uniformity
- **Geist Sans/Mono** fonts for clean typography
- **8pt grid system** for consistent spacing
- **Smooth animations** with reduced motion support

### Components
- **Navigation** - Fixed header with responsive menu
- **Hero** - Gradient text with floating elements
- **Feature Grid** - 6 cards with hover effects
- **Comparison** - RTS vs FPS visual comparison
- **Interactive Demo** - Canvas-based agent simulation
- **Technical Overview** - Step-by-step flow with code blocks
- **Footer** - Links, social, copyright

### Interactivity
- Agent simulation with real-time metrics
- Smooth scroll navigation
- Scroll-triggered animations
- Mobile hamburger menu
- Keyboard navigation support

---

## Performance

### Optimization
- Minimal CSS/JS (no external dependencies)
- Native browser APIs (Clipboard, Canvas, ResizeObserver)
- Debounced/throttled event handlers
- Optimized animations (transform, opacity)

### Metrics (Target)
- **First Contentful Paint:** <1.5s
- **Largest Contentful Paint:** <2.5s
- **Total Blocking Time:** <200ms
- **Cumulative Layout Shift:** <0.1

---

## Accessibility

### Features
- Semantic HTML (nav, main, section, footer)
- ARIA labels and roles
- Focus management
- Skip links
- Color contrast (4.5:1 minimum)
- Screen reader support

### Testing
- Keyboard navigation (Tab, Enter, Space)
- Screen reader (NVDA, JAWS, VoiceOver)
- Color contrast checker
- Automated tools (Lighthouse, axe)

---

## Browser Support

### Tested Browsers
- Chrome 120+
- Firefox 120+
- Safari 17+
- Edge 120+

### Fallbacks
- CSS variables with fallbacks
- OKLCH with RGB fallbacks
- Font loading with fallbacks
- Canvas with fallback content

---

## Deployment

### Cloudflare Pages

1. **Build Settings:**
   - Build command: None (static files)
   - Build output: `web/`
   - Root directory: `/`

2. **Environment Variables:**
   - None required

3. **Custom Domain:**
   - constraint-theory.superinstance.ai

### Local Development

1. **Install dependencies:**
   ```bash
   # No dependencies required (vanilla HTML/CSS/JS)
   ```

2. **Run local server:**
   ```bash
   # Python 3
   python -m http.server 8000

   # Node.js
   npx serve

   # PHP
   php -S localhost:8000
   ```

3. **Open browser:**
   ```
   http://localhost:8000
   ```

---

## Maintenance

### Content Updates
- Edit `index.html` for text content
- Edit `css/styles.css` for component styles
- Edit `js/main.js` for interactive behavior

### Design System Updates
- Edit `css/design-system.css` for tokens
- Update CSS variables for colors, spacing, typography
- Regenerate component styles if needed

### Adding New Sections
1. Add HTML section to `index.html`
2. Add component styles to `css/styles.css`
3. Add JavaScript to `js/main.js` if interactive
4. Update navigation links
5. Test responsive behavior

---

## Future Enhancements

### Planned Features
- [ ] Blog section for research updates
- [ ] API documentation pages
- [ ] Interactive tutorials
- [ ] Performance benchmarking tool
- [ ] Multi-language support

### Technical Debt
- [ ] Add unit tests for JavaScript
- [ ] Implement service worker for offline support
- [ ] Add analytics (privacy-focused)
- [ ] Optimize images (WebP, lazy loading)

---

## Resources

### Design Inspiration
- [Lucineer](https://github.com/SuperInstance/lucineer) - Design system inspiration
- [shadcn/ui](https://ui.shadcn.com) - Component patterns
- [Vercel Design](https://vercel.com/design) - Aesthetic reference

### Documentation
- [OKLCH Spec](https://www.w3.org/TR/css-color-4/#ok-lab)
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Performance](https://web.dev/performance/)

---

## License

MIT License - See [../LICENSE](../LICENSE) for details

---

## Contact

**Project:** Constraint Theory
**Repository:** https://github.com/SuperInstance/constrainttheory
**Website:** https://constraint-theory.superinstance.ai
**Email:** info@superinstance.ai

---

**Last Updated:** 2026-03-18
**Version:** 1.0.0
**Status:** Production Ready
