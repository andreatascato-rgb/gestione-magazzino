import { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

function Home() {
  const [stats, setStats] = useState({
    warehouses: 0,
    products: 0,
    customers: 0,
    cashRegisters: 0,
  });

  useEffect(() => {
    Promise.all([
      api.get('/warehouses'),
      api.get('/products'),
      api.get('/customers'),
      api.get('/cash-registers'),
    ])
      .then(([warehouses, products, customers, cashRegisters]) => {
        setStats({
          warehouses: warehouses.data.length,
          products: products.data.length,
          customers: customers.data.length,
          cashRegisters: cashRegisters.data.length,
        });
      })
      .catch((error) => {
        console.error('Error loading stats:', error);
      });
  }, []);

  return (
    <div className="home">
      <h2>Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
        <div style={{ background: '#3498db', color: 'white', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Magazzini</h3>
          <p style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold' }}>{stats.warehouses}</p>
          <Link to="/warehouses" style={{ color: 'white', textDecoration: 'underline' }}>Gestisci →</Link>
        </div>
        <div style={{ background: '#2ecc71', color: 'white', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Prodotti</h3>
          <p style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold' }}>{stats.products}</p>
          <Link to="/products" style={{ color: 'white', textDecoration: 'underline' }}>Gestisci →</Link>
        </div>
        <div style={{ background: '#9b59b6', color: 'white', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Clienti</h3>
          <p style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold' }}>{stats.customers}</p>
          <Link to="/customers" style={{ color: 'white', textDecoration: 'underline' }}>Gestisci →</Link>
        </div>
        <div style={{ background: '#e67e22', color: 'white', padding: '1.5rem', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 0.5rem 0' }}>Casse</h3>
          <p style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold' }}>{stats.cashRegisters}</p>
          <Link to="/cash-registers" style={{ color: 'white', textDecoration: 'underline' }}>Gestisci →</Link>
        </div>
      </div>
    </div>
  );
}

export default Home;

