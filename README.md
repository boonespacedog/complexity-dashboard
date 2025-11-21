# Vector Complexity Interactive Demo

**Interactive dashboard demonstrating the impossibility of reducing multi-dimensional complexity to single scalar metrics.**

🔗 **Live Demo:** [https://boonespacedog.github.io/complexity-dashboard/](https://boonespacedog.github.io/complexity-dashboard/)

📄 **Research Paper:** [Scalar Impossibility in Multi-Pillar Complexity Measures](https://doi.org/10.5281/zenodo.17562623) (Sudoma, 2025)

---

## What This Demonstrates

This interactive dashboard proves a mathematical impossibility theorem: **you cannot average multi-dimensional system metrics into a single number without losing critical information**.

### The Four Dimensions of Complexity

- **Algorithmic** (C_alg): How sophisticated are the algorithms?
- **Information** (C_info): How much do components communicate?
- **Dynamical** (C_dyn): How chaotic is the temporal behavior?
- **Geometric** (C_geom): How rich is the structural topology?

### Why This Matters

Industry frameworks like **DORA metrics**, **SPACE framework**, and **Flow metrics** all track multiple dimensions independently—not averaged into single scores. This tool shows mathematically why that's necessary.

---

## Features

### Interactive Visualizations

- **Radar Chart**: 4D complexity vector with scalar average overlay
- **Time Series**: Track complexity evolution across all dimensions
- **Cycle Animator**: 5-step impossibility paradox demonstration
- **Pre-loaded Scenarios**: Software Optimization, Research Project, Neural Network

### Try It Yourself

1. **Adjust sliders**: Set different complexity levels
2. **Click operations**: Improve individual dimensions
3. **Watch the paradox**: Scalar average hides real improvements
4. **Load scenarios**: See real-world examples

---

## Technical Implementation

**Tech Stack:**
- Vanilla JavaScript (ES6 modules)
- Plotly.js for interactive charts
- Modular architecture (state, components, visualizations, math)
- Observer pattern for reactive updates
- No build step required

**Architecture:**
```
js/
├── complexity-state.js         # State management, vector operations
├── complexity-components.js    # UI components (input panel, display)
├── complexity-visualizations.js # Plotly charts (radar, time series, animator)
├── complexity-math.js          # Mathematical operations
└── dashboard-main.js           # Main controller
```

---

## Installation & Usage

### Option 1: Use CDN (Easiest)

Just include the files in your HTML:

```html
<script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>

<!-- Dashboard modules -->
<script type="module">
  import { ComplexityDashboard } from './js/dashboard-main.js';

  const dashboard = new ComplexityDashboard({
    inputPanel: 'input-panel',
    vectorDisplay: 'vector-display',
    radarChart: 'radar-chart',
    cycleAnimator: 'cycle-animator',
    timeSeries: 'time-series'
  });
</script>
```

### Option 2: Local Development

```bash
# Clone the repo
git clone https://github.com/boonespacedog/complexity-dashboard.git
cd complexity-dashboard

# Open in browser (no build needed!)
open index.html  # macOS
xdg-open index.html  # Linux
start index.html  # Windows
```

### Option 3: GitHub Pages Deployment

Already deployed! Visit: [https://boonespacedog.github.io/complexity-dashboard/](https://boonespacedog.github.io/complexity-dashboard/)

---

## Code Examples

### Create a Complexity State

```javascript
import { ComplexityState, ComplexityVector } from './js/complexity-state.js';

// Initialize with default balanced state
const state = new ComplexityState();

// Create custom vector
const vector = new ComplexityVector(0.8, 0.4, 0.6, 0.3);
state.updateVector(vector);

// Get scalar average (information-destroying)
const scalar = state.getScalar();
console.log(`Scalar: ${scalar}`); // 0.525
```

### Improve a Dimension

```javascript
// Improve algorithmic complexity by 0.2
state.improve(0, 0.2);

// Before: [0.8, 0.4, 0.6, 0.3]
// After: [1.0, 0.4, 0.6, 0.3]  (clamped to [0,1])
```

### Subscribe to Changes

```javascript
state.subscribe((update) => {
  console.log('Vector updated:', update.vector.toArray());
  console.log('Operation:', update.operation);
});
```

---

## Real-World Applications

### Software Engineering
- **DORA Metrics**: Deployment frequency, lead time, change failure rate, MTTR
- **Why vectors matter**: Fast deployments + high failure rate ≠ slow deployments + low failures
- **Scalar hides**: Critical trade-offs between speed and reliability

### Research Management
- **Metrics**: Publication rate, collaboration depth, reproducibility, innovation
- **Why vectors matter**: High output + low quality ≠ low output + high quality
- **Scalar hides**: Research strategy differences

### Machine Learning
- **Metrics**: Accuracy, fairness, interpretability, efficiency
- **Why vectors matter**: High accuracy + low fairness ≠ balanced performance
- **Scalar hides**: Ethical trade-offs

---

## Mathematical Background

The dashboard implements the impossibility theorem from:

**Sudoma, O. (2025).** "Scalar Impossibility in Multi-Pillar Complexity Measures." Zenodo. [https://doi.org/10.5281/zenodo.17562623](https://doi.org/10.5281/zenodo.17562623)

### The Theorem (Simplified)

No scalar function `f: Systems → ℝ` can simultaneously satisfy:
1. **Additivity**: `f(A ⊕ B) = f(A) + f(B)` for independent systems
2. **Monotonicity**: Improvements always increase `f`
3. **Continuity**: Small changes → small `f` changes
4. **Task-universality**: Works across system types

**Proof technique:** Construct 5-step improvement cycle where:
- Vector clearly shows net improvement
- Scalar returns to origin (contradiction!)

---

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Requirements:**
- ES6 module support
- Fetch API
- CSS Grid

---

## Contributing

Contributions welcome! Areas for enhancement:
- Additional scenario presets
- Export/import functionality
- More visualization types
- Accessibility improvements
- Performance optimizations

---

## License

MIT License - Free to use, modify, and distribute.

---

## Citation

If you use this dashboard in research or education:

```
Sudoma, O. (2025). Vector Complexity Interactive Demo.
GitHub. https://github.com/boonespacedog/complexity-dashboard
```

For the underlying research:

```
Sudoma, O. (2025). Scalar Impossibility in Multi-Pillar Complexity Measures.
Zenodo. https://doi.org/10.5281/zenodo.17562623
```

---

## Author

**Oksana Sudoma**
- Portfolio: [oksana-sudoma.sudomaconsulting.com](https://oksana-sudoma.sudomaconsulting.com)
- GitHub: [@boonespacedog](https://github.com/boonespacedog)
- Research: Published work on complexity measurement, mathematical physics

---

## Related Projects

- [Omega Mod M Calculator](https://github.com/boonespacedog/omega-mod-m) - Modular arithmetic visualization
- [432 Group Structure](https://github.com/boonespacedog/ternary-constraint-432-element-group) - Discrete group analysis
- [Fractional Laplacian](https://github.com/boonespacedog/Fractional-Laplacian) - Spectral geometry tools

---

**Built for researchers, engineers, and anyone who needs to understand why single metrics fail.**

**Keywords:** complexity measurement, multi-dimensional metrics, DORA metrics, SPACE framework, impossibility theorem, vector vs scalar, interactive visualization, Plotly.js, data science, system health
