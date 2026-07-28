import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Devices configuration and listing interface.
 * Implements filters, searching, and table pagination.
 *
 * @param {Array} devices list of network devices
 * @param {String} searchQuery search keyword
 * @param {Function} onAddDevice callback to trigger add modal
 * @param {Function} onEditDevice callback to trigger edit modal
 * @param {Function} onDeleteDevice callback to trigger delete API
 */
export default function Devices({
  devices,
  searchQuery,
  onAddDevice,
  onEditDevice,
  onDeleteDevice
}) {
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Pagination State
  const [pageIndex, setPageIndex] = useState(1);
  const itemsPerPage = 5;

  // Reset pagination index if filters or queries change
  useEffect(() => {
    setPageIndex(1);
  }, [typeFilter, statusFilter, searchQuery]);

  const filteredDevices = devices.filter((device) => {
    // Search filter
    const matchesSearch = searchQuery.trim() === '' || 
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.ipAddress.includes(searchQuery) ||
      device.status.toLowerCase().includes(searchQuery.toLowerCase());

    // Type filter
    const matchesType = typeFilter === 'ALL' || device.type === typeFilter;

    // Status filter
    const matchesStatus = statusFilter === 'ALL' || device.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate slices
  const totalItems = filteredDevices.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (pageIndex - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedDevices = filteredDevices.slice(startIndex, endIndex);

  const getStatusClass = (status) => {
    switch (status) {
      case 'ONLINE': return 'status-badge online';
      case 'WARNING': return 'status-badge warning';
      case 'OFFLINE':
      default: return 'status-badge offline';
    }
  };

  return (
    <div style={styles.container}>
      {/* Filters & Add Bar */}
      <div style={styles.header}>
        <div style={styles.filtersContainer}>
          <div style={styles.filterGroup}>
            <SlidersHorizontal size={14} color="#6b7280" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={styles.select}
            >
              <option value="ALL">All Categories</option>
              <option value="ROUTER">Routers</option>
              <option value="SWITCH">Switches</option>
              <option value="FIREWALL">Firewalls</option>
              <option value="SERVER">Servers</option>
              <option value="WIRELESS_AP">Wireless APs</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.select}
            >
              <option value="ALL">All Statuses</option>
              <option value="ONLINE">Online Only</option>
              <option value="WARNING">Warning Only</option>
              <option value="OFFLINE">Offline Only</option>
            </select>
          </div>
        </div>

        <button onClick={onAddDevice} style={styles.addBtn} className="cyber-btn">
          <Plus size={16} />
          <span>Register New Device</span>
        </button>
      </div>

      {/* Grid listing */}
      {totalItems === 0 ? (
        <div className="glass-card" style={styles.emptyState}>
          <h3>No Network Devices Found</h3>
          <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>
            Try modifying filters, clearing search parameters, or registering a new node.
          </p>
        </div>
      ) : (
        <div style={styles.tableWrapper}>
          <div className="glass-card" style={styles.tableCard}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.th}>DEVICE NAME</th>
                  <th style={styles.th}>IP ADDRESS</th>
                  <th style={styles.th}>TYPE</th>
                  <th style={styles.th}>STATUS</th>
                  <th style={styles.th}>CPU</th>
                  <th style={styles.th}>MEMORY</th>
                  <th style={styles.th}>PING LATENCY</th>
                  <th style={styles.th}>LOSS</th>
                  <th style={styles.th}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDevices.map((device) => (
                  <tr key={device.id} style={styles.tr}>
                    <td style={{ ...styles.td, fontWeight: '700', color: '#ffffff' }}>{device.name}</td>
                    <td style={styles.td}><code>{device.ipAddress}</code></td>
                    <td style={styles.td}><span style={styles.typeLabel}>{device.type}</span></td>
                    <td style={styles.td}>
                      <span className={getStatusClass(device.status)}>
                        <span className={`glow-dot ${device.status.toLowerCase()}`} style={{ marginRight: 0 }} />
                        {device.status}
                      </span>
                    </td>
                    <td style={{ ...styles.td, color: device.cpuUsage > 80 ? 'var(--color-critical)' : '#ffffff' }}>
                      {device.status === 'OFFLINE' ? '0.0%' : `${device.cpuUsage}%`}
                    </td>
                    <td style={{ ...styles.td, color: device.memoryUsage > 80 ? 'var(--color-critical)' : '#ffffff' }}>
                      {device.status === 'OFFLINE' ? '0.0%' : `${device.memoryUsage}%`}
                    </td>
                    <td style={styles.td}>
                      {device.status === 'OFFLINE' ? 'timeout' : `${device.latencyMs} ms`}
                    </td>
                    <td style={{ ...styles.td, color: device.packetLoss > 0 ? 'var(--color-critical)' : '#ffffff' }}>
                      {device.packetLoss}%
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button onClick={() => onEditDevice(device)} style={styles.actionBtn} title="Edit Configuration">
                          <Edit2 size={13} color="#9ca3af" />
                        </button>
                        <button onClick={() => onDeleteDevice(device.id)} style={styles.actionBtnDelete} title="Deregister Device">
                          <Trash2 size={13} color="var(--color-critical)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls Footer */}
          <div style={styles.paginationRow}>
            <span style={styles.rangeInfo}>
              Showing <strong style={{ color: '#ffffff' }}>{totalItems > 0 ? startIndex + 1 : 0}</strong> to{' '}
              <strong style={{ color: '#ffffff' }}>{endIndex}</strong> of{' '}
              <strong style={{ color: '#ffffff' }}>{totalItems}</strong> devices
            </span>

            <div style={styles.paginationButtons}>
              <button
                onClick={() => setPageIndex(prev => Math.max(1, prev - 1))}
                disabled={pageIndex === 1}
                style={{ ...styles.pageBtn, opacity: pageIndex === 1 ? 0.4 : 1, cursor: pageIndex === 1 ? 'not-allowed' : 'pointer' }}
              >
                <ChevronLeft size={16} />
                <span>Prev</span>
              </button>

              <div style={styles.pageIndicator}>
                Page <strong style={{ color: '#ffffff' }}>{pageIndex}</strong> of {totalPages}
              </div>

              <button
                onClick={() => setPageIndex(prev => Math.min(totalPages, prev + 1))}
                disabled={pageIndex === totalPages}
                style={{ ...styles.pageBtn, opacity: pageIndex === totalPages ? 0.4 : 1, cursor: pageIndex === totalPages ? 'not-allowed' : 'pointer' }}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
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
    gap: '16px',
    flexWrap: 'wrap',
  },
  filtersContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '6px',
    padding: '4px 10px',
    gap: '8px',
  },
  select: {
    background: 'transparent',
    border: 'none',
    color: '#9ca3af',
    fontSize: '13px',
    outline: 'none',
    cursor: 'pointer',
  },
  addBtn: {
    padding: '8px 16px',
    fontSize: '13px',
  },
  emptyState: {
    padding: '60px 40px',
    textAlign: 'center',
    border: '1px dashed rgba(255, 255, 255, 0.05)',
  },
  tableWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  tableCard: {
    overflowX: 'auto',
    border: '1px solid rgba(255, 255, 255, 0.04)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeaderRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  th: {
    padding: '16px 20px',
    fontSize: '10px',
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    transition: 'background-color 0.15s ease',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.01)',
    },
  },
  td: {
    padding: '14px 20px',
    fontSize: '13px',
    color: '#d1d5db',
    verticalAlign: 'middle',
  },
  typeLabel: {
    fontSize: '11px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    padding: '2px 6px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    color: '#a5b4fc',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  actionBtn: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '4px',
    padding: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
    },
  },
  actionBtnDelete: {
    background: 'rgba(239, 68, 68, 0.02)',
    border: '1px solid rgba(239, 68, 68, 0.05)',
    borderRadius: '4px',
    padding: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
    ':hover': {
      backgroundColor: 'rgba(239, 68, 68, 0.08)',
      borderColor: 'rgba(239, 68, 68, 0.2)',
    },
  },
  paginationRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    padding: '0 4px',
  },
  rangeInfo: {
    fontSize: '12px',
    color: '#6b7280',
  },
  paginationButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  pageBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '6px',
    padding: '6px 12px',
    color: '#9ca3af',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: '#ffffff',
    },
  },
  pageIndicator: {
    fontSize: '12px',
    color: '#6b7280',
  },
};
