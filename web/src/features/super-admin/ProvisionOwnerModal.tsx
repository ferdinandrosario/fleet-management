import React, { useState } from 'react';
import { UserPlus, Building, Phone, Lock, MapPin, Globe, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiRequest } from '../../lib/api';

interface ProvisionOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProvisionOwnerModal: React.FC<ProvisionOwnerModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [companyName, setCompanyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);
  const [planTier, setPlanTier] = useState<'basic' | 'pro' | 'enterprise'>('pro');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCompanyNameChange = (val: string) => {
    setCompanyName(val);
    if (autoSlug) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');
      setSlug(generated);
    }
  };

  const handleReset = () => {
    setCompanyName('');
    setOwnerName('');
    setOwnerPhone('');
    setPassword('');
    setAddress('');
    setSlug('');
    setAutoSlug(true);
    setPlanTier('pro');
    setError(null);
    setFieldErrors({});
    setSuccess(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSuccess(false);

    const errors: Record<string, string> = {};
    if (!companyName.trim()) errors.companyName = 'Company name is required';
    if (!ownerName.trim()) errors.ownerName = 'Owner contact name is required';
    if (!ownerPhone.trim()) errors.ownerPhone = 'Phone number is required';
    if (!password.trim()) {
      errors.password = 'Initial password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (!slug.trim()) errors.slug = 'Tenant URL slug is required';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Please resolve all validation errors below.');
      return;
    }

    setLoading(true);

    const payload = {
      name: ownerName.trim(),
      company_name: companyName.trim(),
      owner_name: ownerName.trim(),
      owner_phone: ownerPhone.trim(),
      password: password.trim(),
      address: address.trim() || 'Tamil Nadu, India',
      slug: slug.trim(),
      plan_tier: planTier,
    };

    const res = await apiRequest('/api/v1/super_admin/owners', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (res.status === 'success' || res.data?.owner) {
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } else {
      if (res.error?.fields) {
        // Flatten array error messages if present
        const mappedErrors: Record<string, string> = {};
        Object.entries(res.error.fields).forEach(([k, v]) => {
          mappedErrors[k] = Array.isArray(v) ? v.join(', ') : String(v);
        });
        setFieldErrors(mappedErrors);
      }
      setError(res.error?.message || 'Failed to provision tenant fleet owner.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      style={{ background: 'rgba(5, 8, 16, 0.85)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-xl overflow-hidden flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-250"
        style={{
          background: 'var(--color-surface-raised)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--color-surface-sunken)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8' }}
            >
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--text-main)' }}>Provision New Fleet Owner</h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Register new tenant &amp; initialize isolated PostgreSQL schema (`ros-apartment`)
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            type="button"
            aria-label="Close"
            className="p-1.5 rounded-lg transition-colors cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-row-hover)'; e.currentTarget.style.color = 'var(--text-main)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div
              className="p-3.5 rounded-xl text-sm flex items-center gap-2.5"
              style={{ background: 'rgba(244,63,94,0.10)', border: '1px solid rgba(244,63,94,0.25)', color: 'var(--danger-color)' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              className="p-4 rounded-xl flex items-center gap-3 animate-in fade-in duration-200"
              style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.30)', color: 'var(--success-color)' }}
            >
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Tenant Fleet Owner Provisioned!</p>
                <p style={{ fontSize: 'var(--text-xs)', opacity: 0.85 }}>
                  Schema `tenant_{slug}` initialized &amp; owner credentials created.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Company / Fleet Name *"
                value={companyName}
                onChange={(e) => handleCompanyNameChange(e.target.value)}
                placeholder="e.g. Salem Heavy Transports"
                icon={<Building className="w-3.5 h-3.5" />}
                error={fieldErrors.companyName || fieldErrors.company_name}
                required
                disabled={success || loading}
              />

              <Input
                label="Owner Contact Full Name *"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                icon={<UserPlus className="w-3.5 h-3.5" />}
                error={fieldErrors.ownerName || fieldErrors.name}
                required
                disabled={success || loading}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Owner Phone Number (Login) *"
                type="tel"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                placeholder="+91 98765 43210"
                icon={<Phone className="w-3.5 h-3.5" />}
                error={fieldErrors.ownerPhone || fieldErrors.owner_phone}
                required
                disabled={success || loading}
              />

              <Input
                label="Initial Password *"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                icon={<Lock className="w-3.5 h-3.5" />}
                error={fieldErrors.password}
                required
                disabled={success || loading}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Tenant Database Slug *"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setAutoSlug(false);
                  }}
                  placeholder="salem_transports"
                  icon={<Globe className="w-3.5 h-3.5" />}
                  error={fieldErrors.slug}
                  helperText="Database schema: tenant_<slug>"
                  required
                  disabled={success || loading}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-main)' }}>
                  Subscription Tier *
                </label>
                <select
                  value={planTier}
                  onChange={(e) => setPlanTier(e.target.value as 'basic' | 'pro' | 'enterprise')}
                  className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs focus:outline-none transition-colors"
                  style={{ color: 'var(--text-main)' }}
                  disabled={success || loading}
                >
                  <option value="basic">Starter Plan (Basic)</option>
                  <option value="pro">Pro Fleet (Monthly)</option>
                  <option value="enterprise">Enterprise (Annual)</option>
                </select>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">
                  Razorpay recurring billing package
                </p>
              </div>
            </div>

            <Input
              label="Company Office Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 42 Railway Station Road, Salem, Tamil Nadu"
              icon={<MapPin className="w-3.5 h-3.5" />}
              error={fieldErrors.address}
              disabled={success || loading}
            />

            <div
              className="pt-4 flex items-center justify-end gap-3"
              style={{ borderTop: '1px solid var(--border-color)' }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                {success ? 'Close' : 'Cancel'}
              </Button>
              {!success && (
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>Provisioning Schema…</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 shrink-0" />
                      <span>Provision Fleet Owner</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
