/**
 * DailyDock — UUID Generation Utility
 */

/** Generate a unique ID for entities */
export function generateId(): string {
  // Use a combination of timestamp and Math.random() to generate a unique ID
  // This avoids relying on the Node.js `crypto` module which is missing in React Native by default
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}
