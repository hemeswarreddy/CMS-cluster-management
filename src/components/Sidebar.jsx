import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  UploadCloud,
  Activity,
  HardDrive,
  Cloud,
  Layers,
  X,
  Radio,
} from 'lucide-react';
import { APP_CONFIG } from '../config/api';
import { formatFileSize } from '../utils/fileUtils';

export default function Sidebar({ isOpen, onClose, totalStorageBytes = 0, totalFiles = 0 }) {
  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={19} />,
      badge: null,
    },
    {
      to: '/files',
      label: 'Files',
      icon: <FolderOpen size={19} />,
      badge: totalFiles > 0 ? totalFiles : null,
    },
    {
      to: '/upload',
      label: 'Upload Files',
      icon: <UploadCloud size={19} />,
      badge: null,
    },
    {
      to: '/status',
      label: 'System Status',
      icon: <Activity size={19} />,
      badge: 'Live',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-logo-container">
            <div className="brand-logo-icon">
              <Cloud size={22} className="text-white" />
            </div>
            <div className="brand-text">
              <span className="brand-title">Content Management</span>
              <span className="brand-badge">AWS EFS Portal</span>
            </div>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">MAIN NAVIGATION</div>
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.to} className="nav-item">
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                  onClick={() => {
                    if (window.innerWidth < 1024 && onClose) onClose();
                  }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  {item.badge && (
                    <span className={`nav-pill ${item.badge === 'Live' ? 'pulse-pill' : ''}`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* EFS Storage Bar Widget */}
        <div className="sidebar-storage-widget">
          <div className="storage-widget-header">
            <div className="flex items-center gap-2">
              <HardDrive size={16} className="text-blue-400" />
              <span className="font-semibold text-xs text-slate-200">Shared EFS Storage</span>
            </div>
            <span className="text-xs text-slate-400">{formatFileSize(totalStorageBytes)}</span>
          </div>
          <div className="storage-progress-track">
            <div
              className="storage-progress-fill"
              style={{
                width: `${Math.min(100, Math.max(8, (totalStorageBytes / (1024 * 1024 * 50)) * 100))}%`,
              }}
            />
          </div>
          <div className="storage-widget-meta">
            <span>Elastic File System</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="status-dot-sm bg-emerald-400" /> Mounted
            </span>
          </div>
        </div>

        {/* Footer AWS Metadata */}
        <div className="sidebar-footer">
          <div className="cluster-meta-row">
            <div className="meta-item">
              <span className="meta-label">EFS Cluster:</span>
              <span className="meta-value text-emerald-400 font-mono text-xs flex items-center gap-1">
                <Radio size={12} className="animate-pulse" /> Connected
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">AWS Region:</span>
              <span className="meta-value font-mono text-xs text-slate-300">
                {APP_CONFIG.region}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Mount Target:</span>
              <span className="meta-value font-mono text-2xs text-slate-400 truncate" title={APP_CONFIG.efsMountPath}>
                {APP_CONFIG.efsMountPath}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
