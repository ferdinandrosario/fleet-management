import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Loader2, ArrowDownCircle, Layers, ListFilter } from 'lucide-react';
import { Input } from './Input';
import { Button } from './Button';

export interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

export interface PaginationInfo {
  page: number;
  pages: number;
  count: number;
  limit: number;
}

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKey?: keyof T;
  pagination?: PaginationInfo;
  onPageChange?: (newPage: number) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  isLazyLoad?: boolean;
  onToggleLazyLoad?: (enabled: boolean) => void;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  searchPlaceholder = 'Search records...',
  searchKey,
  pagination,
  onPageChange,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
  isLazyLoad = false,
  onToggleLazyLoad,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('');

  const filteredData = data.filter((row) => {
    if (!query || !searchKey) return true;
    const val = String(row[searchKey] || '').toLowerCase();
    return val.includes(query.toLowerCase());
  });

  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.pages || 1;
  const totalCount = pagination?.count || data.length;
  const pageLimit = pagination?.limit || 20;

  const startRecord = Math.min((currentPage - 1) * pageLimit + 1, totalCount);
  const endRecord = Math.min(currentPage * pageLimit, totalCount);

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        {searchKey ? (
          <div className="w-full sm:max-w-sm">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              icon={<Search className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
            />
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
          {onToggleLazyLoad && (
            <div className="flex items-center bg-[var(--input-bg)] p-1 rounded-lg border border-[var(--border-color)]">
              <button
                type="button"
                onClick={() => onToggleLazyLoad(false)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  !isLazyLoad
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <ListFilter className="w-3 h-3" />
                Paginated
              </button>
              <button
                type="button"
                onClick={() => onToggleLazyLoad(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  isLazyLoad
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <ArrowDownCircle className="w-3 h-3" />
                Lazy Load
              </button>
            </div>
          )}

          <span className="text-xs text-[var(--text-muted)] font-medium">
            {totalCount} total records
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] shadow-sm bg-[var(--bg-secondary)]/30">
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

      {/* Pagination or Lazy Loading Controls */}
      {isLazyLoad ? (
        <div className="flex flex-col items-center justify-center p-4 bg-[var(--bg-secondary)]/40 rounded-xl border border-[var(--border-color)] gap-2">
          {hasMore ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={loadingMore}
              className="flex items-center gap-2 px-5 py-2 border-indigo-500/40 hover:bg-indigo-500/10 text-indigo-400 font-semibold"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Lazy Loading Next Page...
                </>
              ) : (
                <>
                  <ArrowDownCircle className="w-4 h-4" />
                  Load More Data (Page {currentPage + 1} of {totalPages})
                </>
              )}
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <Layers className="w-3.5 h-3.5" />
              All {totalCount} records loaded in lazy view
            </div>
          )}
          <span className="text-[11px] text-[var(--text-muted)]">
            Displaying {filteredData.length} of {totalCount} items loaded lazily
          </span>
        </div>
      ) : (
        pagination && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[var(--bg-secondary)]/40 rounded-xl border border-[var(--border-color)] text-xs text-[var(--text-muted)]">
            <div>
              Showing <span className="font-semibold text-[var(--text-main)]">{startRecord}</span> to{' '}
              <span className="font-semibold text-[var(--text-main)]">{endRecord}</span> of{' '}
              <span className="font-semibold text-[var(--text-main)]">{totalCount}</span> entries
            </div>

            <div className="flex items-center gap-1.5 self-center sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                aria-label="Previous Page"
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                // Show first, last, current, and adjacent pages
                if (
                  p === 1 ||
                  p === totalPages ||
                  Math.abs(p - currentPage) <= 1
                ) {
                  return (
                    <button
                      key={p}
                      type="button"
                      aria-label={`Page ${p}`}
                      onClick={() => onPageChange?.(p)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                        p === currentPage
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                          : 'border-[var(--border-color)] text-[var(--text-muted)] hover:bg-[var(--input-bg)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      {p}
                    </button>
                  );
                }
                if (p === 2 && currentPage > 3) {
                  return (
                    <span key={p} className="px-1 text-[var(--text-muted)]">
                      ...
                    </span>
                  );
                }
                if (p === totalPages - 1 && currentPage < totalPages - 2) {
                  return (
                    <span key={p} className="px-1 text-[var(--text-muted)]">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <Button
                variant="outline"
                size="sm"
                aria-label="Next Page"
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-1.5"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
