import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ProfileMenu } from './ProfileMenu';
import { useAuth } from '../../features/auth/AuthContext';
import { useFontSize } from '../../lib/fontSize';

vi.mock('../../features/auth/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../lib/fontSize', () => ({
  useFontSize: vi.fn(),
}));

vi.mock('./ChangePasswordModal', () => ({
  ChangePasswordModal: () => <div data-testid="change-password-modal" />
}));

describe('ProfileMenu Component', () => {
  const mockLogout = vi.fn();
  const mockIncrease = vi.fn();
  const mockDecrease = vi.fn();
  const mockReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      user: { name: 'Test User', email: 'test@example.com' },
      role: 'owner',
      logout: mockLogout,
    });
    (useFontSize as any).mockReturnValue({
      fontSize: 'md',
      increaseFontSize: mockIncrease,
      decreaseFontSize: mockDecrease,
      resetFontSize: mockReset,
    });
  });

  it('renders profile button with initials', () => {
    render(<ProfileMenu />);
    expect(screen.getByText('TU')).toBeDefined(); // Initials of "Test User"
    expect(screen.getByText('Test User')).toBeDefined();
  });

  it('opens menu when clicked', () => {
    render(<ProfileMenu />);
    const btn = screen.getByLabelText('User Profile Menu');
    fireEvent.click(btn);
    
    expect(screen.getByText('test@example.com')).toBeDefined();
    expect(screen.getByText('Font Size')).toBeDefined();
  });

  it('handles font size controls', () => {
    render(<ProfileMenu />);
    fireEvent.click(screen.getByLabelText('User Profile Menu'));
    
    fireEvent.click(screen.getByTitle('Decrease font size (A-)'));
    expect(mockDecrease).toHaveBeenCalled();
    
    fireEvent.click(screen.getByTitle('Increase font size (A+)'));
    expect(mockIncrease).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Reset to Original Font Size'));
    expect(mockReset).toHaveBeenCalled();
  });

  it('handles logout', () => {
    render(<ProfileMenu />);
    fireEvent.click(screen.getByLabelText('User Profile Menu'));
    
    fireEvent.click(screen.getByText('Log Out'));
    expect(mockLogout).toHaveBeenCalled();
  });

  it('handles change password modal toggle', () => {
    render(<ProfileMenu />);
    expect(screen.getByTestId('change-password-modal')).toBeDefined();
    
    fireEvent.click(screen.getByLabelText('User Profile Menu'));
    fireEvent.click(screen.getByText('Change Password'));
    
    // ChangePasswordModal should be shown, menu closed
    expect(screen.queryByText('Font Size')).toBeNull(); // Menu closed
  });

  it('closes menu when clicking outside', () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <ProfileMenu />
      </div>
    );
    
    const btn = screen.getByLabelText('User Profile Menu');
    fireEvent.click(btn);
    expect(screen.getByText('test@example.com')).toBeDefined();
    
    // Click outside
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByText('test@example.com')).toBeNull();
  });

  it('uses fallbacks when user data is missing for super_admin', () => {
    (useAuth as any).mockReturnValue({
      user: null,
      role: 'super_admin',
      logout: mockLogout,
    });
    render(<ProfileMenu />);
    
    expect(screen.getByText('Fleet User')).toBeDefined();
    
    fireEvent.click(screen.getByLabelText('User Profile Menu'));
    expect(screen.getByText('admin@platform')).toBeDefined();
  });

  it('uses fallbacks when user data is missing for owner', () => {
    (useAuth as any).mockReturnValue({
      user: { phone: '1234567890' },
      role: 'owner',
      logout: mockLogout,
    });
    render(<ProfileMenu />);
    
    expect(screen.getAllByText('1234567890')[0]).toBeDefined();
    
    fireEvent.click(screen.getByLabelText('User Profile Menu'));
    expect(screen.getAllByText('1234567890').length).toBeGreaterThan(0);
  });
});
