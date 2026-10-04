import React from 'react';
import {
  Server,
  Cloud,
  HardDrive,
  Activity,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

export default function StatusCard({
  title,
  subtitle,
  type = 'ec2', // 'alb' | 'ec2' | 'efs' | 'region'
  status = 'Healthy', // 'Healthy' | 'Active' | 'Connected' | 'Degraded'
  details = [],
  highlight = false,
}) {
  const isHealthy = status === 'Healthy' || status === 'Active' || status === 'Connected';

  const renderIcon = () => {
    switch (type) {
      case 'alb':
        return <Cloud size={22} className="text-blue-600" />;
      case 'efs':
        return <HardDrive size={22} className="text-purple-600" />;
      case 'ec2':
        return <Server size={22} className="text-indigo-600" />;
      case 'region':
        return <Activity size={22} className="text-emerald-600" />;
      default:
        return <Server size={22} className="text-slate-600" />;
    }
  };

  return (
    <div className={`status-node-card ${highlight ? 'is-highlighted' : ''}`}>
      <div className="status-node-header">
        <div className="flex items-center gap-3">
          <div className="status-node-icon-wrapper">
            {renderIcon()}
          </div>
          <div>
            <h3 className="status-node-title">{title}</h3>
            {subtitle && <p className="status-node-subtitle">{subtitle}</p>}
          </div>
        </div>

        <div className={`status-pill-badge ${isHealthy ? 'badge-healthy' : 'badge-warning'}`}>
          {isHealthy ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
          <span>{status}</span>
        </div>
      </div>

      <div className="status-node-body">
        <dl className="status-details-grid">
          {details.map((item, idx) => (
            <div key={idx} className="status-detail-item">
              <dt className="status-detail-label">{item.label}</dt>
              <dd
                className={`status-detail-val ${item.isCode ? 'font-mono' : ''}`}
                title={item.tooltip || item.value}
              >
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
