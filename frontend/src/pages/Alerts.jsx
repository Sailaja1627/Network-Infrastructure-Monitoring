import React, { useState } from 'react';
import { ShieldAlert, Check, RefreshCw } from 'lucide-react';

/**
 * Alerts incident command log page.
 * Manages filtering, tracking, and resolving system anomalies.
 *
 * @param {Array} alerts historical list of all generated alerts
 * @param {Function} onResolveAlert callback to acknowledge an active alert
 * @param {Function} onRefreshAlerts callback to force reload the list
 */
export default function Alerts({ alerts, onResolveAlert, onRefreshAlerts }) {
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [resolutionFilter, setResolutionFilter] = useState('UNRESOLVED');

  const filteredAlerts = alerts.filter((alert) => {
    // Severity filter
    const matchesSeverity = severityFilter === 'ALL' || alert.severity === severityFilter;
    
    // Resolution filter
    const matchesResolution = resolutionFilter === 'ALL' || 
      (resolutionFilter === 'RESOLVED' && alert.resolved) ||
      (resolutionFilter === 'UNRESOLVED' && !alert.resolved);

    return matchesSeverity && matchesResolution;
  });

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return { color: 'var(--color-critical)', bgColor: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.2)' };
      case 'WARNING':
        return { color: 'var(--color-warning)', bgColor: 'rgba(245, 158, 11, 0.08)', borderColor: 'rgba(245, 158, 11, 0.2)' };
      case 'INFO':
      default:
        return { color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.08)', borderColor: 'rgba(59, 130, 246, 0.2)' };
    }
  };

  return (
    <div style={styles.container}>
      {/* Action Header */}
      <div style={styles.header}>
        <div style={styles.filters}>
          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>SEVERITY</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              style={styles.select}
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="WARNING">Warning Only</option>
              <option value="INFO">Information Only</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <span style={styles.filterLabel}>STATUS</span>
            <select
              value={resolutionFilter}
              onChange={(e) => setResolutionFilter(e.target.value)}
              style={styles.select}
            >
              <option value="ALL">All Alerts</option>
              <option value="UNRESOLVED">Active / Unresolved</option>
              <option value="RESOLVED">Acknowledged / Resolved</option>
            </select>
          </div>
        </div>

        <button onClick={onRefreshAlerts} style={styles.refreshBtn} className="cyber-btn btn-secondary">
          <RefreshCw size={14} />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Alert Listings */}
      {filteredAlerts.length === 0 ? (
        <div className="glass-card" style={styles.emptyState}>
          <ShieldAlert size={48} color="#4b5563" style={{ marginBottom: '16px' }} />
          <h3>No Incidents Logged</h3>
          <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>
            There are no alerts matching your selected filter criteria.
          </p>
        </div>
      ) : (
        <div style={styles.list}>
          {filteredAlerts.map((alert) => {
            const stylesObj = getSeverityStyles(alert.severity);
            return (
              <div 
                key={alert.id} 
                className="glass-card" 
                style={{ 
                  ...styles.alertCard, 
                  opacity: alert.resolved ? 0.6 : 1,
                  borderLeft: `4px solid ${stylesObj.color}` 
                }}
              >
                <div style={styles.alertHeader}>
                  <div style={styles.deviceMeta}>
                    <span style={styles.deviceName}>{alert.deviceName}</span>
                    <span style={{ 
                      ...styles.severityBadge, 
                      color: stylesObj.color, 
                      backgroundColor: stylesObj.bgColor,
                      borderColor: stylesObj.borderColor 
                    }}>
                      {alert.severity}
                    </span>
                  </div>

                  <span style={styles.timestamp}>
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                </div>

                <p style={styles.message}>{alert.message}</p>

                <div style={styles.alertFooter}>
                  <span style={styles.ticketId}>TICKET ID: #NET-{alert.id}</span>
                  
                  {alert.resolved ? (
                    <div style={styles.resolvedBadge}>
                      <Check size={12} />
                      <span>Acknowledged</span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => onResolveAlert(alert.id)}
                      style={styles.ackBtn} 
                      className="cyber-btn"
                    >
                      Acknowledge & Resolve
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  filters: {
    display: 'flex',
    gap: '16px',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  filterLabel: {
    fontSize: '9px',
    fontWeight: '800',
    color: '#6b7280',
    letterSpacing: '0.05em',
  },
  select: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '6px',
    padding: '6px 12px',
    color: '#9ca3af',
    fontSize: '13px',
    outline: 'none',
    cursor: 'pointer',
  },
  refreshBtn: {
    padding: '8px 16px',
    fontSize: '13px',
  },
  emptyState: {
    padding: '60px 40px',
    textAlign: 'center',
    border: '1px dashed rgba(255, 255, 255, 0.05)',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  alertCard: {
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'all 0.2s ease',
  },
  alertHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  deviceName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#ffffff',
  },
  severityBadge: {
    fontSize: '9px',
    fontWeight: '800',
    padding: '2px 6px',
    borderRadius: '4px',
    border: '1px solid',
  },
  timestamp: {
    fontSize: '12px',
    color: '#6b7280',
  },
  message: {
    fontSize: '13px',
    color: '#d1d5db',
    lineHeight: '1.4',
  },
  alertFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(255, 255, 255, 0.03)',
    paddingTop: '12px',
  },
  ticketId: {
    fontSize: '10px',
    color: '#4b5563',
    fontWeight: '700',
    letterSpacing: '0.04em',
  },
  resolvedBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--color-online)',
    fontSize: '12px',
    fontWeight: '700',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    padding: '4px 10px',
    borderRadius: '4px',
    border: '1px solid rgba(16, 185, 129, 0.15)',
  },
  ackBtn: {
    padding: '6px 14px',
    fontSize: '11px',
    borderRadius: '4px',
    boxShadow: 'none',
  },
};
