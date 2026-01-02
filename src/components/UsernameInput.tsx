/**
 * UsernameInput Component
 * =======================
 * Input field for username registration with real-time validation
 * and availability checking.
 *
 * Features:
 * - Real-time format validation
 * - Debounced availability check (300ms)
 * - Visual feedback (available/taken/checking)
 * - Error messages from validation
 * - Accessible with aria-* attributes
 *
 * Part of RES-517: Username registration flow
 */

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useUsernameValidation, type ValidationStatus } from '@/hooks/useUsernameValidation';
import { Check, X, Loader2 } from 'lucide-react';

export interface UsernameInputProps {
  /** Input label text */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Additional class names for the container */
  className?: string;
  /** Controlled value */
  value?: string;
  /** Change handler (receives username string) */
  onChange?: (username: string) => void;
  /** Validation state change handler */
  onValidationChange?: (state: { isValid: boolean; isChecking: boolean; error?: string }) => void;
  /** Array of taken usernames for availability check */
  takenUsernames?: string[];
  /** Input disabled state */
  disabled?: boolean;
  /** Input id (auto-generated if not provided) */
  id?: string;
}

const STATUS_ICONS: Record<ValidationStatus, React.ReactNode> = {
  idle: null,
  checking: <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" data-testid="status-checking" />,
  available: <Check className="h-4 w-4 text-green-500" data-testid="status-available" />,
  taken: <X className="h-4 w-4 text-destructive" data-testid="status-taken" />,
  error: <X className="h-4 w-4 text-destructive" data-testid="status-error" />,
};

const STATUS_BORDER_CLASSES: Record<ValidationStatus, string> = {
  idle: '',
  checking: 'border-muted-foreground',
  available: 'border-green-500 focus-visible:ring-green-500',
  taken: 'border-destructive focus-visible:ring-destructive',
  error: 'border-destructive focus-visible:ring-destructive',
};

export function UsernameInput({
  label,
  placeholder = 'Enter username',
  className,
  value: controlledValue,
  onChange,
  onValidationChange,
  takenUsernames = [],
  disabled = false,
  id: providedId,
}: UsernameInputProps) {
  // Generate stable ID for accessibility
  const generatedId = React.useId();
  const inputId = providedId ?? `username-input-${generatedId}`;
  const errorId = `${inputId}-error`;

  // Use the validation hook
  const { username, setUsername, state } = useUsernameValidation({
    takenUsernames,
    onValidationChange,
  });

  // Handle controlled vs uncontrolled
  const displayValue = controlledValue !== undefined ? controlledValue : username;

  // Sync controlled value with internal state
  React.useEffect(() => {
    if (controlledValue !== undefined && controlledValue !== username) {
      setUsername(controlledValue);
    }
  }, [controlledValue, username, setUsername]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setUsername(newValue);
    onChange?.(newValue);
  };

  // Determine if we should show error message
  const showError = state.error && state.status !== 'checking';
  const hasValue = displayValue.length > 0;
  const showStatusIcon = hasValue && state.status !== 'idle';

  return (
    <div className={cn('space-y-2', className)} data-testid="username-input-container">
      {label && (
        <Label htmlFor={inputId} className="text-sm font-medium">
          {label}
        </Label>
      )}

      <div className="relative">
        <Input
          id={inputId}
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={showError ? 'true' : 'false'}
          aria-describedby={showError ? errorId : undefined}
          className={cn(
            'pr-10',
            STATUS_BORDER_CLASSES[state.status]
          )}
        />

        {/* Status icon */}
        {showStatusIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {STATUS_ICONS[state.status]}
          </div>
        )}
      </div>

      {/* Error message */}
      {showError && (
        <p
          id={errorId}
          className="text-sm text-destructive"
          role="alert"
        >
          {state.error}
        </p>
      )}

      {/* Success message */}
      {state.status === 'available' && (
        <p className="text-sm text-green-600">
          Username is available!
        </p>
      )}
    </div>
  );
}

export default UsernameInput;
