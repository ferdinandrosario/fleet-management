import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  User,
  ChevronDown,
  LogOut,
  Crown,
  Type,
  Key,
} from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { Badge } from './Badge';
import { t } from '../../lib/i18n';
import { useFontSize } from '../../lib/fontSize';
import { ChangePasswordModal } from './ChangePasswordModal';

export const ProfileMenu: React.FC = () => {
  const { user, role, logout } = useAuth();
  const { fontSize, increaseFontSize, decreaseFontSize, resetFontSize } = useFontSize();
  const [isOpen, setIsOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on click-outside and on Escape — returning focus to the trigger
  // button on close so keyboard users don't lose their position in the page.
  const close = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        close();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        event.stopPropagation();
        close();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, close]);

  const displayName = user?.name || user?.email || user?.phone || 'Fleet User';
  const displaySub = user?.email || user?.phone || (role === 'super_admin' ? 'admin@platform' : 'tenant@fleet');
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[var(--input-bg)] hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--primary-accent)] px-3 py-1.5 rounded-2xl transition-all duration-200 cursor-pointer group shadow-sm"
        aria-label="User Profile Menu"
        aria-haspopup="menu"
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
        <div
          role="menu"
          aria-label="User profile options"
          className="absolute right-0 mt-2.5 w-72 max-w-[calc(100vw-1.5rem)] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-2xl backdrop-blur-xl p-3.5 z-50 space-y-3.5 animate-fade-in"
        >
          {/* Identity Header — presentational, not interactive */}
          <div aria-hidden="true" className="flex items-center gap-3 p-2.5 bg-[var(--input-bg)]/60 rounded-xl border border-[var(--border-color)]">
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

          {/* Font Size Controls — labelled group, not individual menu items */}
          <div className="space-y-1.5" role="group" aria-label="Font size">
            <label className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
              <Type className="w-3 h-3 text-indigo-400" />
              <span>Font Size</span>
            </label>
            <div className="grid grid-cols-3 gap-1 bg-[var(--input-bg)] p-1 rounded-xl border border-[var(--border-color)] text-xs">
              <button
                type="button"
                role="menuitem"
                onClick={decreaseFontSize}
                disabled={fontSize === 'sm'}
                className="py-1.5 rounded-lg font-bold text-xs text-center transition-all cursor-pointer text-[var(--text-main)] hover:bg-[var(--bg-secondary)] disabled:opacity-30 disabled:cursor-not-allowed"
                title="Decrease font size (A-)"
                aria-label="Decrease font size"
              >
                A-
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={resetFontSize}
                className={`py-1.5 rounded-lg text-[11px] font-semibold text-center transition-all cursor-pointer ${
                  fontSize === 'md'
                    ? 'bg-[var(--primary-accent)] text-white shadow-sm font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
                title="Reset to Original Font Size"
                aria-label="Reset font size to default"
                aria-pressed={fontSize === 'md'}
              >
                Original
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={increaseFontSize}
                disabled={fontSize === 'xl'}
                className="py-1.5 rounded-lg font-bold text-xs text-center transition-all cursor-pointer text-[var(--text-main)] hover:bg-[var(--bg-secondary)] disabled:opacity-30 disabled:cursor-not-allowed"
                title="Increase font size (A+)"
                aria-label="Increase font size"
              >
                A+
              </button>
            </div>
          </div>

          {/* Account Actions */}
          <div className="border-t border-[var(--border-color)] pt-2 space-y-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                setIsPasswordModalOpen(true);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-main)] hover:bg-[var(--input-bg)] border border-transparent hover:border-[var(--border-color)] transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span>Change Password</span>
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">••••••••</span>
            </button>

            <button
              type="button"
              role="menuitem"
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

      {/* Change Password Modal Popup */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};
