import { useEffect, useState } from 'react';
import api from '../services/api';
import { StockMovement, Product, Warehouse, MovementType } from '../types';

function StockMovements() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    warehouseId: '',
    type: 'IN' as MovementType,
    quantity: '1',
    reason: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [movementsRes, productsRes, warehousesRes] = await Promise.all([
        api.get('/stock-movements'),
        api.get('/products'),
        api.get('/warehouses'),
      ]);
      setMovements(movementsRes.data);
      setProducts(productsRes.data);
      setWarehouses(warehousesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Errore nel caricamento dei dati');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/stock-movements', formData);
      setShowModal(false);
      setFormData({
        productId: '',
        warehouseId: '',
        type: 'IN',
        quantity: '1',
        reason: '',
        date: new Date().toISOString().split('T')[0],
      });
      loadData();
    } catch (error: any) {
      console.error('Error saving movement:', error);
      alert(error.response?.data?.error || 'Errore nel salvataggio della movimentazione');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Movimentazioni Merce</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Nuova Movimentazione
        </button>
      </div>

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
            {movements.map((movement) => (
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nuova Movimentazione Merce</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Prodotto *</label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
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
                  value={formData.warehouseId}
                  onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
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
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as MovementType })}
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
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
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
                <label>Motivo</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
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

export default StockMovements;

