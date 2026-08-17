import React from 'react';
import { Type, RotateCcw } from 'lucide-react';
import { useFontSize } from '../../lib/fontSize';

export const FontSizeToggle: React.FC = () => {
  const { fontSize, increaseFontSize, decreaseFontSize, resetFontSize } = useFontSize();

  return (
    <div className="flex items-center gap-1 bg-[var(--input-bg)] p-1 rounded-xl border border-[var(--border-color)] text-xs">
      {/* Label / Icon */}
      <div className="flex items-center px-1.5 text-[var(--text-muted)] gap-1 shrink-0">
        <Type className="w-3.5 h-3.5 text-indigo-400" />
        <span className="hidden lg:inline text-[11px] font-medium">Text</span>
      </div>

      {/* A- (Decrease Font Size) */}
      <button
        type="button"
        onClick={decreaseFontSize}
        aria-label="Decrease font size"
        disabled={fontSize === 'sm'}
        className="px-2 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--bg-secondary)] hover:border-[var(--primary-accent)] disabled:opacity-30 disabled:cursor-not-allowed"
        title="Decrease font size (A-)"
      >
        A-
      </button>

      {/* Original Size Button */}
      <button
        type="button"
        onClick={resetFontSize}
        aria-label="Reset to original font size"
        className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
          fontSize === 'md'
            ? 'bg-[var(--primary-accent)] text-white shadow-sm font-bold'
            : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-secondary)]'
        }`}
        title="Reset to Original Font Size"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Original</span>
      </button>

      {/* A+ (Increase Font Size) */}
      <button
        type="button"
        onClick={increaseFontSize}
        aria-label="Increase font size"
        disabled={fontSize === 'xl'}
        className="px-2 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer border border-[var(--border-color)] text-[var(--text-main)] hover:bg-[var(--bg-secondary)] hover:border-[var(--primary-accent)] disabled:opacity-30 disabled:cursor-not-allowed"
        title="Increase font size (A+)"
      >
        A+
      </button>
    </div>
  );
};
