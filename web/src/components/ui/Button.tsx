import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyle =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm min-h-[2.75rem]',
    lg: 'px-5 py-2.5 text-base min-h-[2.75rem]',
  };

  const variants = {
    primary:
      'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg hover:shadow-indigo-500/30 hover:from-indigo-400 hover:to-violet-500 border border-indigo-400/30',
    secondary:
      'bg-[var(--input-bg)] text-[var(--text-main)] hover:border-[var(--primary-accent)] border border-[var(--border-color)]',
    danger:
      'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg hover:from-rose-400 hover:to-red-500 border border-rose-400/30',
    outline:
      'bg-transparent text-indigo-300 border border-indigo-500/35 hover:bg-indigo-500/10',
  };

  return (
    <button className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
