import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  ChevronDown,
  Building2,
  LogOut,
  Crown,
  Sparkles,
  Sun,
  Moon,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { Badge } from './Badge';
import { t } from '../../lib/i18n';
import { useTheme, ThemeMode } from '../../lib/theme';

export const ProfileMenu: React.FC = () => {
  const { user, role, tenantSlug, setTenant, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = user?.name || user?.email || user?.phone || 'Fleet User';
  const displaySub = user?.email || user?.phone || (role === 'super_admin' ? 'admin@platform' : 'tenant@fleet');
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const themeOptions: { id: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { id: 'dark', label: 'Dark', icon: <Moon className="w-3 h-3" /> },
    { id: 'light', label: 'Light', icon: <Sun className="w-3 h-3" /> },
    { id: 'obsidian', label: 'Obsidian', icon: <Shield className="w-3 h-3" /> },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[var(--input-bg)] hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--primary-accent)] px-3 py-1.5 rounded-2xl transition-all duration-200 cursor-pointer group shadow-sm"
        aria-label="User Profile Menu"
        aria-expanded={isOpen}
      >
        {/* Avatar Circle */}
        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
          {role === 'super_admin' ? <Crown className="w-3.5 h-3.5" /> : initials || <User className="w-3.5 h-3.5" />}
        </div>

        {/* User Info & Badge */}
        <div className="hidden sm:flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-[var(--text-main)] max-w-[120px] truncate leading-tight">
              {displayName}
            </span>
            <Badge variant={role === 'super_admin' ? 'info' : 'success'} className="text-[10px] px-1.5 py-0">
              {role === 'super_admin' ? t('role_super_admin') : t('role_fleet_owner')}
            </Badge>
          </div>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[var(--primary-accent)]' : 'group-hover:text-[var(--text-main)]'
          }`}
        />
      </button>

      {/* Dropdown Menu Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-72 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-2xl backdrop-blur-xl p-3.5 z-50 space-y-3.5 animate-fade-in">
          {/* Identity Header */}
          <div className="flex items-center gap-3 p-2.5 bg-[var(--input-bg)]/60 rounded-xl border border-[var(--border-color)]">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
              {role === 'super_admin' ? <Crown className="w-5 h-5" /> : initials || <User className="w-5 h-5" />}
            </div>
            <div className="overflow-hidden space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[var(--text-main)] truncate">{displayName}</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] truncate font-mono">{displaySub}</p>
              <div className="pt-0.5">
                <Badge variant={role === 'super_admin' ? 'info' : 'success'} className="text-[10px] px-1.5 py-0">
                  {role === 'super_admin' ? t('role_super_admin') : t('role_fleet_owner')}
                </Badge>
              </div>
            </div>
          </div>

          {/* Tenant Switcher (for owner role) */}
          {role === 'owner' && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3 h-3 text-cyan-400" />
                <span>{t('tenant_label')}</span>
              </label>
              <div className="flex items-center gap-1.5 bg-[var(--input-bg)] border border-[var(--border-color)] focus-within:border-[var(--primary-accent)] rounded-xl px-2.5 py-1.5 transition-all">
                <span className="text-[11px] font-mono text-[var(--text-muted)]">schema/</span>
                <input
                  type="text"
                  value={tenantSlug}
                  onChange={(e) => setTenant(e.target.value)}
                  className="bg-transparent text-[var(--text-main)] font-mono w-full focus:outline-none text-xs font-bold"
                  placeholder="tenant_slug"
                />
              </div>
            </div>
          )}

          {/* Theme Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Appearance</span>
            </label>
            <div className="grid grid-cols-3 gap-1 bg-[var(--input-bg)] p-1 rounded-xl border border-[var(--border-color)]">
              {themeOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTheme(opt.id)}
                  className={`flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    theme === opt.id
                      ? 'bg-[var(--primary-accent)] text-white shadow-sm font-semibold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {opt.icon}
                  <span className="text-[11px]">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Logout Action */}
          <div className="border-t border-[var(--border-color)] pt-2">
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('logout')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
