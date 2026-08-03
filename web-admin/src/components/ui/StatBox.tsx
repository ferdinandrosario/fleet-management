import React from 'react';
import { Card } from './Card';

interface StatBoxProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  icon?: React.ReactNode;
}

export const StatBox: React.FC<StatBoxProps> = ({ title, value, subtitle, trend, icon }) => {
  return (
    <Card className="animate-fade-in relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-100">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {icon && <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">{icon}</div>}
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-800 text-xs font-medium text-emerald-400 flex items-center gap-1">
          <span>↑</span> {trend}
        </div>
      )}
    </Card>
  );
};
