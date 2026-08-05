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
    if (!hourlyRate || Number(hourlyRate) < 0) errors.hourly_rate_cents = 'Valid hourly rate is required';
    if (!dailyRate || Number(dailyRate) < 0) errors.daily_rate_cents = 'Valid daily rate is required';

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
      hourly_rate_cents: Math.round(Number(hourlyRate) * 100),
      daily_rate_cents: Math.round(Number(dailyRate) * 100),
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
        rate: `₹${(v.hourly_rate_cents / 100).toLocaleString('en-IN')}/hr`,
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in slide-in-from-bottom sm:zoom-in-95 duration-250">
        <div className="w-14 h-1.5 bg-slate-700/80 rounded-full mx-auto my-3 shrink-0 sm:hidden" />

        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">{t('add_new_vehicle')}</h2>
              <p className="text-xs text-slate-400">{t('add_vehicle_subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {generalError && (
            <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{generalError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 md:col-span-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('vehicle_category')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="sm:col-span-2 md:col-span-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Brand / Make (Optional)
              </label>
              <select
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                disabled={availableMakes.length === 0}
              >
                <option value="" className="bg-slate-900 text-slate-400">Select Make...</option>
                {availableMakes.map((m) => (
                  <option key={m} value={m} className="bg-slate-900 text-slate-100">
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 md:col-span-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Variety / Model (Optional)
              </label>
              <select
                value={vehicleModelId}
                onChange={(e) => setVehicleModelId(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                disabled={availableVarieties.length === 0}
              >
                <option value="" className="bg-slate-900 text-slate-400">Select Variety...</option>
                {availableVarieties.map((v) => (
                  <option key={v.id} value={v.id} className="bg-slate-900 text-slate-100">
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 md:col-span-1">
              <Input
                label={t('vehicle_name')}
                placeholder="e.g. Swaraj 744 FE Tractor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={fieldErrors.name}
                required
              />
            </div>

            <div>
              <Input
                label={t('registration_number')}
                placeholder="e.g. TN-37-AX-4821"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                error={fieldErrors.registration_number}
                required
              />
            </div>

            <div>
              <Input
                label={t('model_year')}
                type="number"
                placeholder="2024"
                value={modelYear}
                onChange={(e) => setModelYear(e.target.value)}
                error={fieldErrors.model_year}
              />
            </div>

            <div>
              <Input
                label={t('hourly_rate')}
                type="number"
                placeholder="800"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                error={fieldErrors.hourly_rate_cents}
                required
              />
            </div>

            <div>
              <Input
                label={t('daily_rate')}
                type="number"
                placeholder="6000"
                value={dailyRate}
                onChange={(e) => setDailyRate(e.target.value)}
                error={fieldErrors.daily_rate_cents}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('specifications')}
              </label>
              <textarea
                rows={2}
                placeholder='e.g. {"bucket_capacity": "1.1 cu.m", "hp": 45}'
                value={specsJson}
                onChange={(e) => setSpecsJson(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors font-mono"
              />
              {fieldErrors.specs && (
                <p className="text-[11px] font-medium text-rose-400 mt-1 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{fieldErrors.specs}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              {t('cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={loading} className="flex items-center gap-1.5">
              {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
              <span>{loading ? t('saving_vehicle') : t('save_vehicle')}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
