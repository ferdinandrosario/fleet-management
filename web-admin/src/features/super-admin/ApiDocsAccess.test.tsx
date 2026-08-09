import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { ApiDocsAccess } from './ApiDocsAccess';
import { apiRequest } from '../../lib/api';
import { toast } from 'sonner';

vi.mock('../../lib/api', () => ({
  apiRequest: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('ApiDocsAccess Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders and fetches grants successfully', async () => {
    (apiRequest as any).mockResolvedValue({
      status: 'success',
      data: [
        { id: 1, email: 'dev@test.com', token: 'token_123', expires_at: new Date(Date.now() + 100000).toISOString() }
      ]
    });

    render(<ApiDocsAccess />);

    expect(screen.getByText('Loading grants…')).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('dev@test.com')).toBeDefined();
      expect(screen.getByText('token_123')).toBeDefined();
    });
  });

  it('handles empty grants', async () => {
    (apiRequest as any).mockResolvedValue({
      status: 'success',
      data: []
    });

    render(<ApiDocsAccess />);

    await waitFor(() => {
      expect(screen.getByText('No active grants.')).toBeDefined();
    });
  });

  it('creates a new grant', async () => {
    (apiRequest as any).mockResolvedValueOnce({
      status: 'success',
      data: []
    }).mockResolvedValueOnce({
      status: 'success'
    }).mockResolvedValueOnce({
      status: 'success',
      data: [
        { id: 2, email: 'new@test.com', token: 'token_456', expires_at: new Date(Date.now() + 100000).toISOString() }
      ]
    });

    render(<ApiDocsAccess />);

    const emailInput = screen.getByPlaceholderText('Developer Email');
    fireEvent.change(emailInput, { target: { value: 'new@test.com' } });
    
    const submitBtn = screen.getByText('Grant Access');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('/api/v1/super_admin/api_doc_grants', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'new@test.com', expires_in_hours: 24 })
      }));
      expect(screen.getByText('new@test.com')).toBeDefined();
    });
  });

  it('shows error toast on create grant failure', async () => {
    (apiRequest as any).mockResolvedValueOnce({
      status: 'success',
      data: []
    }).mockResolvedValueOnce({
      status: 'error',
      error: { message: 'Failed to create' }
    });

    render(<ApiDocsAccess />);

    const emailInput = screen.getByPlaceholderText('Developer Email');
    fireEvent.change(emailInput, { target: { value: 'fail@test.com' } });
    fireEvent.click(screen.getByText('Grant Access'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to create');
    });
  });

  it('revokes a grant', async () => {
    (apiRequest as any).mockResolvedValueOnce({
      status: 'success',
      data: [
        { id: 1, email: 'dev@test.com', token: 'token_123', expires_at: new Date(Date.now() + 100000).toISOString() }
      ]
    }).mockResolvedValueOnce({
      status: 'success'
    }).mockResolvedValueOnce({
      status: 'success',
      data: []
    });

    window.confirm = vi.fn().mockReturnValue(true);

    render(<ApiDocsAccess />);

    await waitFor(() => {
      expect(screen.getByText('dev@test.com')).toBeDefined();
    });

    const revokeBtn = screen.getByLabelText('Revoke grant');
    fireEvent.click(revokeBtn);

    await waitFor(() => {
      expect(apiRequest).toHaveBeenCalledWith('/api/v1/super_admin/api_doc_grants/1', { method: 'DELETE' });
      expect(screen.getByText('No active grants.')).toBeDefined();
    });
  });

  it('copies token to clipboard', async () => {
    (apiRequest as any).mockResolvedValue({
      status: 'success',
      data: [
        { id: 1, email: 'dev@test.com', token: 'token_123', expires_at: new Date(Date.now() + 100000).toISOString() }
      ]
    });

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });

    render(<ApiDocsAccess />);

    await waitFor(() => {
      expect(screen.getByText('dev@test.com')).toBeDefined();
    });

    const copyBtn = screen.getByLabelText('Copy token');
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('token_123');
  });

  it('shows expired badge for expired grants', async () => {
    (apiRequest as any).mockResolvedValue({
      status: 'success',
      data: [
        { id: 1, email: 'expired@test.com', token: 'token_exp', expires_at: new Date(Date.now() - 100000).toISOString() }
      ]
    });

    render(<ApiDocsAccess />);

    await waitFor(() => {
      expect(screen.getByText('Expired')).toBeDefined();
    });
  });

});
