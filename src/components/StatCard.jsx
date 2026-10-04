import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue',
  badgeText,
}) {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-header">
        <div className="stat-card-info">
          <span className="stat-card-title">{title}</span>
          <div className="stat-card-value">{value}</div>
        </div>
        <div className={`stat-card-icon-box bg-${color}-50 text-${color}-600`}>
          {icon}
        </div>
      </div>
      <div className="stat-card-footer">
        {subtitle && <span className="stat-card-subtitle">{subtitle}</span>}
        {badgeText && (
          <span className={`stat-badge stat-badge-${color}`}>
            {badgeText}
          </span>
        )}
        {trend && (
          <span className="stat-trend">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
