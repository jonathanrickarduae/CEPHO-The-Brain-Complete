import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, ThemeToggle, useTheme } from '../ThemeToggle';
import { ReactNode } from 'react';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: query === '(prefers-color-scheme: dark)',
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('light', 'dark');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing when context is available', () => {
    const TestComponent = () => (
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const { container } = render(<TestComponent />);
    expect(container.querySelector('button')).toBeInTheDocument();
  });

  it('renders fallback button when context is not available', () => {
    const { container } = render(<ThemeToggle />);
    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
    expect(button?.title).toBe('Theme toggle');
  });

  it('cycles through themes on button click', async () => {
    const TestComponent = () => {
      const { theme } = useTheme();
      return (
        <div>
          <ThemeToggle />
          <div data-testid="theme-display">{theme}</div>
        </div>
      );
    };

    const { rerender } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const button = screen.getByRole('button');
    
    // Initial theme should be 'dark'
    expect(screen.getByTestId('theme-display')).toHaveTextContent('dark');

    // Click to cycle to 'system'
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByTestId('theme-display')).toHaveTextContent('system');
    });

    // Click to cycle to 'light'
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByTestId('theme-display')).toHaveTextContent('light');
    });

    // Click to cycle back to 'dark'
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByTestId('theme-display')).toHaveTextContent('dark');
    });
  });

  it('persists theme preference to localStorage', async () => {
    const TestComponent = () => {
      const { setTheme } = useTheme();
      return (
        <button onClick={() => setTheme('light')}>Set Light</button>
      );
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const button = screen.getByText('Set Light');
    fireEvent.click(button);

    await waitFor(() => {
      expect(localStorage.getItem('brain_theme')).toBe('light');
    });
  });

  it('loads saved theme from localStorage on mount', () => {
    localStorage.setItem('brain_theme', 'light');

    const TestComponent = () => {
      const { theme } = useTheme();
      return <div data-testid="theme-display">{theme}</div>;
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-display')).toHaveTextContent('light');
  });

  it('applies theme class to document element', async () => {
    const TestComponent = () => {
      const { setTheme } = useTheme();
      return (
        <button onClick={() => setTheme('light')}>Set Light</button>
      );
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const button = screen.getByText('Set Light');
    fireEvent.click(button);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  it('respects system preference when theme is set to system', async () => {
    const TestComponent = () => {
      const { setTheme, resolvedTheme } = useTheme();
      return (
        <div>
          <button onClick={() => setTheme('system')}>Set System</button>
          <div data-testid="resolved-theme">{resolvedTheme}</div>
        </div>
      );
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const button = screen.getByText('Set System');
    fireEvent.click(button);

    await waitFor(() => {
      // Should resolve to 'dark' based on our mock
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
    });
  });

  it('updates CSS variables when theme changes', async () => {
    const TestComponent = () => {
      const { setTheme } = useTheme();
      return (
        <button onClick={() => setTheme('light')}>Set Light</button>
      );
    };

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const button = screen.getByText('Set Light');
    fireEvent.click(button);

    await waitFor(() => {
      const bgColor = document.documentElement.style.getPropertyValue('--background');
      expect(bgColor).toBe('0 0% 100%'); // Light mode background
    });
  });
});
