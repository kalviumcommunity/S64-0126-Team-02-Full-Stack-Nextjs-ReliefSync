/**
 * Testing Utilities for Loading and Error States
 *
 * This module provides utilities to simulate network delays and errors
 * for testing loading skeletons and error boundaries in development.
 *
 * Usage:
 * - simulateDelay(ms): Simulate network delay
 * - simulateRandomError(probability): Randomly throw errors
 * - toggleSimulation(): Enable/disable simulation globally
 */

// Configuration
const SIMULATION_CONFIG = {
  enabled: process.env.NODE_ENV === "development",
  defaultDelay: 2000, // 2 seconds
  errorProbability: 0, // 0% by default (set to 0.3 for 30% error rate)
};

/**
 * Simulate a network delay
 * Useful for testing loading states
 *
 * @param ms - Delay in milliseconds (default: 2000ms)
 * @returns Promise that resolves after delay
 *
 * @example
 * await simulateDelay(3000); // Wait 3 seconds
 */
export async function simulateDelay(
  ms: number = SIMULATION_CONFIG.defaultDelay
): Promise<void> {
  if (!SIMULATION_CONFIG.enabled) return;

  console.log(`🔄 [Simulation] Delaying for ${ms}ms...`);
  await new Promise((resolve) => setTimeout(resolve, ms));
  console.log(`✅ [Simulation] Delay complete`);
}

/**
 * Randomly throw an error based on probability
 * Useful for testing error boundaries
 *
 * @param probability - Chance of error (0-1, default from config)
 * @param errorMessage - Custom error message
 * @throws Error if random check fails
 *
 * @example
 * simulateRandomError(0.3, 'Network timeout'); // 30% chance
 */
export function simulateRandomError(
  probability: number = SIMULATION_CONFIG.errorProbability,
  errorMessage: string = "Simulated error for testing"
): void {
  if (!SIMULATION_CONFIG.enabled) return;
  if (probability <= 0) return;

  const shouldError = Math.random() < probability;

  if (shouldError) {
    console.error(`❌ [Simulation] Throwing error: ${errorMessage}`);
    throw new Error(errorMessage);
  }
}

/**
 * Simulate a specific error condition
 * Always throws an error when called
 *
 * @param errorMessage - Error message to throw
 * @throws Error with the specified message
 *
 * @example
 * simulateError('Database connection failed');
 */
export function simulateError(errorMessage: string = "Simulated error"): never {
  console.error(`❌ [Simulation] Forcing error: ${errorMessage}`);
  throw new Error(errorMessage);
}

/**
 * Simulate both delay and potential error
 * Combines delay + random error for realistic testing
 *
 * @param delayMs - Delay in milliseconds
 * @param errorProbability - Chance of error (0-1)
 * @param errorMessage - Error message if thrown
 *
 * @example
 * await simulateDelayAndError(2000, 0.2, 'API timeout');
 */
export async function simulateDelayAndError(
  delayMs: number = SIMULATION_CONFIG.defaultDelay,
  errorProbability: number = SIMULATION_CONFIG.errorProbability,
  errorMessage: string = "Network request failed"
): Promise<void> {
  await simulateDelay(delayMs);
  simulateRandomError(errorProbability, errorMessage);
}

/**
 * Enable or disable simulation features
 * Useful for toggling during development
 *
 * @param enabled - Whether to enable simulation
 */
export function toggleSimulation(enabled: boolean): void {
  SIMULATION_CONFIG.enabled = enabled;
  console.log(`🎛️ [Simulation] ${enabled ? "Enabled" : "Disabled"}`);
}

/**
 * Get current simulation configuration
 */
export function getSimulationConfig() {
  return { ...SIMULATION_CONFIG };
}

/**
 * Update simulation configuration
 *
 * @param config - Partial config to update
 *
 * @example
 * updateSimulationConfig({ defaultDelay: 3000, errorProbability: 0.1 });
 */
export function updateSimulationConfig(
  config: Partial<typeof SIMULATION_CONFIG>
): void {
  Object.assign(SIMULATION_CONFIG, config);
  console.log("🔧 [Simulation] Config updated:", SIMULATION_CONFIG);
}

// Export configuration for external use
export { SIMULATION_CONFIG };

// Development-only features
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  // Make utilities available in browser console for testing
  (window as Record<string, unknown>).__devTools = {
    simulateDelay,
    simulateError,
    simulateRandomError,
    toggleSimulation,
    getSimulationConfig,
    updateSimulationConfig,
  };

  console.log(`
🎨 Development Tools Available!
--------------------------------
Use these in the browser console:

__devTools.simulateDelay(3000)     - Delay 3 seconds
__devTools.simulateError('Oops!')  - Force an error
__devTools.toggleSimulation(false) - Disable simulation
__devTools.getSimulationConfig()   - View current config
  `);
}
