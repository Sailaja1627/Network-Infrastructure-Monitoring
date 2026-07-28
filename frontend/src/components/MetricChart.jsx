import React from 'react';

/**
 * Custom SVG Line/Area Spline chart.
 * Renders a telemetry log history without external dependencies.
 *
 * @param {Array} history list of historical numeric values
 * @param {String} color chart stroke color (hex)
 * @param {String} label metric label name
 * @param {String} unit unit suffix (e.g. '%', 'ms')
 * @param {Number} maxVal upper bound scaling limit
 */
export default function MetricChart({ history, color, label, unit, maxVal = 100 }) {
  const width = 340;
  const height = 110;
  const padding = 10;

  // Standardize values to draw
  const data = (history && history.length > 0) ? history : [0, 0, 0, 0, 0];
  const pointsCount = data.length;

  // Scale coordinates: maps x [0, pointsCount - 1] to [padding, width - padding]
  // and y [0, maxVal] to [height - padding, padding] (inverted y-axis in SVG)
  const getX = (index) => {
    if (pointsCount <= 1) return padding;
    return padding + (index * (width - padding * 2)) / (pointsCount - 1);
  };

  const getY = (value) => {
    const val = Math.min(maxVal, Math.max(0, value));
    return height - padding - (val * (height - padding * 2)) / maxVal;
  };

  // Build SVG path
  let pathD = '';
  let areaD = '';

  if (pointsCount > 0) {
    pathD = `M ${getX(0)} ${getY(data[0])}`;
    for (let i = 1; i < pointsCount; i++) {
      pathD += ` L ${getX(i)} ${getY(data[i])}`;
    }
    
    // Close the area path to draw the color gradient under the line
    areaD = `${pathD} L ${getX(pointsCount - 1)} ${height - padding} L ${getX(0)} ${height - padding} Z`;
  }

  const latestVal = data[data.length - 1];

  return (
    <div style={styles.chartWrapper}>
      <div style={styles.chartHeader}>
        <span style={styles.chartLabel}>{label}</span>
        <span style={{ ...styles.chartVal, color }}>{latestVal}{unit}</span>
      </div>

      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={styles.svg}>
        {/* Gradients */}
        <defs>
          <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid Lines */}
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.03)" />
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.03)" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.05)" />

        {/* Shaded Area */}
        {areaD && <path d={areaD} fill={`url(#grad-${label})`} />}

        {/* Stroke Line */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 2px 4px ${color}22)` }}
          />
        )}

        {/* Active Node Highlight */}
        {pointsCount > 0 && (
          <circle
            cx={getX(pointsCount - 1)}
            cy={getY(data[pointsCount - 1])}
            r="3.5"
            fill={color}
            stroke="#0c0f16"
            strokeWidth="1.2"
          />
        )}
      </svg>
    </div>
  );
}

const styles = {
  chartWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: 'rgba(5, 7, 12, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    padding: '12px',
    flex: 1,
    minWidth: '150px',
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  chartLabel: {
    fontSize: '9px',
    fontWeight: '800',
    color: '#6b7280',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  chartVal: {
    fontSize: '15px',
    fontWeight: '800',
    letterSpacing: '-0.02em',
  },
  svg: {
    display: 'block',
    overflow: 'visible',
  },
};
