import { useEffect, useState } from 'react';
import api from '../services/api';
import { CashRegister } from '../types';

function CashRegisters() {
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CashRegister | null>(null);
  const [formData, setFormData] = useState({ name: '', initialBalance: '0' });

  useEffect(() => {
    loadCashRegisters();
  }, []);

  const loadCashRegisters = async () => {
    try {
      const response = await api.get('/cash-registers');
      setCashRegisters(response.data);
    } catch (error) {
      console.error('Error loading cash registers:', error);
      alert('Errore nel caricamento delle casse');
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
      setShowModal(false);
      setEditing(null);
      setFormData({ name: '', initialBalance: '0' });
      loadCashRegisters();
    } catch (error) {
      console.error('Error saving cash register:', error);
      alert('Errore nel salvataggio della cassa');
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

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa cassa?')) return;
    try {
      await api.delete(`/cash-registers/${id}`);
      loadCashRegisters();
    } catch (error) {
      console.error('Error deleting cash register:', error);
      alert('Errore nell\'eliminazione della cassa');
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
                  <button className="btn btn-danger" onClick={() => handleDelete(cashRegister.id)}>
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
    </div>
  );
}

export default CashRegisters;

