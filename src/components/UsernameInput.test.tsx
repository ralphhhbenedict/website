/**
 * TDD: UsernameInput Component Tests
 * ===================================
 * Requirements (RES-517):
 * 1. Input field with real-time validation
 * 2. Debounced availability check (300ms)
 * 3. Visual feedback (available/taken/checking)
 * 4. Error messages from validation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import UsernameInput from './UsernameInput';

// Mock the API functions
vi.mock('@/lib/api', () => ({
  validateUsername: vi.fn((username: string) => {
    if (username.length < 3) {
      return { valid: false, error: 'Username must be at least 3 characters long' };
    }
    if (username.length > 30) {
      return { valid: false, error: 'Username must be at most 30 characters long' };
    }
    if (!/^[a-zA-Z]/.test(username)) {
      return { valid: false, error: 'Username must start with a letter' };
    }
    if (!/^[a-zA-Z][a-zA-Z0-9_]{2,29}$/.test(username)) {
      return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
    }
    if (/__/.test(username)) {
      return { valid: false, error: 'Username cannot have consecutive underscores' };
    }
    return { valid: true };
  }),
  isReservedWord: vi.fn((word: string) => {
    const reserved = ['admin', 'api', 'profile', 'settings', 'login', 'signup'];
    return reserved.includes(word.toLowerCase());
  }),
  checkUsernameAvailability: vi.fn(async (username: string, takenUsernames: string[]) => {
    const normalizedUsername = username.toLowerCase();

    // Check reserved
    const reserved = ['admin', 'api', 'profile', 'settings', 'login', 'signup'];
    if (reserved.includes(normalizedUsername)) {
      return { available: false, reason: `"${username}" is a reserved word` };
    }

    // Check taken
    if (takenUsernames.some((t) => t.toLowerCase() === normalizedUsername)) {
      return { available: false, reason: `Username "${username}" is already taken` };
    }

    return { available: true };
  }),
}));

describe('UsernameInput Component (TDD)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders an input field', () => {
      render(<UsernameInput />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders with a label', () => {
      render(<UsernameInput label="Username" />);
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
    });

    it('renders with placeholder text', () => {
      render(<UsernameInput placeholder="Enter username" />);
      expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(<UsernameInput className="custom-class" />);
      const container = screen.getByTestId('username-input-container');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('Real-time Format Validation', () => {
    it('shows error for usernames shorter than 3 characters', async () => {
      render(<UsernameInput />);
      const input = screen.getByRole('textbox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'ab' } });
      });

      expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument();
    });

    it('shows error for usernames starting with underscore', async () => {
      render(<UsernameInput />);
      const input = screen.getByRole('textbox');

      await act(async () => {
        fireEvent.change(input, { target: { value: '_john' } });
      });

      expect(screen.getByText(/must start with a letter/i)).toBeInTheDocument();
    });

    it('shows error for usernames starting with number', async () => {
      render(<UsernameInput />);
      const input = screen.getByRole('textbox');

      await act(async () => {
        fireEvent.change(input, { target: { value: '123john' } });
      });

      expect(screen.getByText(/must start with a letter/i)).toBeInTheDocument();
    });

    it('shows error for usernames with special characters', async () => {
      render(<UsernameInput />);
      const input = screen.getByRole('textbox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'john@doe' } });
      });

      expect(screen.getByText(/only contain letters, numbers, and underscores/i)).toBeInTheDocument();
    });

    it('clears error for valid format', async () => {
      render(<UsernameInput />);
      const input = screen.getByRole('textbox');

      // First enter invalid
      await act(async () => {
        fireEvent.change(input, { target: { value: 'ab' } });
      });
      expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument();

      // Then enter valid and advance timers
      await act(async () => {
        fireEvent.change(input, { target: { value: 'johndoe' } });
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(350);
      });

      expect(screen.queryByText(/at least 3 characters/i)).not.toBeInTheDocument();
    });
  });

  describe('Debounced Availability Check', () => {
    it('does not check availability immediately on input', async () => {
      const { checkUsernameAvailability } = await import('@/lib/api');

      render(<UsernameInput takenUsernames={['johndoe']} />);
      const input = screen.getByRole('textbox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'newuser' } });
      });

      // Immediately after typing, availability check should NOT have been called
      expect(checkUsernameAvailability).not.toHaveBeenCalled();
    });

    it('checks availability after 300ms debounce', async () => {
      const { checkUsernameAvailability } = await import('@/lib/api');

      render(<UsernameInput takenUsernames={['johndoe']} />);
      const input = screen.getByRole('textbox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'newuser' } });
      });

      // Fast-forward 300ms
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      expect(checkUsernameAvailability).toHaveBeenCalledWith('newuser', ['johndoe']);
    });

    it('cancels previous check when user types quickly', async () => {
      const { checkUsernameAvailability } = await import('@/lib/api');

      render(<UsernameInput takenUsernames={[]} />);
      const input = screen.getByRole('textbox');

      // Type first value
      await act(async () => {
        fireEvent.change(input, { target: { value: 'abc' } });
      });

      // Wait 200ms (not enough for debounce)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(200);
      });

      // Type second value before debounce completes
      await act(async () => {
        fireEvent.change(input, { target: { value: 'abcd' } });
      });

      // Wait full debounce time
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      // Only the final value should have been checked
      expect(checkUsernameAvailability).toHaveBeenCalledTimes(1);
      expect(checkUsernameAvailability).toHaveBeenCalledWith('abcd', []);
    });
  });

  describe('Visual Feedback States', () => {
    it('shows "checking" state during availability check', async () => {
      render(<UsernameInput takenUsernames={[]} />);
      const input = screen.getByRole('textbox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'newuser' } });
      });

      // The checking state appears immediately after valid input (before debounce fires)
      expect(screen.getByTestId('status-checking')).toBeInTheDocument();
    });

    it('shows "available" state when username is available', async () => {
      render(<UsernameInput takenUsernames={[]} />);
      const input = screen.getByRole('textbox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'newuser' } });
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(350);
      });

      expect(screen.getByTestId('status-available')).toBeInTheDocument();
    });

    it('shows "taken" state when username is taken', async () => {
      render(<UsernameInput takenUsernames={['johndoe']} />);
      const input = screen.getByRole('textbox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'johndoe' } });
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(350);
      });

      expect(screen.getByTestId('status-taken')).toBeInTheDocument();
    });

    it('shows error state for reserved words', async () => {
      render(<UsernameInput takenUsernames={[]} />);
      const input = screen.getByRole('textbox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'admin' } });
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(350);
      });

      expect(screen.getByText(/reserved word/i)).toBeInTheDocument();
    });

    it('hides status indicator when input is empty', async () => {
      render(<UsernameInput takenUsernames={[]} />);
      const input = screen.getByRole('textbox');

      // Type something
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } });
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(350);
      });

      expect(screen.getByTestId('status-available')).toBeInTheDocument();

      // Clear input
      await act(async () => {
        fireEvent.change(input, { target: { value: '' } });
      });

      expect(screen.queryByTestId('status-available')).not.toBeInTheDocument();
      expect(screen.queryByTestId('status-taken')).not.toBeInTheDocument();
      expect(screen.queryByTestId('status-checking')).not.toBeInTheDocument();
    });
  });

  describe('Callback Props', () => {
    it('calls onChange with username value', async () => {
      const handleChange = vi.fn();
      render(<UsernameInput onChange={handleChange} />);
      const input = screen.getByRole('textbox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'johndoe' } });
      });

      expect(handleChange).toHaveBeenCalledWith('johndoe');
    });

    it('calls onValidationChange with validation result', async () => {
      const handleValidationChange = vi.fn();
      render(<UsernameInput onValidationChange={handleValidationChange} takenUsernames={[]} />);
      const input = screen.getByRole('textbox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'johndoe' } });
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(350);
      });

      expect(handleValidationChange).toHaveBeenCalledWith({
        isValid: true,
        isChecking: false,
        error: undefined,
      });
    });

    it('calls onValidationChange with error when taken', async () => {
      const handleValidationChange = vi.fn();
      render(<UsernameInput onValidationChange={handleValidationChange} takenUsernames={['johndoe']} />);
      const input = screen.getByRole('textbox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'johndoe' } });
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(350);
      });

      expect(handleValidationChange).toHaveBeenCalledWith(
        expect.objectContaining({
          isValid: false,
          isChecking: false,
        })
      );
    });
  });

  describe('Controlled Component', () => {
    it('works as controlled component with value prop', () => {
      render(<UsernameInput value="controlled" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('controlled');
    });

    it('updates when value prop changes', () => {
      const { rerender } = render(<UsernameInput value="initial" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('initial');

      rerender(<UsernameInput value="updated" />);
      expect(input).toHaveValue('updated');
    });
  });

  describe('Accessibility', () => {
    it('associates error message with input via aria-describedby', async () => {
      render(<UsernameInput />);
      const input = screen.getByRole('textbox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'ab' } });
      });

      expect(input).toHaveAttribute('aria-describedby');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-invalid to false when valid', async () => {
      render(<UsernameInput takenUsernames={[]} />);
      const input = screen.getByRole('textbox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'validuser' } });
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(350);
      });

      expect(input).toHaveAttribute('aria-invalid', 'false');
    });
  });

  describe('Integration: Full Registration Flow', () => {
    it('validates format -> checks availability -> shows final state', async () => {
      const handleValidationChange = vi.fn();
      render(
        <UsernameInput
          onValidationChange={handleValidationChange}
          takenUsernames={[]}
        />
      );
      const input = screen.getByRole('textbox');

      // Step 1: Invalid format
      await act(async () => {
        fireEvent.change(input, { target: { value: 'ab' } });
      });
      expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument();

      // Step 2: Valid format, triggers availability check
      await act(async () => {
        fireEvent.change(input, { target: { value: 'newuser' } });
      });

      // Step 3: Wait for debounce + availability check
      await act(async () => {
        await vi.advanceTimersByTimeAsync(350);
      });

      // Step 4: Check final state
      expect(screen.getByTestId('status-available')).toBeInTheDocument();

      // Final validation state
      expect(handleValidationChange).toHaveBeenLastCalledWith({
        isValid: true,
        isChecking: false,
        error: undefined,
      });
    });
  });
});
