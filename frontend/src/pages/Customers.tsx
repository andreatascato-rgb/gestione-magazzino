import { useEffect, useState } from 'react';
import api from '../services/api';
import { Customer } from '../types';

function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    spesa: '0', 
    ultimoDeal: '', 
    referralId: '', 
    attivo: true 
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await api.get('/customers');
      console.log('Customers data received:', response.data);
      // Assicurati che i dati siano nel formato corretto
      const formattedCustomers = response.data.map((customer: any) => ({
        id: customer.id,
        name: customer.name,
        spesa: typeof customer.spesa === 'number' ? customer.spesa : parseFloat(customer.spesa?.toString() || '0'),
        ultimoDeal: customer.ultimoDeal || undefined,
        referralId: customer.referralId || undefined,
        referral: customer.referral || undefined,
        attivo: customer.attivo !== undefined ? customer.attivo : true,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      }));
      console.log('Formatted customers:', formattedCustomers);
      setCustomers(formattedCustomers);
    } catch (error) {
      console.error('Error loading customers:', error);
      alert('Errore nel caricamento dei clienti');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        name: formData.name,
        spesa: formData.spesa,
        ultimoDeal: formData.ultimoDeal || null,
        referralId: formData.referralId || null,
        attivo: formData.attivo,
      };

      if (editing) {
        await api.put(`/customers/${editing.id}`, submitData);
      } else {
        await api.post('/customers', submitData);
      }
      setShowModal(false);
      setEditing(null);
      setFormData({ name: '', spesa: '0', ultimoDeal: '', referralId: '', attivo: true });
      loadCustomers();
    } catch (error: any) {
      console.error('Error saving customer:', error);
      alert(error.response?.data?.error || 'Errore nel salvataggio del cliente');
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditing(customer);
    setFormData({
      name: customer.name,
      spesa: customer.spesa.toString(),
      ultimoDeal: customer.ultimoDeal ? new Date(customer.ultimoDeal).toISOString().split('T')[0] : '',
      referralId: customer.referralId || '',
      attivo: customer.attivo,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo cliente?')) return;
    try {
      await api.delete(`/customers/${id}`);
      loadCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Errore nell\'eliminazione del cliente');
    }
  };

  const openNewModal = () => {
    setEditing(null);
    setFormData({ name: '', spesa: '0', ultimoDeal: '', referralId: '', attivo: true });
    setShowModal(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  // Filtra i clienti disponibili per referral (esclude il cliente corrente se in modifica)
  const availableReferrals = customers.filter(c => 
    !editing || c.id !== editing.id
  );

  return (
    <div className="registro-page">
      <div className="page-breadcrumb">
        <span className="breadcrumb-item">Registro</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-item active">Clienti</span>
      </div>
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-title">
            <span className="page-header-icon">👥</span>
            <h2>Clienti</h2>
            <span className="page-header-badge">Anagrafica</span>
          </div>
          <p className="page-header-description">
            Gestione anagrafica clienti. Le interazioni con i prodotti sono gestite nella sezione Movimenti.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openNewModal}>
          Nuovo Cliente
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th className="col-spesa">Spesa</th>
              <th className="col-deal">Ultimo Deal</th>
              <th>Referral</th>
              <th className="col-attivo">Attivo</th>
              <th className="col-azioni">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
                  Nessun cliente trovato
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.id}</td>
                  <td>{customer.name}</td>
                  <td className="col-spesa">{formatCurrency(customer.spesa || 0)}</td>
                  <td className="col-deal">{formatDate(customer.ultimoDeal)}</td>
                  <td>{customer.referral?.name || '-'}</td>
                  <td className="col-attivo">
                    <span style={{ 
                      color: customer.attivo ? '#4CAF50' : '#999',
                      fontWeight: '500'
                    }}>
                      {customer.attivo ? 'ON' : 'OFF'}
                    </span>
                  </td>
                  <td className="col-azioni">
                    <div className="action-buttons">
                      <button 
                        className="action-btn edit" 
                        onClick={() => handleEdit(customer)}
                        title="Modifica"
                        type="button"
                      >
                        <span className="action-btn-icon">✏️</span>
                      </button>
                      <button 
                        className="action-btn delete" 
                        onClick={() => handleDelete(customer.id)}
                        title="Elimina"
                        type="button"
                      >
                        <span className="action-btn-icon">🗑️</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Modifica Cliente' : 'Nuovo Cliente'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Spesa (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.spesa}
                  onChange={(e) => setFormData({ ...formData, spesa: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Ultimo Deal</label>
                <input
                  type="date"
                  value={formData.ultimoDeal}
                  onChange={(e) => setFormData({ ...formData, ultimoDeal: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Referral</label>
                <select
                  value={formData.referralId}
                  onChange={(e) => setFormData({ ...formData, referralId: e.target.value })}
                >
                  <option value="">Nessuno</option>
                  {availableReferrals.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.id} - {customer.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Attivo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                  <label className="toggle-switch" style={{ margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={formData.attivo}
                      onChange={(e) => setFormData({ ...formData, attivo: e.target.checked })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                    {formData.attivo ? 'Attivo' : 'Inattivo'}
                  </span>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Annulla
                </button>
                <button type="submit" className="btn btn-primary">
                  Salva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
