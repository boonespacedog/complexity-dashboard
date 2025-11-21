/**
 * 📄 File: complexity-components.js
 * Purpose: UI components for complexity dashboard
 * Created: 2025-11-21
 * Used by: Main dashboard initialization
 */

import { ComplexityState, ComplexityVector } from './complexity-state.js';
import { ComplexityMath } from './complexity-math.js';

// === CONFIG ===
// 🛠️ UI Configuration
const DEBOUNCE_DELAY = 100; // milliseconds
const UPDATE_ANIMATION_DURATION = 300; // milliseconds
const SIGNAL_LOSS_THRESHOLD = 0.01;

// 🧪 Scenario Presets
const SCENARIO_PRESETS = {
    initial: {
        name: 'Initial State',
        vector: [0.5, 0.5, 0.5, 0.5],
        description: 'Balanced starting point'
    },
    algorithm_heavy: {
        name: 'Algorithm-Heavy System',
        vector: [0.85, 0.3, 0.4, 0.2],
        description: 'Complex algorithm, simple structure'
    },
    data_rich: {
        name: 'Data-Rich System',
        vector: [0.4, 0.9, 0.6, 0.3],
        description: 'High information content'
    },
    dynamic_system: {
        name: 'Dynamic System',
        vector: [0.3, 0.5, 0.85, 0.4],
        description: 'High temporal evolution'
    },
    topological: {
        name: 'Topologically Complex',
        vector: [0.2, 0.4, 0.3, 0.9],
        description: 'Rich geometric structure'
    },
    balanced_high: {
        name: 'Balanced High',
        vector: [0.7, 0.75, 0.7, 0.75],
        description: 'All pillars strong'
    },
    emergent: {
        name: 'Emergent System',
        vector: [0.4, 0.8, 0.9, 0.6],
        description: 'Information + dynamics synergy'
    }
};

/**
 * 🧠 Class: InputPanel
 * Role: Renders and manages complexity vector controls
 * Inputs: Container ID and ComplexityState instance
 * Returns: Interactive control panel
 * Notes: Uses debouncing to prevent excessive updates
 */
export class InputPanel {
    constructor(container, state) {
        // Accept either string ID or element
        this.container = typeof container === 'string'
            ? document.getElementById(container)
            : container;

        if (!this.container) {
            throw new Error(`Container not found`);
        }

        this.state = state;
        this.debounceTimer = null;

        // Subscribe to state changes
        this.unsubscribe = state.subscribe((update) => this.handleStateUpdate(update));

        // Initial render
        this.render();
        this.attachListeners();
    }

    /**
     * 🧠 Function: render
     * Role: Create the complete panel HTML
     * Inputs: None
     * Returns: None (modifies DOM)
     * Notes: Uses Tailwind classes for styling
     */
    render() {
        const currentVector = this.state.vector.toArray();

        this.container.innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold text-teal-700 mb-4">
                    Complexity Vector Controls
                </h3>

                <!-- Sliders for each dimension -->
                <div class="space-y-4 mb-6">
                    ${this.renderSlider('alg', 'Algorithmic', 0, currentVector[0])}
                    ${this.renderSlider('info', 'Information', 1, currentVector[1])}
                    ${this.renderSlider('dyn', 'Dynamical', 2, currentVector[2])}
                    ${this.renderSlider('geom', 'Geometric', 3, currentVector[3])}
                </div>

                <!-- Operation buttons -->
                <div class="mb-6">
                    <h4 class="text-sm font-medium text-gray-700 mb-2">Quick Operations</h4>
                    <div class="grid grid-cols-2 gap-2">
                        ${this.renderOperationButtons()}
                    </div>
                </div>

                <!-- Scenario presets -->
                <div class="mb-4">
                    <label for="preset-selector" class="block text-sm font-medium text-gray-700 mb-2">
                        Scenario Presets
                    </label>
                    ${this.renderPresets()}
                </div>

                <!-- Action buttons -->
                <div class="grid grid-cols-2 gap-2 sm:gap-3 mt-4">
                    <button id="reset-btn"
                            class="px-3 sm:px-4 py-2 bg-gray-500 text-white text-sm sm:text-base rounded-md hover:bg-gray-600 transition-colors">
                        Reset
                    </button>
                    <button id="undo-btn"
                            class="px-3 sm:px-4 py-2 bg-blue-500 text-white text-sm sm:text-base rounded-md hover:bg-blue-600 transition-colors">
                        Undo
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 🧠 Function: renderSlider
     * Role: Generate HTML for a single slider control
     * Inputs: ID, label, index, current value
     * Returns: HTML string
     * Notes: Includes live value display
     */
    renderSlider(id, label, index, value) {
        return `
            <div class="slider-group">
                <label for="slider-${id}" class="flex justify-between text-sm font-medium text-gray-700 mb-1">
                    <span>${label} (C_${id})</span>
                    <span id="value-${id}" class="text-teal-600 font-mono" aria-live="polite">
                        ${value.toFixed(3)}
                    </span>
                </label>
                <input type="range"
                       id="slider-${id}"
                       data-index="${index}"
                       data-pillar="${id}"
                       min="0" max="1" step="0.01"
                       value="${value}"
                       aria-label="${label} complexity value"
                       aria-valuemin="0"
                       aria-valuemax="1"
                       aria-valuenow="${value}"
                       class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-teal">
            </div>
        `;
    }

    /**
     * 🧠 Function: renderOperationButtons
     * Role: Generate operation buttons HTML
     * Inputs: None
     * Returns: HTML string
     * Notes: Each button improves a specific pillar
     */
    renderOperationButtons() {
        const operations = [
            { id: 'improve-alg', pillar: 'alg', label: 'Improve Algorithm', icon: '🧮' },
            { id: 'improve-info', pillar: 'info', label: 'Add Information', icon: '📊' },
            { id: 'improve-dyn', pillar: 'dyn', label: 'Increase Dynamics', icon: '⚡' },
            { id: 'improve-geom', pillar: 'geom', label: 'Enrich Topology', icon: '🌐' }
        ];

        return operations.map(op => `
            <button id="${op.id}"
                    data-pillar="${op.pillar}"
                    class="operation-btn px-3 py-2 bg-teal-600 text-white text-sm rounded-md hover:bg-teal-700 transition-colors flex items-center justify-center gap-2">
                <span>${op.icon}</span>
                <span>${op.label}</span>
            </button>
        `).join('');
    }

    /**
     * 🧠 Function: renderPresets
     * Role: Generate preset dropdown HTML
     * Inputs: None
     * Returns: HTML string
     * Notes: Includes descriptions in dropdown
     */
    renderPresets() {
        const options = Object.entries(SCENARIO_PRESETS).map(([key, preset]) =>
            `<option value="${key}">${preset.name} - ${preset.description}</option>`
        ).join('');

        return `
            <select id="preset-selector"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="">Select a preset...</option>
                ${options}
            </select>
        `;
    }

    /**
     * 🧠 Function: attachListeners
     * Role: Attach event listeners to all controls
     * Inputs: None
     * Returns: None
     * Notes: Uses event delegation where appropriate
     */
    attachListeners() {
        // Slider listeners with debouncing
        const sliders = this.container.querySelectorAll('input[type="range"]');
        sliders.forEach(slider => {
            slider.addEventListener('input', (e) => this.handleSliderChange(e));
        });

        // Operation button listeners
        const operationBtns = this.container.querySelectorAll('.operation-btn');
        operationBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleOperation(e));
        });

        // Preset selector
        const presetSelector = this.container.querySelector('#preset-selector');
        if (presetSelector) {
            presetSelector.addEventListener('change', (e) => this.handlePresetChange(e));
        }

        // Reset button
        const resetBtn = this.container.querySelector('#reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.handleReset());
        }

        // Undo button
        const undoBtn = this.container.querySelector('#undo-btn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => this.handleUndo());
        }
    }

    /**
     * 🧠 Function: handleSliderChange
     * Role: Handle slider input with debouncing
     * Inputs: Event object
     * Returns: None
     * Notes: Debounces to prevent excessive updates
     */
    handleSliderChange(event) {
        const slider = event.target;
        const index = parseInt(slider.dataset.index);
        const value = parseFloat(slider.value);
        const pillar = slider.dataset.pillar;

        // Update display immediately
        const display = this.container.querySelector(`#value-${pillar}`);
        if (display) {
            display.textContent = value.toFixed(3);
        }

        // Debounce state update
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            const newVector = this.state.vector.clone();
            newVector.data[index] = value;

            // Clear scenario name on manual adjustment
            this.state.currentScenario = null;

            this.state.updateVector(newVector, `Manual adjust ${pillar}`);
        }, DEBOUNCE_DELAY);
    }

    /**
     * 🧠 Function: handleOperation
     * Role: Apply improvement operation
     * Inputs: Event object
     * Returns: None
     * Notes: Uses delta values from state configuration
     */
    handleOperation(event) {
        const btn = event.currentTarget;
        const pillar = btn.dataset.pillar;
        const delta = this.state.deltas[pillar];

        const improved = ComplexityMath.applyImprovement(
            this.state.vector,
            pillar,
            delta
        );

        // Clear scenario name on manual operation
        this.state.currentScenario = null;

        this.state.updateVector(improved, `Improve ${pillar} (+${delta})`);
    }

    /**
     * 🧠 Function: handlePresetChange
     * Role: Load preset configuration
     * Inputs: Event object
     * Returns: None
     * Notes: Updates vector to preset values
     */
    handlePresetChange(event) {
        const presetKey = event.target.value;
        console.log('Preset selected:', presetKey);

        if (!presetKey || presetKey === '') return;

        const preset = SCENARIO_PRESETS[presetKey];
        console.log('Preset data:', preset);

        if (preset) {
            const newVector = new ComplexityVector(...preset.vector);

            // Set scenario name in state
            this.state.currentScenario = preset.name;

            this.state.updateVector(newVector, `Load preset: ${preset.name}`);
            console.log('✓ Preset loaded:', preset.name);

            // Keep selection visible (don't reset)
            // event.target.value = '';  // Removed to show selected preset
        } else {
            console.warn('Preset not found:', presetKey);
        }
    }

    /**
     * 🧠 Function: handleReset
     * Role: Reset to default state
     * Inputs: None
     * Returns: None
     * Notes: Uses default configuration
     */
    handleReset() {
        // Clear scenario name on reset
        this.state.currentScenario = null;
        this.state.reset();
    }

    /**
     * 🧠 Function: handleUndo
     * Role: Revert to previous state
     * Inputs: None
     * Returns: None
     * Notes: Uses state history
     */
    handleUndo() {
        const success = this.state.undo();
        if (!success) {
            console.log('No history to undo');
        }
    }

    /**
     * 🧠 Function: handleStateUpdate
     * Role: React to external state changes
     * Inputs: Update event object
     * Returns: None
     * Notes: Updates sliders to match new state
     */
    handleStateUpdate(update) {
        // Update sliders to match new state
        if (update.type === 'vectorUpdate' || update.type === 'undo' || update.type === 'import') {
            const vector = this.state.vector.toArray();
            const keys = ['alg', 'info', 'dyn', 'geom'];

            keys.forEach((key, index) => {
                const slider = this.container.querySelector(`#slider-${key}`);
                const display = this.container.querySelector(`#value-${key}`);

                if (slider && slider.value !== vector[index].toString()) {
                    slider.value = vector[index];
                }
                if (display) {
                    display.textContent = vector[index].toFixed(3);
                }
            });
        }
    }

    /**
     * 🧠 Function: destroy
     * Role: Clean up component
     * Inputs: None
     * Returns: None
     * Notes: Removes event listeners and subscriptions
     */
    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        clearTimeout(this.debounceTimer);
        this.container.innerHTML = '';
    }
}

/**
 * 🧠 Class: VectorDisplay
 * Role: Shows current vector state and signal loss
 * Inputs: Container ID and ComplexityState instance
 * Returns: Reactive display component
 * Notes: Updates automatically on state changes
 */
export class VectorDisplay {
    constructor(container, state) {
        // Accept either string ID or element
        this.container = typeof container === 'string'
            ? document.getElementById(container)
            : container;

        if (!this.container) {
            throw new Error(`Container not found`);
        }

        this.state = state;
        this.previousVector = state.vector.clone();

        // Subscribe to state changes
        this.unsubscribe = state.subscribe((update) => this.update(update));

        // Initial render
        this.render();
    }

    /**
     * 🧠 Function: update
     * Role: Handle state updates
     * Inputs: Update event from state
     * Returns: None
     * Notes: Re-renders display with new values
     */
    update(update) {
        // Store previous for signal loss calculation
        if (update.type === 'vectorUpdate') {
            this.render();
            this.previousVector = this.state.vector.clone();
        } else if (update.type === 'weightsUpdate') {
            this.render();
        }
    }

    /**
     * 🧠 Function: render
     * Role: Generate complete display HTML
     * Inputs: None
     * Returns: None (modifies DOM)
     * Notes: Shows vector, scalar, and signal loss
     */
    render() {
        const vector = this.state.vector;
        const scalar = this.state.getScalar();
        const signalLoss = this.calculateCurrentSignalLoss();
        const stats = this.state.getStatistics();

        this.container.innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold text-teal-700 mb-4">
                    Current State
                </h3>

                <!-- Vector display -->
                <div class="mb-4 p-4 bg-gray-50 rounded-lg">
                    <h4 class="text-sm font-medium text-gray-600 mb-2">4D Complexity Vector</h4>
                    <div class="font-mono text-sm space-y-1">
                        ${this.renderVectorComponents(vector)}
                    </div>
                </div>

                <!-- Scalar average with warning -->
                <div class="mb-4 p-4 ${scalar > 0.5 ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-gray-50 rounded-lg'}">
                    <div class="text-sm font-medium text-gray-700">
                        Scalar Average (Information-Destroying)
                    </div>
                    <div class="text-2xl font-bold ${scalar > 0.5 ? 'text-yellow-600' : 'text-gray-700'}">
                        ${scalar.toFixed(3)}
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                        Weighted average loses pillar-specific information
                    </div>
                </div>

                <!-- Signal loss indicator -->
                ${this.renderSignalLoss(signalLoss)}

                <!-- Statistics -->
                <div class="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 class="text-sm font-medium text-gray-600 mb-2">Statistics</h4>
                    <div class="grid grid-cols-2 gap-2 text-xs">
                        <div>
                            <span class="text-gray-500">Dominant:</span>
                            <span class="font-medium text-teal-600 ml-1">${stats.dominantPillar}</span>
                        </div>
                        <div>
                            <span class="text-gray-500">Weakest:</span>
                            <span class="font-medium text-orange-600 ml-1">${stats.weakestPillar}</span>
                        </div>
                        <div>
                            <span class="text-gray-500">Range:</span>
                            <span class="font-medium ml-1">${stats.range.toFixed(3)}</span>
                        </div>
                        <div>
                            <span class="text-gray-500">Balance:</span>
                            <span class="font-medium ml-1 ${stats.balanced ? 'text-green-600' : 'text-red-600'}">
                                ${stats.balanced ? 'Yes' : 'No'}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Operation count -->
                <div class="mt-4 text-xs text-gray-500">
                    Operations performed: ${this.state.operationCount}
                </div>
            </div>
        `;
    }

    /**
     * 🧠 Function: renderVectorComponents
     * Role: Format vector components display
     * Inputs: ComplexityVector
     * Returns: HTML string
     * Notes: Color-codes by value
     */
    renderVectorComponents(vector) {
        const components = [
            { key: 'alg', label: 'C_alg (Algorithmic)' },
            { key: 'info', label: 'C_info (Information)' },
            { key: 'dyn', label: 'C_dyn (Dynamical)' },
            { key: 'geom', label: 'C_geom (Geometric)' }
        ];

        return components.map(comp => {
            const value = vector.get(comp.key);
            const colorClass = this.getValueColor(value);

            return `
                <div class="flex justify-between">
                    <span class="text-gray-600">${comp.label}:</span>
                    <span class="${colorClass} font-medium">${value.toFixed(3)}</span>
                </div>
            `;
        }).join('');
    }

    /**
     * 🧠 Function: getValueColor
     * Role: Determine color class based on value
     * Inputs: Numeric value [0,1]
     * Returns: Tailwind color class
     * Notes: Visual feedback for value ranges
     */
    getValueColor(value) {
        if (value >= 0.8) return 'text-green-600';
        if (value >= 0.6) return 'text-teal-600';
        if (value >= 0.4) return 'text-blue-600';
        if (value >= 0.2) return 'text-orange-600';
        return 'text-red-600';
    }

    /**
     * 🧠 Function: calculateCurrentSignalLoss
     * Role: Calculate signal loss from last change
     * Inputs: None (uses state)
     * Returns: Signal loss object
     * Notes: Only if there was a previous state
     */
    calculateCurrentSignalLoss() {
        if (this.state.history.length === 0) {
            return null;
        }

        const lastHistory = this.state.history[this.state.history.length - 1];
        return ComplexityMath.calculateSignalLoss(
            lastHistory.vector,
            this.state.vector,
            this.state.weights
        );
    }

    /**
     * 🧠 Function: renderSignalLoss
     * Role: Display signal loss warning
     * Inputs: Signal loss object
     * Returns: HTML string
     * Notes: Only shows if loss detected
     */
    renderSignalLoss(signalLoss) {
        if (!signalLoss || signalLoss.total < SIGNAL_LOSS_THRESHOLD) {
            return '';
        }

        const lostPillars = Object.entries(signalLoss.byPillar)
            .filter(([, delta]) => delta > 0)
            .map(([pillar]) => pillar);

        return `
            <div class="mb-4 p-4 bg-red-50 border-l-4 border-red-400">
                <div class="flex items-center">
                    <span class="text-red-600 mr-2">⚠️</span>
                    <div>
                        <div class="text-sm font-medium text-red-800">
                            Signal Loss Detected: Σδ = ${signalLoss.total.toFixed(3)}
                        </div>
                        <div class="text-xs text-red-600 mt-1">
                            Improvements in ${lostPillars.join(', ')} not reflected in scalar
                        </div>
                        <div class="text-xs text-red-500 mt-1">
                            Loss type: <span class="font-medium">${signalLoss.lossType}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 🧠 Function: destroy
     * Role: Clean up component
     * Inputs: None
     * Returns: None
     * Notes: Unsubscribes from state
     */
    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
        this.container.innerHTML = '';
    }
}

// Export default initialization helper
export function initializeComponents(inputContainerId, displayContainerId, state) {
    const inputPanel = new InputPanel(inputContainerId, state);
    const vectorDisplay = new VectorDisplay(displayContainerId, state);

    return {
        inputPanel,
        vectorDisplay,
        destroy: () => {
            inputPanel.destroy();
            vectorDisplay.destroy();
        }
    };
}