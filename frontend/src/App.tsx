import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Warehouses from './pages/Warehouses';
import Products from './pages/Products';
import Customers from './pages/Customers';
import CashRegisters from './pages/CashRegisters';
import StockMovements from './pages/StockMovements';
import CashMovements from './pages/CashMovements';
import './App.css';

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="app">
        <Sidebar />
        <div className="app-content">
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
      </div>
    </Router>
  );
}

export default App;

