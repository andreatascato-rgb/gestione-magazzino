import { useEffect, useState } from 'react';
import api from '../services/api';
import { Product } from '../types';

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', sku: '', price: '0' });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
      alert('Errore nel caricamento dei prodotti');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, formData);
      } else {
        await api.post('/products', formData);
      }
      setShowModal(false);
      setEditing(null);
      setFormData({ name: '', description: '', sku: '', price: '0' });
      loadProducts();
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert(error.response?.data?.error || 'Errore nel salvataggio del prodotto');
    }
  };

  const handleEdit = (product: Product) => {
    setEditing(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      sku: product.sku || '',
      price: product.price.toString(),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo prodotto?')) return;
    try {
      await api.delete(`/products/${id}`);
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Errore nell\'eliminazione del prodotto');
    }
  };

  const openNewModal = () => {
    setEditing(null);
    setFormData({ name: '', description: '', sku: '', price: '0' });
    setShowModal(true);
  };

  return (
    <div>
      <div className="page-header">
        <h2>Prodotti</h2>
        <button className="btn btn-primary" onClick={openNewModal}>
          Nuovo Prodotto
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>SKU</th>
              <th>Prezzo</th>
              <th>Descrizione</th>
              <th>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.sku || '-'}</td>
                <td>€ {parseFloat(product.price.toString()).toFixed(2)}</td>
                <td>{product.description || '-'}</td>
                <td>
                  <button className="btn btn-secondary" onClick={() => handleEdit(product)}>
                    Modifica
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(product.id)}>
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
              <h3>{editing ? 'Modifica Prodotto' : 'Nuovo Prodotto'}</h3>
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
                <label>SKU</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Prezzo</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
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

export default Products;

