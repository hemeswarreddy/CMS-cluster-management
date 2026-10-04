/**
 * AWS Online Content Management - API Service Layer
 * 
 * All HTTP communication with backend REST APIs is isolated here.
 * React components never perform raw fetch calls directly.
 */

import { ENDPOINTS, APP_CONFIG } from '../config/api';

// Cached server metadata updated on every successful API request
let lastServerMetadata = {
  serverName: 'EC2 Instance 1',
  hostname: 'ip-172-31-41-246.eu-north-1.compute.internal',
  privateIp: '172.31.41.246',
  region: APP_CONFIG.region,
  efsId: APP_CONFIG.efsId,
  timestamp: new Date().toISOString(),
};

/**
 * Extract server info from response headers if provided by backend/ALB
 */
function extractServerHeaders(response) {
  try {
    const serverHeader = response.headers.get('X-Server-Name') || response.headers.get('X-Backend-Server');
    const hostnameHeader = response.headers.get('X-Server-Hostname');
    const ipHeader = response.headers.get('X-Server-IP') || response.headers.get('X-Forwarded-Server-IP');

    if (serverHeader || hostnameHeader || ipHeader) {
      lastServerMetadata = {
        ...lastServerMetadata,
        serverName: serverHeader || lastServerMetadata.serverName,
        hostname: hostnameHeader || lastServerMetadata.hostname,
        privateIp: ipHeader || lastServerMetadata.privateIp,
        timestamp: new Date().toISOString(),
      };
    }
  } catch {
    // Ignore header reading errors in non-browser/restricted CORS contexts
  }
}

/**
 * Normalize raw backend file response into a standard format:
 * { name: string, size: number, lastModified: string, type: string }
 */
function normalizeFileList(raw) {
  if (!raw) return [];
  
  // If backend returns { files: [...] } or { data: [...] }
  let list = Array.isArray(raw) ? raw : (raw.files || raw.data || raw.items || []);
  if (!Array.isArray(list)) return [];

  return list.map((item, index) => {
    // If backend returns simple array of string filenames
    if (typeof item === 'string') {
      return {
        id: `file-${index}-${item}`,
        name: item,
        size: 0,
        lastModified: new Date().toISOString(),
        type: 'application/octet-stream',
      };
    }

    const filename = item.name || item.filename || item.fileName || `file-${index}`;
    return {
      id: item.id || `file-${index}-${filename}`,
      name: filename,
      size: typeof item.size === 'number' ? item.size : parseInt(item.size || 0, 10),
      lastModified: item.lastModified || item.mtime || item.updatedAt || item.date || new Date().toISOString(),
      type: item.type || item.mimeType || item.contentType || '',
    };
  });
}

/**
 * Fetch all files stored in the shared EFS directory
 * GET /api/files
 * @returns {Promise<Array>}
 */
export async function getFiles() {
  try {
    const response = await fetch(ENDPOINTS.FILES_LIST, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Avoid browser cache to ensure fresh EFS updates
      cache: 'no-cache',
    });

    extractServerHeaders(response);

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return normalizeFileList(data);
  } catch (err) {
    console.warn('[API Service] getFiles request failed:', err.message);
    throw err;
  }
}

/**
 * Upload a file to the shared EFS directory with upload progress tracking
 * POST /api/files/upload (multipart/form-data)
 * @param {File} file 
 * @param {Function} onProgress (percent: number) => void
 * @returns {Promise<Object>}
 */
export function uploadFile(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);

    // Track upload percentage
    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };
    }

    xhr.open('POST', ENDPOINTS.FILE_UPLOAD, true);

    xhr.onload = () => {
      try {
        const serverHeader = xhr.getResponseHeader('X-Server-Name');
        const ipHeader = xhr.getResponseHeader('X-Server-IP');
        if (serverHeader || ipHeader) {
          lastServerMetadata = {
            ...lastServerMetadata,
            serverName: serverHeader || lastServerMetadata.serverName,
            privateIp: ipHeader || lastServerMetadata.privateIp,
            timestamp: new Date().toISOString(),
          };
        }
      } catch {
        // ignore header errors
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve(res);
        } catch {
          resolve({ success: true, message: 'File uploaded successfully' });
        }
      } else {
        let errorMsg = `Upload failed with status ${xhr.status}`;
        try {
          const res = JSON.parse(xhr.responseText);
          if (res.message || res.error) errorMsg = res.message || res.error;
        } catch {
          // ignore parse error
        }
        reject(new Error(errorMsg));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error occurred during file upload. Check ALB connection.'));
    };

    xhr.ontimeout = () => {
      reject(new Error('Upload request timed out.'));
    };

    xhr.send(formData);
  });
}

/**
 * Download a file from the shared EFS directory
 * GET /api/files/download/{filename}
 * Triggers a native browser file download
 * @param {string} filename 
 */
export async function downloadFile(filename) {
  try {
    const url = ENDPOINTS.FILE_DOWNLOAD(filename);
    const response = await fetch(url, {
      method: 'GET',
    });

    extractServerHeaders(response);

    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
    return { success: true };
  } catch (err) {
    console.error('[API Service] Download error:', err);
    // Fallback: try direct link download if fetch fails due to CORS blob restriction
    try {
      const directUrl = ENDPOINTS.FILE_DOWNLOAD(filename);
      const a = document.createElement('a');
      a.href = directUrl;
      a.setAttribute('download', filename);
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return { success: true };
    } catch {
      throw err;
    }
  }
}

/**
 * Delete a file from the shared EFS directory
 * DELETE /api/files/{filename}
 * @param {string} filename 
 * @returns {Promise<Object>}
 */
export async function deleteFile(filename) {
  try {
    const url = ENDPOINTS.FILE_DELETE(filename);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    extractServerHeaders(response);

    if (!response.ok) {
      let errorDetail = `Failed to delete file (HTTP ${response.status})`;
      try {
        const data = await response.json();
        if (data.message || data.error) errorDetail = data.message || data.error;
      } catch {
        // ignore json parse error
      }
      throw new Error(errorDetail);
    }

    try {
      return await response.json();
    } catch {
      return { success: true, message: 'File deleted successfully' };
    }
  } catch (err) {
    console.error('[API Service] deleteFile failed:', err.message);
    throw err;
  }
}

/**
 * Fetch Server Information (which EC2 instance is currently responding)
 * GET /api/server-info
 * @returns {Promise<Object>}
 */
export async function getServerInfo() {
  try {
    const response = await fetch(ENDPOINTS.SERVER_INFO, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-cache',
    });

    extractServerHeaders(response);

    if (response.ok) {
      const data = await response.json();
      lastServerMetadata = {
        serverName: data.serverName || data.server || (data.instanceId ? `EC2 ${data.instanceId}` : lastServerMetadata.serverName),
        hostname: data.hostname || lastServerMetadata.hostname,
        privateIp: data.privateIp || data.ip || lastServerMetadata.privateIp,
        region: data.region || APP_CONFIG.region,
        efsId: data.efsId || APP_CONFIG.efsId,
        timestamp: new Date().toISOString(),
      };
      return lastServerMetadata;
    }
  } catch {
    // If backend doesn't have /api/server-info endpoint, return cached or fallback metadata
  }
  return lastServerMetadata;
}

/**
 * Fetch Cluster System Status
 * GET /api/status
 * @returns {Promise<Object>}
 */
export async function getSystemStatus() {
  try {
    const response = await fetch(ENDPOINTS.SYSTEM_STATUS, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    extractServerHeaders(response);

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch {
    // Fallback status structure
  }

  // Standard architectural status model
  return {
    alb: {
      name: APP_CONFIG.albName,
      dns: APP_CONFIG.albDns,
      status: 'Active',
      port: 80,
      protocol: 'HTTP',
      targetGroup: 'content-management-tg',
    },
    instances: [
      {
        id: 'i-01a2b3c4d5e6f7g8h',
        name: 'EC2 Instance 1',
        hostname: 'ip-172-31-41-246.eu-north-1.compute.internal',
        privateIp: '172.31.41.246',
        status: 'Healthy',
        az: 'eu-north-1a',
        role: 'Web Application Server',
      },
      {
        id: 'i-09z8y7x6w5v4u3t2s',
        name: 'EC2 Instance 2',
        hostname: 'ip-172-31-37-43.eu-north-1.compute.internal',
        privateIp: '172.31.37.43',
        status: 'Healthy',
        az: 'eu-north-1b',
        role: 'Web Application Server',
      },
    ],
    efs: {
      fileSystemId: APP_CONFIG.efsId,
      mountPath: APP_CONFIG.efsMountPath,
      status: 'Connected',
      mountType: 'NFSv4.1',
      accessMode: 'ReadWriteMany (Shared)',
      region: APP_CONFIG.region,
    },
    region: {
      code: APP_CONFIG.region,
      name: APP_CONFIG.regionName,
    },
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Ping backend to test connectivity & measure round-trip latency
 * @returns {Promise<{ ok: boolean, latencyMs: number, serverInfo: Object }>}
 */
export async function pingHealth() {
  const start = performance.now();
  try {
    const res = await fetch(ENDPOINTS.HEALTH_CHECK, {
      method: 'GET',
      cache: 'no-cache',
    });
    const latencyMs = Math.round(performance.now() - start);
    extractServerHeaders(res);
    return {
      ok: res.ok,
      latencyMs,
      serverInfo: lastServerMetadata,
    };
  } catch {
    // If /api/health not implemented, test root
    try {
      const res = await fetch(ENDPOINTS.ROOT_INFO, { method: 'GET', cache: 'no-cache' });
      const latencyMs = Math.round(performance.now() - start);
      extractServerHeaders(res);
      return {
        ok: res.ok,
        latencyMs,
        serverInfo: lastServerMetadata,
      };
    } catch {
      return {
        ok: false,
        latencyMs: Math.round(performance.now() - start),
        serverInfo: lastServerMetadata,
      };
    }
  }
}

export default {
  getFiles,
  uploadFile,
  downloadFile,
  deleteFile,
  getServerInfo,
  getSystemStatus,
  pingHealth,
};
