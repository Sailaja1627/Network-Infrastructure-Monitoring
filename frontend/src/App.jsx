import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import DeviceFormModal from './components/DeviceFormModal';
import { DeviceApiService, AlertApiService } from './services/api';
import { useSse } from './hooks/useSse';

/**
 * Main application dashboard coordinator.
 * Maintains global collections for devices, alerts, and time-series telemetry.
 */
export default function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal and CRUD forms states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);

  // Time-series metric histories buffer
  const [metricHistory, setMetricHistory] = useState({});

  // Web Audio Context Synthesizer
  const playAlertSound = (severity) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (severity === 'CRITICAL') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(440, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.setValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.setValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      }
    } catch (e) {
      console.warn('Audio Context silenced by browser permission rules until interaction.', e);
    }
  };

  // Helper to initialize metric history buffers
  const initializeHistory = (devicesList) => {
    setMetricHistory((prev) => {
      const newHistory = { ...prev };
      devicesList.forEach((d) => {
        if (!newHistory[d.id]) {
          // Initialize with 10 duplicate readings of the current device status
          newHistory[d.id] = {
            cpu: Array(10).fill(d.cpuUsage || 0.0),
            memory: Array(10).fill(d.memoryUsage || 0.0),
            latency: Array(10).fill(d.latencyMs || 0.0),
            packetLoss: Array(10).fill(d.packetLoss || 0.0),
          };
        }
      });
      return newHistory;
    });
  };

  // Fetch baseline data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedDevices = await DeviceApiService.getDevices();
      const fetchedAlerts = await AlertApiService.getAlertHistory();
      
      setDevices(fetchedDevices || []);
      setAlerts(fetchedAlerts || []);
      initializeHistory(fetchedDevices || []);
    } catch (err) {
      console.error('Error fetching baseline dashboard metrics:', err);
      setError(err.message || 'Failed to establish connection to monitoring server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Live SSE listener callback mapping
  const sseEventHandlers = {
    DEVICE_ADDED: (newDevice) => {
      setDevices((prev) => {
        if (prev.some(d => d.id === newDevice.id)) return prev;
        return [...prev, newDevice];
      });
      // Initialize telemetry slots for the new node
      setMetricHistory((prev) => ({
        ...prev,
        [newDevice.id]: {
          cpu: Array(10).fill(0.0),
          memory: Array(10).fill(0.0),
          latency: Array(10).fill(0.0),
          packetLoss: Array(10).fill(0.0),
        }
      }));
    },
    DEVICE_UPDATED: (updatedDevice) => {
      setDevices((prev) => prev.map((d) => (d.id === updatedDevice.id ? updatedDevice : d)));
    },
    DEVICE_METRICS_UPDATED: (updatedDevice) => {
      setDevices((prev) => prev.map((d) => (d.id === updatedDevice.id ? updatedDevice : d)));
      
      // Update sliding history buffers (last 15 entries)
      setMetricHistory((prev) => {
        const historyForDevice = prev[updatedDevice.id] || {
          cpu: [], memory: [], latency: [], packetLoss: []
        };
        
        const appendAndShift = (arr, val) => {
          const updated = [...arr, val];
          if (updated.length > 15) {
            updated.shift();
          }
          return updated;
        };

        return {
          ...prev,
          [updatedDevice.id]: {
            cpu: appendAndShift(historyForDevice.cpu, updatedDevice.cpuUsage || 0.0),
            memory: appendAndShift(historyForDevice.memory, updatedDevice.memoryUsage || 0.0),
            latency: appendAndShift(historyForDevice.latency, updatedDevice.latencyMs || 0.0),
            packetLoss: appendAndShift(historyForDevice.packetLoss, updatedDevice.packetLoss || 0.0),
          }
        };
      });
    },
    DEVICE_DELETED: (deletedId) => {
      const idNum = Number(deletedId);
      setDevices((prev) => prev.filter((d) => d.id !== idNum));
      setMetricHistory((prev) => {
        const updated = { ...prev };
        delete updated[idNum];
        return updated;
      });
    },
    ALERT_TRIGGERED: (newAlert) => {
      setAlerts((prev) => {
        if (prev.some(a => a.id === newAlert.id)) return prev;
        return [newAlert, ...prev];
      });
      playAlertSound(newAlert.severity);
    },
    ALERT_RESOLVED: (resolvedAlert) => {
      setAlerts((prev) => prev.map((a) => (a.id === resolvedAlert.id ? resolvedAlert : a)));
    },
  };

  // Connect to live SSE feeds on auth login
  const sseStatus = useSse(sseEventHandlers);

const currentSseStatus = user ? sseStatus : 'DISCONNECTED';

  const handleLogin = (operatorSession) => {
    setUser(operatorSession);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('dashboard');
    setDevices([]);
    setAlerts([]);
    setMetricHistory({});
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await AlertApiService.resolveAlert(alertId);
      // Local state is synchronized automatically when Sse event fires,
      // but fallback updates keep state consistent if SSE drops out.
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a)));
    } catch (err) {
      alert('Failed to resolve alert ticket: ' + err.message);
    }
  };

  const handleDeleteDevice = async (id) => {
    if (window.confirm('Are you sure you want to deregister this node? This action is logged.')) {
      try {
        await DeviceApiService.deleteDevice(id);
        // local filter fallback
        setDevices((prev) => prev.filter((d) => d.id !== id));
      } catch (err) {
        alert('Deregister failed: ' + err.message);
      }
    }
  };

  // Opens modal for device registration
  const handleAddDeviceClick = () => {
    setEditingDevice(null);
    setIsModalOpen(true);
  };

  // Opens modal for updating configurations
  const handleEditDeviceClick = (device) => {
    setEditingDevice(device);
    setIsModalOpen(true);
  };

  // Form submission dispatcher
  const handleSaveDevice = async (deviceData) => {
    try {
      if (deviceData.id) {
        // Edit update
        await DeviceApiService.updateDevice(deviceData.id, deviceData);
      } else {
        // Create new
        await DeviceApiService.createDevice(deviceData);
      }
      setIsModalOpen(false);
      setEditingDevice(null);
      // Fetch latest list to ensure full synchronization
      fetchData();
    } catch (err) {
      alert('Error updating device settings: ' + err.message);
    }
  };

  // Render auth login gate
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const activeAlerts = alerts.filter((a) => !a.resolved);

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onLogout={handleLogout}
      />

      <div className="main-content">
        {/* Top Navbar */}
        <TopBar
          currentPage={currentPage}
          status={currentSseStatus}
          activeAlertsCount={activeAlerts.length}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onBellClick={() => setCurrentPage('alerts')}
        />

        {/* Workspace Display */}
        <main className="content-body">
          {loading ? (
            <div style={styles.centerState}>
              <div style={styles.spinner} />
              <p style={{ marginTop: '16px', color: '#6b7280', fontSize: '13px' }}>
                Establishing secure socket connection to monitoring repository...
              </p>
            </div>
          ) : error ? (
            <div className="glass-card" style={styles.errorCard}>
              <h3>⚠️ Connection Timeout</h3>
              <p style={styles.errorText}>{error}</p>
              <button onClick={fetchData} className="cyber-btn" style={styles.retryBtn}>
                Retry Handshake
              </button>
            </div>
          ) : (
            <>
              {currentPage === 'dashboard' && (
                <Dashboard
                  devices={devices}
                  activeAlerts={activeAlerts}
                  onResolveAlert={handleResolveAlert}
                  setCurrentPage={setCurrentPage}
                  metricHistory={metricHistory}
                />
              )}
              {currentPage === 'devices' && (
                <Devices
                  devices={devices}
                  searchQuery={searchQuery}
                  onAddDevice={handleAddDeviceClick}
                  onEditDevice={handleEditDeviceClick}
                  onDeleteDevice={handleDeleteDevice}
                />
              )}
              {currentPage === 'alerts' && (
                <Alerts
                  alerts={alerts}
                  onResolveAlert={handleResolveAlert}
                  onRefreshAlerts={fetchData}
                />
              )}
              {currentPage === 'reports' && (
                <Reports
                  devices={devices}
                  alerts={alerts}
                />
              )}
              {currentPage === 'settings' && (
                <Settings />
              )}
            </>
          )}
        </main>
      </div>

      {/* Overlay Create/Edit Modal Dialog */}
      <DeviceFormModal
        device={editingDevice}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingDevice(null);
        }}
        onSave={handleSaveDevice}
      />
    </div>
  );
}

const styles = {
  centerState: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid rgba(99, 102, 241, 0.1)',
    borderTop: '3px solid var(--color-primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorCard: {
    maxWidth: '500px',
    margin: '60px auto',
    padding: '30px 24px',
    textAlign: 'center',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    boxShadow: '0 0 20px rgba(239, 68, 68, 0.05)',
  },
  errorText: {
    fontSize: '13px',
    color: '#f87171',
    marginTop: '8px',
    marginBottom: '20px',
  },
  retryBtn: {
    padding: '8px 20px',
    fontSize: '13px',
  },
};
