import React from 'react';

interface RevenuePoint {
  day: string;
  revenue: number; // in ₹
  jobs: number;
}

const mockData: RevenuePoint[] = [
  { day: 'Mon', revenue: 42000, jobs: 14 },
  { day: 'Tue', revenue: 58000, jobs: 19 },
  { day: 'Wed', revenue: 64000, jobs: 22 },
  { day: 'Thu', revenue: 49000, jobs: 16 },
  { day: 'Fri', revenue: 82000, jobs: 28 },
  { day: 'Sat', revenue: 95000, jobs: 31 },
  { day: 'Sun', revenue: 71000, jobs: 24 },
];

export const FleetRevenueChart: React.FC = () => {
  const maxRevenue = Math.max(...mockData.map((d) => d.revenue));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-200">Weekly Revenue & Job Volume</h4>
          <p className="text-xs text-slate-400">Total gross earnings across tractors, JCBs, and buses</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-3 h-3 rounded bg-blue-500 inline-block"></span>
            <span>Revenue (₹)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
            <span>Completed Jobs</span>
          </div>
        </div>
      </div>

      {/* SVG Bar Chart Visualization */}
      <div className="h-44 w-full flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-800">
        {mockData.map((pt, idx) => {
          const heightPct = Math.round((pt.revenue / maxRevenue) * 100);
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
              {/* Tooltip on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-900 text-slate-100 text-[11px] py-1 px-2.5 rounded-lg border border-slate-700 pointer-events-none z-20 whitespace-nowrap shadow-xl">
                ₹{pt.revenue.toLocaleString('en-IN')} · {pt.jobs} jobs
              </div>

              {/* Bar container */}
              <div className="w-full bg-slate-800/50 rounded-t-lg h-32 flex items-end p-1 overflow-hidden">
                <div
                  className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t transition-all duration-500 group-hover:from-blue-500 group-hover:to-indigo-400"
                  style={{ height: `${heightPct}%` }}
                ></div>
              </div>

              <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200">
                {pt.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
