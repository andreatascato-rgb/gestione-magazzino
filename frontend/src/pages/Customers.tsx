import { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { Customer } from '../types';

function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    referralId: ''
  });

  // Stato per i filtri base
  const [searchName, setSearchName] = useState('');
  const [filterAttivo, setFilterAttivo] = useState<'all' | 'attivo' | 'inattivo'>('all');
  const [filterReferral, setFilterReferral] = useState<string>('all');

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
      if (editing) {
        // Per modifica: spesa e ultimoDeal non vengono inviati (vengono calcolati automaticamente dal backend)
        const submitData = {
          name: formData.name,
          referralId: formData.referralId || null,
          attivo: editing.attivo, // Mantieni stato attuale
          // spesa e ultimoDeal non vengono inviati - il backend li manterrà invariati o li ricalcolerà
        };
        await api.put(`/customers/${editing.id}`, submitData);
      } else {
        // Per nuovo cliente: spesa e ultimoDeal verranno inizializzati automaticamente dal backend
        const submitData = {
          name: formData.name,
          referralId: formData.referralId || null,
          attivo: true, // Nuovo cliente sempre attivo di default
          // spesa e ultimoDeal non vengono inviati - il backend li inizializzerà a 0 e null
        };
        await api.post('/customers', submitData);
      }
      setShowModal(false);
      setEditing(null);
      setFormData({ name: '', referralId: '' });
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
      referralId: customer.referralId || '',
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

  const handleToggleAttivo = async (id: string, attivo: boolean) => {
    try {
      const customer = customers.find(c => c.id === id);
      if (!customer) return;
      
      // Aggiorna solo lo stato attivo - spesa e ultimoDeal vengono calcolati automaticamente
      await api.put(`/customers/${id}`, {
        name: customer.name,
        referralId: customer.referralId || null,
        attivo: attivo,
        // spesa e ultimoDeal non vengono inviati - il backend li manterrà invariati
      });
      loadCustomers();
    } catch (error: any) {
      console.error('Error toggling attivo:', error);
      alert(error.response?.data?.error || 'Errore nell\'aggiornamento dello stato');
      // Ripristina lo stato precedente in caso di errore
      loadCustomers();
    }
  };

  const openNewModal = () => {
    setEditing(null);
    setFormData({ name: '', referralId: '' });
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

  // Lista di tutti i referral disponibili (per il filtro)
  const allReferrals = useMemo(() => {
    const referralMap = new Map<string, Customer>();
    customers.forEach(customer => {
      if (customer.referralId && customer.referral) {
        referralMap.set(customer.referralId, customer.referral);
      }
    });
    return Array.from(referralMap.values());
  }, [customers]);

  // Funzione di filtraggio (solo filtri base)
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      // Filtro per nome (case-insensitive, ricerca parziale)
      if (searchName.trim()) {
        const searchLower = searchName.toLowerCase().trim();
        if (!customer.name.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Filtro per stato attivo/inattivo
      if (filterAttivo !== 'all') {
        if (filterAttivo === 'attivo' && !customer.attivo) {
          return false;
        }
        if (filterAttivo === 'inattivo' && customer.attivo) {
          return false;
        }
      }

      // Filtro per referral
      if (filterReferral !== 'all') {
        if (customer.referralId !== filterReferral) {
          return false;
        }
      }

      return true;
    });
  }, [customers, searchName, filterAttivo, filterReferral]);

  // Funzioni handler per i filtri
  const handleResetFilters = () => {
    setSearchName('');
    setFilterAttivo('all');
    setFilterReferral('all');
  };

  const hasActiveFilters = useMemo(() => {
    return searchName.trim() !== '' ||
      filterAttivo !== 'all' ||
      filterReferral !== 'all';
  }, [searchName, filterAttivo, filterReferral]);

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

      {/* Pannello Filtri */}
      <div className="filters-panel">
        <div className="filters-bar">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Cerca per nome..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
          </div>
          <div className="filters-actions">
            <div className="filter-group-inline">
              <label>Stato</label>
              <select
                value={filterAttivo}
                onChange={(e) => setFilterAttivo(e.target.value as 'all' | 'attivo' | 'inattivo')}
              >
                <option value="all">Tutti</option>
                <option value="attivo">Solo Attivi</option>
                <option value="inattivo">Solo Inattivi</option>
              </select>
            </div>

            <div className="filter-group-inline">
              <label>Referral</label>
              <select
                value={filterReferral}
                onChange={(e) => setFilterReferral(e.target.value)}
              >
                <option value="all">Tutti</option>
                {allReferrals.map((referral) => (
                  <option key={referral.id} value={referral.id}>
                    {referral.id} - {referral.name}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleResetFilters}
              >
                Reset Filtri
              </button>
            )}
          </div>
        </div>

        <div className="filter-results-count">
          {hasActiveFilters ? (
            <span>
              <strong>{filteredCustomers.length}</strong> {filteredCustomers.length === 1 ? 'cliente trovato' : 'clienti trovati'} 
              {' '}su {customers.length} totali
            </span>
          ) : (
            <span>
              <strong>{customers.length}</strong> {customers.length === 1 ? 'cliente totale' : 'clienti totali'}
            </span>
          )}
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th className="col-id">ID</th>
              <th className="col-nome">Nome</th>
              <th className="col-spesa">Spesa</th>
              <th className="col-deal">Ultimo Deal</th>
              <th className="col-referral">Referral</th>
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
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
                  Nessun risultato per i filtri selezionati
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td className="col-id">{customer.id}</td>
                  <td className="col-nome">{customer.name}</td>
                  <td className="col-spesa">{formatCurrency(customer.spesa || 0)}</td>
                  <td className="col-deal">{formatDate(customer.ultimoDeal)}</td>
                  <td className="col-referral">{customer.referral?.name || '-'}</td>
                  <td className="col-attivo">
                    <label className="table-toggle-switch">
                      <input
                        type="checkbox"
                        checked={customer.attivo}
                        onChange={(e) => handleToggleAttivo(customer.id, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="table-toggle-slider"></span>
                    </label>
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
