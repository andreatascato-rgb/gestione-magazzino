import { useEffect, useState } from 'react';
import api from '../services/api';
import { StockMovement, CashMovement, Product, Warehouse, CashRegister, MovementType } from '../types';
import { useToast } from '../components';

function Movements() {
  const [activeTab, setActiveTab] = useState<'stock' | 'cash'>('stock');
  
  // Stock movements state
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockFormData, setStockFormData] = useState({
    productId: '',
    warehouseId: '',
    type: 'IN' as MovementType,
    quantity: '1',
    reason: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Cash movements state
  const [cashMovements, setCashMovements] = useState<CashMovement[]>([]);
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);
  const [showCashModal, setShowCashModal] = useState(false);
  const [cashFormData, setCashFormData] = useState({
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
      const [
        stockMovementsRes,
        cashMovementsRes,
        productsRes,
        warehousesRes,
        cashRegistersRes,
      ] = await Promise.all([
        api.get('/stock-movements'),
        api.get('/cash-movements'),
        api.get('/products'),
        api.get('/warehouses'),
        api.get('/cash-registers'),
      ]);
      setStockMovements(stockMovementsRes.data);
      setCashMovements(cashMovementsRes.data);
      setProducts(productsRes.data);
      setWarehouses(warehousesRes.data);
      setCashRegisters(cashRegistersRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Errore nel caricamento dei dati', 'error');
    }
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/stock-movements', stockFormData);
      setShowStockModal(false);
      setStockFormData({
        productId: '',
        warehouseId: '',
        type: 'IN',
        quantity: '1',
        reason: '',
        date: new Date().toISOString().split('T')[0],
      });
      showToast('Movimentazione merce creata con successo', 'success');
      loadData();
    } catch (error: any) {
      console.error('Error saving movement:', error);
      showToast(error.response?.data?.error || 'Errore nel salvataggio della movimentazione', 'error');
    }
  };

  const handleCashSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/cash-movements', cashFormData);
      setShowCashModal(false);
      setCashFormData({
        cashRegisterId: '',
        type: 'IN',
        amount: '0',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
      showToast('Movimentazione denaro creata con successo', 'success');
      loadData();
    } catch (error: any) {
      console.error('Error saving movement:', error);
      showToast(error.response?.data?.error || 'Errore nel salvataggio della movimentazione', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Movimenti</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => activeTab === 'stock' ? setShowStockModal(true) : setShowCashModal(true)}
        >
          Nuova Movimentazione
        </button>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <button
          onClick={() => setActiveTab('stock')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'stock' ? 'rgba(230, 194, 0, 0.2)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'stock' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'stock' ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.6)',
            cursor: 'pointer',
            fontWeight: activeTab === 'stock' ? '600' : '400',
            transition: 'all 0.2s',
          }}
        >
          Movimenti Merce
        </button>
        <button
          onClick={() => setActiveTab('cash')}
          style={{
            padding: '0.75rem 1.5rem',
            background: activeTab === 'cash' ? 'rgba(230, 194, 0, 0.2)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'cash' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'cash' ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.6)',
            cursor: 'pointer',
            fontWeight: activeTab === 'cash' ? '600' : '400',
            transition: 'all 0.2s',
          }}
        >
          Movimenti Denaro
        </button>
      </div>

      {/* Stock Movements Tab */}
      {activeTab === 'stock' && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Prodotto</th>
                <th>Magazzino</th>
                <th>Tipo</th>
                <th>Quantità</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {stockMovements.map((movement) => (
                <tr key={movement.id}>
                  <td>{new Date(movement.date).toLocaleDateString('it-IT')}</td>
                  <td>{movement.product?.name || '-'}</td>
                  <td>{movement.warehouse?.name || '-'}</td>
                  <td>
                    <span style={{ color: movement.type === 'IN' ? '#2ecc71' : '#e74c3c' }}>
                      {movement.type === 'IN' ? 'ENTRATA' : 'USCITA'}
                    </span>
                  </td>
                  <td>{movement.quantity}</td>
                  <td>{movement.reason || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cash Movements Tab */}
      {activeTab === 'cash' && (
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
              {cashMovements.map((movement) => (
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
      )}

      {/* Stock Movement Modal */}
      {showStockModal && (
        <div className="modal-overlay" onClick={() => setShowStockModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nuova Movimentazione Merce</h3>
              <button className="close-btn" onClick={() => setShowStockModal(false)}>×</button>
            </div>
            <form onSubmit={handleStockSubmit}>
              <div className="form-group">
                <label>Prodotto *</label>
                <select
                  value={stockFormData.productId}
                  onChange={(e) => setStockFormData({ ...stockFormData, productId: e.target.value })}
                  required
                >
                  <option value="">Seleziona prodotto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Magazzino *</label>
                <select
                  value={stockFormData.warehouseId}
                  onChange={(e) => setStockFormData({ ...stockFormData, warehouseId: e.target.value })}
                  required
                >
                  <option value="">Seleziona magazzino</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Tipo *</label>
                <select
                  value={stockFormData.type}
                  onChange={(e) => setStockFormData({ ...stockFormData, type: e.target.value as MovementType })}
                  required
                >
                  <option value="IN">Entrata</option>
                  <option value="OUT">Uscita</option>
                </select>
              </div>
              <div className="form-group">
                <label>Quantità *</label>
                <input
                  type="number"
                  min="1"
                  value={stockFormData.quantity}
                  onChange={(e) => setStockFormData({ ...stockFormData, quantity: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Data</label>
                <input
                  type="date"
                  value={stockFormData.date}
                  onChange={(e) => setStockFormData({ ...stockFormData, date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Motivo</label>
                <textarea
                  value={stockFormData.reason}
                  onChange={(e) => setStockFormData({ ...stockFormData, reason: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowStockModal(false)}>
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

      {/* Cash Movement Modal */}
      {showCashModal && (
        <div className="modal-overlay" onClick={() => setShowCashModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nuova Movimentazione Denaro</h3>
              <button className="close-btn" onClick={() => setShowCashModal(false)}>×</button>
            </div>
            <form onSubmit={handleCashSubmit}>
              <div className="form-group">
                <label>Cassa *</label>
                <select
                  value={cashFormData.cashRegisterId}
                  onChange={(e) => setCashFormData({ ...cashFormData, cashRegisterId: e.target.value })}
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
                  value={cashFormData.type}
                  onChange={(e) => setCashFormData({ ...cashFormData, type: e.target.value as MovementType })}
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
                  value={cashFormData.amount}
                  onChange={(e) => setCashFormData({ ...cashFormData, amount: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Data</label>
                <input
                  type="date"
                  value={cashFormData.date}
                  onChange={(e) => setCashFormData({ ...cashFormData, date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Descrizione</label>
                <textarea
                  value={cashFormData.description}
                  onChange={(e) => setCashFormData({ ...cashFormData, description: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCashModal(false)}>
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

export default Movements;


