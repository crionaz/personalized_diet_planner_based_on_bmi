/**
 * Utility function to concatenate class names conditionally
 * Simple implementation that filters falsy values and joins them
 */
export function cn(...inputs: (string | undefined | null | false | 0 | '')[]): string {
  return inputs.filter(Boolean).join(' ');
}