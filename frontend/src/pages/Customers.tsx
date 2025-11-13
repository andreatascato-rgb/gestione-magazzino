import { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { Customer } from '../types';
import { useToast, ConfirmDialog, LoadingSpinner, Badge, Dropdown } from '../components';
import type { DropdownOption } from '../components';

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
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; customerId: string | null }>({
    isOpen: false,
    customerId: null,
  });

  // Stato per ordinamento
  type SortColumn = 'name' | 'spesa' | 'ultimoDeal' | 'referredByCount' | 'createdAt' | null;
  type SortDirection = 'asc' | 'desc';
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Stati di loading
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState<string | null>(null);

  // Stati per Manager Referral
  const [showReferralManager, setShowReferralManager] = useState(false);
  const [showReferralForm, setShowReferralForm] = useState(false);
  const [referralFormData, setReferralFormData] = useState({ 
    customerId: '', 
    color: '' 
  });
  const [editingReferral, setEditingReferral] = useState<Customer | null>(null);
  const [isSavingReferral, setIsSavingReferral] = useState(false);
  const [deleteReferralConfirm, setDeleteReferralConfirm] = useState<{ isOpen: boolean; customerId: string | null }>({
    isOpen: false,
    customerId: null,
  });

  const { showToast } = useToast();

  // Colori standard per i referral
  const REFERRAL_COLORS = [
    { name: 'Blu', value: '#0284c7' },
    { name: 'Verde', value: '#16a34a' },
    { name: 'Viola', value: '#8b5cf6' },
    { name: 'Rosa', value: '#ec4899' },
    { name: 'Arancione', value: '#f97316' },
    { name: 'Ciano', value: '#0891b2' },
    { name: 'Indaco', value: '#4f46e5' },
    { name: 'Emeraldo', value: '#10b981' },
    { name: 'Rosso', value: '#ef4444' },
    { name: 'Giallo', value: '#eab308' },
  ];

  // Helper per convertire hex in rgba
  const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Helper per ottenere lo stile del badge referral
  const getReferralBadgeStyle = (color: string) => {
    const bgStart = hexToRgba(color, 0.15);
    const bgEnd = hexToRgba(color, 0.08);
    const border = hexToRgba(color, 0.4);
    const shadow = hexToRgba(color, 0.25);
    
    return {
      background: `linear-gradient(135deg, ${bgStart} 0%, ${bgEnd} 100%)`,
      borderColor: border,
      color: color,
      boxShadow: `0 2px 8px ${shadow}`,
    };
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
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
        referredByCount: customer.referredByCount || 0,
        attivo: customer.attivo !== undefined ? customer.attivo : true,
        isReferral: customer.isReferral || false,
        referralColor: customer.referralColor || undefined,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      }));
      console.log('Formatted customers:', formattedCustomers);
      setCustomers(formattedCustomers);
    } catch (error) {
      console.error('Error loading customers:', error);
      showToast('Errore nel caricamento dei clienti', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
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
      const wasEditing = !!editing;
      setShowModal(false);
      setEditing(null);
      setFormData({ name: '', referralId: '' });
      showToast(
        wasEditing ? 'Cliente modificato con successo' : 'Cliente creato con successo',
        'success'
      );
      await loadCustomers();
    } catch (error: any) {
      console.error('Error saving customer:', error);
      showToast(
        error.response?.data?.error || 'Errore nel salvataggio del cliente',
        'error'
      );
    } finally {
      setIsSaving(false);
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

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ isOpen: true, customerId: id });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.customerId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/customers/${deleteConfirm.customerId}`);
      showToast('Cliente eliminato con successo', 'success');
      setDeleteConfirm({ isOpen: false, customerId: null });
      await loadCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      showToast('Errore nell\'eliminazione del cliente', 'error');
      setDeleteConfirm({ isOpen: false, customerId: null });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleAttivo = async (id: string, attivo: boolean) => {
    setIsToggling(id);
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
      showToast(
        attivo ? 'Cliente attivato con successo' : 'Cliente disattivato con successo',
        'success'
      );
      await loadCustomers();
    } catch (error: any) {
      console.error('Error toggling attivo:', error);
      showToast(
        error.response?.data?.error || 'Errore nell\'aggiornamento dello stato',
        'error'
      );
      // Ripristina lo stato precedente in caso di errore
      await loadCustomers();
    } finally {
      setIsToggling(null);
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

  // Opzioni per il dropdown Stato
  const statoOptions: DropdownOption[] = [
    { value: 'all', label: 'Tutti' },
    { value: 'attivo', label: 'Solo Attivi' },
    { value: 'inattivo', label: 'Solo Inattivi' },
  ];

  // Opzioni per il dropdown Referral (filtro)
  const referralOptions: DropdownOption[] = useMemo(() => {
    const options: DropdownOption[] = [{ value: 'all', label: 'Tutti' }];
    allReferrals.forEach((referral) => {
      options.push({
        value: referral.id,
        label: referral.name,
      });
    });
    return options;
  }, [allReferrals]);

  // Opzioni per il dropdown Referral (form)
  const formReferralOptions: DropdownOption[] = useMemo(() => {
    const options: DropdownOption[] = [{ value: '', label: 'Nessuno' }];
    availableReferrals.forEach((customer) => {
      options.push({
        value: customer.id,
        label: customer.name,
      });
    });
    // Se stiamo modificando un cliente e ha un referral che non è nella lista (perché escluso),
    // aggiungiamolo comunque alle opzioni per poterlo visualizzare
    if (editing && editing.referralId && editing.referral) {
      const referralExists = options.some(opt => opt.value === editing.referralId);
      if (!referralExists) {
        options.push({
          value: editing.referralId,
          label: editing.referral.name,
        });
      }
    }
    return options;
  }, [availableReferrals, editing]);

  // Lista dei clienti disponibili per diventare referral (escludendo quelli già referral)
  const customersForReferral: DropdownOption[] = useMemo(() => {
    return customers
      .filter(c => !c.isReferral)
      .map(c => ({
        value: c.id,
        label: c.name,
      }));
  }, [customers]);

  // Lista dei referral esistenti
  const existingReferrals = useMemo(() => {
    return customers.filter(c => c.isReferral);
  }, [customers]);

  // Gestione Referral Manager
  const handleReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralFormData.customerId || !referralFormData.color) {
      showToast('Seleziona un cliente e un colore', 'error');
      return;
    }

    setIsSavingReferral(true);
    try {
      await api.put(`/customers/${referralFormData.customerId}/referral`, {
        isReferral: true,
        referralColor: referralFormData.color,
      });
      showToast(editingReferral ? 'Referral modificato con successo' : 'Referral creato con successo', 'success');
      setShowReferralForm(false);
      setReferralFormData({ customerId: '', color: REFERRAL_COLORS[0].value });
      setEditingReferral(null);
      await loadCustomers();
    } catch (error: any) {
      console.error('Error saving referral:', error);
      showToast(error.response?.data?.error || 'Errore nel salvataggio del referral', 'error');
    } finally {
      setIsSavingReferral(false);
    }
  };

  const handleEditReferral = (referral: Customer) => {
    setEditingReferral(referral);
    setReferralFormData({
      customerId: referral.id,
      color: referral.referralColor || REFERRAL_COLORS[0].value,
    });
    setShowReferralForm(true);
  };

  const handleDeleteReferralConfirm = async () => {
    if (!deleteReferralConfirm.customerId) return;
    try {
      await api.put(`/customers/${deleteReferralConfirm.customerId}/referral`, {
        isReferral: false,
        referralColor: null,
      });
      showToast('Referral eliminato con successo', 'success');
      setDeleteReferralConfirm({ isOpen: false, customerId: null });
      await loadCustomers();
    } catch (error: any) {
      console.error('Error deleting referral:', error);
      showToast(error.response?.data?.error || 'Errore nell\'eliminazione del referral', 'error');
      setDeleteReferralConfirm({ isOpen: false, customerId: null });
    }
  };

  const openNewReferralForm = () => {
    setEditingReferral(null);
    setReferralFormData({ customerId: '', color: REFERRAL_COLORS[0].value });
    setShowReferralForm(true);
  };

  const openReferralManager = () => {
    setShowReferralManager(true);
    setShowReferralForm(false);
    setEditingReferral(null);
    setReferralFormData({ customerId: '', color: REFERRAL_COLORS[0].value });
  };

  const closeReferralManager = () => {
    setShowReferralManager(false);
    setShowReferralForm(false);
    setEditingReferral(null);
    setReferralFormData({ customerId: '', color: REFERRAL_COLORS[0].value });
  };

  // Funzione per gestire il click sulle intestazioni delle colonne
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Se clicco sulla stessa colonna, cambio direzione
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Se clicco su una colonna diversa, imposto quella come colonna di ordinamento
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Funzione di filtraggio e ordinamento
  const filteredAndSortedCustomers = useMemo(() => {
    // Prima filtro
    let filtered = customers.filter(customer => {
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

    // Poi ordino
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortColumn) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'spesa':
            aValue = a.spesa || 0;
            bValue = b.spesa || 0;
            break;
          case 'ultimoDeal':
            aValue = a.ultimoDeal ? new Date(a.ultimoDeal).getTime() : 0;
            bValue = b.ultimoDeal ? new Date(b.ultimoDeal).getTime() : 0;
            break;
          case 'referredByCount':
            aValue = a.referredByCount || 0;
            bValue = b.referredByCount || 0;
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          default:
            return 0;
        }

        if (aValue < bValue) {
          return sortDirection === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [customers, searchName, filterAttivo, filterReferral, sortColumn, sortDirection]);

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

  // Mostra loading spinner durante caricamento iniziale
  if (loading) {
    return (
      <div className="registro-page">
        <div className="loading-state">
          <LoadingSpinner size="lg" />
          <p>Caricamento clienti...</p>
        </div>
      </div>
    );
  }

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
        </div>
        <div className="page-header-actions">
          <button 
            className="btn btn-referral" 
            onClick={openReferralManager}
            disabled={loading}
          >
            Referral
          </button>
          <button 
            className="btn btn-primary" 
            onClick={openNewModal}
            disabled={loading}
          >
            Nuovo Cliente
          </button>
        </div>
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
              <Dropdown
                value={filterAttivo}
                onChange={(value) => setFilterAttivo(value as 'all' | 'attivo' | 'inattivo')}
                options={statoOptions}
                placeholder="Seleziona stato"
              />
            </div>

            <div className="filter-group-inline">
              <label>Referral</label>
              <Dropdown
                value={filterReferral}
                onChange={(value) => setFilterReferral(value)}
                options={referralOptions}
                placeholder="Seleziona referral"
                searchable={true}
                searchPlaceholder="Cerca referral..."
              />
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
              <strong>{filteredAndSortedCustomers.length}</strong> {filteredAndSortedCustomers.length === 1 ? 'cliente trovato' : 'clienti trovati'} 
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
              <th className="col-id" title="Identificativo univoco del cliente">ID</th>
              <th 
                className={`col-nome sortable ${sortColumn === 'name' ? 'sorted' : ''}`}
                onClick={() => handleSort('name')}
                title="Clicca per ordinare per nome del cliente"
              >
                Nome
              </th>
              <th 
                className={`col-spesa sortable ${sortColumn === 'spesa' ? 'sorted' : ''}`}
                onClick={() => handleSort('spesa')}
                title="Clicca per ordinare per spesa totale del cliente"
              >
                Spesa
              </th>
              <th 
                className={`col-deal sortable ${sortColumn === 'ultimoDeal' ? 'sorted' : ''}`}
                onClick={() => handleSort('ultimoDeal')}
                title="Clicca per ordinare per data ultimo deal del cliente"
              >
                Ultimo Deal
              </th>
              <th className="col-referral" title="Cliente che ha referito questo cliente">Referral</th>
              <th 
                className={`col-referiti sortable ${sortColumn === 'referredByCount' ? 'sorted' : ''}`}
                onClick={() => handleSort('referredByCount')}
                title="Clicca per ordinare per numero di clienti referiti"
              >
                Referenti
              </th>
              <th className="col-attivo" title="Stato attivo/inattivo del cliente">Attivo</th>
              <th className="col-azioni" title="Azioni disponibili: modifica o elimina cliente">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={8} className="table-empty-state">
                  Nessun cliente trovato
                </td>
              </tr>
            ) : filteredAndSortedCustomers.length === 0 ? (
              <tr>
                <td colSpan={8} className="table-empty-state">
                  Nessun risultato per i filtri selezionati
                </td>
              </tr>
            ) : (
              filteredAndSortedCustomers.map((customer) => {
                // Trova il referral completo nella lista per ottenere isReferral e referralColor
                const referralCustomer = customer.referralId 
                  ? customers.find(c => c.id === customer.referralId)
                  : null;
                
                return (
                <tr key={customer.id}>
                  <td className="col-id" title={`ID Cliente: ${customer.id}`}>{customer.id}</td>
                  <td className="col-nome">
                    {customer.isReferral && customer.referralColor ? (
                      <span 
                        className="referral-badge customer-name-badge"
                        style={getReferralBadgeStyle(customer.referralColor)}
                      >
                        {customer.name.toUpperCase()}
                      </span>
                    ) : (
                      <span 
                        className="customer-name-badge"
                        style={getReferralBadgeStyle('#ffffff')}
                      >
                        {customer.name.toUpperCase()}
                      </span>
                    )}
                  </td>
                  <td 
                    className="col-spesa" 
                    title={`Spesa totale: ${formatCurrency(customer.spesa || 0)}`}
                  >
                    {formatCurrency(customer.spesa || 0)}
                  </td>
                  <td 
                    className="col-deal" 
                    title={customer.ultimoDeal ? `Ultimo deal: ${formatDate(customer.ultimoDeal)}` : 'Nessun deal registrato'}
                  >
                    {formatDate(customer.ultimoDeal)}
                  </td>
                  <td className="col-referral">
                    {customer.referral ? (
                      referralCustomer && referralCustomer.isReferral && referralCustomer.referralColor ? (
                        <span 
                          className="referral-badge"
                          style={getReferralBadgeStyle(referralCustomer.referralColor)}
                        >
                          {customer.referral.name.toUpperCase()}
                        </span>
                      ) : (
                        <span 
                          className="referral-badge"
                          style={getReferralBadgeStyle('#0284c7')}
                        >
                          {customer.referral.name.toUpperCase()}
                        </span>
                      )
                    ) : (
                      '-'
                    )}
                  </td>
                  <td 
                    className="col-referiti"
                    title={customer.referredByCount && customer.referredByCount > 0 ? `${customer.referredByCount} ${customer.referredByCount === 1 ? 'cliente referito' : 'clienti referiti'}` : 'Nessun cliente referito'}
                  >
                    {customer.referredByCount && customer.referredByCount > 0 ? (
                      <Badge variant="primary" size="sm">
                        {customer.referredByCount}
                      </Badge>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="col-attivo">
                    <label className="table-toggle-switch">
                      <input
                        type="checkbox"
                        checked={customer.attivo}
                        onChange={(e) => handleToggleAttivo(customer.id, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        disabled={isToggling === customer.id || loading}
                      />
                      <span className="table-toggle-slider"></span>
                    </label>
                    {isToggling === customer.id && (
                      <LoadingSpinner size="sm" className="inline-spinner" />
                    )}
                  </td>
                  <td className="col-azioni">
                    <div className="action-buttons">
                      <button 
                        className="action-btn edit" 
                        onClick={() => handleEdit(customer)}
                        title="Modifica cliente"
                        type="button"
                        disabled={loading || isSaving || isDeleting}
                      >
                        <span className="action-btn-icon">✏️</span>
                      </button>
                      <button 
                        className="action-btn delete" 
                        onClick={() => handleDeleteClick(customer.id)}
                        title="Elimina cliente"
                        type="button"
                        disabled={loading || isSaving || isDeleting}
                      >
                        <span className="action-btn-icon">🗑️</span>
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <>
          <div className="dropdown-backdrop" onClick={() => !isSaving && setShowModal(false)} />
          <div className="modal-overlay">
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editing ? 'Modifica Cliente' : 'Nuovo Cliente'}</h3>
                <button 
                  className="close-btn" 
                  onClick={() => setShowModal(false)}
                  disabled={isSaving}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Nome *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      disabled={isSaving}
                    />
                  </div>
                  <div className="form-group">
                    <label>Referral</label>
                    <Dropdown
                      value={formData.referralId || ''}
                      onChange={(value) => setFormData({ ...formData, referralId: value })}
                      options={formReferralOptions}
                      placeholder="Seleziona referral"
                      disabled={isSaving}
                      searchable={true}
                      searchPlaceholder="Cerca referral..."
                    />
                  </div>
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setShowModal(false)}
                      disabled={isSaving}
                    >
                      Annulla
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-with-spinner"
                      disabled={isSaving}
                    >
                      {isSaving && <LoadingSpinner size="sm" />}
                      {isSaving ? 'Salvataggio...' : 'Salva'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal Manager Referral */}
      {showReferralManager && (
        <>
          <div className="dropdown-backdrop" onClick={closeReferralManager} />
          <div className="modal-overlay">
            <div className="modal referral-manager-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Manager Referral</h3>
                <button 
                  className="close-btn"
                  onClick={closeReferralManager}
                  disabled={isSavingReferral}
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body referral-manager-body">
                {/* Form Referral */}
                {showReferralForm ? (
                  <div className="referral-form-container">
                    <form onSubmit={handleReferralSubmit} className="referral-form">
                      <div className="form-group">
                        <label>Cliente</label>
                        <Dropdown
                          value={referralFormData.customerId}
                          onChange={(value) => setReferralFormData({ ...referralFormData, customerId: value })}
                          options={editingReferral 
                            ? [{ value: editingReferral.id, label: editingReferral.name }]
                            : customersForReferral
                          }
                          placeholder="Seleziona un cliente"
                          searchable={true}
                          searchPlaceholder="Cerca cliente..."
                          disabled={!!editingReferral || isSavingReferral}
                        />
                      </div>
                      <div className="form-group">
                        <label>Colore</label>
                        <div className="referral-color-selector-inline">
                          {REFERRAL_COLORS.map((color) => (
                            <button
                              key={color.value}
                              type="button"
                              className={`referral-color-btn-inline ${referralFormData.color === color.value ? 'active' : ''}`}
                              style={{
                                backgroundColor: color.value,
                                boxShadow: referralFormData.color === color.value 
                                  ? `0 0 0 3px rgba(255, 255, 255, 0.3), 0 0 0 6px ${color.value}40`
                                  : undefined,
                              }}
                              onClick={() => setReferralFormData({ ...referralFormData, color: color.value })}
                              disabled={isSavingReferral}
                              title={color.name}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="form-actions">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isSavingReferral || !referralFormData.customerId || !referralFormData.color}
                        >
                          {isSavingReferral ? <LoadingSpinner size="sm" /> : (editingReferral ? 'Salva Modifiche' : 'Crea Referral')}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            setShowReferralForm(false);
                            setReferralFormData({ customerId: '', color: REFERRAL_COLORS[0].value });
                            setEditingReferral(null);
                          }}
                          disabled={isSavingReferral}
                        >
                          Annulla
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <>
                    <div className="modal-section-header">
                      <p>
                        {existingReferrals.length > 0 
                          ? `${existingReferrals.length} ${existingReferrals.length === 1 ? 'referral configurato' : 'referral configurati'}`
                          : 'Nessun referral configurato'
                        }
                      </p>
                      <button 
                        className="btn btn-primary" 
                        onClick={openNewReferralForm}
                        disabled={loading || customersForReferral.length === 0}
                      >
                        Nuovo Referral
                      </button>
                    </div>

                    {/* Lista Referral Esistenti */}
                    {existingReferrals.length > 0 ? (
                      <div className="referral-list">
                        {existingReferrals.map((referral) => (
                          <div key={referral.id} className="referral-item">
                            <div className="referral-item-info">
                              <span 
                                className="referral-badge-preview"
                                style={getReferralBadgeStyle(referral.referralColor || REFERRAL_COLORS[0].value)}
                                title={referral.name}
                              >
                                {referral.name.toUpperCase()}
                              </span>
                            </div>
                            <div className="referral-item-actions">
                              <button
                                className="btn-icon"
                                onClick={() => handleEditReferral(referral)}
                                title="Modifica referral"
                              >
                                ✏️
                              </button>
                              <button
                                className="btn-icon"
                                onClick={() => setDeleteReferralConfirm({ isOpen: true, customerId: referral.id })}
                                title="Elimina referral"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <p>Nessun referral configurato.</p>
                        <p>
                          {customersForReferral.length === 0 
                            ? 'Tutti i clienti sono già referral'
                            : 'Clicca su "Nuovo Referral" per crearne uno'
                          }
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => !isDeleting && setDeleteConfirm({ isOpen: false, customerId: null })}
        onConfirm={handleDeleteConfirm}
        title="Elimina Cliente"
        message="Sei sicuro di voler eliminare questo cliente? Questa azione non può essere annullata."
        confirmText={isDeleting ? "Eliminazione..." : "Elimina"}
        cancelText="Annulla"
        variant="danger"
        isLoading={isDeleting}
      />

      <ConfirmDialog
        isOpen={deleteReferralConfirm.isOpen}
        onClose={() => setDeleteReferralConfirm({ isOpen: false, customerId: null })}
        onConfirm={handleDeleteReferralConfirm}
        title="Elimina Referral"
        message={`Sei sicuro di voler rimuovere "${customers.find(c => c.id === deleteReferralConfirm.customerId)?.name}" dai referral?`}
        confirmText="Elimina"
        cancelText="Annulla"
        variant="danger"
      />
    </div>
  );
}

export default Customers;
