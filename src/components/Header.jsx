import React from 'react';
import { Menu, RefreshCw, Upload, Cloud, HardDrive } from 'lucide-react';
import { Link } from 'react-router-dom';
import ServerBadge from './ServerBadge';
import { APP_CONFIG } from '../config/api';

export default function Header({
  title,
  subtitle,
  onToggleSidebar,
  onRefresh,
  isRefreshing,
  serverInfo,
  lastFetchedAt,
}) {
  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="header-mobile-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>

        <div className="header-title-wrapper">
          <h1 className="header-title">{title}</h1>
          <p className="header-subtitle">
            {subtitle || APP_CONFIG.appSubtitle}
          </p>
        </div>
      </div>

      <div className="header-right">
        {/* Active EC2 Server Badge */}
        <ServerBadge serverInfo={serverInfo} showDetails={false} />

        {/* EFS Mount status pill */}
        <div className="efs-status-pill hidden-mobile" title={`EFS ID: ${APP_CONFIG.efsId} mounted at ${APP_CONFIG.efsMountPath}`}>
          <HardDrive size={13} className="text-emerald-600" />
          <span className="text-xs font-semibold text-slate-700">EFS:</span>
          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <span className="status-dot-sm bg-emerald-500" />
            Connected
          </span>
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <button
            className={`btn btn-secondary btn-icon-only ${isRefreshing ? 'is-spinning' : ''}`}
            onClick={onRefresh}
            disabled={isRefreshing}
            title={lastFetchedAt ? `Last refreshed: ${lastFetchedAt.toLocaleTimeString()}` : 'Refresh file list from shared EFS'}
            aria-label="Refresh file list"
          >
            <RefreshCw size={16} />
          </button>
        )}

        {/* Quick Upload Button */}
        <Link to="/upload" className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-sm">
          <Upload size={15} />
          <span className="hidden-mobile">Upload Files</span>
        </Link>
      </div>
    </header>
  );
}
