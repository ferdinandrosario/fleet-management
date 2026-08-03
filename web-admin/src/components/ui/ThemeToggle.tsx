import React from 'react';
import { useTheme, ThemeMode } from '../../lib/theme';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes: { id: ThemeMode; label: string; icon: string }[] = [
    { id: 'dark', label: 'Dark Fleet', icon: '🌙' },
    { id: 'light', label: 'Light', icon: '☀️' },
    { id: 'obsidian', label: 'Obsidian', icon: '💎' },
  ];

  return (
    <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 text-xs">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
            theme === t.id
              ? 'bg-blue-600 text-white font-medium shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title={`Switch to ${t.label} theme`}
        >
          <span>{t.icon}</span>
          <span className="hidden sm:inline">{t.label}</span>
        </button>
      ))}
    </div>
  );
};
