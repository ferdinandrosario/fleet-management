import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`glass-card p-6 ${className}`}
      style={{ background: 'var(--color-surface-raised)' }}
      {...props}
    >
      {children}
    </div>
  );
};
