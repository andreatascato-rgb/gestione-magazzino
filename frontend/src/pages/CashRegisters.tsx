import { useEffect, useState } from 'react';
import api from '../services/api';
import { CashRegister } from '../types';
import { useToast, ConfirmDialog } from '../components';

function CashRegisters() {
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CashRegister | null>(null);
  const [formData, setFormData] = useState({ name: '', initialBalance: '0' });
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; cashRegisterId: string | null }>({
    isOpen: false,
    cashRegisterId: null,
  });

  const { showToast } = useToast();

  useEffect(() => {
    loadCashRegisters();
  }, []);

  const loadCashRegisters = async () => {
    try {
      const response = await api.get('/cash-registers');
      setCashRegisters(response.data);
    } catch (error) {
      console.error('Error loading cash registers:', error);
      showToast('Errore nel caricamento delle casse', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/cash-registers/${editing.id}`, { name: formData.name });
      } else {
        await api.post('/cash-registers', formData);
      }
      const wasEditing = !!editing;
      setShowModal(false);
      setEditing(null);
      setFormData({ name: '', initialBalance: '0' });
      showToast(
        wasEditing ? 'Cassa modificata con successo' : 'Cassa creata con successo',
        'success'
      );
      loadCashRegisters();
    } catch (error: any) {
      console.error('Error saving cash register:', error);
      showToast(error.response?.data?.error || 'Errore nel salvataggio della cassa', 'error');
    }
  };

  const handleEdit = (cashRegister: CashRegister) => {
    setEditing(cashRegister);
    setFormData({
      name: cashRegister.name,
      initialBalance: cashRegister.initialBalance.toString(),
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ isOpen: true, cashRegisterId: id });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.cashRegisterId) return;
    try {
      await api.delete(`/cash-registers/${deleteConfirm.cashRegisterId}`);
      showToast('Cassa eliminata con successo', 'success');
      setDeleteConfirm({ isOpen: false, cashRegisterId: null });
      loadCashRegisters();
    } catch (error) {
      console.error('Error deleting cash register:', error);
      showToast('Errore nell\'eliminazione della cassa', 'error');
      setDeleteConfirm({ isOpen: false, cashRegisterId: null });
    }
  };

  const openNewModal = () => {
    setEditing(null);
    setFormData({ name: '', initialBalance: '0' });
    setShowModal(true);
  };

  return (
    <div>
      <div className="page-header">
        <h2>Casse</h2>
        <button className="btn btn-primary" onClick={openNewModal}>
          Nuova Cassa
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Saldo Iniziale</th>
              <th>Saldo Attuale</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {cashRegisters.map((cashRegister) => (
              <tr key={cashRegister.id}>
                <td>{cashRegister.name}</td>
                <td>€ {parseFloat(cashRegister.initialBalance.toString()).toFixed(2)}</td>
                <td>€ {parseFloat(cashRegister.currentBalance.toString()).toFixed(2)}</td>
                <td>
                  <button className="btn btn-secondary" onClick={() => handleEdit(cashRegister)}>
                    Modifica
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDeleteClick(cashRegister.id)}>
                    Elimina
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Modifica Cassa' : 'Nuova Cassa'}</h3>
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
              {!editing && (
                <div className="form-group">
                  <label>Saldo Iniziale</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.initialBalance}
                    onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                  />
                </div>
              )}
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

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, cashRegisterId: null })}
        onConfirm={handleDeleteConfirm}
        title="Elimina Cassa"
        message="Sei sicuro di voler eliminare questa cassa? Questa azione non può essere annullata."
        confirmText="Elimina"
        cancelText="Annulla"
        variant="danger"
      />
    </div>
  );
}

export default CashRegisters;

