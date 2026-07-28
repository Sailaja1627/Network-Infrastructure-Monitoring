import React, { useState } from 'react';
import { ShieldAlert, Eye, EyeOff, Lock, User } from 'lucide-react';

/**
 * Login page component simulating user access portal.
 * Features neon borders and input validations.
 *
 * @param {Function} onLogin authentication callback
 */
export default function Login({ onLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Operator username is required');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    setLoading(true);

    // Simulate checking credentials (admin / admin123 is the default)
    setTimeout(() => {
      setLoading(false);
      if (username === 'admin' && password === 'admin123') {
        onLogin({ username, role: 'SecOps Administrator' });
      } else {
        setError('Access Denied: Invalid Security Credentials');
      }
    }, 800);
  };

  return (
    <div style={styles.container}>
      <div className="glass-card" style={styles.card}>
        {/* Shield Logo */}
        <div style={styles.header}>
          <div style={styles.logoBadge}>
            <ShieldAlert size={36} color="#8b5cf6" style={styles.logoIcon} />
          </div>
          <h2 style={styles.title}>GATEWAY ACCESS</h2>
          <p style={styles.subtitle}>Secured Network Monitoring Interface</p>
        </div>

        {error && (
          <div style={styles.errorAlert}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Operator ID */}
          <div style={styles.formGroup}>
            <label style={styles.label}>OPERATOR USERNAME</label>
            <div style={styles.inputWrapper}>
              <User size={16} style={styles.inputIcon} />
              <input
                type="text"
                placeholder="Enter operator username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
                className="cyber-input"
              />
            </div>
          </div>

          {/* Key / Password */}
          <div style={styles.formGroup}>
            <label style={styles.label}>ENCRYPTED SECURITY KEY</label>
            <div style={styles.inputWrapper}>
              <Lock size={16} style={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter passcode..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                className="cyber-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} style={styles.submitBtn} className="cyber-btn">
            {loading ? 'AUTHENTICATING ENCRYPTION...' : 'INITIALIZE MONITORING'}
          </button>
        </form>

        {/* Info footer */}
        <div style={styles.footer}>
          <p>AUTHORIZED SEC-OPS PERSONNEL ONLY</p>
          <p style={styles.footerIp}>SESSION AUDIT IS ACTIVE ON LOCAL PORT</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#05070a',
    background: 'radial-gradient(circle at center, #111422 0%, #05070a 100%)',
    fontFamily: "'Outfit', sans-serif",
  },
  card: {
    width: '420px',
    padding: '40px 32px',
    textAlign: 'center',
    border: '1px solid rgba(139, 92, 246, 0.15)',
    boxShadow: '0 0 40px rgba(139, 92, 246, 0.08)',
  },
  header: {
    marginBottom: '30px',
  },
  logoBadge: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: 'rgba(139, 92, 246, 0.07)',
    border: '1px solid rgba(139, 92, 246, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px auto',
    boxShadow: '0 0 15px rgba(139, 92, 246, 0.1)',
  },
  logoIcon: {
    filter: 'drop-shadow(0 0 6px rgba(139, 92, 246, 0.6))',
  },
  title: {
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '0.06em',
    color: '#ffffff',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '12px',
    color: '#6b7280',
    margin: 0,
    fontWeight: '500',
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
    gap: '20px',
  },
  formGroup: {
    textAlign: 'left',
  },
  label: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '700',
    color: '#9ca3af',
    marginBottom: '6px',
    letterSpacing: '0.05em',
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6b7280',
  },
  input: {
    paddingLeft: '38px',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: 0,
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    marginTop: '10px',
  },
  footer: {
    marginTop: '32px',
    fontSize: '10px',
    color: '#4b5563',
    fontWeight: '700',
    letterSpacing: '0.05em',
    lineHeight: '1.6',
  },
  footerIp: {
    color: '#374151',
  },
};
