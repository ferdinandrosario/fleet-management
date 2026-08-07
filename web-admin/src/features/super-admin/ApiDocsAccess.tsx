import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { apiRequest } from '../../lib/api';
import { Key, Clock, Trash2, Plus, Copy, CheckCircle } from 'lucide-react';

interface Grant {
  id: number;
  email: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export const ApiDocsAccess: React.FC = () => {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [email, setEmail] = useState('');
  const [hours, setHours] = useState(24);
  const [loading, setLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    fetchGrants();
  }, []);

  const fetchGrants = async () => {
    setLoading(true);
    const res = await apiRequest('/api/v1/super_admin/api_doc_grants');
    if (res.status === 'success') {
      setGrants(res.data);
    }
    setLoading(false);
  };

  const createGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const res = await apiRequest('/api/v1/super_admin/api_doc_grants', {
      method: 'POST',
      body: JSON.stringify({ email, expires_in_hours: hours })
    });
    if (res.status === 'success') {
      setEmail('');
      setHours(24);
      fetchGrants();
    } else {
      alert(res.error?.message || 'Failed to create grant');
    }
  };

  const revokeGrant = async (id: number) => {
    if (!window.confirm('Revoke this access?')) return;
    await apiRequest(`/api/v1/super_admin/api_doc_grants/${id}`, { method: 'DELETE' });
    fetchGrants();
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <Card className="p-6 mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' }}
        >
          <Key className="w-5 h-5" style={{ color: '#818cf8' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>API Documentation Access</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Grant temporary access to the interactive API Docs.</p>
        </div>
      </div>

      <form onSubmit={createGrant} className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="email"
          placeholder="Developer Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="rounded-lg px-4 py-2 flex-1 outline-none"
          style={{
            background: 'var(--color-surface-sunken)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            minHeight: 44,
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary-accent)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
          required
        />
        <select
          value={hours}
          onChange={e => setHours(Number(e.target.value))}
          className="rounded-lg px-4 py-2 outline-none"
          style={{
            background: 'var(--color-surface-sunken)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-main)',
            minHeight: 44,
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary-accent)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
        >
          <option value={1}>1 Hour</option>
          <option value={24}>24 Hours</option>
          <option value={168}>7 Days</option>
        </select>
        <Button type="submit" variant="primary" className="gap-2" style={{ minHeight: 44 }}>
          <Plus className="w-4 h-4" /> Grant Access
        </Button>
      </form>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading grants…</p>
      ) : grants.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No active grants.</p>
      ) : (
        <div className="space-y-3">
          {grants.map(grant => {
            const isActive = new Date(grant.expires_at) > new Date();
            return (
              <div
                key={grant.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg gap-4"
                style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--border-color)' }}
              >
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text-main)' }}>{grant.email}</p>
                  <p className="flex items-center gap-1 mt-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    <Clock className="w-3 h-3" />
                    {isActive ? `Expires ${new Date(grant.expires_at).toLocaleString()}` : 'Expired'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md font-mono text-xs"
                    style={{ background: 'var(--color-surface-sunken)', color: 'var(--text-main)' }}
                  >
                    {grant.token}
                    <button
                      onClick={() => copyToken(grant.token)}
                      type="button"
                      className="transition-colors cursor-pointer"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      {copiedToken === grant.token ? <CheckCircle className="w-3 h-3" style={{ color: 'var(--success-color)' }} /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <Button variant="danger" onClick={() => revokeGrant(grant.id)} className="p-2 h-auto">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
