import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { FleetRevenueChart } from './FleetRevenueChart';

describe('FleetRevenueChart Component', () => {
  it('renders the chart header and labels', () => {
    render(<FleetRevenueChart />);
    expect(screen.getByText('Weekly Revenue & Job Volume')).toBeDefined();
    expect(screen.getByText('Total gross earnings across tractors, JCBs, and buses')).toBeDefined();
    expect(screen.getByText('Revenue (₹)')).toBeDefined();
    expect(screen.getByText('Completed Jobs')).toBeDefined();
  });
});
