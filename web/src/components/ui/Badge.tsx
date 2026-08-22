import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  icon,
  className = '',
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    success: 'bg-[color-mix(in_srgb,var(--success-color)_15%,transparent)] text-[var(--success-color)] border-[color-mix(in_srgb,var(--success-color)_30%,transparent)]',
    warning: 'bg-[color-mix(in_srgb,var(--warning-color)_15%,transparent)] text-[var(--warning-color)] border-[color-mix(in_srgb,var(--warning-color)_30%,transparent)]',
    danger:  'bg-[color-mix(in_srgb,var(--danger-color)_15%,transparent)]  text-[var(--danger-color)]  border-[color-mix(in_srgb,var(--danger-color)_30%,transparent)]',
    info:    'bg-[color-mix(in_srgb,var(--info-color)_15%,transparent)]    text-[var(--info-color)]    border-[color-mix(in_srgb,var(--info-color)_30%,transparent)]',
    neutral: 'bg-[var(--color-surface-sunken)] text-[var(--text-muted)] border-[var(--border-color)]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="text-[10px]">{icon}</span>}
      {children}
    </span>
  );
};
