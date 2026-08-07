import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card } from './Card';

interface StatBoxProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  trend?: string;
  icon?: React.ReactNode;
}

export const StatBox: React.FC<StatBoxProps> = ({ title, value, subtitle, trend, icon }) => {
  return (
    <Card className="animate-fade-in relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-1.5"
            style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}
          >
            {title}
          </p>
          <h3
            className="font-bold truncate"
            style={{ fontSize: 'var(--text-2xl)', color: 'var(--text-main)' }}
          >
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs mt-1 truncate" style={{ color: 'var(--text-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-3 rounded-xl ml-3 shrink-0 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div
          className="mt-3 pt-3 text-xs font-medium flex items-center gap-1.5"
          style={{ borderTop: '1px solid var(--border-color)', color: 'var(--success-color)' }}
        >
          <TrendingUp className="w-3.5 h-3.5 shrink-0" />
          <span>{trend}</span>
        </div>
      )}
    </Card>
  );
};
