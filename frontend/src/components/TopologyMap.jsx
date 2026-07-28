import React from 'react';
import { Server, Shield, Layers, Cpu, Laptop, Wifi } from 'lucide-react';

/**
 * Interactive SVG Network Topology Map.
 * Calculates spatial tree coordinates dynamically and animates data flows.
 *
 * @param {Array} devices list of network devices
 * @param {Object} selectedDevice currently selected device object
 * @param {Function} onSelectDevice callback to select a device
 */
export default function TopologyMap({ devices, selectedDevice, onSelectDevice }) {
  const width = 600;
  const height = 360;

  // Separate core infra nodes from leaf devices
  const router = devices.find(d => d.type === 'ROUTER');
  const firewall = devices.find(d => d.type === 'FIREWALL');
  const coreSwitch = devices.find(d => d.type === 'SWITCH');
  
  // Leaves are all other devices
  const leaves = devices.filter(d => 
    d.type !== 'ROUTER' && d.type !== 'FIREWALL' && d.type !== 'SWITCH'
  );

  // Position Coordinates
  const routerPos = { x: 300, y: 40 };
  const firewallPos = { x: 300, y: 110 };
  const switchPos = { x: 300, y: 180 };

  const getLeafPos = (index, total) => {
    if (total <= 1) return { x: 300, y: 280 };
    const spacing = 480 / (total - 1);
    const startX = 60;
    return {
      x: Math.round(startX + index * spacing),
      y: 280
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ONLINE': return 'var(--color-online)';
      case 'WARNING': return 'var(--color-warning)';
      case 'OFFLINE':
      default: return 'var(--color-critical)';
    }
  };

  // Helper to choose corresponding Lucide Icon
  const getIcon = (type) => {
    switch (type) {
      case 'ROUTER': return Cpu;
      case 'FIREWALL': return Shield;
      case 'SWITCH': return Layers;
      case 'WIRELESS_AP': return Wifi;
      case 'SERVER':
      default:
        return Server;
    }
  };

  // Render node element
  const renderNode = (device, pos) => {
    if (!device) return null;
    const isSelected = selectedDevice && selectedDevice.id === device.id;
    const color = getStatusColor(device.status);
    const IconComponent = getIcon(device.type);

    return (
      <g
        key={device.id}
        onClick={() => onSelectDevice(device)}
        style={{ cursor: 'pointer' }}
      >
        {/* Glow Ring if Selected */}
        {isSelected && (
          <circle
            cx={pos.x}
            cy={pos.y}
            r="26"
            fill="none"
            stroke={color}
            strokeWidth="2"
            style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          />
        )}

        {/* Backplate */}
        <circle
          cx={pos.x}
          cy={pos.y}
          r="20"
          fill="#0c0f16"
          stroke={isSelected ? color : 'rgba(255, 255, 255, 0.08)'}
          strokeWidth={isSelected ? '2' : '1'}
          style={{ transition: 'all 0.3s ease' }}
        />

        {/* Icon Render */}
        <g transform={`translate(${pos.x - 10}, ${pos.y - 10})`}>
          <IconComponent size={20} color={device.status === 'OFFLINE' ? '#4b5563' : color} />
        </g>

        {/* Small Status Glow dot */}
        <circle
          cx={pos.x + 12}
          cy={pos.y - 12}
          r="4"
          fill={color}
          stroke="#0c0f16"
          strokeWidth="1"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />

        {/* Label text */}
        <text
          x={pos.x}
          y={pos.y + 35}
          textAnchor="middle"
          fill="#ffffff"
          style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.02em' }}
        >
          {device.name}
        </text>

        <text
          x={pos.x}
          y={pos.y + 47}
          textAnchor="middle"
          fill="#6b7280"
          style={{ fontSize: '9px', fontFamily: 'monospace' }}
        >
          {device.ipAddress}
        </text>
      </g>
    );
  };

  // Render connection line
  const renderLink = (fromPos, toPos, childDevice) => {
    if (!childDevice) return null;
    const isOffline = childDevice.status === 'OFFLINE';
    const strokeColor = isOffline ? 'var(--color-critical)' : 'rgba(255, 255, 255, 0.06)';
    const strokeWidth = isOffline ? '1.5' : '1.2';
    
    return (
      <g key={`link-${childDevice.id}`}>
        {/* Underlay Base connection route */}
        <line
          x1={fromPos.x}
          y1={fromPos.y}
          x2={toPos.x}
          y2={toPos.y}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        
        {/* Pulsing overlay data flow (only when online/warning) */}
        {!isOffline && (
          <line
            x1={fromPos.x}
            y1={fromPos.y}
            x2={toPos.x}
            y2={toPos.y}
            stroke={getStatusColor(childDevice.status)}
            strokeWidth="1.5"
            strokeLinecap="round"
            className="pulse-path"
            style={{
              opacity: childDevice.status === 'WARNING' ? 0.5 : 0.8,
              filter: `drop-shadow(0 0 3px ${getStatusColor(childDevice.status)})`
            }}
          />
        )}
      </g>
    );
  };

  return (
    <div style={styles.wrapper}>
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={styles.svg}>
        {/* Connection Routes (Drawn behind nodes) */}
        {firewall && router && renderLink(routerPos, firewallPos, firewall)}
        {coreSwitch && firewall && renderLink(firewallPos, switchPos, coreSwitch)}
        
        {coreSwitch && leaves.map((leaf, index) => {
          const leafPos = getLeafPos(index, leaves.length);
          return renderLink(switchPos, leafPos, leaf);
        })}

        {/* Nodes (Drawn in front of links) */}
        {router && renderNode(router, routerPos)}
        {firewall && renderNode(firewall, firewallPos)}
        {coreSwitch && renderNode(coreSwitch, switchPos)}
        {leaves.map((leaf, index) => {
          const leafPos = getLeafPos(index, leaves.length);
          return renderNode(leaf, leafPos);
        })}
      </svg>
    </div>
  );
}

const styles = {
  wrapper: {
    width: '100%',
    height: '100%',
    minHeight: '340px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'radial-gradient(circle at center, rgba(15, 23, 42, 0.4) 0%, rgba(5, 7, 12, 0.6) 100%)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.02)',
    position: 'relative',
    userSelect: 'none',
  },
  svg: {
    display: 'block',
    maxHeight: '100%',
  },
};
