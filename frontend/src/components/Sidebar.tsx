import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen: controlledIsOpen, onToggle }) => {
  const location = useLocation();
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = onToggle ? () => onToggle() : setInternalIsOpen;

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
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">D</div>
            {isOpen && <span className="sidebar-logo-text">Driplug</span>}
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                title={!isOpen ? item.label : undefined}
              >
                <span className="sidebar-nav-icon">{item.icon}</span>
                {isOpen && <span className="sidebar-nav-label">{item.label}</span>}
                {isActive && isOpen && (
                  <div className="sidebar-nav-indicator" aria-hidden="true"></div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {isOpen && (
            <div className="sidebar-footer-content">
              <div className="sidebar-footer-text">© 2025 Driplug</div>
            </div>
          )}
        </div>
      </aside>
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}
    </>
  );
};

export default Sidebar;

