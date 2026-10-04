import React from 'react';
import { Server, Cpu, ShieldCheck } from 'lucide-react';

export default function ServerBadge({ serverInfo, showDetails = false }) {
  const isServer1 = serverInfo?.serverName?.includes('1') || serverInfo?.privateIp?.includes('41.246');
  const serverNumber = isServer1 ? '1' : '2';
  const instanceName = serverInfo?.serverName || `EC2 Instance ${serverNumber}`;
  const ip = serverInfo?.privateIp || (isServer1 ? '172.31.41.246' : '172.31.37.43');

  return (
    <div className="server-badge-container" title={`Handled by AWS EC2 Target: ${instanceName} (${ip})`}>
      <div className="server-indicator-dot" />
      <Server size={14} className="server-icon" />
      <div className="server-badge-text">
        <span className="server-badge-title">
          {instanceName}
        </span>
        <span className="server-badge-ip font-mono">
          {ip}
        </span>
      </div>
      {showDetails && (
        <span className="server-badge-tag">
          <ShieldCheck size={12} /> ALB Target
        </span>
      )}
    </div>
  );
}
