/**
 * 📄 File: complexity-visualizations.js
 * Purpose: Plotly-based visualizations for complexity dashboard
 * Created: 2025-11-21
 * Used by: main.js (dashboard initialization)
 */

import { ComplexityState } from './complexity-state.js';
import { ComplexityMath } from './complexity-math.js';

/**
 * 🧠 Class: RadarChart
 * Role: 4-axis spider/polar chart showing complexity vector
 * Notes: Overlays scalar average as dashed circle
 */
export class RadarChart {
    constructor(container, state) {
        this.container = container;
        this.state = state;
        this.isInitialized = false;

        // Subscribe to state changes
        this.state.subscribe(() => this.update());

        // Initialize chart
        this.init();
    }

    /**
     * 🧠 Function: init
     * Role: Initialize Plotly radar chart
     * Returns: void
     */
    init() {
        try {
            // Clear container for chart
            this.container.innerHTML = '';

            // Initial plot setup
            setTimeout(() => {
                this.render();
                this.isInitialized = true;
            }, 100);
        } catch (error) {
            console.error('Failed to initialize radar chart:', error);
            this.container.innerHTML = '<div class="error">Failed to load chart</div>';
        }
    }

    /**
     * 🧠 Function: render
     * Role: Render/update the radar chart
     * Returns: void
     */
    render() {
        const vector = this.state.vector.toArray();
        const scalar = this.state.getScalar();

        // Main complexity vector trace
        const vectorTrace = {
            type: 'scatterpolar',
            r: vector,
            theta: ['Algorithmic', 'Information', 'Dynamical', 'Geometric'],
            fill: 'toself',
            name: 'Current State',
            fillcolor: 'rgba(20, 184, 166, 0.3)',
            line: {
                color: 'rgb(20, 184, 166)',
                width: 2
            },
            marker: {
                color: 'rgb(20, 184, 166)',
                size: 8
            }
        };

        // Scalar average circle overlay
        const scalarTrace = {
            type: 'scatterpolar',
            r: [scalar, scalar, scalar, scalar],
            theta: ['Algorithmic', 'Information', 'Dynamical', 'Geometric'],
            name: `Scalar Average (${scalar.toFixed(3)})`,
            line: {
                color: 'rgb(250, 204, 21)',
                dash: 'dash',
                width: 2
            },
            marker: {
                size: 0  // Hide markers for scalar circle
            }
        };

        const data = [vectorTrace, scalarTrace];

        const layout = {
            polar: {
                radialaxis: {
                    visible: true,
                    range: [0, 1],
                    tickmode: 'linear',
                    tick0: 0,
                    dtick: 0.2,
                    gridcolor: 'rgba(148, 163, 184, 0.2)',
                    linecolor: 'rgba(148, 163, 184, 0.3)'
                },
                angularaxis: {
                    direction: 'clockwise',
                    gridcolor: 'rgba(148, 163, 184, 0.2)',
                    linecolor: 'rgba(148, 163, 184, 0.3)',
                    tickfont: {
                        size: 11  // Smaller font for mobile fit
                    }
                },
                bgcolor: 'transparent'
            },
            showlegend: true,
            legend: {
                x: 0.5,
                y: -0.15,
                xanchor: 'center',
                orientation: 'h',
                font: { size: 12 }
            },
            margin: { t: 40, r: 40, b: 60, l: 40 },
            height: 400,
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: {
                family: 'system-ui, -apple-system, sans-serif',
                size: 14,
                color: 'rgb(30, 41, 59)'
            }
        };

        const config = {
            responsive: true,
            displayModeBar: false,
            staticPlot: true  // Disable interaction for touch screens
        };

        // Check if Plotly is loaded
        if (typeof Plotly === 'undefined') {
            console.error('❌ Plotly not loaded!');
            this.container.innerHTML = '<div class="p-4 text-red-600">Plotly.js not loaded. Please refresh.</div>';
            return;
        }

        console.log('RadarChart rendering to:', this.container.id);
        console.log('Vector data:', data);

        try {
            Plotly.newPlot(this.container, data, layout, config);
            this.isInitialized = true;
            console.log('✓ RadarChart rendered successfully');
        } catch (error) {
            console.error('❌ RadarChart render failed:', error);
            this.container.innerHTML = `<div class="p-4 text-red-600">Chart error: ${error.message}</div>`;
        }
    }

    /**
     * 🧠 Function: update
     * Role: Update chart with new state
     * Returns: void
     */
    update() {
        if (!this.isInitialized) return;

        const vector = this.state.vector.toArray();
        const scalar = this.state.getScalar();

        // Update data traces
        Plotly.restyle(this.container, {
            r: [vector, [scalar, scalar, scalar, scalar]],
            name: ['Current State', `Scalar Average (${scalar.toFixed(3)})`]
        }, [0, 1]);
    }

    /**
     * 🧠 Function: destroy
     * Role: Clean up Plotly instance
     * Returns: void
     */
    destroy() {
        Plotly.purge(this.container);
    }
}

/**
 * 🧠 Class: CycleAnimator
 * Role: Animates the 5-step impossibility cycle
 * Notes: Shows paradox of improvement returning to origin
 */
export class CycleAnimator {
    constructor(container, state) {
        this.container = container;
        this.state = state;
        this.isAnimating = false;
        this.currentStep = 0;
        this.animationInterval = null;
        this.initialState = null;

        // Cycle steps definition
        this.steps = [
            { pillar: 0, name: 'Algorithmic', delta: 0.15, description: 'Optimize algorithm efficiency' },
            { pillar: 1, name: 'Information', delta: 0.12, description: 'Add information content' },
            { pillar: 2, name: 'Dynamical', delta: 0.10, description: 'Increase dynamic behavior' },
            { pillar: 3, name: 'Geometric', delta: 0.08, description: 'Enrich topological structure' },
            { pillar: -1, name: 'Projection', delta: 0, description: 'Return to origin (paradox!)' }
        ];

        this.init();
    }

    /**
     * 🧠 Function: init
     * Role: Initialize animator interface
     * Returns: void
     */
    init() {
        this.container.innerHTML = `
            <div class="cycle-animator">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                    <h3 class="text-xl font-bold text-gray-900">5-Step Impossibility Cycle</h3>
                    <div class="flex gap-2">
                        <button id="cycle-start"
                                class="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors font-medium">
                            Start
                        </button>
                        <button id="cycle-stop"
                                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
                                disabled>
                            Stop
                        </button>
                        <button id="cycle-reset"
                                class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium">
                            Reset
                        </button>
                    </div>
                </div>
                <div class="mb-4">
                    <div class="bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                        <div class="progress-fill bg-teal-600 h-full transition-all duration-300" style="width: 0%"></div>
                    </div>
                    <div class="text-sm font-medium text-gray-700">Step: <span id="current-step" class="text-teal-600 font-bold">0</span> / 5</div>
                </div>
                <div class="cycle-visualization" id="cycle-chart"></div>
                <div class="cycle-info">
                    <div class="step-description">Ready to demonstrate impossibility paradox</div>
                    <div class="signal-loss">Signal Loss: <span id="signal-loss">0.000</span></div>
                </div>
            </div>
        `;

        // Set up event handlers
        this.setupEventHandlers();

        // Initialize visualization
        this.initVisualization();
    }

    /**
     * 🧠 Function: setupEventHandlers
     * Role: Configure button event listeners
     * Returns: void
     */
    setupEventHandlers() {
        const startBtn = this.container.querySelector('#cycle-start');
        const stopBtn = this.container.querySelector('#cycle-stop');
        const resetBtn = this.container.querySelector('#cycle-reset');

        startBtn.addEventListener('click', () => this.start());
        stopBtn.addEventListener('click', () => this.stop());
        resetBtn.addEventListener('click', () => this.reset());
    }

    /**
     * 🧠 Function: initVisualization
     * Role: Create cycle step visualization
     * Returns: void
     */
    initVisualization() {
        const chartContainer = this.container.querySelector('#cycle-chart');

        // Create bar chart showing improvements
        const data = [{
            x: ['Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5'],
            y: [0, 0, 0, 0, 0],
            type: 'bar',
            marker: {
                color: ['#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'],
                opacity: 0.7
            },
            text: ['Algorithmic', 'Information', 'Dynamical', 'Geometric', 'Projection'],
            textposition: 'outside',
            hovertemplate: '%{text}<br>Improvement: %{y:.3f}<extra></extra>'
        }];

        const layout = {
            height: 250,
            margin: { t: 20, r: 20, b: 40, l: 50 },
            xaxis: {
                title: 'Cycle Steps',
                tickangle: 0
            },
            yaxis: {
                title: 'Improvement δ',
                range: [0, 0.2]
            },
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'rgba(248, 250, 252, 0.5)',
            font: {
                family: 'system-ui, -apple-system, sans-serif',
                size: 12,
                color: 'rgb(30, 41, 59)'
            }
        };

        const config = {
            responsive: true,
            displayModeBar: false,
            staticPlot: true  // Disable interaction for touch screens
        };

        Plotly.newPlot(chartContainer, data, layout, config);
    }

    /**
     * 🧠 Function: start
     * Role: Begin animation cycle
     * Returns: void
     */
    start() {
        if (this.isAnimating) return;

        this.isAnimating = true;
        this.currentStep = 0;
        this.initialState = this.state.vector.clone();

        // Update UI
        const startBtn = this.container.querySelector('#cycle-start');
        const stopBtn = this.container.querySelector('#cycle-stop');
        startBtn.disabled = true;
        stopBtn.disabled = false;

        // Start animation loop
        this.animateStep();
    }

    /**
     * 🧠 Function: animateStep
     * Role: Animate single cycle step
     * Returns: void
     */
    animateStep() {
        if (!this.isAnimating || this.currentStep >= this.steps.length) {
            this.complete();
            return;
        }

        const step = this.steps[this.currentStep];

        // Update progress
        const progress = ((this.currentStep + 1) / this.steps.length) * 100;
        this.container.querySelector('.progress-fill').style.width = `${progress}%`;
        this.container.querySelector('#current-step').textContent = this.currentStep + 1;

        // Update description
        this.container.querySelector('.step-description').textContent =
            `Step ${this.currentStep + 1}: ${step.description}`;

        // Apply transformation
        if (step.pillar >= 0) {
            // Regular improvement step
            const improvement = new Array(4).fill(0);
            improvement[step.pillar] = step.delta;

            // Apply with signal loss
            const before = this.state.vector.clone();
            this.state.improve(step.pillar, step.delta);
            const after = this.state.vector.clone();

            // Calculate signal loss
            const signalLoss = this.calculateSignalLoss(before, after, step.delta);
            this.container.querySelector('#signal-loss').textContent = signalLoss.toFixed(3);

            // Update bar chart
            const chartContainer = this.container.querySelector('#cycle-chart');
            const yValues = this.steps.slice(0, this.currentStep + 1).map(s => s.delta);
            while (yValues.length < 5) yValues.push(0);

            Plotly.restyle(chartContainer, { y: [yValues] }, 0);
        } else {
            // Projection step - return to origin
            this.state.vector = this.initialState.clone();
            this.state.notifyObservers();

            // Highlight paradox
            this.container.querySelector('.step-description').innerHTML =
                '<strong style="color: #dc2626;">Paradox: Returned to origin despite improvements!</strong>';
        }

        // Schedule next step
        this.currentStep++;
        setTimeout(() => this.animateStep(), 1500);
    }

    /**
     * 🧠 Function: calculateSignalLoss
     * Role: Compute information loss during improvement
     * Inputs: before (vector), after (vector), intended (scalar)
     * Returns: Signal loss value
     */
    calculateSignalLoss(before, after, intended) {
        const actualChange = after.subtract(before).magnitude();
        const expectedChange = intended;
        return Math.abs(expectedChange - actualChange);
    }

    /**
     * 🧠 Function: stop
     * Role: Stop animation
     * Returns: void
     */
    stop() {
        this.isAnimating = false;

        const startBtn = this.container.querySelector('#cycle-start');
        const stopBtn = this.container.querySelector('#cycle-stop');
        startBtn.disabled = false;
        stopBtn.disabled = true;
    }

    /**
     * 🧠 Function: complete
     * Role: Handle animation completion
     * Returns: void
     */
    complete() {
        this.stop();
        this.container.querySelector('.step-description').textContent =
            'Cycle complete - impossibility demonstrated!';
    }

    /**
     * 🧠 Function: reset
     * Role: Reset animator to initial state
     * Returns: void
     */
    reset() {
        this.stop();
        this.currentStep = 0;

        // Reset UI
        this.container.querySelector('.progress-fill').style.width = '0%';
        this.container.querySelector('#current-step').textContent = '0';
        this.container.querySelector('#signal-loss').textContent = '0.000';
        this.container.querySelector('.step-description').textContent =
            'Ready to demonstrate impossibility paradox';

        // Reset chart
        const chartContainer = this.container.querySelector('#cycle-chart');
        Plotly.restyle(chartContainer, { y: [[0, 0, 0, 0, 0]] }, 0);

        // Reset state if we have initial state
        if (this.initialState) {
            this.state.vector = this.initialState.clone();
            this.state.notifyObservers();
        }
    }
}

/**
 * 🧠 Class: TimeSeriesChart
 * Role: Shows history of complexity changes over time
 * Notes: Tracks all 4 pillars + scalar average
 */
export class TimeSeriesChart {
    constructor(container, state, maxPoints = 50) {
        this.container = container;
        this.state = state;
        this.maxPoints = maxPoints;
        this.history = {
            operations: [],
            algorithmic: [],
            information: [],
            dynamical: [],
            geometric: [],
            scalar: []
        };
        this.operationCount = 0;

        // Subscribe to state changes
        this.state.subscribe(() => this.recordState());

        this.init();
    }

    /**
     * 🧠 Function: init
     * Role: Initialize time series chart
     * Returns: void
     */
    init() {
        // Create initial plot first
        this.render();

        // Then record initial state
        this.recordState();
    }

    /**
     * 🧠 Function: recordState
     * Role: Record current state to history
     * Returns: void
     */
    recordState() {
        const vector = this.state.vector.toArray();
        const scalar = this.state.getScalar();

        // Add to history
        this.history.operations.push(this.operationCount++);
        this.history.algorithmic.push(vector[0]);
        this.history.information.push(vector[1]);
        this.history.dynamical.push(vector[2]);
        this.history.geometric.push(vector[3]);
        this.history.scalar.push(scalar);

        // Trim to max points
        if (this.history.operations.length > this.maxPoints) {
            Object.keys(this.history).forEach(key => {
                this.history[key].shift();
            });
        }

        // Update chart
        this.update();
    }

    /**
     * 🧠 Function: render
     * Role: Render time series chart
     * Returns: void
     */
    render() {
        const traces = [
            {
                x: this.history.operations,
                y: this.history.algorithmic,
                mode: 'lines+markers',
                name: 'Algorithmic',
                line: { color: '#14b8a6', width: 2 },
                marker: { size: 4 }
            },
            {
                x: this.history.operations,
                y: this.history.information,
                mode: 'lines+markers',
                name: 'Information',
                line: { color: '#3b82f6', width: 2 },
                marker: { size: 4 }
            },
            {
                x: this.history.operations,
                y: this.history.dynamical,
                mode: 'lines+markers',
                name: 'Dynamical',
                line: { color: '#8b5cf6', width: 2 },
                marker: { size: 4 }
            },
            {
                x: this.history.operations,
                y: this.history.geometric,
                mode: 'lines+markers',
                name: 'Geometric',
                line: { color: '#ec4899', width: 2 },
                marker: { size: 4 }
            },
            {
                x: this.history.operations,
                y: this.history.scalar,
                mode: 'lines',
                name: 'Scalar Average',
                line: { color: '#facc15', width: 3, dash: 'dash' }
            }
        ];

        const layout = {
            title: {
                text: 'Complexity Evolution',
                font: { size: 16 }
            },
            xaxis: {
                title: '',  // Remove title to prevent legend overlap
                gridcolor: 'rgba(148, 163, 184, 0.1)'
            },
            yaxis: {
                title: 'Complexity Value',
                range: [0, 1],
                gridcolor: 'rgba(148, 163, 184, 0.1)'
            },
            legend: {
                x: 0.5,
                y: -0.15,  // Moved closer to chart
                xanchor: 'center',
                orientation: 'h',
                font: { size: 10 }
            },
            margin: { t: 40, r: 20, b: 60, l: 50 },  // Reduced bottom margin
            height: 350,
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'rgba(248, 250, 252, 0.5)',
            font: {
                family: 'system-ui, -apple-system, sans-serif',
                size: 12,
                color: 'rgb(30, 41, 59)'
            },
            hovermode: 'x unified'
        };

        const config = {
            responsive: true,
            displayModeBar: false,
            staticPlot: true  // Disable interaction for touch screens
        };

        // Check if Plotly is loaded
        if (typeof Plotly === 'undefined') {
            console.error('❌ Plotly not loaded!');
            this.container.innerHTML = '<div class="p-4 text-red-600">Plotly.js not loaded. Please refresh.</div>';
            return;
        }

        console.log('TimeSeriesChart rendering to:', this.container.id);
        console.log('History data:', this.history);
        console.log('Traces:', traces.length, 'traces');

        try {
            Plotly.newPlot(this.container, traces, layout, config);
            console.log('✓ TimeSeriesChart rendered successfully');
        } catch (error) {
            console.error('❌ TimeSeriesChart render failed:', error);
            this.container.innerHTML = `<div class="p-4 text-red-600">Chart error: ${error.message}</div>`;
        }
    }

    /**
     * 🧠 Function: update
     * Role: Update chart with new data
     * Returns: void
     */
    update() {
        // Check if chart is initialized
        if (!this.container || !this.container.data) {
            console.warn('TimeSeriesChart not ready for update');
            return;
        }

        // Update all traces
        Plotly.restyle(this.container, {
            x: [
                this.history.operations,
                this.history.operations,
                this.history.operations,
                this.history.operations,
                this.history.operations
            ],
            y: [
                this.history.algorithmic,
                this.history.information,
                this.history.dynamical,
                this.history.geometric,
                this.history.scalar
            ]
        }, [0, 1, 2, 3, 4]);
    }

    /**
     * 🧠 Function: clear
     * Role: Clear history and reset chart
     * Returns: void
     */
    clear() {
        // Reset history
        this.operationCount = 0;
        Object.keys(this.history).forEach(key => {
            this.history[key] = [];
        });

        // Record current state as starting point
        this.recordState();

        // Re-render
        this.render();
    }

    /**
     * 🧠 Function: destroy
     * Role: Clean up Plotly instance
     * Returns: void
     */
    destroy() {
        Plotly.purge(this.container);
    }
}

// Export for use in main dashboard
export default {
    RadarChart,
    CycleAnimator,
    TimeSeriesChart
};