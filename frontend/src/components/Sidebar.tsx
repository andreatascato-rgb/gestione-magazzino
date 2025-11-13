import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [forceCollapsed, setForceCollapsed] = useState(false);

  // Collassa la sidebar quando cambia la sezione
  useEffect(() => {
    setForceCollapsed(true);
    // Rimuovi lo stato forzato dopo un breve delay per permettere l'animazione
    const timer = setTimeout(() => {
      setForceCollapsed(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleLinkClick = () => {
    setForceCollapsed(true);
  };

  const handleMouseLeave = () => {
    setForceCollapsed(false);
  };

  const navItems: NavItem[] = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/warehouses', label: 'Magazzini', icon: '📦' },
    { path: '/products', label: 'Prodotti', icon: '🛍️' },
    { path: '/customers', label: 'Clienti', icon: '👥' },
    { path: '/cash-registers', label: 'Casse', icon: '💰' },
    { path: '/stock-movements', label: 'Mov. Merce', icon: '📥' },
    { path: '/cash-movements', label: 'Mov. Denaro', icon: '💸' },
  ];

  return (
    <>
      <aside 
        className={`sidebar sidebar-collapsed ${forceCollapsed ? 'force-collapsed' : ''}`}
        onMouseLeave={handleMouseLeave}
      >
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">D</div>
            <span className="sidebar-logo-text">Driplug</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                title={item.label}
                onClick={handleLinkClick}
              >
                <span className="sidebar-nav-icon">{item.icon}</span>
                <span className="sidebar-nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-content">
            <div className="sidebar-footer-text">© 2025 Driplug</div>
          </div>
        </div>
      </aside>
      <div className="sidebar-backdrop"></div>
    </>
  );
};

export default Sidebar;
