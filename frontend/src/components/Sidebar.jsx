import React from 'react';
import { Activity, Server, AlertTriangle, FileText, Settings, LogOut, Shield } from 'lucide-react';

/**
 * Sidebar Navigation panel for enterprise administration interface.
 * Exposes page navigation controls.
 *
 * @param {String} currentPage current active page slug
 * @param {Function} setCurrentPage callback to update active page
 * @param {Function} onLogout callback to trigger sign-out
 */
export default function Sidebar({ currentPage, setCurrentPage, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'devices', label: 'Network Devices', icon: Server },
    { id: 'alerts', label: 'Alert Center', icon: AlertTriangle },
    { id: 'reports', label: 'System Reports', icon: FileText },
    { id: 'settings', label: 'Global Settings', icon: Settings },
  ];

  return (
    <aside style={styles.sidebar}>
      {/* Brand Section */}
      <div style={styles.brand}>
        <Shield size={26} color="#8b5cf6" style={styles.brandIcon} />
        <div>
          <h1 style={styles.brandTitle}>NET-GUARD</h1>
          <p style={styles.brandSubtitle}>Infra Monitor v1.0</p>
        </div>
      </div>

      {/* Nav List */}
      <nav style={styles.navList}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              style={{
                ...styles.navButton,
                ...(isActive ? styles.navButtonActive : {}),
              }}
            >
              <Icon
                size={18}
                style={{
                  ...styles.navIcon,
                  ...(isActive ? styles.navIconActive : {}),
                }}
              />
              <span style={isActive ? styles.navTextActive : {}}>{item.label}</span>
              {isActive && <div style={styles.activeIndicator} />}
            </button>
          );
        })}
      </nav>

      {/* User Area & Logout */}
      <div style={styles.footer}>
        <button onClick={onLogout} style={styles.logoutButton}>
          <LogOut size={16} />
          <span>Disconnect Session</span>
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '260px',
    backgroundColor: '#090c13',
    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    padding: '24px 0',
    flexShrink: 0,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 24px',
    marginBottom: '40px',
    gap: '12px',
  },
  brandIcon: {
    filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.5))',
  },
  brandTitle: {
    fontSize: '18px',
    fontWeight: '800',
    letterSpacing: '0.08em',
    color: '#ffffff',
    margin: 0,
  },
  brandSubtitle: {
    fontSize: '10px',
    color: '#6b7280',
    margin: 0,
    fontWeight: '600',
    letterSpacing: '0.04em',
  },
  navList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '0 12px',
    flex: 1,
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: '#9ca3af',
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'left',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s ease',
    gap: '12px',
  },
  navButtonActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    color: '#ffffff',
  },
  navIcon: {
    color: '#6b7280',
    transition: 'all 0.2s ease',
  },
  navIconActive: {
    color: '#6366f1',
    filter: 'drop-shadow(0 0 6px rgba(99, 102, 241, 0.6))',
  },
  navTextActive: {
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: '25%',
    height: '50%',
    width: '3px',
    backgroundColor: '#6366f1',
    borderRadius: '0 4px 4px 0',
    boxShadow: '0 0 8px #6366f1, 0 0 15px #6366f1',
  },
  footer: {
    padding: '0 12px',
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(239, 68, 68, 0.04)',
    border: '1px solid rgba(239, 68, 68, 0.1)',
    borderRadius: '8px',
    color: '#f87171',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    gap: '10px',
    transition: 'all 0.2s ease',
  },
};
