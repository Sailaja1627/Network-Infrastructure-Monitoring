import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Volume2, ShieldAlert } from 'lucide-react';

/**
 * Settings configuration dashboard page.
 * Stores UI state preferences like sound notification triggers and alert thresholds.
 */
export default function Settings() {
  const [cpuLimit, setCpuLimit] = useState(85);
  const [latencyLimit, setLatencyLimit] = useState(150);
  const [lossLimit, setLossLimit] = useState(5);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [pollingRate, setPollingRate] = useState(3);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSave} style={styles.form}>
        <div style={styles.grid}>
          {/* Card 1: Trigger Thresholds */}
          <div className="glass-card" style={styles.card}>
            <div style={styles.cardHeader}>
              <ShieldAlert size={16} color="#6366f1" />
              <h4 style={styles.cardTitle}>Alert Trigger Thresholds</h4>
            </div>
            
            <div style={styles.cardBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>CPU WARNING THRESHOLD (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={cpuLimit}
                  onChange={(e) => setCpuLimit(e.target.value)}
                  style={styles.input}
                  className="cyber-input"
                />
                <span style={styles.help}>Triggers a warning ticket if CPU load exceeds this level.</span>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>LATENCY WARNING LIMIT (ms)</label>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={latencyLimit}
                  onChange={(e) => setLatencyLimit(e.target.value)}
                  style={styles.input}
                  className="cyber-input"
                />
                <span style={styles.help}>Triggers a warning if ping response latency exceeds this delay.</span>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>PACKET LOSS ALERT TRIGGER (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={lossLimit}
                  onChange={(e) => setLossLimit(e.target.value)}
                  style={styles.input}
                  className="cyber-input"
                />
                <span style={styles.help}>Triggers a critical alarm ticket if loss percentage rises above this.</span>
              </div>
            </div>
          </div>

          {/* Card 2: System Telemetry Preferences */}
          <div className="glass-card" style={styles.card}>
            <div style={styles.cardHeader}>
              <SettingsIcon size={16} color="#06b6d4" />
              <h4 style={styles.cardTitle}>Telemetry Preferences</h4>
            </div>

            <div style={styles.cardBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>POLLING FREQUENCY (SECONDS)</label>
                <select
                  value={pollingRate}
                  onChange={(e) => setPollingRate(e.target.value)}
                  style={styles.select}
                >
                  <option value={1}>1 second (High Load)</option>
                  <option value={3}>3 seconds (Balanced)</option>
                  <option value={5}>5 seconds (Standard)</option>
                  <option value={10}>10 seconds (Low Power)</option>
                </select>
                <span style={styles.help}>Background poll schedule interval for network telemetry.</span>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>AUDIO SYSTEM ALARMS</label>
                <div style={styles.toggleRow}>
                  <Volume2 size={18} color={soundEnabled ? 'var(--color-online)' : '#6b7280'} />
                  <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                    {soundEnabled ? 'Sound alerts enabled on CRITICAL status change' : 'Audio alarms silenced'}
                  </span>
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    style={styles.checkbox}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>DATABASE PERSISTENCE ENGINE</label>
                <input
                  type="text"
                  value="JPA Dialect: H2 (Dialect-Independent)"
                  disabled
                  style={{ ...styles.input, opacity: 0.5, cursor: 'not-allowed' }}
                  className="cyber-input"
                />
                <span style={styles.help}>Decoupled JPA architecture enables easy switch to MySQL/Postgres in properties files.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button Row */}
        <div style={styles.footerRow}>
          {saved && <span style={styles.savedMsg}>System configuration saved successfully.</span>}
          <button type="submit" style={styles.saveBtn} className="cyber-btn">
            <Save size={16} />
            <span>Apply Config Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  card: {
    padding: '20px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    paddingBottom: '12px',
  },
  cardTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#9ca3af',
    letterSpacing: '0.04em',
  },
  input: {
    width: '100%',
  },
  select: {
    backgroundColor: 'rgba(10, 13, 22, 0.9)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '6px',
    padding: '10px 14px',
    color: '#f3f4f6',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.2s ease',
    ':focus': {
      borderColor: '#6366f1',
    },
  },
  help: {
    fontSize: '11px',
    color: '#6b7280',
    marginTop: '2px',
  },
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'rgba(5, 7, 12, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderRadius: '6px',
    padding: '12px',
  },
  checkbox: {
    marginLeft: 'auto',
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  footerRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '20px',
  },
  savedMsg: {
    fontSize: '13px',
    color: 'var(--color-online)',
    fontWeight: '600',
  },
  saveBtn: {
    padding: '10px 24px',
  },
};
