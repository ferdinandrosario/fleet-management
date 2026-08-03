import React, { useState } from 'react';
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
        <div className="flex items-center justify-between gap-4">
          <div className="max-w-sm w-full">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              icon="🔍"
            />
          </div>
          <span className="text-xs text-slate-400 font-medium">{filteredData.length} records</span>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-800/80 shadow-inner">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`p-3.5 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-slate-500">
                  No matching items found
                </td>
              </tr>
            ) : (
              filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-900/50 transition-colors">
                  {columns.map((col, idx) => (
                    <td key={idx} className={`p-3.5 ${col.className || ''}`}>
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
