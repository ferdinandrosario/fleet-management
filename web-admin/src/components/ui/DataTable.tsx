import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from './Input';

export interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKey?: keyof T;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  searchPlaceholder = 'Search records...',
  searchKey,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('');

  const filteredData = data.filter((row) => {
    if (!query || !searchKey) return true;
    const val = String(row[searchKey] || '').toLowerCase();
    return val.includes(query.toLowerCase());
  });

  return (
    <div className="space-y-3">
      {searchKey && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
          <div className="w-full sm:max-w-sm">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              icon={<Search className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
            />
          </div>
          <span className="text-xs text-[var(--text-muted)] font-medium self-end sm:self-auto shrink-0">{filteredData.length} records</span>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] shadow-sm">
        <table className="w-full text-left text-xs text-[var(--text-main)] border-collapse min-w-full">
          <thead className="bg-[var(--input-bg)] border-b border-[var(--border-color)] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`p-2.5 sm:p-3.5 whitespace-nowrap ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)] bg-[var(--bg-secondary)]/50">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-[var(--text-muted)]">
                  No matching items found
                </td>
              </tr>
            ) : (
              filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-[var(--input-bg)]/60 transition-colors">
                  {columns.map((col, idx) => (
                    <td key={idx} className={`p-2.5 sm:p-3.5 ${col.className || ''}`}>
                      {typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : (row[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
