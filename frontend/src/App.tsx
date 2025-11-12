import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Warehouses from './pages/Warehouses';
import Products from './pages/Products';
import Customers from './pages/Customers';
import CashRegisters from './pages/CashRegisters';
import StockMovements from './pages/StockMovements';
import CashMovements from './pages/CashMovements';
import './App.css';

function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/warehouses', label: 'Magazzini' },
    { path: '/products', label: 'Prodotti' },
    { path: '/customers', label: 'Clienti' },
    { path: '/cash-registers', label: 'Casse' },
    { path: '/stock-movements', label: 'Mov. Merce' },
    { path: '/cash-movements', label: 'Mov. Denaro' },
  ];

  return (
    <nav className="app-nav">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={location.pathname === item.path ? 'active' : ''}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>Gestione Magazzino e Casse</h1>
        </header>
        <Navigation />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/warehouses" element={<Warehouses />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/cash-registers" element={<CashRegisters />} />
            <Route path="/stock-movements" element={<StockMovements />} />
            <Route path="/cash-movements" element={<CashMovements />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

