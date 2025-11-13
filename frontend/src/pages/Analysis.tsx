import { useEffect, useState } from 'react';
import api from '../services/api';
import { Card, LoadingSpinner } from '../components';
import { StockMovement, CashMovement, Product } from '../types';

function Analysis() {
  const [loading, setLoading] = useState(true);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [cashMovements, setCashMovements] = useState<CashMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        stockMovementsRes,
        cashMovementsRes,
        productsRes,
      ] = await Promise.all([
        api.get('/stock-movements'),
        api.get('/cash-movements'),
        api.get('/products'),
      ]);
      setStockMovements(stockMovementsRes.data);
      setCashMovements(cashMovementsRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Analisi</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <Card>
          <h3>Filtri Complessi</h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.5rem' }}>
            Sezione per filtri avanzati e incrociati su movimenti, prodotti e clienti.
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.875rem', marginTop: '1rem' }}>
            Funzionalità in sviluppo...
          </p>
        </Card>

        <Card>
          <h3>Report Visivi</h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.5rem' }}>
            Grafici e visualizzazioni per analisi dei dati.
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.875rem', marginTop: '1rem' }}>
            Funzionalità in sviluppo...
          </p>
        </Card>

        <Card>
          <h3>Statistiche</h3>
          <div style={{ marginTop: '1rem' }}>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Movimenti Merce: <strong>{stockMovements.length}</strong>
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Movimenti Denaro: <strong>{cashMovements.length}</strong>
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Prodotti: <strong>{products.length}</strong>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Analysis;

