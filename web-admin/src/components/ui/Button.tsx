import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}) => {
  const baseStyle =
    'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 border border-blue-400/30',
    secondary:
      'bg-[var(--input-bg)] text-[var(--text-main)] hover:border-[var(--primary-accent)] border border-[var(--border-color)]',
    danger:
      'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg hover:from-red-500 hover:to-rose-500 border border-red-400/30',
    outline:
      'bg-transparent text-blue-400 border border-blue-500/40 hover:bg-blue-500/10',
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
