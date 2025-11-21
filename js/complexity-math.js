/**
 * 📄 File: complexity-math.js
 * Purpose: Mathematical operations for complexity calculations
 * Created: 2025-11-21
 * Used by: Dashboard components and visualizations
 */

import { ComplexityVector } from './complexity-state.js';

// === CONFIG ===
// 🛠️ Mathematical Constants
const EPSILON = 1e-6;
const DEFAULT_WEIGHTS = [0.25, 0.25, 0.25, 0.25];

// 🧪 Parameters for calculations
const SIGNAL_LOSS_THRESHOLD = 0.01;
const PARETO_MAX_POINTS = 100;

/**
 * 🧠 Class: ComplexityMath
 * Role: Core mathematical operations for complexity analysis
 * Inputs: Various vectors and parameters
 * Returns: Calculated results
 * Notes: Implements paper's mathematical foundations
 */
export const ComplexityMath = {
    /**
     * 🧠 Function: computeScalarAverage
     * Role: Calculate weighted scalar average (information-destroying)
     * Inputs: ComplexityVector and optional weights
     * Returns: Scalar value [0,1]
     * Notes: This is what the theorem proves is impossible to preserve information
     */
    computeScalarAverage(vector, weights = null) {
        if (!vector || !vector.toArray) {
            throw new Error('Invalid vector input');
        }

        const w = weights || DEFAULT_WEIGHTS;
        const arr = vector.toArray();

        // Validate weights
        const sum = w.reduce((a, b) => a + b, 0);
        if (Math.abs(sum - 1.0) > EPSILON) {
            // Normalize weights if they don't sum to 1
            const normalized = w.map(wi => wi / sum);
            return arr.reduce((sum, val, idx) => sum + val * normalized[idx], 0);
        }

        return arr.reduce((sum, val, idx) => sum + val * w[idx], 0);
    },

    /**
     * 🧠 Function: applyImprovement
     * Role: Apply improvement to specific complexity pillar
     * Inputs: Vector, pillar name, delta amount
     * Returns: New improved ComplexityVector
     * Notes: Clamps to [0,1] range
     */
    applyImprovement(vector, pillar, delta) {
        const improved = vector.clone();
        const current = improved.get(pillar);

        if (current === null) {
            throw new Error(`Invalid pillar: ${pillar}`);
        }

        // Apply improvement, clamping to [0,1]
        const newValue = Math.max(0, Math.min(1, current + delta));
        improved.set(pillar, newValue);

        return improved;
    },

    /**
     * 🧠 Function: calculateSignalLoss
     * Role: Calculate information lost when using scalar metric
     * Inputs: Before and after vectors, optional weights
     * Returns: Signal loss analysis object
     * Notes: Core demonstration of the impossibility theorem
     */
    calculateSignalLoss(before, after, weights = null) {
        const beforeArr = before.toArray();
        const afterArr = after.toArray();

        // Calculate vector changes
        const vectorDelta = afterArr.map((v, i) => v - beforeArr[i]);

        // Calculate scalar changes
        const scalarBefore = this.computeScalarAverage(before, weights);
        const scalarAfter = this.computeScalarAverage(after, weights);
        const scalarDelta = scalarAfter - scalarBefore;

        // Identify lost signals: positive improvements invisible to scalar
        const lostSignals = {};
        const keys = ['alg', 'info', 'dyn', 'geom'];
        let totalLoss = 0;

        vectorDelta.forEach((delta, i) => {
            if (delta > 0 && Math.abs(scalarDelta) < SIGNAL_LOSS_THRESHOLD) {
                // Positive improvement but scalar shows ~no change
                lostSignals[keys[i]] = delta;
                totalLoss += delta;
            } else if (delta > 0 && scalarDelta < 0) {
                // Positive improvement but scalar shows decrease!
                lostSignals[keys[i]] = delta;
                totalLoss += delta;
            }
        });

        return {
            total: totalLoss,
            byPillar: lostSignals,
            scalarChange: scalarDelta,
            vectorChanges: vectorDelta,
            isSignalLost: totalLoss > SIGNAL_LOSS_THRESHOLD,
            lossType: this.categorizeLoss(vectorDelta, scalarDelta)
        };
    },

    /**
     * 🧠 Function: categorizeLoss
     * Role: Classify type of information loss
     * Inputs: Vector deltas and scalar delta
     * Returns: Loss category string
     * Notes: Helps users understand the type of distortion
     */
    categorizeLoss(vectorDelta, scalarDelta) {
        const hasPositive = vectorDelta.some(d => d > EPSILON);
        const hasNegative = vectorDelta.some(d => d < -EPSILON);

        if (hasPositive && hasNegative && Math.abs(scalarDelta) < EPSILON) {
            return 'cancellation'; // Trade-offs cancel out
        } else if (hasPositive && scalarDelta < -EPSILON) {
            return 'inversion'; // Improvement shows as degradation
        } else if (hasPositive && Math.abs(scalarDelta) < EPSILON) {
            return 'invisibility'; // Improvement not visible
        } else if (Math.abs(scalarDelta) > EPSILON) {
            const vectorMagnitude = Math.sqrt(vectorDelta.reduce((s, d) => s + d * d, 0));
            if (Math.abs(scalarDelta) < vectorMagnitude / 2) {
                return 'compression'; // Scalar understates change
            }
        }
        return 'none'; // No significant loss
    },

    /**
     * 🧠 Function: computeParetoFrontier
     * Role: Find non-dominated states in multi-objective space
     * Inputs: Array of ComplexityVectors
     * Returns: Indices of Pareto-optimal states
     * Notes: Key for understanding trade-offs
     */
    computeParetoFrontier(states) {
        const n = states.length;
        const isPareto = new Array(n).fill(true);

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i !== j && this.dominates(states[j], states[i])) {
                    isPareto[i] = false;
                    break;
                }
            }
        }

        return states
            .map((state, index) => ({ state, index }))
            .filter((_, i) => isPareto[i]);
    },

    /**
     * 🧠 Function: dominates
     * Role: Check Pareto dominance between vectors
     * Inputs: Two ComplexityVectors
     * Returns: Boolean - true if A dominates B
     * Notes: A dominates B if A >= B componentwise and A != B
     */
    dominates(a, b) {
        const aArr = a.toArray();
        const bArr = b.toArray();
        const allGeq = aArr.every((v, i) => v >= bArr[i] - EPSILON);
        const someGt = aArr.some((v, i) => v > bArr[i] + EPSILON);
        return allGeq && someGt;
    },

    /**
     * 🧠 Function: projectTo3D
     * Role: Project 4D vector to 3D for visualization
     * Inputs: ComplexityVector and projection method
     * Returns: Array of 3 coordinates
     * Notes: Multiple methods for different perspectives
     */
    projectTo3D(vector, method = 'drop-geom') {
        const arr = vector.toArray();

        switch (method) {
            case 'drop-geom':
                // Drop geometric dimension (most common)
                return arr.slice(0, 3);

            case 'drop-last':
                // Drop last dimension
                return arr.slice(0, 3);

            case 'pca-simple':
                // Simplified PCA-like projection
                const mean = arr.reduce((s, v) => s + v) / 4;
                const centered = arr.map(v => v - mean);
                return [
                    centered[0] * 0.7 + centered[1] * 0.3,
                    centered[2] * 0.7 + centered[3] * 0.3,
                    centered.reduce((s, v) => s + v * v) / 2
                ];

            case 'weighted-sum':
                // Weighted combination for each axis
                return [
                    arr[0] * 0.6 + arr[1] * 0.4,  // Algorithm + Info
                    arr[2] * 0.6 + arr[3] * 0.4,  // Dynamic + Geometric
                    this.computeScalarAverage(vector) // Overall scalar
                ];

            default:
                return arr.slice(0, 3);
        }
    },

    /**
     * 🧠 Function: generateCycle
     * Role: Generate the 5-step impossibility cycle from the paper
     * Inputs: Initial vector and deltas for each pillar
     * Returns: Array of states showing the paradox
     * Notes: Core proof of the impossibility theorem
     */
    generateCycle(initial, deltas) {
        const states = [];
        const operations = [];

        // Step 0: Initial state
        states.push(initial.clone());

        let current = initial.clone();

        // Step 1: Improve algorithmic
        current = this.applyImprovement(current, 'alg', deltas.alg);
        states.push(current.clone());
        operations.push('Optimize Algorithm');

        // Step 2: Improve information
        current = this.applyImprovement(current, 'info', deltas.info);
        states.push(current.clone());
        operations.push('Add Correlations');

        // Step 3: Improve dynamical
        current = this.applyImprovement(current, 'dyn', deltas.dyn);
        states.push(current.clone());
        operations.push('Increase Dynamics');

        // Step 4: Improve geometric
        current = this.applyImprovement(current, 'geom', deltas.geom);
        states.push(current.clone());
        operations.push('Enrich Topology');

        // Step 5: Geometric return (projection back to initial)
        // This is the paradox: geometrically returns to X₀
        // but scalar says C*(X₄) > C*(X₀)
        states.push(initial.clone());
        operations.push('Geometric Return');

        return {
            states,
            operations,
            paradox: {
                scalarInitial: this.computeScalarAverage(initial),
                scalarFinal: this.computeScalarAverage(states[4]),
                vectorInitial: initial.toArray(),
                vectorFinal: states[4].toArray(),
                totalDelta: deltas.alg + deltas.info + deltas.dyn + deltas.geom
            }
        };
    },

    /**
     * 🧠 Function: validateState
     * Role: Check if vector state is valid
     * Inputs: ComplexityVector
     * Returns: Validation result object
     * Notes: Useful for UI validation
     */
    validateState(vector) {
        const arr = vector.toArray();

        return {
            valid: arr.every(v => v >= 0 && v <= 1),
            saturated: arr.filter(v => v >= 0.99).length,
            empty: arr.filter(v => v <= 0.01).length,
            balanced: Math.max(...arr) - Math.min(...arr) < 0.2,
            warnings: this.generateWarnings(arr)
        };
    },

    /**
     * 🧠 Function: generateWarnings
     * Role: Generate user warnings for edge cases
     * Inputs: Array of vector values
     * Returns: Array of warning messages
     * Notes: Helps users understand state limitations
     */
    generateWarnings(arr) {
        const warnings = [];
        const keys = ['Algorithmic', 'Information', 'Dynamical', 'Geometric'];

        arr.forEach((v, i) => {
            if (v >= 0.99) {
                warnings.push(`${keys[i]} complexity is saturated`);
            } else if (v <= 0.01) {
                warnings.push(`${keys[i]} complexity is near zero`);
            }
        });

        const range = Math.max(...arr) - Math.min(...arr);
        if (range > 0.8) {
            warnings.push('Highly unbalanced complexity distribution');
        }

        return warnings;
    },

    /**
     * 🧠 Function: computeDistance
     * Role: Calculate distance between two vectors
     * Inputs: Two ComplexityVectors and metric type
     * Returns: Distance value
     * Notes: Multiple metrics for different analyses
     */
    computeDistance(v1, v2, metric = 'euclidean') {
        const a1 = v1.toArray();
        const a2 = v2.toArray();

        switch (metric) {
            case 'euclidean':
                return Math.sqrt(
                    a1.reduce((sum, v, i) => sum + Math.pow(v - a2[i], 2), 0)
                );

            case 'manhattan':
                return a1.reduce((sum, v, i) => sum + Math.abs(v - a2[i]), 0);

            case 'chebyshev':
                return Math.max(...a1.map((v, i) => Math.abs(v - a2[i])));

            case 'weighted':
                // Weight by importance (could be customized)
                const weights = [0.3, 0.3, 0.2, 0.2];
                return Math.sqrt(
                    a1.reduce((sum, v, i) =>
                        sum + weights[i] * Math.pow(v - a2[i], 2), 0
                    )
                );

            default:
                return this.computeDistance(v1, v2, 'euclidean');
        }
    },

    /**
     * 🧠 Function: interpolate
     * Role: Linearly interpolate between two vectors
     * Inputs: Two vectors and interpolation factor [0,1]
     * Returns: Interpolated ComplexityVector
     * Notes: Useful for animations
     */
    interpolate(v1, v2, t) {
        if (t < 0 || t > 1) {
            throw new Error('Interpolation factor must be in [0,1]');
        }

        const a1 = v1.toArray();
        const a2 = v2.toArray();

        const interpolated = a1.map((v, i) => v * (1 - t) + a2[i] * t);

        return new ComplexityVector(...interpolated);
    },

    /**
     * 🧠 Function: generateRandomStates
     * Role: Generate random states for testing/demos
     * Inputs: Number of states and constraints
     * Returns: Array of ComplexityVectors
     * Notes: Useful for Pareto frontier visualization
     */
    generateRandomStates(count, constraints = {}) {
        const states = [];

        for (let i = 0; i < count; i++) {
            let values;

            if (constraints.balanced) {
                // Generate balanced states
                const base = 0.3 + Math.random() * 0.4;
                const variance = 0.2;
                values = [
                    base + (Math.random() - 0.5) * variance,
                    base + (Math.random() - 0.5) * variance,
                    base + (Math.random() - 0.5) * variance,
                    base + (Math.random() - 0.5) * variance
                ].map(v => Math.max(0, Math.min(1, v)));
            } else if (constraints.pareto) {
                // Generate likely Pareto-optimal states
                const weights = Math.random();
                values = [
                    Math.random() * (1 - weights),
                    Math.random() * (1 - weights),
                    weights * Math.random(),
                    1 - weights
                ];
            } else {
                // Fully random
                values = [
                    Math.random(),
                    Math.random(),
                    Math.random(),
                    Math.random()
                ];
            }

            states.push(new ComplexityVector(...values));
        }

        return states;
    }
};

// Export helper functions for convenience
export function createVector(alg, info, dyn, geom) {
    return new ComplexityVector(alg, info, dyn, geom);
}

export function calculateScalar(vector, weights) {
    return ComplexityMath.computeScalarAverage(vector, weights);
}