// Local storage keys
const SPINNER_STATE_KEY = 'todo-ai-spinner-state';

/**
 * Saves spinner state to localStorage
 * Used to persist the loading state for AI-generated todos
 * even when the page is refreshed
 */
export const saveSpinnerState = (isGenerating: boolean): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SPINNER_STATE_KEY, isGenerating ? 'true' : 'false');
    } catch (error) {
      console.error('Error saving spinner state to localStorage:', error);
    }
  }
};

/**
 * Loads spinner state from localStorage
 * If no state is found, returns false (not generating)
 */
export const loadSpinnerState = (): boolean => {
  if (typeof window !== 'undefined') {
    try {
      const state = localStorage.getItem(SPINNER_STATE_KEY);
      return state === 'true';
    } catch (error) {
      console.error('Error loading spinner state from localStorage:', error);
      return false;
    }
  }
  return false;
};

/**
 * Clears spinner state from localStorage
 * Called when todo generation is complete or fails
 */
export const clearSpinnerState = (): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(SPINNER_STATE_KEY);
    } catch (error) {
      console.error('Error clearing spinner state from localStorage:', error);
    }
  }
};

/**
 * Type definitions for todo data that might be stored
 * locally for offline support in the future
 */
export interface TodoDataCache {
  id: number;
  title: string;
  status: 'PENDING' | 'COMPLETED';
  timestamp: number; // For sync conflict resolution
}

/**
 * Interface for working with todo persistence
 * Can be extended in the future for offline support
 */
export interface TodoPersistence {
  saveSpinnerState: (isGenerating: boolean) => void;
  loadSpinnerState: () => boolean;
  clearSpinnerState: () => void;
}

// Export default implementation
export const todoPersistence: TodoPersistence = {
  saveSpinnerState,
  loadSpinnerState,
  clearSpinnerState,
};