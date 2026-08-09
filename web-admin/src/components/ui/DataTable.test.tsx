import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { DataTable } from './DataTable';

describe('DataTable Component', () => {
  const mockData = [
    { id: 1, name: 'Alice', age: 30 },
    { id: 2, name: 'Bob', age: 25 },
    { id: 3, name: 'Charlie', age: 35 },
    { id: 4, name: 'David', age: 28 },
    { id: 5, name: 'Eve', age: 22 },
  ];

  const columns = [
    { header: 'ID', accessor: 'id' as keyof typeof mockData[0] },
    { header: 'Name', accessor: 'name' as keyof typeof mockData[0] },
    { header: 'Age', accessor: 'age' as keyof typeof mockData[0] },
    { header: 'Custom', accessor: (row: typeof mockData[0]) => <span>User: {row.name}</span> },
  ];

  it('renders table with data', () => {
    render(<DataTable columns={columns} data={mockData} />);
    expect(screen.getByText('Alice')).toBeDefined();
    expect(screen.getByText('User: Alice')).toBeDefined();
    expect(screen.getByText('Bob')).toBeDefined();
  });

  it('filters data based on search input', () => {
    render(<DataTable columns={columns} data={mockData} searchKey="name" />);
    const searchInput = screen.getByPlaceholderText('Search records...');
    fireEvent.change(searchInput, { target: { value: 'alice' } });
    
    expect(screen.getByText('Alice')).toBeDefined();
    expect(screen.queryByText('Bob')).toBeNull();
  });
  
  it('does not filter if searchKey is missing', () => {
    render(<DataTable columns={columns} data={mockData} />);
    expect(screen.getByText('Alice')).toBeDefined();
    expect(screen.getByText('Bob')).toBeDefined();
  });

  it('displays empty state when no data matches search', () => {
    render(<DataTable columns={columns} data={mockData} searchKey="name" />);
    const searchInput = screen.getByPlaceholderText('Search records...');
    fireEvent.change(searchInput, { target: { value: 'zebra' } });
    
    expect(screen.getByText('No matching items found')).toBeDefined();
  });

  it('renders pagination controls', () => {
    const onPageChange = vi.fn();
    render(
      <DataTable 
        columns={columns} 
        data={mockData.slice(0, 2)} 
        pagination={{ page: 1, pages: 3, count: 5, limit: 2 }}
        onPageChange={onPageChange}
      />
    );
    expect(screen.getByText(/Showing/i)).toBeDefined();

    fireEvent.click(screen.getByLabelText('Next Page'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
  
  it('handles pagination truncation logic', () => {
    render(
      <DataTable 
        columns={columns} 
        data={mockData} 
        pagination={{ page: 5, pages: 10, count: 20, limit: 2 }}
      />
    );
    
    expect(screen.getByLabelText('Page 1')).toBeDefined();
    expect(screen.getByLabelText('Page 4')).toBeDefined();
    expect(screen.getByLabelText('Page 5')).toBeDefined();
    expect(screen.getByLabelText('Page 6')).toBeDefined();
    expect(screen.getByLabelText('Page 10')).toBeDefined();
  });

  it('renders lazy load controls', () => {
    const onLoadMore = vi.fn();
    render(
      <DataTable 
        columns={columns} 
        data={mockData}
        isLazyLoad={true}
        hasMore={true}
        loadingMore={false}
        onLoadMore={onLoadMore}
        pagination={{ page: 1, pages: 2, count: 10, limit: 5 }}
      />
    );
    
    const loadMoreBtn = screen.getByText(/Load More Data/i);
    expect(loadMoreBtn).toBeDefined();
    fireEvent.click(loadMoreBtn);
    expect(onLoadMore).toHaveBeenCalled();
  });

  it('displays loading state for lazy load', () => {
    render(
      <DataTable 
        columns={columns} 
        data={mockData}
        isLazyLoad={true}
        hasMore={true}
        loadingMore={true}
      />
    );
    expect(screen.getByText(/Lazy Loading Next Page.../i)).toBeDefined();
  });

  it('displays all records loaded in lazy view', () => {
    render(
      <DataTable 
        columns={columns} 
        data={mockData}
        isLazyLoad={true}
        hasMore={false}
        pagination={{ page: 1, pages: 1, count: 5, limit: 5 }}
      />
    );
    expect(screen.getByText(/All 5 records loaded/i)).toBeDefined();
  });

  it('handles lazy load toggle', () => {
    const onToggle = vi.fn();
    render(
      <DataTable 
        columns={columns} 
        data={mockData}
        isLazyLoad={false}
        onToggleLazyLoad={onToggle}
      />
    );
    
    fireEvent.click(screen.getByText('Lazy Load'));
    expect(onToggle).toHaveBeenCalledWith(true);
    
    fireEvent.click(screen.getByText('Paginated'));
    expect(onToggle).toHaveBeenCalledWith(false);
  });
  
  it('handles lazy load toggle when already lazy', () => {
    const onToggle = vi.fn();
    render(
      <DataTable 
        columns={columns} 
        data={mockData}
        isLazyLoad={true}
        onToggleLazyLoad={onToggle}
      />
    );
    
    fireEvent.click(screen.getByText('Paginated'));
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it('handles filtering when row searchKey value is null/undefined', () => {
    const dataWithMissing = [
      { id: 1, name: 'Alice', age: 30 },
      { id: 2, name: null, age: 25 },
      { id: 3, age: 35 } // missing name entirely
    ] as any;
    
    render(<DataTable columns={columns} data={dataWithMissing} searchKey="name" />);
    const searchInput = screen.getByPlaceholderText('Search records...');
    fireEvent.change(searchInput, { target: { value: 'alice' } });
    
    expect(screen.getByText('Alice')).toBeDefined();
    // 2 and 3 should not crash and should not match "alice"
  });

  it('navigates previous page', () => {
    const onPageChange = vi.fn();
    render(
      <DataTable 
        columns={columns} 
        data={mockData.slice(0, 2)} 
        pagination={{ page: 2, pages: 3, count: 5, limit: 2 }}
        onPageChange={onPageChange}
      />
    );

    fireEvent.click(screen.getByLabelText('Previous Page'));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('navigates to specific page when number is clicked', () => {
    const onPageChange = vi.fn();
    render(
      <DataTable 
        columns={columns} 
        data={mockData} 
        pagination={{ page: 1, pages: 3, count: 5, limit: 2 }}
        onPageChange={onPageChange}
      />
    );

    fireEvent.click(screen.getByLabelText('Page 3'));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
