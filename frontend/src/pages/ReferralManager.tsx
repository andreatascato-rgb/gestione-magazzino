import { useEffect, useState } from 'react';
import api from '../services/api';
import { Customer } from '../types';
import { useToast, LoadingSpinner } from '../components';
import './ReferralManager.css';

// Colori standard per i referral - coerenti con lo stile del gestionale
// Tutti i colori sono diversi tra loro e ben distinguibili
const REFERRAL_COLORS = [
  { name: 'Blu', value: '#0284c7' }, // accent-600 - Sky Blue
  { name: 'Verde', value: '#16a34a' }, // success-600 - Green
  { name: 'Viola', value: '#8b5cf6' }, // Purple-500
  { name: 'Rosa', value: '#ec4899' }, // Pink-500
  { name: 'Arancione', value: '#f97316' }, // Orange-500
  { name: 'Ciano', value: '#0891b2' }, // Cyan-600
  { name: 'Indaco', value: '#4f46e5' }, // Indigo-600
  { name: 'Emeraldo', value: '#10b981' }, // Emerald-500
  { name: 'Rosso', value: '#ef4444' }, // Red-500
  { name: 'Giallo', value: '#eab308' }, // Yellow-500
];

function ReferralManager() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error loading customers:', error);
      showToast('Errore nel caricamento dei clienti', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReferral = async (customerId: string, isReferral: boolean) => {
    setSaving(customerId);
    try {
      const customer = customers.find(c => c.id === customerId);
      await api.put(`/customers/${customerId}/referral`, {
        isReferral,
        referralColor: isReferral ? (customer?.referralColor || REFERRAL_COLORS[0].value) : null,
      });
      showToast(isReferral ? 'Cliente impostato come referral' : 'Cliente rimosso dai referral', 'success');
      await loadCustomers();
    } catch (error: any) {
      console.error('Error updating referral:', error);
      showToast(error.response?.data?.error || 'Errore nell\'aggiornamento del referral', 'error');
    } finally {
      setSaving(null);
    }
  };

  const handleColorChange = async (customerId: string, color: string) => {
    setSaving(customerId);
    try {
      await api.put(`/customers/${customerId}/referral`, {
        isReferral: true,
        referralColor: color,
      });
      showToast('Colore referral aggiornato', 'success');
      await loadCustomers();
    } catch (error: any) {
      console.error('Error updating referral color:', error);
      showToast(error.response?.data?.error || 'Errore nell\'aggiornamento del colore', 'error');
    } finally {
      setSaving(null);
    }
  };

  const referralCustomers = customers.filter(c => c.isReferral);
  const nonReferralCustomers = customers.filter(c => !c.isReferral);

  if (loading) {
    return (
      <div className="registro-page">
        <div className="page-header">
          <h2>Manager Referral</h2>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="registro-page">
      <div className="page-breadcrumb">
        <span className="breadcrumb-item">Registro</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-item active">Manager Referral</span>
      </div>
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-title">
            <span className="page-header-icon">🎨</span>
            <h2>Manager Referral</h2>
            <span className="page-header-badge">Configurazione</span>
          </div>
        </div>
      </div>

      {/* Sezione Referral Attivi */}
      {referralCustomers.length > 0 && (
        <div className="referral-section">
          <h3 className="referral-section-title">Referral Attivi ({referralCustomers.length})</h3>
          <div className="referral-grid">
            {referralCustomers.map((customer) => (
              <div key={customer.id} className="referral-card">
                <div className="referral-card-header">
                  <label className="referral-checkbox">
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={(e) => handleToggleReferral(customer.id, e.target.checked)}
                      disabled={saving === customer.id}
                    />
                    <span className="referral-checkbox-label">{customer.name}</span>
                  </label>
                </div>
                <div className="referral-card-body">
                  <div className="referral-color-selector">
                    <label>Colore:</label>
                    <div className="referral-color-options">
                      {REFERRAL_COLORS.map((color) => (
                        <button
                          key={color.value}
                          className={`referral-color-btn ${customer.referralColor === color.value ? 'active' : ''}`}
                          style={{
                            backgroundColor: color.value,
                            boxShadow: customer.referralColor === color.value 
                              ? `0 0 0 3px rgba(255, 255, 255, 0.3), 0 0 0 6px ${color.value}40`
                              : undefined,
                          }}
                          onClick={() => handleColorChange(customer.id, color.value)}
                          disabled={saving === customer.id}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                  {saving === customer.id && (
                    <div className="referral-saving">
                      <LoadingSpinner size="sm" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sezione Altri Clienti */}
      <div className="referral-section">
        <h3 className="referral-section-title">Altri Clienti ({nonReferralCustomers.length})</h3>
        <div className="referral-grid">
          {nonReferralCustomers.length === 0 ? (
            <p className="referral-empty">Tutti i clienti sono referral</p>
          ) : (
            nonReferralCustomers.map((customer) => (
              <div key={customer.id} className="referral-card">
                <div className="referral-card-header">
                  <label className="referral-checkbox">
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={(e) => handleToggleReferral(customer.id, e.target.checked)}
                      disabled={saving === customer.id}
                    />
                    <span className="referral-checkbox-label">{customer.name}</span>
                  </label>
                </div>
                {saving === customer.id && (
                  <div className="referral-saving">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ReferralManager;
