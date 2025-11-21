/**
 * Complexity Dashboard - Main Controller
 * Initializes and orchestrates all dashboard components
 */

import { ComplexityState } from './complexity-state.js';
import { InputPanel, VectorDisplay } from './complexity-components.js';
import { RadarChart, CycleAnimator, TimeSeriesChart } from './complexity-visualizations.js';

export class ComplexityDashboard {
  constructor(config) {
    this.config = config;
    this.state = new ComplexityState();
    this.components = {};

    this.initialize();
  }

  initialize() {
    console.log('Starting dashboard initialization...');
    console.log('Config:', this.config);

    // Initialize each component independently with try-catch
    // This prevents one component failure from blocking others

    if (this.config.inputPanel) {
      try {
        const el = document.getElementById(this.config.inputPanel);
        console.log('Input panel element:', el);
        if (el) {
          this.components.input = new InputPanel(el, this.state);
          console.log('✓ Input panel created');
        }
      } catch (error) {
        console.error('❌ Input panel failed:', error);
      }
    }

    if (this.config.vectorDisplay) {
      try {
        const el = document.getElementById(this.config.vectorDisplay);
        console.log('Vector display element:', el);
        if (el) {
          this.components.vector = new VectorDisplay(el, this.state);
          console.log('✓ Vector display created');
        }
      } catch (error) {
        console.error('❌ Vector display failed:', error);
      }
    }

    if (this.config.radarChart) {
      try {
        const el = document.getElementById(this.config.radarChart);
        console.log('Radar chart element:', el);
        if (el) {
          this.components.radar = new RadarChart(el, this.state);
          console.log('✓ Radar chart created');
        }
      } catch (error) {
        console.error('❌ Radar chart failed:', error);
      }
    }

    if (this.config.cycleAnimator) {
      try {
        const el = document.getElementById(this.config.cycleAnimator);
        console.log('Cycle animator element:', el);
        if (el) {
          this.components.cycle = new CycleAnimator(el, this.state);
          console.log('✓ Cycle animator created');
        }
      } catch (error) {
        console.error('❌ Cycle animator failed:', error);
      }
    }

    if (this.config.timeSeries) {
      try {
        const el = document.getElementById(this.config.timeSeries);
        console.log('Time series element:', el);
        if (el) {
          this.components.timeSeries = new TimeSeriesChart(el, this.state);
          console.log('✓ Time series created');
        }
      } catch (error) {
        console.error('❌ Time series failed:', error);
      }
    }

    console.log('✅ Dashboard initialization complete');
    console.log('Components created:', Object.keys(this.components));
  }

  async loadScenario(name) {
    try {
      // Determine correct path based on where we're loaded from
      const isInBlogPost = window.location.pathname.includes('/blog/posts/');
      const scenarioPath = isInBlogPost
        ? '../../assets/tools/complexity-dashboard/data/example-scenarios.json'
        : './data/example-scenarios.json';

      const response = await fetch(scenarioPath);
      const data = await response.json();
      const scenario = data.scenarios.find(s => s.name === name);

      if (scenario) {
        this.state.updateVector(scenario.initial);
        console.log(`Loaded scenario: ${name}`);
        return scenario;
      }
    } catch (error) {
      console.error('Error loading scenario:', error);
      console.log('Attempted path:', isInBlogPost ? '../../assets/tools/complexity-dashboard/data/example-scenarios.json' : './data/example-scenarios.json');
    }
  }

  reset() {
    this.state.updateVector([0.5, 0.5, 0.5, 0.5]);
    this.state.history = [];
  }

  getState() {
    return {
      vector: this.state.vector.toArray(),
      scalar: this.state.getScalar(),
      history: this.state.history
    };
  }

  destroy() {
    Object.values(this.components).forEach(component => {
      if (component && typeof component.destroy === 'function') {
        component.destroy();
      }
    });
  }
}

// Auto-initialize if DOM is ready
if (typeof window !== 'undefined') {
  window.ComplexityDashboard = ComplexityDashboard;
}
