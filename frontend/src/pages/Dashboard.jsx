import React, { useState, useEffect } from 'react';
import { Server, CheckCircle, XCircle, AlertOctagon, Cpu, Database, Activity, Wifi, ShieldAlert } from 'lucide-react';
import TopologyMap from '../components/TopologyMap';
import MetricChart from '../components/MetricChart';

/**
 * Dashboard command center.
 * Renders spatial topology, stats cards, and real-time detailed performance panels.
 */
export default function Dashboard({ devices, activeAlerts, onResolveAlert, setCurrentPage, metricHistory }) {
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Synchronize selected device telemetry details if the list changes
  useEffect(() => {
    if (selectedDevice) {
      const current = devices.find(d => d.id === selectedDevice.id);
      if (current) {
        setSelectedDevice(current);
      }
    } else if (devices.length > 0) {
      // Default selection to first device (e.g. Gateway Router) on load
      const router = devices.find(d => d.type === 'ROUTER') || devices[0];
      setSelectedDevice(router);
    }
  }, [devices]);

  // Aggregate metrics dynamically
  const totalCount = devices.length;
  const onlineCount = devices.filter(d => d.status === 'ONLINE').length;
  const warningCount = devices.filter(d => d.status === 'WARNING').length;
  const offlineCount = devices.filter(d => d.status === 'OFFLINE').length;
  const activeAlertsCount = activeAlerts.length;
  const criticalAlertsCount = activeAlerts.filter(a => a.severity === 'CRITICAL').length;

  const avgCpu = totalCount > 0
    ? Math.round(devices.reduce((acc, d) => acc + (d.cpuUsage || 0), 0) / totalCount)
    : 0;

  const avgMemory = totalCount > 0
    ? Math.round(devices.reduce((acc, d) => acc + (d.memoryUsage || 0), 0) / totalCount)
    : 0;

  // Health Score: (% online) * 0.7 + (% warning) * 0.3
  const healthScore = totalCount > 0
    ? Math.round(((onlineCount / totalCount) * 100) + ((warningCount / totalCount) * 40))
    : 100;

  const getHealthColor = (score) => {
    if (score > 80) return 'var(--color-online)';
    if (score > 50) return 'var(--color-warning)';
    return 'var(--color-critical)';
  };

  const statCards = [
    { label: 'Total Nodes', value: totalCount, icon: Server, color: '#6366f1' },
    { label: 'Nodes Online', value: onlineCount, icon: CheckCircle, color: 'var(--color-online)' },
    { label: 'Nodes Offline', value: offlineCount, icon: XCircle, color: 'var(--color-critical)' },
    { label: 'Active Alerts', value: activeAlertsCount, icon: AlertOctagon, color: activeAlertsCount > 0 ? 'var(--color-warning)' : '#6b7280' },
    { label: 'Critical Alarms', value: criticalAlertsCount, icon: ShieldAlert, color: criticalAlertsCount > 0 ? 'var(--color-critical)' : '#6b7280' },
    { label: 'Infrastructure Health', value: `${healthScore}%`, icon: Activity, color: getHealthColor(healthScore) },
  ];

  // Helper to fetch metrics time series history
  const getHistory = (devId, metricKey) => {
    if (metricHistory && metricHistory[devId]) {
      return metricHistory[devId][metricKey];
    }
    return [0, 0, 0, 0, 0];
  };

  return (
    <div style={styles.container}>
      {/* KPI Cards Grid */}
      <div style={styles.kpiGrid}>
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass-card" style={styles.kpiCard}>
              <div style={styles.cardHeader}>
                <span style={styles.cardLabel}>{card.label}</span>
                <div style={{ ...styles.cardIconWrapper, backgroundColor: `${card.color}10`, borderColor: `${card.color}25` }}>
                  <Icon size={16} color={card.color} />
                </div>
              </div>
              <h3 style={{ ...styles.cardValue, color: card.color }}>{card.value}</h3>
            </div>
          );
        })}
      </div>

      {/* Main Panel Grid */}
      <div style={styles.mainGrid}>
        {/* Left Column: Topology Map */}
        <div className="glass-card" style={styles.leftPanel}>
          <div style={styles.panelTitleContainer}>
            <div>
              <h4 style={styles.panelTitle}>Network Operations Grid</h4>
              <p style={styles.panelSubtitle}>Real-Time Node Connections & Routes</p>
            </div>
            <span style={styles.tag}>INTERACTIVE SVG</span>
          </div>
          
          <div style={styles.mapContainer}>
            <TopologyMap
              devices={devices}
              selectedDevice={selectedDevice}
              onSelectDevice={setSelectedDevice}
            />
          </div>
        </div>

        {/* Right Column: Selected Device Telemetry Panel */}
        <div className="glass-card" style={styles.rightPanel}>
          <div style={styles.panelTitleContainer}>
            <div>
              <h4 style={styles.panelTitle}>Device Telemetry Analyzer</h4>
              <p style={styles.panelSubtitle}>Live Signal & Hardware Telemetry</p>
            </div>
          </div>

          {selectedDevice ? (
            <div style={styles.telemetryContent}>
              {/* Selected Node Profile */}
              <div style={styles.deviceHeader}>
                <div>
                  <h4 style={styles.selectedName}>{selectedDevice.name}</h4>
                  <span style={styles.selectedIp}>IP: <code>{selectedDevice.ipAddress}</code></span>
                </div>
                <div style={styles.deviceMetaDetails}>
                  <span style={styles.typeTag}>{selectedDevice.type}</span>
                  <span style={{ 
                    ...styles.statusDotLabel, 
                    color: selectedDevice.status === 'ONLINE' ? 'var(--color-online)' : selectedDevice.status === 'WARNING' ? 'var(--color-warning)' : 'var(--color-critical)' 
                  }}>
                    <span className={`glow-dot ${selectedDevice.status.toLowerCase()}`} />
                    {selectedDevice.status}
                  </span>
                </div>
              </div>

              {/* Metric Charts Grid */}
              <div style={styles.chartsGrid}>
                <MetricChart
                  history={getHistory(selectedDevice.id, 'cpu')}
                  color="#6366f1"
                  label="CPU Utilization"
                  unit="%"
                  maxVal={100}
                />
                
                <MetricChart
                  history={getHistory(selectedDevice.id, 'memory')}
                  color="#06b6d4"
                  label="Memory Utilization"
                  unit="%"
                  maxVal={100}
                />
                
                <MetricChart
                  history={getHistory(selectedDevice.id, 'latency')}
                  color="#10b981"
                  label="Response Latency"
                  unit="ms"
                  maxVal={250}
                />
                
                <MetricChart
                  history={getHistory(selectedDevice.id, 'packetLoss')}
                  color="#ef4444"
                  label="Ping Packet Loss"
                  unit="%"
                  maxVal={100}
                />
              </div>

              {/* Status footer for device */}
              <div style={styles.deviceDetailsFooter}>
                <span style={styles.footerTime}>Telemetry Last Pulled: {new Date(selectedDevice.lastUpdated || Date.now()).toLocaleTimeString()}</span>
              </div>
            </div>
          ) : (
            <div style={styles.emptyState}>
              <Activity size={36} color="#4b5563" style={{ marginBottom: '12px' }} />
              <p>No Device Selected</p>
              <p style={{ fontSize: '11px', color: '#4b5563', marginTop: '4px' }}>Click a node on the grid topology to display analyzer metrics.</p>
            </div>
          )}
        </div>
      </div>

      {/* Latest Active Alert Banner */}
      <div className="glass-card" style={styles.alertBannerCard}>
        <div style={styles.bannerHeader}>
          <AlertOctagon size={16} color="var(--color-critical)" />
          <span style={styles.bannerTitle}>ACTIVE INCIDENT FEED</span>
        </div>
        <div style={styles.bannerBody}>
          {activeAlerts.length === 0 ? (
            <span style={{ color: 'var(--color-online)', fontSize: '13px', fontWeight: '600' }}>
              ✓ All network nodes operational. SLA threshold index at 100%.
            </span>
          ) : (
            <div style={styles.scrollingAlert}>
              <span style={{ color: 'var(--color-critical)', fontWeight: '700', marginRight: '8px' }}>
                [{activeAlerts[0].severity}]
              </span>
              <span style={{ fontWeight: '600', marginRight: '6px' }}>
                {activeAlerts[0].deviceName}:
              </span>
              <span>{activeAlerts[0].message}</span>
              <span style={styles.alertTimeTag}>
                ({new Date(activeAlerts[0].timestamp).toLocaleTimeString()})
              </span>
              <button 
                onClick={() => onResolveAlert(activeAlerts[0].id)}
                style={styles.bannerResolveBtn}
              >
                Acknowledge Ticket
              </button>
            </div>
          )}
          <button onClick={() => setCurrentPage('alerts')} style={styles.viewMoreBtn}>
            View Incident Panel
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: '16px',
  },
  kpiCard: {
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '105px',
    border: '1px solid rgba(255, 255, 255, 0.04)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '8px',
  },
  cardLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  cardIconWrapper: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    border: '1px solid transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardValue: {
    fontSize: '24px',
    fontWeight: '800',
    marginTop: '8px',
    lineHeight: '1.2',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '6fr 5fr',
    gap: '20px',
  },
  leftPanel: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    height: '430px',
  },
  rightPanel: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    height: '430px',
  },
  panelTitleContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    paddingBottom: '10px',
  },
  panelTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: 0,
  },
  panelSubtitle: {
    fontSize: '10px',
    color: '#6b7280',
    margin: '2px 0 0 0',
    fontWeight: '500',
  },
  tag: {
    fontSize: '9px',
    fontWeight: '800',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    padding: '2px 6px',
    borderRadius: '4px',
    color: '#6366f1',
  },
  mapContainer: {
    flex: 1,
    minHeight: 0, // Allows child SVG to scale inside flex correctly
  },
  telemetryContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  deviceHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    padding: '10px 14px',
    borderRadius: '6px',
    marginBottom: '14px',
  },
  selectedName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
  },
  selectedIp: {
    fontSize: '10px',
    color: '#9ca3af',
    marginTop: '2px',
    display: 'inline-block',
  },
  deviceMetaDetails: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '6px',
  },
  typeTag: {
    fontSize: '9px',
    fontFamily: 'monospace',
    color: '#8b5cf6',
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    border: '1px solid rgba(139, 92, 246, 0.15)',
    padding: '1px 5px',
    borderRadius: '4px',
    fontWeight: '700',
  },
  statusDotLabel: {
    fontSize: '11px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
  },
  deviceDetailsFooter: {
    marginTop: '12px',
    textAlign: 'left',
  },
  footerTime: {
    fontSize: '9px',
    color: '#4b5563',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7280',
    fontSize: '13px',
    fontWeight: '500',
    textAlign: 'center',
  },
  alertBannerCard: {
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    minHeight: '52px',
    border: '1px solid rgba(239, 68, 68, 0.1)',
  },
  bannerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '800',
    fontSize: '11px',
    color: 'var(--color-critical)',
    letterSpacing: '0.08em',
    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
    paddingRight: '20px',
    flexShrink: 0,
  },
  bannerTitle: {
    display: 'inline-block',
  },
  bannerBody: {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    fontSize: '13px',
    overflow: 'hidden',
  },
  scrollingAlert: {
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: '#d1d5db',
  },
  alertTimeTag: {
    color: '#6b7280',
    fontSize: '10px',
    marginLeft: '6px',
  },
  bannerResolveBtn: {
    background: 'transparent',
    border: 'none',
    color: '#8b5cf6',
    fontWeight: '700',
    fontSize: '11px',
    cursor: 'pointer',
    marginLeft: '16px',
    textDecoration: 'underline',
    flexShrink: 0,
    ':hover': {
      color: '#a78bfa',
    },
  },
  viewMoreBtn: {
    background: 'transparent',
    border: 'none',
    color: '#9ca3af',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    flexShrink: 0,
    ':hover': {
      color: '#ffffff',
    },
  },
};
