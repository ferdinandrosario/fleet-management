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
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-[var(--text-main)]">{value}</h3>
          {subtitle && <p className="text-xs text-[var(--text-muted)] mt-1">{subtitle}</p>}
        </div>
        {icon && <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">{icon}</div>}
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-[var(--border-color)] text-xs font-medium text-emerald-400 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{trend}</span>
        </div>
      )}
    </Card>
  );
};
