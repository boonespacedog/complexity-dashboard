/**
 * 📄 File: complexity-state.js
 * Purpose: State management for complexity dashboard
 * Created: 2025-11-21
 * Used by: All dashboard components
 */

// === CONFIG ===
// 🛠️ Default Values
const DEFAULT_VECTOR = [0.5, 0.5, 0.5, 0.5];
const DEFAULT_WEIGHTS = [0.25, 0.25, 0.25, 0.25];
const DEFAULT_DELTAS = {
    alg: 0.2,
    info: 0.2,
    dyn: 0.15,
    geom: 0.3
};

// 🧪 Parameters
const EPSILON = 1e-6;  // For floating point comparisons
const MAX_HISTORY = 100;  // Maximum stored states

/**
 * 🧠 Class: ComplexityVector
 * Role: Represents a 4D complexity state
 * Inputs: Four complexity values [0,1] or array
 * Returns: Normalized complexity vector object
 * Notes: Each dimension represents a different aspect of complexity
 */
export class ComplexityVector {
    constructor(alg = 0.5, info = 0.5, dyn = 0.5, geom = 0.5) {
        // Handle array input
        if (Array.isArray(alg)) {
            [alg, info, dyn, geom] = alg;
        }

        this.validate(alg, info, dyn, geom);
        this.data = [alg, info, dyn, geom];
        this.labels = ['Algorithmic', 'Information', 'Dynamical', 'Geometric'];
        this.keys = ['alg', 'info', 'dyn', 'geom'];
    }

    /**
     * 🧠 Function: validate
     * Role: Ensure all components are in valid range [0,1]
     * Inputs: Four complexity values
     * Returns: Throws error if invalid
     * Notes: Critical for maintaining mathematical consistency
     */
    validate(...values) {
        values.forEach((v, i) => {
            if (typeof v !== 'number' || isNaN(v)) {
                throw new Error(`Component ${i} is not a number: ${v}`);
            }
            if (v < 0 || v > 1) {
                throw new Error(`Component ${i} out of range [0,1]: ${v}`);
            }
        });
    }

    /**
     * 🧠 Function: toArray
     * Role: Convert vector to array format
     * Inputs: None
     * Returns: Array copy of vector data
     * Notes: Returns copy to prevent external mutation
     */
    toArray() {
        return [...this.data];
    }

    /**
     * 🧠 Function: get
     * Role: Access component by key name
     * Inputs: Key string ('alg', 'info', 'dyn', 'geom')
     * Returns: Component value or null
     * Notes: Provides named access to components
     */
    get(key) {
        const index = this.keys.indexOf(key);
        return index >= 0 ? this.data[index] : null;
    }

    /**
     * 🧠 Function: set
     * Role: Update component by key name
     * Inputs: Key string and new value [0,1]
     * Returns: None (mutates state)
     * Notes: Validates before updating
     */
    set(key, value) {
        const index = this.keys.indexOf(key);
        if (index >= 0) {
            this.validate(value);
            this.data[index] = value;
        }
    }

    /**
     * 🧠 Function: clone
     * Role: Create deep copy of vector
     * Inputs: None
     * Returns: New ComplexityVector instance
     * Notes: Essential for immutable operations
     */
    clone() {
        return new ComplexityVector(...this.data);
    }

    /**
     * 🧠 Function: add
     * Role: Vector addition
     * Inputs: Other vector
     * Returns: New vector (sum)
     * Notes: Clamps result to [0,1]
     */
    add(other) {
        const result = this.data.map((v, i) =>
            Math.max(0, Math.min(1, v + other.data[i]))
        );
        return new ComplexityVector(...result);
    }

    /**
     * 🧠 Function: subtract
     * Role: Vector subtraction
     * Inputs: Other vector
     * Returns: New vector (difference)
     * Notes: Used for calculating changes
     */
    subtract(other) {
        const result = this.data.map((v, i) => v - other.data[i]);
        return new ComplexityVector(...result.map(v => Math.max(0, Math.min(1, v))));
    }

    /**
     * 🧠 Function: magnitude
     * Role: Calculate L2 norm (Euclidean length)
     * Inputs: None
     * Returns: Scalar magnitude
     * Notes: Used for measuring vector changes
     */
    magnitude() {
        return Math.sqrt(this.data.reduce((sum, v) => sum + v * v, 0));
    }

    /**
     * 🧠 Function: scale
     * Role: Multiply vector by scalar
     * Inputs: Scalar factor
     * Returns: New scaled vector
     * Notes: Clamps result to [0,1]
     */
    scale(factor) {
        const result = this.data.map(v => Math.max(0, Math.min(1, v * factor)));
        return new ComplexityVector(...result);
    }

    /**
     * 🧠 Function: equals
     * Role: Check equality with another vector
     * Inputs: Other vector, epsilon tolerance
     * Returns: Boolean indicating equality
     * Notes: Uses epsilon for floating point comparison
     */
    equals(other, epsilon = EPSILON) {
        if (!other || !other.data) return false;
        return this.data.every((v, i) =>
            Math.abs(v - other.data[i]) < epsilon
        );
    }

    /**
     * 🧠 Function: toString
     * Role: String representation for debugging
     * Inputs: None
     * Returns: Formatted string
     * Notes: Shows all components with 3 decimal places
     */
    toString() {
        return `C(${this.data.map(v => v.toFixed(3)).join(', ')})`;
    }
}

/**
 * 🧠 Class: ComplexityState
 * Role: Central state management with observer pattern
 * Inputs: Initial configuration object
 * Returns: Observable state manager
 * Notes: Implements reactive updates for all UI components
 */
export class ComplexityState {
    constructor(config = {}) {
        // Initialize vector state
        const initial = config.initial || DEFAULT_VECTOR;
        this.vector = new ComplexityVector(...initial);

        // History tracking
        this.history = [];
        this.maxHistory = config.maxHistory || MAX_HISTORY;

        // Configuration
        this.weights = config.weights || [...DEFAULT_WEIGHTS];
        this.deltas = config.deltas || { ...DEFAULT_DELTAS };

        // Observer pattern
        this.observers = [];

        // Metadata
        this.lastOperation = null;
        this.currentScenario = null;  // Track loaded scenario name
        this.sessionStartTime = Date.now();
        this.operationCount = 0;
    }

    /**
     * 🧠 Function: updateVector
     * Role: Update current vector and notify observers
     * Inputs: New ComplexityVector or array
     * Returns: None
     * Notes: Saves to history and triggers reactive updates
     */
    updateVector(newVector, operation = null) {
        // Save current state to history
        this.addToHistory(this.vector.clone(), operation);

        // Update vector
        if (Array.isArray(newVector)) {
            this.vector = new ComplexityVector(...newVector);
        } else if (newVector instanceof ComplexityVector) {
            this.vector = newVector.clone();
        } else {
            throw new Error('Invalid vector type');
        }

        // Track metadata
        this.lastOperation = operation;
        this.operationCount++;

        // Notify all observers
        this.notify({
            type: 'vectorUpdate',
            vector: this.vector,
            operation: operation,
            timestamp: Date.now()
        });
    }

    /**
     * 🧠 Function: addToHistory
     * Role: Store state snapshots for undo/analysis
     * Inputs: Vector state and operation description
     * Returns: None
     * Notes: Maintains max history size
     */
    addToHistory(vector, operation) {
        this.history.push({
            vector: vector.clone(),
            operation: operation,
            timestamp: Date.now(),
            scalar: this.getScalar(vector),
            operationIndex: this.operationCount
        });

        // Maintain max history size
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
    }

    /**
     * 🧠 Function: getScalar
     * Role: Calculate weighted average (information-destroying)
     * Inputs: Optional vector and weights
     * Returns: Scalar value [0,1]
     * Notes: Default uses current state and weights
     */
    getScalar(vector = null, weights = null) {
        const v = vector || this.vector;
        const w = weights || this.weights;

        // Validate weights sum to 1
        const sum = w.reduce((a, b) => a + b, 0);
        if (Math.abs(sum - 1.0) > EPSILON) {
            console.warn(`Weights sum to ${sum}, normalizing...`);
            const normalized = w.map(wi => wi / sum);
            return v.toArray().reduce((sum, val, idx) =>
                sum + val * normalized[idx], 0
            );
        }

        return v.toArray().reduce((sum, val, idx) =>
            sum + val * w[idx], 0
        );
    }

    /**
     * 🧠 Function: updateWeights
     * Role: Change scalar averaging weights
     * Inputs: Array of 4 weights summing to 1
     * Returns: None
     * Notes: Normalizes if sum != 1
     */
    updateWeights(newWeights) {
        if (!Array.isArray(newWeights) || newWeights.length !== 4) {
            throw new Error('Weights must be array of length 4');
        }

        // Normalize weights
        const sum = newWeights.reduce((a, b) => a + b, 0);
        this.weights = newWeights.map(w => w / sum);

        this.notify({
            type: 'weightsUpdate',
            weights: this.weights,
            timestamp: Date.now()
        });
    }

    /**
     * 🧠 Function: updateDeltas
     * Role: Change improvement step sizes
     * Inputs: Object with pillar deltas
     * Returns: None
     * Notes: Partial updates allowed
     */
    updateDeltas(newDeltas) {
        this.deltas = { ...this.deltas, ...newDeltas };

        this.notify({
            type: 'deltasUpdate',
            deltas: this.deltas,
            timestamp: Date.now()
        });
    }

    /**
     * 🧠 Function: improve
     * Role: Improve a specific pillar by delta amount
     * Inputs: pillar index (0-3), delta amount
     * Returns: None
     * Notes: Clamps result to [0,1], notifies observers
     */
    improve(pillar, delta) {
        const current = this.vector.toArray();
        const updated = [...current];

        // Apply improvement with clamping
        updated[pillar] = Math.max(0, Math.min(1, current[pillar] + delta));

        // Update state
        this.updateVector(
            new ComplexityVector(...updated),
            `improve_${this.vector.keys[pillar]}_${delta.toFixed(3)}`
        );
    }

    /**
     * 🧠 Function: subscribe
     * Role: Register observer for state changes
     * Inputs: Observer callback function
     * Returns: Unsubscribe function
     * Notes: Returns function to remove observer
     */
    subscribe(observer) {
        this.observers.push(observer);

        // Return unsubscribe function
        return () => {
            const index = this.observers.indexOf(observer);
            if (index > -1) {
                this.observers.splice(index, 1);
            }
        };
    }

    /**
     * 🧠 Function: notify
     * Role: Trigger all observer callbacks
     * Inputs: Update event object
     * Returns: None
     * Notes: Catches errors to prevent cascading failures
     */
    notify(update) {
        this.observers.forEach(observer => {
            try {
                observer(update, this);
            } catch (error) {
                console.error('Observer error:', error);
            }
        });
    }

    /**
     * 🧠 Function: notifyObservers
     * Role: Alias for notify() for compatibility
     * Inputs: Update event object (optional)
     * Returns: None
     * Notes: Backwards compatibility wrapper
     */
    notifyObservers(update) {
        this.notify(update || { type: 'manualUpdate', timestamp: Date.now() });
    }

    /**
     * 🧠 Function: reset
     * Role: Reset to initial state
     * Inputs: Optional new initial vector
     * Returns: None
     * Notes: Clears history
     */
    reset(initial = DEFAULT_VECTOR) {
        this.history = [];
        this.operationCount = 0;
        this.lastOperation = null;
        this.updateVector(initial, 'reset');
    }

    /**
     * 🧠 Function: undo
     * Role: Revert to previous state
     * Inputs: None
     * Returns: Boolean success
     * Notes: Uses history stack
     */
    undo() {
        if (this.history.length > 0) {
            const previous = this.history.pop();
            this.vector = previous.vector.clone();
            this.lastOperation = 'undo';
            this.operationCount++;

            this.notify({
                type: 'undo',
                vector: this.vector,
                timestamp: Date.now()
            });

            return true;
        }
        return false;
    }

    /**
     * 🧠 Function: getStatistics
     * Role: Calculate state statistics
     * Inputs: None
     * Returns: Statistics object
     * Notes: Useful for analysis displays
     */
    getStatistics() {
        const arr = this.vector.toArray();
        const keys = this.vector.keys;
        return {
            mean: arr.reduce((a, b) => a + b) / 4,
            max: Math.max(...arr),
            min: Math.min(...arr),
            range: Math.max(...arr) - Math.min(...arr),
            variance: this.calculateVariance(arr),
            dominantPillar: keys[arr.indexOf(Math.max(...arr))],
            weakestPillar: keys[arr.indexOf(Math.min(...arr))],
            balanced: Math.max(...arr) - Math.min(...arr) < 0.2
        };
    }

    /**
     * 🧠 Function: calculateVariance
     * Role: Calculate statistical variance
     * Inputs: Array of values
     * Returns: Variance value
     * Notes: Helper for statistics
     */
    calculateVariance(arr) {
        const mean = arr.reduce((a, b) => a + b) / arr.length;
        const squareDiffs = arr.map(v => Math.pow(v - mean, 2));
        return squareDiffs.reduce((a, b) => a + b) / arr.length;
    }

    /**
     * 🧠 Function: export
     * Role: Export state for saving/sharing
     * Inputs: None
     * Returns: Serializable object
     * Notes: Can be used for save/load functionality
     */
    export() {
        return {
            vector: this.vector.toArray(),
            weights: this.weights,
            deltas: this.deltas,
            history: this.history.map(h => ({
                vector: h.vector.toArray(),
                operation: h.operation,
                timestamp: h.timestamp
            })),
            metadata: {
                sessionStartTime: this.sessionStartTime,
                operationCount: this.operationCount,
                exportTime: Date.now()
            }
        };
    }

    /**
     * 🧠 Function: import
     * Role: Restore state from export
     * Inputs: Exported state object
     * Returns: None
     * Notes: Validates before importing
     */
    import(data) {
        try {
            this.vector = new ComplexityVector(...data.vector);
            this.weights = data.weights || DEFAULT_WEIGHTS;
            this.deltas = data.deltas || DEFAULT_DELTAS;

            this.history = (data.history || []).map(h => ({
                vector: new ComplexityVector(...h.vector),
                operation: h.operation,
                timestamp: h.timestamp
            }));

            this.sessionStartTime = data.metadata?.sessionStartTime || Date.now();
            this.operationCount = data.metadata?.operationCount || 0;

            this.notify({
                type: 'import',
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Import failed:', error);
            throw new Error('Invalid import data');
        }
    }
}

// Export default configuration for reuse
export const DEFAULT_CONFIG = {
    initial: DEFAULT_VECTOR,
    weights: DEFAULT_WEIGHTS,
    deltas: DEFAULT_DELTAS,
    maxHistory: MAX_HISTORY
};