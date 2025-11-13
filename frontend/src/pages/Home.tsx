import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Card, Button, LoadingSpinner, Table, Badge, useToast } from '../components';
import { StockMovement, CashMovement, Product } from '../types';
import './Home.css';

interface DashboardStats {
  warehouses: number;
  products: number;
  customers: number;
  cashRegisters: number;
  totalInventoryValue: number;
  lowStockProducts: number;
  recentStockMovements: StockMovement[];
  recentCashMovements: CashMovement[];
}

function Home() {
  const [stats, setStats] = useState<DashboardStats>({
    warehouses: 0,
    products: 0,
    customers: 0,
    cashRegisters: 0,
    totalInventoryValue: 0,
    lowStockProducts: 0,
    recentStockMovements: [],
    recentCashMovements: [],
  });
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [
        warehousesRes,
        productsRes,
        customersRes,
        cashRegistersRes,
        stockMovements,
        cashMovements,
      ] = await Promise.all([
        api.get('/warehouses'),
        api.get('/products'),
        api.get('/customers'),
        api.get('/cash-registers'),
        api.get('/stock-movements'),
        api.get('/cash-movements'),
      ]);

      // Calculate total inventory value
      let totalValue = 0;
      productsRes.data.forEach((product: Product) => {
        if (product.stockLevels) {
          const totalQuantity = product.stockLevels.reduce(
            (sum, level) => sum + level.quantity,
            0
          );
          totalValue += totalQuantity * product.price;
        }
      });

      // Find low stock products (quantity < 10)
      const lowStock = productsRes.data.filter((product: Product) => {
        if (!product.stockLevels || product.stockLevels.length === 0) return true;
        return product.stockLevels.some((level) => level.quantity < 10);
      });

      // Get recent movements (last 5)
      const recentStock = stockMovements.data
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
      const recentCash = cashMovements.data
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      setStats({
        warehouses: warehousesRes.data.length,
        products: productsRes.data.length,
        customers: customersRes.data.length,
        cashRegisters: cashRegistersRes.data.length,
        totalInventoryValue: totalValue,
        lowStockProducts: lowStock.length,
        recentStockMovements: recentStock,
        recentCashMovements: recentCash,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showToast('Errore nel caricamento dei dati della dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">Panoramica generale del gestionale Driplug</p>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-stats">
        <Card className="stat-card stat-card-primary" hover>
          <div className="stat-card-content">
            <div className="stat-card-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <div className="stat-card-info">
              <h3 className="stat-card-label">Magazzini</h3>
              <p className="stat-card-value">{stats.warehouses}</p>
            </div>
          </div>
          <Link to="/warehouses" className="stat-card-link">
            <Button variant="outline" size="sm">
              Gestisci →
            </Button>
          </Link>
        </Card>

        <Card className="stat-card stat-card-success" hover>
          <div className="stat-card-content">
            <div className="stat-card-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </div>
            <div className="stat-card-info">
              <h3 className="stat-card-label">Prodotti</h3>
              <p className="stat-card-value">{stats.products}</p>
            </div>
          </div>
          <Link to="/products" className="stat-card-link">
            <Button variant="outline" size="sm">
              Gestisci →
            </Button>
          </Link>
        </Card>

        <Card className="stat-card stat-card-accent" hover>
          <div className="stat-card-content">
            <div className="stat-card-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="stat-card-info">
              <h3 className="stat-card-label">Clienti</h3>
              <p className="stat-card-value">{stats.customers}</p>
            </div>
          </div>
          <Link to="/customers" className="stat-card-link">
            <Button variant="outline" size="sm">
              Gestisci →
            </Button>
          </Link>
        </Card>

        <Card className="stat-card stat-card-warning" hover>
          <div className="stat-card-content">
            <div className="stat-card-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div className="stat-card-info">
              <h3 className="stat-card-label">Casse</h3>
              <p className="stat-card-value">{stats.cashRegisters}</p>
            </div>
          </div>
          <Link to="/cash-registers" className="stat-card-link">
            <Button variant="outline" size="sm">
              Gestisci →
            </Button>
          </Link>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="dashboard-metrics">
        <Card className="metric-card" hover>
          <h3 className="metric-card-title">Valore Totale Inventario</h3>
          <p className="metric-card-value">€ {stats.totalInventoryValue.toFixed(2)}</p>
          <Link to="/products" className="metric-card-link">
            <Button variant="text" size="sm">
              Visualizza Prodotti →
            </Button>
          </Link>
        </Card>

        <Card className="metric-card" hover>
          <h3 className="metric-card-title">Prodotti in Scorta Bassa</h3>
          <p className="metric-card-value">{stats.lowStockProducts}</p>
          <Link to="/products" className="metric-card-link">
            <Button variant="text" size="sm">
              Visualizza Allarmi →
            </Button>
          </Link>
        </Card>
      </div>

      {/* Recent Movements */}
      <div className="dashboard-recent-movements">
        <Card className="recent-movements-card" padding="lg">
          <h3 className="card-title">Movimentazioni Merce Recenti</h3>
          {stats.recentStockMovements.length > 0 ? (
            <Table
              columns={[
                {
                  key: 'date',
                  header: 'Data',
                  render: (row) => new Date(row.date).toLocaleDateString('it-IT'),
                },
                {
                  key: 'product',
                  header: 'Prodotto',
                  render: (row) => row.product?.name || '-',
                },
                {
                  key: 'warehouse',
                  header: 'Magazzino',
                  render: (row) => row.warehouse?.name || '-',
                },
                {
                  key: 'type',
                  header: 'Tipo',
                  render: (row) => (
                    <Badge variant={row.type === 'IN' ? 'success' : 'error'}>
                      {row.type === 'IN' ? 'ENTRATA' : 'USCITA'}
                    </Badge>
                  ),
                },
                { key: 'quantity', header: 'Quantità' },
              ]}
              data={stats.recentStockMovements}
              keyExtractor={(movement) => movement.id}
              emptyMessage="Nessuna movimentazione merce recente"
            />
          ) : (
            <p className="empty-state-text">Nessuna movimentazione merce recente.</p>
          )}
          <div className="card-footer">
            <Link to="/stock-movements">
              <Button variant="outline">Vedi tutte le movimentazioni merce →</Button>
            </Link>
          </div>
        </Card>

        <Card className="recent-movements-card" padding="lg">
          <h3 className="card-title">Movimentazioni Denaro Recenti</h3>
          {stats.recentCashMovements.length > 0 ? (
            <Table
              columns={[
                {
                  key: 'date',
                  header: 'Data',
                  render: (row) => new Date(row.date).toLocaleDateString('it-IT'),
                },
                {
                  key: 'cashRegister',
                  header: 'Cassa',
                  render: (row) => row.cashRegister?.name || '-',
                },
                {
                  key: 'type',
                  header: 'Tipo',
                  render: (row) => (
                    <Badge variant={row.type === 'IN' ? 'success' : 'error'}>
                      {row.type === 'IN' ? 'ENTRATA' : 'USCITA'}
                    </Badge>
                  ),
                },
                {
                  key: 'amount',
                  header: 'Importo',
                  render: (row) => `€ ${row.amount.toFixed(2)}`,
                },
                {
                  key: 'description',
                  header: 'Descrizione',
                  render: (row) => row.description || '-',
                },
              ]}
              data={stats.recentCashMovements}
              keyExtractor={(movement) => movement.id}
              emptyMessage="Nessuna movimentazione denaro recente"
            />
          ) : (
            <p className="empty-state-text">Nessuna movimentazione denaro recente.</p>
          )}
          <div className="card-footer">
            <Link to="/cash-movements">
              <Button variant="outline">Vedi tutte le movimentazioni denaro →</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Home;
