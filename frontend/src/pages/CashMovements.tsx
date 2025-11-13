import { useEffect, useState } from 'react';
import api from '../services/api';
import { CashMovement, CashRegister, MovementType } from '../types';
import { useToast } from '../components';

function CashMovements() {
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    cashRegisterId: '',
    type: 'IN' as MovementType,
    amount: '0',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [movementsRes, cashRegistersRes] = await Promise.all([
        api.get('/cash-movements'),
        api.get('/cash-registers'),
      ]);
      setMovements(movementsRes.data);
      setCashRegisters(cashRegistersRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Errore nel caricamento dei dati', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/cash-movements', formData);
      setShowModal(false);
      setFormData({
        cashRegisterId: '',
        type: 'IN',
        amount: '0',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      loadData();
      // Ricarica anche le casse per aggiornare i saldi
      const cashRegistersRes = await api.get('/cash-registers');
      setCashRegisters(cashRegistersRes.data);
      showToast('Movimentazione creata con successo', 'success');
    } catch (error: any) {
      console.error('Error saving movement:', error);
      showToast(error.response?.data?.error || 'Errore nel salvataggio della movimentazione', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Movimentazioni Denaro</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Nuova Movimentazione
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Cassa</th>
              <th>Tipo</th>
              <th>Importo</th>
              <th>Descrizione</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((movement) => (
              <tr key={movement.id}>
                <td>{new Date(movement.date).toLocaleDateString('it-IT')}</td>
                <td>{movement.cashRegister?.name || '-'}</td>
                <td>
                  <span style={{ color: movement.type === 'IN' ? '#2ecc71' : '#e74c3c' }}>
                    {movement.type === 'IN' ? 'ENTRATA' : 'USCITA'}
                  </span>
                </td>
                <td>€ {parseFloat(movement.amount.toString()).toFixed(2)}</td>
                <td>{movement.description || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nuova Movimentazione Denaro</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Cassa *</label>
                <select
                  value={formData.cashRegisterId}
                  onChange={(e) => setFormData({ ...formData, cashRegisterId: e.target.value })}
                  required
                >
                  <option value="">Seleziona cassa</option>
                  {cashRegisters.map((cashRegister) => (
                    <option key={cashRegister.id} value={cashRegister.id}>
                      {cashRegister.name} (Saldo: € {parseFloat(cashRegister.currentBalance.toString()).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Tipo *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as MovementType })}
                  required
                >
                  <option value="IN">Entrata</option>
                  <option value="OUT">Uscita</option>
                </select>
              </div>
              <div className="form-group">
                <label>Importo *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Data</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Descrizione</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
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

export default CashMovements;

