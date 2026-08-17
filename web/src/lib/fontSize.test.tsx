import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { FontSizeProvider, useFontSize } from './fontSize';

const TestComponent = () => {
  const { fontSize, increaseFontSize, decreaseFontSize, resetFontSize } = useFontSize();
  return (
    <div>
      <span data-testid="size">{fontSize}</span>
      <button onClick={increaseFontSize}>Inc</button>
      <button onClick={decreaseFontSize}>Dec</button>
      <button onClick={resetFontSize}>Reset</button>
    </div>
  );
};

const NoProviderComponent = () => {
  useFontSize();
  return <div />;
};

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

describe('FontSizeContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = '';
  });

  it('provides default font size and updates document class', () => {
    render(<FontSizeProvider><TestComponent /></FontSizeProvider>);
    expect(screen.getByTestId('size').textContent).toBe('md');
    expect(document.documentElement.classList.contains('font-md')).toBe(true);
  });

  it('loads saved font size from localStorage', () => {
    window.localStorage.setItem('fm_font_size', 'lg');
    render(<FontSizeProvider><TestComponent /></FontSizeProvider>);
    expect(screen.getByTestId('size').textContent).toBe('lg');
    expect(document.documentElement.classList.contains('font-lg')).toBe(true);
  });

  it('increases font size', () => {
    render(<FontSizeProvider><TestComponent /></FontSizeProvider>);
    fireEvent.click(screen.getByText('Inc'));
    expect(screen.getByTestId('size').textContent).toBe('lg');
    expect(document.documentElement.classList.contains('font-lg')).toBe(true);
    // Max check
    fireEvent.click(screen.getByText('Inc'));
    expect(screen.getByTestId('size').textContent).toBe('xl');
    fireEvent.click(screen.getByText('Inc'));
    expect(screen.getByTestId('size').textContent).toBe('xl');
  });

  it('decreases font size', () => {
    render(<FontSizeProvider><TestComponent /></FontSizeProvider>);
    fireEvent.click(screen.getByText('Dec'));
    expect(screen.getByTestId('size').textContent).toBe('sm');
    
    // Min check
    fireEvent.click(screen.getByText('Dec'));
    expect(screen.getByTestId('size').textContent).toBe('sm');
  });

  it('resets font size', () => {
    window.localStorage.setItem('fm_font_size', 'xl');
    render(<FontSizeProvider><TestComponent /></FontSizeProvider>);
    fireEvent.click(screen.getByText('Reset'));
    expect(screen.getByTestId('size').textContent).toBe('md');
  });

  it('throws error when used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<NoProviderComponent />)).toThrow('useFontSize must be used within a FontSizeProvider');
    consoleError.mockRestore();
  });
});
