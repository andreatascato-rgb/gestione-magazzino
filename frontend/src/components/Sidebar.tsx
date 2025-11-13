import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

interface NavItemWithSubmenu extends NavItem {
  submenu?: NavItem[];
}

const navItems: NavItemWithSubmenu[] = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/analysis', label: 'Analisi', icon: '📈' },
  { path: '/movements', label: 'Movimenti', icon: '🔄' },
  { path: '/warehouses', label: 'Magazzini', icon: '📦' },
  { path: '/cash-registers', label: 'Casse', icon: '💰' },
  {
    path: '/registro',
    label: 'Registro',
    icon: '📋',
    submenu: [
      { path: '/products', label: 'Prodotti', icon: '🛍️' },
      { path: '/customers', label: 'Clienti', icon: '👥' },
    ],
  },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [forceCollapsed, setForceCollapsed] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  // Collassa la sidebar quando cambia la sezione
  useEffect(() => {
    setForceCollapsed(true);
    // Rimuovi lo stato forzato dopo un breve delay per permettere l'animazione
    const timer = setTimeout(() => {
      setForceCollapsed(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Chiudi submenu quando la sidebar è collassata
  useEffect(() => {
    if (forceCollapsed) {
      setOpenSubmenu(null);
    }
  }, [forceCollapsed]);

  // Apri automaticamente il submenu se una delle sue voci è attiva
  useEffect(() => {
    const activeItem = navItems.find(item => 
      item.submenu && item.submenu.some(sub => location.pathname === sub.path)
    );
    if (activeItem && activeItem.submenu) {
      setOpenSubmenu(activeItem.path);
    }
  }, [location.pathname]);

  const handleLinkClick = () => {
    setForceCollapsed(true);
    setOpenSubmenu(null);
  };

  const handleMouseLeave = () => {
    setForceCollapsed(false);
  };

  const handleSubmenuToggle = (path: string) => {
    setOpenSubmenu(openSubmenu === path ? null : path);
  };

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
            const isActive = location.pathname === item.path || 
              (item.submenu && item.submenu.some(sub => location.pathname === sub.path));
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isSubmenuOpen = openSubmenu === item.path;

            return (
              <div key={item.path} className="sidebar-nav-group">
                {hasSubmenu ? (
                  <>
                    <button
                      className={`sidebar-nav-item ${isActive ? 'active' : ''} ${hasSubmenu ? 'has-submenu' : ''}`}
                      title={item.label}
                      onClick={() => handleSubmenuToggle(item.path)}
                      onMouseEnter={() => {
                        if (!forceCollapsed) {
                          setOpenSubmenu(item.path);
                        }
                      }}
                    >
                      <span className="sidebar-nav-icon">{item.icon}</span>
                      <span className="sidebar-nav-label">{item.label}</span>
                      {hasSubmenu && (
                        <span className={`sidebar-nav-arrow ${isSubmenuOpen ? 'open' : ''}`}>▼</span>
                      )}
                    </button>
                    {hasSubmenu && item.submenu && (
                      <div className={`sidebar-submenu ${isSubmenuOpen ? 'open' : ''}`}>
                        {item.submenu.map((subItem) => {
                          const isSubActive = location.pathname === subItem.path;
                          return (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              className={`sidebar-nav-item sidebar-submenu-item ${isSubActive ? 'active' : ''}`}
                              title={subItem.label}
                              onClick={handleLinkClick}
                            >
                              <span className="sidebar-nav-icon">{subItem.icon}</span>
                              <span className="sidebar-nav-label">{subItem.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.path}
                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                    title={item.label}
                    onClick={handleLinkClick}
                  >
                    <span className="sidebar-nav-icon">{item.icon}</span>
                    <span className="sidebar-nav-label">{item.label}</span>
                  </Link>
                )}
              </div>
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
