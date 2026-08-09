import React, { useState, useEffect } from 'react';
import { X, Truck, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { apiRequest } from '../../lib/api';
import { t } from '../../lib/i18n';

export interface VehicleData {
  id: string;
  name: string;
  category: string;
  registration: string;
  status: 'active' | 'in_service' | 'on_trip' | 'inactive';
  rate: string;
  driver: string;
}

interface VehicleModelData {
  id: string;
  make: string;
  name: string;
  category: string;
}

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVehicleCreated: (newVehicle: VehicleData) => void;
}

const CATEGORY_OPTIONS = [
  { value: 'tractor', label: 'Tractor / Agri' },
  { value: 'jcb', label: 'JCB / Earthmover' },
  { value: 'heavy_vehicle', label: 'Heavy Truck / Hauler' },
  { value: 'bus', label: 'Passenger Bus' },
  { value: 'crane', label: 'Crane / Lifting' },
  { value: 'harvester', label: 'Harvester / Agri Combo' },
];

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  isOpen,
  onClose,
  onVehicleCreated,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('tractor');
  const [make, setMake] = useState('');
  const [vehicleModelId, setVehicleModelId] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [modelYear, setModelYear] = useState(new Date().getFullYear().toString());
  const [hourlyRate, setHourlyRate] = useState('800');
  const [dailyRate, setDailyRate] = useState('6000');
  const [specsJson, setSpecsJson] = useState('');

  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const [vehicleModels, setVehicleModels] = useState<VehicleModelData[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const fetchModels = async () => {
      try {
        const res = await apiRequest('/api/v1/discovery/vehicle_models');
        if (res.status === 'success' && res.data?.vehicle_models) {
          setVehicleModels(res.data.vehicle_models);
        }
      } catch (e) {
        console.error("Failed to fetch vehicle models", e);
      }
    };
    fetchModels();
  }, [isOpen]);

  // Derived state for dependent dropdowns
  const availableMakes = Array.from(new Set(
    vehicleModels.filter(m => m.category === category).map(m => m.make)
  )).sort();
  
  const availableVarieties = vehicleModels.filter(
    m => m.category === category && m.make === make
  ).sort((a, b) => a.name.localeCompare(b.name));

  // Reset dependent fields when parent changes
  useEffect(() => {
    setMake('');
    setVehicleModelId('');
  }, [category]);

  useEffect(() => {
    setVehicleModelId('');
  }, [make]);

  // Auto-fill name when variety is selected
  useEffect(() => {
    if (vehicleModelId) {
      const selectedModel = vehicleModels.find(m => m.id === vehicleModelId);
      if (selectedModel) {
        setName(selectedModel.name);
      }
    }
  }, [vehicleModelId, vehicleModels]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    // Client-side quick check
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Vehicle name is required';
    if (!registrationNumber.trim()) errors.registration_number = 'Registration number is required';
    if (!hourlyRate || Number(hourlyRate) < 0) errors.hourly_rate_paise = 'Valid hourly rate is required';
    if (!dailyRate || Number(dailyRate) < 0) errors.daily_rate_paise = 'Valid daily rate is required';

    let parsedSpecs = {};
    if (specsJson.trim()) {
      try {
        parsedSpecs = JSON.parse(specsJson);
      } catch {
        errors.specs = 'Invalid JSON format for specifications';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    const payload = {
      name: name.trim(),
      category,
      vehicle_model_id: vehicleModelId || undefined,
      registration_number: registrationNumber.trim().toUpperCase(),
      model_year: Number(modelYear) || new Date().getFullYear(),
      hourly_rate_paise: Math.round(Number(hourlyRate) * 100),
      daily_rate_paise: Math.round(Number(dailyRate) * 100),
      specs: parsedSpecs,
    };

    const res = await apiRequest('/api/v1/vehicles', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (res.status === 'success' && res.data?.vehicle) {
      const v = res.data.vehicle;
      const formattedItem: VehicleData = {
        id: v.id || v.uuid || `veh_${Date.now()}`,
        name: v.name,
        category: CATEGORY_OPTIONS.find((c) => c.value === v.category)?.label || v.category,
        registration: v.registration_number,
        status: 'active',
        rate: `₹${(v.hourly_rate_paise / 100).toLocaleString('en-IN')}/hr`,
        driver: 'Unassigned',
      };

      onVehicleCreated(formattedItem);
      onClose();
    } else if (res.error) {
      if (res.error.code === 'plan_limit_exceeded') {
        setGeneralError(t('plan_limit_reached'));
      } else if (res.error.fields) {
        const serverFieldErrors: Record<string, string> = {};
        Object.entries(res.error.fields).forEach(([k, msgs]) => {
          serverFieldErrors[k] = Array.isArray(msgs) ? msgs.join(', ') : String(msgs);
        });
        setFieldErrors(serverFieldErrors);
      } else {
        setGeneralError(res.error.message || 'Failed to create vehicle listing.');
      }
    } else {
      // Demo fallback mock creation when backend API unavailable
      const mockItem: VehicleData = {
        id: `veh_${Date.now()}`,
        name: payload.name,
        category: CATEGORY_OPTIONS.find((c) => c.value === payload.category)?.label || payload.category,
        registration: payload.registration_number,
        status: 'active',
        rate: `₹${Number(hourlyRate).toLocaleString('en-IN')}/hr`,
        driver: 'Unassigned',
      };
      onVehicleCreated(mockItem);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      style={{ background: 'rgba(5, 8, 16, 0.85)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in slide-in-from-bottom sm:zoom-in-95 duration-250"
        style={{
          background: 'var(--color-surface-raised)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px 16px 0 0',
        }}
      >
        {/* Mobile drag handle */}
        <div className="w-12 h-1 rounded-full mx-auto mt-3 mb-1 shrink-0 sm:hidden" style={{ background: 'var(--border-color)' }} />

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8' }}
            >
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold" style={{ color: 'var(--text-main)' }}>{t('add_new_vehicle')}</h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{t('add_vehicle_subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label="Close"
            className="p-1.5 rounded-lg transition-colors cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-sunken)'; e.currentTarget.style.color = 'var(--text-main)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto flex-1">

          {/* General error banner */}
          {generalError && (
            <div
              className="p-3.5 rounded-xl text-sm flex items-center gap-2.5"
              style={{ background: 'rgba(244,63,94,0.10)', border: '1px solid rgba(244,63,94,0.25)', color: 'var(--danger-color)' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          {/* ── Row 1: Category + Make ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold" style={{ color: 'var(--text-main)' }}>
                {t('vehicle_category')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 10,
                  padding: '0.5rem 0.75rem',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-main)',
                  outline: 'none',
                }}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold" style={{ color: 'var(--text-main)' }}>
                Brand / Make <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
              </label>
              <select
                value={make}
                onChange={(e) => setMake(e.target.value)}
                disabled={availableMakes.length === 0}
                style={{
                  width: '100%',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 10,
                  padding: '0.5rem 0.75rem',
                  fontSize: 'var(--text-sm)',
                  color: make ? 'var(--text-main)' : 'var(--text-muted)',
                  outline: 'none',
                  opacity: availableMakes.length === 0 ? 0.45 : 1,
                }}
              >
                <option value="">Select Make…</option>
                {availableMakes.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* ── Row 2: Variety + Vehicle Name ── */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold" style={{ color: 'var(--text-main)' }}>
                Variety / Model <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
              </label>
              <select
                value={vehicleModelId}
                onChange={(e) => setVehicleModelId(e.target.value)}
                disabled={availableVarieties.length === 0}
                style={{
                  width: '100%',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 10,
                  padding: '0.5rem 0.75rem',
                  fontSize: 'var(--text-sm)',
                  color: vehicleModelId ? 'var(--text-main)' : 'var(--text-muted)',
                  outline: 'none',
                  opacity: availableVarieties.length === 0 ? 0.45 : 1,
                }}
              >
                <option value="">Select Variety…</option>
                {availableVarieties.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            <Input
              label={t('vehicle_name')}
              placeholder="e.g. Swaraj 744 FE Tractor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={fieldErrors.name}
              required
            />

            {/* ── Row 3: Registration + Year ── */}
            <Input
              label={t('registration_number')}
              placeholder="e.g. TN-37-AX-4821"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
              error={fieldErrors.registration_number}
              required
            />

            <Input
              label={t('model_year')}
              type="number"
              placeholder="2024"
              value={modelYear}
              onChange={(e) => setModelYear(e.target.value)}
              error={fieldErrors.model_year}
            />

            {/* ── Row 4: Rates ── */}
            <div className="space-y-1.5">
              <Input
                label={`${t('hourly_rate')} (₹)`}
                type="number"
                placeholder="800"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                error={fieldErrors.hourly_rate_paise}
                required
              />
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Per hour in ₹ — converted to paise on save</p>
            </div>

            <div className="space-y-1.5">
              <Input
                label={`${t('daily_rate')} (₹)`}
                type="number"
                placeholder="6000"
                value={dailyRate}
                onChange={(e) => setDailyRate(e.target.value)}
                error={fieldErrors.daily_rate_paise}
                required
              />
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Per day in ₹ — converted to paise on save</p>
            </div>

            {/* ── Specs: full-width ── */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-semibold" style={{ color: 'var(--text-main)' }}>
                {t('specifications')} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional JSON)</span>
              </label>
              <textarea
                rows={2}
                placeholder='e.g. {"bucket_capacity": "1.1 cu.m", "hp": 45}'
                value={specsJson}
                onChange={(e) => setSpecsJson(e.target.value)}
                className="font-mono"
                style={{
                  width: '100%',
                  background: 'var(--input-bg)',
                  border: `1px solid ${fieldErrors.specs ? 'rgba(244,63,94,0.7)' : 'var(--border-color)'}`,
                  borderRadius: 10,
                  padding: '0.5rem 0.75rem',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-main)',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
              {fieldErrors.specs && (
                <p className="flex items-center gap-1.5" style={{ fontSize: 'var(--text-xs)', color: 'var(--danger-color)' }}>
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.specs}</span>
                </p>
              )}
            </div>
          </div>

          {/* ── Actions ── */}
          <div
            className="flex items-center justify-end gap-3 pt-4 mt-1"
            style={{ borderTop: '1px solid var(--border-color)' }}
          >
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {t('cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={loading} className="flex items-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
              <span>{loading ? t('saving_vehicle') : t('save_vehicle')}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
