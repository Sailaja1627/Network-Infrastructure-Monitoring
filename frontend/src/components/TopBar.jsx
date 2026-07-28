import React, { useState } from 'react';
import { Search, Bell, User, Wifi, WifiOff } from 'lucide-react';

/**
 * TopBar navigation header for application dashboards.
 * Contains page information, system search, status metrics, and alerts bell.
 *
 * @param {String} currentPage current active page slug
 * @param {String} sseStatus live SSE connection state ('CONNECTED', 'RECONNECTING', 'DISCONNECTED')
 * @param {Number} activeAlertsCount count of unresolved critical/warning notifications
 * @param {String} searchQuery filter query text
 * @param {Function} setSearchQuery filter query text updating callback
 * @param {Function} onBellClick callback when alert bell is clicked
 */
export default function TopBar({
  currentPage,
  sseStatus,
  activeAlertsCount,
  searchQuery,
  setSearchQuery,
  onBellClick
}) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const getPageTitle = (page) => {
    switch (page) {
      case 'dashboard': return 'Command Center';
      case 'devices': return 'Network Infrastructure Topology';
      case 'alerts': return 'Incident Log & Active Alerts';
      case 'reports': return 'Infrastructure Analytics & Reports';
      case 'settings': return 'Global Monitoring Settings';
      default: return 'Network Administrator';
    }
  };

  const getSseBadge = (status) => {
    switch (status) {
      case 'CONNECTED':
        return (
          <div style={{ ...styles.sseBadge, borderColor: 'rgba(16, 185, 129, 0.2)', backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>
            <span className="glow-dot online" style={{ marginRight: '6px' }} />
            <span style={{ color: '#10b981', fontSize: '11px', fontWeight: '800', letterSpacing: '0.05em' }}>STREAM LIVE</span>
          </div>
        );
      case 'RECONNECTING':
        return (
          <div style={{ ...styles.sseBadge, borderColor: 'rgba(245, 158, 11, 0.2)', backgroundColor: 'rgba(245, 158, 11, 0.05)' }}>
            <span className="glow-dot warning" style={{ marginRight: '6px' }} />
            <span style={{ color: '#f59e0b', fontSize: '11px', fontWeight: '800', letterSpacing: '0.05em' }}>RECONNECTING</span>
          </div>
        );
      case 'DISCONNECTED':
      default:
        return (
          <div style={{ ...styles.sseBadge, borderColor: 'rgba(239, 68, 68, 0.2)', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
            <span className="glow-dot offline" style={{ marginRight: '6px' }} />
            <span style={{ color: '#ef4444', fontSize: '11px', fontWeight: '800', letterSpacing: '0.05em' }}>STREAM OFFLINE</span>
          </div>
        );
    }
  };

  return (
    <header style={styles.topbar}>
      {/* Title */}
      <div>
        <h2 style={styles.title}>{getPageTitle(currentPage)}</h2>
      </div>

      {/* Center Search (Only shown on Devices or Dashboard page) */}
      {(currentPage === 'devices' || currentPage === 'dashboard') ? (
        <div style={styles.searchContainer}>
          <Search size={16} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search nodes by IP, name, status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      ) : <div style={{ flex: 1 }} />}

      {/* Right Controls */}
      <div style={styles.controls}>
        {/* SSE Stream State */}
        {getSseBadge(sseStatus)}

        {/* Notifications Bell */}
        <button onClick={onBellClick} style={styles.iconButton}>
          <Bell size={18} />
          {activeAlertsCount > 0 && (
            <span style={styles.badge}>{activeAlertsCount}</span>
          )}
        </button>

        {/* Profile Card */}
        <div style={styles.profileWrapper}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            style={styles.profileBtn}
          >
            <div style={styles.avatar}>
              <User size={16} color="#8b5cf6" />
            </div>
            <div style={styles.profileInfo}>
              <span style={styles.profileName}>SecOps Admin</span>
              <span style={styles.profileRole}>Security Analyst</span>
            </div>
          </button>
          
          {profileDropdownOpen && (
            <div style={styles.dropdown}>
              <p style={styles.dropdownHeader}>System Operator</p>
              <div style={styles.divider} />
              <div style={styles.dropdownItem}>Level 3 Credentials</div>
              <div style={styles.dropdownItem}>Terminal Console</div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const styles = {
  topbar: {
    height: '70px',
    backgroundColor: 'rgba(9, 12, 19, 0.6)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    zIndex: 99,
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
    letterSpacing: '-0.02em',
  },
  searchContainer: {
    position: 'relative',
    width: '320px',
    marginLeft: '40px',
    flex: 1,
    maxWidth: '450px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6b7280',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '8px 12px 8px 36px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '20px',
    color: '#f3f4f6',
    fontSize: '13px',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  sseBadge: {
    display: 'flex',
    alignItems: 'center',
    padding: '5px 12px',
    borderRadius: '20px',
    border: '1px solid transparent',
    transition: 'all 0.3s ease',
  },
  iconButton: {
    background: 'transparent',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: '#ffffff',
    },
  },
  badge: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '9px',
    fontWeight: '800',
    borderRadius: '10px',
    padding: '1px 5px',
    border: '2px solid #090c13',
    boxShadow: '0 0 6px rgba(239, 68, 68, 0.4)',
  },
  profileWrapper: {
    position: 'relative',
  },
  profileBtn: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '30px',
    padding: '4px 12px 4px 6px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
  },
  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(139, 92, 246, 0.2)',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  profileName: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#ffffff',
    lineHeight: '1.2',
  },
  profileRole: {
    fontSize: '10px',
    color: '#6b7280',
    lineHeight: '1.2',
  },
  dropdown: {
    position: 'absolute',
    top: '46px',
    right: '0',
    width: '160px',
    backgroundColor: '#0c0f17',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
    padding: '8px 0',
    display: 'flex',
    flexDirection: 'column',
  },
  dropdownHeader: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#6b7280',
    padding: '4px 16px',
    margin: 0,
    textTransform: 'uppercase',
  },
  divider: {
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    margin: '4px 0',
  },
  dropdownItem: {
    padding: '8px 16px',
    fontSize: '12px',
    color: '#9ca3af',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      color: '#ffffff',
    },
  },
};
