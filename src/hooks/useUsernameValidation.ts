/**
 * useUsernameValidation Hook
 * ==========================
 * Custom hook for username validation with debounced availability checking.
 *
 * Features:
 * - Real-time format validation
 * - Debounced availability check (300ms)
 * - Status tracking (idle, checking, available, taken, error)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  validateUsername,
  isReservedWord,
  checkUsernameAvailability,
  type ValidationResult,
  type UsernameAvailabilityResult,
} from '@/lib/api';

export type ValidationStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error';

export interface UsernameValidationState {
  status: ValidationStatus;
  isValid: boolean;
  isChecking: boolean;
  error?: string;
  formatValidation: ValidationResult;
}

export interface UseUsernameValidationOptions {
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number;
  /** Array of already taken usernames for availability check */
  takenUsernames?: string[];
  /** Callback when validation state changes */
  onValidationChange?: (state: { isValid: boolean; isChecking: boolean; error?: string }) => void;
}

export interface UseUsernameValidationReturn {
  /** Current username value */
  username: string;
  /** Set username (handles validation internally) */
  setUsername: (value: string) => void;
  /** Current validation state */
  state: UsernameValidationState;
  /** Reset to initial state */
  reset: () => void;
}

const INITIAL_STATE: UsernameValidationState = {
  status: 'idle',
  isValid: false,
  isChecking: false,
  error: undefined,
  formatValidation: { valid: false },
};

export function useUsernameValidation(
  options: UseUsernameValidationOptions = {}
): UseUsernameValidationReturn {
  const { debounceMs = 300, takenUsernames = [], onValidationChange } = options;

  const [username, setUsernameState] = useState('');
  const [state, setState] = useState<UsernameValidationState>(INITIAL_STATE);

  // Refs for cleanup
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Stable callback ref
  const onValidationChangeRef = useRef(onValidationChange);
  onValidationChangeRef.current = onValidationChange;

  // Notify parent of validation changes
  const notifyChange = useCallback((newState: UsernameValidationState) => {
    onValidationChangeRef.current?.({
      isValid: newState.isValid,
      isChecking: newState.isChecking,
      error: newState.error,
    });
  }, []);

  // Handle username change with validation
  const setUsername = useCallback(
    (value: string) => {
      setUsernameState(value);

      // Clear previous debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }

      // Empty input - reset to idle
      if (!value) {
        const newState = { ...INITIAL_STATE };
        setState(newState);
        notifyChange(newState);
        return;
      }

      // Immediate format validation
      const formatValidation = validateUsername(value);

      if (!formatValidation.valid) {
        const newState: UsernameValidationState = {
          status: 'error',
          isValid: false,
          isChecking: false,
          error: formatValidation.error,
          formatValidation,
        };
        setState(newState);
        notifyChange(newState);
        return;
      }

      // Format is valid - set checking state and schedule availability check
      const checkingState: UsernameValidationState = {
        status: 'checking',
        isValid: false,
        isChecking: true,
        error: undefined,
        formatValidation,
      };
      setState(checkingState);
      // Don't notify yet - wait for debounce

      // Debounce availability check
      debounceTimerRef.current = setTimeout(async () => {
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
          const result = await checkUsernameAvailability(value, takenUsernames);

          // Check if aborted
          if (controller.signal.aborted) {
            return;
          }

          const newState: UsernameValidationState = {
            status: result.available ? 'available' : 'taken',
            isValid: result.available,
            isChecking: false,
            error: result.reason,
            formatValidation,
          };

          setState(newState);
          notifyChange(newState);
        } catch (err) {
          // Check if aborted
          if (controller.signal.aborted) {
            return;
          }

          const errorState: UsernameValidationState = {
            status: 'error',
            isValid: false,
            isChecking: false,
            error: 'Failed to check availability. Please try again.',
            formatValidation,
          };
          setState(errorState);
          notifyChange(errorState);
        }
      }, debounceMs);
    },
    [debounceMs, takenUsernames, notifyChange]
  );

  // Reset to initial state
  const reset = useCallback(() => {
    // Clear timers and abort
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setUsernameState('');
    setState(INITIAL_STATE);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    username,
    setUsername,
    state,
    reset,
  };
}

export default useUsernameValidation;
