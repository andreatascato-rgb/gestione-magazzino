import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Analysis from './pages/Analysis';
import Movements from './pages/Movements';
import Warehouses from './pages/Warehouses';
import Products from './pages/Products';
import Customers from './pages/Customers';
import CashRegisters from './pages/CashRegisters';
import './components/Table.css';
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
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/movements" element={<Movements />} />
            <Route path="/warehouses" element={<Warehouses />} />
            <Route path="/cash-registers" element={<CashRegisters />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
          </Routes>
        </main>
        </div>
      </div>
    </Router>
  );
}

export default App;

