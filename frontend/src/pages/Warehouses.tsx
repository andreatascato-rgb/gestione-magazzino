import { useEffect, useState } from 'react';
import api from '../services/api';
import { Warehouse } from '../types';

function Warehouses() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState({ name: '', address: '' });

  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    try {
      const response = await api.get('/warehouses');
      setWarehouses(response.data);
    } catch (error) {
      console.error('Error loading warehouses:', error);
      alert('Errore nel caricamento dei magazzini');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/warehouses/${editing.id}`, formData);
      } else {
        await api.post('/warehouses', formData);
      }
      setShowModal(false);
      setEditing(null);
      setFormData({ name: '', address: '' });
      loadWarehouses();
    } catch (error) {
      console.error('Error saving warehouse:', error);
      alert('Errore nel salvataggio del magazzino');
    }
  };

  const handleEdit = (warehouse: Warehouse) => {
    setEditing(warehouse);
    setFormData({ name: warehouse.name, address: warehouse.address || '' });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo magazzino?')) return;
    try {
      await api.delete(`/warehouses/${id}`);
      loadWarehouses();
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      alert('Errore nell\'eliminazione del magazzino');
    }
  };

  const openNewModal = () => {
    setEditing(null);
    setFormData({ name: '', address: '' });
    setShowModal(true);
  };

  return (
    <div>
      <div className="page-header">
        <h2>Magazzini</h2>
        <button className="btn btn-primary" onClick={openNewModal}>
          Nuovo Magazzino
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Indirizzo</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map((warehouse) => (
              <tr key={warehouse.id}>
                <td>{warehouse.name}</td>
                <td>{warehouse.address || '-'}</td>
                <td>
                  <button className="btn btn-secondary" onClick={() => handleEdit(warehouse)}>
                    Modifica
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(warehouse.id)}>
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
              <h3>{editing ? 'Modifica Magazzino' : 'Nuovo Magazzino'}</h3>
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
                <label>Indirizzo</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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

export default Warehouses;

