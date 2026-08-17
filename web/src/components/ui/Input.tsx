import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-[var(--text-main)]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-[var(--text-muted)] pointer-events-none text-xs flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-[var(--input-bg)] border rounded-xl px-3 py-2 text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none transition-colors ${
              icon ? 'pl-9' : ''
            } ${
              error
                ? 'border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                : 'border-[var(--border-color)] focus:border-[var(--primary-accent)] focus:ring-1 focus:ring-indigo-500/40'
            } ${className}`}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-[11px] font-medium text-rose-400 mt-1 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-[var(--text-muted)] mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
