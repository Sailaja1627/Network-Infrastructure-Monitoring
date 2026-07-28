import React, { useState } from 'react';
import { Calendar, Download, CheckCircle, Info, FileText, FileSpreadsheet } from 'lucide-react';

/**
 * Analytical reporting interface for Network Operations Center.
 * Handles date filtering and mock report downloads.
 *
 * @param {Array} devices list of network devices
 * @param {Array} alerts list of alerts
 */
export default function Reports({ devices, alerts }) {
  const [startDate, setStartDate] = useState('2026-06-01');
  const [endDate, setEndDate] = useState('2026-07-10');

  const totalAlerts = alerts.length;
  const resolvedAlerts = alerts.filter(a => a.resolved).length;
  const resolutionRate = totalAlerts > 0 ? Math.round((resolvedAlerts / totalAlerts) * 100) : 100;

  // Actual CSV Generator for exporting datasets to Excel
  const exportToCsv = () => {
    const csvRows = [
      ['Monthly Availability Report', 'Generated on: ' + new Date().toLocaleString()],
      ['Start Date: ' + startDate, 'End Date: ' + endDate],
      [],
      ['Monitoring Month', 'Target Uptime', 'Actual Uptime', 'Outage Count', 'SLA Status']
    ];

    const data = [
      ['June 2026', '99.90%', '99.97%', '1 incident', 'COMPLIANT'],
      ['May 2026', '99.90%', '99.95%', '2 incidents', 'COMPLIANT'],
      ['April 2026', '99.90%', '99.88%', '5 incidents', 'NON-COMPLIANT']
    ];

    data.forEach(row => csvRows.push(row));

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + csvRows.map(e => e.map(val => `"${val}"`).join(',')).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SLA_Compliance_Report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Text-based Summary report generator representing PDF print logs
  const exportToPdfSummary = () => {
    const reportText = `===========================================================
NET-GUARD INFRASTRUCTURE OPERATIONS AUDIT REPORT
===========================================================
Report Period: ${startDate} to ${endDate}
Generated: ${new Date().toLocaleString()}
Classification: CONFIDENTIAL - SEC-OPS ONLY
-----------------------------------------------------------

SUMMARY METRICS:
- Total Monitored Nodes: ${devices.length}
- Online Status Compliance: ${devices.filter(d => d.status === 'ONLINE').length} Nodes
- Offline Nodes: ${devices.filter(d => d.status === 'OFFLINE').length} Nodes
- Unresolved Anomalies: ${alerts.filter(a => !a.resolved).length} active incidents
- SLA Compliance rate: ${resolutionRate}% Alert turnaround

MONTHLY AVAILABILITY SCORECARD:
- June 2026: 99.97% Uptime (Compliant)
- May 2026:  99.95% Uptime (Compliant)
- April 2026: 99.88% Uptime (Non-Compliant - core routing outage)

-----------------------------------------------------------
END OF AUDIT LOG
===========================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `NETGUARD_Audit_Report_${startDate}_to_${endDate}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={styles.container}>
      {/* Date Filters Header */}
      <div className="glass-card" style={styles.dateSelectorCard}>
        <div style={styles.filterTitleRow}>
          <Calendar size={16} color="#8b5cf6" />
          <span style={styles.filterTitle}>Audit Window Scope</span>
        </div>
        <div style={styles.inputsRow}>
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>START DATE</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="cyber-input"
              style={styles.dateInput}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>END DATE</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="cyber-input"
              style={styles.dateInput}
            />
          </div>

          <div style={styles.exportControls}>
            <button onClick={exportToPdfSummary} style={styles.exportBtn} className="cyber-btn">
              <FileText size={14} />
              <span>Export Audit PDF</span>
            </button>
            <button onClick={exportToCsv} style={styles.exportBtn} className="cyber-btn btn-secondary">
              <FileSpreadsheet size={14} />
              <span>Export Excel CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Row */}
      <div style={styles.grid}>
        {/* SLA Card */}
        <div className="glass-card" style={styles.card}>
          <div style={styles.cardHeader}>
            <h4 style={styles.cardTitle}>Infrastructure SLA Compliance</h4>
            <Download size={14} color="#6b7280" onClick={exportToPdfSummary} style={{ cursor: 'pointer' }} />
          </div>
          <div style={styles.slaBody}>
            <div style={styles.slaCircle}>
              <span style={styles.slaValue}>99.94%</span>
              <span style={styles.slaLabel}>UPTIME SLA</span>
            </div>
            <div style={styles.slaMeta}>
              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>Contract Target</span>
                <span style={styles.metaVal}>99.90%</span>
              </div>
              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>Current Status</span>
                <span style={{ ...styles.metaVal, color: 'var(--color-online)' }}>PASSING</span>
              </div>
            </div>
          </div>
        </div>

        {/* Turnaround Card */}
        <div className="glass-card" style={styles.card}>
          <div style={styles.cardHeader}>
            <h4 style={styles.cardTitle}>Incident Turnaround Metrics</h4>
            <Download size={14} color="#6b7280" onClick={exportToCsv} style={{ cursor: 'pointer' }} />
          </div>
          <div style={styles.slaBody}>
            <div style={{ ...styles.slaCircle, borderColor: '#6366f1' }}>
              <span style={{ ...styles.slaValue, color: '#6366f1' }}>{resolutionRate}%</span>
              <span style={styles.slaLabel}>RESOLVE RATE</span>
            </div>
            <div style={styles.slaMeta}>
              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>Logged Tickets</span>
                <span style={styles.metaVal}>{totalAlerts}</span>
              </div>
              <div style={styles.metaRow}>
                <span style={styles.metaLabel}>Resolved Tickets</span>
                <span style={styles.metaVal}>{resolvedAlerts}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SLA History Log */}
      <div className="glass-card" style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={16} color="#6366f1" />
            <h4 style={styles.tableTitle}>Monthly Infrastructure Availability</h4>
          </div>
        </div>

        <table style={styles.table}>
          <thead>
            <tr style={styles.trHead}>
              <th style={styles.th}>MONITORING MONTH</th>
              <th style={styles.th}>TARGET UPTIME</th>
              <th style={styles.th}>ACTUAL UPTIME</th>
              <th style={styles.th}>OUTAGE COUNT</th>
              <th style={styles.th}>SLA COMPLIANCE</th>
            </tr>
          </thead>
          <tbody>
            <tr style={styles.tr}>
              <td style={styles.td}>June 2026</td>
              <td style={styles.td}>99.90%</td>
              <td style={{ ...styles.td, color: 'var(--color-online)' }}>99.97%</td>
              <td style={styles.td}>1 incident</td>
              <td style={styles.td}><span style={styles.compliantTag}>COMPLIANT</span></td>
            </tr>
            <tr style={styles.tr}>
              <td style={styles.td}>May 2026</td>
              <td style={styles.td}>99.90%</td>
              <td style={{ ...styles.td, color: 'var(--color-online)' }}>99.95%</td>
              <td style={styles.td}>2 incidents</td>
              <td style={styles.td}><span style={styles.compliantTag}>COMPLIANT</span></td>
            </tr>
            <tr style={styles.tr}>
              <td style={styles.td}>April 2026</td>
              <td style={styles.td}>99.90%</td>
              <td style={{ ...styles.td, color: 'var(--color-critical)' }}>99.88%</td>
              <td style={styles.td}>5 incidents</td>
              <td style={styles.td}><span style={styles.failTag}>NON-COMPLIANT</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Info Warning */}
      <div style={styles.infoAlert}>
        <Info size={16} color="#6366f1" style={{ flexShrink: 0 }} />
        <p style={styles.infoText}>
          Availability reports compile ICMP ping telemetry and packet transit data. Custom reports can be downloaded in CSV spreadsheet format above.
        </p>
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
  dateSelectorCard: {
    padding: '16px 20px',
  },
  filterTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '14px',
  },
  filterTitle: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  inputsRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '20px',
    flexWrap: 'wrap',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  inputLabel: {
    fontSize: '9px',
    fontWeight: '800',
    color: '#6b7280',
    letterSpacing: '0.05em',
  },
  dateInput: {
    padding: '8px 12px',
    fontSize: '13px',
    width: '180px',
  },
  exportControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginLeft: 'auto',
  },
  exportBtn: {
    padding: '9px 18px',
    fontSize: '12px',
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  slaBody: {
    display: 'flex',
    alignItems: 'center',
    gap: '40px',
  },
  slaCircle: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    border: '4px solid var(--color-online)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 15px rgba(16, 185, 129, 0.1)',
    flexShrink: 0,
  },
  slaValue: {
    fontSize: '17px',
    fontWeight: '800',
    color: '#ffffff',
  },
  slaLabel: {
    fontSize: '8px',
    fontWeight: '700',
    color: '#9ca3af',
    marginTop: '2px',
  },
  slaMeta: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    paddingBottom: '4px',
  },
  metaLabel: {
    color: '#9ca3af',
  },
  metaVal: {
    fontWeight: '600',
    color: '#ffffff',
  },
  tableCard: {
    padding: '20px',
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  tableTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  trHead: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  th: {
    padding: '12px 16px',
    fontSize: '10px',
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
  },
  td: {
    padding: '14px 16px',
    fontSize: '13px',
    color: '#d1d5db',
  },
  compliantTag: {
    fontSize: '10px',
    fontWeight: '800',
    color: 'var(--color-online)',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    border: '1px solid rgba(16, 185, 129, 0.15)',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  failTag: {
    fontSize: '10px',
    fontWeight: '800',
    color: 'var(--color-critical)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  infoAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    border: '1px solid rgba(99, 102, 241, 0.15)',
    borderRadius: '6px',
    padding: '12px 16px',
  },
  infoText: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: 0,
  },
};
