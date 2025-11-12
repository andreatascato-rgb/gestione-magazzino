import { useEffect, useState } from 'react';
import api from '../services/api';
import { Customer } from '../types';

function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Error loading customers:', error);
      alert('Errore nel caricamento dei clienti');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/customers/${editing.id}`, formData);
      } else {
        await api.post('/customers', formData);
      }
      setShowModal(false);
      setEditing(null);
      setFormData({ name: '', email: '', phone: '', address: '' });
      loadCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Errore nel salvataggio del cliente');
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditing(customer);
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
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
    setFormData({ name: '', email: '', phone: '', address: '' });
    setShowModal(true);
  };

  return (
    <div>
      <div className="page-header">
        <h2>Clienti</h2>
        <button className="btn btn-primary" onClick={openNewModal}>
          Nuovo Cliente
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefono</th>
              <th>Indirizzo</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.name}</td>
                <td>{customer.email || '-'}</td>
                <td>{customer.phone || '-'}</td>
                <td>{customer.address || '-'}</td>
                <td>
                  <button className="btn btn-secondary" onClick={() => handleEdit(customer)}>
                    Modifica
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(customer.id)}>
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
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Telefono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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

export default Customers;

