import { useEffect, useState } from 'react';
import api from '../services/api';
import { Product } from '../types';
import { useToast, ConfirmDialog } from '../components';

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', sku: '', price: '0' });
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; productId: string | null }>({
    isOpen: false,
    productId: null,
  });

  const { showToast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
      showToast('Errore nel caricamento dei prodotti', 'error');
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
      const wasEditing = !!editing;
      setShowModal(false);
      setEditing(null);
      setFormData({ name: '', description: '', sku: '', price: '0' });
      showToast(
        wasEditing ? 'Prodotto modificato con successo' : 'Prodotto creato con successo',
        'success'
      );
      loadProducts();
    } catch (error: any) {
      console.error('Error saving product:', error);
      showToast(error.response?.data?.error || 'Errore nel salvataggio del prodotto', 'error');
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

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ isOpen: true, productId: id });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.productId) return;
    try {
      await api.delete(`/products/${deleteConfirm.productId}`);
      showToast('Prodotto eliminato con successo', 'success');
      setDeleteConfirm({ isOpen: false, productId: null });
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast('Errore nell\'eliminazione del prodotto', 'error');
      setDeleteConfirm({ isOpen: false, productId: null });
    }
  };

  const openNewModal = () => {
    setEditing(null);
    setFormData({ name: '', description: '', sku: '', price: '0' });
    setShowModal(true);
  };

  return (
    <div className="registro-page">
      <div className="page-breadcrumb">
        <span className="breadcrumb-item">Registro</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-item active">Prodotti</span>
      </div>
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-title">
            <span className="page-header-icon">🛍️</span>
            <h2>Prodotti</h2>
            <span className="page-header-badge">Anagrafica</span>
          </div>
          <p className="page-header-description">
            Gestione anagrafica prodotti. Le interazioni con i clienti sono gestite nella sezione Movimenti.
          </p>
        </div>
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
                  <button className="btn btn-danger" onClick={() => handleDeleteClick(product.id)}>
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

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, productId: null })}
        onConfirm={handleDeleteConfirm}
        title="Elimina Prodotto"
        message="Sei sicuro di voler eliminare questo prodotto? Questa azione non può essere annullata."
        confirmText="Elimina"
        cancelText="Annulla"
        variant="danger"
      />
    </div>
  );
}

export default Products;

