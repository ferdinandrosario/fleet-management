import React from 'react';
import { Moon, Sun, Shield } from 'lucide-react';
import { useTheme, ThemeMode } from '../../lib/theme';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes: { id: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { id: 'dark', label: 'Dark Fleet', icon: <Moon className="w-3.5 h-3.5" /> },
    { id: 'light', label: 'Light', icon: <Sun className="w-3.5 h-3.5" /> },
    { id: 'obsidian', label: 'Obsidian', icon: <Shield className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex bg-[var(--input-bg)] p-1 rounded-xl border border-[var(--border-color)] text-xs">
      {themes.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setTheme(t.id)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
            theme === t.id
              ? 'bg-[var(--primary-accent)] text-white font-medium shadow-sm'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
          title={`Switch to ${t.label} theme`}
        >
          {t.icon}
          <span className="hidden sm:inline">{t.label}</span>
        </button>
      ))}
    </div>
  );
};
