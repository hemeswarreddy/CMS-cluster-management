/**
 * AWS Content Management System - API & Environment Configuration
 * 
 * Centralized configuration for backend API endpoints, AWS metadata,
 * and application defaults.
 */

// Normalize API Base URL from environment variable:
// Strips trailing slashes and redundant '/api' suffixes so endpoints always resolve properly.
const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');

export const API_BASE_URL = rawBaseUrl.endsWith('/api')
  ? rawBaseUrl.slice(0, -4).replace(/\/+$/, '')
  : rawBaseUrl;

// Application Metadata
export const APP_CONFIG = {
  appName: 'Online Content Management',
  appSubtitle: 'Cloud-based file management powered by AWS EC2 + EFS',
  region: import.meta.env.VITE_AWS_REGION || 'eu-north-1',
  regionName: 'Europe (Stockholm)',
  efsId: import.meta.env.VITE_EFS_ID || 'fs-04d3bc3c56af5a861',
  efsMountPath: import.meta.env.VITE_EFS_MOUNT_PATH || '/var/www/html/files',
  albName: 'content-management-alb',
  albDns: 'content-management-alb-941224789.eu-north-1.elb.amazonaws.com',
  defaultPollingInterval: Number(import.meta.env.VITE_AUTO_REFRESH_INTERVAL) || 15000,
};

// API Endpoints Mapping
export const ENDPOINTS = {
  // File management
  FILES_LIST: `${API_BASE_URL}/api/files`,
  FILE_UPLOAD: `${API_BASE_URL}/api/files/upload`,
  FILE_DOWNLOAD: (filename) => `${API_BASE_URL}/api/files/download/${encodeURIComponent(filename)}`,
  FILE_DELETE: (filename) => `${API_BASE_URL}/api/files/${encodeURIComponent(filename)}`,
  
  // Server & Health status
  SERVER_INFO: `${API_BASE_URL}/api/server-info`,
  SYSTEM_STATUS: `${API_BASE_URL}/api/system-status`,
  HEALTH_CHECK: `${API_BASE_URL}/api/health`,
  
  // Fallback endpoint
  ROOT_INFO: `${API_BASE_URL}/api/server-info`,
};

export default {
  API_BASE_URL,
  APP_CONFIG,
  ENDPOINTS,
};
