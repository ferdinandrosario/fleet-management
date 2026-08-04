import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { useAuth } from './AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
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

  // Form State - Pre-filled on /demo route based on activeRole
  const [phone, setPhone] = useState<string>(isDemoRoute ? '+919876543210' : '');
  const [email, setEmail] = useState<string>(isDemoRoute ? 'admin@fleet.example.com' : '');
  const [password, setPassword] = useState<string>(
    isDemoRoute ? (activeRole === 'owner' ? 'password123' : 'adminsecret123') : ''
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
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] flex flex-col justify-center items-center px-4 py-8 sm:py-12 transition-colors duration-250">
      {/* Top bar controls */}
      <div className="absolute top-3 right-4 sm:top-4 sm:right-6 flex items-center gap-3">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xl text-white shadow-xl shadow-blue-500/25">
            FM
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            {isDemoRoute
              ? activeRole === 'super_admin'
                ? 'Super Admin Demo Portal'
                : 'Fleet Owner Demo Portal'
              : activeRole === 'super_admin'
              ? t('superadmin_auth_title')
              : t('owner_auth_title')}
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {isDemoRoute
              ? activeRole === 'super_admin'
                ? 'Pre-filled demo credentials for Super Admin'
                : 'Pre-filled demo credentials for Fleet Owner'
              : activeRole === 'super_admin'
              ? t('superadmin_auth_subtitle')
              : t('owner_auth_subtitle')}
          </p>
        </div>

        {/* Auth Form Card */}
        <Card className="space-y-5">
          {isDemoRoute && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-300 rounded-xl text-xs flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Demo credentials pre-filled for {activeRole === 'owner' ? 'Fleet Owner' : 'Super Admin'} portal.
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeRole === 'owner' ? (
              <Input
                label={t('phone_number')}
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('phone_placeholder')}
                required
              />
            ) : (
              <Input
                label={t('email_address')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('email_placeholder')}
                required
              />
            )}

            <Input
              label={t('password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('password_placeholder')}
              required
            />

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center py-2.5"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('signing_in')}</span>
                </div>
              ) : (
                <span>{t('sign_in')}</span>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

