import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { FontSizeToggle } from './FontSizeToggle';
import { useFontSize } from '../../lib/fontSize';

vi.mock('../../lib/fontSize', () => ({
  useFontSize: vi.fn(),
}));

describe('FontSizeToggle Component', () => {
  const mockIncrease = vi.fn();
  const mockDecrease = vi.fn();
  const mockReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders and calls decrease, reset, increase', () => {
    (useFontSize as any).mockReturnValue({
      fontSize: 'md',
      increaseFontSize: mockIncrease,
      decreaseFontSize: mockDecrease,
      resetFontSize: mockReset,
    });

    render(<FontSizeToggle />);
    
    expect(screen.getByText('Text')).toBeDefined();
    
    fireEvent.click(screen.getByLabelText('Decrease font size'));
    expect(mockDecrease).toHaveBeenCalled();
    
    fireEvent.click(screen.getByLabelText('Increase font size'));
    expect(mockIncrease).toHaveBeenCalled();
    
    fireEvent.click(screen.getByLabelText('Reset to original font size'));
    expect(mockReset).toHaveBeenCalled();
  });

  it('disables decrease button when fontSize is sm', () => {
    (useFontSize as any).mockReturnValue({
      fontSize: 'sm',
      increaseFontSize: mockIncrease,
      decreaseFontSize: mockDecrease,
      resetFontSize: mockReset,
    });

    render(<FontSizeToggle />);
    const decreaseBtn = screen.getByLabelText('Decrease font size') as HTMLButtonElement;
    expect(decreaseBtn.disabled).toBe(true);
    
    const increaseBtn = screen.getByLabelText('Increase font size') as HTMLButtonElement;
    expect(increaseBtn.disabled).toBe(false);
  });

  it('disables increase button when fontSize is xl', () => {
    (useFontSize as any).mockReturnValue({
      fontSize: 'xl',
      increaseFontSize: mockIncrease,
      decreaseFontSize: mockDecrease,
      resetFontSize: mockReset,
    });

    render(<FontSizeToggle />);
    const increaseBtn = screen.getByLabelText('Increase font size') as HTMLButtonElement;
    expect(increaseBtn.disabled).toBe(true);
    
    const decreaseBtn = screen.getByLabelText('Decrease font size') as HTMLButtonElement;
    expect(decreaseBtn.disabled).toBe(false);
  });
});
