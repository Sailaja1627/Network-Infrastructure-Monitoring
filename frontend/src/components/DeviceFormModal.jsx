import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

/**
 * Device registration and updates overlay modal.
 * Implements JSR-380 matching validators on the client side.
 *
 * @param {Object} device target device when editing, null when creating
 * @param {Boolean} isOpen modal visible toggle
 * @param {Function} onClose modal close trigger
 * @param {Function} onSave save submit handler (args: deviceData)
 */
export default function DeviceFormModal({ device, isOpen, onClose, onSave }) {
  const [name, setName] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [type, setType] = useState('SERVER');
  const [error, setError] = useState('');

  useEffect(() => {
    if (device) {
      setName(device.name);
      setIpAddress(device.ipAddress);
      setType(device.type);
    } else {
      setName('');
      setIpAddress('');
      setType('SERVER');
    }
    setError('');
  }, [device, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Basic Validations matching JPA constraints
    if (!name.trim() || name.length < 2 || name.length > 100) {
      setError('Device name must be between 2 and 100 characters');
      return;
    }

    const ipPattern = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\\.?\b){4}$/;
    // Javascript regex string parse note: backslash escaping
    const jsIpPattern = /^((25[0-5]|(2[0-4]|1\d|[1-9]|\d?)\d)\.){3}(25[0-5]|(2[0-4]|1\d|[1-9]|\d?)\d)$/;
    if (!jsIpPattern.test(ipAddress.trim())) {
      setError('Invalid IP address. Must be a valid IPv4 address (e.g. 192.168.1.1)');
      return;
    }

    onSave({
      id: device ? device.id : null,
      name: name.trim(),
      ipAddress: ipAddress.trim(),
      type: type,
    });
  };

  return (
    <div style={styles.overlay}>
      <div className="glass-card" style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <h3 style={styles.title}>{device ? 'EDIT DEVICE CONFIG' : 'REGISTER NEW INFRA NODE'}</h3>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={18} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.errorAlert}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>DEVICE IDENTIFIER NAME</label>
            <input
              type="text"
              placeholder="e.g. Database Server Primary"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="cyber-input"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>IPv4 NETWORK IP ADDRESS</label>
            <input
              type="text"
              placeholder="e.g. 192.168.1.60"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              className="cyber-input"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>HARDWARE NODE CLASSIFICATION</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={styles.select}
            >
              <option value="SERVER">Server Host (Database/Web)</option>
              <option value="ROUTER">Gateway Router</option>
              <option value="SWITCH">Core Switch Hub</option>
              <option value="FIREWALL">Security Firewall</option>
              <option value="WIRELESS_AP">Wireless Access Point</option>
            </select>
          </div>

          {/* Action Row */}
          <div style={styles.actionRow}>
            <button type="button" onClick={onClose} className="cyber-btn btn-secondary" style={styles.btn}>
              Cancel
            </button>
            <button type="submit" className="cyber-btn" style={styles.btn}>
              <Save size={14} />
              <span>{device ? 'Apply Configuration' : 'Register Node'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 7, 12, 0.85)',
    backdropFilter: 'blur(4px)',
    zIndex: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  modal: {
    width: '100%',
    maxWidth: '450px',
    padding: '30px 24px',
    border: '1px solid rgba(139, 92, 246, 0.15)',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(139, 92, 246, 0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '12px',
  },
  title: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '0.06em',
    margin: 0,
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: 0,
    ':hover': {
      color: '#ffffff',
    },
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '6px',
    padding: '10px 14px',
    color: '#f87171',
    fontSize: '13px',
    textAlign: 'left',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    textAlign: 'left',
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
  actionRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '12px',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '18px',
  },
  btn: {
    padding: '8px 16px',
    fontSize: '12px',
  },
};
