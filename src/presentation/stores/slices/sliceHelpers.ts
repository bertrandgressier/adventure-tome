/**
 * Slice Helpers - Utilities for Zustand slices
 * 
 * Centralizes common patterns used across multiple slices
 * to reduce code duplication and improve maintainability.
 */

/**
 * Handles errors in slice actions by setting the error state
 * 
 * @param set - Zustand's setState function
 * @param error - The error to handle
 * 
 * @example
 * try {
 *   await service.doSomething();
 * } catch (error) {
 *   handleSliceError(set, error);
 *   throw error;
 * }
 */
export function handleSliceError(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set: (partial: any) => void,
  error: unknown
): void {
  const errorMessage = error instanceof Error ? error.message : 'Erreur de mise à jour';
  set({ error: errorMessage });
}
