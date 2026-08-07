import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Zap, Truck } from 'lucide-react';
import { useAuth } from './AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { t } from '../../lib/i18n';

interface AuthGateProps {
  isDemoRoute?: boolean;
  isSuperAdminRoute?: boolean;
}

export const AuthGate: React.FC<AuthGateProps> = ({
  isDemoRoute = false,
  isSuperAdminRoute = false,
}) => {
  const { loginOwner, loginSuperAdmin } = useAuth();
  const activeRole: 'owner' | 'super_admin' = isSuperAdminRoute ? 'super_admin' : 'owner';

  const isPrefillAllowed = isDemoRoute || isSuperAdminRoute;
  const [phone, setPhone] = useState<string>(isPrefillAllowed ? '+919876543210' : '');
  const [email, setEmail] = useState<string>(isPrefillAllowed ? 'admin@example.com' : '');
  const [password, setPassword] = useState<string>(
    isPrefillAllowed ? (activeRole === 'owner' ? 'password123' : 'adminsecret123') : ''
  );
  const tenantSlug = 'demo_tenant';

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (activeRole === 'owner') {
      if (!phone.trim() || !password.trim()) {
        setErrorMessage(t('login_error_required'));
        return;
      }
    } else {
      if (!email.trim() || !password.trim()) {
        setErrorMessage(t('login_error_required'));
        return;
      }
    }

    setLoading(true);

    try {
      if (activeRole === 'owner') {
        const res = await loginOwner({ phone, password, tenantSlug: tenantSlug || 'demo_tenant' });
        if (res.success) {
          setSuccessMessage(t('login_success'));
        } else {
          setErrorMessage(res.message || t('login_error_invalid'));
        }
      } else {
        const res = await loginSuperAdmin({ email, password });
        if (res.success) {
          setSuccessMessage(t('login_success'));
        } else {
          setErrorMessage(res.message || t('login_error_invalid'));
        }
      }
    } catch {
      setErrorMessage(t('login_error_invalid'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center px-4 py-8 sm:py-12"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-main)', position: 'relative', overflow: 'hidden' }}
    >
      {/* Decorative background rings — depth without noise */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `
            radial-gradient(ellipse 70% 55% at 50% -5%,  rgba(99,102,241,0.13) 0%, transparent 65%),
            radial-gradient(ellipse 45% 35% at 80% 75%,  rgba(139,92,246,0.07) 0%, transparent 55%),
            radial-gradient(ellipse 40% 30% at 15% 60%,  rgba(99,102,241,0.05) 0%, transparent 50%)
          `,
        }}
      />

      <div className="w-full max-w-md space-y-7 relative">

        {/* Brand mark */}
        <div className="text-center space-y-3">
          <div
            className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-white"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
              boxShadow: '0 8px 32px rgba(99,102,241,0.35), 0 0 0 1px rgba(99,102,241,0.2)',
            }}
          >
            <Truck className="w-7 h-7" />
          </div>

          <div>
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: 'var(--text-main)', fontFamily: "'Outfit', sans-serif" }}
            >
              {isDemoRoute
                ? activeRole === 'super_admin' ? 'Super Admin Demo' : 'Fleet Owner Demo'
                : activeRole === 'super_admin'
                ? t('superadmin_auth_title')
                : t('owner_auth_title')}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {isDemoRoute
                ? `Pre-filled demo credentials · ${activeRole === 'owner' ? 'Fleet Owner' : 'Super Admin'}`
                : activeRole === 'super_admin'
                ? t('superadmin_auth_subtitle')
                : t('owner_auth_subtitle')}
            </p>
          </div>
        </div>

        {/* Auth card */}
        <Card
          className="space-y-5"
          style={{ boxShadow: '0 0 0 1px var(--border-color), 0 8px 40px rgba(0,0,0,0.4), 0 0 60px rgba(99,102,241,0.06)' }}
        >
          {/* Demo pre-fill notice */}
          {isDemoRoute && (
            <div
              className="p-3 rounded-xl text-xs flex items-center gap-2.5"
              style={{
                background: 'rgba(99,102,241,0.09)',
                border: '1px solid rgba(99,102,241,0.22)',
                color: '#a5b4fc',
              }}
            >
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Demo credentials pre-filled for {activeRole === 'owner' ? 'Fleet Owner' : 'Super Admin'} portal.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {activeRole === 'owner' ? (
              <Input
                id="auth-phone"
                label={t('phone_number')}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('phone_placeholder')}
                helperText="Include country code, e.g. +91 98765 43210"
                required
                autoComplete="tel"
              />
            ) : (
              <Input
                id="auth-email"
                label={t('email_address')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('email_placeholder')}
                required
                autoComplete="email"
              />
            )}

            <Input
              id="auth-password"
              label={t('password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('password_placeholder')}
              required
              autoComplete="current-password"
            />

            {/* Inline error */}
            {errorMessage && (
              <div
                className="p-3 rounded-xl text-sm flex items-center gap-2.5"
                style={{
                  background: 'rgba(244,63,94,0.10)',
                  border: '1px solid rgba(244,63,94,0.28)',
                  color: 'var(--danger-color)',
                }}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Auth success — brief flash; page navigates away immediately after login */}
            {successMessage && (
              <div
                className="p-3 rounded-xl text-sm flex items-center gap-2.5"
                style={{
                  background: 'rgba(16,185,129,0.10)',
                  border: '1px solid rgba(16,185,129,0.28)',
                  color: 'var(--success-color)',
                }}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <Button
              id="auth-submit"
              type="submit"
              variant="primary"
              className="w-full justify-center"
              style={{ minHeight: 44 }}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>{t('signing_in')}</span>
                </span>
              ) : (
                <span>{t('sign_in')}</span>
              )}
            </Button>
          </form>

          {/* Role context hint */}
          <p
            className="text-center"
            style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}
          >
            {activeRole === 'super_admin'
              ? 'Platform operator access — credentials issued by the platform team.'
              : 'Fleet owner access · Switch to super admin at /superadmin'}
          </p>
        </Card>

        {/* Footer wordmark */}
        <p
          className="text-center"
          style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', opacity: 0.6 }}
        >
          Fleet Management Platform · India · Enterprise Multi-Tenant
        </p>
      </div>
    </div>
  );
};
